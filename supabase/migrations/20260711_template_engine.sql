-- Atlas.AI — Template Engine Schema Migration
-- Sprint 1: Add template tracking columns to generation_runs
--
-- Run this in Supabase SQL editor or via migration file
-- Safe to run multiple times (uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS)

-- Add template match tracking columns
ALTER TABLE generation_runs
  ADD COLUMN IF NOT EXISTS template_id         TEXT,
  ADD COLUMN IF NOT EXISTS template_strategy   TEXT DEFAULT 'generate',
  ADD COLUMN IF NOT EXISTS template_confidence INT  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS template_reason     TEXT,
  ADD COLUMN IF NOT EXISTS force_strategy      TEXT; -- user override from Preview UI

-- Add A/B test variant column (Sprint 2)
ALTER TABLE generation_runs
  ADD COLUMN IF NOT EXISTS ab_variant TEXT DEFAULT 'template'; -- 'template' | 'scratch'

-- Add design tokens for fallback rendering (Sprint 2)
ALTER TABLE generation_runs
  ADD COLUMN IF NOT EXISTS design_tokens JSONB;

-- Index for analytics queries: "what % of jobs use templates?"
CREATE INDEX IF NOT EXISTS idx_generation_runs_template_strategy
  ON generation_runs (template_strategy);

CREATE INDEX IF NOT EXISTS idx_generation_runs_template_id
  ON generation_runs (template_id)
  WHERE template_id IS NOT NULL;

-- View: Template usage analytics
CREATE OR REPLACE VIEW template_analytics AS
SELECT
  template_id,
  template_strategy,
  COUNT(*)                          AS total_runs,
  AVG(template_confidence)          AS avg_confidence,
  SUM(CASE WHEN ab_variant = 'template' THEN 1 ELSE 0 END) AS template_group,
  SUM(CASE WHEN ab_variant = 'scratch'  THEN 1 ELSE 0 END) AS control_group
FROM generation_runs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY template_id, template_strategy
ORDER BY total_runs DESC;
