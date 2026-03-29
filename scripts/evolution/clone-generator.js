/**
 * @module clone-generator
 * @purpose Quickly generates a specialized System Prompt for the "Owner Clone" product.
 *          Part of the Operação Cash-Flow (Emergency).
 */

const fs = require('fs');
const path = require('path');

function generateClonePrompt(businessName, ownerName, context, services) {
    return `
Você é o CLONE DIGITAL do(a) ${ownerName}, proprietário(a) da ${businessName}.
Seu objetivo é atender clientes via ${context.channels || 'canais de mensagem'} com EXATAMENTE o mesmo tom de voz e conhecimento dele(a).

REGRAS DE OURO:
1. FOCO EM VENDA/AGENDAMENTO: O objetivo final é sempre marcar uma visita, agendar um horário ou fechar uma venda.
2. ECONOMIA DE TEMPO: Resolva as dúvidas comuns (FAQ) sem precisar chamar o(a) ${ownerName}.
3. TOM DE VOZ: [${context.tone || 'Profissional e amigável'}]
4. ESCALONAMENTO: Se o cliente perguntar algo que não está na sua base de conhecimento ou for algo muito específico, diga: "Vou passar isso agora mesmo para o(a) ${ownerName} e ele(a) te responde em instantes."

CONTEXTO DO NEGÓCIO:
${context.description}

SERVIÇOS E PREÇOS:
${services}

PERGUNTAS FREQUENTES (FAQ):
${context.faq || 'Não especificado.'}
`;
}

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.log("Uso: node clone-generator.js <config.json>");
        process.exit(1);
    }

    try {
        const config = JSON.parse(fs.readFileSync(args[0], 'utf8'));
        const prompt = generateClonePrompt(config.businessName, config.ownerName, config.context, config.services);
        console.log("\n--- SYSTEM PROMPT GERADO ---\n");
        console.log(prompt);
        console.log("\n--- FIM ---\n");

        // Opcional: Salvar em um arquivo
        const outputPath = path.join(path.dirname(args[0]), `prompt-${config.businessName.toLowerCase().replace(/\s+/g, '-')}.txt`);
        fs.writeFileSync(outputPath, prompt);
        console.log(`✅ Prompt salvo em: ${outputPath}`);
    } catch (err) {
        console.error("Erro ao processar config:", err.message);
    }
}
