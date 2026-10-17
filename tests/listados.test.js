// Pruebas de las páginas /servicios y /productos y de las tarjetas: node tests/listados.test.js
// - servicios.html y productos.html están al día respecto del catálogo (se generan en memoria y se comparan con el archivo)
// - cada ítem aparece como tarjeta, una sola vez, en su página y su categoría; ⬡ antes que ▲; sin bloques vacíos
// - tarjetas: sin WhatsApp, un solo enlace, sin «Línea Hexagonal/Triangular», frase de 15 palabras o menos
// - precios: Hexagonal redondos, Triangular terminados en ,99; software «desde $190/mes» y «desde $89,99/mes»
// - el marcador <!-- tarjetas:inicio ids="..." cols="..." --> funciona con una plantilla en memoria
const fs = require('fs');
const path = require('path');
const B = require('../scripts/build-html.js');
const { generarPaginas } = require('../scripts/catalogo/generar');
const { renderTarjeta, reemplazarMarcadores } = require('../scripts/catalogo/tarjetas');
const { precioDeItem } = require('../scripts/catalogo/precio');
const { dependencias } = require('../scripts/catalogo/cargar');

const RAIZ = B.RAIZ;
let n = 0;
function ok(c, m) { n++; if (!c) { console.error('✗ ' + m); process.exitCode = 1; } }
const unix = s => s.replace(/\r\n/g, '\n');
const cat = B.cargarCatalogo();
const deps = dependencias();
const PROHIBIDO = /L[ií]nea (Hexagonal|Triangular)/;

// texto visible de un fragmento HTML
function visible(html) {
  return html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<\/?(?:div|p|h\d|article|li|ul|a|section|header|nav|main|footer|button)\b[^>]*>/g, ' ').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
}
const palabras = s => s.trim().split(/\s+/).filter(Boolean).length;
// separa el HTML de una página en tarjetas
const tarjetasDe = html => html.match(/<article class="tarjeta [\s\S]*?<\/article>/g) || [];
const idDe = t => (t.match(/data-item="([^"]+)"/) || [])[1];

// ------------------------------------------------------------ al día respecto del catálogo
const generadas = generarPaginas(cat);
for (const tipo of ['servicio', 'producto']) {
  const t = cat.tipos[tipo];
  ok(t.archivo in generadas, `se genera ${t.archivo}`);
  const ruta = path.join(RAIZ, t.archivo);
  ok(fs.existsSync(ruta), `${t.archivo} existe (corra node scripts/build-html.js)`);
  if (!fs.existsSync(ruta)) continue;
  const esperado = B.procesarPagina(generadas[t.archivo], { catalogo: cat, archivo: t.archivo });
  const actual = unix(fs.readFileSync(ruta, 'utf8'));
  ok(actual === esperado, `${t.archivo} está al día respecto de data/catalogo.json (corra node scripts/build-html.js)`);
  ok(/<!-- generado por scripts\/build-html\.js desde data\/catalogo\.json: no editar a mano -->/.test(actual), `${t.archivo} lleva el aviso «no editar a mano»`);
  ok(B.listarPaginas().includes(t.archivo), `${t.archivo} es una página no legacy del build`);
}

// ------------------------------------------------------------ contenido de cada página
for (const tipo of ['servicio', 'producto']) {
  const t = cat.tipos[tipo];
  const archivo = t.archivo;
  if (!fs.existsSync(path.join(RAIZ, archivo))) continue;
  const html = unix(fs.readFileSync(path.join(RAIZ, archivo), 'utf8'));
  const itemsTipo = cat.items.filter(i => i.tipo === tipo);

  // portada
  ok(new RegExp(`<h1 [^>]*>[\\s\\S]*?${t.titulo}[\\s\\S]*?</h1>`).test(html), `${archivo}: un h1 con «${t.titulo}»`);
  ok((html.match(/<h1\b/g) || []).length === 1, `${archivo}: un solo h1`);
  const txt = visible(html.slice(html.indexOf('<main')));
  ok(txt.includes(t.intro), `${archivo}: muestra la introducción`);
  ok(txt.includes(t.definicion), `${archivo}: muestra la definición corta`);
  ok(/Empresas e instituciones/.test(txt) && /Negocios pequeños/.test(txt), `${archivo}: muestra la leyenda en palabras simples`);
  ok(!PROHIBIDO.test(visible(html.slice(html.indexOf('<main')))), `${archivo}: no dice «Línea Hexagonal/Triangular» en el contenido`);
  ok(!/Express/i.test(html.slice(html.indexOf('<main'))), `${archivo}: «Express» no existe`);
  ok(html.includes(`<title>${t.meta_titulo.replace(/&/g, '&amp;')}</title>`), `${archivo}: meta título del catálogo`);
  ok(html.includes(`<meta name="description" content="${t.meta_descripcion.replace(/&/g, '&amp;')}">`), `${archivo}: meta descripción del catálogo`);
  ok(html.includes(`<link rel="canonical" href="https://www.fvaigroup.com${t.ruta}">`), `${archivo}: canónica`);
  ok(html.includes(`https://www.fvaigroup.com/assets/og/${t.ruta.slice(1)}.png`), `${archivo}: og:image absoluta`);
  ok(/<!-- extra:inicio -->\n(?:[\s\S]*?\n)?<!-- extra:fin -->/.test(html), `${archivo}: tiene los ganchos extra:inicio / extra:fin`);
  ok(html.indexOf('<!-- extra:inicio -->') > html.lastIndexOf('</section>', html.indexOf('<!-- extra:inicio -->')) - 1, `${archivo}: ganchos después de las categorías`);
  ok(/wa\.me\/584244125386\?text=[^"]+"[^>]*data-evento="(servicios|productos)_whatsapp"/.test(html), `${archivo}: cierre con WhatsApp y data-evento propio`);
  const cierre = decodeURIComponent(((html.match(/href="(https:\/\/wa\.me\/584244125386\?text=[^"]+)"[^>]*data-evento="(?:servicios|productos)_whatsapp"/) || [])[1]) || '');
  ok(cierre && !PROHIBIDO.test(cierre), `${archivo}: el mensaje del cierre no nombra la línea`);
  if (tipo === 'servicio') {
    ok(/href="\/contacto#agenda"[^>]*>Consulta gratis de 20 min</.test(html), `${archivo}: «Consulta gratis de 20 min» → /contacto#agenda`);
    ok(html.includes(`class="link-underline !whitespace-normal">${t.otro_enlace.texto.replace(" →", " →")}</a>`), `${archivo}: enlace discreto «${t.otro_enlace.texto}»`);
    ok((html.match(new RegExp(`href="${t.otro_enlace.href}" class="link-underline`, 'g')) || []).length === t.categorias.length, `${archivo}: el enlace a /productos al final de cada categoría`);
    ok(/<main id="main-content" class="linea-hex">/.test(html), `${archivo}: envolvente .linea-hex`);
    ok(/class="lst-cat [^"]*hex-legible"/.test(html), `${archivo}: secciones con .hex-legible`);
  }

  // todas las tarjetas de la página, una sola vez
  const todas = tarjetasDe(html);
  ok(todas.length === itemsTipo.length, `${archivo}: ${itemsTipo.length} tarjetas (hay ${todas.length})`);
  const ids = todas.map(idDe);
  ok(new Set(ids).size === ids.length, `${archivo}: ninguna tarjeta repetida`);

  // anclas y categorías
  let anteriorFin = 0;
  t.categorias.forEach((c, i) => {
    const re = new RegExp(`<section id="${c.id}" class="lst-cat[^>]*>[\\s\\S]*?</section>`);
    const m = html.match(re);
    ok(!!m, `${archivo}: existe <section id="${c.id}">`);
    ok((html.match(new RegExp(`id="${c.id}"`, 'g')) || []).length === 1, `${archivo}: el ancla #${c.id} es única`);
    if (!m) return;
    const sec = m[0];
    const pos = html.indexOf(sec);
    ok(pos > anteriorFin, `${archivo}: categorías en el orden del catálogo (${c.id})`);
    anteriorFin = pos;
    ok(sec.includes(`>${c.nombre}</h2>`), `${archivo}/${c.id}: título de la categoría`);
    ok(c.intro ? sec.includes(c.intro) : true, `${archivo}/${c.id}: introducción de la categoría`);
    const enSec = tarjetasDe(sec).map(idDe);
    const esperados = cat.items.filter(x => x.tipo === tipo && x.categoria === c.id);
    ok(enSec.length === esperados.length && esperados.every(x => enSec.includes(x.id)), `${archivo}/${c.id}: tiene exactamente sus ${esperados.length} ítems`);

    // bloques: ⬡ antes que ▲, sin vacíos, orden por «orden»
    const lineas = (sec.match(/data-bloque="(?:hex|tri)"/g) || []).map(x => x.slice(13, 16));
    const lineasItems = ['hex', 'tri'].filter(l => esperados.some(x => x.linea === l));
    ok(JSON.stringify(lineas) === JSON.stringify(lineasItems), `${archivo}/${c.id}: bloques ${lineasItems.join(' → ')} sin bloques vacíos (hay ${lineas.join(' → ')})`);
    const partes = sec.split('<div class="lst-bloque ').slice(1);
    partes.forEach(p => {
      const linea = (p.match(/data-bloque="(hex|tri)"/) || [])[1];
      const ts = tarjetasDe(p);
      ok(ts.length > 0, `${archivo}/${c.id}/${linea}: el bloque no está vacío`);
      ok(ts.every(x => new RegExp(`data-linea="${linea}"`).test(x)), `${archivo}/${c.id}/${linea}: el bloque solo tiene tarjetas de su línea`);
      ok(new RegExp(`<h3 class="lst-bloque-cab"><span class="nav-forma nav-${linea}"`).test(p), `${archivo}/${c.id}/${linea}: cabecera con la forma de la línea`);
      const ordenEsperado = esperados.filter(x => x.linea === linea).sort((a, b) => a.orden - b.orden).map(x => x.id);
      ok(JSON.stringify(ts.map(idDe)) === JSON.stringify(ordenEsperado), `${archivo}/${c.id}/${linea}: ítems por el campo orden`);
      const cab = (p.match(/<h3 class="lst-bloque-cab">[\s\S]*?<\/h3>/) || [''])[0];
      ok(visible(cab).startsWith(cat.lineas[linea].leyenda), `${archivo}/${c.id}/${linea}: la cabecera dice «${cat.lineas[linea].leyenda}»`);
      if (c.id === 'software') {
        const esperado = linea === 'hex' ? 'desde $190/mes' : 'desde $89,99/mes';
        ok(visible(cab).includes(esperado), `${archivo}/software/${linea}: la cabecera dice «${esperado}»`);
      } else ok(!/lst-bloque-desde/.test(cab), `${archivo}/${c.id}/${linea}: solo Software lleva «desde» en la cabecera`);
    });
  });

  // JSON-LD
  const ld = (html.match(/<script type="application\/ld\+json">\n([\s\S]*?)\n<\/script>/) || [])[1];
  ok(!!ld, `${archivo}: tiene JSON-LD`);
  if (ld) {
    const j = JSON.parse(ld);
    ok(j['@type'] === 'CollectionPage' && j.mainEntity['@type'] === 'ItemList', `${archivo}: CollectionPage con ItemList`);
    ok(j.mainEntity.itemListElement.length === itemsTipo.length, `${archivo}: el ItemList tiene todos los ítems`);
    j.mainEntity.itemListElement.forEach(e => {
      const it = itemsTipo.find(x => x.nombre === e.item.name && e.item.url === 'https://www.fvaigroup.com' + x.detalle.url);
      ok(!!it, `${archivo}: ${e.item.name} tiene url absoluta`);
      if (!it) return;
      if (it.precio.modo === 'a-medida') ok(!e.item.offers, `${archivo}: ${it.id} (a medida) no lleva precio en el JSON-LD`);
      else {
        ok(!!e.item.offers && e.item.offers.priceCurrency === 'USD', `${archivo}: ${it.id} lleva Offer en USD`);
      }
    });
  }
}

// ------------------------------------------------------------ tarjetas
for (const it of cat.items) {
  const html = renderTarjeta(it, cat, { nivel: 4, deps });
  const v = visible(html);
  const l = cat.lineas[it.linea];
  ok(!/wa\.me/.test(html), `${it.id}: la tarjeta no tiene WhatsApp`);
  ok((html.match(/<a\b/g) || []).length === 1 && !/<button\b/.test(html), `${it.id}: un solo enlace y ningún botón`);
  ok(new RegExp(`<a href="${it.detalle.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}" [^>]*aria-label="Ver detalle de ${it.nombre.replace(/[.*+?^${}()|[\]\\&]/g, '.')}"[^>]*data-evento="ver_detalle" data-item="${it.id}" data-linea="${it.linea}"`).test(html), `${it.id}: el enlace «Ver detalle» apunta al detalle y trae data-evento, data-item y data-linea`);
  ok(/class="[^"]*\btarjeta-boton\b[^"]*"/.test(html), `${it.id}: botón con área táctil propia (.tarjeta-boton, 48 px)`);
  ok(html.includes(` ${l.clase}`) && (it.linea !== 'hex' || /hex-legible/.test(html)), `${it.id}: envolvente ${l.clase}${it.linea === 'hex' ? ' y .hex-legible' : ''}`);
  ok(!PROHIBIDO.test(html) && !/Express/i.test(html), `${it.id}: sin «Línea Hexagonal/Triangular» ni «Express»`);
  ok(palabras(it.frase) <= 15 && v.includes(it.frase), `${it.id}: frase de ${palabras(it.frase)} palabras (máx. 15)`);
  ok(v.includes(it.nombre) || v.includes(it.nombre.replace(/&/g, '&')), `${it.id}: muestra el nombre`);
  if (it.plazo) ok(v.includes(it.plazo), `${it.id}: muestra el plazo`);
  ok(!/\b\d{1,2} de (octubre|noviembre|diciembre)\b/.test(v), `${it.id}: sin fechas en la tarjeta`);

  // precios del texto visible
  const montos = v.match(/\$\d[\d.]*(?:,\d+)?/g) || [];
  montos.forEach(m => {
    if (it.linea === 'hex') ok(/^\$\d{1,3}(\.\d{3})*$/.test(m) && parseInt(m.replace(/[$.]/g, ''), 10) % 10 === 0, `${it.id}: ${m} es redondo (Hexagonal)`);
    else ok(/,99$/.test(m), `${it.id}: ${m} termina en ,99 (Triangular)`);
  });
  const pr = precioDeItem(it, deps);
  if (it.precio.modo === 'a-medida') {
    ok(v.includes('A medida'), `${it.id}: dice «A medida»`);
    if (it.precio.referencia) {
      ok(v.includes(`Referencia: ${it.precio.referencia}`), `${it.id}: «Referencia: ${it.precio.referencia}»`);
      ok(v.includes('precio final después del diagnóstico'), `${it.id}: la referencia lleva «precio final después del diagnóstico»`);
    }
    else ok(!/Referencia/.test(v), `${it.id}: sin referencia`);
  } else ok(montos.length >= 1, `${it.id}: muestra un precio (${pr.texto})`);
  if (it.precio.modo === 'software') {
    const esperado = it.linea === 'hex' ? 'desde $190/mes' : 'desde $89,99/mes';
    ok(v.includes(esperado), `${it.id}: software muestra «${esperado}»`);
  }
  if (it.precio.modo === 'evento') {
    const esperado = it.precio.evento === 'curso' ? '$299,99' : '$24,99 por persona';
    ok(v.includes(esperado), `${it.id}: evento muestra «${esperado}»`);
  }
  if (it.precio.modo === 'fijo' || it.precio.modo === 'desde') {
    const base = it.precio.texto.replace(/^desde\s+/, '').match(/^\$[\d.]+(?:,\d+)?/)[0];
    ok(v.includes(base), `${it.id}: muestra ${base}`);
    if (/^desde/.test(it.precio.texto)) ok(v.includes('desde'), `${it.id}: «desde»`);
    if (it.precio.periodo === 'al mes') ok(v.includes(base + '/mes'), `${it.id}: ${base}/mes`);
  }
}

// ------------------------------------------------------------ marcador <!-- tarjetas -->
const plantilla = [
  '<main>',
  '<!-- tarjetas:inicio ids="diagnostico,asesor-financiero,formacion-ejecutiva,tablero-gerencial" cols="4" -->',
  'contenido viejo',
  '<!-- tarjetas:fin -->',
  '<!-- tarjetas:inicio ids="plan-arranque,caja-clara" cols="2" nivel="2" -->',
  '<!-- tarjetas:fin -->',
  '</main>',
].join('\n');
const res = reemplazarMarcadores(plantilla, cat, 'prueba.html');
ok(!/contenido viejo/.test(res), 'el marcador reemplaza el contenido anterior');
ok(JSON.stringify(tarjetasDe(res).map(idDe)) === JSON.stringify(['diagnostico', 'asesor-financiero', 'formacion-ejecutiva', 'tablero-gerencial', 'plan-arranque', 'caja-clara']), 'el marcador respeta el orden de los ids');
ok(/tarjetas-cols-4/.test(res) && /tarjetas-cols-2/.test(res), 'el marcador respeta cols (4 y 2)');
ok(/<h2 id="tarjeta-plan-arranque"/.test(res) && /<h3 id="tarjeta-diagnostico"/.test(res), 'el marcador respeta nivel (por defecto h3)');
ok(reemplazarMarcadores(res, cat, 'prueba.html') === res, 'el reemplazo es idempotente');
ok(/<!-- tarjetas:inicio ids="diagnostico,asesor-financiero,formacion-ejecutiva,tablero-gerencial" cols="4" -->/.test(res) && /<!-- tarjetas:fin -->/.test(res), 'los marcadores se conservan');
let fallo = '';
try { reemplazarMarcadores('<!-- tarjetas:inicio ids="no-existe" --><!-- tarjetas:fin -->', cat, 'x.html'); } catch (e) { fallo = e.message; }
ok(/no-existe/.test(fallo), 'un id inexistente da un error claro');
try { fallo = ''; reemplazarMarcadores('<!-- tarjetas:inicio ids="diagnostico" cols="5" --><!-- tarjetas:fin -->', cat, 'x.html'); } catch (e) { fallo = e.message; }
ok(/cols/.test(fallo), 'cols fuera de 2, 3 o 4 da un error claro');
// el build lo aplica a una página completa (con encabezado y pie)
const pagina = B.procesarPagina('<!DOCTYPE html><html><body>\n<!-- header:inicio activo="ninguno" -->\n<!-- header:fin -->\n<main>\n<!-- tarjetas:inicio ids="presencia" cols="3" -->\n<!-- tarjetas:fin -->\n</main>\n<!-- footer:inicio -->\n<!-- footer:fin -->\n</body></html>', { catalogo: cat, archivo: 'prueba.html' });
ok(/data-item="presencia"/.test(pagina) && /id="site-header"/.test(pagina) && /<footer/.test(pagina), 'procesarPagina rellena tarjetas, encabezado y pie');
// ninguna página real deja marcadores sin rellenar
for (const p of B.listarPaginas()) {
  const h = unix(fs.readFileSync(path.join(RAIZ, p), 'utf8'));
  if (/<!-- tarjetas:inicio/.test(h)) ok(reemplazarMarcadores(h, cat, p) === h, `${p}: sus tarjetas están al día`);
}

console.log(`listados: ${n} comprobaciones${process.exitCode ? ' (CON FALLAS)' : ' correctas'}`);
