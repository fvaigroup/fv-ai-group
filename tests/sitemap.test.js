// Pruebas del sitemap y de robots.txt: node tests/sitemap.test.js
//   - sitemap.xml está al día respecto al generador (scripts/catalogo/sitemap.js);
//   - todas las URLs existen como archivo vivo; ninguna es legacy, está redirigida o está excluida;
//   - no falta ninguna página viva (salvo 404, privacidad, términos y demo-catalogo);
//   - robots.txt permite el sitio, bloquea /api/, /data/ y /partials/ y apunta al sitemap.
const fs = require('fs');
const path = require('path');
const B = require('../scripts/build-html.js');
const S = require('../scripts/catalogo/sitemap.js');

const RAIZ = B.RAIZ;
let n = 0;
function ok(c, m) { n++; if (!c) { console.error('✗ ' + m); process.exitCode = 1; } }
const leer = rel => fs.readFileSync(path.join(RAIZ, rel), 'utf8').replace(/\r\n/g, '\n');

const actual = leer('sitemap.xml');
ok(actual === S.xml(), 'sitemap.xml está desactualizado: corra node scripts/catalogo/sitemap.js');
ok(S.xml() === S.xml(), 'el generador es determinista');
ok(!S.sincronizar({ check: true }), 'sincronizar --check no encuentra diferencias');

const locs = [...actual.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
ok(locs.length > 0, 'el sitemap tiene URLs');
ok(new Set(locs).size === locs.length, 'no hay URLs repetidas');

const fecha = S.fechaActualizacion();
const lastmods = [...actual.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map(m => m[1]);
ok(lastmods.length === locs.length && lastmods.every(f => f === fecha), `todas las URLs llevan lastmod ${fecha} (fecha_actualizacion del catálogo base)`);
const prioridades = {};
for (const m of actual.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>[^<]+<\/lastmod>\s*<changefreq>[^<]+<\/changefreq>\s*<priority>([^<]+)<\/priority>/g)) prioridades[m[1].replace(S.DOMINIO, '') || '/'] = m[2];
ok(prioridades['/'] === '1.0', 'el inicio tiene prioridad 1.0');
ok(prioridades['/servicios'] === '0.9' && prioridades['/productos'] === '0.9', '/servicios y /productos tienen prioridad 0.9');
ok(prioridades['/servicios/diagnostico'] === '0.7' && prioridades['/productos/plan-arranque'] === '0.7', 'los detalles tienen prioridad 0.7');

const vercel = JSON.parse(leer('vercel.json'));
const origenes = new Set((vercel.redirects || []).flatMap(r => [r.source, r.source.replace(/\.html$/, '')]));
const archivosEnSitemap = new Set();
for (const loc of locs) {
  ok(loc.startsWith(S.DOMINIO), `${loc}: debe empezar por ${S.DOMINIO}`);
  const ruta = loc.slice(S.DOMINIO.length) || '/';
  ok(!/[#?]/.test(ruta), `${loc}: sin ancla ni consulta`);
  const rel = ruta === '/' ? 'index.html' : ruta.replace(/^\//, '') + '.html';
  ok(fs.existsSync(path.join(RAIZ, rel)), `${loc}: no existe el archivo ${rel}`);
  ok(!B.LEGACY.includes(rel), `${loc}: es una página legacy`);
  ok(!S.EXCLUIDAS.includes(rel), `${loc}: es una página excluida`);
  ok(!origenes.has(ruta), `${loc}: tiene una redirección en vercel.json`);
  archivosEnSitemap.add(rel);
}

// Ninguna página viva queda fuera
const vivas = fs.readdirSync(RAIZ).filter(f => /\.html$/.test(f));
for (const d of ['servicios', 'productos']) {
  for (const f of fs.readdirSync(path.join(RAIZ, d)).filter(x => /\.html$/.test(x))) vivas.push(`${d}/${f}`);
}
for (const f of vivas) {
  if (B.LEGACY.includes(f) || S.EXCLUIDAS.includes(f)) { ok(!archivosEnSitemap.has(f), `${f}: no debe estar en el sitemap`); continue; }
  ok(archivosEnSitemap.has(f), `${f}: es una página viva y falta en el sitemap (agréguela a PAGINAS_ESTATICAS en scripts/catalogo/sitemap.js)`);
}
ok(S.EXCLUIDAS.every(f => fs.existsSync(path.join(RAIZ, f))), 'las páginas excluidas existen (si se borra una, quítela de EXCLUIDAS)');
ok(vivas.filter(f => /^(servicios|productos)\//.test(f)).length === 23, 'hay 23 páginas de detalle generadas');

// robots.txt
const robots = leer('robots.txt');
ok(/^User-agent: \*$/m.test(robots), 'robots.txt: User-agent: *');
ok(/^Allow: \/$/m.test(robots), 'robots.txt: Allow: /');
for (const d of ['/api/', '/data/', '/partials/']) ok(new RegExp('^Disallow: ' + d + '$', 'm').test(robots), `robots.txt: Disallow: ${d}`);
ok(/^Sitemap: https:\/\/www\.fvaigroup\.com\/sitemap\.xml$/m.test(robots), 'robots.txt: línea Sitemap');

console.log(`sitemap: ${n} comprobaciones${process.exitCode ? ' (CON FALLAS)' : ' correctas'}`);
