// Páginas que el build genera desde data/catalogo.json (hoy: /servicios y /productos; la Fase 3 suma los detalles).
//   generarPaginas(catalogo) -> { 'servicios.html': '<html…>', 'productos.html': '<html…>' }
// Las páginas salen con los marcadores de encabezado y pie VACÍOS: scripts/build-html.js los rellena con insertar().
// Este módulo no escribe archivos: el build decide si escribe (npm run build) o solo compara (--check).
const { renderListado } = require('./listados');

function generarPaginas(catalogo) {
  const paginas = {};
  for (const tipo of ['servicio', 'producto']) {
    const t = (catalogo.tipos || {})[tipo];
    if (!t || !t.archivo) throw new Error(`El catálogo no define tipos.${tipo}.archivo`);
    paginas[t.archivo] = renderListado(tipo, catalogo);
  }
  return paginas;
}

module.exports = { generarPaginas };
