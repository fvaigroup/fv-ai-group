/* /triangular/delta/logistica — núcleo de la página (window.LOG): selector de flota, aparición al bajar, cifras que
   cuentan, paralaje y utilidades para los efectos (assets/logistica-<clave>.js, cargados con defer DESPUÉS de este).
   Sin JS la página muestra todo su contenido (las seis flotas en lista y el respaldo estático de cada maqueta).
   Con prefers-reduced-motion: cambia la flota igual, pero sin paralaje, sin conteos y sin animaciones.

   API (window.LOG):
     LOG.raiz                    <main data-log>
     LOG.reducir                 true con prefers-reduced-motion (mostrar el estado final, sin animar)
     LOG.flotas                  [{ clave, nombre, corto, sil }] las seis flotas, en orden:
                                   mini · 350 · npr · 750 · torpedo · gandola   (sil = id del <symbol> SVG, p. ej. "log-sil-npr")
     LOG.flota()                 clave de la flota elegida (por defecto "350")
     LOG.datosFlota(clave?)      el objeto de LOG.flotas de esa clave (o de la elegida)
     LOG.ponerFlota(clave)       elige una flota desde código (actualiza los radios de #flota y avisa a los oyentes)
     LOG.alCambiar(fn)           fn(clave, datos) cada vez que cambia la flota; además se emite el evento
                                   «log:flota» en LOG.raiz con detail = { clave, datos }
     LOG.silueta(clave, clase?)  devuelve un <svg> nuevo con la silueta de esa flota (<use href="#log-sil-…">)
     LOG.alVer(el, fn, umbral)   fn() una sola vez cuando el elemento entra en pantalla (al instante sin IntersectionObserver)
     LOG.teclear(el, texto, ms, listo)  escribe letra por letra (al instante con reduced-motion); devuelve una función para cancelar
     LOG.tasa(fn)                fn({ rate, fecha, live }) con la tasa BCV (assets/bcv.js) cuando la haya
     LOG.num(n)                  "$2.100" · "$25" · "$12,50" (punto de miles, coma decimal, sin decimales si es entero)
     LOG.miles(n, dec?)          "2.100" · "1.234,56" (sin símbolo)
     LOG.bs(n)                   "Bs 1.234,56"
     LOG.contar(el, hasta, ms, fmt?, desde?)  cuenta de «desde» (0) a «hasta» en ms; fmt(v) da el texto (entero por defecto).
                                   Con reduced-motion escribe el valor final al instante. Devuelve una función para cancelar.
   Marcado que entiende el núcleo:
     [data-log-ve]               aparece al entrar en pantalla (clase .is-in)
     [data-log-cuenta="37"]      cifra que cuenta al verse (opcional data-log-desde="0"); el HTML ya trae el valor final
     [data-paralaje="0.2"]       se desplaza a esa fracción del scroll respecto al centro de su <section> (no con reduced-motion)
     #flota [data-log-flota]     radios del selector de flota; [data-log-flota-escena] con [data-log-flota-sil],
                                   [data-log-flota-nombre] y [data-log-flota-texto] muestra la elegida */
(function () {
  'use strict';
  var raiz = document.querySelector('[data-log]');
  if (!raiz) return;
  document.documentElement.classList.add('log-js');
  var reducir = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var SVGNS = 'http://www.w3.org/2000/svg';

  var FLOTAS = [
    { clave: 'mini', nombre: 'Mini Truck / Pick-up', corto: 'Pick-up', sil: 'log-sil-mini' },
    { clave: '350', nombre: 'Camión 350', corto: '350', sil: 'log-sil-350' },
    { clave: 'npr', nombre: 'NPR / Canter', corto: 'NPR', sil: 'log-sil-npr' },
    { clave: '750', nombre: 'Camión 750 / 600', corto: '750', sil: 'log-sil-750' },
    { clave: 'torpedo', nombre: 'Torpedo / 12 Toneladas', corto: 'Torpedo', sil: 'log-sil-torpedo' },
    { clave: 'gandola', nombre: 'Gandola (Chuto + Remolque)', corto: 'Gandola', sil: 'log-sil-gandola' }
  ];
  function datosFlota(clave) {
    for (var i = 0; i < FLOTAS.length; i++) if (FLOTAS[i].clave === clave) return FLOTAS[i];
    return null;
  }

  // ---------- formatos ----------
  function miles(n, dec) {
    n = Number(n) || 0;
    var neg = n < 0; n = Math.abs(n);
    if (dec == null) dec = Math.round(n * 100) % 100 === 0 ? 0 : 2;
    var s = n.toFixed(dec), p = s.split('.');
    var ent = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (neg ? '-' : '') + ent + (dec ? ',' + p[1] : '');
  }
  function num(n) { var s = miles(n); return s.charAt(0) === '-' ? '-$' + s.slice(1) : '$' + s; }
  function bs(n) { return 'Bs ' + miles(n, 2); }

  var raf = window.requestAnimationFrame ? function (f) { return window.requestAnimationFrame(f); } : function (f) { return setTimeout(function () { f(Date.now()); }, 16); };
  function suave(t) { return 1 - Math.pow(1 - t, 3); }
  function contar(el, hasta, ms, fmt, desde) {
    if (!el) return function () {};
    fmt = fmt || function (v) { return String(Math.round(v)); };
    desde = desde || 0;
    if (reducir) { el.textContent = fmt(hasta); return function () {}; }
    var vivo = true, t0 = null, ultimo = fmt(desde);
    el.textContent = ultimo;
    function paso(t) {
      if (!vivo) return;
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / (ms || 1200));
      var s = fmt(desde + (hasta - desde) * suave(p));
      if (s !== ultimo) { el.textContent = s; ultimo = s; }
      if (p < 1) raf(paso);
    }
    raf(paso);
    return function () { vivo = false; };
  }
  function alVer(el, fn, umbral) {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { fn(); return; }
    var o = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { o.disconnect(); fn(); }
    }, { threshold: umbral == null ? 0.3 : umbral });
    o.observe(el);
  }
  function teclear(el, texto, ms, listo) {
    var vivo = true, i = 0;
    if (reducir) { el.textContent = texto; if (listo) listo(); return function () {}; }
    el.textContent = '';
    (function paso() {
      if (!vivo) return;
      i++;
      el.textContent = texto.slice(0, i);
      if (i < texto.length) setTimeout(paso, (ms || 28) + Math.random() * 30);
      else if (listo) listo();
    })();
    return function () { vivo = false; };
  }
  function tasa(fn) {
    var intentos = 0;
    (function esperar() {
      if (window.FV_BCV) { window.FV_BCV.onChange(function (st) { if (st && st.rate) fn({ rate: st.rate, fecha: st.fecha, live: st.live }); }); return; }
      if (++intentos < 40) setTimeout(esperar, 250);
    })();
  }
  function silueta(clave, clase) {
    var d = datosFlota(clave) || FLOTAS[1];
    var svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('viewBox', '0 0 120 48');
    svg.setAttribute('class', clase || 'log-sil');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    var u = document.createElementNS(SVGNS, 'use');
    u.setAttribute('href', '#' + d.sil);
    svg.appendChild(u);
    return svg;
  }

  // ---------- selector de flota (#flota): radiogroup con flechas, Inicio y Fin ----------
  var radios = [].slice.call(raiz.querySelectorAll('[data-log-flota]'));
  var escena = raiz.querySelector('[data-log-flota-escena]');
  var actual = '350';
  var oyentes = [];
  function pintarEscena(d, animar) {
    if (!escena) return;
    var sil = escena.querySelector('[data-log-flota-sil]');
    var nom = escena.querySelector('[data-log-flota-nombre]');
    if (sil) { var u = sil.querySelector('use'); if (u) u.setAttribute('href', '#' + d.sil); }
    if (nom) nom.textContent = d.nombre;
    if (animar && !reducir) [sil, nom].forEach(function (el) { if (!el) return; el.classList.remove('is-cambia'); void el.getBoundingClientRect(); el.classList.add('is-cambia'); });
  }
  function ponerFlota(clave, origen) {
    var d = datosFlota(clave);
    if (!d) return;
    var cambio = clave !== actual;
    actual = clave;
    radios.forEach(function (r) {
      var si = r.getAttribute('data-log-flota') === clave;
      r.setAttribute('aria-checked', si ? 'true' : 'false');
      r.tabIndex = si ? 0 : -1;
    });
    pintarEscena(d, cambio);
    if (!cambio) return;
    oyentes.forEach(function (fn) { try { fn(clave, d); } catch (e) {} });
    try { raiz.dispatchEvent(new CustomEvent('log:flota', { detail: { clave: clave, datos: d } })); } catch (e) {}
    if (origen && window.gtag) { try { gtag('event', 'logistica_flota', { flota: clave }); } catch (e) {} }
  }
  radios.forEach(function (r, i) {
    r.addEventListener('click', function () { ponerFlota(r.getAttribute('data-log-flota'), true); });
    r.addEventListener('keydown', function (e) {
      var k = e.key, j = -1;
      if (k === 'ArrowRight' || k === 'ArrowDown') j = (i + 1) % radios.length;
      else if (k === 'ArrowLeft' || k === 'ArrowUp') j = (i - 1 + radios.length) % radios.length;
      else if (k === 'Home') j = 0;
      else if (k === 'End') j = radios.length - 1;
      else if (k === ' ' || k === 'Enter') { e.preventDefault(); ponerFlota(r.getAttribute('data-log-flota'), true); return; }
      if (j < 0) return;
      e.preventDefault();
      radios[j].focus();
      ponerFlota(radios[j].getAttribute('data-log-flota'), true);
    });
  });
  // estado inicial (sin avisar: no es un cambio). Los roles se ponen aquí: sin JS es una lista simple de las seis flotas.
  var grupo = raiz.querySelector('[data-log-flotas]');
  if (grupo) {
    grupo.setAttribute('role', 'radiogroup');
    [].forEach.call(grupo.children, function (li) { li.setAttribute('role', 'none'); });
  }
  radios.forEach(function (r) {
    r.setAttribute('role', 'radio');
    var si = r.getAttribute('data-log-flota') === actual;
    r.setAttribute('aria-checked', si ? 'true' : 'false');
    r.tabIndex = si ? 0 : -1;
  });
  if (escena) escena.hidden = false;
  pintarEscena(datosFlota(actual), false);

  window.LOG = {
    raiz: raiz,
    reducir: reducir,
    flotas: FLOTAS,
    flota: function () { return actual; },
    datosFlota: function (clave) { return datosFlota(clave || actual); },
    ponerFlota: function (clave) { ponerFlota(clave, false); },
    alCambiar: function (fn) { if (typeof fn === 'function') oyentes.push(fn); },
    silueta: silueta,
    alVer: alVer,
    teclear: teclear,
    tasa: tasa,
    num: num,
    miles: miles,
    bs: bs,
    contar: contar
  };

  // ---------- aparición suave al entrar en pantalla ----------
  var ves = [].slice.call(raiz.querySelectorAll('[data-log-ve]'));
  if (reducir || !('IntersectionObserver' in window)) ves.forEach(function (el) { el.classList.add('is-in'); });
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    ves.forEach(function (el) { io.observe(el); });
  }

  // ---------- cifras que cuentan (el HTML ya trae el valor final) ----------
  [].forEach.call(raiz.querySelectorAll('[data-log-cuenta]'), function (n) {
    var hasta = parseFloat(n.getAttribute('data-log-cuenta'));
    var desde = parseFloat(n.getAttribute('data-log-desde')) || 0;
    if (isNaN(hasta) || reducir || !('IntersectionObserver' in window)) return;
    n.textContent = String(desde);
    alVer((n.closest && n.closest('li')) || n, function () { contar(n, hasta, Math.abs(hasta - desde) > 9 ? 1400 : 900, null, desde); }, 0.5);
  });

  // ---------- las manchas de la malla (animación infinita con blur) se pausan fuera de pantalla ----------
  if (!reducir && 'IntersectionObserver' in window) {
    var mo = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('is-pausa', !e.isIntersecting); });
    }, { rootMargin: '150px 0px' });
    [].forEach.call(raiz.querySelectorAll('.log-mesh'), function (m) { mo.observe(m); });
  }

  // ---------- paralaje: cada [data-paralaje] se mueve respecto al centro de su sección ----------
  if (reducir) return;
  var capas = [].slice.call(raiz.querySelectorAll('[data-paralaje]')).map(function (el) {
    return { el: el, v: parseFloat(el.getAttribute('data-paralaje')) || 0, sec: el.closest('section') || raiz };
  });
  if (!capas.length) return;
  var pendiente = false;
  function pintar() {
    pendiente = false;
    var vh = window.innerHeight;
    capas.forEach(function (c) {
      var r = c.sec.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var d = (r.top + r.height / 2) - vh / 2;
      c.el.style.transform = 'translate3d(0,' + (-d * c.v).toFixed(1) + 'px,0)';
    });
  }
  function pedir() { if (!pendiente) { pendiente = true; raf(pintar); } }
  addEventListener('scroll', pedir, { passive: true });
  addEventListener('resize', pedir, { passive: true });
  pintar();
})();
