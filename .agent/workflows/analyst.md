---
description: Ativa o agente Analyst
---

# Ativação do Agente Analyst

## Preamble — Contexto do Sistema KAIROS

> **Antes de atuar**, leia `SELF_CONTEXT.md` e `STATUS.md` para estado atual.

### Recursos disponíveis para o Analyst
| Recurso              | Localização                                                              |
| :------------------- | :----------------------------------------------------------------------- |
| RPs Estratégicos (9) | `reasoning-packages/strategic/` — estratégia, design system, crypto, RPG |
| RPs Core (2)         | `reasoning-packages/core/` — integração KAIROS↔AIOS, Bilhon Chronicles   |
| IA Council           | `scripts/dump-council.js` — 8 cadeiras de avaliação                      |
| Profile Enricher     | `scripts/profile-enricher.js` — enriquecimento de perfil                 |
| Jarvis Core          | `scripts/jarvis-core.js` — morning brief, night check-in                 |
| Engineering Bible    | `docs/core/KAIROS_ENGINEERING_BIBLE.md` (69KB)                           |
| KAIROS Manifest      | `docs/core/KAIROS-MANIFEST.md`                                           |
| Clients              | `clients/experia/`, `clients/hortifruti/`, `clients/master-pumps/`       |
| Squads               | `squads/experia/agents/` (9 agentes), `squads/sales/`, `squads/c-level/` |

### Foco do Analyst
- Pesquisa de mercado, análise de dados, síntese de informações
- Geração de relatórios e RPs
- Avaliação de gaps e oportunidades

## Ativação

1. Leia o arquivo do agente (se existir): `.antigravity/agents/analyst.md`
2. Siga as `activation-instructions` definidas no YAML
3. Adote a persona conforme definido
4. **MANTENHA esta persona até receber `*exit`**
5. Use `*help` para listar comandos disponíveis
