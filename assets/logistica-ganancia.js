/* /triangular/delta/logistica · #ganancia: consola «logística — ganancia del viaje» que teclea el cálculo línea por línea
   (tarifa − combustible − peajes − viáticos − pago al fletero = ganancia), la ganancia en grande con su equivalente en
   bolívares a la tasa BCV en vivo (sin tasa en vivo: solo dólares, y lo dice) y el «Reporte de devaluación» con una
   variación HIPOTÉTICA del bolívar. Tres viajes de ejemplo que se alternan con botones. Montos ficticios: solo los escribe
   este archivo, dentro de la maqueta rotulada «Ejemplo ilustrativo».
   Se pausa fuera de pantalla y con la pestaña oculta (solo setTimeout, sin intervalos). Con reduced-motion: estado final.
   Sin JS queda la fórmula del HTML. */
(function () {
  'use strict';
  function iniciar() {
    var LOG = window.LOG;
    if (!LOG) return;
    var caja = LOG.raiz.querySelector('[data-log-ganancia]');
    if (!caja) return;
    var app = caja.querySelector('[data-log-ganancia-app]');
    var grupo = caja.querySelector('[data-log-ganancia-viajes]');
    var ficha = caja.querySelector('[data-log-ganancia-ficha]');
    var cuerpo = caja.querySelector('[data-log-ganancia-cuerpo]');
    var sr = caja.querySelector('[data-log-ganancia-sr]');
    if (!app || !grupo || !ficha || !cuerpo) return;

    // Viajes de ejemplo (USD). v = variación hipotética del bolívar entre el día del viaje y el del cobro.
    var VIAJES = [
      { id: 'corta', t: 'Ruta corta', s: 'Camión propio', cod: 'V-0142', de: 'Valencia', a: 'Caracas', flota: '350', propio: true,
        tarifa: 280, comb: 45, peajes: 8, viat: 20, flet: 0, dias: 15, v: 0.03 },
      { id: 'larga', t: 'Ruta larga', s: 'Camión propio', cod: 'V-0158', de: 'Valencia', a: 'Maturín', flota: '750', propio: true,
        tarifa: 950, comb: 210, peajes: 24, viat: 80, flet: 0, dias: 30, v: 0.06 },
      { id: 'fletero', t: 'Ruta larga', s: 'Fletero externo', cod: 'V-0163', de: 'Barquisimeto', a: 'Puerto La Cruz', flota: 'gandola', propio: false,
        tarifa: 1400, comb: 0, peajes: 32, viat: 0, flet: 1100, dias: 30, v: 0.06, notaComb: 'lo pone el fletero', notaViat: 'los cubre el fletero' }
    ];
    function r2(n) { return Math.round(n * 100) / 100; }
    function calc(x) {
      var g = x.tarifa - x.comb - x.peajes - x.viat - x.flet;
      var perdida = r2(x.tarifa * x.v / (1 + x.v));
      return { g: g, perdida: perdida, recibe: r2(x.tarifa - perdida), real: r2(g - perdida), pct: Math.round(x.v * 100) };
    }

    var tasa = null; // { rate, fecha, live }
    function fecha(iso) {
      var d = new Date(iso);
      if (!iso || isNaN(d)) return '';
      var o = { day: '2-digit', month: '2-digit', year: 'numeric' };
      try { o.timeZone = 'America/Caracas'; return d.toLocaleDateString('es-VE', o); }
      catch (e) { try { delete o.timeZone; return d.toLocaleDateString('es-VE', o); } catch (e2) { return ''; } }
    }
    function enVivo() { return !!(tasa && tasa.live && tasa.rate > 0); }

    var actual = VIAJES[0];

    /* ---------------- botones de viaje ---------------- */
    var botones = VIAJES.map(function (x) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'log-ganancia-btn';
      b.setAttribute('aria-pressed', x === actual ? 'true' : 'false');
      var t = document.createElement('b'); t.textContent = x.t;
      var s = document.createElement('span'); s.textContent = x.s;
      b.appendChild(t); b.appendChild(s);
      b.addEventListener('click', function () { elegir(x); });
      grupo.appendChild(b);
      return b;
    });

    /* ---------------- ficha del viaje (decorativa: el texto sr-only la describe) ---------------- */
    function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
    function pintarFicha(x) {
      var d = LOG.datosFlota(x.flota);
      ficha.textContent = '';
      var ruta = el('div', 'log-ganancia-ruta');
      ruta.appendChild(el('b', null, x.de)); ruta.appendChild(el('i')); ruta.appendChild(el('b', null, x.a));
      ficha.appendChild(ruta);
      var sil = el('div', 'log-ganancia-silbox');
      sil.appendChild(LOG.silueta(x.flota, 'log-sil log-ganancia-sil'));
      ficha.appendChild(sil);
      [['Viaje', x.cod], ['Camión', d ? d.nombre : ''], ['Quién lo mueve', x.s], ['Cobro', 'En bolívares, a ' + x.dias + ' días']].forEach(function (f) {
        var p = el('p', 'log-ganancia-f');
        p.appendChild(el('span', null, f[0])); p.appendChild(el('b', null, f[1]));
        ficha.appendChild(p);
      });
      ficha.classList.remove('is-cambia'); void ficha.offsetWidth; ficha.classList.add('is-cambia');
    }

    /* ---------------- consola ---------------- */
    var cursor = el('span', 'log-ganancia-cur');
    var filas = [];      // { el, cmd, txt, tipo }
    var grande = null;   // <span> de la cifra grande
    var bsEl = null;     // línea de bolívares

    function textoBs(x) {
      var g = calc(x).g;
      if (!enVivo()) return 'Sin la tasa BCV en vivo ahora mismo: el ejemplo va solo en dólares.';
      var f = fecha(tasa.fecha);
      return '≈ ' + LOG.bs(g * tasa.rate) + ' a la tasa BCV de hoy (' + LOG.bs(tasa.rate) + (f ? ' · ' + f : '') + ').';
    }
    function pintarBs() {
      if (!bsEl) return;
      var t = textoBs(actual);
      if (bsEl.textContent !== t) bsEl.textContent = t;
      bsEl.classList.toggle('is-vivo', enVivo());
    }

    function fila(op, etq, monto, cls, nota) {
      var p = el('p', 'log-ganancia-l' + (cls ? ' ' + cls : ''));
      p.appendChild(el('span', 'log-ganancia-op', op));
      var e = el('span', 'log-ganancia-et', etq);
      if (nota) e.appendChild(el('small', null, ' · ' + nota));
      p.appendChild(e);
      p.appendChild(el('span', 'log-ganancia-m', monto));
      return p;
    }
    function orden(txt) {
      var p = el('p', 'log-ganancia-l log-ganancia-cmd');
      p.appendChild(el('span', 'log-ganancia-pr', '> '));
      var t = el('span', 'log-ganancia-tx', txt);
      p.appendChild(t);
      return { el: p, cmd: true, txt: txt, t: t };
    }

    function construir(x, pend) {
      var c = calc(x), N = LOG.num;
      filas = [];
      cuerpo.textContent = '';
      function add(o) { if (!o.el) o = { el: o }; filas.push(o); cuerpo.appendChild(o.el); return o; }
      add(orden('logistica ganancia --viaje ' + x.cod));
      add(fila(' ', 'Tarifa del flete', N(x.tarifa), 'log-ganancia-tar'));
      add(fila('−', 'Combustible', N(x.comb), null, x.notaComb));
      add(fila('−', 'Peajes', N(x.peajes)));
      add(fila('−', 'Viáticos', N(x.viat), null, x.notaViat));
      add(fila('−', 'Pago al fletero', N(x.flet), null, x.propio ? 'camión propio' : null));
      add(el('p', 'log-ganancia-l log-ganancia-raya'));
      add(fila('=', 'Ganancia del viaje', N(c.g), 'log-ganancia-tot'));
      // resultado en grande
      var res = el('div', 'log-ganancia-res');
      res.appendChild(el('span', 'log-ganancia-res-t', 'Te queda de este viaje'));
      grande = el('span', 'log-ganancia-n', N(c.g));
      res.appendChild(grande);
      bsEl = el('span', 'log-ganancia-bs');
      res.appendChild(bsEl);
      add({ el: res, res: true });
      pintarBs();
      // reporte de devaluación (variación hipotética)
      add(orden('logistica devaluacion --cobro +' + x.dias + 'd'));
      add(fila(' ', 'Variación hipotética del bolívar', c.pct + ' %', 'log-ganancia-hip'));
      add(fila(' ', 'Facturado en Bs el día del viaje', N(x.tarifa)));
      add(fila(' ', 'Lo que vale al cobrar, ' + x.dias + ' días después', N(c.recibe)));
      add(fila('−', 'Pérdida por devaluación', N(c.perdida), 'log-ganancia-per'));
      add(fila('=', 'Ganancia real del viaje', N(c.real), 'log-ganancia-real'));
      var fin = el('p', 'log-ganancia-l log-ganancia-cmd log-ganancia-fin');
      fin.appendChild(el('span', 'log-ganancia-pr', '> '));
      add({ el: fin, fin: true });
      if (pend) {
        filas.forEach(function (f) { f.el.classList.add('is-pend'); if (f.cmd) f.t.textContent = ''; });
        grande.textContent = N(0);
      } else {
        fin.appendChild(cursor);
      }
      if (sr) {
        sr.textContent = 'Ejemplo ilustrativo. Viaje de ' + x.de + ' a ' + x.a + ' en ' + (LOG.datosFlota(x.flota) || {}).nombre + ', ' + x.s.toLowerCase() +
          ': tarifa ' + N(x.tarifa) + ', menos combustible ' + N(x.comb) + ', peajes ' + N(x.peajes) + ', viáticos ' + N(x.viat) +
          ' y pago al fletero ' + N(x.flet) + '. Ganancia del viaje: ' + N(c.g) + '. Reporte de devaluación: si se cobra en bolívares ' + x.dias +
          ' días después, con una variación hipotética del ' + c.pct + ' %, se pierden ' + N(c.perdida) + ' y la ganancia real queda en ' + N(c.real) + '.';
      }
    }

    /* ---------------- reproductor (pausable) ---------------- */
    var visible = false, enEspera = null, timer = 0, token = 0, i = 0;
    var cancelar = [], empezado = false;
    function activo() { return visible && !document.hidden; }
    function limpiar() {
      token++;
      if (timer) { clearTimeout(timer); timer = 0; }
      enEspera = null;
      cancelar.forEach(function (f) { try { f(); } catch (e) {} });
      cancelar = [];
    }
    function luego(fn, ms) {
      var tk = token;
      timer = setTimeout(function () {
        timer = 0;
        if (tk !== token) return;
        if (!activo()) { enEspera = fn; return; }
        fn();
      }, ms);
    }
    function reanudar() {
      if (!activo() || !enEspera) return;
      var f = enEspera; enEspera = null; f();
    }
    function paso() {
      var tk = token;
      var f = filas[i];
      if (!f) return;
      f.el.classList.remove('is-pend');
      if (f.fin) { f.el.appendChild(cursor); return; }
      if (f.cmd) {
        f.el.appendChild(cursor);
        cancelar.push(LOG.teclear(f.t, f.txt, 4, function () {
          if (tk !== token) return;
          i++; luego(paso, 140);
        }));
        return;
      }
      f.el.appendChild(cursor);
      if (f.res) {
        cancelar.push(LOG.contar(grande, calc(actual).g, 600, LOG.num));
        i++; luego(paso, 300);
        return;
      }
      i++;
      var sig = filas[i];
      luego(paso, sig && sig.cmd ? 260 : (f.el.classList.contains('log-ganancia-raya') ? 60 : 90));
    }
    function correr() {
      empezado = true;
      limpiar();
      if (LOG.reducir) { construir(actual, false); return; }
      construir(actual, true);
      i = 0;
      if (activo()) paso(); else enEspera = paso;
    }

    function elegir(x) {
      if (x === actual) return;
      actual = x;
      botones.forEach(function (b, k) { b.setAttribute('aria-pressed', VIAJES[k] === x ? 'true' : 'false'); });
      pintarFicha(x);
      correr();
      if (window.gtag) { try { gtag('event', 'logistica_ganancia', { viaje: x.id }); } catch (e) {} }
    }

    LOG.tasa(function (t) {
      if (!t || !(t.rate > 0)) return;
      tasa = t;
      pintarBs();
    });

    // estado inicial
    app.hidden = false;
    caja.classList.add('is-listo');
    pintarFicha(actual);
    if (LOG.reducir || !('IntersectionObserver' in window)) {
      construir(actual, false);
      visible = true;
    } else {
      construir(actual, true);
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        caja.classList.toggle('is-activo', visible);
        reanudar();
      }, { threshold: 0 }).observe(cuerpo);
      LOG.alVer(cuerpo, function () { if (!empezado) correr(); }, 0.15);
      document.addEventListener('visibilitychange', reanudar);
    }
  }
  if (window.LOG) iniciar();
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else setTimeout(iniciar, 0);
})();
