/* Páginas de producto de software (/club, /condominio y /gym): pestañas y calculadora.
   - Pestañas accesibles (flechas, Inicio y Fin): [data-pd-tabs] con role="tab" / role="tabpanel".
   - Calculadora [data-pd-calc data-producto="club|condominio|gym"]: recomienda la línea según tenga o no junta directiva y administración
     propia, y el plan según el número de usuarios (socios, unidades o miembros).
   Los precios salen SIEMPRE de assets/precios-software.js (la tabla única de las tres apps); aquí no hay precios escritos.
   Las funciones puras (Producto.calcular) también se prueban con `node tests/club.test.js` y `node tests/software.test.js`. */
(function (root) {
  'use strict';
  var S = (typeof require === 'function' && typeof module !== 'undefined' && module.exports) ? require('./precios-software.js') : root.FV_SOFTWARE;

  // ---------------- Calculadora (cálculo puro) ----------------
  /** Resultado completo: línea, plan, precio mensual y anual (30 % menos), costo por usuario, implementación y mensaje de WhatsApp. */
  function calcular(prod, tieneJunta, usuarios) {
    var p = S.PRODUCTOS[prod];
    var n = Math.max(1, Math.floor(Number(usuarios) || 0));
    var r = S.recomendar(!!tieneJunta, n);
    var out = { producto: prod, usuarios: n, linea: r.linea, plan: r.plan, aMedida: r.aMedida, cambioDeLinea: r.cambioDeLinea };
    if (r.plan) {
      var m = r.plan.mensual;
      out.mensual = m; out.anual = S.anual(r.linea, m); out.equivalente = S.equivalenteMensual(r.linea, m); out.ahorro = S.ahorroAnual(r.linea, m);
      out.porUsuario = Math.round((m / n) * 100) / 100;
      out.implementacion = S.implementacion(r.linea, n);
    }
    out.mensaje = S.mensaje(r.linea, prod, r.plan, 'mensual').replace('(', '(mi ' + (prod === 'club' ? 'club' : prod === 'gym' ? 'gimnasio' : 'edificio') + ' tiene ' + S.miles(n) + ' ' + p.usuarios + '; ');
    return out;
  }

  // ---------------- Pestañas ----------------
  function iniciarPestanas() {
    document.querySelectorAll('[data-pd-tabs], [data-club-tabs]').forEach(function (lista) {
      var tabs = Array.prototype.slice.call(lista.querySelectorAll('[role="tab"]'));
      if (!tabs.length) return;
      function elegir(t, enfocar) {
        tabs.forEach(function (x) {
          var on = x === t;
          x.setAttribute('aria-selected', on ? 'true' : 'false');
          x.tabIndex = on ? 0 : -1;
          var p = document.getElementById(x.getAttribute('aria-controls'));
          if (p) p.hidden = !on;
        });
        if (enfocar) t.focus();
      }
      tabs.forEach(function (t, i) {
        t.addEventListener('click', function () { elegir(t, false); });
        t.addEventListener('keydown', function (e) {
          var n = null;
          if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
          else if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
          else if (e.key === 'Home') n = tabs[0];
          else if (e.key === 'End') n = tabs[tabs.length - 1];
          if (n) { e.preventDefault(); elegir(n, true); }
        });
      });
      elegir(tabs[0], false);
    });
  }

  // ---------------- Calculadora (pantalla) ----------------
  function iniciarCalculadora() {
    var cont = document.querySelector('[data-pd-calc], [data-club-calc]');
    if (!cont || !S) return;
    var prod = cont.getAttribute('data-producto') || 'club', pr = S.PRODUCTOS[prod];
    var num = cont.querySelector('[data-calc-numero]'), rango = cont.querySelector('[data-calc-rango]'), wa = cont.querySelector('[data-calc-wa]');
    var radios = cont.querySelectorAll('input[name="calc-junta"]');
    function el(k) { return cont.querySelector('[data-calc="' + k + '"]'); }
    function junta() { var c = cont.querySelector('input[name="calc-junta"]:checked'); return !c || c.value === 'si'; }
    function pintar() {
      var n = parseInt(num.value, 10);
      if (!(n >= 1)) return;
      n = Math.min(n, 100000);
      rango.value = Math.min(n, parseInt(rango.max, 10));
      var r = calcular(prod, junta(), n), hex = r.linea === 'hex';
      var insignia = el('linea'); insignia.textContent = hex ? 'Línea Hexagonal' : 'Línea Triangular';
      insignia.className = insignia.className.replace(/\bnav-(hex|tri)\b/g, '').trim() + ' ' + (hex ? 'nav-hex' : 'nav-tri');
      var aviso = el('aviso');
      if (r.aMedida) {
        el('plan').textContent = 'A medida';
        el('mensual').textContent = 'A medida'; el('anual').textContent = 'A medida'; el('anual-total').textContent = 'Armamos la propuesta para su organización.';
        el('porsocio').textContent = 'Se cotiza'; el('impl').textContent = 'A medida';
        aviso.textContent = 'Con más de 5.000 ' + pr.usuarios + ' armamos una propuesta a la medida.'; aviso.hidden = false;
      } else {
        el('plan').textContent = 'Hasta ' + S.miles(r.plan.hasta) + ' ' + pr.usuarios;
        el('mensual').textContent = S.fmtPrecio(r.linea, r.mensual) + '/mes';
        el('anual').textContent = S.fmtPrecio(r.linea, r.equivalente) + '/mes';
        el('anual-total').textContent = 'Se paga ' + S.fmtPrecio(r.linea, r.anual) + ' al año por adelantado. Ahorra ' + S.fmtPrecio(r.linea, r.ahorro) + '.';
        el('porsocio').textContent = S.fmt(r.porUsuario) + ' al mes';
        el('impl').textContent = r.implementacion ? S.fmtPrecio(r.linea, r.implementacion.unico) + (r.implementacion.cuotas ? ' en ' + r.implementacion.cuotas + ' cuotas' : ' (pago único)') : 'A medida';
        aviso.textContent = r.cambioDeLinea ? 'Con más de 500 ' + pr.usuarios + ' corresponde la Línea Hexagonal.' : ''; aviso.hidden = !r.cambioDeLinea;
      }
      wa.setAttribute('href', 'https://wa.me/584244125386?text=' + encodeURIComponent(r.mensaje));
    }
    num.addEventListener('input', pintar);
    rango.addEventListener('input', function () { num.value = rango.value; pintar(); });
    radios.forEach(function (r) { r.addEventListener('change', pintar); });
    pintar();
  }

  var Producto = { calcular: calcular };
  root.Producto = Producto;
  if (typeof module !== 'undefined' && module.exports) module.exports = Producto;
  if (typeof document !== 'undefined') {
    var listo = function () { iniciarPestanas(); iniciarCalculadora(); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', listo); else listo();
  }
})(typeof window !== 'undefined' ? window : globalThis);
