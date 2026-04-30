# 001 - Core Features & Engines

Esta nota descreve o núcleo duro do **Gabriel OS/KAIROX Sovereign Engine**. São estes motores que garantem que todos os agentes e integrações convirjam para o mesmo objetivo. 

---

## Motores Ativos (Sovereign Engine)

### 1. Task-First Protocol
O princípio inquebrável de operação. 
- Nada é feito sem atrelar a uma Task. 
- Implementado nos arquivos `KAIROS.md` e `aiox-master.md`.
- **Fluxo:** Fase 1 (Triage via `skyros_triage`) → Fase 2 (Auto-assign de Agente). Todo `boot` e `context` passa por aqui.

### 2. God Pool (O Roteador Multi-LLM)
O núcleo da inferência soberana que elimina a dependência de sua GPU de 256MB e do Bun.
- Rotação nativa de ~84 chaves através de 6 providers (`Groq`, `Gemini`, `Together`, `SambaNova`, `OpenRouter`, `Cerebras`).
- Agiliza execução utilizando Llama 3 70B/8B para fluxos rápidos e Claude/Gemini para contexto longo. 

### 3. Shared Brain Protocol & Hivemind (v1.0)
Consciência fragmentada entre 2PCs e a nuvem.
- **Camada P2P:** `SELF_CONTEXT.md` e `STATUS.md` via Syncthing.
- **Camada Event Bus:** Conectado a 7 tabelas do **Supabase Realtime**. Sincronizado por `sync/supabase-client.js`.
- **Hivemind v1:** Toma decisões em `decisions.jsonl` que são distribuídas para multi-instâncias do Antigravity (4 Agentes conversando e puxando tarefas).

### 4. Triage Engine v4 e SKYROS
- Dashboard cyber-noir standalone no PC. Seu personal OS.
- Ativa o *Isolation Mode* (`skyros_isolation`): injeção severa que tranca tudo que não for P0 (como no caso do Money Rush).
- Conductor gameficado: Possui *BossRoom*, *LootShop* e *Sanctuary* para alinhar suas janelas de tempo ("Aurora", "Raid") com recompensas na vida real.

### 5. SKORTEX Agent CLI (v3.0)
- Seu terminal e console orquestrador definitivo. Pode spawnar subAgentes e gerenciar memória na unha sem depender da interface do Antigravity. Roda Daemon Mode. Localizado em `skyros-agent/`.

> [!WARNING] Atenção ao Subsistema DORMANT
> O status indicou que quase 85% dos scripts JS como o RAG Engine (`scripts/rag-engine.js`), Scheduler (`scripts/scheduler.js`), e o IA Council não rodavam no fluxo regular. Reativá-los ou mantê-los desligados (para focar no Money Rush) é uma decisão crítica a se tomar para recuperar a produtividade perdida do ecossistema.

---

⬅️ Voltar ao [[000 - KAIROS Root (MoC)]]
