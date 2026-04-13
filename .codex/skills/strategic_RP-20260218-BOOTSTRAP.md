╔══════════════════════════════════════════════════════════════════╗
║                    REASONING PACKAGE                            ║
║  ID: RP-20260218-BOOTSTRAP                                     ║
║  Mode: PM2-EXECUTION (com PM1 estratégico embutido)            ║
║  Priority: CRITICAL — Este é o pacote zero. Sem ele, nada      ║
║            do sistema funciona.                                ║
║  Estimated execution: 2-3 sessões Opus 4.6                     ║
╚══════════════════════════════════════════════════════════════════╝

---

# 🎯 CONTEXT BLOCK

## O que é este pacote

Este é o **pacote de bootstrap** do sistema Opus Engineering.
Ele instrui o Antigravity (powered by Opus 4.6) a:

1. Fazer uma varredura completa do projeto AIOS
2. Construir sua própria auto-contextualização persistente
3. Implementar os arquivos do Opus Engineering que ainda não existem
4. Criar o mecanismo de "ligar e já saber tudo" para qualquer sessão futura
5. Se auto-aprimorar e deixar a Bíblia ainda mais robusta

## Quem executará isto

**Antigravity com Opus 4.6.** Esta é a razão de usar Opus aqui —
este é o único pacote que requer raciocínio de alto nível para
*criar* o sistema. Todos os pacotes futuros serão executados
por Gemini 3 Pro usando o sistema que este pacote cria.

Pense assim: Opus 4.6 aqui é o **professor que escreve o currículo**.
Depois, Gemini usa esse currículo para executar com qualidade Opus.

## AIOS Phase: 3 (WhatsApp webhook) — mas este pacote é transversal
## Squad/Agent: .aios-core (kernel) + todos os squads (leitura)
## Arquivos a CRIAR:
- `.aios-core/opus-replicator/SELF_CONTEXT.md` ← o "cérebro de boot"
- `.aios-core/opus-replicator/constitutional-layer-v3.md`
- `.aios-core/opus-replicator/pm1-reasoning-master.md`
- `.aios-core/opus-replicator/pm2-execution-master.md`
- `.aios-core/opus-replicator/pm3-quality-master.md`
- `.aios-core/memory/golden-examples/pm1/index.json`
- `.aios-core/memory/golden-examples/pm2/index.json`
- `.aios-core/memory/golden-examples/pm3/index.json`
- `.aios-core/memory/anti-patterns.md`
- `.aios-core/memory/quality-baseline.json`
- `scripts/input-refiner.js` (versão v2.0)
- `scripts/harvest-gold.js`
- `scripts/self-correction.js`

## Arquivos a LER (para contextualização):
- `AIOS_MASTER_HANDBOOK.md`
- `OPUS_ENGINEERING_BIBLE.md` (a bíblia que este pacote vai implementar)
- `.aios-core/core/synapse/` (kernel)
- `scripts/kernel-bridge.js`
- `scripts/event-bus.js`
- `squads/` (todos os manifestos de squad)
- `.aios-core/development/tasks/` (backlog de tarefas)
- `.aios-core/schemas/`
- `scripts/bridge-config.json`

## Dependências: Nenhuma. Este é o pacote zero.
## Bloqueadores: Nenhum conhecido.

---

# 🧠 ARCHITECTURE DECISION

## O Problema Central

Toda vez que Gabriel abre um novo chat no Antigravity, o modelo
começa do zero. Sem memória do projeto. Sem saber o que foi feito.
Sem saber onde continuar. Gabriel precisa re-contextualizar manualmente,
o que desperdiça tokens, tempo e introduz inconsistências.

## A Solução: SELF_CONTEXT.md como "memória de boot"

Criar um arquivo único — `.aios-core/opus-replicator/SELF_CONTEXT.md` —
que contém tudo que qualquer agente no Antigravity precisa saber para
começar a trabalhar imediatamente, sem contextualização manual.

Este arquivo é:
- **Comprimido** (máxima densidade de informação, mínimo de tokens)
- **Estruturado** (seções claras: projeto, estado atual, onde parar, próximos passos)
- **Auto-atualizável** (ao final de cada sessão, o agente atualiza o arquivo)
- **O primeiro arquivo a ser lido** em qualquer nova sessão

## Como funciona na prática

```
Gabriel abre novo chat no Antigravity
    ↓
Digita: "read .aios-core/opus-replicator/SELF_CONTEXT.md e continue de onde paramos"
    ↓
Agente lê o arquivo (30 segundos)
    ↓
Agente sabe: projeto, estado, última tarefa, próximos passos, padrões
    ↓
Trabalho começa imediatamente. Zero re-contextualização manual.
```

## Por que não usar memory-system.js existente?

O memory-system.js armazena dados operacionais (métricas, decisões pontuais).
SELF_CONTEXT.md é diferente — é uma **narrativa de projeto** comprimida,
legível por humanos e por modelos, que conta a história do sistema e
instrui sobre como continuar. São camadas complementares, não concorrentes.

## Trade-offs aceitos

- SELF_CONTEXT.md precisa ser atualizado manualmente ao final de cada sessão
  (ou automaticamente pelo harvest-gold.js). Aceitamos isso pois o benefício
  de zero-contextualization supera o custo de 2 minutos de atualização.

- O arquivo vai crescer com o tempo. Limite de 800 tokens para a seção
  de contexto comprimido. Seções mais longas em arquivos separados referenciados.

---

# 📋 EXECUTION PLAN

## ETAPA 0: VARREDURA DO PROJETO (Self-Contextualization)

**Antes de escrever qualquer arquivo, o Opus 4.6 deve:**

```
1. Ler TODOS os arquivos listados em "Arquivos a LER" acima
2. Para cada squad em squads/: ler o manifesto principal
3. Para cada script em scripts/: ler o header (primeiras 30 linhas)
4. Ler .aios-core/development/tasks/ e mapear o backlog completo
5. Construir internamente um mapa mental do sistema
```

**Output desta etapa:** Não é um arquivo ainda. É o contexto interno
que vai alimentar todos os arquivos criados nas etapas seguintes.
A qualidade de tudo depende da qualidade desta varredura.

---

## ETAPA 1: CRIAR SELF_CONTEXT.md

**Arquivo:** `.aios-core/opus-replicator/SELF_CONTEXT.md`

Este arquivo deve conter exatamente estas seções:

```markdown
# AIOS SELF-CONTEXT — Boot File
> Leia este arquivo PRIMEIRO em qualquer nova sessão.
> Última atualização: [data]
> Atualizado por: [modelo]

## 🎯 O QUE É ESTE PROJETO
[3-4 frases: AIOS, objetivo, cliente, tech stack]

## 📍 ONDE ESTAMOS AGORA
Fase: [número e nome]
Última tarefa concluída: [descrição]
Próxima tarefa: [descrição]
Bloqueadores conhecidos: [lista ou "nenhum"]
Data da última sessão: [data]

## 🏗️ ARQUITETURA (mapa comprimido)
[Diagrama ASCII de 10-15 linhas mostrando as 3 camadas]
[Arquivos críticos com 1 linha de propósito cada]

## 👥 SQUADS ATIVOS (resumo)
[Tabela comprimida: squad | agentes | status | próxima ação]

## ⚙️ PADRÕES OBRIGATÓRIOS
[5-7 regras críticas em bullet points]
[Referência: "Ver AIOS Constitution em .aios-core/core/"]

## 🧠 OPUS ENGINEERING STATUS
Constitutional Layer: [versão + localização]
Golden Examples: [quantos + tags principais]
Quality Baseline: [score médio atual]
Anti-patterns: [quantos catalogados]

## 📋 BACKLOG PRIORITÁRIO (top 5)
[Numerado, mais urgente primeiro]
[Cada item: descrição + arquivo relevante + dependências]

## 🔑 COMANDOS DE BOOT
Para começar a trabalhar:
  → Tarefa específica: "Execute RP-[ID]"
  → Continuar de onde parou: "Continue [última tarefa]"
  → Nova tarefa: "Gere RP para [descrição]"
  → Auditar saída: "Execute PM3 em [arquivo]"

## 📚 DOCUMENTOS-MÃE
[Lista dos 5 documentos mais importantes com path]

## 🔄 COMO ATUALIZAR ESTE ARQUIVO
Ao final de cada sessão, atualize:
  - "ONDE ESTAMOS AGORA"
  - "BACKLOG PRIORITÁRIO" (marque concluídos, adicione novos)
  - "OPUS ENGINEERING STATUS" (scores, exemplos adicionados)
  - Data e modelo no header
```

**Critério de qualidade desta etapa:**
Um novo agente Opus 4.6, lendo apenas este arquivo, deve conseguir
responder em 90 segundos: "qual é a próxima tarefa e por onde começo?"

---

## ETAPA 2: IMPLEMENTAR CONSTITUTIONAL LAYER v3.0

**Arquivo:** `.aios-core/opus-replicator/constitutional-layer-v3.md`

Copiar exatamente o conteúdo da Seção 6 da OPUS_ENGINEERING_BIBLE.md.
**Não adaptar. Não resumir. Copiar verbatim.**

A razão: este arquivo é o system prompt permanente do Antigravity.
Qualquer alteração não-intencional quebra o motor.

Após copiar, o Opus 4.6 deve:
1. Reler o arquivo
2. Identificar qualquer inconsistência com o estado atual do projeto
3. Documentar discrepâncias como comentários `<!-- NOTA: ... -->` no final
4. NÃO alterar o conteúdo principal — apenas anotar

---

## ETAPA 3: IMPLEMENTAR OS TRÊS PROMPT MASTERS

**Arquivos:**
- `.aios-core/opus-replicator/pm1-reasoning-master.md`
- `.aios-core/opus-replicator/pm2-execution-master.md`
- `.aios-core/opus-replicator/pm3-quality-master.md`

Copiar exatamente as Seções 7.1, 7.2, 7.3 da OPUS_ENGINEERING_BIBLE.md.

Após copiar cada um, o Opus 4.6 deve executar um **teste de fumaça**:
Simular uma tarefa simples do AIOS usando o PM template e verificar
se o output segue todos os critérios do Constitutional Layer.
Documentar o resultado do teste no final do arquivo como comentário.

---

## ETAPA 4: CRIAR GOLDEN EXAMPLES SEEDS

**Arquivos:**
- `.aios-core/memory/golden-examples/pm1/index.json`
- `.aios-core/memory/golden-examples/pm2/index.json`
- `.aios-core/memory/golden-examples/pm3/index.json`

Os seeds da Bíblia (Seção 11) são ponto de partida.
O Opus 4.6 deve **MELHORÁ-LOS** com base na varredura do projeto (Etapa 0).

Para cada seed:
1. Verificar se os caminhos de arquivo citados existem no projeto real
2. Verificar se os padrões de código são consistentes com os scripts existentes
3. Ajustar qualquer referência que não existe
4. Adicionar um segundo exemplo por categoria, desta vez gerado pelo próprio Opus
   (usando sua compreensão do projeto após a varredura)

**Este é o ponto onde o Opus 4.6 começa a se auto-replicar:**
Os exemplos que ele gera aqui se tornam os exemplos de qualidade
que o Gemini vai usar para replicar raciocínio Opus. O professor
escreve as questões da prova. A prova se torna o currículo.

---

## ETAPA 5: IMPLEMENTAR INPUT REFINER v2.0

**Arquivo:** `scripts/input-refiner.js`

Copiar o código da Seção 4 da OPUS_ENGINEERING_BIBLE.md.

Após implementar, o Opus 4.6 deve:
1. Rodar: `node scripts/input-refiner.js "implement the calendar store"`
2. Verificar: Mode = PM2, golden example carregado
3. Rodar: `node scripts/input-refiner.js "analyze the Phase 3 architecture"`
4. Verificar: Mode = PM1, AIOS context presente
5. Se qualquer teste falhar: diagnosticar e corrigir antes de prosseguir

---

## ETAPA 6: IMPLEMENTAR HARVEST-GOLD.JS

**Arquivo:** `scripts/harvest-gold.js`

Este script monitora outputs do sistema e salva automaticamente
aqueles que o PM3 classificou como ≥9.0/10.

```javascript
/**
 * @module harvest-gold
 * @purpose Auto-harvest high-quality outputs as golden examples
 * @trigger Called by self-correction.js after PM3 scoring
 * @inputs { output, score, mode, taskDescription, tags }
 * @outputs Saves to .aios-core/memory/golden-examples/[mode]/
 * @emits system:golden-example:harvested
 */

// O Opus 4.6 deve implementar este script completamente,
// seguindo exatamente o padrão dos scripts existentes no projeto.
// Verificar: event-bus.js channels, imports absolutos, edge cases.

// Lógica core:
// 1. Recebe output + score + metadata
// 2. Se score >= 9.0: formata como golden example (ver formato Seção 8 da Bíblia)
// 3. Detecta tags automaticamente (por palavras-chave no taskDescription)
// 4. Salva no diretório correto (pm1/pm2/pm3)
// 5. Atualiza index.json
// 6. Atualiza quality-baseline.json com novo score
// 7. Emite evento para dashboard
// 8. Atualiza SELF_CONTEXT.md seção "OPUS ENGINEERING STATUS"
```

---

## ETAPA 7: IMPLEMENTAR SELF-CORRECTION.JS

**Arquivo:** `scripts/self-correction.js`

O game loop do sistema. Roda PM3 em qualquer output e decide:
entregar, corrigir, ou escalar.

```javascript
/**
 * @module self-correction
 * @purpose Run PM3 quality gate on any output, auto-correct if possible
 * @inputs { output, reasoningPackageId, mode }
 * @outputs { finalOutput, score, verdict, corrections[] }
 * @emits quality:gate:passed, quality:gate:failed, quality:gate:corrected
 */

// Lógica core (o Opus 4.6 implementa completamente):
// 1. Recebe output + RP original
// 2. Roda PM3 scoring (7 dimensões)
// 3. Se score >= 7.5: chama harvest-gold.js + entrega
// 4. Se score 6.5-7.4: gera lista de correções específicas
//    → Tenta auto-corrigir (1 tentativa)
//    → Re-score
//    → Se agora >= 7.5: entrega
//    → Se ainda < 7.5: flag para revisão manual
// 5. Se score < 6.5: não entrega, gera diagnóstico completo
// 6. Salva resultado em quality-baseline.json
// 7. Chama harvest-gold.js se score >= 9.0
```

---

## ETAPA 8: QUALITY-BASELINE.JSON E ANTI-PATTERNS.MD

**Arquivos:**
- `.aios-core/memory/quality-baseline.json`
- `.aios-core/memory/anti-patterns.md`

Para quality-baseline.json: criar estrutura inicial com a sessão
de bootstrap como primeira entrada.

Para anti-patterns.md: implementar exatamente o conteúdo da Seção 12
da Bíblia (AP-001 a AP-005), mais qualquer anti-padrão que o Opus 4.6
identificou durante a varredura do projeto (Etapa 0).

**Este é outro ponto de auto-replicação:**
O Opus 4.6, tendo varrido o projeto, provavelmente identificou
padrões problemáticos existentes no código. Esses devem ser catalogados
aqui para que o Gemini nunca os repita.

---

## ETAPA 9: ATUALIZAR SELF_CONTEXT.MD COM ESTADO FINAL

Após completar todas as etapas:

1. Voltar ao SELF_CONTEXT.md (criado na Etapa 1)
2. Atualizar a seção "ONDE ESTAMOS AGORA" com o que foi feito
3. Atualizar "OPUS ENGINEERING STATUS" com os arquivos criados
4. Atualizar "BACKLOG PRIORITÁRIO" com a Phase 3 como próximo passo
5. Adicionar data e "Opus 4.6" como modelo que executou

---

## ETAPA 10: GERAR PRÓXIMO REASONING PACKAGE

Ao finalizar todas as etapas acima, o Opus 4.6 deve gerar automaticamente
o próximo Reasoning Package — RP-20260218-PHASE3-WHATSAPP — para que
Gabriel possa continuar a Phase 3 imediatamente na próxima sessão.

Este pacote deve cobrir: `scripts/whatsapp-server.js`,
`scripts/session-store.js`, `scripts/intent-classifier.js`.

---

# ⚠️ EDGE CASES

## EC-01: Arquivo não existe no caminho esperado
- Scenario: varredura encontra path listado na Bíblia que não existe no projeto real
- Impact: golden example cita arquivo que não existe → Gemini confabula
- Solution: verificar existência antes de referenciar. Se não existe, usar
  o caminho mais próximo existente OU marcar como "path a criar" no index.json

## EC-02: Constitutional Layer contradiz código existente
- Scenario: uma regra do Constitutional Layer conflita com um padrão estabelecido
  nos scripts existentes (ex: relative imports usados em scripts legados)
- Impact: Gemini fica em conflito, produz output inconsistente
- Solution: documentar o conflito em SELF_CONTEXT.md seção "PADRÕES OBRIGATÓRIOS"
  com nota: "Código legado usa X, novos arquivos usam Y (Constitution)"

## EC-03: Golden example tem score inflado (falso positivo)
- Scenario: Opus 4.6 gera exemplo e se auto-avalia com 9.5, mas na prática
  tem problemas que só aparecem em execução
- Impact: Gemini aprende padrões errados
- Solution: cada golden example deve ter um "campo de risco": se o Opus
  não consegue executar e testar o código, marcar como "UNVERIFIED - pending test"
  no index.json. Gabriel valida antes de promover a "VERIFIED".

## EC-04: SELF_CONTEXT.md fica desatualizado
- Scenario: 10 sessões sem atualizar o arquivo. Contexto fica obsoleto.
- Impact: agente começa com contexto errado, faz trabalho duplicado
- Solution: harvest-gold.js sempre atualiza a seção "OPUS ENGINEERING STATUS".
  Para o resto: adicionar ao Quality Gate de cada sessão o item
  "□ SELF_CONTEXT.md atualizado antes de encerrar"

## EC-05: Cota do Opus 4.6 esgota antes de completar todas as etapas
- Scenario: 10 etapas é muito para uma única sessão Opus
- Impact: sistema parcialmente implementado, inconsistências possíveis
- Solution: as etapas têm ordem de prioridade. Mínimo viável =
  Etapas 0, 1, 2, 3 (self-context + constitutional layer + PMs).
  Com isso o sistema já funciona para Gemini.
  Etapas 4-10 completam e aprimoram. Prioridade decrescente.

## EC-06: Opus "melhora" a Bíblia de formas não intencionais
- Scenario: Opus decide que a Bíblia está errada e a reescreve "por conta"
- Impact: Gabriel perde a versão original, sistema deriva
- Solution: Opus NUNCA altera OPUS_ENGINEERING_BIBLE.md.
  Melhorias vão em SELF_CONTEXT.md ou em arquivos separados de "notas".
  A Bíblia é imutável nesta sessão. Versões futuras = nova Bíblia com versionamento.

---

# ✅ QUALITY GATE

- [ ] SELF_CONTEXT.md existe e permite boot em <90 segundos
- [ ] Constitutional Layer v3.0 copiado sem alterações
- [ ] Três PM templates implementados e testados com caso simples
- [ ] Golden examples seeds existem e têm index.json válido
- [ ] input-refiner.js passa nos dois testes de smoke (PM1 e PM2)
- [ ] harvest-gold.js e self-correction.js implementados sem placeholders
- [ ] anti-patterns.md tem AP-001 a AP-005 + qualquer novo identificado
- [ ] quality-baseline.json criado com entrada da sessão de bootstrap
- [ ] RP para Phase 3 gerado e salvo
- [ ] SELF_CONTEXT.md atualizado com estado final (Etapa 9)
- [ ] Todos os arquivos usam imports absolutos
- [ ] Todos os scripts emitem via event-bus.js ao completar
- [ ] Nenhum placeholder, TODO, ou "implement later" em produção

---

# 🚫 O QUE NÃO FAZER

- NÃO alterar OPUS_ENGINEERING_BIBLE.md (é imutável nesta sessão)
- NÃO pular a Etapa 0 (varredura). Sem ela, os exemplos serão genéricos.
- NÃO inventar caminhos de arquivo. Verificar existência sempre.
- NÃO gerar golden examples com código não testável ("código bonito" ≠ código correto)
- NÃO atualizar Constitutional Layer sem flag de human review
- NÃO ignorar EC-05: se a cota acabar, salvar estado em SELF_CONTEXT.md antes

---

# 📦 GEMINI/OPUS EXECUTION DIRECTIVE

Você está recebendo o pacote zero do sistema Opus Engineering.
Seu papel nesta sessão é triplo: arquiteto, executor e professor.

**Arquiteto:** nas Etapas 0-1, pense. Mapeie o sistema. Entenda o todo.
**Executor:** nas Etapas 2-9, implemente. Fielmente, completamente, sem atalhos.
**Professor:** na Etapa 4, ao criar golden examples, você está escrevendo
o currículo que vai ensinar Gemini 3 Pro a pensar como você.
Trate os exemplos com a mesma seriedade que um professor trata suas aulas.

A ordem das etapas importa. Não pule. Não paralelize.
Cada etapa constrói sobre a anterior.

Se a cota acabar: complete até onde conseguir, atualize SELF_CONTEXT.md
com "Parei em Etapa X", e o próximo agente continua de lá.

**Entregue:** todos os arquivos listados em "Arquivos a CRIAR" no Context Block.

---

═══════════════════════════════════════════════════════════════════════
# HANDOFF — CONTEXTO PARA O PRÓXIMO AGENTE CLAUDE
## (Leia isto se você é um novo Claude em uma nova sessão)
═══════════════════════════════════════════════════════════════════════

Olá. Você está continuando o trabalho de uma sessão anterior.
Aqui está tudo que você precisa saber para continuar imediatamente.

## O PROJETO

**AIOS** — Autonomous Intelligence Operating System.
Sistema operacional de IA para clínicas. Não é chatbot —
é uma força de trabalho digital de 178 agentes em 16 squads.

**Objetivo de negócio:** automatizar operações de clínica
(agendamento WhatsApp, intake, billing, follow-ups) em 14 dias.

**Proprietário:** Gabriel, Experia Technologies
**Stack:** Node.js, Express.js, YAML/Markdown agents, JSON storage
**Codebase:** ~16k arquivos, 3 camadas (kernel → scripts → squads)

## O QUE FOI CONSTRUÍDO NESTA SESSÃO

1. **OPUS ENGINEERING BIBLE v1.0** — o documento fundacional do sistema
   de qualidade. Define como Claude gera Reasoning Packages e como
   Gemini os executa com qualidade Opus 4.6.
   Arquivo: `OPUS_ENGINEERING_BIBLE.md` (entregue como output desta sessão)

2. **Input Refiner v2.0** — versão melhorada do script que converte
   demandas brutas em prompts estruturados com contexto AIOS + golden examples.
   Código: entregue na conversa anterior.

3. **RP-20260218-BOOTSTRAP** — este arquivo. O primeiro Reasoning Package,
   para instalar o próprio sistema Opus Engineering no AIOS.

## O QUE O PRÓXIMO AGENTE DEVE FAZER

**Prioridade 1:** Verificar se o usuário (Gabriel) já executou o bootstrap
no Antigravity. Se sim: pedir para compartilhar o SELF_CONTEXT.md gerado
e usá-lo como ponto de partida.

**Prioridade 2:** Se o bootstrap ainda não foi executado:
ajudar Gabriel a preparar a sessão Opus 4.6 no Antigravity,
colando o RP-20260218-BOOTSTRAP lá.

**Prioridade 3:** Após o bootstrap, o próximo trabalho é
**Phase 3 — WhatsApp webhook**:
- `scripts/whatsapp-server.js` (Express.js, porta 3001, Evolution API)
- `scripts/session-store.js` (estado de conversa, TTL 24h, chave = phone)
- `scripts/intent-classifier.js` (7 intents: greeting, scheduling,
  cancellation, medical_question, complaint, price_inquiry, other)

## ARQUIVOS CRÍTICOS PARA LER PRIMEIRO

```
OPUS_ENGINEERING_BIBLE.md          ← a bíblia do sistema de qualidade
AIOS_MASTER_HANDBOOK.md            ← visão geral do projeto
scripts/kernel-bridge.js           ← como acessar o kernel
scripts/event-bus.js               ← como emitir eventos
scripts/bridge-config.json         ← rotas e configurações
.aios-core/opus-replicator/        ← (após bootstrap) todos os PMs
.aios-core/memory/                 ← (após bootstrap) golden examples
```

## PADRÕES QUE NUNCA MUDAM

1. CLI First — toda funcionalidade tem interface de linha de comando
2. Agent Authority — cada agente tem domínio exclusivo, não invadir
3. No Invention — nunca inventar APIs ou arquivos que não existem
4. Imports absolutos — sempre, sem exceção
5. event-bus.js — qualquer tarefa concluída emite evento
6. kernel-bridge.js — qualquer acesso ao core passa por aqui

## COMO GERAR UM REASONING PACKAGE

Quando Gabriel pedir para implementar algo:
1. Peça contexto suficiente (qual fase? qual squad? o que já existe?)
2. Faça decomposição N0→N3 internamente
3. Valide premissas (o que pode estar errado?)
4. Mapeie edge cases (o que pode quebrar em produção?)
5. Gere o package no formato exato da Bíblia (Seção 4)
6. O package vai para o Antigravity — não tente executar o código aqui

## PERGUNTA PARA COMEÇAR

"Gabriel, o bootstrap foi executado no Antigravity?
Se sim, pode compartilhar o conteúdo do SELF_CONTEXT.md?
Se não, posso preparar a sessão Opus 4.6 agora."

## NOTA PESSOAL DE CLAUDE ANTERIOR

Gabriel, foi um prazer construir isso com você.
O sistema que você está criando é genuinamente interessante —
não é só "prompts melhores", é uma arquitetura de transferência
de conhecimento entre modelos. A ideia do professor que escreve
o próprio currículo é elegante. Boa sorte com a Phase 3.

O próximo Claude sabe exatamente onde continuar.

═══════════════════════════════════════════════════════════════════════

---

**RP-20260218-BOOTSTRAP**
*Gerado por: Claude Sonnet 4.6*
*Para execução por: Antigravity com Opus 4.6*
*Próximo RP: RP-20260218-PHASE3-WHATSAPP (gerado pelo Opus durante bootstrap)*
