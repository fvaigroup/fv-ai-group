/* /triangular/paginas-web — efecto «funciones» (usa window.WEB de assets/paginas-web.js).
   Explorador de las 90 funciones que ya están en el HTML (li.web-fn[data-nivel]); no se duplica ninguna:
   - Control segmentado (radiogroup) Básico / Intermedio / Avanzado: marca cada función como incluida o «No incluido»
     (tachado + etiqueta, sin bajar la opacidad) y cuenta «N de 90 funciones incluidas» (se anuncia una vez por cambio).
   - Cada categoría (section.web-cat) se pliega con un botón dentro de su <h3> (aria-expanded), con «Expandir todo».
     En celular empiezan cerradas; desde 768 px, abiertas. Ctrl+F, un enlace #fn-… o imprimir las abren.
   Reemplaza el respaldo de [data-web-funciones-ctl]. Con prefers-reduced-motion todo cambia al instante. */
(function () {
  'use strict';
  var W = window.WEB;
  if (!W) return;
  var caja = W.montar('funciones');
  var lista = W.raiz.querySelector('[data-web-cats]');
  if (!caja || !lista) return;
  var fns = [].slice.call(lista.querySelectorAll('li.web-fn[data-nivel]'));
  var cats = [].slice.call(lista.querySelectorAll('.web-cat'));
  if (!fns.length) return;
  var TOTAL = fns.length;
  // qué data-nivel entra en cada nivel del plan
  var ENTRA = { basico: { todos: 1 }, intermedio: { todos: 1, intermedio: 1 }, avanzado: { todos: 1, intermedio: 1, avanzado: 1 } };
  var nivel = 'avanzado';

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function cuantos(n, items) { var e = ENTRA[n], c = 0; (items || fns).forEach(function (li) { if (e[li.getAttribute('data-nivel')]) c++; }); return c; }

  // ---------- controles ----------
  var raizCtl = el('div', 'web-funciones');
  var barra = el('div', 'web-funciones-barra');
  var etq = el('p', 'web-funciones-etq', 'Ver lo que incluye el nivel');
  etq.id = 'web-funciones-etq';
  var seg = el('div', 'web-funciones-seg');
  seg.setAttribute('role', 'radiogroup');
  seg.setAttribute('aria-labelledby', etq.id);
  var ficha = el('span', 'web-funciones-ficha');
  ficha.setAttribute('aria-hidden', 'true');
  seg.appendChild(ficha);
  var botones = W.niveles.map(function (n) {
    var b = el('button', 'web-funciones-btn');
    b.type = 'button';
    b.setAttribute('role', 'radio');
    b.setAttribute('data-nivel', n);
    b.appendChild(el('span', 'web-funciones-btn-n', W.nombres[n]));
    b.appendChild(el('span', 'web-funciones-btn-c', cuantos(n) + ' funciones'));
    seg.appendChild(b);
    return b;
  });
  barra.appendChild(etq);
  barra.appendChild(seg);

  var cuenta = el('div', 'web-funciones-cuenta');
  var cuentaTxt = el('p', 'web-funciones-cuenta-t');
  cuentaTxt.setAttribute('aria-hidden', 'true');
  var numEl = el('span', 'web-funciones-num');
  cuentaTxt.appendChild(numEl);
  cuentaTxt.appendChild(document.createTextNode(' de ' + TOTAL + ' funciones incluidas'));
  var riel = el('span', 'web-funciones-riel');
  riel.setAttribute('aria-hidden', 'true');
  var relleno = el('span', 'web-funciones-relleno');
  riel.appendChild(relleno);
  var vivo = el('p', 'fv-sr-only');
  vivo.setAttribute('role', 'status');
  vivo.setAttribute('aria-live', 'polite');
  cuenta.appendChild(cuentaTxt);
  cuenta.appendChild(riel);
  cuenta.appendChild(vivo);

  var todo = el('button', 'web-funciones-todo');
  todo.type = 'button';
  barra.appendChild(cuenta);
  barra.appendChild(todo);
  raizCtl.appendChild(barra);
  caja.innerHTML = '';
  caja.appendChild(raizCtl);
  W.raiz.classList.add('web-funciones-on');

  // ---------- cada función: etiqueta «No incluido» (oculta si está incluida) ----------
  var etiquetas = fns.map(function (li) {
    var t = li.querySelector('.web-fn-t') || li;
    var s = el('span', 'web-funciones-no', 'No incluido');
    s.hidden = true;
    t.appendChild(s);
    return s;
  });

  // ---------- categorías plegables ----------
  var hasta = !!document.body && 'onbeforematch' in document.body;
  var grupos = cats.map(function (sec, i) {
    var h = sec.querySelector('.web-cat-t');
    var ol = sec.querySelector('.web-fns');
    if (!h || !ol) return null;
    if (!ol.id) ol.id = (sec.id || 'web-cat-' + i) + '-lista';
    var b = el('button', 'web-funciones-cat');
    b.type = 'button';
    b.setAttribute('aria-controls', ol.id);
    var nom = el('span', 'web-funciones-cat-nom');
    while (h.firstChild) nom.appendChild(h.firstChild);
    var cc = el('span', 'web-funciones-cc');
    var flecha = el('span', 'web-funciones-flecha');
    flecha.setAttribute('aria-hidden', 'true');
    b.appendChild(nom);
    b.appendChild(cc);
    b.appendChild(flecha);
    h.appendChild(b);
    var g = { sec: sec, ol: ol, btn: b, cc: cc, items: [].slice.call(ol.querySelectorAll('li.web-fn[data-nivel]')), abierta: true };
    b.addEventListener('click', function () { abrir(g, !g.abierta, true); pintarTodo(); });
    if (hasta) ol.addEventListener('beforematch', function () { abrir(g, true, false); pintarTodo(); });
    return g;
  }).filter(Boolean);

  function abrir(g, si, animar) {
    g.abierta = si;
    g.btn.setAttribute('aria-expanded', si ? 'true' : 'false');
    g.sec.classList.toggle('web-funciones-cerrada', !si);
    if (si) {
      g.ol.hidden = false;
      g.ol.removeAttribute('hidden');
      if (animar && !W.reducir) {
        g.ol.classList.remove('web-funciones-abre');
        void g.ol.offsetWidth;
        g.ol.classList.add('web-funciones-abre');
      }
    } else if (hasta) g.ol.setAttribute('hidden', 'until-found');
    else g.ol.hidden = true;
  }
  function pintarTodo() {
    var alguna = grupos.some(function (g) { return !g.abierta; });
    todo.textContent = alguna ? 'Expandir todo' : 'Contraer todo';
    todo.setAttribute('aria-expanded', alguna ? 'false' : 'true');
  }
  todo.setAttribute('aria-controls', grupos.map(function (g) { return g.ol.id; }).join(' '));
  todo.addEventListener('click', function () {
    var alguna = grupos.some(function (g) { return !g.abierta; });
    grupos.forEach(function (g) { if (g.abierta !== alguna) abrir(g, alguna, true); });
    pintarTodo();
  });

  var ancho = window.matchMedia ? matchMedia('(min-width: 768px)').matches : true;
  grupos.forEach(function (g) { abrir(g, ancho, false); });

  // un enlace a #fn-… (o a una función dentro) abre su categoría
  function porHash() {
    var id = decodeURIComponent((location.hash || '').slice(1));
    if (!id) return;
    var t = document.getElementById(id);
    if (!t || !lista.contains(t)) return;
    grupos.forEach(function (g) {
      if (g.sec.contains(t) && !g.abierta) {
        abrir(g, true, false);
        if (t !== g.sec) t.scrollIntoView();
      }
    });
    pintarTodo();
  }
  addEventListener('hashchange', porHash);
  porHash();
  pintarTodo();
  // al imprimir se ve todo
  addEventListener('beforeprint', function () { grupos.forEach(function (g) { abrir(g, true, false); }); pintarTodo(); });

  // ---------- nivel elegido ----------
  var cancelar = function () {}, anunciar = null, mostrado = cuantos(nivel), visto = false;
  function aplicar(n, desdeUsuario) {
    var previo = nivel;
    nivel = n;
    var e = ENTRA[n];
    raizCtl.setAttribute('data-nivel', n);
    botones.forEach(function (b, i) {
      var on = b.getAttribute('data-nivel') === n;
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
      if (on) ficha.style.transform = 'translateX(' + (i * 100) + '%)';
    });
    fns.forEach(function (li, i) {
      var si = !!e[li.getAttribute('data-nivel')];
      var antes = li.classList.contains('web-funciones-fuera');
      li.classList.toggle('web-funciones-fuera', !si);
      li.classList.toggle('web-funciones-dentro', si);
      etiquetas[i].hidden = si;
      if (desdeUsuario && !W.reducir && antes === si && previo !== n) {
        li.classList.remove('web-funciones-cambia');
        void li.offsetWidth;
        li.classList.add('web-funciones-cambia');
      }
    });
    grupos.forEach(function (g) {
      var c = cuantos(n, g.items);
      g.cc.textContent = c + ' de ' + g.items.length;
      g.cc.appendChild(el('span', 'fv-sr-only', ' incluidas'));
      g.cc.classList.toggle('web-funciones-cc-llena', c === g.items.length);
    });
    var total = cuantos(n);
    relleno.style.transform = 'scaleX(' + (total / TOTAL).toFixed(4) + ')';
    cancelar();
    if (visto) cancelar = W.contar(numEl, total, 700, null, mostrado);
    else numEl.textContent = String(total);
    mostrado = total;
    var frase = total + ' de ' + TOTAL + ' funciones incluidas en el nivel ' + W.nombres[n] + '.';
    if (desdeUsuario) {
      // una sola vez por cambio: si se recorren los niveles con las flechas, solo se anuncia el último
      clearTimeout(anunciar);
      anunciar = setTimeout(function () { vivo.textContent = frase; }, 450);
    } else vivo.textContent = frase;
  }

  botones.forEach(function (b, i) {
    b.addEventListener('click', function () { if (b.getAttribute('data-nivel') !== nivel) aplicar(b.getAttribute('data-nivel'), true); });
    b.addEventListener('keydown', function (ev) {
      var k = ev.key, j = -1;
      if (k === 'ArrowRight' || k === 'ArrowDown') j = (i + 1) % botones.length;
      else if (k === 'ArrowLeft' || k === 'ArrowUp') j = (i - 1 + botones.length) % botones.length;
      else if (k === 'Home') j = 0;
      else if (k === 'End') j = botones.length - 1;
      if (j < 0) return;
      ev.preventDefault();
      botones[j].focus();
      aplicar(botones[j].getAttribute('data-nivel'), true);
    });
  });

  aplicar(nivel, false);

  // la primera vez que se ve, la cifra cuenta desde 0 y la barra se llena
  if (!W.reducir) {
    raizCtl.classList.add('web-funciones-espera');
    numEl.textContent = '0';
    W.alVer(raizCtl, function () {
      visto = true;
      raizCtl.classList.remove('web-funciones-espera');
      cancelar = W.contar(numEl, mostrado, 1200, null, 0);
    }, 0.4);
  } else visto = true;
})();
