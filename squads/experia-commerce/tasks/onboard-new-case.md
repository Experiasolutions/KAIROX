# TASK: Protocolo de Onboarding de Novo Cliente
**Squad:** experia-commerce (ou mvp-admin)
**Role:** commerce-sales / admin-master

# OBJECTIVE
Configurar um novo cliente do zero até o bot estar rodando na Evolution API em menos de 2h30. O "Pareto ao Cubo" em ação.

# INSTRUCTIONS

## 1. DIAGNÓSTICO (30 min)
- Use o `diagnose-comercio.md` e o `brief-template.md` numa conversa com o cliente.
- Colete: Segmento, Dores principais, Canais, Tom de voz, Serviços principais e Ticket Médio.

## 2. INSTANCIAÇÃO (15 min)
- Copie a pasta `clients/_template/` para `clients/[novo-cliente]/`.
- Preencha o arquivo `clients/[novo-cliente]/config/client-template.json` com os dados coletados.

## 3. PERSONALIZAÇÃO (45 min)
- Acione o `@commerce-clone`.
- Adapte os scripts de `wa-recepcao.md`, `wa-triagem.md`, e `wa-followup.md` injetando a voz do dono e os serviços corretos.

## 4. CONFIGURAÇÃO TÉCNICA (30 min)
- **Evolution API:** Crie a instância `[nome]-nicho` no painel.
- **Supabase:** Faça um insert em `kairos_clients`.
- **Router:** Adicione a instância no arquivo `scripts/whatsapp-router.js`.

## 5. TESTES (20 min)
- Teste 5 cenários mandando mensagem pro bot: (1) Interesse inicial, (2) Perguntar o preço de cara, (3) Ignorar o bot pra ver se o follow-up roda, (4) Fazer uma reclamação pesada (transbordo), (5) Perguntar algo muito específico.

## 6. GO LIVE
- Mostre pro dono: "Parece você falando?"
- Se sim, conecte o número oficial e ative o bot.

# EXPECTED OUTPUT
Cliente 100% configurado, testado e operando no piloto automático.
