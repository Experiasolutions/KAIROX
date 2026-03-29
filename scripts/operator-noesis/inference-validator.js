/** @purpose KAIROS script: inference-validator */
/**
 * inference-validator.js — Tests and validates predictions about the operator
 * 
 * Each prediction must be:
 * - Falsifiable (can be proven wrong)
 * - Time-bounded (has a deadline)
 * - From a specific data source (traceable)
 * 
 * @version 1.0.0
 */

/**
 * Validate active inferences against observed outcomes
 * @param {Object} model - Current learning model
 * @returns {Object} Validation results
 */
function validateInferences(model) {
    const predictions = model.activePredictions || [];
    const now = new Date();

    let confirmed = 0;
    let falsified = 0;
    let expired = 0;
    let pending = 0;

    for (const prediction of predictions) {
        if (prediction.resolved) {
            if (prediction.outcome === 'confirmed') confirmed++;
            if (prediction.outcome === 'falsified') falsified++;
            continue;
        }

        // Check if prediction expired
        if (prediction.deadline && new Date(prediction.deadline) < now) {
            prediction.resolved = true;
            prediction.outcome = 'expired';
            prediction.resolvedAt = now.toISOString();
            expired++;
            continue;
        }

        pending++;
    }

    return {
        total: predictions.length,
        confirmed,
        falsified,
        expired,
        pending,
        accuracyRate: (confirmed + falsified) > 0
            ? confirmed / (confirmed + falsified)
            : null
    };
}

/**
 * Create a new prediction (inference) about the operator
 * Enforces the 5 prediction rules from the RP
 * 
 * @param {Object} model - Current learning model
 * @param {Object} prediction - Prediction to add
 * @returns {Object} Result with success status
 */
function createPrediction(model, prediction) {
    const activePredictions = model.activePredictions.filter(p => !p.resolved);

    // Rule 1: Max 5 simultaneous
    if (activePredictions.length >= 5) {
        return {
            success: false,
            reason: 'MAX_PREDICTIONS — already 5 active predictions. Resolve one first.'
        };
    }

    // Rule 2: Must be falsifiable
    if (!prediction.falsificationCriteria) {
        return {
            success: false,
            reason: 'NOT_FALSIFIABLE — prediction must include falsification criteria.'
        };
    }

    // Rule 3: Must have timeframe
    if (!prediction.deadline) {
        return {
            success: false,
            reason: 'NO_TIMEFRAME — prediction must have a deadline.'
        };
    }

    // Rule 4: Confidence starts at 0.50
    const newPrediction = {
        id: `PRED-${Date.now()}`,
        ...prediction,
        confidence: 0.50,
        createdAt: new Date().toISOString(),
        resolved: false,
        outcome: null,
        resolvedAt: null
    };

    model.activePredictions.push(newPrediction);

    return { success: true, prediction: newPrediction };
}

/**
 * Resolve a prediction with observed outcome
 * @param {Object} model - Current learning model  
 * @param {string} predictionId - ID of prediction to resolve
 * @param {string} outcome - 'confirmed' or 'falsified'
 * @param {string} evidence - Evidence supporting the resolution
 */
function resolvePrediction(model, predictionId, outcome, evidence) {
    const prediction = model.activePredictions.find(p => p.id === predictionId);

    if (!prediction) {
        return { success: false, reason: `Prediction ${predictionId} not found.` };
    }

    if (prediction.resolved) {
        return { success: false, reason: `Prediction ${predictionId} already resolved.` };
    }

    if (!['confirmed', 'falsified'].includes(outcome)) {
        return { success: false, reason: 'Outcome must be "confirmed" or "falsified".' };
    }

    prediction.resolved = true;
    prediction.outcome = outcome;
    prediction.evidence = evidence;
    prediction.resolvedAt = new Date().toISOString();

    // Update source evidence count
    if (prediction.primarySource && model.dataSources[prediction.primarySource]) {
        model.dataSources[prediction.primarySource].evidenceCount++;
    }

    return { success: true, prediction };
}

module.exports = { validateInferences, createPrediction, resolvePrediction };
