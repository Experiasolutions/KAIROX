#!/usr/bin/env node

/**
 * @module cognitive-state-engine
 * @version 1.0.0
 * @purpose Persist cognitive state across sessions. This is the FOUNDATION of
 *          the Noûs layer — the component that transforms the AIOS from
 *          "system that reboots" to "system that remembers."
 *
 *          Unlike memory-system.js (which stores facts), this engine stores
 *          COGNITIVE PATTERNS: how the AIOS thinks, what it's learned about
 *          thinking, what tendencies it exhibits, and how these evolve.
 *
 * @inputs  Session observations (scores, patterns, strengths, blindspots)
 * @outputs Persisted cognitive state + boot context + drift detection
 * @domain-purity ZERO domain words. This file is ENGINE-level.
 *
 * @architecture
 *   STATE SCHEMA:
 *     identity     → who the AIOS is (anchored)
 *     strengths    → what it does well (evolved)
 *     patterns     → recurring behaviors observed (accumulated)
 *     blindspots   → known limitations (self-aware)
 *     evolution    → how the above has changed over time (compressed)
 *
 *   OPERATIONS:
 *     boot()       → Load state for new session (read)
 *     observe()    → Record cognitive observation (append)
 *     compress()   → Distill patterns from observations (transform)
 *     drift()      → Compare current state vs identity anchor (verify)
 *     snapshot()   → Generate boot context for SELF_CONTEXT injection (export)
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────────────
// PATHS
// ─────────────────────────────────────────────────────────────

const PROJECT_ROOT = path.join(__dirname, '..', '..');
const STATE_DIR = path.join(PROJECT_ROOT, '.aios-core', 'noesis');
const STATE_FILE = path.join(STATE_DIR, 'cognitive-state.json');
const ANCHOR_FILE = path.join(STATE_DIR, 'identity-anchor.json');
const OBSERVATIONS_DIR = path.join(STATE_DIR, 'observations');
const HISTORY_FILE = path.join(STATE_DIR, 'state-history.json');

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

const VERSION = '1.0.0';
const MAX_OBSERVATIONS_BEFORE_COMPRESS = 10;
const MAX_PATTERNS = 30;
const MAX_HISTORY_SNAPSHOTS = 50;
const DRIFT_THRESHOLD = 0.2; // 20% divergence triggers alert

// ─────────────────────────────────────────────────────────────
// SAFE IMPORTS
// ─────────────────────────────────────────────────────────────

let eventBus = null;
try {
    eventBus = require(path.join(__dirname, '..', 'event-bus'));
} catch {
    // Standalone mode
}

// ─────────────────────────────────────────────────────────────
// SCHEMA — The shape of cognitive state
// ─────────────────────────────────────────────────────────────

function createEmptyState() {
    return {
        version: VERSION,
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        sessionCount: 0,

        // WHO — anchored identity (loaded from identity-anchor.json)
        identity: {
            name: 'AIOS Noûs',
            anchors: [],           // Immutable declarations
            anchorSource: null,    // Path to anchor file
        },

        // WHAT I DO WELL — evolved through observation
        strengths: [],
        // Example: { id: 'str_001', description: '...', confidence: 0.8,
        //            firstObserved: '...', lastConfirmed: '...', evidence: 3 }

        // RECURRING BEHAVIORS — accumulated patterns
        patterns: [],
        // Example: { id: 'pat_001', description: '...', frequency: 5,
        //            firstSeen: '...', lastSeen: '...', type: 'positive|negative|neutral' }

        // KNOWN LIMITATIONS — self-awareness
        blindspots: [],
        // Example: { id: 'bs_001', description: '...', severity: 'low|medium|high',
        //            discoveredAt: '...', addressed: false }

        // PENDING OBSERVATIONS — not yet compressed into patterns
        pendingObservations: [],

        // COGNITIVE METRICS — quantitative state
        metrics: {
            averageScore: 0,
            averageDepth: 0,
            totalCycles: 0,
            goldenExamplesGenerated: 0,
            antiPatternsTriggered: 0,
            driftChecks: 0,
            driftAlerts: 0,
        },
    };
}

// ─────────────────────────────────────────────────────────────
// PERSISTENCE — Read/Write state
// ─────────────────────────────────────────────────────────────

function ensureDirs() {
    for (const dir of [STATE_DIR, OBSERVATIONS_DIR]) {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    }
}

function loadState() {
    ensureDirs();
    if (!fs.existsSync(STATE_FILE)) {
        const state = createEmptyState();
        saveState(state);
        return state;
    }
    try {
        return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    } catch (err) {
        console.error(`[cognitive-state] Error loading state: ${err.message}`);
        const state = createEmptyState();
        state._recoveredFrom = 'corrupted';
        saveState(state);
        return state;
    }
}

function saveState(state) {
    ensureDirs();
    state.lastUpdated = new Date().toISOString();
    state.version = VERSION;
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function loadAnchor() {
    if (!fs.existsSync(ANCHOR_FILE)) return null;
    try {
        return JSON.parse(fs.readFileSync(ANCHOR_FILE, 'utf-8'));
    } catch {
        return null;
    }
}

function loadHistory() {
    if (!fs.existsSync(HISTORY_FILE)) return [];
    try {
        return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    } catch {
        return [];
    }
}

function saveHistory(history) {
    if (history.length > MAX_HISTORY_SNAPSHOTS) {
        history = history.slice(-MAX_HISTORY_SNAPSHOTS);
    }
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

// ─────────────────────────────────────────────────────────────
// BOOT — Start a new session with accumulated state
// ─────────────────────────────────────────────────────────────

/**
 * @purpose Load cognitive state for a new session. Merges persisted state
 *          with identity anchor. Increments session count.
 * @returns {Object} Boot context with full cognitive state
 */
function boot() {
    const state = loadState();
    const anchor = loadAnchor();

    // Merge anchor into identity
    if (anchor && anchor.immutable_declarations) {
        state.identity.anchors = anchor.immutable_declarations;
        state.identity.anchorSource = ANCHOR_FILE;
        state.identity.anchorVersion = anchor.version || '0.1.0';
    }

    // Increment session
    state.sessionCount += 1;

    // Auto-compress if pending observations exceed threshold
    if (state.pendingObservations.length >= MAX_OBSERVATIONS_BEFORE_COMPRESS) {
        compress(state);
    }

    saveState(state);

    // Emit boot event
    if (eventBus && typeof eventBus.emit === 'function') {
        eventBus.emit('noesis.state.booted', {
            sessionCount: state.sessionCount,
            strengths: state.strengths.length,
            patterns: state.patterns.length,
            blindspots: state.blindspots.length,
        });
    }

    return state;
}

// ─────────────────────────────────────────────────────────────
// OBSERVE — Record cognitive observation from a session
// ─────────────────────────────────────────────────────────────

/**
 * @purpose Record an observation about AIOS cognitive behavior.
 *          Observations are raw — they get compressed into patterns later.
 * @param {Object} observation
 * @param {string} observation.type - 'strength'|'pattern'|'blindspot'|'metric'
 * @param {string} observation.description - What was observed
 * @param {number} observation.score - Quality score 0-10 (if applicable)
 * @param {number} observation.depthScore - Depth score 0-4 (if applicable)
 * @param {Object} observation.context - Additional context
 * @returns {Object} The stored observation
 */
function observe(observation) {
    const state = loadState();

    const obs = {
        id: `obs_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        type: observation.type || 'pattern',
        description: observation.description || '',
        score: observation.score != null ? observation.score : null,
        depthScore: observation.depthScore != null ? observation.depthScore : null,
        context: observation.context || {},
        timestamp: new Date().toISOString(),
        session: state.sessionCount,
    };

    // High-severity penalty for Pilar 3 (Investigative Mode Violation / Direct Assumption)
    if (obs.description && obs.description.includes('AP-006')) {
        obs.type = 'blindspot';
        if (obs.score != null) obs.score = Math.max(0, obs.score - 4); // Heavy penalty
        if (obs.depthScore != null) obs.depthScore = 0;
        obs.context.investigativeModeViolation = true;
    }

    state.pendingObservations.push(obs);

    // Update metrics
    if (obs.score != null) {
        const total = state.metrics.totalCycles + 1;
        state.metrics.averageScore =
            ((state.metrics.averageScore * state.metrics.totalCycles) + obs.score) / total;
        state.metrics.totalCycles = total;
    }
    if (obs.depthScore != null) {
        const total = state.metrics.totalCycles || 1;
        state.metrics.averageDepth =
            ((state.metrics.averageDepth * (total - 1)) + obs.depthScore) / total;
    }

    // Auto-compress if threshold reached
    if (state.pendingObservations.length >= MAX_OBSERVATIONS_BEFORE_COMPRESS) {
        compress(state);
    }

    saveState(state);

    // Persist observation to file for audit trail
    const obsFile = path.join(OBSERVATIONS_DIR,
        `${new Date().toISOString().split('T')[0]}.jsonl`);
    fs.appendFileSync(obsFile, JSON.stringify(obs) + '\n');

    // Emit observation event
    if (eventBus && typeof eventBus.emit === 'function') {
        eventBus.emit('noesis.state.observed', {
            id: obs.id,
            type: obs.type,
            score: obs.score,
        });
    }

    return obs;
}

// ─────────────────────────────────────────────────────────────
// COMPRESS — Distill pending observations into patterns
// ─────────────────────────────────────────────────────────────

/**
 * @purpose Compress raw observations into consolidated patterns.
 *          This is where learning happens: repeated observations
 *          become recognized patterns. One-off observations are
 *          kept as pending or discarded.
 * @param {Object} state - Direct state reference (avoid reload)
 */
function compress(state) {
    if (!state) state = loadState();
    if (state.pendingObservations.length === 0) return;

    const pending = state.pendingObservations;

    // ── Group observations by description similarity ──
    const groups = {};
    for (const obs of pending) {
        // Simple similarity: normalize and group by first 50 chars
        const key = obs.description.toLowerCase().trim().substring(0, 50);
        if (!groups[key]) groups[key] = [];
        groups[key].push(obs);
    }

    for (const [, group] of Object.entries(groups)) {
        if (group.length >= 2) {
            // Recurring observation → promote to pattern
            const exemplar = group[0];
            const existingPattern = state.patterns
                .find(p => p.description.toLowerCase().substring(0, 50) ===
                    exemplar.description.toLowerCase().substring(0, 50));

            if (existingPattern) {
                // Reinforce existing pattern
                existingPattern.frequency += group.length;
                existingPattern.lastSeen = new Date().toISOString();
            } else {
                // New pattern discovered
                const pattern = {
                    id: `pat_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                    description: exemplar.description,
                    type: exemplar.type === 'strength' ? 'positive'
                        : exemplar.type === 'blindspot' ? 'negative' : 'neutral',
                    frequency: group.length,
                    firstSeen: group[0].timestamp,
                    lastSeen: group[group.length - 1].timestamp,
                    sourceObservations: group.map(g => g.id),
                };
                state.patterns.push(pattern);
            }
        } else if (group.length === 1 && group[0].type === 'strength') {
            // Single strength observation → add as strength candidate
            const obs = group[0];
            const existingStrength = state.strengths
                .find(s => s.description.toLowerCase().substring(0, 50) ===
                    obs.description.toLowerCase().substring(0, 50));

            if (existingStrength) {
                existingStrength.evidence += 1;
                existingStrength.lastConfirmed = new Date().toISOString();
                existingStrength.confidence = Math.min(1.0,
                    existingStrength.confidence + 0.1);
            } else {
                state.strengths.push({
                    id: `str_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                    description: obs.description,
                    confidence: 0.3,
                    firstObserved: obs.timestamp,
                    lastConfirmed: obs.timestamp,
                    evidence: 1,
                });
            }
        } else if (group.length === 1 && group[0].type === 'blindspot') {
            // Single blindspot → register
            const obs = group[0];
            const existing = state.blindspots
                .find(b => b.description.toLowerCase().substring(0, 50) ===
                    obs.description.toLowerCase().substring(0, 50));

            if (!existing) {
                state.blindspots.push({
                    id: `bs_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                    description: obs.description,
                    severity: obs.score != null && obs.score < 5 ? 'high'
                        : obs.score != null && obs.score < 7 ? 'medium' : 'low',
                    discoveredAt: obs.timestamp,
                    addressed: false,
                });
            }
        }
    }

    // Trim patterns to max
    if (state.patterns.length > MAX_PATTERNS) {
        // Keep most frequent patterns
        state.patterns.sort((a, b) => b.frequency - a.frequency);
        state.patterns = state.patterns.slice(0, MAX_PATTERNS);
    }

    // Clear pending
    state.pendingObservations = [];

    // Save snapshot to history
    const history = loadHistory();
    history.push({
        timestamp: new Date().toISOString(),
        session: state.sessionCount,
        metrics: { ...state.metrics },
        strengthsCount: state.strengths.length,
        patternsCount: state.patterns.length,
        blindspotsCount: state.blindspots.length,
        compressedFrom: pending.length,
    });
    saveHistory(history);

    // Emit compression event
    if (eventBus && typeof eventBus.emit === 'function') {
        eventBus.emit('noesis.state.compressed', {
            observationsProcessed: pending.length,
            patternsTotal: state.patterns.length,
        });
    }
}

// ─────────────────────────────────────────────────────────────
// DRIFT — Compare current state vs identity anchor
// ─────────────────────────────────────────────────────────────

/**
 * @purpose Verify cognitive coherence with identity anchor.
 *          Detects when the AIOS is diverging from its foundational identity.
 * @returns {Object} Drift analysis { score, aligned, divergent, alert }
 */
function drift() {
    const state = loadState();
    const anchor = loadAnchor();

    if (!anchor || !anchor.immutable_declarations) {
        return {
            score: null,
            alert: false,
            message: 'No identity anchor found. Create identity-anchor.json first.',
            anchorsChecked: 0,
        };
    }

    const declarations = anchor.immutable_declarations;
    const aligned = [];
    const divergent = [];

    // Check each anchor declaration against current state
    for (const declaration of declarations) {
        const lower = declaration.toLowerCase();

        // Evidence check: is there a pattern, strength, or blindspot
        // that relates to this anchor?
        const hasEvidence =
            state.strengths.some(s => s.description.toLowerCase().includes(lower.substring(0, 30))) ||
            state.patterns.some(p => p.description.toLowerCase().includes(lower.substring(0, 30)) && p.type === 'positive') ||
            // Check if no contradicting blindspot exists
            !state.blindspots.some(b => b.description.toLowerCase().includes(lower.substring(0, 30)) && !b.addressed);

        if (hasEvidence) {
            aligned.push(declaration);
        } else {
            divergent.push(declaration);
        }
    }

    const driftScore = divergent.length / declarations.length;
    const alert = driftScore > DRIFT_THRESHOLD;

    // Update metrics
    state.metrics.driftChecks += 1;
    if (alert) state.metrics.driftAlerts += 1;
    saveState(state);

    // Emit drift event
    if (eventBus && typeof eventBus.emit === 'function') {
        eventBus.emit('noesis.state.drift', {
            score: driftScore,
            alert,
            aligned: aligned.length,
            divergent: divergent.length,
        });
    }

    return {
        score: driftScore,
        alert,
        message: alert
            ? `⚠️ DRIFT ALERT: ${divergent.length}/${declarations.length} anchors without behavioral evidence`
            : `✅ Identity coherent: ${aligned.length}/${declarations.length} anchors confirmed`,
        aligned,
        divergent,
        threshold: DRIFT_THRESHOLD,
    };
}

// ─────────────────────────────────────────────────────────────
// SNAPSHOT — Generate boot context for SELF_CONTEXT injection
// ─────────────────────────────────────────────────────────────

/**
 * @purpose Generate a compressed text snapshot of cognitive state
 *          suitable for injection into SELF_CONTEXT.md or prompt context.
 * @returns {string} Markdown-formatted cognitive state summary
 */
function snapshot() {
    const state = loadState();

    const lines = [];
    lines.push('## 🧠 Cognitive State (Auto-Generated)');
    lines.push(`> Session #${state.sessionCount} | Updated: ${state.lastUpdated}`);
    lines.push('');

    // Strengths
    if (state.strengths.length > 0) {
        lines.push('### Strengths');
        const top = state.strengths
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 5);
        for (const s of top) {
            lines.push(`- ${s.description} (confidence: ${(s.confidence * 100).toFixed(0)}%, evidence: ${s.evidence})`);
        }
        lines.push('');
    }

    // Patterns
    if (state.patterns.length > 0) {
        lines.push('### Learned Patterns');
        const topPatterns = state.patterns
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, 5);
        for (const p of topPatterns) {
            const icon = p.type === 'positive' ? '✅' : p.type === 'negative' ? '⚠️' : '📊';
            lines.push(`- ${icon} ${p.description} (frequency: ${p.frequency})`);
        }
        lines.push('');
    }

    // Blindspots
    const activeBlindspots = state.blindspots.filter(b => !b.addressed);
    if (activeBlindspots.length > 0) {
        lines.push('### Known Blindspots');
        for (const b of activeBlindspots.slice(0, 3)) {
            lines.push(`- ⚠️ ${b.description} (severity: ${b.severity})`);
        }
        lines.push('');
    }

    // Metrics
    lines.push('### Metrics');
    lines.push(`- Average Score: ${state.metrics.averageScore.toFixed(1)}/10`);
    lines.push(`- Average Depth: ${state.metrics.averageDepth.toFixed(1)}/4`);
    lines.push(`- Total Cycles: ${state.metrics.totalCycles}`);
    lines.push(`- Drift Checks: ${state.metrics.driftChecks} (alerts: ${state.metrics.driftAlerts})`);
    lines.push('');

    return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────
// CLI — Test and inspect
// ─────────────────────────────────────────────────────────────

function runTest() {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║   🧠 Cognitive State Engine — Self-Test (v' + VERSION + ')   ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log('');

    let passed = 0;
    let failed = 0;

    function test(name, fn) {
        try {
            fn();
            console.log(`  ✅ ${name}`);
            passed++;
        } catch (err) {
            console.log(`  ❌ ${name}: ${err.message}`);
            failed++;
        }
    }

    function assert(condition, msg) {
        if (!condition) throw new Error(msg || 'Assertion failed');
    }

    // Test 1: Create empty state
    test('Create empty state', () => {
        const state = createEmptyState();
        assert(state.version === VERSION, 'Wrong version');
        assert(state.sessionCount === 0, 'Session count not 0');
        assert(Array.isArray(state.strengths), 'Strengths not array');
        assert(Array.isArray(state.patterns), 'Patterns not array');
        assert(Array.isArray(state.blindspots), 'Blindspots not array');
    });

    // Test 2: Boot persists and increments session
    test('Boot persists and increments session', () => {
        const state1 = boot();
        const s1 = state1.sessionCount;
        const state2 = boot();
        assert(state2.sessionCount === s1 + 1,
            `Expected session ${s1 + 1}, got ${state2.sessionCount}`);
    });

    // Test 3: Observe adds pending observation
    test('Observe adds pending observation', () => {
        const obs = observe({
            type: 'strength',
            description: 'Test: architectural analysis is consistently deep',
            score: 9.2,
            depthScore: 3,
        });
        assert(obs.id.startsWith('obs_'), 'Bad observation ID');
        assert(obs.description.includes('architectural'), 'Description lost');

        const state = loadState();
        assert(state.pendingObservations.length > 0, 'Observation not pending');
    });

    // Test 4: Observe updates metrics
    test('Observe updates metrics', () => {
        observe({
            type: 'pattern',
            description: 'Test: metric update verification',
            score: 8.5,
        });
        const state = loadState();
        assert(state.metrics.totalCycles > 0, 'Total cycles not incremented');
        assert(state.metrics.averageScore > 0, 'Average score not updated');
    });

    // Test 5: Compress creates patterns from duplicates
    test('Compress creates patterns from duplicates', () => {
        // Add similar observations
        observe({ type: 'pattern', description: 'Recurring test pattern alpha' });
        observe({ type: 'pattern', description: 'Recurring test pattern alpha' });
        observe({ type: 'pattern', description: 'Recurring test pattern alpha' });

        const state = loadState();
        compress(state);
        saveState(state);

        assert(state.patterns.some(p =>
            p.description.toLowerCase().includes('recurring test pattern')),
            'Pattern not created from recurring observations');
        assert(state.pendingObservations.length === 0, 'Pending not cleared');
    });

    // Test 6: Snapshot generates readable text
    test('Snapshot generates readable text', () => {
        const snap = snapshot();
        assert(snap.includes('Cognitive State'), 'Missing header');
        assert(snap.includes('Metrics'), 'Missing metrics');
        assert(snap.length > 100, 'Snapshot too short');
    });

    // Test 7: Drift without anchor returns graceful message
    test('Drift without anchor returns graceful message', () => {
        const result = drift();
        // May or may not have anchor — check shape
        assert(typeof result.alert === 'boolean' || result.score === null, 'Bad drift shape');
        assert(typeof result.message === 'string', 'Missing drift message');
    });

    // Test 8: State persists across load/save cycle
    test('State persists across load/save cycle', () => {
        const state = loadState();
        state._testMarker = 'persistence_verified';
        saveState(state);

        const reloaded = loadState();
        assert(reloaded._testMarker === 'persistence_verified',
            'Persistence failed: marker not found');

        // Clean up marker
        delete reloaded._testMarker;
        saveState(reloaded);
    });

    // Test 9: History accumulates compression events
    test('History accumulates compression events', () => {
        const history = loadHistory();
        assert(Array.isArray(history), 'History not array');
        // Should have at least 1 entry from compression test
        assert(history.length > 0, 'History empty after compression');
        const last = history[history.length - 1];
        assert(last.session != null, 'History entry missing session');
        assert(last.timestamp != null, 'History entry missing timestamp');
    });

    // Test 10: Domain purity
    // DOMAIN_PURITY_TEST_MARKER — scanning stops here
    test('Domain purity (no client words)', () => {
        const fullSrc = fs.readFileSync(__filename, 'utf-8');
        // Only scan code ABOVE this test marker to avoid self-detection
        const marker = 'DOMAIN_PURITY_TEST_MARKER';
        const idx = fullSrc.indexOf(marker);
        const srcToScan = (idx > 0 ? fullSrc.substring(0, idx) : fullSrc).toLowerCase();
        const words = ['patient', 'clinic', 'appointment', 'scheduling',
            'whatsapp', 'evolution api', 'fisio', 'consulta'];
        for (const word of words) {
            assert(!srcToScan.includes(word),
                `Domain contamination: found "${word}" in engine file`);
        }
    });

    console.log('');
    console.log(`  Results: ${passed} passed, ${failed} failed`);
    console.log('');

    return { passed, failed };
}

function showDashboard() {
    const state = loadState();

    console.log('');
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║    🧠 Cognitive State Engine — Dashboard (v' + VERSION + ')   ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`  Sessions:          ${state.sessionCount}`);
    console.log(`  Strengths:         ${state.strengths.length}`);
    console.log(`  Patterns:          ${state.patterns.length}`);
    console.log(`  Blindspots:        ${state.blindspots.filter(b => !b.addressed).length} active`);
    console.log(`  Pending Obs:       ${state.pendingObservations.length}`);
    console.log(`  Avg Score:         ${state.metrics.averageScore.toFixed(1)}/10`);
    console.log(`  Avg Depth:         ${state.metrics.averageDepth.toFixed(1)}/4`);
    console.log(`  Total Cycles:      ${state.metrics.totalCycles}`);
    console.log(`  Last Updated:      ${state.lastUpdated}`);

    // Identity anchor status
    const anchor = loadAnchor();
    if (anchor) {
        console.log(`  Identity Anchor:   ✅ ${anchor.immutable_declarations.length} declarations (v${anchor.version || '?'})`);
    } else {
        console.log('  Identity Anchor:   ❌ Not found');
    }

    console.log('');

    // Top patterns
    if (state.patterns.length > 0) {
        console.log('  📊 Top Patterns:');
        const top = state.patterns.sort((a, b) => b.frequency - a.frequency).slice(0, 5);
        for (const p of top) {
            const icon = p.type === 'positive' ? '✅' : p.type === 'negative' ? '⚠️' : '📊';
            console.log(`     ${icon} ${p.description.substring(0, 60)} (×${p.frequency})`);
        }
        console.log('');
    }

    // Drift check
    const driftResult = drift();
    console.log(`  🔍 Drift: ${driftResult.message}`);
    console.log('');
}

// ─────────────────────────────────────────────────────────────
// CLI ENTRY POINT
// ─────────────────────────────────────────────────────────────

if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.includes('--test')) {
        runTest();
    } else if (args.includes('--snapshot')) {
        console.log(snapshot());
    } else if (args.includes('--drift')) {
        const result = drift();
        console.log(JSON.stringify(result, null, 2));
    } else if (args.includes('--dashboard') || args.length === 0) {
        showDashboard();
    } else {
        console.log('Cognitive State Engine v' + VERSION);
        console.log('  --test        Run self-test');
        console.log('  --snapshot    Generate boot context');
        console.log('  --drift       Run drift detection');
        console.log('  --dashboard   Show dashboard (default)');
    }
}

// ─────────────────────────────────────────────────────────────
// MODULE EXPORTS
// ─────────────────────────────────────────────────────────────

module.exports = {
    boot,
    observe,
    compress,
    drift,
    snapshot,
    loadState,
    saveState,
    createEmptyState,
    VERSION,
};
