/* /triangular/delta/logistica — efecto «planes»: filtro de #funciones por plan.
   Construye dentro de [data-log-planes] un control segmentado (role=radiogroup) Básico / Intermedio / Avanzado.
   Cada li.log-fn[data-plan="B|I|A"] queda incluida si su plan es <= al elegido (cada plan incluye lo del anterior);
   las demás reciben .is-fuera (chip en gris y la marca «No incluido en el plan …»; el texto conserva contraste AA). Muestra «N funciones incluidas», «x de y» por categoría y resalta la
   columna (tabla, ≥768 px) o la tarjeta (celular) del plan en #precios.
   Los datos salen de los atributos data-plan del HTML; no hay lista en JS. Sin JS no se construye nada. */
(function () {
  'use strict';
  function iniciar() {
    var LOG = window.LOG;
    if (!LOG || !LOG.raiz) return;
    var ctl = LOG.raiz.querySelector('[data-log-planes]');
    var cats = LOG.raiz.querySelector('[data-log-funciones]');
    if (!ctl || !cats || ctl.getAttribute('data-log-planes-listo')) return;
    var fns = [].slice.call(cats.querySelectorAll('li.log-fn[data-plan]'));
    if (!fns.length) return;
    ctl.setAttribute('data-log-planes-listo', '1');
    // Marca visible para lo que queda fuera del plan elegido (CSS: .log-fn-fuera, solo se ve con .is-fuera)
    var marcas = fns.map(function (li) {
      var m = document.createElement('span');
      m.className = 'log-fn-fuera';
      (li.querySelector('div') || li).appendChild(m);
      return m;
    });

    var ORDEN = { B: 1, I: 2, A: 3 };
    var PLANES = [
      { p: 'B', nombre: 'Básico' },
      { p: 'I', nombre: 'Intermedio' },
      { p: 'A', nombre: 'Avanzado' }
    ];
    function cuantas(p) {
      var n = 0;
      for (var i = 0; i < fns.length; i++) if ((ORDEN[fns[i].getAttribute('data-plan')] || 9) <= ORDEN[p]) n++;
      return n;
    }

    // ---------- control ----------
    var etq = document.createElement('p');
    etq.className = 'log-planes-etq';
    etq.id = 'log-planes-etq';
    etq.textContent = 'Mira qué trae cada plan:';

    var grupo = document.createElement('div');
    grupo.className = 'log-planes-seg';
    grupo.setAttribute('role', 'radiogroup');
    grupo.setAttribute('aria-labelledby', 'log-planes-etq');
    var ficha = document.createElement('span');
    ficha.className = 'log-planes-ficha';
    ficha.setAttribute('aria-hidden', 'true');
    grupo.appendChild(ficha);

    var botones = PLANES.map(function (d, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'log-planes-btn';
      b.setAttribute('role', 'radio');
      b.setAttribute('data-p', d.p);
      b.setAttribute('aria-checked', 'false');
      b.tabIndex = -1;
      var chip = document.createElement('span');
      chip.className = 'log-plan';
      chip.setAttribute('data-p', d.p);
      chip.setAttribute('aria-hidden', 'true');
      chip.textContent = d.p;
      var t = document.createElement('span');
      t.className = 'log-planes-nom';
      t.textContent = d.nombre;
      b.appendChild(chip);
      b.appendChild(t);
      b.setAttribute('aria-label', 'Plan ' + d.nombre + ': ' + cuantas(d.p) + ' funciones');
      b.addEventListener('click', function () { elegir(d.p, true); });
      b.addEventListener('keydown', function (e) {
        var k = e.key, j = -1;
        if (k === 'ArrowRight' || k === 'ArrowDown') j = (i + 1) % 3;
        else if (k === 'ArrowLeft' || k === 'ArrowUp') j = (i + 2) % 3;
        else if (k === 'Home') j = 0;
        else if (k === 'End') j = 2;
        else if (k === ' ' || k === 'Enter') { e.preventDefault(); elegir(d.p, true); return; }
        if (j < 0) return;
        e.preventDefault();
        elegir(PLANES[j].p, true);
        botones[j].focus();
      });
      grupo.appendChild(b);
      return b;
    });

    var res = document.createElement('p');
    res.className = 'log-planes-res';
    // El número visible se anima; el lector de pantalla oye solo el resultado final, de una vez, por este nodo aparte.
    var vivo = document.createElement('p');
    vivo.className = 'sr-only';
    vivo.setAttribute('aria-live', 'polite');
    vivo.setAttribute('aria-atomic', 'true');
    var resN = document.createElement('strong');
    resN.className = 'log-planes-n';
    var resT = document.createElement('span');
    var resLink = document.createElement('a');
    resLink.className = 'log-link log-planes-link';
    resLink.href = '#precios';
    resLink.textContent = 'Ver su precio';
    resLink.addEventListener('click', function () { if (actual) marcarPrecios(actual); });
    res.appendChild(resN);
    res.appendChild(resT);

    var pie = document.createElement('div');
    pie.className = 'log-planes-pie';
    pie.appendChild(res);
    pie.appendChild(resLink);
    pie.appendChild(vivo);

    ctl.appendChild(etq);
    ctl.appendChild(grupo);
    ctl.appendChild(pie);

    // ---------- conteo por categoría ----------
    var grupos = [].slice.call(cats.querySelectorAll('.log-cat')).map(function (c) {
      var lis = [].slice.call(c.querySelectorAll('li.log-fn[data-plan]'));
      var h = c.querySelector('.log-cat-t');
      var s = null;
      if (h && lis.length) {
        s = document.createElement('span');
        s.className = 'log-planes-cat';
        h.appendChild(document.createTextNode(' '));
        h.appendChild(s);
      }
      return { lis: lis, s: s };
    });

    // ---------- #precios ----------
    var precios = document.getElementById('precios');
    var tabla = precios && precios.querySelector('.log-tabla');
    var tarjetas = precios ? [].slice.call(precios.querySelectorAll('.log-precio-card')) : [];
    function tarjetaDe(p) {
      for (var i = 0; i < tarjetas.length; i++) if (tarjetas[i].querySelector('[data-plan-wa="' + p + '"]')) return tarjetas[i];
      return tarjetas[ORDEN[p] - 1] || null;
    }
    function marcarPrecios(p) {
      if (tabla) {
        tabla.classList.add('log-planes-tabla');
        [].forEach.call(tabla.rows, function (fila) {
          for (var c = 1; c < fila.cells.length; c++) fila.cells[c].classList.toggle('log-planes-col', c === ORDEN[p]);
        });
      }
      var t = tarjetaDe(p);
      tarjetas.forEach(function (x) { x.classList.toggle('log-planes-sel', x === t); });
    }

    // ---------- aplicar ----------
    var actual = null, parar = function () {}, nAnt = fns.length;
    function elegir(p, usuario) {
      if (!ORDEN[p]) return;
      if (p === actual && !usuario) return;
      var cambio = p !== actual;
      actual = p;
      var nombre = '';
      botones.forEach(function (b, i) {
        var si = PLANES[i].p === p;
        b.setAttribute('aria-checked', si ? 'true' : 'false');
        b.tabIndex = si ? 0 : -1;
        if (si) { nombre = PLANES[i].nombre; ficha.style.transform = 'translateX(' + (i * 100) + '%)'; }
      });
      ficha.setAttribute('data-p', p);
      ctl.setAttribute('data-plan-sel', p);
      var n = 0;
      fns.forEach(function (li, i) {
        var dentro = (ORDEN[li.getAttribute('data-plan')] || 9) <= ORDEN[p];
        marcas[i].textContent = dentro ? '' : 'No incluido en el plan ' + nombre;
        li.classList.toggle('is-fuera', !dentro);
        li.classList.toggle('log-planes-dentro', dentro);
        if (dentro) n++;
      });
      grupos.forEach(function (g) {
        if (!g.s) return;
        var k = 0;
        g.lis.forEach(function (li) { if (!li.classList.contains('is-fuera')) k++; });
        g.s.textContent = k + ' de ' + g.lis.length;
        g.s.classList.toggle('is-todo', k === g.lis.length);
        g.s.classList.toggle('is-nada', k === 0);
      });
      resT.textContent = (n === 1 ? ' función incluida' : ' funciones incluidas') + ' en el plan ' + nombre + '.';
      parar();
      if (cambio && usuario) parar = LOG.contar(resN, n, 500, null, nAnt);
      else { resN.textContent = String(n); parar = function () {}; }
      nAnt = n;
      if (usuario && cambio) vivo.textContent = n + resT.textContent;
      if (usuario) {
        marcarPrecios(p);
        if (cambio && typeof window.gtag === 'function') {
          try { window.gtag('event', 'logistica_plan_filtro', { plan: p }); } catch (e) {}
        }
      }
    }

    // Estado inicial: Avanzado (todo incluido, igual que sin JS). #precios se resalta solo cuando la persona elige.
    elegir('A', false);
    if (LOG.reducir) ctl.classList.add('log-planes-quieto');
  }

  if (window.LOG) iniciar();
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else setTimeout(iniciar, 0);
})();
