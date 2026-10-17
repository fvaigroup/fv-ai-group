/* Precios de las apps de software de F&V (Club, Condominio y Gym): UNA sola tabla para las cuatro páginas
   (/software, /club, /condominio y /gym). Para cambiar un precio, edita SOLO las tablas HEX y TRI de abajo.
   - ⬡ Empresas e instituciones (organizaciones institucionales o grandes): precios redondos (múltiplos de 10).
   - ▲ Negocios pequeños (organizaciones pequeñas): precios que terminan en ,99.
   En los textos y mensajes solo se usa la forma (⬡, ▲); los nombres de las líneas quedan solo en el inicio.
   Los tamaños se miden en usuarios: socios (Club), unidades (Condominio) o miembros (Gym).
   Descuento único: 30 % por pagar 12 meses por adelantado (mensual × 12 × 0,70). Hexagonal se redondea al entero; Triangular, a 2 decimales.
   Este archivo también lo usan las pruebas automáticas (Node): node tests/software.test.js */
(function (g) {
  'use strict';
  var FACTOR_ANUAL = 0.70;                       // 30 % de descuento por 12 meses por adelantado
  var HEX = [                                     // hasta N usuarios → USD al mes; por encima de 5.000, a medida
    { hasta: 500, mensual: 190 }, { hasta: 1000, mensual: 250 }, { hasta: 2500, mensual: 430 }, { hasta: 5000, mensual: 740 }
  ];
  var TRI = [                                     // hasta 500 usuarios; por encima conviene ⬡
    { hasta: 100, mensual: 89.99 }, { hasta: 300, mensual: 119.99 }, { hasta: 500, mensual: 189.99 }
  ];
  var IMPLEMENTACION = {                          // pago único
    hex: [{ hasta: 1000, unico: 300 }, { hasta: 5000, unico: 500 }],   // por encima de 5.000, a medida
    tri: { unico: 99.99, cuotas: 2 }                                   // en 2 cuotas
  };
  var PRODUCTOS = {
    club: { nombre: 'Club', usuarios: 'socios', usuario: 'socio', directiva: 'la junta', dominio: 'socios.suclub.com' },
    condominio: { nombre: 'Condominio', usuarios: 'unidades', usuario: 'unidad', directiva: 'la junta o la administradora', dominio: 'propietarios.suedificio.com' },
    gym: { nombre: 'Gym', usuarios: 'miembros', usuario: 'miembro', directiva: 'la gerencia', dominio: 'miembros.sugym.com' }
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

  // ---------------- Textos de lo que incluye cada plan ----------------
  function incluyeTodos(prod) {
    var p = PRODUCTOS[prod];
    return ['App para los ' + p.usuarios, 'Panel de administración', 'Recibos y avisos por correo', 'Hasta 3 mensajes de WhatsApp por ' + p.usuario + ' al mes', 'Reportes', 'Copias de seguridad diarias'];
  }
  function incluyeLinea(linea, prod) {
    var p = PRODUCTOS[prod];
    if (linea === 'hex') return ['Marca completa de la organización (logo y colores) y, opcional, su propio dominio (por ejemplo ' + p.dominio + ')', 'Capacitación presencial a la administración y a ' + p.directiva,
      'Una reunión mensual con ' + p.directiva + ' para revisar cobranza y morosidad', 'Soporte prioritario con respuesta el mismo día', 'Comunicados con la imagen de la organización'];
    return ['La app completa con el logo de la organización', 'Soporte por WhatsApp'];
  }
  /** Mensaje de WhatsApp: nombra el producto, la forma (⬡ o ▲) y el tamaño elegido (y el pago anual si corresponde). */
  function mensaje(linea, prod, plan, ciclo) {
    var p = PRODUCTOS[prod], lin = linea === 'hex' ? '⬡' : '▲';
    if (!plan) return 'Hola F&V, quiero ' + p.nombre + ' (' + lin + ', más de 5.000 ' + p.usuarios + '). ¿Podemos conversar?';
    var tam = 'hasta ' + miles(plan.hasta) + ' ' + p.usuarios;
    var precio = ciclo === 'anual' ? 'pago anual por adelantado, ' + fmtPrecio(linea, anual(linea, plan.mensual)) + ' (30 % menos)' : fmtPrecio(linea, plan.mensual) + '/mes';
    return 'Hola F&V, quiero ' + p.nombre + ' (' + lin + ', ' + tam + ', ' + precio + '). ' + (linea === 'hex' ? '¿Podemos conversar?' : '¿Cómo pago?');
  }
  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function wa(texto) { return 'https://wa.me/584244125386?text=' + encodeURIComponent(texto); }

  /** HTML de la tabla de planes de un producto y una línea (el mismo para las páginas Club, Condominio y Gym). */
  function planesHTML(linea, prod) {
    var p = PRODUCTOS[prod], ps = planes(linea), hex = linea === 'hex';
    var cartas = ps.map(function (pl) {
      var tam = 'Hasta ' + miles(pl.hasta) + ' ' + p.usuarios;
      var im = implementacion(linea, pl.hasta);
      var porU = costoPorUsuario(linea, pl.hasta);
      var id = 'swp-' + linea + '-' + prod + '-' + pl.hasta;
      return '<article class="swp-card" data-sw-mensual="' + pl.mensual + '" data-sw-hasta="' + pl.hasta + '" aria-labelledby="' + id + '">' +
        '<h4 id="' + id + '" class="swp-tam">' + esc(tam) + '</h4>' +
        '<p class="swp-precio"><span data-sw-precio>' + fmtPrecio(linea, pl.mensual) + '</span><span class="swp-un">/mes</span></p>' +
        '<p class="swp-nota" data-sw-nota aria-live="polite">Pago mes a mes.</p>' +
        '<p class="swp-detalle">Desde ' + fmt(porU) + ' por ' + p.usuario + ' al mes con ' + miles(pl.hasta) + ' ' + p.usuarios + '.</p>' +
        '<p class="swp-detalle">Implementación única: <strong>' + (im ? fmtPrecio(linea, im.unico) : 'a medida') + '</strong>' + (im && im.cuotas ? ' en ' + im.cuotas + ' cuotas' : '') + '.</p>' +
        '<a class="swp-cta" href="' + esc(wa(mensaje(linea, prod, pl, 'mensual'))) + '" target="_blank" rel="noopener" data-sw-cta data-product="' + prod + '-' + linea + '-' + pl.hasta + '" data-cta="' + prod + '_planes" data-evento="' + prod + '_plan_' + linea + '_' + pl.hasta + '">Quiero ' + esc(p.nombre) + ': ' + esc(tam.toLowerCase()) + '</a>' +
        '</article>';
    }).join('');
    var ultimo = '';
    if (hex) {
      ultimo = '<article class="swp-card swp-medida"><h4 class="swp-tam">Más de 5.000 ' + p.usuarios + '</h4><p class="swp-precio swp-precio-medida">A medida</p><p class="swp-detalle">Armamos la propuesta para su organización.</p>' +
        '<a class="swp-cta" href="' + esc(wa(mensaje(linea, prod, null))) + '" target="_blank" rel="noopener" data-product="' + prod + '-hex-a-medida" data-cta="' + prod + '_planes" data-evento="' + prod + '_plan_hex_a_medida">Hablemos</a></article>';
    }
    var toggle = '<div class="swp-toggle" role="group" aria-label="Frecuencia de pago"><button type="button" class="swp-tab" aria-pressed="true" data-sw-ciclo="mensual" data-evento="' + prod + '_' + linea + '_mensual">Mensual</button>' +
      '<button type="button" class="swp-tab" aria-pressed="false" data-sw-ciclo="anual" data-evento="' + prod + '_' + linea + '_anual">Anual <span>(30 % de descuento)</span></button></div>';
    var todos = incluyeTodos(prod).concat(incluyeLinea(linea, prod)).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');
    return toggle + '<div class="swp-grid" data-sw-linea="' + linea + '" data-sw-producto="' + prod + '" data-sw-ciclo-actual="mensual">' + cartas + ultimo + '</div>' +
      '<div class="swp-incluye"><h4>Todos los planes de ' + esc(p.nombre) + ' para ' + (hex ? 'empresas e instituciones' : 'organizaciones pequeñas') + ' incluyen</h4><ul>' + todos + '</ul></div>' +
      (hex ? '' : '<p class="swp-aviso">¿Más de 500 ' + p.usuarios + '? Mira los <a href="#hexagonal">planes para empresas e instituciones</a>.</p>');
  }

  /** Recomendación para una organización: con junta directiva y administración propia → Hexagonal; si no → Triangular.
      Si el tamaño no cabe en la Triangular (más de 500), pasa a la Hexagonal; si pasa de 5.000, es a medida. */
  function recomendar(tieneJunta, usuarios) {
    var linea = lineaPara(tieneJunta), plan = planPara(linea, usuarios);
    if (plan) return { linea: linea, plan: plan, cambioDeLinea: false, aMedida: false };
    if (linea === 'tri') { var h = planPara('hex', usuarios); return { linea: 'hex', plan: h, cambioDeLinea: true, aMedida: !h }; }
    return { linea: 'hex', plan: null, cambioDeLinea: false, aMedida: true };
  }

  var API = {
    FACTOR_ANUAL: FACTOR_ANUAL, HEX: HEX, TRI: TRI, IMPLEMENTACION: IMPLEMENTACION, PRODUCTOS: PRODUCTOS,
    planes: planes, planPara: planPara, anual: anual, equivalenteMensual: equivalenteMensual, ahorroAnual: ahorroAnual,
    implementacion: implementacion, desde: desde, lineaPara: lineaPara, recomendar: recomendar, costoPorUsuario: costoPorUsuario,
    incluyeTodos: incluyeTodos, incluyeLinea: incluyeLinea, mensaje: mensaje, planesHTML: planesHTML,
    fmt: fmt, fmtEntero: fmtEntero, fmtPrecio: fmtPrecio, miles: miles
  };
  g.FV_SOFTWARE = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  if (typeof document === 'undefined') return;

  // «desde $X/mes» en las tarjetas y planes: el HTML ya viene escrito desde esta misma tabla (scripts/render-planes.js);
  // aquí solo se activa el interruptor mensual/anual y, si un contenedor llegó vacío, se dibuja.
  function activar(cont) {
    var grid = cont.querySelector('[data-sw-linea]'); if (!grid) return;
    var linea = grid.getAttribute('data-sw-linea'), prod = grid.getAttribute('data-sw-producto');
    function aplicar(ciclo) {
      grid.setAttribute('data-sw-ciclo-actual', ciclo);
      cont.querySelectorAll('[data-sw-ciclo]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-sw-ciclo') === ciclo ? 'true' : 'false'); });
      grid.querySelectorAll('.swp-card[data-sw-mensual]').forEach(function (c) {
        var m = parseFloat(c.getAttribute('data-sw-mensual')), hasta = parseInt(c.getAttribute('data-sw-hasta'), 10);
        c.querySelector('[data-sw-precio]').textContent = fmtPrecio(linea, ciclo === 'anual' ? equivalenteMensual(linea, m) : m);
        c.querySelector('[data-sw-nota]').textContent = ciclo === 'anual' ? 'Se paga ' + fmtPrecio(linea, anual(linea, m)) + ' por adelantado (12 meses). Ahorra ' + fmtPrecio(linea, ahorroAnual(linea, m)) + '.' : 'Pago mes a mes.';
        var a = c.querySelector('[data-sw-cta]'); if (a) a.setAttribute('href', wa(mensaje(linea, prod, { hasta: hasta, mensual: m }, ciclo)));
      });
    }
    cont.querySelectorAll('[data-sw-ciclo]').forEach(function (b) { b.addEventListener('click', function () { aplicar(b.getAttribute('data-sw-ciclo')); }); });
  }
  function iniciar() {
    document.querySelectorAll('[data-sw-desde]').forEach(function (el) {
      var l = el.getAttribute('data-sw-desde'); el.textContent = fmtPrecio(l, desde(l));
    });
    document.querySelectorAll('[data-sw-planes]').forEach(function (cont) {
      if (!cont.firstElementChild) cont.innerHTML = planesHTML(cont.getAttribute('data-sw-planes'), cont.getAttribute('data-producto'));
      activar(cont);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})(typeof window !== 'undefined' ? window : globalThis);
