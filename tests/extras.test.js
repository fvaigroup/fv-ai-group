// Pruebas de los contenidos extra de /servicios y /productos: node tests/extras.test.js
// - partials/servicios-extra.html y partials/productos-extra.html existen y su contenido está insertado TAL CUAL entre
//   <!-- extra:inicio --> y <!-- extra:fin --> de servicios.html y productos.html;
// - sin «Línea Hexagonal/Triangular», «Refiere y gana», «Asesor F&V», «Sesión Clara», «Pack Enfoque», «Express» ni «único descuento»;
// - el FAQPage del JSON-LD de productos-extra coincide con sus preguntas; sin «¿Qué línea es para mí?»;
// - los enlaces del parcial y los resultados del cuestionario apuntan a rutas (y anclas) que existen; el cuestionario se recorre completo;
// - «Cómo pagas» sale del bloque pago-tri del catálogo (30 % por 12 meses por adelantado);
// - el bloque de recomendados dice «Tu recomendado recibe 10 % de descuento en su primer pago» y nada de dinero para quien recomienda;
// - el orden de /servicios termina con «Detalle técnico».
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const B = require('../scripts/build-html.js');

const RAIZ = B.RAIZ;
let n = 0;
function ok(c, m) { n++; if (!c) { console.error('✗ ' + m); process.exitCode = 1; } }
const unix = s => s.replace(/\r\n/g, '\n');
const leer = f => unix(fs.readFileSync(path.join(RAIZ, f), 'utf8'));
const cat = B.cargarCatalogo();
const decodificar = s => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'");
const plano = html => decodificar(html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

const PARCIALES = {
  servicios: { parcial: 'partials/servicios-extra.html', pagina: 'servicios.html' },
  productos: { parcial: 'partials/productos-extra.html', pagina: 'productos.html' },
};
const PROHIBIDO = [
  [/L[ií]nea (Hexagonal|Triangular)/i, '«Línea Hexagonal/Triangular»'],
  [/Refiere y gana/i, '«Refiere y gana»'],
  [/Asesor F&(?:amp;)?V/, '«Asesor F&V»'],
  [/Sesi[óo]n Clara/i, '«Sesión Clara»'],
  [/Pack Enfoque/i, '«Pack Enfoque»'],
  [/Asesor Mensual/i, '«Asesor Mensual»'],
  [/Asesor Pro/i, '«Asesor Pro»'],
  [/\bExpress\b/i, '«Express»'],
  [/[uú]nico descuento|solo descuento/i, '«único descuento»'],
];

// ------------------------------------------------------------ existen y están insertados tal cual
const html = {}, extra = {};
for (const [tipo, c] of Object.entries(PARCIALES)) {
  const existe = fs.existsSync(path.join(RAIZ, c.parcial));
  ok(existe, `${c.parcial} existe`);
  if (!existe) continue;
  const parcial = leer(c.parcial).replace(/\n+$/, '');
  extra[tipo] = parcial;
  ok(parcial.length > 500, `${c.parcial} no está vacío`);
  ok(!/\r/.test(fs.readFileSync(path.join(RAIZ, c.parcial), 'utf8')), `${c.parcial} usa saltos de línea LF`);
  const pagina = leer(c.pagina);
  html[tipo] = pagina;
  const m = pagina.match(/<!-- extra:inicio -->\n([\s\S]*?)\n<!-- extra:fin -->/);
  ok(!!m, `${c.pagina} tiene los marcadores extra:inicio / extra:fin con contenido`);
  ok(!!m && m[1] === parcial, `${c.pagina}: lo que hay entre los marcadores es EXACTAMENTE ${c.parcial}`);
  for (const [re, nombre] of PROHIBIDO) ok(!re.test(parcial), `${c.parcial}: no dice ${nombre}`);
  // ids únicos en la página completa (los del parcial no pisan a los de las categorías)
  const ids = [...pagina.matchAll(/\bid="([^"]+)"/g)].map(x => x[1]);
  const repetidos = ids.filter((id, i) => ids.indexOf(id) !== i);
  ok(!repetidos.length, `${c.pagina}: ids únicos (repetidos: ${[...new Set(repetidos)].join(', ') || 'ninguno'})`);
  // sin colores equivocados: lo de /servicios es ⬡ (linea-hex), lo de /productos lleva su envolvente propia
  const secciones = parcial.match(/<section\b[^>]*>/g) || [];
  ok(secciones.length > 0, `${c.parcial}: tiene secciones`);
  ok(secciones.every(s => /\bid="/.test(s) && /aria-labelledby="/.test(s)), `${c.parcial}: cada sección tiene id y aria-labelledby`);
  if (tipo === 'servicios') ok(secciones.every(s => /\blinea-hex\b/.test(s) && /\bhex-legible\b/.test(s)), `${c.parcial}: cada sección lleva .linea-hex y .hex-legible`);
  else ok(secciones.every(s => /\blinea-tri\b/.test(s)), `${c.parcial}: cada sección lleva su envolvente .linea-tri`);
  // tono: Hexagonal «usted», Triangular «tú»
  const texto = plano(parcial);
  if (tipo === 'servicios') ok(!/\b(?:tú|tus|tu|puedes|pagas|contesta)\b/i.test(texto.replace(/Terminal|¿Tu\b/g, '')), `${c.parcial}: lo ⬡ habla de «usted», sin «tú»`);
  else ok(!/\b(?:usted|su empresa|le entregamos)\b/i.test(texto.replace(/en su primer pago/g, '')), `${c.parcial}: lo ▲ habla de «tú», sin «usted»`);
}

// ------------------------------------------------------------ /servicios: Cómo trabajamos y Detalle técnico al final
if (extra.servicios) {
  const e = extra.servicios;
  const h2 = [...e.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g)].map(m => plano(m[1]));
  ok(JSON.stringify(h2) === JSON.stringify(['Cómo trabajamos', 'Detalle técnico']), `servicios-extra: títulos «Cómo trabajamos» y «Detalle técnico», en ese orden (hay ${h2.join(' | ')})`);
  ok(/<section\b[^>]*\bid="metodologia"/.test(e) && /<section\b[^>]*\bid="detalle-tecnico"/.test(e), 'servicios-extra: conserva los ids #metodologia y #detalle-tecnico');
  const sec = id => (e.match(new RegExp(`<section\\b[^>]*\\bid="${id}"[\\s\\S]*?</section>`)) || [''])[0];
  const metodo = plano(sec('metodologia'));
  const pasos = ['Diagnóstico', 'Evaluación de procesos', 'Implementación', 'Formación para su equipo', 'Formación ejecutiva y masterclasses', 'Acompañamiento Continuo'];
  let pos = -1;
  pasos.forEach((p, i) => { const k = metodo.indexOf(p, pos + 1); ok(k > pos, `Cómo trabajamos: etapa ${i + 1} «${p}» en orden`); pos = k; });
  const palabras = metodo.split(' ').length;
  ok(palabras >= 150 && palabras <= 200, `Cómo trabajamos: unas 176 palabras (hay ${palabras})`);
  const tecnico = sec('detalle-tecnico');
  const tt = plano(tecnico);
  for (const t of ['n8n y agentes de IA', 'Claude / OpenAI API', 'MCP a medida', 'WhatsApp Business API']) ok(tt.includes(t), `Detalle técnico: incluye «${t}»`);
  ok(tt.includes('Terminal — Claude Code') && tt.includes('Ejemplo ilustrativo de una automatización con MCP — no es la salida de un sistema real.'), 'Detalle técnico: el bloque de terminal sigue marcado como ejemplo ilustrativo');
  // «Empecemos por 20 minutos» NO se repite: la página ya genera su cierre con la consulta gratis
  ok(!/Empecemos por/i.test(e), 'servicios-extra: no duplica el cierre «Empecemos por 20 minutos» (la página ya trae el suyo)');
  ok(/class="[^"]*"[^>]*>Consulta gratis de 20 min</.test(html.servicios) && /id="cierre-titulo"/.test(html.servicios), 'servicios.html: el cierre propio con la consulta gratis de 20 min sigue ahí');
  // orden de la página: categorías -> Cómo trabajamos -> Detalle técnico -> cierre
  const p = html.servicios;
  const iCat = p.lastIndexOf('<section id="acompanamiento"'), iM = p.indexOf('id="metodologia"'), iD = p.indexOf('id="detalle-tecnico"'), iC = p.indexOf('id="cierre-titulo"');
  ok(iCat > 0 && iCat < iM && iM < iD && iD < iC, 'servicios.html: orden categorías → Cómo trabajamos → Detalle técnico → cierre');
  const h2Pagina = [...p.slice(p.indexOf('<!-- extra:inicio -->'), p.indexOf('<!-- extra:fin -->')).matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g)].map(m => plano(m[1]));
  ok(h2Pagina[h2Pagina.length - 1] === 'Detalle técnico', 'servicios.html: el último título antes del cierre es «Detalle técnico»');
  // enlaces del método a las páginas nuevas
  const hrefs = [...sec('metodologia').matchAll(/href="([^"]+)"/g)].map(m => m[1]);
  for (const h of ['/servicios/diagnostico', '/servicios#implementacion', '/servicios/formacion-equipo', '/ejecutivos', '/servicios/acompanamiento']) ok(hrefs.includes(h), `Cómo trabajamos enlaza a ${h}`);
  ok(!hrefs.some(h => /^\/(?:hexagonal|triangular|asesoria-estrategica|despliegue-ejecucion|acompanamiento-continuo)\b/.test(h)), 'Cómo trabajamos no enlaza a las páginas viejas');
}

// ------------------------------------------------------------ rutas que existen
const cacheIds = new Map();
function archivoDe(ruta) {
  const rel = ruta.replace(/^\//, '');
  const cand = rel === '' ? ['index.html'] : [rel, rel + '.html', rel.replace(/\/$/, '') + '/index.html'];
  return cand.find(c => fs.existsSync(path.join(RAIZ, c)) && fs.statSync(path.join(RAIZ, c)).isFile()) || null;
}
function idsDe(archivo) {
  if (!cacheIds.has(archivo)) cacheIds.set(archivo, new Set([...fs.readFileSync(path.join(RAIZ, archivo), 'utf8').matchAll(/\bid="([^"]+)"/g)].map(m => m[1])));
  return cacheIds.get(archivo);
}
function rutaValida(href) {
  if (/^(https?:|mailto:|tel:)/.test(href)) return true;
  const [ruta, ancla] = href.split('#');
  const archivo = ruta === '' ? null : archivoDe(ruta);
  if (ruta !== '' && !archivo) return false;
  if (!ancla) return true;
  return archivo ? idsDe(archivo).has(ancla) : true;
}
for (const [tipo, c] of Object.entries(PARCIALES)) {
  if (!extra[tipo]) continue;
  // los enlaces que arma el guion del cuestionario se prueban recorriéndolo (más abajo)
  const sinGuiones = extra[tipo].replace(/<script(?![^>]*\bsrc=)[\s\S]*?<\/script>/g, '');
  const hrefs = [...sinGuiones.matchAll(/\bhref="([^"]+)"/g)].map(m => decodificar(m[1]));
  hrefs.forEach(h => ok(rutaValida(h), `${c.parcial}: el enlace ${h} apunta a una ruta (y ancla) que existe`));
  const srcs = [...sinGuiones.matchAll(/\bsrc="(\/[^"]+)"/g)].map(m => m[1]);
  srcs.forEach(s => ok(rutaValida(s), `${c.parcial}: el script ${s} existe`));
  const locales = [...sinGuiones.matchAll(/href="#([^"]+)"/g)].map(m => m[1]);
  locales.forEach(a => ok(new RegExp(`\\bid="${a}"`).test(html[tipo]), `${c.pagina}: el ancla #${a} existe`));
}

if (extra.productos) {
  const e = extra.productos;
  const p = html.productos;

  // ------------------------------------------------------------ orden y títulos de /productos
  const h2 = [...e.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g)].map(m => plano(m[1]));
  ok(JSON.stringify(h2) === JSON.stringify(['¿No sabes cuál elegir?', 'Míralo funcionando', 'Garantía', 'Cómo pagas', 'Preguntas frecuentes', 'Recomiéndanos']),
    `productos-extra: ¿No sabes cuál elegir? → Míralo funcionando → Garantía → Cómo pagas → Preguntas frecuentes → Recomiéndanos (hay ${h2.join(' | ')})`);
  ok(!/¿Qu[ée] l[ií]nea es para m[ií]\?/.test(e), 'productos-extra: no repite «¿Qué línea es para mí?» (ya está en el inicio)');
  ok(/<section\b[^>]*\bid="elige"/.test(e) && /<section\b[^>]*\bid="como-pagas"/.test(e), 'productos-extra: conserva los ids #elige y #como-pagas');
  ok(/<section[^>]*>/.test(e) && (e.match(/<p class="lst-bloque-cab"><span class="nav-forma nav-tri" aria-hidden="true"><\/span><span class="lst-bloque-nombre">Negocios pequeños<\/span><\/p>/g) || []).length >= 5, 'productos-extra: los bloques ▲ se rotulan «Negocios pequeños» con su forma');

  // ------------------------------------------------------------ preguntas frecuentes y JSON-LD
  const detalles = [...e.matchAll(/<details\b[\s\S]*?<\/details>/g)].map(m => m[0]);
  const preguntas = detalles.map(d => plano((d.match(/<summary[\s\S]*?<\/summary>/) || [''])[0]));
  const respuestas = detalles.map(d => plano((d.match(/<\/summary>\s*<p[^>]*>([\s\S]*?)<\/p>/) || [, ''])[1]));
  ok(JSON.stringify(preguntas) === JSON.stringify(['¿Cómo pago?', '¿Puedo cancelar?', '¿Qué es la permanencia?', '¿Qué pasa si no me gusta?', '¿Atienden fuera de Valencia?']), `preguntas frecuentes: las 5 de triangular.html sin «¿Qué línea es para mí?» (hay ${preguntas.join(' | ')})`);
  ok(detalles.every(d => /min-h-\[44px\]/.test(d)), 'preguntas frecuentes: cada resumen tiene área táctil de 44 px');
  const ldTodos = [...e.matchAll(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/g)].map(m => m[1]);
  ok(ldTodos.length === 1, 'productos-extra: un solo bloque JSON-LD');
  let ld = null;
  try { ld = JSON.parse(ldTodos[0]); ok(true, 'el JSON-LD de productos-extra es válido'); } catch (err) { ok(false, 'el JSON-LD de productos-extra parsea: ' + err.message); }
  if (ld) {
    ok(ld['@type'] === 'FAQPage' && Array.isArray(ld.mainEntity), 'JSON-LD: FAQPage con mainEntity');
    ok(ld.mainEntity.length === detalles.length, `JSON-LD: ${detalles.length} preguntas (hay ${ld.mainEntity.length})`);
    ok(ld.mainEntity.every((q, i) => q['@type'] === 'Question' && q.name === preguntas[i] && q.acceptedAnswer && q.acceptedAnswer['@type'] === 'Answer' && q.acceptedAnswer.text === respuestas[i]), 'JSON-LD: preguntas y respuestas EXACTAMENTE las de la página, en el mismo orden');
  }
  // el JSON-LD de la página completa sigue siendo válido (el de la cabecera es el CollectionPage)
  const bloquesPagina = [...p.matchAll(/<script type="application\/ld\+json">\n([\s\S]*?)\n<\/script>/g)].map(m => { try { return JSON.parse(m[1])['@type']; } catch (err) { return 'ERROR'; } });
  ok(JSON.stringify(bloquesPagina) === JSON.stringify(['CollectionPage', 'FAQPage']), `productos.html: JSON-LD CollectionPage + FAQPage (hay ${bloquesPagina.join(', ')})`);

  // ------------------------------------------------------------ descuentos
  const pagoTri = cat.bloques['pago-tri'];
  ok(!!pagoTri && !/[uú]nico descuento/i.test(JSON.stringify(cat)), 'catálogo: ningún texto dice «único descuento»');
  const comoPagas = plano((e.match(/<section\b[^>]*\bid="como-pagas"[\s\S]*?<\/section>/) || [''])[0]);
  ok(comoPagas.includes(pagoTri.texto), 'Cómo pagas: la primera frase es la del bloque pago-tri del catálogo');
  pagoTri.items.forEach(it => ok(comoPagas.includes(plano(it)), `Cómo pagas: incluye «${it}» (bloque pago-tri del catálogo)`));
  ok(pagoTri.items.includes('30 % de descuento si pagas 12 meses por adelantado.'), 'catálogo: «30 % de descuento si pagas 12 meses por adelantado.»');
  ok(respuestas[0].includes('Si pagas 12 meses por adelantado, tienes 30 % de descuento.') && !/10 ?%/.test(comoPagas + respuestas.join(' ')), '¿Cómo pago? y Cómo pagas solo hablan del 30 %');
  const pct = [...plano(p.slice(p.indexOf('<main'))).matchAll(/(\d+) ?% (?:de descuento|menos)/g)].map(m => m[1]);
  ok(pct.every(x => x === '30' || x === '10'), `productos.html: solo descuentos de 30 % y 10 % (hay ${[...new Set(pct)].join(', ')})`);
  const listadoDe10 = [...plano(p.slice(p.indexOf('<main'))).matchAll(/10 ?% de descuento[^.]*\./g)].map(m => m[0]);
  ok(listadoDe10.length === 1 && listadoDe10[0] === '10 % de descuento en su primer pago.', 'productos.html: el 10 % aparece una sola vez, como «10 % de descuento en su primer pago»');

  // ------------------------------------------------------------ recomendados
  const rec = (e.match(/<section\b[^>]*\bid="recomendados"[\s\S]*?<\/section>/) || [''])[0];
  ok(!!rec && e.trimEnd().endsWith('</section>') && e.lastIndexOf('id="recomendados"') > e.lastIndexOf('id="faq-title"'), 'Recomiéndanos es el último bloque de /productos');
  ok(/<h2[^>]*>Recomiéndanos<\/h2>/.test(rec), 'Recomiéndanos: título «Recomiéndanos»');
  ok(plano(rec).includes('Tu recomendado recibe 10 % de descuento en su primer pago'), 'Recomiéndanos: dice exactamente «Tu recomendado recibe 10 % de descuento en su primer pago»');
  ok(plano(rec).includes('Tu recomendado recibe 10 % de descuento en su primer pago.'), 'Recomiéndanos: la frase termina en punto');
  ok(!/[$]|dinero|comisi[óo]n|gana|ganas|te llevas|pagamos/i.test(plano(rec)), 'Recomiéndanos: nada de dinero ni porcentaje para quien recomienda');
  const boton = (rec.match(/<a\b[^>]*wa\.me[^>]*>/) || [''])[0];
  ok(/data-evento="recomendar_whatsapp"/.test(boton) && /data-product="recomendados"/.test(boton), 'Recomiéndanos: botón con data-evento="recomendar_whatsapp" y data-product="recomendados"');
  const waRec = decodeURIComponent((boton.match(/\?text=([^"]+)"/) || [, ''])[1]);
  ok(waRec === 'Hola F&V, quiero recomendar a alguien (▲).', `Recomiéndanos: mensaje de WhatsApp exacto (hay «${waRec}»)`);
  ok(/min-h-\[48px\]/.test(boton) && /target="_blank" rel="noopener"/.test(boton), 'Recomiéndanos: botón de 48 px que abre WhatsApp en pestaña nueva');

  // ------------------------------------------------------------ cuestionario: se recorre completo con un DOM mínimo
  const guion = (e.match(/<script>\n([\s\S]*?)\n<\/script>/) || [, ''])[1];
  ok(/var root = document\.getElementById\('quiz'\)/.test(guion), 'cuestionario: el guion está en el parcial');
  for (const [re, nombre] of PROHIBIDO) ok(!re.test(guion), `cuestionario: el guion no dice ${nombre}`);
  const nodos = {};
  function nodo(id) {
    const hijos = [];
    const clases = new Set();
    const o = {
      id, hijos, tag: 'div', _html: '', textContent: '', className: '', attrs: {}, escuchas: {},
      classList: { add: (...c) => c.forEach(x => clases.add(x)), remove: (...c) => c.forEach(x => clases.delete(x)), contains: x => clases.has(x), toggle: x => (clases.has(x) ? clases.delete(x) : clases.add(x)) },
      setAttribute(k, v) { this.attrs[k] = v; }, removeAttribute(k) { delete this.attrs[k]; },
      addEventListener(t, f) { this.escuchas[t] = f; },
      appendChild(h) { hijos.push(h); return h; },
      focus() { this.enfocado = true; }, offsetWidth: 1,
      get innerHTML() { return this._html; },
      set innerHTML(v) { this._html = v; hijos.length = 0; },
      oculto: () => clases.has('hidden'),
    };
    return o;
  }
  const doc = {
    getElementById: id => (nodos[id] = nodos[id] || nodo(id)),
    createElement: tag => { const x = nodo(''); x.tag = tag; return x; },
  };
  const eventos = [];
  const ctx = vm.createContext({ document: doc, setTimeout: f => { f(); return 1; }, clearTimeout: () => {}, gtag: (...a) => eventos.push(a), encodeURIComponent });
  try { vm.runInContext(guion, ctx); ok(true, 'cuestionario: el guion corre sin errores'); } catch (err) { ok(false, 'cuestionario: el guion corre sin errores: ' + err.message); }
  const quiz = () => nodos['quiz-options'];
  const RESULTADOS = {};
  function responder(etiquetas) {
    // reinicia (si hay resultado) y contesta con los textos de botón indicados
    if (nodos['quiz-reset'] && nodos['quiz-reset'].escuchas.click) nodos['quiz-reset'].escuchas.click();
    for (const et of etiquetas) {
      const b = quiz().hijos.find(h => h.textContent === et);
      if (!b) return null;
      b.escuchas.click();
    }
    return nodos['quiz-result'].innerHTML;
  }
  const CAMINOS = [
    [['No', 'No'], 'plan-arranque'], [['No', 'Sí'], 'presencia-catalogo'], [['Sí', 'No'], 'caja-clara-caja'],
    [['Sí', 'Sí', 'Contestar más rápido'], 'asistente-ia-whatsapp'], [['Sí', 'Sí', 'Ver mis números'], 'tablero-ejecutivo-pyme'], [['Sí', 'Sí', 'Ordenar mi plata'], 'taller-plata-clara'],
  ];
  const sinAsesor = [];
  CAMINOS.forEach(([resp, id]) => {
    const r = responder(resp);
    ok(!!r && !nodos['quiz-result'].oculto(), `cuestionario ${resp.join(' / ')}: llega a un resultado`);
    if (!r) return;
    RESULTADOS[id] = r;
    ok(r.includes(`data-product="${id}"`), `cuestionario ${resp.join(' / ')}: recomienda ${id}`);
    const url = (r.match(/<a href="(\/[^"]*)" data-evento="productos_test_detalle"/) || [, ''])[1];
    ok(!!url && rutaValida(url), `cuestionario → ${id}: «Ver qué incluye» apunta a ${url}, que existe`);
    const wa = decodeURIComponent((r.match(/href="https:\/\/wa\.me\/584244125386\?text=([^"]+)"/) || [, ''])[1]);
    ok(/^Hola F&V, /.test(wa) && /\(▲(?:, [^)]+)?\)/.test(wa) && !/L[ií]nea/.test(wa), `cuestionario → ${id}: mensaje con la forma (▲) y sin el nombre de la línea («${wa}»)`);
    sinAsesor.push(r);
    for (const [re, nombre] of PROHIBIDO) ok(!re.test(r), `cuestionario → ${id}: el resultado no dice ${nombre}`);
    ok(nodos['quiz-resultado'] && nodos['quiz-resultado'].enfocado, `cuestionario → ${id}: el foco pasa al resultado`);
  });
  ok(Object.keys(RESULTADOS).length === 6, 'cuestionario: las 6 recomendaciones son alcanzables');
  // las 8 combinaciones posibles de respuestas nunca terminan en el Asesor
  let combos = 0;
  for (const a of ['Sí', 'No']) for (const b of ['Sí', 'No']) for (const c of ['Contestar más rápido', 'Ver mis números', 'Ordenar mi plata']) {
    const r = responder(a === 'Sí' && b === 'Sí' ? [a, b, c] : [a, b]);
    combos++;
    ok(!!r && /data-product="[a-z-]+"/.test(r) && !/Asesor/.test(r), `cuestionario ${a}/${b}/${c}: resultado válido y sin Asesor`);
  }
  ok(combos === 12, 'cuestionario: se probaron todas las combinaciones');
  ok(!/Saber qué hacer/.test(guion), 'cuestionario: ya no existe la opción que llevaba al Asesor');
  // cada resultado coincide con el catálogo: mensaje, precio y producto
  const item = id => cat.items.find(i => i.id === id);
  const planDe = (it, pid) => (it.contenido.planes || []).find(x => x.id === pid);
  const ESPERADO = {
    'plan-arranque': { msg: item('plan-arranque').wa.mensaje, precio: '$39,99 al mes', url: item('plan-arranque').detalle.url },
    'presencia-catalogo': { msg: planDe(item('presencia'), 'catalogo').wa, precio: planDe(item('presencia'), 'catalogo').precio, url: item('presencia').detalle.url },
    'caja-clara-caja': { msg: planDe(item('caja-clara'), 'caja').wa, precio: planDe(item('caja-clara'), 'caja').precio, url: item('caja-clara').detalle.url },
    'asistente-ia-whatsapp': { msg: planDe(item('asistente-ia'), 'whatsapp').wa, precio: planDe(item('asistente-ia'), 'whatsapp').precio, url: item('asistente-ia').detalle.url },
    'tablero-ejecutivo-pyme': { msg: planDe(item('tablero-ejecutivo'), 'pyme').wa, precio: planDe(item('tablero-ejecutivo'), 'pyme').precio, url: item('tablero-ejecutivo').detalle.url },
    'taller-plata-clara': { msg: item('taller-plata-clara').wa.mensaje, precio: '$24,99 por persona', url: item('taller-plata-clara').detalle.url },
  };
  Object.entries(ESPERADO).forEach(([id, x]) => {
    const r = RESULTADOS[id] || '';
    const wa = decodeURIComponent((r.match(/href="https:\/\/wa\.me\/584244125386\?text=([^"]+)"/) || [, ''])[1]);
    ok(wa === x.msg, `cuestionario → ${id}: el mensaje de WhatsApp es el del catálogo («${x.msg}»; hay «${wa}»)`);
    ok(plano(r).includes(x.precio), `cuestionario → ${id}: muestra el precio ${x.precio}`);
    ok(r.includes(`href="${x.url}"`), `cuestionario → ${id}: «Ver qué incluye» lleva a ${x.url}`);
  });
  ok(eventos.some(a => a[0] === 'event' && a[1] === 'productos_test_resultado'), 'cuestionario: envía productos_test_resultado a la medición');
  ok(!/test_triangular_resultado|triangular_test/.test(e), 'cuestionario: los nombres de medición no llevan «triangular»');

  // «Míralo funcionando»: ejemplos marcados como ilustrativos y enlace a la demo
  const func = plano((e.match(/<section\b[^>]*aria-labelledby="funcionando-title"[\s\S]*?<\/section>/) || [''])[0]);
  ok(/Tres ejemplos ilustrativos/.test(func) && /Catálogo de ejemplo/.test(func) && /Vista ilustrativa con datos de ejemplo/.test(func) && /Ejemplo ilustrativo/.test(func), 'Míralo funcionando: los ejemplos siguen marcados como ilustrativos');
  ok(/href="\/demo-catalogo"/.test(e), 'Míralo funcionando: enlaza a /demo-catalogo');
  ok(/Garantía/.test(plano(e)) && plano(e).includes('Si tu producto no queda como lo prometimos, lo corregimos sin costo. Si aun así no te sirve, te devolvemos tu dinero.'), 'Garantía: texto publicado');
}

// ------------------------------------------------------------ el descuento del inicio
{
  const inicio = leer('index.html');
  ok(!/[uú]nico descuento|solo descuento/i.test(inicio), 'index.html: ninguna frase dice «único descuento» ni «un solo descuento»');
  // El inicio vuelve a tener preguntas frecuentes (30 oct 2026), sin montos ni descuentos: eso lo comprueba tests/inicio.test.js
  ok(!/%|\$/.test((inicio.match(/<section id="faq"[\s\S]*?<\/section>/) || [''])[0]), 'index.html: las preguntas frecuentes no mencionan descuentos ni porcentajes');
}
ok(!/[uú]nico descuento|solo descuento/i.test(fs.readFileSync(path.join(RAIZ, 'data/catalogo.json'), 'utf8')), 'data/catalogo.json: ninguna frase dice «único descuento»');

console.log(`extras: ${n} comprobaciones${process.exitCode ? ' (CON FALLAS)' : ' correctas'}`);
