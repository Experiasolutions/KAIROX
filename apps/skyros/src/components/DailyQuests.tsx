'use client';

import React, { useState } from 'react';
import styles from './DailyQuests.module.css';

interface Quest {
  title: string;
  completed: boolean;
  xp: number;
}

interface QuestsData {
  target_date: string;
  easy: Quest;
  medium: Quest;
  hard: Quest;
  combo_completed: boolean;
}

interface Props {
  quests: QuestsData | null;
  onComplete: (difficulty: string) => void;
  onSave: (easy: string, medium: string, hard: string) => void;
}

export default function DailyQuests({ quests, onComplete, onSave }: Props) {
  const [editMode, setEditMode] = useState(!quests?.easy?.title);
  const [easyInput, setEasyInput] = useState(quests?.easy?.title || '');
  const [mediumInput, setMediumInput] = useState(quests?.medium?.title || '');
  const [hardInput, setHardInput] = useState(quests?.hard?.title || '');

  const handleSave = () => {
    onSave(easyInput, mediumInput, hardInput);
    setEditMode(false);
  };

  if (!quests || editMode) {
    return (
      <div className={styles.questsContainer}>
        <h3>📋 Daily Board (Definir Missões)</h3>
        <div className={styles.inputGroup}>
          <label>🟢 Easy (10 XP):</label>
          <input value={easyInput} onChange={e => setEasyInput(e.target.value)} placeholder="Algo rápido < 15min" />
        </div>
        <div className={styles.inputGroup}>
          <label>🔵 Medium (25 XP):</label>
          <input value={mediumInput} onChange={e => setMediumInput(e.target.value)} placeholder="Avanço real 30-60min" />
        </div>
        <div className={styles.inputGroup}>
          <label>🔴 Hard (50 XP):</label>
          <input value={hardInput} onChange={e => setHardInput(e.target.value)} placeholder="Avanço de boss 1-2h" />
        </div>
        <button onClick={handleSave} className={styles.saveBtn}>Bloquear Missões do Dia</button>
      </div>
    );
  }

  return (
    <div className={styles.questsContainer}>
      <h3>📋 Daily Board (Missões Ativas)</h3>
      <div className={`${styles.questItem} ${quests.easy.completed ? styles.completed : ''}`}>
        <span>🟢 <strong>EASY (10 XP):</strong> {quests.easy.title}</span>
        {!quests.easy.completed && <button onClick={() => onComplete('easy')}>Completar</button>}
      </div>
      <div className={`${styles.questItem} ${quests.medium.completed ? styles.completed : ''}`}>
        <span>🔵 <strong>MEDIUM (25 XP):</strong> {quests.medium.title}</span>
        {!quests.medium.completed && <button onClick={() => onComplete('medium')}>Completar</button>}
      </div>
      <div className={`${styles.questItem} ${quests.hard.completed ? styles.completed : ''}`}>
        <span>🔴 <strong>HARD (50 XP):</strong> {quests.hard.title}</span>
        {!quests.hard.completed && <button onClick={() => onComplete('hard')}>Completar</button>}
      </div>
      
      <div className={styles.comboBadge}>
         {quests.combo_completed ? "🏆 COMBO BONUS OBTIDO (+50 XP)" : "Complete as 3 missões hoje para ganhar o bônus."}
      </div>
    </div>
  );
}
