// Pruebas de redirecciones: node tests/redirecciones.test.js
// vercel.json (redirects) y assets/anclas-viejas.js:
//   - cada origen es único, permanente y sin barra final;
//   - ningún destino es a su vez origen (sin cadenas) y todos existen (archivo vivo y ancla);
//   - ninguna página legacy se alcanza sin redirección (con y sin .html) y ninguna redirección tapa una página viva;
//   - no hay redirección de /servicios ni /productos;
//   - las anclas viejas de /hexagonal y /triangular llegan a su destino nuevo desde /servicios y /productos.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const B = require('../scripts/build-html.js');
const { cargarCatalogo } = require('../scripts/catalogo/cargar');

const RAIZ = B.RAIZ;
let n = 0;
function ok(c, m) { n++; if (!c) { console.error('✗ ' + m); process.exitCode = 1; } }

const vercel = JSON.parse(fs.readFileSync(path.join(RAIZ, 'vercel.json'), 'utf8'));
const redirects = vercel.redirects || [];
const leer = rel => fs.readFileSync(path.join(RAIZ, rel), 'utf8');
const idsDe = rel => new Set([...leer(rel).matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));

// '/servicios/x' -> 'servicios/x.html'; '/' -> 'index.html'. null si no existe.
function archivoDe(ruta) {
  const limpia = ruta.replace(/^\//, '').replace(/\/$/, '');
  const rel = limpia === '' ? 'index.html' : limpia + '.html';
  return fs.existsSync(path.join(RAIZ, rel)) ? rel : null;
}
const separar = url => { const i = url.indexOf('#'); return i < 0 ? [url, ''] : [url.slice(0, i), url.slice(i + 1)]; };

// ---------------------------------------------------------------- orígenes
const origenes = redirects.map(r => r.source);
ok(redirects.length > 0, 'vercel.json tiene redirecciones');
ok(new Set(origenes).size === origenes.length, `cada origen es único (repetidos: ${origenes.filter((o, i) => origenes.indexOf(o) !== i).join(', ') || 'ninguno'})`);
for (const r of redirects) {
  ok(r.permanent === true, `${r.source}: debe ser permanente (301)`);
  ok(/^\/[^#?]*$/.test(r.source) && (r.source === '/' || !/\/$/.test(r.source)), `${r.source}: origen sin ancla, consulta ni barra final`);
  ok(/^\/[^?]*$/.test(r.destination), `${r.source}: destino interno y absoluto (${r.destination})`);
}

// ---------------------------------------------------------------- sin cadenas y con destino vivo
const comoOrigen = new Set(origenes.flatMap(o => [o, o.replace(/\.html$/, '')]));
for (const r of redirects) {
  const [ruta, ancla] = separar(r.destination);
  ok(!comoOrigen.has(ruta), `${r.source} -> ${r.destination}: el destino es a su vez origen de otra redirección (cadena)`);
  const archivo = archivoDe(ruta);
  ok(!!archivo, `${r.source} -> ${r.destination}: el destino no existe como archivo`);
  if (!archivo) continue;
  ok(!B.LEGACY.includes(archivo), `${r.source} -> ${r.destination}: el destino es una página legacy`);
  if (ancla) ok(idsDe(archivo).has(ancla), `${r.source} -> ${r.destination}: la página ${archivo} no tiene el id «${ancla}»`);
}

// ---------------------------------------------------------------- legacy y páginas vivas
for (const f of B.LEGACY) {
  const nombre = '/' + f.replace(/\.html$/, '');
  ok(origenes.includes(nombre), `legacy ${f}: falta la redirección de ${nombre}`);
  ok(origenes.includes(nombre + '.html'), `legacy ${f}: falta la redirección de ${nombre}.html`);
}
for (const o of origenes) {
  const archivo = archivoDe(o.replace(/\.html$/, ''));
  ok(!archivo || B.LEGACY.includes(archivo), `${o}: la redirección tapa una página viva (${archivo})`);
}
for (const p of ['/servicios', '/productos', '/servicios.html', '/productos.html']) {
  ok(!origenes.includes(p), `no debe haber redirección de ${p}`);
}
// Alias que el dueño pidió conservar o crear
const ESPERADAS = {
  '/hexagonal': '/servicios', '/triangular': '/productos', '/software': '/productos#software', '/cursos': '/productos#cursos',
  '/asesoria-estrategica': '/servicios/diagnostico', '/diagnostico': '/servicios/diagnostico', '/evaluacion-procesos': '/servicios/diagnostico',
  '/habilitacion-equipos': '/servicios/formacion-equipo', '/despliegue-ejecucion': '/servicios#implementacion',
  '/masterclasses-workshops': '/servicios#formacion', '/acompanamiento-continuo': '/servicios/acompanamiento',
  '/express': '/productos', '/triangular-express': '/productos', '/soluciones': '/', '/precios': '/',
};
for (const [o, d] of Object.entries(ESPERADAS)) {
  for (const src of [o, o + '.html']) {
    const r = redirects.find(x => x.source === src);
    ok(r && r.destination === d, `${src} debe ir a ${d} (hoy: ${r ? r.destination : 'sin redirección'})`);
  }
}

// ---------------------------------------------------------------- anclas viejas (assets/anclas-viejas.js)
const codigoAnclas = leer('assets/anclas-viejas.js');
// Ejecuta el script como lo haría el navegador: devuelve { reemplazo, hashLimpio }
function correrAnclas(pagina, hash) {
  const ids = idsDe(pagina + '.html');
  const estado = { reemplazo: null, hashLimpio: false };
  const location = {
    hash: '#' + hash, pathname: '/' + pagina, search: '',
    replace(u) { estado.reemplazo = u; },
  };
  const ctx = {
    location,
    document: { getElementById: id => (ids.has(id) ? {} : null) },
    window: { addEventListener() {} },
    history: { replaceState() { estado.hashLimpio = true; } },
    decodeURIComponent,
  };
  ctx.window.history = ctx.history;
  vm.createContext(ctx);
  vm.runInContext(codigoAnclas, ctx, { filename: 'assets/anclas-viejas.js' });
  return estado;
}
function destinoExiste(url, etiqueta) {
  const [ruta, ancla] = separar(url);
  const archivo = archivoDe(ruta);
  ok(!!archivo && !B.LEGACY.includes(archivo), `${etiqueta}: ${url} no existe o es legacy`);
  if (archivo && ancla) ok(idsDe(archivo).has(ancla), `${etiqueta}: ${url} no tiene el id «${ancla}»`);
}

// Ejemplos pedidos
const EJEMPLOS = {
  'servicios': {
    'web-corporativa-crm': '/servicios/web-corporativa-crm', 'formacion-equipo': '/servicios/formacion-equipo',
    'habilitacion-equipos': '/servicios/formacion-equipo', 'evaluacion-procesos': '/servicios/diagnostico',
    'asesoria-estrategica': '/servicios/diagnostico', 'programa-ejecutivo': '/ejecutivos#programa-ejecutivo',
    'presencia': '/paginas-web', 'acompanamiento-estandar': '/servicios/acompanamiento#estandar',
    'acompanamiento-prioritario': '/servicios/acompanamiento#prioritario', 'director-ia': '/servicios/acompanamiento#director-ia',
  },
  'productos': {
    'taller-plata-clara': '/productos/taller-plata-clara', 'aprende': '/productos/taller-plata-clara',
    'plan-arranque': '/productos/plan-arranque', 'caja-clara': '/productos/caja-clara', 'tablero-ejecutivo': '/productos/tablero-ejecutivo',
    'asistente-ia': '/productos/asistente-ia', 'mis-finanzas-claras': '/productos/mis-finanzas-claras',
  },
};
for (const [pagina, casos] of Object.entries(EJEMPLOS)) {
  for (const [hash, esperado] of Object.entries(casos)) {
    const r = correrAnclas(pagina, hash);
    ok(r.reemplazo === esperado, `/${pagina}#${hash} debe ir a ${esperado} (hoy: ${r.reemplazo})`);
    if (r.reemplazo) destinoExiste(r.reemplazo, `/${pagina}#${hash}`);
  }
}
// Anclas de categoría actuales: se quedan donde están
const CATEGORIAS = {
  'servicios': ['diagnostico', 'implementacion', 'formacion', 'acompanamiento'],
  'productos': ['software', 'cursos', 'para-empezar', 'presencia', 'control', 'ventas'],
};
for (const [pagina, lista] of Object.entries(CATEGORIAS)) {
  for (const hash of lista) {
    const r = correrAnclas(pagina, hash);
    ok(r.reemplazo === null && !r.hashLimpio, `/${pagina}#${hash} es una categoría actual y no debe moverse (fue a ${r.reemplazo})`);
  }
}
// El Asesor F&V triangular ya no existe: se quita el ancla y la página no cambia
for (const hash of ['asesor', 'asesor-sesion', 'asesor-enfoque', 'asesor-mensual', 'asesor-pro']) {
  const r = correrAnclas('productos', hash);
  ok(r.reemplazo === null && r.hashLimpio, `/productos#${hash}: debe quitarse el ancla sin cambiar de página`);
}
// Un ancla desconocida no se toca
{ const r = correrAnclas('servicios', 'algo-que-no-existe'); ok(r.reemplazo === null && !r.hashLimpio, 'un ancla desconocida no se toca'); }

// Cobertura: cada id de tarjeta de las páginas legacy llega a algún lado desde la página a la que hoy redirige
const cat = cargarCatalogo();
const idsCatalogo = new Set(cat.items.map(i => i.id));
const EXTRA_VIEJOS = ['asesoria-estrategica', 'evaluacion-procesos', 'habilitacion-equipos', 'aprende', 'finanzas-ia-grupal', 'taller-chatgpt',
  'mensualidades', 'cat-aprende', 'cat-plata', 'cat-ventas', 'cat-sistemas', 'cat-mensual', 'asesor'];
const COBERTURA = [['hexagonal', 'servicios'], ['triangular', 'productos']];
let cubiertos = 0;
for (const [legacy, nueva] of COBERTURA) {
  const idsNueva = idsDe(nueva + '.html');
  const desaparecen = new Set(['asesor']);
  for (const id of idsDe(legacy + '.html')) {
    if (!(idsCatalogo.has(id) || EXTRA_VIEJOS.includes(id))) continue;
    if (/^(club|condominio|gym)-/.test(id)) continue;
    const r = correrAnclas(nueva, id);
    if (idsNueva.has(id)) { ok(r.reemplazo === null && !r.hashLimpio, `/${nueva}#${id} existe en la página y no debe moverse`); cubiertos++; continue; }
    ok(r.reemplazo !== null || (desaparecen.has(id) && r.hashLimpio), `/${legacy}#${id} (-> /${nueva}#${id}) no tiene destino en assets/anclas-viejas.js`);
    if (r.reemplazo) destinoExiste(r.reemplazo, `/${nueva}#${id}`);
    cubiertos++;
  }
}
ok(cubiertos >= 20, `la cobertura de anclas viejas revisó ${cubiertos} ids (se esperaban al menos 20)`);

// Las páginas que cargan el script: solo /servicios y /productos (a través de final.html), y solo si hay ancla
const final = leer('scripts/catalogo/final.html');
ok(/assets\/anclas-viejas\.js/.test(final) && /servicios\|productos/.test(final), 'final.html carga anclas-viejas.js solo en /servicios y /productos');
for (const f of fs.readdirSync(RAIZ).filter(x => /\.html$/.test(x))) {
  ok(!/anclas-viejas\.js/.test(leer(f)) || f === 'servicios.html' || f === 'productos.html', `${f}: no debe cargar anclas-viejas.js`);
}

console.log(`redirecciones: ${n} comprobaciones${process.exitCode ? ' (CON FALLAS)' : ' correctas'}`);
