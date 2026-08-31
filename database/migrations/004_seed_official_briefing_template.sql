-- Modo Digital - seed do template oficial inicial de briefing
-- Requer a migration 003_phase2_operational_foundation aplicada.

SET NAMES utf8mb4;
SET time_zone = '+00:00';

SET @template_public_id = '4f35c0f0-6b4d-4d51-9682-0e4d5f3f1001';
SET @template_slug = 'official-briefing';
SET @template_version = 1;

INSERT INTO briefing_templates (
  public_id,
  slug,
  name,
  version,
  project_type,
  is_active,
  description
)
SELECT
  @template_public_id,
  @template_slug,
  'Briefing oficial Modo Digital',
  @template_version,
  NULL,
  1,
  'Template oficial inicial do briefing por etapas, com regras condicionais basicas.'
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_templates WHERE slug = @template_slug AND version = @template_version
);

SET @template_id = (
  SELECT id FROM briefing_templates WHERE slug = @template_slug AND version = @template_version LIMIT 1
);

INSERT INTO briefing_template_steps (
  template_id,
  step_key,
  title,
  description,
  position
)
SELECT
  @template_id,
  'project_basics',
  'Dados gerais do projeto',
  NULL,
  1
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'project_basics'
);

INSERT INTO briefing_template_steps (
  template_id,
  step_key,
  title,
  description,
  position
)
SELECT
  @template_id,
  'goals',
  'Objetivo principal do site',
  NULL,
  2
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'goals'
);

INSERT INTO briefing_template_steps (
  template_id,
  step_key,
  title,
  description,
  position
)
SELECT
  @template_id,
  'business',
  'Sobre a empresa',
  NULL,
  3
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'business'
);

INSERT INTO briefing_template_steps (
  template_id,
  step_key,
  title,
  description,
  position
)
SELECT
  @template_id,
  'audience',
  'Publico-alvo',
  NULL,
  4
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'audience'
);

INSERT INTO briefing_template_steps (
  template_id,
  step_key,
  title,
  description,
  position
)
SELECT
  @template_id,
  'content',
  'Conteudo do site',
  NULL,
  5
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'content'
);

INSERT INTO briefing_template_steps (
  template_id,
  step_key,
  title,
  description,
  position
)
SELECT
  @template_id,
  'branding',
  'Identidade visual e materiais',
  NULL,
  6
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'branding'
);

INSERT INTO briefing_template_steps (
  template_id,
  step_key,
  title,
  description,
  position
)
SELECT
  @template_id,
  'features',
  'Funcionalidades necessarias',
  NULL,
  7
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'features'
);

INSERT INTO briefing_template_steps (
  template_id,
  step_key,
  title,
  description,
  position
)
SELECT
  @template_id,
  'ecommerce',
  'Caso seja loja virtual',
  NULL,
  8
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'ecommerce'
);

INSERT INTO briefing_template_steps (
  template_id,
  step_key,
  title,
  description,
  position
)
SELECT
  @template_id,
  'seo',
  'SEO e presenca digital',
  NULL,
  9
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'seo'
);

INSERT INTO briefing_template_steps (
  template_id,
  step_key,
  title,
  description,
  position
)
SELECT
  @template_id,
  'access',
  'Acessos e estrutura atual',
  NULL,
  10
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'access'
);

INSERT INTO briefing_template_steps (
  template_id,
  step_key,
  title,
  description,
  position
)
SELECT
  @template_id,
  'approval',
  'Prazos e aprovacao',
  NULL,
  11
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'approval'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'project_basics' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'company_name',
  'Nome da empresa',
  NULL,
  'text',
  1,
  NULL,
  NULL,
  NULL,
  1
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'company_name'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'project_basics' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'company_segment',
  'Segmento de atuacao',
  NULL,
  'text',
  1,
  NULL,
  NULL,
  NULL,
  2
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'company_segment'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'project_basics' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'project_contact_name',
  'Nome do responsavel pelo projeto',
  NULL,
  'text',
  1,
  NULL,
  NULL,
  NULL,
  3
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'project_contact_name'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'project_basics' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'project_contact_whatsapp',
  'WhatsApp do responsavel',
  NULL,
  'text',
  1,
  NULL,
  NULL,
  NULL,
  4
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'project_contact_whatsapp'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'project_basics' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'project_contact_email',
  'E-mail do responsavel',
  NULL,
  'email',
  1,
  NULL,
  NULL,
  NULL,
  5
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'project_contact_email'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'project_basics' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'has_current_site',
  'A empresa ja possui site?',
  NULL,
  'single_select',
  1,
  '[{"value":"yes","label":"Sim"},{"value":"no","label":"Nao"}]',
  NULL,
  NULL,
  6
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'has_current_site'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'project_basics' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'current_site_url',
  'Se sim, informe o link do site atual',
  NULL,
  'url',
  0,
  NULL,
  '{"show_if":[{"field":"has_current_site","operator":"equals","value":"yes"}]}',
  NULL,
  7
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'current_site_url'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'project_basics' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'project_type',
  'Qual tipo de projeto voce precisa?',
  NULL,
  'single_select',
  1,
  '[{"value":"institutional_site","label":"Site institucional"},{"value":"landing_page","label":"Landing page"},{"value":"ecommerce","label":"Loja virtual"},{"value":"catalog","label":"Catalogo online"},{"value":"link_in_bio","label":"Pagina de links / bio"},{"value":"website_redesign","label":"Reformulacao de site existente"},{"value":"other","label":"Ainda nao sei exatamente"}]',
  NULL,
  NULL,
  8
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'project_type'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'goals' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'primary_goal',
  'Qual e o principal objetivo do site?',
  NULL,
  'single_select',
  1,
  '[{"value":"whatsapp_leads","label":"Gerar contatos pelo WhatsApp"},{"value":"quote_requests","label":"Gerar pedidos de orcamento"},{"value":"online_sales","label":"Vender produtos online"},{"value":"professional_presence","label":"Apresentar a empresa com mais profissionalismo"},{"value":"seo_visibility","label":"Aparecer melhor no Google"},{"value":"showcase_offers","label":"Divulgar servicos/produtos"},{"value":"replace_old_site","label":"Substituir um site antigo"},{"value":"other","label":"Outro"}]',
  NULL,
  NULL,
  1
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'primary_goal'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'goals' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'goal_outcome_sentence',
  'Em uma frase, o que voce espera que o site ajude a empresa a conquistar?',
  NULL,
  'textarea',
  1,
  NULL,
  NULL,
  NULL,
  2
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'goal_outcome_sentence'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'goals' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'primary_visitor_action',
  'Qual acao principal o visitante deve tomar no site?',
  NULL,
  'single_select',
  1,
  '[{"value":"whatsapp","label":"Chamar no WhatsApp"},{"value":"form","label":"Preencher formulario"},{"value":"buy","label":"Comprar online"},{"value":"call","label":"Ligar"},{"value":"visit_store","label":"Visitar a loja fisica"},{"value":"download_catalog","label":"Baixar catalogo"},{"value":"schedule","label":"Agendar atendimento"},{"value":"other","label":"Outro"}]',
  NULL,
  NULL,
  3
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'primary_visitor_action'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'business' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'company_summary',
  'Explique brevemente o que a empresa faz',
  NULL,
  'textarea',
  1,
  NULL,
  NULL,
  NULL,
  1
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'company_summary'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'business' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'offered_services',
  'Quais servicos ou produtos a empresa oferece?',
  NULL,
  'textarea',
  1,
  NULL,
  NULL,
  NULL,
  2
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'offered_services'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'business' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'priority_services',
  'Quais servicos/produtos sao prioridade no site?',
  NULL,
  'textarea',
  1,
  NULL,
  NULL,
  NULL,
  3
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'priority_services'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'business' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'main_differentials',
  'Quais sao os principais diferenciais da empresa?',
  NULL,
  'textarea',
  1,
  NULL,
  NULL,
  NULL,
  4
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'main_differentials'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'business' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'why_choose_company',
  'Por que um cliente deveria escolher sua empresa em vez de um concorrente?',
  NULL,
  'textarea',
  1,
  NULL,
  NULL,
  NULL,
  5
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'why_choose_company'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'business' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'problems_solved',
  'Quais problemas sua empresa resolve para o cliente?',
  NULL,
  'textarea',
  1,
  NULL,
  NULL,
  NULL,
  6
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'problems_solved'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'business' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'common_objections',
  'Quais sao as duvidas ou objecoes mais comuns antes do cliente comprar/contratar?',
  NULL,
  'textarea',
  0,
  NULL,
  NULL,
  NULL,
  7
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'common_objections'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'audience' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'ideal_customer',
  'Quem e o cliente ideal da empresa?',
  NULL,
  'textarea',
  1,
  NULL,
  NULL,
  NULL,
  1
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'ideal_customer'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'audience' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'audience_type',
  'A empresa atende pessoas fisicas, empresas ou ambos?',
  NULL,
  'single_select',
  1,
  '[{"value":"consumer","label":"Pessoas fisicas"},{"value":"business","label":"Empresas"},{"value":"both","label":"Ambos"}]',
  NULL,
  NULL,
  2
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'audience_type'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'audience' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'service_regions',
  'Quais cidades, regioes ou estados a empresa atende?',
  NULL,
  'textarea',
  1,
  NULL,
  NULL,
  NULL,
  3
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'service_regions'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'audience' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'excluded_customers',
  'Existe algum tipo de cliente que a empresa NAO quer atrair?',
  NULL,
  'textarea',
  0,
  NULL,
  NULL,
  NULL,
  4
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'excluded_customers'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'content' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'required_sections',
  'Quais paginas ou secoes precisam existir no site?',
  NULL,
  'multi_select',
  1,
  '[{"value":"home","label":"Inicio"},{"value":"about","label":"Sobre a empresa"},{"value":"services","label":"Servicos"},{"value":"products","label":"Produtos"},{"value":"store","label":"Loja virtual"},{"value":"catalog","label":"Catalogo"},{"value":"testimonials","label":"Depoimentos"},{"value":"portfolio","label":"Cases/portfolio"},{"value":"blog","label":"Blog/noticias"},{"value":"contact","label":"Contato"},{"value":"careers","label":"Trabalhe conosco"},{"value":"faq","label":"Perguntas frequentes"},{"value":"other","label":"Outra"}]',
  NULL,
  NULL,
  1
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'required_sections'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'content' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'mandatory_information',
  'Quais informacoes sao obrigatorias no site?',
  'Ex.: historia da empresa, certificacoes, equipe, areas atendidas, garantias, formas de pagamento, localizacao.',
  'textarea',
  1,
  NULL,
  NULL,
  NULL,
  2
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'mandatory_information'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'content' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'has_social_proof',
  'A empresa possui depoimentos, avaliacoes, cases ou clientes importantes para mostrar?',
  NULL,
  'single_select',
  1,
  '[{"value":"yes","label":"Sim"},{"value":"no","label":"Nao"}]',
  NULL,
  NULL,
  3
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'has_social_proof'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'content' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'social_proof_details',
  'Se sim, envie ou descreva quais',
  NULL,
  'textarea',
  0,
  NULL,
  '{"show_if":[{"field":"has_social_proof","operator":"equals","value":"yes"}]}',
  NULL,
  4
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'social_proof_details'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'content' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'must_include_text',
  'Existe alguma frase, termo ou informacao que precisa aparecer no site?',
  NULL,
  'textarea',
  0,
  NULL,
  NULL,
  NULL,
  5
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'must_include_text'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'content' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'must_avoid_text',
  'Existe alguma frase, termo ou informacao que NAO deve aparecer?',
  NULL,
  'textarea',
  0,
  NULL,
  NULL,
  NULL,
  6
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'must_avoid_text'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'branding' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'has_logo',
  'A empresa possui logo?',
  NULL,
  'single_select',
  1,
  '[{"value":"yes","label":"Sim"},{"value":"no","label":"Nao"}]',
  NULL,
  NULL,
  1
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'has_logo'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'branding' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'logo_assets',
  'Envie o logo, se tiver',
  NULL,
  'file',
  0,
  NULL,
  '{"show_if":[{"field":"has_logo","operator":"equals","value":"yes"}]}',
  NULL,
  2
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'logo_assets'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'branding' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'brand_definition_status',
  'A empresa possui identidade visual definida?',
  'Ex.: cores, fontes, manual da marca, materiais antigos.',
  'single_select',
  1,
  '[{"value":"yes","label":"Sim"},{"value":"no","label":"Nao"},{"value":"partial","label":"Parcialmente"}]',
  NULL,
  NULL,
  3
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'brand_definition_status'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'branding' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'color_guidance',
  'Quais cores devem ser usadas ou evitadas?',
  NULL,
  'textarea',
  0,
  NULL,
  NULL,
  NULL,
  4
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'color_guidance'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'branding' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'has_media_assets',
  'A empresa possui fotos, videos ou materiais proprios para usar no site?',
  NULL,
  'single_select',
  1,
  '[{"value":"yes","label":"Sim"},{"value":"no","label":"Nao"}]',
  NULL,
  NULL,
  5
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'has_media_assets'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'branding' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'media_assets',
  'Envie os materiais disponiveis',
  NULL,
  'file',
  0,
  NULL,
  '{"show_if":[{"field":"has_media_assets","operator":"equals","value":"yes"}]}',
  NULL,
  6
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'media_assets'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'branding' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'visual_style',
  'O site deve seguir algum estilo visual especifico?',
  NULL,
  'multi_select',
  0,
  '[{"value":"modern","label":"Moderno"},{"value":"sophisticated","label":"Sofisticado"},{"value":"minimalist","label":"Minimalista"},{"value":"corporate","label":"Corporativo"},{"value":"creative","label":"Criativo"},{"value":"accessible","label":"Popular/acessivel"},{"value":"premium","label":"Luxo/premium"},{"value":"technical","label":"Tecnico/industrial"},{"value":"other","label":"Outro"}]',
  NULL,
  NULL,
  7
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'visual_style'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'branding' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'reference_site',
  'Existe algum site de referencia que voce gosta?',
  'Informe o link e o que voce gosta nele.',
  'textarea',
  0,
  NULL,
  NULL,
  NULL,
  8
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'reference_site'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'branding' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'competitor_site',
  'Existe algum site de concorrente direto?',
  'Informe o link, se souber.',
  'textarea',
  0,
  NULL,
  NULL,
  NULL,
  9
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'competitor_site'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'branding' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'visual_avoidances',
  'Existe algum estilo visual que voce nao quer de jeito nenhum?',
  NULL,
  'textarea',
  0,
  NULL,
  NULL,
  NULL,
  10
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'visual_avoidances'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'features' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'required_features',
  'Quais funcionalidades o site precisa ter?',
  NULL,
  'multi_select',
  0,
  '[{"value":"whatsapp_button","label":"Botao de WhatsApp"},{"value":"contact_form","label":"Formulario de contato"},{"value":"google_maps","label":"Google Maps"},{"value":"photo_gallery","label":"Galeria de fotos"},{"value":"blog","label":"Blog/noticias"},{"value":"product_catalog","label":"Catalogo de produtos"},{"value":"online_store","label":"Loja virtual com pagamento online"},{"value":"login_area","label":"Area de login"},{"value":"online_scheduling","label":"Agendamento online"},{"value":"instagram_integration","label":"Integracao com Instagram"},{"value":"crm_integration","label":"Integracao com CRM"},{"value":"meta_pixel","label":"Pixel/Meta Ads"},{"value":"google_analytics","label":"Google Analytics"},{"value":"other","label":"Outra"}]',
  NULL,
  NULL,
  1
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'required_features'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'features' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'needs_lead_capture',
  'O site precisa captar leads?',
  NULL,
  'single_select',
  1,
  '[{"value":"yes","label":"Sim"},{"value":"no","label":"Nao"},{"value":"maybe","label":"Talvez"}]',
  NULL,
  NULL,
  2
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'needs_lead_capture'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'features' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'lead_form_fields',
  'Se sim, quais dados devem ser pedidos no formulario?',
  'Ex.: nome, telefone, e-mail, empresa, cidade, servico de interesse, mensagem.',
  'textarea',
  0,
  NULL,
  '{"show_if":[{"field":"needs_lead_capture","operator":"in","value":["yes","maybe"]}]}',
  NULL,
  3
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'lead_form_fields'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'features' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'external_integrations',
  'O site precisa ter integracao com alguma ferramenta externa?',
  'Ex.: WhatsApp, RD Station, HubSpot, Mailchimp, Bling, ERP, CRM, gateway de pagamento.',
  'textarea',
  0,
  NULL,
  NULL,
  NULL,
  4
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'external_integrations'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'ecommerce' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'sell_online',
  'A empresa vai vender produtos online?',
  NULL,
  'single_select',
  1,
  '[{"value":"yes","label":"Sim"},{"value":"no","label":"Nao"}]',
  '{"show_if":[{"field":"project_type","operator":"in","value":["ecommerce","catalog"]}]}',
  NULL,
  1
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'sell_online'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'ecommerce' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'initial_product_count',
  'Quantos produtos aproximadamente serao cadastrados no inicio?',
  NULL,
  'single_select',
  0,
  '[{"value":"up_to_10","label":"Ate 10"},{"value":"10_to_50","label":"10 a 50"},{"value":"50_to_200","label":"50 a 200"},{"value":"over_200","label":"Mais de 200"}]',
  '{"show_if":[{"field":"sell_online","operator":"equals","value":"yes"}]}',
  NULL,
  2
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'initial_product_count'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'ecommerce' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'has_product_variations',
  'Os produtos possuem variacoes?',
  'Ex.: tamanho, cor, modelo, voltagem, medida.',
  'single_select',
  0,
  '[{"value":"yes","label":"Sim"},{"value":"no","label":"Nao"}]',
  '{"show_if":[{"field":"sell_online","operator":"equals","value":"yes"}]}',
  NULL,
  3
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'has_product_variations'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'ecommerce' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'catalog_readiness',
  'A empresa ja possui fotos, precos e descricoes dos produtos?',
  NULL,
  'single_select',
  0,
  '[{"value":"yes","label":"Sim"},{"value":"no","label":"Nao"},{"value":"partial","label":"Parcialmente"}]',
  '{"show_if":[{"field":"sell_online","operator":"equals","value":"yes"}]}',
  NULL,
  4
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'catalog_readiness'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'ecommerce' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'payment_methods',
  'Quais formas de pagamento deseja oferecer?',
  NULL,
  'textarea',
  0,
  NULL,
  '{"show_if":[{"field":"sell_online","operator":"equals","value":"yes"}]}',
  NULL,
  5
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'payment_methods'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'ecommerce' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'delivery_methods',
  'Quais formas de entrega deseja oferecer?',
  NULL,
  'textarea',
  0,
  NULL,
  '{"show_if":[{"field":"sell_online","operator":"equals","value":"yes"}]}',
  NULL,
  6
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'delivery_methods'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'ecommerce' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'ecommerce_integrations',
  'A loja tera integracao com algum sistema?',
  'Ex.: Bling, Tiny, ERP, emissao de nota, estoque, frete, marketplace.',
  'textarea',
  0,
  NULL,
  '{"show_if":[{"field":"sell_online","operator":"equals","value":"yes"}]}',
  NULL,
  7
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'ecommerce_integrations'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'seo' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'seo_keywords',
  'Quais palavras ou termos um cliente pesquisaria no Google para encontrar sua empresa?',
  NULL,
  'textarea',
  0,
  NULL,
  NULL,
  NULL,
  1
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'seo_keywords'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'seo' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'has_google_business_profile',
  'A empresa possui perfil no Google Meu Negocio?',
  NULL,
  'single_select',
  0,
  '[{"value":"yes","label":"Sim"},{"value":"no","label":"Nao"},{"value":"unknown","label":"Nao sei"}]',
  NULL,
  NULL,
  2
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'has_google_business_profile'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'seo' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'social_links',
  'A empresa possui redes sociais?',
  'Informe os links.',
  'textarea',
  0,
  NULL,
  NULL,
  NULL,
  3
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'social_links'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'seo' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'visible_contact_channels',
  'Quais canais de contato devem aparecer no site?',
  NULL,
  'multi_select',
  1,
  '[{"value":"whatsapp","label":"WhatsApp"},{"value":"phone","label":"Telefone"},{"value":"email","label":"E-mail"},{"value":"instagram","label":"Instagram"},{"value":"facebook","label":"Facebook"},{"value":"linkedin","label":"LinkedIn"},{"value":"address","label":"Endereco fisico"},{"value":"maps","label":"Google Maps"},{"value":"other","label":"Outro"}]',
  NULL,
  NULL,
  4
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'visible_contact_channels'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'seo' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'official_contact_data',
  'Informe os dados de contato oficiais',
  NULL,
  'textarea',
  1,
  NULL,
  NULL,
  NULL,
  5
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'official_contact_data'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'access' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'has_domain',
  'A empresa ja possui dominio registrado?',
  'Ex.: empresa.com.br',
  'single_select',
  1,
  '[{"value":"yes","label":"Sim"},{"value":"no","label":"Nao"},{"value":"unknown","label":"Nao sei"}]',
  NULL,
  NULL,
  1
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'has_domain'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'access' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'domain_name',
  'Se sim, informe o dominio',
  NULL,
  'text',
  0,
  NULL,
  '{"show_if":[{"field":"has_domain","operator":"equals","value":"yes"}]}',
  NULL,
  2
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'domain_name'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'access' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'has_hosting',
  'A empresa ja possui hospedagem?',
  NULL,
  'single_select',
  1,
  '[{"value":"yes","label":"Sim"},{"value":"no","label":"Nao"},{"value":"unknown","label":"Nao sei"}]',
  NULL,
  NULL,
  3
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'has_hosting'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'access' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'has_business_email',
  'A empresa utiliza e-mails profissionais?',
  'Ex.: contato@empresa.com.br',
  'single_select',
  1,
  '[{"value":"yes","label":"Sim"},{"value":"no","label":"Nao"},{"value":"unknown","label":"Nao sei"}]',
  NULL,
  NULL,
  4
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'has_business_email'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'access' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'access_owners',
  'Quem possui os acessos ao dominio, hospedagem, site atual e e-mails?',
  NULL,
  'textarea',
  0,
  NULL,
  NULL,
  NULL,
  5
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'access_owners'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'access' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'current_platforms',
  'Existe alguma plataforma atual que precisa ser mantida ou integrada?',
  NULL,
  'textarea',
  0,
  NULL,
  NULL,
  NULL,
  6
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'current_platforms'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'approval' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'launch_deadline',
  'Existe alguma data importante para o lancamento do site?',
  NULL,
  'text',
  0,
  NULL,
  NULL,
  NULL,
  1
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'launch_deadline'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'approval' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'approver_name',
  'Quem sera responsavel por aprovar textos, imagens e informacoes?',
  NULL,
  'text',
  1,
  NULL,
  NULL,
  NULL,
  2
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'approver_name'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'approval' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'additional_approvers',
  'Existe mais alguem que precisa participar da aprovacao?',
  NULL,
  'textarea',
  0,
  NULL,
  NULL,
  NULL,
  3
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'additional_approvers'
);

SET @step_id = (SELECT id FROM briefing_template_steps WHERE template_id = @template_id AND step_key = 'approval' LIMIT 1);
INSERT INTO briefing_template_fields (
  template_id,
  step_id,
  field_key,
  label,
  help_text,
  field_type,
  is_required,
  options_json,
  visibility_rules_json,
  placeholder,
  position
)
SELECT
  @template_id,
  @step_id,
  'project_notes',
  'Alguma observacao importante sobre o projeto?',
  NULL,
  'textarea',
  0,
  NULL,
  NULL,
  NULL,
  4
WHERE NOT EXISTS (
  SELECT 1 FROM briefing_template_fields WHERE template_id = @template_id AND field_key = 'project_notes'
);

INSERT IGNORE INTO schema_migrations (version)
VALUES ('004_seed_official_briefing_template');
