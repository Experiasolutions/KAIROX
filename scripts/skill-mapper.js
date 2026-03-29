#!/usr/bin/env node

/**
 * @module skill-mapper
 * @version 1.0.0
 * @purpose Verifies mind clone → skill mapping by cross-referencing each clone's
 *          domain tags and knowledge areas against the discovered skills arsenal.
 *          Generates a mapping report showing which skills match each clone.
 * @inputs  squads/mind-clones/squad.yaml, squads/mind-clones/agents/*.md, tools-bridge discovery
 * @outputs { clones[], unmappedClones[], skillCoverage, report }
 * @emits   skills:mapped
 * @dependencies tools-bridge.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ── Paths ────────────────────────────────────────────────────

const AIOS_ROOT = path.join(__dirname, '..');
const CLONES_DIR = path.join(AIOS_ROOT, 'squads', 'mind-clones', 'agents');
const SQUAD_YAML = path.join(AIOS_ROOT, 'squads', 'mind-clones', 'squad.yaml');

// ── Clone Parser ─────────────────────────────────────────────
// WHY: Agent .md files have embedded YAML inside ```yaml blocks.
// We extract key metadata without a full YAML parser (no deps).

function parseCloneFile(filePath) {
    let content;
    try {
        content = fs.readFileSync(filePath, 'utf8');
    } catch {
        return null;
    }

    const clone = {
        file: path.basename(filePath),
        id: '',
        name: '',
        title: '',
        domains: [],
        keywords: [],
    };

    // Extract id
    const idMatch = content.match(/id:\s*(.+)/);
    if (idMatch) clone.id = idMatch[1].trim();

    // Extract name
    const nameMatch = content.match(/name:\s*(.+)/);
    if (nameMatch) clone.name = nameMatch[1].trim().replace(/^["']|["']$/g, '');

    // Extract title
    const titleMatch = content.match(/title:\s*["']?(.+?)["']?\s*$/m);
    if (titleMatch) clone.title = titleMatch[1].trim();

    // Extract domain keywords from knowledge layers (L1)
    const l1Match = content.match(/L1_knowledge_base:\s*\n([\s\S]*?)(?=\n\s*L2_|$)/);
    if (l1Match) {
        // WHY: Capture the top-level keys under L1 as domain areas
        const l1Lines = l1Match[1].split('\n');
        for (const line of l1Lines) {
            const keyMatch = line.match(/^\s{4}(\w[\w_-]*):/);
            if (keyMatch) {
                clone.domains.push(keyMatch[1].replace(/_/g, '-').toLowerCase());
            }
        }
    }

    // Extract keywords from whenToUse
    const whenMatch = content.match(/whenToUse:\s*\|?\s*\n([\s\S]*?)(?=\n\s*\w+:|$)/);
    if (whenMatch) {
        const whenText = whenMatch[1].toLowerCase();
        // WHY: Extract technology-related terms that might match skill names
        const techTerms = whenText.match(/\b(node\.?js|react|python|typescript|javascript|express|fastapi|vue|angular|rails|rust|golang|go|swift|kotlin|java|php|laravel|nextjs|nestjs|graphql|sql|postgres|kubernetes|docker|terraform|spark|kafka|mcp|rag|llm|gpt|transformer|neural|vision|ml|ai|security|devops|blockchain|web3|flutter|shopify|salesforce|wordpress|playwright)\b/gi);
        if (techTerms) {
            clone.keywords.push(...techTerms.map(t => t.toLowerCase()));
        }
    }

    // Also extract from title
    if (clone.title) {
        const titleTerms = clone.title.toLowerCase();
        const titleTech = titleTerms.match(/\b(node\.?js|react|python|typescript|javascript|express|fastapi|vue|angular|rails|rust|golang|go|swift|kotlin|java|php|laravel|nextjs|nestjs|graphql|sql|postgres|kubernetes|docker|terraform|spark|kafka|mcp|rag|llm|gpt|transformer|neural|vision|ml|ai|security|devops|blockchain|web3|flutter|shopify|salesforce|wordpress|playwright|compiler|gpu|cuda|type.system)\b/gi);
        if (titleTech) {
            clone.keywords.push(...titleTech.map(t => t.toLowerCase()));
        }
    }

    // Deduplicate
    clone.domains = [...new Set(clone.domains)];
    clone.keywords = [...new Set(clone.keywords)];

    return clone;
}

// ── Squad Tag Extractor ──────────────────────────────────────
// WHY: squad.yaml tags represent the combined domain vocabulary of all clones

function extractSquadTags() {
    let content;
    try {
        content = fs.readFileSync(SQUAD_YAML, 'utf8');
    } catch {
        return [];
    }

    const tagsSection = content.match(/tags:\s*\n([\s\S]*?)$/);
    if (!tagsSection) return [];

    const tags = [];
    const lines = tagsSection[1].split('\n');
    for (const line of lines) {
        const tagMatch = line.match(/^\s+-\s+(.+)/);
        if (tagMatch) {
            tags.push(tagMatch[1].trim());
        }
    }
    return tags;
}

// ── Skill Matching Engine ────────────────────────────────────
// WHY: We match clones to skills using domain overlap, keyword matching,
// and fuzzy name similarity. Higher score = stronger recommendation.

function matchCloneToSkills(clone, allSkills) {
    const matches = [];

    for (const skill of allSkills) {
        let score = 0;
        const reasons = [];

        const skillName = (skill.name || '').toLowerCase();
        const skillId = (skill.id || '').toLowerCase();
        const skillDesc = (skill.description || '').toLowerCase();

        // Check domain overlap
        for (const domain of clone.domains) {
            if (skillName.includes(domain) || skillId.includes(domain) || skillDesc.includes(domain)) {
                score += 3;
                reasons.push(`domain:${domain}`);
            }
        }

        // Check keyword overlap
        for (const kw of clone.keywords) {
            if (skillName.includes(kw) || skillId.includes(kw) || skillDesc.includes(kw)) {
                score += 2;
                reasons.push(`keyword:${kw}`);
            }
        }

        // Check clone name in skill (e.g., "karpathy" in skill desc)
        const cloneSurname = clone.name.split(' ').pop().toLowerCase();
        if (cloneSurname.length > 3 && (skillDesc.includes(cloneSurname) || skillName.includes(cloneSurname))) {
            score += 5;
            reasons.push(`name:${cloneSurname}`);
        }

        if (score > 0) {
            matches.push({
                skillId: skill.id,
                skillName: skill.name,
                score,
                reasons: [...new Set(reasons)],
            });
        }
    }

    // Sort by score descending
    matches.sort((a, b) => b.score - a.score);
    return matches;
}

// ── Main Verification ────────────────────────────────────────

function verify() {
    // WHY: Load tools-bridge dynamically to get discovered skills
    let allSkills = [];
    try {
        const { getToolsBridge } = require(path.join(__dirname, 'tools-bridge'));
        const bridge = getToolsBridge();
        allSkills = bridge.getDiscovery().allSkills || [];
    } catch (err) {
        console.warn(`[skill-mapper] Could not load tools-bridge: ${err.message}`);
        return { error: 'tools-bridge not available' };
    }

    // WHY: Early exit if no skills discovered
    if (allSkills.length === 0) {
        return { error: 'No skills discovered — run tools-bridge first' };
    }

    // Load all clone definitions
    let cloneFiles;
    try {
        cloneFiles = fs.readdirSync(CLONES_DIR)
            .filter(f => f.endsWith('.md'))
            .map(f => path.join(CLONES_DIR, f));
    } catch {
        return { error: `Clone directory not found: ${CLONES_DIR}` };
    }

    const clones = cloneFiles.map(f => parseCloneFile(f)).filter(Boolean);
    const squadTags = extractSquadTags();

    // Map each clone to matching skills
    const mappings = clones.map(clone => {
        const matches = matchCloneToSkills(clone, allSkills);
        return {
            id: clone.id,
            name: clone.name,
            domains: clone.domains,
            keywords: clone.keywords,
            matchedSkills: matches.slice(0, 5), // Top 5 matches
            totalMatches: matches.length,
            hasMatch: matches.length > 0,
        };
    });

    // Calculate coverage
    const mapped = mappings.filter(m => m.hasMatch);
    const unmapped = mappings.filter(m => !m.hasMatch);
    const usedSkillIds = new Set();
    mappings.forEach(m => m.matchedSkills.forEach(s => usedSkillIds.add(s.skillId)));

    return {
        totalClones: clones.length,
        totalSkills: allSkills.length,
        totalSquadTags: squadTags.length,
        mapped: mapped.length,
        unmapped: unmapped.length,
        coveragePercent: Math.round((mapped.length / clones.length) * 100),
        skillsUsed: usedSkillIds.size,
        skillsUnused: allSkills.length - usedSkillIds.size,
        mappings,
        unmappedClones: unmapped.map(m => ({ id: m.id, name: m.name, domains: m.domains })),
    };
}

// ── CLI Interface ────────────────────────────────────────────

if (require.main === module) {
    const verbose = process.argv.includes('--verbose');
    const jsonOut = process.argv.includes('--json');

    const result = verify();

    if (result.error) {
        console.error(`Error: ${result.error}`);
        process.exit(1);
    }

    if (jsonOut) {
        console.log(JSON.stringify(result, null, 2));
        process.exit(0);
    }

    console.log('\n⚡ AIOS Skill Mapper v1.0 — Mind Clone → Skill Verification');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log(`   Clones scanned:    ${result.totalClones}`);
    console.log(`   Skills available:  ${result.totalSkills}`);
    console.log(`   Squad tags:        ${result.totalSquadTags}`);
    console.log(`   Clones mapped:     ${result.mapped}/${result.totalClones} (${result.coveragePercent}%)`);
    console.log(`   Skills utilized:   ${result.skillsUsed}/${result.totalSkills}`);
    console.log('');

    if (verbose) {
        console.log('── MAPPED CLONES ──────────────────────────────────────\n');
        result.mappings.filter(m => m.hasMatch).forEach(m => {
            console.log(`  ${m.name} (${m.id})`);
            console.log(`    Domains: [${m.domains.join(', ')}]`);
            console.log(`    Keywords: [${m.keywords.join(', ')}]`);
            console.log(`    Matched skills (${m.totalMatches} total, top 5):`);
            m.matchedSkills.forEach(s => {
                console.log(`      → ${s.skillId} (score: ${s.score}) [${s.reasons.join(', ')}]`);
            });
            console.log('');
        });
    }

    if (result.unmapped.length > 0) {
        console.log('── UNMAPPED CLONES (no skill match found) ─────────────\n');
        result.unmappedClones.forEach(u => {
            console.log(`  ⚠ ${u.name} (${u.id}) — domains: [${u.domains.join(', ')}]`);
        });
        console.log('');
        console.log('  NOTE: Unmapped clones still function — they use pure');
        console.log('  knowledge-layer reasoning without specific tool skills.');
        console.log('  Consider adding matching skills to tools/integrations/');
        console.log('  if these clones need tool-augmented capabilities.\n');
    }

    // Save mapping report
    const reportPath = path.join(AIOS_ROOT, '.aios-core', 'data', 'skill-mapping-report.json');
    try {
        const dataDir = path.dirname(reportPath);
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
        fs.writeFileSync(reportPath, JSON.stringify(result, null, 2));
        console.log(`   Report saved: ${reportPath}\n`);
    } catch (err) {
        console.warn(`   Could not save report: ${err.message}\n`);
    }

    // Emit event
    try {
        const { publish } = require(path.join(__dirname, 'event-bus'));
        publish('skills:mapped', {
            clones: result.totalClones,
            mapped: result.mapped,
            coverage: result.coveragePercent,
        }, { source: 'skill-mapper' });
    } catch {
        // WHY: Event bus not available in standalone mode — normal
    }
}

module.exports = { verify, parseCloneFile, matchCloneToSkills, extractSquadTags };
