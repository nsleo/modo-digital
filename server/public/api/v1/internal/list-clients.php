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
$onlyTest = internalOptionalQueryString('onlyTest', 5);
$onlyTestMode = $onlyTest === 'true';

try {
    $pdo = internalConnectDatabase($config['database']);
    internalRequireAccess($pdo, $security);

    $sql = 'SELECT
            c.public_id,
            c.company_name,
            c.trade_name,
            c.segment,
            c.primary_contact_name,
            c.primary_contact_email,
            c.primary_contact_phone,
            c.project_label,
            c.status,
            c.created_at,
            MAX(CASE WHEN l.source = "internal_e2e_test" THEN 1 ELSE 0 END) AS has_test_project,
            COUNT(DISTINCT p.id) AS project_count,
            MAX(p.updated_at) AS last_project_at
         FROM clients c
         LEFT JOIN projects p ON p.client_id = c.id
         LEFT JOIN leads l ON l.id = p.source_lead_id
         GROUP BY
            c.id,
            c.public_id,
            c.company_name,
            c.trade_name,
            c.segment,
            c.primary_contact_name,
            c.primary_contact_email,
            c.primary_contact_phone,
            c.project_label,
            c.status,
            c.created_at';

    if ($onlyTestMode) {
        $sql .= '
         HAVING MAX(CASE WHEN l.source = "internal_e2e_test" THEN 1 ELSE 0 END) = 1';
    }

    $sql .= '
         ORDER BY c.created_at DESC
         LIMIT :limit';

    $query = $pdo->prepare($sql);
    $query->bindValue(':limit', $limit, PDO::PARAM_INT);
    $query->execute();
    $rows = $query->fetchAll();

    $items = array_map(
        static fn (array $row): array => [
            'publicId' => $row['public_id'],
            'companyName' => $row['company_name'],
            'tradeName' => $row['trade_name'],
            'segment' => $row['segment'],
            'primaryContactName' => $row['primary_contact_name'],
            'primaryContactEmail' => $row['primary_contact_email'],
            'primaryContactPhone' => $row['primary_contact_phone'],
            'projectLabel' => $row['project_label'],
            'status' => $row['status'],
            'isTest' => (int) $row['has_test_project'] === 1,
            'projectCount' => (int) $row['project_count'],
            'lastProjectAt' => $row['last_project_at'],
            'createdAt' => $row['created_at'],
        ],
        $rows
    );

    internalRespond(200, [
        'ok' => true,
        'limit' => $limit,
        'onlyTest' => $onlyTestMode,
        'count' => count($items),
        'items' => $items,
    ]);
} catch (Throwable $error) {
    error_log('Modo internal API: falha ao listar clients. ' . $error->getMessage());
    internalRespond(500, ['ok' => false, 'error' => 'internal_error']);
}
