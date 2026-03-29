#!/usr/bin/env node

/**
 * @module noesis-pipeline
 * @version 2.2.0
 * @purpose Unified cognitive loop for AIOS. Orchestrates the 6-phase Noesis
 *          reasoning cycle: Context → Evaluate → Reflect → Harvest → Trace → Signal.
 *          This is the "own mind" of the AIOS — a domain-agnostic reasoning
 *          substrate that evaluates, learns, and improves with every cycle.
 * @inputs  { input: string, output: string, mode?: string, taskDescription?: string }
 * @outputs { score, verdict, depthScore, harvested, traced, signal, phases }
 * @domain-purity ZERO domain words. This file is ENGINE-level.
 * @changelog v2.2: +REFLECT phase (depth_score), +retry loop, +memory enrichment,
 *           +cycle history, +error resilience. Self-evolved from v1.0 via meta-cognition.
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────────────
// MODULE IMPORTS (delegate, don't duplicate)
// ─────────────────────────────────────────────────────────────

const { refineInput, detectMode } = require(path.join(__dirname, '..', 'input-refiner'));
const { evaluate, THRESHOLDS } = require(path.join(__dirname, '..', 'self-correction'));
const { harvest, HARVEST_THRESHOLD } = require(path.join(__dirname, '..', 'harvest-gold'));

// ── Safe imports (graceful degradation if modules not available) ──

let eventBus = null;
try {
    eventBus = require(path.join(__dirname, '..', 'event-bus'));
} catch {
    // Event bus not available — standalone mode
}

let memorySystem = null;
try {
    memorySystem = require(path.join(__dirname, '..', 'memory-system'));
} catch {
    // Memory system not available — standalone mode
}

let cognitiveState = null;
try {
    cognitiveState = require(path.join(__dirname, 'cognitive-state-engine'));
} catch {
    // Cognitive state engine not available — standalone mode
}

// ─────────────────────────────────────────────────────────────
// PATHS
// ─────────────────────────────────────────────────────────────

const PROJECT_ROOT = path.join(__dirname, '..', '..');
const TRACES_DIR = path.join(PROJECT_ROOT, 'distillation-dataset', 'traces');
const CURATED_DIR = path.join(PROJECT_ROOT, 'distillation-dataset', 'curated');
const ROADMAP_FILE = path.join(PROJECT_ROOT, 'distillation-dataset', 'roadmap.json');
const BASELINE_FILE = path.join(PROJECT_ROOT, '.aios-core', 'data', 'quality-baseline.json');
const HISTORY_FILE = path.join(PROJECT_ROOT, '.aios-core', 'data', 'noesis-history.json');

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

const CURATED_THRESHOLD = 9.5;  // PM3 ≥ 9.5 → promoted to curated
const MAX_RETRIES = 1;          // Max auto-retries for CONDITIONAL verdicts
const MAX_HISTORY = 50;         // Keep last 50 cycles in history
const VERSION = '2.2.0';

// ─────────────────────────────────────────────────────────────
// PHASE 1: CONTEXT — Load reasoning context
// ─────────────────────────────────────────────────────────────

/**
 * @purpose Load AIOS context, golden examples, anti-patterns, and PM master
 * @inputs  {string} input - Raw user input
 * @outputs {Object} Refined context with all injections
 */
function phaseContext(input) {
    const startTime = Date.now();

    const mode = detectMode(input);
    let refinedContext = null;

    try {
        refinedContext = refineInput(input);
    } catch (err) {
        refinedContext = {
            mode: mode.id,
            refinedPrompt: input,
            context: {
                goldenExamplesLoaded: 0,
                antiPatternsLoaded: false,
                aiosContextLoaded: false,
            },
            error: err.message,
        };
    }

    return {
        phase: 'CONTEXT',
        duration: Date.now() - startTime,
        mode: refinedContext.mode,
        goldenExamples: refinedContext.context.goldenExamplesLoaded,
        antiPatternsLoaded: refinedContext.context.antiPatternsLoaded,
        aiosContextLoaded: refinedContext.context.aiosContextLoaded,
        refinedPrompt: refinedContext.refinedPrompt,
    };
}

// ─────────────────────────────────────────────────────────────
// PHASE 2: EVALUATE — Score output with PM3 quality gate
// ─────────────────────────────────────────────────────────────

/**
 * @purpose Evaluate output quality using 7-dimensional scoring
 * @inputs  {string} output - The generated output to evaluate
 * @outputs {Object} Score, verdict, dimensions, findings
 */
function phaseEvaluate(output) {
    const startTime = Date.now();

    let result;
    try {
        result = evaluate(output, { silent: true });
    } catch (err) {
        result = {
            score: 0,
            verdict: 'ERROR',
            dimensions: {},
            findings: [],
            error: err.message,
        };
    }

    return {
        phase: 'EVALUATE',
        duration: Date.now() - startTime,
        score: result.score,
        verdict: result.verdict,
        dimensions: result.dimensions,
        findingsCount: (result.findings || []).length,
    };
}

// ─────────────────────────────────────────────────────────────
// PHASE 2.5: REFLECT — Depth Score Enforcement (Sutskever)
// ─────────────────────────────────────────────────────────────

/**
 * @purpose Analyze reasoning depth of the output (N0→N3 layers)
 * @inputs  {string} output - The generated output
 * @inputs  {Object} evalResult - Result from phaseEvaluate
 * @outputs {Object} { depthScore, layers, shallow }
 */
function phaseReflect(output, evalResult) {
    const startTime = Date.now();

    // Depth indicators — structural markers that signal reasoning layers
    const depthMarkers = {
        N0_surface: /(@purpose|@module|description|summary|what)/gi,
        N1_structural: /(require|import|class |function |module\.exports|dependency|interface)/gi,
        N2_systemic: /(edge.?case|error.?handl|fallback|graceful|retry|timeout|concurrent|race.?condition)/gi,
        N3_philosophical: /(trade.?off|why|principle|architecture|design.?decision|long.?term|scalab)/gi,
    };

    const layers = {};
    let layerCount = 0;

    for (const [layer, regex] of Object.entries(depthMarkers)) {
        const matches = (output.match(regex) || []).length;
        layers[layer] = matches;
        if (matches > 0) layerCount++;
    }

    // Depth score: 0-4 based on how many layers are present
    const depthScore = layerCount;
    const shallow = depthScore < 2;

    // Adjust eval score if shallow (penalty of -1.0)
    let adjustedScore = evalResult.score;
    if (shallow && evalResult.score > 6) {
        adjustedScore = Math.max(evalResult.score - 1.0, 6.0);
    }

    return {
        phase: 'REFLECT',
        duration: Date.now() - startTime,
        depthScore,
        layers,
        layerCount,
        shallow,
        adjustedScore,
        penalty: shallow ? -1.0 : 0,
    };
}

// ─────────────────────────────────────────────────────────────
// PHASE 3: HARVEST — Auto-harvest excellent outputs
// ─────────────────────────────────────────────────────────────

/**
 * @purpose If score ≥ HARVEST_THRESHOLD, save as golden example
 * @inputs  {number} score - PM3 score
 * @inputs  {string} mode - PM mode (PM1/PM2/PM3)
 * @inputs  {string} output - The output content
 * @inputs  {string} taskDescription - Description for tagging
 * @outputs {Object} Harvest result (harvested: boolean)
 */
function phaseHarvest(score, mode, output, taskDescription) {
    const startTime = Date.now();
    let harvested = false;

    if (score >= HARVEST_THRESHOLD) {
        try {
            harvest({
                score,
                mode,
                output,
                taskDescription: taskDescription || 'Auto-harvested by Noesis Pipeline',
                whyGolden: `PM3 score ${score}/10 — auto-harvested by noesis-pipeline`,
            });
            harvested = true;
        } catch (err) {
            // Harvest failure should not break the pipeline
            harvested = false;
        }
    }

    return {
        phase: 'HARVEST',
        duration: Date.now() - startTime,
        harvested,
        threshold: HARVEST_THRESHOLD,
        score,
    };
}

// ─────────────────────────────────────────────────────────────
// PHASE 4: TRACE — Capture distillation trace
// ─────────────────────────────────────────────────────────────

/**
 * @purpose Save input→output→score as JSONL trace for future fine-tuning
 * @inputs  {string} input - Original input
 * @inputs  {string} output - Generated output
 * @inputs  {number} score - PM3 score
 * @inputs  {string} verdict - Quality verdict
 * @inputs  {string} mode - PM mode
 * @inputs  {Object} dimensions - 7-dim scores
 * @outputs {Object} Trace result (traced: boolean, traceId: string)
 */
function phaseTrace(input, output, score, verdict, mode, dimensions) {
    const startTime = Date.now();
    const traceId = `trace-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const timestamp = new Date().toISOString();

    const trace = {
        id: traceId,
        timestamp,
        input: input.substring(0, 2000),  // Cap at 2000 chars to limit file size
        output: output.substring(0, 5000), // Cap at 5000 chars
        score,
        verdict,
        mode,
        dimensions,
        pipelineVersion: VERSION,
    };

    // Determine target directory
    const isCurated = score >= CURATED_THRESHOLD;
    const targetDir = isCurated ? CURATED_DIR : TRACES_DIR;

    let traced = false;
    try {
        // Ensure directory exists
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        // Append to daily JSONL file
        const dateStr = timestamp.split('T')[0];
        const fileName = `traces-${dateStr}.jsonl`;
        const filePath = path.join(targetDir, fileName);

        fs.appendFileSync(filePath, JSON.stringify(trace) + '\n');
        traced = true;

        // Update roadmap
        updateRoadmap(isCurated);
    } catch (err) {
        // Trace failure should not break the pipeline
        traced = false;
    }

    return {
        phase: 'TRACE',
        duration: Date.now() - startTime,
        traced,
        traceId,
        curated: score >= CURATED_THRESHOLD,
    };
}

/**
 * @purpose Update roadmap.json with new trace count
 * @inputs  {boolean} isCurated - Whether trace was curated
 */
function updateRoadmap(isCurated) {
    try {
        let roadmap = {};
        if (fs.existsSync(ROADMAP_FILE)) {
            roadmap = JSON.parse(fs.readFileSync(ROADMAP_FILE, 'utf-8'));
        }

        roadmap.captured = (roadmap.captured || 0) + 1;
        if (isCurated) {
            roadmap.curated = (roadmap.curated || 0) + 1;
        }
        roadmap.lastUpdated = new Date().toISOString();

        // Update milestone statuses
        if (roadmap.milestones) {
            for (const m of roadmap.milestones) {
                if (roadmap.captured >= m.traces && m.status === 'pending') {
                    m.status = 'reached';
                    m.reachedAt = new Date().toISOString();
                }
            }
        }

        fs.writeFileSync(ROADMAP_FILE, JSON.stringify(roadmap, null, 2) + '\n');
    } catch {
        // Roadmap update failure is non-critical
    }
}

// ─────────────────────────────────────────────────────────────
// PHASE 5: SIGNAL — Emit events + update memory
// ─────────────────────────────────────────────────────────────

/**
 * @purpose Emit events on event-bus, update memory, check stagnation
 * @inputs  {Object} cycleResult - Complete result of phases 1-4
 * @outputs {Object} Signal result (events emitted, memory updated)
 */
function phaseSignal(cycleResult) {
    const startTime = Date.now();
    const events = [];

    // Emit cycle complete event
    if (eventBus) {
        try {
            eventBus.publish('noesis.cycle.complete', {
                score: cycleResult.score,
                verdict: cycleResult.verdict,
                mode: cycleResult.mode,
                harvested: cycleResult.harvested,
                traced: cycleResult.traced,
                pipelineVersion: VERSION,
            }, { source: 'noesis-pipeline', priority: 'normal' });
            events.push('noesis.cycle.complete');

            if (cycleResult.traced) {
                eventBus.publish('noesis.trace.captured', {
                    traceId: cycleResult.traceId,
                    score: cycleResult.score,
                    curated: cycleResult.curated,
                }, { source: 'noesis-pipeline', priority: 'low' });
                events.push('noesis.trace.captured');
            }

            if (cycleResult.harvested) {
                eventBus.publish('noesis.harvest.triggered', {
                    score: cycleResult.score,
                    mode: cycleResult.mode,
                }, { source: 'noesis-pipeline', priority: 'normal' });
                events.push('noesis.harvest.triggered');
            }
        } catch {
            // Event emission failure is non-critical
        }
    }

    // Update memory with session quality data
    if (memorySystem) {
        try {
            memorySystem.store('metrics', `Noesis cycle: score=${cycleResult.score}/10, verdict=${cycleResult.verdict}, depth=${cycleResult.depthScore}/4`, {
                type: 'noesis-cycle',
                score: cycleResult.score,
                verdict: cycleResult.verdict,
                depthScore: cycleResult.depthScore,
            });
        } catch {
            // Memory update failure is non-critical
        }
    }

    // Update quality baseline with this session's score
    try {
        let baseline = {};
        if (fs.existsSync(BASELINE_FILE)) {
            baseline = JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf-8'));
        }
        if (!baseline.history) baseline.history = [];
        baseline.history.push({
            score: cycleResult.score,
            depthScore: cycleResult.depthScore,
            verdict: cycleResult.verdict,
            timestamp: new Date().toISOString(),
        });
        // Keep last 50 entries
        if (baseline.history.length > MAX_HISTORY) {
            baseline.history = baseline.history.slice(-MAX_HISTORY);
        }
        // Compute running average
        const scores = baseline.history.map(h => h.score);
        baseline.current_baseline = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
        baseline.trend = scores.length >= 5
            ? (scores.slice(-3).reduce((a, b) => a + b, 0) / 3 > baseline.current_baseline ? 'improving' : 'stable')
            : 'establishing';

        // Pattern detection: flag dimensions that score low 3+ times
        const dimWarnings = detectWeakDimensions(baseline.history);
        if (dimWarnings.length > 0 && eventBus) {
            try {
                eventBus.publish('noesis.pattern.detected', {
                    weakDimensions: dimWarnings,
                }, { source: 'noesis-pipeline', priority: 'normal' });
                events.push('noesis.pattern.detected');
            } catch { /* non-critical */ }
        }

        const dataDir = path.dirname(BASELINE_FILE);
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
        fs.writeFileSync(BASELINE_FILE, JSON.stringify(baseline, null, 2) + '\n');
    } catch {
        // Baseline update failure is non-critical
    }

    // Check stagnation (5-session rule)
    const stagnation = checkStagnation(cycleResult.score);

    if (stagnation.triggered && eventBus) {
        try {
            eventBus.publish('noesis.stagnation.detected', {
                sessions: stagnation.sessionCount,
                trend: stagnation.trend,
            }, { source: 'noesis-pipeline', priority: 'high' });
            events.push('noesis.stagnation.detected');
        } catch {
            // Non-critical
        }
    }

    return {
        phase: 'SIGNAL',
        duration: Date.now() - startTime,
        eventsEmitted: events,
        stagnation,
    };
}

/**
 * @purpose Check if quality has stagnated for 5+ sessions (Nakajima rule)
 * @inputs  {number} currentScore
 * @outputs {Object} { triggered: boolean, sessionCount, trend }
 */
function checkStagnation(currentScore) {
    try {
        if (!fs.existsSync(BASELINE_FILE)) {
            return { triggered: false, sessionCount: 0, trend: 'establishing' };
        }

        const baseline = JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf-8'));
        const history = baseline.history || [];

        if (history.length < 5) {
            return { triggered: false, sessionCount: history.length, trend: 'insufficient_data' };
        }

        // Check last 5 sessions
        const last5 = history.slice(-5).map(h => h.score || 0);
        const avg = last5.reduce((a, b) => a + b, 0) / last5.length;
        const improving = currentScore > avg + 0.5;
        const stagnant = Math.abs(currentScore - avg) < 0.3;

        return {
            triggered: stagnant,
            sessionCount: history.length,
            trend: improving ? 'improving' : stagnant ? 'stagnant' : 'declining',
            last5Average: Math.round(avg * 10) / 10,
        };
    } catch {
        return { triggered: false, sessionCount: 0, trend: 'error' };
    }
}

/**
 * @purpose Detect dimensions that consistently score low across recent sessions
 * @inputs  {Array} history - Array of session records with dimensions
 * @outputs {Array} List of dimension names that scored low 3+ times
 */
function detectWeakDimensions(history) {
    // This is a simplified check — v3.0 will use full dimension tracking
    const warnings = [];
    const last5 = history.slice(-5);
    const lowScoreCount = last5.filter(h => h.score < 7.5).length;
    if (lowScoreCount >= 3) {
        warnings.push({ pattern: 'recurring_low_score', count: lowScoreCount, sessions: 5 });
    }
    const shallowCount = last5.filter(h => (h.depthScore || 0) < 2).length;
    if (shallowCount >= 3) {
        warnings.push({ pattern: 'recurring_shallow_output', count: shallowCount, sessions: 5 });
    }
    return warnings;
}

/**
 * @purpose Save cycle result to history file for trend analysis
 * @inputs  {Object} result - Complete cycle result
 */
function saveHistory(result) {
    try {
        let history = [];
        if (fs.existsSync(HISTORY_FILE)) {
            history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
        }
        history.push({
            timestamp: result.timestamp,
            score: result.score,
            depthScore: result.depthScore,
            verdict: result.verdict,
            mode: result.mode,
            harvested: result.harvested,
            traced: result.traced,
            retried: result.retried || false,
            duration: result.totalDuration,
            pipelineVersion: result.pipelineVersion,
        });
        // Keep last MAX_HISTORY entries
        if (history.length > MAX_HISTORY) {
            history = history.slice(-MAX_HISTORY);
        }
        const dataDir = path.dirname(HISTORY_FILE);
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
        fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2) + '\n');
    } catch {
        // History save failure is non-critical
    }
}

// ─────────────────────────────────────────────────────────────
// MAIN ORCHESTRATOR
// ─────────────────────────────────────────────────────────────

/**
 * @purpose Run the complete Noesis cognitive loop
 * @inputs  {string} input - Original input/request
 * @inputs  {string} output - Generated output to evaluate
 * @inputs  {Object} options - { mode, taskDescription, dryRun }
 * @outputs {Object} Complete cycle result with all phase data
 */
function runCognitiveLoop(input, output, options = {}) {
    const cycleStart = Date.now();
    const dryRun = options.dryRun || false;

    try {
        // PHASE 1: CONTEXT
        const contextResult = phaseContext(input);
        const mode = options.mode || contextResult.mode || 'PM2';

        // PHASE 2: EVALUATE
        let evalResult = phaseEvaluate(output);

        // PHASE 2.5: REFLECT (depth enforcement)
        const reflectResult = phaseReflect(output, evalResult);
        const effectiveScore = reflectResult.adjustedScore;
        const effectiveVerdict = effectiveScore >= THRESHOLDS.EXCELLENT ? 'EXCELLENT'
            : effectiveScore >= THRESHOLDS.PASS ? 'GOOD'
                : effectiveScore >= THRESHOLDS.CONDITIONAL ? 'CONDITIONAL'
                    : 'FAIL';

        // RETRY LOOP: If CONDITIONAL, auto-retry once
        let retried = false;
        if (effectiveVerdict === 'CONDITIONAL' && !options._isRetry) {
            retried = true;
            // Re-evaluate (simulates feedback loop — in future versions,
            // this will pass findings back to the LLM for improvement)
            evalResult = phaseEvaluate(output);
            if (eventBus) {
                try {
                    eventBus.publish('noesis.retry.triggered', {
                        originalScore: effectiveScore,
                        retryScore: evalResult.score,
                    }, { source: 'noesis-pipeline', priority: 'normal' });
                } catch { /* non-critical */ }
            }
        }

        const finalScore = retried ? evalResult.score : effectiveScore;
        const finalVerdict = retried ? evalResult.verdict : effectiveVerdict;

        // PHASE 3: HARVEST (skip in dry-run)
        let harvestResult = { phase: 'HARVEST', harvested: false, duration: 0, skipped: dryRun };
        if (!dryRun) {
            harvestResult = phaseHarvest(finalScore, mode, output, options.taskDescription);
        }

        // PHASE 4: TRACE (always capture, even in dry-run for testing)
        const traceResult = phaseTrace(
            input, output,
            finalScore, finalVerdict,
            mode, evalResult.dimensions
        );

        // Build intermediate result for Phase 5
        const cycleResult = {
            score: finalScore,
            verdict: finalVerdict,
            depthScore: reflectResult.depthScore,
            mode,
            harvested: harvestResult.harvested,
            traced: traceResult.traced,
            traceId: traceResult.traceId,
            curated: traceResult.curated,
        };

        // PHASE 5: SIGNAL (skip in dry-run)
        let signalResult = { phase: 'SIGNAL', eventsEmitted: [], duration: 0, skipped: dryRun };
        if (!dryRun) {
            signalResult = phaseSignal(cycleResult);
        }

        // PHASE 6: COGNIZE — feed cognitive state engine (skip in dry-run)
        let cognizeResult = { phase: 'COGNIZE', observed: false, duration: 0, skipped: dryRun };
        if (!dryRun && cognitiveState) {
            const cognizeStart = Date.now();
            try {
                // Record this cycle as a cognitive observation
                const obsType = finalScore >= 9 ? 'strength'
                    : finalScore < 6 ? 'blindspot' : 'pattern';
                const obsDesc = finalScore >= 9
                    ? `High-quality ${mode} output (${finalScore}/10, depth ${reflectResult.depthScore}/4)`
                    : finalScore < 6
                        ? `Below-threshold ${mode} output (${finalScore}/10) — review needed`
                        : `Standard ${mode} cycle completed (${finalScore}/10, depth ${reflectResult.depthScore}/4)`;

                cognitiveState.observe({
                    type: obsType,
                    description: obsDesc,
                    score: finalScore,
                    depthScore: reflectResult.depthScore,
                    context: {
                        mode,
                        verdict: finalVerdict,
                        harvested: harvestResult.harvested,
                        retried,
                    },
                });
                cognizeResult.observed = true;
            } catch (err) {
                cognizeResult.error = err.message;
            }
            cognizeResult.duration = Date.now() - cognizeStart;
        }

        const totalDuration = Date.now() - cycleStart;

        const result = {
            pipelineVersion: VERSION,
            timestamp: new Date().toISOString(),
            dryRun,

            // Summary
            score: finalScore,
            verdict: finalVerdict,
            depthScore: reflectResult.depthScore,
            mode,
            harvested: harvestResult.harvested,
            traced: traceResult.traced,
            traceId: traceResult.traceId,
            retried,

            // Phase details
            phases: {
                context: contextResult,
                evaluate: evalResult,
                reflect: reflectResult,
                harvest: harvestResult,
                trace: traceResult,
                signal: signalResult,
                cognize: cognizeResult,
            },

            // Timing
            totalDuration,
        };

        // Save to history (non-blocking)
        if (!dryRun) saveHistory(result);

        return result;

    } catch (err) {
        // ERROR RESILIENCE: Return partial result on failure
        return {
            pipelineVersion: VERSION,
            timestamp: new Date().toISOString(),
            dryRun,
            score: 0,
            verdict: 'ERROR',
            depthScore: 0,
            mode: options.mode || 'PM2',
            harvested: false,
            traced: false,
            traceId: null,
            retried: false,
            failedAt: err.message,
            phases: {},
            totalDuration: Date.now() - cycleStart,
        };
    }
}

// ─────────────────────────────────────────────────────────────
// CLI INTERFACE
// ─────────────────────────────────────────────────────────────

if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.includes('--test')) {
        // ── Self-Test ────────────────────────────────────────
        console.log('🧠 Noesis Pipeline v' + VERSION + ' — Self-Test\n');

        const testInput = 'Implement a new bridge module with error handling and graceful degradation for long-term scalability';
        const testOutput = `/**
 * @module notification-bridge
 * @purpose Bridge between notification providers and AIOS event bus.
 *          Design decision: uses Map for O(1) provider lookup.
 *          Trade-off: memory vs speed — chose speed for real-time use.
 */
const EventEmitter = require('events');

class NotificationBridge extends EventEmitter {
    constructor(config) {
        super();
        this.config = config;
        this.providers = new Map();
    }

    async send(channel, message) {
        const provider = this.providers.get(channel);
        if (!provider) {
            // Edge case: unknown channel — graceful fallback
            throw new Error('Unknown channel: ' + channel);
        }
        try {
            return await provider.send(message);
        } catch (err) {
            // Error handling: retry with exponential backoff
            this.emit('error', { channel, error: err.message });
            throw err;
        }
    }
}

module.exports = NotificationBridge;`;

        const result = runCognitiveLoop(testInput, testOutput, { dryRun: false });

        console.log('  PHASES:');
        console.log(`    1. CONTEXT   ${result.phases.context.duration}ms — mode: ${result.mode}, golden: ${result.phases.context.goldenExamples}`);
        console.log(`    2. EVALUATE  ${result.phases.evaluate.duration}ms — raw score: ${result.phases.evaluate.score}/10`);
        console.log(`   2.5 REFLECT   ${result.phases.reflect.duration}ms — depth: ${result.depthScore}/4, shallow: ${result.phases.reflect.shallow}`);
        console.log(`    3. HARVEST   ${result.phases.harvest.duration}ms — harvested: ${result.harvested}`);
        console.log(`    4. TRACE     ${result.phases.trace.duration}ms — traced: ${result.traced}, id: ${result.traceId}`);
        console.log(`    5. SIGNAL    ${result.phases.signal.duration}ms — events: ${(result.phases.signal.eventsEmitted || []).length}`);
        console.log('');
        console.log(`  TOTAL: ${result.totalDuration}ms`);
        console.log(`  VERDICT: ${result.verdict} (${result.score}/10) | Depth: ${result.depthScore}/4 | Retried: ${result.retried}`);
        console.log('');
        console.log('✅ Noesis Pipeline v2.2 self-test complete.');
        process.exit(0);
    }

    // ── CLI Usage ────────────────────────────────────────────

    function getArg(name) {
        const idx = args.indexOf(`--${name}`);
        return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
    }

    const input = getArg('input');
    const outputArg = getArg('output');
    const dryRun = args.includes('--dry-run');

    if (!input || !outputArg) {
        console.log('🧠 Noesis Pipeline v' + VERSION);
        console.log('');
        console.log('Usage:');
        console.log('  node noesis-pipeline.js --test                    Run self-test');
        console.log('  node noesis-pipeline.js --input "..." --output "..." [--dry-run]');
        console.log('');
        console.log('Options:');
        console.log('  --input   "text"   The original input/request');
        console.log('  --output  "text"   The generated output to evaluate');
        console.log('  --dry-run          Skip harvest and signal phases');
        console.log('  --test             Run self-test with mock data');
        process.exit(0);
    }

    // Read output from file if it's a path
    let outputContent = outputArg;
    if (fs.existsSync(outputArg)) {
        outputContent = fs.readFileSync(outputArg, 'utf-8');
    }

    const result = runCognitiveLoop(input, outputContent, { dryRun });

    console.log('🧠 Noesis Pipeline v' + VERSION + ' — Cycle Complete\n');
    console.log(`  Score:     ${result.score}/10`);
    console.log(`  Depth:     ${result.depthScore}/4`);
    console.log(`  Verdict:   ${result.verdict}`);
    console.log(`  Mode:      ${result.mode}`);
    console.log(`  Harvested: ${result.harvested}`);
    console.log(`  Traced:    ${result.traced} (${result.traceId})`);
    console.log(`  Retried:   ${result.retried}`);
    console.log(`  Duration:  ${result.totalDuration}ms`);

    if (result.verdict === 'FAIL') {
        process.exit(2);
    }
}

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────

module.exports = {
    runCognitiveLoop,
    phaseContext,
    phaseEvaluate,
    phaseReflect,
    phaseHarvest,
    phaseTrace,
    phaseSignal,
    checkStagnation,
    detectWeakDimensions,
    saveHistory,
    VERSION,
};
