/**
 * Cart Engine - Rede Farma Gente (Drogaria Itajaí)
 */
class CartEngine {
  constructor() {
    this.storageKey = 'cm.cart';
    this.couponKey = 'cm.coupon';
    this.items = this.loadCart();
    this.coupon = localStorage.getItem(this.couponKey) || null;
    this.freeShippingThreshold = 149.00;
  }

  loadCart() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    } catch (e) {
      return [];
    }
  }

  saveCart() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    this.updateUI();
  }

  addItem(product, qty = 1) {
    if (!product) return;
    const existing = this.items.find(i => String(i.id) === String(product.id));
    if (existing) {
      existing.qty = (existing.qty || 1) + qty;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        slug: product.slug,
        brand: product.brand,
        qty: qty
      });
    }
    this.saveCart();
    this.openDrawer();
    this.showToast(`'${product.name.split(' ')[0]}' adicionado à cesta!`);
  }

  removeItem(id) {
    this.items = this.items.filter(i => String(i.id) !== String(id));
    this.saveCart();
  }

  updateQty(id, qty) {
    const item = this.items.find(i => String(i.id) === String(id));
    if (item) {
      item.qty = Math.max(1, qty);
      this.saveCart();
    }
  }

  getSubtotal() {
    return this.items.reduce((sum, it) => sum + (it.price * (it.qty || 1)), 0);
  }

  getDiscount() {
    if (this.coupon === 'FARMA10') {
      return this.getSubtotal() * 0.10;
    }
    return 0;
  }

  getTotal() {
    return Math.max(0, this.getSubtotal() - this.getDiscount());
  }

  getCount() {
    return this.items.reduce((c, it) => c + (it.qty || 1), 0);
  }

  openDrawer() {
    document.getElementById('cartDrawerOverlay')?.classList.add('open');
    document.getElementById('cartDrawer')?.classList.add('open');
  }

  closeDrawer() {
    document.getElementById('cartDrawerOverlay')?.classList.remove('open');
    document.getElementById('cartDrawer')?.classList.remove('open');
  }

  updateUI() {
    // Badges
    const count = this.getCount();
    const subtotal = this.getSubtotal();
    
    document.querySelectorAll('.cart-badge').forEach(el => {
      el.textContent = count;
    });

    document.querySelectorAll('.cart-btn-price').forEach(el => {
      el.textContent = window.productStore ? window.productStore.formatMoney(subtotal) : `R$ ${subtotal.toFixed(2)}`;
    });

    // Render drawer items
    const list = document.getElementById('cartItemsList');
    if (list) {
      if (this.items.length === 0) {
        list.innerHTML = `
          <div style="text-align:center;padding:40px 20px;color:#94A3B8;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 12px;opacity:0.5;">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <p style="font-weight:700;font-size:15px;color:#1E293B;">Sua cesta está vazia</p>
            <p style="font-size:13px;margin-top:4px;">Adicione medicamentos, dermocosméticos ou produtos de higiene.</p>
          </div>
        `;
      } else {
        list.innerHTML = this.items.map(it => `
          <div class="cart-item">
            <img src="${it.image}" alt="${it.name}">
            <div class="cart-item-info">
              <div class="cart-item-title">${it.name}</div>
              <div class="cart-item-price">${window.productStore.formatMoney(it.price)}</div>
              <div class="cart-item-qty">
                <button class="qty-btn" onclick="window.cartEngine.updateQty('${it.id}', ${it.qty - 1})">-</button>
                <span style="font-weight:700;font-size:13px;min-width:20px;text-align:center;">${it.qty}</span>
                <button class="qty-btn" onclick="window.cartEngine.updateQty('${it.id}', ${it.qty + 1})">+</button>
                <button onclick="window.cartEngine.removeItem('${it.id}')" style="margin-left:auto;color:#EF4444;font-size:11px;font-weight:700;">Remover</button>
              </div>
            </div>
          </div>
        `).join('');
      }
    }

    // Free shipping progress bar
    const remaining = Math.max(0, this.freeShippingThreshold - subtotal);
    const progressEl = document.getElementById('shippingProgressMsg');
    const fillEl = document.getElementById('shippingProgressFill');
    if (progressEl && fillEl) {
      if (remaining <= 0) {
        progressEl.innerHTML = '<span style="color:#10B981;font-weight:800;">🎉 Parabéns! Você ganhou FRETE GRÁTIS!</span>';
        fillEl.style.width = '100%';
        fillEl.style.background = '#10B981';
      } else {
        const pct = Math.min(100, (subtotal / this.freeShippingThreshold) * 100);
        progressEl.innerHTML = `Faltam <strong>${window.productStore.formatMoney(remaining)}</strong> para ganhar <strong>FRETE GRÁTIS!</strong>`;
        fillEl.style.width = `${pct}%`;
        fillEl.style.background = 'linear-gradient(90deg, var(--secondary), var(--primary))';
      }
    }

    // Totals
    const subtotalEl = document.getElementById('cartDrawerSubtotal');
    if (subtotalEl) subtotalEl.textContent = window.productStore.formatMoney(subtotal);

    const totalEl = document.getElementById('cartDrawerTotal');
    if (totalEl) totalEl.textContent = window.productStore.formatMoney(this.getTotal());
  }

  showToast(msg) {
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#0F172A;color:#FFF;padding:12px 24px;border-radius:30px;font-weight:700;font-size:13px;z-index:9999;box-shadow:0 10px 25px rgba(0,0,0,0.3);display:flex;align-items:center;gap:8px;';
    toast.innerHTML = `<span style="color:#10B981;">✓</span> ${msg}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }
}

window.cartEngine = new CartEngine();
