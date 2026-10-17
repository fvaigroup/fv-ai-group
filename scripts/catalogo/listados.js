// Páginas de listado /servicios y /productos, generadas desde data/catalogo.json.
//
//   renderListado(tipo, catalogo, opciones) -> HTML completo de la página (con los marcadores de encabezado y pie vacíos,
//        que rellena scripts/build-html.js). tipo: 'servicio' | 'producto'.
//        opciones: { deps ({ sw, ev }), extra (HTML de partials/<x>-extra.html, o '' si no existe) }
//   jsonldListado(tipo, catalogo, deps) -> CollectionPage con ItemList (Schema.org)
//
// Estructura: portada (título, introducción, definición, leyenda y atajos a las categorías); una <section id="{categoria.id}">
// por categoría, en el orden del catálogo, con el bloque ⬡ ARRIBA y el bloque ▲ ABAJO (solo los que tienen ítems);
// ganchos <!-- extra:inicio --> / <!-- extra:fin --> para la Fase 5; cierre con WhatsApp.
// «Línea Hexagonal/Triangular» no aparece: solo la forma (⬡ ▲), el color y la leyenda en palabras simples.
const fs = require('fs');
const path = require('path');
const { RAIZ, dependencias, itemsDe } = require('./cargar');
const { esc, montosNumericos } = require('./precio');
const { renderTarjeta } = require('./tarjetas');
const { DOMINIO, renderPagina } = require('./pagina');

const WA_NUMERO = '584244125386';
const COMENTARIO = 'generado por scripts/build-html.js desde data/catalogo.json: no editar a mano';
const FORMAS = { '⬡': 'hex', '▲': 'tri' };

// Textos propios de cada página (lo demás sale del catálogo: tipos.X.*)
const PAGINAS = {
  servicio: {
    activo: 'servicios',
    imagen: `${DOMINIO}/assets/og/servicios.png`,
    alt: 'Servicios de F&V AI Group para empresas e instituciones',
    wa: 'Hola F&V, vengo de la página de Servicios y tengo una consulta',
    extra: 'partials/servicios-extra.html',
    cierre: {
      titulo: '¿No sabe por dónde empezar?',
      texto: 'Cuéntenos cómo es su empresa por WhatsApp, o agende una consulta gratis de 20 minutos. Le decimos qué servicio le conviene.',
      mensaje: 'Hola F&V, estoy viendo los servicios y quiero conversar sobre mi empresa',
      evento: 'servicios_whatsapp', cta: 'servicios_cierre', producto: 'consulta-servicios',
      consulta: true,
    },
    claseMain: 'linea-hex',
  },
  producto: {
    activo: 'productos',
    imagen: `${DOMINIO}/assets/og/productos.png`,
    alt: 'Productos de F&V AI Group con precio claro en dólares',
    wa: 'Hola F&V, vengo de la página de Productos y tengo una consulta',
    extra: 'partials/productos-extra.html',
    cierre: {
      titulo: '¿No sabes cuál te conviene?',
      texto: 'Escríbenos por WhatsApp, cuéntanos cómo es tu negocio u organización y te ayudamos a elegir.',
      mensaje: 'Hola F&V, estoy viendo los productos y quiero que me ayuden a elegir uno',
      evento: 'productos_whatsapp', cta: 'productos_cierre', producto: 'consulta-productos',
      consulta: false,
    },
    claseMain: '',
  },
};

const WHATSAPP_SVG = '<svg class="w-6 h-6 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M17.6 6.32A7.85 7.85 0 0012.05 4a7.94 7.94 0 00-6.9 11.9L4 20l4.2-1.1a7.9 7.9 0 003.85 1h.01a7.94 7.94 0 007.94-7.94 7.87 7.87 0 00-2.4-5.64zm-5.55 12.2h-.01a6.6 6.6 0 01-3.36-.92l-.24-.14-2.5.65.66-2.43-.16-.25a6.6 6.6 0 01-1.02-3.52 6.62 6.62 0 016.63-6.62 6.58 6.58 0 014.68 1.95 6.58 6.58 0 011.94 4.68 6.62 6.62 0 01-6.62 6.6zm3.63-4.95c-.2-.1-1.17-.58-1.35-.64-.18-.07-.31-.1-.45.1-.13.2-.51.64-.62.77-.11.13-.23.14-.42.05-.2-.1-.83-.31-1.58-.98-.58-.52-.98-1.16-1.09-1.36-.11-.2-.01-.3.09-.4.09-.09.2-.23.3-.35.1-.11.13-.2.2-.32.06-.13.03-.24-.02-.34-.05-.1-.45-1.08-.61-1.48-.16-.39-.33-.33-.45-.34-.12 0-.25-.01-.38-.01-.13 0-.35.05-.53.24-.18.2-.7.68-.7 1.66s.72 1.93.82 2.06c.1.13 1.4 2.15 3.41 3.01.48.2.85.33 1.14.42.48.15.91.13 1.26.08.38-.06 1.17-.48 1.34-.94.16-.46.16-.86.11-.94-.05-.09-.18-.14-.38-.24z"/></svg>';

function datosTipo(cat, tipo) {
  const t = (cat.tipos || {})[tipo];
  if (!t) throw new Error(`El catálogo no tiene tipos.${tipo}`);
  return t;
}

// ---------------------------------------------------------------- leyenda
// «⬡ Empresas e instituciones · ▲ Negocios pequeños» -> [{ linea, texto }]
function partesLeyenda(cat) {
  const partes = String(cat.leyenda || '').split('·').map(s => s.trim()).filter(Boolean);
  return partes.map(p => {
    const linea = FORMAS[p.charAt(0)];
    if (!linea) throw new Error(`catalogo.leyenda: «${p}» debe empezar por ⬡ o ▲`);
    return { linea, texto: p.slice(1).trim() };
  });
}

function htmlLeyenda(cat) {
  const partes = partesLeyenda(cat).map(p =>
    `<span class="lst-ley"><span class="nav-forma nav-${p.linea}" aria-hidden="true"></span><span>${esc(p.texto)}</span></span>`);
  return `<p class="lst-leyenda" aria-label="Leyenda de las formas">${partes.join('<span class="lst-sep" aria-hidden="true">·</span>')}</p>`;
}

// ---------------------------------------------------------------- bloques
// Cabecera del bloque: forma + leyenda de la línea; en Software, el «desde» de la línea (de assets/precios-software.js)
function cabeceraBloque(cat, linea, categoriaId, deps) {
  const texto = (cat.lineas[linea] || {}).leyenda;
  let desde = '';
  if (categoriaId === 'software') desde = `desde ${deps.sw.fmtPrecio(linea, deps.sw.desde(linea))}/mes`;
  return `<h3 class="lst-bloque-cab"><span class="nav-forma nav-${linea}" aria-hidden="true"></span><span class="lst-bloque-nombre">${esc(texto)}</span>${desde ? `<span class="lst-bloque-desde">${esc(desde)}</span>` : ''}</h3>`;
}

function htmlBloque(cat, linea, items, categoriaId, deps) {
  const clase = cat.lineas[linea].clase + (linea === 'hex' ? ' hex-legible' : '');
  const tarjetas = items.map(i => renderTarjeta(i, cat, { nivel: 4, deps })).join('\n');
  return [
    `<div class="lst-bloque ${clase}" data-bloque="${linea}">`,
    `  ${cabeceraBloque(cat, linea, categoriaId, deps)}`,
    '  <div class="tarjetas-rejilla tarjetas-cols-3">',
    tarjetas,
    '  </div>',
    '</div>',
  ].join('\n');
}

function htmlCategoria(cat, tipo, c, indice, deps) {
  const t = datosTipo(cat, tipo);
  const bloques = ['hex', 'tri']
    .map(l => ({ linea: l, items: itemsDe(cat, tipo, c.id, l) }))
    .filter(b => b.items.length)
    .map(b => htmlBloque(cat, b.linea, b.items, c.id, deps));
  const otro = t.otro_enlace
    ? `\n    <p class="lst-otro"><a href="${esc(t.otro_enlace.href)}" class="link-underline !whitespace-normal">${esc(t.otro_enlace.texto).replace(" →", " →")}</a></p>` : '';
  const n = String(indice + 1).padStart(2, '0');
  const par = indice % 2 === 1 ? ' bg-fv-surface2/40' : '';
  const legible = tipo === 'servicio' ? ' hex-legible' : '';
  return [
    `<section id="${esc(c.id)}" class="lst-cat scroll-mt-28 py-14 lg:py-20 border-b border-white/5${par}${legible}" aria-labelledby="cat-${esc(c.id)}">`,
    '  <div class="max-w-7xl mx-auto px-6 lg:px-8">',
    '    <header class="lst-cat-cab">',
    `      <span class="lst-cat-n font-head" aria-hidden="true">${n}</span>`,
    `      <h2 id="cat-${esc(c.id)}" class="font-sans text-3xl sm:text-4xl font-semibold text-white leading-tight tracking-tight text-balance">${esc(c.nombre)}</h2>`,
    c.intro ? `      <p class="lst-cat-intro text-slate-300 max-w-3xl">${esc(c.intro)}</p>` : null,
    '    </header>',
    '    <div class="lst-bloques">',
    bloques.map(b => b.split('\n').map(x => '      ' + x).join('\n')).join('\n'),
    '    </div>' + otro,
    '  </div>',
    '</section>',
  ].filter(x => x !== null).join('\n');
}

// ---------------------------------------------------------------- portada y cierre
function htmlPortada(cat, tipo) {
  const t = datosTipo(cat, tipo);
  const legible = tipo === 'servicio' ? ' hex-legible' : '';
  const chips = t.categorias.map(c =>
    `<li><a href="#${esc(c.id)}" class="lst-chip estado-interactivo" data-evento="${tipo === 'servicio' ? 'servicios' : 'productos'}_atajo_${esc(c.id)}">${esc(c.nombre)}</a></li>`).join('\n          ');
  return [
    `<section class="lst-portada relative pt-32 pb-12 lg:pt-40 lg:pb-16 overflow-hidden border-b border-white/5${legible}" aria-labelledby="lst-titulo">`,
    '  <div class="absolute inset-0 grain opacity-30 [mask-image:radial-gradient(ellipse_at_top,black_0%,transparent_65%)]" aria-hidden="true"></div>',
    '  <div class="absolute top-0 left-0 w-[520px] h-[520px] bg-fv-cyanMid/[0.06] rounded-full blur-[130px] pointer-events-none -translate-x-1/3 -translate-y-1/3" aria-hidden="true"></div>',
    '  <div class="absolute bottom-0 right-0 w-[520px] h-[520px] bg-fv-orange/[0.06] rounded-full blur-[150px] pointer-events-none translate-x-1/4 translate-y-1/4" aria-hidden="true"></div>',
    '  <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">',
    '    <div class="grid lg:grid-cols-12 gap-8 lg:gap-12 items-end">',
    '      <div class="lg:col-span-7">',
    `        <h1 id="lst-titulo" class="font-sans text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.05] mb-6"><span class="texto-linea lst-h1">${esc(t.titulo)}</span></h1>`,
    `        <p class="lst-intro text-slate-200 max-w-2xl">${esc(t.intro)}</p>`,
    '      </div>',
    '      <div class="lg:col-span-5">',
    '        <div class="lst-def">',
    `          <p class="lst-def-texto text-slate-200">${esc(t.definicion)}</p>`,
    `          ${htmlLeyenda(cat)}`,
    '        </div>',
    '      </div>',
    '    </div>',
    `    <nav class="mt-10 lg:mt-12" aria-label="Categorías de ${esc(t.titulo)}">`,
    '      <ul class="lst-chips">',
    `          ${chips}`,
    '      </ul>',
    '    </nav>',
    '  </div>',
    '</section>',
  ].join('\n');
}

function htmlCierre(cat, tipo, conf) {
  const t = datosTipo(cat, tipo);
  const legible = tipo === 'servicio' ? ' hex-legible' : '';
  const wa = `https://wa.me/${WA_NUMERO}?text=${encodeURIComponent(conf.mensaje)}`;
  const consulta = conf.consulta
    ? `\n        <a href="/contacto#agenda" data-evento="servicios_consulta_gratis" data-cta="${conf.cta}" class="btn-linea-sec estado-interactivo lst-boton flex items-center justify-center px-7 py-3.5 rounded-xl font-head font-medium text-center">Consulta gratis de 20 min</a>` : '';
  return [
    `<section class="py-16 lg:py-24${legible}" aria-labelledby="cierre-titulo">`,
    '  <div class="max-w-4xl mx-auto px-6 lg:px-8">',
    '    <div class="x-card is-featured is-static relative overflow-hidden px-6 py-12 sm:px-12 sm:py-14 text-center" style="border-radius:1.5rem">',
    `      <h2 id="cierre-titulo" class="font-sans text-3xl sm:text-4xl font-semibold text-white leading-tight tracking-tight text-balance mb-4">${esc(conf.titulo)}</h2>`,
    `      <p class="text-slate-300 max-w-2xl mx-auto mb-8">${esc(conf.texto)}</p>`,
    '      <div class="flex flex-col sm:flex-row gap-3 justify-center">',
    `        <a href="${esc(wa)}" target="_blank" rel="noopener" data-evento="${conf.evento}" data-product="${conf.producto}" data-cta="${conf.cta}" class="btn-linea lst-boton flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-head font-semibold text-center">${WHATSAPP_SVG}<span>Escribir por WhatsApp</span></a>${consulta}`,
    '      </div>',
    '    </div>',
    '  </div>',
    '</section>',
  ].join('\n');
}

// ---------------------------------------------------------------- datos estructurados
function ofertas(item, deps) {
  const m = montosNumericos(item, deps);
  if (!m.length) return null;
  const modo = item.precio.modo;
  const bajo = Math.min(...m), alto = Math.max(...m);
  const num = n => String(n);
  if ((modo === 'fijo' || modo === 'evento') && m.length === 1) {
    return { '@type': 'Offer', price: num(bajo), priceCurrency: 'USD' };
  }
  const o = { '@type': 'AggregateOffer', lowPrice: num(bajo), priceCurrency: 'USD' };
  if (alto !== bajo) o.highPrice = num(alto);
  return o;
}

function jsonldListado(tipo, cat, deps) {
  deps = deps || dependencias();
  const t = datosTipo(cat, tipo);
  const cfg = PAGINAS[tipo];
  const url = DOMINIO + t.ruta;
  const items = [];
  t.categorias.forEach(c => ['hex', 'tri'].forEach(l => items.push(...itemsDe(cat, tipo, c.id, l))));
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}#pagina`,
    url,
    name: t.meta_titulo,
    description: t.meta_descripcion,
    inLanguage: 'es-VE',
    isPartOf: { '@type': 'WebSite', name: 'F&V AI Group', url: `${DOMINIO}/` },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${DOMINIO}/` },
        { '@type': 'ListItem', position: 2, name: t.titulo, item: url },
      ],
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((i, k) => {
        const elemento = {
          '@type': tipo === 'servicio' ? 'Service' : 'Product',
          name: i.nombre,
          description: i.frase,
          url: DOMINIO + i.detalle.url,
        };
        const of = ofertas(i, deps);
        if (of) elemento.offers = of;
        return { '@type': 'ListItem', position: k + 1, item: elemento };
      }),
    },
  };
}

// ---------------------------------------------------------------- página
// Contenido del gancho de la Fase 5: partials/servicios-extra.html o partials/productos-extra.html (si existe)
function leerExtra(tipo) {
  const archivo = path.join(RAIZ, PAGINAS[tipo].extra);
  if (!fs.existsSync(archivo)) return '';
  return fs.readFileSync(archivo, 'utf8').replace(/\r\n/g, '\n').replace(/\n+$/, '');
}

function renderListado(tipo, cat, opciones) {
  opciones = opciones || {};
  const deps = opciones.deps || dependencias();
  const cfg = PAGINAS[tipo];
  if (!cfg) throw new Error(`renderListado: tipo desconocido «${tipo}»`);
  const t = datosTipo(cat, tipo);
  const extra = opciones.extra !== undefined ? opciones.extra : leerExtra(tipo);
  const categorias = t.categorias.map((c, i) => htmlCategoria(cat, tipo, c, i, deps)).join('\n\n');
  const cuerpo = [
    '',
    '<!-- ============ PORTADA ============ -->',
    htmlPortada(cat, tipo),
    '',
    '<!-- ============ CATEGORÍAS ============ -->',
    categorias,
    '',
    '<!-- extra:inicio -->',
    extra || null,
    '<!-- extra:fin -->',
    '',
    '<!-- ============ CIERRE ============ -->',
    htmlCierre(cat, tipo, cfg.cierre),
    '',
  ].filter(x => x !== null).join('\n');

  return renderPagina({
    ruta: t.ruta,
    titulo: t.meta_titulo,
    descripcion: t.meta_descripcion,
    og: { imagen: cfg.imagen, alt: cfg.alt },
    jsonld: jsonldListado(tipo, cat, deps),
    activo: cfg.activo,
    wa: cfg.wa,
    cuerpo,
    claseMain: cfg.claseMain,
    comentario: COMENTARIO,
  });
}

module.exports = { PAGINAS, COMENTARIO, partesLeyenda, renderListado, jsonldListado, htmlCategoria, htmlBloque, ofertas };
