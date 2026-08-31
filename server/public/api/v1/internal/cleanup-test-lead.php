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
$leadPublicId = internalRequiredString($payload, 'leadId', 36);

if (!preg_match('/^[0-9a-f-]{36}$/i', $leadPublicId)) {
    internalRespond(422, ['ok' => false, 'error' => 'validation_error', 'field' => 'leadId']);
}

try {
    $pdo = internalConnectDatabase($config['database']);
    internalRequireAccess($pdo, $security);
    $pdo->beginTransaction();

    $leadQuery = $pdo->prepare(
        'SELECT id, public_id, source, converted_to_client_id
         FROM leads
         WHERE public_id = :public_id
         LIMIT 1
         FOR UPDATE'
    );
    $leadQuery->execute(['public_id' => $leadPublicId]);
    $lead = $leadQuery->fetch();

    if (!is_array($lead)) {
        internalRespond(404, ['ok' => false, 'error' => 'lead_not_found']);
    }

    if (($lead['source'] ?? null) !== 'internal_e2e_test') {
        internalRespond(409, ['ok' => false, 'error' => 'lead_not_cleanup_allowed']);
    }

    $leadId = (int) $lead['id'];
    $clientId = $lead['converted_to_client_id'] !== null ? (int) $lead['converted_to_client_id'] : null;

    $deleteSubmissionAnswers = $pdo->prepare(
        'DELETE bsa
         FROM briefing_submission_answers bsa
         INNER JOIN briefing_submissions bs ON bs.id = bsa.submission_id
         INNER JOIN projects p ON p.id = bs.project_id
         WHERE p.source_lead_id = :lead_id'
    );
    $deleteSubmissionAnswers->execute(['lead_id' => $leadId]);

    $deleteSubmissions = $pdo->prepare(
        'DELETE bs
         FROM briefing_submissions bs
         INNER JOIN projects p ON p.id = bs.project_id
         WHERE p.source_lead_id = :lead_id'
    );
    $deleteSubmissions->execute(['lead_id' => $leadId]);

    $deleteBriefings = $pdo->prepare(
        'DELETE pb
         FROM project_briefings pb
         INNER JOIN projects p ON p.id = pb.project_id
         WHERE p.source_lead_id = :lead_id'
    );
    $deleteBriefings->execute(['lead_id' => $leadId]);

    $deleteProjects = $pdo->prepare(
        'DELETE FROM projects
         WHERE source_lead_id = :lead_id'
    );
    $deleteProjects->execute(['lead_id' => $leadId]);

    if ($clientId !== null) {
        $deleteContacts = $pdo->prepare(
            'DELETE FROM client_contacts
             WHERE client_id = :client_id'
        );
        $deleteContacts->execute(['client_id' => $clientId]);

        $clearLeadClient = $pdo->prepare(
            'UPDATE leads
             SET converted_to_client_id = NULL
             WHERE id = :id'
        );
        $clearLeadClient->execute(['id' => $leadId]);

        $deleteClient = $pdo->prepare(
            'DELETE FROM clients
             WHERE id = :client_id'
        );
        $deleteClient->execute(['client_id' => $clientId]);
    }

    $deleteLead = $pdo->prepare(
        'DELETE FROM leads
         WHERE id = :id
           AND source = :source'
    );
    $deleteLead->execute([
        'id' => $leadId,
        'source' => 'internal_e2e_test',
    ]);

    $pdo->commit();

    internalRespond(200, [
        'ok' => true,
        'leadId' => $leadPublicId,
        'deleted' => true,
    ]);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log('Modo internal API: falha ao limpar lead de teste. ' . $error->getMessage());
    internalRespond(500, ['ok' => false, 'error' => 'internal_error']);
}
