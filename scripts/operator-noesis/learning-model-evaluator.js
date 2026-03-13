/** @purpose KAIROS script: learning-model-evaluator */
/**
 * learning-model-evaluator.js — Evaluates which data sources are most predictive
 * 
 * Compares predictions made from each data source against actual outcomes.
 * Calculates per-source accuracy and recommends weight adjustments.
 * 
 * @version 1.0.0
 */

/**
 * Evaluate the learning model's performance
 * @param {Object} model - Current learning model
 * @returns {Object} Evaluation results with per-source accuracy
 */
function evaluateModel(model) {
    const sources = model.dataSources;
    const predictions = model.activePredictions || [];

    // Calculate per-source accuracy from resolved predictions
    const sourceAccuracy = {};

    for (const [sourceKey, sourceData] of Object.entries(sources)) {
        const sourcePredictions = predictions.filter(p =>
            p.primarySource === sourceKey && p.resolved
        );

        if (sourcePredictions.length === 0) {
            sourceAccuracy[sourceKey] = {
                accuracy: null,
                sampleSize: 0,
                note: 'No resolved predictions from this source yet'
            };
            continue;
        }

        const correct = sourcePredictions.filter(p => p.outcome === 'confirmed').length;
        sourceAccuracy[sourceKey] = {
            accuracy: correct / sourcePredictions.length,
            sampleSize: sourcePredictions.length,
            correct,
            total: sourcePredictions.length
        };
    }

    // Overall accuracy
    const allResolved = predictions.filter(p => p.resolved);
    const overallCorrect = allResolved.filter(p => p.outcome === 'confirmed').length;
    const overallAccuracy = allResolved.length > 0
        ? overallCorrect / allResolved.length
        : null;

    // Coherence score: how consistent are the patterns?
    const patterns = model.patterns || { established: [], candidates: [], rejected: [] };
    const coherenceScore = calculateCoherence(patterns, predictions);

    return {
        accuracy: overallAccuracy,
        sourceAccuracy,
        coherenceScore,
        totalPredictions: predictions.length,
        resolvedPredictions: allResolved.length,
        sessionsObserved: model.metrics.sessionsObserved,
        recommendation: generateRecommendation(sourceAccuracy, overallAccuracy)
    };
}

/**
 * Calculate coherence: are established patterns holding?
 */
function calculateCoherence(patterns, predictions) {
    if (patterns.established.length === 0) return null;

    let holdingCount = 0;
    for (const pattern of patterns.established) {
        const relatedPredictions = predictions.filter(p =>
            p.relatedPattern === pattern.id && p.resolved
        );
        const recentlyHolding = relatedPredictions
            .slice(-5) // last 5
            .filter(p => p.outcome === 'confirmed').length;

        if (relatedPredictions.length === 0 || recentlyHolding >= 3) {
            holdingCount++;
        }
    }

    return holdingCount / patterns.established.length;
}

/**
 * Generate recommendation based on evaluation
 */
function generateRecommendation(sourceAccuracy, overallAccuracy) {
    if (overallAccuracy === null) {
        return 'COLLECTING — no predictions resolved yet. Continue observing.';
    }

    if (overallAccuracy >= 0.70) {
        return 'ON_TRACK — model accuracy ≥0.70. Continue current approach.';
    }

    // Find best and worst sources
    const ranked = Object.entries(sourceAccuracy)
        .filter(([_, v]) => v.accuracy !== null)
        .sort((a, b) => b[1].accuracy - a[1].accuracy);

    if (ranked.length >= 2) {
        const best = ranked[0];
        const worst = ranked[ranked.length - 1];
        return `ADJUST — Best source: ${best[0]} (${(best[1].accuracy * 100).toFixed(0)}%), ` +
            `Worst: ${worst[0]} (${(worst[1].accuracy * 100).toFixed(0)}%). Consider weight rebalance.`;
    }

    return 'INSUFFICIENT_DATA — need more resolved predictions for recommendation.';
}

module.exports = { evaluateModel };
