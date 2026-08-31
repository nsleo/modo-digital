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

try {
    $pdo = internalConnectDatabase($config['database']);
    $access = internalRequireAccess($pdo, $security);

    if ($access['mode'] === 'session') {
        $token = internalReadBearerToken();
        if ($token !== null) {
            internalRevokeCurrentSession($pdo, $token);
        }
    }

    internalRespond(200, [
        'ok' => true,
        'revoked' => $access['mode'] === 'session',
    ]);
} catch (Throwable $error) {
    error_log('Modo internal API: falha ao encerrar sessao interna. ' . $error->getMessage());
    internalRespond(500, ['ok' => false, 'error' => 'internal_error']);
}
