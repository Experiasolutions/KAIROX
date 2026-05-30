/**
 * KAIROS AI OPS - WhatsApp Webhook Router (Multi-Instance)
 * 
 * Este roteador recebe os eventos da Evolution API de QUALQUER instância
 * e roteia para o bot específico do cliente.
 */
const express = require('express');
const app = express();

app.use(express.json());

// Mapa de Clientes -> Handlers
// Cada cliente terá seu próprio módulo/bot exportando uma função handleWebhook
const clientHandlers = {
    'leticia-estetica': require('../clients/leticia/bot/index'),
    'paulo-tapecaria': require('../clients/paulo/src/index'),
    'hortifruti-elaine': require('../clients/hortifruti/bot-whatsapp/src/index')
};

app.post('/webhook/:instance', async (req, res) => {
    const instanceName = req.params.instance;
    const body = req.body;

    console.log(`[ROUTER] Recebido evento da instância: ${instanceName}`);

    const handler = clientHandlers[instanceName];

    if (!handler) {
        console.warn(`[ROUTER] Handler não encontrado para a instância: ${instanceName}`);
        return res.status(200).send('Instance not registered');
    }

    try {
        // Envia o payload para o bot do cliente processar. 
        // Assumimos que o bot exporta uma função 'handleWebhook(payload)'
        if (typeof handler.handleWebhook === 'function') {
            await handler.handleWebhook(body);
        } else {
            console.error(`[ROUTER] Handler de ${instanceName} não exporta handleWebhook`);
        }
        res.status(200).send('OK');
    } catch (error) {
        console.error(`[ROUTER] Erro ao processar payload para ${instanceName}:`, error.message);
        res.status(500).send('Internal Server Error');
    }
});

const PORT = process.env.ROUTER_PORT || 3005;

app.listen(PORT, () => {
    console.log(`\n======================================`);
    console.log(`🚀 KAIROS WhatsApp Router Multi-Instance`);
    console.log(`   Porta: ${PORT}`);
    console.log(`   Clientes registrados: ${Object.keys(clientHandlers).length}`);
    console.log(`======================================\n`);
});

module.exports = app;
