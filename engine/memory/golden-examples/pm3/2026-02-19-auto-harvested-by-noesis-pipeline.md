# GOLDEN EXAMPLE: Auto-harvested by Noesis Pipeline
**Score:** 9.7/10  **Date:** 2026-02-19  **Mode:** PM3
**Tags:** pm3
**Why golden:** PM3 score 9.7/10 — auto-harvested by noesis-pipeline

## THE TASK
Auto-harvested by Noesis Pipeline

## THE REASONING TRACE
[Reasoning trace not captured — reconstruct from output patterns]

## THE OUTPUT
#!/usr/bin/env node

/**
 * @module noesis-pipeline
 * @version 1.0.0
 * @purpose Unified cognitive loop for AIOX. Orchestrates the 5-phase Noesis
 *          reasoning cycle: Context → Evaluate → Harvest → Trace → Signal.
 *          This is the "own mind" of the AIOX — a domain-agnostic reasoning
 *          substrate that evaluates, learns, and improves with every cycle.
 * @inputs  { input: string, output: string, mode?: string, taskDescription?: string }
 * @outputs { score, verdict, harvested, traced, signal, phases }
 * @domain-purity ZERO domain words. This file is ENGINE-level.
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

// ─────────────────────────────────────────────────────────────
// PATHS
// ─────────────────────────────────────────────────────────────

const PROJECT_ROOT = path.join(__dirname, '..', '..');
const TRACES_DIR = path.join(PROJECT_ROOT, 'distillation-dataset', 'traces');
const CURATED_DIR = path.join(PROJECT_ROOT, 'distillation-dataset', 'curated');
const ROADMAP_FILE = path.join(PROJECT_ROOT, 'distillation-dataset', 'roadmap.json');
const BASELINE_FILE = path.join(PROJECT_ROOT, '.aiox-core', 'data', 'quality-baseline.json');

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

const CURATED_THRESHOLD = 9.5;  // PM3 ≥ 9.5 → promoted to curated
const VERSION = '1.0.0';

// ─────────────────────────────────────────────────────────────
// PHASE 1: CONTEXT — Load reasoning context
// ─────────────────────────────────────────────────────────────

/**
 * @purpose Load AIOX context, golden examples, anti-patterns, and PM master
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
                aioxContextLoaded: false,
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
        aioxContextLoaded: refinedContext.context.aioxContextLoaded,
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
            memorySystem.store('metrics', `Noesis cycle: score=${cycleResult.score}/10, verdict=${cycleResult.verdict}`, {
                type: 'noesis-cycle',
                score: cycleResult.score,
                verdict: cycleResult.verdict,
            });
        } catch {
            // Memory update failure is non-critical
        }
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

    // PHASE 1: CONTEXT
    const contextResult = phaseContext(input);
    const mode = options.mode || contextResult.mode || 'PM2';

    // PHASE 2: EVALUATE
    const evalResult = phaseEvaluate(output);

    // PHASE 3: HARVEST (skip in dry-run)
    let harvestResult = { phase: 'HARVEST', harvested: false, duration: 0, skipped: dryRun };
    if (!dryRun) {
        harvestResult = phaseHarvest(evalResult.score, mode, output, options.taskDescription);
    }

    // PHASE 4: TRACE (always capture, even in dry-run for testing)
    const traceResult = phaseTrace(
        input, output,
        evalResult.score, evalResult.verdict,
        mode, evalResult.dimensions
    );

    // Build intermediate result for Phase 5
    const cycleResult = {
        score: evalResult.score,
        verdict: evalResult.verdict,
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

    const totalDuration = Date.now() - cycleStart;

    return {
        pipelineVersion: VERSION,
        timestamp: new Date().toISOString(),
        dryRun,

        // Summary
        score: evalResult.score,
        verdict: evalResult.verdict,
        mode,
        harvested: harvestResult.harvested,
        traced: traceResult.traced,
        traceId: traceResult.traceId,

        // Phase details
        phases: {
            context: contextResult,
            evaluate: evalResult,
            harvest: harvestResult,
            trace: traceResult,
            signal: signalResult,
        },

        // Timing
        totalDuration,
    };
}

// ─────────────────────────────────────────────────────────────
// CLI INTERFACE
// ─────────────────────────────────────────────────────────────

if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.includes('--test')) {
        // ── Self-Test ────────────────────────────────────────
        console.log('🧠 Noesis Pipeline v' + VERSION + ' — Self-Test\n');

        const testInput = 'Implement a new bridge module for the notification system';
        const testOutput = `/**
 * @module notification-bridge
 * @purpose Bridge between notification providers and AIOX event bus
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
        if (!provider) throw new Error('Unknown channel: ' + channel);
        return provider.send(message);
    }
}

module.exports = NotificationBridge;`;

        const result = runCognitiveLoop(testInput, testOutput, { dryRun: false });

        console.log('  PHASES:');
        console.log(`    1. CONTEXT   ${result.phases.context.duration}ms — mode: ${result.mode}, golden: ${result.phases.context.goldenExamples}`);
        console.log(`    2. EVALUATE  ${result.phases.evaluate.duration}ms — score: ${result.score}/10, verdict: ${result.verdict}`);
        console.log(`    3. HARVEST   ${result.phases.harvest.duration}ms — harvested: ${result.harvested}`);
        console.log(`    4. TRACE     ${result.phases.trace.duration}ms — traced: ${result.traced}, id: ${result.traceId}`);
        console.log(`    5. SIGNAL    ${result.phases.signal.duration}ms — events: ${(result.phases.signal.eventsEmitted || []).length}`);
        console.log('');
        console.log(`  TOTAL: ${result.totalDuration}ms`);
        console.log(`  VERDICT: ${result.verdict} (${result.score}/10)`);
        console.log('');
        console.log('✅ Noesis Pipeline self-test complete.');
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

    console.log('🧠 Noesis Pipeline — Cycle Complete\n');
    console.log(`  Score:     ${result.score}/10`);
    console.log(`  Verdict:   ${result.verdict}`);
    console.log(`  Mode:      ${result.mode}`);
    console.log(`  Harvested: ${result.harvested}`);
    console.log(`  Traced:    ${result.traced} (${result.traceId})`);
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
    phaseHarvest,
    phaseTrace,
    phaseSignal,
    checkStagnation,
    VERSION,
};


## WHAT MADE THIS EXCELLENT
- Scored 9.7/10 across 7 PM3 quality dimensions
- Zero anti-pattern violations detected
- Auto-harvested by self-correction quality gate

## REUSE GUIDANCE
Use when: working on tasks tagged [pm3]
Adapt: domain-specific references. Copy: structural patterns and edge case handling.
