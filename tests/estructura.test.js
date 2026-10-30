// Pruebas del encabezado y el pie compartidos: node tests/estructura.test.js
// Cada página no legacy tiene sus marcadores; su encabezado y su pie son EXACTAMENTE los de partials/ renderizados;
// la navegación y los desplegables salen del catálogo; no aparecen los nombres de línea; el build es idempotente.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const B = require('../scripts/build-html.js');

const RAIZ = B.RAIZ;
let n = 0;
function ok(c, m) { n++; if (!c) { console.error('✗ ' + m); process.exitCode = 1; } }
const unix = s => s.replace(/\r\n/g, '\n');

const cat = B.cargarCatalogo();
const paginas = B.listarPaginas();
ok(paginas.length >= 15, `se esperaban al menos 15 páginas no legacy (hay ${paginas.length})`);
ok(!paginas.some(p => B.LEGACY.includes(p) || B.SALTAR.includes(p)), 'listarPaginas no incluye páginas legacy ni demos');

const RE_H = /<!-- header:inicio([^>]*?)-->\n([\s\S]*?)\n<!-- header:fin -->/;
const RE_F = /<!-- footer:inicio\s*-->\n([\s\S]*?)\n<!-- footer:fin -->/;
const TIPOS_VISIBLES = [];
const PROHIBIDO = /L[ií]nea (Hexagonal|Triangular)/;
const categorias = tipo => cat.tipos[tipo].categorias.map(c => c.id);

function enlaces(html, claseRe) {
  const r = [];
  const re = /<a href="([^"]*)" class="([^"]*)"[^>]*>/g;
  let m;
  while ((m = re.exec(html))) if (claseRe.test(m[2])) r.push(m[1]);
  return r;
}

for (const archivo of paginas) {
  const html = unix(fs.readFileSync(path.join(RAIZ, archivo), 'utf8'));
  const mh = html.match(RE_H);
  const mf = html.match(RE_F);
  ok(!!mh, `${archivo}: tiene los marcadores header:inicio / header:fin`);
  ok(!!mf, `${archivo}: tiene los marcadores footer:inicio / footer:fin`);
  if (!mh || !mf) continue;
  ok((html.match(/<!-- header:inicio/g) || []).length === 1 && (html.match(/<!-- footer:inicio/g) || []).length === 1, `${archivo}: un solo encabezado y un solo pie`);

  // Exactamente el parcial renderizado
  const attrs = B.leerAtributos(mh[1]);
  ok(B.ACTIVOS.includes(attrs.activo), `${archivo}: activo="${attrs.activo}" es válido`);
  const esperadoH = B.renderHeader({ activo: attrs.activo, hijo: attrs.hijo === 'si', wa: attrs.wa, archivo }, cat);
  ok(mh[2] === esperadoH, `${archivo}: el encabezado es exactamente el del parcial`);
  ok(mf[1] === B.renderFooter(cat), `${archivo}: el pie es exactamente el del parcial`);

  const cab = mh[2];
  const pie = mf[1];

  // Navegación principal
  const nav = (cab.match(/<nav class="menu-escritorio[^>]*aria-label="Principal">([\s\S]*?)<\/nav>/) || [])[1] || '';
  ok(!!nav, `${archivo}: tiene <nav aria-label="Principal">`);
  const principales = [];
  const re = /<a href="([^"]*)" class="([^"]*)"[^>]*>([^<]+)<\/a>/g;
  let m;
  while ((m = re.exec(nav))) if (!/menu-enlace"|menu-todos/.test(m[2] + '"')) principales.push(m[3].trim());
  ok(JSON.stringify(principales) === JSON.stringify(['Inicio', 'Hexagonal', 'Triangular', 'Nosotros', 'Contacto']),
    `${archivo}: la navegación principal es Inicio, Hexagonal, Triangular, Nosotros, Contacto (Servicios y Productos ocultos desde el 29 oct 2026) (hay ${principales.join(', ')})`);
  ok(!principales.includes('Software'), `${archivo}: «Software» no va suelto en la navegación`);

  // Desplegables = categorías del catálogo, en orden (escritorio, móvil y pie)
  // Servicios y Productos están ocultos del menú y del pie (29 oct 2026): hay que volver a poner TIPOS_VISIBLES = ['servicio', 'producto'] al reconstruirlos
  for (const tipo of TIPOS_VISIBLES) {
    const ruta = cat.tipos[tipo].ruta;
    const esperado = categorias(tipo).map(id => `${ruta}#${id}`);
    const panel = (cab.match(new RegExp(`<div id="menu-${ruta.slice(1)}" class="menu-panel">([\\s\\S]*?)\\n          </div>`)) || [])[1] || '';
    ok(JSON.stringify(enlaces(panel, /\bmenu-enlace\b/)) === JSON.stringify(esperado), `${archivo}: el desplegable de ${ruta} lista exactamente las categorías del catálogo`);
    ok(enlaces(panel, /\bmenu-todos\b/).join() === ruta, `${archivo}: el desplegable de ${ruta} termina con «Ver todos»`);
    const movil = (cab.match(new RegExp(`<div id="movil-${ruta.slice(1)}" class="movil-sub">([\\s\\S]*?)\\n          </div>`)) || [])[1] || '';
    ok(JSON.stringify(enlaces(movil, /\bmovil-enlace\b(?! movil-todos)/)) === JSON.stringify(esperado), `${archivo}: el acordeón móvil de ${ruta} lista las mismas categorías`);
    const columna = pie.split('<h3').find(t => t.includes(`>${cat.tipos[tipo].titulo}</h3>`)) || '';
    esperado.forEach(h => ok(columna.includes(`href="${h}"`), `${archivo}: el pie lista ${h}`));
  }

  // Botones disclosure: enlace + botón con aria-expanded, aria-controls y aria-label
  for (const tipo of TIPOS_VISIBLES) {
    const t = cat.tipos[tipo];
    const id = t.ruta.slice(1);
    ok(cab.includes(`<a href="${t.ruta}" class="menu-enlace-principal"`), `${archivo}: ${t.titulo} es un enlace a ${t.ruta}`);
    ok(cab.includes(`aria-expanded="false" aria-controls="menu-${id}" aria-label="Abrir categorías de ${t.titulo}"`), `${archivo}: el botón de ${t.titulo} tiene aria-expanded, aria-controls y aria-label`);
    ok(!/role="menu"/.test(cab), `${archivo}: no usa role="menu"`);
  }
  // Servicios va antes que Productos y la forma hexagonal antes que la triangular
  if (TIPOS_VISIBLES.length === 2) ok(nav.indexOf('menu-servicios') < nav.indexOf('menu-productos'), `${archivo}: Servicios va antes que Productos`);
  else ok(!/menu-servicios|menu-productos|movil-servicios|movil-productos/.test(cab), `${archivo}: el menú no trae Servicios ni Productos`);
  (cab.match(/<span class="menu-formas"[^>]*>(.*?)<\/span><\/span>/g) || []).forEach(f => ok(!/nav-tri[\s\S]*nav-hex/.test(f), `${archivo}: ⬡ antes que ▲ en las formas del menú`));

  // Estado activo
  const paginasActual = (cab.match(/<nav class="menu-escritorio[\s\S]*?<\/nav>/) || [''])[0].match(/aria-current="page"/g) || [];
  const hijos = (cab.match(/<nav class="menu-escritorio[\s\S]*?<\/nav>/) || [''])[0].match(/aria-current="true"/g) || [];
  if (attrs.activo === 'ninguno' || (!TIPOS_VISIBLES.length && /^(servicios|productos)$/.test(attrs.activo))) ok(paginasActual.length === 0 && hijos.length === 0, `${archivo}: activo="ninguno" no marca nada`);
  else if (attrs.hijo === 'si' || /^(servicios|productos)\//.test(archivo)) ok(hijos.length === 1 && paginasActual.length === 0, `${archivo}: el padre de un detalle lleva aria-current="true"`);
  else ok(paginasActual.length === 1 && hijos.length === 0, `${archivo}: la página activa lleva aria-current="page"`);

  // Reglas de marca
  ok(!PROHIBIDO.test(cab), `${archivo}: el encabezado no nombra «Línea Hexagonal/Triangular»`);
  ok(!PROHIBIDO.test(pie), `${archivo}: el pie no nombra «Línea Hexagonal/Triangular»`);
  ok(!PROHIBIDO.test(decodeURIComponent((cab.match(/wa\.me\/\d+\?text=([^"]*)/) || [, ''])[1])), `${archivo}: el mensaje de WhatsApp del encabezado no nombra la línea`);
  ok(/data-cta="header" data-evento="header_whatsapp"/.test(cab) && /id="search-trigger"/.test(cab) && /id="menu-btn"/.test(cab) && /id="mobile-menu"/.test(cab), `${archivo}: conserva los ids y atributos de medición y búsqueda`);
  ok(!/Express/i.test(cab + pie), `${archivo}: «Express» no existe`);

  // Un solo script de menú y sin el bloque inline viejo
  ok((html.match(/<script src="\/assets\/menu\.js" defer><\/script>/g) || []).length === 1, `${archivo}: carga assets/menu.js una sola vez`);
  ok(!/getElementById\('menu-btn'\)/.test(html), `${archivo}: ya no trae el menú móvil escrito dentro de la página`);

  // Áreas táctiles del pie
  const enlacesPie = pie.match(/<li><a [^>]*>/g) || [];
  enlacesPie.forEach(a => ok(/min-h-\[44px\]/.test(a), `${archivo}: enlace del pie con min-h-[44px]: ${a.slice(0, 60)}`));
}

// El build es idempotente: --check no encuentra cambios
const r = spawnSync(process.execPath, [path.join(RAIZ, 'scripts/build-html.js'), '--check'], { encoding: 'utf8' });
ok(r.status === 0, 'node scripts/build-html.js --check no debe encontrar cambios: ' + (r.stderr || r.stdout).trim());

// Las páginas legacy y la demo no llevan marcadores (el build no las toca)
for (const f of [...B.LEGACY, ...B.SALTAR]) {
  const p = path.join(RAIZ, f);
  if (fs.existsSync(p)) ok(!/<!-- header:inicio/.test(fs.readFileSync(p, 'utf8')), `${f}: es legacy o demo y no debe llevar marcadores`);
}

console.log(`estructura: ${n} comprobaciones${process.exitCode ? ' (CON FALLAS)' : ' correctas'}`);
