// Pruebas de la página de inicio (index.html): node tests/inicio.test.js
// Inicio rediseñado (30 oct 2026): hero, franja de logos, las dos líneas (figuras SVG interactivas), diagnóstico de 60 segundos,
// cómo trabajamos, del caos al tablero, franja Delta App, preguntas frecuentes y cierre.
//  - CERO precios en el texto visible: ni «$», ni «USD», ni «Bs.», ni «%», ni «desde»; tampoco «Express», «10x» ni «garantizado»
//  - todo en «usted»; sin métodos de pago ni productos que no existen todavía
//  - cada botón de WhatsApp lleva su mensaje prellenado y su data-evento
//  - JSON-LD: Organization, ProfessionalService y FAQPage (mismas respuestas que la página)
//  - «Línea Hexagonal/Triangular» no está en el encabezado ni en el pie
const fs = require('fs');
const path = require('path');
const B = require('../scripts/build-html.js');

const RAIZ = B.RAIZ;
let n = 0;
function ok(c, m) { n++; if (!c) { console.error('✗ ' + m); process.exitCode = 1; } }
const unix = s => s.replace(/\r\n/g, '\n');
const html = unix(fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8'));
const cssTw = fs.readFileSync(path.join(RAIZ, 'src/tailwind.css'), 'utf8');
const js = fs.readFileSync(path.join(RAIZ, 'assets/inicio.js'), 'utf8');

const decodificar = s => s.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
const texto = frag => decodificar(frag.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
// La palabra completa (\b) de JavaScript no reconoce las vocales con tilde: esta versión sí (para «tú», «según», etc.)
const LETRA = '[A-Za-z0-9_áéíóúñÁÉÍÓÚÑ]';
const pal = w => new RegExp('(?<!' + LETRA + ')(?:' + w + ')(?!' + LETRA + ')', 'i');

const main = html.slice(html.indexOf('<main'), html.indexOf('</main>') + 7);
const secciones = [...main.matchAll(/<section\b[^>]*\bid="([^"]+)"[^>]*>/g)].map(m => ({ id: m[1], ini: m.index }));
secciones.forEach(s => { s.fin = main.indexOf('</section>', s.ini) + 10; s.html = main.slice(s.ini, s.fin); });
const sec = id => (secciones.find(s => s.id === id) || { html: '' }).html;

// ------------------------------------------------------------ cabecera de la página
const titulo = decodificar((html.match(/<title>([^<]*)<\/title>/) || [, ''])[1]);
ok(/F&V AI Group/.test(titulo), `título con la marca (${titulo})`);
const descripcion = decodificar((html.match(/<meta name="description" content="([^"]*)"/) || [, ''])[1]);
ok(descripcion.length > 80 && descripcion.length <= 200, `descripción entre 80 y 200 caracteres (${descripcion.length})`);
ok(html.includes('<link rel="canonical" href="https://www.fvaigroup.com/">'), 'canónica del inicio');
ok(html.includes(`<meta property="og:title" content="${titulo.replace(/&/g, '&amp;')}">`) && html.includes(`<meta name="twitter:title" content="${titulo.replace(/&/g, '&amp;')}">`), 'og:title y twitter:title coherentes con el título');
ok(/<!-- header:inicio activo="inicio"/.test(html) && /<!-- footer:inicio/.test(html), 'conserva los marcadores de encabezado y pie');

// ------------------------------------------------------------ orden de las secciones
const ORDEN = ['inicio', 'lineas', 'diagnostico', 'como-trabajamos', 'caos-tablero', 'delta-app', 'faq', 'cierre'];
ok(JSON.stringify(secciones.map(s => s.id)) === JSON.stringify(ORDEN), `secciones en orden: ${ORDEN.join(' → ')} (hay: ${secciones.map(s => s.id).join(' → ')})`);
['camino', 'venezuela', 'conversacion', 'servicios-destacados', 'productos-destacados', 'duenos', 'diferencial', 'testimonios', 'proximas-fechas', 'cta-final'].forEach(id => ok(!new RegExp(`id="${id}"`).test(html), `no existe la sección vieja #${id}`));

// ------------------------------------------------------------ 1. hero
const portada = sec('inicio');
ok((html.match(/<h1\b/g) || []).length === 1, 'un solo h1');
const h1 = texto((portada.match(/<h1[\s\S]*?<\/h1>/) || [''])[0]);
ok(h1 === 'Estrategia con inteligencia artificial para empresas', `h1 exacto (hay «${h1}»)`);
ok(/<p class="ini-antetitulo">INTELIGENCIA DE NEGOCIOS<\/p>/.test(portada), 'antetítulo «INTELIGENCIA DE NEGOCIOS»');
ok(texto(portada).includes('Aquí empieza el futuro de su empresa, con decisiones de primer nivel.'), 'subtítulo');
ok(!/escale|10x|Bienvenido|Empezar|No te vendemos|Valencia, Venezuela/.test(texto(portada)), 'el hero ya no trae el párrafo largo, «Empezar», la pastilla ni la nota de cupos');
const botones = [...portada.matchAll(/<a [^>]*class="[^"]*\bini-boton\b[^"]*"[^>]*>[\s\S]*?<\/a>/g)].map(m => m[0]);
ok(botones.length === 1, `un solo botón en el hero (hay ${botones.length})`);
ok(texto(botones[0]) === 'Cómo trabajamos' && /href="#lineas"/.test(botones[0]) && /data-evento="portada_como_trabajamos"/.test(botones[0]), 'botón «Cómo trabajamos» → #lineas con data-evento');
ok(/<img src="assets\/logo-hex-hex\.png" alt="" aria-hidden="true"[^>]*class="ini-hexgiro">/.test(portada) && fs.existsSync(path.join(RAIZ, 'assets/logo-hex-hex.png')), 'hexágono decorativo: alt vacío, aria-hidden y archivo existente');
ok(/\.ini-hexgiro \{[^}]*animation: ini-giro 60s linear infinite/.test(cssTw) && cssTw.includes('prefers-reduced-motion: reduce) { .ini-portada .ini-hexgiro { animation: none'), 'el hexágono gira 60 s lineal y se detiene con prefers-reduced-motion');
ok(/<img src="assets\/logo-mark-hex\.png" alt="" aria-hidden="true"[^>]*class="ini-hexmarca">/.test(portada) && fs.existsSync(path.join(RAIZ, 'assets/logo-mark-hex.png')) && /\.ini-hexmarca \{[^}]*top: 54%[^}]*translate\(-50%, -54%\)/.test(cssTw) && /\.ini-hexmarca \{[^}]*animation: ini-levita/.test(cssTw) && !/\.ini-hexmarca \{[^}]*rotate/.test(cssTw) && cssTw.includes('prefers-reduced-motion: reduce) { .ini-portada .ini-hexmarca { animation: none'), 'luciérnaga en el centro del hexágono: decorativa, no gira, levita y se detiene con prefers-reduced-motion');
ok(/@media \(max-width: 1023px\) \{ \.ini-portada \.ini-hexgiro \{[^}]*opacity: \.26/.test(cssTw), 'en el celular el hexágono baja y se aclara para que el texto se lea');
const reglaH1 = (cssTw.match(/\.ini-portada \.ini-h1 \{[^}]*\}/) || [''])[0];
ok(reglaH1.includes("font-family: 'Anton'") && reglaH1.includes('text-transform: uppercase') && reglaH1.includes('font-weight: 400'), 'título en Anton y mayúsculas');
ok(html.includes("font-family:'Anton'") && html.includes('https://fonts.gstatic.com/s/anton/v27/1Ptgg87LROyAm3Kz-C8.woff2'), 'la fuente Anton está declarada y precargada en el inicio');
ok(/\.ini-h1-grad \{[^}]*linear-gradient\(90deg, #00FFFF, #FF8C00, #00FFFF\)[^}]*animation: ini-grad/.test(cssTw) && cssTw.includes('prefers-reduced-motion: reduce) { .ini-portada .ini-h1-grad { animation: none'), 'degradado cian ↔ naranja en movimiento (quieto con prefers-reduced-motion)');
const reglaHero = (cssTw.match(/\.ini-portada \.ini-hero \{[^}]*\}/) || [''])[0];
ok(reglaHero.includes('min-height: calc(100svh - 4.75rem)') && portada.indexOf('class="ini-hero"') < portada.indexOf('ini-logos-titulo'), 'el hero ocupa la pantalla visible y la franja de logos queda debajo del primer pantallazo');

// ------------------------------------------------------------ 2. franja de logos
ok(/<p class="ini-logos-titulo[^"]*">Marcas con las que hemos trabajado<\/p>/.test(portada) && !/Empresas que confían/.test(html), 'franja de logos: «Marcas con las que hemos trabajado»');
ok(fs.readdirSync(path.join(RAIZ, 'assets/clientes')).length > 0 && /assets\/clientes\/cliente-logo-/.test(portada), 'los logos de clientes siguen como estaban (assets/clientes/ no se toca)');

// ------------------------------------------------------------ 3. las dos líneas
const lineas = sec('lineas');
const figs = [...lineas.matchAll(/<article id="fig-(hex|tri)"[\s\S]*?<\/article>/g)].map(m => ({ k: m[1], html: m[0] }));
ok(figs.length === 2 && figs[0].k === 'hex' && figs[1].k === 'tri', 'dos figuras, la Hexagonal primero');
ok(texto(lineas).includes('DOS LÍNEAS · UNA FORMA DE TRABAJAR') && /Elija el camino que le corresponde/.test(lineas) && texto(lineas).includes('Más de 20 personas, varias sedes o junta directiva: Línea Hexagonal. Si usted decide solo en su negocio: Línea Triangular.'), 'antetítulo, título y ayuda de la sección');
const ESPERADOS = { hex: ['Diagnóstico financiero', 'Orden financiero', 'Asesor financiero con IA', 'Formación en su sede', 'Delta App', 'A la medida'], tri: ['Taller de 3 horas', 'Plan Arranque', 'Curso Finanzas con IA'] };
figs.forEach(f => {
  const lados = [...f.html.matchAll(/<g class="ini-lado-svg" role="button" tabindex="0" aria-pressed="false" aria-controls="tarj-\w+" aria-label="([^"]+)" data-lado="(\d)">/g)].map(m => m[1]);
  ok(JSON.stringify(lados) === JSON.stringify(ESPERADOS[f.k]), `${f.k}: lados de la figura, en orden (${lados.join(' | ')})`);
  const lista = [...f.html.matchAll(/<button type="button" class="ini-lado-btn"[^>]*><span class="ini-lado-n" aria-hidden="true">\d<\/span><span>([^<]+)<\/span>/g)].map(m => decodificar(m[1]));
  ok(JSON.stringify(lista) === JSON.stringify(ESPERADOS[f.k]), `${f.k}: la lista de respaldo (sin JS y lectores de pantalla) trae los mismos lados`);
  ok(/<linearGradient id="grad-\w+" gradientUnits="userSpaceOnUse" x1="\d+" y1="\d+" x2="\d+" y2="\d+">/.test(f.html), `${f.k}: el degradado es userSpaceOnUse con coordenadas absolutas (si no, los lados horizontales desaparecen)`);
  ok(/<svg[^>]*viewBox="0 0 400 3\d0" role="group" aria-label="[^"]+">/.test(f.html), `${f.k}: el SVG tiene role="group" y aria-label`);
  ok(/data-aviso>Toque un lado para ver cada (servicio|producto)<\/p>/.test(f.html) && /data-tarjeta aria-live="polite" hidden>/.test(f.html), `${f.k}: al cargar no hay tarjeta abierta y se invita a tocar un lado`);
  const was = [...f.html.matchAll(/<a class="ini-wa[^"]*" href="(https:\/\/wa\.me\/584244125386\?text=[^"]+)" target="_blank" rel="noopener" data-evento="(inicio_lado_\w+)"/g)];
  ok(was.length === ESPERADOS[f.k].length, `${f.k}: un botón de WhatsApp por lado (${was.length})`);
  was.forEach(w => { const t = decodeURIComponent(w[1].split('text=')[1]); ok(/^Hola F&V, vi .+ en la web y quiero saber más\.$/.test(t), `${f.k}: mensaje de WhatsApp prellenado y codificado («${t}»)`); });
  ok(new Set(was.map(w => w[1])).size === was.length && new Set(was.map(w => w[2])).size === was.length, `${f.k}: cada botón con mensaje y data-evento distintos`);
});
ok(figs[0].html.includes('href="/hexagonal"') && figs[0].html.includes('Ver la Línea Hexagonal') && figs[1].html.includes('href="/triangular"') && figs[1].html.includes('Ver la Línea Triangular'), 'enlaces «Ver la Línea Hexagonal» → /hexagonal y «Ver la Línea Triangular» → /triangular');
ok(/Plan Arranque pausado en la propuesta de catálogo/.test(html), 'Plan Arranque marcado con el comentario REVISAR');
ok(/<div id="video-socios" class="ini-video" hidden><\/div>/.test(html) && html.indexOf('id="video-socios"') > html.indexOf('id="lineas"') && html.indexOf('id="video-socios"') < html.indexOf('id="diagnostico"') && /<!-- VIDEO: activar cuando exista el archivo/.test(html), 'espacio de video oculto entre las líneas y el diagnóstico');

// ------------------------------------------------------------ 4. diagnóstico de 60 segundos
const quiz = sec('diagnostico');
ok(/¿No sabe por dónde empezar\? Responda 3 preguntas\./.test(texto(quiz)), 'diagnóstico: título');
ok(/data-quiz-sinjs/.test(quiz) && /wa\.me\/584244125386\?text=/.test(quiz) && /data-quiz-ui hidden/.test(quiz), 'sin JS se ve el enlace general de WhatsApp y el cuestionario queda oculto');
['¿Cuántas personas trabajan con usted?', '¿Qué le quita más tiempo o plata?', '¿Qué quiere ver primero?', 'Solo yo o hasta 5', 'De 6 a 20', 'Más de 20 o varias sedes', 'Tenemos junta directiva', 'No sé cuánto gano de verdad', 'Cobrar y conciliar pagos', 'Reportes que llegan tarde', 'Atender clientes por WhatsApp', 'Mis números claros', 'Ahorrar horas de trabajo', 'Vender más', 'Su línea: ', 'Le recomendamos empezar por: ', 'Diagnóstico financiero', 'Taller de 3 horas', 'Hablar por WhatsApp', 'Repetir', 'Hola F&V, hice el diagnóstico en la web. Línea: '].forEach(t => ok(js.includes(t), `inicio.js trae «${t}»`));
['inicio_quiz_inicio', 'inicio_quiz_completo_', 'inicio_quiz_whatsapp'].forEach(e => ok(js.includes(e), `inicio.js envía ${e}`));
ok(/role', 'progressbar'/.test(js) && /\.focus\(/.test(js), 'el cuestionario tiene barra de progreso accesible y mueve el foco');
ok(!/localStorage|sessionStorage|document\.cookie|fetch\(|XMLHttpRequest/.test(js), 'el JS no guarda datos ni llama a servidores');
ok(Buffer.byteLength(js) < 25 * 1024, `assets/inicio.js pesa ${Buffer.byteLength(js)} bytes (< 25 KB)`);
ok(/<script defer src="\/assets\/inicio\.js"><\/script>/.test(html), 'inicio.js se carga con defer');

// ------------------------------------------------------------ 5 a 9. resto
const como = sec('como-trabajamos');
ok(/Diagnosticar/.test(como) && /Implementar/.test(como) && /Acompañar/.test(como) && (como.match(/<li>/g) || []).length === 3, 'cómo trabajamos: tres pasos');
const caos = sec('caos-tablero');
ok(/Ejemplo ilustrativo con datos ficticios\./.test(caos) && /Antes/.test(caos) && /Después/.test(caos), 'del caos al tablero: antes, después y el rótulo de datos ficticios');
const delta = sec('delta-app');
ok(texto(delta).includes('Software para clubes, condominios y gimnasios. Una sola plataforma, planes según su tamaño.') && /href="\/delta-app"/.test(delta) && fs.existsSync(path.join(RAIZ, 'delta-app.html')), 'franja Delta App con enlace a /delta-app (la página existe)');
const faq = sec('faq');
const preguntas = [...faq.matchAll(/<summary><span>([^<]+)<\/span><\/summary>\s*<p>([^<]+)<\/p>/g)].map(m => [decodificar(m[1]), decodificar(m[2])]);
ok(preguntas.length === 4 && /<details>/.test(faq), `FAQ: 4 preguntas en <details> (hay ${preguntas.length})`);
ok(JSON.stringify(preguntas.map(p => p[0])) === JSON.stringify(['¿Cuánto cuesta?', '¿En qué moneda se paga?', '¿Puedo pagar por mes?', '¿Qué pasa después del primer contacto?']), 'FAQ: las 4 preguntas, en orden');
const cierre = sec('cierre');
ok(/Hablemos de su empresa/.test(cierre) && /Escribir por WhatsApp/.test(cierre) && /Agendar consulta gratis/.test(cierre) && /href="\/contacto#agenda"/.test(cierre), 'cierre: título, WhatsApp y consulta gratis');
ok(decodeURIComponent((cierre.match(/wa\.me\/584244125386\?text=([^"]+)/) || [, ''])[1]) === 'Hola F&V, vengo de la página de inicio y quiero conversar.', 'cierre: mensaje de WhatsApp');
ok(!/\bmin\b|minutos/i.test(texto(cierre)), 'el cierre no pone la duración de la consulta (TODO: unificar 20/15/30 minutos)');

// ------------------------------------------------------------ JSON-LD
const bloquesLd = [...html.matchAll(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/g)].map(m => m[1]);
ok(bloquesLd.length === 1, 'un bloque JSON-LD');
let ld = null;
try { ld = JSON.parse(bloquesLd[0]); ok(true, 'JSON-LD válido'); } catch (e) { ok(false, 'el JSON-LD parsea con JSON.parse: ' + e.message); }
if (ld) {
  const g = ld['@graph'];
  ok(JSON.stringify(g.map(x => x['@type'])) === JSON.stringify(['Organization', 'ProfessionalService', 'FAQPage']), `JSON-LD: Organization, ProfessionalService y FAQPage (hay ${g.map(x => x['@type']).join(', ')})`);
  const org = g.find(x => x['@type'] === 'Organization'), neg = g.find(x => x['@type'] === 'ProfessionalService'), f = g.find(x => x['@type'] === 'FAQPage');
  ok(org.email === 'contacto@fvaigroup.com' && org.telephone === '+58-424-412-5386' && neg.address.addressLocality === 'Valencia' && neg.openingHoursSpecification[0].opens === '09:00' && neg.openingHoursSpecification[0].closes === '17:00', 'JSON-LD: datos de contacto, dirección y horario');
  ok(!/L[ií]nea (Hexagonal|Triangular)|Express/.test(JSON.stringify(org)), 'JSON-LD: la descripción de la organización no nombra las líneas');
  ok(f.mainEntity.length === 4 && f.mainEntity.every((q, i) => q.name === preguntas[i][0] && q.acceptedAnswer.text === preguntas[i][1]), 'JSON-LD: las 4 preguntas y respuestas son EXACTAMENTE las de la página');
  ok(!/\$|USD|desde/.test(JSON.stringify(f)), 'JSON-LD: el FAQPage no trae precios');
  // TODO del dueño: ProfessionalService.priceRange ($4.99 - $3000) sigue en el JSON-LD; no se toca hasta que decida
}

// ------------------------------------------------------------ reglas del inicio
const visible = texto(main);
ok(!/\$|USD|Bs\.|%|\bdesde\b/i.test(visible), 'CERO precios en el texto visible: ni «$», «USD», «Bs.», «%» ni «desde»');
ok(!/\bExpress\b/i.test(texto(html)), '«Express» no existe');
ok(!/10x|garantizad|testimonio|casos? de éxito/i.test(visible), 'sin «10x», «garantizado», testimonios ni casos inventados');
ok(!/Zelle|Pago M[oó]vil|PayPal|Binance|USDT|transferencia|tarjeta|efectivo/i.test(visible), 'no se muestran métodos de pago');
ok(!/contabilidad|n[oó]mina|bot 24\/7|lectura mensual|contadores|cupos|quedan \d/i.test(visible), 'nada de productos que no existen todavía ni de cupos o urgencia');
ok(!pal('tú|tu|tus|ti|puedes|quieres|necesitas|decides|pagas|tienes').test(visible), 'todo el inicio habla de «usted» (sin «tú»)');
ok(!/Asesor F&V|Sesión Clara|datos en vivo/i.test(visible), 'no aparecen «Asesor F&V», «Sesión Clara» ni «datos en vivo»');
const cabecera = (html.match(/<!-- header:inicio[^>]*-->[\s\S]*?<!-- header:fin -->/) || [''])[0];
const pie = (html.match(/<!-- footer:inicio\s*-->[\s\S]*?<!-- footer:fin -->/) || [''])[0];
ok(cabecera.length > 1000 && pie.length > 1000, 'encabezado y pie presentes');
ok(!/L[ií]nea (Hexagonal|Triangular)/.test(texto(cabecera)) && !/L[ií]nea (Hexagonal|Triangular)/.test(texto(pie)), '«Línea Hexagonal/Triangular» no aparece en el encabezado ni en el pie');
ok(!/bcv\.js/.test(html), 'el inicio no carga assets/bcv.js (no muestra bolívares)');

// ------------------------------------------------------------ encabezados y accesibilidad básica
const encabezados = [...main.matchAll(/<h([1-6])\b/g)].map(m => +m[1]);
let salto = false;
encabezados.forEach((nv, i) => { if (i === 0 ? nv !== 1 : nv > encabezados[i - 1] + 1) salto = true; });
ok(!salto, 'los encabezados bajan de a un nivel (h1 → h2 → h3)');
ok(/min-height: 44px/.test((cssTw.match(/\.ini-lado-btn \{[^}]*\}/) || [''])[0]) && /min-height: 52px/.test((cssTw.match(/\.ini-opcion \{[^}]*\}/) || [''])[0]), 'áreas táctiles de al menos 44 px en la lista de lados y las opciones del diagnóstico');
ok(/\.ini-lado-btn:focus-visible[^{]*\{[^}]*outline: 2px solid #fff/.test(cssTw) && /\.ini-lado-svg:focus-visible \.vis/.test(cssTw), 'foco visible en la lista, las opciones y los lados del SVG');

console.log(`inicio: ${n} comprobaciones${process.exitCode ? ' (CON FALLAS)' : ' correctas'}`);
