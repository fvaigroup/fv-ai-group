/* Planes ▲ (negocios pequeños): pago adelantado y selector de tamaño.
   Regla de precio: hay UN solo descuento, 30 % por pagar 12 meses por adelantado un plan mensual. Mes a mes, en cuotas o de contado
   (productos de pago único) no hay descuento.
   anual(precio) = precio × 12 × 0,70, con 2 decimales (▲). anualEntero(precio) = lo mismo redondeado al entero (⬡).
   Este archivo también lo usan las pruebas automáticas (Node). */
(function (g) {
  'use strict';
  var DESCUENTO = 0.30, FACTOR = 0.70;
  function anual(precio) { return Math.round(precio * 12 * FACTOR * 100) / 100; }
  function anualEntero(precio) { return Math.round(precio * 12 * FACTOR); }
  function miles(entero) { return String(entero).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function fmt(n) {
    var p = n.toFixed(2).split('.');
    return '$' + miles(p[0]) + ',' + p[1];
  }
  function fmtEntero(n) { return '$' + miles(Math.round(n)); }
  var API = { DESCUENTO: DESCUENTO, FACTOR: FACTOR, anual: anual, anualEntero: anualEntero, fmt: fmt, fmtEntero: fmtEntero };
  g.FV_PLANES = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  if (typeof document === 'undefined') return;

  function iniciar() {
    // 1) pago adelantado (12 meses, 30 % menos): se calcula a partir del precio del tamaño elegido
    document.querySelectorAll('[data-panel][data-precio][data-tipo="mensual"]').forEach(function (panel) {
      var precio = parseFloat(panel.getAttribute('data-precio'));
      if (isNaN(precio)) return;
      var l12 = panel.querySelector('[data-ahorro="12"]'); if (l12) l12.textContent = fmt(anual(precio));
    });
    // 2) selector de tamaño (pestañas con teclado): el precio, lo que incluye y el mensaje de WhatsApp cambian con el tamaño
    document.querySelectorAll('[data-tabs]').forEach(function (grupo) {
      var tabs = Array.prototype.slice.call(grupo.querySelectorAll('[role="tab"]'));
      var paneles = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
      function elegir(i, foco) {
        tabs.forEach(function (t, j) {
          var on = j === i;
          t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1;
          if (paneles[j]) paneles[j].classList.toggle('hidden', !on);
        });
        if (foco) tabs[i].focus();
      }
      tabs.forEach(function (t, i) {
        t.addEventListener('click', function () { elegir(i, false); });
        t.addEventListener('keydown', function (e) {
          var k = e.key, n = tabs.length;
          if (k === 'ArrowRight' || k === 'ArrowDown') { e.preventDefault(); elegir((i + 1) % n, true); }
          else if (k === 'ArrowLeft' || k === 'ArrowUp') { e.preventDefault(); elegir((i - 1 + n) % n, true); }
          else if (k === 'Home') { e.preventDefault(); elegir(0, true); }
          else if (k === 'End') { e.preventDefault(); elegir(n - 1, true); }
        });
      });
      elegir(0, false);
      // un enlace #tamano-id abre ese tamaño
      grupo.setAttribute('data-listo', '1');
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})(typeof window !== 'undefined' ? window : globalThis);
