/**
 * Serviço Groq — LLM para atendimento WhatsApp do Paulo.
 * Usa memória por número de telefone.
 * Inclui detecção de comando !catalogo para acionar catálogo de tecidos.
 */
const Groq = require('groq-sdk');
const { loadEnv } = require('../config/env');
const { generateAttendantPrompt } = require('../prompts/attendant');
const memory = require('../utils/memory');

const config = loadEnv();
const groq = new Groq({ apiKey: config.groqApiKey });
const attendantPrompt = generateAttendantPrompt();

/**
 * Verifica se a mensagem é um comando especial do Paulo.
 * Ex: !catalogo linho, !catalogo cinza, !status joao
 */
function detectCommand(message) {
    const lower = message.toLowerCase().trim();
    if (lower.startsWith('!catalogo') || lower.startsWith('!catálogo')) {
        const keyword = lower.replace(/!cat[aá]logo\s*/i, '').trim();
        return { type: 'catalog', keyword: keyword || null };
    }
    if (lower.startsWith('!status')) {
        const name = lower.replace(/!status\s*/i, '').trim();
        return { type: 'status', name: name || null };
    }
    return null;
}

/**
 * Processa mensagem de texto de um cliente WhatsApp.
 * @param {string} userMessage - Texto recebido
 * @param {string} userId - JID do cliente
 * @returns {Promise<{text: string, command: object|null}>}
 */
async function handleIncomingMessage(userMessage, userId) {
    // Verifica se é comando especial (Paulo controlando o bot)
    const command = detectCommand(userMessage);
    if (command) {
        return { text: null, command };
    }

    memory.getOrCreate(userId, attendantPrompt);
    memory.addMessage(userId, 'user', userMessage);

    try {
        const completion = await groq.chat.completions.create({
            messages: memory.getMessages(userId),
            model: config.llm.model,
            temperature: config.llm.attendant.temperature,
            max_tokens: config.llm.attendant.maxTokens,
        });

        const response = completion.choices[0].message.content;
        memory.addMessage(userId, 'assistant', response);
        return { text: response, command: null };
    } catch (error) {
        console.error('[Groq Paulo] Erro:', error.message || error);
        return { text: 'Desculpe, tive um problema momentâneo. Pode repetir sua mensagem? 😊', command: null };
    }
}

module.exports = { handleIncomingMessage, detectCommand };
