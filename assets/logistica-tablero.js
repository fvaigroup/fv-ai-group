/* /triangular/delta/logistica · #tablero: tablero de viajes de ejemplo (kanban Programado → En ruta → Entregado → Cobrado).
   Las tarjetas avanzan solas de columna con FLIP (Web Animations) solo mientras la sección está en pantalla y la pestaña
   visible; el camión de cada tarjeta es el de la flota elegida en #flota (LOG.alCambiar). Los montos son de ejemplo y
   solo los escribe este archivo. Sin JS queda la lista de columnas del HTML; con reduced-motion, tablero fijo sin animar.
   En teléfonos las columnas se desplazan dentro de .log-tablero-scroll; el script lo mueve solo hasta la columna que
   cambia, salvo que la persona lo haya tocado hace poco. CSS: bloque logistica:tablero de src/tailwind.css. */
(function () {
  'use strict';

  function iniciar() {
    var LOG = window.LOG;
    if (!LOG) return;
    var sec = document.getElementById('tablero');
    var resp = sec && sec.querySelector('[data-log-tablero]');
    var env = sec && sec.querySelector('[data-log-tablero-maqueta]');
    if (!resp || !env || env.getAttribute('data-listo')) return;
    env.setAttribute('data-listo', '1');

    var reducir = !!LOG.reducir;
    var hayIO = 'IntersectionObserver' in window;
    var EASE = 'cubic-bezier(.23,1,.32,1)';

    // Multiplicador de la tarifa de ejemplo según el tamaño del camión (base = NPR / Canter)
    var MULT = { mini: 0.45, '350': 0.7, npr: 1, '750': 1.35, torpedo: 1.9, gandola: 2.8 };
    // Viajes de ejemplo: ciudades reales, placas y choferes ficticios, tarifa base inventada (solo ilustra)
    var VIAJES = [
      { o: 'Valencia', d: 'Maracaibo', b: 640, pl: 'A27BK4C', ch: 'José R.', sale: '5:30', salio: '5:42', entrego: '14:10' },
      { o: 'Caracas', d: 'Barquisimeto', b: 480, pl: 'A61CF2M', ch: 'Luis M.', sale: '6:00', salio: '6:08', entrego: '11:35' },
      { o: 'Puerto Cabello', d: 'Caracas', b: 420, pl: 'A13DH8P', ch: 'Carlos P.', sale: '7:00', salio: '7:15', entrego: '10:50' },
      { o: 'Maracay', d: 'Puerto La Cruz', b: 520, pl: 'A88EJ1R', ch: 'María G.', sale: '5:00', salio: '5:04', entrego: '11:20' },
      { o: 'Barquisimeto', d: 'Mérida', b: 460, pl: 'A42FL6S', ch: 'Pedro A.', sale: '6:30', salio: '6:41', entrego: '12:05' },
      { o: 'Valencia', d: 'San Cristóbal', b: 780, pl: 'A05GM3T', ch: 'Ana T.', sale: '4:30', salio: '4:37', entrego: '13:45' },
      { o: 'Caracas', d: 'Puerto Ordaz', b: 820, pl: 'A70HN9V', ch: 'Jesús L.', sale: '4:00', salio: '4:12', entrego: '13:30' },
      { o: 'Puerto Cabello', d: 'Valencia', b: 220, pl: 'A34JP5W', ch: 'Rafael V.', sale: '8:00', salio: '8:06', entrego: '9:10' },
      { o: 'Maracay', d: 'Barinas', b: 500, pl: 'A59KR2X', ch: 'Daniel C.', sale: '5:45', salio: '5:52', entrego: '11:40' },
      { o: 'Barcelona', d: 'Maturín', b: 340, pl: 'A21LS7Y', ch: 'Carmen O.', sale: '7:30', salio: '7:38', entrego: '10:15' },
      { o: 'Valencia', d: 'Coro', b: 450, pl: 'A96MT4Z', ch: 'Oscar B.', sale: '6:15', salio: '6:20', entrego: '10:55' },
      { o: 'Caracas', d: 'Valencia', b: 300, pl: 'A48NV1B', ch: 'Luisa F.', sale: '9:00', salio: '9:09', entrego: '11:00' }
    ];
    var ETAPAS = ['prog', 'ruta', 'entr', 'cobr'];
    var MAX_VISIBLES = 3;

    // Títulos y descripciones: los de la lista del HTML (una sola fuente)
    var lis = resp.querySelectorAll('li');
    var TIT = ['Programado', 'En ruta', 'Entregado', 'Cobrado'], DES = ['', '', '', ''];
    for (var i = 0; i < 4 && i < lis.length; i++) {
      var ps = lis[i].querySelectorAll('p');
      if (ps[0]) TIT[i] = ps[0].textContent.trim();
      if (ps[1]) DES[i] = ps[1].textContent.trim();
    }

    function el(tag, cls, txt) {
      var n = document.createElement(tag);
      if (cls) n.className = cls;
      if (txt != null) n.textContent = txt;
      return n;
    }
    function tarifa(v) { return Math.round(v.b * (MULT[LOG.flota()] || 1) / 10) * 10; }
    function estado(v, etapa) {
      if (etapa === 'prog') return 'Sale ' + v.sale;
      if (etapa === 'ruta') return 'Salió ' + v.salio;
      if (etapa === 'entr') return 'Entregó ' + v.entrego;
      return 'Cobrado';
    }

    // ---------- armar la maqueta ----------
    var datos = LOG.datosFlota();
    var cab = el('div', 'log-tablero-cab');
    var quien = el('div', 'log-tablero-quien');
    var ico = el('span', 'log-tablero-ico');
    ico.appendChild(LOG.silueta(datos.clave));
    var txt = el('div');
    var sub = el('span', 'log-tablero-sub', 'Viajes del día · ' + datos.nombre);
    txt.appendChild(el('span', 'log-tablero-tit', 'Tablero de viajes'));
    txt.appendChild(sub);
    quien.appendChild(ico); quien.appendChild(txt);
    cab.appendChild(quien);
    cab.appendChild(el('span', 'log-tablero-vivo', 'Hoy'));

    var scroll = el('div', 'log-tablero-scroll');
    var cols = el('ol', 'log-tablero-cols');
    var col = [], lista = [], cuenta = [], mas = null;
    ETAPAS.forEach(function (k, j) {
      var c = el('li', 'log-tablero-col');
      c.setAttribute('data-etapa', k);
      var h = el('div', 'log-tablero-col-cab');
      h.appendChild(el('span', 'log-tablero-col-t', TIT[j]));
      cuenta[j] = el('span', 'log-tablero-n', '0');
      h.appendChild(cuenta[j]);
      c.appendChild(h);
      c.appendChild(el('p', 'log-tablero-col-d', DES[j]));
      lista[j] = el('ul', 'log-tablero-lista');
      c.appendChild(lista[j]);
      if (k === 'cobr') { mas = el('p', 'log-tablero-mas', ''); c.appendChild(mas); }
      col[j] = c;
      cols.appendChild(c);
    });
    scroll.appendChild(cols);

    var pie = el('div', 'log-tablero-pie');
    var totC = el('p', 'log-tablero-tot log-tablero-tot-c'), totP = el('p', 'log-tablero-tot log-tablero-tot-p');
    var bC = el('b', null, ''), bP = el('b', null, '');
    totC.appendChild(el('small', null, 'Cobrado hoy')); totC.appendChild(bC);
    totP.appendChild(el('small', null, 'Por cobrar')); totP.appendChild(bP);
    pie.appendChild(totC); pie.appendChild(totP);

    env.appendChild(cab);
    env.appendChild(scroll);
    env.appendChild(pie);
    env.appendChild(el('p', 'log-tablero-pista', 'Desliza para ver las cuatro columnas.'));

    // ---------- tarjetas ----------
    var sigId = 0;
    function tarjeta(v, etapa) {
      var t = el('li', 'log-tablero-tj');
      t._v = v; t._id = ++sigId;
      var a = el('div'), b = el('div'), c = el('div');
      var ruta = el('span', 'log-tablero-ruta', v.o + ' → ' + v.d);
      t._monto = el('span', 'log-tablero-monto', '');
      a.appendChild(ruta); a.appendChild(t._monto);
      var cam = el('span', 'log-tablero-cam');
      t._silHost = cam;
      cam.appendChild(LOG.silueta(LOG.flota(), 'log-sil log-tablero-sil'));
      t._camTxt = el('span', null, '');
      cam.appendChild(t._camTxt);
      b.appendChild(cam);
      c.appendChild(el('span', 'log-tablero-chofer', v.ch));
      t._estado = el('span', 'log-tablero-estado', '');
      c.appendChild(t._estado);
      t.appendChild(a); t.appendChild(b); t.appendChild(c);
      pintarCamion(t);
      ponerEtapa(t, etapa);
      return t;
    }
    function pintarCamion(t) {
      var d = LOG.datosFlota();
      var u = t._silHost.querySelector('use');
      if (u) u.setAttribute('href', '#' + d.sil);
      t._camTxt.textContent = d.corto + ' · ' + t._v.pl;
      t._monto.textContent = LOG.num(tarifa(t._v));
    }
    function ponerEtapa(t, etapa) {
      t.setAttribute('data-etapa', etapa);
      t._estado.textContent = estado(t._v, etapa);
    }

    // Estado inicial (y final con reduced-motion): tablero lleno, con cobros anteriores del día
    var cobradosOcultos = [VIAJES[9], VIAJES[10], VIAJES[11]];
    var MAX_OCULTOS = cobradosOcultos.length;
    var sigViaje = 9;
    [[0, 1, 2], [3, 4], [5, 6], [7, 8]].forEach(function (ids, j) {
      // la primera de cada lista es la más nueva (arriba)
      ids.forEach(function (n) { lista[j].appendChild(tarjeta(VIAJES[n], ETAPAS[j])); });
    });

    // ---------- contadores y totales ----------
    var ultimoN = [-1, -1, -1, -1], ultimoC = null, ultimoP = null, paraC = null, paraP = null;
    function totalCobrado() {
      var s = 0, k;
      for (k = 0; k < cobradosOcultos.length; k++) s += tarifa(cobradosOcultos[k]);
      var ts = lista[3].children;
      for (k = 0; k < ts.length; k++) if (ts[k]._v) s += tarifa(ts[k]._v);
      return s;
    }
    function totalPorCobrar() {
      var s = 0, ts = lista[2].children;
      for (var k = 0; k < ts.length; k++) if (ts[k]._v) s += tarifa(ts[k]._v);
      return s;
    }
    function tarjetasDe(j) {
      var r = [], ts = lista[j].children;
      for (var k = 0; k < ts.length; k++) if (ts[k]._v) r.push(ts[k]);
      return r;
    }
    function contadores(animar) {
      for (var j = 0; j < 4; j++) {
        var n = tarjetasDe(j).length + (j === 3 ? cobradosOcultos.length : 0);
        if (n !== ultimoN[j]) {
          cuenta[j].textContent = String(n);
          if (animar && ultimoN[j] >= 0 && !reducir) {
            cuenta[j].classList.remove('is-salta'); void cuenta[j].offsetWidth; cuenta[j].classList.add('is-salta');
          }
          ultimoN[j] = n;
        }
      }
      mas.textContent = cobradosOcultos.length ? 'y ' + cobradosOcultos.length + ' más hoy' : '';
      var c = totalCobrado(), p = totalPorCobrar();
      if (c !== ultimoC) {
        if (paraC) paraC();
        paraC = animar && ultimoC !== null ? LOG.contar(bC, c, 800, function (v) { return LOG.num(Math.round(v / 10) * 10); }, ultimoC) : null;
        if (!paraC) bC.textContent = LOG.num(c);
        ultimoC = c;
      }
      if (p !== ultimoP) {
        if (paraP) paraP();
        paraP = animar && ultimoP !== null ? LOG.contar(bP, p, 800, function (v) { return LOG.num(Math.round(v / 10) * 10); }, ultimoP) : null;
        if (!paraP) bP.textContent = LOG.num(p);
        ultimoP = p;
      }
    }

    // Se muestra la maqueta y la lista queda solo para lectores de pantalla
    resp.classList.add('log-tablero-oculta');
    env.hidden = false;
    contadores(false);

    // Cambio de flota: camión y montos de todas las tarjetas
    LOG.alCambiar(function (clave, d) {
      var u = ico.querySelector('use');
      if (u) u.setAttribute('href', '#' + d.sil);
      sub.textContent = 'Viajes del día · ' + d.nombre;
      var ts = env.querySelectorAll('.log-tablero-tj');
      for (var k = 0; k < ts.length; k++) {
        if (!ts[k]._v) continue;
        pintarCamion(ts[k]);
        if (!reducir) { ts[k].classList.remove('is-cambia'); void ts[k].offsetWidth; ts[k].classList.add('is-cambia'); }
      }
      contadores(true);
    });

    if (reducir || !hayIO) return; // estado final, sin animar

    // ---------- FLIP ----------
    var puedeAnimar = typeof env.animate === 'function';
    function flip(cambio, nueva) {
      var ts = env.querySelectorAll('.log-tablero-tj'), antes = {}, k, r;
      for (k = 0; k < ts.length; k++) if (ts[k]._id) antes[ts[k]._id] = ts[k].getBoundingClientRect();
      cambio();
      if (!puedeAnimar) return;
      ts = env.querySelectorAll('.log-tablero-tj');
      for (k = 0; k < ts.length; k++) {
        var t = ts[k];
        if (!t._id || t.classList.contains('log-tablero-fantasma')) continue;
        r = t.getBoundingClientRect();
        var r0 = antes[t._id];
        if (!r0) {
          if (t === nueva) t.animate([{ opacity: 0, transform: 'translateY(-10px) scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 520, easing: EASE, delay: 120, fill: 'backwards' });
          continue;
        }
        var dx = r0.left - r.left, dy = r0.top - r.top;
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue;
        var lejos = Math.abs(dx) > 40;
        if (lejos) t.classList.add('is-moviendo');
        var anim = t.animate(
          lejos
            ? [{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'translate(' + (dx / 2) + 'px,' + (dy / 2 - 10) + 'px) scale(1.03)', offset: 0.5 }, { transform: 'none' }]
            : [{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }],
          { duration: lejos ? 760 : 520, easing: EASE }
        );
        if (lejos) anim.onfinish = anim.oncancel = (function (n) { return function () { n.classList.remove('is-moviendo'); }; })(t);
      }
    }
    // La tarjeta que sale del tablero se desvanece en su sitio (copia absoluta dentro de su columna)
    // top = posición que tenía antes de que entrara la tarjeta nueva (así no se sale de la columna)
    function despedir(t, j, top) {
      lista[j].removeChild(t);
      if (!puedeAnimar) return;
      var g = t.cloneNode(true);
      g.classList.add('log-tablero-fantasma');
      g.style.top = top + 'px';
      lista[j].appendChild(g);
      var a = g.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(8px) scale(.96)' }], { duration: 300, easing: EASE, fill: 'forwards' });
      a.onfinish = a.oncancel = function () { if (g.parentNode) g.parentNode.removeChild(g); };
    }

    // ---------- seguir la columna que cambia (solo cuando las columnas se desplazan) ----------
    var tocado = 0;
    ['pointerdown', 'touchstart', 'wheel', 'keydown'].forEach(function (ev) {
      scroll.addEventListener(ev, function () { tocado = Date.now(); }, { passive: true });
    });
    function seguir(j, listo) {
      var max = scroll.scrollWidth - scroll.clientWidth;
      if (max < 4 || Date.now() - tocado < 7000) { listo(); return; }
      var pad = parseFloat(getComputedStyle(scroll).paddingLeft) || 0;
      var objetivo = j === 0 ? 0 : col[j].offsetLeft - pad;
      objetivo = Math.max(0, Math.min(max, objetivo));
      if (Math.abs(objetivo - scroll.scrollLeft) < 8) { listo(); return; }
      try { scroll.scrollTo({ left: objetivo, behavior: 'smooth' }); } catch (e) { scroll.scrollLeft = objetivo; }
      reloj = setTimeout(function () { reloj = null; if (activo) listo(); }, 450);
    }

    // ---------- ciclo: Entregado → Cobrado, En ruta → Entregado, Programado → En ruta, nuevo viaje ----------
    var ACCIONES = [2, 1, 0, -1];
    var paso = 0, reloj = null, activo = false, enVista = false;
    function mover(j) {
      var de = tarjetasDe(j);
      if (!de.length) return false;
      var t = de[de.length - 1]; // la más antigua (abajo)
      seguir(j + 1, function () {
        flip(function () {
          var tops = [];
          if (j + 1 === 3) {
            var rl = lista[3].getBoundingClientRect(), ant = tarjetasDe(3);
            for (var q = 0; q < ant.length; q++) tops[q] = ant[q].getBoundingClientRect().top - rl.top;
          }
          ponerEtapa(t, ETAPAS[j + 1]);
          lista[j + 1].insertBefore(t, lista[j + 1].firstChild);
          if (j + 1 === 3) {
            var cob = tarjetasDe(3);
            while (cob.length > MAX_VISIBLES) {
              var viejo = cob.pop();
              cobradosOcultos.push(viejo._v);
              // tope: los viajes se reciclan, así que el total de «Cobrado hoy» no debe crecer sin límite
              while (cobradosOcultos.length > MAX_OCULTOS) cobradosOcultos.shift();
              despedir(viejo, 3, tops[cob.length - 1] || 0);
            }
          }
        });
        contadores(true);
        programar(2600);
      });
      return true;
    }
    function nuevo() {
      if (tarjetasDe(0).length >= MAX_VISIBLES) return false;
      var v = VIAJES[sigViaje % VIAJES.length];
      sigViaje++;
      seguir(0, function () {
        var t = tarjeta(v, 'prog');
        flip(function () { lista[0].insertBefore(t, lista[0].firstChild); }, t);
        contadores(true);
        programar(2600);
      });
      return true;
    }
    function tic() {
      reloj = null;
      if (!activo) return;
      for (var intento = 0; intento < ACCIONES.length; intento++) {
        var j = ACCIONES[paso];
        paso = (paso + 1) % ACCIONES.length;
        if (j === -1 ? nuevo() : mover(j)) return;
      }
      programar(2600);
    }
    function programar(ms) {
      if (reloj) clearTimeout(reloj);
      reloj = activo ? setTimeout(tic, ms) : null;
    }
    function actualizar() {
      var debe = enVista && !document.hidden;
      if (debe === activo) return;
      activo = debe;
      if (activo) programar(1100);
      else if (reloj) { clearTimeout(reloj); reloj = null; }
    }

    // Primera vez en pantalla: las tarjetas entran escalonadas
    env.classList.add('is-espera');
    LOG.alVer(env, function () {
      var ts = env.querySelectorAll('.log-tablero-tj');
      for (var k = 0; k < ts.length; k++) {
        ts[k].style.animationDelay = (k * 60) + 'ms';
        ts[k].classList.add('is-entra');
        ts[k].addEventListener('animationend', function (e) {
          if (e.animationName === 'log-tablero-entra') { this.classList.remove('is-entra'); this.style.animationDelay = ''; }
        });
      }
      env.classList.remove('is-espera');
    }, 0.2);

    new IntersectionObserver(function (es) {
      enVista = es[es.length - 1].isIntersecting;
      env.classList.toggle('is-pausa', !enVista); // pausa el punto que late de la cabecera
      actualizar();
    }, { threshold: 0.25 }).observe(env);
    document.addEventListener('visibilitychange', actualizar);
  }

  if (window.LOG) iniciar();
  else document.addEventListener('DOMContentLoaded', iniciar);
})();
