/* /triangular/paginas-web — efecto «conviene» (#conviene, [data-web-conviene-calc]): calculadora «Haz la cuenta».
   Usa window.WEB (assets/paginas-web.js) y reemplaza el respaldo entre <!-- web:conviene:inicio --> y <!-- web:conviene:fin -->.
   Las tres respuestas del dueño (li[data-web-conviene]) van fuera y no se tocan.
   Cuenta (Cálculo aproximado, sin adicionales ni pago anual; precios del encargo, en WEB.precios):
     plan mensual al mes n  = primer pago + mensualidad × (n − 1)        (WEB.mensualAl)
     Página Propia al mes n = precio único (+ mantenimiento × n)         (WEB.propiaAl)
   Con estos precios, en los tres niveles: igual en el mes 9 y más barata desde el 10 (se dice «desde el mes 9, igual o menos»); con mantenimiento, igual en el 18
   y más barata desde el 19. Gráfica SVG del costo acumulado (1–36 meses) con el mes del cruce marcado y dicho en texto.
   Controles nativos (radios, range, checkbox): teclado y lector de pantalla sin trabajo extra.
   Con reduced-motion: estado final sin animar. Sin animaciones infinitas. La fórmula se prueba en tests/paginas-web.test.js
   (en node este archivo exporta crear(WEB) en vez de montar nada). */
(function () {
  'use strict';

  var MIN = 1, MAX = 36, INICIAL = 12;

  /* ---------- cuenta (pura, sin DOM) ---------- */
  function crear(WEB) {
    function punto(nivel, n, mant) {
      var m = WEB.mensualAl(nivel, n), p = WEB.propiaAl(nivel, n, mant);
      return { mes: n, mensual: m, propia: p, ahorro: m - p };
    }
    function serie(nivel, mant, max) {
      var s = [];
      for (var n = MIN; n <= (max || MAX); n++) s.push(punto(nivel, n, mant));
      return s;
    }
    // igual: mes en que cuestan lo mismo (o null); desde: primer mes en que Página Propia sale más barata (o null)
    function cruce(nivel, mant, max) {
      var igual = null, desde = null;
      for (var n = MIN; n <= (max || 240); n++) {
        var q = punto(nivel, n, mant);
        if (q.ahorro === 0 && igual === null) igual = n;
        if (q.ahorro > 0) { desde = n; break; }
      }
      return { igual: igual, desde: desde };
    }
    return { MIN: MIN, MAX: MAX, INICIAL: INICIAL, punto: punto, serie: serie, cruce: cruce };
  }

  if (typeof module !== 'undefined' && module.exports) { module.exports = { crear: crear, MIN: MIN, MAX: MAX }; return; }

  var WEB = window.WEB;
  if (!WEB) return;
  var cont = WEB.montar('conviene');
  if (!cont) return;
  var C = crear(WEB);
  var reducir = WEB.reducir;
  var NS = 'http://www.w3.org/2000/svg';
  var FEM = { basico: 'Básica', intermedio: 'Intermedia', avanzado: 'Avanzada' };
  var uid = 'wcv' + Math.floor(Math.random() * 1e6);

  function el(tag, attrs, txt) {
    var e = document.createElement(tag);
    for (var k in attrs) if (attrs.hasOwnProperty(k)) e.setAttribute(k, attrs[k]);
    if (txt != null) e.textContent = txt;
    return e;
  }
  function sv(tag, attrs, padre) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) if (attrs.hasOwnProperty(k)) e.setAttribute(k, attrs[k]);
    if (padre) padre.appendChild(e);
    return e;
  }
  function redondo(v) { return WEB.num(Math.round(v)); }
  function mesesTxt(n) {
    var t = n + (n === 1 ? ' mes' : ' meses');
    if (n % 12 === 0) t += ' (' + (n / 12) + (n === 12 ? ' año)' : ' años)');
    return t;
  }

  /* ---------- marcado ---------- */
  var caja = el('div', { 'class': 'web-conviene-calc web-vidrio' });
  var cab = el('div', { 'class': 'web-conviene-cab' });
  cab.appendChild(el('h3', { 'class': 'web-caja-t', id: uid + '-t' }, 'Haz la cuenta'));
  cab.appendChild(el('p', { 'class': 'web-conviene-rotulo' }, 'Cálculo aproximado: sin adicionales ni pago anual.'));
  caja.appendChild(cab);
  caja.setAttribute('role', 'group');
  caja.setAttribute('aria-labelledby', uid + '-t');

  var grid = el('div', { 'class': 'web-conviene-grid' });
  var ctl = el('div', { 'class': 'web-conviene-ctl' });

  // nivel: radios nativos
  var fs = el('fieldset', { 'class': 'web-conviene-niveles' });
  fs.appendChild(el('legend', { 'class': 'web-conviene-lbl' }, 'Nivel'));
  var segs = el('div', { 'class': 'web-conviene-seg' });
  WEB.niveles.forEach(function (nv, i) {
    var lab = el('label', { 'class': 'web-conviene-op' });
    var inp = el('input', { type: 'radio', name: uid + '-nivel', value: nv });
    if (i === 0) inp.checked = true;
    lab.appendChild(inp);
    lab.appendChild(el('span', null, WEB.nombres[nv]));
    segs.appendChild(lab);
  });
  fs.appendChild(segs);
  ctl.appendChild(fs);

  // meses: slider
  var fila = el('div', { 'class': 'web-conviene-meses' });
  var lblM = el('label', { 'class': 'web-conviene-lbl', 'for': uid + '-m' }, 'Meses');
  var outM = el('span', { 'class': 'web-conviene-out', 'aria-hidden': 'true' }); // solo visual: el slider ya lleva aria-valuetext y el resumen sale en .web-conviene-sr
  var cabM = el('div', { 'class': 'web-conviene-meses-cab' });
  cabM.appendChild(lblM); cabM.appendChild(outM);
  fila.appendChild(cabM);
  var rango = el('input', { type: 'range', id: uid + '-m', min: String(MIN), max: String(MAX), step: '1', value: String(INICIAL), 'class': 'web-conviene-rango' });
  fila.appendChild(rango);
  var esc = el('div', { 'class': 'web-conviene-escala', 'aria-hidden': 'true' });
  esc.appendChild(el('span', null, '1')); esc.appendChild(el('span', null, '12')); esc.appendChild(el('span', null, '24')); esc.appendChild(el('span', null, '36'));
  fila.appendChild(esc);
  ctl.appendChild(fila);

  // mantenimiento: checkbox
  var labMant = el('label', { 'class': 'web-conviene-mant' });
  var chk = el('input', { type: 'checkbox' });
  labMant.appendChild(chk);
  labMant.appendChild(el('span', null, 'Página Propia con mantenimiento'));
  ctl.appendChild(labMant);

  // resultados del mes elegido
  var res = el('dl', { 'class': 'web-conviene-res' });
  function cifra(clase, nombre) {
    var d = el('div', { 'class': 'web-conviene-cifra ' + clase });
    var dt = el('dt', null, nombre), dd = el('dd', null, '');
    d.appendChild(dt); d.appendChild(dd); res.appendChild(d);
    return { dt: dt, dd: dd };
  }
  var cM = cifra('is-mensual', 'Plan mensual');
  var cP = cifra('is-propia', 'Página Propia');
  ctl.appendChild(res);
  var difer = el('p', { 'class': 'web-conviene-dif' });
  ctl.appendChild(difer);
  grid.appendChild(ctl);

  // gráfica
  var graf = el('div', { 'class': 'web-conviene-graf' });
  var ley = el('ul', { 'class': 'web-conviene-ley', 'aria-hidden': 'true' });
  var leyM = el('li', { 'class': 'is-mensual' }, 'Plan mensual');
  var leyP = el('li', { 'class': 'is-propia' }, 'Página Propia');
  ley.appendChild(leyM); ley.appendChild(leyP);
  graf.appendChild(ley);
  var lienzo = el('div', { 'class': 'web-conviene-lienzo' });
  graf.appendChild(lienzo);
  var cruceTxt = el('p', { 'class': 'web-conviene-cruce' });
  graf.appendChild(cruceTxt);
  graf.appendChild(el('p', { 'class': 'web-conviene-formula' }, 'Plan mensual: el primer pago más la mensualidad de cada mes siguiente. Página Propia: el precio único, más el mantenimiento de cada mes si lo eliges.'));
  grid.appendChild(graf);
  caja.appendChild(grid);

  var vivo = el('p', { 'class': 'web-conviene-sr', 'aria-live': 'polite' });
  caja.appendChild(vivo);

  var svg = sv('svg', { 'class': 'web-conviene-svg', role: 'img', 'aria-labelledby': uid + '-st' });
  var titulo = sv('title', { id: uid + '-st' }, svg);
  var defs = sv('defs', null, svg);
  var gr = sv('linearGradient', { id: uid + '-g', x1: '0', y1: '0', x2: '0', y2: '1' }, defs);
  sv('stop', { offset: '0', 'stop-color': '#a855f7', 'stop-opacity': '.32' }, gr);
  sv('stop', { offset: '1', 'stop-color': '#a855f7', 'stop-opacity': '0' }, gr);
  var gEje = sv('g', { 'class': 'web-cv-ejes' }, svg);
  var ahorro = sv('path', { 'class': 'web-cv-ahorro', fill: 'url(#' + uid + '-g)' }, svg);
  var lCruce = sv('line', { 'class': 'web-cv-cruce' }, svg);
  var tCruceBg = sv('rect', { 'class': 'web-cv-chip', rx: '8' }, svg);
  var tCruce = sv('text', { 'class': 'web-cv-chip-t' }, svg);
  var lineaM = sv('path', { 'class': 'web-cv-linea is-mensual', pathLength: '1' }, svg);
  var lineaP = sv('path', { 'class': 'web-cv-linea is-propia', pathLength: '1' }, svg);
  var lMes = sv('line', { 'class': 'web-cv-mes' }, svg);
  var pM = sv('circle', { 'class': 'web-cv-punto is-mensual', r: '5.5' }, svg);
  var pP = sv('circle', { 'class': 'web-cv-punto is-propia', r: '5.5' }, svg);
  var pX = sv('circle', { 'class': 'web-cv-x', r: '6' }, svg);
  lienzo.appendChild(svg);

  cont.innerHTML = '';
  cont.appendChild(caja);

  /* ---------- estado y dibujo ---------- */
  var st = { nivel: 'basico', n: INICIAL, mant: false };
  var vista = null;          // valores dibujados (se interpolan hacia el objetivo)
  var anim = null, cancelM = null, cancelP = null, tVivo = null, dibujada = false, visto = false;
  var raf = window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function (f) { return setTimeout(function () { f(Date.now()); }, 16); };
  var caf = window.cancelAnimationFrame ? window.cancelAnimationFrame.bind(window) : clearTimeout;

  function nivelSel() { var r = segs.querySelector('input:checked'); return r ? r.value : 'basico'; }
  function paso(v) { // escala «redonda» para el eje Y
    var p = Math.pow(10, Math.floor(Math.log(v) / Math.LN10)), f = v / p;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
  }
  function objetivo() {
    var s = C.serie(st.nivel, st.mant, MAX);
    var tope = 0;
    s.forEach(function (q) { tope = Math.max(tope, q.mensual, q.propia); });
    var step = paso(tope / 4);
    return { m: s.map(function (q) { return q.mensual; }), p: s.map(function (q) { return q.propia; }), ymax: Math.ceil(tope / step) * step, step: step };
  }

  function medidas() {
    var w = Math.max(260, Math.round(lienzo.clientWidth || 600));
    var h = Math.round(Math.min(340, Math.max(230, w * 0.56)));
    var izq = w < 420 ? 46 : 58;
    return { w: w, h: h, l: izq, r: 14, t: 16, b: 34 };
  }

  function dibujar(v) {
    var M = medidas(), ancho = M.w - M.l - M.r, alto = M.h - M.t - M.b;
    svg.setAttribute('viewBox', '0 0 ' + M.w + ' ' + M.h);
    svg.setAttribute('width', M.w); svg.setAttribute('height', M.h);
    function X(n) { return M.l + (n - MIN) / (MAX - MIN) * ancho; }
    function Y(val) { return M.t + alto - (val / v.ymax) * alto; }

    // ejes
    while (gEje.firstChild) gEje.removeChild(gEje.firstChild);
    for (var y = 0; y <= v.ymax + 0.001; y += v.step) {
      sv('line', { x1: M.l, x2: M.w - M.r, y1: Y(y).toFixed(1), y2: Y(y).toFixed(1), 'class': y === 0 ? 'web-cv-base' : 'web-cv-reja' }, gEje);
      var ty = sv('text', { x: M.l - 8, y: (Y(y) + 4).toFixed(1), 'class': 'web-cv-eje-y' }, gEje);
      ty.textContent = WEB.num(y);
    }
    [1, 6, 12, 18, 24, 30, 36].forEach(function (n) {
      if (M.w < 420 && (n === 6 || n === 18 || n === 30)) return;
      var tx = sv('text', { x: X(n).toFixed(1), y: M.h - 12, 'class': 'web-cv-eje-x' }, gEje);
      tx.textContent = n === 1 ? 'Mes 1' : String(n);
    });

    function ruta(arr) {
      var d = '';
      for (var i = 0; i < arr.length; i++) d += (i ? 'L' : 'M') + X(i + MIN).toFixed(1) + ' ' + Y(arr[i]).toFixed(1);
      return d;
    }
    lineaM.setAttribute('d', ruta(v.m));
    lineaP.setAttribute('d', ruta(v.p));

    // zona de ahorro: donde Página Propia queda por debajo del mensual
    var cr = C.cruce(st.nivel, st.mant, MAX);
    var dA = '';
    if (cr.desde) {
      var ini = (cr.igual || cr.desde) - MIN, i;
      dA = 'M' + X(ini + MIN).toFixed(1) + ' ' + Y(v.m[ini]).toFixed(1);
      for (i = ini + 1; i < v.m.length; i++) dA += 'L' + X(i + MIN).toFixed(1) + ' ' + Y(v.m[i]).toFixed(1);
      for (i = v.p.length - 1; i >= ini; i--) dA += 'L' + X(i + MIN).toFixed(1) + ' ' + Y(v.p[i]).toFixed(1);
      dA += 'Z';
    }
    ahorro.setAttribute('d', dA);

    // marca del cruce
    var mostrar = !!cr.desde && cr.desde <= MAX;
    [lCruce, tCruce, tCruceBg, pX].forEach(function (e) { e.style.display = mostrar ? '' : 'none'; });
    if (mostrar) {
      var nx = cr.igual || cr.desde, xx = X(nx);
      lCruce.setAttribute('x1', xx.toFixed(1)); lCruce.setAttribute('x2', xx.toFixed(1));
      lCruce.setAttribute('y1', M.t); lCruce.setAttribute('y2', M.t + alto);
      pX.setAttribute('cx', xx.toFixed(1)); pX.setAttribute('cy', Y(v.p[nx - MIN]).toFixed(1));
      tCruce.textContent = 'Desde el mes ' + nx + ': igual o menos'; // la línea, el punto y el rótulo marcan el mismo mes (el del empate, si lo hay)
      var tl = 0; try { tl = tCruce.getComputedTextLength(); } catch (e) {}
      var tw = (tl || tCruce.textContent.length * 7) + 18, tx0 = Math.min(Math.max(xx - tw / 2, M.l), M.w - M.r - tw);
      tCruceBg.setAttribute('x', tx0.toFixed(1)); tCruceBg.setAttribute('y', M.t); tCruceBg.setAttribute('width', tw); tCruceBg.setAttribute('height', 24);
      tCruce.setAttribute('x', (tx0 + tw / 2).toFixed(1)); tCruce.setAttribute('y', M.t + 16);
    }

    // mes elegido
    var xm = X(st.n);
    lMes.setAttribute('x1', xm.toFixed(1)); lMes.setAttribute('x2', xm.toFixed(1));
    lMes.setAttribute('y1', M.t); lMes.setAttribute('y2', M.t + alto);
    pM.setAttribute('cx', xm.toFixed(1)); pM.setAttribute('cy', Y(v.m[st.n - MIN]).toFixed(1));
    pP.setAttribute('cx', xm.toFixed(1)); pP.setAttribute('cy', Y(v.p[st.n - MIN]).toFixed(1));
  }

  function interp(a, b, t) {
    var o = { ymax: a.ymax + (b.ymax - a.ymax) * t, step: b.step, m: [], p: [] };
    for (var i = 0; i < b.m.length; i++) { o.m.push(a.m[i] + (b.m[i] - a.m[i]) * t); o.p.push(a.p[i] + (b.p[i] - a.p[i]) * t); }
    return o;
  }
  function mover(meta) {
    if (anim) { caf(anim); anim = null; }
    if (reducir || !vista || !visto) { vista = meta; dibujar(vista); return; }
    var desde = vista, t0 = null;
    function f(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / 420), e = 1 - Math.pow(1 - p, 3);
      vista = interp(desde, meta, e);
      dibujar(vista);
      if (p < 1) anim = raf(f); else { anim = null; vista = meta; }
    }
    anim = raf(f);
  }

  function textos(conAnim) {
    var q = C.punto(st.nivel, st.n, st.mant), cr = C.cruce(st.nivel, st.mant, MAX);
    var nomP = 'Página Propia ' + FEM[st.nivel] + (st.mant ? ' con mantenimiento' : '');
    outM.textContent = mesesTxt(st.n);
    rango.setAttribute('aria-valuetext', mesesTxt(st.n));
    rango.style.setProperty('--p', ((st.n - MIN) / (MAX - MIN) * 100).toFixed(2) + '%');
    cM.dt.textContent = 'Plan ' + WEB.nombres[st.nivel] + ' mensual, al mes ' + st.n;
    cP.dt.textContent = nomP + ', al mes ' + st.n;
    leyP.textContent = st.mant ? 'Página Propia con mantenimiento' : 'Página Propia';

    if (cancelM) cancelM(); if (cancelP) cancelP();
    var prevM = parseFloat(cM.dd.getAttribute('data-v')), prevP = parseFloat(cP.dd.getAttribute('data-v'));
    cM.dd.setAttribute('data-v', q.mensual); cP.dd.setAttribute('data-v', q.propia);
    if (conAnim && !reducir && !isNaN(prevM)) {
      cancelM = WEB.contar(cM.dd, q.mensual, 380, redondo, prevM);
      cancelP = WEB.contar(cP.dd, q.propia, 380, redondo, prevP);
    } else { cM.dd.textContent = WEB.num(q.mensual); cP.dd.textContent = WEB.num(q.propia); cancelM = cancelP = null; }

    var dif;
    if (q.ahorro > 0) dif = 'En el mes ' + st.n + ', Página Propia sale ' + WEB.num(q.ahorro) + ' más barata.';
    else if (q.ahorro < 0) dif = 'En el mes ' + st.n + ', el plan mensual sale ' + WEB.num(-q.ahorro) + ' más barato.';
    else dif = 'En el mes ' + st.n + ' cuestan lo mismo.';
    difer.textContent = dif;
    difer.setAttribute('data-gana', q.ahorro > 0 ? 'propia' : q.ahorro < 0 ? 'mensual' : 'igual');

    var c;
    if (cr.desde) {
      // se cuenta desde el mes del empate (como el texto del dueño, «desde el mes 9»): ese mes cuestan lo mismo y después, menos
      c = 'Con el nivel ' + WEB.nombres[st.nivel] + ', ' + nomP + ' te sale igual o más barata que el plan mensual desde el mes ' + (cr.igual || cr.desde) + '.';
      if (cr.igual) c += ' En el mes ' + cr.igual + ' cuestan lo mismo y desde el ' + cr.desde + ' sale más barata.';
    } else c = 'Con el nivel ' + WEB.nombres[st.nivel] + ', el plan mensual sale más barato en los 36 meses.';
    cruceTxt.textContent = c;
    titulo.textContent = 'Costo acumulado de 1 a 36 meses: plan ' + WEB.nombres[st.nivel] + ' mensual y ' + nomP + '. ' + c + ' ' + dif;

    clearTimeout(tVivo);
    tVivo = setTimeout(function () { vivo.textContent = WEB.nombres[st.nivel] + ', ' + mesesTxt(st.n) + ': plan mensual ' + WEB.num(q.mensual) + ', ' + nomP + ' ' + WEB.num(q.propia) + '. ' + dif; }, 600);
  }

  function actualizar(conAnim) {
    st.nivel = nivelSel();
    st.n = Math.max(MIN, Math.min(MAX, parseInt(rango.value, 10) || INICIAL));
    st.mant = chk.checked;
    textos(conAnim);
    mover(objetivo());
  }

  segs.addEventListener('change', function () { actualizar(true); });
  chk.addEventListener('change', function () { actualizar(true); });
  rango.addEventListener('input', function () {
    st.n = Math.max(MIN, Math.min(MAX, parseInt(rango.value, 10) || INICIAL));
    textos(false);
    if (!anim && vista) dibujar(vista);
  });

  // tocar o arrastrar sobre la gráfica también elige el mes (el teclado usa el slider)
  var arrastrando = false;
  function mesDesde(ev) {
    var r = svg.getBoundingClientRect(), M = medidas();
    var x = (ev.clientX - r.left) * (M.w / r.width);
    var n = Math.round(MIN + (x - M.l) / (M.w - M.l - M.r) * (MAX - MIN));
    n = Math.max(MIN, Math.min(MAX, n));
    if (String(n) !== rango.value) { rango.value = String(n); rango.dispatchEvent(new Event('input', { bubbles: true })); }
  }
  svg.addEventListener('pointerdown', function (ev) { arrastrando = true; mesDesde(ev); });
  svg.addEventListener('pointermove', function (ev) { if (arrastrando) mesDesde(ev); });
  addEventListener('pointerup', function () { arrastrando = false; });
  addEventListener('pointercancel', function () { arrastrando = false; });

  // redibujar al cambiar el ancho (rAF para no recalcular en cada píxel)
  var rzPend = false;
  function rz() { if (rzPend) return; rzPend = true; raf(function () { rzPend = false; if (vista) dibujar(vista); }); }
  if ('ResizeObserver' in window) new ResizeObserver(rz).observe(lienzo); else addEventListener('resize', rz, { passive: true });

  // estado inicial (ya es el estado final: con reduced-motion no se anima nada más)
  st.nivel = nivelSel(); st.n = INICIAL; st.mant = false;
  textos(false);
  vista = objetivo();
  dibujar(vista);
  if (reducir) { caja.classList.add('is-dibujada'); visto = true; }
  else {
    caja.classList.add('is-por-dibujar');
    WEB.alVer(lienzo, function () {
      visto = true;
      raf(function () { caja.classList.remove('is-por-dibujar'); caja.classList.add('is-dibujada'); });
    }, 0.5);
  }
})();
