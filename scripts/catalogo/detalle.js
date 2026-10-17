// Páginas de detalle de servicios y productos, generadas desde data/catalogo.json.
//
//   listaDetalles(catalogo)            -> [{ archivo, ruta, item | compartida }] (una por ítem con detalle.modo = "generada" y una por página compartida)
//   renderDetalle(item, catalogo, op)  -> HTML completo de /servicios/<id> o /productos/<id>
//   renderCompartida(pagina, catalogo, op) -> HTML completo de una página compartida (por ejemplo /servicios/acompanamiento)
//   generarDetalles(catalogo, deps)    -> { 'servicios/diagnostico.html': '<html…>', … }   (lo usa scripts/catalogo/generar.js)
//
// Plantilla común: migas, cabecera (forma y color de la línea, nombre, frase, precio, plazo y WhatsApp), secciones SOLO si hay contenido
// real en el catálogo (qué es, para quién, qué incluye, cómo funciona, precios o tamaños, plazo y pago, bloques reutilizables,
// preguntas frecuentes, relacionados) y cierre con WhatsApp, forma de pago y horario de atención.
// «Línea Hexagonal/Triangular» no aparece nunca: solo la forma (⬡ ▲), el color y la leyenda en palabras simples.
// Las páginas salen con los marcadores de encabezado y pie VACÍOS: scripts/build-html.js los rellena.
const { dependencias, itemPorId } = require('./cargar');
const { esc, precioDeItem, montosNumericos } = require('./precio');
const { renderTarjeta, renderRejilla } = require('./tarjetas');
const { DOMINIO, renderPagina } = require('./pagina');
const { COMENTARIO, ofertas } = require('./listados');

const WA_NUMERO = '584244125386';
const CARPETA = { servicio: 'servicios', producto: 'productos' };

// Enlace cruzado de las páginas compartidas: a qué ítem remitir y con qué frase de entrada
const CRUCES = {
  acompanamiento: { id: 'asesor-financiero', texto: 'Si lo que busca es revisar sus números y decidir con alguien cada mes, eso es otro servicio:' },
};

const WHATSAPP_SVG = '<svg class="w-6 h-6 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M17.6 6.32A7.85 7.85 0 0012.05 4a7.94 7.94 0 00-6.9 11.9L4 20l4.2-1.1a7.9 7.9 0 003.85 1h.01a7.94 7.94 0 007.94-7.94 7.87 7.87 0 00-2.4-5.64zm-5.55 12.2h-.01a6.6 6.6 0 01-3.36-.92l-.24-.14-2.5.65.66-2.43-.16-.25a6.6 6.6 0 01-1.02-3.52 6.62 6.62 0 016.63-6.62 6.58 6.58 0 014.68 1.95 6.58 6.58 0 011.94 4.68 6.62 6.62 0 01-6.62 6.6zm3.63-4.95c-.2-.1-1.17-.58-1.35-.64-.18-.07-.31-.1-.45.1-.13.2-.51.64-.62.77-.11.13-.23.14-.42.05-.2-.1-.83-.31-1.58-.98-.58-.52-.98-1.16-1.09-1.36-.11-.2-.01-.3.09-.4.09-.09.2-.23.3-.35.1-.11.13-.2.2-.32.06-.13.03-.24-.02-.34-.05-.1-.45-1.08-.61-1.48-.16-.39-.33-.33-.45-.34-.12 0-.25-.01-.38-.01-.13 0-.35.05-.53.24-.18.2-.7.68-.7 1.66s.72 1.93.82 2.06c.1.13 1.4 2.15 3.41 3.01.48.2.85.33 1.14.42.48.15.91.13 1.26.08.38-.06 1.17-.48 1.34-.94.16-.46.16-.86.11-.94-.05-.09-.18-.14-.38-.24z"/></svg>';
const CHECK = '<svg class="det-icono" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg>';
const RELOJ = '<svg class="det-icono" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
const PIN = '<svg class="det-icono" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>';
const CALENDARIO = '<svg class="det-icono" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>';
const PERSONAS = '<svg class="det-icono" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5M16 5.2a3.2 3.2 0 010 5.6M18 14.8c1.8.7 3 2.4 3 5.2"/></svg>';
const FLECHA = '<svg class="det-icono" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const MAS = '<svg class="w-5 h-5 shrink-0 transition-transform group-open:rotate-45" style="color:var(--acento-1)" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>';

// Textos de la plantilla, en el registro de cada línea (⬡ usted, ▲ tú)
const TEXTOS = {
  hex: {
    esPara: '¿Es para usted?', planes: 'Opciones y precios', relacionados: 'También le puede servir',
    cierreTitulo: 'Escríbanos por WhatsApp',
    cierreTexto: 'Cuéntenos por WhatsApp cómo es su empresa y qué busca. El mensaje ya va escrito: solo tiene que enviarlo.',
    cierreTextoConsulta: 'Cuéntenos por WhatsApp cómo es su empresa y qué busca, o agende una consulta gratis de 20 minutos. El mensaje ya va escrito: solo tiene que enviarlo.',
    niveles: 'Elija su nivel',
  },
  tri: {
    esPara: '¿Es para ti?', planes: 'Tamaños y precios', relacionados: 'También te puede servir',
    cierreTitulo: 'Escríbenos por WhatsApp',
    cierreTexto: 'Cuéntanos por WhatsApp cómo es tu negocio y qué necesitas. El mensaje ya va escrito: solo tienes que enviarlo.',
    cierreTextoConsulta: 'Cuéntanos por WhatsApp cómo es tu negocio y qué necesitas. El mensaje ya va escrito: solo tienes que enviarlo.',
    niveles: 'Elige tu nivel',
  },
};

// ---------------------------------------------------------------- utilidades
function cap(s) { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); }
function sinPunto(s) { return String(s || '').trim().replace(/[.\s]+$/, ''); }
function norm(s) { return sinPunto(s).toLowerCase().replace(/\s+/g, ' '); }
function waUrl(mensaje) { return `https://wa.me/${WA_NUMERO}?text=${encodeURIComponent(mensaje)}`; }
function palabras(s) { return String(s).trim().split(/\s+/).filter(Boolean).length; }
function sangrar(html, n) { const sp = ' '.repeat(n); return String(html).split('\n').map(l => (l ? sp + l : l)).join('\n'); }
function lleno(x) { return Array.isArray(x) ? x.length > 0 : !!(x && String(x).trim()); }

function linea(cat, clave) {
  const l = (cat.lineas || {})[clave];
  if (!l) throw new Error(`El catálogo no define la línea «${clave}»`);
  return l;
}
function categoriaDe(cat, tipo, id) {
  const c = ((cat.tipos || {})[tipo] || { categorias: [] }).categorias.find(x => x.id === id);
  if (!c) throw new Error(`El catálogo no tiene la categoría «${id}» en tipos.${tipo}`);
  return c;
}
function bloqueDe(cat, id, origen) {
  const b = (cat.bloques || {})[id];
  if (!b) throw new Error(`${origen}: el bloque «${id}» (contenido.bloques) no existe en el catálogo`);
  return b;
}

// Ruta y archivo de la página de un ítem generado
function rutaDeUrl(url) { return String(url).replace(/#.*$/, ''); }
function archivoDeRuta(ruta) { return ruta.replace(/^\//, '') + '.html'; }

function listaDetalles(cat) {
  const compartidas = new Map((cat.paginas_compartidas || []).map(p => [p.id, p]));
  const out = [];
  const vistas = new Set();
  const comprobar = (ruta, tipo, origen) => {
    const re = new RegExp(`^/${CARPETA[tipo]}/[a-z0-9-]+$`);
    if (!re.test(ruta)) throw new Error(`${origen}: la ruta «${ruta}» debe ser /${CARPETA[tipo]}/<pagina>`);
  };
  for (const it of cat.items || []) {
    const d = it.detalle || {};
    if (d.modo !== 'generada') continue;
    if (d.pagina) {
      const pg = compartidas.get(d.pagina);
      if (!pg) throw new Error(`${it.id}: detalle.pagina «${d.pagina}» no existe en paginas_compartidas`);
      const ruta = `/${CARPETA[pg.tipo]}/${pg.id}`;
      if (rutaDeUrl(d.url) !== ruta) throw new Error(`${it.id}: detalle.url debe empezar por ${ruta}`);
      if (!vistas.has(pg.id)) { vistas.add(pg.id); out.push({ archivo: archivoDeRuta(ruta), ruta, compartida: pg }); }
      continue;
    }
    const ruta = rutaDeUrl(d.url);
    comprobar(ruta, it.tipo, it.id);
    out.push({ archivo: archivoDeRuta(ruta), ruta, item: it });
  }
  for (const pg of compartidas.values()) {
    if (vistas.has(pg.id)) continue;
    const ruta = `/${CARPETA[pg.tipo]}/${pg.id}`;
    out.push({ archivo: archivoDeRuta(ruta), ruta, compartida: pg });
  }
  return out;
}

// ---------------------------------------------------------------- precio
// Devuelve el HTML del precio de la cabecera. Taller: el monto lo escribe assets/eventos.js (data-ev) con este texto por defecto.
function htmlPrecioCabecera(item, deps) {
  const pr = precioDeItem(item, deps);
  const p = item.precio || {};
  const evento = p.modo === 'evento' && p.evento === 'taller';
  const nota = pr.nota || (p.nota ? cap(p.nota) : '');
  const monto = evento ? `<span class="det-monto" data-ev="taller.precio">${esc(pr.monto)}</span>` : `<span class="det-monto${pr.aMedida ? ' det-monto-texto' : ''}">${esc(pr.monto)}${pr.pegado ? `<span class="det-mes">${esc(pr.pegado)}</span>` : ''}</span>`;
  const partes = [];
  if (pr.prefijo) partes.push(`<span class="det-desde">${esc(pr.prefijo)}</span>`);
  partes.push(monto);
  if (pr.suelto) partes.push(`<span class="det-periodo">${esc(pr.suelto)}</span>`);
  const lineas = [`<p class="det-precio-linea">${partes.join(' ')}</p>`];
  if (pr.referencia) lineas.push(`<p class="det-ref">${esc(pr.referencia)}</p>`);
  if (nota) lineas.push(`<p class="det-nota-precio">${esc(cap(nota))}</p>`);
  return `<div class="det-precio">\n${sangrar(lineas.join('\n'), 2)}\n</div>`;
}

// «$14,99 al mes» -> { monto: '$14,99', resto: 'al mes' }
function partirPrecioPlan(texto) {
  const m = String(texto || '').trim().match(/^(\$[\d.]+(?:,\d+)?(?:\s+a\s+\$[\d.]+(?:,\d+)?)?)\s*(.*)$/);
  return m ? { monto: m[1], resto: m[2] } : { monto: String(texto || '').trim(), resto: '', texto: true };
}

// ---------------------------------------------------------------- piezas
function botonWa(o) {
  const clase = o.clase || 'btn-linea';
  const sr = o.sr ? `<span class="sr-only"> ${esc(o.sr)}</span>` : '';
  const extra = o.atributos ? ' ' + o.atributos : '';
  return `<a href="${esc(waUrl(o.mensaje))}" target="_blank" rel="noopener" data-evento="${o.evento || 'detalle_whatsapp'}" data-product="${esc(o.producto)}" data-cta="${esc(o.cta)}"${extra} class="${clase} estado-interactivo lst-boton flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-head font-semibold text-center">${WHATSAPP_SVG}<span>${esc(o.texto || 'Escribir por WhatsApp')}</span>${sr}</a>`;
}

function botonConsulta(cta) {
  return `<a href="/contacto#agenda" data-evento="detalle_consulta_gratis" data-cta="${esc(cta)}" class="btn-linea-sec estado-interactivo lst-boton flex items-center justify-center px-6 py-3.5 rounded-xl font-head font-medium text-center">Consulta gratis de 20 min</a>`;
}

// Un h2 de sección. nivel por defecto 2.
function h2(id, texto, extra) {
  return `<h2 id="${id}" class="det-h2 font-sans text-3xl sm:text-4xl font-semibold text-white leading-tight tracking-tight text-balance${extra ? ' ' + extra : ''}">${esc(texto)}</h2>`;
}

// Sección con fondo alterno. cuerpo: HTML ya armado (va dentro del contenedor). opciones: { id, ancho, scroll }
function seccion(ctx, o) {
  const alterno = ctx.fila % 2 === 1 ? ' bg-fv-surface2/40' : '';
  ctx.fila++;
  const id = o.id ? ` id="${o.id}"` : '';
  const legible = ctx.hex ? ' hex-legible' : '';
  return [
    `<section${id} class="det-seccion scroll-mt-28 py-12 lg:py-16 border-b border-white/5${alterno}${legible}" aria-labelledby="${o.labelledby}">`,
    `  <div class="${o.ancho || 'max-w-6xl'} mx-auto px-5 sm:px-6 lg:px-8">`,
    sangrar(o.cuerpo, 4),
    '  </div>',
    '</section>',
  ].join('\n');
}

function listaChecks(items, columnas2) {
  const lis = items.map(t => `<li class="det-check">${CHECK}<span>${esc(t)}</span></li>`).join('\n');
  return `<ul class="det-checks${columnas2 ? ' det-checks-2' : ''}">\n${sangrar(lis, 2)}\n</ul>`;
}

// Partir «Título. Texto.» o «Título: texto» en (título, texto) si TODOS los elementos se pueden partir; si no, null
function partirTodos(items) {
  const porPunto = items.map(t => {
    const m = String(t).match(/^(.{3,90}?)\.\s+([A-ZÁÉÍÓÚÑ¿¡0-9].*)$/s);
    return m && palabras(m[1]) <= 9 && !/[:$]/.test(m[1]) ? { t: m[1], x: m[2] } : null;
  });
  if (porPunto.every(Boolean)) return porPunto;
  const porDosPuntos = items.map(t => {
    const m = String(t).match(/^([^:.]{3,70}):\s+(.+)$/s);
    return m && !/^(Si|Cuando)\s/.test(m[1]) && palabras(m[1]) <= 9 ? { t: m[1], x: cap(m[2]) } : null;
  });
  if (porDosPuntos.every(Boolean)) return porDosPuntos;
  return null;
}

function tarjetasConTitulo(partes) {
  const lis = partes.map(p => [
    '<li class="det-check det-check-bloque">',
    `  ${CHECK}`,
    '  <div>',
    `    <h3 class="det-check-titulo font-sans text-xl font-semibold text-white">${esc(sinPunto(p.t))}</h3>`,
    `    <p class="det-check-texto">${esc(p.x)}</p>`,
    '  </div>',
    '</li>',
  ].join('\n')).join('\n');
  return `<ul class="det-checks det-checks-2">\n${sangrar(lis, 2)}\n</ul>`;
}

function listaIncluye(items) {
  const partes = partirTodos(items);
  if (partes) return tarjetasConTitulo(partes);
  return listaChecks(items, items.length > 1);
}

function pasosHtml(pasos) {
  const lis = pasos.map((p, i) => [
    '<li class="det-paso">',
    `  <span class="det-num" aria-hidden="true">${i + 1}</span>`,
    '  <div>',
    `    <h3 class="det-paso-titulo font-sans text-xl font-semibold text-white">${esc(p.titulo)}</h3>`,
    p.texto ? `    <p class="det-paso-texto">${esc(p.texto)}</p>` : null,
    '  </div>',
    '</li>',
  ].filter(x => x !== null).join('\n')).join('\n');
  return `<ol class="det-pasos">\n${sangrar(lis, 2)}\n</ol>`;
}

// ---------------------------------------------------------------- secciones del contenido
function seccionQueEsYParaQuien(ctx, c, frase) {
  const t = ctx.t;
  const queEs = lleno(c.que_es) && norm(c.que_es) !== norm(frase) ? c.que_es : '';
  const para = (c.para_quien || []).filter(lleno);
  if (!queEs && !para.length) return '';

  let paraHtml = '';
  if (para.length) {
    const largo = para.length > 1 && para[0].length > 150;
    const intro = largo ? `<p class="det-prosa">${esc(para[0])}</p>\n` : '';
    const resto = largo ? para.slice(1) : para;
    // Un solo texto largo va como párrafo; los demás, como tarjetas con marca
    paraHtml = (resto.length === 1 && resto[0].length > 150 && !largo)
      ? `<p class="det-prosa">${esc(resto[0])}</p>`
      : intro + listaChecks(resto, !queEs && resto.length > 1);
  }
  const bloqueQueEs = queEs ? `${h2('det-que-es', 'Qué es')}\n<p class="det-prosa det-prosa-grande mt-5">${esc(queEs)}</p>` : '';
  const bloquePara = paraHtml ? `${h2('det-para-quien', t.esPara)}\n<div class="mt-6 space-y-5">\n${sangrar(paraHtml, 2)}\n</div>` : '';

  if (queEs && paraHtml) {
    const cuerpo = [
      '<div class="grid lg:grid-cols-12 gap-10 lg:gap-14">',
      '  <div class="lg:col-span-5">',
      sangrar(bloqueQueEs, 4),
      '  </div>',
      '  <div class="lg:col-span-7">',
      sangrar(bloquePara, 4),
      '  </div>',
      '</div>',
    ].join('\n');
    return seccion(ctx, { id: 'que-es', labelledby: 'det-que-es', cuerpo });
  }
  if (queEs) return seccion(ctx, { id: 'que-es', labelledby: 'det-que-es', ancho: 'max-w-4xl', cuerpo: bloqueQueEs });
  return seccion(ctx, { id: 'para-quien', labelledby: 'det-para-quien', cuerpo: bloquePara });
}

function seccionIncluye(ctx, c) {
  const items = (c.incluye || []).filter(lleno);
  if (!items.length) return '';
  return seccion(ctx, { id: 'incluye', labelledby: 'det-incluye', cuerpo: `${h2('det-incluye', 'Qué incluye')}\n<div class="mt-8">\n${sangrar(listaIncluye(items), 2)}\n</div>` });
}

function seccionPasos(ctx, c) {
  const pasos = (c.pasos || []).filter(p => p && lleno(p.titulo || p.texto));
  if (!pasos.length) return '';
  let cuerpo;
  if (pasos.length === 1 && /^c[oó]mo funciona$/i.test(pasos[0].titulo || '')) {
    cuerpo = `${h2('det-pasos', 'Cómo funciona')}\n<p class="det-destacado text-xl mt-6">${esc(pasos[0].texto)}</p>`;
  } else {
    cuerpo = `${h2('det-pasos', 'Cómo funciona')}\n<div class="mt-8">\n${sangrar(pasosHtml(pasos), 2)}\n</div>`;
  }
  return seccion(ctx, { id: 'como-funciona', labelledby: 'det-pasos', ancho: pasos.length === 1 ? 'max-w-4xl' : 'max-w-6xl', cuerpo });
}

// Detalle de un plan: las frases tal cual están publicadas; la de 12 meses por adelantado se destaca
function detallePlan(detalle) {
  const frases = String(detalle || '').split(/(?<=\.)\s+(?=[A-ZÁÉÍÓÚÑ¿¡])/).map(s => s.trim()).filter(Boolean);
  const anual = frases.filter(f => /adelantado/i.test(f));
  const notas = frases.filter(f => !/adelantado/i.test(f));
  return { anual, notas };
}

function seccionPlanes(ctx, item, c) {
  const planes = (c.planes || []).filter(p => p && lleno(p.nombre));
  if (!planes.length) return '';
  const tarjetas = planes.map(p => {
    const pp = partirPrecioPlan(p.precio);
    const { anual, notas } = detallePlan(p.detalle);
    const incluye = (p.incluye || []).filter(lleno);
    const idp = `det-plan-${p.id}`;
    const precio = pp.texto
      ? `<p class="det-plan-precio"><span class="det-monto det-monto-texto">${esc(pp.monto)}</span></p>`
      : `<p class="det-plan-precio"><span class="det-monto det-monto-medio">${esc(pp.monto)}</span>${pp.resto ? ` <span class="det-periodo">${esc(pp.resto)}</span>` : ''}</p>`;
    const mensaje = p.wa || (item.wa || {}).mensaje;
    const producto = p.product || item.product || item.id;
    return [
      `<article id="plan-${esc(p.id)}" class="det-plan det-tarjeta" aria-labelledby="${esc(idp)}">`,
      `  <h3 id="${esc(idp)}" class="det-plan-nombre font-sans text-2xl font-semibold text-white">${esc(p.nombre)}</h3>`,
      sangrar(precio, 2),
      incluye.length ? sangrar(`<ul class="det-plan-lista">\n${sangrar(incluye.map(t => `<li>${CHECK}<span>${esc(t)}</span></li>`).join('\n'), 2)}\n</ul>`, 2) : null,
      notas.length ? sangrar(`<ul class="det-plan-notas">\n${sangrar(notas.map(t => `<li>${esc(t)}</li>`).join('\n'), 2)}\n</ul>`, 2) : null,
      anual.length ? sangrar(`<p class="det-anual">${esc(anual.join(' '))}</p>`, 2) : null,
      `  <div class="det-plan-boton">${botonWa({ mensaje, producto, cta: 'detalle_plan', texto: 'Escribir por WhatsApp', sr: `sobre ${p.nombre}` })}</div>`,
      '</article>',
    ].filter(x => x !== null).join('\n');
  }).join('\n');
  const cols = Math.min(planes.length, 3);
  const cuerpo = `${h2('det-planes', ctx.t.planes)}\n<div class="det-planes det-planes-${cols} mt-8">\n${sangrar(tarjetas, 2)}\n</div>`;
  return seccion(ctx, { id: 'precios', labelledby: 'det-planes', cuerpo });
}

// Plazo y pago: solo lo que no está ya en la cabecera
function seccionPlazoPago(ctx, item, c) {
  const tarjetas = [];
  if (lleno(c.plazo) && (!item || norm(c.plazo) !== norm(item.plazo))) {
    tarjetas.push(['<div class="det-tarjeta det-info">', `  <h3 class="det-info-titulo font-head">${RELOJ}<span>Plazo</span></h3>`, `  <p class="det-info-texto">${esc(c.plazo)}</p>`, '</div>'].join('\n'));
  }
  if (lleno(c.pago)) {
    tarjetas.push(['<div class="det-tarjeta det-info">', '  <h3 class="det-info-titulo font-head"><span>Precio y pago</span></h3>', `  <p class="det-info-texto">${esc(c.pago)}</p>`, '</div>'].join('\n'));
  }
  if (!tarjetas.length) return '';
  const cuerpo = `${h2('det-plazo-pago', 'Plazo y pago')}\n<div class="det-info-rejilla det-info-${tarjetas.length} mt-8">\n${sangrar(tarjetas.join('\n'), 2)}\n</div>`;
  return seccion(ctx, { id: 'plazo-pago', labelledby: 'det-plazo-pago', cuerpo });
}

// Un bloque reutilizable. «corto» = solo título y texto (se agrupa en tarjetas)
function bloqueEsCorto(b) { return !((b.pasos || []).length || (b.items || []).length); }

function bloqueTarjetaCorta(id, b) {
  return [
    `<section id="bloque-${esc(id)}" class="det-tarjeta det-nota scroll-mt-28" aria-labelledby="det-b-${esc(id)}">`,
    `  <h2 id="det-b-${esc(id)}" class="font-sans text-2xl font-semibold text-white leading-snug text-balance">${esc(b.titulo)}</h2>`,
    `  <p class="det-nota-texto">${esc(b.texto)}</p>`,
    '</section>',
  ].join('\n');
}

function bloqueSeccion(ctx, id, b) {
  const partes = [h2(`det-b-${id}`, b.titulo)];
  if (lleno(b.texto)) partes.push(`<p class="det-prosa det-prosa-grande mt-5">${esc(b.texto)}</p>`);
  if ((b.pasos || []).length) partes.push(`<div class="mt-8">\n${sangrar(pasosHtml(b.pasos), 2)}\n</div>`);
  if ((b.items || []).length) {
    const partes2 = partirTodos(b.items);
    partes.push(`<div class="mt-8">\n${sangrar(partes2 ? tarjetasConTitulo(partes2) : listaChecks(b.items, b.items.length > 2), 2)}\n</div>`);
  }
  return seccion(ctx, { id: `bloque-${id}`, labelledby: `det-b-${id}`, cuerpo: partes.join('\n') });
}

// Secciones de los bloques citados. Los de pago y el horario van al cierre (ver panelesCierre).
function esDeCierre(id) { return /^pago/.test(id) || id === 'horario-atencion'; }

function seccionesBloques(ctx, ids, cat, origen) {
  const out = [];
  let grupo = [];
  const cerrarGrupo = () => {
    if (!grupo.length) return;
    const tarjetas = grupo.map(g => bloqueTarjetaCorta(g.id, g.b)).join('\n');
    out.push(seccionGrupoNotas(ctx, tarjetas, grupo.length));
    grupo = [];
  };
  for (const id of ids) {
    if (esDeCierre(id)) { bloqueDe(cat, id, origen); continue; }
    const b = bloqueDe(cat, id, origen);
    if (bloqueEsCorto(b)) { grupo.push({ id, b }); continue; }
    cerrarGrupo();
    out.push(bloqueSeccion(ctx, id, b));
  }
  cerrarGrupo();
  return out;
}

// Varias notas cortas juntas, en una banda con 2 columnas (cada una es una sección con su h2)
function seccionGrupoNotas(ctx, tarjetas, n) {
  const alterno = ctx.fila % 2 === 1 ? ' bg-fv-surface2/40' : '';
  ctx.fila++;
  const legible = ctx.hex ? ' hex-legible' : '';
  return [
    `<div class="det-seccion py-12 lg:py-16 border-b border-white/5${alterno}${legible}">`,
    '  <div class="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">',
    `    <div class="det-notas det-notas-${Math.min(n, 2)}">`,
    sangrar(tarjetas, 6),
    '    </div>',
    '  </div>',
    '</div>',
  ].join('\n');
}

function seccionFaq(ctx, c, prefijoEvento) {
  const faq = (c.faq || []).filter(f => f && lleno(f.p) && lleno(f.r));
  if (!faq.length) return '';
  const tx = ctx.hex ? 'text-slate-200' : 'text-slate-300';
  const det = faq.map((f, i) => [
    '<details class="x-faq group bg-fv-surface border border-fv-border rounded-xl px-5 sm:px-6">',
    `  <summary data-evento="${prefijoEvento}_faq_${i + 1}" class="flex items-center justify-between gap-4 py-4 min-h-[56px] cursor-pointer font-head text-lg text-white">`,
    `    <span>${esc(f.p)}</span>`,
    `    ${MAS}`,
    '  </summary>',
    `  <p class="${tx} pb-5">${esc(f.r)}</p>`,
    '</details>',
  ].join('\n')).join('\n');
  const cuerpo = `${h2('det-faq', 'Preguntas frecuentes')}\n<div class="space-y-3 mt-8">\n${sangrar(det, 2)}\n</div>`;
  return seccion(ctx, { id: 'preguntas', labelledby: 'det-faq', ancho: 'max-w-3xl', cuerpo });
}

function seccionRelacionados(ctx, ids, cat) {
  if (!ids.length) return '';
  const items = ids.map(id => itemPorId(cat, id));
  // La Hexagonal siempre primero (el orden relativo del catálogo se conserva dentro de cada línea)
  const orden = [...items.filter(i => i.linea === 'hex'), ...items.filter(i => i.linea !== 'hex')];
  const rejilla = renderRejilla(orden.map(i => i.id), cat, { cols: orden.length === 2 ? 2 : 3, nivel: 3, deps: ctx.deps });
  const cuerpo = `${h2('det-relacionados', ctx.t.relacionados)}\n<div class="mt-8">\n${sangrar(rejilla, 2)}\n</div>`;
  return seccion(ctx, { id: 'relacionados', labelledby: 'det-relacionados', cuerpo });
}

// ---------------------------------------------------------------- cierre
function panelBloque(b, extraClase) {
  const partes = [`<h3 class="font-sans text-xl font-semibold text-white">${esc(b.titulo)}</h3>`];
  if (lleno(b.texto)) partes.push(`<p class="det-panel-texto">${esc(b.texto)}</p>`);
  if ((b.items || []).length) partes.push(`<ul class="det-panel-lista">\n${sangrar(b.items.map(t => `<li>${CHECK}<span>${esc(t)}</span></li>`).join('\n'), 2)}\n</ul>`);
  return `<div class="det-tarjeta det-panel${extraClase ? ' ' + extraClase : ''}">\n${sangrar(partes.join('\n'), 2)}\n</div>`;
}

function cierre(ctx, o) {
  const { t } = ctx;
  const paneles = o.bloques.filter(esDeCierre).map(id => bloqueDe(ctx.cat, id, o.origen)).map(b => panelBloque(b));
  const textoCierre = o.consulta ? t.cierreTextoConsulta : t.cierreTexto;
  const botones = [o.botonPrincipal];
  if (o.consulta) botones.push(botonConsulta('detalle_cierre'));
  const legible = ctx.hex ? ' hex-legible' : '';
  return [
    `<section id="contacto" class="det-cierre scroll-mt-28 py-14 lg:py-20${legible}" aria-labelledby="det-cierre">`,
    '  <div class="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">',
    '    <div class="x-card is-featured is-static relative overflow-hidden px-6 py-10 sm:px-12 sm:py-14 text-center" style="border-radius:1.5rem">',
    `      <h2 id="det-cierre" class="font-sans text-3xl sm:text-4xl font-semibold text-white leading-tight tracking-tight text-balance mb-3">${esc(t.cierreTitulo)}</h2>`,
    `      <p class="det-cierre-resumen font-head text-lg text-slate-300 mb-4">${esc(o.resumen)}</p>`,
    `      <p class="text-slate-300 max-w-2xl mx-auto mb-8">${esc(textoCierre)}</p>`,
    '      <div class="flex flex-col sm:flex-row gap-3 justify-center">',
    sangrar(botones.join('\n'), 8),
    '      </div>',
    '    </div>',
    paneles.length ? `    <div class="det-paneles det-paneles-${paneles.length} mt-6">\n${sangrar(paneles.join('\n'), 6)}\n    </div>` : null,
    '  </div>',
    '</section>',
  ].filter(x => x !== null).join('\n');
}

// ---------------------------------------------------------------- cabecera y migas
function migas(ctx, nombre, categoria) {
  const ruta = ctx.ruta; // /servicios o /productos
  const titulo = ctx.tipoDatos.titulo;
  return [
    '<nav class="det-migas" aria-label="Ruta">',
    '  <ol>',
    `    <li><a href="${ruta}">${esc(titulo)}</a></li>`,
    `    <li><a href="${ruta}#${esc(categoria.id)}">${esc(categoria.nombre)}</a></li>`,
    `    <li><span aria-current="page">${esc(nombre)}</span></li>`,
    '  </ol>',
    '</nav>',
  ].join('\n');
}

function chipLinea(ctx, categoria) {
  const l = ctx.linea;
  return `<p class="det-chip"><span class="nav-forma nav-${ctx.clave}" role="img" aria-label="${esc(l.leyenda)}"></span><span>${esc(l.leyenda)}</span><span class="det-chip-sep" aria-hidden="true">·</span><span>${esc(categoria.nombre)}</span></p>`;
}

// Datos del taller: fechas, hora y cupos salen de assets/eventos.js en el navegador (data-ev); el HTML trae el texto de respaldo
function fechaLarga(iso) {
  return new Date(iso + 'T12:00:00-04:00').toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Caracas' }).replace(',', '');
}
function cuposTexto(libres, total) { return libres >= total ? `Máximo ${total} personas` : `Quedan ${libres} ${libres === 1 ? 'cupo' : 'cupos'}`; }

function datosEvento(item, deps) {
  const p = item.precio || {};
  if (p.modo !== 'evento' || p.evento !== 'taller') return '';
  const e = deps.ev.taller;
  return [
    '<ul class="det-datos" aria-label="Fecha, lugar y cupos">',
    `  <li class="det-dato" data-ev-show="taller:vigente">${CALENDARIO}<span><span data-ev="taller.fecha">${esc(fechaLarga(e.fecha))}</span>, <span data-ev="taller.hora">${esc(e.hora)}</span></span></li>`,
    `  <li class="det-dato hidden" data-ev-show="taller:sin-fechas">${CALENDARIO}<span data-ev="eventos.proximas">Próximas fechas: escríbenos por WhatsApp</span></li>`,
    `  <li class="det-dato">${PIN}<span data-ev="taller.lugar">${esc(e.lugar)}</span></li>`,
    `  <li class="det-dato">${PERSONAS}<span data-ev="taller.cupos">${esc(cuposTexto(e.cuposLibres, e.cuposTotales))}</span></li>`,
    '</ul>',
  ].join('\n');
}

function esTaller(item) { return item && item.precio && item.precio.modo === 'evento' && item.precio.evento === 'taller'; }

// Botón principal. En el taller hay dos: reservar cupo (hay fecha) o avisarme (ya pasó); el de assets/eventos.js (data-ev-wa) no se usa
// porque sus mensajes nombran la línea.
function botonPrincipal(ctx, item, cta) {
  const producto = item.product || item.id;
  const base = { mensaje: item.wa.mensaje, producto, cta };
  if (!esTaller(item)) return botonWa(base);
  const nombre = ctx.deps.ev.taller.nombre;
  const aviso = `Hola F&V, avísame cuando haya nueva fecha del taller «${nombre}» (${linea(ctx.cat, 'tri').forma}).`;
  return [
    botonWa({ ...base, texto: 'Reservar mi cupo por WhatsApp', atributos: 'data-ev-show="taller:vigente"' }),
    botonWa({ mensaje: aviso, producto, cta: `${cta}_aviso`, texto: 'Avisarme de la próxima fecha', clase: 'btn-linea hidden', atributos: 'data-ev-show="taller:sin-fechas"' }),
  ].join('\n');
}

// ---------------------------------------------------------------- JSON-LD
function jsonldMigas(ctx, nombre, categoria, urlPagina) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: ctx.tipoDatos.titulo, item: DOMINIO + ctx.ruta },
      { '@type': 'ListItem', position: 2, name: categoria.nombre, item: `${DOMINIO}${ctx.ruta}#${categoria.id}` },
      { '@type': 'ListItem', position: 3, name: nombre, item: urlPagina },
    ],
  };
}

function jsonldFaq(faq) {
  const f = (faq || []).filter(x => x && lleno(x.p) && lleno(x.r));
  if (!f.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: f.map(x => ({ '@type': 'Question', name: x.p, acceptedAnswer: { '@type': 'Answer', text: x.r } })),
  };
}

function jsonldPrincipal(ctx, item, descripcion, urlPagina, categoria, oferta) {
  const proveedor = { '@type': 'Organization', name: 'F&V AI Group', url: `${DOMINIO}/` };
  const base = { '@context': 'https://schema.org', name: item.nombre, description: descripcion, url: urlPagina };
  if (ctx.tipo === 'servicio') {
    const s = { ...base, '@type': 'Service', serviceType: categoria.nombre, provider: proveedor };
    if (oferta) s.offers = { ...oferta, url: urlPagina };
    return s;
  }
  const p = { ...base, '@type': 'Product', category: categoria.nombre, brand: { '@type': 'Brand', name: 'F&V AI Group' }, image: ctx.imagen };
  if (oferta) p.offers = { ...oferta, url: urlPagina };
  return p;
}

// ---------------------------------------------------------------- páginas
function contexto(cat, tipo, claveLinea, categoriaId, deps, ruta) {
  const l = linea(cat, claveLinea);
  const carpeta = CARPETA[tipo];
  const categoria = categoriaDe(cat, tipo, categoriaId);
  return {
    cat, deps, tipo, clave: claveLinea, linea: l, hex: claveLinea === 'hex', t: TEXTOS[claveLinea],
    tipoDatos: cat.tipos[tipo], rutaTipo: `/${carpeta}`, ruta: `/${carpeta}`, categoria,
    imagen: `${DOMINIO}/assets/og/${carpeta}-${categoriaId}.png`, fila: 0, rutaPagina: ruta,
  };
}

function relacionadosDe(item, cat) {
  const ids = (item.relacionados || []).filter(Boolean);
  ids.forEach(id => itemPorId(cat, id));
  return ids;
}

function renderDetalle(item, cat, opciones) {
  opciones = opciones || {};
  const deps = opciones.deps || dependencias();
  const ruta = rutaDeUrl(item.detalle.url);
  const ctx = contexto(cat, item.tipo, item.linea, item.categoria, deps, ruta);
  const c = item.contenido || {};
  const urlPagina = DOMINIO + ruta;
  const categoria = ctx.categoria;
  const bloquesIds = (c.bloques || []).filter(Boolean);
  const origen = item.id;

  const seccionesPrincipales = [
    seccionQueEsYParaQuien(ctx, c, item.frase),
    seccionIncluye(ctx, c),
    seccionPasos(ctx, c),
    seccionPlanes(ctx, item, c),
    seccionPlazoPago(ctx, item, c),
    ...seccionesBloques(ctx, bloquesIds, cat, origen),
    lleno(c.extra_html) ? seccion(ctx, { id: 'mas', labelledby: 'det-titulo', cuerpo: c.extra_html }) : '',
    seccionFaq(ctx, c, 'detalle'),
    seccionRelacionados(ctx, relacionadosDe(item, cat), cat),
  ].filter(Boolean);

  const pr = precioDeItem(item, deps);
  const consulta = item.tipo === 'servicio';
  const datos = datosEvento(item, deps);
  const botones = [botonPrincipal(ctx, item, 'detalle')];
  if (consulta) botones.push(botonConsulta('detalle'));

  const hero = [
    `<section class="det-hero relative pt-24 pb-12 sm:pt-28 lg:pt-36 lg:pb-16 overflow-hidden border-b border-white/5${ctx.hex ? ' hex-legible' : ''}" aria-labelledby="det-titulo">`,
    '  <div class="absolute inset-0 grain opacity-30 [mask-image:radial-gradient(ellipse_at_top,black_0%,transparent_65%)]" aria-hidden="true"></div>',
    !ctx.hex ? '  <div class="absolute top-0 left-0 w-[520px] h-[520px] bg-fv-triGreen/[0.05] rounded-full blur-[130px] pointer-events-none -translate-x-1/3 -translate-y-1/3" aria-hidden="true"></div>' : null,
    !ctx.hex ? '  <div class="absolute bottom-0 right-0 w-[520px] h-[520px] bg-fv-triPurple/[0.06] rounded-full blur-[150px] pointer-events-none translate-x-1/4 translate-y-1/4" aria-hidden="true"></div>' : null,
    '  <div class="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">',
    sangrar(migas(ctx, item.nombre, categoria), 4),
    '    <div class="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start mt-2 lg:mt-6">',
    '      <div class="lg:col-span-7">',
    `        ${chipLinea(ctx, categoria)}`,
    `        <h1 id="det-titulo" class="det-h1 font-sans text-[1.875rem] leading-[1.12] sm:text-5xl lg:text-[3.25rem] font-extrabold text-white tracking-tight text-balance mt-5">${esc(item.nombre)}</h1>`,
    `        <p class="det-frase text-xl text-slate-200 mt-5">${esc(item.frase)}</p>`,
    '      </div>',
    '      <section class="lg:col-span-5" aria-label="Precio y contacto">',
    '        <div class="det-compra x-card is-static">',
    sangrar(htmlPrecioCabecera(item, deps), 10),
    item.plazo ? `          <p class="det-dato">${RELOJ}<span>${esc(item.plazo)}</span></p>` : null,
    datos ? sangrar(datos, 10) : null,
    '          <div class="det-acciones">',
    sangrar(botones.join('\n'), 12),
    '          </div>',
    '        </div>',
    '      </section>',
    '    </div>',
    '  </div>',
    '</section>',
  ].filter(x => x !== null).join('\n');

  const resumen = `${item.nombre} · ${pr.texto}`;
  const cierreHtml = cierre(ctx, { bloques: bloquesIds, botonPrincipal: botonPrincipal(ctx, item, 'detalle_cierre'), consulta, resumen, origen });

  const cuerpo = ['', hero, '', ...seccionesPrincipales.flatMap(s => [s, '']), cierreHtml, ''].join('\n');

  const meta = item.meta || {};
  const titulo = meta.titulo || `${item.nombre} | F&V AI Group`;
  const descripcion = meta.descripcion || item.frase;
  const jsonld = [
    jsonldPrincipal(ctx, item, descripcion, urlPagina, categoria, ofertas(item, deps)),
    jsonldMigas(ctx, item.nombre, categoria, urlPagina),
    jsonldFaq(c.faq),
  ].filter(Boolean);

  return renderPagina({
    ruta,
    titulo,
    descripcion,
    og: { imagen: ctx.imagen, alt: `${item.nombre}: ${categoria.nombre}` },
    jsonld,
    activo: ctx.tipoDatos.ruta.replace(/^\//, ''),
    hijo: true,
    wa: `Hola F&V, vengo de la página de ${item.nombre} y tengo una consulta`,
    cuerpo,
    claseMain: ctx.linea.clase,
    comentario: COMENTARIO,
    scriptsExtra: esTaller(item) ? '<script defer src="/assets/eventos.js"></script>' : null,
  });
}

// Página compartida (por ejemplo Acompañamiento Continuo): contenido propio y una sección por miembro, con su ancla
function renderCompartida(pg, cat, opciones) {
  opciones = opciones || {};
  const deps = opciones.deps || dependencias();
  const ruta = `/${CARPETA[pg.tipo]}/${pg.id}`;
  const ctx = contexto(cat, pg.tipo, pg.linea, pg.categoria, deps, ruta);
  const c = pg.contenido || {};
  const urlPagina = DOMINIO + ruta;
  const categoria = ctx.categoria;
  const miembros = (pg.miembros || []).map(id => itemPorId(cat, id));
  const origen = pg.id;
  const bloquesIds = (c.bloques || []).filter(Boolean);
  const ancla = it => ((it.detalle || {}).url.split('#')[1] || '');
  miembros.forEach(m => { if (!ancla(m)) throw new Error(`${m.id}: detalle.url necesita un ancla (#...) para la página compartida`); });

  const tarjetasNivel = miembros.map(m => {
    const a = ancla(m);
    const mc = m.contenido || {};
    const prm = precioDeItem(m, deps);
    const incluye = (mc.incluye || []).filter(lleno).filter(t => norm(t) !== norm(m.plazo));
    return [
      `<section id="${esc(a)}" class="det-nivel det-tarjeta scroll-mt-28" aria-labelledby="det-nivel-${esc(a)}">`,
      `  <h3 id="det-nivel-${esc(a)}" class="font-sans text-2xl font-semibold text-white">${esc(m.nombre)}</h3>`,
      `  <p class="det-plan-precio"><span class="det-monto det-monto-medio">${esc(prm.monto)}${prm.pegado ? `<span class="det-mes">${esc(prm.pegado)}</span>` : ''}</span></p>`,
      m.plazo ? `  <p class="det-dato">${RELOJ}<span>${esc(m.plazo)}</span></p>` : null,
      lleno(mc.que_es) ? `  <p class="det-nivel-texto">${esc(mc.que_es)}</p>` : null,
      incluye.length ? sangrar(`<ul class="det-plan-lista">\n${sangrar(incluye.map(t => `<li>${CHECK}<span>${esc(t)}</span></li>`).join('\n'), 2)}\n</ul>`, 2) : null,
      `  <div class="det-plan-boton">${botonWa({ mensaje: m.wa.mensaje, producto: m.product || m.id, cta: 'detalle_nivel', texto: 'Escribir por WhatsApp', sr: `sobre ${m.nombre}` })}</div>`,
      '</section>',
    ].filter(x => x !== null).join('\n');
  }).join('\n');

  const niveles = seccion(ctx, {
    id: 'niveles', labelledby: 'det-niveles',
    cuerpo: `${h2('det-niveles', ctx.t.niveles)}\n<div class="det-planes det-planes-${Math.min(miembros.length, 3)} mt-8">\n${sangrar(tarjetasNivel, 2)}\n</div>`,
  });

  // Enlace cruzado
  let cruce = '';
  const cz = CRUCES[pg.id];
  if (cz) {
    const otro = itemPorId(cat, cz.id);
    cruce = [
      '<aside class="det-cruce" aria-label="Otro servicio">',
      `  <p class="det-cruce-texto">${esc(cz.texto)} <strong class="text-white">${esc(otro.nombre)}</strong>. ${esc(otro.frase)}</p>`,
      `  <a href="${esc(rutaDeUrl(otro.detalle.url))}" data-evento="detalle_cruce" data-item="${esc(otro.id)}" class="btn-linea-sec estado-interactivo det-cruce-boton inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-head font-medium"><span>Ver ${esc(otro.nombre)}</span>${FLECHA}</a>`,
      '</aside>',
    ].join('\n');
  }

  const desde = precioDeItem(miembros.slice().sort((a, b) => Math.min(...montosNumericos(a, deps)) - Math.min(...montosNumericos(b, deps)))[0], deps);
  const secBloques = seccionesBloques(ctx, bloquesIds, cat, origen);
  if (cruce) {
    // El enlace cruzado va dentro de la banda del bloque que explica la diferencia; si no la hay, en una sección propia
    const k = secBloques.findIndex(h => h.includes('id="det-b-diferencia-soporte-asesoria"'));
    const cola = /\n {2}<\/div>\n<\/section>$/;
    if (k >= 0 && cola.test(secBloques[k])) secBloques[k] = secBloques[k].replace(cola, m => `\n${sangrar(cruce, 4)}${m}`);
    else secBloques.push(seccion(ctx, { id: 'otro-servicio', labelledby: 'det-titulo', cuerpo: cruce }));
  }

  const principal = botonWa({ mensaje: pg.wa.mensaje, producto: pg.product || pg.id, cta: 'detalle' });
  const principalCierre = botonWa({ mensaje: pg.wa.mensaje, producto: pg.product || pg.id, cta: 'detalle_cierre' });

  const secciones = [
    seccionQueEsYParaQuien(ctx, c, pg.frase),
    ...secBloques,
    seccionIncluye(ctx, c),
    niveles,
    seccionPasos(ctx, c),
    seccionPlazoPago(ctx, null, c),
    seccionFaq(ctx, c, 'detalle'),
  ].filter(Boolean);

  const filasNivel = miembros.map(m => {
    const prm = precioDeItem(m, deps);
    return `<li><a href="#${esc(ancla(m))}" class="det-nivel-enlace estado-interactivo" data-evento="detalle_nivel_atajo" data-item="${esc(m.id)}"><span class="det-nivel-nombre">${esc(m.nombre)}</span><span class="det-nivel-precio">${esc(prm.monto)}${esc(prm.pegado)}</span></a></li>`;
  }).join('\n');

  const hero = [
    `<section class="det-hero relative pt-24 pb-12 sm:pt-28 lg:pt-36 lg:pb-16 overflow-hidden border-b border-white/5${ctx.hex ? ' hex-legible' : ''}" aria-labelledby="det-titulo">`,
    '  <div class="absolute inset-0 grain opacity-30 [mask-image:radial-gradient(ellipse_at_top,black_0%,transparent_65%)]" aria-hidden="true"></div>',
    '  <div class="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">',
    sangrar(migas(ctx, pg.nombre, categoria), 4),
    '    <div class="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start mt-2 lg:mt-6">',
    '      <div class="lg:col-span-7">',
    `        ${chipLinea(ctx, categoria)}`,
    `        <h1 id="det-titulo" class="det-h1 font-sans text-[1.875rem] leading-[1.12] sm:text-5xl lg:text-[3.25rem] font-extrabold text-white tracking-tight text-balance mt-5">${esc(pg.nombre)}</h1>`,
    `        <p class="det-frase text-xl text-slate-200 mt-5">${esc(pg.frase)}</p>`,
    '      </div>',
    '      <section class="lg:col-span-5" aria-label="Niveles y contacto">',
    '        <div class="det-compra x-card is-static">',
    '          <p class="det-precio-linea"><span class="det-desde">desde</span> <span class="det-monto">' + esc(desde.monto) + '<span class="det-mes">/mes</span></span></p>',
    '          <div class="det-acciones">',
    sangrar(principal, 12),
    '          </div>',
    '          <ul class="det-niveles-lista" aria-label="Niveles">',
    sangrar(filasNivel, 12),
    '          </ul>',
    '        </div>',
    '      </section>',
    '    </div>',
    '  </div>',
    '</section>',
  ].join('\n');

  const resumen = `${pg.nombre} · desde ${desde.monto}/mes`;
  const cierreHtml = cierre(ctx, { bloques: bloquesIds, botonPrincipal: principalCierre, consulta: false, resumen, origen });
  const cuerpo = ['', hero, '', ...secciones.flatMap(s => [s, '']), cierreHtml, ''].join('\n');

  const meta = pg.meta || {};
  const titulo = meta.titulo || `${pg.nombre} | F&V AI Group`;
  const descripcion = meta.descripcion || pg.frase;
  const montos = miembros.flatMap(m => montosNumericos(m, deps));
  const oferta = montos.length ? { '@type': 'AggregateOffer', lowPrice: String(Math.min(...montos)), highPrice: String(Math.max(...montos)), priceCurrency: 'USD', offerCount: miembros.length } : null;
  const jsonld = [
    jsonldPrincipal(ctx, pg, descripcion, urlPagina, categoria, oferta),
    jsonldMigas(ctx, pg.nombre, categoria, urlPagina),
    jsonldFaq(c.faq),
  ].filter(Boolean);

  return renderPagina({
    ruta,
    titulo,
    descripcion,
    og: { imagen: ctx.imagen, alt: `${pg.nombre}: ${categoria.nombre}` },
    jsonld,
    activo: ctx.tipoDatos.ruta.replace(/^\//, ''),
    hijo: true,
    wa: `Hola F&V, vengo de la página de ${pg.nombre} y tengo una consulta`,
    cuerpo,
    claseMain: ctx.linea.clase,
    comentario: COMENTARIO,
  });
}

function generarDetalles(cat, deps) {
  deps = deps || dependencias();
  const out = {};
  for (const d of listaDetalles(cat)) {
    if (out[d.archivo]) throw new Error(`Dos páginas de detalle quieren el mismo archivo: ${d.archivo}`);
    out[d.archivo] = d.compartida ? renderCompartida(d.compartida, cat, { deps }) : renderDetalle(d.item, cat, { deps });
  }
  return out;
}

module.exports = { CARPETA, CRUCES, TEXTOS, listaDetalles, renderDetalle, renderCompartida, generarDetalles, rutaDeUrl, archivoDeRuta, partirTodos, fechaLarga, cuposTexto };
