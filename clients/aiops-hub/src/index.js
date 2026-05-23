require('dotenv').config();
const express = require('express');
const { initTelegramBots } = require('./bridges/telegram');
const { sendWhatsAppText, handlePauloCatalog } = require('./bridges/whatsapp');
const { askLLM } = require('./services/groq_llm');

const leticiaPersona = require('./personas/leticia').getSystemPrompt();
const pauloPersona = require('./personas/paulo').getSystemPrompt();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Inicializa Bots do Telegram
initTelegramBots();

// Health check para o Railway
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// ---------------------------------------------------------
// WEBHOOKS - EVOLUTION API (WHATSAPP)
// ---------------------------------------------------------

app.post('/api/webhook/leticia', async (req, res) => {
    res.status(200).send('OK'); // Confirma recebimento rápido
    await processWhatsAppMessage(req.body, 'leticia', leticiaPersona);
});

app.post('/api/webhook/paulo', async (req, res) => {
    res.status(200).send('OK'); // Confirma recebimento rápido
    await processWhatsAppMessage(req.body, 'paulo', pauloPersona);
});

async function processWhatsAppMessage(payload, botName, systemPrompt) {
    try {
        const event = payload.event;
        if (event !== 'messages.upsert') return;

        const data = payload.data;
        if (data.key.fromMe) return; // ignora mensagens enviadas por ele mesmo

        const text = data.message?.conversation || data.message?.extendedTextMessage?.text;
        if (!text) return; // ignora áudios/imagens por enquanto

        const sender = data.key.remoteJid.replace('@s.whatsapp.net', '');
        const instance = botName === 'leticia' ? process.env.EVOLUTION_INSTANCE_LETICIA : process.env.EVOLUTION_INSTANCE_PAULO;

        // Chama o LLM
        const userId = `wa_${botName}_${sender}`;
        const answer = await askLLM(userId, text, systemPrompt);

        // Verifica Catálogo Especial do Paulo
        if (botName === 'paulo') {
            const isCatalog = await handlePauloCatalog(instance, sender, answer);
            if (isCatalog) return; // já enviou as fotos e a resposta tratada
        }

        // Envia resposta padrão em texto
        await sendWhatsAppText(instance, sender, answer);

    } catch (e) {
        console.error(`Erro processando WA ${botName}:`, e.message);
    }
}

app.listen(PORT, () => {
    console.log(`🚀 AIOPS Hub rodando na porta ${PORT}`);
    console.log(`👉 Webhook Letícia: /api/webhook/leticia`);
    console.log(`👉 Webhook Paulo: /api/webhook/paulo`);
});
