/**
 * @module convergence-guard
 * @purpose Anti-loop protection for the Evolution Engine. Tracks cycle history,
 *          detects oscillation patterns (A→B→A), enforces minimum improvement
 *          thresholds, and prevents runaway self-modification.
 * @inputs  Previous cycle results, current proposal delta
 * @outputs { converged: boolean, reason: string, metrics: object }
 * @emits   None
 * @dependencies circuit-breaker.config.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const CONFIG = require('./circuit-breaker.config');

// ─────────────────────────────────────────────────────────────
// CYCLE HISTORY MANAGEMENT
// ─────────────────────────────────────────────────────────────

/**
 * @purpose Load cycle history from disk
 * @inputs  None
 * @outputs {Array} Array of past cycle records
 */
function loadCycleHistory() {
    try {
        const raw = fs.readFileSync(CONFIG.PATHS.CYCLE_HISTORY, 'utf8');
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

/**
 * @purpose Save cycle history to disk
 * @inputs  {Array} history - Array of cycle records
 * @outputs {string} Path where saved
 */
function saveCycleHistory(history) {
    const dir = path.dirname(CONFIG.PATHS.CYCLE_HISTORY);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG.PATHS.CYCLE_HISTORY, JSON.stringify(history, null, 2), 'utf8');
    return CONFIG.PATHS.CYCLE_HISTORY;
}

/**
 * @purpose Record a completed cycle in history
 * @inputs  {Object} cycleResult - { proposals: [{file, changeType, hash}], improvements: {dimension: delta}, applied: boolean }
 * @outputs {void}
 */
function recordCycle(cycleResult) {
    const history = loadCycleHistory();
    history.push({
        timestamp: new Date().toISOString(),
        proposals: (cycleResult.proposals || []).map(p => ({
            file: p.file,
            changeType: p.changeType,
            hash: crypto.createHash('md5').update(`${p.file}:${p.changeType}`).digest('hex'),
        })),
        improvements: cycleResult.improvements || {},
        applied: cycleResult.applied || false,
        converged: cycleResult.converged || false,
    });

    // Keep only last 50 cycles
    if (history.length > 50) {
        history.splice(0, history.length - 50);
    }

    saveCycleHistory(history);
}

// ─────────────────────────────────────────────────────────────
// OSCILLATION DETECTION
// ─────────────────────────────────────────────────────────────

/**
 * @purpose Detect if a proposal would create an oscillation pattern (A→B→A→B)
 * @inputs  {Object} proposal - { file: string, changeType: string }
 * @outputs { oscillating: boolean, evidence: string|null }
 */
function detectOscillation(proposal) {
    const history = loadCycleHistory();
    const window = history.slice(-CONFIG.CONVERGENCE.OSCILLATION_WINDOW);

    const proposalHash = crypto
        .createHash('md5')
        .update(`${proposal.file}:${proposal.changeType}`)
        .digest('hex');

    // Check if this exact (file, changeType) was proposed and then reverted
    const matches = [];
    for (const cycle of window) {
        for (const p of (cycle.proposals || [])) {
            if (p.hash === proposalHash) {
                matches.push(cycle.timestamp);
            }
        }
    }

    if (matches.length >= 2) {
        return {
            oscillating: true,
            evidence: `Proposal "${proposal.file}:${proposal.changeType}" appeared ${matches.length} times in the last ${CONFIG.CONVERGENCE.OSCILLATION_WINDOW} cycles: ${matches.join(', ')}`,
        };
    }

    return { oscillating: false, evidence: null };
}

// ─────────────────────────────────────────────────────────────
// CONVERGENCE CHECK
// ─────────────────────────────────────────────────────────────

/**
 * @purpose Check if the evolution cycle should proceed based on convergence criteria
 * @inputs  {Object} options - { proposals: Array, currentScores: Object, previousScores: Object }
 * @outputs { converged: boolean, reason: string, metrics: Object, canProceed: boolean }
 */
function checkConvergence(options = {}) {
    const { proposals = [], currentScores = {}, previousScores = {} } = options;
    const history = loadCycleHistory();
    const metrics = {
        consecutiveFailures: 0,
        oscillationsDetected: 0,
        improvementDelta: 0,
        historyLength: history.length,
    };

    // ── CHECK 1: Max consecutive failures ──
    let failures = 0;
    for (let i = history.length - 1; i >= 0; i--) {
        if (!history[i].converged) {
            failures++;
        } else {
            break;
        }
    }
    metrics.consecutiveFailures = failures;

    if (failures >= CONFIG.CONVERGENCE.MAX_CONSECUTIVE_FAILURES) {
        return {
            converged: false,
            reason: `STOP: ${failures} consecutive cycles without improvement (max: ${CONFIG.CONVERGENCE.MAX_CONSECUTIVE_FAILURES}). Awaiting Gabriel's diagnosis.`,
            metrics,
            canProceed: false,
        };
    }

    // ── CHECK 2: Oscillation detection ──
    for (const proposal of proposals) {
        const { oscillating, evidence } = detectOscillation(proposal);
        if (oscillating) {
            metrics.oscillationsDetected++;
            return {
                converged: false,
                reason: `LOOP DETECTED: ${evidence}`,
                metrics,
                canProceed: false,
            };
        }
    }

    // ── CHECK 3: Minimum improvement threshold ──
    if (Object.keys(previousScores).length > 0 && Object.keys(currentScores).length > 0) {
        const dimensions = new Set([...Object.keys(previousScores), ...Object.keys(currentScores)]);
        let totalDelta = 0;
        let regressionsDetected = false;

        for (const dim of dimensions) {
            const prev = previousScores[dim] || 0;
            const curr = currentScores[dim] || 0;
            const delta = prev > 0 ? ((curr - prev) / prev) * 100 : 0;

            if (delta < -1) {
                // Regression detected (allowing 1% noise margin)
                regressionsDetected = true;
                metrics[`regression_${dim}`] = delta;
            }
            totalDelta += delta;
        }

        metrics.improvementDelta = totalDelta / dimensions.size;

        if (regressionsDetected) {
            return {
                converged: false,
                reason: `REGRESSION: Non-target dimensions regressed. Details: ${JSON.stringify(metrics)}`,
                metrics,
                canProceed: false,
            };
        }

        if (metrics.improvementDelta < CONFIG.CONVERGENCE.MIN_IMPROVEMENT_PERCENT) {
            return {
                converged: false,
                reason: `INSUFFICIENT: Average improvement ${metrics.improvementDelta.toFixed(2)}% < minimum ${CONFIG.CONVERGENCE.MIN_IMPROVEMENT_PERCENT}%`,
                metrics,
                canProceed: true, // Can still attempt but won't count as success
            };
        }
    }

    // ── All checks passed ──
    return {
        converged: true,
        reason: 'All convergence checks passed.',
        metrics,
        canProceed: true,
    };
}

/**
 * @purpose Check if we should even start a new cycle
 * @inputs  None
 * @outputs { shouldStart: boolean, reason: string }
 */
function shouldStartCycle() {
    const history = loadCycleHistory();

    // First cycle always allowed
    if (history.length === 0) {
        return { shouldStart: true, reason: 'First cycle — no history yet.' };
    }

    // Check consecutive failures
    let failures = 0;
    for (let i = history.length - 1; i >= 0; i--) {
        if (!history[i].converged) {
            failures++;
        } else {
            break;
        }
    }

    if (failures >= CONFIG.CONVERGENCE.MAX_CONSECUTIVE_FAILURES) {
        return {
            shouldStart: false,
            reason: `BLOCKED: ${failures} consecutive failures. System stopped. Awaiting Gabriel's diagnosis.`,
        };
    }

    return { shouldStart: true, reason: 'No blockers detected.' };
}

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────
module.exports = {
    loadCycleHistory,
    saveCycleHistory,
    recordCycle,
    detectOscillation,
    checkConvergence,
    shouldStartCycle,
};

// ─────────────────────────────────────────────────────────────
// SELF-TEST (node scripts/evolution/convergence-guard.js --test)
// ─────────────────────────────────────────────────────────────
if (require.main === module && process.argv.includes('--test')) {
    console.log('🔄 Convergence Guard — Self-Test\n');

    // Test 1: First cycle should always start
    console.log('TEST 1: First cycle (no history)');
    const result1 = shouldStartCycle();
    console.log(`  shouldStart: ${result1.shouldStart} (expected: true)`);
    console.log(`  reason: ${result1.reason}\n`);

    // Test 2: Convergence check with no history
    console.log('TEST 2: Convergence check (fresh)');
    const result2 = checkConvergence({ proposals: [], currentScores: {}, previousScores: {} });
    console.log(`  converged: ${result2.converged} (expected: true)`);
    console.log(`  reason: ${result2.reason}\n`);

    // Test 3: Oscillation detection
    console.log('TEST 3: Oscillation detection');
    const result3 = detectOscillation({ file: 'test.js', changeType: 'refactor' });
    console.log(`  oscillating: ${result3.oscillating} (expected: false)`);
    console.log(`  evidence: ${result3.evidence}\n`);

    console.log('✅ All convergence guard tests passed.');
}
