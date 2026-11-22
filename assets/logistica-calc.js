/* /triangular/delta/logistica — calculadora «¿Qué plan te conviene?» (#precios, [data-log-calc]).
   Costo mensual de cada plan = base + max(0, camiones − incluidos) × extra
     Básico 30 / 5 / 14 · Intermedio 90 / 15 / 6 · Avanzado 210 / 35 / 2   (precios de la tabla del dueño)
   Recomienda el más barato; en empate gana el plan mayor. 1–9 → Básico, 10–34 → Intermedio, 35+ → Avanzado.
   No calcula el anual con extras: solo recuerda el anual del precio base ($300 / $900 / $2.100).
   Sin JS la calculadora no se ve (la tabla de precios ya lo dice todo). Con reduced-motion, estado final sin animar.
   La fórmula se prueba en tests/logistica.test.js (este archivo se puede cargar con require en node). */
(function () {
  'use strict';

  /* ---------- fórmula (pura, sin DOM) ---------- */
  var PLANES = [
    { k: 'B', nombre: 'Básico', base: 30, incl: 5, extra: 14, anual: 300 },
    { k: 'I', nombre: 'Intermedio', base: 90, incl: 15, extra: 6, anual: 900 },
    { k: 'A', nombre: 'Avanzado', base: 210, incl: 35, extra: 2, anual: 2100 }
  ];
  var MIN = 1, MAX = 60, INICIAL = 8;

  function costo(plan, camiones) {
    var extras = Math.max(0, camiones - plan.incl);
    return { k: plan.k, nombre: plan.nombre, base: plan.base, incl: plan.incl, extra: plan.extra, anual: plan.anual, extras: extras, total: plan.base + extras * plan.extra };
  }
  function calcular(camiones) {
    var n = Math.max(MIN, Math.round(Number(camiones) || MIN));
    var lista = PLANES.map(function (p) { return costo(p, n); });
    var mejor = lista[0];
    for (var i = 1; i < lista.length; i++) if (lista[i].total <= mejor.total) mejor = lista[i]; // <=: en empate, el plan mayor
    return { camiones: n, planes: lista, mejor: mejor };
  }

  var API = { PLANES: PLANES, MIN: MIN, MAX: MAX, costo: costo, calcular: calcular };
  if (typeof module !== 'undefined' && module.exports) { module.exports = API; return; }
  if (typeof document === 'undefined') return;

  /* ---------- página ---------- */
  function iniciar() {
    var LOG = window.LOG;
    if (!LOG || !LOG.raiz) return;
    var sec = LOG.raiz.querySelector('[data-log-calc]');
    if (!sec || !sec.querySelector('[data-calc-in="n"]')) return;
    var reducir = !!LOG.reducir;
    var WA = 'https://wa.me/584244125386?text=';

    function q(s) { return sec.querySelector(s); }
    function el(k) { return q('[data-calc="' + k + '"]'); }
    function txt(e, t) { if (e && e.textContent !== t) e.textContent = t; }
    var inN = q('[data-calc-in="n"]'), inR = q('[data-calc-in="r"]');
    var ePlan = el('plan'), eTotal = el('total'), ePor = el('por'), eFrase = el('frase'), eAnual = el('anual');
    var eWa = el('wa'), eVivo = el('vivo'), eFlota = el('flota'), eLey = el('ley'), eUni = el('uni');
    var eSil = q('[data-calc-sil]');
    var barras = {};
    PLANES.forEach(function (p) {
      var li = q('[data-calc-barra="' + p.k + '"]');
      barras[p.k] = { li: li, fill: li && li.querySelector('.log-calc-fill'), cifra: q('[data-calc-cifra="' + p.k + '"]'), det: q('[data-calc-det="' + p.k + '"]'), mostrado: 0, parar: null };
    });

    var listo = reducir || !('IntersectionObserver' in window);
    var totalMostrado = 0, pararTotal = null, tVivo = 0, planPrevio = '', flotaPrevia = '', nPrevio = 0;

    function camion(n) { return LOG.miles(n) + (n === 1 ? ' camión' : ' camiones'); }
    function contarA(e, desde, hasta) {
      if (!listo || reducir || desde === hasta || document.hidden) { txt(e, LOG.num(hasta)); return null; }
      return LOG.contar(e, hasta, 600, function (v) { return LOG.num(Math.round(v)); }, desde);
    }
    function detalle(c) {
      if (!c.extras) return 'Incluye hasta ' + LOG.miles(c.incl) + ' camiones.';
      return LOG.num(c.base) + ' + ' + LOG.miles(c.extras) + (c.extras === 1 ? ' camión extra' : ' camiones extra') + ' × ' + LOG.num(c.extra) + '.';
    }
    function porQue(r) {
      var m = r.mejor, otros = r.planes.filter(function (c) { return c.k !== m.k; });
      var alt = otros[0];
      for (var i = 1; i < otros.length; i++) if (otros[i].total < alt.total) alt = otros[i];
      var cab = 'Con ' + camion(r.camiones) + ', ';
      if (alt.total === m.total) {
        return cab + 'el ' + alt.nombre + ' y el ' + m.nombre + ' te salen igual, ' + LOG.num(m.total) + ' al mes, y el ' + m.nombre + ' trae más funciones.';
      }
      var a = r.planes.indexOf(alt) < r.planes.indexOf(m) ? alt : m, b = a === alt ? m : alt; // en el orden de los planes
      return cab + 'el ' + a.nombre + ' te sale ' + LOG.num(a.total) + ' y el ' + b.nombre + ' ' + LOG.num(b.total) +
        ' al mes: con el ' + m.nombre + ' ahorras ' + LOG.num(alt.total - m.total) + ' al mes.';
    }

    function pintarFlota(r) {
      if (!eFlota) return;
      var clave = LOG.flota ? LOG.flota() : '350', m = r.mejor;
      var cupos = Math.max(r.camiones, Math.min(MAX, m.incl));
      if (clave !== flotaPrevia) { eFlota.innerHTML = ''; flotaPrevia = clave; nPrevio = 0; }
      while (eFlota.children.length > cupos) eFlota.removeChild(eFlota.lastChild);
      while (eFlota.children.length < cupos) {
        var s = LOG.silueta(clave, 'log-calc-cam');
        if (!reducir && listo && nPrevio) s.classList.add('is-nuevo');
        eFlota.appendChild(s);
      }
      for (var i = 0; i < cupos; i++) {
        var c = eFlota.children[i], tipo = i >= r.camiones ? 'cupo' : (i < m.incl ? 'incl' : 'extra');
        if (c.getAttribute('data-t') !== tipo) {
          c.setAttribute('data-t', tipo);
          c.setAttribute('class', 'log-sil log-calc-cam is-' + tipo + (c.classList.contains('is-nuevo') ? ' is-nuevo' : ''));
        }
      }
      nPrevio = r.camiones;
      if (eSil && eSil.getAttribute('data-k') !== clave) {
        eSil.innerHTML = ''; eSil.appendChild(LOG.silueta(clave)); eSil.setAttribute('data-k', clave);
      }
      var incl = Math.min(r.camiones, m.incl);
      var t = '<span class="log-calc-ley-i"></span>' + LOG.miles(incl) + ' incluido' + (incl === 1 ? '' : 's') + ' en el ' + m.nombre;
      if (m.extras) t += ' · <span class="log-calc-ley-e"></span>' + LOG.miles(m.extras) + ' extra';
      else if (m.incl > r.camiones) t += ' · <span class="log-calc-ley-c"></span>' + LOG.miles(m.incl - r.camiones) + ' cupo' + (m.incl - r.camiones === 1 ? '' : 's') + ' libre' + (m.incl - r.camiones === 1 ? '' : 's');
      if (eLey && eLey.innerHTML !== t) eLey.innerHTML = t;
    }

    function actualizar(n, anunciar) {
      var r = calcular(n), m = r.mejor;
      var pct = ((r.camiones - MIN) / (MAX - MIN) * 100).toFixed(2) + '%';
      inR.style.setProperty('--log-calc-pct', pct);
      inR.setAttribute('aria-valuetext', camion(r.camiones));
      txt(eUni, r.camiones === 1 ? 'camión' : 'camiones');

      if (m.k !== planPrevio) {
        txt(ePlan, m.nombre);
        if (planPrevio && !reducir && listo) { ePlan.classList.remove('is-cambio'); void ePlan.offsetWidth; ePlan.classList.add('is-cambio'); }
        planPrevio = m.k;
      }
      if (pararTotal) pararTotal();
      pararTotal = contarA(eTotal, totalMostrado, m.total);
      totalMostrado = m.total;
      txt(ePor, porQue(r));

      var max = Math.max.apply(null, r.planes.map(function (c) { return c.total; }));
      r.planes.forEach(function (c) {
        var b = barras[c.k];
        if (!b.li) return;
        b.li.classList.toggle('is-mejor', c.k === m.k);
        if (b.fill) b.fill.style.setProperty('--log-calc-v', (listo ? Math.max(0.04, c.total / max) : 0).toFixed(3));
        if (b.parar) b.parar();
        b.parar = contarA(b.cifra, b.mostrado, c.total);
        b.mostrado = c.total;
        txt(b.det, detalle(c));
      });

      if (eFrase) eFrase.classList.toggle('is-on', r.camiones > 9);
      txt(eAnual, 'Pagando anual, el precio base del ' + m.nombre + ' es ' + LOG.num(m.anual) + ' al año (12 meses por el precio de 10).' +
        (m.extras ? ' Ese monto no incluye los camiones extra.' : ''));
      if (eWa) {
        eWa.href = WA + encodeURIComponent('Hola F&V, me interesa Logística, plan ' + m.nombre + '. Tengo ' + camion(r.camiones) + '.');
        eWa.setAttribute('data-plan-wa', m.k);
        txt(eWa, 'Quiero el ' + m.nombre);
      }
      pintarFlota(r);
      if (anunciar && eVivo) {
        clearTimeout(tVivo);
        tVivo = setTimeout(function () {
          txt(eVivo, 'Con ' + camion(r.camiones) + ' te conviene el ' + m.nombre + ': ' + LOG.num(m.total) + ' al mes.');
        }, 700);
      }
    }

    function leer(v) {
      var n = parseInt(v, 10);
      if (isNaN(n)) return null;
      return Math.min(MAX, Math.max(MIN, n));
    }
    var actual = leer(inN.value) || INICIAL;
    function poner(n, desde) {
      if (n == null) return;
      actual = n;
      if (desde !== inR) inR.value = String(n);
      if (desde !== inN) inN.value = String(n);
      actualizar(n, true);
    }
    inR.addEventListener('input', function () { poner(leer(inR.value), inR); });
    inN.addEventListener('input', function () {
      var n = parseInt(inN.value, 10);
      if (!isNaN(n) && n >= MIN && n <= MAX) poner(n, inN); // mientras escribe, solo valores válidos
    });
    inN.addEventListener('change', function () { poner(leer(inN.value) || actual); });
    inN.addEventListener('blur', function () { if (String(actual) !== inN.value) inN.value = String(actual); });
    Array.prototype.forEach.call(sec.querySelectorAll('[data-calc-paso]'), function (b) {
      b.addEventListener('click', function () { poner(Math.min(MAX, Math.max(MIN, actual + Number(b.getAttribute('data-calc-paso'))))); });
    });
    if (LOG.alCambiar) LOG.alCambiar(function () { pintarFlota(calcular(actual)); });

    inR.value = inN.value = String(actual);
    if (listo) {
      actualizar(actual, false);
    } else {
      sec.classList.add('is-espera');
      actualizar(actual, false);
      LOG.alVer(q('.log-calc-res') || sec, function () {
        listo = true;
        sec.classList.remove('is-espera');
        totalMostrado = 0;
        PLANES.forEach(function (p) { barras[p.k].mostrado = 0; });
        actualizar(actual, false);
      }, 0.3);
    }
  }

  if (window.LOG) iniciar();
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else setTimeout(iniciar, 0);
})();
