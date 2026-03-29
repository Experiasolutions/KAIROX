/**
 * @module experia-content
 * @version 1.0.0
 * @purpose KAIROS Arm: Social Media content generator.
 *          Generates LinkedIn posts, Instagram Reel scripts, X threads,
 *          and weekly editorial calendars — aligned with the GROWTH-EXPERIA strategy.
 * @inputs  CLI flags --linkedin, --instagram, --twitter, --calendar, --briefing
 * @outputs Ready-to-publish posts to stdout + /data/content/outbox/
 * @dependencies .env (GROQ_API_KEY)
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const https = require('https');

// ── Config ──────────────────────────────────────────────────────
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const CONTENT_DIR = path.join(__dirname, '..', 'data', 'content');
const OUTBOX_DIR = path.join(CONTENT_DIR, 'outbox');
const MODEL = 'llama-3.3-70b-versatile';

if (!GROQ_API_KEY) {
    console.error('❌ GROQ_API_KEY não encontrado no .env');
    process.exit(1);
}

[CONTENT_DIR, OUTBOX_DIR].forEach(d => fs.mkdirSync(d, { recursive: true }));

// ── Groq LLM ──────────────────────────────────────────────────
async function groq(system, user, temp = 0.8) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({
            model: MODEL,
            messages: [
                { role: 'system', content: system },
                { role: 'user', content: user },
            ],
            temperature: temp,
            max_tokens: 800,
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
                catch (e) { reject(new Error(`Parse error: ${data.slice(0, 200)}`)); }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

// ── System Prompts ────────────────────────────────────────────
const SYSTEM_CONTENT = `You are GROWTH-EXPERIA, the content and growth arm of KAIROS AI OS.
You generate high-converting organic social media content for Gabriel Lima / Experia.

Context:
- Gabriel built an Autonomous AI Operating System (KAIROS) that runs his entire business.
- He IS the case study: his AI handles messages, generates reports, manages leads.
- Target: coaches, consultants, freelancers, marketing agencies, micro-SaaS founders.
- Brand tone: underdog authenticity. "Small team, massive AI leverage."
- NEVER use generic AI buzzwords. Show SPECIFIC outcomes and real demonstrations.

Rules:
- Hooks must create micro-tension in the first line (curiosity, contradiction, bold claim).
- Always back claims with a specific number or real scenario.
- CTAs must be ONE specific action (not "follow for more", not "like and share").`;

// ── Pillar Types ──────────────────────────────────────────────
const PILLARS = ['demo', 'resultado', 'educacional', 'bastidor', 'build-in-public'];

// ── Content Generators ────────────────────────────────────────

async function generateLinkedIn(topic = '', lang = 'en') {
    const prompt = lang === 'en'
        ? `Write a LinkedIn text post about: "${topic || 'using my AI OS to automate my entire workflow today'}".
           Format: Hook (1 bold line) → Context (2 lines) → Proof/example (3 lines) → CTA (1 line).
           Use line breaks. No hashtag spam (max 3 relevant).
           Target: agency founders, coaches, freelancers.`
        : `Escreva um post para LinkedIn sobre: "${topic || 'como usei o KAIROS para automatizar meu dia inteiro'}".
           Formato: Hook (1 linha forte) → Contexto (2 linhas) → Prova/exemplo (3 linhas) → CTA (1 linha).
           Use quebras de linha. Máx 3 hashtags relevantes.
           Público: coaches, agências, consultores.`;

    return await groq(SYSTEM_CONTENT, prompt);
}

async function generateInstagramReel(topic = '', lang = 'pt') {
    const prompt = lang === 'pt'
        ? `Escreva um script de Reel Instagram de 30 segundos sobre: "${topic || 'meu bot respondendo clientes enquanto eu dormia'}".
           Formato EXATO:
           [0-3s] HOOK VISUAL: texto que aparece na tela (curto, impactante)
           [3-15s] DEMO/PROBLEMA: o que mostrar na câmera ou tela
           [15-25s] RESULTADO: número real ou comparação antes/depois
           [25-30s] CTA: 1 ação específica
           Tom: underdog, autêntico, direto.`
        : `Write a 30-second Instagram Reel script about: "${topic || 'my bot answering clients while I slept'}".
           Exact format:
           [0-3s] VISUAL HOOK: on-screen text (short, impactful)
           [3-15s] DEMO/PROBLEM: what to show on camera or screen
           [15-25s] RESULT: real number or before/after comparison
           [25-30s] CTA: 1 specific action
           Tone: underdog, authentic, direct.`;

    return await groq(SYSTEM_CONTENT, prompt);
}

async function generateXThread(topic = '', lang = 'en') {
    const prompt = lang === 'en'
        ? `Write a Twitter/X thread (5 tweets) about: "${topic || 'Day 1 of using my AI OS as my only employee'}".
           Tweet 1: bold hook/claim that makes people stop scrolling.
           Tweets 2-4: expansion with specific details, numbers, process.
           Tweet 5: CTA or key takeaway.
           Use numbering (1/, 2/, etc.). Max 280 chars per tweet.`
        : `Escreva uma thread no X/Twitter (5 tweets) sobre: "${topic || 'Dia 1 usando meu sistema de IA como único funcionário'}".
           Tweet 1: hook forte que pare o scroll.
           Tweets 2-4: expansão com detalhes específicos, números, processo.
           Tweet 5: CTA ou conclusão.
           Use numeração (1/, 2/, etc.). Máx 280 chars por tweet.`;

    return await groq(SYSTEM_CONTENT, prompt);
}

async function generateWeeklyCalendar(context = '', lang = 'en') {
    const prompt = lang === 'en'
        ? `Create a 5-day social media calendar for Experia/KAIROS. Context: ${context || 'Gabriel is documenting how his AI OS runs his business'}.
           For each day give:
           - Platform (LinkedIn/Instagram/X)
           - Format (text post / reel / thread / story)
           - Topic (specific, not generic)
           - Hook (first line)
           Make each day different using the content pillars: demo, result, educational, behind-scenes, build-in-public.
           Output as a clean table.`
        : `Crie um calendário de 5 dias de social media para Experia/KAIROS. Contexto: ${context || 'Gabriel documenta como o KAIROS opera seu negócio'}.
           Para cada dia:
           - Plataforma (LinkedIn/Instagram/X)
           - Formato (post/reel/thread/story)
           - Tema (específico)
           - Hook (primeira linha)
           Use os pilares: demo, resultado, educacional, bastidor, build-in-public.
           Formato: tabela limpa.`;

    return await groq(SYSTEM_CONTENT, prompt, 0.9);
}

async function generateDailyBriefing() {
    const day = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const pillar = PILLARS[new Date().getDay() % PILLARS.length];

    const prompt = `Generate the daily content briefing for KAIROS social media execution.
Today is ${day}. Today's content pillar is: "${pillar}".

Output exactly these 6 items:
1. SUGGESTED TOPIC (specific, not generic)
2. LINKEDIN POST HOOK (first line only)
3. INSTAGRAM REEL HOOK (on-screen text, 5 words max)
4. X THREAD HOOK (bold opening statement)
5. SDR FOCUS (what niche to DM today: coach/agency/freelancer/saas)
6. KAIROS TIP (one specific thing Gabriel can demonstrate today from his system)

Keep each item to 1-2 lines. Be specific. Today's goal: 3 conversations started.`;

    return await groq(SYSTEM_CONTENT, prompt, 0.75);
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
    const args = process.argv.slice(2);
    const flag = args[0];
    const topic = args[1] || '';
    const lang = args[2] || (flag === '--instagram' ? 'pt' : 'en');
    const timestamp = Date.now();

    try {
        let output, filename;

        if (flag === '--linkedin') {
            console.log(`\n🔵 LinkedIn Post [${lang}]...\n`);
            output = await generateLinkedIn(topic, lang);
            filename = `linkedin-${timestamp}.txt`;

        } else if (flag === '--instagram') {
            console.log(`\n📸 Instagram Reel Script [${lang}]...\n`);
            output = await generateInstagramReel(topic, lang);
            filename = `instagram-reel-${timestamp}.txt`;

        } else if (flag === '--twitter') {
            console.log(`\n🐦 X/Twitter Thread [${lang}]...\n`);
            output = await generateXThread(topic, lang);
            filename = `x-thread-${timestamp}.txt`;

        } else if (flag === '--calendar') {
            console.log(`\n📅 Calendário Editorial Semanal [${lang}]...\n`);
            output = await generateWeeklyCalendar(topic, lang);
            filename = `calendar-${timestamp}.txt`;

        } else if (flag === '--briefing') {
            console.log(`\n☀️  Briefing Diário KAIROS Content...\n`);
            output = await generateDailyBriefing();
            filename = `briefing-${timestamp}.txt`;

        } else {
            console.log('\n╔══════════════════════════════════════════╗');
            console.log('║  📢 KAIROS Content — GROWTH-EXPERIA     ║');
            console.log('╚══════════════════════════════════════════╝\n');
            console.log('Uso:');
            console.log('  node experia-content.js --linkedin   "<topic>" <lang>');
            console.log('  node experia-content.js --instagram  "<topic>" <lang>');
            console.log('  node experia-content.js --twitter    "<topic>" <lang>');
            console.log('  node experia-content.js --calendar   "<context>" <lang>');
            console.log('  node experia-content.js --briefing');
            console.log('\nLangs: en, pt (default: en para LinkedIn/X, pt para Instagram)\n');
            return;
        }

        console.log(output);
        const outPath = path.join(OUTBOX_DIR, filename);
        fs.writeFileSync(outPath, output);
        console.log(`\n✅ Salvo em: data/content/outbox/${filename}`);

    } catch (err) {
        console.error('❌ Erro:', err.message);
    }
}

main();
