import { Telegraf } from 'telegraf';
import 'dotenv/config';
import { getUserStats, getTodayQuests, completeDailyQuest } from '@kairox/apex-conductor';

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error("TELEGRAM_BOT_TOKEN is missing in .env");
  process.exit(1);
}

const bot = new Telegraf(token);

bot.start((ctx) => {
  const stats = getUserStats();
  ctx.reply(`🐉 *Bem-vindo ao KAIROS GABLAB Bridge!*\n\n👑 *Rank:* ${stats.rank_title} (Nível ${stats.level})\n⚔️ *XP:* ${stats.current_xp}/1000\n🔥 *Ofensiva:* ${stats.current_streak} dias\n\nUse /quests para ver suas missões do dia!`, { parse_mode: 'Markdown' });
});

bot.command('quests', (ctx) => {
  const quests = getTodayQuests();
  let msg = `📋 *Daily Board (Hoje)*\n\n`;
  msg += `🟢 *Easy (10 XP):* ${quests.easy.title || 'Não definida'} ${quests.easy.completed ? '✅' : '❌'}\n`;
  msg += `🔵 *Medium (25 XP):* ${quests.medium.title || 'Não definida'} ${quests.medium.completed ? '✅' : '❌'}\n`;
  msg += `🔴 *Hard (50 XP):* ${quests.hard.title || 'Não definida'} ${quests.hard.completed ? '✅' : '❌'}\n\n`;
  
  if (quests.combo_completed) {
      msg += `🏆 *COMBO BONUS OBTIDO! (+50 XP)*`;
  }
  
  ctx.reply(msg, { parse_mode: 'Markdown' });
});

bot.command('complete', (ctx) => {
    const args = ctx.message.text.split(' ');
    if (args.length < 2) {
        return ctx.reply("Uso: /complete [easy|medium|hard]");
    }
    const diff = args[1].toLowerCase();
    if (['easy', 'medium', 'hard'].includes(diff)) {
        completeDailyQuest(diff);
        const stats = getUserStats();
        ctx.reply(`✅ Missão ${diff.toUpperCase()} concluída!\nSeu XP atual: ${stats.current_xp}/1000 (Nível ${stats.level})`);
    } else {
        ctx.reply("Dificuldade inválida. Use easy, medium ou hard.");
    }
});

// Any other message goes to Hermes (Mocked until Hermes integration is fully done)
bot.on('text', (ctx) => {
   if (ctx.message.text.startsWith('/')) return;
   
   ctx.reply(`🤖 [Hermes Agent intercept] Processando sua mensagem: "${ctx.message.text}"\n\n*Nota:* O nó do Hermes está sincronizando. Assim que a rede neural subir, responderei autonomamente aqui!`, { parse_mode: 'Markdown' });
});

bot.launch().then(() => {
    console.log("KAIROS Telegram Bridge rodando!");
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
