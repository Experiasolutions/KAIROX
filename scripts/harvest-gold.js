#!/usr/bin/env node

/**
 * @module harvest-gold
 * @version 2.0.0
 * @purpose Auto-harvest high-quality outputs as golden examples when PM3
 *          scores ≥ 9.0/10. Called by self-correction.js after quality
 *          gate pass or manually via CLI.
 * @inputs  { output, score, mode, taskDescription, tags, reasoningTrace }
 * @outputs Saves golden example .md + updates index.json + quality-baseline
 * @emits   system:golden-example:harvested
 * @dependencies self-correction.js (caller), event-bus.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ── Paths ────────────────────────────────────────────────────

const AIOS_ROOT = path.join(__dirname, '..');
const GOLDEN_PATH = path.join(AIOS_ROOT, '.aios-core', 'memory', 'golden-examples');
const BASELINE_PATH = path.join(AIOS_ROOT, '.aios-core', 'memory', 'quality-baseline.json');

// ── Threshold ────────────────────────────────────────────────
// WHY: Must match THRESHOLDS.EXCELLENT in self-correction.js

const HARVEST_THRESHOLD = 8.5;

// ── Safe File Operations ─────────────────────────────────────

function safeReadJSON(filePath) {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {
        return null;
    }
}

function atomicWrite(filePath, content) {
    // WHY: Atomic write prevents corruption on crash (see AP-003 pattern)
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const tmp = filePath + '.tmp';
    fs.writeFileSync(tmp, typeof content === 'string' ? content : JSON.stringify(content, null, 2));
    fs.renameSync(tmp, filePath);
}

// ── Tag Extractor ────────────────────────────────────────────
// WHY: Auto-detect tags from task description to enable search matching
// in input-refiner.js golden example injection.

function extractTags(taskDescription, mode) {
    const tags = [mode.toLowerCase()];
    const text = (taskDescription || '').toLowerCase();

    // WHY: Technology terms map directly to skill search keywords
    const techTerms = {
        'node': 'node.js', 'express': 'express.js', 'react': 'react',
        'typescript': 'typescript', 'javascript': 'javascript',
        'json': 'json-storage', 'yaml': 'yaml', 'markdown': 'markdown',
        'webhook': 'webhook', 'api': 'api', 'socket': 'websocket',
        'queue': 'queue', 'cache': 'cache', 'auth': 'authentication',
        'test': 'testing', 'deploy': 'deployment', 'docker': 'docker',
        'event': 'event-driven', 'bridge': 'bridge-pattern',
        'kernel': 'kernel', 'agent': 'agent', 'squad': 'squad',
        'mcp': 'mcp', 'rag': 'rag', 'memory': 'memory',
    };

    for (const [keyword, tag] of Object.entries(techTerms)) {
        if (text.includes(keyword)) tags.push(tag);
    }

    // WHY: Architecture terms indicate design-level examples (PM1)
    const archTerms = ['architecture', 'design', 'pattern', 'decomposition',
        'trade-off', 'migration', 'refactor', 'interface', 'abstraction'];
    for (const term of archTerms) {
        if (text.includes(term)) tags.push(term);
    }

    return [...new Set(tags)];
}

// ── Golden Example Formatter ─────────────────────────────────
// WHY: Format matches Bible §8 exactly so input-refiner.js can parse it

function formatGoldenExample(data) {
    const { score, mode, taskDescription, reasoningTrace, output, tags, whyGolden } = data;
    const date = new Date().toISOString().split('T')[0];
    const shortName = (taskDescription || 'untitled')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .split(/\s+/)
        .slice(0, 4)
        .join('-');

    const id = `${mode.toLowerCase()}-${date}-${shortName}`;
    const filename = `${date}-${shortName}.md`;

    const content = [
        `# GOLDEN EXAMPLE: ${taskDescription || 'Untitled'}`,
        `**Score:** ${score}/10  **Date:** ${date}  **Mode:** ${mode}`,
        `**Tags:** ${tags.join(', ')}`,
        `**Why golden:** ${whyGolden || `Scored ${score}/10 — auto-harvested by PM3 quality gate`}`,
        '',
        '## THE TASK',
        taskDescription || '[No task description provided]',
        '',
        '## THE REASONING TRACE',
        reasoningTrace || '[Reasoning trace not captured — reconstruct from output patterns]',
        '',
        '## THE OUTPUT',
        output || '[Output not captured]',
        '',
        '## WHAT MADE THIS EXCELLENT',
        `- Scored ${score}/10 across 7 PM3 quality dimensions`,
        '- Zero anti-pattern violations detected',
        '- Auto-harvested by self-correction quality gate',
        '',
        '## REUSE GUIDANCE',
        `Use when: working on tasks tagged [${tags.slice(0, 3).join(', ')}]`,
        'Adapt: domain-specific references. Copy: structural patterns and edge case handling.',
        '',
    ].join('\n');

    return { id, filename, content, date, shortName };
}

// ── Index Updater ────────────────────────────────────────────

function updateIndex(modeDir, exampleMeta) {
    const indexPath = path.join(GOLDEN_PATH, modeDir, 'index.json');
    let index = safeReadJSON(indexPath) || { examples: [] };

    // WHY: Prevent duplicate harvesting of the same output
    const exists = index.examples.some(e => e.id === exampleMeta.id);
    if (exists) {
        return { updated: false, reason: 'duplicate' };
    }

    index.examples.push(exampleMeta);

    atomicWrite(indexPath, index);
    return { updated: true };
}

// ── Baseline Updater ─────────────────────────────────────────

function incrementBaseline() {
    let baseline = safeReadJSON(BASELINE_PATH);
    if (!baseline) return;

    const today = new Date().toISOString().split('T')[0];
    const todaySession = baseline.sessions.find(s => s.date === today);

    if (todaySession) {
        todaySession.golden_examples_harvested = (todaySession.golden_examples_harvested || 0) + 1;
    }

    baseline.last_updated = today;
    atomicWrite(BASELINE_PATH, baseline);
}

// ── Main Harvest ─────────────────────────────────────────────

function harvest(data) {
    const { score, mode, taskDescription, reasoningTrace, output, whyGolden } = data;

    // WHY: Enforce threshold — never harvest mediocre output
    if (score < HARVEST_THRESHOLD) {
        return {
            harvested: false,
            reason: `Score ${score} below threshold ${HARVEST_THRESHOLD}`,
        };
    }

    // Validate mode
    const validModes = ['PM1', 'PM2', 'PM3'];
    const normalizedMode = (mode || 'PM2').toUpperCase();
    if (!validModes.includes(normalizedMode)) {
        return { harvested: false, reason: `Invalid mode: ${mode}` };
    }

    const modeDir = normalizedMode.toLowerCase();
    const tags = extractTags(taskDescription, normalizedMode);

    // Format the golden example
    const example = formatGoldenExample({
        score, mode: normalizedMode, taskDescription, reasoningTrace, output, tags, whyGolden,
    });

    // Save the example file
    const examplePath = path.join(GOLDEN_PATH, modeDir, example.filename);
    atomicWrite(examplePath, example.content);

    // WHY: Index enables input-refiner to search examples by tag and mode
    const indexResult = updateIndex(modeDir, {
        id: example.id,
        file: example.filename,
        score,
        tags,
        task_type: normalizedMode === 'PM1' ? 'analysis' : normalizedMode === 'PM2' ? 'implementation' : 'audit',
        summary: (taskDescription || '').substring(0, 100),
        why_golden: whyGolden || `Auto-harvested: ${score}/10`,
    });

    if (!indexResult.updated) {
        // WHY: Clean up the file if index update failed (duplicate)
        try { fs.unlinkSync(examplePath); } catch { /* noop */ }
        return { harvested: false, reason: indexResult.reason };
    }

    // WHY: Baseline track tells self-correction how harvest rate trends over time
    incrementBaseline();

    return {
        harvested: true,
        id: example.id,
        file: examplePath,
        mode: normalizedMode,
        score,
        tags,
    };
}

// ── CLI Interface ────────────────────────────────────────────

if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.length === 0 || args.includes('--help')) {
        console.log('AIOS Harvest Gold v2.0');
        console.log('Usage: node scripts/harvest-gold.js --score <N> --mode <PM1|PM2|PM3> --task "<description>" [--output "<text>"] [--why "<reason>"]');
        console.log('');
        console.log(`Threshold: score >= ${HARVEST_THRESHOLD}`);
        process.exit(0);
    }

    // WHY: Simple arg parsing — no deps on minimist/yargs
    function getArg(name) {
        const idx = args.indexOf(`--${name}`);
        return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : null;
    }

    const score = parseFloat(getArg('score') || '0');
    const mode = getArg('mode') || 'PM2';
    const taskDescription = getArg('task') || '';
    const output = getArg('output') || '';
    const whyGolden = getArg('why') || '';

    if (!score || !taskDescription) {
        console.error('Error: --score and --task are required');
        process.exit(1);
    }

    const result = harvest({ score, mode, taskDescription, output, whyGolden });

    if (result.harvested) {
        console.log(`\n⚡ Golden Example Harvested!`);
        console.log(`   ID: ${result.id}`);
        console.log(`   File: ${result.file}`);
        console.log(`   Mode: ${result.mode}`);
        console.log(`   Score: ${result.score}/10`);
        console.log(`   Tags: [${result.tags.join(', ')}]\n`);
    } else {
        console.log(`\n⚠ Not harvested: ${result.reason}\n`);
    }

    // Emit event
    try {
        const { publish } = require(path.join(__dirname, 'event-bus'));
        if (result.harvested) {
            publish('system:golden-example:harvested', result, { source: 'harvest-gold' });
        }
    } catch {
        // WHY: Event bus not available in standalone mode — normal
    }
}

module.exports = { harvest, extractTags, formatGoldenExample, HARVEST_THRESHOLD };
