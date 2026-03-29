'use strict';

/**
 * @module codespaces-tunnel
 * @purpose Cliente WebSocket que conecta ao local-bridge via ngrok
 * @runtime Codespaces (cloud) ou qualquer máquina remota
 * @inputs { command, cwd? }
 * @outputs Promise<{ stdout, stderr, exitCode, duration }>
 * @requires .env.bridge com BRIDGE_WS_URL e BRIDGE_TOKEN
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.bridge') });

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
        let settled = false;

        function settle(fn, val) {
            if (settled) return;
            settled = true;
            fn(val);
        }

        // EC-06: bridge offline ou URL inválida
        const ws = new WebSocket(BRIDGE_URL);

        const connectTimeout = setTimeout(() => {
            ws.terminate();
            settle(reject, new Error(
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
                settle(reject, new Error(`Falha de autenticação: ${msg.reason}`));
                return;
            }

            if (msg.commandId !== commandId) return;

            if (msg.type === 'stdout') stdout += msg.data;
            if (msg.type === 'stderr') stderr += msg.data;

            if (msg.type === 'exit') {
                ws.close();
                settle(resolve, {
                    stdout,
                    stderr,
                    exitCode: msg.code,
                    duration: Date.now() - startTime
                });
            }

            if (msg.type === 'error') {
                ws.close();
                settle(reject, new Error(`Erro no comando: ${msg.reason} — ${msg.message}`));
            }
        });

        ws.on('error', (err) => {
            clearTimeout(connectTimeout);
            // EC-07: ngrok URL expirada
            settle(reject, new Error(
                `❌ Erro de conexão: ${err.message}\n` +
                '   Se a URL do ngrok mudou, atualize BRIDGE_WS_URL em .env.bridge'
            ));
        });

        ws.on('close', (code) => {
            clearTimeout(connectTimeout);
            if (code === 4001) {
                settle(reject, new Error('❌ Token inválido. Verifique BRIDGE_TOKEN em .env.bridge'));
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
