# OPUS ENGINEERING BIBLE — v2.0 ADDENDUM
## ENGINE/CLIENT Architectural Correction

> **Relation to v1:** Bible v1 (`OPUS_ENGINEERING_BIBLE.md`) is IMMUTABLE — the historical document
> that defines the core system. This v2 addendum corrects domain contamination identified during
> Era 5 Bootstrap and provides domain-agnostic replacements for affected sections.
>
> **Rule:** When v2 and v1 conflict, **v2 takes precedence.**
> **Author:** Opus 4.6 (Antigravity Bootstrap) | **Date:** 2026-02-18

---

## 1. THE CORE CORRECTION

Bible v1 was written during Experia implementation (the first AIOS client).
Consequently, engine-level sections contain domain-specific vocabulary:

**Lines contaminated in v1:**

| Section | v1 Lines | Contamination |
|:---|:---:|:---|
| §11 Seed PM1 | 1078-1152 | WhatsApp, Evolution API, clinic patients, scheduling intents |
| §11 Seed PM2 | 1154-1416 | CalendarStore, patientId, clinic business hours |
| §12 AP-001 | 1424-1463 | "Evolution API", "WhatsApp message", "patient abandoned" |
| §12 AP-003 | 1480-1488 | "Two patients book same slot", "Clinic has double appointment" |
| §12 AP-004 | 1490-1498 | "Patient says Thursday morning", scheduling conversation |
| §12 AP-005 | 1500+ | "Hardcoded Business Hours" (clinic-specific) |

**Domain words that MUST NEVER appear in engine-level files:**
`patient`, `clinic`, `appointment`, `scheduling`, `WhatsApp`, `Evolution API`,
`fisio`, `consulta`, `business hours` (as clinic concept)

**Where these words BELONG (CLIENT level):**
`clients/experia/`, `squads/experia/`, `squads/patient-ops/`, `squads/clinical/`

---

## 2. CORRECTED SEED GOLDEN EXAMPLES

Bible v1 seeds are replaced by domain-agnostic versions already installed:

| v1 Seed | v1 File | v2 Replacement | v2 File |
|:---|:---|:---|:---|
| Phase 3 Architecture | `pm1/2026-02-18-phase3-arch.md` | **Engine Architecture Decision** | `pm1/2026-02-18-engine-architecture.md` |
| CalendarStore Implementation | `pm2/2026-02-18-calendar-store.md` | **Kernel Bridge Implementation** | `pm2/2026-02-18-kernel-bridge.md` |
| Audit Template | `pm3/2026-02-18-audit-template.md` | *(pending first PM3 audit cycle)* | — |

### Why the replacements are better:

**PM1 seed (Engine Architecture):**
- v1 analyzed a WhatsApp webhook system → useful only for messaging integrations
- v2 analyzes the AIOS engine architecture itself → useful for ANY engine-level design
- v2 identifies the ENGINE/CLIENT separation as a first-class architectural principle
- v2 maps kernel module dependencies that apply to every extension

**PM2 seed (Kernel Bridge):**
- v1 implemented a CalendarStore → useful only for scheduling features
- v2 analyzes kernel-bridge.js → demonstrates THE canonical bridge pattern:
  - safeRequire for graceful degradation
  - Lazy initialization for resource efficiency
  - Singleton for memory management
  - Health aggregation for dashboard integration
- These patterns apply to every new bridge module in AIOS

---

## 3. CORRECTED ANTI-PATTERNS

Bible v1 anti-patterns are replaced by domain-agnostic versions in `.aios-core/memory/anti-patterns.md`.

| AP | v1 Name (contaminated) | v2 Name (corrected) |
|:---|:---|:---|
| AP-001 | Silent Evolution API Failure | **Domain Contamination in Engine Files** *(new, engine-specific)* |
| AP-002 | Monolithic Intent Handler | **Silent External API Failure** *(generalized)* |
| AP-003 | Calendar Race Condition | **Monolithic Intent Handler** *(unchanged)* |
| AP-004 | Missing Session State | **Missing Session State** *(generalized)* |
| AP-005 | Hardcoded Business Hours | **Hardcoded Configuration** *(generalized)* |
| AP-006 | — | **Race Condition Ignored** *(new, generalized from AP-003)* |

### Key change: AP-001 is now about Domain Contamination

The #1 risk identified during bootstrap is not an API timeout (that's a standard engineering problem).
The #1 risk is **domain contamination** — engine-level files absorbing client-specific logic.
This was promoted to AP-001 because it threatens the entire value proposition:
if the engine contains `patient` and `clinic`, it can't power a logistics company.

---

## 4. UPDATED TOOL CHAIN (v2)

Bible v1 described the tools conceptually. v2 documents what's actually implemented:

| Tool | v1 Status | v2 Status | Location |
|:---|:---|:---|:---|
| input-refiner.js | Basic trigger detection | **v2.0**: golden example injection, AIOS context loading, anti-pattern injection, PM master loading, event-bus emission | `scripts/input-refiner.js` |
| self-correction.js | Not implemented | **v1.0**: 6 automated checks, 7-dim scoring, quality-baseline update, Nakajima session signal, event-bus emission | `scripts/self-correction.js` |
| harvest-gold.js | Conceptual | v1.0 exists | `scripts/harvest-gold.js` |
| Constitutional Layer | v1 in opus-replicator | **v3.0** with ENGINE domain correction | `.aios-core/opus-replicator/constitutional-layer-v3.md` |
| PM1/PM2/PM3 | Previous versions | **Masters installed** from Bible §7 | `.aios-core/opus-replicator/pm[1-3]-*.md` |

### Self-Correction Scores on Bootstrap Output

```
input-refiner.js v2:  9.3/10 EXCELLENT ✅
self-correction.js:   8.6/10 EXCELLENT ✅
```

---

## 5. TOOLS ARSENAL (NEW — not in Bible v1)

Bible v1 did not document the `tools/` directory. This is a major capability layer:

```
tools/
├── anthropics-cookbook/      → Official Anthropic patterns, capabilities, tool_use, skills
├── claude-skills-dev/       → 66 full-stack dev skills + skill-creator framework
├── get-shit-done/           → 32 workflows, 31 slash commands, 11 agents
├── openai-cookbook/          → OpenAI patterns (reference)
└── integrations/            → 18 integrated submodules:
    ├── anthropics-skills    → 332+ skills, 16 categories
    ├── claude-mem           → Persistent memory (SQLite + Chroma vector search)
    ├── get-shit-done        → Spec-driven development methodology
    ├── openai-skills        → Codex skills catalog
    ├── claude-skills        → 66 specialist skill definitions
    ├── shannon              → Knowledge graph intelligence
    ├── dexter               → Advanced coding assistant
    ├── opencode             → Code analysis + generation
    ├── compound-eng         → Engineering plugin
    ├── superpowers           → Extended capabilities
    ├── aion-ui              → AI interface components
    ├── openclaw             → Legal/compliance automation
    ├── monty/tambo/qmd      → Specialist tooling
    ├── chrome-devtools      → Browser automation MCP
    ├── page-index           → Web page indexing + RAG
    └── miessler-infra       → Security + infra patterns
```

**Integration status:** Cloned and available. Mind clone → skill mapping defined in
`tools/integrations/TOOLS-REGISTRY.md`. Not yet wired into kernel-bridge discovery.

---

## 6. COMPLETE ARCHITECTURE (5 Layers)

Bible v1 described 4 layers. v2 adds LAYER 4 (Tools):

```
┌─ LAYER 0: KERNEL ─────────────────────────────────────────┐
│  Synapse (8-layer neural) + IDS (REUSE>ADAPT>CREATE)      │
│  + WIS (12 workflow patterns) + Schemas + Constitution     │
└────────────────────────────────────────────────────────────┘
┌─ LAYER 1: BRIDGE ─────────────────────────────────────────┐
│  kernel-bridge.js + event-bus.js + mcp-server.js          │
│  + rag-engine.js + memory-system.js                        │
└────────────────────────────────────────────────────────────┘
┌─ LAYER 2: COGNITION (Noesis) ─────────────────────────────┐
│  Constitutional Layer v3.0 + PM1/PM2/PM3 Masters          │
│  + Golden Examples + Anti-Patterns + Quality Baseline      │
│  + input-refiner v2 + self-correction + harvest-gold       │
└────────────────────────────────────────────────────────────┘
┌─ LAYER 3: WORKFORCE ──────────────────────────────────────┐
│  16 squads, 178 agents, 67 mind clones, 204 tasks         │
└────────────────────────────────────────────────────────────┘
┌─ LAYER 4: TOOLS & INTEGRATIONS ───────────────────────────┐
│  5 repos, 18 submodules, 398+ skills                       │
│  Execution methodology (GSD), persistent memory (claude-mem)│
│  Knowledge graphs (shannon), browser automation (devtools) │
└────────────────────────────────────────────────────────────┘
```

---

## 7. ACTIVATION CHECKLIST (v2)

```
[✅] Save Constitutional Layer v3.0    → .aios-core/opus-replicator/
[✅] Save PM1/PM2/PM3 Masters          → .aios-core/opus-replicator/
[✅] Install golden example seeds      → .aios-core/memory/golden-examples/
[✅] Initialize quality-baseline.json  → .aios-core/memory/
[✅] Install anti-patterns catalog     → .aios-core/memory/
[✅] Deploy input-refiner v2           → scripts/input-refiner.js
[✅] Deploy self-correction v1         → scripts/self-correction.js
[✅] Create SELF_CONTEXT.md boot file  → .aios-core/opus-replicator/
[✅] Map tools arsenal (LAYER 4)       → SELF_CONTEXT.md architecture section
[✅] Create Bible v2 addendum          → this file
[ ] Wire tools into kernel-bridge discovery
[ ] Verify mind clone → skill mapping
[ ] Run first full PM3 audit cycle
[ ] Populate PM3 golden example seed
```

---

## 8. VERSION CONTROL

| Version | Date | Author | Changes |
|:---|:---|:---|:---|
| v1.0 | 2026-02-18 | Claude Sonnet 4.6 | Original Bible (1,683 lines) |
| v2.0 | 2026-02-18 | Opus 4.6 (Gemini/Antigravity) | ENGINE/CLIENT correction, domain-agnostic seeds, tools arsenal, 5-layer architecture |

**v1 remains IMMUTABLE.** All corrections and extensions live in v2.
