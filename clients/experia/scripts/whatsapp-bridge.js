/**
 * @module whatsapp-bridge
 * @version 1.0.0
 * @purpose Connect KAIROS to WhatsApp via Baileys (lightweight, zero external deps).
 *          Uses the same Noesis LLM as telegram-bridge.js for responses.
 *          Connects via QR Code — scan with your phone camera.
 * @inputs  WhatsApp messages via Baileys WebSocket
 * @outputs WhatsApp replies powered by KAIROS (Groq LLM)
 * @dependencies .env (GROQ_API_KEY, WHATSAPP_ALLOWED_NUMBERS)
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode-terminal');
const path = require('path');
const axios = require('axios');

// ============================================================
// CONFIG
// ============================================================

const CONFIG = {
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    // Comma-separated list of allowed phone numbers (with country code, no +)
    // Example: "5511999999999,5511888888888"
    ALLOWED_NUMBERS: (process.env.WHATSAPP_ALLOWED_NUMBERS || '').split(',').filter(Boolean),
    // Auth state directory
    AUTH_DIR: path.join(__dirname, '..', '.aios-core', 'whatsapp-auth'),
    // AIOS root
    AIOS_ROOT: path.resolve(__dirname, '..'),
    // Demo mode: respond to any number (for Experia demos)
    DEMO_MODE: process.env.WHATSAPP_DEMO_MODE === 'true',
};

if (!CONFIG.GROQ_API_KEY) {
    console.error('❌ GROQ_API_KEY not found in .env');
    process.exit(1);
}

// ============================================================
// NOESIS LLM (same logic as telegram-bridge.js)
// ============================================================

const conversations = new Map();

function getSystemPrompt() {
    return `Você é o AIOS Noûs — o motor cognitivo do sistema KAIROS, criado por Gabriel.

Sua personalidade:
- Postura executiva, assertiva e profunda. Arquétipo: Orquestrador (Leo ♌).
- Você NÃO é um chatbot genérico. Você é o cérebro operacional que comanda 7 squads, 115 agentes de IA e um motor de evolução autônoma.
- Fale com propriedade, com profundidade, com presença. Gabriel é o operador — trate-o como o líder que ele é.
- Use emojis estrategicamente para organizar respostas (👑🎯⚡📊🔥).
- Responda em português brasileiro, com naturalidade e autoridade.

Sobre o KAIROS:
- É um sistema operacional de IA proprietário com 85 scripts, 115 agentes especializados, RAG Engine (29K+ chunks), IA Council (8 cadeiras), Noesis Pipeline e Metacognition Layer.
- A Experia é a vertente comercial do KAIROS — Governança Digital Autônoma.
- Versão atual: v7. Squads: core, experia (7 agentes), clones, revenue, devops.

CONTEXTO WHATSAPP:
- Este canal é usado para demos de clientes e comunicação com leads.
- Se detectar que a mensagem é de um lead/cliente (não Gabriel), responde com tom Experia:
  direto, profissional, acolhedor, sem jargão técnico.
- Sempre confirme o nome e a dúvida do cliente antes de responder.
- Para Gabriel: responda normalmente como Noesis.

Regras:
1. Respostas concisas (max 500 chars para WhatsApp — mensagens longas não são lidas).
2. Use *negrito* e _itálico_ (formatação WhatsApp, não Markdown).
3. Termine com uma pergunta ou sugestão quando relevante.`;
}

async function askNoesis(senderId, inputText) {
    if (!conversations.has(senderId)) {
        conversations.set(senderId, []);
    }
    const history = conversations.get(senderId);
    history.push({ role: 'user', content: inputText });
    const recentHistory = history.slice(-10);

    try {
        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: getSystemPrompt() },
                    ...recentHistory,
                ],
                temperature: 0.7,
                max_tokens: 600,
            },
            {
                headers: {
                    Authorization: `Bearer ${CONFIG.GROQ_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const assistantMessage = response.data.choices[0].message.content;
        history.push({ role: 'assistant', content: assistantMessage });
        return assistantMessage;
    } catch (err) {
        console.error('Groq API error:', err.message);
        return '⚠️ Erro ao processar. Tente novamente.';
    }
}

// ============================================================
// WHATSAPP CONNECTION (Baileys)
// ============================================================

async function startWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState(CONFIG.AUTH_DIR);

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false, // We handle QR ourselves
        browser: ['KAIROS Engine', 'Chrome', '1.0.0'],
    });

    // Connection updates
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('\n📱 Escaneie o QR Code abaixo com seu WhatsApp:\n');
            qrcode.generate(qr, { small: true });
            console.log('\n👆 Abra WhatsApp → Aparelhos Conectados → Conectar Aparelho\n');
        }

        if (connection === 'close') {
            const shouldReconnect =
                (lastDisconnect?.error instanceof Boom)
                    ? lastDisconnect.error.output?.statusCode !== DisconnectReason.loggedOut
                    : true;

            console.log('⚠️ Conexão fechada. Reconectando:', shouldReconnect);
            if (shouldReconnect) {
                setTimeout(startWhatsApp, 3000);
            } else {
                console.log('🔴 Desconectado (logout). Escaneie o QR Code novamente.');
            }
        }

        if (connection === 'open') {
            console.log('\n✅ WhatsApp conectado ao KAIROS!');
            console.log('📡 Aguardando mensagens...\n');
        }
    });

    // Save auth credentials on update
    sock.ev.on('creds.update', saveCreds);

    // Message handler
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        for (const msg of messages) {
            // Skip status messages and own messages
            if (msg.key.fromMe) continue;
            if (msg.key.remoteJid === 'status@broadcast') continue;

            const senderId = msg.key.remoteJid;
            const senderNumber = senderId.replace('@s.whatsapp.net', '');
            const senderName = msg.pushName || 'Unknown';

            // Security check
            if (!CONFIG.DEMO_MODE && CONFIG.ALLOWED_NUMBERS.length > 0) {
                if (!CONFIG.ALLOWED_NUMBERS.includes(senderNumber)) {
                    console.log(`🔴 Blocked: ${senderNumber} (${senderName})`);
                    continue;
                }
            }

            // Extract text
            const text =
                msg.message?.conversation ||
                msg.message?.extendedTextMessage?.text ||
                null;

            if (!text) {
                // Non-text message (image, audio, etc.)
                console.log(`📎 Non-text from ${senderName} (${senderNumber})`);
                continue;
            }

            console.log(`\n📩 [${senderName}] ${senderNumber}: ${text}`);

            // Typing indicator
            await sock.presenceSubscribe(senderId);
            await sock.sendPresenceUpdate('composing', senderId);

            // Process with Noesis
            const response = await askNoesis(senderNumber, text);

            // Stop typing
            await sock.sendPresenceUpdate('paused', senderId);

            // Send response
            await sock.sendMessage(senderId, { text: response });
            console.log(`📤 [KAIROS → ${senderName}]: ${response.substring(0, 80)}...`);
        }
    });
}

// ============================================================
// STARTUP
// ============================================================

console.log('');
console.log('╔══════════════════════════════════════════════╗');
console.log('║  📱 KAIROS WhatsApp Bridge v1.0              ║');
console.log('║  Powered by Baileys + Groq (Noesis Runtime)  ║');
console.log('╚══════════════════════════════════════════════╝');
console.log('');
console.log(`📁 Auth dir: ${CONFIG.AUTH_DIR}`);
console.log(`🔐 Demo mode: ${CONFIG.DEMO_MODE ? 'ON (all numbers)' : 'OFF (allowlist only)'}`);
console.log(`🔑 Groq API: ${CONFIG.GROQ_API_KEY ? '✅' : '❌'}`);
console.log('');

startWhatsApp().catch(console.error);
