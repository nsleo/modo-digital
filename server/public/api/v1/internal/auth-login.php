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
$email = mb_strtolower(internalRequiredString($payload, 'email', 190));
$password = internalRequiredString($payload, 'password', 255);

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    internalRespond(422, ['ok' => false, 'error' => 'validation_error', 'field' => 'email']);
}

try {
    $pdo = internalConnectDatabase($config['database']);

    $query = $pdo->prepare(
        'SELECT id, email, password_hash, name, is_active
         FROM admin_users
         WHERE email = :email
         LIMIT 1'
    );
    $query->execute(['email' => $email]);
    $user = $query->fetch();

    if (!is_array($user) || (int) ($user['is_active'] ?? 0) !== 1 || !password_verify($password, (string) $user['password_hash'])) {
        internalRespond(401, ['ok' => false, 'error' => 'invalid_credentials']);
    }

    $session = internalIssueAdminSession($pdo, (int) $user['id']);

    $updateUser = $pdo->prepare(
        'UPDATE admin_users
         SET last_login_at = UTC_TIMESTAMP(),
             updated_at = UTC_TIMESTAMP()
         WHERE id = :id'
    );
    $updateUser->execute(['id' => $user['id']]);

    internalRespond(200, [
        'ok' => true,
        'token' => $session['token'],
        'sessionId' => $session['publicId'],
        'expiresAt' => $session['expiresAt'],
        'user' => [
            'id' => (int) $user['id'],
            'email' => $user['email'],
            'name' => $user['name'],
        ],
    ]);
} catch (Throwable $error) {
    error_log('Modo internal API: falha no login interno. ' . $error->getMessage());
    internalRespond(500, ['ok' => false, 'error' => 'internal_error']);
}
