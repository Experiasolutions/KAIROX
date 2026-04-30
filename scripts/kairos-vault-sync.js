#!/usr/bin/env node
/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║  KAIROS VAULT SYNC — Sincronização Nativa de Cofre      ║
 * ║  Substitui: Remotely Save (plugin externo)              ║
 * ║  Engine: Supabase Storage SDK (JS)                      ║
 * ║  Modelo: Bidirecional com resolução por timestamp       ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * Uso:
 *   npm run sync:vault
 *   npm run sync:vault -- --dry-run
 *   npm run sync:vault -- --direction=up
 *   npm run sync:vault -- --direction=down
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// ═══════════════════════════════════════════════
// CONFIGURAÇÃO
// ═══════════════════════════════════════════════

const CONFIG = {
  // Supabase — via variáveis de ambiente (nunca hardcoded)
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  bucket: 'obsidian-vaults',
  // Prefixo dentro do bucket (para isolar múltiplos vaults)
  remotePrefix: 'oh-yeah/',

  // Local — via variável de ambiente (nunca hardcoded)
  vaultPath: process.env.KAIROS_VAULT_PATH || 'C:\\Users\\GABS\\Documents\\My KAIROS\\vault',

  // Pastas/arquivos a ignorar
  ignore: [
    '.git',
    '.obsidian',
    'node_modules',
    '.trash',
    '.DS_Store',
    'Thumbs.db',
    '.gitignore',
    '.smart-env',
    'copilot',
  ],

  // Extensões permitidas (vazio = tudo menos ignoradas)
  allowedExtensions: [],

  // Limites
  maxFileSizeMB: 50,
  batchSize: 10,
};

// ═══════════════════════════════════════════════
// PARSE CLI ARGS
// ═══════════════════════════════════════════════

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const DIRECTION = (() => {
  const dirArg = args.find(a => a.startsWith('--direction='));
  if (dirArg) return dirArg.split('=')[1]; // 'up', 'down', 'both'
  return 'both';
})();
const VERBOSE = args.includes('--verbose') || args.includes('-v');

// ═══════════════════════════════════════════════
// SUPABASE CLIENT (via SDK)
// ═══════════════════════════════════════════════

let supabase;

function initSupabase() {
  try {
    const { createClient } = require('@supabase/supabase-js');
    supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey, {
      auth: { persistSession: false },
    });
    return true;
  } catch (err) {
    console.error('❌ Falha ao inicializar Supabase SDK:', err.message);
    console.error('   Execute: npm install @supabase/supabase-js');
    return false;
  }
}

// ═══════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════

function shouldIgnore(relativePath) {
  const parts = relativePath.split(path.sep);
  return parts.some(part => CONFIG.ignore.includes(part));
}

function md5(buffer) {
  return crypto.createHash('md5').update(buffer).digest('hex');
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function sanitizeForStorage(str) {
  // Supabase Storage não aceita caracteres não-ASCII nas keys.
  // Remove diacríticos via NFD decomposition e substitui chars restantes.
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // Remove combining diacritical marks
    .replace(/[^a-zA-Z0-9_\-./\s]/g, '_');  // Substitui qualquer char especial restante
}

function toRemotePath(relativePath) {
  // Normaliza para forward slashes e sanitiza para o Supabase Storage
  const normalized = relativePath.split(path.sep).join('/');
  return CONFIG.remotePrefix + sanitizeForStorage(normalized);
}

function fromRemotePath(remotePath) {
  // Remove o prefixo e converte de volta a path local
  const stripped = remotePath.startsWith(CONFIG.remotePrefix)
    ? remotePath.slice(CONFIG.remotePrefix.length)
    : remotePath;
  return stripped.split('/').join(path.sep);
}

// ═══════════════════════════════════════════════
// SCANNER LOCAL — Varre o vault recursivamente
// ═══════════════════════════════════════════════

function scanLocalVault(dir, base = dir) {
  const results = [];
  let entries;

  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (err) {
    console.warn(`⚠️  Não foi possível ler: ${dir} — ${err.message}`);
    return results;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(base, fullPath);

    if (shouldIgnore(relativePath)) continue;

    if (entry.isDirectory()) {
      results.push(...scanLocalVault(fullPath, base));
    } else if (entry.isFile()) {
      const stats = fs.statSync(fullPath);
      const maxBytes = CONFIG.maxFileSizeMB * 1024 * 1024;
      if (stats.size > maxBytes) {
        if (VERBOSE) console.log(`  [skip] ${relativePath} (${formatBytes(stats.size)} > ${CONFIG.maxFileSizeMB}MB)`);
        continue;
      }
      if (CONFIG.allowedExtensions.length > 0) {
        const ext = path.extname(entry.name).toLowerCase();
        if (!CONFIG.allowedExtensions.includes(ext)) continue;
      }
      results.push({
        relativePath,
        fullPath,
        size: stats.size,
        mtime: stats.mtimeMs,
        mtimeISO: stats.mtime.toISOString(),
      });
    }
  }

  return results;
}

// ═══════════════════════════════════════════════
// SCANNER REMOTO — Lista todos os objetos no bucket
// ═══════════════════════════════════════════════

async function scanRemoteBucket() {
  const results = [];
  let offset = 0;
  const limit = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase.storage
      .from(CONFIG.bucket)
      .list(CONFIG.remotePrefix.replace(/\/$/, ''), {
        limit,
        offset,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (error) {
      console.error(`❌ Erro ao listar bucket remoto: ${error.message}`);
      return results;
    }

    if (!data || data.length === 0) {
      hasMore = false;
      break;
    }

    for (const item of data) {
      if (item.id && item.metadata) {
        const timestamp = item.updated_at || item.created_at || new Date().toISOString();
        const lastModifiedMs = new Date(timestamp).getTime() || Date.now();
        results.push({
          remotePath: CONFIG.remotePrefix + item.name,
          relativePath: item.name,
          size: item.metadata?.size || 0,
          lastModified: timestamp,
          lastModifiedMs,
        });
      }
    }

    offset += data.length;
    if (data.length < limit) hasMore = false;
  }

  return results;
}

// Versão recursiva para listar todos os arquivos em subpastas
async function scanRemoteBucketRecursive(prefix = '') {
  const results = [];
  const folderPath = CONFIG.remotePrefix.replace(/\/$/, '') + (prefix ? '/' + prefix : '');

  const { data, error } = await supabase.storage
    .from(CONFIG.bucket)
    .list(folderPath, {
      limit: 1000,
      sortBy: { column: 'name', order: 'asc' },
    });

  if (error) {
    console.error(`❌ Erro ao listar pasta remota "${folderPath}": ${error.message}`);
    return results;
  }

  if (!data) return results;

  for (const item of data) {
    const itemRelPath = prefix ? prefix + '/' + item.name : item.name;

    if (item.id && !item.metadata) {
      // É uma pasta — recursar
      const subResults = await scanRemoteBucketRecursive(itemRelPath);
      results.push(...subResults);
    } else if (item.id && item.metadata) {
      // É um arquivo
      results.push({
        remotePath: folderPath + '/' + item.name,
        relativePath: itemRelPath,
        size: item.metadata?.size || 0,
        lastModified: item.updated_at || item.created_at,
        lastModifiedMs: new Date(item.updated_at || item.created_at).getTime(),
      });
    }
  }

  return results;
}

// ═══════════════════════════════════════════════
// UPLOAD — Local → Remoto
// ═══════════════════════════════════════════════

async function uploadFile(localFile) {
  const remotePath = toRemotePath(localFile.relativePath);
  const fileBuffer = fs.readFileSync(localFile.fullPath);

  const { error } = await supabase.storage
    .from(CONFIG.bucket)
    .upload(remotePath, fileBuffer, {
      upsert: true,
      contentType: 'application/octet-stream',
    });

  if (error) {
    console.error(`  ❌ Upload falhou: ${localFile.relativePath} — ${error.message}`);
    return false;
  }

  return true;
}

// ═══════════════════════════════════════════════
// DOWNLOAD — Remoto → Local
// ═══════════════════════════════════════════════

async function downloadFile(remoteFile) {
  // Security: sanitize path and prevent traversal
  const sanitizedRelPath = path.normalize(remoteFile.relativePath)
    .replace(/^(\.\.(\/|\\))+/g, '')  // Remove leading ../
    .replace(/[:?*<>|"]/g, '_');       // Remove invalid Windows chars
  const localPath = path.join(CONFIG.vaultPath, sanitizedRelPath.split('/').join(path.sep));
  
  // Validate resolved path is within vaultPath
  const resolvedLocal = path.resolve(localPath);
  const resolvedVault = path.resolve(CONFIG.vaultPath);
  if (!resolvedLocal.startsWith(resolvedVault)) {
    console.error(`  ❌ Security: Path traversal blocked for ${remoteFile.relativePath}`);
    return false;
  }

  const { data, error } = await supabase.storage
    .from(CONFIG.bucket)
    .download(remoteFile.remotePath);

  if (error) {
    console.error(`  ❌ Download falhou: ${remoteFile.relativePath} — ${error.message}`);
    return false;
  }

  // Garantir que o diretório pai existe
  const dir = path.dirname(localPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const buffer = Buffer.from(await data.arrayBuffer());
  fs.writeFileSync(localPath, buffer);
  return true;
}

// ═══════════════════════════════════════════════
// MOTOR DE SINCRONIZAÇÃO BIDIRECIONAL
// ═══════════════════════════════════════════════

async function syncEngine() {
  const startTime = Date.now();

  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║     🔄 KAIROS VAULT SYNC — Engine v1.0          ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log();

  if (DRY_RUN) console.log('🧪 MODO DRY-RUN — Nenhuma alteração será feita.\n');
  console.log(`📂 Cofre Local : ${CONFIG.vaultPath}`);
  console.log(`☁️  Bucket      : ${CONFIG.bucket}/${CONFIG.remotePrefix}`);
  console.log(`🔀 Direção     : ${DIRECTION}`);
  console.log();

  // Validar vault local existe
  if (!fs.existsSync(CONFIG.vaultPath)) {
    console.error(`❌ Cofre local não encontrado: ${CONFIG.vaultPath}`);
    console.error('   Verifique CONFIG.vaultPath no script.');
    process.exit(1);
  }

  // Validar credenciais
  if (!CONFIG.supabaseKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada no .env');
    process.exit(1);
  }

  // 1. Escanear local
  console.log('📡 [1/4] Escaneando cofre local...');
  const localFiles = scanLocalVault(CONFIG.vaultPath);
  console.log(`   → ${localFiles.length} arquivos encontrados localmente\n`);

  // 2. Escanear remoto
  console.log('☁️  [2/4] Escaneando bucket remoto...');
  const remoteFiles = await scanRemoteBucketRecursive();
  console.log(`   → ${remoteFiles.length} arquivos encontrados no Supabase\n`);

  // 3. Construir mapa de reconciliação
  const localMap = new Map();
  for (const f of localFiles) {
    localMap.set(f.relativePath.split(path.sep).join('/'), f);
  }

  const remoteMap = new Map();
  for (const f of remoteFiles) {
    remoteMap.set(f.relativePath, f);
  }

  const toUpload = [];
  const toDownload = [];
  const inSync = [];

  // 4. Decidir ações
  console.log('🧠 [3/4] Calculando diferenças...\n');

  // Check local → remote (uploads)
  if (DIRECTION === 'both' || DIRECTION === 'up') {
    for (const [relPath, localFile] of localMap) {
      const remoteFile = remoteMap.get(relPath);
      if (!remoteFile) {
        // Arquivo novo local, não existe no remoto
        toUpload.push({ localFile, reason: 'NOVO' });
      } else if (localFile.mtime > remoteFile.lastModifiedMs + 1000) {
        // Local é mais recente (margem de 1s)
        toUpload.push({ localFile, reason: 'ATUALIZADO' });
      } else {
        inSync.push(relPath);
      }
    }
  }

  // Check remote → local (downloads)
  if (DIRECTION === 'both' || DIRECTION === 'down') {
    for (const [relPath, remoteFile] of remoteMap) {
      const localFile = localMap.get(relPath);
      if (!localFile) {
        // Arquivo existe no remoto mas não no local
        toDownload.push({ remoteFile, reason: 'NOVO' });
      } else if (remoteFile.lastModifiedMs > localFile.mtime + 1000) {
        // Remoto é mais recente
        if (!toUpload.find(u => u.localFile.relativePath.split(path.sep).join('/') === relPath)) {
          toDownload.push({ remoteFile, reason: 'ATUALIZADO' });
        }
      }
    }
  }

  // Relatório
  console.log('┌──────────────────────────────────────────────────┐');
  console.log(`│  📊 Relatório de Sincronização                   │`);
  console.log('├──────────────────────────────────────────────────┤');
  console.log(`│  ⬆️  Upload  (local → nuvem) : ${String(toUpload.length).padStart(5)}            │`);
  console.log(`│  ⬇️  Download (nuvem → local) : ${String(toDownload.length).padStart(5)}            │`);
  console.log(`│  ✅ Em sincronia              : ${String(inSync.length).padStart(5)}            │`);
  console.log('└──────────────────────────────────────────────────┘');
  console.log();

  if (VERBOSE) {
    if (toUpload.length > 0) {
      console.log('  ⬆️  Arquivos para upload:');
      toUpload.forEach(u => console.log(`     [${u.reason}] ${u.localFile.relativePath}`));
      console.log();
    }
    if (toDownload.length > 0) {
      console.log('  ⬇️  Arquivos para download:');
      toDownload.forEach(d => console.log(`     [${d.reason}] ${d.remoteFile.relativePath}`));
      console.log();
    }
  }

  if (toUpload.length === 0 && toDownload.length === 0) {
    console.log('✨ Tudo sincronizado! Nenhuma ação necessária.\n');
    return;
  }

  if (DRY_RUN) {
    console.log('🧪 Dry-run completo. Use sem --dry-run para executar.\n');
    return;
  }

  // 5. Executar sincronização
  console.log('🚀 [4/4] Executando sincronização...\n');

  let uploadOk = 0, uploadFail = 0;
  let downloadOk = 0, downloadFail = 0;

  // Uploads em batches
  if (toUpload.length > 0) {
    console.log(`  ⬆️  Fazendo upload de ${toUpload.length} arquivo(s)...`);
    for (let i = 0; i < toUpload.length; i += CONFIG.batchSize) {
      const batch = toUpload.slice(i, i + CONFIG.batchSize);
      const results = await Promise.allSettled(
        batch.map(u => uploadFile(u.localFile))
      );
      for (const r of results) {
        if (r.status === 'fulfilled' && r.value) uploadOk++;
        else uploadFail++;
      }
      process.stdout.write(`\r     Progresso: ${Math.min(i + CONFIG.batchSize, toUpload.length)}/${toUpload.length}`);
    }
    console.log('\n');
  }

  // Downloads em batches
  if (toDownload.length > 0) {
    console.log(`  ⬇️  Baixando ${toDownload.length} arquivo(s)...`);
    for (let i = 0; i < toDownload.length; i += CONFIG.batchSize) {
      const batch = toDownload.slice(i, i + CONFIG.batchSize);
      const results = await Promise.allSettled(
        batch.map(d => downloadFile(d.remoteFile))
      );
      for (const r of results) {
        if (r.status === 'fulfilled' && r.value) downloadOk++;
        else downloadFail++;
      }
      process.stdout.write(`\r     Progresso: ${Math.min(i + CONFIG.batchSize, toDownload.length)}/${toDownload.length}`);
    }
    console.log('\n');
  }

  // Resultado final
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║     ✅ KAIROS VAULT SYNC — Concluído            ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  ⬆️  Uploads    : ${uploadOk} ok / ${uploadFail} falha(s)`.padEnd(51) + '║');
  console.log(`║  ⬇️  Downloads  : ${downloadOk} ok / ${downloadFail} falha(s)`.padEnd(51) + '║');
  console.log(`║  ⏱️  Tempo      : ${elapsed}s`.padEnd(51) + '║');
  console.log('╚══════════════════════════════════════════════════╝');
}

// ═══════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════

(async () => {
  if (!initSupabase()) process.exit(1);

  try {
    await syncEngine();
  } catch (err) {
    console.error('\n💥 Erro fatal durante sincronização:', err.message);
    if (VERBOSE) console.error(err.stack);
    process.exit(1);
  }
})();
