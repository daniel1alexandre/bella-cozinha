/**
 * Bella Cozinha Pro - Serviço de Integração com Google Firebase (Cloud Firestore)
 * Permite sincronização em nuvem automática, salvamento em tempo real e backup remoto.
 */

const FIREBASE_CONFIG_KEY = 'bella_cozinha_firebase_config_v1';
const FIREBASE_LAST_SYNC_KEY = 'bella_cozinha_firebase_last_sync_v1';

class FirebaseSyncService {
  constructor() {
    this.app = null;
    this.firestore = null;
    this.isInitialized = false;
    this.status = 'not_configured'; // 'not_configured' | 'connected' | 'error' | 'syncing'
    this.statusMessage = 'Firebase não configurado';
    this.lastSync = localStorage.getItem(FIREBASE_LAST_SYNC_KEY) || null;
    this.listeners = [];
    this.unsubscribers = [];
  }

  /**
   * Registra callbacks para mudanças de status
   */
  onStatusChange(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
      // Notifica imediatamente o estado atual
      callback(this.getStatus());
    }
  }

  notifyStatus() {
    const statusData = this.getStatus();
    this.listeners.forEach(cb => {
      try {
        cb(statusData);
      } catch (e) {
        console.error('Erro ao notificar listener do Firebase:', e);
      }
    });
  }

  getStatus() {
    return {
      status: this.status,
      message: this.statusMessage,
      isInitialized: this.isInitialized,
      lastSync: this.lastSync
    };
  }

  /**
   * Recupera a configuração salva no navegador
   */
  getConfig() {
    try {
      const saved = localStorage.getItem(FIREBASE_CONFIG_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Salva a configuração e tenta conectar
   */
  async saveConfig(config) {
    if (!config || !config.apiKey || !config.projectId) {
      throw new Error('Configuração inválida. Os campos apiKey e projectId são obrigatórios.');
    }

    localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
    return await this.init();
  }

  /**
   * Remove a configuração do Firebase
   */
  disconnect() {
    this.unsubscribers.forEach(unsub => {
      try { unsub(); } catch (e) {}
    });
    this.unsubscribers = [];

    localStorage.removeItem(FIREBASE_CONFIG_KEY);
    this.app = null;
    this.firestore = null;
    this.isInitialized = false;
    this.status = 'not_configured';
    this.statusMessage = 'Desconectado do Firebase';
    this.notifyStatus();
    return true;
  }

  /**
   * Verifica se o Firestore está pronto para operações
   */
  isReady() {
    return this.isInitialized && this.firestore !== null;
  }

  /**
   * Inicializa o Firebase com as credenciais salvas
   */
  async init() {
    const config = this.getConfig();
    if (!config || !config.apiKey || !config.projectId) {
      this.status = 'not_configured';
      this.statusMessage = 'Firebase não configurado';
      this.notifyStatus();
      return { success: false, reason: 'missing_config' };
    }

    if (typeof firebase === 'undefined') {
      this.status = 'error';
      this.statusMessage = 'SDK do Firebase não foi carregado pelo navegador';
      this.notifyStatus();
      return { success: false, reason: 'sdk_not_loaded' };
    }

    try {
      this.status = 'syncing';
      this.statusMessage = 'Conectando ao Firebase Firestore...';
      this.notifyStatus();

      // Reutiliza app existente ou cria novo
      const appName = 'bellaCozinhaApp';
      let existingApp = null;
      try {
        existingApp = firebase.app(appName);
      } catch (e) {
        // App ainda não existe, ok
      }

      if (existingApp) {
        this.app = existingApp;
      } else {
        this.app = firebase.initializeApp(config, appName);
      }

      this.firestore = this.app.firestore();

      // Teste rápido de leitura/escrita no Firestore
      await this.firestore.collection('_healthcheck').doc('ping').set({
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        app: 'Bella Cozinha Pro',
        version: '1.0'
      }, { merge: true });

      this.isInitialized = true;
      this.status = 'connected';
      this.statusMessage = `Conectado ao projeto: ${config.projectId}`;
      this.notifyStatus();
      return { success: true };
    } catch (err) {
      console.error('Falha ao conectar ao Firebase:', err);
      this.isInitialized = false;
      this.status = 'error';
      this.statusMessage = `Erro de conexão: ${err.message || err}`;
      this.notifyStatus();
      return { success: false, error: err.message };
    }
  }

  /**
   * Salva ou atualiza um documento específico em uma coleção
   */
  async saveDoc(collectionName, docId, data) {
    if (!this.isReady()) return false;
    try {
      const cleanData = JSON.parse(JSON.stringify(data)); // remove undefined / funções
      cleanData._updatedAt = new Date().toISOString();
      await this.firestore.collection(collectionName).doc(String(docId)).set(cleanData, { merge: true });
      return true;
    } catch (err) {
      console.warn(`[Firebase] Erro ao salvar documento em ${collectionName}/${docId}:`, err);
      return false;
    }
  }

  /**
   * Remove um documento de uma coleção
   */
  async deleteDoc(collectionName, docId) {
    if (!this.isReady()) return false;
    try {
      await this.firestore.collection(collectionName).doc(String(docId)).delete();
      return true;
    } catch (err) {
      console.warn(`[Firebase] Erro ao deletar documento em ${collectionName}/${docId}:`, err);
      return false;
    }
  }

  /**
   * Sincroniza todos os dados locais para o Firestore (Gera / Atualiza o banco na nuvem)
   */
  async syncLocalToCloud(store) {
    if (!this.isReady()) {
      const initRes = await this.init();
      if (!initRes.success) {
        throw new Error(`Não foi possível conectar ao Firebase: ${this.statusMessage}`);
      }
    }

    this.status = 'syncing';
    this.statusMessage = 'Enviando todos os dados para o Firebase Firestore...';
    this.notifyStatus();

    try {
      const batchLimit = 400; // Limite seguro do Firestore é 500
      let currentBatch = this.firestore.batch();
      let opCount = 0;

      const commitBatchIfNeeded = async (force = false) => {
        if ((opCount >= batchLimit || force) && opCount > 0) {
          await currentBatch.commit();
          currentBatch = this.firestore.batch();
          opCount = 0;
        }
      };

      // 1. Configurações gerais
      const settings = store.getSettings();
      const settingsRef = this.firestore.collection('settings').doc('general');
      currentBatch.set(settingsRef, {
        ...JSON.parse(JSON.stringify(settings)),
        _syncedAt: new Date().toISOString()
      }, { merge: true });
      opCount++;

      // 2. Categorias
      const categories = store.getCategories();
      for (const cat of categories) {
        const ref = this.firestore.collection('categories').doc(String(cat.id));
        currentBatch.set(ref, {
          ...JSON.parse(JSON.stringify(cat)),
          _syncedAt: new Date().toISOString()
        }, { merge: true });
        opCount++;
        await commitBatchIfNeeded();
      }

      // 3. Insumos
      const ingredients = store.getIngredients();
      for (const ing of ingredients) {
        const ref = this.firestore.collection('ingredients').doc(String(ing.id));
        currentBatch.set(ref, {
          ...JSON.parse(JSON.stringify(ing)),
          _syncedAt: new Date().toISOString()
        }, { merge: true });
        opCount++;
        await commitBatchIfNeeded();
      }

      // 4. Receitas
      const recipes = store.getRecipes();
      for (const rec of recipes) {
        const ref = this.firestore.collection('recipes').doc(String(rec.id));
        currentBatch.set(ref, {
          ...JSON.parse(JSON.stringify(rec)),
          _syncedAt: new Date().toISOString()
        }, { merge: true });
        opCount++;
        await commitBatchIfNeeded();
      }

      // 5. Produtos
      const products = store.getProducts();
      for (const prod of products) {
        const ref = this.firestore.collection('products').doc(String(prod.id));
        currentBatch.set(ref, {
          ...JSON.parse(JSON.stringify(prod)),
          _syncedAt: new Date().toISOString()
        }, { merge: true });
        opCount++;
        await commitBatchIfNeeded();
      }

      // 6. Vendas
      const sales = store.getSales();
      for (const sale of sales) {
        const ref = this.firestore.collection('sales').doc(String(sale.id));
        currentBatch.set(ref, {
          ...JSON.parse(JSON.stringify(sale)),
          _syncedAt: new Date().toISOString()
        }, { merge: true });
        opCount++;
        await commitBatchIfNeeded();
      }

      // 7. Compras (Purchases)
      const purchases = typeof store.getPurchases === 'function' ? store.getPurchases() : [];
      for (const pur of purchases) {
        const ref = this.firestore.collection('purchases').doc(String(pur.id));
        currentBatch.set(ref, {
          ...JSON.parse(JSON.stringify(pur)),
          _syncedAt: new Date().toISOString()
        }, { merge: true });
        opCount++;
        await commitBatchIfNeeded();
      }

      // 8. Metadados do Sistema
      const metaRef = this.firestore.collection('meta').doc('sync');
      const nowIso = new Date().toISOString();
      currentBatch.set(metaRef, {
        appName: 'Bella Cozinha Pro',
        lastSync: nowIso,
        counts: {
          categories: categories.length,
          ingredients: ingredients.length,
          recipes: recipes.length,
          products: products.length,
          sales: sales.length,
          purchases: purchases.length
        }
      }, { merge: true });
      opCount++;

      // Finaliza o último lote
      await commitBatchIfNeeded(true);

      this.lastSync = nowIso;
      localStorage.setItem(FIREBASE_LAST_SYNC_KEY, this.lastSync);

      this.status = 'connected';
      this.statusMessage = 'Todos os dados foram gravados no Firebase com sucesso!';
      this.notifyStatus();

      return {
        success: true,
        counts: {
          categories: categories.length,
          ingredients: ingredients.length,
          recipes: recipes.length,
          products: products.length,
          sales: sales.length
        },
        syncedAt: nowIso
      };
    } catch (err) {
      console.error('Erro na sincronização completa para o Firebase:', err);
      this.status = 'error';
      this.statusMessage = `Erro ao enviar dados: ${err.message}`;
      this.notifyStatus();
      throw err;
    }
  }

  /**
   * Baixa todos os dados do Firebase Firestore para o armazenamento local
   */
  async syncCloudToLocal(store) {
    if (!this.isReady()) {
      const initRes = await this.init();
      if (!initRes.success) {
        throw new Error(`Não foi possível conectar ao Firebase: ${this.statusMessage}`);
      }
    }

    this.status = 'syncing';
    this.statusMessage = 'Baixando dados do Firebase Firestore...';
    this.notifyStatus();

    try {
      // 1. Settings
      const settingsDoc = await this.firestore.collection('settings').doc('general').get();
      if (settingsDoc.exists) {
        const data = settingsDoc.data();
        delete data._syncedAt;
        delete data._updatedAt;
        store.saveSettings(data);
      }

      // 2. Categories
      const categoriesSnap = await this.firestore.collection('categories').get();
      if (!categoriesSnap.empty) {
        const list = categoriesSnap.docs.map(doc => {
          const d = doc.data();
          delete d._syncedAt;
          delete d._updatedAt;
          return d;
        });
        store.saveCategories(list);
      }

      // 3. Ingredients
      const ingredientsSnap = await this.firestore.collection('ingredients').get();
      if (!ingredientsSnap.empty) {
        const list = ingredientsSnap.docs.map(doc => {
          const d = doc.data();
          delete d._syncedAt;
          delete d._updatedAt;
          return d;
        });
        store.saveIngredients(list);
      }

      // 4. Recipes
      const recipesSnap = await this.firestore.collection('recipes').get();
      if (!recipesSnap.empty) {
        const list = recipesSnap.docs.map(doc => {
          const d = doc.data();
          delete d._syncedAt;
          delete d._updatedAt;
          return d;
        });
        store.saveRecipes(list);
      }

      // 5. Products
      const productsSnap = await this.firestore.collection('products').get();
      if (!productsSnap.empty) {
        const list = productsSnap.docs.map(doc => {
          const d = doc.data();
          delete d._syncedAt;
          delete d._updatedAt;
          return d;
        });
        store.saveProducts(list);
      }

      // 6. Sales
      const salesSnap = await this.firestore.collection('sales').get();
      if (!salesSnap.empty) {
        const list = salesSnap.docs.map(doc => {
          const d = doc.data();
          delete d._syncedAt;
          delete d._updatedAt;
          return d;
        });
        // Ordena vendas por data decrescente
        list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        store.saveSales(list);
      }

      // 7. Purchases
      const purchasesSnap = await this.firestore.collection('purchases').get();
      if (!purchasesSnap.empty && typeof store.savePurchases === 'function') {
        const list = purchasesSnap.docs.map(doc => {
          const d = doc.data();
          delete d._syncedAt;
          delete d._updatedAt;
          return d;
        });
        list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        store.savePurchases(list);
      }

      const nowIso = new Date().toISOString();
      this.lastSync = nowIso;
      localStorage.setItem(FIREBASE_LAST_SYNC_KEY, this.lastSync);

      this.status = 'connected';
      this.statusMessage = 'Dados da nuvem baixados e aplicados no aplicativo!';
      this.notifyStatus();

      return {
        success: true,
        counts: {
          categories: categoriesSnap.size,
          ingredients: ingredientsSnap.size,
          recipes: recipesSnap.size,
          products: productsSnap.size,
          sales: salesSnap.size
        },
        syncedAt: nowIso
      };
    } catch (err) {
      console.error('Erro ao baixar dados do Firebase:', err);
      this.status = 'error';
      this.statusMessage = `Erro ao baixar dados: ${err.message}`;
      this.notifyStatus();
      throw err;
    }
  }

  /**
   * Utilitário para interpretar snippet ou JSON colado pelo usuário
   */
  static parseConfigInput(rawInput) {
    if (!rawInput || typeof rawInput !== 'string') return null;
    const clean = rawInput.trim();

    // 1. Tentar JSON direto
    try {
      const obj = JSON.parse(clean);
      if (obj.apiKey && obj.projectId) return obj;
      if (obj.firebaseConfig && obj.firebaseConfig.apiKey) return obj.firebaseConfig;
    } catch (e) {}

    // 2. Extração via Regex para scripts JS copiados do console Firebase:
    // const firebaseConfig = { apiKey: "...", authDomain: "...", projectId: "...", ... };
    const extract = (key) => {
      const match = clean.match(new RegExp(`['"]?${key}['"]?\\s*:\\s*['"\`]([^'"\`]+)['"\`]`));
      return match ? match[1].trim() : '';
    };

    const apiKey = extract('apiKey');
    const authDomain = extract('authDomain');
    const projectId = extract('projectId');
    const storageBucket = extract('storageBucket');
    const messagingSenderId = extract('messagingSenderId');
    const appId = extract('appId');
    const measurementId = extract('measurementId');

    if (apiKey && projectId) {
      return {
        apiKey,
        authDomain: authDomain || `${projectId}.firebaseapp.com`,
        projectId,
        storageBucket: storageBucket || `${projectId}.appspot.com`,
        messagingSenderId: messagingSenderId || '',
        appId: appId || '',
        measurementId: measurementId || ''
      };
    }

    return null;
  }
}

// Instância Singleton Global
window.FirebaseSyncService = new FirebaseSyncService();
