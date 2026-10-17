// Prueba del formato de precios de todo el sitio.
//  - ▲ Negocios pequeños (Triangular): todo precio termina en ,99 (salvo las cuotas del curso: $100,00).
//  - ⬡ Empresas e instituciones (Hexagonal): todo precio es un número redondo (múltiplo de 10).
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
const TRI_MENSUAL = [14.99, 29.99, 39.99, 59.99, 79.99, 89.99, 99.99, 119.99, 149.99, 179.99, 189.99]; // incluye las apps de software (Club, Condominio, Gym)
const TRI_UNICO = [4.99, 24.99, 299.99];
const TRI = new Set([...TRI_MENSUAL, ...TRI_UNICO]);
const CUOTAS = new Set([100, 99.99]);                          // cuotas del curso: $100,00, $100,00 y $99,99
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
const MIXTAS = ['index.html', 'club.html', 'condominio.html', 'gym.html', 'paginas-web.html', 'curso-finanzas-ia.html', 'contacto.html', 'nosotros.html'];
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

// ---------- 3) Tabla exacta de lo Triangular (pedida por el dueño) ----------
//  Los productos ▲ viven en sus páginas de detalle (productos/*.html) y en /paginas-web (Presencia) y /curso-finanzas-ia.
const fmt = n => '$' + n.toFixed(2).replace('.', ',');
const ESPERADOS = {
  'productos/plan-arranque.html': [39.99], 'paginas-web.html': [14.99, 29.99, 59.99, 99.99],
  'productos/caja-clara.html': [14.99, 29.99, 39.99], 'productos/tablero-ejecutivo.html': [79.99, 149.99],
  'productos/asistente-ia.html': [119.99, 179.99], 'productos/mis-finanzas-claras.html': [4.99],
  'productos/taller-plata-clara.html': [24.99], 'curso-finanzas-ia.html': [299.99]
};
Object.entries(ESPERADOS).forEach(([f, precios]) => { const txt = visible(leer(f)); precios.forEach(p => ok(txt.includes(fmt(p)), f + ' debe publicar ' + fmt(p))); });
ok(/\$100,00, \$100,00 y \$99,99/.test(visible(leer('curso-finanzas-ia.html'))), 'cuotas del curso $100,00 + $100,00 + $99,99');

// ---------- 4) Hexagonal: precios redondos ----------
const PAGINAS_SERVICIOS = ['servicios.html'].concat(fs.readdirSync(path.join(RAIZ, 'servicios')).map(f => 'servicios/' + f));
PAGINAS_SERVICIOS.forEach(f => {
  const hex = leer(f);
  for (const k of visible(hex).match(TOKEN) || []) ok(esHex(num(k)) || TRI.has(num(k)), f + ' ' + k + ' debe ser múltiplo de 10 (o un precio Triangular en ,99)');
  for (const m of hex.matchAll(/"price":\s*"([\d.]+)"/g)) ok(esHex(parseFloat(m[1])), f + ' JSON-LD ' + m[1]);
});

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

// ---------- 6) Oferta Hexagonal nueva (17 de octubre de 2026) ----------
//  - /hexagonal y /ejecutivos publican los precios nuevos; el Diagnóstico de $270 lleva su frase de abono.
//  - Desaparecen la Asesoría Estratégica ($150), la Evaluación de Procesos ($400) como producto y la Habilitación ($60 por persona).
//  - Todo «desde $X» de una implementación Hexagonal va con «precio final después del diagnóstico» en la misma tarjeta o párrafo.
//  - Sin «no reembolsable», sin «Ricardo de Freitas» y ningún descuento que no sea el 30 % (salvo el 10 % de descuento en su primer pago del recomendado).
const ABONO = 'Si después contrata la implementación, los $270 se abonan al proyecto.';
const FINAL_DIAG = 'precio final después del diagnóstico';
const plano = t => t.replace(/\s+/g, ' ');
// Páginas Hexagonales: todos los precios visibles y del JSON-LD son redondos (salvo una referencia a un producto Triangular, siempre en ,99)
['ejecutivos.html', 'calculadora-roi.html'].concat(PAGINAS_SERVICIOS).forEach(f => {
  const html = leer(f);
  for (const k of visible(html).match(TOKEN) || []) ok(esHex(num(k)) || TRI.has(num(k)), f + ' ' + k + ' debe ser múltiplo de 10 (o un precio Triangular en ,99)');
  for (const m of html.matchAll(/"price":\s*"([\d.]+)"/g)) ok(esHex(parseFloat(m[1])), f + ' JSON-LD ' + m[1]);
});
// precios nuevos publicados
const PRECIOS_HEX = { '$270': 'Diagnóstico / Programa ejecutivo individual', '$960': 'Formación ejecutiva 1 a 1', '$180': 'Programa ejecutivo por persona', '$120': 'Asesor financiero mensual', '$480': 'Asesor financiero semanal' };
['ejecutivos.html'].forEach(f => {
  const txt = plano(visible(leer(f)));
  Object.entries(PRECIOS_HEX).forEach(([p, que]) => ok(new RegExp('\\' + p + '(?![\\d.,])').test(txt), f + ' debe publicar ' + p + ' (' + que + ')'));
  ok(/Formaci[óo]n ejecutiva 1 a 1/.test(txt) && /Programa ejecutivo/.test(txt) && /Asesor financiero con IA/.test(txt) && /Consulta gratis de 20 min/.test(txt), f + ': productos nuevos y «Consulta gratis de 20 min»');
});
['ejecutivos.html', 'servicios/diagnostico.html'].forEach(f => {
  const txt = plano(visible(leer(f)));
  ok(txt.includes('¿En qué se va la plata de su empresa?') && txt.includes(ABONO), f + ': Diagnóstico «¿En qué se va la plata de su empresa?» con la frase de abono');
  ok(/\$270/.test(txt), f + ': Diagnóstico de $270');
});
ok(/Formaci[óo]n para su equipo/.test(visible(leer('servicios/formacion-equipo.html'))), 'servicios/formacion-equipo.html: Formación para su equipo');
// cada servicio con precio fijo lo publica en su página de detalle
[['servicios/diagnostico.html', '$270'], ['servicios/formacion-ejecutiva.html', '$960'], ['servicios/asesor-financiero.html', '$120'], ['servicios/asesor-financiero.html', '$480']].forEach(([f, p]) => {
  ok(plano(visible(leer(f))).includes(p), f + ' debe publicar ' + p);
});
// mensajes de WhatsApp exactos de la oferta nueva
const WA_HEX = {
  'diagnostico-270': 'Hola F&V, quiero agendar el Diagnóstico «¿En qué se va la plata de su empresa?» (⬡, $270).',
  'formacion-ejecutiva': 'Hola F&V, me interesa la Formación ejecutiva 1 a 1 (⬡, $960).',
  'asesor-financiero': 'Hola F&V, me interesa el Asesor financiero con IA (⬡, $120 o $480 al mes).'
};
['ejecutivos.html'].forEach(f => {
  const msgs = [...leer(f).matchAll(/https:\/\/wa\.me\/\d+\?text=([^"'\s]+)/g)].map(m => { try { return decodeURIComponent(m[1]); } catch (e) { return ''; } });
  Object.entries(WA_HEX).forEach(([id, m]) => ok(msgs.includes(m), f + ': WhatsApp exacto de ' + id));
});
// productos y textos que ya no existen
// (en Luci y el buscador se omiten las palabras clave de búsqueda: «asesoria estrategica» sigue llevando al Diagnóstico)
const sinClaves = js => js.replace(/\bk: \[[^\]]*\]/g, '').replace(/\bkw: '[^']*'/g, '');
const PAGINAS_Y_JS = PAGINAS.map(f => [f, visible(leer(f))]).concat(['assets/luci.js', 'assets/search.js'].map(f => [f, sinClaves(leer(f))]));
const VIEJO_HEX = [/Asesor[ií]a Estrat[ée]gica/i, /\$150(?![\d.,])/, /\$60 por persona/i, /Habilitaci[óo]n de equipos/i, /Evaluaci[óo]n de procesos[^.]{0,80}\$400/i,
  /no reembolsable/i, /Ricardo de Freitas/, /\bExpress\b/, /20 ?% (?:de )?(?:descuento|menos)/i, /descuento (?:de|del) 20/i];
PAGINAS_Y_JS.forEach(([f, txt]) => {
  VIEJO_HEX.forEach(re => ok(!re.test(txt), f + ' contiene un texto de la oferta vieja: ' + re));
  // Descuentos: el publicado por pago es 30 % por 12 meses por adelantado. Además existe «10 % de descuento en su primer pago» para el recomendado
  // de un cliente: solo con esa frase exacta y solo en un texto que hable del «recomendado». Cualquier otro porcentaje es un error.
  // (la misma frase en voz de «tú», «en tu primer pago», se admite en Luci, que habla con el recomendado)
  for (const m of txt.matchAll(/(\d+) ?% (?:de descuento|menos)(?: en (?:su|tu) primer pago)?/gi)) {
    const bienvenida = /^10 % de descuento en (?:su|tu) primer pago$/.test(m[0]) && /recomendado/i.test(txt);
    ok(m[1] === '30' || bienvenida, f + ': solo se publican el 30 % por 12 meses por adelantado y el «10 % de descuento en su primer pago» del recomendado (aparece ' + m[0] + ')');
  }
});
ok(!fs.existsSync(path.join(RAIZ, 'evaluacion-procesos.html')) && !fs.existsSync(path.join(RAIZ, 'habilitacion-equipos.html')), 'las páginas de Evaluación de Procesos y Habilitación de equipos ya no existen');
// «desde $X» de una implementación Hexagonal: con «precio final después del diagnóstico» en su tarjeta o párrafo
const VACIOS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'use', 'stop']);
function contenedor(html, pos) {
  // elementos abiertos en «pos»; devuelve el texto de la tarjeta (x-card, article, li, details, tr) más cercana, o el del abuelo del texto
  const pila = [];
  const re = /<(\/?)([a-zA-Z][\w-]*)([^>]*?)(\/?)>/g; let m;
  while ((m = re.exec(html)) && m.index < pos) {
    const tag = m[2].toLowerCase();
    if (tag === 'script' || tag === 'style') { if (!m[1]) { const fin = html.indexOf('</' + tag, re.lastIndex); re.lastIndex = fin < 0 ? html.length : fin; } continue; }
    if (m[1]) { const i = pila.map(e => e.tag).lastIndexOf(tag); if (i !== -1) pila.length = i; }
    else if (!m[4] && !VACIOS.has(tag)) pila.push({ tag, attrs: m[3], ini: m.index });
  }
  let el = null;
  for (let i = pila.length - 1; i >= 0; i--) if (/^(article|li|details|tr)$/.test(pila[i].tag) || /class="[^"]*\b(x-card|card-lift|sw-card)\b/.test(pila[i].attrs)) { el = pila[i]; break; }
  if (!el) el = pila[Math.max(0, pila.length - 2)];
  // fin del elemento: contar aperturas y cierres del mismo tag
  const reTag = new RegExp('<(/?)' + el.tag + '\\b[^>]*>', 'gi'); reTag.lastIndex = el.ini; let prof = 0, fin = html.length, t;
  while ((t = reTag.exec(html))) { if (t[1]) { prof--; if (prof === 0) { fin = t.index; break; } } else prof++; }
  return plano(html.slice(el.ini, fin).replace(/<[^>]+>/g, ' '));
}
const SOLO_SOFTWARE = ['club.html', 'condominio.html', 'gym.html', 'paginas-web.html'];
let desdeRevisados = 0;
PAGINAS.filter(f => !SOLO_SOFTWARE.includes(f)).forEach(f => {
  const html = leer(f).replace(/<script(?![^>]*application\/ld\+json)[\s\S]*?<\/script>/g, s => ' '.repeat(s.length)).replace(/<style[\s\S]*?<\/style>/g, s => ' '.repeat(s.length));
  for (const m of html.matchAll(/desde (?:<[^>]+>\s*)?(\$\d[\d.]*(?:,\d+)?)([^<]{0,20})/gi)) {
    if (/\/\s*mes|al mes|por mes|mensual/i.test(m[2]) || !esHex(num(m[1]))) continue;      // mensualidades de software y precios Triangulares
    if (html.lastIndexOf('application/ld+json', m.index) > html.lastIndexOf('</script>', m.index)) continue;   // JSON-LD: se revisa abajo
    desdeRevisados++;
    ok(contenedor(html, m.index).includes(FINAL_DIAG), f + ': «desde ' + m[1] + '» sin «' + FINAL_DIAG + '» en su tarjeta o párrafo');
  }
});
// en los scripts de la página (test de la portada), Luci y el buscador: en la misma cadena de texto
[['index.html', s => (s.match(/<script(?![^>]*application\/ld\+json)[\s\S]*?<\/script>/g) || []).join('\n')], ['assets/luci.js', s => s], ['assets/search.js', s => s]].forEach(([f, js]) => {
  const codigo = js(leer(f));
  for (const cadena of codigo.match(/'(?:[^'\\\n]|\\.)*'/g) || []) for (const m of cadena.matchAll(/desde (\$\d[\d.]*(?:,\d+)?)([^']{0,20})/gi)) {
    if (/\/\s*mes|al mes|por mes|mensual/i.test(m[2]) || !esHex(num(m[1]))) continue;
    desdeRevisados++;
    const linea = codigo.split('\n').find(l => l.includes(cadena)) || cadena;
    ok(linea.includes(FINAL_DIAG), f + ': «desde ' + m[1] + '» sin «' + FINAL_DIAG + '» en la misma respuesta');
  }
});
ok(desdeRevisados > 10, 'se revisaron los «desde $X» Hexagonales (' + desdeRevisados + ')');

// ---------- 7) Páginas estáticas: sin el nombre de las líneas (solo vive en el inicio) ni el Asesor F&V ----------
//  Los mensajes de WhatsApp llevan solo la forma: «(⬡, $270)» o «(▲, $39,99/mes)».
const ESTATICAS = ['club.html', 'condominio.html', 'gym.html', 'paginas-web.html', 'curso-finanzas-ia.html', 'ejecutivos.html', 'casos.html', 'calculadora.html', 'calculadora-roi.html',
  'nosotros.html', 'contacto.html', 'privacidad.html', 'terminos.html', '404.html', 'assets/eventos.js', 'assets/calculadora.js', 'assets/producto.js', 'assets/precios-software.js'];
const NOMBRE_LINEA = /L(?:í|i|%C3%AD)nea(?:\s|%20|\+)+(?:Hexagonal|Triangular)/i;
const ASESOR_TRI = /Asesor(?:\s|%20|\+|&amp;|&)+F(?:&amp;|&|%26)?V|Sesi(?:ó|o|%C3%B3)n(?:\s|%20)+Clara|Pack(?:\s|%20)+Enfoque|Asesor(?:\s|%20)+(?:Mensual|Pro)\b|Refiere(?:\s|%20)+y(?:\s|%20)+gana/i;
ESTATICAS.forEach(f => {
  const crudo = leer(f);
  // terminos.html es el texto legal vigente: sus cláusulas usan los nombres de línea como términos definidos y NO se redactan sin el
  // dueño o su abogado (ver PENDIENTES-LOCAL.md). Se exime solo de esta comprobación; las demás sí aplican.
  if (f !== 'terminos.html') ok(!NOMBRE_LINEA.test(crudo), f + ': no debe nombrar «Línea Hexagonal» ni «Línea Triangular» (solo el inicio)');
  ok(!ASESOR_TRI.test(crudo), f + ': no debe mencionar el Asesor F&V, Sesión Clara, Pack Enfoque, Asesor Mensual/Pro ni «Refiere y gana»');
  for (const m of crudo.matchAll(/https:\/\/wa\.me\/\d+\?text=([^"'\s]+)/g)) { let t = ''; try { t = decodeURIComponent(m[1]); } catch (e) { continue; } ok(!/L[íi]nea/i.test(t), f + ': mensaje de WhatsApp con «Línea»: ' + t.slice(0, 80)); }
});
// el selector de interés de /contacto: Hexagonal primero, sin Asesor F&V y con la forma en los valores
(function contactoSelector() {
  const html = leer('contacto.html');
  const sel = html.match(/<select[^>]*id="interes"[\s\S]*?<\/select>/)[0];
  ok(sel.indexOf('⬡ Empresas e instituciones') > -1 && sel.indexOf('⬡ Empresas e instituciones') < sel.indexOf('▲ Negocios pequeños'), 'contacto.html: el selector lista primero ⬡ Empresas e instituciones y luego ▲ Negocios pequeños');
  ok(!/Asesor F/.test(sel), 'contacto.html: el selector ya no ofrece el Asesor F&V');
  ok(/value="Aún no estoy seguro" selected/.test(sel), 'contacto.html: «Aún no estoy seguro» sigue por defecto');
  ok(html.indexOf('id="puerta-empresa"') < html.indexOf('id="puerta-negocio"'), 'contacto.html: la puerta Hexagonal va antes que la Triangular');
})();

console.log('precios: ' + comprobaciones + ' comprobaciones correctas');
