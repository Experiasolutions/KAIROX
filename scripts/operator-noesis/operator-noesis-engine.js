/** @purpose KAIROS script: operator-noesis-engine */
/**
 * operator-noesis-engine.js — Orchestrator for Operator Noesis
 * 
 * Second-order learning: learns HOW to learn about the operator.
 * While Jarvis Layer collects data ABOUT Gabriel,
 * Operator Noesis evaluates WHICH collection methods work best.
 * 
 * @requires learning-model-evaluator.js
 * @requires inference-validator.js
 * @requires model-updater.js
 * @requires operator-noesis-gate.js
 * 
 * @version 1.0.0
 * @status initialized — waiting for Jarvis Layer
 */

const fs = require('fs');
const path = require('path');

// Paths
const ROOT = path.resolve(__dirname, '../..');
const NOESIS_DIR = path.join(ROOT, '.aiox-core/noesis-operator');
const MODEL_PATH = path.join(NOESIS_DIR, 'learning-model.json');
const AUDIT_PATH = path.join(NOESIS_DIR, 'learning-audit-log.json');

// Jarvis Layer paths (read-only)
const JARVIS_CORE = path.join(ROOT, 'scripts/jarvis-core.js');
const PROFILE_ENRICHER = path.join(ROOT, 'scripts/profile-enricher.js');
const OPERATOR_PROFILE = path.join(ROOT, '.aiox-core/memory/operator-profile.json');

const { evaluateModel } = require('./learning-model-evaluator');
const { validateInferences } = require('./inference-validator');
const { updateModel } = require('./model-updater');
const { runGate } = require('./operator-noesis-gate');

/**
 * Check if Jarvis Layer is installed and operational
 */
function checkJarvisLayer() {
    const jarvisFiles = [JARVIS_CORE, PROFILE_ENRICHER, OPERATOR_PROFILE];
    const status = jarvisFiles.map(f => ({
        file: path.basename(f),
        exists: fs.existsSync(f)
    }));

    const allPresent = status.every(s => s.exists);
    return { operational: allPresent, files: status };
}

/**
 * Load the current learning model
 */
function loadModel() {
    if (!fs.existsSync(MODEL_PATH)) {
        throw new Error('Learning model not found. Run initialization first.');
    }
    return JSON.parse(fs.readFileSync(MODEL_PATH, 'utf-8'));
}

/**
 * Log an event to the audit trail
 */
function logAudit(event, details, modelSnapshot = null) {
    const audit = JSON.parse(fs.readFileSync(AUDIT_PATH, 'utf-8'));
    const entry = {
        timestamp: new Date().toISOString(),
        event,
        details,
        source: 'operator-noesis-engine'
    };
    if (modelSnapshot) entry.modelSnapshot = modelSnapshot;
    audit.entries.push(entry);
    fs.writeFileSync(AUDIT_PATH, JSON.stringify(audit, null, 2));
}

/**
 * Main execution cycle
 * Called after each significant operator interaction session
 */
async function runCycle() {
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║   🧠 Operator Noesis — Learning Cycle            ║');
    console.log('╚══════════════════════════════════════════════════╝\n');

    // Step 1: Check Jarvis Layer
    const jarvis = checkJarvisLayer();
    if (!jarvis.operational) {
        console.log('  ⏸️  Jarvis Layer not operational yet.');
        jarvis.files.forEach(f => {
            console.log(`     ${f.exists ? '✅' : '❌'} ${f.file}`);
        });
        console.log('\n  Operator Noesis is ready. Waiting for Jarvis Layer.\n');
        logAudit('CYCLE_SKIPPED', 'Jarvis Layer not operational');
        return { status: 'waiting', reason: 'jarvis-not-installed' };
    }

    // Step 2: Load model
    const model = loadModel();
    console.log(`  📊 Model v${model.version} loaded`);
    console.log(`  📈 Sessions observed: ${model.metrics.sessionsObserved}`);

    // Step 3: Evaluate which data sources performed best
    const evaluation = evaluateModel(model);
    console.log(`  🔍 Evaluation: accuracy=${evaluation.accuracy}`);

    // Step 4: Validate active predictions
    const validation = validateInferences(model);
    console.log(`  🎯 Predictions: ${validation.confirmed} confirmed, ${validation.falsified} falsified`);

    // Step 5: Update model weights based on evidence
    const updatedModel = updateModel(model, evaluation, validation);
    console.log(`  ⚖️  Weights adjusted: ${JSON.stringify(updatedModel.weightChanges)}`);

    // Step 6: Gate check
    const gate = runGate(updatedModel);
    console.log(`  🚦 Gate: ${gate.passed ? 'PASSED' : 'ATTENTION NEEDED'}`);

    // Step 7: Log
    logAudit('CYCLE_COMPLETE', {
        accuracy: evaluation.accuracy,
        predictions: validation,
        gateResult: gate.passed
    }, {
        weights: updatedModel.model.dataSources,
        accuracy: evaluation.accuracy,
        sessions: updatedModel.model.metrics.sessionsObserved
    });

    // Save updated model
    fs.writeFileSync(MODEL_PATH, JSON.stringify(updatedModel.model, null, 2));
    console.log('\n  ✅ Model saved. Cycle complete.\n');

    return { status: 'complete', evaluation, validation, gate };
}

/**
 * Get current model status (for SELF_CONTEXT.md and dashboard)
 */
function getStatus() {
    const model = loadModel();
    const jarvis = checkJarvisLayer();

    return {
        version: model.version,
        status: model.status,
        jarvisOperational: jarvis.operational,
        sessionsObserved: model.metrics.sessionsObserved,
        modelAccuracy: model.metrics.modelAccuracy,
        activePredictions: model.activePredictions.length,
        establishedPatterns: model.patterns.established.length,
        candidatePatterns: model.patterns.candidates.length,
        weights: {
            declarative: model.dataSources.declarative.weight,
            behavioral: model.dataSources.behavioral.weight,
            decisional: model.dataSources.decisional.weight,
            omission: model.dataSources.omission.weight
        }
    };
}

module.exports = { runCycle, getStatus, checkJarvisLayer, loadModel, logAudit };

// CLI execution
if (require.main === module) {
    runCycle().catch(err => {
        console.error('❌ Operator Noesis error:', err.message);
        process.exit(1);
    });
}
