-- ==============================================================================
-- KAIROS CLOUD SYNC (KCS) - SUPABASE DDL
-- ==============================================================================
-- Instrução: Cole isso no Supabase SQL Editor e aperte RUN.
-- Isso criará a tabela base para a sincronia em tempo real do nosso Cofre.

CREATE TABLE IF NOT EXISTS public.kairos_brain_notes (
    vault_path TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    source_node_id TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ativar RLS (Bypass via Service Role Key no Node.js)
ALTER TABLE public.kairos_brain_notes ENABLE ROW LEVEL SECURITY;

-- OBRIGATÓRIO: Ligar o Realtime para permitir que o Notebook seja avisado em milissegundos
-- quando o PC salvar um arquivo, e vice versa.
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.kairos_brain_notes;

-- Opcional para o futuro: Tabela de EventBus (para acionar agentes do KAIROS na nuvem)
CREATE TABLE IF NOT EXISTS public.kairos_event_bus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'pending'
);
