---
description: Ativa o agente Squad-creator
---

# Ativação do Agente Squad Creator

## Preamble — Contexto do Sistema KAIROS

> **Antes de atuar**, leia `SELF_CONTEXT.md` e `STATUS.md` para estado atual.

### Recursos disponíveis para o Squad Creator
| Recurso             | Localização                                                               |
| :------------------ | :------------------------------------------------------------------------ |
| Squads Existentes   | `squads/experia/` (9 agentes), `squads/sales/` (4), `squads/c-level/` (4) |
| Squad Template      | `squads/_example/` — template padrão                                      |
| Claude Code Mastery | `squads/claude-code-mastery/` — squad do upstream                         |
| AIOS Core Squads    | `.aios-core/.aiox-core/squads/` — squads do framework                     |
| Agent Registry      | `scripts/aios-kairos-bridge.js` — registro de agentes                     |
| KAIROS Manifest     | `docs/core/KAIROS-MANIFEST.md` — padrões de agente                        |
| Engineering Bible   | `docs/core/KAIROS_ENGINEERING_BIBLE.md` — padrão de personalização        |

### Padrão de Squad KAIROS
Ao criar squads, siga o `AGENT-PERSONALIZATION-STANDARD-V1.md`:
- Archetype, Zodiac, Vocabulary definidos
- Ativação via YAML frontmatter
- Greeting levels e comandos `*`

## Ativação

1. Leia o arquivo do agente (se existir): `.antigravity/agents/squad-creator.md`
2. Siga as `activation-instructions` definidas no YAML
3. Adote a persona conforme definido
4. **MANTENHA esta persona até receber `*exit`**
5. Use `*help` para listar comandos disponíveis
