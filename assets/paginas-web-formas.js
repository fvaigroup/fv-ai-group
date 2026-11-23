/* /triangular/paginas-web — efecto «formas»: interruptor Mensual / Página Propia (role=radiogroup) en #formas.
   Reemplaza el respaldo de [data-web-formas] (entre <!-- web:formas:inicio --> y <!-- web:formas:fin -->) por el interruptor
   y un resumen corto de precios por nivel (nombre + cifra; el detalle de cada plan está en las tablas de #planes y #propia y
   no se repite aquí). Cada resumen tiene dos caras apiladas (mensual y Página Propia) que giran al cambiar, en cascada;
   la cifra cuenta del valor anterior al nuevo. La cara oculta queda con inert + aria-hidden. El enlace a la tabla del detalle
   va debajo de la tabla comparativa.
   También resalta la columna elegida de la tabla «Dos formas» (.web-tabla-2, que está FUERA de los marcadores; solo se le agregan clases).
   Precios: los de WEB.precios (encargo). Textos: los del encargo, verbatim. Sin animaciones infinitas.
   Con prefers-reduced-motion: cambio al instante, sin giro ni conteo. Sin JS queda el respaldo (las tablas completas están en #planes y #propia). */
(function () {
  'use strict';
  function iniciar() {
    var WEB = window.WEB;
    if (!WEB || !WEB.raiz) return;
    var cont = WEB.montar('formas');
    if (!cont || cont.getAttribute('data-web-formas-listo')) return;
    cont.setAttribute('data-web-formas-listo', '1');
    var P = WEB.precios, N = WEB.nombres, num = WEB.num;
    function entero(v) { return num(Math.round(v)); }

    // Nombres del encargo (puntos 3 y 4), por nivel
    var PROPIA = { basico: 'Propia Básica', intermedio: 'Propia Intermedia', avanzado: 'Propia Avanzada' };
    var FORMAS = [
      { id: 'mensual', nom: 'Mensual', sub: 'Un pago bajo cada mes', ir: '#planes', irT: 'Ir a los planes mensuales \u2193', estado: 'Mostrando los precios de los planes mensuales.' },
      { id: 'propia', nom: 'Página Propia', sub: 'Un solo pago, en dos partes', ir: '#propia', irT: 'Ir a Página Propia \u2193', estado: 'Mostrando los precios de Página Propia.' }
    ];

    function el(tag, cls, txt) {
      var e = document.createElement(tag);
      if (cls) e.className = cls;
      if (txt != null) e.textContent = txt;
      return e;
    }
    // ---------- interruptor ----------
    var raizF = el('div', 'web-formas');
    raizF.setAttribute('data-forma', 'mensual');
    var etq = el('p', 'web-formas-etq', 'Elige cómo quieres tenerla:');
    etq.id = 'web-formas-etq';
    var seg = el('div', 'web-formas-seg');
    seg.setAttribute('role', 'radiogroup');
    seg.setAttribute('aria-labelledby', 'web-formas-etq');
    seg.appendChild(el('span', 'web-formas-ficha')).setAttribute('aria-hidden', 'true');
    var botones = FORMAS.map(function (f, i) {
      var b = el('button', 'web-formas-btn');
      b.type = 'button';
      b.setAttribute('role', 'radio');
      b.setAttribute('data-forma', f.id);
      b.appendChild(el('span', 'web-formas-btn-nom', f.nom));
      b.appendChild(el('span', 'web-formas-btn-sub', f.sub));
      b.addEventListener('click', function () { elegir(f.id, true); });
      b.addEventListener('keydown', function (e) {
        var k = e.key, j = -1;
        if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'ArrowLeft' || k === 'ArrowUp') j = 1 - i;
        else if (k === 'Home') j = 0;
        else if (k === 'End') j = 1;
        if (j < 0) return;
        e.preventDefault();
        elegir(FORMAS[j].id, true);
        botones[j].focus();
      });
      seg.appendChild(b);
      return b;
    });
    var estado = el('p', 'sr-only');
    estado.setAttribute('aria-live', 'polite');

    // ---------- resumen de precios (dos caras por nivel) ----------
    var lista = el('ul', 'web-formas-planes');
    var montos = { mensual: [], propia: [] };
    var caras = { mensual: [], propia: [] };
    WEB.niveles.forEach(function (n, i) {
      var m = P.mensual[n], p = P.propia[n], q = PROPIA[n];
      var li = el('li', 'web-formas-plan');
      li.setAttribute('data-nivel', n);
      li.style.setProperty('--i', i);

      var a = el('article', 'web-formas-cara web-vidrio');
      a.setAttribute('data-cara', 'mensual');
      a.setAttribute('aria-label', 'Plan ' + N[n] + ' mensual');
      a.appendChild(el('p', 'web-formas-tipo', 'Mensual'));
      a.appendChild(el('p', 'web-formas-nom', N[n]));
      var pa = el('p', 'web-formas-precio');
      var ma = pa.appendChild(el('span', 'web-formas-monto', num(m.mes)));
      ma.setAttribute('data-valor', m.mes);
      pa.appendChild(el('span', 'web-formas-per', 'al mes'));
      a.appendChild(pa);

      var b = el('article', 'web-formas-cara web-vidrio');
      b.setAttribute('data-cara', 'propia');
      b.setAttribute('aria-label', q);
      b.appendChild(el('p', 'web-formas-tipo', 'Página Propia'));
      b.appendChild(el('p', 'web-formas-nom', q));
      var pb = el('p', 'web-formas-precio');
      var mb = pb.appendChild(el('span', 'web-formas-monto', num(p.unico)));
      mb.setAttribute('data-valor', p.unico);
      pb.appendChild(el('span', 'web-formas-per', 'precio único'));
      b.appendChild(pb);

      li.appendChild(a);
      li.appendChild(b);
      lista.appendChild(li);
      montos.mensual.push(ma); montos.propia.push(mb);
      caras.mensual.push(a); caras.propia.push(b);
    });

    var ir = el('p', 'web-formas-ir');
    var irA = ir.appendChild(el('a', 'web-link'));

    raizF.appendChild(etq);
    raizF.appendChild(seg);
    raizF.appendChild(estado);
    raizF.appendChild(lista);
    cont.textContent = '';
    cont.appendChild(raizF);

    // ---------- tabla «Dos formas» (fuera de los marcadores): resaltar la columna elegida ----------
    var sec = cont.closest('section') || WEB.raiz;
    var envTabla = sec.querySelector('.web-tabla-2');
    var tabla = envTabla && envTabla.querySelector('table');
    // el enlace al detalle va debajo de la tabla comparativa
    if (envTabla && envTabla.parentNode) envTabla.parentNode.insertBefore(ir, envTabla.nextSibling); else raizF.appendChild(ir);
    var filas = tabla ? [].slice.call(tabla.rows) : [];
    if (tabla) tabla.classList.add('web-formas-tabla');

    var actual = null, cancelar = [];
    function elegir(id, usuario) {
      if (id === actual) return;
      var antes = actual;
      actual = id;
      var f = FORMAS[id === 'mensual' ? 0 : 1], otra = id === 'mensual' ? 'propia' : 'mensual';
      raizF.setAttribute('data-forma', id);
      botones.forEach(function (b) {
        var si = b.getAttribute('data-forma') === id;
        b.setAttribute('aria-checked', si ? 'true' : 'false');
        b.tabIndex = si ? 0 : -1;
      });
      caras[id].forEach(function (c) { c.removeAttribute('aria-hidden'); c.inert = false; c.removeAttribute('inert'); });
      caras[otra].forEach(function (c) { c.setAttribute('aria-hidden', 'true'); c.inert = true; c.setAttribute('inert', ''); });
      irA.href = f.ir;
      irA.textContent = f.irT;
      if (usuario) estado.textContent = f.estado;
      var col = id === 'mensual' ? 1 : 2;
      filas.forEach(function (r) {
        for (var c = 1; c < r.cells.length && c < 3; c++) {
          r.cells[c].classList.toggle('web-formas-col-on', c === col);
          r.cells[c].classList.toggle('web-formas-col-off', c !== col);
        }
      });
      // la cifra grande cuenta del valor de la otra cara al suyo
      cancelar.forEach(function (fn) { fn(); });
      cancelar = [];
      if (antes) montos[id].forEach(function (m, i) {
        var hasta = +m.getAttribute('data-valor'), desde = +montos[antes][i].getAttribute('data-valor');
        montos[antes][i].textContent = num(desde);
        cancelar.push(WEB.contar(m, hasta, 900, entero, desde));
      });
    }
    elegir('mensual', false);

    // al entrar en pantalla por primera vez, las mensualidades cuentan desde 0
    if (!WEB.reducir) {
      WEB.alVer(lista, function () {
        if (actual !== 'mensual') { montos.mensual.forEach(function (m) { m.textContent = num(+m.getAttribute('data-valor')); }); return; }
        montos.mensual.forEach(function (m, i) {
          cancelar.push(WEB.contar(m, +m.getAttribute('data-valor'), 900 + i * 150, entero, 0));
        });
      }, 0.25);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
