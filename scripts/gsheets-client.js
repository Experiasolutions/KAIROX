/**
 * @module gsheets-client
 * @version 1.0.0
 * @purpose Read-only Google Sheets client using a simple API key.
 *          Supports spreadsheet info and range queries.
 * @inputs  CLI flags (--read spreadsheet_id range, --info spreadsheet_id)
 * @outputs Console formatted spreadsheet data in table format
 * @dependencies .env (GOOGLE_SHEETS_API_KEY or GEMINI_API_KEY)
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const https = require('https');

const API_KEY = process.env.GOOGLE_SHEETS_API_KEY || process.env.GEMINI_API_KEY;
const BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

if (!API_KEY) {
    console.log('❌ Nenhuma API Key Google encontrada no .env');
    console.log('   Use GOOGLE_SHEETS_API_KEY ou GEMINI_API_KEY (mesma chave funciona!)');
    process.exit(1);
}

function gsheets(path) {
    return new Promise((resolve, reject) => {
        const separator = path.includes('?') ? '&' : '?';
        const url = `${BASE}${path}${separator}key=${API_KEY}`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`GSheets ${res.statusCode}: ${data.substring(0, 200)}`));
                }
            });
        }).on('error', reject);
    });
}

async function getInfo(spreadsheetId) {
    const data = await gsheets(`/${spreadsheetId}?fields=properties.title,sheets.properties`);
    console.log(`\n📊 Planilha: ${data.properties.title}\n`);
    for (const sheet of data.sheets) {
        const p = sheet.properties;
        console.log(`  📄 ${p.title} (${p.gridProperties.rowCount}x${p.gridProperties.columnCount})`);
    }
}

async function readRange(spreadsheetId, range) {
    const data = await gsheets(`/${spreadsheetId}/values/${encodeURIComponent(range)}`);
    console.log(`\n📊 ${data.range}:\n`);
    if (!data.values || data.values.length === 0) {
        console.log('  (vazio)');
        return;
    }
    // Simple table format
    const header = data.values[0];
    console.log(`  ${header.join(' | ')}`);
    console.log(`  ${header.map(() => '---').join(' | ')}`);
    for (let i = 1; i < data.values.length; i++) {
        console.log(`  ${data.values[i].join(' | ')}`);
    }
    console.log(`\n  Total: ${data.values.length - 1} rows`);
}

async function main() {
    const args = process.argv.slice(2);
    try {
        if (args[0] === '--info') await getInfo(args[1]);
        else if (args[0] === '--read') await readRange(args[1], args[2] || 'Sheet1!A:Z');
        else {
            console.log('AIOS Google Sheets Client');
            console.log('  --info <spreadsheet_id>           Info da planilha');
            console.log('  --read <spreadsheet_id> [range]    Ler dados (default: Sheet1!A:Z)');
            console.log('');
            console.log('  Nota: Funciona com o GEMINI_API_KEY que você já tem!');
            console.log('  A planilha precisa ser pública (compartilhada com "Anyone with link").');
        }
    } catch (err) {
        console.log(`❌ Erro: ${err.message}`);
    }
}

main();
