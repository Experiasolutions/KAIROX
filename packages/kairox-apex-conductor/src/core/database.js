/**
 * KAIROX APEX CONDUCTOR — DATABASE LAYER
 * 
 * JSON Local Storage para persistência sem dependência de compilação (Nativo).
 * Banco criado em ~/.kairox/conductor_db.json (fora do repo).
 */

import { join } from 'path';
import { mkdirSync, existsSync, writeFileSync, readFileSync } from 'fs';
import { homedir } from 'os';

// ─── DB PATH ────────────────────────────────────────────────
const KAIROX_DIR = join(homedir(), '.kairox');
const DB_PATH = join(KAIROX_DIR, 'conductor_db.json');

if (!existsSync(KAIROX_DIR)) {
  mkdirSync(KAIROX_DIR, { recursive: true });
}

// ─── INIT & STATE ───────────────────────────────────────────
let _dbData = {
  tasks: [],
  morning_briefs: [],
  night_checkins: [],
  daily_focus: [],
  user_stats: {
    id: 1,
    current_xp: 0,
    level: 1,
    rank_title: 'Iniciante',
    total_pareto_score: 0.0,
    total_checkins: 0,
    current_streak: 0,
    updated_at: new Date().toISOString()
  },
  daily_quests: [],
  loot_shop: [],
  punishments: []
};

export function getDB() {
  if (existsSync(DB_PATH)) {
    try {
      const dbFile = readFileSync(DB_PATH, 'utf8');
      _dbData = JSON.parse(dbFile);
    } catch (e) {
      console.warn("Could not read conductor_db.json, starting fresh.");
      saveDB();
    }
  } else {
    saveDB();
  }
  return _dbData;
}

function saveDB() {
  try {
    writeFileSync(DB_PATH, JSON.stringify(_dbData, null, 2), 'utf8');
  } catch (e) {
    console.error("Failed to write to conductor_db.json", e);
  }
}

// Ensure DB is loaded on startup
getDB();

// ─── TASK CRUD ──────────────────────────────────────────────

export function addTask({ id, title, description, impacto, vontade, esforco, score, decision, category }) {
  _dbData.tasks.push({
    id, title, description: description || '',
    impacto, vontade, esforco, score, decision,
    category: category || 'geral',
    status: 'pending',
    created_at: new Date().toISOString(),
    completed_at: null
  });
  saveDB();
}

export function getBacklog() {
  return _dbData.tasks
    .filter(t => t.status === 'pending' || t.status === 'active')
    .sort((a, b) => b.score - a.score);
}

export function getTasksByDecision(decision) {
  return _dbData.tasks
    .filter(t => t.decision === decision && t.status !== 'done')
    .sort((a, b) => b.score - a.score);
}

export function completeTask(id) {
  const task = _dbData.tasks.find(t => t.id === id);
  if (task) {
    task.status = 'done';
    task.completed_at = new Date().toISOString();
    saveDB();
  }
}

export function getTaskStats() {
  let pending = 0, active = 0, done = 0, cut = 0, scoreSum = 0;
  for (const t of _dbData.tasks) {
    if (t.status === 'pending') pending++;
    if (t.status === 'active') active++;
    if (t.status === 'done') done++;
    if (t.status === 'cut') cut++;
    if (t.status !== 'cut') scoreSum += t.score;
  }
  
  const notCut = pending + active + done;
  return {
    total: _dbData.tasks.length,
    pending,
    active,
    done,
    avgScore: notCut > 0 ? parseFloat((scoreSum / notCut).toFixed(2)) : 0
  };
}

// ─── MORNING BRIEF ──────────────────────────────────────────

export function saveMorningBrief({ id, targetDate, paretoMission, secondaryTasks }) {
  const existingIndex = _dbData.morning_briefs.findIndex(b => b.target_date === targetDate);
  const brief = {
    id, target_date: targetDate, pareto_mission: paretoMission,
    secondary_tasks: JSON.stringify(secondaryTasks || []),
    is_completed: 0,
    created_at: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    _dbData.morning_briefs[existingIndex] = brief;
  } else {
    _dbData.morning_briefs.push(brief);
  }
  saveDB();
}

export function getTodayBrief() {
  const today = new Date().toISOString().split('T')[0];
  return _dbData.morning_briefs.find(b => b.target_date === today);
}

export function completeBrief(id) {
  const brief = _dbData.morning_briefs.find(b => b.id === id);
  if (brief) {
    brief.is_completed = 1;
    saveDB();
  }
}

// ─── NIGHT CHECK-IN ─────────────────────────────────────────

export function saveNightCheckin({ id, targetDate, energyLevel, paretoScore, victories, bottlenecks }) {
  // Calculate streak
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const lastCheckin = _dbData.night_checkins.find(c => c.target_date === yesterdayStr);
  const streak = lastCheckin ? lastCheckin.momentum_streak + 1 : 1;

  const checkin = {
    id, target_date: targetDate, energy_level: energyLevel,
    pareto_score: paretoScore, victories: victories || '',
    bottlenecks: bottlenecks || '', momentum_streak: streak,
    created_at: new Date().toISOString()
  };

  const existingIndex = _dbData.night_checkins.findIndex(c => c.target_date === targetDate);
  if (existingIndex >= 0) {
    _dbData.night_checkins[existingIndex] = checkin;
  } else {
    _dbData.night_checkins.push(checkin);
  }

  // Update stats
  const stats = _dbData.user_stats;
  stats.current_xp += Math.round(paretoScore * 10);
  stats.total_checkins += 1;
  stats.current_streak = streak;

  let totalScoreSum = 0;
  for (const c of _dbData.night_checkins) {
    totalScoreSum += c.pareto_score;
  }
  stats.total_pareto_score = _dbData.night_checkins.length > 0 ? (totalScoreSum / _dbData.night_checkins.length) : 0;

  checkLevelUp();
  stats.updated_at = new Date().toISOString();
  saveDB();

  return { streak };
}

export function getRecentCheckins(limit = 7) {
  return [..._dbData.night_checkins]
    .sort((a, b) => b.target_date.localeCompare(a.target_date))
    .slice(0, limit);
}

// ─── USER STATS ─────────────────────────────────────────────

export function getUserStats() {
  return _dbData.user_stats;
}

export function closeDB() {
  // No-op for JSON
}

// ─── GAMIFICATION SYSTEM (GABLAB) ───────────────────────────

export function getTodayQuests() {
  if (!_dbData.daily_quests) _dbData.daily_quests = [];
  const today = new Date().toISOString().split('T')[0];
  let quests = _dbData.daily_quests.find(q => q.target_date === today);
  if (!quests) {
    quests = {
      target_date: today,
      easy: { title: '', completed: false, xp: 10 },
      medium: { title: '', completed: false, xp: 25 },
      hard: { title: '', completed: false, xp: 50 },
      combo_completed: false
    };
    _dbData.daily_quests.push(quests);
    saveDB();
  }
  return quests;
}

export function saveTodayQuests(easyTitle, mediumTitle, hardTitle) {
  const quests = getTodayQuests();
  quests.easy.title = easyTitle;
  quests.medium.title = mediumTitle;
  quests.hard.title = hardTitle;
  saveDB();
  return quests;
}

export function completeDailyQuest(difficulty) {
  const quests = getTodayQuests();
  if (quests[difficulty] && !quests[difficulty].completed) {
    quests[difficulty].completed = true;
    _dbData.user_stats.current_xp += quests[difficulty].xp;
    
    // Check combo bonus
    if (quests.easy.completed && quests.medium.completed && quests.hard.completed && !quests.combo_completed) {
      quests.combo_completed = true;
      _dbData.user_stats.current_xp += 50; // Combo bonus
      _dbData.user_stats.current_streak += 1;
    }
    checkLevelUp();
    saveDB();
  }
  return quests;
}

export function getLootShop() {
  if (!_dbData.loot_shop) _dbData.loot_shop = [];
  if (_dbData.loot_shop.length === 0) {
    _dbData.loot_shop = [
      { id: '1', title: 'Comprar um Livro', cost: 200, category: 'Recompensa' },
      { id: '2', title: 'Jogar Videogame (1h)', cost: 50, category: 'Lazer' },
      { id: '3', title: 'Pedir Delivery', cost: 150, category: 'Recompensa' }
    ];
    saveDB();
  }
  return _dbData.loot_shop;
}

export function buyLoot(id) {
  const item = getLootShop().find(i => i.id === id);
  if (item && _dbData.user_stats.current_xp >= item.cost) {
    _dbData.user_stats.current_xp -= item.cost;
    saveDB();
    return { success: true, item, remaining_xp: _dbData.user_stats.current_xp };
  }
  return { success: false, error: 'XP Insuficiente ou item inexistente' };
}

export function applyPunishment(amount, reason) {
  if (!_dbData.punishments) _dbData.punishments = [];
  _dbData.punishments.push({
    date: new Date().toISOString(),
    amount,
    reason
  });
  
  _dbData.user_stats.current_xp -= amount;
  if (_dbData.user_stats.current_xp < 0) {
    if (_dbData.user_stats.level > 1) {
      _dbData.user_stats.level -= 1;
      _dbData.user_stats.current_xp = 1000 + _dbData.user_stats.current_xp;
    } else {
      _dbData.user_stats.current_xp = 0;
    }
  }
  checkLevelUp();
  saveDB();
  return _dbData.user_stats;
}

function checkLevelUp() {
  const stats = _dbData.user_stats;
  if (stats.current_xp >= 1000) {
    stats.level += Math.floor(stats.current_xp / 1000);
    stats.current_xp = stats.current_xp % 1000;
    
    if (stats.level >= 10) stats.rank_title = 'Mestre';
    else if (stats.level >= 7) stats.rank_title = 'Estrategista';
    else if (stats.level >= 4) stats.rank_title = 'Executor';
    else if (stats.level >= 2) stats.rank_title = 'Aprendiz';
    else stats.rank_title = 'Iniciante';
  } else if (stats.current_xp < 0) {
      if (stats.level > 1) {
          stats.level -= 1;
          stats.current_xp = 1000 + stats.current_xp;
      } else {
          stats.current_xp = 0;
      }
  }
}

