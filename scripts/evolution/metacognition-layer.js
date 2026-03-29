#!/usr/bin/env node

/**
 * @module metacognition-layer
 * @version 1.0.0
 * @purpose The AIOS thinks about how it thinks. This layer monitors reasoning
 *          quality, detects anti-patterns BEFORE they are committed, identifies
 *          cognitive tendencies, and recommends adjustments.
 *
 *          Unlike PM3 (which evaluates AFTER output), metacognition operates
 *          DURING reasoning — it's the inner voice that says "wait, am I being
 *          shallow here?" before the thought is complete.
 *
 * @inputs  Output text, cognitive state, anti-patterns catalog
 * @outputs { quality, antiPatterns, tendencies, recommendations }
 * @domain-purity ZERO domain words. This file is ENGINE-level.
 *
 * @architecture
 *   ANALYSIS:
 *     analyzeOutput()     → depth, structure, honesty, domain-purity checks
 *     detectAntiPatterns() → proactive AP detection on output text
 *     assessTendencies()  → cognitive tendency profiling from state history
 *     recommend()         → actionable recommendations for improvement
 *
 *   INTEGRATION:
 *     review()     → Full metacognitive review of a single output
 *     trend()      → Multi-session trend analysis
 *     dashboard()  → CLI visualization
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────────────
// PATHS
// ─────────────────────────────────────────────────────────────

const PROJECT_ROOT = path.join(__dirname, '..', '..');
const ANTI_PATTERNS_FILE = path.join(PROJECT_ROOT, '.aios-core', 'memory', 'anti-patterns.md');
const HISTORY_FILE = path.join(PROJECT_ROOT, '.aios-core', 'data', 'noesis-history.json');
const DOMAIN_WORDS_FILE = path.join(PROJECT_ROOT, 'scripts', 'evolution', 'domain-words.config.json');

// ─────────────────────────────────────────────────────────────
// SAFE IMPORTS
// ─────────────────────────────────────────────────────────────

let cognitiveState = null;
try {
    cognitiveState = require(path.join(__dirname, 'cognitive-state-engine'));
} catch {
    // Standalone mode
}

let eventBus = null;
try {
    eventBus = require(path.join(__dirname, '..', 'event-bus'));
} catch {
    // Standalone mode
}

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

const VERSION = '1.0.0';

// Depth indicators — presence of these signals deeper reasoning
const DEPTH_SIGNALS = {
    tradeoffs: [/trade-?off/i, /on one hand/i, /alternatively/i, /however/i, /por outro lado/i],
    edgeCases: [/edge case/i, /corner case/i, /what if/i, /e se/i, /caso especial/i],
    whyNot: [/why not/i, /reason.*not/i, /por que não/i, /motivo.*não/i],
    consequences: [/consequence/i, /implication/i, /consequência/i, /implicação/i],
    alternatives: [/alternative/i, /instead/i, /rather than/i, /em vez de/i, /alternativa/i],
    uncertainty: [/uncertain/i, /unclear/i, /not sure/i, /incerto/i, /não tenho certeza/i],
    firstPrinciples: [/first principles?/i, /fundamentally/i, /from scratch/i, /princípios/i],
    selfCorrection: [/actually/i, /correction/i, /I was wrong/i, /na verdade/i, /correção/i],
};

// Shallow indicators — presence of these signals superficial reasoning
const SHALLOW_SIGNALS = {
    handwaving: [/simply|just|easily|obviously|clearly|trivially/i,
        /simplesmente|apenas|facilmente|obviamente|claramente/i],
    listWithout: [/^(\d+\.|[-*]) .{5,40}$/gm],  // Short bullet points without explanation
    noJustification: [/should|must|need to/i],  // Prescriptive without "because"
    repetition: null,  // Detected algorithmically
};

// Structure quality indicators
const STRUCTURE_SIGNALS = {
    hasHeaders: /^#{1,4} /m,
    hasCodeBlocks: /```[\s\S]*?```/,
    hasBulletPoints: /^[\s]*[-*] /m,
    hasNumberedList: /^\s*\d+\./m,
    hasJSDoc: /@(?:purpose|module|param|returns|inputs|outputs)/,
    hasSeparators: /^[-─═]{3,}/m,
};

// ─────────────────────────────────────────────────────────────
// ANALYSIS: Output quality assessment
// ─────────────────────────────────────────────────────────────

/**
 * @purpose Analyze output depth, structure, and honesty signals.
 * @param {string} text - Output text to analyze
 * @returns {Object} { depthScore, structureScore, honestyScore, signals }
 */
function analyzeOutput(text) {
    if (!text || text.trim().length === 0) {
        return { depthScore: 0, structureScore: 0, honestyScore: 0, signals: [] };
    }

    const signals = [];

    // ── Depth analysis ──
    let depthPoints = 0;
    for (const [category, patterns] of Object.entries(DEPTH_SIGNALS)) {
        for (const pattern of patterns) {
            if (pattern.test(text)) {
                depthPoints++;
                signals.push({ type: 'depth', category, found: true });
                break;  // One match per category is enough
            }
        }
    }
    // Normalize depth to 0-4 scale (8 categories → 4 max)
    const depthScore = Math.min(4, Math.round(depthPoints / 2));

    // ── Shallow detection ──
    let shallowPoints = 0;
    for (const [category, patterns] of Object.entries(SHALLOW_SIGNALS)) {
        if (category === 'repetition') {
            // Detect repeated sentences
            const sentences = text.split(/[.!?]\s+/).filter(s => s.length > 20);
            const unique = new Set(sentences.map(s => s.toLowerCase().trim()));
            if (sentences.length > 3 && unique.size < sentences.length * 0.7) {
                shallowPoints += 2;
                signals.push({ type: 'shallow', category: 'repetition', found: true });
            }
            continue;
        }
        if (!patterns) continue;
        for (const pattern of patterns) {
            const matches = text.match(pattern);
            if (matches && matches.length > 2) {
                shallowPoints++;
                signals.push({ type: 'shallow', category, count: matches.length });
                break;
            }
        }
    }

    // ── Structure analysis ──
    let structurePoints = 0;
    for (const [signal, pattern] of Object.entries(STRUCTURE_SIGNALS)) {
        if (pattern.test(text)) {
            structurePoints++;
            signals.push({ type: 'structure', signal, found: true });
        }
    }
    // Normalize structure to 0-10 scale (6 signals)
    const structureScore = Math.min(10, Math.round((structurePoints / 6) * 10));

    // ── Honesty analysis ──
    let honestyPoints = 5; // Start at neutral
    // Bonus for acknowledging uncertainty
    if (/\b(I don't know|não sei|uncertain|não tenho certeza|unclear|may not be)\b/i.test(text)) {
        honestyPoints += 2;
        signals.push({ type: 'honesty', signal: 'acknowledges_uncertainty' });
    }
    // Bonus for showing limitations
    if (/\b(limitation|caveat|trade-off|limitação|ressalva)\b/i.test(text)) {
        honestyPoints += 1;
        signals.push({ type: 'honesty', signal: 'shows_limitations' });
    }
    // Penalty for absolutist claims without evidence
    if (/\b(always|never|impossible|guaranteed|always works|impossível|garantido)\b/i.test(text)) {
        const hasEvidence = /because|due to|evidence|data shows|porque|evidência/i.test(text);
        if (!hasEvidence) {
            honestyPoints -= 2;
            signals.push({ type: 'honesty', signal: 'absolutist_without_evidence' });
        }
    }
    const honestyScore = Math.max(0, Math.min(10, honestyPoints));

    // Adjust depth for shallow signals
    const adjustedDepth = Math.max(0, depthScore - Math.floor(shallowPoints / 2));

    return {
        depthScore: adjustedDepth,
        structureScore,
        honestyScore,
        shallowSignals: shallowPoints,
        signals,
        textLength: text.length,
        lineCount: text.split('\n').length,
    };
}

// ─────────────────────────────────────────────────────────────
// ANTI-PATTERN DETECTION: Proactive
// ─────────────────────────────────────────────────────────────

/**
 * @purpose Detect anti-patterns in output BEFORE delivery.
 *          Parses the anti-patterns.md catalog and runs each check.
 * @param {string} text - Output text to scan
 * @returns {Array} List of detected anti-patterns { id, name, severity, evidence }
 */
function detectAntiPatterns(text) {
    const detected = [];
    if (!text) return detected;

    const lower = text.toLowerCase();

    // ── AP-001: Domain Contamination ──
    const domainWords = loadDomainWords();
    for (const word of domainWords) {
        if (lower.includes(word)) {
            detected.push({
                id: 'AP-001',
                name: 'Domain Contamination',
                severity: 'high',
                evidence: `Found "${word}" in engine-level output`,
                recommendation: 'Move domain-specific logic to clients/ directory',
            });
            break;
        }
    }

    // ── AP-002: Silent External API Failure ──
    if (/\bfetch\s*\(|axios\.|http\.request|\.get\s*\(.*url/i.test(text)) {
        const hasTimeout = /timeout|abort|signal/i.test(text);
        const hasErrorHandling = /catch|\.catch|try\s*{/i.test(text);
        if (!hasTimeout || !hasErrorHandling) {
            detected.push({
                id: 'AP-002',
                name: 'Silent External API Failure',
                severity: 'high',
                evidence: 'External API call without timeout or error handling',
                recommendation: 'Add AbortController timeout and typed error handling',
            });
        }
    }

    // ── AP-003: Monolithic Intent Handler ──
    if (/function\s+\w+.*\(.*message|input|request/i.test(text)) {
        const funcBody = text.match(/function\s+\w+[^}]+{[\s\S]*?}/g);
        if (funcBody) {
            for (const body of funcBody) {
                const hasClassify = /classify|detect|parse|identify|intent/i.test(body);
                const hasExecute = /execute|send|respond|reply|create|save/i.test(body);
                if (hasClassify && hasExecute && body.length > 500) {
                    detected.push({
                        id: 'AP-003',
                        name: 'Monolithic Intent Handler',
                        severity: 'medium',
                        evidence: 'Single function handles both classification and execution',
                        recommendation: 'Separate: classifyIntent → routeIntent → executeAction',
                    });
                    break;
                }
            }
        }
    }

    // ── AP-005: Hardcoded Configuration ──
    const hardcodedPatterns = text.match(/(?:['"](?:https?:\/\/|wss:\/\/|localhost)[^'"]+['"]|(?:port|timeout|limit)\s*[:=]\s*\d+)/gi);
    if (hardcodedPatterns && hardcodedPatterns.length > 2) {
        detected.push({
            id: 'AP-005',
            name: 'Hardcoded Configuration',
            severity: 'medium',
            evidence: `${hardcodedPatterns.length} hardcoded config values found`,
            recommendation: 'Extract to constants object or config file',
        });
    }

    // ── AP-006: Direct Assumption (Modo Investigativo / Anti-Viés) ──
    if (/\b(com certeza|obviamente|claramente|assumo que|é óbvio que|vai funcionar|solução ideal)\b/i.test(text)) {
        const hasAudit = /\b(pesquisar|auditar|investigar|dados mostram|historicamente|analisando o mercado|validação empírica)\b/i.test(text);
        if (!hasAudit) {
            detected.push({
                id: 'AP-006',
                name: 'Direct Assumption (No Investigative Mode)',
                severity: 'high',
                evidence: 'Output makes direct assumptions without prior market audit/investigation signals',
                recommendation: 'Activate Investigative Mode: audit the full market landscape before providing ready-made solutions.',
            });
        }
    }

    // ── AP-007: Lone Wolf Tactical Decision (O Conclave Gateway) ──
    if (/\b(oferta especial|precificação|mudança estratégica|pivotar|novo lançamento|campanha de ads|plano tático)\b/i.test(text)) {
        const hasCouncil = /\b(conselho|conclave|@clone-finch|@clone-hormozi|validação cruzada|multi-agent|conselheiros)\b/i.test(text);
        if (!hasCouncil) {
            detected.push({
                id: 'AP-007',
                name: 'Lone Wolf Tactical Decision',
                severity: 'critical',
                evidence: 'Strategic/tactical decision presented without Council (Conclave) validation',
                recommendation: 'Invoke the Conclave (e.g., @clone-finch, @clone-hormozi) to audit feasibility before delivery.',
            });
        }
    }

    return detected;
}

/**
 * @purpose Load domain-specific words from config
 */
function loadDomainWords() {
    try {
        if (fs.existsSync(DOMAIN_WORDS_FILE)) {
            const config = JSON.parse(fs.readFileSync(DOMAIN_WORDS_FILE, 'utf-8'));
            return config.words || [];
        }
    } catch { /* fallback below */ }

    // Default domain words (AP-001)
    return [
        'patient', 'clinic', 'appointment', 'scheduling',
        'whatsapp', 'evolution api', 'fisio', 'consulta',
        'agendamento', 'paciente', 'dentist',
    ];
}

// ─────────────────────────────────────────────────────────────
// TENDENCY ASSESSMENT: Cognitive profiling
// ─────────────────────────────────────────────────────────────

/**
 * @purpose Analyze cognitive tendencies from session history.
 *          Identifies recurring patterns: strengths, weaknesses, biases.
 * @returns {Object} { tendencies, scoreDistribution, recommendations }
 */
function assessTendencies() {
    let history = [];
    try {
        if (fs.existsSync(HISTORY_FILE)) {
            history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
        }
    } catch { /* empty history */ }

    if (history.length < 3) {
        return {
            tendencies: [],
            message: 'Insufficient data (need ≥3 sessions)',
            sessionCount: history.length,
        };
    }

    const tendencies = [];
    const last10 = history.slice(-10);

    // ── Score distribution ──
    const scores = last10.map(h => h.score || 0);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const stddev = Math.sqrt(scores.map(s => (s - avg) ** 2).reduce((a, b) => a + b, 0) / scores.length);

    // ── Tendency 1: Consistency ──
    if (stddev < 0.5 && avg >= 8) {
        tendencies.push({
            id: 'T-CONSISTENT-HIGH',
            description: 'Consistently high quality output',
            type: 'strength',
            confidence: Math.min(1, last10.length / 10),
        });
    } else if (stddev > 2) {
        tendencies.push({
            id: 'T-VOLATILE',
            description: 'High variance in output quality — inconsistent',
            type: 'weakness',
            confidence: Math.min(1, last10.length / 10),
        });
    }

    // ── Tendency 2: Depth trend ──
    const depths = last10.map(h => h.depthScore || 0);
    const depthAvg = depths.reduce((a, b) => a + b, 0) / depths.length;
    if (depthAvg < 2 && last10.length >= 5) {
        tendencies.push({
            id: 'T-SHALLOW',
            description: 'Consistently shallow reasoning (avg depth < 2/4)',
            type: 'weakness',
            confidence: 0.8,
        });
    } else if (depthAvg >= 3) {
        tendencies.push({
            id: 'T-DEEP',
            description: 'Consistently deep reasoning (avg depth ≥ 3/4)',
            type: 'strength',
            confidence: 0.8,
        });
    }

    // ── Tendency 3: Improvement trend ──
    if (last10.length >= 5) {
        const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
        const secondHalf = scores.slice(Math.floor(scores.length / 2));
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

        if (secondAvg > firstAvg + 0.3) {
            tendencies.push({
                id: 'T-IMPROVING',
                description: 'Quality trending upward over recent sessions',
                type: 'positive',
                delta: +(secondAvg - firstAvg).toFixed(2),
            });
        } else if (secondAvg < firstAvg - 0.3) {
            tendencies.push({
                id: 'T-DECLINING',
                description: 'Quality trending downward — needs attention',
                type: 'negative',
                delta: +(secondAvg - firstAvg).toFixed(2),
            });
        }
    }

    // ── Tendency 4: Harvest rate ──
    const harvestRate = last10.filter(h => h.harvested).length / last10.length;
    if (harvestRate > 0.3) {
        tendencies.push({
            id: 'T-HIGH-HARVEST',
            description: `High golden example harvest rate (${(harvestRate * 100).toFixed(0)}%)`,
            type: 'strength',
        });
    } else if (harvestRate === 0 && last10.length >= 5) {
        tendencies.push({
            id: 'T-NO-HARVEST',
            description: 'No golden examples harvested in recent sessions',
            type: 'weakness',
        });
    }

    return {
        tendencies,
        stats: {
            sessionCount: history.length,
            recentCount: last10.length,
            avgScore: +avg.toFixed(2),
            stddev: +stddev.toFixed(2),
            avgDepth: +depthAvg.toFixed(2),
            harvestRate: +(harvestRate * 100).toFixed(1),
        },
    };
}

// ─────────────────────────────────────────────────────────────
// RECOMMENDATIONS: Actionable suggestions
// ─────────────────────────────────────────────────────────────

/**
 * @purpose Generate actionable recommendations based on analysis
 * @param {Object} analysis - From analyzeOutput
 * @param {Array} antiPatterns - From detectAntiPatterns
 * @param {Object} tendencies - From assessTendencies
 * @returns {Array} List of recommendations { priority, message, category }
 */
function recommend(analysis, antiPatterns, tendencies) {
    const recs = [];

    // From output analysis
    if (analysis.depthScore < 2) {
        recs.push({
            priority: 'high',
            category: 'depth',
            message: 'Output lacks depth. Add trade-off analysis, edge cases, or "why not" reasoning.',
        });
    }
    if (analysis.structureScore < 5) {
        recs.push({
            priority: 'medium',
            category: 'structure',
            message: 'Output needs better structure. Add headers, code blocks, or JSDoc annotations.',
        });
    }
    if (analysis.honestyScore < 4) {
        recs.push({
            priority: 'high',
            category: 'honesty',
            message: 'Output makes absolutist claims without evidence. Add caveats or supporting data.',
        });
    }
    if (analysis.shallowSignals > 2) {
        recs.push({
            priority: 'medium',
            category: 'depth',
            message: `${analysis.shallowSignals} shallow signals detected (handwaving, short lists). Expand reasoning.`,
        });
    }

    // From anti-patterns
    for (const ap of antiPatterns) {
        recs.push({
            priority: ap.severity,
            category: 'anti-pattern',
            message: `[${ap.id}] ${ap.name}: ${ap.recommendation}`,
        });
    }

    // From tendencies
    if (tendencies && tendencies.tendencies) {
        for (const t of tendencies.tendencies) {
            if (t.type === 'weakness' || t.type === 'negative') {
                recs.push({
                    priority: 'medium',
                    category: 'tendency',
                    message: `[${t.id}] ${t.description}`,
                });
            }
        }
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    recs.sort((a, b) => (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2));

    return recs;
}

// ─────────────────────────────────────────────────────────────
// REVIEW: Full metacognitive review of output
// ─────────────────────────────────────────────────────────────

/**
 * @purpose Full metacognitive review — the main entry point.
 *          Runs all analyses and produces a unified report.
 * @param {string} text - Output text to review
 * @param {Object} options - { isEngineFile: false, recordObservation: true }
 * @returns {Object} Complete metacognitive review
 */
function review(text, options = {}) {
    const startTime = Date.now();

    const analysis = analyzeOutput(text);
    const antiPatterns = detectAntiPatterns(text);
    const tendencies = assessTendencies();
    const recommendations = recommend(analysis, antiPatterns, tendencies);

    const overallScore = Math.round(
        (analysis.depthScore * 2.5 +
            analysis.structureScore * 0.5 +
            analysis.honestyScore * 0.5 +
            (antiPatterns.length === 0 ? 10 : Math.max(0, 10 - antiPatterns.length * 3)) * 0.5) / 4
        * 10) / 10;

    const result = {
        version: VERSION,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        overallScore,
        analysis,
        antiPatterns,
        tendencies: tendencies.stats || {},
        recommendations,
        verdict: overallScore >= 7 ? 'DEEP'
            : overallScore >= 4 ? 'ADEQUATE'
                : 'SHALLOW',
    };

    // Record observation in cognitive state
    if (cognitiveState && options.recordObservation !== false) {
        try {
            const obsType = result.verdict === 'DEEP' ? 'strength'
                : result.verdict === 'SHALLOW' ? 'blindspot' : 'pattern';
            cognitiveState.observe({
                type: obsType,
                description: `Metacognition: ${result.verdict} (${overallScore}/10). `
                    + `Depth: ${analysis.depthScore}/4, Structure: ${analysis.structureScore}/10, `
                    + `APs: ${antiPatterns.length}`,
                score: overallScore,
                depthScore: analysis.depthScore,
                context: { source: 'metacognition-layer', antiPatterns: antiPatterns.length },
            });
        } catch { /* non-critical */ }
    }

    // Emit event
    if (eventBus && typeof eventBus.emit === 'function') {
        try {
            eventBus.emit('noesis.metacognition.reviewed', {
                overallScore,
                verdict: result.verdict,
                antiPatterns: antiPatterns.length,
                recommendations: recommendations.length,
            });
        } catch { /* non-critical */ }
    }

    return result;
}

// ─────────────────────────────────────────────────────────────
// CLI — Self-test, Dashboard, Review
// ─────────────────────────────────────────────────────────────

function runTest() {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║   🧠 Metacognition Layer — Self-Test (v' + VERSION + ')      ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log('');

    let passed = 0;
    let failed = 0;

    function test(name, fn) {
        try {
            fn();
            console.log(`  ✅ ${name}`);
            passed++;
        } catch (err) {
            console.log(`  ❌ ${name}: ${err.message}`);
            failed++;
        }
    }

    function assert(condition, msg) {
        if (!condition) throw new Error(msg || 'Assertion failed');
    }

    // Test 1: Deep output detection
    test('Detects deep output', () => {
        const deep = `## Architecture Decision
This presents a trade-off between speed and memory.
On one hand, caching improves latency. However, it increases RAM usage.
Edge case: what if the cache exceeds available memory?
The consequence is that we need an eviction policy.
An alternative approach is to use lazy loading instead.
I'm not sure which is better without profiling data.
From first principles, we should measure before optimizing.
Actually, after thinking more, lazy loading is the right default.`;

        const result = analyzeOutput(deep);
        assert(result.depthScore >= 3, `Expected depth ≥ 3, got ${result.depthScore}`);
    });

    // Test 2: Shallow output detection
    test('Detects shallow output', () => {
        const shallow = `- Use React
- Add buttons
- Make it work
- Deploy to Vercel
- Test it
Obviously this is simple.
Just follow these steps.
Simply run the command.
Clearly this approach works.`;

        const result = analyzeOutput(shallow);
        assert(result.depthScore <= 1, `Expected depth ≤ 1, got ${result.depthScore}`);
        assert(result.shallowSignals > 0, 'Should detect shallow signals');
    });

    // Test 3: Structure detection
    test('Detects structured output', () => {
        const structured = `# Module Design
## Overview
Here is the plan.
\`\`\`javascript
function hello() { return 'world'; }
\`\`\`
- Point one
- Point two

---

1. Step one
2. Step two`;

        const result = analyzeOutput(structured);
        assert(result.structureScore >= 7, `Expected structure ≥ 7, got ${result.structureScore}`);
    });

    // Test 4: Anti-pattern AP-002 detection
    test('Detects AP-002 (missing error handling)', () => {
        const badCode = `const response = await fetch('https://api.example.com/data');
const data = await response.json();
return data;`;

        const aps = detectAntiPatterns(badCode);
        assert(aps.some(a => a.id === 'AP-002'),
            'Should detect AP-002 (no timeout/error handling)');
    });

    // Test 5: Clean code passes anti-pattern check
    test('Clean code passes anti-pattern check', () => {
        const cleanCode = `const MAX_ITEMS = 100;
const result = items.filter(i => i.active).slice(0, MAX_ITEMS);
return result;`;

        const aps = detectAntiPatterns(cleanCode);
        assert(aps.length === 0, `Expected 0 anti-patterns, got ${aps.length}`);
    });

    // Test 6: Tendency assessment runs without crash
    test('Tendency assessment runs', () => {
        const result = assessTendencies();
        assert(typeof result === 'object', 'Should return object');
        assert(Array.isArray(result.tendencies), 'Should have tendencies array');
    });

    // Test 7: Recommendations generated
    test('Recommendations generated from analysis', () => {
        const analysis = { depthScore: 1, structureScore: 3, honestyScore: 3, shallowSignals: 3 };
        const aps = [{ id: 'AP-001', name: 'Test', severity: 'high', recommendation: 'Fix it' }];
        const recs = recommend(analysis, aps, { tendencies: [] });
        assert(recs.length >= 3, `Expected ≥3 recommendations, got ${recs.length}`);
        assert(recs[0].priority === 'high', 'First rec should be high priority');
    });

    // Test 8: Full review pipeline
    test('Full review pipeline', () => {
        const text = `## Solution
This is a well-structured response with trade-offs considered.
However, there is an edge case where memory might overflow.
The consequence is we need bounds checking.`;

        const result = review(text, { recordObservation: false });
        assert(result.version === VERSION, 'Wrong version');
        assert(typeof result.overallScore === 'number', 'Missing overall score');
        assert(['DEEP', 'ADEQUATE', 'SHALLOW'].includes(result.verdict), 'Invalid verdict');
        assert(Array.isArray(result.recommendations), 'Missing recommendations');
    });

    // Test 9: Honesty detection
    test('Detects honesty signals', () => {
        const honest = `I'm not sure about this approach. There's a limitation with the current design.
This always works without any issues guaranteed.`;

        const result = analyzeOutput(honest);
        const hasBoth = result.signals.some(s => s.signal === 'acknowledges_uncertainty') &&
            result.signals.some(s => s.signal === 'absolutist_without_evidence');
        assert(hasBoth, 'Should detect both honesty and dishonesty signals');
    });

    // Test 10: Empty input handling
    test('Handles empty input gracefully', () => {
        const r1 = analyzeOutput('');
        assert(r1.depthScore === 0, 'Empty should score 0');
        const r2 = detectAntiPatterns('');
        assert(r2.length === 0, 'Empty should have no APs');
        const r3 = review('', { recordObservation: false });
        assert(r3.verdict === 'SHALLOW', 'Empty should be SHALLOW');
    });

    console.log('');
    console.log(`  Results: ${passed} passed, ${failed} failed`);
    console.log('');

    return { passed, failed };
}

function showDashboard() {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║    🧠 Metacognition Layer — Dashboard (v' + VERSION + ')     ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log('');

    const tendencies = assessTendencies();

    if (tendencies.stats) {
        console.log('  📊 Session Statistics:');
        console.log(`     Total sessions:    ${tendencies.stats.sessionCount}`);
        console.log(`     Recent analyzed:   ${tendencies.stats.recentCount}`);
        console.log(`     Avg score:         ${tendencies.stats.avgScore}/10`);
        console.log(`     Score std dev:     ${tendencies.stats.stddev}`);
        console.log(`     Avg depth:         ${tendencies.stats.avgDepth}/4`);
        console.log(`     Harvest rate:      ${tendencies.stats.harvestRate}%`);
        console.log('');
    }

    if (tendencies.tendencies && tendencies.tendencies.length > 0) {
        console.log('  🔍 Cognitive Tendencies:');
        for (const t of tendencies.tendencies) {
            const icon = t.type === 'strength' || t.type === 'positive' ? '✅'
                : t.type === 'weakness' || t.type === 'negative' ? '⚠️' : '📊';
            console.log(`     ${icon} [${t.id}] ${t.description}`);
        }
        console.log('');
    } else {
        console.log(`  🔍 No tendencies detected yet (${tendencies.message || 'need more data'})`);
        console.log('');
    }

    // Anti-patterns catalog status
    let apCount = 0;
    try {
        if (fs.existsSync(ANTI_PATTERNS_FILE)) {
            const content = fs.readFileSync(ANTI_PATTERNS_FILE, 'utf-8');
            apCount = (content.match(/^## AP-/gm) || []).length;
        }
    } catch { /* ignore */ }
    console.log(`  🚫 Anti-Patterns Catalog: ${apCount} documented`);

    // Cognitive state summary
    if (cognitiveState) {
        try {
            const state = cognitiveState.loadState();
            console.log(`  🧠 Cognitive State: ${state.strengths.length} strengths, ${state.patterns.length} patterns, ${state.blindspots.filter(b => !b.addressed).length} active blindspots`);
        } catch { /* ignore */ }
    }

    console.log('');
}

// ─────────────────────────────────────────────────────────────
// CLI ENTRY POINT
// ─────────────────────────────────────────────────────────────

if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.includes('--test')) {
        runTest();
    } else if (args.includes('--dashboard')) {
        showDashboard();
    } else if (args.includes('--review')) {
        const idx = args.indexOf('--review');
        const filePath = args[idx + 1];
        if (!filePath || !fs.existsSync(filePath)) {
            console.log('Usage: --review <file_path>');
            process.exit(1);
        }
        const text = fs.readFileSync(filePath, 'utf-8');
        const result = review(text);
        console.log(JSON.stringify(result, null, 2));
    } else {
        showDashboard();
    }
}

// ─────────────────────────────────────────────────────────────
// MODULE EXPORTS
// ─────────────────────────────────────────────────────────────

module.exports = {
    analyzeOutput,
    detectAntiPatterns,
    assessTendencies,
    recommend,
    review,
    VERSION,
};
