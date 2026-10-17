// Precio de un ítem tal como se muestra en una tarjeta.
//   modo software -> assets/precios-software.js (desde(linea): «desde $190/mes» Hexagonal, «desde $89,99/mes» Triangular)
//   modo evento   -> assets/eventos.js (curso $299,99 en 3 cuotas; taller $24,99 por persona). SIN fechas.
//   modo fijo / desde / a-medida -> precio.* del catálogo
// Hexagonal: precios redondos con punto de miles ($1.000). Triangular: terminan en ,99 ($39,99).
const { dependencias } = require('./cargar');

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Formato de un monto según la línea (usa las funciones de assets/precios-software.js)
function formatoMonto(linea, n, deps) {
  const sw = (deps || dependencias()).sw;
  return sw.fmtPrecio(linea, n);
}

// «al mes» -> «/mes»; el resto del periodo se deja como está («pago único», «por persona»…)
function periodoCorto(periodo) {
  if (!periodo) return { pegado: '', suelto: '' };
  if (periodo === 'al mes') return { pegado: '/mes', suelto: '' };
  return { pegado: '', suelto: periodo };
}

// Devuelve { prefijo, monto, pegado, suelto, referencia, aMedida, texto }
//   prefijo: «desde» o ''      monto: «$190», «$500 a $700», «A medida»
//   pegado:  «/mes» (va pegado al monto)      suelto: «pago único», «por persona»… (va aparte, en pequeño)
//   referencia: «Referencia: desde $600» o ''      nota: la nota de esa referencia («precio final después del diagnóstico») o ''      texto: todo junto en texto plano
function precioDeItem(item, deps) {
  deps = deps || dependencias();
  const p = item.precio || {};
  let prefijo = '', monto = '', pegado = '', suelto = '', referencia = '', nota = '', aMedida = false;

  if (p.modo === 'software') {
    prefijo = 'desde';
    monto = formatoMonto(item.linea, deps.sw.desde(item.linea), deps);
    pegado = '/mes';
  } else if (p.modo === 'evento') {
    const e = deps.ev[p.evento];
    if (!e) throw new Error(`${item.id}: assets/eventos.js no tiene «${p.evento}»`);
    monto = formatoMonto(item.linea, e.precio, deps);
    suelto = p.evento === 'taller' ? 'por persona' : (e.cuotas && e.cuotas.length ? `en ${e.cuotas.length} cuotas` : '');
  } else if (p.modo === 'a-medida') {
    aMedida = true;
    monto = 'A medida';
    if (p.referencia) { referencia = `Referencia: ${p.referencia}`; nota = p.nota || ''; }   // la referencia siempre lleva su nota («precio final después del diagnóstico»)
  } else {
    // fijo | desde: «$270», «desde $120», «$500 a $700», «$270 individual o $180 por persona en grupo de 2 a 4»
    let texto = String(p.texto || '').trim();
    const d = texto.match(/^desde\s+(.*)$/i);
    if (d) { prefijo = 'desde'; texto = d[1]; }
    const m = texto.match(/^(\$[\d.]+(?:,\d+)?(?:\s+a\s+\$[\d.]+(?:,\d+)?)?)\s*(.*)$/);
    if (m) {
      monto = m[1];
      const per = periodoCorto(p.periodo);
      pegado = per.pegado;
      suelto = [m[2], per.suelto].filter(Boolean).join(' ');
    } else {
      monto = texto;
      const per = periodoCorto(p.periodo);
      pegado = per.pegado; suelto = per.suelto;
    }
  }
  const texto = [prefijo, monto + pegado, suelto].filter(Boolean).join(' ');
  return { prefijo, monto, pegado, suelto, referencia, nota, aMedida, texto };
}

function htmlPrecio(pr) {
  const partes = [];
  if (pr.prefijo) partes.push(`<span class="tarjeta-desde">${esc(pr.prefijo)}</span>`);
  partes.push(`<span class="tarjeta-monto${pr.aMedida ? ' tarjeta-monto-texto' : ''}">${esc(pr.monto)}${pr.pegado ? `<span class="tarjeta-mes">${esc(pr.pegado)}</span>` : ''}</span>`);
  if (pr.suelto) partes.push(`<span class="tarjeta-periodo">${esc(pr.suelto)}</span>`);
  return `<div class="tarjeta-precio">${partes.join(' ')}</div>` +
    (pr.referencia ? `\n<div class="tarjeta-referencia">${esc(pr.referencia)}</div>` : '') +
    (pr.referencia && pr.nota ? `\n<div class="tarjeta-nota">${esc(pr.nota)}</div>` : '');
}

// Para el JSON-LD: montos numéricos que aparecen en el precio ($1.000 -> 1000; $89,99 -> 89.99). Vacío si es a medida.
function numeroDeMonto(m) { return parseFloat(m.replace('$', '').replace(/\./g, '').replace(',', '.')); }
function montosNumericos(item, deps) {
  deps = deps || dependencias();
  const p = item.precio || {};
  if (p.modo === 'a-medida') return [];
  if (p.modo === 'software') return [deps.sw.desde(item.linea)];
  if (p.modo === 'evento') return [deps.ev[p.evento].precio];
  const m = String(p.texto || '').match(/\$[\d.]+(?:,\d+)?/g) || [];
  return m.map(numeroDeMonto);
}

module.exports = { esc, formatoMonto, periodoCorto, precioDeItem, htmlPrecio, montosNumericos };
