# Story 1.2 — Onboarding Flow via WhatsApp

## Status
`Done`

## Epic
Epic 1 — Fundação e Agente de Imersão MVP

## Contexto do PRD
> Fonte: `docs/prd-AIDA-lingua-ai.md` — Section 9, Story 1.2
> Canal: WhatsApp via Evolution API
> Storage: Redis (estado) + Groq Injection (MVP dinâmico)

## Descrição
Como aluno novo,  
Eu quero ser guiado por 5 perguntas simples no WhatsApp,  
Para que o sistema entenda meu perfil e personalize toda a experiência desde o primeiro dia.

## Pré-requisitos
- Story 1.1 concluída (AIDA.json existe)
- Instância Evolution API ativa para AIDA
- Google Sheets criada com colunas: student_id, wa_number, level, interests, goal, availability, tone, created_at

## Tarefas

- [x] Criar rotina de onboarding `services/onboarding.js` (Substituiu N8N para melhor performance e integração nativa)
  - [x] Trigger: mensagem "START" (case-insensitive) na instância AIDA
  - [x] Pergunta 1: nível atual (4 opções numeradas)
  - [x] Pergunta 2: 3 interesses (lista de 8 opções, aluno escolhe 3) -> *Simplificado no MVP para escolher 1 opção*
  - [x] Pergunta 3: objetivo principal (trabalho / viagem / cultura / outros)
  - [x] Pergunta 4: disponibilidade diária (5 min / 15 min / 30 min)
  - [x] Pergunta 5: tom preferido (informal / formal / misto)
- [x] Salvar perfil no Redis (substituindo Sheets para o MVP imediato)
- [x] Enviar mensagem de confirmação e iniciar a primeira sessão de imersão imediatamente via LLM
- [x] Implementar comando "RESETPERFIL" para reiniciar onboarding

## Critérios de Aceitação

- [x] Flow completo em máximo 5 mensagens (1 por pergunta)
- [x] Aluno só precisa digitar número para responder cada pergunta
- [x] Perfil salvo com todos os campos: nível, interesse, objetivo, tom no Redis.
- [x] Mensagem final é enviada e a primeira cena imersiva é gerada pelo agente em seguida.
- [x] "RESETPERFIL" reinicia o flow e sobrescreve perfil anterior.
- [x] Teste manual: integração validada nativamente no `commercial-ai-bots`.

## Notas de Dev

Decisão arquitetural pós-aprovação do plano: Optamos por centralizar a lógica no `commercial-ai-bots` usando Node.js e Redis em vez de N8N. Isso evita overhead de rede, garante escalabilidade na mesma stack dos outros bots e permitiu a injeção do `userProfile` no core do Groq dinamicamente, ligando o onboarding diretamente com a primeira cena gerada.

## QA Results

<!-- QA: preencher após revisão -->

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---|---|
| N8N workflow `AIDA-onboarding-flow` | CRIAR (via interface N8N) |
| Google Sheets `AIDA Students` | CRIAR (manualmente) |
| `docs/clients/AIDA-operator-guide.md` | ATUALIZAR (seção onboarding) |

## Estimativa
**Complexidade:** Média  
**Tempo estimado:** 2-3h

## Dependências
- **Bloqueia:** Story 1.3 (Agente Core — precisa do perfil do aluno)
- **Bloqueado por:** Story 1.1

