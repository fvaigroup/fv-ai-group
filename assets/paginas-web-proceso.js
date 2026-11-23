/* /triangular/paginas-web — efecto «proceso» (Cómo trabajamos). Usa window.WEB (assets/paginas-web.js).
   - Escritorio (≥ 1024 px): el panel sticky [data-web-proceso] (zigzag de 7 nodos, aria-hidden) sigue el scroll de la lista:
     el trazo degradado se llena, cada nodo se enciende y la cabecera dice «Paso n de 7» con el título del paso.
   - Celular y tablet: el panel se oculta; la lista ol[data-web-pasos] lleva una línea vertical que se llena y cada paso se enciende.
   - Formas de pago: chips de vidrio con icono (clase en .web-pago) y la tasa BCV en el panel solo si llegó en vivo.
   Los 7 pasos y las formas de pago se leen tal cual: solo se les agregan clases y variables CSS.
   Con prefers-reduced-motion: estado final (todo encendido) sin animar. Escucha el scroll solo con la sección en pantalla. */
(function () {
  'use strict';
  var W = window.WEB;
  if (!W) return;
  var cont = W.montar('proceso');
  var lista = W.raiz.querySelector('[data-web-pasos]');
  var sec = document.getElementById('proceso');
  if (!lista || !sec) return;
  var pasos = [].slice.call(lista.querySelectorAll('.web-paso[data-web-paso]'));
  if (!pasos.length) return;
  var total = pasos.length;
  var titulos = pasos.map(function (li) {
    var t = li.querySelector('.web-paso-t');
    return (t ? t.textContent : '').trim().replace(/[.:]+$/, '');
  });

  var panel = cont && cont.querySelector('.web-proceso-panel');
  var nodos = panel ? [].slice.call(panel.querySelectorAll('[data-web-proceso-nodo]')) : [];
  var lleno = panel && panel.querySelector('.web-proceso-lleno');
  var barra = panel && panel.querySelector('[data-web-proceso-barra]');
  var nEl = panel && panel.querySelector('[data-web-proceso-n]');
  var deEl = panel && panel.querySelector('[data-web-proceso-de]');
  var tEl = panel && panel.querySelector('[data-web-proceso-t]');
  var bcvEl = panel && panel.querySelector('[data-web-proceso-bcv]');
  var pago = sec.querySelector('.web-pago');

  lista.classList.add('web-proceso-linea');
  if (panel) panel.classList.add('web-proceso-vivo');
  if (cont) cont.classList.add('web-proceso-movil'); // respaldo de :has(): el contenedor se oculta < 1024 px
  if (pago) pago.classList.add('web-proceso-pago');

  // ---------- pintar un avance f ∈ [0, total − 1] (paso actual = el último encendido) ----------
  var ultimoActual = -2;
  function pintar(f, actual) {
    var frac = total > 1 ? f / (total - 1) : 1;
    pasos.forEach(function (li, i) {
      li.classList.toggle('is-on', i <= actual);
      li.classList.toggle('is-actual', i === actual);
    });
    nodos.forEach(function (g, i) {
      g.classList.toggle('is-on', i <= actual);
      g.classList.toggle('is-actual', i === actual);
    });
    if (lleno) lleno.style.strokeDashoffset = (1 - frac).toFixed(4);
    if (barra) barra.style.transform = 'scaleX(' + ((actual + 1) / total).toFixed(4) + ')';
    if (actual !== ultimoActual && nEl) {
      var i = Math.max(0, actual);
      nEl.textContent = String(i + 1);
      deEl.textContent = 'de ' + total;
      tEl.textContent = titulos[i];
      if (!W.reducir) { tEl.classList.remove('is-cambia'); void tEl.offsetWidth; tEl.classList.add('is-cambia'); }
    }
    ultimoActual = actual;
  }

  // ---------- estado final, sin animar ----------
  function lineaMovil(p) {
    var a = pasos[0], b = pasos[total - 1];
    var y0 = a.offsetTop + centro(a), y1 = b.offsetTop + centro(b);
    lista.style.setProperty('--web-proceso-y', y0 + 'px');
    lista.style.setProperty('--web-proceso-h', Math.max(0, y1 - y0) + 'px');
    if (p != null) lista.style.setProperty('--web-proceso-p', p.toFixed(4));
    return [y0, y1];
  }
  // centro vertical del número del paso (top 1.15rem + mitad de 2.1rem), leído del ::before
  var cacheCentro = null;
  function centro(li) {
    if (cacheCentro == null) {
      var cs = getComputedStyle(li, '::before');
      var top = parseFloat(cs.top), h = parseFloat(cs.height);
      cacheCentro = (isNaN(top) || isNaN(h)) ? 35 : top + h / 2;
    }
    return cacheCentro;
  }

  if (W.reducir) {
    pintar(total - 1, total - 1);
    lista.style.setProperty('--web-proceso-p', '1');
    lineaMovil(1);
    addEventListener('resize', function () { lineaMovil(1); }, { passive: true });
  } else {
    pintar(0, -1);
    var pendiente = false, activo = false;
    var raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };
    // posiciones de los pasos dentro de la lista: se leen una vez (y al cambiar el tamaño o cargar las fuentes), no en cada cuadro,
    // para no forzar un recálculo de layout después de cambiar las clases. En escritorio la línea de la lista no se ve: no se toca.
    var escritorio = window.matchMedia ? window.matchMedia('(min-width: 1024px)') : { matches: false };
    var tops = null, ext = null;
    var leerLayout = function () {
      var c = centro(pasos[0]);
      tops = pasos.map(function (li) { return li.offsetTop + c; });
      ext = lineaMovil(null);
    };
    var medir = function () {
      pendiente = false;
      if (!tops) leerLayout();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var linea = vh * 0.58; // línea de activación
      var base = lista.getBoundingClientRect().top;
      var ys = tops.map(function (t) { return base + t; });
      var actual = -1;
      for (var i = 0; i < total; i++) if (ys[i] <= linea) actual = i;
      var f;
      if (linea <= ys[0]) f = 0;
      else if (linea >= ys[total - 1]) f = total - 1;
      else {
        f = actual;
        var d = ys[actual + 1] - ys[actual];
        f += d > 0 ? (linea - ys[actual]) / d : 0;
      }
      pintar(f, actual);
      if (escritorio.matches) return;
      var p = (linea - base - ext[0]) / Math.max(1, ext[1] - ext[0]);
      lista.style.setProperty('--web-proceso-p', Math.max(0, Math.min(1, p)).toFixed(4));
    };
    var pedir = function () { if (!pendiente) { pendiente = true; raf(medir); } };
    var alCambiarTam = function () { cacheCentro = null; tops = null; pedir(); };
    var encender = function (si) {
      if (si === activo) return;
      activo = si;
      if (panel) panel.classList.toggle('is-pausa', !si);
      if (si) {
        addEventListener('scroll', pedir, { passive: true });
        addEventListener('resize', alCambiarTam, { passive: true });
        pedir();
      } else {
        removeEventListener('scroll', pedir);
        removeEventListener('resize', alCambiarTam);
      }
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { encender(es[0].isIntersecting); }, { rootMargin: '100px 0px' }).observe(sec);
      if (panel) panel.classList.add('is-pausa');
    } else encender(true);
    // las fuentes pueden cambiar las alturas de los pasos
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(alCambiarTam);
  }

  // ---------- tasa BCV en el panel: solo la tasa en vivo (si no llega, no se muestra ninguna cifra) ----------
  W.tasa(function (t) {
    if (!t || !t.rate) return;
    if (pago) pago.classList.toggle('web-proceso-vivo', !!t.live);
    if (!bcvEl) return;
    if (!t.live) { bcvEl.hidden = true; return; }
    bcvEl.textContent = '';
    bcvEl.appendChild(document.createTextNode('En bolívares, a la tasa BCV de hoy: '));
    var s = document.createElement('strong');
    s.textContent = W.bs(t.rate);
    bcvEl.appendChild(s);
    bcvEl.hidden = false;
  });
})();
