/* Inicio (index.html) — efecto «manifiesto» del rediseño (24 nov 2026).
   Lo que ya hacía assets/inicio.js se queda allí: el tecleo de la consola ([data-ps]), el cursor y la luciérnaga 3D que gira con el scroll.
   Este archivo suma, alrededor de esa luciérnaga y de la consola:
     - capas que envuelven a <fv-logo-3d>: paralaje de scroll (INI.paralaje) y, con mouse en escritorio, un leve giro hacia el puntero;
     - un halo cian/blanco/naranja que respira, un aro hexagonal que gira lento y destellos sutiles (todo decorativo, aria-hidden);
     - en la consola: cada línea se ilumina al aparecer, la ✔ «salta» y, al terminar, la consola y el halo dan un destello.
   Usa el núcleo window.INI (assets/inicio-efectos.js). CSS en el bloque inicio:manifiesto de src/tailwind.css (prefijo ini-mf-).
   Sin JS no pasa nada de esto (la consola y la frase ya se leen completas). Con prefers-reduced-motion: halo y aro quietos, sin destellos,
   sin giro ni paralaje y sin observar el tecleo. Fuera de pantalla se pausan las animaciones CSS (clase ini-mf-quieto) y el bucle del puntero.
   No guarda datos ni llama a servidores. */
(function () {
  'use strict';
  var INI = window.INI;
  var sec = document.getElementById('manifiesto');
  if (!INI || !sec) return;
  var logo = sec.querySelector('[data-giro-manifiesto]');
  var pegado = logo && logo.parentNode;
  var reducido = INI.reducido();
  var NS = 'http://www.w3.org/2000/svg';

  function div(cls) { var d = document.createElement('div'); d.className = cls; d.setAttribute('aria-hidden', 'true'); return d; }

  /* ---------------------------------------------------------------- capas alrededor de la luciérnaga 3D */
  var capaTilt = null;
  if (logo && pegado && pegado.classList.contains('ini-manif-giro-pegado')) {
    var capaPar = div('ini-mf-paralaje');       // la mueve INI.paralaje (style.transform propio)
    capaTilt = div('ini-mf-tilt');              // la gira el puntero (otro transform, por eso es otra capa)
    var halo = div('ini-mf-halo');
    var aro = div('ini-mf-aro');
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 100 100'); svg.setAttribute('focusable', 'false');
    var defs = document.createElementNS(NS, 'defs');
    var lg = document.createElementNS(NS, 'linearGradient');
    lg.id = 'ini-mf-grad'; lg.setAttribute('x1', '0'); lg.setAttribute('y1', '0'); lg.setAttribute('x2', '1'); lg.setAttribute('y2', '1');
    [['0', '#00FFFF'], ['.5', '#FFFFFF'], ['1', '#FF8C00']].forEach(function (p) {
      var s = document.createElementNS(NS, 'stop'); s.setAttribute('offset', p[0]); s.setAttribute('stop-color', p[1]); lg.appendChild(s);
    });
    defs.appendChild(lg); svg.appendChild(defs);
    var hex = document.createElementNS(NS, 'polygon');
    hex.setAttribute('points', '50,3 90.7,26.5 90.7,73.5 50,97 9.3,73.5 9.3,26.5');
    hex.setAttribute('fill', 'none'); hex.setAttribute('stroke', 'url(#ini-mf-grad)'); hex.setAttribute('stroke-width', '.6');
    svg.appendChild(hex);
    var hex2 = hex.cloneNode(); hex2.setAttribute('transform', 'rotate(30 50 50) scale(.82) translate(11 11)'); hex2.setAttribute('stroke-dasharray', '2 4');
    svg.appendChild(hex2);
    aro.appendChild(svg);
    var chispas = div('ini-mf-chispas');
    // 9 destellos en posiciones fijas alrededor de la luciérnaga (x %, y %, tamaño px, retraso s, color)
    [[8, 22, 4, 0, 'c'], [88, 16, 3, 1.1, 'b'], [95, 58, 5, 2.3, 'n'], [76, 90, 3, .6, 'c'], [18, 84, 4, 1.8, 'n'],
     [-4, 52, 3, 2.9, 'b'], [50, -6, 3, 3.4, 'c'], [62, 104, 4, 1.4, 'b'], [32, 4, 3, 2.6, 'n']].forEach(function (c) {
      var s = document.createElement('i');
      s.className = 'ini-mf-chispa ini-mf-' + c[4];
      s.style.left = c[0] + '%'; s.style.top = c[1] + '%'; s.style.width = s.style.height = c[2] + 'px';
      s.style.animationDelay = c[3] + 's';
      chispas.appendChild(s);
    });
    pegado.insertBefore(capaPar, logo);
    capaPar.appendChild(capaTilt);
    capaTilt.appendChild(halo); capaTilt.appendChild(aro);
    capaTilt.appendChild(logo);                 // <fv-logo-3d> se re-conecta sin problema (connectedCallback lo contempla)
    capaTilt.appendChild(chispas);
    capaPar.setAttribute('data-paralaje', '0.06');
    INI.paralaje(capaPar, 0.06);
    sec.classList.add('ini-mf-on');
  }

  /* ---------------------------------------------------------------- pausa fuera de pantalla + giro hacia el puntero */
  var visible = false, corriendo = false;
  var obj = { x: 0, y: 0 }, act = { x: 0, y: 0 };
  function pinta() {
    act.x += (obj.x - act.x) * 0.08; act.y += (obj.y - act.y) * 0.08;
    if (capaTilt) capaTilt.style.transform = 'translate3d(' + (act.x * 14).toFixed(2) + 'px,' + (act.y * 10).toFixed(2) + 'px,0) rotateX(' + (-act.y * 7).toFixed(2) + 'deg) rotateY(' + (act.x * 9).toFixed(2) + 'deg)';
    if (visible && (Math.abs(obj.x - act.x) > 0.002 || Math.abs(obj.y - act.y) > 0.002)) INI.raf(pinta);
    else corriendo = false;
  }
  var conPuntero = !!capaTilt && !reducido && INI.puntero() && INI.escritorio();
  function arranca() { if (conPuntero && !corriendo && visible) { corriendo = true; INI.raf(pinta); } }
  if (conPuntero) {
    window.addEventListener('pointermove', function (e) {
      if (!visible || e.pointerType === 'touch') return;
      var w = window.innerWidth || 1, h = window.innerHeight || 1;
      obj.x = Math.max(-1, Math.min(1, (e.clientX / w - 0.5) * 2));
      obj.y = Math.max(-1, Math.min(1, (e.clientY / h - 0.5) * 2));
      arranca();
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', function () { obj.x = 0; obj.y = 0; arranca(); });
  }
  INI.enPantalla(sec, function (si) {
    visible = si;
    sec.classList.toggle('ini-mf-quieto', !si);
    if (si) arranca();
  });

  /* ---------------------------------------------------------------- consola: líneas que se iluminan al aparecer
     El tecleo lo hace assets/inicio.js mostrando cada línea con style.visibility; aquí solo se mira ese cambio. */
  var ps = sec.querySelector('[data-ps]');
  if (!ps || reducido || !window.MutationObserver) return;
  var lineas = [].slice.call(ps.querySelectorAll('.ps-l, .ps-fin'));
  var mo = new MutationObserver(function (cambios) {
    cambios.forEach(function (c) {
      var el = c.target;
      if (el.style.visibility !== 'visible' || el.classList.contains('ini-mf-vista')) return;
      el.classList.add('ini-mf-vista');
      if (el.classList.contains('ps-fin')) {
        ps.classList.add('ini-mf-listo');
        if (capaTilt) capaTilt.classList.add('ini-mf-listo');
        mo.disconnect();
      }
    });
  });
  lineas.forEach(function (el) { mo.observe(el, { attributes: true, attributeFilter: ['style'] }); });
})();
