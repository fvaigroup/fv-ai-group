// Pruebas del catálogo: node tests/catalogo.test.js
// Reglas: ver data/ESQUEMA.md y scripts/validar-catalogo.js.
const fs = require('fs');
const path = require('path');
const { validar } = require('../scripts/validar-catalogo.js');
const { listaDetalles } = require('../scripts/catalogo/detalle.js');

const RAIZ = path.resolve(__dirname, '..');
let n = 0;
function ok(c, m) { n++; if (!c) { console.error('✗ ' + m); process.exitCode = 1; } }

const archivo = path.join(RAIZ, 'data/catalogo.json');
if (!fs.existsSync(archivo)) {
  console.log('catalogo: aún no existe data/catalogo.json (se crea en la Fase 1)');
} else {
  const cat = JSON.parse(fs.readFileSync(archivo, 'utf8'));
  const errores = validar(cat);
  errores.forEach(x => ok(false, x));
  ok(errores.length === 0, 'el catálogo cumple el esquema');
  ok((cat.items || []).length > 0, 'el catálogo tiene ítems');
  // La Hexagonal siempre va primero dentro de cada categoría
  for (const t of Object.values(cat.tipos)) for (const c of t.categorias) {
    const lineas = cat.items.filter(i => i.categoria === c.id && (i.tipo === (t.ruta === '/servicios' ? 'servicio' : 'producto'))).sort((a, b) => (a.orden || 0) - (b.orden || 0)).map(i => i.linea);
    const primeraTri = lineas.indexOf('tri'), ultimaHex = lineas.lastIndexOf('hex');
    ok(primeraTri === -1 || ultimaHex === -1 || ultimaHex < primeraTri, `${c.id}: los ítems hex deben ir antes que los tri (campo orden)`);
  }
  // Páginas de detalle: cada ítem tiene la suya y cada página generada pertenece a un ítem o a una página compartida
  const detalles = listaDetalles(cat);
  const existentes = new Set(cat.paginas_existentes_como_detalle || []);
  for (const it of cat.items) {
    const d = it.detalle || {};
    if (d.modo === 'generada') {
      const pagina = detalles.find(x => (x.item && x.item.id === it.id) || (x.compartida && x.compartida.miembros.includes(it.id)));
      ok(!!pagina, `${it.id}: tiene su página de detalle generada`);
      if (pagina) ok(fs.existsSync(path.join(RAIZ, pagina.archivo)), `${it.id}: existe ${pagina.archivo}`);
    } else {
      ok(d.modo === 'existente' && existentes.has(d.url), `${it.id}: su detalle existente (${d.url}) está en paginas_existentes_como_detalle`);
    }
  }
  for (const d of detalles) {
    if (d.compartida) ok(d.compartida.miembros.length > 0 && d.compartida.miembros.every(id => cat.items.some(i => i.id === id && i.detalle.pagina === d.compartida.id)), `${d.archivo}: sus miembros apuntan a la página compartida`);
    else ok(cat.items.some(i => i.id === d.item.id), `${d.archivo}: pertenece a un ítem del catálogo`);
  }
  // Sitemap y buscador: cada página de detalle generada figura en ambos
  const mapa = fs.readFileSync(path.join(RAIZ, 'sitemap.xml'), 'utf8');
  const buscador = fs.readFileSync(path.join(RAIZ, 'assets/search.js'), 'utf8');
  for (const d of detalles) {
    const ruta = '/' + d.archivo.replace(/.html$/, '');
    // Ocultos desde el 29 oct 2026: fuera del sitemap (y filtrados en el buscador al cargar) hasta que se vuelvan a publicar
    ok(!mapa.includes(`<loc>https://www.fvaigroup.com${ruta}</loc>`), `${ruta}: no está en sitemap.xml (oculta)`);
    ok(buscador.includes(`url: '${ruta}'`), `${ruta}: está en el buscador (assets/search.js)`);
  }
  console.log(`catalogo: ${n} comprobaciones${process.exitCode ? ' (CON FALLAS)' : ' correctas'}`);
}
