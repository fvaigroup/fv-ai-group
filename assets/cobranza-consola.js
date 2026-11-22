/* /triangular/cobranza · #pasarelas: consola «cobranza — conciliación» que se teclea al entrar en pantalla
   (una corrida por sector, montos en Bs con la tasa BCV en vivo) y chip «Tasa BCV de hoy».
   Se pausa fuera de pantalla y con la pestaña oculta. Con reduced-motion muestra el texto final. Datos ficticios. */
(function () {
  'use strict';
  var COB = window.COB;
  if (!COB) return;

  var caja = document.querySelector('[data-cob-consola]');
  var cuerpo = caja ? caja.querySelector('[data-cob-consola-cuerpo]') : null;
  var chip = document.querySelector('[data-cob-consola-chip]');
  var tasa = null; // { rate, fecha, live }

  // Quién pagó y cuánto (USD) en cada sector: Pago Móvil, Zelle, pasarela en línea, USDT. n = pagos conciliados.
  var P = {
    negocio: { q: ['Cliente 14', 'Cliente 27', 'Cliente 31', 'Cliente 45'], m: [25, 50, 35, 30], n: 128 },
    gimnasio: { q: ['Miembro 14', 'Miembro 27', 'Miembro 31', 'Miembro 45'], m: [35, 50, 35, 35], n: 214 },
    condominio: { q: ['Apto 4-B', 'Apto 7-A', 'Apto 2-C', 'Apto 10-D'], m: [60, 120, 85, 60], n: 36 },
    club: { q: ['Socio 112', 'Socio 87', 'Socio 203', 'Socio 45'], m: [45, 90, 45, 45], n: 152 },
    colegio: { q: ['Representante · 5.º grado', 'Representante · 2.º año', 'Representante · 3.er grado', 'Representante · 1.er año'], m: [80, 160, 80, 80], n: 87 }
  };

  function usd(n) { return COB.num(n, 2) + ' $'; }
  function textoBs(n) { return tasa && tasa.rate ? COB.bs(n * tasa.rate) : usd(n) + ' en Bs'; }
  function etqTasa() { return tasa && tasa.rate ? 'Tasa BCV aplicada: ' : 'Tasa aplicada: '; }
  function textoTasa() { return tasa && tasa.rate ? COB.bs(tasa.rate) : 'tasa BCV del día'; }
  function fecha(iso) {
    var d = new Date(iso);
    if (!iso || isNaN(d)) return '';
    var o = { day: '2-digit', month: '2-digit', year: 'numeric' };
    try { o.timeZone = 'America/Caracas'; return d.toLocaleDateString('es-VE', o); }
    catch (e) { try { delete o.timeZone; return d.toLocaleDateString('es-VE', o); } catch (e2) { return ''; } }
  }

  /* ---------------- chip «Tasa BCV de hoy» (oculto mientras no haya tasa) ---------------- */
  var chipT = chip ? chip.querySelector('[data-cob-consola-chip-t]') : null;
  function pintarChip() {
    if (!chip || !chipT || !tasa || !tasa.rate) return;
    var f = fecha(tasa.fecha);
    chipT.textContent = '';
    chipT.appendChild(document.createTextNode(tasa.live ? 'Tasa BCV de hoy: ' : 'Última tasa BCV: '));
    var b = document.createElement('strong');
    b.textContent = COB.bs(tasa.rate);
    chipT.appendChild(b);
    if (f) chipT.appendChild(document.createTextNode(' · ' + f));
    if (tasa.live) chip.classList.add('cob-consola-vivo'); else chip.classList.remove('cob-consola-vivo');
    chip.hidden = false;
  }

  COB.tasa(function (t) {
    if (!t || !(t.rate > 0)) return;
    tasa = t;
    pintarChip();
    refrescarTasa();
  });

  if (!caja || !cuerpo) return;

  /* ---------------- consola ---------------- */
  // Cada línea: lista de [clase, texto, ref, usd]. ref = 'tasa' | 'etq' | 'bs' (se actualizan cuando llega la tasa).
  function lineas(id) {
    var p = P[id] || P.negocio, q = p.q, m = p.m;
    function pago(metodo, valor, quien, ref, n) {
      return { partes: [['ok', '✔︎ '], ['tx', metodo + ' · '], ['va', valor, ref, n], ['mu', ' → '], ['pe', quien]] };
    }
    return [
      { cmd: true, partes: [['pr', '> '], ['tx', 'cobranza conciliar '], ['fl', '--hoy']] },
      { partes: [['mu', etqTasa(), 'etq'], ['va', textoTasa(), 'tasa']] },
      pago('Pago Móvil', textoBs(m[0]), q[0], 'bs', m[0]),
      pago('Zelle', usd(m[1]), q[1]),
      pago('Pasarela en línea', usd(m[2]), q[2]),
      pago('USDT', COB.num(m[3], 2), q[3]),
      { res: true, partes: [['mu', '… '], ['tx', p.n + ' pagos conciliados · '], ['ok', '0 diferencias']] },
      { fin: true, partes: [['pr', '> ']] }
    ];
  }

  var cursor = document.createElement('span');
  cursor.className = 'cob-consola-cur';
  var filas = [];

  function construir(id, oculto) {
    filas = [];
    var frag = document.createDocumentFragment();
    lineas(id).forEach(function (l) {
      var el = document.createElement('p');
      el.className = 'cob-consola-l' + (l.cmd ? ' cob-consola-cmd' : '') + (l.res ? ' cob-consola-res' : '') + (l.fin ? ' cob-consola-fin' : '');
      var tipo = [], total = 0;
      l.partes.forEach(function (x) {
        var s = document.createElement('span');
        s.className = 'cob-consola-' + x[0];
        s.textContent = x[1];
        if (x[2]) s.setAttribute('data-r', x[2]);
        if (x[3] != null) s.setAttribute('data-n', x[3]);
        el.appendChild(s);
        if (l.cmd && x[0] !== 'pr') { tipo.push({ s: s, t: x[1] }); total += x[1].length; }
      });
      if (oculto) {
        el.classList.add('cob-consola-pend');
        tipo.forEach(function (x) { x.s.textContent = ''; });
      }
      frag.appendChild(el);
      filas.push({ el: el, cmd: !!l.cmd, tipo: tipo, total: total });
    });
    cuerpo.textContent = '';
    cuerpo.appendChild(frag);
    if (!oculto && filas.length) filas[filas.length - 1].el.appendChild(cursor);
  }

  function refrescarTasa() {
    if (!cuerpo) return;
    [].forEach.call(cuerpo.querySelectorAll('[data-r]'), function (s) {
      var r = s.getAttribute('data-r');
      var t = r === 'tasa' ? textoTasa() : r === 'etq' ? etqTasa() : textoBs(parseFloat(s.getAttribute('data-n')) || 0);
      if (s.textContent !== t) s.textContent = t;
    });
  }

  // Reproductor: un solo bucle con requestAnimationFrame que avanza por pasos con espera (ms).
  var conIO = 'IntersectionObserver' in window;
  var visible = false, pendiente = true, corriendo = false;
  var i = 0, k = 0, espera = 0, acum = 0, raf = 0, ultimo = 0;

  function activo() { return visible && !document.hidden; }

  function parar() {
    corriendo = false;
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
  }

  function final() {
    parar();
    pendiente = false;
    construir(COB.sector(), false);
  }

  function paso() {
    var f = filas[i];
    if (!f) { corriendo = false; return; }
    if (f.el.classList.contains('cob-consola-pend')) {
      f.el.classList.remove('cob-consola-pend');
      f.el.appendChild(cursor);
      if (f.cmd && f.total) { k = 0; espera = 140; return; }
      i++;
      espera = i >= filas.length ? 0 : (i === 2 ? 320 : 190 + Math.random() * 120);
      if (i >= filas.length) corriendo = false;
      return;
    }
    // Tecleando la orden
    k++;
    var resto = k;
    f.tipo.forEach(function (x) {
      var c = Math.min(resto, x.t.length);
      var t = x.t.slice(0, c);
      if (x.s.textContent !== t) x.s.textContent = t;
      resto -= c;
    });
    if (k < f.total) espera = 26 + Math.random() * 38;
    else { i++; espera = 420; }
  }

  function cuadro(t) {
    raf = 0;
    if (!corriendo) return;
    if (!activo()) { ultimo = 0; return; } // se retoma con reanudar()
    var dt = ultimo ? Math.min(t - ultimo, 100) : 16;
    ultimo = t;
    acum += dt;
    var tope = 0;
    while (corriendo && acum >= espera && tope++ < 12) { acum -= espera; paso(); }
    if (corriendo) raf = requestAnimationFrame(cuadro);
  }

  function reanudar() {
    if (corriendo && !raf && activo()) { ultimo = 0; raf = requestAnimationFrame(cuadro); }
  }

  function iniciar() {
    parar();
    pendiente = false;
    construir(COB.sector(), true);
    i = 0; k = 0; acum = 0; espera = 300;
    corriendo = true;
    reanudar();
  }

  function quieta() {
    if (activo()) caja.classList.remove('cob-consola-quieta'); else caja.classList.add('cob-consola-quieta');
  }

  if (COB.reducir || !conIO || !window.requestAnimationFrame) {
    final();
    COB.alCambiar(function () { final(); });
    return;
  }

  construir(COB.sector(), true);

  var io = new IntersectionObserver(function (es) {
    var e = es[es.length - 1];
    visible = e.isIntersecting && e.intersectionRatio > 0;
    quieta();
    if (visible && pendiente && e.intersectionRatio >= 0.3) iniciar();
    else reanudar();
  }, { threshold: [0, 0.3] });
  io.observe(caja);

  document.addEventListener('visibilitychange', function () { quieta(); reanudar(); });

  COB.alCambiar(function () {
    if (visible) iniciar();
    else { parar(); pendiente = true; construir(COB.sector(), true); }
  });
})();
