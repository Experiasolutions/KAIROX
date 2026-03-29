/**
 * @module validation-engine
 * @purpose Phase 3 of the Evolution Cycle — Council Voting & Convergence.
 *          Each Council member votes on proposals (APPLY/REJECT/DEFER).
 *          Tiebreaker: Pedro + Alan (Creators). Convergence guard enforced.
 * @inputs  Proposals from proposal-engine
 * @outputs Validated set of APPROVED proposals + convergence status
 * @emits   None
 * @dependencies circuit-breaker.config.js, ia-council-engine.js, convergence-guard.js
 */

'use strict';

const CONFIG = require('./circuit-breaker.config');
const Council = require('./ia-council-engine');
const ConvergenceGuard = require('./convergence-guard');

// ─────────────────────────────────────────────────────────────
// VALIDATION EXECUTION
// ─────────────────────────────────────────────────────────────

/**
 * @purpose Run the full validation phase (Phase 3 of Evolution)
 * @inputs  {Array} proposals - from proposal-engine
 * @inputs  {Object} systemState - current system state
 * @inputs  {Object} previousScores - from last cycle (for convergence)
 * @outputs {Object} { approved: Array, rejected: Array, deferred: Array, convergenceResult: Object }
 */
function runValidation(proposals, systemState, previousScores = {}) {
    console.log('\n🗳️  Phase 3: VALIDATION ENGINE starting...');
    console.log(`   ${proposals.length} proposal(s) to evaluate`);

    // Step 1: Check convergence guard — should we even continue?
    console.log('   🔄 Checking convergence guard...');
    const convergenceResult = ConvergenceGuard.checkConvergence({
        proposals: proposals.map(p => ({ file: p.targetFile, changeType: p.changeType })),
        currentScores: systemState.qualityBaseline || {},
        previousScores,
    });

    if (!convergenceResult.canProceed) {
        console.log(`   ⛔ Convergence guard blocked: ${convergenceResult.reason}`);
        return {
            approved: [],
            rejected: [],
            deferred: proposals.map(p => ({
                ...p,
                validationResult: 'CONVERGENCE_BLOCKED',
                reason: convergenceResult.reason,
            })),
            convergenceResult,
            blocked: true,
        };
    }
    console.log(`   ✅ Convergence guard passed: ${convergenceResult.reason}`);

    // Step 2: Council votes on each proposal
    console.log('   🗳️  Council voting in progress...');
    const votingResults = Council.runCouncilVoting(proposals, systemState);

    // Step 3: Classify results
    const approved = [];
    const rejected = [];
    const deferred = [];

    for (let i = 0; i < proposals.length; i++) {
        const proposal = proposals[i];
        const voting = votingResults[i];

        // Print detailed vote breakdown
        console.log(`\n   📋 Proposal: ${proposal.id}`);
        console.log(`      Description: ${proposal.description}`);
        console.log(`      Risk: ${proposal.riskLevel}`);
        console.log(`      Votes:`);

        for (const vote of voting.votes) {
            const emoji = vote.vote === 'APPLY' ? '✅' : vote.vote === 'REJECT' ? '❌' : '⏸️';
            console.log(`        ${emoji} ${vote.memberId.padEnd(14)} → ${vote.vote}: ${vote.justification}`);
        }

        console.log(`      Approval: ${(voting.approvalRate * 100).toFixed(0)}% (threshold: ${CONFIG.CONVERGENCE.COUNCIL_APPROVAL_THRESHOLD * 100}%)`);
        console.log(`      Result: ${voting.approved ? '✅ APPROVED' : '❌ NOT APPROVED'}`);

        const validatedProposal = {
            ...proposal,
            votingResult: voting,
            validationTimestamp: new Date().toISOString(),
        };

        if (voting.approved) {
            approved.push(validatedProposal);
        } else {
            // Distinguish between REJECT and DEFER
            const rejectVotes = voting.votes.filter(v => v.vote === 'REJECT').length;
            const deferVotes = voting.votes.filter(v => v.vote === 'DEFER').length;

            if (rejectVotes > deferVotes) {
                rejected.push(validatedProposal);
            } else {
                deferred.push(validatedProposal);
            }
        }
    }

    // Step 4: Summary
    console.log('\n   ' + '─'.repeat(50));
    console.log(`   VALIDATION SUMMARY:`);
    console.log(`     ✅ Approved: ${approved.length}`);
    console.log(`     ❌ Rejected: ${rejected.length}`);
    console.log(`     ⏸️  Deferred: ${deferred.length}`);
    console.log('   ' + '─'.repeat(50));

    return {
        approved,
        rejected,
        deferred,
        convergenceResult,
        blocked: false,
    };
}

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────
module.exports = {
    runValidation,
};

// ─────────────────────────────────────────────────────────────
// SELF-TEST (node scripts/evolution/validation-engine.js --test)
// ─────────────────────────────────────────────────────────────
if (require.main === module && process.argv.includes('--test')) {
    console.log('🗳️  Validation Engine — Self-Test\n');

    const mockProposals = [
        {
            id: 'PROP-HAS-BASELINE-ZERO',
            description: 'Initialize quality baseline',
            targetFile: '.aios-core/memory/quality-baseline.json',
            changeType: 'baseline-init',
            riskLevel: 'LOW',
            includesTests: false,
        },
        {
            id: 'PROP-KAR-JSDOC-test',
            description: 'Add JSDoc to test.js',
            targetFile: 'scripts/test.js',
            changeType: 'documentation-enhancement',
            riskLevel: 'MEDIUM',
            includesTests: false,
        },
    ];

    const mockState = {
        files: [],
        qualityBaseline: { current_baseline: 0, trend: 'establishing' },
    };

    const result = runValidation(mockProposals, mockState);
    console.log(`\nApproved: ${result.approved.length}, Rejected: ${result.rejected.length}, Deferred: ${result.deferred.length}`);
    console.log('\n✅ Validation engine test complete.');
}
