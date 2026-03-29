/**
 * @module proposal-engine
 * @purpose Phase 2 of the Evolution Cycle — Solution Generation.
 *          Takes the top 3 gaps from the AUDIT_REPORT and has Council members
 *          propose concrete diffs (not ideas). Metamind identifies convergent
 *          proposals and merges them.
 * @inputs  Top 3 gaps from audit-engine
 * @outputs Array of proposals with exact diffs, risk classification, and expected improvement
 * @emits   meta.evolution_proposal (via event-bus)
 * @dependencies circuit-breaker.config.js, ia-council-engine.js
 */

'use strict';

const path = require('path');
const CONFIG = require('./circuit-breaker.config');

// ─────────────────────────────────────────────────────────────
// PROPOSAL GENERATION STRATEGIES (per domain)
// ─────────────────────────────────────────────────────────────

/**
 * @purpose Generate proposals for a gap based on Council domain expertise
 * @inputs  {Object} gap - { id, description, severity, evidence, impact30d, reportedBy }
 * @inputs  {Object} systemState - current system state
 * @outputs {Array} proposals - Array of { id, description, targetFile, changeType, diff, riskLevel, rationale, expectedImprovement }
 */
function generateProposalsForGap(gap, systemState) {
    const proposals = [];

    // Strategy selection based on gap ID prefix
    const prefix = gap.id.split('-')[0];

    switch (prefix) {
        case 'KAR': // Code quality gaps
            proposals.push(...generateCodeQualityProposal(gap, systemState));
            break;
        case 'ILS': // Cognitive architecture gaps
            proposals.push(...generateCognitiveProposal(gap, systemState));
            break;
        case 'NG': // Workflow efficiency gaps
            proposals.push(...generateEfficiencyProposal(gap, systemState));
            break;
        case 'HIN': // Knowledge distillation gaps
            proposals.push(...generateDistillationProposal(gap));
            break;
        case 'HAS': // Learning loop gaps
            proposals.push(...generateLearningLoopProposal(gap));
            break;
        case 'PED': // Vision alignment / domain contamination gaps
            proposals.push(...generateVisionProposal(gap, systemState));
            break;
        case 'ALN': // Product applicability gaps
            proposals.push(...generateProductProposal(gap));
            break;
        case 'DST': // Distillation dataset gaps (Chair 8)
            proposals.push(...generateDistillationDatasetProposal(gap));
            break;
        default:
            proposals.push(createGenericProposal(gap));
            break;
    }

    return proposals;
}

/**
 * @purpose Generate code quality improvement proposals (Karpathy domain)
 */
function generateCodeQualityProposal(gap, systemState) {
    const proposals = [];
    const fileMatch = gap.id.match(/KAR-\w+-(.+)$/);
    const targetFilename = fileMatch ? fileMatch[1] : null;

    if (gap.id.includes('JSDOC') && targetFilename) {
        proposals.push({
            id: `PROP-${gap.id}`,
            gapId: gap.id,
            description: `Add comprehensive JSDoc with @purpose, @inputs, @outputs to ${targetFilename}`,
            targetFile: findFileByBasename(targetFilename, systemState),
            changeType: 'documentation-enhancement',
            diff: {
                type: 'add-jsdoc',
                content: `Add /** @purpose ... @inputs ... @outputs */ block to all exported functions`,
            },
            riskLevel: CONFIG.classifyRisk(`scripts/${targetFilename}`),
            rationale: 'Engineering rigor requires self-documenting code. @purpose enables agent understanding.',
            expectedImprovement: { dimension: 'code_quality', delta: 5 },
            includesTests: false,
        });
    }

    if (gap.id.includes('ERRH') && targetFilename) {
        proposals.push({
            id: `PROP-${gap.id}`,
            gapId: gap.id,
            description: `Add try-catch error handling around external calls in ${targetFilename}`,
            targetFile: findFileByBasename(targetFilename, systemState),
            changeType: 'error-handling',
            diff: {
                type: 'wrap-try-catch',
                content: 'Wrap require() and fetch() calls in try-catch blocks with meaningful error messages',
            },
            riskLevel: CONFIG.classifyRisk(`scripts/${targetFilename}`),
            rationale: 'Silent failures violate AP-002. All external calls must have graceful degradation.',
            expectedImprovement: { dimension: 'reliability', delta: 8 },
            includesTests: false,
        });
    }

    if (gap.id.includes('EBUS') && targetFilename) {
        proposals.push({
            id: `PROP-${gap.id}`,
            gapId: gap.id,
            description: `Integrate event-bus emission for observability in ${targetFilename}`,
            targetFile: findFileByBasename(targetFilename, systemState),
            changeType: 'observability',
            diff: {
                type: 'add-event-emission',
                content: 'Add event-bus import and publish calls for key operations',
            },
            riskLevel: CONFIG.classifyRisk(`scripts/${targetFilename}`),
            rationale: 'All scripts should emit events for cross-squad communication and monitoring.',
            expectedImprovement: { dimension: 'observability', delta: 10 },
            includesTests: false,
        });
    }

    return proposals;
}

/**
 * @purpose Generate cognitive architecture proposals (Sutskever domain)
 */
function generateCognitiveProposal(gap, systemState) {
    const proposals = [];

    if (gap.id.includes('PM-MISSING')) {
        proposals.push({
            id: `PROP-${gap.id}`,
            gapId: gap.id,
            description: 'Create missing PM templates to complete the reasoning pipeline',
            targetFile: '.aios-core/opus-replicator/',
            changeType: 'template-creation',
            diff: { type: 'create-file', content: 'Create PM template following existing PM format' },
            riskLevel: 'HIGH',
            rationale: 'Incomplete PM pipeline degrades all reasoning outputs.',
            expectedImprovement: { dimension: 'reasoning_quality', delta: 15 },
            includesTests: false,
        });
    }

    if (gap.id.includes('GOLD-EMPTY')) {
        proposals.push({
            id: `PROP-${gap.id}`,
            gapId: gap.id,
            description: 'Bootstrap golden examples from existing high-quality RPs',
            targetFile: '.aios-core/memory/golden-examples/',
            changeType: 'example-creation',
            diff: { type: 'create-file', content: 'Extract and format golden examples from reasoning packages' },
            riskLevel: 'LOW',
            rationale: 'Quality anchoring requires at least 2 golden examples per PM mode.',
            expectedImprovement: { dimension: 'quality_anchoring', delta: 20 },
            includesTests: false,
        });
    }

    return proposals;
}

/**
 * @purpose Generate workflow efficiency proposals (Ng domain)
 */
function generateEfficiencyProposal(gap, systemState) {
    const proposals = [];

    if (gap.id.includes('DUP')) {
        const funcName = gap.id.replace('NG-DUP-', '');
        proposals.push({
            id: `PROP-${gap.id}`,
            gapId: gap.id,
            description: `Extract duplicated function "${funcName}" into a shared utility module`,
            targetFile: 'scripts/utils/',
            changeType: 'refactor-deduplication',
            diff: { type: 'extract-function', content: `Move "${funcName}" to shared utility and update imports` },
            riskLevel: 'MEDIUM',
            rationale: 'Duplicated logic increases maintenance burden and risk of divergent behavior.',
            expectedImprovement: { dimension: 'maintainability', delta: 5 },
            includesTests: false,
        });
    }

    if (gap.id.includes('MONO')) {
        const filename = gap.id.replace('NG-MONO-', '');
        proposals.push({
            id: `PROP-${gap.id}`,
            gapId: gap.id,
            description: `Split monolithic file ${filename} into focused modules`,
            targetFile: findFileByBasename(filename, systemState),
            changeType: 'refactor-split',
            diff: { type: 'split-module', content: 'Break into logical sub-modules with clear interfaces' },
            riskLevel: 'MEDIUM',
            rationale: 'Files >500 lines are difficult to understand, test, and evolve.',
            expectedImprovement: { dimension: 'modularity', delta: 10 },
            includesTests: false,
        });
    }

    return proposals;
}

/**
 * @purpose Generate knowledge distillation proposals (Hinton domain)
 */
function generateDistillationProposal(gap) {
    const proposals = [];

    if (gap.id.includes('CONTEXT-STALE')) {
        proposals.push({
            id: `PROP-${gap.id}`,
            gapId: gap.id,
            description: 'Update SELF_CONTEXT.md with current system state',
            targetFile: '.aios-core/opus-replicator/SELF_CONTEXT.md',
            changeType: 'context-refresh',
            diff: { type: 'update-content', content: 'Refresh all statistics, era, phase, and capability descriptions' },
            riskLevel: 'HIGH', // It's in opus-replicator
            rationale: 'Stale context causes new sessions to make decisions on outdated information.',
            expectedImprovement: { dimension: 'context_accuracy', delta: 30 },
            includesTests: false,
        });
    }

    return proposals;
}

/**
 * @purpose Generate learning loop proposals (Hassabis domain)
 */
function generateLearningLoopProposal(gap) {
    const proposals = [];

    if (gap.id.includes('BASELINE-ZERO')) {
        proposals.push({
            id: `PROP-${gap.id}`,
            gapId: gap.id,
            description: 'Initialize quality baseline with first session score',
            targetFile: '.aios-core/memory/quality-baseline.json',
            changeType: 'baseline-init',
            diff: { type: 'update-json', content: 'Set initial baseline from first measured session quality' },
            riskLevel: 'LOW',
            rationale: 'Without a baseline, trend tracking is impossible. Bootstrap from current state.',
            expectedImprovement: { dimension: 'quality_tracking', delta: 50 },
            includesTests: false,
        });
    }

    return proposals;
}

/**
 * @purpose Generate vision alignment proposals (Pedro domain)
 */
function generateVisionProposal(gap, systemState) {
    const proposals = [];

    if (gap.id.includes('DOMAIN')) {
        const parts = gap.id.split('-');
        const targetFile = parts.length >= 3 ? parts[2] : 'unknown';
        proposals.push({
            id: `PROP-${gap.id}`,
            gapId: gap.id,
            description: `Remove domain contamination from ${targetFile} (AP-001)`,
            targetFile: findFileByBasename(targetFile, systemState),
            changeType: 'domain-cleanup',
            diff: { type: 'remove-domain-terms', content: 'Replace domain-specific terms with generic equivalents' },
            riskLevel: CONFIG.classifyRisk(`scripts/${targetFile}`),
            rationale: 'AP-001: Engine files must be domain-agnostic. Client-specific terms belong in clients/.',
            expectedImprovement: { dimension: 'domain_purity', delta: 15 },
            includesTests: false,
        });
    }

    return proposals;
}

/**
 * @purpose Generate product applicability proposals (Alan domain)
 */
function generateProductProposal(gap) {
    const proposals = [];

    if (gap.id.includes('README')) {
        proposals.push({
            id: `PROP-${gap.id}`,
            gapId: gap.id,
            description: 'Enhance README.md for comprehensive onboarding (60-second test)',
            targetFile: 'README.md',
            changeType: 'documentation-enhancement',
            diff: { type: 'enhance-readme', content: 'Add architecture diagram, quick start, directory structure, and agent catalog' },
            riskLevel: 'LOW',
            rationale: 'A new agent should understand AIOS within 60 seconds of reading README.',
            expectedImprovement: { dimension: 'onboarding', delta: 25 },
            includesTests: false,
        });
    }

    return proposals;
}

/**
 * @purpose Generate distillation dataset proposals (Chair 8 domain)
 */
function generateDistillationDatasetProposal(gap) {
    const proposals = [];

    if (gap.id.includes('TRACES-MISSING')) {
        proposals.push({
            id: `PROP-${gap.id}`,
            gapId: gap.id,
            description: 'Create distillation traces directory structure for fine-tuning data capture',
            targetFile: '.aios-core/memory/distillation-dataset/traces/',
            changeType: 'directory-creation',
            diff: { type: 'create-directory', content: 'Create traces/ directory with README explaining trace format' },
            riskLevel: 'LOW',
            rationale: 'Every evolution cycle produces reasoning traces that should be captured for future 3B-7B model training.',
            expectedImprovement: { dimension: 'model_independence', delta: 10 },
            includesTests: false,
        });
    }

    if (gap.id.includes('ROADMAP-MISSING')) {
        proposals.push({
            id: `PROP-${gap.id}`,
            gapId: gap.id,
            description: 'Initialize independence roadmap for local model training progress',
            targetFile: '.aios-core/memory/distillation-dataset/roadmap.json',
            changeType: 'file-creation',
            diff: { type: 'create-file', content: 'Create roadmap.json with initial structure tracking traces, curated examples, and model readiness' },
            riskLevel: 'LOW',
            rationale: 'Roadmap tracks progress toward model independence — essential for Chair 8 reports.',
            expectedImprovement: { dimension: 'model_independence', delta: 5 },
            includesTests: false,
        });
    }

    return proposals;
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function findFileByBasename(basename, systemState) {
    if (!systemState || !systemState.files) return basename;
    const match = systemState.files.find(f => path.basename(f.path) === basename);
    return match ? match.path : basename;
}

function createGenericProposal(gap) {
    return {
        id: `PROP-${gap.id}`,
        gapId: gap.id,
        description: `Address gap: ${gap.description}`,
        targetFile: 'unknown',
        changeType: 'generic',
        diff: { type: 'manual-review', content: `Requires manual analysis: ${gap.evidence}` },
        riskLevel: 'MEDIUM',
        rationale: gap.impact30d,
        expectedImprovement: { dimension: 'general', delta: 5 },
        includesTests: false,
    };
}

// ─────────────────────────────────────────────────────────────
// PROPOSAL RUNNER
// ─────────────────────────────────────────────────────────────

/**
 * @purpose Run the full proposal phase (Phase 2 of Evolution)
 * @inputs  {Object} auditReport - from audit-engine
 * @inputs  {Object} systemState - current system state
 * @outputs {Object} { proposals: Array, summary: Object }
 */
function runProposals(auditReport, systemState) {
    console.log('\n💡 Phase 2: PROPOSAL ENGINE starting...');
    console.log(`   Processing top ${auditReport.topGaps.length} gaps from audit`);

    const allProposals = [];

    for (const gap of auditReport.topGaps) {
        console.log(`   🔧 Generating proposals for: ${gap.id} (severity: ${gap.severity})`);
        const proposals = generateProposalsForGap(gap, systemState);
        allProposals.push(...proposals);
        console.log(`      → ${proposals.length} proposal(s) generated`);
    }

    // Check for forbidden component targets
    const filteredProposals = allProposals.filter(p => {
        if (CONFIG.isForbidden(p.targetFile)) {
            console.log(`   🚫 BLOCKED: Proposal ${p.id} targets forbidden component ${p.targetFile}`);
            return false;
        }
        return true;
    });

    // Emit event
    try {
        const { bus } = require('../event-bus');
        bus.publish('meta.evolution_proposal', {
            totalProposals: filteredProposals.length,
            gapsAddressed: auditReport.topGaps.length,
            riskBreakdown: {
                LOW: filteredProposals.filter(p => p.riskLevel === 'LOW').length,
                MEDIUM: filteredProposals.filter(p => p.riskLevel === 'MEDIUM').length,
                HIGH: filteredProposals.filter(p => p.riskLevel === 'HIGH').length,
            },
        }, { source: 'proposal-engine' });
    } catch {
        // Event bus not available
    }

    const summary = {
        totalProposals: filteredProposals.length,
        blocked: allProposals.length - filteredProposals.length,
        byRisk: {
            LOW: filteredProposals.filter(p => p.riskLevel === 'LOW').length,
            MEDIUM: filteredProposals.filter(p => p.riskLevel === 'MEDIUM').length,
            HIGH: filteredProposals.filter(p => p.riskLevel === 'HIGH').length,
        },
    };

    console.log(`   ✅ ${filteredProposals.length} proposals ready for validation`);
    if (summary.blocked > 0) {
        console.log(`   🚫 ${summary.blocked} proposal(s) blocked (forbidden components)`);
    }

    return { proposals: filteredProposals, summary };
}

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────
module.exports = {
    generateProposalsForGap,
    runProposals,
    findFileByBasename,
};

// ─────────────────────────────────────────────────────────────
// SELF-TEST (node scripts/evolution/proposal-engine.js --test)
// ─────────────────────────────────────────────────────────────
if (require.main === module && process.argv.includes('--test')) {
    console.log('💡 Proposal Engine — Self-Test\n');

    const mockAuditReport = {
        topGaps: [
            { id: 'HAS-BASELINE-ZERO', description: 'Quality baseline not established', severity: 7, evidence: 'current_baseline: 0', impact30d: 'No quality tracking', reportedBy: 'hassabis' },
            { id: 'KAR-JSDOC-test.js', description: 'Missing JSDoc', severity: 4, evidence: 'No @purpose', impact30d: 'Poor docs', reportedBy: 'karpathy' },
            { id: 'DST-TRACES-MISSING', description: 'No traces dir', severity: 7, evidence: 'traces/ missing', impact30d: 'No distillation', reportedBy: 'distillation' },
        ],
    };

    const mockState = { files: [{ path: 'scripts/test.js', content: '// test' }] };
    const result = runProposals(mockAuditReport, mockState);

    console.log(`\nGenerated ${result.proposals.length} proposals:`);
    result.proposals.forEach(p => console.log(`  - ${p.id}: ${p.description} [${p.riskLevel}]`));
    console.log('\n✅ Proposal engine test complete.');
}
