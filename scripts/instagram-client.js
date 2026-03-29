/**
 * @module instagram-client
 * @version 1.0.0
 * @purpose Instagram Graph API client — fetch profile, media, insights,
 *          and publish posts via Business Account.
 * @inputs  CLI flags (--profile, --media, --insights, --publish)
 * @outputs Console formatted Instagram data or published post confirmation
 * @dependencies .env (INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_BUSINESS_ID)
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const https = require('https');

const TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const IG_ID = process.env.INSTAGRAM_BUSINESS_ID;
const API_VERSION = 'v19.0';
const BASE = `https://graph.facebook.com/${API_VERSION}`;

if (!TOKEN || !IG_ID) {
    console.log('❌ INSTAGRAM_ACCESS_TOKEN ou INSTAGRAM_BUSINESS_ID não encontrado no .env');
    console.log('   Siga o guia: docs/setup-clickup-instagram.md');
    process.exit(1);
}

// ── HTTP Client ──────────────────────────────────────────────
function graphAPI(path) {
    return new Promise((resolve, reject) => {
        const separator = path.includes('?') ? '&' : '?';
        const url = `${BASE}${path}${separator}access_token=${TOKEN}`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`Instagram ${res.statusCode}: ${data.substring(0, 200)}`));
                }
            });
        }).on('error', reject);
    });
}

function graphPost(path, body) {
    return new Promise((resolve, reject) => {
        const url = new URL(`${BASE}${path}`);
        const postData = new URLSearchParams({ ...body, access_token: TOKEN }).toString();
        const options = {
            hostname: url.hostname,
            path: url.pathname,
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`Instagram POST ${res.statusCode}: ${data.substring(0, 200)}`));
                }
            });
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

// ── Commands ─────────────────────────────────────────────────
async function getProfile() {
    try {
        // Try as Instagram Business Account first
        const data = await graphAPI(`/${IG_ID}?fields=name,username,followers_count,follows_count,media_count`);
        console.log('\n📸 Perfil Instagram:\n');
        console.log(`  Nome: ${data.name || 'N/A'}`);
        console.log(`  @${data.username || 'N/A'}`);
        console.log(`  Seguidores: ${data.followers_count || 0}`);
        console.log(`  Seguindo: ${data.follows_count || 0}`);
        console.log(`  Posts: ${data.media_count || 0}`);
        console.log(`  ID: ${IG_ID}`);
    } catch (err) {
        // Maybe it's a Page ID — try to get the instagram_business_account
        console.log('  Tentando como Page ID...');
        try {
            const pageData = await graphAPI(`/${IG_ID}?fields=instagram_business_account,name`);
            if (pageData.instagram_business_account) {
                const igId = pageData.instagram_business_account.id;
                console.log(`  ✅ Instagram Business Account encontrado: ${igId}`);
                console.log(`  📝 Atualize INSTAGRAM_BUSINESS_ID=${igId} no .env`);
                const data = await graphAPI(`/${igId}?fields=name,username,followers_count,follows_count,media_count`);
                console.log('\n📸 Perfil Instagram:\n');
                console.log(`  Nome: ${data.name || 'N/A'}`);
                console.log(`  @${data.username || 'N/A'}`);
                console.log(`  Seguidores: ${data.followers_count || 0}`);
                console.log(`  Seguindo: ${data.follows_count || 0}`);
                console.log(`  Posts: ${data.media_count || 0}`);
            } else {
                console.log(`  ❌ Nenhum Instagram Business Account vinculado a esta Page`);
            }
        } catch (e2) {
            console.log(`  ❌ Erro: ${e2.message}`);
        }
    }
}

async function listMedia() {
    const data = await graphAPI(`/${IG_ID}/media?fields=id,caption,media_type,timestamp,like_count,comments_count,permalink&limit=10`);
    console.log('\n📋 Últimos 10 posts:\n');
    for (const post of data.data) {
        const caption = (post.caption || '').substring(0, 60);
        console.log(`  [${post.media_type}] ${caption}...`);
        console.log(`    ❤️ ${post.like_count || 0} | 💬 ${post.comments_count || 0} | ${post.timestamp}`);
        console.log(`    🔗 ${post.permalink}\n`);
    }
}

async function getInsights(days) {
    const period = days <= 7 ? 'day' : 'days_28';
    const metrics = 'impressions,reach,profile_views';
    const data = await graphAPI(`/${IG_ID}/insights?metric=${metrics}&period=${period}`);
    console.log(`\n📊 Insights (${days} dias):\n`);
    for (const metric of data.data) {
        const value = metric.values?.[metric.values.length - 1]?.value || 0;
        console.log(`  ${metric.title}: ${value}`);
    }
}

async function publishPost(caption, imageUrl) {
    console.log('\n📤 Publicando post...\n');

    // Step 1: Create media container
    const container = await graphPost(`/${IG_ID}/media`, {
        caption,
        image_url: imageUrl,
    });
    console.log(`  Container criado: ${container.id}`);

    // Step 2: Publish
    const publish = await graphPost(`/${IG_ID}/media_publish`, {
        creation_id: container.id,
    });
    console.log(`  ✅ Publicado! ID: ${publish.id}`);
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
    const args = process.argv.slice(2);

    try {
        if (args[0] === '--profile') await getProfile();
        else if (args[0] === '--media') await listMedia();
        else if (args[0] === '--insights') await getInsights(parseInt(args[1]) || 7);
        else if (args[0] === '--publish') await publishPost(args[1], args[2]);
        else {
            console.log('AIOS Instagram Client');
            console.log('  --profile                  Perfil e metricas');
            console.log('  --media                    Lista posts recentes');
            console.log('  --insights <days>          Insights do periodo');
            console.log('  --publish "caption" <url>  Publicar post');
        }
    } catch (err) {
        console.log(`❌ Erro: ${err.message}`);
    }
}

main();
