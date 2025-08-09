// app.js (module)
const API_PRODUCTS = '/data/products.json'; // archivo JSON local (se carga asíncronamente)
const $catalog = document.getElementById('catalog');
const $cartCount = document.getElementById('cart-count');
const $btnOpenCart = document.getElementById('btn-open-cart');
const $cartPanel = document.getElementById('cart-panel');
const $cartItems = document.getElementById('cart-items');
const $cartTotal = document.getElementById('cart-total');
const $btnCloseCart = document.getElementById('btn-close-cart');
const $btnCheckout = document.getElementById('btn-checkout');

const $checkoutModal = document.getElementById('checkout-modal');
const $checkoutForm = document.getElementById('checkout-form');
const $btnCancelCheckout = document.getElementById('btn-cancel-checkout');

// ----------------- MODELO: objeto carrito -----------------
/*
  CartItem { productId, title, price, qty, img }
  cart: Array<CartItem>
*/
const cartKey = 'miStore_cart_v1';

const Cart = {
  items: [],
  load() {
    const raw = localStorage.getItem(cartKey);
    this.items = raw ? JSON.parse(raw) : [];
    this.syncUI();
  },
  save() {
    localStorage.setItem(cartKey, JSON.stringify(this.items));
    this.syncUI();
  },
  add(product, qty = 1) {
    const idx = this.items.findIndex(i => i.productId === product.id);
    if (idx >= 0) {
      this.items[idx].qty = Math.min(product.stock, this.items[idx].qty + qty);
    } else {
      this.items.push({
        productId: product.id,
        title: product.title,
        price: product.price,
        qty: Math.min(product.stock, qty),
        img: product.img
      });
    }
    this.save();
    Swal.fire({icon:'success',title:'Agregado al carrito',text:product.title,toast:true,position:'top-end',timer:1200,showConfirmButton:false});
  },
  remove(productId) {
    this.items = this.items.filter(i => i.productId !== productId);
    this.save();
  },
  updateQty(productId, qty) {
    const item = this.items.find(i => i.productId === productId);
    if (!item) return;
    item.qty = Math.max(1, qty);
    this.save();
  },
  clear() {
    this.items = [];
    this.save();
  },
  total() {
    return this.items.reduce((s,i) => s + i.price * i.qty, 0);
  },
  count() {
    return this.items.reduce((s,i) => s + i.qty, 0);
  },
  syncUI() {
    $cartCount.textContent = this.count();
    renderCartItems();
    $cartTotal.textContent = (this.total()/100).toFixed(2);
  }
};

// ----------------- CARGA ASÍNCRONA DE PRODUCTOS -----------------
/*
  fetch JSON local (simulado como datos remotos)
*/
async function fetchProducts() {
  try {
    const res = await fetch(API_PRODUCTS);
    if (!res.ok) throw new Error('Error al cargar catálogo');
    const products = await res.json();
    return products;
  } catch (err) {
    // Mensaje amigable para el usuario
    await Swal.fire({icon:'error',title:'No se pudo cargar el catálogo',text:err.message});
    return [];
  }
}

// ----------------- RENDERIZADO DINÁMICO -----------------
function createProductCard(product) {
  const div = document.createElement('article');
  div.className = 'product';
  div.innerHTML = `
    <img src="${product.img}" alt="${escapeHtml(product.title)}" loading="lazy" />
    <h4>${escapeHtml(product.title)}</h4>
    <p class="desc">${escapeHtml(product.description)}</p>
    <p class="price">$${(product.price/100).toFixed(2)}</p>
    <div class="actions">
      <input type="number" min="1" max="${product.stock}" value="1" aria-label="cantidad" style="width:70px;padding:.35rem;border:1px solid #ddd;border-radius:6px"/>
      <button class="primary add-btn">Agregar</button>
      <button class="link details-btn">Detalle</button>
    </div>
  `;

  const qtyInput = div.querySelector('input');
  const addBtn = div.querySelector('.add-btn');
  const detailsBtn = div.querySelector('.details-btn');

  addBtn.addEventListener('click', () => {
    const qty = Math.max(1, Math.min(product.stock, Number(qtyInput.value)));
    Cart.add(product, qty);
  });

  detailsBtn.addEventListener('click', () => {
    Swal.fire({title:product.title, html:`<strong>Precio:</strong> $${(product.price/100).toFixed(2)}<br><p>${escapeHtml(product.description)}</p>`});
  });

  return div;
}

function renderCatalog(products) {
  $catalog.innerHTML = '';
  products.forEach(p => $catalog.appendChild(createProductCard(p)));
}

function renderCartItems() {
  $cartItems.innerHTML = '';
  if (Cart.items.length === 0) {
    $cartItems.innerHTML = '<p>El carrito está vacío.</p>';
    return;
  }
  Cart.items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${item.img}" alt="${escapeHtml(item.title)}"/>
      <div style="flex:1">
        <div><strong>${escapeHtml(item.title)}</strong></div>
        <div>$${(item.price/100).toFixed(2)}</div>
        <div>
          <input data-id="${item.productId}" class="cart-qty" type="number" min="1" value="${item.qty}" style="width:60px;padding:.25rem;border:1px solid #ddd;border-radius:6px"/>
          <button data-id="${item.productId}" class="link remove-btn">Eliminar</button>
        </div>
      </div>
    `;
    $cartItems.appendChild(div);
  });

  // event delegation para inputs y botones
  $cartItems.querySelectorAll('.cart-qty').forEach(inp => {
    inp.addEventListener('change', (e) => {
      const id = e.target.dataset.id;
      const val = Math.max(1, Number(e.target.value));
      Cart.updateQty(id, val);
    });
  });
  $cartItems.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      Cart.remove(id);
      Swal.fire({icon:'info',title:'Eliminado',toast:true,position:'top-end',timer:900,showConfirmButton:false});
    });
  });
}

// ----------------- EVENTOS UI -----------------
$btnOpenCart.addEventListener('click', () => {
  $cartPanel.classList.toggle('hidden');
});
$btnCloseCart.addEventListener('click', () => $cartPanel.classList.add('hidden'));
$btnCheckout.addEventListener('click', () => openCheckoutModal());

// Checkout modal controls
function openCheckoutModal() {
  if (Cart.items.length === 0) {
    Swal.fire({icon:'warning',title:'Carrito vacío',text:'Agrega productos antes de finalizar.'});
    return;
  }
  // precarga datos en formulario (requisito sugerido)
  document.getElementById('input-name').value = 'Juan Pérez';
  document.getElementById('input-email').value = 'juan.perez@email.com';
  document.getElementById('input-address').value = 'Av. Principal 123';
  document.getElementById('input-payment').value = 'tarjeta';

  $checkoutModal.classList.remove('hidden');
}

$btnCancelCheckout.addEventListener('click', () => $checkoutModal.classList.add('hidden'));

$checkoutForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  // Simula lógica de negocio: validaciones y procesamiento del pago
  const formData = new FormData($checkoutForm);
  const order = {
    buyer: {
      name: formData.get('name'),
      email: formData.get('email'),
      address: formData.get('address'),
      payment: formData.get('payment')
    },
    items: Cart.items.slice(),
    total: Cart.total()
  };

  // Validación simple
  if (!order.buyer.name || !order.buyer.email) {
    await Swal.fire({icon:'error',title:'Faltan datos',text:'Completa nombre y email.'});
    return;
  }

  // Simular "procesamiento" asincrónico (ejemplo de uso de promesas)
  try {
    await Swal.fire({title:'Procesando pago...',didOpen:()=>Swal.showLoading(),allowOutsideClick:false});
    await fakeNetworkCall(order); // función que simula demora
    // Confirmación final
    await Swal.fire({
      icon: 'success',
      title: 'Compra exitosa',
      html: `Gracias ${escapeHtml(order.buyer.name)}. <br> Total: $${(order.total/100).toFixed(2)}.`,
    });
    Cart.clear();
    $checkoutModal.classList.add('hidden');
  } catch (err) {
    await Swal.fire({icon:'error',title:'Error',text:err.message});
  }
});

// ----------------- utilidades y pseudo red -----------------
function escapeHtml(str){ return String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

// Simula llamada de red (promise-based)
function fakeNetworkCall(payload){
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // simulamos éxito el 95% de las veces
      Math.random() < 0.95 ? resolve({ok:true, id: Date.now()}) : reject(new Error('Fallo en procesamiento (simulado)'));
    }, 900);
  });
}

// ----------------- Inicialización -----------------
async function init() {
  Cart.load();
  const products = await fetchProducts();
  renderCatalog(products);
}

init();

