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
const ORDEN = ['inicio', 'lineas', 'diagnostico', 'como-trabajamos', 'manifiesto', 'caos-tablero', 'brecha', 'delta-app', 'faq', 'cierre'];
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
// 24 nov 2026 (revisión): la luciérnaga de la portada pasa de PNG (245 KB) a WebP (15 KB), la misma imagen que ya usan la guía y #lineas
ok(/<img src="assets\/logo-mark-hex\.webp" alt="" aria-hidden="true"[^>]*class="ini-hexmarca">/.test(portada) && fs.existsSync(path.join(RAIZ, 'assets/logo-mark-hex.webp')) && /\.ini-hexmarca \{[^}]*top: 54%[^}]*translate\(-50%, -54%\)/.test(cssTw) && /\.ini-hexmarca \{[^}]*animation: ini-levita/.test(cssTw) && !/\.ini-hexmarca \{[^}]*rotate/.test(cssTw) && cssTw.includes('prefers-reduced-motion: reduce) { .ini-portada .ini-hexmarca { animation: none'), 'luciérnaga en el centro del hexágono: decorativa, no gira, levita y se detiene con prefers-reduced-motion');
// 24 nov 2026 (rediseño del inicio): en el celular el hexágono ya NO va detrás del texto (antes: abajo y a opacidad .26). Va arriba, en su propio espacio
// (.ini-hexescena en el flujo), a opacidad completa; así la luciérnaga no se monta sobre el botón y no sobra la franja negra de arriba.
const hexCel = (cssTw.match(/@media \(max-width: 1023px\) \{\s*\.ini-portada \.ini-hero \{[\s\S]*?\n\}/) || [''])[0];
ok(/\.ini-portada \.ini-hero \{[^}]*min-height: 0/.test(hexCel) && /\.ini-portada \.ini-hexescena \{[^}]*position: relative/.test(hexCel) && /\.ini-portada \.ini-hexgiro \{[^}]*opacity: 1/.test(hexCel), 'en el celular el hexágono y la luciérnaga van arriba del texto, en su propio espacio (no detrás del texto ni sobre el botón)');
ok(portada.indexOf('class="ini-hexescena"') > -1 && portada.indexOf('class="ini-hexescena"') < portada.indexOf('<h1') && (portada.match(/class="ini-hexcapa" data-paralaje="[\d.]+"/g) || []).length === 2, 'hexágono y luciérnaga en su escena, antes del texto, cada uno en su capa de paralaje');
const reglaH1 = (cssTw.match(/\.ini-portada \.ini-h1 \{[^}]*\}/) || [''])[0];
ok(reglaH1.includes("font-family: 'Plus Jakarta Sans'") && reglaH1.includes('text-transform: uppercase') && reglaH1.includes('font-weight: 800'), 'título en Plus Jakarta Sans y mayúsculas');
ok(html.includes("font-family:'Anton'") && html.includes('https://fonts.gstatic.com/s/anton/v27/1Ptgg87LROyAm3Kz-C8.woff2'), 'la fuente Anton está declarada y precargada en el inicio');
ok(/\.ini-h1-grad \{[^}]*linear-gradient\(90deg, #00FFFF, #FFFFFF, #FF8C00, #FFFFFF, #00FFFF\)[^}]*animation: ini-grad/.test(cssTw) && cssTw.includes('prefers-reduced-motion: reduce) { .ini-portada .ini-h1-grad, h2.ini-h2 .ini-h1-grad { animation: none'), 'degradado cian ↔ blanco ↔ naranja en movimiento, sin verde en el medio (quieto con prefers-reduced-motion)');
const reglaHero = (cssTw.match(/\.ini-portada \.ini-hero \{[^}]*\}/) || [''])[0];
ok(reglaHero.includes('min-height: calc(100svh - 4.75rem)') && portada.indexOf('class="ini-hero"') < portada.indexOf('ini-logos-titulo'), 'el hero ocupa la pantalla visible y la franja de logos queda debajo del primer pantallazo');

// CTA del hero sin animaciones (17 nov 2026): ni entrada, ni anillo cian, ni pulso; sigue visible y con su hover; corrido a la derecha para que Luci no lo tape
ok(!/ini-entra|ini-destello|ini-pulso|ini-shine|ini-borde|ini-orbita|cta-shine|cta-ff/.test(cssTw + html + js), 'botón del hero: sin ninguna animación de entrada ni efecto (ni el anillo cian ni el pulso)');
ok(/class="ini-boton ini-boton-pill btn-primary btn-glow-on-hover">Cómo trabajamos<\/a>/.test(portada) && /href="#lineas"/.test(portada) && /data-evento="portada_como_trabajamos"/.test(portada), 'botón del hero: conserva texto, enlace y data-evento');
ok(/@media \(min-width: 1024px\) \{ \.ini-portada \.ini-botones \{ margin-left: 84px; \} \}/.test(cssTw), 'botón del hero: en escritorio se corre 84 px a la derecha para que el icono de Luci no lo tape');
ok(!/luciPulse 3s/.test(html) && !/#luci-toggle[^\n]*hover:scale-105/.test(html) && !/id="luci-toggle"[^>]*hover:scale-105/.test(html), 'icono de Luci del inicio: sin pulso ni zoom');

// ------------------------------------------------------------ 2. franja de logos
ok(/<p class="ini-logos-titulo[^"]*">Marcas con las que hemos trabajado<\/p>/.test(portada) && !/Empresas que confían/.test(html), 'franja de logos: «Marcas con las que hemos trabajado»');
ok(fs.readdirSync(path.join(RAIZ, 'assets/clientes')).length > 0 && /assets\/clientes\/cliente-logo-/.test(portada), 'los logos de clientes siguen como estaban (assets/clientes/ no se toca)');

// ------------------------------------------------------------ 3. las dos líneas
const lineas = sec('lineas');
const figs = [...lineas.matchAll(/<article id="fig-(hex|tri)"[\s\S]*?<\/article>/g)].map(m => ({ k: m[1], html: m[0] }));
ok(figs.length === 2 && figs[0].k === 'hex' && figs[1].k === 'tri', 'dos figuras, la Hexagonal primero');
ok(texto(lineas).includes('DOS LÍNEAS · UNA FORMA DE TRABAJAR') && /Elija el camino que le <span class="ini-h1-grad">corresponde<\/span>/.test(lineas) && texto(lineas).includes('Más de 20 personas, varias sedes o junta directiva: Línea Hexagonal. Si usted decide solo en su negocio: Línea Triangular.'), 'antetítulo, título y ayuda de la sección');
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
// Rediseño del 24 nov 2026: núcleo window.INI (assets/inicio-efectos.js) y un archivo por efecto (assets/inicio-<clave>.js), como en Cobranza, Logística y Páginas web
const posIni = k => html.indexOf('<script defer src="/assets/' + k + '.js"></script>');
const efectosIni = ['hero', 'marcas', 'lineas', 'como', 'manifiesto', 'caos', 'brecha', 'faqcierre', 'guia'];
const nucleoIni = fs.readFileSync(path.join(RAIZ, 'assets/inicio-efectos.js'), 'utf8');
ok(posIni('inicio-efectos') > posIni('inicio') && posIni('inicio') > -1 && /window\.INI\s*=/.test(nucleoIni) && /prefers-reduced-motion: reduce/.test(nucleoIni) && /IntersectionObserver/.test(nucleoIni), 'inicio: el núcleo inicio-efectos.js se carga con defer después de inicio.js, expone window.INI y respeta reduced-motion');
ok(!/localStorage|sessionStorage|document\.cookie|fetch\(|XMLHttpRequest/.test(nucleoIni), 'inicio: el núcleo de efectos no guarda datos ni llama a servidores');
efectosIni.forEach(k => ok(fs.existsSync(path.join(RAIZ, 'assets/inicio-' + k + '.js')) && posIni('inicio-' + k) > posIni('inicio-efectos') && html.includes('<!-- ini:' + k + ':inicio -->') && html.includes('<!-- ini:' + k + ':fin -->') && html.includes('data-ini-montaje="' + k + '"') && cssTw.includes('/* ===== inicio:' + k + ' ===== */') && cssTw.includes('/* ===== /inicio:' + k + ' ===== */'), `inicio: el efecto «${k}» tiene su JS (defer, tras el núcleo), su punto de montaje y su bloque CSS`));
ok(cssTw.includes('/* ===== inicio:base ===== */') && /\.ini-mesh \{[^}]*z-index: -1[^}]*overflow: clip/.test(cssTw) && /\.ini-hexgrid \{/.test(cssTw) && /\.ini-vidrio, [^{]*\{[^}]*backdrop-filter: blur\(16px\)/.test(cssTw), 'inicio: sistema visual compartido (malla con rejilla hexagonal, vidrio) en el bloque inicio:base');
ok(secciones.every(s => /class="[^"]*\bini-sec\b/.test(s.html) && /<div class="ini-mesh[^"]*" aria-hidden="true">/.test(s.html)), 'inicio: todas las secciones tienen su malla de degradados (ini-sec + ini-mesh)');
ok(secciones.filter(s => s.id !== 'inicio').every(s => /class="[^"]*\bini-sep\b/.test(s.html)), 'inicio: separador hexagonal en todas las secciones después de la portada');
ok((main.match(/data-paralaje="/g) || []).length >= 25 && (main.match(/ini-vidrio/g) || []).length >= 8, 'inicio: paralaje y vidrio en el recorrido');
ok(/h2\.ini-h2 \{[^}]*text-transform: none/.test(cssTw) && !/h2\.ini-h2 \{[^}]*uppercase/.test(cssTw) && !/<h2[^>]*class="[^"]*\buppercase\b/.test(main), 'inicio: los h2 van en minúsculas (decisión del 24 nov 2026); solo el h1 sigue en mayúsculas');
ok(/\.ini-fx \[data-ini-ve\] \{ opacity: 0/.test(cssTw) && /prefers-reduced-motion: reduce\) \{\s*\.ini-mancha, \.ini-hexgrid \{ animation: none; \}\s*\.ini-fx \[data-ini-ve\] \{ opacity: 1/.test(cssTw), 'inicio: apariciones solo con JS (html.ini-fx) y malla quieta y todo visible con prefers-reduced-motion');

// ------------------------------------------------------------ 5 a 9. resto
const como = sec('como-trabajamos');
ok(/Diagnosticar/.test(como) && /Implementar/.test(como) && /Acompañar/.test(como) && (como.match(/<li>/g) || []).length === 3, 'cómo trabajamos: tres pasos');
const caos = sec('caos-tablero');
ok(/Ejemplo ilustrativo con datos ficticios\./.test(caos) && /Antes/.test(caos) && /Después/.test(caos), 'del caos al tablero: antes, después y el rótulo de datos ficticios');
const delta = sec('delta-app');
// 24 nov 2026 (decisión de Ricardo): la franja ya no habla de «Delta App» (clubes, condominios y gimnasios), que contradecía a Delta:
// ahora dice que Delta es la familia de apps ▲ (texto de /triangular/delta) y lleva a /triangular/delta, con el logo ▲ y los colores verde/morado.
ok(texto(delta).includes('Delta es la familia de apps ▲ de F&V AI Group: Cobranza, Cont App, Dist App y Delta Logística.') && /<a href="\/triangular\/delta" class="ini-btn-tri" data-evento="inicio_delta_app" data-cta="inicio_delta">Conocer Delta<\/a>/.test(delta) && fs.existsSync(path.join(RAIZ, 'triangular/delta.html')), 'franja Delta: familia de apps ▲, botón «Conocer Delta» → /triangular/delta (la página existe) con su data-evento y data-cta');
ok(/class="[^"]*\blinea-tri\b/.test(delta) && /<img src="assets\/logo-full-tri\.webp" alt="" aria-hidden="true"[^>]*loading="lazy"/.test(delta) && /ini-mesh-tri/.test(delta) && /ini-vidrio-tri/.test(delta) && !/Software para clubes|href="\/delta-app"/.test(delta), 'franja Delta: línea Triangular (verde/morado), logo ▲ decorativo y sin el texto viejo de Delta App');
const faq = sec('faq');
const preguntas = [...faq.matchAll(/<summary><span>([^<]+)<\/span><\/summary>\s*<p>([^<]+)<\/p>/g)].map(m => [decodificar(m[1]), decodificar(m[2])]);
ok(preguntas.length === 4 && /<details>/.test(faq), `FAQ: 4 preguntas en <details> (hay ${preguntas.length})`);
ok(JSON.stringify(preguntas.map(p => p[0])) === JSON.stringify(['¿Cuánto cuesta?', '¿En qué moneda se paga?', '¿Puedo pagar por mes?', '¿Qué pasa después del primer contacto?']), 'FAQ: las 4 preguntas, en orden');
const cierre = sec('cierre');
ok(/Hablemos de <span class="ini-h1-grad">su empresa<\/span>/.test(cierre) && /Escribir por WhatsApp/.test(cierre) && /Agendar consulta gratis/.test(cierre) && /href="\/contacto#agenda"/.test(cierre), 'cierre: título, WhatsApp y consulta gratis');
ok(decodeURIComponent((cierre.match(/wa\.me\/584244125386\?text=([^"]+)/) || [, ''])[1]) === 'Hola F&V, vengo de la página de inicio y quiero conversar.', 'cierre: mensaje de WhatsApp');
ok(!/\bmin\b|minutos/i.test(texto(cierre)), 'el cierre no pone la duración de la consulta (TODO: unificar 20/15/30 minutos)');

const manifiesto = sec('manifiesto');
const frasesM = [...manifiesto.matchAll(/<p class="ini-frase" data-frase>([\s\S]*?)<\/p>/g)].map(m => texto(m[1]).replace(/\s+([.,;:])/g, '$1'));
ok(JSON.stringify(frasesM) === JSON.stringify(['Decidir con datos no es solo para empresas grandes.']), `manifiesto: una sola frase de texto, la primera (hay: ${frasesM.join(' | ')})`);
ok((manifiesto.match(/<em class="ini-clave">/g) || []).length === 1 && !/<a\b|<button\b/.test(manifiesto), 'manifiesto: una palabra clave resaltada y sin botón ni enlace');
const ps = (manifiesto.match(/<figure class="ini-ps"[\s\S]*?<\/figure>/) || [''])[0];
// 24 nov 2026 (rediseño del inicio): la ventana deja de imitar «Windows PowerShell» (azul de Windows, fuera de marca) y pasa a ser una consola de vidrio
// en los colores de la marca, con los mismos comandos. Antes esta prueba EXIGÍA «Windows PowerShell»; ahora exige que no esté.
ok(texto(ps).includes('La inteligencia artificial es el cómo. Su empresa es el qué.') && !/PowerShell/.test(ps) && /Get-Cobranza/.test(ps) && /Conciliar-Pagos/.test(ps) && /Update-Tablero/.test(ps) && !/Nos quedamos/.test(manifiesto), 'manifiesto: la segunda frase es una consola de marca (sin «Windows PowerShell») con el mismo código de automatización y se quitó «Nos quedamos…»');
ok(!/#012456/i.test(cssTw) && /\.ini-ps \{[^}]*border-radius/.test(cssTw) && cssTw.includes('.ini-faq-lista > details, .ini-ps {'), 'manifiesto: la consola ya no usa el azul de Windows y lleva el vidrio de la marca');
ok(/\[data-ps\]/.test(js) && /createTreeWalker/.test(js) && /prefers-reduced-motion: reduce/.test(js.slice(js.indexOf('data-ps'), js.indexOf('data-ps') + 400)) && /\.ini-frase \{[^}]*Plus Jakarta Sans[^}]*font-weight: 800/.test(cssTw), 'manifiesto: el tecleo arranca al verse, respeta reduced-motion y la frase usa la tipografía del H1');
ok(/\.ini-clave|\.ini-frase em \{[^}]*linear-gradient\(90deg, #00FFFF, #FFFFFF, #FF8C00\)/.test(cssTw) && cssTw.includes('.ini-frase { opacity: 1; transform: none; transition: none; } }') && /min-height: 78svh/.test(cssTw), 'manifiesto: tipografía de títulos, palabra clave en cian/naranja, una frase por pantalla en celular y sin animación con prefers-reduced-motion');

// luciérnaga 3D del manifiesto: gira 360° con el scroll, se carga al acercarse y no estorba al texto
const logo3d = fs.readFileSync(path.join(RAIZ, 'assets/fv-logo-3d/fv-logo-3d.js'), 'utf8');
ok(['face.webp', 'edge.webp', 'halo.webp'].every(f => fs.existsSync(path.join(RAIZ, 'assets/fv-logo-3d', f))), 'luciérnaga 3D: están cara, canto y halo en assets/fv-logo-3d/');
ok(/<div class="ini-manif-giro" aria-hidden="true">/.test(manifiesto) && /<fv-logo-3d data-giro-manifiesto base="\/assets\/fv-logo-3d\/" scroll="#manifiesto" aria-hidden="true"><img src="\/assets\/fv-logo-3d\/face\.webp" alt=""[^>]*loading="lazy"/.test(manifiesto), 'luciérnaga 3D: en el manifiesto, decorativa, sigue el scroll de #manifiesto y sin JS queda la imagen fija');
ok(!/fv-logo-3d\.js/.test(html) && /rootMargin: '600px 0px'/.test(js) && /\/assets\/fv-logo-3d\/fv-logo-3d\.js/.test(js), 'luciérnaga 3D: el script no está en el HTML; inicio.js lo descarga al acercarse a la sección');
ok(/_progreso\(\)/.test(logo3d) && /-2 \* Math\.PI \* self\._progreso\(\)/.test(logo3d) && /IntersectionObserver/.test(logo3d) && /prefers-reduced-motion: reduce/.test(logo3d), 'luciérnaga 3D: una vuelta (360°) según el avance por la sección, solo dibuja en pantalla y respeta reduced-motion');
ok(/\.ini-manifiesto \{ padding: 1rem 0; overflow: clip; \}/.test(cssTw) && !/id="manifiesto" class="[^"]*overflow-hidden/.test(html) && /\.ini-manif-giro-pegado \{[^}]*position: sticky/.test(cssTw), 'luciérnaga 3D: pegada (sticky) a mitad de pantalla; la sección usa overflow: clip para no romper el sticky');
ok(/\.ini-js \.ini-manif-giro\.is-in fv-logo-3d \{ opacity: 1; transform: none; \}/.test(cssTw) && /prefers-reduced-motion: reduce\) \{ \.ini-js \.ini-manif-giro fv-logo-3d \{ opacity: 1/.test(cssTw), 'luciérnaga 3D: aparece con un fundido al entrar (visible de una vez con reduced-motion)');

// ------------------------------------------------------------ C. Luci con personalidad (avisos por sección)
ok(/lineas: \{ texto: '¿No sabe cuál es la suya\? Le ayudo en 3 preguntas\.', href: '#diagnostico', evento: 'luci_lineas' \}/.test(js), 'Luci #lineas: mensaje y scroll a #diagnostico (luci_lineas)');
ok(/diagnostico: \{ texto: 'Son 3 preguntas\. Menos de un minuto\.', evento: 'luci_diagnostico' \}/.test(js), 'Luci #diagnostico: mensaje (luci_diagnostico)');
ok(/brecha: \{ texto: 'Pruebe con lo que cobró esta semana\.', evento: 'luci_brecha' \}/.test(js), 'Luci #brecha: mensaje (luci_brecha)');
ok(/faq: \{ texto: '¿Otra pregunta\? Escríbame por WhatsApp\.'/.test(js) && js.includes("'Hola F&V, tengo una pregunta que no está en la web.'") && /evento: 'luci_faq'/.test(js), 'Luci #faq: mensaje y WhatsApp con su texto (luci_faq)');
ok(!/cierre:\s*\{/.test(js.slice(js.indexOf('var AVISOS'), js.indexOf('var MAX_AVISOS'))), 'Luci: el cierre no lleva mensaje');
ok(/MAX_AVISOS = 3, ESPERA = 2000, DURACION = 6000/.test(js) && /aria-live', 'polite'/.test(js) && /ini-aviso-x/.test(js) && /apagado = true/.test(js), 'Luci: máximo 3, 2 s de espera, 6 s de duración, aria-live polite, X de cierre y no vuelve si se cierra');
ok(!/\.focus\(\)/.test(js.slice(js.indexOf('var AVISOS'))), 'Luci: el aviso no roba el foco');
ok(/\.ini-aviso-x \{[^}]*width: 44px; min-height: 44px/.test(cssTw) && cssTw.includes('prefers-reduced-motion: reduce) { .ini-aviso { transition: none'), 'Luci: la X mide 44 px y no hay animación con prefers-reduced-motion');
ok(!fs.readFileSync(path.join(RAIZ, 'assets/luci.js'), 'utf8').includes('ini-aviso'), 'assets/luci.js no se tocó para esto');

// ------------------------------------------------------------ D. Linterna del cursor (solo escritorio)
const lint = fs.readFileSync(path.join(RAIZ, 'assets/linterna.js'), 'utf8');
ok(Buffer.byteLength(lint) < 2048, `assets/linterna.js pesa ${Buffer.byteLength(lint)} bytes (< 2 KB)`);
ok(/matchMedia\('\(hover: hover\) and \(pointer: fine\)'\)\.matches && window\.innerWidth >= 1024/.test(js) && /!reducido/.test(js.slice(js.indexOf('Linterna del cursor'), js.indexOf('Linterna del cursor') + 400)) && js.includes("lin.src = '/assets/linterna.js'"), 'la linterna solo se carga con mouse, ancho >= 1024 px y sin prefers-reduced-motion');
ok(!/linterna/.test(html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, '')), 'el HTML del inicio no trae nada de la linterna (en celular ni se descarga)');
ok(/#inicio, #manifiesto/.test(lint) && /requestAnimationFrame/.test(lint) && /visibilitychange/.test(lint) && /pointerleave/.test(lint) && /pointer-events/.test(cssTw.match(/\.ini-linterna \{[^}]*\}/)[0]), 'la linterna solo está en el hero y el manifiesto, va con requestAnimationFrame, se pausa con la pestaña oculta o al salir el cursor y no recibe clics');
ok(/\.ini-linterna \{[^}]*z-index: 0[^}]*radial-gradient\(circle 280px at var\(--x, 50%\) var\(--y, 50%\), rgba\(255, 214, 102, \.10\), rgba\(0, 255, 255, \.05\)/.test(cssTw), 'la linterna es un radial-gradient cálido (amarillo/cian muy tenue) que se mueve con --x y --y y queda detrás del contenido');

// ------------------------------------------------------------ degradados cian <-> naranja con blanco en el medio (sin verde)
ok(!/linear-gradient\([^)]*(?:#00FFFF|#0ff)\s*,\s*(?:#FF8C00|#ff8c00)[^)]*\)/i.test(cssTw) && !/linear-gradient\([^)]*(?:#00FFFF|#0ff)\s*,\s*(?:#FF8C00|#ff8c00)[^)]*\)/i.test(html), 'ningún degradado cian→naranja de dos paradas en el CSS ni en el inicio: todos llevan blanco en el medio');

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
// La calculadora de la brecha (#brecha) muestra montos del USUARIO, no precios de F&V: es la ÚNICA zona exenta de la regla de cero precios
const mainSinExcepcion = main.replace(/<section\b[^>]*data-sin-precios-excepcion="brecha"[\s\S]*?<\/section>/, '');
const visiblePrecios = texto(mainSinExcepcion);
ok(mainSinExcepcion.length < main.length && (main.match(/data-sin-precios-excepcion=/g) || []).length === 1, 'solo hay una zona exenta de la regla de precios: #brecha');
ok(!/\$|USD|Bs\.|%|\bdesde\b/i.test(visiblePrecios), 'CERO precios en el texto visible (fuera de #brecha): ni «$», «USD», «Bs.», «%» ni «desde»');
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
ok(/<script defer src="\/assets\/bcv\.js"><\/script>/.test(html) && !/data-bcv-chip|data-usd=/.test(html), 'bcv.js se carga solo para la calculadora: el inicio no muestra montos en bolívares de F&V');

// ------------------------------------------------------------ encabezados y accesibilidad básica
const encabezados = [...main.matchAll(/<h([1-6])\b/g)].map(m => +m[1]);
let salto = false;
encabezados.forEach((nv, i) => { if (i === 0 ? nv !== 1 : nv > encabezados[i - 1] + 1) salto = true; });
ok(!salto, 'los encabezados bajan de a un nivel (h1 → h2 → h3)');
ok(/min-height: 44px/.test((cssTw.match(/\.ini-lado-btn \{[^}]*\}/) || [''])[0]) && /min-height: 52px/.test((cssTw.match(/\.ini-opcion \{[^}]*\}/) || [''])[0]), 'áreas táctiles de al menos 44 px en la lista de lados y las opciones del diagnóstico');
ok(/\.ini-lado-btn:focus-visible[^{]*\{[^}]*outline: 2px solid #fff/.test(cssTw) && /\.ini-lado-svg:focus-visible \.vis/.test(cssTw), 'foco visible en la lista, las opciones y los lados del SVG');


// /triangular/cobranza (app Cobranza, línea Triangular): sin precios, dinámica por sector, con pasarelas de pago y la URL vieja redirigida
const cob = fs.readFileSync(path.join(RAIZ, 'triangular/cobranza.html'), 'utf8');
const cobMain = cob.slice(cob.indexOf('<main'), cob.indexOf('</main>'));
const cobJs = fs.readFileSync(path.join(RAIZ, 'assets/cobranza.js'), 'utf8');
ok(!fs.existsSync(path.join(RAIZ, 'triangular/delta-app.html')) && JSON.parse(fs.readFileSync(path.join(RAIZ, 'vercel.json'), 'utf8')).redirects.some(r => r.source === '/triangular/delta-app' && r.destination === '/triangular/cobranza' && r.permanent), 'cobranza: /triangular/delta-app redirige (301) a /triangular/cobranza');
ok(!/\$\s?\d|\d\s?\$|USD\s?\d|Bs\.?\s?\d/.test(texto(cobMain)), 'cobranza: la página no muestra precios');
ok(/class="linea-tri cob"/.test(cobMain) && /<span class="cob-marca cob-grad">Cobranza<\/span>/.test(cobMain) && /pasarelas de pago/i.test(texto(cobMain)), 'cobranza: línea Triangular, la app se llama Cobranza y habla de pasarelas de pago');
['negocio', 'gimnasio', 'condominio', 'club', 'colegio'].forEach(k => ok(cobMain.includes(`data-cob-sector="${k}"`) && cobMain.includes(`data-cob-panel="${k}"`) && cobJs.includes(`${k}: {`), `cobranza: el sector «${k}» tiene botón, panel y textos`));
ok((cobMain.match(/role="tabpanel"[^>]*tabindex="0"/g) || []).length === 5 && /ArrowRight/.test(cobJs), 'cobranza: pestañas accesibles con teclado y paneles enfocables');
ok(/data-paralaje/.test(cobMain) && /cob-mesh/.test(cobMain) && /cob-vidrio/.test(cobMain) && /prefers-reduced-motion: reduce/.test(cobJs), 'cobranza: malla de degradados, vidrio y paralaje (sin paralaje con reduced-motion)');
ok(/<script defer src="\/assets\/cobranza\.js"><\/script>/.test(cob) && /font-family:'Plus Jakarta Sans'/.test(cob), 'cobranza: carga su JS con defer y la fuente de los títulos');

// Funciones dinámicas de Cobranza: cada una en su sección, con su JS (después del núcleo) y sin animar con reduced-motion
const cobFunciones = { hero: 'data-cob-hero', panel: 'id="panel"', antes: 'id="antes-despues"', chat: 'id="como-funciona"', tiempo: 'id="linea-tiempo"', consola: 'id="pasarelas"', flujo: 'id="flujo"', calc: 'id="calculadora"' };
Object.entries(cobFunciones).forEach(([k, marca]) => {
  const ruta = path.join(RAIZ, `assets/cobranza-${k}.js`);
  const js = fs.existsSync(ruta) ? fs.readFileSync(ruta, 'utf8') : '';
  ok(cobMain.includes(marca) && js && cob.indexOf(`src="/assets/cobranza-${k}.js"`) > cob.indexOf('src="/assets/cobranza.js"') && /COB\.reducir|prefers-reduced-motion/.test(js), `cobranza: la función «${k}» tiene su sección, su JS cargado tras el núcleo y respeta reduced-motion`);
});
ok(cob.indexOf('src="/assets/bcv.js"') > -1 && cob.indexOf('src="/assets/bcv.js"') < cob.indexOf('src="/assets/cobranza.js"') && /window\.COB\s*=/.test(cobJs), 'cobranza: bcv.js se carga antes del núcleo y el núcleo expone window.COB');
ok(!/<section id="linea-tiempo"[^>]*class="[^"]*cob-sec\b/.test(cobMain), 'cobranza: la línea de tiempo no usa .cob-sec (su overflow hidden rompe el sticky)');
ok(/Ejemplo ilustrativo/.test(texto(cobMain)) && (texto(cobMain).match(/Ejemplo ilustrativo/g) || []).length >= 6, 'cobranza: las maquetas con datos de ejemplo dicen «Ejemplo ilustrativo»');

// /triangular/delta/logistica (app Delta Logística, línea Triangular): precios exactos del dueño, las 42 funciones con su plan,
// seis tipos de flota, efectos con su JS después del núcleo y la URL vieja de Flet App redirigida
const logHtml = unix(fs.readFileSync(path.join(RAIZ, 'triangular/delta/logistica.html'), 'utf8'));
const logMain = logHtml.slice(logHtml.indexOf('<main'), logHtml.indexOf('</main>'));
const logTxt = texto(logMain);
const logJs = fs.readFileSync(path.join(RAIZ, 'assets/logistica.js'), 'utf8');
const vercelRed = JSON.parse(fs.readFileSync(path.join(RAIZ, 'vercel.json'), 'utf8')).redirects;
ok(/class="linea-tri log"/.test(logMain) && /<span class="log-marca log-grad">Logística<\/span>/.test(logMain) && /Cuánto te deja cada viaje\./.test(logTxt), 'logística: línea Triangular, H1 «Logística» y la frase «Cuánto te deja cada viaje.»');
ok(!/próximamente|avísame|cuando esté list/i.test(texto(logHtml)) && !/pr%C3%B3ximamente|av%C3%ADsame/i.test(logHtml), 'logística: no dice «Próximamente» ni «avísame cuando esté listo» (tampoco en los mensajes de WhatsApp)');
['$30', '$90', '$210', '$14', '$6', '$2', '$300', '$900', '$2.100', '$25', '$75', '$175'].forEach(p => ok(new RegExp('(?<![\\d.,$])' + p.replace(/[$.]/g, '\\$&') + '(?![\\d.,])').test(logTxt), `logística: la tabla muestra el precio ${p}`));
ok(!/\d,99/.test(logTxt), 'logística: los precios no se pasan a ,99');
ok(logTxt.includes('¿Más de 9 camiones? El Intermedio te sale más rentable.'), 'logística: la frase de los 9 camiones va junto a los precios');
ok(logTxt.includes('*Usuarios de oficina: dueño, despachador o administración. Los choferes no cuentan: son ilimitados en todos los planes.'), 'logística: la nota del asterisco de usuarios de oficina');
['Mini Truck / Pick-up', 'Camión 350', 'NPR / Canter', 'Camión 750 / 600', 'Torpedo / 12 Toneladas', 'Gandola (Chuto + Remolque)'].forEach(f => ok(logTxt.includes(f), `logística: el tipo de flota «${f}»`));
ok(!/NRP/.test(logTxt), 'logística: «NPR / Canter», no la errata «NRP»');
const logFns = [...logMain.matchAll(/<li class="log-fn" data-plan="([BIA])"/g)].map(m => m[1]);
ok(logFns.length === 42 && logFns.filter(p => p === 'B').length === 20 && logFns.filter(p => p === 'I').length === 13 && logFns.filter(p => p === 'A').length === 9, `logística: 42 funciones con su plan (20 B, 13 I, 9 A); hay ${logFns.length}`);
ok(/B: 1 · I: 3 · A: sin límite/.test(logTxt) && /I y A: la hace F&V · B: plantilla/.test(logTxt) && /Cada plan incluye lo del anterior\./.test(logTxt), 'logística: leyenda de planes y chips de usuarios y de carga inicial');
ok(/Sujeto a la aprobación de Meta \(WhatsApp\)/.test(logTxt) && /Según tu proveedor de GPS/.test(logTxt) && /En desarrollo/.test(logTxt) && /Después del lanzamiento/.test(logTxt), 'logística: las notas «En desarrollo», «Después del lanzamiento», Meta y GPS');
const logEfectos = ['hero', 'antes', 'tablero', 'viaje', 'ganancia', 'ruta', 'panel', 'planes', 'calc'];
logEfectos.forEach(k => {
  const ruta = path.join(RAIZ, `assets/logistica-${k}.js`);
  const js = fs.existsSync(ruta) ? fs.readFileSync(ruta, 'utf8') : '';
  ok(js && logHtml.includes(`<!-- log:${k}:inicio -->`) && logHtml.indexOf(`src="/assets/logistica-${k}.js"`) > logHtml.indexOf('src="/assets/logistica.js"') && /\b(?:LOG|L)\.reducir\b|prefers-reduced-motion/.test(js), `logística: el efecto «${k}» tiene su punto de montaje, su JS cargado tras el núcleo y respeta reduced-motion`);
  ok(cssTw.includes(`/* ===== logistica:${k} ===== */`) && cssTw.includes(`/* ===== /logistica:${k} ===== */`), `logística: el CSS del efecto «${k}» va en su bloque`);
});
ok(logHtml.indexOf('src="/assets/bcv.js"') > -1 && logHtml.indexOf('src="/assets/bcv.js"') < logHtml.indexOf('src="/assets/logistica.js"') && /window\.LOG\s*=/.test(logJs), 'logística: bcv.js se carga antes del núcleo y el núcleo expone window.LOG');
ok((logTxt.match(/Ejemplo ilustrativo/g) || []).length >= 7, 'logística: las maquetas con datos de ejemplo dicen «Ejemplo ilustrativo»');
ok(/data-paralaje/.test(logMain) && /log-mesh/.test(logMain) && /log-vidrio/.test(logMain) && /prefers-reduced-motion: reduce/.test(logJs), 'logística: malla de degradados, vidrio y paralaje (sin paralaje con reduced-motion)');
ok(!/<section id="viaje"[^>]*class="[^"]*\blog-sec(?![\w-])/.test(logMain), 'logística: #viaje no usa .log-sec (su overflow hidden rompe el sticky)');
ok(/wa\.me\/584244125386\?text=Hola%20F%26V%2C%20quiero%20saber%20de%20Delta%20Log%C3%ADstica/.test(logMain) && ['B%C3%A1sico', 'Intermedio', 'Avanzado'].every(p => logMain.includes('me%20interesa%20Log%C3%ADstica%2C%20plan%20' + p)) && /href="\/triangular\/delta"/.test(logMain), 'logística: WhatsApp general y por plan, y enlace a todas las apps de Delta');
ok(!fs.existsSync(path.join(RAIZ, 'triangular/flet-app.html')) && vercelRed.some(r => r.source === '/triangular/flet-app' && r.destination === '/triangular/delta/logistica' && r.permanent), 'logística: /triangular/flet-app redirige (301) a /triangular/delta/logistica');
ok(/node tests\/logistica\.test\.js/.test(JSON.parse(fs.readFileSync(path.join(RAIZ, 'package.json'), 'utf8')).scripts.test), 'logística: la prueba de la calculadora corre en npm test');
ok(fs.readdirSync(path.join(RAIZ, 'triangular/delta')).every(f => !/^_prueba/.test(f)), 'logística: no quedan páginas de prueba _prueba-*.html');

// /triangular/paginas-web (rediseño del 23 nov 2026, línea Triangular): texto exacto del dueño, precios exactos (sin ,99),
// las 90 funciones con su nivel, los 7 pasos, las 8 preguntas (también en el FAQPage) y los efectos con su JS después del núcleo
const webHtml = unix(fs.readFileSync(path.join(RAIZ, 'triangular/paginas-web.html'), 'utf8'));
const webMain = webHtml.slice(webHtml.indexOf('<main'), webHtml.indexOf('</main>'));
const webTxt = texto(webMain);
const webSec = id => { const i = webMain.search(new RegExp('<section id="' + id + '"')); return i < 0 ? '' : texto(webMain.slice(i, webMain.indexOf('</section>', i))); };
const webJs = fs.readFileSync(path.join(RAIZ, 'assets/paginas-web.js'), 'utf8');
ok(/<main id="main-content" class="linea-tri web" data-web>/.test(webHtml), 'páginas web: <main> de la línea Triangular con data-web');
ok(/<h1[^>]*>Tu página web, <span class="web-grad">lista para vender\.<\/span><\/h1>/.test(webMain) && webTxt.includes('Tu página web, lista para vender.'), 'páginas web: título «Tu página web, lista para vender.»');
ok(webTxt.includes('Diseño a la medida, precios en dólares y bolívares, pedidos por WhatsApp y todo lo que tu negocio necesita para que te encuentren en Google. Pagas al mes, o pagas una vez y es tuya para siempre.'), 'páginas web: subtítulo exacto');
ok(/href="#planes"[^>]*>Ver planes</.test(webMain) && />Escríbenos por WhatsApp</.test(webMain), 'páginas web: botones «Ver planes» y «Escríbenos por WhatsApp»');
['inicio-web', 'formas', 'planes', 'propia', 'conviene', 'funciones', 'adicionales', 'proceso', 'preguntas', 'cierre'].forEach(id => ok(new RegExp('<section id="' + id + '"').test(webMain), `páginas web: sección #${id}`));
const precioEn = (txt, p) => new RegExp('(?<![\\d.,$])' + p.replace(/[$.]/g, '\\$&') + '(?![\\d.,])').test(txt);
[['formas', ['Un pago bajo cada mes', 'Un solo pago, en dos partes', 'F&V se encarga de todo: alojamiento, dominio, cambios y seguridad', 'Tu página, tu código y tu dominio son tuyos para siempre']],
 ['planes', ['$10', '$30', '$70', '$20', '$60', '$140', '$100', '$300', '$700', '12 meses por el precio de 10, sin instalación', '5 días hábiles', '10 días hábiles', '20 días hábiles', 'Hasta 4 horas']],
 ['propia', ['$100', '$300', '$700', '$50', '$150', '$350', '$5 al mes', '$15 al mes', '$35 al mes', 'Dominio .com', 'Base de datos (tienda, reservas o área de clientes)', 'Asistente de IA', 'Estos servicios se pagan con tarjeta internacional, a tu nombre.']],
 ['adicionales', ['$10', '$9', '$8', '$5', '$2,14', '$0,71', '$100, pago único', 'El descuento del pago anual no aplica a los adicionales.']]
].forEach(([id, claves]) => { const t = webSec(id); claves.forEach(c => ok(/^\$[\d.,]+$/.test(c) ? precioEn(t, c) : t.includes(c), `páginas web: #${id} muestra «${c}»`)); });
ok(webSec('planes').includes('Pasa a ser dueño cuando quieras: si estás en un plan mensual y quieres quedarte con tu página, la compras por $100 (Básico), $300 (Intermedio) o $700 (Avanzado).'), 'páginas web: «Pasa a ser dueño cuando quieras» exacto');
ok(webSec('conviene').includes('La Básica y la Intermedia salen más baratas que el plan mensual desde el mes 9. Si le sumas el mantenimiento, desde el mes 19 o 20.') && /Cálculo aproximado/.test(webSec('conviene')), 'páginas web: ¿Qué me conviene? con el texto del dueño y «Cálculo aproximado»');
ok(!/\d,99/.test(webTxt) && !/\$(14,99|29,99|59,99|99,99)/.test(webHtml) && !/Presencia/.test(webHtml), 'páginas web: sin precios en ,99 ni la oferta vieja «Presencia» (tampoco en el JSON-LD)');
const webFns = [...webMain.matchAll(/<li class="web-fn[^"]*" data-nivel="(todos|intermedio|avanzado)" data-fn="(\d+)"/g)];
const porNivel = k => webFns.filter(m => m[1] === k).length;
ok(webFns.length === 90 && porNivel('todos') === 58 && porNivel('intermedio') === 19 && porNivel('avanzado') === 13, `páginas web: 90 funciones con su nivel (58 todos, 19 intermedio, 13 avanzado); hay ${webFns.length} (${porNivel('todos')}/${porNivel('intermedio')}/${porNivel('avanzado')})`);
ok(webFns.map(m => +m[2]).join() === Array.from({ length: 90 }, (_, i) => i + 1).join(), 'páginas web: las funciones van numeradas del 1 al 90, en orden');
ok((webMain.match(/class="web-chip" data-chip="/g) || []).length >= 93, 'páginas web: cada función lleva su chip de nivel (más los 3 de la leyenda)');
['Dirección, alojamiento y seguridad', 'Diseño', 'Contenido', 'Contacto y ventas', 'Google y visibilidad', 'Medición', 'Correo y presencia', 'Entrega y autonomía', 'Después de publicar'].forEach(c => ok(webSec('funciones').includes(c), `páginas web: categoría «${c}»`));
ok(webTxt.includes('Próximamente: pago con tarjeta en línea, cuando haya una pasarela que funcione en Venezuela.'), 'páginas web: «Próximamente: pago con tarjeta en línea…» del dueño');
const webPasos = [...webMain.matchAll(/<li class="web-paso[^"]*" data-web-paso="(\d)"/g)].map(m => m[1]).join('');
ok(webPasos === '1234567' && ['Conversamos', 'Pagas para empezar:', 'Nos envías tus textos y fotos.', 'Te mostramos la maqueta', 'Construimos tu página', 'Publicamos', 'Te acompañamos:'].every(p => webSec('proceso').includes(p)), 'páginas web: los 7 pasos, en orden');
ok(webSec('proceso').includes('Formas de pago: Pago Móvil, Transferencia o USDT. En bolívares, a la tasa BCV del día.'), 'páginas web: formas de pago exactas');
const WEB_FAQ = [
  ['¿El dominio es mío?', 'Sí, siempre se registra a nombre de tu negocio.'],
  ['¿Hay contrato o permanencia?', 'No. En el plan mensual puedes cancelar cuando quieras.'],
  ['¿Qué pasa si cancelo el plan mensual?', 'Tu dominio sigue siendo tuyo y la página deja de estar publicada. Si quieres quedarte con ella, la compras por el precio de Página Propia de tu nivel.'],
  ['¿Cuánto tardan?', '5, 10 o 20 días hábiles según el plan, contados desde que nos envías tu contenido.'],
  ['¿Puedo cambiar cosas después?', 'Sí. Cada plan incluye cambios al mes, y en el Avanzado tienes un panel para hacerlos tú mismo.'],
  ['¿Me garantizan el primer lugar en Google?', 'Nadie puede garantizarlo. Lo que sí hacemos es dejar tu página preparada para Google, rápida y con SEO local, y medimos cómo te encuentran.'],
  ['¿Qué es Página Propia?', 'Pagas una vez, en dos partes, y tu página, tu código y tu dominio quedan a tu nombre para siempre.'],
  ['¿Tengo que pagar algo más en Página Propia?', 'Solo tu dominio desde el segundo año (unos $1 al mes). En la Avanzada, también la base de datos y la IA si las usas.']
];
const webFaqLd = (() => { for (const m of webHtml.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) { try { const j = JSON.parse(m[1]); if (j['@type'] === 'FAQPage') return j.mainEntity; } catch (e) { /* JSON inválido: falla abajo */ } } return []; })();
ok((webMain.match(/<details class="web-faq\b/g) || []).length === 8 && webFaqLd.length === 8, 'páginas web: 8 preguntas (details.web-faq) y 8 en el FAQPage');
WEB_FAQ.forEach(([q, a], i) => ok(webSec('preguntas').includes(q + ' ' + a) && webFaqLd[i] && webFaqLd[i].name === q && webFaqLd[i].acceptedAnswer.text === a, `páginas web: pregunta ${i + 1} exacta en la página y en el FAQPage («${q}»)`));
ok(webSec('cierre').includes('Tu negocio merece una página que trabaje por ti.') && /Quiero mi página/.test(webSec('cierre')), 'páginas web: cierre «Tu negocio merece una página que trabaje por ti.» con «Quiero mi página»');
const webWa = [...webHtml.matchAll(/https:\/\/wa\.me\/(\d+)\?text=([^"'\s]+)/g)].map(m => [m[1], decodeURIComponent(m[2])]);
ok(webWa.length >= 8 && webWa.every(([num, t]) => num === '584244125386' && /^Hola F&V/.test(t) && !/\$|\d+,\d\d|USD|Bs/.test(t)), 'páginas web: los WhatsApp van al 584244125386, empiezan con «Hola F&V» y no llevan precios');
ok(webWa.some(([, t]) => t === 'Hola F&V, quiero mi página web') && webWa.some(([, t]) => t === 'Hola F&V, me interesa el plan Básico mensual de página web') && webWa.some(([, t]) => t === 'Hola F&V, me interesa la Página Propia Intermedia'), 'páginas web: mensajes de WhatsApp del encargo (general, por plan y por Página Propia)');
const webEfectos = ['hero', 'formas', 'funciones', 'conviene', 'proceso'];
const posScript = s => webHtml.indexOf(`src="/assets/${s}.js"`);
webEfectos.forEach(k => {
  const ruta = path.join(RAIZ, `assets/paginas-web-${k}.js`);
  const js = fs.existsSync(ruta) ? fs.readFileSync(ruta, 'utf8') : '';
  ok(js.length > 500 && webHtml.includes(`<!-- web:${k}:inicio -->`) && webHtml.includes(`<!-- web:${k}:fin -->`) && posScript(`paginas-web-${k}`) > posScript('paginas-web') && /\bWEB\.reducir\b|\bW\.reducir\b|prefers-reduced-motion/.test(js), `páginas web: el efecto «${k}» tiene su punto de montaje, su JS (no un stub) cargado tras el núcleo y respeta reduced-motion`);
  ok(cssTw.includes(`/* ===== paginas-web:${k} ===== */`) && cssTw.includes(`/* ===== /paginas-web:${k} ===== */`), `páginas web: el CSS del efecto «${k}» va en su bloque`);
});
ok(posScript('bcv') > -1 && posScript('bcv') < posScript('paginas-web') && /window\.WEB\s*=/.test(webJs), 'páginas web: bcv.js se carga antes del núcleo y el núcleo expone window.WEB');
ok(webEfectos.every(k => new RegExp(`<script defer src="/assets/paginas-web-${k}\\.js"></script>`).test(webHtml)), 'páginas web: los 5 efectos se cargan con defer');
ok(/class="web-mesh/.test(webMain) && /web-vidrio/.test(webMain) && /data-paralaje="/.test(webMain) && /prefers-reduced-motion/.test(cssTw.slice(cssTw.indexOf('/* ===== paginas-web:base ===== */'))) && /matchMedia\([^)]*prefers-reduced-motion/.test(webJs), 'páginas web: malla (web-mesh), vidrio (web-vidrio), paralaje y prefers-reduced-motion en CSS y JS');
ok((webTxt.match(/Ejemplo ilustrativo/g) || []).length >= 1, 'páginas web: la maqueta del hero dice «Ejemplo ilustrativo»');
ok(/node tests\/paginas-web\.test\.js/.test(JSON.parse(fs.readFileSync(path.join(RAIZ, 'package.json'), 'utf8')).scripts.test), 'páginas web: la prueba de la calculadora corre en npm test');
ok(fs.readdirSync(path.join(RAIZ, 'triangular')).every(f => !/^_prueba/.test(f)), 'páginas web: no quedan páginas de prueba _prueba-*.html');

// ------------------------------------------------------------ rediseño del inicio (24 nov 2026): integración de los 9 efectos
// Cada efecto vive en assets/inicio-<clave>.js (defer, tras el núcleo window.INI), monta su HTML entre <!-- ini:<clave>:inicio/fin --> y
// su CSS en /* ===== inicio:<clave> ===== */. Estas pruebas cuidan el orden de carga, la marca (degradados con blanco en medio),
// la regla de cero precios (también en lo que escribe el JS), reduced-motion y que no queden páginas de prueba.
const sinComentariosJs = s => s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:\'"])\/\/[^\n]*/g, '$1');
const efJs = Object.fromEntries(efectosIni.map(k => [k, fs.readFileSync(path.join(RAIZ, 'assets/inicio-' + k + '.js'), 'utf8')]));
const bloqueCss = k => { const a = cssTw.indexOf('/* ===== inicio:' + k + ' ===== */'), b = cssTw.indexOf('/* ===== /inicio:' + k + ' ===== */'); return a > -1 && b > a ? cssTw.slice(a, b) : ''; };
const montaje = k => (html.match(new RegExp('<!-- ini:' + k + ':inicio -->([\\s\\S]*?)<!-- ini:' + k + ':fin -->')) || [, ''])[1];
const ordenScripts = ['inicio', 'inicio-efectos', ...efectosIni.map(k => 'inicio-' + k), 'bcv'].map(posIni);
ok(ordenScripts.every((p, i) => p > -1 && (i === 0 || p > ordenScripts[i - 1])), 'rediseño: scripts con defer en orden inicio.js → inicio-efectos.js → los 9 efectos → bcv.js');
efectosIni.forEach(k => {
  const j = efJs[k], codigo = sinComentariosJs(j);
  ok(j.length > 1500 && /window\.INI/.test(j) && /INI\.(reducido|reducir)\b|prefers-reduced-motion/.test(j), `rediseño: «${k}» es un efecto real (no un stub), usa window.INI y respeta reduced-motion`);
  ok(!/localStorage|sessionStorage|document\.cookie|fetch\(|XMLHttpRequest|sendBeacon/.test(j), `rediseño: «${k}» no guarda datos ni llama a servidores`);
  ok(bloqueCss(k).length > 800 && /prefers-reduced-motion/.test(bloqueCss(k)), `rediseño: el CSS de «${k}» está en su bloque y tiene su regla de prefers-reduced-motion`);
  if (k !== 'brecha') ok(!/USD|Bs\.|\$\s?\d|(?<![A-Za-z])desde\s+\$|Express|10x/.test(codigo), `rediseño: «${k}» no escribe precios ni textos prohibidos desde el JS`);
});
['hero', 'marcas', 'como', 'caos', 'brecha', 'faqcierre', 'guia'].forEach(k => ok(montaje(k).trim().length > 100, `rediseño: el montaje «${k}» trae su HTML`));
ok(montaje('lineas').trim() === '' && montaje('manifiesto').trim() === '', 'rediseño: los montajes «lineas» y «manifiesto» quedan vacíos (sus capas las crea el JS dentro de las figuras)');
const VIDRIO_RE = /\bini-vidrio\b|\bini-pasos-lista\b|\bini-faq-lista\b|class="ini-ps"/;
secciones.forEach(s => ok(/<div class="ini-mesh[^"]*" aria-hidden="true">/.test(s.html) && /data-paralaje="-?[\d.]+"/.test(s.html) && VIDRIO_RE.test(s.html), `rediseño: #${s.id} tiene malla, paralaje y vidrio`));
const efCss = efectosIni.map(bloqueCss).join('\n') + bloqueCss('base');
const dosParadas = /(?:linear|radial|conic)-gradient\([^;{}]*?(?:#00FFFF|#0ff\b|rgba?\(0,\s*255,\s*255[^)]*\))\s*(?:\d+%\s*)?,\s*(?:#FF8C00|rgba?\(255,\s*140,\s*0[^)]*\))/i;
ok(!dosParadas.test(efCss) && !efectosIni.some(k => dosParadas.test(efJs[k])), 'rediseño: ningún degradado cian→naranja directo en el CSS ni en el JS de los efectos (blanco en medio)');
const svgGrads = [...main.matchAll(/<(linear|radial)Gradient\b[^>]*>([\s\S]*?)<\/\1Gradient>/g)].map(m => [...m[2].matchAll(/stop-color="([^"]+)"/g)].map(x => x[1].toUpperCase()));
ok(svgGrads.length >= 4 && svgGrads.every(c => !c.some((x, i) => x === '#00FFFF' && c[i + 1] === '#FF8C00')), 'rediseño: los degradados SVG del inicio no pasan de cian a naranja sin blanco');
const heroMont = texto(montaje('hero'));
ok((heroMont.match(/Ejemplo ilustrativo/g) || []).length >= 3 && !/\d/.test(heroMont), 'rediseño: las tarjetas del hero dicen «Ejemplo ilustrativo» y no traen cifras en el HTML (la tasa en vivo la escribe el JS)');
ok(/data-hr-tasa hidden/.test(montaje('hero')) && /live/.test(efJs.hero), 'rediseño: la tarjeta de la tasa BCV queda oculta hasta que llegue la tasa en vivo');
ok(/Ejemplo ilustrativo con datos ficticios\./.test(texto(caos)) && /role="slider"[^>]*tabindex="0"/.test(montaje('caos')) && /ArrowLeft|ArrowRight/.test(efJs.caos) && /data-caos-env hidden/.test(montaje('caos')), 'rediseño: comparador antes/después accesible por teclado, oculto sin JS y con el rótulo de datos ficticios');
ok(/data-sin-precios-excepcion="brecha"/.test(sec('brecha')) && sec('brecha').includes('data-brecha-graf') && !/\$|Bs\.|%/.test(texto(montaje('brecha'))) && /FV_BRECHA/.test(efJs.brecha), 'rediseño: la mini gráfica de la brecha usa la fórmula de FV_BRECHA y su HTML no trae montos');
ok(/href="#delta-app"[^>]*>[\s\S]*?<polygon points="12,3\.5 21,19\.5 3,19\.5"/.test(montaje('guia')) && (montaje('guia').match(/data-guia="/g) || []).length === secciones.length, 'rediseño: la guía tiene un paso por sección y la franja Delta va con el triángulo ▲');
ok(/href="\/triangular\/delta"/.test(delta) && !/href="\/delta-app"/.test(main), 'rediseño: Delta lleva a /triangular/delta y el inicio ya no enlaza a /delta-app');
ok(!/PowerShell/i.test(html) && !/#012456/i.test(html), 'rediseño: sin «PowerShell» ni el azul de Windows en el inicio');
ok((html.match(/<p class="ps-l ps-ok"><span class="ps-v">✔<\/span> /g) || []).length === 3, 'rediseño: las 3 líneas ✔ de la consola llevan la marca en cian (.ps-v)');
// 24 nov 2026 (revisión): la guía pasa de >= 1024 px a >= 1360 px (entre 1024 y 1360 pisaba el borde de las tarjetas) y solo se muestra con JS.
ok(/\.ini-guia\.is-oculta \{[^}]*visibility: hidden/.test(cssTw) && /min-width: 1360px\) and \(min-height: 640px\) \{\s*html\.ini-fx \.ini-guia \{\s*display: block/.test(bloqueCss('guia')) && efJs.guia.includes("matchMedia('(min-width: 1360px) and (min-height: 640px)')"), 'rediseño: la guía solo se muestra con JS en escritorio ancho (>= 1360 px) y se esconde (portada y pie)');
ok(!/getBoundingClientRect|offsetHeight|scrollHeight/.test(efJs.guia.slice(efJs.guia.indexOf('function actualizar'), efJs.guia.indexOf('function marcar'))), 'rediseño: la guía no mide el diseño en cada cuadro de scroll (usa las medidas en caché)');
// 24 nov 2026 (revisión adversarial): arreglos de diseño, accesibilidad y rendimiento
ok(/@media \(min-width: 1024px\) \{ \.ini-portada \.ini-h1, \.ini-portada \.ini-sub, \.ini-portada \.ini-desc \{ max-width: min\(760px, 58%\); \} \}/.test(cssTw) && /@media \(min-width: 1024px\) and \(max-width: 1279px\) \{ \.ini-portada \.ini-hexgiro \{ left: 84%; width: 560px/.test(cssTw), 'revisión: en escritorio el texto del hero no pasa del borde izquierdo del aro (58 %; entre 1024 y 1279 px el aro va al 84 % y mide 560 px)');
ok(/@media \(max-width: 639px\) \{[^}]*\.ini-hr-cartas \{ display: none; \}/.test(cssTw) || /@media \(max-width: 639px\) \{ \.ini-hr-icono, \.ini-hr-cartas \{ display: none; \} \}/.test(cssTw), 'revisión: en el celular las tarjetas del hero no tapan el aro');
ok(/\.ini-lin-fx \.ini-lado-svg:focus-visible \.vis, [^{]*\{ opacity: 1 !important; \}/.test(cssTw) && /addEventListener\('focusin'/.test(efJs.lineas), 'revisión: el lado de #lineas con foco de teclado siempre se ve y la entrada empieza al recibir el foco');
ok(/@media \(max-width: 1023px\), \(pointer: coarse\) \{\s*\.ini-vidrio, [^{]*\{ -webkit-backdrop-filter: none; backdrop-filter: none; \}/.test(cssTw) && !/\.ini-mancha \{[^}]*will-change/.test(cssTw) && !/\.ini-lin-m \{[^}]*will-change/.test(cssTw), 'revisión: sin backdrop-filter en celular y táctil, y sin will-change permanente en las manchas de la malla');
ok(/tVacia = setTimeout\(vaciar, 350\)/.test(js) && /function vaciar\(\)/.test(js) && /function libre\(id\)/.test(js) && /puede\(\) && libre\(id\)/.test(js), 'revisión: el aviso de Luci no se ve vacío al irse y no sale encima de figuras, enlaces, botones ni campos');
ok(/<span class="ini-ps-rotulo">Ejemplo ilustrativo<\/span>/.test(manifiesto), 'revisión: la consola del manifiesto lleva el rótulo visible «Ejemplo ilustrativo»');
ok(!/logo-mark-hex\.png/.test(main) && !/logo-mark-hex\.png/.test(efJs.como) && /assets\/logo-hex-hex-256\.webp/.test(main) && fs.existsSync(path.join(RAIZ, 'assets/logo-hex-hex-256.webp')), 'revisión: el inicio usa la luciérnaga en WebP y el sello del cierre un aro pequeño (256 px)');
ok(/enVista = es\[0\]\.isIntersecting/.test(html) && /visibilitychange/.test(html) && /corriendo = false; return;/.test(html), 'revisión: las partículas del hero se detienen fuera de pantalla y la estela del cursor se detiene cuando alcanza al mouse');
ok(fs.readdirSync(RAIZ).every(f => !/^_prueba-ini-.*\.html$/.test(f)), 'rediseño: no quedan páginas de prueba _prueba-ini-*.html en la raíz');
ok(Buffer.byteLength(js) < 25 * 1024 && efectosIni.every(k => Buffer.byteLength(efJs[k]) < 16 * 1024), 'rediseño: inicio.js < 25 KB y cada efecto < 16 KB');

console.log(`inicio: ${n} comprobaciones${process.exitCode ? ' (CON FALLAS)' : ' correctas'}`);
