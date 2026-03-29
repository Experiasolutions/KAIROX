/**
 * @module clickup-client
 * @version 1.0.0
 * @purpose CRUD client for ClickUp API — list teams, spaces, lists, tasks;
 *          create and update tasks programmatically.
 * @inputs  CLI flags (--teams, --spaces, --lists, --tasks, --create, --update)
 * @outputs Console formatted task/list/space data
 * @dependencies .env (CLICKUP_API_KEY)
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const https = require('https');

const API_KEY = process.env.CLICKUP_API_KEY;
const CLIENT_ID = process.env.CLICKUP_CLIENT_ID;
const BASE = 'https://api.clickup.com/api/v2';

if (!API_KEY) {
    if (CLIENT_ID) {
        console.log('⚠️  Você tem Client ID/Secret (OAuth App), mas precisa de um Personal API Token.');
    } else {
        console.log('❌ Nenhuma credencial ClickUp encontrada no .env');
    }
    console.log('');
    console.log('  📝 Como pegar o Personal API Token:');
    console.log('  1. Abra ClickUp → avatar (canto inferior esquerdo)');
    console.log('  2. Settings → Apps');
    console.log('  3. Seção "API Token" → clique em Generate');
    console.log('  4. Copie o token (formato: pk_12345678_XXXX...)');
    console.log('  5. Cole no .env: CLICKUP_API_KEY=pk_SEU_TOKEN');
    console.log('');
    process.exit(1);
}

// ── HTTP Client ──────────────────────────────────────────────
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
                    reject(new Error(`ClickUp ${res.statusCode}: ${data.substring(0, 200)}`));
                }
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

// ── Commands ─────────────────────────────────────────────────
async function listTeams() {
    const data = await clickup('GET', '/team');
    console.log('\n🏢 Teams:\n');
    for (const team of data.teams) {
        console.log(`  ID: ${team.id} | Nome: ${team.name} | Membros: ${team.members.length}`);
    }
}

async function listSpaces() {
    const teams = await clickup('GET', '/team');
    const teamId = teams.teams[0]?.id;
    if (!teamId) { console.log('❌ Nenhum team encontrado'); return; }

    const data = await clickup('GET', `/team/${teamId}/space?archived=false`);
    console.log(`\n📁 Spaces (Team ${teamId}):\n`);
    for (const space of data.spaces) {
        console.log(`  ID: ${space.id} | ${space.name}`);
    }
}

async function listLists(spaceId) {
    const data = await clickup('GET', `/space/${spaceId}/folder?archived=false`);
    console.log(`\n📋 Folders/Lists (Space ${spaceId}):\n`);

    // Folderless lists
    const folderless = await clickup('GET', `/space/${spaceId}/list?archived=false`);
    for (const list of folderless.lists) {
        console.log(`  📝 List: ${list.id} | ${list.name} (${list.task_count || 0} tasks)`);
    }

    for (const folder of data.folders) {
        console.log(`  📁 Folder: ${folder.id} | ${folder.name}`);
        for (const list of folder.lists) {
            console.log(`     📝 List: ${list.id} | ${list.name} (${list.task_count || 0} tasks)`);
        }
    }
}

async function listTasks(listId) {
    const data = await clickup('GET', `/list/${listId}/task?archived=false&page=0`);
    console.log(`\n📋 Tasks (List ${listId}):\n`);
    for (const task of data.tasks) {
        const status = task.status?.status || 'N/A';
        const priority = task.priority?.priority || '-';
        console.log(`  [${status}] ${task.name} (ID: ${task.id}, Priority: ${priority})`);
    }
    console.log(`\n  Total: ${data.tasks.length} tasks`);
}

async function createTask(listId, name, description) {
    const data = await clickup('POST', `/list/${listId}/task`, {
        name,
        description: description || `Criado pelo AIOS em ${new Date().toISOString()}`,
        status: 'to do',
    });
    console.log(`\n✅ Task criada:`);
    console.log(`  ID: ${data.id}`);
    console.log(`  Nome: ${data.name}`);
    console.log(`  URL: ${data.url}`);
}

async function updateTask(taskId, status) {
    const data = await clickup('PUT', `/task/${taskId}`, { status });
    console.log(`\n✅ Task atualizada:`);
    console.log(`  ID: ${data.id} | Status: ${data.status?.status}`);
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
    const args = process.argv.slice(2);

    try {
        if (args[0] === '--teams') await listTeams();
        else if (args[0] === '--spaces') await listSpaces();
        else if (args[0] === '--lists') await listLists(args[1]);
        else if (args[0] === '--tasks') await listTasks(args[1]);
        else if (args[0] === '--create') await createTask(args[1], args[2], args[3]);
        else if (args[0] === '--update') await updateTask(args[1], args[2]);
        else {
            console.log('AIOS ClickUp Client');
            console.log('  --teams                    Lista teams');
            console.log('  --spaces                   Lista spaces');
            console.log('  --lists <space_id>         Lista lists');
            console.log('  --tasks <list_id>          Lista tasks');
            console.log('  --create <list_id> "nome"  Cria task');
            console.log('  --update <task_id> "status" Atualiza task');
        }
    } catch (err) {
        console.log(`❌ Erro: ${err.message}`);
    }
}

main();
