# Walkthrough: KAIROX — Da Infraestrutura à Mente Mestra

> **Sessão contínua:** Vault Sync → Syncthing → Apex Conductor → SKYROS Dashboard

---

## 1. Vault Sync Nativo (Concluído)

Substituímos o plugin Remotely Save por um motor proprietário ([kairos-vault-sync.js](file:///c:/Users/maymo/OneDrive/Documentos/MY%20KAIROS/scripts/kairos-vault-sync.js)):

- Sincronização bidirecional via Supabase SDK (`@supabase/supabase-js`).
- Resolução de conflitos por `mtime` local vs `updated_at` remoto.
- Sanitização Unicode (NFD) para nomes com acentos → compatibilidade com Supabase Storage.
- Bucket `obsidian-vaults` criado programaticamente. 13 arquivos sincronizados com sucesso.
- Comando: `npm run sync:vault`.

---

## 2. Renomeação: KAIROS → KAIROX

O usuário renomeou o repositório GitHub para **KAIROX**. Todos os novos pacotes e módulos seguem essa convenção (`@kairox/apex-conductor`, etc.).

---

## 3. Syncthing P2P — Instalação Nativa

Baixamos o binário oficial `syncthing-windows-amd64-v2.0.15` diretamente da API do GitHub Releases e extraímos em:

```
packages/kairos-syncthing-bridge/syncthing-windows-amd64-v2.0.15/syncthing.exe (~27MB)
```

**Status:** Binário pronto. O usuário está instalando o Syncthing separadamente na Máquina Principal para obter o Device ID e fechar o pareamento P2P.

Também criamos o documento de contextualização cross-agent:
- [Cross-Node-Sync-Protocol.md](file:///C:/Users/maymo/OneDrive/Documentos/Oh%20yeah/KAIROS/Infra/Cross-Node-Sync-Protocol.md) — Dump de contexto completo para a instância Gemini na Máquina Irmã.

---

## 4. Apex Conductor — Motor de Triagem Pareto³

Criado o pacote [kairox-apex-conductor](file:///c:/Users/maymo/OneDrive/Documentos/MY%20KAIROS/packages/kairox-apex-conductor/):

| Arquivo | Função |
|---|---|
| `package.json` | Manifesto com dep `better-sqlite3` para banco local ultrarrápido |
| `src/core/pareto-engine.js` | Fórmula `(Impacto × Vontade) / Esforço`, triagem em 3 destinos: EXECUTE, DELEGATE_TO_SKYDRA, CUT_ELIMINATE |

> [!NOTE]
> O banco SQLite será o "cérebro rápido" — o Conductor consulta notas do Obsidian apenas quando o contexto exige, nunca continuamente.

**Pendências:** Schema SQLite, `npm install`, e testes com dados mock.

---

## 5. SKYROS Dashboard — Scaffolding Next.js

Projeto Next.js gerado em [apps/skyros/](file:///c:/Users/maymo/OneDrive/Documentos/MY%20KAIROS/apps/skyros/):

- TypeScript ativo, sem Tailwind (CSS Modules puro para UI "Cyber-Noir").
- Estrutura: `src/`, `public/`, `eslint.config.mjs`, `next.config.ts`, `tsconfig.json`.

**Pendências:** `npm install`, design system, telas de Triagem e HUD.

---

## Decisões Arquiteturais

| Decisão | Escolha | Motivo |
|---|---|---|
| Framework UI | **Next.js** (robusto) | Usuário pediu app robusto, não MVP leve |
| Persistência de triagem | **SQLite local** | Velocidade máxima, independente de cloud |
| Relação com Obsidian | **Consulta sob demanda** | Conductor pensa rápido no banco próprio, busca contexto no Vault só quando relevante |
| Styling | **Vanilla CSS / CSS Modules** | Máxima flexibilidade para estética Cyber-Noir premium |
| Sync P2P | **Syncthing** | Zero dependência de cloud para arquivos pesados entre nós |
| Sync Vault (cloud) | **Supabase Storage** | Backup remoto e acesso cross-device quando fora da rede local |

---

## Próximos Passos Imediatos

1. **Parear Syncthing** — Aguardando Device ID da Máquina Principal.
2. **`npm install`** nos pacotes criados (apex-conductor + skyros).
3. **Schema SQLite** — Tabelas: `tasks`, `triage_history`, `daily_focus`.
4. **Design System SKYROS** — CSS base com tema Cyber-Noir.
