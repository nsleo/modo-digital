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
$projectStatus = array_key_exists('projectStatus', $payload)
    ? internalValidateProjectStatus(internalRequiredString($payload, 'projectStatus', 32))
    : null;
$briefingStatus = array_key_exists('briefingStatus', $payload)
    ? internalValidateBriefingStatus(internalRequiredString($payload, 'briefingStatus', 32))
    : null;

if (!preg_match('/^[0-9a-f-]{36}$/i', $projectPublicId)) {
    internalRespond(422, ['ok' => false, 'error' => 'validation_error', 'field' => 'projectId']);
}

if ($projectStatus === null && $briefingStatus === null) {
    internalRespond(422, ['ok' => false, 'error' => 'validation_error', 'field' => 'projectStatus']);
}

try {
    $pdo = internalConnectDatabase($config['database']);
    internalRequireAccess($pdo, $security);

    $projectQuery = $pdo->prepare(
        'SELECT
            p.id,
            p.public_id,
            p.status AS project_status,
            pb.id AS briefing_id,
            pb.status AS briefing_status
         FROM projects p
         LEFT JOIN project_briefings pb ON pb.project_id = p.id
         WHERE p.public_id = :public_id
         LIMIT 1'
    );
    $projectQuery->execute(['public_id' => $projectPublicId]);
    $project = $projectQuery->fetch();

    if (!is_array($project)) {
        internalRespond(404, ['ok' => false, 'error' => 'project_not_found']);
    }

    $pdo->beginTransaction();

    if ($projectStatus !== null && $projectStatus !== $project['project_status']) {
        $updateProject = $pdo->prepare(
            'UPDATE projects
             SET status = :status,
                 updated_at = UTC_TIMESTAMP()
             WHERE id = :id'
        );
        $updateProject->execute([
            'status' => $projectStatus,
            'id' => (int) $project['id'],
        ]);
    }

    if ($briefingStatus !== null) {
        if ($project['briefing_id'] === null) {
            $pdo->rollBack();
            internalRespond(409, ['ok' => false, 'error' => 'briefing_not_found']);
        }

        if ($briefingStatus !== $project['briefing_status']) {
            $updateBriefing = $pdo->prepare(
                'UPDATE project_briefings
                 SET status = :status,
                     completed_at = CASE
                        WHEN :status = "reviewed" AND completed_at IS NULL THEN UTC_TIMESTAMP()
                        WHEN :status <> "reviewed" THEN NULL
                        ELSE completed_at
                     END,
                     updated_at = UTC_TIMESTAMP()
                 WHERE id = :id'
            );
            $updateBriefing->execute([
                'status' => $briefingStatus,
                'id' => (int) $project['briefing_id'],
            ]);
        }
    }

    $pdo->commit();

    internalRespond(200, [
        'ok' => true,
        'projectId' => $project['public_id'],
        'projectStatus' => $projectStatus ?? $project['project_status'],
        'briefingStatus' => $briefingStatus ?? $project['briefing_status'],
    ]);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log('Modo internal API: falha ao atualizar governanca do projeto. ' . $error->getMessage());
    internalRespond(500, ['ok' => false, 'error' => 'internal_error']);
}
