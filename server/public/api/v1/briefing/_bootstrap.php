<?php

declare(strict_types=1);

const BRIEFING_MAX_REQUEST_BYTES = 65536;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');

function briefingRespond(int $status, array $payload): never
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function briefingRespondValidationErrors(array $errors): never
{
    $fields = array_values(array_unique(array_keys($errors)));

    briefingRespond(422, [
        'ok' => false,
        'error' => 'validation_error',
        'field' => $fields[0] ?? null,
        'fields' => $fields,
        'errors' => $errors,
    ]);
}

function briefingLoadConfig(): array
{
    $customPath = getenv('MODO_PRIVATE_CONFIG');
    $documentRoot = rtrim((string) ($_SERVER['DOCUMENT_ROOT'] ?? ''), DIRECTORY_SEPARATOR);
    $defaultPath = dirname($documentRoot) . DIRECTORY_SEPARATOR . 'modo-private' . DIRECTORY_SEPARATOR . 'database.php';
    $configPath = is_string($customPath) && $customPath !== '' ? $customPath : $defaultPath;

    if (!is_file($configPath)) {
        error_log('Modo briefing API: arquivo privado de configuracao nao encontrado.');
        briefingRespond(503, ['ok' => false, 'error' => 'service_unavailable']);
    }

    $config = require $configPath;

    if (!is_array($config) || !isset($config['database'], $config['security'])) {
        error_log('Modo briefing API: configuracao privada invalida.');
        briefingRespond(503, ['ok' => false, 'error' => 'service_unavailable']);
    }

    return $config;
}

function briefingConfigureCors(array $allowedOrigins): void
{
    $origin = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');

    if ($origin !== '' && !in_array($origin, $allowedOrigins, true)) {
        briefingRespond(403, ['ok' => false, 'error' => 'origin_not_allowed']);
    }

    if ($origin !== '') {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
        header('Access-Control-Max-Age: 600');
    }
}

function briefingConnectDatabase(array $database): PDO
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

function briefingReadJsonBody(): array
{
    $contentLength = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($contentLength > BRIEFING_MAX_REQUEST_BYTES) {
        briefingRespond(413, ['ok' => false, 'error' => 'payload_too_large']);
    }

    $rawBody = file_get_contents('php://input');
    if (!is_string($rawBody) || $rawBody === '' || strlen($rawBody) > BRIEFING_MAX_REQUEST_BYTES) {
        briefingRespond(400, ['ok' => false, 'error' => 'invalid_payload']);
    }

    try {
        $payload = json_decode($rawBody, true, 64, JSON_THROW_ON_ERROR);
    } catch (JsonException) {
        briefingRespond(400, ['ok' => false, 'error' => 'invalid_json']);
    }

    if (!is_array($payload)) {
        briefingRespond(400, ['ok' => false, 'error' => 'invalid_payload']);
    }

    return $payload;
}

function briefingRequiredString(array $payload, string $key, int $maxLength): string
{
    $value = trim((string) ($payload[$key] ?? ''));

    if ($value === '' || mb_strlen($value) > $maxLength) {
        briefingRespond(422, ['ok' => false, 'error' => 'validation_error', 'field' => $key]);
    }

    return $value;
}

function briefingOptionalString(array $payload, string $key, int $maxLength): ?string
{
    $value = trim((string) ($payload[$key] ?? ''));

    if ($value === '') {
        return null;
    }

    if (mb_strlen($value) > $maxLength) {
        briefingRespond(422, ['ok' => false, 'error' => 'validation_error', 'field' => $key]);
    }

    return $value;
}

function briefingOptionalArray(array $payload, string $key): array
{
    $value = $payload[$key] ?? [];

    if (!is_array($value)) {
        briefingRespond(422, ['ok' => false, 'error' => 'validation_error', 'field' => $key]);
    }

    return array_values(array_filter(array_map(
        static fn ($item) => trim((string) $item),
        $value
    ), static fn ($item) => $item !== ''));
}

function briefingOptionalAssocArray(array $payload, string $key): array
{
    $value = $payload[$key] ?? [];

    if (!is_array($value)) {
        briefingRespond(422, ['ok' => false, 'error' => 'validation_error', 'field' => $key]);
    }

    return $value;
}

function briefingUuidV4(): string
{
    $bytes = random_bytes(16);
    $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40);
    $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80);

    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($bytes), 4));
}

function briefingTokenHash(string $token): string
{
    return hash('sha256', $token);
}

function briefingFetchInvite(PDO $pdo, string $invitePublicId, string $token): array
{
    if (!preg_match('/^[0-9a-f-]{36}$/i', $invitePublicId)) {
        briefingRespond(404, ['ok' => false, 'error' => 'invite_not_found']);
    }

    $query = $pdo->prepare(
        'SELECT
            invites.id,
            invites.client_id,
            invites.project_briefing_id,
            invites.public_id,
            invites.title,
            invites.intro_message,
            invites.status,
            invites.expires_at,
            invites.completed_at,
            clients.company_name,
            clients.primary_contact_name,
            clients.primary_contact_email,
            clients.project_label,
            pb.project_id,
            pb.template_id
         FROM briefing_invites AS invites
         INNER JOIN clients ON clients.id = invites.client_id
         LEFT JOIN project_briefings pb ON pb.id = invites.project_briefing_id
         WHERE invites.public_id = :public_id
           AND invites.token_hash = :token_hash
         LIMIT 1'
    );
    $query->execute([
        'public_id' => $invitePublicId,
        'token_hash' => briefingTokenHash($token),
    ]);

    $invite = $query->fetch();

    if (!is_array($invite)) {
        briefingRespond(404, ['ok' => false, 'error' => 'invite_not_found']);
    }

    if (($invite['status'] ?? '') === 'revoked') {
        briefingRespond(410, ['ok' => false, 'error' => 'invite_revoked']);
    }

    if (($invite['expires_at'] ?? null) !== null && strtotime((string) $invite['expires_at']) < time()) {
        briefingRespond(410, ['ok' => false, 'error' => 'invite_expired']);
    }

    return $invite;
}

function briefingDecodeJsonValue(mixed $value): mixed
{
    if ($value === null || $value === '') {
        return null;
    }

    if (!is_string($value)) {
        return $value;
    }

    try {
        return json_decode($value, true, 64, JSON_THROW_ON_ERROR);
    } catch (JsonException) {
        return null;
    }
}

function briefingFetchTemplate(PDO $pdo, int $templateId): ?array
{
    $templateQuery = $pdo->prepare(
        'SELECT public_id, slug, name, version, project_type, description
         FROM briefing_templates
         WHERE id = :id
         LIMIT 1'
    );
    $templateQuery->execute(['id' => $templateId]);
    $template = $templateQuery->fetch();

    if (!is_array($template)) {
        return null;
    }

    $stepsQuery = $pdo->prepare(
        'SELECT
            s.step_key,
            s.title AS step_title,
            s.description AS step_description,
            s.position AS step_position,
            f.id AS field_id,
            f.field_key,
            f.label,
            f.help_text,
            f.field_type,
            f.is_required,
            f.options_json,
            f.visibility_rules_json,
            f.placeholder,
            f.position AS field_position
         FROM briefing_template_steps s
         INNER JOIN briefing_template_fields f ON f.step_id = s.id
         WHERE s.template_id = :template_id
         ORDER BY s.position ASC, f.position ASC'
    );
    $stepsQuery->execute(['template_id' => $templateId]);

    $steps = [];

    while ($row = $stepsQuery->fetch()) {
        $stepKey = (string) $row['step_key'];

        if (!isset($steps[$stepKey])) {
            $steps[$stepKey] = [
                'key' => $stepKey,
                'title' => $row['step_title'],
                'description' => $row['step_description'],
                'position' => (int) $row['step_position'],
                'fields' => [],
            ];
        }

        $steps[$stepKey]['fields'][] = [
            'id' => (int) $row['field_id'],
            'key' => $row['field_key'],
            'label' => $row['label'],
            'helpText' => $row['help_text'],
            'type' => $row['field_type'],
            'required' => (int) $row['is_required'] === 1,
            'options' => briefingDecodeJsonValue($row['options_json']) ?? [],
            'visibilityRules' => briefingDecodeJsonValue($row['visibility_rules_json']),
            'placeholder' => $row['placeholder'],
            'position' => (int) $row['field_position'],
        ];
    }

    return [
        'publicId' => $template['public_id'],
        'slug' => $template['slug'],
        'name' => $template['name'],
        'version' => (int) $template['version'],
        'projectType' => $template['project_type'],
        'description' => $template['description'],
        'steps' => array_values($steps),
    ];
}

function briefingFetchLatestStructuredSubmission(PDO $pdo, int $projectBriefingId): ?array
{
    $query = $pdo->prepare(
        'SELECT public_id, answers_json, submitted_at
         FROM briefing_submissions
         WHERE project_briefing_id = :project_briefing_id
           AND status = :status
         ORDER BY submitted_at DESC, id DESC
         LIMIT 1'
    );
    $query->execute([
        'project_briefing_id' => $projectBriefingId,
        'status' => 'submitted',
    ]);
    $row = $query->fetch();

    if (!is_array($row)) {
        return null;
    }

    return [
        'publicId' => $row['public_id'],
        'payload' => briefingDecodeJsonValue($row['answers_json']) ?? [],
        'submittedAt' => $row['submitted_at'],
    ];
}

function briefingEvaluateVisibilityRule(array $rule, array $answers): bool
{
    $field = trim((string) ($rule['field'] ?? ''));
    $operator = trim((string) ($rule['operator'] ?? 'equals'));
    $value = $rule['value'] ?? null;

    if ($field === '') {
        return true;
    }

    $answer = $answers[$field] ?? null;

    if ($operator === 'equals') {
        return $answer === $value;
    }

    if ($operator === 'in' && is_array($value)) {
        if (is_array($answer)) {
            foreach ($answer as $item) {
                if (in_array($item, $value, true)) {
                    return true;
                }
            }

            return false;
        }

        return in_array($answer, $value, true);
    }

    return true;
}

function briefingFieldIsVisible(array $field, array $answers): bool
{
    $rules = $field['visibilityRules'] ?? null;

    if (!is_array($rules) || !isset($rules['show_if']) || !is_array($rules['show_if'])) {
        return true;
    }

    foreach ($rules['show_if'] as $rule) {
        if (!is_array($rule) || !briefingEvaluateVisibilityRule($rule, $answers)) {
            return false;
        }
    }

    return true;
}

function briefingNormalizeAnswerValue(array $field, mixed $value): mixed
{
    $type = (string) ($field['type'] ?? 'text');

    if ($type === 'multi_select') {
        if ($value === null || $value === '') {
            return [];
        }

        if (!is_array($value)) {
            briefingRespond(422, ['ok' => false, 'error' => 'validation_error', 'field' => $field['key']]);
        }

        return array_values(array_filter(array_map(
            static fn ($item) => trim((string) $item),
            $value
        ), static fn ($item) => $item !== ''));
    }

    return trim((string) ($value ?? ''));
}

function briefingValidateAnswers(array $template, array $answers): array
{
    $normalized = [];
    $errors = [];

    foreach (($template['steps'] ?? []) as $step) {
        foreach (($step['fields'] ?? []) as $field) {
            if (!is_array($field) || !isset($field['key'])) {
                continue;
            }

            if (!briefingFieldIsVisible($field, $answers)) {
                continue;
            }

            $value = briefingNormalizeAnswerValue($field, $answers[$field['key']] ?? null);
            $isEmpty = is_array($value) ? count($value) === 0 : $value === '';
            $fieldKey = (string) $field['key'];
            $fieldType = (string) ($field['type'] ?? 'text');

            if (($field['required'] ?? false) === true && $isEmpty) {
                $errors[$fieldKey] = 'Preenche esse campo para continuar.';
            }

            if (is_string($value) && mb_strlen($value) > 5000) {
                $errors[$fieldKey] = 'Essa resposta passou do limite permitido.';
            }

            if (!$isEmpty && is_string($value) && $fieldType === 'email' && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                $errors[$fieldKey] = 'Informa um e-mail valido.';
            }

            if (!$isEmpty && is_string($value) && $fieldType === 'url' && !filter_var($value, FILTER_VALIDATE_URL)) {
                $errors[$fieldKey] = 'Informa uma URL valida completa.';
            }

            $normalized[$fieldKey] = $value;
        }
    }

    if ($errors !== []) {
        briefingRespondValidationErrors($errors);
    }

    return $normalized;
}

function briefingValidNotificationEmails(array $recipients): array
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

function briefingFormatAnswerLabel(mixed $value, array $options): string
{
    if (is_array($value)) {
        if ($value === []) {
            return '—';
        }

        $labels = array_map(
            static function (mixed $item) use ($options): string {
                $stringItem = trim((string) $item);
                foreach ($options as $option) {
                    if (($option['value'] ?? null) === $stringItem) {
                        return (string) ($option['label'] ?? $stringItem);
                    }
                }

                return $stringItem;
            },
            $value
        );

        return implode(', ', $labels);
    }

    $stringValue = trim((string) $value);
    if ($stringValue === '') {
        return '—';
    }

    foreach ($options as $option) {
        if (($option['value'] ?? null) === $stringValue) {
            return (string) ($option['label'] ?? $stringValue);
        }
    }

    return $stringValue;
}

function briefingBuildNotificationSubject(array $notifications, string $projectTitle, string $companyName): string
{
    $subjectPrefix = trim((string) ($notifications['briefing_subject_prefix'] ?? 'Briefing recebido'));
    $subjectContext = $projectTitle !== '' ? $projectTitle : $companyName;

    return sprintf('%s | %s', $subjectPrefix, $subjectContext !== '' ? $subjectContext : 'Modo Digital');
}

function briefingBuildNotificationHtml(
    array $invite,
    array $template,
    array $answers,
    ?string $submittedAt
): string {
    $companyName = trim((string) ($invite['company_name'] ?? ''));
    $contactName = trim((string) ($invite['primary_contact_name'] ?? ''));
    $projectLabel = trim((string) ($invite['project_label'] ?? ''));
    $title = trim((string) ($invite['title'] ?? 'Briefing recebido'));
    $submittedLabel = $submittedAt !== null && trim($submittedAt) !== '' ? trim($submittedAt) . ' UTC' : 'Agora';

    $cards = [];

    foreach (($template['steps'] ?? []) as $step) {
        $items = [];

        foreach (($step['fields'] ?? []) as $field) {
            $fieldKey = (string) ($field['key'] ?? '');
            if ($fieldKey === '' || !array_key_exists($fieldKey, $answers)) {
                continue;
            }

            $answerValue = $answers[$fieldKey];
            $formatted = briefingFormatAnswerLabel(
                $answerValue,
                is_array($field['options'] ?? null) ? $field['options'] : []
            );

            if ($formatted === '—') {
                continue;
            }

            $items[] = sprintf(
                '<div style="padding:14px 0;border-top:1px solid #e5e7eb;"><p style="margin:0 0 6px;color:#6b7280;font-size:13px;line-height:1.4;">%s</p><p style="margin:0;color:#111827;font-size:15px;line-height:1.65;white-space:pre-line;">%s</p></div>',
                htmlspecialchars((string) ($field['label'] ?? $fieldKey), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'),
                nl2br(htmlspecialchars($formatted, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'))
            );
        }

        if ($items === []) {
            continue;
        }

        $cards[] = sprintf(
            '<section style="margin:0 0 18px;padding:22px 24px;border:1px solid #e5e7eb;border-radius:18px;background:#ffffff;"><h2 style="margin:0 0 4px;color:#111827;font-size:20px;line-height:1.2;">%s</h2><p style="margin:0;color:#6b7280;font-size:13px;line-height:1.4;">%s</p>%s</section>',
            htmlspecialchars((string) ($step['title'] ?? 'Etapa'), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'),
            htmlspecialchars((string) ($step['description'] ?? 'Perguntas respondidas nesta etapa.'), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'),
            implode('', $items)
        );
    }

    return sprintf(
        '<!doctype html><html lang="pt-BR"><body style="margin:0;padding:32px 18px;background:#f3f4f6;font-family:Arial,sans-serif;color:#111827;"><div style="max-width:820px;margin:0 auto;"><div style="margin:0 0 18px;padding:28px;border-radius:22px;background:#0f172a;background-image:linear-gradient(135deg,#0f172a,#111827);color:#f8fafc;"><p style="margin:0 0 10px;color:#7dd3fc;font-size:12px;letter-spacing:.12em;text-transform:uppercase;">Modo Digital</p><h1 style="margin:0 0 10px;font-size:30px;line-height:1.1;">Briefing recebido</h1><p style="margin:0;color:#cbd5e1;font-size:15px;line-height:1.6;">%s</p></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin:0 0 18px;">%s</div>%s</div></body></html>',
        htmlspecialchars($title, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'),
        implode('', [
            sprintf('<div style="padding:16px 18px;border-radius:16px;background:#ffffff;border:1px solid #e5e7eb;"><p style="margin:0 0 6px;color:#6b7280;font-size:12px;">Empresa</p><p style="margin:0;color:#111827;font-size:15px;">%s</p></div>', htmlspecialchars($companyName !== '' ? $companyName : '—', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')),
            sprintf('<div style="padding:16px 18px;border-radius:16px;background:#ffffff;border:1px solid #e5e7eb;"><p style="margin:0 0 6px;color:#6b7280;font-size:12px;">Contato</p><p style="margin:0;color:#111827;font-size:15px;">%s</p></div>', htmlspecialchars($contactName !== '' ? $contactName : '—', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')),
            sprintf('<div style="padding:16px 18px;border-radius:16px;background:#ffffff;border:1px solid #e5e7eb;"><p style="margin:0 0 6px;color:#6b7280;font-size:12px;">Projeto</p><p style="margin:0;color:#111827;font-size:15px;">%s</p></div>', htmlspecialchars($projectLabel !== '' ? $projectLabel : '—', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')),
            sprintf('<div style="padding:16px 18px;border-radius:16px;background:#ffffff;border:1px solid #e5e7eb;"><p style="margin:0 0 6px;color:#6b7280;font-size:12px;">Recebido em</p><p style="margin:0;color:#111827;font-size:15px;">%s</p></div>', htmlspecialchars($submittedLabel, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')),
        ]),
        implode('', $cards)
    );
}

function briefingSmtpReadResponse($socket, array $expectedCodes): string
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

function briefingSmtpWriteLine($socket, string $line): void
{
    $bytes = fwrite($socket, $line . "\r\n");
    if ($bytes === false || $bytes < strlen($line) + 2) {
        throw new RuntimeException('SMTP nao aceitou escrita no socket.');
    }
}

function briefingSmtpCommand($socket, string $command, array $expectedCodes): string
{
    briefingSmtpWriteLine($socket, $command);
    return briefingSmtpReadResponse($socket, $expectedCodes);
}

function briefingSmtpEscapeBody(string $body): string
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

function briefingSmtpBuildHeaders(
    array $recipients,
    string $fromAddress,
    string $fromName,
    string $replyTo,
    string $subject
): string {
    $encodedFromName = sprintf('=?UTF-8?B?%s?=', base64_encode($fromName));
    $encodedSubject = sprintf('=?UTF-8?B?%s?=', base64_encode($subject));

    $headers = [
        sprintf('From: %s <%s>', $encodedFromName, $fromAddress),
        'To: ' . implode(', ', $recipients),
        'Subject: ' . $encodedSubject,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
    ];

    if ($replyTo !== '') {
        $headers[] = 'Reply-To: ' . $replyTo;
    }

    return implode("\r\n", $headers);
}

function briefingSmtpSendMessage(
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
        briefingSmtpReadResponse($socket, [220]);
        briefingSmtpCommand($socket, 'EHLO ' . $ehloDomain, [250]);

        if ($encryption === 'tls') {
            briefingSmtpCommand($socket, 'STARTTLS', [220]);

            $tlsStarted = @stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
            if ($tlsStarted !== true) {
                throw new RuntimeException('Nao foi possivel iniciar TLS no SMTP.');
            }

            briefingSmtpCommand($socket, 'EHLO ' . $ehloDomain, [250]);
        }

        briefingSmtpCommand($socket, 'AUTH LOGIN', [334]);
        briefingSmtpCommand($socket, base64_encode($username), [334]);
        briefingSmtpCommand($socket, base64_encode($password), [235]);
        briefingSmtpCommand($socket, 'MAIL FROM:<' . $fromAddress . '>', [250]);

        foreach ($recipients as $recipient) {
            briefingSmtpCommand($socket, 'RCPT TO:<' . $recipient . '>', [250, 251]);
        }

        briefingSmtpCommand($socket, 'DATA', [354]);

        $headers = briefingSmtpBuildHeaders($recipients, $fromAddress, $fromName, $replyTo, $subject);
        $message = $headers . "\r\n\r\n" . briefingSmtpEscapeBody($body) . "\r\n.";
        briefingSmtpWriteLine($socket, $message);
        briefingSmtpReadResponse($socket, [250]);
        briefingSmtpCommand($socket, 'QUIT', [221]);
    } finally {
        fclose($socket);
    }
}

function briefingSendNotificationEmail(
    array $config,
    array $invite,
    ?array $template,
    array $answers,
    ?string $submittedAt
): void {
    if ($template === null) {
        return;
    }

    $notifications = is_array($config['notifications'] ?? null) ? $config['notifications'] : [];
    $enabled = ($notifications['briefing_email_enabled'] ?? false) === true;

    if (!$enabled) {
        return;
    }

    $recipientSource = is_array($notifications['briefing_email_recipients'] ?? null)
        ? $notifications['briefing_email_recipients']
        : (is_array($notifications['lead_email_recipients'] ?? null) ? $notifications['lead_email_recipients'] : []);
    $recipients = briefingValidNotificationEmails($recipientSource);

    if ($recipients === []) {
        error_log('Modo briefing API: notificacao habilitada sem destinatarios validos.');
        return;
    }

    $fromAddress = trim((string) ($notifications['lead_email_from'] ?? ''));
    $fromName = trim((string) ($notifications['lead_email_from_name'] ?? 'Modo Digital'));
    $replyToCandidates = [
        trim((string) ($answers['project_contact_email'] ?? '')),
        trim((string) ($invite['primary_contact_email'] ?? '')),
        trim((string) ($notifications['lead_email_reply_to'] ?? '')),
    ];
    $replyTo = '';
    foreach ($replyToCandidates as $candidate) {
        if ($candidate !== '' && filter_var($candidate, FILTER_VALIDATE_EMAIL)) {
            $replyTo = $candidate;
            break;
        }
    }

    if (!filter_var($fromAddress, FILTER_VALIDATE_EMAIL)) {
        error_log('Modo briefing API: lead_email_from invalido na configuracao privada.');
        return;
    }

    $subject = briefingBuildNotificationSubject(
        $notifications,
        trim((string) ($invite['title'] ?? '')),
        trim((string) ($invite['company_name'] ?? ''))
    );
    $body = briefingBuildNotificationHtml($invite, $template, $answers, $submittedAt);
    $smtp = is_array($notifications['smtp'] ?? null) ? $notifications['smtp'] : [];

    try {
        briefingSmtpSendMessage($smtp, $recipients, $fromAddress, $fromName, $replyTo, $subject, $body);
    } catch (Throwable $error) {
        error_log('Modo briefing API: falha ao enviar notificacao SMTP de briefing. ' . $error->getMessage());
    }
}
