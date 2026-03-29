/**
 * @module audit-engine
 * @purpose Phase 1 of the Evolution Cycle — System Examination.
 *          Scans project files, runs structural checks, and feeds results
 *          to the IA Council for independent evaluation. Produces a ranked
 *          AUDIT_REPORT with gaps identified by the 8-member Council.
 * @inputs  Project root path, audit scope (full | targeted)
 * @outputs AUDIT_REPORT with ranked gaps from Council
 * @emits   meta.audit_complete (via event-bus)
 * @dependencies circuit-breaker.config.js, ia-council-engine.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const CONFIG = require('./circuit-breaker.config');
const Council = require('./ia-council-engine');

// ─────────────────────────────────────────────────────────────
// FILE SCANNER — builds system state for Council evaluation
// ─────────────────────────────────────────────────────────────

/**
 * @purpose Scan project files and build a system state snapshot
 * @inputs  {string} projectRoot - absolute path to project root
 * @inputs  {Object} options - { scope: 'full'|'targeted', focusPath: string }
 * @outputs {Object} systemState - { files, qualityBaseline, antiPatterns }
 */
function scanProject(projectRoot, options = {}) {
    const scope = options.scope || 'full';
    const focusPath = options.focusPath || '';
    const files = [];

    const dirsToScan = scope === 'targeted' && focusPath
        ? [focusPath]
        : ['scripts', 'squads', 'docs', '.aios-core', 'reasoning-packages', 'clients', 'distillation-dataset'];

    const ignoreDirs = ['node_modules', '.git', 'dist', 'build', '.next', '__pycache__', 'archive'];
    const scanExtensions = ['.js', '.md', '.json', '.yaml', '.yml'];

    function walkDir(dir) {
        const absDir = path.isAbsolute(dir) ? dir : path.join(projectRoot, dir);
        try {
            const entries = fs.readdirSync(absDir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(absDir, entry.name);
                if (entry.isDirectory()) {
                    if (!ignoreDirs.includes(entry.name)) {
                        walkDir(fullPath);
                    }
                } else if (entry.isFile()) {
                    const ext = path.extname(entry.name);
                    if (scanExtensions.includes(ext)) {
                        const relativePath = path.relative(projectRoot, fullPath).replace(/\\/g, '/');

                        // Read content for analysis (limit to 100KB to avoid memory issues)
                        let content = null;
                        try {
                            const stats = fs.statSync(fullPath);
                            if (stats.size < 100 * 1024) {
                                content = fs.readFileSync(fullPath, 'utf8');
                            }
                        } catch {
                            // Skip unreadable files
                        }

                        files.push({
                            path: relativePath,
                            content,
                            size: content ? Buffer.byteLength(content, 'utf8') : 0,
                        });
                    }
                }
            }
        } catch {
            // Directory doesn't exist — that's fine, it will be flagged by Council
        }
    }

    for (const dir of dirsToScan) {
        walkDir(dir);
    }

    // Also scan root-level files (README.md, OPUS_ENGINEERING_BIBLE*.md, etc.)
    try {
        const rootEntries = fs.readdirSync(projectRoot, { withFileTypes: true });
        for (const entry of rootEntries) {
            if (entry.isFile() && scanExtensions.includes(path.extname(entry.name))) {
                const fullPath = path.join(projectRoot, entry.name);
                let content = null;
                try {
                    const stats = fs.statSync(fullPath);
                    if (stats.size < 100 * 1024) {
                        content = fs.readFileSync(fullPath, 'utf8');
                    }
                } catch {
                    // Skip
                }
                files.push({
                    path: entry.name,
                    content,
                    size: content ? Buffer.byteLength(content, 'utf8') : 0,
                });
            }
        }
    } catch {
        // Root unreadable
    }

    // Load quality baseline
    let qualityBaseline = {};
    try {
        qualityBaseline = JSON.parse(fs.readFileSync(CONFIG.PATHS.QUALITY_BASELINE, 'utf8'));
    } catch {
        qualityBaseline = { current_baseline: 0, trend: 'establishing' };
    }

    // Load anti-patterns
    let antiPatterns = [];
    try {
        const apContent = fs.readFileSync(CONFIG.PATHS.ANTI_PATTERNS, 'utf8');
        const apMatches = apContent.match(/AP-\d+/g) || [];
        antiPatterns = [...new Set(apMatches)];
    } catch {
        antiPatterns = [];
    }

    return {
        files,
        qualityBaseline,
        antiPatterns,
        projectRoot,
        scanTimestamp: new Date().toISOString(),
        scope,
        totalFiles: files.length,
    };
}

// ─────────────────────────────────────────────────────────────
// AUDIT EXECUTION
// ─────────────────────────────────────────────────────────────

/**
 * @purpose Run a complete audit cycle (Phase 1 of Evolution)
 * @inputs  {Object} options - { projectRoot, scope, focusPath, dryRun }
 * @outputs {Object} auditReport - { timestamp, systemState, councilResult, topGaps, recommendations }
 */
function runAudit(options = {}) {
    const projectRoot = options.projectRoot || CONFIG.PATHS.PROJECT_ROOT;
    const dryRun = options.dryRun !== false; // Default: true
    const scope = options.scope || 'full';

    console.log('📋 Phase 1: AUDIT ENGINE starting...');
    console.log(`   Scope: ${scope} | Dry-run: ${dryRun}`);

    // Step 1: Scan project
    console.log('   🔍 Scanning project files...');
    const systemState = scanProject(projectRoot, { scope, focusPath: options.focusPath });
    console.log(`   📁 Found ${systemState.totalFiles} files to analyze`);

    // Step 2: Run IA Council evaluation
    console.log('   🧠 Convening IA Council (8 members + Metamind)...');
    const councilResult = Council.runCouncil(systemState);

    // Step 3: Build audit report
    const auditReport = {
        id: `AUDIT-${new Date().toISOString().replace(/[:.]/g, '-')}`,
        timestamp: new Date().toISOString(),
        scope,
        dryRun,
        systemState: {
            totalFiles: systemState.totalFiles,
            scanTimestamp: systemState.scanTimestamp,
            qualityBaseline: systemState.qualityBaseline,
            antiPatternCount: systemState.antiPatterns.length,
        },
        council: {
            overallScore: councilResult.overallScore,
            memberScores: councilResult.memberScores,
            totalGaps: councilResult.totalGaps,
            convergences: councilResult.convergences,
        },
        topGaps: councilResult.topGaps,
        allGaps: councilResult.allGaps,
        recommendations: generateRecommendations(councilResult),
    };

    // Step 4: Save report
    if (!dryRun) {
        saveAuditReport(auditReport);
    }

    // Step 5: Emit event
    try {
        const { bus } = require('../event-bus');
        bus.publish('meta.audit_complete', {
            auditId: auditReport.id,
            overallScore: councilResult.overallScore,
            topGapsCount: councilResult.topGaps.length,
            totalGaps: councilResult.totalGaps,
        }, { source: 'audit-engine' });
    } catch {
        // Event bus not available — non-critical
    }

    // Step 6: Print summary
    printAuditSummary(auditReport);

    return auditReport;
}

/**
 * @purpose Generate actionable recommendations from Council results
 * @inputs  {Object} councilResult
 * @outputs {Array} recommendations
 */
function generateRecommendations(councilResult) {
    const recommendations = [];

    if (councilResult.overallScore < 6) {
        recommendations.push({
            priority: 'CRITICAL',
            message: `Overall system health ${councilResult.overallScore}/10 — below acceptable threshold (6.0). Immediate attention required.`,
        });
    }

    if (councilResult.convergences.length > 0) {
        recommendations.push({
            priority: 'HIGH',
            message: `${councilResult.convergences.length} convergence(s) detected — multiple Council members agree on the same issues. These should be addressed first.`,
            details: councilResult.convergences.map(c => `${c.key}: ${c.description} (reporters: ${c.reporters.join(', ')})`),
        });
    }

    const criticalGaps = councilResult.allGaps.filter(g => g.severity >= 8);
    if (criticalGaps.length > 0) {
        recommendations.push({
            priority: 'HIGH',
            message: `${criticalGaps.length} critical gap(s) with severity ≥ 8 found.`,
            details: criticalGaps.map(g => `[SEV ${g.severity}] ${g.id}: ${g.description}`),
        });
    }

    return recommendations;
}

/**
 * @purpose Save audit report to disk
 * @inputs  {Object} report
 * @outputs {string} path where saved
 */
function saveAuditReport(report) {
    const reportsDir = CONFIG.PATHS.REPORTS_DIR;
    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
    }

    const filename = `${report.id}.json`;
    const filepath = path.join(reportsDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`   💾 Report saved: ${filepath}`);
    return filepath;
}

/**
 * @purpose Print a formatted audit summary to console
 * @inputs  {Object} report
 * @outputs {void}
 */
function printAuditSummary(report) {
    console.log('\n' + '═'.repeat(60));
    console.log('  📋 AUDIT REPORT — IA Council Evaluation');
    console.log('═'.repeat(60));
    console.log(`  ID:       ${report.id}`);
    console.log(`  Score:    ${report.council.overallScore}/10`);
    console.log(`  Gaps:     ${report.council.totalGaps} total`);
    console.log(`  Scope:    ${report.scope}`);
    console.log(`  Dry-run:  ${report.dryRun}`);
    console.log('');
    console.log('  MEMBER SCORES:');
    for (const m of report.council.memberScores) {
        const bar = '█'.repeat(Math.round(m.score));
        console.log(`    ${m.memberId.padEnd(14)} ${m.score.toFixed(1)}/10 ${bar} (${m.gapCount} gaps)`);
    }
    console.log('');
    console.log('  TOP 3 GAPS (for proposal phase):');
    for (let i = 0; i < report.topGaps.length; i++) {
        const g = report.topGaps[i];
        console.log(`    ${i + 1}. [SEV ${g.severity}] ${g.id}`);
        console.log(`       ${g.description}`);
        console.log(`       Evidence: ${g.evidence}`);
        console.log(`       Impact 30d: ${g.impact30d}`);
    }

    if (report.recommendations.length > 0) {
        console.log('');
        console.log('  RECOMMENDATIONS:');
        for (const r of report.recommendations) {
            console.log(`    [${r.priority}] ${r.message}`);
        }
    }

    console.log('═'.repeat(60) + '\n');
}

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────
module.exports = {
    scanProject,
    runAudit,
    generateRecommendations,
    saveAuditReport,
    printAuditSummary,
};

// ─────────────────────────────────────────────────────────────
// SELF-TEST (node scripts/evolution/audit-engine.js --dry-run)
// ─────────────────────────────────────────────────────────────
if (require.main === module) {
    const isDryRun = !process.argv.includes('--live');
    const scope = process.argv.includes('--scope')
        ? process.argv[process.argv.indexOf('--scope') + 1]
        : 'full';

    runAudit({ dryRun: isDryRun, scope });
}
