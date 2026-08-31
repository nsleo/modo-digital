<?php

declare(strict_types=1);

const MAX_REQUEST_BYTES = 32768;
const RATE_LIMIT_WINDOW_MINUTES = 15;
const RATE_LIMIT_MAX_REQUESTS = 5;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');

function respond(int $status, array $payload): never
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function loadConfig(): array
{
    $customPath = getenv('MODO_PRIVATE_CONFIG');
    $documentRoot = rtrim((string) ($_SERVER['DOCUMENT_ROOT'] ?? ''), DIRECTORY_SEPARATOR);
    $defaultPath = dirname($documentRoot) . DIRECTORY_SEPARATOR . 'modo-private' . DIRECTORY_SEPARATOR . 'database.php';
    $configPath = is_string($customPath) && $customPath !== '' ? $customPath : $defaultPath;

    if (!is_file($configPath)) {
        error_log('Modo API: arquivo privado de configuracao nao encontrado.');
        respond(503, ['ok' => false, 'error' => 'service_unavailable']);
    }

    $config = require $configPath;

    if (!is_array($config) || !isset($config['database'], $config['security'])) {
        error_log('Modo API: configuracao privada invalida.');
        respond(503, ['ok' => false, 'error' => 'service_unavailable']);
    }

    return $config;
}

function configureCors(array $allowedOrigins): void
{
    $origin = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');

    if ($origin !== '' && !in_array($origin, $allowedOrigins, true)) {
        respond(403, ['ok' => false, 'error' => 'origin_not_allowed']);
    }

    if ($origin !== '') {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
        header('Access-Control-Allow-Methods: POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
        header('Access-Control-Max-Age: 600');
    }
}

function connectDatabase(array $database): PDO
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

function readJsonBody(): array
{
    $contentLength = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($contentLength > MAX_REQUEST_BYTES) {
        respond(413, ['ok' => false, 'error' => 'payload_too_large']);
    }

    $rawBody = file_get_contents('php://input');
    if (!is_string($rawBody) || $rawBody === '' || strlen($rawBody) > MAX_REQUEST_BYTES) {
        respond(400, ['ok' => false, 'error' => 'invalid_payload']);
    }

    try {
        $payload = json_decode($rawBody, true, 32, JSON_THROW_ON_ERROR);
    } catch (JsonException) {
        respond(400, ['ok' => false, 'error' => 'invalid_json']);
    }

    if (!is_array($payload)) {
        respond(400, ['ok' => false, 'error' => 'invalid_payload']);
    }

    return $payload;
}

function requiredString(array $payload, string $key, int $maxLength): string
{
    $value = trim((string) ($payload[$key] ?? ''));

    if ($value === '' || mb_strlen($value) > $maxLength) {
        respond(422, ['ok' => false, 'error' => 'validation_error', 'field' => $key]);
    }

    return $value;
}

function optionalString(array $payload, string $key, int $maxLength): ?string
{
    $value = trim((string) ($payload[$key] ?? ''));

    if ($value === '') {
        return null;
    }

    if (mb_strlen($value) > $maxLength) {
        respond(422, ['ok' => false, 'error' => 'validation_error', 'field' => $key]);
    }

    return $value;
}

function uuidV4(): string
{
    $bytes = random_bytes(16);
    $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40);
    $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80);

    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($bytes), 4));
}

function validNotificationEmails(array $recipients): array
{
    $validRecipients = [];

    foreach ($recipients as $recipient) {
        if (!is_string($recipient)) {
            continue;
        }

        $email = trim($recipient);
        if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $validRecipients[] = $email;
        }
    }

    return array_values(array_unique($validRecipients));
}

function buildLeadNotificationSubject(array $notifications, string $companyName, string $name): string
{
    $subjectPrefix = trim((string) ($notifications['lead_subject_prefix'] ?? 'Novo lead'));
    $subjectContext = $companyName !== '' ? $companyName : $name;

    return sprintf('%s | %s', $subjectPrefix, $subjectContext);
}

function buildLeadNotificationMessage(
    string $publicId,
    string $name,
    string $email,
    ?string $phone,
    ?string $companyName,
    ?string $serviceInterest,
    ?string $message,
    ?string $source,
    ?array $utm,
    ?array $answers
): string {
    $lines = [
        'Novo lead recebido no diagnostico da Modo Digital.',
        '',
        'Lead ID: ' . $publicId,
        'Nome: ' . $name,
        'Email: ' . $email,
        'Telefone: ' . ($phone ?? '-'),
        'Empresa: ' . ($companyName ?? '-'),
        'Interesse principal: ' . ($serviceInterest ?? '-'),
        'Origem: ' . ($source ?? '-'),
        '',
        'Mensagem:',
        $message ?? '-',
    ];

    if ($utm !== null) {
        $lines[] = '';
        $lines[] = 'UTM:';
        foreach ($utm as $key => $value) {
            $lines[] = sprintf('- %s: %s', (string) $key, trim((string) $value) !== '' ? trim((string) $value) : '-');
        }
    }

    if ($answers !== null) {
        $lines[] = '';
        $lines[] = 'Respostas auxiliares:';
        foreach ($answers as $key => $value) {
            $lines[] = sprintf(
                '- %s: %s',
                (string) $key,
                is_scalar($value) && trim((string) $value) !== ''
                    ? trim((string) $value)
                    : json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
            );
        }
    }

    return implode("\n", $lines) . "\n";
}

function smtpReadResponse($socket, array $expectedCodes): string
{
    $response = '';

    while (($line = fgets($socket, 515)) !== false) {
        $response .= $line;

        if (preg_match('/^\d{3} /', $line) === 1) {
            break;
        }
    }

    if ($response === '') {
        throw new RuntimeException('SMTP sem resposta do servidor.');
    }

    $statusCode = (int) substr($response, 0, 3);
    if (!in_array($statusCode, $expectedCodes, true)) {
        throw new RuntimeException('SMTP respondeu com erro: ' . trim($response));
    }

    return $response;
}

function smtpWriteLine($socket, string $line): void
{
    $bytes = fwrite($socket, $line . "\r\n");
    if ($bytes === false || $bytes < strlen($line) + 2) {
        throw new RuntimeException('SMTP nao aceitou escrita no socket.');
    }
}

function smtpCommand($socket, string $command, array $expectedCodes): string
{
    smtpWriteLine($socket, $command);
    return smtpReadResponse($socket, $expectedCodes);
}

function smtpEscapeBody(string $body): string
{
    $normalized = str_replace(["\r\n", "\r"], "\n", $body);
    $lines = explode("\n", $normalized);

    foreach ($lines as &$line) {
        if (str_starts_with($line, '.')) {
            $line = '.' . $line;
        }
    }

    return implode("\r\n", $lines);
}

function smtpBuildHeaders(array $recipients, string $fromAddress, string $fromName, string $replyTo, string $subject): string
{
    $encodedFromName = sprintf('=?UTF-8?B?%s?=', base64_encode($fromName));
    $encodedSubject = sprintf('=?UTF-8?B?%s?=', base64_encode($subject));

    $headers = [
        sprintf('From: %s <%s>', $encodedFromName, $fromAddress),
        'To: ' . implode(', ', $recipients),
        'Subject: ' . $encodedSubject,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
    ];

    if ($replyTo !== '') {
        $headers[] = 'Reply-To: ' . $replyTo;
    }

    return implode("\r\n", $headers);
}

function smtpSendMessage(
    array $smtp,
    array $recipients,
    string $fromAddress,
    string $fromName,
    string $replyTo,
    string $subject,
    string $body
): void {
    $host = trim((string) ($smtp['host'] ?? ''));
    $port = (int) ($smtp['port'] ?? 0);
    $encryption = strtolower(trim((string) ($smtp['encryption'] ?? 'tls')));
    $username = trim((string) ($smtp['username'] ?? ''));
    $password = (string) ($smtp['password'] ?? '');
    $timeout = max(5, (int) ($smtp['timeout_seconds'] ?? 10));
    $ehloDomain = trim((string) ($smtp['ehlo_domain'] ?? 'sejamododigital.com.br'));

    if ($host === '' || $port <= 0 || $username === '' || $password === '') {
        throw new RuntimeException('Configuracao SMTP incompleta.');
    }

    if (!function_exists('stream_socket_client')) {
        throw new RuntimeException('stream_socket_client indisponivel no PHP.');
    }

    $transport = $encryption === 'ssl' ? 'ssl://' : '';
    $socket = @stream_socket_client(
        $transport . $host . ':' . $port,
        $errorCode,
        $errorMessage,
        $timeout,
        STREAM_CLIENT_CONNECT
    );

    if (!is_resource($socket)) {
        throw new RuntimeException(sprintf('Falha na conexao SMTP: [%d] %s', $errorCode, $errorMessage));
    }

    stream_set_timeout($socket, $timeout);

    try {
        smtpReadResponse($socket, [220]);
        smtpCommand($socket, 'EHLO ' . $ehloDomain, [250]);

        if ($encryption === 'tls') {
            smtpCommand($socket, 'STARTTLS', [220]);

            $tlsStarted = @stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
            if ($tlsStarted !== true) {
                throw new RuntimeException('Nao foi possivel iniciar TLS no SMTP.');
            }

            smtpCommand($socket, 'EHLO ' . $ehloDomain, [250]);
        }

        smtpCommand($socket, 'AUTH LOGIN', [334]);
        smtpCommand($socket, base64_encode($username), [334]);
        smtpCommand($socket, base64_encode($password), [235]);
        smtpCommand($socket, 'MAIL FROM:<' . $fromAddress . '>', [250]);

        foreach ($recipients as $recipient) {
            smtpCommand($socket, 'RCPT TO:<' . $recipient . '>', [250, 251]);
        }

        smtpCommand($socket, 'DATA', [354]);

        $headers = smtpBuildHeaders($recipients, $fromAddress, $fromName, $replyTo, $subject);
        $message = $headers . "\r\n\r\n" . smtpEscapeBody($body) . "\r\n.";
        smtpWriteLine($socket, $message);
        smtpReadResponse($socket, [250]);
        smtpCommand($socket, 'QUIT', [221]);
    } finally {
        fclose($socket);
    }
}

function sendLeadNotificationEmail(
    array $config,
    string $publicId,
    string $name,
    string $email,
    ?string $phone,
    ?string $companyName,
    ?string $serviceInterest,
    ?string $message,
    ?string $source,
    ?array $utm,
    ?array $answers
): void {
    $notifications = is_array($config['notifications'] ?? null) ? $config['notifications'] : [];
    $enabled = ($notifications['lead_email_enabled'] ?? false) === true;

    if (!$enabled) {
        return;
    }

    $recipients = validNotificationEmails(is_array($notifications['lead_email_recipients'] ?? null)
        ? $notifications['lead_email_recipients']
        : []);

    if ($recipients === []) {
        error_log('Modo API: notificacao de lead habilitada sem destinatarios validos.');
        return;
    }

    $fromAddress = trim((string) ($notifications['lead_email_from'] ?? ''));
    $fromName = trim((string) ($notifications['lead_email_from_name'] ?? 'Modo Digital'));
    $replyTo = trim((string) ($notifications['lead_email_reply_to'] ?? $email));
    $subject = buildLeadNotificationSubject($notifications, $companyName ?? '', $name);
    $body = buildLeadNotificationMessage(
        $publicId,
        $name,
        $email,
        $phone,
        $companyName,
        $serviceInterest,
        $message,
        $source,
        $utm,
        $answers
    );

    if (!filter_var($fromAddress, FILTER_VALIDATE_EMAIL)) {
        error_log('Modo API: lead_email_from invalido na configuracao privada.');
        return;
    }

    if ($replyTo !== '' && !filter_var($replyTo, FILTER_VALIDATE_EMAIL)) {
        $replyTo = '';
    }

    $smtp = is_array($notifications['smtp'] ?? null) ? $notifications['smtp'] : [];

    try {
        smtpSendMessage($smtp, $recipients, $fromAddress, $fromName, $replyTo, $subject, $body);
    } catch (Throwable $error) {
        error_log('Modo API: falha ao enviar notificacao SMTP de lead. ' . $error->getMessage());
    }
}

function clientIp(): string
{
    $cloudflareIp = trim((string) ($_SERVER['HTTP_CF_CONNECTING_IP'] ?? ''));
    if ($cloudflareIp !== '' && filter_var($cloudflareIp, FILTER_VALIDATE_IP)) {
        return $cloudflareIp;
    }

    $remoteIp = trim((string) ($_SERVER['REMOTE_ADDR'] ?? ''));
    return filter_var($remoteIp, FILTER_VALIDATE_IP) ? $remoteIp : 'unknown';
}

function validateTurnstile(string $token, string $ip, array $security): void
{
    $secret = (string) ($security['turnstile_secret'] ?? '');
    $allowedHostnames = $security['turnstile_hostnames'] ?? [];

    if ($secret === '' || $token === '' || !function_exists('curl_init')) {
        error_log('Modo API: Turnstile ausente ou indisponivel.');
        respond(503, ['ok' => false, 'error' => 'verification_unavailable']);
    }

    $curl = curl_init('https://challenges.cloudflare.com/turnstile/v0/siteverify');
    curl_setopt_array($curl, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query([
            'secret' => $secret,
            'response' => $token,
            'remoteip' => $ip,
        ]),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 8,
        CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded'],
    ]);

    $rawResponse = curl_exec($curl);
    $httpStatus = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);

    if (!is_string($rawResponse) || $httpStatus !== 200) {
        respond(503, ['ok' => false, 'error' => 'verification_unavailable']);
    }

    try {
        $result = json_decode($rawResponse, true, 16, JSON_THROW_ON_ERROR);
    } catch (JsonException) {
        respond(503, ['ok' => false, 'error' => 'verification_unavailable']);
    }

    $hostname = (string) ($result['hostname'] ?? '');
    $hostnameAllowed = is_array($allowedHostnames)
        && in_array($hostname, $allowedHostnames, true);

    if (($result['success'] ?? false) !== true || !$hostnameAllowed) {
        respond(422, ['ok' => false, 'error' => 'verification_failed']);
    }
}

$config = loadConfig();
$security = $config['security'];
configureCors(is_array($security['allowed_origins'] ?? null) ? $security['allowed_origins'] : []);

$method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($method !== 'POST') {
    header('Allow: POST, OPTIONS');
    respond(405, ['ok' => false, 'error' => 'method_not_allowed']);
}

$appKey = (string) ($security['app_key'] ?? '');
if (strlen($appKey) < 32) {
    error_log('Modo API: app_key ausente ou muito curta.');
    respond(503, ['ok' => false, 'error' => 'service_unavailable']);
}

$payload = readJsonBody();
$name = requiredString($payload, 'name', 120);
$email = mb_strtolower(requiredString($payload, 'email', 190));

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(422, ['ok' => false, 'error' => 'validation_error', 'field' => 'email']);
}

if (($payload['privacyAccepted'] ?? false) !== true) {
    respond(422, ['ok' => false, 'error' => 'validation_error', 'field' => 'privacyAccepted']);
}

$phone = optionalString($payload, 'phone', 32);
$companyName = optionalString($payload, 'companyName', 160);
$serviceInterest = optionalString($payload, 'serviceInterest', 80);
$message = optionalString($payload, 'message', 5000);
$source = optionalString($payload, 'source', 100);
$turnstileToken = requiredString($payload, 'turnstileToken', 2048);
$idempotencyKey = optionalString($payload, 'idempotencyKey', 36);

if ($idempotencyKey !== null && !preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i', $idempotencyKey)) {
    respond(422, ['ok' => false, 'error' => 'validation_error', 'field' => 'idempotencyKey']);
}

$answers = $payload['answers'] ?? null;
$utm = $payload['utm'] ?? null;

if ($answers !== null && !is_array($answers)) {
    respond(422, ['ok' => false, 'error' => 'validation_error', 'field' => 'answers']);
}

if ($utm !== null && !is_array($utm)) {
    respond(422, ['ok' => false, 'error' => 'validation_error', 'field' => 'utm']);
}

$ip = clientIp();
validateTurnstile($turnstileToken, $ip, $security);
$ipHash = hash_hmac('sha256', $ip, $appKey);
$publicId = uuidV4();

try {
    $pdo = connectDatabase($config['database']);

    if ($idempotencyKey !== null) {
        $existing = $pdo->prepare('SELECT public_id FROM leads WHERE idempotency_key = :idempotency_key LIMIT 1');
        $existing->execute(['idempotency_key' => $idempotencyKey]);
        $existingPublicId = $existing->fetchColumn();

        if (is_string($existingPublicId)) {
            respond(200, ['ok' => true, 'leadId' => $existingPublicId]);
        }
    }

    $rateLimit = $pdo->prepare(
        'SELECT COUNT(*) FROM leads
         WHERE ip_hash = :ip_hash
           AND created_at >= (UTC_TIMESTAMP() - INTERVAL ' . RATE_LIMIT_WINDOW_MINUTES . ' MINUTE)'
    );
    $rateLimit->execute(['ip_hash' => $ipHash]);

    if ((int) $rateLimit->fetchColumn() >= RATE_LIMIT_MAX_REQUESTS) {
        respond(429, ['ok' => false, 'error' => 'rate_limit_exceeded']);
    }

    $insert = $pdo->prepare(
        'INSERT INTO leads (
            public_id, form_slug, form_version, name, email, phone, company_name,
            service_interest, message, answers_json, status, source, utm_json,
            privacy_accepted_at, consent_version, marketing_opt_in,
            idempotency_key, ip_hash, user_agent
        ) VALUES (
            :public_id, :form_slug, :form_version, :name, :email, :phone, :company_name,
            :service_interest, :message, :answers_json, :status, :source, :utm_json,
            UTC_TIMESTAMP(), :consent_version, :marketing_opt_in,
            :idempotency_key, :ip_hash, :user_agent
        )'
    );

    $insert->execute([
        'public_id' => $publicId,
        'form_slug' => optionalString($payload, 'formSlug', 64) ?? 'contact',
        'form_version' => 1,
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'company_name' => $companyName,
        'service_interest' => $serviceInterest,
        'message' => $message,
        'answers_json' => $answers === null ? null : json_encode($answers, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        'status' => 'new',
        'source' => $source,
        'utm_json' => $utm === null ? null : json_encode($utm, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        'consent_version' => '2026-06',
        'marketing_opt_in' => ($payload['marketingOptIn'] ?? false) === true ? 1 : 0,
        'idempotency_key' => $idempotencyKey,
        'ip_hash' => $ipHash,
        'user_agent' => mb_substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 255),
    ]);

    sendLeadNotificationEmail(
        $config,
        $publicId,
        $name,
        $email,
        $phone,
        $companyName,
        $serviceInterest,
        $message,
        $source,
        is_array($utm) ? $utm : null,
        is_array($answers) ? $answers : null
    );

    respond(201, ['ok' => true, 'leadId' => $publicId]);
} catch (Throwable $error) {
    error_log('Modo API: falha ao registrar lead. ' . $error->getMessage());
    respond(500, ['ok' => false, 'error' => 'internal_error']);
}
