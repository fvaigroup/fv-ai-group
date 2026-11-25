/* Inicio (index.html) — núcleo de los efectos del rediseño (window.INI): aparición al bajar, paralaje, cifras que cuentan,
   pausa de las mallas y animaciones fuera de pantalla, y utilidades para los efectos (assets/inicio-<clave>.js, cargados con defer DESPUÉS de este).
   Sigue el patrón de assets/paginas-web.js (window.WEB). Se carga con defer después de assets/inicio.js (que maneja las figuras, el diagnóstico,
   el manifiesto y los avisos de Luci; este archivo no los toca).
   Sin JS el inicio muestra todo su contenido. Con prefers-reduced-motion: sin paralaje, sin conteos, sin apariciones y sin malla animada.
   No guarda nada en el navegador ni llama a servidores (la tasa BCV, si un efecto la pide, la trae assets/bcv.js).

   API (window.INI):
     INI.raiz                       <main id="main-content">
     INI.reducido()                 true con prefers-reduced-motion (mostrar el estado final, sin animar). También INI.reducir (booleano, igual a reducido() al cargar).
     INI.escritorio()               true con ancho >= 1024 px
     INI.puntero()                  true con mouse o trackpad (hover: hover y pointer: fine)
     INI.alVer(el, fn, umbral?)     fn() una sola vez cuando el elemento entra en pantalla (umbral 0..1, por defecto 0.3; al instante sin IntersectionObserver)
     INI.enPantalla(el, fn, margen?) fn(true|false) cada vez que el elemento entra o sale de pantalla (margen: rootMargin, por defecto '150px 0px').
                                    Úsese para arrancar y detener bucles con requestAnimationFrame. Devuelve una función para dejar de observar.
     INI.paralaje(el, v?)           registra una capa de paralaje (v = fracción del scroll; por defecto su data-paralaje). Se mueve con transform respecto
                                    al centro de su <section> (o de su malla, si es fija), acotado a ±1 pantalla. No hace nada con reduced-motion.
                                    Las [data-paralaje] que ya están en el HTML las registra el núcleo al cargar.
                                    OJO: la capa debe ser un envoltorio sin otro transform propio (el paralaje escribe style.transform).
     INI.contar(el, hasta, ms?, fmt?, desde?)  cuenta de «desde» (0) a «hasta» en ms (1200); fmt(v) da el texto (entero por defecto).
                                    Con reduced-motion escribe el valor final al instante. Devuelve una función para cancelar.
     INI.raf(fn)                    requestAnimationFrame (o setTimeout de 16 ms)
     INI.montar(clave)              el contenedor del efecto: [data-ini-montaje="clave"] (claves: hero, marcas, lineas, como, manifiesto, caos,
                                    brecha, faqcierre, guia). Dentro están los marcadores <!-- ini:clave:inicio --><!-- ini:clave:fin -->;
                                    vacío no ocupa lugar (.ini-montaje:empty).
     INI.wa(texto)                  URL de WhatsApp (584244125386) con ese mensaje (empezar con «Hola F&V»; sin precios)
     INI.tasa(fn)                   fn({ rate, fecha, live }) con la tasa BCV (assets/bcv.js) cuando la haya; si no llega, fn no se llama.
     INI.miles(n, dec?)             "2.100" · "1.234,56" (punto de miles, coma decimal, sin símbolo)
   Marcado que entiende el núcleo:
     [data-ini-ve]                  aparece al entrar en pantalla (clase .is-in; solo con JS: html.ini-fx)
     [data-ini-cuenta="90"]         cifra que cuenta al verse (opcional data-ini-desde="0"); el HTML ya trae el valor final
     [data-paralaje="0.2"]          capa de paralaje
     [data-ini-pausa]               sus animaciones CSS se pausan fuera de pantalla (clase .is-pausa)
     .ini-mesh                      malla de degradados: se pausa (clase .is-pausa) fuera de pantalla; en secciones de más de 2 pantallas pasa a .ini-mesh-fija */
(function () {
  'use strict';
  var raiz = document.getElementById('main-content');
  if (!raiz || !document.getElementById('inicio')) return;
  document.documentElement.classList.add('ini-fx');
  var mq = function (q) { return !!(window.matchMedia && window.matchMedia(q).matches); };
  var reducir = mq('(prefers-reduced-motion: reduce)');
  function reducido() { return mq('(prefers-reduced-motion: reduce)'); }
  function escritorio() { return mq('(min-width: 1024px)'); }
  function puntero() { return mq('(hover: hover) and (pointer: fine)'); }
  var hayIO = 'IntersectionObserver' in window;

  var raf = window.requestAnimationFrame ? function (f) { return window.requestAnimationFrame(f); } : function (f) { return setTimeout(function () { f(Date.now()); }, 16); };
  function suave(t) { return 1 - Math.pow(1 - t, 3); }

  function miles(n, dec) {
    n = Number(n) || 0;
    var neg = n < 0; n = Math.abs(n);
    if (dec == null) dec = Math.round(n * 100) % 100 === 0 ? 0 : 2;
    var s = n.toFixed(dec), p = s.split('.');
    return (neg ? '-' : '') + p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (dec ? ',' + p[1] : '');
  }
  function wa(texto) { return 'https://wa.me/584244125386?text=' + encodeURIComponent(texto); }

  function contar(el, hasta, ms, fmt, desde) {
    if (!el) return function () {};
    fmt = fmt || function (v) { return String(Math.round(v)); };
    desde = desde || 0;
    if (reducido()) { el.textContent = fmt(hasta); return function () {}; }
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
    if (!hayIO) { fn(); return; }
    var o = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { o.disconnect(); fn(); }
    }, { threshold: umbral == null ? 0.3 : umbral });
    o.observe(el);
  }
  function enPantalla(el, fn, margen) {
    if (!el) return function () {};
    if (!hayIO) { fn(true); return function () {}; }
    var o = new IntersectionObserver(function (es) { fn(es[es.length - 1].isIntersecting); }, { rootMargin: margen || '150px 0px' });
    o.observe(el);
    return function () { o.disconnect(); };
  }
  function tasa(fn) {
    var intentos = 0;
    (function esperar() {
      if (window.FV_BCV) { window.FV_BCV.onChange(function (st) { if (st && st.rate) fn({ rate: st.rate, fecha: st.fecha, live: st.live }); }); return; }
      if (++intentos < 40) setTimeout(esperar, 250);
    })();
  }
  function montar(clave) { return raiz.querySelector('[data-ini-montaje="' + clave + '"]'); }

  window.INI = {
    raiz: raiz,
    reducir: reducir,
    reducido: reducido,
    escritorio: escritorio,
    puntero: puntero,
    alVer: alVer,
    enPantalla: enPantalla,
    contar: contar,
    raf: raf,
    montar: montar,
    wa: wa,
    tasa: tasa,
    miles: miles
  };

  // ---------- aparición suave al entrar en pantalla ----------
  var ves = [].slice.call(raiz.querySelectorAll('[data-ini-ve]'));
  if (reducir || !hayIO) ves.forEach(function (el) { el.classList.add('is-in'); });
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    ves.forEach(function (el) { io.observe(el); });
  }

  // ---------- cifras que cuentan (el HTML ya trae el valor final) ----------
  [].forEach.call(raiz.querySelectorAll('[data-ini-cuenta]'), function (n) {
    var hasta = parseFloat(n.getAttribute('data-ini-cuenta'));
    var desde = parseFloat(n.getAttribute('data-ini-desde')) || 0;
    if (isNaN(hasta) || reducir || !hayIO) return;
    n.textContent = String(desde);
    alVer(n, function () { contar(n, hasta, Math.abs(hasta - desde) > 9 ? 1400 : 900, null, desde); }, 0.5);
  });

  // ---------- mallas y animaciones CSS en pausa fuera de pantalla ----------
  if (!reducir && hayIO) {
    var po = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('is-pausa', !e.isIntersecting); });
    }, { rootMargin: '150px 0px' });
    [].forEach.call(raiz.querySelectorAll('.ini-mesh, [data-ini-pausa]'), function (m) { po.observe(m); });
  }

  // ---------- malla fija en secciones altas (más de 2 pantallas): bloque sticky de 100vh ----------
  // El margen superior compensa el relleno de la sección y el inferior le devuelve el lugar al contenido.
  var mallas = [].slice.call(raiz.querySelectorAll('.ini-sec > .ini-mesh'));
  function fijarMallas() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var datos = mallas.map(function (m) { // primero se lee todo…
      var s = m.parentNode;
      return { alto: s.offsetHeight, pt: parseFloat(getComputedStyle(s).paddingTop) || 0, primera: s.firstElementChild === m };
    });
    mallas.forEach(function (m, i) { // …y después se escribe
      var d = datos[i], fija = d.primera && d.alto > vh * 2;
      m.classList.toggle('ini-mesh-fija', fija);
      m.style.margin = fija ? (-d.pt) + 'px 0 calc(' + d.pt + 'px - 100vh)' : '';
    });
  }
  fijarMallas();
  var fmPend = false;
  addEventListener('resize', function () { if (!fmPend) { fmPend = true; raf(function () { fmPend = false; fijarMallas(); }); } }, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fijarMallas);

  // ---------- paralaje: cada capa se mueve respecto al centro de su sección (o de su malla, si es fija) ----------
  // Primero se leen todos los rectángulos (uno por sección) y después se escriben todos los transform. Acotado a ±1 pantalla.
  var capas = [], pendiente = false, escuchando = false;
  function pintar() {
    pendiente = false;
    var vh = window.innerHeight, rects = [], cache = [];
    capas.forEach(function (c, i) {
      rects[i] = null;
      if (!c.el.isConnected) return;
      var ref = c.malla && c.malla.classList.contains('ini-mesh-fija') ? c.malla : c.sec;
      var j = cache.indexOf(ref);
      if (j === -1) { cache.push(ref); cache.push(ref.getBoundingClientRect()); j = cache.length - 2; }
      rects[i] = cache[j + 1];
    });
    capas.forEach(function (c, i) {
      var r = rects[i];
      if (!r || r.bottom < -200 || r.top > vh + 200) return;
      var d = Math.max(-vh, Math.min(vh, (r.top + r.height / 2) - vh / 2));
      c.el.style.transform = 'translate3d(0,' + (-d * c.v).toFixed(1) + 'px,0)';
    });
  }
  function pedir() { if (!pendiente) { pendiente = true; raf(pintar); } }
  function paralaje(el, v) {
    if (reducido() || !el) return;
    if (v == null) v = parseFloat(el.getAttribute('data-paralaje')) || 0;
    capas.push({ el: el, v: v, sec: el.closest('section') || raiz, malla: el.closest('.ini-mesh') });
    if (!escuchando) { escuchando = true; addEventListener('scroll', pedir, { passive: true }); addEventListener('resize', pedir, { passive: true }); }
    pedir();
  }
  window.INI.paralaje = paralaje;
  [].forEach.call(raiz.querySelectorAll('[data-paralaje]'), function (el) { paralaje(el); });
})();
