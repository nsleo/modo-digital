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

$limit = internalOptionalQueryInt('limit', 20, 1, 100);
$projectStatus = internalOptionalQueryString('projectStatus', 32);
$briefingStatus = internalOptionalQueryString('briefingStatus', 32);
$onlyTest = internalOptionalQueryString('onlyTest', 5);
$onlyTestMode = $onlyTest === 'true';

if ($projectStatus !== null) {
    $projectStatus = internalValidateProjectStatus($projectStatus);
}

if ($briefingStatus !== null) {
    $briefingStatus = internalValidateBriefingStatus($briefingStatus);
}

try {
    $pdo = internalConnectDatabase($config['database']);
    internalRequireAccess($pdo, $security);

    $sql = 'SELECT
            p.public_id,
            p.name,
            p.project_type,
            p.status,
            p.started_at,
            p.updated_at,
            c.public_id AS client_public_id,
            c.company_name AS client_company_name,
            l.public_id AS source_lead_public_id,
            l.source AS source_lead_source,
            pb.public_id AS briefing_public_id,
            pb.status AS briefing_status
         FROM projects p
         INNER JOIN clients c ON c.id = p.client_id
         LEFT JOIN leads l ON l.id = p.source_lead_id
         LEFT JOIN project_briefings pb ON pb.project_id = p.id';

    $conditions = [];
    $bindings = [];

    if ($projectStatus !== null) {
        $conditions[] = 'p.status = :project_status';
        $bindings['project_status'] = $projectStatus;
    }

    if ($briefingStatus !== null) {
        $conditions[] = 'pb.status = :briefing_status';
        $bindings['briefing_status'] = $briefingStatus;
    }

    if ($onlyTestMode) {
        $conditions[] = 'l.source = :source_lead_source';
        $bindings['source_lead_source'] = 'internal_e2e_test';
    }

    if ($conditions !== []) {
        $sql .= ' WHERE ' . implode(' AND ', $conditions);
    }

    $sql .= ' ORDER BY p.created_at DESC LIMIT :limit';

    $query = $pdo->prepare($sql);
    foreach ($bindings as $key => $value) {
        $query->bindValue(':' . $key, $value, PDO::PARAM_STR);
    }
    $query->bindValue(':limit', $limit, PDO::PARAM_INT);
    $query->execute();
    $rows = $query->fetchAll();

    $items = array_map(
        static fn (array $row): array => [
            'publicId' => $row['public_id'],
            'name' => $row['name'],
            'projectType' => $row['project_type'],
            'status' => $row['status'],
            'startedAt' => $row['started_at'],
            'updatedAt' => $row['updated_at'],
            'clientPublicId' => $row['client_public_id'],
            'clientCompanyName' => $row['client_company_name'],
            'sourceLeadPublicId' => $row['source_lead_public_id'],
            'sourceLeadSource' => $row['source_lead_source'],
            'briefingPublicId' => $row['briefing_public_id'],
            'briefingStatus' => $row['briefing_status'],
            'isTest' => $row['source_lead_source'] === 'internal_e2e_test',
        ],
        $rows
    );

    internalRespond(200, [
        'ok' => true,
        'limit' => $limit,
        'projectStatus' => $projectStatus,
        'briefingStatus' => $briefingStatus,
        'onlyTest' => $onlyTestMode,
        'count' => count($items),
        'items' => $items,
    ]);
} catch (Throwable $error) {
    error_log('Modo internal API: falha ao listar projects. ' . $error->getMessage());
    internalRespond(500, ['ok' => false, 'error' => 'internal_error']);
}
