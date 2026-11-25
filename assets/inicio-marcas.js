/* Inicio (index.html) — efecto «marcas» del rediseño (24 nov 2026).
   Franja de vidrio «Marcas con las que hemos trabajado»: los logos (assets/clientes/, mismo marcado de siempre) corren solos en la
   .marquee (CSS), en gris y a color al pasar el mouse o con el foco dentro de la franja; se pausa con hover, con foco y fuera de pantalla
   ([data-ini-pausa] de #inicio, lo pone el núcleo). Este archivo solo agrega:
   - un hexágono pequeño (decorativo, aria-hidden) después de cada logo, como separador; se pone después de TODOS, también de las copias,
     para que el ciclo de translateX(-50%) siga siendo exacto;
   - aria-hidden en las tarjetas copiadas (sus <img> ya traen alt="" y aria-hidden);
   - el botón Pausar / Reanudar (marcador ini:marcas, viene con hidden y solo se muestra con JS y con movimiento).
   Con prefers-reduced-motion la franja es una lista quieta que envuelve, sin copias ni separadores (todo en CSS, bloque inicio:marcas).
   Sin JS: los logos se ven igual (corren o quedan quietos según el CSS); no guarda datos ni llama a servidores. */
(function () {
  'use strict';
  var I = window.INI;
  if (!I || !I.raiz) return;
  var banda = I.raiz.querySelector('.ini-marcas');
  var pista = banda && banda.querySelector('.marquee-track');
  if (!pista || banda.classList.contains('ini-marcas-js')) return;

  [].slice.call(pista.children).forEach(function (t) {
    if (t.tagName !== 'DIV') return;
    t.classList.add('ini-marca');
    if (t.querySelector('img[aria-hidden="true"]')) { t.classList.add('ini-marca-copia'); t.setAttribute('aria-hidden', 'true'); }
    var hex = document.createElement('span');
    hex.className = 'ini-marcas-hex';
    hex.setAttribute('aria-hidden', 'true');
    t.parentNode.insertBefore(hex, t.nextSibling);
  });
  banda.classList.add('ini-marcas-js');

  var monta = I.montar('marcas');
  var btn = monta && monta.querySelector('[data-ini-marcas-pausa]');
  if (!btn || I.reducido()) return;
  var txt = btn.querySelector('.ini-marcas-pausa-txt');
  function poner(detenida) {
    banda.classList.toggle('is-detenida', detenida);
    btn.setAttribute('aria-label', detenida ? 'Reanudar el carrusel de marcas' : 'Pausar el carrusel de marcas');
    if (txt) txt.textContent = detenida ? 'Reanudar' : 'Pausar';
  }
  // El foco dentro de la franja la pausa (CSS); si con el foco en el botón se pide «Reanudar», .is-sigue la deja correr hasta que el foco salga.
  btn.addEventListener('click', function () {
    var detener = !banda.classList.contains('is-detenida');
    poner(detener);
    banda.classList.toggle('is-sigue', !detener);
  });
  banda.addEventListener('focusout', function (e) { if (!banda.contains(e.relatedTarget)) banda.classList.remove('is-sigue'); });
  poner(false);
  btn.hidden = false;
})();
