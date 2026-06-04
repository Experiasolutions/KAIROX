require('dotenv').config({ path: require('path').resolve(__dirname, './clients/paulo/.env') });
const groqService = require('./clients/paulo/src/services/groq');

async function testGroq() {
    try {
        console.log('Testando Inferência Groq (Bot do Paulo)...');
        console.log('Mandando mensagem: "Oi, queria ver pra reformar um sofá de 3 lugares. Quanto custa mais ou menos?"');
        const res = await groqService.handleIncomingMessage(
            "Oi, queria ver pra reformar um sofá de 3 lugares. Quanto custa mais ou menos?", 
            "123456789@s.whatsapp.net"
        );
        console.log('\nResposta gerada pelo Groq:');
        console.log(res.text);
    } catch (e) {
        console.error('Erro:', e);
    }
}
testGroq();
