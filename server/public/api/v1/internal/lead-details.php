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

$leadPublicId = internalReadQueryString('leadId', 36);
if (!preg_match('/^[0-9a-f-]{36}$/i', $leadPublicId)) {
    internalRespond(422, ['ok' => false, 'error' => 'validation_error', 'field' => 'leadId']);
}

try {
    $pdo = internalConnectDatabase($config['database']);
    internalRequireAccess($pdo, $security);

    $query = $pdo->prepare(
        'SELECT
            l.id,
            l.public_id,
            l.name,
            l.email,
            l.phone,
            l.company_name,
            l.source,
            l.service_interest,
            l.status,
            l.pipeline_stage,
            l.assigned_admin_user_id,
            l.converted_to_client_id,
            l.last_contact_at,
            l.qualification_notes,
            l.created_at,
            l.updated_at,
            c.public_id AS client_public_id,
            c.company_name AS client_company_name,
            c.status AS client_status,
            p.public_id AS project_public_id,
            p.name AS project_name,
            p.project_type,
            p.status AS project_status,
            pb.public_id AS briefing_public_id,
            pb.status AS briefing_status,
            pb.title AS briefing_title
         FROM leads l
         LEFT JOIN clients c ON c.id = l.converted_to_client_id
         LEFT JOIN projects p ON p.source_lead_id = l.id
         LEFT JOIN project_briefings pb ON pb.project_id = p.id
         WHERE l.public_id = :public_id
         LIMIT 1'
    );
    $query->execute(['public_id' => $leadPublicId]);
    $row = $query->fetch();

    if (!is_array($row)) {
        internalRespond(404, ['ok' => false, 'error' => 'lead_not_found']);
    }

    internalRespond(200, [
        'ok' => true,
        'lead' => [
            'publicId' => $row['public_id'],
            'name' => $row['name'],
            'email' => $row['email'],
            'phone' => $row['phone'],
            'companyName' => $row['company_name'],
            'source' => $row['source'],
            'serviceInterest' => $row['service_interest'],
            'status' => $row['status'],
            'pipelineStage' => $row['pipeline_stage'],
            'assignedAdminUserId' => $row['assigned_admin_user_id'] !== null ? (int) $row['assigned_admin_user_id'] : null,
            'converted' => $row['converted_to_client_id'] !== null,
            'lastContactAt' => $row['last_contact_at'],
            'qualificationNotes' => $row['qualification_notes'],
            'createdAt' => $row['created_at'],
            'updatedAt' => $row['updated_at'],
        ],
        'client' => $row['client_public_id'] !== null ? [
            'publicId' => $row['client_public_id'],
            'companyName' => $row['client_company_name'],
            'status' => $row['client_status'],
        ] : null,
        'project' => $row['project_public_id'] !== null ? [
            'publicId' => $row['project_public_id'],
            'name' => $row['project_name'],
            'projectType' => $row['project_type'],
            'status' => $row['project_status'],
        ] : null,
        'briefing' => $row['briefing_public_id'] !== null ? [
            'publicId' => $row['briefing_public_id'],
            'title' => $row['briefing_title'],
            'status' => $row['briefing_status'],
        ] : null,
    ]);
} catch (Throwable $error) {
    error_log('Modo internal API: falha ao consultar lead. ' . $error->getMessage());
    internalRespond(500, ['ok' => false, 'error' => 'internal_error']);
}
