// Prueba de la calculadora de /club: la línea sale de la pregunta «¿tiene junta directiva y administración propia?» y el plan, del número de socios.
// Los precios vienen de assets/precios-software.js (la misma tabla que usan Condominio, Gym y /software).
// Uso: node tests/club.test.js
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const Club = require('../assets/club.js');
const S = require('../assets/precios-software.js');
let n = 0;
const eq = (a, b, m) => { n++; assert.deepStrictEqual(a, b, m); };
const ok = (c, m) => { n++; assert.ok(c, m); };

// bordes de cada plan, con y sin junta directiva
const SOCIOS = [100, 101, 300, 301, 500, 501, 1000, 1001, 2500, 2501, 5000, 5001];
const CON_JUNTA = { 100: 190, 101: 190, 300: 190, 301: 190, 500: 190, 501: 250, 1000: 250, 1001: 430, 2500: 430, 2501: 740, 5000: 740, 5001: null };
const SIN_JUNTA = { 100: ['tri', 89.99], 101: ['tri', 119.99], 300: ['tri', 119.99], 301: ['tri', 189.99], 500: ['tri', 189.99], 501: ['hex', 250], 1000: ['hex', 250], 1001: ['hex', 430], 2500: ['hex', 430], 2501: ['hex', 740], 5000: ['hex', 740], 5001: ['hex', null] };
SOCIOS.forEach(u => {
  const a = Club.calcular(true, u);
  eq(a.linea, 'hex', 'con junta: Hexagonal con ' + u); eq(a.mensual === undefined ? null : a.mensual, CON_JUNTA[u], 'con junta ' + u); eq(a.aMedida, CON_JUNTA[u] === null);
  const b = Club.calcular(false, u);
  eq([b.linea, b.mensual === undefined ? null : b.mensual], SIN_JUNTA[u], 'sin junta ' + u); eq(b.cambioDeLinea, u > 500);
});

// anual con 30 % menos, costo por socio e implementación (800 socios con junta: Hexagonal hasta 1.000)
const c = Club.calcular(true, 800);
eq([c.mensual, c.anual, c.equivalente, c.ahorro], [250, 2100, 175, 900]);
eq(c.porSocio, 0.31);
eq(c.implementacion, { unico: 300 });
// 100 socios sin junta: Triangular hasta 100
const t = Club.calcular(false, 100);
eq([t.mensual, t.anual, t.equivalente, t.ahorro], [89.99, 755.92, 62.99, 323.96]);
eq(t.porSocio, 0.9);
eq(t.implementacion, { unico: 99.99, cuotas: 2 });
// más de 500 socios sin junta pasa a la Hexagonal y avisa; más de 5.000 es a medida
eq(Club.calcular(false, 600).cambioDeLinea, true);
eq(Club.calcular(true, 6000).implementacion, undefined);
// valores inválidos: el plan más chico
eq(Club.calcular(true, 0).socios, 1); eq(Club.calcular(false, NaN).linea, 'tri');
// el mensaje de WhatsApp nombra producto, línea, tamaño y número de socios
ok(/Club \(mi club tiene 800 socios; Línea Hexagonal, hasta 1\.000 socios, \$250\/mes\)/.test(c.mensaje), c.mensaje);
ok(/Línea Triangular, hasta 100 socios, \$89,99\/mes/.test(t.mensaje), t.mensaje);
ok(/más de 5\.000 socios/.test(Club.calcular(true, 6000).mensaje));

// la página no escribe precios a mano ni usa los nombres viejos de los planes
const html = fs.readFileSync(path.join(__dirname, '..', 'club.html'), 'utf8');
const visible = html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ');
['Esencial', 'Plus', 'Max', 'Premium', 'Club Pro'].forEach(v => ok(!new RegExp('\\b' + v + '\\b').test(visible), '/club no debe mencionar «' + v + '»'));
ok(/id="hexagonal"/.test(html) && /id="triangular"/.test(html), '/club debe tener las anclas #hexagonal y #triangular');
ok(html.indexOf('id="hexagonal"') < html.indexOf('id="triangular"'), 'la Hexagonal va primero');
ok(/Anual <span>\(30 % de descuento\)/.test(html), 'interruptor anual con 30 %');

console.log('club: ' + n + ' comprobaciones correctas');
