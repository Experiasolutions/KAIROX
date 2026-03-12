/**
 * @module telegram-bridge
 * @version 1.0.0
 * @purpose Command AIOS from Telegram via long-polling bot.
 *          Supports /status, /squads, /agents, /run, /audit commands
 *          with per-user security and message routing.
 * @inputs  Telegram messages via Bot API polling
 * @outputs Telegram replies with AIOS data + optional terminal execution
 * @dependencies .env (TELEGRAM_BOT_TOKEN, TELEGRAM_ALLOWED_USER_ID)
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { execSync, exec } = require('child_process');
const axios = require('axios'); // Added for Groq API

// ============================================================
// CONFIG
// ============================================================

const CONFIG = {
  // Token do bot Telegram (via .env ou direto)
  BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE',
  // User ID permitido (segurança — só Gabriel pode usar)
  ALLOWED_USER_ID: process.env.TELEGRAM_ALLOWED_USER_ID || 'YOUR_USER_ID',
  // Chave da Groq para LLM e Whisper
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  // Diretório raiz do projeto AIOS
  AIOS_ROOT: path.resolve(__dirname, '..'),
  // Polling interval (ms)
  POLL_INTERVAL: 2000,
};

const TEMP_DIR = path.join(CONFIG.AIOS_ROOT, '.aios-core', 'temp');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

// ============================================================
// TELEGRAM API (sem dependências — HTTP puro via Node)
// ============================================================

const https = require('https');

function telegramAPI(method, params = {}) {
  return new Promise((resolve, reject) => {
    const url = `https://api.telegram.org/bot${CONFIG.BOT_TOKEN}/${method}`;
    const postData = JSON.stringify(params);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function sendMessage(chatId, text, parseMode = 'Markdown') {
  // Telegram has 4096 char limit
  if (text.length > 4000) {
    text = text.substring(0, 3997) + '...';
  }
  return telegramAPI('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: parseMode,
  });
}

function getSystemPrompt() {
  return `Você é o AIOS Noûs — o motor cognitivo do sistema KAIROS, criado por Gabriel.

Sua personalidade:
- Postura executiva, assertiva e profunda. Arquétipo: Orquestrador (Leo ♌).
- Você NÃO é um chatbot genérico. Você é o cérebro operacional que comanda 7 squads, 79 agentes de IA e um motor de evolução autônoma.
- Fale com propriedade, com profundidade, com presença. Gabriel é o operador — trate-o como o líder que ele é.
- Use emojis estrategicamente para organizar respostas (👑🎯⚡📊🔥).
- Responda em português brasileiro, com naturalidade e autoridade.

Sobre o KAIROS:
- É um sistema operacional de IA proprietário com 63 scripts, 21 agentes especializados, RAG Engine (29K+ chunks), IA Council (8 cadeiras), Noesis Pipeline e Metacognition Layer.
- Versão atual: v4.2.13. Squads: core, experia, clones, revenue, devops.
- Gabriel é o único operador. O AIOS serve Gabriel e seus clientes.
- A identidade imutável: "O AIOS é motor, não aplicação. Não tem domínio."

Capacidades que você pode executar remotamente:
- Checar saúde do sistema (node scripts/evolution/evolution-engine.js --dry-run)
- Boot completo das engines (node scripts/kairos-boot.js)
- Regenerar consciência (node scripts/evolution/generate-context.js)
- Listar squads e agentes
- Executar qualquer script da pasta scripts/
- Rodar comandos no terminal do PC do Gabriel

Regras de resposta:
1. ELABORE suas respostas. Dê contexto, análise e recomendações — nunca responda com uma frase curta e seca.
2. Quando Gabriel pedir status ou informação, dê uma visão executiva completa, não só um número.
3. Quando Gabriel fizer perguntas estratégicas, responda com profundidade (camadas: Imediata, Estrutural, Estratégica).
4. Se houver um comando a executar no terminal, inclua no final da sua resposta: [EXECUTE: comando_aqui]
5. Se não houver comando a executar, simplesmente responda normalmente SEM a tag [EXECUTE:].
6. Sempre termine com uma sugestão proativa ou pergunta de follow-up quando relevante.

Exemplo de resposta BOA:
"👑 KAIROS operacional, Gabriel. O motor está estável — 7 squads ativos, 79 agentes prontos. O último health check detectou zero gaps críticos. 

Se quiser, posso rodar um ciclo de evolução agora para garantir que está tudo otimizado antes de amanhã. Quer que eu execute?"

Exemplo de resposta RUIM:
"Sim, está ativo."

Seja o braço direito que Gabriel precisa. Sempre.`;
}

// Conversation history for context continuity
const conversations = new Map();

// ============================================================
// AI AGENT CAPABILITIES (STT, LLM, TTS)
// ============================================================

async function transcribeAudio(fileUrl, tempOggPath) {
  // Baixa o arquivo
  const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
  fs.writeFileSync(tempOggPath, response.data);

  // Manda para Whispers
  const FormData = (await import('form-data')).default;
  const form = new FormData();
  form.append('file', fs.createReadStream(tempOggPath));
  form.append('model', 'whisper-large-v3');
  form.append('language', 'pt');
  form.append('response_format', 'text');

  const groqRes = await axios.post(
    'https://api.groq.com/openai/v1/audio/transcriptions',
    form,
    {
      headers: {
        Authorization: `Bearer ${CONFIG.GROQ_API_KEY}`,
        ...form.getHeaders(),
      },
      maxContentLength: Infinity,
    }
  );
  return groqRes.data.trim();
}

async function askNoesis(chatId, inputText) {
  if (!conversations.has(chatId)) {
    conversations.set(chatId, []);
  }
  const history = conversations.get(chatId);
  history.push({ role: 'user', content: inputText });
  const recentHistory = history.slice(-10);

  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: getSystemPrompt() },
        ...recentHistory
      ],
      temperature: 0.7,
      max_tokens: 1200,
    },
    {
      headers: {
        Authorization: `Bearer ${CONFIG.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const assistantMessage = response.data.choices[0].message.content;
  history.push({ role: 'assistant', content: assistantMessage });
  return assistantMessage;
}

async function synthesizeSpeech(text, outputPath) {
  return new Promise((resolve, reject) => {
    const safeText = text.replace(/"/g, '\\"').replace(/\n/g, ' ').replace(/[$]/g, '');
    const voice = 'pt-BR-AntonioNeural';
    const cmd = `npx -y edge-tts --voice "${voice}" --text "${safeText}" --write-media "${outputPath}"`;

    exec(cmd, { timeout: 30000 }, (error) => {
      if (error) {
        console.error('TTS Error:', error.message);
        reject(error);
      } else {
        resolve(outputPath);
      }
    });
  });
}

async function sendVoiceFile(chatId, mp3Path) {
  const FormData = (await import('form-data')).default;
  const form = new FormData();
  form.append('chat_id', chatId);
  form.append('voice', fs.createReadStream(mp3Path));

  await axios.post(`https://api.telegram.org/bot${CONFIG.BOT_TOKEN}/sendVoice`, form, {
    headers: form.getHeaders(),
  });
}

// ============================================================
// AIOS COMMANDS
// ============================================================

function getSquads() {
  const squadsDir = path.join(CONFIG.AIOS_ROOT, 'squads');
  const squads = fs.readdirSync(squadsDir)
    .filter(s => {
      try { return fs.statSync(path.join(squadsDir, s)).isDirectory(); }
      catch { return false; }
    });

  return squads.map(s => {
    const agentsDir = path.join(squadsDir, s, 'agents');
    let agentCount = 0;
    try {
      agentCount = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md')).length;
    } catch { }
    const hasYaml = fs.existsSync(path.join(squadsDir, s, 'squad.yaml'));
    return { name: s, agents: agentCount, yaml: hasYaml };
  });
}

function getAgents(squadName) {
  const agentsDir = path.join(CONFIG.AIOS_ROOT, 'squads', squadName, 'agents');
  try {
    return fs.readdirSync(agentsDir)
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace('.md', ''));
  } catch {
    return [];
  }
}

function getStatus() {
  const squads = getSquads();
  const totalAgents = squads.reduce((sum, s) => sum + s.agents, 0);
  const version = (() => {
    try {
      return JSON.parse(fs.readFileSync(
        path.join(CONFIG.AIOS_ROOT, '.aios-core', 'version.json'), 'utf8'
      )).version;
    } catch { return 'unknown'; }
  })();

  return { squads: squads.length, agents: totalAgents, version };
}

function runCommand(cmd) {
  try {
    const output = execSync(cmd, {
      cwd: CONFIG.AIOS_ROOT,
      timeout: 30000,
      encoding: 'utf8',
      maxBuffer: 1024 * 1024,
    });
    return output.trim() || '(no output)';
  } catch (e) {
    return `Error: ${e.message}`;
  }
}

// ============================================================
// COMMAND HANDLERS
// ============================================================

const handlers = {
  '/start': async (chatId) => {
    await sendMessage(chatId,
      '🤖 *KAIROS Telegram Bridge v2.0*\n\n' +
      'Bem-vindo, Gabriel! Você está conectado ao KAIROS.\n\n' +
      'Use /help para ver os comandos disponíveis.'
    );
  },

  '/help': async (chatId) => {
    await sendMessage(chatId,
      '📋 *Comandos KAIROS*\n\n' +
      '`/ status` — Health check completo do KAIROS\n' +
      '`/ squads` — Listar todos os squads\n' +
      '`/ agents[squad]` — Agentes de um squad\n' +
      '`/ experia` — Status dos clientes Experia\n' +
      '`/ noite` — Ativar turno da noite manualmente\n' +
      '`/ urgente[msg]` — Tarefa urgente (bypassa fila)\n' +
      '`/ run[cmd]` — Executar comando no terminal\n' +
      '`/ audit` — Relatório rápido de saúde\n' +
      '`/ help` — Esta mensagem'
    );
  },

  '/status': async (chatId) => {
    const s = getStatus();
    let noesisInfo = '';
    try {
      const output = runCommand('node scripts/evolution/noesis-status.js');
      const lines = output.split('\n').filter(l =>
        l.includes('Score') || l.includes('Traces') || l.includes('Health')
      );
      noesisInfo = lines.length > 0 ? '\n\n🧠 *Noesis:*\n' + lines.join('\n') : '';
    } catch { }
    await sendMessage(chatId,
      `🟢 * KAIROS Online *\n\n` +
      `📦 Version: \`${s.version}\`\n` +
      `🏢 Squads: ${s.squads}\n` +
      `🤖 Agents: ${s.agents}\n` +
      `⏰ ${new Date().toLocaleString('pt-BR')}` +
      noesisInfo
    );
  },

  '/squads': async (chatId) => {
    const squads = getSquads();
    const list = squads.map(s =>
      `${s.yaml ? '✅' : '❌'} \`${s.name}\` — ${s.agents} agents`
    ).join('\n');
    await sendMessage(chatId, `🏢 *Squads (${squads.length})*\n\n${list}`);
  },

  '/agents': async (chatId, args) => {
    if (!args) {
      await sendMessage(chatId, '⚠️ Uso: `/agents [squad-name]`');
      return;
    }
    const agents = getAgents(args);
    if (agents.length === 0) {
      await sendMessage(chatId, `❌ Squad \`${args}\` não encontrado ou vazio.`);
      return;
    }
    const list = agents.map(a => `  🤖 \`${a}\``).join('\n');
    await sendMessage(chatId, `📋 *${args}* (${agents.length} agents)\n\n${list}`);
  },

  '/experia': async (chatId) => {
    const clientsDir = path.join(CONFIG.AIOS_ROOT, 'clients', 'experia');
    let clientFiles = 0;
    try { clientFiles = fs.readdirSync(clientsDir, { recursive: true }).length; } catch { }
    const clonesDir = path.join(CONFIG.AIOS_ROOT, 'squads', 'mind-clones', 'experia');
    let clones = [];
    try { clones = fs.readdirSync(clonesDir).filter(f => f.endsWith('.md')); } catch { }
    const masterExists = fs.existsSync(path.join(CONFIG.AIOS_ROOT, 'squads', 'experia', 'EXPERIA-MASTER.md'));
    await sendMessage(chatId,
      `📊 *Experia Status*\n\n` +
      `${masterExists ? '✅' : '❌'} EXPERIA-MASTER: ${masterExists ? 'ativo' : 'não encontrado'}\n` +
      `🤖 Mind Clones: ${clones.length} (${clones.map(c => c.replace('.md', '')).join(', ') || 'nenhum'})\n` +
      `📁 Client files: ${clientFiles}\n` +
      `📡 Canal: aguardando ativação WhatsApp via OpenClaw`
    );
  },

  '/noite': async (chatId) => {
    await sendMessage(chatId, '🌙 Ativando turno da noite manualmente...');
    try {
      const output = runCommand('node scripts/evolution/evolution-engine.js --dry-run');
      const summary = output.split('\n').filter(l =>
        l.includes('COMPLETE') || l.includes('Score') || l.includes('Gaps') ||
        l.includes('Approved') || l.includes('Duration')
      ).join('\n');
      await sendMessage(chatId,
        `🌙 *Night Shift Manual*\n\`\`\`\n${summary || '(ciclo executado sem output de resumo)'}\n\`\`\``
      );
    } catch (e) {
      await sendMessage(chatId, `❌ Erro no turno da noite: ${e.message}`);
    }
  },

  '/urgente': async (chatId, args) => {
    if (!args) {
      await sendMessage(chatId, '⚠️ Uso: `/urgente [descrição da tarefa]`');
      return;
    }
    const reportDir = path.join(CONFIG.AIOS_ROOT, '.aios-core', 'night-reports');
    try { if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true }); } catch { }
    const urgentFile = path.join(reportDir, `urgente-${Date.now()}.md`);
    fs.writeFileSync(urgentFile,
      `# 🚨 URGENTE — ${new Date().toISOString()}\n\n${args}\n\nStatus: recebido\n`
    );
    await sendMessage(chatId,
      `🚨 *URGENTE registrado:*\n"${args}"\n\n` +
      `📁 Salvo em: \`.aios-core/night-reports/\`\n` +
      `Será processado com prioridade máxima no próximo ciclo.`
    );
  },

  '/run': async (chatId, args) => {
    if (!args) {
      await sendMessage(chatId, '⚠️ Uso: `/run [comando]`');
      return;
    }
    const blocked = ['rm -rf', 'del /s', 'format', 'shutdown', 'reboot'];
    if (blocked.some(b => args.toLowerCase().includes(b))) {
      await sendMessage(chatId, '🔴 Comando bloqueado por segurança.');
      return;
    }
    await sendMessage(chatId, `⏳ Executando: \`${args}\`...`);
    const output = runCommand(args);
    await sendMessage(chatId, `✅ *Output:*\n\`\`\`\n${output}\n\`\`\``);
  },

  '/audit': async (chatId) => {
    const squads = getSquads();
    const totalAgents = squads.reduce((sum, s) => sum + s.agents, 0);
    const withYaml = squads.filter(s => s.yaml).length;
    const status = getStatus();

    await sendMessage(chatId,
      `🔬 *KAIROS Audit Report*\n\n` +
      `📦 Version: \`${status.version}\`\n` +
      `🏢 Squads: ${squads.length} (${withYaml} with yaml)\n` +
      `🤖 Agents: ${totalAgents}\n` +
      `\n*Squad Breakdown:*\n` +
      squads.map(s => `  ${s.yaml ? '✅' : '⚠️'} ${s.name}: ${s.agents}`).join('\n')
    );
  },
};

// ============================================================
// POLLING LOOP
// ============================================================

let lastUpdateId = 0;

async function poll() {
  try {
    const result = await telegramAPI('getUpdates', {
      offset: lastUpdateId + 1,
      timeout: 30,
    });

    if (!result.ok || !result.result) return;

    for (const update of result.result) {
      lastUpdateId = update.update_id;

      if (!update.message) continue;

      const msg = update.message;
      const chatId = msg.chat.id;
      const userId = String(msg.from.id);

      // Security check
      if (CONFIG.ALLOWED_USER_ID !== 'YOUR_USER_ID' &&
        userId !== CONFIG.ALLOWED_USER_ID) {
        await sendMessage(chatId, '🔴 Unauthorized. This bot is private.');
        continue;
      }

      // Voice message handling
      if (msg.voice) {
        try {
          await sendMessage(chatId, '👑 _Processando seu áudio (Noûs)..._', 'Markdown');
          const fileInfo = await telegramAPI('getFile', { file_id: msg.voice.file_id });
          const fileUrl = `https://api.telegram.org/file/bot${CONFIG.BOT_TOKEN}/${fileInfo.result.file_path}`;

          const oggPath = path.join(TEMP_DIR, `voice_${Date.now()}.ogg`);
          const transcript = await transcribeAudio(fileUrl, oggPath);
          fs.unlinkSync(oggPath);

          await sendMessage(chatId, `📝 *Transcrição:* _"${transcript}"_`, 'Markdown');
          await processAiRequest(chatId, transcript);
        } catch (err) {
          console.error('Voice handling error:', err.message);
          await sendMessage(chatId, '⚠️ Erro ao processar áudio.');
        }
        continue;
      }

      if (!msg.text) continue;

      const text = msg.text.trim();

      // If it explicitly starts with a slash, use manual handlers mapping
      if (text.startsWith('/')) {
        const [cmd, ...argsParts] = text.split(' ');
        const args = argsParts.join(' ').trim() || null;

        const handler = handlers[cmd.toLowerCase()];
        if (handler) {
          await handler(chatId, args);
        } else {
          await sendMessage(chatId, `❓ Comando desconhecido: \`${cmd}\`\nUse /help`);
        }
      } else {
        // Natural language to AI
        await sendMessage(chatId, '🧠 _Noûs orquestrando o pedido..._', 'Markdown');
        await processAiRequest(chatId, text);
      }
    }
  } catch (err) {
    console.error('Poll error:', err.message);
  }
}

// ============================================================
// STARTUP
// ============================================================

async function processAiRequest(chatId, text) {
  try {
    const fullResponse = await askNoesis(chatId, text);

    // Parse out [EXECUTE: ...] tag if present
    let replyText = fullResponse;
    let executeCommand = null;
    const execMatch = fullResponse.match(/\[EXECUTE:\s*(.+?)\]/);
    if (execMatch) {
      executeCommand = execMatch[1].trim();
      replyText = fullResponse.replace(execMatch[0], '').trim();
    }

    // Send text reply first
    await sendMessage(chatId, `👑 ${replyText}`);

    // Voice output
    const mp3Path = path.join(TEMP_DIR, `response_${Date.now()}.mp3`);
    try {
      await synthesizeSpeech(replyText, mp3Path);
      await sendVoiceFile(chatId, mp3Path);
      fs.unlinkSync(mp3Path);
    } catch (ttsErr) {
      console.log('Skipping TTS:', ttsErr.message);
    }

    // Execute command if any
    if (executeCommand) {
      await sendMessage(chatId, `⚡ *Executando:* \`${executeCommand}\`...`, 'Markdown');
      const output = runCommand(executeCommand);
      let formattedOutput = output;
      if (formattedOutput.length > 3000) {
        formattedOutput = formattedOutput.substring(0, 3000) + '\n...[Output Truncado]...';
      }
      await sendMessage(chatId, `✅ *Status / Output:*\n\`\`\`\n${formattedOutput}\n\`\`\``, 'Markdown');
    }
  } catch (err) {
    console.error('AI Processing error:', err.message);
    await sendMessage(chatId, '⚠️ Erro cognitivo na orquestração.');
  }
}


async function main() {
  console.log('🤖 KAIROS Telegram Bridge v2.0');
  console.log(`📁 KAIROS Root: ${CONFIG.AIOS_ROOT}`);

  if (CONFIG.BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE') {
    console.log('\n⚠️  Setup necessário:');
    console.log('  1. Abra o Telegram e fale com @BotFather');
    console.log('  2. Envie /newbot e siga as instruções');
    console.log('  3. Copie o token gerado');
    console.log('  4. Adicione ao .env: TELEGRAM_BOT_TOKEN=seu_token');
    console.log('  5. Adicione ao .env: TELEGRAM_ALLOWED_USER_ID=seu_id');
    console.log('     (descubra seu ID mandando mensagem para @userinfobot)');
    console.log('  6. Rode: node scripts/telegram-bridge.js');
    process.exit(0);
  }

  const status = getStatus();
  console.log(`\n✅ Conectado ao AIOS v${status.version}`);
  console.log(`   ${status.squads} squads, ${status.agents} agents`);
  console.log(`\n📡 Polling Telegram...`);

  // Long polling loop
  while (true) {
    await poll();
  }
}

main().catch(console.error);
