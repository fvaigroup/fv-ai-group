// Pruebas de la página de inicio (index.html): node tests/inicio.test.js
// - portada: h1 exacto, subtítulo y tres botones con sus destinos; sin cuestionario ni «datos en vivo»
// - las dos tarjetas de línea: misma estructura, Hexagonal primero, ayuda de tamaño, precio «desde» sacado del catálogo
// - orden de secciones, tarjetas destacadas al día con el catálogo, «Para dueños de empresa» corta
// - testimonios ocultos, cinco preguntas frecuentes y FAQPage del JSON-LD sincronizado, productos del JSON-LD con precios exactos
// - sin «Asesor F&V», «Sesión Clara», «Express»; «Línea Hexagonal/Triangular» no está en el encabezado ni en el pie
const fs = require('fs');
const path = require('path');
const B = require('../scripts/build-html.js');
const { reemplazarMarcadores, leerAtributos } = require('../scripts/catalogo/tarjetas');
const { montosNumericos } = require('../scripts/catalogo/precio');
const { dependencias } = require('../scripts/catalogo/cargar');

const RAIZ = B.RAIZ;
let n = 0;
function ok(c, m) { n++; if (!c) { console.error('✗ ' + m); process.exitCode = 1; } }
const unix = s => s.replace(/\r\n/g, '\n');
const html = unix(fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8'));
const cat = B.cargarCatalogo();
const deps = dependencias();

const decodificar = s => s.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
const texto = frag => decodificar(frag.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
// La palabra completa (\b) de JavaScript no reconoce las vocales con tilde: esta versión sí (para «tú», «según», etc.)
const LETRA = '[A-Za-z0-9_áéíóúñÁÉÍÓÚÑ]';
const pal = w => new RegExp('(?<!' + LETRA + ')(?:' + w + ')(?!' + LETRA + ')', 'i');
const palabras = s => s.split(/\s+/).filter(Boolean).length;

const main = html.slice(html.indexOf('<main'), html.indexOf('</main>') + 7);
const ABRE = /<section\b[^>]*\bid="([^"]+)"[^>]*>/g;
const secciones = [];
{ let m; while ((m = ABRE.exec(main))) secciones.push({ id: m[1], ini: m.index }); }
secciones.forEach((s, i) => { s.fin = main.indexOf('</section>', s.ini) + 10; s.html = main.slice(s.ini, s.fin); });
const sec = id => (secciones.find(s => s.id === id) || { html: '' }).html;

// ------------------------------------------------------------ cabecera de la página
const titulo = decodificar((html.match(/<title>([^<]*)<\/title>/) || [, ''])[1]);
ok(/F&V AI Group/.test(titulo) && /[Ss]ervicios/.test(titulo) && /productos/.test(titulo), `título con servicios y productos (${titulo})`);
ok(titulo.length <= 70, `título de 70 caracteres o menos (${titulo.length})`);
const descripcion = decodificar((html.match(/<meta name="description" content="([^"]*)"/) || [, ''])[1]);
ok(descripcion.length > 80 && descripcion.length <= 200, `descripción entre 80 y 200 caracteres (${descripcion.length})`);
ok(html.includes('<link rel="canonical" href="https://www.fvaigroup.com/">'), 'canónica del inicio');
ok(html.includes(`<meta property="og:title" content="${titulo.replace(/&/g, '&amp;')}">`) && html.includes(`<meta name="twitter:title" content="${titulo.replace(/&/g, '&amp;')}">`), 'og:title y twitter:title coherentes con el título');
ok(html.includes(`<meta property="og:description" content="${descripcion.replace(/&/g, '&amp;')}">`) && html.includes(`<meta name="twitter:description" content="${descripcion.replace(/&/g, '&amp;')}">`), 'og:description y twitter:description coherentes');
ok(/<!-- header:inicio activo="inicio"/.test(html) && /<!-- footer:inicio/.test(html), 'conserva los marcadores de encabezado y pie');

// ------------------------------------------------------------ 1. portada
const portada = sec('inicio');
ok((html.match(/<h1\b/g) || []).length === 1, 'un solo h1');
const h1 = texto((portada.match(/<h1[\s\S]*?<\/h1>/) || [''])[0]);
ok(h1 === 'Bienvenido al futuro de su empresa', `h1 exacto (hay «${h1}»)`);
ok(portada.includes('<span class="ini-h1-grad">futuro de su empresa</span>'), '«futuro de su empresa» lleva el degradado naranja → cian');
const ptxt = texto(portada);
ok(ptxt.includes('Eligió bien. Aquí la inteligencia artificial trabaja en sus números, en bolívares y en dólares, desde el primer día.'), 'subtítulo nuevo');
ok(!/No te vendemos herramientas sueltas|ini-apoyo/.test(portada), 'sin el texto de apoyo');
ok(!/F&amp;V AI Group · Valencia|ini-kicker/.test(portada), 'sin la pastilla «F&V AI GROUP · VALENCIA, VENEZUELA»');
const reglaHero = (fs.readFileSync(path.join(RAIZ, 'src/tailwind.css'), 'utf8').match(/\.ini-portada \.ini-hero \{[^}]*\}/) || [''])[0];
ok(reglaHero.includes('min-height: calc(100svh - 4.75rem)') && reglaHero.includes('justify-content: center') && portada.indexOf('class="ini-hero"') < portada.indexOf('ini-logos-titulo'), 'el hero ocupa la pantalla visible, con el contenido centrado, y la franja de logos queda debajo');
ok(ptxt.includes('30 minutos, sin costo y con cupos por semana.'), 'nota bajo los botones');
ok(!/Servicios a la medida para empresas|Productos listos para negocios|Precios claros en dólares, pagaderos/.test(ptxt), 'la portada ya no trae los textos anteriores');
ok(/<img src="assets\/logo-hex-hex\.png" alt="" aria-hidden="true"[^>]*class="ini-hexgiro">/.test(portada) && fs.existsSync(path.join(RAIZ, 'assets/logo-hex-hex.png')), 'hexágono decorativo: alt vacío, aria-hidden y archivo existente');
const cssTw = fs.readFileSync(path.join(RAIZ, 'src/tailwind.css'), 'utf8');
ok(/\.ini-hexgiro \{[^}]*animation: ini-giro 60s linear infinite/.test(cssTw) && cssTw.includes('prefers-reduced-motion: reduce) { .ini-portada .ini-hexgiro { animation: none'), 'el hexágono gira 60 s lineal y se detiene con prefers-reduced-motion');
ok(/\.ini-hexgiro \{[^}]*z-index: 0/.test(cssTw) && cssTw.includes('.ini-portada #hex-canvas { z-index: 1; }'), 'capas: los puntos (z 1) quedan sobre el hexágono (z 0)');
const botones = [...portada.matchAll(/<a [^>]*class="[^"]*\bini-boton\b[^"]*"[^>]*>[\s\S]*?<\/a>/g)].map(m => m[0]);
ok(botones.length === 2, `dos botones en la portada (hay ${botones.length})`);
const bt = i => texto(botones[i] || '');
const href = i => ((botones[i] || '').match(/href="([^"]*)"/) || [, ''])[1];
ok(bt(0) === 'Agende su consulta gratis' && /^https:\/\/wa\.me\/584244125386\?text=/.test(href(0)), 'primer botón: «Agende su consulta gratis» → wa.me');
ok(decodeURIComponent(href(0).split('text=')[1]) === 'Hola F&V, quiero agendar la consulta gratis de 30 minutos.', 'mensaje de WhatsApp prellenado de la portada');
ok(/data-cta="portada_hero"/.test(botones[0]) && /data-evento="portada_whatsapp"/.test(botones[0]), 'el botón principal lleva data-cta y data-evento="portada_whatsapp"');
ok(bt(1) === 'Conozca cómo trabajamos' && href(1) === '#camino', 'segundo botón: «Conozca cómo trabajamos» → #camino');
ok(html.includes('id="camino"'), 'existe la sección #camino a la que baja el botón');
ok(!/L[ií]nea (Hexagonal|Triangular)/.test(texto(portada)), 'la portada no nombra las líneas');
ok(portada.includes('ini-h1-grad') && /\.ini-h1-grad \{[^}]*linear-gradient\(90deg, #FF8C00, #00FFFF\)/.test(cssTw), 'la portada usa la marca madre (degradado naranja → cian en el título)');

// ------------------------------------------------------------ 2. dos líneas
const orden = ['inicio', 'camino', 'venezuela', 'conversacion', 'lineas', 'servicios-destacados', 'productos-destacados', 'duenos', 'como-trabajamos', 'diferencial', 'testimonios', 'proximas-fechas', 'faq', 'cta-final'];
ok(JSON.stringify(secciones.map(s => s.id)) === JSON.stringify(orden), `orden de secciones: ${orden.join(' → ')} (hay ${secciones.map(s => s.id).join(' → ')})`);

const lineas = sec('lineas');
ok(/<h2[^>]*>Dos líneas, según su tipo de organización<\/h2>/.test(lineas), 'título «Dos líneas, según su tipo de organización»');
const tarjetasLinea = [...lineas.matchAll(/<article class="ini-linea [\s\S]*?<\/article>/g)].map(m => m[0]);
ok(tarjetasLinea.length === 2, `dos tarjetas de línea (hay ${tarjetasLinea.length})`);
const [tHex, tTri] = tarjetasLinea;
ok(!!tHex && /data-linea="hex"/.test(tHex) && /class="ini-linea linea-hex/.test(tHex), 'la primera tarjeta es la Hexagonal (envolvente linea-hex)');
ok(!!tTri && /data-linea="tri"/.test(tTri) && /class="ini-linea linea-tri/.test(tTri), 'la segunda tarjeta es la Triangular (envolvente linea-tri)');
ok(/hex-legible/.test(tHex || ''), 'la tarjeta Hexagonal lleva .hex-legible');
ok(lineas.indexOf('data-linea="hex"') < lineas.indexOf('data-linea="tri"'), 'la Hexagonal va primero en el DOM (izquierda en escritorio, arriba en el teléfono)');
ok(!/lg:order-|order-first|order-last|flex-col-reverse|flex-row-reverse/.test(lineas), 'sin clases que inviertan el orden visual');
const rejilla = (lineas.match(/<div class="grid[^"]*"[^>]*>\s*<article class="ini-linea/) || [''])[0];
ok(/grid-cols-1 lg:grid-cols-2/.test(rejilla) && /items-stretch/.test(rejilla), 'las dos tarjetas están en la misma rejilla (1 columna en el teléfono, 2 en escritorio) con items-stretch');
const SOLO_LINEA = /^(linea-hex|linea-tri|hex-legible|nav-hex|nav-tri)$/;
const esqueleto = t => t.replace(/<(\/?)([a-z0-9]+)([^>]*)>/gi, (m, c, tag, attrs) => {
  const cl = ((attrs.match(/class="([^"]*)"/) || [, ''])[1]).split(/\s+/).filter(x => x && !SOLO_LINEA.test(x)).join('.');
  return `<${c}${tag}${cl ? '.' + cl : ''}>`;
}).replace(/>[^<]+</g, '><').replace(/\s+/g, '');
ok(!!tHex && !!tTri && esqueleto(tHex) === esqueleto(tTri), 'las dos tarjetas tienen la misma estructura (mismas partes, en el mismo orden y con las mismas clases)');
const partes = t => ({
  nombre: texto((t.match(/<h3[\s\S]*?<\/h3>/) || [''])[0]),
  ejemplos: [...t.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(m => texto(m[1])),
  encuentra: texto((t.match(/<strong>([\s\S]*?)<\/strong>/) || [, ''])[1]),
  para: texto((t.match(/<p class="ini-para">([\s\S]*?)<\/p>/) || [, ''])[1]),
  botones: (t.match(/<a /g) || []).length,
  href: (t.match(/<a href="([^"]*)"/) || [, ''])[1],
});
const ph = partes(tHex || ''), pt = partes(tTri || '');
ok(ph.nombre === 'Línea Hexagonal' && pt.nombre === 'Línea Triangular', 'cada tarjeta lleva el nombre de su línea');
ok(/nav-forma nav-hex/.test(tHex) && /nav-forma nav-tri/.test(tTri), 'cada tarjeta lleva la forma de su línea (⬡ y ▲)');
ok(ph.ejemplos.length === 3 && pt.ejemplos.length === 3, 'tres ejemplos de clientes por tarjeta');
ok(ph.encuentra === 'Servicios a la medida' && pt.encuentra === 'Productos de precio fijo', 'qué encuentra: servicios a la medida / productos de precio fijo');
ok(ph.botones === 1 && pt.botones === 1, 'un solo botón por tarjeta');
ok(ph.href === '/servicios' && pt.href === '/productos', 'Hexagonal → /servicios, Triangular → /productos');
ok(!/[.!?]\s+\S/.test(ph.para) && !/[.!?]\s+\S/.test(pt.para), '«para quién» es de una sola línea (una frase)');
ok(/Aquí encuentra/.test(texto(tHex)) && !pal('tú|tus|tu|encuentras').test(texto(tHex)), 'la tarjeta Hexagonal habla de «usted» (sin formas de «tú»)');
ok(/Aquí encuentras/.test(texto(tTri)) && pal('tú').test(texto(tTri)) && !pal('usted').test(texto(tTri)), 'la tarjeta Triangular habla de «tú»');
const ayuda = '¿No sabe cuál? Menos de 20 personas: Triangular. Más de 20, varias sedes o junta directiva: Hexagonal.';
ok(texto(lineas).includes(ayuda), 'la ayuda de tamaño está, tal cual');
ok(lineas.indexOf(ayuda) > lineas.lastIndexOf('</article>'), 'la ayuda va debajo de las dos tarjetas');

// precio «desde»: el mensual más bajo de cada línea, calculado del catálogo
function minimoMensual(linea) {
  let min = Infinity, quien = [];
  for (const it of cat.items.filter(i => i.linea === linea)) {
    const p = it.precio || {};
    let m = null;
    if (p.modo === 'software') m = deps.sw.desde(linea);
    else if (p.periodo === 'al mes') m = montosNumericos(it, deps)[0];
    if (m === null || m === undefined || !isFinite(m)) continue;
    if (m < min) { min = m; quien = [it]; } else if (m === min) quien.push(it);
  }
  return { monto: min, items: quien };
}
for (const [linea, t] of [['hex', tHex || ''], ['tri', tTri || '']]) {
  const esperado = minimoMensual(linea);
  const fmt = deps.sw.fmtPrecio(linea, esperado.monto);
  const monto = texto((t.match(/<strong class="ini-monto"[^>]*>([\s\S]*?)<\/strong>/) || [, ''])[1]).replace(/\s+/g, '');
  ok(monto === `${fmt}/mes`, `${linea}: el precio «desde» es el mensual más bajo del catálogo (${fmt}/mes; hay «${monto}»)`);
  const nota = texto((t.match(/<span class="ini-precio-nota">([\s\S]*?)<\/span>/) || [, ''])[1]);
  ok(esperado.items.length > 0 && esperado.items.every(i => nota.includes(i.nombre)), `${linea}: la nota nombra lo que cuesta ese precio (${esperado.items.map(i => i.nombre).join(' y ')}; hay «${nota}»)`);
  ok(linea === 'hex' ? Number.isInteger(esperado.monto) && esperado.monto % 10 === 0 : /,99$/.test(fmt), `${linea}: Hexagonal en dólares redondos, Triangular en ,99 (${fmt})`);
  ok(/class="ini-desde">desde</.test(t), `${linea}: el precio dice «desde»`);
}

// ------------------------------------------------------------ 3 y 4. destacados con tarjetas del catálogo
const marcadores = [...main.matchAll(/<!-- tarjetas:inicio\b([^>]*?)-->/g)].map(m => leerAtributos(m[1]));
ok(marcadores.length === 3, `tres marcadores de tarjetas (hay ${marcadores.length})`);
const esperadosMarcador = [
  { sec: 'servicios-destacados', ids: 'diagnostico,asesor-financiero,formacion-ejecutiva,tablero-gerencial', cols: '4' },
  { sec: 'productos-destacados', ids: 'club-hex,condominio-hex,gym-hex', cols: '3' },
  { sec: 'productos-destacados', ids: 'plan-arranque,caja-clara,presencia', cols: '3' },
];
esperadosMarcador.forEach((e, i) => {
  const a = marcadores[i] || {};
  ok(a.ids === e.ids && a.cols === e.cols, `marcador ${i + 1}: ids=${e.ids} cols=${e.cols}`);
  ok(sec(e.sec).includes(`tarjetas:inicio ids="${e.ids}"`), `marcador ${i + 1} dentro de #${e.sec}`);
});
ok(reemplazarMarcadores(html, cat, 'index.html') === html, 'las tarjetas del inicio están al día con el catálogo (corra node scripts/build-html.js)');
const tarjetas = [...main.matchAll(/<article class="tarjeta [\s\S]*?<\/article>/g)].map(m => m[0]);
ok(tarjetas.length === 10, `10 tarjetas destacadas (4 servicios + 3 + 3 productos; hay ${tarjetas.length})`);
const servicios = sec('servicios-destacados'), productos = sec('productos-destacados');
ok(/<h2[^>]*>Servicios destacados<\/h2>/.test(servicios) && /<h2[^>]*>Productos destacados<\/h2>/.test(productos), 'títulos «Servicios destacados» y «Productos destacados»');
ok(/<a href="\/servicios"[^>]*>Ver todos los servicios →<\/a>/.test(servicios), 'enlace «Ver todos los servicios →» a /servicios');
ok(/<a href="\/productos"[^>]*>Ver todos los productos →<\/a>/.test(productos), 'enlace «Ver todos los productos →» a /productos');
const filas = [...productos.matchAll(/<h3 class="lst-bloque-cab">([\s\S]*?)<\/h3>/g)].map(m => m[1]);
ok(filas.length === 2 && /nav-hex/.test(filas[0]) && /Empresas e instituciones/.test(filas[0]) && /nav-tri/.test(filas[1]) && /Negocios pequeños/.test(filas[1]), 'dos filas de productos con su cabecera pequeña (forma + leyenda), la Hexagonal primero');
ok(!/L[ií]nea (Hexagonal|Triangular)/.test(texto(servicios) + texto(productos)), 'los destacados no usan la palabra «Línea»');
ok(!/wa\.me/.test(servicios + productos), 'las tarjetas destacadas no llevan WhatsApp (un solo enlace «Ver detalle»)');

// ------------------------------------------------------------ 5. para dueños de empresa
const duenos = sec('duenos');
ok(/linea-hex/.test(duenos) && /hex-legible/.test(duenos), '«Para dueños de empresa» es Hexagonal (.linea-hex y .hex-legible)');
ok(/<h2[^>]*>Vea en qué se va la plata de su empresa<\/h2>/.test(duenos), 'título «Vea en qué se va la plata de su empresa»');
const palabrasDuenos = palabras(texto(duenos));
ok(palabrasDuenos <= 70, `«Para dueños de empresa» tiene 70 palabras o menos (tiene ${palabrasDuenos})`);
ok(/href="\/ejecutivos"[^>]*data-evento="portada_duenos_ejecutivos"[^>]*>Conocer más</.test(duenos), '«Conocer más» → /ejecutivos (portada_duenos_ejecutivos)');
ok(/href="\/contacto#agenda"[^>]*data-evento="diagnostico_gratis"[^>]*>Consulta gratis de 20 min</.test(duenos), '«Consulta gratis de 20 min» → /contacto#agenda (diagnostico_gratis)');
ok((duenos.match(/<a /g) || []).length === 2 && !/<ul|<li/.test(duenos), 'dos botones y nada más');
ok(!pal('tú|tus|tu|puedes|quieres').test(texto(duenos)), '«Para dueños de empresa» habla de «usted»');

// ------------------------------------------------------------ 6. el resto, en orden
ok(/<h2[^>]*>Cómo trabajamos<\/h2>/.test(sec('como-trabajamos')) && (sec('como-trabajamos').match(/<li\b/g) || []).length === 3, 'Cómo trabajamos: tres pasos');
ok(/<h2[^>]*>Por qué elegir a F&amp;V<\/h2>/.test(sec('diferencial')) && (sec('diferencial').match(/<h3>/g) || []).length === 3, 'Por qué F&V: tres razones');
const testimonios = sec('testimonios');
ok(/class="[^"]*\bhidden\b[^"]*"/.test(testimonios.match(/<section[^>]*>/)[0]) && /data-publicado-wrap/.test(testimonios), 'testimonios: la sección sigue oculta (hidden + data-publicado-wrap)');
const figuras = testimonios.match(/<figure[^>]*>/g) || [];
ok(figuras.length === 3 && figuras.every(f => /data-publicado="false"/.test(f) && /display:none/.test(f)), 'testimonios: sus figuras siguen con data-publicado="false" y ocultas');
const fechas = sec('proximas-fechas');
ok(/data-ev="taller\.fecha"/.test(fechas) && /data-ev="curso\.fechas"/.test(fechas) && /data-ev-wa="taller"/.test(fechas), 'próximas fechas conserva el marcado data-ev de assets/eventos.js');
ok(/data-ev-show="eventos:sin-fechas"/.test(fechas) && texto(fechas).includes('Próximas fechas: escríbenos por WhatsApp'), 'próximas fechas: mensaje «Próximas fechas: escríbenos por WhatsApp» cuando no hay fechas futuras');
ok(/linea-tri/.test(fechas) && !pal('usted').test(texto(fechas)), 'próximas fechas es de productos Triangulares («tú»)');
ok(/<script defer src="\/assets\/eventos\.js">/.test(html), 'carga assets/eventos.js');

// ------------------------------------------------------------ 6. preguntas frecuentes
const faq = sec('faq');
const detalles = [...faq.matchAll(/<details\b[\s\S]*?<\/details>/g)].map(m => m[0]);
ok(detalles.length === 5, `exactamente 5 preguntas frecuentes (hay ${detalles.length})`);
const preguntas = detalles.map(d => texto((d.match(/<summary[\s\S]*?<\/summary>/) || [''])[0]));
const respuestas = detalles.map(d => texto((d.match(/<\/summary>\s*<p[^>]*>([\s\S]*?)<\/p>/) || [, ''])[1]));
ok(preguntas.includes('¿Cómo pago?') && preguntas.includes('¿Cuál es la diferencia entre servicios y productos?') && preguntas.includes('¿Qué línea es para mí?'), 'incluye «¿Cómo pago?», «¿Cuál es la diferencia entre servicios y productos?» y «¿Qué línea es para mí?»');
const rDif = respuestas[preguntas.indexOf('¿Cuál es la diferencia entre servicios y productos?')] || '';
ok(rDif.includes('Servicio: el equipo de F&V trabaja con usted, en su empresa o con su equipo.') && rDif.includes('Producto: listo para usar, con el mismo precio y la misma entrega para todos.'), 'la diferencia usa las definiciones oficiales');
const rPago = respuestas[preguntas.indexOf('¿Cómo pago?')] || '';
ok(/bolívares a la tasa BCV del día/.test(rPago) && /dólares/.test(rPago) && /Pago Móvil/.test(rPago) && /USDT/.test(rPago) && /30 % por pagar 12 meses por adelantado/.test(rPago) && /50 %/.test(rPago), '«¿Cómo pago?» da las formas de pago, el 30 % por 12 meses y la reserva del 50 %');
// Descuentos en las preguntas generales: el 30 % por 12 meses por adelantado y, como máximo, la frase «10 % de descuento en su primer pago» (recomendado). El 20 % y cualquier otro quedan prohibidos.
const descuentos = [...respuestas.join(' ').matchAll(/(\d+) ?% (?:de )?(?:descuento|menos)(?: en su primer pago)?/gi)];
ok(descuentos.every(m => m[1] === '30' || m[0] === '10 % de descuento en su primer pago'), 'solo se publican el descuento de 30 % y la frase «10 % de descuento en su primer pago» (hay: ' + descuentos.map(m => m[0]).join(' | ') + ')');
ok(!/20 ?% (?:de )?(?:descuento|menos)|descuento (?:de|del) 20/i.test(respuestas.join(' ')), 'sin el 20 % de descuento');
ok(!/refiere y gana|único descuento|solo descuento/i.test(respuestas.join(' ')), 'las respuestas no dicen «refiere y gana» ni «único descuento»');
const rLinea = respuestas[preguntas.indexOf('¿Qué línea es para mí?')] || '';
ok(rLinea.includes('Menos de 20 personas: Triangular. Más de 20, varias sedes o junta directiva: Hexagonal.'), '«¿Qué línea es para mí?» da la regla del tamaño');
ok(!pal('tú|tus|tu|puedes|pagas').test(respuestas.join(' ')), 'las respuestas generales no mezclan el «tú»');

const bloquesLd = [...html.matchAll(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/g)].map(m => m[1]);
ok(bloquesLd.length === 1, 'un bloque JSON-LD');
let ld = null;
try { ld = JSON.parse(bloquesLd[0]); ok(true, 'JSON-LD válido'); } catch (e) { ok(false, 'el JSON-LD parsea con JSON.parse: ' + e.message); }
if (ld) {
  const g = ld['@graph'];
  const tipos = g.map(x => x['@type']);
  ok(tipos.includes('Organization') && tipos.includes('ProfessionalService') && tipos.includes('FAQPage'), 'JSON-LD: Organization, ProfessionalService y FAQPage');
  const f = g.find(x => x['@type'] === 'FAQPage');
  ok(f.mainEntity.length === 5, 'JSON-LD: FAQPage con 5 preguntas');
  ok(f.mainEntity.every((q, i) => q.name === preguntas[i] && q.acceptedAnswer.text === respuestas[i]), 'JSON-LD: las 5 preguntas y respuestas son EXACTAMENTE las de la página, en el mismo orden');
  const org = g.find(x => x['@type'] === 'Organization'), neg = g.find(x => x['@type'] === 'ProfessionalService');
  ok(org.email === 'contacto@fvaigroup.com' && org.telephone === '+58-424-412-5386' && neg.address.addressLocality === 'Valencia' && neg.openingHoursSpecification[0].opens === '09:00' && neg.openingHoursSpecification[0].closes === '17:00', 'JSON-LD: datos de contacto, dirección y horario');
  ok(!/L[ií]nea (Hexagonal|Triangular)|Express/.test(JSON.stringify(org)), 'JSON-LD: la descripción de la organización no nombra las líneas');
  // productos: precios EXACTOS del catálogo
  const prods = g.filter(x => x['@type'] === 'Product');
  const destacados = ['club-hex', 'condominio-hex', 'gym-hex', 'plan-arranque', 'caja-clara', 'presencia'];
  ok(prods.length === destacados.length, `JSON-LD: un Product por producto destacado (${destacados.length})`);
  destacados.forEach((id, i) => {
    const it = cat.items.find(x => x.id === id), p = prods[i] || {};
    const monto = montosNumericos(it, deps)[0];
    const esperado = it.linea === 'hex' ? String(monto) : monto.toFixed(2);
    const o = p.offers || {};
    const dado = o.price !== undefined ? o.price : o.lowPrice;
    ok(p.name === it.nombre && p['@id'].includes(it.detalle.url), `JSON-LD ${id}: nombre y enlace del catálogo`);
    ok(dado === esperado && o.priceCurrency === 'USD', `JSON-LD ${id}: precio exacto del catálogo (${esperado}; hay ${dado})`);
    ok(it.precio.modo === 'fijo' ? o['@type'] === 'Offer' : o['@type'] === 'AggregateOffer', `JSON-LD ${id}: ${it.precio.modo === 'fijo' ? 'Offer (precio fijo)' : 'AggregateOffer (precio «desde»)'}`);
  });
}

// ------------------------------------------------------------ lo que ya no debe estar
const visibleTodo = texto(html);
ok(!/Asesor F&V|Sesión Clara|Express|datos en vivo/i.test(visibleTodo), 'no aparecen «Asesor F&V», «Sesión Clara», «Express» ni «datos en vivo»');
ok(!/live-status|abrir-test|id="test"|tilt-card|Módulo Financiero|Sincronizando/.test(html), 'no queda el cuestionario ni los datos simulados (ni su JS)');
['que-hacemos', 'software', 'pedidos', 'como-pagas'].forEach(id => ok(!new RegExp(`id="${id}"`).test(html), `ya no existe la sección #${id}`));
ok(!/bcv\.js/.test(html), 'ya no carga assets/bcv.js (el inicio no muestra bolívares)');
const cabecera = (html.match(/<!-- header:inicio[^>]*-->[\s\S]*?<!-- header:fin -->/) || [''])[0];
const pie = (html.match(/<!-- footer:inicio\s*-->[\s\S]*?<!-- footer:fin -->/) || [''])[0];
ok(cabecera.length > 1000 && pie.length > 1000, 'encabezado y pie presentes');
ok(!/L[ií]nea (Hexagonal|Triangular)/.test(texto(cabecera)) && !/L[ií]nea (Hexagonal|Triangular)/.test(texto(pie)), '«Línea Hexagonal/Triangular» no aparece en el encabezado ni en el pie');
ok(!/L[ií]nea (Hexagonal|Triangular)/.test(texto(main.replace(lineas, '').replace(faq, ''))), 'el nombre de las líneas solo aparece en la sección de las dos líneas y en la pregunta «¿Qué línea es para mí?»');

// ------------------------------------------------------------ encabezados en orden y logos intactos
const encabezados = [...main.matchAll(/<h([1-6])\b/g)].map(m => +m[1]);
let salto = false;
encabezados.forEach((nv, i) => { if (i === 0 ? nv !== 1 : nv > encabezados[i - 1] + 1) salto = true; });
ok(!salto, 'los encabezados bajan de a un nivel (h1 → h2 → h3 → h4)');
const logos = fs.readdirSync(path.join(RAIZ, 'assets/clientes')).length;
ok(logos > 0 && /assets\/clientes\/cliente-logo-/.test(html), 'los logos de clientes siguen como estaban (assets/clientes/ no se toca)');

// palabras por sección (informativo)
console.log('palabras por sección: ' + secciones.map(s => `${s.id} ${palabras(texto(s.html))}`).join(' · '));
console.log(`inicio: ${n} comprobaciones${process.exitCode ? ' (CON FALLAS)' : ' correctas'}`);
