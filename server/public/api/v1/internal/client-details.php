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

$clientPublicId = internalReadQueryString('clientId', 36);
if (!preg_match('/^[0-9a-f-]{36}$/i', $clientPublicId)) {
    internalRespond(422, ['ok' => false, 'error' => 'validation_error', 'field' => 'clientId']);
}

try {
    $pdo = internalConnectDatabase($config['database']);
    internalRequireAccess($pdo, $security);

    $clientQuery = $pdo->prepare(
        'SELECT
            id,
            public_id,
            company_name,
            trade_name,
            segment,
            primary_contact_name,
            primary_contact_email,
            primary_contact_phone,
            project_label,
            status,
            notes,
            EXISTS(
                SELECT 1
                FROM projects p2
                INNER JOIN leads l2 ON l2.id = p2.source_lead_id
                WHERE p2.client_id = clients.id
                  AND l2.source = "internal_e2e_test"
            ) AS is_test,
            created_at,
            updated_at
         FROM clients
         WHERE public_id = :public_id
         LIMIT 1'
    );
    $clientQuery->execute(['public_id' => $clientPublicId]);
    $client = $clientQuery->fetch();

    if (!is_array($client)) {
        internalRespond(404, ['ok' => false, 'error' => 'client_not_found']);
    }

    $contactsQuery = $pdo->prepare(
        'SELECT
            public_id,
            name,
            email,
            phone,
            role_label,
            is_primary,
            notes
         FROM client_contacts
         WHERE client_id = :client_id
         ORDER BY is_primary DESC, created_at ASC'
    );
    $contactsQuery->execute(['client_id' => $client['id']]);
    $contacts = $contactsQuery->fetchAll();

    $projectsQuery = $pdo->prepare(
        'SELECT
            p.public_id,
            p.name,
            p.project_type,
            p.status,
            p.started_at,
            p.updated_at,
            l.public_id AS source_lead_public_id,
            l.source AS source_lead_source,
            pb.public_id AS briefing_public_id,
            pb.status AS briefing_status
         FROM projects p
         LEFT JOIN leads l ON l.id = p.source_lead_id
         LEFT JOIN project_briefings pb ON pb.project_id = p.id
         WHERE p.client_id = :client_id
         ORDER BY p.created_at DESC'
    );
    $projectsQuery->execute(['client_id' => $client['id']]);
    $projects = $projectsQuery->fetchAll();

    internalRespond(200, [
        'ok' => true,
        'client' => [
            'publicId' => $client['public_id'],
            'companyName' => $client['company_name'],
            'tradeName' => $client['trade_name'],
            'segment' => $client['segment'],
            'primaryContactName' => $client['primary_contact_name'],
            'primaryContactEmail' => $client['primary_contact_email'],
            'primaryContactPhone' => $client['primary_contact_phone'],
            'projectLabel' => $client['project_label'],
            'status' => $client['status'],
            'isTest' => (int) $client['is_test'] === 1,
            'notes' => $client['notes'],
            'createdAt' => $client['created_at'],
            'updatedAt' => $client['updated_at'],
        ],
        'contacts' => array_map(
            static fn (array $row): array => [
                'publicId' => $row['public_id'],
                'name' => $row['name'],
                'email' => $row['email'],
                'phone' => $row['phone'],
                'roleLabel' => $row['role_label'],
                'isPrimary' => (int) $row['is_primary'] === 1,
                'notes' => $row['notes'],
            ],
            $contacts
        ),
        'projects' => array_map(
            static fn (array $row): array => [
                'publicId' => $row['public_id'],
                'name' => $row['name'],
                'projectType' => $row['project_type'],
                'status' => $row['status'],
                'startedAt' => $row['started_at'],
                'updatedAt' => $row['updated_at'],
                'sourceLeadPublicId' => $row['source_lead_public_id'],
                'sourceLeadSource' => $row['source_lead_source'],
                'briefingPublicId' => $row['briefing_public_id'],
                'briefingStatus' => $row['briefing_status'],
                'isTest' => $row['source_lead_source'] === 'internal_e2e_test',
            ],
            $projects
        ),
    ]);
} catch (Throwable $error) {
    error_log('Modo internal API: falha ao consultar client. ' . $error->getMessage());
    internalRespond(500, ['ok' => false, 'error' => 'internal_error']);
}
