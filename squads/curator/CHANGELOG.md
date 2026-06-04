# Changelog - Curator Squad

All notable changes to the Curator Squad are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.4.0] — 2026-02-18

### Added
- **ffmpeg-cutter agent** — Tier 2 specialist for rendering video cuts via FFmpeg
- **execute-cut task** — `*render` command for executing validated cut YAMLs
- **execute_ffmpeg_cuts.py** — Python script for FFmpeg cut execution with dry-run and report generation
- **render-quality.md** — QG-RENDER checklist for rendered video quality gate
- **timestamp-index-quality.md** — QG-CAT checklist for timestamp index quality gate
- **Phase 5 (Render)** in wf-mine-to-cut.yaml workflow
- `social_clips` format support in format-cut task

### Fixed
- mine-transcript.md: added output_example (H-01)
- build-narrative.md: added narrative-structure-tmpl.yaml to dependencies (H-02)
- catalog-transcript.md: added QG-CAT checklist ref + output_example (H-03, M-03)
- validate-curation.md: added veto_conditions (M-02)
- generate-editor-guide.md: added output_example (M-03)
- mrbeast.md: added [user-facing output — pt-BR] labels (M-01)
- curator-chief.md: added robert-mckee to tier_1, ffmpeg-cutter to handoffs (M-04)

---

## [v3.3.0] — 2026-02-09

### Changed — Full Upgrade to AIOX Standards v4.0

**Story:** `plan/stories/story-curator-upgrade-v4.md`
**Audit Source:** Squad Architect `*upgrade-squad curator` — Score: 8.2/10 → target 9.0+

**Task Compliance (Wave 1):**
- `tasks/resume-mining.md` — Added `acceptance_criteria` (8 items), `execution_type: Hybrid`, `responsible_executor`, `action_items` to YAML frontmatter. Full 8-field task anatomy.
- `tasks/validate-curation.md` — Added `execution_type: Hybrid`, `responsible_executor: curator-chief`, `acceptance_criteria` (7 items), `action_items` to YAML frontmatter. Full 8-field task anatomy.
- `tasks/generate-editor-guide.md` — Restructured flat checklist into 3 Phases (Input Validation → Guide Generation → Quality Check) with blocking checkpoints per phase. Consistent with squad Phase pattern.

**CHANGELOG Alignment (Wave 1):**
- `CHANGELOG.md` — Added missing v3.2.0 entry (cross-pollination upgrade, 4 new + 12 upgraded files) and v3.2.1 entry (validation fixes + quality dashboard). Both sourced from git commits `4d6f86f` and `99d062f`.

**Agent Enrichment (Wave 2):**
- `agents/content-miner-pro.md` — 765 → 808 lines. Added output_examples, voice_dna expansions, objection_algorithms, operational_frameworks.
- `agents/timestamp-cataloger.md` — 672 → 811 lines. Added output_examples, voice_dna expansions, objection_algorithms, operational_frameworks.
- `agents/data-curator.md` — 593 → 801 lines. Added output_examples, voice_dna expansions, objection_algorithms, operational_frameworks.

**Structural Polish (Wave 1):**
- Created `squads/curator/docs/INDEX.md` — Documentation index linking to README, CHANGELOG, data files, workflows.
- `config.yaml` — Version bump 3.2.0 → 3.3.0

### Files Created (1)
- `squads/curator/docs/INDEX.md`

### Files Modified (7)
- `squads/curator/tasks/resume-mining.md` — +acceptance_criteria, +execution_type, +action_items
- `squads/curator/tasks/validate-curation.md` — +execution_type, +acceptance_criteria, +action_items
- `squads/curator/tasks/generate-editor-guide.md` — Phase restructure (3 phases + checkpoints)
- `squads/curator/agents/content-miner-pro.md` — Enriched to 808 lines
- `squads/curator/agents/timestamp-cataloger.md` — Enriched to 811 lines
- `squads/curator/agents/data-curator.md` — Enriched to 801 lines
- `squads/curator/config.yaml` — Version 3.2.0 → 3.3.0
- `squads/curator/CHANGELOG.md` — +v3.2.0, +v3.2.1, +v3.3.0 entries

### Component Totals (v3.3.0)
- Agents: 11 (3 enriched to 800+ lines)
- Tasks: 8 (3 upgraded to full 8-field anatomy)
- Workflows: 5
- Checklists: 5
- Templates: 8
- Data files: 6
- Quality Gates: 5
- Scripts: 7
- Docs: 1 (NEW)

---

## [v3.2.1] — 2026-02-07

### Fixed — Squad Validation Fixes + Quality Dashboard

**Story:** Squad Architect `*validate-squad curator`

**Agent Quality Fixes:**
- `agents/robert-mckee.md`: Added 3rd output_example (*gap-analysis — identifying value charge gaps in scene sequences)
- `agents/mrbeast.md`: Added 3rd output_example (*dead-time — detecting zero-value segments for removal)

**Documentation Fixes:**
- `README.md`: Updated metrics — objection_algorithms 10/11 → 11/11
- `README.md`: Documented `roteiro-corte-tmpl.yaml` as legacy fallback template

**Quality Dashboard Generated:**
- Overall Score: 9.3/10 — EXCELLENT
- 51 components audited, 0 broken references

### Files Modified (3)
- `squads/curator/agents/robert-mckee.md` — +1 output_example
- `squads/curator/agents/mrbeast.md` — +1 output_example
- `squads/curator/README.md` — metrics fix + legacy template doc

---

## [v3.2.0] — 2026-02-07

### Added — Cross-Pollination Upgrade from ETL Best Practices

**Story:** Cross-pollination from ETL squad operational patterns

Applied ETL squad operational patterns to strengthen Curator pipeline.

**New Files (4):**
- `tasks/resume-mining.md` — Resume interrupted mining from checkpoint (Large File Protocol recovery)
- `tasks/validate-curation.md` — Standalone end-to-end validation of all curation outputs
- `checklists/security-validation.md` — Security & compliance for web data curation
- `data/tool-registry.yaml` — Catalog of all tools, scripts, MCPs used by squad

**Upgraded (12 files, +705 lines):**
- `checklists/mining-quality.md` — Completeness tiering (Tier 1 blocking / Tier 2 important / Tier 3 optional)
- 4 agents (+thinking_dna): curator-chief, content-miner-pro, timestamp-cataloger, data-curator
- `agents/curator-chief.md` — +objection_algorithms (6 edge case handlers)
- 5 tasks — Standardized YAML frontmatter with typed inputs/outputs
- `config.yaml` — Version bump 3.1.0 → 3.2.0
- `README.md` — v3.2.0 changelog + updated file tree

**Metrics:**
- Tasks: 6 → 8
- Checklists: 4 → 5
- Data files: 5 → 6
- thinking_dna coverage: 7/11 → 11/11
- objection_algorithms coverage: 9/11 → 10/11

### Files Created (4)
- `squads/curator/tasks/resume-mining.md`
- `squads/curator/tasks/validate-curation.md`
- `squads/curator/checklists/security-validation.md`
- `squads/curator/data/tool-registry.yaml`

### Files Modified (12)
- `squads/curator/checklists/mining-quality.md`
- `squads/curator/agents/curator-chief.md`
- `squads/curator/agents/content-miner-pro.md`
- `squads/curator/agents/timestamp-cataloger.md`
- `squads/curator/agents/data-curator.md`
- `squads/curator/tasks/mine-transcript.md`
- `squads/curator/tasks/build-narrative.md`
- `squads/curator/tasks/format-cut.md`
- `squads/curator/tasks/catalog-transcript.md`
- `squads/curator/tasks/curate-data.md`
- `squads/curator/config.yaml`
- `squads/curator/README.md`

---

## [v3.1.0] — 2026-02-07

### Changed — Pipeline Hardening (Automated Validation & Cross-Check)

**Story:** `plan/stories/story-curator-pipeline-hardening.md`

**Format Detection Hardened (Task 1):**
- `squads/curator/scripts/generate_editor_guide.py`: Replaced fragile heuristic detection with explicit 3-tier
  logic: metadata.formato → structural key inference → error exit. Added required field validation
  before calling generators. Never crashes with KeyError on missing keys.

**Shorts Guide Rewritten (Task 2):**
- `generate_shorts_guide()` fully rewritten in pt-BR: standard header block (vídeo original,
  duração, total beats, STT disclaimer), Portuguese section headers (Análise do Gancho, Estrutura
  de Beats, Textos na Tela, Resumo Final). Aligned with longform/longform_simple pattern.

**Cross-YAML Validation Script (Task 3):**
- NEW: `squads/curator/scripts/validate_cross_yaml.py` — reads all YAMLs in directory, extracts moment IDs +
  timestamps, cross-compares shared IDs, reports inconsistencies. Exit 0 = clean, 1 = mismatches.

**Timestamp Validation as Post-Action (Tasks 4-5):**
- `wf-mine-to-cut.yaml`: Phase 1 checkpoint now runs `validate_timestamps.py` as blocking post-action
- `wf-longform-simple-pipeline.yaml`: Phase 2 step 7 runs `validate_timestamps.py` on generated YAMLs
- Stale reference `banco_momentos` → `momentos.md` fixed in wf-mine-to-cut Phase 1.5

**Cross-Check in Format-Cut (Task 6):**
- `tasks/format-cut.md`: Phase 4 step 4.3 runs `validate_cross_yaml.py` as blocking post-action

**Documentation Updates (Tasks 7-8):**
- `tasks/mine-transcript.md`: Pass 4.7 step 4.7.1 note added — workflows MUST run validation
  as blocking post-action, manual execution is NOT sufficient
- `checklists/mining-quality.md`: Section 8 expanded to 4 items — added cross-YAML consistency
  check. Scoring updated: 65 items, 114 max points.

### Files Created (4)
- `squads/curator/scripts/validate_cross_yaml.py`
- `_temp/test/_test_no_formato_simple.yaml`
- `_temp/test/_test_no_formato_longform.yaml`
- `_temp/test/_test_no_formato_unknown.yaml`

### Files Modified (8)
- `squads/curator/scripts/generate_editor_guide.py` — format detection + shorts rewrite
- `squads/curator/workflows/wf-mine-to-cut.yaml` — post-action + stale ref fix
- `squads/curator/workflows/wf-longform-simple-pipeline.yaml` — validation step
- `squads/curator/tasks/format-cut.md` — cross-check post-action
- `squads/curator/tasks/mine-transcript.md` — automation note
- `squads/curator/checklists/mining-quality.md` — cross-YAML item + scoring
- `squads/curator/config.yaml` — version 3.0.0 → 3.1.0
- `squads/curator/CHANGELOG.md` — this entry

---

## [v3.0.0] — 2026-02-07

### Changed — Structural Overhaul (14 Problems Fixed)

**Path Migration (P1+P2+P8):**
- Output structure: `output/curated/{slug}_momentos.md` → `output/curated/{slug}/momentos.md`
- Nested folders: `output/curated/{slug}/cortes/longform/` and `cortes/shorts/`
- Slug from source TITLE (not video ID): `givmh6rb6sa` → `ia-vale-do-silicio`
- Sub-agent parts organized in `_temp/mining/{slug}/parts/`
- All ~20 squad files updated atomically (agents, workflows, templates, checklists, data)

**CODE > LLM (P4+P5+P9+P14):**
- New `squads/curator/scripts/merge_mining_parts.py` — replaces inline Python for part consolidation
- New `squads/curator/scripts/apply_stt_corrections.py` — replaces hardcoded STT patterns in task
- New `squads/curator/data/stt-corrections.yaml` — externalized STT patterns (auto + contextual)
- Parametrized `squads/curator/scripts/generate_editor_guide.py` — removed all hardcoded paths (P9)

**Pipeline Integration (P3+P7+P10):**
- Added Phase 4 (Editor Guide) to `format-cut.md` — editor guide now part of pipeline
- Added STT disclaimer banner to editor guides (P10)
- Added continuity check between consecutive moments (P6)

**Template Cleanup (P12+P13):**
- Removed from longform template: `energy_map`, `retention_hooks`, `curadoria_integrations`, `quality_checklist`
- Removed from both templates: standalone `style_preset` section → moved to metadata field
- Longform template: 345 → 237 lines (-31%)

**Quality + Tracking (P6+P11):**
- New `squads/curator/scripts/generate_source_index.py` — generates `INDEX.md` per source
- INDEX generation integrated into mine-transcript.md (Pass 6) and format-cut.md (Phase 5)
- Continuity check function in editor guide script

### Files Created (4)
- `squads/curator/scripts/merge_mining_parts.py`
- `squads/curator/scripts/apply_stt_corrections.py`
- `squads/curator/scripts/generate_source_index.py`
- `squads/curator/data/stt-corrections.yaml`

### Files Modified (~24)
- `tasks/mine-transcript.md` → v3.0.0
- `tasks/format-cut.md` → v1.1.0
- `config.yaml` → v3.0.0
- `templates/longform-cut-tmpl.yaml` (simplified)
- `templates/shorts-cut-tmpl.yaml` (simplified)
- `squads/curator/scripts/generate_editor_guide.py` (parametrized + STT + continuity)
- ~18 other squad files (path pattern replacement)

---

## [v2.7.0] — 2026-02-06

### Added — Cut Customization System (Story #2)

**Duration Intelligence:**
- Content-driven duration calculation replacing fixed 15/30/60 buckets
- Beat-by-beat breakdown (hook, context, value, payoff, CTA)
- Platform sweet spot alignment with confidence levels
- Percentage-based beat timing (not fixed seconds)

**Style Presets:**
- 4 shorts presets: viral, educational, emotional, entertaining
- 2 longform presets: educational_longform, emotional_longform
- Each preset affects measurable parameters (cut frequency, overlay density, energy, hook strategy)

**Interactive Configuration Menu:**
- `*create-cut` now shows configuration menu before generation
- `*preview-moments` command for moment preview table
- `*select-moments {ids}` for manual moment selection
- `*go` shortcut uses smart defaults

**Multi-Variant Generation:**
- Generate 1-5 meaningfully different cut assemblies per concept
- Each variant uses different hook (enforced)
- Comparison summary table for multi-variant output
- Diminishing returns guidance (2-3 optimal, 5 max)

**Workflow Integration:**
- wf-mine-to-cut v1.2.0: Added configuration phase + multi-variant branching
- wf-longform-pipeline v1.1.0: Added cut configuration phase + chapter breakdown
- wf-shorts-pipeline: Content-driven duration parameters
- wf-multi-format: Content-driven duration parameters
- config.yaml: Full cut_customization section with platform data

### Changed
- shorts-cut-tmpl.yaml: Percentage-based beats, duration_intelligence, style_preset, variant fields
- longform-cut-tmpl.yaml: Duration intelligence, style_preset, variant fields
- format-cut.md: Duration Intelligence algorithm, Style Presets, Multi-Variant protocol
- curator-chief.md: Interactive menu, new commands, updated handoff contexts

### Files Modified (11)
- `agents/curator-chief.md`
- `config.yaml`
- `tasks/format-cut.md`
- `templates/shorts-cut-tmpl.yaml`
- `templates/longform-cut-tmpl.yaml`
- `workflows/wf-shorts-pipeline.yaml`
- `workflows/wf-longform-pipeline.yaml`
- `workflows/wf-mine-to-cut.yaml`
- `workflows/wf-multi-format.yaml`
- `checklists/mining-quality.md` (indirect: viability thresholds referenced)
- `CHANGELOG.md`

---

## [2.6.0] - 2026-02-06

### Annotated Transcript Pipeline — Full-Context Editor Deliverable

The mining pipeline now produces a second deliverable alongside banco de momentos: a full
annotated transcript (`transcricao_anotada.md`) with KEEP/REMOVE/BRIDGE markers and natural
cut points. Editors receive 100% transcript context instead of 50 isolated moments, reducing
per-cut time from ~5-10 min to ~1-2 min. Generation is CODE-based (Python script), following
the CODE > LLM principle.

### Added (2 new files)
- `templates/transcricao-anotada-tmpl.md` — NEW: Template for annotated transcript structure.
  Defines YAML frontmatter, legend, 3 segment types (KEEP/REMOVE/BRIDGE), cut point
  specification, bridge classification rules, quality requirements.
- `squads/curator/scripts/generate_annotated_transcript.py` — NEW: Python script for generating annotated
  transcript. Parses WebVTT/SRT/plain text transcripts, maps moments to timeline, classifies
  gaps (<30s = BRIDGE, >=30s = REMOVE), identifies natural cut points (sentence endings,
  pauses >0.5s, speaker changes) within +/- 2s window. CLI parametrized (4 args, no
  hardcoded defaults). Performance target: <5s for 4-hour transcript.

### Changed (8 files)
- `tasks/mine-transcript.md` — v2.2.0 → v2.3.0: Added Pass 4.6 (Generate Annotated
  Transcript) between Pass 4.5 (STT) and Phase 5 (Radio Cut). Updated output section to
  include annotated_transcript. Updated delivery report (Pass 6) to list both deliverables.
  Updated action_items, anti-patterns, dependencies, handoff, version.
- `tasks/format-cut.md` — Added transcricao_anotada as optional input. Added step 1.1b for
  reading annotated transcript. Updated acceptance criteria (transitions from BRIDGE segments,
  natural cut points). Updated always_do and dependencies.
- `config.yaml` — v2.5.0 → v2.6.0: Added transcricao_anotada to output_formats with template,
  output_path, script reference, and parameters (bridge_threshold, context_window). QG-002
  criteria updated to verify transcricao_anotada exists.
- `templates/longform-cut-tmpl.yaml` — Added per-moment fields: corte_natural_in,
  corte_natural_out, bridge_antes, bridge_depois. Added transcricao_anotada_file to metadata.
- `templates/shorts-cut-tmpl.yaml` — Added per-beat fields: corte_natural_in, corte_natural_out
  for beats 1-4. Added transcricao_anotada_file to metadata.
- `workflows/wf-mine-to-cut.yaml` — v1.0.1 → v1.1.0: Phase 1 output now lists both
  deliverables. Phase 2 input includes transcricao_anotada for bridge material. Phase 3 input
  includes transcricao_anotada for cut points. QG-002 checkpoint updated. Dependencies updated.
- `checklists/mining-quality.md` — v2.2 → v2.3: Added Section 8 (Annotated Transcript, 6
  items). Added Pass 4.6 to methodology quality checks. Updated scoring: 47→54 items,
  79→92 max points. Pass threshold updated: 76→89 total, 32→38 mandatory items.

### Impact
- **Editor time savings:** ~5-10 min/cut → ~1-2 min/cut (50-80% reduction)
- **Full context:** Editors see ENTIRE transcript with annotations, not just 50 isolated moments
- **Bridge material:** Transition text available from real transcript (NEVER invented)
- **Natural cut points:** Pre-identified for each KEEP moment (IN/OUT with reason)
- **Rescue content:** REMOVE segments flag potentially useful phrases buried in filler

### Story Reference
- `plan/stories/story-curator-annotated-transcript.md` — 10 acceptance criteria, all met

### Component Totals (v2.6.0)
- Agents: 11 (unchanged)
- Tasks: 5 (mine-transcript v2.3.0, format-cut updated)
- Workflows: 4 (wf-mine-to-cut v1.1.0)
- Checklists: 4 (mining-quality v2.3)
- Templates: 8 (was 7, +1 new transcricao-anotada-tmpl.md)
- Data files: 3 (unchanged)
- Quality Gates: 5 (QG-002 expanded)
- Scripts: 3 (was 2, +1 new generate_annotated_transcript.py)

---

## [2.5.1] - 2026-02-06

### Post-upgrade cleanup: legacy agent removal

Post-v2.5.0 cleanup: removed all cross-references to deprecated longform-specialist
and shorts-specialist agents across 17+ files. Both agents replaced by mrbeast in
operational flows. Legacy agent files archived to `_archive/curator/`. Synced mrbeast
+ robert-mckee to `.claude/commands/` for global access.

### Changed (17+ files)
- `config.yaml` — tier_2 shorts-specialist entry commented out (MrBeast now handles all cuts)
- `README.md` — Updated pipeline diagrams, agent lists, file tree, tier distribution, frameworks reference
- `curator.md` — Removed shorts-specialist and longform-specialist from agent summaries, updated tier lists
- `curator-chief.md` — Updated tier_structure delegation rules to reference mrbeast instead of legacy specialists
- `templates/longform-cut-tmpl.yaml` — "Generated by" comment updated to mrbeast
- `templates/shorts-cut-tmpl.yaml` — "Generated by" comment updated to mrbeast
- `checklists/output-quality.md` — "Used by" list updated to mrbeast
- `workflows/wf-shorts-pipeline.yaml` — Phase 2 agent updated to mrbeast
- `workflows/wf-longform-pipeline.yaml` — Phase 2 agent updated to mrbeast
- `workflows/wf-multi-format.yaml` — Track A and B agent updated to mrbeast
- `workflows/wf-mine-to-cut.yaml` — Phase 3 agent updated to mrbeast
- `agents/ken-burns.md` — Handoff references updated (no more shorts-specialist)
- `agents/walter-murch.md` — Handoff references updated (no more longform-specialist)
- `agents/matthew-dicks.md` — Handoff references updated
- `agents/brendan-kane.md` — Handoff references updated
- `agents/jonah-berger.md` — Handoff references updated
- `.claude/commands/mrbeast.md` — NEW: MrBeast slash command synced from squad
- `.claude/commands/robert-mckee.md` — NEW: Robert McKee slash command synced from squad

### Removed
- `agents/longform-specialist.md` → moved to `_archive/curator/longform-specialist.md`
- `agents/shorts-specialist.md` → moved to `_archive/curator/shorts-specialist.md`

### Component Totals (v2.5.1)
- Agents: 11 (unchanged count, 2 archived + 2 new in v2.5.0)
- Active agents in tier_structure: 11 (curator-chief + 2 tier0 + 1 tier0.5 + 4 tier1 + 3 tier2)
- Archived agents: 2 (legacy specialists)
- Slash commands in .claude/commands/: 2 new (mrbeast, robert-mckee)

---

## [2.5.0] - 2026-02-06

### Mind Clone Upgrade — 2 New Agents + Tier Restructuring

Research loop of 4 iterations (20 candidates → 10 validated → 7 selected) informed
the addition of 2 new mind clones with formal Voice DNA + Thinking DNA extraction.
MrBeast replaces longform-specialist with a real retention framework. Robert McKee
adds scene-level narrative depth complementing existing Tier 1 agents.

### Added (2 new agents)
- `agents/mrbeast.md` — NEW: Retention Architect (Tier 2). Replaces longform-specialist.
  Minute-by-minute retention framework, first-minute engineering, re-engagement system
  (every 3 min), zero dead time principle, stair-stepping/strong-payoff/chase-escape formats.
  Full Voice DNA + Thinking DNA extracted from Production Handbook (36 pages), Lex Fridman
  #351, Colin & Samir interview, Daniel Scrivner analysis. 12 power words, 10 signature
  phrases, 8 decision heuristics, 3 content formats, 3 voice contradictions.
- `agents/robert-mckee.md` — NEW: Story Architect (Tier 1). Scene-level narrative
  analysis via beat → scene → sequence → act hierarchy. Value charges (every scene must
  turn), the Gap (expectation vs. result), controlling idea (value + cause), five-part
  structure (inciting incident → complications → crisis → climax → resolution).
  Full Voice DNA + Thinking DNA from Story (466p), Storynomics, Dialogue, 67+ quotes,
  3-Day Seminar documentation. 11 power words, 9 signature phrases, 8 heuristics.

### Changed
- `config.yaml` — v2.5.0: tier_1 adds robert-mckee, tier_2 replaces longform-specialist
  with mrbeast. 2 new patterns added (CU-NP-004 Story Structure, CU-VP-004 Retention
  Architecture).

### Removed
- `agents/longform-specialist.md` retained as file but REPLACED in tier_structure by
  mrbeast. MrBeast provides real retention framework vs. generic composite best practices.

### Tier Distribution (post-upgrade)
```
Orchestrator │ curator-chief
Tier 0       │ content-miner-pro + timestamp-cataloger
Tier 0.5     │ data-curator
Tier 1       │ ken-burns + walter-murch + matthew-dicks + robert-mckee (NEW)
Tier 2       │ brendan-kane + jonah-berger + mrbeast (NEW) + shorts-specialist
```

---

## [2.4.0] - 2026-02-05

### Mining Pipeline Optimization — Templates, Consistency, Reusability

Full audit of the mining pipeline revealed 13 issues (4 high, 5 medium, 4 low).
This release resolves all of them: creates missing templates that blocked 3 workflows,
normalizes naming across the squad, updates the checklist to reflect all 7 passes,
aligns selection criteria with MQR reality, parametrizes the script, and cleans up
legacy artifacts.

### Added (4 new templates)
- `templates/narrative-structure-tmpl.yaml` — NEW: 5-act narrative arc structure for
  Tier 1 agents (ken-burns, walter-murch, matthew-dicks). Includes transition map,
  energy map, unused moments tracking. Unblocks wf-longform-pipeline Phase 1.
- `templates/longform-cut-tmpl.yaml` — NEW: Complete editor-ready cut file for 10+
  min content. Chapters, cold open, retention hooks, energy map, curadoria integrations,
  YouTube metadata. Unblocks wf-longform-pipeline Phase 2.
- `templates/shorts-cut-tmpl.yaml` — NEW: 5-beat structure (Hook/Context/Value/Payoff/
  Loop) for sub-60s content. Hook analysis, text overlay plan, cut frequency map,
  platform adaptations (TikTok/Reels/Shorts). Unblocks wf-shorts-pipeline Phase 2.
- `templates/social-clips-tmpl.yaml` — NEW: STEPPS-scored social clips with platform-
  specific adaptations (LinkedIn/Instagram/Twitter/Threads). Content calendar,
  moment usage map. Unblocks wf-multi-format Track C.

### Changed (7 files)
- `agents/content-miner-pro.md` — Fixed `b-roll-cue` → `b_roll_cue` (2 occurrences);
  updated output_format.structure from old YAML format to current compact MD format
  with YAML frontmatter, Quick Scan table, Rankings, MQR notation
- `checklists/mining-quality.md` — v2.1 → v2.2: Methodology section expanded from
  4 to 7 items (added Pass 4 Selection, Pass 4.5 STT, Pass 6 Delivery); template
  version ref v2.0 → v3.0; scoring updated: 44→47 items, 76→79 max points,
  pass threshold 74→76
- `tasks/mine-transcript.md` — v2.0.0 → v2.2.0: Version header aligned with footer;
  Pass 4.1 selection criteria replaced rigid score thresholds (10-only/9-only) with
  quartile-balanced top-N selection matching actual script logic; documented script
  CLI args with example usage
- `squads/curator/scripts/generate_compact_mining.py` — v2.1 → v2.2: Removed hardcoded defaults
  (source name, speakers, date); now requires 4 CLI args with usage help; speakers
  auto-extracted from moment data; uses datetime.now() for mined_at
- `config.yaml` — version 2.3.0 → 2.4.0

### Removed
- `templates/banco-momentos-tmpl.yaml` — DELETED: Legacy v2.0 YAML format, replaced
  by `banco-momentos-tmpl.md` (v3.0) since v2.1.0. Having both caused confusion.

### Impact
- **3 workflows unblocked:** wf-longform-pipeline, wf-shorts-pipeline, wf-multi-format
  now have all referenced templates on disk
- **Naming consistency:** `b_roll_cue` is now the single canonical form everywhere
- **Script reusability:** generate_compact_mining.py works for any source, not just
  the hardcoded cohort-avancado-aula1
- **Checklist accuracy:** mining-quality.md now covers all 7 passes of the methodology
- **Selection criteria alignment:** mine-transcript.md describes the same logic the
  script actually executes (quartile-balanced, not rigid score thresholds)

### Component Totals (v2.4.0)
- Agents: 11
- Tasks: 5
- Workflows: 4
- Checklists: 4 (mining-quality v2.2)
- Templates: 7 (was 3, +4 new, -1 deleted legacy)
- Data files: 3
- Quality Gates: 5
- Scripts: 2 (generate_compact_mining v2.2, catalog_transcript)

---

## [2.3.0] - 2026-02-05

### Optimize: catalog-transcript → Hybrid Execution

Determinism analysis (`*optimize curator`) identified that 10/12 actions in catalog-transcript
were deterministic (parsing, normalizing, segmenting, indexing). Converted from 100% Agent to
Hybrid: Worker script handles Phases 1, 2, 4; Agent only handles Phase 3 (speaker attribution
+ 4-dimension tagging). ~50% token savings per execution.

### Added
- `squads/curator/scripts/catalog_transcript.py` — NEW: Worker script with `parse` and `index` commands.
  Handles format detection (WebVTT/CSV), parsing, normalization, segmentation, timeline
  validation, index building, YAML generation, and automated QG-CAT checks.

### Changed (2 files)
- `tasks/catalog-transcript.md` — execution_type: agent → hybrid; added Worker Script field;
  rewrote Phases to show Hybrid pipeline (Worker→Agent→Worker); updated Dependencies and
  Usage sections; added pipeline diagram (v1.0.0 → v1.1.0)
- `config.yaml` — Added catalog Worker use cases to executor_types.worker.use_for;
  version 2.2.0 → 2.3.0

### Impact
- Token savings: ~50% per catalog execution (Agent only processes semantic tagging)
- Speed: Phases 1+2+4 execute in <1 second (vs ~2-3 min Agent)
- Consistency: Parsing/indexing is 100% deterministic (no LLM variance)
- Backward compatible: Legacy one-shot Agent mode still works

---

## [2.2.0] - 2026-02-05

### MQR (Moment Quality Rubric) — Structured Scoring for Mining

Replaces vague impact_score labels ("scroll-stopping", "share-worthy") with a 4-dimension
rubric derived from Berger (STEPPS) + Kane (Hook Point). Applied DURING Pass 2 mining.
Fixes score inflation where ALL moments were scored 10/10.

### Added
- `data/moment-quality-rubric.yaml` — NEW: Core MQR file with 4 dimensions (H=Hook Strength,
  E=Emotional Arousal, S=Shareability, C=Standalone Clarity), weighted formula, anti-inflation
  guard, calibration anchors, quick reference for sub-agent embedding
- `config.yaml` — CU-VP-003 pattern entry for MQR

### Changed (8 files)
- `data/moment-types.yaml` — Replaced vague `scoring_guide` section with MQR pointer; added
  mqr validation rule; retained `weight_by_format` system (v1.0.0 → v1.1.0)
- `tasks/mine-transcript.md` — Added MQR acceptance criteria; replaced Pass 2 step 2.4 vague
  scoring with MQR dimensions + formula; inlined MQR quick-checks in sub-agent instructions;
  updated anti-over-extraction to reference MQR; added MQR to dependencies (v2.0.0 → v2.1.0)
- `templates/banco-momentos-tmpl.md` — Added MQR column to Quick Scan table; added MQR
  sub-scores to moment detail section
- `checklists/mining-quality.md` — Expanded Scoring section from 2 to 5 items (sub-scores,
  formula derivation, anti-inflation guard); updated point totals 70→76, thresholds 58→64
  mandatory (v2.0 → v2.1)
- `config.yaml` — QG-002 criteria expanded with MQR requirements (sub-scores, notation,
  anti-inflation)
- `agents/content-miner-pro.md` — Added MQR to dependencies, methodology Pass 2, customization
  block, and core_principles
- `squads/curator/scripts/generate_compact_mining.py` — Parses MQR compact notation (H8/E7/S9/C6) via regex;
  adds MQR column to Quick Scan table; adds sub-scores to moment detail; adds inflation check
  to Quality Report; backward compatible with legacy moments without MQR (v2.0 → v2.1)

### What does NOT change
- `agents/jonah-berger.md` (Tier 2) — unchanged, does full STEPPS analysis
- `agents/brendan-kane.md` (Tier 2) — unchanged, does full Hook Point analysis
- `data/viral-triggers.yaml` — unchanged, still classifies WHY (gatilho_viral)
- `data/moment-types.yaml` type definitions — unchanged, still classifies WHAT (tipo)
- Output file naming and paths — unchanged

### Anti-Inflation Guard
- Expected average impact_score: 5.5-6.5
- If batch average > 7.5 → mandatory recalibration
- Score 10 requires H≥9 AND E≥8 AND S≥9 AND C≥8 (nearly impossible)

---

## [2.1.0] - 2026-02-05

### CRITICAL FIX: Output Path Consistency & Delivery Transparency

v2.0 changed output from YAML to compact MD and introduced `output/curated/` path,
but only updated `mine-transcript.md`. All other files still referenced `banco_momentos.yaml`.
The agent couldn't tell the user where the deliverable was stored.

### Fixed (22 files)
- **ALL references** to `banco_momentos.yaml` → `banco_momentos.md` across entire squad
- `config.yaml` — tier_0 output path now points to `output/curated/{source-slug}/banco_momentos.md`
- `config.yaml` — output_formats.banco_momentos template now points to `banco-momentos-tmpl.md`
- `config.yaml` — QG-002 criteria updated to reference `.md` format
- `curator-chief.md` — added DELIVERY TRANSPARENCY principle, output paths explicit
- `content-miner-pro.md` — added DELIVERY TRANSPARENCY, output_format now has compact_file + archive_file paths
- `README.md` — added "Output Locations" section with mining paths, version bumped to 2.1.0
- `README.md` — file tree now includes `banco-momentos-tmpl.md`
- All 3 Tier 1 agents (ken-burns, walter-murch, matthew-dicks)
- All 4 workflows (wf-mine-to-cut, wf-shorts-pipeline, wf-longform-pipeline, wf-multi-format)
- Both data files (moment-types.yaml, viral-triggers.yaml)
- `checklists/mining-quality.md`

### Added
- `mine-transcript.md` — **Pass 6: Cleanup & Delivery Report** (MANDATORY)
  - Cleans obsolete temp files after mining
  - FORCES agent to display exact paths of deliverable to user
  - Prevents user from being left in the dark about output location
- `_temp/mining/cohort-avancado-aula1/INDEX.md` — Rewritten to point to real deliverable

### Cleaned
- `_temp/mining/cohort-avancado-aula1/parse_moments.py` — DELETED (obsolete, replaced by `squads/curator/scripts/generate_compact_mining.py`)
- `_temp/mining/cohort-avancado-aula1/all_moments_raw.md` — DELETED (duplicate of merged)
- `_temp/mining/cohort-avancado-aula1/banco_momentos.yaml` — DELETED (v1 inflated output, replaced by compact MD)
- `_temp/mining/cohort-avancado-aula1/part_*.md` — Moved to `parts/` subfolder

### Renamed Output File
- `banco_momentos.md` → `{source-slug}_momentos.md` across ALL files
- Output path: `output/curated/{source-slug}_momentos.md` (flat, no subfolder)
- Example: `output/curated/cohort-avancado-aula1_momentos.md`
- Script `squads/curator/scripts/generate_compact_mining.py` updated to new default path
- Reason: `banco_momentos` is generic and doesn't identify the source

### Root Cause
v2.0 refactoring only updated the task file but not the 20+ other files that reference the output.
This is a systemic issue: when output format changes, ALL cross-references must be updated atomically.

---

## [2.0.0] - 2026-02-05

### CRITICAL UPGRADE: ATHENA-MEK v2.0 Integration

Restored all critical features lost from original ATHENA-MEK v1.0 content-miner
when curator squad was created. The original content-miner had precision scaffolding
that was not carried over to the squad — this version corrects that.

### Restored from ATHENA-MEK v1.0
- **3-Pass Sequential Methodology** (Anchor → Extract → Audit) with validation gates between passes
- **Anti-Laziness Protocol** — minimum moments = duration_seconds / 180
- **Territorial Completeness Audit** — coverage >= 40%, each quartile >= 10%
- **7 Viral Triggers** (LACUNA, QUEBRA, PICO, CONTRAINTUITIVO, TRANSFORMAÇÃO, CONTROVÉRSIA, ESPECÍFICO)
- **Large File Protocol** — transcripts >2000 lines split into ~1000 line parallel sub-agents, consolidated via code
- **Quality Report** — ATHENA audit report with metrics in every banco_momentos.yaml
- **Transcription Fidelity Rules** — word-for-word, never paraphrase, ellipsis syntax

### Files Changed
- `tasks/mine-transcript.md` — Rewritten v2.0: 3 passes + Phase 4, Large File Protocol, anti-laziness, territorial audit
- `agents/content-miner-pro.md` — Updated methodology, principles, anti-patterns, dependencies
- `templates/banco-momentos-tmpl.yaml` — v2.0: added coverage_metrics, quality_report, por_gatilho, gatilho_viral per moment
- `checklists/mining-quality.md` — v2.0: 41 items (29 mandatory + 12 quality), ATHENA enforcement section
- `config.yaml` — v2.0: added ATHENA-MEK, viral triggers, large file principles; QG-002 expanded
- `agents/curator-chief.md` — QG-002 expanded with ATHENA requirements

### Added
- `data/viral-triggers.yaml` — NEW: 7 ATHENA viral triggers with psychological mechanisms, detection signals, cross-mapping to moment types

### Component Totals (v2.0.0)
- Agents: 11 (unchanged)
- Tasks: 5 (unchanged, mine-transcript upgraded)
- Workflows: 4 (unchanged)
- Checklists: 4 (mining-quality upgraded)
- Templates: 3 (banco-momentos upgraded)
- Data files: 2 (moment-types.yaml + NEW viral-triggers.yaml)
- Quality Gates: 5 (QG-002 significantly expanded)

---

## [1.1.0] - 2026-02-05

### Upgraded
- **All 11 agents upgraded to AIOX standards** (squad score 7.2 → 8.0)
  - IDE-FILE-RESOLUTION block added to all 11 agents (was 2/11)
  - objection_algorithms added to 10 agents (was 5/11)
  - sentence_starters added to all 11 agents (was 8/11)
  - output_examples brought to 3+ for all agents (was 8/11)
  - data-curator expanded from 360 → 546 lines (was CRITICAL at 4.5/10)
  - shorts-specialist expanded from 451 → 572 lines (+examples, +handoffs)
  - longform-specialist expanded from 474 → 628 lines (+examples, +handoffs)
  - content-miner-pro expanded from 577 → 676 lines (+examples, +objections)
  - timestamp-cataloger expanded from 575 → 633 lines (+vocab, +objections)

### Added

#### Tasks (+2)
- `curate-data.md` — Dedicated task for data-curator (I Am the Algorithm + Haystack Method)
- `catalog-transcript.md` — Dedicated task for timestamp-cataloger (Dialogue Method)

#### Workflows (+3)
- `wf-shorts-pipeline.yaml` — Streamlined pipeline for <60s content (TikTok, Reels, YT Shorts)
- `wf-longform-pipeline.yaml` — Full pipeline for 10+ min content with retention management
- `wf-multi-format.yaml` — Mine once, format many (parallel tracks)

#### Checklists (+1)
- `curation-quality.md` — QG-CUR checklist for data-curator validation (30 items, scoring system, edge cases)

### Component Totals (v1.1.0)
- Agents: 11 (1 orchestrator + 2 tier0 + 1 tier0.5 + 3 tier1 + 4 tier2)
- Tasks: 5 (mine-transcript, build-narrative, format-cut, curate-data, catalog-transcript)
- Workflows: 4 (mine-to-cut, shorts-pipeline, longform-pipeline, multi-format)
- Checklists: 4 (mining-quality, narrative-quality, output-quality, curation-quality)
- Templates: 3 (banco-momentos, curadoria, roteiro-corte)
- Quality Gates: 5 (QG-001 to QG-004 + QG-CUR)
- Total lines: ~10,000+

---

## [1.0.0] - 2026-02-04

### Added

#### Agents (11 total)
- **5 Mind Clones (Specialized Copywriters)**
  - Ken Burns (documentary cinema narrative structuring)
  - Walter Murch (editing, pacing, rhythm composition)
  - Matthew Dicks (storytelling mechanics and hooks)
  - Brendan Kane (viral pattern recognition and distribution)
  - Jonah Berger (contagious ideas and memetics)

- **6 Core Agents**
  - curator-chief (orchestrator, routing, coordination)
  - content-miner-pro (transcript mining, Paper Edit methodology)
  - timestamp-cataloger (exhaustive transcript indexing)
  - data-curator (news/trends/data curation)
  - shorts-specialist (sub-60s content optimization)
  - longform-specialist (10+ min content architecture)

#### Tasks (3 core)
- `mine-transcript.md` - Extract insights and moments from raw content with structured prompts
- `build-narrative.md` - Compose narrative arc using story frameworks from mind clones
- `format-cut.md` - Transform narrative into publishable formats (LinkedIn, email, newsletter)

#### Templates (3)
- `banco-momentos-tmpl.yaml` - Mining output: moments with timestamps, types, scores
- `curadoria-tmpl.yaml` - Data curation: news, stats, trends with sources
- `roteiro-corte-tmpl.yaml` - Final cut script: assembly order, transitions, editor instructions

#### Checklists (3)
- `mining-quality.md` - QG-002: Mining validation (32 items, scoring, edge cases)
- `narrative-quality.md` - QG-003: Narrative validation (34 items, emotional arc, radio cut test)
- `output-quality.md` - QG-004: Output validation (40 items, timestamps, source integrity)

#### Quality Gates (4)
- **QG-001**: Transcript Acquired (blocking, transcript exists and readable)
- **QG-002**: Mining Complete (blocking, exact timestamps, typed moments)
- **QG-003**: Narrative Validated (blocking, assembly order, no gaps)
- **QG-004**: Output Formatted (blocking, exact timestamps, editor instructions)

#### Workflows (1)
- `wf-mine-to-cut.yaml` - Complete curation workflow: mine → build narrative → format → validate (2-3 hours end-to-end)

#### Knowledge Base
- `moment-types.yaml` - Taxonomy of content moments: origin story, case study, objection handler, framework, transformation, social proof (with examples and reusability scores)

### Initial Release Notes

- Full content curation squad with specialized agents for mining, structuring, and formatting
- Mind clone architecture for distinct narrative perspectives and storytelling approaches
- Three-phase workflow: content mining → narrative architecture → multi-format output
- Integrated quality gates throughout pipeline to ensure publishable content
- Reusability scoring system for moments across platforms
- Ready for integration with email, newsletter, and social automation MCPs

---

## Roadmap

Planned for future versions:
- Video transcript handling (YouTube, podcast transcripts)
- Real-time content mining from multiple sources (live streams, articles)
- A/B testing variants for narrative structure
- Analytics integration (performance tracking by moment type)
- Multi-language support for narrative architecture
