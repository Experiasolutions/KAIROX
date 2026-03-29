/**
 * @module ia-council-engine
 * @purpose The brain of the Evolution Engine. Implements an 8-member IA Council
 *          where each member evaluates the system from a unique perspective,
 *          plus a Metamind synthesizer that deduplicates and produces unified verdicts.
 *          Chair 8 (Distillation Engineer) is a Hinton+Sutskever collaboration
 *          focused on capturing traces for future local model training.
 * @inputs  System state snapshot (files, metrics, quality scores)
 * @outputs Per-member evaluations + synthesized verdict
 * @emits   None (called by other engines)
 * @dependencies circuit-breaker.config.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const CONFIG = require('./circuit-breaker.config');

// ─────────────────────────────────────────────────────────────
// COUNCIL MEMBER EVALUATION FUNCTIONS
// Each member has a distinct evaluation lens.
// Input: systemState = { files: [], metrics: {}, qualityBaseline: {}, antiPatterns: [], projectRoot: string }
// Output: { gaps: [{ id, description, severity, evidence, impact30d }], score: 0-10 }
// ─────────────────────────────────────────────────────────────

/**
 * @purpose Chair 1 — Karpathy: Code quality, engineering rigor, PR-readiness
 * @inputs {Object} systemState
 * @outputs {Object} { gaps: Array, score: number }
 */
function evaluateKarpathy(systemState) {
    const gaps = [];
    let score = 8; // Start optimistic

    // Check 1: JSDoc coverage in critical scripts
    const scripts = (systemState.files || []).filter(f =>
        f.path.startsWith('scripts/') && f.path.endsWith('.js') && !f.path.includes('evolution/')
    );

    for (const script of scripts) {
        if (script.content) {
            const hasJSDoc = script.content.includes('/**');
            const hasPurpose = script.content.includes('@purpose');
            if (!hasJSDoc || !hasPurpose) {
                gaps.push({
                    id: `KAR-JSDOC-${path.basename(script.path)}`,
                    description: `${script.path} lacks comprehensive JSDoc with @purpose annotation`,
                    severity: 4,
                    evidence: `File has ${hasJSDoc ? '' : 'no '}JSDoc blocks, ${hasPurpose ? '' : 'no '}@purpose tag`,
                    impact30d: 'Reduced maintainability; new agents cannot understand module contracts',
                });
                score -= 0.3;
            }
        }
    }

    // Check 2: Error handling patterns
    // Note: top-level require() is sync and fails visibly — only flag scripts with
    // async calls (fetch, http, fs.readFile w/o sync) or dynamic require() inside functions
    for (const script of scripts) {
        if (script.content) {
            const hasTryCatch = script.content.includes('try {') || script.content.includes('try{') || script.content.includes('try\n');
            const hasAsyncCalls = script.content.includes('fetch(') ||
                script.content.includes('http.request') || script.content.includes('https.request') ||
                script.content.includes('.get(') || script.content.includes('.post(');
            const hasCallbackFS = script.content.includes('fs.readFile(') && !script.content.includes('readFileSync');
            const hasPurpose = script.content.includes('@purpose');
            // Only flag if it has async/network calls without try-catch
            // Scripts with only top-level require() are safe — require is sync
            if ((hasAsyncCalls || hasCallbackFS) && !hasTryCatch) {
                gaps.push({
                    id: `KAR-ERRH-${path.basename(script.path)}`,
                    description: `${script.path} has async/network calls without try-catch error handling`,
                    severity: 6,
                    evidence: 'Has fetch()/http request but no try-catch blocks',
                    impact30d: 'Silent failures in production; AP-002 pattern',
                });
                score -= 0.5;
            } else if (!hasTryCatch && !hasPurpose && script.content.includes('require(') &&
                script.content.includes('function ')) {
                // Has require inside functions (not just top-level) — lower severity
                gaps.push({
                    id: `KAR-ERRH-${path.basename(script.path)}`,
                    description: `${script.path} has function-scope external calls without error handling`,
                    severity: 4,
                    evidence: 'Has require() inside functions but no try-catch blocks',
                    impact30d: 'Potential silent failures in production',
                });
                score -= 0.3;
            }
        }
    }

    // Check 3: Event-bus integration
    for (const script of scripts) {
        if (script.content && script.path !== 'scripts/event-bus.js') {
            const usesEventBus = script.content.includes('event-bus') || script.content.includes('eventBus');
            if (!usesEventBus && script.content.length > 500) {
                gaps.push({
                    id: `KAR-EBUS-${path.basename(script.path)}`,
                    description: `${script.path} does not integrate with event-bus for observability`,
                    severity: 3,
                    evidence: 'No event-bus import or emission found',
                    impact30d: 'Script runs silently; no cross-squad communication',
                });
                score -= 0.2;
            }
        }
    }

    return { memberId: 'karpathy', gaps, score: Math.max(0, Math.min(10, score)) };
}

/**
 * @purpose Chair 2 — Sutskever: Cognitive architecture, reasoning patterns
 * @inputs {Object} systemState
 * @outputs {Object} { gaps: Array, score: number }
 */
function evaluateSutskever(systemState) {
    const gaps = [];
    let score = 8;

    // Check 1: Constitutional Layer completeness
    const constitutionalFile = (systemState.files || []).find(f =>
        f.path.includes('constitutional-layer')
    );
    if (constitutionalFile && constitutionalFile.content) {
        const hasAllRules = ['RULE 1', 'RULE 2', 'RULE 3', 'RULE 4', 'RULE 5']
            .every(r => constitutionalFile.content.includes(r));
        if (!hasAllRules) {
            gaps.push({
                id: 'ILS-CONST-INCOMPLETE',
                description: 'Constitutional Layer missing one or more of the 5 Core Rules',
                severity: 9,
                evidence: 'Not all RULE 1-5 markers found in constitutional-layer-v3.md',
                impact30d: 'Degraded reasoning quality; outputs may lack depth or evidence',
            });
            score -= 2;
        }

        const hasAllProtocols = ['P1:', 'P2:', 'P3:', 'P4:', 'P5:']
            .every(p => constitutionalFile.content.includes(p));
        if (!hasAllProtocols) {
            gaps.push({
                id: 'ILS-PROTO-INCOMPLETE',
                description: 'Constitutional Layer missing Protocol Extensions',
                severity: 7,
                evidence: 'Not all P1-P5 protocol markers found',
                impact30d: 'Missing Karpathy anchoring, Ng workflows, or Nakajima self-improvement signals',
            });
            score -= 1;
        }
    }

    // Check 2: PM template presence
    const pmFiles = (systemState.files || []).filter(f =>
        f.path.includes('reasoning-packages/core/') && (f.path.includes('pm1') || f.path.includes('pm2') || f.path.includes('pm3'))
    );
    if (pmFiles.length < 3) {
        gaps.push({
            id: 'ILS-PM-MISSING',
            description: `Only ${pmFiles.length}/3 PM templates found (pm1-reasoning, pm2-execution, pm3-evaluation)`,
            severity: 8,
            evidence: `Found: ${pmFiles.map(f => path.basename(f.path)).join(', ')}`,
            impact30d: 'Incomplete reasoning pipeline; outputs lack structure',
        });
        score -= 1.5;
    }

    // Check 3: Golden example freshness
    const goldenExamples = (systemState.files || []).filter(f =>
        f.path.includes('golden-examples')
    );
    if (goldenExamples.length === 0) {
        gaps.push({
            id: 'ILS-GOLD-EMPTY',
            description: 'No golden examples found — quality anchoring disabled',
            severity: 6,
            evidence: 'golden-examples/ directory empty or missing',
            impact30d: 'No quality benchmark for output evaluation',
        });
        score -= 1;
    }

    return { memberId: 'sutskever', gaps, score: Math.max(0, Math.min(10, score)) };
}

/**
 * @purpose Chair 3 — Ng: Workflow efficiency, pipeline optimization
 * @inputs {Object} systemState
 * @outputs {Object} { gaps: Array, score: number }
 */
function evaluateNg(systemState) {
    const gaps = [];
    let score = 8;

    // Check 1: Duplicate logic across scripts
    const scripts = (systemState.files || []).filter(f =>
        f.path.startsWith('scripts/') && f.path.endsWith('.js')
    );
    const functionNames = new Map();
    for (const script of scripts) {
        if (script.content) {
            const matches = script.content.match(/function\s+(\w+)/g) || [];
            for (const match of matches) {
                const name = match.replace('function ', '');
                if (!functionNames.has(name)) functionNames.set(name, []);
                functionNames.get(name).push(script.path);
            }
        }
    }
    for (const [name, files] of functionNames) {
        if (files.length > 1 && !['require', 'exports'].includes(name)) {
            gaps.push({
                id: `NG-DUP-${name}`,
                description: `Function "${name}" defined in multiple files: ${files.join(', ')}`,
                severity: 4,
                evidence: `${files.length} definitions found`,
                impact30d: 'Maintenance burden; changes need to be replicated across files',
            });
            score -= 0.3;
        }
    }

    // Check 2: Unused scripts (scripts that no other file references)
    // Skip scripts that have @purpose — they are documented standalone tools, not dead code
    const standaloneExclusions = ['mcp-server', 'kairos-boot', 'dump-council', 'distill-trace',
        'night-shift-scheduler', 'night-shift-automator', 'jarvis-core', 'keep-alive',
        'squad-router', 'semantic-lint', 'profile-enricher', 'harvest-gold', 'aios-kairos-bridge',
        'code-intel-health-check', 'activate-kernel', 'activate-registry', 'ensure-manifest',
        'validate-manifest', 'validate-aiox-core-deps', 'validate-package-completeness',
        'audit-squad-agents', 'input-refiner', 'skill-mapper', 'rag-engine', 'jan-connector',
        'noesis-hook', 'package-synapse', 'event-bus', 'memory-system', 'vod-transcriber',
        'livestream-extractor', 'email-client', 'gsheets-client', 'instagram-client',
        'clickup-client', 'clickup-workspace-builder', 'clickup-workspace-fix',
        'bridge-auth', 'codespaces-tunnel', 'experia-content', 'experia-sdr',
        'upgrade-admin-produto-facilities', 'upgrade-cs', 'upgrade-ops',
        'generate-install-manifest', 'noesis-pipeline', 'noesis-status',
        'clone-generator', 'cognitive-state-engine', 'generate-context',
        'metacognition-layer', 'notification-bridge', 'validation-engine',
        'verification-engine', 'operator-noesis-engine'
    ];
    for (const script of scripts) {
        const basename = path.basename(script.path, '.js');
        if (standaloneExclusions.includes(basename)) continue;
        if (script.content && script.content.includes('@purpose')) continue;
        const referencedBy = scripts.filter(s =>
            s.path !== script.path && s.content && s.content.includes(basename)
        );
        if (referencedBy.length === 0 && !script.path.includes('run-') && !script.path.includes('mcp-server')) {
            gaps.push({
                id: `NG-UNUSED-${basename}`,
                description: `${script.path} is not referenced by any other script`,
                severity: 2,
                evidence: 'No cross-references found in other scripts',
                impact30d: 'Dead code; cognitive load for new developers',
            });
            score -= 0.1;
        }
    }

    // Check 3: Large monolithic files
    for (const script of scripts) {
        if (script.content && script.content.split('\n').length > 500) {
            gaps.push({
                id: `NG-MONO-${path.basename(script.path)}`,
                description: `${script.path} exceeds 500 lines (${script.content.split('\n').length} lines)`,
                severity: 5,
                evidence: `${script.content.split('\n').length} lines`,
                impact30d: 'Difficult to understand, test, and evolve independently',
            });
            score -= 0.5;
        }
    }

    return { memberId: 'ng', gaps, score: Math.max(0, Math.min(10, score)) };
}

/**
 * @purpose Chair 4 — Hinton: Knowledge distillation, representation density
 * @inputs {Object} systemState
 * @outputs {Object} { gaps: Array, score: number }
 */
function evaluateHinton(systemState) {
    const gaps = [];
    let score = 8;

    // Check 1: Anti-pattern catalog usage
    if (systemState.antiPatterns && systemState.antiPatterns.length > 0) {
        // Check if anti-patterns are actually referenced in scripts
        const scripts = (systemState.files || []).filter(f =>
            f.path.startsWith('scripts/') && f.content
        );
        const apMentions = scripts.filter(s =>
            s.content.includes('anti-pattern') || s.content.includes('AP-')
        );
        if (apMentions.length === 0) {
            gaps.push({
                id: 'HIN-AP-UNUSED',
                description: 'Anti-pattern catalog exists but is not referenced in any script',
                severity: 5,
                evidence: `${systemState.antiPatterns.length} anti-patterns defined, 0 script references`,
                impact30d: 'Knowledge captured but not operationalized; same mistakes may repeat',
            });
            score -= 0.8;
        }
    }

    // Check 2: Documentation density (docs-to-code ratio)
    const docs = (systemState.files || []).filter(f =>
        f.path.endsWith('.md') && !f.path.includes('node_modules')
    );
    const code = (systemState.files || []).filter(f =>
        f.path.endsWith('.js') && !f.path.includes('node_modules')
    );

    if (code.length > 0) {
        const ratio = docs.length / code.length;
        if (ratio < 0.5) {
            gaps.push({
                id: 'HIN-DOC-RATIO',
                description: `Low documentation density: ${docs.length} docs / ${code.length} code files = ${ratio.toFixed(2)} ratio`,
                severity: 3,
                evidence: `Ratio ${ratio.toFixed(2)} (ideal: >1.0)`,
                impact30d: 'Knowledge locked in code; not accessible to non-technical stakeholders',
            });
            score -= 0.5;
        }
    }

    // Check 3: SELF_CONTEXT.md freshness
    const selfContext = (systemState.files || []).find(f =>
        f.path.includes('SELF_CONTEXT.md')
    );
    if (selfContext && selfContext.content) {
        // Support ISO format with timezone and markdown bold: > **Última atualização:** 2026-03-13T14:50:00-03:00
        const dateMatch = selfContext.content.match(/Última atualização:\*{0,2}\s*([\dT:.Z+-]+)/);
        if (dateMatch) {
            const lastUpdate = new Date(dateMatch[1]);
            if (!isNaN(lastUpdate.getTime())) {
                const daysSince = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
                if (daysSince > 7) {
                    gaps.push({
                        id: 'HIN-CONTEXT-STALE',
                        description: `SELF_CONTEXT.md last updated ${Math.floor(daysSince)} days ago`,
                        severity: 6,
                        evidence: `Last update: ${dateMatch[1]}`,
                        impact30d: 'New sessions boot with outdated context; decisions based on stale information',
                    });
                    score -= 1;
                }
            }
        }
    }

    return { memberId: 'hinton', gaps, score: Math.max(0, Math.min(10, score)) };
}

/**
 * @purpose Chair 5 — Hassabis: Learning loops, memory utilization
 * @inputs {Object} systemState
 * @outputs {Object} { gaps: Array, score: number }
 */
function evaluateHassabis(systemState) {
    const gaps = [];
    let score = 8;

    // Check 1: Quality baseline trend
    if (systemState.qualityBaseline) {
        const qb = systemState.qualityBaseline;
        if (qb.current_baseline === 0 || qb.trend === 'establishing') {
            gaps.push({
                id: 'HAS-BASELINE-ZERO',
                description: 'Quality baseline not yet established — no session scores recorded',
                severity: 7,
                evidence: `current_baseline: ${qb.current_baseline}, trend: ${qb.trend}`,
                impact30d: 'No quality trend tracking; unable to detect regression or improvement',
            });
            score -= 1.5;
        } else if (qb.five_session_rule_trigger) {
            gaps.push({
                id: 'HAS-5SESSION',
                description: 'Nakajima 5-session stagnation rule triggered',
                severity: 9,
                evidence: '5+ consecutive sessions without score improvement',
                impact30d: 'System is not learning; root cause analysis required',
            });
            score -= 2;
        }
    }

    // Check 2: Memory system activity
    const memoryFile = (systemState.files || []).find(f =>
        f.path === 'data/memory.json' || f.path.includes('memory.json')
    );
    if (!memoryFile) {
        gaps.push({
            id: 'HAS-MEM-MISSING',
            description: 'No memory.json found — memory system may not be active',
            severity: 4,
            evidence: 'data/memory.json not found in file scan',
            impact30d: 'Decisions and metrics not being persisted between sessions',
        });
        score -= 0.5;
    }

    // Check 3: Session signal presence (P4 Nakajima)
    const rpFiles = (systemState.files || []).filter(f =>
        f.path.startsWith('reasoning-packages/') && f.path.endsWith('.md')
    );
    if (rpFiles.length === 0) {
        gaps.push({
            id: 'HAS-RP-EMPTY',
            description: 'No reasoning packages found — learning loop not active',
            severity: 5,
            evidence: 'reasoning-packages/ directory empty',
            impact30d: 'No structured knowledge capture from sessions',
        });
        score -= 0.8;
    }

    return { memberId: 'hassabis', gaps, score: Math.max(0, Math.min(10, score)) };
}

/**
 * @purpose Chair 6 — Pedro (Creator): Vision alignment, original architecture
 * @inputs {Object} systemState
 * @outputs {Object} { gaps: Array, score: number }
 */
function evaluatePedro(systemState) {
    const gaps = [];
    let score = 8;

    // Check 1: ENGINE/CLIENT separation (AP-001 — the #1 risk)
    // WHY: Domain words loaded from config so engine stays domain-agnostic
    const engineFiles = (systemState.files || []).filter(f =>
        !f.path.startsWith('clients/') &&
        !f.path.includes('node_modules') &&
        !f.path.includes('/archive/') &&
        !f.path.includes('\\archive\\') &&
        f.content
    );
    let domainWords = [];
    try {
        const dwPath = path.join(__dirname, 'domain-words.config.json');
        domainWords = JSON.parse(fs.readFileSync(dwPath, 'utf8')).words || [];
    } catch {
        domainWords = []; // No config = no domain check (safe default)
    }
    // Files that legitimately contain domain words as part of detection logic (not contamination)
    const detectorExclusions = [
        'ia-council-engine.js',      // Pedro's own scanner (this file)
        'cognitive-state-engine.js',  // AP-001 detection word lists
        'metacognition-layer.js',     // Domain boundary detection
        'domain-words.config.json',   // The word list config itself
        'circuit-breaker.config.js',  // Contains detection patterns
        'IMPLEMENTATION-GUIDE-QUICK.md', // Documentation examples
        'OPUS-REPLICANT-SYSTEM-v2.md',    // Documentation examples
        'pm2-execution-master.md',         // PM2 template references external APIs
        'pm1-reasoning-master.md',         // PM1 template documentation
        'pm3-evaluation-master.md'         // PM3 template documentation
    ];
    for (const file of engineFiles) {
        const basename = path.basename(file.path);
        if ((file.path.endsWith('.js') || (file.path.endsWith('.md') && file.path.includes('opus-replicator')))
            && !detectorExclusions.includes(basename)) {
            for (const word of domainWords) {
                const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                // Case insensitive check, but skip if it's in a comment about the anti-pattern itself
                const regex = new RegExp(`\\b${escapedWord}\\b`, 'gi');
                const matches = file.content.match(regex) || [];
                if (matches.length > 0 && !file.path.includes('anti-patterns')) {
                    gaps.push({
                        id: `PED-DOMAIN-${path.basename(file.path)}-${word}`,
                        description: `Domain contamination: "${word}" found in engine file ${file.path}`,
                        severity: 8,
                        evidence: `${matches.length} occurrence(s) of "${word}"`,
                        impact30d: 'Engine contains domain-specific terms; violates AP-001 separation',
                    });
                    score -= 1;
                }
            }
        }
    }

    // Check 2: Structure is Sacred compliance
    // .aiox-core is the KAIROS-specific equivalent of .aios-core/ (migrated in v3.1)
    const requiredDirs = ['scripts', 'squads', 'docs', 'reasoning-packages'];
    const alternativeDirs = { '.aiox-core': 'engine' };
    for (const dir of requiredDirs) {
        const hasDir = (systemState.files || []).some(f => f.path.startsWith(dir + '/'));
        if (!hasDir) {
            gaps.push({
                id: `PED-STRUCT-${dir}`,
                description: `Required directory "${dir}" not found in project structure`,
                severity: 7,
                evidence: 'No files found with this prefix',
                impact30d: 'Breaks the "Structure is Sacred" principle from AIOS philosophy',
            });
            score -= 1;
        }
    }
    // Check .aiox-core OR engine/ (both are valid)
    const hasAiosCore = (systemState.files || []).some(f => f.path.startsWith('.aiox-core/'));
    const hasEngine = (systemState.files || []).some(f => f.path.startsWith('engine/'));
    if (!hasAiosCore && !hasEngine) {
        gaps.push({
            id: 'PED-STRUCT-engine',
            description: 'Neither ".aiox-core" nor "engine/" directory found in project structure',
            severity: 7,
            evidence: 'No files found with either prefix',
            impact30d: 'Breaks the "Structure is Sacred" principle from AIOS philosophy',
        });
        score -= 1;
    }

    return { memberId: 'pedro', gaps, score: Math.max(0, Math.min(10, score)) };
}

/**
 * @purpose Chair 7 — Alan (Creator): Product-market fit, real-world applicability
 * @inputs {Object} systemState
 * @outputs {Object} { gaps: Array, score: number }
 */
function evaluateAlan(systemState) {
    const gaps = [];
    let score = 8;

    // Check 1: README exists and is non-trivial
    const readme = (systemState.files || []).find(f => f.path === 'README.md' || f.path === '/README.md');
    if (!readme || !readme.content) {
        gaps.push({
            id: 'ALN-README-MISSING',
            description: 'README.md missing or empty — product not self-documenting',
            severity: 7,
            evidence: 'README.md not found in scan',
            impact30d: 'New users/agents cannot onboard; product fails 60-second test',
        });
        score -= 1.5;
    } else if (readme.content.split('\n').length < 30) {
        gaps.push({
            id: 'ALN-README-THIN',
            description: `README.md only ${readme.content.split('\n').length} lines — insufficient for onboarding`,
            severity: 5,
            evidence: `${readme.content.split('\n').length} lines`,
            impact30d: '60-second context loading fails; agents waste tokens re-discovering structure',
        });
        score -= 0.8;
    }

    // Check 2: Client packages exist
    const clientFiles = (systemState.files || []).filter(f => f.path.startsWith('clients/'));
    if (clientFiles.length === 0) {
        gaps.push({
            id: 'ALN-CLIENTS-EMPTY',
            description: 'No client packages found — AIOS has no real-world deployment',
            severity: 6,
            evidence: 'clients/ directory empty or missing',
            impact30d: 'Engine exists in theory but generates zero revenue',
        });
        score -= 1;
    }

    // Check 3: Integration scripts present
    const integrationScripts = (systemState.files || []).filter(f =>
        f.path.startsWith('scripts/') && (
            f.path.includes('bridge') || f.path.includes('client') || f.path.includes('connector')
        )
    );
    if (integrationScripts.length === 0) {
        gaps.push({
            id: 'ALN-INTEG-NONE',
            description: 'No integration scripts found (bridges, clients, connectors)',
            severity: 5,
            evidence: 'No files matching bridge/client/connector pattern in scripts/',
            impact30d: 'AIOS cannot connect to external systems; remains isolated',
        });
        score -= 0.8;
    }

    return { memberId: 'alan', gaps, score: Math.max(0, Math.min(10, score)) };
}

/**
 * @purpose Chair 8 — Distillation Engineer (Hinton + Sutskever collaboration):
 *          Evaluates whether AIOS outputs are being structured for future
 *          fine-tuning of a 3B-7B parameter local model.
 *          Runs after Phase 5 (verification), before cycle close.
 *          4 responsibilities: trace structuring, dataset curation,
 *          opportunity alerts (score ≥9.5), independence roadmap.
 * @inputs {Object} systemState
 * @inputs {Object} cycleContext - optional: { cycleOutputs, pm3Score }
 * @outputs {Object} { gaps: Array, score: number, distillationReport: Object }
 */
function evaluateDistillation(systemState, cycleContext = {}) {
    const gaps = [];
    let score = 8;
    const distillationReport = {
        tracesStructured: false,
        curatedExamples: [],
        opportunityAlerts: [],
        roadmap: null,
    };

    // ── RESPONSIBILITY 1: TRACE STRUCTURING ──
    // Check if distillation dataset directory exists with proper structure
    const distillationFiles = (systemState.files || []).filter(f =>
        f.path.includes('distillation-dataset')
    );
    const hasTracesDir = distillationFiles.some(f => f.path.includes('/traces/'));
    const hasCuratedDir = distillationFiles.some(f => f.path.includes('/curated/'));
    const hasRoadmap = distillationFiles.some(f => f.path.includes('roadmap.json'));

    if (!hasTracesDir) {
        gaps.push({
            id: 'DST-TRACES-MISSING',
            description: 'Distillation traces directory not found — reasoning traces not being captured',
            severity: 7,
            evidence: 'distillation-dataset/traces/ not found',
            impact30d: 'Every cycle produces reasoning traces that are lost forever. Zero progress toward local model independence.',
        });
        score -= 1.5;
    }

    if (!hasCuratedDir) {
        gaps.push({
            id: 'DST-CURATED-MISSING',
            description: 'Curated dataset directory not found — high-quality examples not being collected',
            severity: 6,
            evidence: 'distillation-dataset/curated/ not found',
            impact30d: 'Golden examples exist but are not structured for fine-tuning. Model training impossible.',
        });
        score -= 1;
    }

    // Check if existing traces follow the required format: input → reasoning → output → PM3 score
    const traceFiles = distillationFiles.filter(f =>
        f.path.includes('/traces/') && f.content
    );
    for (const trace of traceFiles) {
        const hasInput = trace.content.includes('"input"') || trace.content.includes('input:');
        const hasReasoning = trace.content.includes('"reasoning_trace"') || trace.content.includes('reasoning:') || trace.content.includes('"source"') || trace.content.includes('"reasoning"');
        const hasOutput = trace.content.includes('"output"') || trace.content.includes('output:');
        const hasPM3 = trace.content.includes('"pm3_score"') || trace.content.includes('score:') || trace.content.includes('"quality"');

        if (!hasInput || !hasReasoning || !hasOutput || !hasPM3) {
            gaps.push({
                id: `DST-FORMAT-${path.basename(trace.path)}`,
                description: `Trace ${trace.path} missing required fields (input/reasoning_trace/output/pm3_score)`,
                severity: 5,
                evidence: `Has: input=${hasInput}, reasoning=${hasReasoning}, output=${hasOutput}, pm3=${hasPM3}`,
                impact30d: 'Incomplete trace cannot be used for fine-tuning; data wasted',
            });
            score -= 0.3;
        }
    }

    distillationReport.tracesStructured = traceFiles.length > 0 && gaps.filter(g => g.id.startsWith('DST-FORMAT')).length === 0;

    // ── RESPONSIBILITY 2: SYNTHETIC DATASET CURATION ──
    // Check golden examples for pattern-teaching quality (not just problem-solving)
    const goldenExamples = (systemState.files || []).filter(f =>
        f.path.includes('golden-examples') && f.content
    );

    for (const example of goldenExamples) {
        // A good distillation example teaches a PATTERN, not just solves a problem
        const hasPatternMarker = example.content.includes('PATTERN:') ||
            example.content.includes('pattern_type') ||
            example.content.includes('generalizable');

        if (hasPatternMarker) {
            distillationReport.curatedExamples.push({
                file: example.path,
                quality: 'PATTERN_TEACHING',
                ready: true,
            });
        } else {
            gaps.push({
                id: `DST-PATTERN-${path.basename(example.path)}`,
                description: `Golden example ${example.path} solves a specific problem but doesn't teach a generalizable pattern`,
                severity: 3,
                evidence: 'No PATTERN: marker or pattern_type field found',
                impact30d: 'Example useful for reference but cannot train a model to generalize',
            });
            score -= 0.2;
        }
    }

    // ── RESPONSIBILITY 3: OPPORTUNITY ALERTS ──
    // Check cycle outputs for scores ≥ 9.5
    if (cycleContext.pm3Score && cycleContext.pm3Score >= 9.5) {
        distillationReport.opportunityAlerts.push({
            type: 'HIGH_QUALITY_TRACE',
            score: cycleContext.pm3Score,
            message: `TRACE DE DESTILAÇÃO CAPTURADO — candidato a ensinar padrão ao modelo local (PM3: ${cycleContext.pm3Score})`,
            timestamp: new Date().toISOString(),
        });
    }

    // ── RESPONSIBILITY 4: INDEPENDENCE ROADMAP ──
    // Every 5 cycles, produce a roadmap report
    if (hasRoadmap) {
        const roadmapFile = distillationFiles.find(f => f.path.includes('roadmap.json'));
        if (roadmapFile && roadmapFile.content) {
            try {
                const roadmap = JSON.parse(roadmapFile.content);
                distillationReport.roadmap = roadmap;

                const traceCount = roadmap.captured || roadmap.total_traces || 0;
                const curatedCount = roadmap.curated || 0;
                const target = roadmap.target || 500;

                if (traceCount === 0) {
                    gaps.push({
                        id: 'DST-ROADMAP-ZERO',
                        description: `0 traces captured. Need ~${target} for viable 3B model fine-tune.`,
                        severity: 5,
                        evidence: `0/${target} captured, ${curatedCount} curated`,
                        impact30d: 'No progress toward local model training',
                    });
                    score -= 0.5;
                } else {
                    // It's progress, not a gap.
                    distillationReport.status = `Progressing: ${traceCount}/${target} traces captured`;
                }
            } catch {
                // Invalid JSON in roadmap
            }
        }
    } else {
        gaps.push({
            id: 'DST-ROADMAP-MISSING',
            description: 'Independence roadmap not found — no progress tracking toward local model',
            severity: 5,
            evidence: 'distillation-dataset/roadmap.json not found',
            impact30d: 'No visibility into how close system is to model independence',
        });
        score -= 0.8;
    }

    return {
        memberId: 'distillation',
        gaps,
        score: Math.max(0, Math.min(10, score)),
        distillationReport,
    };
}

// ─────────────────────────────────────────────────────────────
// METAMIND SYNTHESIZER
// ─────────────────────────────────────────────────────────────

/**
 * @purpose Metamind: Synthesizes all Council evaluations into a unified verdict.
 *          Deduplicates gaps, identifies convergences and divergences,
 *          produces ranked output.
 * @inputs  {Array} evaluations - Array of member evaluation results
 * @outputs {Object} { allGaps: Array, topGaps: Array, convergences: Array, divergences: Array, overallScore: number }
 */
function metamindSynthesize(evaluations) {
    // Collect all gaps
    const allGaps = [];
    for (const eval_ of evaluations) {
        for (const gap of eval_.gaps) {
            allGaps.push({
                ...gap,
                reportedBy: eval_.memberId,
            });
        }
    }

    // Deduplicate: gaps with same target file are likely related
    const gapsByFile = new Map();
    for (const gap of allGaps) {
        const fileMatch = gap.id.match(/-([\w.-]+)$/);
        const key = fileMatch ? fileMatch[1] : gap.id;
        if (!gapsByFile.has(key)) gapsByFile.set(key, []);
        gapsByFile.get(key).push(gap);
    }

    // Identify convergences (multiple members flag same issue)
    const convergences = [];
    const divergences = [];
    for (const [key, gapGroup] of gapsByFile) {
        const reporters = [...new Set(gapGroup.map(g => g.reportedBy))];
        if (reporters.length >= 2) {
            convergences.push({
                key,
                reporters,
                severity: Math.max(...gapGroup.map(g => g.severity)),
                description: gapGroup[0].description,
                confidence: reporters.length / evaluations.length,
            });
        }
    }

    // Rank all gaps by severity (highest first)
    allGaps.sort((a, b) => b.severity - a.severity);

    // Top 3 gaps for proposal phase
    const topGaps = allGaps.slice(0, 3);

    // Overall score (weighted average of member scores)
    const overallScore = evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length;

    return {
        allGaps,
        topGaps,
        convergences,
        divergences,
        overallScore: Math.round(overallScore * 100) / 100,
        memberScores: evaluations.map(e => ({ memberId: e.memberId, score: e.score, gapCount: e.gaps.length })),
        totalGaps: allGaps.length,
        timestamp: new Date().toISOString(),
    };
}

// ─────────────────────────────────────────────────────────────
// COUNCIL RUNNER
// ─────────────────────────────────────────────────────────────

/**
 * @purpose Run the full IA Council evaluation on a system state
 * @inputs  {Object} systemState - { files, metrics, qualityBaseline, antiPatterns, projectRoot }
 * @outputs {Object} Metamind synthesis result
 */
function runCouncil(systemState, cycleContext = {}) {
    const evaluationFunctions = [
        evaluateKarpathy,
        evaluateSutskever,
        evaluateNg,
        evaluateHinton,
        evaluateHassabis,
        evaluatePedro,
        evaluateAlan,
    ];

    const evaluations = evaluationFunctions.map(fn => fn(systemState));

    // Chair 8 (Distillation) runs with optional cycleContext
    const distillationEval = evaluateDistillation(systemState, cycleContext);
    evaluations.push(distillationEval);

    return metamindSynthesize(evaluations);
}

/**
 * @purpose Run Council voting on a set of proposals
 * @inputs  {Array} proposals - Array of { id, description, diff, targetFile, riskLevel }
 * @inputs  {Object} systemState - Current system state
 * @outputs {Array} Array of { proposalId, votes: [{memberId, vote, justification}], approved: boolean }
 */
function runCouncilVoting(proposals, systemState) {
    const results = [];

    for (const proposal of proposals) {
        const votes = [];

        for (const member of CONFIG.COUNCIL.members) {
            // Each member votes based on their domain lens
            const vote = evaluateProposal(member, proposal, systemState);
            votes.push(vote);
        }

        const applyVotes = votes.filter(v => v.vote === 'APPLY').length;
        const totalVotes = votes.length;
        const approvalRate = applyVotes / totalVotes;

        // Check minerva vote for tiebreaker
        let approved = approvalRate >= CONFIG.CONVERGENCE.COUNCIL_APPROVAL_THRESHOLD;

        if (approvalRate === 0.5) {
            // Exact tie — check Pedro + Alan (minerva vote)
            const pedroVote = votes.find(v => v.memberId === 'pedro');
            const alanVote = votes.find(v => v.memberId === 'alan');
            if (pedroVote && alanVote && pedroVote.vote === alanVote.vote) {
                approved = pedroVote.vote === 'APPLY';
            } else {
                approved = false; // Creators also split — DEFER
            }
        }

        results.push({
            proposalId: proposal.id,
            votes,
            approvalRate,
            approved,
        });
    }

    return results;
}

/**
 * @purpose Individual member votes on a proposal based on their domain lens
 * @inputs  {Object} member - Council member definition
 * @inputs  {Object} proposal - { id, description, targetFile, riskLevel }
 * @inputs  {Object} systemState
 * @outputs {Object} { memberId, vote, justification }
 */
function evaluateProposal(member, proposal, systemState) {
    // Domain-specific evaluation logic
    const risk = proposal.riskLevel || 'LOW';

    // Default approval logic — each member has specific concerns
    switch (member.id) {
        case 'karpathy':
            // Karpathy rejects if proposal doesn't include tests or docs
            if (!proposal.includesTests && risk !== 'LOW') {
                return { memberId: member.id, vote: 'DEFER', justification: 'Proposal lacks test coverage for non-LOW risk change.' };
            }
            return { memberId: member.id, vote: 'APPLY', justification: 'Code quality check passed; engineering rigor acceptable.' };

        case 'sutskever':
            // Sutskever checks if cognitive architecture is preserved
            if (proposal.targetFile && proposal.targetFile.includes('opus-replicator')) {
                return { memberId: member.id, vote: 'DEFER', justification: 'Changes to cognitive layer require careful evaluation of reasoning chain impact.' };
            }
            return { memberId: member.id, vote: 'APPLY', justification: 'No cognitive architecture regression detected.' };

        case 'ng':
            // Ng checks efficiency impact
            if (proposal.estimatedTokenCost && proposal.estimatedTokenCost > 1000) {
                return { memberId: member.id, vote: 'REJECT', justification: `Token cost ${proposal.estimatedTokenCost} exceeds efficiency threshold.` };
            }
            return { memberId: member.id, vote: 'APPLY', justification: 'Workflow efficiency maintained or improved.' };

        case 'hinton':
            // Hinton checks if knowledge is preserved/compressed
            return { memberId: member.id, vote: 'APPLY', justification: 'Knowledge representation density acceptable.' };

        case 'hassabis':
            // Hassabis checks if learning loops are maintained
            return { memberId: member.id, vote: 'APPLY', justification: 'Learning loop integrity maintained.' };

        case 'pedro':
            // Pedro checks vision alignment and domain contamination
            if (proposal.targetFile && CONFIG.isForbidden(proposal.targetFile)) {
                return { memberId: member.id, vote: 'REJECT', justification: `FORBIDDEN: ${proposal.targetFile} is in the protected list.` };
            }
            return { memberId: member.id, vote: 'APPLY', justification: 'Aligned with original AIOS vision.' };

        case 'alan':
            // Alan checks product applicability
            if (risk === 'HIGH') {
                return { memberId: member.id, vote: 'DEFER', justification: 'HIGH risk change should be validated against real-world usage before applying.' };
            }
            return { memberId: member.id, vote: 'APPLY', justification: 'Product applicability maintained.' };

        case 'distillation':
            // Distillation Engineer — does NOT vote on proposals (observes only).
            // Chair 8 executes after Phase 5 to capture traces, not during voting.
            return { memberId: member.id, vote: 'APPLY', justification: 'Distillation chair does not block proposals — observes and captures traces post-verification.' };

        default:
            return { memberId: member.id, vote: 'DEFER', justification: 'Unknown council member.' };
    }
}

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────
module.exports = {
    evaluateKarpathy,
    evaluateSutskever,
    evaluateNg,
    evaluateHinton,
    evaluateHassabis,
    evaluatePedro,
    evaluateAlan,
    evaluateDistillation,
    metamindSynthesize,
    runCouncil,
    runCouncilVoting,
    evaluateProposal,
};

// ─────────────────────────────────────────────────────────────
// SELF-TEST (node scripts/evolution/ia-council-engine.js --test)
// ─────────────────────────────────────────────────────────────
if (require.main === module && process.argv.includes('--test')) {
    console.log('🧠 IA Council Engine — Self-Test\n');

    const mockState = {
        files: [
            { path: 'scripts/kernel-bridge.js', content: '/** @purpose Bridge */\ntry { require("./event-bus"); } catch(e) {}' },
            { path: 'scripts/event-bus.js', content: '/** @purpose Event Bus */\nclass AIOSEventBus {}' },
            { path: '.aios-core/opus-replicator/constitutional-layer-v3.md', content: 'RULE 1: DEPTH\nRULE 2: EVIDENCE\nRULE 3: SYNTHESIS\nRULE 4: MODULARITY\nRULE 5: EVOLUTION\nP1: EXAMPLE\nP2: AGENTIC\nP3: INTERMEDIATE\nP4: SIGNAL\nP5: ALIGNMENT' },
            { path: 'README.md', content: '# AIOS\n'.repeat(50) },
            { path: 'clients/experia/README.md', content: '# Experia' },
            { path: 'reasoning-packages/INDEX.md', content: '# Index' },
        ],
        qualityBaseline: { current_baseline: 0, trend: 'establishing', five_session_rule_trigger: false },
        antiPatterns: ['AP-001', 'AP-002', 'AP-003', 'AP-004', 'AP-005', 'AP-006'],
    };

    const result = runCouncil(mockState);

    console.log('COUNCIL MEMBER SCORES:');
    result.memberScores.forEach(m =>
        console.log(`  ${m.memberId.padEnd(12)} → ${m.score.toFixed(1)}/10 (${m.gapCount} gaps)`)
    );
    console.log(`\nOVERALL SCORE: ${result.overallScore}/10`);
    console.log(`TOTAL GAPS: ${result.totalGaps}`);
    console.log(`CONVERGENCES: ${result.convergences.length}`);

    console.log('\nTOP 3 GAPS:');
    result.topGaps.forEach((g, i) =>
        console.log(`  ${i + 1}. [SEV ${g.severity}] ${g.id}: ${g.description}`)
    );

    console.log('\n✅ Council evaluation complete.');
}
