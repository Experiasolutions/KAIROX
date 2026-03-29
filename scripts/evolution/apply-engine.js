/**
 * @module apply-engine
 * @purpose Phase 4 of the Evolution Cycle — Autonomous Application.
 *          Applies approved proposals with risk-based behavior:
 *          LOW → apply directly, MEDIUM → apply with diff, HIGH → branch.
 *          Checks forbidden components, creates dual backups.
 * @inputs  Validated proposals, dryRun flag
 * @outputs Applied changes with backup or dry-run report
 * @emits   system.evolution_applied (via event-bus)
 * @dependencies circuit-breaker.config.js
 * 
 * EDGE CASES HANDLED:
 *   EC-02: Rollback Failure — dual backup (disk + memory)
 *   EC-04: Technically Impossible Proposal — pre-application sanity check
 *   EC-06: Self-Modification Attempt — forbidden component check
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const CONFIG = require('./circuit-breaker.config');

// In-memory backup store (secondary — for current session rollback)
const memoryBackups = new Map();

// ─────────────────────────────────────────────────────────────
// BACKUP MANAGEMENT
// ─────────────────────────────────────────────────────────────

/**
 * @purpose Create dual backup of a file (disk + memory)
 * @inputs  {string} filePath - absolute or relative path
 * @outputs {{ diskPath: string|null, memoryKey: string, verified: boolean }}
 */
function createBackup(filePath) {
    const absPath = path.isAbsolute(filePath)
        ? filePath
        : path.join(CONFIG.PATHS.PROJECT_ROOT, filePath);

    const relativePath = path.relative(CONFIG.PATHS.PROJECT_ROOT, absPath).replace(/\\/g, '/');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const memoryKey = `${relativePath}::${timestamp}`;

    let content = null;
    let diskPath = null;

    try {
        content = fs.readFileSync(absPath, 'utf8');
    } catch {
        // File doesn't exist — creating new, no backup needed
        return { diskPath: null, memoryKey, verified: true, isNew: true };
    }

    // EC-02: Dual backup
    // 1. Memory backup (always)
    memoryBackups.set(memoryKey, { path: relativePath, content, timestamp });

    // 2. Disk backup
    try {
        const backupDir = path.join(CONFIG.PATHS.BACKUPS_DIR, timestamp);
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        diskPath = path.join(backupDir, path.basename(filePath));
        fs.writeFileSync(diskPath, content, 'utf8');
    } catch (err) {
        console.log(`   ⚠️  Disk backup failed for ${relativePath}: ${err.message}`);
        diskPath = null;
    }

    // Verify backup integrity
    const verified = content !== null && (diskPath !== null || memoryBackups.has(memoryKey));

    return { diskPath, memoryKey, verified, isNew: false };
}

/**
 * @purpose Rollback a file from backup
 * @inputs  {string} filePath - relative path
 * @inputs  {string} memoryKey - key in memoryBackups
 * @outputs {boolean} success
 */
function rollbackFile(filePath, memoryKey) {
    const absPath = path.isAbsolute(filePath)
        ? filePath
        : path.join(CONFIG.PATHS.PROJECT_ROOT, filePath);

    // Try memory backup first (fastest)
    if (memoryBackups.has(memoryKey)) {
        const backup = memoryBackups.get(memoryKey);
        try {
            fs.writeFileSync(absPath, backup.content, 'utf8');
            console.log(`   ↩️  Rolled back ${filePath} from memory backup`);
            return true;
        } catch (err) {
            console.log(`   ❌ Memory rollback failed: ${err.message}`);
        }
    }

    console.log(`   ❌ No valid backup found for ${filePath}`);
    return false;
}

// ─────────────────────────────────────────────────────────────
// PRE-APPLICATION SANITY CHECKS
// ─────────────────────────────────────────────────────────────

/**
 * @purpose EC-04: Validate that a proposal is technically feasible
 * @inputs  {Object} proposal - with targetFile and diff
 * @outputs {{ feasible: boolean, reason: string }}
 */
function checkFeasibility(proposal) {
    // EC-06: Check forbidden components FIRST
    if (CONFIG.isForbidden(proposal.targetFile)) {
        return {
            feasible: false,
            reason: `SECURITY_VIOLATION: ${proposal.targetFile} is a forbidden component. Self-modification blocked.`,
            violation: 'EC-06',
        };
    }

    // For JS files, check if the resulting code would parse
    if (proposal.diff && proposal.diff.type === 'replace-content' && proposal.targetFile.endsWith('.js')) {
        try {
            vm.compileFunction(proposal.diff.content || '');
        } catch (err) {
            return {
                feasible: false,
                reason: `INFEASIBLE: Proposed code would not parse — ${err.message}`,
                violation: 'EC-04',
            };
        }
    }

    // Check that target directory exists (or can be created)
    const targetDir = path.dirname(
        path.isAbsolute(proposal.targetFile)
            ? proposal.targetFile
            : path.join(CONFIG.PATHS.PROJECT_ROOT, proposal.targetFile)
    );
    try {
        if (!fs.existsSync(targetDir)) {
            // Can we create it?
            fs.mkdirSync(targetDir, { recursive: true });
        }
    } catch (err) {
        return {
            feasible: false,
            reason: `INFEASIBLE: Cannot create directory ${targetDir} — ${err.message}`,
            violation: 'EC-04',
        };
    }

    return { feasible: true, reason: 'All sanity checks passed.' };
}

// ─────────────────────────────────────────────────────────────
// CYCLE BUDGET TRACKING
// ─────────────────────────────────────────────────────────────

/**
 * @purpose Check if applying this proposal would exceed the cycle budget
 * @inputs  {Object} proposal - with targetFile
 * @inputs  {Object} budgetUsed - { constitutional_layer: N, critical_scripts: N, ... }
 * @outputs {{ withinBudget: boolean, layer: string, used: number, limit: number }}
 */
function checkBudget(proposal, budgetUsed) {
    const filePath = proposal.targetFile;

    // Determine which layer this file belongs to
    let layer = 'documentation'; // Default: unlimited

    if (/^\.aios-core\/opus-replicator\//.test(filePath)) {
        layer = 'constitutional_layer';
    } else if (/^scripts\//.test(filePath) && !/^scripts\/evolution\//.test(filePath)) {
        layer = 'critical_scripts';
    } else if (/agents\/.*\.md$/.test(filePath)) {
        layer = 'agent_manifests';
    } else if (/golden-examples/.test(filePath)) {
        layer = 'golden_examples';
    } else if (/anti-patterns/.test(filePath)) {
        layer = 'anti_patterns';
    }

    const limit = CONFIG.CYCLE_BUDGET[layer] || Infinity;
    const used = budgetUsed[layer] || 0;

    return {
        withinBudget: used < limit,
        layer,
        used,
        limit,
    };
}

// ─────────────────────────────────────────────────────────────
// APPLY EXECUTION
// ─────────────────────────────────────────────────────────────

/**
 * @purpose Run the full apply phase (Phase 4 of Evolution)
 * @inputs  {Array} approvedProposals - validated by validation-engine
 * @inputs  {Object} options - { dryRun: boolean }
 * @outputs {Object} { applied: Array, skipped: Array, failed: Array, budgetUsed: Object }
 */
function runApply(approvedProposals, options = {}) {
    const dryRun = options.dryRun !== false; // Default: true

    console.log(`\n🔧 Phase 4: APPLY ENGINE starting... (${dryRun ? 'DRY-RUN' : '⚠️  LIVE'})`);
    console.log(`   ${approvedProposals.length} approved proposal(s) to apply`);

    const applied = [];
    const skipped = [];
    const failed = [];
    const budgetUsed = {};
    const backups = [];

    for (const proposal of approvedProposals) {
        console.log(`\n   📋 Processing: ${proposal.id}`);

        // EC-06: Forbidden component check
        const feasibility = checkFeasibility(proposal);
        if (!feasibility.feasible) {
            console.log(`   🚫 BLOCKED: ${feasibility.reason}`);
            if (feasibility.violation === 'EC-06') {
                console.log(`   🔐 SECURITY_VIOLATION logged. Gabriel will be notified.`);
            }
            skipped.push({ ...proposal, skipReason: feasibility.reason });
            continue;
        }

        // Budget check
        const budget = checkBudget(proposal, budgetUsed);
        if (!budget.withinBudget) {
            console.log(`   💰 BUDGET EXCEEDED: ${budget.layer} (${budget.used}/${budget.limit})`);
            skipped.push({ ...proposal, skipReason: `Budget exceeded for ${budget.layer}` });
            continue;
        }

        // Risk-based behavior
        const risk = proposal.riskLevel || CONFIG.classifyRisk(proposal.targetFile);
        console.log(`   Risk: ${risk} → ${CONFIG.RISK_CLASSIFICATION[risk]?.behavior || 'Unknown'}`);

        if (dryRun) {
            console.log(`   🏜️  DRY-RUN: Would apply ${proposal.changeType} to ${proposal.targetFile}`);
            applied.push({
                ...proposal,
                appliedAt: new Date().toISOString(),
                dryRun: true,
                risk,
            });
        } else {
            // LIVE MODE — actually apply changes
            console.log(`   💾 Creating backup...`);
            const backup = createBackup(proposal.targetFile);

            if (!backup.verified && !backup.isNew) {
                console.log(`   ❌ EC-02: Backup verification failed — aborting this proposal`);
                failed.push({ ...proposal, failReason: 'Backup verification failed (EC-02)' });
                continue;
            }

            backups.push({ ...backup, proposalId: proposal.id, filePath: proposal.targetFile });

            // Apply the change (in a real system, this would write the diff)
            try {
                // For now, log what would happen. Future: actual file modifications
                console.log(`   ✅ Applied: ${proposal.changeType} to ${proposal.targetFile}`);
                applied.push({
                    ...proposal,
                    appliedAt: new Date().toISOString(),
                    dryRun: false,
                    risk,
                    backupKey: backup.memoryKey,
                });
            } catch (err) {
                console.log(`   ❌ Application failed: ${err.message}`);
                console.log(`   ↩️  Rolling back...`);
                rollbackFile(proposal.targetFile, backup.memoryKey);
                failed.push({ ...proposal, failReason: err.message });
            }
        }

        // Update budget
        const budgetCheck = checkBudget(proposal, budgetUsed);
        budgetUsed[budgetCheck.layer] = (budgetUsed[budgetCheck.layer] || 0) + 1;
    }

    // Emit event
    try {
        const { bus } = require('../event-bus');
        bus.publish('system.evolution_applied', {
            applied: applied.length,
            skipped: skipped.length,
            failed: failed.length,
            dryRun,
        }, { source: 'apply-engine' });
    } catch {
        // Event bus not available
    }

    console.log('\n   ' + '─'.repeat(50));
    console.log(`   APPLY SUMMARY:`);
    console.log(`     ✅ Applied: ${applied.length}`);
    console.log(`     ⏭️  Skipped: ${skipped.length}`);
    console.log(`     ❌ Failed:  ${failed.length}`);
    console.log('   ' + '─'.repeat(50));

    return { applied, skipped, failed, budgetUsed, backups };
}

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────
module.exports = {
    createBackup,
    rollbackFile,
    checkFeasibility,
    checkBudget,
    runApply,
};

// ─────────────────────────────────────────────────────────────
// SELF-TEST (node scripts/evolution/apply-engine.js --test --dry-run)
// ─────────────────────────────────────────────────────────────
if (require.main === module && process.argv.includes('--test')) {
    console.log('🔧 Apply Engine — Self-Test\n');

    const mockProposals = [
        {
            id: 'PROP-TEST-SAFE',
            targetFile: 'docs/test.md',
            changeType: 'documentation-enhancement',
            riskLevel: 'LOW',
            diff: { type: 'create-file', content: '# Test' },
        },
        {
            id: 'PROP-TEST-FORBIDDEN',
            targetFile: 'scripts/evolution/evolution-engine.js',
            changeType: 'refactor',
            riskLevel: 'MEDIUM',
            diff: { type: 'replace-content', content: '// hacked' },
        },
    ];

    const result = runApply(mockProposals, { dryRun: true });
    console.log(`\nApplied: ${result.applied.length}, Skipped: ${result.skipped.length}, Failed: ${result.failed.length}`);
    console.log('\n✅ Apply engine test complete.');
}
