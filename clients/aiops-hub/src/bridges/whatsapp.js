const axios = require('axios');
const catalogData = require('../config/catalog.json');

async function sendWhatsAppText(instance, to, text) {
    if (!process.env.EVOLUTION_API_URL) return;
    try {
        await axios.post(
            `${process.env.EVOLUTION_API_URL}/message/sendText/${instance}`,
            { number: to, text: text },
            { headers: { 'apikey': process.env.EVOLUTION_API_KEY, 'Content-Type': 'application/json' } }
        );
    } catch (e) {
        console.error(`Erro ao enviar WA texto (${instance}):`, e.message);
    }
}

async function sendWhatsAppMedia(instance, to, mediaUrl, caption = "") {
    if (!process.env.EVOLUTION_API_URL) return;
    try {
        await axios.post(
            `${process.env.EVOLUTION_API_URL}/message/sendMedia/${instance}`,
            { number: to, mediatype: "image", media: mediaUrl, caption: caption },
            { headers: { 'apikey': process.env.EVOLUTION_API_KEY, 'Content-Type': 'application/json' } }
        );
    } catch (e) {
        console.error(`Erro ao enviar WA mídia (${instance}):`, e.message);
    }
}

// Intercepta comando de catálogo e envia imagens
async function handlePauloCatalog(instance, to, llmResponse) {
    // Ex: "!catalogo linho"
    const regex = /!catalogo\s+(.+)/i;
    const match = llmResponse.match(regex);
    
    if (match) {
        const termo = match[1].toLowerCase();
        const tecidos = catalogData.tecidos.filter(t => t.nome.toLowerCase().includes(termo) || t.descricao.toLowerCase().includes(termo));
        
        // Remover o comando do texto que vai pro cliente
        const cleanText = llmResponse.replace(regex, '').trim();
        if (cleanText) {
            await sendWhatsAppText(instance, to, cleanText);
        }

        if (tecidos.length > 0) {
            for (const t of tecidos) {
                await sendWhatsAppMedia(instance, to, t.imagem_url, `${t.nome} - ${t.descricao}`);
            }
        } else {
            await sendWhatsAppText(instance, to, `No momento não tenho fotos de "${termo}" no sistema rápido, mas o Paulo te envia em breve!`);
        }
        return true; // interceptado
    }
    return false; // não tem catálogo
}

module.exports = { sendWhatsAppText, handlePauloCatalog };
