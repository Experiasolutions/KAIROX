#!/usr/bin/env node

/**
 * @module demo-bot-petshop
 * @version 1.0.0
 * @purpose Telegram Bot demo for Pet Shop sales pitch.
 *          Dual-mode: Customer-facing (atendimento) + Internal (business assistant).
 *          Run: node scripts/demo-bots/demo-bot-petshop.js
 *
 *          Before running, set TELEGRAM_BOT_TOKEN in .env
 *          Create a bot via @BotFather on Telegram and get the token.
 */

'use strict';

const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN not found in .env');
    process.exit(1);
}

// ─────────────────────────────────────────────────────────────
// RENDER.COM WEB SERVER (Obrigatório para o plano grátis)
// ─────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('🐾 Pet Shop Bot is running!');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Web server running on port ${PORT} (Render requirement)`);
});

const bot = new TelegramBot(TOKEN, { polling: true });

// ─────────────────────────────────────────────────────────────
// PET SHOP CONFIG (muda para cada cliente)
// ─────────────────────────────────────────────────────────────
const PETSHOP = {
    nome: '🐾 Pet Shop Modelo',
    slogan: 'Cuidando do seu melhor amigo com carinho!',
    servicos: {
        'banho_pequeno': { nome: 'Banho - Porte Pequeno', preco: 'R$45,00', tempo: '40 min' },
        'banho_medio': { nome: 'Banho - Porte Médio', preco: 'R$55,00', tempo: '50 min' },
        'banho_grande': { nome: 'Banho - Porte Grande', preco: 'R$70,00', tempo: '60 min' },
        'tosa_higienica': { nome: 'Tosa Higiênica', preco: 'R$35,00', tempo: '30 min' },
        'tosa_completa': { nome: 'Tosa Completa', preco: 'R$65,00', tempo: '60 min' },
        'banho_tosa': { nome: 'Banho + Tosa Completa', preco: 'R$95,00', tempo: '90 min' },
        'consulta_vet': { nome: 'Consulta Veterinária', preco: 'R$120,00', tempo: '30 min' },
        'vacina': { nome: 'Vacinação (V8/V10)', preco: 'R$90,00', tempo: '15 min' },
    },
    horario: 'Seg-Sex: 8h–18h | Sáb: 8h–14h | Dom: Fechado',
    endereco: 'Av. Castelo Branco, 1234 — Jardim Zaíra, Mauá',
    whatsapp: '(11) 9XXXX-XXXX',
    pagamento: 'Pix, Dinheiro, Cartão (Débito/Crédito)',
};

// ─────────────────────────────────────────────────────────────
// INTERNAL MODE — Business Assistant
// ─────────────────────────────────────────────────────────────
const BUSINESS_DATA = {
    faturamento_medio: 'R$12.500/mês',
    ticket_medio: 'R$67,50',
    clientes_dia: '~18 atendimentos/dia',
    top_servicos: '1º Banho+Tosa (42%), 2º Banho só (28%), 3º Consulta Vet (15%)',
    horario_pico: 'Sexta e Sábado (35% do faturamento semanal)',
    despesas_fixas: 'Aluguel R$2.800 + Funcionários R$4.200 + Insumos R$1.500',
    margem_liquida: '~32% após custos operacionais',
    oportunidades: [
        '🔴 Perde ~8 clientes/mês por demora no WhatsApp',
        '🟡 Zero presença no Instagram (concorrentes postam 3x/semana)',
        '🟢 Potencial de plano mensal de banho (receita recorrente)',
    ]
};

// ─────────────────────────────────────────────────────────────
// MESSAGE HANDLERS
// ─────────────────────────────────────────────────────────────

bot.onText(/\/start/, (msg) => {
    const welcome = `
🐾 *${PETSHOP.nome}*
_${PETSHOP.slogan}_

Olá! Sou o assistente digital do pet shop. Como posso te ajudar?

📋 *Comandos disponíveis:*

🐶 *Atendimento ao Cliente:*
/servicos — Ver todos os serviços e preços
/agendar — Agendar banho ou tosa
/horario — Horário de funcionamento
/localizacao — Endereço e como chegar
/pagamento — Formas de pagamento
/promo — Promoções da semana

📊 *Assistente Interno (Modo Dono):*
/relatorio — Relatório do dia
/analise — Análise de mercado
/oportunidades — Oportunidades de crescimento
/concorrencia — Análise da concorrência
/sugestoes — Sugestões de melhoria

💡 Ou simplesmente me faça uma pergunta!
    `;
    bot.sendMessage(msg.chat.id, welcome, { parse_mode: 'Markdown' });
});

// ── CUSTOMER-FACING ──────────────────────────────────────────

bot.onText(/\/servicos/, (msg) => {
    let text = `🐾 *${PETSHOP.nome} — Tabela de Preços*\n\n`;
    for (const [, s] of Object.entries(PETSHOP.servicos)) {
        text += `▫️ *${s.nome}*\n   💰 ${s.preco} | ⏱ ${s.tempo}\n\n`;
    }
    text += `\n📞 Quer agendar? Use /agendar`;
    bot.sendMessage(msg.chat.id, text, { parse_mode: 'Markdown' });
});

bot.onText(/\/agendar/, (msg) => {
    bot.sendMessage(msg.chat.id, `
📅 *Agendamento Rápido*

Para agendar, me informe:

1️⃣ Nome do pet e raça
2️⃣ Serviço desejado (veja /servicos)
3️⃣ Data e horário de preferência

Ou se preferir, ligue/envie WhatsApp:
📱 ${PETSHOP.whatsapp}

_Respondemos em até 2 minutos!_ ⚡
    `, { parse_mode: 'Markdown' });
});

bot.onText(/\/horario/, (msg) => {
    bot.sendMessage(msg.chat.id, `
🕐 *Horário de Funcionamento*

${PETSHOP.horario}

📍 ${PETSHOP.endereco}
📱 ${PETSHOP.whatsapp}
    `, { parse_mode: 'Markdown' });
});

bot.onText(/\/localizacao/, (msg) => {
    bot.sendMessage(msg.chat.id, `
📍 *${PETSHOP.nome}*

${PETSHOP.endereco}

🗺 _Estamos na avenida principal, ao lado da farmácia._
🅿 Estacionamento gratuito na frente.
📱 ${PETSHOP.whatsapp}
    `, { parse_mode: 'Markdown' });
});

bot.onText(/\/pagamento/, (msg) => {
    bot.sendMessage(msg.chat.id, `
💳 *Formas de Pagamento*

${PETSHOP.pagamento}

✅ Parcelamos em até 3x no cartão
✅ Pix com 5% de desconto
    `, { parse_mode: 'Markdown' });
});

bot.onText(/\/promo/, (msg) => {
    const hoje = new Date();
    const dia = hoje.toLocaleDateString('pt-BR', { weekday: 'long' });
    bot.sendMessage(msg.chat.id, `
🔥 *Promoções da Semana*

🐶 *Banho + Tosa Completa:* ~~R$95~~ por *R$79,90*!
   (Válido para agendamentos ${dia})

🐱 *Combo Gato:* Banho + Tosa Higiênica por *R$55,00*

🎁 *Novos Clientes:* Primeira consulta veterinária com *20% OFF*

📲 Agende agora: ${PETSHOP.whatsapp}
_Promoções válidas até sábado!_
    `, { parse_mode: 'Markdown' });
});

// ── INTERNAL BUSINESS ASSISTANT ──────────────────────────────

bot.onText(/\/relatorio/, (msg) => {
    const hoje = new Date().toLocaleDateString('pt-BR');
    bot.sendMessage(msg.chat.id, `
📊 *RELATÓRIO DIÁRIO — ${hoje}*
━━━━━━━━━━━━━━━━━━━━━━━━━

💰 *Faturamento Médio Diário:* ~R$417
📈 *Ticket Médio:* ${BUSINESS_DATA.ticket_medio}
👥 *Atendimentos/dia:* ${BUSINESS_DATA.clientes_dia}

🏆 *Top Serviços:*
${BUSINESS_DATA.top_servicos}

⏰ *Horários de Pico:*
${BUSINESS_DATA.horario_pico}

💡 *Insight:* Sextas e sábados concentram 35% do
faturamento. Considere promoção às terças para
distribuir melhor o fluxo.
    `, { parse_mode: 'Markdown' });
});

bot.onText(/\/analise/, (msg) => {
    bot.sendMessage(msg.chat.id, `
📊 *ANÁLISE DE MERCADO — PET SHOPS MAUÁ*
━━━━━━━━━━━━━━━━━━━━━━━━━

🏪 *Concorrentes no raio de 2km:* 5 pet shops
📱 *Com Instagram ativo:* 3 de 5 (60%)
🤖 *Com atendimento automático:* 0 de 5 (0%)

💡 *Oportunidade:*
Nenhum concorrente tem atendimento automático.
Ser o PRIMEIRO pet shop com bot = diferencial competitivo.

📈 *Mercado Pet Brasil (2025):*
• Faturamento: R$68 bilhões/ano (+12% vs 2024)
• 67% dos lares têm pelo menos 1 pet
• Gasto médio: R$450/mês por pet

🎯 *Recomendação:*
Investir em presença digital custa <R$10/dia
e pode trazer 6-10 clientes novos/mês (R$300-500+).
    `, { parse_mode: 'Markdown' });
});

bot.onText(/\/oportunidades/, (msg) => {
    let text = `🎯 *OPORTUNIDADES DE CRESCIMENTO*\n━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    BUSINESS_DATA.oportunidades.forEach((o, i) => {
        text += `${i + 1}. ${o}\n`;
    });
    text += `
📋 *Ações Sugeridas:*

1️⃣ Ativar bot WhatsApp → capturar os 8 clientes perdidos
2️⃣ Postar 3x/semana → aumentar alcance em 40%
3️⃣ Plano mensal "Banho Club" → R$149/mês (4 banhos)
   → Se 20 clientes aderirem: R$2.980/mês RECORRENTE extra

💰 *Impacto estimado em 90 dias:* +R$4.500/mês
    `;
    bot.sendMessage(msg.chat.id, text, { parse_mode: 'Markdown' });
});

bot.onText(/\/concorrencia/, (msg) => {
    bot.sendMessage(msg.chat.id, `
🔍 *ANÁLISE COMPETITIVA*
━━━━━━━━━━━━━━━━━━━━━━━━━

| Pet Shop | Instagram | Bot | Delivery |
|----------|-----------|-----|----------|
| Você     | ❌        | ✅*  | ❌       |
| Mari Góis| ✅ 1.2k   | ❌  | ❌       |
| Lili Vet | ✅ 800    | ❌  | ❌       |
| Patativa | ❌        | ❌  | ❌       |
| Cantinho | ✅ 500    | ❌  | ✅       |

_* Você está testando agora!_

💡 *Seu diferencial:*
Com bot ativo, você será o ÚNICO pet shop
da região com atendimento automático 24h.

🎯 *Quick win:*
Criar Instagram + 3 posts/semana + bot =
posição #1 em presença digital na região.
    `, { parse_mode: 'Markdown' });
});

bot.onText(/\/sugestoes/, (msg) => {
    bot.sendMessage(msg.chat.id, `
💡 *SUGESTÕES DE MELHORIA*
━━━━━━━━━━━━━━━━━━━━━━━━━

🔥 *URGENTE (esta semana):*
• Ativar atendimento WhatsApp automático
• Criar perfil no Google Meu Negócio
• Postar 1 foto/vídeo no Instagram

📈 *MÉDIO PRAZO (30 dias):*
• Lançar "Banho Club" (plano mensal)
• Programa de indicação (indique e ganhe 1 banho)
• Parceria com veterinários da região

🚀 *ESTRATÉGICO (90 dias):*
• Pet Delivery (busca e entrega o pet)
• Loja online de produtos pet
• Programa de fidelidade digital

💰 *Investimento:* R$297/mês em marketing digital
📊 *Retorno esperado:* +R$4.500/mês em faturamento
📈 *ROI:* 1.415% em 90 dias
    `, { parse_mode: 'Markdown' });
});

// ── NATURAL LANGUAGE HANDLER ─────────────────────────────────

bot.on('message', (msg) => {
    if (msg.text && msg.text.startsWith('/')) return; // Skip commands

    const text = (msg.text || '').toLowerCase();

    // Customer questions
    if (text.includes('preço') || text.includes('quanto custa') || text.includes('valor')) {
        bot.sendMessage(msg.chat.id, `Claro! Veja nossa tabela completa com /servicos 😊\n\nPrecisa de algo específico? Me diga o porte do pet e o serviço!`);
    } else if (text.includes('banho') || text.includes('tosa')) {
        bot.sendMessage(msg.chat.id, `🐶 *Banho e Tosa*\n\nPeq: R$45 | Méd: R$55 | Grande: R$70\nTosa completa: R$65\nCombo Banho+Tosa: R$95\n\n📅 Quer agendar? Use /agendar`, { parse_mode: 'Markdown' });
    } else if (text.includes('horário') || text.includes('aberto') || text.includes('funciona')) {
        bot.sendMessage(msg.chat.id, `🕐 ${PETSHOP.horario}\n📍 ${PETSHOP.endereco}`);
    } else if (text.includes('vacina')) {
        bot.sendMessage(msg.chat.id, `💉 *Vacinação*\n\nV8/V10: R$90 | Antirrábica: R$70\nConsulta + vacina: R$180 (desconto de R$30!)\n\n📅 Agende pelo /agendar`, { parse_mode: 'Markdown' });
    } else if (text.includes('emergência') || text.includes('urgente') || text.includes('urgência')) {
        bot.sendMessage(msg.chat.id, `🚨 *Emergência?*\n\nLigue agora: ${PETSHOP.whatsapp}\nEstamos atendendo de: ${PETSHOP.horario}\n\n_Se for fora do horário, leve ao hospital veterinário mais próximo._`, { parse_mode: 'Markdown' });
    } else {
        bot.sendMessage(msg.chat.id, `Obrigado pela mensagem! 😊\n\nPosso te ajudar com:\n• /servicos — Ver preços\n• /agendar — Marcar horário\n• /promo — Promoções da semana\n\nOu fale diretamente pelo WhatsApp: ${PETSHOP.whatsapp}`);
    }
});

// ─────────────────────────────────────────────────────────────
// STARTUP
// ─────────────────────────────────────────────────────────────
console.log('╔══════════════════════════════════════════════════════╗');
console.log('║  🐾 PET SHOP DEMO BOT — Ready!                     ║');
console.log('║  Dual Mode: Atendimento + Business Assistant        ║');
console.log('╚══════════════════════════════════════════════════════╝');
console.log(`  Bot: @${TOKEN.split(':')[0]}...`);
console.log('  Status: Polling for messages...\n');

bot.on('polling_error', (err) => {
    console.error('Polling error:', err.message);
});
