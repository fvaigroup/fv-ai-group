/* Calculadora «¿Cuánto se le va entre que cobra y cambia?» (inicio, sección #brecha).
   Muestra los montos del USUARIO, no precios de F&V. No guarda nada en el navegador ni en servidores.
   La tasa del día en que cobró se prellena con la tasa BCV en vivo que ya obtiene assets/bcv.js (window.FV_BCV); si no hay tasa en vivo,
   el campo queda vacío y editable: nunca se inventa un valor.
   El cálculo vive en funciones puras (parsear, formato, calcular) para poder probarlas con Node: tests/brecha.test.js. */
(function (raiz) {
  'use strict';

  // «10.000,50», «10000,5» y «10000.50» valen lo mismo; «10.000» (puntos de miles) también. Devuelve un número > 0 o null.
  function parsear(txt) {
    var t = String(txt == null ? '' : txt).replace(/\s+/g, '');
    if (!t || !/^[0-9.,]+$/.test(t)) return null;
    if (t.indexOf(',') >= 0) t = t.replace(/\./g, '').replace(',', '.');
    else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '');
    if (!/^(\d+(\.\d+)?|\.\d+)$/.test(t)) return null;
    var n = parseFloat(t);
    return isFinite(n) && n > 0 ? n : null;
  }

  // 1234.5 -> «1.234,50» (formato venezolano, 2 decimales)
  function formato(n) {
    var s = (Math.round(n * 100 + 1e-9) / 100).toFixed(2).split('.');
    return s[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + s[1];
  }

  function calcular(monto, tasaCobro, tasaCompra) {
    var siCambiaba = monto / tasaCobro;
    var recibio = monto / tasaCompra;
    var diferencia = siCambiaba - recibio;
    return { siCambiaba: siCambiaba, recibio: recibio, diferencia: diferencia, porcentaje: diferencia / siCambiaba * 100, perdio: tasaCompra > tasaCobro };
  }

  var api = { parsear: parsear, formato: formato, calcular: calcular };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }
  raiz.FV_BRECHA = api;
  if (typeof document === 'undefined') return;

  var WA = 'https://wa.me/584244125386?text=';
  function evento(nombre, datos) { if (typeof window.gtag === 'function') window.gtag('event', nombre, datos || {}); }

  function iniciar() {
    var caja = document.querySelector('[data-brecha]');
    if (!caja) return;
    var form = caja.querySelector('[data-brecha-form]');
    var sinJs = caja.querySelector('[data-brecha-sinjs]');
    var res = caja.querySelector('[data-brecha-res]');
    var chip = caja.querySelector('[data-brecha-bcv]');
    var campos = { monto: form.elements.monto, t1: form.elements.t1, t2: form.elements.t2 };
    var NOMBRES = { monto: 'el monto que cobró', t1: 'la tasa del día en que cobró', t2: 'la tasa del día en que compró los dólares' };
    var calculado = false;

    function error(k, msg) {
      var p = document.getElementById('brecha-' + k + '-err');
      p.textContent = msg || '';
      if (msg) campos[k].setAttribute('aria-invalid', 'true'); else campos[k].removeAttribute('aria-invalid');
    }
    function leer() {
      var v = {}, bueno = true;
      Object.keys(campos).forEach(function (k) {
        var crudo = campos[k].value.trim();
        var n = parsear(crudo);
        if (!crudo) { error(k, 'Escriba ' + NOMBRES[k] + '.'); bueno = false; }
        else if (n === null) { error(k, 'Use solo números mayores que cero (por ejemplo 10.000,50).'); bueno = false; }
        else { error(k, ''); v[k] = n; }
      });
      return bueno ? v : null;
    }

    function pintar(v) {
      var r = calcular(v.monto, v.t1, v.t2);
      var dolares = formato(Math.abs(r.diferencia)), pct = formato(Math.abs(r.porcentaje));
      var texto, msg;
      if (r.perdio && r.diferencia > 0) {
        texto = 'Se le fueron ' + dolares + ' dólares (' + pct + ' %) solo por esperar.';
        msg = 'Hola F&V, usé la calculadora de la web: se me fueron ' + dolares + ' dólares (' + pct + ' %) esperando para cambiar. Quiero ordenar eso.';
      } else {
        texto = 'Esta vez no perdió por la tasa. ¿Siempre es así?';
        msg = 'Hola F&V, usé la calculadora de la web y esta vez no perdí por la tasa. Quiero revisar si siempre es así.';
      }
      res.textContent = '';
      var t = document.createElement('p'); t.className = 'ini-brecha-grande'; t.textContent = texto;
      var det = document.createElement('p'); det.className = 'ini-brecha-detalle';
      det.textContent = 'Si hubiera cambiado el día del cobro: ' + formato(r.siCambiaba) + ' dólares. Recibió: ' + formato(r.recibio) + ' dólares.';
      var a = document.createElement('a'); a.className = 'ini-wa btn-primary btn-glow-on-hover'; a.textContent = 'Escribir por WhatsApp';
      a.href = WA + encodeURIComponent(msg); a.target = '_blank'; a.rel = 'noopener';
      a.setAttribute('data-evento', 'inicio_brecha_whatsapp'); a.setAttribute('data-cta', 'inicio_brecha');
      a.addEventListener('click', function () { evento('inicio_brecha_whatsapp', { perdio: r.perdio ? 'si' : 'no' }); });
      res.appendChild(t); res.appendChild(det); res.appendChild(a);
      res.hidden = false;
      return r;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = leer();
      if (!v) { res.hidden = true; res.textContent = ''; var mal = form.querySelector('[aria-invalid="true"]'); if (mal) mal.focus(); return; }
      var r = pintar(v);
      calculado = true;
      evento('inicio_brecha_calculo', { perdio: r.perdio ? 'si' : 'no' });
    });
    // Después del primer cálculo, el resultado se actualiza solo al cambiar un número válido (sin disparar eventos otra vez)
    form.addEventListener('input', function () {
      if (!calculado) return;
      var n1 = parsear(campos.monto.value), n2 = parsear(campos.t1.value), n3 = parsear(campos.t2.value);
      if (n1 && n2 && n3) { Object.keys(campos).forEach(function (k) { error(k, ''); }); pintar({ monto: n1, t1: n2, t2: n3 }); }
      else { res.hidden = true; res.textContent = ''; }
    });

    // Tasa BCV de hoy (solo si llegó en vivo)
    function tasaBcv(est) {
      if (!est || !est.live || !est.rate) return;
      var f = '';
      try { f = new Date(est.fecha).toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Caracas' }); } catch (x) { f = ''; }
      if (chip) chip.textContent = 'Tasa BCV de hoy: ' + formato(est.rate) + (f ? ' (' + f + ')' : '') + ' · fuente: BCV, consultada vía dolarapi';
      if (!campos.t1.value) campos.t1.value = formato(est.rate);
    }
    if (window.FV_BCV) window.FV_BCV.onChange(tasaBcv);

    if (sinJs) sinJs.hidden = true;
    form.hidden = false;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})(typeof window !== 'undefined' ? window : this);
