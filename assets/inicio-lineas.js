/* Inicio (index.html) — efecto «lineas» del rediseño (24 nov 2026): las dos figuras de #lineas cobran vida.
   - Cada tarjeta recibe su malla propia (Hexagonal cian/blanco/naranja, Triangular verde/morado) con paralaje suave.
   - Al entrar en pantalla los lados se encienden uno por uno (trazo que se dibuja) y los números aparecen al paso.
   - En el hexágono la luciérnaga de la marca recorre el perímetro una vez, mirando hacia donde vuela, enciende cada lado
     a su paso y termina en el centro del hexágono (como en el logo), levitando. Al elegir un lado se inclina hacia él.
   - La tarjeta de detalle (la llena assets/inicio.js) entra con una transición y un barrido de luz cada vez que cambia.
   No toca la lógica de assets/inicio.js (elegir lado, tarjeta, WhatsApp, analítica): solo observa el DOM.
   Sin JS no hace nada (la lista de respaldo trae todo). Con prefers-reduced-motion: sin trazo, sin vuelo; la luciérnaga queda quieta en el centro.
   No guarda datos ni llama a servidores. CSS en el bloque inicio:lineas de src/tailwind.css. */
(function () {
  'use strict';
  var I = window.INI;
  var sec = document.getElementById('lineas');
  if (!I || !sec) return;
  var NS = 'http://www.w3.org/2000/svg';
  var reducido = I.reducido();
  var figs = [].slice.call(sec.querySelectorAll('.ini-fig'));
  if (!figs.length) return;

  function el(tag, attrs, padre) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (padre) padre.appendChild(n);
    return n;
  }
  function suave(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function salida(t) { return 1 - Math.pow(1 - t, 3); }

  /* ---------- malla propia de cada tarjeta (decorativa) ---------- */
  function malla(art) {
    var m = document.createElement('span');
    m.className = 'ini-lin-malla';
    m.setAttribute('aria-hidden', 'true');
    var vel = [0.05, -0.04, 0.08];
    for (var i = 1; i <= 3; i++) {
      var capa = document.createElement('span'); capa.className = 'ini-lin-capa';
      var mancha = document.createElement('span'); mancha.className = 'ini-lin-m ini-lin-m' + i;
      capa.appendChild(mancha); m.appendChild(capa);
      I.paralaje(capa, vel[i - 1]); // la capa es un envoltorio sin transform propio; la mancha flota con «translate»
    }
    art.insertBefore(m, art.firstChild);
    // animaciones de la tarjeta en pausa fuera de pantalla
    I.enPantalla(art, function (ve) { art.classList.toggle('ini-lin-pausa', !ve); });
  }

  /* ---------- trazo de los lados, uno por uno ---------- */
  function preparar(art, paso) {
    var lados = [].slice.call(art.querySelectorAll('.ini-lado-svg'));
    lados.forEach(function (g, i) {
      var vis = g.querySelector('.vis');
      if (vis) vis.setAttribute('pathLength', '1');
      g.style.setProperty('--i', i);
    });
    art.style.setProperty('--paso', paso + 's');
    if (!reducido) art.classList.add('ini-lin-espera');
    return lados;
  }
  function encender(art) {
    art.classList.remove('ini-lin-espera');
    art.classList.add('ini-lin-on');
  }

  /* ---------- la luciérnaga del hexágono ---------- */
  var VERT = [[275, 50], [350, 180], [275, 310], [125, 310], [50, 180], [125, 50]]; // vértices en el orden de los lados 0..5
  var CENTRO = [200, 180];
  var TAM = 92; // ancho de la luciérnaga en unidades del viewBox
  function luciernaga(art, svg, paso) {
    var defs = svg.querySelector('defs') || el('defs', {}, svg);
    var halo = el('radialGradient', { id: 'ini-lin-halo' }, defs);
    el('stop', { offset: '0', 'stop-color': '#FF8C00', 'stop-opacity': '.55' }, halo);
    el('stop', { offset: '.45', 'stop-color': '#FFFFFF', 'stop-opacity': '.12' }, halo);
    el('stop', { offset: '1', 'stop-color': '#00FFFF', 'stop-opacity': '0' }, halo);

    var g = el('g', { 'class': 'ini-lin-luci', 'aria-hidden': 'true', focusable: 'false' }, svg);
    var mov = el('g', { 'class': 'ini-lin-luci-mov' }, g);
    el('circle', { 'class': 'ini-lin-luci-halo', r: '58', cx: '0', cy: '0', fill: 'url(#ini-lin-halo)' }, mov);
    var img = el('image', { 'class': 'ini-lin-luci-img', width: String(TAM), height: String(TAM), x: String(-TAM / 2), y: String(-TAM * .54), preserveAspectRatio: 'xMidYMid meet' }, mov);
    img.setAttribute('href', '/assets/logo-mark-hex.webp');

    var st = { x: CENTRO[0], y: CENTRO[1], s: 1, r: 0 };
    function poner() { g.setAttribute('transform', 'translate(' + st.x.toFixed(1) + ' ' + st.y.toFixed(1) + ') rotate(' + st.r.toFixed(1) + ') scale(' + st.s.toFixed(3) + ')'); }
    function rumbo(dx, dy) { return Math.atan2(dy, dx) * 180 / Math.PI + 90; } // la cabeza del dibujo mira hacia arriba
    function giro(de, a) { var d = ((a - de) % 360 + 540) % 360 - 180; return de + d; } // el giro más corto

    var tween = 0;
    function irA(dest, ms, curva, fin) {
      var id = ++tween, t0 = null, o = { x: st.x, y: st.y, s: st.s, r: st.r };
      var rf = dest.r == null ? o.r : giro(o.r, dest.r);
      function cuadro(t) {
        if (id !== tween) return;
        if (t0 === null) t0 = t;
        var p = Math.min(1, (t - t0) / ms), e = (curva || suave)(p);
        st.x = o.x + (dest.x - o.x) * e; st.y = o.y + (dest.y - o.y) * e;
        st.s = o.s + ((dest.s == null ? o.s : dest.s) - o.s) * e; st.r = o.r + (rf - o.r) * e;
        poner();
        if (p < 1) I.raf(cuadro); else if (fin) fin();
      }
      I.raf(cuadro);
    }

    var lista = false;
    function reposo() { lista = true; g.classList.add('ini-lin-luci-reposo'); g.classList.remove('ini-lin-luci-vuela'); inclinar(); }

    if (reducido) { poner(); g.classList.add('ini-lin-luci-quieta'); lista = true; }
    else {
      st.x = VERT[0][0]; st.y = VERT[0][1]; st.s = .42; st.r = rumbo(VERT[1][0] - VERT[0][0], VERT[1][1] - VERT[0][1]);
      poner();
    }

    // vuelo: un lado por «paso»; el mismo cuadro dibuja el lado que va recorriendo (la luz va en la punta del trazo), luego al centro
    var lados = [].slice.call(svg.querySelectorAll('.ini-lado-svg'));
    var vis = lados.map(function (l) { return l.querySelector('.vis'); });
    var estado = lados.map(function () { return 0; }); // 0 apagado · 1 trazando · 2 encendido
    function trazar(f) {
      lados.forEach(function (l, j) {
        var pr = Math.max(0, Math.min(1, f - j));
        if (pr > 0 && estado[j] === 0) { estado[j] = 1; l.classList.add('ini-lin-ya', 'ini-lin-traza'); }
        if (estado[j] === 1) {
          if (vis[j]) vis[j].style.strokeDashoffset = String(1 - pr);
          if (pr >= 1) { estado[j] = 2; l.classList.remove('ini-lin-traza'); l.classList.add('ini-lin-asienta'); if (vis[j]) vis[j].style.strokeDashoffset = ''; }
        }
      });
    }
    function volar() {
      art.classList.remove('ini-lin-espera');
      art.classList.add('ini-lin-js');
      g.classList.add('ini-lin-luci-vuela');
      var id = ++tween, t0 = null, n = VERT.length, total = paso * 1000 * n;
      function cuadro(t) {
        if (id !== tween) return;
        if (t0 === null) t0 = t;
        var p = Math.min(1, (t - t0) / total), f = p * n, i = Math.min(n - 1, Math.floor(f)), u = f - i;
        var a = VERT[i], b = VERT[(i + 1) % n];
        st.x = a[0] + (b[0] - a[0]) * u; st.y = a[1] + (b[1] - a[1]) * u;
        // en cada vértice el giro se adelanta un poco para doblar la esquina con suavidad
        var r1 = rumbo(b[0] - a[0], b[1] - a[1]);
        var c = VERT[(i + 2) % n], r2 = giro(r1, rumbo(c[0] - b[0], c[1] - b[1]));
        st.r = u > .82 && p < 1 ? r1 + (r2 - r1) * ((u - .82) / .18) : r1;
        st.s = .42 + .08 * Math.abs(Math.sin(f * Math.PI)); // late al pasar por cada lado
        poner();
        trazar(f);
        if (p < 1) { I.raf(cuadro); return; }
        trazar(n + 1);
        irA({ x: CENTRO[0], y: CENTRO[1], s: 1, r: 0 }, 1100, salida, reposo);
      }
      I.raf(cuadro);
    }

    // al elegir un lado (lo hace assets/inicio.js), se inclina hacia él
    var activo = -1;
    function inclinar() {
      if (!lista) return;
      var g2 = svg.querySelector('.ini-lado-svg.is-activo');
      var i = g2 ? parseInt(g2.getAttribute('data-lado'), 10) : -1;
      if (i === activo && i !== -1) return;
      activo = i;
      if (reducido) return;
      if (i < 0) { irA({ x: CENTRO[0], y: CENTRO[1], s: 1, r: 0 }, 500); return; }
      var a = VERT[i], b = VERT[(i + 1) % VERT.length], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      var dx = mx - CENTRO[0], dy = my - CENTRO[1];
      irA({ x: CENTRO[0] + dx * .2, y: CENTRO[1] + dy * .2, s: 1, r: Math.max(-18, Math.min(18, dx * .18)) }, 650);
    }
    return { volar: volar, inclinar: inclinar };
  }

  /* ---------- tarjeta de detalle: barrido de luz cada vez que cambia ---------- */
  function tarjeta(art, alCambiar) {
    var t = art.querySelector('[data-tarjeta]');
    if (!t || !('MutationObserver' in window)) return;
    new MutationObserver(function () {
      if (!reducido) {
        t.classList.remove('ini-lin-brillo');
        void t.offsetWidth; // reinicia la animación del barrido
        t.classList.add('ini-lin-brillo');
      }
      if (alCambiar) alCambiar();
    }).observe(t, { childList: true });
  }

  figs.forEach(function (art) {
    var esHex = art.getAttribute('data-linea') === 'hex';
    var svg = art.querySelector('.ini-svg');
    if (!svg) return;
    var paso = esHex ? .5 : .55;
    art.classList.add('ini-lin-fx');
    malla(art);
    preparar(art, paso);
    var luci = esHex ? luciernaga(art, svg, paso) : null;
    tarjeta(art, luci && luci.inclinar);
    if (reducido) return;
    var empezo = false;
    function empezar(ya) {
      if (empezo) return;
      empezo = true;
      if (esHex) luci.volar(); // el hexágono lo dibuja el vuelo de la luciérnaga
      else if (ya) encender(art);
      else setTimeout(function () { encender(art); }, 250); // la Triangular entra un instante después: el hexágono va primero
    }
    I.alVer(svg, function () { empezar(false); }, .45);
    // con el teclado el navegador hace el scroll mínimo y la figura puede no llegar al 45 %: al recibir el foco, la entrada empieza ya
    svg.addEventListener('focusin', function () { empezar(true); });
  });
})();
