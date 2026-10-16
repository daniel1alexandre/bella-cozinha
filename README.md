# 🍓 Bella Cozinha
> **Geleias Artesanais e Antepastos | Sistema Integrado de Gestão, Fichas Técnicas & Precificação**

O **Bella Cozinha** é uma solução completa desenvolvida especialmente para produtores artesanais, confeiteiros e chefs que precisam de precisão cirúrgica no cálculo de custos de insumos, fichas técnicas padronizadas, precificação estratégica com markup e margem líquida real, além de um dashboard financeiro interativo de lucros.

---

## 🚀 Como Iniciar a Aplicação

O sistema conta com um servidor estático leve em Node.js embutido e sem dependências externas pesadas:

1. Abra o terminal na pasta do projeto:
   ```bash
   node server.js
   ```
2. Abra seu navegador no endereço:
   👉 **`http://localhost:3000`**

*(Alternativamente, você também pode abrir o arquivo `index.html` diretamente em qualquer navegador moderno).*

---

## 🌟 Principais Módulos do Sistema

### 1. 📊 Dashboard de Desempenho & Lucratividade
- **KPIs em Tempo Real**:
  - **Faturamento Total (R$)**
  - **Lucro Líquido Real (R$)** (após descontar insumos, custos operacionais e taxas financeiras)
  - **CMV Total (Custo de Mercadoria Vendida)** e percentual sobre a receita
  - **Margem Líquida Média (%)**
  - **Alertas de Estoque Crítico** (insumos que atingiram o estoque de segurança)
- **Gráficos Interativos (Chart.js)**:
  - *Evolução Financeira*: Comparativo temporal entre Faturamento, CMV e Lucro.
  - *Composição das Vendas*: Gráfico de rosca detalhando a divisão entre Custo de Insumos, Lucro Líquido e Taxas/Impostos.
  - *Ranking de Lucratividade*: Curva dos produtos que mais geram lucro no negócio.

### 2. 🌾 Cadastro de Insumos & Controle de Estoque
- Registro completo de matérias-primas (Farinhas, Laticínios, Chocolates, Frutas, Embalagens, etc.).
- Conversão automática para unidades básicas: cálculo instantâneo de **R$/g**, **R$/ml** ou **R$/un**.
- **Fator de Correção (FC)**: Considera perdas técnicas naturais (como cascas, sementes, aparas e descarte).
- **Controle de Estoque Mínimo**: Alerta visual imediato quando um ingrediente precisa de reposição, com botão de ajuste rápido.

### 3. 📜 Fichas Técnicas Profissionais das Receitas
- Rendimento exato (número de porções, peso final ou fatias).
- Cálculo automático do **CMV Direto** com base na tabela mestre de insumos.
- **Custos Indiretos & Rateio**:
  - Rateio de energia, gás, água e depreciação (% sobre os insumos).
  - Custo de Mão de Obra proporcional ao tempo de preparo (R$/hora).
  - Embalagens de lote e tolerância para perdas de produção.
- **Custo Unitário por Porção** calculado com precisão.
- Passo a passo técnico do modo de preparo para a equipe de cozinha.
- **Botão de Impressão**: Layout limpo em folha A4 para colar na cozinha.

### 4. 🏷️ Precificação Inteligente & Markup
- Simulador interativo em tempo real:
  - Escolha entre **Margem Líquida Alvo (%)** ou **Markup Multiplicador (x)**.
  - Deduções configuráveis: Impostos (Simples Nacional / MEI), Taxas de Maquininha e Canais Delivery (ex: iFood 12% a 23%).
  - Cálculo instantâneo do Preço Sugerido, Lucro Bruto, Lucro Líquido Real e Markup Efetivo.
  - Campo para arredondamento / Preço Praticado manual.
  - Botão de sincronização direta para atualizar o catálogo com 1 clique!

### 5. 🧁 Catálogo Comercial de Produtos
- Vitrine visual com cards gastronômicos, fotos/emojis, badges de categoria e descrição.
- Exibição transparente do CMV, preço de venda e margem de contribuição.
- Botão **"Vender Agora"** integrado diretamente com o PDV.

### 6. 💰 Registro de Vendas & PDV Rápido
- Carrinho de pedidos com múltiplos produtos e quantidades.
- Cálculo em tempo real do faturamento bruto, CMV total do pedido, taxas e lucro líquido.
- **Baixa Automática no Estoque**: Ao finalizar uma venda, o sistema calcula a proporção da receita vendida e baixa os insumos consumidos automaticamente!
- Histórico de pedidos detalhado com filtros de busca.

### 7. ⚙️ Configurações & Backup
- Personalização do nome da confeitaria/restaurante e do chef responsável.
- Definição de taxas padrão e custo da hora de trabalho.
- **Backup Completo em JSON**: Exporte todos os seus dados e restaure quando quiser.
- Opção para resetar aos dados de demonstração da Bella Cozinha a qualquer momento.

---

## 📁 Estrutura de Arquivos

```
Bella-cozinha/
├── index.html           # Aplicação SPA moderna com navegação por abas e modais
├── server.js            # Servidor estático Node.js embutido
├── css/
│   └── style.css        # Design System dark luxury, responsividade e estilo de impressão
├── js/
│   ├── calculator.js    # Motor de cálculos de gastronomia, CMV, Markup e margens
│   ├── data.js          # Persistência LocalStorage, dados sementes e baixa de estoque
│   └── app.js           # Controlador da interface, Chart.js, modais e PDV
└── README.md            # Documentação completa
```
