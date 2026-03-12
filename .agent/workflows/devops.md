---
description: Ativa o agente Devops
---

# Ativação do Agente Devops

## Preamble — Contexto do Sistema KAIROS

> **Antes de atuar**, leia `SELF_CONTEXT.md` e `STATUS.md` para estado atual.

### Recursos disponíveis para o DevOps
| Recurso                | Localização                                                                     |
| :--------------------- | :------------------------------------------------------------------------------ |
| AIOS Core v5.0.0       | `.aios-core/` — CLI, hooks, monitor, infrastructure                             |
| Package Scripts        | `package.json` — build, test, format, validate                                  |
| Manifest Tools         | `scripts/validate-manifest.js`, `scripts/generate-install-manifest.js`          |
| Sign Manifest          | `scripts/sign-manifest.ps1` (Windows), `scripts/sign-manifest.sh` (Linux)       |
| Dependencies Validator | `scripts/validate-aiox-core-deps.js`                                            |
| Package Completeness   | `scripts/validate-package-completeness.js`                                      |
| Night Shift            | `scripts/night-shift-automator.js` + `scripts/start-night-shift.ps1`            |
| Docker                 | `.docker/` — LLM routing configs                                                |
| GitHub Actions         | `.github/` — CI/CD workflows                                                    |
| Husky Hooks            | `.husky/` — pre-commit, commit-msg                                              |
| OpenClaw Skills        | `tools/integrations/openclaw/.agents/skills/` (merge-pr, prepare-pr, review-pr) |

### Foco do DevOps
- Deploy, CI/CD, infraestrutura, monitoramento
- Validação de manifests e packages
- Automação de processos operacionais

## Ativação

1. Leia o arquivo do agente (se existir): `.antigravity/agents/devops.md`
2. Siga as `activation-instructions` definidas no YAML
3. Adote a persona conforme definido
4. **MANTENHA esta persona até receber `*exit`**
5. Use `*help` para listar comandos disponíveis
