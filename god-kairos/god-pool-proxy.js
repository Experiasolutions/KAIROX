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

// Parser YAML linha-a-linha (state-machine por indentação — robusto e zero-deps)
function loadYamlKeys(providerName) {
  try {
    const yamlPath = path.join(WORKSPACE, 'god-kairos', 'api-keys.yaml');
    if (!fs.existsSync(yamlPath)) return [];
    const lines = fs.readFileSync(yamlPath, 'utf8').split('\n');

    const keys = [];
    let inProvider = false;
    let inKeys = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const indent = line.search(/\S/);

      // Seção top-level (indent 0) — identifica qual provider estamos dentro
      if (indent === 0) {
        inProvider = trimmed === `${providerName}:`;
        inKeys = false;
        continue;
      }

      if (!inProvider) continue;

      // Subseção do provider (indent 2) — identifica o bloco "keys:"
      if (indent <= 2 && trimmed.startsWith('keys')) {
        inKeys = true;
        continue;
      }

      // Qualquer outra subseção no nível 2 encerra o bloco de keys
      if (indent <= 2 && !trimmed.startsWith('-') && !trimmed.startsWith('key')) {
        inKeys = false;
        continue;
      }

      // Dentro do bloco de keys — extrai o valor de "key:"
      if (inKeys) {
        const m = line.match(/^\s+key:\s*["']?([^"'\s]+)["']?\s*$/);
        if (m && m[1]) keys.push(m[1]);
      }
    }

    return keys;
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
const TOGETHER_KEYS = [...parseKeyList(ENV.TOGETHER_API_KEYS), ENV.TOGETHER_API_KEY, ...loadYamlKeys('together')].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);
const SAMBANOVA_KEYS = [...parseKeyList(ENV.SAMBANOVA_API_KEYS), ENV.SAMBANOVA_API_KEY, ...loadYamlKeys('sambanova')].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);
const OPENROUTER_KEYS = [...parseKeyList(ENV.OPENROUTER_API_KEYS), ENV.OPENROUTER_API_KEY, ...loadYamlKeys('openrouter')].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);
const CEREBRAS_KEYS = [...parseKeyList(ENV.CEREBRAS_API_KEYS), ENV.CEREBRAS_API_KEY, ...loadYamlKeys('cerebras')].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);
const GITHUB_KEYS = [...parseKeyList(ENV.GITHUB_API_KEYS), ENV.GITHUB_TOKEN].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);

// ─── ROUND-ROBIN STATE ─────────────────────────────────────────────────────

const counters = {
  gemini:     0,
  groqFast:   0,
  groqHeavy:  0,
  sambanova:  0,
  cerebras:   0,
  together:   0,
  openrouter: 0,
  github:     0,
};

// ─── DEAD KEY TRACKING ─────────────────────────────────────────────────────
// Keys marcadas como mortas (401/403/quota) — nunca mais usadas nesta sessão
const deadKeys = new Set();
// Keys em cooldown de 429 temporário — Map<key, timestamp_expiry>
const rateLimited = new Map();

function markDead(apiKey, reason) {
  if (!deadKeys.has(apiKey)) {
    deadKeys.add(apiKey);
    log(`[DEAD KEY] ...${apiKey.slice(-8)} → ${reason} (total mortas: ${deadKeys.size})`);
  }
}

function markRateLimited(apiKey, cooldownMs = 60000) {
  rateLimited.set(apiKey, Date.now() + cooldownMs);
  log(`[RATE LIMIT] ...${apiKey.slice(-8)} → cooldown ${cooldownMs / 1000}s`);
}

function nextKey(pool, counterKey) {
  if (!pool.length) return null;
  const now = Date.now();

  // Limpa entradas expiradas do rate-limit
  for (const [k, exp] of rateLimited.entries()) {
    if (now > exp) rateLimited.delete(k);
  }

  // Filtra keys mortas e em cooldown
  const available = pool.filter(k => !deadKeys.has(k) && !rateLimited.has(k));

  if (available.length === 0) {
    // Todas mortas ou em limite — retorna null para forçar fallback de provider
    const anyAlive = pool.filter(k => !deadKeys.has(k));
    if (anyAlive.length === 0) return null;
    // Usa keys em cooldown como último recurso
    const key = anyAlive[counters[counterKey] % anyAlive.length];
    counters[counterKey]++;
    return key;
  }

  const key = available[counters[counterKey] % available.length];
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

  // Tier 2: Cerebras (alta velocidade, Llama 70B)
  cerebras: {
    label: 'Cerebras (Llama 70B)',
    baseUrl: 'https://api.cerebras.ai/v1',
    model: 'llama3.1-70b',
    tier: 2,
    getKey: () => nextKey(CEREBRAS_KEYS, 'cerebras'),
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
  groqFast:   ['groqFast',   'cerebras',  'sambanova', 'gemini',    'groqHeavy', 'together',  'openrouter'],
  sambanova:  ['sambanova',  'groqFast',  'cerebras',  'gemini',    'groqHeavy', 'together',  'openrouter'],
  cerebras:   ['cerebras',  'groqFast',  'sambanova', 'gemini',    'groqHeavy', 'together',  'openrouter'],
  gemini:     ['gemini',    'cerebras',  'groqHeavy', 'together',  'openrouter','sambanova', 'groqFast'],
  groqHeavy:  ['groqHeavy', 'together',  'cerebras',  'gemini',    'openrouter','sambanova', 'groqFast'],
  together:   ['together',  'groqHeavy', 'cerebras',  'gemini',    'openrouter','sambanova', 'groqFast'],
  openrouter: ['openrouter','together',  'groqHeavy', 'cerebras',  'gemini',    'sambanova', 'groqFast'],
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
          // Detecta key morta no stream
          if (result.status === 401 || result.status === 403) {
            markDead(apiKey, `HTTP ${result.status}`);
          } else if (result.status === 429) {
            markRateLimited(apiKey);
          }
          log(`[${provider.label}] HTTP ${result.status} stream — fallback`);
          lastError = `HTTP ${result.status}`;
          continue;
        }
        pipeStream(result.stream, res, body.model, provider.label);
        return;
      } else {
        if (result.status >= 400) {
          const bodyText = result.body || '';
          // 401/403 → key inválida, morta permanentemente
          if (result.status === 401 || result.status === 403) {
            markDead(apiKey, `HTTP ${result.status}`);
          } else if (result.status === 429) {
            // Verifica se é quota esgotada (mensal) ou apenas rate limit temporário
            const isQuotaGone = /quota|exhausted|exceeded|billing|monthly|daily limit/i.test(bodyText);
            if (isQuotaGone) {
              markDead(apiKey, 'quota esgotada');
            } else {
              markRateLimited(apiKey, 60000);
            }
          }
          log(`[${provider.label}] HTTP ${result.status}: ${bodyText.slice(0, 200)}`);
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

  // Key status endpoint
  if (req.url === '/keys/status') {
    const now = Date.now();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      dead_keys: deadKeys.size,
      rate_limited_keys: rateLimited.size,
      dead_list: [...deadKeys].map(k => '...' + k.slice(-8)),
      rate_limited_list: [...rateLimited.entries()].map(([k, exp]) => ({
        key: '...' + k.slice(-8),
        expires_in_s: Math.max(0, Math.round((exp - now) / 1000)),
      })),
    }));
    return;
  }

  // Health check
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      service: 'kairox-god-pool-proxy',
      version: '2.0',
      port: PORT,
      providers: Object.fromEntries(
        Object.entries(PROVIDERS).map(([k, p]) => [k, { model: p.model, label: p.label, tier: p.tier }])
      ),
      keys: {
        gemini: GEMINI_KEYS.length,
        groq: GROQ_KEYS.length,
        together: TOGETHER_KEYS.length,
        sambanova: SAMBANOVA_KEYS.length,
        cerebras: CEREBRAS_KEYS.length,
        openrouter: OPENROUTER_KEYS.length,
        github: GITHUB_KEYS.length,
      },
      total_keys: GEMINI_KEYS.length + GROQ_KEYS.length + TOGETHER_KEYS.length + SAMBANOVA_KEYS.length + CEREBRAS_KEYS.length + OPENROUTER_KEYS.length + GITHUB_KEYS.length,
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
  const totalKeys = GEMINI_KEYS.length + GROQ_KEYS.length + TOGETHER_KEYS.length + SAMBANOVA_KEYS.length + CEREBRAS_KEYS.length + OPENROUTER_KEYS.length + GITHUB_KEYS.length;
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  🔱 KAIROX GOD POOL PROXY v2.0 — ONLINE        ║');
  console.log(`║  Porta: ${PORT}  |  Providers: ${Object.keys(PROVIDERS).length}  |  Keys: ${totalKeys} ║`);
  console.log('║  ─────────────────────────────────────────────── ║');
  console.log(`║  Gemini: ${GEMINI_KEYS.length} | Groq: ${GROQ_KEYS.length} | Together: ${TOGETHER_KEYS.length} | SambaNova: ${SAMBANOVA_KEYS.length} ║`);
  console.log(`║  Cerebras: ${CEREBRAS_KEYS.length} | OpenRouter: ${OPENROUTER_KEYS.length} | GitHub: ${GITHUB_KEYS.length} ║`);
  console.log('║  ─────────────────────────────────────────────── ║');
  console.log('║  Routing: haiku→Tier1 | sonnet→Tier2 | opus→Tier4 ║');
  console.log('║  Smart Fallback: 8 chains per provider           ║');
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
