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
$newPassword = internalRequiredString($payload, 'newPassword', 255);
$targetEmail = array_key_exists('email', $payload)
    ? mb_strtolower(internalRequiredString($payload, 'email', 190))
    : null;
$currentPassword = array_key_exists('currentPassword', $payload)
    ? internalRequiredString($payload, 'currentPassword', 255)
    : null;

if (mb_strlen($newPassword) < 8) {
    internalRespond(422, ['ok' => false, 'error' => 'validation_error', 'field' => 'newPassword']);
}

if ($targetEmail !== null && !filter_var($targetEmail, FILTER_VALIDATE_EMAIL)) {
    internalRespond(422, ['ok' => false, 'error' => 'validation_error', 'field' => 'email']);
}

try {
    $pdo = internalConnectDatabase($config['database']);
    $access = internalRequireAccess($pdo, $security);

    if ($access['mode'] === 'session') {
        if ($currentPassword === null) {
            internalRespond(422, ['ok' => false, 'error' => 'validation_error', 'field' => 'currentPassword']);
        }

        $query = $pdo->prepare(
            'SELECT id, email, password_hash
             FROM admin_users
             WHERE id = :id
             LIMIT 1'
        );
        $query->execute(['id' => $access['session']['adminUserId']]);
        $user = $query->fetch();

        if (!is_array($user) || !password_verify($currentPassword, (string) $user['password_hash'])) {
            internalRespond(401, ['ok' => false, 'error' => 'invalid_credentials']);
        }

        $update = $pdo->prepare(
            'UPDATE admin_users
             SET password_hash = :password_hash,
                 updated_at = UTC_TIMESTAMP()
             WHERE id = :id'
        );
        $update->execute([
            'password_hash' => password_hash($newPassword, PASSWORD_DEFAULT),
            'id' => $user['id'],
        ]);

        internalRespond(200, [
            'ok' => true,
            'email' => $user['email'],
            'scope' => 'self',
        ]);
    }

    if ($targetEmail === null) {
        internalRespond(422, ['ok' => false, 'error' => 'validation_error', 'field' => 'email']);
    }

    $update = $pdo->prepare(
        'UPDATE admin_users
         SET password_hash = :password_hash,
             updated_at = UTC_TIMESTAMP()
         WHERE email = :email
           AND is_active = 1'
    );
    $update->execute([
        'password_hash' => password_hash($newPassword, PASSWORD_DEFAULT),
        'email' => $targetEmail,
    ]);

    if ($update->rowCount() < 1) {
        internalRespond(404, ['ok' => false, 'error' => 'admin_user_not_found']);
    }

    internalRespond(200, [
        'ok' => true,
        'email' => $targetEmail,
        'scope' => 'reset',
    ]);
} catch (Throwable $error) {
    error_log('Modo internal API: falha ao alterar senha. ' . $error->getMessage());
    internalRespond(500, ['ok' => false, 'error' => 'internal_error']);
}
