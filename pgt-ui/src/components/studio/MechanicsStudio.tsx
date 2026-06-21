import { useState } from "react";
import { useGameEngine } from "@/hooks/useGameEngine";
import { DynamicAttribute, DynamicSkill } from "@/lib/supabaseClient";

export function MechanicsStudio() {
  const { mechanics, loading, addAttribute, removeAttribute, addSkill, removeSkill } = useGameEngine();
  const [activeTab, setActiveTab] = useState<"attributes" | "skills">("attributes");

  // New Attribute State
  const [newAttrName, setNewAttrName] = useState("");
  const [newAttrType, setNewAttrType] = useState<"stat" | "currency" | "pool">("stat");
  const [newAttrIcon, setNewAttrIcon] = useState("Star");

  // New Skill State
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillIcon, setNewSkillIcon] = useState("Swords");

  if (loading) return <div className="text-muted-foreground p-4">Carregando Motor do Jogo...</div>;
  if (!mechanics) return <div className="text-red-500 p-4">Erro ao carregar mecânicas.</div>;

  const handleAddAttribute = async () => {
    if (!newAttrName) return;
    const newAttr: DynamicAttribute = {
      id: newAttrName.toLowerCase().replace(/\s+/g, "_"),
      name: newAttrName,
      type: newAttrType,
      value: 0,
      icon: newAttrIcon,
      color: "text-blue-400"
    };
    if (newAttrType === "pool") {
      newAttr.max_value = 100;
    }
    await addAttribute(newAttr);
    setNewAttrName("");
  };

  const handleAddSkill = async () => {
    if (!newSkillName) return;
    const newSkill: DynamicSkill = {
      id: newSkillName.toLowerCase().replace(/\s+/g, "_"),
      name: newSkillName,
      level: 1,
      xp: 0,
      xp_next_level: 100,
      icon: newSkillIcon,
      color: "text-emerald-400",
      linked_attributes: []
    };
    await addSkill(newSkill);
    setNewSkillName("");
  };

  return (
    <div className="bg-card text-card-foreground p-6 rounded-lg border shadow-sm w-full max-w-4xl mx-auto mt-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold font-heading">Mechanics Studio</h2>
          <p className="text-muted-foreground text-sm">Crie e edite as regras do seu OS (LifeRPG Engine).</p>
        </div>
        <div className="flex bg-muted p-1 rounded-md">
          <button 
            className={`px-4 py-1 rounded-sm text-sm font-medium ${activeTab === "attributes" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
            onClick={() => setActiveTab("attributes")}
          >
            Atributos & Recursos
          </button>
          <button 
            className={`px-4 py-1 rounded-sm text-sm font-medium ${activeTab === "skills" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
            onClick={() => setActiveTab("skills")}
          >
            Habilidades (Skills)
          </button>
        </div>
      </div>

      {activeTab === "attributes" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mechanics.attributes.map(attr => (
              <div key={attr.id} className="bg-background p-4 rounded-md border flex flex-col relative">
                <button 
                  onClick={() => removeAttribute(attr.id)}
                  className="absolute top-2 right-2 text-muted-foreground hover:text-red-400"
                >
                  &times;
                </button>
                <div className={`font-semibold ${attr.color} flex items-center gap-2 mb-2`}>
                  {/* Simplificando icones por nomes de lucide na v2 */}
                  [{attr.icon}] {attr.name}
                </div>
                <div className="text-xs text-muted-foreground uppercase">{attr.type}</div>
                <div className="text-sm mt-2">Value: {attr.value} {attr.max_value ? `/ ${attr.max_value}` : ""}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold mb-4">Criar Novo Atributo</h3>
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Nome</label>
                <input 
                  type="text" 
                  value={newAttrName} 
                  onChange={e => setNewAttrName(e.target.value)}
                  className="bg-background border rounded px-3 py-1.5 text-sm"
                  placeholder="Ex: Foco, Ouro, Mana"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Tipo</label>
                <select 
                  value={newAttrType} 
                  onChange={e => setNewAttrType(e.target.value as any)}
                  className="bg-background border rounded px-3 py-1.5 text-sm"
                >
                  <option value="stat">Stat (Cumulativo, ex: Inteligência)</option>
                  <option value="currency">Moeda (Gastável, ex: Ouro)</option>
                  <option value="pool">Pool (Ex: Energia 50/100)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Ícone</label>
                <input 
                  type="text" 
                  value={newAttrIcon} 
                  onChange={e => setNewAttrIcon(e.target.value)}
                  className="bg-background border rounded px-3 py-1.5 text-sm w-24"
                  placeholder="Ex: Star"
                />
              </div>
              <button 
                onClick={handleAddAttribute}
                className="bg-primary text-primary-foreground px-4 py-1.5 rounded text-sm font-medium hover:bg-primary/90"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "skills" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mechanics.skills.map(skill => (
              <div key={skill.id} className="bg-background p-4 rounded-md border flex flex-col relative">
                <button 
                  onClick={() => removeSkill(skill.id)}
                  className="absolute top-2 right-2 text-muted-foreground hover:text-red-400"
                >
                  &times;
                </button>
                <div className={`font-semibold ${skill.color} flex items-center gap-2 mb-2`}>
                  [{skill.icon}] {skill.name}
                </div>
                <div className="text-sm">Lvl {skill.level} ({skill.xp}/{skill.xp_next_level} XP)</div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold mb-4">Criar Nova Habilidade</h3>
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Nome da Skill</label>
                <input 
                  type="text" 
                  value={newSkillName} 
                  onChange={e => setNewSkillName(e.target.value)}
                  className="bg-background border rounded px-3 py-1.5 text-sm"
                  placeholder="Ex: Programação"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Ícone</label>
                <input 
                  type="text" 
                  value={newSkillIcon} 
                  onChange={e => setNewSkillIcon(e.target.value)}
                  className="bg-background border rounded px-3 py-1.5 text-sm w-24"
                  placeholder="Ex: Code"
                />
              </div>
              <button 
                onClick={handleAddSkill}
                className="bg-primary text-primary-foreground px-4 py-1.5 rounded text-sm font-medium hover:bg-primary/90"
              >
                Adicionar Skill
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
