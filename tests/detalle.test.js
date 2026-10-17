// Pruebas de las páginas de detalle (servicios/*.html y productos/*.html): node tests/detalle.test.js
// Se generan en memoria desde data/catalogo.json y se comparan con los archivos; después se revisa cada página.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const B = require('../scripts/build-html.js');
const { generarDetalles, listaDetalles } = require('../scripts/catalogo/detalle.js');
const { dependencias } = require('../scripts/catalogo/cargar.js');
const { precioDeItem } = require('../scripts/catalogo/precio.js');

const RAIZ = B.RAIZ;
let n = 0;
function ok(c, m) { n++; if (!c) { console.error('✗ ' + m); process.exitCode = 1; } }
const unix = s => s.replace(/\r\n/g, '\n');
const unesc = s => s.replace(/&quot;/g, '"').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
const sinEtiquetas = s => unesc(s.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

const cat = B.cargarCatalogo();
const deps = dependencias();
const detalles = listaDetalles(cat);
const generadas = generarDetalles(cat, deps);

// ---------------------------------------------------------------- existencia y actualidad
const esperadas = detalles.map(d => d.archivo).sort();
const itemsGenerados = cat.items.filter(i => i.detalle.modo === 'generada' && !i.detalle.pagina).length;
ok(detalles.length === itemsGenerados + (cat.paginas_compartidas || []).length, 'una página por ítem generado y una por página compartida');
ok(esperadas.length === Object.keys(generadas).length, 'sin archivos repetidos');
for (const d of ['servicios', 'productos']) {
  const dir = path.join(RAIZ, d);
  const reales = fs.existsSync(dir) ? fs.readdirSync(dir).map(f => `${d}/${f}`) : [];
  const esperadasDe = esperadas.filter(f => f.startsWith(d + '/'));
  ok(JSON.stringify(reales.sort()) === JSON.stringify(esperadasDe), `${d}/: no sobra ni falta ningún archivo (hay ${reales.length}, se esperan ${esperadasDe.length})`);
}

const AVISO = 'generado por scripts/build-html.js desde data/catalogo.json: no editar a mano';
const PROHIBIDO = /L[ií]nea (Hexagonal|Triangular)|\bExpress\b|Asesor F&amp;V|Sesión Clara|Pack Enfoque/;

function jsonlds(html) {
  const r = [];
  html.replace(/<script type="application\/ld\+json">\n([\s\S]*?)\n<\/script>/g, (m, j) => { r.push(j); return m; });
  return r;
}
function seccion(html, id) {
  const m = html.match(new RegExp(`<(section|div|aside)[^>]*\\bid="${id}"[^>]*>`));
  return m ? m[0] : null;
}
// Montos «$1.000», «$39,99» -> número
const num = m => parseFloat(m.replace('$', '').replace(/\./g, '').replace(',', '.'));
function reglaPrecio(linea, texto, etiqueta) {
  const montos = texto.match(/\$[\d.]+(?:,\d+)?/g) || [];
  montos.forEach(m => {
    const v = num(m);
    if (linea === 'hex') ok(Number.isInteger(v) && v % 10 === 0, `${etiqueta}: Hexagonal es redondo (múltiplos de 10), hay ${m}`);
    else ok(/,99$/.test(m), `${etiqueta}: Triangular termina en ,99, hay ${m}`);
  });
}

for (const d of detalles) {
  const { archivo } = d;
  const it = d.item || d.compartida;
  const esCompartida = !!d.compartida;
  const ruta = path.join(RAIZ, archivo);
  ok(fs.existsSync(ruta), `${archivo}: existe`);
  if (!fs.existsSync(ruta)) continue;
  const html = unix(fs.readFileSync(ruta, 'utf8'));

  // al día respecto al catálogo (igual que el build: generada + tarjetas + encabezado y pie)
  const esperado = B.procesarPagina(generadas[archivo], { catalogo: cat, archivo });
  ok(html === esperado, `${archivo}: está al día respecto al catálogo (corra node scripts/build-html.js)`);
  ok(html.includes(`<!-- ${AVISO} -->`), `${archivo}: lleva el aviso «no editar a mano»`);
  ok(!/\r/.test(html), `${archivo}: usa saltos de línea LF`);

  // un solo h1 igual al nombre
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g) || [];
  ok(h1.length === 1, `${archivo}: un solo h1 (hay ${h1.length})`);
  ok(h1.length === 1 && sinEtiquetas(h1[0]) === it.nombre, `${archivo}: el h1 es el nombre «${it.nombre}»`);

  // encabezados en orden (no se salta de nivel hacia abajo)
  const niveles = [...html.matchAll(/<h([1-6])\b/g)].map(m => +m[1]);
  let previo = 0, salto = false;
  niveles.forEach(l => { if (previo && l > previo + 1) salto = true; previo = l; });
  ok(!salto, `${archivo}: los encabezados no saltan de nivel`);

  // migas
  const migas = (html.match(/<nav class="det-migas" aria-label="Ruta">([\s\S]*?)<\/nav>/) || [])[1] || '';
  const tipoRuta = it.tipo === 'servicio' ? '/servicios' : '/productos';
  const categoria = cat.tipos[it.tipo].categorias.find(c => c.id === it.categoria);
  ok(migas.includes(`<a href="${tipoRuta}">`) && migas.includes(`<a href="${tipoRuta}#${it.categoria}">${categoria.nombre}</a>`) && migas.includes('aria-current="page"'), `${archivo}: migas Servicios/Productos › categoría › nombre`);

  // botón principal de WhatsApp
  const enlacesWa = [...html.matchAll(/<a href="(https:\/\/wa\.me\/584244125386\?text=[^"]*)"([^>]*)>/g)].map(m => ({ href: unesc(m[1]), attrs: m[2] }));
  const principales = enlacesWa.filter(a => /data-cta="detalle"/.test(a.attrs));
  ok(principales.length >= 1, `${archivo}: tiene el botón principal de WhatsApp (data-cta="detalle")`);
  const producto = it.product || it.id;
  principales.forEach(a => {
    ok(decodeURIComponent(a.href.split('?text=')[1]) === it.wa.mensaje, `${archivo}: el mensaje de WhatsApp coincide con wa.mensaje`);
    ok(a.attrs.includes(`data-product="${producto}"`), `${archivo}: data-product="${producto}"`);
    ok(/target="_blank" rel="noopener"/.test(a.attrs) && /data-evento="detalle_whatsapp"/.test(a.attrs), `${archivo}: el botón abre en pestaña nueva y lleva data-evento`);
  });
  enlacesWa.forEach(a => ok(!PROHIBIDO.test(decodeURIComponent(a.href.split('?text=')[1] || '')), `${archivo}: ningún mensaje de WhatsApp nombra la línea`));
  const cantidadBotones = (html.match(/data-cta="detalle(?:_plan|_nivel|_cierre)?"/g) || []).length;
  ok(cantidadBotones >= 2, `${archivo}: botón en la cabecera y en el cierre`);
  if (it.tipo === 'servicio' && !esCompartida) ok(/href="\/contacto#agenda"[^>]*>Consulta gratis de 20 min</.test(html), `${archivo}: los servicios llevan «Consulta gratis de 20 min»`);

  // head y meta
  const url = `https://www.fvaigroup.com${d.ruta}`;
  ok(html.includes(`<link rel="canonical" href="${url}">`), `${archivo}: canonical ${url}`);
  const og = (html.match(/<meta property="og:image" content="([^"]+)">/) || [])[1] || '';
  ok(og === `https://www.fvaigroup.com/assets/og/${it.tipo === 'servicio' ? 'servicios' : 'productos'}-${it.categoria}.png`, `${archivo}: og:image de su categoría`);
  ok(fs.existsSync(path.join(RAIZ, og.replace('https://www.fvaigroup.com/', ''))), `${archivo}: la imagen og existe en disco`);
  const meta = it.meta || {};
  const titulo = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1];
  ok(unesc(titulo || '') === (meta.titulo || `${it.nombre} | F&V AI Group`), `${archivo}: título`);
  const descripcion = (html.match(/<meta name="description" content="([^"]*)">/) || [])[1];
  ok(unesc(descripcion || '') === (meta.descripcion || it.frase), `${archivo}: descripción`);
  const cab = (html.match(/<!-- header:inicio([^>]*?)-->/) || [])[1] || '';
  ok(/hijo="si"/.test(cab) && cab.includes(`activo="${it.tipo === 'servicio' ? 'servicios' : 'productos'}"`), `${archivo}: el menú marca el grupo como padre del detalle`);
  ok(cab.includes(`wa="Hola F&V, vengo de la página de ${it.nombre} y tengo una consulta"`), `${archivo}: mensaje de WhatsApp del encabezado`);

  // JSON-LD
  const bloques = jsonlds(html);
  const objetos = bloques.map(j => { try { return JSON.parse(j); } catch (e) { return null; } });
  ok(objetos.every(Boolean) && objetos.length >= 2, `${archivo}: JSON-LD válido`);
  const tipos = objetos.filter(Boolean).map(o => o['@type']);
  ok(tipos.includes(it.tipo === 'servicio' ? 'Service' : 'Product'), `${archivo}: JSON-LD ${it.tipo === 'servicio' ? 'Service' : 'Product'}`);
  ok(tipos.includes('BreadcrumbList'), `${archivo}: JSON-LD BreadcrumbList`);
  const tieneFaq = ((it.contenido || {}).faq || []).some(f => f.p && f.r);
  ok(tipos.includes('FAQPage') === tieneFaq, `${archivo}: FAQPage solo si hay preguntas`);
  const principal = objetos.find(o => o && (o['@type'] === 'Service' || o['@type'] === 'Product')) || {};
  if (!esCompartida && it.precio.modo === 'a-medida') ok(!principal.offers, `${archivo}: a medida no lleva precio en el JSON-LD`);
  if (!esCompartida && it.tipo === 'producto' && principal.offers) ok(principal.offers.priceCurrency === 'USD' && !!(principal.offers.price || principal.offers.lowPrice), `${archivo}: Product con Offer numérica`);
  ok(!/Offer/.test(JSON.stringify(objetos.find(o => o && o['@type'] === 'BreadcrumbList') || {})), `${archivo}: las migas no llevan ofertas`);

  // marca
  ok(!PROHIBIDO.test(html.replace(/<script[\s\S]*?<\/script>/g, '')), `${archivo}: sin «Línea Hexagonal/Triangular», «Express» ni nombres retirados`);
  const clase = (html.match(/<main id="main-content" class="([^"]*)"/) || [])[1];
  ok(clase === cat.lineas[it.linea].clase, `${archivo}: el <main> lleva la envolvente ${cat.lineas[it.linea].clase}`);
  if (it.linea === 'hex') ok((html.match(/hex-legible/g) || []).length >= 3, `${archivo}: Hexagonal con .hex-legible`);
  // el trato: «usted» en lo Hexagonal y «tú» en lo Triangular (solo textos de la plantilla)
  const principalHtml = html.slice(html.indexOf('<main'), html.indexOf('</main>'));
  if (it.linea === 'tri') ok(!/\b(usted|ustedes|su empresa)\b/i.test(sinEtiquetas(principalHtml.replace(/<h[1-3][^>]*>[\s\S]*?<\/h[1-3]>/g, ''))), `${archivo}: Triangular sin «usted»`);
  if (it.linea === 'hex') ok(!/\b(¿Es para ti\?|También te puede servir|Escríbenos|Cuéntanos)\b/.test(sinEtiquetas(principalHtml)), `${archivo}: Hexagonal sin «tú» en la plantilla`);

  // las secciones vacías no aparecen
  const c = it.contenido || {};
  const hay = x => Array.isArray(x) ? x.some(v => (typeof v === 'string' ? v.trim() : v)) : !!(x && String(x).trim());
  if (!hay(c.incluye)) ok(!seccion(html, 'incluye'), `${archivo}: sin «incluye» no hay sección`); else ok(!!seccion(html, 'incluye'), `${archivo}: sección «Qué incluye»`);
  if (!hay(c.pasos)) ok(!seccion(html, 'como-funciona'), `${archivo}: sin pasos no hay «Cómo funciona»`);
  else ok(!!seccion(html, 'como-funciona'), `${archivo}: sección «Cómo funciona»`);
  if (!hay(c.planes)) ok(!seccion(html, 'precios'), `${archivo}: sin planes no hay «precios»`);
  else ok(!!seccion(html, 'precios'), `${archivo}: sección de precios o tamaños`);
  if (!hay(c.faq)) ok(!seccion(html, 'preguntas'), `${archivo}: sin preguntas no hay sección`);
  else ok(!!seccion(html, 'preguntas') && (html.match(/<details /g) || []).length === c.faq.length, `${archivo}: una pregunta desplegable por cada faq`);
  if (!hay(c.para_quien)) ok(!/id="det-para-quien"/.test(html), `${archivo}: sin «para quién» no hay sección`);
  if (!hay(c.que_es)) ok(!/id="det-que-es"/.test(html), `${archivo}: sin «qué es» no hay sección`);
  const sinRel = !(it.relacionados || []).length;
  if (!esCompartida && sinRel) ok(!seccion(html, 'relacionados'), `${archivo}: sin relacionados no hay sección`);
  // ninguna sección sin texto
  const seccionesHtml = html.match(/<section\b[^>]*class="det-seccion[\s\S]*?<\/section>/g) || [];
  seccionesHtml.forEach(s => ok(sinEtiquetas(s).length > 40, `${archivo}: sección con contenido`));
  // los bloques citados (los que no son de pago ni horario) salen con su título
  (c.bloques || []).forEach(id => {
    const b = cat.bloques[id];
    ok(!!b, `${archivo}: el bloque «${id}» existe`);
    if (!b) return;
    if (/^pago/.test(id) || id === 'horario-atencion') ok(html.includes(`<h3 class="font-sans text-xl font-semibold text-white">${b.titulo}</h3>`), `${archivo}: el bloque «${id}» va en el cierre`);
    else ok(html.includes(`id="det-b-${id}"`), `${archivo}: el bloque «${id}» tiene su sección`);
  });

  // relacionados: 2 o 3 y la Hexagonal primero
  if (!esCompartida && !sinRel) {
    const rel = (html.match(/<section id="relacionados"[\s\S]*?<\/section>/) || [''])[0];
    const lineas = [...rel.matchAll(/<article class="tarjeta x-card linea-(hex|tri)[^"]*" data-item="([^"]+)"/g)].map(m => ({ linea: m[1], id: m[2] }));
    ok(lineas.length >= 2 && lineas.length <= 3, `${archivo}: 2 o 3 relacionados (hay ${lineas.length})`);
    ok(lineas.length === it.relacionados.length && it.relacionados.every(r => lineas.some(l => l.id === r)), `${archivo}: los relacionados son los del catálogo`);
    ok(!/tri[\s\S]*hex/.test(lineas.map(l => l.linea).join('')), `${archivo}: la Hexagonal va antes que la Triangular en los relacionados`);
  }

  // precios visibles
  if (!esCompartida) {
    const pr = precioDeItem(it, deps);
    reglaPrecio(it.linea, [pr.monto, pr.referencia].join(' '), `${archivo} precio de la cabecera`);
    (c.planes || []).forEach(p => reglaPrecio(it.linea, p.precio, `${archivo} plan ${p.id}`));
    if (it.precio.modo !== 'evento') ok(sinEtiquetas(html).includes(pr.monto), `${archivo}: muestra el precio ${pr.monto}`);
    if (it.precio.modo === 'a-medida' && it.precio.referencia) {
      ok(html.includes(`Referencia: ${it.precio.referencia}`), `${archivo}: «Referencia: ${it.precio.referencia}»`);
      ok(/Precio final después del diagnóstico/.test(html), `${archivo}: nota «precio final después del diagnóstico»`);
    }
    (c.planes || []).forEach(p => {
      ok(html.includes(`id="plan-${p.id}"`), `${archivo}: tarjeta del plan ${p.id}`);
      ok(html.includes(encodeURIComponent(p.wa || it.wa.mensaje).replace(/'/g, '%27')) || unesc(html).includes(encodeURIComponent(p.wa || it.wa.mensaje)), `${archivo}: el plan ${p.id} lleva su mensaje de WhatsApp`);
      const adelantado = /(Pagando 12 meses por adelantado: \$[\d.,]+ \(30 % menos\)\.)/.exec(p.detalle || '');
      if (adelantado) ok(sinEtiquetas(html).includes(adelantado[1]), `${archivo}: el plan ${p.id} muestra el precio de 12 meses tal cual está publicado`);
    });
  } else {
    // página compartida: una sección por miembro, con su ancla, nombre, precio y botón
    d.compartida.miembros.forEach(id => {
      const m = cat.items.find(i => i.id === id);
      const ancla = m.detalle.url.split('#')[1];
      ok(new RegExp(`<section id="${ancla}" class="det-nivel`).test(html), `${archivo}: ancla #${ancla}`);
      const sec = (html.match(new RegExp(`<section id="${ancla}"[\\s\\S]*?</section>`)) || [''])[0];
      const pr = precioDeItem(m, deps);
      ok(sec.includes(m.nombre) && sec.includes(pr.monto), `${archivo}: #${ancla} muestra nombre y precio`);
      ok(m.plazo && sec.includes(m.plazo), `${archivo}: #${ancla} muestra las horas incluidas`);
      ok(sec.includes(`data-product="${m.product || m.id}"`) && sec.includes(encodeURIComponent(m.wa.mensaje)), `${archivo}: #${ancla} tiene su botón de WhatsApp`);
      reglaPrecio(m.linea, pr.monto, `${archivo} #${ancla}`);
    });
    ok(html.includes('href="/servicios/asesor-financiero"'), `${archivo}: enlace cruzado al Asesor financiero`);
    ok(/id="det-b-diferencia-soporte-asesoria"/.test(html), `${archivo}: explica la diferencia entre soporte técnico y asesoría financiera`);
  }

  // Un taller: fechas, hora, cupos y precio salen de assets/eventos.js
  if (!esCompartida && it.precio.modo === 'evento' && it.precio.evento === 'taller') {
    ok(/<script defer src="\/assets\/eventos\.js"><\/script>/.test(html), `${archivo}: carga /assets/eventos.js`);
    ['taller.fecha', 'taller.hora', 'taller.cupos', 'taller.precio', 'taller.lugar', 'eventos.proximas'].forEach(k => ok(html.includes(`data-ev="${k}"`), `${archivo}: data-ev="${k}"`));
    ok(html.includes('data-ev-show="taller:vigente"') && html.includes('data-ev-show="taller:sin-fechas"'), `${archivo}: muestra u oculta según haya fecha`);
    ok(!/data-ev-wa=/.test(html), `${archivo}: no usa data-ev-wa (sus mensajes nombrarían la línea)`);
    const e = deps.ev.taller;
    ok(html.includes(`data-ev="taller.hora">${e.hora}<`), `${archivo}: la hora de respaldo es la de assets/eventos.js`);
    ok(html.includes(`data-ev="taller.precio">$${e.precio.toFixed(2).replace('.', ',')}<`), `${archivo}: el precio de respaldo es el de assets/eventos.js`);
    ok(/<li class="det-dato hidden" data-ev-show="taller:sin-fechas">[\s\S]*?Próximas fechas: escríbenos por WhatsApp/.test(html), `${archivo}: aviso «Próximas fechas: escríbenos por WhatsApp» listo para cuando no haya fecha`);
  }
}

// ---------------------------------------------------------------- el taller sin fechas futuras (eventos.js con otra fecha de hoy)
{
  const codigo = fs.readFileSync(path.join(RAIZ, 'assets/eventos.js'), 'utf8');
  function conHoy(iso) {
    const Real = Date;
    const fijo = new Real(iso + 'T12:00:00-04:00').getTime();
    class Falsa extends Real { constructor(...a) { if (a.length) super(...a); else super(fijo); } static now() { return fijo; } }
    const document = { readyState: 'complete', addEventListener() {}, querySelectorAll() { return []; } };
    const window = {};
    vm.runInContext(codigo, vm.createContext({ window, document, Date: Falsa, Intl, requestAnimationFrame: f => f(), setTimeout: () => 0, console }), { filename: 'assets/eventos.js' });
    return window.FV_EVENTOS;
  }
  const hoy = conHoy('2026-10-17');
  ok(hoy.estado['taller:vigente'] === true, 'el día del taller sigue vigente');
  const despues = conHoy('2027-03-01');
  ok(despues.estado['taller:sin-fechas'] === true && despues.estado['taller:vigente'] === false, 'sin fechas futuras: taller:sin-fechas');
  ok(despues.datos['eventos.proximas'] === 'Próximas fechas: escríbenos por WhatsApp', 'sin fechas futuras: «Próximas fechas: escríbenos por WhatsApp»');
}

// ---------------------------------------------------------------- todos los ítems «existente» apuntan a algo que existe
{
  const permitidas = new Set((cat.paginas_existentes_como_detalle || []));
  const ids = f => {
    const s = new Set();
    unix(fs.readFileSync(path.join(RAIZ, f), 'utf8')).replace(/\b(?:id|name)="([^"]+)"/g, (m, id) => { s.add(id); return m; });
    return s;
  };
  for (const it of cat.items.filter(i => i.detalle.modo === 'existente')) {
    const [ruta, ancla] = it.detalle.url.split('#');
    ok(permitidas.has(it.detalle.url), `${it.id}: ${it.detalle.url} está en paginas_existentes_como_detalle`);
    const archivo = [ruta.slice(1) + '.html', ruta.slice(1) + '/index.html'].find(f => fs.existsSync(path.join(RAIZ, f)));
    ok(!!archivo, `${it.id}: existe la página ${ruta}`);
    if (archivo && ancla) ok(ids(archivo).has(ancla), `${it.id}: existe el ancla #${ancla} en ${archivo}`);
  }
  // y los ítems «generada» con ancla (páginas compartidas) también
  for (const it of cat.items.filter(i => i.detalle.modo === 'generada' && i.detalle.url.includes('#'))) {
    const [ruta, ancla] = it.detalle.url.split('#');
    const archivo = ruta.slice(1) + '.html';
    ok(fs.existsSync(path.join(RAIZ, archivo)) && ids(archivo).has(ancla), `${it.id}: ${it.detalle.url} existe`);
  }
}

console.log(`detalle: ${n} comprobaciones${process.exitCode ? ' (CON FALLAS)' : ' correctas'}`);
