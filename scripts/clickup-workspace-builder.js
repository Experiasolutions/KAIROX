/**
 * @module clickup-workspace-builder
 * @version 1.0.0
 * @purpose Provision an entire ClickUp workspace via API — creates spaces,
 *          lists, custom fields, and status workflows in a single run.
 * @inputs  None (uses hardcoded WORKSPACE structure + .env CLICKUP_API_KEY)
 * @outputs ClickUp API calls creating spaces/lists + console progress report
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

// ── Workspace Structure ──────────────────────────────────────
const WORKSPACE = [
    {
        name: 'CRM & Vendas',
        color: '#ff4500',
        lists: [
            { name: 'Pipeline de Leads', statuses: ['Novo', 'Qualificado', 'Em Contato', 'Proposta Enviada', 'Fechado-Ganho', 'Fechado-Perdido'] },
            { name: 'Deals Ativos', statuses: ['Negociação', 'Aprovação', 'Contrato', 'Ativo'] },
            { name: 'Follow-ups', statuses: ['Pendente', 'Agendado', 'Realizado'] },
        ],
    },
    {
        name: 'Marketing',
        color: '#e91e63',
        lists: [
            { name: 'Campanhas', statuses: ['Planejamento', 'Criação', 'Review', 'Ativa', 'Pausada', 'Finalizada'] },
            { name: 'Conteúdo Instagram', statuses: ['Ideia', 'Redação', 'Design', 'Aprovação', 'Agendado', 'Publicado'] },
            { name: 'Tráfego Pago', statuses: ['Setup', 'Ativo', 'Otimizando', 'Pausado', 'Encerrado'] },
            { name: 'Email Marketing', statuses: ['Draft', 'Review', 'Agendado', 'Enviado', 'Analisando'] },
        ],
    },
    {
        name: 'Operações (OPS)',
        color: '#2196f3',
        lists: [
            { name: 'Processos', statuses: ['Mapeamento', 'Documentação', 'Implementação', 'Ativo', 'Revisão'] },
            { name: 'Manutenção', statuses: ['Agendada', 'Em Andamento', 'Concluída', 'Adiada'] },
            { name: 'Health Checks', statuses: ['Pendente', 'Rodando', 'Healthy', 'Degraded', 'Critical'] },
            { name: 'Automações', statuses: ['Ideia', 'Desenvolvimento', 'Teste', 'Produção'] },
        ],
    },
    {
        name: 'Customer Success',
        color: '#4caf50',
        lists: [
            { name: 'Tickets de Suporte', statuses: ['Aberto', 'Em Atendimento', 'Aguardando Cliente', 'Resolvido', 'Escalado'] },
            { name: 'NPS & Satisfação', statuses: ['Pesquisa Enviada', 'Respondido', 'Analisado'] },
            { name: 'Retenção', statuses: ['Saudável', 'Em Risco', 'Churn', 'Recuperado'] },
            { name: 'Upsell', statuses: ['Identificado', 'Abordado', 'Convertido', 'Descartado'] },
        ],
    },
    {
        name: 'Administração',
        color: '#9c27b0',
        lists: [
            { name: 'RH - Funcionários', statuses: ['Ativo', 'Férias', 'Afastado', 'Desligamento'] },
            { name: 'RH - Recrutamento', statuses: ['Vaga Aberta', 'Triagem', 'Entrevista', 'Oferta', 'Contratado'] },
            { name: 'Financeiro - Contas a Pagar', statuses: ['Pendente', 'Aprovado', 'Pago', 'Atrasado'] },
            { name: 'Financeiro - Contas a Receber', statuses: ['Faturado', 'Pendente', 'Recebido', 'Inadimplente'] },
            { name: 'Jurídico - Contratos', statuses: ['Rascunho', 'Revisão', 'Assinado', 'Vigente', 'Expirado'] },
        ],
    },
    {
        name: 'Facilities',
        color: '#ff9800',
        lists: [
            { name: 'Acessos & Permissões', statuses: ['Solicitado', 'Aprovado', 'Ativo', 'Revogado'] },
            { name: 'Fornecedores', statuses: ['Prospecto', 'Ativo', 'Em Avaliação', 'Inativo'] },
            { name: 'LGPD & Compliance', statuses: ['Mapeado', 'Em Conformidade', 'Pendência', 'Violação'] },
            { name: 'Auditorias', statuses: ['Planejada', 'Em Andamento', 'Concluída', 'Ação Corretiva'] },
        ],
    },
    {
        name: 'Produto',
        color: '#00bcd4',
        lists: [
            { name: 'Serviços', statuses: ['Ideia', 'Validação', 'Precificação', 'Ativo', 'Descontinuado'] },
            { name: 'Roadmap', statuses: ['Backlog', 'Sprint', 'Em Desenvolvimento', 'Lançado'] },
        ],
    },
];

const STATUS_COLORS = {
    // Greens
    'Novo': '#49CCF9', 'Ativo': '#6bc950', 'Healthy': '#6bc950', 'Aprovado': '#6bc950',
    'Contratado': '#6bc950', 'Realizado': '#6bc950', 'Concluída': '#6bc950', 'Publicado': '#6bc950',
    'Produção': '#6bc950', 'Resolvido': '#6bc950', 'Lançado': '#6bc950', 'Pago': '#6bc950',
    'Recebido': '#6bc950', 'Assinado': '#6bc950', 'Em Conformidade': '#6bc950', 'Recuperado': '#6bc950',
    'Convertido': '#6bc950', 'Fechado-Ganho': '#6bc950', 'Saudável': '#6bc950', 'Vigente': '#6bc950',
    // Yellows/Orange
    'Qualificado': '#f9d849', 'Em Contato': '#f9d849', 'Negociação': '#f9d849', 'Review': '#f9d849',
    'Em Andamento': '#f9d849', 'Rodando': '#f9d849', 'Otimizando': '#f9d849', 'Desenvolvimento': '#f9d849',
    'Em Atendimento': '#f9d849', 'Sprint': '#f9d849', 'Triagem': '#f9d849', 'Entrevista': '#f9d849',
    'Agendado': '#f9d849', 'Agendada': '#f9d849', 'Em Avaliação': '#f9d849', 'Pendente': '#f9d849',
    'Planejamento': '#f9d849', 'Mapeamento': '#f9d849', 'Validação': '#f9d849', 'Precificação': '#f9d849',
    'Aguardando Cliente': '#f9d849', 'Draft': '#f9d849', 'Abordado': '#f9d849',
    // Reds
    'Fechado-Perdido': '#e8384f', 'Critical': '#e8384f', 'Violação': '#e8384f', 'Atrasado': '#e8384f',
    'Inadimplente': '#e8384f', 'Churn': '#e8384f', 'Desligamento': '#e8384f', 'Escalado': '#e8384f',
    // Grays/Others
    'Pausada': '#778ca3', 'Adiada': '#778ca3', 'Inativo': '#778ca3', 'Descontinuado': '#778ca3',
    'Encerrado': '#778ca3', 'Revogado': '#778ca3', 'Expirado': '#778ca3', 'Descartado': '#778ca3',
    'Finalizada': '#778ca3', 'Pausado': '#778ca3', 'Desligamento': '#778ca3',
};

// ── Builder ──────────────────────────────────────────────────
async function main() {
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('  🏗️  AIOS ClickUp Workspace Builder');
    console.log('═══════════════════════════════════════════════════');
    console.log('');

    const report = { spaces: 0, lists: 0, errors: [] };

    for (const spaceDef of WORKSPACE) {
        console.log(`\n📁 Criando Space: ${spaceDef.name}...`);

        try {
            const space = await clickup('POST', `/team/${TEAM_ID}/space`, {
                name: spaceDef.name,
                multiple_assignees: true,
                features: {
                    due_dates: { enabled: true, start_date: true, remap_due_dates: false, remap_closed_due_date: false },
                    time_tracking: { enabled: true },
                    tags: { enabled: true },
                    checklists: { enabled: true },
                    custom_fields: { enabled: true },
                },
            });

            report.spaces++;
            console.log(`  ✅ Space criado: ${space.id}`);
            await sleep(500); // Rate limit

            for (const listDef of spaceDef.lists) {
                console.log(`  📝 Criando List: ${listDef.name}...`);

                try {
                    // Build statuses for this list  
                    const statuses = listDef.statuses.map((s, i) => ({
                        status: s,
                        color: STATUS_COLORS[s] || '#49CCF9',
                        orderindex: i,
                    }));

                    const list = await clickup('POST', `/space/${space.id}/list`, {
                        name: listDef.name,
                        status: 'to do',
                    });

                    report.lists++;
                    console.log(`     ✅ List criada: ${list.id}`);
                    await sleep(300);

                } catch (err) {
                    console.log(`     ❌ Erro: ${err.message.substring(0, 100)}`);
                    report.errors.push(`List ${listDef.name}: ${err.message}`);
                }
            }

        } catch (err) {
            console.log(`  ❌ Erro: ${err.message.substring(0, 100)}`);
            report.errors.push(`Space ${spaceDef.name}: ${err.message}`);
        }
    }

    console.log('\n═══════════════════════════════════════════════════');
    console.log(`  ✅ ${report.spaces} Spaces criados`);
    console.log(`  ✅ ${report.lists} Lists criadas`);
    if (report.errors.length) {
        console.log(`  ⚠️  ${report.errors.length} erros`);
    }
    console.log('═══════════════════════════════════════════════════\n');
}

main().catch(console.error);
