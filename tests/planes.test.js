// Prueba de los cálculos de pago adelantado: hay UN solo descuento, 30 % por pagar 12 meses de un plan mensual (precio × 12 × 0,70).
// Línea Triangular: 2 decimales. Línea Hexagonal: redondeado al entero.
// Uso: node tests/planes.test.js
const assert = require('assert');
const P = require('../assets/planes.js');
const triangular = [ // [precio mensual, anual esperado]
  [14.99, 125.92], [29.99, 251.92], [39.99, 335.92], [59.99, 503.92], [79.99, 671.92], [99.99, 839.92],
  [119.99, 1007.92], [149.99, 1259.92], [179.99, 1511.92], [199.99, 1679.92]
];
triangular.forEach(([m, e]) => assert.strictEqual(P.anual(m), e, 'anual ' + m));
const hexagonal = [[190, 1596], [250, 2100], [430, 3612], [740, 6216]];
hexagonal.forEach(([m, e]) => assert.strictEqual(P.anualEntero(m), e, 'anual hex ' + m));
assert.strictEqual(P.DESCUENTO, 0.30);
assert.strictEqual(P.FACTOR, 0.70);
assert.strictEqual(P.fmt(1007.92), '$1.007,92');
assert.strictEqual(P.fmt(335.92), '$335,92');
assert.strictEqual(P.fmtEntero(2100), '$2.100');
assert.strictEqual(P.fmtEntero(6216), '$6.216');
assert.strictEqual(P.ahorro, undefined);            // ya no existe el descuento de 20 % por 3, 6, 9 meses ni de contado
assert.strictEqual(Math.round((100 + 100 + 99.99) * 100) / 100, 299.99);   // cuotas del curso suman el precio
assert.strictEqual(Math.round((40 + 39.99) * 100) / 100, 79.99);           // 2 cuotas del Pack Enfoque suman el precio
console.log('planes: ' + (triangular.length + hexagonal.length + 9) + ' comprobaciones correctas');
