/* Buscador global (Ctrl/Cmd + K). Compartido por todas las páginas.
   El modal se construye la primera vez que se abre: con el buscador cerrado no hay texto suelto en la página. */
(function () {
  // Para añadir una página al buscador: una línea más en este arreglo.
  var SEARCH_INDEX = [
    { title: 'Inicio', desc: 'Página principal de F&V AI Group.', url: '/', cat: 'Pagina' },
    { title: 'Express', desc: 'Productos para tu negocio y para ti, con precio fijo desde $10.', url: '/express', cat: 'Producto' },
    { title: 'Negocio Visible', desc: 'Google Maps, WhatsApp Business y QR para tu negocio. $35.', url: '/express#negocio-visible', cat: 'Producto' },
    { title: 'Catálogo Express', desc: 'Tu catálogo web con precios en $ y Bs a tasa BCV. $90.', url: '/express#catalogo-express', cat: 'Producto' },
    { title: 'Caja Clara', desc: 'Cuadre de caja diario en Bs, $, Pago Móvil y USDT. $50.', url: '/express#caja-clara', cat: 'Producto' },
    { title: 'Asistente IA de WhatsApp', desc: 'Responde, toma pedidos y citas las 24 horas. Disponible desde noviembre de 2026.', url: '/express#asistente-ia', cat: 'Producto' },
    { title: 'Clase 1:1 de IA', desc: 'Aprende a usar IA con tus propios archivos. $25 por 90 min.', url: '/express#clase-ia', cat: 'Producto' },
    { title: 'Mis Finanzas Claras', desc: 'Tus cuentas personales en Bs, $ y USDT. $10.', url: '/express#mis-finanzas-claras', cat: 'Producto' },
    { title: 'Demo: Catálogo Express', desc: 'Prueba un catálogo funcionando con la tasa BCV del día.', url: '/demo-catalogo', cat: 'Producto' },
    { title: 'Páginas web', desc: 'Catálogo Express $90, Web Express $150, Web Profesional desde $350 y Tienda Online desde $500.', url: '/paginas-web', cat: 'Producto' },
    { title: 'Soluciones', desc: 'Las cuatro líneas con precios publicados: Triangular Express, Triangular, Hexagonal Express y Hexagonal.', url: '/soluciones', cat: 'Pagina' },
    { title: 'Asesoría Estratégica', desc: 'Diagnóstico antes de comprometer presupuesto en ejecución.', url: '/asesoria-estrategica', cat: 'Servicio' },
    { title: 'Evaluación de Procesos', desc: 'Auditoría técnica y financiera de sus procesos actuales.', url: '/evaluacion-procesos', cat: 'Servicio' },
    { title: 'Despliegue y Ejecución', desc: 'Implementación en Dynamics 365 Sales/Customer Service, Odoo Community o desarrollo a medida.', url: '/despliegue-ejecucion', cat: 'Servicio' },
    { title: 'Habilitación de Equipos', desc: 'Formación práctica sobre el sistema real de su empresa.', url: '/habilitacion-equipos', cat: 'Servicio' },
    { title: 'Masterclasses y Workshops', desc: 'Formación estructurada en gestión empresarial e IA aplicada.', url: '/masterclasses-workshops', cat: 'Servicio' },
    { title: 'Acompañamiento Continuo', desc: 'Mantenimiento evolutivo y soporte después del go-live.', url: '/acompanamiento-continuo', cat: 'Servicio' },
    { title: 'Cursos', desc: 'Catálogo de masterclasses y workshops presenciales.', url: '/cursos', cat: 'Pagina' },
    { title: 'Finanzas con IA', desc: 'Curso presencial: automatiza la conciliación de pagos de tu empresa.', url: '/curso-finanzas-ia', cat: 'Curso' },
    { title: 'Nosotros', desc: 'Cómo trabajamos y por qué elegir a F&V.', url: '/nosotros', cat: 'Pagina' },
    { title: 'Contacto', desc: 'WhatsApp directo y diagnóstico gratis de 20 minutos.', url: '/contacto', cat: 'Pagina' },
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
    return SEARCH_INDEX.filter(function (r) { return norm(r.title + ' ' + r.desc).indexOf(n) !== -1; });
  }

  function setActive(i) {
    var items = resultsEl.querySelectorAll('.search-result');
    items.forEach(function (el) { el.classList.remove('is-active'); });
    if (items[i]) { items[i].classList.add('is-active'); items[i].scrollIntoView({ block: 'nearest' }); }
    activeIndex = i;
  }

  function open() {
    build();
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
