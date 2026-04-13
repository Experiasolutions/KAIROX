╔══════════════════════════════════════════════════════════════════╗
║                    REASONING PACKAGE                            ║
║  ID: RP-20260218-PHASE3-WHATSAPP                                ║
║  Mode: PM2-EXECUTION                                            ║
║  Priority: HIGH — Revenue path. First real $ transaction.       ║
║  Depends on: RP-20260218-BOOTSTRAP (complete ✅)                ║
║  Estimated execution: 1-2 sessões                               ║
╚══════════════════════════════════════════════════════════════════╝

---

# 🎯 CONTEXT BLOCK

## O que é este pacote

Este é o pacote de **Phase 3: WhatsApp Webhook Revenue Bridge** —
a ponte entre o AIOS Engine e receita real via WhatsApp.

O objetivo é transformar o `whatsapp-server.js` existente (v1, 113 linhas)
em um sistema de produção completo com:
1. Session Store (estado de conversa com TTL 24h)
2. Intent Classifier (7 intents principais)
3. Response Builder (template engine para respostas estruturadas)
4. Auto-reply via Evolution API (fechar o loop: receber → processar → responder)

## Estado atual

```
whatsapp-server.js    ✅ EXISTE  (v1, 113 linhas — webhook receptor funcional)
session-store.js      ❌ NÃO EXISTE
intent-classifier.js  ❌ NÃO EXISTE
response-builder.js   ❌ NÃO EXISTE
Evolution API         ✅ Configurada (webhook URL definida no painel)
```

## Quem executará isto

**Antigravity com Gemini/Opus** — usando o Opus Engineering System
bootstrapped em RP-20260218-BOOTSTRAP. O input-refiner.js v2 já detecta
mode PM2 para tarefas de implementação e injeta golden examples e
constitutional layer automaticamente.

## Squad/Agent: experia/a
## Arquivos a CRIAR:
- `scripts/session-store.js` ← estado de conversa, TTL 24h, chave = phone
- `scripts/intent-classifier.js` ← 7 intents com confidence scoring
- `scripts/response-builder.js` ← template engine para respostas WhatsApp

## Arquivos a MODIFICAR:
- `scripts/whatsapp-server.js` ← v1 → v2 (integrar session store, classifier, auto-reply)

## Arquivos a LER (para contextualização):
- `.aios-core/opus-replicator/SELF_CONTEXT.md` ← boot context
- `scripts/kernel-bridge.js` ← bridge pattern reference
- `scripts/event-bus.js` ← event emission pattern
- `scripts/tools-bridge.js` ← tools discovery (skill search)
- `squads/experia/squad.yaml` ← squad manifest
- `squads/experia/agents/experia-master.md` ← agent definition

## Dependências: express, body-parser (já instalados)
## Bloqueadores: Nenhum. WhatsApp Evolution API já configurada.

---

# 🧠 ARCHITECTURE DECISION

## O Problema

`whatsapp-server.js` v1 recebe mensagens e salva em contexto JSON,
mas não faz nada com elas — não classifica, não mantém estado de
conversa, não responde automaticamente. O loop está aberto.

## A Solução: 4-Layer Message Pipeline

```
WhatsApp → webhook → session-store → intent-classifier → response-builder → reply
                     (manter estado)  (classificar intent)  (gerar resposta)
```

Cada camada é um módulo independente, testável isoladamente,
seguindo o padrão kernel-bridge (graceful degradation, event emission).

## Trade-offs aceitos

- **JSON Storage vs Database:** Usaremos JSON Storage para sessions
  (arquivo em `.aios-core/data/sessions/`). Simples para MVP.
  Migrar para SQLite/Redis quando volume > 100 sessões ativas.

- **Rule-Based vs ML Intent Classification:** Rule-based com regex
  por enquanto. Funciona para 7 intents definidos. ML quando volume
  justificar o custo de treinamento.

- **Resposta síncrona vs assíncrona:** Síncrona no MVP. Webhook
  responde com 200 imediatamente, processa em background,
  envia reply via Evolution API HTTP POST.

---

# 📋 EXECUTION PLAN

## ETAPA 1: SESSION STORE (`scripts/session-store.js`)

**Propósito:** Manter estado de conversas WhatsApp com TTL 24h.

```javascript
/**
 * @module session-store
 * @version 1.0.0
 * @purpose Conversation state management for WhatsApp sessions.
 *          Key = phone number, TTL = 24h, auto-cleanup via interval.
 * @inputs  { phoneNumber, message, intent, metadata }
 * @outputs { session object with history + state }
 * @emits   session:created, session:updated, session:expired
 * @dependencies event-bus.js
 */

// Spec:
// - createOrUpdate(phoneNumber, message, metadata) → session
// - get(phoneNumber) → session | null
// - expire(phoneNumber) → void
// - getActive() → session[]
// - cleanup() → { expired: number }
// - TTL: 24 hours (configurable via SESSION_TTL env var)
// - Auto-cleanup interval: every 10 minutes
// - Storage: .aios-core/data/sessions/{phone}.json
// - Session schema:
//   {
//     phone: string,
//     name: string,
//     created: ISO,
//     lastActivity: ISO,
//     ttl: 86400000,
//     state: 'active' | 'waiting_response' | 'completed',
//     intents: [{ intent, confidence, timestamp }],
//     messages: [{ role: 'user'|'bot', text, timestamp }],
//     metadata: {}
//   }
// - Edge case: concurrent writes → use atomic write pattern (see harvest-gold.js)
// - Edge case: disk full → graceful degradation (log, continue in-memory)
```

---

## ETAPA 2: INTENT CLASSIFIER (`scripts/intent-classifier.js`)

**Propósito:** Classificar mensagens WhatsApp em 7 intents.

```javascript
/**
 * @module intent-classifier
 * @version 1.0.0
 * @purpose Classify incoming WhatsApp messages into 7 intents with
 *          confidence scoring. Rule-based MVP (regex + keyword matching).
 * @inputs  { text: string, session?: SessionObject }
 * @outputs { intent: string, confidence: number, entities: object }
 * @emits   intent:classified
 * @dependencies None (pure function, zero deps)
 */

// 7 Intents:
//
// 1. GREETING        - "oi", "bom dia", "olá", "e aí"
//    confidence: high if first message in session, medium otherwise
//
// 2. SCHEDULING      - "agendar", "marcar consulta", "horário disponível",
//                       "quero agendar", "tem vaga", "próximo horário"
//    entities: { date?, time?, specialty? }
//
// 3. CANCELLATION    - "cancelar", "desmarcar", "não vou poder ir",
//                       "remarcar" → can mean reschedule
//    entities: { date?, appointmentId? }
//
// 4. MEDICAL_QUESTION - "dor", "sintoma", "remédio", "tratamento",
//                        "quando tomar", "quanto custa o procedimento"
//    entities: { symptom?, medication? }
//
// 5. COMPLAINT       - "reclam", "insatisf", "demor", "péssimo",
//                       "falta de respeito", "nunca mais"
//    entities: { severity: 'low'|'medium'|'high' }
//
// 6. PRICE_INQUIRY   - "quanto custa", "valor", "preço", "tabela",
//                       "plano de saúde", "convênio", "aceita"
//    entities: { procedure?, insurance? }
//
// 7. OTHER           - fallback when no intent matches confidence > 0.3
//    → route to human handoff or generic response
//
// Spec:
// - classify(text, session?) → { intent, confidence, entities, alternatives[] }
// - confidence range: 0.0 to 1.0
// - If top intent confidence < 0.3: return OTHER
// - If top two intents within 0.1 of each other: return both as alternatives
// - Session context boost: if session has previous SCHEDULING intent,
//   new messages get +0.2 boost for SCHEDULING (continuity assumption)
// - CLI: node scripts/intent-classifier.js "quero agendar uma consulta"
//   → { intent: 'SCHEDULING', confidence: 0.95, entities: {} }
```

---

## ETAPA 3: RESPONSE BUILDER (`scripts/response-builder.js`)

**Propósito:** Gerar respostas WhatsApp estruturadas por intent.

```javascript
/**
 * @module response-builder
 * @version 1.0.0
 * @purpose Generate WhatsApp-formatted responses based on classified intent.
 *          Uses template system with variable interpolation.
 * @inputs  { intent, entities, session, clinicConfig }
 * @outputs { text: string, buttons?: object[], quickReplies?: string[] }
 * @emits   response:generated
 * @dependencies session-store.js (for context), clinic config
 */

// Response templates per intent:
//
// GREETING:
//   "Olá, {name}! 👋 Sou a assistente virtual da {clinicName}.
//    Como posso te ajudar hoje?
//    📅 Agendar consulta
//    ❓ Tirar dúvidas
//    💰 Valores e convênios"
//
// SCHEDULING:
//   "Ótimo! Vou te ajudar a agendar. 📅
//    Qual especialidade você precisa?
//    {specialties list from clinic config}"
//
// CANCELLATION:
//   "Entendi, {name}. Vou verificar sua consulta.
//    Pode me informar a data da consulta que deseja cancelar?"
//
// MEDICAL_QUESTION:
//   "Entendo sua preocupação. 🏥
//    Para questões médicas, recomendo agendar uma consulta.
//    Quer que eu verifique horários disponíveis?
//    ⚠️ Em caso de emergência, dirija-se ao pronto-socorro."
//
// COMPLAINT:
//   "Lamento pelo ocorrido, {name}. Sua satisfação é muito
//    importante para nós. Vou registrar sua reclamação e nossa
//    equipe de atendimento vai entrar em contato em até 24h.
//    Pode me contar mais detalhes?"
//
// PRICE_INQUIRY:
//   "Claro! Nossos valores variam por procedimento.
//    {if insurance: 'Trabalhamos com os seguintes convênios: ...'}
//    {if no insurance: 'Para consultas particulares: ...'}
//    Quer agendar uma avaliação?"
//
// OTHER:
//   "Hmm, não tenho certeza se entendi. 🤔
//    Posso te ajudar com:
//    📅 Agendamento
//    ❓ Informações
//    💰 Valores
//    Ou prefere falar com um atendente humano?"
//
// Spec:
// - build(intent, entities, session, config) → { text, quickReplies?, buttons? }
// - Config loaded from: squads/experia/config/ or .aios-core/data/clinic-config.json
// - Graceful degradation: if no config, use generic templates
// - WhatsApp formatting: bold (*text*), italic (_text_), emoji, line breaks
// - Max message length: 4096 chars (WhatsApp limit)
// - CLI: node scripts/response-builder.js --intent GREETING --name "Maria"
```

---

## ETAPA 4: UPGRADE WHATSAPP SERVER v2

**Arquivo:** `scripts/whatsapp-server.js` (v1 → v2)

```javascript
/**
 * @module whatsapp-server
 * @version 2.0.0
 * @purpose Complete WhatsApp Revenue Bridge — receives, classifies,
 *          responds, and tracks conversations end-to-end.
 * @inputs  Webhook POST /webhook/whatsapp (Evolution API format)
 * @outputs Auto-reply via Evolution API, session state update
 * @emits   whatsapp:message:received, whatsapp:reply:sent
 * @dependencies session-store, intent-classifier, response-builder,
 *               event-bus, kernel-bridge
 */

// Changes from v1 → v2:
//
// 1. IMPORT session-store, intent-classifier, response-builder
//
// 2. NEW: Message processing pipeline
//    webhook → validate → store session → classify intent → build response → reply
//
// 3. NEW: POST /webhook/whatsapp handler rewrite
//    - Call sessionStore.createOrUpdate(phone, text, metadata)
//    - Call intentClassifier.classify(text, session)
//    - Call responseBuilder.build(intent, entities, session, config)
//    - Call sendWhatsAppReply(phone, response.text) via Evolution API
//
// 4. NEW: sendWhatsAppReply(phone, text) function
//    - POST to Evolution API: https://api.evolution.ai/message/sendText/{instance}
//    - Headers: apikey from .env (EVOLUTION_API_KEY)
//    - Body: { number: phone, textMessage: { text } }
//    - Retry: 1 retry on failure, with 2s delay
//
// 5. NEW: Health endpoint GET /health
//    - Returns: { status, activeSessions, uptime, lastMessage }
//    - Calls kernel-bridge.getSystemHealth() for full system status
//
// 6. NEW: Dashboard endpoint GET /dashboard
//    - Returns: { sessions, intentDistribution, responseRate, avgResponseTime }
//
// 7. KEEP: Express.js, body-parser, PORT from .env
// 8. KEEP: Context file writing (backwards compatibility)
// 9. ADD: event-bus emission on every stage
// 10. ADD: Error handling per-stage (session fail ≠ total fail)
```

---

## ETAPA 5: INTEGRATION TESTING

Após implementar os 4 arquivos:

```bash
# 1. Test session-store standalone
node scripts/session-store.js test

# 2. Test intent-classifier standalone (all 7 intents)
node scripts/intent-classifier.js "oi, bom dia"
node scripts/intent-classifier.js "quero agendar uma consulta"
node scripts/intent-classifier.js "quero cancelar minha consulta"
node scripts/intent-classifier.js "estou com dor de cabeça"
node scripts/intent-classifier.js "quanto custa uma consulta?"
node scripts/intent-classifier.js "péssimo atendimento"
node scripts/intent-classifier.js "alskdjflaskjdf"

# 3. Test response-builder standalone
node scripts/response-builder.js --intent GREETING --name "Maria"
node scripts/response-builder.js --intent SCHEDULING

# 4. Start server and test webhook
node scripts/whatsapp-server.js
# In another terminal:
curl -X POST http://localhost:3005/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"data":{"key":{"remoteJid":"5511999887766@s.whatsapp.net"},"pushName":"Maria","message":{"conversation":"oi, quero agendar"}}}'

# 5. Verify: session created, intent classified, response built (no reply sent without API key)

# 6. Run PM3 quality gate on each new script
node scripts/self-correction.js scripts/session-store.js --dry-run
node scripts/self-correction.js scripts/intent-classifier.js --dry-run
node scripts/self-correction.js scripts/response-builder.js --dry-run
node scripts/self-correction.js scripts/whatsapp-server.js --dry-run
```

---

## ETAPA 6: ENVIRONMENT SETUP

```bash
# Required .env variables (add to existing .env):
EVOLUTION_API_URL=https://api.evolution.ai    # Evolution API base URL
EVOLUTION_API_KEY=your-api-key-here           # Your Evolution API key
EVOLUTION_INSTANCE=your-instance-name         # WhatsApp instance name
SESSION_TTL=86400000                          # 24h in ms (optional, default)
WHATSAPP_PORT=3005                            # Server port (optional, default)
```

---

# ⚠️ EDGE CASES

## EC-01: Mensagem sem texto (imagem, áudio, documento)
- Scenario: Paciente envia foto de exame ou áudio
- Impact: `text` é null, pipeline quebra
- Solution: Detectar tipo de mídia, retornar resposta template:
  "Recebi sua {mídia}! No momento só consigo ler mensagens de texto.
   Pode descrever o que precisa?"

## EC-02: Rate limiting pelo WhatsApp
- Scenario: Bot responde muito rápido, WhatsApp bloqueia
- Impact: Respostas param de ser entregues
- Solution: Rate limiter no sendWhatsAppReply (max 1 msg/s por número).
  Queue de respostas com delay aleatório 1-3s.

## EC-03: Sessão expira no meio de agendamento
- Scenario: Paciente começa agendamento, volta 25h depois
- Impact: Contexto perdido, recomeça do zero
- Solution: No cleanup, salvar state parcial. Na reativação,
  oferecer: "Você estava agendando uma consulta. Quer continuar?"

## EC-04: Intent ambíguo
- Scenario: "quanto custa pra cancelar?" (PRICE + CANCELLATION)
- Impact: Resposta errada
- Solution: Se confidence < 0.5 ou two intents within 0.1:
  retornar clarification: "Você quer saber o valor ou cancelar?"

## EC-05: Evolution API fora do ar
- Scenario: API retorna 500 ou timeout
- Impact: Mensagem processada mas resposta não entregue
- Solution: Retry 1x com 2s delay. Se falha: salvar reply pendente
  em `.aios-core/data/pending-replies/`. Cron retenta a cada 5 min.

## EC-06: Números de teste vs produção
- Scenario: Dev testa com próprio número, polui sessões
- Impact: Dashboard mostra métricas falsas
- Solution: Whitelist de números de teste em .env (TEST_PHONES).
  Sessões de teste marcadas com `isTest: true`.

---

# ✅ QUALITY GATE

- [ ] session-store.js: CRUD funcional + TTL + cleanup + event emission
- [ ] intent-classifier.js: 7 intents com confidence > 0.7 para exemplos óbvios
- [ ] response-builder.js: templates para todos os 7 intents + graceful degradation
- [ ] whatsapp-server.js v2: pipeline completo webhook → classify → respond
- [ ] Todos os scripts: PM3 score ≥ 8.5/10
- [ ] Todos os scripts: emitem via event-bus.js
- [ ] Todos os scripts: CLI standalone funcional
- [ ] Curl test: webhook → 200 + session created + intent classified
- [ ] Nenhum placeholder, TODO, ou mock em produção
- [ ] .env documentado com variáveis necessárias
- [ ] SELF_CONTEXT.md atualizado com Phase 3 status

---

# 🚫 O QUE NÃO FAZER

- NÃO instalar dependências novas (express e body-parser já existem)
- NÃO usar banco de dados (JSON Storage é suficiente para MVP)
- NÃO implementar ML/NLP para classifier (regex é suficiente agora)
- NÃO enviar reply real sem EVOLUTION_API_KEY configurada
- NÃO alterar whatsapp-server.js v1 antes de ter os 3 módulos prontos
- NÃO inventar APIs que não existem na Evolution API (verificar docs)

---

**RP-20260218-PHASE3-WHATSAPP**
*Gerado por: Antigravity com Opus*
*Gerado durante: Bootstrap RP-20260218 (Etapa 10)*
*Para execução por: Antigravity com Gemini/Opus*
*Próximo RP: RP-YYYYMMDD-PHASE3-EVOLUTION-INTEGRATION (apenas após testes locais aprovados)*
