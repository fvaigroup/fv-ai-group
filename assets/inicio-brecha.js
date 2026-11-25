/* Inicio (index.html) — efecto «brecha» del rediseño (24 nov 2026): la cifra del resultado cuenta al calcular y una mini gráfica (SVG)
   dibuja cómo crece la pérdida entre el día del cobro y el día de la compra, con los números que la persona escribió.
   No toca la fórmula: usa window.FV_BRECHA (assets/brecha.js: parsear, formato, calcular) y escucha el resultado que pinta brecha.js
   (MutationObserver sobre [data-brecha-res]), así que brecha.js no cambia. Se carga antes que brecha.js (defer): todo se resuelve al pintar.
   La gráfica supone que la tasa subió de forma pareja entre las dos fechas (por eso el rótulo «Cálculo aproximado»).
   Días de espera: campo opcional (#brecha-dias) fuera del formulario; si se escribe, el eje dice «Día 0 … Día N» y la nota da el promedio por día.
   Sin JS no hay calculadora ni gráfica (se ve el texto con WhatsApp). Con reduced-motion: sin conteo ni trazo animado (estado final).
   No guarda nada ni llama a servidores. Marcado: bloque <!-- ini:brecha:inicio --> … <!-- ini:brecha:fin --> de index.html; CSS: bloque inicio:brecha. */
(function () {
  'use strict';
  var INI = window.INI;
  if (!INI) return;
  var caja = document.querySelector('[data-brecha]');
  var graf = INI.montar('brecha') && INI.montar('brecha').querySelector('[data-brecha-graf]');
  if (!caja || !graf) return;
  var form = caja.querySelector('[data-brecha-form]');
  var res = caja.querySelector('[data-brecha-res]');
  if (!form || !res) return;

  var q = function (s) { return graf.querySelector(s); };
  var linea = q('[data-brecha-graf-linea]'), area = q('[data-brecha-graf-area]'), punto = q('[data-brecha-graf-punto]');
  var ymax = q('[data-brecha-graf-ymax]'), desc = q('[data-brecha-graf-desc]'), nota = q('[data-brecha-graf-nota]');
  var x0 = q('[data-brecha-graf-x0]'), x1 = q('[data-brecha-graf-x1]');
  var dias = graf.querySelector('#brecha-dias');
  var NOTA = nota ? nota.textContent : '';
  // Área de dibujo: viewBox 600 × 200 (600 × 330 si la gráfica mide menos de 480 px, para que no quede chata en el celular);
  // x de 10 a 590, y de Y0 (cero) a 20 (pérdida total)
  var svg = graf.querySelector('svg'), hex = graf.querySelector('.ini-brecha-graf-hex');
  var rejilla = [].slice.call(graf.querySelectorAll('.ini-brecha-graf-rejilla line'));
  var X0 = 10, X1 = 590, Y0 = 190, Y1 = 20, PASOS = 32;
  function medir() {
    var alto = (svg.parentNode.clientWidth || 600) < 480 ? 330 : 200;
    Y0 = alto - 10;
    svg.setAttribute('viewBox', '0 0 600 ' + alto);
    rejilla.forEach(function (l, i) { var y = i === rejilla.length - 1 ? Y0 : Y1 + (Y0 - Y1) * i / (rejilla.length - 1); l.setAttribute('y1', y); l.setAttribute('y2', y); });
    hex.setAttribute('transform', 'translate(' + X0 + ' ' + Y0 + ')');
    punto.setAttribute('transform', 'translate(' + X1 + ' ' + Y1 + ')');
  }

  var desdeCero = false, ultimo = 0, cancelar = [], vals = null;

  function fmt(n) { return window.FV_BRECHA ? window.FV_BRECHA.formato(n) : INI.miles(n, 2); }
  function parsear(t) { return window.FV_BRECHA ? window.FV_BRECHA.parsear(t) : null; }
  function leerDias() {
    var t = dias ? dias.value.trim() : '';
    if (!/^\d{1,3}$/.test(t)) return null;
    var n = parseInt(t, 10);
    return n >= 1 ? n : null;
  }

  // ---------- la cifra cuenta: «Se le fueron D dólares (P %) solo por esperar.» ----------
  // brecha.js escribe el texto completo; aquí se deja ese texto para lectores de pantalla (fv-sr-only) y una copia visual con las cifras que cuentan.
  function animarCifra(p, d, pct, desde) {
    var completo = p.textContent;
    var m = completo.match(/^(Se le fueron )([\d.,]+)( dólares \()([\d.,]+)( %\) solo por esperar\.)$/);
    if (!m) return;
    p.textContent = '';
    var sr = document.createElement('span'); sr.className = 'fv-sr-only'; sr.textContent = completo;
    var vis = document.createElement('span'); vis.setAttribute('aria-hidden', 'true');
    var c1 = document.createElement('span'); c1.className = 'ini-brecha-cifra';
    var c2 = document.createElement('span'); c2.className = 'ini-brecha-cifra-pct';
    vis.appendChild(document.createTextNode(m[1])); vis.appendChild(c1); vis.appendChild(document.createTextNode(m[3]));
    vis.appendChild(c2); vis.appendChild(document.createTextNode(m[5]));
    p.appendChild(sr); p.appendChild(vis);
    var ms = desde ? 500 : 1300;
    cancelar.push(INI.contar(c1, d, ms, fmt, desde ? desde.d : 0));
    cancelar.push(INI.contar(c2, pct, ms, fmt, desde ? desde.pct : 0));
  }

  // ---------- la gráfica ----------
  function dibujar(v, animar) {
    medir();
    var r = window.FV_BRECHA.calcular(v.monto, v.t1, v.t2);
    var tot = r.diferencia, puntos = [];
    for (var i = 0; i <= PASOS; i++) {
      var t = i / PASOS, tasa = v.t1 + (v.t2 - v.t1) * t;
      var perdida = r.siCambiaba - v.monto / tasa; // misma cuenta que brecha.js, con la tasa de ese momento
      puntos.push([X0 + (X1 - X0) * t, Y0 - (Y0 - Y1) * (tot > 0 ? perdida / tot : 0)]);
    }
    var d = puntos.map(function (p, k) { return (k ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ');
    linea.setAttribute('d', d);
    area.setAttribute('d', d + ' L' + X1 + ',' + Y0 + ' L' + X0 + ',' + Y0 + ' Z');
    var n = leerDias();
    if (ymax) ymax.textContent = fmt(tot) + ' dólares';
    x0.textContent = n ? 'Día 0 (cobro)' : 'Día del cobro';
    x1.textContent = n ? 'Día ' + n + ' (compra)' : 'Día de la compra';
    if (nota) nota.textContent = n ? 'En promedio, cada día de espera le costó cerca de ' + fmt(tot / n) + ' dólares. ' + NOTA : NOTA;
    desc.textContent = 'La pérdida crece de 0 a ' + fmt(tot) + ' dólares entre ' + (n ? 'el día 0 y el día ' + n : 'el día del cobro y el día de la compra') + '. Cálculo aproximado.';
    if (animar && !INI.reducido()) {
      graf.classList.remove('is-dibujado');
      void graf.getBoundingClientRect(); // reinicia la transición del trazo
      INI.raf(function () { INI.raf(function () { graf.classList.add('is-dibujado'); }); });
    } else graf.classList.add('is-dibujado');
  }

  function alPintar() {
    cancelar.forEach(function (c) { c(); }); cancelar = [];
    var p = res.querySelector('.ini-brecha-grande');
    var v = { monto: parsear(form.elements.monto.value), t1: parsear(form.elements.t1.value), t2: parsear(form.elements.t2.value) };
    if (res.hidden || !p || !v.monto || !v.t1 || !v.t2 || !window.FV_BRECHA) { graf.hidden = true; ultimo = 0; vals = null; return; }
    var r = window.FV_BRECHA.calcular(v.monto, v.t1, v.t2);
    var perdio = r.perdio && r.diferencia > 0;
    var nuevo = desdeCero || graf.hidden;
    if (perdio) {
      animarCifra(p, r.diferencia, r.porcentaje, nuevo ? null : { d: ultimo, pct: vals ? vals.pct : 0 });
      graf.hidden = false;
      dibujar(v, nuevo);
      anchoPrev = svg.parentNode.clientWidth;
      ultimo = r.diferencia; vals = { pct: r.porcentaje, v: v };
    } else { graf.hidden = true; ultimo = 0; vals = null; }
    desdeCero = false;
  }

  form.addEventListener('submit', function () { desdeCero = true; });
  new MutationObserver(alPintar).observe(res, { childList: true, attributes: true, attributeFilter: ['hidden'] });
  if (dias) dias.addEventListener('input', function () {
    dias.value = dias.value.replace(/\D/g, '').slice(0, 3);
    if (vals && !graf.hidden) dibujar(vals.v, false);
  });
  var anchoPrev = 0;
  addEventListener('resize', function () {
    if (!vals || graf.hidden) return;
    var a = svg.parentNode.clientWidth;
    if ((a < 480) !== (anchoPrev < 480)) dibujar(vals.v, false);
    anchoPrev = a;
  }, { passive: true });
})();
