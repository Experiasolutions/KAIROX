/**
 * @module email-client
 * @version 1.0.0
 * @purpose Send HTML emails via Gmail SMTP using nodemailer.
 *          Supports direct send and test mode.
 * @inputs  CLI flags (--send to/subject/body, --test)
 * @outputs Sent email + console confirmation with MessageID
 * @dependencies nodemailer, .env (EMAIL_USER, EMAIL_PASS)
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createTransport } = require('nodemailer');

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

if (!EMAIL_USER || !EMAIL_PASS) {
  console.log('❌ EMAIL_USER e/ou EMAIL_PASS não encontrados no .env');
  console.log('');
  console.log('  📝 Como configurar Gmail:');
  console.log('  1. Ative 2-Step Verification na conta Google');
  console.log('  2. Acesse: https://myaccount.google.com/apppasswords');
  console.log('  3. Crie uma App Password para "Mail"');
  console.log('  4. Cole no .env:');
  console.log('     EMAIL_USER=seu@gmail.com');
  console.log('     EMAIL_PASS=xxxx xxxx xxxx xxxx');
  process.exit(1);
}

const transporter = createTransport({
  service: 'gmail',
  auth: { user: EMAIL_USER, pass: EMAIL_PASS },
});

async function sendEmail(to, subject, body) {
  const info = await transporter.sendMail({
    from: `AIOS Orion <${EMAIL_USER}>`,
    to,
    subject: `[AIOS] ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="color: white; margin: 0;">👑 AIOS Orion</h2>
          <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0 0; font-size: 14px;">Sistema Autônomo de Inteligência Operacional</p>
        </div>
        <div style="padding: 20px; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px;">
          ${body}
        </div>
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 10px;">
          Enviado automaticamente pelo AIOS v5.0 JARVIS — ${new Date().toLocaleString('pt-BR')}
        </p>
      </div>
    `,
  });
  console.log(`\n✅ Email enviado!`);
  console.log(`  Para: ${to}`);
  console.log(`  Assunto: [AIOS] ${subject}`);
  console.log(`  MessageID: ${info.messageId}`);
}

async function main() {
  const args = process.argv.slice(2);
  try {
    if (args[0] === '--send') {
      await sendEmail(args[1], args[2], args[3]);
    } else if (args[0] === '--test') {
      await sendEmail(EMAIL_USER, 'Teste AIOS', '<h3>🎉 Conexão AIOS → Email funcionando!</h3><p>Este email foi enviado pelo AIOS v5.0 JARVIS.</p>');
    } else {
      console.log('AIOS Email Client');
      console.log('  --send "email" "assunto" "corpo_html"   Enviar email');
      console.log('  --test                                  Email de teste');
    }
  } catch (err) {
    console.log(`❌ Erro: ${err.message}`);
  }
}

main();
