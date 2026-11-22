/* /triangular/cobranza — calculadora «¿Cuántas horas pierdes cobrando?» (#calculadora).
   Horas perdidas = personas × minutos ÷ 60; con Cobranza, unos 15 segundos por pago (personas × 0,25 min).
   Sin JS se ve el ejemplo con los valores por defecto (120 y 8). Con reduced-motion, sin conteo ni barras animadas. */
(function () {
  'use strict';
  var COB = window.COB;
  if (!COB || !COB.raiz) return;
  var sec = COB.raiz.querySelector('[data-cob-calc]');
  if (!sec) return;

  function q(sel) { return sec.querySelector(sel); }
  function el(k) { return q('[data-calc="' + k + '"]'); }
  var inP = q('[data-calc-in="p"]'), inM = q('[data-calc-in="m"]');
  if (!inP || !inM) return;
  var outP = q('[data-calc-out="p"]'), outM = q('[data-calc-out="m"]');
  var eN = el('n'), eNsr = el('n-sr'), eUni = el('unidad'), ePre = el('pre'), eDias = el('dias'), eCon = el('con');
  var eBA = el('b-antes'), eBC = el('b-con'), eFA = el('f-antes'), eFC = el('f-con'), eWa = el('wa'), eVivo = el('vivo'), eEj = el('ej');
  var WA = 'https://wa.me/584244125386?text=';
  var reducir = !!COB.reducir;

  var mostrado = null;      // número que se ve ahora en la cifra grande
  var unidadMostrada = '';
  var listo = false;        // ya entró en pantalla (o no hay animación)
  var raf = 0, tVivo = 0;

  function txt(e, t) { if (e && e.textContent !== t) e.textContent = t; }
  function n0(n) { return COB.num(n, 0); }
  function personas() { var d = COB.datos && COB.datos(); return (d && d.personas) || 'clientes'; }
  function minutos(n) { return n0(n) + (n === 1 ? ' minuto' : ' minutos'); }

  function calcular() {
    var p = parseInt(inP.value, 10) || 0, m = parseInt(inM.value, 10) || 0;
    var totalMin = p * m, horas = totalMin / 60, conMin = Math.max(1, Math.round(p * 0.25));
    var r = { p: p, m: m, totalMin: totalMin, horas: horas, conMin: conMin };
    if (horas >= 1) {
      r.n = Math.round(horas);
      r.unidad = r.n === 1 ? 'hora' : 'horas';
      r.pre = r.n === 1 ? 'Pierdes cerca de' : 'Pierdes unas';
      r.frase = (r.n === 1 ? 'cerca de 1 hora' : 'unas ' + n0(r.n) + ' horas');
      r.barraAntes = n0(r.n) + ' h';
    } else {
      r.n = Math.round(totalMin);
      r.unidad = r.n === 1 ? 'minuto' : 'minutos';
      r.pre = 'Pierdes unos';
      r.frase = 'unos ' + minutos(r.n);
      r.barraAntes = n0(r.n) + ' min';
    }
    var d = (horas >= 1 ? r.n : horas) / 8; // con las horas ya redondeadas, para que cuadre con la cifra grande
    if (d < 1) r.dias = 'Eso es menos de un día de trabajo de 8 horas.';
    else {
      var dd = d < 10 ? Math.round(d * 10) / 10 : Math.round(d);
      r.dias = 'Eso es como ' + COB.num(dd, dd % 1 ? 1 : 0) + (dd === 1 ? ' día' : ' días') + ' de trabajo de 8 horas.';
    }
    r.con = 'unos ' + minutos(conMin) + (conMin >= 120 ? ' (unas ' + n0(Math.round(conMin / 60)) + ' horas)' : '') + ' al mes';
    r.barraCon = conMin < 60 ? n0(conMin) + ' min' : COB.num(Math.round(conMin / 6) / 10, 1) + ' h';
    r.ratio = totalMin > 0 ? Math.max(0.015, Math.min(1, (p * 0.25) / totalMin)) : 0.015;
    return r;
  }

  // Cifra grande: cuenta desde el valor anterior con requestAnimationFrame
  function pintarCifra(n) { txt(eN, n0(n)); }
  var tFin = 0;
  function contar(desde, hasta, ms) {
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    clearTimeout(tFin);
    if (reducir || document.hidden || !listo || desde === hasta || !window.requestAnimationFrame) {
      mostrado = hasta; pintarCifra(hasta); return;
    }
    var t0 = 0;
    function paso(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3);
      mostrado = Math.round(desde + (hasta - desde) * e);
      pintarCifra(mostrado);
      if (k < 1 && !document.hidden) raf = requestAnimationFrame(paso);
      else { raf = 0; mostrado = hasta; pintarCifra(hasta); }
    }
    raf = requestAnimationFrame(paso);
    // Por si el navegador frena requestAnimationFrame: la cifra siempre termina en el valor correcto
    tFin = setTimeout(function () { if (raf) { cancelAnimationFrame(raf); raf = 0; } mostrado = hasta; pintarCifra(hasta); }, ms + 250);
  }

  function actualizar(anunciar) {
    var r = calcular(), pl = personas();
    inP.style.setProperty('--cob-calc-pct', ((r.p - inP.min) / (inP.max - inP.min) * 100).toFixed(2) + '%');
    inM.style.setProperty('--cob-calc-pct', ((r.m - inM.min) / (inM.max - inM.min) * 100).toFixed(2) + '%');
    inP.setAttribute('aria-valuetext', n0(r.p) + ' ' + pl);
    inM.setAttribute('aria-valuetext', minutos(r.m));
    txt(outP, n0(r.p));
    txt(outM, n0(r.m) + ' min');

    txt(ePre, r.pre);
    txt(eNsr, n0(r.n));
    if (r.unidad !== unidadMostrada) { unidadMostrada = r.unidad; txt(eUni, r.unidad); contar(r.n, r.n, 0); }
    else contar(mostrado == null ? r.n : mostrado, r.n, 450);
    txt(eDias, r.dias);
    txt(eCon, r.con);
    txt(eBA, r.barraAntes);
    txt(eBC, r.barraCon);
    if (eFA) eFA.style.setProperty('--cob-calc-v', '1');
    if (eFC) eFC.style.setProperty('--cob-calc-v', r.ratio.toFixed(3));

    if (eWa) {
      eWa.href = WA + encodeURIComponent('Hola F&V, usé la calculadora de Cobranza: cobro a ' + n0(r.p) + ' ' + pl + ' y pierdo ' + r.frase + ' al mes. Quiero una demo.');
      eWa.setAttribute('data-sector', COB.sector ? COB.sector() : 'negocio');
    }
    if (anunciar && eVivo) {
      clearTimeout(tVivo);
      tVivo = setTimeout(function () {
        txt(eVivo, r.pre + ' ' + n0(r.n) + ' ' + r.unidad + ' al mes cobrando. ' + r.dias + ' Con Cobranza solo apruebas pagos: ' + r.con + '.');
      }, 700);
    }
  }

  function alMover() {
    if (eEj) eEj.hidden = true; // el texto «Ejemplo con 120…» ya no aplica
    actualizar(true);
  }
  inP.addEventListener('input', alMover);
  inM.addEventListener('input', alMover);
  inP.addEventListener('change', alMover);
  inM.addEventListener('change', alMover);

  COB.alCambiar(function () { actualizar(false); });

  // Estado inicial: con animación, la cifra arranca en 0 y las barras vacías hasta que la tarjeta entra en pantalla
  var r0 = calcular();
  unidadMostrada = r0.unidad;
  if (reducir || !('IntersectionObserver' in window)) {
    listo = true;
    actualizar(false);
  } else {
    sec.classList.add('is-espera');
    actualizar(false);
    mostrado = 0; pintarCifra(0);
    COB.alVer(q('.cob-calc-res') || sec, function () {
      listo = true;
      requestAnimationFrame(function () { sec.classList.remove('is-espera'); });
      var r = calcular();
      contar(0, r.n, 1100);
    }, 0.35);
  }
})();
