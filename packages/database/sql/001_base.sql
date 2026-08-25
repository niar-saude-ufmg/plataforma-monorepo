BEGIN;

CREATE SCHEMA IF NOT EXISTS shared;
CREATE SCHEMA IF NOT EXISTS assistant;
CREATE SCHEMA IF NOT EXISTS admin;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'user_role' AND n.nspname = 'shared'
  ) THEN
    CREATE TYPE shared.user_role AS ENUM ('researcher', 'admin');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'wizard_type' AND n.nspname = 'assistant'
  ) THEN
    CREATE TYPE assistant.wizard_type AS ENUM ('project_doc', 'data_clean');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS shared.users (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  hashed_password VARCHAR(255) NOT NULL,
  role shared.user_role NOT NULL DEFAULT 'researcher',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shared_users_email ON shared.users (email);

CREATE TABLE IF NOT EXISTS shared.app_settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shared.datasets (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shared.catalog_tables (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  dataset_id INTEGER NOT NULL REFERENCES shared.datasets(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sample_rows TEXT NOT NULL DEFAULT '[]',
  CONSTRAINT uq_shared_table_dataset_name UNIQUE (dataset_id, name)
);

CREATE TABLE IF NOT EXISTS shared.catalog_columns (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  table_id INTEGER NOT NULL REFERENCES shared.catalog_tables(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  data_type VARCHAR(100) NOT NULL,
  nullable BOOLEAN NOT NULL DEFAULT TRUE,
  is_primary_key BOOLEAN NOT NULL DEFAULT FALSE,
  is_foreign_key BOOLEAN NOT NULL DEFAULT FALSE,
  description TEXT NOT NULL DEFAULT '',
  valid_values TEXT NOT NULL DEFAULT '',
  coding_notes TEXT NOT NULL DEFAULT '',
  is_phi BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT NOT NULL DEFAULT '',
  CONSTRAINT uq_shared_column_table_name UNIQUE (table_id, name)
);

CREATE TABLE IF NOT EXISTS shared.table_relationships (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  from_table_id INTEGER NOT NULL REFERENCES shared.catalog_tables(id) ON DELETE CASCADE,
  to_table_id INTEGER NOT NULL REFERENCES shared.catalog_tables(id) ON DELETE CASCADE,
  from_column VARCHAR(255) NOT NULL,
  to_column VARCHAR(255) NOT NULL,
  relationship_type VARCHAR(50) NOT NULL DEFAULT 'many_to_one',
  description TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS assistant.wizard_sessions (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES shared.users(id) ON DELETE CASCADE,
  wizard_type assistant.wizard_type NOT NULL,
  current_step VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL DEFAULT 'Untitled',
  dataset_id INTEGER NULL REFERENCES shared.datasets(id),
  linked_project_id INTEGER NULL REFERENCES assistant.wizard_sessions(id),
  section_data TEXT NOT NULL DEFAULT '{}',
  script_content TEXT NOT NULL DEFAULT '',
  validation_result TEXT NOT NULL DEFAULT '{}',
  quality_checklist TEXT NOT NULL DEFAULT '{}',
  llm_model_used VARCHAR(100) NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assistant.chat_messages (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES assistant.wizard_sessions(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  channel VARCHAR(20) NOT NULL DEFAULT 'intake',
  section_key VARCHAR(50) NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assistant.export_artifacts (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES assistant.wizard_sessions(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  artifact_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assistant.cleaning_versions (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES assistant.wizard_sessions(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  label VARCHAR(255) NOT NULL DEFAULT '',
  script_content TEXT NOT NULL DEFAULT '',
  validation_result TEXT NOT NULL DEFAULT '{}',
  messages_snapshot TEXT NOT NULL DEFAULT '[]',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_assistant_cleaning_version UNIQUE (session_id, version_number)
);

CREATE TABLE IF NOT EXISTS shared.audit_logs (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INTEGER NULL REFERENCES shared.users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL DEFAULT '',
  resource_id VARCHAR(100) NOT NULL DEFAULT '',
  details TEXT NOT NULL DEFAULT '',
  ip_address VARCHAR(50) NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin.projects (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  owner_user_id INTEGER NOT NULL REFERENCES shared.users(id) ON DELETE RESTRICT,
  source_wizard_session_id INTEGER NOT NULL UNIQUE REFERENCES assistant.wizard_sessions(id) ON DELETE RESTRICT,
  title VARCHAR(255) NOT NULL,
  submitted_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_projects_owner_user_id
  ON admin.projects (owner_user_id);

CREATE TABLE IF NOT EXISTS admin.project_documents (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES admin.projects(id) ON DELETE CASCADE,
  source_export_artifact_id INTEGER NULL REFERENCES assistant.export_artifacts(id) ON DELETE SET NULL,
  document_type VARCHAR(100) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  storage_path TEXT NOT NULL,
  is_current BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_project_documents_project_id
  ON admin.project_documents (project_id);

CREATE INDEX IF NOT EXISTS idx_admin_project_documents_source_export_artifact_id
  ON admin.project_documents (source_export_artifact_id);

CREATE TABLE IF NOT EXISTS shared.project_status_history (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES admin.projects(id) ON DELETE CASCADE,
  status VARCHAR(100) NOT NULL,
  notes TEXT NULL,
  actor_user_id INTEGER NULL REFERENCES shared.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shared_project_status_history_project_id
  ON shared.project_status_history (project_id);

CREATE INDEX IF NOT EXISTS idx_shared_project_status_history_actor_user_id
  ON shared.project_status_history (actor_user_id);

COMMIT;
