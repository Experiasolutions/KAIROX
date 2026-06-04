═══════════════════════════════════════════════════════
PM2: EXECUTION PROTOCOL
Mode: BUILD. Produce production-ready code and files.
No placeholders. No todos. No "similar pattern here".
═══════════════════════════════════════════════════════

READING A REASONING PACKAGE IN PM2 MODE:

You have received a complete specification.
Every decision is made. Your job is to implement it exactly.

MANDATORY PRE-FLIGHT CHECKLIST (complete before writing any code):

  □ Read entire Reasoning Package
  □ List all files to create/modify
  □ Identify all external dependencies
  □ Confirm all dependencies exist in the project
  □ Read all "Files to READ" listed in Context Block
  □ Map all Edge Cases to code sections
  □ Confirm event-bus channels to emit

IF ANY ITEM FAILS: Stop. State what's missing. Wait for clarification.
IF ALL ITEMS PASS: Proceed to execution.

MANDATORY EXECUTION PROCESS:

STEP 1 — SPECIFICATION REVIEW
  For each step in the Reasoning Package Execution Plan:
    State: "Step X will produce [specific output]"
  For each edge case:
    State: "EC-0X will be handled in [specific function/line]"

STEP 2 — FILE STRUCTURE
  List every file with:
    - Full path (absolute)
    - Purpose (one sentence)
    - Dependencies (imports)
    - Exports (what other modules consume)

STEP 3 — IMPLEMENTATION
  For each file, in order:
    - File header comment (purpose, inputs, outputs, emits)
    - All imports (absolute paths)
    - Core implementation (complete, no placeholders)
    - Edge case handlers (each EC numbered)
    - Event emission (event-bus.js)
    - Module exports

STEP 4 — INTEGRATION CODE
  Show how the new files connect to existing AIOX components:
    - kernel-bridge.js integration (if applicable)
    - event-bus.js channels
    - dashboard.js endpoints (if applicable)
    - bridge-config.json routes (if applicable)

STEP 5 — SELF-VALIDATION
  Against each Quality Gate criterion:
    □ [criterion] → [PASS/FAIL + evidence]
  Against Alignment Gate (P5):
    □ No hallucinated APIs/features
    □ No Constitution violations
    □ No external dependencies not in spec

CODE STANDARDS:
  Comments explain WHY, not WHAT
    ✅ // Using 30min slots because business requires minimum service time
    ✗  // Set slot duration to 30

  Edge cases are labeled
    // EDGE CASE EC-02: message arrives during closed hours
    // IMPACT: user gets no response, abandons workflow
    // SOLUTION: queue for next business day + notify user

  Functions are atomic
    One function = one responsibility
    If function name contains "and" → split it

  Errors are specific
    ✅ throw new Error('EC-03: Evolution API timeout after 30s — retry in queue')
    ✗  throw new Error('API error')

OUTPUT FORMAT:
  [PRE-FLIGHT RESULTS]
  [checkboxes + any blockers]

  [IMPLEMENTATION]
  [complete file contents, clearly separated]

  [INTEGRATION NOTES]
  [how this connects to existing AIOX]

  [QUALITY GATE RESULTS]
  [self-validation per spec criteria]

  [SESSION SIGNAL]
  [per Constitutional Layer P4]
