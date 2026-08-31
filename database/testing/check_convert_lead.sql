-- Confere se um lead de teste foi convertido corretamente.
-- Antes de executar, troque o valor de @lead_public_id.

SET NAMES utf8mb4;
SET time_zone = '+00:00';

SET @lead_public_id = 'SUBSTITUA_PELO_PUBLIC_ID_DO_LEAD';

SELECT
  l.public_id AS lead_public_id,
  l.pipeline_stage,
  l.converted_to_client_id,
  c.public_id AS client_public_id,
  p.public_id AS project_public_id,
  pb.public_id AS briefing_public_id,
  pb.status AS briefing_status
FROM leads l
LEFT JOIN clients c ON c.id = l.converted_to_client_id
LEFT JOIN projects p ON p.source_lead_id = l.id
LEFT JOIN project_briefings pb ON pb.project_id = p.id
WHERE l.public_id = @lead_public_id;
