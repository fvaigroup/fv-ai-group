/* Linterna: un brillo cálido y tenue, como una luciérnaga, que sigue al cursor sobre el hero y el manifiesto del inicio.
   Solo se carga en escritorio (inicio.js lo decide: mouse, ancho >= 1024 px y sin prefers-reduced-motion). Va DETRÁS del contenido. */
(function () {
  'use strict';
  var zonas = [].slice.call(document.querySelectorAll('#inicio, #manifiesto')).map(function (z) {
    var capa = document.createElement('div');
    capa.className = 'ini-linterna'; capa.setAttribute('aria-hidden', 'true');
    z.insertBefore(capa, z.firstChild);
    var e = { z: z, capa: capa, cx: 0, cy: 0, pend: false };
    function pintar() { // una lectura y luego las escrituras, una vez por cuadro: sin reflow
      e.pend = false;
      var r = z.getBoundingClientRect();
      capa.style.setProperty('--x', (e.cx - r.left) + 'px'); capa.style.setProperty('--y', (e.cy - r.top) + 'px');
    }
    z.addEventListener('pointermove', function (ev) {
      if (ev.pointerType !== 'mouse' || document.hidden) return;
      e.cx = ev.clientX; e.cy = ev.clientY; capa.classList.add('is-on');
      if (!e.pend) { e.pend = true; requestAnimationFrame(pintar); }
    }, { passive: true });
    z.addEventListener('pointerleave', function () { capa.classList.remove('is-on'); });
    return e;
  });
  document.addEventListener('visibilitychange', function () { if (document.hidden) zonas.forEach(function (e) { e.capa.classList.remove('is-on'); }); });
})();
