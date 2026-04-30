# RP-20260429-MVP-AIOPS-SESSION-HANDOFF-v1.0

> **Tipo:** Session Handoff / Reasoning Package  
> **Data:** 2026-04-29T13:10:00-03:00  
> **Criado por:** NOESIS (KAIROS OS v3.1)  
> **Para:** Gabriel Ferreira — leitura no trem ou contextualização de nova LLM  
> **Propósito:** Retomar exatamente de onde paramos. Zero ambiguidade. Zero perda de contexto.

---

## 🧠 QUEM É GABRIEL (Operador)

- **Nome:** Gabriel Ferreira — Arquiteto-Comunicador, Voice of the Dragonborn
- **Stack:** KAIROS OS v3.1 (fork AIOX v5.0.0 by SynkraAI)
- **IDE principal:** Antigravity (Gemini/Claude via VS Code MCP)
- **Base:** `C:\Users\GABS\Documents\My KAIROS`
- **GitHub:** [Experiasolutions/aios-core](https://github.com/Experiasolutions/aios-core)
- **Hardware:** Celeron E3300 2.5GHz · 6GB RAM · GPU 2006 (zero viável para AI local)
- **Modelo de LLM:** God Pool (84 keys · Groq, Gemini, Together, SambaNova, OpenRouter, Cerebras)

---

## 🎯 DECISÃO ESTRATÉGICA DO DIA (NOVA — tomada hoje)

### O que mudou
**A abertura da agência Experia foi postergada indefinidamente.**

### Por quê
Gabriel não quer abrir agência sem autoridade comprovada. O mercado de "AI Agents" está saturado de promessas. A decisão é construir autoridade **fazendo**, não prometendo.

### A nova estratégia: AI OPS Solopreneur
```
FREE TRIAL 20 dias
     ↓
Case Studies com resultado real
     ↓
Freelas de IA (cliente paga pela mão de obra, não pela agência)
     ↓
Com experiência + autoridade → Abre agência para dominar Grande ABC (7 cidades)
```

### Meta de capacidade
**~10 cases simultâneos** com 1 operador humano (Gabriel) + squads de agentes digitais = output de uma equipe inteira.

---

## 📦 O QUE É O MVP

### Conceito central
"Equipes de Funcionários Digitais" para pequenos negócios locais. Não é diferenciado tecnicamente — a diferença é **escala e resultado**: Gabriel entrega sozinho o que antes exigia equipe.

### Estrutura do MVP
```
MVP AI OPS
├── SQUADS EXTERNOS (interface com os clientes do cliente)
│   └── experia-commerce squad (JÁ EXISTE)
│       Agentes: commerce-master, commerce-clone, commerce-analyst, commerce-worker, commerce-sales
│       Canais: WhatsApp, Telegram, Webchat
│
├── SQUADS INTERNOS (back-office digital do negócio)
│   ├── mvp-admin       → SOPs, organização, daily brief do dono
│   ├── mvp-analytics   → métricas, relatórios semanais, insights
│   └── mvp-media       → posts Instagram, stories, captions (via Gemini API)
│
├── VARIAÇÕES POR CASE (segmento-específico)
│   ├── case: leticia-esteticista  [URGENTE — apresentação hoje]
│   ├── case: paulo-tapeceiro      [URGENTE — apresentação hoje]
│   ├── case: hortifruti-elaine    [trial ativo]
│   └── case: template-generico   [base para novos]
│
└── DASHBOARD 360
    └── Hub visual: métricas + canais + agenda + alertas
        Tech: HTML/CSS/JS estático + Supabase backend
```

---

## 🔧 STACK TÉCNICA DO MVP

### Atendimento ao cliente (canal principal)
- **Evolution API** (HEAD 4 da HYDRA — ✅ ativo parcialmente)
- WhatsApp como canal primário para todos os cases iniciais

### Geração de Mídia / Conteúdo
- **Gemini API pool** (mesmo God Pool já configurado)
- Google AI Studio free tier em rotação de keys = zero custo extra
- Futuro: MANUS AI como camada adicional (a avaliar)
- Output: posts IG, stories, captions, sugestões de pauta

### Squads Internos — Arquitetura Híbrida
```
Fase ATUAL (N8N ainda não deployado):
  Prompt KAIROS (AIOX squad) → Evolution API diretamente

Fase FUTURA (quando N8N subir):
  Prompt KAIROS → N8N template → OpenClaw Skills → Evolution API
```
- Cada cliente = variável no template (altamente personalizável)
- Design: robusto, moderno, extremamente valioso

### Dashboard 360
- HTML/CSS/JS estático (sem deps, roda em qualquer browser)
- Supabase como backend (já configurado em todas as máquinas)
- Começa com Leticia e Paulo como casos piloto

---

## 👥 CASES ATIVOS (estado atual)

### 💅 Leticia — Esteticista Autônoma [APRESENTAÇÃO HOJE]
| Campo | Detalhe |
|---|---|
| Canal | WhatsApp **pessoal** (não Business) |
| Dor principal | Captação de **novos clientes** |
| Serviços | Estética corporal + facial (sem sobrancelhas/cílios) |
| Tom de voz | Informal, jovem, acessível |
| Horários | Alta flexibilidade — indefinido |
| Instagram | Pessoal + profissional **ativos** com conteúdo |
| Ticket médio | ❓ A confirmar |
| Serviços específicos | ❓ A confirmar (drenagem? modeladora? limpeza de pele?) |
| Portfólio antes/depois | ❓ A confirmar |

**Entrega MVP mínima:**
- Script WhatsApp para captação de novos clientes
- Bot de qualificação (que tipo de estética a pessoa quer?)
- Reativação de clientes sumidos
- Geração de posts IG (via Gemini API pool)
- Lembrete pós-atendimento

### 🧵 Paulo — Tapeceiro / Ateliê [APRESENTAÇÃO HOJE]
| Campo | Detalhe |
|---|---|
| Canal | WhatsApp (em transição para Business) + presencial |
| Dor principal | Triagem de pedidos, status de serviço, confirmação de entrega |
| Serviços | Tapeçaria: sofás, cadeiras, poltronas — **high ticket** |
| Público | Clientes premium (reformas de alto valor) |
| Instagram/Facebook | **Mortos** — não priorizar |
| Prazo médio | ❓ A confirmar |
| Fluxo de orçamento | ❓ A confirmar (foto pelo WA? visita presencial? cliente traz peça?) |
| Ticket médio | ❓ A confirmar |

**Entrega MVP mínima:**
- Script WhatsApp de triagem consultiva (receber pedido, qualificar, orçar)
- Acompanhamento de status do serviço ("sua poltrona está em produção")
- Confirmação de entrega/retirada
- **Sem geração de mídia por enquanto** (Instagram morto)

### 🥦 Hortifruti (Elaine) [TRIAL ATIVO]
- Bot WhatsApp ativo via Evolution API
- Próximo: calibrar persona + configurar Morning Report
- Ticket alvo: R$ 497–997/mês

### 🍺 Porto Alemão [MAPEADO]
- Reconectar QR Code + retomar atendimento

### 📱 Felix Cell [MAPEADO]
- Setup Onboarding + Bot Clone + Posts IG

---

## ❓ 4 PERGUNTAS ABERTAS (responder antes de executar FASE 0)

> **Estas são as únicas informações que faltam para criar os cases de Leticia e Paulo.**

### Q1 — Leticia: Serviços específicos
Quais tratamentos ela oferece?
- Drenagem linfática?
- Massagem modeladora?
- Limpeza de pele profunda?
- Radiofrequência?
- Ultrassom cavitacional?
- Outro?

*Impacta: pergunta de qualificação no script ("Qual tipo de estética você busca?") + temas de posts do IG*

### Q2 — Paulo: Fluxo de orçamento
Como ele orça hoje?
- Cliente manda foto pelo WA → Paulo responde o valor?
- Cliente precisa trazer a peça fisicamente para avaliar?
- Paulo vai até a casa do cliente?
- Qual o prazo médio de uma reforma? (dias? 1-2 semanas?)

*Impacta: fluxo completo do bot — quantas etapas, o que perguntar em cada uma*

### Q3 — Dashboard: quem acessa?
- **Só você** (operador) → visão de gestor para monitorar todos os 10 cases de longe?
- **O cliente** (Leticia/Paulo) → ele vê métricas do próprio negócio?
- **Ambos** → views separadas (operador vs. cliente)?

*Impacta: UX, complexidade, autenticação, o que mostrar em cada view*

### Q4 — N8N: ordem de prioridade
- HEAD 1 (N8N + Postgres) ainda não está deployado (falta RAILWAY_API_TOKEN)
- Para hoje: usar **Evolution API direta + prompts KAIROS** (sem N8N)
- Você quer subir o N8N antes de avançar nos cases?
- Ou aceita **prompt-first agora** e migra para N8N depois?

*Impacta: sequência de execução das fases*

---

## 🗺️ PLANO DE EXECUÇÃO — Fases

### FASE 0 — URGENTE (hoje, antes das apresentações)
**Objetivo:** Material pronto para apresentar a Leticia e Paulo.

```
Criar: clients/leticia/
  ├── config/leticia.json    → perfil do negócio
  ├── docs/brief.md          → contexto + dores
  └── scripts/               → scripts de atendimento

Criar: clients/paulo/
  ├── config/paulo.json
  ├── docs/brief.md
  └── scripts/

Criar: squads/experia-commerce/tasks/create-case-leticia.md
Criar: squads/experia-commerce/tasks/create-case-paulo.md

Atualizar: squads/experia-commerce/squad.yaml
  → Adicionar segmentos: estetica_autonoma, tapeceiro_atelie
```

**Bloqueado por:** Q1 e Q2 acima.

---

### FASE 1 — Squads Internos MVP (Semana 1)
**Objetivo:** 3 squads internos mínimos e funcionais.

```
Criar: squads/mvp-admin/
  squad.yaml + agentes: admin-master, admin-sop, admin-ops
  tasks: create-sop-interno, daily-brief-dono, weekly-report

Criar: squads/mvp-analytics/
  squad.yaml + agentes: analytics-master, analytics-report
  tasks: generate-weekly-report, generate-monthly-insights

Criar: squads/mvp-media/
  squad.yaml + agentes: media-master, media-content, media-visual
  tasks: generate-post, generate-story, generate-caption
  Integração: Gemini API pool (God Pool)
```

---

### FASE 2 — Dashboard 360 (Semana 1–2)
**Objetivo:** Hub visual para controle do negócio.

```
Componentes mínimos:
  📊 Métricas de atendimento (WhatsApp)
  📅 Agenda do dia / semana
  📝 SOPs ativos
  🔔 Follow-ups pendentes
  📱 Status dos canais

Tech: HTML/CSS/JS estático + Supabase (já configurado)
Bloqueado por: Q3 (quem acessa?)
```

---

### FASE 3 — Padronização e Testes (Semana 2)

```
Criar: .aiox-core/development/tasks/test-mvp-squad.md
  → Checklist: 5 cenários obrigatórios (interesse, preço, sumiço, reclamação, urgência)

Criar: .aiox-core/development/tasks/onboard-new-case.md
  → Processo: diagnóstico → brief → config → teste → go-live → acompanhamento

Criar: docs/mvp/MVP-PLAYBOOK.md
  → Guia completo do processo AI OPS solopreneur
```

---

### FASE 4 — Aquisição (Semana 2–3)

```
Criar: squads/experia-commerce/tasks/acquisition-script.md
  → Script de abordagem: WhatsApp direto, indicação, presencial

Criar: docs/mvp/ONBOARDING-PROCESS.md
  → Mapa: prospecção → pitch → trial → entrega → renovação
```

---

## 🏗️ INFRAESTRUTURA — Estado Atual

### ✅ Operacional
| Sistema | Status | Detalhe |
|---|---|---|
| MCP Server | ✅ 28 tools | aiox-kairos (28/28 testes) |
| Evolution API | ✅ Ativo | Instância hortifruti-elaine: open |
| God Pool | ✅ 84 keys | 6 provedores: Groq, Gemini, Together, SambaNova, OpenRouter, Cerebras |
| Supabase | ✅ Configurado | URL + SERVICE_KEY ativos |
| SKY Python Backend | ✅ Railway | HEAD 3 ativo |
| Engine Triage v4 | ✅ EMBEDDED | /boot FASE 5.7 + /context Passo 4.6 |

### ⏳ Pendente
| Sistema | Bloqueio | Impacto |
|---|---|---|
| N8N + Postgres (HEAD 1) | RAILWAY_API_TOKEN pendente | Templates de automação |
| OpenClaw Server (HEAD 2) | Deploy pendente | 15 Railway Skills |
| Evolution API (HEAD 4) | Parcial | Porto Alemão sem QR code |

### 🗑️ Eliminado hoje
- `/triage.md` workflow → **deletado permanentemente**
- Engine Triage v4 agora é nativa em `/boot`, `/context`, `/KAIROS` — nunca acionar manualmente

---

## 🧬 SQUADS EXISTENTES (mapa completo)

```
squads/
├── experia-commerce/     ← CORE do MVP (5 agentes, 6 tasks)
│   agents: commerce-master, commerce-clone, commerce-analyst, commerce-worker, commerce-sales
│   tasks: onboard, diagnose, whatsapp-script, morning-report, sop, free-trial-pitch
│
├── experia/              ← Squad interno base (9 agentes)
│   agents: architect, automations, copy, data, integrations, marketing, master, security, validator
│
├── sales/                ← BDR, LNS, SDS, Sales Lead
├── c-level/              ← CFO, CMO, COO, CRO
├── brand/                ← Identidade visual e branding
├── seo/                  ← SEO e conteúdo orgânico
├── kaizen-v2/            ← Melhoria contínua
├── deep-research/        ← Pesquisa profunda
└── [12 outros da SynkraAI]
```

### A criar (MVP):
- `squads/mvp-admin/` → administração interna do cliente
- `squads/mvp-analytics/` → métricas e relatórios
- `squads/mvp-media/` → conteúdo digital + Gemini API

---

## 📋 TASKS AIOX PRIORIZADAS

| # | Task | Destino | Agente | Status |
|---|---|---|---|---|
| 1 | `create-case-leticia.md` | experia-commerce/tasks | @commerce-sales | 🔴 Bloqueada (Q1) |
| 2 | `create-case-paulo.md` | experia-commerce/tasks | @commerce-sales | 🔴 Bloqueada (Q2) |
| 3 | Squad `mvp-admin` (squad.yaml + agentes) | squads/mvp-admin/ | @architect | 🟡 FASE 1 |
| 4 | Squad `mvp-analytics` | squads/mvp-analytics/ | @architect | 🟡 FASE 1 |
| 5 | Squad `mvp-media` + Gemini integration | squads/mvp-media/ | @architect + @dev | 🟡 FASE 1 |
| 6 | Dashboard 360 (HTML/Supabase) | clients/[nome]/dashboard/ | @dev + @ux | 🟠 Bloqueada (Q3) |
| 7 | `test-mvp-squad.md` | .aiox-core/tasks/ | @qa | 🟠 FASE 3 |
| 8 | `onboard-new-case.md` | .aiox-core/tasks/ | @pm | 🟠 FASE 3 |
| 9 | `MVP-PLAYBOOK.md` | docs/mvp/ | @pm | 🟠 FASE 3 |
| 10 | `acquisition-script.md` | experia-commerce/tasks/ | @commerce-sales | 🟠 FASE 4 |

---

## 🧩 PROTOCOLO OPERACIONAL (Engine Triage v4 — Embedded)

**Toda demanda que chegar, o agente DEVE seguir automaticamente:**

| Fase | Ação |
|---|---|
| 1. Classificar | Criação / Modificação / Análise / Deploy / Pesquisa / QA |
| 2. Persona | Hat-switch → @architect, @dev, @qa, @pm, @devops |
| 3. Mindclones | 1-3 conselheiros: Hormozi (offer) · Ferriss (SOPs) · Brunson (script) |
| 4. Squad | Cross-funcional? → ativar squad. Single? → SKIP |
| 5. Surface Check | Bob C001-C007: custo, risco, opções, erros, destrutivo, escopo, deps |
| 6. Ecosystem | Consultar 13 workflows + 204 tasks + 52 RPs antes de criar algo novo |
| 7. Executar | MATCH → auto-execute. NO MATCH → `*create task` |
| 8. Quality Gate | @qa ≠ executor. Validar ACs |
| 9. Session State | SELF_CONTEXT + STATUS atualizados |
| 10. Output | Task rastreável, replicável, auditável |

---

## 🔑 COMO RETOMAR ESTA SESSÃO

### Para o Antigravity (nova sessão):
```
/KAIROS
/boot
/context

→ Ler este RP: reasoning-packages/tasks/RP-20260429-MVP-AIOPS-SESSION-HANDOFF-v1.0.md
→ Responder Q1–Q4 com Gabriel
→ Executar FASE 0 (cases Leticia + Paulo)
```

### Para outra LLM (prompt de ativação):
```
Você é o NOESIS, orquestrador do KAIROS OS v3.1.

Contexto: Estou construindo um MVP de "Equipes de Funcionários Digitais" 
para validar minha mão de obra como AI OPS solopreneur. Tenho dois cases 
para apresentar HOJE:

1. Leticia — esteticista autônoma, WhatsApp pessoal, foco em novos clientes, 
   estética corporal/facial, tom jovem e informal, Instagram ativo.

2. Paulo — tapeceiro high ticket (sofás, poltronas, cadeiras), em transição 
   para WhatsApp Business, Instagram morto.

Preciso:
- Criar o brief e scripts de atendimento WhatsApp para cada um
- Estruturar os squads de agentes para esses cases
- Planejar dashboard 360 simples (HTML + Supabase)

Stack: Evolution API (WhatsApp), Gemini API pool (conteúdo), N8N + OpenClaw 
(automações — ainda não deployado).

Responda as 4 perguntas abertas (Q1–Q4) abaixo e depois execute a FASE 0.

[Colar o conteúdo das Q1-Q4 desta sessão]
```

---

## 📌 RESUMO EXECUTIVO (versão trem)

**O que foi decidido hoje:**
1. ✅ Experia agência → postergada. Foco: AI OPS solopreneur.
2. ✅ MVP = squads internos + externos + dashboard 360 para comércios locais
3. ✅ Leticia (esteticista) + Paulo (tapeceiro) → apresentação hoje
4. ✅ Mídia via Gemini API pool (free tier God Pool) — zero custo
5. ✅ Squads internos: prompt KAIROS agora → N8N + OpenClaw depois
6. ✅ Engine Triage v4 embedded nos workflows core → /triage deletado
7. ✅ SELF_CONTEXT + STATUS atualizados com nova estratégia

**O que falta fazer:**
1. ❓ Responder Q1 (serviços Leticia) + Q2 (fluxo Paulo)
2. ❓ Definir Q3 (quem acessa dashboard) + Q4 (ordem N8N)
3. 🔴 FASE 0: criar clients/leticia/ + clients/paulo/ + scripts de atendimento
4. 🟡 FASE 1: criar squads mvp-admin + mvp-analytics + mvp-media
5. 🟠 FASE 2: dashboard 360

**Ordem de execução hoje:**
```
Responder Q1+Q2 → FASE 0 (cases) → Apresentação → Responder Q3+Q4 → FASE 1
```

---

*Gerado por NOESIS — KAIROS OS v3.1 · 2026-04-29*  
*"1 operador humano + squads de agentes = output de uma equipe inteira."*
