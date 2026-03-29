#!/usr/bin/env node

/**
 * @module tools-bridge
 * @version 1.0.0
 * @purpose Discovery layer for the tools/ arsenal — catalogs available skills,
 *          integrations, and capabilities via filesystem scanning.
 * @inputs  tools/ directory structure (SKILL.md files, package.json, README.md)
 * @outputs { repos[], integrations[], skills[], totalSkills, search() }
 * @emits   tools:discovered, tools:skill:loaded
 * @dependencies None (pure filesystem scanning — zero external deps)
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ── Paths ────────────────────────────────────────────────────

const AIOS_ROOT = path.join(__dirname, '..');
const TOOLS_PATH = path.join(AIOS_ROOT, 'tools');
const INTEGRATIONS_PATH = path.join(TOOLS_PATH, 'integrations');
const REGISTRY_PATH = path.join(INTEGRATIONS_PATH, 'TOOLS-REGISTRY.md');

// ── Safe File Operations ─────────────────────────────────────
// WHY: Graceful degradation — tools/ may be partially cloned or missing

function safeReadFile(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch {
        return null;
    }
}

function safeReaddir(dirPath) {
    try {
        return fs.readdirSync(dirPath, { withFileTypes: true });
    } catch {
        return [];
    }
}

function dirExists(dirPath) {
    try {
        return fs.statSync(dirPath).isDirectory();
    } catch {
        return false;
    }
}

// ── SKILL.md Parser ──────────────────────────────────────────
// WHY: SKILL.md frontmatter contains the skill's name and description.
// We parse YAML frontmatter (--- delimited) and first heading for metadata.

function parseSkillMd(filePath) {
    const content = safeReadFile(filePath);
    if (!content) return null;

    const result = {
        path: filePath,
        name: '',
        description: '',
        hasInstructions: content.length > 100,
    };

    // Parse YAML frontmatter
    const fmMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (fmMatch) {
        const fm = fmMatch[1];
        const nameMatch = fm.match(/name:\s*(.+)/i);
        const descMatch = fm.match(/description:\s*(.+)/i);
        if (nameMatch) result.name = nameMatch[1].trim().replace(/^["']|["']$/g, '');
        if (descMatch) result.description = descMatch[1].trim().replace(/^["']|["']$/g, '');
    }

    // Fallback: extract from first heading
    if (!result.name) {
        const headingMatch = content.match(/^#\s+(.+)/m);
        if (headingMatch) result.name = headingMatch[1].trim();
    }

    // Fallback: derive from directory name
    if (!result.name) {
        result.name = path.basename(path.dirname(filePath));
    }

    return result;
}

// ── Integration Scanner ──────────────────────────────────────
// WHY: Each integration in tools/integrations/ may have different structures.
// We detect what's available by checking for key files.

function scanIntegration(integrationDir) {
    const name = path.basename(integrationDir);
    const result = {
        name,
        path: integrationDir,
        type: 'unknown',
        skills: [],
        hasReadme: false,
        hasPackageJson: false,
        hasSkills: false,
    };

    // WHY: Detect integration type by checking for key files
    result.hasReadme = fs.existsSync(path.join(integrationDir, 'README.md'));
    result.hasPackageJson = fs.existsSync(path.join(integrationDir, 'package.json'));

    // Check for skills directory
    const skillsDir = path.join(integrationDir, 'skills');
    if (dirExists(skillsDir)) {
        result.hasSkills = true;
        result.type = 'skills-library';

        // Scan each skill subdirectory for SKILL.md
        const skillDirs = safeReaddir(skillsDir).filter(d => d.isDirectory());
        for (const skillDir of skillDirs) {
            const skillMdPath = path.join(skillsDir, skillDir.name, 'SKILL.md');
            if (fs.existsSync(skillMdPath)) {
                const parsed = parseSkillMd(skillMdPath);
                if (parsed) {
                    result.skills.push({
                        id: skillDir.name,
                        name: parsed.name,
                        description: parsed.description,
                        path: skillMdPath,
                        hasInstructions: parsed.hasInstructions,
                    });
                }
            }
        }
    } else if (result.hasPackageJson) {
        result.type = 'npm-package';
    } else if (result.hasReadme) {
        result.type = 'reference';
    }

    return result;
}

// ── Top-Level Repo Scanner ───────────────────────────────────
// WHY: tools/ has both top-level repos and the integrations/ subdirectory

function scanTopLevelRepos() {
    const repos = [];
    const entries = safeReaddir(TOOLS_PATH).filter(d => d.isDirectory());

    for (const entry of entries) {
        if (entry.name === 'integrations') continue; // Handled separately

        const repoPath = path.join(TOOLS_PATH, entry.name);
        const hasReadme = fs.existsSync(path.join(repoPath, 'README.md'));
        const hasPackageJson = fs.existsSync(path.join(repoPath, 'package.json'));
        const hasSkillsDir = dirExists(path.join(repoPath, 'skills'));
        const hasGit = dirExists(path.join(repoPath, '.git'));

        repos.push({
            name: entry.name,
            path: repoPath,
            isGitRepo: hasGit,
            hasReadme,
            hasPackageJson,
            hasSkills: hasSkillsDir,
        });
    }

    return repos;
}

// ── Main Discovery ───────────────────────────────────────────

function discover() {
    const startTime = Date.now();

    // WHY: Early exit if tools/ is missing (valid during minimal deployment)
    if (!dirExists(TOOLS_PATH)) {
        return {
            available: false,
            repos: [],
            integrations: [],
            allSkills: [],
            totalSkills: 0,
            scanTimeMs: Date.now() - startTime,
        };
    }

    // Scan top-level repos
    const repos = scanTopLevelRepos();

    // Scan integrations
    const integrations = [];
    const allSkills = [];

    if (dirExists(INTEGRATIONS_PATH)) {
        const integrationDirs = safeReaddir(INTEGRATIONS_PATH).filter(d => d.isDirectory());

        for (const dir of integrationDirs) {
            const integration = scanIntegration(path.join(INTEGRATIONS_PATH, dir.name));
            integrations.push(integration);
            allSkills.push(...integration.skills);
        }
    }

    return {
        available: true,
        repos,
        integrations,
        allSkills,
        totalSkills: allSkills.length,
        registryExists: fs.existsSync(REGISTRY_PATH),
        scanTimeMs: Date.now() - startTime,
    };
}

// ── Skill Search ─────────────────────────────────────────────
// WHY: Mind clones need to find relevant skills by keyword matching

function searchSkills(query, discoveryResult) {
    if (!discoveryResult || !discoveryResult.allSkills) return [];

    const lower = query.toLowerCase();
    const terms = lower.split(/\s+/);

    return discoveryResult.allSkills
        .map(skill => {
            const nameMatch = terms.filter(t => skill.name.toLowerCase().includes(t)).length;
            const idMatch = terms.filter(t => skill.id.toLowerCase().includes(t)).length;
            const descMatch = terms.filter(t => (skill.description || '').toLowerCase().includes(t)).length;
            const relevance = (nameMatch * 3) + (idMatch * 2) + descMatch;
            return { ...skill, relevance };
        })
        .filter(s => s.relevance > 0)
        .sort((a, b) => b.relevance - a.relevance);
}

// ── Tools Bridge (kernel-bridge compatible interface) ─────────

function createToolsBridge() {
    let _discovery = null;

    // WHY: Lazy discovery — only scan filesystem when first accessed
    function getDiscovery() {
        if (!_discovery) {
            _discovery = discover();
        }
        return _discovery;
    }

    return {
        get available() {
            return getDiscovery().available;
        },

        getDiscovery() {
            return getDiscovery();
        },

        getRepos() {
            return getDiscovery().repos;
        },

        getIntegrations() {
            return getDiscovery().integrations;
        },

        getSkillCount() {
            return getDiscovery().totalSkills;
        },

        searchSkills(query) {
            return searchSkills(query, getDiscovery());
        },

        getSkillById(skillId) {
            return getDiscovery().allSkills.find(s => s.id === skillId) || null;
        },

        loadSkillContent(skillId) {
            const skill = this.getSkillById(skillId);
            if (!skill) return null;
            return safeReadFile(skill.path);
        },

        getHealth() {
            const d = getDiscovery();
            return {
                available: d.available,
                repos: d.repos.length,
                integrations: d.integrations.length,
                skills: d.totalSkills,
                registryExists: d.registryExists,
                scanTimeMs: d.scanTimeMs,
            };
        },

        // WHY: Force re-scan when tools are added/removed at runtime
        refresh() {
            _discovery = null;
            return getDiscovery();
        },
    };
}

// ── Singleton ────────────────────────────────────────────────

let _toolsBridge = null;

function getToolsBridge() {
    if (!_toolsBridge) {
        _toolsBridge = createToolsBridge();
    }
    return _toolsBridge;
}

// ── CLI Interface ────────────────────────────────────────────

if (require.main === module) {
    const action = process.argv[2] || 'summary';

    const bridge = getToolsBridge();
    const discovery = bridge.getDiscovery();

    if (action === 'summary') {
        console.log('\n⚡ AIOS Tools Bridge v1.0');
        console.log(`   Available: ${discovery.available}`);
        console.log(`   Top-level repos: ${discovery.repos.length}`);
        console.log(`   Integrations: ${discovery.integrations.length}`);
        console.log(`   Total skills: ${discovery.totalSkills}`);
        console.log(`   Registry: ${discovery.registryExists ? 'found' : 'missing'}`);
        console.log(`   Scan time: ${discovery.scanTimeMs}ms\n`);

        console.log('   Repos:');
        discovery.repos.forEach(r => {
            console.log(`     ${r.name} ${r.isGitRepo ? '(git)' : ''} ${r.hasSkills ? '→ has skills/' : ''}`);
        });

        console.log('\n   Integrations:');
        discovery.integrations.forEach(i => {
            console.log(`     ${i.name.padEnd(25)} [${i.type}] ${i.skills.length > 0 ? `→ ${i.skills.length} skills` : ''}`);
        });
    } else if (action === 'skills') {
        console.log(`\n⚡ All Skills (${discovery.totalSkills}):\n`);
        discovery.allSkills.forEach(s => {
            console.log(`  ${s.id.padEnd(30)} ${s.name}`);
        });
    } else if (action === 'search') {
        const query = process.argv.slice(3).join(' ');
        if (!query) {
            console.log('Usage: node scripts/tools-bridge.js search <query>');
            process.exit(1);
        }
        const results = bridge.searchSkills(query);
        console.log(`\n⚡ Search: "${query}" → ${results.length} results\n`);
        results.slice(0, 10).forEach(s => {
            console.log(`  [${s.relevance}] ${s.id.padEnd(30)} ${s.name}`);
        });
    } else if (action === 'health') {
        console.log(JSON.stringify(bridge.getHealth(), null, 2));
    } else {
        console.log('Usage: node scripts/tools-bridge.js [summary|skills|search <query>|health]');
    }

    // Emit discovery event
    try {
        const { publish } = require(path.join(__dirname, 'event-bus'));
        publish('tools:discovered', bridge.getHealth(), { source: 'tools-bridge' });
    } catch {
        // WHY: Event bus not available in standalone mode — normal
    }
}

module.exports = { createToolsBridge, getToolsBridge, discover, searchSkills };
