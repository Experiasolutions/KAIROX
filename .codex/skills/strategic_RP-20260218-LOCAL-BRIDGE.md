@aios-master

╔══════════════════════════════════════════════════════════════════╗
║  REASONING PACKAGE                                              ║
║  ID: RP-20260218-LOCAL-BRIDGE                                  ║
║  Mode: PM2-EXECUTION                                           ║
║  Priority: HIGH                                                ║
║  Executor: Antigravity (auto-execução)                        ║
║  Estimativa: 1 sessão                                          ║
╚══════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ NOTA DE EXECUÇÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Você (Antigravity) está executando este RP sobre si mesmo.
Isso significa:
  → Você cria os arquivos que vão estender sua própria infra
  → Você NÃO consegue testar a conexão com o terminal local
    (a máquina local não está acessível durante a execução)
  → Marque os testes que dependem de máquina local como
    [REQUER AÇÃO DO GABRIEL] no Quality Gate
  → Ao final, entregue instruções claras do que Gabriel
    precisa fazer localmente para ativar

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 CONTEXT BLOCK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Objetivo: Antigravity rodando no Codespaces consegue executar
comandos no terminal local do Gabriel, receber output em tempo
real, e operar como se estivesse na máquina física.

Workspace: /workspaces/antigravity-workspace

Arquivos a CRIAR:
  scripts/local-bridge.js          ← roda na máquina LOCAL do Gabriel
  scripts/codespaces-tunnel.js     ← roda no Codespaces, conecta ao local
  scripts/bridge-auth.js           ← geração e validação de token
  scripts/start-local-bridge.sh    ← script de inicialização local (1 comando)
  .env.bridge.example              ← template de configuração
  docs/LOCAL-BRIDGE-SETUP.md       ← addendum ao master guide existente

Arquivos a LER antes de começar:
  .devcontainer/devcontainer.json  ← entender portas e setup existentes
  scripts/setup.sh                 ← entender padrão de setup do projeto
  scripts/health-check.sh          ← para adicionar check do bridge
  config/antigravity.config.js     ← entender como tools são registradas
  package.json                     ← dependências disponíveis

Arquivos a MODIFICAR:
  scripts/setup.sh                 ← adicionar instrução de bridge no final
  scripts/health-check.sh          ← adicionar [5/5] Bridge status
  .devcontainer/devcontainer.json  ← adicionar porta 8765 se não existir

Dependências que Gabriel precisa ter LOCALMENTE:
  - Node.js (já tem, conforme guia)
  - ngrok: npm install -g ngrok  ← instalar se não tiver

Bloqueadores conhecidos:
  - ngrok sem conta: URL muda a cada restart (aceitável para dev)
  - ngrok com conta free: URL persistente disponível
  - Firewall bloqueando porta 8765: usar porta alternativa via env

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 ARCHITECTURE DECISION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Fluxo completo:

  ┌─────────────────────────────────────────────────────────┐
  │  CODESPACES (cloud)                                     │
  │                                                         │
  │  Antigravity                                           │
  │      ↓ chama: execute_local("ls -la")                  │
  │  codespaces-tunnel.js                                  │
  │      ↓ WebSocket message (wss://[ngrok-url])           │
  └────────────────────┬────────────────────────────────────┘
                       │ internet
                       ▼
  ┌─────────────────────────────────────────────────────────┐
  │  NGROK TUNNEL (intermediário)                          │
  │  wss://xxxx.ngrok.io → ws://localhost:8765             │
  └────────────────────┬────────────────────────────────────┘
                       │
                       ▼
  ┌─────────────────────────────────────────────────────────┐
  │  MÁQUINA LOCAL do Gabriel                               │
  │                                                         │
  │  local-bridge.js (porta 8765)                          │
  │      ↓ child_process.spawn                             │
  │  Terminal local                                        │
  │      ↑ stdout/stderr streaming                         │
  │  local-bridge.js                                       │
  │      ↑ WebSocket response stream                       │
  └─────────────────────────────────────────────────────────┘

Por que WebSocket e não HTTP:
  → Comandos como npm install, git pull, builds são longos
  → WebSocket entrega output linha a linha em tempo real
  → HTTP só responderia após o comando terminar — inutilizável
    para comandos com mais de 2-3 segundos de execução

Por que ngrok e não SSH reverso ou VS Code Port Forwarding:
  → ngrok: 1 comando, funciona em qualquer rede, zero config de rede
  → SSH reverso: exige IP fixo ou servidor intermediário
  → VS Code Port Forwarding: expõe porta do Codespaces para local,
    não o inverso que precisamos

Segurança — mínimo viável para uso pessoal:
  → Token de 64 chars em todas as mensagens
  → Timeout de 120s por comando
  → Blocklist de comandos destrutivos
  → Log local de todos os comandos executados

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 EXECUTION PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1 — VARREDURA (não crie nada ainda)

  Execute:
    cat .devcontainer/devcontainer.json
    cat scripts/setup.sh
    cat scripts/health-check.sh
    cat package.json
    ls config/ 2>/dev/null || echo "sem config/"

  Mapeie:
    → Portas já declaradas no devcontainer (evitar conflito)
    → Padrão de comentários e estrutura dos scripts .sh
    → Dependências já instaladas (ws, express, etc.)
    → Como config/antigravity.config.js registra tools
      (se não existir, entender onde Antigravity carrega tools)

  Declare: "VARREDURA CONCLUÍDA — portas em uso: [lista],
            padrão de scripts: [observação]"

─────────────────────────────────────────────────────────────────

STEP 2 — bridge-auth.js

  Arquivo: scripts/bridge-auth.js

  /**
   * @module bridge-auth
   * @purpose Geração e validação de token para local bridge
   * @inputs process.env.BRIDGE_TOKEN
   * @outputs { generateToken, validateToken, getTokenFromEnv }
   */

  'use strict';

  const crypto = require('crypto');

  function generateToken() {
    // 64 chars hex = 256 bits de entropia
    return crypto.randomBytes(32).toString('hex');
  }

  function validateToken(received, expected) {
    // timing-safe: evita ataques de timing mesmo em uso pessoal
    if (!received || !expected) return false;
    if (received.length !== expected.length) return false;
    return crypto.timingSafeEqual(
      Buffer.from(received),
      Buffer.from(expected)
    );
  }

  function getTokenFromEnv() {
    const token = process.env.BRIDGE_TOKEN;
    if (!token) {
      console.error('❌ BRIDGE_TOKEN não definido.');
      console.error('   Gere um token: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
      console.error('   Adicione ao .env.bridge: BRIDGE_TOKEN=<token>');
      process.exit(1);
    }
    return token;
  }

  module.exports = { generateToken, validateToken, getTokenFromEnv };

  Teste (executar para verificar):
    node -e "const a = require('./scripts/bridge-auth');
             const t = a.generateToken();
             console.log('token:', t.length, 'chars');
             console.log('valid:', a.validateToken(t, t));
             console.log('invalid:', a.validateToken('wrong', t));"
  Esperado: token: 64 chars | valid: true | invalid: false

─────────────────────────────────────────────────────────────────

STEP 3 — local-bridge.js (RODA NA MÁQUINA LOCAL)

  Arquivo: scripts/local-bridge.js

  /**
   * @module local-bridge
   * @purpose Servidor WebSocket local que executa comandos do terminal
   * @runtime MÁQUINA LOCAL do Gabriel (não Codespaces)
   * @start node scripts/local-bridge.js
   * @inputs WS message: { token, commandId, command, cwd }
   * @outputs WS stream: { commandId, type, data }
   *   types: 'stdout' | 'stderr' | 'exit' | 'error'
   * @port process.env.BRIDGE_LOCAL_PORT || 8765
   * @requires BRIDGE_TOKEN no ambiente ou .env.bridge
   */

  'use strict';

  require('dotenv').config({ path: '.env.bridge' });

  const { createServer } = require('http');
  const { WebSocketServer } = require('ws');
  const { spawn } = require('child_process');
  const path = require('path');
  const fs = require('fs');
  const { validateToken, getTokenFromEnv } = require('./bridge-auth');

  const PORT = parseInt(process.env.BRIDGE_LOCAL_PORT) || 8765;
  const TOKEN = getTokenFromEnv();
  const LOG_PATH = path.join(__dirname, '..', 'data', 'bridge-commands.log');

  // BLOCKLIST — comandos que nunca serão executados
  const BLOCKED_PATTERNS = [
    /rm\s+-rf\s+\//i,
    /mkfs/i,
    /dd\s+if=/i,
    /shutdown/i,
    /reboot/i,
    /halt/i,
    /:()\s*\{.*\}/,            // fork bomb
    /del\s+\/[sf]/i,           // Windows equivalente
    /format\s+[a-z]:/i,
  ];

  function isCommandBlocked(command) {
    return BLOCKED_PATTERNS.some(pattern => pattern.test(command));
  }

  function logCommand(entry) {
    // EDGE CASE EC-01: diretório data/ pode não existir localmente
    const dir = path.dirname(LOG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const line = JSON.stringify({ ...entry, ts: new Date().toISOString() }) + '\n';
    fs.appendFileSync(LOG_PATH, line);
  }

  const server = createServer();
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress;
    let authenticated = false;

    // EDGE CASE EC-02: conexão sem autenticação nos primeiros 5s
    const authTimeout = setTimeout(() => {
      if (!authenticated) {
        ws.close(4001, 'Authentication timeout');
      }
    }, 5000);

    ws.on('message', (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw.toString());
      } catch (e) {
        ws.send(JSON.stringify({ type: 'error', reason: 'invalid_json' }));
        return;
      }

      // Primeira mensagem deve autenticar
      if (!authenticated) {
        if (!validateToken(msg.token, TOKEN)) {
          ws.close(4001, 'Invalid token');
          return;
        }
        authenticated = true;
        clearTimeout(authTimeout);
        ws.send(JSON.stringify({ type: 'auth_ok' }));
        return;
      }

      const { commandId, command, cwd } = msg;

      // EDGE CASE EC-03: comando bloqueado
      if (isCommandBlocked(command)) {
        ws.send(JSON.stringify({
          commandId,
          type: 'error',
          reason: 'command_blocked',
          message: `Comando bloqueado por política de segurança: ${command}`
        }));
        logCommand({ commandId, command, cwd, status: 'BLOCKED', ip });
        return;
      }

      // EDGE CASE EC-04: cwd inválido ou não existe
      const safeCwd = cwd || process.env.HOME || process.cwd();
      if (!fs.existsSync(safeCwd)) {
        ws.send(JSON.stringify({
          commandId,
          type: 'error',
          reason: 'invalid_cwd',
          message: `Diretório não encontrado: ${safeCwd}`
        }));
        return;
      }

      logCommand({ commandId, command, cwd: safeCwd, status: 'STARTED', ip });
      ws.send(JSON.stringify({ commandId, type: 'started' }));

      const proc = spawn(command, [], {
        shell: true,
        cwd: safeCwd,
        env: { ...process.env }
      });

      // Timeout de 120 segundos por comando
      const cmdTimeout = setTimeout(() => {
        proc.kill('SIGTERM');
        ws.send(JSON.stringify({
          commandId,
          type: 'error',
          reason: 'timeout',
          message: 'Comando excedeu 120s e foi encerrado'
        }));
        logCommand({ commandId, command, status: 'TIMEOUT' });
      }, 120000);

      proc.stdout.on('data', (data) => {
        ws.send(JSON.stringify({
          commandId,
          type: 'stdout',
          data: data.toString()
        }));
      });

      proc.stderr.on('data', (data) => {
        ws.send(JSON.stringify({
          commandId,
          type: 'stderr',
          data: data.toString()
        }));
      });

      proc.on('close', (code) => {
        clearTimeout(cmdTimeout);
        ws.send(JSON.stringify({ commandId, type: 'exit', code }));
        logCommand({ commandId, command, status: 'DONE', exitCode: code });
      });

      proc.on('error', (err) => {
        clearTimeout(cmdTimeout);
        // EDGE CASE EC-05: comando não encontrado no PATH
        ws.send(JSON.stringify({
          commandId,
          type: 'error',
          reason: 'spawn_error',
          message: err.message
        }));
        logCommand({ commandId, command, status: 'ERROR', error: err.message });
      });
    });

    ws.on('close', () => {
      clearTimeout(authTimeout);
    });
  });

  server.listen(PORT, () => {
    console.log('');
    console.log('🌉 Local Bridge ativo!');
    console.log(`   Porta: ${PORT}`);
    console.log(`   Log:   ${LOG_PATH}`);
    console.log('');
    console.log('📡 Agora exponha com ngrok:');
    console.log(`   ngrok http ${PORT}`);
    console.log('');
    console.log('📋 Copie a URL do ngrok e cole em .env.bridge no Codespaces:');
    console.log('   BRIDGE_WS_URL=wss://xxxx.ngrok.io');
    console.log('');
    console.log('⏳ Aguardando conexão do Codespaces...');
  });

─────────────────────────────────────────────────────────────────

STEP 4 — codespaces-tunnel.js (RODA NO CODESPACES)

  Arquivo: scripts/codespaces-tunnel.js

  /**
   * @module codespaces-tunnel
   * @purpose Cliente WebSocket que conecta ao local-bridge via ngrok
   * @runtime Codespaces (cloud)
   * @inputs { command, cwd? }
   * @outputs Promise<{ stdout, stderr, exitCode, duration }>
   * @requires .env.bridge com BRIDGE_WS_URL e BRIDGE_TOKEN
   */

  'use strict';

  require('dotenv').config({ path: '.env.bridge' });

  const WebSocket = require('ws');
  const { getTokenFromEnv } = require('./bridge-auth');

  const BRIDGE_URL = process.env.BRIDGE_WS_URL;
  const TOKEN = getTokenFromEnv();

  /**
   * Executa um comando no terminal local do Gabriel
   * @param {string} command - Comando a executar
   * @param {string} [cwd] - Diretório de trabalho (default: home)
   * @returns {Promise<{stdout: string, stderr: string, exitCode: number, duration: number}>}
   */
  async function executeLocalCommand(command, cwd = null) {
    if (!BRIDGE_URL) {
      throw new Error(
        '❌ BRIDGE_WS_URL não configurado em .env.bridge\n' +
        '   1. Rode local-bridge.js na máquina local\n' +
        '   2. Rode: ngrok http 8765\n' +
        '   3. Copie a URL para .env.bridge: BRIDGE_WS_URL=wss://...'
      );
    }

    return new Promise((resolve, reject) => {
      const commandId = `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const startTime = Date.now();

      let stdout = '';
      let stderr = '';
      let authenticated = false;

      // EDGE CASE EC-06: bridge offline ou URL inválida
      const ws = new WebSocket(BRIDGE_URL);

      const connectTimeout = setTimeout(() => {
        ws.terminate();
        reject(new Error(
          '❌ Local Bridge não respondeu em 8s.\n' +
          '   Verifique se local-bridge.js está rodando na sua máquina.'
        ));
      }, 8000);

      ws.on('open', () => {
        clearTimeout(connectTimeout);
        // Autenticar primeiro
        ws.send(JSON.stringify({ token: TOKEN }));
      });

      ws.on('message', (raw) => {
        let msg;
        try {
          msg = JSON.parse(raw.toString());
        } catch (e) {
          return;
        }

        if (msg.type === 'auth_ok') {
          authenticated = true;
          // Enviar comando após autenticação
          ws.send(JSON.stringify({ commandId, command, cwd }));
          return;
        }

        if (msg.type === 'error' && !authenticated) {
          ws.close();
          reject(new Error(`Falha de autenticação: ${msg.reason}`));
          return;
        }

        if (msg.commandId !== commandId) return;

        if (msg.type === 'stdout') stdout += msg.data;
        if (msg.type === 'stderr') stderr += msg.data;

        if (msg.type === 'exit') {
          ws.close();
          resolve({
            stdout,
            stderr,
            exitCode: msg.code,
            duration: Date.now() - startTime
          });
        }

        if (msg.type === 'error') {
          ws.close();
          reject(new Error(`Erro no comando: ${msg.reason} — ${msg.message}`));
        }
      });

      ws.on('error', (err) => {
        clearTimeout(connectTimeout);
        // EDGE CASE EC-07: ngrok URL expirada
        reject(new Error(
          `❌ Erro de conexão: ${err.message}\n` +
          '   Se a URL do ngrok mudou, atualize BRIDGE_WS_URL em .env.bridge'
        ));
      });

      ws.on('close', (code) => {
        if (code === 4001) {
          reject(new Error('❌ Token inválido. Verifique BRIDGE_TOKEN em .env.bridge'));
        }
      });
    });
  }

  // Execução direta via terminal (teste rápido)
  // node scripts/codespaces-tunnel.js "ls -la"
  if (require.main === module) {
    const command = process.argv.slice(2).join(' ');
    if (!command) {
      console.log('Uso: node scripts/codespaces-tunnel.js "comando"');
      process.exit(1);
    }

    executeLocalCommand(command)
      .then(result => {
        if (result.stdout) process.stdout.write(result.stdout);
        if (result.stderr) process.stderr.write(result.stderr);
        process.exit(result.exitCode);
      })
      .catch(err => {
        console.error(err.message);
        process.exit(1);
      });
  }

  module.exports = { executeLocalCommand };

─────────────────────────────────────────────────────────────────

STEP 5 — Verificar/instalar dependência 'ws'

  Execute:
    cat package.json | grep '"ws"'

  SE não existir:
    npm install ws dotenv
    echo "✓ ws e dotenv instalados"
  SE já existir:
    echo "✓ ws já disponível"

─────────────────────────────────────────────────────────────────

STEP 6 — .env.bridge.example

  Arquivo: .env.bridge.example
  (template público — não contém valores reais)

  # ================================================================
  # LOCAL BRIDGE CONFIGURATION
  # ================================================================
  # Copie este arquivo para .env.bridge e preencha os valores
  # NUNCA commite .env.bridge (já está no .gitignore)
  # ================================================================

  # Token de autenticação — MESMO valor nos dois lados (local e Codespaces)
  # Gerar: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  BRIDGE_TOKEN=cole_aqui_o_token_gerado

  # URL do túnel ngrok (atualizar quando reiniciar o ngrok)
  # Obtida em: terminal onde ngrok está rodando → "Forwarding wss://..."
  BRIDGE_WS_URL=wss://xxxx-xx-xxx-xxx-xx.ngrok-free.app

  # Porta do bridge na máquina local (padrão: 8765)
  BRIDGE_LOCAL_PORT=8765

  Verificar que .env.bridge está no .gitignore:
    grep -q ".env.bridge" .gitignore || echo ".env.bridge" >> .gitignore
    echo "✓ .env.bridge protegido no .gitignore"

─────────────────────────────────────────────────────────────────

STEP 7 — start-local-bridge.sh (script para máquina LOCAL)

  Arquivo: scripts/start-local-bridge.sh

  #!/bin/bash
  # ================================================================
  # START LOCAL BRIDGE
  # Rode este script na sua MÁQUINA LOCAL para ativar o bridge
  # Uso: bash scripts/start-local-bridge.sh
  # ================================================================

  set -e

  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
  ENV_FILE="$PROJECT_DIR/.env.bridge"
  PORT="${BRIDGE_LOCAL_PORT:-8765}"

  echo ""
  echo "🌉 LOCAL BRIDGE — AIOS"
  echo "========================"

  # Verificar .env.bridge
  if [ ! -f "$ENV_FILE" ]; then
    echo "❌ .env.bridge não encontrado em: $ENV_FILE"
    echo ""
    echo "Crie o arquivo com:"
    echo "  cp .env.bridge.example .env.bridge"
    echo "  # Edite com seu token"
    exit 1
  fi

  # Verificar Node.js
  if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale em: https://nodejs.org"
    exit 1
  fi

  # Verificar dependência ws
  cd "$PROJECT_DIR"
  if [ ! -d "node_modules/ws" ]; then
    echo "📦 Instalando dependências..."
    npm install ws dotenv
  fi

  # Verificar ngrok
  if ! command -v ngrok &> /dev/null; then
    echo "⚠️  ngrok não encontrado."
    echo "   Instale: npm install -g ngrok"
    echo "   Ou: https://ngrok.com/download"
    echo ""
    echo "▶ Iniciando bridge sem túnel (apenas localhost)..."
    echo "  Para acesso remoto do Codespaces, instale ngrok."
    echo ""
    node "$SCRIPT_DIR/local-bridge.js"
    exit 0
  fi

  # Iniciar bridge em background
  echo "▶ Iniciando local-bridge.js na porta $PORT..."
  node "$SCRIPT_DIR/local-bridge.js" &
  BRIDGE_PID=$!
  echo "  PID: $BRIDGE_PID"

  # Aguardar bridge estar pronto
  sleep 1

  # Iniciar ngrok
  echo ""
  echo "▶ Iniciando ngrok..."
  echo "  Copie a URL 'Forwarding wss://...' e cole em .env.bridge no Codespaces"
  echo ""
  ngrok http "$PORT"

  # Cleanup ao encerrar (Ctrl+C)
  trap "kill $BRIDGE_PID 2>/dev/null; echo 'Bridge encerrado.'" EXIT

─────────────────────────────────────────────────────────────────

STEP 8 — Atualizar scripts/health-check.sh

  Adicionar ao final do health-check.sh existente,
  antes da linha final de "Health check completo!":

  # Bridge
  echo "[5/5] Local Bridge..."
  if [ -n "$BRIDGE_WS_URL" ]; then
      echo "  ✅ BRIDGE_WS_URL configurada"
      if node -e "
        require('dotenv').config({ path: '.env.bridge' });
        const { executeLocalCommand } = require('./scripts/codespaces-tunnel');
        executeLocalCommand('echo bridge-ok')
          .then(r => { process.stdout.write(r.stdout); process.exit(0); })
          .catch(() => process.exit(1));
      " 2>/dev/null | grep -q 'bridge-ok'; then
          echo "  ✅ Conexão com terminal local: OK"
      else
          echo "  ⚠️  Bridge configurado mas sem resposta do local"
          echo "     Rode na máquina local: bash scripts/start-local-bridge.sh"
      fi
  else
      echo "  ⚪ Bridge não configurado (opcional)"
      echo "     Para ativar: ver docs/LOCAL-BRIDGE-SETUP.md"
  fi

─────────────────────────────────────────────────────────────────

STEP 9 — Atualizar .devcontainer/devcontainer.json

  Leia o arquivo atual.
  Verifique se já existe "forwardPorts".
  SE existe: adicione 8765 ao array SE não estiver.
  SE não existe: adicione a seção.

  Adicionar/verificar:
    "forwardPorts": [8765],
    "portsAttributes": {
      "8765": {
        "label": "Local Bridge",
        "onAutoForward": "silent"
      }
    }

  NOTA: esta porta não é usada do Codespaces para fora —
  é apenas documentação. O túnel real vai pelo ngrok.

─────────────────────────────────────────────────────────────────

STEP 10 — docs/LOCAL-BRIDGE-SETUP.md

  Arquivo: docs/LOCAL-BRIDGE-SETUP.md

  # Local Bridge Setup
  ## Addendum ao ANTIGRAVITY-CODESPACES-MASTER-GUIDE.md

  > Permite que o Antigravity no Codespaces execute comandos
  > no terminal da sua máquina local.

  ## Como funciona

  [diagrama ASCII do fluxo — igual ao Architecture Decision acima]

  ## Setup inicial (uma vez, ~5 minutos)

  ### Passo 1 — Gerar token de autenticação
  Execute NO CODESPACES:
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  Copie o token gerado. Guarde bem — você vai usar nos dois lados.

  ### Passo 2 — Criar .env.bridge
  NO CODESPACES:
    cp .env.bridge.example .env.bridge
  Edite e cole o token em BRIDGE_TOKEN.
  Deixe BRIDGE_WS_URL em branco por enquanto.

  NA MÁQUINA LOCAL:
    cp .env.bridge.example .env.bridge
  Edite e cole o MESMO token em BRIDGE_TOKEN.

  ### Passo 3 — Instalar ngrok (máquina local, se não tiver)
    npm install -g ngrok
    # ou: https://ngrok.com/download

  ## Uso diário (~30 segundos para ativar)

  NA MÁQUINA LOCAL (1 comando):
    bash scripts/start-local-bridge.sh

  O script:
    1. Inicia o local-bridge.js
    2. Inicia o ngrok automaticamente
    3. Exibe a URL: wss://xxxx.ngrok-free.app

  NO CODESPACES:
  Abra .env.bridge e atualize BRIDGE_WS_URL com a URL do ngrok.

  PRONTO. Teste no Codespaces:
    node scripts/codespaces-tunnel.js "whoami"
    node scripts/codespaces-tunnel.js "ls -la ~"
    node scripts/codespaces-tunnel.js "node --version"

  ## Integração com Antigravity

  O Antigravity pode usar o bridge diretamente:

    const { executeLocalCommand } = require('./scripts/codespaces-tunnel');

    // Exemplo: verificar estado do projeto local
    const result = await executeLocalCommand('git status', '/Users/gabriel/meu-projeto');
    console.log(result.stdout);

  ## Troubleshooting

  ❌ "BRIDGE_WS_URL não configurado"
     → Atualize .env.bridge com a URL atual do ngrok

  ❌ "Local Bridge não respondeu em 8s"
     → Execute bash scripts/start-local-bridge.sh na máquina local

  ❌ "Token inválido"
     → BRIDGE_TOKEN deve ser idêntico em ambos os lados

  ❌ "URL do ngrok mudou"
     → Ngrok free tier gera URL nova a cada restart
     → Atualize BRIDGE_WS_URL no .env.bridge do Codespaces
     → Para URL fixa: crie conta em ngrok.com (free tier inclui 1 domínio estático)

  ## Segurança

  - Token de 64 chars (256 bits) — brute force inviável
  - Blocklist de comandos destrutivos (rm -rf /, shutdown, etc.)
  - Log de todos os comandos em data/bridge-commands.log
  - Timeout de 120s por comando
  - Nunca commite .env.bridge (já no .gitignore)

─────────────────────────────────────────────────────────────────

STEP 11 — Atualizar scripts/setup.sh

  Adicionar ao final do setup.sh existente:

  echo ""
  echo "[BRIDGE] Local Bridge (opcional)"
  if [ ! -f ".env.bridge" ]; then
    cp .env.bridge.example .env.bridge
    echo "  ✅ .env.bridge.example copiado para .env.bridge"
    echo "  ⚠️  Configure BRIDGE_TOKEN e BRIDGE_WS_URL para ativar"
    echo "  📖 Ver: docs/LOCAL-BRIDGE-SETUP.md"
  else
    echo "  ✅ .env.bridge já existe"
  fi

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ EDGE CASES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EC-01: diretório data/ não existe na máquina local
  Solução: local-bridge.js cria com fs.mkdirSync({ recursive: true })
  Já implementado no STEP 3.

EC-02: ws não instalado
  Solução: STEP 5 verifica e instala automaticamente
  start-local-bridge.sh também verifica.

EC-03: ngrok URL muda após restart
  Impacto: BRIDGE_WS_URL desatualizado → conexão falha
  Solução: mensagem de erro clara em codespaces-tunnel.js
  Mitigação: docs instrui a criar conta ngrok free (domínio estático)

EC-04: Porta 8765 em uso na máquina local
  Impacto: local-bridge.js falha ao iniciar
  Solução: BRIDGE_LOCAL_PORT configurável no .env.bridge
  O start-local-bridge.sh lê a variável antes de iniciar o ngrok

EC-05: Codespaces reinicia e perde .env.bridge
  Impacto: BRIDGE_WS_URL apagado
  Solução: documentar no LOCAL-BRIDGE-SETUP.md que .env.bridge
  deve ser recriado após rebuild do Codespace
  Mitigação futura: salvar BRIDGE_WS_URL no Supabase via sync-manager

EC-06: Múltiplos comandos simultâneos
  Impacto: outputs misturados se commandId não for único
  Solução: commandId usa Date.now() + random — colisão improvável
  O local-bridge.js filtra por commandId antes de enviar

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ QUALITY GATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Verificações que o Antigravity pode executar agora:

  □ scripts/bridge-auth.js existe e passa no teste do STEP 2
  □ scripts/local-bridge.js existe e tem sintaxe válida:
      node --check scripts/local-bridge.js
  □ scripts/codespaces-tunnel.js existe e tem sintaxe válida:
      node --check scripts/codespaces-tunnel.js
  □ .env.bridge.example existe com as 3 variáveis documentadas
  □ .env.bridge está no .gitignore
  □ scripts/start-local-bridge.sh existe e tem permissão:
      chmod +x scripts/start-local-bridge.sh
  □ docs/LOCAL-BRIDGE-SETUP.md existe
  □ health-check.sh atualizado com [5/5]
  □ setup.sh atualizado com instrução do bridge
  □ ws e dotenv em package.json (após STEP 5)

Verificações que requerem ação do Gabriel [REQUER AÇÃO]:

  □ [GABRIEL] Gerar BRIDGE_TOKEN e configurar .env.bridge
  □ [GABRIEL] Instalar ngrok localmente
  □ [GABRIEL] Executar bash scripts/start-local-bridge.sh
  □ [GABRIEL] Atualizar BRIDGE_WS_URL com URL do ngrok
  □ [GABRIEL] Testar:
      node scripts/codespaces-tunnel.js "echo bridge-ok"
      Esperado: stdout = "bridge-ok\n", exitCode = 0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚫 O QUE NÃO FAZER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  → NÃO commite .env.bridge (contém token real)
  → NÃO exponha o local-bridge.js sem token (está protegido,
    mas nunca rode sem BRIDGE_TOKEN definido)
  → NÃO use o bridge para comandos que modificam arquivos
    críticos sem confirmar o cwd
  → NÃO altere o ANTIGRAVITY-CODESPACES-MASTER-GUIDE.md —
    o LOCAL-BRIDGE-SETUP.md é o addendum correto

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 EXECUTION DIRECTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Você está executando este RP sobre a própria infraestrutura.
Execute os steps em ordem. Não paralelize.

Ao finalizar, entregue ao Gabriel:

  [LOCAL BRIDGE REPORT]
  Arquivos criados: [lista com paths]
  Arquivos modificados: [lista]
  Sintaxe válida: [node --check em cada .js]
  Dependências: [ws instalado: sim/não]

  PRÓXIMOS PASSOS PARA GABRIEL (nesta ordem):
  1. node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     → Copiar o token gerado
  2. cp .env.bridge.example .env.bridge
     → Editar: BRIDGE_TOKEN=<token copiado>
  3. Na máquina local:
     cp .env.bridge.example .env.bridge
     → Editar: BRIDGE_TOKEN=<mesmo token>
     bash scripts/start-local-bridge.sh
  4. Copiar URL wss://... do terminal do ngrok
  5. No Codespaces, editar .env.bridge:
     BRIDGE_WS_URL=<url copiada>
  6. Testar:
     node scripts/codespaces-tunnel.js "echo bridge-ok"