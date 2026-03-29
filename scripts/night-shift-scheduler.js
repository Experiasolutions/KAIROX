/** @purpose Schedule and orchestrate night shift automation cycles */
/**
 * KAIROS Night Shift Scheduler
 * 
 * Runs automated tasks overnight in SERIAL sequence
 * to respect 8GB RAM constraint. Each task completes
 * before the next begins.
 * 
 * Usage: node scripts/night-shift-scheduler.js
 * Daemon: pm2 start scripts/night-shift-scheduler.js --name "kairos-night-shift"
 * 
 * Tasks:
 *   00:00 — Evolution Engine cycle
 *   04:00 — Cognitive State compression
 *   06:00 — Morning Brief → Telegram
 */

require('dotenv').config();
const schedule = require('node-schedule');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const https = require('https');

const ROOT = path.resolve(__dirname, '..');
const REPORT_DIR = path.join(ROOT, 'engine', 'night-reports');
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_ALLOWED_USER_ID;

// Ensure report directory exists
if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });

// ─── Helpers ───

function timestamp() {
    return new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
}

function runAsync(cmd, label, timeoutMs = 300000) {
    return new Promise((resolve) => {
        console.log(`[NIGHT] ${new Date().toISOString()} — Iniciando: ${label}`);
        const child = exec(cmd, { cwd: ROOT, timeout: timeoutMs, maxBuffer: 5 * 1024 * 1024 }, (err, stdout, stderr) => {
            if (err) {
                console.error(`[NIGHT] ❌ Erro em ${label}:`, err.message);
                resolve({ success: false, label, error: err.message, output: stderr || '' });
            } else {
                console.log(`[NIGHT] ✅ ${label} concluído`);
                resolve({ success: true, label, output: stdout.trim() });
            }
        });
    });
}

function sendTelegram(text) {
    if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
        console.log('[NIGHT] ⚠️ Telegram not configured — skipping notification');
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        const postData = JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: text.substring(0, 4000),
            parse_mode: 'Markdown',
        });

        const req = https.request({
            hostname: 'api.telegram.org',
            path: `/bot${TELEGRAM_TOKEN}/sendMessage`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) },
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve());
        });

        req.on('error', (e) => {
            console.error('[NIGHT] Telegram send error:', e.message);
            resolve();
        });

        req.write(postData);
        req.end();
    });
}

// ─── Night Tasks (SERIAL execution) ───

const nightTasks = [
    // === KAIROS ENGINE TASKS ===
    {
        label: 'KAIROS: Evolution Cycle',
        cmd: 'node scripts/evolution/evolution-engine.js --dry-run',
        timeout: 60000,
    },
    {
        label: 'KAIROS: IA Council Scan',
        cmd: 'node scripts/dump-council.js',
        timeout: 60000,
    },
    {
        label: 'KAIROS: Distillation Auto-Harvest',
        cmd: 'node scripts/distill-trace.js --auto-harvest',
        timeout: 30000,
    },
    {
        label: 'KAIROS: Cognitive State Compression',
        cmd: 'node scripts/evolution/cognitive-state-engine.js --dashboard',
        timeout: 30000,
    },
    {
        label: 'KAIROS: Regenerate SELF_CONTEXT',
        cmd: 'node scripts/evolution/generate-context.js',
        timeout: 60000,
    },
    // === EXPERIA TASKS ===
    {
        label: 'EXPERIA: Landing Page Health Check',
        cmd: 'node -e "const https=require(\'https\');const urls=[\'https://github.com/Experiasolutions/kairos-guardian\',\'https://github.com/Experiasolutions/rascunho-quiz-experia\'];let ok=0;urls.forEach(u=>{https.get(u,r=>{console.log(u+\' → \'+r.statusCode);if(r.statusCode<400)ok++;if(ok+urls.length-ok===urls.length)console.log(\'Repos accessible: \'+ok+\'/\'+urls.length);r.resume();}).on(\'error\',e=>console.log(u+\' → ERROR: \'+e.message));})"',
        timeout: 15000,
    },
    {
        label: 'EXPERIA: Quiz Readiness Audit',
        cmd: 'node -e "const fs=require(\'fs\');const p=require(\'path\');const quiz=p.join(__dirname,\'..\',\'clients\',\'experia\',\'quiz\',\'src\');const files=[\'data/quizQuestions.ts\',\'utils/quizCalculations.ts\',\'types/quiz.ts\'];let ok=0;files.forEach(f=>{const fp=p.join(quiz,f);if(fs.existsSync(fp)){console.log(\'✅ \'+f);ok++;}else console.log(\'❌ \'+f);});console.log(\'Quiz readiness: \'+ok+\'/\'+files.length+\' files OK\');console.log(\'Status: \'+(ok===files.length?\'READY TO DEPLOY\':\'MISSING FILES\'));"',
        timeout: 10000,
    },
    {
        label: 'EXPERIA: Git Sync All Repos',
        cmd: process.platform === 'win32'
            ? 'powershell -Command "cd clients/experia/kairos-guardian; git pull origin main 2>&1; cd ../quiz; git pull origin main 2>&1; cd ../frontend; git pull origin main 2>&1"'
            : 'cd clients/experia/kairos-guardian && git pull origin main 2>&1; cd ../quiz && git pull origin main 2>&1; cd ../frontend && git pull origin main 2>&1',
        timeout: 30000,
    },
    {
        label: 'EXPERIA: Arsenal Status Check',
        cmd: 'node -e "const fs=require(\'fs\'),p=require(\'path\');const root=p.join(__dirname,\'..\');const checks=[{name:\'Landing Page (kairos-guardian)\',path:\'clients/experia/kairos-guardian/package.json\'},{name:\'Quiz (rascunho-quiz-experia)\',path:\'clients/experia/quiz/package.json\'},{name:\'Proposta PDF Content\',path:\'reasoning-packages/tasks/RP-20260224-NIGHT-SHIFT-DELIVERABLES.md\'},{name:\'Livro do Ouro\',path:\'reasoning-packages/LIVRO-DO-OURO-EXPERIA.md\'},{name:\'Master Pumps Intel\',path:\'reasoning-packages/tasks/RP-20260224-MASTER-PUMPS-CONTEXT.md\'}];let ready=0;checks.forEach(c=>{const exists=fs.existsSync(p.join(root,c.path));console.log((exists?\'✅\':\'❌\')+\' \'+c.name);if(exists)ready++;});console.log(\'\\nArsenal: \'+ready+\'/\'+checks.length+\' ready\');"',
        timeout: 10000,
    },
];

async function runNightShift() {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`[NIGHT] 🌙 Night Shift iniciando — ${new Date().toISOString()}`);
    console.log(`${'═'.repeat(60)}\n`);

    const results = [];
    const startTime = Date.now();

    // Run tasks SERIALLY (one at a time — protects 8GB RAM)
    for (const task of nightTasks) {
        const result = await runAsync(task.cmd, task.label, task.timeout);
        results.push(result);
        // Brief pause between tasks
        await new Promise(r => setTimeout(r, 2000));
    }

    // Process urgent queue
    const urgentFiles = [];
    try {
        const files = fs.readdirSync(REPORT_DIR).filter(f => f.startsWith('urgente-'));
        urgentFiles.push(...files);
    } catch { }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    const succeeded = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    // Separate KAIROS and EXPERIA results
    const kairosResults = results.filter(r => r.label.startsWith('KAIROS:'));
    const experiaResults = results.filter(r => r.label.startsWith('EXPERIA:'));

    // Save night report
    const reportFile = path.join(REPORT_DIR, `${timestamp()}-night-report.md`);
    const report = [
        `# 🌙 Night Shift Report — ${new Date().toLocaleDateString('pt-BR')}`,
        '',
        `**Duração:** ${duration}s`,
        `**Tarefas:** ${succeeded} ✅ / ${failed} ❌`,
        `**KAIROS:** ${kairosResults.filter(r => r.success).length}/${kairosResults.length} | **EXPERIA:** ${experiaResults.filter(r => r.success).length}/${experiaResults.length}`,
        `**Urgentes na fila:** ${urgentFiles.length}`,
        '',
        '## KAIROS Engine',
        '',
        ...kairosResults.map(r => `### ${r.success ? '✅' : '❌'} ${r.label}\n${r.success ? r.output.substring(0, 500) : `Erro: ${r.error}`}\n`),
        '',
        '## Experia Arsenal',
        '',
        ...experiaResults.map(r => `### ${r.success ? '✅' : '❌'} ${r.label}\n${r.success ? r.output.substring(0, 500) : `Erro: ${r.error}`}\n`),
        '',
        urgentFiles.length > 0 ? `## Tarefas Urgentes\n${urgentFiles.map(f => `- ${f}`).join('\n')}` : '',
    ].join('\n');

    fs.writeFileSync(reportFile, report);
    console.log(`[NIGHT] 📁 Report salvo: ${reportFile}`);

    return { results, duration, succeeded, failed, urgentFiles, reportFile };
}

// ─── Morning Brief ───

async function sendMorningBrief() {
    console.log('[NIGHT] ☀️ Gerando Morning Brief...');

    // Find most recent night report
    const reports = fs.readdirSync(REPORT_DIR)
        .filter(f => f.endsWith('-night-report.md'))
        .sort()
        .reverse();

    let briefText = `☀️ *Bom dia, Gabriel!*\n\n*KAIROS Morning Brief — ${new Date().toLocaleDateString('pt-BR')}*\n\n`;

    if (reports.length > 0) {
        const lastReport = fs.readFileSync(path.join(REPORT_DIR, reports[0]), 'utf8');
        const lines = lastReport.split('\n').filter(l => l.startsWith('### ') || l.startsWith('**'));
        briefText += lines.slice(0, 15).join('\n') + '\n\n';
    } else {
        briefText += '_(Nenhum relatório noturno encontrado)_\n\n';
    }

    // Experia arsenal quick check
    const arsenalFiles = [
        { name: 'Landing Page', path: path.join(ROOT, 'clients/experia/kairos-guardian/package.json') },
        { name: 'Quiz', path: path.join(ROOT, 'clients/experia/quiz/package.json') },
        { name: 'Proposta PDF', path: path.join(ROOT, 'reasoning-packages/tasks/RP-20260224-NIGHT-SHIFT-DELIVERABLES.md') },
    ];
    const arsenalReady = arsenalFiles.filter(f => fs.existsSync(f.path)).length;
    briefText += `\n🎯 *Arsenal Experia:* ${arsenalReady}/${arsenalFiles.length} componentes prontos\n`;

    // Check urgent tasks
    const urgentFiles = fs.readdirSync(REPORT_DIR).filter(f => f.startsWith('urgente-'));
    if (urgentFiles.length > 0) {
        briefText += `\n🚨 *${urgentFiles.length} tarefa(s) urgente(s) pendente(s)*\n`;
    }

    briefText += `\n📋 *Prioridade Manhã:*`;
    briefText += `\n1. Power Hour 9h: 15 contatos`;
    briefText += `\n2. Publicar Landing Page`;
    briefText += `\n3. Gravar Reel 1`;
    briefText += `\n\n📊 Use \`/status\` para health check completo.`;

    await sendTelegram(briefText);
    console.log('[NIGHT] ☀️ Morning Brief enviado via Telegram');
}

// ─── Schedule ───

// Midnight — Night Shift
schedule.scheduleJob('0 0 * * *', async () => {
    await runNightShift();
});

// 6:00 AM — Morning Brief
schedule.scheduleJob('0 6 * * *', async () => {
    await sendMorningBrief();
});

// ─── Immediate Run Mode (--now flag) ───

if (process.argv.includes('--now')) {
    console.log('[KAIROS NIGHT SHIFT] 🚀 Modo imediato — executando AGORA');
    (async () => {
        const result = await runNightShift();
        console.log(`\n[NIGHT] Night Shift concluído em ${result.duration}s`);
        console.log(`[NIGHT] ${result.succeeded} ✅ / ${result.failed} ❌`);
        console.log(`[NIGHT] Morning Brief será enviado às 06:00`);
        console.log(`[NIGHT] Scheduler permanece ativo para próximos ciclos.\n`);
    })();
} else {
    // ─── Startup ───
    console.log('[KAIROS NIGHT SHIFT] 🌙 Scheduler ativo');
    console.log(`  📁 Reports: ${REPORT_DIR}`);
    console.log(`  📱 Telegram: ${TELEGRAM_TOKEN ? '✅ configurado' : '⚠️ não configurado'}`);
    console.log('  ⏰ Horários:');
    console.log('     00:00 — KAIROS Engine + Experia Arsenal Check');
    console.log('     06:00 — Morning Brief → Telegram');
    console.log('');
    console.log('[KAIROS NIGHT SHIFT] Aguardando janelas de execução...');
    console.log('  💡 Use --now para executar imediatamente');
}
