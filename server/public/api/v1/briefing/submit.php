<?php

declare(strict_types=1);

require __DIR__ . DIRECTORY_SEPARATOR . '_bootstrap.php';

$config = briefingLoadConfig();
$security = $config['security'];
briefingConfigureCors(is_array($security['allowed_origins'] ?? null) ? $security['allowed_origins'] : []);

$method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($method !== 'POST') {
    header('Allow: POST, OPTIONS');
    briefingRespond(405, ['ok' => false, 'error' => 'method_not_allowed']);
}

$payload = briefingReadJsonBody();
$invitePublicId = briefingRequiredString($payload, 'inviteId', 36);
$token = briefingRequiredString($payload, 'token', 255);
$answers = briefingOptionalAssocArray($payload, 'answers');

try {
    $pdo = briefingConnectDatabase($config['database']);
    $invite = briefingFetchInvite($pdo, $invitePublicId, $token);

    if ($answers === []) {
        $answers = [
            'overview' => briefingRequiredString($payload, 'overview', 5000),
            'mainObjective' => briefingRequiredString($payload, 'mainObjective', 5000),
            'audience' => briefingRequiredString($payload, 'audience', 5000),
            'offerSummary' => briefingRequiredString($payload, 'offerSummary', 5000),
            'references' => briefingOptionalString($payload, 'references', 5000) ?? '',
            'brandAssets' => briefingOptionalString($payload, 'brandAssets', 5000) ?? '',
            'technicalNotes' => briefingOptionalString($payload, 'technicalNotes', 5000) ?? '',
            'deadline' => briefingOptionalString($payload, 'deadline', 160) ?? '',
            'additionalNotes' => briefingOptionalString($payload, 'additionalNotes', 5000) ?? '',
            'priorityItems' => briefingOptionalArray($payload, 'priorityItems'),
        ];
    }

    $template = null;
    if (($invite['template_id'] ?? null) !== null) {
        $template = briefingFetchTemplate($pdo, (int) $invite['template_id']);
    }

    if ($template !== null) {
        $answers = briefingValidateAnswers($template, $answers);
    }

    $responsePublicId = briefingUuidV4();
    $payloadJson = json_encode($answers, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    $pdo->beginTransaction();

    $existing = $pdo->prepare('SELECT id FROM briefing_responses WHERE invite_id = :invite_id LIMIT 1');
    $existing->execute(['invite_id' => $invite['id']]);
    $existingId = $existing->fetchColumn();

    if (is_numeric($existingId)) {
        $update = $pdo->prepare(
            'UPDATE briefing_responses
             SET payload_json = :payload_json,
                 status = :status,
                 submitted_at = UTC_TIMESTAMP()
             WHERE id = :id'
        );
        $update->execute([
            'payload_json' => $payloadJson,
            'status' => 'submitted',
            'id' => $existingId,
        ]);
    } else {
        $insert = $pdo->prepare(
            'INSERT INTO briefing_responses (
                public_id, client_id, invite_id, response_version, payload_json, status, submitted_at
            ) VALUES (
                :public_id, :client_id, :invite_id, :response_version, :payload_json, :status, UTC_TIMESTAMP()
            )'
        );
        $insert->execute([
            'public_id' => $responsePublicId,
            'client_id' => $invite['client_id'],
            'invite_id' => $invite['id'],
            'response_version' => 1,
            'payload_json' => $payloadJson,
            'status' => 'submitted',
        ]);
    }

    if (($invite['project_briefing_id'] ?? null) !== null && ($invite['project_id'] ?? null) !== null && ($invite['template_id'] ?? null) !== null) {
        $existingStructured = $pdo->prepare(
            'SELECT id
             FROM briefing_submissions
             WHERE project_briefing_id = :project_briefing_id
               AND status = :status
             ORDER BY submitted_at DESC, id DESC
             LIMIT 1'
        );
        $existingStructured->execute([
            'project_briefing_id' => (int) $invite['project_briefing_id'],
            'status' => 'submitted',
        ]);
        $existingStructuredId = $existingStructured->fetchColumn();

        if (is_numeric($existingStructuredId)) {
            $updateStructured = $pdo->prepare(
                'UPDATE briefing_submissions
                 SET answers_json = :answers_json,
                     submitted_at = UTC_TIMESTAMP(),
                     updated_at = UTC_TIMESTAMP()
                 WHERE id = :id'
            );
            $updateStructured->execute([
                'answers_json' => $payloadJson,
                'id' => (int) $existingStructuredId,
            ]);
            $submissionId = (int) $existingStructuredId;
        } else {
            $structuredPublicId = briefingUuidV4();
            $insertStructured = $pdo->prepare(
                'INSERT INTO briefing_submissions (
                    public_id, project_briefing_id, project_id, template_id, response_version, status, submitted_by_type, answers_json, submitted_at
                 ) VALUES (
                    :public_id, :project_briefing_id, :project_id, :template_id, :response_version, :status, :submitted_by_type, :answers_json, UTC_TIMESTAMP()
                 )'
            );
            $insertStructured->execute([
                'public_id' => $structuredPublicId,
                'project_briefing_id' => (int) $invite['project_briefing_id'],
                'project_id' => (int) $invite['project_id'],
                'template_id' => (int) $invite['template_id'],
                'response_version' => 1,
                'status' => 'submitted',
                'submitted_by_type' => 'client',
                'answers_json' => $payloadJson,
            ]);
            $submissionId = (int) $pdo->lastInsertId();
        }

        if ($template !== null) {
            foreach ($template['steps'] as $step) {
                foreach ($step['fields'] as $field) {
                    $fieldKey = (string) $field['key'];
                    if (!array_key_exists($fieldKey, $answers)) {
                        continue;
                    }

                    $answerValue = $answers[$fieldKey];
                    $answerText = is_array($answerValue) ? null : ($answerValue !== '' ? (string) $answerValue : null);
                    $answerJson = is_array($answerValue)
                        ? json_encode($answerValue, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
                        : null;

                    $upsertAnswer = $pdo->prepare(
                        'INSERT INTO briefing_submission_answers (
                            submission_id, field_id, field_key, answer_text, answer_json
                         ) VALUES (
                            :submission_id, :field_id, :field_key, :answer_text, :answer_json
                         )
                         ON DUPLICATE KEY UPDATE
                            field_id = VALUES(field_id),
                            answer_text = VALUES(answer_text),
                            answer_json = VALUES(answer_json),
                            updated_at = CURRENT_TIMESTAMP()'
                    );
                    $upsertAnswer->execute([
                        'submission_id' => $submissionId,
                        'field_id' => (int) $field['id'],
                        'field_key' => $fieldKey,
                        'answer_text' => $answerText,
                        'answer_json' => $answerJson,
                    ]);
                }
            }
        }
    }

    $complete = $pdo->prepare(
        'UPDATE briefing_invites
         SET status = :status,
             completed_at = UTC_TIMESTAMP(),
             updated_at = UTC_TIMESTAMP()
         WHERE id = :id'
    );
    $complete->execute([
        'status' => 'completed',
        'id' => $invite['id'],
    ]);

    if (($invite['project_briefing_id'] ?? null) !== null) {
        $projectBriefing = $pdo->prepare(
            'UPDATE project_briefings
             SET status = :status,
                 submitted_at = UTC_TIMESTAMP(),
                 updated_at = UTC_TIMESTAMP()
             WHERE id = :id'
        );
        $projectBriefing->execute([
            'status' => 'submitted',
            'id' => (int) $invite['project_briefing_id'],
        ]);
    }

    $pdo->commit();

    briefingSendNotificationEmail(
        $config,
        $invite,
        $template,
        $answers,
        gmdate('Y-m-d H:i:s')
    );

    briefingRespond(201, ['ok' => true]);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log('Modo briefing API: falha ao salvar briefing. ' . $error->getMessage());
    briefingRespond(500, ['ok' => false, 'error' => 'internal_error']);
}
