// Pruebas de la calculadora de la brecha (assets/brecha.js): node tests/brecha.test.js
// Cálculo puro: 10.000 Bs., tasa del cobro 100 y tasa de la compra 110 -> 9,09 dólares y 9,09 %. Si la tasa de la compra no sube, no hay pérdida.
const fs = require('fs');
const path = require('path');
const B = require('../assets/brecha.js');

let n = 0;
function ok(c, m) { n++; if (!c) { console.error('✗ ' + m); process.exitCode = 1; } }

// ---------- parsear
ok(B.parsear('10000') === 10000, 'parsear «10000»');
ok(B.parsear('10.000') === 10000, 'parsear «10.000» (puntos de miles)');
ok(B.parsear('10.000,50') === 10000.5, 'parsear «10.000,50»');
ok(B.parsear('10000.5') === 10000.5, 'parsear «10000.5»');
ok(B.parsear('100,5') === 100.5, 'parsear «100,5»');
ok(B.parsear(' 1 000,25 ') === 1000.25, 'parsear con espacios');
['', '   ', '0', '0,00', '-5', 'abc', '10 Bs', '1.2.3', '1,2,3', null, undefined, '--', ','].forEach(x => ok(B.parsear(x) === null, `parsear rechaza ${JSON.stringify(x)}`));

// ---------- formato venezolano
ok(B.formato(9.0909) === '9,09', 'formato 9,09');
ok(B.formato(1234.5) === '1.234,50', 'formato 1.234,50');
ok(B.formato(1234567.891) === '1.234.567,89', 'formato con millones');
ok(B.formato(0) === '0,00', 'formato cero');
ok(B.formato(0.005) === '0,01', 'formato redondea a 2 decimales');

// ---------- caso con pérdida (el del encargo)
const r = B.calcular(10000, 100, 110);
ok(Math.abs(r.siCambiaba - 100) < 1e-9, 'si hubiera cambiado el día del cobro: 100 dólares');
ok(Math.abs(r.recibio - 90.9090909) < 1e-6, 'recibió 90,91 dólares');
ok(B.formato(r.diferencia) === '9,09', `diferencia 9,09 dólares (hay ${B.formato(r.diferencia)})`);
ok(B.formato(r.porcentaje) === '9,09', `porcentaje 9,09 (hay ${B.formato(r.porcentaje)})`);
ok(r.perdio === true, 'hay pérdida cuando la tasa de la compra es mayor');

// ---------- sin pérdida: tasa2 <= tasa1
const igual = B.calcular(10000, 100, 100);
ok(igual.perdio === false && igual.diferencia === 0 && igual.porcentaje === 0, 'tasas iguales: sin pérdida');
const baja = B.calcular(10000, 110, 100);
ok(baja.perdio === false && baja.diferencia < 0, 'tasa de la compra menor: sin pérdida (la diferencia sale negativa y no se muestra como pérdida)');

// ---------- la página trae la sección y los textos fijos, sin «$»
const RAIZ = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8').replace(/\r\n/g, '\n');
const sec = (html.match(/<section id="brecha"[\s\S]*?<\/section>/) || [''])[0];
ok(sec.includes('data-sin-precios-excepcion="brecha"'), 'la sección lleva data-sin-precios-excepcion="brecha"');
['LA PLATA QUE SE PIERDE ESPERANDO', '¿Cuánto se le va entre que cobra y cambia?', 'Si cobra en bolívares hoy y compra dólares días después, la diferencia de tasa se come parte de su ganancia. Calcúlelo con sus números.', 'Monto que cobró en bolívares', 'Tasa del día en que cobró', 'Tasa del día en que compró los dólares', 'Cálculo ilustrativo con las tasas que usted ingresó. No es asesoría financiera.'].forEach(t => ok(sec.includes(t), `la sección trae «${t}»`));
ok((sec.match(/inputmode="decimal"/g) || []).length === 3, 'tres campos con teclado numérico (inputmode="decimal")');
ok((sec.match(/<label for="brecha-(monto|t1|t2)">/g) || []).length === 3, 'cada campo tiene su label visible');
ok(!/\$|Bs\./.test(sec), 'los textos fijos de la sección usan «dólares» y «bolívares» en palabras (sin «$» ni «Bs.»)');
ok(html.indexOf('id="caos-tablero"') < html.indexOf('id="brecha"') && html.indexOf('id="brecha"') < html.indexOf('id="delta-app"'), 'la calculadora va entre «Del caos al tablero» y la franja Delta App');
ok(html.indexOf('/assets/bcv.js') > -1 && html.indexOf('/assets/bcv.js') < html.indexOf('/assets/brecha.js'), 'bcv.js se carga antes que brecha.js (reusa la tasa que el sitio ya obtiene)');
const js = fs.readFileSync(path.join(RAIZ, 'assets/brecha.js'), 'utf8');
ok(!/localStorage|sessionStorage|document\.cookie|fetch\(|XMLHttpRequest/.test(js), 'brecha.js no guarda datos ni llama a otra API');
ok(/inicio_brecha_calculo/.test(js) && /inicio_brecha_whatsapp/.test(js), 'eventos inicio_brecha_calculo e inicio_brecha_whatsapp');
ok(/Se le fueron /.test(js) && /solo por esperar\./.test(js) && /Esta vez no perdió por la tasa\. ¿Siempre es así\?/.test(js), 'textos del resultado');
ok(/Hola F&V, usé la calculadora de la web: se me fueron /.test(js) && /esperando para cambiar\. Quiero ordenar eso\./.test(js), 'mensaje de WhatsApp del resultado con pérdida');

console.log(`brecha: ${n} comprobaciones${process.exitCode ? ' (CON FALLAS)' : ' correctas'}`);
