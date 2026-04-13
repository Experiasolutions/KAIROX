╔══════════════════════════════════════════════════════════════════╗
║                    REASONING PACKAGE                            ║
║  ID: RP-20260218-EVOLUTION-ENGINE                               ║
║  Mode: PM2-EXECUTION                                            ║
║  Priority: CRITICAL                                             ║
║  Estimated execution: ~3 hours (12 files + dry-run + report)    ║
╚══════════════════════════════════════════════════════════════════╝

## 🎯 CONTEXT BLOCK

**What this is:** The Evolution Engine — the self-improvement subsystem that
transforms AIOS from a static tool into an autonomous organism that examines,
judges, and reconstructs itself.

**Why it matters:** Currently, all improvement requires Gabriel to identify
problems, generate RPs, and feed them to the system. The Evolution Engine
inverts this: AIOS inspects itself, an IA Council of 7 perspectives deliberates,
and changes are applied autonomously with appropriate safety gates.

**Where it fits in AIOS:**
- AIOS Phase: Era 5 — Transcendence (Phase 4: Evolution Engine)
- Architecture Layer: Between LAYER 2 (Cognition/Noesis) and LAYER 1 (Bridge)
- Foundation: Extends `metamind.md` TIME MACHINE protocol (currently `enabled: false`)
- Precedent: `constitutional-layer-v3.md` Rule 5 (EVOLUTION) and Bible §10 (Self-Improvement Loop)

**Files to CREATE (12):**
1. `scripts/evolution/circuit-breaker.config.js`
2. `scripts/evolution/baseline-frozen.json`
3. `scripts/evolution/convergence-guard.js`
4. `scripts/evolution/ia-council-engine.js`
5. `scripts/evolution/audit-engine.js`
6. `scripts/evolution/proposal-engine.js`
7. `scripts/evolution/validation-engine.js`
8. `scripts/evolution/apply-engine.js`
9. `scripts/evolution/verification-engine.js`
10. `scripts/evolution/evolution-engine.js`
11. `scripts/evolution/notification-bridge.js`
12. `scripts/run-evolution-cycle.js`

**Files to READ (context — completed):**
1. `.aios-core/opus-replicator/SELF_CONTEXT.md` ✅
2. `docs/AIOS_MASTER_HANDBOOK.md` ✅
3. `OPUS_ENGINEERING_BIBLE.md` (§10 Self-Improvement Loop) ✅
4. `OPUS_ENGINEERING_BIBLE_v2.md` ✅
5. `.aios-core/docs/standards/AIOS-LIVRO-DE-OURO.md` ✅
6. `squads/mind-clones/agents/metamind.md` ✅
7. `.aios-core/opus-replicator/constitutional-layer-v3.md` ✅
8. `scripts/kernel-bridge.js` ✅
9. `scripts/event-bus.js` ✅
10. `.aios-core/memory/anti-patterns.md` ✅
11. `.aios-core/memory/quality-baseline.json` ✅

**Files to MODIFY:** None during initial creation.

**Dependencies:**
- `scripts/event-bus.js` (publish/subscribe for evolution events)
- `scripts/kernel-bridge.js` (core access patterns, safeRequire)
- `.aios-core/memory/quality-baseline.json` (current scores)
- `.aios-core/memory/anti-patterns.md` (current catalog)
- Node.js `fs`, `path`, `crypto` (built-in — no new dependencies)

**Blockers:** None.

---

## 🧠 ARCHITECTURE DECISION

### The Core Insight

The Evolution Engine is NOT an optimization tool. It is a **consciousness loop** —
the mechanism by which AIOS becomes aware of its own state and autonomously
improves it.

The key architectural decision: **the IA Council is the engine's brain**.
Every other component (audit, proposal, validation, apply, verify) is a phase
in the Council's deliberation cycle.

### Chosen Approach: Council-Centric Pipeline

```
TRIGGER (schedule | event | manual)
  │
  ▼
[1. AUDIT ENGINE] ← Council members examine independently
  │
  ▼
[2. PROPOSAL ENGINE] ← Council members propose solutions
  │
  ▼
[3. VALIDATION ENGINE] ← Council votes + convergence check
  │
  ▼
[4. APPLY ENGINE] ← Autonomous application with risk classification
  │
  ▼
[5. VERIFICATION ENGINE] ← Compare against frozen baseline
  │
  ▼
[NOTIFICATION BRIDGE] → Gabriel receives report
```

The IA Council operates across phases 1-3, with Metamind synthesizing.

### Why NOT the alternatives

**Alternative A: Single AI auditor (like self-correction.js)**
Rejected because: single-perspective audits miss structural gaps that only
emerge from tension between perspectives. Karpathy catches code quality
issues that Hassabis misses; Ng catches workflow inefficiency that Hinton ignores.
Multi-perspective is the entire value proposition.

**Alternative B: Full Metamind integration (all 65 clones)**
Rejected because: 65 perspectives on every audit cycle would be computationally
expensive and produce noise. The 7-member Council is the minimal necessary set
that covers all critical dimensions: code quality, cognition, workflow efficiency,
knowledge compression, learning loops, product vision, and architecture.

**Alternative C: Human-in-the-loop for ALL changes**
Rejected because: this defeats the purpose. Gabriel's explicit goal is to
transition from engineer to observer. The risk classification system
(LOW/MEDIUM/HIGH) provides appropriate safety without blocking autonomy.

### Trade-offs Accepted

1. **Rule-based Council simulation vs actual LLM calls:** The Council members
   are simulated via structured evaluation templates, not actual LLM API calls.
   This works for the MVP because the evaluation criteria are well-defined.
   Future: connect to actual LLM inference for deeper analysis.

2. **JSON file storage vs database:** Audit reports and proposals stored as JSON
   files in `scripts/evolution/` outputs. Acceptable for single-instance operation.
   Future: Supabase migration when AIOS scales.

3. **Dry-run as default:** All engines default to `dryRun: true`. Gabriel must
   explicitly enable live mode. This is intentionally conservative.

### Assumptions Validated
- `event-bus.js` already has `meta.evolution_proposal` and `meta.audit_complete` channels ✅
- `kernel-bridge.js` safeRequire pattern exists for graceful degradation ✅
- `quality-baseline.json` structure is established ✅
- `metamind.md` TIME MACHINE protocol defines the conceptual framework ✅

### Assumptions NOT Yet Validated
- File permissions for atomic writes on Windows (test during implementation)
- Performance of full-project file scanning on Gabriel's machine

---

## 📋 EXECUTION PLAN

### Implementation Order (MANDATORY — do not reorder)

The order follows a dependency chain: protections FIRST, then data SECOND,
then engines in pipeline order, then orchestrator, then entry point.

---

### Step 1: circuit-breaker.config.js
**Action:** Create immutable configuration defining all safety limits.
**File:** `scripts/evolution/circuit-breaker.config.js`
**Input:** None (self-contained configuration)
**Output:** Frozen config object with: forbidden components, cycle budget limits,
  max consecutive failures, risk classification thresholds.
**Key constants:**
  - `FORBIDDEN_COMPONENTS`: List of files that NEVER get modified
  - `CYCLE_BUDGET`: Max changes per layer per cycle
  - `MAX_CONSECUTIVE_FAILURES`: Stop threshold (3)
  - `RISK_CLASSIFICATION`: Rules for LOW/MEDIUM/HIGH
**Test:** `node scripts/evolution/circuit-breaker.config.js` → prints config, exits 0.

---

### Step 2: baseline-frozen.json
**Action:** Snapshot current system state as immutable anchor.
**File:** `scripts/evolution/baseline-frozen.json`
**Input:** Current file hashes of critical components
**Output:** JSON with SHA-256 hashes, file sizes, component registry,
  creation timestamp (NEVER modified after creation).
**Key design:** This file is generated ONCE by a helper in the circuit-breaker
  and then NEVER touched. All future comparisons are against THIS snapshot.
**Test:** File exists, has valid JSON, contains hashes for all critical paths.

---

### Step 3: convergence-guard.js
**Action:** Create the anti-loop protection module.
**File:** `scripts/evolution/convergence-guard.js`
**Input:** Previous cycle results, current proposal delta
**Output:** `{ converged: boolean, reason: string, metrics: object }`
**Core logic:**
  - Tracks cycle history (what was proposed and what happened)
  - Detects oscillation (A→B→A→B = LOOP)
  - Enforces minimum improvement threshold (≥5%)
  - Enforces maximum consecutive failures (3)
  - Checks for no-regression on non-target dimensions
**Test:** `node scripts/evolution/convergence-guard.js --test` → runs 3 scenarios.

---

### Step 4: ia-council-engine.js
**Action:** Create the 7-member IA Council + Metamind synthesizer.
**File:** `scripts/evolution/ia-council-engine.js`
**Input:** System state snapshot, audit context
**Output:** Per-member evaluations, synthesized verdict
**Council members (each with unique evaluation lens):**
  1. Karpathy: Code quality, engineering rigor, PR-readiness
  2. Sutskever: Cognitive architecture, reasoning patterns, compression
  3. Ng: Workflow efficiency, pipeline optimization, token waste
  4. Hinton: Knowledge distillation quality, representation density
  5. Hassabis: Learning loops, memory utilization, experience replay
  6. Pedro (creator): Vision alignment, original architecture intent
  7. Alan (creator): Product-market fit, real-world applicability
  Metamind: Synthesis, deduplication, convergence detection
**Key design:** Each member is a function that receives the same
  system state and returns structured evaluation:
  `{ gaps: [{id, description, severity, evidence, impact30d}], score: 0-10 }`
  Metamind merges, deduplicates, and produces ranked output.
**Test:** `node scripts/evolution/ia-council-engine.js --test` → Council
  evaluates a mock system state, prints all 7 evaluations + synthesis.

---

### Step 5: audit-engine.js
**Action:** Create the system examination engine (Phase 1 of cycle).
**File:** `scripts/evolution/audit-engine.js`
**Input:** Project root path, audit scope (full | targeted)
**Output:** `AUDIT_REPORT` with ranked gaps from Council
**What it examines:**
  - File structure compliance (ENGINE vs CLIENT separation)
  - Script quality (JSDoc coverage, error handling, event-bus usage)
  - Agent manifest completeness (required YAML fields)
  - Anti-pattern presence (scans for known AP patterns)
  - Golden example staleness (are examples >30 days old?)
  - Quality baseline trend (improving, stagnant, regressing?)
**Process:**
  1. Scan project files, build inventory
  2. Run lightweight static checks (regex, file existence, JSON validity)
  3. Feed results to IA Council (ia-council-engine.js)
  4. Council examines independently, Metamind synthesizes
  5. Produce ranked AUDIT_REPORT
**Test:** `node scripts/evolution/audit-engine.js --dry-run` → scans, reports.

---

### Step 6: proposal-engine.js
**Action:** Create the solution generation engine (Phase 2 of cycle).
**File:** `scripts/evolution/proposal-engine.js`
**Input:** Top 3 gaps from AUDIT_REPORT
**Output:** Array of proposals, each a mini-RP with exact diff
**For each gap:**
  - Council members propose solutions (each from their lens)
  - Each proposal includes: file path, exact change (diff), rationale,
    risk classification, expected improvement metric
  - Metamind identifies convergent vs divergent proposals
  - Output: merged proposal set with confidence scores
**Key constraint:** Proposals must be concrete diffs, not ideas.
  "Add timeout to function X in file Y, line Z" not "improve error handling."
**Test:** `node scripts/evolution/proposal-engine.js --test` → generates
  mock proposals from mock audit.

---

### Step 7: validation-engine.js
**Action:** Create the voting and convergence engine (Phase 3 of cycle).
**File:** `scripts/evolution/validation-engine.js`
**Input:** Proposals from proposal-engine
**Output:** Validated set of APPROVED proposals + convergence status
**Voting protocol:**
  Each Council member votes per proposal:
  - APPLY: "Approved — improves X without risk to Y"
  - REJECT: "Rejected — unmapped risk in Z"
  - DEFER: "Good idea, dependency W not ready"
  Tiebreaker: Pedro + Alan (creators) have minerva vote on exact ties.
**Convergence check (via convergence-guard.js):**
  - Delta improvement ≥5% in target dimension
  - No regression in non-target dimensions
  - ≥60% of Council votes APPLY
  - If convergence fails after 2 attempts → DEFERRED
**Test:** `node scripts/evolution/validation-engine.js --test`

---

### Step 8: apply-engine.js
**Action:** Create the autonomous application engine (Phase 4 of cycle).
**File:** `scripts/evolution/apply-engine.js`
**Input:** Validated proposals, dryRun flag
**Output:** Applied changes with backup or dry-run report
**Risk classification determines behavior:**
  - LOW (docs, golden examples, anti-patterns):
    Apply directly → notify Gabriel
  - MEDIUM (scripts, manifests):
    Apply to main → notify Gabriel with full diff
  - HIGH (constitutional layer, PM templates, input-refiner):
    Create branch `evolution/YYYYMMDD` → notify → 24h observation window
**Key protections:**
  - Checks circuit-breaker.config.js FIRST (forbidden components)
  - Creates backup of every file before modification
  - Respects cycle budget (max changes per layer)
  - In dry-run mode: simulates everything, applies nothing
**Test:** `node scripts/evolution/apply-engine.js --test --dry-run`

---

### Step 9: verification-engine.js
**Action:** Create the post-application verification engine (Phase 5 of cycle).
**File:** `scripts/evolution/verification-engine.js`
**Input:** Applied changes, baseline-frozen.json
**Output:** Verification report (pass/fail with evidence)
**Checks:**
  1. Syntax validation: all modified JS files parse without error
  2. Baseline comparison: no critical component hash changed unexpectedly
  3. Regression detection: run lightweight quality checks on modified files
  4. Rollback trigger: if ANY check fails → automatic rollback from backup
  5. Success confirmation: update quality-baseline.json + SELF_CONTEXT.md
**Test:** `node scripts/evolution/verification-engine.js --test`

---

### Step 10: evolution-engine.js
**Action:** Create the master orchestrator (ties all phases together).
**File:** `scripts/evolution/evolution-engine.js`
**Input:** Trigger (schedule | event | manual), options
**Output:** Complete cycle report
**ABSOLUTE RULE:** This file NEVER modifies itself. It is in the
  `FORBIDDEN_COMPONENTS` list in circuit-breaker.config.js.
**Orchestration flow:**
  1. Load circuit-breaker config
  2. Check convergence-guard (should we even start?)
  3. Run audit-engine → AUDIT_REPORT
  4. Run proposal-engine → PROPOSALS (top 3 gaps)
  5. Run validation-engine → APPROVED proposals
  6. If dryRun: report and stop. If live: continue.
  7. Run apply-engine → APPLIED changes
  8. Run verification-engine → VERIFICATION result
  9. Run notification-bridge → NOTIFY Gabriel
  10. Save cycle report to `.aios-core/data/evolution/`
**Emits:** `meta.audit_complete`, `meta.evolution_proposal` via event-bus
**Test:** `node scripts/evolution/evolution-engine.js --dry-run`

---

### Step 11: notification-bridge.js
**Action:** Create the reporting bridge for Gabriel.
**File:** `scripts/evolution/notification-bridge.js`
**Input:** Cycle report (any phase)
**Output:** Formatted notification (console + file)
**Formats:**
  - Console: colored summary with emoji
  - File: JSON report saved to `.aios-core/data/evolution/reports/`
  - Future: WhatsApp/Telegram push via existing bridges
**Test:** `node scripts/evolution/notification-bridge.js --test`

---

### Step 12: run-evolution-cycle.js
**Action:** Create the single entry point for running evolution cycles.
**File:** `scripts/run-evolution-cycle.js`
**Input:** CLI flags: `--dry-run` (default), `--live`, `--scope full|targeted`
**Output:** Full cycle execution report
**Usage:**
  ```
  node scripts/run-evolution-cycle.js --dry-run     # Safe: audit + propose + report
  node scripts/run-evolution-cycle.js --live         # Full: audit + propose + apply + verify
  node scripts/run-evolution-cycle.js --scope targeted --focus scripts/
  ```
**Test:** `node scripts/run-evolution-cycle.js --dry-run` → must complete
  without errors and produce the first AUDIT_REPORT.

---

### Integration Step
**How the 12 files connect:**
```
run-evolution-cycle.js (entry point, CLI)
  └── evolution-engine.js (orchestrator)
        ├── circuit-breaker.config.js (loaded first, always)
        ├── convergence-guard.js (checked before starting)
        ├── ia-council-engine.js (used by audit, proposal, validation)
        ├── audit-engine.js (Phase 1)
        ├── proposal-engine.js (Phase 2)
        ├── validation-engine.js (Phase 3)
        ├── apply-engine.js (Phase 4)
        ├── verification-engine.js (Phase 5)
        ├── notification-bridge.js (reporting)
        └── baseline-frozen.json (immutable anchor)
```
**Event-bus channels used:**
  - `meta.audit_complete` — emitted after Phase 1
  - `meta.evolution_proposal` — emitted after Phase 2
  - `system.evolution_applied` — emitted after Phase 4 (NEW channel)
  - `system.evolution_verified` — emitted after Phase 5 (NEW channel)

---

## ⚠️ EDGE CASES (MANDATORY — all must be handled)

### EC-01: Loop Detection
**Scenario:** Council proposes change A→B, next cycle proposes B→A, creating
  infinite oscillation.
**Impact if ignored:** System wastes cycles doing/undoing the same change forever.
**Required solution:** `convergence-guard.js` maintains a rolling history of
  the last 10 proposals. If a proposal's target file + direction matches a
  previous proposal that was later reverted, flag as OSCILLATION and block.
  Detection: hash the (file, change_type) tuple and check against history.

### EC-02: Rollback Failure
**Scenario:** Verification engine detects regression, triggers rollback,
  but backup file is corrupted or missing.
**Impact if ignored:** System stuck in degraded state with no way back.
**Required solution:** `apply-engine.js` creates backups in TWO locations:
  1. `.aios-core/data/evolution/backups/[timestamp]/` (primary)
  2. In-memory copy (secondary, for current session)
  Before applying any change, verify backup integrity (file exists, size > 0).
  If backup verification fails, abort the entire apply phase.

### EC-03: Council Deadlock
**Scenario:** Exact 3-3 tie with 1 DEFER, or 3-3-1 split on a proposal.
**Impact if ignored:** No decision made, cycle stalls.
**Required solution:** `validation-engine.js` implements tiebreaker:
  1. Check if Pedro (Chair 6) and Alan (Chair 7) agree → their vote wins.
  2. If Pedro and Alan also split → DEFER the proposal to next cycle.
  3. If deadlocked for 2 consecutive cycles → escalate to Gabriel.

### EC-04: Technically Impossible Proposal
**Scenario:** Council approves "refactor kernel-bridge.js to use ES modules"
  but the rest of the project uses CommonJS.
**Impact if ignored:** Applied change breaks the entire system.
**Required solution:** `apply-engine.js` runs a pre-application sanity check:
  1. Syntax validation: `require('vm').compileFunction(code)` for JS files
  2. Import resolution: check that all required modules exist
  3. If either fails → reject proposal with `INFEASIBLE` status, notify Council.

### EC-05: Baseline Drift
**Scenario:** After 6 months, `baseline-frozen.json` reflects a system state
  so different from current that comparisons are meaningless.
**Impact if ignored:** Verification engine always reports "regression" or
  always reports "improvement" — both wrong.
**Required solution:** `verification-engine.js` tracks the delta between
  baseline and current. If >40% of component hashes differ, flag as
  `BASELINE_DRIFT` and notify Gabriel to consider a baseline refresh.
  The system NEVER auto-refreshes the baseline — that requires human decision.

### EC-06: Self-Modification Attempt
**Scenario:** Council proposes modifying `evolution-engine.js`, or
  `circuit-breaker.config.js`, or `baseline-frozen.json`.
**Impact if ignored:** The system disables its own safety controls.
**Required solution:** `apply-engine.js` checks EVERY proposal target against
  `FORBIDDEN_COMPONENTS` in circuit-breaker config. If ANY match:
  1. Reject immediately (not sent to Council — pre-validation)
  2. Log as SECURITY_VIOLATION
  3. Notify Gabriel with full details
  4. The cycle continues with remaining proposals.

---

## ✅ QUALITY GATE

- [ ] All 12 files created with complete implementations (zero placeholders)
- [ ] `circuit-breaker.config.js` created FIRST with frozen config
- [ ] `baseline-frozen.json` created SECOND with real system hashes
- [ ] `convergence-guard.js` created THIRD (anti-loop before anything else)
- [ ] All 6 EC edge cases have explicit handlers in the appropriate engines
- [ ] `evolution-engine.js` is in FORBIDDEN_COMPONENTS list
- [ ] `circuit-breaker.config.js` is in FORBIDDEN_COMPONENTS list
- [ ] `baseline-frozen.json` is in FORBIDDEN_COMPONENTS list
- [ ] `dryRun: true` is the default in ALL engines
- [ ] Event-bus emits on `meta.audit_complete` and `meta.evolution_proposal`
- [ ] `node scripts/run-evolution-cycle.js --dry-run` completes without errors
- [ ] First AUDIT_REPORT generated showing what Council found
- [ ] Zero references to clinic/patient/WhatsApp in any evolution file (AP-001)
- [ ] All file paths use absolute imports
- [ ] All functions have JSDoc with @purpose, @inputs, @outputs, @emits
- [ ] Constitution v3.0 compliance verified (domain-agnostic, no contamination)

---

## 🚫 WHAT NOT TO DO (Anti-Patterns for this task)

- DO NOT make the Council members just return random scores. Each member
  must have a DISTINCT evaluation function that checks different things.
  Karpathy checks code quality; Ng checks workflow efficiency. They are
  NOT interchangeable.

- DO NOT skip the convergence guard. It MUST be created before any engine
  that proposes or applies changes. Order matters.

- DO NOT make `evolution-engine.js` accept modifications to itself. This is
  the single most critical safety rule. Test it explicitly.

- DO NOT use `eval()` or `new Function()` anywhere. Proposals contain diffs,
  not executable code.

- DO NOT reference any Experia/client-specific concepts. The Evolution Engine
  is a pure engine component. (AP-001)

- DO NOT make the dry-run mode optional or hard to use. It MUST be the default.
  `--live` requires explicit opt-in.

---

## 📦 GEMINI EXECUTION DIRECTIVE

You are receiving a fully analyzed specification. Your role is EXECUTION, not design.

EXECUTE the Execution Plan above in the exact order specified (Steps 1-12).
IMPLEMENT every Edge Case handler explicitly — no exceptions.
VALIDATE against the Quality Gate before delivering any file.
DO NOT invent features not in this spec.
DO NOT simplify Edge Cases — each one exists for a production reason.

If you encounter genuine ambiguity in the spec, STOP and list exactly
what is ambiguous. Do not guess.

**Deliver:**
1. 12 files in `scripts/evolution/` and `scripts/run-evolution-cycle.js`
2. First AUDIT_REPORT from the IA Council
3. Successful `--dry-run` output
4. Evolution Engine Report with activation instructions
