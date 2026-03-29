#!/usr/bin/env node

/**
 * @module jarvis-pipeline
 * @version 1.0.0
 * @purpose 3-Layer Cognitive Ingestion Pipeline — KAIROS Jarvis Engine
 *
 *   Fase 1: Chunk & Index (Prompt 1.1) — Split text, extract persons/themes, entity resolution
 *   Fase 2: Insight Extraction (Prompt 2.1) — Generate prioritized insights per person/theme
 *   Fase 3: Strategic Narrative Synthesis (Prompt 3.1) — Build incremental narrative dossiers
 *
 *   Modeled after Thiago Finch's "Projeto Híbrido Jarvis" but built natively for KAIROS.
 *
 * @usage node scripts/data-ingestion/jarvis-pipeline.js [--input <file>] [--phase <1|2|3|all>]
 */

'use strict';

const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

// ─────────────────────────────────────────────────────────────
// PATHS
// ─────────────────────────────────────────────────────────────
const PROJECT_ROOT = path.join(__dirname, '..', '..');
const DATA_DIR = path.join(PROJECT_ROOT, 'data');
const INDEX_DIR = path.join(DATA_DIR, 'jarvis-index');
const NARRATIVES_DIR = path.join(DATA_DIR, 'jarvis-narratives');
const ENTITY_REGISTRY = path.join(DATA_DIR, 'entity-registry.json');
const DEFAULT_INPUT = path.join(DATA_DIR, 'livestreams', 'transcript_full.txt');

const CHUNKS_FILE = path.join(INDEX_DIR, 'chunks.json');
const INSIGHTS_FILE = path.join(INDEX_DIR, 'insights.json');

// ─────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────
const CHUNK_SIZE = 500;        // words per chunk
const CHUNK_OVERLAP = 50;      // word overlap between chunks
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const RATE_LIMIT_DELAY_MS = 2000; // 2s between API calls

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function ensureDirs() {
    [INDEX_DIR, NARRATIVES_DIR].forEach(dir => {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });
}

function loadEntityRegistry() {
    try {
        return JSON.parse(fs.readFileSync(ENTITY_REGISTRY, 'utf-8'));
    } catch {
        return { persons: {}, organizations: {}, themes: {} };
    }
}

function slugify(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function callGroq(systemPrompt, userPrompt, temperature = 0.3) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY not found in .env');

    const response = await axios.post(GROQ_API_URL, {
        model: GROQ_MODEL,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ],
        temperature,
        max_tokens: 4096,
        response_format: { type: 'json_object' }
    }, {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        timeout: 60000
    });

    const text = response.data.choices[0].message.content;
    return JSON.parse(text);
}

async function callGroqText(systemPrompt, userPrompt, temperature = 0.4) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY not found in .env');

    const response = await axios.post(GROQ_API_URL, {
        model: GROQ_MODEL,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ],
        temperature,
        max_tokens: 4096
    }, {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        timeout: 60000
    });

    return response.data.choices[0].message.content;
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

// ─────────────────────────────────────────────────────────────
// PHASE 1: CHUNK & INDEX
// ─────────────────────────────────────────────────────────────

function splitIntoChunks(text) {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const chunks = [];
    let i = 0;
    let chunkId = 0;

    while (i < words.length) {
        const end = Math.min(i + CHUNK_SIZE, words.length);
        const chunkWords = words.slice(i, end);
        chunks.push({
            id: `chunk_${String(chunkId).padStart(3, '0')}`,
            text: chunkWords.join(' '),
            wordCount: chunkWords.length
        });
        chunkId++;
        i += (CHUNK_SIZE - CHUNK_OVERLAP);
    }

    console.log(`  Split into ${chunks.length} chunks (${words.length} total words)`);
    return chunks;
}

function buildEntityContext(registry) {
    let ctx = 'KNOWN ENTITIES FOR RESOLUTION:\n\n';
    ctx += 'PERSONS:\n';
    for (const [, p] of Object.entries(registry.persons || {})) {
        ctx += `- "${p.canonical}" (aliases: ${p.aliases.join(', ') || 'none'})\n`;
    }
    ctx += '\nORGANIZATIONS:\n';
    for (const [, o] of Object.entries(registry.organizations || {})) {
        ctx += `- "${o.canonical}" (aliases: ${o.aliases.join(', ') || 'none'})\n`;
    }
    ctx += '\nTHEMES:\n';
    for (const [, t] of Object.entries(registry.themes || {})) {
        ctx += `- "${t.canonical}" (aliases: ${t.aliases.join(', ') || 'none'})\n`;
    }
    return ctx;
}

async function phase1ChunkAndIndex(inputFile) {
    console.log('\n═══ FASE 1: CHUNK & INDEX (Prompt 1.1) ═══\n');

    const text = fs.readFileSync(inputFile, 'utf-8');
    const registry = loadEntityRegistry();
    const entityContext = buildEntityContext(registry);
    const rawChunks = splitIntoChunks(text);

    const SYSTEM_PROMPT = `You are a KAIROS Memory Indexer. Your job is to analyze chunks of transcribed speech and extract structured metadata.

${entityContext}

RULES:
1. Extract ALL persons mentioned in the chunk. Use canonical names from the registry when possible. If a new person is mentioned, use their name as-is.
2. Extract ALL themes/topics discussed. Use canonical theme names from the registry when possible.
3. Write a concise summary (2-3 sentences max) of what was discussed in this chunk.
4. If the chunk contains no meaningful content (filler, audio artifacts, greetings only), set "meaningful" to false.

Respond ONLY in valid JSON with this exact structure:
{
  "persons": ["Name1", "Name2"],
  "themes": ["Theme1", "Theme2"],
  "summary": "Brief summary of the chunk content",
  "meaningful": true
}`;

    const indexedChunks = [];
    const batchSize = 5;

    for (let i = 0; i < rawChunks.length; i += batchSize) {
        const batch = rawChunks.slice(i, Math.min(i + batchSize, rawChunks.length));

        for (const chunk of batch) {
            const progress = `[${indexedChunks.length + 1}/${rawChunks.length}]`;
            process.stdout.write(`  ${progress} Processing ${chunk.id}...`);

            try {
                const result = await callGroq(SYSTEM_PROMPT, `CHUNK TEXT:\n${chunk.text}`);
                indexedChunks.push({
                    ...chunk,
                    persons: result.persons || [],
                    themes: result.themes || [],
                    summary: result.summary || '',
                    meaningful: result.meaningful !== false
                });
                console.log(` ✅ ${(result.persons || []).length}P / ${(result.themes || []).length}T`);
            } catch (err) {
                const errMsg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
                console.log(` ❌ ${errMsg.substring(0, 80)}`);

                // On rate limit, wait longer and retry once
                if (err.response?.status === 429) {
                    console.log('  ⏳ Rate limited. Waiting 30s...');
                    await sleep(30000);
                    try {
                        const result = await callGroq(SYSTEM_PROMPT, `CHUNK TEXT:\n${chunk.text}`);
                        indexedChunks.push({
                            ...chunk,
                            persons: result.persons || [],
                            themes: result.themes || [],
                            summary: result.summary || '',
                            meaningful: result.meaningful !== false
                        });
                        console.log(`  ✅ Retry succeeded`);
                    } catch {
                        indexedChunks.push({ ...chunk, persons: [], themes: [], summary: 'FAILED', meaningful: false });
                    }
                } else {
                    indexedChunks.push({ ...chunk, persons: [], themes: [], summary: 'FAILED', meaningful: false });
                }
            }

            await sleep(RATE_LIMIT_DELAY_MS);
        }
    }

    // Save indexed chunks
    fs.writeFileSync(CHUNKS_FILE, JSON.stringify({
        source: path.basename(inputFile),
        generatedAt: new Date().toISOString(),
        totalChunks: indexedChunks.length,
        meaningfulChunks: indexedChunks.filter(c => c.meaningful).length,
        chunks: indexedChunks
    }, null, 2));

    console.log(`\n  ✅ Phase 1 complete. ${indexedChunks.length} chunks indexed → ${CHUNKS_FILE}`);
    return indexedChunks;
}

// ─────────────────────────────────────────────────────────────
// PHASE 2: INSIGHT EXTRACTION
// ─────────────────────────────────────────────────────────────

function groupByEntity(chunks, field) {
    const groups = {};
    for (const chunk of chunks) {
        if (!chunk.meaningful) continue;
        const entities = chunk[field] || [];
        for (const entity of entities) {
            if (!groups[entity]) groups[entity] = [];
            groups[entity].push({
                id: chunk.id,
                summary: chunk.summary,
                text: chunk.text.substring(0, 300) + '...'
            });
        }
    }
    return groups;
}

async function phase2InsightExtraction(chunks) {
    console.log('\n═══ FASE 2: INSIGHT EXTRACTION (Prompt 2.1) ═══\n');

    if (!chunks) {
        const data = JSON.parse(fs.readFileSync(CHUNKS_FILE, 'utf-8'));
        chunks = data.chunks;
    }

    const personGroups = groupByEntity(chunks, 'persons');
    const themeGroups = groupByEntity(chunks, 'themes');

    console.log(`  Found ${Object.keys(personGroups).length} persons, ${Object.keys(themeGroups).length} themes`);

    const SYSTEM_PROMPT = `You are a KAIROS Insight Extractor. Given a collection of transcript summaries about a specific PERSON or THEME, extract the most important actionable insights.

RULES:
1. Each insight must be a specific, concrete finding — not vague.
2. Assign priority: "high" (strategic decision, revenue impact), "medium" (operational relevance), "low" (contextual/background).
3. Reference which chunk IDs support each insight.
4. Maximum 5 insights per entity. Focus on quality over quantity.
5. Write insights in Portuguese (pt-BR).

Respond in valid JSON:
{
  "entity": "Name",
  "entityType": "person|theme",
  "insights": [
    {
      "id_chunks": ["chunk_001", "chunk_005"],
      "insight": "Specific finding about this person/theme",
      "priority": "high|medium|low"
    }
  ]
}`;

    const allInsights = { persons: {}, themes: {} };

    // Process persons (only those with 2+ chunks for meaningful insights)
    const significantPersons = Object.entries(personGroups).filter(([, chunks]) => chunks.length >= 2);
    console.log(`  Processing ${significantPersons.length} significant persons...`);

    for (const [person, relatedChunks] of significantPersons) {
        process.stdout.write(`  → ${person} (${relatedChunks.length} chunks)...`);
        try {
            const userPrompt = `ENTITY: "${person}" (Person)\n\nRELATED CHUNKS:\n${relatedChunks.map(c => `[${c.id}] ${c.summary}`).join('\n')}`;
            const result = await callGroq(SYSTEM_PROMPT, userPrompt);
            allInsights.persons[person] = result.insights || [];
            console.log(` ✅ ${(result.insights || []).length} insights`);
        } catch (err) {
            console.log(` ❌ ${err.message.substring(0, 60)}`);
            allInsights.persons[person] = [];
        }
        await sleep(RATE_LIMIT_DELAY_MS);
    }

    // Process themes (only those with 3+ chunks)
    const significantThemes = Object.entries(themeGroups).filter(([, chunks]) => chunks.length >= 3);
    console.log(`  Processing ${significantThemes.length} significant themes...`);

    for (const [theme, relatedChunks] of significantThemes) {
        process.stdout.write(`  → ${theme} (${relatedChunks.length} chunks)...`);
        try {
            const userPrompt = `ENTITY: "${theme}" (Theme)\n\nRELATED CHUNKS:\n${relatedChunks.map(c => `[${c.id}] ${c.summary}`).join('\n')}`;
            const result = await callGroq(SYSTEM_PROMPT, userPrompt);
            allInsights.themes[theme] = result.insights || [];
            console.log(` ✅ ${(result.insights || []).length} insights`);
        } catch (err) {
            console.log(` ❌ ${err.message.substring(0, 60)}`);
            allInsights.themes[theme] = [];
        }
        await sleep(RATE_LIMIT_DELAY_MS);
    }

    // Save insights
    fs.writeFileSync(INSIGHTS_FILE, JSON.stringify({
        source: 'jarvis-pipeline-phase2',
        generatedAt: new Date().toISOString(),
        totalPersonInsights: Object.values(allInsights.persons).flat().length,
        totalThemeInsights: Object.values(allInsights.themes).flat().length,
        ...allInsights
    }, null, 2));

    console.log(`\n  ✅ Phase 2 complete. Insights saved → ${INSIGHTS_FILE}`);
    return allInsights;
}

// ─────────────────────────────────────────────────────────────
// PHASE 3: STRATEGIC NARRATIVE SYNTHESIS
// ─────────────────────────────────────────────────────────────

async function phase3NarrativeSynthesis(insights) {
    console.log('\n═══ FASE 3: STRATEGIC NARRATIVE SYNTHESIS (Prompt 3.1) ═══\n');

    if (!insights) {
        const data = JSON.parse(fs.readFileSync(INSIGHTS_FILE, 'utf-8'));
        insights = { persons: data.persons, themes: data.themes };
    }

    const SYSTEM_PROMPT = `You are a KAIROS Strategic Narrator. Given a set of insights about a person or theme, write a cohesive narrative that:

1. Preserves chronological and logical progression
2. Connects insights into a fluid story (not bullet points)
3. Highlights strategic implications for the business
4. Uses professional but accessible Portuguese (pt-BR)
5. If an existing narrative is provided, APPEND new paragraphs without rewriting existing content

Write the narrative in Markdown format with:
- A header with the entity name
- A "Papel / Contexto" section (1-2 lines)
- A "Narrativa Estratégica" section (the main body, 3-5 paragraphs)
- A "Implicações para o KAIROS" section (2-3 bullet points on how this affects our system)`;

    let narrativesWritten = 0;

    // Generate narratives for persons with high-priority insights
    for (const [person, personInsights] of Object.entries(insights.persons || {})) {
        const highInsights = personInsights.filter(i => i.priority === 'high');
        if (highInsights.length === 0 && personInsights.length < 2) continue;

        const slug = slugify(person);
        const narrativeFile = path.join(NARRATIVES_DIR, `${slug}.md`);
        let existingNarrative = '';

        if (fs.existsSync(narrativeFile)) {
            existingNarrative = fs.readFileSync(narrativeFile, 'utf-8');
        }

        process.stdout.write(`  → Narrative: ${person}...`);
        try {
            const userPrompt = `ENTITY: "${person}" (Person)

INSIGHTS:
${personInsights.map(i => `- [${i.priority.toUpperCase()}] ${i.insight}`).join('\n')}

${existingNarrative ? `EXISTING NARRATIVE (append, do not rewrite):\n${existingNarrative}` : 'No existing narrative. Create from scratch.'}`;

            const narrative = await callGroqText(SYSTEM_PROMPT, userPrompt);
            fs.writeFileSync(narrativeFile, narrative);
            narrativesWritten++;
            console.log(` ✅ → ${narrativeFile}`);
        } catch (err) {
            console.log(` ❌ ${err.message.substring(0, 60)}`);
        }
        await sleep(RATE_LIMIT_DELAY_MS);
    }

    // Generate narratives for themes with high-priority insights
    for (const [theme, themeInsights] of Object.entries(insights.themes || {})) {
        const highInsights = themeInsights.filter(i => i.priority === 'high');
        if (highInsights.length === 0 && themeInsights.length < 2) continue;

        const slug = slugify(theme);
        const narrativeFile = path.join(NARRATIVES_DIR, `tema-${slug}.md`);
        let existingNarrative = '';

        if (fs.existsSync(narrativeFile)) {
            existingNarrative = fs.readFileSync(narrativeFile, 'utf-8');
        }

        process.stdout.write(`  → Narrative: ${theme}...`);
        try {
            const userPrompt = `ENTITY: "${theme}" (Theme)

INSIGHTS:
${themeInsights.map(i => `- [${i.priority.toUpperCase()}] ${i.insight}`).join('\n')}

${existingNarrative ? `EXISTING NARRATIVE (append, do not rewrite):\n${existingNarrative}` : 'No existing narrative. Create from scratch.'}`;

            const narrative = await callGroqText(SYSTEM_PROMPT, userPrompt);
            fs.writeFileSync(narrativeFile, narrative);
            narrativesWritten++;
            console.log(` ✅ → ${narrativeFile}`);
        } catch (err) {
            console.log(` ❌ ${err.message.substring(0, 60)}`);
        }
        await sleep(RATE_LIMIT_DELAY_MS);
    }

    console.log(`\n  ✅ Phase 3 complete. ${narrativesWritten} narratives written → ${NARRATIVES_DIR}`);
    return narrativesWritten;
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────

async function main() {
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║   🧠 KAIROS JARVIS PIPELINE v1.0 — 3-Layer Engine  ║');
    console.log('╚══════════════════════════════════════════════════════╝');

    ensureDirs();

    // Parse CLI args
    const args = process.argv.slice(2);
    const inputIdx = args.indexOf('--input');
    const phaseIdx = args.indexOf('--phase');

    const inputFile = inputIdx >= 0 ? args[inputIdx + 1] : DEFAULT_INPUT;
    const phase = phaseIdx >= 0 ? args[phaseIdx + 1] : 'all';

    if (!fs.existsSync(inputFile)) {
        console.error(`❌ Input file not found: ${inputFile}`);
        process.exit(1);
    }

    console.log(`\n  Input: ${inputFile}`);
    console.log(`  Phase: ${phase}`);
    console.log(`  Model: ${GROQ_MODEL}`);
    console.log(`  Entity Registry: ${fs.existsSync(ENTITY_REGISTRY) ? '✅ Loaded' : '⚠️ Not found'}`);

    const startTime = Date.now();

    try {
        let chunks = null;
        let insights = null;

        if (phase === 'all' || phase === '1') {
            chunks = await phase1ChunkAndIndex(inputFile);
        }

        if (phase === 'all' || phase === '2') {
            insights = await phase2InsightExtraction(chunks);
        }

        if (phase === 'all' || phase === '3') {
            await phase3NarrativeSynthesis(insights);
        }

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`\n╔══════════════════════════════════════════════════════╗`);
        console.log(`║   ✅ PIPELINE COMPLETE — ${elapsed}s                      ║`);
        console.log(`╚══════════════════════════════════════════════════════╝`);

    } catch (err) {
        console.error(`\n❌ Pipeline failed: ${err.message}`);
        console.error(err.stack);
        process.exit(1);
    }
}

main();
