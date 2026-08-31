-- Simula um briefing respondido para um projeto ja existente.
-- Use para validar painel, estados e leitura da resposta sem preencher a tela.
-- Antes de executar, troque o valor de @project_public_id.

SET NAMES utf8mb4;
SET time_zone = '+00:00';

SET @project_public_id = '192fdb08-66e5-4746-8072-719dcbbbb130';

START TRANSACTION;

SET @project_id = (
  SELECT id
  FROM projects
  WHERE public_id = @project_public_id
  LIMIT 1
);

SET @project_name = (
  SELECT name
  FROM projects
  WHERE id = @project_id
  LIMIT 1
);

SET @project_briefing_id = (
  SELECT id
  FROM project_briefings
  WHERE project_id = @project_id
  LIMIT 1
);

SET @template_id = (
  SELECT template_id
  FROM project_briefings
  WHERE id = @project_briefing_id
  LIMIT 1
);

SET @submission_public_id = UUID();

SET @answers_json = JSON_OBJECT(
  'company_name', 'Empresa Teste Modo',
  'company_segment', 'Prestacao de servicos',
  'project_contact_name', 'Contato Operacional',
  'project_contact_whatsapp', '(51) 99999-9999',
  'project_contact_email', 'contato@example.com',
  'has_current_site', 'yes',
  'current_site_url', 'https://empresa-exemplo.com.br',
  'project_type', 'institutional_site',
  'primary_goal', 'professional_presence',
  'goal_outcome_sentence', CONCAT('Validacao operacional do briefing para ', COALESCE(@project_name, 'projeto existente'), '.'),
  'primary_visitor_action', 'whatsapp',
  'company_summary', 'Empresa focada em atendimento comercial e geracao de confianca online.',
  'priority_services', 'Servico A e consultoria.',
  'main_differentials', 'Atendimento rapido, experiencia pratica e clareza comercial.',
  'common_objections', 'O cliente geralmente compara preco antes de entender a diferenca de estrutura.',
  'ideal_customer', 'Empresas locais e negocios de servico que precisam parecer mais profissionais.',
  'required_sections', 'Home, sobre, servicos, prova social e contato.',
  'mandatory_information', 'WhatsApp, e-mail, cidade, servicos principais e formulario.',
  'has_social_proof', 'yes',
  'social_proof_details', 'Depoimentos curtos e alguns clientes atendidos.',
  'has_logo', 'yes',
  'logo_assets', 'Logo disponivel no Drive interno.',
  'brand_definition_status', 'partial',
  'visual_style', 'Visual sobrio, tecnico e com cara de empresa organizada.',
  'reference_site', 'https://vercel.com - gosto da clareza e organizacao.',
  'visual_avoidances', 'Evitar excesso de animacao e blocos muito apertados.',
  'required_features', 'Formulario, CTA de WhatsApp, SEO basico e links sociais.',
  'needs_lead_capture', 'yes',
  'lead_form_fields', 'Nome, e-mail, WhatsApp, empresa e mensagem.',
  'external_integrations', 'WhatsApp e Google Maps.',
  'has_domain', 'yes',
  'has_hosting', 'no',
  'access_owners', 'Diretor comercial e responsavel de TI.',
  'launch_deadline', 'Sem data fixa, mas ideal em ate 30 dias.',
  'approver_name', 'Diretor comercial',
  'credit_and_portfolio_permissions', JSON_ARRAY('footer_credit', 'public_portfolio'),
  'project_notes', 'Briefing simulado via SQL para validacao operacional.'
);

INSERT INTO briefing_submissions (
  public_id,
  project_briefing_id,
  project_id,
  template_id,
  response_version,
  status,
  submitted_by_type,
  answers_json,
  submitted_at
) VALUES (
  @submission_public_id,
  @project_briefing_id,
  @project_id,
  @template_id,
  1,
  'submitted',
  'client',
  @answers_json,
  UTC_TIMESTAMP()
);

SET @submission_id = LAST_INSERT_ID();

DELETE FROM briefing_submission_answers
WHERE submission_id = @submission_id;

INSERT INTO briefing_submission_answers (submission_id, field_id, field_key, answer_text, answer_json)
SELECT
  @submission_id,
  f.id,
  f.field_key,
  CASE
    WHEN f.field_key = 'company_name' THEN 'Empresa Teste Modo'
    WHEN f.field_key = 'company_segment' THEN 'Prestacao de servicos'
    WHEN f.field_key = 'project_contact_name' THEN 'Contato Operacional'
    WHEN f.field_key = 'project_contact_whatsapp' THEN '(51) 99999-9999'
    WHEN f.field_key = 'project_contact_email' THEN 'contato@example.com'
    WHEN f.field_key = 'has_current_site' THEN 'yes'
    WHEN f.field_key = 'current_site_url' THEN 'https://empresa-exemplo.com.br'
    WHEN f.field_key = 'project_type' THEN 'institutional_site'
    WHEN f.field_key = 'primary_goal' THEN 'professional_presence'
    WHEN f.field_key = 'goal_outcome_sentence' THEN CONCAT('Validacao operacional do briefing para ', COALESCE(@project_name, 'projeto existente'), '.')
    WHEN f.field_key = 'primary_visitor_action' THEN 'whatsapp'
    WHEN f.field_key = 'company_summary' THEN 'Empresa focada em atendimento comercial e geracao de confianca online.'
    WHEN f.field_key = 'priority_services' THEN 'Servico A e consultoria.'
    WHEN f.field_key = 'main_differentials' THEN 'Atendimento rapido, experiencia pratica e clareza comercial.'
    WHEN f.field_key = 'common_objections' THEN 'O cliente geralmente compara preco antes de entender a diferenca de estrutura.'
    WHEN f.field_key = 'ideal_customer' THEN 'Empresas locais e negocios de servico que precisam parecer mais profissionais.'
    WHEN f.field_key = 'required_sections' THEN 'Home, sobre, servicos, prova social e contato.'
    WHEN f.field_key = 'mandatory_information' THEN 'WhatsApp, e-mail, cidade, servicos principais e formulario.'
    WHEN f.field_key = 'has_social_proof' THEN 'yes'
    WHEN f.field_key = 'social_proof_details' THEN 'Depoimentos curtos e alguns clientes atendidos.'
    WHEN f.field_key = 'has_logo' THEN 'yes'
    WHEN f.field_key = 'logo_assets' THEN 'Logo disponivel no Drive interno.'
    WHEN f.field_key = 'brand_definition_status' THEN 'partial'
    WHEN f.field_key = 'visual_style' THEN 'Visual sobrio, tecnico e com cara de empresa organizada.'
    WHEN f.field_key = 'reference_site' THEN 'https://vercel.com - gosto da clareza e organizacao.'
    WHEN f.field_key = 'visual_avoidances' THEN 'Evitar excesso de animacao e blocos muito apertados.'
    WHEN f.field_key = 'required_features' THEN 'Formulario, CTA de WhatsApp, SEO basico e links sociais.'
    WHEN f.field_key = 'needs_lead_capture' THEN 'yes'
    WHEN f.field_key = 'lead_form_fields' THEN 'Nome, e-mail, WhatsApp, empresa e mensagem.'
    WHEN f.field_key = 'external_integrations' THEN 'WhatsApp e Google Maps.'
    WHEN f.field_key = 'has_domain' THEN 'yes'
    WHEN f.field_key = 'has_hosting' THEN 'no'
    WHEN f.field_key = 'access_owners' THEN 'Diretor comercial e responsavel de TI.'
    WHEN f.field_key = 'launch_deadline' THEN 'Sem data fixa, mas ideal em ate 30 dias.'
    WHEN f.field_key = 'approver_name' THEN 'Diretor comercial'
    WHEN f.field_key = 'project_notes' THEN 'Briefing simulado via SQL para validacao operacional.'
    ELSE NULL
  END AS answer_text,
  CASE
    WHEN f.field_key = 'credit_and_portfolio_permissions' THEN JSON_ARRAY('footer_credit', 'public_portfolio')
    ELSE NULL
  END AS answer_json
FROM briefing_template_fields f
WHERE f.template_id = @template_id
  AND f.field_key IN (
    'company_name','company_segment','project_contact_name','project_contact_whatsapp','project_contact_email',
    'has_current_site','current_site_url','project_type','primary_goal','goal_outcome_sentence',
    'primary_visitor_action','company_summary','priority_services','main_differentials','common_objections',
    'ideal_customer','required_sections','mandatory_information','has_social_proof','social_proof_details',
    'has_logo','logo_assets','brand_definition_status','visual_style','reference_site','visual_avoidances',
    'required_features','needs_lead_capture','lead_form_fields','external_integrations','has_domain',
    'has_hosting','access_owners','launch_deadline','approver_name','credit_and_portfolio_permissions','project_notes'
  );

UPDATE project_briefings
SET status = 'submitted',
    submitted_at = UTC_TIMESTAMP(),
    updated_at = CURRENT_TIMESTAMP()
WHERE id = @project_briefing_id;

COMMIT;

SELECT
  'briefing_submission_simulated' AS status,
  @project_public_id AS project_public_id,
  @project_briefing_id AS project_briefing_id,
  @submission_id AS submission_id;
