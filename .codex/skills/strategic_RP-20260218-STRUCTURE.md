@aios-master

╔══════════════════════════════════════════════════════════════════╗
║  REASONING PACKAGE                                              ║
║  ID: RP-20260218-STRUCTURE                                      ║
║  Mode: PM2-EXECUTION                                            ║
║  Priority: HIGH                                                 ║
║  Estimativa: 1 sessão                                          ║
╚══════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 CONTEXT BLOCK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Objetivo: padronizar a estrutura de pastas e documentação do AIOS
para que o sistema seja funcional, apresentável e onboardável —
por humanos e por agentes em novas sessões.

AIOS Phase: transversal (pré-Phase 3)
Squad/Agent: .aios-core (kernel) + raiz do projeto

Arquivos a CRIAR:
  - `README.md`                              ← entrada universal
  - `reasoning-packages/INDEX.md`            ← registro de todos os RPs
  - `clients/experia/README.md`              ← client package da Experia
  - `clients/experia/ONBOARDING.md`          ← como trabalhar na Experia
  - `docs/ARCHITECTURE.md`                   ← diagrama vivo do sistema
  - `.aios-core/development/ROADMAP.md`      ← estado e próximos passos

Arquivos a MOVER:
  - `RP-20260218-BOOTSTRAP.md` → `reasoning-packages/`
  - Todos os RPs futuros      → `reasoning-packages/`
  - Squads e docs específicos
    da Experia                → `clients/experia/`

Arquivos a ATUALIZAR:
  - `AIOS_MASTER_HANDBOOK.md` → refletir nova estrutura
  - `.aios-core/development/tasks/` → sincronizar com ROADMAP.md

Dependências: nenhuma. Este RP é independente do bootstrap.
Pode ser executado antes ou depois.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 ARCHITECTURE DECISION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Estrutura alvo:

  /
  ├── README.md                     ← porta de entrada. Lido primeiro.
  ├── AIOS_MASTER_HANDBOOK.md       ← sistema vivo (v1.1)
  ├── OPUS_ENGINEERING_BIBLE.md     ← motor cognitivo v1 (imutável)
  ├── OPUS_ENGINEERING_BIBLE_v2.md  ← (criado pelo bootstrap)
  │
  ├── reasoning-packages/           ← NOVO: todos os RPs aqui
  │   ├── INDEX.md                  ← registro: ID, status, data, descrição
  │   ├── RP-20260218-BOOTSTRAP.md
  │   └── [futuros RPs]
  │
  ├── clients/                      ← NOVO: pacotes de cliente
  │   └── experia/                  ← WaaS para clínicas (projeto Gabriel)
  │       ├── README.md             ← o que é, como ativar
  │       ├── ONBOARDING.md         ← como trabalhar neste client package
  │       ├── squads/               ← squads específicos da Experia
  │       └── docs/                 ← docs específicos da Experia
  │
  ├── squads/                       ← squads universais do motor
  │   ├── mind-clones/              ← 67 clones (universais)
  │   └── [squads não-Experia]
  │
  ├── scripts/                      ← scripts do motor universal
  │   ├── kernel-bridge.js
  │   ├── event-bus.js
  │   ├── memory-system.js
  │   ├── rag-engine.js
  │   ├── mcp-server.js
  │   ├── dashboard.js
  │   └── input-refiner.js
  │
  ├── .aios-core/                   ← kernel interno
  │   ├── core/synapse/
  │   ├── schemas/
  │   ├── opus-replicator/          ← camada cognitiva (bootstrap)
  │   ├── memory/                   ← golden examples, anti-patterns
  │   └── development/
  │       ├── tasks/
  │       └── ROADMAP.md            ← NOVO: estado vivo do projeto
  │
  ├── tools/integrations/           ← ferramentas instaladas (dormentes)
  ├── docs/                         ← arquivo histórico + referência
  └── data/                         ← runtime (memory.json, etc.)

Decisões e por quê:

→ `reasoning-packages/` como pasta dedicada:
  RPs são artefatos de alto valor — ficarem soltos na raiz é
  insustentável. Esta pasta é o "histórico de decisões" do sistema.

→ `clients/` separado de `squads/`:
  Materializa a separação ENGINE vs CLIENT PACKAGE.
  Qualquer novo cliente (logística, jurídico, educação) ganha
  sua própria pasta em `clients/` sem tocar no motor.

→ `README.md` na raiz:
  Qualquer agente ou humano novo lê este arquivo primeiro.
  É o único arquivo que aponta para todos os outros.
  Sem ele, o onboarding depende de conhecimento prévio.

→ `ROADMAP.md` em `.aios-core/development/`:
  O backlog existe mas está fragmentado em `tasks/`.
  Um ROADMAP consolida: o que foi feito, o que está em
  progresso, o que vem a seguir — em formato legível por
  humanos e por agentes em boot.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 EXECUTION PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1 — VARREDURA (não escreva nada ainda)
  Ação: leia a estrutura atual completa do projeto
  Execute: `ls -la`, `find . -name "*.md" | head -50`,
           `find squads/ -maxdepth 2`
  Mapeie: quais squads são Experia vs universais
  Mapeie: quais docs em docs/ são Experia vs universais
  Mapeie: quais RPs existem soltos na raiz
  Output: lista mental das movimentações necessárias
  Teste: você consegue responder "o que é do motor vs da Experia?"

STEP 2 — CRIAR ESTRUTURA DE PASTAS
  Ação: criar as pastas que não existem
  Pastas: `reasoning-packages/`, `clients/`, `clients/experia/`,
          `clients/experia/squads/`, `clients/experia/docs/`
  Teste: `ls reasoning-packages/ clients/` retorna sem erro

STEP 3 — CRIAR README.md (raiz)
  Arquivo: `README.md`
  Conteúdo obrigatório:
    → O que é o AIOS (motor universal, 3 linhas)
    → Mapa de navegação (qual arquivo ler para qual objetivo)
    → Como fazer boot de uma nova sessão de agente
    → Como adicionar um novo client package
    → Links para: Handbook, Bíblia, SELF_CONTEXT, ROADMAP
  Critério: um humano sem contexto deve saber o que fazer
            em menos de 60 segundos de leitura

STEP 4 — CRIAR reasoning-packages/INDEX.md
  Arquivo: `reasoning-packages/INDEX.md`
  Formato de cada entrada:
    | ID | Data | Mode | Status | Descrição | Arquivo |
  Entradas iniciais:
    → RP-20260218-BOOTSTRAP (PM2, status: pending execution)
    → RP-20260218-STRUCTURE (PM2, status: in progress — este RP)
  Teste: o INDEX reflete todos os RPs presentes na pasta

STEP 5 — MOVER RPs PARA reasoning-packages/
  Ação: mover todos os arquivos RP-*.md da raiz para
        `reasoning-packages/`
  Atualizar INDEX.md com cada RP encontrado
  Teste: raiz não contém mais arquivos RP-*.md

STEP 6 — CRIAR clients/experia/
  Arquivos a criar:

  `clients/experia/README.md`
    → O que é a Experia (WaaS para clínicas, projeto Gabriel)
    → Stack específico (Evolution API, WhatsApp, calendar)
    → Como este client package usa o motor AIOS
    → Squads ativos na Experia
    → Próximas fases (Phase 3: WhatsApp webhook)

  `clients/experia/ONBOARDING.md`
    → Pré-requisitos (motor AIOS rodando)
    → Variáveis de ambiente necessárias
    → Como ativar os squads da Experia
    → Onde estão os RPs específicos da Experia

  Ação: identificar na varredura (Step 1) quais squads/docs
        são específicos da Experia e movê-los para
        `clients/experia/squads/` e `clients/experia/docs/`

STEP 7 — CRIAR docs/ARCHITECTURE.md
  Arquivo: `docs/ARCHITECTURE.md`
  Conteúdo:
    → Diagrama ASCII das 3 camadas do motor
    → Diagrama ENGINE vs CLIENT PACKAGE
    → Mapa de dependências entre scripts principais
    → Versões atuais de cada componente
  Este arquivo substitui o diagrama espalhado em vários docs

STEP 8 — CRIAR .aios-core/development/ROADMAP.md
  Arquivo: `.aios-core/development/ROADMAP.md`
  Estrutura:
    ## ✅ Concluído
    [o que já existe e funciona]

    ## 🔄 Em Progresso
    [bootstrap pendente de execução, este RP]

    ## 📋 Próximo (Phase 3 — Experia)
    [whatsapp-server.js, session-store.js, intent-classifier.js]

    ## 🔮 Futuro (Engine)
    [evolução do motor universal, novos client packages]

STEP 9 — ATUALIZAR AIOS_MASTER_HANDBOOK.md
  Seção a atualizar: "7. YOUR RIGHT NOW MAP"
  Adicionar: nova estrutura de pastas com 1 linha por pasta
  Adicionar: seção "CLIENT PACKAGES" explicando a separação
  Adicionar: referência ao README.md como ponto de entrada
  Não alterar nenhuma outra seção sem necessidade

STEP 10 — VALIDAÇÃO FINAL
  Execute a simulação de onboarding:
  "Um novo agente abre o projeto pela primeira vez.
   Lê README.md. Consegue responder em 90 segundos:
   o que é o motor, o que é a Experia, qual é o próximo passo?"
  Se sim: entregue
  Se não: identifique o gap e corrija antes de entregar

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ EDGE CASES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EC-01: Squad é misto (parte Experia, parte universal)
  Scenario: squad como experia-integrations contém lógica de
            Evolution API (Experia) e padrões de integração (motor)
  Solução: manter o squad inteiro em clients/experia/squads/
           documentar no README do squad: "padrão de integração
           reutilizável — ver docs/ARCHITECTURE.md para versão
           genérica"

EC-02: Links quebrados após movimentação
  Scenario: AIOS_MASTER_HANDBOOK.md referencia paths que mudaram
  Solução: após cada STEP de movimentação, grep por referências
           ao path antigo e atualize
  Comando: `grep -r "reasoning-packages\|clients/" *.md`

EC-03: Arquivo não se encaixa claramente em motor vs Experia
  Scenario: documento histórico que mistura os dois
  Solução: vai para `docs/` com nota no topo:
           "⚠️ Documento histórico — mistura contexto ENGINE
            e Experia. Leia com esse filtro."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ QUALITY GATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  □ README.md existe na raiz e permite onboarding em <60 segundos
  □ Todos os RPs estão em reasoning-packages/ com INDEX.md
  □ clients/experia/ existe com README.md e ONBOARDING.md
  □ Nenhum arquivo Experia-specific em squads/ universais
  □ ROADMAP.md existe e reflete estado atual real
  □ docs/ARCHITECTURE.md tem diagrama ENGINE vs CLIENT PACKAGE
  □ AIOS_MASTER_HANDBOOK.md reflete nova estrutura
  □ Nenhum link quebrado nos arquivos .md principais
  □ Teste de onboarding (Step 10) passa

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚫 O QUE NÃO FAZER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  → NÃO altere o conteúdo de OPUS_ENGINEERING_BIBLE.md
  → NÃO mova scripts/ — o motor precisa dos paths atuais
  → NÃO renomeie agentes existentes — quebra referências
  → NÃO crie documentação nova sobre funcionalidades que
    ainda não existem — só documente o que já funciona

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 GEMINI EXECUTION DIRECTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Você recebeu um plano de reorganização estrutural completo.
Cada step é sequencial — não paralelize, não pule.
O Step 1 (varredura) determina todas as movimentações reais.
Sem a varredura, os steps seguintes são cegos.

Entregue ao final:

  [STRUCTURE REPORT]
  Pastas criadas: [lista]
  Arquivos movidos: [origem → destino]
  Arquivos criados: [lista com paths]
  Links corrigidos: [lista]
  Resultado do teste de onboarding (Step 10): [passou/falhou + obs]
  Próximo passo recomendado: execute RP-20260218-BOOTSTRAP