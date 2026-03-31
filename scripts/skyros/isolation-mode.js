/**
 * SKYROS: ISOLATION MODE (Hemisfério Esquerdo - PC Opus)
 * Objetivo: Forçar o KAIROS a entrar em estado de Deep Work Imersivo, recusando tarefas secundárias.
 */

const fs = require('fs');
const path = require('path');

const statusPath = path.join(__dirname, '..', '..', 'STATUS.md');

function engageIsolationMode(silent = false) {
    if (!silent) {
        console.log("=======================================");
        console.log("🔴 SKYROS V1.0: ISOLATION MODE ENGAGED");
        console.log("=======================================\n");
    }

    if (!fs.existsSync(statusPath)) {
        if (!silent) console.error(" STATUS.md não encontrado. O coração do KAIROS está offline.");
        return { success: false, reason: 'missing_status' };
    }

    try {
        let statusContent = fs.readFileSync(statusPath, 'utf8');
        
        // Bloqueio Psicológico e Sistêmico: Sobrescreve a ordem principal do STATUS.md
        const isolationTag = "> 🔴 [SKYROS]: ISOLATION MODE ENGAGED. O operador está em Deep Work. Novas tarefas, brainstorms paralelos ou pesquisas que fujam da SPRINT atual devem ser TERMINANTEMENTE negadas até o término da sessão.";

        if (!statusContent.includes("ISOLATION MODE ENGAGED")) {
            statusContent = isolationTag + "\n\n" + statusContent;
            fs.writeFileSync(statusPath, statusContent);
            if (!silent) {
                console.log("  [SISTEMA]: STATUS.md Injetado com o protocolo de Foco Máximo.");
                console.log("  [IA]: A partir deste momento, o AIOX negará solicitações fora do escopo do projeto ativo.");
            }
            return { success: true, engaged: true };
        } else {
            if (!silent) console.log("  [SISTEMA]: O Isolation Mode já estava ativo no STATUS.md.");
            return { success: true, engaged: false };
        }
    } catch(err) {
         if (!silent) console.error("  [ERRO]: Falha ao tentar injetar o Protocolo de Isolamento: ", err.message);
         return { success: false, error: err.message };
    }
    
    // Sugestão de bloqueio nativo do SO
    if (!silent) {
        console.log("\n  [OPERADOR]: Feche todas as abas não essenciais de navegação.");
        console.log("  Execute apenas as ferramentas do IDE. Modo de foco cego ativado.");
        console.log("\n=======================================");
    }
}

if (require.main === module) {
    engageIsolationMode();
}

module.exports = { engageIsolationMode };
