require('dotenv').config();
const https = require('https');

const token = process.env.RAILWAY_TOKEN;
const n8nServiceId = process.env.RAILWAY_SERVICE_N8N;

async function gql(query) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({ query });
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
    console.log(`📊 Status do N8N (Service ID: ${n8nServiceId})`);
    const result = await gql(`{
        service(id: "${n8nServiceId}") {
            name
            deployments(first: 1) {
                edges { node { id status createdAt url } }
            }
        }
    }`);

    if (result.errors) {
        console.log('❌ Erro:', result.errors[0].message);
    } else {
        const svc = result.data.service;
        const dep = svc.deployments.edges[0]?.node;
        console.log(`   ✅ Serviço: ${svc.name}`);
        if (dep) {
            console.log(`      Status: ${dep.status}`);
            console.log(`      Deploy: ${new Date(dep.createdAt).toLocaleString('pt-BR')}`);
            if (dep.url) console.log(`      URL: ${dep.url}`);
        } else {
            console.log('      Status: Nenhum deploy encontrado.');
        }
    }
}
main();
