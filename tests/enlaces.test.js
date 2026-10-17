// Pruebas de enlaces internos: node tests/enlaces.test.js
// Rastrea todos los href y src internos de las páginas no legacy y comprueba que el destino existe
// (cleanUrls: /x -> x.html, o x/index.html), que el ancla existe en la página destino cuando es estática,
// o que hay una redirección en vercel.json. Una redirección que tapa una página existente es un error
// (en Vercel las redirecciones se aplican antes que los archivos).
const fs = require('fs');
const path = require('path');
const B = require('../scripts/build-html.js');

const RAIZ = B.RAIZ;
let n = 0;
let pendientesTolerados = 0;
function ok(c, m) { n++; if (!c) { console.error('✗ ' + m); process.exitCode = 1; } }

// PENDIENTES_FASE: rutas que aún no existen y se toleran. Ya está vacía: las páginas de /servicios, /productos y sus detalles
// las genera el build desde data/catalogo.json y todas se comprueban con rigor (archivo y ancla).
const PENDIENTES_FASE = [];

// Rutas que sirve la plataforma (Vercel Analytics), no el repositorio
const DE_PLATAFORMA = [/^\/_vercel\//];

// Archivos que genera el build (no están en el repositorio hasta correr npm run build)
const GENERADOS = ['assets/css/tailwind.css'];

const vercel = JSON.parse(fs.readFileSync(path.join(RAIZ, 'vercel.json'), 'utf8'));
const redirecciones = new Map();
for (const r of vercel.redirects || []) redirecciones.set(r.source.replace(/\/$/, '') || '/', r.destination);

function archivoDe(ruta) {
  // ruta: absoluta y sin ancla ni consulta. Devuelve el archivo (relativo a la raíz) o null.
  const rel = ruta.replace(/^\//, '');
  const candidatos = rel === '' ? ['index.html'] : [rel, rel + '.html', rel.replace(/\/$/, '') + '/index.html'];
  for (const c of candidatos) {
    const p = path.join(RAIZ, c);
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return c;
  }
  return GENERADOS.includes(rel) ? '(generado)' : null;
}

function quitarCodigo(html) {
  return html.replace(/<!--[\s\S]*?-->/g, '').replace(/<script\b(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/gi, '<script></script>').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
}

const cacheIds = new Map();
function idsDe(archivo) {
  if (!cacheIds.has(archivo)) {
    const html = fs.readFileSync(path.join(RAIZ, archivo), 'utf8');
    const ids = new Set();
    html.replace(/\b(?:id|name)="([^"]+)"/g, (m, id) => { ids.add(id); return m; });
    cacheIds.set(archivo, ids);
  }
  return cacheIds.get(archivo);
}

function pendiente(rutaAbs) { return PENDIENTES_FASE.some(re => re.test(rutaAbs)); }

function resolver(paginaArchivo, valor) {
  // Devuelve { ruta (absoluta sin ancla), ancla } o null si el enlace no es interno
  if (/^(https?:|mailto:|tel:|javascript:|data:|\/\/)/i.test(valor) || valor === '') return null;
  let [sinAncla, ...resto] = valor.split('#');
  const ancla = resto.join('#');
  sinAncla = sinAncla.split('?')[0];
  if (sinAncla === '') return { ruta: null, ancla };
  if (sinAncla.startsWith('/')) return { ruta: sinAncla, ancla };
  // relativa: se resuelve contra la carpeta de la página
  const dir = path.posix.dirname('/' + paginaArchivo.replace(/\\/g, '/'));
  return { ruta: path.posix.normalize(dir + '/' + sinAncla), ancla };
}

function seguirRedireccion(ruta) {
  let actual = ruta.replace(/\.html$/, '') || '/';
  const vistos = new Set();
  while (redirecciones.has(actual) && !vistos.has(actual)) {
    vistos.add(actual);
    const destino = redirecciones.get(actual);
    const [r, a] = destino.split('#');
    if (a !== undefined) return { ruta: r || '/', ancla: a };
    actual = r.replace(/\.html$/, '') || '/';
  }
  return vistos.size ? { ruta: actual, ancla: '' } : null;
}

for (const pagina of B.listarPaginas()) {
  const html = quitarCodigo(fs.readFileSync(path.join(RAIZ, pagina), 'utf8'));
  const vistos = new Set();
  html.replace(/\b(?:href|src)="([^"]*)"/g, (m, valor) => {
    if (vistos.has(valor)) return m;
    vistos.add(valor);
    const r = resolver(pagina, valor);
    if (!r) return m;
    const etiqueta = `${pagina}: ${valor}`;

    // Ancla en la misma página
    if (r.ruta === null) {
      if (r.ancla) ok(idsDe(pagina).has(r.ancla), `${etiqueta} (ancla inexistente en la página)`);
      return m;
    }

    const ruta = r.ruta.replace(/\/$/, '') || '/';
    if (DE_PLATAFORMA.some(re => re.test(ruta))) return m;
    const archivo = archivoDe(ruta);
    const redir = redirecciones.has(ruta.replace(/\.html$/, '') || '/') ? seguirRedireccion(ruta) : null;

    if (archivo && redir && archivo !== '(generado)' && !ruta.endsWith('.html')) {
      ok(false, `${etiqueta} (hay una redirección en vercel.json que tapa la página ${archivo}; quítela)`);
      return m;
    }
    if (!archivo) {
      if (pendiente(ruta)) { pendientesTolerados++; return m; }
      if (redir) {
        const destino = archivoDe(redir.ruta);
        ok(!!destino, `${etiqueta} (redirige a ${redir.ruta}, que no existe)`);
        return m;
      }
      ok(false, `${etiqueta} (no existe el archivo ni hay redirección)`);
      return m;
    }
    ok(true, etiqueta);
    // Ancla en la página destino: solo si es una página estática del sitio
    if (r.ancla && /\.html$/.test(archivo)) ok(idsDe(archivo).has(r.ancla), `${etiqueta} (el ancla #${r.ancla} no existe en ${archivo})`);
    return m;
  });
}

console.log(`enlaces: ${n} comprobaciones${process.exitCode ? ' (CON FALLAS)' : ' correctas'}${pendientesTolerados ? `; ${pendientesTolerados} enlaces a rutas pendientes toleradas` : ''}`);
