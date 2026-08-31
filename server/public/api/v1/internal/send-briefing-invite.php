<?php

declare(strict_types=1);

require __DIR__ . DIRECTORY_SEPARATOR . '_bootstrap.php';

$config = internalLoadConfig();
$security = $config['security'];
internalConfigureCors(is_array($security['allowed_origins'] ?? null) ? $security['allowed_origins'] : []);

$method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($method !== 'POST') {
    header('Allow: POST, OPTIONS');
    internalRespond(405, ['ok' => false, 'error' => 'method_not_allowed']);
}

$payload = internalReadJsonBody();
$projectPublicId = internalRequiredString($payload, 'projectId', 36);

if (!preg_match('/^[0-9a-f-]{36}$/i', $projectPublicId)) {
    internalRespond(422, ['ok' => false, 'error' => 'validation_error', 'field' => 'projectId']);
}

try {
    $pdo = internalConnectDatabase($config['database']);
    internalRequireAccess($pdo, $security);

    $pdo->beginTransaction();

    $query = $pdo->prepare(
        'SELECT
            p.id AS project_id,
            p.public_id AS project_public_id,
            p.name AS project_name,
            c.id AS client_id,
            c.company_name,
            c.primary_contact_name,
            pb.id AS project_briefing_id,
            pb.public_id AS project_briefing_public_id,
            pb.title AS project_briefing_title
         FROM projects p
         INNER JOIN clients c ON c.id = p.client_id
         LEFT JOIN project_briefings pb ON pb.project_id = p.id
         WHERE p.public_id = :public_id
         LIMIT 1
         FOR UPDATE'
    );
    $query->execute(['public_id' => $projectPublicId]);
    $project = $query->fetch();

    if (!is_array($project)) {
        $pdo->rollBack();
        internalRespond(404, ['ok' => false, 'error' => 'project_not_found']);
    }

    if (($project['project_briefing_id'] ?? null) === null) {
        $pdo->rollBack();
        internalRespond(409, ['ok' => false, 'error' => 'briefing_not_found']);
    }

    $revoke = $pdo->prepare(
        'UPDATE briefing_invites
         SET status = :status,
             updated_at = UTC_TIMESTAMP()
         WHERE project_briefing_id = :project_briefing_id
           AND status = :current_status'
    );
    $revoke->execute([
        'status' => 'revoked',
        'project_briefing_id' => (int) $project['project_briefing_id'],
        'current_status' => 'active',
    ]);

    $invitePublicId = internalUuidV4();
    $rawToken = bin2hex(random_bytes(16));
    $invitePath = sprintf('/briefing?invite=%s&token=%s', $invitePublicId, $rawToken);
    $title = trim((string) ($project['project_briefing_title'] ?? '')) !== ''
        ? (string) $project['project_briefing_title']
        : 'Briefing inicial - ' . (string) $project['project_name'];
    $contactName = trim((string) ($project['primary_contact_name'] ?? ''));
    $introMessage = $contactName !== ''
        ? 'Olá, ' . $contactName . '. Responde o que já estiver claro hoje. O restante a gente organiza junto.'
        : 'Responde o que já estiver claro hoje. O restante a gente organiza junto.';

    $insert = $pdo->prepare(
        'INSERT INTO briefing_invites (
            public_id, client_id, project_briefing_id, token_hash, title, intro_message, status
         ) VALUES (
            :public_id, :client_id, :project_briefing_id, :token_hash, :title, :intro_message, :status
         )'
    );
    $insert->execute([
        'public_id' => $invitePublicId,
        'client_id' => (int) $project['client_id'],
        'project_briefing_id' => (int) $project['project_briefing_id'],
        'token_hash' => internalHashToken($rawToken),
        'title' => $title,
        'intro_message' => $introMessage,
        'status' => 'active',
    ]);

    $updateBriefing = $pdo->prepare(
        'UPDATE project_briefings
         SET status = :status,
             last_sent_at = UTC_TIMESTAMP(),
             updated_at = UTC_TIMESTAMP()
         WHERE id = :id'
    );
    $updateBriefing->execute([
        'status' => 'sent',
        'id' => (int) $project['project_briefing_id'],
    ]);

    $pdo->commit();

    internalRespond(201, [
        'ok' => true,
        'projectId' => $project['project_public_id'],
        'briefingId' => $project['project_briefing_public_id'],
        'inviteId' => $invitePublicId,
        'token' => $rawToken,
        'invitePath' => $invitePath,
        'lastSentAt' => gmdate('Y-m-d H:i:s'),
    ]);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log('Modo internal API: falha ao gerar convite de briefing. ' . $error->getMessage());
    internalRespond(500, ['ok' => false, 'error' => 'internal_error']);
}
