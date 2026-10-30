/**
 * Product Store - Rede Farma Gente (Drogaria Itajaí)
 */
class ProductStore {
  constructor() {
    this.products = [];
    this.categories = [];
    this.isLoaded = false;
  }

  async init() {
    try {
      // Tenta carregar da API primeiro, senão cai no fallback clean_products.json
      let res = await fetch('/api/products?limit=100').catch(() => null);
      if (!res || !res.ok) {
        res = await fetch('clean_products.json');
      }
      const data = await res.json();
      this.products = (Array.isArray(data) ? data : (data.products || [])).map(item => {
        if (item.image && item.image.startsWith('/')) item.image = item.image.substring(1);
        return item;
      });
      
      this.categories = ['Todos', ...new Set(this.products.map(p => p.category).filter(Boolean))];
      this.isLoaded = true;
      return this.products;
    } catch (e) {
      console.error('Erro ao carregar catálogo Farma Gente:', e);
      return [];
    }
  }

  getAll() {
    return this.products;
  }

  getBySlug(slug) {
    return this.products.find(p => p.slug === slug);
  }

  getById(id) {
    return this.products.find(p => String(p.id) === String(id));
  }

  getByCategory(cat) {
    if (!cat || cat === 'Todos') return this.products;
    return this.products.filter(p => (p.category || '').toLowerCase() === cat.toLowerCase());
  }

  getFeatured(limit = 10) {
    return this.products.slice(0, limit);
  }

  search(query) {
    if (!query) return this.products;
    const q = query.toLowerCase().trim();
    return this.products.filter(p => 
      (p.name || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.brand || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q) ||
      (p.specs && Object.values(p.specs).some(val => String(val).toLowerCase().includes(q)))
    );
  }

  formatMoney(val) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  }

  getPixPrice(price) {
    return price * 0.95; // 5% de desconto no PIX
  }
}

window.productStore = new ProductStore();
