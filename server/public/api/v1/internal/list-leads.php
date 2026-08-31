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

$pipelineStage = internalOptionalQueryString('pipelineStage', 32);
if ($pipelineStage !== null) {
    $pipelineStage = internalValidateLeadPipelineStage($pipelineStage, true);
}

$limit = internalOptionalQueryInt('limit', 20, 1, 100);
$onlyTest = internalOptionalQueryString('onlyTest', 5);
$onlyTestMode = $onlyTest === 'true';

try {
    $pdo = internalConnectDatabase($config['database']);
    internalRequireAccess($pdo, $security);

    $sql = 'SELECT
                l.public_id,
                l.name,
                l.email,
                l.company_name,
                l.source,
                l.service_interest,
                l.status,
                l.pipeline_stage,
                l.last_contact_at,
                l.created_at,
                l.converted_to_client_id,
                c.public_id AS client_public_id,
                p.public_id AS project_public_id
            FROM leads l
            LEFT JOIN clients c ON c.id = l.converted_to_client_id
            LEFT JOIN projects p ON p.source_lead_id = l.id';

    $params = [];
    $conditions = [];
    if ($pipelineStage !== null) {
        $conditions[] = 'l.pipeline_stage = :pipeline_stage';
        $params['pipeline_stage'] = $pipelineStage;
    }

    if ($onlyTestMode) {
        $conditions[] = 'l.source = :source';
        $params['source'] = 'internal_e2e_test';
    }

    if ($conditions !== []) {
        $sql .= ' WHERE ' . implode(' AND ', $conditions);
    }

    $sql .= ' ORDER BY l.created_at DESC LIMIT :limit';
    $query = $pdo->prepare($sql);

    foreach ($params as $key => $value) {
        $query->bindValue(':' . $key, $value, PDO::PARAM_STR);
    }
    $query->bindValue(':limit', $limit, PDO::PARAM_INT);
    $query->execute();
    $rows = $query->fetchAll();

    $items = array_map(
        static fn (array $row): array => [
            'publicId' => $row['public_id'],
            'name' => $row['name'],
            'email' => $row['email'],
            'companyName' => $row['company_name'],
            'source' => $row['source'],
            'serviceInterest' => $row['service_interest'],
            'status' => $row['status'],
            'pipelineStage' => $row['pipeline_stage'],
            'lastContactAt' => $row['last_contact_at'],
            'createdAt' => $row['created_at'],
            'converted' => $row['converted_to_client_id'] !== null,
            'clientPublicId' => $row['client_public_id'],
            'projectPublicId' => $row['project_public_id'],
        ],
        $rows
    );

    internalRespond(200, [
        'ok' => true,
        'pipelineStage' => $pipelineStage,
        'onlyTest' => $onlyTestMode,
        'limit' => $limit,
        'count' => count($items),
        'items' => $items,
    ]);
} catch (Throwable $error) {
    error_log('Modo internal API: falha ao listar leads. ' . $error->getMessage());
    internalRespond(500, ['ok' => false, 'error' => 'internal_error']);
}
