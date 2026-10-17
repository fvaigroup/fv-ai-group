// Genera sitemap.xml desde el catálogo (páginas de detalle) y la lista de páginas estáticas vivas de abajo.
//
//   node scripts/catalogo/sitemap.js           escribe sitemap.xml
//   node scripts/catalogo/sitemap.js --check   no escribe; sale con código 1 si sitemap.xml no está al día
//
// También lo corre scripts/build-html.js (con su --check incluido). Es determinista: sin fechas de la máquina.
//   lastmod = fecha_actualizacion de data/catalogo-base.json (se cambia a mano cuando cambia el contenido del sitio).
//   Prioridades: inicio 1.0 · /servicios y /productos 0.9 · detalles del catálogo 0.7 · el resto 0.6.
// Quedan FUERA a propósito: las páginas viejas (ya borradas; sus URLs redirigen desde vercel.json), 404, privacidad, términos y demo-catalogo.
// Para publicar una página nueva (no del catálogo) agréguela a PAGINAS_ESTATICAS; tests/sitemap.test.js avisa si falta.
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..', '..');
const DOMINIO = 'https://www.fvaigroup.com';

// Páginas estáticas vivas, en el orden en que salen en el sitemap: [ruta, prioridad, changefreq]
const PAGINAS_ESTATICAS = [
  ['/', '1.0', 'weekly'],
  ['/servicios', '0.9', 'weekly'],
  ['/productos', '0.9', 'weekly'],
  ['/ejecutivos', '0.6', 'monthly'],
  ['/nosotros', '0.6', 'monthly'],
  ['/contacto', '0.6', 'monthly'],
  ['/casos', '0.6', 'monthly'],
  ['/calculadora', '0.6', 'monthly'],
  ['/calculadora-roi', '0.6', 'monthly'],
  ['/paginas-web', '0.6', 'monthly'],
  ['/curso-finanzas-ia', '0.6', 'monthly'],
  ['/club', '0.6', 'monthly'],
  ['/condominio', '0.6', 'monthly'],
  ['/gym', '0.6', 'monthly'],
];
const PRIORIDAD_DETALLE = '0.7';

// Páginas que existen pero no se publican en el sitemap
const EXCLUIDAS = ['404.html', 'privacidad.html', 'terminos.html', 'demo-catalogo.html'];

function leerJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(RAIZ, rel), 'utf8'));
}

function cargarCatalogo() {
  const principal = path.join(RAIZ, 'data/catalogo.json');
  return leerJson(fs.existsSync(principal) ? 'data/catalogo.json' : 'data/catalogo-base.json');
}

function fechaActualizacion() {
  const base = leerJson('data/catalogo-base.json').fecha_actualizacion;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(base || ''))) {
    throw new Error('data/catalogo-base.json necesita "fecha_actualizacion": "AAAA-MM-DD"');
  }
  return base;
}

// Rutas de las páginas de detalle generadas (sin ancla), únicas, en el orden del catálogo: servicios primero
function rutasDetalle(catalogo) {
  const rutas = [];
  const agregar = url => {
    const ruta = String(url).split('#')[0];
    if (ruta && !rutas.includes(ruta)) rutas.push(ruta);
  };
  for (const tipo of ['servicio', 'producto']) {
    for (const it of (catalogo.items || []).filter(i => i.tipo === tipo && i.detalle && i.detalle.modo === 'generada')) agregar(it.detalle.url);
    for (const p of (catalogo.paginas_compartidas || []).filter(x => x.tipo === tipo)) agregar(`${catalogo.tipos[tipo].ruta}/${p.id}`);
  }
  return rutas;
}

// [{ ruta, prioridad, changefreq }] en el orden del sitemap
function entradas(catalogo) {
  const cat = catalogo || cargarCatalogo();
  const lista = PAGINAS_ESTATICAS.map(([ruta, prioridad, changefreq]) => ({ ruta, prioridad, changefreq }));
  const estaticas = new Set(lista.map(e => e.ruta));
  for (const ruta of rutasDetalle(cat)) {
    if (estaticas.has(ruta)) continue;
    lista.push({ ruta, prioridad: PRIORIDAD_DETALLE, changefreq: 'monthly' });
  }
  return lista;
}

function xml(catalogo) {
  const lastmod = fechaActualizacion();
  const filas = entradas(catalogo).map(e => [
    '  <url>',
    `    <loc>${DOMINIO}${e.ruta === '/' ? '/' : e.ruta}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${e.changefreq}</changefreq>`,
    `    <priority>${e.prioridad}</priority>`,
    '  </url>',
  ].join('\n'));
  return ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...filas, '</urlset>', ''].join('\n');
}

// Escribe sitemap.xml (o solo compara con check). Devuelve true si estaba desactualizado.
function sincronizar(opciones) {
  opciones = opciones || {};
  const ruta = path.join(RAIZ, 'sitemap.xml');
  const actual = fs.existsSync(ruta) ? fs.readFileSync(ruta, 'utf8').replace(/\r\n/g, '\n') : '';
  const nuevo = xml(opciones.catalogo);
  if (nuevo === actual) return false;
  if (!opciones.check) fs.writeFileSync(ruta, nuevo, 'utf8');
  return true;
}

module.exports = { DOMINIO, PAGINAS_ESTATICAS, EXCLUIDAS, entradas, rutasDetalle, xml, sincronizar, fechaActualizacion };

if (require.main === module) {
  try {
    const check = process.argv.includes('--check');
    const cambio = sincronizar({ check });
    if (check) {
      if (cambio) { console.error('sitemap: sitemap.xml está desactualizado. Corra: node scripts/catalogo/sitemap.js'); process.exitCode = 1; }
      else console.log('sitemap: al día');
    } else {
      console.log(cambio ? 'sitemap: sitemap.xml actualizado' : 'sitemap: sin cambios');
    }
  } catch (e) { console.error('sitemap: ' + e.message); process.exitCode = 1; }
}
