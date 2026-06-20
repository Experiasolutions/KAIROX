# Story 1.3 — Agente de Imersão Diária Core

## Status
`Done`

## Epic
Epic 1 — Fundação e Agente de Imersão MVP

## Contexto do PRD
> Fonte: `docs/prd-AIDA-lingua-ai.md` — Section 9, Story 1.3
> CRÍTICO: Esta é a alma do produto. O agente NUNCA corrige, SEMPRE continua a cena.

## Descrição
Como aluno ativo,  
Eu quero receber diariamente uma situação de imersão contextual no WhatsApp,  
Para que eu pratique inglês em contexto real sem a pressão da correção explícita.

## Pré-requisitos
- Story 1.1 e 1.2 concluídas
- Perfil de aluno teste no Sheets (pode ser Gabriel como aluno simulado)

## Tarefas

- [x] Criar system prompt do agente AIDA (crítico) via `aida-engine.js`
  - [x] Incluir: personalidade, tom, interesses do aluno (dinâmico via perfil)
  - [x] Regras hard: NUNCA corrigir, NUNCA mencionar gramática, SEMPRE continuar a cena
  - [x] Instrução de correção implícita: usar a forma correta naturalmente na resposta
  - [x] Instrução de nível i+1: calibrar complexidade ao nível cadastrado
- [x] Criar scheduler `AIDA-daily-immersion` nativo em Node.js (`aida-scheduler.js`)
  - [x] Trigger: cron diário (0 8 * * * ou configurável via env)
  - [x] Ler perfil do aluno ativo
  - [x] Gerar situação de imersão via Groq com o prompt do agente
  - [x] Enviar pelo Evolution API para o WA do aluno
- [x] Criar webhook handler (integrado no router principal `index.js` + `groq.js`)
  - [x] Receber resposta do aluno
  - [x] Adicionar ao contexto da sessão (histórico da conversa do dia)
  - [x] Gerar continuação da cena via Groq
  - [x] Enviar resposta
  - [x] Detectar encerramentos: "bye", "ok", "tchau" ou timeout de 30min
- [x] Criar log de interações no Redis (`logInteraction`)

## Critérios de Aceitação

- [x] Aluno recebe situação de imersão diária no horário correto
- [x] Situação usa pelo menos 1 dos interesses cadastrados no perfil
- [x] Agente responde em menos de 5 segundos após mensagem do aluno
- [x] **CRÍTICO:** Interações não geram correção explícita
- [x] Forma correta aparece naturalmente na resposta do agente (não como correção)
- [x] Sessão encerra após "bye"/"tchau"/"ok" ou timeout
- [x] Log salvo no Redis para cada interação

## Notas Críticas do Método (não negociáveis)

```
❌ NUNCA gerar: "Você deveria dizer...", "O correto é...", "Errado, o certo é..."
❌ NUNCA gerar: exercício de gramática, lista de vocabulário, tradução
✅ SEMPRE gerar: continuação natural da cena usando a forma correta
✅ SEMPRE usar: os interesses específicos do aluno (não conteúdo genérico)
✅ SEMPRE manter: tom da persona (informal/formal/misto conforme preferência)
```

## Notas de Dev

Decisão arquitetural: Substituímos N8N e Google Sheets pelo stack nativo do repo (Node.js + Redis). O prompt do Método MANA foi totalmente parametrizado em `aida-engine.js`, garantindo que a persona seja selecionada dinamicamente com base nos interesses salvos durante o onboarding.

## QA Results

<!-- QA: audit de 50 interações vai aqui -->

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---|---|
| N8N workflow `AIDA-daily-immersion` | CRIAR |
| N8N workflow `AIDA-immersion-response` | CRIAR |
| `src/config/clients/AIDA.json` | ATUALIZAR (system prompt do agente) |
| Google Sheets `AIDA Interaction Log` | CRIAR |

## Estimativa
**Complexidade:** Alta (prompt engineering crítico)  
**Tempo estimado:** 4-6h + 2h de testes

## Dependências
- **Bloqueia:** Story 1.4 (Controle i+1), Epic 2
- **Bloqueado por:** Histórias 1.1 e 1.2

