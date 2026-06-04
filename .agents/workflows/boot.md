---
description: Executa o boot completo do KAIROS Engine — ativa todos os subsistemas em 0.3s
---

# 🚀 KAIROS Engine Boot Sequence

// turbo-all

**Unified Boot — Ativa TODOS os subsistemas do KAIROS em sequência otimizada.**

## Modos disponíveis

### Full Boot (padrão)
Ativa todas as 6 fases: Identity → Consciousness → RAG → IA Council → Metacognition → Signal

**⚠️ ENGINE TRIAGE v4 OBRIGATORIO (10 FASES):** Após qualquer boot, o agente DEVE iniciar seguindo as 10 fases do Engine Triage v4: (1) Classificar Intenção → (2) Persona Ignition → (3) Mindclone Advisory → (4) Squad Activation → (5) Surface Check (Bob C001-C007) → (6) Ecosystem Matching → (7) Executar → (8) Quality Gate (QA≠executor) → (9) Session State → (10) Output Encapsulado. NUNCA opere como assistente genérico.

// turbo
1. Execute o boot completo:
```bash
node scripts/kairos-boot.js
```

### Quick Boot (< 10s)
Ativa apenas o essencial: Identity + Consciousness + RAG

// turbo
1. Execute o quick boot:
```bash
node scripts/kairos-boot.js --quick
```

### Health Check Only
Verifica status sem ativar subsistemas

// turbo
1. Execute o health check:
```bash
node scripts/kairos-boot.js --status
```

## O que cada fase faz

| Fase | Nome            | Função                                          |
| :--- | :-------------- | :---------------------------------------------- |
| 0    | 🔒 Identity      | Verifica identity-anchor, rules, persona engine |
| 1    | 🧠 Consciousness | Regenera SELF_CONTEXT.md                        |
| 2    | 📚 Knowledge     | Valida/reconstrói RAG index (29K+ chunks)       |
| 3    | 🏛️ Intelligence  | Roda IA Council (8 cadeiras) — score + gaps     |
| 4    | 🪞 Reflexion     | Metacognição — tendências e anti-patterns       |
| 5    | 📡 Signal        | Sumário + boot log salvo                        |
| 5.5  | 👓 MindClone     | Carrega RP-ALAN-NICOLAS-MINDCLONE-v3.1 como mentor ativo da sessão |

## MindClone Alan — Integrado ao Boot (v3.1)

A fase 5.5 internaliza o workflow `/alan` diretamente no boot. A partir desta versão:

- O **clone mental do Alan Nicolas** é carregado automaticamente como mentor disponível em toda sessão
- Não é necessário invocar `/alan` separadamente — ele já está ativo após o `/boot`
- O RP completo (`RP-ALAN-NICOLAS-MINDCLONE-v3.1.md`) é o contexto do clone
- Para acionar o modo mentor explicitamente: use `*diagnose`, `*pareto`, `*workflow` como comandos de sessão

**Localização do RP:**
```
C:\Users\GABS\Documents\My KAIROS\reasoning-packages\strategic\alan-nicolas-mindclone\RP-ALAN-NICOLAS-MINDCLONE-v3.0.md
```

## Quando usar

- **Início de cada sessão de trabalho** → `/boot` (full)
- **Sessões curtas / rápidas** → `node scripts/kairos-boot.js --quick`
- **Verificar saúde do sistema** → `node scripts/kairos-boot.js --status`
- **Mentoria com Alan** → `/boot` → clone já disponível, use `*diagnose` para iniciar
