// Pruebas de la calculadora de planes de Delta Logística (assets/logistica-calc.js): node tests/logistica.test.js
// Costo mensual = base + max(0, camiones − incluidos) × extra. Básico 30/5/14 · Intermedio 90/15/6 · Avanzado 210/35/2.
// Recomienda el más barato; en empate, el plan mayor. 1–9 → Básico, 10–34 → Intermedio, 35+ → Avanzado.
const C = require('../assets/logistica-calc.js');

let n = 0;
function ok(c, m) { n++; if (!c) { console.error('✗ ' + m); process.exitCode = 1; } }

// ---------- precios de la tabla del dueño
const P = {};
C.PLANES.forEach(p => { P[p.k] = p; });
ok(P.B.base === 30 && P.B.incl === 5 && P.B.extra === 14 && P.B.anual === 300, 'Básico: $30, 5 camiones, $14 extra, $300 al año');
ok(P.I.base === 90 && P.I.incl === 15 && P.I.extra === 6 && P.I.anual === 900, 'Intermedio: $90, 15 camiones, $6 extra, $900 al año');
ok(P.A.base === 210 && P.A.incl === 35 && P.A.extra === 2 && P.A.anual === 2100, 'Avanzado: $210, 35 camiones, $2 extra, $2.100 al año');
ok(C.MIN === 1 && C.MAX === 60, 'rango de 1 a 60 camiones');

// ---------- plan recomendado en todo el rango
for (let c = 1; c <= 60; c++) {
  const esperado = c <= 9 ? 'B' : c <= 34 ? 'I' : 'A';
  const r = C.calcular(c);
  ok(r.mejor.k === esperado, `${c} camiones → ${esperado} (sale ${r.mejor.k})`);
  const min = Math.min.apply(null, r.planes.map(p => p.total));
  ok(r.mejor.total === min, `${c} camiones: el recomendado es el más barato`);
}
for (let c = 61; c <= 200; c += 13) ok(C.calcular(c).mejor.k === 'A', `${c} camiones → Avanzado`);

// ---------- costos exactos en los saltos
function totales(c) { const r = C.calcular(c); const t = {}; r.planes.forEach(p => { t[p.k] = p.total; }); return t; }
const t9 = totales(9), t10 = totales(10), t34 = totales(34), t35 = totales(35);
ok(t9.B === 86 && t9.I === 90 && t9.A === 210, `9 camiones: 86 / 90 / 210 (hay ${JSON.stringify(t9)})`);
ok(t10.B === 100 && t10.I === 90 && t10.A === 210, `10 camiones: 100 / 90 / 210 (hay ${JSON.stringify(t10)})`);
ok(t34.B === 436 && t34.I === 204 && t34.A === 210, `34 camiones: 436 / 204 / 210 (hay ${JSON.stringify(t34)})`);
ok(t35.B === 450 && t35.I === 210 && t35.A === 210, `35 camiones: 450 / 210 / 210 (hay ${JSON.stringify(t35)})`);
ok(C.calcular(35).mejor.k === 'A', '35 camiones: empate Intermedio–Avanzado, gana el plan mayor');
ok(totales(5).B === 30 && C.calcular(5).planes[0].extras === 0, '5 camiones: Básico sin extras, $30');
ok(totales(12).B === 128 && totales(12).I === 90, '12 camiones: Básico $128 e Intermedio $90 (el ejemplo del encargo)');

// ---------- entradas raras
ok(C.calcular(0).camiones === 1 && C.calcular(-4).camiones === 1 && C.calcular('abc').camiones === 1, 'valores menores que 1 o no numéricos cuentan como 1');
ok(C.calcular('12').camiones === 12, 'acepta el número como texto');

if (!process.exitCode) console.log(`✓ logistica: ${n} comprobaciones`);
