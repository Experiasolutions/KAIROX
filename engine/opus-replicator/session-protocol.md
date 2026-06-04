# SESSION PROTOCOL — Antigravity Handoff System

> **Purpose:** Ensure zero context loss between LLM sessions.
> **Integrates with:** METAMIND Hivemind, Quality Baseline, Session Snapshots

---

## 🚀 SESSION START PROCEDURE

Execute this at the START of every new LLM session:

### Step 1: Load Context

Paste these files in order:
1. `CONTEXT.md` (project overview — ~7KB)
2. `constitutional-layer.md` (core directives — ~2KB)
3. Latest session snapshot from `.aiox-core/memory/session-snapshots/`

### Step 2: Activate Hivemind

Based on your task, select the calibration profile from `calibration-profiles.json`:

```
TASK TYPE          → PROFILE           → WAR ROOM           → PRIMARY MINDS
Analysis/Strategy  → reasoning         → strategy-council    → Taleb, Dalio, Naval
Content/Copy       → creative          → creative-forge      → Godin, Brunson, Rick Rubin
Code/Architecture  → code              → engineering-lab     → Hejlsberg, Lattner, Torvalds
Quality Check      → evaluation        → oversight-chamber   → Kahneman, Mitchell, Gebru
Business Strategy  → strategy          → war-council         → Hormozi, Collison, Hastings
Sales/Persuasion   → sales             → doombot-arena       → Belfort, Brunson, Hormozi
AI System Design   → ai_architecture   → neural-sanctum      → Karpathy, Nakajima, Hassabis
```

### Step 3: Prime the Model

First message of session:

```markdown
CONTEXT RESUME:

Previous Session Summary:
[paste 280-token snapshot]

Baseline Quality: [score from quality-baseline.json]
Active Profile: [profile name]
Hivemind War Room: [war room name]
Primary Minds Active: [list]

For this session:
- Maintain quality ≥ [baseline]
- Follow established patterns
- Avoid known gotchas from snapshot
- Continue from: [next action from snapshot]

Confirm understanding before proceeding.
```

---

## 🏁 SESSION END PROCEDURE

Execute this at the END of every session:

### Step 1: Evaluate

Run PM#3 (Evaluation) on all outputs from this session. Get the 7-dimension scores.

### Step 2: Generate Snapshot

Create compressed 280-token snapshot:

```
=== SESSION [YYYY-MM-DD] ===

OUTPUTS: [1-sentence summary]
PROFILE USED: [calibration profile]
WAR ROOM: [active war room]
MINDS INVOKED: [list of mind clones used]

PATTERNS ESTABLISHED:
- [pattern 1]
- [pattern 2]
- [pattern 3]

QUALITY: Avg [X.X/10] | Depth [X/10] | AIOX [X/10]

KEY LEARNINGS:
- [insight 1]
- [insight 2]

WHAT WORKED:
- [technique/approach that produced best results]

WHAT DIDN'T:
- [technique/approach that underperformed]

NEXT PRIORITIES:
1. [immediate action]
2. [follow-up]
3. [future enhancement]

GOTCHAS:
- [pitfall to avoid]
- [edge case to remember]

HIVEMIND NOTES:
- [which mind clone perspectives were most valuable]
- [which combinations worked best]

CHECKSUM: [profile]-[date]-[avg_score]

===
```

### Step 3: Save

Save snapshot to: `.aiox-core/memory/session-snapshots/[YYYY-MM-DD].md`
Update baseline in: `.aiox-core/memory/quality-baseline.json`

---

## 🔄 MID-SESSION PIVOT

If you need to change task type mid-session:

```
1. Note current profile and scores
2. Select new calibration profile
3. Announce pivot:

   "PROFILE SWITCH: [old] → [new]
    War Room: [old] → [new]
    Minds: [old list] → [new list]
    Reason: [why switching]"

4. Continue with new profile's Prompt Master
```

---

## 📊 WEEKLY REVIEW

Every Sunday, review all snapshots from the week:

```
WEEKLY REVIEW — Week of [DATE]

Sessions: [count]
Avg Quality: [X.X/10]
Trend: [improving/stable/degrading]

Best Output: [which session, what was produced]
Worst Output: [which session, what went wrong]

Most Effective Profile: [profile name]
Most Effective Mind Combination: [list]

Calibration Adjustments:
- [parameter change + reason]

Pattern Library Updates:
- [new patterns to add to IDS]
```

---

## 🚨 EMERGENCY PROTOCOL

If quality drops below 7.0/10 on any dimension:

```
1. STOP current generation
2. Re-read Constitutional Layer
3. Re-read relevant Prompt Master
4. Switch to a simpler task decomposition
5. Invoke METAMIND oversight:
   "METAMIND OVERRIDE: Quality below threshold.
    Activate oversight-chamber war room.
    Kahneman: check for cognitive biases.
    Mitchell: check for pattern failures.
    Gebru: check for ethical blind spots."
6. Regenerate with fixes
7. If still <7.0 → FLAG FOR HUMAN REVIEW
```
