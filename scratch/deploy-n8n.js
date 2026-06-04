require('dotenv').config();
const https = require('https');

const token = process.env.RAILWAY_TOKEN;
const projectId = process.env.RAILWAY_PROJECT_ID;
const envId = process.env.RAILWAY_ENVIRONMENT_ID;
const postgresId = process.env.RAILWAY_SERVICE_POSTGRES;

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
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch(e) { reject(new Error('JSON parse error: ' + data.slice(0, 200))); }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

async function main() {
    console.log('🔍 Buscando variáveis do Postgres...\n');

    // 1. Buscar variáveis do serviço Postgres
    const varsResult = await gql(`{
        variables(
            projectId: "${projectId}"
            environmentId: "${envId}"
            serviceId: "${postgresId}"
        )
    }`);

    if (varsResult.errors) {
        console.log('❌ Erro ao buscar variáveis:', varsResult.errors[0].message);
        process.exit(1);
    }

    const pgVars = varsResult.data.variables;
    console.log('📦 Variáveis Postgres disponíveis:');
    Object.entries(pgVars).forEach(([k, v]) => {
        const masked = k.toLowerCase().includes('pass') || k.toLowerCase().includes('url') 
            ? v.slice(0, 20) + '...' : v;
        console.log(`  ${k}=${masked}`);
    });

    // Identificar DATABASE_URL ou construir manualmente
    const dbUrl = pgVars['DATABASE_URL'] || pgVars['DATABASE_PRIVATE_URL'] || pgVars['POSTGRES_URL'];
    const pgUser = pgVars['PGUSER'] || pgVars['POSTGRES_USER'];
    const pgPass = pgVars['PGPASSWORD'] || pgVars['POSTGRES_PASSWORD'];
    const pgDb = pgVars['PGDATABASE'] || pgVars['POSTGRES_DB'];
    const pgHost = pgVars['PGHOST'] || pgVars['POSTGRES_HOST'];
    const pgPort = pgVars['PGPORT'] || pgVars['POSTGRES_PORT'] || '5432';

    if (dbUrl) {
        console.log('\n✅ DATABASE_URL encontrada!');
    } else if (pgUser && pgPass && pgHost && pgDb) {
        console.log('\n✅ Variáveis individuais encontradas para construir DATABASE_URL');
    } else {
        console.log('\n⚠️  Variáveis Postgres insuficientes — listando tudo que veio:');
        console.log(JSON.stringify(pgVars, null, 2));
    }

    // 2. Criar serviço N8N
    console.log('\n🚀 Criando serviço N8N no Railway...');
    const createResult = await gql(`
        mutation ServiceCreate($input: ServiceCreateInput!) {
            serviceCreate(input: $input) {
                id
                name
            }
        }
    `, {
        input: {
            projectId,
            name: 'N8N',
            environmentId: envId,
        }
    });

    if (createResult.errors) {
        // Pode já existir
        console.log('⚠️  Erro ao criar serviço (pode já existir):', createResult.errors[0].message);
        return;
    }

    const n8nServiceId = createResult.data.serviceCreate.id;
    console.log(`✅ Serviço N8N criado! ID: ${n8nServiceId}`);

    // 3. Construir variáveis de ambiente para o N8N
    const n8nEnvVars = {};

    // DB
    if (dbUrl) {
        n8nEnvVars['DB_TYPE'] = 'postgresdb';
        n8nEnvVars['DB_POSTGRESDB_DATABASE'] = pgDb || 'railway';
        // Parse URL para extrair host/port/user/pass
        try {
            const url = new URL(dbUrl);
            n8nEnvVars['DB_POSTGRESDB_HOST'] = url.hostname;
            n8nEnvVars['DB_POSTGRESDB_PORT'] = url.port || '5432';
            n8nEnvVars['DB_POSTGRESDB_USER'] = url.username;
            n8nEnvVars['DB_POSTGRESDB_PASSWORD'] = url.password;
            n8nEnvVars['DB_POSTGRESDB_DATABASE'] = url.pathname.slice(1) || 'railway';
        } catch(e) {
            n8nEnvVars['DATABASE_URL'] = dbUrl;
        }
    } else if (pgUser && pgHost) {
        n8nEnvVars['DB_TYPE'] = 'postgresdb';
        n8nEnvVars['DB_POSTGRESDB_HOST'] = pgHost;
        n8nEnvVars['DB_POSTGRESDB_PORT'] = pgPort;
        n8nEnvVars['DB_POSTGRESDB_USER'] = pgUser;
        n8nEnvVars['DB_POSTGRESDB_PASSWORD'] = pgPass;
        n8nEnvVars['DB_POSTGRESDB_DATABASE'] = pgDb;
    }

    // N8N Config
    n8nEnvVars['N8N_PORT'] = '5678';
    n8nEnvVars['N8N_PROTOCOL'] = 'https';
    n8nEnvVars['N8N_ENCRYPTION_KEY'] = require('crypto').randomBytes(32).toString('hex');
    n8nEnvVars['N8N_BASIC_AUTH_ACTIVE'] = 'false'; // Railway gera URL pública
    n8nEnvVars['EXECUTIONS_PROCESS'] = 'main';
    n8nEnvVars['GENERIC_TIMEZONE'] = 'America/Sao_Paulo';
    n8nEnvVars['N8N_DEFAULT_LOCALE'] = 'pt-BR';
    n8nEnvVars['N8N_COMMUNITY_PACKAGES_ENABLED'] = 'true';

    console.log('\n📋 Variáveis N8N a configurar:');
    Object.keys(n8nEnvVars).forEach(k => console.log(`  ${k}`));

    // 4. Salvar N8N_SERVICE_ID no .env local (para referência)
    const fs = require('fs');
    let envContent = fs.readFileSync('.env', 'utf8');
    if (!envContent.includes('RAILWAY_SERVICE_N8N=')) {
        envContent += `\nRAILWAY_SERVICE_N8N=${n8nServiceId}`;
        fs.writeFileSync('.env', envContent);
        console.log(`\n✅ RAILWAY_SERVICE_N8N=${n8nServiceId} salvo no .env`);
    }

    // 5. Configurar Docker image
    console.log('\n🐳 Configurando Docker image: n8nio/n8n...');
    const updateResult = await gql(`
        mutation ServiceInstanceUpdate($input: ServiceInstanceUpdateInput!) {
            serviceInstanceUpdate(input: $input)
        }
    `, {
        input: {
            serviceId: n8nServiceId,
            environmentId: envId,
            source: { image: 'n8nio/n8n' },
            startCommand: '',
        }
    });

    if (updateResult.errors) {
        console.log('❌ Erro ao configurar Docker:', JSON.stringify(updateResult.errors, null, 2));
    } else {
        console.log('✅ Docker image n8nio/n8n configurado!');
    }

    // 6. Setar variáveis de ambiente
    console.log('\n🔧 Injetando variáveis de ambiente...');
    const varsUpsert = await gql(`
        mutation VariableCollectionUpsert($input: VariableCollectionUpsertInput!) {
            variableCollectionUpsert(input: $input)
        }
    `, {
        input: {
            projectId,
            environmentId: envId,
            serviceId: n8nServiceId,
            variables: n8nEnvVars,
        }
    });

    if (varsUpsert.errors) {
        console.log('❌ Erro ao injetar variáveis:', JSON.stringify(varsUpsert.errors, null, 2));
    } else {
        console.log('✅ Variáveis injetadas!');
    }

    // 7. Trigger deploy
    console.log('\n🚀 Disparando primeiro deploy...');
    const deployResult = await gql(`
        mutation ServiceInstanceDeploy($serviceId: String!, $environmentId: String!) {
            serviceInstanceDeploy(serviceId: $serviceId, environmentId: $environmentId)
        }
    `, {
        serviceId: n8nServiceId,
        environmentId: envId,
    });

    if (deployResult.errors) {
        console.log('⚠️  Erro ao disparar deploy:', deployResult.errors[0].message);
        console.log('(O deploy pode ter sido disparado automaticamente ao configurar o Docker image)');
    } else {
        console.log('✅ Deploy disparado!');
    }

    console.log('\n════════════════════════════════════════');
    console.log('  N8N DEPLOY INICIADO');
    console.log('════════════════════════════════════════');
    console.log(`  Service ID: ${n8nServiceId}`);
    console.log('  Image: n8nio/n8n');
    console.log('  Port: 5678');
    console.log('  Projeto: selfless-education (Railway)');
    console.log('\n  ⏳ Aguardar 2-3 minutos para o Railway');
    console.log('     buildar e expor a URL pública.');
    console.log('════════════════════════════════════════\n');
}

main().catch(e => { console.error('❌ Fatal:', e.message); process.exit(1); });
