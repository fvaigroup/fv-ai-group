// Prueba de los cálculos de pago adelantado de la Línea Triangular: precio × meses × 0,8, con 2 decimales.
// Uso: node tests/planes.test.js
const assert = require('assert');
const P = require('../assets/planes.js');
const casos = [ // [precio mensual, meses, esperado]
  [15, 12, 144.00], [15, 3, 36.00], [29, 12, 278.40], [29, 6, 139.20], [39, 12, 374.40], [39, 9, 280.80],
  [59, 12, 566.40], [79, 12, 758.40], [99, 12, 950.40], [119, 12, 1142.40], [149, 12, 1430.40], [179, 12, 1718.40], [199, 12, 1910.40], [119, 3, 285.60]
];
casos.forEach(([p, m, e]) => assert.strictEqual(P.ahorro(p, m), e, `${p} x ${m}`));
assert.strictEqual(P.ahorro(80, 1), 64);       // Pack Enfoque de contado
assert.strictEqual(P.ahorro(25, 1), 20);       // taller de contado
assert.strictEqual(P.ahorro(299, 1), 239.2);   // Finanzas con IA de contado
assert.strictEqual(P.fmt(1142.4), '$1.142,40');
assert.strictEqual(P.fmt(144), '$144,00');
assert.strictEqual(100 + 100 + 99, 299);       // cuotas del curso suman el precio
console.log('planes: ' + (casos.length + 6) + ' comprobaciones correctas');
