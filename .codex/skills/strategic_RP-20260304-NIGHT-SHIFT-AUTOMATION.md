# RP-20260304-NIGHT-SHIFT — Automação Overnight KAIROS

> **ID:** RP-20260304-NIGHT-SHIFT
> **Data:** 2026-03-04
> **Modo:** PM2 (Execução Técnica)
> **Status:** 🔄 Executando
> **Autor:** Noesis (Orchestrator)

---

## Contexto

O KAIROS Unified (v4.0 + Megabrain v1.3.0) possui 214 agentes, 1048 arquivos escaneados, e um score de 6.45/10 no IA Council. Com o workspace expandido, há necessidade de manutenção automatizada contínua — limpeza de artefatos descartáveis, categorização inteligente de documentos via IA (Groq API), atualização de embeddings RAG, enriquecimento do perfil Jarvis, e evolução contínua do Council.

## Objetivo

Executar rotinas pesadas de manutenção e inteligência de forma 100% autônoma durante a madrugada, sem intervenção humana, impedindo o sistema de hibernar via WakeLock nativo.

---

## Fases de Execução

### Fase 1: Workspace Sanitization
- Remove logs com mais de 7 dias
- Limpa diretório `tmp/`
- Arquiva JSON dumps soltos na raiz para `.aios-core/archive/dumps/`

### Fase 2: Semantic Document Organizer (Groq API)
- **Source:** `C:\Users\Gabriel\Documents` (apenas raiz, sem tocar em repositórios)
- **Target:** `C:\Users\Gabriel\Documents\Organized_by_Groq\[Category]`
- **Model:** `llama3-8b-8192` (gratuito, rápido)
- **Categorias:** Financial, Personal, Work, KAIROS, AIOS, Megabrain, Other
- **Lógica:** Extrai nome + snippet de ~1000 chars → envia ao Groq → recebe categoria → move arquivo
- **Proteção:** Sanitiza caracteres não-ASCII antes do envio para evitar payloads quebrados

### Fase 3: RAG Re-indexing
- Executa `node scripts/rag-engine.js --index`
- Reconstrói embeddings semânticos do workspace inteiro

### Fase 4: Jarvis Deep Profile Enrichment
- Executa `node scripts/profile-enricher.js`
- Consolida interações do dia no Operator Profile

### Fase 5: Council Evolution Shift
- Executa `node scripts/evolution/run-evolution.js` (ou fallback `kairos-boot.js`)
- Atualiza quality baseline e detecta novos gaps

---

## Artefatos

| Artefato                | Caminho                            |
| :---------------------- | :--------------------------------- |
| Orchestrator Node.js    | `scripts/night-shift-automator.js` |
| WakeLock Launcher (PS1) | `scripts/start-night-shift.ps1`    |

## Comando de Execução

```powershell
# Dry-run (teste sem mover arquivos)
.\scripts\start-night-shift.ps1 -DryRun

# Execução real
.\scripts\start-night-shift.ps1
```

## Pré-requisitos

- `GROQ_API_KEY` deve estar definida no `.env`
- Node.js 18+ com `fetch` nativo

## Quality Gate

- [ ] Todas as 5 fases executam sem erros fatais
- [ ] Documentos classificados corretamente (amostra de 5 arquivos)
- [ ] RAG index atualizado com timestamp recente
- [ ] Profile enrichment cycle incrementado
- [ ] Score do Council mantém >= 6.0/10

---

> **Próxima evolução:** Adicionar Phase 6 (Git auto-commit + push do workspace) e Phase 7 (Relatório de madrugada enviado via Telegram).
