require('dotenv').config();
const https = require('https');

const token = process.env.RAILWAY_TOKEN;
const n8nServiceId = process.env.RAILWAY_SERVICE_N8N;
const envId = process.env.RAILWAY_ENVIRONMENT_ID;
const projectId = process.env.RAILWAY_PROJECT_ID;

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
    console.log(`🌐 Buscando/gerando domínio para N8N...`);
    
    // Lista os domínios atuais
    const svcQuery = await gql(`{
        service(id: "${n8nServiceId}") {
            serviceInstances {
                edges {
                    node {
                        environmentId
                        domains {
                            serviceDomain { domain }
                            customDomains { domain }
                        }
                    }
                }
            }
        }
    }`);

    let hasDomain = false;
    let url = '';
    const instances = svcQuery.data?.service?.serviceInstances?.edges || [];
    instances.forEach(({ node }) => {
        if (node.environmentId === envId) {
            const sd = node.domains?.serviceDomain?.domain;
            if (sd) { hasDomain = true; url = sd; }
        }
    });

    if (hasDomain) {
        console.log(`✅ Domínio já existe: https://${url}`);
    } else {
        console.log(`⚠️ Nenhum domínio público encontrado. Tentando gerar um Service Domain...`);
        const domainResult = await gql(`
            mutation ServiceDomainCreate($input: ServiceDomainCreateInput!) {
                serviceDomainCreate(input: $input) { domain }
            }
        `, {
            input: {
                environmentId: envId,
                serviceId: n8nServiceId
            }
        });

        if (domainResult.errors) {
            console.log('❌ Erro ao criar domínio:', JSON.stringify(domainResult.errors, null, 2));
        } else {
            console.log(`✅ Domínio gerado com sucesso: https://${domainResult.data.serviceDomainCreate.domain}`);
        }
    }
}
main();
