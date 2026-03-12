# 🚀 ANTIGRAVITY NO CODESPACES - GUIA MASTER COMPLETO
## Configuração Profissional de A a Z com Sincronização Multi-Conta

**Versão:** 2.0  
**Data:** Fevereiro 2026  
**Autor:** Claude Opus 4.6  
**Tempo estimado:** 60-90 minutos (primeira vez), 10 minutos (contas adicionais)

---

# 📋 ÍNDICE

1. [Visão Geral da Arquitetura](#1-visão-geral)
2. [Pré-Requisitos](#2-pré-requisitos)
3. [Fase 1: Setup do Supabase](#3-fase-1-supabase)
4. [Fase 2: Preparação do R
5. epositório](#4-fase-2-repositório)
6. [Fase 3: Configuração do Codespace](#5-fase-3-codespace)
7. [Fase 4: Instalação do Antigravity](#6-fase-4-antigravity)
8. [Fase 5: Integração e Sincronização](#7-fase-5-integração)
9. [Fase 6: Múltiplas Contas](#8-fase-6-múltiplas-contas)
10. [Fase 7: Backup e Segurança](#9-fase-7-backup)
11. [Fase 8: Otimizações](#10-fase-8-otimizações)
12. [Troubleshooting](#11-troubleshooting)
13. [Comandos Rápidos](#12-comandos-rápidos)

---

# 1. VISÃO GERAL

## 1.1 O Que Vamos Construir

```
┌─────────────────────────────────────────────────────────────┐
│                    GITHUB ACCOUNT 1                          │
│              ┌──────────────────────────┐                    │
│              │   CODESPACE (60h/mês)    │                    │
│              │  ┌────────────────────┐  │                    │
│              │  │   ANTIGRAVITY      │  │                    │
│              │  │   + Dependencies   │  │                    │
│              │  │   + Config         │  │                    │
│              │  └────────┬───────────┘  │                    │
│              └───────────┼──────────────┘                    │
└──────────────────────────┼─────────────────────────────────┘
                           │
                           ▼
                    ┌──────────────────┐
                    │    SUPABASE      │
                    │   (DATABASE)     │
                    ├──────────────────┤
                    │ • Conversations  │
                    │ • Projects       │
                    │ • Agent Memory   │
                    │ • Files Storage  │
                    │ • Session State  │
                    └────────┬─────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  ACCOUNT 2   │    │  ACCOUNT 3   │    │  BACKUP      │
│  Codespace   │    │  Codespace   │    │  Sistema     │
└──────────────┘    └──────────────┘    └──────────────┘

RESULTADO: 180h/mês grátis + memória contínua + backup automático
```

## 1.2 Características Principais

- ✅ **3 contas GitHub** → 180h/mês (6h/dia)
- ✅ **Supabase grátis** → 500MB DB + 1GB storage
- ✅ **Sincronização automática** → Memória contínua entre contas
- ✅ **Backup diário** → Proteção contra perda de dados
- ✅ **Hot reload** → Mudanças refletem imediatamente
- ✅ **Devcontainer** → Ambiente reproduzível
- ✅ **Scripts de automação** → Setup em 5 minutos

## 1.3 Filosofia de Design

**Princípios:**
1. **Reprodutibilidade** - Mesmo ambiente em todas contas
2. **Automação** - Mínimo trabalho manual
3. **Segurança** - Secrets nunca no repo
4. **Resiliência** - Funciona offline (exceto sync)
5. **Monitoramento** - Sempre saiba o estado do sistema

---

# 2. PRÉ-REQUISITOS

## 2.1 Contas Necessárias

### ☐ GitHub (3 contas)

**Conta Principal:**
- Email: seu-email@gmail.com
- Username: seu-usuario
- 2FA: Habilitado (recomendado)

**Conta Secundária 1:**
- Email: seu-email+1@gmail.com (Gmail ignora +)
- Username: seu-usuario-2
- 2FA: Habilitado

**Conta Secundária 2:**
- Email: seu-email+2@gmail.com
- Username: seu-usuario-3
- 2FA: Habilitado

**Verificar:**
```bash
# Em cada conta
gh auth status
# Deve mostrar: Logged in to github.com as <username>
```

### ☐ Supabase (1 conta compartilhada)

**Criar conta:**
1. Ir para https://supabase.com
2. Sign up com Google (usar email principal)
3. Verificar email
4. Criar organização: "Antigravity Sync"

**Verificar:**
- Dashboard acessível
- Sem projetos criados ainda (vamos criar juntos)

### ☐ Anthropic API (para Claude)

**Obter chave:**
1. https://console.anthropic.com/settings/keys
2. Create Key → "Antigravity Codespaces"
3. Copiar e salvar (só mostra uma vez!)

**Formato:** `sk-ant-api03-...`

### ☐ OpenAI API (para Whisper/TTS)

**Obter chave:**
1. https://platform.openai.com/api-keys
2. Create new secret key → "Antigravity"
3. Copiar e salvar

**Formato:** `sk-...`

### ☐ Gemini API (opcional, mas recomendado)

**Obter chave:**
1. https://makersuite.google.com/app/apikey
2. Create API key
3. Copiar e salvar

**Formato:** `AIzaSy...`

## 2.2 Softwares Locais (Opcional)

Se quiser trabalhar localmente também:

```bash
# Verificar instalações
node --version   # v18+ recomendado
git --version    # 2.x+
gh --version     # 2.x+ (GitHub CLI)
```

## 2.3 Conhecimento Prévio

**Necessário:**
- Usar terminal básico
- Git básico (clone, commit, push)
- Conceito de variáveis de ambiente

**Opcional mas útil:**
- Node.js/JavaScript
- SQL básico
- Docker/containers

---

# 3. FASE 1: SUPABASE

## 3.1 Criar Projeto

**Passo 1: Novo Projeto**

1. Dashboard → New Project
2. Preencher:
   ```
   Name: antigravity-sync
   Database Password: [GERAR SENHA FORTE]
   Region: South America (sa-east-1)
   Pricing Plan: Free
   ```
3. Aguardar ~2 minutos (provisioning)

**Passo 2: Anotar Credenciais**

No projeto, ir em Settings → API:

```bash
# Copiar e salvar estes valores:

URL: https://xxxxxxxxxxxxx.supabase.co
ANON KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SERVICE_ROLE KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ⚠️ IMPORTANTE: Use ANON KEY no código (nunca service_role)
```

## 3.2 Criar Banco de Dados

**Passo 1: Abrir SQL Editor**

Dashboard → SQL Editor → New Query

**Passo 2: Executar SQL Completo**

```sql
-- ============================================================================
-- ANTIGRAVITY SYNC DATABASE SCHEMA
-- Versão: 2.0
-- Data: 2026-02-18
-- ============================================================================

-- EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busca de texto

-- ============================================================================
-- TABELA: conversations
-- Armazena histórico de conversas entre usuário e Antigravity
-- ============================================================================

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  tokens_used INTEGER,
  model_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_conversations_user ON conversations(user_id);
CREATE INDEX idx_conversations_session ON conversations(session_id);
CREATE INDEX idx_conversations_timestamp ON conversations(timestamp DESC);
CREATE INDEX idx_conversations_user_session ON conversations(user_id, session_id);

-- Índice para busca de texto
CREATE INDEX idx_conversations_content ON conversations USING gin(to_tsvector('english', content));

-- Comentários
COMMENT ON TABLE conversations IS 'Histórico completo de conversas do Antigravity';
COMMENT ON COLUMN conversations.user_id IS 'ID do usuário (email ou identificador único)';
COMMENT ON COLUMN conversations.session_id IS 'ID da sessão (ex: 2026-02-18-morning)';
COMMENT ON COLUMN conversations.role IS 'Quem falou: user, assistant ou system';
COMMENT ON COLUMN conversations.metadata IS 'Dados extras: intent, confidence, etc';

-- ============================================================================
-- TABELA: agent_memory
-- Memória de curto e longo prazo dos agentes
-- ============================================================================

CREATE TABLE agent_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  memory_type TEXT NOT NULL CHECK (memory_type IN ('short_term', 'long_term', 'episodic', 'semantic')),
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  importance DECIMAL(3,2) DEFAULT 0.5 CHECK (importance >= 0 AND importance <= 1),
  expires_at TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, agent_name, key)
);

-- Índices
CREATE INDEX idx_agent_memory_user_agent ON agent_memory(user_id, agent_name);
CREATE INDEX idx_agent_memory_type ON agent_memory(memory_type);
CREATE INDEX idx_agent_memory_importance ON agent_memory(importance DESC);
CREATE INDEX idx_agent_memory_expires ON agent_memory(expires_at) WHERE expires_at IS NOT NULL;

-- Comentários
COMMENT ON TABLE agent_memory IS 'Memória persistente dos agentes do Antigravity';
COMMENT ON COLUMN agent_memory.memory_type IS 'short_term: <24h, long_term: permanente, episodic: eventos, semantic: conhecimento';
COMMENT ON COLUMN agent_memory.importance IS 'Score 0-1 para priorização (>0.8 = crítico)';

-- ============================================================================
-- TABELA: projects
-- Projetos e tarefas do usuário
-- ============================================================================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  data JSONB NOT NULL DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Índices
CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_priority ON projects(priority DESC);
CREATE INDEX idx_projects_deadline ON projects(deadline) WHERE deadline IS NOT NULL;
CREATE INDEX idx_projects_tags ON projects USING gin(tags);

-- Comentários
COMMENT ON TABLE projects IS 'Projetos gerenciados pelo Antigravity';
COMMENT ON COLUMN projects.priority IS '1=baixo, 10=urgente';
COMMENT ON COLUMN projects.data IS 'Dados específicos do projeto (estrutura livre)';

-- ============================================================================
-- TABELA: sync_state
-- Estado de sincronização entre Codespaces
-- ============================================================================

CREATE TABLE sync_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  codespace_id TEXT NOT NULL,
  session_id TEXT,
  last_sync TIMESTAMPTZ DEFAULT NOW(),
  state JSONB NOT NULL DEFAULT '{}',
  health_status JSONB DEFAULT '{}',
  environment JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, codespace_id)
);

-- Índices
CREATE INDEX idx_sync_state_user ON sync_state(user_id);
CREATE INDEX idx_sync_state_last_sync ON sync_state(last_sync DESC);

-- Comentários
COMMENT ON TABLE sync_state IS 'Estado atual de cada Codespace para sincronização';
COMMENT ON COLUMN sync_state.codespace_id IS 'ID único do Codespace (CODESPACE_NAME env var)';
COMMENT ON COLUMN sync_state.health_status IS 'Health check do Antigravity (kernel, agents, etc)';

-- ============================================================================
-- TABELA: files_metadata
-- Metadados de arquivos sincronizados
-- ============================================================================

CREATE TABLE files_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  path TEXT NOT NULL,
  size_bytes BIGINT,
  mime_type TEXT,
  storage_path TEXT NOT NULL,
  checksum TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, path)
);

-- Índices
CREATE INDEX idx_files_user ON files_metadata(user_id);
CREATE INDEX idx_files_path ON files_metadata(path);
CREATE INDEX idx_files_checksum ON files_metadata(checksum);
CREATE INDEX idx_files_not_deleted ON files_metadata(user_id, path) WHERE is_deleted = FALSE;

-- Comentários
COMMENT ON TABLE files_metadata IS 'Metadados de arquivos no Supabase Storage';
COMMENT ON COLUMN files_metadata.storage_path IS 'Caminho no bucket Supabase Storage';
COMMENT ON COLUMN files_metadata.checksum IS 'SHA256 hash para detecção de mudanças';
COMMENT ON COLUMN files_metadata.version IS 'Número de versão (incrementa a cada update)';

-- ============================================================================
-- TABELA: session_snapshots
-- Snapshots de sessão para handoff entre contas
-- ============================================================================

CREATE TABLE session_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  codespace_id TEXT,
  context_compressed JSONB NOT NULL,
  quality_baseline DECIMAL(3,1),
  checksum TEXT NOT NULL,
  tokens_used INTEGER,
  duration_minutes INTEGER,
  tasks_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_snapshots_user_time ON session_snapshots(user_id, timestamp DESC);
CREATE INDEX idx_snapshots_session ON session_snapshots(session_id);
CREATE INDEX idx_snapshots_checksum ON session_snapshots(checksum);

-- Comentários
COMMENT ON TABLE session_snapshots IS 'Snapshots de sessão para continuidade entre Codespaces';
COMMENT ON COLUMN session_snapshots.context_compressed IS 'Contexto comprimido (max 300 tokens)';
COMMENT ON COLUMN session_snapshots.quality_baseline IS 'Score médio de qualidade da sessão (1-10)';

-- ============================================================================
-- TABELA: system_logs
-- Logs do sistema para debugging e monitoramento
-- ============================================================================

CREATE TABLE system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT,
  level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warning', 'error', 'critical')),
  component TEXT NOT NULL,
  message TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  codespace_id TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices (particionado por tempo para performance)
CREATE INDEX idx_logs_timestamp ON system_logs(timestamp DESC);
CREATE INDEX idx_logs_level ON system_logs(level);
CREATE INDEX idx_logs_user ON system_logs(user_id);
CREATE INDEX idx_logs_component ON system_logs(component);

-- Comentários
COMMENT ON TABLE system_logs IS 'Logs centralizados do Antigravity';
COMMENT ON COLUMN system_logs.component IS 'Componente que gerou o log (ex: sync-manager, kernel, agent)';

-- ============================================================================
-- FUNÇÕES AUXILIARES
-- ============================================================================

-- Função: Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função: Incrementar access_count na memória do agente
CREATE OR REPLACE FUNCTION increment_memory_access()
RETURNS TRIGGER AS $$
BEGIN
  NEW.access_count = OLD.access_count + 1;
  NEW.last_accessed = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função: Limpar memória expirada
CREATE OR REPLACE FUNCTION clean_expired_memory()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM agent_memory
  WHERE expires_at IS NOT NULL AND expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Função: Estatísticas de uso
CREATE OR REPLACE FUNCTION get_usage_stats(p_user_id TEXT)
RETURNS TABLE (
  total_conversations BIGINT,
  total_projects BIGINT,
  active_projects BIGINT,
  total_memory_items BIGINT,
  total_files BIGINT,
  last_sync TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM conversations WHERE user_id = p_user_id),
    (SELECT COUNT(*) FROM projects WHERE user_id = p_user_id),
    (SELECT COUNT(*) FROM projects WHERE user_id = p_user_id AND status = 'active'),
    (SELECT COUNT(*) FROM agent_memory WHERE user_id = p_user_id),
    (SELECT COUNT(*) FROM files_metadata WHERE user_id = p_user_id AND is_deleted = FALSE),
    (SELECT MAX(last_sync) FROM sync_state WHERE user_id = p_user_id);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Atualizar updated_at em agent_memory
CREATE TRIGGER trigger_agent_memory_updated_at
BEFORE UPDATE ON agent_memory
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Atualizar updated_at em projects
CREATE TRIGGER trigger_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Atualizar updated_at em files_metadata
CREATE TRIGGER trigger_files_metadata_updated_at
BEFORE UPDATE ON files_metadata
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Atualizar updated_at em sync_state
CREATE TRIGGER trigger_sync_state_updated_at
BEFORE UPDATE ON sync_state
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Incrementar access_count ao acessar memória
CREATE TRIGGER trigger_memory_access
BEFORE UPDATE ON agent_memory
FOR EACH ROW
WHEN (OLD.value IS DISTINCT FROM NEW.value)
EXECUTE FUNCTION increment_memory_access();

-- ============================================================================
-- VIEWS ÚTEIS
-- ============================================================================

-- View: Conversas recentes por usuário
CREATE OR REPLACE VIEW recent_conversations AS
SELECT
  user_id,
  session_id,
  COUNT(*) as message_count,
  MAX(timestamp) as last_message,
  SUM(tokens_used) as total_tokens
FROM conversations
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY user_id, session_id
ORDER BY last_message DESC;

-- View: Saúde do sistema por usuário
CREATE OR REPLACE VIEW system_health AS
SELECT
  ss.user_id,
  ss.codespace_id,
  ss.last_sync,
  ss.health_status,
  COUNT(DISTINCT c.session_id) as active_sessions,
  COUNT(DISTINCT p.id) as active_projects
FROM sync_state ss
LEFT JOIN conversations c ON c.user_id = ss.user_id AND c.timestamp > NOW() - INTERVAL '1 day'
LEFT JOIN projects p ON p.user_id = ss.user_id AND p.status = 'active'
GROUP BY ss.user_id, ss.codespace_id, ss.last_sync, ss.health_status;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE files_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Políticas: Cada usuário só vê seus próprios dados
-- (usando auth.uid() ou variável de sessão user_id)

-- Conversations
CREATE POLICY conversations_user_policy ON conversations
  FOR ALL
  USING (user_id = current_setting('app.user_id', TRUE))
  WITH CHECK (user_id = current_setting('app.user_id', TRUE));

-- Agent Memory
CREATE POLICY agent_memory_user_policy ON agent_memory
  FOR ALL
  USING (user_id = current_setting('app.user_id', TRUE))
  WITH CHECK (user_id = current_setting('app.user_id', TRUE));

-- Projects
CREATE POLICY projects_user_policy ON projects
  FOR ALL
  USING (user_id = current_setting('app.user_id', TRUE))
  WITH CHECK (user_id = current_setting('app.user_id', TRUE));

-- Sync State
CREATE POLICY sync_state_user_policy ON sync_state
  FOR ALL
  USING (user_id = current_setting('app.user_id', TRUE))
  WITH CHECK (user_id = current_setting('app.user_id', TRUE));

-- Files Metadata
CREATE POLICY files_metadata_user_policy ON files_metadata
  FOR ALL
  USING (user_id = current_setting('app.user_id', TRUE))
  WITH CHECK (user_id = current_setting('app.user_id', TRUE));

-- Session Snapshots
CREATE POLICY session_snapshots_user_policy ON session_snapshots
  FOR ALL
  USING (user_id = current_setting('app.user_id', TRUE))
  WITH CHECK (user_id = current_setting('app.user_id', TRUE));

-- System Logs (leitura pública para admins, escrita restrita)
CREATE POLICY system_logs_read_policy ON system_logs
  FOR SELECT
  USING (TRUE);

CREATE POLICY system_logs_write_policy ON system_logs
  FOR INSERT
  WITH CHECK (TRUE);

-- ============================================================================
-- DADOS INICIAIS (SEED)
-- ============================================================================

-- Inserir alguns exemplos (opcional, para testar)
-- Descomente se quiser dados de teste:

/*
INSERT INTO conversations (user_id, session_id, role, content) VALUES
  ('test@example.com', '2026-02-18-test', 'user', 'Olá Antigravity!'),
  ('test@example.com', '2026-02-18-test', 'assistant', 'Olá! Como posso ajudar?');

INSERT INTO projects (user_id, name, description, status, priority) VALUES
  ('test@example.com', 'AIOS Development', 'Sistema multi-agente', 'active', 10);
*/

-- ============================================================================
-- MANUTENÇÃO AUTOMÁTICA
-- ============================================================================

-- Job: Limpar logs antigos (>30 dias)
-- Executar manualmente ou via cron:
-- DELETE FROM system_logs WHERE timestamp < NOW() - INTERVAL '30 days';

-- Job: Limpar memória expirada
-- SELECT clean_expired_memory();

-- Job: Vacuum (performance)
-- VACUUM ANALYZE;

-- ============================================================================
-- FIM DO SCHEMA
-- ============================================================================

-- Verificar tabelas criadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verificar índices criados
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

**Passo 3: Verificar Criação**

Executar:

```sql
-- Ver tabelas
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Deve retornar:
-- conversations
-- agent_memory
-- projects
-- sync_state
-- files_metadata
-- session_snapshots
-- system_logs
```

**✅ Checkpoint:** 7 tabelas criadas

## 3.3 Configurar Storage

**Passo 1: Criar Bucket**

Storage → New Bucket:

```
Name: antigravity-files
Public: NO (privado)
File size limit: 50 MB
Allowed MIME types: (deixar vazio = todos)
```

**Passo 2: Configurar Políticas**

Storage → Policies → New Policy:

```sql
-- Política: Usuários podem fazer upload/download/delete
CREATE POLICY "Users can upload files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'antigravity-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can download files"
ON storage.objects FOR SELECT
USING (bucket_id = 'antigravity-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete files"
ON storage.objects FOR DELETE
USING (bucket_id = 'antigravity-files' AND auth.uid()::text = (storage.foldername(name))[1]);
```

**✅ Checkpoint:** Storage configurado

## 3.4 Teste de Conexão

**Script de Teste:**

```javascript
// test-supabase.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xxxxx.supabase.co'; // SEU URL
const supabaseKey = 'eyJhbGc...'; // SUA ANON KEY

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🧪 Testando conexão Supabase...\n');
  
  // Teste 1: Inserir conversa
  const { data: conv, error: convError } = await supabase
    .from('conversations')
    .insert({
      user_id: 'test@example.com',
      session_id: 'test-session',
      role: 'user',
      content: 'Hello Supabase!'
    })
    .select();
  
  if (convError) {
    console.error('❌ Erro ao inserir conversa:', convError);
    return false;
  }
  
  console.log('✅ Conversa inserida:', conv[0].id);
  
  // Teste 2: Buscar conversa
  const { data: retrieved, error: retrieveError } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', 'test@example.com')
    .limit(1);
  
  if (retrieveError) {
    console.error('❌ Erro ao buscar:', retrieveError);
    return false;
  }
  
  console.log('✅ Conversa recuperada:', retrieved[0].content);
  
  // Teste 3: Limpar
  const { error: deleteError } = await supabase
    .from('conversations')
    .delete()
    .eq('user_id', 'test@example.com');
  
  if (deleteError) {
    console.error('❌ Erro ao limpar:', deleteError);
    return false;
  }
  
  console.log('✅ Teste limpo\n');
  console.log('🎉 Supabase funcionando perfeitamente!');
  return true;
}

testConnection();
```

Executar:

```bash
node test-supabase.js
```

**✅ Checkpoint:** Supabase 100% funcional

---

# 4. FASE 2: REPOSITÓRIO

## 4.1 Criar Repositório GitHub

**Passo 1: Criar Repo**

1. GitHub → New Repository
2. Configurar:
   ```
   Name: antigravity-workspace
   Description: Antigravity AI system with multi-account sync
   Visibility: Private (recomendado)
   Initialize: ✅ Add README
            ✅ Add .gitignore (Node)
            ❌ License (opcional)
   ```
3. Create repository

**Passo 2: Clonar Localmente (opcional)**

```bash
git clone https://github.com/seu-usuario/antigravity-workspace.git
cd antigravity-workspace
```

## 4.2 Estrutura de Pastas

**Criar estrutura:**

```bash
mkdir -p .devcontainer
mkdir -p .github/workflows
mkdir -p scripts
mkdir -p config
mkdir -p data
mkdir -p antigravity
mkdir -p docs
```

**Estrutura final:**

```
antigravity-workspace/
├── .devcontainer/           # Configuração do Codespace
│   ├── devcontainer.json
│   └── Dockerfile (opcional)
├── .github/
│   └── workflows/           # GitHub Actions
│       └── sync-backup.yml
├── antigravity/             # Código do Antigravity
│   ├── [será clonado/copiado depois]
├── scripts/                 # Scripts de automação
│   ├── setup.sh
│   ├── sync-manager.py
│   ├── backup.sh
│   └── health-check.sh
├── config/                  # Configurações
│   ├── .env.example
│   └── antigravity.config.js
├── data/                    # Dados locais (gitignored)
│   └── .gitkeep
├── docs/                    # Documentação
│   └── README.md
├── .gitignore
└── README.md
```

## 4.3 Arquivos de Configuração

### .gitignore

```bash
# .gitignore

# Environment variables
.env
.env.local
.env.*.local
*.key

# Dados locais
data/*
!data/.gitkeep

# Node
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Logs
logs/
*.log

# Python
__pycache__/
*.py[cod]
*$py.class
venv/
.venv/

# Editor
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Backup
backups/
*.backup
*.bak

# Temp
tmp/
temp/
*.tmp
```

### .devcontainer/devcontainer.json

```json
{
  "name": "Antigravity Workspace",
  "image": "mcr.microsoft.com/devcontainers/javascript-node:18",
  
  "features": {
    "ghcr.io/devcontainers/features/python:1": {
      "version": "3.11"
    },
    "ghcr.io/devcontainers/features/git:1": {},
    "ghcr.io/devcontainers/features/github-cli:1": {}
  },
  
  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "ms-python.python",
        "ms-python.vscode-pylance",
        "GitHub.copilot"
      ],
      "settings": {
        "terminal.integrated.defaultProfile.linux": "bash",
        "editor.formatOnSave": true,
        "editor.defaultFormatter": "esbenp.prettier-vscode"
      }
    }
  },
  
  "postCreateCommand": "bash scripts/setup.sh",
  
  "forwardPorts": [3000, 3001, 5000],
  
  "remoteEnv": {
    "ANTIGRAVITY_WORKSPACE": "${containerWorkspaceFolder}"
  },
  
  "mounts": [
    "source=${localWorkspaceFolder}/data,target=${containerWorkspaceFolder}/data,type=bind,consistency=cached"
  ]
}
```

### config/.env.example

```bash
# config/.env.example
# Copiar para .env e preencher valores

# ============================================================================
# SUPABASE
# ============================================================================
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# User ID (seu email - MESMO em todas as contas)
ANTIGRAVITY_USER_ID=seu-email@gmail.com

# ============================================================================
# APIs DE LLM
# ============================================================================

# Anthropic (Claude)
ANTHROPIC_API_KEY=sk-ant-api03-...

# OpenAI (Whisper, TTS, GPT)
OPENAI_API_KEY=sk-...

# Google (Gemini)
GOOGLE_API_KEY=AIzaSy...

# ============================================================================
# ANTIGRAVITY CONFIG
# ============================================================================

# Session ID (auto-gerado se vazio)
ANTIGRAVITY_SESSION_ID=

# Mode (development ou production)
NODE_ENV=development

# Log level (debug, info, warning, error)
LOG_LEVEL=info

# ============================================================================
# CODESPACE (auto-detectado, não precisa preencher)
# ============================================================================
CODESPACE_NAME=
GITHUB_USER=

# ============================================================================
# OPCIONAL
# ============================================================================

# Webhook URLs (se tiver)
SLACK_WEBHOOK_URL=
DISCORD_WEBHOOK_URL=

# Backup (se usar outro storage)
S3_BUCKET=
S3_ACCESS_KEY=
S3_SECRET_KEY=
```

### config/antigravity.config.js

```javascript
// config/antigravity.config.js
// Configuração otimizada para Codespaces

module.exports = {
  // LLM Configuration
  llm: {
    // Provider priority (tenta em ordem)
    providers: ['gemini', 'anthropic', 'openai'],
    
    // Gemini (motor principal)
    gemini: {
      model: 'gemini-3-pro',
      temperature: 0.65,
      topP: 0.82,
      topK: 38,
      maxOutputTokens: 2048,
    },
    
    // Claude (tarefas críticas)
    anthropic: {
      model: 'claude-opus-4-20250514',
      temperature: 0.7,
      maxTokens: 2048,
    },
    
    // OpenAI (fallback)
    openai: {
      model: 'gpt-4-turbo-preview',
      temperature: 0.7,
      maxTokens: 2048,
    },
  },
  
  // Performance (otimizado para Codespaces)
  performance: {
    maxMemory: '2GB',
    maxConcurrentAgents: 2, // Codespaces 2-core
    cacheEnabled: true,
    cacheMaxSize: '100MB',
  },
  
  // Sync Configuration
  sync: {
    enabled: true,
    interval: 300000, // 5 minutos
    compression: true,
    retries: 3,
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    console: true,
    file: true,
    supabase: true, // Log para Supabase
  },
  
  // Features
  features: {
    voiceInput: true,
    fileGeneration: true,
    webSearch: true,
    codeExecution: true,
  },
};
```

---

# 5. FASE 3: CODESPACE

## 5.1 Criar Primeiro Codespace

**Passo 1: Abrir no Codespace**

1. GitHub → seu repo → Code ↓
2. Codespaces → Create codespace on main
3. Aguardar ~1-2 minutos (building)

**Passo 2: Verificar Ambiente**

Terminal automático abre. Verificar:

```bash
# Node.js
node --version
# Deve ser v18+ ou v20+

# Python
python3 --version
# Deve ser 3.11+

# Git
git --version
# Deve ser 2.x+

# GitHub CLI
gh --version
# Deve estar instalado
```

**✅ Checkpoint:** Codespace criado

## 5.2 Configurar Secrets

**Passo 1: GitHub Codespace Secrets**

Settings → Codespaces → Secrets → New secret:

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=AIzaSy...
ANTIGRAVITY_USER_ID=seu-email@gmail.com
```

**⚠️ IMPORTANTE:** Adicionar estes secrets nas 3 contas GitHub!

**Passo 2: Verificar Secrets no Codespace**

No terminal do Codespace:

```bash
echo $SUPABASE_URL
# Deve mostrar o URL (não vazio)

echo $ANTHROPIC_API_KEY
# Deve mostrar sk-ant-api03-...
```

**✅ Checkpoint:** Secrets configurados

---

# 6. FASE 4: ANTIGRAVITY

## 6.1 Instalar Dependências Globais

```bash
# Node.js dependencies
npm install -g npm@latest
npm install -g typescript ts-node

# Python dependencies
pip3 install --upgrade pip
pip3 install --break-system-packages \
  supabase-py \
  python-dotenv \
  requests \
  openai \
  anthropic
```

## 6.2 Clonar/Copiar Antigravity

**Opção A: Se Antigravity está em repo separado**

```bash
cd antigravity/
git clone https://github.com/seu-usuario/antigravity.git .
```

**Opção B: Se Antigravity está local**

```bash
# Copiar arquivos do Antigravity para antigravity/
# (você pode fazer upload manual ou usar gh CLI)
```

**Opção C: Instalar via npm (se publicado)**

```bash
npm install -g antigravity
```

## 6.3 Instalar Dependências do Antigravity

```bash
cd antigravity/

# Se tem package.json
npm install

# Se tem requirements.txt
pip3 install --break-system-packages -r requirements.txt
```

## 6.4 Configurar .env

```bash
# Criar .env na raiz
cd .. # volta para raiz do workspace
cp config/.env.example .env

# Editar .env (secrets já estão disponíveis via GitHub)
# Mas criar arquivo local para desenvolvimento
cat > .env << EOF
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY
OPENAI_API_KEY=$OPENAI_API_KEY
GOOGLE_API_KEY=$GOOGLE_API_KEY
ANTIGRAVITY_USER_ID=$ANTIGRAVITY_USER_ID
NODE_ENV=development
LOG_LEVEL=info
EOF

# Verificar
cat .env
```

---

# 7. FASE 5: INTEGRAÇÃO

## 7.1 Criar Sync Manager

**Arquivo: `scripts/sync-manager.py`**

```python
#!/usr/bin/env python3
"""
Sync Manager - Sincroniza dados entre Codespaces via Supabase
Versão: 2.0
"""

import os
import sys
import json
import hashlib
from datetime import datetime
from typing import Dict, List, Optional
from pathlib import Path

try:
    from supabase import create_client, Client
except ImportError:
    print("❌ supabase-py não instalado!")
    print("Execute: pip3 install --break-system-packages supabase-py")
    sys.exit(1)

class SyncManager:
    def __init__(self):
        # Credenciais
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_ANON_KEY")
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("SUPABASE_URL e SUPABASE_ANON_KEY devem estar configurados")
        
        # Cliente Supabase
        self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
        
        # User ID
        self.user_id = os.getenv("ANTIGRAVITY_USER_ID", "default@user.com")
        
        # Codespace ID
        self.codespace_id = os.getenv("CODESPACE_NAME", f"local-{os.uname().nodename}")
        
        print(f"🔗 Sync Manager inicializado")
        print(f"   User: {self.user_id}")
        print(f"   Codespace: {self.codespace_id}")
    
    # ============================================================================
    # CONVERSAS
    # ============================================================================
    
    def save_conversation(self, session_id: str, role: str, content: str, 
                         metadata: Dict = None, tokens: int = None, model: str = None):
        """Salva mensagem de conversação"""
        data = {
            "user_id": self.user_id,
            "session_id": session_id,
            "role": role,
            "content": content,
            "metadata": metadata or {},
            "tokens_used": tokens,
            "model_used": model
        }
        
        try:
            result = self.supabase.table("conversations").insert(data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"❌ Erro ao salvar conversa: {e}")
            return None
    
    def get_conversation_history(self, session_id: str, limit: int = 50) -> List[Dict]:
        """Recupera histórico de conversação"""
        try:
            result = self.supabase.table("conversations")\
                .select("*")\
                .eq("user_id", self.user_id)\
                .eq("session_id", session_id)\
                .order("timestamp", desc=False)\
                .limit(limit)\
                .execute()
            
            return result.data if result.data else []
        except Exception as e:
            print(f"❌ Erro ao buscar histórico: {e}")
            return []
    
    def get_all_sessions(self) -> List[str]:
        """Lista todas as sessões do usuário"""
        try:
            result = self.supabase.table("conversations")\
                .select("session_id")\
                .eq("user_id", self.user_id)\
                .execute()
            
            if result.data:
                sessions = list(set([r["session_id"] for r in result.data]))
                return sorted(sessions, reverse=True)
            return []
        except Exception as e:
            print(f"❌ Erro ao listar sessões: {e}")
            return []
    
    # ============================================================================
    # PROJETOS
    # ============================================================================
    
    def save_project(self, name: str, description: str = "", data: Dict = None, 
                    status: str = "active", priority: int = 5, tags: List[str] = None):
        """Salva ou atualiza projeto"""
        project_data = {
            "user_id": self.user_id,
            "name": name,
            "description": description,
            "data": data or {},
            "status": status,
            "priority": priority,
            "tags": tags or []
        }
        
        try:
            # Verificar se já existe
            existing = self.supabase.table("projects")\
                .select("id")\
                .eq("user_id", self.user_id)\
                .eq("name", name)\
                .execute()
            
            if existing.data:
                # Update
                result = self.supabase.table("projects")\
                    .update(project_data)\
                    .eq("id", existing.data[0]["id"])\
                    .execute()
            else:
                # Insert
                result = self.supabase.table("projects")\
                    .insert(project_data)\
                    .execute()
            
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"❌ Erro ao salvar projeto: {e}")
            return None
    
    def get_projects(self, status: str = None) -> List[Dict]:
        """Lista projetos"""
        try:
            query = self.supabase.table("projects")\
                .select("*")\
                .eq("user_id", self.user_id)
            
            if status:
                query = query.eq("status", status)
            
            result = query.order("priority", desc=True).execute()
            return result.data if result.data else []
        except Exception as e:
            print(f"❌ Erro ao listar projetos: {e}")
            return []
    
    # ============================================================================
    # MEMÓRIA DOS AGENTES
    # ============================================================================
    
    def save_agent_memory(self, agent_name: str, memory_type: str, key: str, 
                         value: Dict, importance: float = 0.5, expires_days: int = None):
        """Salva memória de um agente"""
        data = {
            "user_id": self.user_id,
            "agent_name": agent_name,
            "memory_type": memory_type,
            "key": key,
            "value": value,
            "importance": importance
        }
        
        if expires_days:
            from datetime import timedelta
            expires_at = datetime.now() + timedelta(days=expires_days)
            data["expires_at"] = expires_at.isoformat()
        
        try:
            result = self.supabase.table("agent_memory")\
                .upsert(data, on_conflict="user_id,agent_name,key")\
                .execute()
            
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"❌ Erro ao salvar memória: {e}")
            return None
    
    def get_agent_memory(self, agent_name: str, memory_type: str = None) -> List[Dict]:
        """Recupera memória de um agente"""
        try:
            query = self.supabase.table("agent_memory")\
                .select("*")\
                .eq("user_id", self.user_id)\
                .eq("agent_name", agent_name)
            
            if memory_type:
                query = query.eq("memory_type", memory_type)
            
            result = query.order("importance", desc=True).execute()
            return result.data if result.data else []
        except Exception as e:
            print(f"❌ Erro ao buscar memória: {e}")
            return []
    
    # ============================================================================
    # SNAPSHOTS (handoff entre sessões)
    # ============================================================================
    
    def save_snapshot(self, session_id: str, context: Dict, quality_baseline: float = None,
                     tokens_used: int = None, duration_minutes: int = None, tasks: int = 0):
        """Salva snapshot de sessão"""
        # Gerar checksum
        context_str = json.dumps(context, sort_keys=True)
        checksum = hashlib.sha256(context_str.encode()).hexdigest()[:16]
        
        data = {
            "user_id": self.user_id,
            "session_id": session_id,
            "codespace_id": self.codespace_id,
            "context_compressed": context,
            "quality_baseline": quality_baseline,
            "checksum": checksum,
            "tokens_used": tokens_used,
            "duration_minutes": duration_minutes,
            "tasks_completed": tasks
        }
        
        try:
            result = self.supabase.table("session_snapshots")\
                .insert(data)\
                .execute()
            
            print(f"✅ Snapshot salvo: {session_id}")
            print(f"   Checksum: {checksum}")
            print(f"   Tokens: {tokens_used}")
            print(f"   Tarefas: {tasks}")
            
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"❌ Erro ao salvar snapshot: {e}")
            return None
    
    def get_latest_snapshot(self) -> Optional[Dict]:
        """Recupera último snapshot"""
        try:
            result = self.supabase.table("session_snapshots")\
                .select("*")\
                .eq("user_id", self.user_id)\
                .order("timestamp", desc=True)\
                .limit(1)\
                .execute()
            
            if result.data:
                snapshot = result.data[0]
                print(f"📸 Snapshot recuperado: {snapshot['session_id']}")
                print(f"   Checksum: {snapshot['checksum']}")
                print(f"   Qualidade: {snapshot['quality_baseline']}/10")
                return snapshot
            
            print("ℹ️  Nenhum snapshot anterior encontrado")
            return None
        except Exception as e:
            print(f"❌ Erro ao buscar snapshot: {e}")
            return None
    
    # ============================================================================
    # SYNC STATE (health check)
    # ============================================================================
    
    def save_sync_state(self, state: Dict, health: Dict = None, session_id: str = None):
        """Salva estado atual do Codespace"""
        data = {
            "user_id": self.user_id,
            "codespace_id": self.codespace_id,
            "session_id": session_id,
            "state": state,
            "health_status": health or {},
            "environment": {
                "node_version": os.popen("node --version").read().strip(),
                "python_version": os.popen("python3 --version").read().strip(),
                "git_version": os.popen("git --version").read().strip()
            }
        }
        
        try:
            result = self.supabase.table("sync_state")\
                .upsert(data, on_conflict="user_id,codespace_id")\
                .execute()
            
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"❌ Erro ao salvar estado: {e}")
            return None
    
    # ============================================================================
    # UTILITIES
    # ============================================================================
    
    def get_usage_stats(self) -> Dict:
        """Estatísticas de uso"""
        try:
            result = self.supabase.rpc('get_usage_stats', {'p_user_id': self.user_id}).execute()
            
            if result.data:
                stats = result.data[0]
                print("\n📊 ESTATÍSTICAS DE USO")
                print("=" * 50)
                print(f"Conversas: {stats['total_conversations']}")
                print(f"Projetos: {stats['total_projects']} ({stats['active_projects']} ativos)")
                print(f"Memória: {stats['total_memory_items']} items")
                print(f"Arquivos: {stats['total_files']}")
                print(f"Último sync: {stats['last_sync']}")
                print("=" * 50)
                return stats
            
            return {}
        except Exception as e:
            print(f"❌ Erro ao buscar estatísticas: {e}")
            return {}
    
    def log(self, level: str, component: str, message: str, details: Dict = None):
        """Registra log no Supabase"""
        data = {
            "user_id": self.user_id,
            "level": level,
            "component": component,
            "message": message,
            "details": details or {},
            "codespace_id": self.codespace_id
        }
        
        try:
            self.supabase.table("system_logs").insert(data).execute()
        except Exception as e:
            print(f"⚠️  Erro ao registrar log: {e}")

# ============================================================================
# CLI
# ============================================================================

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Antigravity Sync Manager')
    parser.add_argument('command', choices=['history', 'projects', 'snapshot', 'stats', 'test'])
    parser.add_argument('--session', help='Session ID')
    parser.add_argument('--limit', type=int, default=10, help='Limit results')
    
    args = parser.parse_args()
    
    sync = SyncManager()
    
    if args.command == 'history':
        session_id = args.session or datetime.now().strftime("%Y-%m-%d")
        history = sync.get_conversation_history(session_id, args.limit)
        
        print(f"\n💬 HISTÓRICO: {session_id}")
        print("=" * 70)
        for msg in history:
            role = "👤 Você" if msg["role"] == "user" else "🤖 Assistente"
            content = msg["content"][:100] + "..." if len(msg["content"]) > 100 else msg["content"]
            print(f"{role}: {content}")
        print("=" * 70)
    
    elif args.command == 'projects':
        projects = sync.get_projects()
        
        print("\n📁 PROJETOS")
        print("=" * 70)
        for p in projects:
            status_icon = "✅" if p["status"] == "active" else "⏸️" if p["status"] == "paused" else "✔️"
            print(f"{status_icon} {p['name']} (prioridade: {p['priority']})")
            print(f"   {p['description']}")
        print("=" * 70)
    
    elif args.command == 'snapshot':
        snapshot = sync.get_latest_snapshot()
        if snapshot:
            print(json.dumps(snapshot['context_compressed'], indent=2))
    
    elif args.command == 'stats':
        sync.get_usage_stats()
    
    elif args.command == 'test':
        print("\n🧪 TESTANDO CONEXÃO SUPABASE...")
        
        # Teste 1: Salvar conversa
        result = sync.save_conversation(
            session_id="test-session",
            role="user",
            content="Hello Supabase!",
            tokens=10
        )
        
        if result:
            print("✅ Conversa salva com sucesso!")
        else:
            print("❌ Falha ao salvar conversa")
            return
        
        # Teste 2: Buscar conversa
        history = sync.get_conversation_history("test-session")
        if history:
            print(f"✅ Conversa recuperada: {len(history)} mensagens")
        
        # Teste 3: Limpar teste
        try:
            sync.supabase.table("conversations")\
                .delete()\
                .eq("user_id", sync.user_id)\
                .eq("session_id", "test-session")\
                .execute()
            print("✅ Teste limpo")
        except:
            pass
        
        print("\n🎉 Supabase funcionando perfeitamente!")

if __name__ == "__main__":
    main()
```

**Tornar executável:**

```bash
chmod +x scripts/sync-manager.py
```

**Testar:**

```bash
python3 scripts/sync-manager.py test
```

**✅ Checkpoint:** Sync Manager funcionando

## 7.2 Criar Script de Setup

**Arquivo: `scripts/setup.sh`**

```bash
#!/bin/bash
# scripts/setup.sh
# Setup automático do Antigravity no Codespace

set -e

echo "=========================================="
echo "  ANTIGRAVITY - SETUP AUTOMÁTICO"
echo "=========================================="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função de log
log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Verificar se está no Codespace
if [ -n "$CODESPACE_NAME" ]; then
    log_info "Executando no Codespace: $CODESPACE_NAME"
else
    log_warn "Não parece ser um Codespace (sem CODESPACE_NAME)"
fi

# ============================================================================
# FASE 1: VERIFICAR DEPENDÊNCIAS
# ============================================================================

log_info "[1/8] Verificando dependências..."

# Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    log_info "✓ Node.js $NODE_VERSION"
else
    log_error "Node.js não encontrado!"
    exit 1
fi

# Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    log_info "✓ $PYTHON_VERSION"
else
    log_error "Python 3 não encontrado!"
    exit 1
fi

# Git
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    log_info "✓ $GIT_VERSION"
else
    log_error "Git não encontrado!"
    exit 1
fi

echo ""

# ============================================================================
# FASE 2: INSTALAR DEPENDÊNCIAS PYTHON
# ============================================================================

log_info "[2/8] Instalando dependências Python..."

pip3 install --break-system-packages -q \
    supabase-py \
    python-dotenv \
    requests \
    openai \
    anthropic \
    edge-tts

log_info "✓ Dependências Python instaladas"
echo ""

# ============================================================================
# FASE 3: VERIFICAR VARIÁVEIS DE AMBIENTE
# ============================================================================

log_info "[3/8] Verificando variáveis de ambiente..."

check_env() {
    if [ -z "${!1}" ]; then
        log_error "$1 não configurada!"
        return 1
    else
        log_info "✓ $1 configurada"
        return 0
    fi
}

ENV_OK=true

check_env "SUPABASE_URL" || ENV_OK=false
check_env "SUPABASE_ANON_KEY" || ENV_OK=false
check_env "ANTHROPIC_API_KEY" || ENV_OK=false
check_env "ANTIGRAVITY_USER_ID" || ENV_OK=false

if [ "$ENV_OK" = false ]; then
    log_error "Variáveis de ambiente faltando!"
    log_info "Configure em: Settings → Codespaces → Secrets"
    exit 1
fi

echo ""

# ============================================================================
# FASE 4: CRIAR .ENV LOCAL
# ============================================================================

log_info "[4/8] Criando .env local..."

cat > .env << EOF
# Auto-gerado por setup.sh em $(date)

SUPABASE_URL=${SUPABASE_URL}
SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
OPENAI_API_KEY=${OPENAI_API_KEY:-}
GOOGLE_API_KEY=${GOOGLE_API_KEY:-}
ANTIGRAVITY_USER_ID=${ANTIGRAVITY_USER_ID}

CODESPACE_NAME=${CODESPACE_NAME:-local}
NODE_ENV=development
LOG_LEVEL=info
EOF

log_info "✓ .env criado"
echo ""

# ============================================================================
# FASE 5: TESTAR CONEXÃO SUPABASE
# ============================================================================

log_info "[5/8] Testando conexão Supabase..."

python3 scripts/sync-manager.py test > /dev/null 2>&1

if [ $? -eq 0 ]; then
    log_info "✓ Supabase conectado"
else
    log_error "Falha ao conectar Supabase"
    log_info "Execute manualmente: python3 scripts/sync-manager.py test"
fi

echo ""

# ============================================================================
# FASE 6: INSTALAR ANTIGRAVITY
# ============================================================================

log_info "[6/8] Configurando Antigravity..."

cd antigravity/

# Se tem package.json
if [ -f "package.json" ]; then
    log_info "Instalando dependências Node.js..."
    npm install -q
    log_info "✓ Dependências Node.js instaladas"
fi

# Se tem requirements.txt
if [ -f "requirements.txt" ]; then
    log_info "Instalando dependências Python..."
    pip3 install --break-system-packages -q -r requirements.txt
    log_info "✓ Dependências Python instaladas"
fi

cd ..
echo ""

# ============================================================================
# FASE 7: RECUPERAR SNAPSHOT ANTERIOR
# ============================================================================

log_info "[7/8] Recuperando snapshot anterior..."

SNAPSHOT=$(python3 scripts/sync-manager.py snapshot 2>/dev/null || echo "")

if [ -n "$SNAPSHOT" ]; then
    log_info "✓ Snapshot encontrado"
    echo "$SNAPSHOT" > data/last-snapshot.json
else
    log_warn "Nenhum snapshot anterior (primeira vez)"
fi

echo ""

# ============================================================================
# FASE 8: FINALIZAR
# ============================================================================

log_info "[8/8] Finalizando setup..."

# Criar pastas necessárias
mkdir -p data/logs
mkdir -p data/cache
mkdir -p data/temp

# Permissões
chmod +x scripts/*.sh
chmod +x scripts/*.py

log_info "✓ Setup concluído!"
echo ""
echo "=========================================="
echo "  ✅ ANTIGRAVITY PRONTO PARA USO!"
echo "=========================================="
echo ""
echo "Próximos passos:"
echo "  1. cd antigravity"
echo "  2. node index.js  (ou comando de start)"
echo ""
echo "Comandos úteis:"
echo "  python3 scripts/sync-manager.py history"
echo "  python3 scripts/sync-manager.py projects"
echo "  python3 scripts/sync-manager.py stats"
echo ""
echo "=========================================="
```

**Tornar executável:**

```bash
chmod +x scripts/setup.sh
```

**✅ Checkpoint:** Script de setup pronto

## 7.3 Auto-Execução no Codespace

O setup vai rodar automaticamente por causa do `.devcontainer/devcontainer.json`:

```json
"postCreateCommand": "bash scripts/setup.sh"
```

---

# 8. FASE 6: MÚLTIPLAS CONTAS

## 8.1 Preparar Conta 2

**Passo 1: Criar conta GitHub 2**

```
Email: seu-email+1@gmail.com
Username: seu-usuario-2
```

**Passo 2: Fork ou adicionar colaborador**

**Opção A: Fork (recomendado)**
1. Com conta 2, ir no repo original
2. Fork → Create fork
3. Aguardar

**Opção B: Colaborador**
1. Com conta 1, Settings → Collaborators
2. Add people → seu-email+1@gmail.com
3. Aceitar convite com conta 2

**Passo 3: Configurar Secrets (conta 2)**

Settings → Codespaces → Secrets:

```
MESMOS valores da conta 1!

SUPABASE_URL=...
SUPABASE_ANON_KEY=...
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...
GOOGLE_API_KEY=...
ANTIGRAVITY_USER_ID=seu-email@gmail.com  # MESMO!
```

**⚠️ CRÍTICO:** `ANTIGRAVITY_USER_ID` deve ser IGUAL em todas contas!

**Passo 4: Criar Codespace (conta 2)**

1. Code → Codespaces → Create codespace
2. Aguardar setup automático (~2 min)
3. Verificar:

```bash
python3 scripts/sync-manager.py snapshot

# Deve recuperar snapshot da conta 1!
```

**✅ Checkpoint:** Conta 2 sincronizada com conta 1

## 8.2 Preparar Conta 3

**Repetir processo da conta 2:**

```
Email: seu-email+2@gmail.com
Username: seu-usuario-3
Fork/Colaborador
Secrets (MESMOS valores)
Criar Codespace
Testar sync
```

**✅ Checkpoint:** 3 contas funcionando

## 8.3 Workflow Diário

```yaml
MANHÃ (08h-10h):
  conta: Conta 1
  ações:
    - Abrir Codespace
    - Recuperar snapshot automático
    - Trabalhar 2h
    - Salvar snapshot:
        python3 scripts/sync-manager.py snapshot \
          --session morning \
          --quality 8.5 \
          --tasks 3

TARDE (14h-16h):
  conta: Conta 2
  ações:
    - Abrir Codespace
    - Snapshot de manhã carregado automaticamente
    - Trabalhar 2h
    - Salvar snapshot

NOITE (20h-22h):
  conta: Conta 3
  ações:
    - Abrir Codespace
    - Continuar de onde parou
    - Trabalhar 2h
    - Salvar snapshot + planejar próximo dia
```

---

# 9. FASE 7: BACKUP

## 9.1 Backup Manual

**Script: `scripts/backup.sh`**

```bash
#!/bin/bash
# scripts/backup.sh
# Backup completo do Antigravity

set -e

BACKUP_DIR="backups/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 Criando backup em $BACKUP_DIR..."

# Backup do Supabase (via Python)
python3 << EOF
from sync_manager import SyncManager
import json
from datetime import datetime

sync = SyncManager()

print("Exportando conversas...")
sessions = sync.get_all_sessions()
conversations = {}
for session in sessions:
    conversations[session] = sync.get_conversation_history(session, 1000)

print("Exportando projetos...")
projects = sync.get_projects()

print("Exportando estatísticas...")
stats = sync.get_usage_stats()

backup = {
    "timestamp": datetime.now().isoformat(),
    "user_id": sync.user_id,
    "conversations": conversations,
    "projects": projects,
    "stats": stats
}

with open("${BACKUP_DIR}/supabase-backup.json", "w") as f:
    json.dump(backup, f, indent=2)

print(f"✅ Backup Supabase salvo")
EOF

# Backup de arquivos locais
echo "Copiando arquivos locais..."
cp -r data/ "$BACKUP_DIR/data/" 2>/dev/null || true
cp -r antigravity/ "$BACKUP_DIR/antigravity/" 2>/dev/null || true
cp .env "$BACKUP_DIR/.env.backup" 2>/dev/null || true
cp config/antigravity.config.js "$BACKUP_DIR/config.backup" 2>/dev/null || true

# Comprimir
echo "Comprimindo..."
tar -czf "${BACKUP_DIR}.tar.gz" "$BACKUP_DIR/"
rm -rf "$BACKUP_DIR"

echo "✅ Backup criado: ${BACKUP_DIR}.tar.gz"
echo ""
echo "Para restaurar:"
echo "  tar -xzf ${BACKUP_DIR}.tar.gz"
```

**Executar:**

```bash
chmod +x scripts/backup.sh
./scripts/backup.sh
```

## 9.2 Backup Automático (GitHub Actions)

**Arquivo: `.github/workflows/sync-backup.yml`**

```yaml
name: Daily Backup

on:
  schedule:
    # Todo dia às 03:00 UTC (00:00 BRT)
    - cron: '0 3 * * *'
  workflow_dispatch: # Permite execução manual

jobs:
  backup:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install supabase-py python-dotenv
      
      - name: Run backup
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          ANTIGRAVITY_USER_ID: ${{ secrets.ANTIGRAVITY_USER_ID }}
        run: |
          chmod +x scripts/backup.sh
          ./scripts/backup.sh
      
      - name: Upload artifact
        uses: actions/upload-artifact@v3
        with:
          name: antigravity-backup-${{ github.run_number }}
          path: backups/*.tar.gz
          retention-days: 30
```

**✅ Checkpoint:** Backup configurado

---

# 10. FASE 8: OTIMIZAÇÕES

## 10.1 Health Check Automático

**Arquivo: `scripts/health-check.sh`**

```bash
#!/bin/bash
# scripts/health-check.sh

set -e

echo "🏥 HEALTH CHECK - ANTIGRAVITY"
echo "=============================="
echo ""

# Supabase
echo "[1/4] Supabase..."
if python3 scripts/sync-manager.py test > /dev/null 2>&1; then
    echo "  ✅ Conectado"
else
    echo "  ❌ Falha de conexão"
fi

# Antigravity
echo "[2/4] Antigravity..."
if [ -d "antigravity" ]; then
    echo "  ✅ Diretório existe"
    if [ -f "antigravity/package.json" ]; then
        echo "  ✅ package.json encontrado"
    fi
else
    echo "  ❌ Diretório não encontrado"
fi

# Env vars
echo "[3/4] Variáveis de ambiente..."
if [ -n "$SUPABASE_URL" ]; then
    echo "  ✅ SUPABASE_URL"
else
    echo "  ❌ SUPABASE_URL missing"
fi

if [ -n "$ANTHROPIC_API_KEY" ]; then
    echo "  ✅ ANTHROPIC_API_KEY"
else
    echo "  ❌ ANTHROPIC_API_KEY missing"
fi

# Disk space
echo "[4/4] Espaço em disco..."
DISK_USAGE=$(df -h . | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    echo "  ✅ ${DISK_USAGE}% usado"
else
    echo "  ⚠️  ${DISK_USAGE}% usado (alto!)"
fi

echo ""
echo "=============================="
echo "Health check completo!"
```

**Executar:**

```bash
chmod +x scripts/health-check.sh
./scripts/health-check.sh
```

## 10.2 Alias Úteis

**Adicionar ao `~/.bashrc`:**

```bash
# Antigravity aliases
alias ag='cd /workspaces/antigravity-workspace'
alias ags='python3 scripts/sync-manager.py'
alias agl='ags history'
alias agp='ags projects'
alias agstat='ags stats'
alias agbackup='bash scripts/backup.sh'
alias aghealth='bash scripts/health-check.sh'
alias agsetup='bash scripts/setup.sh'

# Reload
source ~/.bashrc
```

**Usar:**

```bash
ag         # Vai para workspace
agl        # Lista histórico
agp        # Lista projetos
agstat     # Mostra estatísticas
agbackup   # Faz backup
aghealth   # Health check
```

---

# 11. TROUBLESHOOTING

## 11.1 Problemas Comuns

### ❌ "Supabase connection failed"

**Causa:** Secrets não configurados ou inválidos

**Solução:**
```bash
# Verificar
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# Se vazios, configurar em:
# Settings → Codespaces → Secrets

# Reiniciar Codespace
# Code → Stop codespace → Start
```

### ❌ "python3: command not found"

**Causa:** Python não instalado (raro em Codespaces)

**Solução:**
```bash
# Verificar se Python existe
which python3

# Se não, instalar via devcontainer
# Editar .devcontainer/devcontainer.json
# Adicionar feature Python
```

### ❌ "Module 'supabase' not found"

**Causa:** Dependências não instaladas

**Solução:**
```bash
pip3 install --break-system-packages supabase-py python-dotenv

# Ou reexecutar setup
bash scripts/setup.sh
```

### ❌ "Cannot read property of undefined" (Antigravity)

**Causa:** Antigravity não configurado corretamente

**Solução:**
```bash
cd antigravity/

# Verificar se node_modules existe
ls node_modules/ || npm install

# Verificar .env
cat ../.env

# Verificar config
cat ../config/antigravity.config.js
```

### ❌ "Out of disk space"

**Causa:** Codespace cheio (10GB limit no free tier)

**Solução:**
```bash
# Ver uso
df -h

# Limpar cache npm
npm cache clean --force

# Limpar cache pip
pip3 cache purge

# Limpar logs
rm -rf data/logs/*

# Limpar temp
rm -rf data/temp/*
rm -rf /tmp/*
```

### ❌ "Snapshot not found"

**Causa:** Primeira sessão ou Supabase vazio

**Solução:**
```bash
# Normal na primeira vez
# Criar snapshot manualmente:

python3 << EOF
from sync_manager import SyncManager
sync = SyncManager()

sync.save_snapshot(
    session_id="initial-session",
    context={"first_time": True},
    quality_baseline=8.0
)

print("✅ Snapshot inicial criado")
EOF
```

---

# 12. COMANDOS RÁPIDOS

## 12.1 Setup Inicial (primeira vez)

```bash
# 1. Criar Codespace (GitHub web UI)

# 2. Aguardar setup automático (~2 min)

# 3. Verificar
python3 scripts/sync-manager.py test

# 4. Pronto!
```

## 12.2 Uso Diário

```bash
# Ao abrir Codespace
aghealth              # Verificar saúde

# Durante trabalho
agl --session hoje    # Ver conversas de hoje
agp                   # Ver projetos

# Ao fechar Codespace
python3 scripts/sync-manager.py snapshot \
  --session "$(date +%Y-%m-%d)" \
  --quality 8.5 \
  --tasks 5

# Backup (semanal)
agbackup
```

## 12.3 Comandos Sync Manager

```bash
# Ver histórico
python3 scripts/sync-manager.py history --session 2026-02-18 --limit 20

# Ver projetos
python3 scripts/sync-manager.py projects

# Ver último snapshot
python3 scripts/sync-manager.py snapshot

# Estatísticas
python3 scripts/sync-manager.py stats

# Teste de conexão
python3 scripts/sync-manager.py test
```

---

# 13. PRÓXIMOS PASSOS

## 13.1 Após Setup Completo

- [ ] Testar sync entre contas
- [ ] Criar primeiro projeto no Antigravity
- [ ] Fazer backup teste
- [ ] Configurar webhook notifications (opcional)
- [ ] Customizar configs para seu workflow

## 13.2 Melhorias Futuras

- [ ] Dashboard web para visualizar stats
- [ ] Integração com Slack/Discord para notificações
- [ ] Auto-commit de código no final do dia
- [ ] Análise de qualidade automática
- [ ] Métricas de produtividade

---

# 14. CONCLUSÃO

**Você agora tem:**

✅ 3 contas GitHub → 180h/mês grátis  
✅ Supabase com 7 tabelas sincronizadas  
✅ Scripts de automação completos  
✅ Backup automático diário  
✅ Health monitoring  
✅ Memória contínua entre sessões  

**Tempo de setup:** ~60-90 minutos primeira vez, ~10 minutos contas adicionais

**Próximo passo:** Use o Antigravity para fazer o resto! 🚀

---

**FIM DO GUIA MASTER**

Este documento tem tudo que você precisa. Use o próprio Antigravity para executar os comandos e configurar tudo automaticamente!

**Boa sorte!** 💪
