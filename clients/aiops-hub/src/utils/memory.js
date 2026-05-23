const fs = require('fs');
const path = require('path');

const MEMORY_FILE = path.join(__dirname, '../../memory.json');
let chatHistory = {};

function loadMemory() {
    if (fs.existsSync(MEMORY_FILE)) {
        try {
            chatHistory = JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));
        } catch (e) {
            console.error('Erro ao ler memória:', e);
            chatHistory = {};
        }
    }
}

function saveMemory() {
    try {
        fs.writeFileSync(MEMORY_FILE, JSON.stringify(chatHistory, null, 2));
    } catch (e) {
        console.error('Erro ao salvar memória:', e.message);
    }
}

function addMessageToHistory(userId, role, content) {
    if (!chatHistory[userId]) {
        chatHistory[userId] = [];
    }
    chatHistory[userId].push({ role, content });

    // Manter as últimas 30 interações para otimizar contexto no LLM
    if (chatHistory[userId].length > 30) {
        chatHistory[userId] = chatHistory[userId].slice(-30);
    }
    saveMemory();
}

function getMemory(userId) {
    return chatHistory[userId] || [];
}

function clearMemory(userId) {
    chatHistory[userId] = [];
    saveMemory();
}

loadMemory();

module.exports = { addMessageToHistory, getMemory, clearMemory };
