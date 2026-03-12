const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname);
const AIOS_ROOT = PROJECT_ROOT;

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
                    const content = fs.readFileSync(path.join(dir, entry.name), 'utf8').slice(0, 500);
                    results.push({ path: relPath, content });
                } catch (e) { /* skip unreadable */ }
            } else if (entry.isDirectory()) {
                // 1-level deep scan for structure detection
                results.push({ path: relPath + '/', content: '' });
                const subEntries = fs.readdirSync(path.join(dir, entry.name), { withFileTypes: true }).slice(0, 5);
                for (const sub of subEntries) {
                    if (sub.isFile()) {
                        try {
                            const subContent = fs.readFileSync(path.join(dir, entry.name, sub.name), 'utf8').slice(0, 300);
                            results.push({ path: `${relPath}/${sub.name}`, content: subContent });
                        } catch (e) { /* skip */ }
                    }
                }
            }
        }
    } catch (e) { /* skip inaccessible */ }
    return results;
}

try {
    const councilPath = path.join(AIOS_ROOT, 'scripts', 'evolution', 'ia-council-engine.js');
    const council = require(councilPath);

    let files = [];
    const dirsToScan = [
        ['scripts', 'scripts'],
        ['scripts/evolution', 'scripts/evolution'],
        ['squads', 'squads'],
        ['docs', 'docs'],
        ['reasoning-packages', 'reasoning-packages'],
        ['.aios-core/opus-replicator', '.aios-core/opus-replicator'],
        ['.aios-core/core', '.aios-core/core'],
        ['.aios-core/noesis', '.aios-core/noesis'],
        ['.aios-core/data', '.aios-core/data'],
        ['clients/experia/config', 'clients/experia/config'],
        ['.antigravity/agents', '.antigravity/agents'],
    ];

    for (const [dir, prefix] of dirsToScan) {
        const fullPath = path.join(AIOS_ROOT, dir);
        files = files.concat(scanDirForCouncil(fullPath, prefix));
    }

    let qualityBaseline = {};
    const qbPath = path.join(AIOS_ROOT, '.aios-core', 'data', 'quality-baseline.json');
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
