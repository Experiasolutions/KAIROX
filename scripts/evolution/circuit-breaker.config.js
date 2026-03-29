/**
 * @module circuit-breaker.config
 * @purpose Immutable safety configuration for the Evolution Engine.
 *          Defines forbidden components, cycle budgets, risk classification,
 *          and all hard limits that prevent runaway self-modification.
 * @inputs  None (self-contained configuration)
 * @outputs Frozen config object
 * @emits   None
 * @dependencies None
 * 
 * ═══════════════════════════════════════════════════════════════
 * THIS FILE IS IN THE FORBIDDEN LIST — IT NEVER MODIFIES ITSELF.
 * ═══════════════════════════════════════════════════════════════
 */

'use strict';

const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// ─────────────────────────────────────────────────────────────
// PROJECT ROOT (resolved relative to this file)
// ─────────────────────────────────────────────────────────────
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

// ─────────────────────────────────────────────────────────────
// FORBIDDEN COMPONENTS — NEVER modified by Evolution Engine
// ─────────────────────────────────────────────────────────────
const FORBIDDEN_COMPONENTS = Object.freeze([
    'scripts/evolution/evolution-engine.js',
    'scripts/evolution/circuit-breaker.config.js',
    'scripts/evolution/baseline-frozen.json',
]);

// ─────────────────────────────────────────────────────────────
// CYCLE BUDGET — Max changes per layer per cycle
// ─────────────────────────────────────────────────────────────
const CYCLE_BUDGET = Object.freeze({
    constitutional_layer: 1,   // .aios-core/opus-replicator/constitutional-layer-v3.md
    critical_scripts: 2,   // scripts/*.js (kernel-bridge, event-bus, etc.)
    agent_manifests: 5,   // squads/**/agents/*.md, .antigravity/agents/*.md
    documentation: Infinity, // docs, README, reasoning-packages — no limit
    golden_examples: Infinity, // .aios-core/memory/golden-examples/
    anti_patterns: Infinity, // .aios-core/memory/anti-patterns.md
});

// ─────────────────────────────────────────────────────────────
// RISK CLASSIFICATION — Determines apply behavior
// ─────────────────────────────────────────────────────────────
const RISK_CLASSIFICATION = Object.freeze({
    LOW: {
        label: 'LOW',
        description: 'Documentation, golden examples, anti-patterns',
        behavior: 'Apply directly → notify Gabriel',
        patterns: [
            /^docs\//,
            /^reasoning-packages\//,
            /^\.aios-core\/memory\/golden-examples\//,
            /^\.aios-core\/memory\/anti-patterns\.md$/,
            /^\.aios-core\/memory\/quality-baseline\.json$/,
            /README\.md$/,
        ],
    },
    MEDIUM: {
        label: 'MEDIUM',
        description: 'Scripts, agent manifests, squad configs',
        behavior: 'Apply to main → notify Gabriel with full diff',
        patterns: [
            /^scripts\/(?!evolution\/)/,  // scripts/ except evolution/
            /^squads\/.*\/agents\/.*\.md$/,
            /^\.antigravity\/agents\/.*\.md$/,
            /^\.aios-core\/.*\.json$/,
        ],
    },
    HIGH: {
        label: 'HIGH',
        description: 'Constitutional layer, PM templates, input-refiner',
        behavior: 'Branch evolution/YYYYMMDD → notify → 24h observation',
        patterns: [
            /^\.aios-core\/opus-replicator\//,
            /^scripts\/input-refiner\.js$/,
            /^scripts\/self-correction\.js$/,
            /^KAIROS_ENGINEERING_BIBLE/,
        ],
    },
});

// ─────────────────────────────────────────────────────────────
// CONVERGENCE THRESHOLDS
// ─────────────────────────────────────────────────────────────
const CONVERGENCE = Object.freeze({
    MIN_IMPROVEMENT_PERCENT: 5,     // Minimum delta to accept a change
    MAX_CONSECUTIVE_FAILURES: 3,    // Stop after N cycles with no improvement
    COUNCIL_APPROVAL_THRESHOLD: 0.6, // 60% of Council must vote APPLY
    MAX_CONVERGENCE_ATTEMPTS: 2,    // Attempts before DEFER
    OSCILLATION_WINDOW: 10,         // Check last N proposals for A→B→A loops
    BASELINE_DRIFT_THRESHOLD: 0.4,  // Flag if >40% of hashes differ
});

// ─────────────────────────────────────────────────────────────
// COUNCIL CONFIGURATION
// ─────────────────────────────────────────────────────────────
const COUNCIL = Object.freeze({
    members: [
        {
            id: 'karpathy',
            name: 'Andrej Karpathy',
            chair: 1,
            domain: 'code-quality',
            question: 'Would this code survive a Google Brain code review? What would a senior engineer reject immediately?',
        },
        {
            id: 'sutskever',
            name: 'Ilya Sutskever',
            chair: 2,
            domain: 'cognitive-architecture',
            question: 'Is the reasoning engine using the most advanced patterns? What is underestimated in the cognitive architecture?',
        },
        {
            id: 'ng',
            name: 'Andrew Ng',
            chair: 3,
            domain: 'workflow-efficiency',
            question: 'Are workflows efficient? Where is redundancy wasting cycles and tokens? Are there avoidable bottlenecks?',
        },
        {
            id: 'hinton',
            name: 'Geoffrey Hinton',
            chair: 4,
            domain: 'knowledge-distillation',
            question: 'Is knowledge distillation between models happening optimally? How to compress more intelligence into less space?',
        },
        {
            id: 'hassabis',
            name: 'Demis Hassabis',
            chair: 5,
            domain: 'learning-loops',
            question: 'Is the system learning from its own experiences? Is long-term memory being used to improve future decisions?',
        },
        {
            id: 'pedro',
            name: 'Pedro (Creator)',
            chair: 6,
            domain: 'vision-alignment',
            question: 'Is this evolution aligned with the original project vision? Are we building what was imagined, or drifting?',
            hasMinervaVote: true,
        },
        {
            id: 'alan',
            name: 'Alan (Creator)',
            chair: 7,
            domain: 'product-architecture',
            question: 'From product and architecture perspective, does this change bring us closer or further from what AIOS needs for the real world?',
            hasMinervaVote: true,
        },
        {
            id: 'distillation',
            name: 'Distillation Engineer (Hinton + Sutskever)',
            chair: 8,
            domain: 'distillation-dataset',
            question: 'O que o AIOS está produzindo agora que poderia se tornar dataset de treino para um modelo local? Cada golden example gerado, cada ciclo evolutivo executado, cada decisão do Council documentada — estamos estruturando isso para que um modelo de 3B-7B parâmetros possa aprender com isso?',
            responsibilities: [
                'TRACE_STRUCTURING: Capture input → reasoning trace → output → PM3 score for fine-tuning',
                'SYNTHETIC_DATASET_CURATION: Identify golden examples that teach PATTERNS, not just solve problems',
                'OPPORTUNITY_ALERT: When output score ≥ 9.5, flag as distillation candidate',
                'INDEPENDENCE_ROADMAP: Every 5 cycles, report on local model replication capability',
            ],
            executesAfterPhase: 5, // Runs after verification, before cycle close
        },
    ],
    metamind: {
        id: 'metamind',
        name: 'Metamind',
        role: 'Synthesizer — does not vote. Deduplicates, identifies convergences, produces unified verdict.',
    },
    votingOptions: ['APPLY', 'REJECT', 'DEFER'],
});

// ─────────────────────────────────────────────────────────────
// CRITICAL FILES TO HASH FOR BASELINE
// ─────────────────────────────────────────────────────────────
const CRITICAL_FILES = Object.freeze([
    '.aios-core/opus-replicator/constitutional-layer-v3.md',
    '.aios-core/opus-replicator/SELF_CONTEXT.md',
    '.aios-core/opus-replicator/pm1-reasoning-master.md',
    '.aios-core/opus-replicator/pm2-execution-master.md',
    '.aios-core/opus-replicator/pm3-evaluation-master.md',
    '.aios-core/memory/quality-baseline.json',
    '.aios-core/memory/anti-patterns.md',
    'scripts/kernel-bridge.js',
    'scripts/event-bus.js',
    'scripts/input-refiner.js',
    'scripts/self-correction.js',
    'scripts/harvest-gold.js',
    'KAIROS_ENGINEERING_BIBLE.md',
    'KAIROS_ENGINEERING_BIBLE_v2.md',
    'scripts/evolution/evolution-engine.js',
    'scripts/evolution/circuit-breaker.config.js',
]);

// ─────────────────────────────────────────────────────────────
// PATHS
// ─────────────────────────────────────────────────────────────
const PATHS = Object.freeze({
    PROJECT_ROOT,
    EVOLUTION_DIR: path.join(PROJECT_ROOT, 'scripts', 'evolution'),
    REPORTS_DIR: path.join(PROJECT_ROOT, '.aios-core', 'data', 'evolution', 'reports'),
    BACKUPS_DIR: path.join(PROJECT_ROOT, '.aios-core', 'data', 'evolution', 'backups'),
    CYCLE_HISTORY: path.join(PROJECT_ROOT, '.aios-core', 'data', 'evolution', 'cycle-history.json'),
    BASELINE_FROZEN: path.join(PROJECT_ROOT, 'scripts', 'evolution', 'baseline-frozen.json'),
    QUALITY_BASELINE: path.join(PROJECT_ROOT, '.aios-core', 'memory', 'quality-baseline.json'),
    ANTI_PATTERNS: path.join(PROJECT_ROOT, '.aios-core', 'memory', 'anti-patterns.md'),
    SELF_CONTEXT: path.join(PROJECT_ROOT, '.aios-core', 'opus-replicator', 'SELF_CONTEXT.md'),
    // Distillation Dataset (Chair 8)
    DISTILLATION_DIR: path.join(PROJECT_ROOT, '.aios-core', 'memory', 'distillation-dataset'),
    DISTILLATION_TRACES: path.join(PROJECT_ROOT, '.aios-core', 'memory', 'distillation-dataset', 'traces'),
    DISTILLATION_CURATED: path.join(PROJECT_ROOT, '.aios-core', 'memory', 'distillation-dataset', 'curated'),
    DISTILLATION_ROADMAP: path.join(PROJECT_ROOT, '.aios-core', 'memory', 'distillation-dataset', 'roadmap.json'),
});

// ─────────────────────────────────────────────────────────────
// UTILITY: Hash a file
// ─────────────────────────────────────────────────────────────

/**
 * @purpose Compute SHA-256 hash of a file
 * @inputs {string} filePath - absolute or relative path
 * @outputs {string|null} hex hash or null if file doesn't exist
 */
function hashFile(filePath) {
    const abs = path.isAbsolute(filePath) ? filePath : path.join(PROJECT_ROOT, filePath);
    try {
        const content = fs.readFileSync(abs, 'utf8');
        return crypto.createHash('sha256').update(content).digest('hex');
    } catch {
        return null;
    }
}

/**
 * @purpose Classify risk level for a given file path
 * @inputs {string} relativePath - path relative to project root
 * @outputs {string} 'LOW' | 'MEDIUM' | 'HIGH'
 */
function classifyRisk(relativePath) {
    const normalized = relativePath.replace(/\\/g, '/');

    // Check HIGH first (most restrictive)
    for (const pattern of RISK_CLASSIFICATION.HIGH.patterns) {
        if (pattern.test(normalized)) return 'HIGH';
    }
    // Then MEDIUM
    for (const pattern of RISK_CLASSIFICATION.MEDIUM.patterns) {
        if (pattern.test(normalized)) return 'MEDIUM';
    }
    // Default to LOW
    return 'LOW';
}

/**
 * @purpose Check if a file path is in the forbidden list
 * @inputs {string} relativePath - path relative to project root
 * @outputs {boolean}
 */
function isForbidden(relativePath) {
    const normalized = relativePath.replace(/\\/g, '/');
    return FORBIDDEN_COMPONENTS.includes(normalized);
}

// ─────────────────────────────────────────────────────────────
// FROZEN CONFIG EXPORT
// ─────────────────────────────────────────────────────────────
const CONFIG = Object.freeze({
    VERSION: '1.0.0',
    CREATED: '2026-02-18T21:56:00-03:00',
    FORBIDDEN_COMPONENTS,
    CYCLE_BUDGET,
    RISK_CLASSIFICATION,
    CONVERGENCE,
    COUNCIL,
    CRITICAL_FILES,
    PATHS,
    hashFile,
    classifyRisk,
    isForbidden,
});

module.exports = CONFIG;

// ─────────────────────────────────────────────────────────────
// SELF-TEST (node scripts/evolution/circuit-breaker.config.js)
// ─────────────────────────────────────────────────────────────
if (require.main === module) {
    console.log('⚡ Circuit Breaker Config v1.0.0\n');
    console.log('FORBIDDEN COMPONENTS:');
    FORBIDDEN_COMPONENTS.forEach(f => console.log(`  🚫 ${f}`));
    console.log('\nCYCLE BUDGET:');
    Object.entries(CYCLE_BUDGET).forEach(([k, v]) =>
        console.log(`  ${k.padEnd(25)} → ${v === Infinity ? '∞' : v}`)
    );
    console.log('\nCOUNCIL MEMBERS:');
    COUNCIL.members.forEach(m =>
        console.log(`  Chair ${m.chair}: ${m.name} (${m.domain})`)
    );
    console.log(`  Synthesizer: ${COUNCIL.metamind.name}`);
    console.log('\nCONVERGENCE:');
    Object.entries(CONVERGENCE).forEach(([k, v]) =>
        console.log(`  ${k.padEnd(35)} → ${v}`)
    );
    console.log('\nRISK CLASSIFICATION TEST:');
    console.log(`  docs/README.md → ${classifyRisk('docs/README.md')}`);
    console.log(`  scripts/kernel-bridge.js → ${classifyRisk('scripts/kernel-bridge.js')}`);
    console.log(`  .aios-core/opus-replicator/constitutional-layer-v3.md → ${classifyRisk('.aios-core/opus-replicator/constitutional-layer-v3.md')}`);
    console.log('\nFORBIDDEN CHECK:');
    console.log(`  evolution-engine.js → ${isForbidden('scripts/evolution/evolution-engine.js')}`);
    console.log(`  kernel-bridge.js → ${isForbidden('scripts/kernel-bridge.js')}`);
    console.log('\n✅ Config loaded and validated.');
}
