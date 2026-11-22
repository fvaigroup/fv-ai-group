/* /triangular/delta/logistica · #panel: panel de ejemplo (vidrio) con la ganancia del mes por camión, por cliente y por ruta
   (pestañas accesibles), la cobranza de fletes (facturado / cobrado / por cobrar / vencido, cliente por cliente), el costo por
   kilómetro de cada camión, una alerta de combustible (estimación, no sensor) y los vencimientos de documentos y el
   mantenimiento por kilómetros. Las barras crecen y las cifras cuentan al entrar en pantalla; al cambiar de pestaña vuelven a
   crecer. Todos los montos son de ejemplo y solo los escribe este archivo (clientes y unidades ficticios).
   Sin JS queda la lista de tarjetas del HTML (ul[data-log-panel]); con JS esa lista se oculta y se arma la maqueta
   (div[data-log-panel-maqueta]), que sí es legible por lectores de pantalla. Con reduced-motion: estado final, sin animar.
   La silueta de la cabecera y el resaltado de la barra siguen a la flota elegida en #flota (LOG.alCambiar).
   CSS: bloque logistica:panel de src/tailwind.css (prefijo log-panel-). */
(function () {
  'use strict';

  function iniciar() {
    var LOG = window.LOG;
    if (!LOG) return;
    var sec = document.getElementById('panel');
    var resp = sec && sec.querySelector('[data-log-panel]');
    var env = sec && sec.querySelector('[data-log-panel-maqueta]');
    if (!resp || !env || env.getAttribute('data-listo')) return;
    env.setAttribute('data-listo', '1');

    var reducir = !!LOG.reducir;
    var raf = window.requestAnimationFrame ? function (f) { return window.requestAnimationFrame(f); } : function (f) { return setTimeout(f, 16); };

    function corto(f) { var d = LOG.datosFlota(f); return d ? d.corto : f; }
    function unidad(f, n) { return corto(f) + ' ' + n; }
    function usd(v) { return LOG.num(Math.round(v)); }
    function usd2(v) { return '$' + LOG.miles(v, 2); }
    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

    /* ---------- datos de ejemplo (los tres cortes suman lo mismo: $12.760 de ganancia en el mes) ---------- */
    var GANANCIA = {
      camion: {
        nom: 'Por camión',
        filas: [
          { n: unidad('gandola', '01'), f: 'gandola', v: 3840, tag: 'Deja más' },
          { n: unidad('torpedo', '01'), f: 'torpedo', v: 2910 },
          { n: unidad('750', '01'), f: '750', v: 2260 },
          { n: unidad('npr', '01'), f: 'npr', v: 1780 },
          { n: unidad('350', '02'), f: '350', v: 1350 },
          { n: unidad('mini', '01'), f: 'mini', v: 620 }
        ]
      },
      cliente: {
        nom: 'Por cliente',
        filas: [
          { n: 'Cliente A', v: 4150, tag: 'Paga mejor' },
          { n: 'Cliente B', v: 3620 },
          { n: 'Cliente C', v: 3060 },
          { n: 'Cliente D', v: 1930, tag: 'Paga tarde', mala: true }
        ]
      },
      ruta: {
        nom: 'Por ruta',
        filas: [
          { n: 'Valencia → Caracas', v: 4980, tag: 'Deja más' },
          { n: 'Puerto Cabello → Valencia', v: 3870 },
          { n: 'Barquisimeto → Maracaibo', v: 2460 },
          { n: 'Maracay → Puerto La Cruz', v: 1590 },
          { n: 'Caracas → Puerto Ordaz', v: -140, tag: 'No conviene', mala: true }
        ]
      }
    };
    var ORDEN = ['camion', 'cliente', 'ruta'];

    var COBRO = { fact: 18400, cobr: 12900, porc: 4100, venc: 1400 };
    var CLIENTES = [
      { n: 'Cliente A', fact: 6200, cobr: 6200, porc: 0, venc: 0 },
      { n: 'Cliente B', fact: 5100, cobr: 3200, porc: 1900, venc: 0 },
      { n: 'Cliente C', fact: 4300, cobr: 2400, porc: 1500, venc: 400 },
      { n: 'Cliente D', fact: 2800, cobr: 1100, porc: 700, venc: 1000 }
    ];

    var KM = [
      { f: 'mini', n: '01', v: 0.38 }, { f: '350', n: '02', v: 0.52 }, { f: 'npr', n: '01', v: 0.61 },
      { f: '750', n: '01', v: 0.74 }, { f: 'torpedo', n: '01', v: 0.95 }, { f: 'gandola', n: '01', v: 1.32 }
    ];

    var COMB = { ruta: 'Valencia → Caracas', filas: [{ n: '01', v: 17 }, { n: '03', v: 18 }, { n: '02', v: 24, alerta: true }] };
    var otros = COMB.filas.filter(function (x) { return !x.alerta; });
    var prom = otros.reduce(function (s, x) { return s + x.v; }, 0) / otros.length;
    var alertaF = COMB.filas.filter(function (x) { return x.alerta; })[0];
    var masPct = Math.round((alertaF.v / prom - 1) * 100);

    var DOCS = [
      { t: 'Certificado médico', q: 'Chofer del ' + unidad('750', '01'), d: 6, urge: true },
      { t: 'Póliza RCV', q: unidad('torpedo', '01'), d: 14 },
      { t: 'Licencia', q: 'Chofer del ' + unidad('npr', '02'), d: 27 }
    ];
    var MANT = [
      { t: 'Cambio de aceite', q: unidad('gandola', '01'), cada: 10000, falta: 600 },
      { t: 'Frenos', q: unidad('350', '02'), cada: 12000, falta: 2400 }
    ];

    /* ---------- maqueta ---------- */
    var NOM = { B: 'Básico', I: 'Intermedio', A: 'Avanzado' };
    function chip(p) { return '<span class="log-plan log-panel-plan" data-p="' + p + '" role="img" aria-label="Plan ' + NOM[p] + '" title="Plan ' + NOM[p] + '">' + p + '</span>'; }
    function barra(clase) { return '<span class="log-panel-barra' + (clase ? ' ' + clase : '') + '" aria-hidden="true"><span class="log-panel-relleno"></span></span>'; }

    var h = '';
    h += '<div class="log-panel-cab">' +
      '<div class="log-panel-quien"><span class="log-panel-ico" data-log-panel-ico aria-hidden="true"></span>' +
      '<div><b class="log-panel-tit">Tu panel</b><span class="log-panel-sub">Reporte del mes · toda la flota</span></div></div>' +
      '<span class="log-panel-chip">Reporte mensual</span></div>';
    h += '<div class="log-panel-grid">';

    // Ganancia con pestañas
    h += '<div class="log-panel-card log-panel-gan" role="group" aria-labelledby="log-panel-gan-t">' +
      '<div class="log-panel-card-cab"><h3 class="log-panel-h" id="log-panel-gan-t">Ganancia del mes' + chip('I') + '</h3>' +
      '<p class="log-panel-total">Total <b data-log-panel-total>$0</b></p></div>' +
      '<div class="log-panel-tabs" role="tablist" aria-label="Ver la ganancia">';
    ORDEN.forEach(function (k, i) {
      h += '<button type="button" class="log-panel-tab" role="tab" id="log-panel-tab-' + k + '" aria-controls="log-panel-tp" aria-selected="' + (i ? 'false' : 'true') + '" tabindex="' + (i ? '-1' : '0') + '" data-log-panel-tab="' + k + '">' + GANANCIA[k].nom + '</button>';
    });
    h += '</div><div class="log-panel-tp" role="tabpanel" id="log-panel-tp" aria-labelledby="log-panel-tab-camion" tabindex="0">' +
      '<ul class="log-panel-barras" data-log-panel-barras></ul></div></div>';

    // Cobranza de fletes
    h += '<div class="log-panel-card log-panel-cob" role="group" aria-labelledby="log-panel-cob-t">' +
      '<div class="log-panel-card-cab"><h3 class="log-panel-h" id="log-panel-cob-t">Cobranza de fletes' + chip('I') + '</h3></div>' +
      '<dl class="log-panel-kpis">' +
      '<div class="log-panel-kpi"><dt>Facturado</dt><dd data-log-panel-n="' + COBRO.fact + '">$0</dd></div>' +
      '<div class="log-panel-kpi is-ok"><dt>Cobrado</dt><dd data-log-panel-n="' + COBRO.cobr + '">$0</dd></div>' +
      '<div class="log-panel-kpi is-pend"><dt>Por cobrar</dt><dd data-log-panel-n="' + COBRO.porc + '">$0</dd></div>' +
      '<div class="log-panel-kpi is-venc"><dt>Vencido</dt><dd data-log-panel-n="' + COBRO.venc + '">$0</dd></div></dl>' +
      '<div class="log-panel-pila" aria-hidden="true">' +
      '<span class="is-ok" style="--p:' + (COBRO.cobr / COBRO.fact) + '"></span>' +
      '<span class="is-pend" style="--p:' + (COBRO.porc / COBRO.fact) + '"></span>' +
      '<span class="is-venc" style="--p:' + (COBRO.venc / COBRO.fact) + '"></span></div>' +
      '<ul class="log-panel-clientes">';
    CLIENTES.forEach(function (c) {
      var est, cls;
      if (c.venc) { est = 'Vencido ' + usd(c.venc); cls = 'is-venc'; }
      else if (c.porc) { est = 'Por cobrar ' + usd(c.porc); cls = 'is-pend'; }
      else { est = 'Al día'; cls = 'is-ok'; }
      h += '<li><span class="log-panel-cli-n">' + c.n + '<small>de ' + usd(c.fact) + '</small></span>' +
        '<span class="log-panel-pila log-panel-pila-chica" aria-hidden="true">' +
        '<span class="is-ok" style="--p:' + (c.cobr / c.fact) + '"></span>' +
        '<span class="is-pend" style="--p:' + (c.porc / c.fact) + '"></span>' +
        '<span class="is-venc" style="--p:' + (c.venc / c.fact) + '"></span></span>' +
        '<span class="log-panel-est ' + cls + '">' + est + '</span></li>';
    });
    h += '</ul></div>';

    // Costo por kilómetro
    var maxKm = Math.max.apply(null, KM.map(function (x) { return x.v; }));
    h += '<div class="log-panel-card log-panel-km" role="group" aria-labelledby="log-panel-km-t">' +
      '<div class="log-panel-card-cab"><h3 class="log-panel-h" id="log-panel-km-t">Costo por kilómetro' + chip('I') + '</h3></div><ul class="log-panel-barras log-panel-barras-chicas">';
    KM.forEach(function (x) {
      h += '<li data-flota="' + x.f + '" style="--p:' + (x.v / maxKm) + '"><span class="log-panel-fila"><span class="log-panel-n">' + esc(unidad(x.f, x.n)) + '</span>' +
        '<b class="log-panel-v" data-log-panel-km="' + x.v + '">$0,00</b></span>' + barra() + '</li>';
    });
    h += '</ul><p class="log-panel-nota">Con la foto del odómetro al salir y al llegar, o con el GPS si está conectado.</p></div>';

    // Alerta de combustible
    var maxL = Math.max.apply(null, COMB.filas.map(function (x) { return x.v; }));
    h += '<div class="log-panel-card log-panel-comb" role="group" aria-labelledby="log-panel-comb-t">' +
      '<div class="log-panel-card-cab"><h3 class="log-panel-h" id="log-panel-comb-t"><span class="log-panel-alarma" aria-hidden="true"></span>Alerta de combustible' + chip('A') + '</h3></div>' +
      '<p class="log-panel-alerta">El <b>' + esc(unidad('npr', alertaF.n)) + '</b> gasta <b class="log-panel-mas"><span data-log-panel-pct="' + masPct + '">0</span> %</b> más que los otros NPR en la misma ruta (' + esc(COMB.ruta) + ').</p>' +
      '<ul class="log-panel-barras log-panel-barras-chicas">';
    COMB.filas.forEach(function (x) {
      h += '<li class="' + (x.alerta ? 'is-alerta' : '') + '" style="--p:' + (x.v / maxL) + '"><span class="log-panel-fila"><span class="log-panel-n">' + esc(unidad('npr', x.n)) + '</span>' +
        '<b class="log-panel-v"><span data-log-panel-l="' + x.v + '">0</span> L/100 km</b></span>' + barra() + '</li>';
    });
    h += '</ul><p class="log-panel-nota">Litros cargados frente a kilómetros recorridos. Es una estimación, no un sensor.</p></div>';

    // Vencimientos y mantenimiento
    h += '<div class="log-panel-card log-panel-venc" role="group" aria-labelledby="log-panel-venc-t">' +
      '<div class="log-panel-card-cab"><h3 class="log-panel-h" id="log-panel-venc-t">Próximos vencimientos' + chip('I') + '</h3></div><ul class="log-panel-docs">';
    DOCS.forEach(function (d) {
      h += '<li class="' + (d.urge ? 'is-urge' : '') + '"><span class="log-panel-doc"><b>' + d.t + '</b><small>' + esc(d.q) + '</small></span>' +
        '<span class="log-panel-dias">vence en <b><span data-log-panel-dias="' + d.d + '">' + d.d + '</span> días</b></span></li>';
    });
    h += '</ul><p class="log-panel-sub2">Mantenimiento por kilómetros o por fecha' + chip('I') + '</p><ul class="log-panel-barras log-panel-barras-chicas log-panel-mant">';
    MANT.forEach(function (m) {
      h += '<li style="--p:' + ((m.cada - m.falta) / m.cada) + '"><span class="log-panel-fila"><span class="log-panel-n">' + m.t + ' · ' + esc(m.q) + '</span>' +
        '<b class="log-panel-v">faltan <span data-log-panel-falta="' + m.falta + '" data-log-panel-cada="' + m.cada + '">' + LOG.miles(m.falta) + '</span> km</b></span>' + barra() + '</li>';
    });
    h += '</ul></div>';

    h += '</div>';
    env.innerHTML = h;
    env.hidden = false;
    resp.hidden = true;
    resp.style.display = 'none'; // .log-grid fija display:grid, que ganaría al atributo hidden

    function q(s) { return env.querySelector(s); }
    function qa(s) { return [].slice.call(env.querySelectorAll(s)); }
    var lista = q('[data-log-panel-barras]');
    var totalEl = q('[data-log-panel-total]');
    var tp = q('#log-panel-tp');
    var tabs = qa('[data-log-panel-tab]');
    var ico = q('[data-log-panel-ico]');
    var visto = false;
    var cancelarTab = [];

    /* ---------- pestañas de ganancia ---------- */
    function pintarGanancia(k, animar) {
      cancelarTab.forEach(function (c) { c(); });
      cancelarTab = [];
      var g = GANANCIA[k];
      var max = Math.max.apply(null, g.filas.map(function (x) { return Math.abs(x.v); }));
      var total = g.filas.reduce(function (s, x) { return s + x.v; }, 0);
      var hh = '';
      g.filas.forEach(function (x) {
        var p = x.v < 0 ? 0.04 : x.v / max;
        hh += '<li class="' + (x.v < 0 ? 'is-neg ' : '') + (x.mala ? 'is-mala' : '') + '"' + (x.f ? ' data-flota="' + x.f + '"' : '') + ' style="--p:' + p + '">' +
          '<span class="log-panel-fila"><span class="log-panel-n">' + esc(x.n) + (x.tag ? ' <span class="log-panel-tag">' + x.tag + '</span>' : '') + '</span>' +
          '<b class="log-panel-v" data-v="' + x.v + '">' + (animar ? usd(0) : usd(x.v)) + '</b></span>' + barra() + '</li>';
      });
      lista.innerHTML = hh;
      marcarFlota();
      if (!animar) { totalEl.textContent = usd(total); lista.classList.add('is-lleno'); return; }
      lista.classList.remove('is-lleno');
      // forzar el estado inicial (barras en 0) antes de crecer
      void lista.offsetWidth;
      raf(function () { raf(function () { lista.classList.add('is-lleno'); }); });
      cancelarTab.push(LOG.contar(totalEl, total, 1100, usd));
      [].forEach.call(lista.querySelectorAll('[data-v]'), function (el, i) {
        cancelarTab.push(LOG.contar(el, parseFloat(el.getAttribute('data-v')), 900 + i * 90, usd));
      });
    }

    function elegir(tab, foco) {
      tabs.forEach(function (t) {
        var si = t === tab;
        t.setAttribute('aria-selected', si ? 'true' : 'false');
        t.tabIndex = si ? 0 : -1;
      });
      tp.setAttribute('aria-labelledby', tab.id);
      if (foco) tab.focus();
      var k = tab.getAttribute('data-log-panel-tab');
      pintarGanancia(k, visto && !reducir);
      if (typeof window.gtag === 'function') { try { window.gtag('event', 'logistica_panel', { corte: k }); } catch (e) { /* nada */ } }
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { if (t.getAttribute('aria-selected') !== 'true') elegir(t, false); });
      t.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % tabs.length;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') n = 0;
        else if (e.key === 'End') n = tabs.length - 1;
        if (n === null) return;
        e.preventDefault();
        elegir(tabs[n], true);
      });
    });

    /* ---------- flota elegida: silueta de la cabecera y barra resaltada ---------- */
    function marcarFlota() {
      var f = LOG.flota();
      qa('li[data-flota]').forEach(function (li) { li.classList.toggle('is-tuya', li.getAttribute('data-flota') === f); });
    }
    function ponerIco() {
      ico.innerHTML = '';
      ico.appendChild(LOG.silueta(LOG.flota()));
      marcarFlota();
    }
    ponerIco();
    LOG.alCambiar(ponerIco);

    /* ---------- estado inicial y entrada en pantalla ---------- */
    function final() {
      pintarGanancia('camion', false);
      qa('[data-log-panel-n]').forEach(function (el) { el.textContent = usd(parseFloat(el.getAttribute('data-log-panel-n'))); });
      qa('[data-log-panel-km]').forEach(function (el) { el.textContent = usd2(parseFloat(el.getAttribute('data-log-panel-km'))); });
      qa('[data-log-panel-l]').forEach(function (el) { el.textContent = el.getAttribute('data-log-panel-l'); });
      qa('[data-log-panel-pct]').forEach(function (el) { el.textContent = el.getAttribute('data-log-panel-pct'); });
      env.classList.add('is-in');
    }

    if (reducir) { final(); visto = true; return; }

    pintarGanancia('camion', false);
    totalEl.textContent = usd(0);
    qa('[data-log-panel-barras] [data-v]').forEach(function (el) { el.textContent = usd(0); });
    lista.classList.remove('is-lleno');
    qa('[data-log-panel-dias]').forEach(function (el) { el.textContent = '30'; });
    qa('[data-log-panel-falta]').forEach(function (el) { el.textContent = LOG.miles(parseFloat(el.getAttribute('data-log-panel-cada'))); });

    LOG.alVer(env, function () {
      visto = true;
      env.classList.add('is-in');
      var sel = tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0];
      pintarGanancia(sel.getAttribute('data-log-panel-tab'), true);
      qa('[data-log-panel-n]').forEach(function (el, i) { LOG.contar(el, parseFloat(el.getAttribute('data-log-panel-n')), 1200 + i * 120, usd); });
      qa('[data-log-panel-km]').forEach(function (el, i) { LOG.contar(el, parseFloat(el.getAttribute('data-log-panel-km')), 1000 + i * 80, usd2); });
      qa('[data-log-panel-l]').forEach(function (el) { LOG.contar(el, parseFloat(el.getAttribute('data-log-panel-l')), 1100); });
      qa('[data-log-panel-pct]').forEach(function (el) { LOG.contar(el, parseFloat(el.getAttribute('data-log-panel-pct')), 1400, function (v) { return String(Math.round(v)); }); });
      qa('[data-log-panel-dias]').forEach(function (el) { LOG.contar(el, parseFloat(el.getAttribute('data-log-panel-dias')), 1300, null, 30); });
      qa('[data-log-panel-falta]').forEach(function (el) {
        LOG.contar(el, parseFloat(el.getAttribute('data-log-panel-falta')), 1400, function (v) { return LOG.miles(Math.round(v / 100) * 100); }, parseFloat(el.getAttribute('data-log-panel-cada')));
      });
    }, 0.25);

    // La alarma late solo mientras el panel está en pantalla
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { env.classList.toggle('is-pausa', !e.isIntersecting); });
      }).observe(env);
    }
  }

  if (window.LOG) iniciar();
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
