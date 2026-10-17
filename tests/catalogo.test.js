// Pruebas del catálogo: node tests/catalogo.test.js
// Reglas: ver data/ESQUEMA.md y scripts/validar-catalogo.js.
const fs = require('fs');
const path = require('path');
const { validar } = require('../scripts/validar-catalogo.js');

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
  console.log(`catalogo: ${n} comprobaciones${process.exitCode ? ' (CON FALLAS)' : ' correctas'}`);
}
