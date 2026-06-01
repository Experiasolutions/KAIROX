/**
 * Bot WhatsApp — Ateliê Paulo Tapeceiro
 * KAIROS AI OPS · Evolution API + Groq · Deploy: Railway
 *
 * Fluxos:
 * - Atendimento: triagem consultiva high-ticket via webhook Evolution API
 * - Catálogo Visual: Paulo envia !catalogo [tecido] e bot envia fotos para o cliente
 * - Sócio Digital: Gabriel/Paulo recebe reports no Telegram
 * - Cron 08h: Morning Brief para Paulo/Gabriel
 */
require('dotenv').config();
const express = require('express');
const cron = require('node-cron');
const { loadEnv } = require('./config/env');
const business = require('./config/business.json');
const { handleIncomingMessage } = require('./services/groq');
const { sendMessage, sendImage } = require('./services/evolution');
const { searchFabrics, formatFabricCaption, getCatalogIntroMessage } = require('./services/catalog');

const config = loadEnv();
const app = express();
app.use(express.json());

// ── Telegram (Sócio Digital) ──────────────────────────────────────────────────
let telegramBot = null;
try {
    telegramBot = require('./services/telegram');
} catch (e) {
    console.warn('⚠️ Telegram desativado:', e.message);
}

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        bot: `${business.name} Bot`,
        instance: config.instanceName,
        uptime: Math.floor(process.uptime()),
        telegram: !!telegramBot,
        timestamp: new Date().toISOString(),
    });
});

// ── Webhook Evolution API (WhatsApp) ─────────────────────────────────────────
// Suporta tanto /webhook (standalone) quanto /api/webhook/paulo (KAIROX multi-tenant)
async function handleEvolutionWebhook(req, res) {
    try {
        const body = req.body;

        // Segurança opcional
        if (config.webhookSecret) {
            const incoming = req.headers['x-webhook-secret'] || req.query.secret;
            if (incoming !== config.webhookSecret) {
                return res.status(401).json({ error: 'Não autorizado' });
            }
        }

        if (body.event !== 'messages.upsert') {
            return res.status(200).send('OK');
        }

        const messageData = body.data?.message;
        const key = body.data?.key;

        // Ignorar mensagens do próprio bot
        if (key?.fromMe) {
            return res.status(200).send('OK');
        }

        // Extrair texto ou caption de imagem
        let userText = '';
        if (messageData?.conversation) {
            userText = messageData.conversation;
        } else if (messageData?.extendedTextMessage?.text) {
            userText = messageData.extendedTextMessage.text;
        } else if (messageData?.audioMessage) {
            userText = '[Áudio recebido]';
        } else if (messageData?.imageMessage?.caption) {
            userText = messageData.imageMessage.caption || '[Imagem recebida — cliente enviou foto da peça]';
        }

        if (!userText) {
            return res.status(200).send('OK');
        }

        const remoteJid = key?.remoteJid;
        console.log(`[WA IN] ${remoteJid}: "${userText}"`);

        // Processar mensagem (detecta comandos !catalogo e !status)
        const result = await handleIncomingMessage(userText, remoteJid);

        if (result.command) {
            // ── Comando: Catálogo de Tecidos ────────────────────────────────
            if (result.command.type === 'catalog') {
                const keyword = result.command.keyword;
                const fabrics = searchFabrics(keyword);
                const introMsg = getCatalogIntroMessage(keyword, fabrics.length);

                await sendMessage(remoteJid, introMsg);

                // Envia cada tecido como imagem com legenda (delay entre envios)
                for (const fabric of fabrics) {
                    await new Promise(r => setTimeout(r, 800)); // delay 800ms entre imagens
                    const caption = formatFabricCaption(fabric);
                    await sendImage(remoteJid, fabric.imageUrl, caption);
                }

                if (fabrics.length > 0) {
                    await new Promise(r => setTimeout(r, 1000));
                    await sendMessage(remoteJid,
                        `Algum desses tecidos te interessou? Me conta a peça que você quer reformar e eu já te passo um orçamento! 🪡`
                    );
                }

                console.log(`[Catálogo] ${fabrics.length} tecido(s) enviado(s) para ${remoteJid} (keyword: "${keyword}")`);
            }
        } else if (result.text) {
            // ── Atendimento normal ──────────────────────────────────────────
            await sendMessage(remoteJid, result.text);
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('[Webhook] Erro:', error.message || error);
        res.status(500).send('Erro Interno');
    }
}

// Registra em ambas as rotas (standalone e KAIROX multi-tenant)
app.post('/webhook', handleEvolutionWebhook);
app.post('/api/webhook/paulo', handleEvolutionWebhook);

// ── Cron: Morning Brief (08h) ─────────────────────────────────────────────────
cron.schedule('0 8 * * 1-5', () => {
    const ownerId = config.telegramOwnerId;
    if (ownerId && telegramBot) {
        const msg =
            `🪡 *Bom dia, Gabriel / Paulo!*\n\n` +
            `📊 *Morning Brief — ${business.name}*\n\n` +
            `Bot rodando normalmente.\n\n` +
            `💡 *Comandos disponíveis no WhatsApp:*\n` +
            `• \`!catalogo [tecido]\` → Enviar catálogo visual para cliente\n` +
            `• \`!catalogo linho\` → Só tecidos de linho\n` +
            `• \`!catalogo\` → Primeiros 4 tecidos do catálogo\n\n` +
            `Bom trabalho hoje! 💪`;

        telegramBot.sendMessage(ownerId, msg, { parse_mode: 'Markdown' }).catch(err => {
            console.error('[CRON] Falha Morning Brief:', err.message);
        });
    }
}, { timezone: 'America/Sao_Paulo' });

// ── Start Server ─────────────────────────────────────────────────────────────
app.listen(config.port, () => {
    console.log(`\n🪡 ======================================`);
    console.log(`   ${business.name} Bot`);
    console.log(`   Instância: ${config.instanceName}`);
    console.log(`   Porta: ${config.port}`);
    console.log(`   Telegram: ${telegramBot ? '✅ ativo' : '❌ desativado'}`);
    console.log(`   Catálogo: ✅ ${require('./config/catalog.json').tecidos.length} tecidos carregados`);
    console.log(`   Health: GET /health`);
    console.log(`   Webhook: POST /webhook`);
    console.log(`=======================================\n`);
});
