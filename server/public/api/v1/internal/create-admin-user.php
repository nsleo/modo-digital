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

internalRequireAdminKey($security);

$payload = internalReadJsonBody();
$name = internalRequiredString($payload, 'name', 120);
$email = mb_strtolower(internalRequiredString($payload, 'email', 190));
$password = internalRequiredString($payload, 'password', 255);

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    internalRespond(422, ['ok' => false, 'error' => 'validation_error', 'field' => 'email']);
}

if (mb_strlen($password) < 8) {
    internalRespond(422, ['ok' => false, 'error' => 'validation_error', 'field' => 'password']);
}

try {
    $pdo = internalConnectDatabase($config['database']);

    $insert = $pdo->prepare(
        'INSERT INTO admin_users (
            email, password_hash, name, is_active
        ) VALUES (
            :email, :password_hash, :name, 1
        )'
    );
    $insert->execute([
        'email' => $email,
        'password_hash' => password_hash($password, PASSWORD_DEFAULT),
        'name' => $name,
    ]);

    internalRespond(201, [
        'ok' => true,
        'adminUserId' => (int) $pdo->lastInsertId(),
        'email' => $email,
        'name' => $name,
    ]);
} catch (Throwable $error) {
    if ($error instanceof PDOException && str_contains((string) $error->getMessage(), 'admin_users_email_unique')) {
        internalRespond(409, ['ok' => false, 'error' => 'admin_user_already_exists']);
    }

    error_log('Modo internal API: falha ao criar admin user. ' . $error->getMessage());
    internalRespond(500, ['ok' => false, 'error' => 'internal_error']);
}
