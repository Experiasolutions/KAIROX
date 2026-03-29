#!/usr/bin/env node

/**
 * @module self-correction
 * @version 1.0.0
 * @purpose PM3 Quality Gate loop — evaluates output against quality criteria,
 *          scores it, and triggers re-execution if below threshold.
 * @inputs  Output string/file, optional Reasoning Package reference
 * @outputs { score, verdict, dimensions, remediation[], signal }
 * @emits   quality:scored, quality:passed, quality:failed
 * @dependencies event-bus.js, quality-baseline.json, anti-patterns.md
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ── Paths ────────────────────────────────────────────────────

const AIOS_ROOT = path.join(__dirname, '..');
const MEMORY_PATH = path.join(AIOS_ROOT, '.aios-core', 'memory');
const BASELINE_PATH = path.join(MEMORY_PATH, 'quality-baseline.json');
const ANTI_PATTERNS_PATH = path.join(MEMORY_PATH, 'anti-patterns.md');
const GOLDEN_PATH = path.join(MEMORY_PATH, 'golden-examples');

// ── Score Thresholds ─────────────────────────────────────────
// WHY: These thresholds match the Bible v1 spec exactly.
// Changing these requires HUMAN REVIEW (Yudkowsky Alignment Gate).

const THRESHOLDS = {
    EXCELLENT: 8.5,  // → harvest as golden example
    PASS: 7.5,       // → deliver
    CONDITIONAL: 6.5, // → fix then deliver
    // Below 6.5 = FAIL → return for re-analysis
};

// ── Penalty Schedule ─────────────────────────────────────────
// WHY: Consistent scoring requires explicit penalty values.

const PENALTIES = {
    PLACEHOLDER_OR_TODO: -3.0,
    EDGE_CASE_UNHANDLED: -2.0,
    HALLUCINATED_API: -2.0,
    MISSING_EVENT_EMISSION: -1.5,
    RELATIVE_IMPORT: -1.5,
    WHAT_NOT_WHY_COMMENT: -1.0,
    MULTI_RESPONSIBILITY_FN: -1.0,
    MISSING_JSDOC: -0.5,
};

// ── 7 Scoring Dimensions ─────────────────────────────────────

const DIMENSIONS = [
    { id: 'completeness', name: 'Completeness', weight: 1.0, description: 'Addresses everything in the spec' },
    { id: 'depth', name: 'Depth', weight: 1.2, description: 'Handles edge cases, not just happy path' },
    { id: 'structure', name: 'Structure', weight: 1.0, description: 'Modular, readable, maintainable' },
    { id: 'evidence', name: 'Evidence', weight: 0.8, description: 'Decisions justified, not arbitrary' },
    { id: 'aios_compliance', name: 'AIOS Compliance', weight: 1.0, description: 'Follows Constitution v1.0' },
    { id: 'production_ready', name: 'Production Readiness', weight: 1.2, description: 'Can go live today' },
    { id: 'evolution', name: 'Evolution', weight: 0.8, description: 'Easy to modify/extend' },
];

// ── Automated Checks ─────────────────────────────────────────
// WHY: These checks can be run mechanically on any output.
// They don't replace human judgment but catch obvious issues.

function runAutomatedChecks(content) {
    const findings = [];
    const lines = content.split('\n');

    // Check for placeholders/TODOs
    const todoPattern = /\b(TODO|FIXME|HACK|XXX|PLACEHOLDER|implement later|coming soon)\b/i;
    lines.forEach((line, i) => {
        if (todoPattern.test(line)) {
            findings.push({
                dimension: 'production_ready',
                severity: PENALTIES.PLACEHOLDER_OR_TODO,
                line: i + 1,
                violation: `Placeholder/TODO found: "${line.trim().substring(0, 80)}"`,
            });
        }
    });

    // Check for relative imports in JS files
    const relativeImportPattern = /require\s*\(\s*['"]\.(?!\.\/).*['"]\s*\)/;
    lines.forEach((line, i) => {
        if (relativeImportPattern.test(line) && !line.includes('__dirname')) {
            findings.push({
                dimension: 'aios_compliance',
                severity: PENALTIES.RELATIVE_IMPORT,
                line: i + 1,
                violation: `Relative import without __dirname: "${line.trim().substring(0, 80)}"`,
            });
        }
    });

    // Check for WHAT comments (vs WHY)
    const whatCommentPattern = /\/\/\s*(set|get|update|delete|create|return|call|assign|increment|decrement)\s/i;
    lines.forEach((line, i) => {
        if (whatCommentPattern.test(line) && !line.includes('WHY') && !line.includes('because')) {
            findings.push({
                dimension: 'evidence',
                severity: PENALTIES.WHAT_NOT_WHY_COMMENT,
                line: i + 1,
                violation: `Comment explains WHAT not WHY: "${line.trim().substring(0, 80)}"`,
            });
        }
    });

    // Check for functions with "and" in name
    const andFunctionPattern = /function\s+\w+And\w+/;
    lines.forEach((line, i) => {
        if (andFunctionPattern.test(line)) {
            findings.push({
                dimension: 'structure',
                severity: PENALTIES.MULTI_RESPONSIBILITY_FN,
                line: i + 1,
                violation: `Multi-responsibility function (contains "And"): "${line.trim().substring(0, 80)}"`,
            });
        }
    });

    // Check for missing @purpose in module header
    if (!content.includes('@purpose') && !content.includes('@module')) {
        findings.push({
            dimension: 'structure',
            severity: PENALTIES.MISSING_JSDOC,
            line: 1,
            violation: 'Missing @purpose or @module jsdoc in file header',
        });
    }

    // Domain contamination check (AP-001)
    // WHY: Domain words loaded from config so engine stays domain-agnostic
    let domainWordsList = [];
    try {
        const dwPath = path.join(__dirname, 'evolution', 'domain-words.config.json');
        domainWordsList = JSON.parse(fs.readFileSync(dwPath, 'utf8')).words || [];
    } catch {
        domainWordsList = [];
    }
    const domainWords = domainWordsList.length > 0
        ? new RegExp(`\\b(${domainWordsList.join('|')})\\b`, 'i')
        : null;
    const isEngineFile = !content.includes('// CLIENT:') && !content.includes('@domain');
    if (isEngineFile) {
        lines.forEach((line, i) => {
            if (domainWords && domainWords.test(line) && !line.includes('example') && !line.includes('GOLDEN')) {
                findings.push({
                    dimension: 'aios_compliance',
                    severity: -1.5,
                    line: i + 1,
                    violation: `Domain contamination (AP-001): "${line.trim().substring(0, 80)}"`,
                });
            }
        });
    }

    return findings;
}

// ── Score Calculator ─────────────────────────────────────────

function calculateScore(findings) {
    const dimensionScores = {};

    // Initialize all dimensions at 10.0
    DIMENSIONS.forEach(d => {
        dimensionScores[d.id] = { raw: 10.0, penalties: [], name: d.name, weight: d.weight };
    });

    // Apply penalties
    findings.forEach(f => {
        const dim = dimensionScores[f.dimension];
        if (dim) {
            dim.raw = Math.max(0, dim.raw + f.severity); // severity is negative
            dim.penalties.push(f);
        }
    });

    // Calculate weighted average
    let totalWeightedScore = 0;
    let totalWeight = 0;
    Object.values(dimensionScores).forEach(d => {
        totalWeightedScore += d.raw * d.weight;
        totalWeight += d.weight;
    });

    const weightedAverage = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

    return { dimensionScores, weightedAverage: Math.round(weightedAverage * 10) / 10 };
}

// ── Verdict ──────────────────────────────────────────────────

function getVerdict(score) {
    if (score >= THRESHOLDS.EXCELLENT) return 'EXCELLENT';
    if (score >= THRESHOLDS.PASS) return 'PASS';
    if (score >= THRESHOLDS.CONDITIONAL) return 'CONDITIONAL_PASS';
    return 'FAIL';
}

// ── Quality Baseline Update ──────────────────────────────────

function updateBaseline(score) {
    let baseline;
    try {
        baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));
    } catch {
        baseline = { sessions: [], current_baseline: 0, trend: 'establishing', five_session_rule_trigger: false };
    }

    const today = new Date().toISOString().split('T')[0];
    const todaySession = baseline.sessions.find(s => s.date === today);

    if (todaySession) {
        todaySession.tasks_completed++;
        todaySession.average_score = (todaySession.average_score * (todaySession.tasks_completed - 1) + score) / todaySession.tasks_completed;
    } else {
        baseline.sessions.push({
            date: today,
            average_score: score,
            tasks_completed: 1,
            golden_examples_harvested: 0,
            anti_patterns_added: 0,
            notes: '',
        });
    }

    // WHY: Rolling 5-session average detects quality drift before it compounds
    const recentSessions = baseline.sessions.slice(-5);
    baseline.current_baseline = recentSessions.reduce((sum, s) => sum + s.average_score, 0) / recentSessions.length;
    baseline.current_baseline = Math.round(baseline.current_baseline * 10) / 10;

    // 5-session rule check (Nakajima)
    if (recentSessions.length >= 5) {
        const scores = recentSessions.map(s => s.average_score);
        const improving = scores[scores.length - 1] > scores[0];
        baseline.trend = improving ? 'improving' : 'stagnant';
        baseline.five_session_rule_trigger = !improving;
    }

    baseline.last_updated = today;

    const tmp = BASELINE_PATH + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(baseline, null, 2));
    fs.renameSync(tmp, BASELINE_PATH);

    return baseline;
}

// ── Session Signal Generator (Nakajima P4) ───────────────────

function generateSessionSignal(score, verdict, findings) {
    const topIssue = findings.length > 0
        ? findings.sort((a, b) => a.severity - b.severity)[0]
        : null;

    return {
        highest_quality: verdict === 'EXCELLENT' ? 'This output' : 'N/A',
        lowest_quality: topIssue ? `Line ${topIssue.line}: ${topIssue.violation}` : 'No issues found',
        one_improvement: topIssue ? `Address ${topIssue.dimension} issues (${findings.filter(f => f.dimension === topIssue.dimension).length} found)` : 'Maintain current quality level',
        golden_example_candidate: score >= THRESHOLDS.EXCELLENT,
    };
}

// ── Main Evaluation ──────────────────────────────────────────

function evaluate(content, options = {}) {
    const findings = runAutomatedChecks(content);
    const { dimensionScores, weightedAverage } = calculateScore(findings);
    const verdict = getVerdict(weightedAverage);
    const signal = generateSessionSignal(weightedAverage, verdict, findings);

    // WHY: Dry-run mode lets CI/CD evaluate without mutating baseline state
    let baseline = null;
    if (!options.dryRun) {
        try {
            baseline = updateBaseline(weightedAverage);
        } catch (err) {
            console.warn(`[self-correction] Could not update baseline: ${err.message}`);
        }
    }

    return {
        score: weightedAverage,
        verdict,
        dimensions: Object.entries(dimensionScores).reduce((acc, [id, d]) => {
            acc[id] = { score: d.raw, name: d.name, penalties: d.penalties.length };
            return acc;
        }, {}),
        findings,
        remediation: findings.map(f => ({
            location: `Line ${f.line}`,
            issue: f.violation,
            dimension: f.dimension,
            effort: Math.abs(f.severity) >= 2 ? 'medium' : 'small',
        })),
        signal,
        baseline: baseline ? {
            current: baseline.current_baseline,
            trend: baseline.trend,
            fiveSessionTrigger: baseline.five_session_rule_trigger,
        } : null,
    };
}

// ── CLI Interface ────────────────────────────────────────────

if (require.main === module) {
    const targetFile = process.argv[2];
    const dryRun = process.argv.includes('--dry-run');

    if (!targetFile) {
        console.log('AIOS Self-Correction v1.0 (PM3 Quality Gate)');
        console.log('Usage: node scripts/self-correction.js <file-to-evaluate> [--dry-run]');
        console.log('');
        console.log('Thresholds:');
        console.log(`  ≥${THRESHOLDS.EXCELLENT}: EXCELLENT (harvest as golden example)`);
        console.log(`  ≥${THRESHOLDS.PASS}: PASS (production-ready)`);
        console.log(`  ≥${THRESHOLDS.CONDITIONAL}: CONDITIONAL PASS (fix then deploy)`);
        console.log(`  <${THRESHOLDS.CONDITIONAL}: FAIL (rework required)`);
        process.exit(1);
    }

    // Read target file
    let content;
    try {
        content = fs.readFileSync(targetFile, 'utf8');
    } catch (err) {
        console.error(`Error: Cannot read file "${targetFile}": ${err.message}`);
        process.exit(1);
    }

    const result = evaluate(content, { dryRun });

    // Display results
    console.log(`\n⚡ Self-Correction v1.0 — PM3 Quality Gate`);
    console.log(`   File: ${targetFile}`);
    console.log(`   Score: ${result.score}/10`);
    console.log(`   Verdict: ${result.verdict}`);
    console.log('');

    console.log('   Dimensions:');
    Object.entries(result.dimensions).forEach(([id, d]) => {
        const bar = '█'.repeat(Math.round(d.score)) + '░'.repeat(10 - Math.round(d.score));
        console.log(`     ${d.name.padEnd(22)} ${bar} ${d.score}/10 (${d.penalties} issues)`);
    });

    if (result.findings.length > 0) {
        console.log(`\n   Findings (${result.findings.length}):`);
        result.findings.forEach(f => {
            console.log(`     L${f.line}: [${f.dimension}] ${f.violation}`);
        });
    }

    if (result.baseline) {
        console.log(`\n   Baseline: ${result.baseline.current}/10 (trend: ${result.baseline.trend})`);
        if (result.baseline.fiveSessionTrigger) {
            console.log('   ⚠️  5-SESSION RULE TRIGGERED — system audit recommended');
        }
    }

    console.log(`\n   Session Signal:`);
    console.log(`     Golden candidate: ${result.signal.golden_example_candidate ? 'YES' : 'no'}`);
    console.log(`     Top issue: ${result.signal.lowest_quality}`);
    console.log(`     Improvement: ${result.signal.one_improvement}`);

    // Emit events
    try {
        const { publish } = require(path.join(__dirname, 'event-bus'));
        publish('quality:scored', {
            file: targetFile,
            score: result.score,
            verdict: result.verdict,
            findings: result.findings.length,
        }, { source: 'self-correction', priority: result.verdict === 'FAIL' ? 'high' : 'normal' });

        if (result.verdict === 'EXCELLENT' || result.verdict === 'PASS') {
            publish('quality:passed', { file: targetFile, score: result.score });
        } else {
            publish('quality:failed', { file: targetFile, score: result.score, verdict: result.verdict });
        }
    } catch {
        // Event bus not available
    }

    // Exit code based on verdict
    if (result.verdict === 'FAIL') {
        process.exit(2);
    }
}

module.exports = { evaluate, runAutomatedChecks, calculateScore, getVerdict, THRESHOLDS, DIMENSIONS };
