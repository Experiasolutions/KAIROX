╔══════════════════════════════════════════════════════════════════════════╗
║                         REASONING PACKAGE                              ║
║  ID: RP-20260219-STRUCTURE-v2                                          ║
║  Mode: PM2-EXECUTION                                                   ║
║  Priority: CRITICAL                                                    ║
║  Predecessor: RP-20260218-STRUCTURE (parcialmente executado)           ║
║  Estimativa: 2 sessões (1 por modelo)                                  ║
║  Modelos Alvo: Opus 4.6 (Antigravity) + Gemini 3.1 Pro (Antigravity)  ║
╚══════════════════════════════════════════════════════════════════════════╝

## ⚙️ EXECUTION MODEL DIRECTIVE

Este RP é desenhado para ser executado por DOIS modelos em SESSÕES DIFERENTES:

| Estágio                                 | Modelo         | Engine                          | Escopo                                                       |
| :-------------------------------------- | :------------- | :------------------------------ | :----------------------------------------------------------- |
| **Estágio 1: Cirurgia Estrutural**      | Opus 4.6       | Noesis + Council                | Movimentações, decontaminação, RPs orphans                   |
| **Estágio 2: Documentação & Validação** | Gemini 3.1 Pro | Noesis (qualidade Opus via PM2) | README updates, ARCHITECTURE.md, ROADMAP.md, validação final |

**REGRA:** Cada modelo executa APENAS seu estágio. Se houver dependência, o Estágio 2 lê o output do Estágio 1.

---

## 🎯 CONTEXT BLOCK

### O que é
A reestruturação cirúrgica completa do AIOS para:
1. Resolver os 7 gaps identificados na execução parcial do RP-STRUCTURE v1
2. Eliminar contaminação de domínio nos `squads/` universais
3. Completar a separação ENGINE vs CLIENT PACKAGE
4. Formalizar o estado atual do sistema (que evoluiu MUITO desde o RP v1)

### Por que é necessário (Gap Analysis do RP v1)

O RP-20260218-STRUCTURE foi parcialmente executado. Uma auditoria cirúrgica revela:

| #    | Gap                                             | Evidência                                                                                                                                                                                              | Severidade |
| :--- | :---------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------- |
| G1   | **RPs órfãos na raiz**                          | `RP-20260218-NOESIS-ENGINE.md` e `RP-20260218-PHASE3-WHATSAPP.md` continuam na raiz em vez de `reasoning-packages/`                                                                                    | MEDIUM     |
| G2   | **Contaminação de domínio em squads/**          | `squads/finance/squad.yaml`, `squads/analytics/agents/analytics-head.md`, `squads/marketing/agents/mkt-content.md`, `squads/finance/agents/*.md`, `squads/olympus-governance.md` referenciam "clínica" | HIGH       |
| G3   | **Squads Experia-específicos ainda em squads/** | `squads/admin/`, `squads/cs/`, `squads/facilities/`, `squads/vendas/`, `squads/marketing/`, `squads/finance/`, `squads/ops/`, `squads/produto/` são squads de OPERAÇÃO CLÍNICA, não ENGINE             | CRITICAL   |
| G4   | **INDEX.md desatualizado**                      | Faltam: `RP-20260218-EVOLUTION-ENGINE`, `RP-20260218-NOESIS-ENGINE`                                                                                                                                    | MEDIUM     |
| G5   | **ROADMAP.md desatualizado**                    | Não reflete Noesis v2.2, Evolution Engine, Cognitive State Engine                                                                                                                                      | MEDIUM     |
| G6   | **docs/ARCHITECTURE.md desatualizado**          | Não reflete `scripts/evolution/` (16 arquivos), Noesis pipeline, Cognitive State                                                                                                                       | HIGH       |
| G7   | **rh-squad/ na raiz**                           | Diretório `rh-squad/` solto na raiz, fora do padrão `squads/`                                                                                                                                          | LOW        |

### Estado Atual do Projeto (Ground Truth — Feb 19, 2026)

```
/
├── README.md                        ← ✅ Existe (v2, ENGINE/CLIENT)
├── OPUS_ENGINEERING_BIBLE.md        ← ✅ Imutável (68KB)
├── OPUS_ENGINEERING_BIBLE_v2.md     ← ✅ Addendum (10KB)
├── RP-20260218-NOESIS-ENGINE.md     ← ❌ ÓRFÃO (deveria estar em reasoning-packages/)
├── RP-20260218-PHASE3-WHATSAPP.md   ← ❌ ÓRFÃO (deveria estar em reasoning-packages/)
│
├── reasoning-packages/              ← ✅ Existe (4 RPs + INDEX)
│   ├── INDEX.md                     ← ⚠️ Desatualizado (faltam 2 RPs)
│   ├── RP-20260218-BOOTSTRAP.md
│   ├── RP-20260218-EVOLUTION-ENGINE.md
│   ├── RP-20260218-LOCAL-BRIDGE.md
│   ├── RP-20260218-STRUCTURE.md
│   └── RP-EXPERIA-PHASE3.md
│
├── clients/
│   └── experia/                     ← ✅ Existe (README, ONBOARDING, squads/, scripts/, docs/)
│       ├── squads/                  ← ✅ 77 children (Experia-specific squads)
│       ├── scripts/                 ← ✅ 14 children (Experia automation)
│       └── docs/                    ← ✅ 15 children
│
├── squads/                          ← ⚠️ CONTAMINADO
│   ├── mind-clones/                 ← ✅ ENGINE (66 arquivos, universal)
│   ├── meta/                        ← ✅ ENGINE (meta-agents, universal)
│   ├── doombot/                     ← ⚠️ MISTO (revenue framework é ENGINE, config pode ser CLIENT)
│   ├── admin/                       ← ❌ EXPERIA (operação de clínica)
│   ├── analytics/                   ← ❌ EXPERIA (analytics de clínica)
│   ├── cs/                          ← ❌ EXPERIA (customer success de clínica)
│   ├── facilities/                  ← ❌ EXPERIA (facilities de clínica)
│   ├── finance/                     ← ❌ EXPERIA (financeiro de clínica)
│   ├── marketing/                   ← ❌ EXPERIA (marketing de clínica)
│   ├── ops/                         ← ❌ EXPERIA (operações de clínica)
│   ├── produto/                     ← ❌ EXPERIA (produto para clínica)
│   ├── vendas/                      ← ❌ EXPERIA (vendas para clínica)
│   └── olympus-governance.md        ← ⚠️ MISTO (governança Experia-specific)
│
├── scripts/                         ← ✅ ENGINE
│   ├── evolution/                   ← ✅ 16 arquivos (Noesis + Evolution Engine)
│   └── [51 scripts core]
│
├── .aios-core/                      ← ✅ ENGINE
│   ├── noesis/                      ← ✅ (Noesis config)
│   ├── opus-replicator/             ← ✅ (CL v3, PM Masters, SELF_CONTEXT)
│   └── memory/                      ← ✅ (golden examples, anti-patterns)
│
├── rh-squad/                        ← ❌ ÓRFÃO (fora do padrão)
├── meu-projeto-ai/                  ← ❓ DESCONHECIDO (437 children — requer triagem)
├── distillation-dataset/            ← ✅ ENGINE (3 children)
└── [PDFs, configs, tests, etc.]
```

### Dependências
- Nenhuma dependência externa
- Dependência interna: RP-20260218-STRUCTURE (v1, parcialmente executado)
- `event-bus.js`, `kernel-bridge.js` NÃO são afetados
- Paths de `require()` em scripts NÃO mudam (apenas squads movem)

### Blockers
- Nenhum. Todas as movimentações são de YAML/Markdown (squads), não de código JS.

---

## 🧠 ARCHITECTURE DECISION

### O Princípio Central: ENGINE ≠ OPERAÇÃO

```
ENGINE (Motor Universal)         CLIENT PACKAGE (Operação Específica)
─────────────────────────        ──────────────────────────────────────
squads/mind-clones/              clients/experia/squads/admin/
squads/meta/                     clients/experia/squads/analytics/
squads/doombot/ (framework)      clients/experia/squads/cs/
squads/workflows/                clients/experia/squads/facilities/
                                 clients/experia/squads/finance/
scripts/kernel-bridge.js         clients/experia/squads/marketing/
scripts/evolution/               clients/experia/squads/ops/
scripts/event-bus.js             clients/experia/squads/produto/
                                 clients/experia/squads/vendas/
```

### Critério de Decisão (UNIVERSAL vs EXPERIA)

Para cada squad, aplique o teste:
> "Se amanhã adicionarmos um cliente de logística, este squad seria útil para ele?"
> - **SIM** → ENGINE (fica em `squads/`)
> - **NÃO** → CLIENT (move para `clients/experia/squads/`)

| Squad          | Teste                                     | Resultado                                  |
| :------------- | :---------------------------------------- | :----------------------------------------- |
| `mind-clones/` | Clones de experts servem qualquer domínio | **ENGINE** ✅                               |
| `meta/`        | Meta-agents servem qualquer domínio       | **ENGINE** ✅                               |
| `doombot/`     | Revenue framework é universal             | **ENGINE** ✅ (mas config Experia → CLIENT) |
| `workflows/`   | Workflow infra é universal                | **ENGINE** ✅                               |
| `admin/`       | Administração de CLÍNICA                  | **CLIENT** → `clients/experia/squads/`     |
| `analytics/`   | Analytics de CLÍNICA                      | **CLIENT** → `clients/experia/squads/`     |
| `cs/`          | Customer Success de CLÍNICA               | **CLIENT** → `clients/experia/squads/`     |
| `facilities/`  | Facilities de CLÍNICA                     | **CLIENT** → `clients/experia/squads/`     |
| `finance/`     | Financeiro de CLÍNICA                     | **CLIENT** → `clients/experia/squads/`     |
| `marketing/`   | Marketing de CLÍNICA                      | **CLIENT** → `clients/experia/squads/`     |
| `ops/`         | Operações de CLÍNICA                      | **CLIENT** → `clients/experia/squads/`     |
| `produto/`     | Produto para CLÍNICA                      | **CLIENT** → `clients/experia/squads/`     |
| `vendas/`      | Vendas para CLÍNICA                       | **CLIENT** → `clients/experia/squads/`     |

### Trade-offs Aceitos

1. **Duplicação parcial em `clients/experia/squads/`:** O diretório `clients/experia/squads/` já tem 77 children. Mover mais 9 squads pode gerar overlap. **Solução:** antes de mover, verificar se o squad já existe no destino. Se sim, merge (preferência ao destino existente).

2. **`doombot/` é misto:** O framework de revenue (arena, critic-gate, P&L) é ENGINE. Mas a config (`data/monetization-kpis.md`) pode ter termos Experia. **Solução:** manter `doombot/` em `squads/` e apenas decontaminar os arquivos com referências a domínio-específicas.

3. **`olympus-governance.md` é Experia:** Fala de governança de clínica. **Solução:** mover para `clients/experia/docs/`.

---

## 📋 EXECUTION PLAN

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ESTÁGIO 1 — CIRURGIA ESTRUTURAL (Opus 4.6)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Step 1.1: MOVIMENTAÇÃO DE RPs ÓRFÃOS

**Ação:** Mover RPs da raiz para `reasoning-packages/`
**Comandos:**
```powershell
Move-Item "RP-20260218-NOESIS-ENGINE.md" "reasoning-packages/RP-20260218-NOESIS-ENGINE.md"
Move-Item "RP-20260218-PHASE3-WHATSAPP.md" "reasoning-packages/RP-20260218-PHASE3-WHATSAPP.md"
```
**Teste:** `ls reasoning-packages/RP-*.md` retorna 7 arquivos (5 existentes + 2 movidos)
**Risco:** LOW (apenas movimentação de docs)

---

### Step 1.2: MOVIMENTAÇÃO DE SQUADS EXPERIA

**Ação:** Mover 9 squads de `squads/` para `clients/experia/squads/`

**ANTES de mover cada squad:**
1. Verificar se já existe em `clients/experia/squads/`
2. Se existe: NÃO sobrescrever — renomear o local para `{squad}-engine-original/` e comparar manualmente
3. Se não existe: mover diretamente

**Squads a mover (ordem alfabética):**
```powershell
# Para cada squad, verificar antes:
# Test-Path "clients/experia/squads/{nome}"

Move-Item "squads/admin"      "clients/experia/squads/admin"
Move-Item "squads/analytics"  "clients/experia/squads/analytics"
Move-Item "squads/cs"         "clients/experia/squads/cs"
Move-Item "squads/facilities" "clients/experia/squads/facilities"
Move-Item "squads/finance"    "clients/experia/squads/finance"
Move-Item "squads/marketing"  "clients/experia/squads/marketing"
Move-Item "squads/ops"        "clients/experia/squads/ops"
Move-Item "squads/produto"    "clients/experia/squads/produto"
Move-Item "squads/vendas"     "clients/experia/squads/vendas"
```
**Teste:** `ls squads/` deve retornar APENAS: `.gitkeep`, `doombot/`, `meta/`, `mind-clones/`, `workflows/`
**Risco:** MEDIUM (breaking references se algum script referencia `squads/admin/`)

**MITIGAÇÃO:** Antes de mover, executar:
```powershell
Select-String -Path "scripts/*.js" -Pattern "squads/(admin|analytics|cs|facilities|finance|marketing|ops|produto|vendas)" -SimpleMatch
```
Se houver matches → não mover até corrigir as referências.

---

### Step 1.3: MOVIMENTAÇÃO DE ITENS AVULSOS

**Ação:**
1. Mover `olympus-governance.md` de `squads/` para `clients/experia/docs/`
2. Mover `rh-squad/` para `clients/experia/squads/rh/` (ou avaliar se é universal)

```powershell
Move-Item "squads/olympus-governance.md" "clients/experia/docs/olympus-governance.md"
# rh-squad: verificar conteúdo primeiro
Get-Content "rh-squad/README.md" -ErrorAction SilentlyContinue
# Se referencia clínica → mover para clients/experia/squads/rh/
# Se universal → mover para squads/rh/
```

**Teste:** `squads/` não contém `olympus-governance.md`
**Risco:** LOW

---

### Step 1.4: DECONTAMINAÇÃO DE DOMÍNIO EM SQUADS ENGINE

**Ação:** Verificar e limpar referências a "clínica" nos squads que PERMANECEM em `squads/`:
- `squads/doombot/`

**Processo:**
```powershell
Select-String -Path "squads/doombot/**" -Pattern "clínica|paciente|experia|consultório" -Recurse
```
- Se encontrar: substituir por termos genéricos (ex: "cliente" em vez de "clínica")
- Se não encontrar: ✅ limpo

**Teste:** `grep -ri "clínica\|paciente\|consultório" squads/` retorna zero resultados
**Risco:** LOW (apenas texto em YAML/Markdown)

---

### Step 1.5: TRIAGEM DE `meu-projeto-ai/`

**Ação:** Inspecionar o conteúdo de `meu-projeto-ai/` (437 children) e decidir:
- Se é um projeto web da Experia → mover para `clients/experia/web/` ou similar
- Se é um projeto genérico → documentar e manter
- Se é lixo → `.gitignore` ou remover

```powershell
Get-ChildItem "meu-projeto-ai" | Select-Object -First 20
# Avaliar com base no conteúdo
```

**Teste:** Decisão documentada sobre o destino do diretório
**Risco:** LOW (avaliação, não movimentação)

---

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ESTÁGIO 2 — DOCUMENTAÇÃO & VALIDAÇÃO (Gemini 3.1 Pro)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Step 2.1: ATUALIZAR reasoning-packages/INDEX.md

**Ação:** Adicionar os RPs que faltam:

| ID                           | Data       | Mode | Status       | Descrição                                 | Arquivo                         |
| :--------------------------- | :--------- | :--- | :----------- | :---------------------------------------- | :------------------------------ |
| RP-20260218-NOESIS-ENGINE    | 2026-02-18 | PM1  | ✅ Concluído  | Noesis Engine v2.2 (Identidade Cognitiva) | RP-20260218-NOESIS-ENGINE.md    |
| RP-20260218-PHASE3-WHATSAPP  | 2026-02-18 | PM2  | ✅ Concluído  | WhatsApp Revenue Bridge (Experia)         | RP-20260218-PHASE3-WHATSAPP.md  |
| RP-20260218-EVOLUTION-ENGINE | 2026-02-18 | PM2  | ✅ Concluído  | Evolution Engine (Auto-evolução autônoma) | RP-20260218-EVOLUTION-ENGINE.md |
| RP-20260219-STRUCTURE-v2     | 2026-02-19 | PM2  | 🔄 Executando | Reestruturação v2 (Opus 4.6 + Gemini 3.1) | RP-20260219-STRUCTURE-v2.md     |

**Teste:** INDEX.md lista todos os 8 RPs existentes
**Risco:** LOW

---

### Step 2.2: ATUALIZAR docs/ARCHITECTURE.md

**Ação:** Reescrever `docs/ARCHITECTURE.md` para refletir o estado REAL do sistema:

**Conteúdo obrigatório:**
1. **Diagrama das 4 Camadas:**
   ```
   LAYER 4: TRANSCENDENCE
   ├── Noesis Engine (noesis-pipeline.js v2.2)
   ├── Cognitive State Engine (cognitive-state-engine.js)
   ├── Metacognition Layer (metacognition-layer.js)
   └── Evolution Engine (evolution-engine.js + 10 sub-engines)

   LAYER 3: COGNITION
   ├── Opus Replicator (Constitutional Layer v3.0)
   ├── PM Masters (PM1-Strategy, PM2-Execution, PM3-Audit)
   ├── Golden Examples (harvest-gold.js)
   └── Anti-Patterns (quality-baseline.json)

   LAYER 2: ORCHESTRATION
   ├── Kernel Bridge (kernel-bridge.js)
   ├── Event Bus (event-bus.js)
   ├── Squad Router (squad-router.js)
   ├── Tools Bridge (tools-bridge.js + skill-mapper.js)
   └── Metamind (65 mind-clones + 17 War Rooms)

   LAYER 1: EXECUTION
   ├── Scripts (51 scripts core)
   ├── Integrations (18 tools)
   ├── Client Packages (clients/experia/)
   └── Data Layer (data/, .aios-core/memory/)
   ```

2. **Diagrama ENGINE vs CLIENT PACKAGE** (atualizado pós-movimentação)
3. **Mapa de dependências de scripts** (quem importa quem)
4. **Versões atuais** de cada componente

**Teste:** Diagrama reflete todos os 16 arquivos em `scripts/evolution/`
**Risco:** LOW

---

### Step 2.3: ATUALIZAR .aios-core/development/ROADMAP.md

**Ação:** Reescrever ROADMAP.md com estado real:

```markdown
## ✅ Concluído
- Bootstrap Noesis (Etapas 0-10)
- Estrutura ENGINE/CLIENT v1
- Evolution Engine (12 ficheiros + IA Council)
- Noesis Engine v2.2 (meta-evolved)
- Cognitive State Engine
- Metacognition Layer
- WhatsApp Revenue Bridge (Phase 3 Experia)
- Domain Decontamination (3 cycles)
- Reasoning Packages (8 RPs)

## 🔄 Em Progresso
- Estrutura ENGINE/CLIENT v2 (este RP)
- Time Machine Protocol (metamind.md — `enabled: false`)

## 📋 Próximo
- Ativar Time Machine Protocol (weekly self-evolution)
- Local Bridge (RP-20260218-LOCAL-BRIDGE)
- Noesis Dashboard v3 (web UI)

## 🔮 Futuro
- Multi-client WaaS (segundo client package)
- Supabase migration (JSON → DB)
- LLM API integration (Council real vs simulated)
```

**Teste:** ROADMAP.md reflete o estado real de Feb 19
**Risco:** LOW

---

### Step 2.4: ATUALIZAR README.md

**Ação:** Atualizar a tabela de STATUS e a árvore do projeto no README.md para refletir:
1. Evolution Engine como ✅ Concluído (não 🔮 Futuro)
2. Noesis v2.2 no stack
3. Estrutura atualizada pós-movimentação de squads

**Teste:** README preciso para onboarding em <60 segundos
**Risco:** LOW

---

### Step 2.5: VALIDAÇÃO FINAL (Teste de Onboarding)

**Ação:** Simulação de onboarding:
1. Um novo agente lê `README.md`
2. Consegue responder em 60 segundos:
   - "O que é o motor?" → AIOS, motor universal de orquestração
   - "O que é a Experia?" → Primeiro client package (clínicas)
   - "Qual é o próximo passo?" → Ativar Time Machine Protocol
   - "Onde está o código de evolução?" → `scripts/evolution/` (16 arquivos)
3. Se falhar qualquer pergunta → identificar gap e corrigir

**Teste:** 4/4 perguntas respondidas corretamente
**Risco:** N/A (validação)

---

## ⚠️ EDGE CASES

### EC-01: Squad já existe no destino
**Scenario:** `squads/admin/` sendo movido, mas `clients/experia/squads/admin/` já existe (migração parcial anterior)
**Solução:** NÃO sobrescrever. Renomear fonte para `admin-from-engine/`, comparar manualmente, merge manual.

### EC-02: Scripts referenciam paths de squads movidos
**Scenario:** `squad-router.js` ou `activate-registry.js` referenciam `squads/finance/`
**Solução:** Executar grep ANTES de mover. Se encontrar referências:
1. Atualizar path no script para `clients/experia/squads/finance/`
2. OU criar symlink (não recomendado em Windows)

### EC-03: PDFs na raiz
**Scenario:** 5 PDFs de livros (Hormozi, Brunson, Belfort, Maquiavel, Babilônia) na raiz
**Solução:** Não mover (são material de referência dos clones). Documentar em `.gitignore` se necessário. Nota: gitignore provavelmente já os inclui pelo tamanho.

### EC-04: `meu-projeto-ai/` com 437 children
**Scenario:** Diretório gigante na raiz sem documentação
**Solução:** Triagem no Step 1.5. Se Experia → `clients/experia/web/`. Se descartável → `rm -rf` (com confirmação de Gabriel).

---

## ✅ QUALITY GATE

### Pós-Estágio 1 (Opus 4.6):
- [ ] Zero RPs na raiz (todos em `reasoning-packages/`)
- [ ] `squads/` contém APENAS: `.gitkeep`, `doombot/`, `meta/`, `mind-clones/`, `workflows/`
- [ ] Zero referências a "clínica/paciente/consultório" em `squads/` ENGINE
- [ ] `olympus-governance.md` em `clients/experia/docs/`
- [ ] `rh-squad/` movido ou documentado
- [ ] `meu-projeto-ai/` triado
- [ ] Nenhum script quebrado (grep de referências confirmado)

### Pós-Estágio 2 (Gemini 3.1 Pro):
- [ ] INDEX.md lista 8+ RPs
- [ ] ARCHITECTURE.md tem as 4 camadas com todos os 16 scripts de evolution
- [ ] ROADMAP.md reflete estado real de Feb 19
- [ ] README.md reflete estrutura pós-movimentação
- [ ] Teste de onboarding: 4/4 perguntas respondidas
- [ ] git commit com mensagem descritiva

---

## 🚫 O QUE NÃO FAZER

- **NÃO move scripts/ ou .aios-core/** — são ENGINE e os paths estão hardcoded
- **NÃO apague nenhum squad** — apenas MOVA para `clients/experia/squads/`
- **NÃO altere OPUS_ENGINEERING_BIBLE.md** — é imutável
- **NÃO mova mind-clones/ para clients/** — clones são UNIVERSAIS
- **NÃO renomeie agentes dentro dos squads** — quebra referências em `squad.yaml`
- **NÃO altere `event-bus.js` ou `kernel-bridge.js`** — são sistema nervoso, intocáveis

---

## 📦 GEMINI/OPUS EXECUTION DIRECTIVE

**Para Opus 4.6 (Estágio 1):**
Você é CIRURGIÃO. Sua tarefa é mover arquivos com precisão atômica.
EXECUTE Steps 1.1 a 1.5 na ordem exata.
ANTES de cada movimentação, execute o grep de referências.
SE encontrar referências quebradas: PARE, documente, e solicite confirmação.
CADA movimentação deve ser seguida de um teste de integridade.

**Para Gemini 3.1 Pro (Estágio 2):**
Você é DOCUMENTADOR. Sua tarefa é refletir o estado REAL do sistema na documentação.
NÃO invente features que não existem — documente APENAS o que existe.
LEIA os diretórios antes de escrever — o estado pós-Estágio 1 é sua fonte de verdade.
EXECUTE Steps 2.1 a 2.5 na ordem exata.
O teste de onboarding (Step 2.5) é a validação final — se falhar, corrija antes de entregar.

**Entregáveis:**
1. Estrutura limpa (zero contaminação em `squads/`)
2. INDEX.md atualizado com todos os RPs
3. ARCHITECTURE.md com diagrama de 4 camadas
4. ROADMAP.md com estado real
5. README.md atualizado
6. Relatório de execução com diff completo
7. git commit final

---

## 🔑 NOESIS TRACE (Meta-Cognição deste RP)

**Contexto:** Gabriel pediu um RP aprimorado usando Opus 4.6 e todas as engines.
**Avaliação:** O RP v1 foi bom conceptualmente mas falhou na execução completa. 7 gaps identificados.
**Reflexão (Depth N3):** A falha do v1 não foi de design — foi de granularidade. Os steps eram muito abstratos ("mapeie squads Experia vs universais") sem listar QUAIS squads. O v2 lista todos explicitamente.
**Colheita:** Este RP serve como Golden Example de como evoluir um RP falhado.
**Sinalização:** A contaminação de domínio é o gap mais perigoso para o modelo WaaS.
