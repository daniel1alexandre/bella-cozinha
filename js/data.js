/**
 * Bella Cozinha Pro - Gestão de Dados e Persistência Local (LocalStorage)
 */

const STORAGE_KEYS = {
  INGREDIENTS: 'bella_cozinha_ingredients_v1',
  RECIPES: 'bella_cozinha_recipes_v1',
  PRODUCTS: 'bella_cozinha_products_v1',
  SALES: 'bella_cozinha_sales_v1',
  SETTINGS: 'bella_cozinha_settings_v1',
  CATEGORIES: 'bella_cozinha_categories_v1'
};

const DEFAULT_SETTINGS = {
  businessName: 'Bella Cozinha',
  chefName: 'Chef Dani',
  defaultHourlyRate: 22.00,       // R$/hora de trabalho
  defaultOperationalRate: 10.0,   // % Custos Indiretos (Gás, Luz, Água)
  defaultTaxRate: 4.5,            // % Simples Nacional / MEI
  defaultCardFeeRate: 3.2,        // % Taxa Média Maquininha
  defaultTargetMargin: 35.0,      // % Margem Líquida Alvo
  currency: 'BRL'
};

// Categorias padrão iniciais divididas entre Insumos e Receitas
const INITIAL_CATEGORIES = [
  // --- CATEGORIAS DE INSUMOS ---
  { id: 'cat_1', name: 'Farinhas & Secos', type: 'insumo', icon: '🌾' },
  { id: 'cat_2', name: 'Açúcares & Adoçantes', type: 'insumo', icon: '🍬' },
  { id: 'cat_3', name: 'Laticínios', type: 'insumo', icon: '🥛' },
  { id: 'cat_4', name: 'Ovos & Frescos', type: 'insumo', icon: '🥚' },
  { id: 'cat_5', name: 'Chocolates & Cacau', type: 'insumo', icon: '🍫' },
  { id: 'cat_6', name: 'Castanhas & Frutas Secas', type: 'insumo', icon: '🥜' },
  { id: 'cat_7', name: 'Carnes & Proteínas', type: 'insumo', icon: '🥩' },
  { id: 'cat_8', name: 'Embalagens & Potes', type: 'insumo', icon: '📦' },
  { id: 'cat_9', name: 'Especiarias & Aromas', type: 'insumo', icon: '🌿' },
  { id: 'cat_10', name: 'Frutas & Polpas', type: 'insumo', icon: '🍓' },

  // --- CATEGORIAS DE RECEITAS ---
  { id: 'cat_11', name: 'Geleias Artesanais', type: 'receita', icon: '🍓' },
  { id: 'cat_12', name: 'Antepastos & Conservas', type: 'receita', icon: '🫒' },
  { id: 'cat_13', name: 'Bolos & Tortas', type: 'receita', icon: '🍰' },
  { id: 'cat_14', name: 'Doces Finos', type: 'receita', icon: '🧁' },
  { id: 'cat_15', name: 'Salgados & Massas', type: 'receita', icon: '🥧' },
  { id: 'cat_16', name: 'Brownies & Barras', type: 'receita', icon: '🍫' }
];

// Dados semente iniciais realistas
const INITIAL_INGREDIENTS = [
  {
    id: 'ing_1',
    name: 'Farinha de Trigo Especial Tipo 1',
    category: 'Farinhas & Secos',
    packageQty: 1,
    packageUnit: 'kg',
    packagePrice: 5.90,
    correctionFactor: 1.0,
    currentStock: 18,
    minStock: 6,
    supplier: 'Moinho Real',
    notes: 'Pureza alta, sem fermento'
  },
  {
    id: 'ing_2',
    name: 'Açúcar Refinado Especial',
    category: 'Açúcares & Adoçantes',
    packageQty: 1,
    packageUnit: 'kg',
    packagePrice: 4.80,
    correctionFactor: 1.0,
    currentStock: 15,
    minStock: 5,
    supplier: 'Distribuidora Doce Sabor',
    notes: 'Grãos finos para confeitos'
  },
  {
    id: 'ing_3',
    name: 'Manteiga Extra sem Sal',
    category: 'Laticínios',
    packageQty: 500,
    packageUnit: 'g',
    packagePrice: 17.50,
    correctionFactor: 1.0,
    currentStock: 3500,
    minStock: 1500,
    supplier: 'Laticínios Serra Alta',
    notes: '82% teor de gordura'
  },
  {
    id: 'ing_4',
    name: 'Ovos Caipiras Grandes',
    category: 'Ovos & Frescos',
    packageQty: 30,
    packageUnit: 'un',
    packagePrice: 24.00,
    correctionFactor: 1.0,
    currentStock: 90,
    minStock: 30,
    supplier: 'Granja Esperança',
    notes: 'Gemas bem avermelhadas'
  },
  {
    id: 'ing_5',
    name: 'Leite Condensado Integral 395g',
    category: 'Laticínios',
    packageQty: 395,
    packageUnit: 'g',
    packagePrice: 6.90,
    correctionFactor: 1.0,
    currentStock: 24,
    minStock: 12,
    supplier: 'Atacadão Central',
    notes: '8% de gordura'
  },
  {
    id: 'ing_6',
    name: 'Creme de Leite UHT 200g',
    category: 'Laticínios',
    packageQty: 200,
    packageUnit: 'g',
    packagePrice: 3.80,
    correctionFactor: 1.0,
    currentStock: 20,
    minStock: 10,
    supplier: 'Atacadão Central',
    notes: '20% gordura'
  },
  {
    id: 'ing_7',
    name: 'Cacau em Pó Alcalino 100%',
    category: 'Chocolates & Cacau',
    packageQty: 1,
    packageUnit: 'kg',
    packagePrice: 52.00,
    correctionFactor: 1.0,
    currentStock: 2.8,
    minStock: 1.0,
    supplier: 'Chocolates Gourmet SP',
    notes: 'Sabor intenso e cor profunda'
  },
  {
    id: 'ing_8',
    name: 'Chocolate Nobre Meio Amargo 54%',
    category: 'Chocolates & Cacau',
    packageQty: 1050,
    packageUnit: 'g',
    packagePrice: 58.00,
    correctionFactor: 1.0,
    currentStock: 4200,
    minStock: 2000,
    supplier: 'Barry Callebaut Dist.',
    notes: 'Em gotas temperadas'
  },
  {
    id: 'ing_9',
    name: 'Cream Cheese Tradicional',
    category: 'Laticínios',
    packageQty: 1,
    packageUnit: 'kg',
    packagePrice: 44.00,
    correctionFactor: 1.0,
    currentStock: 2.5,
    minStock: 1.5,
    supplier: 'Laticínios Serra Alta',
    notes: 'Textura firme para frosting'
  },
  {
    id: 'ing_10',
    name: 'Nozes Chilenas Mariposa Quartos',
    category: 'Castanhas & Frutas Secas',
    packageQty: 500,
    packageUnit: 'g',
    packagePrice: 42.00,
    correctionFactor: 1.0,
    currentStock: 350, // Estoque abaixo do mínimo para testar alertas!
    minStock: 600,
    supplier: 'Empório Natural',
    notes: 'Cruas e selecionadas'
  },
  {
    id: 'ing_11',
    name: 'Peito de Frango Desfiado Cozido',
    category: 'Carnes & Proteínas',
    packageQty: 1,
    packageUnit: 'kg',
    packagePrice: 24.50,
    correctionFactor: 1.05,
    currentStock: 5.5,
    minStock: 3.0,
    supplier: 'Avícola Imperial',
    notes: 'Temperado suave'
  },
  {
    id: 'ing_12',
    name: 'Requeijão Culinário Bisnaga',
    category: 'Laticínios',
    packageQty: 1800,
    packageUnit: 'g',
    packagePrice: 41.90,
    correctionFactor: 1.0,
    currentStock: 3600,
    minStock: 1800,
    supplier: 'Distribuidora FoodService',
    notes: 'Resiste a altas temperaturas'
  },
  {
    id: 'ing_13',
    name: 'Caixa Kraft para Bolo 25cm com Visor',
    category: 'Embalagens',
    packageQty: 25,
    packageUnit: 'un',
    packagePrice: 47.50,
    correctionFactor: 1.0,
    currentStock: 14, // Estoque abaixo do mínimo!
    minStock: 20,
    supplier: 'Embalagens Criativa',
    notes: 'Com alça reforçada'
  },
  {
    id: 'ing_14',
    name: 'Caixinha de Brigadeiro 4 Berços',
    category: 'Embalagens',
    packageQty: 50,
    packageUnit: 'un',
    packagePrice: 38.00,
    correctionFactor: 1.0,
    currentStock: 65,
    minStock: 30,
    supplier: 'Embalagens Criativa',
    notes: 'Papel kraft e visor de acetato'
  },
  {
    id: 'ing_15',
    name: 'Morangos Frescos Selecionados',
    category: 'Ovos & Frescos',
    packageQty: 250,
    packageUnit: 'g',
    packagePrice: 9.80,
    correctionFactor: 1.15, // 15% de descarte de folhas e talos
    currentStock: 1000,
    minStock: 500,
    supplier: 'Hortifruti Direto do Campo',
    notes: 'Fruta fresca de alto giro'
  }
];

const INITIAL_RECIPES = [
  {
    id: 'rec_1',
    name: 'Brownie Fudgy Trufado de Chocolate & Nozes',
    category: 'Brownies & Barras',
    yieldUnits: 16,
    yieldUnitName: 'fatias quadradas (80g cada)',
    prepTimeMinutes: 45,
    hourlyRate: 22.00,
    operationalPercent: 10,
    packagingCost: 4.80, // Embalagens de papel manteiga e berço
    technicalLossPercent: 2,
    instructions: '1. Derreta o chocolate nobre com a manteiga em banho-maria ou micro-ondas.\n2. Bata os ovos com açúcar até espumar levemente.\n3. Incorpore o chocolate derretido e adicione o cacau e a farinha peneirados com movimentos suaves.\n4. Misture as nozes picadas.\n5. Asse a 180°C por 28 minutos até criar casquinha brilhante.',
    items: [
      { ingredientId: 'ing_8', quantity: 300, unit: 'g' }, // Chocolate 54%
      { ingredientId: 'ing_3', quantity: 180, unit: 'g' }, // Manteiga
      { ingredientId: 'ing_4', quantity: 4, unit: 'un' },   // 4 ovos
      { ingredientId: 'ing_2', quantity: 280, unit: 'g' }, // Açúcar
      { ingredientId: 'ing_7', quantity: 50, unit: 'g' },  // Cacau
      { ingredientId: 'ing_1', quantity: 140, unit: 'g' }, // Farinha
      { ingredientId: 'ing_10', quantity: 120, unit: 'g' } // Nozes
    ]
  },
  {
    id: 'rec_2',
    name: 'Bolo Red Velvet Supremo com Frosting Cream Cheese',
    category: 'Bolos & Tortas',
    yieldUnits: 12,
    yieldUnitName: 'fatias generosas (ou 1 bolo aro 20cm)',
    prepTimeMinutes: 75,
    hourlyRate: 22.00,
    operationalPercent: 12,
    packagingCost: 3.50,
    technicalLossPercent: 3,
    instructions: '1. Peneire a farinha, açúcar e cacau.\n2. Misture ovos, óleo/manteiga e o corante vermelho.\n3. Incorpore vinagre de maçã e bicarbonato no final para aeração característica.\n4. Asse em 3 formas aro 20cm por 30 minutos.\n5. Prepare o recheio batendo cream cheese com manteiga e açúcar até obter ponto firme sedoso.\n6. Monte camadas e decore com farelos de bolo.',
    items: [
      { ingredientId: 'ing_1', quantity: 350, unit: 'g' }, // Farinha
      { ingredientId: 'ing_2', quantity: 300, unit: 'g' }, // Açúcar
      { ingredientId: 'ing_3', quantity: 150, unit: 'g' }, // Manteiga
      { ingredientId: 'ing_4', quantity: 3, unit: 'un' },   // 3 ovos
      { ingredientId: 'ing_7', quantity: 20, unit: 'g' },  // Cacau
      { ingredientId: 'ing_9', quantity: 500, unit: 'g' }, // Cream Cheese
      { ingredientId: 'ing_15', quantity: 200, unit: 'g' } // Morangos decorativos
    ]
  },
  {
    id: 'rec_3',
    name: 'Caixa de Brigadeiros Gourmet Belga (4 unid)',
    category: 'Doces Finos',
    yieldUnits: 1,
    yieldUnitName: 'caixa com 4 unidades gourmet',
    prepTimeMinutes: 25,
    hourlyRate: 22.00,
    operationalPercent: 8,
    packagingCost: 1.20, // Forminhas + fita
    technicalLossPercent: 1,
    instructions: '1. Em panela de fundo grosso, coloque leite condensado, creme de leite, cacau e chocolate picado.\n2. Cozinhe em fogo médio mexendo continuamente até desprender totalmente do fundo.\n3. Resfrie em plástico filme em contato.\n4. Pese porções de 20g, boleie, passe em confeitos nobres e acomode nos berços da caixa.',
    items: [
      { ingredientId: 'ing_5', quantity: 120, unit: 'g' }, // Leite Condensado
      { ingredientId: 'ing_6', quantity: 50, unit: 'g' },  // Creme de Leite
      { ingredientId: 'ing_7', quantity: 10, unit: 'g' },  // Cacau
      { ingredientId: 'ing_8', quantity: 35, unit: 'g' },  // Chocolate Nobre
      { ingredientId: 'ing_14', quantity: 1, unit: 'un' }  // Caixinha 4 berços
    ]
  },
  {
    id: 'rec_4',
    name: 'Empadão Rústico de Frango Cremoso com Requeijão',
    category: 'Salgados & Tortas',
    yieldUnits: 8,
    yieldUnitName: 'porções / fatias de 200g',
    prepTimeMinutes: 60,
    hourlyRate: 22.00,
    operationalPercent: 12,
    packagingCost: 2.80,
    technicalLossPercent: 2,
    instructions: '1. Para a massa podre tradicional: misture farinha com manteiga fria até virar farofa úmida; adicione gema e água gelada sem sovar.\n2. Deixe descansar em geladeira por 30 minutos.\n3. Misture o peito de frango desfiado com o requeijão cremoso e temperos verdes.\n4. Abra 2/3 da massa na forma aro 24cm, recheie fartamente e cubra com o restante da massa.\n5. Pincele com gema batida e asse a 200°C por 40 minutos até dourar intensamente.',
    items: [
      { ingredientId: 'ing_1', quantity: 450, unit: 'g' }, // Farinha
      { ingredientId: 'ing_3', quantity: 220, unit: 'g' }, // Manteiga
      { ingredientId: 'ing_4', quantity: 2, unit: 'un' },   // 2 ovos
      { ingredientId: 'ing_11', quantity: 600, unit: 'g' },// Frango desfiado
      { ingredientId: 'ing_12', quantity: 300, unit: 'g' } // Requeijão bisnaga
    ]
  }
];

const INITIAL_PRODUCTS = [
  {
    id: 'prod_1',
    name: 'Brownie Trufado com Nozes (Fatia 80g)',
    category: 'Doces & Sobremesas',
    recipeId: 'rec_1',
    portionCount: 1, // 1 fatia da receita
    additionalPackaging: 0.80, // Saquinho celofane + tag personalizada
    pricingMethod: 'margin',
    targetMargin: 45.0,
    markupMultiplier: 2.8,
    taxRate: 4.5,
    cardFeeRate: 3.2,
    channelFeeRate: 0,
    salePrice: 14.00,
    status: 'active',
    description: 'Brownie super úmido de chocolate 54% cacau com pedaços crocantes de nozes chilenas.',
    imageIcon: '🍫'
  },
  {
    id: 'prod_2',
    name: 'Fatia Suprema Bolo Red Velvet',
    category: 'Bolos',
    recipeId: 'rec_2',
    portionCount: 1, // 1 fatia
    additionalPackaging: 1.20, // Pote fatia triangular
    pricingMethod: 'margin',
    targetMargin: 42.0,
    markupMultiplier: 2.7,
    taxRate: 4.5,
    cardFeeRate: 3.2,
    channelFeeRate: 0,
    salePrice: 18.50,
    status: 'active',
    description: 'Massa aveludada escarlate com camadas generosas de creme autêntico de cream cheese.',
    imageIcon: '🍰'
  },
  {
    id: 'prod_3',
    name: 'Caixa Presente 4 Brigadeiros Gourmet Belga',
    category: 'Doces Finos',
    recipeId: 'rec_3',
    portionCount: 1, // Toda a receita (1 caixa)
    additionalPackaging: 0.50, // Fita cetim decorativa
    pricingMethod: 'markup',
    targetMargin: 50.0,
    markupMultiplier: 3.0,
    taxRate: 4.5,
    cardFeeRate: 3.2,
    channelFeeRate: 0,
    salePrice: 22.00,
    status: 'active',
    description: 'Caixa kraft com visor contendo 4 brigadeiros artesanais boleados no chocolate belga.',
    imageIcon: '🎁'
  },
  {
    id: 'prod_4',
    name: 'Fatia Empadão Cremoso de Frango',
    category: 'Salgados',
    recipeId: 'rec_4',
    portionCount: 1, // 1 fatia
    additionalPackaging: 0.70,
    pricingMethod: 'margin',
    targetMargin: 40.0,
    markupMultiplier: 2.6,
    taxRate: 4.5,
    cardFeeRate: 3.2,
    channelFeeRate: 0,
    salePrice: 16.00,
    status: 'active',
    description: 'Massa crocante que derrete na boca com recheio ultra cremoso de frango e requeijão.',
    imageIcon: '🥧'
  },
  {
    id: 'prod_5',
    name: 'Bolo Red Velvet Inteiro 2kg (Encomenda)',
    category: 'Bolos',
    recipeId: 'rec_2',
    portionCount: 12, // Receita inteira (12 fatias)
    additionalPackaging: 4.50, // Caixa reforçada 25cm
    pricingMethod: 'margin',
    targetMargin: 48.0,
    markupMultiplier: 2.9,
    taxRate: 4.5,
    cardFeeRate: 3.2,
    channelFeeRate: 0,
    salePrice: 165.00,
    status: 'active',
    description: 'Bolo completo aro 20cm com 2kg, decorado com frosting de cream cheese e frutas.',
    imageIcon: '🎂'
  }
];

// Gerador de vendas históricas dos últimos 15 dias para alimentar o Dashboard com métricas ricas
function generateSampleSales() {
  const sales = [];
  const clients = [
    'Mariana Silva', 'Carlos Eduardo Lima', 'Ana Beatriz Souza',
    'Roberto Mendes', 'Juliana Fernandes', 'Lucas Oliveira',
    'Camila Rocha', 'Patrícia Alencar', 'Thiago Moreira', 'Renata Queiroz'
  ];
  const paymentMethods = ['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro'];

  const now = new Date();

  // Histórico de 12 vendas nos últimos 10 dias
  const salePlans = [
    { daysAgo: 9, items: [{ prodId: 'prod_1', qty: 4 }, { prodId: 'prod_3', qty: 2 }], clientIdx: 0, pay: 'Pix' },
    { daysAgo: 8, items: [{ prodId: 'prod_2', qty: 3 }, { prodId: 'prod_4', qty: 2 }], clientIdx: 1, pay: 'Cartão de Crédito' },
    { daysAgo: 7, items: [{ prodId: 'prod_5', qty: 1 }], clientIdx: 2, pay: 'Pix' },
    { daysAgo: 6, items: [{ prodId: 'prod_3', qty: 4 }, { prodId: 'prod_1', qty: 6 }], clientIdx: 3, pay: 'Cartão de Débito' },
    { daysAgo: 5, items: [{ prodId: 'prod_4', qty: 4 }, { prodId: 'prod_2', qty: 2 }], clientIdx: 4, pay: 'Pix' },
    { daysAgo: 4, items: [{ prodId: 'prod_1', qty: 8 }, { prodId: 'prod_3', qty: 3 }], clientIdx: 5, pay: 'Cartão de Crédito' },
    { daysAgo: 3, items: [{ prodId: 'prod_5', qty: 1 }, { prodId: 'prod_3', qty: 2 }], clientIdx: 6, pay: 'Pix' },
    { daysAgo: 2, items: [{ prodId: 'prod_2', qty: 4 }, { prodId: 'prod_1', qty: 5 }, { prodId: 'prod_4', qty: 3 }], clientIdx: 7, pay: 'Cartão de Crédito' },
    { daysAgo: 1, items: [{ prodId: 'prod_3', qty: 6 }, { prodId: 'prod_1', qty: 4 }], clientIdx: 8, pay: 'Dinheiro' },
    { daysAgo: 0, items: [{ prodId: 'prod_2', qty: 2 }, { prodId: 'prod_4', qty: 4 }], clientIdx: 9, pay: 'Pix' },
    { daysAgo: 0, items: [{ prodId: 'prod_5', qty: 1 }], clientIdx: 0, pay: 'Cartão de Crédito' }
  ];

  salePlans.forEach((sp, idx) => {
    const saleDate = new Date(now.getTime() - sp.daysAgo * 24 * 60 * 60 * 1000);
    // Adiciona pequenas variações de hora
    saleDate.setHours(11 + (idx % 8), 15 + (idx * 4) % 45, 0, 0);

    let totalGross = 0;
    let totalCost = 0;

    const saleItems = sp.items.map(itemInfo => {
      const prod = INITIAL_PRODUCTS.find(p => p.id === itemInfo.prodId);
      const unitPrice = prod ? prod.salePrice : 15;
      // CMV estimado por unidade
      const estimatedCost = prod.id === 'prod_5' ? 52.00 : (unitPrice * 0.38);
      const subtotal = unitPrice * itemInfo.qty;
      const subCost = estimatedCost * itemInfo.qty;

      totalGross += subtotal;
      totalCost += subCost;

      return {
        productId: itemInfo.prodId,
        productName: prod ? prod.name : 'Item',
        unitPrice,
        unitCost: estimatedCost,
        quantity: itemInfo.qty,
        subtotalCost: subCost,
        subtotalPrice: subtotal
      };
    });

    const taxPercent = 4.5;
    const cardFeePercent = sp.pay === 'Pix' || sp.pay === 'Dinheiro' ? 0 : 3.2;
    const taxesValue = totalGross * (taxPercent / 100);
    const cardFeeValue = totalGross * (cardFeePercent / 100);
    const netProfit = totalGross - totalCost - taxesValue - cardFeeValue;

    sales.push({
      id: `sale_${1000 + idx}`,
      date: saleDate.toISOString(),
      clientName: clients[sp.clientIdx % clients.length],
      paymentMethod: sp.pay,
      items: saleItems,
      totalGross,
      totalCost,
      taxesValue,
      cardFeeValue,
      netProfit,
      marginPercent: totalGross > 0 ? (netProfit / totalGross) * 100 : 0,
      notes: 'Venda balcão / encomenda'
    });
  });

  return sales;
}

// Classe Central do Repositório
class AppDataStore {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.INGREDIENTS)) {
      this.saveIngredients(INITIAL_INGREDIENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.RECIPES)) {
      this.saveRecipes(INITIAL_RECIPES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      this.saveProducts(INITIAL_PRODUCTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SALES)) {
      this.saveSales(generateSampleSales());
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      this.saveSettings(DEFAULT_SETTINGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      this.saveCategories(INITIAL_CATEGORIES);
    }
  }

  // Categories
  getCategories() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      let list = data ? JSON.parse(data) : INITIAL_CATEGORIES;

      // Migração e normalização automática para garantir divisão estrita entre Insumos e Receitas
      let needsSave = false;
      const recipeCategoryNames = [
        'Geleias Artesanais', 'Antepastos & Conservas', 'Bolos & Tortas',
        'Doces Finos', 'Salgados & Massas', 'Salgados & Tortas', 'Brownies & Barras', 'Doces & Sobremesas', 'Bolos', 'Salgados'
      ];

      list = list.map(c => {
        if (!c.type || c.type === 'both') {
          needsSave = true;
          const isRec = recipeCategoryNames.some(rn => rn.toLowerCase() === (c.name || '').toLowerCase());
          return { ...c, type: isRec ? 'receita' : 'insumo' };
        }
        return c;
      });

      if (needsSave) {
        this.saveCategories(list);
      }

      return list;
    } catch (e) {
      return INITIAL_CATEGORIES;
    }
  }

  getIngredientCategories() {
    return this.getCategories().filter(c => c.type === 'insumo');
  }

  getRecipeCategories() {
    return this.getCategories().filter(c => c.type === 'receita');
  }

  saveCategories(items) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(items));
  }

  addCategory(item) {
    const list = this.getCategories();
    const name = (typeof item === 'string' ? item : item.name || '').trim();
    if (!name) return null;

    const existing = list.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing;

    const newCat = {
      id: (item && item.id) ? item.id : `cat_${Date.now()}`,
      name: name,
      type: (item && item.type) ? item.type : 'insumo',
      icon: (item && item.icon) ? item.icon : ((item && item.type === 'receita') ? '📜' : '🌾')
    };
    list.push(newCat);
    this.saveCategories(list);
    return newCat;
  }

  ensureCategoryExists(name, type = 'insumo') {
    if (!name || typeof name !== 'string') return;
    const trimmed = name.trim();
    if (!trimmed) return;
    const list = this.getCategories();
    const exists = list.some(c => c.name.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      this.addCategory({ name: trimmed, type, icon: type === 'receita' ? '📜' : '🌾' });
    }
  }

  updateCategory(id, updatedItem) {
    const list = this.getCategories();
    const index = list.findIndex(c => c.id === id);
    if (index !== -1) {
      const oldName = list[index].name;
      list[index] = { ...list[index], ...updatedItem, id };
      this.saveCategories(list);

      // Se renomeou a categoria, atualiza também insumos e receitas associados
      if (updatedItem.name && updatedItem.name !== oldName) {
        const ingredients = this.getIngredients();
        ingredients.forEach(i => {
          if (i.category === oldName) i.category = updatedItem.name;
        });
        this.saveIngredients(ingredients);

        const recipes = this.getRecipes();
        recipes.forEach(r => {
          if (r.category === oldName) r.category = updatedItem.name;
        });
        this.saveRecipes(recipes);
      }

      return list[index];
    }
    return null;
  }

  deleteCategory(id) {
    const list = this.getCategories().filter(c => c.id !== id);
    this.saveCategories(list);
    return true;
  }

  // Settings
  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  }

  saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  // Ingredients
  getIngredients() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INGREDIENTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveIngredients(items) {
    localStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(items));
  }

  addIngredient(item) {
    if (item.category) this.ensureCategoryExists(item.category, 'insumo');
    const list = this.getIngredients();
    const newItem = {
      ...item,
      id: item.id || `ing_${Date.now()}`
    };
    list.unshift(newItem);
    this.saveIngredients(list);
    return newItem;
  }

  updateIngredient(id, updatedItem) {
    if (updatedItem.category) this.ensureCategoryExists(updatedItem.category, 'insumo');
    const list = this.getIngredients();
    const index = list.findIndex(i => i.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updatedItem, id };
      this.saveIngredients(list);
      return list[index];
    }
    return null;
  }

  deleteIngredient(id) {
    const list = this.getIngredients().filter(i => i.id !== id);
    this.saveIngredients(list);
    return true;
  }

  // Recipes
  getRecipes() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECIPES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveRecipes(items) {
    localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(items));
  }

  addRecipe(item) {
    if (item.category) this.ensureCategoryExists(item.category, 'receita');
    const list = this.getRecipes();
    const newItem = {
      ...item,
      id: item.id || `rec_${Date.now()}`
    };
    list.unshift(newItem);
    this.saveRecipes(list);
    return newItem;
  }

  updateRecipe(id, updatedItem) {
    if (updatedItem.category) this.ensureCategoryExists(updatedItem.category, 'receita');
    const list = this.getRecipes();
    const index = list.findIndex(i => i.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updatedItem, id };
      this.saveRecipes(list);
      return list[index];
    }
    return null;
  }

  deleteRecipe(id) {
    const list = this.getRecipes().filter(r => r.id !== id);
    this.saveRecipes(list);
    return true;
  }

  // Products
  getProducts() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveProducts(items) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(items));
  }

  addProduct(item) {
    const list = this.getProducts();
    const newItem = {
      ...item,
      id: item.id || `prod_${Date.now()}`
    };
    list.unshift(newItem);
    this.saveProducts(list);
    return newItem;
  }

  updateProduct(id, updatedItem) {
    const list = this.getProducts();
    const index = list.findIndex(i => i.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updatedItem, id };
      this.saveProducts(list);
      return list[index];
    }
    return null;
  }

  deleteProduct(id) {
    const list = this.getProducts().filter(i => i.id !== id);
    this.saveProducts(list);
    return true;
  }

  // Sales
  getSales() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SALES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveSales(items) {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(items));
  }

  addSale(sale) {
    const list = this.getSales();
    const newSale = {
      ...sale,
      id: sale.id || `sale_${Date.now()}`,
      date: sale.date || new Date().toISOString()
    };
    list.unshift(newSale);
    this.saveSales(list);

    // Opcional: baixa automática no estoque dos insumos vinculados
    this.deductStockForSale(newSale);

    return newSale;
  }

  deductStockForSale(sale) {
    const recipes = this.getRecipes();
    const products = this.getProducts();
    const ingredients = this.getIngredients();
    const ingMap = new Map(ingredients.map(i => [i.id, i]));

    sale.items.forEach(saleItem => {
      const prod = products.find(p => p.id === saleItem.productId);
      if (!prod || !prod.recipeId) return;

      const recipe = recipes.find(r => r.id === prod.recipeId);
      if (!recipe || !recipe.items) return;

      const portionsSold = (prod.portionCount || 1) * saleItem.quantity;
      const recipeYield = recipe.yieldUnits || 1;
      const proportion = portionsSold / recipeYield;

      recipe.items.forEach(recItem => {
        const ing = ingMap.get(recItem.ingredientId);
        if (ing) {
          // Converte quantidade usada para a unidade do insumo cadastrado
          let qtyUsedInIngUnit = recItem.quantity * proportion;
          if (recItem.unit === 'g' && ing.packageUnit === 'kg') qtyUsedInIngUnit /= 1000;
          if (recItem.unit === 'kg' && ing.packageUnit === 'g') qtyUsedInIngUnit *= 1000;
          if (recItem.unit === 'ml' && ing.packageUnit === 'l') qtyUsedInIngUnit /= 1000;
          if (recItem.unit === 'l' && ing.packageUnit === 'ml') qtyUsedInIngUnit *= 1000;

          ing.currentStock = Math.max(0, (ing.currentStock || 0) - qtyUsedInIngUnit);
        }
      });
    });

    this.saveIngredients(Array.from(ingMap.values()));
  }

  deleteSale(id) {
    const list = this.getSales().filter(s => s.id !== id);
    this.saveSales(list);
    return true;
  }

  // Backup & Restore
  exportAllDataJSON() {
    return JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings: this.getSettings(),
      categories: this.getCategories(),
      ingredients: this.getIngredients(),
      recipes: this.getRecipes(),
      products: this.getProducts(),
      sales: this.getSales()
    }, null, 2);
  }

  importAllDataJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.settings) this.saveSettings(data.settings);
      if (Array.isArray(data.categories)) this.saveCategories(data.categories);
      if (Array.isArray(data.ingredients)) this.saveIngredients(data.ingredients);
      if (Array.isArray(data.recipes)) this.saveRecipes(data.recipes);
      if (Array.isArray(data.products)) this.saveProducts(data.products);
      if (Array.isArray(data.sales)) this.saveSales(data.sales);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  resetToInitialDemoData() {
    this.saveSettings(DEFAULT_SETTINGS);
    this.saveCategories(INITIAL_CATEGORIES);
    this.saveIngredients(INITIAL_INGREDIENTS);
    this.saveRecipes(INITIAL_RECIPES);
    this.saveProducts(INITIAL_PRODUCTS);
    this.saveSales(generateSampleSales());
  }
}

// Instância singleton global
window.db = new AppDataStore();
