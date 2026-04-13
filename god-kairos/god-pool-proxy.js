#!/usr/bin/env node
/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║   KAIROX GOD POOL PROXY — Sovereign Engine v2.0          ║
 * ║   God Pool: 6 Providers | 84+ Keys | Smart Routing      ║
 * ║   Hat: @devops | Triage Phase 7: Execute                  ║
 * ╚═══════════════════════════════════════════════════════════╝
 *
 * Intercepta chamadas do Claude Code CLI via ANTHROPIC_BASE_URL
 * e rotaciona entre: Groq, Gemini, Together, SambaNova, OpenRouter, Cerebras
 * com round-robin, fallback automático em 429/5xx, e routing por complexidade.
 *
 * Zero dependências externas — apenas Node.js built-ins.
 */

'use strict';

const http = require('http');
const https = require('https');
const path = require('path');
const fs = require('fs');

// ─── CONFIG ────────────────────────────────────────────────────────────────

const PORT = parseInt(process.env.GOD_POOL_PORT || '4000', 10);
const WORKSPACE = path.resolve(__dirname, '..');

// Carrega .env do workspace para overrides opcionais
function loadEnv() {
  try {
    const envPath = path.join(WORKSPACE, '.env');
    const raw = fs.readFileSync(envPath, 'utf8');
    const env = {};
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx < 0) continue;
      const key = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).trim();
      env[key] = val;
    }
    return env;
  } catch {
    return {};
  }
}

const ENV = loadEnv();

// ─── KEY POOLS ─────────────────────────────────────────────────────────────
// God Pool v2.5 — 6 Providers | Unified Loading from .env & YAML

const parseKeyList = (envVar) => (envVar || '').split(',').map(k => k.trim()).filter(Boolean);

// Simples parser de YAML para extrair chaves (regex based para manter zero-dependencies)
function loadYamlKeys(providerName) {
  try {
    const yamlPath = path.join(WORKSPACE, 'god-kairos', 'api-keys.yaml');
    if (!fs.existsSync(yamlPath)) return [];
    const content = fs.readFileSync(yamlPath, 'utf8');
    
    // Procura o bloco do provider e extrai o campo "key:"
    const providerRegex = new RegExp(`${providerName}:[\\s\\S]+?keys:([\\s\\S]+?)(?:\\n\\w|$)`);
    const match = content.match(providerRegex);
    if (!match) return [];
    
    const keysBlock = match[1];
    const keyMatches = keysBlock.match(/key:\s*["']?([^"'\n\r\s]+)["']?/g) || [];
    return keyMatches.map(m => m.replace(/key:\s*["']?/, '').replace(/["']?$/, ''));
  } catch (e) {
    log(`[YAML] Erro ao carregar chaves para ${providerName}: ${e.message}`);
    return [];
  }
}

// 1. GROQ — 30 RPM total
const GROQ_KEYS = [
  ENV.GROQ_API_KEY,
  ...parseKeyList(ENV.GROQ_API_KEYS),
  ...loadYamlKeys('groq'),
  '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', // fallback
].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);

// 2. GEMINI — 90 RPM total
const GEMINI_KEYS = [
  ...loadYamlKeys('gemini'),
  ...parseKeyList(ENV.GOOGLE_API_KEYS),
  ENV.GEMINI_API_KEY,
].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);

// 3. TOGETHER / SAMBANOVA / OPENROUTER
const TOGETHER_KEYS = [...parseKeyList(ENV.TOGETHER_API_KEYS), ENV.TOGETHER_API_KEY].filter(Boolean);
const SAMBANOVA_KEYS = [...parseKeyList(ENV.SAMBANOVA_API_KEYS), ENV.SAMBANOVA_API_KEY].filter(Boolean);
const OPENROUTER_KEYS = [...parseKeyList(ENV.OPENROUTER_API_KEYS), ENV.OPENROUTER_API_KEY].filter(Boolean);
const CEREBRAS_KEYS = [...parseKeyList(ENV.CEREBRAS_API_KEYS), ENV.CEREBRAS_API_KEY].filter(Boolean);

// ─── ROUND-ROBIN STATE ─────────────────────────────────────────────────────

const counters = { gemini: 0, groqFast: 0, groqHeavy: 0, github: 0, together: 0, sambanova: 0, cerebras: 0, openrouter: 0 };

function nextKey(pool, counterKey) {
  if (!pool.length) return null;
  const key = pool[counters[counterKey] % pool.length];
  counters[counterKey]++;
  return key;
}

// ─── PROVIDER DEFINITIONS v2.5 ─────────────────────────────────────────────

const PROVIDERS = {
  // Tier 1: Light (Groq/SambaNova)
  groqFast: {
    label: 'Groq (Llama 8B)',
    baseUrl: 'https://api.groq.com/openai/v1',
    model: 'llama-3.1-8b-instant',
    tier: 1,
    getKey: () => nextKey(GROQ_KEYS, 'groqFast'),
  },
  sambanova: {
    label: 'SambaNova (Llama 70B)',
    baseUrl: 'https://api.sambanova.ai/v1',
    model: 'Meta-Llama-3.1-70B-Instruct',
    tier: 1,
    getKey: () => nextKey(SAMBANOVA_KEYS, 'sambanova'),
  },

  // Tier 2: Medium (Gemini Pro/Flash)
  gemini: {
    label: 'Gemini (Pro 2.5)',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    model: 'gemini-1.5-pro', // Fallback se o 2.5 falhar na tradução
    tier: 2,
    getKey: () => nextKey(GEMINI_KEYS, 'gemini'),
  },

  // Tier 3: Heavy (Llama 70B/405B)
  groqHeavy: {
    label: 'Groq (Llama 70B)',
    baseUrl: 'https://api.groq.com/openai/v1',
    model: 'llama-3.3-70b-versatile',
    tier: 3,
    getKey: () => nextKey(GROQ_KEYS, 'groqHeavy'),
  },
  together: {
    label: 'Together (Llama 70B)',
    baseUrl: 'https://api.together.xyz/v1',
    model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    tier: 3,
    getKey: () => nextKey(TOGETHER_KEYS, 'together'),
  },

  // Tier 4: Premium (Sonnet/Opus via OpenRouter)
  openrouter: {
    label: 'OpenRouter (Sonnet 3.5)',
    baseUrl: 'https://openrouter.ai/api/v1',
    model: 'anthropic/claude-3.5-sonnet',
    tier: 4,
    getKey: () => nextKey(OPENROUTER_KEYS, 'openrouter'),
  },
};

// ─── MODEL ROUTER v2.5 ─────────────────────────────────────────────────────

function routeProvider(anthropicModel) {
  const m = (anthropicModel || '').toLowerCase();

  // Tier 5: Strategic (Thinking Models / Opus)
  if (m.includes('opus') || m.includes('thinking') || m.includes('3-7')) {
    return OPENROUTER_KEYS.length > 0 ? 'openrouter' : 'groqHeavy';
  }

  // Tier 3-4: Advanced Coding (Sonnet 3.5)
  if (m.includes('sonnet') || m.includes('3-5')) {
    return GEMINI_KEYS.length > 0 ? 'gemini' : 'groqHeavy';
  }

  // Tier 1-2: Fast (Haiku)
  if (m.includes('haiku')) {
    return GROQ_KEYS.length > 0 ? 'groqFast' : 'sambanova';
  }

  // Fallback seguro
  return GEMINI_KEYS.length > 0 ? 'gemini' : 'groqHeavy';
}

// ─── FALLBACK CHAINS ───────────────────────────────────────────────────────

const FALLBACK_ORDER = {
  groqFast:   ['groqFast', 'sambanova', 'gemini', 'groqHeavy', 'together', 'openrouter'],
  sambanova:  ['sambanova', 'groqFast', 'gemini', 'groqHeavy', 'together', 'openrouter'],
  gemini:     ['gemini', 'groqHeavy', 'together', 'openrouter', 'sambanova', 'groqFast'],
  groqHeavy:  ['groqHeavy', 'together', 'gemini', 'openrouter', 'sambanova', 'groqFast'],
  together:   ['together', 'groqHeavy', 'gemini', 'openrouter', 'sambanova', 'groqFast'],
  openrouter: ['openrouter', 'together', 'groqHeavy', 'gemini', 'sambanova', 'groqFast'],
};

// ─── FORMAT TRANSLATION ────────────────────────────────────────────────────

function anthropicToOpenAI(body, targetModel) {
  const messages = [];

  // Sistema → system message
  if (body.system) {
    const systemContent = typeof body.system === 'string'
      ? body.system
      : (Array.isArray(body.system)
          ? body.system.map(b => b.text || '').join('\n')
          : String(body.system));
    messages.push({ role: 'system', content: systemContent });
  }

  // Mensagens do usuário/assistant
  for (const msg of (body.messages || [])) {
    let content = msg.content;
    if (Array.isArray(content)) {
      // Suporte a content blocks (texto, tool results, etc.)
      content = content
        .filter(b => b.type === 'text' || b.type === 'tool_result')
        .map(b => {
          if (b.type === 'text') return b.text;
          if (b.type === 'tool_result') return String(b.content || '');
          return '';
        })
        .join('\n');
    }
    messages.push({ role: msg.role, content: content || '' });
  }

  return {
    model: targetModel,
    messages,
    max_tokens: body.max_tokens || 4096,
    ...(body.temperature !== undefined && { temperature: body.temperature }),
    stream: body.stream || false,
  };
}

function openAIToAnthropic(openAIResp, originalModel) {
  const choice = openAIResp.choices?.[0];
  const content = choice?.message?.content || '';
  const finishReason = choice?.finish_reason;

  return {
    id: 'msg_godpool_' + Date.now(),
    type: 'message',
    role: 'assistant',
    content: [{ type: 'text', text: content }],
    model: originalModel || 'claude-3-5-sonnet-20241022',
    stop_reason: finishReason === 'length' ? 'max_tokens' : 'end_turn',
    stop_sequence: null,
    usage: {
      input_tokens: openAIResp.usage?.prompt_tokens || 0,
      output_tokens: openAIResp.usage?.completion_tokens || 0,
    },
  };
}

// ─── HTTP HELPERS ──────────────────────────────────────────────────────────

function httpsPost(url, apiKey, bodyStr, streaming) {
  return new Promise((resolve, reject) => {
    let parsedUrl;
    try { parsedUrl = new URL(url); } catch (e) { return reject(e); }

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.pathname + (parsedUrl.search || ''),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(bodyStr),
        'User-Agent': 'kairox-god-pool/1.0',
      },
    };

    const req = https.request(options, (res) => {
      if (streaming) {
        resolve({ stream: res, status: res.statusCode });
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });

    req.setTimeout(30000, () => {
      req.destroy(new Error('Request timeout after 30s'));
    });

    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

// ─── STREAMING SSE BRIDGE ─────────────────────────────────────────────────
// Traduz OpenAI SSE → Anthropic SSE

function pipeStream(providerStream, res, originalModel, providerLabel) {
  const msgId = 'msg_godpool_' + Date.now();

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-God-Pool-Provider': providerLabel,
  });

  const sendEvent = (type, data) => {
    try {
      res.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`);
    } catch {}
  };

  // Abre a conversa no formato Anthropic
  sendEvent('message_start', {
    type: 'message_start',
    message: {
      id: msgId, type: 'message', role: 'assistant',
      content: [], model: originalModel, stop_reason: null,
      usage: { input_tokens: 0, output_tokens: 0 },
    },
  });
  sendEvent('content_block_start', {
    type: 'content_block_start', index: 0,
    content_block: { type: 'text', text: '' },
  });

  let buffer = '';
  let outputTokens = 0;
  let finished = false;

  providerStream.on('data', (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop(); // guarda linha incompleta

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (trimmed === 'data: [DONE]') {
        if (!finished) {
          finished = true;
          sendEvent('content_block_stop', { type: 'content_block_stop', index: 0 });
          sendEvent('message_delta', {
            type: 'message_delta',
            delta: { stop_reason: 'end_turn', stop_sequence: null },
            usage: { output_tokens: outputTokens },
          });
          sendEvent('message_stop', { type: 'message_stop' });
        }
        continue;
      }
      if (!trimmed.startsWith('data: ')) continue;

      try {
        const parsed = JSON.parse(trimmed.slice(6));
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) {
          outputTokens++;
          sendEvent('content_block_delta', {
            type: 'content_block_delta', index: 0,
            delta: { type: 'text_delta', text: delta },
          });
        }
        const finishReason = parsed.choices?.[0]?.finish_reason;
        if (finishReason && !finished) {
          finished = true;
          sendEvent('content_block_stop', { type: 'content_block_stop', index: 0 });
          sendEvent('message_delta', {
            type: 'message_delta',
            delta: { stop_reason: finishReason === 'length' ? 'max_tokens' : 'end_turn', stop_sequence: null },
            usage: { output_tokens: outputTokens },
          });
          sendEvent('message_stop', { type: 'message_stop' });
        }
      } catch {
        // chunk malformado — ignora
      }
    }
  });

  providerStream.on('end', () => {
    if (!finished) {
      sendEvent('content_block_stop', { type: 'content_block_stop', index: 0 });
      sendEvent('message_delta', {
        type: 'message_delta',
        delta: { stop_reason: 'end_turn', stop_sequence: null },
        usage: { output_tokens: outputTokens },
      });
      sendEvent('message_stop', { type: 'message_stop' });
    }
    try { res.end(); } catch {}
  });

  providerStream.on('error', (err) => {
    log(`Stream error: ${err.message}`);
    try { res.end(); } catch {}
  });
}

// ─── CORE HANDLER ─────────────────────────────────────────────────────────

async function handleMessages(body, res) {
  const primaryProvider = routeProvider(body.model);
  const order = FALLBACK_ORDER[primaryProvider] || Object.keys(PROVIDERS);

  const isStream = !!body.stream;
  let lastError = 'unknown';

  for (const pKey of order) {
    const provider = PROVIDERS[pKey];
    const apiKey = provider.getKey();
    if (!apiKey) {
      log(`[${provider.label}] sem keys disponíveis — skip`);
      continue;
    }

    const oaiBody = anthropicToOpenAI(body, provider.model);
    const bodyStr = JSON.stringify(oaiBody);
    const url = `${provider.baseUrl}/chat/completions`;

    log(`→ [${provider.label}] ${provider.model} | key: ...${apiKey.slice(-6)}`);

    try {
      const result = await httpsPost(url, apiKey, bodyStr, isStream);

      if (isStream) {
        if (result.status >= 400) {
          log(`[${provider.label}] HTTP ${result.status} stream — fallback`);
          lastError = `HTTP ${result.status}`;
          continue;
        }
        pipeStream(result.stream, res, body.model, provider.label);
        return;
      } else {
        if (result.status >= 400) {
          log(`[${provider.label}] HTTP ${result.status}: ${(result.body || '').slice(0, 200)}`);
          lastError = `HTTP ${result.status}`;
          continue;
        }
        const oaiResp = JSON.parse(result.body);
        const anthropicResp = openAIToAnthropic(oaiResp, body.model);
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'X-God-Pool-Provider': provider.label,
        });
        res.end(JSON.stringify(anthropicResp));
        log(`✓ [${provider.label}] resposta OK`);
        return;
      }
    } catch (err) {
      log(`[${provider.label}] Erro: ${err.message} — fallback`);
      lastError = err.message;
    }
  }

  // Todos os providers falharam
  log(`✗ Todos os providers falharam. Último erro: ${lastError}`);
  res.writeHead(529, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    type: 'error',
    error: {
      type: 'overloaded_error',
      message: `[God Pool] Todos os providers esgotados. Último: ${lastError}`,
    },
  }));
}

// ─── HTTP SERVER ──────────────────────────────────────────────────────────

function log(msg) {
  const ts = new Date().toISOString().slice(11, 19);
  console.log(`[${ts}] ${msg}`);
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Preflight CORS
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok', service: 'kairox-god-pool-proxy', port: PORT,
      providers: Object.fromEntries(
        Object.entries(PROVIDERS).map(([k, p]) => [k, { model: p.model, label: p.label }])
      ),
      keys: { gemini: GEMINI_KEYS.length, groq: GROQ_KEYS.length, github: GITHUB_KEYS.length },
      counters,
    }));
    return;
  }

  // Models list (Claude Code health check)
  if (req.url === '/v1/models') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      data: [
        { id: 'claude-3-5-sonnet-20241022', object: 'model' },
        { id: 'claude-3-opus-20240229', object: 'model' },
        { id: 'claude-3-haiku-20240307', object: 'model' },
      ],
    }));
    return;
  }

  // Endpoint principal
  if (req.url === '/v1/messages' && req.method === 'POST') {
    let rawBody = '';
    req.on('data', chunk => rawBody += chunk);
    req.on('end', async () => {
      try {
        const body = JSON.parse(rawBody);
        log(`← model: ${body.model} | stream: ${!!body.stream} | max_tokens: ${body.max_tokens}`);
        await handleMessages(body, res);
      } catch (err) {
        log(`Parse error: ${err.message}`);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ type: 'error', error: { type: 'invalid_request_error', message: err.message } }));
      }
    });
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'not found', url: req.url, method: req.method }));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  🔱 KAIROX GOD POOL PROXY — ONLINE              ║');
  console.log(`║  Porta: ${PORT}  |  Providers: ${Object.keys(PROVIDERS).length}                       ║`);
  console.log(`║  Gemini: ${GEMINI_KEYS.length} keys | Groq: ${GROQ_KEYS.length} keys | GH: ${GITHUB_KEYS.length} key  ║`);
  console.log('║  Routing: haiku→Groq | default→Gemini | opus→Heavy ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
  log('Aguardando chamadas do Claude Code...');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`⚠  Porta ${PORT} já em uso — proxy provavelmente já está rodando.`);
    console.error(`   Para encerrar: netstat -ano | findstr :${PORT}  →  taskkill /PID <pid> /F`);
    process.exit(0); // sai sem erro para o BAT não travar
  } else {
    console.error('Erro servidor:', err.message);
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => log(`Uncaught: ${err.message}`));
process.on('unhandledRejection', (reason) => log(`Unhandled: ${reason?.message || reason}`));
