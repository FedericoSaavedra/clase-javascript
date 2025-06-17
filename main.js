// Declaración de constantes
const MAX_DESCUENTO = 80; // No se puede hacer un descuento mayor al 80%

// Declaración de variables
let precioProducto;
let porcentajeDescuento;

// Función que calcula el descuento y retorna el nuevo precio
function calcularDescuento(precio, descuento) {
  return precio - (precio * (descuento / 100));
}

// Función principal
function iniciar() {
  // Ingreso de datos por prompt
  precioProducto = parseFloat(prompt("Ingrese el precio del producto:"));
  porcentajeDescuento = parseInt(prompt("Ingrese el porcentaje de descuento:"));

  // Condicionales
  if (isNaN(precioProducto) || isNaN(porcentajeDescuento)) {
    alert("Por favor ingrese valores numéricos válidos.");
  } else if (porcentajeDescuento > MAX_DESCUENTO) {
    alert("El descuento es demasiado alto. Máximo permitido: " + MAX_DESCUENTO + "%");
  } else {
    // Llamada a la función con parámetros
    const precioFinal = calcularDescuento(precioProducto, porcentajeDescuento);

    // Uso de switch para mensajes personalizados
    switch (true) {
      case (porcentajeDescuento === 0):
        alert("No se aplicó ningún descuento.");
        break;
      case (porcentajeDescuento <= 20):
        alert("Descuento leve aplicado.");
        break;
      case (porcentajeDescuento <= 50):
        alert("¡Buen descuento!");
        break;
      default:
        alert("¡Gran oferta!");
    }

    alert("El precio final con descuento es: $" + precioFinal.toFixed(2));
  }

  // Ejemplo de bucle for
  console.log("Contando del 1 al 5:");
  for (let i = 1; i <= 5; i++) {
    console.log(i);
  }
}
