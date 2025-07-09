// Array para guardar productos
let productos = JSON.parse(localStorage.getItem("productos")) || [];

// DOM
const form = document.getElementById("formProducto");
const lista = document.getElementById("listaProductos");

// Evento: agregar producto
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const precio = parseFloat(document.getElementById("precio").value);

  if (nombre === "" || isNaN(precio)) return;

  const producto = { id: Date.now(), nombre, precio };
  productos.push(producto);
  localStorage.setItem("productos", JSON.stringify(productos));

  form.reset();
  renderProductos();
});

// Mostrar productos en el DOM
function renderProductos() {
  lista.innerHTML = "";

  if (productos.length === 0) {
    lista.innerHTML = "<p>No hay productos agregados.</p>";
    return;
  }

  productos.forEach(p => {
    const div = document.createElement("div");
    div.innerHTML = `<strong>${p.nombre}</strong>: $${p.precio.toFixed(2)} <button onclick="eliminarProducto(${p.id})">Eliminar</button>`;
    lista.appendChild(div);
  });
}

// Eliminar producto
function eliminarProducto(id) {
  productos = productos.filter(p => p.id !== id);
  localStorage.setItem("productos", JSON.stringify(productos));
  renderProductos();
}

// Al cargar la página
renderProductos();
