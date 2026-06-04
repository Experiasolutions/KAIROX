# Skill: Railway

## Descrição
Integração com Railway via CLI para gestão de serviços no projeto do usuário. Railway fornece Postgres, Redis e hospedagem de serviços Node.js no free tier.

## Pré-requisitos
- Railway CLI instalado (`npm install -g @railway/cli`)
- Token de autenticação configurado (em posse do operador GABS)
- Projeto Railway identificado no dashboard

## Operações disponíveis
- Deploy de serviço via `railway up`
- Leitura de logs via `railway logs`
- Gestão de variáveis de ambiente via `railway variables`
- Status de serviços via `railway status`

## Scripts no arsenal
- `arsenal/railway_deploy.sh` — deploy de um serviço específico
- `arsenal/railway_logs.sh` — tail de logs
- `arsenal/railway_env.sh` — lista variáveis de ambiente

## Acesso via MCP
Use `kairos_explore_arsenal` para listar os scripts e `kairos_read_script` para ler o conteúdo de cada um.

## Limitações free tier
- Execução limitada por horas de CPU/mês
- Sleep automático após inatividade prolongada
- Postgres e Redis disponíveis mas com limites de storage
