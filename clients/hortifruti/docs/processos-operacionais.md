# 🗺️ Mapeamento de Processos (Esboço Operacional)

> Este é o raio-x inicial de como o Hortifruti vai rodar no dia a dia com a automação e como escalar.

---

## 1. Processo de Compra e Entrada de Mercadoria (Inbound)

**Atual (Manual):** Dono vai ao CEASA, compra, chega na loja, descarrega. Ninguém sabe direito quanto tem no fundo da loja além do olho clínico da Elaine.
**Com a Safra V1:**
1. Mercadoria chega na loja.
2. Douglas/Elaine dizem no WhatsApp: *"Safra, chegou 20 caixas de tomate, 10 de laranja..."*
3. O Agente Estoquista registra no `estoque.json` e atualiza as quantidades em tempo real.
4. Safra já sugere: *"Estoque de laranja alto. Quer fazer uma Flash Sale no grupo?"*

**Com a Integração V2 (Sistema Local):** A Safra lê diretamente a Nota Fiscal ou puxa do sistema de gestão PDV recém-implantado.

---

## 2. Processo de Atendimento e Pedidos (Outbound)

**Atual (Manual):** Clientes mandam áudio no WhatsApp, alguém na loja tenta ouvir e separar enquanto atende no caixa. Caos e perda de vendas.
**Com a Safra V1:**
1. Cliente envia "Oi" no WhatsApp da loja.
2. Safra responde em 5 segundos com o Cardápio do Dia.
3. Cliente faz o pedido escolhendo da lista.
4. Safra totaliza o valor, pergunta endereço de entrega e repassa o pedido pronto, formatado como "ticket", para o celular da separação.
5. Funcionário apenas separa os itens na sacola.

---

## 3. Processo de Separação e Entrega (Delivery)

**Atual (Manual):** Entregador pega as sacolas sem controle de rota rígido.
**Com a Safra V1:**
1. Douglas avisa a Safra: *"Saiu a entrega da Dona Maria"*.
2. Safra notifica a cliente: *"Dona Maria, seu pedido saiu para entrega! 🚚"*.
3. Douglas avisa: *"Entregue da Dona Maria"*.
4. Safra finaliza o ticket e contabiliza no caixa do dia.

---

## 4. Processo de Atualização de Preços

**Atual (Manual):** Troca de plaquinhas na loja e se alguém perguntar no WhatsApp, tem que lembrar de cabeça.
**Com a Safra V1:**
1. Elaine atualiza os preços no início do dia informando a Safra: *"Safra, o tomate hoje foi pra R$8,99"*.
2. A Safra atualiza a base. Todos os clientes que chamarem a partir dali verão o novo preço. Sem risco de vender errado.

---

## 5. Fechamento de Caixa e Relatório Diário

**Atual (Manual):** Elaine conta o dinheiro do PDV e vê as vendas no caderninho/WhatsApp.
**Com a Safra V1:**
Vou configurar a Safra para proativamente enviar às 19:30 o Relatório de Turno:
*"Boa noite Elaine! Hoje fechamos X pedidos no WhatsApp, com um ticket médio de R$Y. O estoque de Z está baixo para amanhã."*

---

> **A Missão do Douglas e da Elaine:** Eles precisam apenas RELATAR as coisas para a assistente no WhatsApp ("Saiu isso", "Chegou aquilo"). O resto a IA organiza.
