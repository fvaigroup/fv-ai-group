// Tarjeta corta de un ítem del catálogo y rejilla de tarjetas.
//
//   renderTarjeta(item, catalogo, ctx)   -> HTML de UNA tarjeta
//        ctx: { nivel (encabezado del nombre, 2 a 6; por defecto 3), deps ({ sw, ev }; por defecto se leen de assets/) }
//   renderRejilla(ids, catalogo, opciones) -> HTML de la rejilla (ids en ese orden)
//        opciones: { cols (2, 3 o 4; por defecto 3), nivel, deps }
//   reemplazarMarcadores(html, catalogo, archivo) -> HTML con los marcadores de tarjetas rellenados:
//        <!-- tarjetas:inicio ids="diagnostico,asesor-financiero" cols="4" [nivel="3"] --> ... <!-- tarjetas:fin -->
//
// Reglas de la tarjeta: forma y color de la línea, nombre, una frase, precio, plazo (si hay) y UN SOLO enlace «Ver detalle».
// Sin WhatsApp, sin «Línea Hexagonal/Triangular». El enlace cubre toda la tarjeta (enlace estirado), así que hay un solo destino.
const { dependencias, itemPorId } = require('./cargar');
const { esc, precioDeItem, htmlPrecio } = require('./precio');

const RE_MARCADOR = /<!-- tarjetas:inicio\b([^>]*?)-->[\s\S]*?<!-- tarjetas:fin -->/g;

const RELOJ = '<svg class="tarjeta-icono" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
const FLECHA = '<svg class="tarjeta-icono" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

function linea(catalogo, clave) {
  const l = (catalogo.lineas || {})[clave];
  if (!l) throw new Error(`El catálogo no define la línea «${clave}»`);
  return l;
}

function renderTarjeta(item, catalogo, ctx) {
  ctx = ctx || {};
  const nivel = Math.min(6, Math.max(2, ctx.nivel || 3));
  const deps = ctx.deps || dependencias();
  const l = linea(catalogo, item.linea);
  const precio = precioDeItem(item, deps);
  const hex = item.linea === 'hex';
  const id = `tarjeta-${item.id}`;
  const detalle = (item.detalle || {}).url;
  if (!detalle) throw new Error(`${item.id}: falta detalle.url`);
  const clases = `tarjeta x-card ${l.clase}${hex ? ' hex-legible' : ''}`;
  return [
    `<article class="${clases}" data-item="${esc(item.id)}" data-linea="${item.linea}" aria-labelledby="${esc(id)}">`,
    '  <div class="tarjeta-cuerpo">',
    `    <span class="tarjeta-forma nav-forma nav-${item.linea}" role="img" aria-label="${esc(l.leyenda)}"></span>`,
    `    <h${nivel} id="${esc(id)}" class="tarjeta-nombre">${esc(item.nombre)}</h${nivel}>`,
    `    <p class="tarjeta-frase">${esc(item.frase)}</p>`,
    '  </div>',
    '  <div class="tarjeta-pie">',
    htmlPrecio(precio).split('\n').map(x => '    ' + x).join('\n'),
    item.plazo ? `    <div class="tarjeta-plazo">${RELOJ}<span>${esc(item.plazo)}</span></div>` : null,
    `    <a href="${esc(detalle)}" class="tarjeta-boton btn-linea-sec estado-interactivo" aria-label="Ver detalle de ${esc(item.nombre)}" data-evento="ver_detalle" data-item="${esc(item.id)}" data-linea="${item.linea}"><span>Ver detalle</span>${FLECHA}</a>`,
    '  </div>',
    '</article>',
  ].filter(x => x !== null).join('\n');
}

function renderRejilla(ids, catalogo, opciones) {
  opciones = opciones || {};
  const cols = [2, 3, 4].includes(Number(opciones.cols)) ? Number(opciones.cols) : 3;
  const tarjetas = ids.map(id => renderTarjeta(itemPorId(catalogo, id), catalogo, { nivel: opciones.nivel, deps: opciones.deps }));
  return `<div class="tarjetas-rejilla tarjetas-cols-${cols}">\n${tarjetas.join('\n')}\n</div>`;
}

// Rejilla ya armada con las tarjetas de una lista de ítems (la usan los listados, que agrupan por línea)
function renderRejillaDeItems(items, catalogo, opciones) {
  return renderRejilla(items.map(i => i.id), catalogo, opciones);
}

function leerAtributos(texto) {
  const a = {};
  String(texto).replace(/([a-z]+)="([^"]*)"/g, (m, k, v) => { a[k] = v; return m; });
  return a;
}

function reemplazarMarcadores(html, catalogo, archivo) {
  const origen = archivo || '(página)';
  return html.replace(RE_MARCADOR, (m, attrs) => {
    const a = leerAtributos(attrs);
    const ids = String(a.ids || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!ids.length) throw new Error(`${origen}: el marcador tarjetas:inicio necesita ids="id1,id2,..."`);
    if (a.cols !== undefined && !['2', '3', '4'].includes(a.cols)) throw new Error(`${origen}: cols debe ser 2, 3 o 4 (hay «${a.cols}»)`);
    let rejilla;
    try { rejilla = renderRejilla(ids, catalogo, { cols: a.cols, nivel: a.nivel ? Number(a.nivel) : undefined }); }
    catch (e) { throw new Error(`${origen}: ${e.message}`); }
    return `<!-- tarjetas:inicio${attrs.replace(/\s+$/, '')} -->\n${rejilla}\n<!-- tarjetas:fin -->`;
  });
}

module.exports = { RE_MARCADOR, renderTarjeta, renderRejilla, renderRejillaDeItems, reemplazarMarcadores, leerAtributos };
