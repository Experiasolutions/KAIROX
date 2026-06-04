# AIOX — Arquitetura do Sistema

> Diagrama vivo da arquitetura do motor AIOX.
> Última atualização: 2026-02-18

---

## Visão Geral — 3 Camadas

```
╔══════════════════════════════════════════════════════════════╗
║                    COGNITION LAYER                           ║
║  Noesis Engine (Opus 4.6)                                    ║
║  ├── Constitutional Layer v3.0                               ║
║  ├── PM1 (Reasoning) → PM2 (Execution) → PM3 (Quality)     ║
║  ├── Golden Examples (auto-harvested)                        ║
║  └── Anti-Patterns (cataloged violations)                    ║
╠══════════════════════════════════════════════════════════════╣
║                    KERNEL LAYER                              ║
║  kernel-bridge.js → Synapse (8-layer pipeline)              ║
║                   → IDS (Incremental Dev System)            ║
║                   → WIS (Workflow Intelligence)             ║
║                   → Tools Bridge (163 skills)               ║
║  event-bus.js → pub/sub, inter-module communication         ║
╠══════════════════════════════════════════════════════════════╣
║                    OPERATIONS LAYER                          ║
║  Scripts: input-refiner, self-correction, harvest-gold      ║
║  Squads: 13 universais (mind-clones, doombot, finance...)   ║
║  Tools: 4 repos, 18 integrações, 163 skills                ║
╚══════════════════════════════════════════════════════════════╝
           │                                    │
           │ instanciates                       │ instanciates
    ┌──────┴──────┐                    ┌────────┴───────┐
    │  EXPERIA    │                    │  CLIENT N      │
    │  (clínicas) │                    │  (futuro)      │
    └─────────────┘                    └────────────────┘
```

---

## ENGINE vs CLIENT PACKAGE

```
┌─────────────────────────────────────────────────────────┐
│              AIOX ENGINE (este projeto)                   │
│                                                           │
│  Domain-agnostic. Sector: NONE.                           │
│  Capability: orchestrate N agents for any operation.      │
│  Think: operating system, not application.                │
└──────────────────────┬────────────────────────────────────┘
                       │ instancia
           ┌───────────┴───────────┐
           ▼                       ▼
┌──────────────────┐    ┌──────────────────┐
│  EXPERIA         │    │  [Novo Cliente]  │
│  clients/experia/│    │  clients/{nome}/ │
│  WaaS p/ clínicas│    │  Qualquer domínio│
│  WhatsApp + Cal  │    │  Qualquer stack  │
└──────────────────┘    └──────────────────┘
```

---

## Mapa de Dependências — Scripts Principais

```
                    ┌─────────────────────┐
                    │   kernel-bridge.js   │
                    │  (unified bridge)    │
                    └──┬───┬───┬───┬──────┘
                       │   │   │   │
            ┌──────────┘   │   │   └──────────┐
            ▼              ▼   ▼              ▼
   ┌──────────────┐ ┌─────┐ ┌─────┐  ┌───────────────┐
   │ synapse-bridge│ │ IDS │ │ WIS │  │ tools-bridge  │
   │ (8 layers)    │ │     │ │     │  │ (163 skills)  │
   └──────────────┘ └─────┘ └─────┘  └───────────────┘

   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
   │input-refiner │───→│self-correction│───→│ harvest-gold │
   │   (v2.0)     │    │    (v1.0)     │    │   (v2.0)     │
   └──────────────┘    └──────────────┘    └──────────────┘
          │                                        │
          └──────────── event-bus.js ───────────────┘
                    (pub/sub backbone)
```

---

## Versões Atuais

| Componente | Versão | PM3 Score |
|:---|:---|:---|
| Constitutional Layer | v3.0 | — |
| PM1/PM2/PM3 Masters | v1.0 | — |
| input-refiner.js | v2.0 | 9.3/10 |
| self-correction.js | v1.0 | 8.6/10 |
| harvest-gold.js | v2.0 | 9.8/10 |
| tools-bridge.js | v1.0 | 10/10 |
| kernel-bridge.js | v1.1 | 9.9/10 |
| skill-mapper.js | v1.0 | 10/10 |
| whatsapp-server.js | v1.0 | — (pre-PM3) |

---

## Squads Universais (ENGINE)

| Squad | Agents | Foco |
|:---|:---:|:---|
| mind-clones/ | 67 | Expert reasoning hivemind |
| doombot/ | 10 | Revenue optimization |
| analytics/ | 5 | BI & metrics |
| finance/ | 5 | Billing, P&L |
| marketing/ | 5 | Content, traffic |
| cs/ | 7 | Customer success |
| admin/ | 6 | HR, legal, culture |
| ops/ | 5 | Process optimization |
| vendas/ | 3 | Direct sales |
| produto/ | 3 | Product management |
| facilities/ | 5 | IT, maintenance |
| meta/ | — | Meta-configuration |
| rh-squad/ | 1 | HR agent (Node.js) |
