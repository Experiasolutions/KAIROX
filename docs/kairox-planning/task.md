# Planejamento Operacional: KAIROX — Mente Mestra & Infraestrutura

> Projeto renomeado de KAIROS → **KAIROX** (GitHub: `KAIROX`)

---

## Fase 0: Vault Sync Nativo (CONCLUÍDA ✓)
- [x] Criar motor bidirecional (`scripts/kairos-vault-sync.js`) via Supabase SDK.
- [x] Sanitização Unicode para compatibilidade com Storage keys.
- [x] Bucket `obsidian-vaults` ativo e validado com 13 arquivos.
- [x] Comando `npm run sync:vault` operacional.
- [x] Remoção do script legado `kairos-configure-remotely-save.js`.

---

## Fase 1: Fundação do Apex Conductor (Motor Lógico)
- [x] Criar `packages/kairox-apex-conductor/package.json` (dependência: `better-sqlite3`).
- [x] Implementar `pareto-engine.js` — fórmula `(Impacto × Vontade) / Esforço`.
- [ ] Instalar dependências (`npm install` no workspace).
- [ ] Criar schema SQLite para persistir tarefas triadas (banco ultrarrápido local).
- [ ] Conectar o engine ao banco: `INSERT` de triagens, `SELECT` do backlog ativo.
- [ ] Testar dry-run da triagem com dados mock (3 tarefas simuladas).

---

## Fase 2: Interface SKYROS (Next.js Dashboard)
- [x] Scaffolding do projeto Next.js em `apps/skyros/` (sem Tailwind, TypeScript).
- [ ] Instalar dependências (`cd apps/skyros && npm install`).
- [ ] Implementar Root Layout: tema "Cyber-Noir Corporativo" (Dark Mode absoluto, Inter/Outfit).
- [ ] Criar Design System base (CSS Modules): cores, tipografia, glassmorphism, micro-animações.
- [ ] Criar tela **Mesa de Triagem**: cards de tarefas com score Pareto visual.
- [ ] Criar **HUD do Sistema**: status dos nós Hydra, agentes em background.
- [ ] Conectar frontend ao Apex Conductor (API Routes do Next.js → SQLite).

---

## Fase 3: Integração KAIROX ↔ Obsidian
- [ ] Fazer o Apex Conductor ler notas do Cofre Obsidian sob demanda (não contínuo).
- [ ] Pipe bidirecional: Dashboard despacha ordens → backend → Cofre/Skydra.

---

## Fase 4: Syncthing P2P (KAIROS Bridge)
- [x] Planejamento aprovado.
- [x] Binário `syncthing.exe` v2.0.15 extraído em `packages/kairos-syncthing-bridge/`.
- [x] Protocolo Cross-Node escrito no Cofre (`Oh yeah/KAIROS/Infra/Cross-Node-Sync-Protocol.md`).
- [ ] **Usuário instalando Syncthing na máquina principal** → Obter Device ID.
- [ ] Parear dispositivos (troca de Device IDs via API ou manual).
- [ ] Mapear pastas compartilhadas (Cofre Obsidian + Mídia Premium).
- [ ] Configurar daemon headless (auto-start com Windows).

---

## Fase 5: Contextualização Cross-Agent
- [ ] Quando conexão P2P ativa, sincronizar contexto com instância Gemini da máquina irmã.
- [ ] Validar que o outro agente leu o `Cross-Node-Sync-Protocol.md`.
