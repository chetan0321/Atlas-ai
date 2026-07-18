-- saas-dashboard / sections / schema.sql
--
-- TEMPLATE RULES (for AI customization):
-- - Rename 'projects' to your actual entity (tasks, tickets, campaigns, etc.)
-- - Add/remove columns to match your data model
-- - Keep the RLS policies structure — only change table/column names
-- - Keep created_at / updated_at / user_id pattern — the CRUD handler depends on it
--
-- Run this migration in Supabase SQL Editor or via supabase db push

-- ── Projects table (rename to your entity) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'inactive', 'pending', 'cancelled')),
  plan        TEXT NOT NULL DEFAULT 'starter'
                CHECK (plan IN ('starter', 'pro', 'enterprise')),
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Auto-update updated_at on row change ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_projects ON projects;
CREATE TRIGGER set_updated_at_projects
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Row Level Security ───────────────────────────────────────────────────────────
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Users can only see their own rows
CREATE POLICY "projects_select_own"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert rows they own
CREATE POLICY "projects_insert_own"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own rows
CREATE POLICY "projects_update_own"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only delete their own rows
CREATE POLICY "projects_delete_own"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- ── Indexes ─────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS projects_user_id_idx    ON projects(user_id);
CREATE INDEX IF NOT EXISTS projects_status_idx     ON projects(status);
CREATE INDEX IF NOT EXISTS projects_created_at_idx ON projects(created_at DESC);
