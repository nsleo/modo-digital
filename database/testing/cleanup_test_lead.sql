-- Limpa os registros criados por um lead de teste ja convertido.
-- Antes de executar, troque o valor de @lead_public_id.
-- Use apenas para registros descartaveis.

SET NAMES utf8mb4;
SET time_zone = '+00:00';

SET @lead_public_id = 'SUBSTITUA_PELO_PUBLIC_ID_DO_LEAD';

START TRANSACTION;

SET @lead_id = (
  SELECT id
  FROM leads
  WHERE public_id = @lead_public_id
  LIMIT 1
);

SET @client_id = (
  SELECT converted_to_client_id
  FROM leads
  WHERE id = @lead_id
  LIMIT 1
);

DELETE bsa
FROM briefing_submission_answers bsa
INNER JOIN briefing_submissions bs ON bs.id = bsa.submission_id
INNER JOIN projects p ON p.id = bs.project_id
WHERE p.source_lead_id = @lead_id;

DELETE bs
FROM briefing_submissions bs
INNER JOIN projects p ON p.id = bs.project_id
WHERE p.source_lead_id = @lead_id;

DELETE pb
FROM project_briefings pb
INNER JOIN projects p ON p.id = pb.project_id
WHERE p.source_lead_id = @lead_id;

DELETE p
FROM projects p
WHERE p.source_lead_id = @lead_id;

DELETE cc
FROM client_contacts cc
WHERE cc.client_id = @client_id;

UPDATE leads
SET converted_to_client_id = NULL
WHERE id = @lead_id;

DELETE c
FROM clients c
WHERE c.id = @client_id;

DELETE FROM leads
WHERE id = @lead_id
  AND source = 'internal_e2e_test';

COMMIT;

SELECT 'cleanup_complete' AS status, @lead_public_id AS lead_public_id;
