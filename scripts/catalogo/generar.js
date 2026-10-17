// Páginas que el build genera desde data/catalogo.json:
//   - /servicios y /productos (listados)
//   - una página de detalle por cada ítem con detalle.modo = "generada" (servicios/<id>.html y productos/<id>.html) y una por cada
//     página compartida (por ejemplo servicios/acompanamiento.html), ver scripts/catalogo/detalle.js
//   generarPaginas(catalogo) -> { 'servicios.html': '<html…>', 'productos.html': '<html…>', 'servicios/diagnostico.html': '<html…>', … }
// Las páginas salen con los marcadores de encabezado y pie VACÍOS: scripts/build-html.js los rellena con insertar().
// Este módulo no escribe archivos: el build decide si escribe (npm run build) o solo compara (--check).
const { renderListado } = require('./listados');
const { generarDetalles } = require('./detalle');

function generarPaginas(catalogo) {
  const paginas = {};
  for (const tipo of ['servicio', 'producto']) {
    const t = (catalogo.tipos || {})[tipo];
    if (!t || !t.archivo) throw new Error(`El catálogo no define tipos.${tipo}.archivo`);
    paginas[t.archivo] = renderListado(tipo, catalogo);
  }
  Object.assign(paginas, generarDetalles(catalogo));
  return paginas;
}

module.exports = { generarPaginas };
