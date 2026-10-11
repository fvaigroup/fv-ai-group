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

  // ---------------- Planes y precios (fuente única de los números de la página) ----------------
  var DESCUENTO_ANUAL = 0.2;
  var MINUTOS_POR_SOCIO = 2; // estimación: minutos de cobranza ahorrados por socio al mes (recordatorios y conciliación)
  var PLANES = [
    { id: 'esencial', nombre: 'Esencial', min: 1, max: 300, mensual: 199, implementacion: 150 },
    { id: 'plus', nombre: 'Plus', min: 301, max: 1000, mensual: 349, implementacion: 300 },
    { id: 'pro', nombre: 'Pro', min: 1001, max: 2500, mensual: 549, implementacion: 450 },
    { id: 'max', nombre: 'Max', min: 2501, max: 5000, mensual: 799, implementacion: 600 }
  ];
  var A_MEDIDA = { id: 'a-medida', nombre: 'A medida', min: 5001, max: Infinity, mensual: null, desde: 1100 };

  function redondear(n) { return Math.round(n * 100) / 100; }
  /** Total del año pagado por adelantado: mensual × 12 × 0,8, con 2 decimales. */
  function anual(mensual) { return redondear(mensual * 12 * (1 - DESCUENTO_ANUAL)); }
  /** Precio mensual equivalente del plan anual. */
  function equivalenteMensual(mensual) { return redondear(anual(mensual) / 12); }
  function ahorroAnual(mensual) { return redondear(mensual * 12 - anual(mensual)); }
  function fmt(n) {
    var p = n.toFixed(2).split('.');
    return '$' + p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + p[1];
  }
  /** Plan recomendado para un número de socios (más de 5.000: a medida). */
  function planPara(socios) {
    var n = Math.max(1, Math.floor(Number(socios) || 0));
    for (var i = 0; i < PLANES.length; i++) if (n <= PLANES[i].max) return PLANES[i];
    return A_MEDIDA;
  }
  /** Costo por socio al mes con ese plan y ese número de socios (null si es a medida). */
  function costoPorSocio(plan, socios) {
    var n = Math.max(1, Math.floor(Number(socios) || 0));
    return plan.mensual ? redondear(plan.mensual / n) : null;
  }
  /** Horas de cobranza que se estima ahorrar al mes (2 minutos por socio), redondeadas a la hora. */
  function horasAhorradas(socios) {
    var n = Math.max(0, Math.floor(Number(socios) || 0));
    return Math.round((n * MINUTOS_POR_SOCIO) / 60);
  }

  // ---------------- Interruptor mensual / anual ----------------
  function iniciarPlanes() {
    var grupo = document.querySelector('[data-club-toggle]');
    var rejilla = document.querySelector('[data-club-planes]');
    if (!grupo || !rejilla) return;
    function aplicar(ciclo) {
      rejilla.setAttribute('data-ciclo', ciclo);
      grupo.querySelectorAll('[data-ciclo]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-ciclo') === ciclo ? 'true' : 'false'); });
      rejilla.querySelectorAll('[data-plan]').forEach(function (art) {
        var m = parseFloat(art.getAttribute('data-mensual'));
        var precio = art.querySelector('[data-precio]'), nota = art.querySelector('[data-nota]');
        if (ciclo === 'anual') {
          precio.textContent = fmt(equivalenteMensual(m));
          nota.textContent = 'Se paga ' + fmt(anual(m)) + ' por adelantado (12 meses). Ahorra ' + fmt(ahorroAnual(m)) + '.';
        } else {
          precio.textContent = '$' + m;
          nota.textContent = 'Pago mes a mes, sin permanencia.';
        }
      });
    }
    grupo.querySelectorAll('[data-ciclo]').forEach(function (b) { b.addEventListener('click', function () { aplicar(b.getAttribute('data-ciclo')); }); });
    aplicar('mensual');
  }

  // ---------------- Calculadora ----------------
  function iniciarCalculadora() {
    var cont = document.querySelector('[data-club-calc]');
    if (!cont) return;
    var num = cont.querySelector('[data-calc-numero]'), rango = cont.querySelector('[data-calc-rango]'), wa = cont.querySelector('[data-calc-wa]');
    function el(k) { return cont.querySelector('[data-calc="' + k + '"]'); }
    function pintar(n) {
      var plan = planPara(n), horas = horasAhorradas(n);
      el('horas').textContent = (horas === 1 ? '1 hora' : horas + ' horas') + ' al mes';
      if (plan.mensual) {
        el('plan').textContent = plan.nombre;
        el('rango').textContent = (plan.min === 1 ? 'Hasta ' + plan.max.toLocaleString('es-VE') : plan.min.toLocaleString('es-VE') + ' a ' + plan.max.toLocaleString('es-VE')) + ' socios';
        el('mensual').textContent = '$' + plan.mensual + '/mes';
        el('anual').textContent = fmt(equivalenteMensual(plan.mensual)) + '/mes';
        el('anual-total').textContent = 'Se paga ' + fmt(anual(plan.mensual)) + ' al año por adelantado.';
        el('porsocio').textContent = fmt(costoPorSocio(plan, n)) + ' al mes';
      } else {
        el('plan').textContent = 'A medida';
        el('rango').textContent = 'Más de 5.000 socios o varias sedes';
        el('mensual').textContent = 'Desde $' + A_MEDIDA.desde.toLocaleString('es-VE') + '/mes';
        el('anual').textContent = 'A medida';
        el('anual-total').textContent = 'Armamos la propuesta para su club.';
        el('porsocio').textContent = 'Se cotiza a la medida';
      }
      var msg = 'Hola F&V, mi club tiene ' + n.toLocaleString('es-VE') + ' socios y quiero ver la demo de Club (plan ' + plan.nombre.toLowerCase() + ')';
      wa.setAttribute('href', 'https://wa.me/584244125386?text=' + encodeURIComponent(msg));
    }
    function desdeNumero() {
      var n = parseInt(num.value, 10);
      if (!(n >= 1)) return;
      n = Math.min(n, 100000);
      rango.value = Math.min(n, parseInt(rango.max, 10));
      pintar(n);
    }
    num.addEventListener('input', desdeNumero);
    rango.addEventListener('input', function () { num.value = rango.value; desdeNumero(); });
    desdeNumero();
  }

  var Club = { PLANES: PLANES, A_MEDIDA: A_MEDIDA, anual: anual, equivalenteMensual: equivalenteMensual, ahorroAnual: ahorroAnual, fmt: fmt, planPara: planPara, costoPorSocio: costoPorSocio, horasAhorradas: horasAhorradas };
  root.Club = Club;
  if (typeof module !== 'undefined' && module.exports) module.exports = Club;
  if (typeof document !== 'undefined') {
    var listo = function () { iniciarPestanas(); iniciarPlanes(); iniciarCalculadora(); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', listo); else listo();
  }
})(typeof window !== 'undefined' ? window : globalThis);
