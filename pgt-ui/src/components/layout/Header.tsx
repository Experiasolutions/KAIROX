import { Zap, Coins, TrendingUp, Clock, Cpu } from "lucide-react";
import { useState, useEffect } from "react";

interface PlayerStats {
  level: number;
  xp: number;
  xpToNext: number;
  gold: number;
  vibration: number;
}

export function Header() {
  const [time, setTime] = useState(new Date());
  const [stats] = useState<PlayerStats>({
    level: 7,
    xp: 2450,
    xpToNext: 3000,
    gold: 8750,
    vibration: 85,
  });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const xpPercentage = (stats.xp / stats.xpToNext) * 100;

  return (
    <header className="h-20 border-b border-border bg-card/80 backdrop-blur-xl px-8 flex items-center justify-between relative overflow-hidden">
      {/* Scan line effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-cyber-scan" />
      </div>

      {/* Title */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Cpu className="w-10 h-10 text-primary glow-cyan" />
          <div className="absolute inset-0 bg-primary/20 blur-xl" />
        </div>
        <div>
          <h1 className="font-display text-2xl text-primary glow-cyan tracking-wider uppercase">
            AI ORCHESTRATOR
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            <span className="text-neon-magenta">◆</span> NEURAL_COMMAND.v2.0
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-6">
        {/* Level & XP */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg border-2 border-primary flex items-center justify-center bg-background relative cyber-frame">
            <span className="font-display text-xl text-primary">{stats.level}</span>
          </div>
          <div className="w-36">
            <div className="flex justify-between text-xs mb-1 font-mono">
              <span className="text-muted-foreground">XP.LEVEL</span>
              <span className="text-neon-purple">{stats.xp.toLocaleString()}/{stats.xpToNext.toLocaleString()}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill-purple" style={{ width: `${xpPercentage}%` }} />
            </div>
          </div>
        </div>

        {/* Gold */}
        <div className="flex items-center gap-2 glass-card-gold px-4 py-2">
          <Coins className="w-5 h-5 text-gold" />
          <span className="font-mono text-lg text-gold">R$ {stats.gold.toLocaleString()}</span>
        </div>

        {/* Vibration */}
        <div className="flex items-center gap-2 glass-card px-4 py-2">
          <Zap className="w-5 h-5 text-neon-green" />
          <span className="font-mono text-lg text-neon-green">{stats.vibration}%</span>
          <TrendingUp className="w-4 h-4 text-neon-green" />
        </div>

        {/* Clock */}
        <div className="flex items-center gap-2 glass-card px-4 py-2">
          <Clock className="w-5 h-5 text-primary" />
          <span className="font-mono text-xl text-primary glow-cyan">
            {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      </div>
    </header>
  );
}
