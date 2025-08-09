// Cargar catálogo
const catalogo = document.getElementById("catalogo");
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// Función para renderizar productos
function renderProductos(productos) {
  catalogo.innerHTML = "";
  productos.forEach(prod => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <img src="${prod.imagen}" alt="${prod.nombre}" />
      <div class="card-body">
        <h3>${prod.nombre}</h3>
        <p>Precio: $${prod.precio}</p>
        <p>Stock: ${prod.stock}</p>
        <button data-id="${prod.id}">Agregar al carrito</button>
      </div>
    `;

    catalogo.appendChild(card);
  });

  document.querySelectorAll(".card button").forEach(btn => {
    btn.addEventListener("click", agregarAlCarrito);
  });
}

// Agregar producto al carrito
function agregarAlCarrito(e) {
  const id = parseInt(e.target.getAttribute("data-id"));
  const producto = productos.find(p => p.id === id);

  if (producto.stock > 0) {
    const itemEnCarrito = carrito.find(p => p.id === id);
    if (itemEnCarrito) {
      if (itemEnCarrito.cantidad < producto.stock) {
        itemEnCarrito.cantidad++;
      } else {
        Swal.fire("Stock insuficiente", "", "error");
        return;
      }
    } else {
      carrito.push({ ...producto, cantidad: 1 });
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    Swal.fire("Producto agregado", producto.nombre, "success");
  } else {
    Swal.fire("Sin stock disponible", "", "error");
  }
}

// Mostrar carrito
document.getElementById("btnCarrito").addEventListener("click", () => {
  if (carrito.length === 0) {
    Swal.fire("El carrito está vacío", "", "info");
    return;
  }

  let htmlCarrito = carrito.map(item => `
    ${item.nombre} x${item.cantidad} — $${(item.precio * item.cantidad).toFixed(2)}
  `).join("<br>");

  Swal.fire({
    title: "Tu carrito",
    html: htmlCarrito,
    confirmButtonText: "Finalizar compra"
  }).then(res => {
    if (res.isConfirmed) {
      finalizarCompra();
    }
  });
});

function finalizarCompra() {
  carrito = [];
  localStorage.removeItem("carrito");
  Swal.fire("Compra realizada con éxito", "", "success");
}

// Fetch del JSON
let productos = [];
fetch("data/productos.json")
  .then(res => res.json())
  .then(data => {
    productos = data;
    renderProductos(productos);
  })
  .catch(err => console.error("Error al cargar productos:", err));


