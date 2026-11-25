/* Inicio (index.html) · #caos-tablero: comparador arrastrable «Antes» / «Después» (rediseño, 24 nov 2026).
   Antes: cuaderno, Excel con varias versiones, chats de WhatsApp, bolívares y dólares mezclados y reportes que llegan tarde,
   como etiquetas desordenadas que tiemblan mientras se ven. Después: tablero de vidrio cian/naranja con barras que crecen al entrar.
   El marcado está en index.html entre <!-- ini:caos:inicio --> y <!-- ini:caos:fin --> ([data-caos-env], hidden sin JS).
   Sin JS (o sin el núcleo window.INI) se ven las dos tarjetas de texto (.ini-caos-grid); con el comparador activo esas tarjetas
   quedan solo para lectores de pantalla (describen el control). Control: la perilla hexagonal es role="slider" (flechas, Re Pág/Av Pág,
   Inicio/Fin) y el marco se arrastra con mouse o con el dedo (touch-action: pan-y: el scroll vertical sigue funcionando).
   La primera vez que se ve, la barra hace 50 → 30 → 70 → 50 como pista (no con reduced-motion ni si ya la tocaron).
   Sin cifras de dinero: solo barras sin números. No guarda nada ni llama a servidores. CSS: bloque inicio:caos de src/tailwind.css. */
(function () {
  'use strict';

  function iniciar() {
    var INI = window.INI;
    if (!INI || !INI.raiz) return;
    var sec = document.getElementById('caos-tablero');
    var env = sec && sec.querySelector('[data-caos-env]');
    var marco = env && env.querySelector('[data-caos-marco]');
    var perilla = marco && marco.querySelector('[data-caos-perilla]');
    if (!perilla) return;
    var reducir = INI.reducido ? INI.reducido() : !!INI.reducir;

    // ---- Posición de la barra (0..100 = cuánto se ve de «Antes») ----
    var valor = 50, pintado = -1, pedido = false;
    function limitar(v) { return v < 0 ? 0 : v > 100 ? 100 : v; }
    function texto(r) {
      if (r <= 2) return 'Solo se ve el después: el tablero';
      if (r >= 98) return 'Solo se ve el antes: el caos';
      return 'Se ve ' + r + ' de 100 del antes y ' + (100 - r) + ' de 100 del después';
    }
    function pintar() {
      pedido = false;
      if (valor === pintado) return;
      pintado = valor;
      marco.style.setProperty('--caos-x', (Math.round(valor * 10) / 10) + '%');
      var r = Math.round(valor);
      if (perilla.getAttribute('aria-valuenow') !== String(r)) {
        perilla.setAttribute('aria-valuenow', String(r));
        perilla.setAttribute('aria-valuetext', texto(r));
      }
    }
    function ponerYa(v) { valor = limitar(v); pintar(); }
    function poner(v) { valor = limitar(v); if (!pedido) { pedido = true; INI.raf(pintar); } }

    // ---- Animación (pista y salto al tocar): solo mientras se ve y con la pestaña activa ----
    var anim = null, raf = 0, ultimo = 0, visible = false, tocado = false, pistaLista = false, espera0 = 0;
    var hayRaf = !!window.requestAnimationFrame;
    function suave(k) { return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }
    function activo() { return visible && !document.hidden; }
    function cuadro(ts) {
      raf = 0;
      if (!anim) return;
      ts = ts || Date.now();
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
      if (activo()) raf = INI.raf(cuadro) || 1;
      else ultimo = 0;
    }
    function seguir() { if (anim && !raf && activo()) { ultimo = 0; raf = INI.raf(cuadro) || 1; } }
    function animar(pasos) {
      if (reducir || !hayRaf) { ponerYa(pasos[pasos.length - 1][0]); return; }
      anim = { pasos: pasos, i: 0, t: 0, desde: valor };
      seguir();
    }
    function parar() { anim = null; ultimo = 0; if (raf && window.cancelAnimationFrame) cancelAnimationFrame(raf); raf = 0; }
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
      }, 450);
    }

    // Al entrar: crecen las barras y la línea del tablero se dibuja (CSS con .is-in), y la pista
    INI.alVer(marco, function () { marco.classList.add('is-in'); pista(); }, 0.45);
    // Las etiquetas del caos tiemblan solo mientras se ven (y nunca con reduced-motion: lo apaga el CSS)
    function vivo() { marco.classList.toggle('ini-caos-vivo', activo()); }
    INI.enPantalla(marco, function (v) { visible = v; if (v) seguir(); vivo(); }, '0px');
    document.addEventListener('visibilitychange', function () { vivo(); if (!document.hidden) seguir(); });

    // ---- Teclado: la perilla es el slider ----
    perilla.addEventListener('keydown', function (e) {
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
    perilla.addEventListener('focus', tocar);

    // ---- Arrastre con puntero ----
    // Mouse: arrastra desde cualquier punto. Toque: arrastra si se mueve en horizontal (o si empieza sobre la perilla);
    // un toque corto salta a ese punto; el gesto vertical lo toma el navegador (pointercancel) y no mueve nada.
    var rect = null, idp = null, arrastra = false, espera = false, x0 = 0, y0 = 0;
    function desdeX(cx) { return rect && rect.width ? (cx - rect.left) / rect.width * 100 : valor; }
    function empezar() {
      tocar();
      arrastra = true; espera = false;
      try { marco.setPointerCapture(idp); } catch (er) {}
      marco.classList.add('ini-caos-arrastra');
    }
    function soltar(e) {
      if (e.pointerId !== idp) return;
      if (espera && e.type === 'pointerup') { tocar(); animar([[desdeX(e.clientX), 260]]); }
      arrastra = false; espera = false; idp = null;
      marco.classList.remove('ini-caos-arrastra');
    }
    if (window.PointerEvent) {
      marco.addEventListener('pointerdown', function (e) {
        if (e.button !== 0 || !e.isPrimary) return;
        rect = marco.getBoundingClientRect();
        idp = e.pointerId; x0 = e.clientX; y0 = e.clientY;
        var cerca = Math.abs(e.clientX - (rect.left + rect.width * valor / 100)) < 32;
        if (e.pointerType === 'mouse' || cerca) {
          if (e.pointerType === 'mouse') { e.preventDefault(); try { perilla.focus({ preventScroll: true }); } catch (er) {} }
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

    // ---- Activar: las tarjetas de texto quedan para lectores de pantalla y describen el control ----
    var grid = sec.querySelector('[data-caos]');
    if (grid) {
      if (!grid.id) grid.id = 'ini-caos-desc';
      perilla.setAttribute('aria-describedby', grid.id);
      grid.classList.add('ini-caos-sr');
    }
    env.hidden = false;
    marco.classList.add('ini-caos-listo');
    ponerYa(50);
    if (reducir) marco.classList.add('is-in');
  }

  if (window.INI) iniciar();
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
