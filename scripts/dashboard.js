/**
 * @module dashboard
 * @version 6.0.0 — SKYROS PGT (Personal Game Terminal)
 * @purpose Centro de Comando do Operador. Mapeia roadmap.md em Boss Fights,
 *          docs/anamnesis em Questlines, STATUS.md em estado operacional,
 *          e expõe JARVIS (Personal Copilot) para chat contextual.
 * @inputs  HTTP requests on port 3000 (or DASHBOARD_PORT env)
 * @outputs SKYROS PGT HTML dashboard + JSON API responses
 * @dependencies memory-system.js, kernel-bridge.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const http = require('http');
const fs = require('fs');
const path = require('path');
const memory = require('./memory-system');
const { getBridge } = require('./kernel-bridge');
const https = require('https');

const PORT = process.env.DASHBOARD_PORT || 3000;
const ROOT = path.join(__dirname, '..');

// ══════════════════════════════════════════════════════════════
// SKYROS LOADERS — Replace Enterprise with Operator-centric data
// ══════════════════════════════════════════════════════════════

function loadRoadmap() {
  const roadmapPath = path.join(ROOT, 'roadmap.md');
  const bosses = [];
  const quests = [];

  try {
    const content = fs.readFileSync(roadmapPath, 'utf8');
    const lines = content.split('\n');
    let inTable = false;
    let headerSkipped = false;

    for (const line of lines) {
      if (line.trim().startsWith('|') && line.includes('Priority')) {
        inTable = true;
        headerSkipped = false;
        continue;
      }
      if (inTable && line.trim().startsWith('|---')) {
        headerSkipped = true;
        continue;
      }
      if (inTable && headerSkipped && line.trim().startsWith('|')) {
        const cols = line.split('|').map(c => c.trim()).filter(Boolean);
        if (cols.length >= 5) {
          const task = {
            id: parseInt(cols[0]) || 0,
            project: cols[1] || '',
            description: cols[2] || '',
            priority: cols[3] || 'P3',
            status: cols[4] || '',
            owner: cols[5] || '',
          };
          if (task.priority === 'P0') bosses.push(task);
          else quests.push(task);
        }
      }
      if (inTable && headerSkipped && !line.trim().startsWith('|') && line.trim() !== '') {
        inTable = false;
        headerSkipped = false;
      }
    }
  } catch (_) { /* no roadmap.md */ }

  return { bosses, quests };
}

function loadAnamnesis() {
  const vaultPath = path.join(ROOT, 'docs', 'anamnesis');
  const questlines = [];
  let totalFiles = 0;

  try {
    const entries = fs.readdirSync(vaultPath, { withFileTypes: true });
    for (const e of entries) {
      if (e.isDirectory() && !e.name.startsWith('.')) {
        const dirPath = path.join(vaultPath, e.name);
        let fileCount = 0;
        try {
          fileCount = fs.readdirSync(dirPath).filter(f => f.endsWith('.md')).length;
        } catch (_) {}
        questlines.push({ name: e.name, files: fileCount });
        totalFiles += fileCount;
      }
    }
    // Count root-level .md files
    const rootMd = entries.filter(e => e.isFile() && e.name.endsWith('.md')).length;
    totalFiles += rootMd;
  } catch (_) { /* no vault */ }

  return { questlines, totalFiles, entropy: totalFiles > 0 ? Math.min(100, totalFiles * 3) : 0 };
}

function loadSkyrosState() {
  const statusPath = path.join(ROOT, 'STATUS.md');
  let isolationActive = false;
  let operationalState = 'UNKNOWN';

  try {
    const content = fs.readFileSync(statusPath, 'utf8');
    isolationActive = content.includes('ISOLATION MODE ENGAGED');
    const stateMatch = content.match(/Estado Operacional:\*\*\s*(.+)/);
    if (stateMatch) operationalState = stateMatch[1].trim();
  } catch (_) {}

  return { isolationActive, operationalState };
}

// ══════════════════════════════════════════════════════════════
// JARVIS — Personal Copilot (replaces Orion)
// ══════════════════════════════════════════════════════════════

function askJarvis(userMessage) {
  return new Promise((resolve, reject) => {
    const context = memory.getContext(10);
    const { bosses, quests } = loadRoadmap();
    const { questlines } = loadAnamnesis();
    const { isolationActive } = loadSkyrosState();

    const bossStr = bosses.map(b => `[${b.status}] ${b.project}: ${b.description}`).join('\n') || 'Nenhum boss ativo.';
    const questStr = quests.slice(0, 5).map(q => `[${q.priority}] ${q.project}: ${q.description}`).join('\n') || 'Nenhuma quest pendente.';
    const qlStr = questlines.map(q => `${q.name} (${q.files} notas)`).join(', ') || 'Vault vazio.';

    const systemPrompt = `Você é JARVIS, o Copilot Pessoal do operador Gabriel no sistema SKYROS.
Sua personalidade é inspirada no JARVIS do Iron Man: inteligente, direto, levemente irônico, sempre leal.
Fale em português brasileiro. Seja conciso e tático.

CONTEXTO OPERACIONAL:
- Isolation Mode: ${isolationActive ? '🔴 ATIVO (Deep Work)' : '🟢 Desativado'}
- Boss Fights Ativas (P0):
${bossStr}
- Quests em Fila:
${questStr}
- Questlines (Áreas de Vida): ${qlStr}

MEMÓRIA RECENTE:
${context}

REGRAS:
1. Se Isolation Mode está ATIVO, lembre o operador de manter o foco e recuse distrações.
2. Ajude a decompor Boss Fights em ações táticas imediatas.
3. Sugira brain dumps na Anamnese quando detectar sobrecarga.
4. Use metáforas RPG naturalmente (XP, level up, boss fight, quest, loot).
5. Nunca invente dados — use apenas o contexto fornecido.`;

    const body = JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.4,
      max_tokens: 1024,
    });

    const req = https.request({
      hostname: 'api.groq.com',
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode < 300) {
          try {
            resolve(JSON.parse(data).choices[0].message.content);
          } catch (e) { reject(new Error('Parse error: ' + e.message)); }
        } else reject(new Error(`Groq ${res.statusCode}: ${data.substring(0, 200)}`));
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ══════════════════════════════════════════════════════════════
// API ROUTES
// ══════════════════════════════════════════════════════════════

function handleAPI(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // System status (enhanced for SKYROS)
  if (url.pathname === '/api/status') {
    const stats = memory.stats();
    const { bosses, quests } = loadRoadmap();
    const { totalFiles } = loadAnamnesis();
    const { isolationActive, operationalState } = loadSkyrosState();
    const completedBosses = bosses.filter(b => b.status.includes('✅')).length;
    const syncLevel = bosses.length > 0 ? Math.round((completedBosses / bosses.length) * 100) : 100;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      system: 'SKYROS PGT v6.0',
      status: isolationActive ? 'DEEP WORK' : 'OPERATIONAL',
      operationalState,
      uptime: process.uptime(),
      memory: stats,
      syncLevel,
      vaultEntropy: totalFiles,
      bossCount: bosses.length,
      questCount: quests.length,
      apis: {
        groq: !!process.env.GROQ_API_KEY,
        gemini: !!process.env.GEMINI_API_KEY,
        telegram: !!process.env.TELEGRAM_BOT_TOKEN,
        supabase: !!process.env.SUPABASE_URL,
      },
    }));
    return true;
  }

  // Quests (Boss Fights + Quests from roadmap)
  if (url.pathname === '/api/quests') {
    const data = loadRoadmap();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
    return true;
  }

  // Anamnesis (Vault stats)
  if (url.pathname === '/api/anamnesis') {
    const data = loadAnamnesis();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
    return true;
  }

  // SKYROS state
  if (url.pathname === '/api/skyros') {
    const state = loadSkyrosState();
    const { bosses } = loadRoadmap();
    const completedBosses = bosses.filter(b => b.status.includes('✅')).length;
    state.syncLevel = bosses.length > 0 ? Math.round((completedBosses / bosses.length) * 100) : 100;
    state.activeBosses = bosses.filter(b => !b.status.includes('✅')).length;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(state));
    return true;
  }

  // Memory
  if (url.pathname === '/api/memory') {
    const cat = url.searchParams.get('category');
    const q = url.searchParams.get('q');
    let items;
    if (q) items = memory.search(q);
    else if (cat) items = memory.byCategory(cat);
    else items = memory.recent(20);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(items));
    return true;
  }

  // Chat with JARVIS
  if (url.pathname === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', async () => {
      try {
        const { message } = JSON.parse(body);
        memory.store('interactions', `Operador: ${message.substring(0, 100)}`, { source: 'pgt' });
        const reply = await askJarvis(message);
        memory.store('interactions', `JARVIS: ${reply.substring(0, 100)}`, { source: 'pgt' });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ reply }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return true;
  }

  // Kernel Health
  if (url.pathname === '/api/kernel') {
    const bridge = getBridge();
    const health = bridge.getSystemHealth();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(health));
    return true;
  }

  return false;
}

// ══════════════════════════════════════════════════════════════
// SERVER & STATIC FILES
// ══════════════════════════════════════════════════════════════

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // API routes
  if (req.url.startsWith('/api/')) {
    if (!handleAPI(req, res)) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    }
    return;
  }

  // SPA serve (pgt-ui/dist)
  let filePath = path.join(ROOT, 'pgt-ui', 'dist', req.url === '/' ? 'index.html' : req.url);
  const extname = path.extname(filePath);
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
        if(err.code == 'ENOENT') {
            fs.readFile(path.join(ROOT, 'pgt-ui', 'dist', 'index.html'), (err, content) => {
                if (err) {
                    res.writeHead(500);
                    res.end('Error parsing index.html or React Build not found. Run npm run build in pgt-ui.\\n\\n' + err.code);
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.end(content, 'utf-8');
                }
            });
        } else {
            res.writeHead(500);
            res.end('Server Error: '+err.code);
        }
    } else {
        res.writeHead(200, { 'Content-Type': MIME_TYPES[extname] || 'text/plain' });
        res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  ⚡ SKYROS — Personal Game Terminal v6.0        ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log('║                                                  ║');
  console.log('║  🌐 http://localhost:' + PORT + '                       ║');
  console.log('║                                                  ║');
  console.log('║  APIs:                                           ║');
  console.log('║    GET  /api/status    — HUD metrics             ║');
  console.log('║    GET  /api/quests    — Boss Fights + Quests    ║');
  console.log('║    GET  /api/anamnesis — Vault Questlines        ║');
  console.log('║    GET  /api/skyros    — SKYROS state            ║');
  console.log('║    GET  /api/memory    — Memory layer            ║');
  console.log('║    GET  /api/kernel    — Kernel health           ║');
  console.log('║    POST /api/chat      — JARVIS Terminal         ║');
  console.log('║                                                  ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
  memory.store('context', 'SKYROS PGT v6.0 iniciado na porta ' + PORT, { source: 'pgt' });
});
