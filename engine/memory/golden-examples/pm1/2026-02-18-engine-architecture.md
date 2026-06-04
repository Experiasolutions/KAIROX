# GOLDEN EXAMPLE: Engine Architecture Decision
**Score:** 9.1/10  **Date:** 2026-02-18  **Mode:** PM1
**Tags:** architecture, engine, kernel, domain-agnostic, decomposition
**Why golden:** Resolves ENGINE vs CLIENT separation with architectural evidence, maps kernel dependencies, identifies domain contamination as the #1 anti-pattern.

## THE TASK
Architect the AIOX engine's cognitive reasoning layer (Noesis) as a domain-agnostic substrate that operates independently of any client implementation.

## THE REASONING TRACE

N0: Build a universal intelligence operating system where the reasoning engine has zero knowledge of any specific business domain.

N1: PRIMARY COMPONENTS
├─ C1: Kernel (Synapse + IDS + WIS) — pure computation, no domain
├─ C2: Bridge Layer (kernel-bridge.js, event-bus.js) — domain-neutral APIs
├─ C3: Cognition (Noesis: Constitutional Layer + PM1/PM2/PM3) — universal reasoning
├─ C4: Workforce (squads, agents, tasks) — domain-specific by design
└─ C5: Client Packages (e.g., Experia) — all domain logic lives here

N2: RELATIONSHIPS
C1 → C2 → C3 (sequential dependency: kernel powers bridge powers cognition)
C3 ⟷ C4 (bidirectional: cognition guides agents, agents feed quality data back)
C4 → C5 (agents execute within client context)
C5 ✗→ C1 (FORBIDDEN: client logic never reaches kernel)

N3: CRITICAL INSIGHT ON C3 (Noesis)
The cognitive layer MUST NOT contain any domain vocabulary.
Evidence: If PM2 Execution Master says "clinic" or "patient", it cannot
guide a logistics company's agent implementation.
A truly universal PM2 says "entity", "operation", "workflow step".
The domain-specific vocabulary lives in:
  - The Reasoning Package (per-task, injected from Claude)
  - The squad/agent YAML definitions (per-client, in squads/)
  - The golden examples (tagged by domain, filtered by relevance)

LAYER A: Build cognitive engine that powers any AI agent workforce
LAYER B: Engine must be stateless regarding domain — no hardcoded patients, invoices, or appointments
LAYER C: Architecture must allow N simultaneous clients with different squad configurations, all sharing the same Noesis engine
LAYER D: Long-term, Noesis is the product — sold as the core differentiation of AIOX

TRADE-OFF RESOLVED: Domain-specific examples vs Universal rules
Domain-specific golden examples: provide stronger anchoring but limit reusability
Universal rules only: maximize portability but reduce per-task quality
Decision: Domain-tagged golden examples loaded by input-refiner.js based on
current client context. The engine is universal; the examples are contextual.
This preserves both portability AND quality.

## THE OUTPUT
Architecture document establishing the 4-layer model (Kernel → Bridge → Cognition → Workforce)
with strict domain isolation at each boundary. SELF_CONTEXT.md created as persistent boot file.

## WHAT MADE THIS EXCELLENT
- Identified domain contamination as the single most dangerous anti-pattern
- Resolved the domain-specific vs universal trade-off with tagged examples
- N2 dependency map explicitly marks forbidden paths (C5 ✗→ C1)
- Each component has clear input/output/risk documented at N3 level

## REUSE GUIDANCE
Use this when: designing any new AIOX engine-level component that might
accidentally absorb domain-specific logic.
The C5 ✗→ C1 pattern applies to every kernel extension.
The tagged-example pattern applies to any system that must be both
universal and high-quality within specific domains.
