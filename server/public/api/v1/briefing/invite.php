<?php

declare(strict_types=1);

require __DIR__ . DIRECTORY_SEPARATOR . '_bootstrap.php';

$config = briefingLoadConfig();
$security = $config['security'];
briefingConfigureCors(is_array($security['allowed_origins'] ?? null) ? $security['allowed_origins'] : []);

$method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($method !== 'GET') {
    header('Allow: GET, OPTIONS');
    briefingRespond(405, ['ok' => false, 'error' => 'method_not_allowed']);
}

$invitePublicId = trim((string) ($_GET['invite'] ?? ''));
$token = trim((string) ($_GET['token'] ?? ''));

if ($invitePublicId === '' || $token === '') {
    briefingRespond(422, ['ok' => false, 'error' => 'validation_error']);
}

try {
    $pdo = briefingConnectDatabase($config['database']);
    $invite = briefingFetchInvite($pdo, $invitePublicId, $token);

    $touch = $pdo->prepare('UPDATE briefing_invites SET last_opened_at = UTC_TIMESTAMP() WHERE id = :id');
    $touch->execute(['id' => $invite['id']]);

    $response = null;
    if (($invite['project_briefing_id'] ?? null) !== null) {
        $response = briefingFetchLatestStructuredSubmission($pdo, (int) $invite['project_briefing_id']);
    }

    if ($response === null) {
        $responseQuery = $pdo->prepare('SELECT public_id, payload_json, submitted_at FROM briefing_responses WHERE invite_id = :invite_id LIMIT 1');
        $responseQuery->execute(['invite_id' => $invite['id']]);
        $legacyResponse = $responseQuery->fetch();

        if (is_array($legacyResponse)) {
            $response = [
                'publicId' => $legacyResponse['public_id'],
                'payload' => json_decode((string) $legacyResponse['payload_json'], true),
                'submittedAt' => $legacyResponse['submitted_at'],
            ];
        }
    }

    $template = null;
    if (($invite['template_id'] ?? null) !== null) {
        $template = briefingFetchTemplate($pdo, (int) $invite['template_id']);
    }

    briefingRespond(200, [
        'ok' => true,
        'invite' => [
            'publicId' => $invite['public_id'],
            'title' => $invite['title'],
            'introMessage' => $invite['intro_message'],
            'companyName' => $invite['company_name'],
            'contactName' => $invite['primary_contact_name'],
            'contactEmail' => $invite['primary_contact_email'],
            'projectLabel' => $invite['project_label'],
            'status' => $invite['status'],
            'completedAt' => $invite['completed_at'],
        ],
        'template' => $template,
        'response' => $response,
    ]);
} catch (Throwable $error) {
    error_log('Modo briefing API: falha ao carregar convite. ' . $error->getMessage());
    briefingRespond(500, ['ok' => false, 'error' => 'internal_error']);
}
