-- Modo Digital - seed do template oficial enxuto de briefing
-- Requer as migrations 003, 004 e 007 aplicadas.

SET NAMES utf8mb4;
SET time_zone = '+00:00';

SET @template_public_id = 'a09d2f5a-d17d-4bf1-9ee7-4a3ec6f2b142';
SET @template_slug = 'official-briefing';
SET @template_version = 2;

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
  'Template oficial enxuto, pensado para primeiro preenchimento com menor atrito.'
WHERE NOT EXISTS (
  SELECT 1
  FROM briefing_templates
  WHERE slug = @template_slug
    AND version = @template_version
);

SET @template_id = (
  SELECT id
  FROM briefing_templates
  WHERE slug = @template_slug
    AND version = @template_version
  LIMIT 1
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
  data.step_key,
  data.title,
  data.description,
  data.position
FROM (
  SELECT 'project_basics' AS step_key, 'Dados gerais do projeto' AS title, 'Pra gente entender quem responde, o tipo de projeto e o ponto de partida.' AS description, 1 AS position
  UNION ALL
  SELECT 'goals', 'Objetivo principal', 'Qual resultado esse site precisa ajudar a gerar.' AS description, 2
  UNION ALL
  SELECT 'business', 'Sobre a empresa', 'Resumo da empresa, do que ela vende e do que a diferencia.' AS description, 3
  UNION ALL
  SELECT 'audience_content', 'Publico e conteudo', 'Quem precisa ser convencido e o que nao pode faltar no site.' AS description, 4
  UNION ALL
  SELECT 'branding', 'Identidade visual', 'O minimo necessario para seguir com linguagem e referencias.' AS description, 5
  UNION ALL
  SELECT 'features', 'Captacao e funcionalidades', 'O que precisa existir na estrutura para o projeto funcionar.' AS description, 6
  UNION ALL
  SELECT 'ecommerce', 'Loja virtual', 'Aparece so quando o projeto envolve venda online.' AS description, 7
  UNION ALL
  SELECT 'access_approval', 'Acessos e aprovacao', 'Informacoes operacionais para viabilizar execucao e aprovacoes.' AS description, 8
) AS data
LEFT JOIN briefing_template_steps existing
  ON existing.template_id = @template_id
 AND existing.step_key = data.step_key
WHERE @template_id IS NOT NULL
  AND existing.id IS NULL;

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
  steps.id,
  data.field_key,
  data.label,
  data.help_text,
  data.field_type,
  data.is_required,
  data.options_json,
  data.visibility_rules_json,
  data.placeholder,
  data.position
FROM (
  SELECT 'project_basics' AS step_key, 'company_name' AS field_key, 'Nome da empresa' AS label, NULL AS help_text, 'text' AS field_type, 1 AS is_required, NULL AS options_json, NULL AS visibility_rules_json, 'Ex.: Modo Digital' AS placeholder, 1 AS position
  UNION ALL
  SELECT 'project_basics', 'company_segment', 'Segmento de atuacao', NULL, 'text', 1, NULL, NULL, 'Ex.: clinica, industria, servicos, varejo' , 2
  UNION ALL
  SELECT 'project_basics', 'project_contact_name', 'Nome de quem vai tocar esse projeto contigo', NULL, 'text', 1, NULL, NULL, 'Ex.: Leo Borges', 3
  UNION ALL
  SELECT 'project_basics', 'project_contact_whatsapp', 'WhatsApp principal para alinhamentos', NULL, 'text', 1, NULL, NULL, 'Ex.: (51) 99999-9999', 4
  UNION ALL
  SELECT 'project_basics', 'project_contact_email', 'E-mail principal para alinhamentos', NULL, 'email', 1, NULL, NULL, 'Ex.: contato@empresa.com.br', 5
  UNION ALL
  SELECT 'project_basics', 'has_current_site', 'A empresa ja tem site ativo hoje?', NULL, 'single_select', 1, '[{"value":"yes","label":"Sim"},{"value":"no","label":"Nao"}]', NULL, NULL, 6
  UNION ALL
  SELECT 'project_basics', 'current_site_url', 'Se sim, qual e o link do site atual?', NULL, 'url', 1, NULL, '{"show_if":[{"field":"has_current_site","operator":"equals","value":"yes"}]}', 'https://empresa.com.br', 7
  UNION ALL
  SELECT 'project_basics', 'project_type', 'Qual tipo de projeto faz mais sentido hoje?', NULL, 'single_select', 1, '[{"value":"institutional_site","label":"Site institucional"},{"value":"landing_page","label":"Landing page"},{"value":"ecommerce","label":"Loja virtual"},{"value":"custom_structure","label":"Estrutura personalizada"}]', NULL, NULL, 8

  UNION ALL
  SELECT 'goals', 'primary_goal', 'Qual e o principal objetivo desse site?', NULL, 'single_select', 1, '[{"value":"professional_presence","label":"Transmitir mais profissionalismo e autoridade"},{"value":"generate_leads","label":"Gerar mais contatos e oportunidades"},{"value":"sell_online","label":"Vender online"},{"value":"explain_offer","label":"Explicar melhor a oferta da empresa"},{"value":"improve_conversion","label":"Melhorar a conversao da estrutura atual"}]', NULL, NULL, 1
  UNION ALL
  SELECT 'goals', 'goal_outcome_sentence', 'Se esse projeto der certo, o que precisa mudar na pratica?', 'Pode responder em linguagem simples. O importante e descrever o resultado esperado.', 'textarea', 1, NULL, NULL, 'Ex.: queremos parecer mais profissionais e receber contatos mais qualificados.', 2
  UNION ALL
  SELECT 'goals', 'primary_visitor_action', 'Qual acao principal o visitante deve tomar?', NULL, 'single_select', 1, '[{"value":"whatsapp","label":"Chamar no WhatsApp"},{"value":"form","label":"Preencher formulario"},{"value":"quote_request","label":"Pedir orcamento"},{"value":"buy","label":"Comprar"},{"value":"phone_call","label":"Ligar"}]', NULL, NULL, 3

  UNION ALL
  SELECT 'business', 'company_summary', 'Como tu explicaria a empresa em poucas linhas?', 'O que ela faz, pra quem faz e como trabalha.', 'textarea', 1, NULL, NULL, 'Resumo direto da empresa.', 1
  UNION ALL
  SELECT 'business', 'priority_services', 'Quais servicos, produtos ou frentes precisam receber mais destaque?', NULL, 'textarea', 1, NULL, NULL, 'Lista ou descreve os focos principais.', 2
  UNION ALL
  SELECT 'business', 'main_differentials', 'Quais diferenciais mais importam na percepcao do cliente?', NULL, 'textarea', 1, NULL, NULL, 'Ex.: rapidez, especializacao, estrutura, atendimento.', 3
  UNION ALL
  SELECT 'business', 'common_objections', 'Existe alguma objecao comum que o site deveria ajudar a quebrar?', 'Opcional, mas ajuda muito na copy.', 'textarea', 0, NULL, NULL, 'Ex.: preco, confianca, prazo, comparacao com concorrentes.', 4

  UNION ALL
  SELECT 'audience_content', 'ideal_customer', 'Quem e o cliente ideal desse projeto?', NULL, 'textarea', 1, NULL, NULL, 'Descreve o perfil de quem queremos convencer.', 1
  UNION ALL
  SELECT 'audience_content', 'required_sections', 'Quais secoes ou paginas nao podem faltar?', NULL, 'textarea', 1, NULL, NULL, 'Ex.: home, sobre, servicos, FAQ, contato.', 2
  UNION ALL
  SELECT 'audience_content', 'mandatory_information', 'Quais informacoes precisam aparecer de qualquer jeito?', NULL, 'textarea', 1, NULL, NULL, 'Ex.: WhatsApp, endereco, servicos, diferenciais, horarios.', 3
  UNION ALL
  SELECT 'audience_content', 'has_social_proof', 'Tu ja tem provas de confianca para usar no site?', NULL, 'single_select', 1, '[{"value":"yes","label":"Sim"},{"value":"no","label":"Nao"}]', NULL, NULL, 4
  UNION ALL
  SELECT 'audience_content', 'social_proof_details', 'Quais provas de confianca ja existem?', 'Pode ser depoimento, case, numero, marca atendida ou qualquer material similar.', 'textarea', 1, NULL, '{"show_if":[{"field":"has_social_proof","operator":"equals","value":"yes"}]}', 'Ex.: depoimentos, fotos de obra, clientes atendidos, resultados.', 5

  UNION ALL
  SELECT 'branding', 'has_logo', 'A empresa ja tem logo pronto para uso?', NULL, 'single_select', 1, '[{"value":"yes","label":"Sim"},{"value":"no","label":"Nao"}]', NULL, NULL, 1
  UNION ALL
  SELECT 'branding', 'logo_assets', 'Se sim, onde estao os arquivos do logo?', 'Pode colar links do Drive, WeTransfer ou explicar onde buscar.', 'file', 1, NULL, '{"show_if":[{"field":"has_logo","operator":"equals","value":"yes"}]}', NULL, 2
  UNION ALL
  SELECT 'branding', 'brand_definition_status', 'A identidade visual da empresa hoje esta em que nivel?', NULL, 'single_select', 1, '[{"value":"defined","label":"Ja esta bem definida"},{"value":"partial","label":"Existe, mas ainda e parcial"},{"value":"undefined","label":"Ainda nao esta definida"}]', NULL, NULL, 3
  UNION ALL
  SELECT 'branding', 'visual_style', 'Existe alguma direcao visual que combine com a empresa?', 'Opcional. Pode descrever o estilo em palavras simples.', 'textarea', 0, NULL, NULL, 'Ex.: mais tecnico, mais premium, mais sobrio, mais comercial.', 4
  UNION ALL
  SELECT 'branding', 'reference_site', 'Tem algum site de referencia que tu gosta?', 'Opcional. Pode ser concorrente ou nao.', 'url', 0, NULL, NULL, 'https://...', 5
  UNION ALL
  SELECT 'branding', 'visual_avoidances', 'Tem algo visual que tu nao quer repetir de jeito nenhum?', 'Opcional, mas ajuda a evitar retrabalho.', 'textarea', 0, NULL, NULL, 'Ex.: visual poluido, cara de template, excesso de cor.', 6

  UNION ALL
  SELECT 'features', 'needs_lead_capture', 'Esse projeto precisa captar contatos?', NULL, 'single_select', 1, '[{"value":"yes","label":"Sim"},{"value":"no","label":"Nao"}]', NULL, NULL, 1
  UNION ALL
  SELECT 'features', 'lead_form_fields', 'Se sim, quais campos o formulario precisa pedir?', NULL, 'textarea', 1, NULL, '{"show_if":[{"field":"needs_lead_capture","operator":"equals","value":"yes"}]}', 'Ex.: nome, telefone, e-mail, empresa, mensagem.', 2
  UNION ALL
  SELECT 'features', 'required_features', 'Quais funcionalidades nao podem faltar?', 'Opcional. Ex.: FAQ, mapa, calculadora, integracao, area restrita.', 'textarea', 0, NULL, NULL, 'Lista o que precisa existir alem do conteudo basico.', 3
  UNION ALL
  SELECT 'features', 'external_integrations', 'Existe alguma integracao externa necessaria?', 'Opcional. Ex.: WhatsApp, CRM, agenda, plataforma de pagamento.', 'textarea', 0, NULL, NULL, 'Descreve o que precisa conversar com o site.', 4

  UNION ALL
  SELECT 'ecommerce', 'initial_product_count', 'Quantos produtos entram na primeira fase?', NULL, 'text', 1, NULL, '{"show_if":[{"field":"project_type","operator":"equals","value":"ecommerce"}]}', 'Ex.: 20, 100, 300+', 1
  UNION ALL
  SELECT 'ecommerce', 'payment_methods', 'Quais formas de pagamento precisam existir?', NULL, 'textarea', 1, NULL, '{"show_if":[{"field":"project_type","operator":"equals","value":"ecommerce"}]}', 'Ex.: PIX, cartao, boleto, parcelamento.', 2
  UNION ALL
  SELECT 'ecommerce', 'delivery_methods', 'Como a entrega vai funcionar?', NULL, 'textarea', 1, NULL, '{"show_if":[{"field":"project_type","operator":"equals","value":"ecommerce"}]}', 'Ex.: correios, transportadora, retirada, entrega local.', 3
  UNION ALL
  SELECT 'ecommerce', 'ecommerce_integrations', 'Tem integracao de estoque, ERP ou marketplace para considerar?', 'Opcional.', 'textarea', 0, NULL, '{"show_if":[{"field":"project_type","operator":"equals","value":"ecommerce"}]}', 'Ex.: Bling, Tiny, Mercado Livre.', 4

  UNION ALL
  SELECT 'access_approval', 'has_domain', 'A empresa ja tem dominio registrado?', NULL, 'single_select', 1, '[{"value":"yes","label":"Sim"},{"value":"no","label":"Nao"},{"value":"unknown","label":"Nao sei informar agora"}]', NULL, NULL, 1
  UNION ALL
  SELECT 'access_approval', 'has_hosting', 'A empresa ja tem hospedagem contratada?', NULL, 'single_select', 1, '[{"value":"yes","label":"Sim"},{"value":"no","label":"Nao"},{"value":"unknown","label":"Nao sei informar agora"}]', NULL, NULL, 2
  UNION ALL
  SELECT 'access_approval', 'access_owners', 'Quem hoje tem os acessos importantes do projeto?', 'Dominio, hospedagem, site atual, e-mails e qualquer outro acesso tecnico relevante.', 'textarea', 1, NULL, NULL, 'Ex.: dono da empresa, TI interno, agencia anterior.', 3
  UNION ALL
  SELECT 'access_approval', 'launch_deadline', 'Existe alguma data importante ou prazo desejado?', 'Opcional. Se nao tiver, pode deixar em branco.', 'text', 0, NULL, NULL, 'Ex.: campanha em setembro, evento, feira, sem data fixa.', 4
  UNION ALL
  SELECT 'access_approval', 'approver_name', 'Quem aprova esse projeto pela empresa?', NULL, 'text', 1, NULL, NULL, 'Nome da pessoa responsavel por validacoes finais.', 5
  UNION ALL
  SELECT 'access_approval', 'credit_and_portfolio_permissions', 'Sobre credito tecnico e portfolio publico da Modo Digital, quais opcoes tua empresa autoriza?', 'Essa resposta e opcional. Ela sinaliza uma permissao inicial e pode ser confirmada novamente na entrega do projeto.', 'multi_select', 0, '[{"value":"footer_credit","label":"Autorizo incluir o selo ou texto “Construido por Modo Digital” no site"},{"value":"public_portfolio","label":"Autorizo avaliar este projeto para o portfolio publico da Modo Digital"}]', NULL, NULL, 6
  UNION ALL
  SELECT 'access_approval', 'project_notes', 'Existe mais alguma observacao importante para esse projeto?', 'Opcional. Usa esse espaco para qualquer contexto extra.', 'textarea', 0, NULL, NULL, 'Qualquer detalhe que ajude no contexto.', 7
) AS data
INNER JOIN briefing_template_steps steps
  ON steps.template_id = @template_id
 AND steps.step_key = data.step_key
LEFT JOIN briefing_template_fields existing
  ON existing.template_id = @template_id
 AND existing.field_key = data.field_key
WHERE @template_id IS NOT NULL
  AND existing.id IS NULL;

INSERT IGNORE INTO schema_migrations (version)
VALUES ('008_seed_official_briefing_template_v2');
