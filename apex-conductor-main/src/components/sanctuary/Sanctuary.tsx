import { useState } from "react";
import { Sparkles, BookOpen, Heart, Moon, Send, Calendar } from "lucide-react";

interface JournalEntry {
  id: string;
  date: string;
  gratitude: string[];
  reflection: string;
}

export function Sanctuary() {
  const [gratitudeInput, setGratitudeInput] = useState("");
  const [gratitudeList, setGratitudeList] = useState<string[]>([]);
  const [reflection, setReflection] = useState("");

  const addGratitude = () => {
    if (gratitudeInput.trim()) {
      setGratitudeList(prev => [...prev, gratitudeInput.trim()]);
      setGratitudeInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addGratitude();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl text-secondary glow-gold flex items-center gap-3">
          <Sparkles className="w-8 h-8" />
          Santuário
        </h2>
        <p className="text-muted-foreground">Espaço de reflexão e reconexão espiritual</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Journaling Section */}
        <div className="glass-card-purple p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-6 h-6 text-purple-glow" />
            <h3 className="font-serif text-xl">Journaling de Gratidão</h3>
          </div>

          {/* Gratitude Input */}
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Pelo que você é grato hoje?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={gratitudeInput}
                  onChange={(e) => setGratitudeInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite e pressione Enter..."
                  className="flex-1 px-4 py-3 bg-muted/50 border border-border rounded-lg focus:outline-none focus:border-purple-glow/50 transition-colors"
                />
                <button
                  onClick={addGratitude}
                  className="px-4 py-3 bg-purple-glow/20 hover:bg-purple-glow/30 rounded-lg transition-colors"
                >
                  <Send className="w-5 h-5 text-purple-glow" />
                </button>
              </div>
            </div>

            {/* Gratitude List */}
            {gratitudeList.length > 0 && (
              <div className="space-y-2">
                {gratitudeList.map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg animate-fade-in"
                  >
                    <Heart className="w-4 h-4 text-pink-400 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Reflection */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Reflexão do dia
              </label>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Como foi seu dia? O que você aprendeu?"
                rows={4}
                className="w-full px-4 py-3 bg-muted/50 border border-border rounded-lg focus:outline-none focus:border-purple-glow/50 transition-colors resize-none"
              />
            </div>

            <button className="w-full py-3 rounded-lg bg-purple-glow/20 hover:bg-purple-glow/30 border border-purple-glow/30 transition-colors font-medium flex items-center justify-center gap-2">
              <Moon className="w-5 h-5" />
              Salvar no Diário
            </button>
          </div>
        </div>

        {/* Energy & Rituals */}
        <div className="space-y-6">
          {/* Energy Status */}
          <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
            <h3 className="font-serif text-lg mb-4">Status Energético</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Vibração</span>
                  <span className="text-green-400">85%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill-energy" style={{ width: "85%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Clareza Mental</span>
                  <span className="text-purple-glow">72%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill-purple" style={{ width: "72%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Foco</span>
                  <span className="text-secondary">90%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill-gold" style={{ width: "90%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Daily Rituals Checklist */}
          <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-secondary" />
              <h3 className="font-serif text-lg">Rituais Noturnos</h3>
            </div>

            <div className="space-y-3">
              {[
                { label: "Meditação (15 min)", done: true },
                { label: "Leitura Espiritual", done: true },
                { label: "Journaling de Gratidão", done: false },
                { label: "Preparar ambiente para dormir", done: false },
              ].map((ritual, index) => (
                <label 
                  key={index}
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <input 
                    type="checkbox" 
                    defaultChecked={ritual.done}
                    className="w-5 h-5 rounded border-border bg-muted accent-secondary"
                  />
                  <span className={ritual.done ? "text-muted-foreground line-through" : ""}>
                    {ritual.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
