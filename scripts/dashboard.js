/**
 * @module dashboard
 * @version 5.0.0
 * @purpose Serve the JARVIS Command Center web UI. Provides API endpoints
 *          for system status, memory, enterprise data, kernel health,
 *          Synapse metrics, WIS stats, Orion chat, and multi-squad decomposer.
 * @inputs  HTTP requests on port 3000 (or DASHBOARD_PORT env)
 * @outputs HTML dashboard + JSON API responses
 * @dependencies memory-system.js, kernel-bridge.js,
 *              clients/<client>/config/enterprise.json (optional)
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const http = require('http');
const fs = require('fs');
const path = require('path');
const memory = require('./memory-system');

// ── Dynamic Enterprise Loader (client-agnostic) ──────────────
function loadEnterprise() {
  const clientsDir = path.join(__dirname, '..', 'clients');
  try {
    const clients = fs.readdirSync(clientsDir).filter(d =>
      fs.statSync(path.join(clientsDir, d)).isDirectory()
    );
    for (const client of clients) {
      const cfgPath = path.join(clientsDir, client, 'config', 'enterprise.json');
      if (fs.existsSync(cfgPath)) {
        return JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
      }
    }
  } catch (_) { /* no clients dir */ }
  return { client: 'none', brandLine: 'AIOS Intelligence Platform', agentLabel: 'Active Agents', partnerLabel: 'Partners', agents: { totalAgents: 0 }, partners: [], businessModel: {} };
}
const ENTERPRISE = loadEnterprise();
const { getBridge } = require('./kernel-bridge');
const https = require('https');

const PORT = process.env.DASHBOARD_PORT || 3000;

// ── Groq Chat ────────────────────────────────────────────────
function askOrion(userMessage) {
  return new Promise((resolve, reject) => {
    const context = memory.getContext(10);
    const body = JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system', content: `Você é Orion, o AIOS Master Orchestrator. Responda sempre em português brasileiro, de forma direta e profissional.
Contexto recente da memória:\n${context}\n
Dados da empresa: ${ENTERPRISE.agents.totalAgents} agentes ativos. ${ENTERPRISE.partners.map(p => `${p.name}: ${p.totalPositions} colaboradores`).join('. ') || 'Sem parceiros configurados.'}
Cliente ativo: ${ENTERPRISE.client}.`
        },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    });
    const req = https.request({
      hostname: 'api.groq.com', path: '/openai/v1/chat/completions', method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode < 300) {
          resolve(JSON.parse(data).choices[0].message.content);
        } else reject(new Error(`Groq ${res.statusCode}`));
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── API Routes ───────────────────────────────────────────────
function handleAPI(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname === '/api/status') {
    const stats = memory.stats();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      system: 'JARVIS v5.0',
      status: 'OPERATIONAL',
      uptime: process.uptime(),
      memory: stats,
      skills: 13,
      apis: { groq: !!process.env.GROQ_API_KEY, clickup: !!process.env.CLICKUP_API_KEY, instagram: !!process.env.INSTAGRAM_ACCESS_TOKEN, gemini: !!process.env.GEMINI_API_KEY },
      enterprise: { totalAgents: ENTERPRISE.agents.totalAgents, partners: ENTERPRISE.partners },
    }));
    return true;
  }

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

  if (url.pathname === '/api/enterprise') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(ENTERPRISE));
    return true;
  }

  if (url.pathname === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', async () => {
      try {
        const { message } = JSON.parse(body);
        memory.store('interactions', `User: ${message.substring(0, 100)}`, { source: 'dashboard' });
        const reply = await askOrion(message);
        memory.store('interactions', `Orion: ${reply.substring(0, 100)}`, { source: 'dashboard' });
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

  // Synapse Metrics
  if (url.pathname === '/api/synapse') {
    const bridge = getBridge();
    const metrics = bridge.synapse.getMetrics();
    const layers = bridge.synapse.available ? bridge.synapse.getLayerCount() : 0;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ available: bridge.synapse.available, layers, metrics }));
    return true;
  }

  // WIS Stats
  if (url.pathname === '/api/wis') {
    const bridge = getBridge();
    const data = {
      available: bridge.wis.available,
      workflows: bridge.wis.available ? bridge.wis.getWorkflowNames() : [],
      stats: bridge.wis.available ? bridge.wis.getStats() : null,
      hasLearning: bridge.wis.available ? bridge.wis.hasLearning() : false,
    };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
    return true;
  }

  // Multi-Squad Decomposer — breaks 1 request into N squad subtasks
  if (url.pathname === '/api/decompose' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', async () => {
      try {
        const { objective } = JSON.parse(body);
        const squads = ['CRM & Vendas', 'Marketing', 'Operações', 'Customer Success', 'Administração', 'Produto'];
        const decomposerPrompt = `Você é o JARVIS Decomposer. Dado um objetivo estratégico, decomponha em subtarefas para os squads disponíveis.
Squads: ${squads.join(', ')}

Retorne APENAS um JSON válido no formato:
{"tasks": [{"squad": "nome", "action": "ação", "priority": "high|medium|low", "dependencies": []}]}

Objetivo: ${objective}`;

        const decomposition = await askOrion(decomposerPrompt);
        let parsed;
        try {
          const jsonMatch = decomposition.match(/\{[\s\S]*\}/);
          parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: decomposition };
        } catch { parsed = { raw: decomposition }; }

        memory.store('decisions', 'Decomposed: ' + objective.substring(0, 80) + ' -> ' + (parsed.tasks ? parsed.tasks.length + ' subtasks' : 'raw output'), { source: 'decomposer', objective });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ objective, decomposition: parsed }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return true;
  }

  return false;
}

// ── HTML Dashboard ───────────────────────────────────────────
function getHTML() {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JARVIS — AIOS Command Center</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-primary: #0a0a0f;
      --bg-secondary: #12121a;
      --bg-card: #1a1a2e;
      --bg-card-hover: #1f1f35;
      --accent: #667eea;
      --accent-glow: rgba(102, 126, 234, 0.3);
      --accent2: #764ba2;
      --success: #00d4aa;
      --warning: #ffa726;
      --danger: #ef5350;
      --text-primary: #e8eaed;
      --text-secondary: #9aa0a6;
      --text-dim: #5f6368;
      --border: rgba(255,255,255,0.06);
      --radius: 12px;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      min-height: 100vh;
      overflow-x: hidden;
    }
    
    /* Header */
    .header {
      background: linear-gradient(135deg, var(--bg-secondary) 0%, #0d0d15 100%);
      border-bottom: 1px solid var(--border);
      padding: 16px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(20px);
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .logo {
      width: 42px;
      height: 42px;
      background: linear-gradient(135deg, var(--accent), var(--accent2));
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      box-shadow: 0 0 20px var(--accent-glow);
    }
    .header h1 {
      font-size: 20px;
      font-weight: 700;
      background: linear-gradient(135deg, var(--accent), var(--accent2));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .header-subtitle {
      font-size: 12px;
      color: var(--text-secondary);
      font-weight: 400;
    }
    .status-badge {
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .status-online {
      background: rgba(0, 212, 170, 0.12);
      color: var(--success);
      border: 1px solid rgba(0, 212, 170, 0.2);
    }
    .pulse {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--success);
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(0,212,170,0.4); }
      50% { opacity: 0.8; box-shadow: 0 0 0 6px rgba(0,212,170,0); }
    }
    
    /* Grid */
    .dashboard {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      grid-template-rows: auto auto 1fr;
      gap: 16px;
      padding: 24px 32px;
      max-width: 1400px;
      margin: 0 auto;
    }
    
    /* Cards */
    .card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px;
      transition: all 0.2s ease;
    }
    .card:hover {
      border-color: rgba(102,126,234,0.2);
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    .card-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    /* Stats */
    .stats-row {
      grid-column: 1 / -1;
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 16px;
    }
    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px;
      text-align: center;
      transition: all 0.3s ease;
    }
    .stat-card:hover {
      transform: translateY(-2px);
      border-color: var(--accent);
      box-shadow: 0 8px 30px rgba(102,126,234,0.15);
    }
    .stat-value {
      font-size: 32px;
      font-weight: 800;
      background: linear-gradient(135deg, var(--accent), var(--accent2));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .stat-label {
      font-size: 12px;
      color: var(--text-secondary);
      margin-top: 4px;
      font-weight: 500;
    }
    
    /* API Status */
    .api-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .api-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 14px;
      background: rgba(255,255,255,0.02);
      border-radius: 8px;
      font-size: 13px;
    }
    .api-status {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .api-status.on { background: var(--success); box-shadow: 0 0 8px rgba(0,212,170,0.5); }
    .api-status.off { background: var(--danger); }
    
    /* Squads */
    .squad-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .squad-item {
      padding: 10px 14px;
      background: rgba(255,255,255,0.02);
      border-radius: 8px;
      font-size: 12px;
      border-left: 3px solid var(--accent);
      transition: all 0.2s ease;
    }
    .squad-item:hover {
      background: rgba(102,126,234,0.08);
    }
    .squad-item .squad-name { font-weight: 600; color: var(--text-primary); }
    .squad-item .squad-lists { color: var(--text-dim); margin-top: 2px; }
    
    /* Memory */
    .memory-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      max-height: 300px;
      overflow-y: auto;
    }
    .memory-item {
      padding: 10px 14px;
      background: rgba(255,255,255,0.02);
      border-radius: 8px;
      font-size: 12px;
      border-left: 3px solid var(--accent2);
    }
    .memory-item .mem-cat {
      font-weight: 600;
      color: var(--accent);
      text-transform: uppercase;
      font-size: 10px;
    }
    .memory-item .mem-text {
      color: var(--text-primary);
      margin-top: 4px;
      line-height: 1.4;
    }
    .memory-item .mem-time {
      color: var(--text-dim);
      font-size: 10px;
      margin-top: 4px;
    }
    
    /* Chat */
    .chat-container {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
    }
    .chat-messages {
      flex: 1;
      min-height: 200px;
      max-height: 350px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 12px;
      padding: 4px;
    }
    .chat-msg {
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.5;
      max-width: 80%;
      animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .chat-msg.user {
      background: linear-gradient(135deg, var(--accent), var(--accent2));
      color: white;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    .chat-msg.bot {
      background: var(--bg-card-hover);
      color: var(--text-primary);
      align-self: flex-start;
      border-bottom-left-radius: 4px;
      border: 1px solid var(--border);
    }
    .chat-msg.bot .bot-label {
      font-size: 11px;
      color: var(--accent);
      font-weight: 600;
      margin-bottom: 4px;
    }
    .chat-input-row {
      display: flex;
      gap: 8px;
    }
    .chat-input-row input {
      flex: 1;
      padding: 12px 16px;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 10px;
      color: var(--text-primary);
      font-size: 14px;
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s;
    }
    .chat-input-row input:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-glow);
    }
    .chat-input-row input::placeholder { color: var(--text-dim); }
    .chat-input-row button {
      padding: 12px 24px;
      background: linear-gradient(135deg, var(--accent), var(--accent2));
      color: white;
      border: none;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }
    .chat-input-row button:hover {
      transform: scale(1.03);
      box-shadow: 0 4px 15px var(--accent-glow);
    }
    .chat-input-row button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
    
    /* Scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--text-dim); border-radius: 3px; }
    
    /* Responsive */
    @media (max-width: 900px) {
      .dashboard { grid-template-columns: 1fr; }
      .stats-row { grid-template-columns: repeat(3, 1fr); }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <header class="header">
    <div class="header-left">
      <div class="logo">👑</div>
      <div>
        <h1>JARVIS Command Center</h1>
        <div class="header-subtitle">AIOS v5.0 — ${ENTERPRISE.brandLine}</div>
      </div>
    </div>
    <div class="status-badge status-online">
      <div class="pulse"></div>
      OPERATIONAL
    </div>
  </header>
  
  <main class="dashboard">
    <!-- Stats Row -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-value" id="stat-skills">13</div>
        <div class="stat-label">OpenClaw Skills</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" id="stat-agents">${ENTERPRISE.agents.totalAgents}</div>
        <div class="stat-label">${ENTERPRISE.agentLabel}</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" id="stat-memories">–</div>
        <div class="stat-label">Memórias</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" id="stat-mp">${ENTERPRISE.partners[0]?.totalPositions || '—'}+</div>
        <div class="stat-label">${ENTERPRISE.partnerLabel}</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" id="stat-apis">–</div>
        <div class="stat-label">APIs Online</div>
      </div>
    </div>
    
    <!-- API Status -->
    <div class="card">
      <div class="card-title">🔌 APIs Conectadas</div>
      <div class="api-list" id="api-list"></div>
    </div>
    
    <!-- Squads -->
    <div class="card">
      <div class="card-title">🏢 Squads AIOS</div>
      <div class="squad-grid">
        <div class="squad-item"><div class="squad-name">CRM & Vendas</div><div class="squad-lists">Pipeline, Deals, Follow-ups</div></div>
        <div class="squad-item"><div class="squad-name">Marketing</div><div class="squad-lists">Campanhas, Instagram, Tráfego</div></div>
        <div class="squad-item"><div class="squad-name">Operações</div><div class="squad-lists">Processos, Health, Automações</div></div>
        <div class="squad-item"><div class="squad-name">Customer Success</div><div class="squad-lists">Tickets, NPS, Retenção</div></div>
        <div class="squad-item"><div class="squad-name">Administração</div><div class="squad-lists">RH, Financeiro, Jurídico</div></div>
        <div class="squad-item"><div class="squad-name">Facilities</div><div class="squad-lists">Acessos, LGPD, Auditorias</div></div>
      </div>
    </div>
    
    <!-- Kernel Status -->
    <div class="card">
      <div class="card-title">⚡ Kernel Status</div>
      <div class="api-list" id="kernel-status">
        <div class="api-item"><span>Loading...</span></div>
      </div>
    </div>
    
    <!-- Memory -->
    <div class="card">
      <div class="card-title">🧠 Memória Recente</div>
      <div class="memory-list" id="memory-list"></div>
    </div>
    
    <!-- Chat -->
    <div class="card chat-container">
      <div class="card-title">💬 Chat com Orion</div>
      <div class="chat-messages" id="chat-messages">
        <div class="chat-msg bot">
          <div class="bot-label">👑 Orion</div>
          Olá! Sou o Orion, orquestrador do AIOS. Pergunte-me sobre os squads, métricas, Master Pumps, ou qualquer operação. Como posso ajudar?
        </div>
      </div>
      <div class="chat-input-row">
        <input type="text" id="chat-input" placeholder="Pergunte ao Orion..." onkeydown="if(event.key==='Enter')sendChat()">
        <button onclick="sendChat()" id="chat-btn">Enviar</button>
      </div>
    </div>
  </main>
  
  <script>
    async function loadStatus() {
      try {
        const r = await fetch('/api/status');
        const d = await r.json();
        document.getElementById('stat-memories').textContent = d.memory.total;
        const onlineCount = Object.values(d.apis).filter(v => v).length;
        document.getElementById('stat-apis').textContent = onlineCount;
        
        const apiList = document.getElementById('api-list');
        apiList.innerHTML = '';
        const apiNames = { groq: 'Groq (LLM)', clickup: 'ClickUp', instagram: 'Instagram', gemini: 'Google Gemini' };
        for (const [key, online] of Object.entries(d.apis)) {
          apiList.innerHTML += '<div class="api-item"><span>' + apiNames[key] + '</span><div class="api-status ' + (online ? 'on' : 'off') + '"></div></div>';
        }
      } catch (e) { console.error(e); }
    }
    
    async function loadMemory() {
      try {
        const r = await fetch('/api/memory');
        const items = await r.json();
        const list = document.getElementById('memory-list');
        list.innerHTML = '';
        for (const m of items) {
          const t = new Date(m.timestamp).toLocaleString('pt-BR');
          list.innerHTML += '<div class="memory-item"><div class="mem-cat">' + m.category + '</div><div class="mem-text">' + m.content.substring(0, 120) + '</div><div class="mem-time">' + t + '</div></div>';
        }
      } catch (e) { console.error(e); }
    }
    
    async function sendChat() {
      const input = document.getElementById('chat-input');
      const btn = document.getElementById('chat-btn');
      const msg = input.value.trim();
      if (!msg) return;
      
      const msgs = document.getElementById('chat-messages');
      msgs.innerHTML += '<div class="chat-msg user">' + msg + '</div>';
      input.value = '';
      btn.disabled = true;
      btn.textContent = '⏳';
      msgs.scrollTop = msgs.scrollHeight;
      
      try {
        const r = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: msg }),
        });
        const d = await r.json();
        msgs.innerHTML += '<div class="chat-msg bot"><div class="bot-label">👑 Orion</div>' + d.reply.replace(/\\n/g, '<br>') + '</div>';
      } catch (e) {
        msgs.innerHTML += '<div class="chat-msg bot"><div class="bot-label">⚠️ Erro</div>' + e.message + '</div>';
      }
      btn.disabled = false;
      btn.textContent = 'Enviar';
      msgs.scrollTop = msgs.scrollHeight;
    }
    
    async function loadKernel() {
      try {
        const r = await fetch('/api/kernel');
        const d = await r.json();
        const el = document.getElementById('kernel-status');
        el.innerHTML = '';
        const m = d.modules;
        const items = [
          { name: 'Synapse', on: m.synapse.available, detail: m.synapse.layers + ' layers' },
          { name: 'IDS', on: m.ids.available, detail: m.ids.entities + ' entities' },
          { name: 'WIS', on: m.wis.available, detail: (m.wis.workflows||[]).length + ' workflows' },
        ];
        for (const it of items) {
          el.innerHTML += '<div class="api-item"><span>' + it.name + ' <span style="color:var(--text-dim);font-size:11px">' + it.detail + '</span></span><div class="api-status ' + (it.on ? 'on' : 'off') + '"></div></div>';
        }
        el.innerHTML += '<div class="api-item" style="justify-content:center;color:' + (d.overall === 'ACTIVE' ? 'var(--success)' : 'var(--warning)') + ';font-weight:600">' + d.overall + '</div>';
      } catch (e) { console.error(e); }
    }

    // Auto-refresh
    loadStatus();
    loadMemory();
    loadKernel();
    setInterval(loadStatus, 30000);
    setInterval(loadMemory, 15000);
    setInterval(loadKernel, 60000);
  </script>
</body>
</html>`;
}

// ── Server ───────────────────────────────────────────────────
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

  // SPA
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(getHTML());
});

server.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('  👑 JARVIS Command Center');
  console.log('═══════════════════════════════════════════════════');
  console.log('');
  console.log('  🌐 http://localhost:' + PORT);
  console.log('');
  console.log('  APIs:');
  console.log('    /api/status     — Status do sistema');
  console.log('    /api/memory     — Memórias (?q=, ?category=)');
  console.log('    /api/enterprise — Enterprise data (client-specific)');
  console.log('    /api/chat       — Chat com Orion (POST)');
  console.log('    /api/decompose  — Multi-Squad Decomposer (POST)');
  console.log('');
  console.log('  Pressione Ctrl+C para parar');
  console.log('');
  memory.store('context', 'Dashboard JARVIS iniciado na porta ' + PORT, { source: 'dashboard' });
});
