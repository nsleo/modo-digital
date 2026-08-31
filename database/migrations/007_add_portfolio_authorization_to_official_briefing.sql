-- Modo Digital - adiciona autorizacao opcional de credito e portfolio ao briefing oficial
-- Requer as migrations 003 e 004 aplicadas.

SET NAMES utf8mb4;
SET time_zone = '+00:00';

SET @template_id = (
  SELECT id
  FROM briefing_templates
  WHERE slug = 'official-briefing' AND version = 1
  LIMIT 1
);

SET @step_id = (
  SELECT id
  FROM briefing_template_steps
  WHERE template_id = @template_id AND step_key = 'approval'
  LIMIT 1
);

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
  'credit_and_portfolio_permissions',
  'Sobre credito tecnico e portfolio publico da Modo Digital, quais opcoes tua empresa autoriza?',
  'Essa resposta e opcional. Ela sinaliza uma permissao inicial e pode ser confirmada novamente na entrega do projeto.',
  'multi_select',
  0,
  JSON_ARRAY(
    JSON_OBJECT(
      'value', 'footer_credit',
      'label', 'Autorizo incluir o selo ou texto “Construido por Modo Digital” no site'
    ),
    JSON_OBJECT(
      'value', 'public_portfolio',
      'label', 'Autorizo avaliar este projeto para o portfolio publico da Modo Digital'
    )
  ),
  NULL,
  NULL,
  5
WHERE @template_id IS NOT NULL
  AND @step_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM briefing_template_fields
    WHERE template_id = @template_id
      AND field_key = 'credit_and_portfolio_permissions'
  );

INSERT IGNORE INTO schema_migrations (version)
VALUES ('007_add_portfolio_authorization_to_official_briefing');
