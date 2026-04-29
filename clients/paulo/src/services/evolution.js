/**
 * Serviço Evolution API — envio de mensagens WhatsApp.
 * Suporta texto e mídia (imagens para o catálogo do Paulo).
 */
const axios = require('axios');
const { loadEnv } = require('../config/env');

const config = loadEnv();

const client = axios.create({
    baseURL: config.evolutionUrl,
    headers: {
        'Content-Type': 'application/json',
        'apikey': config.evolutionApiKey,
    },
    timeout: 15000,
});

/**
 * Envia mensagem de texto simples via WhatsApp.
 * @param {string} to - JID ou número (ex: "5511999999999@s.whatsapp.net" ou "5511999999999")
 * @param {string} text - Texto da mensagem
 */
async function sendMessage(to, text) {
    const jid = normalizeJid(to);
    try {
        const res = await client.post(`/message/sendText/${config.instanceName}`, {
            number: jid,
            text,
        });
        console.log(`[Evolution OUT] ✅ Mensagem enviada para ${jid}`);
        return res.data;
    } catch (err) {
        console.error(`[Evolution OUT] ❌ Erro ao enviar para ${jid}:`, err.response?.data || err.message);
        throw err;
    }
}

/**
 * Envia imagem com legenda via WhatsApp (para catálogo de tecidos).
 * @param {string} to - JID do destinatário
 * @param {string} imageUrl - URL pública da imagem
 * @param {string} caption - Legenda da imagem
 */
async function sendImage(to, imageUrl, caption = '') {
    const jid = normalizeJid(to);
    try {
        const res = await client.post(`/message/sendMedia/${config.instanceName}`, {
            number: jid,
            mediatype: 'image',
            mimetype: 'image/jpeg',
            media: imageUrl,
            caption,
        });
        console.log(`[Evolution OUT] 🖼️ Imagem enviada para ${jid}`);
        return res.data;
    } catch (err) {
        console.error(`[Evolution OUT] ❌ Erro ao enviar imagem para ${jid}:`, err.response?.data || err.message);
        throw err;
    }
}

/**
 * Normaliza o número para JID padrão do WhatsApp.
 */
function normalizeJid(to) {
    if (to.includes('@')) return to;
    const clean = to.replace(/\D/g, '');
    return `${clean}@s.whatsapp.net`;
}

module.exports = { sendMessage, sendImage };
