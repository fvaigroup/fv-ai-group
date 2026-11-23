// Pruebas de la calculadora «¿Qué me conviene?» de /triangular/paginas-web: node tests/paginas-web.test.js
// Carga el núcleo real (assets/paginas-web.js, con un DOM mínimo de mentira) y el efecto (assets/paginas-web-conviene.js).
// Plan mensual al mes n = primer pago + mensualidad × (n − 1). Página Propia = precio único (+ mantenimiento × n).
// Precios del encargo: mensual 10/30/70, primer pago 20/60/140, propia 100/300/700, mantenimiento 5/15/35.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

let n = 0;
function ok(c, m) { n++; if (!c) { console.error('✗ ' + m); process.exitCode = 1; } }

// ---------- núcleo window.WEB en un sandbox
const nada = () => {};
const lista = () => [];
const raiz = { querySelectorAll: lista, querySelector: () => null, closest: () => null };
const sandbox = {
  document: { querySelector: s => (s === '[data-web]' ? raiz : null), documentElement: { classList: { add: nada } } },
  matchMedia: () => ({ matches: false }),
  addEventListener: nada,
  setTimeout, clearTimeout
};
sandbox.window = sandbox;
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../assets/paginas-web.js'), 'utf8'), sandbox);
const WEB = sandbox.WEB;
ok(WEB && typeof WEB.mensualAl === 'function', 'el núcleo expone window.WEB');

// ---------- precios exactos del encargo
const P = WEB.precios;
const esperado = {
  basico: { mes: 10, primer: 20, unico: 100, mant: 5 },
  intermedio: { mes: 30, primer: 60, unico: 300, mant: 15 },
  avanzado: { mes: 70, primer: 140, unico: 700, mant: 35 }
};
Object.keys(esperado).forEach(k => {
  const e = esperado[k];
  ok(P.mensual[k].mes === e.mes && P.mensual[k].primer === e.primer, `${k}: mensual $${e.mes}, primer pago $${e.primer}`);
  ok(P.propia[k].unico === e.unico && P.propia[k].mant === e.mant, `${k}: Página Propia $${e.unico}, mantenimiento $${e.mant}`);
});

// ---------- fórmula, contra una cuenta independiente
const C = require('../assets/paginas-web-conviene.js').crear(WEB);
ok(C.MIN === 1 && C.MAX === 36, 'el slider va de 1 a 36 meses');
Object.keys(esperado).forEach(k => {
  const e = esperado[k];
  for (let m = 1; m <= 36; m++) {
    const q = C.punto(k, m, false), qm = C.punto(k, m, true);
    ok(q.mensual === e.primer + e.mes * (m - 1), `${k} mes ${m}: mensual = primer + mes × (n − 1)`);
    ok(q.propia === e.unico, `${k} mes ${m}: Página Propia sin mantenimiento = precio único`);
    ok(qm.propia === e.unico + e.mant * m, `${k} mes ${m}: con mantenimiento = único + mant × n`);
    ok(q.ahorro === q.mensual - q.propia, `${k} mes ${m}: ahorro = mensual − propia`);
  }
  ok(C.serie(k, false).length === 36, `${k}: la serie tiene 36 meses`);
});

// ---------- cruces: igual en el 9 y más barata desde el 10; con mantenimiento, igual en el 18 y desde el 19
Object.keys(esperado).forEach(k => {
  const a = C.cruce(k, false), b = C.cruce(k, true);
  ok(a.igual === 9 && a.desde === 10, `${k}: igual en el mes 9, más barata desde el 10 (sale ${JSON.stringify(a)})`);
  ok(b.igual === 18 && b.desde === 19, `${k} con mantenimiento: igual en el 18, más barata desde el 19 (sale ${JSON.stringify(b)})`);
  ok(C.punto(k, 8, false).ahorro < 0 && C.punto(k, 17, true).ahorro < 0, `${k}: antes del cruce el mensual sale más barato`);
});
ok(C.punto('basico', 9, false).mensual === 100 && C.punto('basico', 10, false).mensual === 110, 'Básico: $100 al mes 9 y $110 al mes 10');
ok(C.punto('basico', 18, true).propia === 190 && C.punto('basico', 18, true).mensual === 190, 'Básico con mantenimiento: $190 los dos en el mes 18');
ok(C.punto('basico', 12, false).mensual === 130, 'Básico: $130 a los 12 meses');
ok(C.punto('avanzado', 36, false).mensual === 2590 && C.punto('avanzado', 36, true).propia === 1960, 'Avanzado a 36 meses: $2.590 mensual, $1.960 propia con mantenimiento');

if (!process.exitCode) console.log(`✓ paginas-web: ${n} comprobaciones`);
