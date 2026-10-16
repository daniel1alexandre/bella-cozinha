/**
 * Bella Cozinha Pro - Motor de Cálculos Gastronômicos & Financeiros
 * Unidades suportadas: 'kg', 'g', 'l', 'ml', 'un'
 */

const GastronomyCalc = {
  // Conversão de unidades para a unidade base
  // Unidade base de peso: grama (g)
  // Unidade base de volume: mililitro (ml)
  // Unidade base de contagem: unidade (un)
  
  getBaseUnit(unit) {
    if (['kg', 'g'].includes(unit)) return 'g';
    if (['l', 'ml'].includes(unit)) return 'ml';
    return 'un';
  },

  // Converte quantidade da unidade informada para a unidade base
  toBaseUnitQty(quantity, unit) {
    const qty = parseFloat(quantity) || 0;
    switch (unit) {
      case 'kg': return qty * 1000;
      case 'g': return qty;
      case 'l': return qty * 1000;
      case 'ml': return qty;
      case 'un': return qty;
      default: return qty;
    }
  },

  /**
   * Calcula o custo unitário base de compra considerando Fator de Correção (FC)
   * FC = Peso Bruto / Peso Líquido (se houver perdas como cascas, aparas, etc.)
   * Preço por unidade base (g, ml, un) = (Preço / QtdBase) * FC
   */
  calcBaseUnitCost(packagePrice, packageQty, packageUnit, correctionFactor = 1.0) {
    const price = parseFloat(packagePrice) || 0;
    const baseQty = this.toBaseUnitQty(packageQty, packageUnit);
    const fc = parseFloat(correctionFactor) || 1.0;

    if (baseQty <= 0) return 0;
    const costPerBaseUnit = (price / baseQty) * (fc > 0 ? fc : 1.0);
    return costPerBaseUnit;
  },

  /**
   * Calcula o custo de um ingrediente na receita
   * @param {number} usedQty - Quantidade utilizada na receita
   * @param {string} usedUnit - Unidade utilizada ('kg', 'g', 'l', 'ml', 'un')
   * @param {number} baseUnitCost - Custo por unidade base (R$/g, R$/ml, R$/un)
   */
  calcIngredientCost(usedQty, usedUnit, baseUnitCost) {
    const qtyInBase = this.toBaseUnitQty(usedQty, usedUnit);
    return qtyInBase * (parseFloat(baseUnitCost) || 0);
  },

  /**
   * Calcula a Ficha Técnica Completa
   * @param {Object} recipe - Dados da receita com itens, custos indiretos, rendimento
   * @param {Array} ingredientsList - Lista mestre de insumos para consulta de custos
   */
  calcRecipeCost(recipe, ingredientsList) {
    let rawMaterialCost = 0; // CMV Insumos da receita
    const ingredientsMap = new Map((ingredientsList || []).map(i => [i.id, i]));

    const calculatedItems = (recipe.items || []).map(item => {
      const ingredient = ingredientsMap.get(item.ingredientId);
      if (!ingredient) {
        return {
          ...item,
          name: 'Insumo não encontrado',
          cost: 0,
          unitCostDisplay: 'R$ 0,00'
        };
      }

      const baseUnitCost = this.calcBaseUnitCost(
        ingredient.packagePrice,
        ingredient.packageQty,
        ingredient.packageUnit,
        ingredient.correctionFactor || 1.0
      );

      const itemCost = this.calcIngredientCost(item.quantity, item.unit, baseUnitCost);
      rawMaterialCost += itemCost;

      return {
        ...item,
        name: ingredient.name,
        category: ingredient.category,
        baseUnitCost,
        cost: itemCost
      };
    });

    // Custos Indiretos / Operacionais
    // 1. % Custos Fixos / Variáveis Rateados (Gás, Energia, Água, Depreciação)
    const operationalPercent = parseFloat(recipe.operationalPercent) || 0; // Ex: 10%
    const operationalCost = (rawMaterialCost * operationalPercent) / 100;

    // 2. Mão de Obra
    // (tempoMinutos / 60) * valorHoraTrabalho
    const prepTimeMinutes = parseFloat(recipe.prepTimeMinutes) || 0;
    const hourlyRate = parseFloat(recipe.hourlyRate) || 0;
    const laborCost = (prepTimeMinutes / 60) * hourlyRate;

    // 3. Embalagem unitária ou de lote
    const packagingCost = parseFloat(recipe.packagingCost) || 0;

    // 4. Perda Técnica Prevista (%)
    const technicalLossPercent = parseFloat(recipe.technicalLossPercent) || 0;
    const subtotal = rawMaterialCost + operationalCost + laborCost + packagingCost;
    const technicalLossCost = (subtotal * technicalLossPercent) / 100;

    const totalBatchCost = subtotal + technicalLossCost;

    // Rendimento
    const yieldUnits = parseFloat(recipe.yieldUnits) || 1;
    const costPerUnit = yieldUnits > 0 ? totalBatchCost / yieldUnits : totalBatchCost;

    return {
      rawMaterialCost,
      operationalCost,
      laborCost,
      packagingCost,
      technicalLossCost,
      totalBatchCost,
      yieldUnits,
      costPerUnit,
      calculatedItems
    };
  },

  /**
   * Motor de Precificação por Markup ou Margem Alvo
   * 
   * Preço de Venda = Custo Direto Unitário / [ 1 - (MargemLíquida + Impostos + TaxaCartao + Comissao)/100 ]
   * OU
   * Preço de Venda = Custo Direto Unitário * Fator Markup Multiplicador
   */
  calculatePricing({
    unitCost,            // Custo total da unidade da ficha técnica
    additionalPackaging = 0, // Embalagem individual de entrega se houver
    method = 'margin',   // 'margin' ou 'markup'
    targetMargin = 30,   // % de lucro líquido desejado
    markupMultiplier = 2.5, // Fator multiplicador
    taxRate = 5,         // % Impostos (Simples Nacional / MEI)
    cardFeeRate = 3.5,   // % Taxas de maquininha / gateway
    channelFeeRate = 0,  // % Taxa de canal (ex: iFood 12%-23% ou 0% loja própria)
    customSalePrice = 0  // Se o usuário estipular um preço de venda praticado
  }) {
    const cost = parseFloat(unitCost) || 0;
    const pack = parseFloat(additionalPackaging) || 0;
    const totalUnitCost = cost + pack;

    const deductionsPercent = (parseFloat(taxRate) || 0) + 
                              (parseFloat(cardFeeRate) || 0) + 
                              (parseFloat(channelFeeRate) || 0);

    let suggestedPrice = 0;

    if (method === 'markup') {
      const mult = parseFloat(markupMultiplier) || 2.0;
      suggestedPrice = totalUnitCost * mult;
    } else {
      // Método Margem Alvo
      const margin = parseFloat(targetMargin) || 20;
      const divisor = 1 - ((margin + deductionsPercent) / 100);

      if (divisor > 0.05) {
        suggestedPrice = totalUnitCost / divisor;
      } else {
        // Previne divisão por zero ou negativa se as taxas + margem >= 100%
        suggestedPrice = totalUnitCost * 3;
      }
    }

    // Preço efetivo (se o usuário preencheu customSalePrice usa ele, senão sugerido)
    const activePrice = parseFloat(customSalePrice) > 0 ? parseFloat(customSalePrice) : suggestedPrice;

    // Deduções em R$ sobre o preço ativo
    const taxesValue = activePrice * ((parseFloat(taxRate) || 0) / 100);
    const cardFeeValue = activePrice * ((parseFloat(cardFeeRate) || 0) / 100);
    const channelFeeValue = activePrice * ((parseFloat(channelFeeRate) || 0) / 100);
    const totalDeductionsValue = taxesValue + cardFeeValue + channelFeeValue;

    // Lucro Bruto e Líquido
    const grossProfit = activePrice - totalUnitCost; // Receita - Custo do Produto
    const netProfit = activePrice - totalUnitCost - totalDeductionsValue; // Receita líquida de taxas - custo

    // Margens em %
    const grossMarginPercent = activePrice > 0 ? (grossProfit / activePrice) * 100 : 0;
    const netMarginPercent = activePrice > 0 ? (netProfit / activePrice) * 100 : 0;

    // Markup Real Efetivo
    const effectiveMarkup = totalUnitCost > 0 ? activePrice / totalUnitCost : 0;

    // Ponto de equilíbrio de contribuição (Margem de Contribuição unitária em R$)
    const unitContribution = activePrice - totalUnitCost - totalDeductionsValue;

    return {
      totalUnitCost,
      suggestedPrice,
      activePrice,
      taxesValue,
      cardFeeValue,
      channelFeeValue,
      totalDeductionsValue,
      grossProfit,
      netProfit,
      grossMarginPercent,
      netMarginPercent,
      effectiveMarkup,
      unitContribution
    };
  },

  // Formatação de Moeda Brasileira
  formatCurrency(value) {
    const val = parseFloat(value) || 0;
    return val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  },

  // Formatação de Número/Percentual
  formatPercent(value, decimals = 1) {
    const val = parseFloat(value) || 0;
    return `${val.toFixed(decimals).replace('.', ',')}%`;
  },

  formatNumber(value, decimals = 2) {
    const val = parseFloat(value) || 0;
    return val.toFixed(decimals).replace('.', ',');
  }
};

// Exporta globalmente para o navegador
window.GastronomyCalc = GastronomyCalc;
