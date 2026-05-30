/**
 * KAIROS AI OPS - Scheduler Serial (Hardware-safe)
 * 
 * CRÍTICO: Devido à restrição de hardware (6GB RAM, Celeron), 
 * TODAS as tarefas pesadas devem rodar SERIALMENTE. 
 * Nunca usar Promise.all() em tarefas de IA.
 */
const cron = require('node-cron');

// Import dos jobs
// const adminJobs = require('../squads/mvp-admin/jobs');
// const mediaJobs = require('../squads/mvp-media/jobs');
// const analyticsJobs = require('../squads/mvp-analytics/jobs');

console.log('⏰ KAIROS Scheduler-MVP (Serial Mode) Iniciado...');

// Array de clientes ativos para processamento serial
const activeClients = ['leticia', 'paulo', 'hortifruti'];

/**
 * Função utilitária para rodar tarefas em série para cada cliente
 * @param {string} taskName Nome da tarefa
 * @param {Function} taskFunction Função que retorna uma promise (recebe o cliente)
 */
async function runSerially(taskName, taskFunction) {
    console.log(`\n[SCHEDULER] Iniciando tarefa serial: ${taskName}`);
    for (const client of activeClients) {
        try {
            console.log(`  -> Processando: ${client}...`);
            await taskFunction(client);
            console.log(`  -> ${client} ✅`);
        } catch (error) {
            console.error(`  -> Erro em ${client}: ${error.message} ❌`);
        }
    }
    console.log(`[SCHEDULER] Tarefa serial ${taskName} concluída.\n`);
}

// ── 07:00 | Morning Briefing (Admin) ──────────────────────────────
cron.schedule('0 7 * * 1-6', async () => {
    await runSerially('Morning Briefing', async (client) => {
        // Exemplo: await adminJobs.generateDailyBrief(client);
        await new Promise(resolve => setTimeout(resolve, 2000)); // mock
    });
}, { timezone: 'America/Sao_Paulo' });

// ── 12:00 | Fila de Follow-Ups (Commerce) ─────────────────────────
cron.schedule('0 12 * * 1-6', async () => {
    await runSerially('Processamento de Follow-ups', async (client) => {
        // Exemplo: await commerceJobs.checkFollowUpQueue(client);
        await new Promise(resolve => setTimeout(resolve, 2000)); // mock
    });
}, { timezone: 'America/Sao_Paulo' });

// ── 18:00 | Geração de Posts IG (Media) ───────────────────────────
cron.schedule('0 18 * * 1-5', async () => {
    await runSerially('Geração de Conteúdo IG', async (client) => {
        // Exemplo: await mediaJobs.generateDailyPost(client);
        await new Promise(resolve => setTimeout(resolve, 5000)); // mock
    });
}, { timezone: 'America/Sao_Paulo' });

// ── 18:30 | Resumo Semanal (Analytics) - SEXTAS-FEIRAS ────────────
cron.schedule('30 18 * * 5', async () => {
    await runSerially('Fechamento Semanal', async (client) => {
        // Exemplo: await analyticsJobs.generateWeeklyReport(client);
        await new Promise(resolve => setTimeout(resolve, 5000)); // mock
    });
}, { timezone: 'America/Sao_Paulo' });
