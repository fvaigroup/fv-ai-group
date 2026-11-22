/* /triangular/delta/logistica · #antes-despues: comparador «Antes» / «Con Logística».
   Antes: chat de choferes («¿ya saliste?», «¿dónde vas?», «mándame la foto del recibo»), cuaderno con cuentas tachadas y
   recibos sueltos. Con Logística: tablero con viajes por estado, gastos con foto y ganancia del viaje.
   Arrastre con pointer events (touch-action: pan-y: el scroll vertical sigue funcionando) y un <input type="range">
   invisible encima para teclado y lectores de pantalla. La primera vez que se ve, la barra hace 50 → 30 → 70 → 50 como
   pista (no con reduced-motion ni si ya la tocaron) y la ganancia cuenta. Los montos de ejemplo solo los escribe este
   script. Sin JS: el comparador sigue [hidden] y se ven las dos tarjetas de texto (.log-dos). */
(function () {
  'use strict';

  // Montos y cifras de ejemplo (ficticios; la maqueta lleva «Ejemplo ilustrativo» debajo)
  var TARIFA = 420, COMB = 95, PEAJE = 18, VIAT = 25;
  var GANANCIA = TARIFA - COMB - PEAJE - VIAT;

  function iniciar() {
    var LOG = window.LOG;
    if (!LOG || !LOG.raiz) return;
    var env = LOG.raiz.querySelector('[data-log-antes-env]');
    var marco = env && env.querySelector('[data-log-antes-marco]');
    var rango = marco && marco.querySelector('[data-log-antes-rango]');
    if (!rango || !window.requestAnimationFrame) return;
    var reducir = !!LOG.reducir;
    var num = LOG.num || function (n) { return '$' + n; };
    var miles = LOG.miles || function (n) { return String(n); };

    var M = {
      c0: '3', c1: '2', c2: '4', c3: '6', sinleer: '27',
      tarifa: num(TARIFA), comb: '-' + num(COMB), peaje: '-' + num(PEAJE), viat: '-' + num(VIAT),
      n1a: '380', n1b: '420', n2a: '80', n2b: '95', n3: '18 ó 24', n4a: '300', n4b: '¿270?',
      r1: miles(PEAJE, 2), r2: miles(COMB, 2)
    };
    [].forEach.call(marco.querySelectorAll('[data-log-antes-m]'), function (el) {
      var v = M[el.getAttribute('data-log-antes-m')];
      if (v != null) el.textContent = v;
    });
    var ganEl = marco.querySelector('[data-log-antes-gan]');
    if (ganEl) ganEl.textContent = num(GANANCIA);

    // Flota elegida en #flota: silueta de los viajes y nombre en la cabecera del tablero
    var sils = [].slice.call(marco.querySelectorAll('[data-log-antes-sil]'));
    var flotaEl = marco.querySelector('[data-log-antes-flota]');
    function flota(clave, d) {
      d = d || (LOG.datosFlota && LOG.datosFlota(clave));
      if (flotaEl && d && d.nombre && flotaEl.textContent !== d.nombre) flotaEl.textContent = d.nombre;
      if (!LOG.silueta) return;
      sils.forEach(function (el) {
        if (el.getAttribute('data-clave') === clave) return;
        el.setAttribute('data-clave', clave);
        while (el.firstChild) el.removeChild(el.firstChild);
        el.appendChild(LOG.silueta(clave));
      });
    }
    if (LOG.alCambiar) LOG.alCambiar(flota);
    try { flota(LOG.flota ? LOG.flota() : '350'); } catch (e) {}

    // ---- Posición de la barra (0..100 = % de «Antes» que se ve) ----
    var valor = 50, pintado = -1, pedido = false;
    function limitar(v) { return v < 0 ? 0 : v > 100 ? 100 : v; }
    function pintar() {
      pedido = false;
      if (valor === pintado) return;
      pintado = valor;
      marco.style.setProperty('--log-antes-x', (Math.round(valor * 10) / 10) + '%');
      var r = Math.round(valor);
      if (+rango.value !== r) rango.value = r;
      var txt = 'Se ve ' + r + ' % de antes y ' + (100 - r) + ' % con Logística';
      if (rango.getAttribute('aria-valuetext') !== txt) rango.setAttribute('aria-valuetext', txt);
    }
    function ponerYa(v) { valor = limitar(v); pintar(); }
    function poner(v) { valor = limitar(v); if (!pedido) { pedido = true; requestAnimationFrame(pintar); } }

    // ---- Animación (pista y salto al tocar): pausada fuera de pantalla o con la pestaña oculta ----
    var anim = null, raf = 0, ultimo = 0, visible = false, tocado = false, pistaLista = false, espera0 = 0;
    function suave(k) { return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }
    function activo() { return visible && !document.hidden; }
    function cuadro(ts) {
      raf = 0;
      if (!anim) return;
      var dt = ultimo ? Math.min(ts - ultimo, 50) : 16;
      ultimo = ts;
      var paso = anim.pasos[anim.i];
      anim.t += dt;
      var k = Math.min(anim.t / paso[1], 1);
      ponerYa(anim.desde + (paso[0] - anim.desde) * suave(k));
      if (k >= 1) {
        anim.i++; anim.t = 0; anim.desde = paso[0];
        if (anim.i >= anim.pasos.length) { anim = null; ultimo = 0; return; }
      }
      if (activo()) raf = requestAnimationFrame(cuadro);
      else ultimo = 0;
    }
    function seguir() { if (anim && !raf && activo()) { ultimo = 0; raf = requestAnimationFrame(cuadro); } }
    function animar(pasos) {
      if (reducir) { ponerYa(pasos[pasos.length - 1][0]); return; }
      anim = { pasos: pasos, i: 0, t: 0, desde: valor };
      seguir();
    }
    function parar() {
      anim = null; ultimo = 0;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }
    function tocar() {
      tocado = true; parar();
      if (espera0) { clearTimeout(espera0); espera0 = 0; }
    }
    function pista() {
      if (pistaLista || tocado || reducir) return;
      pistaLista = true;
      espera0 = setTimeout(function () {
        espera0 = 0;
        if (!tocado) animar([[30, 700], [70, 1000], [50, 700]]);
      }, 350);
    }

    var contado = false;
    function contarGanancia() {
      if (contado || !ganEl || !LOG.contar) return;
      contado = true;
      LOG.contar(ganEl, GANANCIA, 1300, num);
    }

    // Puntos de «escribiendo…» solo mientras se ve (y nunca con reduced-motion: lo apaga el CSS)
    function vivo() { marco.classList.toggle('log-antes-vivo', activo()); }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        var e = es[es.length - 1];
        visible = e.isIntersecting;
        if (visible && e.intersectionRatio >= 0.5) { pista(); contarGanancia(); }
        if (visible) seguir();
        vivo();
      }, { threshold: [0, 0.5] }).observe(marco);
    } else {
      visible = true;
      vivo();
    }
    document.addEventListener('visibilitychange', function () { vivo(); if (!document.hidden) seguir(); });

    // ---- Teclado y lectores de pantalla: el input range ----
    rango.addEventListener('input', function () { tocar(); ponerYa(+rango.value); });
    rango.addEventListener('focus', tocar);
    rango.addEventListener('keydown', function (e) {
      var k = e.key, d = 0;
      if (k === 'ArrowLeft' || k === 'ArrowDown') d = -5;
      else if (k === 'ArrowRight' || k === 'ArrowUp') d = 5;
      else if (k === 'PageDown') d = -20;
      else if (k === 'PageUp') d = 20;
      else if (k === 'Home') d = -100;
      else if (k === 'End') d = 100;
      if (!d) return;
      e.preventDefault();
      tocar();
      ponerYa(Math.round(valor) + d);
    });

    // ---- Arrastre con puntero ----
    // Mouse: arrastra desde cualquier punto. Toque: arrastra si se mueve en horizontal (o si empieza sobre la perilla);
    // un toque corto salta a ese punto; el gesto vertical lo toma el navegador (pointercancel) y no mueve nada.
    var rect = null, idp = null, arrastra = false, espera = false, x0 = 0, y0 = 0;
    function desdeX(cx) { return rect && rect.width ? (cx - rect.left) / rect.width * 100 : valor; }
    function empezar() {
      tocar();
      arrastra = true; espera = false;
      try { marco.setPointerCapture(idp); } catch (er) {}
      marco.classList.add('log-antes-arrastra');
    }
    function soltar(e) {
      if (e.pointerId !== idp) return;
      if (espera && e.type === 'pointerup') { tocar(); animar([[desdeX(e.clientX), 260]]); }
      arrastra = false; espera = false; idp = null;
      marco.classList.remove('log-antes-arrastra');
    }
    if (window.PointerEvent) {
      marco.addEventListener('pointerdown', function (e) {
        if (e.button !== 0 || !e.isPrimary) return;
        rect = marco.getBoundingClientRect();
        idp = e.pointerId; x0 = e.clientX; y0 = e.clientY;
        var cerca = Math.abs(e.clientX - (rect.left + rect.width * valor / 100)) < 32;
        if (e.pointerType === 'mouse' || cerca) {
          if (e.pointerType === 'mouse') e.preventDefault();
          empezar();
          poner(desdeX(e.clientX));
        } else {
          espera = true;
        }
      });
      marco.addEventListener('pointermove', function (e) {
        if (e.pointerId !== idp) return;
        if (espera) {
          var dx = Math.abs(e.clientX - x0), dy = Math.abs(e.clientY - y0);
          if (dx > 6 && dx > dy) empezar();
          else return;
        }
        if (arrastra) poner(desdeX(e.clientX));
      });
      marco.addEventListener('pointerup', soltar);
      marco.addEventListener('pointercancel', soltar);
    }

    // Activar el comparador: el texto de respaldo queda solo para lectores de pantalla (describe el control)
    var respaldo = LOG.raiz.querySelector('#log-antes-desc');
    if (respaldo) respaldo.classList.add('log-antes-oculta');
    env.hidden = false;
    marco.classList.add('log-antes-listo');
    ponerYa(50);
    if (reducir) contarGanancia();
  }

  if (window.LOG) iniciar();
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
