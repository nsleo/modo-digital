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
$pipelineStage = internalValidateLeadPipelineStage(internalRequiredString($payload, 'pipelineStage', 32));
$markContacted = internalOptionalBool($payload, 'markContacted', false);
$assignedAdminUserId = internalOptionalNullableInt($payload, 'assignedAdminUserId');
$hasAssignedAdminUserId = array_key_exists('assignedAdminUserId', $payload);
$hasQualificationNotes = array_key_exists('qualificationNotes', $payload);
$qualificationNotes = null;

if ($hasQualificationNotes) {
    $rawQualificationNotes = $payload['qualificationNotes'];
    if ($rawQualificationNotes === null) {
        $qualificationNotes = null;
    } else {
        $qualificationNotes = trim((string) $rawQualificationNotes);
        if (mb_strlen($qualificationNotes) > 5000) {
            internalRespond(422, ['ok' => false, 'error' => 'validation_error', 'field' => 'qualificationNotes']);
        }
        if ($qualificationNotes === '') {
            $qualificationNotes = null;
        }
    }
}

if (!preg_match('/^[0-9a-f-]{36}$/i', $leadPublicId)) {
    internalRespond(422, ['ok' => false, 'error' => 'validation_error', 'field' => 'leadId']);
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
    internalRequireAccess($pdo, $security);
    $pdo->beginTransaction();

    $leadQuery = $pdo->prepare(
        'SELECT id, public_id, pipeline_stage, status, converted_to_client_id,
                assigned_admin_user_id, last_contact_at, qualification_notes
         FROM leads
         WHERE public_id = :public_id
         LIMIT 1
         FOR UPDATE'
    );
    $leadQuery->execute(['public_id' => $leadPublicId]);
    $lead = $leadQuery->fetch();

    if (!is_array($lead)) {
        internalRespond(404, ['ok' => false, 'error' => 'lead_not_found']);
    }

    if (($lead['converted_to_client_id'] ?? null) !== null) {
        internalRespond(409, ['ok' => false, 'error' => 'lead_already_converted']);
    }

    $currentStage = (string) ($lead['pipeline_stage'] ?? 'incoming');
    if ($currentStage === 'archived' && $pipelineStage !== 'archived') {
        internalRespond(409, ['ok' => false, 'error' => 'lead_archived']);
    }

    if ($currentStage === 'lost' && !in_array($pipelineStage, ['lost', 'archived'], true)) {
        internalRespond(409, ['ok' => false, 'error' => 'lead_lost']);
    }

    $effectiveAssignedAdminUserId = $hasAssignedAdminUserId
        ? $assignedAdminUserId
        : (($lead['assigned_admin_user_id'] ?? null) !== null ? (int) $lead['assigned_admin_user_id'] : null);

    if ($hasAssignedAdminUserId && $assignedAdminUserId !== null) {
        $adminQuery = $pdo->prepare(
            'SELECT id
             FROM admin_users
             WHERE id = :id
             LIMIT 1'
        );
        $adminQuery->execute(['id' => $assignedAdminUserId]);
        $adminExists = $adminQuery->fetchColumn();

        if (!is_numeric($adminExists)) {
            internalRespond(422, ['ok' => false, 'error' => 'validation_error', 'field' => 'assignedAdminUserId']);
        }
    }

    $effectiveQualificationNotes = $hasQualificationNotes
        ? $qualificationNotes
        : (is_string($lead['qualification_notes'] ?? null) ? $lead['qualification_notes'] : null);

    $updateLead = $pdo->prepare(
        'UPDATE leads
         SET status = :status,
             pipeline_stage = :pipeline_stage,
             assigned_admin_user_id = :assigned_admin_user_id,
             qualification_notes = :qualification_notes,
             last_contact_at = CASE
                 WHEN :mark_contacted = 1 THEN UTC_TIMESTAMP()
                 ELSE last_contact_at
             END,
             updated_at = UTC_TIMESTAMP()
         WHERE id = :id'
    );
    $updateLead->execute([
        'status' => $statusMap[$pipelineStage],
        'pipeline_stage' => $pipelineStage,
        'assigned_admin_user_id' => $effectiveAssignedAdminUserId,
        'qualification_notes' => $effectiveQualificationNotes,
        'mark_contacted' => $markContacted ? 1 : 0,
        'id' => $lead['id'],
    ]);

    $resultQuery = $pdo->prepare(
        'SELECT public_id, pipeline_stage, status, assigned_admin_user_id,
                converted_to_client_id, qualification_notes, last_contact_at
         FROM leads
         WHERE id = :id
         LIMIT 1'
    );
    $resultQuery->execute(['id' => $lead['id']]);
    $result = $resultQuery->fetch();

    $pdo->commit();

    internalRespond(200, [
        'ok' => true,
        'leadId' => $result['public_id'],
        'pipelineStage' => $result['pipeline_stage'],
        'status' => $result['status'],
        'assignedAdminUserId' => $result['assigned_admin_user_id'] !== null ? (int) $result['assigned_admin_user_id'] : null,
        'qualificationNotes' => $result['qualification_notes'],
        'lastContactAt' => $result['last_contact_at'],
        'markContactedApplied' => $markContacted,
        'converted' => ($result['converted_to_client_id'] ?? null) !== null,
    ]);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log('Modo internal API: falha ao atualizar lead. ' . $error->getMessage());
    internalRespond(500, ['ok' => false, 'error' => 'internal_error']);
}
