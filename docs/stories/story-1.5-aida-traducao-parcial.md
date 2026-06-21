# Story 1.5 — Tradução Parcial: Suporte Contextual por Nível

## Status
`Ready` (aguarda Story 1.4)

## Epic
Epic 1 — Fundação e Agente de Imersão MVP

## Origem
> **Stream of Consciousness — Gabriel Ferreira, 21/06/2026, 01h47**
> "Penso em colocar uma analogia de 'tradução parcial', onde os alunos ao terem dificuldade em entender a maior parte da frase, são traduzidas apenas as palavras-chave (3-5 palavras dependendo da extensão da frase) que são o suficiente para o aluno ter uma ideia do contexto e a mensagem daquela frase/cena, podendo construir em cima dos gaps. Esse tipo de coisa seria feito de acordo com o nível do aluno, sendo mais regular e corriqueiro para níveis inferiores."

## Problema a Resolver
Iniciantes em nível 1-3 ficam travados quando uma frase inteira está fora do seu alcance, levando ao abandono da sessão. A Tradução Parcial serve como *scaffolding* temporário — dá o contexto mínimo para que o aluno possa **construir sobre os gaps**, em vez de desistir.

## Descrição
Como aluno iniciante (nível 1-4),
Eu quero ter acesso contextual às palavras-chave de frases que não entendo,
Para que eu consiga compreender o contexto da cena e responder, mesmo com vocabulário limitado.

## O Conceito: Tradução Parcial Inteligente

```
❌ ERRADO — Tradução total (mata a imersão):
  AIDA: "Hey, I just got back from the farmers market — 
         the mangoes looked incredible!"
  [PT: "Oi, acabei de voltar do mercado — as mangas estavam incríveis!"]

✅ CERTO — Tradução Parcial (mantém o fluxo):
  AIDA: "Hey, I just got back from the farmers market — 
         the mangoes looked incredible!"
  🔍 [farmers market = feira • mangoes = mangas]

O aluno entende o contexto. Pode responder com o que sabe.
Os GAPS (farmers market, incredible) ficam anotados para revisão.
```

### Frequência por Nível
| Nível | Frequência da Tradução Parcial |
|---|---|
| 1-2 | Quase toda frase nova (proativa) |
| 3-4 | Quando aluno envia `?` ou `não entendi` |
| 5-6 | Apenas se aluno pedir explicitamente |
| 7+ | Desativada — imersão total |

### Palavras-Chave Selecionadas
- **Regra:** 3 palavras para frases curtas (<10 palavras), até 5 para frases longas
- **Critério de seleção:** Substantivos e verbos principais — o núcleo semântico da frase
- **Não traduzir:** Artigos, preposições, palavras cognatas óbvias

## Tarefas

### Bloco A — Detecção de Solicitação de Tradução Parcial
- [ ] Criar detector de intenção de ajuda no `aida-engine.js`:
  - [ ] Trigger implícito: aluno manda apenas `?`, `?!`, `huh?`, `não entendi`, `o que?`, `wdym`
  - [ ] Trigger explícito: `traduz`, `ajuda`, `o que significa`, `key words`
- [ ] Lógica de nível:
  - [ ] Nível 1-2: AIDA oferece as key words PROATIVAMENTE após cada cena (sem o aluno pedir)
  - [ ] Nível 3-4: só ativa no trigger do aluno
  - [ ] Nível 5+: modo explícito (`traduz` / `key words`) apenas

### Bloco B — Geração das Key Words
- [ ] Adicionar instrução ao system prompt do AIDA (em `buildAidaSystemPrompt`):
  - [ ] Quando Tradução Parcial estiver ativa, ao enviar uma cena, AIDA adiciona internamente o marcador `[KEYWORDS: palavra1=tradução1 • palavra2=tradução2]`
  - [ ] O pipeline detecta o marcador e formata como bloco separado na mensagem
- [ ] Criar parser de marcador `[KEYWORDS: ...]` no `groq.js` (similar ao `[RESERVA: ...]` já existente)
- [ ] Formatar output: linha separada com emoji 🔍 antes das key words

### Bloco C — Gap Notebook (MVP)
- [ ] Ao gerar key words, salvar no Redis: `gaps:{clientId}:{jid}` → array de `{en, pt, ts}`
- [ ] Comando do aluno: `meus gaps` → lista as últimas 10 palavras com dificuldade
- [ ] Comando do aluno: `treinar gaps` → AIDA cria uma mini-cena usando as palavras salvas

## Critérios de Aceitação

- [ ] Alunos nível 1-2 recebem key words automaticamente após cada cena
- [ ] Alunos nível 3-4 recebem ao pedir com `?` ou `não entendi`
- [ ] Key words são exibidas como linha separada com 🔍 (não misturado no texto)
- [ ] Máximo de 5 palavras-chave por chamada (nunca tradução completa)
- [ ] Gaps são salvos no Redis e acessíveis via comando `meus gaps`
- [ ] Nível 7+ não vê tradução parcial nem é oferecida

## Estimativa
**Complexidade:** Alta (prompt engineering + parser + Redis)
**Tempo estimado:** 4-5h

## Dependências
- **Bloqueia:** Story 1.6 (Conteúdo Infantil complementa esse flow)
- **Bloqueado por:** Story 1.4
