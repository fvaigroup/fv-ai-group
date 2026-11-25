/* Inicio (index.html) — efecto «faqcierre» del rediseño (24 nov 2026).
   #faq: acordeón de vidrio (CSS del bloque inicio:faqcierre). La apertura suave la hace el script en línea de index.html; este archivo solo
         marca .is-cerrando para que el × vuelva a + (y la viñeta hexagonal se apague) en cuanto empieza a cerrarse.
   #cierre: el sello (hexágono girando con la luciérnaga levitando) es HTML+CSS del marcador ini:faqcierre (sin JS se ve quieto).
         Este archivo agrega a los dos botones una capa de brillo que sigue al puntero (solo mouse/trackpad) y un barrido de luz
         en «Escribir por WhatsApp» (CSS; se pausa fuera de pantalla por data-ini-pausa de #cierre).
   Usa window.INI (assets/inicio-efectos.js). No guarda datos ni llama a servidores. No cambia textos ni enlaces. */
(function () {
  'use strict';
  var INI = window.INI;
  if (!INI) return;

  /* ---------- FAQ: estado «cerrando» para el ícono ----------
     La altura ya la anima el script en línea de index.html («FAQ con transición suave»: height + opacity, respeta reduced-motion);
     aquí no se intercepta el clic (dos animaciones chocarían). Solo se marca .is-cerrando desde el clic hasta que <details> se cierra
     de verdad, para que el × vuelva a + y el hexágono se apague al empezar a cerrar y no al final. */
  var lista = document.querySelector('#faq .ini-faq-lista');
  if (lista) {
    Array.prototype.forEach.call(lista.querySelectorAll(':scope > details'), function (d) {
      var s = d.querySelector('summary');
      if (!s) return;
      // En captura sobre <details>: corre ANTES que el clic del script en línea (que cambia [open]), así lee el estado previo.
      d.addEventListener('click', function (e) { if (d.open && s.contains(e.target)) d.classList.add('is-cerrando'); }, true);
      d.addEventListener('toggle', function () { d.classList.remove('is-cerrando'); });
    });
  }

  /* ---------- Cierre: brillo de los botones ---------- */
  var cierre = document.getElementById('cierre');
  if (!cierre) return;
  var botones = cierre.querySelectorAll('.ini-cierre-botones > a');
  Array.prototype.forEach.call(botones, function (a, i) {
    a.classList.add('ini-fc-btn');
    var brillo = document.createElement('span');
    brillo.className = 'ini-fc-brillo';
    brillo.setAttribute('aria-hidden', 'true');
    a.appendChild(brillo);
    if (i === 0) { // WhatsApp: barrido de luz periódico (CSS)
      var barrido = document.createElement('span');
      barrido.className = 'ini-fc-barrido';
      barrido.setAttribute('aria-hidden', 'true');
      a.appendChild(barrido);
    }
    var px = 0, py = 0, pendiente = false;
    function pintar() {
      pendiente = false;
      a.style.setProperty('--fc-x', px + 'px');
      a.style.setProperty('--fc-y', py + 'px');
    }
    a.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' || !INI.puntero() || INI.reducido()) return;
      var r = a.getBoundingClientRect();
      px = e.clientX - r.left; py = e.clientY - r.top;
      if (!pendiente) { pendiente = true; INI.raf(pintar); }
      a.classList.add('is-brillo');
    });
    a.addEventListener('pointerleave', function () { a.classList.remove('is-brillo'); });
  });
})();
