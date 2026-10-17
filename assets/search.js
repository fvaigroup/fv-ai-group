/* Buscador global (Ctrl/Cmd + K). Compartido por todas las páginas.
   El modal se construye la primera vez que se abre: con el buscador cerrado no hay texto suelto en la página.
   El índice sigue el catálogo (data/catalogo.json): /servicios y /productos, sus 10 categorías (con ancla), los 19 servicios y los
   15 productos, cada uno con la url de su página de detalle. Hexagonal (servicios, lo grande) va antes que Triangular cuando empatan.
   En los textos solo se usa la forma de cada línea o «empresas e instituciones» / «negocios pequeños», nunca el nombre de la línea. */
(function () {
  // Para añadir una página al buscador: una línea más en este arreglo.
  var SEARCH_INDEX = [
    { title: 'Inicio', desc: 'Servicios para empresas e instituciones y productos para negocios pequeños.', url: '/', cat: 'Pagina' },
    { title: 'Servicios', desc: 'Servicio: el equipo de F&V trabaja con usted, en su empresa o con su equipo.', url: '/servicios', cat: 'Pagina', kw: 'precios cuanto cuesta tarifas catalogo a la medida empresas instituciones' },
    { title: 'Productos', desc: 'Producto: listo para usar, con el mismo precio y la misma entrega para todos.', url: '/productos', cat: 'Pagina', kw: 'precios cuanto cuesta tarifas catalogo precio fijo negocios pequenos emprendedores' },
    { title: 'Para dueños de empresa: finanzas e IA', desc: 'Diagnóstico de $270, programa ejecutivo ($270 o $180 por persona), formación 1 a 1 ($960) y asesor financiero con IA ($120 o $480 al mes).', url: '/ejecutivos', cat: 'Servicio', kw: 'duenos ejecutivos directivos gerentes programa ejecutivo formacion ejecutiva asesor financiero reportes whatsapp torre trebol martes jueves entre semana' },
    { title: 'Diagnóstico y consultoría', desc: 'Empiece por saber en qué se va la plata de su empresa.', url: '/servicios#diagnostico', cat: 'Servicio', grupo: true },
    { title: 'Diagnóstico «¿En qué se va la plata de su empresa?»', desc: 'Un día en su empresa para saber dónde se pierde el dinero. $270, que se abonan si contrata la implementación.', url: '/servicios/diagnostico', cat: 'Servicio', kw: 'diagnostico consultoria estrategica auditoria margen costos rentabilidad 270' },
    { title: 'Implementación y automatización', desc: 'Tableros, reportes y sistemas hechos a la medida de su empresa. Se cotizan después del diagnóstico.', url: '/servicios#implementacion', cat: 'Servicio', grupo: true },
    { title: 'Tablero Gerencial', desc: 'Ventas, caja, cobranza y margen en un solo lugar, al día. A medida, desde $600; precio final después del diagnóstico.', url: '/servicios/tablero-gerencial', cat: 'Servicio', kw: 'tablero dashboard indicadores implementacion' },
    { title: 'Reportes automáticos por WhatsApp', desc: 'Ventas, caja, cobranza y margen en su WhatsApp, sin abrir ningún sistema. A medida.', url: '/servicios/reportes-whatsapp', cat: 'Servicio', kw: 'reportes automaticos informes implementacion' },
    { title: 'Conciliación Automática', desc: 'Cruce diario de Pago Móvil, Zelle, USDT y banco contra ventas. A medida, desde $900; precio final después del diagnóstico.', url: '/servicios/conciliacion-automatica', cat: 'Servicio', kw: 'conciliacion pago movil zelle usdt banco implementacion' },
    { title: 'Web Corporativa + CRM', desc: 'Cada contacto de su web queda registrado y recibe respuesta automática. A medida, desde $900; precio final después del diagnóstico.', url: '/servicios/web-corporativa-crm', cat: 'Servicio', kw: 'pagina web crm contactos implementacion' },
    { title: 'Agente de IA a medida', desc: 'Un asistente para WhatsApp o su web que responde con la información de su empresa. A medida, desde $1.000 + mensualidad; precio final después del diagnóstico.', url: '/servicios/agente-ia', cat: 'Servicio', kw: 'asistente chatbot whatsapp implementacion' },
    { title: 'Sprint de Automatización', desc: 'Un proceso de punta a punta automatizado, probado y documentado. A medida, desde $800; precio final después del diagnóstico.', url: '/servicios/sprint-automatizacion', cat: 'Servicio', kw: 'automatizacion proceso implementacion' },
    { title: 'Implementación Odoo Community', desc: 'Configuración, migración de datos y capacitación, por fases. A medida, desde $2.000; precio final después del diagnóstico.', url: '/servicios/odoo-community', cat: 'Servicio', kw: 'erp implementacion sistema' },
    { title: 'Ecosistema de Automatización', desc: 'Tres o más procesos automatizados y un tablero, todo conectado. A medida, desde $2.500; precio final después del diagnóstico.', url: '/servicios/ecosistema-automatizacion', cat: 'Servicio', kw: 'automatizaciones tablero implementacion' },
    { title: 'Dynamics 365 Sales / Customer Service', desc: 'Implementación de ventas y servicio al cliente, por fases. A medida, desde $3.000 + licencias; precio final después del diagnóstico.', url: '/servicios/dynamics-365', cat: 'Servicio', kw: 'crm ventas servicio al cliente implementacion microsoft' },
    { title: 'Desarrollo a medida', desc: 'Portal de clientes, app interna o app de condominios. A medida, desde $3.000; precio final después del diagnóstico.', url: '/servicios/desarrollo-a-medida', cat: 'Servicio', kw: 'app portal clientes condominios software propio implementacion' },
    { title: 'Formación', desc: 'Para usted y su equipo, con sus propios números y herramientas.', url: '/servicios#formacion', cat: 'Servicio', grupo: true },
    { title: 'Formación ejecutiva 1 a 1', desc: 'IA aplicada a las finanzas y la gestión de su empresa, explicada para dueños. $960.', url: '/servicios/formacion-ejecutiva', cat: 'Curso', kw: 'duenos directivos privado clases ejecutivos curso 960' },
    { title: 'Formación para su equipo', desc: 'Capacitación práctica de su equipo sobre sus propias herramientas y sistemas. A medida.', url: '/servicios/formacion-equipo', cat: 'Curso', kw: 'habilitacion capacitacion personal empleados curso' },
    { title: 'Masterclass privada', desc: 'IA aplicada al trabajo de su empresa, para hasta 8 personas. $500 a $700 por sesión.', url: '/servicios/masterclass-privada', cat: 'Curso', kw: 'masterclasses workshops taller privado curso' },
    { title: 'Finanzas con IA en su sede', desc: 'El curso de conciliación de pagos con IA, en sus oficinas. $600 por grupo de hasta 6.', url: '/servicios/finanzas-ia-sede', cat: 'Curso', kw: 'curso conciliacion de pagos en sus oficinas' },
    { title: 'Acompañamiento y asesoría', desc: 'Alguien de confianza para sus finanzas y para que lo implementado siga funcionando.', url: '/servicios#acompanamiento', cat: 'Servicio', grupo: true },
    { title: 'Acompañamiento Continuo', desc: 'Soporte técnico mensual de lo ya implementado, en tres niveles: Estándar, Prioritario y Director de IA. Desde $200 al mes.', url: '/servicios/acompanamiento', cat: 'Servicio', kw: 'acompanamiento continuo soporte mantenimiento mensual' },
    { title: 'Asesor financiero con IA', desc: 'Revisión mensual de sus indicadores, márgenes y alertas, con reportes cortos por WhatsApp. $120 o $480 al mes.', url: '/servicios/asesor-financiero', cat: 'Servicio', kw: 'asesor asesoria finanzas kpi indicadores mensual reunion duenos 120 480' },
    { title: 'Acompañamiento Estándar', desc: 'Soporte técnico de lo ya implementado: 8 horas al mes, respuesta el mismo día. $200 al mes.', url: '/servicios/acompanamiento#estandar', cat: 'Servicio', kw: 'acompanamiento continuo soporte mantenimiento 200' },
    { title: 'Acompañamiento Prioritario', desc: 'Soporte técnico de lo ya implementado: 18 horas al mes, respuesta en 4 horas. $400 al mes.', url: '/servicios/acompanamiento#prioritario', cat: 'Servicio', kw: 'acompanamiento continuo soporte mantenimiento 400' },
    { title: 'Director de IA a tiempo parcial', desc: 'Soporte técnico y rumbo de sus sistemas: 16 horas al mes y una reunión semanal. $600 al mes.', url: '/servicios/acompanamiento#director-ia', cat: 'Servicio', kw: 'acompanamiento continuo soporte director de inteligencia artificial 600' },
    { title: 'Software', desc: 'Club, Condominio y Gym: cobro de cuotas, control y reportes para su organización.', url: '/productos#software', cat: 'Producto', grupo: true },
    { title: 'Club para empresas e instituciones', desc: 'Cobro de cuotas, estado de cuenta, carnet digital y reportes para la junta directiva. Desde $190/mes.', url: '/club', cat: 'Producto', kw: 'club clubes cuotas socios junta directiva software app' },
    { title: 'Condominio para empresas e instituciones', desc: 'Recibos, alícuotas, transparencia de gastos y varios edificios en una sola pantalla. Desde $190/mes.', url: '/condominio', cat: 'Producto', kw: 'condominio edificio alicuota recibos administradora junta software app' },
    { title: 'Gym para empresas e instituciones', desc: 'Membresías, cobros, entrada con QR y reportes por sede. Desde $190/mes.', url: '/gym', cat: 'Producto', kw: 'gimnasio membresias qr cadena sedes software app' },
    { title: 'Club para negocios pequeños', desc: 'Cobra las cuotas de tus socios sin perseguir a nadie. Desde $89,99/mes.', url: '/club', cat: 'Producto', kw: 'club clubes cuotas socios software app' },
    { title: 'Condominio para negocios pequeños', desc: 'Recibos claros y gastos a la vista de tus vecinos. Desde $89,99/mes.', url: '/condominio', cat: 'Producto', kw: 'condominio edificio alicuota recibos software app' },
    { title: 'Gym para negocios pequeños', desc: 'Membresías, cobros y entrada con código QR para tus miembros. Desde $89,99/mes.', url: '/gym', cat: 'Producto', kw: 'gimnasio membresias qr software app' },
    { title: 'Cursos y programas', desc: 'Con fechas y cupos limitados.', url: '/productos#cursos', cat: 'Producto', grupo: true },
    { title: 'Programa ejecutivo entre semana', desc: 'Aprenda a ver sus números con IA y a recibir sus reportes por WhatsApp. $270 individual o $180 por persona en grupo de 2 a 4.', url: '/ejecutivos#programa-ejecutivo', cat: 'Curso', kw: 'entre semana martes jueves ejecutivos directivos duenos torre trebol curso 270 180' },
    { title: 'Finanzas con IA', desc: 'Ve tu dinero claro en varias tasas y pídele a la IA el trabajo pesado. ', url: '/curso-finanzas-ia', cat: 'Curso', ev: 'curso', kw: 'curso finanzas con ia sabados cohorte cupos certificado conciliacion' },
    { title: 'Taller «La plata de tu negocio clara»', desc: 'Taller presencial de 3 horas en Valencia para ordenar la plata de tu negocio. ', url: '/productos/taller-plata-clara', cat: 'Curso', ev: 'taller', kw: 'taller plata de tu negocio sabado cupos' },
    { title: 'Para empezar', desc: 'Lo básico para que te encuentren, te compren y sepas cuánto ganas.', url: '/productos#para-empezar', cat: 'Producto', grupo: true },
    { title: 'Plan Arranque', desc: 'Lo básico para que te encuentren, te compren por WhatsApp y sepas cuánto ganas. $39,99 al mes.', url: '/productos/plan-arranque', cat: 'Producto', kw: 'paquete pack presencia caja clara arranque' },
    { title: 'Mis Finanzas Claras', desc: 'Tu hoja personal de cuentas en Bs, $ y USDT, lista para copiar. $4,99.', url: '/productos/mis-finanzas-claras', cat: 'Producto', kw: 'finanzas personales hoja de cuentas' },
    { title: 'Presencia y web', desc: 'Que te encuentren en Google Maps, te escriban por WhatsApp y tengas tu web.', url: '/productos#presencia', cat: 'Producto', grupo: true },
    { title: 'Presencia', desc: 'Tu negocio en Google Maps, WhatsApp Business y la web, siempre al día. Desde $14,99 al mes.', url: '/paginas-web', cat: 'Producto', kw: 'google maps whatsapp business catalogo web tienda online pagina web paginas web dominio qr' },
    { title: 'Control y finanzas', desc: 'Cuadra tu caja y mira tus números clave en una sola pantalla.', url: '/productos#control', cat: 'Producto', grupo: true },
    { title: 'Caja Clara', desc: 'Cuadre de caja en Bs, $, Pago Móvil y USDT, con tasa BCV automática. Desde $14,99 al mes.', url: '/productos/caja-clara', cat: 'Producto', kw: 'caja cuadre cobros cuentas por cobrar inventario cotizador tasa bcv' },
    { title: 'Tablero Ejecutivo', desc: 'Un tablero con tus números clave: ventas, gastos, margen, cobros y lo más vendido. Desde $79,99 al mes.', url: '/productos/tablero-ejecutivo', cat: 'Producto', kw: 'tablero dashboard indicadores numeros clave' },
    { title: 'Ventas y atención', desc: 'Responde a tus clientes por WhatsApp sin estar pegado al teléfono.', url: '/productos#ventas', cat: 'Producto', grupo: true },
    { title: 'Asistente IA de WhatsApp', desc: 'Asistente que responde precios, horarios y ubicación, toma pedidos y te pasa lo difícil. Desde $119,99 al mes.', url: '/productos/asistente-ia', cat: 'Producto', kw: 'asistente chatbot whatsapp citas pedidos instagram automatico' },
    { title: 'Demo: Catálogo con tasa BCV', desc: 'Prueba un catálogo funcionando con la tasa BCV del día.', url: '/demo-catalogo', cat: 'Producto', kw: 'presencia catalogo menu digital demo' },
    { title: 'Nosotros', desc: 'Cómo trabajamos y por qué elegir a F&V.', url: '/nosotros', cat: 'Pagina' },
    { title: 'Contacto', desc: 'WhatsApp directo y diagnóstico gratis de 20 minutos.', url: '/contacto', cat: 'Pagina', kw: 'consulta gratis agendar cita llamada whatsapp telefono direccion mapa' },
    { title: 'Casos de clientes', desc: 'Qué hicimos y qué dijo el cliente. Pregunta por el precio de lanzamiento.', url: '/casos', cat: 'Pagina' },
    { title: 'Calculadora de precios', desc: 'Calcula a cuánto vender en $ y Bs con la tasa BCV del día. Gratis.', url: '/calculadora', cat: 'Pagina', kw: 'precio margen tasa bcv' },
    { title: 'Calculadora de ROI', desc: 'Estima cuánto puedes ahorrar automatizando tus procesos.', url: '/calculadora-roi', cat: 'Pagina', kw: 'ahorro retorno automatizacion' },
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

  // Todas las palabras de la búsqueda deben aparecer. Puntaje: en el título 3 (al inicio) o 2, en las palabras clave 1,5, en la descripción 1.
  // Los empates conservan el orden del índice (servicios, que son Hexagonal, antes que productos Triangular).
  function filter(q) {
    var palabras = norm(q).split(/\s+/).filter(Boolean);
    if (!palabras.length) return SEARCH_INDEX;
    var hallados = [];
    SEARCH_INDEX.forEach(function (r, i) {
      var t = norm(r.title), k = norm(r.kw || ''), d = norm(r.desc), total = 0;
      for (var j = 0; j < palabras.length; j++) {
        var p = palabras[j], pt = t.indexOf(p), pts = 0;
        if (pt === 0 || t.indexOf(' ' + p) !== -1) pts = 3;
        else if (pt !== -1) pts = 2;
        else if (k.indexOf(p) !== -1) pts = 1.5;
        else if (d.indexOf(p) !== -1) pts = 1;
        if (!pts) return;
        total += pts;
      }
      hallados.push({ r: r, p: total - (r.grupo ? 0.5 : 0), i: i }); // los grupos (categorías) van justo después del ítem que coincide igual
    });
    hallados.sort(function (a, b) { return b.p - a.p || a.i - b.i; });
    return hallados.map(function (h) { return h.r; });
  }

  function setActive(i) {
    var items = resultsEl.querySelectorAll('.search-result');
    items.forEach(function (el) { el.classList.remove('is-active'); });
    if (items[i]) { items[i].classList.add('is-active'); items[i].scrollIntoView({ block: 'nearest' }); }
    activeIndex = i;
  }

  // Talleres y cursos: precio y fechas se leen de assets/eventos.js (FV_EVENTOS) al abrir el buscador.
  // El texto fijo del índice no lleva fechas, para que nunca anuncie una fecha pasada. Si eventos.js no carga, queda el precio de respaldo.
  var PRECIO_EV = { taller: ['taller.precio', '$24,99', ' por persona'], curso: ['curso.precio', '$299,99', ' en 3 cuotas'] };
  function fechasEventos() {
    var E = window.FV_EVENTOS;
    SEARCH_INDEX.forEach(function (r) {
      if (!r.ev) return;
      if (r.base === undefined) r.base = r.desc.trim();
      var pe = PRECIO_EV[r.ev], precio = pe ? ((E && E.datos && E.datos[pe[0]]) || pe[1]) + pe[2] + '.' : '';
      var e = E && E.proximas ? E.proximas().filter(function (x) { return x.tipo === r.ev; })[0] : null;
      r.desc = r.base + ' ' + precio + ' ' + (e ? 'Próxima fecha: ' + e.texto + '.' : (E && E.sinFechas ? E.sinFechas : 'Próximas fechas: escríbenos por WhatsApp') + '.');
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
