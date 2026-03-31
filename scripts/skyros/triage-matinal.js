/**
 * SKYROS: TRIAGE MATINAL (Hemisfério Direito - Notebook)
 * Objetivo: Escanear roadmap e alertar a exclusividade P0 para o operador.
 */

const fs = require('fs');
const path = require('path');

const roadmapPath = path.join(__dirname, '..', '..', 'roadmap.md');
const anamnesisPath = path.join(__dirname, '..', '..', 'docs', 'anamnesis');

function runTriage(silent = false) {
    if (!silent) {
        console.log("=======================================");
        console.log("🌞 SKYROS V1.0: MORNING TRIAGE STARTED");
        console.log("=======================================\n");
    }

    if (!fs.existsSync(roadmapPath)) {
        if (!silent) console.error("[ERRO] roadmap.md não encontrado no diretório raiz do KAIROS!");
        return { p0Count: 0, p0Tasks: [], anamnesisReady: false };
    }

    const roadmapContent = fs.readFileSync(roadmapPath, 'utf8');
    
    const p0TasksMatches = [...roadmapContent.matchAll(/\|.*[pP]0.*\|/g)];
    const p0Count = p0TasksMatches.length;
    const p0Tasks = p0TasksMatches.map(m => m[0].trim());

    if (!silent) console.log("[1] SPRINT DE HOJE (Foco Extremo):");
    if (p0Count > 0) {
        if (!silent) {
            p0TasksMatches.slice(0, 2).forEach((match, index) => {
                console.log(`  🔥 ALVO ${index + 1}: ${match[0].trim()}`);
            });
            if (p0Count > 2) {
                console.log(`  > (+${p0Count - 2} tarefas P0 identificadas, mas ignore. Foco nas duas acima).`);
            }
        }
    } else {
        if (!silent) console.log("  Nenhuma tarefa classificada como P0. Tempo livre para P1/Deep Learning.");
    }

    const anamnesisReady = fs.existsSync(anamnesisPath);
    if (!silent) {
        console.log("\n[2] DIRETRIZ ANAMNESIS (Brain Dump):");
        console.log("  Sua memória biológica não é um HD. Esvazie preocupações antes de codar.");
        if (anamnesisReady) {
            console.log("  ✅ Vault do Obsidian rastreado (/docs/anamnesis).");
            console.log("  INSTRUÇÃO: Abra o aplicativo do Obsidian no celular/notebook agora e despeje o caos da noite na Infinite Canvas.");
        } else {
            console.log("  ⚠️ CONFIGURAÇÃO PENDENTE: Crie a pasta docs/anamnesis e apunte o seu Obsidian para ela.");
        }

        console.log("\n=======================================");
        console.log("  Status Mental Sincronizado. Bom Código. ");
        console.log("=======================================");
    }
    
    return { p0Count, p0Tasks, anamnesisReady };
}

if (require.main === module) {
    runTriage();
}

module.exports = { runTriage };
