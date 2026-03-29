#!/usr/bin/env node

/**
 * @module activate-kernel
 * @version 1.0.0
 * @purpose One-shot verification of all kernel modules (Synapse, IDS, WIS).
 *          Displays health status and runs a Synapse pipeline test.
 * @inputs  None (CLI only)
 * @outputs Console report with per-module status and overall kernel health
 * @dependencies kernel-bridge.js
 */

const { createKernelBridge } = require('./kernel-bridge');

function main() {
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('  ⚡ AIOS Kernel Activation Check');
    console.log('═══════════════════════════════════════════════════');
    console.log('');

    const bridge = createKernelBridge();
    const health = bridge.getSystemHealth();

    // Synapse
    const syn = health.modules.synapse;
    const synIcon = syn.available ? '✅' : '❌';
    console.log(`  ${synIcon} Synapse Engine`);
    if (syn.available) {
        console.log(`     Layers loaded: ${syn.layers}`);
        const hasMetrics = syn.metrics && !syn.metrics.error && syn.metrics.status !== 'no-metrics-yet';
        console.log(`     Last metrics:  ${hasMetrics ? syn.metrics.totalDuration + 'ms' : 'none yet'}`);
    } else {
        console.log('     Module could not be loaded');
    }
    console.log('');

    // IDS
    const idsInfo = health.modules.ids;
    const idsIcon = idsInfo.available ? '✅' : '❌';
    console.log(`  ${idsIcon} IDS (Incremental Decision System)`);
    if (idsInfo.available) {
        console.log(`     Entity Registry: ${idsInfo.entities} entities`);
        const cats = idsInfo.registry && idsInfo.registry.categories
            ? idsInfo.registry.categories
            : [];
        console.log(`     Categories:      ${cats.length > 0 ? cats.join(', ') : 'none'}`);
    } else {
        console.log('     Module could not be loaded');
    }
    console.log('');

    // WIS
    const wisInfo = health.modules.wis;
    const wisIcon = wisInfo.available ? '✅' : '❌';
    console.log(`  ${wisIcon} WIS (Workflow Intelligence System)`);
    if (wisInfo.available) {
        const names = wisInfo.workflows || [];
        console.log(`     Workflows:     ${names.length}`);
        if (names.length > 0) {
            for (const name of names.slice(0, 5)) {
                console.log(`       • ${name}`);
            }
            if (names.length > 5) {
                console.log(`       ... and ${names.length - 5} more`);
            }
        }
        console.log(`     Learning:      ${wisInfo.hasLearning ? 'enabled' : 'not loaded'}`);
        if (wisInfo.stats && wisInfo.stats.workflowCount !== undefined) {
            console.log(`     Stats:         ${wisInfo.stats.workflowCount} workflows, ${wisInfo.stats.patternCount || 0} patterns`);
        }
    } else {
        console.log('     Module could not be loaded');
    }
    console.log('');

    // Run Synapse test if available
    if (syn.available) {
        console.log('───────────────────────────────────────────────────');
        console.log('  🧪 Running Synapse pipeline test...');
        bridge.synapse.process('test activation', { prompt_count: 0 })
            .then((result) => {
                console.log(`     Pipeline OK — ${result.metrics.total_rules || 0} rules, ${Math.round(result.metrics.total_ms || 0)}ms`);
                console.log(`     Layers: ${result.metrics.layers_loaded || 0} loaded, ${result.metrics.layers_skipped || 0} skipped, ${result.metrics.layers_errored || 0} errored`);
                printFinal(health.overall);
            })
            .catch((err) => {
                console.log(`     Pipeline FAILED: ${err.message}`);
                printFinal('PARTIAL');
            });
    } else {
        printFinal(health.overall);
    }
}

function printFinal(overall) {
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    const icon = overall === 'ACTIVE' ? '🟢' : (overall === 'PARTIAL' ? '🟡' : '🔴');
    console.log(`  ${icon} Kernel Status: ${overall}`);
    console.log('═══════════════════════════════════════════════════');
    console.log('');
}

main();
