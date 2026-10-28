/* Buscador global (Ctrl/Cmd + K y la lupa del encabezado). Compartido por todas las páginas.
   Al abrirse despliega un panel justo debajo de la barra, a todo el ancho, como un mapa del sitio: columnas ⬡ Hexagonal, ▲ Triangular y Páginas;
   en cada línea, Servicios y Productos; y dentro, los grupos (las categorías del catálogo, lo cercano entre sí) que se abren y se cierran con flecha.
   Al escribir, los grupos se abren solos y muestran solo lo que coincide. Se construye la primera vez que se abre: cerrado no hay texto suelto.
   El índice sigue el catálogo (data/catalogo.json): /servicios y /productos, sus 10 categorías (grupo: true, con ancla), los 19 servicios y los 15 productos,
   cada uno con la url de su detalle y g = el id de su categoría. Es ⬡ todo servicio (cat: 'Servicio' o bajo /servicios) y lo marcado con ln: 'hex'; el resto es ▲.
   Los encabezados de columna dicen «Hexagonal» y «Triangular» por decisión del dueño (27 oct 2026); en los textos de cada resultado se usa solo la forma
   o «empresas e instituciones» / «negocios pequeños». */
(function () {
  // Para añadir una página al buscador: una línea más en este arreglo.
  var SEARCH_INDEX = [
    { title: 'Inicio', desc: 'Servicios para empresas e instituciones y productos para negocios pequeños.', url: '/', cat: 'Pagina' },
    { title: 'Servicios', desc: 'Servicio: el equipo de F&V trabaja con usted, en su empresa o con su equipo.', url: '/servicios', cat: 'Pagina', kw: 'precios cuanto cuesta tarifas catalogo a la medida empresas instituciones' },
    { title: 'Productos', desc: 'Producto: listo para usar, con el mismo precio y la misma entrega para todos.', url: '/productos', cat: 'Pagina', kw: 'precios cuanto cuesta tarifas catalogo precio fijo negocios pequenos emprendedores' },
    { g: 'diagnostico', title: 'Para dueños de empresa: finanzas e IA', desc: 'Diagnóstico de $270, programa ejecutivo ($270 o $180 por persona), formación 1 a 1 ($960) y asesor financiero con IA ($120 o $480 al mes).', url: '/ejecutivos', cat: 'Servicio', kw: 'duenos ejecutivos directivos gerentes programa ejecutivo formacion ejecutiva asesor financiero reportes whatsapp torre trebol martes jueves entre semana' },
    { title: 'Diagnóstico y consultoría', desc: 'Empiece por saber en qué se va la plata de su empresa.', url: '/servicios#diagnostico', cat: 'Servicio', grupo: true },
    { g: 'diagnostico', title: 'Diagnóstico «¿En qué se va la plata de su empresa?»', desc: 'Un día en su empresa para saber dónde se pierde el dinero. $270, que se abonan si contrata la implementación.', url: '/servicios/diagnostico', cat: 'Servicio', kw: 'diagnostico consultoria estrategica auditoria margen costos rentabilidad 270' },
    { title: 'Implementación y automatización', desc: 'Tableros, reportes y sistemas hechos a la medida de su empresa. Se cotizan después del diagnóstico.', url: '/servicios#implementacion', cat: 'Servicio', grupo: true },
    { g: 'implementacion', title: 'Tablero Gerencial', desc: 'Ventas, caja, cobranza y margen en un solo lugar, al día. A medida, desde $600; precio final después del diagnóstico.', url: '/servicios/tablero-gerencial', cat: 'Servicio', kw: 'tablero dashboard indicadores implementacion' },
    { g: 'implementacion', title: 'Reportes automáticos por WhatsApp', desc: 'Ventas, caja, cobranza y margen en su WhatsApp, sin abrir ningún sistema. A medida.', url: '/servicios/reportes-whatsapp', cat: 'Servicio', kw: 'reportes automaticos informes implementacion' },
    { g: 'implementacion', title: 'Conciliación Automática', desc: 'Cruce diario de Pago Móvil, Zelle, USDT y banco contra ventas. A medida, desde $900; precio final después del diagnóstico.', url: '/servicios/conciliacion-automatica', cat: 'Servicio', kw: 'conciliacion pago movil zelle usdt banco implementacion' },
    { g: 'implementacion', title: 'Web Corporativa + CRM', desc: 'Cada contacto de su web queda registrado y recibe respuesta automática. A medida, desde $900; precio final después del diagnóstico.', url: '/servicios/web-corporativa-crm', cat: 'Servicio', kw: 'pagina web crm contactos implementacion' },
    { g: 'implementacion', title: 'Agente de IA a medida', desc: 'Un asistente para WhatsApp o su web que responde con la información de su empresa. A medida, desde $1.000 + mensualidad; precio final después del diagnóstico.', url: '/servicios/agente-ia', cat: 'Servicio', kw: 'asistente chatbot whatsapp implementacion' },
    { g: 'implementacion', title: 'Sprint de Automatización', desc: 'Un proceso de punta a punta automatizado, probado y documentado. A medida, desde $800; precio final después del diagnóstico.', url: '/servicios/sprint-automatizacion', cat: 'Servicio', kw: 'automatizacion proceso implementacion' },
    { g: 'implementacion', title: 'Implementación Odoo Community', desc: 'Configuración, migración de datos y capacitación, por fases. A medida, desde $2.000; precio final después del diagnóstico.', url: '/servicios/odoo-community', cat: 'Servicio', kw: 'erp implementacion sistema' },
    { g: 'implementacion', title: 'Ecosistema de Automatización', desc: 'Tres o más procesos automatizados y un tablero, todo conectado. A medida, desde $2.500; precio final después del diagnóstico.', url: '/servicios/ecosistema-automatizacion', cat: 'Servicio', kw: 'automatizaciones tablero implementacion' },
    { g: 'implementacion', title: 'Dynamics 365 Sales / Customer Service', desc: 'Implementación de ventas y servicio al cliente, por fases. A medida, desde $3.000 + licencias; precio final después del diagnóstico.', url: '/servicios/dynamics-365', cat: 'Servicio', kw: 'crm ventas servicio al cliente implementacion microsoft' },
    { g: 'implementacion', title: 'Desarrollo a medida', desc: 'Portal de clientes, app interna o app de condominios. A medida, desde $3.000; precio final después del diagnóstico.', url: '/servicios/desarrollo-a-medida', cat: 'Servicio', kw: 'app portal clientes condominios software propio implementacion' },
    { title: 'Formación', desc: 'Para usted y su equipo, con sus propios números y herramientas.', url: '/servicios#formacion', cat: 'Servicio', grupo: true },
    { g: 'formacion', title: 'Formación ejecutiva 1 a 1', desc: 'IA aplicada a las finanzas y la gestión de su empresa, explicada para dueños. $960.', url: '/servicios/formacion-ejecutiva', cat: 'Curso', kw: 'duenos directivos privado clases ejecutivos curso 960' },
    { g: 'formacion', title: 'Formación para su equipo', desc: 'Capacitación práctica de su equipo sobre sus propias herramientas y sistemas. A medida.', url: '/servicios/formacion-equipo', cat: 'Curso', kw: 'habilitacion capacitacion personal empleados curso' },
    { g: 'formacion', title: 'Masterclass privada', desc: 'IA aplicada al trabajo de su empresa, para hasta 8 personas. $500 a $700 por sesión.', url: '/servicios/masterclass-privada', cat: 'Curso', kw: 'masterclasses workshops taller privado curso' },
    { g: 'formacion', title: 'Finanzas con IA en su sede', desc: 'El curso de conciliación de pagos con IA, en sus oficinas. $600 por grupo de hasta 6.', url: '/servicios/finanzas-ia-sede', cat: 'Curso', kw: 'curso conciliacion de pagos en sus oficinas' },
    { title: 'Acompañamiento y asesoría', desc: 'Alguien de confianza para sus finanzas y para que lo implementado siga funcionando.', url: '/servicios#acompanamiento', cat: 'Servicio', grupo: true },
    { g: 'acompanamiento', title: 'Acompañamiento Continuo', desc: 'Soporte técnico mensual de lo ya implementado, en tres niveles: Estándar, Prioritario y Director de IA. Desde $200 al mes.', url: '/servicios/acompanamiento', cat: 'Servicio', kw: 'acompanamiento continuo soporte mantenimiento mensual' },
    { g: 'acompanamiento', title: 'Asesor financiero con IA', desc: 'Revisión mensual de sus indicadores, márgenes y alertas, con reportes cortos por WhatsApp. $120 o $480 al mes.', url: '/servicios/asesor-financiero', cat: 'Servicio', kw: 'asesor asesoria finanzas kpi indicadores mensual reunion duenos 120 480' },
    { g: 'acompanamiento', title: 'Acompañamiento Estándar', desc: 'Soporte técnico de lo ya implementado: 8 horas al mes, respuesta el mismo día. $200 al mes.', url: '/servicios/acompanamiento#estandar', cat: 'Servicio', kw: 'acompanamiento continuo soporte mantenimiento 200' },
    { g: 'acompanamiento', title: 'Acompañamiento Prioritario', desc: 'Soporte técnico de lo ya implementado: 18 horas al mes, respuesta en 4 horas. $400 al mes.', url: '/servicios/acompanamiento#prioritario', cat: 'Servicio', kw: 'acompanamiento continuo soporte mantenimiento 400' },
    { g: 'acompanamiento', title: 'Director de IA a tiempo parcial', desc: 'Soporte técnico y rumbo de sus sistemas: 16 horas al mes y una reunión semanal. $600 al mes.', url: '/servicios/acompanamiento#director-ia', cat: 'Servicio', kw: 'acompanamiento continuo soporte director de inteligencia artificial 600' },
    { title: 'Software', desc: 'Club, Condominio y Gym: cobro de cuotas, control y reportes para su organización.', url: '/productos#software', cat: 'Producto', grupo: true },
    { g: 'software', ln: 'hex', title: 'Club para empresas e instituciones', desc: 'Cobro de cuotas, estado de cuenta, carnet digital y reportes para la junta directiva. Desde $190/mes.', url: '/club', cat: 'Producto', kw: 'club clubes cuotas socios junta directiva software app' },
    { g: 'software', ln: 'hex', title: 'Condominio para empresas e instituciones', desc: 'Recibos, alícuotas, transparencia de gastos y varios edificios en una sola pantalla. Desde $190/mes.', url: '/condominio', cat: 'Producto', kw: 'condominio edificio alicuota recibos administradora junta software app' },
    { g: 'software', ln: 'hex', title: 'Gym para empresas e instituciones', desc: 'Membresías, cobros, entrada con QR y reportes por sede. Desde $190/mes.', url: '/gym', cat: 'Producto', kw: 'gimnasio membresias qr cadena sedes software app' },
    { g: 'software', title: 'Club para negocios pequeños', desc: 'Cobra las cuotas de tus socios sin perseguir a nadie. Desde $89,99/mes.', url: '/club', cat: 'Producto', kw: 'club clubes cuotas socios software app' },
    { g: 'software', title: 'Condominio para negocios pequeños', desc: 'Recibos claros y gastos a la vista de tus vecinos. Desde $89,99/mes.', url: '/condominio', cat: 'Producto', kw: 'condominio edificio alicuota recibos software app' },
    { g: 'software', title: 'Gym para negocios pequeños', desc: 'Membresías, cobros y entrada con código QR para tus miembros. Desde $89,99/mes.', url: '/gym', cat: 'Producto', kw: 'gimnasio membresias qr software app' },
    { title: 'Cursos y programas', desc: 'Con fechas y cupos limitados.', url: '/productos#cursos', cat: 'Producto', grupo: true },
    { g: 'cursos', ln: 'hex', title: 'Programa ejecutivo entre semana', desc: 'Aprenda a ver sus números con IA y a recibir sus reportes por WhatsApp. $270 individual o $180 por persona en grupo de 2 a 4.', url: '/ejecutivos#programa-ejecutivo', cat: 'Curso', kw: 'entre semana martes jueves ejecutivos directivos duenos torre trebol curso 270 180' },
    { g: 'cursos', title: 'Finanzas con IA', desc: 'Ve tu dinero claro en varias tasas y pídele a la IA el trabajo pesado. ', url: '/curso-finanzas-ia', cat: 'Curso', ev: 'curso', kw: 'curso finanzas con ia sabados cohorte cupos certificado conciliacion' },
    { g: 'cursos', title: 'Taller «La plata de tu negocio clara»', desc: 'Taller presencial de 3 horas en Valencia para ordenar la plata de tu negocio. ', url: '/productos/taller-plata-clara', cat: 'Curso', ev: 'taller', kw: 'taller plata de tu negocio sabado cupos' },
    { title: 'Para empezar', desc: 'Lo básico para que te encuentren, te compren y sepas cuánto ganas.', url: '/productos#para-empezar', cat: 'Producto', grupo: true },
    { g: 'para-empezar', title: 'Plan Arranque', desc: 'Lo básico para que te encuentren, te compren por WhatsApp y sepas cuánto ganas. $39,99 al mes.', url: '/productos/plan-arranque', cat: 'Producto', kw: 'paquete pack presencia caja clara arranque' },
    { g: 'para-empezar', title: 'Mis Finanzas Claras', desc: 'Tu hoja personal de cuentas en Bs, $ y USDT, lista para copiar. $4,99.', url: '/productos/mis-finanzas-claras', cat: 'Producto', kw: 'finanzas personales hoja de cuentas' },
    { title: 'Presencia y web', desc: 'Que te encuentren en Google Maps, te escriban por WhatsApp y tengas tu web.', url: '/productos#presencia', cat: 'Producto', grupo: true },
    { g: 'presencia', title: 'Presencia', desc: 'Tu negocio en Google Maps, WhatsApp Business y la web, siempre al día. Desde $14,99 al mes.', url: '/paginas-web', cat: 'Producto', kw: 'google maps whatsapp business catalogo web tienda online pagina web paginas web dominio qr' },
    { title: 'Control y finanzas', desc: 'Cuadra tu caja y mira tus números clave en una sola pantalla.', url: '/productos#control', cat: 'Producto', grupo: true },
    { g: 'control', title: 'Caja Clara', desc: 'Cuadre de caja en Bs, $, Pago Móvil y USDT, con tasa BCV automática. Desde $14,99 al mes.', url: '/productos/caja-clara', cat: 'Producto', kw: 'caja cuadre cobros cuentas por cobrar inventario cotizador tasa bcv' },
    { g: 'control', title: 'Tablero Ejecutivo', desc: 'Un tablero con tus números clave: ventas, gastos, margen, cobros y lo más vendido. Desde $79,99 al mes.', url: '/productos/tablero-ejecutivo', cat: 'Producto', kw: 'tablero dashboard indicadores numeros clave' },
    { title: 'Ventas y atención', desc: 'Responde a tus clientes por WhatsApp sin estar pegado al teléfono.', url: '/productos#ventas', cat: 'Producto', grupo: true },
    { g: 'ventas', title: 'Asistente IA de WhatsApp', desc: 'Asistente que responde precios, horarios y ubicación, toma pedidos y te pasa lo difícil. Desde $119,99 al mes.', url: '/productos/asistente-ia', cat: 'Producto', kw: 'asistente chatbot whatsapp citas pedidos instagram automatico' },
    { g: 'presencia', title: 'Demo: Catálogo con tasa BCV', desc: 'Prueba un catálogo funcionando con la tasa BCV del día.', url: '/demo-catalogo', cat: 'Producto', kw: 'presencia catalogo menu digital demo' },
    { title: 'Nosotros', desc: 'Cómo trabajamos y por qué elegir a F&V.', url: '/nosotros', cat: 'Pagina' },
    { title: 'Contacto', desc: 'WhatsApp directo y diagnóstico gratis de 20 minutos.', url: '/contacto', cat: 'Pagina', kw: 'consulta gratis agendar cita llamada whatsapp telefono direccion mapa' },
    { title: 'Casos de clientes', desc: 'Qué hicimos y qué dijo el cliente. Pregunta por el precio de lanzamiento.', url: '/casos', cat: 'Pagina' },
    { title: 'Calculadora de precios', desc: 'Calcula a cuánto vender en $ y Bs con la tasa BCV del día. Gratis.', url: '/calculadora', cat: 'Pagina', kw: 'precio margen tasa bcv' },
    { title: 'Calculadora de ROI', desc: 'Estima cuánto puedes ahorrar automatizando tus procesos.', url: '/calculadora-roi', cat: 'Pagina', kw: 'ahorro retorno automatizacion' },
    { title: 'Política de Privacidad', desc: 'Cómo protegemos tu información.', url: '/privacidad', cat: 'Legal' },
    { title: 'Términos y Condiciones', desc: 'Condiciones de uso del sitio y contratación.', url: '/terminos', cat: 'Legal' }
  ];

  var css = '' +
    '#search-overlay{position:fixed;left:0;right:0;bottom:0;top:77px;display:block;padding:0;z-index:200;background:rgba(0,0,0,.6);backdrop-filter:blur(3px);opacity:0;visibility:hidden;pointer-events:none;transition:opacity .2s cubic-bezier(.23,1,.32,1),visibility 0s linear .2s}' +
    '#search-overlay.is-open{opacity:1;visibility:visible;pointer-events:auto;transition:opacity .2s cubic-bezier(.23,1,.32,1)}' +
    '#search-panel{position:relative;display:block;width:auto;max-width:none;max-height:100%;overflow-y:auto;overscroll-behavior:contain;background:#0D0E12;border:0;border-bottom:1px solid #1F232B;border-radius:0;box-shadow:0 24px 60px rgba(0,0,0,.6);transform:translateY(-10px);transition:transform .2s cubic-bezier(.23,1,.32,1)}' +
    '#search-overlay.is-open #search-panel{transform:translateY(0)}' +
    '.sr-wrap{max-width:1200px;margin:0 auto;padding:16px 24px 20px}' +
    '#search-input-row{display:flex;align-items:center;gap:12px;padding:4px 0 14px;border-bottom:1px solid #1F232B}' +
    '#search-input{flex:1;min-width:0;background:transparent;border:none;outline:none;color:#fff;font-size:20px;font-family:Geist,sans-serif}' +
    '#search-input::placeholder{color:#94a3b8}' +
    '#search-toggle-all,#search-close{flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;min-height:44px;min-width:44px;padding:0 14px;background:transparent;border:1px solid #2a2f3a;border-radius:10px;color:#cbd5e1;font:600 13px "Space Grotesk",sans-serif;cursor:pointer}' +
    '#search-close{font-size:22px;line-height:1;padding:0}' +
    '#search-toggle-all:hover,#search-close:hover{border-color:rgba(0,255,255,.5);color:#fff}' +
    '#search-overlay.sr-q #search-toggle-all{display:none}' +
    '#search-results{padding:6px 0 0;overflow:visible}' +
    '.sr-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:8px 36px;align-items:start}' +
    '.sr-col{min-width:0}' +
    '.sr-hex{--sr-grad:linear-gradient(90deg,#00FFFF,#FF8C00);--sr-c:#00FFFF}.sr-tri{--sr-grad:linear-gradient(90deg,#4ade80,#a855f7);--sr-c:#4ade80}.sr-pag{--sr-grad:linear-gradient(90deg,#475569,#94a3b8);--sr-c:#94a3b8}' +
    '.sr-col-h{display:flex;align-items:center;gap:8px;margin:10px 0 6px;padding:6px 4px 10px;font:600 12px "Space Grotesk",sans-serif;letter-spacing:.06em;text-transform:uppercase;color:var(--sr-c);border-bottom:2px solid;border-image:var(--sr-grad) 1}' +
    '.sr-col-h svg{flex-shrink:0}' +
    '.sr-sub{margin:14px 4px 4px;font:600 10.5px "Space Grotesk",sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#64748b}' +
    '.sr-vacio{margin:2px 4px 6px;padding:8px 0;font-size:12.5px;color:#64748b;font-style:italic}' +
    '.sr-g{margin:2px 0;border-left:2px solid transparent;border-radius:0 10px 10px 0}' +
    '.sr-g[open]{border-left-color:var(--sr-c);background:rgba(255,255,255,.02)}' +
    '.sr-gs{display:flex;align-items:center;gap:10px;min-height:44px;padding:8px 12px;border-radius:10px;cursor:pointer;list-style:none;color:#fff;font:600 14.5px "Space Grotesk",sans-serif}' +
    '.sr-gs::-webkit-details-marker{display:none}' +
    '.sr-gs:hover{background:rgba(255,255,255,.05)}' +
    '.sr-gn{margin-left:auto;font-weight:500;font-size:12px;color:#94a3b8}' +
    '.sr-chev{flex-shrink:0;width:8px;height:8px;margin:0 4px 3px 2px;border-right:2px solid var(--sr-c);border-bottom:2px solid var(--sr-c);transform:rotate(45deg);transition:transform .2s cubic-bezier(.23,1,.32,1)}' +
    '.sr-g[open]>.sr-gs .sr-chev{transform:rotate(-135deg);margin-bottom:-3px}' +
    '.sr-gl{padding:0 6px 8px 8px}' +
    '.search-result{display:flex;flex-direction:column;gap:2px;padding:9px 12px;min-height:40px;border-radius:10px;cursor:pointer;text-decoration:none}' +
    '.search-result:hover,.search-result.is-active{background:rgba(0,204,255,.08)}' +
    '.sr-tri .search-result:hover,.sr-tri .search-result.is-active{background:rgba(74,222,128,.09)}' +
    '.search-result .sr-title{color:#fff;font-family:"Space Grotesk",sans-serif;font-size:14px;display:flex;align-items:center;gap:8px}' +
    '.search-result .sr-desc{color:#94a3b8;font-size:12.5px;display:none}' +
    '#search-results.sr-buscando .sr-desc{display:block}' +
    '.sr-tag{font-size:10px;padding:1px 7px;border-radius:999px;font-family:"Space Grotesk",sans-serif;text-transform:uppercase;letter-spacing:.03em}' +
    '.sr-tag.cat-Servicio{background:rgba(0,255,255,.1);color:#00FFFF}.sr-tag.cat-Curso{background:rgba(255,140,0,.12);color:#FF8C00}' +
    '.sr-tag.cat-Pagina{background:rgba(255,255,255,.08);color:#94a3b8}.sr-tag.cat-Legal{background:rgba(255,255,255,.06);color:#94a3b8}' +
    '.sr-tag.cat-Producto{background:rgba(74,222,128,.12);color:#4ade80}' +
    '.sr-hex .sr-tag,.sr-tri .sr-tag,.sr-pag .sr-tag{display:none}' +
    '.sr-ver{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:4px 4px 6px;padding:10px 14px;min-height:44px;border:1px solid var(--sr-c);border-radius:10px;color:var(--sr-c);text-decoration:none;font:600 12.5px "Space Grotesk",sans-serif}' +
    '.sr-ver:hover{background:color-mix(in srgb,var(--sr-c) 14%,transparent)}' +
    '.sr-gl .sr-cat{border-color:transparent;padding:8px 12px;min-height:40px;font-weight:500;color:#94a3b8}' +
    '.sr-gl .sr-cat:hover{color:var(--sr-c)}' +
    '.sr-gs:focus-visible,.search-result:focus-visible,.sr-ver:focus-visible,#search-toggle-all:focus-visible,#search-close:focus-visible{outline:2px solid #00FFFF;outline-offset:2px}' +
    '#search-empty{padding:28px 18px;text-align:center;color:#94a3b8;font-size:13px}' +
    '#search-hint-row{display:flex;gap:14px;padding:12px 4px 0;margin-top:10px;border-top:1px solid #1F232B;font-size:11px;color:#94a3b8;font-family:"Space Grotesk",sans-serif}' +
    '#search-hint-row kbd{background:rgba(255,255,255,.06);padding:1px 5px;border-radius:4px;border:1px solid rgba(255,255,255,.08)}' +
    '@media (max-width:639px){.sr-wrap{padding:10px 14px 16px}#search-input{font-size:17px}#search-hint-row{display:none}}' +
    '@media (prefers-reduced-motion:reduce){#search-overlay,#search-panel,.sr-chev{transition:none!important}}';

  var overlay, input, resultsEl, toggleAll, closeBtn, lastFocus, mejorActual = null, currentResults = [];

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
    overlay.setAttribute('aria-label', 'Buscar y explorar el sitio');
    overlay.innerHTML =
      '<div id="search-panel"><div class="sr-wrap">' +
        '<div id="search-input-row">' +
          '<svg class="shrink-0" width="18" height="18" fill="none" stroke="#94a3b8" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 10.5A6.5 6.5 0 114 10.5a6.5 6.5 0 0113 0z"/></svg>' +
          '<input id="search-input" type="text" placeholder="Buscar en el sitio..." autocomplete="off" aria-label="Buscar en el sitio">' +
          '<button type="button" id="search-toggle-all">Expandir todo</button>' +
          '<button type="button" id="search-close" aria-label="Cerrar el buscador">&times;</button>' +
        '</div>' +
        '<div id="search-results"></div>' +
        '<div id="search-hint-row"><span><kbd>&uarr;</kbd><kbd>&darr;</kbd> navegar</span><span><kbd>&larr;</kbd><kbd>&rarr;</kbd> cerrar o abrir un grupo</span><span><kbd>Esc</kbd> cerrar</span></div>' +
      '</div></div>';
    document.body.appendChild(overlay);
    input = overlay.querySelector('#search-input');
    resultsEl = overlay.querySelector('#search-results');
    toggleAll = overlay.querySelector('#search-toggle-all');
    closeBtn = overlay.querySelector('#search-close');
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    input.addEventListener('input', function () { render(filter(input.value)); });
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (toggleAll) toggleAll.addEventListener('click', alternarTodo);
  }

  // «Expandir todo» abre todos los grupos; «Contraer todo» los cierra.
  function alternarTodo() {
    var ds = Array.prototype.slice.call(resultsEl.querySelectorAll('details'));
    var abrir = ds.some(function (d) { return !d.open; });
    ds.forEach(function (d) { d.open = abrir; });
    toggleAll.textContent = abrir ? 'Contraer todo' : 'Expandir todo';
  }

  var SVG_HEX = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><polygon points="12,2 21,7 21,17 12,22 3,17 3,7"/></svg>';
  var SVG_TRI = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><polygon points="12,3 22,20 2,20"/></svg>';
  var LINEAS = { hex: { nombre: 'Hexagonal', svg: SVG_HEX }, tri: { nombre: 'Triangular', svg: SVG_TRI } };
  var NOMBRE_TIPO = { servicio: 'Servicios', producto: 'Productos' };
  // Orden de los grupos (las categorías del catálogo): lo cercano entre sí va junto.
  var ORDEN = { servicio: ['diagnostico', 'implementacion', 'formacion', 'acompanamiento'], producto: ['software', 'cursos', 'para-empezar', 'presencia', 'control', 'ventas'] };

  // A qué columna (⬡ / ▲ / páginas), tipo y grupo va un resultado.
  function lugar(r) {
    if (r.grupo) { var serv = r.url.indexOf('/servicios') === 0; return { col: serv ? 'hex' : 'tri', tipo: serv ? 'servicio' : 'producto', g: r.url.split('#')[1] }; }
    if (r.cat === 'Pagina' || r.cat === 'Legal') return { col: 'pag' };
    var servicio = r.url.indexOf('/servicios') === 0 || r.cat === 'Servicio'; // /ejecutivos es un servicio ⬡ aunque no cuelgue de /servicios
    return { col: (servicio || r.ln === 'hex') ? 'hex' : 'tri', tipo: servicio ? 'servicio' : 'producto', g: r.g };
  }
  function filaGrupo(tipo, id) {
    var u = (tipo === 'servicio' ? '/servicios#' : '/productos#') + id;
    for (var i = 0; i < SEARCH_INDEX.length; i++) if (SEARCH_INDEX[i].grupo && SEARCH_INDEX[i].url === u) return SEARCH_INDEX[i];
    return null;
  }

  function render(list) {
    var hayConsulta = !!norm(input.value);
    if (!hayConsulta) list = list.filter(function (r) { return !r.grupo; });
    if (hayConsulta) { overlay.classList.add('sr-q'); resultsEl.classList.add('sr-buscando'); } else { overlay.classList.remove('sr-q'); resultsEl.classList.remove('sr-buscando'); }
    if (toggleAll) toggleAll.textContent = 'Expandir todo';
    if (!list.length) {
      currentResults = [];
      mejorActual = null;
      resultsEl.innerHTML = '<div id="search-empty">Sin resultados. <a href="https://wa.me/584244125386?text=' + encodeURIComponent('Hola F&V, busqué algo en el sitio y no lo encontré') + '" target="_blank" rel="noopener" class="link-underline text-fv-cyan">Escríbenos por WhatsApp</a> y te ayudamos directo.</div>';
      return;
    }
    var mejor = list.filter(function (r) { return !r.grupo; })[0] || list[0]; // el de mayor puntaje (una categoría solo si no hay otro): se abre con Enter
    mejorActual = hayConsulta ? mejor : null;
    var cols = { hex: { servicio: {}, producto: {} }, tri: { servicio: {}, producto: {} }, pag: [] };
    list.forEach(function (r) {
      var l = lugar(r);
      if (l.col === 'pag') { cols.pag.push(r); return; }
      var gs = cols[l.col][l.tipo], g = gs[l.g] || (gs[l.g] = { items: [], fila: false });
      if (r.grupo) g.fila = true; else g.items.push(r);
    });
    currentResults = [];
    function items(arr) {
      return arr.map(function (r) {
        var i = currentResults.push(r) - 1;
        return '<a href="' + esc(r.url) + '" class="search-result' + (hayConsulta && r === mejor ? ' is-active' : '') + '" data-i="' + i + '">' +
          '<span class="sr-title">' + esc(r.title) + ' <span class="sr-tag cat-' + esc(r.cat) + '">' + esc(r.cat) + '</span></span>' +
          '<span class="sr-desc">' + esc(r.desc) + '</span></a>';
      }).join('');
    }
    function botonVer(clave, tipo) {
      var etiqueta = 'Ver todos los ' + NOMBRE_TIPO[tipo].toLowerCase() + ' de la línea ' + LINEAS[clave].nombre;
      return '<a href="' + (tipo === 'servicio' ? '/servicios' : '/productos') + '" class="sr-ver"><span>' + etiqueta + '</span><span aria-hidden="true">&rarr;</span></a>';
    }
    function grupo(tipo, id, g) {
      var fila = filaGrupo(tipo, id);
      var cat = fila ? '<a href="' + esc(fila.url) + '" class="sr-ver sr-cat"><span>Ver toda la categoría</span><span aria-hidden="true">&rarr;</span></a>' : '';
      return '<details class="sr-g"' + (hayConsulta ? ' open' : '') + '><summary class="sr-gs"><span class="sr-gt">' + esc(fila ? fila.title : id) + '</span><span class="sr-gn">' + g.items.length + '</span><span class="sr-chev" aria-hidden="true"></span></summary>' +
        '<div class="sr-gl">' + cat + items(g.items) + '</div></details>';
    }
    function columna(clave) {
      var cuerpo = '', total = 0;
      ['servicio', 'producto'].forEach(function (tipo) {
        var gs = cols[clave][tipo], ids = ORDEN[tipo].filter(function (id) { return gs[id]; });
        Object.keys(gs).forEach(function (id) { if (ids.indexOf(id) === -1) ids.push(id); });
        if (!ids.length) {
          // sin búsqueda se ven las dos secciones; ▲ aún no tiene servicios y se dice sin inventar nada
          if (!hayConsulta && clave === 'tri' && tipo === 'servicio') cuerpo += '<div class="sr-sub">Servicios</div><div class="sr-vacio">Por ahora, solo productos listos para usar.</div>';
          return;
        }
        total++;
        cuerpo += '<div class="sr-sub">' + NOMBRE_TIPO[tipo] + '</div>' + botonVer(clave, tipo) + ids.map(function (id) { return grupo(tipo, id, gs[id]); }).join('');
      });
      return total ? '<section class="sr-col sr-' + clave + '" aria-label="' + LINEAS[clave].nombre + '"><h3 class="sr-col-h">' + LINEAS[clave].svg + '<span>' + LINEAS[clave].nombre + '</span></h3>' + cuerpo + '</section>' : '';
    }
    var hex = columna('hex'), tri = columna('tri');
    var pag = cols.pag.length ? '<section class="sr-col sr-pag" aria-label="Páginas"><h3 class="sr-col-h"><span>Páginas</span></h3><div class="sr-gl">' + items(cols.pag) + '</div></section>' : '';
    resultsEl.innerHTML = '<div class="sr-grid">' + hex + tri + pag + '</div>';
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

  var trigger = null;
  function open() {
    build();
    fechasEventos();
    lastFocus = document.activeElement;
    // el panel arranca justo debajo de la barra de navegación, que sigue visible
    var cab = document.getElementById('site-header');
    overlay.style.top = (cab ? Math.round(cab.getBoundingClientRect().bottom) : 0) + 'px';
    overlay.classList.add('is-open');
    input.value = '';
    render(SEARCH_INDEX);
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    if (document.documentElement && document.documentElement.style) document.documentElement.style.overflow = 'hidden';
    setTimeout(function () { input.focus(); }, 30);
  }
  function close() {
    if (!overlay) return;
    overlay.classList.remove('is-open');
    if (document.documentElement && document.documentElement.style) document.documentElement.style.overflow = '';
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function isOpen() { return overlay && overlay.classList.contains('is-open'); }

  // Elementos que se recorren con ↑ ↓: los títulos de grupo y los enlaces visibles (lo que está dentro de un grupo cerrado no cuenta).
  function visibles() {
    return Array.prototype.slice.call(resultsEl.querySelectorAll('summary, a')).filter(function (el) { return el.offsetParent !== null; });
  }
  function enfocables() {
    var f = [input];
    if (toggleAll && toggleAll.offsetParent !== null) f.push(toggleAll);
    if (closeBtn) f.push(closeBtn);
    return f.concat(visibles());
  }

  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key && e.key.toLowerCase() === 'k') { e.preventDefault(); isOpen() ? close() : open(); return; }
    if (!isOpen()) return;
    var act = document.activeElement;
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'Enter' && act === input && mejorActual) { window.location.href = mejorActual.url; return; }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      var v = visibles(), i = v.indexOf(act);
      if (e.key === 'ArrowDown') {
        var sig = i === -1 ? (v.filter(function (el) { return /is-active/.test(el.className); })[0] || v[0]) : v[i + 1];
        if (sig) sig.focus();
      } else if (i <= 0) input.focus(); else v[i - 1].focus();
      return;
    }
    if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && act && act.tagName === 'SUMMARY') { e.preventDefault(); act.parentNode.open = e.key === 'ArrowRight'; return; }
    if (e.key === 'Tab') { // el foco no sale del panel mientras está abierto
      var f = enfocables(), k = f.indexOf(act);
      if (e.shiftKey && k <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && (k === -1 || k === f.length - 1)) { e.preventDefault(); f[0].focus(); }
    }
  });

  // Botón de la lupa del encabezado: abre y cierra el panel. La etiqueta del atajo se escribe aquí, no en el HTML.
  trigger = document.getElementById('search-trigger');
  if (trigger) {
    trigger.setAttribute('aria-expanded', 'false');
    trigger.addEventListener('click', function () { isOpen() ? close() : open(); });
  }
  var mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  document.querySelectorAll('[data-kbd]').forEach(function (el) { el.textContent = mac ? '⌘ K' : 'Ctrl K'; });
})();
