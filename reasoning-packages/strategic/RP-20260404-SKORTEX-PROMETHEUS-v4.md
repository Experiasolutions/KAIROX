# RP-20260404-SKORTEX-PROMETHEUS-v4.0
## Fusão OpenClaude + KAIROS DNA → Agente Soberano de Nova Geração

**Data:** 2026-04-04
**Autor:** NOESIS Engine
**Status:** BLUEPRINT — Pendente Aprovação do Operador
**Prioridade:** P0 — Mudança Arquitetural Fundamental

---

### Contexto

O SKORTEX v3.0 (skyros-agent/) foi construído from scratch com ~30 arquivos JS e 9 tools.
O OpenClaude é um fork open-source do Claude Code com 2076 arquivos, 44+ tools, multi-provider nativo,
coordinator mode, MCP SDK nativo, streaming production-grade e TypeScript.

### Decisão Estratégica

**Aposentar o runtime hand-built do SKORTEX v3 e adotar o OpenClaude como novo runtime base.**
Injetar o DNA exclusivo do KAIROS (personas, RPs, Supabase, Hivemind) como camadas modulares.

### Ganhos Quantificados

| Métrica | SKORTEX v3 | SKORTEX v4 Prometheus |
|---|---|---|
| Tools | 9 | 44+ |
| Providers | 4 (custom) | 8+ (battle-tested) |
| Agent Routing | ❌ | ✅ per-agent model |
| MCP | Bridge (hack) | Native SDK |
| Coordinator | Custom spawner | Native async workers |
| Type Safety | JS | TypeScript |
| Session Resume | Manual JSONL | --continue / --resume |
| Cost Tracking | ❌ | ✅ built-in |
| Lines of Code | ~4K custom | ~200K battle-tested + custom layers |

### Moat Preservado

- Personas KAIROS (12+ agentes com personalidade)
- 52+ Reasoning Packages
- Supabase SharedBrain (event bus, task queue)
- Hivemind multi-node sync
- API Key Pool rotation
- Daemon background mode
- Night-Shift automator

### Arquitetura de 4 Camadas

```
L3 — KAIROS OS Integration (MCP Server, Obsidian, Git, Night-Shift)
L2 — Sovereignty Layer (Supabase, Hivemind, Daemon, Spawner)
L1 — KAIROS DNA Injection (Personas, RPs, Context, API Pool, Noesis Engine)
L0 — OpenClaude Runtime (QueryEngine, 44+ Tools, Multi-Provider, MCP SDK)
```

### Implementação: 4 Fases / 5 Dias

1. **Bootstrap** — Fork, instalar, configurar Gemini, validar boot
2. **DNA Injection** — Personas, RPs, Context Bridge, API Pool
3. **Sovereignty** — Supabase sync, Hivemind, Daemon, Spawner (TypeScript ports)
4. **Branding** — Rename CLI, custom theme, VS Code extension, E2E tests

### Riscos

- Dependência de Bun para build (mitigável: build gera `dist/cli.mjs` que roda em Node)
- Upstream updates do OpenClaude (mitigável: fork controlado com cherry-pick seletivo)
- Complexidade de port para TypeScript (mitigável: port incremental, priorizar sovereignty layer)

### Conclusão

O OpenClaude É o que o SKORTEX está tentando ser — mas já pronto e production-grade.
A fusão nos dá 10x mais capacidade overnight, preservando 100% do DNA KAIROS.
É o movimento estratégico mais impactante possível com o menor esforço relativo.
