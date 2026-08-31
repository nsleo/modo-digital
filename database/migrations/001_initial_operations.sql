-- Modo Digital - estrutura operacional inicial
-- Compatível com MySQL/MariaDB da hospedagem Hostinger.
-- Execute esta migration com o banco correto selecionado no phpMyAdmin.

SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(64) NOT NULL,
  applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (version)
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(120) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY admin_users_email_unique (email)
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS leads (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  form_slug VARCHAR(64) NOT NULL DEFAULT 'contact',
  form_version SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(32) NULL,
  company_name VARCHAR(160) NULL,
  service_interest VARCHAR(80) NULL,
  message TEXT NULL,
  answers_json JSON NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'new',
  source VARCHAR(100) NULL,
  utm_json JSON NULL,
  privacy_accepted_at TIMESTAMP NOT NULL,
  consent_version VARCHAR(32) NOT NULL,
  marketing_opt_in TINYINT(1) NOT NULL DEFAULT 0,
  idempotency_key CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NULL,
  ip_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_general_ci NULL,
  user_agent VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  archived_at TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY leads_public_id_unique (public_id),
  UNIQUE KEY leads_idempotency_key_unique (idempotency_key),
  KEY leads_status_created_at_index (status, created_at),
  KEY leads_email_index (email),
  KEY leads_created_at_index (created_at)
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

INSERT IGNORE INTO schema_migrations (version)
VALUES ('001_initial_operations');
