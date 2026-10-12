/* Precios de las apps de software de F&V (Club, Condominio y Gym): UNA sola tabla para las cuatro páginas
   (/software, /club, /condominio y /gym). Para cambiar un precio, edita SOLO las tablas HEX y TRI de abajo.
   - ⬡ Línea Hexagonal (organizaciones institucionales o grandes): precios redondos (múltiplos de 10).
   - ▲ Línea Triangular (organizaciones pequeñas): precios que terminan en ,99.
   Los tamaños se miden en usuarios: socios (Club), unidades (Condominio) o miembros (Gym).
   Descuento único: 30 % por pagar 12 meses por adelantado (mensual × 12 × 0,70). Hexagonal se redondea al entero; Triangular, a 2 decimales.
   Este archivo también lo usan las pruebas automáticas (Node): node tests/software.test.js */
(function (g) {
  'use strict';
  var FACTOR_ANUAL = 0.70;                       // 30 % de descuento por 12 meses por adelantado
  var HEX = [                                     // hasta N usuarios → USD al mes; por encima de 5.000, a medida
    { hasta: 500, mensual: 190 }, { hasta: 1000, mensual: 250 }, { hasta: 2500, mensual: 430 }, { hasta: 5000, mensual: 740 }
  ];
  var TRI = [                                     // hasta 500 usuarios; por encima conviene la Línea Hexagonal
    { hasta: 100, mensual: 89.99 }, { hasta: 300, mensual: 119.99 }, { hasta: 500, mensual: 189.99 }
  ];
  var IMPLEMENTACION = {                          // pago único
    hex: [{ hasta: 1000, unico: 300 }, { hasta: 5000, unico: 500 }],   // por encima de 5.000, a medida
    tri: { unico: 99.99, cuotas: 2 }                                   // en 2 cuotas
  };
  var PRODUCTOS = {
    club: { nombre: 'Club', usuarios: 'socios', usuario: 'socio' },
    condominio: { nombre: 'Condominio', usuarios: 'unidades', usuario: 'unidad' },
    gym: { nombre: 'Gym', usuarios: 'miembros', usuario: 'miembro' }
  };

  function tabla(linea) { return linea === 'hex' ? HEX : TRI; }
  function redondear(n) { return Math.round(n * 100) / 100; }
  function miles(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function fmt(n) { var p = n.toFixed(2).split('.'); return '$' + miles(p[0]) + ',' + p[1]; }       // $119,99
  function fmtEntero(n) { return '$' + miles(n); }                                                   // $1.596
  function fmtPrecio(linea, n) { return linea === 'hex' ? fmtEntero(n) : fmt(n); }

  /** Rango de usuarios de cada plan: [{desde, hasta, mensual}] */
  function planes(linea) {
    var t = tabla(linea), prev = 0;
    return t.map(function (p) { var r = { desde: prev + 1, hasta: p.hasta, mensual: p.mensual }; prev = p.hasta; return r; });
  }
  /** Plan para N usuarios. Devuelve null si el tamaño no cabe en la línea (Hex > 5.000: a medida; Tri > 500: conviene Hexagonal). */
  function planPara(linea, usuarios) {
    var n = Math.max(1, Math.floor(Number(usuarios) || 0)), ps = planes(linea);
    for (var i = 0; i < ps.length; i++) if (n <= ps[i].hasta) return ps[i];
    return null;
  }
  /** Total de 12 meses por adelantado con 30 % menos. */
  function anual(linea, mensual) { return linea === 'hex' ? Math.round(mensual * 12 * FACTOR_ANUAL) : redondear(mensual * 12 * FACTOR_ANUAL); }
  function equivalenteMensual(linea, mensual) { return linea === 'hex' ? Math.round(anual(linea, mensual) / 12) : redondear(anual(linea, mensual) / 12); }
  function ahorroAnual(linea, mensual) { return linea === 'hex' ? mensual * 12 - anual(linea, mensual) : redondear(mensual * 12 - anual(linea, mensual)); }
  /** Implementación única: {unico, cuotas?} o null si es a medida. */
  function implementacion(linea, usuarios) {
    var n = Math.max(1, Math.floor(Number(usuarios) || 0));
    if (linea === 'tri') return n <= TRI[TRI.length - 1].hasta ? { unico: IMPLEMENTACION.tri.unico, cuotas: IMPLEMENTACION.tri.cuotas } : null;
    for (var i = 0; i < IMPLEMENTACION.hex.length; i++) if (n <= IMPLEMENTACION.hex[i].hasta) return { unico: IMPLEMENTACION.hex[i].unico };
    return null;
  }
  /** Precio mensual más bajo de la línea («desde $X/mes»). */
  function desde(linea) { return tabla(linea)[0].mensual; }
  /** Línea que corresponde a una organización: con junta directiva y administración propia → Hexagonal. */
  function lineaPara(tieneJunta) { return tieneJunta ? 'hex' : 'tri'; }
  /** Costo por usuario al mes con el plan lleno (hasta N usuarios). */
  function costoPorUsuario(linea, usuarios) {
    var p = planPara(linea, usuarios); if (!p) return null;
    return redondear(p.mensual / Math.max(1, Math.floor(Number(usuarios) || 0)));
  }

  var API = {
    FACTOR_ANUAL: FACTOR_ANUAL, HEX: HEX, TRI: TRI, IMPLEMENTACION: IMPLEMENTACION, PRODUCTOS: PRODUCTOS,
    planes: planes, planPara: planPara, anual: anual, equivalenteMensual: equivalenteMensual, ahorroAnual: ahorroAnual,
    implementacion: implementacion, desde: desde, lineaPara: lineaPara, costoPorUsuario: costoPorUsuario,
    fmt: fmt, fmtEntero: fmtEntero, fmtPrecio: fmtPrecio, miles: miles
  };
  g.FV_SOFTWARE = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  if (typeof document === 'undefined') return;

  // «desde $X/mes» en las tarjetas: <span data-sw-desde="hex|tri"> toma el precio de la tabla
  function iniciar() {
    document.querySelectorAll('[data-sw-desde]').forEach(function (el) {
      var l = el.getAttribute('data-sw-desde'); el.textContent = fmtPrecio(l, desde(l));
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})(typeof window !== 'undefined' ? window : globalThis);
