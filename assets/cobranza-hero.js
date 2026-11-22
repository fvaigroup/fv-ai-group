/* /triangular/cobranza — hero: título que se descifra, teléfono con el cobro animado por sector,
   tasa BCV en vivo, giro 3D con el mouse y carnet QR que voltea (gimnasio y club).
   Usa window.COB (assets/cobranza.js). Sin JS o con reduced-motion: teléfono quieto y título normal. */
(function () {
  'use strict';
  var COB = window.COB;
  if (!COB) return;
  var hero = document.querySelector('[data-cob-hero]');
  if (!hero) return;
  var reducir = COB.reducir;
  var raf = window.requestAnimationFrame ? function (fn) { return window.requestAnimationFrame(fn); } : null;
  function $(s) { return hero.querySelector(s); }
  function poner(el, txt) { if (el && el.textContent !== txt) el.textContent = txt; }

  /* ---------- 10d: «COBRANZA» se descifra de izquierda a derecha ---------- */
  var h1 = $('#cob-titulo');
  var marca = $('.cob-marca');
  var titular = $('.cob-titular');
  var cifrando = false;
  function etiquetar() { if (cifrando && h1) h1.setAttribute('aria-label', 'Cobranza. ' + (titular ? titular.textContent : '')); }
  (function () {
    if (!h1 || !marca || reducir || !raf || document.hidden) return;
    var REAL = marca.textContent;
    if (!REAL) return;
    var GLIFOS = 'ABCDEFGHIJKLNOPQRSTUVXYZ0123456789▲'; // sin M ni W (muy anchas)
    var DUR = 1000, t0 = null, ultimo = 0, listo = false;
    cifrando = true;
    etiquetar();
    marca.style.height = marca.offsetHeight + 'px';
    marca.style.whiteSpace = 'nowrap';
    function fin() {
      if (listo) return;
      listo = true; cifrando = false;
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

  /* ---------- Teléfono: referencias ---------- */
  var escena = $('[data-cob-hero-escena]');
  var tel = $('[data-cob-hero-tel]');
  var volteo = $('[data-cob-hero-volteo]');
  var estado = $('[data-cob-hero-estado]');
  var pill = $('[data-cob-hero-pill]');
  var tasaL = $('[data-cob-hero-tasa-l]');
  var tasaV = $('[data-cob-hero-tasa]');
  var recuerda = $('[data-cob-hero-recuerda]');
  var montoEl = $('[data-cob-hero-monto]');
  var montoBs = $('[data-cob-hero-monto-bs]');
  var confeti = $('[data-cob-hero-confeti]');
  var cOrg = $('[data-cob-hero-c-org]');
  var cNom = $('[data-cob-hero-c-nom]');
  var cEst = $('[data-cob-hero-c-est]');
  var qrEl = $('[data-cob-hero-qr]');

  // Montos de ejemplo (ficticios) por sector; el hero dice «Ejemplo ilustrativo con datos ficticios».
  var MONTOS = { negocio: 25, gimnasio: 30, condominio: 60, club: 45, colegio: 80 };
  var CARNET = { gimnasio: true, club: true };
  var tasa = 0;

  function montos() {
    var usd = MONTOS[COB.sector()] || 25;
    poner(montoEl, 'US$ ' + COB.num(usd, 2));
    poner(montoBs, tasa ? 'Equivale a ' + COB.bs(usd * tasa) + ' a tasa BCV' : 'En dólares o bolívares');
  }

  /* ---------- 6: tasa BCV del día en una fila del teléfono ---------- */
  COB.tasa(function (t) {
    var r = +t.rate;
    if (!(r > 0)) return;
    tasa = r;
    poner(tasaL, t.live ? 'Tasa BCV hoy' : 'Tasa BCV');
    poner(tasaV, COB.bs(r));
    montos();
  });

  /* ---------- 10c: QR decorativo de 21×21 módulos, siempre igual para cada sector ---------- */
  function qr(semilla) {
    var N = 21, s = 7, i, x, y, d = '';
    for (i = 0; i < semilla.length; i++) s = (s * 131 + semilla.charCodeAt(i)) % 2147483647;
    function azar() { s = s * 16807 % 2147483647; return s / 2147483647; }
    function ojo(x, y, ox, oy) {
      var dx = x - ox, dy = y - oy;
      if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return false; // separador blanco
      var anillo = Math.max(Math.abs(dx - 3), Math.abs(dy - 3));
      return anillo === 3 || anillo <= 1;
    }
    for (y = 0; y < N; y++) {
      for (x = 0; x < N; x++) {
        var negro;
        if (x < 8 && y < 8) negro = ojo(x, y, 0, 0);
        else if (x > 12 && y < 8) negro = ojo(x, y, 14, 0);
        else if (x < 8 && y > 12) negro = ojo(x, y, 0, 14);
        else if (y === 6) negro = x % 2 === 0;
        else if (x === 6) negro = y % 2 === 0;
        else negro = azar() < 0.5;
        if (negro) d += 'M' + (x + 2) + ' ' + (y + 2) + 'h1v1h-1z';
      }
    }
    return '<svg viewBox="0 0 25 25" shape-rendering="crispEdges" focusable="false" aria-hidden="true"><rect width="25" height="25" fill="#fff"/><path fill="#05070B" d="' + d + '"/></svg>';
  }

  /* ---------- Textos del teléfono según el sector ---------- */
  function sectorizar(id, d) {
    d = d || COB.datos();
    if (!d) return;
    poner(recuerda, d.concepto + ' · vence hoy');
    if (CARNET[id]) {
      poner(cOrg, d.org);
      poner(cNom, d.linea);
      poner(cEst, d.estado);
      if (qrEl && qrEl.getAttribute('data-s') !== id) { qrEl.innerHTML = qr(id); qrEl.setAttribute('data-s', id); }
    }
    montos();
  }
  sectorizar(COB.sector(), COB.datos());

  // Confeti verde y morado (se crea una vez; se dispara con la clase is-on)
  if (confeti && !reducir) {
    var COLORES = ['#4ade80', '#a855f7', '#ffffff', '#c4b5fd', '#bbf7d0'];
    var frag = document.createDocumentFragment();
    for (var k = 0; k < 16; k++) {
      var ang = k / 16 * Math.PI * 2 + (k % 2 ? 0.18 : -0.12);
      var dist = 62 + (k % 4) * 16;
      var pieza = document.createElement('i');
      pieza.style.setProperty('--x', Math.round(Math.cos(ang) * dist) + 'px');
      pieza.style.setProperty('--y', Math.round(Math.sin(ang) * dist + 26) + 'px');
      pieza.style.setProperty('--r', (180 + k * 47 % 360) + 'deg');
      pieza.style.setProperty('--c', COLORES[k % COLORES.length]);
      pieza.style.setProperty('--d', (k % 3) * 0.04 + 's');
      frag.appendChild(pieza);
    }
    confeti.appendChild(frag);
  }

  /* ---------- 1: bucle del cobro (A recordatorio · B toque · C pasarela · D pagado · E recibo) ---------- */
  function paso(p) { if (tel) tel.setAttribute('data-paso', p); }
  function quieto() { // estado final: el teléfono como sin JS
    paso('');
    if (estado) { estado.classList.remove('is-pend'); estado.classList.remove('is-texto'); estado.classList.remove('is-pagado'); }
    if (confeti) confeti.classList.remove('is-on');
    if (volteo) volteo.classList.remove('is-vuelta');
  }
  function reiniciar() {
    quieto();
    poner(pill, 'Por pagar · vence hoy');
    if (estado) { estado.classList.add('is-pend'); estado.classList.add('is-texto'); }
  }
  function pagado() { // D: pantalla «Pago recibido» con confeti
    paso('d');
    if (confeti) confeti.classList.add('is-on');
  }
  function recibo() { // E: vuelve el teléfono; la píldora ya dice pagado (se ve el cambio) y baja el aviso del recibo
    paso('e');
    if (confeti) confeti.classList.remove('is-on');
    if (estado) {
      estado.classList.remove('is-pend');
      estado.classList.add('is-pagado');
      var e = (COB.datos() || {}).estado || '';
      if (/al d[ií]a/i.test(e)) estado.classList.remove('is-texto'); // «Al día…» del sector
      else poner(pill, 'Pagado · al día');
    }
  }
  function plan(id) {
    var p = [
      [0, reiniciar],
      [400, function () { paso('a'); }],
      [2300, function () { paso('b'); }],
      [3300, function () { paso('c'); }],
      [5200, pagado],
      [6700, recibo],
      [8100, function () { paso(''); }]
    ];
    if (CARNET[id] && volteo) {
      p.push([8400, function () { volteo.classList.add('is-vuelta'); }]);
      p.push([10300, function () { volteo.classList.remove('is-vuelta'); }]);
      p.push([11300, null]);
    } else p.push([9000, null]);
    return p;
  }

  var visible = false, corriendo = false, timer = null, pasos = null, idx = 0;
  function siguiente(antes) {
    var it = pasos[idx];
    timer = setTimeout(function () {
      timer = null;
      if (it[1]) it[1]();
      idx++;
      if (idx >= pasos.length) { idx = 0; pasos = plan(COB.sector()); siguiente(0); }
      else siguiente(it[0]);
    }, Math.max(0, it[0] - antes));
  }
  function arrancar() {
    if (corriendo || reducir || !tel || !visible || document.hidden) return;
    corriendo = true;
    idx = 0;
    pasos = plan(COB.sector());
    siguiente(0);
  }
  function parar() {
    if (timer) clearTimeout(timer);
    timer = null;
    corriendo = false;
    quieto();
  }

  if (!reducir && tel) {
    if ('IntersectionObserver' in window && escena) {
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        if (visible) arrancar(); else parar();
      }, { threshold: 0.25 }).observe(escena);
    } else { visible = true; arrancar(); }
    document.addEventListener('visibilitychange', function () { if (document.hidden) parar(); else arrancar(); });
  }

  COB.alCambiar(function (id, d) {
    etiquetar();
    sectorizar(id, d);
    if (corriendo) { parar(); arrancar(); }
  });

  /* ---------- 10b: el teléfono se inclina hacia el mouse (escritorio) ---------- */
  var tilt = $('[data-cob-hero-tilt]');
  if (reducir || !tilt || !escena || !raf || !window.matchMedia) return;
  var mq = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1024px)');
  var MAX = 8, cx = 0, cy = 0, ox = 0, oy = 0, raton = null, pedido = 0;
  function lim(v) { return v < -1 ? -1 : v > 1 ? 1 : v; }
  function cuadroT() {
    pedido = 0;
    if (raton) {
      var r = escena.getBoundingClientRect();
      oy = lim((raton.x - (r.left + r.width / 2)) / (r.width / 2 + 160)) * MAX;
      ox = -lim((raton.y - (r.top + r.height / 2)) / (r.height / 2 + 160)) * MAX;
      raton = null;
    }
    cx += (ox - cx) * 0.12;
    cy += (oy - cy) * 0.12;
    if (Math.abs(ox - cx) < 0.02 && Math.abs(oy - cy) < 0.02) { cx = ox; cy = oy; }
    tilt.style.transform = (cx === 0 && cy === 0) ? '' : 'perspective(900px) rotateX(' + cx.toFixed(2) + 'deg) rotateY(' + cy.toFixed(2) + 'deg)';
    if (cx !== ox || cy !== oy) pedir();
  }
  function pedir() { if (!pedido) pedido = raf(cuadroT); }
  function soltar() { raton = null; ox = 0; oy = 0; pedir(); }
  hero.addEventListener('mousemove', function (e) {
    if (!mq.matches) return;
    raton = { x: e.clientX, y: e.clientY };
    pedir();
  }, { passive: true });
  hero.addEventListener('mouseleave', soltar);
  function alCambiarMq() { if (!mq.matches) soltar(); }
  if (mq.addEventListener) mq.addEventListener('change', alCambiarMq);
  else if (mq.addListener) mq.addListener(alCambiarMq);
})();
