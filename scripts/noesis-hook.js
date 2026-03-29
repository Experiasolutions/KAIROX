/**
 * @module noesis-hook
 * @version 1.0.0
 * @purpose Lightweight wrapper for integrating Noesis cognitive evaluation
 *          into task/agent workflows. Agents call evaluateTaskOutput() to
 *          score their outputs before delivering to the user.
 *
 * USAGE (from any agent or task script):
 *   const { evaluateTaskOutput } = require('./noesis-hook');
 *   const result = evaluateTaskOutput(taskPrompt, generatedOutput, 'Story implementation');
 *   if (result.verdict === 'FAIL') { /* handle */ }
 *
 * @exports { evaluateTaskOutput }
 */

'use strict';

const path = require('path');

// ─────────────────────────────────────────────────────────────
// MODULE IMPORTS
// ─────────────────────────────────────────────────────────────

const { runCognitiveLoop, VERSION } = require(path.join(__dirname, 'evolution', 'noesis-pipeline'));

let eventBus = null;
try {
    eventBus = require(path.join(__dirname, 'event-bus'));
} catch {
    // Event bus not available — standalone mode
}

// ─────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────

/**
 * Evaluate a task output through the Noesis cognitive pipeline.
 *
 * @param {string} input - The original task prompt / request
 * @param {string} output - The generated output to evaluate
 * @param {string} [taskDescription] - Human-readable description for trace tagging
 * @param {Object} [options] - Additional options
 * @param {string} [options.mode] - Force PM mode (PM1/PM2/PM3)
 * @param {boolean} [options.dryRun] - Skip harvest and signal phases
 * @param {boolean} [options.silent] - Suppress console output
 * @returns {Object} { score, verdict, depthScore, traced, traceId, harvested, duration, pipelineVersion }
 */
function evaluateTaskOutput(input, output, taskDescription, options = {}) {
    const result = runCognitiveLoop(input, output, {
        mode: options.mode,
        dryRun: options.dryRun || false,
        taskDescription: taskDescription || 'Task evaluation via noesis-hook',
    });

    // Emit task-level event on the bus
    if (eventBus && !options.dryRun) {
        try {
            eventBus.publish('noesis.task.evaluated', {
                score: result.score,
                verdict: result.verdict,
                depthScore: result.depthScore,
                taskDescription: taskDescription || 'unknown',
                pipelineVersion: VERSION,
            }, { source: 'noesis-hook', priority: 'normal' });
        } catch {
            // Event emission failure is non-critical
        }
    }

    // Console output (unless silent)
    if (!options.silent) {
        const emoji = result.verdict === 'EXCELLENT' ? '🏆'
            : result.verdict === 'GOOD' ? '✅'
                : result.verdict === 'CONDITIONAL' ? '⚠️'
                    : '❌';
        console.log(`${emoji} Noesis: ${result.score}/10 | Depth: ${result.depthScore}/4 | ${result.verdict}`);
    }

    return {
        score: result.score,
        verdict: result.verdict,
        depthScore: result.depthScore,
        traced: result.traced,
        traceId: result.traceId,
        harvested: result.harvested,
        retried: result.retried,
        duration: result.totalDuration,
        pipelineVersion: result.pipelineVersion,
    };
}

module.exports = {
    evaluateTaskOutput,
    VERSION,
};
