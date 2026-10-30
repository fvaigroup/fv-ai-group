// Genera las imágenes para redes y los íconos de las páginas de producto.
// Uso: node scripts/imagenes-redes.js [condominio|gym|instagram|ejecutivos|servicios-productos ...]   (sin argumentos: todo)
//
// - assets/<producto>/favicon-64.png y apple-touch-icon.png, a partir de favicon.svg y <producto>-emblema.svg
// - assets/<producto>/og-<producto>.png (1200x630): toma la maqueta del hero de <producto>.html, así la
//   imagen siempre coincide con la página.
// - assets/social/ig-fvaigroup-1080x1350.png: los precios salen de PRECIOS_IG; actualícelos aquí si cambian.
// - assets/ejecutivos/og-ejecutivos.png (1200x630): el titular de la portada de ejecutivos.html (cámbielo aquí si cambia allá).
// - assets/og/servicios.png, productos.png, servicios-<categoria>.png y productos-<categoria>.png (1200x630):
//   los textos salen de data/catalogo.json (tipos, categorias y lineas), no se duplican aquí.
//
// Requiere Playwright. Si no está en el proyecto, se usa el que instala `npm i -g @playwright/cli`.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');

function cargarPlaywright() {
  const rutas = ['playwright-core', 'playwright',
    path.join(process.env.APPDATA || '', 'npm/node_modules/@playwright/cli/node_modules/playwright-core')];
  for (const r of rutas) { try { return require(r); } catch (e) { /* siguiente */ } }
  throw new Error('No encontré Playwright. Instale @playwright/cli o playwright-core.');
}

const RAIZ = path.resolve(__dirname, '..');
const url = rel => pathToFileURL(path.join(RAIZ, rel)).href;

const PRODUCTOS = {
  condominio: {
    nombre: 'Condominio', fondo: '#061416', claro: '#5fd8c7', acento: '#2a9d8f',
    titulo: 'Cobre el condominio a tiempo y <em>muestre en qué se gasta cada dólar.</em>',
    pie: 'Software para condominios',
    halo: 'radial-gradient(ellipse 60% 70% at 80% 40%,rgba(15,76,92,.55),transparent 70%),radial-gradient(ellipse 40% 40% at 95% 80%,rgba(42,157,143,.18),transparent 70%),radial-gradient(ellipse 50% 60% at 0% 0%,rgba(15,76,92,.45),transparent 70%)',
  },
  gym: {
    nombre: 'Gym', fondo: '#120909', claro: '#f87171', acento: '#ef4444',
    titulo: 'Cobre las membresías de su gimnasio <em>sin perseguir a nadie.</em>',
    pie: 'Software para gimnasios',
    halo: 'radial-gradient(ellipse 60% 70% at 80% 40%,rgba(127,29,29,.50),transparent 70%),radial-gradient(ellipse 40% 40% at 95% 80%,rgba(239,68,68,.16),transparent 70%),radial-gradient(ellipse 50% 60% at 0% 0%,rgba(31,41,55,.65),transparent 70%)',
  },
};

const PRECIOS_IG = { arranque: '$39,99/mes', webs: '$29,99/mes', diagnostico: '20 min' };

async function captura(browser, { html, gotoUrl, ancho, alto, salida, transparente = false, preparar }) {
  const page = await browser.newPage({ viewport: { width: ancho, height: alto }, deviceScaleFactor: 1 });
  const errores = [];
  page.on('pageerror', e => errores.push(e.message));
  // setContent no puede leer archivos locales: el HTML se escribe a un archivo temporal
  let tmp = null;
  if (html) { tmp = path.join(os.tmpdir(), `fv-imagen-${process.pid}.html`); fs.writeFileSync(tmp, html); gotoUrl = pathToFileURL(tmp).href; }
  await page.goto(gotoUrl, { waitUntil: 'load' });
  if (tmp) fs.unlinkSync(tmp);
  if (preparar) await page.evaluate(preparar.fn, preparar.arg);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(Array.from(document.images).map(i => (i.complete && i.naturalWidth) ? null : i.decode().catch(() => {})));
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(RAIZ, salida), omitBackground: transparente, clip: { x: 0, y: 0, width: ancho, height: alto } });
  await page.close();
  console.log('ok', salida);
  return errores;
}

const pagina = (cuerpo, css = '') => `<!doctype html><html><head><meta charset="utf-8"><style>*{margin:0;padding:0;box-sizing:border-box}html,body{overflow:hidden}${css}</style></head><body>${cuerpo}</body></html>`;

async function iconos(browser, id, p) {
  await captura(browser, {
    html: pagina(`<img src="${url(`assets/${id}/favicon.svg`)}" width="64" height="64">`, 'body{background:transparent}img{display:block}'),
    ancho: 64, alto: 64, salida: `assets/${id}/favicon-64.png`, transparente: true,
  });
  await captura(browser, {
    html: pagina(`<img src="${url(`assets/${id}/${id}-emblema.svg`)}" height="118">`, `body{width:180px;height:180px;background:${p.fondo};display:flex;align-items:center;justify-content:center}`),
    ancho: 180, alto: 180, salida: `assets/${id}/apple-touch-icon.png`,
  });
}

// Reemplaza el contenido de la página por la tarjeta, conservando sus estilos y la maqueta real del hero.
function componerOg(d) {
  const figura = document.querySelector('#hero-title').closest('section').querySelector('figure.pd-visual');
  const lap = figura.querySelector('.pd-laptop').cloneNode(true);
  const tel = figura.querySelector('.pd-phone').cloneNode(true);
  lap.classList.remove('hidden');
  document.body.className = document.body.className.replace(/\S*antialiased\S*/, '') + ' antialiased';
  document.body.innerHTML = '';
  const st = document.createElement('style');
  st.textContent = `
    html,body{width:1200px;height:630px;overflow:hidden;background:#000!important}
    body>*:not(.og){display:none!important}
    .og{position:fixed;inset:0;font-family:Geist,sans-serif;color:#fff;overflow:hidden}
    .og-bg{position:absolute;inset:0;background:${d.halo}}
    .og-logo{position:absolute;left:72px;top:64px;display:flex;align-items:center;gap:16px}
    .og-logo span{font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:44px;letter-spacing:-.01em}
    .og h1{position:absolute;left:72px;top:196px;width:560px;font-size:54px;line-height:1.07;font-weight:800;letter-spacing:-.025em;text-wrap:balance}
    .og h1 em{font-style:normal;background:linear-gradient(100deg,${d.claro},${d.acento} 60%,${d.claro});-webkit-background-clip:text;background-clip:text;color:transparent}
    .og-sub{position:absolute;left:72px;bottom:62px;font-family:'Space Grotesk',sans-serif;font-size:24px;color:#cbd5e1;letter-spacing:.01em}
    .og-sub b{color:${d.claro};font-weight:600}
    .og-lap{position:absolute;left:740px;top:96px;width:560px}
    .og-tel{position:absolute;left:640px;top:176px;width:236px}
    .og-tel .pd-phone{position:relative!important;inset:auto!important;transform:none!important;width:100%!important;margin:0!important}
    .og-lap .pd-laptop{width:100%}`;
  document.head.appendChild(st);
  const og = document.createElement('div');
  og.className = 'og';
  og.innerHTML = `<div class="og-bg"></div>
    <div class="og-logo"><img src="${d.emblema}" height="64" alt=""><span>${d.nombre}</span></div>
    <h1>${d.titulo}</h1>
    <div class="og-sub"><b>${d.pie}</b> · F&amp;V AI Group</div>
    <div class="og-lap"></div><div class="og-tel"></div>`;
  og.querySelector('.og-lap').appendChild(lap);
  og.querySelector('.og-tel').appendChild(tel);
  document.body.appendChild(og);
}

async function og(browser, id, p) {
  return captura(browser, {
    gotoUrl: url(`${id}.html`), ancho: 1200, alto: 630, salida: `assets/${id}/og-${id}.png`,
    preparar: { fn: componerOg, arg: { ...p, emblema: url(`assets/${id}/${id}-emblema.svg`) } },
  });
}

function htmlInstagram() {
  const fuentes = '<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">';
  const css = `
html,body{width:1080px;height:1350px;background:#000;font-family:'Geist',sans-serif;color:#fff}
body{position:relative}
.g1{position:absolute;left:-300px;top:-300px;width:1000px;height:1000px;background:radial-gradient(circle,rgba(0,255,255,.22),transparent 65%)}
.g2{position:absolute;right:-380px;bottom:-380px;width:1100px;height:1100px;background:radial-gradient(circle,rgba(255,140,0,.26),transparent 65%)}
.grid{position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.07) 1.2px,transparent 1.3px);background-size:44px 44px;-webkit-mask-image:radial-gradient(ellipse at 50% 30%,#000 0%,transparent 70%);mask-image:radial-gradient(ellipse at 50% 30%,#000 0%,transparent 70%)}
.top{position:absolute;left:84px;top:84px;right:84px;display:flex;align-items:center;justify-content:space-between}
.brand{display:flex;align-items:center;gap:18px;font-family:'Space Grotesk';font-weight:700;font-size:34px;letter-spacing:.06em}
.brand img{width:64px;height:64px}
.loc{font-family:'Space Grotesk';font-weight:600;font-size:22px;letter-spacing:.2em;color:#00FFFF}
.emb{position:absolute;right:40px;top:130px;width:400px;opacity:.95;filter:drop-shadow(0 0 60px rgba(0,255,255,.3))}
.h{position:absolute;left:84px;top:500px;width:920px;font-family:'Space Grotesk';font-weight:700;font-size:104px;line-height:1.04;letter-spacing:-.035em}
.h .c{background:linear-gradient(90deg,#00FFFF,#00CCFF 25%,#FFFFFF 50%,#FF8C00);-webkit-background-clip:text;background-clip:text;color:transparent;display:inline-block;padding-right:8px}
.sub{position:absolute;left:84px;top:850px;width:880px;font-weight:300;font-size:38px;line-height:1.3;color:#cbd5e1}
.sub b{font-weight:700;color:#fff}
.chips{position:absolute;left:84px;top:1010px;display:flex;flex-direction:column;gap:18px}
.row{display:flex;gap:18px}
.c2{font-family:'Space Grotesk';font-weight:600;font-size:30px;padding:14px 28px;border-radius:999px;border:2px solid;white-space:nowrap}
.c2.a{color:#00FFFF;border-color:rgba(0,255,255,.6);background:rgba(0,255,255,.08)}
.c2.b{color:#FF8C00;border-color:rgba(255,140,0,.7);background:rgba(255,140,0,.1)}
.cta{position:absolute;left:84px;right:84px;bottom:84px;display:flex;align-items:center;justify-content:space-between;border-top:2px solid rgba(255,255,255,.12);padding-top:34px}
.cta .l{font-family:'Space Grotesk';font-weight:600;font-size:32px;white-space:nowrap}
.cta .l span{color:#FF8C00}
.cta .r{font-family:'Space Grotesk';font-weight:500;font-size:28px;letter-spacing:.06em;color:#94a3b8;white-space:nowrap}`;
  const p = PRECIOS_IG;
  return pagina(`${fuentes}
<div class="g1"></div><div class="g2"></div><div class="grid"></div>
<div class="top"><div class="brand"><img src="${url('assets/logo-mark-hex.png')}">F&amp;V AI GROUP</div><div class="loc">FVAIGROUP.COM</div></div>
<img class="emb" src="${url('assets/logo-full-hex.png')}">
<div class="h">Automatizamos<br>tu negocio y<br><span class="c">te hacemos la web</span></div>
<div class="sub">Precios claros en <b>dólares</b>, listos en <b>días</b>. Pagas en bolívares a la tasa BCV del día.</div>
<div class="chips"><div class="row"><span class="c2 a">Plan Arranque ${p.arranque}</span><span class="c2 b">Webs desde ${p.webs}</span></div><div class="row"><span class="c2 a">Diagnóstico gratis de ${p.diagnostico}</span></div></div>
<div class="cta"><div class="l">Escríbenos <span>hoy</span> por WhatsApp</div><div class="r">@fvaigroup</div></div>`, css);
}

// Imagen para redes de /ejecutivos (página para dueños de empresa, Línea Hexagonal): fondo negro, halo suave
// naranja y cian, el hexágono de F&V y el titular de la portada de ejecutivos.html.
function htmlEjecutivos() {
  const fuentes = '<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">';
  const css = `
html,body{width:1200px;height:630px;background:#000;font-family:'Geist',sans-serif;color:#fff}
body{position:relative;overflow:hidden}
.g1{position:absolute;left:-260px;top:-300px;width:820px;height:820px;background:radial-gradient(circle,rgba(0,204,255,.14),transparent 65%)}
.g2{position:absolute;right:-300px;bottom:-360px;width:980px;height:980px;background:radial-gradient(circle,rgba(255,140,0,.20),transparent 65%)}
.grid{position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.06) 1.2px,transparent 1.3px);background-size:36px 36px;-webkit-mask-image:radial-gradient(ellipse at 30% 30%,#000 0%,transparent 70%);mask-image:radial-gradient(ellipse at 30% 30%,#000 0%,transparent 70%)}
.top{position:absolute;left:72px;top:60px;display:flex;align-items:center;gap:20px}
.brand{display:flex;align-items:center;gap:14px;font-family:'Space Grotesk';font-weight:700;font-size:26px;letter-spacing:.06em}
.brand img{width:52px;height:52px}
.ins{font-family:'Space Grotesk';font-weight:600;font-size:17px;letter-spacing:.08em;text-transform:uppercase;padding:9px 16px;border-radius:999px;border:1.5px solid rgba(0,255,255,.6);color:#00FFFF;display:flex;align-items:center;gap:8px}
.ins svg{width:16px;height:16px;fill:currentColor}
.emb{position:absolute;right:44px;top:170px;width:290px;opacity:.95}
.h{position:absolute;left:72px;top:190px;width:740px;font-weight:800;font-size:62px;line-height:1.06;letter-spacing:-.03em}
.h .c{display:block;white-space:nowrap;margin-top:18px;font-size:37px;line-height:1.15;letter-spacing:-.02em;background:linear-gradient(95deg,#FFBF00,#FF8C00 70%);-webkit-background-clip:text;background-clip:text;color:transparent}
.pie{position:absolute;left:72px;right:72px;bottom:52px;display:flex;align-items:center;justify-content:space-between;border-top:1.5px solid rgba(255,255,255,.12);padding-top:26px;font-family:'Space Grotesk';font-size:24px;color:#cbd5e1}
.pie b{color:#FF8C00;font-weight:600}
.pie span{color:#94a3b8;letter-spacing:.06em;font-size:21px}`;
  return pagina(`${fuentes}
<div class="g1"></div><div class="g2"></div><div class="grid"></div>
<div class="top"><div class="brand"><img src="${url('assets/logo-mark-hex.png')}">F&amp;V AI GROUP</div><div class="ins"><svg viewBox="0 0 24 24"><path d="M12 1.5 21.6 7v10L12 22.5 2.4 17V7z"/></svg>Línea Hexagonal</div></div>
<img class="emb" src="${url('assets/logo-full-hex.png')}">
<div class="h">Vea en qué se va la plata de su empresa.<span class="c">Con IA, en reportes cortos por WhatsApp.</span></div>
<div class="pie"><div><b>Programa para dueños de empresa</b> · F&amp;V AI Group</div><span>FVAIGROUP.COM/EJECUTIVOS</span></div>`, css);
}

// ---------- Servicios y Productos (assets/og/) ----------
// Los textos (título del tipo, intro, categorías y leyendas de las líneas) salen de data/catalogo.json.
// Solo la forma (⬡ ▲) y el color distinguen las líneas: nunca el nombre «Línea …».
const PAL_SP = {
  hex: { trazo: ['#00FFFF', '#FF8C00'], halo1: 'rgba(0,204,255,.15)', halo2: 'rgba(255,140,0,.22)', pie: '#FF8C00', borde: 'rgba(0,255,255,.6)' },
  tri: { trazo: ['#4ade80', '#a855f7'], halo1: 'rgba(168,85,247,.17)', halo2: 'rgba(74,222,128,.19)', pie: '#4ade80', borde: 'rgba(74,222,128,.6)' },
  // marca madre: cian y naranja (productos) / mezcla de ambas líneas (software, cursos)
  madre: { halo1: 'rgba(0,204,255,.15)', halo2: 'rgba(255,140,0,.22)', pie: '#FF8C00', borde: 'rgba(0,255,255,.6)' },
  mezcla: { halo1: 'rgba(168,85,247,.17)', halo2: 'rgba(255,140,0,.20)', pie: '#FF8C00', borde: 'rgba(255,140,0,.6)' },
};

const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// Si el subtítulo es largo se queda con la primera oración (el sentido no cambia).
const corto = t => (t.length > 90 && /\.\s/.test(t)) ? t.split(/(?<=\.)\s/)[0] : t;

const degradado = (id, tr) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${tr[0]}"/><stop offset=".4" stop-color="${tr[0]}"/><stop offset=".6" stop-color="${tr[1]}"/><stop offset="1" stop-color="${tr[1]}"/></linearGradient></defs>`;
const SVG_HEX = (id, w) => `<svg width="${w}" height="${w}" viewBox="0 0 100 100">${degradado(id, PAL_SP.hex.trazo)}<path d="M50 4 90 27v46L50 96 10 73V27z" fill="url(#${id})" fill-opacity=".10" stroke="url(#${id})" stroke-width="3.2" stroke-linejoin="round"/></svg>`;
const SVG_TRI = (id, w) => `<svg width="${w}" height="${w}" viewBox="0 0 100 100">${degradado(id, PAL_SP.tri.trazo)}<path d="M50 10 92 86H8z" fill="url(#${id})" fill-opacity=".10" stroke="url(#${id})" stroke-width="3.2" stroke-linejoin="round"/></svg>`;
const ICO_HEX = '<svg viewBox="0 0 24 24" width="20" height="20" fill="#00FFFF"><path d="M12 1.5 21.6 7v10L12 22.5 2.4 17V7z"/></svg>';
const ICO_TRI = '<svg viewBox="0 0 24 24" width="20" height="20" fill="#4ade80"><path d="M12 3 22 20.5H2z"/></svg>';

// d: { titulo, sub, ruta, pie, formas: ['hex'] | ['tri'] | ['hex','tri'], paleta }
function htmlServiciosProductos(d, lineas) {
  const fuentes = '<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">';
  const p = PAL_SP[d.paleta];
  const ambas = d.formas.length === 2;
  const chip = d.formas.map(f => `<span class="ch">${f === 'hex' ? ICO_HEX : ICO_TRI}<span>${esc(lineas[f].leyenda)}</span></span>`).join('<span class="sep">·</span>');
  const formas = ambas
    ? `<div class="f f1">${SVG_HEX('gh', 240)}</div><div class="f f2">${SVG_TRI('gt', 200)}</div>`
    : `<div class="f f0">${d.formas[0] === 'hex' ? SVG_HEX('gh', 300) : SVG_TRI('gt', 280)}</div>`;
  const css = `
html,body{width:1200px;height:630px;background:#000;font-family:'Geist',sans-serif;color:#fff}
body{position:relative;overflow:hidden}
.g1{position:absolute;left:-260px;top:-300px;width:820px;height:820px;background:radial-gradient(circle,${p.halo1},transparent 65%)}
.g2{position:absolute;right:-300px;bottom:-360px;width:980px;height:980px;background:radial-gradient(circle,${p.halo2},transparent 65%)}
.grid{position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.06) 1.2px,transparent 1.3px);background-size:36px 36px;-webkit-mask-image:radial-gradient(ellipse at 30% 30%,#000 0%,transparent 70%);mask-image:radial-gradient(ellipse at 30% 30%,#000 0%,transparent 70%)}
.top{position:absolute;left:72px;top:60px;display:flex;align-items:center;gap:20px}
.brand{display:flex;align-items:center;gap:14px;font-family:'Space Grotesk';font-weight:700;font-size:26px;letter-spacing:.06em;white-space:nowrap}
.brand img{width:52px;height:52px}
.leyenda{display:flex;align-items:center;gap:12px;font-family:'Space Grotesk';font-weight:600;font-size:19px;padding:9px 18px;border-radius:999px;border:1.5px solid ${p.borde};color:#fff;white-space:nowrap}
.ch{display:flex;align-items:center;gap:8px}
.sep{color:#94a3b8}
.f{position:absolute;filter:drop-shadow(0 0 40px ${p.halo2})}
.f0{right:84px;top:200px}
.f1{right:190px;top:130px}.f2{right:76px;top:324px}
.txt{position:absolute;left:72px;top:176px;width:${ambas ? 700 : 740}px}
.h{font-weight:800;font-size:${d.titulo.length > 24 ? 60 : 66}px;line-height:1.06;letter-spacing:-.03em;text-wrap:balance}
.sub{margin-top:24px;font-size:30px;line-height:1.35;font-weight:400;color:#cbd5e1;max-width:700px}
.pie{position:absolute;left:72px;right:72px;bottom:52px;display:flex;align-items:center;justify-content:space-between;border-top:1.5px solid rgba(255,255,255,.12);padding-top:26px;font-family:'Space Grotesk';font-size:24px;color:#cbd5e1}
.pie b{color:${p.pie};font-weight:600}
.pie span{color:#94a3b8;letter-spacing:.06em;font-size:21px}`;
  return pagina(`${fuentes}
<div class="g1"></div><div class="g2"></div><div class="grid"></div>
<div class="top"><div class="brand"><img src="${url('assets/logo-mark-hex.png')}" alt="">F&amp;V AI GROUP</div><div class="leyenda">${chip}</div></div>
${formas}
<div class="txt"><div class="h">${esc(d.titulo)}</div><div class="sub">${esc(d.sub)}</div></div>
<div class="pie"><div><b>${esc(d.pie)}</b> · F&amp;V AI Group</div><span>${esc(d.ruta)}</span></div>`, css);
}

function pedidosServiciosProductos() {
  const cat = JSON.parse(fs.readFileSync(path.join(RAIZ, 'data/catalogo.json'), 'utf8'));
  const lista = [];
  const ruta = (t, id) => `FVAIGROUP.COM${t.ruta}${id ? '#' + id : ''}`.toUpperCase();
  const sv = cat.tipos.servicio, pr = cat.tipos.producto;
  lista.push({ salida: 'assets/og/servicios.png', d: { titulo: 'Servicios para empresas', sub: corto(sv.intro), pie: sv.titulo, ruta: ruta(sv), formas: ['hex'], paleta: 'hex' } });
  lista.push({ salida: 'assets/og/productos.png', d: { titulo: 'Productos con precio fijo', sub: corto(pr.intro), pie: pr.titulo, ruta: ruta(pr), formas: ['hex', 'tri'], paleta: 'madre' } });
  for (const k of sv.categorias) {
    lista.push({ salida: `assets/og/servicios-${k.id}.png`, d: { titulo: k.nombre, sub: corto(k.intro), pie: sv.titulo, ruta: ruta(sv, k.id), formas: ['hex'], paleta: 'hex' } });
  }
  for (const k of pr.categorias) {
    const ls = new Set(cat.items.filter(i => i.tipo === 'producto' && i.categoria === k.id).map(i => i.linea));
    const formas = ['hex', 'tri'].filter(f => ls.has(f));
    lista.push({ salida: `assets/og/productos-${k.id}.png`, d: { titulo: k.nombre, sub: corto(k.intro), pie: pr.titulo, ruta: ruta(pr, k.id), formas, paleta: formas.length === 2 ? 'mezcla' : formas[0] } });
  }
  return { lista, lineas: cat.lineas };
}

(async () => {
  const pw = cargarPlaywright();
  const pedidos = process.argv.slice(2);
  const quiere = n => !pedidos.length || pedidos.includes(n);
  let browser;
  try { browser = await pw.chromium.launch({ channel: 'chrome' }); } catch (e) { browser = await pw.chromium.launch(); }
  try {
    for (const [id, p] of Object.entries(PRODUCTOS)) {
      if (!quiere(id)) continue;
      await iconos(browser, id, p);
      await og(browser, id, p);
    }
    if (quiere('instagram')) {
      await captura(browser, { html: htmlInstagram(), ancho: 1080, alto: 1350, salida: 'assets/social/ig-fvaigroup-1080x1350.png' });
    }
    if (quiere('ejecutivos')) {
      fs.mkdirSync(path.join(RAIZ, 'assets/ejecutivos'), { recursive: true });
      await captura(browser, { html: htmlEjecutivos(), ancho: 1200, alto: 630, salida: 'assets/ejecutivos/og-ejecutivos.png' });
    }
    if (quiere('servicios-productos')) {
      fs.mkdirSync(path.join(RAIZ, 'assets/og'), { recursive: true });
      const { lista, lineas } = pedidosServiciosProductos();
      for (const { salida, d } of lista) {
        await captura(browser, { html: htmlServiciosProductos(d, lineas), ancho: 1200, alto: 630, salida });
      }
    }
  } finally { await browser.close(); }
})();
