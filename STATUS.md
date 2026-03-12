# KAIROS — STATUS (Fila de Trabalho)

> **Última atualização:** 2026-03-12T09:42:00-03:00

---

## 🔴 BLOQUEADO (Precisa de Ação do Gabriel)

1. **Aplicar SQL Schema no Supabase**
   - Abrir SQL Editor em `ptpojwbdxgmvykwwzatl.supabase.co`
   - Colar conteúdo de `kairos-orchestrator/kairos-supabase-schema.sql`
   - Ou usar o prompt AI em `kairos-orchestrator/SUPABASE-SETUP-PROMPT.md`

2. **Configurar as 4 Gemini API Keys no `.env`**
   - Formato: `GOOGLE_API_KEYS=key1,key2,key3,key4`
   - Gabriel confirmou que tem 4 keys prontas

3. **`pip install supabase`** — Travou na sessão anterior (Celeron lento)
   - Tentar de novo: `pip install supabase --no-cache-dir`

---

## 🟡 EM PROGRESSO

### KAIROS SKY — Deploy
- [x] Código Python completo (12 módulos)
- [x] GitHub pushado (4 commits)
- [x] Supabase URL + service_role no `.env`
- [ ] Aplicar SQL schema no Supabase
- [ ] Configurar GOOGLE_API_KEYS (4 keys) no `.env`
- [ ] pip install + teste local
- [ ] Deploy Railway
- [ ] Teste bot Telegram

### Hortifruti MVP — Entrega para Elaine
- [x] Persona Safra + Squad (4 agentes)
- [x] 4 flows de conversa completos
- [x] Estoque seed (17 produtos + preços)
- [x] Kit apresentação (scripts, ROI, pitch)
- [x] Guia WhatsApp Bot (3 caminhos)
- [ ] Configurar bot no Botpress ou Evolution API
- [ ] Testar com Elaine ao vivo
- [ ] Tirar fotos das lojas
- [ ] Criar posts Instagram com fotos reais
- [ ] Fechar permuta formal

### Padronização Amostra Grátis
- [x] Template universal de config (`TEMPLATE-CONFIG-UNIVERSAL.json`)
- [x] Intake rápido de visita (`INTAKE-RAPIDO-VISITA.md`)
- [ ] Aplicar template no primeiro comércio extra
- [ ] Documentar processo end-to-end
- [ ] Expandir para 5+ comércios locais

---

## ✅ CONCLUÍDO RECENTEMENTE

| Data       | O que                                                    |
| :--------- | :------------------------------------------------------- |
| 2026-03-11 | Guia WhatsApp Bot (Botpress/Evolution/KAIROS)            |
| 2026-03-11 | MVP Kit Apresentação Hortifruti                          |
| 2026-03-10 | KAIROS SKY orquestrador completo em Python               |
| 2026-03-10 | Knowledge Brain indexer (360+ arquivos mapeados)         |
| 2026-03-10 | Supabase schema (12 tabelas + search function)           |
| 2026-03-10 | Intelligence audit — mapeamento do "cérebro fragmentado" |

---

## 📅 AGENDA DO DIA (2026-03-12)

1. **Configurar KAIROS SKY** (Supabase schema + API keys + pip + teste)
2. **Configurar WhatsApp Bot** da Elaine (Botpress ou Evolution API)
3. **Criar posts/tabelas de preço** com as fotos geradas por IA
4. **Tirar fotos reais** das 2 lojas
5. **Padronizar processo** de onboarding para outros comércios

---

## 🧭 PRÓXIMOS MILESTONES

| Milestone                       | Quando         | Dependência             |
| :------------------------------ | :------------- | :---------------------- |
| Bot Safra respondendo clientes  | Hoje           | Config WhatsApp         |
| KAIROS SKY no Railway           | Hoje           | Schema SQL + pip        |
| 1° post Instagram do Hortifruti | Hoje           | Fotos + Canva           |
| 2° loja com bot ativo           | Amanhã         | Template universal      |
| 5 cases rodando                 | Esta semana    | Amostra grátis pipeline |
| 1° cliente pagante              | Próxima semana | Cases + ROI comprovado  |
