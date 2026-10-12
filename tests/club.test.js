// Prueba de los cálculos de la página /club (planes, precio anual, plan recomendado y estimaciones).
// Uso: node tests/club.test.js
const assert = require('assert');
const C = require('../assets/club.js');

// Anual = mensual × 12 × 0,70, con 2 decimales
const anual = { esencial: 1671.60, plus: 2931.60, pro: 4611.60, max: 6711.60 };
C.PLANES.forEach(p => assert.strictEqual(C.anual(p.mensual), anual[p.id], 'anual ' + p.id));
const equiv = { esencial: 139.30, plus: 244.30, pro: 384.30, max: 559.30 };
C.PLANES.forEach(p => assert.strictEqual(C.equivalenteMensual(p.mensual), equiv[p.id], 'equivalente ' + p.id));
const ahorro = { esencial: 716.40, plus: 1256.40, pro: 1976.40, max: 2876.40 };
C.PLANES.forEach(p => assert.strictEqual(C.ahorroAnual(p.mensual), ahorro[p.id], 'ahorro ' + p.id));
assert.strictEqual(C.fmt(1671.6), '$1.671,60');
assert.strictEqual(C.fmt(139.3), '$139,30');
assert.strictEqual(C.fmt(6711.6), '$6.711,60');

// Plan recomendado en los límites de cada plan
const casos = [[1, 'esencial'], [50, 'esencial'], [300, 'esencial'], [301, 'plus'], [1000, 'plus'], [1001, 'pro'], [2500, 'pro'], [2501, 'max'], [5000, 'max'], [5001, 'a-medida'], [12000, 'a-medida']];
casos.forEach(([n, id]) => assert.strictEqual(C.planPara(n).id, id, n + ' socios'));
assert.strictEqual(C.planPara('800').id, 'plus');
assert.strictEqual(C.planPara(0).id, 'esencial');   // valor vacío o inválido: el plan más chico
assert.strictEqual(C.planPara(NaN).id, 'esencial');

// Costo por socio con el plan lleno: lo que dice la tarjeta de cada plan
const porSocio = { esencial: 0.66, plus: 0.35, pro: 0.22, max: 0.16 };
C.PLANES.forEach(p => assert.strictEqual(C.costoPorSocio(p, p.max), porSocio[p.id], 'por socio ' + p.id));
assert.strictEqual(C.costoPorSocio(C.A_MEDIDA, 6000), null);

// Horas de cobranza ahorradas: 2 minutos por socio al mes, redondeadas a la hora
assert.strictEqual(C.horasAhorradas(300), 10);
assert.strictEqual(C.horasAhorradas(800), 27);
assert.strictEqual(C.horasAhorradas(2000), 67);
assert.strictEqual(C.horasAhorradas(0), 0);

// Los planes cubren de 1 a 5.000 socios sin huecos ni solapes
for (let i = 1; i < C.PLANES.length; i++) assert.strictEqual(C.PLANES[i].min, C.PLANES[i - 1].max + 1);
assert.strictEqual(C.PLANES[0].min, 1);
assert.strictEqual(C.A_MEDIDA.min, C.PLANES[C.PLANES.length - 1].max + 1);

console.log('club: ' + (C.PLANES.length * 3 + 3 + casos.length + 2 + C.PLANES.length + 5 + 4 + C.PLANES.length) + ' comprobaciones correctas');
