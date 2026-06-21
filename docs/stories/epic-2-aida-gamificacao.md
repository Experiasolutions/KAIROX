# Epic 2 — Gamificação e Retenção

## Status
`Backlog`

## Visão
Transformar o My AIDA de uma ferramenta de aprendizado em uma **experiência viciante**. Não replicar o Duolingo — superar ele usando mecânicas de gestão pessoal provadas pelo próprio Gabriel.

## Origem
> **Stream of Consciousness — Gabriel Ferreira, 21/06/2026, 01h47**
> "Gamificação é uma peça ESSENCIAL nesse projeto... a ideia é tentar 'viciar' o pessoal em aprender, utilizando de diversas mecânicas (competitividade com scoreboard dentre outras). Utilizando as mecânicas que já tenho esquematizadas para minha gestão pessoal."

## Princípio Fundamental: Addiction Loop Design

```
DISCOVERY (onboarding curioso)
  ↓
FIRST WIN (primeira cena — "funcionou!")  
  ↓
HABIT HOOK (disparo diário às 8h)
  ↓
STREAK ANXIETY (não quebrar a sequência)
  ↓
SOCIAL PROOF (ver que outros estão avançando)
  ↓
MASTERY SIGNAL (subir de nível = identidade nova)
  ↓
REPEAT
```

---

# Story 2.1 — XP e Níveis: Sistema de Progressão

## Status
`Draft`

## Descrição
Como aluno ativo,
Eu quero acumular XP a cada sessão e ver minha progressão de nível,
Para que eu sinta que cada prática conta e que existe um caminho claro a percorrer.

## Sistema de XP

| Ação | XP |
|---|---|
| Completar onboarding | +100 XP |
| Primeira cena do dia | +50 XP |
| Resposta >10 palavras | +20 XP |
| Resposta em <30s (velocidade) | +10 XP |
| Sessão de >15 min | +75 XP |
| Completar Baby Mode → Normal | +200 XP (milestone) |
| Streak de 7 dias | +500 XP |
| Gap treinado e reusado | +30 XP |

## Níveis (Mapeados ao Método MANA)

| Nível AIDA | Faixa de XP | Nome | Analogia |
|---|---|---|---|
| Rookie | 0–500 | The Lurker | Ouvindo da beira da piscina |
| Beginner | 501–1.5k | The Dipper | Pé na água |
| Elementary | 1.5k–4k | The Swimmer | Sabe nadar |
| Intermediate | 4k–10k | The Lapper | Nada sem parar |
| Advanced | 10k–25k | The Diver | Vai fundo |
| Fluent | 25k+ | The Captain | Dono da piscina |

## Tarefas
- [ ] Criar `gamification.js` service com funções: `addXP`, `getXP`, `getLevel`, `getStreak`
- [ ] Integrar chamada de `addXP` no pipeline do `groq.js` após cada resposta válida
- [ ] Mensagem de XP ao aluno após cada sessão: `+50 XP ⚡ [1.200 XP total | Nível: The Swimmer]`
- [ ] Notificação de nível up automática
- [ ] Salvar XP, nível e streak no Redis

---

# Story 2.2 — Streak e Daily Habit Hook

## Status
`Draft`

## Descrição
Como aluno,
Eu quero ser notificado quando estou prestes a quebrar meu streak,
Para que eu nunca perca minha sequência por esquecimento.

## Mecânicas de Streak

```
🔥 3 dias → badge + notificação "3 days strong!"
🔥🔥 7 dias → XP bônus (x2 por 24h)
🔥🔥🔥 30 dias → Desbloqueio: "Monthly Champion" no scoreboard
💀 Streak quebrado → "Comeback" mode: XP dobrado por 3 dias para recuperar motivação
```

## Tarefas
- [ ] Adicionar `dailyStreak` ao perfil Redis do aluno
- [ ] Cron job às 22h: verificar alunos que não praticaram no dia → enviar "lembrete de streak" via WhatsApp
- [ ] Lembrete com urgência escalada: dia 1 = gentil, dia 2 = urgente, dia 3 = "comeback mode ativado"
- [ ] Dobrar XP por 3 dias após quebra de streak (Comeback Mode)

---

# Story 2.3 — Scoreboard: Competição Saudável

## Status
`Draft`

## Descrição
Como aluno,
Eu quero ver minha posição em um ranking semanal,
Para que a competição me motive a praticar mais que os outros.

## Design do Scoreboard

```
🏆 WEEKLY LEADERBOARD — Week of Jun 21

#1  Gabriel F.     🔥 14 dias  |  4.250 XP  ████████████
#2  João M.        🔥 7 dias   |  2.100 XP  ██████
#3  Ana C.         🔥 5 dias   |  1.800 XP  █████
...
#12 Você           🔥 3 dias   |    950 XP  ███
```

## Tarefas
- [ ] Criar endpoint/comando: `ranking` ou `placar` → retorna top 10 semanal
- [ ] Agregar XP semanal no Redis (reset toda segunda-feira às 00h)
- [ ] Enviar digest semanal automático (domingo 20h): ranking + destaque do líder

---

# Story 2.4 — Conquistas (Badges) e Milestones

## Status
`Draft`

## Descrição
Como aluno,
Eu quero desbloquear conquistas ao atingir marcos importantes,
Para que cada conquista me dê uma sensação de identidade nova ("sou um The Swimmer agora").

## Badges Planejados (MVP)

| Badge | Trigger |
|---|---|
| 🏊 First Dip | Completar onboarding |
| 🔥 Week Warrior | 7 dias de streak |
| 📚 Gap Master | Treinar 20 gaps |
| ⚡ Speed Talker | 10 respostas em <30s |
| 🎯 Scene Finisher | Completar 20 cenas sem "bye" precoce |
| 👑 Top 3 | Entrar no top 3 do ranking semanal |
| 🚀 Level Up | Subir de nível pela primeira vez |
| 🐣 Baby Graduate | Sair do Baby Mode |

## Tarefas
- [ ] Criar estrutura de badges no Redis por aluno
- [ ] Detector de trigger para cada badge no pipeline
- [ ] Notificação festiva ao desbloquear: `🏆 CONQUISTA DESBLOQUEADA: Week Warrior! (+500 XP)`

---

## Roadmap do Epic 2

```
Story 2.1 — XP e Níveis (base do sistema)
  └── Story 2.2 — Streak + Daily Hook
       └── Story 2.3 — Scoreboard
            └── Story 2.4 — Badges e Milestones
                 └── Story 2.5 — Social (futuro: grupos, duelos, ligas)
```

## Nota do Arquiteto (@architect hat)
A gamificação NÃO é um layer separado — ela é um pipe que atravessa todo o sistema. O `gamification.js` será chamado por `groq.js`, `aida-scheduler.js` e `onboarding.js`. Design first, implement second: garantir que o XP seja calculado de forma consistente e à prova de fraude (cliente não pode inflar artificialmente).
