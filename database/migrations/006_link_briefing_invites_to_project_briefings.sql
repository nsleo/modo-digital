-- Modo Digital - vincula convites privados ao briefing operacional do projeto
-- Requer as migrations 002, 003, 004 e 005 aplicadas antes.

SET NAMES utf8mb4;
SET time_zone = '+00:00';

SET @column_exists := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'briefing_invites'
    AND COLUMN_NAME = 'project_briefing_id'
);
SET @sql := IF(
  @column_exists = 0,
  'ALTER TABLE briefing_invites ADD COLUMN project_briefing_id BIGINT UNSIGNED NULL AFTER client_id',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'briefing_invites'
    AND INDEX_NAME = 'briefing_invites_project_briefing_id_index'
);
SET @sql := IF(
  @index_exists = 0,
  'ALTER TABLE briefing_invites ADD KEY briefing_invites_project_briefing_id_index (project_briefing_id)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_exists := (
  SELECT COUNT(*)
  FROM information_schema.REFERENTIAL_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND CONSTRAINT_NAME = 'briefing_invites_project_briefing_id_fk'
);
SET @sql := IF(
  @fk_exists = 0,
  'ALTER TABLE briefing_invites ADD CONSTRAINT briefing_invites_project_briefing_id_fk FOREIGN KEY (project_briefing_id) REFERENCES project_briefings (id) ON DELETE SET NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

INSERT IGNORE INTO schema_migrations (version)
VALUES ('006_link_briefing_invites_to_project_briefings');
