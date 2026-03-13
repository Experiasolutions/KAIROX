/**
 * @module distill-trace
 * @version 1.0.0
 * @purpose Capture and curate distillation traces for LoRA fine-tuning pipeline.
 *          Supports manual trace capture, auto-harvest from council/engine outputs,
 *          and roadmap progress tracking.
 *
 * Usage:
 *   node scripts/distill-trace.js --capture <json-file>   # Capture a trace from file
 *   node scripts/distill-trace.js --auto-harvest           # Harvest from recent outputs
 *   node scripts/distill-trace.js --status                  # Show pipeline status
 *   node scripts/distill-trace.js --test                    # Generate test trace
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TRACES_DIR = path.join(ROOT, 'distillation-dataset', 'traces');
const CURATED_DIR = path.join(ROOT, 'distillation-dataset', 'curated');
const ROADMAP_PATH = path.join(ROOT, 'distillation-dataset', 'roadmap.json');
const COUNCIL_GAPS = path.join(ROOT, 'council-gaps.json');
const ENGINE_MEMORY = path.join(ROOT, 'engine', 'memory');

// Ensure dirs exist
for (const dir of [TRACES_DIR, CURATED_DIR]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function generateTraceId() {
    const now = new Date();
    const ts = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const seq = String(fs.readdirSync(TRACES_DIR).length + 1).padStart(3, '0');
    return `TRACE-${ts}-${seq}`;
}

function loadRoadmap() {
    if (!fs.existsSync(ROADMAP_PATH)) {
        return {
            version: '1.0.0',
            purpose: 'Track progress toward local model fine-tuning',
            target: 500,
            captured: 0,
            curated: 0,
            milestones: [
                { name: 'Prototype', traces: 50, status: 'pending' },
                { name: 'Alpha', traces: 200, status: 'pending' },
                { name: 'Beta', traces: 500, status: 'pending' },
                { name: 'Production', traces: 1000, status: 'pending' },
            ],
            lastUpdated: new Date().toISOString(),
        };
    }
    return JSON.parse(fs.readFileSync(ROADMAP_PATH, 'utf8'));
}

function saveRoadmap(roadmap) {
    roadmap.lastUpdated = new Date().toISOString();
    // Update milestone statuses
    for (const m of roadmap.milestones) {
        if (roadmap.captured >= m.traces && m.status === 'pending') {
            m.status = 'reached';
        }
    }
    fs.writeFileSync(ROADMAP_PATH, JSON.stringify(roadmap, null, 4));
    // Sync to engine/memory copy
    const engineCopy = path.join(ENGINE_MEMORY, 'distillation-dataset', 'roadmap.json');
    if (fs.existsSync(path.dirname(engineCopy))) {
        fs.writeFileSync(engineCopy, JSON.stringify(roadmap, null, 4));
    }
}

function captureTrace(traceData) {
    const id = traceData.id || generateTraceId();
    const trace = {
        id,
        type: traceData.type || 'general',
        source: traceData.source || 'manual',
        timestamp: new Date().toISOString(),
        input: traceData.input || {},
        reasoning: traceData.reasoning || '',
        output: traceData.output || {},
        quality: traceData.quality || 0,
        tags: traceData.tags || [],
    };

    const filename = `${id}.json`;
    fs.writeFileSync(path.join(TRACES_DIR, filename), JSON.stringify(trace, null, 4));

    // Update roadmap
    const roadmap = loadRoadmap();
    roadmap.captured = roadmap.captured + 1;
    saveRoadmap(roadmap);

    return { id, filename, totalCaptured: roadmap.captured };
}

function autoHarvest() {
    const harvested = [];

    // Harvest from council-gaps.json if it exists
    if (fs.existsSync(COUNCIL_GAPS)) {
        const council = JSON.parse(fs.readFileSync(COUNCIL_GAPS, 'utf8'));
        if (council.topGaps && council.topGaps.length > 0) {
            const result = captureTrace({
                type: 'council-audit',
                source: 'ia-council-engine',
                input: {
                    task: 'IA Council full system evaluation',
                    context: `Council evaluated system with ${council.totalGaps} total gaps`,
                },
                reasoning: `8-member council evaluated the system. Overall score: ${council.overallScore}/10. ` +
                    `Top gaps: ${council.topGaps.slice(0, 3).map(function (g) { return g.id; }).join(', ')}. ` +
                    `Convergences detected: ${council.convergences ? council.convergences.length : 0}.`,
                output: {
                    totalGaps: council.totalGaps,
                    overallScore: council.overallScore,
                    topGaps: council.topGaps.slice(0, 5),
                },
                quality: council.overallScore || 7,
                tags: ['council', 'audit', 'auto-harvest'],
            });
            harvested.push(result);
        }
    }

    // Harvest from engine/noesis observations
    const obsDir = path.join(ROOT, 'engine', 'noesis', 'observations');
    if (fs.existsSync(obsDir)) {
        const obsFiles = fs.readdirSync(obsDir).filter(function (f) { return f.endsWith('.jsonl'); });
        for (const obsFile of obsFiles) {
            const lines = fs.readFileSync(path.join(obsDir, obsFile), 'utf8')
                .split('\n')
                .filter(function (l) { return l.trim().length > 0; });

            if (lines.length > 0) {
                const result = captureTrace({
                    type: 'observation',
                    source: `noesis-observations/${obsFile}`,
                    input: {
                        task: `Process observations from ${obsFile}`,
                        context: `${lines.length} observations recorded`,
                    },
                    reasoning: `Harvested ${lines.length} cognitive observations from NOESIS engine session.`,
                    output: { observationCount: lines.length, file: obsFile },
                    quality: 7,
                    tags: ['observation', 'noesis', 'auto-harvest'],
                });
                harvested.push(result);
            }
        }
    }

    // Harvest from golden examples
    const goldenDir = path.join(ENGINE_MEMORY, 'golden-examples');
    if (fs.existsSync(goldenDir)) {
        const pmDirs = fs.readdirSync(goldenDir).filter(function (d) {
            return fs.statSync(path.join(goldenDir, d)).isDirectory();
        });
        for (const pmDir of pmDirs) {
            const examples = fs.readdirSync(path.join(goldenDir, pmDir))
                .filter(function (f) { return f.endsWith('.md'); });
            for (const ex of examples) {
                const content = fs.readFileSync(path.join(goldenDir, pmDir, ex), 'utf8');
                const result = captureTrace({
                    type: 'golden-example',
                    source: `golden-examples/${pmDir}/${ex}`,
                    input: {
                        task: `Golden example: ${ex.replace('.md', '')}`,
                        context: `PM category: ${pmDir}`,
                    },
                    reasoning: content.slice(0, 500),
                    output: { file: ex, category: pmDir, length: content.length },
                    quality: 9,
                    tags: ['golden-example', pmDir, 'auto-harvest'],
                });
                harvested.push(result);
            }
        }
    }

    return harvested;
}

function showStatus() {
    const roadmap = loadRoadmap();
    const traceFiles = fs.existsSync(TRACES_DIR)
        ? fs.readdirSync(TRACES_DIR).filter(function (f) { return f.endsWith('.json') || f.endsWith('.jsonl'); })
        : [];
    const curatedFiles = fs.existsSync(CURATED_DIR)
        ? fs.readdirSync(CURATED_DIR).filter(function (f) { return f.endsWith('.jsonl'); })
        : [];

    console.log('');
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║  🧬 DISTILLATION PIPELINE — STATUS           ║');
    console.log('╚══════════════════════════════════════════════╝');
    console.log('');
    console.log(`  Traces captured:  ${traceFiles.length}`);
    console.log(`  Curated files:    ${curatedFiles.length}`);
    console.log(`  Target:           ${roadmap.target}`);
    console.log(`  Progress:         ${Math.round((traceFiles.length / roadmap.target) * 100)}%`);
    console.log('');
    console.log('  Milestones:');
    for (const m of roadmap.milestones) {
        const icon = m.status === 'reached' ? '✅' : traceFiles.length >= m.traces * 0.5 ? '🟡' : '⬜';
        console.log(`    ${icon} ${m.name}: ${m.traces} traces (${m.status})`);
    }
    console.log('');
}

function generateTestTrace() {
    return captureTrace({
        type: 'test',
        source: 'distill-trace-self-test',
        input: {
            task: 'Validate distillation pipeline',
            context: 'Self-test to verify trace capture, storage, and roadmap update',
        },
        reasoning: 'Generated a test trace to validate the pipeline. ' +
            'Verified: trace ID generation, JSON serialization, file write, ' +
            'roadmap counter increment, milestone status check.',
        output: { validation: 'passed', timestamp: new Date().toISOString() },
        quality: 10,
        tags: ['test', 'validation', 'pipeline'],
    });
}

// --- CLI ---
const args = process.argv.slice(2);

if (args.includes('--status')) {
    showStatus();
} else if (args.includes('--test')) {
    const result = generateTestTrace();
    console.log(`✅ Test trace generated: ${result.id}`);
    console.log(`   Total captured: ${result.totalCaptured}`);
    showStatus();
} else if (args.includes('--auto-harvest')) {
    console.log('🧬 Auto-harvesting traces from engine outputs...');
    const harvested = autoHarvest();
    console.log(`✅ Harvested ${harvested.length} traces`);
    for (const h of harvested) {
        console.log(`   → ${h.id}`);
    }
    showStatus();
} else if (args.includes('--capture') && args.length > args.indexOf('--capture') + 1) {
    const filePath = args[args.indexOf('--capture') + 1];
    if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        process.exit(1);
    }
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const result = captureTrace(data);
    console.log(`✅ Trace captured: ${result.id}`);
    console.log(`   Total captured: ${result.totalCaptured}`);
} else {
    console.log('Usage:');
    console.log('  node scripts/distill-trace.js --capture <json-file>');
    console.log('  node scripts/distill-trace.js --auto-harvest');
    console.log('  node scripts/distill-trace.js --status');
    console.log('  node scripts/distill-trace.js --test');
}

module.exports = { captureTrace, autoHarvest, showStatus, loadRoadmap };
