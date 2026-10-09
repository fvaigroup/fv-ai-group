/* Tasa BCV del día (API pública DolarApi). Compartido por todas las páginas con precios en Bs.
   Nunca deja el chip vacío: tasa en vivo -> última tasa guardada (con su fecha) -> enlace a WhatsApp.

   Marcado que entiende:
     [data-bcv-chip]       contenedor del chip "Tasa BCV de hoy" (el HTML trae el texto de respaldo para quien no tiene JS)
     [data-bcv-rate]       se llena con "Bs 874,73"
     [data-bcv-date]       se llena con la fecha de la tasa (dd/mm/aaaa)
     [data-usd="35"]       se llena con el equivalente en Bs ("Bs 30.615,62")
     [data-bs-wrap]        contenedor que empieza con la clase "hidden" y se muestra solo si hay tasa
   Otras páginas pueden leer la tasa con window.FV_BCV.get() o suscribirse con window.FV_BCV.onChange(fn). */
(function () {
  var API = 'https://ve.dolarapi.com/v1/dolares/oficial';
  var KEY = 'fv_bcv';
  var WA = 'https://wa.me/584244125386?text=' + encodeURIComponent('Hola F&V, ¿cuál es la tasa BCV de hoy?');
  var fmt = new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var state = { rate: null, fecha: null, live: false };
  var listeners = [];

  function money(n) { return 'Bs ' + fmt.format(Math.round(n * 100 + 1e-6) / 100); }
  function dateText(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return '';
    return d.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Caracas' });
  }

  function chipHTML() {
    if (state.rate && state.live) {
      return '<span class="relative flex h-2 w-2 shrink-0"><span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-fv-triGreen opacity-60 motion-reduce:animate-none"></span><span class="relative inline-flex h-2 w-2 rounded-full bg-fv-triGreen"></span></span>' +
        '<span>Tasa BCV de hoy: <strong class="text-white font-semibold">' + money(state.rate) + '</strong>' + (state.fecha ? ' <span class="text-slate-400">· ' + dateText(state.fecha) + '</span>' : '') + '</span>';
    }
    if (state.rate) {
      return '<span class="inline-flex h-2 w-2 shrink-0 rounded-full bg-fv-orange"></span>' +
        '<span>Última tasa BCV conocida: <strong class="text-white font-semibold">' + money(state.rate) + '</strong> <span class="text-slate-400">· ' + dateText(state.fecha) + '</span> ' +
        '<a href="' + WA + '" target="_blank" rel="noopener" class="link-underline text-fv-cyan">Confirma la de hoy por WhatsApp</a></span>';
    }
    return '<span class="inline-flex h-2 w-2 shrink-0 rounded-full bg-slate-500"></span>' +
      '<a href="' + WA + '" target="_blank" rel="noopener" class="link-underline text-fv-cyan">Consulta la tasa del día por WhatsApp</a>';
  }

  function render() {
    document.querySelectorAll('[data-bcv-chip]').forEach(function (el) { el.innerHTML = chipHTML(); el.classList.remove('hidden'); });
    if (!state.rate) return;
    document.querySelectorAll('[data-usd]').forEach(function (el) {
      var usd = parseFloat(el.getAttribute('data-usd'));
      if (!isNaN(usd)) el.textContent = money(usd * state.rate);
    });
    // Líneas "Bs … a la tasa BCV del día" completas: sin JS no queda ningún fragmento suelto en la página.
    document.querySelectorAll('[data-bs-line]').forEach(function (el) {
      var usd = parseFloat(el.getAttribute('data-usd'));
      if (isNaN(usd)) return;
      var pre = el.getAttribute('data-bs-prefix') || '';
      el.innerHTML = pre + '<span class="font-head font-medium text-fv-triGreen">' + money(usd * state.rate) + '</span> a la tasa BCV del día';
    });
    document.querySelectorAll('[data-bcv-rate]').forEach(function (el) { el.textContent = money(state.rate); });
    document.querySelectorAll('[data-bcv-date]').forEach(function (el) { el.textContent = state.fecha ? dateText(state.fecha) : ''; });
    document.querySelectorAll('[data-bs-wrap]').forEach(function (el) { el.classList.remove('hidden'); });
    listeners.forEach(function (fn) { try { fn(state); } catch (e) {} });
  }

  function set(rate, fecha, live) {
    state = { rate: rate, fecha: fecha, live: live };
    render();
  }

  window.FV_BCV = {
    get: function () { return { rate: state.rate, fecha: state.fecha, live: state.live }; },
    onChange: function (fn) { listeners.push(fn); if (state.rate) fn(state); },
    money: money
  };

  function start() {
    // 1) Respaldo inmediato desde localStorage (se marca como "última conocida" hasta que responda la API).
    try {
      var c = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (c && c.rate > 0) set(c.rate, c.fecha, false); else render();
    } catch (e) { render(); }
    // 2) Tasa en vivo.
    var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 8000) : null;
    fetch(API, { cache: 'no-store', signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (d) {
        if (!d || !(d.promedio > 0)) return;
        set(d.promedio, d.fechaActualizacion, true);
        try { localStorage.setItem(KEY, JSON.stringify({ rate: d.promedio, fecha: d.fechaActualizacion, ts: Date.now() })); } catch (e) {}
      })
      .catch(function () { /* se queda el respaldo ya renderizado */ })
      .then(function () { if (timer) clearTimeout(timer); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
