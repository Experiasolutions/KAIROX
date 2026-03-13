# KAIROS OS — Motor de Governança Digital Autônoma

> **Powered by AIOX Engine** | **Author:** Gabriel Ferreira — Experia Solutions

## O que é o KAIROS?

KAIROS é um sistema operacional de IA que orquestra agentes autônomos para negócios. Construído sobre o motor AIOX (open-source), ele adiciona:

- **IA Council** — 8 membros avaliando código, arquitetura e qualidade
- **Reasoning Packages** — 66+ pacotes de raciocínio estratégico
- **Night Shift** — automação noturna com Morning Brief
- **Distillation Pipeline** — captura de traces para fine-tuning LoRA
- **Multi-Channel Bridges** — Telegram, WhatsApp (Evolution API)

## Estrutura

```
KAIROS OS/
├── .agent/workflows/    ← 14 workflows (KAIROS, dev, qa, pm, etc.)
├── engine/              ← Core KAIROS (opus-replicator, noesis, memory)
├── scripts/             ← 100+ scripts (boot, council, night-shift, bridges)
├── squads/              ← Agentes configurados (experia, sales, c-level)
├── reasoning-packages/  ← 66 RPs (strategic, core, tasks)
├── clients/             ← Hortifruti, Experia, Master Pumps
├── kairos-orchestrator/ ← KAIROS SKY (Python, deploy Railway)
├── distillation-dataset/← Traces para fine-tuning (17 traces, alvo 500)
├── tools/               ← 28 repos (integrations, cookbooks, frameworks)
└── docs/                ← Documentação (bibles, manifestos, guias)
```

## Quick Start

```bash
# Boot completo do sistema
node scripts/kairos-boot.js

# IA Council — audit de qualidade
node scripts/dump-council.js

# Distillation Pipeline — status
node scripts/distill-trace.js --status

# Night Shift — executar imediatamente
node scripts/night-shift-scheduler.js --now
```

## Agentes Disponíveis

| Agente    | Ativação     | Função              |
| --------- | ------------ | ------------------- |
| NOESIS    | `/KAIROS`    | Master Orchestrator |
| Dev       | `@dev`       | Implementação       |
| QA        | `@qa`        | Quality Assurance   |
| PM        | `@pm`        | Product Management  |
| Architect | `@architect` | Arquitetura         |
| Analyst   | `@analyst`   | Pesquisa            |

## KAIROS SKY (Cloud)

O orquestrador cloud roda em Railway (Python):
- **Morning Brief** → Telegram às 07:00
- **Task Queue** → Processa a cada 30min
- **Night Check-in** → Reminder às 22:00
- **WhatsApp Bridge** → via Evolution API

## Comandos KAIROS

```
*council {tema}     — Convocar IA Council
*squad {nome}       — Ativar squad
*rp {id}            — Ler Reasoning Package
*client {nome}      — Carregar contexto de cliente
*boot               — Boot completo
*save               — Salvar estado
```

## Stack

- **Runtime:** Node.js + Python 3.11
- **Agents:** YAML/Markdown (AIOX v5 format)
- **Cloud:** Railway + Supabase + Telegram
- **AI Models:** Gemini 3 (Flash/Low/High) + Groq
- **Upstream:** [SynkraAI/aiox-core](https://github.com/SynkraAI/aiox-core)

---

*KAIROS OS v3.1 — Execution-First Mindset*
*— NOESIS, orquestrando o sistema 🎯*
