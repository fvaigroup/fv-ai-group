// Escribe, dentro de club.html, condominio.html y gym.html, la tabla de planes generada desde assets/precios-software.js.
// Cada página tiene dos marcadores:
//   <!-- sw-planes:hex --> ... <!-- /sw-planes:hex -->     y     <!-- sw-planes:tri --> ... <!-- /sw-planes:tri -->
// Uso: node scripts/render-planes.js      (después de cambiar un precio en assets/precios-software.js)
const fs = require('fs');
const path = require('path');
const S = require('../assets/precios-software.js');
const RAIZ = path.join(__dirname, '..');
const PAGINAS = { club: 'club', condominio: 'condominio', gym: 'gym' };
Object.entries(PAGINAS).forEach(([pag, prod]) => {
  const f = path.join(RAIZ, pag + '.html');
  if (!fs.existsSync(f)) return;
  let html = fs.readFileSync(f, 'utf8'), cambios = 0;
  ['hex', 'tri'].forEach(l => {
    const re = new RegExp('(<!-- sw-planes:' + l + ' -->)[\\s\\S]*?(<!-- /sw-planes:' + l + ' -->)');
    if (!re.test(html)) return;
    html = html.replace(re, (m, a, b) => a + '\n' + S.planesHTML(l, prod) + '\n' + b); cambios++;
  });
  fs.writeFileSync(f, html);
  console.log(pag + '.html: ' + cambios + ' bloques de planes');
});
