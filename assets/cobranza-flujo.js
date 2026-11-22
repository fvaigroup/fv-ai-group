/* /triangular/cobranza #flujo — partículas de pago que viajan de «Tus clientes» a «Pasarela de pago» y a «Tu cuenta y tu panel».
   Dibuja los carriles a la medida de cada tramo (horizontal desde 768 px, vertical debajo) y los recalcula al cambiar el tamaño.
   Cada partícula que llega al panel suma 1 a «Pagos recibidos hoy». Se detiene fuera de pantalla y con la pestaña oculta.
   Con reduced-motion: partículas quietas con sus etiquetas y el contador en su valor final. */
(function () {
  'use strict';
  var COB = window.COB;
  if (!COB) return;
  var sec = document.getElementById('flujo');
  if (!sec || !document.createElementNS) return;
  var escena = sec.querySelector('[data-flujo-escena]');
  var svgs = [].slice.call(sec.querySelectorAll('[data-flujo-svg]'));
  if (!escena || svgs.length < 2) return;

  var NS = 'http://www.w3.org/2000/svg';
  var prueba = document.createElementNS(NS, 'path');
  if (typeof prueba.getPointAtLength !== 'function' || typeof prueba.getTotalLength !== 'function') return;

  var cifra = sec.querySelector('[data-flujo-cifra]');
  var mas = sec.querySelector('[data-flujo-mas]');
  var ultimoEl = sec.querySelector('[data-flujo-ultimo]');
  var halos = [].slice.call(sec.querySelectorAll('[data-flujo-halo]'));
  var reducir = !!COB.reducir;
  var mq = window.matchMedia ? window.matchMedia('(min-width: 768px)') : null;

  var METODOS = ['Pago Móvil', 'Transferencia', 'Zelle', 'USDT', 'Pasarela en línea'];
  var COLORES = ['#4ade80', '#a855f7'];
  var BASE = { negocio: 36, gimnasio: 52, condominio: 18, club: 41, colegio: 29 }; // ejemplo ilustrativo
  var EXTRA_FINAL = 12;
  var DUR = [1700, 1100]; // ms por tramo
  var ESPACIO = 18; // px entre la partícula y su etiqueta

  function nodo(tag, attrs, padre) {
    var el = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) if (attrs.hasOwnProperty(k)) el.setAttribute(k, attrs[k]);
    if (padre) padre.appendChild(el);
    return el;
  }

  // Carriles: 3 en el primer tramo (los pagos llegan por varios medios), 1 ancho en el segundo
  var tramos = svgs.map(function (svg, i) {
    var defs = nodo('defs', null, svg);
    var gid = 'cob-flujo-gr-' + i;
    var gr = nodo('linearGradient', { id: gid, gradientUnits: 'userSpaceOnUse', x1: 0, y1: 0, x2: 100, y2: 0 }, defs);
    nodo('stop', { offset: '0', 'stop-color': '#4ade80' }, gr);
    nodo('stop', { offset: '1', 'stop-color': '#a855f7' }, gr);
    var gl = nodo('g', null, svg);
    var gp = nodo('g', null, svg);
    var ks = i === 0 ? [-1, 0, 1] : [0];
    var extra = i === 0 ? '' : ' cob-flujo-ancha';
    var carriles = ks.map(function (k) {
      return {
        k: k,
        via: nodo('path', { 'class': 'cob-flujo-via' + extra, stroke: 'url(#' + gid + ')' }, gl),
        corre: nodo('path', { 'class': 'cob-flujo-corre' + extra, stroke: 'url(#' + gid + ')' }, gl),
        len: 0
      };
    });
    return { svg: svg, caja: svg.parentNode, gr: gr, gp: gp, carriles: carriles };
  });
  escena.classList.add('is-vivo');

  var horiz = true, medido = false;
  function trazar() {
    var nuevoHoriz = mq ? mq.matches : true;
    var tam = tramos.map(function (t) { return { w: t.caja.clientWidth || 0, h: t.caja.clientHeight || 0 }; });
    tramos.forEach(function (t, i) {
      var w = tam[i].w, h = tam[i].h;
      t.w = w;
      if (!w || !h) return;
      t.svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      t.gr.setAttribute('x2', nuevoHoriz ? w : 0);
      t.gr.setAttribute('y2', nuevoHoriz ? 0 : h);
      var s0, s1;
      if (nuevoHoriz) { s0 = i === 0 ? Math.min(h * 0.2, 44) : 0; s1 = i === 0 ? 7 : 0; }
      else { s0 = i === 0 ? Math.min(w * 0.12, 40) : 0; s1 = i === 0 ? 7 : 0; }
      t.carriles.forEach(function (c) {
        var a = c.k * s0, b = c.k * s1, d;
        if (nuevoHoriz) {
          var cy = h / 2;
          d = 'M0 ' + (cy + a) + ' C' + (w * 0.45) + ' ' + (cy + a) + ' ' + (w * 0.55) + ' ' + (cy + b) + ' ' + w + ' ' + (cy + b);
        } else {
          var cx = w / 2;
          d = 'M' + (cx + a) + ' 0 C' + (cx + a) + ' ' + (h * 0.45) + ' ' + (cx + b) + ' ' + (h * 0.55) + ' ' + (cx + b) + ' ' + h;
        }
        c.xa = nuevoHoriz ? 0 : w / 2 + a; // x de inicio y fin del carril (vertical), para que la etiqueta no se salga
        c.xb = nuevoHoriz ? 0 : w / 2 + b;
        c.via.setAttribute('d', d);
        c.corre.setAttribute('d', d);
        c.len = c.via.getTotalLength() || 0;
      });
    });
    var cambio = nuevoHoriz !== horiz || !medido;
    horiz = nuevoHoriz;
    medido = true;
    return cambio;
  }

  // Partículas (se reutilizan)
  var pool = [], vivas = [], anchos = {};
  function crear() {
    var g = nodo('g');
    var p = {
      g: g,
      halo: nodo('circle', { r: 9, 'fill-opacity': '.22' }, g),
      anillo: nodo('circle', { r: 5, 'fill-opacity': '.5' }, g),
      nucleo: nodo('circle', { r: 2.6, fill: '#f8fafc' }, g),
      et: nodo('g', { 'class': 'cob-flujo-et' }, g)
    };
    p.rect = nodo('rect', { rx: 9, height: 20 }, p.et);
    p.txt = nodo('text', { 'dominant-baseline': 'central' }, p.et);
    return p;
  }
  function anchoDe(texto, txt) {
    if (anchos[texto]) return anchos[texto];
    var a = 0;
    try { a = txt.getComputedTextLength(); } catch (e) {}
    if (a > 0 && (!document.fonts || document.fonts.status === 'loaded')) anchos[texto] = a;
    return a || texto.length * 6.4;
  }
  function etiquetar(p, texto, lado) {
    if (!texto) { p.et.setAttribute('display', 'none'); return; }
    p.et.setAttribute('display', 'inline');
    p.et.setAttribute('opacity', '1');
    p.txt.textContent = texto;
    var tw = anchoDe(texto, p.txt), rw = tw + 18;
    // Tramo muy corto (horizontal entre 768 y 1023 px): sin etiqueta para que no tape los nodos
    if (horiz && rw + 16 > (tramos[p.tramo].w || 0)) { p.et.setAttribute('display', 'none'); return; }
    if (!horiz) {
      // Vertical (celular): la etiqueta va al lado de fuera del carril; si no cabe (360 px), al otro lado; si tampoco, sin etiqueta
      var tw0 = tramos[p.tramo].w || 0, cr = tramos[p.tramo].carriles[p.tramo === 0 ? p.carril : 0];
      var cabeIzq = Math.min(cr.xa, cr.xb) - ESPACIO + 4 - rw >= 2;
      var cabeDer = Math.max(cr.xa, cr.xb) + ESPACIO - 4 + rw <= tw0 - 2;
      if (lado < 0 && !cabeIzq) lado = 1;
      else if (lado >= 0 && !cabeDer) lado = -1;
      if ((lado < 0 && !cabeIzq) || (lado >= 0 && !cabeDer)) { p.et.setAttribute('display', 'none'); return; }
    }
    p.rect.setAttribute('width', rw.toFixed(1));
    if (horiz) {
      p.rect.setAttribute('x', -rw / 2); p.rect.setAttribute('y', -ESPACIO - 20);
      p.txt.setAttribute('x', 0); p.txt.setAttribute('y', -ESPACIO - 10); p.txt.setAttribute('text-anchor', 'middle');
    } else if (lado < 0) {
      p.rect.setAttribute('x', -ESPACIO + 4 - rw); p.rect.setAttribute('y', -10);
      p.txt.setAttribute('x', -ESPACIO + 4 - 9); p.txt.setAttribute('y', 0); p.txt.setAttribute('text-anchor', 'end');
    } else {
      p.rect.setAttribute('x', ESPACIO - 4); p.rect.setAttribute('y', -10);
      p.txt.setAttribute('x', ESPACIO - 4 + 9); p.txt.setAttribute('y', 0); p.txt.setAttribute('text-anchor', 'start');
    }
    p.ancho = rw;
  }
  function colorear(p, color) {
    p.halo.setAttribute('fill', color);
    p.anillo.setAttribute('fill', color);
  }
  function suave(t) { return t * t * (3 - 2 * t); }
  function ubicar(p) {
    var t = tramos[p.tramo], c = t.carriles[p.tramo === 0 ? p.carril : 0];
    if (!c.len) return; // tramo aún sin medir
    var pt = c.via.getPointAtLength(suave(Math.max(0, Math.min(1, p.t))) * c.len);
    p.g.setAttribute('transform', 'translate(' + pt.x.toFixed(1) + ' ' + pt.y.toFixed(1) + ')');
    if (p.conEt) {
      var o = Math.max(0, Math.min(1, p.t / 0.14, (1 - p.t) / 0.14));
      p.et.setAttribute('opacity', o.toFixed(2));
    }
  }
  function soltar(p) {
    if (p.g.parentNode) p.g.parentNode.removeChild(p.g);
    pool.push(p);
  }
  function vaciar() {
    while (vivas.length) soltar(vivas.pop());
  }

  // Contador y destellos (alternar dos clases idénticas reinicia la animación sin forzar el diseño)
  function destello(el, base) {
    if (!el || reducir) return;
    var a = el.classList.contains(base + '-a');
    el.classList.remove(base + (a ? '-a' : '-b'));
    el.classList.add(base + (a ? '-b' : '-a'));
  }
  var cuenta = 0;
  function mostrar(n) { cuenta = n; if (cifra) cifra.textContent = COB.num(n, 0); }
  function base(id) { return BASE[id] != null ? BASE[id] : BASE.negocio; }

  var nMetodo = 0, ultimoCarril = -1, toca = false;
  function lanzar() {
    var p = pool.pop() || crear();
    var c;
    do { c = Math.floor(Math.random() * 3); } while (c === ultimoCarril);
    ultimoCarril = c;
    p.carril = c; p.tramo = 0; p.t = 0;
    p.metodo = METODOS[nMetodo % METODOS.length];
    colorear(p, COLORES[nMetodo % 2]);
    nMetodo++;
    toca = !toca;
    p.conEt = toca;
    tramos[0].gp.appendChild(p.g);
    etiquetar(p, p.conEt ? p.metodo : '', tramos[0].carriles[c].k);
    vivas.push(p);
    ubicar(p);
  }
  var TOPE = 60; // tras base + 60 vuelve a la base (así la cifra sigue verosímil si la pestaña queda abierta)
  function llegar(p) {
    var b0 = base(COB.sector());
    mostrar(cuenta + 1 > b0 + TOPE ? b0 + 1 : cuenta + 1);
    destello(cifra, 'cob-flujo-pop');
    destello(mas, 'cob-flujo-sube');
    destello(halos[1], 'cob-flujo-pulso');
    if (ultimoEl) ultimoEl.textContent = p.metodo;
  }

  // Estado quieto (reduced-motion): tres partículas en el primer tramo, una en el segundo
  function quieto() {
    vaciar();
    var fijas = [
      { tramo: 0, carril: 0, t: 0.32, et: 'Pago Móvil', color: COLORES[0] },
      { tramo: 0, carril: 1, t: 0.2, et: '', color: COLORES[1] },
      { tramo: 0, carril: 2, t: 0.76, et: 'Zelle', color: COLORES[1] },
      { tramo: 1, carril: 0, t: 0.5, et: '', color: COLORES[0] }
    ];
    fijas.forEach(function (f) {
      var p = pool.pop() || crear();
      p.tramo = f.tramo; p.carril = f.carril; p.t = f.t; p.conEt = false;
      colorear(p, f.color);
      tramos[f.tramo].gp.appendChild(p.g);
      etiquetar(p, f.et, tramos[f.tramo].carriles[f.carril].k);
      vivas.push(p);
      ubicar(p);
    });
  }

  // Bucle
  var raf = 0, previo = 0, espera = 300, visible = !('IntersectionObserver' in window);
  function corriendo() { return !reducir && visible && !document.hidden; }
  function cuadro(ahora) {
    raf = 0;
    if (!corriendo()) { previo = 0; return; }
    var dt = previo ? Math.min(ahora - previo, 50) : 16;
    previo = ahora;
    espera -= dt;
    if (espera <= 0) { if (tramos[0].w && tramos[1].w) lanzar(); espera = 650 + Math.random() * 700; }
    for (var i = vivas.length - 1; i >= 0; i--) {
      var p = vivas[i];
      p.t += dt / DUR[p.tramo];
      if (p.t >= 1) {
        if (p.tramo === 0) {
          p.tramo = 1; p.t -= 1; p.conEt = false;
          p.et.setAttribute('display', 'none');
          tramos[1].gp.appendChild(p.g);
          destello(halos[0], 'cob-flujo-pulso');
        } else {
          vivas.splice(i, 1);
          soltar(p);
          llegar(p);
          continue;
        }
      }
      ubicar(p);
    }
    raf = requestAnimationFrame(cuadro);
  }
  function arrancar() {
    escena.classList.toggle('is-activo', corriendo());
    if (!raf && corriendo()) { previo = 0; raf = requestAnimationFrame(cuadro); }
    else if (raf && !corriendo()) { cancelAnimationFrame(raf); raf = 0; }
  }

  // Medidas: al iniciar y cada vez que cambia el tamaño de un tramo
  var pendiente = false;
  function remedir() {
    pendiente = false;
    var cambio = trazar();
    if (reducir) quieto();
    else if (cambio) vaciar();
    else vivas.forEach(ubicar);
  }
  function pedir() { if (!pendiente) { pendiente = true; requestAnimationFrame(remedir); } }
  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(pedir);
    tramos.forEach(function (t) { ro.observe(t.caja); });
  } else {
    window.addEventListener('resize', pedir, { passive: true });
  }
  if (mq) {
    if (mq.addEventListener) mq.addEventListener('change', pedir);
    else if (mq.addListener) mq.addListener(pedir);
  }

  mostrar(base(COB.sector()) + (reducir ? EXTRA_FINAL : 0));
  remedir();

  COB.alCambiar(function (id) {
    mostrar(base(id) + (reducir ? EXTRA_FINAL : 0));
    destello(cifra, 'cob-flujo-pop');
  });

  if (reducir) return;
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      arrancar();
    }, { rootMargin: '80px 0px' });
    io.observe(escena);
  }
  document.addEventListener('visibilitychange', arrancar);
  arrancar();
})();
