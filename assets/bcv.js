/* Tasa BCV del día (API pública DolarApi). Compartido por todas las páginas con precios en Bs.
   Nunca deja el chip vacío ni muestra "NaN": tasa en vivo -> última tasa guardada ("tasa del [fecha]") -> enlace a WhatsApp.

   Estados:
     cargando    skeleton del ancho del número en el chip y en cada monto en Bs (si ya hay una tasa guardada se muestra al instante, marcada con su fecha)
     en vivo     la tasa llegó: los montos aparecen con un fundido suave
     guardada    la API falló pero hay una tasa guardada: se muestra "tasa del [fecha]" y un enlace para confirmar la de hoy por WhatsApp
     sin datos   no hay ni API ni tasa guardada: se ocultan los montos en Bs y el chip lleva a WhatsApp

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
  var state = { rate: null, fecha: null, live: false, cargando: true };
  var listeners = [];
  var reveladas = []; // contenedores [data-bs-wrap] que se mostraron con skeleton (si no llega tasa, vuelven a ocultarse)

  function money(n) { return 'Bs ' + fmt.format(Math.round(n * 100 + 1e-6) / 100); }
  function dateText(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return '';
    return d.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Caracas' });
  }
  function fade(el) { el.classList.add('fade-in'); setTimeout(function () { el.classList.remove('fade-in'); }, 320); }
  var DOT_VIVO = '<span class="relative flex h-2 w-2 shrink-0"><span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--acento-1)] opacity-60 motion-reduce:animate-none"></span><span class="relative inline-flex h-2 w-2 rounded-full bg-[color:var(--acento-1)]"></span></span>';
  var SKEL = function (t) { return '<span class="skeleton skeleton-texto" aria-hidden="true">' + t + '</span>'; };

  function chipHTML() {
    var f = state.fecha ? dateText(state.fecha) : '';
    if (state.rate && state.live) {
      return DOT_VIVO + '<span>Tasa BCV de hoy: <strong class="text-white font-semibold">' + money(state.rate) + '</strong>' + (f ? ' <span class="text-slate-400">· ' + f + '</span>' : '') + '</span>';
    }
    if (state.rate && state.cargando) { // tasa guardada mientras llega la nueva
      return '<span class="spinner-sm text-slate-400" aria-hidden="true"></span><span>Tasa BCV' + (f ? ' del ' + f : '') + ': <strong class="text-white font-semibold">' + money(state.rate) + '</strong> <span class="text-slate-400">· actualizando…</span></span>';
    }
    if (state.rate) { // la API no respondió: última tasa guardada
      return '<span class="inline-flex h-2 w-2 shrink-0 rounded-full bg-[color:var(--acento-2)]"></span>' +
        '<span>Tasa BCV' + (f ? ' del ' + f : ' guardada') + ': <strong class="text-white font-semibold">' + money(state.rate) + '</strong> ' +
        '<a href="' + WA + '" target="_blank" rel="noopener" class="link-underline text-[color:var(--acento-1)]">Confirma la de hoy por WhatsApp</a></span>';
    }
    if (state.cargando) return SKEL('Tasa BCV de hoy: Bs 000,00 · 00/00/0000') + '<span class="fv-sr-only">Cargando la tasa BCV…</span>';
    return '<span class="inline-flex h-2 w-2 shrink-0 rounded-full bg-slate-500"></span>' +
      '<a href="' + WA + '" target="_blank" rel="noopener" class="link-underline text-[color:var(--acento-1)]">Consulta la tasa del día por WhatsApp</a>';
  }

  // Cada monto en Bs: skeleton mientras no hay tasa (el contenedor se muestra con el tamaño reservado)
  function mostrarCarga() {
    document.querySelectorAll('[data-usd]').forEach(function (el) {
      if (isNaN(parseFloat(el.getAttribute('data-usd')))) return;
      var wrap = el.hasAttribute('data-bs-wrap') ? el : el.closest('[data-bs-wrap]');
      if (wrap && wrap.classList.contains('hidden')) { wrap.classList.remove('hidden'); reveladas.push(wrap); }
      if (el.hasAttribute('data-bs-line')) el.innerHTML = (el.getAttribute('data-bs-prefix') || '') + SKEL('Bs 00.000,00') + ' a la tasa BCV del día';
      else el.innerHTML = SKEL('Bs 00.000,00');
      el.setAttribute('aria-busy', 'true');
    });
  }
  function ocultarSinDatos() {
    reveladas.forEach(function (w) { w.classList.add('hidden'); w.querySelectorAll('[data-usd]').forEach(function (e) { e.textContent = ''; }); if (w.hasAttribute('data-usd')) w.textContent = ''; });
    reveladas = [];
    document.querySelectorAll('[data-usd]').forEach(function (e) { e.removeAttribute('aria-busy'); });
  }

  function render(primera) {
    document.querySelectorAll('[data-bcv-chip]').forEach(function (el) {
      el.innerHTML = chipHTML(); el.classList.remove('hidden');
      el.setAttribute('aria-live', 'polite'); if (state.cargando) el.setAttribute('aria-busy', 'true'); else { el.removeAttribute('aria-busy'); fade(el); }
    });
    if (!state.rate) { if (!state.cargando) ocultarSinDatos(); return; }
    var nota = state.live || !state.fecha ? ' a la tasa BCV del día' : ' a la tasa del ' + dateText(state.fecha);
    document.querySelectorAll('[data-usd]').forEach(function (el) {
      var usd = parseFloat(el.getAttribute('data-usd'));
      if (isNaN(usd) || el.hasAttribute('data-bs-line')) return;
      el.textContent = money(usd * state.rate); el.removeAttribute('aria-busy'); if (!primera) fade(el);
    });
    // Líneas "Bs … a la tasa BCV del día" completas: sin JS no queda ningún fragmento suelto en la página.
    document.querySelectorAll('[data-bs-line]').forEach(function (el) {
      var usd = parseFloat(el.getAttribute('data-usd'));
      if (isNaN(usd)) return;
      var pre = el.getAttribute('data-bs-prefix') || '';
      el.innerHTML = pre + '<span class="font-head font-medium text-[color:var(--acento-1)]">' + money(usd * state.rate) + '</span>' + nota;
      el.removeAttribute('aria-busy'); if (!primera) fade(el);
    });
    document.querySelectorAll('[data-bcv-rate]').forEach(function (el) { el.textContent = money(state.rate); });
    document.querySelectorAll('[data-bcv-date]').forEach(function (el) { el.textContent = state.fecha ? dateText(state.fecha) : ''; });
    document.querySelectorAll('[data-bs-wrap]').forEach(function (el) { el.classList.remove('hidden'); });
    reveladas = [];
    listeners.forEach(function (fn) { try { fn(state); } catch (e) {} });
  }

  function set(rate, fecha, live) {
    state.rate = rate; state.fecha = fecha; state.live = live;
    render();
  }

  window.FV_BCV = {
    get: function () { return { rate: state.rate, fecha: state.fecha, live: state.live }; },
    onChange: function (fn) { listeners.push(fn); if (state.rate) fn(state); },
    money: money
  };

  function start() {
    // 1) Respaldo inmediato desde localStorage (se marca con su fecha hasta que responda la API); si no hay, skeletons.
    var guardada = false;
    try {
      var c = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (c && c.rate > 0) { state.rate = c.rate; state.fecha = c.fecha; state.live = false; guardada = true; }
    } catch (e) {}
    state.cargando = true;
    if (!guardada) mostrarCarga();
    render(true);
    // 2) Tasa en vivo.
    var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 8000) : null;
    fetch(API, { cache: 'no-store', signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (d) {
        if (!d || !(d.promedio > 0)) return Promise.reject('sin datos');
        state.cargando = false; set(d.promedio, d.fechaActualizacion, true);
        try { localStorage.setItem(KEY, JSON.stringify({ rate: d.promedio, fecha: d.fechaActualizacion, ts: Date.now() })); } catch (e) {}
      })
      .catch(function () { state.cargando = false; render(); }) // se queda la tasa guardada (con su fecha) o, sin ninguna, el enlace a WhatsApp
      .then(function () { if (timer) clearTimeout(timer); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
