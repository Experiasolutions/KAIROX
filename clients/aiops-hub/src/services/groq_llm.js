const axios = require('axios');
const { getMemory, addMessageToHistory } = require('../utils/memory');

async function askLLM(userId, userMessage, systemPrompt) {
    const messages = [
        { role: 'system', content: systemPrompt }
    ];

    const history = getMemory(userId);
    if (history.length > 0) {
        messages.push(...history);
    }

    messages.push({ role: 'user', content: userMessage });

    try {
        const response = await axios.post(
            'https://api.sambanova.ai/v1/chat/completions',
            {
                model: 'Meta-Llama-3.1-70B-Instruct',
                messages: messages,
                temperature: 0.7,
                max_tokens: 1024
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.SAMBANOVA_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const answer = response.data.choices[0].message.content;
        addMessageToHistory(userId, 'user', userMessage);
        addMessageToHistory(userId, 'assistant', answer);
        return answer;
    } catch (error) {
        console.error('Erro SambaNova LLM:', error.response ? error.response.data : error.message);
        return 'Desculpe, tive um problema de conexão no momento. Pode repetir?';
    }
}

module.exports = { askLLM };
