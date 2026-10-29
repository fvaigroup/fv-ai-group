// Prueba del buscador (assets/search.js) y de Luci (assets/luci.js) con un DOM mínimo simulado (sin dependencias).
//  - El índice del buscador sigue el catálogo: /servicios, /productos, sus 10 categorías (con ancla), los 19 servicios y los 15 productos,
//    cada uno con la url de detalle del catálogo; los precios del texto son los del catálogo (⬡ redondos, ▲ en ,99).
//  - Ni el buscador ni Luci nombran «Línea Hexagonal/Triangular», el Asesor F&V, «Express», «Refiere y gana» ni el «único descuento»,
//    y ningún resultado ni botón apunta a una página vieja: toda url existe en el repo (archivo y ancla).
//  - Hexagonal va antes que Triangular cuando empatan; las fechas de talleres y cursos no están escritas a mano en el índice.
// Uso: node tests/buscador-luci.test.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');
const RAIZ = path.join(__dirname, '..');
const leer = f => fs.readFileSync(path.join(RAIZ, f), 'utf8');
const CAT = JSON.parse(leer('data/catalogo.json'));
const S = require('../assets/precios-software.js');
let n = 0;
const ok = (c, m) => { n++; assert.ok(c, m); };

// ---------- DOM mínimo ----------
function nodo(id) {
  const oy = {};
  const el = {
    id, innerHTML: '', textContent: '', value: '', className: '', hidden: false, style: {}, dataset: {}, children: [], attrs: {}, oyentes: oy, parentNode: null,
    classList: { _s: new Set(), add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); }, contains(c) { return this._s.has(c); } },
    setAttribute(k, v) { this.attrs[k] = String(v); }, getAttribute(k) { return this.attrs[k]; }, removeAttribute(k) { delete this.attrs[k]; },
    addEventListener(t, f) { (oy[t] = oy[t] || []).push(f); },
    appendChild(h) { this.children.push(h); h.parentNode = this; return h; },
    querySelector() { return null; }, querySelectorAll() { return []; }, remove() {}, focus() {}, closest() { return null; }
  };
  return el;
}
function entorno(ruta, extra) {
  const ids = {};
  const documento = {
    head: nodo('head'), body: nodo('body'), activeElement: null, oyentes: {},
    createElement(t) { return nodo(t); },
    getElementById(id) { return ids[id] || null; },
    querySelectorAll() { return []; },
    addEventListener(t, f) { (this.oyentes[t] = this.oyentes[t] || []).push(f); }
  };
  const ventana = { location: { pathname: ruta, href: '' }, FV_EVENTOS: extra && extra.eventos, oyentes: {}, addEventListener(t, f) { (this.oyentes[t] = this.oyentes[t] || []).push(f); } };
  const ctx = { window: ventana, document: documento, location: ventana.location, navigator: { platform: 'Win32', userAgent: '' }, setTimeout: f => f(), clearTimeout: () => {}, console };
  ventana.window = ventana;
  return { ids, documento, ventana, ctx };
}

// eventos simulados: la forma que expone assets/eventos.js (proximas, datos, sinFechas, estado)
const EVENTOS = {
  proximas: () => [{ tipo: 'taller', texto: 'sábado 17 de octubre' }, { tipo: 'curso', texto: '7, 14 y 21 de noviembre' }],
  datos: { 'taller.precio': '$24,99', 'curso.precio': '$299,99', 'curso.cuotas': '$100,00, $100,00 y $99,99', 'taller.fecha': 'sábado 17 de octubre', 'taller.hora': '3:00 a 6:00 pm', 'taller.lugar': 'Valencia', 'taller.cupos': 'Máximo 6 personas' },
  estado: { 'taller:vigente': true }, sinFechas: 'Próximas fechas: escríbenos por WhatsApp', refrescar() {}
};

// ---------- buscador ----------
// completo = true: carga el buscador sin el filtro de rutas ocultas (29 oct 2026), para seguir probando el contenido del catálogo
function cargarBuscador(ruta, completo) {
  const e = entorno(ruta, { eventos: EVENTOS });
  vm.createContext(e.ctx);
  vm.runInContext(completo ? leer('assets/search.js').replace(/\n  SEARCH_INDEX = SEARCH_INDEX\.filter\([^\n]*\n/, '\n') : leer('assets/search.js'), e.ctx, { filename: 'search.js' });
  // abrir con Ctrl K: construye el modal; buscar = escribir en el campo
  const modal = nodo('overlay'); const campo = nodo('search-input'); const resultados = nodo('search-results');
  modal.querySelector = s => (s === '#search-input' ? campo : s === '#search-results' ? resultados : null);
  e.documento.createElement = t => (t === 'style' ? nodo('style') : modal);
  e.documento.oyentes.keydown.forEach(f => f({ ctrlKey: true, metaKey: false, key: 'k', preventDefault() {} }));
  return {
    buscar(q) {
      campo.value = q;
      campo.oyentes.input.forEach(f => f({}));
      const html = resultados.innerHTML, out = [];
      const re = /<a href="([^"]*)" class="(search-result[^"]*)" data-i="\d+"><span class="sr-title">([\s\S]*?) <span class="sr-tag cat-(\w+)">[\s\S]*?<\/span><\/span><span class="sr-desc">([\s\S]*?)<\/span><\/a>/g;
      let m; const des = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
      while ((m = re.exec(html))) out.push({ url: des(m[1]), title: des(m[3]), cat: m[4], desc: des(m[5]), activo: /is-active/.test(m[2]) });
      const a = out.findIndex(x => x.activo); if (a > 0) out.unshift(out.splice(a, 1)[0]); // primero, el que se abre con Enter
      return out;
    },
    html: () => resultados.innerHTML
  };
}

const fuente = leer('assets/search.js');
const mIdx = fuente.match(/var SEARCH_INDEX = \[([\s\S]*?)\n  \];/);
ok(mIdx, 'se encuentra SEARCH_INDEX');
const INDICE = vm.runInNewContext('[' + mIdx[1] + ']');
const B = cargarBuscador('/', true);
const TODOS = B.buscar('');
const VISIBLES = cargarBuscador('/').buscar('');
// Rutas ocultas temporalmente (29 oct 2026): el buscador las filtra al cargar; INDICE conserva el catálogo completo para las demás comprobaciones
const OCULTAS = vm.runInNewContext(fuente.match(/var OCULTAS = (\/.*\/);/)[1]);
ok(VISIBLES.length === INDICE.filter(r => !r.grupo && !OCULTAS.test(r.url)).length, 'la búsqueda vacía muestra todo el índice visible, sin las categorías (esas salen al escribir)');
ok(TODOS.length === INDICE.filter(r => !r.grupo).length, 'sin el filtro, la búsqueda vacía muestra todo el índice');
ok(!VISIBLES.some(r => OCULTAS.test(r.url)), 'el buscador no muestra rutas ocultas');

// existencia de las urls (archivo y ancla)
function existe(url) {
  const [ruta, ancla] = url.split('#');
  const rel = ruta === '/' ? 'index.html' : ruta.replace(/^\//, '') + '.html';
  if (!fs.existsSync(path.join(RAIZ, rel))) return 'no existe ' + rel;
  if (ancla && !new RegExp('id="' + ancla + '"').test(leer(rel))) return 'no existe el ancla #' + ancla + ' en ' + rel;
  return null;
}
INDICE.forEach(r => ok(!existe(r.url), 'buscador «' + r.title + '»: ' + existe(r.url)));

// estructura del catálogo
const urls = INDICE.map(r => r.url);
ok(urls.includes('/servicios') && urls.includes('/productos'), 'están /servicios y /productos');
['servicio', 'producto'].forEach(t => {
  ok(CAT.tipos[t].categorias.length > 0);
  CAT.tipos[t].categorias.forEach(c => ok(urls.includes(CAT.tipos[t].ruta + '#' + c.id), 'categoría con ancla: ' + t + '#' + c.id));
});
ok(CAT.tipos.servicio.categorias.length + CAT.tipos.producto.categorias.length === 10, 'son 10 categorías');
const items = CAT.items;
ok(items.filter(i => i.tipo === 'servicio').length === 19 && items.filter(i => i.tipo === 'producto').length === 15, '19 servicios y 15 productos');
['/ejecutivos', '/nosotros', '/contacto', '/casos', '/calculadora', '/calculadora-roi'].forEach(u => ok(urls.includes(u), 'está ' + u));
const norm = t => String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
items.forEach(it => {
  const suf = it.precio.modo === 'software' ? (it.linea === 'hex' ? ' para empresas e instituciones' : ' para negocios pequeños') : '';
  const r = INDICE.find(x => x.url === it.detalle.url && x.title === it.nombre + suf);
  ok(r, 'el catálogo «' + it.id + '» está en el buscador con su url ' + it.detalle.url);
  ok(r.g === it.categoria, it.id + ': el grupo del buscador (g) es su categoría del catálogo (' + it.categoria + '), no «' + r.g + '»');
  ok(r.desc.indexOf(it.frase) === 0, it.id + ': la descripción parte de la frase del catálogo');
  const p = it.precio;
  const precios = p.modo === 'fijo' ? [p.texto] : p.modo === 'a-medida' ? (p.referencia ? [p.referencia.replace(/ \+.*/, '')] : []) : p.modo === 'desde' ? [p.texto.replace('desde ', '')]
    : p.modo === 'software' ? [it.linea === 'hex' ? '$' + S.desde('hex') : '$' + String(S.desde('tri')).replace('.', ',')] : [];
  if (it.id === 'asesor-financiero') precios.splice(0, 1, '$120 o $480');
  precios.forEach(x => ok(r.desc.indexOf(x) !== -1, it.id + ': la descripción trae el precio ' + x));
  if (it.linea === 'hex' && p.modo !== 'evento') (r.desc.match(/\$\d[\d.]*(?:,\d\d)?/g) || []).forEach(x => ok(!/,\d\d$/.test(x), it.id + ': precio ⬡ redondo ' + x));
  if (it.linea === 'tri' && p.modo !== 'evento') (r.desc.match(/\$\d[\d.]*(?:,\d\d)?/g) || []).forEach(x => ok(/,99$/.test(x) || /,98$/.test(x), it.id + ': precio ▲ en ,99 ' + x));
  ok((r.desc.split(/\s+/).length - (precios.join(' ').split(/\s+/).length) - 4) <= 22, it.id + ': descripción corta');
});
// las frases de cada ítem tienen a lo sumo 15 palabras
items.forEach(it => ok(it.frase.split(/\s+/).length <= 15, it.id + ': frase de 15 palabras o menos'));

// prohibiciones (en el índice completo, ya con fechas de eventos aplicadas)
const PROHIBIDO = [/L[ií]nea\s+(Hexagonal|Triangular)/i, /Asesor\s+F\s*&\s*V/i, /Sesi[oó]n Clara/i, /Pack Enfoque/i, /Asesor Mensual/i, /Asesor Pro/i, /Express/i,
  /Refiere y gana/i, /[uú]nico descuento/i, /Evaluaci[oó]n de procesos/i, /Habilitaci[oó]n de equipos/i, /\$150/,
  /(^|["'(\s])\/(hexagonal|triangular|software|cursos|asesoria-estrategica|acompanamiento-continuo|despliegue-ejecucion|masterclasses-workshops)([#"'\s)]|$)/];
function sinProhibido(texto, donde) { PROHIBIDO.forEach(re => ok(!re.test(texto), donde + ' no debe contener ' + re + ': ' + (texto.match(re) || [''])[0])); }
TODOS.forEach(r => sinProhibido(r.title + ' | ' + r.desc + ' | ' + r.url, 'buscador «' + r.title + '»'));
// la fuente del índice no trae kw con nombres de páginas viejas
INDICE.forEach(r => sinProhibido((r.kw || '') + ' ' + r.url, 'kw de «' + r.title + '»'));

// fechas: nada escrito a mano en el índice; vienen de FV_EVENTOS
INDICE.forEach(r => ok(!/\b(lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo)\b.*\d|\b\d{1,2} de (enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\b|202\d-\d\d/i.test(r.desc) || r.url === '/ejecutivos' || r.url.indexOf('programa-ejecutivo') !== -1,
  'sin fechas escritas a mano en «' + r.title + '»'));
const taller = TODOS.find(r => r.url === '/productos/taller-plata-clara'), curso = TODOS.find(r => r.url === '/curso-finanzas-ia');
ok(/sábado 17 de octubre/.test(taller.desc) && /\$24,99 por persona/.test(taller.desc), 'taller: fecha y precio de FV_EVENTOS: ' + taller.desc);
ok(/7, 14 y 21 de noviembre/.test(curso.desc) && /\$299,99 en 3 cuotas/.test(curso.desc), 'curso: fecha y precio de FV_EVENTOS: ' + curso.desc);
const sinEv = entorno('/', {}); vm.createContext(sinEv.ctx); vm.runInContext(fuente.replace(/\n  SEARCH_INDEX = SEARCH_INDEX\.filter\([^\n]*\n/, '\n'), sinEv.ctx);
// sin eventos.js el buscador sigue mostrando un texto honesto
const sinEvB = (() => { const m = nodo('o'), c = nodo('i'), r = nodo('r'); m.querySelector = s => (s === '#search-input' ? c : s === '#search-results' ? r : null); sinEv.documento.createElement = t => (t === 'style' ? nodo('s') : m);
  sinEv.documento.oyentes.keydown.forEach(f => f({ ctrlKey: true, key: 'k', preventDefault() {} })); c.value = 'taller'; c.oyentes.input.forEach(f => f({})); return r.innerHTML; })();
ok(/Próximas fechas: escríbenos por WhatsApp/.test(sinEvB), 'sin FV_EVENTOS: «Próximas fechas: escríbenos por WhatsApp»');

// orden: Hexagonal antes que Triangular cuando empatan
const club = B.buscar('club');
ok(club[0].title === 'Club para empresas e instituciones' && club.map(r => r.title).indexOf('Club para negocios pequeños') > 0, 'club: ⬡ antes que ▲');
ok(B.buscar('tablero')[0].url === '/servicios/tablero-gerencial', 'tablero: Tablero Gerencial (⬡) antes que Tablero Ejecutivo (▲)');

// las 8 consultas pedidas
const CONSULTAS = { 'diagnóstico': '/servicios/diagnostico', 'club': '/club', 'caja': '/productos/caja-clara', 'curso': null, 'tablero': null, 'asesor': '/servicios/asesor-financiero', 'precio': null, 'condominio': '/condominio' };
const informe = [];
Object.keys(CONSULTAS).forEach(q => {
  const r = B.buscar(q);
  ok(r.length > 0, 'la consulta «' + q + '» da resultados');
  r.forEach(x => ok(!existe(x.url), 'consulta «' + q + '» -> ' + x.url + ': ' + existe(x.url)));
  if (CONSULTAS[q]) ok(r[0].url === CONSULTAS[q], 'consulta «' + q + '»: primero ' + CONSULTAS[q] + ' (salió ' + r[0].url + ')');
  informe.push(q + ' -> ' + r.slice(0, 3).map(x => x.url).join(', '));
});
ok(B.buscar('precio').map(r => r.url).includes('/servicios') && B.buscar('precio').map(r => r.url).includes('/productos'), 'precio: salen /servicios y /productos (en la sección Páginas)');
ok(B.buscar('curso').some(r => r.url === '/curso-finanzas-ia') && B.buscar('curso').some(r => r.url === '/ejecutivos#programa-ejecutivo'), 'curso: Finanzas con IA y Programa ejecutivo');
ok(B.buscar('zzzzzz').length === 0 && /Sin resultados/.test(B.html()), 'sin resultados: aviso con WhatsApp');
ok(B.buscar('PLAN  arranque')[0].url === '/productos/plan-arranque', 'mayúsculas y espacios dobles no importan');

// ---------- Luci ----------
function cargarLuci(ruta) {
  const e = entorno(ruta, { eventos: EVENTOS });
  ['luci-toggle', 'luci-panel', 'luci-close', 'luci-messages', 'luci-quick', 'luci-form', 'luci-input'].forEach(id => { e.ids[id] = nodo(id); });
  e.ids['luci-toggle'].parentNode = nodo('p');
  vm.createContext(e.ctx);
  vm.runInContext(leer('assets/luci.js'), e.ctx, { filename: 'luci.js' });
  return e.ventana.FV_LUCI;
}
const L = cargarLuci('/');
const LH = cargarLuci('/servicios');
const resp = (l, q) => { const r = l.buscar(q); return r ? { r, a: typeof r.a === 'function' ? r.a() : r.a, c: r.c } : null; };
const textoDe = r => r.a + ' | ' + r.c.l + ' | ' + r.c.h + ' | ' + decodeURIComponent(r.c.h.replace(/^https:\/\/wa\.me\/\d+\?text=/, ''));
function urlLuci(c) { return /^https:\/\/wa\.me\//.test(c.h) ? null : c.h; }

ok(L.respuestas.length >= 40, 'Luci tiene al menos 40 intenciones: ' + L.respuestas.length);
L.respuestas.forEach((r, i) => {
  const a = typeof r.a === 'function' ? r.a() : r.a;
  const donde = 'Luci #' + i + ' (' + r.k[0] + ')';
  sinProhibido(a + ' | ' + r.c.l + ' | ' + decodeURIComponent(r.c.h) + ' | ' + (r.c.p || ''), donde);
  const u = urlLuci(r.c);
  if (u) ok(!existe(u), donde + ' -> ' + u + ': ' + existe(u));
  else { // mensajes de WhatsApp: empiezan con «Hola F&V» y llevan la forma, nunca el nombre de la línea
    const m = decodeURIComponent(r.c.h.replace(/^https:\/\/wa\.me\/\d+\?text=/, ''));
    ok(/^Hola F&V/.test(m), donde + ': el mensaje empieza con «Hola F&V»');
    if (r.c.p) ok(/\((⬡|▲)(, [^)]+)?\)/.test(m), donde + ': el mensaje lleva la forma (⬡ o ▲): ' + m);
  }
});

// definiciones oficiales, descuentos y recomendados
const dif = resp(L, '¿Qué diferencia hay entre servicios y productos?');
ok(dif.a.indexOf('Servicio: el equipo de F&V trabaja con usted, en su empresa o con su equipo. Producto: listo para usar, con el mismo precio y la misma entrega para todos.') === 0, 'diferencia: definiciones oficiales');
const rec = resp(L, 'si te recomiendo a alguien, ¿qué pasa?');
ok(/tu recomendado recibe 10 % de descuento en su primer pago/.test(rec.a), 'recomendados: 10 % de descuento en su primer pago');
ok(!/refiere y gana|comisi[oó]n|te llevas|ganas/i.test(rec.a), 'recomendados: nada de dinero para quien recomienda');
ok(/30 % de descuento si pagas 12 meses por adelantado/.test(resp(L, '¿hay descuento?').a), 'descuento: 30 % por 12 meses por adelantado');
L.respuestas.forEach(r => ok(!/[uú]nico descuento/i.test(typeof r.a === 'function' ? r.a() : r.a), 'ninguna respuesta dice «único descuento»'));
// el Asesor F&V desapareció: ninguna palabra clave viva lleva a su lógica
['sesion clara', 'pack enfoque', 'asesor mensual', 'asesor pro', 'asesor fv'].forEach(k => L.respuestas.forEach(r => ok(r.k.indexOf(k) === -1, 'sin la palabra clave «' + k + '»')));

// 10 preguntas típicas (y algunas más): la respuesta, el botón y los precios
const P = [
  ['¿Cuánto cuesta el Diagnóstico?', '/servicios/diagnostico|wa', /\$270/],
  ['¿Qué es el Asesor financiero con IA?', 'wa', /\$120 al mes.*\$480 al mes/],
  ['¿Cuánto cuesta la formación ejecutiva?', 'wa', /\$960/],
  ['¿Cuánto cuesta el programa ejecutivo?', '/ejecutivos#programa-ejecutivo', /\$270 individual o \$180 por persona/],
  ['¿Cuánto cuesta Club?', '/club', /\$89,99.*\$190|\$190.*\$89,99/],
  ['¿Cuánto cuesta Condominio?', '/condominio', /\$89,99.*\$190/],
  ['¿Cuánto cuesta Gym?', '/gym', /\$89,99.*\$190/],
  ['¿Qué incluye el Plan Arranque?', 'wa', /\$39,99/],
  ['¿Cuánto cuesta Caja Clara?', 'wa', /\$14,99.*\$29,99.*\$39,99/],
  ['¿Cuánto cuesta el tablero ejecutivo?', 'wa', /\$79,99.*\$149,99/],
  ['¿Cuánto cuesta el asistente de WhatsApp?', 'wa', /\$119,99.*\$179,99/],
  ['¿Cuándo es el próximo taller?', 'wa', /\$24,99/],
  ['¿Cuánto cuesta el curso de Finanzas con IA?', '/curso-finanzas-ia', /\$299,99/],
  ['¿Cuánto cuesta una página web?', '/paginas-web', /\$14,99.*\$29,99.*\$59,99.*\$99,99/],
  ['¿Qué hace el tablero gerencial?', '/servicios#implementacion', /\$600/],
  ['¿Cuánto cuesta el soporte técnico?', '/servicios/acompanamiento', /\$200.*\$400.*\$600/],
  ['¿Cómo pago?', 'wa', /30 % de descuento/],
  ['¿Qué servicios tienen?', '/servicios', /Diagnóstico.*Implementación.*Formación.*Acompañamiento/],
  ['¿Qué productos tienen?', '/productos', /Software.*Cursos.*Para empezar.*Presencia.*Control.*Ventas/],
  ['quiero hablar con un asesor', 'wa', /WhatsApp/]
];
P.forEach(([q, destino, re]) => {
  const r = resp(L, q);
  ok(r, 'Luci responde «' + q + '»');
  ok(re.test(r.a), 'Luci «' + q + '»: la respuesta trae los precios del catálogo (' + re + '): ' + r.a);
  sinProhibido(textoDe(r), 'Luci «' + q + '»');
  const u = urlLuci(r.c);
  if (destino === 'wa') ok(!u, 'Luci «' + q + '»: botón de WhatsApp (' + r.c.h + ')');
  else destino.split('|').forEach(d => d === 'wa' || ok(u === d || !u, 'Luci «' + q + '»: botón a ' + d + ' (salió ' + r.c.h + ')'));
  if (u) ok(!existe(u), 'Luci «' + q + '» -> ' + u + ': ' + existe(u));
});
ok(urlLuci(resp(L, '¿Cuánto cuesta el Diagnóstico?').c) === null && /diagn/i.test(decodeURIComponent(resp(L, '¿Cuánto cuesta el Diagnóstico?').c.h)), 'el botón del Diagnóstico agenda por WhatsApp');
// «tablero» a secas nombra los dos, Hexagonal primero
const tab = resp(L, 'tablero');
ok(tab.a.indexOf('Tablero Gerencial') < tab.a.indexOf('Tablero Ejecutivo'), 'tablero: ⬡ antes que ▲');
// registro: usted en lo Hexagonal, tú en lo Triangular
['¿Qué es el Asesor financiero con IA?', '¿Cuánto cuesta la formación ejecutiva?', '¿Cuánto cuesta el Diagnóstico?'].forEach(q => ok(!/\b(tu|tus|tienes|puedes|quieres)\b/i.test(resp(L, q).a), 'registro «usted»: ' + q));
['¿Qué incluye el Plan Arranque?', '¿Cuánto cuesta Caja Clara?', '¿Cuánto cuesta el tablero ejecutivo?'].forEach(q => ok(!/\b(usted|su empresa|le entregamos)\b/i.test(resp(L, q).a), 'registro «tú»: ' + q));
// botón de la consulta gratis según la página
ok(resp(L, 'quiero agendar una cita').c.l === 'Agendar diagnóstico gratis' && resp(LH, 'quiero agendar una cita').c.l === 'Agendar consulta gratis de 20 min', 'consulta gratis: nombre según la página');
// mensajes de WhatsApp del catálogo: los de Luci coinciden con los del catálogo (misma forma y mismo precio)
const mensajes = items.map(i => i.wa.mensaje);
[['¿Cuánto cuesta la formación ejecutiva?'], ['¿Qué es el Asesor financiero con IA?'], ['¿Qué incluye el Plan Arranque?'], ['quiero Mis Finanzas Claras']].forEach(([q]) => {
  const r = resp(L, q), m = decodeURIComponent(r.c.h.replace(/^https:\/\/wa\.me\/\d+\?text=/, ''));
  ok(mensajes.some(x => x.replace(/ ¿Podemos conversar\?| ¿Cómo pago\?/, '') === m.replace(/ ¿Podemos conversar\?| ¿Cómo pago\?/, '')), 'el mensaje de Luci «' + q + '» es el del catálogo: ' + m);
});
// las páginas que cargan Luci y el buscador existen; los atajos por página son útiles
ok(/QUICK_HEX/.test(leer('assets/luci.js')) && !/'\/(hexagonal|triangular|cursos)'/.test(leer('assets/luci.js')), 'los atajos por página usan las rutas nuevas');
ok(!/PAGINA_HEX = .*(hexagonal|asesoria-estrategica|despliegue|masterclasses|acompanamiento-continuo)/.test(leer('assets/luci.js')), 'PAGINA_HEX sin rutas viejas');

// ---------- Mapa del sitio de la lupa: líneas → Servicios / Productos → grupos que se abren y se cierran ----------
B.buscar('');
const mapa = B.html();
const posCol = c => mapa.indexOf('<section class="sr-col sr-' + c + '"');
ok(posCol('hex') !== -1 && posCol('hex') < posCol('tri') && posCol('tri') < posCol('pag'), 'tres columnas, en este orden: Hexagonal, Triangular y Páginas');
const seccion = c => mapa.slice(posCol(c), c === 'hex' ? posCol('tri') : c === 'tri' ? posCol('pag') : mapa.length);
const gruposDe = txt => [...txt.matchAll(/<span class="sr-gt">([^<]*)<\/span>/g)].map(m => m[1].replace(/&amp;/g, '&'));
const hexTxt = seccion('hex'), triTxt = seccion('tri');
ok(hexTxt.indexOf('>Servicios<') !== -1 && hexTxt.indexOf('>Servicios<') < hexTxt.indexOf('>Productos<'), 'en la Hexagonal: primero Servicios y luego Productos');
ok(JSON.stringify(gruposDe(hexTxt)) === JSON.stringify(['Diagnóstico y consultoría', 'Implementación y automatización', 'Formación', 'Acompañamiento y asesoría', 'Software', 'Cursos y programas']), 'la Hexagonal agrupa por categoría, lo cercano junto: ' + gruposDe(hexTxt).join(' | '));
ok(JSON.stringify(gruposDe(triTxt)) === JSON.stringify(['Software', 'Cursos y programas', 'Para empezar', 'Presencia y web', 'Control y finanzas', 'Ventas y atención']), 'la Triangular agrupa por categoría: ' + gruposDe(triTxt).join(' | '));
ok(/Servicios<\/div><div class="sr-vacio">Por ahora, solo productos listos para usar\./.test(triTxt), 'la Triangular muestra Servicios con su aviso, sin inventar nada');
const nGrupos = (mapa.match(/<details class="sr-g"/g) || []).length;
ok(nGrupos === 12 && (mapa.match(/class="sr-chev"/g) || []).length === 12, 'doce grupos desplegables, cada uno con su flecha (hay ' + nGrupos + ')');
ok(!/<details class="sr-g" open>/.test(mapa), 'al abrir la lupa todos los grupos están cerrados (menos densidad)');
ok(/<button type="button" id="search-toggle-all">Expandir todo<\/button>/.test(leer('assets/search.js').replace(/'\s*\+\s*\n\s*'/g, '')), 'hay un botón «Expandir todo» para abrir o cerrar todos los grupos');
B.buscar('tablero');
const mapaQ = B.html();
const gq = (mapaQ.match(/<details class="sr-g"/g) || []).length, gqAbiertos = (mapaQ.match(/<details class="sr-g" open>/g) || []).length;
ok(gq > 0 && gq === gqAbiertos, 'al buscar, los grupos con coincidencias se abren solos y solo salen esos (' + gqAbiertos + ' de ' + gq + ')');
B.buscar('');

// ---------- Globo «¿Dudas?»: a los 5 s aparece, a los 20 s desaparece; abrir el chat lo oculta de inmediato ----------
function cargarGlobo(sinCarga) {
  const e = entorno('/', { eventos: EVENTOS });
  ['luci-toggle', 'luci-panel', 'luci-close', 'luci-messages', 'luci-quick', 'luci-form', 'luci-input'].forEach(id => { e.ids[id] = nodo(id); });
  e.ids['luci-toggle'].parentNode = nodo('p');
  const cola = []; let ahora = 0;
  e.ctx.setTimeout = (f, ms) => { const t = { f, en: ahora + ms, vivo: true }; cola.push(t); return t; };
  e.ctx.clearTimeout = t => { if (t) t.vivo = false; };
  vm.createContext(e.ctx);
  vm.runInContext(leer('assets/luci.js'), e.ctx, { filename: 'luci.js' });
  const toggle = e.ids['luci-toggle'];
  const globo = toggle.parentNode.children.find(h => h.id === 'luci-pill');
  const avanzar = ms => {
    const meta = ahora + ms;
    for (;;) {
      const p = cola.filter(t => t.vivo && t.en <= meta).sort((a, b) => a.en - b.en)[0];
      if (!p) break;
      ahora = p.en; p.vivo = false; p.f();
    }
    ahora = meta;
  };
  const visible = () => globo.classList.contains('is-visible');
  const cargar = () => (e.ventana.oyentes.load || []).forEach(f => f()); // la página termina de cargar: aquí arranca el reloj
  if (!sinCarga) cargar();
  return { cargar, e, toggle, globo, avanzar, visible, abrir: e.ventana.FV_LUCI.abrir, vivos: () => cola.filter(t => t.vivo).length };
}
const G = cargarGlobo();
ok(G.globo && G.globo.textContent === '¿Dudas?', 'el globo dice solamente «¿Dudas?»');
ok(G.globo.attrs['aria-hidden'] === 'true', 'el globo es decorativo (aria-hidden)');
ok(/Pregúntale a Luci/.test(G.toggle.attrs['aria-label'] || '') && /responde al instante/.test(G.toggle.attrs['aria-label'] || ''), 'el botón de Luci conserva su aria-label completo');
ok(!G.visible(), 'antes de los 5 s el globo no se ve (0 s)');
G.avanzar(4999); ok(!G.visible(), 'a los 4,999 s el globo sigue oculto');
G.avanzar(1); ok(G.visible(), 'a los 5 s el globo aparece');
G.avanzar(14999); ok(G.visible(), 'a los 19,999 s el globo sigue visible');
G.avanzar(1); ok(!G.visible(), 'a los 20 s (15 s después de aparecer) el globo desaparece');
G.avanzar(60000); ok(!G.visible() && G.vivos() === 0, 'no vuelve a aparecer y no quedan temporizadores');
const G2 = cargarGlobo();
G2.avanzar(3000); G2.abrir(); G2.avanzar(30000);
ok(!G2.visible(), 'si se abre el chat antes de los 5 s, el globo no llega a aparecer');
const G3 = cargarGlobo();
G3.avanzar(6000); ok(G3.visible(), 'el globo está visible a los 6 s');
G3.abrir(); ok(!G3.visible(), 'al abrir el chat el globo se oculta de inmediato');
G3.avanzar(30000); ok(!G3.visible() && G3.vivos() === 0, 'y no vuelve');
const G5 = cargarGlobo(true);
G5.avanzar(20000); ok(!G5.visible(), 'el reloj de 5 s no corre hasta que la página termina de cargar');
G5.cargar(); G5.avanzar(4999); ok(!G5.visible(), 'a los 4,999 s de cargada la página sigue oculto');
G5.avanzar(1); ok(G5.visible(), 'a los 5 s de cargada la página aparece');
const G6 = cargarGlobo(true);
G6.abrir(); G6.cargar(); G6.avanzar(30000);
ok(!G6.visible() && G6.vivos() === 0, 'si se abre el chat antes de que termine de cargar, el globo no llega a aparecer');
const G4 = cargarGlobo();
G4.avanzar(6000);
ok((G4.e.ventana.oyentes.pagehide || []).length === 1, 'hay limpieza de temporizadores al salir de la página (pagehide)');
G4.e.ventana.oyentes.pagehide.forEach(f => f());
ok(!G4.visible() && G4.vivos() === 0, 'pagehide cancela los temporizadores y oculta el globo');
const css = leer('assets/luci.js');
ok(/#luci-pill\{[^}]*opacity:0;visibility:hidden/.test(css) && /transition:opacity \.3s ease/.test(css) && /prefers-reduced-motion:reduce\)\{#luci-pill,#luci-pill\.is-visible\{transition:none\}/.test(css), 'el globo entra y sale con transición de opacidad, y sin animación con prefers-reduced-motion');
ok(!/luci-hint/.test(leer('index.html')) && !/luci-hint/.test(css), 'ya no existe el aviso aparte de Luci (un solo globo)');

console.log(n + ' comprobaciones correctas (buscador y Luci)');
informe.forEach(l => console.log('  ' + l));
