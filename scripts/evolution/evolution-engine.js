/**
 * @module evolution-engine
 * @purpose Master orchestrator of the Evolution Engine. Ties all 5 phases
 *          together into a single evolution cycle. This file NEVER modifies
 *          itself — it is in the FORBIDDEN_COMPONENTS list.
 * @inputs  Trigger (schedule | event | manual), options
 * @outputs Complete cycle report
 * @emits   meta.audit_complete, meta.evolution_proposal, system.evolution_applied, system.evolution_verified
 * @dependencies All evolution sub-modules
 * 
 * ═══════════════════════════════════════════════════════════════
 * THIS FILE IS IN THE FORBIDDEN LIST — IT NEVER MODIFIES ITSELF.
 * ═══════════════════════════════════════════════════════════════
 * 
 * FULL CYCLE:
 *   1. Load circuit-breaker config
 *   2. Check convergence-guard (should we start?)
 *   3. Audit → AUDIT_REPORT (Phase 1)
 *   4. Proposal → PROPOSALS for top 3 gaps (Phase 2)
 *   5. Validation → APPROVED proposals via Council voting (Phase 3)
 *   6. Apply → APPLIED changes with backups (Phase 4) [skip in dry-run]
 *   7. Verification → VERIFIED against frozen baseline (Phase 5) [skip in dry-run]
 *   8. Distillation → Chair 8 captures traces post-verification
 *   9. Notification → NOTIFY Gabriel via notification-bridge
 *  10. Save cycle report
 */

'use strict';

const fs = require('fs');
const path = require('path');
const CONFIG = require('./circuit-breaker.config');
const ConvergenceGuard = require('./convergence-guard');
const AuditEngine = require('./audit-engine');
const ProposalEngine = require('./proposal-engine');
const ValidationEngine = require('./validation-engine');
const ApplyEngine = require('./apply-engine');
const VerificationEngine = require('./verification-engine');
const Council = require('./ia-council-engine');

// Lazy-load notification bridge (may not exist yet during bootstrapping)
let NotificationBridge;
try {
    NotificationBridge = require('./notification-bridge');
} catch {
    NotificationBridge = null;
}

// ─────────────────────────────────────────────────────────────
// MAIN CYCLE ORCHESTRATOR
// ─────────────────────────────────────────────────────────────

/**
 * @purpose Run a complete evolution cycle
 * @inputs  {Object} options - {
 *            dryRun: boolean (default: true),
 *            scope: 'full'|'targeted' (default: 'full'),
 *            focusPath: string (for targeted scope),
 *            trigger: 'manual'|'scheduled'|'event' (default: 'manual'),
 *          }
 * @outputs {Object} cycleReport - complete report of all phases
 */
async function runCycle(options = {}) {
    const dryRun = options.dryRun !== false; // Default: true (SAFE)
    const scope = options.scope || 'full';
    const trigger = options.trigger || 'manual';
    const startTime = Date.now();

    console.log('\n' + '╔' + '═'.repeat(60) + '╗');
    console.log('║  🧬 EVOLUTION ENGINE — Cycle Starting' + ' '.repeat(21) + '║');
    console.log('║  Mode: ' + (dryRun ? 'DRY-RUN (safe)' : '⚠️  LIVE').padEnd(52) + '║');
    console.log('║  Scope: ' + scope.padEnd(51) + '║');
    console.log('║  Trigger: ' + trigger.padEnd(49) + '║');
    console.log('╚' + '═'.repeat(60) + '╝\n');

    const cycleReport = {
        id: `CYCLE-${new Date().toISOString().replace(/[:.]/g, '-')}`,
        startTime: new Date().toISOString(),
        trigger,
        dryRun,
        scope,
        phases: {},
        distillation: null,
        success: false,
        aborted: false,
        abortReason: null,
    };

    // ── STEP 1: Pre-flight check ──
    console.log('🛫 Pre-flight: Checking convergence guard...');
    const preCheck = ConvergenceGuard.shouldStartCycle();
    if (!preCheck.shouldStart) {
        console.log(`⛔ CYCLE ABORTED: ${preCheck.reason}`);
        cycleReport.aborted = true;
        cycleReport.abortReason = preCheck.reason;
        cycleReport.endTime = new Date().toISOString();
        cycleReport.duration = Date.now() - startTime;
        saveCycleReport(cycleReport);
        return cycleReport;
    }
    console.log(`✅ Pre-flight passed: ${preCheck.reason}\n`);

    // ── STEP 2: Phase 1 — Audit ──
    try {
        const auditReport = AuditEngine.runAudit({
            projectRoot: CONFIG.PATHS.PROJECT_ROOT,
            scope,
            focusPath: options.focusPath,
            dryRun,
        });
        cycleReport.phases.audit = auditReport;

        if (auditReport.topGaps.length === 0) {
            console.log('\n🎉 No gaps found! System is in optimal state.');
            cycleReport.success = true;
            cycleReport.endTime = new Date().toISOString();
            cycleReport.duration = Date.now() - startTime;
            saveCycleReport(cycleReport);
            return cycleReport;
        }
    } catch (err) {
        console.log(`\n❌ Audit phase failed: ${err.message}`);
        cycleReport.phases.audit = { error: err.message };
        cycleReport.aborted = true;
        cycleReport.abortReason = `Audit failed: ${err.message}`;
        saveCycleReport(cycleReport);
        return cycleReport;
    }

    // ── STEP 3: Phase 2 — Proposals ──
    try {
        const proposalResult = ProposalEngine.runProposals(
            cycleReport.phases.audit,
            { files: cycleReport.phases.audit.systemState ? [] : [], qualityBaseline: {} }
        );
        cycleReport.phases.proposals = proposalResult;

        if (proposalResult.proposals.length === 0) {
            console.log('\n⚠️  No proposals generated. Cycle ending.');
            cycleReport.endTime = new Date().toISOString();
            cycleReport.duration = Date.now() - startTime;
            saveCycleReport(cycleReport);
            return cycleReport;
        }
    } catch (err) {
        console.log(`\n❌ Proposal phase failed: ${err.message}`);
        cycleReport.phases.proposals = { error: err.message };
        cycleReport.aborted = true;
        cycleReport.abortReason = `Proposals failed: ${err.message}`;
        saveCycleReport(cycleReport);
        return cycleReport;
    }

    // ── STEP 4: Phase 3 — Validation ──
    try {
        const validationResult = ValidationEngine.runValidation(
            cycleReport.phases.proposals.proposals,
            { qualityBaseline: {} }
        );
        cycleReport.phases.validation = validationResult;

        if (validationResult.blocked) {
            console.log('\n⛔ Validation blocked by convergence guard.');
            cycleReport.endTime = new Date().toISOString();
            cycleReport.duration = Date.now() - startTime;
            saveCycleReport(cycleReport);
            return cycleReport;
        }
    } catch (err) {
        console.log(`\n❌ Validation phase failed: ${err.message}`);
        cycleReport.phases.validation = { error: err.message };
        cycleReport.aborted = true;
        cycleReport.abortReason = `Validation failed: ${err.message}`;
        saveCycleReport(cycleReport);
        return cycleReport;
    }

    // ── STEP 5: Phase 4 — Apply (only if NOT dry-run) ──
    if (dryRun) {
        console.log('\n🏜️  DRY-RUN: Skipping Apply and Verification phases.');
        console.log(`   ${cycleReport.phases.validation.approved.length} proposal(s) WOULD be applied in live mode.`);
        cycleReport.phases.apply = { dryRun: true, wouldApply: cycleReport.phases.validation.approved.length };
        cycleReport.phases.verification = { dryRun: true, skipped: true };
    } else {
        try {
            const applyResult = ApplyEngine.runApply(
                cycleReport.phases.validation.approved,
                { dryRun: false }
            );
            cycleReport.phases.apply = applyResult;
        } catch (err) {
            console.log(`\n❌ Apply phase failed: ${err.message}`);
            cycleReport.phases.apply = { error: err.message };
            cycleReport.aborted = true;
            cycleReport.abortReason = `Apply failed: ${err.message}`;
            saveCycleReport(cycleReport);
            return cycleReport;
        }

        // ── STEP 6: Phase 5 — Verification ──
        try {
            const verificationResult = VerificationEngine.runVerification(
                cycleReport.phases.apply,
                { dryRun: false }
            );
            cycleReport.phases.verification = verificationResult;
        } catch (err) {
            console.log(`\n❌ Verification phase failed: ${err.message}`);
            cycleReport.phases.verification = { error: err.message };
        }
    }

    // ── STEP 7: Chair 8 — Distillation (always runs after Phase 5) ──
    console.log('\n📊 Chair 8: DISTILLATION ENGINE evaluating cycle outputs...');
    try {
        const distillationResult = Council.evaluateDistillation(
            { files: [] }, // System state — lightweight for post-cycle
            {
                cycleOutputs: cycleReport,
                pm3Score: cycleReport.phases.audit?.council?.overallScore || 0,
            }
        );
        cycleReport.distillation = distillationResult;

        // Log opportunity alerts
        if (distillationResult.distillationReport.opportunityAlerts.length > 0) {
            for (const alert of distillationResult.distillationReport.opportunityAlerts) {
                console.log(`   🌟 ${alert.message}`);
            }
        }

        console.log(`   📈 Distillation score: ${distillationResult.score.toFixed(1)}/10`);
        console.log(`   📁 Traces structured: ${distillationResult.distillationReport.tracesStructured}`);
        console.log(`   📦 Curated examples: ${distillationResult.distillationReport.curatedExamples.length}`);
    } catch (err) {
        console.log(`   ⚠️  Distillation evaluation failed: ${err.message}`);
        cycleReport.distillation = { error: err.message };
    }

    // ── STEP 8: Record cycle in history ──
    cycleReport.success = !cycleReport.aborted;
    cycleReport.endTime = new Date().toISOString();
    cycleReport.duration = Date.now() - startTime;

    ConvergenceGuard.recordCycle({
        proposals: (cycleReport.phases.proposals?.proposals || []).map(p => ({
            file: p.targetFile,
            changeType: p.changeType,
        })),
        improvements: {},
        applied: !dryRun,
        converged: cycleReport.success,
    });

    // ── STEP 9: Save report ──
    saveCycleReport(cycleReport);

    // ── STEP 10: Notification ──
    if (NotificationBridge) {
        try {
            NotificationBridge.notifyCycleComplete(cycleReport);
        } catch {
            // Notification failure is non-critical
        }
    }

    // Final summary
    console.log('\n' + '╔' + '═'.repeat(60) + '╗');
    console.log('║  🧬 EVOLUTION CYCLE COMPLETE' + ' '.repeat(31) + '║');
    console.log('║  Result: ' + (cycleReport.success ? '✅ SUCCESS' : '❌ ISSUES').padEnd(50) + '║');
    console.log('║  Duration: ' + `${(cycleReport.duration / 1000).toFixed(1)}s`.padEnd(48) + '║');
    console.log('║  Gaps found: ' + `${cycleReport.phases.audit?.council?.totalGaps || 0}`.padEnd(46) + '║');
    console.log('║  Proposals: ' + `${cycleReport.phases.proposals?.proposals?.length || 0}`.padEnd(47) + '║');
    console.log('║  Approved: ' + `${cycleReport.phases.validation?.approved?.length || 0}`.padEnd(48) + '║');
    console.log('║  Mode: ' + (dryRun ? 'DRY-RUN' : 'LIVE').padEnd(52) + '║');
    console.log('╚' + '═'.repeat(60) + '╝\n');

    return cycleReport;
}

/**
 * @purpose Save cycle report to disk
 * @inputs  {Object} report
 * @outputs {string} filepath
 */
function saveCycleReport(report) {
    try {
        const reportsDir = CONFIG.PATHS.REPORTS_DIR;
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }
        const filepath = path.join(reportsDir, `${report.id}.json`);
        fs.writeFileSync(filepath, JSON.stringify(report, null, 2), 'utf8');
        console.log(`💾 Report saved: ${filepath}`);
        return filepath;
    } catch (err) {
        console.log(`⚠️  Failed to save report: ${err.message}`);
        return null;
    }
}

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────
module.exports = {
    runCycle,
    saveCycleReport,
};

// ─────────────────────────────────────────────────────────────
// DIRECT EXECUTION (node scripts/evolution/evolution-engine.js --dry-run)
// ─────────────────────────────────────────────────────────────
if (require.main === module) {
    const isDryRun = !process.argv.includes('--live');
    const scope = process.argv.includes('--scope')
        ? process.argv[process.argv.indexOf('--scope') + 1]
        : 'full';

    runCycle({ dryRun: isDryRun, scope, trigger: 'manual' })
        .then(() => process.exit(0))
        .catch(err => {
            console.error('Fatal error:', err);
            process.exit(1);
        });
}
