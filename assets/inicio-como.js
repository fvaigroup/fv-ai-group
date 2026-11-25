/* Inicio (index.html) — efecto «como» del rediseño (24 nov 2026): #diagnostico y #como-trabajamos.
   Usa el núcleo window.INI (assets/inicio-efectos.js, cargado antes con defer). CSS en el bloque inicio:como de src/tailwind.css.
   - Diagnóstico: assets/inicio.js sigue pintando preguntas y resultado (no se toca su lógica). Aquí solo se observa [data-quiz-ui]:
     la barra de progreso avanza desde donde iba (la entrada suave de cada pregunta es CSS) y, al dar el resultado, se agrega
     la figura de la línea recomendada (hexágono cian/blanco/naranja con la luciérnaga, o triángulo verde/morado) que se dibuja sola.
   - Cómo trabajamos: riel de los 3 pasos (marcado entre <!-- ini:como:inicio --> y <!-- ini:como:fin -->) que se dibuja al bajar,
     con la luciérnaga recorriéndolo y nodos hexagonales que se encienden; horizontal desde 768 px, vertical en celular.
   Con prefers-reduced-motion: riel completo, nodos encendidos y figura ya dibujada, sin animar. Sin JS no se agrega nada
   (el riel queda oculto y los pasos y el cuestionario se leen igual). No guarda datos ni llama a servidores. */
(function () {
  'use strict';
  var INI = window.INI;
  if (!INI) return;
  var NS = 'http://www.w3.org/2000/svg';
  var mq = function (q) { return !!(window.matchMedia && window.matchMedia(q).matches); };

  /* ------------------------------------------------------------ diagnóstico */
  var ui = document.querySelector('[data-quiz-ui]');
  if (ui && window.MutationObserver) {
    var fracPrev = 0;
    function svg(tag, at) { var n = document.createElementNS(NS, tag); for (var k in at) n.setAttribute(k, at[k]); return n; }
    function figura(k) {
      var hex = k === 'hex';
      var f = document.createElement('div');
      f.className = 'ini-como-fig ini-como-fig-' + k;
      f.setAttribute('aria-hidden', 'true');
      var s = svg('svg', { viewBox: '0 0 120 108', width: '120', height: '108', focusable: 'false' });
      var id = 'ini-como-g-' + k;
      var g = svg('linearGradient', { id: id, gradientUnits: 'userSpaceOnUse', x1: '0', y1: '0', x2: '120', y2: '108' });
      (hex ? [['0', '#00FFFF'], ['.5', '#FFFFFF'], ['1', '#FF8C00']] : [['0', '#4ade80'], ['.5', '#c4b5fd'], ['1', '#a855f7']]).forEach(function (p) {
        g.appendChild(svg('stop', { offset: p[0], 'stop-color': p[1] }));
      });
      var defs = svg('defs', {}); defs.appendChild(g); s.appendChild(defs);
      var d = hex ? 'M32 6H88L114 54L88 102H32L6 54Z' : 'M60 8L112 100H8Z';
      s.appendChild(svg('path', { 'class': 'ini-como-fig-fondo', d: d }));
      s.appendChild(svg('path', { 'class': 'ini-como-fig-trazo', d: d, pathLength: '1', stroke: 'url(#' + id + ')' }));
      if (!hex) s.appendChild(svg('circle', { 'class': 'ini-como-fig-punto', cx: '60', cy: '69', r: '7' }));
      f.appendChild(s);
      if (hex) {
        var img = document.createElement('img');
        img.src = '/assets/logo-mark-hex.webp'; img.alt = ''; img.width = 500; img.height = 500; img.decoding = 'async';
        img.className = 'ini-como-fig-luci';
        f.appendChild(img);
      }
      return f;
    }
    function revisar() {
      var barra = ui.querySelector('.ini-prog');
      if (barra && !barra.hasAttribute('data-como')) {
        barra.setAttribute('data-como', '');
        var relleno = barra.querySelector('i');
        var meta = (Number(barra.getAttribute('aria-valuenow')) || 0) / (Number(barra.getAttribute('aria-valuemax')) || 1);
        if (relleno && !INI.reducido() && meta !== fracPrev) {
          var fin = relleno.style.width;
          relleno.style.width = Math.round(fracPrev * 100) + '%';
          void relleno.offsetWidth;
          INI.raf(function () { relleno.style.width = fin; });
        }
        fracPrev = meta;
      }
      var res = ui.querySelector('.ini-resultado');
      if (res && !res.querySelector('.ini-como-fig')) {
        fracPrev = 1;
        res.classList.add('ini-como-res');
        res.insertBefore(figura(/\blinea-tri\b/.test(res.className) ? 'tri' : 'hex'), res.firstChild);
      }
    }
    new MutationObserver(revisar).observe(ui, { childList: true });
    revisar();
  }

  /* ------------------------------------------------------------ cómo trabajamos: riel de los 3 pasos */
  var sec = document.getElementById('como-trabajamos');
  var montaje = INI.montar('como');
  var via = montaje && montaje.querySelector('.ini-como-via');
  var ol = sec && sec.querySelector('.ini-pasos-lista');
  if (!sec || !via || !ol) return;
  var pasos = [].slice.call(ol.children);
  var nodos = [].slice.call(via.querySelectorAll('.ini-como-nodo'));
  var riel = via.querySelector('.ini-como-riel'), luz = via.querySelector('.ini-como-luz'), luci = via.querySelector('.ini-como-luci');
  if (pasos.length !== 3 || nodos.length !== 3 || !riel || !luz || !luci) return;
  sec.classList.add('ini-como-on');

  var geo = null, pendiente = false, activo = false;
  function medir() {
    var vR = via.getBoundingClientRect();
    if (!vR.width) { geo = null; return; }
    var vertical = !mq('(min-width: 768px)');
    var pos = pasos.map(function (li) {
      var r = li.getBoundingClientRect();
      return vertical ? r.top - vR.top + 48 : r.left - vR.left + r.width / 2; /* vertical: a la altura del ícono (1,5rem de relleno + 24 px) */
    });
    var r0 = pasos[0].getBoundingClientRect();
    var eje = vertical ? r0.left - vR.left - 28 : r0.top - vR.top - 34; /* el riel va en el relleno que abre el CSS (3,5rem a la izquierda o 4,25rem arriba) */
    geo = { vertical: vertical, pos: pos, eje: eje, ini: pos[0], largo: Math.max(1, pos[2] - pos[0]) };
    via.classList.toggle('is-vertical', vertical);
    riel.style.cssText = luz.style.cssText = vertical
      ? 'left:' + eje + 'px;top:' + geo.ini + 'px;height:' + geo.largo + 'px'
      : 'top:' + eje + 'px;left:' + geo.ini + 'px;width:' + geo.largo + 'px';
    nodos.forEach(function (n, i) {
      n.style.transform = vertical ? 'translate(' + eje + 'px,' + pos[i] + 'px)' : 'translate(' + pos[i] + 'px,' + eje + 'px)';
    });
  }
  var ultimo = -1;
  function pintar(p) {
    if (!geo) return;
    p = Math.max(0, Math.min(1, p));
    if (Math.abs(p - ultimo) < 0.001) return;
    ultimo = p;
    luz.style.transform = (geo.vertical ? 'scaleY(' : 'scaleX(') + p.toFixed(4) + ')';
    var d = geo.ini + p * geo.largo;
    luci.style.transform = geo.vertical ? 'translate(' + geo.eje + 'px,' + d + 'px)' : 'translate(' + d + 'px,' + geo.eje + 'px)';
    nodos.forEach(function (n, i) {
      var on = p >= (geo.pos[i] - geo.ini) / geo.largo - 0.002;
      n.classList.toggle('is-on', on);
      pasos[i].classList.toggle('ini-como-activo', on);
    });
  }
  function progreso() {
    pendiente = false;
    if (!geo) return;
    var top = via.getBoundingClientRect().top, vh = window.innerHeight || 800;
    pintar(geo.vertical ? (vh * 0.62 - (top + geo.ini)) / geo.largo : (vh * 0.85 - top) / (vh * 0.5));
  }
  function pedir() { if (!pendiente && activo) { pendiente = true; INI.raf(progreso); } }
  function rehacer() { medir(); ultimo = -1; if (INI.reducido()) pintar(1); else progreso(); }

  rehacer();
  if (window.ResizeObserver) new ResizeObserver(function () { INI.raf(rehacer); }).observe(ol);
  else window.addEventListener('resize', function () { INI.raf(rehacer); });
  if (INI.reducido()) return;
  window.addEventListener('scroll', pedir, { passive: true });
  INI.enPantalla(sec, function (visto) {
    activo = visto;
    via.classList.toggle('is-pausa', !visto);
    if (visto) { pendiente = false; pedir(); }
  });
})();
