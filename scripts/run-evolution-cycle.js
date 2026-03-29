#!/usr/bin/env node

/**
 * @module run-evolution-cycle
 * @purpose Single CLI entry point for the Evolution Engine.
 *          Default: --dry-run (safe). Reads config and launches the full cycle.
 * 
 * USAGE:
 *   node scripts/run-evolution-cycle.js             # Dry-run (default)
 *   node scripts/run-evolution-cycle.js --dry-run    # Explicit dry-run
 *   node scripts/run-evolution-cycle.js --live        # ⚠️  LIVE mode (applies changes)
 *   node scripts/run-evolution-cycle.js --scope targeted --focus scripts/kernel-bridge.js
 *   node scripts/run-evolution-cycle.js --help
 * 
 * @dependencies evolution-engine.js
 */

'use strict';

const path = require('path');

// ─────────────────────────────────────────────────────────────
// ARGUMENT PARSING
// ─────────────────────────────────────────────────────────────

function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        dryRun: true,    // DEFAULT: SAFE
        scope: 'full',
        focusPath: '',
        trigger: 'manual',
        help: false,
    };

    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--dry-run':
                options.dryRun = true;
                break;
            case '--live':
                options.dryRun = false;
                break;
            case '--scope':
                options.scope = args[++i] || 'full';
                break;
            case '--focus':
                options.focusPath = args[++i] || '';
                break;
            case '--trigger':
                options.trigger = args[++i] || 'manual';
                break;
            case '--help':
            case '-h':
                options.help = true;
                break;
        }
    }

    return options;
}

function printHelp() {
    console.log(`
🧬 AIOS Evolution Engine — CLI

USAGE:
  node scripts/run-evolution-cycle.js [options]

OPTIONS:
  --dry-run      Run in safe mode (default — no changes applied)
  --live         ⚠️  Apply changes to the real codebase
  --scope TYPE   'full' (default) or 'targeted'
  --focus PATH   Focus on specific path (requires --scope targeted)
  --trigger TYPE 'manual' (default), 'scheduled', or 'event'
  --help, -h     Show this help

EXAMPLES:
  node scripts/run-evolution-cycle.js                         # Safe dry-run
  node scripts/run-evolution-cycle.js --dry-run               # Explicit dry-run
  node scripts/run-evolution-cycle.js --live                   # ⚠️  LIVE mode
  node scripts/run-evolution-cycle.js --scope targeted --focus scripts/
  node scripts/run-evolution-cycle.js --help

CYCLE PHASES:
  1. Audit     → Scan project, Council evaluates (8 members + Metamind)
  2. Proposal  → Generate proposals for top 3 gaps
  3. Validate  → Council votes (APPLY/REJECT/DEFER)
  4. Apply     → Apply approved changes (with dual backup)
  5. Verify    → Check against frozen baseline
  6. Distill   → Chair 8 captures traces for local model training
  7. Notify    → Gabriel receives cycle report
`);
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────

async function main() {
    const options = parseArgs();

    if (options.help) {
        printHelp();
        process.exit(0);
    }

    // Safety warning for LIVE mode
    if (!options.dryRun) {
        console.log('');
        console.log('⚠️  ══════════════════════════════════════════════════════');
        console.log('⚠️  LIVE MODE ACTIVATED — Changes will be applied to code');
        console.log('⚠️  Backups will be created before any modifications');
        console.log('⚠️  ══════════════════════════════════════════════════════');
        console.log('');
    }

    console.log('🧬 AIOS Evolution Engine starting...');
    console.log(`   Mode:    ${options.dryRun ? 'DRY-RUN (safe)' : '⚠️  LIVE'}`);
    console.log(`   Scope:   ${options.scope}`);
    console.log(`   Trigger: ${options.trigger}`);

    if (options.focusPath) {
        console.log(`   Focus:   ${options.focusPath}`);
    }

    console.log('');

    try {
        const EvolutionEngine = require('./evolution/evolution-engine');
        const report = await EvolutionEngine.runCycle(options);

        // Exit code based on result
        if (report.aborted) {
            console.log('\n❌ Cycle aborted. Check report for details.');
            process.exit(1);
        } else if (report.success) {
            console.log('\n✅ Cycle complete. Gabriel has been notified.');
            process.exit(0);
        } else {
            console.log('\n⚠️  Cycle completed with issues.');
            process.exit(0);
        }
    } catch (err) {
        console.error('\n💀 FATAL ERROR in Evolution Engine:');
        console.error(`   ${err.message}`);
        console.error(`   Stack: ${err.stack}`);
        process.exit(2);
    }
}

main();
