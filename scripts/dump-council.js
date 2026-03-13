/** @purpose Run the IA Council (8 chairs) deep audit on the entire system */
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const AIOS_ROOT = PROJECT_ROOT;

/**
 * @purpose Scan a directory for files to feed the IA Council evaluation
 * @inputs {string} dir - absolute directory path
 * @inputs {string} prefix - relative prefix for file paths
 * @outputs {Array} array of { path, content } objects
 */
function scanDirForCouncil(dir, prefix) {
    const results = [];
    if (!fs.existsSync(dir)) return results;
    try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.name === 'node_modules' || entry.name === 'archive' || entry.name === '.git') continue;
            const relPath = `${prefix}/${entry.name}`;
            if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.md') || entry.name.endsWith('.json'))) {
                try {
                    const contentLimit = entry.name.endsWith('.md') ? 8000 : (entry.name.endsWith('.json') ? 4000 : 500);
                    const content = fs.readFileSync(path.join(dir, entry.name), 'utf8').slice(0, contentLimit);
                    results.push({ path: relPath, content });
                } catch (e) { /* skip unreadable */ }
            } else if (entry.isDirectory()) {
                // Full sub-scan for structure detection (no limit on sub-entries)
                results.push({ path: relPath + '/', content: '' });
                try {
                    const subEntries = fs.readdirSync(path.join(dir, entry.name), { withFileTypes: true });
                    for (const sub of subEntries) {
                        if (sub.isFile() && (sub.name.endsWith('.js') || sub.name.endsWith('.md') || sub.name.endsWith('.json'))) {
                            try {
                                const subLimit = sub.name.endsWith('.md') ? 8000 : (sub.name.endsWith('.json') ? 4000 : 500);
                                const subContent = fs.readFileSync(path.join(dir, entry.name, sub.name), 'utf8').slice(0, subLimit);
                                results.push({ path: `${relPath}/${sub.name}`, content: subContent });
                            } catch (e) { /* skip */ }
                        }
                    }
                } catch (e) { /* skip inaccessible subdirectory */ }
            }
        }
    } catch (e) { /* skip inaccessible */ }
    return results;
}

try {
    const councilPath = path.join(AIOS_ROOT, 'scripts', 'evolution', 'ia-council-engine.js');
    const council = require(councilPath);

    const seenPaths = new Set();
    let files = [];
    const dirsToScan = [
        ['scripts', 'scripts'],
        ['scripts/evolution', 'scripts/evolution'],
        ['scripts/operator-noesis', 'scripts/operator-noesis'],
        ['squads', 'squads'],
        ['docs', 'docs'],
        ['reasoning-packages', 'reasoning-packages'],
        ['engine/opus-replicator', 'engine/opus-replicator'],
        ['engine/noesis', 'engine/noesis'],
        ['engine/memory', 'engine/memory'],
        ['engine/noesis-operator', 'engine/noesis-operator'],
        ['clients/experia/config', 'clients/experia/config'],
        ['.agent/workflows', '.agent/workflows'],
        ['kairos-orchestrator', 'kairos-orchestrator'],
        ['data', 'data'],
        ['distillation-dataset', 'distillation-dataset'],
        ['distillation-dataset/traces', 'distillation-dataset/traces'],
        ['distillation-dataset/curated', 'distillation-dataset/curated'],
    ];

    for (const [dir, prefix] of dirsToScan) {
        const fullPath = path.join(AIOS_ROOT, dir);
        const scanned = scanDirForCouncil(fullPath, prefix);
        // Deduplicate: skip files already seen from another scan path
        for (const file of scanned) {
            if (!seenPaths.has(file.path)) {
                seenPaths.add(file.path);
                files.push(file);
            }
        }
    }

    // Scan root-level files (README.md, etc)
    const rootFiles = ['README.md', 'SELF_CONTEXT.md', 'STATUS.md', '.gitignore', 'package.json'];
    for (const rootFile of rootFiles) {
        if (seenPaths.has(rootFile)) continue;
        const rootPath = path.join(AIOS_ROOT, rootFile);
        if (fs.existsSync(rootPath)) {
            try {
                const contentLimit = rootFile.endsWith('.md') ? 8000 : 2000;
                const content = fs.readFileSync(rootPath, 'utf8').slice(0, contentLimit);
                files.push({ path: rootFile, content });
                seenPaths.add(rootFile);
            } catch (e) { /* skip */ }
        }
    }

    let qualityBaseline = {};
    const qbPath = path.join(AIOS_ROOT, 'engine', 'memory', 'quality-baseline.json');
    if (fs.existsSync(qbPath)) {
        qualityBaseline = JSON.parse(fs.readFileSync(qbPath, 'utf8'));
    }

    const systemState = {
        files,
        metrics: {},
        qualityBaseline,
        antiPatterns: [],
        projectRoot: AIOS_ROOT
    };

    const result = council.runCouncil(systemState);
    fs.writeFileSync('council-gaps.json', JSON.stringify(result, null, 2));
    console.log(`Saved ${result.totalGaps} gaps to council-gaps.json`);

} catch (err) {
    console.error(`Error: ${err.message}`);
}
