-- Modo Digital - briefing privado minimo com convite por token

SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS clients (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  company_name VARCHAR(160) NOT NULL,
  primary_contact_name VARCHAR(120) NULL,
  primary_contact_email VARCHAR(190) NULL,
  project_label VARCHAR(160) NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY clients_public_id_unique (public_id),
  KEY clients_company_name_index (company_name),
  KEY clients_status_index (status)
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS briefing_invites (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  client_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  title VARCHAR(160) NOT NULL DEFAULT 'Briefing inicial',
  intro_message TEXT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  expires_at TIMESTAMP NULL DEFAULT NULL,
  last_opened_at TIMESTAMP NULL DEFAULT NULL,
  completed_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY briefing_invites_public_id_unique (public_id),
  UNIQUE KEY briefing_invites_token_hash_unique (token_hash),
  KEY briefing_invites_client_id_index (client_id),
  KEY briefing_invites_status_index (status),
  CONSTRAINT briefing_invites_client_id_fk
    FOREIGN KEY (client_id) REFERENCES clients (id)
    ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS briefing_responses (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  client_id BIGINT UNSIGNED NOT NULL,
  invite_id BIGINT UNSIGNED NOT NULL,
  response_version SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  payload_json JSON NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'submitted',
  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY briefing_responses_public_id_unique (public_id),
  UNIQUE KEY briefing_responses_invite_id_unique (invite_id),
  KEY briefing_responses_client_id_index (client_id),
  KEY briefing_responses_status_index (status),
  CONSTRAINT briefing_responses_client_id_fk
    FOREIGN KEY (client_id) REFERENCES clients (id)
    ON DELETE CASCADE,
  CONSTRAINT briefing_responses_invite_id_fk
    FOREIGN KEY (invite_id) REFERENCES briefing_invites (id)
    ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

INSERT IGNORE INTO schema_migrations (version)
VALUES ('002_private_briefing');
