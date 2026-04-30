import fs from 'fs';
import path from 'path';

const keysMdPath = 'C:\\Users\\GABS\\Documents\\Haha²\\Pool\\Keys.md';
const envPath = 'C:\\Users\\GABS\\Documents\\My KAIROS\\.env';

const keysMd = fs.readFileSync(keysMdPath, 'utf8');

const groqKeys = [...keysMd.matchAll(/gsk_[a-zA-Z0-9]{51}/g)].map(m => m[0]);
const geminiKeys = [...keysMd.matchAll(/AIzaSy[a-zA-Z0-9_-]{33}/g)].map(m => m[0]);
const togetherKeys = [...keysMd.matchAll(/(tgp_v1_[a-zA-Z0-9_-]{38}|key_[a-zA-Z0-9]{21})/g)].map(m => m[0]);
// sambanova is UUID format: 8-4-4-4-12
const smbKeys = [...keysMd.matchAll(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g)].map(m => m[0]);
const orKeys = [...keysMd.matchAll(/sk-or-v1-[a-f0-9]{64}/g)].map(m => m[0]);
const cerKeys = [...keysMd.matchAll(/csk-[a-z0-9]{48}/g)].map(m => m[0]);

let envContent = fs.readFileSync(envPath, 'utf8');

function replaceOrAdd(envStr, keyName, valueArray) {
  if (valueArray.length === 0) return envStr;
  const single = valueArray[0];
  const list = valueArray.join(',');
  
  // replace single
  const singleRegex = new RegExp(`^${keyName}_KEY=.*$`, 'm');
  if (envStr.match(singleRegex)) {
    envStr = envStr.replace(singleRegex, `${keyName}_KEY=${single}`);
  } else {
    envStr += `\n${keyName}_KEY=${single}`;
  }
  
  // replace list
  const listRegex = new RegExp(`^${keyName}_KEYS=.*$`, 'm');
  if (listRegex) {
    if (envStr.match(listRegex)) {
      envStr = envStr.replace(listRegex, `${keyName}_KEYS=${list}`);
    } else {
      envStr += `\n${keyName}_KEYS=${list}`;
    }
  }
  return envStr;
}

envContent = replaceOrAdd(envContent, 'GROQ_API', groqKeys);
envContent = replaceOrAdd(envContent, 'GEMINI_API', geminiKeys);
// note google uses GOOGLE_API_KEYS for list and GEMINI_API_KEY for single
envContent = replaceOrAdd(envContent, 'TOGETHER_API', togetherKeys);
envContent = replaceOrAdd(envContent, 'OPENROUTER_API', orKeys);
envContent = replaceOrAdd(envContent, 'SAMBANOVA_API', smbKeys);
envContent = replaceOrAdd(envContent, 'CEREBRAS_API', cerKeys);

fs.writeFileSync(envPath, envContent);

console.log(`Updated .env with:
  Groq: ${groqKeys.length}
  Gemini: ${geminiKeys.length}
  Together: ${togetherKeys.length}
  SambaNova: ${smbKeys.length}
  OpenRouter: ${orKeys.length}
  Cerebras: ${cerKeys.length}
`);
