-- Modo Digital - base operacional da fase 2.1
-- Evolui leads, cria projetos, contatos e briefing configuravel.
-- Execute apenas depois de 001_initial_operations e 002_private_briefing.
-- Esta migration prepara configuracao futura por painel, mas os templates
-- continuam sendo cadastrados por codigo ou SQL nesta fase.

SET NAMES utf8mb4;
SET time_zone = '+00:00';

ALTER TABLE leads
  ADD COLUMN pipeline_stage VARCHAR(32) NOT NULL DEFAULT 'incoming' AFTER status,
  ADD COLUMN assigned_admin_user_id BIGINT UNSIGNED NULL AFTER pipeline_stage,
  ADD COLUMN converted_to_client_id BIGINT UNSIGNED NULL AFTER assigned_admin_user_id,
  ADD COLUMN last_contact_at TIMESTAMP NULL DEFAULT NULL AFTER marketing_opt_in,
  ADD COLUMN qualification_notes TEXT NULL AFTER last_contact_at,
  ADD KEY leads_pipeline_stage_created_at_index (pipeline_stage, created_at),
  ADD KEY leads_assigned_admin_user_id_index (assigned_admin_user_id),
  ADD KEY leads_converted_to_client_id_index (converted_to_client_id),
  ADD CONSTRAINT leads_assigned_admin_user_id_fk
    FOREIGN KEY (assigned_admin_user_id) REFERENCES admin_users (id)
    ON DELETE SET NULL,
  ADD CONSTRAINT leads_converted_to_client_id_fk
    FOREIGN KEY (converted_to_client_id) REFERENCES clients (id)
    ON DELETE SET NULL;

ALTER TABLE clients
  ADD COLUMN trade_name VARCHAR(160) NULL AFTER company_name,
  ADD COLUMN segment VARCHAR(120) NULL AFTER trade_name,
  ADD COLUMN primary_contact_phone VARCHAR(32) NULL AFTER primary_contact_email;

CREATE TABLE IF NOT EXISTS client_contacts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  client_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NULL,
  phone VARCHAR(32) NULL,
  role_label VARCHAR(80) NULL,
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY client_contacts_public_id_unique (public_id),
  KEY client_contacts_client_id_index (client_id),
  KEY client_contacts_is_primary_index (is_primary),
  CONSTRAINT client_contacts_client_id_fk
    FOREIGN KEY (client_id) REFERENCES clients (id)
    ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS projects (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  client_id BIGINT UNSIGNED NOT NULL,
  source_lead_id BIGINT UNSIGNED NULL,
  owner_admin_user_id BIGINT UNSIGNED NULL,
  name VARCHAR(160) NOT NULL,
  project_type VARCHAR(64) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  summary TEXT NULL,
  started_at TIMESTAMP NULL DEFAULT NULL,
  target_launch_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY projects_public_id_unique (public_id),
  KEY projects_client_id_index (client_id),
  KEY projects_source_lead_id_index (source_lead_id),
  KEY projects_owner_admin_user_id_index (owner_admin_user_id),
  KEY projects_project_type_status_index (project_type, status),
  CONSTRAINT projects_client_id_fk
    FOREIGN KEY (client_id) REFERENCES clients (id)
    ON DELETE CASCADE,
  CONSTRAINT projects_source_lead_id_fk
    FOREIGN KEY (source_lead_id) REFERENCES leads (id)
    ON DELETE SET NULL,
  CONSTRAINT projects_owner_admin_user_id_fk
    FOREIGN KEY (owner_admin_user_id) REFERENCES admin_users (id)
    ON DELETE SET NULL
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS briefing_templates (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  slug VARCHAR(120) NOT NULL,
  name VARCHAR(160) NOT NULL,
  version SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  project_type VARCHAR(64) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  description TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY briefing_templates_public_id_unique (public_id),
  UNIQUE KEY briefing_templates_slug_version_unique (slug, version),
  KEY briefing_templates_project_type_is_active_index (project_type, is_active)
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS briefing_template_steps (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  template_id BIGINT UNSIGNED NOT NULL,
  step_key VARCHAR(120) NOT NULL,
  title VARCHAR(160) NOT NULL,
  description TEXT NULL,
  position SMALLINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY briefing_template_steps_template_id_step_key_unique (template_id, step_key),
  UNIQUE KEY briefing_template_steps_template_id_position_unique (template_id, position),
  CONSTRAINT briefing_template_steps_template_id_fk
    FOREIGN KEY (template_id) REFERENCES briefing_templates (id)
    ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS briefing_template_fields (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  template_id BIGINT UNSIGNED NOT NULL,
  step_id BIGINT UNSIGNED NOT NULL,
  field_key VARCHAR(120) NOT NULL,
  label VARCHAR(255) NOT NULL,
  help_text TEXT NULL,
  field_type VARCHAR(40) NOT NULL,
  is_required TINYINT(1) NOT NULL DEFAULT 0,
  options_json JSON NULL,
  visibility_rules_json JSON NULL,
  placeholder VARCHAR(255) NULL,
  position SMALLINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY briefing_template_fields_template_id_field_key_unique (template_id, field_key),
  UNIQUE KEY briefing_template_fields_step_id_position_unique (step_id, position),
  KEY briefing_template_fields_template_step_index (template_id, step_id),
  CONSTRAINT briefing_template_fields_template_id_fk
    FOREIGN KEY (template_id) REFERENCES briefing_templates (id)
    ON DELETE CASCADE,
  CONSTRAINT briefing_template_fields_step_id_fk
    FOREIGN KEY (step_id) REFERENCES briefing_template_steps (id)
    ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS project_briefings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  project_id BIGINT UNSIGNED NOT NULL,
  template_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(160) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'draft',
  last_sent_at TIMESTAMP NULL DEFAULT NULL,
  submitted_at TIMESTAMP NULL DEFAULT NULL,
  completed_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY project_briefings_public_id_unique (public_id),
  KEY project_briefings_project_id_index (project_id),
  KEY project_briefings_template_id_index (template_id),
  KEY project_briefings_status_index (status),
  CONSTRAINT project_briefings_project_id_fk
    FOREIGN KEY (project_id) REFERENCES projects (id)
    ON DELETE CASCADE,
  CONSTRAINT project_briefings_template_id_fk
    FOREIGN KEY (template_id) REFERENCES briefing_templates (id)
    ON DELETE RESTRICT
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS briefing_submissions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  project_briefing_id BIGINT UNSIGNED NOT NULL,
  project_id BIGINT UNSIGNED NOT NULL,
  template_id BIGINT UNSIGNED NOT NULL,
  response_version SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  status VARCHAR(32) NOT NULL DEFAULT 'submitted',
  submitted_by_type VARCHAR(20) NOT NULL DEFAULT 'client',
  submitted_by_user_id BIGINT UNSIGNED NULL,
  answers_json JSON NULL,
  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY briefing_submissions_public_id_unique (public_id),
  KEY briefing_submissions_project_briefing_id_index (project_briefing_id),
  KEY briefing_submissions_project_id_index (project_id),
  KEY briefing_submissions_template_id_index (template_id),
  KEY briefing_submissions_status_submitted_at_index (status, submitted_at),
  CONSTRAINT briefing_submissions_project_briefing_id_fk
    FOREIGN KEY (project_briefing_id) REFERENCES project_briefings (id)
    ON DELETE CASCADE,
  CONSTRAINT briefing_submissions_project_id_fk
    FOREIGN KEY (project_id) REFERENCES projects (id)
    ON DELETE CASCADE,
  CONSTRAINT briefing_submissions_template_id_fk
    FOREIGN KEY (template_id) REFERENCES briefing_templates (id)
    ON DELETE RESTRICT
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS briefing_submission_answers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  submission_id BIGINT UNSIGNED NOT NULL,
  field_id BIGINT UNSIGNED NULL,
  field_key VARCHAR(120) NOT NULL,
  answer_text LONGTEXT NULL,
  answer_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY briefing_submission_answers_submission_id_field_key_unique (submission_id, field_key),
  KEY briefing_submission_answers_field_id_index (field_id),
  CONSTRAINT briefing_submission_answers_submission_id_fk
    FOREIGN KEY (submission_id) REFERENCES briefing_submissions (id)
    ON DELETE CASCADE,
  CONSTRAINT briefing_submission_answers_field_id_fk
    FOREIGN KEY (field_id) REFERENCES briefing_template_fields (id)
    ON DELETE SET NULL
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

INSERT IGNORE INTO schema_migrations (version)
VALUES ('003_phase2_operational_foundation');
