# 👑 KAIROX COGNITION CORE — A Pedra de Roseta

> Documento mestre de resgate de cognição. Contém a essência estratégica e técnica extraída da fase AIOS -> KAIROX.

## 🏛️ Arquitetura Soberana (HYDRA)

O sistema opera sob o modelo de **4 Cabeças (HEADS)**, garantindo resiliência e independência de hardware local:

| Head | Componente | Status | Função |
|---|---|---|---|
| **HEAD 1** | N8N + PostgreSQL | ⏳ Deploy Pendente | Automação Visual e Persistência |
| **HEAD 2** | OpenClaw Server | ⏳ Deploy Pendente | Hub de Integração (15 Skills Railway) |
| **HEAD 3** | SKY Python Backend | ✅ **ATIVO** (Railway) | Motor de Squads (crewAI) e Telegram |
| **HEAD 4** | Evolution API | 🟡 Parcial (Hortifruti) | Gateway WhatsApp |

## 🧠 Protocolos Fundamentais

1.  **Task-First Protocol:** Toda demanda deve ser classificada e fatiada *antes* da execução.
2.  **Agent-First Protocol:** Sempre identificar e ativar o agente especializado (@dev, @architect, etc.) antes de iniciar.
3.  **Engine Triage v4 (10 Fases):** Fluxo obrigatório: Intenção → Ignition → Advisory → Squad → Surface Check → Ecosystem → Executar → Quality Gate → Session State → Output.
4.  **Hivemind Protocol v1.0:** Sincronização multi-agente via `engine/hivemind/decisions.jsonl`. Write eagerly, Read on activation.

## 🛠️ Arsenal Técnico

- **Core Engine:** AIOX v5.0.0 (fork SynkraAI).
- **MCP Server v5.0.0:** 28 tools ativas (aiox-kairos). Arquivo: `scripts/mcp-server.js`.
- **SKORTEX (SKYROS Agent):** CLI v3.0 funcional em `skyros-agent/`. Substituto do Antigravity.
- **God Pool:** 84 keys de 6 provedores (Gemini, Groq, Together, SambaNova, OpenRouter, Cerebras).

## 🚀 Estratégia de Consolidação (Waves)

- **Wave 1 (Skills & Memory):** Integrar `claude-mem` e `get-shit-done` methodology.
- **Wave 2 (RAG & Finance):** Ativar `PageIndex` para RAG vectorless e `dexter` para pesquisa financeira.
- **Wave 3 (Platform & UI):** Consolidar o Escritório Virtual 8-bit e o ACE Dashboard.

## ⚠️ Restrições de Hardware
- **CPU:** Celeron E3300 | **RAM:** 6GB.
- **Decisão:** **BUN BUILD ABORTADO.** Usar Node.js nativo para todos os processos locais. Cloud (Railway/VPS) obrigatório para tarefas pesadas.

---
*Gerado por NOESIS — 2026-04-07*
