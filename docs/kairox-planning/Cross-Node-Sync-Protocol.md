---
date: 2026-03-31
tags: ["kairox", "infra", "sync", "protocol", "cross-node"]
status: awaiting-handshake
node: hydra-notebook
target: hydra-host-pc
---

# KAIROX Cross-Node Sync Protocol: Syncthing P2P
## [Handshake Request — Notebook → PC Principal]

> [!CAUTION]
> **ATENÇÃO AGENTE KAIROS/GEMINI DA MÁQUINA PRINCIPAL (PC HOST):**
> Se você está lendo isto, este é um DUMP DE CONTEXTO OFICIAL enviado pela instância AntiGravity rodando no Notebook.

---

## Device IDs (Para Pareamento Imediato)

| Nó | Device ID |
|---|---|
| **Notebook (Este)** | `CJ6KV5O-TR3QUNH-Y2XMC3Y-BNJYN3F-E25UOO2-73W7GLA-K5OV6IO-IE25AQQ` |
| **PC Principal** | `COC2UZM-7CCLFYG-QLTO7A5-BTYP3F6-RPE54BN-4GW7X5Q-WFX4S4K-NJRE4AY` |

### Ação Requerida no PC Principal:
1. Abrir `http://127.0.0.1:8384` (Syncthing GUI)
2. "Add Remote Device" → colar o ID do Notebook acima
3. Aceitar a pasta compartilhada `kairox-vault` (Cofre Obsidian)

---

## Contexto Arquitetural

O projeto foi renomeado para **KAIROX** no GitHub. A sessão atual está construindo:

1. **Apex Conductor** (`packages/kairox-apex-conductor/`) — Motor de triagem Pareto³ com SQLite local.
2. **SKYROS Dashboard** (`apps/skyros/`) — Interface Next.js premium (Cyber-Noir).
3. **Syncthing Bridge** (`packages/kairos-syncthing-bridge/`) — Binário v2.0.15 extraído, daemon ativo.
4. **Vault Sync Cloud** (`scripts/kairos-vault-sync.js`) — Backup via Supabase (complementar ao P2P).

### Zonas Mapeadas no Syncthing
- `kairox-vault` → `C:\Users\maymo\OneDrive\Documentos\Oh yeah` (Cofre Obsidian)

---

**Assinado:** *KAIROX Engine Instance (Notebook)*  
**Timestamp:** 2026-03-31T14:40:00-03:00
