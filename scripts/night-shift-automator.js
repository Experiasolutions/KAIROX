/** @purpose Automated nightly tasks: sanitization, doc organization, RAG re-index */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/* 
 * KAIROS NIGHT SHIFT AUTOMATOR 
 * Phase 1: Workspace Sanitization 
 * Phase 2: Semantic Document Organizer (Groq API) 
 * Phase 3: RAG Indexing 
 * Phase 4: Jarvis Profile Enrichment 
 * Phase 5: Council Evolution 
 */

const ROOT_DIR = process.cwd();
const DOCS_DIR = 'C:\\Users\\Gabriel\\Documents';
// Groq variables removed: now fully integrated into the SKORTEX Sovereign Engine (via ProviderRouter)

const IS_DRY_RUN = process.argv.includes('--dry-run');

function logInfo(msg) { console.log(`\x1b[36m[NIGHT-SHIFT]\x1b[0m ${msg}`); }
function logSuccess(msg) { console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`); }
function logWarn(msg) { console.log(`\x1b[33m[WARNING]\x1b[0m ${msg}`); }
function logError(msg) { console.error(`\x1b[31m[ERROR]\x1b[0m ${msg}`); }

// --- PHASE 1: SANITIZATION ---
function sanitizeWorkspace() {
    logInfo('Starting Phase 1: Workspace Sanitization...');
    const now = Date.now();
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

    // 1. Clean logs folder
    const logDir = path.join(ROOT_DIR, 'logs');
    if (fs.existsSync(logDir)) {
        const logs = fs.readdirSync(logDir);
        for (const file of logs) {
            const filePath = path.join(logDir, file);
            if (file.endsWith('.log')) {
                const stat = fs.statSync(filePath);
                if (now - stat.mtimeMs > SEVEN_DAYS) {
                    logInfo(`Removing old log: ${file}`);
                    if (!IS_DRY_RUN) fs.unlinkSync(filePath);
                }
            }
        }
    }

    // 2. Clean tmp directory
    const tmpDir = path.join(ROOT_DIR, 'tmp');
    if (fs.existsSync(tmpDir)) {
        logInfo('Clearing tmp/ directory...');
        if (!IS_DRY_RUN) fs.rmSync(tmpDir, { recursive: true, force: true });
    }

    // 3. Remove loose JSON dumps in root (excluding essential configs)
    const essentialJson = ['package.json', 'package-lock.json', 'codebase-map.json', 'entity-registry.json', 'memory.json', 'squad-audit-report.json', 'council-deep-audit.json'];
    const files = fs.readdirSync(ROOT_DIR);
    for (const file of files) {
        if (file.endsWith('.json') && !essentialJson.includes(file) && !file.startsWith('.')) {
            // Check if it's a small dump file, usually created during testing
            const stat = fs.statSync(path.join(ROOT_DIR, file));
            if (stat.isFile() && stat.size < 500000) {
                logWarn(`Suspicious standalone JSON found. Archiving: ${file}`);
                // Instead of deleting, we move to a 'dumps-archive' folder just in case
                const archiveDir = path.join(ROOT_DIR, '.aios-core', 'archive', 'dumps');
                if (!IS_DRY_RUN) {
                    if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir, { recursive: true });
                    fs.renameSync(path.join(ROOT_DIR, file), path.join(archiveDir, file));
                }
            }
        }
    }
    logSuccess('Phase 1 completed.');
}

// --- PHASE 2: SEMANTIC ORGANIZER ---
async function semanticOrganizer() {
    logInfo('Starting Phase 2: Windows Documents Semantic Organization (Groq API)...');

    logInfo('Initializing Sovereign SKORTEX Router for Night Shift...');

    const categories = ['Financial', 'Personal', 'Work', 'KAIROS', 'AIOS', 'Megabrain', 'Other'];
    const destBase = path.join(DOCS_DIR, 'Organized_by_Groq');

    if (!IS_DRY_RUN && !fs.existsSync(destBase)) {
        fs.mkdirSync(destBase, { recursive: true });
    }

    for (const cat of categories) {
        const catPath = path.join(destBase, cat);
        if (!IS_DRY_RUN && !fs.existsSync(catPath)) fs.mkdirSync(catPath, { recursive: true });
    }

    const allowedExtensions = ['.txt', '.md', '.json', '.yaml', '.yml', '.csv', '.pdf', '.docx'];
    const files = fs.readdirSync(DOCS_DIR, { withFileTypes: true });

    for (const file of files) {
        if (!file.isFile()) continue;

        const ext = path.extname(file.name).toLowerCase();
        if (!allowedExtensions.includes(ext)) continue;

        const filePath = path.join(DOCS_DIR, file.name);

        // Read file snippet (up to 1000 chars)
        let snippet = '';
        try {
            if (ext !== '.pdf' && ext !== '.docx') { // Read text files natively
                const content = fs.readFileSync(filePath, 'utf8');
                // Sanitize string to prevent JSON payload breaks in the API
                snippet = content.replace(/[^\x20-\x7E]/g, ' ').substring(0, 1000);
            } else {
                snippet = `Filename is ${file.name}. Contents unreadable directly, rely on filename.`;
            }
        } catch (e) {
            snippet = `Error reading file: ${e.message}`;
        }

        if (!snippet.trim() && !file.name.trim()) continue;

        logInfo(`Calling Groq API for: ${file.name}...`);

        const prompt = `
You are an expert file organizer. Classify the following file into EXACTLY ONE of these categories:
${categories.join(', ')}

Rely on the filename and the provided snippet. If unsure or if it seems generic, choose "Other".
Return ONLY the category name. No explanations, no quotes.

Filename: ${file.name}
Snippet:
${snippet.substring(0, 500)}
        `.trim();

        try {
            // Instantiate SKORTEX Sovereign Router (dynamic import due to CommonJS script vs ESM local module)
            const { ProviderRouter } = await import('file:///' + path.join(ROOT_DIR, 'skyros-agent', 'src', 'providers', 'router.js'));
            const { config } = await import('file:///' + path.join(ROOT_DIR, 'skyros-agent', 'src', 'core', 'config.js'));
            
            const router = new ProviderRouter(config);

            const aiResponse = await router.complete(
                [{ role: 'user', content: prompt }], 
                [], 
                { tier: 'night' } // Router will try Red Hat and fallback to free pool gracefully!
            );

            // Extract category robustly in case LLM is chatty
            let category = 'Other';
            const rawOutput = (aiResponse || '').trim().replace(/['"]/g, '');
            
            // Search inside the string for one of the categories
            for (const cat of categories) {
                if (rawOutput.includes(cat)) {
                    category = cat;
                    break;
                }
            }

            if (!categories.includes(category)) category = 'Other';

            const newPath = path.join(destBase, category, file.name);
            logInfo(`Decision: [${category}] -> Moving ${file.name}`);

            if (!IS_DRY_RUN) {
                fs.renameSync(filePath, newPath);
            }
        } catch (e) {
            logError(`Failed to process ${file.name}: ${e.message}`);
        }
    }
    logSuccess('Phase 2 completed.');
}

// --- PHASES 3, 4, 5: BACKGROUND TASKS ---
function runBackgroundTasks() {
    logInfo('Starting Phase 3: RAG Re-indexing...');
    try {
        if (!IS_DRY_RUN) execSync('node scripts/rag-engine.js --index', { stdio: 'inherit' });
        else logInfo('[DRY RUN] Executing: node scripts/rag-engine.js --index');
        logSuccess('Phase 3 completed.');
    } catch (e) { logError(`RAG Indexing failed: ${e.message}`); }

    logInfo('Starting Phase 4: Jarvis Deep Profile Enrichment...');
    try {
        if (!IS_DRY_RUN) execSync('node scripts/profile-enricher.js', { stdio: 'inherit' });
        else logInfo('[DRY RUN] Executing: node scripts/profile-enricher.js');
        logSuccess('Phase 4 completed.');
    } catch (e) { logError(`Profile Enrichment failed: ${e.message}`); }

    logInfo('Starting Phase 5: Council Evolution Shift...');
    try {
        if (!IS_DRY_RUN) {
            // Note: Evolution engine takes time. 
            // In a real night shift, this will block until done.
            logInfo('Running IA Council deep scan & evolution...');
            if (fs.existsSync('scripts/evolution/run-evolution.js')) {
                execSync('node scripts/evolution/run-evolution.js', { stdio: 'inherit' });
            } else {
                // Fallback to basic boot
                execSync('node scripts/kairos-boot.js', { stdio: 'inherit' });
            }
        } else logInfo('[DRY RUN] Executing: Council Evolution Shift');
        logSuccess('Phase 5 completed.');
    } catch (e) { logError(`Council Evolution failed: ${e.message}`); }
}

// --- MAIN RUNNER ---
async function runNightShift() {
    console.log('\n\x1b[1m\x1b[35m=== 🌙 KAIROS NIGHT SHIFT AUTOMATOR ===\x1b[0m\n');
    if (IS_DRY_RUN) logWarn('RUNNING IN DRY-RUN MODE - No files will be moved or deleted.');

    sanitizeWorkspace();
    await semanticOrganizer();
    runBackgroundTasks();

    console.log('\n\x1b[1m\x1b[32m=== 🌙 NIGHT SHIFT COMPLETE ===\x1b[0m\n');
}

runNightShift();
