# AIOX Anti-Patterns Catalog
> Updated: 2026-02-18 | Grows with each session via PM3 Session Signal

---

## AP-001: Domain Contamination in Engine Files

**Pattern:** Referencing specific client domains (clinics, patients, scheduling, WhatsApp) in engine-level files.

**Why it happens:** The first client (Experia) is the most familiar context. Under time pressure, domain-specific logic leaks into engine code.

**Consequence:** Engine becomes unusable for other clients. Logistics company sees "patient scheduling" in kernel code. Destroys the universal value proposition.

**Prevention:** Before creating any engine-level file, search for these words: patient, clinic, appointment, scheduling, WhatsApp, Evolution API. If found → it belongs in `clients/experia/` or `squads/experia/`, not in the engine.

---

## AP-002: Silent External API Failure

**Pattern:** Calling external APIs (Evolution, OpenAI, Supabase, etc.) without timeout or error type detection.

**Why it happens:** The happy path works in development. Network issues only surface in production.

**Consequence:** Message received, no response sent, user abandoned. No log, no alert.

**Prevention:**
```javascript
// EVERY external call must follow this pattern
async function callExternalAPI(endpoint, payload, label) {
  const TIMEOUT_MS = 30000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!response.ok) {
      throw new Error(`${label}_ERROR: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error(`${label}_TIMEOUT: ${TIMEOUT_MS}ms exceeded — queued for retry`);
    }
    throw err;
  }
}
```

---

## AP-003: Monolithic Intent Handler

**Pattern:** Single function that receives input, classifies it, AND acts on it.

**Why it happens:** Feels efficient. Everything in one place.

**Consequence:** Impossible to test classification independently. Impossible to change one without touching the other. Violates Agent Authority.

**Prevention:** Always separate classification from action.
```
classifyIntent(message) → IntentResult
routeIntent(IntentResult) → AgentAction
executeAction(AgentAction) → Response
```

---

## AP-004: Missing Session State

**Pattern:** Treating every message as independent when multi-turn context is required.

**Why it happens:** Easier to implement. Input → classify → reply feels complete.

**Consequence:** Multi-step workflows break. User continues a conversation and system doesn't know it's a continuation. Returns generic response.

**Prevention:** Every message handler must check session state first. Session state is a prerequisite for accurate intent classification, not an enhancement.

---

## AP-005: Hardcoded Configuration

**Pattern:** Embedding configuration values directly in multiple functions instead of a single source of truth.

**Why it happens:** DRY principle not applied under time pressure.

**Consequence:** Changing a value requires hunting and updating multiple locations. Inconsistencies guaranteed.

**Prevention:** Single constants object at module top, all functions reference it. Better yet: external config file loaded once.

---

## AP-006: Race Condition Ignored

**Pattern:** Check-then-act without re-checking inside the transaction.

**Why it happens:** Testing is synchronous. Race conditions only appear under concurrent load.

**Consequence:** Two operations claim the same resource simultaneously. Data integrity violated.

**Prevention:** Re-check availability inside the mutation function. Never trust a status check that happened before the transaction.
