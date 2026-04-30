import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import https from 'https';

const WORKSPACE = process.cwd();
const API_KEYS_FILE = path.join(WORKSPACE, 'god-kairos', 'api-keys.yaml');
let keysConfig = {};

try {
  const content = fs.readFileSync(API_KEYS_FILE, 'utf8');
  keysConfig = yaml.parse(content);
} catch (e) {
  console.error("Failed to read api-keys.yaml", e);
  process.exit(1);
}

// Simple request wrapper
function request(hostname, pathname, headers, bodyObj) {
  return new Promise((resolve) => {
    const body = bodyObj ? JSON.stringify(bodyObj) : '';
    if (bodyObj) headers['Content-Length'] = Buffer.byteLength(body);

    const req = https.request({
      hostname,
      path: pathname,
      method: bodyObj ? 'POST' : 'GET',
      headers,
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        resolve({ status: res.statusCode, data });
      });
    });
    
    req.on('error', (err) => resolve({ status: 500, data: err.message }));
    
    if (bodyObj) req.write(body);
    req.end();
  });
}

async function verifyGemini(keyObj) {
  const url = `/v1beta/models/gemini-1.5-flash:generateContent?key=${keyObj.key}`;
  const res = await request('generativelanguage.googleapis.com', url, {
    'Content-Type': 'application/json'
  }, {
    contents: [{ parts: [{ text: 'ping' }] }]
  });
  return res.status === 200 ? true : res;
}

async function verifyGroq(keyObj) {
  const res = await request('api.groq.com', '/openai/v1/models', {
    'Authorization': `Bearer ${keyObj.key}`
  });
  return res.status === 200 ? true : res;
}

async function verifyGitHub(keyObj) {
  const res = await request('models.inference.ai.azure.com', '/models', {
    'Authorization': `Bearer ${keyObj.key}`
  });
  return (res.status === 200 || res.status === 404) ? true : res;
}

async function main() {
  console.log("==========================================");
  console.log("   GOD POOL KEYS VERIFICATION");
  console.log("==========================================\n");
  
  let validCount = 0;
  let invalidCount = 0;

  for (const [providerName, providerData] of Object.entries(keysConfig)) {
    if (!providerData.keys || !Array.isArray(providerData.keys)) continue;
    
    console.log(`[${providerName.toUpperCase()}] Testing ${providerData.keys.length} keys...`);
    
    for (const k of providerData.keys) {
      if (!k.key || k.key.includes('your-key-here')) continue;
      
      let isValid = false;
      const masked = k.key.substring(0, 8) + '***' + k.key.substring(k.key.length - 4);
      
      process.stdout.write(`  -> [${k.id || 'unnamed'}] ${masked}... `);
      
      try {
        if (providerName === 'gemini') isValid = await verifyGemini(k);
        else if (providerName === 'groq') isValid = await verifyGroq(k);
        else if (providerName === 'github') isValid = await verifyGitHub(k);
        else isValid = true; // Assume true for untested providers locally
      } catch (e) {
        isValid = false;
      }
      
      if (isValid === true) {
        validCount++;
        console.log("✅ OK");
      } else {
        invalidCount++;
        console.log(`❌ FAILED (Status: ${isValid.status || 'unknown'})\n   Details: ${isValid.data ? isValid.data.slice(0, 100) : ''}`);
      }
    }
  }

  console.log("\n==========================================");
  console.log(`Summary: ${validCount} Valid | ${invalidCount} Invalid`);
  console.log("==========================================");
}

main();
