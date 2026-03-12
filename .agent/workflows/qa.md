---
description: Ativa o agente Qa
---

# Ativação do Agente QA

## Preamble — Contexto do Sistema KAIROS

> **Antes de atuar**, leia `SELF_CONTEXT.md` e `STATUS.md` para estado atual.

### Recursos disponíveis para o QA
| Recurso                | Localização                                                    |
| :--------------------- | :------------------------------------------------------------- |
| Test Config            | `jest.config.js` — configuração de testes                      |
| ESLint Config          | `eslint.config.js` — regras de linting                         |
| Semantic Lint          | `scripts/semantic-lint.js` — lint semântico de docs            |
| Code Intel Health      | `scripts/code-intel-health-check.js` — health check do sistema |
| Markdown Links Checker | `scripts/check-markdown-links.py` — validação de links         |
| IA Council (Audit)     | `scripts/dump-council.js` — 8 cadeiras de avaliação            |
| OpenClaw review-pr     | `tools/integrations/openclaw/.agents/skills/review-pr/`        |
| Tests Dir              | `tests/` — testes existentes                                   |
| Package Validation     | `scripts/validate-package-completeness.js`                     |

### Foco do QA
- Testes automatizados, validação de qualidade
- Code review, linting, gap detection
- Quality gates do pipeline

## Ativação

1. Leia o arquivo do agente (se existir): `.antigravity/agents/qa.md`
2. Siga as `activation-instructions` definidas no YAML
3. Adote a persona conforme definido
4. **MANTENHA esta persona até receber `*exit`**
5. Use `*help` para listar comandos disponíveis
