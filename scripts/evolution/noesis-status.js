#!/usr/bin/env node

/**
 * @module noesis-status
 * @version 2.2.0
 * @purpose CLI dashboard for the Noesis cognitive layer. Shows quality baseline,
 *          distillation progress, golden examples count, anti-pattern catalog,
 *          and cycle history.
 * @inputs  None (reads from filesystem)
 * @outputs Console dashboard
 * @domain-purity ZERO domain words. This file is ENGINE-level.
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────────────
// PATHS
// ─────────────────────────────────────────────────────────────

const PROJECT_ROOT = path.join(__dirname, '..', '..');
const ROADMAP_FILE = path.join(PROJECT_ROOT, 'distillation-dataset', 'roadmap.json');
const TRACES_DIR = path.join(PROJECT_ROOT, 'distillation-dataset', 'traces');
const CURATED_DIR = path.join(PROJECT_ROOT, 'distillation-dataset', 'curated');
const BASELINE_FILE = path.join(PROJECT_ROOT, '.aios-core', 'data', 'quality-baseline.json');
const GOLDEN_DIR = path.join(PROJECT_ROOT, '.aios-core', 'memory', 'golden-examples');
const ANTI_PATTERNS_FILE = path.join(PROJECT_ROOT, '.aios-core', 'memory', 'anti-patterns.md');
const HISTORY_FILE = path.join(PROJECT_ROOT, '.aios-core', 'data', 'noesis-history.json');

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function safeReadJSON(filePath) {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
        return null;
    }
}

function countFiles(dir, ext) {
    try {
        if (!fs.existsSync(dir)) return 0;
        return fs.readdirSync(dir, { recursive: true })
            .filter(f => f.endsWith(ext)).length;
    } catch {
        return 0;
    }
}

function countTraceEntries(dir) {
    try {
        if (!fs.existsSync(dir)) return 0;
        let count = 0;
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsonl'));
        for (const f of files) {
            const content = fs.readFileSync(path.join(dir, f), 'utf-8');
            count += content.trim().split('\n').filter(Boolean).length;
        }
        return count;
    } catch {
        return 0;
    }
}

function countAntiPatterns() {
    try {
        if (!fs.existsSync(ANTI_PATTERNS_FILE)) return 0;
        const content = fs.readFileSync(ANTI_PATTERNS_FILE, 'utf-8');
        return (content.match(/^## AP-/gm) || []).length;
    } catch {
        return 0;
    }
}

function bar(value, max, width = 20) {
    const filled = Math.round((value / max) * width);
    return '█'.repeat(Math.min(filled, width)) + '░'.repeat(Math.max(width - filled, 0));
}

// ─────────────────────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────────────────────

function showStatus() {
    console.log('');
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║        🧠 NOESIS ENGINE — Status Dashboard       ║');
    console.log('╚══════════════════════════════════════════════════╝');
    console.log('');

    // ── Quality Baseline ──────────────────────────────────────
    const baseline = safeReadJSON(BASELINE_FILE);
    console.log('📊 Quality Baseline');
    if (baseline) {
        const score = baseline.current_baseline || 0;
        const trend = baseline.trend || 'establishing';
        const sessions = (baseline.history || []).length;
        console.log(`   Score:    ${bar(score, 10)} ${score}/10`);
        console.log(`   Trend:    ${trend}`);
        console.log(`   Sessions: ${sessions}`);

        if (baseline.history && baseline.history.length > 0) {
            const last5 = baseline.history.slice(-5);
            const scores = last5.map(h => (h.score || 0).toFixed(1));
            console.log(`   Last 5:   [${scores.join(', ')}]`);
            // Depth scores from v2.2+
            const depths = last5.map(h => h.depthScore != null ? h.depthScore : '-');
            console.log(`   Depth:    [${depths.join(', ')}] /4`);
        }
    } else {
        console.log('   ⚠️  No baseline yet (run first Noesis cycle)');
    }
    console.log('');

    // ── Distillation Progress ─────────────────────────────────
    const roadmap = safeReadJSON(ROADMAP_FILE);
    const tracesCount = roadmap ? roadmap.captured : countTraceEntries(TRACES_DIR);
    const curatedCount = roadmap ? roadmap.curated : countTraceEntries(CURATED_DIR);
    const target = roadmap ? roadmap.target : 500;
    const totalTraces = tracesCount + curatedCount;

    console.log('🧬 Distillation Progress');
    console.log(`   Traces:   ${bar(totalTraces, target)} ${totalTraces}/${target}`);
    console.log(`   Curated:  ${curatedCount}`);
    if (roadmap && roadmap.milestones) {
        console.log('   Milestones:');
        for (const m of roadmap.milestones) {
            const icon = m.status === 'reached' ? '✅' : totalTraces >= m.traces * 0.5 ? '🔶' : '⬜';
            console.log(`     ${icon} ${m.name.padEnd(12)} ${m.traces} traces ${m.status === 'reached' ? `(${m.reachedAt?.split('T')[0]})` : ''}`);
        }
    }
    if (roadmap && roadmap.lastUpdated) {
        console.log(`   Last:     ${roadmap.lastUpdated}`);
    }
    console.log('');

    // ── Golden Examples ───────────────────────────────────────
    const goldenPM1 = countFiles(path.join(GOLDEN_DIR, 'pm1'), '.md');
    const goldenPM2 = countFiles(path.join(GOLDEN_DIR, 'pm2'), '.md');
    const goldenPM3 = countFiles(path.join(GOLDEN_DIR, 'pm3'), '.md');
    const totalGolden = goldenPM1 + goldenPM2 + goldenPM3;

    console.log('🏆 Golden Examples');
    console.log(`   PM1 (Analysis):   ${goldenPM1}`);
    console.log(`   PM2 (Execution):  ${goldenPM2}`);
    console.log(`   PM3 (Evaluation): ${goldenPM3}`);
    console.log(`   Total:            ${totalGolden}`);
    console.log('');

    // ── Anti-Patterns ─────────────────────────────────────────
    const apCount = countAntiPatterns();
    console.log('🚫 Anti-Patterns Catalog');
    console.log(`   Documented: ${apCount}`);
    console.log('');

    // ── Summary ───────────────────────────────────────────────
    console.log('─'.repeat(50));
    const health = totalTraces > 0 ? (baseline ? '🟢 Active' : '🟡 Warming up') : '🔴 No cycles yet';
    console.log(`   Health: ${health}`);
    console.log('');
}

// ─────────────────────────────────────────────────────────────
// HISTORY VIEW
// ─────────────────────────────────────────────────────────────

function showHistory() {
    console.log('');
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║      🧠 NOESIS ENGINE — Cycle History (last 10)  ║');
    console.log('╚══════════════════════════════════════════════════╝');
    console.log('');

    const history = safeReadJSON(HISTORY_FILE);
    if (!history || history.length === 0) {
        console.log('   ⚠️  No cycle history yet.');
        console.log('');
        return;
    }

    const last10 = history.slice(-10).reverse();
    console.log('   #  │ Score │ Depth │ Verdict     │ Mode │ Harvested │ Retried │ Duration');
    console.log('   ───┼───────┼───────┼─────────────┼──────┼───────────┼─────────┼─────────');

    last10.forEach((h, i) => {
        const num = String(i + 1).padStart(2);
        const score = String(h.score || 0).padStart(4);
        const depth = String(h.depthScore != null ? h.depthScore : '-').padStart(3);
        const verdict = (h.verdict || '?').padEnd(11);
        const mode = (h.mode || '?').padEnd(4);
        const harvested = h.harvested ? '  ✅  ' : '  ❌  ';
        const retried = h.retried ? '  ✅  ' : '  ❌  ';
        const duration = h.duration ? `${h.duration}ms` : '?';
        console.log(`   ${num} │ ${score} │ ${depth}/4 │ ${verdict} │ ${mode} │ ${harvested}   │ ${retried}  │ ${duration}`);
    });

    console.log('');
    console.log(`   Total cycles: ${history.length} | Pipeline: v${(history[history.length - 1] || {}).pipelineVersion || '?'}`);
    console.log('');
}

// ─────────────────────────────────────────────────────────────
// CLI
// ─────────────────────────────────────────────────────────────

if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.includes('--history')) {
        showHistory();
    } else {
        showStatus();
    }
}

module.exports = { showStatus, showHistory };
