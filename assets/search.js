/* Buscador global (Ctrl/Cmd + K). Compartido por todas las páginas.
   El modal se construye la primera vez que se abre: con el buscador cerrado no hay texto suelto en la página. */
(function () {
  // Para añadir una página al buscador: una línea más en este arreglo.
  var SEARCH_INDEX = [
    { title: 'Inicio', desc: 'Página principal de F&V AI Group.', url: '/', cat: 'Pagina' },
    { title: 'Línea Triangular', desc: 'Planes mensuales para emprendedores, comercios y pequeñas empresas, desde $4,99.', url: '/triangular', cat: 'Pagina' },
    { title: 'Línea Hexagonal', desc: 'Para medianas y grandes empresas e instituciones: diagnóstico de $270, formación ejecutiva, asesor financiero con IA, implementación a medida y software.', url: '/hexagonal', cat: 'Pagina' },
    { title: 'Para dueños de empresa: finanzas e IA', desc: 'Diagnóstico de $270, programa ejecutivo entre semana ($270 individual o $180 por persona), formación 1 a 1 ($960) y asesor financiero con IA ($120 o $480 al mes).', url: '/ejecutivos', cat: 'Servicio', kw: 'duenos ejecutivos directivos gerentes programa ejecutivo formacion ejecutiva asesor financiero reportes whatsapp torre trebol martes jueves entre semana' },
    { title: 'Plan Arranque', desc: 'Presencia Catálogo + Caja Clara por una mensualidad. $39,99 al mes.', url: '/triangular#plan-arranque', cat: 'Producto' },
    { title: 'Presencia', desc: 'Google Maps, WhatsApp Business, catálogo con tasa BCV, web y tienda. Desde $14,99 al mes.', url: '/triangular#presencia', cat: 'Producto' },
    { title: 'Caja Clara', desc: 'Cuadre de caja en Bs, $, Pago Móvil y USDT, cobros e inventario. Desde $14,99 al mes.', url: '/triangular#caja-clara', cat: 'Producto' },
    { title: 'Tablero Ejecutivo', desc: 'Tus números clave en una sola pantalla. Desde $79,99 al mes.', url: '/triangular#tablero-ejecutivo', cat: 'Producto' },
    { title: 'Asistente IA de WhatsApp', desc: 'Responde, toma pedidos y citas las 24 horas. Desde $119,99 al mes. Disponible desde noviembre de 2026.', url: '/triangular#asistente-ia', cat: 'Producto' },
    { title: 'Asesor F&V', desc: 'Consultoría por Google Meet con plan de acción por escrito. Desde $29,99.', url: '/triangular#asesor', cat: 'Producto' },
    { title: 'Aprende: talleres y curso', desc: 'IA y finanzas presenciales en Valencia, grupos de máximo 6. Desde $24,99.', url: '/triangular#aprende', cat: 'Producto' },
    { title: 'Mis Finanzas Claras', desc: 'Tus cuentas personales en Bs, $ y USDT. $4,99, pago único.', url: '/triangular#mis-finanzas-claras', cat: 'Producto' },
    { title: 'Software', desc: 'Apps web por mensualidad para clubes, condominios y gimnasios, para organizaciones grandes y pequeñas.', url: '/software', cat: 'Producto' },
    { title: 'Condominio', desc: 'Software para cobrar el condominio a tiempo y mostrar en qué se gasta cada dólar: recibos por alícuota y gastos con facturas. Desde $89,99 al mes para un edificio y desde $190 al mes para administradoras.', url: '/condominio', cat: 'Producto' },
    { title: 'Gym', desc: 'Software para cobrar las membresías de un gimnasio, entrar con código QR y reservar clases. Desde $89,99 al mes para un gimnasio y desde $190 al mes para cadenas.', url: '/gym', cat: 'Producto' },
    { title: 'Club', desc: 'Software para que los clubes cobren y controlen las cuotas de sus socios. Desde $89,99 al mes para clubes pequeños y desde $190 al mes para clubes sociales e instituciones.', url: '/club', cat: 'Producto' },
    { title: 'Demo: Catálogo con tasa BCV', desc: 'Prueba un catálogo funcionando con la tasa BCV del día.', url: '/demo-catalogo', cat: 'Producto' },
    { title: 'Páginas web (Presencia)', desc: 'Catálogo $29,99/mes, Web $59,99/mes y Tienda $99,99/mes, montadas y mantenidas por nosotros.', url: '/paginas-web', cat: 'Producto' },
    { title: 'Diagnóstico «¿En qué se va la plata de su empresa?»', desc: 'Un día presencial en su empresa: revisión de sus números y reportes, informe de dónde se pierde el dinero y plan de acción de 30 días. $270, que se abonan si contrata la implementación.', url: '/asesoria-estrategica', cat: 'Servicio', kw: 'diagnostico asesoria estrategica evaluacion de procesos auditoria margen costos rentabilidad' },
    { title: 'Formación ejecutiva 1 a 1', desc: '8 sesiones de 4 horas de IA aplicada a finanzas y gestión: Claude, reportes, automatizaciones, MCP y APIs explicados para dueños. $960.', url: '/hexagonal#formacion-ejecutiva', cat: 'Curso', kw: 'duenos directivos privado clases ejecutivos' },
    { title: 'Programa ejecutivo entre semana', desc: 'Martes y jueves en la mañana, 10 horas en la oficina de Torre Trébol. $270 individual o $180 por persona en grupo de 2 a 4.', url: '/ejecutivos#programa-ejecutivo', cat: 'Curso', kw: 'entre semana martes jueves no puedo los sabados ejecutivos directivos duenos' },
    { title: 'Asesor financiero con IA', desc: 'Revisión de indicadores, márgenes y alertas para las decisiones del dueño, con reportes cortos por WhatsApp. $120 o $480 al mes.', url: '/hexagonal#asesor-financiero', cat: 'Servicio', kw: 'finanzas kpi indicadores mensual reunion duenos' },
    { title: 'Formación para su equipo', desc: 'Capacitación a medida en las herramientas y sistemas de su empresa.', url: '/hexagonal#formacion-equipo', cat: 'Servicio', kw: 'habilitacion de equipos capacitacion personal empleados' },
    { title: 'Reportes automáticos por WhatsApp', desc: 'Los números de su empresa en su teléfono, sin pedirlos. A medida: se cotiza después del diagnóstico.', url: '/hexagonal#reportes-whatsapp', cat: 'Servicio' },
    { title: 'Despliegue y Ejecución', desc: 'Implementación a medida en Dynamics 365 Sales/Customer Service, Odoo Community o desarrollo propio. Se cotiza después del diagnóstico.', url: '/despliegue-ejecucion', cat: 'Servicio', kw: 'implementacion odoo dynamics erp crm tablero gerencial sprint automatizacion' },
    { title: 'Masterclasses y Workshops', desc: 'Masterclass privada para su empresa ($500 a $700 por sesión) y formación para dueños y equipos.', url: '/masterclasses-workshops', cat: 'Servicio' },
    { title: 'Acompañamiento Continuo', desc: 'Soporte técnico mensual de los sistemas y automatizaciones ya implementados: $200, $400 o Director de IA $600 al mes.', url: '/acompanamiento-continuo', cat: 'Servicio', kw: 'soporte mantenimiento director de ia' },
    { title: 'Cursos', desc: 'Curso Finanzas con IA, talleres y formación para empresas y ejecutivos.', url: '/cursos', cat: 'Pagina' },
    { title: 'Taller: La plata de tu negocio clara', desc: 'Taller presencial de 3 horas en Valencia. $24,99 por persona.', url: '/cursos#fechas', cat: 'Curso', ev: 'taller' },
    { title: 'Finanzas con IA', desc: 'Curso presencial: automatiza la conciliación de pagos de tu empresa.', url: '/cursos#finanzas-con-ia', cat: 'Curso', ev: 'curso' },
    { title: 'Nosotros', desc: 'Cómo trabajamos y por qué elegir a F&V.', url: '/nosotros', cat: 'Pagina' },
    { title: 'Contacto', desc: 'WhatsApp directo y diagnóstico gratis de 20 minutos.', url: '/contacto', cat: 'Pagina' },
    { title: 'Casos de clientes', desc: 'Qué hicimos y qué dijo el cliente. Pregunta por el precio de lanzamiento.', url: '/casos', cat: 'Pagina' },
    { title: 'Calculadora de precios', desc: 'Calcula a cuánto vender en $ y Bs con la tasa BCV del día. Gratis.', url: '/calculadora', cat: 'Pagina' },
    { title: 'Calculadora de ROI', desc: 'Estima cuánto puedes ahorrar automatizando tus procesos.', url: '/calculadora-roi', cat: 'Pagina' },
    { title: 'Política de Privacidad', desc: 'Cómo protegemos tu información.', url: '/privacidad', cat: 'Legal' },
    { title: 'Términos y Condiciones', desc: 'Condiciones de uso del sitio y contratación.', url: '/terminos', cat: 'Legal' }
  ];

  var css = '' +
    '#search-overlay{position:fixed;inset:0;z-index:200;display:flex;background:rgba(0,0,0,.7);backdrop-filter:blur(4px);align-items:flex-start;justify-content:center;padding:12vh 1.5rem 2rem;opacity:0;visibility:hidden;pointer-events:none;transition:opacity .2s cubic-bezier(.23,1,.32,1),visibility 0s linear .2s}' +
    '#search-overlay.is-open{opacity:1;visibility:visible;pointer-events:auto;transition:opacity .2s cubic-bezier(.23,1,.32,1)}' +
    '#search-panel{width:100%;max-width:560px;background:#0D0E12;border:1px solid #1F232B;border-radius:16px;box-shadow:0 0 0 1px rgba(0,255,255,.08),0 20px 60px rgba(0,0,0,.6);overflow:hidden;max-height:70vh;display:flex;flex-direction:column;transform:scale(.96);transition:transform .2s cubic-bezier(.23,1,.32,1)}' +
    '#search-overlay.is-open #search-panel{transform:scale(1)}' +
    '#search-input-row{display:flex;align-items:center;gap:10px;padding:16px 18px;border-bottom:1px solid #1F232B}' +
    '#search-input{flex:1;background:transparent;border:none;outline:none;color:#fff;font-size:15px;font-family:Geist,sans-serif}' +
    '#search-input::placeholder{color:#94a3b8}' +
    '#search-results{overflow-y:auto;padding:8px}' +
    '.search-result{display:flex;flex-direction:column;gap:2px;padding:10px 12px;border-radius:10px;cursor:pointer;text-decoration:none}' +
    '.search-result:hover,.search-result.is-active{background:rgba(0,204,255,.08)}' +
    '.search-result .sr-title{color:#fff;font-family:"Space Grotesk",sans-serif;font-size:14px;display:flex;align-items:center;gap:8px}' +
    '.search-result .sr-desc{color:#94a3b8;font-size:12.5px}' +
    '.sr-tag{font-size:10px;padding:1px 7px;border-radius:999px;font-family:"Space Grotesk",sans-serif;text-transform:uppercase;letter-spacing:.03em}' +
    '.sr-tag.cat-Servicio{background:rgba(0,255,255,.1);color:#00FFFF}.sr-tag.cat-Curso{background:rgba(255,140,0,.12);color:#FF8C00}' +
    '.sr-tag.cat-Pagina{background:rgba(255,255,255,.08);color:#94a3b8}.sr-tag.cat-Legal{background:rgba(255,255,255,.06);color:#94a3b8}' +
    '.sr-tag.cat-Producto{background:rgba(74,222,128,.12);color:#4ade80}' +
    '#search-empty{padding:28px 18px;text-align:center;color:#94a3b8;font-size:13px}' +
    '#search-hint-row{display:flex;gap:14px;padding:10px 18px;border-top:1px solid #1F232B;font-size:11px;color:#94a3b8;font-family:"Space Grotesk",sans-serif}' +
    '#search-hint-row kbd{background:rgba(255,255,255,.06);padding:1px 5px;border-radius:4px;border:1px solid rgba(255,255,255,.08)}' +
    '@media (prefers-reduced-motion:reduce){#search-overlay,#search-panel{transition:none!important}}';

  var overlay, input, resultsEl, lastFocus, activeIndex = -1, currentResults = [];

  function esc(t) { return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function norm(t) { return String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim(); }

  function build() {
    if (overlay) return;
    var st = document.createElement('style');
    st.id = 'fv-search-css';
    st.textContent = css;
    document.head.appendChild(st);
    overlay = document.createElement('div');
    overlay.id = 'search-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Buscar en el sitio');
    overlay.innerHTML =
      '<div id="search-panel">' +
        '<div id="search-input-row">' +
          '<svg class="w-4 h-4 text-slate-400 shrink-0" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 10.5A6.5 6.5 0 114 10.5a6.5 6.5 0 0113 0z"/></svg>' +
          '<input id="search-input" type="text" placeholder="Buscar productos, servicios, páginas..." autocomplete="off" aria-label="Buscar en el sitio">' +
        '</div>' +
        '<div id="search-results"></div>' +
        '<div id="search-hint-row"><span><kbd>&uarr;</kbd><kbd>&darr;</kbd> navegar</span><span><kbd>&crarr;</kbd> abrir</span><span><kbd>Esc</kbd> cerrar</span></div>' +
      '</div>';
    document.body.appendChild(overlay);
    input = overlay.querySelector('#search-input');
    resultsEl = overlay.querySelector('#search-results');
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    input.addEventListener('input', function () { render(filter(input.value)); });
    resultsEl.addEventListener('mouseover', function (e) {
      var el = e.target.closest('.search-result');
      if (el) setActive(parseInt(el.dataset.i, 10));
    });
  }

  function render(list) {
    currentResults = list;
    activeIndex = list.length ? 0 : -1;
    if (!list.length) {
      resultsEl.innerHTML = '<div id="search-empty">Sin resultados. <a href="https://wa.me/584244125386?text=' + encodeURIComponent('Hola F&V, busqué algo en el sitio y no lo encontré') + '" target="_blank" rel="noopener" class="link-underline text-fv-cyan">Escríbenos por WhatsApp</a> y te ayudamos directo.</div>';
      return;
    }
    resultsEl.innerHTML = list.map(function (r, i) {
      return '<a href="' + esc(r.url) + '" class="search-result' + (i === 0 ? ' is-active' : '') + '" data-i="' + i + '">' +
        '<span class="sr-title">' + esc(r.title) + ' <span class="sr-tag cat-' + esc(r.cat) + '">' + esc(r.cat) + '</span></span>' +
        '<span class="sr-desc">' + esc(r.desc) + '</span></a>';
    }).join('');
  }

  function filter(q) {
    var n = norm(q);
    if (!n) return SEARCH_INDEX;
    return SEARCH_INDEX.filter(function (r) { return norm(r.title + ' ' + r.desc + ' ' + (r.kw || '')).indexOf(n) !== -1; });
  }

  function setActive(i) {
    var items = resultsEl.querySelectorAll('.search-result');
    items.forEach(function (el) { el.classList.remove('is-active'); });
    if (items[i]) { items[i].classList.add('is-active'); items[i].scrollIntoView({ block: 'nearest' }); }
    activeIndex = i;
  }

  // Fechas de talleres y cursos: se leen de assets/eventos.js (FV_EVENTOS) al abrir el buscador.
  // El texto fijo del índice no lleva fechas, para que nunca anuncie una fecha pasada.
  function fechasEventos() {
    var E = window.FV_EVENTOS;
    SEARCH_INDEX.forEach(function (r) {
      if (!r.ev) return;
      if (r.base === undefined) r.base = r.desc;
      var e = E && E.proximas ? E.proximas().filter(function (x) { return x.tipo === r.ev; })[0] : null;
      r.desc = r.base + ' ' + (e ? 'Próxima fecha: ' + e.texto + '.' : (E && E.sinFechas ? E.sinFechas : 'Próximas fechas: escríbenos por WhatsApp') + '.');
    });
  }

  function open() {
    build();
    fechasEventos();
    lastFocus = document.activeElement;
    overlay.classList.add('is-open');
    input.value = '';
    render(SEARCH_INDEX);
    setTimeout(function () { input.focus(); }, 30);
  }
  function close() {
    if (!overlay) return;
    overlay.classList.remove('is-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function isOpen() { return overlay && overlay.classList.contains('is-open'); }

  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key && e.key.toLowerCase() === 'k') { e.preventDefault(); isOpen() ? close() : open(); return; }
    if (!isOpen()) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(Math.min(activeIndex + 1, currentResults.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive(Math.max(activeIndex - 1, 0)); }
    if (e.key === 'Enter' && currentResults[activeIndex]) { window.location.href = currentResults[activeIndex].url; }
    if (e.key === 'Tab') { e.preventDefault(); input.focus(); }
  });

  // Botón del encabezado: la etiqueta del atajo se escribe aquí, no en el HTML.
  var trigger = document.getElementById('search-trigger');
  if (trigger) trigger.addEventListener('click', open);
  var mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  document.querySelectorAll('[data-kbd]').forEach(function (el) { el.textContent = mac ? '⌘ K' : 'Ctrl K'; });
})();
