import { useState } from "react";
import { Scroll, Plus, ChevronRight, Trophy, Swords, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Questline {
  id: string;
  name: string;
  description: string;
  progress: number;
  totalSteps: number;
  icon: "trophy" | "swords" | "sparkles";
  active: boolean;
}

const iconMap = {
  trophy: Trophy,
  swords: Swords,
  sparkles: Sparkles,
};

const initialQuestlines: Questline[] = [
  {
    id: "q1",
    name: "O Resgate do Crédito",
    description: "Limpar o nome e estabilizar o Castelo",
    progress: 0,
    totalSteps: 3,
    icon: "swords",
    active: true,
  },
  {
    id: "q2",
    name: "Hot IA Influencer",
    description: "Construir presença digital com IA",
    progress: 0,
    totalSteps: 5,
    icon: "sparkles",
    active: true,
  },
  {
    id: "q3",
    name: "Experia Empire",
    description: "Escalar o negócio de automação",
    progress: 0,
    totalSteps: 4,
    icon: "trophy",
    active: true,
  },
];

type IconType = "trophy" | "swords" | "sparkles";

export function QuestlinesPanel() {
  const [questlines, setQuestlines] = useState<Questline[]>(initialQuestlines);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newQuestline, setNewQuestline] = useState<{
    name: string;
    description: string;
    totalSteps: number;
    icon: IconType;
  }>({
    name: "",
    description: "",
    totalSteps: 3,
    icon: "swords",
  });

  const handleCreateQuestline = () => {
    if (!newQuestline.name.trim()) return;
    
    const questline: Questline = {
      id: `q${Date.now()}`,
      name: newQuestline.name,
      description: newQuestline.description,
      progress: 0,
      totalSteps: newQuestline.totalSteps,
      icon: newQuestline.icon,
      active: true,
    };
    
    setQuestlines(prev => [...prev, questline]);
    setNewQuestline({ name: "", description: "", totalSteps: 3, icon: "swords" });
    setIsDialogOpen(false);
  };

  return (
    <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Scroll className="w-5 h-5 text-secondary" />
          <h3 className="font-display text-lg uppercase tracking-wide">Questlines</h3>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
              <Plus className="w-4 h-4 mr-1" />
              Nova
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-primary/30">
            <DialogHeader>
              <DialogTitle className="font-display text-xl text-primary">Nova Questline</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-muted-foreground font-mono text-xs">NOME</Label>
                <Input
                  value={newQuestline.name}
                  onChange={(e) => setNewQuestline(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Domínio do React"
                  className="cyber-input mt-1"
                />
              </div>
              
              <div>
                <Label className="text-muted-foreground font-mono text-xs">DESCRIÇÃO</Label>
                <Textarea
                  value={newQuestline.description}
                  onChange={(e) => setNewQuestline(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Objetivo desta questline..."
                  className="cyber-input mt-1 min-h-[80px]"
                />
              </div>
              
              <div>
                <Label className="text-muted-foreground font-mono text-xs">ETAPAS</Label>
                <Input
                  type="number"
                  value={newQuestline.totalSteps}
                  onChange={(e) => setNewQuestline(prev => ({ ...prev, totalSteps: parseInt(e.target.value) || 1 }))}
                  min={1}
                  max={20}
                  className="cyber-input mt-1 w-24"
                />
              </div>
              
              <div>
                <Label className="text-muted-foreground font-mono text-xs">ÍCONE</Label>
                <div className="flex gap-2 mt-2">
                  {(["swords", "trophy", "sparkles"] as const).map(icon => {
                    const Icon = iconMap[icon];
                    return (
                      <button
                        key={icon}
                        onClick={() => setNewQuestline(prev => ({ ...prev, icon }))}
                        className={cn(
                          "p-3 rounded-lg border transition-all",
                          newQuestline.icon === icon
                            ? "border-primary bg-primary/20"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <Icon className={cn(
                          "w-5 h-5",
                          newQuestline.icon === icon ? "text-primary" : "text-muted-foreground"
                        )} />
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <Button 
                onClick={handleCreateQuestline}
                className="w-full bg-primary/20 border border-primary/50 text-primary hover:bg-primary/30"
              >
                Criar Questline
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Questlines List */}
      <div className="space-y-3">
        {questlines.filter(q => q.active).map((questline) => {
          const Icon = iconMap[questline.icon];
          const progressPercent = (questline.progress / questline.totalSteps) * 100;
          
          return (
            <div
              key={questline.id}
              className="p-3 rounded-lg bg-muted/30 border border-border hover:border-secondary/30 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-secondary" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm truncate">{questline.name}</h4>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-secondary transition-colors" />
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-secondary rounded-full transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">
                      {questline.progress}/{questline.totalSteps}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {questlines.filter(q => q.active).length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Scroll className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-mono">Nenhuma questline ativa</p>
        </div>
      )}
    </div>
  );
}
