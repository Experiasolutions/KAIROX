/**
 * @module experia-lead-tracker
 * @version 1.0.0
 * @purpose KAIROS Arm: Lead scoring, pipeline tracking, and follow-up scheduling.
 *          Manages the full SDR pipeline from first contact to closed deal.
 *          Sends daily Telegram digest of leads requiring action.
 * @inputs  CLI flags --add, --update, --list, --score, --report, --digest
 * @outputs JSON lead database at /data/leads/pipeline.json + Telegram digest
 * @dependencies .env (GROQ_API_KEY, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID)
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const https = require('https');

// ── Config ──────────────────────────────────────────────────────
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const LEADS_DIR = path.join(__dirname, '..', 'data', 'leads');
const PIPELINE_FILE = path.join(LEADS_DIR, 'pipeline.json');
const MODEL = 'llama-3.3-70b-versatile';

fs.mkdirSync(LEADS_DIR, { recursive: true });

// ── Pipeline State ────────────────────────────────────────────
const STAGES = ['contacted', 'replied', 'interested', 'demo_done', 'negotiating', 'closed', 'lost'];
const SCORE_WEIGHTS = {
    replied: +20,
    interested: +30,
    demo_done: +20,
    negotiating: +20,
    agency: +15, // niche bonus
    saas: +10,
    coach: +5,
    en: +10, // language bonus (int'l = higher value)
};

function loadPipeline() {
    if (!fs.existsSync(PIPELINE_FILE)) return { leads: [], updated_at: null };
    return JSON.parse(fs.readFileSync(PIPELINE_FILE, 'utf8'));
}

function savePipeline(data) {
    data.updated_at = new Date().toISOString();
    fs.writeFileSync(PIPELINE_FILE, JSON.stringify(data, null, 2));
}

function scoreLead(lead) {
    let score = 10; // base score
    score += SCORE_WEIGHTS[lead.stage] || 0;
    score += SCORE_WEIGHTS[lead.niche] || 0;
    score += SCORE_WEIGHTS[lead.lang] || 0;
    if (lead.has_budget) score += 15;
    if (lead.has_urgency) score += 15;
    return Math.min(score, 100);
}

function daysAgo(dateStr) {
    if (!dateStr) return 999;
    return Math.floor((Date.now() - new Date(dateStr)) / 86400000);
}

function needsFollowup(lead) {
    if (['closed', 'lost'].includes(lead.stage)) return false;
    const days = daysAgo(lead.last_contact_at);
    const thresholds = { contacted: 2, replied: 3, interested: 3, demo_done: 2, negotiating: 1 };
    return days >= (thresholds[lead.stage] || 3);
}

// ── Commands ──────────────────────────────────────────────────

function addLead(args) {
    const [, , name, niche = 'coach', stage = 'contacted', lang = 'en'] = args;
    if (!name) return console.log('❌ Nome obrigatório: --add <name> <niche> <stage> <lang>');

    const pipeline = loadPipeline();
    const id = `LEAD-${Date.now()}`;
    const lead = {
        id, name, niche, stage, lang,
        score: 0,
        has_budget: false, has_urgency: false,
        contacted_at: new Date().toISOString(),
        last_contact_at: new Date().toISOString(),
        notes: [],
        messages_sent: 0,
    };
    lead.score = scoreLead(lead);
    pipeline.leads.push(lead);
    savePipeline(pipeline);

    console.log(`✅ Lead adicionado: ${name} [${niche}/${lang}] — Score: ${lead.score} — Stage: ${stage}`);
    console.log(`   ID: ${id}`);
}

function updateLead(args) {
    const [, , id, field, value] = args;
    if (!id || !field || !value) {
        return console.log('❌ Uso: --update <id> <field> <value>');
    }

    const pipeline = loadPipeline();
    const lead = pipeline.leads.find(l => l.id === id || l.name.toLowerCase().includes(id.toLowerCase()));
    if (!lead) return console.log(`❌ Lead não encontrado: ${id}`);

    if (field === 'stage') {
        if (!STAGES.includes(value)) return console.log(`❌ Stage inválido. Use: ${STAGES.join(', ')}`);
        lead.stage = value;
    } else if (field === 'note') {
        lead.notes.push({ text: value, at: new Date().toISOString() });
    } else if (field === 'budget') {
        lead.has_budget = value === 'true';
    } else if (field === 'urgency') {
        lead.has_urgency = value === 'true';
    } else {
        lead[field] = value;
    }

    lead.last_contact_at = new Date().toISOString();
    lead.score = scoreLead(lead);
    savePipeline(pipeline);

    console.log(`✅ Lead atualizado: ${lead.name} — Stage: ${lead.stage} — Score: ${lead.score}`);
}

function listLeads(filter = 'active') {
    const pipeline = loadPipeline();
    let leads = pipeline.leads;

    if (filter === 'active') {
        leads = leads.filter(l => !['closed', 'lost'].includes(l.stage));
    } else if (filter === 'followup') {
        leads = leads.filter(needsFollowup);
    } else if (filter === 'hot') {
        leads = leads.filter(l => l.score >= 50 && !['closed', 'lost'].includes(l.stage));
    }

    leads.sort((a, b) => b.score - a.score);

    console.log(`\n🎯 Pipeline Experia (${filter}) — ${leads.length} lead(s)\n`);
    console.log('Score | Stage        | Name              | Niche    | Dias');
    console.log('──────|──────────────|───────────────────|──────────|─────');
    for (const l of leads) {
        const days = daysAgo(l.last_contact_at);
        const flag = needsFollowup(l) ? '⚡' : ' ';
        const name = l.name.padEnd(17).slice(0, 17);
        const stage = l.stage.padEnd(12).slice(0, 12);
        const niche = l.niche.padEnd(8).slice(0, 8);
        console.log(` ${String(l.score).padStart(3)}  | ${flag}${stage} | ${name} | ${niche} | ${days}d`);
    }
    console.log('');
    console.log(`⚡ = follow-up pendente | Total score médio: ${leads.length ? Math.round(leads.reduce((a, b) => a + b.score, 0) / leads.length) : 0}`);
}

async function generateReport() {
    const pipeline = loadPipeline();
    const active = pipeline.leads.filter(l => !['closed', 'lost'].includes(l.stage));
    const closed = pipeline.leads.filter(l => l.stage === 'closed');
    const followups = pipeline.leads.filter(needsFollowup);
    const hot = active.filter(l => l.score >= 50);

    const summary = `Lead Pipeline Summary:
- Total leads: ${pipeline.leads.length}
- Active: ${active.length}
- Closed: ${closed.length}
- Needs follow-up TODAY: ${followups.length} (${followups.map(l => l.name).join(', ')})
- Hot leads (score ≥ 50): ${hot.length} (${hot.map(l => `${l.name}[${l.score}]`).join(', ')})
- Next actions needed: ${followups.slice(0, 3).map(l => `${l.name} (${l.stage})`).join(', ')}`;

    const prompt = `Based on this SDR pipeline data, generate a short tactical report for Gabriel:
${summary}

Output format:
🎯 HOJE (Priority actions)
📊 ESTADO DO PIPELINE  
💡 INSIGHTS (what's working / what needs adjustment)
⚡ PRÓXIMOS PASSOS (3 actions)

Max 20 lines. Direct, no fluff. Use emojis for readability.`;

    const report = await groq_simple(prompt);
    console.log('\n📊 Relatório do Pipeline:\n');
    console.log(report);
    return report;
}

async function sendDailyDigest() {
    if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
        console.log('⚠️  TELEGRAM_BOT_TOKEN ou TELEGRAM_CHAT_ID não encontrado. Pulando envio.');
        console.log('   Adicione ao .env para receber o digest no Telegram.');
        return;
    }

    const report = await generateReport();
    const pipeline = loadPipeline();
    const followups = pipeline.leads.filter(needsFollowup);

    let message = `🎯 *KAIROS SDR — Digest Diário*\n`;
    message += `📅 ${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}\n\n`;
    message += report.replace(/[<>]/g, '') + '\n\n';

    if (followups.length > 0) {
        message += `*⚡ Follow-ups urgentes:*\n`;
        for (const l of followups.slice(0, 5)) {
            message += `• ${l.name} (${l.stage}) — ${daysAgo(l.last_contact_at)}d sem contato\n`;
        }
    }

    message += `\n_Powered by KAIROS — Noesis 🎯_`;

    const body = JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
    });

    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.telegram.org',
            path: `/bot${TELEGRAM_TOKEN}/sendMessage`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                const resp = JSON.parse(data);
                if (resp.ok) {
                    console.log('✅ Digest enviado para o Telegram!');
                    resolve();
                } else {
                    console.error('❌ Telegram error:', resp.description);
                    reject(new Error(resp.description));
                }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

// ── Groq (simplified, no history) ─────────────────────────────
async function groq_simple(prompt) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({
            model: MODEL,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.5,
            max_tokens: 500,
        });
        const options = {
            hostname: 'api.groq.com',
            path: '/openai/v1/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`,
            },
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try { resolve(JSON.parse(data).choices[0].message.content.trim()); }
                catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
    const args = process.argv.slice(2);
    const flag = args[0];

    try {
        if (flag === '--add') addLead(args);
        else if (flag === '--update') updateLead(args);
        else if (flag === '--list') listLeads(args[1] || 'active');
        else if (flag === '--report') await generateReport();
        else if (flag === '--digest') await sendDailyDigest();
        else {
            console.log('\n╔══════════════════════════════════════════╗');
            console.log('║  📊 KAIROS Lead Tracker — Experia       ║');
            console.log('╚══════════════════════════════════════════╝\n');
            console.log('Uso:');
            console.log('  node experia-lead-tracker.js --add    <name> <niche> <stage> <lang>');
            console.log('  node experia-lead-tracker.js --update <id|name> <field> <value>');
            console.log('  node experia-lead-tracker.js --list   [active|followup|hot]');
            console.log('  node experia-lead-tracker.js --report');
            console.log('  node experia-lead-tracker.js --digest   (envia para Telegram)');
            console.log('\nStages:', STAGES.join(' → '));
            console.log('Fields: stage, note, budget (true/false), urgency (true/false)\n');
        }
    } catch (err) {
        console.error('❌ Erro:', err.message);
    }
}

main();
