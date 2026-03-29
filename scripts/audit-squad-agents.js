#!/usr/bin/env node

/**
 * @module audit-squad-agents
 * @version 1.0.0
 * @purpose Scan all squad agent .md files and report format distribution,
 *          field coverage, and V3 compatibility across all squads.
 * @inputs  squads/ directory (auto-scanned)
 * @outputs Console audit report + data/squad-audit-report.json
 * @dependencies None (standalone)
 */

const fs = require('fs');
const path = require('path');

const SQUADS_DIR = path.join(__dirname, '..', 'squads');

function scanSquadAgents() {
    const results = {
        squads: {},
        totals: {
            totalSquads: 0,
            totalAgents: 0,
            parsable: 0,
            unparsable: 0,
            hasYamlBlock: 0,
            hasFrontmatter: 0,
            hasRawMarkdown: 0,
            withName: 0,
            withRole: 0,
            withTools: 0,
            withDependencies: 0,
        },
    };

    const squadDirs = fs.readdirSync(SQUADS_DIR).filter((d) => {
        const fullPath = path.join(SQUADS_DIR, d);
        return fs.statSync(fullPath).isDirectory() && !d.startsWith('.');
    });

    for (const squad of squadDirs) {
        const agentsDir = path.join(SQUADS_DIR, squad, 'agents');
        if (!fs.existsSync(agentsDir)) {
            continue;
        }

        const agentFiles = fs.readdirSync(agentsDir).filter((f) => f.endsWith('.md'));
        if (agentFiles.length === 0) {
            continue;
        }

        results.squads[squad] = {
            agentCount: agentFiles.length,
            agents: [],
        };
        results.totals.totalSquads++;

        for (const file of agentFiles) {
            const filePath = path.join(agentsDir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            const agent = analyzeAgent(content, file, squad);
            results.squads[squad].agents.push(agent);
            results.totals.totalAgents++;

            if (agent.parsable) results.totals.parsable++;
            else results.totals.unparsable++;

            if (agent.format === 'yaml-block') results.totals.hasYamlBlock++;
            if (agent.format === 'frontmatter') results.totals.hasFrontmatter++;
            if (agent.format === 'raw-markdown') results.totals.hasRawMarkdown++;

            if (agent.hasName) results.totals.withName++;
            if (agent.hasRole) results.totals.withRole++;
            if (agent.hasTools) results.totals.withTools++;
            if (agent.hasDependencies) results.totals.withDependencies++;
        }
    }

    return results;
}

function analyzeAgent(content, filename, squad) {
    const agent = {
        file: filename,
        squad,
        parsable: false,
        format: 'raw-markdown',
        hasName: false,
        hasRole: false,
        hasTools: false,
        hasDependencies: false,
        hasPersona: false,
        hasArchitecture: false,
        v3Compatible: false,
        sizeBytes: Buffer.byteLength(content, 'utf8'),
        lineCount: content.split('\n').length,
    };

    // Check for YAML code block
    const yamlBlockMatch = content.match(/```ya?ml\n([\s\S]*?)\n```/);
    if (yamlBlockMatch) {
        agent.format = 'yaml-block';
        agent.parsable = true;
    }

    // Check for frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
        agent.format = 'frontmatter';
        agent.parsable = true;
    }

    // Check for V3 autoClaude
    if (content.includes('autoClaude')) {
        agent.v3Compatible = true;
    }

    // Field detection (works regardless of format)
    agent.hasName = /name:/i.test(content) || /^# .+/m.test(content);
    agent.hasRole = /role:/i.test(content) || /title:/i.test(content);
    agent.hasTools = /tools:/i.test(content) || /arsenal/i.test(content);
    agent.hasDependencies = /dependencies:/i.test(content) || /depends/i.test(content);
    agent.hasPersona = /persona/i.test(content) || /identity/i.test(content);
    agent.hasArchitecture = /architecture/i.test(content) || /layers/i.test(content);

    return agent;
}

function formatReport(results) {
    const lines = [];
    lines.push('');
    lines.push('═══════════════════════════════════════════════════');
    lines.push('  🔍 AIOS Squad Agent Audit Report');
    lines.push('═══════════════════════════════════════════════════');
    lines.push('');

    // Summary
    const t = results.totals;
    lines.push(`  📊 Total: ${t.totalSquads} squads, ${t.totalAgents} agents`);
    lines.push('');
    lines.push('  Format Distribution:');
    lines.push(`    YAML Block:     ${t.hasYamlBlock} agents`);
    lines.push(`    Frontmatter:    ${t.hasFrontmatter} agents`);
    lines.push(`    Raw Markdown:   ${t.hasRawMarkdown} agents`);
    lines.push('');
    lines.push('  Field Coverage:');
    lines.push(`    Has Name/Title: ${t.withName}/${t.totalAgents} (${Math.round(t.withName / t.totalAgents * 100)}%)`);
    lines.push(`    Has Role:       ${t.withRole}/${t.totalAgents} (${Math.round(t.withRole / t.totalAgents * 100)}%)`);
    lines.push(`    Has Tools:      ${t.withTools}/${t.totalAgents} (${Math.round(t.withTools / t.totalAgents * 100)}%)`);
    lines.push(`    Has Persona:    ${t.withName > 0 ? results.totals.totalAgents : 0} checked`);
    lines.push('');
    lines.push('  V3 Compatibility:');
    const v3Count = Object.values(results.squads)
        .flatMap((s) => s.agents)
        .filter((a) => a.v3Compatible).length;
    lines.push(`    V3 (autoClaude): ${v3Count}/${t.totalAgents}`);
    lines.push(`    V2 (legacy):     ${t.totalAgents - v3Count}/${t.totalAgents}`);
    lines.push('');

    // Per-squad breakdown
    lines.push('───────────────────────────────────────────────────');
    lines.push('  Per-Squad Breakdown:');
    lines.push('───────────────────────────────────────────────────');

    for (const [squad, data] of Object.entries(results.squads).sort((a, b) => b[1].agentCount - a[1].agentCount)) {
        const v3Agents = data.agents.filter((a) => a.v3Compatible).length;
        const yamlAgents = data.agents.filter((a) => a.format !== 'raw-markdown').length;
        lines.push(`  ${squad.padEnd(20)} ${String(data.agentCount).padStart(3)} agents | YAML: ${yamlAgents} | V3: ${v3Agents}`);
    }

    lines.push('');
    lines.push('═══════════════════════════════════════════════════');

    return lines.join('\n');
}

// Run
const results = scanSquadAgents();
console.log(formatReport(results));

// Also save as JSON
const reportPath = path.join(__dirname, '..', 'data', 'squad-audit-report.json');
fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
console.log(`\n  💾 Full report saved to: data/squad-audit-report.json\n`);
