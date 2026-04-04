-- Crie esta tabela no Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ptpojwbdxgmvykwwzatl/sql/new

CREATE TABLE IF NOT EXISTS agent_events (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  agent_id TEXT NOT NULL,
  machine TEXT DEFAULT 'unknown',
  event_type TEXT NOT NULL,
  task TEXT,
  summary TEXT,
  files_touched TEXT[],
  metadata JSONB DEFAULT '{}',
  session_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_agent_events_agent ON agent_events(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_events_type ON agent_events(event_type);
CREATE INDEX IF NOT EXISTS idx_agent_events_active ON agent_events(session_active) WHERE session_active = true;
CREATE INDEX IF NOT EXISTS idx_agent_events_created ON agent_events(created_at DESC);
