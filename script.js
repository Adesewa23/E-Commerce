/* ==========================================================================
   Blossom Luxe — script.js
   Vanilla JS only. No frameworks, no build step.

   Table of contents:
   1. Product data
   2. State & DOM references
   3. Utility helpers (currency, stars, storage)
   4. Rendering: product cards
   5. Filtering, searching, sorting
   6. Cart logic (add / remove / quantity / totals)
   7. Cart drawer open/close
   8. Quick view modal
   9. Checkout modal + validation
   10. Header: mobile nav, search trigger, misc
   11. Init
   ========================================================================== */

/* ---------- 1. Product data ----------
   Single source of truth. Every product card, and every cart row, is
   generated from this array — nothing is hand-duplicated in the HTML. */
const PRODUCTS = [
  {
    id: 'vanilla-bloom',
    name: 'Vanilla Bloom',
    description: 'Warm vanilla, amber, and a whisper of sandalwood.',
    price: 25000,
    category: 'Perfume Oil',
    rating: 4.7,
    reviews: 128,
    image: 'https://placehold.co/500x600/6E1423/F1E8DC?text=Vanilla+Bloom'
  },
  {
    id: 'rose-noir',
    name: 'Rose Noir',
    description: 'Dark rose petals with a sharp edge of black pepper.',
    price: 30000,
    category: 'Perfume',
    rating: 4.8,
    reviews: 214,
    image: 'https://placehold.co/500x600/C6A15B/221D1B?text=Rose+Noir'
  },
  {
    id: 'golden-musk',
    name: 'Golden Musk',
    description: 'Soft musk and sandalwood, worn close to the skin.',
    price: 28000,
    category: 'Perfume',
    rating: 4.6,
    reviews: 97,
    image: 'https://placehold.co/500x600/6E1423/F1E8DC?text=Golden+Musk'
  },
  {
    id: 'oud-elegance',
    name: 'Oud Élégance',
    description: 'Rich oud and saffron for an unmistakable presence.',
    price: 35000,
    category: 'Perfume',
    rating: 4.9,
    reviews: 176,
    image: 'https://placehold.co/500x600/C6A15B/221D1B?text=Oud+Elegance'
  },
  {
    id: 'bloom-mist',
    name: 'Bloom Mist',
    description: 'A light floral mist for everyday layering.',
    price: 18000,
    category: 'Body Mist',
    rating: 4.4,
    reviews: 63,
    image: 'https://placehold.co/500x600/6E1423/F1E8DC?text=Bloom+Mist'
  },
  {
    id: 'velvet-rose',
    name: 'Velvet Rose',
    description: 'Rose and velvety musk with a soft, powdery finish.',
    price: 32000,
    category: 'Perfume',
    rating: 4.7,
    reviews: 141,
    image: 'https://placehold.co/500x600/C6A15B/221D1B?text=Velvet+Rose'
  },
  {
    id: 'amber-luxe',
    name: 'Amber Luxe',
    description: 'Amber, vanilla, and oud layered for evening wear.',
    price: 38000,
    category: 'Perfume',
    rating: 4.8,
    reviews: 189,
    image: 'https://placehold.co/500x600/6E1423/F1E8DC?text=Amber+Luxe'
  },
  {
    id: 'signature-collection',
    name: 'Signature Collection',
    description: 'Three signature scents in a keepsake gift box.',
    price: 45000,
    category: 'Gift Sets',
    rating: 4.9,
    reviews: 88,
    image: 'https://placehold.co/500x600/C6A15B/221D1B?text=Signature+Set'
  },
  {
    id: 'citrus-veil',
    name: 'Citrus Veil',
    description: 'Bright citrus and neroli, light enough for daywear.',
    price: 20000,
    category: 'Body Mist',
    rating: 4.5,
    reviews: 72,
    image: 'https://placehold.co/500x600/6E1423/F1E8DC?text=Citrus+Veil'
  },
  {
    id: 'discovery-set',
    name: 'Discovery Set',
    description: 'Four travel sprays to find your signature scent.',
    price: 22000,
    category: 'Gift Sets',
    rating: 4.6,
    reviews: 54,
    image: 'https://placehold.co/500x600/C6A15B/221D1B?text=Discovery+Set'
  },
];

/* ---------- 2. State & DOM references ---------- */
const CART_STORAGE_KEY = 'blossomluxe_cart_v1';

const state = {
  cart: [],            // [{ id, quantity }]
  activeFilter: 'all',
  searchTerm: '',
  sortOrder: 'featured',
};

const dom = {
  productGrid: document.getElementById('product-grid'),
  noResults: document.getElementById('no-results'),
  filterPills: document.getElementById('filter-pills'),
  searchInput: document.getElementById('product-search'),
  sortSelect: document.getElementById('sort-select'),

  cartTrigger: document.getElementById('cart-trigger'),
  cartCount: document.getElementById('cart-count'),
  cartDrawer: document.getElementById('cart-drawer'),
  cartOverlay: document.getElementById('cart-overlay'),
  cartClose: document.getElementById('cart-close'),
  drawerItems: document.getElementById('drawer-items'),
  drawerEmpty: document.getElementById('drawer-empty'),
  drawerFooter: document.getElementById('drawer-footer'),
  cartTotal: document.getElementById('cart-total'),

  checkoutBtn: document.getElementById('checkout-btn'),
  checkoutOverlay: document.getElementById('checkout-overlay'),
  checkoutClose: document.getElementById('checkout-close'),
  checkoutForm: document.getElementById('checkout-form'),
  checkoutFormView: document.getElementById('checkout-form-view'),
  checkoutSuccessView: document.getElementById('checkout-success-view'),
  checkoutDone: document.getElementById('checkout-done'),
  modalTotal: document.getElementById('modal-total'),

  quickviewOverlay: document.getElementById('quickview-overlay'),
  quickviewClose: document.getElementById('quickview-close'),
  quickviewBody: document.getElementById('quickview-body'),

  hamburger: document.getElementById('hamburger'),
  mainNav: document.getElementById('main-nav'),
  searchTrigger: document.getElementById('search-trigger'),

  toast: document.getElementById('toast'),
};

/* ---------- 3. Utility helpers ---------- */

// Formats a number as Nigerian Naira, e.g. 25000 -> "₦25,000"
function formatNaira(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Builds a star-rating string like "★★★★☆" from a numeric rating (0-5)
function renderStars(rating) {
  const full = Math.round(rating); // simple rounding is enough for a 5-star display
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

function getProductById(id) {
  return PRODUCTS.find(p => p.id === id);
}

function showToast(message) {
  dom.toast.textContent = message;
  dom.toast.classList.add('visible');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => dom.toast.classList.remove('visible'), 2200);
}

/* ---------- 4. Rendering: product cards ---------- */

// Builds the markup for a single product card. Reused for every product —
// there is no hand-written card HTML anywhere in index.html.
function buildProductCard(product) {
  const card = document.createElement('article');
  card.className = 'product-card';
  card.dataset.id = product.id;

  card.innerHTML = `
    <div class="product-image-wrap">
      <img src="${product.image}" alt="${product.name} bottle" loading="lazy">
      <span class="product-category-badge">${product.category}</span>
    </div>
    <div class="product-info">
      <h3>${product.name}</h3>
      <p class="product-desc">${product.description}</p>
      <div class="product-rating">
        <span class="stars" aria-hidden="true">${renderStars(product.rating)}</span>
        <span>${product.rating.toFixed(1)} (${product.reviews} reviews)</span>
      </div>
      <div class="product-price">${formatNaira(product.price)}</div>
      <div class="card-actions">
        <button class="btn-add-cart" data-id="${product.id}">Add to Cart</button>
        <button class="btn-view-details" data-id="${product.id}">View Details</button>
      </div>
    </div>
  `;
  return card;
}

function renderProducts(products) {
  dom.productGrid.innerHTML = '';
  dom.noResults.hidden = products.length > 0;

  const fragment = document.createDocumentFragment();
  products.forEach(product => fragment.appendChild(buildProductCard(product)));
  dom.productGrid.appendChild(fragment);
}

/* ---------- 5. Filtering, searching, sorting ---------- */

function getVisibleProducts() {
  let list = PRODUCTS.slice();

  if (state.activeFilter !== 'all') {
    list = list.filter(p => p.category === state.activeFilter);
  }

  if (state.searchTerm.trim()) {
    const term = state.searchTerm.trim().toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(term));
  }

  switch (state.sortOrder) {
    case 'price-asc':
      list.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      list.sort((a, b) => b.price - a.price);
      break;
    case 'rating-desc':
      list.sort((a, b) => b.rating - a.rating);
      break;
    // 'featured' keeps the original catalogue order
  }

  return list;
}

function refreshProductGrid() {
  renderProducts(getVisibleProducts());
}

dom.filterPills.addEventListener('click', (e) => {
  const pill = e.target.closest('.pill');
  if (!pill) return;
  state.activeFilter = pill.dataset.filter;
  dom.filterPills.querySelectorAll('.pill').forEach(p => p.classList.toggle('active', p === pill));
  refreshProductGrid();
});

dom.searchInput.addEventListener('input', (e) => {
  state.searchTerm = e.target.value;
  refreshProductGrid();
});

dom.sortSelect.addEventListener('change', (e) => {
  state.sortOrder = e.target.value;
  refreshProductGrid();
});

/* ---------- 6. Cart logic ---------- */

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    state.cart = raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Could not read saved cart:', e);
    state.cart = [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.cart));
  } catch (e) {
    console.warn('Could not save cart:', e);
  }
}

function addToCart(id) {
  const existing = state.cart.find(item => item.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({ id, quantity: 1 });
  }
  saveCart();
  renderCart();

  const product = getProductById(id);
  showToast(`${product.name} added to cart`);
}

function removeFromCart(id) {
  state.cart = state.cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
}

function changeQuantity(id, delta) {
  const item = state.cart.find(item => item.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(id);
    return;
  }
  saveCart();
  renderCart();
}

function calcCartTotal() {
  return state.cart.reduce((sum, item) => {
    const product = getProductById(item.id);
    return product ? sum + product.price * item.quantity : sum;
  }, 0);
}

function calcCartItemCount() {
  return state.cart.reduce((sum, item) => sum + item.quantity, 0);
}

// Rebuilds the cart drawer contents and every dependent UI element
// (cart badge count, drawer total, checkout modal total).
function renderCart() {
  const itemCount = calcCartItemCount();
  dom.cartCount.textContent = itemCount;

  const isEmpty = state.cart.length === 0;
  dom.drawerEmpty.hidden = !isEmpty;
  dom.drawerFooter.hidden = isEmpty;
  dom.drawerItems.hidden = isEmpty;

  dom.drawerItems.innerHTML = '';
  const fragment = document.createDocumentFragment();

  state.cart.forEach(item => {
    const product = getProductById(item.id);
    if (!product) return;
    const subtotal = product.price * item.quantity;

    const row = document.createElement('div');
    row.className = 'drawer-item';
    row.dataset.id = product.id;
    row.innerHTML = `
      <img src="${product.image}" alt="${product.name} bottle">
      <div class="drawer-item-info">
        <h4>${product.name}</h4>
        <div class="drawer-item-price">${formatNaira(product.price)} each</div>
        <div class="drawer-item-bottom">
          <div class="qty-control">
            <button class="qty-decrease" aria-label="Decrease quantity of ${product.name}">−</button>
            <span>${item.quantity}</span>
            <button class="qty-increase" aria-label="Increase quantity of ${product.name}">+</button>
          </div>
          <span class="drawer-item-subtotal">${formatNaira(subtotal)}</span>
        </div>
        <button class="remove-item-btn">Remove</button>
      </div>
    `;
    fragment.appendChild(row);
  });

  dom.drawerItems.appendChild(fragment);

  const total = calcCartTotal();
  dom.cartTotal.textContent = formatNaira(total);
  dom.modalTotal.textContent = formatNaira(total);
}

// Event delegation: one listener handles every quantity/remove button,
// including ones added after the initial render.
dom.drawerItems.addEventListener('click', (e) => {
  const row = e.target.closest('.drawer-item');
  if (!row) return;
  const id = row.dataset.id;

  if (e.target.closest('.qty-increase')) changeQuantity(id, 1);
  else if (e.target.closest('.qty-decrease')) changeQuantity(id, -1);
  else if (e.target.closest('.remove-item-btn')) removeFromCart(id);
});

// Add-to-cart / view-details buttons live inside the product grid, which is
// rebuilt often, so this listener is also delegated from a stable parent.
dom.productGrid.addEventListener('click', (e) => {
  const addBtn = e.target.closest('.btn-add-cart');
  const viewBtn = e.target.closest('.btn-view-details');

  if (addBtn) {
    addToCart(addBtn.dataset.id);
    addBtn.classList.add('added');
    addBtn.textContent = 'Added ✓';
    setTimeout(() => {
      addBtn.classList.remove('added');
      addBtn.textContent = 'Add to Cart';
    }, 1200);
  } else if (viewBtn) {
    openQuickView(viewBtn.dataset.id);
  }
});

/* ---------- 7. Cart drawer open/close ---------- */

function openCartDrawer() {
  dom.cartDrawer.classList.add('open');
  dom.cartOverlay.classList.add('open');
  dom.cartDrawer.focus();
  document.body.style.overflow = 'hidden';
}

function closeCartDrawer() {
  dom.cartDrawer.classList.remove('open');
  dom.cartOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

dom.cartTrigger.addEventListener('click', openCartDrawer);
dom.cartClose.addEventListener('click', closeCartDrawer);
dom.cartOverlay.addEventListener('click', closeCartDrawer);
document.getElementById('drawer-empty-link').addEventListener('click', closeCartDrawer);

/* ---------- 8. Quick view modal ---------- */

function openQuickView(id) {
  const product = getProductById(id);
  if (!product) return;

  dom.quickviewBody.innerHTML = `
    <img src="${product.image}" alt="${product.name} bottle">
    <div>
      <span class="product-category-badge" style="position:static; display:inline-block; margin-bottom:10px;">${product.category}</span>
      <h2 id="qv-title">${product.name}</h2>
      <p class="product-desc">${product.description}</p>
      <div class="product-rating">
        <span class="stars" aria-hidden="true">${renderStars(product.rating)}</span>
        <span>${product.rating.toFixed(1)} (${product.reviews} reviews)</span>
      </div>
      <div class="product-price">${formatNaira(product.price)}</div>
      <div class="card-actions">
        <button class="btn-add-cart" data-id="${product.id}">Add to Cart</button>
      </div>
    </div>
  `;

  dom.quickviewOverlay.classList.add('open');
  dom.quickviewOverlay.querySelector('.modal').focus();
}

function closeQuickView() {
  dom.quickviewOverlay.classList.remove('open');
}

dom.quickviewClose.addEventListener('click', closeQuickView);
dom.quickviewOverlay.addEventListener('click', (e) => {
  if (e.target === dom.quickviewOverlay) closeQuickView();
});
dom.quickviewBody.addEventListener('click', (e) => {
  const addBtn = e.target.closest('.btn-add-cart');
  if (addBtn) {
    addToCart(addBtn.dataset.id);
    closeQuickView();
    openCartDrawer();
  }
});

/* ---------- 9. Checkout modal + validation ---------- */

function openCheckoutModal() {
  if (state.cart.length === 0) return;
  closeCartDrawer();
  dom.checkoutFormView.hidden = false;
  dom.checkoutSuccessView.hidden = true;
  dom.checkoutOverlay.classList.add('open');
  dom.checkoutOverlay.querySelector('.modal').focus();
}

function closeCheckoutModal() {
  dom.checkoutOverlay.classList.remove('open');
}

dom.checkoutBtn.addEventListener('click', openCheckoutModal);
dom.checkoutClose.addEventListener('click', closeCheckoutModal);
dom.checkoutOverlay.addEventListener('click', (e) => {
  if (e.target === dom.checkoutOverlay) closeCheckoutModal();
});
dom.checkoutDone.addEventListener('click', () => {
  closeCheckoutModal();
  // Clear the cart after a completed demo order, like a real checkout would.
  state.cart = [];
  saveCart();
  renderCart();
});

// Simple, readable field-by-field validation. Each rule returns an error
// string (or '' when valid), which keeps validateCheckoutForm() short.
const checkoutValidators = {
  name: (v) => (v.trim().length < 2 ? 'Enter your full name.' : ''),
  email: (v) => (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? 'Enter a valid email address.' : ''),
  phone: (v) => (!/^\+?[0-9\s-]{7,15}$/.test(v.trim()) ? 'Enter a valid phone number.' : ''),
  address: (v) => (v.trim().length < 8 ? 'Enter a delivery address.' : ''),
};

function validateCheckoutForm() {
  const formData = new FormData(dom.checkoutForm);
  let isValid = true;

  Object.keys(checkoutValidators).forEach(field => {
    const value = formData.get(field) || '';
    const message = checkoutValidators[field](value);
    const input = document.getElementById(`cf-${field}`);
    const errorEl = document.getElementById(`err-${field}`);

    errorEl.textContent = message;
    input.classList.toggle('invalid', Boolean(message));
    if (message) isValid = false;
  });

  return isValid;
}

dom.checkoutForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validateCheckoutForm()) return;

  dom.checkoutFormView.hidden = true;
  dom.checkoutSuccessView.hidden = false;
});

/* ---------- 10. Header: mobile nav, search trigger ---------- */

dom.hamburger.addEventListener('click', () => {
  const isOpen = dom.mainNav.classList.toggle('open');
  dom.hamburger.setAttribute('aria-expanded', String(isOpen));
});

dom.mainNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    dom.mainNav.classList.remove('open');
    dom.hamburger.setAttribute('aria-expanded', 'false');
  });
});

// The header search icon jumps to the shop section and focuses the single
// search field there, rather than duplicating a second search input.
dom.searchTrigger.addEventListener('click', () => {
  document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => dom.searchInput.focus(), 400);
});

// Escape key closes whichever overlay is open
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (dom.checkoutOverlay.classList.contains('open')) closeCheckoutModal();
  else if (dom.quickviewOverlay.classList.contains('open')) closeQuickView();
  else if (dom.cartDrawer.classList.contains('open')) closeCartDrawer();
});

/* ---------- 11. Init ---------- */

function init() {
  document.getElementById('footer-year').textContent = new Date().getFullYear();
  loadCart();
  refreshProductGrid();
  renderCart();
}

init();
