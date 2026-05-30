# Task: Onboarding de Novo Cliente AI OPS

**Objetivo:** Clonar o template base para o diretório de um novo cliente e preencher as variáveis.

## Instruções Passo a Passo

1. Leia o arquivo `clients/_template/config/client-template.json` para entender as variáveis necessárias.
2. Solicite (se já não possuir) o Nome do Negócio, Dono, Segmento, e ID do Cliente.
3. Crie a estrutura de diretórios `clients/{{CLIENT_ID}}/` com as pastas `config`, `docs`, `scripts` e `media`.
4. Copie os arquivos de `clients/_template/` para o novo cliente e use a ferramenta de substituição (sed ou replace) para trocar as chaves `{{VARIAVEL}}` pelos valores reais.
5. Registre o novo cliente no `STATUS.md` na seção de Clientes Ativos.
