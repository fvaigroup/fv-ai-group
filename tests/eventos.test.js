// Prueba de assets/eventos.js con un DOM mínimo simulado y fechas falsas (sin dependencias).
//  - Las fechas se comparan con el día de hoy en Venezuela (America/Caracas).
//  - El taller del sábado 17 de octubre de 2026 se ofrece hasta ese día y se oculta desde el 18.
//  - Una cohorte se ofrece hasta el día de su primera clase; la de octubre (empezó el 10) ya no.
//  - Sin ninguna fecha futura se muestra «Próximas fechas: escríbenos por WhatsApp».
//  - El HTML por defecto de /cursos/finanzas-ia (y de /cursos mientras exista) no anuncia la cohorte de octubre.
// Uso: node tests/eventos.test.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');
const RAIZ = path.join(__dirname, '..');
const CODIGO = fs.readFileSync(path.join(RAIZ, 'assets/eventos.js'), 'utf8');
const leer = f => fs.readFileSync(path.join(RAIZ, f), 'utf8');

let comprobaciones = 0;
function ok(cond, msg) { comprobaciones++; assert.ok(cond, msg); }

// ---------- DOM mínimo ----------
function elemento(attrs, clases) {
  const set = new Set(clases || []);
  return {
    attrs: Object.assign({}, attrs), textContent: '',
    getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; },
    setAttribute(k, v) { this.attrs[k] = String(v); },
    removeAttribute(k) { delete this.attrs[k]; },
    classList: {
      add: c => set.add(c), remove: c => set.delete(c), contains: c => set.has(c),
      toggle: (c, forzar) => { const poner = forzar === undefined ? !set.has(c) : !!forzar; if (poner) set.add(c); else set.delete(c); return poner; }
    }
  };
}

// carga eventos.js como si «ahora» fuera el instante dado (ISO con zona)
function cargar(ahoraISO, elementos) {
  const FIJO = new Date(ahoraISO).getTime();
  class FakeDate extends Date {
    constructor(...a) { if (a.length) super(...a); else super(FIJO); }
    static now() { return FIJO; }
  }
  const document = {
    readyState: 'complete',
    addEventListener() {},
    querySelectorAll(sel) {
      const attr = sel.slice(1, -1); // '[data-ev]' -> 'data-ev'
      return elementos.filter(el => el.getAttribute(attr) !== null);
    }
  };
  const window = {};
  const ctx = { window, document, Date: FakeDate, Intl, requestAnimationFrame: fn => fn(), setTimeout: () => 0, console };
  vm.createContext(ctx);
  vm.runInContext(CODIGO, ctx);
  return window.FV_EVENTOS;
}

function dom() {
  return {
    taller: elemento({ 'data-ev-show': 'taller:vigente' }),
    tallerFecha: elemento({ 'data-ev': 'taller.fecha' }),
    oct: elemento({ 'data-ev-show': 'oct:vigente' }, ['hidden']),
    nov: elemento({ 'data-ev-show': 'nov:vigente' }),
    sinFechas: elemento({ 'data-ev-show': 'eventos:sin-fechas' }, ['hidden']),
    cursoSinFechas: elemento({ 'data-ev-show': 'curso:sin-fechas' }, ['hidden']),
    proximas: elemento({ 'data-ev': 'eventos.proximas' }),
    cursoFechas: elemento({ 'data-ev': 'curso.fechas' }),
    waOct: elemento({ 'data-ev-wa': 'curso-oct', href: '#' }),
    waNov: elemento({ 'data-ev-wa': 'curso-nov', href: '#' }),
    waProx: elemento({ 'data-ev-wa': 'proximas', href: '#' })
  };
}
const visible = el => !el.classList.contains('hidden');
const texto = el => decodeURIComponent(el.getAttribute('href').split('?text=')[1] || '');

// ---------- 1) Hoy, 17 de octubre de 2026 (mediodía en Caracas) ----------
(function () {
  const d = dom(); const E = cargar('2026-10-17T12:00:00-04:00', Object.values(d));
  ok(E.hoy === '2026-10-17', 'hoy en Caracas: ' + E.hoy);
  ok(visible(d.taller), '17 oct: el taller del 17 se ve');
  ok(!visible(d.oct), '17 oct: la cohorte de octubre (empezó el 10) no se ofrece');
  ok(visible(d.nov), '17 oct: la cohorte de noviembre se ofrece');
  ok(!visible(d.sinFechas) && !visible(d.cursoSinFechas), '17 oct: no se muestra «Próximas fechas»');
  ok(d.cursoFechas.textContent === 'sábados 7, 14 y 21 de noviembre de 2026', '17 oct: curso.fechas = noviembre (' + d.cursoFechas.textContent + ')');
  ok(/avísame/.test(texto(d.waOct)), '17 oct: el WhatsApp de octubre pide aviso, no reserva');
  ok(/7, 14 y 21 de nov/.test(texto(d.waNov)), '17 oct: el WhatsApp de noviembre reserva noviembre');
  ok(/próximas fechas/.test(texto(d.waProx)), 'WhatsApp de «proximas»');
  const c = E.cursoProximo();
  ok(c.vigente && c.id === 'nov' && c.inicioISO === '2026-11-07T14:00:00-04:00', '17 oct: cursoProximo = noviembre a las 2 pm');
  const lista = E.proximas();
  ok(lista.length === 2 && lista[0].tipo === 'taller' && lista[1].id === 'nov', '17 oct: proximas() = taller y noviembre');
  ok(d.proximas.textContent === 'Próximas fechas: escríbenos por WhatsApp', 'texto de eventos.proximas');
})();

// ---------- 2) 17 de octubre a las 11:30 p.m. en Caracas (ya es 18 en UTC): el taller sigue ----------
(function () {
  const d = dom(); cargar('2026-10-18T03:30:00Z', Object.values(d));
  ok(visible(d.taller), '17 oct 11:30 p.m. Caracas: el taller todavía se ve (se compara en hora de Venezuela)');
})();

// ---------- 3) 18 de octubre: el taller se oculta ----------
(function () {
  const d = dom(); const E = cargar('2026-10-18T00:30:00-04:00', Object.values(d));
  ok(!visible(d.taller), '18 oct: el taller del 17 ya no se ve');
  ok(d.tallerFecha.textContent === 'nueva fecha por anunciar', '18 oct: no se escribe la fecha vieja del taller');
  ok(visible(d.nov) && !visible(d.sinFechas), '18 oct: noviembre sigue y no hay aviso de «sin fechas»');
  ok(E.proximas().length === 1, '18 oct: queda solo noviembre');
})();

// ---------- 4) 7 de noviembre: la de noviembre todavía se ofrece; 8 de noviembre: nada ----------
(function () {
  const d = dom(); cargar('2026-11-07T09:00:00-04:00', Object.values(d));
  ok(visible(d.nov), '7 nov: la cohorte de noviembre se ofrece hasta su inicio');
})();
(function () {
  const d = dom(); const E = cargar('2026-11-08T09:00:00-04:00', Object.values(d));
  ok(!visible(d.nov) && !visible(d.oct) && !visible(d.taller), '8 nov: no se ofrece nada');
  ok(visible(d.sinFechas) && visible(d.cursoSinFechas), '8 nov: se muestra «Próximas fechas: escríbenos por WhatsApp»');
  const c = E.cursoProximo();
  ok(c.vigente === false && c.inicioISO === null && c.fechasTexto === 'Próximas fechas: escríbenos por WhatsApp', '8 nov: cursoProximo sin cohorte');
  ok(E.datos['eventos.resumen'] === 'Próximas fechas: escríbenos por WhatsApp', '8 nov: resumen sin fechas');
  ok(E.estado['eventos:sin-fechas'] === true && E.estado['eventos:con-fechas'] === false, '8 nov: estados de «sin fechas»');
})();

// ---------- 5) HTML por defecto (sin JavaScript): no anuncia la cohorte de octubre ----------
['cursos/finanzas-ia.html'].forEach(f => {
  const html = leer(f);
  for (const m of html.matchAll(/<[^>]*data-ev-show="oct:vigente"[^>]*>/g)) ok(/class="[^"]*\bhidden\b/.test(m[0]), f + ': lo de la cohorte de octubre va oculto por defecto: ' + m[0].slice(0, 80));
  for (const m of html.matchAll(/<[^>]*data-ev-show="(?:eventos|curso):sin-fechas"[^>]*>/g)) ok(/class="[^"]*\bhidden\b/.test(m[0]), f + ': el aviso «Próximas fechas» va oculto por defecto');
  ok(/data-ev-show="(?:eventos|curso):sin-fechas"/.test(html), f + ': tiene el aviso «Próximas fechas: escríbenos por WhatsApp»');
  ok(!/"startDate": "2026-10-10"/.test(html), f + ': el JSON-LD ya no trae la cohorte de octubre');
  ok(!/Sábados 10, 17 y 24 de octubre/.test(html), f + ': el texto por defecto no anuncia octubre');
});

console.log('eventos: ' + comprobaciones + ' comprobaciones correctas');
