# 🔱 Opus 4.6 Replication System — METAMIND Hivemind Edition

> **Target:** 90-95% Claude Opus 4.6 quality with any LLM
> **Engine:** 3 Prompt Masters + Constitutional Layer + 65 Mind Clones
> **Agent:** Prometheus (opus-replicator) in meta squad

---

## Quick Start (5 minutes)

### 1. Pick your task type

| Task | Profile | War Room | Minds |
|:---|:---|:---|:---|
| Analysis / Decisions | `reasoning` | strategy-council | Taleb, Dalio, Naval |
| Content / Copy | `creative` | creative-forge | Godin, Brunson, Rick Rubin |
| Code / Architecture | `code` | engineering-lab | Hejlsberg, Lattner, Torvalds |
| Quality Check | `evaluation` | oversight-chamber | Kahneman, Mitchell, Gebru |
| Business Strategy | `strategy` | war-council | Hormozi, Collison, Hastings |
| Sales / Persuasion | `sales` | doombot-arena | Belfort, Brunson, Hormozi |
| AI System Design | `ai_architecture` | neural-sanctum | Karpathy, Nakajima, Hassabis |

### 2. Paste into your LLM

```
Step 1: Paste constitutional-layer.md (always first)
Step 2: Paste the appropriate Prompt Master (pm1/pm2/pm3)
Step 3: Paste CONTEXT.md (project context)
Step 4: Ask your question
```

### 3. Evaluate & Handoff

At end of session, use PM#3 to evaluate and generate a 280-token snapshot.

---

## File Map

```
.aiox-core/opus-replicator/
├── README.md                      ← You are here
├── constitutional-layer.md        ← ALWAYS prepend (core directives)
├── pm1-reasoning.md               ← Advanced analysis & decomposition
├── pm2-execution.md               ← Code, content, specs (production-grade)
├── pm3-evaluation.md              ← Quality scoring & degradation detection
├── calibration-profiles.json      ← 7 profiles with Hivemind mappings
└── session-protocol.md            ← Start/end/pivot procedures

.aiox-core/memory/
├── quality-baseline.json          ← 7-dimension quality tracking
└── session-snapshots/             ← 280-token handoff snapshots
    └── [YYYY-MM-DD].md

squads/meta/agents/
└── opus-replicator.md             ← Prometheus agent definition
```

---

## The Hivemind Advantage

What makes this system unique is the METAMIND integration. Instead of generic prompt engineering, each task type activates a **War Room** of expert mind clones whose thinking frameworks shape the output:

- **Strategy Council:** Taleb's antifragility + Dalio's principles + Naval's mental models
- **Engineering Lab:** Hejlsberg's type safety + Lattner's optimization + Torvalds's simplicity
- **Doombot Arena:** Belfort's persuasion + Brunson's funnels + Hormozi's offers
- **Neural Sanctum:** Karpathy's engineering + Nakajima's autonomy + Hassabis's multi-system design

The Constitutional Layer ensures ethical guardrails remain active even when invoking aggressive minds (Belfort, Maquiavel).

---

## Quality Thresholds

| Score | Meaning | Action |
|:---:|:---|:---|
| ≥8.5 | Opus parity | 🟢 Maintain |
| 8.0-8.4 | Target zone | 🟢 Small refinements |
| 7.0-7.9 | Acceptable | 🟡 Improve specific dimensions |
| <7.0 | Below threshold | 🔴 Stop, re-anchor, regenerate |
