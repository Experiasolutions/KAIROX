#!/usr/bin/env node

/**
 * @module input-refiner
 * @version 2.0.0
 * @purpose Transform raw user intent into Opus-grade structured prompts with
 *          AIOS context injection and golden example anchoring.
 * @inputs  Raw user string (CLI arg or programmatic call)
 * @outputs { original, mode, context, goldenExamples[], refinedPrompt }
 * @emits   prompt:refined (via event-bus)
 * @dependencies event-bus.js, golden-examples/, constitutional-layer-v3.md
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ── Paths ────────────────────────────────────────────────────

const AIOS_ROOT = path.join(__dirname, '..');
const OPUS_PATH = path.join(AIOS_ROOT, '.aios-core', 'opus-replicator');
const MEMORY_PATH = path.join(AIOS_ROOT, '.aios-core', 'memory');
const GOLDEN_PATH = path.join(MEMORY_PATH, 'golden-examples');
const DATA_PATH = path.join(AIOS_ROOT, '.aios-core', 'data');

// ── Mode Definitions ─────────────────────────────────────────
// WHY: Each mode maps to a PM master file and has distinct trigger words.
// The trigger detection is first-match, so order matters: more specific first.

const MODES = {
    PM3: {
        id: 'PM3',
        name: 'EVALUATION',
        triggers: ['review', 'audit', 'test', 'check', 'critique', 'score', 'grade', 'validate', 'assess', 'evaluate'],
        masterFile: 'pm3-quality-master.md',
        goldenDir: 'pm3',
        description: 'Quality audit with 7-dimension scoring',
    },
    PM1: {
        id: 'PM1',
        name: 'REASONING',
        triggers: ['analyze', 'think', 'plan', 'strategy', 'why', 'how', 'design', 'architect', 'research', 'compare'],
        masterFile: 'pm1-reasoning-master.md',
        goldenDir: 'pm1',
        description: 'Strategic analysis with N0→N3 decomposition',
    },
    PM2: {
        id: 'PM2',
        name: 'EXECUTION',
        triggers: ['write', 'code', 'create', 'generate', 'build', 'implement', 'fix', 'refactor', 'migrate', 'deploy'],
        masterFile: 'pm2-execution-master.md',
        goldenDir: 'pm2',
        description: 'Production-grade implementation',
    },
};

// ── Safe File Reader ─────────────────────────────────────────
// WHY: Graceful degradation — missing files should not crash the refiner.

function safeReadFile(filePath, label) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (err) {
        if (err.code === 'ENOENT') {
            return null; // File doesn't exist yet — normal during bootstrap
        }
        console.warn(`[input-refiner] Error reading ${label}: ${err.message}`);
        return null;
    }
}

function safeReadJSON(filePath, label) {
    const content = safeReadFile(filePath, label);
    if (!content) return null;
    try {
        return JSON.parse(content);
    } catch (err) {
        console.warn(`[input-refiner] Invalid JSON in ${label}: ${err.message}`);
        return null;
    }
}

// ── Mode Detection ───────────────────────────────────────────
// WHY: Order is PM3 → PM1 → PM2 (most specific first, PM2 is catch-all for action verbs).

function detectMode(input) {
    const lower = input.toLowerCase();

    for (const mode of Object.values(MODES)) {
        if (mode.triggers.some(t => lower.includes(t))) {
            return mode;
        }
    }

    // EDGE CASE: No trigger matched — infer from input structure
    // File references suggest execution; questions suggest reasoning
    if (lower.includes('.js') || lower.includes('.md') || lower.includes('.json') || lower.includes('.yaml')) {
        return MODES.PM2;
    }
    if (lower.includes('?') || lower.length > 200) {
        return MODES.PM1; // Complex/long inputs likely need analysis first
    }

    return MODES.PM2; // Default: build something
}

// ── Golden Example Loader ────────────────────────────────────
// WHY (Karpathy): "Examples ARE the prompt. Instructions are guardrails."
// Loads up to 3 most relevant examples by tag matching.

function loadGoldenExamples(mode, input) {
    const indexPath = path.join(GOLDEN_PATH, mode.goldenDir, 'index.json');
    const index = safeReadJSON(indexPath, `golden-examples/${mode.goldenDir}/index.json`);

    if (!index || !index.examples || index.examples.length === 0) {
        return [];
    }

    // Score each example by tag relevance to input
    const lower = input.toLowerCase();
    const scored = index.examples.map(ex => {
        const tagScore = (ex.tags || []).reduce((score, tag) => {
            return score + (lower.includes(tag.toLowerCase()) ? 1 : 0);
        }, 0);
        return { ...ex, relevance: tagScore };
    });

    // Sort by relevance (desc), then by score (desc), take top 3
    scored.sort((a, b) => b.relevance - a.relevance || b.score - a.score);
    const top = scored.slice(0, 3);

    // Load actual example content
    return top.map(ex => {
        const filePath = path.join(GOLDEN_PATH, mode.goldenDir, ex.file);
        const content = safeReadFile(filePath, ex.file);
        return {
            id: ex.id,
            score: ex.score,
            summary: ex.summary,
            content: content ? content.substring(0, 2000) : null, // Cap at 2K chars to save context
        };
    }).filter(ex => ex.content !== null);
}

// ── AIOS Context Loader ──────────────────────────────────────
// WHY: Every prompt needs AIOS context to prevent hallucination.
// Loads the compressed self-context, not the full handbook.

function loadAIOSContext() {
    const selfContext = safeReadFile(
        path.join(OPUS_PATH, 'SELF_CONTEXT.md'),
        'SELF_CONTEXT.md'
    );

    if (!selfContext) {
        // Fallback: minimal context
        return [
            'AIOS CONTEXT:',
            '- Stack: Node.js, Express.js, YAML/Markdown agents, JSON storage',
            '- Kernel: Synapse + IDS + WIS (via kernel-bridge.js)',
            '- Events: event-bus.js (A2A pub/sub)',
            '- Constitution: CLI First, Agent Authority, No Invention',
            '- Domain: NONE (engine is domain-agnostic)',
        ].join('\n');
    }

    // Extract just the compressed sections (not the full file)
    const lines = selfContext.split('\n');
    const sections = [];
    let capturing = false;
    let capturedLines = 0;

    for (const line of lines) {
        if (line.includes('## 🎯 O QUE') || line.includes('## ⚠️ ARCHITECTURAL') ||
            line.includes('## ⚙️ PADRÕES')) {
            capturing = true;
            capturedLines = 0;
        }
        if (capturing) {
            sections.push(line);
            capturedLines++;
            if (capturedLines > 20) {
                capturing = false;
            }
        }
        if (capturing && line.startsWith('---')) {
            capturing = false;
        }
    }

    return sections.join('\n') || selfContext.substring(0, 3000);
}

// ── Anti-Patterns Loader ─────────────────────────────────────

function loadAntiPatterns() {
    const content = safeReadFile(
        path.join(MEMORY_PATH, 'anti-patterns.md'),
        'anti-patterns.md'
    );
    if (!content) return '';

    // WHY: Compressed format saves prompt tokens while preserving prevention actionability
    const lines = content.split('\n');
    const compressed = [];
    for (const line of lines) {
        if (line.startsWith('## AP-') || line.startsWith('**Prevention:**') || line.startsWith('**Pattern:**')) {
            compressed.push(line);
        }
    }
    return compressed.length > 0
        ? '\n## KNOWN ANTI-PATTERNS (avoid these):\n' + compressed.join('\n')
        : '';
}

// ── PM Master Loader ─────────────────────────────────────────

function loadPMMaster(mode) {
    return safeReadFile(
        path.join(OPUS_PATH, mode.masterFile),
        mode.masterFile
    ) || `[PM Master ${mode.id} not found — use default protocol]`;
}

// ── Main Refiner ─────────────────────────────────────────────

function refineInput(rawInput) {
    const mode = detectMode(rawInput);
    const goldenExamples = loadGoldenExamples(mode, rawInput);
    const aiosContext = loadAIOSContext();
    const antiPatterns = loadAntiPatterns();
    const pmMaster = loadPMMaster(mode);

    // Build golden examples block
    let goldenBlock = '';
    if (goldenExamples.length > 0) {
        goldenBlock = '\n## REFERENCE EXAMPLES (model these patterns):\n';
        goldenExamples.forEach((ex, i) => {
            goldenBlock += `\n### Example ${i + 1}: ${ex.id} (Score: ${ex.score}/10)\n`;
            goldenBlock += ex.content + '\n';
        });
    }

    // Assemble the refined prompt
    const refinedPrompt = [
        '═══════════════════════════════════════════════════════',
        `MODE: ${mode.id} — ${mode.name} (${mode.description})`,
        '═══════════════════════════════════════════════════════',
        '',
        '## AIOS CONTEXT (compressed):',
        aiosContext,
        '',
        '## PROTOCOL:',
        pmMaster,
        '',
        goldenBlock,
        antiPatterns,
        '',
        '═══════════════════════════════════════════════════════',
        'USER REQUEST:',
        `"${rawInput}"`,
        '═══════════════════════════════════════════════════════',
        '',
        'Execute this request using the protocol above.',
        'Reference the golden examples for structural patterns.',
        'Avoid all listed anti-patterns.',
        `Validate output against ${mode.id} quality criteria before delivering.`,
    ].join('\n');

    return {
        original: rawInput,
        mode: mode.id,
        modeName: mode.name,
        context: {
            goldenExamplesLoaded: goldenExamples.length,
            antiPatternsLoaded: antiPatterns.length > 0,
            aiosContextLoaded: aiosContext.length > 100,
        },
        goldenExamples: goldenExamples.map(e => ({ id: e.id, score: e.score })),
        refinedPrompt,
    };
}

// ── CLI Interface ────────────────────────────────────────────

if (require.main === module) {
    const input = process.argv[2];

    if (!input) {
        console.log('AIOS Input Refiner v2.0');
        console.log('Usage: node scripts/input-refiner.js "<your request>"');
        console.log('');
        console.log('Modes:');
        Object.values(MODES).forEach(m => {
            console.log(`  ${m.id} (${m.name}): triggers = [${m.triggers.join(', ')}]`);
        });
        process.exit(1);
    }

    const result = refineInput(input);

    // Print summary
    console.log(`\n⚡ Input Refiner v2.0`);
    console.log(`   Mode: ${result.mode} (${result.modeName})`);
    console.log(`   Golden Examples: ${result.context.goldenExamplesLoaded}`);
    console.log(`   Anti-Patterns: ${result.context.antiPatternsLoaded ? 'loaded' : 'none'}`);
    console.log(`   AIOS Context: ${result.context.aiosContextLoaded ? 'loaded' : 'minimal'}`);
    console.log(`   Prompt length: ${result.refinedPrompt.length} chars\n`);

    // Save staged prompt for downstream consumption
    const stagePath = path.join(DATA_PATH, 'staged_prompt.json');
    try {
        if (!fs.existsSync(DATA_PATH)) {
            fs.mkdirSync(DATA_PATH, { recursive: true });
        }
        fs.writeFileSync(stagePath, JSON.stringify(result, null, 2));
        console.log(`   Saved to: ${stagePath}`);
    } catch (err) {
        console.warn(`   Could not save staged prompt: ${err.message}`);
    }

    // Emit event if event-bus is available
    try {
        const { publish } = require(path.join(__dirname, 'event-bus'));
        publish('prompt:refined', {
            mode: result.mode,
            inputLength: input.length,
            promptLength: result.refinedPrompt.length,
            goldenExamples: result.context.goldenExamplesLoaded,
        }, { source: 'input-refiner', priority: 'normal' });
    } catch {
        // Event bus not available — normal in standalone mode
    }
}

module.exports = { refineInput, detectMode, loadGoldenExamples, MODES };
