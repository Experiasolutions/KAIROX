# Story 1.4 — Calibração Gradual: "A Escadinha" para Iniciantes

## Status
`Ready` (aguarda Story 1.3 em produção)

## Epic
Epic 1 — Fundação e Agente de Imersão MVP

## Origem
> **Stream of Consciousness — Gabriel Ferreira, 21/06/2026, 01h47**
> "Tenho recebido muito feedback de iniciantes em inglês... a melhor opção é implementar uma 'escadinha' para que completos iniciantes possam entrar na 'piscina' de outro idioma de forma gradual e com a confirmação do aluno."

## Problema a Resolver
Alunos nível 1-2 (zero inglês ou inglês passivo) ficam desorientados ao entrar diretamente na imersão sem entender o **método** por trás. O resultado é abandono precoce. A "escadinha" é a ponte entre o onboarding e a primeira cena real.

## Descrição
Como aluno completo iniciante (nível 1-3),
Eu quero ser guiado pela analogia do Método MANA antes de entrar em imersão,
Para que eu entenda o que precisa fazer, como pensar e o que esperar — confirmando conscientemente minha entrada no idioma.

## O Conceito: A Piscina e a Escadinha

```
🏊 ANALOGIA DA PISCINA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A piscina = total immersion em inglês
A escadinha = os degraus que te levam lá

Degrau 1 — Entender o método (esta story)
  └── AIDA explica em PT: "Você não vai estudar inglês.
       Você vai VIVER em inglês. Só que de pouquinho."

Degrau 2 — Primeiro contato com cenas (modo auxiliado)
  └── Nível 1-3: cenas com suporte de Tradução Parcial (Story 1.5)

Degrau 3 — Confirmação consciente
  └── Aluno diz: "Estou pronto" → entra na imersão completa
```

## Tarefas

### Bloco A — Introdução ao Método (pós-onboarding, pré-imersão)
- [ ] Criar flow "Briefing do Método" para níveis 1-3 (após completionMessage do onboarding)
  - [ ] Mensagem 1: Analogia da piscina + escadinha (em PT, formato WhatsApp-friendly, <200 chars)
  - [ ] Mensagem 2: O que é um "Gap" — como anotar palavras/frases que não entendeu (input gap awareness)
  - [ ] Mensagem 3: O que é "Output" — que o aluno SEMPRE responde em inglês, mesmo que errado, nunca será corrigido
  - [ ] Mensagem 4: Confirmação — "Topa entrar na piscina? Responda: SIM ou AINDA NÃO"
- [ ] Implementar branching na `onboarding.js`:
  - [ ] Se nível ≤ 3 → disparar "Briefing do Método" antes da primeira cena
  - [ ] Se nível > 3 → ir direto para a primeira cena (comportamento atual)
- [ ] Armazenar flag `briefingCompleted: true` no Redis (perfil do aluno)

### Bloco B — Confirmação Gradual
- [ ] "SIM" → primeira cena em modo auxiliado (Tradução Parcial ativa via Story 1.5)
- [ ] "AINDA NÃO" → AIDA oferece uma explicação extra ou mini-exemplo antes de confirmar
- [ ] Qualquer outra resposta → pede confirmação novamente (max 2 tentativas)

## Critérios de Aceitação

- [ ] Aluno nível 1-3 recebe o Briefing ANTES da primeira cena
- [ ] Briefing cabe em 4 mensagens WhatsApp (sem parecer aula)
- [ ] O conceito de "gap" e "output sem medo" é compreensível sem conhecimento prévio
- [ ] Flag `briefingCompleted` persiste no Redis e não re-exibe o briefing nas sessões seguintes
- [ ] Alunos nível 4+ não veem o briefing (fluem diretamente para imersão)

## Estimativa
**Complexidade:** Média
**Tempo estimado:** 2-3h

## Dependências
- **Bloqueia:** Story 1.5 (Tradução Parcial precisa do nível calibrado)
- **Bloqueado por:** Story 1.3 (Done ✅)
