/**
 * @module scheduler
 * @version 1.0.0
 * @purpose Autonomous proactive agent that runs scheduled tasks at defined
 *          intervals (health checks, metrics collection, memory cleanup,
 *          daily reports, Synapse health, WIS learning). All executions
 *          are logged to the memory system.
 * @inputs  None in daemon mode; CLI flags for status/run/history/tasks
 * @outputs Memory entries for each execution + console status reports
 * @dependencies memory-system.js, kernel-bridge.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const memory = require('./memory-system');
const { getBridge } = require('./kernel-bridge');
const https = require('https');
const { execSync } = require('child_process');
const path = require('path');

const SCRIPTS_DIR = __dirname;
const PROJECT_DIR = path.join(__dirname, '..');

// ── Scheduled Tasks ──────────────────────────────────────────
const TASKS = [
    {
        id: 'health-check',
        name: '🏥 Health Check',
        interval: 4 * 60 * 60 * 1000, // 4 hours
        description: 'Verifica status de todos os sistemas AIOS',
        action: async () => {
            const checks = {};

            // Check Groq
            try {
                await httpGet('https://api.groq.com/openai/v1/models', {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                });
                checks.groq = '✅ online';
            } catch { checks.groq = '❌ offline'; }

            // Check ClickUp
            try {
                await httpGet('https://api.clickup.com/api/v2/team', {
                    'Authorization': process.env.CLICKUP_API_KEY,
                });
                checks.clickup = '✅ online';
            } catch { checks.clickup = '❌ offline'; }

            // Check Instagram
            try {
                const igId = process.env.INSTAGRAM_BUSINESS_ID;
                const token = process.env.INSTAGRAM_ACCESS_TOKEN;
                await httpGet(`https://graph.facebook.com/v19.0/${igId}?fields=id&access_token=${token}`, {});
                checks.instagram = '✅ online';
            } catch { checks.instagram = '❌ offline'; }

            const summary = Object.entries(checks).map(([k, v]) => `${k}: ${v}`).join(' | ');
            const allHealthy = !summary.includes('❌');

            memory.store('metrics', `Health Check: ${summary}`, { checks, healthy: allHealthy });

            return {
                status: allHealthy ? 'HEALTHY' : 'DEGRADED',
                details: checks,
                summary,
            };
        },
    },
    {
        id: 'instagram-metrics',
        name: '📸 Instagram Metrics',
        interval: 6 * 60 * 60 * 1000, // 6 hours
        description: 'Coleta métricas do Instagram',
        action: async () => {
            const igId = process.env.INSTAGRAM_BUSINESS_ID;
            const token = process.env.INSTAGRAM_ACCESS_TOKEN;
            if (!igId || !token) return { status: 'SKIPPED', reason: 'No Instagram credentials' };

            const data = await httpGet(
                `https://graph.facebook.com/v19.0/${igId}?fields=followers_count,media_count&access_token=${token}`, {}
            );
            const profile = JSON.parse(data);

            memory.store('metrics', `Instagram: ${profile.followers_count} seguidores, ${profile.media_count} posts`, {
                followers: profile.followers_count,
                posts: profile.media_count,
            });

            return { status: 'OK', followers: profile.followers_count, posts: profile.media_count };
        },
    },
    {
        id: 'clickup-summary',
        name: '📋 ClickUp Summary',
        interval: 8 * 60 * 60 * 1000, // 8 hours
        description: 'Resume status de tarefas no ClickUp',
        action: async () => {
            if (!process.env.CLICKUP_API_KEY) return { status: 'SKIPPED', reason: 'No ClickUp key' };

            const teamData = await httpGet('https://api.clickup.com/api/v2/team', {
                'Authorization': process.env.CLICKUP_API_KEY,
            });
            const teams = JSON.parse(teamData);
            const memberCount = teams.teams[0]?.members?.length || 0;

            memory.store('metrics', `ClickUp: Team com ${memberCount} membros`, {
                members: memberCount,
            });

            return { status: 'OK', members: memberCount };
        },
    },
    {
        id: 'memory-cleanup',
        name: '🧹 Memory Cleanup',
        interval: 24 * 60 * 60 * 1000, // 24 hours
        description: 'Limpa memórias antigas e gera resumo diário',
        action: async () => {
            const s = memory.stats();

            memory.store('context', `Resumo diário: ${s.total} memórias totais, ${s.today} hoje. Categorias: ${JSON.stringify(s.categories)}`, {
                stats: s,
            });

            return { status: 'OK', total: s.total, today: s.today };
        },
    },
    {
        id: 'daily-report',
        name: '📊 Daily Report',
        interval: 24 * 60 * 60 * 1000, // 24 hours
        description: 'Gera relatório diário de atividades',
        action: async () => {
            const s = memory.stats();
            const recentItems = memory.recent(5);

            const report = {
                date: new Date().toLocaleDateString('pt-BR'),
                memoriesTotal: s.total,
                memoriesToday: s.today,
                categories: s.categories,
                lastActions: recentItems.map(m => m.content.substring(0, 60)),
            };

            memory.store('knowledge', `Relatório diário ${report.date}: ${s.today} ações, ${s.total} memórias acumuladas`, {
                report,
            });

            return { status: 'OK', report };
        },
    },
    {
        id: 'synapse-health',
        name: '🧠 Synapse Health',
        interval: 4 * 60 * 60 * 1000, // 4 hours
        description: 'Runs Synapse pipeline test and logs kernel metrics',
        action: async () => {
            const bridge = getBridge();
            if (!bridge.synapse.available) {
                return { status: 'SKIPPED', reason: 'Synapse not loaded' };
            }
            const result = await bridge.synapse.process('Scheduled health check', { prompt_count: 0 });
            const health = bridge.getSystemHealth();
            const summary = `Synapse: ${result.metrics.layers_loaded || 0} layers, ${Math.round(result.metrics.total_ms || 0)}ms | IDS: ${health.modules.ids.entities} entities | WIS: ${(health.modules.wis.workflows || []).length} workflows | Overall: ${health.overall}`;

            memory.store('metrics', `Kernel Health: ${summary}`, {
                synapse: result.metrics,
                overall: health.overall,
            });

            return { status: health.overall, summary };
        },
    },
    {
        id: 'wis-learn',
        name: '📖 WIS Pattern Learning',
        interval: 12 * 60 * 60 * 1000, // 12 hours
        description: 'Triggers WIS pattern learning cycle if learning module is available',
        action: async () => {
            const bridge = getBridge();
            if (!bridge.wis.available) {
                return { status: 'SKIPPED', reason: 'WIS not loaded' };
            }
            if (!bridge.wis.hasLearning()) {
                return { status: 'SKIPPED', reason: 'Learning module not available' };
            }
            const stats = bridge.wis.getStats();
            memory.store('metrics', `WIS Learning: ${stats.workflowCount || 0} workflows, ${stats.patternCount || 0} patterns`, {
                stats,
            });
            return { status: 'OK', stats };
        },
    },
];

// ── HTTP Helper ──────────────────────────────────────────────
function httpGet(url, headers) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            method: 'GET',
            headers,
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => res.statusCode < 300 ? resolve(data) : reject(new Error(`HTTP ${res.statusCode}`)));
        });
        req.on('error', reject);
        req.end();
    });
}

// ── Scheduler Engine ─────────────────────────────────────────
const taskTimers = {};
const lastRun = {};
const nextRun = {};

function scheduleTask(task) {
    // Calculate next run
    nextRun[task.id] = new Date(Date.now() + task.interval);

    const runner = async () => {
        const startTime = Date.now();
        console.log(`\n⏰ [${new Date().toLocaleTimeString('pt-BR')}] Executando: ${task.name}`);

        try {
            const result = await task.action();
            const duration = Date.now() - startTime;
            lastRun[task.id] = { time: new Date().toISOString(), duration, status: result.status };
            nextRun[task.id] = new Date(Date.now() + task.interval);

            console.log(`   ✅ ${result.status} (${duration}ms)`);
            if (result.summary) console.log(`   📋 ${result.summary}`);

        } catch (err) {
            const duration = Date.now() - startTime;
            lastRun[task.id] = { time: new Date().toISOString(), duration, status: 'ERROR', error: err.message };
            nextRun[task.id] = new Date(Date.now() + task.interval);

            console.log(`   ❌ Erro: ${err.message.substring(0, 80)}`);
            memory.store('alerts', `Scheduler erro em ${task.name}: ${err.message}`, { taskId: task.id });
        }
    };

    // Run immediately on start, then at interval
    setTimeout(runner, 3000 + Math.random() * 5000); // Stagger initial runs
    taskTimers[task.id] = setInterval(runner, task.interval);
}

function showStatus() {
    console.log('\n═══════════════════════════════════════════════════');
    console.log('  ⏰ AIOS Scheduler — Status');
    console.log('═══════════════════════════════════════════════════\n');

    for (const task of TASKS) {
        const last = lastRun[task.id];
        const next = nextRun[task.id];
        console.log(`  ${task.name}`);
        console.log(`    Intervalo: ${formatInterval(task.interval)}`);
        if (last) {
            console.log(`    Última: ${last.time} (${last.status}, ${last.duration}ms)`);
        } else {
            console.log(`    Última: nunca`);
        }
        if (next) {
            const diff = next - Date.now();
            console.log(`    Próxima: em ${formatInterval(diff > 0 ? diff : 0)}`);
        }
        console.log('');
    }
}

async function runSingle(taskId) {
    const task = TASKS.find(t => t.id === taskId);
    if (!task) {
        console.log(`❌ Task "${taskId}" não encontrada.`);
        console.log(`   Disponíveis: ${TASKS.map(t => t.id).join(', ')}`);
        return;
    }
    console.log(`\n⏰ Executando: ${task.name}...`);
    try {
        const result = await task.action();
        console.log(`✅ Resultado:`, JSON.stringify(result, null, 2));
    } catch (err) {
        console.log(`❌ Erro: ${err.message}`);
    }
}

function formatInterval(ms) {
    if (ms >= 86400000) return `${(ms / 86400000).toFixed(0)}h`;
    if (ms >= 3600000) return `${(ms / 3600000).toFixed(0)}h`;
    if (ms >= 60000) return `${(ms / 60000).toFixed(0)}min`;
    return `${(ms / 1000).toFixed(0)}s`;
}

// ── Main ─────────────────────────────────────────────────────
async function main() {
    const args = process.argv.slice(2);

    if (args[0] === '--status') {
        showStatus();
        return;
    }
    if (args[0] === '--run') {
        await runSingle(args[1]);
        return;
    }
    if (args[0] === '--history') {
        const alerts = memory.byCategory('metrics', 20);
        console.log('\n📊 Histórico de execuções:\n');
        for (const m of alerts) {
            console.log(`  ${m.timestamp} | ${m.content.substring(0, 80)}`);
        }
        return;
    }
    if (args[0] === '--tasks') {
        console.log('\n📋 Tarefas disponíveis:\n');
        for (const t of TASKS) {
            console.log(`  ${t.id} — ${t.name}`);
            console.log(`    ${t.description} (a cada ${formatInterval(t.interval)})\n`);
        }
        return;
    }

    // Start scheduler
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('  ⏰ AIOS Scheduler — Modo Autônomo');
    console.log('═══════════════════════════════════════════════════');
    console.log('');
    console.log(`  ${TASKS.length} tarefas agendadas:`);
    for (const task of TASKS) {
        console.log(`    ${task.name} — a cada ${formatInterval(task.interval)}`);
    }
    console.log('');
    console.log('  Pressione Ctrl+C para parar');
    console.log('');

    memory.store('context', 'Scheduler iniciado com ' + TASKS.length + ' tarefas', {
        tasks: TASKS.map(t => t.id),
    });

    for (const task of TASKS) {
        scheduleTask(task);
    }
}

main().catch(console.error);
