// Prueba del formato de precios de todo el sitio.
//  - Línea Triangular: todo precio termina en ,99 (salvo las cuotas del curso: $100,00, y las de 2 cuotas del Pack Enfoque: $40,00).
//  - Línea Hexagonal: todo precio es un número redondo (múltiplo de 10).
//  - Los totales del pago adelantado (12 meses, 30 %) se calculan con assets/planes.js.
//  - No queda ninguna mención a la regla vieja (líneas por precio) ni al descuento viejo de 20 %.
// Uso: node tests/precios.test.js        (estricto; --parcial omite lo que dependía de las últimas fases)
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const P = require('../assets/planes.js');
const RAIZ = path.join(__dirname, '..');
const leer = f => fs.readFileSync(path.join(RAIZ, f), 'utf8');

// ---------- precios válidos ----------
const TRI_MENSUAL = [14.99, 29.99, 39.99, 59.99, 79.99, 89.99, 99.99, 119.99, 149.99, 179.99, 189.99, 199.99]; // incluye las apps de software (Club, Condominio, Gym)
const TRI_UNICO = [4.99, 24.99, 29.99, 79.99, 299.99];
const TRI = new Set([...TRI_MENSUAL, ...TRI_UNICO]);
const CUOTAS = new Set([100, 40, 99.99, 39.99]);               // cuotas del curso y del Pack Enfoque
const OTROS = new Set([44.98, 12]);                            // «por separado» del Plan Arranque (29,99 + 14,99) y dominio (~$12 al año)
const ANUALES = new Set(TRI_MENSUAL.map(P.anual));             // totales de 12 meses con 30 % menos
const num = tok => parseFloat(tok.replace(/^\$/, '').replace(/\.$/, '').replace(/\./g, '').replace(',', '.'));
const esTri = n => TRI.has(n) || CUOTAS.has(n) || OTROS.has(n) || ANUALES.has(n);
const esHex = n => Number.isInteger(n) && n % 10 === 0;
const TOKEN = /\$\d[\d.]*(?:,\d+)?/g;

let comprobaciones = 0;
function ok(cond, msg) { comprobaciones++; assert.ok(cond, msg); }

// texto visible: sin scripts ni estilos ni JSON-LD
function visible(html) { return html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' '); }

// ---------- 1) Páginas de la Línea Triangular y mixtas: cada precio de producto ----------
const MIXTAS = ['index.html', 'software.html', 'club.html', 'condominio.html', 'gym.html', 'triangular.html', 'paginas-web.html', 'cursos.html', 'curso-finanzas-ia.html', 'masterclasses-workshops.html', 'contacto.html', 'nosotros.html'];
MIXTAS.forEach(f => {
  const html = leer(f);
  // atributos de precio
  for (const m of html.matchAll(/data-precio="([\d.]+)"/g)) { const n = parseFloat(m[1]); ok(TRI.has(n) || esHex(n), f + ' data-precio ' + m[1]); }
  for (const m of html.matchAll(/data-bs-line[^>]*data-usd="([\d.]+)"/g)) { const n = parseFloat(m[1]); ok(TRI.has(n) || esHex(n), f + ' data-usd ' + m[1]); }
  // pestañas de tamaño: «$14,99/mes»
  for (const m of html.matchAll(/class="tam-precio">(\$[\d.,]+)/g)) ok(esTri(num(m[1])), f + ' tam-precio ' + m[1]);
  // textos de WhatsApp: cada precio nombrado en el mensaje
  for (const m of html.matchAll(/https:\/\/wa\.me\/\d+\?text=([^"'\s]+)/g)) {
    let t = ''; try { t = decodeURIComponent(m[1]); } catch (e) { continue; }
    for (const k of t.match(TOKEN) || []) { const n = num(k); ok(esTri(n) || esHex(n), f + ' WhatsApp ' + k + ' en «' + t.slice(0, 70) + '»'); }
  }
  // JSON-LD
  for (const m of html.matchAll(/"price":\s*"([\d.]+)"/g)) { const n = parseFloat(m[1]); ok(TRI.has(n) || esHex(n), f + ' JSON-LD price ' + m[1]); }
  // totales de 12 meses con 30 % menos: cada uno corresponde al precio de su panel
  for (const m of html.matchAll(/data-ahorro="12">(\$[\d.,]+)</g)) {
    const antes = html.slice(0, m.index); const i = antes.lastIndexOf('data-precio="');
    const precio = parseFloat(antes.slice(i + 13, antes.indexOf('"', i + 13)));
    ok(num(m[1]) === P.anual(precio), f + ' total anual ' + m[1] + ' de ' + precio);
  }
});

// ---------- 2) Asistentes y datos: Luci, buscador, eventos ----------
['assets/luci.js', 'assets/search.js'].forEach(f => {
  const js = leer(f);
  for (const k of js.match(TOKEN) || []) { const n = num(k); ok(esTri(n) || esHex(n) || [5].includes(n), f + ' ' + k); }
});
(function eventos() {
  const js = leer('assets/eventos.js');
  ok(/precio: 24\.99,/.test(js) && /precio: 299\.99,/.test(js) && /cuotas: \[100, 100, 99\.99\]/.test(js), 'eventos.js: precios del taller y del curso');
  ok(!/precioContado/.test(js), 'eventos.js: ya no hay precio de contado con descuento');
})();

// ---------- 3) Tabla exacta de la Línea Triangular (pedida por el dueño) ----------
const tri = leer('triangular.html');
const esperados = { 'plan-arranque': 39.99, 'presencia-basico': 14.99, 'presencia-catalogo': 29.99, 'presencia-web': 59.99, 'presencia-tienda': 99.99,
  'caja-clara-caja': 14.99, 'caja-clara-cobros': 29.99, 'caja-clara-admin': 39.99, 'tablero-ejecutivo-pyme': 79.99, 'tablero-ejecutivo-pro': 149.99,
  'asistente-ia-whatsapp': 119.99, 'asistente-ia-instagram': 179.99, 'asesor-sesion': 29.99, 'asesor-enfoque': 79.99, 'asesor-mensual': 119.99, 'asesor-pro': 199.99 };
const usados = new Set([...tri.matchAll(/data-precio="([\d.]+)"/g)].map(m => parseFloat(m[1])));
Object.entries(esperados).forEach(([id, precio]) => ok(usados.has(precio), 'triangular.html debe tener ' + precio + ' (' + id + ')'));
ok(/Mis Finanzas Claras/.test(tri) && /\$4,99/.test(tri), 'Mis Finanzas Claras $4,99');
ok(/\$24,99/.test(tri) && /\$299,99/.test(tri), 'Taller $24,99 y Finanzas con IA $299,99');
ok(/\$100,00, \$100,00 y \$99,99/.test(tri), 'cuotas del curso $100,00 + $100,00 + $99,99');

// ---------- 4) Hexagonal: precios redondos ----------
const hex = leer('hexagonal.html');
for (const k of visible(hex).match(TOKEN) || []) ok(esHex(num(k)), 'hexagonal.html ' + k + ' debe ser múltiplo de 10');
for (const m of hex.matchAll(/"price":\s*"([\d.]+)"/g)) ok(esHex(parseFloat(m[1])), 'hexagonal.html JSON-LD ' + m[1]);

// ---------- 5) Nada de la regla vieja ni del descuento viejo en el contenido visible ----------
const PAGINAS = fs.readdirSync(RAIZ).filter(f => f.endsWith('.html') && f !== '404.html');
// Fase 1: regla vieja por precio y descuento viejo. Con --final (Fase 8) se exige además que ya no se mezclen clubes con condominios.
const FINAL = !process.argv.includes('--parcial');   // estricto por defecto: con --parcial se omiten las comprobaciones de las fases pendientes
const PROHIBIDO = [/hasta \$299,99/i, /desde \$300(?![\d.,])/i, /de \$4,99 a \$299/i, /\$4,99 a \$299/i, /20 ?% de descuento/i, /\(20 ?% menos\)/i, /3, 6, 9 o 12 meses/i,
  /\bExpress\b/, /\bDelta\b/];
if (FINAL) PROHIBIDO.push(/clubes? y condominios?/i, /clubes? o condominios?/i, /Premium/);
PAGINAS.forEach(f => {
  const txt = visible(leer(f));
  PROHIBIDO.forEach(re => ok(!re.test(txt), f + ' contiene un texto viejo: ' + re));
});
['assets/luci.js', 'assets/search.js', 'assets/eventos.js'].forEach(f => {
  const js = leer(f);
  PROHIBIDO.forEach(re => ok(!re.test(js), f + ' contiene un texto viejo: ' + re));
});

console.log('precios: ' + comprobaciones + ' comprobaciones correctas');
