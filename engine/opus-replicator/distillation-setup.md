# Cognitive Distillation Setup Guide

> **Status:** Infrastructure Ready. Waiting for Opus 4.6 Activation.
> **Objective:** Fill the `golden-examples/` directories with high-fidelity reasoning traces.

---

## 🏗️ INFRASTRUCTURE MAP

1.  **Golden Data Store:** `.aiox-core/memory/golden-examples/`
    - `/reasoning`: For complex analysis & strategy (PM#1)
    - `/execution`: For code, content, & specs (PM#2)
    - `/evaluation`: For self-correction & grading (PM#3)

2.  **Injection Slot:**
    - Prompt Masters have been updated with `{{GOLDEN_EXAMPLES}}` placeholders.
    - This allows the system to inject relevant Opus 4.6 traces into Gemini's context.

---

## 🚀 ACTIVATION PROTOCOL (When Opus 4.6 is Online)

### Step 1: Generate the "Seed Set" (5 Examples)

Use Opus 4.6 to solve these 5 diverse tasks. Save the FULL output (reasoning + result) to the corresponding folder.

**Task 1: Deep Architecture (Reasoning)**
> "Analyze the AIOX file system structure and propose a 3-phase refactoring plan for maximum modularity, citing Torvalds' principles."
> *Save to:* `golden-examples/reasoning/001-architecture-refactor.md`

**Task 2: Viral Copywriting (Execution)**
> "Write a landing page hero section for 'ExperiaAI' using Hormozi's Grand Slam Offer framework. Explain your creative choices."
> *Save to:* `golden-examples/execution/001-viral-copy.md`

**Task 3: Production Code (Execution)**
> "Write a TypeScript 'CircuitBreaker' class with exponential backoff. Explain the error handling logic."
> *Save to:* `golden-examples/execution/002-circuit-breaker.md`

**Task 4: Strategic Evaluation (Evaluation)**
> "Critique this drafted email [insert bad email] against Cialdini's principles. Grade it 1-10."
> *Save to:* `golden-examples/evaluation/001-email-critique.md`

**Task 5: Self-Improvement (Reasoning)**
> "Analyze the last 3 session snapshots. Identify the top pattern of failure and propose a Constitution amendment to fix it."
> *Save to:* `golden-examples/reasoning/002-meta-analysis.md`

### Step 2: Verify Injection

1.  Open `pm1-reasoning.md`.
2.  Manually paste the content of `golden-examples/reasoning/001-architecture-refactor.md` into the `{{GOLDEN_EXAMPLES}}` slot.
3.  Run a new task with Gemini.
4.  **Success Condition:** Gemini adopts Opus's formatting, depth, and tone *automatically*.

---

## 🔄 AUTOMATIC HARVEST PROTOCOL (Karpathy Patch)
> *"Software 2.0 is about curating data, not writing code."*

1.  **Trigger:** Whenever the user rates an output 10/10 (e.g., "Perfect," "Great job").
2.  **Action:** The system automatically executes `scripts/harvest-gold.js`.
3.  **Process:**
    - Extracts the prompt + reasoning + final output.
    - Scrubs PII (Project IDs, User Names).
    - Formats into the **Compressed Thought Schema** (below).
    - Saves to `golden-examples/auto-harvested/`.

## 🧠 COMPRESSED THOUGHT SCHEMA (Sutskever Patch)
> *"Prediction is compression. Store the Insight, not the Fluff."*

When saving Golden Examples manually or automatically, use this schema:

```markdown
<trace>
Problem: [Dense, 1-sentence description of the core difficulty]
Insight: [The key pivot that solved it - the "Aha!" moment]
Reasoning: [Step-by-step logic, stripped of conversational fluff]
Solution: [The final output]
</trace>
```

**Why?** This maximizes "Insight Density" per token injected into Gemini.

---

## 🔄 MAINTENANCE

- **Weekly:** Review `golden-examples/auto-harvested/`. Promote the best to `reasoning/`, `execution/`, or `evaluation/`.
- **Monthly:** Prune examples that are no longer generating Wins.
