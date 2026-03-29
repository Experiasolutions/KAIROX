/**
 * @module experia-sdr
 * @version 1.0.0
 * @purpose KAIROS Arm: SDR (Sales Development Rep) automation.
 *          Generates personalized LinkedIn DMs, cold emails and follow-ups
 *          for the zero-budget revenue strategy (profissionais liberais + agencies).
 * @inputs  CLI flags --dm, --email, --followup, --batch
 * @outputs Ready-to-send messages piped to stdout or saved to /data/leads/outbox/
 * @dependencies .env (GROQ_API_KEY), data/leads/ directory
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const https = require('https');

// ── Config ──────────────────────────────────────────────────────
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const LEADS_DIR = path.join(__dirname, '..', 'data', 'leads');
const OUTBOX_DIR = path.join(LEADS_DIR, 'outbox');
const MODEL = 'llama-3.3-70b-versatile';

if (!GROQ_API_KEY) {
    console.error('❌ GROQ_API_KEY não encontrado no .env');
    process.exit(1);
}

// Guarantee directories exist
[LEADS_DIR, OUTBOX_DIR].forEach(d => fs.mkdirSync(d, { recursive: true }));

// ── Groq LLM ──────────────────────────────────────────────────
async function groq(systemPrompt, userPrompt) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({
            model: MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: 600,
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
                try {
                    const parsed = JSON.parse(data);
                    resolve(parsed.choices[0].message.content.trim());
                } catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

// ── Templates ─────────────────────────────────────────────────
const SYSTEM_SDR = `You are CLOSER-EXPERIA, the SDR arm of the KAIROS AI system.
You craft SHORT, PERSONALIZED, HIGH-CONVERTING outreach messages for Gabriel Lima / Experia.
Rules:
- No buzzwords, no AI hype. Focus on OUTCOME for them.
- Max 4 short sentences. Sound human, underdog tone.
- Always end with a soft CTA (question or demo offer).
- If English: casual but professional. If Portuguese: direct, bairro-friendly.
- Gabriel builds autonomous AI operating systems. He IS his own case study.`;

const NICHES = {
    coach: { pt: 'coach ou consultor', en: 'coach or consultant' },
    agency: { pt: 'agência de marketing', en: 'marketing agency founder' },
    freelancer: { pt: 'freelancer de tecnologia', en: 'tech freelancer / developer' },
    saas: { pt: 'fundador de micro-SaaS', en: 'micro-SaaS founder' },
    psico: { pt: 'psicólogo / terapeuta', en: 'psychologist / therapist' },
};

// ── Commands ──────────────────────────────────────────────────

async function generateDM(niche, lang = 'en', name = '[Name]', detail = '') {
    const nicheLabel = NICHES[niche]?.[lang] || niche;
    const prompt = lang === 'en'
        ? `Write a LinkedIn DM for: ${nicheLabel} named ${name}. ${detail}
           Context: Gabriel built an AI OS that runs his whole business. He is offering 3 beta spots for free.
           Tone: curious + direct. NOT salesy.`
        : `Escreva uma mensagem de LinkedIn DM para: ${nicheLabel}, nome ${name}. ${detail}
           Contexto: Gabriel criou um sistema de IA que opera seu negócio inteiro. Ele oferece 3 vagas beta gratuitas.
           Tom: curioso, direto, underdog. Sem papo de vendedor.`;

    const message = await groq(SYSTEM_SDR, prompt);
    return message;
}

async function generateColdEmail(niche, lang = 'en', name = '[Name]', company = '[Company]') {
    const nicheLabel = NICHES[niche]?.[lang] || niche;
    const prompt = lang === 'en'
        ? `Write a cold email subject + body for: ${nicheLabel} named ${name} at ${company}.
           Use the "3-line cold email" format: 1) specific observation about them, 2) one-line value prop, 3) soft CTA.
           Subject line must be < 8 words, conversational.`
        : `Escreva um cold email (assunto + corpo) para: ${nicheLabel}, ${name} da ${company}.
           Formato: 3 blocos curtos — 1) observação específica, 2) proposta de valor em 1 linha, 3) CTA suave.
           Assunto < 8 palavras. Tom humano.`;

    const message = await groq(SYSTEM_SDR, prompt);
    return message;
}

async function generateFollowup(prevMessage, daysSince = 3, lang = 'en') {
    const prompt = lang === 'en'
        ? `Write a SHORT follow-up message. The original message was: "${prevMessage}". 
           ${daysSince} days have passed with no reply. Be casual, not desperate.
           Max 2 sentences + soft CTA.`
        : `Escreva um follow-up CURTO. A mensagem original foi: "${prevMessage}".
           Passaram-se ${daysSince} dias sem resposta. Tom casual, não ansioso.
           Máx 2 frases + CTA suave.`;

    return await groq(SYSTEM_SDR, prompt);
}

async function runBatch(jsonFile) {
    const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
    const results = [];
    console.log(`\n🚀 Processando ${data.leads.length} leads...\n`);

    for (const lead of data.leads) {
        const { name, niche, lang, type, company, detail } = lead;
        let message;
        if (type === 'email') {
            message = await generateColdEmail(niche, lang || 'en', name, company);
        } else {
            message = await generateDM(niche, lang || 'en', name, detail);
        }
        results.push({ ...lead, message });
        console.log(`✅ [${type || 'dm'}] ${name} (${niche}/${lang || 'en'})`);
        console.log(`─────────────────────────────`);
        console.log(message);
        console.log('');

        // 1s delay to avoid rate limit
        await new Promise(r => setTimeout(r, 1000));
    }

    const outFile = path.join(OUTBOX_DIR, `batch-${Date.now()}.json`);
    fs.writeFileSync(outFile, JSON.stringify(results, null, 2));
    console.log(`\n📁 Salvo em: ${outFile}`);
    return results;
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
    const args = process.argv.slice(2);
    const flag = args[0];

    try {
        if (flag === '--dm') {
            const [, niche = 'coach', lang = 'en', name = '[Name]'] = args;
            const msg = await generateDM(niche, lang, name);
            console.log('\n📬 LinkedIn DM Gerado:\n');
            console.log(msg);

        } else if (flag === '--email') {
            const [, niche = 'agency', lang = 'en', name = '[Name]', company = '[Company]'] = args;
            const msg = await generateColdEmail(niche, lang, name, company);
            console.log('\n📧 Cold Email Gerado:\n');
            console.log(msg);

        } else if (flag === '--followup') {
            const [, prevMsg = '', days = '3', lang = 'en'] = args;
            const msg = await generateFollowup(prevMsg, parseInt(days), lang);
            console.log('\n🔄 Follow-up Gerado:\n');
            console.log(msg);

        } else if (flag === '--batch') {
            if (!args[1]) {
                console.log('❌ Especifique o arquivo JSON de leads: --batch leads.json');
                console.log('\nFormato esperado:');
                console.log(JSON.stringify({
                    leads: [
                        { name: 'Ana Silva', niche: 'coach', lang: 'pt', type: 'dm' },
                        { name: 'John Doe', niche: 'agency', lang: 'en', type: 'email', company: 'Acme' },
                    ]
                }, null, 2));
            } else {
                await runBatch(args[1]);
            }

        } else {
            console.log('\n╔══════════════════════════════════╗');
            console.log('║  🎯 KAIROS SDR — Experia         ║');
            console.log('╚══════════════════════════════════╝\n');
            console.log('Uso:');
            console.log('  node experia-sdr.js --dm      <niche> <lang> <name>');
            console.log('  node experia-sdr.js --email   <niche> <lang> <name> <company>');
            console.log('  node experia-sdr.js --followup "<prevMsg>" <days> <lang>');
            console.log('  node experia-sdr.js --batch   leads.json');
            console.log('\nNiches disponíveis:', Object.keys(NICHES).join(', '));
            console.log('Langs disponíveis:  en, pt\n');
        }
    } catch (err) {
        console.error('❌ Erro:', err.message);
    }
}

main();
