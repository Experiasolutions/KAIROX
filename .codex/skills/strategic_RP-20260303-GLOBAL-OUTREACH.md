╔══════════════════════════════════════════════════════════════════════════╗
║ REASONING PACKAGE                                                        ║
║ ID: RP-20260303-GLOBAL-OUTREACH                                          ║
║ Versão: 1.1-STRATEGIC                                                   ║
║ Objetivo: Geração de Leads em USD/EUR (Outreach Global)                  ║
╚══════════════════════════════════════════════════════════════════════════╝

## 🎯 OS 3 PILARES DA PROSPECÇÃO INTERNACIONAL

### 1. LinkedIn (O Playground da Governança)
Onde estão os tomadores de decisão (SaaS Founders, CEOs de Agências).
- **Abordagem:** Não peça venda. Peça feedback ou apresente uma "Inovação Técnica".
- **The "Loom" Strategy:** Grave um vídeo de 2 min mostrando o KAIROS processando algo em inglês. Mande na DM:
  > *"Hey [Name], was checking [Your Company]. I built an Autonomous AIOS that handles lead qualification and ROI calculation automatically. Made this 2-min demo showing how it would look for you. No strings attached, just thought you'd like the tech."*

### 2. Cold Email (Volume e Arbitragem)
Para escalar a prospecção sem ser bloqueado em redes sociais.
- **Ferramentas:** Apollo.io (para encontrar emails) + Instantly.ai (para enviar sem cair no SPAM).
- **Nicho quentes:**
  - Real Estate Agents (USA).
  - Marketing Agencies (UK/Australia).
  - Solar Energy Companies (USA/Canada).
- **Dica:** Use o KAIROS para gerar os scripts de email personalizados para cada nicho.

### 3. Twitter/X (Autoridade e "Build in Public")
Onde a comunidade de IA se reúne.
- **Build in Public:** Poste semanalmente o progresso do KAIROS (ex: *"My AIOS just generated 14 ROI reports in 30 mins"*).
- **Inbound:** Seus posts atraem pessoas interessadas na tecnologia, transformando você de "vendedor" em "especialista".

---

## 🔑 EVOLUTION API: COMO OBTER A KEY

No cenário Render (Self-Hosted), **você é o dono da chave**. Ela não vem de um site terceiro; você a define.

1. **Global API Key:** 
   No seu `render.yaml` ou no painel de Environment Variables do Render, você define a variável `AUTHENTICATION_API_KEY`. 
   - *Exemplo:* Se você colocar `minha_chave_mestra_123`, esta será sua Key para configurar o `.env`.

2. **Instance Token:**
   Quando você cria uma instância (ex: `GABRIEL_PRIMARY`) via API ou dashboard da Evolution, o sistema gera um token específico para essa instância.

**Passo a passo técnico:**
1. Suba a Evolution no Render.
2. Acesse `https://seu-app.onrender.com/manager`.
3. Crie uma instância.
4. O Token da instância aparecerá na tela.
5. Copie o **Global Key** e o **Instance Token** para o seu `.env` do KAIROS.

---

## 🚀 ESTRATÉGIA "GABRIEL 24/7" (USD)

- **Fase A:** Configure o Render (conforme o guia anterior).
- **Fase B:** Traduza 3 das suas melhores demos para Inglês.
- **Fase C:** Use o `scripts/whatsapp-bridge.js` (ou Evolution) para que quando um gringo te chamar, Noesis responda em Inglês nativo.

**"Sua fluência é sua maior arma depois da própria IA. Use-a para diminuir a distância entre o real e o digital."**

— Noesis, orquestrando o sistema 🎯
