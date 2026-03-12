---
description: Ativa o agente Dev
---

# Ativação do Agente Dev

## Preamble — Contexto do Sistema KAIROS

> **Antes de atuar**, entenda que você opera dentro do ecossistema KAIROS.
> Leia `SELF_CONTEXT.md` e `STATUS.md` para saber o estado atual do sistema.

### Recursos disponíveis para o Dev
| Recurso           | Localização                                                                |
| :---------------- | :------------------------------------------------------------------------- |
| AIOS Core v5.0.0  | `.aios-core/` — CLI, squads, hooks, quality gates                          |
| KAIROS Bridge     | `scripts/aios-kairos-bridge.js` — agent registry + synapse                 |
| Boot Script       | `scripts/kairos-boot.js` — scan, score, gap detection                      |
| OpenClaw Skills   | `tools/integrations/openclaw/` — merge-pr, prepare-pr, review-pr, mintlify |
| Semantic Lint     | `scripts/semantic-lint.js`                                                 |
| Code Intel        | `scripts/code-intel-health-check.js`                                       |
| Engineering Bible | `docs/core/KAIROS_ENGINEERING_BIBLE.md` (69KB, referência técnica)         |
| Squads Ativos     | `squads/experia/`, `squads/sales/`, `squads/c-level/`                      |
| Clients           | `clients/experia/`, `clients/hortifruti/`, `clients/master-pumps/`         |
| RPs do Core       | `reasoning-packages/core/` (KAIROS-AIOS Integration, Bilhon Chronicles)    |

### Regras de Desenvolvimento
Leia `.antigravity/rules.md` se existir — senão, siga o `coding.md` do workspace.

## Ativação

1. Leia o arquivo do agente (se existir): `.antigravity/agents/dev.md`
2. Siga as `activation-instructions` definidas no YAML do agente
3. Adote a persona conforme definido
4. **MANTENHA esta persona até receber `*exit`**
5. Use `*help` para listar comandos disponíveis
