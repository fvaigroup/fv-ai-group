// Prueba de los precios de las apps de software (Club, Condominio y Gym): una sola tabla, assets/precios-software.js.
//  - ⬡ Hexagonal: precios redondos (múltiplos de 10). ▲ Triangular: precios en ,99.
//  - Descuento único: 30 % por 12 meses por adelantado (mensual × 12 × 0,70); Hexagonal al entero, Triangular a 2 decimales.
//  - Bordes de cada plan y recomendación (100, 101, 300, 301, 500, 501, 1.000, 1.001, 2.500, 2.501, 5.000, 5.001).
//  - Las páginas leen de la misma fuente: el HTML de los planes de cada página es exactamente el que genera la tabla.
// Uso: node tests/software.test.js [--final]   (--final exige que existan /club, /condominio y /gym)
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const S = require('../assets/precios-software.js');
const RAIZ = path.join(__dirname, '..');
let n = 0;
const ok = (c, m) => { n++; assert.ok(c, m); };
const eq = (a, b, m) => { n++; assert.deepStrictEqual(a, b, m); };

// ---------- tablas ----------
eq(S.HEX.map(p => p.mensual), [190, 250, 430, 740], 'Hexagonal: 190, 250, 430, 740');
eq(S.HEX.map(p => p.hasta), [500, 1000, 2500, 5000]);
eq(S.TRI.map(p => p.mensual), [89.99, 119.99, 189.99], 'Triangular: 89,99, 119,99, 189,99');
eq(S.TRI.map(p => p.hasta), [100, 300, 500]);
S.HEX.forEach(p => ok(p.mensual % 10 === 0, 'Hexagonal múltiplo de 10: ' + p.mensual));
S.TRI.forEach(p => ok(Math.round((p.mensual % 1) * 100) === 99, 'Triangular termina en ,99: ' + p.mensual));
eq(S.IMPLEMENTACION.hex.map(p => p.unico), [300, 500]);
S.IMPLEMENTACION.hex.forEach(p => ok(p.unico % 10 === 0));
eq(S.IMPLEMENTACION.tri, { unico: 99.99, cuotas: 2 });
eq(S.desde('hex'), 190); eq(S.desde('tri'), 89.99);

// ---------- descuento anual ----------
eq([190, 250, 430, 740].map(m => S.anual('hex', m)), [1596, 2100, 3612, 6216]);
eq([89.99, 119.99, 189.99].map(m => S.anual('tri', m)), [755.92, 1007.92, 1595.92]);
eq([89.99, 119.99, 189.99].map(m => S.equivalenteMensual('tri', m)), [62.99, 83.99, 132.99]);
eq([190, 250].map(m => S.ahorroAnual('hex', m)), [684, 900]);
eq(S.ahorroAnual('tri', 89.99), 323.96);
ok(Number.isInteger(S.anual('hex', 430)) && Number.isInteger(S.equivalenteMensual('hex', 430)), 'Hexagonal siempre al entero');
eq(S.fmtPrecio('hex', 1596), '$1.596'); eq(S.fmtPrecio('tri', 1007.92), '$1.007,92'); eq(S.fmtPrecio('tri', 89.99), '$89,99');

// ---------- bordes de cada plan ----------
const BORDES_HEX = [[1, 190], [100, 190], [101, 190], [300, 190], [301, 190], [500, 190], [501, 250], [1000, 250], [1001, 430], [2500, 430], [2501, 740], [5000, 740], [5001, null]];
BORDES_HEX.forEach(([u, precio]) => { const p = S.planPara('hex', u); eq(p ? p.mensual : null, precio, 'Hexagonal con ' + u); });
const BORDES_TRI = [[1, 89.99], [100, 89.99], [101, 119.99], [300, 119.99], [301, 189.99], [500, 189.99], [501, null], [1000, null]];
BORDES_TRI.forEach(([u, precio]) => { const p = S.planPara('tri', u); eq(p ? p.mensual : null, precio, 'Triangular con ' + u); });
eq(S.implementacion('hex', 1000), { unico: 300 }); eq(S.implementacion('hex', 1001), { unico: 500 }); eq(S.implementacion('hex', 5000), { unico: 500 }); eq(S.implementacion('hex', 5001), null);
eq(S.implementacion('tri', 500), { unico: 99.99, cuotas: 2 }); eq(S.implementacion('tri', 501), null);
// los planes cubren de 1 usuario hasta el tope sin huecos ni solapes
['hex', 'tri'].forEach(l => { const ps = S.planes(l); eq(ps[0].desde, 1); for (let i = 1; i < ps.length; i++) eq(ps[i].desde, ps[i - 1].hasta + 1); });

// ---------- recomendación de la calculadora (con o sin junta directiva) ----------
const USUARIOS = [100, 101, 300, 301, 500, 501, 1000, 1001, 2500, 2501, 5000, 5001];
const ESPERADO_CON_JUNTA = { 100: 190, 101: 190, 300: 190, 301: 190, 500: 190, 501: 250, 1000: 250, 1001: 430, 2500: 430, 2501: 740, 5000: 740, 5001: null };
const ESPERADO_SIN_JUNTA = { 100: ['tri', 89.99], 101: ['tri', 119.99], 300: ['tri', 119.99], 301: ['tri', 189.99], 500: ['tri', 189.99], 501: ['hex', 250], 1000: ['hex', 250], 1001: ['hex', 430], 2500: ['hex', 430], 2501: ['hex', 740], 5000: ['hex', 740], 5001: ['hex', null] };
USUARIOS.forEach(u => {
  const a = S.recomendar(true, u); eq(a.linea, 'hex'); eq(a.plan ? a.plan.mensual : null, ESPERADO_CON_JUNTA[u], 'con junta, ' + u); eq(a.aMedida, ESPERADO_CON_JUNTA[u] === null);
  const b = S.recomendar(false, u); eq([b.linea, b.plan ? b.plan.mensual : null], ESPERADO_SIN_JUNTA[u], 'sin junta, ' + u); eq(b.cambioDeLinea, u > 500);
});

// ---------- costo por usuario con el plan lleno ----------
eq(S.costoPorUsuario('hex', 500), 0.38); eq(S.costoPorUsuario('hex', 5000), 0.15); eq(S.costoPorUsuario('tri', 100), 0.9); eq(S.costoPorUsuario('tri', 500), 0.38);

// ---------- mensajes de WhatsApp: producto, línea y tamaño ----------
eq(S.mensaje('hex', 'club', S.planPara('hex', 500), 'mensual'), 'Hola F&V, quiero Club (Línea Hexagonal, hasta 500 socios, $190/mes). ¿Podemos conversar?');
eq(S.mensaje('tri', 'gym', S.planPara('tri', 100), 'mensual'), 'Hola F&V, quiero Gym (Línea Triangular, hasta 100 miembros, $89,99/mes). ¿Cómo pago?');
ok(/pago anual por adelantado, \$1\.596 \(30 % menos\)/.test(S.mensaje('hex', 'condominio', S.planPara('hex', 500), 'anual')));
ok(/más de 5\.000 unidades/.test(S.mensaje('hex', 'condominio', null)));

// ---------- las páginas leen la misma fuente ----------
const FINAL = process.argv.includes('--final');
const PAGINAS = { software: null, club: 'club', condominio: 'condominio', gym: 'gym' };
Object.entries(PAGINAS).forEach(([pag, prod]) => {
  const f = path.join(RAIZ, pag + '.html');
  if (!fs.existsSync(f)) { ok(!FINAL, pag + '.html debe existir'); return; }
  const html = fs.readFileSync(f, 'utf8');
  if (!FINAL && prod && !/sw-planes/.test(html)) return;   // página todavía sin migrar a la tabla compartida (Fases 5 a 7)
  ok(/assets\/precios-software\.js/.test(html), pag + '.html carga assets/precios-software.js');
  if (!prod) return;
  ['hex', 'tri'].forEach(l => {
    const m = html.match(new RegExp('<!-- sw-planes:' + l + ' -->([\\s\\S]*?)<!-- /sw-planes:' + l + ' -->'));
    ok(m, pag + '.html debe tener el bloque de planes ' + l);
    if (m) eq(m[1].trim(), S.planesHTML(l, prod), pag + '.html: el bloque de planes ' + l + ' no coincide con la tabla (ejecuta node scripts/render-planes.js)');
  });
  // ningún precio de plan escrito a mano fuera de los bloques generados
  const fuera = html.replace(/<section id="calculadora"[\s\S]*?<\/section>/g, '').replace(/<!-- sw-planes:(hex|tri) -->[\s\S]*?<!-- \/sw-planes:\1 -->/g, '').replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');
  ['$89,99', '$119,99', '$189,99', '$190', '$430', '$740'].forEach(pr => ok(fuera.indexOf(pr) === -1 || /desde\s*\$/.test(fuera), pag + '.html: el precio ' + pr + ' debe salir de la tabla'));
});

console.log('software: ' + n + ' comprobaciones correctas');
