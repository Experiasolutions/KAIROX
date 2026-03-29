/**
 * @module memory-system
 * @version 1.0.0
 * @purpose Persistent memory layer for AIOS. Stores, searches, and retrieves
 *          memories in JSON with keyword-based relevance scoring.
 * @inputs  Category + content string (API) or CLI commands
 * @outputs Stored memory objects { id, category, content, metadata, timestamp, tags }
 * @exports { store, search, recent, byCategory, stats, getContext, CATEGORIES }
 * @dependencies None (standalone, file-based storage)
 */

const fs = require('fs');
const path = require('path');

const MEMORY_FILE = path.join(__dirname, '..', 'data', 'memory.json');
const CATEGORIES = ['decisions', 'interactions', 'metrics', 'context', 'knowledge', 'alerts'];
const MAX_MEMORIES = 10000;

// ── Init ─────────────────────────────────────────────────────
function ensureDataDir() {
    const dir = path.dirname(MEMORY_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(MEMORY_FILE)) {
        fs.writeFileSync(MEMORY_FILE, JSON.stringify({
            version: '1.0',
            created: new Date().toISOString(),
            memories: [],
        }, null, 2));
    }
}

function loadMemories() {
    ensureDataDir();
    return JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));
}

function saveMemories(data) {
    ensureDataDir();
    // Trim to max size
    if (data.memories.length > MAX_MEMORIES) {
        data.memories = data.memories.slice(-MAX_MEMORIES);
    }
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(data, null, 2));
}

// ── Core API ─────────────────────────────────────────────────
function store(category, content, metadata = {}) {
    if (!CATEGORIES.includes(category)) {
        throw new Error(`Categoria inválida. Use: ${CATEGORIES.join(', ')}`);
    }
    const data = loadMemories();
    const memory = {
        id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        category,
        content,
        metadata,
        timestamp: new Date().toISOString(),
        tags: extractTags(content),
    };
    data.memories.push(memory);
    saveMemories(data);
    return memory;
}

function search(query, limit = 20) {
    const data = loadMemories();
    const lower = query.toLowerCase();
    const results = data.memories
        .filter(m =>
            m.content.toLowerCase().includes(lower) ||
            m.tags.some(t => t.includes(lower)) ||
            JSON.stringify(m.metadata).toLowerCase().includes(lower)
        )
        .reverse() // Most recent first
        .slice(0, limit);
    return results;
}

function recent(limit = 10) {
    const data = loadMemories();
    return data.memories.slice(-limit).reverse();
}

function byCategory(category, limit = 50) {
    const data = loadMemories();
    return data.memories
        .filter(m => m.category === category)
        .reverse()
        .slice(0, limit);
}

function stats() {
    const data = loadMemories();
    const cats = {};
    for (const m of data.memories) {
        cats[m.category] = (cats[m.category] || 0) + 1;
    }

    const today = new Date().toISOString().split('T')[0];
    const todayCount = data.memories.filter(m => m.timestamp.startsWith(today)).length;

    return {
        total: data.memories.length,
        today: todayCount,
        categories: cats,
        oldest: data.memories[0]?.timestamp || null,
        newest: data.memories[data.memories.length - 1]?.timestamp || null,
        version: data.version,
    };
}

function getContext(maxItems = 20) {
    // Returns a summary string for LLM context injection
    const recentMems = recent(maxItems);
    if (recentMems.length === 0) return 'Nenhuma memória registrada ainda.';

    return recentMems.map(m =>
        `[${m.category}] ${m.content} (${new Date(m.timestamp).toLocaleString('pt-BR')})`
    ).join('\n');
}

// ── Helpers ──────────────────────────────────────────────────
function extractTags(text) {
    const tags = [];
    // Extract names (capitalized words)
    const names = text.match(/[A-ZÀ-Ú][a-zà-ú]+(?:\s[A-ZÀ-Ú][a-zà-ú]+)*/g);
    if (names) tags.push(...names.map(n => n.toLowerCase()));
    // Extract numbers
    const nums = text.match(/\d+(?:\.\d+)?%?/g);
    if (nums) tags.push(...nums);
    // Extract keywords
    const keywords = ['lead', 'vaga', 'funcionario', 'cliente', 'venda', 'campanha',
        'relatório', 'alerta', 'urgente', 'aprovado', 'rejeitado', 'hot', 'warm', 'cold'];
    for (const kw of keywords) {
        if (text.toLowerCase().includes(kw)) tags.push(kw);
    }
    return [...new Set(tags)];
}

// ── Module Exports ───────────────────────────────────────────
module.exports = { store, search, recent, byCategory, stats, getContext, CATEGORIES };

// ── CLI ──────────────────────────────────────────────────────
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args[0] === '--store') {
        const mem = store(args[1], args[2], args[3] ? JSON.parse(args[3]) : {});
        console.log(`\n✅ Memória armazenada:`);
        console.log(`  ID: ${mem.id}`);
        console.log(`  Categoria: ${mem.category}`);
        console.log(`  Tags: ${mem.tags.join(', ')}`);
    }
    else if (args[0] === '--search') {
        const results = search(args[1]);
        console.log(`\n🔍 Resultados para "${args[1]}":\n`);
        for (const r of results) {
            console.log(`  [${r.category}] ${r.content.substring(0, 80)}`);
            console.log(`    ${r.timestamp} | Tags: ${r.tags.join(', ')}\n`);
        }
        console.log(`  Total: ${results.length}`);
    }
    else if (args[0] === '--recent') {
        const items = recent(parseInt(args[1]) || 10);
        console.log(`\n📋 Últimas ${items.length} memórias:\n`);
        for (const m of items) {
            console.log(`  [${m.category}] ${m.content.substring(0, 80)}`);
            console.log(`    ${m.timestamp}\n`);
        }
    }
    else if (args[0] === '--category') {
        const items = byCategory(args[1]);
        console.log(`\n📂 Categoria: ${args[1]} (${items.length} memórias):\n`);
        for (const m of items) {
            console.log(`  ${m.content.substring(0, 80)}`);
            console.log(`    ${m.timestamp}\n`);
        }
    }
    else if (args[0] === '--stats') {
        const s = stats();
        console.log('\n📊 Memória AIOS:\n');
        console.log(`  Total: ${s.total} memórias`);
        console.log(`  Hoje: ${s.today}`);
        console.log(`  Categorias:`);
        for (const [cat, count] of Object.entries(s.categories)) {
            console.log(`    ${cat}: ${count}`);
        }
        if (s.oldest) console.log(`  Mais antiga: ${s.oldest}`);
        if (s.newest) console.log(`  Mais recente: ${s.newest}`);
    }
    else if (args[0] === '--context') {
        console.log('\n🧠 Contexto para LLM:\n');
        console.log(getContext(parseInt(args[1]) || 20));
    }
    else if (args[0] === '--export') {
        const data = loadMemories();
        console.log(JSON.stringify(data, null, 2));
    }
    else {
        console.log('AIOS Memory System');
        console.log('  --store <category> "text" [metadata_json]  Armazenar');
        console.log('  --search "query"                           Buscar');
        console.log('  --recent [n]                               Últimas N');
        console.log('  --category <name>                          Por categoria');
        console.log('  --stats                                    Estatísticas');
        console.log('  --context [n]                              Contexto para LLM');
        console.log('  --export                                   Exportar tudo');
        console.log(`\n  Categorias: ${CATEGORIES.join(', ')}`);
    }
}
