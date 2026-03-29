#!/usr/bin/env node
/** @purpose Core Jarvis engine: morning brief, night check-in, operator profiling */

/**
 * jarvis-core.js — The Silent Observer Layer
 * 
 * Collects behavioral data ABOUT the operator (Gabriel) by reading:
 * - Boot logs (.aios-core/data/boot-log.json)
 * - Session state (.aios-core/session/session-state.json)
 * - Git activity (recent commits, branch patterns)
 * - File modification patterns (what files are touched most)
 * 
 * This module READS system state and produces structured observations.
 * It never writes to core files — only to operator-profile.json.
 * 
 * The Operator Noesis Engine (scripts/operator-noesis/) consumes
 * these observations to update the learning model.
 * 
 * @module jarvis-core
 * @version 1.0.0
 * @requires profile-enricher.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const BOOT_LOG = path.join(ROOT, '.aios-core', 'data', 'boot-log.json');
const SESSION_STATE = path.join(ROOT, '.aios-core', 'session', 'session-state.json');
const OPERATOR_PROFILE = path.join(ROOT, '.aios-core', 'memory', 'operator-profile.json');
const COGNITIVE_STATE = path.join(ROOT, '.aios-core', 'noesis', 'cognitive-state.json');

// ─── Data Source Collectors ─────────────────────────────────────

/**
 * Collect behavioral data from boot logs
 * Signals: boot frequency, time-of-day patterns, quick vs full boot preference
 */
function collectBootBehavior() {
    if (!fs.existsSync(BOOT_LOG)) {
        return { source: 'boot-logs', data: null, note: 'No boot logs found' };
    }

    try {
        const logs = JSON.parse(fs.readFileSync(BOOT_LOG, 'utf8'));
        if (!Array.isArray(logs) || logs.length === 0) {
            return { source: 'boot-logs', data: null, note: 'Empty boot log' };
        }

        const recent = logs.slice(-20); // last 20 boots
        const quickCount = recent.filter(l => l.mode === 'quick').length;
        const fullCount = recent.filter(l => l.mode === 'full').length;

        // Time-of-day analysis
        const hours = recent
            .map(l => new Date(l.timestamp).getHours())
            .filter(h => !isNaN(h));

        const avgHour = hours.length > 0
            ? Math.round(hours.reduce((a, b) => a + b, 0) / hours.length)
            : null;

        // Council score trend
        const scores = recent
            .map(l => l.councilScore)
            .filter(s => s !== null && s !== undefined);

        const avgScore = scores.length > 0
            ? +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
            : null;

        return {
            source: 'boot-logs',
            data: {
                totalBoots: logs.length,
                recentBoots: recent.length,
                quickRatio: recent.length > 0 ? +(quickCount / recent.length).toFixed(2) : 0,
                fullRatio: recent.length > 0 ? +(fullCount / recent.length).toFixed(2) : 0,
                avgBootHour: avgHour,
                avgCouncilScore: avgScore,
                lastBootAt: recent[recent.length - 1]?.timestamp || null
            }
        };
    } catch (err) {
        return { source: 'boot-logs', data: null, error: err.message };
    }
}

/**
 * Collect behavioral data from git activity
 * Signals: commit frequency, work hours, commit message patterns
 */
function collectGitBehavior() {
    try {
        const logOutput = execSync(
            'git log --oneline --format="%H|%ai|%s" -n 30',
            { cwd: ROOT, stdio: ['pipe', 'pipe', 'pipe'], encoding: 'utf8' }
        );

        const commits = logOutput.trim().split('\n').filter(Boolean).map(line => {
            const [hash, date, ...msgParts] = line.split('|');
            return { hash, date, message: msgParts.join('|') };
        });

        if (commits.length === 0) {
            return { source: 'git', data: null, note: 'No git commits found' };
        }

        // Commit timing patterns
        const hours = commits
            .map(c => new Date(c.date).getHours())
            .filter(h => !isNaN(h));

        const avgCommitHour = hours.length > 0
            ? Math.round(hours.reduce((a, b) => a + b, 0) / hours.length)
            : null;

        // Message patterns (declarative signals)
        const messageTypes = {
            feat: commits.filter(c => c.message.startsWith('feat')).length,
            fix: commits.filter(c => c.message.startsWith('fix')).length,
            docs: commits.filter(c => c.message.startsWith('docs')).length,
            chore: commits.filter(c => c.message.startsWith('chore')).length,
            other: 0
        };
        messageTypes.other = commits.length - messageTypes.feat - messageTypes.fix - messageTypes.docs - messageTypes.chore;

        // Active branch
        let currentBranch = 'unknown';
        try {
            currentBranch = execSync('git branch --show-current', {
                cwd: ROOT, stdio: ['pipe', 'pipe', 'pipe'], encoding: 'utf8'
            }).trim();
        } catch { /* ignore */ }

        return {
            source: 'git',
            data: {
                recentCommits: commits.length,
                avgCommitHour: avgCommitHour,
                currentBranch,
                commitTypes: messageTypes,
                lastCommitAt: commits[0]?.date || null
            }
        };
    } catch (err) {
        return { source: 'git', data: null, error: err.message };
    }
}

/**
 * Collect data from cognitive state
 * Signals: what the system has observed about its own performance
 */
function collectCognitiveState() {
    if (!fs.existsSync(COGNITIVE_STATE)) {
        return { source: 'cognitive', data: null, note: 'No cognitive state found' };
    }

    try {
        const cog = JSON.parse(fs.readFileSync(COGNITIVE_STATE, 'utf8'));
        return {
            source: 'cognitive',
            data: {
                sessionCount: cog.sessionCount || 0,
                strengths: (cog.strengths || []).length,
                patterns: (cog.patterns || []).length,
                blindspots: (cog.blindspots || []).length,
                pendingObservations: (cog.pendingObservations || []).length,
                avgScore: cog.metrics?.averageScore || null,
                avgDepth: cog.metrics?.averageDepth || null,
                driftAlerts: cog.metrics?.driftAlerts || 0
            }
        };
    } catch (err) {
        return { source: 'cognitive', data: null, error: err.message };
    }
}

/**
 * Collect file modification patterns
 * Signals: which directories/files get the most attention
 */
function collectFilePatterns() {
    try {
        const diffOutput = execSync(
            'git log --pretty=format: --name-only -n 20',
            { cwd: ROOT, stdio: ['pipe', 'pipe', 'pipe'], encoding: 'utf8' }
        );

        const files = diffOutput.trim().split('\n').filter(Boolean);
        const dirCounts = {};

        for (const file of files) {
            const dir = file.split('/')[0] || file.split('\\')[0];
            dirCounts[dir] = (dirCounts[dir] || 0) + 1;
        }

        // Sort by frequency
        const sorted = Object.entries(dirCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        return {
            source: 'file-patterns',
            data: {
                totalFilesTouched: files.length,
                topDirectories: sorted.map(([dir, count]) => ({ dir, count }))
            }
        };
    } catch (err) {
        return { source: 'file-patterns', data: null, error: err.message };
    }
}

// ─── Main Collection Cycle ──────────────────────────────────────

/**
 * Run a full observation cycle
 * Collects data from all sources and returns structured observations
 * 
 * @returns {Object} observations — structured data for profile-enricher
 */
function observe() {
    const timestamp = new Date().toISOString();

    const observations = {
        collectedAt: timestamp,
        sources: [
            collectBootBehavior(),
            collectGitBehavior(),
            collectCognitiveState(),
            collectFilePatterns()
        ]
    };

    // Calculate completeness (how many sources returned data)
    const withData = observations.sources.filter(s => s.data !== null).length;
    observations.completeness = +(withData / observations.sources.length).toFixed(2);

    return observations;
}

/**
 * Get the current operator profile (read-only)
 */
function getProfile() {
    if (!fs.existsSync(OPERATOR_PROFILE)) {
        return null;
    }
    return JSON.parse(fs.readFileSync(OPERATOR_PROFILE, 'utf8'));
}

/**
 * Save operator profile
 */
function saveProfile(profile) {
    const dir = path.dirname(OPERATOR_PROFILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(OPERATOR_PROFILE, JSON.stringify(profile, null, 2));
}

module.exports = { observe, getProfile, saveProfile, OPERATOR_PROFILE };

// CLI execution
if (require.main === module) {
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║   👁️  Jarvis Core — Observation Cycle             ║');
    console.log('╚══════════════════════════════════════════════════╝\n');

    const obs = observe();
    console.log(`  📊 Sources collected: ${obs.sources.length}`);
    console.log(`  ✅ Data completeness: ${(obs.completeness * 100).toFixed(0)}%\n`);

    for (const src of obs.sources) {
        const icon = src.data ? '✅' : '⚠️';
        console.log(`  ${icon} ${src.source}: ${src.data ? 'Data collected' : (src.note || src.error)}`);
    }

    // If enricher is available, run enrichment
    try {
        const { enrichProfile } = require('./profile-enricher');
        const profile = enrichProfile(obs);
        saveProfile(profile);
        console.log(`\n  💾 Profile saved to .aios-core/memory/operator-profile.json`);
    } catch (err) {
        console.log(`\n  ⚠️  Profile enricher: ${err.message}`);
    }

    console.log('');
}
