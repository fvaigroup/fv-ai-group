// Valida el catálogo (data/catalogo.json) contra las reglas de data/ESQUEMA.md.
// Uso: node scripts/validar-catalogo.js [archivo.json ...]   (sin argumentos: data/catalogo.json)
// Un archivo parcial ({ items: [...], paginas_compartidas?: [...], bloques?: {...} }) se valida contra data/catalogo-base.json.
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');
const PROHIBIDAS = [
  [/L[ií]nea (Hexagonal|Triangular)/, 'nombre de línea (solo puede aparecer en el inicio)'],
  [/\bexpress\b/i, '«Express» no existe'],
  [/Asesor F&(amp;)?V|Sesi[oó]n Clara|Pack Enfoque|Asesor Mensual|Asesor Pro/, 'el Asesor F&V ya no existe'],
];
const MODOS = ['fijo', 'desde', 'a-medida', 'software', 'evento'];
const PRODUCTOS_SW = ['club', 'condominio', 'gym'];
const EVENTOS = ['curso', 'taller'];

function palabras(s) { return String(s || '').trim().split(/\s+/).filter(Boolean).length; }
function* textos(obj, ruta) {
  if (typeof obj === 'string') yield [ruta, obj];
  else if (Array.isArray(obj)) for (let i = 0; i < obj.length; i++) yield* textos(obj[i], `${ruta}[${i}]`);
  else if (obj && typeof obj === 'object') for (const k of Object.keys(obj)) yield* textos(obj[k], `${ruta}.${k}`);
}
function montos(texto) { return String(texto || '').match(/\$\s?\d[\d.]*(,\d+)?/g) || []; }
function montoNumero(m) { return parseFloat(m.replace('$', '').trim().replace(/\./g, '').replace(',', '.')); }

function validar(cat, opciones) {
  opciones = opciones || {};
  const e = [];
  const err = (id, msg) => e.push(`${id}: ${msg}`);
  const tipos = cat.tipos || {};
  const items = cat.items || [];
  const ids = new Set();
  const compartidas = cat.paginas_compartidas || [];
  const idsCompartidas = new Set(compartidas.map(p => p.id));
  const existentes = new Set(cat.paginas_existentes_como_detalle || []);

  for (const it of items) {
    const id = it.id || '(sin id)';
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(it.id || '')) err(id, 'id debe ser kebab-case en minúsculas');
    if (ids.has(it.id)) err(id, 'id repetido');
    ids.add(it.id);
    if (!['servicio', 'producto'].includes(it.tipo)) err(id, 'tipo debe ser servicio o producto');
    const t = tipos[it.tipo];
    if (t && !(t.categorias || []).some(c => c.id === it.categoria)) err(id, `categoría «${it.categoria}» no existe en ${it.tipo}`);
    if (!['hex', 'tri'].includes(it.linea)) err(id, 'linea debe ser hex o tri');
    if (it.tipo === 'servicio' && it.linea !== 'hex') err(id, 'todos los servicios son hex');
    if (!it.nombre) err(id, 'falta nombre');
    const n = palabras(it.frase);
    if (n < 3 || n > 15) err(id, `la frase tiene ${n} palabras (de 3 a 15)`);
    // precio
    const p = it.precio || {};
    if (!MODOS.includes(p.modo)) err(id, `precio.modo debe ser uno de ${MODOS.join(', ')}`);
    else if (p.modo === 'software') { if (!PRODUCTOS_SW.includes(p.producto)) err(id, 'precio.producto de software inválido'); }
    else if (p.modo === 'evento') { if (!EVENTOS.includes(p.evento)) err(id, 'precio.evento debe ser curso o taller'); }
    else {
      if (!p.texto) err(id, 'falta precio.texto');
      if (p.modo === 'a-medida') {
        if (p.texto !== 'a medida') err(id, 'precio.texto de a-medida debe ser «a medida»');
        if (p.referencia && !/precio final después del diagnóstico/.test(p.nota || '')) err(id, 'con referencia, precio.nota debe decir «precio final después del diagnóstico»');
      }
      if (p.modo === 'desde' && !/^desde \$/.test(p.texto || '')) err(id, 'precio.texto de modo desde debe empezar con «desde $»');
      for (const m of montos(p.texto).concat(montos(p.referencia))) {
        const v = montoNumero(m);
        if (it.linea === 'hex') { if (!Number.isInteger(v) || v % 10) err(id, `monto Hexagonal ${m} debe ser múltiplo de 10`); if (/,/.test(m)) err(id, `monto Hexagonal ${m} sin decimales`); }
        else if (!/,99$/.test(m)) err(id, `monto Triangular ${m} debe terminar en ,99`);
      }
    }
    // detalle
    const d = it.detalle || {};
    if (d.modo === 'generada') {
      const base = d.url ? d.url.split('#')[0] : '';
      if (!new RegExp(`^/${it.tipo}s/[a-z0-9-]+$`).test(base)) err(id, `detalle.url debe ser /${it.tipo}s/<pagina>`);
      if (d.pagina && !idsCompartidas.has(d.pagina)) err(id, `detalle.pagina «${d.pagina}» no está en paginas_compartidas`);
      if (d.pagina && base !== `/${it.tipo}s/${d.pagina}`) err(id, 'detalle.url debe apuntar a la página compartida');
      if (!d.pagina && base !== `/${it.tipo}s/${it.id}`) err(id, `detalle.url debe ser /${it.tipo}s/${it.id}`);
    } else if (d.modo === 'existente') {
      if (!existentes.has(d.url)) err(id, `detalle.url «${d.url}» no está en paginas_existentes_como_detalle`);
    } else err(id, 'detalle.modo debe ser generada o existente');
    // whatsapp
    const m = (it.wa || {}).mensaje;
    if (!m || !/^Hola F&V/.test(m)) err(id, 'wa.mensaje debe empezar con «Hola F&V»');
    else if (!m.includes(it.linea === 'hex' ? '⬡' : '▲')) err(id, `wa.mensaje debe llevar la forma ${it.linea === 'hex' ? '⬡' : '▲'}`);
    // tri sin asesoría
    if (it.linea === 'tri' && /asesor[ií]a|consultor[ií]a|asesor\b/i.test(JSON.stringify(it.contenido || {}) + (it.frase || ''))) err(id, 'un ítem Triangular no ofrece asesoría ni consultoría');
    // relacionados
    if (!opciones.parcial) {
      const rel = it.relacionados || [];
      if (rel.length && (rel.length < 2 || rel.length > 3)) err(id, 'relacionados: de 2 a 3 ids');
      for (const r of rel) {
        const o = items.find(x => x.id === r);
        if (!o) err(id, `relacionado «${r}» no existe`);
        else if (o.categoria !== it.categoria || o.tipo !== it.tipo) err(id, `relacionado «${r}» debe ser de la misma categoría`);
      }
      for (const b of (it.contenido || {}).bloques || []) if (!(cat.bloques || {})[b]) err(id, `bloque «${b}» no existe en bloques`);
    }
  }
  for (const pc of compartidas) {
    const id = `compartida:${pc.id}`;
    if (!pc.nombre) err(id, 'falta nombre');
    for (const mid of pc.miembros || []) {
      const o = items.find(x => x.id === mid);
      if (!o) err(id, `miembro «${mid}» no existe`);
      else if (!o.detalle || o.detalle.pagina !== pc.id) err(id, `el miembro «${mid}» debe declarar detalle.pagina = ${pc.id}`);
    }
  }
  // textos prohibidos en todo el catálogo
  for (const [ruta, txt] of textos({ items, paginas_compartidas: compartidas, bloques: cat.bloques || {} }, '')) {
    for (const [re, motivo] of PROHIBIDAS) if (re.test(txt)) e.push(`${ruta}: ${motivo}: «${txt.slice(0, 80)}»`);
  }
  return e;
}

function cargar(archivo) {
  const base = JSON.parse(fs.readFileSync(path.join(RAIZ, 'data/catalogo-base.json'), 'utf8'));
  const data = JSON.parse(fs.readFileSync(archivo, 'utf8'));
  const completo = !!data.tipos;
  return { cat: completo ? data : Object.assign({}, base, data), parcial: !completo };
}

module.exports = { validar, palabras };

if (require.main === module) {
  const args = process.argv.slice(2);
  const archivos = args.length ? args : [path.join(RAIZ, 'data/catalogo.json')];
  let total = 0;
  for (const a of archivos) {
    const { cat, parcial } = cargar(path.resolve(a));
    const errores = validar(cat, { parcial });
    console.log(`${path.relative(RAIZ, path.resolve(a))}: ${cat.items.length} ítems, ${errores.length} errores${parcial ? ' (parcial)' : ''}`);
    errores.forEach(x => console.log('  ✗ ' + x));
    total += errores.length;
  }
  process.exit(total ? 1 : 0);
}
