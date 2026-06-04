/**
 * KAIROX APEX CONDUCTOR — Public API
 * 
 * Entry point para o motor de triagem e organização pessoal.
 */

export { ParetoEngine, apexConductor } from './core/pareto-engine.js';
export {
  getDB,
  addTask,
  getBacklog,
  getTasksByDecision,
  completeTask,
  getTaskStats,
  saveMorningBrief,
  getTodayBrief,
  completeBrief,
  saveNightCheckin,
  getRecentCheckins,
  getUserStats,
  closeDB,
  getTodayQuests,
  saveTodayQuests,
  completeDailyQuest,
  getLootShop,
  buyLoot,
  applyPunishment
} from './core/database.js';
