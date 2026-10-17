// Lectura de los datos que alimentan las tarjetas y los listados:
//   - data/catalogo.json (o catalogo-base.json si todavía no existe)
//   - assets/precios-software.js (módulo UMD: se puede require())
//   - assets/eventos.js (script de navegador: se ejecuta con el módulo vm de Node y un window falso, igual que tests/eventos.test.js)
// Todo es determinista: nada depende de la fecha ni de la máquina.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAIZ = path.resolve(__dirname, '..', '..');

function cargarCatalogo() {
  const principal = path.join(RAIZ, 'data/catalogo.json');
  const base = path.join(RAIZ, 'data/catalogo-base.json');
  const archivo = fs.existsSync(principal) ? principal : base;
  return JSON.parse(fs.readFileSync(archivo, 'utf8'));
}

// Tabla de precios del software (Club, Condominio, Gym): { desde(linea), fmt, fmtEntero, fmtPrecio, ... }
function cargarPreciosSoftware() {
  return require(path.join(RAIZ, 'assets/precios-software.js'));
}

// Datos de los cursos y talleres (assets/eventos.js): { taller: { precio, ... }, curso: { precio, cuotas, ... } }
function cargarEventos() {
  const codigo = fs.readFileSync(path.join(RAIZ, 'assets/eventos.js'), 'utf8');
  const document = { readyState: 'complete', addEventListener() {}, querySelectorAll() { return []; } };
  const window = {};
  const ctx = { window, document, Date, Intl, requestAnimationFrame: fn => fn(), setTimeout: () => 0, console };
  vm.createContext(ctx);
  vm.runInContext(codigo, ctx, { filename: 'assets/eventos.js' });
  if (!window.FV_EVENTOS || !window.FV_EVENTOS.eventos) throw new Error('assets/eventos.js no definió window.FV_EVENTOS.eventos');
  // Se copia a un objeto del contexto principal (los objetos de vm tienen otro prototipo)
  return JSON.parse(JSON.stringify(window.FV_EVENTOS.eventos));
}

// Dependencias de precio por defecto (se cargan una vez)
let _deps = null;
function dependencias() {
  if (!_deps) _deps = { sw: cargarPreciosSoftware(), ev: cargarEventos() };
  return _deps;
}

// Ítems de un tipo (servicio | producto), opcionalmente de una categoría y/o línea, por el campo "orden"
function itemsDe(cat, tipo, categoriaId, linea) {
  return (cat.items || [])
    .filter(i => i.tipo === tipo && (!categoriaId || i.categoria === categoriaId) && (!linea || i.linea === linea))
    .sort((a, b) => (a.orden || 0) - (b.orden || 0));
}

function itemPorId(cat, id) {
  const it = (cat.items || []).find(i => i.id === id);
  if (!it) throw new Error(`El catálogo no tiene ningún ítem con id «${id}»`);
  return it;
}

module.exports = { RAIZ, cargarCatalogo, cargarPreciosSoftware, cargarEventos, dependencias, itemsDe, itemPorId };
