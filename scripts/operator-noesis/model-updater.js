/** @purpose KAIROS script: model-updater */
/**
 * model-updater.js — Applies adaptive adjustments to the learning model
 * 
 * Takes evaluation results and adjusts data source weights.
 * Promotes candidate patterns to established when they meet threshold.
 * 
 * @version 1.0.0
 */

/**
 * Update model weights based on evaluation and validation results
 * @param {Object} model - Current learning model
 * @param {Object} evaluation - From learning-model-evaluator
 * @param {Object} validation - From inference-validator
 * @returns {Object} Updated model with change log
 */
function updateModel(model, evaluation, validation) {
    const weightChanges = {};
    const updatedModel = JSON.parse(JSON.stringify(model)); // deep clone

    // Only adjust weights if we have enough data
    if (evaluation.resolvedPredictions >= 3) {
        const sourceAccuracy = evaluation.sourceAccuracy;

        for (const [source, data] of Object.entries(sourceAccuracy)) {
            if (data.accuracy === null || data.sampleSize < 2) continue;

            const currentWeight = updatedModel.dataSources[source].weight;
            let newWeight = currentWeight;

            // Increase weight for high-accuracy sources, decrease for low
            if (data.accuracy >= 0.75) {
                newWeight = Math.min(currentWeight * 1.10, 0.60); // max cap 60%
            } else if (data.accuracy < 0.40) {
                newWeight = Math.max(currentWeight * 0.90, 0.05); // min floor 5%
            }

            if (newWeight !== currentWeight) {
                weightChanges[source] = {
                    from: Math.round(currentWeight * 100) / 100,
                    to: Math.round(newWeight * 100) / 100,
                    reason: data.accuracy >= 0.75 ? 'high_accuracy' : 'low_accuracy'
                };
                updatedModel.dataSources[source].weight = Math.round(newWeight * 100) / 100;
            }
        }

        // Normalize weights to sum to 1.0
        normalizeWeights(updatedModel.dataSources);
    }

    // Promote candidates to established patterns
    promotePatterns(updatedModel);

    // Update metrics
    updatedModel.metrics.sessionsObserved++;
    updatedModel.metrics.modelAccuracy = evaluation.accuracy;
    updatedModel.metrics.coherenceScore = evaluation.coherenceScore;
    updatedModel.metrics.lastEvaluation = new Date().toISOString();

    if (validation.total > 0) {
        updatedModel.metrics.predictionsTotal = validation.total;
        updatedModel.metrics.predictionsCorrect = validation.confirmed;
    }

    updatedModel.lastUpdated = new Date().toISOString();

    return { model: updatedModel, weightChanges };
}

/**
 * Normalize weights so they sum to 1.0
 */
function normalizeWeights(dataSources) {
    const sum = Object.values(dataSources)
        .reduce((acc, s) => acc + s.weight, 0);

    if (Math.abs(sum - 1.0) > 0.01) {
        for (const source of Object.values(dataSources)) {
            source.weight = Math.round((source.weight / sum) * 100) / 100;
        }
    }
}

/**
 * Promote candidate patterns to established when they meet criteria:
 * - confidence ≥ 0.75
 * - ≥ 5 supporting evidence pieces (relaxed from 7 for candidates)
 */
function promotePatterns(model) {
    const candidates = model.patterns.candidates || [];
    const promoted = [];

    for (let i = candidates.length - 1; i >= 0; i--) {
        const candidate = candidates[i];

        if (candidate.confidence >= 0.75 && candidate.evidenceCount >= 5) {
            candidate.promotedAt = new Date().toISOString();
            candidate.status = 'established';
            model.patterns.established.push(candidate);
            candidates.splice(i, 1);
            promoted.push(candidate.id);
        }
    }

    return promoted;
}

module.exports = { updateModel };
