#!/usr/bin/env node
/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  GOD POOL — KEY HEALTH CHECK                                ║
 * ║  Testa todas as keys do YAML e reporta status               ║
 * ║  Uso: node key-health-check.js [--concurrency N] [--fix]    ║
 * ║       --fix  remove keys mortas do YAML automaticamente     ║
 * ╚══════════════════════════════════════════════════════════════╝
 */
'use strict';

const https   = require('https');
const fs      = require('fs');
const path    = require('path');

// ─── CONFIG ────────────────────────────────────────────────────────────────
const YAML_PATH    = path.join(__dirname, 'god-kairos', 'api-keys.yaml');
const CONCURRENCY  = parseInt(process.argv.find(a => a.startsWith('--concurrency='))?.split('=')[1] || '5', 10);
const AUTO_FIX     = process.argv.includes('--fix');
const TIMEOUT_MS   = 8000;

// ─── PROVIDER TEST CONFIG ──────────────────────────────────────────────────
// Usa o modelo mais barato / menor de cada provider para minimizar uso
const PROVIDER_CONFIG = {
  gemini: {
    url:   'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    model: 'gemini-1.5-flash',
    authHeader: key => `Bearer ${key}`,
  },
  groq: {
    url:   'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.1-8b-instant',
    authHeader: key => `Bearer ${key}`,
  },
  together: {
    url:   'https://api.together.xyz/v1/chat/completions',
    model: 'meta-llama/Llama-3.2-3B-Instruct-Turbo',
    authHeader: key => `Bearer ${key}`,
  },
  sambanova: {
    url:   'https://api.sambanova.ai/v1/chat/completions',
    model: 'Meta-Llama-3.2-1B-Instruct',
    authHeader: key => `Bearer ${key}`,
  },
  openrouter: {
    url:   'https://openrouter.ai/api/v1/chat/completions',
    model: 'meta-llama/llama-3.2-3b-instruct:free',
    authHeader: key => `Bearer ${key}`,
  },
  cerebras: {
    url:   'https://api.cerebras.ai/v1/chat/completions',
    model: 'llama3.1-8b',
    authHeader: key => `Bearer ${key}`,
  },
  github: {
    url:   'https://models.inference.ai.azure.com/chat/completions',
    model: 'gpt-4o-mini',
    authHeader: key => `Bearer ${key}`,
  },
  huggingface: {
    url:   'https://api-inference.huggingface.co/models/Qwen/Qwen2.5-3B-Instruct/v1/chat/completions',
    model: 'Qwen/Qwen2.5-3B-Instruct',
    authHeader: key => `Bearer ${key}`,
  },
};

const TEST_BODY = {
  messages: [{ role: 'user', content: '1+1=' }],
  max_tokens: 3,
  temperature: 0,
};

// ─── YAML KEY LOADER ───────────────────────────────────────────────────────
function loadAllKeys() {
  if (!fs.existsSync(YAML_PATH)) {
    console.error('YAML não encontrado:', YAML_PATH);
    process.exit(1);
  }
  const lines  = fs.readFileSync(YAML_PATH, 'utf8').split('\n');
  const result = {}; // { providerName: [{id, key}] }
  let currentProvider = null;
  let inKeys = false;
  let currentId = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const indent = line.search(/\S/);

    if (indent === 0) {
      currentProvider = trimmed.endsWith(':') ? trimmed.slice(0, -1) : null;
      inKeys = false;
      continue;
    }
    if (!currentProvider) continue;
    if (indent <= 2 && trimmed.startsWith('keys')) { inKeys = true; continue; }
    if (indent <= 2 && !trimmed.startsWith('-') && !trimmed.startsWith('key') && !trimmed.startsWith('id')) {
      inKeys = false; continue;
    }
    if (!inKeys) continue;

    const idMatch  = line.match(/^\s+id:\s*["']?([^"'\s]+)["']?\s*$/);
    const keyMatch = line.match(/^\s+key:\s*["']?([^"'\s]+)["']?\s*$/);
    if (idMatch)  currentId = idMatch[1];
    if (keyMatch && keyMatch[1]) {
      if (!result[currentProvider]) result[currentProvider] = [];
      result[currentProvider].push({ id: currentId || '?', key: keyMatch[1] });
      currentId = null;
    }
  }
  return result;
}

// ─── HTTP TEST ─────────────────────────────────────────────────────────────
function testKey(providerName, keyObj) {
  return new Promise((resolve) => {
    const cfg = PROVIDER_CONFIG[providerName];
    if (!cfg) {
      resolve({ ...keyObj, provider: providerName, status: 'SKIP', reason: 'provider sem config de teste' });
      return;
    }

    const body = JSON.stringify({ model: cfg.model, ...TEST_BODY });
    let parsed;
    try { parsed = new URL(cfg.url); } catch {
      resolve({ ...keyObj, provider: providerName, status: 'ERROR', reason: 'URL inválida' });
      return;
    }

    const options = {
      hostname: parsed.hostname,
      port: parsed.port || 443,
      path: parsed.pathname + (parsed.search || ''),
      method: 'POST',
      headers: {
        'Content-Type':   'application/json',
        'Authorization':  cfg.authHeader(keyObj.key),
        'Content-Length': Buffer.byteLength(body),
        'User-Agent':     'kairox-key-check/1.0',
      },
      timeout: TIMEOUT_MS,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const s = res.statusCode;
        if (s >= 200 && s < 300) {
          resolve({ ...keyObj, provider: providerName, status: 'ALIVE', reason: `HTTP ${s}` });
        } else if (s === 401 || s === 403) {
          resolve({ ...keyObj, provider: providerName, status: 'DEAD', reason: `HTTP ${s} — key inválida` });
        } else if (s === 429) {
          const isQuota = /quota|exhausted|exceeded|billing|monthly|daily/i.test(data);
          resolve({ ...keyObj, provider: providerName, status: isQuota ? 'DEAD' : 'LIMITED',
            reason: isQuota ? 'quota mensal esgotada' : 'rate limit temporário' });
        } else if (s >= 500) {
          resolve({ ...keyObj, provider: providerName, status: 'UNKNOWN', reason: `HTTP ${s} — provider down` });
        } else {
          resolve({ ...keyObj, provider: providerName, status: 'UNKNOWN', reason: `HTTP ${s}` });
        }
      });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ ...keyObj, provider: providerName, status: 'TIMEOUT', reason: `>${TIMEOUT_MS}ms` });
    });
    req.on('error', (e) => {
      resolve({ ...keyObj, provider: providerName, status: 'ERROR', reason: e.message });
    });
    req.write(body);
    req.end();
  });
}

// ─── CONCURRENCY POOL ─────────────────────────────────────────────────────
async function runWithConcurrency(tasks, limit) {
  const results = [];
  const queue = [...tasks];
  const running = [];

  while (queue.length || running.length) {
    while (running.length < limit && queue.length) {
      const task = queue.shift();
      const p = task().then(r => {
        running.splice(running.indexOf(p), 1);
        results.push(r);
        const icon = { ALIVE: '✅', DEAD: '💀', LIMITED: '⚠️ ', SKIP: '⏭️ ', TIMEOUT: '⏱️ ', ERROR: '❌', UNKNOWN: '❓' }[r.status] || '?';
        process.stdout.write(`  ${icon} ${r.provider.padEnd(12)} ${r.id.padEnd(14)} ${r.status.padEnd(8)} ${r.reason}\n`);
      });
      running.push(p);
    }
    await Promise.race(running);
  }
  return results;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────
(async () => {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║  GOD POOL — KEY HEALTH CHECK                         ║');
  console.log(`║  YAML: ${YAML_PATH.slice(-40).padStart(40)}  ║`);
  console.log(`║  Concorrência: ${String(CONCURRENCY).padEnd(3)} | Timeout: ${TIMEOUT_MS}ms             ║`);
  console.log(`║  Auto-fix: ${AUTO_FIX ? 'SIM (--fix)' : 'NÃO       '}                          ║`);
  console.log('╚══════════════════════════════════════════════════════╝\n');

  const allKeys = loadAllKeys();
  const total   = Object.values(allKeys).reduce((s, arr) => s + arr.length, 0);
  console.log(`Testando ${total} keys de ${Object.keys(allKeys).length} providers...\n`);

  const tasks = [];
  for (const [provider, keys] of Object.entries(allKeys)) {
    for (const keyObj of keys) {
      tasks.push(() => testKey(provider, keyObj));
    }
  }

  const results = await runWithConcurrency(tasks, CONCURRENCY);

  // ─── SUMMARY ────────────────────────────────────────────────────────────
  const byStatus = {};
  for (const r of results) {
    byStatus[r.status] = (byStatus[r.status] || []);
    byStatus[r.status].push(r);
  }

  const alive   = (byStatus.ALIVE   || []).length;
  const dead    = (byStatus.DEAD    || []).length;
  const limited = (byStatus.LIMITED || []).length;
  const other   = results.length - alive - dead - limited;

  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`  RESULTADO FINAL`);
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  ✅ VIVAS:         ${String(alive).padStart(3)} / ${total}`);
  console.log(`  💀 MORTAS:        ${String(dead).padStart(3)} / ${total}`);
  console.log(`  ⚠️  RATE LIMITED:  ${String(limited).padStart(3)} / ${total}`);
  console.log(`  ❓ OUTRO:         ${String(other).padStart(3)} / ${total}`);
  console.log('═══════════════════════════════════════════════════════\n');

  if (dead > 0) {
    console.log('💀 KEYS MORTAS:');
    (byStatus.DEAD || []).forEach(r =>
      console.log(`   ${r.provider.padEnd(12)} ${r.id.padEnd(16)} ${r.key.slice(0, 20)}... — ${r.reason}`)
    );
    console.log('');
  }

  if (AUTO_FIX && dead > 0) {
    console.log('🔧 Removendo keys mortas do YAML...');
    let yaml = fs.readFileSync(YAML_PATH, 'utf8');
    const deadKeySet = new Set((byStatus.DEAD || []).map(r => r.key));

    // Remove blocos de 2 linhas (- id: ... / key: ...) para keys mortas
    const lines = yaml.split('\n');
    const filtered = [];
    let i = 0;
    while (i < lines.length) {
      const idLine  = lines[i];
      const keyLine = lines[i + 1] || '';
      const keyMatch = keyLine.match(/^\s+key:\s*["']?([^"'\s]+)["']?\s*$/);
      if (keyMatch && deadKeySet.has(keyMatch[1])) {
        // Pula ambas as linhas (id + key)
        i += 2;
        continue;
      }
      filtered.push(idLine);
      i++;
    }

    const newYaml = filtered.join('\n');
    const backupPath = YAML_PATH.replace('.yaml', `.backup-${Date.now()}.yaml`);
    fs.copyFileSync(YAML_PATH, backupPath);
    fs.writeFileSync(YAML_PATH, newYaml, 'utf8');
    console.log(`✅ ${dead} keys removidas. Backup salvo em: ${path.basename(backupPath)}\n`);
  } else if (dead > 0 && !AUTO_FIX) {
    console.log('💡 Para remover automaticamente: node key-health-check.js --fix\n');
  }

  process.exit(dead > 0 ? 1 : 0);
})();
