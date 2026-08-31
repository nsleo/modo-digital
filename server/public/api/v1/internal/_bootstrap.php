<?php

declare(strict_types=1);

const INTERNAL_MAX_REQUEST_BYTES = 65536;
const INTERNAL_SESSION_TTL_SECONDS = 604800;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');

function internalRespond(int $status, array $payload): never
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function internalLoadConfig(): array
{
    $customPath = getenv('MODO_PRIVATE_CONFIG');
    $documentRoot = rtrim((string) ($_SERVER['DOCUMENT_ROOT'] ?? ''), DIRECTORY_SEPARATOR);
    $defaultPath = dirname($documentRoot) . DIRECTORY_SEPARATOR . 'modo-private' . DIRECTORY_SEPARATOR . 'database.php';
    $configPath = is_string($customPath) && $customPath !== '' ? $customPath : $defaultPath;

    if (!is_file($configPath)) {
        error_log('Modo internal API: arquivo privado de configuracao nao encontrado.');
        internalRespond(503, ['ok' => false, 'error' => 'service_unavailable']);
    }

    $config = require $configPath;

    if (!is_array($config) || !isset($config['database'], $config['security'])) {
        error_log('Modo internal API: configuracao privada invalida.');
        internalRespond(503, ['ok' => false, 'error' => 'service_unavailable']);
    }

    return $config;
}

function internalConfigureCors(array $allowedOrigins): void
{
    $origin = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');

    if ($origin !== '' && !in_array($origin, $allowedOrigins, true)) {
        internalRespond(403, ['ok' => false, 'error' => 'origin_not_allowed']);
    }

    if ($origin !== '') {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, X-MODO-ADMIN-KEY');
        header('Access-Control-Max-Age: 600');
    }
}

function internalConnectDatabase(array $database): PDO
{
    foreach (['host', 'port', 'name', 'user', 'password'] as $key) {
        if (!array_key_exists($key, $database) || $database[$key] === '') {
            throw new RuntimeException('Database configuration is incomplete.');
        }
    }

    $dsn = sprintf(
        'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
        $database['host'],
        (int) $database['port'],
        $database['name']
    );

    return new PDO($dsn, $database['user'], $database['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
}

function internalReadJsonBody(): array
{
    $contentLength = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($contentLength > INTERNAL_MAX_REQUEST_BYTES) {
        internalRespond(413, ['ok' => false, 'error' => 'payload_too_large']);
    }

    $rawBody = file_get_contents('php://input');
    if (!is_string($rawBody) || $rawBody === '' || strlen($rawBody) > INTERNAL_MAX_REQUEST_BYTES) {
        internalRespond(400, ['ok' => false, 'error' => 'invalid_payload']);
    }

    try {
        $payload = json_decode($rawBody, true, 64, JSON_THROW_ON_ERROR);
    } catch (JsonException) {
        internalRespond(400, ['ok' => false, 'error' => 'invalid_json']);
    }

    if (!is_array($payload)) {
        internalRespond(400, ['ok' => false, 'error' => 'invalid_payload']);
    }

    return $payload;
}

function internalRequiredString(array $payload, string $key, int $maxLength): string
{
    $value = trim((string) ($payload[$key] ?? ''));

    if ($value === '' || mb_strlen($value) > $maxLength) {
        internalRespond(422, ['ok' => false, 'error' => 'validation_error', 'field' => $key]);
    }

    return $value;
}

function internalOptionalString(array $payload, string $key, int $maxLength): ?string
{
    $value = trim((string) ($payload[$key] ?? ''));

    if ($value === '') {
        return null;
    }

    if (mb_strlen($value) > $maxLength) {
        internalRespond(422, ['ok' => false, 'error' => 'validation_error', 'field' => $key]);
    }

    return $value;
}

function internalOptionalBool(array $payload, string $key, bool $default = false): bool
{
    if (!array_key_exists($key, $payload)) {
        return $default;
    }

    if (!is_bool($payload[$key])) {
        internalRespond(422, ['ok' => false, 'error' => 'validation_error', 'field' => $key]);
    }

    return $payload[$key];
}

function internalOptionalNullableInt(array $payload, string $key): mixed
{
    if (!array_key_exists($key, $payload)) {
        return null;
    }

    $value = $payload[$key];
    if ($value === null) {
        return null;
    }

    if (is_int($value) && $value > 0) {
        return $value;
    }

    if (is_string($value) && preg_match('/^[1-9][0-9]*$/', $value) === 1) {
        return (int) $value;
    }

    internalRespond(422, ['ok' => false, 'error' => 'validation_error', 'field' => $key]);
}

function internalUuidV4(): string
{
    $bytes = random_bytes(16);
    $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40);
    $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80);

    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($bytes), 4));
}

function internalRequireAdminKey(array $security): void
{
    $expected = trim((string) ($security['internal_admin_key'] ?? ''));
    if ($expected === '') {
        error_log('Modo internal API: internal_admin_key ausente.');
        internalRespond(503, ['ok' => false, 'error' => 'service_unavailable']);
    }

    $provided = trim((string) ($_SERVER['HTTP_X_MODO_ADMIN_KEY'] ?? ''));
    if ($provided === '' || !hash_equals($expected, $provided)) {
        internalRespond(401, ['ok' => false, 'error' => 'unauthorized']);
    }
}

function internalHashToken(string $token): string
{
    return hash('sha256', $token);
}

function internalReadBearerToken(): ?string
{
    $header = trim((string) ($_SERVER['HTTP_AUTHORIZATION'] ?? ''));
    if ($header === '' || stripos($header, 'Bearer ') !== 0) {
        return null;
    }

    $token = trim(substr($header, 7));
    return $token !== '' ? $token : null;
}

function internalIssueAdminSession(PDO $pdo, int $adminUserId): array
{
    $token = bin2hex(random_bytes(32));
    $sessionPublicId = internalUuidV4();
    $expiresAt = gmdate('Y-m-d H:i:s', time() + INTERNAL_SESSION_TTL_SECONDS);

    $query = $pdo->prepare(
        'INSERT INTO admin_user_sessions (
            public_id, admin_user_id, token_hash, user_agent, last_used_at, expires_at
        ) VALUES (
            :public_id, :admin_user_id, :token_hash, :user_agent, UTC_TIMESTAMP(), :expires_at
        )'
    );
    $query->execute([
        'public_id' => $sessionPublicId,
        'admin_user_id' => $adminUserId,
        'token_hash' => internalHashToken($token),
        'user_agent' => trim((string) ($_SERVER['HTTP_USER_AGENT'] ?? '')) ?: null,
        'expires_at' => $expiresAt,
    ]);

    return [
        'token' => $token,
        'publicId' => $sessionPublicId,
        'expiresAt' => $expiresAt,
    ];
}

function internalFindAdminSession(PDO $pdo, string $token): ?array
{
    $query = $pdo->prepare(
        'SELECT
            s.id AS session_id,
            s.public_id AS session_public_id,
            s.admin_user_id,
            s.expires_at,
            u.email,
            u.name,
            u.is_active
         FROM admin_user_sessions s
         INNER JOIN admin_users u ON u.id = s.admin_user_id
         WHERE s.token_hash = :token_hash
           AND s.expires_at > UTC_TIMESTAMP()
         LIMIT 1'
    );
    $query->execute([
        'token_hash' => internalHashToken($token),
    ]);
    $session = $query->fetch();

    if (!is_array($session) || (int) ($session['is_active'] ?? 0) !== 1) {
        return null;
    }

    $touch = $pdo->prepare(
        'UPDATE admin_user_sessions
         SET last_used_at = UTC_TIMESTAMP(),
             updated_at = UTC_TIMESTAMP()
         WHERE id = :id'
    );
    $touch->execute(['id' => $session['session_id']]);

    return [
        'sessionId' => (int) $session['session_id'],
        'sessionPublicId' => $session['session_public_id'],
        'adminUserId' => (int) $session['admin_user_id'],
        'email' => $session['email'],
        'name' => $session['name'],
        'expiresAt' => $session['expires_at'],
    ];
}

function internalRequireAccess(PDO $pdo, array $security): array
{
    $bearerToken = internalReadBearerToken();
    if ($bearerToken !== null) {
        $session = internalFindAdminSession($pdo, $bearerToken);
        if ($session !== null) {
            return [
                'mode' => 'session',
                'session' => $session,
            ];
        }
    }

    internalRequireAdminKey($security);

    return [
        'mode' => 'master_key',
        'session' => null,
    ];
}

function internalRevokeCurrentSession(PDO $pdo, string $token): void
{
    $query = $pdo->prepare(
        'DELETE FROM admin_user_sessions
         WHERE token_hash = :token_hash'
    );
    $query->execute([
        'token_hash' => internalHashToken($token),
    ]);
}

function internalValidateProjectType(string $value): string
{
    $allowed = [
        'institutional_site',
        'landing_page',
        'ecommerce',
        'catalog',
        'link_in_bio',
        'website_redesign',
        'other',
    ];

    if (!in_array($value, $allowed, true)) {
        internalRespond(422, ['ok' => false, 'error' => 'validation_error', 'field' => 'projectType']);
    }

    return $value;
}

function internalValidateLeadPipelineStage(string $value, bool $allowWon = false): string
{
    $allowed = [
        'incoming',
        'qualified',
        'proposal_sent',
        'lost',
        'archived',
    ];

    if ($allowWon) {
        $allowed[] = 'won';
    }

    if (!in_array($value, $allowed, true)) {
        internalRespond(422, ['ok' => false, 'error' => 'validation_error', 'field' => 'pipelineStage']);
    }

    return $value;
}

function internalValidateProjectStatus(string $value): string
{
    $allowed = [
        'active',
        'on_hold',
        'completed',
        'archived',
    ];

    if (!in_array($value, $allowed, true)) {
        internalRespond(422, ['ok' => false, 'error' => 'validation_error', 'field' => 'projectStatus']);
    }

    return $value;
}

function internalValidateBriefingStatus(string $value): string
{
    $allowed = [
        'draft',
        'sent',
        'submitted',
        'reviewed',
        'archived',
    ];

    if (!in_array($value, $allowed, true)) {
        internalRespond(422, ['ok' => false, 'error' => 'validation_error', 'field' => 'briefingStatus']);
    }

    return $value;
}

function internalReadQueryString(string $key, int $maxLength): string
{
    $value = trim((string) ($_GET[$key] ?? ''));

    if ($value === '' || mb_strlen($value) > $maxLength) {
        internalRespond(422, ['ok' => false, 'error' => 'validation_error', 'field' => $key]);
    }

    return $value;
}

function internalOptionalQueryString(string $key, int $maxLength): ?string
{
    $value = trim((string) ($_GET[$key] ?? ''));

    if ($value === '') {
        return null;
    }

    if (mb_strlen($value) > $maxLength) {
        internalRespond(422, ['ok' => false, 'error' => 'validation_error', 'field' => $key]);
    }

    return $value;
}

function internalOptionalQueryInt(string $key, int $default, int $min, int $max): int
{
    $value = trim((string) ($_GET[$key] ?? ''));
    if ($value === '') {
        return $default;
    }

    if (preg_match('/^[0-9]+$/', $value) !== 1) {
        internalRespond(422, ['ok' => false, 'error' => 'validation_error', 'field' => $key]);
    }

    $intValue = (int) $value;
    if ($intValue < $min || $intValue > $max) {
        internalRespond(422, ['ok' => false, 'error' => 'validation_error', 'field' => $key]);
    }

    return $intValue;
}
