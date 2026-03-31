# Planejamento: Implementação e Integração do Syncthing (P2P Mesh Sync)

A pedido, vamos expandir a resiliência e a infraestrutura Hydra implantando o **Syncthing** de forma nativa e silenciosa, injetando sua lógica diretamente na KAIROS. O Syncthing fornecerá uma sincronização Peer-to-Peer contínua, sem depender de nuvens centrais, ideal para arquivos locais pesados ou código não rastreado no Git.

## User Review Required

> [!IMPORTANT]
> A implantação do Syncthing como motor P2P nativo no Windows exige que definamos **o que será mapeado**. O script que recém-criamos (`kairos-vault-sync.js` via Supabase) funciona para a nuvem. O Syncthing atua diretamente entre a sua rede local (Notebook ↔ PC). Devemos integrar os dois modelos ou substituir o sync em nuvem totalmente pelo Syncthing? Confirme a estratégia de pastas abaixo.

## Proposed Changes

---

### Módulo de Infraestrutura Constante (Daemon)

#### [NEW] `packages/kairos-syncthing-bridge/`
Criaremos um pacote na KAIROS responsável por baixar, manter atualizado e invocar o Syncthing dinamicamente (Headless). 

- **Downloader Nativo (`install.ps1`)**: Script PowerShell que bate na API do GitHub (`/repos/syncthing/syncthing/releases/latest`), puxa o ZIP do `syncthing-windows-amd64`, e extrai na pasta `C:\KAIROS-INFRA\syncthing`.
- **Injeção de Configuração Automática**: A KAIROS irá ler/escrever o arquivo XML de configuração (`config.xml`) do Syncthing para injetar os "Folder Mappings" sem você precisar abrir a interface do localhost.

### Mapeamento Proposto (Topologia Hydra)

> [!NOTE]
> Sugiro mapearmos as seguintes zonas de interesse para a sua Mente Mestra e ecossistema:
> 
> 1. **Cofre Obsidian**: `C:\Users\maymo\OneDrive\Documentos\Oh yeah` (Garantindo P2P instantâneo na rede local entre PC/Note).
> 2. **KAIROS State**: `.smart-env` e possivelmente os logs/artefatos da `C:\Users\maymo\.gemini\antigravity\brain\` se desejar manter a "memória de IAs" comutável entre máquinas. 
> 3. **Pasta de Mídia Premium Experia**: Qualquer diretório raiz de grandes arquivos que você rejeita colocar no GitHub.

## Open Questions

> [!CAUTION]
> **Interação com a Máquina Irmã:** Como o Syncthing opera P2P (Device ID ↔ Device ID), eu precisarei que você acesse o Painel/Interface do Syncthing no seu Desktop Principal (a máquina "Irmã") para aceitar o pareamento assim que eu instalar e configurar aqui no Notebook. Você tem o ID do Syncthing da sua máquina principal em mãos para injetarmos diretamente?

> [!WARNING]
> Confirme se devo configurar o serviço para iniciar de forma 100% invisível (Headless Console via VBScript / Scheduled Tasks) junto com o Windows do Notebook, para que a triagem e o roteamento não dependam de você clicar no executável.

## Verification Plan

### Automated Tests
- Scripts validados via PowerShell farão download e Ping na local API do Syncthing (`http://127.0.0.1:8384/rest/system/ping`) via KAIROS.

### Manual Verification
- O comando `npm run infra:syncthing:status` irá declarar o estado de pareamento no próprio console CLI do KAIROS. Você acessará `localhost:8384` visualmente apenas para conferência rápida.
