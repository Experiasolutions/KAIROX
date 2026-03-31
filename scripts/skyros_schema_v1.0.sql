-- ==============================================================================
-- KAIROS OS (SKYROS) - DATABASE EXPANSION SCHEMA v1.0
-- Governança: Engine Triage v4 | RPG + Daily Workflow
-- Objetivo: Expandir as tabelas base do apex-conductor sem ser destrutivo.
-- ==============================================================================

-- 1. Criação das tabelas centrais do Motor de Vida (Night Check-in & Morning Brief)
CREATE TABLE IF NOT EXISTS public.morning_briefs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    target_date DATE NOT NULL UNIQUE,
    pareto_mission TEXT NOT NULL, -- A missão 20% que traz 80% do resultado (A zona de Genialidade)
    secondary_tasks JSONB DEFAULT '[]'::jsonb,
    is_completed BOOLEAN DEFAULT false,
    telegram_message_id TEXT -- Para o engine saber qual mensagem foi enviada
);

CREATE TABLE IF NOT EXISTS public.night_checkins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    target_date DATE NOT NULL UNIQUE,
    energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
    pareto_score DECIMAL(5,2) DEFAULT 0.0, -- % do dia focado na zona de genialidade
    victories TEXT,
    bottlenecks TEXT,
    momentum_streak INTEGER DEFAULT 0 -- Quantos check-ins consutivos feitos
);

-- 2. Expansão/Alteração Segura do Perfil Global (Profiles)
-- O apex-conductor provavelmente não possui essas métricas ainda. 
-- Usamos 'ADD COLUMN IF NOT EXISTS' para não dar erro se já existirem.
ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS current_xp INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS rank_title TEXT DEFAULT 'Iniciante',
    ADD COLUMN IF NOT EXISTS total_pareto_score DECIMAL(5,2) DEFAULT 0.0;

-- 3. Configuração do Realtime para o Cockpit Apex-Conductor
-- Isso garante que as UIs do front-end recebam instantaneamente as atualizações.
BEGIN;
  DROP PUBLICATION IF EXISTS skyros_realtime;
  CREATE PUBLICATION skyros_realtime FOR TABLE morning_briefs, night_checkins;
COMMIT;

-- 4. RLS - Policies (Opcional, mas seguro)
ALTER TABLE public.morning_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.night_checkins ENABLE ROW LEVEL SECURITY;

-- Crie políticas genéricas para o usuário logado (assumindo que há auth)
-- (Substitua auth.uid() por sua regra de negócio caso esteja rodando offline/mock auth)
CREATE POLICY "Enable all access for authenticated users" ON public.morning_briefs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON public.night_checkins FOR ALL USING (auth.role() = 'authenticated');
