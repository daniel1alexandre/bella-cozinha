/**
 * Bella Cozinha Pro - Controlador Principal da Aplicação (SPA)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Estado global da aplicação
  const state = {
    currentTab: 'dashboard',
    categoryView: 'insumo', // 'insumo' | 'receita' | 'all'
    charts: {
      financial: null,
      breakdown: null,
      topProducts: null
    },
    tempSaleCart: [], // Itens no carrinho do modal de venda
    tempComboItems: [] // Itens de produtos do combo no modal de produto
  };

  // =========================================================================
  // NAVEGAÇÃO ENTRE ABAS
  // =========================================================================
  const navItems = document.querySelectorAll('.nav-item');
  const tabContents = document.querySelectorAll('.tab-content');
  const pageTitle = document.getElementById('pageTitle');
  const pageSubtitle = document.getElementById('pageSubtitle');
  const topbarActionArea = document.getElementById('topbarActionArea');

  const tabTitles = {
    dashboard: {
      title: 'Dashboard de Desempenho',
      subtitle: 'Visão geral dos lucros, custos de mercadoria e margens operacionais'
    },
    ingredients: {
      title: 'Cadastro de Insumos & Matérias-Primas',
      subtitle: 'Controle de custos unitários, embalagens de compra e estoque mínimo'
    },
    categories: {
      title: 'Categorias, Insumos & Estoque',
      subtitle: 'Gerencie categorias, insumos e quantidades em estoque em um único lugar'
    },
    recipes: {
      title: 'Fichas Técnicas das Receitas',
      subtitle: 'Composição detalhada de insumos, custos diretos, indiretos e rendimentos'
    },
    pricing: {
      title: 'Precificação Inteligente & Markup',
      subtitle: 'Simulador em tempo real de preços de venda, margem de contribuição e lucro'
    },
    products: {
      title: 'Catálogo de Produtos Comerciais',
      subtitle: 'Cardápio de venda com preços praticados, margens e status de oferta'
    },
    sales: {
      title: 'Controle Financeiro & Registro de Vendas',
      subtitle: 'Apuração de CMV, faturamento e lucro líquido real por pedido'
    },
    settings: {
      title: 'Configurações do Negócio & Backup',
      subtitle: 'Taxas padrão, custo da hora de trabalho e exportação/importação de dados'
    }
  };

  function switchTab(tabId, extraParam = null) {
    if (tabId === 'ingredients') {
      tabId = 'categories';
    }
    state.currentTab = tabId;

    // Atualiza Sidebar
    navItems.forEach(item => {
      if (item.getAttribute('data-tab') === tabId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Atualiza Conteúdo
    tabContents.forEach(tab => {
      if (tab.id === `tab-${tabId}`) {
        tab.style.display = 'block';
      } else {
        tab.style.display = 'none';
      }
    });

    // Atualiza Topbar
    const info = tabTitles[tabId] || tabTitles.dashboard;
    pageTitle.textContent = info.title;
    pageSubtitle.textContent = info.subtitle;
    renderTopbarActions(tabId);

    // Fechar menu mobile se estiver aberto
    document.getElementById('appSidebar')?.classList.remove('mobile-open');

    // Inicializa ou atualiza o conteúdo da aba específica
    if (tabId === 'dashboard') {
      renderDashboard();
    } else if (tabId === 'categories') {
      if (extraParam) {
        openCategoryDetailView(extraParam);
      } else {
        closeCategoryDetailView();
      }
    } else if (tabId === 'recipes') {
      renderRecipes();
    } else if (tabId === 'pricing') {
      initPricingCalculator(extraParam);
    } else if (tabId === 'products') {
      renderProductsGrid();
    } else if (tabId === 'sales') {
      renderSalesTable();
    } else if (tabId === 'settings') {
      loadSettingsForm();
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderTopbarActions(tabId) {
    topbarActionArea.innerHTML = '';

    if (tabId === 'dashboard') {
      const btn = document.createElement('button');
      btn.className = 'btn btn-gold';
      btn.innerHTML = '<span>✨</span> Registrar Venda';
      btn.addEventListener('click', () => openNewSaleModal());
      topbarActionArea.appendChild(btn);
    } else if (tabId === 'categories') {
      if (state.selectedCategoryName) {
        const btnVoltar = document.createElement('button');
        btnVoltar.className = 'btn btn-outline btn-sm';
        btnVoltar.innerHTML = '<span>←</span> Categorias';
        btnVoltar.addEventListener('click', () => closeCategoryDetailView());

        const btnNovo = document.createElement('button');
        btnNovo.className = 'btn btn-primary';
        btnNovo.innerHTML = '<span>+</span> Incluir Insumo';
        btnNovo.addEventListener('click', () => openIngredientModal(null, state.selectedCategoryName));

        topbarActionArea.appendChild(btnVoltar);
        topbarActionArea.appendChild(btnNovo);
      } else {
        const btnInsumo = document.createElement('button');
        btnInsumo.className = 'btn btn-primary';
        btnInsumo.innerHTML = '<span>🌾 +</span> Cat. Insumo';
        btnInsumo.addEventListener('click', () => openCategoryModal(null, 'insumo'));

        const btnReceita = document.createElement('button');
        btnReceita.className = 'btn btn-secondary';
        btnReceita.innerHTML = '<span>📜 +</span> Cat. Receita';
        btnReceita.addEventListener('click', () => openCategoryModal(null, 'receita'));

        topbarActionArea.appendChild(btnInsumo);
        topbarActionArea.appendChild(btnReceita);
      }
    } else if (tabId === 'recipes') {
      const btn = document.createElement('button');
      btn.className = 'btn btn-primary';
      btn.innerHTML = '<span>+</span> Nova Ficha Técnica';
      btn.addEventListener('click', () => openRecipeModal());
      topbarActionArea.appendChild(btn);
    } else if (tabId === 'products') {
      const btn = document.createElement('button');
      btn.className = 'btn btn-primary';
      btn.innerHTML = '<span>+</span> Novo Produto';
      btn.addEventListener('click', () => openProductModal());
      topbarActionArea.appendChild(btn);
    } else if (tabId === 'sales') {
      const btn = document.createElement('button');
      btn.className = 'btn btn-gold';
      btn.innerHTML = '<span>✨</span> Nova Venda (PDV)';
      btn.addEventListener('click', () => openNewSaleModal());
      topbarActionArea.appendChild(btn);
    }
  }

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tabId = item.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // Botão rápido de venda na sidebar
  document.getElementById('btnSidebarQuickSale')?.addEventListener('click', () => {
    openNewSaleModal();
  });

  // Botão mobile toggle
  document.getElementById('btnToggleMobileSidebar')?.addEventListener('click', () => {
    document.getElementById('appSidebar')?.classList.toggle('mobile-open');
  });

  // Atalho do dashboard para insumos
  document.getElementById('btnGoToIngredients')?.addEventListener('click', () => {
    switchTab('ingredients');
  });

  // =========================================================================
  // TOAST NOTIFICATIONS
  // =========================================================================
  function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = '✅';
    if (type === 'warning') icon = '⚠️';
    if (type === 'error') icon = '❌';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // =========================================================================
  // CONTROLE DE MODAIS (ABERTURA & FECHAMENTO)
  // =========================================================================
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('open');
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('open');
  }

  // Fechamento genérico de modais via data-close ou clique no backdrop
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close');
      closeModal(modalId);
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
    }
  });

  // =========================================================================
  // 1. DASHBOARD & GRÁFICOS
  // =========================================================================
  function renderDashboard() {
    const sales = window.db.getSales();
    const ingredients = window.db.getIngredients();

    // 1. Cálculos de KPIs
    let totalRevenue = 0;
    let totalCost = 0;
    let totalNetProfit = 0;

    sales.forEach(s => {
      totalRevenue += parseFloat(s.totalGross) || 0;
      totalCost += parseFloat(s.totalCost) || 0;
      totalNetProfit += parseFloat(s.netProfit) || 0;
    });

    const cmvPercent = totalRevenue > 0 ? (totalCost / totalRevenue) * 100 : 0;
    const avgMarginPercent = totalRevenue > 0 ? (totalNetProfit / totalRevenue) * 100 : 0;

    // Insumos críticos
    const lowStockIngredients = ingredients.filter(i => (parseFloat(i.currentStock) || 0) <= (parseFloat(i.minStock) || 0));

    // Atualiza Elementos no DOM
    document.getElementById('kpiTotalRevenue').textContent = GastronomyCalc.formatCurrency(totalRevenue);
    document.getElementById('kpiNetProfit').textContent = GastronomyCalc.formatCurrency(totalNetProfit);
    document.getElementById('kpiTotalCost').textContent = GastronomyCalc.formatCurrency(totalCost);
    document.getElementById('kpiCmvPercent').textContent = `${GastronomyCalc.formatPercent(cmvPercent)} do faturamento`;
    document.getElementById('kpiAvgMargin').textContent = GastronomyCalc.formatPercent(avgMarginPercent);
    document.getElementById('kpiLowStockCount').textContent = lowStockIngredients.length;

    // Sidebar badge
    const sidebarBadge = document.getElementById('sidebarStockBadge');
    if (sidebarBadge) {
      if (lowStockIngredients.length > 0) {
        sidebarBadge.textContent = lowStockIngredients.length;
        sidebarBadge.style.display = 'inline-block';
      } else {
        sidebarBadge.style.display = 'none';
      }
    }

    // Lista de Insumos em Alerta no Dashboard
    const lowStockList = document.getElementById('dashboardLowStockList');
    if (lowStockList) {
      if (lowStockIngredients.length === 0) {
        lowStockList.innerHTML = `
          <div style="text-align: center; padding: 28px 12px; color: var(--accent-emerald);">
            <div style="font-size: 2rem; margin-bottom: 6px;">✨</div>
            <strong>Estoque 100% abastecido!</strong>
            <p style="font-size: 0.82rem; color: var(--text-dim); margin-top: 4px;">Nenhum insumo está abaixo do estoque de segurança.</p>
          </div>
        `;
      } else {
        lowStockList.innerHTML = lowStockIngredients.map(ing => `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: rgba(239, 68, 68, 0.08); border-left: 3px solid var(--accent-rose); border-radius: var(--radius-sm);">
            <div>
              <div style="font-weight: 600; font-size: 0.9rem; color: #fff;">${ing.name}</div>
              <div style="font-size: 0.78rem; color: var(--text-dim);">
                Atual: <strong style="color: var(--accent-rose);">${ing.currentStock} ${ing.packageUnit}</strong> | Mínimo: ${ing.minStock} ${ing.packageUnit}
              </div>
            </div>
            <button class="btn btn-sm btn-outline btn-repor" data-ing-id="${ing.id}" style="font-size: 0.75rem;">+ Repor</button>
          </div>
        `).join('');

        lowStockList.querySelectorAll('.btn-repor').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-ing-id');
            openStockAdjustModal(id);
          });
        });
      }
    }

    // Renderiza Gráficos Chart.js
    renderDashboardCharts(sales, totalCost, totalRevenue, totalNetProfit);
  }

  function renderDashboardCharts(sales, totalCost, totalRevenue, totalNetProfit) {
    if (typeof Chart === 'undefined') return;

    // Cores globais do Chart.js
    Chart.defaults.color = '#94A3B8';
    Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";

    // 1. Gráfico de Evolução Financeira (Agrupado por data de venda)
    const salesByDate = {};
    sales.slice().reverse().forEach(s => {
      const dateKey = new Date(s.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      if (!salesByDate[dateKey]) {
        salesByDate[dateKey] = { revenue: 0, cost: 0, profit: 0 };
      }
      salesByDate[dateKey].revenue += parseFloat(s.totalGross) || 0;
      salesByDate[dateKey].cost += parseFloat(s.totalCost) || 0;
      salesByDate[dateKey].profit += parseFloat(s.netProfit) || 0;
    });

    const labels = Object.keys(salesByDate);
    const revenueData = labels.map(l => salesByDate[l].revenue);
    const costData = labels.map(l => salesByDate[l].cost);
    const profitData = labels.map(l => salesByDate[l].profit);

    const canvasFin = document.getElementById('chartFinancialEvolution');
    if (canvasFin) {
      if (state.charts.financial) state.charts.financial.destroy();

      state.charts.financial = new Chart(canvasFin, {
        type: 'bar',
        data: {
          labels: labels.length ? labels : ['Sem vendas'],
          datasets: [
            {
              label: 'Faturamento Bruto',
              data: revenueData.length ? revenueData : [0],
              backgroundColor: 'rgba(245, 158, 11, 0.75)',
              borderRadius: 6
            },
            {
              label: 'CMV Custos',
              data: costData.length ? costData : [0],
              backgroundColor: 'rgba(239, 68, 68, 0.65)',
              borderRadius: 6
            },
            {
              label: 'Lucro Líquido Real',
              data: profitData.length ? profitData : [0],
              backgroundColor: 'rgba(16, 185, 129, 0.85)',
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top' },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.dataset.label}: ${GastronomyCalc.formatCurrency(ctx.raw)}`
              }
            }
          },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,0.05)' } },
            y: {
              grid: { color: 'rgba(255,255,255,0.05)' },
              ticks: {
                callback: (val) => 'R$ ' + val
              }
            }
          }
        }
      });
    }

    // 2. Gráfico de Composição (Doughnut)
    const canvasBreakdown = document.getElementById('chartCostBreakdown');
    if (canvasBreakdown) {
      if (state.charts.breakdown) state.charts.breakdown.destroy();

      let totalTaxes = 0;
      sales.forEach(s => {
        totalTaxes += (parseFloat(s.taxesValue) || 0) + (parseFloat(s.cardFeeValue) || 0);
      });

      state.charts.breakdown = new Chart(canvasBreakdown, {
        type: 'doughnut',
        data: {
          labels: ['CMV (Custo Mercadoria)', 'Lucro Líquido Real', 'Taxas & Impostos'],
          datasets: [{
            data: [
              Math.max(0, totalCost),
              Math.max(0, totalNetProfit),
              Math.max(0, totalTaxes)
            ],
            backgroundColor: [
              '#EF4444',
              '#10B981',
              '#F59E0B'
            ],
            borderColor: '#151c28',
            borderWidth: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.label}: ${GastronomyCalc.formatCurrency(ctx.raw)}`
              }
            }
          },
          cutout: '68%'
        }
      });
    }

    // 3. Gráfico Top Produtos Mais Lucrativos
    const canvasTop = document.getElementById('chartTopProducts');
    if (canvasTop) {
      if (state.charts.topProducts) state.charts.topProducts.destroy();

      const productProfits = {};
      sales.forEach(s => {
        (s.items || []).forEach(it => {
          const name = it.productName || 'Produto';
          const profit = (it.subtotalPrice || 0) - (it.subtotalCost || 0);
          productProfits[name] = (productProfits[name] || 0) + profit;
        });
      });

      const sortedProducts = Object.entries(productProfits)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      const topLabels = sortedProducts.map(p => p[0]);
      const topData = sortedProducts.map(p => p[1]);

      state.charts.topProducts = new Chart(canvasTop, {
        type: 'bar',
        indexAxis: 'y',
        data: {
          labels: topLabels.length ? topLabels : ['Sem dados'],
          datasets: [{
            label: 'Lucro Total Gerado',
            data: topData.length ? topData : [0],
            backgroundColor: 'rgba(99, 102, 241, 0.85)',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => `Lucro gerado: ${GastronomyCalc.formatCurrency(ctx.raw)}`
              }
            }
          },
          scales: {
            x: {
              grid: { color: 'rgba(255,255,255,0.05)' },
              ticks: { callback: (val) => 'R$ ' + val }
            },
            y: { grid: { display: false } }
          }
        }
      });
    }
  }

  // =========================================================================
  // 2. MÓDULO DE INSUMOS & ESTOQUE
  // =========================================================================
  function renderIngredientsTable() {
    const list = window.db.getIngredients();
    const tbody = document.getElementById('tbodyIngredients');
    const searchVal = document.getElementById('inputSearchIngredients')?.value.toLowerCase().trim() || '';
    const catVal = document.getElementById('selectFilterIngredientCategory')?.value || '';
    const stockVal = document.getElementById('selectFilterIngredientStock')?.value || 'all';

    // Preenche categorias no select
    populateIngredientCategories(list);

    // Filtros
    const filtered = list.filter(ing => {
      const matchSearch = ing.name.toLowerCase().includes(searchVal) || (ing.supplier || '').toLowerCase().includes(searchVal);
      const matchCat = catVal === '' || ing.category === catVal;
      let matchStock = true;
      const isLow = (parseFloat(ing.currentStock) || 0) <= (parseFloat(ing.minStock) || 0);
      if (stockVal === 'low') matchStock = isLow;
      if (stockVal === 'normal') matchStock = !isLow;

      return matchSearch && matchCat && matchStock;
    }).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { sensitivity: 'base' }));

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 40px; color: var(--text-dim);">
            Nenhum insumo encontrado para os filtros selecionados.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(ing => {
      const baseCost = GastronomyCalc.calcBaseUnitCost(
        ing.packagePrice,
        ing.packageQty,
        ing.packageUnit,
        ing.correctionFactor || 1.0
      );

      const baseUnit = GastronomyCalc.getBaseUnit(ing.packageUnit);
      let baseCostDisplay = `${GastronomyCalc.formatCurrency(baseCost)} / ${baseUnit}`;
      if (baseCost < 0.01) {
        baseCostDisplay = `R$ ${baseCost.toFixed(4).replace('.', ',')} / ${baseUnit}`;
      }

      let macroEquivalent = '';
      if (baseUnit === 'g') {
        macroEquivalent = `<div style="font-size: 0.74rem; color: var(--text-dim); margin-top: 2px;">(${GastronomyCalc.formatCurrency(baseCost * 1000)} / kg)</div>`;
      } else if (baseUnit === 'ml') {
        macroEquivalent = `<div style="font-size: 0.74rem; color: var(--text-dim); margin-top: 2px;">(${GastronomyCalc.formatCurrency(baseCost * 1000)} / L)</div>`;
      }

      const isLowStock = (parseFloat(ing.currentStock) || 0) <= (parseFloat(ing.minStock) || 0);
      const statusBadge = isLowStock
        ? `<span class="badge badge-danger">⚠️ Repor Estoque</span>`
        : `<span class="badge badge-success">✓ Normal</span>`;

      return `
        <tr>
          <td>
            <strong style="color: #fff; font-size: 0.92rem;">${ing.name}</strong>
            ${ing.supplier ? `<div style="font-size: 0.74rem; color: var(--text-dim);">Fornecedor: ${ing.supplier}</div>` : ''}
          </td>
          <td><span class="badge badge-category">${ing.category}</span></td>
          <td>${ing.packageQty} ${ing.packageUnit}</td>
          <td>${GastronomyCalc.formatCurrency(ing.packagePrice)}</td>
          <td>
            <strong style="color: var(--accent-gold); font-family: var(--font-mono);">${baseCostDisplay}</strong>
            ${macroEquivalent}
          </td>
          <td>${parseFloat(ing.correctionFactor || 1).toFixed(2)}</td>
          <td>
            <span style="font-weight: 600; color: ${isLowStock ? 'var(--accent-rose)' : '#fff'};">
              ${ing.currentStock} ${ing.packageUnit}
            </span>
            <div style="font-size: 0.72rem; color: var(--text-dim);">Mín: ${ing.minStock} ${ing.packageUnit}</div>
          </td>
          <td>${statusBadge}</td>
          <td style="text-align: right; white-space: nowrap;">
            <button class="btn btn-sm btn-outline btn-stock-adjust" data-id="${ing.id}" title="Ajustar Saldo em Estoque">📦</button>
            <button class="btn btn-sm btn-secondary btn-edit-ing" data-id="${ing.id}" title="Editar Insumo">✏️</button>
            <button class="btn btn-sm btn-danger-outline btn-delete-ing" data-id="${ing.id}" title="Excluir Insumo">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');

    // Eventos dos botões de ação da tabela
    tbody.querySelectorAll('.btn-stock-adjust').forEach(b => {
      b.addEventListener('click', () => openStockAdjustModal(b.getAttribute('data-id')));
    });

    tbody.querySelectorAll('.btn-edit-ing').forEach(b => {
      b.addEventListener('click', () => openIngredientModal(b.getAttribute('data-id')));
    });

    tbody.querySelectorAll('.btn-delete-ing').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.getAttribute('data-id');
        if (confirm('Tem certeza que deseja excluir este insumo? Fichas técnicas que utilizam ele podem ser afetadas.')) {
          window.db.deleteIngredient(id);
          showToast('Insumo excluído com sucesso!', 'warning');
          renderIngredientsTable();
          renderRecipes();
          renderProductsGrid();
          renderDashboard();
          initPricingCalculator();
          populateIngredientCategories(window.db.getIngredients());
        }
      });
    });
  }

  function populateIngredientCategories(ingredients) {
    const select = document.getElementById('selectFilterIngredientCategory');
    const datalist = document.getElementById('listCategories');
    const storedCats = (window.db.getIngredientCategories() || []).map(c => c.name);
    const categories = Array.from(new Set([...storedCats, ...ingCats]))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));

    if (select) {
      const currentVal = select.value;
      select.innerHTML = '<option value="">Todas as Categorias de Insumos</option>' +
        categories.map(c => `<option value="${c}" ${c === currentVal ? 'selected' : ''}>🌾 ${c}</option>`).join('');
    }

    if (datalist) {
      datalist.innerHTML = categories.map(c => `<option value="${c}">`).join('');
    }
  }

  // Listeners dos filtros de insumos
  document.getElementById('inputSearchIngredients')?.addEventListener('input', () => renderIngredientsTable());
  document.getElementById('selectFilterIngredientCategory')?.addEventListener('change', () => renderIngredientsTable());
  document.getElementById('selectFilterIngredientStock')?.addEventListener('change', () => renderIngredientsTable());
  document.getElementById('btnOpenNewIngredientModal')?.addEventListener('click', () => openIngredientModal());

  // Atualização em Tempo Real do Custo Unitário no Modal de Insumo
  function updateModalIngredientCalculatedCost() {
    const qty = parseFloat(document.getElementById('ingPackageQty')?.value) || 0;
    const unit = document.getElementById('ingPackageUnit')?.value || 'kg';
    const price = parseFloat(document.getElementById('ingPackagePrice')?.value) || 0;
    const fc = parseFloat(document.getElementById('ingCorrectionFactor')?.value) || 1.0;

    const costEl = document.getElementById('modalIngCalculatedCost');
    const costAltEl = document.getElementById('modalIngCalculatedCostAlt');
    if (!costEl || !costAltEl) return;

    if (qty <= 0 || price <= 0) {
      costEl.textContent = 'R$ 0,00';
      costAltEl.textContent = '(Preencha o preço e a quantidade para calcular)';
      return;
    }

    const baseUnitCost = GastronomyCalc.calcBaseUnitCost(price, qty, unit, fc);
    const baseUnit = GastronomyCalc.getBaseUnit(unit);

    let displayBase = `${GastronomyCalc.formatCurrency(baseUnitCost)} / ${baseUnit}`;
    if (baseUnitCost < 0.01) {
      displayBase = `R$ ${baseUnitCost.toFixed(4).replace('.', ',')} / ${baseUnit}`;
    }
    costEl.textContent = displayBase;

    // Equivalência de fácil leitura
    if (baseUnit === 'g') {
      const perKg = baseUnitCost * 1000;
      costAltEl.textContent = `(Equivalente a ${GastronomyCalc.formatCurrency(perKg)} / kg com FC)`;
    } else if (baseUnit === 'ml') {
      const perL = baseUnitCost * 1000;
      costAltEl.textContent = `(Equivalente a ${GastronomyCalc.formatCurrency(perL)} / Litro com FC)`;
    } else {
      costAltEl.textContent = `(Custo por cada unidade individual)`;
    }
  }

  // Ouvintes de input para recálculo automático em tempo real no modal de insumo
  ['ingPackageQty', 'ingPackageUnit', 'ingPackagePrice', 'ingCorrectionFactor'].forEach(fieldId => {
    const el = document.getElementById(fieldId);
    if (el) {
      el.addEventListener('input', updateModalIngredientCalculatedCost);
      el.addEventListener('change', updateModalIngredientCalculatedCost);
    }
  });

  // Modal Insumo: Abertura e Salvamento
  function openIngredientModal(ingredientId = null, defaultCategory = null) {
    const modal = document.getElementById('modalIngredient');
    const title = document.getElementById('modalIngredientTitle');
    const form = document.getElementById('formIngredient');
    form.reset();

    if (ingredientId) {
      const ing = window.db.getIngredients().find(i => i.id === ingredientId);
      if (ing) {
        title.textContent = 'Editar Insumo';
        document.getElementById('ingId').value = ing.id;
        document.getElementById('ingName').value = ing.name;
        document.getElementById('ingCategory').value = ing.category;
        document.getElementById('ingSupplier').value = ing.supplier || '';
        document.getElementById('ingPackageQty').value = ing.packageQty;
        document.getElementById('ingPackageUnit').value = ing.packageUnit;
        document.getElementById('ingPackagePrice').value = ing.packagePrice;
        document.getElementById('ingCorrectionFactor').value = ing.correctionFactor || 1.0;
        document.getElementById('ingCurrentStock').value = ing.currentStock || 0;
        document.getElementById('ingMinStock').value = ing.minStock || 1;
        document.getElementById('ingNotes').value = ing.notes || '';
      }
    } else {
      const targetCat = defaultCategory || state.selectedCategoryName || '';
      title.textContent = targetCat ? `Incluir Novo Insumo em "${targetCat}"` : 'Cadastrar Novo Insumo';
      document.getElementById('ingId').value = '';
      if (targetCat) {
        document.getElementById('ingCategory').value = targetCat;
      }
      document.getElementById('ingCorrectionFactor').value = '1.00';
      document.getElementById('ingMinStock').value = '1';
    }

    updateModalIngredientCalculatedCost();
    openModal('modalIngredient');
  }

  document.getElementById('formIngredient')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('ingId').value;
    const itemData = {
      name: document.getElementById('ingName').value.trim(),
      category: document.getElementById('ingCategory').value.trim(),
      supplier: document.getElementById('ingSupplier').value.trim(),
      packageQty: parseFloat(document.getElementById('ingPackageQty').value) || 1,
      packageUnit: document.getElementById('ingPackageUnit').value,
      packagePrice: parseFloat(document.getElementById('ingPackagePrice').value) || 0,
      correctionFactor: parseFloat(document.getElementById('ingCorrectionFactor').value) || 1.0,
      currentStock: parseFloat(document.getElementById('ingCurrentStock').value) || 0,
      minStock: parseFloat(document.getElementById('ingMinStock').value) || 1,
      notes: document.getElementById('ingNotes').value.trim()
    };

    if (id) {
      window.db.updateIngredient(id, itemData);
      showToast('Insumo atualizado com sucesso!');
    } else {
      window.db.addIngredient(itemData);
      showToast('Insumo cadastrado com sucesso!');
    }

    closeModal('modalIngredient');
    if (state.selectedCategoryName) {
      renderCategoryIngredientsTable(state.selectedCategoryName);
    }
    renderCategoriesTable();
    renderAllIngredientsTable();
    renderRecipes();
    renderProductsGrid();
    renderDashboard();
    initPricingCalculator();
    populateIngredientCategories(window.db.getIngredients());
  });

  // Modal Ajuste Rápido de Estoque
  function openStockAdjustModal(ingredientId) {
    const ing = window.db.getIngredients().find(i => i.id === ingredientId);
    if (!ing) return;

    document.getElementById('stockAdjustIngId').value = ing.id;
    document.getElementById('stockAdjustIngName').textContent = `${ing.name} (Saldo atual: ${ing.currentStock} ${ing.packageUnit})`;
    document.getElementById('stockAdjustUnitAffix').textContent = ing.packageUnit;
    document.getElementById('stockAdjustNewQty').value = ing.currentStock;

    openModal('modalStockAdjust');
  }

  document.getElementById('formStockAdjust')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('stockAdjustIngId').value;
    const newQty = parseFloat(document.getElementById('stockAdjustNewQty').value);

    if (id && !isNaN(newQty)) {
      window.db.updateIngredient(id, { currentStock: newQty });
      showToast('Estoque atualizado com sucesso!');
      closeModal('modalStockAdjust');
      if (state.selectedCategoryName) {
        renderCategoryIngredientsTable(state.selectedCategoryName);
      }
      renderCategoriesTable();
      renderAllIngredientsTable();
      renderDashboard();
    }
  });

  // =========================================================================
  // GESTÃO DE CATEGORIAS & INSUMOS INTEGRADOS
  // =========================================================================
  function renderCategoriesTable() {
    const categories = window.db.getCategories();
    const ingredients = window.db.getIngredients();
    const recipes = window.db.getRecipes();
    const tbody = document.getElementById('tbodyCategories');
    const searchVal = document.getElementById('inputSearchCategories')?.value.toLowerCase().trim() || '';

    // Atualiza contadores nas abas superiores (Pills)
    const insumosCount = categories.filter(c => c.type === 'insumo').length;
    const receitasCount = categories.filter(c => c.type === 'receita').length;
    const totalCount = categories.length;
    const allIngsCount = ingredients.length;

    const badgeInsumos = document.getElementById('badgeCatInsumosCount');
    const badgeReceitas = document.getElementById('badgeCatReceitasCount');
    const badgeTodas = document.getElementById('badgeCatTodasCount');
    const badgeAllIngs = document.getElementById('badgeAllIngredientsCount');
    if (badgeInsumos) badgeInsumos.textContent = insumosCount;
    if (badgeReceitas) badgeReceitas.textContent = receitasCount;
    if (badgeTodas) badgeTodas.textContent = totalCount;
    if (badgeAllIngs) badgeAllIngs.textContent = allIngsCount;

    // Atualiza botões ativos no subnav
    document.querySelectorAll('.category-subnav-btn').forEach(btn => {
      const view = btn.getAttribute('data-cat-view');
      if (view === state.categoryView) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Se estiver na visão "Todos os Insumos & Estoque Geral"
    const catFilterBar = document.getElementById('categoriesFilterBar');
    const catHintBanner = document.getElementById('categoryHintBanner');
    const catTableWrapper = document.getElementById('categoriesTableWrapper');
    const allIngWrapper = document.getElementById('allIngredientsWrapper');

    if (state.categoryView === 'all-ingredients') {
      if (catFilterBar) catFilterBar.style.display = 'none';
      if (catHintBanner) catHintBanner.style.display = 'none';
      if (catTableWrapper) catTableWrapper.style.display = 'none';
      if (allIngWrapper) allIngWrapper.style.display = 'block';
      renderAllIngredientsTable();
      return;
    } else {
      if (catFilterBar) catFilterBar.style.display = 'flex';
      if (catHintBanner) catHintBanner.style.display = 'flex';
      if (catTableWrapper) catTableWrapper.style.display = 'block';
      if (allIngWrapper) allIngWrapper.style.display = 'none';
    }

    if (!tbody) return;

    // Filtra conforme a visão selecionada (Insumo / Receita / Todas)
    const filtered = categories.filter(cat => {
      const matchSearch = cat.name.toLowerCase().includes(searchVal);
      let matchType = true;
      if (state.categoryView === 'insumo') matchType = cat.type === 'insumo';
      else if (state.categoryView === 'receita') matchType = cat.type === 'receita';
      return matchSearch && matchType;
    }).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { sensitivity: 'base' }));

    if (filtered.length === 0) {
      let emptyMsg = 'Nenhuma categoria encontrada.';
      if (state.categoryView === 'insumo') {
        emptyMsg = 'Nenhuma categoria de insumos encontrada. Clique no botão "🌾 + Nova Cat. Insumo" acima para cadastrar.';
      } else if (state.categoryView === 'receita') {
        emptyMsg = 'Nenhuma categoria de receitas encontrada. Clique no botão "📜 + Nova Cat. Receita" acima para cadastrar.';
      }
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-dim);">
            ${emptyMsg}
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(cat => {
      const isRecipe = cat.type === 'receita';
      const ingCount = ingredients.filter(i => (i.category || '').toLowerCase() === cat.name.toLowerCase()).length;
      const recCount = recipes.filter(r => (r.category || '').toLowerCase() === cat.name.toLowerCase()).length;

      let typeBadge = '';
      if (cat.type === 'insumo') {
        typeBadge = `<span class="badge badge-warning" style="background: rgba(245, 158, 11, 0.15); color: var(--accent-gold); border: 1px solid rgba(245, 158, 11, 0.3);">🌾 Categoria de Insumos</span>`;
      } else {
        typeBadge = `<span class="badge badge-success" style="background: rgba(16, 185, 129, 0.15); color: var(--accent-emerald); border: 1px solid rgba(16, 185, 129, 0.3);">📜 Categoria de Receitas</span>`;
      }

      return `
        <tr class="category-row-clickable" data-name="${cat.name}">
          <td style="font-size: 1.5rem; text-align: center;">${cat.icon || (isRecipe ? '📜' : '🌾')}</td>
          <td>
            <strong style="color: #fff; font-size: 0.95rem;">${cat.name}</strong>
            <div style="font-size: 0.72rem; color: var(--accent-gold); margin-top: 2px;">
              👉 Clique para abrir insumos & estoque
            </div>
          </td>
          <td>${typeBadge}</td>
          <td>
            <span style="font-weight: 600; color: ${ingCount > 0 ? 'var(--accent-gold)' : 'var(--text-dim)'};">
              ${ingCount} ${ingCount === 1 ? 'insumo' : 'insumos'}
            </span>
          </td>
          <td>
            <span style="font-weight: 600; color: ${recCount > 0 ? 'var(--accent-emerald)' : 'var(--text-dim)'};">
              ${recCount} ${recCount === 1 ? 'receita' : 'receitas'}
            </span>
          </td>
          <td style="text-align: right; white-space: nowrap;">
            <button class="btn btn-sm btn-primary btn-open-cat-detail" data-name="${cat.name}" title="Abrir Insumos & Estoque desta Categoria">
              <span>📂</span> Abrir
            </button>
            <button class="btn btn-sm btn-secondary btn-edit-cat" data-id="${cat.id}" title="Editar Categoria">✏️</button>
            <button class="btn btn-sm btn-danger-outline btn-delete-cat" data-id="${cat.id}" data-name="${cat.name}" title="Excluir Categoria">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');

    // Clique na linha ou no botão Abrir abre a categoria
    tbody.querySelectorAll('.category-row-clickable').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.btn-edit-cat') || e.target.closest('.btn-delete-cat')) return;
        const name = row.getAttribute('data-name');
        if (name) openCategoryDetailView(name);
      });
    });

    tbody.querySelectorAll('.btn-edit-cat').forEach(b => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        openCategoryModal(b.getAttribute('data-id'));
      });
    });

    tbody.querySelectorAll('.btn-delete-cat').forEach(b => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = b.getAttribute('data-id');
        const name = b.getAttribute('data-name');
        const ingCount = ingredients.filter(i => (i.category || '').toLowerCase() === name.toLowerCase()).length;
        const recCount = recipes.filter(r => (r.category || '').toLowerCase() === name.toLowerCase()).length;

        let msg = `Tem certeza que deseja excluir a categoria "${name}"?`;
        if (ingCount > 0 || recCount > 0) {
          msg += `\nAtenção: Existem ${ingCount} insumo(s) e ${recCount} receita(s) associados a esta categoria!`;
        }

        if (confirm(msg)) {
          window.db.deleteCategory(id);
          showToast(`Categoria "${name}" excluída com sucesso!`, 'warning');
          renderCategoriesTable();
          populateIngredientCategories(window.db.getIngredients());
          populateRecipeCategories(window.db.getRecipes());
        }
      });
    });
  }

  // Abre a Tela da Categoria Específica (Insumos & Quantidade em Estoque)
  function openCategoryDetailView(categoryName) {
    state.selectedCategoryName = categoryName;
    const cat = window.db.getCategories().find(c => c.name.toLowerCase() === categoryName.toLowerCase());
    const isRecipe = cat ? cat.type === 'receita' : false;
    const icon = cat ? (cat.icon || (isRecipe ? '📜' : '🌾')) : '🌾';

    const mainView = document.getElementById('categoriesMainView');
    const detailView = document.getElementById('categoryDetailView');
    if (mainView) mainView.style.display = 'none';
    if (detailView) detailView.style.display = 'block';

    const iconEl = document.getElementById('catDetailIcon');
    const nameEl = document.getElementById('catDetailName');
    const typeBadgeEl = document.getElementById('catDetailTypeBadge');
    if (iconEl) iconEl.textContent = icon;
    if (nameEl) nameEl.textContent = categoryName;
    if (typeBadgeEl) {
      if (isRecipe) {
        typeBadgeEl.className = 'badge badge-success';
        typeBadgeEl.innerHTML = '📜 Categoria de Receitas';
      } else {
        typeBadgeEl.className = 'badge badge-warning';
        typeBadgeEl.innerHTML = '🌾 Categoria de Insumos';
      }
    }

    renderTopbarActions('categories');
    renderCategoryIngredientsTable(categoryName);
  }

  // Fecha a Tela da Categoria e Retorna para a Listagem de Categorias
  function closeCategoryDetailView() {
    state.selectedCategoryName = null;
    const mainView = document.getElementById('categoriesMainView');
    const detailView = document.getElementById('categoryDetailView');
    if (mainView) mainView.style.display = 'block';
    if (detailView) detailView.style.display = 'none';

    renderTopbarActions('categories');
    renderCategoriesTable();
  }

  // Renderiza a Tabela de Insumos da Categoria Selecionada (100% Fit, SEM Rolagem Horizontal)
  function renderCategoryIngredientsTable(categoryName) {
    const list = window.db.getIngredients();
    const tbody = document.getElementById('tbodyCategoryIngredients');
    const searchVal = document.getElementById('inputSearchCategoryIngredients')?.value.toLowerCase().trim() || '';
    const stockVal = document.getElementById('selectFilterCategoryStock')?.value || 'all';

    // Insumos desta categoria
    const categoryIngs = list.filter(i => (i.category || '').toLowerCase() === categoryName.toLowerCase());

    // Métricas da Categoria
    let totalStockVal = 0;
    let lowCount = 0;
    categoryIngs.forEach(ing => {
      const baseCost = GastronomyCalc.calcBaseUnitCost(ing.packagePrice, ing.packageQty, ing.packageUnit, ing.correctionFactor || 1.0);
      totalStockVal += (parseFloat(ing.currentStock) || 0) * baseCost;
      if ((parseFloat(ing.currentStock) || 0) <= (parseFloat(ing.minStock) || 0)) {
        lowCount++;
      }
    });

    const elTotalItems = document.getElementById('catDetailTotalItems');
    const elTotalVal = document.getElementById('catDetailTotalValue');
    const elStockStatus = document.getElementById('catDetailStockStatus');
    if (elTotalItems) elTotalItems.textContent = `${categoryIngs.length} ${categoryIngs.length === 1 ? 'insumo' : 'insumos'}`;
    if (elTotalVal) elTotalVal.textContent = GastronomyCalc.formatCurrency(totalStockVal);
    if (elStockStatus) {
      if (lowCount > 0) {
        elStockStatus.className = 'cat-kpi-value danger';
        elStockStatus.textContent = `⚠️ ${lowCount} em Alerta`;
      } else {
        elStockStatus.className = 'cat-kpi-value emerald';
        elStockStatus.textContent = '✓ Em Dia';
      }
    }

    // Filtros
    const filtered = categoryIngs.filter(ing => {
      const matchSearch = ing.name.toLowerCase().includes(searchVal) || (ing.supplier || '').toLowerCase().includes(searchVal);
      let matchStock = true;
      const isLow = (parseFloat(ing.currentStock) || 0) <= (parseFloat(ing.minStock) || 0);
      if (stockVal === 'low') matchStock = isLow;
      if (stockVal === 'normal') matchStock = !isLow;
      return matchSearch && matchStock;
    }).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { sensitivity: 'base' }));

    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 45px 20px; color: var(--text-dim);">
            <div style="font-size: 2.2rem; margin-bottom: 8px;">🌾</div>
            <div style="font-size: 1rem; color: #fff; font-weight: 600; margin-bottom: 4px;">Nenhum insumo nesta categoria</div>
            <div style="font-size: 0.82rem; margin-bottom: 16px;">Inclua seus insumos e defina as quantidades em estoque para compor suas fichas técnicas.</div>
            <button type="button" class="btn btn-primary btn-sm" id="btnEmptyStateNewIng">
              <span>+</span> Incluir Novo Insumo em "${categoryName}"
            </button>
          </td>
        </tr>
      `;
      document.getElementById('btnEmptyStateNewIng')?.addEventListener('click', () => {
        openIngredientModal(null, categoryName);
      });
      return;
    }

    tbody.innerHTML = filtered.map(ing => {
      const baseCost = GastronomyCalc.calcBaseUnitCost(ing.packagePrice, ing.packageQty, ing.packageUnit, ing.correctionFactor || 1.0);
      const baseUnit = GastronomyCalc.getBaseUnit(ing.packageUnit);
      let baseCostDisplay = `${GastronomyCalc.formatCurrency(baseCost)} / ${baseUnit}`;
      if (baseCost < 0.01) {
        baseCostDisplay = `R$ ${baseCost.toFixed(4).replace('.', ',')} / ${baseUnit}`;
      }

      let macroEquivalent = '';
      if (baseUnit === 'g') {
        macroEquivalent = `(${GastronomyCalc.formatCurrency(baseCost * 1000)}/kg)`;
      } else if (baseUnit === 'ml') {
        macroEquivalent = `(${GastronomyCalc.formatCurrency(baseCost * 1000)}/L)`;
      }

      const isLowStock = (parseFloat(ing.currentStock) || 0) <= (parseFloat(ing.minStock) || 0);
      const statusBadge = isLowStock
        ? `<span class="badge badge-danger">⚠️ Repor</span>`
        : `<span class="badge badge-success">✓ Normal</span>`;

      return `
        <tr>
          <td>
            <div style="font-weight: 700; color: #fff; font-size: 0.92rem; line-height: 1.25;">${ing.name}</div>
            <div style="font-size: 0.72rem; color: var(--text-dim); margin-top: 2px;">
              ${ing.supplier ? `Fornecedor: ${ing.supplier}` : 'Sem fornecedor'} • Emb: ${ing.packageQty} ${ing.packageUnit}
            </div>
          </td>
          <td>
            <div style="font-weight: 600; color: #fff;">${GastronomyCalc.formatCurrency(ing.packagePrice)}</div>
            <div style="font-size: 0.72rem; color: var(--text-dim); margin-top: 1px;">por ${ing.packageQty} ${ing.packageUnit}</div>
          </td>
          <td>
            <div style="font-weight: 700; color: var(--accent-gold); font-family: var(--font-mono); font-size: 0.88rem;">${baseCostDisplay}</div>
            <div style="font-size: 0.72rem; color: var(--text-dim); margin-top: 1px;">FC: ${parseFloat(ing.correctionFactor || 1).toFixed(2)} ${macroEquivalent}</div>
          </td>
          <td>
            <div class="stock-control-wrapper">
              <button type="button" class="btn-stock-step btn-cat-stock-sub" data-id="${ing.id}" title="Diminuir estoque">-</button>
              <span class="stock-value-display" style="color: ${isLowStock ? 'var(--accent-rose)' : '#fff'};">
                ${ing.currentStock} ${ing.packageUnit}
              </span>
              <button type="button" class="btn-stock-step btn-cat-stock-add" data-id="${ing.id}" title="Aumentar estoque">+</button>
            </div>
            <div style="font-size: 0.71rem; color: var(--text-dim); margin-top: 2px;">Mín: ${ing.minStock} ${ing.packageUnit}</div>
          </td>
          <td>${statusBadge}</td>
          <td style="text-align: right; white-space: nowrap;">
            <div style="display: flex; gap: 4px; justify-content: flex-end;">
              <button class="btn btn-sm btn-outline btn-cat-stock-adjust" data-id="${ing.id}" title="Ajustar Saldo em Estoque">📦</button>
              <button class="btn btn-sm btn-secondary btn-cat-edit-ing" data-id="${ing.id}" title="Editar Insumo">✏️</button>
              <button class="btn btn-sm btn-danger-outline btn-cat-delete-ing" data-id="${ing.id}" title="Excluir Insumo">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Ajuste rápido de estoque (+ / -)
    tbody.querySelectorAll('.btn-cat-stock-add').forEach(b => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = b.getAttribute('data-id');
        const ing = list.find(i => i.id === id);
        if (ing) {
          const step = (ing.packageUnit === 'g' || ing.packageUnit === 'ml') ? (parseFloat(ing.packageQty) || 100) : 1;
          const newQty = Math.round(((parseFloat(ing.currentStock) || 0) + step) * 100) / 100;
          window.db.updateIngredient(id, { currentStock: newQty });
          showToast(`+${step} ${ing.packageUnit} adicionado ao estoque de "${ing.name}"!`);
          renderCategoryIngredientsTable(categoryName);
          renderDashboard();
        }
      });
    });

    tbody.querySelectorAll('.btn-cat-stock-sub').forEach(b => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = b.getAttribute('data-id');
        const ing = list.find(i => i.id === id);
        if (ing) {
          const step = (ing.packageUnit === 'g' || ing.packageUnit === 'ml') ? (parseFloat(ing.packageQty) || 100) : 1;
          const newQty = Math.max(0, Math.round(((parseFloat(ing.currentStock) || 0) - step) * 100) / 100);
          window.db.updateIngredient(id, { currentStock: newQty });
          showToast(`-${step} ${ing.packageUnit} deduzido do estoque de "${ing.name}".`);
          renderCategoryIngredientsTable(categoryName);
          renderDashboard();
        }
      });
    });

    tbody.querySelectorAll('.btn-cat-stock-adjust').forEach(b => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        openStockAdjustModal(b.getAttribute('data-id'));
      });
    });

    tbody.querySelectorAll('.btn-cat-edit-ing').forEach(b => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        openIngredientModal(b.getAttribute('data-id'), categoryName);
      });
    });

    tbody.querySelectorAll('.btn-cat-delete-ing').forEach(b => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = b.getAttribute('data-id');
        if (confirm('Tem certeza que deseja excluir este insumo?')) {
          window.db.deleteIngredient(id);
          showToast('Insumo excluído com sucesso!', 'warning');
          renderCategoryIngredientsTable(categoryName);
          renderCategoriesTable();
          renderDashboard();
        }
      });
    });
  }

  // Renderiza Todos os Insumos & Estoque Geral (SEM Rolagem Horizontal)
  function renderAllIngredientsTable() {
    const list = window.db.getIngredients();
    const tbody = document.getElementById('tbodyAllIngredients');
    const searchVal = document.getElementById('inputSearchAllIngredients')?.value.toLowerCase().trim() || '';
    const stockVal = document.getElementById('selectFilterAllStock')?.value || 'all';

    const filtered = list.filter(ing => {
      const matchSearch = ing.name.toLowerCase().includes(searchVal) || 
                          (ing.supplier || '').toLowerCase().includes(searchVal) ||
                          (ing.category || '').toLowerCase().includes(searchVal);
      let matchStock = true;
      const isLow = (parseFloat(ing.currentStock) || 0) <= (parseFloat(ing.minStock) || 0);
      if (stockVal === 'low') matchStock = isLow;
      if (stockVal === 'normal') matchStock = !isLow;
      return matchSearch && matchStock;
    }).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { sensitivity: 'base' }));

    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-dim);">
            Nenhum insumo encontrado para a busca.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(ing => {
      const baseCost = GastronomyCalc.calcBaseUnitCost(ing.packagePrice, ing.packageQty, ing.packageUnit, ing.correctionFactor || 1.0);
      const baseUnit = GastronomyCalc.getBaseUnit(ing.packageUnit);
      let baseCostDisplay = `${GastronomyCalc.formatCurrency(baseCost)} / ${baseUnit}`;
      if (baseCost < 0.01) {
        baseCostDisplay = `R$ ${baseCost.toFixed(4).replace('.', ',')} / ${baseUnit}`;
      }

      const isLowStock = (parseFloat(ing.currentStock) || 0) <= (parseFloat(ing.minStock) || 0);
      const statusBadge = isLowStock
        ? `<span class="badge badge-danger">⚠️ Repor</span>`
        : `<span class="badge badge-success">✓ Normal</span>`;

      return `
        <tr>
          <td>
            <div style="font-weight: 700; color: #fff; font-size: 0.90rem;">${ing.name}</div>
            <div style="font-size: 0.72rem; color: var(--text-dim); margin-top: 1px;">${ing.supplier || 'Sem fornecedor'} • ${ing.packageQty} ${ing.packageUnit}</div>
          </td>
          <td><span class="badge badge-category" style="cursor: pointer;" data-cat="${ing.category}">${ing.category}</span></td>
          <td>
            <div style="font-weight: 600; color: #fff;">${GastronomyCalc.formatCurrency(ing.packagePrice)}</div>
          </td>
          <td>
            <div style="font-weight: 700; color: var(--accent-gold); font-family: var(--font-mono); font-size: 0.86rem;">${baseCostDisplay}</div>
          </td>
          <td>
            <div class="stock-control-wrapper">
              <button type="button" class="btn-stock-step btn-all-stock-sub" data-id="${ing.id}">-</button>
              <span class="stock-value-display" style="color: ${isLowStock ? 'var(--accent-rose)' : '#fff'};">
                ${ing.currentStock} ${ing.packageUnit}
              </span>
              <button type="button" class="btn-stock-step btn-all-stock-add" data-id="${ing.id}">+</button>
            </div>
          </td>
          <td style="text-align: right; white-space: nowrap;">
            <div style="display: flex; gap: 4px; justify-content: flex-end;">
              <button class="btn btn-sm btn-outline btn-all-stock-adjust" data-id="${ing.id}" title="Ajustar Estoque">📦</button>
              <button class="btn btn-sm btn-secondary btn-all-edit-ing" data-id="${ing.id}" title="Editar">✏️</button>
              <button class="btn btn-sm btn-danger-outline btn-all-delete-ing" data-id="${ing.id}" title="Excluir">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.badge-category').forEach(b => {
      b.addEventListener('click', () => {
        const cat = b.getAttribute('data-cat');
        if (cat) openCategoryDetailView(cat);
      });
    });

    tbody.querySelectorAll('.btn-all-stock-add').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.getAttribute('data-id');
        const ing = list.find(i => i.id === id);
        if (ing) {
          const step = (ing.packageUnit === 'g' || ing.packageUnit === 'ml') ? (parseFloat(ing.packageQty) || 100) : 1;
          const newQty = Math.round(((parseFloat(ing.currentStock) || 0) + step) * 100) / 100;
          window.db.updateIngredient(id, { currentStock: newQty });
          showToast(`+${step} ${ing.packageUnit} adicionado ao estoque de "${ing.name}"!`);
          renderAllIngredientsTable();
          renderDashboard();
        }
      });
    });

    tbody.querySelectorAll('.btn-all-stock-sub').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.getAttribute('data-id');
        const ing = list.find(i => i.id === id);
        if (ing) {
          const step = (ing.packageUnit === 'g' || ing.packageUnit === 'ml') ? (parseFloat(ing.packageQty) || 100) : 1;
          const newQty = Math.max(0, Math.round(((parseFloat(ing.currentStock) || 0) - step) * 100) / 100);
          window.db.updateIngredient(id, { currentStock: newQty });
          showToast(`-${step} ${ing.packageUnit} deduzido do estoque de "${ing.name}".`);
          renderAllIngredientsTable();
          renderDashboard();
        }
      });
    });

    tbody.querySelectorAll('.btn-all-stock-adjust').forEach(b => {
      b.addEventListener('click', () => openStockAdjustModal(b.getAttribute('data-id')));
    });

    tbody.querySelectorAll('.btn-all-edit-ing').forEach(b => {
      b.addEventListener('click', () => openIngredientModal(b.getAttribute('data-id')));
    });

    tbody.querySelectorAll('.btn-all-delete-ing').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.getAttribute('data-id');
        if (confirm('Tem certeza que deseja excluir este insumo?')) {
          window.db.deleteIngredient(id);
          showToast('Insumo excluído com sucesso!', 'warning');
          renderAllIngredientsTable();
          renderDashboard();
        }
      });
    });
  }

  // Subnav Pill Click Listeners
  document.querySelectorAll('.category-subnav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.categoryView = btn.getAttribute('data-cat-view') || 'insumo';
      renderCategoriesTable();
    });
  });

  // Event Listeners da Tela de Detalhes da Categoria
  document.getElementById('btnBackToCategoriesList')?.addEventListener('click', () => closeCategoryDetailView());
  document.getElementById('btnCatDetailNewIngredient')?.addEventListener('click', () => openIngredientModal(null, state.selectedCategoryName));
  document.getElementById('btnCatDetailNewIngredientBottom')?.addEventListener('click', () => openIngredientModal(null, state.selectedCategoryName));
  document.getElementById('btnCatDetailEditCategory')?.addEventListener('click', () => {
    if (state.selectedCategoryName) {
      const cat = window.db.getCategories().find(c => c.name.toLowerCase() === state.selectedCategoryName.toLowerCase());
      if (cat) openCategoryModal(cat.id);
    }
  });
  document.getElementById('inputSearchCategoryIngredients')?.addEventListener('input', () => {
    if (state.selectedCategoryName) renderCategoryIngredientsTable(state.selectedCategoryName);
  });
  document.getElementById('selectFilterCategoryStock')?.addEventListener('change', () => {
    if (state.selectedCategoryName) renderCategoryIngredientsTable(state.selectedCategoryName);
  });
  document.getElementById('inputSearchAllIngredients')?.addEventListener('input', () => renderAllIngredientsTable());
  document.getElementById('selectFilterAllStock')?.addEventListener('change', () => renderAllIngredientsTable());
  document.getElementById('btnOpenNewIngredientGlobalModal')?.addEventListener('click', () => openIngredientModal());
  document.getElementById('inputSearchCategories')?.addEventListener('input', () => renderCategoriesTable());

  // Modal de Categorias (com seletor visual Insumo vs Receita)
  function openCategoryModal(categoryId = null, defaultType = null) {
    const modal = document.getElementById('modalCategory');
    const title = document.getElementById('modalCategoryTitle');
    const form = document.getElementById('formCategory');
    form.reset();

    const radioInsumo = document.getElementById('catTypeInsumo');
    const radioReceita = document.getElementById('catTypeReceita');
    const labelInsumo = document.getElementById('labelCatTypeInsumo');
    const labelReceita = document.getElementById('labelCatTypeReceita');
    const iconInput = document.getElementById('catIcon');

    function setTypeSelection(type) {
      if (type === 'receita') {
        if (radioReceita) radioReceita.checked = true;
        labelReceita?.classList.add('active');
        labelInsumo?.classList.remove('active');
      } else {
        if (radioInsumo) radioInsumo.checked = true;
        labelInsumo?.classList.add('active');
        labelReceita?.classList.remove('active');
      }
    }

    if (categoryId) {
      const cat = window.db.getCategories().find(c => c.id === categoryId);
      if (cat) {
        title.textContent = `Editar Categoria (${cat.type === 'receita' ? 'Receita' : 'Insumo'})`;
        document.getElementById('catId').value = cat.id;
        document.getElementById('catName').value = cat.name;
        if (iconInput) iconInput.value = cat.icon || (cat.type === 'receita' ? '📜' : '🌾');
        setTypeSelection(cat.type);
      }
    } else {
      const chosenType = defaultType || (state.categoryView === 'receita' ? 'receita' : 'insumo');
      title.textContent = chosenType === 'receita' ? 'Nova Categoria de Receitas' : 'Nova Categoria de Insumos';
      document.getElementById('catId').value = '';
      if (iconInput) iconInput.value = chosenType === 'receita' ? '📜' : '🌾';
      setTypeSelection(chosenType);
    }

    openModal('modalCategory');
  }

  // Alternância interativa dos cards de tipo no modal
  document.getElementById('labelCatTypeInsumo')?.addEventListener('click', () => {
    document.getElementById('labelCatTypeInsumo').classList.add('active');
    document.getElementById('labelCatTypeReceita')?.classList.remove('active');
    const icon = document.getElementById('catIcon');
    if (icon && (icon.value === '📜' || !icon.value)) icon.value = '🌾';
  });

  document.getElementById('labelCatTypeReceita')?.addEventListener('click', () => {
    document.getElementById('labelCatTypeReceita').classList.add('active');
    document.getElementById('labelCatTypeInsumo')?.classList.remove('active');
    const icon = document.getElementById('catIcon');
    if (icon && (icon.value === '🌾' || !icon.value)) icon.value = '📜';
  });

  // Sugestões de ícones rápidos no modal
  document.querySelectorAll('.cat-icon-pick').forEach(btn => {
    btn.addEventListener('click', () => {
      const icon = btn.getAttribute('data-icon');
      const input = document.getElementById('catIcon');
      if (input && icon) input.value = icon;
    });
  });

  document.getElementById('formCategory')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('catId').value;
    const selectedRadio = document.querySelector('input[name="catTypeRadio"]:checked');
    const catType = selectedRadio ? selectedRadio.value : 'insumo';

    const catData = {
      name: document.getElementById('catName').value.trim(),
      icon: document.getElementById('catIcon').value.trim() || (catType === 'receita' ? '📜' : '🌾'),
      type: catType
    };

    if (!catData.name) {
      alert('Informe o nome da categoria!');
      return;
    }

    if (id) {
      window.db.updateCategory(id, catData);
      showToast('Categoria atualizada com sucesso!');
    } else {
      window.db.addCategory(catData);
      showToast(`Categoria de ${catType === 'receita' ? 'Receita' : 'Insumo'} cadastrada com sucesso!`);
    }

    // Muda a visão da tabela para a divisão da categoria salva para visualização imediata
    state.categoryView = catType;

    closeModal('modalCategory');
    renderCategoriesTable();
    populateIngredientCategories(window.db.getIngredients());
    populateRecipeCategories(window.db.getRecipes());
    renderIngredientsTable();
    renderRecipes();
  });

  document.getElementById('inputSearchCategories')?.addEventListener('input', () => renderCategoriesTable());
  document.getElementById('btnOpenNewCategoryInsumoModal')?.addEventListener('click', () => openCategoryModal(null, 'insumo'));
  document.getElementById('btnOpenNewCategoryReceitaModal')?.addEventListener('click', () => openCategoryModal(null, 'receita'));

  // =========================================================================
  // 3. MÓDULO DE FICHAS TÉCNICAS (RECEITAS)
  // =========================================================================
  function renderRecipes() {
    const recipes = window.db.getRecipes();
    const ingredients = window.db.getIngredients();
    const container = document.getElementById('recipesContainer');
    const searchVal = document.getElementById('inputSearchRecipes')?.value.toLowerCase().trim() || '';
    const catVal = document.getElementById('selectFilterRecipeCategory')?.value || '';

    // Popula categorias de receitas
    populateRecipeCategories(recipes);

    const filtered = recipes.filter(rec => {
      const matchSearch = rec.name.toLowerCase().includes(searchVal) || (rec.instructions || '').toLowerCase().includes(searchVal);
      const matchCat = catVal === '' || rec.category === catVal;
      return matchSearch && matchCat;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="panel-card" style="text-align: center; padding: 48px; color: var(--text-dim);">
          <div style="font-size: 2.5rem; margin-bottom: 8px;">📜</div>
          <h3>Nenhuma Ficha Técnica Encontrada</h3>
          <p style="margin-top: 6px;">Crie sua primeira ficha técnica para calcular custos de matérias-primas e rendimento.</p>
          <button class="btn btn-primary" style="margin-top: 16px;" onclick="document.getElementById('btnOpenNewRecipeModal').click()">+ Criar Ficha Técnica</button>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(rec => {
      const calc = GastronomyCalc.calcRecipeCost(rec, ingredients);

      return `
        <div class="recipe-sheet-card" id="recipe-card-${rec.id}">
          <div class="recipe-sheet-header">
            <div class="recipe-title-group">
              <h3>${rec.name}</h3>
              <div class="recipe-meta-tags">
                <span class="badge badge-category">📂 ${rec.category}</span>
                <span class="badge badge-category">⏱️ ${rec.prepTimeMinutes || 0} min de preparo</span>
                <span class="badge badge-category">⚖️ Rendimento: ${rec.yieldUnits} ${rec.yieldUnitName || 'porções'}</span>
              </div>
            </div>

            <!-- Resumo Financeiro da Ficha -->
            <div class="recipe-summary-box">
              <div class="recipe-metric-item">
                <span class="recipe-metric-label">CMV Insumos (Lote)</span>
                <span class="recipe-metric-val">${GastronomyCalc.formatCurrency(calc.rawMaterialCost)}</span>
              </div>
              <div class="recipe-metric-item">
                <span class="recipe-metric-label">Custos Indiretos</span>
                <span class="recipe-metric-val">${GastronomyCalc.formatCurrency(calc.operationalCost + calc.laborCost + calc.packagingCost + calc.technicalLossCost)}</span>
              </div>
              <div class="recipe-metric-item">
                <span class="recipe-metric-label">CUSTO TOTAL DO LOTE</span>
                <span class="recipe-metric-val highlight">${GastronomyCalc.formatCurrency(calc.totalBatchCost)}</span>
              </div>
              <div class="recipe-metric-item" style="border-left: 2px solid rgba(245, 158, 11, 0.4); padding-left: 16px;">
                <span class="recipe-metric-label">CUSTO POR PORÇÃO</span>
                <span class="recipe-metric-val highlight" style="color: var(--accent-emerald); font-size: 1.45rem;">
                  ${GastronomyCalc.formatCurrency(calc.costPerUnit)}
                </span>
              </div>
            </div>
          </div>

          <!-- Tabela de Itens Utilizados na Receita -->
          <div class="table-responsive" style="margin-bottom: 16px;">
            <table class="custom-table" style="font-size: 0.84rem;">
              <thead>
                <tr>
                  <th>Ingrediente</th>
                  <th>Categoria</th>
                  <th>Qtd. Utilizada</th>
                  <th>Custo Unit. Insumo</th>
                  <th>Subtotal de Custo</th>
                  <th>% do CMV</th>
                </tr>
              </thead>
              <tbody>
                ${calc.calculatedItems.map(item => {
                  const percentOfRaw = calc.rawMaterialCost > 0 ? (item.cost / calc.rawMaterialCost) * 100 : 0;
                  return `
                    <tr>
                      <td><strong style="color: #fff;">${item.name}</strong></td>
                      <td><span class="badge badge-category">${item.category || '-'}</span></td>
                      <td>${item.quantity} ${item.unit}</td>
                      <td>${GastronomyCalc.formatCurrency(item.baseUnitCost)}/${GastronomyCalc.getBaseUnit(item.unit)}</td>
                      <td><strong style="color: var(--accent-gold); font-family: var(--font-mono);">${GastronomyCalc.formatCurrency(item.cost)}</strong></td>
                      <td>${GastronomyCalc.formatPercent(percentOfRaw, 1)}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          ${rec.instructions ? `
            <div style="background-color: rgba(0, 0, 0, 0.2); padding: 14px 18px; border-radius: var(--radius-md); margin-bottom: 16px; border: 1px solid var(--border-subtle);">
              <div style="font-weight: 700; font-size: 0.85rem; color: var(--accent-gold); text-transform: uppercase; margin-bottom: 6px;">👨‍🍳 Modo de Preparo Técnico</div>
              <p style="font-size: 0.84rem; color: var(--text-muted); white-space: pre-line; line-height: 1.6;">${rec.instructions}</p>
            </div>
          ` : ''}

          <!-- Ações da Ficha Técnica -->
          <div style="display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-sm btn-secondary btn-print-recipe" data-id="${rec.id}">
              <span>🖨️</span> Imprimir Ficha
            </button>
            <button class="btn btn-sm btn-gold btn-simulate-price" data-id="${rec.id}">
              <span>🏷️</span> Simular Precificação & Markup
            </button>
            <button class="btn btn-sm btn-secondary btn-edit-recipe" data-id="${rec.id}">
              <span>✏️</span> Editar
            </button>
            <button class="btn btn-sm btn-danger-outline btn-delete-recipe" data-id="${rec.id}">
              <span>🗑️</span> Excluir
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Eventos dos botões de ficha técnica
    container.querySelectorAll('.btn-print-recipe').forEach(b => {
      b.addEventListener('click', () => printRecipeTechnicalSheet(b.getAttribute('data-id')));
    });

    container.querySelectorAll('.btn-simulate-price').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.getAttribute('data-id');
        switchTab('pricing', id);
      });
    });

    container.querySelectorAll('.btn-edit-recipe').forEach(b => {
      b.addEventListener('click', () => openRecipeModal(b.getAttribute('data-id')));
    });

    container.querySelectorAll('.btn-delete-recipe').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.getAttribute('data-id');
        if (confirm('Tem certeza que deseja excluir esta Ficha Técnica?')) {
          window.db.deleteRecipe(id);
          showToast('Ficha técnica excluída!', 'warning');
          renderRecipes();
          renderProductsGrid();
          renderDashboard();
          initPricingCalculator();
          populateRecipeCategories(window.db.getRecipes());
        }
      });
    });
  }

  function populateRecipeCategories(recipes) {
    const select = document.getElementById('selectFilterRecipeCategory');
    const datalist = document.getElementById('listRecipeCategories');
    const storedCats = (window.db.getRecipeCategories() || []).map(c => c.name);
    const recCats = (recipes || []).map(r => r.category);
    const categories = Array.from(new Set([...storedCats, ...recCats]))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));

    if (select) {
      const currentVal = select.value;
      select.innerHTML = '<option value="">Todas as Categorias de Receitas</option>' +
        categories.map(c => `<option value="${c}" ${c === currentVal ? 'selected' : ''}>📜 ${c}</option>`).join('');
    }

    if (datalist) {
      datalist.innerHTML = categories.map(c => `<option value="${c}">`).join('');
    }
  }

  document.getElementById('inputSearchRecipes')?.addEventListener('input', () => renderRecipes());
  document.getElementById('selectFilterRecipeCategory')?.addEventListener('change', () => renderRecipes());
  document.getElementById('btnOpenNewRecipeModal')?.addEventListener('click', () => openRecipeModal());

  // Modal Ficha Técnica: Gerenciador de Linhas Dinâmicas de Ingredientes
  // Seleção em 2 Etapas: 1º Escolhe a Categoria de Insumo -> 2º Filtra e escolhe o Insumo
  function addRecipeItemRow(item = { ingredientId: '', quantity: 100, unit: 'g' }) {
    const tbody = document.getElementById('recipeItemsTbody');
    const ingredients = window.db.getIngredients();
    const row = document.createElement('tr');

    // Determina a categoria inicial se o item já tiver um insumo vinculado
    let initialCategory = '';
    if (item.ingredientId) {
      const selectedIng = ingredients.find(i => i.id === item.ingredientId);
      if (selectedIng) {
        initialCategory = selectedIng.category;
      }
    }

    // Lista única de categorias de insumos (Receitas NUNCA entram na seleção de ingredientes)
    const availableCategories = Array.from(new Set([
      ...(window.db.getIngredientCategories() || []).map(c => c.name),
      ...ingredients.map(i => i.category)
    ])).filter(Boolean).sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));

    const catOptions = availableCategories.map(cat => `
      <option value="${cat}" ${cat === initialCategory ? 'selected' : ''}>🌾 ${cat}</option>
    `).join('');

    row.innerHTML = `
      <td>
        <select class="form-control row-ing-cat" style="width: 100%;">
          <option value="">Todas as Categorias</option>
          ${catOptions}
        </select>
      </td>
      <td>
        <select class="form-control row-ing-select" required style="width: 100%;">
          <option value="">Selecione um insumo...</option>
        </select>
      </td>
      <td>
        <input type="number" class="form-control row-ing-qty" step="any" min="0" value="${item.quantity !== undefined ? item.quantity : 100}" required placeholder="Ex: 100.011" style="width: 100%;">
      </td>
      <td>
        <select class="form-control row-ing-unit" required style="width: 100%;">
          <option value="g" ${item.unit === 'g' ? 'selected' : ''}>g (gramas)</option>
          <option value="kg" ${item.unit === 'kg' ? 'selected' : ''}>kg (quilos)</option>
          <option value="ml" ${item.unit === 'ml' ? 'selected' : ''}>ml (mililitros)</option>
          <option value="l" ${item.unit === 'l' ? 'selected' : ''}>l (litros)</option>
          <option value="un" ${item.unit === 'un' ? 'selected' : ''}>un (unidades)</option>
        </select>
      </td>
      <td style="text-align: center;">
        <button type="button" class="btn btn-sm btn-danger-outline btn-remove-row" title="Remover este item">&times;</button>
      </td>
    `;

    const catSelect = row.querySelector('.row-ing-cat');
    const ingSelect = row.querySelector('.row-ing-select');
    const unitSelect = row.querySelector('.row-ing-unit');

    // Função que popula o dropdown de insumos conforme a categoria selecionada
    function updateIngredientOptions(selectedCat, preserveIngId = null) {
      const filteredIngs = selectedCat
        ? ingredients.filter(i => i.category === selectedCat)
        : ingredients;

      if (filteredIngs.length === 0) {
        ingSelect.innerHTML = '<option value="">Nenhum insumo nesta categoria</option>';
        return;
      }

      ingSelect.innerHTML = '<option value="">Selecione um insumo...</option>' +
        filteredIngs.map(ing => `
          <option value="${ing.id}" ${ing.id === preserveIngId ? 'selected' : ''}>
            ${ing.name} (${ing.packageQty} ${ing.packageUnit} - ${GastronomyCalc.formatCurrency(ing.packagePrice)})
          </option>
        `).join('');
    }

    // Inicializa lista de insumos com o filtro atual
    updateIngredientOptions(initialCategory, item.ingredientId);

    // Quando o usuário muda a Categoria, atualiza os insumos disponíveis
    catSelect.addEventListener('change', () => {
      const chosenCat = catSelect.value;
      updateIngredientOptions(chosenCat);
    });

    // Quando o usuário escolhe o insumo, se estava em "Todas", auto-seleciona a categoria e sugere a unidade
    ingSelect.addEventListener('change', () => {
      const chosenId = ingSelect.value;
      const ing = ingredients.find(i => i.id === chosenId);
      if (ing) {
        if (!catSelect.value && ing.category) {
          catSelect.value = ing.category;
          updateIngredientOptions(ing.category, ing.id);
        }

        // Sugere unidade padrão
        if (ing.packageUnit === 'kg' || ing.packageUnit === 'g') {
          unitSelect.value = 'g';
        } else if (ing.packageUnit === 'l' || ing.packageUnit === 'ml') {
          unitSelect.value = 'ml';
        } else if (ing.packageUnit === 'un') {
          unitSelect.value = 'un';
        }
      }
    });

    row.querySelector('.btn-remove-row').addEventListener('click', () => row.remove());
    tbody.appendChild(row);
  }

  document.getElementById('btnAddRecipeItemRow')?.addEventListener('click', () => addRecipeItemRow());

  function openRecipeModal(recipeId = null) {
    const form = document.getElementById('formRecipe');
    const title = document.getElementById('modalRecipeTitle');
    const tbody = document.getElementById('recipeItemsTbody');
    tbody.innerHTML = '';
    form.reset();

    const settings = window.db.getSettings();

    if (recipeId) {
      const rec = window.db.getRecipes().find(r => r.id === recipeId);
      if (rec) {
        title.textContent = 'Editar Ficha Técnica';
        document.getElementById('recId').value = rec.id;
        document.getElementById('recName').value = rec.name;
        document.getElementById('recCategory').value = rec.category;
        document.getElementById('recYieldUnits').value = rec.yieldUnits || 1;
        document.getElementById('recYieldUnitName').value = rec.yieldUnitName || '';
        document.getElementById('recPrepTime').value = rec.prepTimeMinutes || 45;
        document.getElementById('recOperationalPercent').value = rec.operationalPercent ?? settings.defaultOperationalRate;
        document.getElementById('recHourlyRate').value = rec.hourlyRate ?? settings.defaultHourlyRate;
        document.getElementById('recPackagingCost').value = rec.packagingCost || 0;
        document.getElementById('recLossPercent').value = rec.technicalLossPercent || 2;
        document.getElementById('recInstructions').value = rec.instructions || '';

        (rec.items || []).forEach(item => addRecipeItemRow(item));
      }
    } else {
      title.textContent = 'Nova Ficha Técnica de Receita';
      document.getElementById('recId').value = '';
      document.getElementById('recOperationalPercent').value = settings.defaultOperationalRate;
      document.getElementById('recHourlyRate').value = settings.defaultHourlyRate;
      document.getElementById('recYieldUnits').value = '1';
      document.getElementById('recPrepTime').value = '45';
      document.getElementById('recLossPercent').value = '2';

      // Adiciona 2 linhas vazias iniciais para facilitar
      addRecipeItemRow();
      addRecipeItemRow();
    }

    openModal('modalRecipe');
  }

  document.getElementById('formRecipe')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('recId').value;

    // Coleta itens da tabela dinâmica
    const rows = document.querySelectorAll('#recipeItemsTbody tr');
    const items = [];
    rows.forEach(r => {
      const ingredientId = r.querySelector('.row-ing-select').value;
      const quantity = parseFloat(r.querySelector('.row-ing-qty').value) || 0;
      const unit = r.querySelector('.row-ing-unit').value;
      if (ingredientId && quantity > 0) {
        items.push({ ingredientId, quantity, unit });
      }
    });

    if (items.length === 0) {
      alert('Adicione pelo menos um insumo válido com quantidade maior que zero à receita!');
      return;
    }

    const recipeData = {
      name: document.getElementById('recName').value.trim(),
      category: document.getElementById('recCategory').value.trim(),
      yieldUnits: parseFloat(document.getElementById('recYieldUnits').value) || 1,
      yieldUnitName: document.getElementById('recYieldUnitName').value.trim(),
      prepTimeMinutes: parseFloat(document.getElementById('recPrepTime').value) || 0,
      operationalPercent: parseFloat(document.getElementById('recOperationalPercent').value) || 0,
      hourlyRate: parseFloat(document.getElementById('recHourlyRate').value) || 0,
      packagingCost: parseFloat(document.getElementById('recPackagingCost').value) || 0,
      technicalLossPercent: parseFloat(document.getElementById('recLossPercent').value) || 0,
      instructions: document.getElementById('recInstructions').value.trim(),
      items
    };

    if (id) {
      window.db.updateRecipe(id, recipeData);
      showToast('Ficha técnica atualizada com sucesso!');
    } else {
      window.db.addRecipe(recipeData);
      showToast('Ficha técnica cadastrada com sucesso!');
    }

    closeModal('modalRecipe');
    renderRecipes();
    renderProductsGrid();
    renderDashboard();
    initPricingCalculator();
    populateRecipeCategories(window.db.getRecipes());
  });

  // Impressão da Ficha Técnica
  function printRecipeTechnicalSheet(recipeId) {
    const rec = window.db.getRecipes().find(r => r.id === recipeId);
    if (!rec) return;

    const ingredients = window.db.getIngredients();
    const calc = GastronomyCalc.calcRecipeCost(rec, ingredients);
    const settings = window.db.getSettings();

    const printArea = document.getElementById('printArea');
    printArea.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.5; color: #000;">
        <div style="border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <img src="assets/logo.jpg" alt="Bella Cozinha" style="width: 52px; height: 52px; border-radius: 8px; object-fit: cover; object-position: center 30%; border: 1px solid #ccc;">
            <div>
              <h1 style="margin: 0; font-size: 24px;">${settings.businessName || 'Bella Cozinha'}</h1>
              <p style="margin: 4px 0 0; color: #555;">Geleias Artesanais e Antepastos | Ficha Técnica Operacional</p>
            </div>
          </div>
          <div style="text-align: right; font-size: 13px;">
            Emitido em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}<br>
            Responsável: ${settings.chefName}
          </div>
        </div>

        <h2 style="font-size: 20px; margin-bottom: 6px;">Receita: ${rec.name}</h2>
        <div style="margin-bottom: 20px; font-size: 14px;">
          <strong>Categoria:</strong> ${rec.category} | 
          <strong>Rendimento:</strong> ${rec.yieldUnits} ${rec.yieldUnitName || 'unidades'} | 
          <strong>Tempo de Preparo:</strong> ${rec.prepTimeMinutes} min
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;" border="1" cellpadding="8">
          <thead>
            <tr style="background-color: #eee;">
              <th style="text-align: left;">Insumo / Matéria-Prima</th>
              <th style="text-align: right;">Quantidade Utilizada</th>
              <th style="text-align: right;">Custo Base</th>
              <th style="text-align: right;">Custo no Prato</th>
            </tr>
          </thead>
          <tbody>
            ${calc.calculatedItems.map(it => `
              <tr>
                <td>${it.name}</td>
                <td style="text-align: right;">${it.quantity} ${it.unit}</td>
                <td style="text-align: right;">${GastronomyCalc.formatCurrency(it.baseUnitCost)}/${GastronomyCalc.getBaseUnit(it.unit)}</td>
                <td style="text-align: right;"><strong>${GastronomyCalc.formatCurrency(it.cost)}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="display: flex; justify-content: flex-end; margin-bottom: 24px;">
          <div style="width: 320px; border: 1px solid #999; padding: 12px; background: #fafafa; font-size: 13px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>CMV Insumos:</span>
              <strong>${GastronomyCalc.formatCurrency(calc.rawMaterialCost)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>Custos Indiretos (Gás/Energia):</span>
              <span>${GastronomyCalc.formatCurrency(calc.operationalCost)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>Mão de Obra (${rec.prepTimeMinutes} min):</span>
              <span>${GastronomyCalc.formatCurrency(calc.laborCost)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span>Embalagem & Perdas:</span>
              <span>${GastronomyCalc.formatCurrency(calc.packagingCost + calc.technicalLossCost)}</span>
            </div>
            <div style="border-top: 2px solid #000; padding-top: 6px; display: flex; justify-content: space-between; font-size: 15px;">
              <span>CUSTO UNITÁRIO / PORÇÃO:</span>
              <strong>${GastronomyCalc.formatCurrency(calc.costPerUnit)}</strong>
            </div>
          </div>
        </div>

        ${rec.instructions ? `
          <div style="border: 1px solid #ccc; padding: 14px; border-radius: 4px;">
            <h3 style="margin-top: 0; font-size: 15px;">Modo de Preparo Técnico:</h3>
            <p style="white-space: pre-line; margin: 0; font-size: 13px;">${rec.instructions}</p>
          </div>
        ` : ''}
      </div>
    `;

    window.print();
  }

  // =========================================================================
  // =========================================================================
  // 4. MÓDULO DE PRECIFICAÇÃO INTELIGENTE & MARKUP POR FICHA TÉCNICA
  // =========================================================================
  function initPricingCalculator(selectedRecipeId = null) {
    const recipes = window.db.getRecipes();
    const ingredients = window.db.getIngredients();
    const select = document.getElementById('pricingSelectRecipe');
    const settings = window.db.getSettings();

    if (!select) return;

    // Popula o select tradicional de fichas
    select.innerHTML = recipes.map(r => `<option value="${r.id}">${r.name} (${r.category})</option>`).join('');

    if (recipes.length === 0) {
      select.innerHTML = '<option value="">Nenhuma ficha técnica cadastrada</option>';
      const grid = document.getElementById('pricingRecipesCardsList');
      if (grid) {
        grid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 24px; color: var(--text-dim);">
            Nenhuma ficha técnica cadastrada ainda. Crie fichas na aba "Fichas Técnicas" para precificar.
          </div>
        `;
      }
      return;
    }

    // Determina qual receita deve ser selecionada inicialmente
    let activeId = selectedRecipeId;
    if (!activeId || !recipes.some(r => r.id === activeId)) {
      activeId = select.value || recipes[0].id;
    }
    select.value = activeId;

    // Renderiza a lista de cards de fichas técnicas disponíveis
    renderPricingRecipesList(activeId);
    const recipesGrid = document.getElementById('pricingRecipesCardsList');
    if (recipesGrid) recipesGrid.scrollTop = 0;

    // Carrega as configurações salvas da receita ativa
    loadRecipePricingConfig(activeId);

    // Evento de troca de receita no select
    select.onchange = () => {
      const chosenId = select.value;
      loadRecipePricingConfig(chosenId);
    };

    // Filtro de busca na lista superior de fichas
    const searchInput = document.getElementById('inputSearchPricingRecipes');
    if (searchInput) {
      searchInput.oninput = () => {
        renderPricingRecipesList(select.value);
      };
    }

    // Toggle entre Margem Alvo e Markup
    const methodRadios = document.querySelectorAll('input[name="pricingMethod"]');
    methodRadios.forEach(r => {
      r.onchange = () => {
        const isMargin = r.value === 'margin';
        document.getElementById('methodMarginContainer').style.display = isMargin ? 'block' : 'none';
        document.getElementById('methodMarkupContainer').style.display = isMargin ? 'none' : 'block';
        runPricingRecalculation();
        saveCurrentRecipePricingConfig(false); // Salva silenciosamente a alteração
      };
    });

    // Inputs que disparam recálculo em tempo real e auto-persistem a última alteração
    [
      'pricingUnitCost', 'pricingPackagingCost', 'pricingTargetMargin',
      'pricingMarkupMultiplier', 'pricingTaxRate', 'pricingCardFeeRate',
      'pricingChannelFeeRate', 'pricingCustomSalePrice'
    ].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.oninput = () => {
          runPricingRecalculation();
          saveCurrentRecipePricingConfig(false); // Auto-assume a última alteração feita!
        };
      }
    });

    // Botão de salvar explicitamente a precificação e atualizar no catálogo
    const btnSave = document.getElementById('btnApplyPricingToProduct');
    if (btnSave) {
      btnSave.onclick = () => saveCurrentRecipePricingConfig(true);
    }

    // Botão de restaurar padrões globais para a receita ativa
    const btnReset = document.getElementById('btnResetPricingToDefaults');
    if (btnReset) {
      btnReset.onclick = () => resetPricingToGlobalDefaults();
    }
  }

  // Renderiza a lista de cards clicáveis de todas as Fichas Técnicas na tela de Precificação
  function renderPricingRecipesList(activeRecipeId = null) {
    const grid = document.getElementById('pricingRecipesCardsList');
    if (!grid) return;

    const recipes = window.db.getRecipes();
    const ingredients = window.db.getIngredients();
    const products = window.db.getProducts();
    const settings = window.db.getSettings();
    const searchVal = document.getElementById('inputSearchPricingRecipes')?.value.toLowerCase().trim() || '';

    const filtered = recipes.filter(r => 
      r.name.toLowerCase().includes(searchVal) || (r.category || '').toLowerCase().includes(searchVal)
    );

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 20px; color: var(--text-dim); font-size: 0.86rem;">
          Nenhuma ficha técnica encontrada para a busca "${searchVal}".
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(rec => {
      const isSelected = rec.id === activeRecipeId;
      const calc = GastronomyCalc.calcRecipeCost(rec, ingredients);
      const unitCost = calc.costPerUnit;

      // Obtém a precificação assumida da receita ou produto vinculado
      const pConfig = rec.pricingConfig;
      const linkedProd = products.find(p => p.recipeId === rec.id);

      let salePriceDisplay = 'R$ 0,00';
      let marginDisplay = '0,0%';
      let isConfigured = false;

      if (pConfig && (pConfig.customSalePrice || pConfig.suggestedPrice)) {
        salePriceDisplay = GastronomyCalc.formatCurrency(pConfig.customSalePrice || pConfig.suggestedPrice);
        marginDisplay = GastronomyCalc.formatPercent(pConfig.netMarginPercent || pConfig.targetMargin || 35);
        isConfigured = true;
      } else if (linkedProd && linkedProd.salePrice) {
        salePriceDisplay = GastronomyCalc.formatCurrency(linkedProd.salePrice);
        marginDisplay = GastronomyCalc.formatPercent(linkedProd.targetMargin || 35);
        isConfigured = true;
      } else {
        // Cálculo preliminar com padrões
        const prelim = GastronomyCalc.calculatePricing({
          unitCost,
          additionalPackaging: 1.00,
          method: 'margin',
          targetMargin: settings.defaultTargetMargin,
          markupMultiplier: 2.5,
          taxRate: settings.defaultTaxRate,
          cardFeeRate: settings.defaultCardFeeRate,
          channelFeeRate: 0,
          customSalePrice: 0
        });
        salePriceDisplay = GastronomyCalc.formatCurrency(prelim.suggestedPrice);
        marginDisplay = GastronomyCalc.formatPercent(prelim.netMarginPercent);
      }

      return `
        <div class="pricing-recipe-card ${isSelected ? 'active' : ''}" data-recipe-id="${rec.id}">
          <div class="pricing-recipe-card-header">
            <div>
              <div class="pricing-recipe-card-title">${rec.name}</div>
              <span class="badge badge-category" style="margin-top: 4px; font-size: 0.68rem;">📜 ${rec.category}</span>
            </div>
            ${isConfigured ? '<span class="badge badge-success" style="font-size: 0.68rem;">✓ Precificado</span>' : '<span class="badge badge-warning" style="font-size: 0.68rem;">⚠️ Sugerido</span>'}
          </div>

          <div class="pricing-recipe-card-body">
            <div>
              <span class="pricing-recipe-stat-label">Custo Ficha</span>
              <span class="pricing-recipe-stat-val">${GastronomyCalc.formatCurrency(unitCost)}</span>
            </div>
            <div>
              <span class="pricing-recipe-stat-label">Preço Venda</span>
              <span class="pricing-recipe-stat-val gold">${salePriceDisplay}</span>
            </div>
            <div>
              <span class="pricing-recipe-stat-label">Margem Real</span>
              <span class="pricing-recipe-stat-val emerald">${marginDisplay}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Evento de clique nos cards para carregar a ficha
    grid.querySelectorAll('.pricing-recipe-card').forEach(card => {
      card.onclick = () => {
        const recId = card.getAttribute('data-recipe-id');
        const select = document.getElementById('pricingSelectRecipe');
        if (select) select.value = recId;
        loadRecipePricingConfig(recId);
      };
    });
  }

  // Carrega as configurações de precificação específicas da receita ("assumindo a última alteração feita")
  function loadRecipePricingConfig(recipeId) {
    const recipes = window.db.getRecipes();
    const ingredients = window.db.getIngredients();
    const products = window.db.getProducts();
    const settings = window.db.getSettings();

    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    // Atualiza badge de título da ficha ativa
    const badge = document.getElementById('pricingActiveRecipeBadge');
    if (badge) badge.textContent = `${recipe.name} (${recipe.category})`;

    // Atualiza custo unitário calculado da ficha técnica
    const calc = GastronomyCalc.calcRecipeCost(recipe, ingredients);
    const unitCostEl = document.getElementById('pricingUnitCost');
    if (unitCostEl) unitCostEl.value = calc.costPerUnit.toFixed(2);

    // Carrega a última alteração salva (Ordem: 1. pricingConfig da receita -> 2. produto vinculado -> 3. padrões gerais)
    const pConfig = recipe.pricingConfig;
    const linkedProd = products.find(p => p.recipeId === recipe.id);

    let packagingCost = 1.00;
    let method = 'margin';
    let targetMargin = settings.defaultTargetMargin || 35.0;
    let markupMultiplier = 2.5;
    let taxRate = settings.defaultTaxRate || 4.5;
    let cardFeeRate = settings.defaultCardFeeRate || 3.2;
    let channelFeeRate = 0.0;
    let customSalePrice = '';

    if (pConfig) {
      // Assume a última alteração salva nesta ficha técnica!
      if (pConfig.packagingCost !== undefined) packagingCost = pConfig.packagingCost;
      if (pConfig.method) method = pConfig.method;
      if (pConfig.targetMargin !== undefined) targetMargin = pConfig.targetMargin;
      if (pConfig.markupMultiplier !== undefined) markupMultiplier = pConfig.markupMultiplier;
      if (pConfig.taxRate !== undefined) taxRate = pConfig.taxRate;
      if (pConfig.cardFeeRate !== undefined) cardFeeRate = pConfig.cardFeeRate;
      if (pConfig.channelFeeRate !== undefined) channelFeeRate = pConfig.channelFeeRate;
      if (pConfig.customSalePrice) customSalePrice = pConfig.customSalePrice;
    } else if (linkedProd) {
      // Assume a configuração registrada no catálogo de produtos
      if (linkedProd.additionalPackaging !== undefined) packagingCost = linkedProd.additionalPackaging;
      if (linkedProd.pricingMethod) method = linkedProd.pricingMethod;
      if (linkedProd.targetMargin !== undefined) targetMargin = linkedProd.targetMargin;
      if (linkedProd.markupMultiplier !== undefined) markupMultiplier = linkedProd.markupMultiplier;
      if (linkedProd.taxRate !== undefined) taxRate = linkedProd.taxRate;
      if (linkedProd.cardFeeRate !== undefined) cardFeeRate = linkedProd.cardFeeRate;
      if (linkedProd.channelFeeRate !== undefined) channelFeeRate = linkedProd.channelFeeRate;
      if (linkedProd.salePrice) customSalePrice = linkedProd.salePrice;
    }

    // Aplica nos campos do formulário
    document.getElementById('pricingPackagingCost').value = parseFloat(packagingCost).toFixed(2);
    document.getElementById('pricingTargetMargin').value = parseFloat(targetMargin).toFixed(1);
    document.getElementById('pricingMarkupMultiplier').value = parseFloat(markupMultiplier).toFixed(1);
    document.getElementById('pricingTaxRate').value = parseFloat(taxRate).toFixed(1);
    document.getElementById('pricingCardFeeRate').value = parseFloat(cardFeeRate).toFixed(1);
    document.getElementById('pricingChannelFeeRate').value = parseFloat(channelFeeRate).toFixed(1);
    document.getElementById('pricingCustomSalePrice').value = customSalePrice ? parseFloat(customSalePrice).toFixed(2) : '';

    // Ajusta o método (Margem ou Markup)
    const radioMargin = document.querySelector('input[name="pricingMethod"][value="margin"]');
    const radioMarkup = document.querySelector('input[name="pricingMethod"][value="markup"]');
    if (method === 'markup') {
      if (radioMarkup) radioMarkup.checked = true;
      document.getElementById('methodMarginContainer').style.display = 'none';
      document.getElementById('methodMarkupContainer').style.display = 'block';
    } else {
      if (radioMargin) radioMargin.checked = true;
      document.getElementById('methodMarginContainer').style.display = 'block';
      document.getElementById('methodMarkupContainer').style.display = 'none';
    }

    // Atualiza seleção visual na lista de cards
    document.querySelectorAll('.pricing-recipe-card').forEach(c => {
      if (c.getAttribute('data-recipe-id') === recipe.id) {
        c.classList.add('active');
      } else {
        c.classList.remove('active');
      }
    });

    // Roda o cálculo completo
    runPricingRecalculation();
  }

  // Executa os cálculos e atualiza os resultados visuais na coluna da direita
  function runPricingRecalculation() {
    const unitCost = parseFloat(document.getElementById('pricingUnitCost').value) || 0;
    const additionalPackaging = parseFloat(document.getElementById('pricingPackagingCost').value) || 0;
    const method = document.querySelector('input[name="pricingMethod"]:checked')?.value || 'margin';
    const targetMargin = parseFloat(document.getElementById('pricingTargetMargin').value) || 0;
    const markupMultiplier = parseFloat(document.getElementById('pricingMarkupMultiplier').value) || 2.5;
    const taxRate = parseFloat(document.getElementById('pricingTaxRate').value) || 0;
    const cardFeeRate = parseFloat(document.getElementById('pricingCardFeeRate').value) || 0;
    const channelFeeRate = parseFloat(document.getElementById('pricingChannelFeeRate').value) || 0;
    const customSalePrice = parseFloat(document.getElementById('pricingCustomSalePrice').value) || 0;

    const result = GastronomyCalc.calculatePricing({
      unitCost,
      additionalPackaging,
      method,
      targetMargin,
      markupMultiplier,
      taxRate,
      cardFeeRate,
      channelFeeRate,
      customSalePrice
    });

    document.getElementById('resSuggestedPrice').textContent = GastronomyCalc.formatCurrency(result.suggestedPrice);
    document.getElementById('resActivePrice').textContent = GastronomyCalc.formatCurrency(result.activePrice);
    document.getElementById('resTotalUnitCost').textContent = GastronomyCalc.formatCurrency(result.totalUnitCost);
    document.getElementById('resTaxValue').textContent = GastronomyCalc.formatCurrency(result.taxesValue);
    document.getElementById('resCardFeeValue').textContent = GastronomyCalc.formatCurrency(result.cardFeeValue);
    document.getElementById('resChannelFeeValue').textContent = GastronomyCalc.formatCurrency(result.channelFeeValue);
    document.getElementById('resGrossProfit').textContent = GastronomyCalc.formatCurrency(result.grossProfit);
    document.getElementById('resNetProfit').textContent = GastronomyCalc.formatCurrency(result.netProfit);
    document.getElementById('resNetMarginPercent').textContent = GastronomyCalc.formatPercent(result.netMarginPercent);
    document.getElementById('resEffectiveMarkup').textContent = `${result.effectiveMarkup.toFixed(2)}x`;

    return result;
  }

  // Salva os parâmetros na receita e sincroniza o preço de venda no Catálogo
  function saveCurrentRecipePricingConfig(showToastNotification = true) {
    const recId = document.getElementById('pricingSelectRecipe')?.value;
    const recipe = window.db.getRecipes().find(r => r.id === recId);
    if (!recipe) return;

    const result = runPricingRecalculation();

    const pricingConfig = {
      packagingCost: parseFloat(document.getElementById('pricingPackagingCost').value) || 0,
      method: document.querySelector('input[name="pricingMethod"]:checked')?.value || 'margin',
      targetMargin: parseFloat(document.getElementById('pricingTargetMargin').value) || 0,
      markupMultiplier: parseFloat(document.getElementById('pricingMarkupMultiplier').value) || 2.5,
      taxRate: parseFloat(document.getElementById('pricingTaxRate').value) || 0,
      cardFeeRate: parseFloat(document.getElementById('pricingCardFeeRate').value) || 0,
      channelFeeRate: parseFloat(document.getElementById('pricingChannelFeeRate').value) || 0,
      customSalePrice: parseFloat(document.getElementById('pricingCustomSalePrice').value) || 0,
      suggestedPrice: result.suggestedPrice,
      activePrice: result.activePrice,
      netMarginPercent: result.netMarginPercent,
      updatedAt: new Date().toISOString()
    };

    // 1. Salva diretamente na ficha técnica (assumindo a última alteração feita)
    window.db.updateRecipe(recipe.id, { pricingConfig });

    // 2. Atualiza ou cria o produto vinculado no Catálogo de Vendas
    let product = window.db.getProducts().find(p => p.recipeId === recId);
    if (product) {
      window.db.updateProduct(product.id, {
        salePrice: result.activePrice,
        additionalPackaging: pricingConfig.packagingCost,
        targetMargin: pricingConfig.targetMargin,
        markupMultiplier: pricingConfig.markupMultiplier,
        taxRate: pricingConfig.taxRate,
        cardFeeRate: pricingConfig.cardFeeRate,
        channelFeeRate: pricingConfig.channelFeeRate,
        pricingMethod: pricingConfig.method
      });
    } else if (showToastNotification) {
      window.db.addProduct({
        name: recipe.name,
        category: recipe.category,
        recipeId: recId,
        portionCount: 1,
        additionalPackaging: pricingConfig.packagingCost,
        salePrice: result.activePrice,
        targetMargin: pricingConfig.targetMargin,
        markupMultiplier: pricingConfig.markupMultiplier,
        taxRate: pricingConfig.taxRate,
        cardFeeRate: pricingConfig.cardFeeRate,
        channelFeeRate: pricingConfig.channelFeeRate,
        pricingMethod: pricingConfig.method,
        status: 'active',
        description: `Produzido artesanalmente conforme ficha técnica ${recipe.name}.`,
        imageIcon: '🧁'
      });
    }

    // 3. Atualiza os dados exibidos nos cards superiores
    renderPricingRecipesList(recipe.id);
    renderProductsGrid();
    renderDashboard();

    if (showToastNotification) {
      showToast(`Precificação de "${recipe.name}" salva com sucesso! Preço Praticado: ${GastronomyCalc.formatCurrency(result.activePrice)}`);
    }
  }

  // Restaura os padrões globais do negócio na ficha selecionada
  function resetPricingToGlobalDefaults() {
    const settings = window.db.getSettings();
    document.getElementById('pricingPackagingCost').value = '1.00';
    document.getElementById('pricingTargetMargin').value = (settings.defaultTargetMargin || 35.0).toFixed(1);
    document.getElementById('pricingMarkupMultiplier').value = '2.5';
    document.getElementById('pricingTaxRate').value = (settings.defaultTaxRate || 4.5).toFixed(1);
    document.getElementById('pricingCardFeeRate').value = (settings.defaultCardFeeRate || 3.2).toFixed(1);
    document.getElementById('pricingChannelFeeRate').value = '0.0';
    document.getElementById('pricingCustomSalePrice').value = '';

    const radioMargin = document.querySelector('input[name="pricingMethod"][value="margin"]');
    if (radioMargin) radioMargin.checked = true;
    document.getElementById('methodMarginContainer').style.display = 'block';
    document.getElementById('methodMarkupContainer').style.display = 'none';

    saveCurrentRecipePricingConfig(false);
    showToast('Parâmetros de precificação restaurados para as taxas padrão do negócio!');
  }

  // =========================================================================
  // 5. MÓDULO DE CATÁLOGO DE PRODUTOS
  // =========================================================================
  function renderProductsGrid() {
    const products = window.db.getProducts();
    const recipes = window.db.getRecipes();
    const ingredients = window.db.getIngredients();
    const grid = document.getElementById('productsCatalogGrid');
    const searchVal = document.getElementById('inputSearchProducts')?.value.toLowerCase().trim() || '';
    const catVal = document.getElementById('selectFilterProductCategory')?.value || '';

    // Popula categorias de produtos
    populateProductCategories(products);

    const filtered = products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchVal) || (p.description || '').toLowerCase().includes(searchVal);
      const matchCat = catVal === '' || p.category === catVal;
      return matchSearch && matchCat;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="panel-card" style="grid-column: 1 / -1; text-align: center; padding: 48px; color: var(--text-dim);">
          <div style="font-size: 2.5rem; margin-bottom: 8px;">🧁</div>
          <h3>Nenhum Produto no Catálogo</h3>
          <p style="margin-top: 6px;">Cadastre produtos comerciais para exibir no cardápio e realizar vendas rápidas.</p>
          <button class="btn btn-primary" style="margin-top: 16px;" onclick="document.getElementById('btnOpenNewProductModal').click()">+ Cadastrar Produto</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(prod => {
      const isCombo = prod.type === 'combo' || prod.isCombo;
      const unitCost = GastronomyCalc.calcProductCost(prod, products, recipes, ingredients);
      const grossProfit = prod.salePrice - unitCost;
      const marginPercent = prod.salePrice > 0 ? (grossProfit / prod.salePrice) * 100 : 0;

      // Se for combo, calcula valor avulso somado e economia do cliente
      let comboSummaryHtml = '';
      if (isCombo && Array.isArray(prod.comboItems) && prod.comboItems.length > 0) {
        const itemNames = prod.comboItems.map(ci => {
          const subP = products.find(p => p.id === ci.productId);
          return subP ? `<strong>${ci.quantity}x</strong> ${subP.name}` : `<strong>${ci.quantity}x</strong> Item`;
        });

        const totalSeparatePrice = prod.comboItems.reduce((acc, ci) => {
          const subP = products.find(p => p.id === ci.productId);
          return acc + ((subP ? subP.salePrice : 0) * (ci.quantity || 1));
        }, 0);

        const savings = totalSeparatePrice > prod.salePrice ? totalSeparatePrice - prod.salePrice : 0;
        const savingsPercent = totalSeparatePrice > 0 ? (savings / totalSeparatePrice) * 100 : 0;

        comboSummaryHtml = `
          <div class="combo-composition-summary">
            <div style="font-weight: 700; color: var(--accent-gold); margin-bottom: 3px; font-size: 0.76rem;">
              🍱 Itens Inclusos no Combo (${prod.comboItems.length}):
            </div>
            <div style="color: var(--text-muted); font-size: 0.78rem;">
              ${itemNames.join(' <span style="color: var(--accent-gold);">+</span> ')}
            </div>
            ${savings > 0 ? `
              <div style="margin-top: 4px; font-size: 0.73rem; color: var(--accent-emerald); font-weight: 600;">
                🏷️ Economia p/ cliente: ${GastronomyCalc.formatCurrency(savings)} (${savingsPercent.toFixed(0)}% OFF sobre avulso)
              </div>
            ` : ''}
          </div>
        `;
      }

      return `
        <div class="product-card ${isCombo ? 'product-card-combo' : ''}" id="prod-card-${prod.id}">
          <div class="product-card-top">
            <div class="product-icon">${prod.imageIcon || (isCombo ? '🎁' : '🍰')}</div>
            <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
              ${isCombo ? '<span class="badge badge-combo">🍱 COMBO</span>' : ''}
              <span class="badge badge-category">${prod.category}</span>
            </div>
          </div>

          <h4 class="product-card-title">${prod.name}</h4>
          <p class="product-card-desc">${prod.description || (isCombo ? 'Combo especial composto por múltiplos produtos.' : 'Produto artesanal de alta qualidade.')}</p>

          ${comboSummaryHtml}

          <div class="product-pricing-breakdown">
            <div class="pricing-metric">
              <span>Custo Total (CMV)</span>
              <strong>${GastronomyCalc.formatCurrency(unitCost)}</strong>
            </div>
            <div class="pricing-metric profit">
              <span>Margem Bruta</span>
              <strong>${GastronomyCalc.formatPercent(marginPercent)}</strong>
            </div>
          </div>

          <div class="product-card-footer">
            <div>
              <span style="font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase;">Preço do ${isCombo ? 'Combo' : 'Produto'}</span>
              <div class="product-final-price">${GastronomyCalc.formatCurrency(prod.salePrice)}</div>
            </div>
            <div style="display: flex; gap: 6px;">
              <button class="btn btn-sm btn-gold btn-sell-product" data-id="${prod.id}" title="Vender Agora">
                <span>⚡</span> Vender
              </button>
              <button class="btn btn-sm btn-secondary btn-edit-product" data-id="${prod.id}" title="Editar">✏️</button>
              <button class="btn btn-sm btn-danger-outline btn-delete-product" data-id="${prod.id}" title="Excluir">🗑️</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Eventos
    grid.querySelectorAll('.btn-sell-product').forEach(b => {
      b.addEventListener('click', () => {
        const prodId = b.getAttribute('data-id');
        openNewSaleModal(prodId);
      });
    });

    grid.querySelectorAll('.btn-edit-product').forEach(b => {
      b.addEventListener('click', () => openProductModal(b.getAttribute('data-id')));
    });

    grid.querySelectorAll('.btn-delete-product').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.getAttribute('data-id');
        if (confirm('Tem certeza que deseja remover este item do catálogo?')) {
          window.db.deleteProduct(id);
          showToast('Produto excluído do catálogo!', 'warning');
          renderProductsGrid();
          renderDashboard();
        }
      });
    });
  }

  function populateProductCategories(products) {
    const select = document.getElementById('selectFilterProductCategory');
    if (!select) return;
    const categories = Array.from(new Set(products.map(p => p.category)))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));

    select.innerHTML = '<option value="">Todas as Categorias</option>' +
      categories.map(c => `<option value="${c}" ${c === currentVal ? 'selected' : ''}>${c}</option>`).join('');
  }

  document.getElementById('inputSearchProducts')?.addEventListener('input', () => renderProductsGrid());
  document.getElementById('selectFilterProductCategory')?.addEventListener('change', () => renderProductsGrid());
  document.getElementById('btnOpenNewProductModal')?.addEventListener('click', () => openProductModal(null, 'single'));
  document.getElementById('btnOpenNewComboModal')?.addEventListener('click', () => openProductModal(null, 'combo'));

  // =========================================================================
  // GESTÃO DO MODAL DE PRODUTO & COMBO (MÚLTIPLOS PRODUTOS)
  // =========================================================================
  function setProductModalType(type) {
    const inputType = document.getElementById('prodType');
    const btnSingle = document.getElementById('btnTypeSingle');
    const btnCombo = document.getElementById('btnTypeCombo');
    const secSingle = document.getElementById('sectionSingleProductFields');
    const secCombo = document.getElementById('sectionComboFields');
    const selRecipe = document.getElementById('prodRecipeId');
    const lblPrice = document.getElementById('lblProdSalePrice');
    const lblPack = document.getElementById('lblProdPackaging');

    inputType.value = type;

    if (type === 'combo') {
      btnSingle?.classList.remove('active');
      btnCombo?.classList.add('active');
      secSingle.style.display = 'none';
      secCombo.style.display = 'block';
      selRecipe.required = false;

      if (lblPrice) lblPrice.textContent = 'Preço de Venda do Combo (R$) *';
      if (lblPack) lblPack.textContent = 'Embalagem / Sacola do Combo (R$)';
      updateComboMetrics();
    } else {
      btnSingle?.classList.add('active');
      btnCombo?.classList.remove('active');
      secSingle.style.display = 'block';
      secCombo.style.display = 'none';
      selRecipe.required = true;

      if (lblPrice) lblPrice.textContent = 'Preço de Venda (R$) *';
      if (lblPack) lblPack.textContent = 'Embalagem Individual (R$)';
      const savingsBadge = document.getElementById('comboSavingsBadge');
      if (savingsBadge) savingsBadge.style.display = 'none';
    }
  }

  function renderComboItemsTable() {
    const tbody = document.getElementById('comboItemsTbody');
    const countLabel = document.getElementById('comboItemCountLabel');
    const allProducts = window.db.getProducts();
    const recipes = window.db.getRecipes();
    const ingredients = window.db.getIngredients();

    if (!tbody) return;

    if (countLabel) {
      countLabel.textContent = `${state.tempComboItems.length} produto(s) no combo`;
    }

    if (state.tempComboItems.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 20px; color: var(--text-dim);">
            Nenhum produto adicionado ao combo ainda. Selecione acima para compor seu combo.
          </td>
        </tr>
      `;
      updateComboMetrics();
      return;
    }

    tbody.innerHTML = state.tempComboItems.map((ci, idx) => {
      const prod = allProducts.find(p => p.id === ci.productId);
      const prodName = prod ? prod.name : 'Produto';
      const prodSalePrice = prod ? prod.salePrice : 0;
      const prodCost = prod ? GastronomyCalc.calcProductCost(prod, allProducts, recipes, ingredients) : 0;
      const subtotalPrice = prodSalePrice * (ci.quantity || 1);

      return `
        <tr>
          <td><strong style="color: #fff;">${prodName}</strong></td>
          <td>
            <input type="number" class="form-control combo-qty-input" data-idx="${idx}" min="1" value="${ci.quantity || 1}" style="width: 70px; padding: 3px 6px;">
          </td>
          <td>${GastronomyCalc.formatCurrency(prodSalePrice)}</td>
          <td style="color: var(--accent-rose);">${GastronomyCalc.formatCurrency(prodCost)}</td>
          <td><strong style="color: var(--accent-gold); font-family: var(--font-mono);">${GastronomyCalc.formatCurrency(subtotalPrice)}</strong></td>
          <td style="text-align: right;">
            <button type="button" class="btn btn-sm btn-danger-outline combo-remove-item" data-idx="${idx}" title="Remover do Combo">&times;</button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.combo-qty-input').forEach(inp => {
      inp.addEventListener('change', () => {
        const idx = parseInt(inp.getAttribute('data-idx'));
        const val = parseInt(inp.value) || 1;
        state.tempComboItems[idx].quantity = Math.max(1, val);
        renderComboItemsTable();
      });
    });

    tbody.querySelectorAll('.combo-remove-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'));
        state.tempComboItems.splice(idx, 1);
        renderComboItemsTable();
      });
    });

    updateComboMetrics();
  }

  function updateComboMetrics() {
    const allProducts = window.db.getProducts();
    const recipes = window.db.getRecipes();
    const ingredients = window.db.getIngredients();

    let totalOriginalPrice = 0;
    let totalCost = 0;

    state.tempComboItems.forEach(ci => {
      const prod = allProducts.find(p => p.id === ci.productId);
      if (prod) {
        const qty = ci.quantity || 1;
        totalOriginalPrice += (prod.salePrice || 0) * qty;
        totalCost += GastronomyCalc.calcProductCost(prod, allProducts, recipes, ingredients) * qty;
      }
    });

    const packaging = parseFloat(document.getElementById('prodPackaging')?.value) || 0;
    const finalCostWithPackaging = totalCost + packaging;

    const elOrig = document.getElementById('comboTotalOriginalPrice');
    const elCost = document.getElementById('comboTotalCost');
    if (elOrig) elOrig.textContent = GastronomyCalc.formatCurrency(totalOriginalPrice);
    if (elCost) elCost.textContent = GastronomyCalc.formatCurrency(finalCostWithPackaging);

    // Atualiza feedback de economia no campo de preço
    const inputPrice = document.getElementById('prodSalePrice');
    const savingsBadge = document.getElementById('comboSavingsBadge');
    if (inputPrice && savingsBadge && document.getElementById('prodType')?.value === 'combo') {
      const currentComboPrice = parseFloat(inputPrice.value) || 0;
      if (currentComboPrice > 0 && totalOriginalPrice > currentComboPrice) {
        const diff = totalOriginalPrice - currentComboPrice;
        const pct = (diff / totalOriginalPrice) * 100;
        savingsBadge.textContent = `🎉 Desconto para o cliente: ${GastronomyCalc.formatCurrency(diff)} (${pct.toFixed(0)}% OFF sobre o valor avulso de ${GastronomyCalc.formatCurrency(totalOriginalPrice)})`;
        savingsBadge.style.display = 'block';
      } else {
        savingsBadge.style.display = 'none';
      }
    }
  }

  // Ouvintes de botões rápidos para precificação do combo
  document.getElementById('btnApplyComboOriginalPrice')?.addEventListener('click', () => {
    const allProducts = window.db.getProducts();
    const totalOriginalPrice = state.tempComboItems.reduce((acc, ci) => {
      const p = allProducts.find(pr => pr.id === ci.productId);
      return acc + ((p ? p.salePrice : 0) * (ci.quantity || 1));
    }, 0);
    const inputPrice = document.getElementById('prodSalePrice');
    if (inputPrice) {
      inputPrice.value = totalOriginalPrice.toFixed(2);
      updateComboMetrics();
    }
  });

  document.getElementById('btnApplyComboDiscount10')?.addEventListener('click', () => {
    const allProducts = window.db.getProducts();
    const totalOriginalPrice = state.tempComboItems.reduce((acc, ci) => {
      const p = allProducts.find(pr => pr.id === ci.productId);
      return acc + ((p ? p.salePrice : 0) * (ci.quantity || 1));
    }, 0);
    const inputPrice = document.getElementById('prodSalePrice');
    if (inputPrice) {
      inputPrice.value = (totalOriginalPrice * 0.9).toFixed(2);
      updateComboMetrics();
    }
  });

  document.getElementById('btnApplyComboDiscount15')?.addEventListener('click', () => {
    const allProducts = window.db.getProducts();
    const totalOriginalPrice = state.tempComboItems.reduce((acc, ci) => {
      const p = allProducts.find(pr => pr.id === ci.productId);
      return acc + ((p ? p.salePrice : 0) * (ci.quantity || 1));
    }, 0);
    const inputPrice = document.getElementById('prodSalePrice');
    if (inputPrice) {
      inputPrice.value = (totalOriginalPrice * 0.85).toFixed(2);
      updateComboMetrics();
    }
  });

  document.getElementById('btnTypeSingle')?.addEventListener('click', () => setProductModalType('single'));
  document.getElementById('btnTypeCombo')?.addEventListener('click', () => setProductModalType('combo'));
  document.getElementById('prodSalePrice')?.addEventListener('input', () => updateComboMetrics());
  document.getElementById('prodPackaging')?.addEventListener('input', () => updateComboMetrics());

  // Adicionar produto ao combo
  document.getElementById('btnAddProductToCombo')?.addEventListener('click', () => {
    const sel = document.getElementById('comboSelectProduct');
    const inpQty = document.getElementById('comboProductQty');
    const prodId = sel?.value;
    const qty = parseInt(inpQty?.value) || 1;

    if (!prodId) {
      alert('Selecione um produto comercial para adicionar ao combo!');
      return;
    }

    const existing = state.tempComboItems.find(ci => ci.productId === prodId);
    if (existing) {
      existing.quantity += qty;
    } else {
      state.tempComboItems.push({ productId: prodId, quantity: qty });
    }

    renderComboItemsTable();
    inpQty.value = 1;
  });

  // Modal Produto / Combo
  function openProductModal(productId = null, forceType = null) {
    const form = document.getElementById('formProduct');
    const title = document.getElementById('modalProductTitle');
    const selRecipe = document.getElementById('prodRecipeId');
    const selComboProd = document.getElementById('comboSelectProduct');
    const recipes = window.db.getRecipes();
    const allProducts = window.db.getProducts();

    form.reset();
    state.tempComboItems = [];

    // Preenche select de receitas
    selRecipe.innerHTML = recipes.map(r => `<option value="${r.id}">${r.name}</option>`).join('');

    // Preenche select de produtos componentes do combo (excluindo o combo em edição)
    const eligibleProducts = productId ? allProducts.filter(p => p.id !== productId) : allProducts;
    selComboProd.innerHTML = eligibleProducts.map(p => `
      <option value="${p.id}">${p.name} - ${GastronomyCalc.formatCurrency(p.salePrice)}</option>
    `).join('');

    if (productId) {
      const prod = allProducts.find(p => p.id === productId);
      if (prod) {
        const isCombo = prod.type === 'combo' || prod.isCombo;
        title.textContent = isCombo ? 'Editar Combo Promocional' : 'Editar Produto Comercial';
        document.getElementById('prodId').value = prod.id;
        document.getElementById('prodName').value = prod.name;
        document.getElementById('prodCategory').value = prod.category;
        document.getElementById('prodSalePrice').value = prod.salePrice;
        document.getElementById('prodPackaging').value = prod.additionalPackaging || 0;
        document.getElementById('prodIcon').value = prod.imageIcon || (isCombo ? '🎁' : '🧁');
        document.getElementById('prodDescription').value = prod.description || '';

        if (isCombo) {
          setProductModalType('combo');
          state.tempComboItems = (prod.comboItems || []).map(ci => ({ ...ci }));
          renderComboItemsTable();
        } else {
          setProductModalType('single');
          document.getElementById('prodRecipeId').value = prod.recipeId || (recipes[0]?.id || '');
          document.getElementById('prodPortionCount').value = prod.portionCount || 1;
        }
      }
    } else {
      document.getElementById('prodId').value = '';
      document.getElementById('prodPortionCount').value = '1';
      document.getElementById('prodPackaging').value = '0.80';

      if (forceType === 'combo') {
        title.textContent = 'Novo Combo / Kit Promocional';
        document.getElementById('prodName').value = '';
        document.getElementById('prodCategory').value = 'Combos & Kits';
        document.getElementById('prodIcon').value = '🎁';
        setProductModalType('combo');
        renderComboItemsTable();
      } else {
        title.textContent = 'Novo Produto Comercial';
        document.getElementById('prodIcon').value = '🧁';
        setProductModalType('single');
      }
    }

    openModal('modalProduct');
  }

  document.getElementById('formProduct')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('prodId').value;
    const type = document.getElementById('prodType').value;
    const isCombo = type === 'combo';

    if (isCombo && state.tempComboItems.length === 0) {
      alert('Adicione pelo menos 1 produto para compor o combo!');
      return;
    }

    const prodData = {
      type,
      isCombo,
      name: document.getElementById('prodName').value.trim(),
      category: document.getElementById('prodCategory').value.trim(),
      recipeId: isCombo ? '' : document.getElementById('prodRecipeId').value,
      portionCount: isCombo ? 0 : (parseFloat(document.getElementById('prodPortionCount').value) || 1),
      comboItems: isCombo ? state.tempComboItems.map(ci => ({ productId: ci.productId, quantity: ci.quantity })) : [],
      salePrice: parseFloat(document.getElementById('prodSalePrice').value) || 0,
      additionalPackaging: parseFloat(document.getElementById('prodPackaging').value) || 0,
      imageIcon: document.getElementById('prodIcon').value.trim() || (isCombo ? '🎁' : '🍰'),
      description: document.getElementById('prodDescription').value.trim(),
      status: 'active'
    };

    if (id) {
      window.db.updateProduct(id, prodData);
      showToast(isCombo ? 'Combo atualizado com sucesso!' : 'Produto atualizado com sucesso!');
    } else {
      window.db.addProduct(prodData);
      showToast(isCombo ? 'Combo cadastrado com sucesso no catálogo!' : 'Produto comercial cadastrado!');
    }

    closeModal('modalProduct');
    renderProductsGrid();
    renderDashboard();
  });


  // =========================================================================
  // 6. MÓDULO DE VENDAS & CONTROLE FINANCEIRO (PDV)
  // =========================================================================
  function renderSalesTable() {
    const sales = window.db.getSales();
    const tbody = document.getElementById('tbodySales');
    const searchVal = document.getElementById('inputSearchSales')?.value.toLowerCase().trim() || '';

    const filtered = sales.filter(s => {
      const matchSearch = (s.clientName || '').toLowerCase().includes(searchVal) ||
                          (s.paymentMethod || '').toLowerCase().includes(searchVal) ||
                          (s.id || '').toLowerCase().includes(searchVal);
      return matchSearch;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" style="text-align: center; padding: 40px; color: var(--text-dim);">
            Nenhuma venda registrada ainda. Clique em "Nova Venda (PDV)" para registrar.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(s => {
      const formattedDate = new Date(s.date).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit'
      });

      const itemsSummary = (s.items || []).map(it => `${it.quantity}x ${it.productName}`).join(', ');
      const discount = parseFloat(s.discountValue) || 0;

      return `
        <tr>
          <td>
            <strong style="color: #fff;">${formattedDate}</strong>
            <div style="font-size: 0.72rem; color: var(--text-dim);">${s.id}</div>
          </td>
          <td>${s.clientName || 'Cliente Balcão'}</td>
          <td style="max-width: 220px; font-size: 0.8rem; color: var(--text-muted);" title="${itemsSummary}">
            ${itemsSummary}
          </td>
          <td><span class="badge badge-category">${s.paymentMethod}</span></td>
          <td>
            <strong style="color: #fff; font-family: var(--font-mono);">${GastronomyCalc.formatCurrency(s.totalGross)}</strong>
            ${discount > 0 ? `
              <div>
                <span class="sale-discount-tag" title="Subtotal de produtos: ${GastronomyCalc.formatCurrency(s.subtotalGross || (s.totalGross + discount))}">
                  -${GastronomyCalc.formatCurrency(discount)} desc
                </span>
              </div>
            ` : ''}
          </td>
          <td><span style="color: var(--accent-rose); font-family: var(--font-mono);">${GastronomyCalc.formatCurrency(s.totalCost)}</span></td>
          <td style="font-size: 0.8rem; color: var(--text-dim);">${GastronomyCalc.formatCurrency((s.taxesValue || 0) + (s.cardFeeValue || 0))}</td>
          <td><strong style="color: var(--accent-emerald); font-family: var(--font-mono); font-size: 0.95rem;">${GastronomyCalc.formatCurrency(s.netProfit)}</strong></td>
          <td>
            <span class="badge badge-success">${GastronomyCalc.formatPercent(s.marginPercent)}</span>
          </td>
          <td style="text-align: right;">
            <button class="btn btn-sm btn-danger-outline btn-delete-sale" data-id="${s.id}" title="Excluir Venda">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.btn-delete-sale').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.getAttribute('data-id');
        if (confirm('Deseja excluir este registro de venda?')) {
          window.db.deleteSale(id);
          showToast('Venda excluída do histórico!', 'warning');
          renderSalesTable();
          renderDashboard();
        }
      });
    });
  }

  document.getElementById('inputSearchSales')?.addEventListener('input', () => renderSalesTable());
  document.getElementById('btnOpenNewSaleModal')?.addEventListener('click', () => openNewSaleModal());

  // Modal de Nova Venda (PDV)
  function openNewSaleModal(initialProductId = null) {
    const products = window.db.getProducts();
    const selectProd = document.getElementById('saleSelectProduct');
    const discountInput = document.getElementById('saleDiscountValue');
    state.tempSaleCart = [];

    if (discountInput) {
      discountInput.value = '0.00';
    }

    // Preenche select de produtos (incluindo combos com indicador)
    selectProd.innerHTML = products.map(p => {
      const isCombo = p.type === 'combo' || p.isCombo;
      const labelPrefix = isCombo ? '🍱 [Combo] ' : '';
      return `<option value="${p.id}">${labelPrefix}${p.name} - ${GastronomyCalc.formatCurrency(p.salePrice)}</option>`;
    }).join('');

    // Seta data atual no formato datetime-local
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('saleDate').value = now.toISOString().slice(0, 16);

    // Se veio de um clique "Vender Agora"
    if (initialProductId) {
      addCartItem(initialProductId, 1);
    } else if (products.length > 0) {
      addCartItem(products[0].id, 1);
    }

    renderSaleCart();
    openModal('modalSale');
  }

  function addCartItem(productId, quantity = 1) {
    const products = window.db.getProducts();
    const recipes = window.db.getRecipes();
    const ingredients = window.db.getIngredients();
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    // Calcula custo CMV real (inclusive para combos de múltiplos produtos)
    const unitCost = GastronomyCalc.calcProductCost(prod, products, recipes, ingredients);

    const existing = state.tempSaleCart.find(i => i.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      state.tempSaleCart.push({
        productId: prod.id,
        productName: prod.name,
        unitPrice: prod.salePrice,
        unitCost,
        quantity,
        isCombo: !!(prod.type === 'combo' || prod.isCombo)
      });
    }

    renderSaleCart();
  }

  function renderSaleCart() {
    const tbody = document.getElementById('saleItemsTbody');
    const paymentMethod = document.getElementById('salePaymentMethod')?.value || 'Pix';
    const settings = window.db.getSettings();

    const elSubtotal = document.getElementById('saleSummarySubtotal');
    const elGross = document.getElementById('saleSummaryGross');
    const elCost = document.getElementById('saleSummaryCost');
    const elFees = document.getElementById('saleSummaryFees');
    const elNet = document.getElementById('saleSummaryNet');
    const elDiscountBox = document.getElementById('saleDiscountSummaryBox');
    const elDiscountVal = document.getElementById('saleSummaryDiscount');
    const elDiscountFeedback = document.getElementById('saleDiscountFeedback');

    if (state.tempSaleCart.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 20px; color: var(--text-dim);">
            Carrinho vazio. Adicione produtos acima.
          </td>
        </tr>
      `;
      if (elSubtotal) elSubtotal.textContent = 'R$ 0,00';
      if (elGross) elGross.textContent = 'R$ 0,00';
      if (elCost) elCost.textContent = 'R$ 0,00';
      if (elFees) elFees.textContent = 'R$ 0,00';
      if (elNet) elNet.textContent = 'R$ 0,00';
      if (elDiscountBox) elDiscountBox.style.display = 'none';
      if (elDiscountFeedback) elDiscountFeedback.textContent = 'Nenhum desconto aplicado no pedido.';
      return;
    }

    let subtotalGross = 0;
    let totalCost = 0;

    tbody.innerHTML = state.tempSaleCart.map((it, idx) => {
      const subtotalPrice = it.unitPrice * it.quantity;
      const subtotalCost = it.unitCost * it.quantity;
      subtotalGross += subtotalPrice;
      totalCost += subtotalCost;

      return `
        <tr>
          <td>
            <strong style="color: #fff;">${it.productName}</strong>
            ${it.isCombo ? '<span class="badge badge-combo" style="margin-left: 6px; font-size: 0.65rem;">COMBO</span>' : ''}
          </td>
          <td>${GastronomyCalc.formatCurrency(it.unitPrice)}</td>
          <td>
            <input type="number" class="form-control cart-qty-input" data-idx="${idx}" min="1" value="${it.quantity}" style="width: 70px; padding: 4px 8px;">
          </td>
          <td><strong style="color: var(--accent-gold); font-family: var(--font-mono);">${GastronomyCalc.formatCurrency(subtotalPrice)}</strong></td>
          <td style="color: var(--accent-rose);">${GastronomyCalc.formatCurrency(subtotalCost)}</td>
          <td style="text-align: right;">
            <button type="button" class="btn btn-sm btn-danger-outline cart-remove-item" data-idx="${idx}">&times;</button>
          </td>
        </tr>
      `;
    }).join('');

    // Aplica o desconto informado pelo usuário
    const discountInput = document.getElementById('saleDiscountValue');
    const rawDiscount = parseFloat(discountInput?.value) || 0;
    const discountValue = Math.min(subtotalGross, Math.max(0, rawDiscount));
    const totalGross = Math.max(0, subtotalGross - discountValue);

    // Deduções de taxas conforme forma de pagamento sobre o valor final cobrado
    const taxPercent = settings.defaultTaxRate || 4.5;
    let cardFeePercent = 0;
    if (paymentMethod === 'Cartão de Crédito') cardFeePercent = 3.2;
    if (paymentMethod === 'Cartão de Débito') cardFeePercent = 1.9;

    const taxesValue = totalGross * (taxPercent / 100);
    const cardFeeValue = totalGross * (cardFeePercent / 100);
    const totalFees = taxesValue + cardFeeValue;
    const netProfit = totalGross - totalCost - totalFees;

    if (elSubtotal) elSubtotal.textContent = GastronomyCalc.formatCurrency(subtotalGross);
    if (elGross) elGross.textContent = GastronomyCalc.formatCurrency(totalGross);
    if (elCost) elCost.textContent = GastronomyCalc.formatCurrency(totalCost);
    if (elFees) elFees.textContent = GastronomyCalc.formatCurrency(totalFees);
    if (elNet) elNet.textContent = GastronomyCalc.formatCurrency(netProfit);

    // Feedback de desconto
    if (discountValue > 0) {
      if (elDiscountBox) elDiscountBox.style.display = 'block';
      if (elDiscountVal) elDiscountVal.textContent = `- ${GastronomyCalc.formatCurrency(discountValue)}`;
      if (elDiscountFeedback) {
        const pct = subtotalGross > 0 ? (discountValue / subtotalGross) * 100 : 0;
        elDiscountFeedback.innerHTML = `
          <span style="color: var(--accent-gold); font-weight: 600;">Desconto de ${GastronomyCalc.formatCurrency(discountValue)} (${pct.toFixed(1)}%)</span> concedido!
          <div style="font-size: 0.76rem; color: #fff;">Valor final a cobrar: <strong>${GastronomyCalc.formatCurrency(totalGross)}</strong></div>
        `;
      }
    } else {
      if (elDiscountBox) elDiscountBox.style.display = 'none';
      if (elDiscountFeedback) {
        elDiscountFeedback.textContent = 'Nenhum desconto aplicado no pedido.';
      }
    }

    tbody.querySelectorAll('.cart-qty-input').forEach(inp => {
      inp.addEventListener('change', () => {
        const idx = parseInt(inp.getAttribute('data-idx'));
        const val = parseInt(inp.value) || 1;
        state.tempSaleCart[idx].quantity = Math.max(1, val);
        renderSaleCart();
      });
    });

    tbody.querySelectorAll('.cart-remove-item').forEach(b => {
      b.addEventListener('click', () => {
        const idx = parseInt(b.getAttribute('data-idx'));
        state.tempSaleCart.splice(idx, 1);
        renderSaleCart();
      });
    });
  }

  document.getElementById('btnAddSaleItem')?.addEventListener('click', () => {
    const prodId = document.getElementById('saleSelectProduct').value;
    const qty = parseInt(document.getElementById('saleProductQty').value) || 1;
    if (prodId) addCartItem(prodId, qty);
  });

  document.getElementById('salePaymentMethod')?.addEventListener('change', () => renderSaleCart());
  document.getElementById('saleDiscountValue')?.addEventListener('input', () => renderSaleCart());
  document.getElementById('saleDiscountValue')?.addEventListener('change', () => renderSaleCart());

  document.getElementById('formSale')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (state.tempSaleCart.length === 0) {
      alert('Adicione pelo menos um produto ao pedido!');
      return;
    }

    const clientName = document.getElementById('saleClientName').value.trim() || 'Cliente Balcão';
    const paymentMethod = document.getElementById('salePaymentMethod').value;
    const saleDate = document.getElementById('saleDate').value || new Date().toISOString();
    const settings = window.db.getSettings();

    let subtotalGross = 0;
    let totalCost = 0;

    const saleItems = state.tempSaleCart.map(it => {
      const subPrice = it.unitPrice * it.quantity;
      const subCost = it.unitCost * it.quantity;
      subtotalGross += subPrice;
      totalCost += subCost;

      return {
        ...it,
        subtotalPrice: subPrice,
        subtotalCost: subCost
      };
    });

    // Desconto
    const rawDiscount = parseFloat(document.getElementById('saleDiscountValue')?.value) || 0;
    const discountValue = Math.min(subtotalGross, Math.max(0, rawDiscount));
    const totalGross = Math.max(0, subtotalGross - discountValue);

    const taxPercent = settings.defaultTaxRate || 4.5;
    let cardFeePercent = 0;
    if (paymentMethod === 'Cartão de Crédito') cardFeePercent = 3.2;
    if (paymentMethod === 'Cartão de Débito') cardFeePercent = 1.9;

    const taxesValue = totalGross * (taxPercent / 100);
    const cardFeeValue = totalGross * (cardFeePercent / 100);
    const netProfit = totalGross - totalCost - taxesValue - cardFeeValue;
    const marginPercent = totalGross > 0 ? (netProfit / totalGross) * 100 : 0;

    window.db.addSale({
      date: new Date(saleDate).toISOString(),
      clientName,
      paymentMethod,
      items: saleItems,
      subtotalGross,
      discountValue,
      totalGross,
      totalCost,
      taxesValue,
      cardFeeValue,
      netProfit,
      marginPercent
    });

    const discountMsg = discountValue > 0 ? ` (com desconto de ${GastronomyCalc.formatCurrency(discountValue)})` : '';
    showToast(`Venda registrada com sucesso${discountMsg}! Lucro gerado: ${GastronomyCalc.formatCurrency(netProfit)}!`);
    closeModal('modalSale');
    renderSalesTable();
    renderDashboard();
    renderIngredientsTable();
  });


  // =========================================================================
  // 7. MÓDULO DE CONFIGURAÇÕES & BACKUP
  // =========================================================================
  function applyGlobalSettingsUI() {
    const s = window.db.getSettings();
    const brandNameEl = document.getElementById('brandBusinessName');
    const brandSubEl = document.getElementById('brandChefOrSubtitle');

    if (brandNameEl) {
      brandNameEl.textContent = s.businessName || 'Bella Cozinha';
    }
    if (brandSubEl) {
      if (s.chefName) {
        brandSubEl.textContent = s.chefName.startsWith('Chef') ? s.chefName : `Chef ${s.chefName}`;
      } else {
        brandSubEl.textContent = 'Geleias & Antepastos';
      }
    }
    if (s.businessName) {
      document.title = `${s.businessName} | Fichas Técnicas, Precificação & Custos`;
    }
  }

  function loadSettingsForm() {
    const s = window.db.getSettings();
    document.getElementById('setBusinessName').value = s.businessName || 'Bella Cozinha';
    document.getElementById('setChefName').value = s.chefName || 'Chef Dani';
    document.getElementById('setDefaultHourlyRate').value = s.defaultHourlyRate ?? 22;
    document.getElementById('setDefaultOperationalRate').value = s.defaultOperationalRate ?? 10;
    document.getElementById('setDefaultTaxRate').value = s.defaultTaxRate ?? 4.5;
    document.getElementById('setDefaultCardFeeRate').value = s.defaultCardFeeRate ?? 3.2;
    document.getElementById('setDefaultTargetMargin').value = s.defaultTargetMargin ?? 35;
  }

  document.getElementById('formGlobalSettings')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const updated = {
      businessName: document.getElementById('setBusinessName').value.trim() || 'Bella Cozinha',
      chefName: document.getElementById('setChefName').value.trim() || 'Chef Dani',
      defaultHourlyRate: parseFloat(document.getElementById('setDefaultHourlyRate').value) || 22,
      defaultOperationalRate: parseFloat(document.getElementById('setDefaultOperationalRate').value) || 10,
      defaultTaxRate: parseFloat(document.getElementById('setDefaultTaxRate').value) || 4.5,
      defaultCardFeeRate: parseFloat(document.getElementById('setDefaultCardFeeRate').value) || 3.2,
      defaultTargetMargin: parseFloat(document.getElementById('setDefaultTargetMargin').value) || 35,
      currency: 'BRL'
    };

    window.db.saveSettings(updated);

    // 1. Aplica imediatamente a nova identidade do negócio na sidebar e no cabeçalho
    applyGlobalSettingsUI();

    // 2. Propaga os novos parâmetros de mão de obra e custos indiretos para as fichas técnicas
    const recipes = window.db.getRecipes();
    recipes.forEach(r => {
      r.hourlyRate = updated.defaultHourlyRate;
      r.operationalPercent = updated.defaultOperationalRate;
    });
    window.db.saveRecipes(recipes);

    // 3. Atualiza os campos do simulador de precificação com as novas taxas padrão
    const pricingTax = document.getElementById('pricingTaxRate');
    const pricingCard = document.getElementById('pricingCardFeeRate');
    const pricingMargin = document.getElementById('pricingTargetMargin');
    if (pricingTax) pricingTax.value = updated.defaultTaxRate;
    if (pricingCard) pricingCard.value = updated.defaultCardFeeRate;
    if (pricingMargin) pricingMargin.value = updated.defaultTargetMargin;

    // 4. Re-renderiza e atualiza todas as visões para assumir as novas informações
    renderRecipes();
    renderProductsGrid();
    renderDashboard();
    initPricingCalculator();

    showToast('Configurações salvas e aplicadas em todas as fichas técnicas, catálogo e precificações!');
  });

  // Exportar Backup JSON
  document.getElementById('btnExportJSON')?.addEventListener('click', () => {
    const jsonStr = window.db.exportAllDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_bella_cozinha_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup exportado com sucesso!');
  });

  // Importar Backup JSON
  document.getElementById('inputImportJSON')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const res = window.db.importAllDataJSON(event.target.result);
      if (res.success) {
        showToast('Dados restaurados com sucesso!');
        setTimeout(() => location.reload(), 1000);
      } else {
        alert('Erro ao importar arquivo JSON: ' + res.error);
      }
    };
    reader.readAsText(file);
  });

  // Resetar para dados de demonstração
  document.getElementById('btnResetDemoData')?.addEventListener('click', () => {
    if (confirm('Atenção: Isso irá restaurar todas as receitas, insumos e vendas para os dados de demonstração da Bella Cozinha. Deseja continuar?')) {
      window.db.resetToInitialDemoData();
      applyGlobalSettingsUI();
      showToast('Dados de demonstração restaurados com sucesso!');
      setTimeout(() => location.reload(), 800);
    }
  });

  document.getElementById('btnGoToIngredients')?.addEventListener('click', () => switchTab('categories'));

  // =========================================================================
  // 8. GERENCIAMENTO E SINCRONIZAÇÃO COM GOOGLE FIREBASE FIRESTORE
  // =========================================================================
  const cloudBadge = document.getElementById('cloudStatusBadge');
  const cloudText = document.getElementById('cloudStatusText');
  const fbConnectionBadge = document.getElementById('firebaseConnectionBadge');
  const fbStatusLabel = document.getElementById('firebaseStatusLabel');
  const fbStatusAlert = document.getElementById('firebaseStatusAlert');
  const fbStatusMsg = document.getElementById('firebaseStatusMessage');
  const fbLastSync = document.getElementById('firebaseLastSyncTime');
  const btnDisconnectFb = document.getElementById('btnDisconnectFirebase');

  function updateFirebaseUI(statusData) {
    const { status, message, lastSync } = statusData;

    // Atualiza classes do badge do Topbar
    if (cloudBadge) {
      cloudBadge.className = `cloud-status-badge status-${status}`;
      if (status === 'connected') {
        cloudText.textContent = 'Firebase Conectado';
      } else if (status === 'syncing') {
        cloudText.textContent = 'Sincronizando...';
      } else if (status === 'error') {
        cloudText.textContent = 'Erro Firebase';
      } else {
        cloudText.textContent = 'Conectar Firebase';
      }
    }

    // Atualiza badge do Painel Firebase
    if (fbConnectionBadge) {
      fbConnectionBadge.className = `firebase-status-badge status-${status}`;
      if (status === 'connected') {
        fbStatusLabel.textContent = 'Conectado';
      } else if (status === 'syncing') {
        fbStatusLabel.textContent = 'Sincronizando...';
      } else if (status === 'error') {
        fbStatusLabel.textContent = 'Erro de Conexão';
      } else {
        fbStatusLabel.textContent = 'Não Configurado';
      }
    }

    // Atualiza mensagem detalhada
    if (fbStatusAlert) {
      fbStatusAlert.style.display = 'block';
      fbStatusAlert.className = `firebase-status-alert status-${status}`;
      if (fbStatusMsg) fbStatusMsg.textContent = message || '';
      if (fbLastSync) {
        if (lastSync) {
          const dt = new Date(lastSync);
          fbLastSync.textContent = `Última sincronização na nuvem: ${dt.toLocaleDateString('pt-BR')} às ${dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
        } else {
          fbLastSync.textContent = 'Nenhuma sincronização realizada ainda.';
        }
      }
    }

    if (btnDisconnectFb) {
      btnDisconnectFb.style.display = (status === 'connected' || status === 'error') ? 'inline-flex' : 'none';
    }
  }

  function fillFirebaseFormInputs() {
    if (!window.FirebaseSyncService) return;
    const cfg = window.FirebaseSyncService.getConfig();
    if (cfg) {
      if (document.getElementById('fbApiKey')) document.getElementById('fbApiKey').value = cfg.apiKey || '';
      if (document.getElementById('fbProjectId')) document.getElementById('fbProjectId').value = cfg.projectId || '';
      if (document.getElementById('fbAuthDomain')) document.getElementById('fbAuthDomain').value = cfg.authDomain || '';
      if (document.getElementById('fbStorageBucket')) document.getElementById('fbStorageBucket').value = cfg.storageBucket || '';
      if (document.getElementById('fbAppId')) document.getElementById('fbAppId').value = cfg.appId || '';
      if (document.getElementById('fbMessagingSenderId')) document.getElementById('fbMessagingSenderId').value = cfg.messagingSenderId || '';
    }
  }

  // Registra listener de status
  if (window.FirebaseSyncService) {
    window.FirebaseSyncService.onStatusChange(updateFirebaseUI);
    fillFirebaseFormInputs();
  }

  // Clique no status do Topbar leva direto para as configurações do Firebase
  cloudBadge?.addEventListener('click', () => {
    switchTab('settings');
    const panel = document.querySelector('.firebase-panel');
    if (panel) {
      panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      panel.style.boxShadow = '0 0 25px rgba(245, 158, 11, 0.5)';
      setTimeout(() => {
        panel.style.boxShadow = '';
      }, 1500);
    }
  });

  // Alternar visualização dos campos individuais
  const btnToggleManual = document.getElementById('btnToggleManualFirebaseFields');
  const manualFields = document.getElementById('firebaseManualFields');
  btnToggleManual?.addEventListener('click', () => {
    if (!manualFields) return;
    const isHidden = manualFields.style.display === 'none' || !manualFields.style.display;
    manualFields.style.display = isHidden ? 'block' : 'none';
    btnToggleManual.textContent = isHidden ? 'Ocultar Campos Individuais' : 'Mostrar Campos Individuais';
  });

  // Aplicar Snippet rápido
  document.getElementById('btnApplySnippet')?.addEventListener('click', async () => {
    const raw = document.getElementById('firebaseQuickSnippet')?.value;
    if (!raw || !raw.trim()) {
      showToast('Por favor, cole o código ou JSON do Firebase Console no campo.');
      return;
    }

    const config = FirebaseSyncService.parseConfigInput(raw);
    if (!config || !config.apiKey || !config.projectId) {
      alert('Não foi possível identificar a apiKey ou projectId no texto colado. Verifique se copiou todo o bloco do firebaseConfig.');
      return;
    }

    fillFirebaseFormInputs();
    showToast('Conectando ao Firebase Firestore...');

    try {
      const res = await window.FirebaseSyncService.saveConfig(config);
      if (res.success) {
        showToast('🔥 Conectado ao Firebase Firestore com sucesso!');
        fillFirebaseFormInputs();
      } else {
        alert('Erro ao conectar ao Firebase: ' + (res.error || res.reason || 'Verifique as regras do Firestore ou o Project ID.'));
      }
    } catch (e) {
      alert('Falha na conexão: ' + e.message);
    }
  });

  // Salvar formulário manual
  document.getElementById('formFirebaseConfig')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const config = {
      apiKey: document.getElementById('fbApiKey').value.trim(),
      projectId: document.getElementById('fbProjectId').value.trim(),
      authDomain: document.getElementById('fbAuthDomain').value.trim(),
      storageBucket: document.getElementById('fbStorageBucket').value.trim(),
      appId: document.getElementById('fbAppId').value.trim(),
      messagingSenderId: document.getElementById('fbMessagingSenderId').value.trim()
    };

    if (!config.apiKey || !config.projectId) {
      alert('Os campos API Key e Project ID são obrigatórios.');
      return;
    }

    showToast('Salvando credenciais e testando conexão...');
    try {
      const res = await window.FirebaseSyncService.saveConfig(config);
      if (res.success) {
        showToast('🔥 Conectado ao Firebase Firestore com sucesso!');
      } else {
        alert('Erro ao conectar ao Firebase: ' + (res.error || 'Verifique as credenciais e as regras do Firestore.'));
      }
    } catch (err) {
      alert('Falha ao conectar: ' + err.message);
    }
  });

  // Sincronizar Tudo Local -> Nuvem (Criar / Atualizar Banco de Dados no Firebase)
  document.getElementById('btnSyncLocalToCloud')?.addEventListener('click', async () => {
    if (!window.FirebaseSyncService.isReady()) {
      const initRes = await window.FirebaseSyncService.init();
      if (!initRes.success) {
        alert('Por favor, configure e conecte suas credenciais do Firebase antes de sincronizar.');
        if (manualFields) manualFields.style.display = 'block';
        return;
      }
    }

    const btn = document.getElementById('btnSyncLocalToCloud');
    const origText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span>⏳</span> Enviando banco de dados para a nuvem...';

    try {
      const result = await window.FirebaseSyncService.syncLocalToCloud(window.db);
      showToast(`🔥 Banco de dados gerado no Firebase! (${result.counts.ingredients} insumos, ${result.counts.recipes} receitas, ${result.counts.products} produtos, ${result.counts.sales} vendas gravadas na nuvem!)`);
    } catch (err) {
      alert('Erro ao gravar dados no Firebase: ' + err.message + '\n\nDica: Certifique-se de que o Cloud Firestore está criado no console e com as regras configuradas para allow read, write: if true;');
    } finally {
      btn.disabled = false;
      btn.innerHTML = origText;
    }
  });

  // Baixar Dados da Nuvem -> Local
  document.getElementById('btnSyncCloudToLocal')?.addEventListener('click', async () => {
    if (!window.FirebaseSyncService.isReady()) {
      const initRes = await window.FirebaseSyncService.init();
      if (!initRes.success) {
        alert('Por favor, configure e conecte suas credenciais do Firebase antes de sincronizar.');
        return;
      }
    }

    if (!confirm('Deseja baixar os dados do Firebase Firestore para este dispositivo? As informações locais serão sincronizadas com o banco na nuvem.')) {
      return;
    }

    const btn = document.getElementById('btnSyncCloudToLocal');
    const origText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span>⏳</span> Baixando dados da nuvem...';

    try {
      const result = await window.FirebaseSyncService.syncCloudToLocal(window.db);
      showToast(`Dados baixados com sucesso do Firebase! (${result.counts.recipes} receitas, ${result.counts.ingredients} insumos atualizados)`);
      applyGlobalSettingsUI();
      renderDashboard();
      renderIngredientsTable();
      renderRecipes();
      renderProductsGrid();
      renderSalesTable();
      loadSettingsForm();
    } catch (err) {
      alert('Erro ao baixar dados do Firebase: ' + err.message);
    } finally {
      btn.disabled = false;
      btn.innerHTML = origText;
    }
  });

  // Desconectar Firebase
  document.getElementById('btnDisconnectFirebase')?.addEventListener('click', () => {
    if (confirm('Deseja realmente desconectar o Firebase? Seus dados salvos neste computador continuarão intactos.')) {
      window.FirebaseSyncService.disconnect();
      if (document.getElementById('fbApiKey')) document.getElementById('fbApiKey').value = '';
      if (document.getElementById('fbProjectId')) document.getElementById('fbProjectId').value = '';
      if (document.getElementById('fbAuthDomain')) document.getElementById('fbAuthDomain').value = '';
      if (document.getElementById('fbStorageBucket')) document.getElementById('fbStorageBucket').value = '';
      if (document.getElementById('fbAppId')) document.getElementById('fbAppId').value = '';
      if (document.getElementById('fbMessagingSenderId')) document.getElementById('fbMessagingSenderId').value = '';
      if (document.getElementById('firebaseQuickSnippet')) document.getElementById('firebaseQuickSnippet').value = '';
      showToast('Firebase desconectado deste aplicativo.');
    }
  });

  // =========================================================================
  // INICIALIZAÇÃO INICIAL
  // =========================================================================
  applyGlobalSettingsUI();
  switchTab('dashboard');
  if (window.FirebaseSyncService) {
    window.FirebaseSyncService.init();
  }
});
