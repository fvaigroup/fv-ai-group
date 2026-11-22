/* /triangular/delta/logistica: «El viaje, paso a paso» (#viaje, [data-log-viaje]).
   - Escribe los montos y horas de ejemplo (el HTML no trae cifras; cada pantalla lleva «Ejemplo ilustrativo»).
   - Celular, tableta o sin sticky posible: lista; la pantalla de cada paso se anima una vez al verse (.is-activo).
   - Escritorio (≥1024 px y ≥640 px de alto, sin reduced-motion): .is-fijo; copia las pantallas al teléfono sticky
     y, al bajar, activa el paso cuyo borde superior pasó la mitad de la ventana. Solo escucha el scroll con la sección en pantalla.
   - reduced-motion: todas las pantallas en su estado final, sin animar.
   - El camión de la orden y de la foto sigue al selector de flota (LOG.alCambiar). */
(function () {
  'use strict';
  function iniciar() {
    var LOG = window.LOG;
    if (!LOG) return;
    var raiz = LOG.raiz.querySelector('[data-log-viaje]');
    if (!raiz) return;
    var sec = raiz.closest('section') || raiz;
    var pasos = [].slice.call(raiz.querySelectorAll('.log-viaje-paso'));
    var pants = pasos.map(function (li) { return li.querySelector('.log-viaje-pant'); });
    var capasEl = raiz.querySelector('[data-viaje-capas]');
    var progEl = raiz.querySelector('[data-viaje-prog]');
    var pasoTxt = raiz.querySelector('[data-viaje-paso-txt]');
    if (pasos.length < 2) return;

    // ---------- datos de ejemplo (ilustrativos) ----------
    var V = { tarifa: 450, comb: 120, peaje: 15, viat: 20, flet: 0 };
    V.gan = V.tarifa - V.comb - V.peaje - V.viat - V.flet;
    var hoy = new Date();
    function dos(n) { return (n < 10 ? '0' : '') + n; }
    var T = { hora1: '7:40 a. m.', hora2: '11:15 a. m.', hora3: '3:05 p. m.', fecha: dos(hoy.getDate()) + '/' + dos(hoy.getMonth() + 1) + '/' + hoy.getFullYear() };
    var bsTxt = null;

    function texto(clave, el) {
      if (T[clave]) return T[clave];
      if (clave === 'bs') return bsTxt || '';
      if (V[clave] == null) return '';
      return (el.hasAttribute('data-menos') ? '− ' : '') + LOG.num(V[clave]);
    }
    function llenar(caja) {
      [].forEach.call(caja.querySelectorAll('[data-v]'), function (el) {
        var t = texto(el.getAttribute('data-v'), el);
        if (el.textContent !== t) el.textContent = t;
      });
    }
    function siluetas(caja) {
      var d = LOG.datosFlota();
      [].forEach.call(caja.querySelectorAll('[data-viaje-sil]'), function (el) {
        var u = el.querySelector('use');
        if (u) u.setAttribute('href', '#' + d.sil);
        else el.appendChild(LOG.silueta(d.clave));
      });
      [].forEach.call(caja.querySelectorAll('[data-viaje-flota]'), function (el) { el.textContent = d.nombre; });
    }
    llenar(raiz);
    siluetas(raiz);

    // Monto en bolívares solo con la tasa BCV en vivo
    LOG.tasa(function (st) {
      if (!st || !st.live || !st.rate) return;
      bsTxt = LOG.bs(V.tarifa * st.rate);
      [].forEach.call(raiz.querySelectorAll('[data-viaje-bs]'), function (el) { el.hidden = false; });
      llenar(raiz);
    });
    LOG.alCambiar(function () { siluetas(raiz); });

    // ---------- animar una pantalla (o capa) ----------
    var cuentas = [];
    function pararCuentas() { cuentas.forEach(function (c) { c.parar(); c.el.textContent = c.fin; }); cuentas = []; }
    function animar(caja) {
      caja.classList.remove('is-activo');
      void caja.offsetWidth;
      caja.classList.add('is-activo');
      [].forEach.call(caja.querySelectorAll('[data-cuenta]'), function (el) {
        var k = el.getAttribute('data-v');
        if (V[k] == null) return;
        cuentas.push({ el: el, fin: LOG.num(V[k]), parar: LOG.contar(el, V[k], 1100, function (v) { return LOG.num(Math.round(v)); }) });
      });
    }

    // reduced-motion: todo en su estado final
    if (LOG.reducir) {
      pants.forEach(function (p) { if (p) p.classList.add('is-activo'); });
      return;
    }

    // ---------- modo lista: cada pantalla anima una vez al verse ----------
    var vistas = [];
    pants.forEach(function (p, i) {
      if (!p) return;
      LOG.alVer(p, function () { vistas[i] = true; if (!fijoOn) animar(p); }, 0.35);
    });

    // ---------- modo fijo (escritorio) ----------
    function stickyPosible() {
      if (!(window.CSS && CSS.supports && CSS.supports('position', 'sticky'))) return false;
      for (var el = raiz.parentElement; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
        var cs = getComputedStyle(el);
        if (/auto|scroll|hidden/.test(cs.overflowX + ' ' + cs.overflowY)) return false;
      }
      return true;
    }
    var mq = window.matchMedia ? matchMedia('(min-width: 1024px) and (min-height: 640px)') : null;
    var fijoOn = false, visible = false, activo = -1, capas = [], pendiente = false;
    var progLis = progEl ? [].slice.call(progEl.children) : [];

    function armarCapas() {
      if (capas.length || !capasEl) return;
      pants.forEach(function (p) {
        var c = document.createElement('div');
        c.className = 'log-viaje-capa';
        var app = p && p.querySelector('.log-viaje-app');
        if (app) c.appendChild(app.cloneNode(true));
        capasEl.appendChild(c);
        capas.push(c);
      });
    }
    function activar(i) {
      activo = i;
      pasos.forEach(function (li, j) {
        li.classList.toggle('is-activo', j === i);
        if (j === i) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
      });
      progLis.forEach(function (li, j) { li.classList.toggle('is-hecho', j <= i); });
      if (pasoTxt) pasoTxt.textContent = 'Paso ' + (i + 1) + ' de ' + pasos.length;
      pararCuentas();
      capas.forEach(function (c, j) {
        if (j === i) animar(c);
        else c.classList.remove('is-activo');
      });
    }
    function pintar() {
      pendiente = false;
      if (!fijoOn || document.hidden) return;
      var linea = window.innerHeight * 0.5, i = 0;
      for (var j = 0; j < pasos.length; j++) {
        if (pasos[j].getBoundingClientRect().top <= linea) i = j;
      }
      if (i !== activo) activar(i);
    }
    function pedir() {
      if (pendiente) return;
      pendiente = true;
      (window.requestAnimationFrame || function (f) { setTimeout(f, 16); })(pintar);
    }
    function escuchar(si) {
      if (si) { window.addEventListener('scroll', pedir, { passive: true }); pedir(); }
      else window.removeEventListener('scroll', pedir);
    }
    function encender() {
      fijoOn = true;
      armarCapas();
      raiz.classList.add('is-fijo');
      activo = -1;
      if (visible) escuchar(true);
    }
    function apagar() {
      fijoOn = false;
      escuchar(false);
      pararCuentas();
      raiz.classList.remove('is-fijo');
      pasos.forEach(function (li) { li.classList.remove('is-activo'); li.removeAttribute('aria-current'); });
      capas.forEach(function (c) { c.classList.remove('is-activo'); });
      activo = -1;
      // las pantallas de la lista que ya se vieron quedan en su estado final
      pants.forEach(function (p, i) { if (p && vistas[i]) { p.classList.add('is-activo'); } });
    }
    function evaluar() {
      var quiere = !!(mq && mq.matches) && stickyPosible();
      if (quiere && !fijoOn) encender();
      else if (!quiere && fijoOn) apagar();
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        if (fijoOn) escuchar(visible);
      }, { rootMargin: '100px 0px' }).observe(sec);
    } else visible = true;

    if (mq) {
      if (mq.addEventListener) mq.addEventListener('change', evaluar);
      else if (mq.addListener) mq.addListener(evaluar);
    }
    document.addEventListener('visibilitychange', function () { if (!document.hidden && fijoOn && visible) pedir(); });
    evaluar();
  }
  if (window.LOG) iniciar();
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else setTimeout(iniciar, 0);
})();
