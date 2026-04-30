#!/usr/bin/env node
/**
 * validate-god-pool.js
 * Testa o parser YAML e conta keys carregadas SEM iniciar o servidor HTTP.
 * Uso: node validate-god-pool.js
 */
'use strict';

const path = require('path');
const fs   = require('fs');

const YAML_PATH = path.join(__dirname, 'god-kairos', 'api-keys.yaml');

function loadYamlKeys(providerName) {
  if (!fs.existsSync(YAML_PATH)) {
    console.error('YAML nao encontrado em:', YAML_PATH);
    return [];
  }
  const lines = fs.readFileSync(YAML_PATH, 'utf8').split('\n');
  const keys = [];
  let inProvider = false;
  let inKeys = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const indent = line.search(/\S/);

    if (indent === 0) {
      inProvider = trimmed === `${providerName}:`;
      inKeys = false;
      continue;
    }
    if (!inProvider) continue;

    if (indent <= 2 && trimmed.startsWith('keys')) { inKeys = true; continue; }
    if (indent <= 2 && !trimmed.startsWith('-') && !trimmed.startsWith('key')) { inKeys = false; continue; }

    if (inKeys) {
      const m = line.match(/^\s+key:\s*["']?([^"'\s]+)["']?\s*$/);
      if (m && m[1]) keys.push(m[1]);
    }
  }
  return keys;
}

const PROVIDERS = ['gemini', 'groq', 'huggingface', 'together', 'sambanova', 'openrouter', 'cerebras', 'github'];
let total = 0;

console.log('\n╔══════════════════════════════════════════════════╗');
console.log('║   GOD POOL — VALIDAÇÃO DE KEYS (YAML PARSER)    ║');
console.log('╠══════════════════════════════════════════════════╣');

let allOk = true;
PROVIDERS.forEach(p => {
  const keys = loadYamlKeys(p);
  const status = keys.length > 0 ? '✅' : '❌';
  if (keys.length === 0) allOk = false;
  const preview = keys.length > 0 ? `[${keys[0].slice(0, 16)}...]` : '*** ZERO — CHECAR YAML ***';
  console.log(`║  ${status} ${p.padEnd(12)}: ${String(keys.length).padStart(3)} keys  ${preview}`);
  total += keys.length;
});

console.log('╠══════════════════════════════════════════════════╣');
console.log(`║  TOTAL: ${total} keys carregadas de ${PROVIDERS.length} providers`);
console.log('╚══════════════════════════════════════════════════╝\n');

if (!allOk) {
  console.warn('⚠  Alguns providers retornaram 0 keys. Verifique o YAML acima.');
  process.exit(1);
} else {
  console.log('✅  Todos os providers com keys. God Pool pronto.\n');
}
