/**
 * @module notification-bridge
 * @purpose Reporting bridge for Gabriel. Produces human-readable summaries of
 *          evolution cycle results. Supports console output with optional
 *          future integration for Telegram, Email, or other channels.
 * @inputs  Cycle report from evolution-engine
 * @outputs Formatted notification message
 * @emits   None
 * @dependencies circuit-breaker.config.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const CONFIG = require('./circuit-breaker.config');

// ─────────────────────────────────────────────────────────────
// NOTIFICATION FORMATTING
// ─────────────────────────────────────────────────────────────

/**
 * @purpose Format a cycle report into a human-readable notification
 * @inputs  {Object} cycleReport - from evolution-engine
 * @outputs {string} formatted message
 */
function formatCycleReport(cycleReport) {
    const lines = [];

    lines.push('═'.repeat(60));
    lines.push('🧬 EVOLUTION ENGINE — Cycle Report for Gabriel');
    lines.push('═'.repeat(60));
    lines.push('');
    lines.push(`📋 Cycle ID:   ${cycleReport.id}`);
    lines.push(`🕐 Started:    ${cycleReport.startTime}`);
    lines.push(`🕐 Ended:      ${cycleReport.endTime || 'N/A'}`);
    lines.push(`⏱️  Duration:   ${cycleReport.duration ? (cycleReport.duration / 1000).toFixed(1) + 's' : 'N/A'}`);
    lines.push(`🔧 Mode:       ${cycleReport.dryRun ? 'DRY-RUN (safe)' : '⚠️  LIVE'}`);
    lines.push(`🎯 Scope:      ${cycleReport.scope}`);
    lines.push(`🔄 Trigger:    ${cycleReport.trigger}`);
    lines.push('');

    if (cycleReport.aborted) {
        lines.push(`❌ CYCLE ABORTED: ${cycleReport.abortReason}`);
        lines.push('');
    }

    // Audit results
    if (cycleReport.phases?.audit) {
        const audit = cycleReport.phases.audit;
        lines.push('── Phase 1: AUDIT ──');
        if (audit.error) {
            lines.push(`   ❌ Error: ${audit.error}`);
        } else {
            lines.push(`   Score:     ${audit.council?.overallScore || 'N/A'}/10`);
            lines.push(`   Total Gaps: ${audit.council?.totalGaps || 0}`);

            if (audit.council?.memberScores) {
                lines.push('   Member Scores:');
                for (const m of audit.council.memberScores) {
                    lines.push(`     ${m.memberId.padEnd(14)} ${m.score.toFixed(1)}/10 (${m.gapCount} gaps)`);
                }
            }

            if (audit.topGaps && audit.topGaps.length > 0) {
                lines.push('   Top Gaps:');
                for (let i = 0; i < audit.topGaps.length; i++) {
                    const g = audit.topGaps[i];
                    lines.push(`     ${i + 1}. [SEV ${g.severity}] ${g.id}: ${g.description}`);
                }
            }
        }
        lines.push('');
    }

    // Proposal results
    if (cycleReport.phases?.proposals) {
        const proposals = cycleReport.phases.proposals;
        lines.push('── Phase 2: PROPOSALS ──');
        if (proposals.error) {
            lines.push(`   ❌ Error: ${proposals.error}`);
        } else {
            lines.push(`   Generated: ${proposals.proposals?.length || 0}`);
            if (proposals.summary) {
                lines.push(`   By Risk: LOW=${proposals.summary.byRisk?.LOW || 0}, MEDIUM=${proposals.summary.byRisk?.MEDIUM || 0}, HIGH=${proposals.summary.byRisk?.HIGH || 0}`);
                if (proposals.summary.blocked > 0) {
                    lines.push(`   🚫 Blocked: ${proposals.summary.blocked} (forbidden components)`);
                }
            }
        }
        lines.push('');
    }

    // Validation results
    if (cycleReport.phases?.validation) {
        const validation = cycleReport.phases.validation;
        lines.push('── Phase 3: VALIDATION ──');
        if (validation.error) {
            lines.push(`   ❌ Error: ${validation.error}`);
        } else if (validation.blocked) {
            lines.push(`   ⛔ Blocked by convergence guard`);
        } else {
            lines.push(`   ✅ Approved:  ${validation.approved?.length || 0}`);
            lines.push(`   ❌ Rejected:  ${validation.rejected?.length || 0}`);
            lines.push(`   ⏸️  Deferred:  ${validation.deferred?.length || 0}`);
        }
        lines.push('');
    }

    // Apply results
    if (cycleReport.phases?.apply) {
        const apply = cycleReport.phases.apply;
        lines.push('── Phase 4: APPLY ──');
        if (apply.dryRun) {
            lines.push(`   🏜️  DRY-RUN: Would apply ${apply.wouldApply || 0} proposal(s)`);
        } else if (apply.error) {
            lines.push(`   ❌ Error: ${apply.error}`);
        } else {
            lines.push(`   ✅ Applied:  ${apply.applied?.length || 0}`);
            lines.push(`   ⏭️  Skipped:  ${apply.skipped?.length || 0}`);
            lines.push(`   ❌ Failed:   ${apply.failed?.length || 0}`);
        }
        lines.push('');
    }

    // Verification results
    if (cycleReport.phases?.verification) {
        const verify = cycleReport.phases.verification;
        lines.push('── Phase 5: VERIFICATION ──');
        if (verify.dryRun || verify.skipped) {
            lines.push(`   🏜️  DRY-RUN: Verification skipped`);
        } else if (verify.error) {
            lines.push(`   ❌ Error: ${verify.error}`);
        } else {
            lines.push(`   All Passed: ${verify.allPassed ? '✅' : '❌'}`);
            lines.push(`   Baseline Drift: ${verify.summary?.baselineDriftPercent || 0}%`);
            if (verify.rolledBack) {
                lines.push(`   ↩️  ROLLBACK EXECUTED`);
            }
        }
        lines.push('');
    }

    // Distillation results (Chair 8)
    if (cycleReport.distillation) {
        const dist = cycleReport.distillation;
        lines.push('── Chair 8: DISTILLATION ──');
        if (dist.error) {
            lines.push(`   ⚠️  Error: ${dist.error}`);
        } else {
            lines.push(`   Score: ${dist.score?.toFixed(1) || 'N/A'}/10`);
            lines.push(`   Traces Structured: ${dist.distillationReport?.tracesStructured || false}`);
            lines.push(`   Curated Examples: ${dist.distillationReport?.curatedExamples?.length || 0}`);

            if (dist.distillationReport?.opportunityAlerts?.length > 0) {
                lines.push('   🌟 Opportunity Alerts:');
                for (const alert of dist.distillationReport.opportunityAlerts) {
                    lines.push(`      ${alert.message}`);
                }
            }

            if (dist.distillationReport?.roadmap) {
                lines.push(`   📊 Roadmap: ${dist.distillationReport.roadmap.total_traces || 0}/500 traces toward independence`);
            }

            // Gaps from Chair 8
            if (dist.gaps && dist.gaps.length > 0) {
                lines.push(`   Gaps (${dist.gaps.length}):`);
                for (const g of dist.gaps) {
                    lines.push(`     [SEV ${g.severity}] ${g.id}: ${g.description}`);
                }
            }
        }
        lines.push('');
    }

    // Final status
    lines.push('── FINAL STATUS ──');
    lines.push(`   ${cycleReport.success ? '✅ CYCLE COMPLETE' : '❌ CYCLE INCOMPLETE'}`);
    lines.push('═'.repeat(60));

    return lines.join('\n');
}

/**
 * @purpose Notify Gabriel of cycle completion
 * @inputs  {Object} cycleReport
 * @outputs {void}
 */
function notifyCycleComplete(cycleReport) {
    const message = formatCycleReport(cycleReport);

    // Channel 1: Console output (always)
    console.log('\n' + message);

    // Channel 2: Save notification to disk
    try {
        const notificationDir = path.join(CONFIG.PATHS.REPORTS_DIR, 'notifications');
        if (!fs.existsSync(notificationDir)) {
            fs.mkdirSync(notificationDir, { recursive: true });
        }
        const filepath = path.join(notificationDir, `${cycleReport.id}-notification.txt`);
        fs.writeFileSync(filepath, message, 'utf8');
        console.log(`📨 Notification saved: ${filepath}`);
    } catch (err) {
        console.log(`⚠️  Failed to save notification: ${err.message}`);
    }

    // Channel 3: Event bus (for future integrations — Telegram, Slack, etc.)
    try {
        const { bus } = require('../event-bus');
        bus.publish('meta.notification', {
            type: 'evolution_cycle_complete',
            cycleId: cycleReport.id,
            success: cycleReport.success,
            message: message.substring(0, 500), // Truncated for event bus
        }, { source: 'notification-bridge' });
    } catch {
        // Event bus not available
    }
}

/**
 * @purpose Notify Gabriel of a security violation
 * @inputs  {Object} violation - { file, proposalId, type }
 * @outputs {void}
 */
function notifySecurityViolation(violation) {
    const message = [
        '🚨 SECURITY ALERT — Evolution Engine',
        '═'.repeat(40),
        `File:       ${violation.file}`,
        `Proposal:   ${violation.proposalId}`,
        `Type:       ${violation.type}`,
        `Timestamp:  ${new Date().toISOString()}`,
        '',
        'A forbidden component modification was attempted.',
        'The proposal has been automatically blocked.',
        '═'.repeat(40),
    ].join('\n');

    console.log('\n' + message);

    try {
        const { bus } = require('../event-bus');
        bus.publish('meta.security_alert', violation, { source: 'notification-bridge' });
    } catch {
        // Event bus not available
    }
}

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────
module.exports = {
    formatCycleReport,
    notifyCycleComplete,
    notifySecurityViolation,
};
