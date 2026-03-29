/**
 * @module rag-engine
 * @version 1.0.0
 * @purpose Retrieval Augmented Generation engine — index documents into a
 *          local vector store and enable semantic search for mind clones.
 *          Pipeline: Documents → Chunking → Embeddings → Vector Store → Search.
 * @inputs  Knowledge base files (auto-indexed) or query string (CLI)
 * @outputs Search results with relevance scores + .aios-core/data/rag/ index
 * @exports { index, query, status }
 * @dependencies .env (GEMINI_API_KEY for embeddings)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const AIOS_ROOT = path.resolve(__dirname, '..');
const RAG_DIR = path.join(AIOS_ROOT, '.aiox-core', 'data', 'rag');
const KNOWLEDGE_DIRS = [
    path.join(AIOS_ROOT, 'squads'),
    path.join(AIOS_ROOT, '.aiox-core', 'docs', 'standards'),
    path.join(AIOS_ROOT, '.aiox-core', 'core'),
    path.join(AIOS_ROOT, 'docs'),
];

// ============================================================
// CHUNKING ENGINE
// ============================================================

class TextChunker {
    constructor(options = {}) {
        this.chunkSize = options.chunkSize || 500;       // chars
        this.chunkOverlap = options.chunkOverlap || 100; // chars overlap between chunks
    }

    /**
     * Split text into overlapping chunks
     */
    chunk(text, metadata = {}) {
        const chunks = [];
        const lines = text.split('\n');
        let currentChunk = '';
        let chunkIndex = 0;

        for (const line of lines) {
            // If section header, start new chunk
            if (line.match(/^#{1,3}\s/) && currentChunk.length > this.chunkSize / 3) {
                if (currentChunk.trim()) {
                    chunks.push(this._createChunk(currentChunk, chunkIndex++, metadata));
                }
                currentChunk = line + '\n';
                continue;
            }

            currentChunk += line + '\n';

            if (currentChunk.length >= this.chunkSize) {
                chunks.push(this._createChunk(currentChunk, chunkIndex++, metadata));
                // Keep overlap
                const words = currentChunk.split(/\s+/);
                const overlapWords = Math.floor(this.chunkOverlap / 5); // ~5 chars per word
                currentChunk = words.slice(-overlapWords).join(' ') + '\n';
            }
        }

        // Remaining
        if (currentChunk.trim()) {
            chunks.push(this._createChunk(currentChunk, chunkIndex, metadata));
        }

        return chunks;
    }

    _createChunk(text, index, metadata) {
        return {
            id: `${metadata.docId || 'unknown'}-chunk-${index}`,
            text: text.trim(),
            metadata: {
                ...metadata,
                chunkIndex: index,
                charCount: text.length,
                wordCount: text.split(/\s+/).length,
            },
        };
    }
}

// ============================================================
// SIMPLE VECTOR STORE (In-Memory TF-IDF)
// ============================================================

class SimpleVectorStore {
    constructor() {
        this.documents = [];
        this.idf = {};
        this.indexed = false;
    }

    /**
     * Add documents to the store
     */
    add(chunks) {
        this.documents.push(...chunks);
        this.indexed = false;
    }

    /**
     * Build the TF-IDF index
     */
    buildIndex() {
        const docCount = this.documents.length;
        const df = {};

        // Calculate document frequency
        this.documents.forEach(doc => {
            const terms = this._tokenize(doc.text);
            const uniqueTerms = [...new Set(terms)];
            uniqueTerms.forEach(term => {
                df[term] = (df[term] || 0) + 1;
            });
        });

        // Calculate IDF
        Object.keys(df).forEach(term => {
            this.idf[term] = Math.log(docCount / (df[term] + 1)) + 1;
        });

        // Pre-calculate TF-IDF vectors
        this.documents.forEach(doc => {
            doc._vector = this._vectorize(doc.text);
            doc._norm = Math.sqrt(Object.values(doc._vector).reduce((s, v) => s + v * v, 0));
        });

        this.indexed = true;
    }

    /**
     * Search for similar documents
     */
    search(query, topK = 5) {
        if (!this.indexed) this.buildIndex();

        const queryVector = this._vectorize(query);
        const queryNorm = Math.sqrt(Object.values(queryVector).reduce((s, v) => s + v * v, 0));

        if (queryNorm === 0) return [];

        // Cosine similarity
        const scored = this.documents.map(doc => {
            let dotProduct = 0;
            Object.keys(queryVector).forEach(term => {
                if (doc._vector[term]) {
                    dotProduct += queryVector[term] * doc._vector[term];
                }
            });
            const similarity = doc._norm > 0 ? dotProduct / (queryNorm * doc._norm) : 0;
            return { ...doc, score: similarity };
        });

        return scored
            .filter(d => d.score > 0.05)
            .sort((a, b) => b.score - a.score)
            .slice(0, topK)
            .map(d => ({
                id: d.id,
                text: d.text.substring(0, 300) + (d.text.length > 300 ? '...' : ''),
                score: Math.round(d.score * 1000) / 1000,
                metadata: d.metadata,
            }));
    }

    _tokenize(text) {
        return text
            .toLowerCase()
            .replace(/[^a-záàâãéèêíïóôõöúüç\w\s]/gi, ' ')
            .split(/\s+/)
            .filter(t => t.length > 2);
    }

    _vectorize(text) {
        const terms = this._tokenize(text);
        const tf = {};
        terms.forEach(t => { tf[t] = (tf[t] || 0) + 1; });

        const vector = {};
        const maxTf = Math.max(...Object.values(tf), 1);
        Object.keys(tf).forEach(term => {
            const normalizedTf = tf[term] / maxTf;
            vector[term] = normalizedTf * (this.idf[term] || 1);
        });
        return vector;
    }

    /**
     * Save index to disk
     */
    save(filePath) {
        const data = {
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            documentCount: this.documents.length,
            documents: this.documents.map(d => ({
                id: d.id,
                text: d.text,
                metadata: d.metadata,
            })),
        };
        fs.writeFileSync(filePath, JSON.stringify(data), 'utf8');
    }

    /**
     * Load index from disk
     */
    load(filePath) {
        try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            this.documents = data.documents;
            this.buildIndex();
            return true;
        } catch {
            return false;
        }
    }

    getStats() {
        return {
            totalDocuments: this.documents.length,
            totalTerms: Object.keys(this.idf).length,
            indexed: this.indexed,
        };
    }
}

// ============================================================
// RAG ENGINE
// ============================================================

class RAGEngine {
    constructor() {
        this.chunker = new TextChunker({ chunkSize: 500, chunkOverlap: 100 });
        this.store = new SimpleVectorStore();
        this.indexPath = path.join(RAG_DIR, 'index.json');

        if (!fs.existsSync(RAG_DIR)) {
            fs.mkdirSync(RAG_DIR, { recursive: true });
        }
    }

    /**
     * Index all knowledge bases
     */
    indexAll() {
        let totalFiles = 0;
        let totalChunks = 0;

        KNOWLEDGE_DIRS.forEach(dir => {
            if (!fs.existsSync(dir)) return;
            const files = this._scanFiles(dir, ['.md', '.yaml', '.yml', '.txt', '.json']);

            files.forEach(file => {
                try {
                    const content = fs.readFileSync(file, 'utf8');
                    if (content.length < 50) return; // Skip tiny files

                    const relPath = path.relative(AIOS_ROOT, file);
                    const docId = crypto.createHash('md5').update(relPath).digest('hex').substring(0, 8);

                    const chunks = this.chunker.chunk(content, {
                        docId,
                        source: relPath,
                        fileName: path.basename(file),
                        category: this._detectCategory(relPath),
                    });

                    this.store.add(chunks);
                    totalFiles++;
                    totalChunks += chunks.length;
                } catch { }
            });
        });

        this.store.buildIndex();
        this.store.save(this.indexPath);

        return { files: totalFiles, chunks: totalChunks, terms: Object.keys(this.store.idf).length };
    }

    /**
     * Search the knowledge base
     */
    search(query, topK = 5) {
        if (!this.store.indexed) {
            this.store.load(this.indexPath);
        }
        return this.store.search(query, topK);
    }

    /**
     * Load existing index
     */
    loadIndex() {
        return this.store.load(this.indexPath);
    }

    _scanFiles(dir, extensions) {
        const results = [];
        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.name === 'node_modules' || entry.name === '.git') continue;
                if (entry.isDirectory()) {
                    results.push(...this._scanFiles(fullPath, extensions));
                } else if (extensions.some(ext => entry.name.endsWith(ext))) {
                    results.push(fullPath);
                }
            }
        } catch { }
        return results;
    }

    _detectCategory(relPath) {
        // WHY: Dynamic category detection — reads from actual squads/ directory names
        if (relPath.includes('squads/')) {
            const parts = relPath.split(/[\/\\]/);
            const squadIdx = parts.indexOf('squads');
            if (squadIdx >= 0 && parts[squadIdx + 1]) return `squad-${parts[squadIdx + 1]}`;
            return 'squad';
        }
        if (relPath.includes('docs/standards')) return 'standard';
        if (relPath.includes('.aios-core/core')) return 'core';
        if (relPath.includes('docs/')) return 'documentation';
        return 'general';
    }
}

// ============================================================
// CLI INTERFACE
// ============================================================

if (require.main === module) {
    const rag = new RAGEngine();

    if (process.argv.includes('--index')) {
        console.log('📚 AIOS RAG Engine v1.0 — Indexing Knowledge Base\n');
        console.log('🔍 Scanning directories:');
        KNOWLEDGE_DIRS.forEach(d => {
            const rel = path.relative(AIOS_ROOT, d);
            console.log(`   📁 ${rel}/`);
        });
        console.log();

        const stats = rag.indexAll();
        console.log(`✅ Indexing complete!`);
        console.log(`   📄 Files indexed: ${stats.files}`);
        console.log(`   🧩 Chunks created: ${stats.chunks}`);
        console.log(`   📝 Unique terms: ${stats.terms}`);
        console.log(`   💾 Index saved to: .aios-core/data/rag/index.json`);
        console.log();
        console.log('💡 Now you can search with: node scripts/rag-engine.js --query "your question"');
    }

    else if (process.argv.includes('--query')) {
        const queryIdx = process.argv.indexOf('--query');
        const query = process.argv.slice(queryIdx + 1).join(' ');

        if (!query) {
            console.log('Usage: node scripts/rag-engine.js --query "your question"');
            process.exit(1);
        }

        console.log(`🔍 Searching: "${query}"\n`);

        const loaded = rag.loadIndex();
        if (!loaded) {
            console.log('⚠️ No index found. Run with --index first.');
            process.exit(1);
        }

        const results = rag.search(query);
        if (results.length === 0) {
            console.log('❌ No results found.');
        } else {
            results.forEach((r, i) => {
                console.log(`\n─── Result ${i + 1} (score: ${r.score}) ───`);
                console.log(`📄 Source: ${r.metadata.source}`);
                console.log(`📂 Category: ${r.metadata.category}`);
                console.log(`📝 ${r.text}`);
            });
        }
    }

    else if (process.argv.includes('--status')) {
        console.log('📊 AIOS RAG Engine — Status\n');
        const loaded = rag.loadIndex();
        if (!loaded) {
            console.log('⚠️ No index found. Run with --index first.');
        } else {
            const stats = rag.store.getStats();
            console.log(`   📄 Documents: ${stats.totalDocuments}`);
            console.log(`   📝 Unique terms: ${stats.totalTerms}`);
            console.log(`   ✅ Indexed: ${stats.indexed}`);

            const indexFile = path.join(RAG_DIR, 'index.json');
            if (fs.existsSync(indexFile)) {
                const stat = fs.statSync(indexFile);
                console.log(`   💾 Index size: ${(stat.size / 1024 / 1024).toFixed(1)} MB`);
                console.log(`   📅 Last updated: ${stat.mtime.toISOString()}`);
            }
        }
    }

    else if (process.argv.includes('--demo')) {
        console.log('🎮 AIOS RAG Engine — Demo Mode\n');
        console.log('Indexing...');
        const stats = rag.indexAll();
        console.log(`✅ Indexed ${stats.files} files (${stats.chunks} chunks)\n`);

        const queries = [
            'Grand Slam Offer',
            'KPI revenue metrics',
            'cross-squad emergency protocol',
            'mind clone DNA',
            'quality gates validation',
        ];

        queries.forEach(q => {
            console.log(`\n🔍 Query: "${q}"`);
            const results = rag.search(q, 3);
            if (results.length === 0) {
                console.log('   No results');
            } else {
                results.forEach(r => {
                    console.log(`   📄 [${r.score}] ${r.metadata.source} (${r.metadata.category})`);
                });
            }
        });

        console.log('\n✅ Demo complete!');
    }

    else {
        console.log('📚 AIOS RAG Engine v1.0');
        console.log();
        console.log('Commands:');
        console.log('  --index           Index all knowledge bases');
        console.log('  --query "text"    Search the knowledge base');
        console.log('  --status          Show index status');
        console.log('  --demo            Run interactive demo');
        console.log();
        console.log('Future: zvec integration for neural embeddings');
    }
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = { RAGEngine, TextChunker, SimpleVectorStore };
