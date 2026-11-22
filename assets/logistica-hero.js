/* /triangular/delta/logistica — hero: «Logística» se descifra, la app del chofer recorre sola un viaje en bucle
   (Salí → gasto con recibo → Entregué con firma → Llegué) y el camión de la carretera cambia con la flota elegida.
   Usa window.LOG (assets/logistica.js). Horas, ciudades, nombres y montos son de ejemplo y solo los escribe este JS
   (debajo del hero va «Ejemplo ilustrativo»). Sin JS: teléfono quieto. Con reduced-motion: el viaje completo, sin animar.
   Fuera de pantalla o con la pestaña oculta se detiene todo (temporizadores y animaciones CSS). */
(function () {
  'use strict';
  var LOG = window.LOG;
  if (!LOG) return;
  var hero = LOG.raiz.querySelector('[data-log-hero]');
  if (!hero) return;
  var reducir = LOG.reducir;
  var raf = window.requestAnimationFrame ? function (fn) { return window.requestAnimationFrame(fn); } : null;
  function $(s, d) { return (d || hero).querySelector(s); }
  function poner(el, txt) { if (el && el.textContent !== txt) el.textContent = txt; }
  function clase(el, c, si) { if (el) el.classList[si ? 'add' : 'remove'](c); }

  /* ---------- «LOGÍSTICA» se descifra de izquierda a derecha ---------- */
  (function () {
    var h1 = $('#log-titulo');
    var marca = $('.log-marca');
    var titular = $('.log-titular');
    if (!h1 || !marca || reducir || !raf || document.hidden) return;
    var REAL = marca.textContent;
    if (!REAL) return;
    var GLIFOS = 'ABCDEFGHIJKLNOPQRSTUVXYZ0123456789▲'; // sin M ni W (muy anchas)
    var DUR = 1000, t0 = null, ultimo = 0, listo = false;
    h1.setAttribute('aria-label', REAL + '. ' + (titular ? titular.textContent : ''));
    marca.style.height = marca.offsetHeight + 'px';
    marca.style.whiteSpace = 'nowrap';
    function fin() {
      if (listo) return;
      listo = true;
      marca.textContent = REAL;
      marca.style.height = '';
      marca.style.whiteSpace = '';
      h1.removeAttribute('aria-label');
    }
    function cuadro(t) {
      if (listo) return;
      if (t0 === null) t0 = t;
      var fijas = Math.floor((t - t0) / DUR * REAL.length);
      if (fijas >= REAL.length) { fin(); return; }
      if (t - ultimo > 45) {
        ultimo = t;
        var s = REAL.slice(0, fijas);
        for (var i = fijas; i < REAL.length; i++) s += GLIFOS.charAt(Math.floor(Math.random() * GLIFOS.length));
        marca.textContent = s;
      }
      raf(cuadro);
    }
    raf(cuadro);
    setTimeout(fin, DUR + 1500); // por si la pestaña se oculta a mitad
  })();

  /* ---------- Referencias ---------- */
  var esc = $('[data-log-hero-esc]');
  var tel = $('[data-log-hero-tel]');
  if (!esc || !tel) return;
  var rutaEl = $('[data-log-hero-ruta]');
  var camEl = $('[data-log-hero-cam]');
  var camion = $('[data-log-hero-camion]');
  var usoCamion = camion && camion.querySelector('use');
  var firma = $('[data-log-hero-firma]');
  var recibeEl = $('[data-log-hero-recibe]');
  var gasto = $('[data-log-hero-gasto]');
  var gastoT = $('[data-log-hero-gasto-t]');
  var montoEl = $('[data-log-hero-monto]');
  var PASOS = ['sali', 'entrega', 'llega'];
  var paso = {};
  PASOS.forEach(function (k) {
    var li = $('[data-log-hero-paso="' + k + '"]');
    if (!li) return;
    paso[k] = { btn: $('.log-paso-btn', li), det: $('.log-hero-det', li), hora: $('[data-log-hero-hora]', li), lug: $('[data-log-hero-lug]', li) };
  });

  // Viajes de ejemplo (ficticios): se van turnando en cada vuelta del bucle.
  var VIAJES = [
    { o: 'Valencia', d: 'Caracas', sale: '6:40 a. m.', entrega: '10:15 a. m.', llega: '1:50 p. m.', recibe: 'María González', gasto: 'Peaje', monto: 2 },
    { o: 'Barquisimeto', d: 'Maracaibo', sale: '5:30 a. m.', entrega: '11:45 a. m.', llega: '6:20 p. m.', recibe: 'José Pérez', gasto: 'Combustible', monto: 45 },
    { o: 'Puerto Cabello', d: 'Maracay', sale: '7:10 a. m.', entrega: '9:35 a. m.', llega: '12:05 p. m.', recibe: 'Carmen Rodríguez', gasto: 'Comida', monto: 8 }
  ];
  var nViaje = 0;

  /* ---------- Textos del viaje y del camión ---------- */
  function pintarViaje(v) {
    poner(rutaEl, v.o + ' → ' + v.d);
    if (paso.sali) { poner(paso.sali.hora, v.sale); poner(paso.sali.lug, v.o); }
    if (paso.entrega) { poner(paso.entrega.hora, v.entrega); poner(paso.entrega.lug, v.d); }
    if (paso.llega) { poner(paso.llega.hora, v.llega); poner(paso.llega.lug, 'De vuelta en ' + v.o); }
    poner(gastoT, v.gasto);
    poner(montoEl, LOG.num(v.monto));
  }
  function pintarCamion(d, animar) {
    d = d || LOG.datosFlota();
    if (!d) return;
    poner(camEl, d.nombre);
    if (usoCamion && usoCamion.getAttribute('href') !== '#' + d.sil) usoCamion.setAttribute('href', '#' + d.sil);
    if (animar && !reducir && camion) { camion.classList.remove('is-cambia'); void camion.getBoundingClientRect(); camion.classList.add('is-cambia'); }
  }
  if (camion) camion.addEventListener('animationend', function (e) { if (e.animationName === 'log-hero-cambia') camion.classList.remove('is-cambia'); });
  pintarCamion(null, false);
  LOG.alCambiar(function (clave, d) { pintarCamion(d, true); });

  /* ---------- Estados del teléfono ---------- */
  var cancelarTecleo = null;
  function pararTecleo() { if (cancelarTecleo) { cancelarTecleo(); cancelarTecleo = null; } }
  function hecho(k, si) {
    var p = paso[k];
    if (!p) return;
    clase(p.btn, 'is-toca', false);
    clase(p.btn, 'is-hecho', si);
    clase(p.det, 'is-ve', si);
  }
  function tocar(k) { var p = paso[k]; if (p) clase(p.btn, 'is-toca', true); }
  function completo() { // estado final (reduced-motion y fuera de pantalla): el viaje entero
    pararTecleo();
    var v = VIAJES[nViaje];
    pintarViaje(v);
    tel.classList.remove('is-sale');
    PASOS.forEach(function (k) { hecho(k, true); });
    clase(firma, 'is-ve', true);
    poner(recibeEl, v.recibe);
    clase(gasto, 'is-ve', true);
    clase(esc, 'is-rodando', false);
  }
  function reiniciar() {
    pararTecleo();
    tel.classList.remove('is-sale');
    PASOS.forEach(function (k) { hecho(k, false); });
    clase(firma, 'is-ve', false);
    poner(recibeEl, '');
    clase(gasto, 'is-ve', false);
    clase(esc, 'is-rodando', false);
    pintarViaje(VIAJES[nViaje]);
  }
  function rodar(si) { clase(esc, 'is-rodando', si); }

  if (reducir) { completo(); return; }

  /* ---------- Bucle del viaje ---------- */
  var PLAN = [
    [0, reiniciar],
    [700, function () { tocar('sali'); }],
    [1000, function () { hecho('sali', true); rodar(true); }],
    [2700, function () { clase(gasto, 'is-ve', true); }],
    [4300, function () { tocar('entrega'); }],
    [4600, function () { hecho('entrega', true); rodar(false); clase(firma, 'is-ve', true); }],
    [5300, function () { if (recibeEl) cancelarTecleo = LOG.teclear(recibeEl, VIAJES[nViaje].recibe, 40); }],
    [6700, function () { rodar(true); }],
    [7600, function () { tocar('llega'); }],
    [7900, function () { hecho('llega', true); }],
    [8600, function () { rodar(false); }],
    [10400, function () { tel.classList.add('is-sale'); }],
    [10900, function () { nViaje = (nViaje + 1) % VIAJES.length; }]
  ];
  var visible = false, corriendo = false, timer = null, idx = 0;
  function siguiente(antes) {
    var it = PLAN[idx];
    timer = setTimeout(function () {
      timer = null;
      it[1]();
      idx++;
      if (idx >= PLAN.length) { idx = 0; siguiente(0); }
      else siguiente(it[0]);
    }, Math.max(0, it[0] - antes));
  }
  function arrancar() {
    if (corriendo || !visible || document.hidden) return;
    corriendo = true;
    esc.classList.add('is-vivo');
    idx = 0;
    siguiente(0);
  }
  function parar() {
    if (timer) clearTimeout(timer);
    timer = null;
    corriendo = false;
    esc.classList.remove('is-vivo');
    completo();
  }
  completo(); // hasta que se vea: el viaje completo
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible) arrancar(); else parar();
    }, { threshold: 0.25 }).observe(esc);
  } else LOG.alVer(esc, function () { visible = true; arrancar(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) parar(); else arrancar(); });
})();
