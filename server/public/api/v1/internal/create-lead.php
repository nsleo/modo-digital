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
$name = internalRequiredString($payload, 'name', 120);
$email = mb_strtolower(internalRequiredString($payload, 'email', 190));
$phone = internalOptionalString($payload, 'phone', 32);
$companyName = internalOptionalString($payload, 'companyName', 160);
$serviceInterest = internalOptionalString($payload, 'serviceInterest', 80);
$message = internalOptionalString($payload, 'message', 5000);
$qualificationNotes = internalOptionalString($payload, 'qualificationNotes', 5000);
$isTestLead = internalOptionalBool($payload, 'isTestLead', false);
$pipelineStageRaw = array_key_exists('pipelineStage', $payload)
    ? internalValidateLeadPipelineStage(internalRequiredString($payload, 'pipelineStage', 32))
    : 'incoming';

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    internalRespond(422, ['ok' => false, 'error' => 'validation_error', 'field' => 'email']);
}

$statusMap = [
    'incoming' => 'new',
    'qualified' => 'qualified',
    'proposal_sent' => 'proposal_sent',
    'lost' => 'lost',
    'archived' => 'archived',
];

try {
    $pdo = internalConnectDatabase($config['database']);
    $access = internalRequireAccess($pdo, $security);

    $publicId = internalUuidV4();
    $query = $pdo->prepare(
        'INSERT INTO leads (
            public_id, form_slug, form_version, name, email, phone, company_name,
            service_interest, message, status, pipeline_stage, source,
            privacy_accepted_at, consent_version, marketing_opt_in,
            qualification_notes, assigned_admin_user_id
        ) VALUES (
            :public_id, :form_slug, :form_version, :name, :email, :phone, :company_name,
            :service_interest, :message, :status, :pipeline_stage, :source,
            UTC_TIMESTAMP(), :consent_version, 0,
            :qualification_notes, :assigned_admin_user_id
        )'
    );
    $query->execute([
        'public_id' => $publicId,
        'form_slug' => 'internal-manual',
        'form_version' => 1,
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'company_name' => $companyName,
        'service_interest' => $serviceInterest,
        'message' => $message,
        'status' => $statusMap[$pipelineStageRaw],
        'pipeline_stage' => $pipelineStageRaw,
        'source' => $isTestLead ? 'internal_e2e_test' : 'internal_manual_panel',
        'consent_version' => 'internal-panel-v1',
        'qualification_notes' => $qualificationNotes,
        'assigned_admin_user_id' => $access['session'] !== null ? $access['session']['adminUserId'] : null,
    ]);

    internalRespond(201, [
        'ok' => true,
        'leadId' => $publicId,
        'pipelineStage' => $pipelineStageRaw,
        'source' => $isTestLead ? 'internal_e2e_test' : 'internal_manual_panel',
    ]);
} catch (Throwable $error) {
    error_log('Modo internal API: falha ao criar lead manual. ' . $error->getMessage());
    internalRespond(500, ['ok' => false, 'error' => 'internal_error']);
}
