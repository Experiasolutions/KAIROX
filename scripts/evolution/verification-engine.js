/**
 * @module verification-engine
 * @purpose Phase 5 of the Evolution Cycle — Post-Application Verification.
 *          Validates applied changes against baseline-frozen.json.
 *          Auto-rollback on failure. Updates quality baseline on success.
 * @inputs  Applied changes, baseline-frozen.json
 * @outputs Verification report (pass/fail with evidence)
 * @emits   system.evolution_verified (via event-bus)
 * @dependencies circuit-breaker.config.js, apply-engine.js
 * 
 * EDGE CASES HANDLED:
 *   EC-01: Loop Detection — via convergence-guard (pre-check)
 *   EC-05: Baseline Drift — flags if >40% of hashes differ
 */

'use strict';

const fs = require('fs');
const path = require('path');
const CONFIG = require('./circuit-breaker.config');
const ApplyEngine = require('./apply-engine');

// ─────────────────────────────────────────────────────────────
// VERIFICATION CHECKS
// ─────────────────────────────────────────────────────────────

/**
 * @purpose Check 1: Syntax validation — all modified JS files must parse
 * @inputs  {Array} appliedChanges - from apply-engine
 * @outputs {{ passed: boolean, errors: Array }}
 */
function checkSyntax(appliedChanges) {
    const errors = [];

    for (const change of appliedChanges) {
        if (change.targetFile && change.targetFile.endsWith('.js') && !change.dryRun) {
            const absPath = path.isAbsolute(change.targetFile)
                ? change.targetFile
                : path.join(CONFIG.PATHS.PROJECT_ROOT, change.targetFile);

            try {
                const content = fs.readFileSync(absPath, 'utf8');
                // Try to compile the function to check syntax
                require('vm').compileFunction(content);
            } catch (err) {
                errors.push({
                    file: change.targetFile,
                    error: err.message,
                    proposalId: change.id,
                });
            }
        }
    }

    return {
        passed: errors.length === 0,
        errors,
        checkName: 'SYNTAX_VALIDATION',
    };
}

/**
 * @purpose Check 2: Baseline comparison — no unexpected hash changes
 * @inputs  None (reads baseline-frozen.json and current files)
 * @outputs {{ passed: boolean, changedComponents: Array, driftPercent: number }}
 */
function checkBaseline() {
    let baseline;
    try {
        baseline = JSON.parse(fs.readFileSync(CONFIG.PATHS.BASELINE_FROZEN, 'utf8'));
    } catch {
        return {
            passed: false,
            errors: [{ error: 'Cannot read baseline-frozen.json' }],
            checkName: 'BASELINE_COMPARISON',
            changedComponents: [],
            driftPercent: 100,
        };
    }

    const changedComponents = [];
    const totalComponents = Object.keys(baseline.components).length;
    let changedCount = 0;

    for (const [filePath, component] of Object.entries(baseline.components)) {
        if (!component.exists) continue;

        const currentHash = CONFIG.hashFile(filePath);

        if (currentHash === null) {
            changedComponents.push({
                file: filePath,
                status: 'DELETED',
                baselineHash: component.hash,
                currentHash: null,
            });
            changedCount++;
        } else if (currentHash !== component.hash) {
            changedComponents.push({
                file: filePath,
                status: 'MODIFIED',
                baselineHash: component.hash,
                currentHash,
            });
            changedCount++;
        }
    }

    const driftPercent = totalComponents > 0 ? changedCount / totalComponents : 0;

    // EC-05: Baseline drift detection
    const baselineDrift = driftPercent > CONFIG.CONVERGENCE.BASELINE_DRIFT_THRESHOLD;

    return {
        passed: !baselineDrift,
        changedComponents,
        driftPercent: Math.round(driftPercent * 100),
        baselineDrift,
        totalComponents,
        changedCount,
        checkName: 'BASELINE_COMPARISON',
    };
}

/**
 * @purpose Check 3: Critical component integrity
 * @inputs  {Array} appliedChanges
 * @outputs {{ passed: boolean, violations: Array }}
 */
function checkCriticalComponents(appliedChanges) {
    const violations = [];

    for (const change of appliedChanges) {
        if (CONFIG.isForbidden(change.targetFile)) {
            violations.push({
                file: change.targetFile,
                proposalId: change.id,
                violation: 'FORBIDDEN_COMPONENT_MODIFIED',
            });
        }
    }

    return {
        passed: violations.length === 0,
        violations,
        checkName: 'CRITICAL_COMPONENT_INTEGRITY',
    };
}

// ─────────────────────────────────────────────────────────────
// VERIFICATION EXECUTION
// ─────────────────────────────────────────────────────────────

/**
 * @purpose Run the full verification phase (Phase 5 of Evolution)
 * @inputs  {Object} applyResult - from apply-engine
 * @inputs  {Object} options - { dryRun, autoRollback }
 * @outputs {Object} verificationReport
 */
function runVerification(applyResult, options = {}) {
    const dryRun = options.dryRun !== false;
    const autoRollback = options.autoRollback !== false;

    console.log(`\n🔍 Phase 5: VERIFICATION ENGINE starting... (${dryRun ? 'DRY-RUN' : 'LIVE'})`);

    const checks = [];

    // Run all verification checks
    console.log('   🔎 Running syntax validation...');
    const syntaxCheck = checkSyntax(applyResult.applied);
    checks.push(syntaxCheck);
    console.log(`      ${syntaxCheck.passed ? '✅' : '❌'} Syntax: ${syntaxCheck.passed ? 'PASS' : `${syntaxCheck.errors.length} error(s)`}`);

    console.log('   🔎 Running baseline comparison...');
    const baselineCheck = checkBaseline();
    checks.push(baselineCheck);
    console.log(`      ${baselineCheck.passed ? '✅' : '⚠️'} Baseline: ${baselineCheck.driftPercent}% drift (threshold: ${CONFIG.CONVERGENCE.BASELINE_DRIFT_THRESHOLD * 100}%)`);

    if (baselineCheck.baselineDrift) {
        console.log(`      ⚠️  EC-05: BASELINE_DRIFT detected! ${baselineCheck.changedCount}/${baselineCheck.totalComponents} components changed.`);
        console.log(`      📢 Gabriel should consider refreshing baseline-frozen.json.`);
    }

    console.log('   🔎 Running critical component integrity...');
    const criticalCheck = checkCriticalComponents(applyResult.applied);
    checks.push(criticalCheck);
    console.log(`      ${criticalCheck.passed ? '✅' : '❌'} Critical integrity: ${criticalCheck.passed ? 'PASS' : `${criticalCheck.violations.length} violation(s)`}`);

    // Overall result
    const allPassed = checks.every(c => c.passed);
    const hasRegressions = !syntaxCheck.passed || !criticalCheck.passed;

    // Auto-rollback if regressions detected and not dry-run
    let rolledBack = false;
    if (hasRegressions && !dryRun && autoRollback) {
        console.log('\n   ⚠️  REGRESSIONS DETECTED — initiating rollback...');
        for (const change of applyResult.applied) {
            if (change.backupKey && !change.dryRun) {
                ApplyEngine.rollbackFile(change.targetFile, change.backupKey);
            }
        }
        rolledBack = true;
        console.log('   ↩️  Rollback complete.');
    }

    // Build verification report
    const report = {
        id: `VERIFY-${new Date().toISOString().replace(/[:.]/g, '-')}`,
        timestamp: new Date().toISOString(),
        dryRun,
        allPassed,
        rolledBack,
        checks: checks.map(c => ({
            name: c.checkName,
            passed: c.passed,
            details: c,
        })),
        summary: {
            syntaxValid: syntaxCheck.passed,
            baselineStable: baselineCheck.passed,
            baselineDriftPercent: baselineCheck.driftPercent,
            criticalIntact: criticalCheck.passed,
        },
    };

    // Emit event
    try {
        const { bus } = require('../event-bus');
        bus.publish('system.evolution_verified', {
            verificationId: report.id,
            allPassed,
            rolledBack,
            driftPercent: baselineCheck.driftPercent,
        }, { source: 'verification-engine' });
    } catch {
        // Event bus not available
    }

    // Print summary
    console.log('\n   ' + '─'.repeat(50));
    console.log(`   VERIFICATION RESULT: ${allPassed ? '✅ ALL PASSED' : '❌ ISSUES FOUND'}`);
    if (rolledBack) console.log(`   ↩️  ROLLBACK EXECUTED`);
    if (baselineCheck.baselineDrift) console.log(`   ⚠️  BASELINE DRIFT: Consider refreshing frozen baseline`);
    console.log('   ' + '─'.repeat(50));

    return report;
}

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────
module.exports = {
    checkSyntax,
    checkBaseline,
    checkCriticalComponents,
    runVerification,
};

// ─────────────────────────────────────────────────────────────
// SELF-TEST (node scripts/evolution/verification-engine.js --test)
// ─────────────────────────────────────────────────────────────
if (require.main === module && process.argv.includes('--test')) {
    console.log('🔍 Verification Engine — Self-Test\n');

    const mockApplyResult = {
        applied: [
            { id: 'PROP-TEST', targetFile: 'docs/test.md', dryRun: true, changeType: 'documentation' },
        ],
        skipped: [],
        failed: [],
    };

    const result = runVerification(mockApplyResult, { dryRun: true });
    console.log(`\nAll passed: ${result.allPassed}`);
    console.log(`Baseline drift: ${result.summary.baselineDriftPercent}%`);
    console.log('\n✅ Verification engine test complete.');
}
