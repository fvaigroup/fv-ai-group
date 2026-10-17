// Metadatos y áreas táctiles de la estructura compartida: node tests/meta.test.js
// Títulos y descripciones con largo útil para buscadores; mensajes de WhatsApp que empiezan con «Hola F&V»;
// el encabezado y el pie cumplen 44 px; las secciones de detalle comparten borde izquierdo.
const fs = require('fs');
const path = require('path');
const RAIZ = path.resolve(__dirname, '..');
let n = 0;
function ok(c, m) { n++; if (!c) { console.error('✗ ' + m); process.exitCode = 1; } }
const leer = f => fs.readFileSync(path.join(RAIZ, f), 'utf8');
const dec = s => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"');

const LEGACY = ['demo-catalogo']; // demostración con diseño propio
const EXENTAS = ['404.html', 'privacidad.html', 'terminos.html']; // no se indexan o son texto legal
const vivas = fs.readdirSync(RAIZ).filter(f => f.endsWith('.html')).concat(
  fs.readdirSync(path.join(RAIZ, 'servicios')).map(f => 'servicios/' + f),
  fs.readdirSync(path.join(RAIZ, 'productos')).map(f => 'productos/' + f)).filter(f => !LEGACY.includes(f.replace('.html', '')));

const titulos = {};
for (const f of vivas) {
  const h = leer(f);
  const t = dec((h.match(/<title>([^<]*)<\/title>/) || [])[1] || '');
  ok(t.length > 0, f + ': tiene <title>');
  // Lo generado y el inicio: máximo 66. Las páginas anteriores a la reestructuración (calculadoras, casos, club, contacto…): máximo 75.
  const estricta = f === 'index.html' || /^(servicios|productos)(\/|\.html)/.test(f);
  ok(t.length <= (estricta ? 66 : 75), f + ': el título mide ' + t.length + ' (máximo ' + (estricta ? 66 : 75) + '): ' + t);
  (titulos[t] = titulos[t] || []).push(f);
  if (!EXENTAS.includes(f)) {
    const d = dec((h.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
    ok(d.length >= 60 && d.length <= 165, f + ': la descripción mide ' + d.length + ' (de 60 a 165)');
  }
}
for (const [t, fs_] of Object.entries(titulos)) ok(fs_.length === 1, 'título repetido «' + t + '» en ' + fs_.join(', '));

// Mensajes de WhatsApp: empiezan con «Hola F&V» (los armados por JavaScript con ${…} se omiten)
for (const f of vivas) {
  for (const m of leer(f).matchAll(/https:\/\/wa\.me\/\d+\?text=([^"'\s<]+)/g)) {
    if (m[1].includes('${')) continue;
    let t = ''; try { t = decodeURIComponent(m[1].replace(/&amp;/g, '&')); } catch (e) { ok(false, f + ': mensaje de WhatsApp mal codificado'); continue; }
    ok(/^Hola F&V/.test(t), f + ': el mensaje de WhatsApp debe empezar con «Hola F&V»: «' + t.slice(0, 60) + '»');
  }
}

// Áreas táctiles: botón de WhatsApp del encabezado y enlaces del pie a 44 px
const enc = leer('partials/header.html');
ok(/data-evento="header_whatsapp"[^>]*min-h-\[44px\]|min-h-\[44px\][^>]*data-evento="header_whatsapp"/.test(enc.split('\n').filter(l => /data-cta="header"/.test(l)).join('\n')), 'el botón de WhatsApp del encabezado de escritorio mide al menos 44 px');
const pie = leer('partials/footer.html');
const enlacesPie = (pie.match(/<a [^>]*>/g) || []).filter(a => /href="\//.test(a) && !/href="\/"/.test(a) && !/mailto|wa\.me|instagram/.test(a));
enlacesPie.forEach(a => ok(/min-h-\[44px\]/.test(a) && /min-w-\[44px\]/.test(a), 'enlace del pie sin 44 px de alto y de ancho: ' + a.slice(0, 80)));

// Detalle: todas las secciones comparten el mismo contenedor (mismo borde izquierdo)
for (const f of vivas.filter(f => /^(servicios|productos)\//.test(f))) {
  const secs = leer(f).split(/(?=<section[^>]*class="det-seccion)/).filter(s => s.startsWith('<section'));
  secs.forEach(s => ok(/^<section[^>]*>\s*<div class="max-w-6xl /.test(s), f + ': una sección de detalle no usa el contenedor común max-w-6xl'));
}
console.log('meta: ' + n + ' comprobaciones' + (process.exitCode ? ' (CON FALLAS)' : ' correctas'));
