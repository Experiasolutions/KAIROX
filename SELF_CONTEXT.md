# KAIROS — SELF CONTEXT (Consciência Viva)

> **Última atualização:** 2026-03-12T09:42:00-03:00
> **Atualizado por:** KAIROS (Antigravity Session)
> **Sessão anterior:** 610f20b3-f553-49dc-921c-809bec274b3b

---

## Identidade

- **Sistema:** KAIROS OS v3.0
- **Operador:** Gabriel Ferreira — Arquiteto-Comunicador, Voice of the Dragonborn
- **Empresa:** Experia Solutions (IA para negócios locais)
- **Base:** Repositório `C:\Users\Gabriel\Documents\My KAIROS`
- **Core Engine:** AIOX v5.0.0 (fork do Bmad/SynkraAI — open source)
- **GitHub:** [Experiasolutions/kairos-orchestrator](https://github.com/Experiasolutions/kairos-orchestrator)

## Estado do Sistema

### KAIROS SKY (Orquestrador Cloud)
- **Localização:** `kairos-orchestrator/` (12 arquivos Python)
- **Status:** Código completo, **NÃO DEPLOYADO ainda**
- **Repo GitHub:** ✅ Pushado e atualizado (4 commits)
- **Supabase:** URL + service_role key configurados no `.env`
- **SQL Schema:** ✅ Pronto em `kairos-supabase-schema.sql` (12 tabelas + seed data + knowledge_brain)
- **Schema aplicado no Supabase?** ❌ PENDENTE — Gabriel precisa rodar o SQL no dashboard
- **Pip install:** ❌ Tentou, mas travou no Celeron (Python 3.14.2 disponível)
- **Deploy Railway:** ❌ PENDENTE
- **API Keys Google:** 4 keys confirmadas pelo Gabriel (precisa configurar no `.env`)
- **Telegram Bot Token:** Existente no `.env` original

### Knowledge Brain (Memória Persistente)
- **Indexer:** `knowledge_indexer.py` — atualizado com 8 categorias, captura `.codex/`, `.aios-core/`, `tools/`, `packages/`, `bin/`
- **Exclusões:** `archive/`, `node_modules/`, `.git/`, `logs/`
- **Integração /ask:** ✅ `call_model()` injeta contexto do Knowledge Brain antes de cada resposta de IA
- **Tabela Supabase:** `knowledge_brain` com full-text search em português
- **Status indexação:** ❌ PENDENTE (precisa do schema aplicado + pip install)

### Hortifruti (Cliente #1 — Permuta)
- **Dona:** Elaine (Unidade 1) + Douglas (Unidade 2)
- **Persona IA:** Safra 🥬 (assistente + sócia digital)
- **Squad:** 4 agentes (safra-master, atendente, estoquista, social-media)
- **Flows:** 4 fluxos completos (atendimento, entregas, estoque, promoção)
- **Estoque DB:** 17 produtos com preços em `data/estoque.json`
- **Config:** `config/hortifruti.json` com persona, keywords, test messages
- **Onboarding Elaine:** `docs/onboarding-elaine.md` ✅
- **MVP Kit Apresentação:** `docs/MVP-APRESENTACAO-KIT.md` ✅
- **Intake Rápido:** `docs/INTAKE-RAPIDO-VISITA.md` ✅
- **Template Universal:** `docs/TEMPLATE-CONFIG-UNIVERSAL.json` ✅
- **Guia WhatsApp Bot:** `docs/GUIA-WHATSAPP-BOT-SETUP.md` ✅ (3 caminhos: Botpress/Evolution/KAIROS)
- **Fotos geradas por IA:** `C:\Users\Gabriel\Documents\Elaine client\` (fora do repo)
- **WhatsApp Bot ativo?** ❌ PENDENTE — gap de conhecimento sendo fechado
- **Status permuta:** Acordo verbal feito, falta configurar bot e começar entregas

### Credenciais Configuradas (`.env`)
- `SUPABASE_URL=https://ptpojwbdxgmvykwwzatl.supabase.co` ✅
- `SUPABASE_SERVICE_ROLE_KEY=eyJ...79aA` ✅
- `TELEGRAM_BOT_TOKEN=` ✅ (existente)
- `TELEGRAM_ALLOWED_USER_ID=` ✅ (existente)
- `GEMINI_API_KEY=` ✅ (existente, Gabriel tem 4 mais)
- `GROQ_API_KEY=` ✅ (existente)
- `GOOGLE_API_KEYS=` ❌ PRECISA DAS 4 NOVAS

## Arquitetura do Sistema

```
KAIROS OS (Local)
├── .aios-core/          ← Motor AIOX (NÃO mexer em archive/)
├── .codex/              ← Skills e agents ocultos (12 agentes + 12 skills)
├── reasoning-packages/  ← 12+ RPs estratégicos e core
├── docs/                ← ~140 documentos (bibles, manifestos, guias)
├── scripts/             ← 23 scripts (boot, jarvis, bridges, night-shift)
├── squads/              ← Experia(9), Sales(4), C-Level(4), Claude Mastery
├── clients/             ← Hortifruti, Experia, Master Pumps
├── packages/            ← AIOX packages (cli, extensions, updater)
├── bin/                 ← AIOX executáveis (aiox.js, aiox-init.js)
├── tools/               ← OpenClaw, Superpowers, integrations
├── kairos-orchestrator/ ← KAIROS SKY (Python, deploy Railway)
└── .env                 ← Credenciais centrais
```

## Decisões Tomadas (Log)

| Data       | Decisão                                                         |
| :--------- | :-------------------------------------------------------------- |
| 2026-03-10 | Criado KAIROS SKY (Python) com 12 módulos para cloud            |
| 2026-03-10 | Schema Supabase com 12 tabelas + Knowledge Brain                |
| 2026-03-10 | Knowledge Indexer captura 360+ arquivos em 8 categorias         |
| 2026-03-10 | Integração `/ask` com brain context injection                   |
| 2026-03-11 | Supabase keys configuradas no .env                              |
| 2026-03-11 | MVP Kit Hortifruti completo (apresentação + intake + templates) |
| 2026-03-11 | Guia WhatsApp Bot criado (3 caminhos)                           |
| 2026-03-12 | Gabriel tem 4 Gemini API keys prontas                           |
