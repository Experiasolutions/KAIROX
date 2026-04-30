import fs from 'fs';
import path from 'path';

const integrationsDir = 'C:\\Users\\GABS\\Documents\\My KAIROS\\configs\\integrations';
const files = fs.readdirSync(integrationsDir).filter(f => f.endsWith('.json'));

console.log('🔱 KAIROX INTEGRATIONS STATUS\n');

for (const file of files) {
  const content = JSON.parse(fs.readFileSync(path.join(integrationsDir, file), 'utf8'));
  const status = content.status.toUpperCase();
  const icon = status === 'ACTIVE' ? '✅' : '⏳';
  console.log(`${icon} [${content.name.toUpperCase()}] status: ${status}`);
  console.log(`   Purpose: ${content.purpose}`);
  if (content.activation && content.activation.verify) {
    console.log(`   Verify via: ${content.activation.verify}`);
  }
  console.log('');
}

// Special check for OpenClaw Skills
const lockPath = 'C:\\Users\\GABS\\Documents\\My KAIROS\\.clawhub\\lock.json';
if (fs.existsSync(lockPath)) {
  const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
  console.log('💎 OPENCLAW SKILLS (Cached in .clawhub)');
  for (const [name, data] of Object.entries(lock.skills)) {
    console.log(`   - ${name} (v${data.version}) installed at ${new Date(data.installedAt).toLocaleString()}`);
  }
}
