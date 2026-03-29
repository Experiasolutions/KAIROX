/**
 * @module clickup-workspace-fix
 * @version 1.0.0
 * @purpose Phase 2 workspace builder — adds lists to existing spaces and
 *          creates folders for merged departments (free plan 5-space limit).
 * @inputs  None (uses hardcoded space IDs + .env CLICKUP_API_KEY)
 * @outputs ClickUp API calls creating folders/lists + console report
 * @dependencies .env (CLICKUP_API_KEY)
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const https = require('https');

const API_KEY = process.env.CLICKUP_API_KEY;
const TEAM_ID = '90133047492';
const BASE = 'https://api.clickup.com/api/v2';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function clickup(method, path, body) {
    return new Promise((resolve, reject) => {
        const url = new URL(`${BASE}${path}`);
        const options = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method,
            headers: {
                'Authorization': API_KEY,
                'Content-Type': 'application/json',
            },
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`ClickUp ${res.statusCode}: ${data.substring(0, 300)}`));
                }
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

// ── Phase 2: Add lists to existing spaces ────────────────────
// Spaces created in Phase 1:
// 901313283844 = CRM & Vendas
// 901313283845 = Marketing
// 901313283847 = Operações (OPS)
// 901313283848 = Customer Success
// 901313277502 = Espaço da equipe (original — use for Admin/Facilities/Produto)

const LISTS_BY_SPACE = {
    '901313283844': [ // CRM & Vendas
        'Pipeline de Leads',
        'Deals Ativos',
        'Follow-ups',
    ],
    '901313283845': [ // Marketing
        'Campanhas',
        'Conteúdo Instagram',
        'Tráfego Pago',
        'Email Marketing',
    ],
    '901313283847': [ // Operações (OPS)
        'Processos',
        'Manutenção',
        'Health Checks',
        'Automações',
    ],
    '901313283848': [ // Customer Success
        'Tickets de Suporte',
        'NPS & Satisfação',
        'Retenção',
        'Upsell',
    ],
};

// These go as Folders inside "Espaço da equipe" (901313277502)
const FOLDERS_IN_TEAM_SPACE = {
    'Administração': [
        'RH - Funcionários',
        'RH - Recrutamento',
        'Financeiro - Contas a Pagar',
        'Financeiro - Contas a Receber',
        'Jurídico - Contratos',
    ],
    'Facilities': [
        'Acessos & Permissões',
        'Fornecedores',
        'LGPD & Compliance',
        'Auditorias',
    ],
    'Produto': [
        'Serviços',
        'Roadmap',
    ],
};

async function main() {
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('  🔧 AIOS ClickUp Workspace Fix (Phase 2)');
    console.log('═══════════════════════════════════════════════════');
    console.log('');

    let lists = 0, folders = 0, errors = 0;

    // 1. Add Lists directly to existing Spaces
    for (const [spaceId, listNames] of Object.entries(LISTS_BY_SPACE)) {
        for (const name of listNames) {
            try {
                console.log(`  📝 Criando List: ${name} (Space ${spaceId})...`);
                const list = await clickup('POST', `/space/${spaceId}/list`, { name });
                console.log(`     ✅ ID: ${list.id}`);
                lists++;
                await sleep(400);
            } catch (err) {
                console.log(`     ❌ ${err.message.substring(0, 80)}`);
                errors++;
            }
        }
    }

    // 2. Create Folders + Lists in "Espaço da equipe"
    const teamSpaceId = '901313277502';

    for (const [folderName, listNames] of Object.entries(FOLDERS_IN_TEAM_SPACE)) {
        try {
            console.log(`\n  📁 Criando Folder: ${folderName}...`);
            const folder = await clickup('POST', `/space/${teamSpaceId}/folder`, { name: folderName });
            console.log(`     ✅ Folder ID: ${folder.id}`);
            folders++;
            await sleep(400);

            for (const listName of listNames) {
                try {
                    console.log(`     📝 Criando List: ${listName}...`);
                    const list = await clickup('POST', `/folder/${folder.id}/list`, { name: listName });
                    console.log(`        ✅ ID: ${list.id}`);
                    lists++;
                    await sleep(400);
                } catch (err) {
                    console.log(`        ❌ ${err.message.substring(0, 80)}`);
                    errors++;
                }
            }
        } catch (err) {
            console.log(`     ❌ ${err.message.substring(0, 80)}`);
            errors++;
        }
    }

    console.log('\n═══════════════════════════════════════════════════');
    console.log(`  ✅ ${folders} Folders criados`);
    console.log(`  ✅ ${lists} Lists criadas`);
    if (errors) console.log(`  ⚠️  ${errors} erros`);
    console.log('═══════════════════════════════════════════════════\n');
}

main().catch(console.error);
