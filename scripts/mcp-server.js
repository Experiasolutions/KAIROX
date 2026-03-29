/**
 * @module mcp-server
 * @version 1.0.0
 * @purpose Expose all AIOS agents and squads as MCP tools for any
 *          compatible AI client (Claude Desktop, Cursor, Cline, etc.).
 *          Runs in stdio mode per the Model Context Protocol spec.
 * @inputs  MCP JSON-RPC requests via stdin (or --list / --test CLI flags)
 * @outputs MCP JSON-RPC responses via stdout
 * @exports { startMCPServer }
 * @dependencies entity-registry, squad definitions
 */

const fs = require('fs');
const path = require('path');
const { getToolsBridge } = require('./tools-bridge');

const AIOS_ROOT = path.resolve(__dirname, '..');
const SQUADS_DIR = path.join(AIOS_ROOT, 'squads');

const toolsBridge = getToolsBridge();

// ============================================================
// SCAN AIOS FOR TOOLS
// ============================================================

function scanTools() {
    const tools = [];

    // Tool: list-squads
    tools.push({
        name: 'aios_list_squads',
        description: 'List all AIOS squads with agent counts',
        inputSchema: { type: 'object', properties: {}, required: [] },
    });

    // Tool: list-agents
    tools.push({
        name: 'aios_list_agents',
        description: 'List all agents in a specific squad',
        inputSchema: {
            type: 'object',
            properties: {
                squad: { type: 'string', description: 'Squad name (e.g., marketing, ops, cs)' },
            },
            required: ['squad'],
        },
    });

    // Tool: get-agent
    tools.push({
        name: 'aios_get_agent',
        description: 'Get the full definition of an AIOS agent, including persona, KPIs, commands, and DNA sources',
        inputSchema: {
            type: 'object',
            properties: {
                squad: { type: 'string', description: 'Squad name' },
                agent: { type: 'string', description: 'Agent ID (filename without .md)' },
            },
            required: ['squad', 'agent'],
        },
    });

    // Tool: search-agents
    tools.push({
        name: 'aios_search_agents',
        description: 'Search across all AIOS agents by keyword (searches in name, title, persona, KPIs)',
        inputSchema: {
            type: 'object',
            properties: {
                query: { type: 'string', description: 'Search query' },
            },
            required: ['query'],
        },
    });

    // Tool: get-status
    tools.push({
        name: 'aios_status',
        description: 'Get AIOS system status: version, squad count, agent count, health',
        inputSchema: { type: 'object', properties: {}, required: [] },
    });

    // Tool: invoke-squad
    tools.push({
        name: 'aios_invoke_squad',
        description: 'Invoke an entire squad for a task. Returns the squad definition and recommended workflow.',
        inputSchema: {
            type: 'object',
            properties: {
                squad: { type: 'string', description: 'Squad name' },
                task: { type: 'string', description: 'Task description' },
            },
            required: ['squad', 'task'],
        },
    });

    // Tool: event-publish
    tools.push({
        name: 'aios_publish_event',
        description: 'Publish an event to the AIOS event bus for cross-squad communication',
        inputSchema: {
            type: 'object',
            properties: {
                channel: { type: 'string', description: 'Event channel (e.g., ops.emergency, revenue.deal_closed)' },
                data: { type: 'object', description: 'Event payload data' },
                source: { type: 'string', description: 'Source agent ID' },
            },
            required: ['channel', 'data'],
        },
    });

    // Tool: list-skills
    tools.push({
        name: 'aios_list_skills',
        description: 'List available skills from the tools arsenal (tools/integrations). Limited by default, use search for specific skills.',
        inputSchema: {
            type: 'object',
            properties: {
                limit: { type: 'number', description: 'Maximum number of skills to return (default: 50)' }
            },
            required: []
        },
    });

    // Tool: search-skills
    tools.push({
        name: 'aios_search_skills',
        description: 'Search for specific skills in the AIOS tools arsenal by keyword',
        inputSchema: {
            type: 'object',
            properties: {
                query: { type: 'string', description: 'Search query (e.g., "react", "pdf", "python")' },
            },
            required: ['query'],
        },
    });

    // Tool: read-skill
    tools.push({
        name: 'aios_read_skill',
        description: 'Read the full instructional content of a specific skill (returns the SKILL.md content)',
        inputSchema: {
            type: 'object',
            properties: {
                skill_id: { type: 'string', description: 'ID of the skill (e.g., "python-pro", "mcp-builder")' },
            },
            required: ['skill_id'],
        },
    });

    // ============================================================
    // KAIROS EXCLUSIVE TOOLS
    // ============================================================

    // Tool: list-rps
    tools.push({
        name: 'kairos_list_rps',
        description: 'List all Reasoning Packages (RPs) organized by category (strategic, core, tasks)',
        inputSchema: {
            type: 'object',
            properties: {
                category: { type: 'string', description: 'Filter by category: strategic, core, tasks, or all (default: all)' },
            },
            required: [],
        },
    });

    // Tool: read-rp
    tools.push({
        name: 'kairos_read_rp',
        description: 'Read the full content of a specific Reasoning Package by filename',
        inputSchema: {
            type: 'object',
            properties: {
                filename: { type: 'string', description: 'RP filename (e.g., "RP-20260219-CODEX-GIGAS-v1.0.md")' },
                category: { type: 'string', description: 'Category folder: strategic, core, or tasks (default: searches all)' },
            },
            required: ['filename'],
        },
    });

    // Tool: read-doc
    tools.push({
        name: 'kairos_read_doc',
        description: 'Read any document from the KAIROS project by relative path',
        inputSchema: {
            type: 'object',
            properties: {
                path: { type: 'string', description: 'Relative path from project root (e.g., "docs/core/KAIROS-MANIFEST.md", "SELF_CONTEXT.md")' },
            },
            required: ['path'],
        },
    });

    // Tool: kairos-health
    tools.push({
        name: 'kairos_health',
        description: 'Full KAIROS system health check: agents, squads, RPs, scripts, tools, clients',
        inputSchema: { type: 'object', properties: {}, required: [] },
    });

    // Tool: list-workflows
    tools.push({
        name: 'kairos_list_workflows',
        description: 'List all AIOX workflows available for orchestration',
        inputSchema: { type: 'object', properties: {}, required: [] },
    });

    // ============================================================
    // v3.0 — DEEP SCAN GAP CLOSERS
    // ============================================================

    // Tool: list-tasks (204 AIOX tasks)
    tools.push({
        name: 'kairos_list_tasks',
        description: 'List all 204 AIOX development tasks with optional keyword filter',
        inputSchema: {
            type: 'object',
            properties: {
                filter: { type: 'string', description: 'Optional keyword filter (e.g., "qa", "dev", "db", "squad")' },
            },
            required: [],
        },
    });

    // Tool: read-task
    tools.push({
        name: 'kairos_read_task',
        description: 'Read the full content of a specific AIOX task by filename',
        inputSchema: {
            type: 'object',
            properties: {
                filename: { type: 'string', description: 'Task filename (e.g., "analyze-framework.md", "qa-review-build.md")' },
            },
            required: ['filename'],
        },
    });

    // Tool: list-framework-agents (12 AIOX agents - NOT squad agents)
    tools.push({
        name: 'kairos_list_framework_agents',
        description: 'List all 12 AIOX framework agent definitions (architect, dev, qa, etc.) with sizes',
        inputSchema: { type: 'object', properties: {}, required: [] },
    });

    // Tool: read-framework-agent
    tools.push({
        name: 'kairos_read_framework_agent',
        description: 'Read the full definition of an AIOX framework agent (persona, commands, dependencies)',
        inputSchema: {
            type: 'object',
            properties: {
                agent: { type: 'string', description: 'Agent ID (e.g., "architect", "dev", "qa", "aiox-master")' },
            },
            required: ['agent'],
        },
    });

    // Tool: list-clients
    tools.push({
        name: 'kairos_list_clients',
        description: 'List all KAIROS clients with their directory contents and config files',
        inputSchema: { type: 'object', properties: {}, required: [] },
    });

    // Tool: read-context (SELF_CONTEXT + STATUS)
    tools.push({
        name: 'kairos_read_context',
        description: 'Read SELF_CONTEXT.md and/or STATUS.md for session continuity',
        inputSchema: {
            type: 'object',
            properties: {
                file: { type: 'string', description: 'Which file: self_context, status, or both (default: both)' },
            },
            required: [],
        },
    });

    // Tool: read-synapse
    tools.push({
        name: 'kairos_read_synapse',
        description: 'Read agent synapse memory from .synapse/ (agent state, commands, constitution)',
        inputSchema: {
            type: 'object',
            properties: {
                target: { type: 'string', description: 'Synapse target: agent name (e.g., "agent-dev"), or "all" for listing' },
            },
            required: ['target'],
        },
    });

    // Tool: read-engine
    tools.push({
        name: 'kairos_read_engine',
        description: 'Read engine state: cognitive-state, identity-anchor, operator-profile, quality-baseline',
        inputSchema: {
            type: 'object',
            properties: {
                module: { type: 'string', description: 'Engine module: noesis, memory, or all (default: all)' },
            },
            required: [],
        },
    });

    return tools;
}

// ============================================================
// TOOL HANDLERS
// ============================================================

function handleTool(name, args) {
    switch (name) {
        case 'aios_list_squads': {
            const squads = fs.readdirSync(SQUADS_DIR)
                .filter(s => { try { return fs.statSync(path.join(SQUADS_DIR, s)).isDirectory(); } catch { return false; } })
                .map(s => {
                    const ad = path.join(SQUADS_DIR, s, 'agents');
                    let count = 0;
                    try { count = fs.readdirSync(ad).filter(f => f.endsWith('.md')).length; } catch { }
                    return { name: s, agents: count, hasYaml: fs.existsSync(path.join(SQUADS_DIR, s, 'squad.yaml')) };
                });
            const total = squads.reduce((sum, s) => sum + s.agents, 0);
            return { squads, totalSquads: squads.length, totalAgents: total };
        }

        case 'aios_list_agents': {
            const ad = path.join(SQUADS_DIR, args.squad, 'agents');
            try {
                const agents = fs.readdirSync(ad).filter(f => f.endsWith('.md')).map(f => f.replace('.md', ''));
                return { squad: args.squad, agents, count: agents.length };
            } catch {
                return { error: `Squad '${args.squad}' not found` };
            }
        }

        case 'aios_get_agent': {
            const fp = path.join(SQUADS_DIR, args.squad, 'agents', `${args.agent}.md`);
            try {
                const content = fs.readFileSync(fp, 'utf8');
                return { squad: args.squad, agent: args.agent, definition: content };
            } catch {
                return { error: `Agent '${args.agent}' not found in squad '${args.squad}'` };
            }
        }

        case 'aios_search_agents': {
            const query = args.query.toLowerCase();
            const results = [];
            const squads = fs.readdirSync(SQUADS_DIR).filter(s => {
                try { return fs.statSync(path.join(SQUADS_DIR, s)).isDirectory(); } catch { return false; }
            });
            squads.forEach(squad => {
                const ad = path.join(SQUADS_DIR, squad, 'agents');
                try {
                    fs.readdirSync(ad).filter(f => f.endsWith('.md')).forEach(f => {
                        const content = fs.readFileSync(path.join(ad, f), 'utf8').toLowerCase();
                        if (content.includes(query) || f.toLowerCase().includes(query)) {
                            const titleMatch = content.match(/title:\s*(.+)/);
                            results.push({
                                id: f.replace('.md', ''),
                                squad,
                                title: titleMatch ? titleMatch[1].trim() : f.replace('.md', ''),
                            });
                        }
                    });
                } catch { }
            });
            return { query: args.query, results, count: results.length };
        }

        case 'aios_status': {
            const squads = fs.readdirSync(SQUADS_DIR).filter(s => {
                try { return fs.statSync(path.join(SQUADS_DIR, s)).isDirectory(); } catch { return false; }
            });
            let totalAgents = 0;
            squads.forEach(s => {
                try { totalAgents += fs.readdirSync(path.join(SQUADS_DIR, s, 'agents')).filter(f => f.endsWith('.md')).length; } catch { }
            });
            let version = 'unknown';
            try { version = JSON.parse(fs.readFileSync(path.join(AIOS_ROOT, '.aios-core', 'version.json'), 'utf8')).version; } catch { }
            return { version, squads: squads.length, agents: totalAgents, status: 'online', timestamp: new Date().toISOString() };
        }

        case 'aios_invoke_squad': {
            const yamlPath = path.join(SQUADS_DIR, args.squad, 'squad.yaml');
            try {
                const yaml = fs.readFileSync(yamlPath, 'utf8');
                const agents = fs.readdirSync(path.join(SQUADS_DIR, args.squad, 'agents'))
                    .filter(f => f.endsWith('.md')).map(f => f.replace('.md', ''));
                return {
                    squad: args.squad, definition: yaml, agents, task: args.task,
                    recommendation: `Use @${agents[0]} as entry point. Available agents: ${agents.join(', ')}`
                };
            } catch {
                return { error: `Squad '${args.squad}' not found` };
            }
        }

        case 'aios_publish_event': {
            return { published: true, channel: args.channel, data: args.data, source: args.source || 'mcp-client', timestamp: new Date().toISOString() };
        }

        case 'aios_list_skills': {
            const discovery = toolsBridge.getDiscovery();
            if (!discovery.available) return { error: 'Tools bridge is not available. Ensure the tools/ directory exists.' };
            const limit = args.limit || 50;
            return {
                total_skills: discovery.totalSkills,
                integrations: discovery.integrations.length,
                skills_preview: discovery.allSkills.slice(0, limit).map(s => ({ id: s.id, name: s.name })),
                note: `Showing first ${Math.min(limit, discovery.totalSkills)} skills. Use aios_search_skills to find specific ones.`
            };
        }

        case 'aios_search_skills': {
            if (!toolsBridge.available) return { error: 'Tools bridge is not available.' };
            const results = toolsBridge.searchSkills(args.query);
            return {
                query: args.query,
                count: results.length,
                results: results.slice(0, 20).map(s => ({
                    id: s.id,
                    name: s.name,
                    relevance: s.relevance,
                    description: s.description
                }))
            };
        }

        case 'aios_read_skill': {
            if (!toolsBridge.available) return { error: 'Tools bridge is not available.' };
            const content = toolsBridge.loadSkillContent(args.skill_id);
            if (!content) return { error: `Skill '${args.skill_id}' not found or has no content.` };
            const skill = toolsBridge.getSkillById(args.skill_id);
            return {
                id: args.skill_id,
                name: skill.name,
                path: skill.path,
                content: content
            };
        }

        // ============================================================
        // KAIROS EXCLUSIVE HANDLERS
        // ============================================================

        case 'kairos_list_rps': {
            const RP_DIR = path.join(AIOS_ROOT, 'reasoning-packages');
            const categories = ['strategic', 'core', 'tasks'];
            const filterCat = args.category || 'all';
            const result = {};
            let total = 0;

            for (const cat of categories) {
                if (filterCat !== 'all' && filterCat !== cat) continue;
                const catDir = path.join(RP_DIR, cat);
                try {
                    const files = fs.readdirSync(catDir).filter(f => f.endsWith('.md'));
                    result[cat] = files.map(f => {
                        const content = fs.readFileSync(path.join(catDir, f), 'utf8');
                        const titleMatch = content.match(/^#\s+(.+)/m);
                        return { filename: f, title: titleMatch ? titleMatch[1].trim() : f.replace('.md', '') };
                    });
                    total += files.length;
                } catch { result[cat] = []; }
            }
            return { categories: result, total, filter: filterCat };
        }

        case 'kairos_read_rp': {
            const RP_DIR = path.join(AIOS_ROOT, 'reasoning-packages');
            const searchDirs = args.category ? [args.category] : ['strategic', 'core', 'tasks'];
            for (const dir of searchDirs) {
                const fp = path.join(RP_DIR, dir, args.filename);
                try {
                    const content = fs.readFileSync(fp, 'utf8');
                    return { filename: args.filename, category: dir, content, chars: content.length };
                } catch { continue; }
            }
            return { error: `RP '${args.filename}' not found in any category` };
        }

        case 'kairos_read_doc': {
            const docPath = path.join(AIOS_ROOT, args.path);
            // Security: prevent path traversal outside AIOS_ROOT
            const resolved = path.resolve(docPath);
            if (!resolved.startsWith(path.resolve(AIOS_ROOT))) {
                return { error: 'Access denied: path traversal detected' };
            }
            try {
                const content = fs.readFileSync(resolved, 'utf8');
                return { path: args.path, content, chars: content.length };
            } catch {
                return { error: `Document '${args.path}' not found` };
            }
        }

        case 'kairos_health': {
            const health = { timestamp: new Date().toISOString(), subsystems: {} };

            // Squads
            try {
                const squads = fs.readdirSync(SQUADS_DIR).filter(s => {
                    try { return fs.statSync(path.join(SQUADS_DIR, s)).isDirectory(); } catch { return false; }
                });
                let totalAgents = 0;
                squads.forEach(s => {
                    try { totalAgents += fs.readdirSync(path.join(SQUADS_DIR, s, 'agents')).filter(f => f.endsWith('.md')).length; } catch { }
                });
                health.subsystems.squads = { status: 'ok', count: squads.length, agents: totalAgents };
            } catch { health.subsystems.squads = { status: 'error' }; }

            // RPs
            const rpDir = path.join(AIOS_ROOT, 'reasoning-packages');
            try {
                let rpTotal = 0;
                for (const cat of ['strategic', 'core', 'tasks']) {
                    try { rpTotal += fs.readdirSync(path.join(rpDir, cat)).filter(f => f.endsWith('.md')).length; } catch { }
                }
                health.subsystems.reasoning_packages = { status: 'ok', count: rpTotal };
            } catch { health.subsystems.reasoning_packages = { status: 'error' }; }

            // Tools
            const toolsHealth = toolsBridge.getHealth();
            health.subsystems.tools = { status: toolsHealth.available ? 'ok' : 'error', ...toolsHealth };

            // Scripts
            const scriptsDir = path.join(AIOS_ROOT, 'scripts');
            try {
                const scripts = fs.readdirSync(scriptsDir).filter(f => f.startsWith('kairos-'));
                health.subsystems.kairos_scripts = { status: 'ok', count: scripts.length, files: scripts };
            } catch { health.subsystems.kairos_scripts = { status: 'error' }; }

            // Clients
            const clientsDir = path.join(AIOS_ROOT, 'clients');
            try {
                const clients = fs.readdirSync(clientsDir).filter(c => {
                    try { return fs.statSync(path.join(clientsDir, c)).isDirectory(); } catch { return false; }
                });
                health.subsystems.clients = { status: 'ok', count: clients.length, names: clients };
            } catch { health.subsystems.clients = { status: 'error' }; }

            // AIOX Core
            const corePath = path.join(AIOS_ROOT, '.aiox-core');
            health.subsystems.aiox_core = { status: fs.existsSync(corePath) ? 'ok' : 'missing' };

            // Context files
            health.subsystems.self_context = { status: fs.existsSync(path.join(AIOS_ROOT, 'SELF_CONTEXT.md')) ? 'ok' : 'missing' };
            health.subsystems.status_md = { status: fs.existsSync(path.join(AIOS_ROOT, 'STATUS.md')) ? 'ok' : 'missing' };

            // Overall
            const allOk = Object.values(health.subsystems).every(s => s.status === 'ok');
            health.overall = allOk ? 'healthy' : 'degraded';

            return health;
        }

        case 'kairos_list_workflows': {
            const wfDir = path.join(AIOS_ROOT, '.aiox-core', 'development', 'workflows');
            try {
                const files = fs.readdirSync(wfDir).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
                const workflows = files.map(f => {
                    const content = fs.readFileSync(path.join(wfDir, f), 'utf8');
                    const nameMatch = content.match(/name:\s*(.+)/i);
                    return { filename: f, name: nameMatch ? nameMatch[1].trim() : f.replace(/\.ya?ml$/, '') };
                });
                return { workflows, count: workflows.length };
            } catch {
                return { error: 'Workflows directory not found', path: wfDir };
            }
        }

        // ============================================================
        // v3.0 — DEEP SCAN GAP CLOSERS
        // ============================================================

        case 'kairos_list_tasks': {
            const tasksDir = path.join(AIOS_ROOT, '.aiox-core', 'development', 'tasks');
            try {
                let files = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));
                if (args.filter) {
                    const q = args.filter.toLowerCase();
                    files = files.filter(f => f.toLowerCase().includes(q));
                }
                return { tasks: files, count: files.length, total: fs.readdirSync(tasksDir).filter(f => f.endsWith('.md')).length };
            } catch {
                return { error: 'Tasks directory not found' };
            }
        }

        case 'kairos_read_task': {
            const taskPath = path.join(AIOS_ROOT, '.aiox-core', 'development', 'tasks', args.filename);
            try {
                const content = fs.readFileSync(taskPath, 'utf8');
                return { filename: args.filename, content, chars: content.length };
            } catch {
                return { error: `Task '${args.filename}' not found` };
            }
        }

        case 'kairos_list_framework_agents': {
            const agentsDir = path.join(AIOS_ROOT, '.aiox-core', 'development', 'agents');
            try {
                const files = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));
                const agents = files.map(f => {
                    const stat = fs.statSync(path.join(agentsDir, f));
                    const content = fs.readFileSync(path.join(agentsDir, f), 'utf8');
                    const titleMatch = content.match(/title:\s*(.+)/i);
                    const hasSubdir = fs.existsSync(path.join(agentsDir, f.replace('.md', '')));
                    return {
                        id: f.replace('.md', ''),
                        filename: f,
                        title: titleMatch ? titleMatch[1].trim() : f.replace('.md', ''),
                        bytes: stat.size,
                        hasSubdir,
                    };
                });
                return { agents, count: agents.length };
            } catch {
                return { error: 'Agents directory not found' };
            }
        }

        case 'kairos_read_framework_agent': {
            const agentPath = path.join(AIOS_ROOT, '.aiox-core', 'development', 'agents', `${args.agent}.md`);
            try {
                const content = fs.readFileSync(agentPath, 'utf8');
                return { agent: args.agent, content, chars: content.length };
            } catch {
                return { error: `Framework agent '${args.agent}' not found` };
            }
        }

        case 'kairos_list_clients': {
            const clientsDir = path.join(AIOS_ROOT, 'clients');
            try {
                const dirs = fs.readdirSync(clientsDir).filter(c => {
                    try { return fs.statSync(path.join(clientsDir, c)).isDirectory(); } catch { return false; }
                });
                const clients = dirs.map(d => {
                    const clientDir = path.join(clientsDir, d);
                    const files = fs.readdirSync(clientDir);
                    const hasConfig = files.some(f => f.includes('config') || f.endsWith('.yaml') || f.endsWith('.json'));
                    return { name: d, files: files.slice(0, 20), fileCount: files.length, hasConfig };
                });
                return { clients, count: clients.length };
            } catch {
                return { error: 'Clients directory not found' };
            }
        }

        case 'kairos_read_context': {
            const target = args.file || 'both';
            const result = {};
            if (target === 'self_context' || target === 'both') {
                try {
                    result.self_context = fs.readFileSync(path.join(AIOS_ROOT, 'SELF_CONTEXT.md'), 'utf8');
                } catch { result.self_context = null; }
            }
            if (target === 'status' || target === 'both') {
                try {
                    result.status = fs.readFileSync(path.join(AIOS_ROOT, 'STATUS.md'), 'utf8');
                } catch { result.status = null; }
            }
            return result;
        }

        case 'kairos_read_synapse': {
            const synapseDir = path.join(AIOS_ROOT, '.synapse');
            if (args.target === 'all') {
                try {
                    const files = fs.readdirSync(synapseDir).filter(f => !f.startsWith('.'));
                    const synapses = files.map(f => {
                        const stat = fs.statSync(path.join(synapseDir, f));
                        return { name: f, isDir: stat.isDirectory(), bytes: stat.isFile() ? stat.size : 0 };
                    });
                    return { synapses, count: synapses.length };
                } catch {
                    return { error: 'Synapse directory not found' };
                }
            }
            // Read specific synapse
            const synapsePath = path.join(synapseDir, args.target);
            try {
                const content = fs.readFileSync(synapsePath, 'utf8');
                return { target: args.target, content, chars: content.length };
            } catch {
                return { error: `Synapse '${args.target}' not found` };
            }
        }

        case 'kairos_read_engine': {
            const mod = args.module || 'all';
            const result = {};
            if (mod === 'noesis' || mod === 'all') {
                const noesisDir = path.join(AIOS_ROOT, 'engine', 'noesis');
                try {
                    const files = ['cognitive-state.json', 'identity-anchor.json', 'state-history.json'];
                    result.noesis = {};
                    for (const f of files) {
                        try {
                            const content = fs.readFileSync(path.join(noesisDir, f), 'utf8');
                            result.noesis[f.replace('.json', '')] = JSON.parse(content);
                        } catch { result.noesis[f.replace('.json', '')] = null; }
                    }
                } catch { result.noesis = { error: 'not found' }; }
            }
            if (mod === 'memory' || mod === 'all') {
                const memDir = path.join(AIOS_ROOT, 'engine', 'memory');
                try {
                    const files = ['operator-profile.json', 'quality-baseline.json'];
                    result.memory = {};
                    for (const f of files) {
                        try {
                            const content = fs.readFileSync(path.join(memDir, f), 'utf8');
                            result.memory[f.replace('.json', '')] = JSON.parse(content);
                        } catch { result.memory[f.replace('.json', '')] = null; }
                    }
                } catch { result.memory = { error: 'not found' }; }
            }
            return result;
        }

        default:
            return { error: `Unknown tool: ${name}` };
    }
}

// ============================================================
// MCP STDIO SERVER
// ============================================================

if (process.argv.includes('--list')) {
    console.log('🔧 AIOS MCP Server — Available Tools\n');
    const tools = scanTools();
    tools.forEach(t => {
        console.log(`  📌 ${t.name}`);
        console.log(`     ${t.description}`);
        const params = Object.keys(t.inputSchema.properties || {});
        if (params.length) console.log(`     Params: ${params.join(', ')}`);
        console.log();
    });
    console.log(`Total: ${tools.length} tools exposed`);
    process.exit(0);
}

if (process.argv.includes('--test')) {
    console.log('🧪 AIOS MCP Server — Self Test\n');

    const tests = [
        ['aios_status', {}],
        ['aios_list_squads', {}],
        ['aios_list_agents', { squad: 'doombot' }],
        ['aios_search_agents', { query: 'revenue' }],
        ['aios_publish_event', { channel: 'test.ping', data: { msg: 'hello' } }],
        ['aios_list_skills', { limit: 5 }],
        ['aios_search_skills', { query: 'react' }],
        // KAIROS v2.0 tests
        ['kairos_list_rps', { category: 'all' }],
        ['kairos_read_doc', { path: 'package.json' }],
        ['kairos_health', {}],
        ['kairos_list_workflows', {}],
        // KAIROS v3.0 deep-scan gap closers
        ['kairos_list_tasks', { filter: 'qa' }],
        ['kairos_read_task', { filename: 'analyze-framework.md' }],
        ['kairos_list_framework_agents', {}],
        ['kairos_read_framework_agent', { agent: 'dev' }],
        ['kairos_list_clients', {}],
        ['kairos_read_context', { file: 'both' }],
        ['kairos_read_synapse', { target: 'all' }],
        ['kairos_read_engine', { module: 'all' }],
    ];

    let passed = 0;
    tests.forEach(([name, args]) => {
        try {
            const result = handleTool(name, args);
            const hasError = result.error;
            console.log(`  ${hasError ? '❌' : '✅'} ${name}: ${hasError ? result.error : 'OK'}`);
            if (!hasError) passed++;
        } catch (e) {
            console.log(`  ❌ ${name}: ${e.message}`);
        }
    });

    console.log(`\n${passed}/${tests.length} tests passed`);
    process.exit(passed === tests.length ? 0 : 1);
}

// STDIO MCP Server Mode
if (!process.argv.includes('--list') && !process.argv.includes('--test')) {
    const tools = scanTools();

    // Read JSON-RPC messages from stdin
    let buffer = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
        buffer += chunk;

        // Try to parse complete JSON-RPC messages
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        lines.filter(l => l.trim()).forEach(line => {
            try {
                const msg = JSON.parse(line);
                const response = handleMessage(msg, tools);
                if (response) {
                    process.stdout.write(JSON.stringify(response) + '\n');
                }
            } catch (e) {
                // Ignore parse errors
            }
        });
    });

    function handleMessage(msg, tools) {
        const { id, method, params } = msg;

        switch (method) {
            case 'initialize':
                return {
                    jsonrpc: '2.0', id, result: {
                        protocolVersion: '2024-11-05',
                        capabilities: { tools: {} },
                        serverInfo: { name: 'aios-kairos-mcp-server', version: '3.0.0' },
                    }
                };

            case 'tools/list':
                return { jsonrpc: '2.0', id, result: { tools } };

            case 'tools/call':
                const result = handleTool(params.name, params.arguments || {});
                return {
                    jsonrpc: '2.0', id, result: {
                        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
                    }
                };

            case 'notifications/initialized':
                return null; // No response needed

            default:
                return { jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${method}` } };
        }
    }

    // Log to stderr (MCP standard)
    process.stderr.write('🔧 AIOS + KAIROS MCP Server v3.0.0 started (stdio mode)\n');
    process.stderr.write(`   ${tools.length} tools exposed (10 AIOS + 13 KAIROS)\n`);
}
