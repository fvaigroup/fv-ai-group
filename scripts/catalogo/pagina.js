// Página HTML completa del sitio (<head> de /ejecutivos, encabezado y pie por marcadores, Luci, búsqueda y medición).
// La usan /servicios y /productos y la usará la Fase 3 (páginas de detalle). Todas las rutas son ABSOLUTAS (/assets/...).
//
//   renderPagina({ ruta, titulo, descripcion, og, jsonld, activo, hijo, wa, cuerpo, claseBody, claseMain, estilos, scriptsExtra })
//
//   ruta         ruta pública sin dominio ni ancla («/servicios», «/servicios/diagnostico»): fija la URL canónica
//   titulo       <title> (ya con « | F&V AI Group » si corresponde)
//   descripcion  meta description
//   og           { imagen (URL absoluta), alt, titulo?, descripcion? }  (titulo y descripcion por defecto: los de la página)
//   jsonld       objeto o lista de objetos para <script type="application/ld+json">
//   activo       inicio | servicios | productos | nosotros | contacto | ninguno   (marcador de encabezado)
//   hijo         true si es un detalle del grupo activo (el grupo lleva aria-current="true")
//   wa           mensaje de WhatsApp del encabezado (texto plano, sin comillas dobles)
//   cuerpo       HTML que va DENTRO de <main id="main-content"> (el build rellena encabezado y pie por sus marcadores)
//   claseBody    clases del <body> (por defecto las del sitio)
//   claseMain    clases del <main> (por ejemplo «linea-hex»)
//   estilos      CSS extra para un <style> propio (opcional)
//   scriptsExtra HTML extra justo antes de </body> (opcional)
//   comentario   texto de un comentario HTML bajo el <!DOCTYPE> (las páginas generadas avisan «no editar a mano»)
const fs = require('fs');
const path = require('path');
const { esc } = require('./precio');

const DOMINIO = 'https://www.fvaigroup.com';
const leer = nombre => fs.readFileSync(path.join(__dirname, nombre), 'utf8').replace(/\r\n/g, '\n').replace(/\n+$/, '');

function jsonSeguro(obj) {
  return JSON.stringify(obj, null, 2).replace(/</g, '\\u003c');
}

function renderPagina(o) {
  if (!o || !o.ruta || !o.titulo || !o.descripcion) throw new Error('renderPagina: faltan ruta, titulo o descripcion');
  if (!/^\//.test(o.ruta)) throw new Error(`renderPagina: la ruta debe empezar por «/» (${o.ruta})`);
  const activo = o.activo || 'ninguno';
  const wa = o.wa || 'Hola F&V, tengo una consulta';
  if (/"/.test(wa)) throw new Error('renderPagina: el mensaje de WhatsApp no puede llevar comillas dobles');
  const url = DOMINIO + o.ruta;
  const og = o.og || {};
  if (!og.imagen) throw new Error('renderPagina: falta og.imagen (URL absoluta)');
  if (!/^https:\/\//.test(og.imagen)) throw new Error('renderPagina: og.imagen debe ser una URL absoluta (https://...)');
  const ogTitulo = og.titulo || o.titulo;
  const ogDescripcion = og.descripcion || o.descripcion;
  const jsonld = o.jsonld ? (Array.isArray(o.jsonld) ? o.jsonld : [o.jsonld]) : [];
  const claseBody = o.claseBody || 'bg-fv-black text-slate-300 font-sans antialiased';
  const claseMain = o.claseMain ? ` class="${esc(o.claseMain)}"` : '';
  const marcaHeader = `<!-- header:inicio activo="${activo}"${o.hijo ? ' hijo="si"' : ''} wa="${wa}" -->`;

  const cabecera = [
    '<!DOCTYPE html>',
    o.comentario ? `<!-- ${o.comentario.replace(/-->/g, '')} -->` : null,
    '<html lang="es" class="scroll-smooth">',
    '<head>',
    leer('head-analitica.html'),
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    `<title>${esc(o.titulo)}</title>`,
    `<meta name="description" content="${esc(o.descripcion)}">`,
    `<link rel="canonical" href="${esc(url)}">`,
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="F&amp;V AI Group">',
    '<meta property="og:locale" content="es_VE">',
    `<meta property="og:title" content="${esc(ogTitulo)}">`,
    `<meta property="og:description" content="${esc(ogDescripcion)}">`,
    `<meta property="og:url" content="${esc(url)}">`,
    `<meta property="og:image" content="${esc(og.imagen)}">`,
    `<meta property="og:image:width" content="${og.ancho || 1200}">`,
    `<meta property="og:image:height" content="${og.alto || 630}">`,
    og.alt ? `<meta property="og:image:alt" content="${esc(og.alt)}">` : null,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${esc(ogTitulo)}">`,
    `<meta name="twitter:description" content="${esc(ogDescripcion)}">`,
    `<meta name="twitter:image" content="${esc(og.imagen)}">`,
    og.alt ? `<meta name="twitter:image:alt" content="${esc(og.alt)}">` : null,
    '<meta name="theme-color" content="#000000">',
    ...jsonld.map(j => `<script type="application/ld+json">\n${jsonSeguro(j)}\n</script>`),
    '<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">',
    '<link rel="icon" type="image/png" href="/assets/favicon-64.png">',
    '<link rel="stylesheet" href="/assets/css/tailwind.css">',
    leer('head-fuentes.html'),
    '<style>',
    leer('base.css'),
    '</style>',
    o.estilos ? `<style>\n${o.estilos}\n</style>` : null,
    '</head>',
  ].filter(x => x !== null);

  const cuerpo = [
    `<body class="${esc(claseBody)}">`,
    '<a href="#main-content" class="skip-link">Saltar al contenido principal</a>',
    '<div id="page-load-bar"></div>',
    '',
    '<!-- ============ HEADER ============ -->',
    marcaHeader,
    '<!-- header:fin -->',
    '<div id="scroll-progress"></div>',
    '',
    `<main id="main-content"${claseMain}>`,
    o.cuerpo || '',
    '</main>',
    '',
    '<!-- ============ FOOTER ============ -->',
    '<!-- footer:inicio -->',
    '<!-- footer:fin -->',
    '',
    leer('final.html'),
    o.scriptsExtra || null,
    '</body>',
    '</html>',
  ].filter(x => x !== null);

  return cabecera.join('\n') + '\n' + cuerpo.join('\n') + '\n';
}

module.exports = { DOMINIO, renderPagina, jsonSeguro };
