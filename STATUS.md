> 🔴 [SKYROS]: ISOLATION MODE ENGAGED. O operador está em Deep Work. Novas tarefas, brainstorms paralelos ou pesquisas que fujam da SPRINT atual devem ser TERMINANTEMENTE negadas até o término da sessão.

# KAIROS — STATUS (Fila de Trabalho)

> **Última atualização:** 2026-04-29T12:42:00-03:00
> **Estado Operacional:** 🚀 MVP AI OPS SPRINT | Engine Triage v4 EMBEDDED | God Pool 84 keys ATIVO | IA Council: 6.9/10
> **Agente:** NOESIS (KAIROS) · Hat: @aiox-master (Orchestrator)
> **Sprint:** MVP Template → Cases Leticia + Paulo (HOJE) → Squads Internos → Dashboard 360

---

## 🔬 INTEGRITY RUN — 2026-04-25

> **17 tasks AIOX executadas via Engine Triage v4 (10 Fases)**
> Relatório completo: `docs/reports/kairox-integrity-report-2026-04-25.md`

### ✅ P0 Actions — CONCLUÍDAS HOJE

- [x] **RAG Reindexado:** 1787 files · 58.152 chunks · 56.085 termos únicos (era 721h stale)
- [x] **IA Council ativado:** Score 6.9/10 · 26 gaps · `council-gaps.json` gerado
- [x] **Migration SQL criada:** `supabase/migrations/001_initial_schema.sql` (8 tabelas + extensões + índices)
- [x] **SELF_CONTEXT.md atualizado:** Problemas abertos, Council Score, RAG status
- [x] **Relatório de integridade:** `docs/reports/kairox-integrity-report-2026-04-25.md`
- [x] **package.json:** `"type": "module"` revertido (scripts KAIROS usam CJS — migração necessária)

### 🟡 P1 Actions — Próximos 7 dias

- [ ] Refatorar tasks legadas para Triage v4 (914 arquivos — script de migração automática)
- [ ] Criar `squads/*/squad.json` para 21 squads sem manifesto
- [ ] Ativar Scheduler (`scripts/scheduler.js`) — automação 24/7
- [ ] Criar `docs/reports/task-usage-map.md` — curadoria do ecossistema
- [ ] Deploy HEAD 1 N8N + Postgres (RAILWAY_API_TOKEN pendente)
- [ ] Error handling em `scripts/skyros/isolation-mode.js` e `triage-matinal.js` (Council sev=4)
- [ ] Try-catch em `scripts/mcp-sse-bridge.js` (Council sev=6 — risco de falha silenciosa)
- [ ] PM templates: `pm1-reasoning`, `pm2-execution`, `pm3-evaluation` (Council sev=8 — TOP GAP)

---

## 🔴 BOSS FIGHTS — MVP AI OPS (2026-04-29)

> **Engine Triage v4 ATIVA:** Toda ação abaixo já passou pelas 10 fases. Executar sem cerimônia.

### BOSS FIGHT 1 — Leticia (Esteticista Autônoma) 💅 [APRESENTAÇÃO HOJE]
- **Objetivo:** Brief completo + scripts de atendimento prontos para apresentar hoje
- **Dores mapeadas:** Agendamentos perdidos, clientes sumidos, sem follow-up pós-atendimento
- **Canais-alvo:** WhatsApp (principal), Instagram (secundário)
- **Entrega MVP:** Script de atendimento WhatsApp + lembretes automáticos + reativação de sumidas
- **Owner:** @commerce-sales + @commerce-clone + Operador

### BOSS FIGHT 2 — Paulo (Tapeceiro / Ateliê) 🧵 [APRESENTAÇÃO HOJE]
- **Objetivo:** Brief completo + scripts adaptados para ateliê artesanal
- **Contexto:** Em transição para WhatsApp Business
- **Dores mapeadas:** Triagem de pedidos no WA, status de serviço, combinar entrega/retirada
- **Entrega MVP:** Script triagem + acompanhamento de status + confirmação de entrega
- **Owner:** @commerce-sales + @commerce-clone + Operador

### BOSS FIGHT 3 — Hortifruti (Elaine) 🥦 [TRIAL ATIVO]
- **Objetivo:** Manter trial ativo + calibrar persona bot
- **Ação:** Morning Report configurado + calibração de respostas
- **Ticket alvo:** R$ 497–997/mês
- **Owner:** @commerce-clone + Operador

### BOSS FIGHT 4 — Porto Alemão 🍺 [MAPEADO]
- **Objetivo:** Reconectar QR Code + retomar atendimento
- **Owner:** @commerce-sales

### BOSS FIGHT 5 — Felix Cell 📱 [MAPEADO]
- **Objetivo:** Setup Onboarding + Bot Clone + IG Posts
- **Owner:** @commerce-clone + @mvp-media (a criar)

---

## 🔴 BLOQUEIOS ATUAIS

- **Bun Build:** Inviável pelo hardware atual (6GB RAM). Usar `node scripts/mcp-server.js`.
- **RAILWAY_API_TOKEN:** Pendente — HEAD 1 (N8N + Postgres) não deployado.
- **Cases Leticia/Paulo:** Briefing não capturado ainda. Coletar antes das apresentações hoje.

---

### 💬 HANDOFF (2026-04-29 — 12h42)
- **Sessão:** MVP AI OPS Sprint iniciado. Estratégia de agência postergada. Novos cases: Leticia + Paulo (apresentação hoje). Engine Triage v4 embedded nos workflows core. /triage eliminado.
- **Plano:** `implementation_plan.md` criado no brain (Antigravity). Aguardando aprovação para FASE 0.
- **Próximo:** Criar cases Leticia + Paulo (FASE 0) + Criar squads internos MVP (FASE 1).

### MCP Server v5.0.0-hivemind (Local JS) — ✅ OPERACIONAL
- [x] v1.0→v2.0→v3.0→v4.0→v5.0: 28 tools, 28/28 tests
- [x] SKYROS tools integradas (skyros_triage, skyros_isolation)
- [x] **Hivemind Protocol v1.0:** 5 tools de sincronia multi-agente
- [x] Antigravity reiniciado e operacional nas 2 instâncias (PC e Note)

### MCP Servers Antigravity — ✅ CONFIGURADOS (5 servers)
- [x] aiox-kairos (28 tools KAIROS+SKYROS+Hivemind)
- [x] sequential-thinking (raciocínio step-by-step)
- [x] github (ops de repositório — token ativo)
- [x] context7 (library docs lookup)
- [x] huggingface (models/papers/spaces search)
- [x] brave-search REMOVIDO (placeholder key causava crash MCP) — usar search_web nativo

### CLIs — ✅ INSTALADOS
- [x] Railway CLI (`npm i -g @railway/cli`)
- [x] GitHub CLI (`gh` v2.67.0 via MSI)
- [x] Supabase CLI (`supabase` v2.78.1 via Scoop)

### Tokens Configurados (.env)
- [x] RAILWAY_TOKEN=6e288ae4-...
- [x] HF_TOKEN=hf_inriELdg...
- [x] GEMINI_API_KEY + 5 GOOGLE_API_KEYS
- [x] GROQ_API_KEY (2 keys)
- [x] COMPOSIO_API_KEY

### Task-First Protocol v1.0 — ✅ ATIVO
- [x] Regra em `aiox-master.md` + `KAIROS.md`
- [x] Workflows `/KAIROS`, `/boot`, `/context` atualizados (TASK-FIRST, MCP-FIRST, HAT-SWITCHING, HYDRA-AWARE, FULL-ECOSYSTEM)
- [x] Triage Engine v4 adaptada: Fase 1 → Classificar Task, Fase 2 → Auto-assign agente implícito
- [x] boot.md FASE 5.5: Subsistemas sempre ativos
- [x] boot.md FASE 5.6: Ruflo ecosystem documentado

### Limpeza AIOS → AIOX — ✅ COMPLETO
- [x] `.aios-core/` → `.aios-core-deprecated/` (conteúdo exclusivo migrado)
- [x] Docs AIOS_* renomeados para AIOX_*
- [x] MCP config: `aios-kairos` → `aiox-kairos`
- [x] Squads c-level/sales/jarvis corrigidos (agents em `agents/` subdir)
- [x] Squad `_example` removido
- [x] Task `load-reasoning-package.md` criada no AIOX
- [x] Zero referências residuais a `.aios-core` no codebase

### ✅ EXECUÇÃO SOBERANA KAIROX (God Pool VALIDADO — 84 keys)

| Provedor | Keys | Modelos Alvos | Função no KAIROX |
|---|---|---|---|
| **Groq** | 14 | Llama 3 70B / 8B | Automação rápida e sub-agentes |
| **Gemini** | 13 | Gemini Flash / Pro | Longo contexto e busca |
| **Together** | 10 | Llama 3.1 / Mixtral | Fallback general purpose |
| **SambaNova** | 16 | Llama 3.1 70B | Triage e alta velocidade |
| **OpenRouter** | 16 | Claude / GPT-4o / Multi | Tarefas complexas delegadas |
| **Cerebras** | 15 | Llama 3.1 70B | Paralelismo denso |

**Arquitetura:** `godPool.ts` → parser tab-indent de `Keys.md` → injeção via `openaiShim.ts` per-request + `geminiAuth.ts`. Round-robin aleatório por chamada.

### 💻 HARDWARE LOCAL

| Spec | Valor |
|---|---|
| CPU | Intel Celeron E3300 @ 2.50GHz (2 cores) |
| RAM | 6 GB |
| GPU | NVIDIA GeForce 7300 SE (256MB, 2006, SEM CUDA) |
| Veredicto | **0% viável para AI local — cloud obrigatório** |

### ☁️ CLOUD GPU FREE-TIER (ranking para SKYDRA)

| Plataforma | GPU | VRAM | Limite | Prioridade |
|---|---|---|---|---|
| **HuggingFace ZeroGPU** | H200 | **70GB** | Quota diária | 🥇 1º |
| **Lightning AI** | A100/H100 | 40-80GB | 15 créditos/mês | 🥈 2º |
| **Kaggle** | T4/P100 | 16GB | 30h/semana | 🥉 3º |
| **Google Colab** | T4 | 16GB | ~6h sessão | 4º |
| **Google Colab** | T4 | 16GB | ~6h sessão | 4º |

**Estratégia Definitiva:** Dependência **zero** de GPU própria. Toda a inteligência da HYDRA baseada nas arquiteturas multi-provider do God-Pool (Groq, OpenRouter, Gemini) atreladas ao Daemom do KAIROX em node.

---

## 🟠 PROJETO HYDRA — 4 HEADS (Cross-Sessão 72aba841)

### Arquitetura
| Head | Componente | Status |
|---|---|---|
| HEAD 1 | N8N + PostgreSQL | ⏳ Código pronto, deploy pendente |
| HEAD 2 | OpenClaw Server (15 Railway Skills) | ⏳ Código pronto, deploy pendente |
| HEAD 3 | SKY Python Backend (55+ tools, CrewAI, Composio) | ✅ Deploy Railway ativo |
| HEAD 4 | Evolution API (WhatsApp gateway) | 🟡 Parcial (hortifruti OK, porto-alemao close) |

### OpenClaw Railway Skills (15 Total)
- **Tier 1 Deployment (4):** deploy_service, update_config, restart, remove
- **Tier 2 Observability (5):** status, logs, metrics, http_metrics, diagnose
- **Tier 3 Storage (3):** volumes, buckets, variables
- **Tier 4 Orchestration (3):** search_env, deploy_template, ref_variable
- **Tier 5 Code (1):** create/update functions

### MCP Server Python/FastAPI (18 Tools) — `kairos-orchestrator/mcp_server/`
- **N8N (4):** create/list/execute/logs workflows
- **Database (3):** run_sql, backup, restore
- **Client Mgmt (4):** create/list/metrics/scale client environments
- **Infra (3):** status, metrics, restart_component
- **Integrations (2):** create_webhook, list_integrations

### HYDRA Checklist de Validação
**FASE 1: Railway Setup**
- [ ] RAILWAY_API_TOKEN gerado
- [ ] Railway Bridge deployed (port 3002)
- [ ] GraphQL queries testadas

**FASE 2: Experia VPS**
- [ ] Docker Compose stack running (MCP+PG+n8n+Evolution)
- [ ] PostgreSQL initialized (init_db.sql)
- [ ] N8N accessible (port 5678)
- [ ] MCP Server Python health check OK (port 3001)

**FASE 3: Railway Deployments (4 Heads)**
- [ ] HEAD 1: N8N + Postgres
- [ ] HEAD 2: OpenClaw Server
- [x] HEAD 3: SKY Python Backend
- [ ] HEAD 4: Evolution API (full)

**FASE 4: Integrations**
- [ ] OpenClaw Skills loaded (15)
- [ ] MCP Python Server connected
- [ ] N8N workflows executable
- [ ] Client environments creatable
- [ ] WhatsApp connected (Evolution)

**FASE 5: Validation**
- [ ] End-to-end test
- [ ] All 4 heads communicating
- [ ] Autonomous operations working

### Código Pronto (não deployado)
| Arquivo | Função |
|---|---|
| `kairos-orchestrator/mcp_server/mcp_server.py` | MCP Server FastAPI (18 tools) |
| `kairos-orchestrator/bridges/railway_bridge.py` | 15 Railway Skills (httpx) |
| `kairos-orchestrator/bridges/railway_gql.py` | GraphQL Client |
| `kairos-orchestrator/mcp_server/init_db.sql` | Schema 6 tabelas |
| `kairos-orchestrator/mcp_server/Dockerfile` | Container MCP |
| `kairos-orchestrator/mcp_server/docker-compose.yml` | Stack completa |

### Credenciais (status)
| Credencial | Status |
|---|---|
| RAILWAY_API_TOKEN | ❌ PENDENTE |
| MCP_API_KEY | ⏳ Definir |
| N8N_API_KEY | ❌ PENDENTE |
| COMPOSIO_API_KEY | ✅ ak_6pj-rP1ExkVjlQu91M3n |

---

## 🟡 SUBSISTEMAS DORMANT (Prioridade de Ativação)

> Da sessão 72aba841 — 85% dos scripts JS estão DORMANT

| # | Subsistema | Arquivo | Impacto |
|---|---|---|---|
| 1 | RAG Engine | `scripts/rag-engine.js` | 🔥🔥🔥 Auto-contexto |
| 2 | Scheduler | `scripts/scheduler.js` | 🔥🔥🔥 Automação 24/7 |
| 3 | IA Council Engine | `scripts/evolution/ia-council-engine.js` | 🔥🔥🔥 8 mentes auditando |
| 4 | Noesis Pipeline | `scripts/evolution/noesis-pipeline.js` | 🔥🔥🔥 Loop cognitivo |
| 5 | Dashboard JARVIS | `scripts/dashboard.js` | 🔥🔥 Visualização |

### Anomalias Conhecidas
- 85% dos scripts JS DORMANT — nunca executados em produção
- Duplicação conceitual: scripts/ JS vs kairos-orchestrator/ Python
- Engine/ night-reports stale (fev/2026)
- .aiox-core/workflow-intelligence/ nunca ativado
- tools/ ~21K arquivos, utilização efetiva < 5%

---

## 🚀 PRÓXIMO MILESTONE: SKORTEX CLI IDE

> Construir a IDE CLI própria ilimitada, baseada no SKYROS Agent v2.0 já existente em `skyros-agent/`.
> Objetivo: substituir Antigravity com capacidade de spawnar N agentes simultâneos.

| Fase | Descrição | Status |
|------|-----------|--------|
| 1 | Core Loop + Providers (Gemini/Groq/HF) | ✅ Construído pelo Agente C |
| 2 | Tool System (9 builtins + 27 MCP Bridge) | ✅ Expansão Fase 3 (git, grep, web, glob) |
| 3 | KAIROS Integration (Personas/Context/RPs) | ✅ Construído pelo Agente C |
| 4 | Memory System (Session Store + Compactor) | ✅ Construído pelo Agente C |
| 5 | CLI Entry Point (Commander.js + REPL) | ✅ Atualizado com *spawn, *orchestra, *hivemind |
| 6 | Supabase Sync Client (Multi-Instance) | ✅ Task auto-claim (S11) integrado |
| 7 | API Keys válidas (Gemini/HF/Groq) | ⏳ Keys exaustas, regenerar |
| 8 | Multi-Agent Spawner (N processos CLI) | ✅ Orchestrator + SubAgent pipeline construídos |
| 9 | Daemon Mode (Auto-Task execution) | ✅ Scheduler + Polling de Supabase |
| 10 | Validação end-to-end (Consolidação) | ⏳ PENDENTE — **Próximo foco principal** |

---

## ✅ CONCLUÍDO RECENTEMENTE

| Data | O que |
|---|---|
| 2026-04-29 | **Estratégia AI OPS definida:** Experia agência postergada indefinidamente. Foco: solopreneur AI OPS com free trials 20 dias → case studies → freelas → agência. |
| 2026-04-29 | **Engine Triage v4 EMBEDDED:** /triage workflow deletado. Triage v4 nativa em /boot (FASE 5.7) + /context (Passo 4.6) + /KAIROS. Permanente. |
| 2026-04-29 | **SELF_CONTEXT + STATUS atualizados:** nova estratégia, novos clientes Leticia/Paulo, Boss Fights reformulados, bloqueios atualizados. |
| 2026-04-29 | **RP Session Handoff criado:** `reasoning-packages/tasks/RP-20260429-MVP-AIOPS-SESSION-HANDOFF-v1.0.md` — contexto completo para retomar sessão ou contextualizar nova LLM. |
| 2026-04-29 | **Plano MVP AI OPS criado:** implementation_plan.md no Antigravity brain — 4 fases, 10 tasks mapeadas, stack técnica definida (Gemini pool + N8N + OpenClaw). |
| 2026-04-29 | **context.md atualizado:** Passo 4.6 Triage v4 embedded + clientes Leticia/Paulo + MCP v5.0.0 (28 tools). |
| 2026-04-04 | **Skortex CLI v1.0** (`9b0c59ad`): InferenceFactory (Qwen→Groq→Gemini), Pre-Flight Engine (auto-contexto), Autopilot Save. TS: 0 erros. |
| 2026-04-03 | **SKORTEX v3.0 Sovereign Engine** — Hivemind P2P, Orchestrator para sub-agentes, 4 novas tools, Daemon mode |
| 2026-04-03 | **Shared Brain Protocol COMPLETO** — 7 tabelas Supabase, ACTIVE_WORK.md, SESSION_LOG.md, /sync workflow, shared-brain-bus.js v2 |
| 2026-04-03 | **SKYROS Agent v2.0** — CLI completo com 15+ arquivos, MCP Bridge, HF Provider, Supabase Sync Client |
| 2026-04-03 | **Hivemind Consolidada** — Agentes A+C sincronizados, review cruzada completa, 4 agentes auditados, plan A + código B fundidos. |
| 2026-04-03 | **Hivemind Protocol v1.0:** 5 MCP tools, decision log JSONL, agent registry JSON. MCP v5.0.0-hivemind (28/28 tests). |
| 2026-04-03 | **12 Squads SynkraAI integrados:** apex, brand, curator, deep-research, dispatch, education, kaizen, kaizen-v2, legal-analyst, seo, squad-creator, squad-creator-pro |
| 2026-04-02 | **Git Push completo:** KAIROX (`b9f53b58`) + apex-conductor (`8797268`) |
| 2026-04-02 | **SKYROS Dashboard v1 pushado:** Morning Brief, Night Check-in, Triage, Pareto |
| 2026-04-02 | **Apex Conductor gamificado:** ParetoFilter, BossRoom, LootShop, Sanctuary |
| 2026-04-02 | **Handoff Notebook→PC:** `docs/handoffs/HANDOFF-2026-04-02-notebook-to-pc.md` |
| 2026-04-02 | **Claude Code analysis salva:** `docs/research/claude-code-analysis.md` |
| 2026-03-31 | **Hivemind P2P Ativa** (Syncthing conectando PC e Notebook) |
| 2026-03-31 | **SKYROS** (Isolation + Triage + Anamnesis) implantado 100% no PC Principal |
| 2026-03-31 | **SKYDRA Conectors** (RedHat vLLM + Supabase SQL) forjados |
| 2026-03-26 | **Engine Triage v4 (10 fases)** injetado em rules.md v4.0 |

---

## 📊 MÉTRICAS DO SISTEMA

| Métrica | Valor |
|---|---|
| MCP Tools (JS local) | **28** (10 AIOS + 13 KAIROS + 5 Hivemind) |
| MCP Tools (Python/HYDRA) | **18** (pendente deploy) |
| OpenClaude Skills (migradas) | **17** (analyst→ux-design, workflows nativos) |
| Tasks AIOX | 204 |
| Workflows AIOX | 17 (migrados para `.claude/skills/`) |
| Agentes AIOX | 12 |
| Squads | **21** (9 próprios + 12 comunidade SynkraAI) |
| RPs | **44** (36 strategic + 7 core + 1 tasks) |
| Tool Integrations | 23 |
| **God Pool Keys** | **84** (6 provedores) |
| API Providers | **6** (Groq, Gemini, Together, SambaNova, OpenRouter, Cerebras) |
