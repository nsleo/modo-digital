-- Cria um lead descartavel para testar POST /api/v1/internal/convert-lead.php
-- Execute no phpMyAdmin do banco alvo e copie o public_id retornado no final.

SET NAMES utf8mb4;
SET time_zone = '+00:00';

SET @test_lead_id = UUID();

INSERT INTO leads (
  public_id,
  name,
  email,
  phone,
  company_name,
  service_interest,
  message,
  status,
  source,
  privacy_accepted_at,
  consent_version
) VALUES (
  @test_lead_id,
  'Lead Teste Operacional',
  CONCAT('teste+', UNIX_TIMESTAMP(), '@example.com'),
  '11999999999',
  'Empresa Teste Modo',
  'institutional_site',
  'Lead descartavel para teste da conversao.',
  'new',
  'internal_e2e_test',
  UTC_TIMESTAMP(),
  'test-v1'
);

SELECT @test_lead_id AS public_id;
