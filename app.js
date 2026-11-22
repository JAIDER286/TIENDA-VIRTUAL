// ============================================================
// app.js - Lógica de CYBERNETIC APPAREL (con API real + COP)
// ============================================================

// ---------- Estado ----------
let products = [];              // se carga desde API o respaldo
let cart = [];                  // [{id, qty}]
let currentUser = loadSession(); // {name, email} | null
let users = loadUsers();
let currentDetailId = null;
let detailQty = 1;

const filters = { search: '', category: 'Todos', maxPrice: 0, brand: 'Todas' };

// ---------- Conversión a Pesos Colombianos ----------
function toCOP(usd) {
  return Math.round((usd * 4200) / 1000) * 1000;
}

function formatCOP(valor) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor);
}

// ---------- Mapeo de API ----------
const CATEGORY_MAP = {
  'mens-shirts': 'Camisas',
  'mens-shoes': 'Calzado',
  'womens-dresses': 'Vestidos',
  'tops': 'Tops/Camisetas'
};

function mapApiProduct(p, slug) {
  const brand = (p.brand && String(p.brand).trim()) ? p.brand : 'Urban Chic';
  const cat = CATEGORY_MAP[slug] || 'Tops/Camisetas';
  const priceCOP = toCOP(p.price);
  const image = (p.thumbnail && p.thumbnail.trim()) ? p.thumbnail : (Array.isArray(p.images) && p.images[0]) ? p.images[0] : '';
  return {
    id: p.id,
    name: p.title,
    category: cat,
    brand: brand,
    price: priceCOP,
    stock: (typeof p.stock === 'number') ? p.stock : 0,
    image: image,
    desc: p.description || '',
    features: [
      `Marca: ${brand}`,
      `Categoría: ${cat}`,
      `Stock disponible: ${p.stock}`,
      p.discountPercentage ? `Descuento: ${Math.round(p.discountPercentage)}%` : null,
      p.rating ? `Valoración: ${p.rating}/5` : null,
      p.dimensions ? `Dimensiones: ${p.dimensions.width}x${p.dimensions.height}x${p.dimensions.depth} cm` : null
    ].filter(Boolean)
  };
}

function mapFallbackProduct(p) {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    brand: p.brand,
    price: toCOP(p.price),
    stock: p.stock,
    image: makeImage(p.name, p.icon, p.color),
    desc: p.desc,
    features: p.features
  };
}

// ---------- Storage helpers ----------
function loadUsers() {
  try { return JSON.parse(localStorage.getItem('cyber_users') || '[]'); }
  catch (e) { return []; }
}
function saveUsers() { localStorage.setItem('cyber_users', JSON.stringify(users)); }
function loadSession() {
  try { return JSON.parse(localStorage.getItem('cyber_session') || 'null'); }
  catch (e) { return null; }
}
function saveSession(u) { localStorage.setItem('cyber_session', JSON.stringify(u)); }
function clearSession() { localStorage.removeItem('cyber_session'); }

// ---------- Utilidades UI ----------
function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.classList.add('hidden'), 2600);
}

function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.getElementById('loginForm').classList.toggle('hidden', tab !== 'login');
  document.getElementById('registerForm').classList.toggle('hidden', tab !== 'register');
}

function openAuth(tab) {
  switchTab(tab || 'login');
  const lm = document.getElementById('loginMsg'); if (lm) { lm.textContent = ''; lm.classList.remove('ok'); }
  const rm = document.getElementById('regMsg'); if (rm) { rm.textContent = ''; rm.classList.remove('ok'); }
  openModal('authModal');
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// ---------- Carga de productos ----------
const ML_STORES = ['KOAJ', 'Arturo Calle', 'Mattelsa', 'Tennis', 'Gef', 'Seven Seven'];
const ML_CATS = ['Chaquetas', 'Camisetas', 'Pantalones', 'Buzos', 'Sacos'];

function mapMlProduct(p, index) {
  const store = ML_STORES[index % ML_STORES.length];
  const category = ML_CATS[index % ML_CATS.length];
  const price = Math.round(Number(p.price) || 0);
  const stock = (typeof p.available_quantity === 'number') ? p.available_quantity
              : (typeof p.initial_quantity === 'number' ? p.initial_quantity : 10);
  const image = (p.thumbnail && String(p.thumbnail).trim())
    ? String(p.thumbnail).replace(/-I\.jpg$/i, '-F.jpg')
    : (Array.isArray(p.pictures) && p.pictures[0] && p.pictures[0].url) ? p.pictures[0].url : '';
  return {
    id: p.id,
    name: p.title,
    category: category,
    brand: store,
    price: price,
    stock: stock,
    image: image,
    desc: p.title,
    features: [
      `Tienda: ${store}`,
      `Categoría: ${category}`,
      `Stock disponible: ${stock}`,
      p.condition ? `Condición: ${p.condition}` : null
    ].filter(Boolean)
  };
}

async function loadProducts() {
  const grid = document.getElementById('productsGrid');
  if (grid) grid.innerHTML = '<p style="color:var(--muted);font-family:monospace;padding:20px;">Cargando prendas...</p>';

  try {
    const res = await fetch('https://api.mercadolibre.com/sites/MCO/search?category=MCO1430&limit=20');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const json = await res.json();
    const list = Array.isArray(json.results) ? json.results : [];
    if (!list.length) throw new Error('Sin resultados');
    products = list.map((p, i) => mapMlProduct(p, i));
    if (!products.length) throw new Error('Sin productos');
  } catch (err) {
    console.warn('Mercado Libre no disponible, usando respaldo local:', err);
    products = (typeof fallbackProducts !== 'undefined' ? fallbackProducts : []).map(p => ({ ...p }));
  }

  // Asegurar imagen válida
  products.forEach(p => {
    if (!p.image) p.image = makeImage(p.name, '👕', '#00f3ff');
  });

  initFilters();
  renderProducts();
  renderCart();
}

// ---------- Filtros ----------
function initFilters() {
  const catSel = document.getElementById('filterCategory');
  catSel.innerHTML = '';
  CATEGORIES.forEach(c => {
    const o = document.createElement('option');
    o.value = c; o.textContent = c;
    catSel.appendChild(o);
  });

  const brands = [...new Set(products.map(p => p.brand))].sort();
  const brandSel = document.getElementById('filterBrand');
  brandSel.innerHTML = '';
  const all = document.createElement('option');
  all.value = 'Todas'; all.textContent = 'Todas';
  brandSel.appendChild(all);
  brands.forEach(b => {
    const o = document.createElement('option');
    o.value = b; o.textContent = b;
    brandSel.appendChild(o);
  });

  const minP = 50000;
  const maxP = 350000;
  const priceInput = document.getElementById('filterPrice');
  priceInput.min = minP;
  priceInput.max = maxP;
  priceInput.value = maxP;
  document.getElementById('priceVal').textContent = formatCOP(maxP);
  filters.maxPrice = maxP;
}

function getFilteredProducts() {
  return products.filter(p => {
    if (filters.search && !p.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.category !== 'Todos' && p.category !== filters.category) return false;
    if (p.price > filters.maxPrice) return false;
    if (filters.brand !== 'Todas' && p.brand !== filters.brand) return false;
    return true;
  });
}

// ---------- Renderizado de productos ----------
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = '';
  const list = getFilteredProducts();
  if (list.length === 0) {
    grid.innerHTML = '<p style="color:var(--muted);font-family:monospace;padding:20px;">Sin resultados.</p>';
    return;
  }
  list.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img class="card-img" src="${p.image}" alt="${escapeHtml(p.name)}" data-id="${p.id}" onerror="this.src='data:image/svg+xml;utf8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect width=%22400%22 height=%22300%22 fill=%22%23070b14%22/%3E%3Ctext x=%22200%22 y=%22150%22 text-anchor=%22middle%22 fill=%22%2300f3ff%22 font-family=%22monospace%22%3E${encodeURIComponent(p.name)}%3C/text%3E%3C/svg%3E'">
      <div class="card-body">
        <div class="card-cat">${escapeHtml(p.category)}</div>
        <div class="card-store">Tienda: ${escapeHtml(p.brand)}</div>
        <div class="card-name">${escapeHtml(p.name)}</div>
        <div class="card-price">${formatCOP(p.price)}</div>
        <div class="card-stock">STOCK: ${p.stock} UNIDADES</div>
        <div class="card-actions">
          <button class="btn-neon btn-small" data-add="${p.id}">+ Carrito</button>
          <button class="btn-neon btn-small btn-magenta" data-view="${p.id}">Detalles</button>
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

// ---------- Carrito ----------
function addToCart(id, qty) {
  const p = products.find(x => x.id === id);
  if (!p || p.stock <= 0) { showToast('Sin stock disponible.'); return; }
  const existing = cart.find(x => x.id === id);
  if (existing) {
    const newQty = Math.min(existing.qty + qty, p.stock);
    if (newQty === existing.qty) { showToast('Stock máximo alcanzado.'); return; }
    existing.qty = newQty;
  } else {
    const q = Math.min(qty, p.stock);
    if (q <= 0) { showToast('Sin stock disponible.'); return; }
    cart.push({ id, qty: q });
  }
  renderCart();
  showToast(p.name + ' añadido al carrito.');
}

function updateCartQty(id, delta) {
  const item = cart.find(x => x.id === id);
  if (!item) return;
  const p = products.find(x => x.id === id);
  const newQty = item.qty + delta;
  if (newQty <= 0) { removeFromCart(id); return; }
  if (newQty > p.stock) { showToast('Stock máximo alcanzado.'); return; }
  item.qty = newQty;
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(x => x.id !== id);
  renderCart();
}

function renderCart() {
  const container = document.getElementById('cartItems');
  container.innerHTML = '';
  cart.forEach(item => {
    const p = products.find(x => x.id === item.id);
    const sub = p.price * item.qty;
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${p.image}" alt="${escapeHtml(p.name)}" onerror="this.style.display='none'">
      <div class="info">
        <div class="name">${escapeHtml(p.name)}</div>
        <div class="sub">${formatCOP(sub)}</div>
      </div>
      <div class="qty">
        <button class="btn-neon btn-small" data-cdec="${p.id}">-</button>
        <span>${item.qty}</span>
        <button class="btn-neon btn-small" data-cinc="${p.id}">+</button>
      </div>
      <button class="remove" data-crem="${p.id}" title="Eliminar">✕</button>`;
    container.appendChild(div);
  });
  const total = cart.reduce((s, item) => {
    const p = products.find(x => x.id === item.id);
    return s + p.price * item.qty;
  }, 0);
  document.getElementById('cartTotal').textContent = formatCOP(total);
}

// ---------- Detalle de producto ----------
function openDetail(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  currentDetailId = id;
  detailQty = 1;
  const img = document.getElementById('detailImg');
  img.src = p.image;
  img.alt = p.name;
  img.onerror = () => { img.style.display = 'none'; };
  document.getElementById('detailName').textContent = p.name;
  document.getElementById('detailCat').textContent = p.category + ' • ' + p.brand;
  document.getElementById('detailPrice').textContent = formatCOP(p.price);
  document.getElementById('detailDesc').textContent = p.desc;
  const ul = document.getElementById('detailFeatures');
  ul.innerHTML = p.features.map(f => `<li>${escapeHtml(f)}</li>`).join('');
  document.getElementById('detailStock').textContent = p.stock;
  document.getElementById('detailQty').textContent = detailQty;
  openModal('detailModal');
}

// ---------- Checkout ----------
function checkout() {
  if (!currentUser) {
    showToast('Debes iniciar sesión para proceder al pago.');
    openAuth('login');
    return;
  }
  if (cart.length === 0) {
    showToast('El carrito está vacío.');
    return;
  }
  for (const item of cart) {
    const p = products.find(x => x.id === item.id);
    if (item.qty > p.stock) {
      showToast('Stock insuficiente para ' + p.name);
      return;
    }
  }
  cart.forEach(item => {
    const p = products.find(x => x.id === item.id);
    p.stock -= item.qty;
  });
  const items = cart.map(item => {
    const p = products.find(x => x.id === item.id);
    return { name: p.name, qty: item.qty, price: p.price, sub: p.price * item.qty };
  });
  const total = items.reduce((s, i) => s + i.sub, 0);
  showReceipt(items, total);
  cart = [];
  renderCart();
  renderProducts();
}

function showReceipt(items, total) {
  const body = document.getElementById('receiptBody');
  body.innerHTML = `
    <p>Cliente: <strong>${escapeHtml(currentUser.name)}</strong> (${escapeHtml(currentUser.email)})</p>
    <table>
      <thead><tr><th>Artículo</th><th>Cant</th><th>Precio</th><th>Subtotal</th></tr></thead>
      <tbody>${items.map(i => `<tr>
        <td>${escapeHtml(i.name)}</td><td>${i.qty}</td>
        <td>${formatCOP(i.price)}</td><td>${formatCOP(i.sub)}</td></tr>`).join('')}</tbody>
      <tfoot><tr><td colspan="3"><strong>TOTAL</strong></td><td><strong>${formatCOP(total)}</strong></td></tr></tfoot>
    </table>
    <p class="msg ok">¡Gracias por tu compra! El stock ha sido actualizado.</p>`;
  openModal('receiptModal');
}

// ---------- Renderizado de autenticación ----------
function renderAuth() {
  const area = document.getElementById('authArea');
  if (currentUser) {
    area.innerHTML = `<span class="user-name">${escapeHtml(currentUser.name)}</span>
      <button id="logoutBtn" class="btn-neon btn-small btn-magenta">Cerrar Sesión</button>`;
    document.getElementById('logoutBtn').onclick = logout;
  } else {
    area.innerHTML = `<button id="loginBtn" class="btn-neon btn-small">Iniciar Sesión</button>
      <button id="registerBtn" class="btn-neon btn-small btn-magenta">Registrarse</button>`;
    document.getElementById('loginBtn').onclick = () => openAuth('login');
    document.getElementById('registerBtn').onclick = () => openAuth('register');
  }
}

function logout() {
  currentUser = null;
  clearSession();
  renderAuth();
  showToast('Sesión cerrada.');
}

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
  renderAuth();

  // Búsqueda básica
  document.getElementById('searchInput').addEventListener('input', e => {
    filters.search = e.target.value;
    renderProducts();
  });

  // Búsqueda avanzada toggle
  document.getElementById('toggleAdvanced').addEventListener('click', () => {
    document.getElementById('advancedPanel').classList.toggle('hidden');
  });

  // Filtros avanzados (se enlazan ahora; initFilters se llama tras cargar productos)
  document.getElementById('filterCategory').addEventListener('change', e => {
    filters.category = e.target.value;
    renderProducts();
  });
  document.getElementById('filterPrice').addEventListener('input', e => {
    filters.maxPrice = Number(e.target.value);
    document.getElementById('priceVal').textContent = formatCOP(filters.maxPrice);
    renderProducts();
  });
  document.getElementById('filterBrand').addEventListener('change', e => {
    filters.brand = e.target.value;
    renderProducts();
  });
  document.getElementById('clearFilters').addEventListener('click', () => {
    filters.search = '';
    filters.category = 'Todos';
    filters.brand = 'Todas';
    const maxP = 350000;
    filters.maxPrice = maxP;
    document.getElementById('searchInput').value = '';
    document.getElementById('filterCategory').value = 'Todos';
    document.getElementById('filterBrand').value = 'Todas';
    document.getElementById('filterPrice').value = maxP;
    document.getElementById('priceVal').textContent = formatCOP(maxP);
    renderProducts();
  });

  // Delegación en grid de productos
  document.getElementById('productsGrid').addEventListener('click', e => {
    const img = e.target.closest('.card-img');
    if (img) { openDetail(Number(img.dataset.id)); return; }
    const add = e.target.closest('[data-add]');
    if (add) { addToCart(Number(add.dataset.add), 1); return; }
    const view = e.target.closest('[data-view]');
    if (view) { openDetail(Number(view.dataset.view)); return; }
  });

  // Delegación en carrito
  document.getElementById('cartItems').addEventListener('click', e => {
    const dec = e.target.closest('[data-cdec]');
    if (dec) { updateCartQty(Number(dec.dataset.cdec), -1); return; }
    const inc = e.target.closest('[data-cinc]');
    if (inc) { updateCartQty(Number(inc.dataset.cinc), 1); return; }
    const rem = e.target.closest('[data-crem]');
    if (rem) { removeFromCart(Number(rem.dataset.crem)); return; }
  });

  // Checkout
  document.getElementById('checkoutBtn').addEventListener('click', checkout);

  // Detalle: cantidad y añadir
  document.getElementById('detailMinus').addEventListener('click', () => {
    if (detailQty > 1) {
      detailQty--;
      document.getElementById('detailQty').textContent = detailQty;
    }
  });
  document.getElementById('detailPlus').addEventListener('click', () => {
    const p = products.find(x => x.id === currentDetailId);
    if (p && detailQty < p.stock) {
      detailQty++;
      document.getElementById('detailQty').textContent = detailQty;
    }
  });
  document.getElementById('detailAdd').addEventListener('click', () => {
    if (currentDetailId !== null) {
      addToCart(currentDetailId, detailQty);
      closeModal('detailModal');
    }
  });

  // Cierre de modales por data-close y tabs
  document.addEventListener('click', e => {
    const c = e.target.closest('[data-close]');
    if (c) { closeModal(c.dataset.close); return; }
    const tab = e.target.closest('.tab');
    if (tab && tab.dataset.tab) { switchTab(tab.dataset.tab); }
  });

  // Formularios de autenticación
  document.getElementById('registerForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim().toLowerCase();
    const pass = document.getElementById('regPass').value;
    const msg = document.getElementById('regMsg');
    if (!name || !email || !pass) {
      msg.textContent = 'Completa todos los campos.';
      msg.classList.remove('ok');
      return;
    }
    if (users.some(u => u.email === email)) {
      msg.textContent = 'El correo ya está registrado.';
      msg.classList.remove('ok');
      return;
    }
    users.push({ name, email, password: pass });
    saveUsers();
    msg.textContent = 'Registro exitoso. Ahora inicia sesión.';
    msg.classList.add('ok');
    setTimeout(() => {
      switchTab('login');
      const li = document.getElementById('loginEmail');
      if (li) li.value = email;
      const rm = document.getElementById('regMsg'); if (rm) { rm.textContent = ''; rm.classList.remove('ok'); }
    }, 900);
  });

  document.getElementById('loginForm').addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const pass = document.getElementById('loginPass').value;
    const msg = document.getElementById('loginMsg');
    const u = users.find(x => x.email === email && x.password === pass);
    if (!u) {
      msg.textContent = 'Credenciales inválidas.';
      msg.classList.remove('ok');
      return;
    }
    currentUser = { name: u.name, email: u.email };
    saveSession(currentUser);
    msg.textContent = 'Bienvenido, ' + u.name;
    msg.classList.add('ok');
    renderAuth();
    setTimeout(() => closeModal('authModal'), 700);
  });

  // Cargar productos (API real con respaldo local)
  loadProducts();
});