/**
 * KAIROX APEX CONDUCTOR - PARETO ENGINE
 * 
 * Implementação da lógica de Triagem Pareto³ conforme descrito no 
 * GABRIEL-ANAMNESIS-GENIALIDADE.md
 * 
 * Integrado ao SQLite para persistência automática.
 */

import { addTask } from './database.js';

// Estrutura de Ingestão de Tarefas
export class ParetoEngine {
  constructor() {
    this.dbStatus = "ready";
  }

  /**
   * Avalia uma tarefa baseada no Axioma de Gabriel:
   * (Impacto * Vontade) / Esforço
   * 
   * @param {number} impacto (1-10) - O quão transformador é o resultado?
   * @param {number} vontade (1-10) - O quanto você quer executar isso genuinamente?
   * @param {number} esforco (1-10) - Energia/Tempo drenado para conclusão.
   * @returns {number} Score de Triagem
   */
  calculateParetoScore(impacto, vontade, esforco) {
    if (impacto < 1 || impacto > 10) throw new Error("Impacto deve ser de 1 a 10");
    if (vontade < 1 || vontade > 10) throw new Error("Vontade deve ser de 1 a 10");
    if (esforco < 1 || esforco > 10) throw new Error("Esforço deve ser de 1 a 10");

    // Lógica core de priorização
    const rawScore = (impacto * vontade) / esforco;
    
    // Normalização
    return parseFloat(rawScore.toFixed(2));
  }

  /**
   * Decide se a tarefa deve ser cortada, executada ou delegada para a Skydra.
   * Persiste automaticamente no SQLite.
   */
  triageTask(taskParams) {
    const score = this.calculateParetoScore(
      taskParams.impacto, 
      taskParams.vontade, 
      taskParams.esforco
    );

    // Regras de negócio do KAIROX: Filtro Absoluto
    let action = "EXECUTE";
    
    // Se esforço é muito alto e impacto não é estelar, DELEGUE para agentes (Skydra).
    if (taskParams.esforco > 7 && score <= 5) {
      action = "DELEGATE_TO_SKYDRA";
    }

    // Se a vontade e o impacto são ridiculamente baixos, CORTE. (Axioma: Foco é dizer não)
    if (score < 1.0) {
      action = "CUT_ELIMINATE";
    }

    const result = {
      id: crypto.randomUUID(),
      title: taskParams.title,
      description: taskParams.description || '',
      impacto: taskParams.impacto,
      vontade: taskParams.vontade,
      esforco: taskParams.esforco,
      score: score,
      decision: action,
      category: taskParams.category || 'geral',
      timestamp: Date.now()
    };

    // Persistir no SQLite
    try {
      addTask(result);
    } catch (err) {
      console.warn('[CONDUCTOR] DB write failed, returning in-memory result:', err.message);
    }

    return result;
  }
}

// Singleton de uso 
export const apexConductor = new ParetoEngine();
