#!/usr/bin/env node
/**
 * KAIROS Shared Brain — Supabase Event Bus v2.0
 * 
 * Publica e consome eventos cross-agente via Supabase.
 * Camada 3 do Shared Brain Protocol.
 * 
 * Schema real (kairos_events):
 *   id UUID, agent_id TEXT, machine TEXT, event_type TEXT, payload JSONB, created_at TIMESTAMPTZ
 * 
 * Tabelas adicionais:
 *   kairos_task_claims  — semáforo anti-conflito
 *   kairos_shared_context — SELF_CONTEXT/STATUS cloud
 *   kairos_decisions    — log imutável de decisões
 * 
 * Usage:
 *   node scripts/shared-brain-bus.js publish   — Publica evento
 *   node scripts/shared-brain-bus.js recent    — Lista eventos recentes
 *   node scripts/shared-brain-bus.js active    — Lista claims ativos
 *   node scripts/shared-brain-bus.js decide    — Registra decisão
 *   node scripts/shared-brain-bus.js status    — Status completo do sync
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ══════════════════════════════════════════
// ENV LOADER
// ══════════════════════════════════════════

function loadEnv() {
  const envPath = resolve(ROOT, '.env');
  if (!existsSync(envPath)) return {};
  const env = {};
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
      val = val.slice(1, -1);
    env[t.slice(0, eq).trim()] = val;
  }
  return env;
}

const env = loadEnv();
const SUPABASE_URL = env.SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required in .env');
  process.exit(1);
}

// ══════════════════════════════════════════
// SUPABASE REST CLIENT (zero deps)
// ══════════════════════════════════════════

function supabaseRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, SUPABASE_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': method === 'POST' ? 'return=representation' : 'count=exact',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try { resolve(JSON.parse(data || '[]')); }
          catch { resolve(data); }
        } else {
          reject(new Error(`Supabase ${res.statusCode}: ${data.substring(0, 300)}`));
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// ══════════════════════════════════════════
// COMMANDS — Aligned with real Supabase schema
// ══════════════════════════════════════════

async function publish(args) {
  const event = {
    agent_id: getArg(args, '--agent') || `session-${Date.now().toString(36)}`,
    machine: getArg(args, '--machine') || 'PC',
    event_type: getArg(args, '--event') || 'task_update',
    payload: {
      task: getArg(args, '--task') || '',
      summary: getArg(args, '--summary') || '',
      files: (getArg(args, '--files') || '').split(',').filter(Boolean),
    },
  };

  try {
    const result = await supabaseRequest('POST', '/rest/v1/kairos_events', event);
    console.log(`✅ Event published: ${event.event_type}`);
    console.log(`   Agent: ${event.agent_id} | Task: ${event.payload.task}`);
    return result;
  } catch (e) {
    console.error(`❌ Failed to publish: ${e.message}`);
  }
}

async function recent(args) {
  const limit = getArg(args, '--limit') || '20';
  try {
    const events = await supabaseRequest('GET',
      `/rest/v1/kairos_events?order=created_at.desc&limit=${limit}`);
    
    if (!events || events.length === 0) {
      console.log('📭 No events yet.');
      return;
    }

    console.log('📡 Recent Events:');
    console.log('─'.repeat(80));
    for (const e of events) {
      const time = new Date(e.created_at).toLocaleString('pt-BR');
      const task = e.payload?.task || e.payload?.summary || '';
      console.log(`  [${time}] ${e.agent_id} | ${e.event_type} | ${task}`);
    }
  } catch (e) {
    console.error(`❌ Failed to fetch: ${e.message}`);
  }
}

async function activeClaims() {
  try {
    const claims = await supabaseRequest('GET',
      '/rest/v1/kairos_task_claims?completed=eq.false&order=claimed_at.desc');
    
    if (!claims || claims.length === 0) {
      console.log('📭 No active task claims.');
      return;
    }

    console.log('🔒 Active Task Claims:');
    console.log('─'.repeat(80));
    for (const c of claims) {
      const time = new Date(c.claimed_at).toLocaleString('pt-BR');
      console.log(`  ${c.task_id} | ${c.claimed_by} | ${c.machine} | ${time} | ${c.task_name || ''}`);
    }
  } catch (e) {
    console.error(`❌ Failed to fetch: ${e.message}`);
  }
}

async function decide(args) {
  const decision = {
    agent_id: getArg(args, '--agent') || `session-${Date.now().toString(36)}`,
    machine: getArg(args, '--machine') || 'PC',
    decision: getArg(args, '--decision') || '',
    context: getArg(args, '--context') || '',
    impact: getArg(args, '--impact') || 'medium',
  };

  if (!decision.decision) {
    console.error('❌ --decision required');
    return;
  }

  try {
    await supabaseRequest('POST', '/rest/v1/kairos_decisions', decision);
    console.log(`✅ Decision logged: ${decision.decision}`);
    console.log(`   Impact: ${decision.impact} | Agent: ${decision.agent_id}`);
  } catch (e) {
    console.error(`❌ Failed to log decision: ${e.message}`);
  }
}

async function syncStatus() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  🧠 KAIROS Shared Brain — Status        ║');
  console.log('╠══════════════════════════════════════════╣');

  try {
    const [events, claims, decisions] = await Promise.all([
      supabaseRequest('GET', '/rest/v1/kairos_events?order=created_at.desc&limit=5'),
      supabaseRequest('GET', '/rest/v1/kairos_task_claims?completed=eq.false'),
      supabaseRequest('GET', '/rest/v1/kairos_decisions?order=created_at.desc&limit=5'),
    ]);

    console.log(`║  Events (últimos 5): ${(events || []).length}                   ║`);
    console.log(`║  Active Claims:      ${(claims || []).length}                   ║`);
    console.log(`║  Decisions (últ 5):  ${(decisions || []).length}                   ║`);
    
    const agents = [...new Set((events || []).map(e => e.agent_id))];
    console.log(`║  Agents vistos:      ${agents.join(', ') || 'nenhum'}   ║`);
    console.log('╚══════════════════════════════════════════╝');

    if (events?.length) {
      console.log('\n📡 Últimos eventos:');
      for (const e of events) {
        const t = new Date(e.created_at).toLocaleString('pt-BR');
        console.log(`  [${t}] ${e.event_type} — ${e.agent_id}`);
      }
    }
  } catch (e) {
    console.log(`║  ❌ Error: ${e.message}              ║`);
    console.log('╚══════════════════════════════════════════╝');
  }
}

// ══════════════════════════════════════════
// UTILS
// ══════════════════════════════════════════

function getArg(args, flag) {
  const idx = args.indexOf(flag);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : null;
}

// ══════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════

const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'publish':
    publish(args.slice(1));
    break;
  case 'recent':
    recent(args.slice(1));
    break;
  case 'active':
    activeClaims();
    break;
  case 'decide':
    decide(args.slice(1));
    break;
  case 'status':
    syncStatus();
    break;
  default:
    console.log(`
╔══════════════════════════════════════════╗
║  🧠 KAIROS Shared Brain — Event Bus v2  ║
╠══════════════════════════════════════════╣
║                                          ║
║  publish  — Publish event to bus         ║
║  recent   — List recent events           ║
║  active   — List active task claims      ║
║  decide   — Log a decision               ║
║  status   — Full sync status             ║
║                                          ║
║  Options:                                ║
║    --agent   Agent/session ID            ║
║    --machine PC or Notebook              ║
║    --event   Event type                  ║
║    --task    Task description            ║
║    --summary Summary text                ║
║    --files   Comma-separated file list   ║
║    --decision Decision text              ║
║    --impact   low/medium/high/critical   ║
║    --limit   Number of results           ║
║                                          ║
╚══════════════════════════════════════════╝
`);
}
