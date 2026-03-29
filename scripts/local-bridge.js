'use strict';

/**
 * @module local-bridge
 * @purpose Servidor WebSocket local que executa comandos do terminal
 * @runtime MÁQUINA LOCAL do Gabriel (não Codespaces)
 * @start node scripts/local-bridge.js
 * @inputs WS message: { token, commandId, command, cwd }
 * @outputs WS stream: { commandId, type, data }
 *   types: 'stdout' | 'stderr' | 'exit' | 'error' | 'auth_ok' | 'started'
 * @port process.env.BRIDGE_LOCAL_PORT || 8765
 * @requires BRIDGE_TOKEN no ambiente ou .env.bridge
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.bridge') });

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
    /:\(\)\s*\{.*\}/,            // fork bomb
    /del\s+\/[sf]/i,             // Windows equivalente
    /format\s+[a-z]:/i,
];

function isCommandBlocked(command) {
    return BLOCKED_PATTERNS.some(pattern => pattern.test(command));
}

function logCommand(entry) {
    // EC-01: diretório data/ pode não existir localmente
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

    // EC-02: conexão sem autenticação nos primeiros 5s
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

        // EC-03: comando bloqueado
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

        // EC-04: cwd inválido ou não existe
        const safeCwd = cwd || process.env.HOME || process.env.USERPROFILE || process.cwd();
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

        // Detect shell based on OS
        const isWindows = process.platform === 'win32';
        const proc = spawn(command, [], {
            shell: isWindows ? 'powershell.exe' : true,
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
            // EC-05: comando não encontrado no PATH
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
    console.log(`   OS:    ${process.platform}`);
    console.log('');
    console.log('📡 Agora exponha com ngrok:');
    console.log(`   ngrok http ${PORT}`);
    console.log('');
    console.log('📋 Copie a URL do ngrok e cole em .env.bridge no Codespaces:');
    console.log('   BRIDGE_WS_URL=wss://xxxx.ngrok.io');
    console.log('');
    console.log('⏳ Aguardando conexão do Codespaces...');
});
