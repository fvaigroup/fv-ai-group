// Pruebas de la página de inicio (index.html): node tests/inicio.test.js
// Desde el 29 oct 2026 el inicio solo tiene el hero (con su franja de logos de clientes), la barra y el pie:
// - portada: h1 exacto, subtítulo, descripción y un solo botón con su destino; hexágono giratorio con el logo al centro
// - ninguna otra sección, y el JSON-LD solo con Organization y ProfessionalService
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
ok(h1 === 'Aquí empieza el futuro de su empresa', `h1 exacto (hay «${h1}»)`);
ok(portada.includes('<span class="ini-h1-grad">el futuro de su empresa</span>') && portada.includes('<span class="ini-h1-l1">Aquí empieza</span>'), '«Aquí empieza» en blanco y «el futuro de su empresa» con el degradado animado cian ↔ naranja');
const ptxt = texto(portada);
ok(ptxt.includes('Bienvenido al círculo de las empresas que deciden con datos'), 'subtítulo');
ok(ptxt.includes('El socio que usa la IA para analizar su negocio de punta a punta, anticipar lo que viene y ajustar el rumbo a tiempo, con decisiones respaldadas por sus propios datos, para que su empresa escale 10x con seguridad, control y orden'), 'descripción');
ok(!/Bienvenido al futuro|Eligió bien|Agende su consulta|Conozca cómo trabajamos|30 minutos, sin costo|No te vendemos herramientas sueltas/.test(ptxt), 'la portada ya no trae los textos anteriores');
ok(!/F&amp;V AI Group · Valencia|ini-kicker|ini-apoyo|ini-nota/.test(portada), 'sin pastilla, sin texto de apoyo y sin la nota de los 30 minutos');
const cssTw = fs.readFileSync(path.join(RAIZ, 'src/tailwind.css'), 'utf8');
const reglaHero = (cssTw.match(/\.ini-portada \.ini-hero \{[^}]*\}/) || [''])[0];
ok(reglaHero.includes('min-height: calc(100svh - 4.75rem)') && reglaHero.includes('justify-content: center') && portada.indexOf('class="ini-hero"') < portada.indexOf('ini-logos-titulo'), 'el hero ocupa la pantalla visible, con el contenido centrado, y la franja de logos queda debajo');
ok(/<img src="assets\/logo-hex-hex\.png" alt="" aria-hidden="true"[^>]*class="ini-hexgiro">/.test(portada) && fs.existsSync(path.join(RAIZ, 'assets/logo-hex-hex.png')), 'hexágono decorativo: alt vacío, aria-hidden y archivo existente');
ok(/\.ini-hexgiro \{[^}]*animation: ini-giro 60s linear infinite/.test(cssTw) && cssTw.includes('prefers-reduced-motion: reduce) { .ini-portada .ini-hexgiro { animation: none'), 'el hexágono gira 60 s lineal y se detiene con prefers-reduced-motion');
ok(/\.ini-hexgiro \{[^}]*z-index: 0/.test(cssTw) && cssTw.includes('.ini-portada #hex-canvas { z-index: 1; }'), 'capas: los puntos (z 1) quedan sobre el hexágono (z 0)');
ok(/<img src="assets\/logo-mark-hex\.png" alt="" aria-hidden="true"[^>]*class="ini-hexmarca">/.test(portada) && fs.existsSync(path.join(RAIZ, 'assets/logo-mark-hex.png')) && /\.ini-hexmarca \{[^}]*top: 54%[^}]*translate\(-50%, -50%\)/.test(cssTw) && !/\.ini-hexmarca \{[^}]*animation/.test(cssTw), 'logo-mark-hex.png en el centro del hexágono: decorativo, fijo (no gira) y con el mismo centro');
ok(/\.ini-hexgiro \{[^}]*width: min\(980px, 130vw\)[^}]*top: 54%/.test(cssTw) || /\.ini-hexgiro \{[^}]*top: 54%[^}]*width: min\(980px, 130vw\)/.test(cssTw), 'hexágono: top 54 % y min(980px, 130vw)');
const reglaH1 = (cssTw.match(/\.ini-portada \.ini-h1 \{[^}]*\}/) || [''])[0];
ok(reglaH1.includes('clamp(26px, 7.08vw, 84px)') && reglaH1.includes("font-family: 'Anton'") && reglaH1.includes('text-transform: uppercase') && reglaH1.includes('font-weight: 400') && reglaH1.includes('max-width: 1100px'), 'título: Anton en mayúsculas, 20 % más grande que antes (clamp 26 px, 7,08 vw, 84 px: el máximo era 70 px)');
ok(html.includes("font-family:'Anton'") && html.includes('https://fonts.gstatic.com/s/anton/v27/1Ptgg87LROyAm3Kz-C8.woff2'), 'la fuente Anton está declarada y precargada en el inicio');
ok(/\.ini-portada \.hero-copy \{[^}]*gap: 28px/.test(cssTw), '28 px de separación entre los elementos del hero');
const botones = [...portada.matchAll(/<a [^>]*class="[^"]*\bini-boton\b[^"]*"[^>]*>[\s\S]*?<\/a>/g)].map(m => m[0]);
ok(botones.length === 1, `un solo botón en la portada (hay ${botones.length})`);
const bt = i => texto(botones[i] || '');
const href = i => ((botones[i] || '').match(/href="([^"]*)"/) || [, ''])[1];
ok(bt(0) === 'Empezar' && href(0) === '/contacto#agenda', 'botón: «Empezar» → /contacto#agenda');
ok(/ini-boton-pill/.test(botones[0]) && /btn-primary/.test(botones[0]) && /data-evento="portada_como_trabajamos"/.test(botones[0]), 'el botón es naranja (btn-primary), en forma de pastilla y con data-evento');
ok(!/L[ií]nea (Hexagonal|Triangular)/.test(texto(portada)), 'la portada no nombra las líneas');
ok(portada.includes('ini-h1-grad') && /\.ini-h1-grad \{[^}]*linear-gradient\(90deg, #00FFFF, #FF8C00, #00FFFF\)[^}]*animation: ini-grad/.test(cssTw) && cssTw.includes('prefers-reduced-motion: reduce) { .ini-portada .ini-h1-grad { animation: none'), 'la portada usa la marca madre (degradado cian ↔ naranja en movimiento; quieto con prefers-reduced-motion)');

// ------------------------------------------------------------ solo el hero y la franja de logos
ok(secciones.length === 1 && secciones[0].id === 'inicio', `el inicio tiene una sola sección, el hero (hay: ${secciones.map(s => s.id).join(', ')})`);
['camino', 'venezuela', 'conversacion', 'lineas', 'servicios-destacados', 'productos-destacados', 'duenos', 'como-trabajamos', 'diferencial', 'testimonios', 'proximas-fechas', 'faq', 'cta-final'].forEach(id => ok(!new RegExp(`id="${id}"`).test(html), `ya no existe la sección #${id}`));
ok(/ini-logos-titulo/.test(portada) && /assets\/clientes\/cliente-logo-/.test(portada), 'la franja de logos de clientes sigue dentro del hero');

// ------------------------------------------------------------ JSON-LD
const bloquesLd = [...html.matchAll(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/g)].map(m => m[1]);
ok(bloquesLd.length === 1, 'un bloque JSON-LD');
let ld = null;
try { ld = JSON.parse(bloquesLd[0]); ok(true, 'JSON-LD válido'); } catch (e) { ok(false, 'el JSON-LD parsea con JSON.parse: ' + e.message); }
if (ld) {
  const g = ld['@graph'];
  const tipos = g.map(x => x['@type']);
  ok(JSON.stringify(tipos) === JSON.stringify(['Organization', 'ProfessionalService']), `JSON-LD: solo Organization y ProfessionalService (hay ${tipos.join(', ')}); sin Product ni FAQPage porque no hay contenido visible que los respalde`);
  const org = g.find(x => x['@type'] === 'Organization'), neg = g.find(x => x['@type'] === 'ProfessionalService');
  ok(org.email === 'contacto@fvaigroup.com' && org.telephone === '+58-424-412-5386' && neg.address.addressLocality === 'Valencia' && neg.openingHoursSpecification[0].opens === '09:00' && neg.openingHoursSpecification[0].closes === '17:00', 'JSON-LD: datos de contacto, dirección y horario');
  ok(!/L[ií]nea (Hexagonal|Triangular)|Express/.test(JSON.stringify(org)), 'JSON-LD: la descripción de la organización no nombra las líneas');
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
