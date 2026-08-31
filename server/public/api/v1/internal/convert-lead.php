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
$leadPublicId = internalRequiredString($payload, 'leadId', 36);
$projectType = internalValidateProjectType(internalRequiredString($payload, 'projectType', 64));
$companyNameOverride = internalOptionalString($payload, 'companyName', 160);
$tradeName = internalOptionalString($payload, 'tradeName', 160);
$segment = internalOptionalString($payload, 'segment', 120);
$contactNameOverride = internalOptionalString($payload, 'contactName', 120);
$contactEmailOverride = internalOptionalString($payload, 'contactEmail', 190);
$contactPhoneOverride = internalOptionalString($payload, 'contactPhone', 32);
$projectNameOverride = internalOptionalString($payload, 'projectName', 160);
$projectSummary = internalOptionalString($payload, 'projectSummary', 5000);
$qualificationNotes = internalOptionalString($payload, 'qualificationNotes', 5000);
$createBriefing = internalOptionalBool($payload, 'createBriefing', true);

if ($contactEmailOverride !== null && !filter_var($contactEmailOverride, FILTER_VALIDATE_EMAIL)) {
    internalRespond(422, ['ok' => false, 'error' => 'validation_error', 'field' => 'contactEmail']);
}

if (!preg_match('/^[0-9a-f-]{36}$/i', $leadPublicId)) {
    internalRespond(422, ['ok' => false, 'error' => 'validation_error', 'field' => 'leadId']);
}

try {
    $pdo = internalConnectDatabase($config['database']);
    internalRequireAccess($pdo, $security);
    $pdo->beginTransaction();

    $query = $pdo->prepare(
        'SELECT id, public_id, name, email, phone, company_name, service_interest, message, answers_json,
                pipeline_stage, status, converted_to_client_id, assigned_admin_user_id, qualification_notes
         FROM leads
         WHERE public_id = :public_id
         LIMIT 1
         FOR UPDATE'
    );
    $query->execute(['public_id' => $leadPublicId]);
    $lead = $query->fetch();

    if (!is_array($lead)) {
        internalRespond(404, ['ok' => false, 'error' => 'lead_not_found']);
    }

    if (($lead['converted_to_client_id'] ?? null) !== null) {
        internalRespond(409, ['ok' => false, 'error' => 'lead_already_converted']);
    }

    $pipelineStage = (string) ($lead['pipeline_stage'] ?? 'incoming');
    if (in_array($pipelineStage, ['lost', 'archived'], true)) {
        internalRespond(409, ['ok' => false, 'error' => 'lead_not_convertible']);
    }

    $companyName = trim((string) ($companyNameOverride ?? $lead['company_name'] ?? ''));
    if ($companyName === '') {
        internalRespond(422, ['ok' => false, 'error' => 'validation_error', 'field' => 'companyName']);
    }

    $contactName = trim((string) ($contactNameOverride ?? $lead['name'] ?? ''));
    if ($contactName === '') {
        internalRespond(422, ['ok' => false, 'error' => 'validation_error', 'field' => 'contactName']);
    }

    $contactEmail = trim((string) ($contactEmailOverride ?? $lead['email'] ?? ''));
    if ($contactEmail === '' || !filter_var($contactEmail, FILTER_VALIDATE_EMAIL)) {
        internalRespond(422, ['ok' => false, 'error' => 'validation_error', 'field' => 'contactEmail']);
    }

    $contactPhone = trim((string) ($contactPhoneOverride ?? $lead['phone'] ?? ''));
    $projectName = trim((string) ($projectNameOverride ?? ''));
    if ($projectName === '') {
        $projectName = $companyName . ' - ' . $projectType;
    }
    $projectName = mb_substr($projectName, 0, 160);
    $effectiveQualificationNotes = $qualificationNotes ?? (
        is_string($lead['qualification_notes'] ?? null) ? $lead['qualification_notes'] : null
    );

    $clientPublicId = internalUuidV4();
    $projectLabel = mb_substr($projectName, 0, 160);
    $insertClient = $pdo->prepare(
        'INSERT INTO clients (
            public_id, company_name, trade_name, segment, primary_contact_name,
            primary_contact_email, primary_contact_phone, project_label, status, notes
        ) VALUES (
            :public_id, :company_name, :trade_name, :segment, :primary_contact_name,
            :primary_contact_email, :primary_contact_phone, :project_label, :status, :notes
        )'
    );
    $insertClient->execute([
        'public_id' => $clientPublicId,
        'company_name' => $companyName,
        'trade_name' => $tradeName,
        'segment' => $segment,
        'primary_contact_name' => $contactName,
        'primary_contact_email' => $contactEmail,
        'primary_contact_phone' => $contactPhone !== '' ? $contactPhone : null,
        'project_label' => $projectLabel,
        'status' => 'active',
        'notes' => $effectiveQualificationNotes,
    ]);
    $clientId = (int) $pdo->lastInsertId();

    $contactPublicId = internalUuidV4();
    $insertContact = $pdo->prepare(
        'INSERT INTO client_contacts (
            public_id, client_id, name, email, phone, role_label, is_primary, notes
        ) VALUES (
            :public_id, :client_id, :name, :email, :phone, :role_label, :is_primary, :notes
        )'
    );
    $insertContact->execute([
        'public_id' => $contactPublicId,
        'client_id' => $clientId,
        'name' => $contactName,
        'email' => $contactEmail,
        'phone' => $contactPhone !== '' ? $contactPhone : null,
        'role_label' => 'primary_contact',
        'is_primary' => 1,
        'notes' => null,
    ]);

    $projectPublicId = internalUuidV4();
    $insertProject = $pdo->prepare(
        'INSERT INTO projects (
            public_id, client_id, source_lead_id, owner_admin_user_id, name,
            project_type, status, summary, started_at
        ) VALUES (
            :public_id, :client_id, :source_lead_id, :owner_admin_user_id, :name,
            :project_type, :status, :summary, UTC_TIMESTAMP()
        )'
    );
    $insertProject->execute([
        'public_id' => $projectPublicId,
        'client_id' => $clientId,
        'source_lead_id' => $lead['id'],
        'owner_admin_user_id' => $lead['assigned_admin_user_id'] !== null ? (int) $lead['assigned_admin_user_id'] : null,
        'name' => $projectName,
        'project_type' => $projectType,
        'status' => 'active',
        'summary' => $projectSummary ?? $lead['message'] ?? null,
    ]);
    $projectId = (int) $pdo->lastInsertId();

    $briefingPublicId = null;
    if ($createBriefing) {
        $templateQuery = $pdo->prepare(
            'SELECT id
             FROM briefing_templates
             WHERE slug = :slug AND is_active = 1
             ORDER BY version DESC
             LIMIT 1'
        );
        $templateQuery->execute([
            'slug' => 'official-briefing',
        ]);
        $templateId = $templateQuery->fetchColumn();

        if (!is_numeric($templateId)) {
            throw new RuntimeException('Official briefing template is unavailable.');
        }

        $briefingPublicId = internalUuidV4();
        $insertBriefing = $pdo->prepare(
            'INSERT INTO project_briefings (
                public_id, project_id, template_id, title, status
            ) VALUES (
                :public_id, :project_id, :template_id, :title, :status
            )'
        );
        $insertBriefing->execute([
            'public_id' => $briefingPublicId,
            'project_id' => $projectId,
            'template_id' => (int) $templateId,
            'title' => 'Briefing inicial - ' . $projectName,
            'status' => 'draft',
        ]);
    }

    $updateLead = $pdo->prepare(
        'UPDATE leads
         SET status = :status,
             pipeline_stage = :pipeline_stage,
             converted_to_client_id = :converted_to_client_id,
             last_contact_at = UTC_TIMESTAMP(),
             qualification_notes = :qualification_notes,
             updated_at = UTC_TIMESTAMP()
         WHERE id = :id'
    );
    $updateLead->execute([
        'status' => 'won',
        'pipeline_stage' => 'won',
        'converted_to_client_id' => $clientId,
        'qualification_notes' => $effectiveQualificationNotes,
        'id' => $lead['id'],
    ]);

    $pdo->commit();

    internalRespond(201, [
        'ok' => true,
        'leadId' => $lead['public_id'],
        'clientId' => $clientPublicId,
        'projectId' => $projectPublicId,
        'briefingId' => $briefingPublicId,
        'briefingCreated' => $briefingPublicId !== null,
    ]);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log('Modo internal API: falha ao converter lead. ' . $error->getMessage());
    internalRespond(500, ['ok' => false, 'error' => 'internal_error']);
}
