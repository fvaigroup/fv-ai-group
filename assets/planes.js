/* Planes de la Línea Triangular: pago adelantado y selector de tamaño.
   Regla de precio: 20 % de descuento SOLO si se paga de contado un producto de pago único o si se adelantan 3, 6, 9 o 12 meses
   de un producto mensual. Pagando mes a mes o en cuotas no hay descuento.
   ahorro(precio, meses) = precio × meses × 0,8 (2 decimales). Este archivo también lo usan las pruebas automáticas (Node). */
(function (g) {
  'use strict';
  var MESES = [3, 6, 9, 12], FACTOR = 0.8;
  function ahorro(precio, meses) { return Math.round(precio * meses * FACTOR * 100) / 100; }
  function fmt(n) {
    var p = n.toFixed(2).split('.');
    return '$' + p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + p[1];
  }
  var API = { MESES: MESES, FACTOR: FACTOR, ahorro: ahorro, fmt: fmt };
  g.FV_PLANES = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  if (typeof document === 'undefined') return;

  function iniciar() {
    // 1) pago adelantado: se calcula a partir del precio del tamaño elegido
    document.querySelectorAll('[data-panel][data-precio]').forEach(function (panel) {
      var precio = parseFloat(panel.getAttribute('data-precio'));
      var tipo = panel.getAttribute('data-tipo');
      if (isNaN(precio)) return;
      if (tipo === 'mensual') {
        var l12 = panel.querySelector('[data-ahorro="12"]'); if (l12) l12.textContent = fmt(ahorro(precio, 12));
        MESES.forEach(function (m) { var el = panel.querySelector('[data-ahorro-lista="' + m + '"]'); if (el) el.textContent = fmt(ahorro(precio, m)); });
      } else {
        var c = panel.querySelector('[data-contado]'); if (c) c.textContent = fmt(Math.round(precio * FACTOR * 100) / 100);
      }
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
