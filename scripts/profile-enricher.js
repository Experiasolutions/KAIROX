#!/usr/bin/env node
/** @purpose Enrich operator profile based on interaction patterns */

/**
 * profile-enricher.js — Translates raw observations into operator profile vectors
 * 
 * Takes observations from jarvis-core.js and transforms them into
 * structured profile data that the Operator Noesis learning model can consume.
 * 
 * Mapping:
 *   Boot behavior    → behavioral signals (time patterns, preferences)
 *   Git activity     → behavioral + decisional signals (what gets built)
 *   Cognitive state  → declarative signals (self-assessment from system)
 *   File patterns    → omission signals (what doesn't get touched)
 * 
 * @module profile-enricher
 * @version 1.0.0
 * @requires jarvis-core.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OPERATOR_PROFILE_PATH = path.join(ROOT, '.aios-core', 'memory', 'operator-profile.json');

/**
 * Enrich the operator profile from jarvis-core observations
 * 
 * @param {Object} observations - From jarvis-core.observe()
 * @returns {Object} enriched operator profile
 */
function enrichProfile(observations) {
    // Load existing profile or create skeleton
    let profile = loadExistingProfile();

    const sourceMap = {};
    for (const src of observations.sources) {
        sourceMap[src.source] = src;
    }

    // ── Behavioral signals (weight: 0.45) ──────────────────────
    profile.behavioral = enrichBehavioral(profile.behavioral || {}, sourceMap);

    // ── Decisional signals (weight: 0.20) ──────────────────────
    profile.decisional = enrichDecisional(profile.decisional || {}, sourceMap);

    // ── Declarative signals (weight: 0.25) ─────────────────────
    profile.declarative = enrichDeclarative(profile.declarative || {}, sourceMap);

    // ── Omission signals (weight: 0.10) ────────────────────────
    profile.omission = enrichOmission(profile.omission || {}, sourceMap);

    // ── Meta ────────────────────────────────────────────────────
    profile._meta = {
        version: '1.0.0',
        lastEnriched: new Date().toISOString(),
        observationCompleteness: observations.completeness,
        enrichmentCycles: (profile._meta?.enrichmentCycles || 0) + 1
    };

    return profile;
}

/**
 * Load existing profile or return skeleton
 */
function loadExistingProfile() {
    if (fs.existsSync(OPERATOR_PROFILE_PATH)) {
        try {
            return JSON.parse(fs.readFileSync(OPERATOR_PROFILE_PATH, 'utf8'));
        } catch { /* corrupted, start fresh */ }
    }

    return {
        operatorId: 'gabriel',
        role: 'founder-operator',
        behavioral: {},
        decisional: {},
        declarative: {},
        omission: {},
        insights: [],
        _meta: { version: '1.0.0', enrichmentCycles: 0 }
    };
}

/**
 * Enrich behavioral signals (highest weight — actual actions)
 */
function enrichBehavioral(existing, sourceMap) {
    const boot = sourceMap['boot-logs']?.data;
    const git = sourceMap['git']?.data;

    const behavioral = { ...existing };

    if (boot) {
        behavioral.workHours = {
            avgBootHour: boot.avgBootHour,
            pattern: categorizeWorkHour(boot.avgBootHour),
            evidence: (existing.workHours?.evidence || 0) + 1
        };

        behavioral.bootPreference = {
            quickRatio: boot.quickRatio,
            interpretation: boot.quickRatio > 0.6
                ? 'Prefers speed over thoroughness'
                : boot.quickRatio < 0.3
                    ? 'Prefers comprehensive boots'
                    : 'Balanced boot preference',
            evidence: (existing.bootPreference?.evidence || 0) + 1
        };
    }

    if (git) {
        behavioral.commitPatterns = {
            avgCommitHour: git.avgCommitHour,
            dominantType: getDominantType(git.commitTypes),
            recentActivity: git.recentCommits,
            evidence: (existing.commitPatterns?.evidence || 0) + 1
        };
    }

    return behavioral;
}

/**
 * Enrich decisional signals (what Gabriel chooses when prioritizing)
 */
function enrichDecisional(existing, sourceMap) {
    const git = sourceMap['git']?.data;
    const files = sourceMap['file-patterns']?.data;

    const decisional = { ...existing };

    if (git) {
        // What gets committed reveals priorities
        const types = git.commitTypes || {};
        const total = Object.values(types).reduce((a, b) => a + b, 0);

        if (total > 0) {
            decisional.focusAllocation = {
                features: +((types.feat || 0) / total).toFixed(2),
                fixes: +((types.fix || 0) / total).toFixed(2),
                docs: +((types.docs || 0) / total).toFixed(2),
                maintenance: +((types.chore || 0) / total).toFixed(2),
                interpretation: interpretFocus(types, total),
                evidence: (existing.focusAllocation?.evidence || 0) + 1
            };
        }
    }

    if (files) {
        // Which directories get the most attention
        const topDirs = files.topDirectories || [];
        decisional.directoryFocus = {
            top3: topDirs.slice(0, 3).map(d => d.dir),
            interpretation: topDirs.length > 0
                ? `Primary focus on: ${topDirs.slice(0, 3).map(d => d.dir).join(', ')}`
                : 'No clear directory focus yet',
            evidence: (existing.directoryFocus?.evidence || 0) + 1
        };
    }

    return decisional;
}

/**
 * Enrich declarative signals (what the system says about itself)
 */
function enrichDeclarative(existing, sourceMap) {
    const cognitive = sourceMap['cognitive']?.data;

    const declarative = { ...existing };

    if (cognitive) {
        declarative.systemPerformance = {
            avgScore: cognitive.avgScore,
            avgDepth: cognitive.avgDepth,
            sessionCount: cognitive.sessionCount,
            strengths: cognitive.strengths,
            blindspots: cognitive.blindspots,
            driftAlerts: cognitive.driftAlerts,
            evidence: (existing.systemPerformance?.evidence || 0) + 1
        };
    }

    return declarative;
}

/**
 * Enrich omission signals (what doesn't get touched — blind spots)
 */
function enrichOmission(existing, sourceMap) {
    const files = sourceMap['file-patterns']?.data;

    const omission = { ...existing };

    if (files && files.topDirectories) {
        // Known important directories that are NOT in the top
        const knownImportant = [
            'tests', 'docs', '.aios-core', 'scripts',
            'squads', 'reasoning-packages', 'clients'
        ];
        const activeDirs = files.topDirectories.map(d => d.dir);
        const neglected = knownImportant.filter(d => !activeDirs.includes(d));

        omission.neglectedAreas = {
            directories: neglected,
            interpretation: neglected.length > 3
                ? `${neglected.length} important areas not recently touched — consider review`
                : 'Coverage looks healthy',
            evidence: (existing.neglectedAreas?.evidence || 0) + 1
        };
    }

    return omission;
}

// ─── Helper Functions ───────────────────────────────────────────

function categorizeWorkHour(hour) {
    if (hour === null) return 'unknown';
    if (hour >= 5 && hour < 12) return 'morning-person';
    if (hour >= 12 && hour < 17) return 'afternoon-worker';
    if (hour >= 17 && hour < 22) return 'evening-worker';
    return 'night-owl';
}

function getDominantType(types) {
    if (!types) return 'unknown';
    const sorted = Object.entries(types).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || 'unknown';
}

function interpretFocus(types, total) {
    const featRatio = (types.feat || 0) / total;
    const fixRatio = (types.fix || 0) / total;
    const docsRatio = (types.docs || 0) / total;

    if (featRatio > 0.5) return 'Builder-focused — majority of commits are features';
    if (fixRatio > 0.4) return 'Maintenance-focused — significant fix activity';
    if (docsRatio > 0.3) return 'Documentation-focused — substantial docs investment';
    return 'Balanced — no single dominant commit type';
}

module.exports = { enrichProfile, loadExistingProfile };
