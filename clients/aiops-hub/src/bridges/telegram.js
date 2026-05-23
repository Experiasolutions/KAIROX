const TelegramBot = require('node-telegram-bot-api');
const { askLLM } = require('../services/groq_llm');
const leticiaPersona = require('../personas/leticia').getSystemPrompt();
const pauloPersona = require('../personas/paulo').getSystemPrompt();

function initTelegramBots() {
    // Bot da Letícia
    if (process.env.TELEGRAM_TOKEN_LETICIA) {
        const botLeticia = new TelegramBot(process.env.TELEGRAM_TOKEN_LETICIA, { polling: true });
        botLeticia.on('message', async (msg) => {
            if (!msg.text || msg.text.startsWith('/')) return;
            const chatId = msg.chat.id;
            try {
                await botLeticia.sendChatAction(chatId, 'typing');
                const answer = await askLLM(`tg_leticia_${chatId}`, msg.text, leticiaPersona);
                await botLeticia.sendMessage(chatId, answer);
            } catch (e) {
                console.error("Erro TG Letícia:", e.message);
            }
        });
        console.log("🌸 Bot Telegram Letícia iniciado.");
    }

    // Bot do Paulo
    if (process.env.TELEGRAM_TOKEN_PAULO) {
        const botPaulo = new TelegramBot(process.env.TELEGRAM_TOKEN_PAULO, { polling: true });
        botPaulo.on('message', async (msg) => {
            if (!msg.text || msg.text.startsWith('/')) return;
            const chatId = msg.chat.id;
            try {
                await botPaulo.sendChatAction(chatId, 'typing');
                const answer = await askLLM(`tg_paulo_${chatId}`, msg.text, pauloPersona);
                await botPaulo.sendMessage(chatId, answer);
            } catch (e) {
                console.error("Erro TG Paulo:", e.message);
            }
        });
        console.log("🛋️ Bot Telegram Paulo iniciado.");
    }
}

module.exports = { initTelegramBots };
