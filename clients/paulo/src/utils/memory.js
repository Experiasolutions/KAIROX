/**
 * Memória de conversa com sliding window.
 * Armazena histórico por userId (número WhatsApp ou chatId Telegram).
 */

const stores = {};

/**
 * Cria ou retorna o store existente para um usuário.
 * @param {string} userId
 * @param {string} systemPrompt - Prompt de sistema (só usado na criação)
 */
function getOrCreate(userId, systemPrompt) {
    if (!stores[userId]) {
        stores[userId] = [{ role: 'system', content: systemPrompt }];
    }
    return stores[userId];
}

/**
 * Adiciona uma mensagem ao histórico e aplica sliding window (máx 10 pares + system).
 */
function addMessage(userId, role, content) {
    if (!stores[userId]) return;
    stores[userId].push({ role, content });

    // Mantém: system prompt + últimas 10 mensagens (5 pares user/assistant)
    if (stores[userId].length > 11) {
        const sys = stores[userId][0];
        stores[userId] = [sys, ...stores[userId].slice(-10)];
    }
}

/**
 * Reseta a memória de um usuário (mantendo o mesmo system prompt).
 */
function reset(userId, systemPrompt) {
    stores[userId] = [{ role: 'system', content: systemPrompt }];
}

/**
 * Retorna o histórico completo de um usuário.
 */
function getMessages(userId) {
    return stores[userId] || [];
}

/**
 * Retorna todos os userIds ativos (para relatórios e follow-ups).
 */
function getAllUsers() {
    return Object.keys(stores);
}

module.exports = { getOrCreate, addMessage, reset, getMessages, getAllUsers };
