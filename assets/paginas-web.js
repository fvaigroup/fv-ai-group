/* /triangular/paginas-web — núcleo de la página (window.WEB): aparición al bajar, cifras que cuentan, paralaje,
   pausa de las mallas fuera de pantalla, precios del encargo y utilidades para los efectos
   (assets/paginas-web-<clave>.js, cargados con defer DESPUÉS de este).
   Sin JS la página muestra todo su contenido (tablas, 90 funciones, pasos, preguntas y el respaldo estático de cada efecto).
   Con prefers-reduced-motion: sin paralaje, sin conteos, sin apariciones y sin malla animada.

   API (window.WEB):
     WEB.raiz                     <main data-web>
     WEB.reducir                  true con prefers-reduced-motion (mostrar el estado final, sin animar)
     WEB.niveles                  ['basico', 'intermedio', 'avanzado']
     WEB.nombres                  { basico: 'Básico', intermedio: 'Intermedio', avanzado: 'Avanzado' }
     WEB.precios                  precios EXACTOS del encargo (no inventar otros):
                                    mensual[nivel] = { mes, primer, anual, compra }   (compra = pasar a ser dueño)
                                    propia[nivel]  = { unico, inicio, entrega, mant } (mant = mantenimiento opcional al mes)
                                    modulo = 100 (módulo grande adicional, pago único, solo Avanzado)
     WEB.mensualAl(nivel, n)      acumulado del plan mensual al mes n = primer + mes × (n − 1)   (n ≥ 1)
     WEB.propiaAl(nivel, n, mant) acumulado de Página Propia al mes n = unico (+ mant × n si mant es true)
                                    Ambas: «Cálculo aproximado», sin adicionales ni pago anual (decirlo en pantalla).
     WEB.wa(texto)                URL de WhatsApp (584244125386) con ese mensaje (debe empezar con «Hola F&V»; sin precios)
     WEB.alVer(el, fn, umbral)    fn() una sola vez cuando el elemento entra en pantalla (al instante sin IntersectionObserver)
     WEB.teclear(el, texto, ms, listo)  escribe letra por letra (al instante con reduced-motion); devuelve una función para cancelar
     WEB.tasa(fn)                 fn({ rate, fecha, live }) con la tasa BCV (assets/bcv.js) cuando la haya
     WEB.num(n)                   "$10" · "$2,14" · "$0,71" · "$2.100" (punto de miles, coma decimal, sin decimales si es entero)
     WEB.miles(n, dec?)           "2.100" · "1.234,56" (sin símbolo)
     WEB.bs(n)                    "Bs 1.234,56"
     WEB.contar(el, hasta, ms, fmt?, desde?)  cuenta de «desde» (0) a «hasta» en ms; fmt(v) da el texto (entero por defecto).
                                    Con reduced-motion escribe el valor final al instante. Devuelve una función para cancelar.
     WEB.paralaje(el, v?)         registra una capa de paralaje creada por un efecto (v = fracción; por defecto su data-paralaje).
                                    Las [data-paralaje] que ya están en el HTML las registra el núcleo al cargar. No hace nada con reduced-motion.
     WEB.montar(clave)            el contenedor del efecto: [data-web-hero-escena] (hero), [data-web-formas], [data-web-funciones-ctl],
                                    [data-web-conviene-calc] o [data-web-proceso]. El efecto reemplaza su contenido (el respaldo
                                    estático que hay entre <!-- web:CLAVE:inicio --> y <!-- web:CLAVE:fin -->).
   Marcado que entiende el núcleo:
     [data-web-ve]                aparece al entrar en pantalla (clase .is-in; solo con JS: html.web-js)
     [data-web-cuenta="90"]       cifra que cuenta al verse (opcional data-web-desde="0"); el HTML ya trae el valor final
     [data-paralaje="0.2"]        se desplaza a esa fracción del scroll respecto al centro de su <section> (no con reduced-motion)
     .web-mesh                    malla de degradados: se pausa (clase .is-pausa) fuera de pantalla */
(function () {
  'use strict';
  var raiz = document.querySelector('[data-web]');
  if (!raiz) return;
  document.documentElement.classList.add('web-js');
  var reducir = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  var NIVELES = ['basico', 'intermedio', 'avanzado'];
  var NOMBRES = { basico: 'Básico', intermedio: 'Intermedio', avanzado: 'Avanzado' };
  var PRECIOS = {
    mensual: {
      basico: { mes: 10, primer: 20, anual: 100, compra: 100 },
      intermedio: { mes: 30, primer: 60, anual: 300, compra: 300 },
      avanzado: { mes: 70, primer: 140, anual: 700, compra: 700 }
    },
    propia: {
      basico: { unico: 100, inicio: 50, entrega: 50, mant: 5 },
      intermedio: { unico: 300, inicio: 150, entrega: 150, mant: 15 },
      avanzado: { unico: 700, inicio: 350, entrega: 350, mant: 35 }
    },
    modulo: 100
  };
  function mensualAl(nivel, n) { var p = PRECIOS.mensual[nivel]; n = Math.max(1, Math.floor(n)); return p.primer + p.mes * (n - 1); }
  function propiaAl(nivel, n, mant) { var p = PRECIOS.propia[nivel]; n = Math.max(0, Math.floor(n)); return p.unico + (mant ? p.mant * n : 0); }
  function wa(texto) { return 'https://wa.me/584244125386?text=' + encodeURIComponent(texto); }

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
  var MONTAJES = { hero: '[data-web-hero-escena]', formas: '[data-web-formas]', funciones: '[data-web-funciones-ctl]', conviene: '[data-web-conviene-calc]', proceso: '[data-web-proceso]' };
  function montar(clave) { var s = MONTAJES[clave]; return s ? raiz.querySelector(s) : null; }

  window.WEB = {
    raiz: raiz,
    reducir: reducir,
    niveles: NIVELES,
    nombres: NOMBRES,
    precios: PRECIOS,
    mensualAl: mensualAl,
    propiaAl: propiaAl,
    wa: wa,
    alVer: alVer,
    teclear: teclear,
    tasa: tasa,
    num: num,
    miles: miles,
    bs: bs,
    contar: contar,
    montar: montar
  };

  // ---------- aparición suave al entrar en pantalla ----------
  var ves = [].slice.call(raiz.querySelectorAll('[data-web-ve]'));
  if (reducir || !('IntersectionObserver' in window)) ves.forEach(function (el) { el.classList.add('is-in'); });
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    ves.forEach(function (el) { io.observe(el); });
  }

  // ---------- cifras que cuentan (el HTML ya trae el valor final) ----------
  [].forEach.call(raiz.querySelectorAll('[data-web-cuenta]'), function (n) {
    var hasta = parseFloat(n.getAttribute('data-web-cuenta'));
    var desde = parseFloat(n.getAttribute('data-web-desde')) || 0;
    if (isNaN(hasta) || reducir || !('IntersectionObserver' in window)) return;
    n.textContent = String(desde);
    alVer(n, function () { contar(n, hasta, Math.abs(hasta - desde) > 9 ? 1400 : 900, null, desde); }, 0.5);
  });

  // ---------- las manchas de la malla (animación infinita con blur) se pausan fuera de pantalla ----------
  if (!reducir && 'IntersectionObserver' in window) {
    var mo = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('is-pausa', !e.isIntersecting); });
    }, { rootMargin: '150px 0px' });
    [].forEach.call(raiz.querySelectorAll('.web-mesh'), function (m) { mo.observe(m); });
  }

  // ---------- malla fija en secciones altas (más de 2 pantallas): la malla pasa a un bloque sticky de 100vh ----------
  // Si no, en #funciones (más de 5000 px) las manchas quedan arriba y abajo de la sección y nunca se ven, pero siguen animándose.
  var mallas = [].slice.call(raiz.querySelectorAll('.web-sec > .web-mesh'));
  var clipDeOrigen = mallas.map(function (m) { return m.parentNode.classList.contains('web-sec-clip'); });
  function fijarMallas() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var altos = mallas.map(function (m) { return m.parentNode.offsetHeight; }); // primero se lee todo…
    mallas.forEach(function (m, i) { // …y después se escribe
      var fija = altos[i] > vh * 2;
      m.classList.toggle('web-mesh-fija', fija);
      m.parentNode.classList.toggle('web-sec-clip', fija || clipDeOrigen[i]); // overflow:clip para que el sticky funcione
    });
  }
  fijarMallas();
  var fmPend = false;
  addEventListener('resize', function () { if (!fmPend) { fmPend = true; raf(function () { fmPend = false; fijarMallas(); }); } }, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fijarMallas);

  // ---------- paralaje: cada [data-paralaje] se mueve respecto al centro de su sección (o de su malla, si es fija) ----------
  // Primero se leen todos los rectángulos (uno por sección) y después se escriben todos los transform. El desplazamiento se acota a ±1 pantalla.
  var capas = [], pendiente = false, escuchando = false;
  function pintar() {
    pendiente = false;
    var vh = window.innerHeight, rects = [], cache = [];
    capas.forEach(function (c, i) {
      rects[i] = null;
      if (!c.el.isConnected) return;
      var ref = c.malla && c.malla.classList.contains('web-mesh-fija') ? c.malla : c.sec;
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
    if (reducir || !el) return;
    if (v == null) v = parseFloat(el.getAttribute('data-paralaje')) || 0;
    capas.push({ el: el, v: v, sec: el.closest('section') || raiz, malla: el.closest('.web-mesh') });
    if (!escuchando) { escuchando = true; addEventListener('scroll', pedir, { passive: true }); addEventListener('resize', pedir, { passive: true }); }
    pedir();
  }
  window.WEB.paralaje = paralaje;
  [].forEach.call(raiz.querySelectorAll('[data-paralaje]'), function (el) { paralaje(el); });
})();
