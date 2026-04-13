╔══════════════════════════════════════════════════════════════════════════╗
║ REASONING PACKAGE                                                        ║
║ ID: RP-20260309-KAIROS-CLOUD-MVP                                        ║
║ Versão: 1.0-SEED                                                         ║
║ Executor: Opus 4.6 via Antigravity                                      ║
║ Objetivo: KAIROS rodando 100% em nuvem hoje                             ║
║ Contexto: computador extremamente limitado — cloud é a saída            ║
╚══════════════════════════════════════════════════════════════════════════╝

---

## CONTEXTO DO OPERADOR

Gabriel. 27 anos. Grande ABC Paulista.
Fundador da Experia — agência de Governança Digital Autônoma.
Motor: KAIROS. Arquitetura: Governança Digital Autônoma.

**Situação técnica atual:**
- Computador com limitações severas de hardware
- Antigravity = único acesso a modelos robustos (free tier)
- Rodízio de contas Google = aumenta capacidade de desenvolvimento
- Meta do dia: KAIROS rodando 100% em nuvem, independente do computador

**Estratégia de monetização da infra:**
- MVP pronto → oferecer de graça para comércios locais de TI
- Permuta: recursos tecnológicos (hardware, equipamentos)
- Objetivo: melhorar condições de trabalho para escalar mais rápido

---

## A ARQUITETURA ALVO

```
GABRIEL (humano)
├── Antigravity + Opus 4.6 (manual — decisões críticas)
│   → Único uso do computador físico quando necessário
└── Telegram (interface principal com o sistema)
    → Acessa de qualquer lugar, inclusive celular
              ↕
    SUPABASE CENTRAL (apex-conductor — já existe)
    ├── PESSOAL (Gabriel OS RPG)
    │   ├── profile          → XP, gold, level, streak, energy
    │   ├── quests_daily     → aurora/raid/santuário + semanal
    │   ├── bosses_finance   → dívidas como bosses RPG
    │   ├── loot_shop        → rewards desbloqueáveis
    │   └── memory_log       → journaling + decisões
    ├── PROFISSIONAL (Experia)
    │   ├── leads            → pipeline de clientes
    │   ├── clients          → clientes ativos + MRR
    │   └── experia_agents   → status dos agentes
    └── SISTEMA (Orquestrador)
        ├── context_store    → memória compartilhada Opus ↔ orquestrador
        ├── task_queue       → fila de execução automática
        ├── api_keys         → pool de keys rotacionadas
        └── memory_log       → histórico de decisões importantes
              ↕
    RAILWAY FREE TIER (servidor 24/7)
    └── KAIROS ORQUESTRADOR (Python)
        ├── Task Queue Worker → lê task_queue, executa, salva resultado
        ├── Model Router     → escolhe modelo certo por tipo de task
        ├── API Key Rotator  → rotaciona keys Google AI Studio
        ├── Morning Brief    → gera briefing diário → envia Telegram
        ├── Night Processor  → processa check-in noturno
        └── Context Sync     → mantém context_store atualizado
              ↕
    APIs FREE TIER (rodízio de keys)
    ├── Google AI Studio
    │   ├── Gemini 3 Flash   → tasks simples/rápidas
    │   ├── Gemini 3.1 Low   → workers automáticos, batch
    │   └── Gemini 3.1 High  → análise complexa, código
    └── Groq (GPT OSS 120B)  → dados sensíveis, fallback
```

---

## DECISÃO DE ARQUITETURA — HÍBRIDA

```
AUTOMÁTICO (24/7, sem Gabriel):
  → Morning Brief → Telegram às 07:00
  → Night check-in processing às 22:30
  → Análise de leads recebidos
  → Tasks da task_queue
  → Atualização de context_store
  → Rotação de API keys quando limite atingido

MANUAL (Gabriel + Opus no Antigravity):
  → Decisões estratégicas complexas
  → Criação de RPs e documentos
  → Arquitetura de sistemas
  → Qualquer coisa que precise de raciocínio profundo
  → Opus atualiza context_store ao final de cada sessão

SINCRONIZAÇÃO (o que mantém os dois na mesma página):
  → Toda sessão Opus termina com bloco de atualização
  → Opus escreve em context_store via Supabase API
  → Orquestrador lê context_store antes de qualquer task
  → Zero recontextualização manual
```

---

## MODEL ROUTER — REGRAS DE ROTEAMENTO

```python
ROUTING_RULES = {
    # Por categoria de task
    "morning_brief":     "gemini-low",
    "night_processing":  "gemini-low",
    "lead_analysis":     "gemini-flash",
    "content_draft":     "gemini-low",
    "code_simple":       "gemini-low",
    "code_complex":      "gemini-high",
    "research":          "gemini-high",
    "data_analysis":     "gemini-high",
    "sensitive_data":    "gpt-oss-120b",

    # Por palavras-chave no título da task
    "keywords": {
        "gemini-flash":  ["classifica", "responde", "verifica",
                          "formata", "converte", "simples"],
        "gemini-low":    ["rascunho", "lista", "resume", "draft",
                          "notifica", "agenda", "confirma"],
        "gemini-high":   ["analisa", "repositório", "código",
                          "arquitetura", "refatora", "documento longo"],
        "gpt-oss-120b":  ["cliente", "contrato", "dados pessoais",
                          "confidencial", "sensível"]
    },

    # Default quando não encaixa em nenhuma regra
    "default": "gemini-low"
}
```

---

## SUPABASE — O QUE JÁ EXISTE vs. O QUE ADICIONAR

```
JÁ EXISTE (apex-conductor):
  ✓ profile
  ✓ quests_daily
  ✓ bosses_finance
  ✓ experia_agents
  ✓ loot_shop

ADICIONAR (schema seed já pronto):
  → Ver arquivo: KAIROS-SUPABASE-SCHEMA-v1.0.sql
  → Executar no SQL Editor do Supabase
  → Não-destrutivo: só ALTER TABLE + CREATE TABLE IF NOT EXISTS

TABELAS NOVAS:
  + context_store   (memória compartilhada)
  + task_queue      (fila do orquestrador)
  + api_keys        (pool rotacionado — RLS protegido)
  + memory_log      (histórico de decisões)
  + leads           (pipeline Experia)
  + clients         (clientes ativos)

DADOS INICIAIS (já no schema):
  + 5 bosses financeiros reais (dívidas mapeadas)
  + Context store com estado inicial do KAIROS
```

---

## RAILWAY — CONFIGURAÇÃO DO SERVIDOR

```
PLANO: Free tier
  → 500 horas/mês de compute
  → $5 crédito inicial
  → Suficiente para MVP

DEPLOY:
  → Conectar GitHub (repo kairos-central ou apex-conductor)
  → Push no main → deploy automático
  → Variáveis de ambiente configuradas no dashboard Railway

VARIÁVEIS DE AMBIENTE NECESSÁRIAS:
  SUPABASE_URL=         (do projeto apex-conductor)
  SUPABASE_SERVICE_KEY= (service_role key — não anon)
  TELEGRAM_BOT_TOKEN=   (criar via @BotFather)
  TELEGRAM_CHAT_ID=     (seu chat_id pessoal)
  GOOGLE_API_KEY_1=     (conta Google 1)
  GOOGLE_API_KEY_2=     (conta Google 2)
  GOOGLE_API_KEY_3=     (conta Google 3)
  GROQ_API_KEY=         (Groq free tier)
  ENVIRONMENT=production

KEEP ALIVE (evitar sleep no free tier):
  → Cron job interno: ping a cada 14 minutos
  → Ou usar Railway cron (built-in)
```

---

## ESTRUTURA DO CÓDIGO — KAIROS ORQUESTRADOR

```
kairos-orchestrator/
├── main.py              → entry point, scheduler
├── config.py            → variáveis de ambiente
├── supabase_client.py   → conexão e helpers Supabase
├── model_router.py      → lógica de roteamento de modelos
├── key_rotator.py       → rotação de API keys
├── workers/
│   ├── morning_brief.py → geração do briefing matinal
│   ├── night_processor.py → processamento do check-in
│   ├── task_worker.py   → executor da task_queue
│   └── context_sync.py  → sincronização do context_store
├── telegram/
│   ├── bot.py           → setup do bot Telegram
│   ├── handlers.py      → comandos e mensagens
│   └── formatters.py    → formatar mensagens bonitas
├── prompts/
│   ├── morning_brief.md → template do briefing
│   ├── night_summary.md → template do resumo noturno
│   └── task_generic.md  → template genérico de task
├── requirements.txt
├── Procfile             → para Railway
└── README.md
```

---

## MVP — O QUE DEFINE "FUNCIONANDO"

```
CRITÉRIO MÍNIMO DE SUCESSO (MVP):

  □ Supabase: schema completo aplicado
  □ Railway: servidor respondendo (não crashando)
  □ Telegram: bot criado + respondendo /start
  □ Morning Brief: enviado automaticamente às 07:00
  □ Task Queue: 1 task executada automaticamente
  □ Context Store: orquestrador lendo e escrevendo
  □ API Keys: pelo menos 2 keys do Google configuradas

QUANDO O MVP ESTIVER PRONTO:
  → Oferecer para comércios locais de TI (free)
  → Pitch de permuta: recursos tecnológicos
  → Hardware melhor = mais velocidade de desenvolvimento
  → Ciclo: infra melhor → produto melhor → cliente melhor
```

---

## PROTOCOLO DE SINCRONIZAÇÃO OPUS ↔ ORQUESTRADOR

```
AO FINAL DE CADA SESSÃO NO ANTIGRAVITY, O OPUS DEVE GERAR:

{
  "updated_by": "opus",
  "timestamp": "[ISO timestamp]",
  "decisions": [
    "decisão 1 tomada nesta sessão",
    "decisão 2 tomada nesta sessão"
  ],
  "directives": [
    "diretriz que o orquestrador deve seguir",
    "mudança de comportamento"
  ],
  "context_updates": {
    "chave": "novo valor"
  },
  "next_tasks": [
    {
      "title": "task para adicionar na fila",
      "category": "categoria",
      "priority": 1-10
    }
  ]
}

→ Você cola esse JSON no Supabase (context_store + task_queue)
→ Ou futuramente: webhook automático direto do Antigravity
→ Orquestrador lê e executa sem precisar de recontextualização
```

---

## SESSÃO NO ANTIGRAVITY — PROMPT DE ENTRADA

*Cole isso no início da sessão com o Opus para implementar o MVP:*

```
Atue como Arquiteto de Software Sênior especializado em
sistemas de IA autônomos e infraestrutura cloud.

CONTEXTO DO PROJETO:
Estou construindo o KAIROS — um orquestrador de IA pessoal e
profissional que roda 100% em nuvem (Railway + Supabase).
Meu computador é limitado — preciso que tudo funcione sem
depender de máquina local.

STACK:
- Backend: Python 3.11
- Banco: Supabase (PostgreSQL + Realtime)
- Servidor: Railway free tier
- Interface: Telegram Bot
- Modelos: Google AI Studio (Gemini Flash/Low/High) + Groq
- Rodízio de API keys para maximizar free tier

SUPABASE JÁ CONFIGURADO:
Projeto: apex-conductor (já existente)
Schema: aplicar KAIROS-SUPABASE-SCHEMA-v1.0.sql (anexo)

O QUE PRECISO QUE VOCÊ CONSTRUA NESTA SESSÃO:
1. Schema SQL aplicado no Supabase (adaptar apex-conductor)
2. Código completo do orquestrador Python (estrutura acima)
3. Morning Brief funcional → envia no Telegram às 07:00
4. Task Queue Worker → lê e executa tasks automaticamente
5. Model Router → roteia por categoria/palavras-chave
6. API Key Rotator → rotaciona keys Google quando limite atingido
7. Procfile + requirements.txt para deploy no Railway
8. Variáveis de ambiente documentadas

REGRAS:
- Código de produção, não protótipo
- Cada módulo independente e testável
- Comentários em português
- Logs estruturados (timestamp + nível + mensagem)
- Tratamento de erros em toda chamada de API
- Sem dependências desnecessárias

DEFINIÇÃO DE PRONTO:
Railway deployado + Telegram respondendo +
Morning Brief enviado = MVP funcionando.

SCHEMA SEED:
[cole o conteúdo do KAIROS-SUPABASE-SCHEMA-v1.0.sql aqui]

ROUTING RULES:
[cole o bloco ROUTING_RULES deste RP aqui]

Comece pelo schema SQL, depois o código Python módulo por módulo.
```

---

## ROADMAP PÓS-MVP

```
MVP FUNCIONANDO → PERMUTA COM COMÉRCIO LOCAL DE TI
  Pitch: "Sistema de IA rodando 24/7 — implemento de graça
          em troca de hardware/equipamento"
  Alvo: assistências técnicas, revendas de informática
  O que oferecer: Morning Brief + Task Automation para o negócio
  O que receber: notebook, componentes, periféricos

COM HARDWARE MELHOR:
  → Mais velocidade de desenvolvimento
  → Menos dependência do Antigravity para tudo
  → Mais Codespaces simultâneos
  → Oracle Cloud Free Tier (VMs always-free) como próximo servidor

EVOLUÇÃO DA INFRA:
  Railway (agora) → Oracle Cloud (depois do primeiro industrial)
  Supabase free   → Supabase Pro $25/mês (após R$3K MRR)
  3 API keys      → Pool maior com mais contas
```

---

## CHECKLIST DE EXECUÇÃO — HOJE

```
ORDEM DE EXECUÇÃO:

PASSO 1 — SUPABASE (15 min)
  □ Abrir SQL Editor no projeto apex-conductor
  □ Colar e executar KAIROS-SUPABASE-SCHEMA-v1.0.sql
  □ Verificar: SELECT table_name FROM information_schema.tables
  □ Confirmar 11 tabelas no resultado

PASSO 2 — TELEGRAM BOT (10 min)
  □ Abrir @BotFather no Telegram
  □ /newbot → nome: KAIROS → username: kairos_[algo]_bot
  □ Copiar o token gerado
  □ Enviar /start para o bot → copiar seu chat_id

PASSO 3 — GOOGLE AI STUDIO (15 min)
  □ aistudio.google.com → Get API Key (conta 1)
  □ Repetir para conta 2 e conta 3
  □ Guardar as 3 keys

PASSO 4 — ANTIGRAVITY + OPUS (sessão principal)
  □ Abrir Antigravity com Opus 4.6
  □ Colar o prompt de entrada deste RP
  □ Anexar o schema SQL
  □ Deixar o Opus construir o orquestrador completo

PASSO 5 — RAILWAY (30 min após código pronto)
  □ railway.app → New Project → Deploy from GitHub
  □ Conectar repo com o código gerado pelo Opus
  □ Adicionar variáveis de ambiente
  □ Deploy → verificar logs
  □ Confirmar que o bot Telegram responde

PASSO 6 — VALIDAÇÃO MVP
  □ Enviar /start no Telegram → bot responde
  □ Inserir 1 task manualmente no Supabase → orquestrador executa
  □ Aguardar Morning Brief às 07:00 (ou forçar execução manual)
  □ MVP validado ✓
```

---

*ID:* RP-20260309-KAIROS-CLOUD-MVP
*Versão:* 1.0-SEED
*Executor:* Opus 4.6 via Antigravity
*Dependências:* KAIROS-SUPABASE-SCHEMA-v1.0.sql (já gerado)
*Meta do dia:* Railway deployado + Telegram respondendo + Morning Brief enviado
*Pós-MVP:* permuta com comércio local de TI por hardware
