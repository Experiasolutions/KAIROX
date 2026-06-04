require('dotenv').config();
const https = require('https');

const token = process.env.RAILWAY_TOKEN;
const projectId = process.env.RAILWAY_PROJECT_ID;
const envId = process.env.RAILWAY_ENVIRONMENT_ID;
const n8nServiceId = process.env.RAILWAY_SERVICE_N8N;

async function gql(query, variables = {}) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({ query, variables });
        const req = https.request({
            hostname: 'backboard.railway.com',
            path: '/graphql/v2',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Content-Length': Buffer.byteLength(body),
            },
        }, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => resolve(JSON.parse(data)));
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

async function main() {
    console.log(`🔧 Atualizando WEBHOOK_URL no N8N...`);

    // Busca as vars atuais
    const varsResult = await gql(`{
        variables(projectId: "${projectId}", environmentId: "${envId}", serviceId: "${n8nServiceId}")
    }`);

    const vars = varsResult.data?.variables || {};
    vars['WEBHOOK_URL'] = 'https://n8n-production-e77a.up.railway.app';

    // Salva as vars
    const varsUpsert = await gql(`
        mutation VariableCollectionUpsert($input: VariableCollectionUpsertInput!) {
            variableCollectionUpsert(input: $input)
        }
    `, {
        input: { projectId, environmentId: envId, serviceId: n8nServiceId, variables: vars }
    });

    if (varsUpsert.errors) {
        console.log('❌ Erro ao atualizar variáveis:', JSON.stringify(varsUpsert.errors, null, 2));
    } else {
        console.log('✅ WEBHOOK_URL configurada!');
        console.log('🚀 Reiniciando N8N para aplicar (Railway faz isso automaticamente ao mudar as vars)...');
    }
}
main();
