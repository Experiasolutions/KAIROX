const chokidar = require('chokidar');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const os = require('os');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

console.log("=========================================================");
console.log("🐉 KAIROS CLOUD SYNC DAEMON (KCS) V1.0");
console.log("=========================================================");

// 1. Configurações
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Usamos a Role administrativa para burlar RLS e ter poder total

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ ERRO FATAL: Chaves do Supabase não encontradas no .env");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Identificador exclusivo desta máquina (Ex: "DESKTOP-PC-XXXX")
const NODE_ID = os.hostname();
const VAULT_PATH = path.resolve("C:\\Users\\maymo\\OneDrive\\Documentos\\Oh yeah");
console.log(`[i] Node ID da Hydra: ${NODE_ID}`);
console.log(`[i] Observando Cofre: ${VAULT_PATH}`);

// Variável para evitar loops infinitos (O próprio download não deve disparar o chokidar_upload)
const isDownloading = new Set();

// 2. Chokidar Watcher (Monitoramento Local)
const watcher = chokidar.watch(path.join(VAULT_PATH, '**/*.md'), {
    ignored: /(^|[\/\\])\../, // Ignora dotfiles como .obsidian
    persistent: true,
    ignoreInitial: true // Não tenta subir 1000 notas ao ligar, só as mudanças e novas adições. (Para initial sync faremos um script depois)
});

// Ação de Upload (Modificado Localmente ou Novo)
async function syncToCloud(filePath) {
    if (isDownloading.has(filePath)) {
        // Ignora evento se foi o próprio script que baixou da nuvem agora mesmo
        return;
    }

    try {
        const relativePath = path.relative(VAULT_PATH, filePath).replace(/\\/g, '/');
        const content = fs.readFileSync(filePath, 'utf8');

        // Upsert para o Database
        const { error } = await supabase
            .from('kairos_brain_notes')
            .upsert({
                vault_path: relativePath,
                content: content,
                source_node_id: NODE_ID,
                updated_at: new Date().toISOString()
            });

        if (error) throw error;
        console.log(`[+] ☁️ KCS Uploaded: ${relativePath}`);

        // DISPARO DE AGENTES PARA TASK BOARD!
        // Se houver uma flag #triage ou #kairos, podemos emitir pro Event Bus.
        if (content.includes('#triage') || content.includes('#kairos')) {
            console.log(`[!] Tag Inteligente Detectada em (${relativePath}). Acordando AIOS via EventBus...`);
            // Exemplo de integração futura com os PINGs do Agente Jarvis
            await supabase.from('kairos_event_bus').insert({
                event_type: 'vault_triage',
                payload: { path: relativePath, node: NODE_ID }
            });
        }
    } catch (err) {
        console.error(`[X] Falha no Upload de ${filePath}:`, err.message);
    }
}

// 3. Supabase Realtime (Escuta Silenciosa do outro nó da HYDRA)
supabase
  .channel('kairos-brain-sync')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'kairos_brain_notes' }, payload => {
    // Pegamos a nota
    const note = payload.new;
    if (!note) return;

    // Se o evento foi disparado pela nossa própria máquina, ignoramos (evita eco).
    if (note.source_node_id === NODE_ID) return;

    console.log(`[v] ⬇️ Mudança na Nuvem detectada de (${note.source_node_id}): ${note.vault_path}`);

    // Escrever no disco local (Obsidian renderiza na hora)
    const absolutePath = path.join(VAULT_PATH, note.vault_path);
    const targetDir = path.dirname(absolutePath);

    try {
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        // Marcar lock para o Chokidar não subir de volta e criar loop infinito
        isDownloading.add(absolutePath);
        
        fs.writeFileSync(absolutePath, note.content, 'utf8');
        console.log(`[+] 🔄 Arquivo atualizado invisivelmente no Cofre Local.`);
        
        // Remove lock depois de 2 segundos (tempo pro Chokidar ignorar o evento)
        setTimeout(() => isDownloading.delete(absolutePath), 2000);

    } catch (err) {
        console.error(`[X] Falha no Download de ${note.vault_path}:`, err.message);
        isDownloading.delete(absolutePath);
    }
  })
  .subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log("[i] Escuta em Tempo Real WebSockets ATIVADA com sucesso!");
      console.log("[i] Cérebro em constante sincronia entre as cabeças da Hydra.");
    }
  });

// Setup Watcher Triggers
watcher
    .on('add', filePath => syncToCloud(filePath))
    .on('change', filePath => syncToCloud(filePath))
    .on('error', error => console.error(`[X] Erro no Watcher (Chokidar): ${error}`));
