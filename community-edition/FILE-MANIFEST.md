# Community Edition — File Manifest & Sanitization Checklist

> **Purpose:** Track which files go into the PR and what sanitization is needed.
> **Status:** 🔄 In Progress

---

## PR Structure

The PR will add files to the existing AIOX v4.2.13 repo in these locations:

```
aiox/                                    # AIOX root
├── .aiox-core/opus-replicator/          # NEW: 17 files (Opus Replicant Engine)
├── scripts/evolution/                   # NEW: 17 files (Evolution Engine)
├── scripts/mcp-server.js               # NEW: MCP Server
├── scripts/tools-bridge.js             # NEW: Tools Bridge
├── reasoning-packages/INDEX.md         # NEW: RP System template
└── community-edition/PR-README.md      # NEW: This contribution's README
```

---

## File Checklist

### Bundle 1: Opus Replicant Engine (.aiox-core/opus-replicator/)

|   #   | File                              | Sanitize? | Notes                                                                                                                    |
| :---: | :-------------------------------- | :-------: | :----------------------------------------------------------------------------------------------------------------------- |
|   1   | `OPUS-REPLICANT-SYSTEM-v2.md`     |  ⚠️ MINOR  | Line 6: remove "Projeto AIOX (178 agentes...)" → generic. Line 474: change `agent: 'experia-copy'` → `agent: 'my-agent'` |
|   2   | `IMPLEMENTATION-GUIDE-QUICK.md`   |  ⚠️ MINOR  | Check for domain-specific examples (scheduling, clinical)                                                                |
|   3   | `constitutional-layer-v3.md`      |  ✅ Clean  | Universal guardrails                                                                                                     |
|   4   | `constitutional-layer.md`         |  ✅ Clean  | v2 reference                                                                                                             |
|   5   | `pm1-reasoning.md`                |  ✅ Clean  | Universal protocol                                                                                                       |
|   6   | `pm1-reasoning-master.md`         |  ✅ Clean  | Master definition                                                                                                        |
|   7   | `pm2-execution.md`                |  ✅ Clean  | Universal protocol                                                                                                       |
|   8   | `pm2-execution-master.md`         |  ✅ Clean  | Master definition                                                                                                        |
|   9   | `pm3-evaluation.md`               |  ✅ Clean  | Universal protocol                                                                                                       |
|  10   | `pm3-quality-master.md`           |  ✅ Clean  | Master definition                                                                                                        |
|  11   | `calibration-profiles.json`       |  ✅ Clean  | Model calibration data                                                                                                   |
|  12   | `session-protocol.md`             |  ✅ Clean  | Session management                                                                                                       |
|  13   | `GEM_MODE_ACTIVATION.md`          |  ✅ Clean  | Activation prompt                                                                                                        |
|  14   | `distillation-readme.md`          |  ✅ Clean  | Guide                                                                                                                    |
|  15   | `distillation-setup.md`           |  ✅ Clean  | Setup                                                                                                                    |
|  16   | `hivemind-brainstorm.md`          |  ✅ Clean  | Multi-agent brainstorming                                                                                                |
|  17   | `metamind-evolution-blueprint.md` |  ✅ Clean  | Evolution blueprint                                                                                                      |

**DO NOT include:** `SELF_CONTEXT.md` (operator-specific), `README.md` (KAIROS-specific)

---

### Bundle 2: Evolution Engine (scripts/evolution/)

|   #   | File                        | Sanitize? | Notes                                                                                                                          |
| :---: | :-------------------------- | :-------: | :----------------------------------------------------------------------------------------------------------------------------- |
|   1   | `evolution-engine.js`       |  ⚠️ MINOR  | Remove hardcoded paths if any reference KAIROS                                                                                 |
|   2   | `cognitive-state-engine.js` |  ⚠️ MINOR  | Check for operator-specific defaults                                                                                           |
|   3   | `ia-council-engine.js`      |   ⚠️ YES   | Remove Chair 7 (Alan Nicolas) references. Remove specific `detectorExclusions` for KAIROS files. Reset to generic chair names. |
|   4   | `noesis-pipeline.js`        |  ✅ Clean  | Generic quality pipeline                                                                                                       |
|   5   | `metacognition-layer.js`    |  ✅ Clean  | Generic analysis                                                                                                               |
|   6   | `proposal-engine.js`        |  ✅ Clean  | Generic proposal generation                                                                                                    |
|   7   | `apply-engine.js`           |  ✅ Clean  | Generic apply logic                                                                                                            |
|   8   | `audit-engine.js`           |  ✅ Clean  | Generic health audit                                                                                                           |
|   9   | `validation-engine.js`      |  ✅ Clean  | Generic validation                                                                                                             |
|  10   | `verification-engine.js`    |  ✅ Clean  | Generic verification                                                                                                           |
|  11   | `convergence-guard.js`      |  ✅ Clean  | Generic loop prevention                                                                                                        |
|  12   | `circuit-breaker.config.js` |   ⚠️ YES   | Remove KAIROS-specific file paths. Replace with generic example paths.                                                         |
|  13   | `notification-bridge.js`    |  ✅ Clean  | Generic notifications                                                                                                          |
|  14   | `generate-context.js`       |  ⚠️ MINOR  | Check for KAIROS-specific source paths                                                                                         |
|  15   | `noesis-status.js`          |  ⚠️ MINOR  | Check for KAIROS-specific paths                                                                                                |
|  16   | `domain-words.config.json`  |   ⚠️ YES   | Remove Experia-specific domain words. Replace with generic examples.                                                           |
|  17   | `baseline-frozen.json`      |   ⚠️ YES   | Reset to generic baseline (no KAIROS-specific data)                                                                            |

---

### Bundle 3: MCP Server + Tools Bridge (scripts/)

|   #   | File              | Sanitize? | Notes           |
| :---: | :---------------- | :-------: | :-------------- |
|   1   | `mcp-server.js`   |  ✅ Clean  | Already generic |
|   2   | `tools-bridge.js` |  ✅ Clean  | Already generic |

---

### Bundle 4: RP System (reasoning-packages/)

|   #   | File       | Sanitize? | Notes                                                                                    |
| :---: | :--------- | :-------: | :--------------------------------------------------------------------------------------- |
|   1   | `INDEX.md` |   ⚠️ YES   | Remove all KAIROS RP entries. Keep only the template structure with 1-2 example entries. |

---

## Sanitization Summary

| Action                    | Count  |
| :------------------------ | :----: |
| Clean (no changes needed) |   26   |
| Minor sanitization        |   7    |
| Full sanitization         |   5    |
| **Total files in PR**     | **38** |

---

## Pre-PR Checklist

- [ ] Fork AIOX v4.2.13 on GitHub
- [ ] Create branch `feat/opus-replicant-engine`
- [ ] Run sanitization on 12 flagged files
- [ ] Copy 38 files to PR branch
- [ ] Verify `npm test` passes (no broken imports)
- [ ] Verify `node scripts/mcp-server.js --self-test` passes (7/7)
- [ ] Write PR description from `PR-README.md`
- [ ] Submit PR
