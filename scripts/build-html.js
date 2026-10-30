// Inserta el encabezado y el pie compartidos (partials/) en todas las páginas del sitio.
//
// Uso:
//   node scripts/build-html.js            reescribe lo que haya entre los marcadores de cada página
//   node scripts/build-html.js --check    no escribe; sale con código 1 si algún archivo cambiaría
//   node scripts/build-html.js --migrar   UNA sola vez: reemplaza el <header> y el <footer> viejos por los marcadores
//
// Marcadores (en cada página):
//   <!-- header:inicio activo="servicios" wa="Hola F&V, me interesa..." -->  ...  <!-- header:fin -->
//   <!-- footer:inicio -->  ...  <!-- footer:fin -->
//   activo  = inicio | hexagonal | triangular | servicios | productos | nosotros | contacto | ninguno   (obligatorio)
//   hijo    = si   (opcional) la página es un detalle del grupo activo: el grupo lleva aria-current="true"
//             y no "page". Las páginas de servicios/ y productos/ lo son siempre.
//   wa      = mensaje de WhatsApp de esa página, en texto plano (el build lo codifica). Sin él: «Hola F&V, tengo una consulta».
//
// Las categorías de los desplegables salen de data/catalogo.json (si existe) o de data/catalogo-base.json.
// Determinista y con saltos de línea LF: sin fechas ni rutas de la máquina.
// Funciones reutilizables para las fases que generan páginas: renderHeader, renderFooter, insertar, listarPaginas, procesarPagina.
//
// Orden de trabajo del build:
//   1) scripts/catalogo/generar.js genera las páginas del catálogo EN MEMORIA, desde data/catalogo.json: /servicios, /productos y una página
//      de detalle por ítem (servicios/<id>.html, productos/<id>.html). Las páginas de esas dos carpetas que lleven el aviso «generado por
//      scripts/build-html.js» y ya no estén en el catálogo se BORRAN (con --check se reportan como desactualizadas);
//   2) en cada página se rellenan las tarjetas de los marcadores
//        <!-- tarjetas:inicio ids="diagnostico,asesor-financiero" cols="4" -->  ...  <!-- tarjetas:fin -->
//      (cols = 2, 3 o 4 en escritorio; 1 en el teléfono y 2 en tablet; opcional nivel="3" = encabezado del nombre);
//   3) se rellenan el encabezado y el pie compartidos;
//   4) se genera sitemap.xml (scripts/catalogo/sitemap.js): catálogo + páginas estáticas vivas; con --check se compara.
//   Las páginas generadas llevan un comentario «no editar a mano»: el build las reescribe.
const fs = require('fs');
const path = require('path');
const { generarPaginas } = require('./catalogo/generar');
const { reemplazarMarcadores } = require('./catalogo/tarjetas');
const sitemap = require('./catalogo/sitemap');

const RAIZ = path.resolve(__dirname, '..');
const PARCIALES = path.join(RAIZ, 'partials');

// Páginas viejas: ya no existen (sus URLs redirigen desde vercel.json). La lista se conserva vacía porque las pruebas la importan.
// Demos con diseño propio: el build no las toca.
const LEGACY = [];
const SALTAR = ['demo-catalogo.html'];
const ACTIVOS = ['inicio', 'hexagonal', 'triangular', 'servicios', 'productos', 'nosotros', 'contacto', 'ninguno'];
const WA_NUMERO = '584244125386';
const WA_DEFECTO = 'Hola F&V, tengo una consulta';

// Sección de cada página al migrar (las páginas nuevas de servicios/ y productos/ traen sus propios marcadores)
const PAGINAS = {
  'index.html': { activo: 'inicio' },
  'ejecutivos.html': { activo: 'servicios', hijo: true },
  'club.html': { activo: 'productos', hijo: true },
  'condominio.html': { activo: 'productos', hijo: true },
  'gym.html': { activo: 'productos', hijo: true },
  'paginas-web.html': { activo: 'productos', hijo: true },
  'hexagonal.html': { activo: 'hexagonal' },
  'triangular.html': { activo: 'triangular' },
  'delta-app.html': { activo: 'ninguno' },
  'cursos.html': { activo: 'ninguno' },
  'cursos/finanzas-ia.html': { activo: 'ninguno' },
  'casos.html': { activo: 'nosotros', hijo: true },
  'calculadora.html': { activo: 'ninguno' },
  'calculadora-roi.html': { activo: 'ninguno' },
  'contacto.html': { activo: 'contacto' },
  'nosotros.html': { activo: 'nosotros' },
  'privacidad.html': { activo: 'ninguno' },
  'terminos.html': { activo: 'ninguno' },
  '404.html': { activo: 'ninguno' },
};

const RE_HEADER = /<!-- header:inicio([^>]*?)-->[\s\S]*?<!-- header:fin -->/;
const RE_FOOTER = /<!-- footer:inicio\s*-->[\s\S]*?<!-- footer:fin -->/;

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function minuscula(s) { return s.charAt(0).toLowerCase() + s.slice(1); }

// ---------------------------------------------------------------- catálogo
function cargarCatalogo() {
  const principal = path.join(RAIZ, 'data/catalogo.json');
  const base = path.join(RAIZ, 'data/catalogo-base.json');
  const archivo = fs.existsSync(principal) ? principal : base;
  return JSON.parse(fs.readFileSync(archivo, 'utf8'));
}

// Líneas que tiene una categoría de productos (hex primero). Con ítems en el catálogo salen de ellos; si no, de la regla:
// Software y Cursos y programas tienen las dos; las demás, solo la Triangular.
function lineasDeCategoria(cat, tipo, categoriaId) {
  const items = (cat.items || []).filter(i => i.tipo === tipo && i.categoria === categoriaId);
  let lineas;
  if (items.length) lineas = ['hex', 'tri'].filter(l => items.some(i => i.linea === l));
  else lineas = (categoriaId === 'software' || categoriaId === 'cursos') ? ['hex', 'tri'] : ['tri'];
  return lineas;
}

function datosTipo(cat, tipo) {
  const t = (cat.tipos || {})[tipo];
  if (!t || !Array.isArray(t.categorias)) throw new Error(`El catálogo no tiene tipos.${tipo}.categorias`);
  return t;
}

function formasHtml(cat, lineas) {
  const l = cat.lineas || {};
  const nombres = lineas.map((x, i) => (i === 0 ? (l[x] || {}).leyenda : minuscula((l[x] || {}).leyenda || ''))).join(' y ');
  const formas = lineas.map(x => `<span class="nav-forma nav-${x}"></span>`).join('');
  return `<span class="menu-formas" role="img" aria-label="${esc(nombres)}">${formas}</span>`;
}

// ---------------------------------------------------------------- listas del menú y del pie
function panelEscritorio(cat, tipo, conFormas) {
  const t = datosTipo(cat, tipo);
  const grupo = t.ruta.replace(/^\//, '');
  const filas = t.categorias.map(c => {
    const formas = conFormas ? formasHtml(cat, lineasDeCategoria(cat, tipo, c.id)) : '';
    return `              <li><a href="${t.ruta}#${c.id}" class="menu-enlace" data-menu-categoria="${grupo}/${c.id}"><span>${esc(c.nombre)}</span>${formas}</a></li>`;
  });
  return [
    '            <ul class="menu-lista">',
    ...filas,
    '            </ul>',
    `            <a href="${t.ruta}" class="menu-todos" data-menu-categoria="${grupo}/todos">Ver todos los ${esc(minuscula(t.titulo))}</a>`,
  ].join('\n');
}

function panelMovil(cat, tipo, conFormas) {
  const t = datosTipo(cat, tipo);
  const grupo = t.ruta.replace(/^\//, '');
  const filas = t.categorias.map(c => {
    const formas = conFormas ? formasHtml(cat, lineasDeCategoria(cat, tipo, c.id)) : '';
    return `              <li><a href="${t.ruta}#${c.id}" class="movil-enlace" data-menu-categoria="${grupo}/${c.id}"><span>${esc(c.nombre)}</span>${formas}</a></li>`;
  });
  return [
    '            <ul>',
    ...filas,
    `              <li><a href="${t.ruta}" class="movil-enlace movil-todos" data-menu-categoria="${grupo}/todos">Ver todos los ${esc(minuscula(t.titulo))}</a></li>`,
    '            </ul>',
  ].join('\n');
}

function listaPie(cat, tipo) {
  const t = datosTipo(cat, tipo);
  return t.categorias.map(c =>
    `            <li><a href="${t.ruta}#${c.id}" class="inline-flex items-center min-h-[44px] hover:text-white transition-colors"><span class="link-underline !whitespace-normal">${esc(c.nombre)}</span></a></li>`
  ).join('\n');
}

// ---------------------------------------------------------------- render
function leerParcial(nombre) {
  return fs.readFileSync(path.join(PARCIALES, nombre), 'utf8').replace(/\r\n/g, '\n').replace(/\n+$/, '');
}

function rellenar(plantilla, valores, origen) {
  return plantilla.replace(/\{\{([A-Z_]+)\}\}/g, (m, k) => {
    if (!(k in valores)) throw new Error(`${origen}: token desconocido ${m}`);
    return valores[k];
  });
}

function atributoActivo(opciones, seccion) {
  if (opciones.activo !== seccion) return '';
  return opciones.hijo ? ' aria-current="true"' : ' aria-current="page"';
}

// opciones: { activo, hijo, wa, archivo }  (archivo, relativo a la raíz, solo sirve para deducir "hijo" en servicios/ y productos/)
function renderHeader(opciones, catalogo) {
  opciones = opciones || {};
  const cat = catalogo || cargarCatalogo();
  const activo = opciones.activo || 'ninguno';
  if (!ACTIVOS.includes(activo)) throw new Error(`activo «${activo}» no es válido (${ACTIVOS.join(' | ')})`);
  const archivo = String(opciones.archivo || '').replace(/\\/g, '/');
  const hijo = !!opciones.hijo || (activo === 'servicios' && /^servicios\//.test(archivo)) || (activo === 'productos' && /^productos\//.test(archivo));
  const op = { activo, hijo };
  const wa = opciones.wa || WA_DEFECTO;
  const s = datosTipo(cat, 'servicio');
  const p = datosTipo(cat, 'producto');
  return rellenar(leerParcial('header.html'), {
    WA_URL: `https://wa.me/${WA_NUMERO}?text=${encodeURIComponent(wa)}`,
    AC_INICIO: atributoActivo(op, 'inicio'),
    AC_HEXAGONAL: atributoActivo(op, 'hexagonal'),
    AC_TRIANGULAR: atributoActivo(op, 'triangular'),
    AC_SERVICIOS: atributoActivo(op, 'servicios'),
    AC_PRODUCTOS: atributoActivo(op, 'productos'),
    AC_NOSOTROS: atributoActivo(op, 'nosotros'),
    AC_CONTACTO: atributoActivo(op, 'contacto'),
    RUTA_SERVICIOS: s.ruta,
    RUTA_PRODUCTOS: p.ruta,
    TITULO_SERVICIOS: esc(s.titulo),
    TITULO_PRODUCTOS: esc(p.titulo),
    PANEL_SERVICIOS: panelEscritorio(cat, 'servicio', false),
    PANEL_PRODUCTOS: panelEscritorio(cat, 'producto', true),
    MOVIL_SERVICIOS: panelMovil(cat, 'servicio', false),
    MOVIL_PRODUCTOS: panelMovil(cat, 'producto', true),
  }, 'partials/header.html');
}

function renderFooter(catalogo) {
  const cat = catalogo || cargarCatalogo();
  return rellenar(leerParcial('footer.html'), {
    TITULO_SERVICIOS: esc(datosTipo(cat, 'servicio').titulo),
    TITULO_PRODUCTOS: esc(datosTipo(cat, 'producto').titulo),
    PIE_SERVICIOS: listaPie(cat, 'servicio'),
    PIE_PRODUCTOS: listaPie(cat, 'producto'),
  }, 'partials/footer.html');
}

function leerAtributos(texto) {
  const a = {};
  texto.replace(/([a-z]+)="([^"]*)"/g, (m, k, v) => { a[k] = v; return m; });
  return a;
}

function tieneMarcadores(html) { return RE_HEADER.test(html) && RE_FOOTER.test(html); }

// Devuelve el HTML con el encabezado y el pie renderizados entre sus marcadores. opciones: { catalogo, archivo }
function insertar(html, opciones) {
  opciones = opciones || {};
  const archivo = opciones.archivo || '(página)';
  const cat = opciones.catalogo || cargarCatalogo();
  if (!tieneMarcadores(html)) {
    throw new Error(`${archivo}: faltan los marcadores <!-- header:inicio ... --> / <!-- header:fin --> y <!-- footer:inicio --> / <!-- footer:fin -->. ` +
      'Agréguelos en la página (ver el comentario al inicio de scripts/build-html.js).');
  }
  const unix = html.replace(/\r\n/g, '\n');
  return unix
    .replace(RE_HEADER, (m, attrs) => {
      const a = leerAtributos(attrs);
      if (!a.activo) throw new Error(`${archivo}: el marcador header:inicio necesita activo="..."`);
      let cuerpo;
      try {
        cuerpo = renderHeader({ activo: a.activo, hijo: a.hijo === 'si', wa: a.wa, archivo: opciones.archivo }, cat);
      } catch (e) { throw new Error(`${archivo}: ${e.message}`); }
      return `<!-- header:inicio${attrs.replace(/\s+$/, '')} -->\n${cuerpo}\n<!-- header:fin -->`;
    })
    .replace(RE_FOOTER, () => `<!-- footer:inicio -->\n${renderFooter(cat)}\n<!-- footer:fin -->`);
}

// Una página completa: tarjetas de los marcadores + encabezado y pie. opciones: { catalogo, archivo }
function procesarPagina(html, opciones) {
  opciones = opciones || {};
  const cat = opciones.catalogo || cargarCatalogo();
  const conTarjetas = reemplazarMarcadores(html.replace(/\r\n/g, '\n'), cat, opciones.archivo);
  return insertar(conTarjetas, { catalogo: cat, archivo: opciones.archivo });
}

// Aviso que llevan las páginas generadas (scripts/catalogo/listados.js)
const AVISO_GENERADA = 'generado por scripts/build-html.js desde data/catalogo.json: no editar a mano';

// Páginas generadas que quedaron en servicios/ o productos/ y ya no pertenecen al catálogo (relativas a la raíz, con /)
function obsoletas(generadas) {
  const out = [];
  for (const d of ['servicios', 'productos']) {
    const dir = path.join(RAIZ, d);
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir).filter(x => /.html$/.test(x)).sort()) {
      const rel = `${d}/${f}`;
      if (Object.prototype.hasOwnProperty.call(generadas, rel)) continue;
      const html = fs.readFileSync(path.join(RAIZ, rel), 'utf8');
      if (html.includes(AVISO_GENERADA)) out.push(rel);
    }
  }
  return out;
}

function listarPaginas() {
  const excluidas = new Set([...LEGACY, ...SALTAR]);
  const lista = fs.readdirSync(RAIZ).filter(f => /\.html$/.test(f) && !excluidas.has(f)).sort();
  for (const d of ['servicios', 'productos', 'cursos']) {
    const dir = path.join(RAIZ, d);
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
      fs.readdirSync(dir).filter(f => /\.html$/.test(f)).sort().forEach(f => lista.push(`${d}/${f}`));
    }
  }
  return lista;
}

// ---------------------------------------------------------------- migración (se usa una vez)
const RE_MENU_MOVIL_INLINE = /[ \t]*(?:\/\/ Mobile menu\n[ \t]*)?const menuBtn = document\.getElementById\('menu-btn'\);\n[ \t]*const mobileMenu = document\.getElementById\('mobile-menu'\);\n[ \t]*const iconOpen = document\.getElementById\('icon-open'\);\n[ \t]*const iconClose = document\.getElementById\('icon-close'\);\n[\s\S]*?mobileMenu\.querySelectorAll\('a'\)\.forEach\(a => a\.addEventListener\('click', \(\) => \{[\s\S]*?\n[ \t]*\}\)\);\n(?:[ \t]*\n)?/;

function mensajeWaViejo(html) {
  const cab = (html.match(/<header id="site-header"[\s\S]*?<\/header>/) || [''])[0];
  const m = cab.match(/wa\.me\/\d+\?text=([^"]*)/);
  if (!m) return WA_DEFECTO;
  let txt;
  try { txt = decodeURIComponent(m[1]); } catch (e) { return WA_DEFECTO; }
  // Los nombres de línea ya no se usan fuera del inicio
  if (/L[ií]nea (Hexagonal|Triangular)/.test(txt)) return WA_DEFECTO;
  return txt;
}

function migrarPagina(archivo, html) {
  const cfg = PAGINAS[archivo];
  if (!cfg) throw new Error(`${archivo}: no está en PAGINAS (scripts/build-html.js); agréguela con su sección activa`);
  let out = html.replace(/\r\n/g, '\n');
  if (tieneMarcadores(out)) return out;
  const wa = mensajeWaViejo(out);
  const marcaHeader = `<!-- header:inicio activo="${cfg.activo}"${cfg.hijo ? ' hijo="si"' : ''} wa="${wa}" -->\n<!-- header:fin -->`;
  const marcaFooter = '<!-- footer:inicio -->\n<!-- footer:fin -->';

  if (archivo === '404.html') {
    // La 404 no tenía encabezado ni pie: se reorganiza el cuerpo (encabezado fijo, contenido centrado y pie al final)
    out = out.replace(
      /<body class="bg-fv-black text-slate-300 font-sans antialiased min-h-screen flex items-center justify-center relative overflow-hidden px-6">/,
      '<body class="bg-fv-black text-slate-300 font-sans antialiased min-h-screen flex flex-col relative overflow-x-hidden">');
    out = out.replace('<div id="mouse-spotlight"></div>\n', `<div id="mouse-spotlight"></div>\n\n${marcaHeader}\n`);
    out = out.replace(
      /\n\n  <div class="absolute inset-0 grain/,
      '\n\n  <div class="relative flex-1 flex items-center justify-center overflow-hidden px-6 pt-28 pb-16">\n  <div class="absolute inset-0 grain');
    out = out.replace('<div class="relative z-10 max-w-lg text-center">', '<main id="main-content" class="relative z-10 max-w-lg text-center">');
    out = out.replace(/(\n    <\/div>\n  <\/div>)(\n\n<script defer src="\/assets\/medicion\.js">)/, `\n    </div>\n  </main>\n  </div>\n\n${marcaFooter}$2`);
    return out;
  }

  const rh = /<header id="site-header"[\s\S]*?<\/header>/g;
  if ((out.match(rh) || []).length !== 1) throw new Error(`${archivo}: se esperaba exactamente un <header id="site-header">`);
  out = out.replace(rh, () => marcaHeader);
  const rf = /<footer[\s\S]*?<\/footer>/g;
  if ((out.match(rf) || []).length !== 1) throw new Error(`${archivo}: se esperaba exactamente un <footer>`);
  out = out.replace(rf, () => marcaFooter);
  if (!RE_MENU_MOVIL_INLINE.test(out)) throw new Error(`${archivo}: no se encontró el bloque inline del menú móvil`);
  out = out.replace(RE_MENU_MOVIL_INLINE, '');
  return out;
}

// ---------------------------------------------------------------- principal
function main(argv) {
  const check = argv.includes('--check');
  const migrar = argv.includes('--migrar');
  const cat = cargarCatalogo();
  const cambiadas = [];
  const generadas = generarPaginas(cat);               // 1) páginas del catálogo, en memoria
  const sobran = obsoletas(generadas);                 // generadas antes y que ya no están en el catálogo
  const lista = Array.from(new Set([...listarPaginas(), ...Object.keys(generadas)])).filter(f => !sobran.includes(f)).sort();
  for (const f of sobran) {
    cambiadas.push(f + ' (obsoleta)');
    if (!check) fs.unlinkSync(path.join(RAIZ, f));
  }
  for (const archivo of lista) {
    const ruta = path.join(RAIZ, archivo);
    const actual = fs.existsSync(ruta) ? fs.readFileSync(ruta, 'utf8') : '';
    const esGenerada = Object.prototype.hasOwnProperty.call(generadas, archivo);
    let nuevo = esGenerada ? generadas[archivo] : actual.replace(/\r\n/g, '\n');
    if (migrar && !esGenerada) nuevo = migrarPagina(archivo, nuevo);
    nuevo = procesarPagina(nuevo, { catalogo: cat, archivo });   // 2) tarjetas  3) encabezado y pie
    if (nuevo !== actual) {
      cambiadas.push(archivo);
      if (!check) { fs.mkdirSync(path.dirname(ruta), { recursive: true }); fs.writeFileSync(ruta, nuevo, 'utf8'); }
    }
  }
  if (sitemap.sincronizar({ check, catalogo: cat })) cambiadas.push('sitemap.xml');   // 4) sitemap
  const total = lista.length;
  if (check) {
    if (cambiadas.length) {
      console.error(`build-html: ${cambiadas.length} página(s) desactualizada(s): ${cambiadas.join(', ')}. Corra: node scripts/build-html.js`);
      return 1;
    }
    console.log(`build-html: ${total} páginas al día`);
    return 0;
  }
  console.log(`build-html: ${total} páginas, ${cambiadas.length} actualizada(s)${cambiadas.length ? ': ' + cambiadas.join(', ') : ''}`);
  return 0;
}

module.exports = {
  RAIZ, LEGACY, SALTAR, ACTIVOS, PAGINAS, AVISO_GENERADA, obsoletas,
  cargarCatalogo, lineasDeCategoria, renderHeader, renderFooter, insertar, procesarPagina, tieneMarcadores, listarPaginas, leerAtributos,
};

if (require.main === module) {
  try { process.exitCode = main(process.argv.slice(2)); }
  catch (e) { console.error('build-html: ' + e.message); process.exitCode = 1; }
}
