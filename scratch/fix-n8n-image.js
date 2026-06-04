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
    console.log(`🐳 Configurando Docker image n8nio/n8n para o serviço: ${n8nServiceId}`);
    
    const updateResult = await gql(`
        mutation ServiceInstanceUpdate($serviceId: String!, $environmentId: String!, $input: ServiceInstanceUpdateInput!) {
            serviceInstanceUpdate(serviceId: $serviceId, environmentId: $environmentId, input: $input)
        }
    `, {
        serviceId: n8nServiceId,
        environmentId: envId,
        input: {
            source: { image: 'n8nio/n8n' }
        }
    });

    if (updateResult.errors) {
        console.log('❌ Erro:', JSON.stringify(updateResult.errors, null, 2));
    } else {
        console.log('✅ Imagem Docker configurada!');
        
        console.log('🚀 Disparando deploy...');
        const deployResult = await gql(`
            mutation ServiceInstanceDeploy($serviceId: String!, $environmentId: String!) {
                serviceInstanceDeploy(serviceId: $serviceId, environmentId: $environmentId)
            }
        `, {
            serviceId: n8nServiceId,
            environmentId: envId,
        });
        
        if (deployResult.errors) {
            console.log('⚠️ Erro no deploy:', deployResult.errors[0].message);
        } else {
            console.log('✅ Deploy iniciado!');
        }
    }
}
main();
