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

if ($method !== 'GET') {
    header('Allow: GET, OPTIONS');
    internalRespond(405, ['ok' => false, 'error' => 'method_not_allowed']);
}

try {
    $pdo = internalConnectDatabase($config['database']);
    $access = internalRequireAccess($pdo, $security);

    internalRespond(200, [
        'ok' => true,
        'mode' => $access['mode'],
        'user' => $access['session'] !== null ? [
            'id' => $access['session']['adminUserId'],
            'email' => $access['session']['email'],
            'name' => $access['session']['name'],
            'expiresAt' => $access['session']['expiresAt'],
        ] : null,
    ]);
} catch (Throwable $error) {
    error_log('Modo internal API: falha ao consultar sessao interna. ' . $error->getMessage());
    internalRespond(500, ['ok' => false, 'error' => 'internal_error']);
}
