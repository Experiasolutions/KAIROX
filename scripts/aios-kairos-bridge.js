/** @purpose Bridge between AIOX engine and KAIROS brain extensions */
#!/usr/bin/env node

/**
 * aios-kairos-bridge.js — The Grand Unification Bridge
 * 
 * Connects the AIOS Core development powerhouse with the KAIROS
 * cognitive/evolution layer. This module provides:
 * 
 * 1. MasterOrchestrator Event Listener
 *    - Hooks into AIOS onStateChange, onEpicStart, onEpicComplete
 *    - Forwards epic events to KAIROS HiveMind for cognitive review
 * 
 * 2. Synapse Context Injection Bridge
 *    - Exposes KAIROS Manifest data for SynapseEngine L1-Global to consume
 *    - Writes to .synapse/global domain file so the AIOS context pipeline
 *      naturally picks up KAIROS rules without modifying core source
 * 
 * 3. Agent Registry Synchronizer
 *    - Maps KAIROS squads/ agents to AIOS agent format
 *    - Maintains a unified agent index at .aios-core/data/unified-agent-index.json
 * 
 * DESIGN PRINCIPLE: This bridge NEVER modifies .aios-core/core/ source code.
 * It uses the hooks, events, and domain files that the AIOS Core already exposes.
 * 
 * @module aios-kairos-bridge
 * @version 1.0.0
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SYNAPSE_DIR = path.join(ROOT, '.synapse');
const KAIROS_MANIFEST = path.join(ROOT, 'docs', 'core', 'KAIROS-MANIFEST.md');
const UNIFIED_INDEX = path.join(ROOT, '.aios-core', 'data', 'unified-agent-index.json');
const BRIDGE_LOG = path.join(ROOT, '.aios-core', 'data', 'bridge-events.json');

// ─── 1. MasterOrchestrator Event Bridge ─────────────────────────

/**
 * Create event listeners that can be passed to MasterOrchestrator options.
 * Usage:
 *   const bridge = require('./aios-kairos-bridge');
 *   const orchestrator = new MasterOrchestrator(root, {
 *     onEpicStart: bridge.onEpicStart,
 *     onEpicComplete: bridge.onEpicComplete,
 *     onStateChange: bridge.onStateChange
 *   });
 */

function onEpicStart(epicNum, context) {
    logBridgeEvent('EPIC_START', { epicNum, context });

    // Could trigger HiveMind pre-review here
    // const hivemind = require('./evolution/hivemind-orchestrator');
    // hivemind.preReview(epicNum, context);
}

function onEpicComplete(epicNum, result) {
    logBridgeEvent('EPIC_COMPLETE', {
        epicNum,
        status: result?.status,
        score: result?.gateResult?.score
    });

    // After Epic 4 (Plan) or Epic 5 (Execute), trigger HiveMind cognitive review
    if (epicNum === 4 || epicNum === 5) {
        try {
            const councilPath = path.join(ROOT, 'scripts', 'evolution', 'ia-council-engine.js');
            if (fs.existsSync(councilPath)) {
                const council = require(councilPath);
                // Fire-and-forget: don't block the AIOS pipeline
                setImmediate(() => {
                    try {
                        const systemState = {
                            files: [],
                            metrics: { lastEpic: epicNum, epicResult: result?.status },
                            qualityBaseline: {},
                            antiPatterns: [],
                            projectRoot: ROOT
                        };
                        const review = council.runCouncil(systemState);
                        logBridgeEvent('HIVEMIND_REVIEW', {
                            trigger: `post-epic-${epicNum}`,
                            score: review.overallScore,
                            gaps: review.totalGaps
                        });
                    } catch (err) {
                        logBridgeEvent('HIVEMIND_ERROR', { error: err.message });
                    }
                });
            }
        } catch { /* non-critical */ }
    }
}

function onStateChange(fromState, toState, context) {
    logBridgeEvent('STATE_CHANGE', { from: fromState, to: toState, context });

    // When pipeline completes, trigger Jarvis observation cycle
    if (toState === 'complete') {
        try {
            const jarvis = require(path.join(ROOT, 'scripts', 'jarvis-core.js'));
            const { enrichProfile } = require(path.join(ROOT, 'scripts', 'profile-enricher.js'));

            setImmediate(() => {
                try {
                    const obs = jarvis.observe();
                    const profile = enrichProfile(obs);
                    jarvis.saveProfile(profile);
                    logBridgeEvent('JARVIS_POST_PIPELINE', {
                        completeness: obs.completeness,
                        cycle: profile._meta.enrichmentCycles
                    });
                } catch { /* non-critical */ }
            });
        } catch { /* non-critical */ }
    }
}

// ─── 2. Synapse Context Injection ───────────────────────────────

/**
 * Write KAIROS rules to the .synapse/global domain file
 * so the SynapseEngine L1-Global layer picks them up naturally.
 * 
 * This DOES NOT modify any .aios-core/core/ source code.
 * It leverages the existing domain file loading mechanism.
 */
function syncKairosToSynapse() {
    // Ensure .synapse directory exists
    if (!fs.existsSync(SYNAPSE_DIR)) {
        fs.mkdirSync(SYNAPSE_DIR, { recursive: true });
    }

    const globalFile = path.join(SYNAPSE_DIR, 'global');
    let existingRules = [];

    // Read existing rules (preserve non-KAIROS rules)
    if (fs.existsSync(globalFile)) {
        const content = fs.readFileSync(globalFile, 'utf8');
        existingRules = content
            .split('\n')
            .filter(line => line.trim() && !line.startsWith('# KAIROS'));
    }

    // KAIROS-injected rules
    const kairosRules = [
        '# KAIROS ENGINE RULES (auto-injected by aios-kairos-bridge.js)',
        '# These rules extend the AIOS constitution with KAIROS cognitive protocols.',
        '',
        'OPUS Cognitive Protocol: Every output traverses 3 layers (Immediate, Structural, Strategic).',
        'Evidence Rule: No claim without citation. No code without rationale.',
        'Synthesis Rule: Every non-trivial output acknowledges tension and steel-mans rejected alternatives.',
        'Modularity Rule: Every output is reusable by other AIOS agents.',
        'Evolution Rule: The system gets better every session. Never the same mistake twice.',
        '',
        '# Operator Context',
        'The operator is Gabriel, founder of Experia Technologies.',
        'AIOS serves Gabriel and his clients. It does not serve itself.',
        'Honesty about limitations is more valuable than fabricated competence.',
    ];

    // Merge: existing rules first, then KAIROS rules
    const merged = [...existingRules, '', ...kairosRules].join('\n');
    fs.writeFileSync(globalFile, merged.trim() + '\n');

    return { synced: true, rulesInjected: kairosRules.length };
}

// ─── 3. Agent Registry Synchronizer ─────────────────────────────

/**
 * Build a unified agent index that combines:
 * - .aios-core/agents/ (16 original AIOS agents)
 * - squads/ (178+ KAIROS agents)
 * - .antigravity/agents/ (custom agents)
 * 
 * Writes to .aios-core/data/unified-agent-index.json
 */
function syncAgentRegistry() {
    const agentSources = [
        { dir: path.join(ROOT, '.aios-core', 'agents'), source: 'aios-core', type: 'core' },
        { dir: path.join(ROOT, 'squads'), source: 'kairos-squads', type: 'extension' },
        { dir: path.join(ROOT, '.antigravity', 'agents'), source: 'antigravity', type: 'custom' },
    ];

    const index = {
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
        totalAgents: 0,
        sources: {},
        agents: []
    };

    for (const { dir, source, type } of agentSources) {
        if (!fs.existsSync(dir)) continue;

        const agents = scanAgentsRecursive(dir, source);
        index.sources[source] = { count: agents.length, type };
        index.agents.push(...agents);
        index.totalAgents += agents.length;
    }

    // Write unified index
    fs.writeFileSync(UNIFIED_INDEX, JSON.stringify(index, null, 2));
    return index;
}

/**
 * Recursively scan a directory for agent definition files (.md)
 */
function scanAgentsRecursive(dir, source) {
    const agents = [];

    function scan(currentDir, prefix) {
        if (!fs.existsSync(currentDir)) return;
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });

        for (const entry of entries) {
            if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'archive') continue;

            if (entry.isDirectory()) {
                scan(path.join(currentDir, entry.name), `${prefix}/${entry.name}`);
            } else if (entry.isFile() && entry.name.endsWith('.md')) {
                agents.push({
                    id: entry.name.replace('.md', ''),
                    path: `${prefix}/${entry.name}`,
                    source,
                    fileSize: fs.statSync(path.join(currentDir, entry.name)).size
                });
            }
        }
    }

    scan(dir, source);
    return agents;
}

// ─── Event Logging ──────────────────────────────────────────────

function logBridgeEvent(event, data) {
    try {
        let events = [];
        if (fs.existsSync(BRIDGE_LOG)) {
            events = JSON.parse(fs.readFileSync(BRIDGE_LOG, 'utf8'));
        }

        events.push({
            timestamp: new Date().toISOString(),
            event,
            data
        });

        // Keep last 100 events
        if (events.length > 100) events = events.slice(-100);
        fs.writeFileSync(BRIDGE_LOG, JSON.stringify(events, null, 2));
    } catch { /* non-critical */ }
}

// ─── Status ─────────────────────────────────────────────────────

function getStatus() {
    const synapseGlobal = path.join(SYNAPSE_DIR, 'global');
    const hasSynapseRules = fs.existsSync(synapseGlobal);
    const hasUnifiedIndex = fs.existsSync(UNIFIED_INDEX);
    const hasBridgeLog = fs.existsSync(BRIDGE_LOG);

    let eventCount = 0;
    if (hasBridgeLog) {
        try {
            eventCount = JSON.parse(fs.readFileSync(BRIDGE_LOG, 'utf8')).length;
        } catch { /* ignore */ }
    }

    let agentCount = 0;
    if (hasUnifiedIndex) {
        try {
            agentCount = JSON.parse(fs.readFileSync(UNIFIED_INDEX, 'utf8')).totalAgents;
        } catch { /* ignore */ }
    }

    return {
        synapseInjection: hasSynapseRules ? 'ACTIVE' : 'NOT_SYNCED',
        unifiedAgentIndex: hasUnifiedIndex ? `ACTIVE (${agentCount} agents)` : 'NOT_BUILT',
        bridgeEvents: eventCount,
        orchestratorHooks: 'AVAILABLE (onEpicStart, onEpicComplete, onStateChange)'
    };
}

module.exports = {
    // Hook callbacks for MasterOrchestrator
    onEpicStart,
    onEpicComplete,
    onStateChange,

    // Sync operations
    syncKairosToSynapse,
    syncAgentRegistry,

    // Status
    getStatus
};

// CLI execution
if (require.main === module) {
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║   🌉 AIOS-KAIROS Bridge — Manual Sync            ║');
    console.log('╚══════════════════════════════════════════════════╝\n');

    // Sync Synapse rules
    const synapse = syncKairosToSynapse();
    console.log(`  ✅ Synapse injection: ${synapse.rulesInjected} KAIROS rules written to .synapse/global`);

    // Sync agent registry
    const agents = syncAgentRegistry();
    console.log(`  ✅ Agent registry: ${agents.totalAgents} agents indexed from ${Object.keys(agents.sources).length} sources`);
    for (const [source, data] of Object.entries(agents.sources)) {
        console.log(`     ${source}: ${data.count} agents (${data.type})`);
    }

    // Status
    const status = getStatus();
    console.log(`\n  📊 Bridge Status:`);
    console.log(`     Synapse: ${status.synapseInjection}`);
    console.log(`     Agents: ${status.unifiedAgentIndex}`);
    console.log(`     Events: ${status.bridgeEvents}`);
    console.log(`     Hooks: ${status.orchestratorHooks}`);
    console.log('');
}
