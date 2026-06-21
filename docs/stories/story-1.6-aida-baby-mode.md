# Story 1.6 — Conteúdo Baby: Imersão com Material Infantil para Iniciantes

## Status
`Draft`

## Epic
Epic 1 — Fundação e Agente de Imersão MVP

## Origem
> **Stream of Consciousness — Gabriel Ferreira, 21/06/2026, 01h47**
> "Penso em adicionar material 'infantil' para iniciantes, assim como bebês leem livros para bebês, com muitas imagens e linguagem muito simples. Encontrar o sweet spot de fazer isso de forma mais madura será sensacional."

## Problema a Resolver
Alunos nível 1-2 não conseguem processar cenas contextuais normais — o vocabulário e as estruturas estão além do i+1. Eles precisam de uma rampa de entrada com linguagem ultra-simples, porém **sem se sentir infantilizados**.

## Descrição
Como aluno completo iniciante (nível 1-2),
Eu quero praticar inglês com conteúdo ultra-simples e visual,
Para que eu construa confiança básica antes de entrar nas cenas contextuais avançadas.

## O Conceito: "Babies Learn Smart"

O desafio é o sweet spot: conteúdo simples o suficiente para o iniciante processar, mas **apresentado de forma adulta e sofisticada**. A AIDA não vai "falar com bebê" — vai criar situações reais com vocabulário limitado.

```
ERRADO (infantilizante):
  "Look! A dog! The dog is happy! Woof woof!"

CERTO (Babies Learn Smart):
  "You just moved to NYC. First morning.
   You see: coffee ☕ • sun 🌅 • noise 🔊
   One word: how do you feel?"
   → Aluno responde com UMA palavra. AIDA continua a cena.
```

### Tipos de Conteúdo Baby Mode (por nível)
| Tipo | Nível | Descrição |
|---|---|---|
| **Word-by-scene** | 1 | Aluno responde com 1-3 palavras à cena visual |
| **Picture stories** | 1-2 | AIDA descreve uma imagem com 5-7 palavras, aluno reage |
| **Emoji scenes** | 1-2 | Cena contada com emojis + 3 palavras em inglês |
| **Single-question loop** | 2-3 | Uma pergunta simples por turno, vocabulário curado |

### Material Visual (WhatsApp-native)
- Uso estratégico de emojis como substitutos de imagens (sem custo de API)
- Frases de ≤7 palavras por turno no Baby Mode
- Vocabulário curado para cada persona/interesse (Tech: code, screen, app, bug, click)

## Tarefas

### Bloco A — Baby Mode Engine
- [ ] Criar flag `babyMode: true` no perfil do aluno (Redis) para nível 1-2 automático
- [ ] Adicionar instrução `BABY_MODE` ao `buildAidaSystemPrompt` quando ativa:
  - [ ] Frases de ≤7 palavras por turno
  - [ ] Vocabulário de 500 palavras mais comuns (Fry list adaptada)
  - [ ] Uso de emojis como contexto visual (obrigatório no Baby Mode)
  - [ ] Aluno pode responder com 1 palavra — AIDA continua a cena sem problema
- [ ] Criar vocabulário curado por interesse no `aida.json`:
  - [ ] `tech_baby_vocab`: code, bug, app, click, run, error, screen, type
  - [ ] `travel_baby_vocab`: ticket, hotel, taxi, food, map, lost, help, price
  - [ ] `sports_baby_vocab`: team, score, win, game, run, ball, play, coach

### Bloco B — Progressão Automática
- [ ] Implementar upgrade automático de Baby Mode → Normal Mode:
  - [ ] Após 3 sessões onde aluno escreve frases de >5 palavras: sair do Baby Mode
  - [ ] Notificar aluno: "You're leveling up! 🎯 Ready for real scenes?"
  - [ ] Atualizar `babyMode: false` e incrementar nível em +1 no Redis

### Bloco C — Visual Storytelling
- [ ] Template de "Emoji Scene" para personas populares:
  - [ ] Tech: `🖥️ 🐛 ❌ → What happened?`
  - [ ] Travel: `✈️ 🏨 🔑 → You arrive. What do you say?`
  - [ ] Sports: `🏆 ⚽ 😤 → Your team lost. How do you feel?`

## Critérios de Aceitação

- [ ] Alunos nível 1-2 entram automaticamente em Baby Mode
- [ ] Todas as respostas da AIDA em Baby Mode têm ≤7 palavras
- [ ] Emojis são usados em toda cena do Baby Mode como suporte visual
- [ ] Progressão automática ocorre após 3 sessões de respostas ≥5 palavras
- [ ] Sweet spot validado: nenhum aluno reporta sentir-se infantilizado

## Estimativa
**Complexidade:** Média
**Tempo estimado:** 3-4h + curation de vocabulário

## Dependências
- **Bloqueia:** Story 2.1 (Gamificação — o Baby Mode tem seu próprio track de XP)
- **Bloqueado por:** Story 1.5
