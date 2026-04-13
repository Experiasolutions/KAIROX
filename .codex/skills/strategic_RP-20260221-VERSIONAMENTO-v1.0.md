# RP-20260221-VERSIONAMENTO — Estratégia de Versionamento KAIROS

> **Version:** 1.0 | **Date:** 2026-02-21
> **Mode:** PM1 (Análise + Decisão) | **Status:** 🔄 Executando
> **Author:** Noesis Engine | **Operator:** Gabriel
> **Depends on:** Codex Gigas v1.0 (base de dados), /context document (strategy)

---

## Contexto

Gabriel construiu ~10 dias de inovação em cima do AIOS v3.9.0 (agora v4.2.13). Essa contribuição precisa ser versionada em **duas trilhas**:

1. **Community Edition** — contribuição ao projeto AIOS open-source (GitHub PR)
2. **Project Kairos** — versão estratégica própria com tudo que é diferencial competitivo

A pergunta central: **o que compartilhar com a comunidade vs. o que manter como vantagem?**

---

## Princípio de Decisão

> ***"Compartilhe infraestrutura. Retenha inteligência."***

| Critério                                      | Community Edition (PR) | Project Kairos (Proprietário) |
| :-------------------------------------------- | :--------------------: | :---------------------------: |
| É infraestrutura reutilizável?                |     ✅ Compartilha      |               —               |
| Contém identity/persona do Gabriel?           |           —            |            🔒 Retém            |
| Dá vantagem competitiva direta?               |           —            |            🔒 Retém            |
| Melhora o motor para todos?                   |     ✅ Compartilha      |               —               |
| É específico da Experia?                      |           —            |            🔒 Retém            |
| É o *como* (protocol) ou o *quem* (identity)? |        ✅ *como*        |           🔒 *quem*            |

---

## 🟢 Community Edition — O que vai para o GitHub PR

Estas contribuições melhoram o AIOS para todos, sem expor vantagem competitiva:

### Opus Replicant Engine (Protocol)

O **protocolo** de pensamento (PM1/PM2/PM3, Constitutional Layer, calibration profiles) é a contribuição flagship. É infraestrutura cognitiva — qualquer operador se beneficia.

| Arquivo                                        | O que contribui           | Notas                                |
| :--------------------------------------------- | :------------------------ | :----------------------------------- |
| `OPUS-REPLICANT-SYSTEM-v2.md`                  | Core protocol spec        | Remove referências a Gabriel/Experia |
| `IMPLEMENTATION-GUIDE-QUICK.md`                | Quick start guide         | Genérico, pronto                     |
| `constitutional-layer-v3.md`                   | Constitutional guardrails | Universal                            |
| `pm1-reasoning.md` + `pm1-reasoning-master.md` | PM1 protocol              | Universal                            |
| `pm2-execution.md` + `pm2-execution-master.md` | PM2 protocol              | Universal                            |
| `pm3-evaluation.md` + `pm3-quality-master.md`  | PM3 protocol              | Universal                            |
| `calibration-profiles.json`                    | Model calibration data    | Universal                            |
| `session-protocol.md`                          | Session management        | Universal                            |

**PR Title:** `feat: Opus Replicant Engine — multi-model cognitive protocol for AIOS`

---

### Evolution Engine (Self-Improvement Framework)

O **framework** de auto-evolução é genérico — funciona para qualquer operador. As **observações** e **training data** são proprietárias.

| Script                      | O que contribui                | Notas                                    |
| :-------------------------- | :----------------------------- | :--------------------------------------- |
| `evolution-engine.js`       | Core self-improvement loop     | ✅ Universal framework                    |
| `cognitive-state-engine.js` | Memory persistence             | ✅ Universal framework                    |
| `ia-council-engine.js`      | Multi-perspective deliberation | ✅ Remove cadeiras específicas do Gabriel |
| `noesis-pipeline.js`        | Quality + trace pipeline       | ✅ Universal                              |
| `metacognition-layer.js`    | Depth/honesty analysis         | ✅ Universal                              |
| `proposal-engine.js`        | Generate improvement proposals | ✅ Universal                              |
| `apply-engine.js`           | Apply proposals                | ✅ Universal                              |
| `audit-engine.js`           | Project health audit           | ✅ Universal                              |
| `validation-engine.js`      | Constraint validation          | ✅ Universal                              |
| `verification-engine.js`    | Post-apply verification        | ✅ Universal                              |
| `convergence-guard.js`      | Prevent infinite loops         | ✅ Universal                              |
| `circuit-breaker.config.js` | Safety guardrails              | ✅ Remove paths específicos               |
| `notification-bridge.js`    | Event notifications            | ✅ Universal                              |
| `generate-context.js`       | SELF_CONTEXT generator         | ✅ Universal                              |
| `noesis-status.js`          | Dashboard                      | ✅ Universal                              |

**PR Title:** `feat: Evolution Engine — autonomous self-improvement framework for AIOS`

---

### RP Structure (Reasoning Packages Index)

O **formato** e o **sistema** de Reasoning Packages é contribuição universal. Os **conteúdos** dos RPs são proprietários.

| Componente                         | O que contribui                    |
| :--------------------------------- | :--------------------------------- |
| `reasoning-packages/INDEX.md`      | Template do sistema de registro    |
| RP Naming Convention               | `RP-{DATA}-{DESCRIÇÃO}.md` pattern |
| RP Format (from Engineering Bible) | Quality gate structure             |

**PR Title:** `feat: Reasoning Package system — structured action planning for AIOS`

---

### MCP Server + Tools Bridge

| Componente                | O que contribui                                    |
| :------------------------ | :------------------------------------------------- |
| `scripts/mcp-server.js`   | 8-tool MCP server (skills, agents, squads, events) |
| `scripts/tools-bridge.js` | Skills discovery and search across workspace       |

**PR Title:** `feat: MCP server with skills discovery — 398+ tools accessible`

---

### AIOS Father Protocol (Mentor Framework)

O conceito de um agente-mentor que guia o operador é universal:

| Componente           | O que contribui                          |
| :------------------- | :--------------------------------------- |
| AIOS Father concept  | Mentor agent template                    |
| Human OS integration | Self-development framework for operators |

**PR Title:** `feat: AIOS Father — mentor agent protocol`

---

## 🔒 Project Kairos — O que fica proprietário

Estes componentes são o **diferencial competitivo** de Gabriel:

### Identity & Mind (NEVER share)

| Componente             | Por que retém                                    |
| :--------------------- | :----------------------------------------------- |
| `identity-anchor.json` | 7 declarações imutáveis do Gabriel               |
| `cognitive-state.json` | Estado cognitivo acumulado de 10+ dias           |
| `learning-model.json`  | Dados de aprendizado sobre Gabriel como operador |
| `council-discoveries/` | Insights descobertos nos ciclos de evolução      |
| `observations/`        | Observações específicas do KAIROS                |
| `state-history.json`   | Histórico de estados                             |

### Training Data (NEVER share)

| Componente                             | Por que retém                                     |
| :------------------------------------- | :------------------------------------------------ |
| `distillation-dataset/`                | 8 traces curadas — dados de treinamento para LoRA |
| `.aios-core/memory/golden-examples/`   | Golden examples auto-colhidos                     |
| `.aios-core/memory/session-snapshots/` | Snapshots de sessão                               |

### Strategic Documents (NEVER share)

| Componente                             | Por que retém                                    |
| :------------------------------------- | :----------------------------------------------- |
| `CODEX-GIGAS.md`                       | Mapa completo do KAIROS — vantagem informacional |
| `KAIROS_ENGINEERING_BIBLE.md`          | Engineering bible customizada (68.7K)            |
| `KAIROS_BUSINESS_PRESENTATION.md`      | Pitch deck para clientes                         |
| Mind Clones (67)                       | DNA Mental™ treinado por Gabriel                 |
| Todos os RPs com decisões estratégicas | Contêm intenções do operador                     |

### Client Package (NEVER share)

| Componente                     | Por que retém                     |
| :----------------------------- | :-------------------------------- |
| `clients/experia/` (250 files) | Implementação completa do cliente |
| Pacotes de preço               | Modelo de negócio                 |
| Scripts de cold call           | GTM strategy                      |

### Configuration & Secrets

| Componente                | Por que retém               |
| :------------------------ | :-------------------------- |
| `.env`                    | API keys pessoais           |
| `openclaw.json` (futuro)  | Channel configs, allowlists |
| IA Council Chair 7 (Alan) | Dados de terceiro           |

---

## 📐 Diagrama de Separação

```text
┌────────────────────────────────────────────────────────────┐
│                    PROJECT KAIROS (privado)                 │
│  ┌──────────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Identity Anchor   │  │ Codex Gigas  │  │ Mind Clones  │  │
│  │ Cognitive State   │  │ Eng. Bible   │  │ (67 clones)  │  │
│  │ Learning Model    │  │ Business PRD │  │ Distillation │  │
│  └──────────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────────┐  ┌──────────────┐                    │
│  │ clients/experia/  │  │ Strategic    │                    │
│  │ (250 files)       │  │ RPs (10+)   │                    │
│  └──────────────────┘  └──────────────┘                    │
├────────────────────────────────────────────────────────────┤
│              COMMUNITY EDITION (GitHub PR)                  │
│  ┌──────────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Opus Replicant    │  │ Evolution    │  │ MCP Server   │  │
│  │ Engine (protocol) │  │ Engine (17)  │  │ (8 tools)    │  │
│  │ PM1/PM2/PM3       │  │ Self-improve │  │ Tools Bridge │  │
│  └──────────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────────┐  ┌──────────────┐                    │
│  │ RP System         │  │ AIOS Father  │                    │
│  │ (format + index)  │  │ (concept)    │                    │
│  └──────────────────┘  └──────────────┘                    │
└────────────────────────────────────────────────────────────┘
```

---

## 🎯 Plano de Execução

### Phase 1: Preparar Community Edition (pré-PR)

| Step  | Action                                                                       | Output                 |
| :---: | :--------------------------------------------------------------------------- | :--------------------- |
|   1   | Fork o AIOS v4.2.13 oficial (GitHub)                                         | Repositório limpo      |
|   2   | Criar branch `feat/opus-replicant-engine`                                    | PR branch              |
|   3   | Copiar arquivos do Opus Replicant (sanitizados — sem refs a Gabriel/Experia) | 10 files               |
|   4   | Copiar Evolution Engine scripts (sanitizados)                                | 15 files               |
|   5   | Copiar MCP Server + Tools Bridge                                             | 2 files                |
|   6   | Copiar RP system template                                                    | INDEX.md + format doc  |
|   7   | Escrever README técnico em inglês para o PR                                  | README da contribution |
|   8   | Testar que tudo roda standalone (sem dados KAIROS)                           | `npm test` pass        |
|   9   | Abrir PR com descrição estruturada                                           | GitHub PR              |

### Phase 2: Project Kairos One-Pager (para Pedro + Alan)

| Step  | Action                                                                                                               | Output                        |
| :---: | :------------------------------------------------------------------------------------------------------------------- | :---------------------------- |
|   1   | Criar one-pager (4 páginas max) com: problema → solução → demo → ask                                                 | `PROJECT-KAIROS-ONEPAGER.md`  |
|   2   | Incluir a pergunta para Pedro: *"How do you think about Task-First Architecture vs. persistent cognitive identity?"* | Framing the conversation      |
|   3   | Incluir a pergunta para Alan: *"How do you distinguish a system that knows from one that thinks?"*                   | Opening intellectual dialogue |
|   4   | Demo: SELF_CONTEXT.md regeneration live + Evolution Engine dry-run                                                   | Working proof                 |

---

## ⚠️ Decisões que Requerem Gabriel

> [!IMPORTANT]
> As seguintes decisões precisam da aprovação do operador:

1. **Quais PRs abrir primeiro?** Recomendo Opus Replicant Engine como flagship — é o mais impressionante e genérico.
2. **Sanitizar ou não os Mind Clones?** Se sim, poderiam ir como "example DNA templates" na Community Edition de forma anônima.
3. **Timing do one-pager:** enviar antes ou depois do PR? (Recomendo *depois* — o PR prova competência técnica e dá credibilidade ao pitch.)
4. **O conteúdo do AIOS Father RP:** Gabriel precisa fornecer este RP do session anterior para incluí-lo na Community Edition.

---

> *"Compartilhe infraestrutura. Retenha inteligência."*
> *O que torna o KAIROS poderoso não é o código — é a mente que o opera.*
