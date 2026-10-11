/* Club: comportamiento de la página /club.
   Pestañas accesibles (flechas, Inicio y Fin), interruptor mensual/anual, planes y calculadora.
   Los cálculos son funciones puras (Club.*) que también se prueban con `node tests/club.test.js`. */
(function (root) {
  'use strict';

  // ---------------- Pestañas ----------------
  function iniciarPestanas() {
    document.querySelectorAll('[data-club-tabs]').forEach(function (lista) {
      var tabs = Array.prototype.slice.call(lista.querySelectorAll('[role="tab"]'));
      if (!tabs.length) return;
      function elegir(t, enfocar) {
        tabs.forEach(function (x) {
          var on = x === t;
          x.setAttribute('aria-selected', on ? 'true' : 'false');
          x.tabIndex = on ? 0 : -1;
          var p = document.getElementById(x.getAttribute('aria-controls'));
          if (p) p.hidden = !on;
        });
        if (enfocar) t.focus();
      }
      tabs.forEach(function (t, i) {
        t.addEventListener('click', function () { elegir(t, false); });
        t.addEventListener('keydown', function (e) {
          var n = null;
          if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
          else if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
          else if (e.key === 'Home') n = tabs[0];
          else if (e.key === 'End') n = tabs[tabs.length - 1];
          if (n) { e.preventDefault(); elegir(n, true); }
        });
      });
      elegir(tabs[0], false);
    });
  }

  var Club = {};
  root.Club = Club;
  if (typeof module !== 'undefined' && module.exports) module.exports = Club;
  if (typeof document !== 'undefined') {
    var listo = function () { iniciarPestanas(); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', listo); else listo();
  }
})(typeof window !== 'undefined' ? window : globalThis);
