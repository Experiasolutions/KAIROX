'use client';

import { useEffect, useState } from 'react';
import MorningBrief from '@/components/MorningBrief';
import StatsGrid from '@/components/StatsGrid';
import ParetoCard from '@/components/ParetoCard';
import DailyQuests from '@/components/DailyQuests';
import styles from './page.module.css';

interface Task {
  id: string;
  title: string;
  score: number;
  decision: 'EXECUTE' | 'DELEGATE_TO_SKYDRA' | 'CUT_ELIMINATE';
  impacto: number;
  vontade: number;
  esforco: number;
  category: string;
}

interface Brief {
  pareto_mission: string;
  secondary_tasks: string;
  is_completed: number;
}

interface Stats {
  current_xp: number;
  level: number;
  rank_title: string;
  total_pareto_score: number;
  current_streak: number;
  total_checkins: number;
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [brief, setBrief] = useState<Brief | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [quests, setQuests] = useState<any>(null);
  const [taskStats, setTaskStats] = useState({ total: 0, pending: 0, active: 0, done: 0, avgScore: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const [tasksRes, briefRes, statsRes, questsRes] = await Promise.allSettled([
        fetch('/api/tasks'),
        fetch('/api/morning-brief'),
        fetch('/api/tasks?stats=true'),
        fetch('/api/quests'),
      ]);

      if (tasksRes.status === 'fulfilled' && tasksRes.value.ok) {
        const data = await tasksRes.value.json();
        setTasks(data.tasks || []);
        setTaskStats(data.stats || taskStats);
      }

      if (briefRes.status === 'fulfilled' && briefRes.value.ok) {
        const data = await briefRes.value.json();
        setBrief(data.brief || null);
        setStats(data.userStats || null);
      }

      if (questsRes.status === 'fulfilled' && questsRes.value.ok) {
        const data = await questsRes.value.json();
        setQuests(data.quests || null);
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCompleteTask(id: string) {
    await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    loadDashboard();
  }

  async function handleCompleteQuest(difficulty: string) {
    await fetch('/api/quests', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ difficulty })
    });
    loadDashboard();
  }

  async function handleSaveQuests(easyTitle: string, mediumTitle: string, hardTitle: string) {
    await fetch('/api/quests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ easyTitle, mediumTitle, hardTitle })
    });
    loadDashboard();
  }

  const topTasks = tasks.filter(t => t.decision === 'EXECUTE').slice(0, 3);

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div>
          <h1 className="page-title">SKYROS</h1>
          <p className="subtitle">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>

      {/* Morning Brief */}
      <section className={`${styles.section} animate-in`}>
        <MorningBrief 
          mission={brief?.pareto_mission || null}
          secondaryTasks={brief ? JSON.parse(brief.secondary_tasks || '[]') : []}
          isCompleted={brief?.is_completed === 1}
        />
      </section>

      {/* Daily Quests GABLAB */}
      <section className={`${styles.section} animate-in`} style={{ animationDelay: '0.05s' }}>
        <DailyQuests 
           quests={quests} 
           onComplete={handleCompleteQuest} 
           onSave={handleSaveQuests} 
        />
      </section>

      {/* Stats Grid */}
      <section className={`${styles.section} animate-in`} style={{ animationDelay: '0.1s' }}>
        <StatsGrid stats={{
          totalTasks: taskStats.total,
          pendingTasks: taskStats.pending,
          doneTasks: taskStats.done,
          avgScore: taskStats.avgScore,
          level: stats?.level || 1,
          xp: stats?.current_xp || 0,
          streak: stats?.current_streak || 0,
          rank: stats?.rank_title || 'Iniciante',
        }} />
      </section>

      {/* Top Priority Tasks */}
      <section className={`${styles.section} animate-in`} style={{ animationDelay: '0.2s' }}>
        <div className="section-header">
          <div>
            <h2>Prioridades</h2>
            <p className="subtitle">Top tarefas por score Pareto</p>
          </div>
        </div>
        {topTasks.length > 0 ? (
          <div className={styles.taskGrid}>
            {topTasks.map((task) => (
              <ParetoCard
                key={task.id}
                title={task.title}
                score={task.score}
                decision={task.decision}
                impacto={task.impacto}
                vontade={task.vontade}
                esforco={task.esforco}
                category={task.category}
                onComplete={() => handleCompleteTask(task.id)}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>Nenhuma tarefa triada ainda. Vá à <strong>Mesa de Triagem</strong> para começar.</p>
          </div>
        )}
      </section>
    </div>
  );
}
