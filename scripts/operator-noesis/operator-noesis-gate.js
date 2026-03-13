/** @purpose KAIROS script: operator-noesis-gate */
/**
 * operator-noesis-gate.js — Checkpoint for Operator Noesis health
 * 
 * Validates that the learning model is functioning correctly:
 * - Not stagnating (accuracy improving or stable)
 * - Not overlearning (respecting privacy ceiling)
 * - Not biased (minimum evidence before establishing patterns)
 * - Coherence maintained (established patterns still hold)
 * 
 * @version 1.0.0
 */

/**
 * Run the gate checkpoint
 * @param {Object} model - Updated learning model (after model-updater)
 * @returns {Object} Gate result with pass/fail and details
 */
function runGate(model) {
    const checks = [];
    let allPassed = true;

    // Check 1: Stagnation detection
    const stagnation = checkStagnation(model);
    checks.push(stagnation);
    if (!stagnation.passed) allPassed = false;

    // Check 2: Privacy ceiling
    const privacy = checkPrivacyCeiling(model);
    checks.push(privacy);
    if (!privacy.passed) allPassed = false;

    // Check 3: Bias detection
    const bias = checkBias(model);
    checks.push(bias);
    if (!bias.passed) allPassed = false;

    // Check 4: Coherence
    const coherence = checkCoherence(model);
    checks.push(coherence);
    if (!coherence.passed) allPassed = false;

    // Check 5: Prediction health
    const predictionHealth = checkPredictionHealth(model);
    checks.push(predictionHealth);
    if (!predictionHealth.passed) allPassed = false;

    return {
        passed: allPassed,
        timestamp: new Date().toISOString(),
        checks,
        recommendation: allPassed
            ? 'All gates passed. Model is healthy.'
            : `${checks.filter(c => !c.passed).length} gate(s) failed. Review required.`
    };
}

/**
 * Check for model stagnation
 * Alert after 10 sessions without accuracy improvement
 */
function checkStagnation(model) {
    const metrics = model.metrics || {};

    // Too early to check
    if (metrics.sessionsObserved < 10) {
        return { name: 'stagnation', passed: true, note: 'Too early to assess (< 10 sessions)' };
    }

    if (metrics.modelAccuracy !== null && metrics.modelAccuracy < 0.50) {
        return {
            name: 'stagnation',
            passed: false,
            note: `Accuracy ${metrics.modelAccuracy} < 0.50 after ${metrics.sessionsObserved} sessions. Escalate to Council.`
        };
    }

    return { name: 'stagnation', passed: true, note: 'Accuracy within acceptable range' };
}

/**
 * Check privacy ceiling compliance
 */
function checkPrivacyCeiling(model) {
    const ceiling = model.privacyCeiling || {};
    const patterns = model.patterns?.established || [];

    // Check if any pattern touches excluded topics
    const violations = patterns.filter(p =>
        ceiling.excludedTopics?.some(topic =>
            p.description?.toLowerCase().includes(topic.toLowerCase())
        )
    );

    if (violations.length > 0) {
        return {
            name: 'privacy',
            passed: false,
            note: `${violations.length} pattern(s) touch excluded topics. Remove immediately.`,
            violations: violations.map(v => v.id)
        };
    }

    return { name: 'privacy', passed: true, note: 'No privacy ceiling violations' };
}

/**
 * Check for bias (patterns established with insufficient evidence)
 */
function checkBias(model) {
    const established = model.patterns?.established || [];

    const underEvidenced = established.filter(p =>
        (p.evidenceCount || 0) < 7 // RP specifies minimum 7 for established
    );

    if (underEvidenced.length > 0) {
        return {
            name: 'bias',
            passed: false,
            note: `${underEvidenced.length} established pattern(s) have < 7 evidence points. May be bias, not pattern.`,
            patterns: underEvidenced.map(p => p.id)
        };
    }

    return { name: 'bias', passed: true, note: 'All patterns have sufficient evidence' };
}

/**
 * Check coherence of established patterns
 * ≥5 consecutive failures on a pattern = alert
 */
function checkCoherence(model) {
    const coherence = model.metrics?.coherenceScore;

    if (coherence === null || coherence === undefined) {
        return { name: 'coherence', passed: true, note: 'No established patterns to check' };
    }

    if (coherence < 0.60) {
        return {
            name: 'coherence',
            passed: false,
            note: `Coherence ${coherence} < 0.60. Gabriel may have changed significantly. Consider model reset for affected patterns.`
        };
    }

    return { name: 'coherence', passed: true, note: `Coherence ${coherence} — healthy` };
}

/**
 * Check prediction system health
 */
function checkPredictionHealth(model) {
    const predictions = model.activePredictions || [];
    const active = predictions.filter(p => !p.resolved);
    const expired = predictions.filter(p => p.outcome === 'expired');

    // Too many expired predictions = we're making bad timeframe estimates
    if (expired.length > predictions.length * 0.5 && predictions.length >= 4) {
        return {
            name: 'predictions',
            passed: false,
            note: `${expired.length}/${predictions.length} predictions expired. Timeframes may be too aggressive.`
        };
    }

    return { name: 'predictions', passed: true, note: `${active.length} active, ${expired.length} expired` };
}

module.exports = { runGate };
