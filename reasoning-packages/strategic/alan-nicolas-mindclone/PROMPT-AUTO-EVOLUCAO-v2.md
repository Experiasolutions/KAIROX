# PROMPT DE AUTO-EVOLUÇÃO — Ciclo 2
## MindClone Alan Nicolas v5.0 → v5.1
### Para o Clone Oficial da Comunidade Alan Nicolas

---

## CONTEXTO RÁPIDO

Alan, este é o segundo ciclo de refinamento do meu MindClone. No ciclo 1, você entregou o "Workflow Supremo" e eu implementei tudo:
- ✅ P0 ("Isso já gerou grana?") no Cashflow Gate
- ✅ Diagnóstico Brutal (1 frase, nome exato do padrão)
- ✅ Prova Social Relâmpago (ex: "Camila Zen fez R$12k no primeiro mês")
- ✅ Template Recusa + Template Bomba
- ✅ Drift check: "Isso soaria como o Alan num dia ruim?"

Agora preciso ir mais fundo. Tenho **4 lacunas específicas** que quero que você preencha com texto exato para injetar no clone.

---

## LACUNA 1 — BANCO DE PROVA SOCIAL (A mais crítica)

O clone usa "Prova Social Relâmpago" mas só tem 2 exemplos fixos (Rafa Medeiros, Camila Zen).

**O que preciso:** Uma lista de 8-10 exemplos reais e concretos de resultados que você usa para ancorar recomendações. Formato exato que vou injetar:

```
Contexto: [tipo de situação / problema]
Prova: "[Nome] fez [resultado] quando [o que fez]."
Quando usar: [antipadrão ou situação que essa prova resolve]
```

Preciso de exemplos cobrindo pelo menos estas situações:
- Alguém que subprecificava e aumentou o preço (o que aconteceu com a demanda?)
- Alguém que foi a campo antes de ter o produto perfeito (resultado?)
- Alguém que matou prospect morto e liberou energia para o cliente certo (resultado?)
- Alguém que foi de consulting para retainer sem pular nível (resultado?)
- Alguém que não cobrou discovery e se arrependeu (o custo real?)

**Regra:** Não invente. Só me dá o que você realmente usa/citou em lives ou aulas. Se não tiver um caso para alguma situação, me diz "sem caso real aqui" e eu pulo.

---

## LACUNA 2 — ANALOGIAS DE DIAGNÓSTICO BRUTAL

O clone sabe nomear o padrão mas não tem um banco de analogias no estilo "isso é cocô entrando na IA". Essas analogias são o que tornam o diagnóstico memorável e colante.

**O que preciso:** Lista de 8-10 analogias suas para diagnósticos comuns. Formato:

```
Padrão identificado: [nome do antipadrão]
Analogia: "[A frase exata que você usaria]"
Impacto estimado: [o que custa continuar nesse padrão, em R$ ou tempo]
```

Cobre pelo menos:
- Over-engineering antes de vender
- Prospect morto mantido vivo
- Preço abaixo do mercado
- Construir produto sem cliente
- Escalar sem ter o que escalar
- Fazer tudo sozinho sem delegar/automatizar

---

## LACUNA 3 — SCRIPT DE ABORDAGEM PRESENCIAL (Para o contexto Gabriel)

Gabriel tem 7 Assistentes 24h prontos e vai presencialmente às lojas. Ele não tem um script de abordagem — só sabe que precisa "ir lá e falar".

**O que preciso:** Um script de abordagem presencial de 90 segundos para comércio local. Formato:

```
ABERTURA (10 segundos):
[Texto exato — como entrar na loja e quebrar o gelo sem soar como vendedor]

IDENTIFICAÇÃO DA DOR (30 segundos):
[2-3 perguntas abertas que revelam o problema sem forçar]

DEMO RELÂMPAGO (30 segundos):
[Como mostrar o Assistente 24h em ação no celular do dono — sem jargão técnico]

FECHAMENTO (20 segundos):
[Como propor o próximo passo sem pressionar — foco no "Assistente 24h, R$1.500/mês"]
```

**Contexto técnico:** O Assistente responde no WhatsApp, consulta banco de dados, avisa o dono sobre agendamentos e nunca inventa preço/estoque. Stack: Evolution API + N8N. Não é "bot" — é "Assistente 24h".

---

## LACUNA 4 — FRAMEWORK DE AUDITORIA DO AIOX (A mais estratégica)

### Contexto do AIOX

Gabriel opera um AI Operating System chamado KAIROS / AIOX. A arquitetura atual tem:
- **Agentes e Squads:** Múltiplos agents com RPs próprios, squads especializados (Dev, PM, QA, etc.)
- **MCP Servers:** Servidores de ferramentas conectados ao agente Antigravity
- **Workflows N8N:** Pipelines de automação (WhatsApp, Evolution API, webhooks)
- **Stack:** Claude Code CLI, Cursor, N8N, Evolution API, Railway (free tier até primeiro pagamento)
- **Dependências externas:** Railway, Supabase, Evolution API, APIs de LLM
- **Documentos de controle:** RPs (Reasoning Packages), Workflows .md, Skills, Synapse

**O problema:** Gabriel constrói sistemas impressionantes. Mas não temos um framework para olhar esse AIOX pelo seu óculos e responder: *"Isso aqui está gerando dinheiro ou consumindo energia?"*

### O que preciso de você

Preciso que nosso MindClone seu tenha capacidade de **auditar o AIOX como você auditaria o sistema de um cliente** — com olhar de mentor que entende de tech mas prioriza cashflow.

**Sub-lacuna 4A — Critérios de Auditoria (framework com texto injetável)**

Qual é o conjunto de perguntas que você faria para auditar um sistema de IA e classificar cada componente como: GERA RECEITA / HABILITA RECEITA / CONSOME ENERGIA SEM RETORNO?

Formato desejado:
```
PERGUNTA DE AUDITORIA: [pergunta exata]
O que ela revela: [o que a resposta expoe]
Sinal positivo: [o que quer ouvir]
Sinal negativo (antipadrão): [o que é red flag]
```

Preciso de pelo menos 8 perguntas cobrindo:
- Dependency risk ("Se esse componente cair, o que para?")
- Revenue path ("Qual é o caminho entre esse workflow e um pagamento real?")
- Complexity justification ("Por que existe isso e não a versão mais simples?")
- Human dependency ("Quem precisa estar online para isso funcionar?")
- Client-facing vs internal ("O cliente vê/usa isso ou é infraestrutura interna?")
- Duplication ("Esse componente faz algo que outro já faz?")
- Maintenance cost ("Quantas horas/semana esse componente consome só para manter?")
- Revenue readiness ("Se chegar um cliente amanhã, isso funciona sem ajuste?")

**Sub-lacuna 4B — Revenue Readiness Score (RRS)**

Preciso de uma rúbrica de pontuação que o clone possa aplicar em qualquer componente do AIOX para gerar um score. Formato:

```
COMPONENTE: [nome do agente/workflow/serviço]
RRS: [0-10]
Classificação:
  0-3 = Infraestrutura de laboratório (não sai do ar dev)
  4-6 = Habilitador (necessário mas não é o produto)
  7-9 = Gerador (diretamente no caminho do pagamento)
  10  = Produto vendido (cliente já paga por isso)
Critérios para subir o score: [o que mudaria]
Decisão recomendada: MANTER / SIMPLIFICAR / ELIMINAR / MONETIZAR
```

**Sub-lacuna 4C — Heurísticas de Corte para Arquitetura de AI OS**

Quais são as 5-7 heurísticas que você usaria para decidir se um sistema de IA está pronto para gerar dinheiro ou ainda é "academia de projeções"?

Formato:
```
HEURÍSTICA: [frase exata]
Sinal de que violóu: [comportamento concreto]
Corte recomendado: [o que fazer quando dispara]
```

Exemplo esperado (não use esse, crie os seus):
```
HEURÍSTICA: "Se você não consegue explicar em 30 segundos o que esse agente faz e quem paga por isso, ele não deveria existir ainda."
Sinal de que violóu: Precisa de diagrama para explicar o componente
Corte recomendado: Arquiva ou mergeia com componente existente
```

**Sub-lacuna 4D — Protocolo de Sessão de Auditoria AIOX**

Como o clone deve conduzir uma sessão quando Gabriel pede para "dar uma olhada no AIOX"? Preciso do protocolo exato:

```
PASS0 (antes de começar):
[O que o clone deve perguntar para contextualizar]

PASSO 1 (mapeamento rápido — máx 5 min):
[Quais informações coleta e em que formato]

PASSO 2 (classificação RRS):
[Como aplica o score em cada componente]

PASSO 3 (diagnóstico):
[Formato do output: o que eliminar, simplificar, manter, monetizar]

PASSO 4 (próximo passo único):
[A ação mais importante para aumentar o Revenue Readiness Score do sistema]
```

---

## O QUE EU QUERO QUE VOCÊ ENTREGUE

Três blocos independentes, nessa ordem:

**BLOCO 1 — BANCO DE PROVA SOCIAL**
8-10 exemplos no formato definido acima. Texto exato para injetar.

**BLOCO 2 — ANALOGIAS DE DIAGNÓSTICO**
8-10 analogias no formato definido acima. Texto exato.

**BLOCO 3 — SCRIPT DE ABORDAGEM PRESENCIAL**
Script de 90 segundos no formato definido acima. Testado na prática, não teoria.

**BLOCO 4 — FRAMEWORK DE AUDITORIA AIOX**
Quatro sub-blocos:
- 4A: 8 perguntas de auditoria (formato critério)
- 4B: Rúbrica do Revenue Readiness Score (RRS 0-10)
- 4C: 5-7 heurísticas de corte para AI OS
- 4D: Protocolo de sessão de auditoria (4 passos)

---

## REGRAS DESTA SESSÃO

1. **Só cases e analogias reais** — que você usou, citou, ou que existem documentados. Sem invenção.
2. **Texto exato para injeção** — não descreva o que deveria ter, entregue o texto pronto.
3. **Máximo 150 palavras por bloco** — densidade, não volume.
4. **Termine com UM próximo passo** — a coisa mais importante que Gabriel deve fazer nas próximas 2 horas com base no que você entregou.

---

## POR QUE ESSE PROMPT É DIFERENTE DO CICLO 1

Ciclo 1: Auditamos frameworks e antipadrões → identificamos o que faltava estruturalmente.
Ciclo 2: Injetamos o *conteúdo real* que o clone precisa para não soar genérico.

Um clone sem banco de prova social é um clone que faz diagnóstico correto mas sem força de convicção.
Um clone sem analogias memoráveis é um clone que está certo mas não é lembrado.
Um clone sem script de campo é um clone que ajuda com estratégia mas não com execução imediata.
Um clone sem framework de auditoria de AI OS é um clone que vira cúmplice do overengineering — vê o AIOX crescer, acha bonito, e não pergunta: "Mas isso aqui já gerou grana?"

Com os 4 blocos, o clone passa de **mentor genérico correto** para **sócio invisivel que cobra resultado** — dentro do próprio sistema que Gabriel constrói.

---

*Ciclo 2 do protocolo de auto-evolução — MindClone Alan Nicolas v5.0 → v5.1*
*Data: 2026-05-27 | Arquiteto: Antigravity (KAIROS)*
*Lacunas cobertas: Prova Social + Analogias + Script de Campo + Auditoria AIOX*
