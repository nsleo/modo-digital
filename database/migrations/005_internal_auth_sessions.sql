-- Modo Digital - sessoes internas de admin para o painel operacional
-- Execute depois de 001, 002, 003 e 004.

SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS admin_user_sessions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  admin_user_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  user_agent VARCHAR(255) NULL,
  last_used_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY admin_user_sessions_public_id_unique (public_id),
  UNIQUE KEY admin_user_sessions_token_hash_unique (token_hash),
  KEY admin_user_sessions_admin_user_id_index (admin_user_id),
  KEY admin_user_sessions_expires_at_index (expires_at),
  CONSTRAINT admin_user_sessions_admin_user_id_fk
    FOREIGN KEY (admin_user_id) REFERENCES admin_users (id)
    ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

INSERT IGNORE INTO schema_migrations (version)
VALUES ('005_internal_auth_sessions');
