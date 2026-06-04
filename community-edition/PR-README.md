# 🧬 AIOX Community Contribution — Opus Replicant Engine + Evolution Engine

> **Contributor:** Gabriel ([@experiasolutions](https://github.com/experiasolutions))
> **AIOX Version:** v4.2.13 → KAIROS fork
> **Date:** 2026-02-21

---

## What This Contribution Adds

Four interconnected systems that give AIOX **cognitive depth, self-improvement, quality enforcement, and tool discovery**:

### 1. Opus Replicant Engine — Multi-Model Cognitive Protocol

A structured prompt engineering system that elevates any LLM to produce outputs with consistent depth and rigor.

**Core features:**
- **3 Master Prompts** — Deep Reasoning (PM1), Creative Execution (PM2), Meta-Analysis (PM3)
- **Constitutional Layer v3** — Behavioral guardrails for agent safety
- **Calibration Profiles** — Model-specific tuning parameters
- **Quality Signature** — 7-dimension self-scoring on every output
- **Degradation Detection** — Early warning when output quality drops

**Files added:**
```
.aiox-core/opus-replicator/
├── OPUS-REPLICANT-SYSTEM-v2.md       # Core system spec (40K)
├── IMPLEMENTATION-GUIDE-QUICK.md     # Quick start for operators
├── constitutional-layer-v3.md        # Safety guardrails
├── constitutional-layer.md           # v2 reference
├── pm1-reasoning.md                  # Analysis protocol
├── pm1-reasoning-master.md           # PM1 master definition
├── pm2-execution.md                  # Execution protocol
├── pm2-execution-master.md           # PM2 master definition
├── pm3-evaluation.md                 # Evaluation protocol
├── pm3-quality-master.md             # PM3 master definition
├── calibration-profiles.json         # Model tuning data
├── session-protocol.md               # Session management
├── GEM_MODE_ACTIVATION.md            # Quick activation prompt
├── distillation-readme.md            # Distillation guide
├── distillation-setup.md             # Distillation setup
├── hivemind-brainstorm.md            # Multi-agent brainstorming
└── metamind-evolution-blueprint.md   # Evolution blueprint
```

---

### 2. Evolution Engine — Autonomous Self-Improvement

A 17-script framework that enables AIOX to autonomously detect gaps, propose improvements, and evolve over time.

**Core features:**
- **Gap Detection** — Scans codebase for structural/quality issues
- **Proposal Engine** — Generates concrete improvement proposals
- **IA Council** — Multi-perspective deliberation with weighted voting
- **Apply → Verify Pipeline** — Safely applies and validates changes
- **Cognitive State Engine** — Persistent memory across sessions
- **Circuit Breaker** — Safety guardrails to prevent runaway changes

**Files added:**
```
scripts/evolution/
├── evolution-engine.js         # Core self-improvement loop
├── cognitive-state-engine.js   # Memory persistence (boot, observe, compress, drift, snapshot)
├── ia-council-engine.js        # Multi-chair deliberation with quorum
├── noesis-pipeline.js          # Quality enforcement pipeline
├── metacognition-layer.js      # Depth/honesty analysis
├── proposal-engine.js          # Generate improvement proposals
├── apply-engine.js             # Apply approved proposals
├── audit-engine.js             # Project health audit
├── validation-engine.js        # Constraint validation
├── verification-engine.js      # Post-apply verification
├── convergence-guard.js        # Prevent infinite voting loops
├── circuit-breaker.config.js   # Safety guardrails
├── notification-bridge.js      # Event notifications
├── generate-context.js         # SELF_CONTEXT.md generator
├── noesis-status.js            # Live dashboard
├── domain-words.config.json    # Domain contamination detection
└── baseline-frozen.json        # Frozen regression baseline
```

---

### 3. MCP Server + Tools Bridge — Skills Discovery

An MCP (Model Context Protocol) server that exposes AIOX capabilities to external tools, plus a skills discovery engine.

**Core features:**
- **8 MCP Tools** — status, squads, agents, events, skills (list/search/read)
- **Skills Discovery** — Scans workspace for `SKILL.md` files
- **Self-Test Suite** — 7/7 automated tests on startup

**Files added:**
```
scripts/
├── mcp-server.js      # MCP server with 8 tools
└── tools-bridge.js    # Skills discovery and search
```

---

### 4. Reasoning Package System — Structured Action Planning

A lightweight system for creating, tracking, and executing structured action plans (called Reasoning Packages / RPs).

**Core features:**
- **INDEX.md** — Central registry of all RPs with status tracking
- **Naming Convention** — `RP-{DATE}-{DESCRIPTION}.md`
- **Status Tracking** — ✅ Concluído | 🔄 Executando | 📋 Pendente | ❌ Cancelado
- **Mode Classification** — PM1 (analysis) | PM2 (execution) | PM3 (audit)

**Files added:**
```
reasoning-packages/
└── INDEX.md    # Registry template with conventions
```

---

## How to Use

### Opus Replicant Engine
1. Read `OPUS-REPLICANT-SYSTEM-v2.md` for the full protocol
2. Copy the activation prompt from `GEM_MODE_ACTIVATION.md` into your session
3. Use PM1 for analysis, PM2 for execution, PM3 for quality review

### Evolution Engine
```bash
# Run a health check (dry run, no changes)
node scripts/evolution/evolution-engine.js --dry-run

# View the Noesis dashboard
node scripts/evolution/noesis-status.js

# Regenerate SELF_CONTEXT.md
node scripts/evolution/generate-context.js

# View cognitive state
node scripts/evolution/cognitive-state-engine.js --dashboard
```

### MCP Server
```bash
# Start the MCP server (auto-discovers skills)
node scripts/mcp-server.js

# Self-test (runs automatically)
node scripts/mcp-server.js --self-test
```

### Reasoning Packages
1. Create a new RP: `reasoning-packages/RP-{DATE}-{DESCRIPTION}.md`
2. Follow the RP format from the Engineering Bible
3. Register it in `reasoning-packages/INDEX.md`

---

## Architecture Overview

```
                    ┌──────────────────────────────────┐
                    │       AIOX + Opus Replicant       │
                    │    PM1 → PM2 → PM3 (quality)      │
                    └──────────┬───────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
    ┌─────────▼──────┐  ┌─────▼──────┐  ┌──────▼────────┐
    │ Evolution       │  │ Cognitive   │  │ IA Council    │
    │ Engine          │  │ State       │  │ Multi-chair   │
    │ Gap→Propose→    │  │ Engine      │  │ deliberation  │
    │ Apply→Verify    │  │ Boot→Drift  │  │ with quorum   │
    └─────────┬──────┘  └─────┬──────┘  └──────┬────────┘
              │                │                │
              └────────────────┼────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
    ┌─────────▼──────┐  ┌─────▼──────┐  ┌──────▼────────┐
    │ MCP Server      │  │ Reasoning   │  │ Tools Bridge  │
    │ (8 tools)       │  │ Packages    │  │ (skills)      │
    │ External access │  │ Planning    │  │ Discovery     │
    └────────────────┘  └────────────┘  └───────────────┘
```

---

## Testing

All components include self-tests:

```bash
# MCP Server: 7/7 tests pass
node scripts/mcp-server.js --self-test

# Cognitive State Engine: 10/10 tests pass
node scripts/evolution/cognitive-state-engine.js --self-test

# Evolution Engine: dry-run mode for safe testing
node scripts/evolution/evolution-engine.js --dry-run
```

---

## License

This contribution follows the same license as the AIOX project.

## Credits

Built on top of AIOX v4.2.13 by Pedro Valério. Cognitive protocols inspired by Claude Opus 4.6 meta-analysis.
