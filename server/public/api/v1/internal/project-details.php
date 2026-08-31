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

$projectPublicId = internalReadQueryString('projectId', 36);
if (!preg_match('/^[0-9a-f-]{36}$/i', $projectPublicId)) {
    internalRespond(422, ['ok' => false, 'error' => 'validation_error', 'field' => 'projectId']);
}

try {
    $pdo = internalConnectDatabase($config['database']);
    internalRequireAccess($pdo, $security);

    $query = $pdo->prepare(
        'SELECT
            p.id,
            p.public_id,
            p.name,
            p.project_type,
            p.status,
            p.summary,
            p.started_at,
            p.target_launch_at,
            p.created_at,
            p.updated_at,
            c.public_id AS client_public_id,
            c.company_name AS client_company_name,
            c.primary_contact_name,
            c.primary_contact_email,
            c.primary_contact_phone,
            l.public_id AS source_lead_public_id,
            l.source AS source_lead_source,
            pb.public_id AS briefing_public_id,
            pb.title AS briefing_title,
            pb.status AS briefing_status,
            pb.last_sent_at,
            pb.id AS briefing_id,
            pb.template_id AS briefing_template_id
         FROM projects p
         INNER JOIN clients c ON c.id = p.client_id
         LEFT JOIN leads l ON l.id = p.source_lead_id
         LEFT JOIN project_briefings pb ON pb.project_id = p.id
         WHERE p.public_id = :public_id
         LIMIT 1'
    );
    $query->execute(['public_id' => $projectPublicId]);
    $row = $query->fetch();

    if (!is_array($row)) {
        internalRespond(404, ['ok' => false, 'error' => 'project_not_found']);
    }

    $briefingTemplate = null;
    $briefingResponse = null;

    if ($row['briefing_id'] !== null && $row['briefing_template_id'] !== null) {
        $templateMeta = $pdo->prepare(
            'SELECT public_id, slug, name, version
             FROM briefing_templates
             WHERE id = :id
             LIMIT 1'
        );
        $templateMeta->execute(['id' => (int) $row['briefing_template_id']]);
        $templateRow = $templateMeta->fetch();

        $templateFields = $pdo->prepare(
            'SELECT
                s.step_key,
                s.title AS step_title,
                s.position AS step_position,
                f.field_key,
                f.label,
                f.field_type,
                f.options_json,
                f.position AS field_position
             FROM briefing_template_steps s
             INNER JOIN briefing_template_fields f ON f.step_id = s.id
             WHERE s.template_id = :template_id
             ORDER BY s.position ASC, f.position ASC'
        );
        $templateFields->execute(['template_id' => (int) $row['briefing_template_id']]);

        $steps = [];
        while ($fieldRow = $templateFields->fetch()) {
            $stepKey = (string) $fieldRow['step_key'];
            if (!isset($steps[$stepKey])) {
                $steps[$stepKey] = [
                    'key' => $stepKey,
                    'title' => $fieldRow['step_title'],
                    'position' => (int) $fieldRow['step_position'],
                    'fields' => [],
                ];
            }

            $steps[$stepKey]['fields'][] = [
                'key' => $fieldRow['field_key'],
                'label' => $fieldRow['label'],
                'type' => $fieldRow['field_type'],
                'options' => json_decode((string) ($fieldRow['options_json'] ?? 'null'), true),
                'position' => (int) $fieldRow['field_position'],
            ];
        }

        if (is_array($templateRow)) {
            $briefingTemplate = [
                'publicId' => $templateRow['public_id'],
                'slug' => $templateRow['slug'],
                'name' => $templateRow['name'],
                'version' => (int) $templateRow['version'],
                'steps' => array_values($steps),
            ];
        }

        $submission = $pdo->prepare(
            'SELECT public_id, answers_json, submitted_at
             FROM briefing_submissions
             WHERE project_briefing_id = :project_briefing_id
               AND status = :status
             ORDER BY submitted_at DESC, id DESC
             LIMIT 1'
        );
        $submission->execute([
            'project_briefing_id' => (int) $row['briefing_id'],
            'status' => 'submitted',
        ]);
        $submissionRow = $submission->fetch();

        if (is_array($submissionRow)) {
            $briefingResponse = [
                'publicId' => $submissionRow['public_id'],
                'answers' => json_decode((string) $submissionRow['answers_json'], true),
                'submittedAt' => $submissionRow['submitted_at'],
            ];
        } else {
            $legacySubmission = $pdo->prepare(
                'SELECT br.public_id, br.payload_json, br.submitted_at
                 FROM briefing_invites bi
                 INNER JOIN briefing_responses br ON br.invite_id = bi.id
                 WHERE bi.project_briefing_id = :project_briefing_id
                 ORDER BY br.submitted_at DESC, br.id DESC
                 LIMIT 1'
            );
            $legacySubmission->execute([
                'project_briefing_id' => (int) $row['briefing_id'],
            ]);
            $legacyRow = $legacySubmission->fetch();

            if (is_array($legacyRow)) {
                $briefingResponse = [
                    'publicId' => $legacyRow['public_id'],
                    'answers' => json_decode((string) $legacyRow['payload_json'], true),
                    'submittedAt' => $legacyRow['submitted_at'],
                ];
            }
        }
    }

    internalRespond(200, [
        'ok' => true,
        'project' => [
            'publicId' => $row['public_id'],
            'name' => $row['name'],
            'projectType' => $row['project_type'],
            'status' => $row['status'],
            'summary' => $row['summary'],
            'startedAt' => $row['started_at'],
            'targetLaunchAt' => $row['target_launch_at'],
            'createdAt' => $row['created_at'],
            'updatedAt' => $row['updated_at'],
        ],
        'client' => [
            'publicId' => $row['client_public_id'],
            'companyName' => $row['client_company_name'],
            'primaryContactName' => $row['primary_contact_name'],
            'primaryContactEmail' => $row['primary_contact_email'],
            'primaryContactPhone' => $row['primary_contact_phone'],
        ],
        'sourceLead' => $row['source_lead_public_id'] !== null ? [
            'publicId' => $row['source_lead_public_id'],
            'source' => $row['source_lead_source'],
            'isTest' => $row['source_lead_source'] === 'internal_e2e_test',
        ] : null,
        'briefing' => $row['briefing_public_id'] !== null ? [
            'publicId' => $row['briefing_public_id'],
            'title' => $row['briefing_title'],
            'status' => $row['briefing_status'],
            'lastSentAt' => $row['last_sent_at'],
        ] : null,
        'canCleanupTest' => $row['source_lead_source'] === 'internal_e2e_test' && $row['source_lead_public_id'] !== null,
        'briefingTemplate' => $briefingTemplate,
        'briefingResponse' => $briefingResponse,
    ]);
} catch (Throwable $error) {
    error_log('Modo internal API: falha ao consultar project. ' . $error->getMessage());
    internalRespond(500, ['ok' => false, 'error' => 'internal_error']);
}
