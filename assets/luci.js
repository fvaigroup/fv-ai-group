/* Luci: asistente virtual de F&V (compartida por todas las páginas).
   No es un modelo de IA: busca palabras clave en la pregunta y responde con textos preparados por el equipo.
   Cada respuesta termina con un botón de acción (producto por WhatsApp, /triangular, /paginas-web o /contacto#agenda).
   Para cambiar un precio, un plazo o una respuesta, edita la lista RESPUESTAS de abajo. Las fechas de talleres y cursos
   salen de assets/eventos.js (FV_EVENTOS), así que no hay que tocarlas aquí. */
(function () {
  'use strict';
  var toggle = document.getElementById('luci-toggle'), panel = document.getElementById('luci-panel');
  if (!toggle || !panel) return;
  var closeBtn = document.getElementById('luci-close'), messages = document.getElementById('luci-messages'),
      quick = document.getElementById('luci-quick'), form = document.getElementById('luci-form'), input = document.getElementById('luci-input');
  var WA = 'https://wa.me/584244125386?text=';
  var TEXTO_BOTON = '¿Dudas? Pregúntale a Luci (responde al instante)';
  var HORARIO = 'Respondemos el mismo día de lunes a viernes de 9:00 a 17:00. Fuera de ese horario te atiende Luci, nuestra asistente virtual, y te escribimos el siguiente día hábil.';

  function wa(m) { return WA + encodeURIComponent(m); }
  function ev(k, d) { try { var v = window.FV_EVENTOS && window.FV_EVENTOS.datos[k]; return v !== undefined ? v : d; } catch (e) { return d; } }
  function estado(k) { try { return window.FV_EVENTOS ? window.FV_EVENTOS.estado[k] : true; } catch (e) { return true; } }
  function pedir(nombre, precio, linea) { return { l: 'Lo quiero por WhatsApp', h: wa('Hola F&V, quiero ' + nombre + ' (' + (linea || 'Línea Triangular') + ', ' + precio + '). ¿Cómo pago?'), wa: true, p: nombre }; }
  var VER_TRI = { l: 'Ver la Línea Triangular', h: '/triangular' };
  var VER_WEBS = { l: 'Ver páginas web y precios', h: '/paginas-web' };
  var VER_SOL = { l: 'Ver las dos líneas', h: '/#lineas' };
  var DIAG = { l: 'Agendar diagnóstico gratis', h: '/contacto#agenda' };
  var ESCRIBIR = { l: 'Escribir por WhatsApp', h: wa('Hola F&V, tengo una consulta'), wa: true };

  // k = palabras clave (sin tildes, en minúsculas; coincide con el inicio de una palabra, así "curso" también encuentra "cursos")
  var RESPUESTAS = [
    { g: 1, k: ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'saludos'], a: 'Hola, ¿en qué te ayudo? Puedo contarte de productos y precios, plazos, formas de pago, cursos y talleres.', c: VER_TRI },
    { k: ['eres una ia', 'eres ia', 'eres un bot', 'eres humano', 'eres real', 'eres una persona', 'quien eres', 'que eres', 'robot', 'persona real'], a: 'Soy Luci, una asistente virtual: respondo al instante y a cualquier hora con respuestas que preparó el equipo de F&V. No soy una persona. Para algo más específico escríbenos por WhatsApp y te respondemos el mismo día de lunes a viernes.', c: ESCRIBIR },
    { k: ['horario', 'responden', 'respuesta', 'atienden', 'atencion', 'abren', 'fin de semana', 'domingo'], a: function () { return HORARIO; }, c: ESCRIBIR },
    { k: ['club', 'clubes', 'cuotas de socios', 'cuotas del club', 'junta directiva', 'asociacion deportiva'], a: 'Club es nuestro software para que los clubes cobren y controlen las cuotas de sus socios: cada socio ve en su teléfono cuánto debe y reporta su pago, la administración aprueba con un clic y la junta ve la morosidad en tiempo real. Los planes van desde $199/mes (Esencial, hasta 300 socios). Te lo mostramos en una demo de 20 minutos.', c: { l: 'Ver Club', h: '/club' } },
    { k: ['plan arranque', 'arranque', 'pack', 'paquete'], a: 'El Plan Arranque cuesta $39 al mes (por separado, $44): Presencia Catálogo + Caja Clara, para que te encuentren, te compren por WhatsApp y sepas cuánto ganas. Activo en 72 horas y cancelas cuando quieras. Pagando 12 meses por adelantado son $374,40 (20 % menos).', c: pedir('el Plan Arranque', '$39/mes') },
    { k: ['presencia', 'negocio visible', 'google maps', 'maps', 'ficha', 'verificacion', 'qr', 'pagina web', 'paginas web', 'sitio web', 'una web', 'tienda online', 'tienda', 'dominio', 'hosting'], a: 'Presencia tiene cuatro tamaños: Básico $15/mes (ficha de Google Maps, WhatsApp Business y QR, activo en 48 horas), Catálogo $29/mes (suma tu catálogo con precios en $ y Bs a tasa BCV, 72 horas), Web $59/mes (web de hasta 5 secciones, correo profesional y estadísticas, 2 semanas, permanencia mínima de 12 meses) y Tienda $99/mes (con carrito de compras, 3 semanas, permanencia mínima de 12 meses). El dominio se paga aparte (alrededor de US$12 al año). La verificación de Google puede tardar unos días más y no depende de nosotros.', c: { l: 'Ver Presencia', h: '/triangular#presencia' } },
    { k: ['catalogo', 'menu digital', 'demo', 'bodegon'], a: 'El tamaño Catálogo de Presencia cuesta $29/mes: tu catálogo o menú en una página, con precios en $ y Bs que se actualizan solos con la tasa BCV, pedidos por WhatsApp y cambios de precios ilimitados. Activo en 72 horas. Puedes ver la demo en vivo.', c: { l: 'Ver demo en vivo', h: '/demo-catalogo' } },
    { k: ['caja clara', 'cuadre', 'cuanto gane', 'cuanto gano', 'cobranza', 'cobrar', 'cuentas por cobrar', 'me deben', 'inventario', 'stock', 'cotizador', 'presupuesto'], a: 'Caja Clara tiene tres tamaños: Caja $15/mes (cuadre diario en Bs, $, Pago Móvil y USDT con tasa BCV automática, reporte semanal y 45 minutos de capacitación, 48 horas), Caja y cobros $29/mes (suma cuentas por cobrar con alertas, mensajes de cobro listos y cotizador en $ y Bs con PDF, 72 horas) y Administración completa $39/mes (suma inventario con entradas, salidas y mínimos, 72 horas).', c: pedir('Caja Clara, tamaño Caja', '$15/mes') },
    { k: ['tablero ejecutivo', 'tablero', 'indicadores', 'dashboard'], a: 'El Tablero Ejecutivo muestra tus números clave (ventas, gastos, margen, cobros y lo más vendido) en una sola pantalla, desde el teléfono. Pyme $79/mes (1 fuente de datos, hasta 8 indicadores y reporte semanal por WhatsApp, 1 semana) y Pro $149/mes (hasta 3 fuentes, 15 indicadores y una reunión mensual de 30 minutos, 2 semanas).', c: pedir('Tablero Ejecutivo, tamaño Pyme', '$79/mes') },
    { k: ['asistente ia', 'asistente', 'chatbot', 'bot de whatsapp', 'responder por whatsapp', 'automatico'], a: 'El Asistente IA de WhatsApp cuesta $119/mes, o $179/mes con Instagram, agenda de citas y datos de cada cliente. Responde precios, horarios y ubicación las 24 horas, toma pedidos o citas y te pasa lo difícil. Instalación incluida, permanencia mínima de 6 meses y entrega en 5 a 7 días. Está disponible desde noviembre de 2026.', c: pedir('Asistente IA de WhatsApp, tamaño WhatsApp', '$119/mes') },
    { k: ['mis finanzas claras', 'finanzas personales', 'finanzas claras'], a: 'Mis Finanzas Claras cuesta $4,99 (pago único): tu hoja personal de cuentas en Bs, $ y USDT, lista para copiar.', c: pedir('Mis Finanzas Claras', '$4,99, pago único') },
    { k: ['asesor f v', 'asesor fv', 'asesor mensual', 'asesor pro', 'sesion clara', 'pack enfoque', 'consultoria', 'clase', 'clases', 'plan de accion'], a: 'El Asesor F&V es consultoría por Google Meet con plan de acción por escrito. Sesión Clara $30 (1 hora y resumen con los 3 próximos pasos el mismo día), Pack Enfoque $80 (3 sesiones, resumen de cada una y plan de 30 días; en 2 cuotas o $64 de contado), Asesor Mensual $119/mes (4 horas al mes) y Asesor Pro $199/mes (8 horas al mes y revisión mensual de indicadores).', c: pedir('Asesor F&V, tamaño Sesión Clara', '$30, pago único') },
    { k: ['taller', 'talleres', 'proximo taller', 'plata de tu negocio', 'chatgpt para tu negocio'], a: function () {
        if (!estado('taller:vigente')) return 'El taller «La plata de tu negocio clara» ya se dictó. Próxima fecha: pronto. Escríbenos para avisarte. También preparamos «ChatGPT para tu negocio en 3 horas» (fecha por anunciar).';
        return 'El taller «La plata de tu negocio clara» es el ' + ev('taller.fecha', 'sábado 17 de octubre de 2026') + ', de ' + ev('taller.hora', '3:00 a 6:00 pm') + ', en ' + ev('taller.lugar', 'Valencia') + ', para un máximo de 6 personas. Cuesta ' + ev('taller.precio', '$25') + ' por persona, o ' + ev('taller.precioContado', '$20') + ' pagando de contado al reservar. ' + ev('taller.cupos', 'Máximo 6 personas') + '.'; },
      c: { l: 'Reservo mi cupo', h: wa('Hola F&V, quiero un cupo en el taller «La plata de tu negocio clara» (Línea Triangular) del sábado 17 de octubre'), wa: true, p: 'taller-plata-clara', ev: 'taller' } },
    { k: ['finanzas con ia', 'curso', 'cursos', 'aprender ia', 'profesor', 'cohorte', 'sabados', 'reservar', 'reservo', 'cupo', 'cupos', 'certificado', 'proxima cohorte', 'fechas', 'calendario', 'cuando empieza'], a: function () {
        if (!estado('curso:vigente')) return 'La próxima cohorte de Finanzas con IA se anunciará pronto. Escríbenos y te avisamos.';
        var s = 'Finanzas con IA son 3 sábados presenciales en Valencia, máximo 6 personas. ';
        s += estado('oct:vigente') ? 'Cohorte de octubre: ' + ev('curso.oct.fechas', 'sábados 10, 17 y 24 de octubre de 2026') + ' (' + ev('curso.oct.hora', '8:00 a.m. a 12:00 p.m.') + '). ' : '';
        s += estado('nov:vigente') ? 'Cohorte de noviembre: ' + ev('curso.nov.fechas', 'sábados 7, 14 y 21 de noviembre de 2026') + ' (' + ev('curso.nov.hora', '2:00 a 6:00 pm') + '). ' : '';
        return s + 'Cuesta ' + ev('curso.precio', '$299') + ' en 3 cuotas (' + ev('curso.cuotas', '$100, $100 y $99') + ', una por sábado) o ' + ev('curso.contado', '$239,20') + ' de contado. También está el taller «La plata de tu negocio clara» por $25.'; },
      c: { l: 'Ver fechas y reservar', h: '/cursos#fechas' } },
    { k: ['pago', 'pagar', 'pagos', 'forma de pago', 'formas de pago', 'usdt', 'zinli', 'binance', 'efectivo', 'pago movil', 'descuento', 'transferencia', 'zelle', 'adelanto', 'adelantado', 'cuotas', 'contado', 'anticipo'], a: 'Los precios son en dólares. Pagas en bolívares a la tasa BCV del día, o en USDT, Zinli o dólares en efectivo. Los planes mensuales se pagan mes a mes, sin descuento. Hay 20 % de descuento si pagas de contado un producto de pago único o si adelantas 3, 6, 9 o 12 meses. Los pagos únicos también se pueden pagar en 2 o 3 cuotas, sin descuento. Si no se paga la mensualidad, el servicio se pausa hasta ponerse al día.', c: ESCRIBIR },
    { k: ['permanencia', 'cancelar', 'cancelo', 'cancelacion', 'pausa', 'pausan', 'contrato'], a: 'Los planes mensuales los cancelas cuando quieras, salvo los que tienen permanencia mínima: Presencia en los tamaños Web y Tienda (12 meses) y el Asistente IA de WhatsApp (6 meses). Si no pagas la mensualidad, el servicio se pausa hasta que te pongas al día.', c: VER_TRI },
    { k: ['garantia', 'devolucion', 'reembolso', 'no me gusta', 'no me sirve', 'devuelven', 'devolver'], a: 'En los planes y productos de la Línea Triangular aplica nuestra garantía: si tu producto no queda como lo prometimos, lo corregimos sin costo. Si aun así no te sirve, te devolvemos tu dinero. Los meses pagados por adelantado no se reembolsan, salvo lo que cubre la garantía.', c: VER_TRI },
    { k: ['cuanto tarda', 'tarda', 'tardan', 'plazo', 'plazos', 'entrega', 'demora', 'cuando lo tengo', 'dias'], a: 'Plazos: Plan Arranque activo en 72 horas; Presencia Básico 48 horas, Catálogo 72 horas, Web 2 semanas y Tienda 3 semanas (la verificación de Google puede tardar unos días más); Caja Clara 48 a 72 horas; Tablero Ejecutivo 1 a 2 semanas; Asistente IA 5 a 7 días (disponible desde noviembre de 2026); Sesión Clara con resumen el mismo día. En la Línea Hexagonal, desde 72 horas hasta 3 meses según el proyecto.', c: VER_TRI },
    { k: ['diagnostico', 'agendar', 'agenda', 'cita', 'llamada', 'reunion', 'videollamada'], a: 'El diagnóstico inicial de 20 minutos es gratis. Elige el horario que te convenga en el calendario de la página de Contacto.', c: DIAG },
    { k: ['calculadora', 'calcular', 'margen', 'recargo'], a: 'Tenemos una calculadora gratis: pones tu costo y tu margen y te dice a cuánto vender en $ y en Bs con la tasa del día, y puedes descargar tu tabla de precios en PDF.', c: { l: 'Usar la calculadora', h: '/calculadora' } },
    { k: ['tasa', 'bcv', 'bolivares', 'dolar', 'euro'], a: 'Usamos la tasa oficial del BCV (dólar o euro) del día. En el tamaño Catálogo de Presencia y en Caja Clara los precios en bolívares se actualizan solos con esa tasa. Para calcular tus propios precios usa la calculadora gratis.', c: { l: 'Usar la calculadora', h: '/calculadora' } },
    { k: ['linea', 'lineas', 'triangular', 'hexagonal', 'diferencia'], a: 'Tenemos dos líneas. La Línea Triangular es para negocios pequeños y personas: de $4,99 a $299,99, la mayoría con pago mensual y activos en días. La Línea Hexagonal es para empresas: proyectos a la medida con soporte, desde $300. Lo que pagas en un paso se abona al siguiente.', c: VER_SOL },
    { k: ['habilitacion', 'capacitacion', 'equipo'], a: 'La Habilitación de equipos ($60 por persona, desde 3 personas, 1 sesión) es de la Línea Hexagonal, para empresas.', c: { l: 'Ver la Línea Hexagonal', h: '/hexagonal' } },
    { k: ['evaluacion', 'asesoria', 'auditoria', 'sprint', 'conciliacion', 'agente de ia', 'tablero gerencial', 'masterclass'], a: 'En Hexagonal: Asesoría Estratégica $150 (1 sesión + informe en 72 h) y Evaluación de Procesos $400 (1 semana), ambas se abonan si contratas la implementación; Sprint de Automatización desde $800, Conciliación Automática desde $900, Agente de IA a medida desde $1.000, Habilitación de equipos $60 por persona y Masterclass privada de $500 a $700.', c: { l: 'Ver Hexagonal', h: '/hexagonal' } },
    { k: ['odoo', 'dynamics', 'erp', 'crm', 'n8n', 'implementacion', 'sistema completo', 'desarrollo a medida', 'empresa grande', 'empresas'], a: 'La Línea Hexagonal es el sistema completo para empresas, siempre después de una evaluación y por fases: Odoo Community desde $2.000, Ecosistema de Automatización desde $2.500, Dynamics 365 Sales/Customer Service desde $3.000 + licencias y desarrollo a medida desde $3.000.', c: DIAG },
    { k: ['soporte', 'acompanamiento', 'despues del', 'incidencia'], a: 'El Acompañamiento Continuo de la Línea Hexagonal tiene tres niveles: Estándar $200/mes (8 h), Prioritario $400/mes (18 h) y Director de IA a tiempo parcial $600/mes (16 h + reunión semanal). Para negocios pequeños existe el Asesor Mensual, $119/mes (4 horas), de la Línea Triangular.', c: { l: 'Ver los niveles', h: '/acompanamiento-continuo' } },
    { k: ['donde', 'ubicacion', 'direccion', 'oficina', 'valencia', 'carabobo', 'venezuela', 'fuera de'], a: 'Estamos en Valencia, Carabobo (Av. La Rosario, Edif. Torre Trébol, Urb. Lomas del Este) y atendemos negocios y empresas de toda Venezuela por WhatsApp y videollamada. Los talleres y cursos son presenciales en Valencia.', c: { l: 'Ver el mapa', h: '/contacto#mapa' } },
    { k: ['refiere', 'referir', 'referido', 'comision', 'recomendar'], a: 'Si nos recomiendas a alguien y paga, te llevas el 10 % de lo que pague.', c: { l: 'Quiero referir a alguien', h: wa('Hola F&V, quiero referir a un cliente'), wa: true } },
    { k: ['caso', 'casos', 'clientes', 'testimonio', 'testimonios', 'resultados', 'referencias'], a: 'Estamos documentando nuestros primeros casos. Si quieres ser uno de ellos, pregunta por el precio de lanzamiento.', c: { l: 'Ver casos', h: '/casos' } },
    { g: 1, k: ['precio', 'precios', 'cuanto cuesta', 'cuesta', 'costo', 'costos', 'tarifa', 'vale', 'cuanto', 'barato'], a: 'Todos los precios están publicados, en dólares: la Línea Triangular va de $4,99 a $299,99 (la mayoría por mes) y la Línea Hexagonal es desde $300. Pagas en bolívares a la tasa BCV del día.', c: VER_SOL },
    { g: 1, k: ['empezar', 'primer paso', 'arrancar', 'como empiezo', 'que me recomiendan', 'recomiendan', 'no se cual', 'productos', 'tienen', 'servicios', 'ofrecen'], a: 'Si tienes un negocio pequeño, el Plan Arranque ($39 al mes) es el mejor punto de partida: Google Maps, catálogo con tasa BCV y control de caja. Si eres una empresa, empieza con el diagnóstico gratis de 20 minutos.', c: VER_TRI },
    { g: 1, k: ['contacto', 'humano', 'persona', 'asesor', 'hablar', 'whatsapp', 'llamar', 'telefono', 'correo', 'email'], a: 'Con gusto. Escríbenos por WhatsApp (+58 424 412 5386) y te respondemos el mismo día de lunes a viernes, o agenda tu diagnóstico gratis.', c: ESCRIBIR },
    { g: 1, k: ['gracias', 'chao', 'adios', 'hasta luego', 'listo'], a: 'Con gusto. Si te surge otra duda, aquí estoy.', c: VER_TRI }
  ];

  function normalizar(t) { return ' ' + String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9$ ]+/g, ' ').replace(/\s+/g, ' ').trim() + ' '; }
  function buscar(texto) {
    var n = normalizar(texto), mejor = null, puntaje = 0;
    RESPUESTAS.forEach(function (r) {
      var p = 0;
      r.k.forEach(function (kw) { if (n.indexOf(' ' + kw) !== -1) p = Math.max(p, kw.length + (n.indexOf(' ' + kw + ' ') !== -1 ? 2 : 0)); });
      if (r.g) p = p * 0.5; // las respuestas generales pierden contra las de un producto concreto
      if (p > puntaje) { puntaje = p; mejor = r; }
    });
    return mejor;
  }

  /* ---------- interfaz ---------- */
  var path = location.pathname.replace(/\/$/, '') || '/';
  var QUICK = {
    '/triangular': ['¿Qué incluye el Plan Arranque?', '¿Cómo pago?', '¿Puedo cancelar?', '¿Hay garantía?'],
    '/paginas-web': ['¿Cuánto cuesta una web?', '¿Cuánto tarda?', '¿El dominio está incluido?', '¿Cómo pago?'],
    '/cursos': ['¿Cuándo es el próximo taller?', '¿Cuánto cuesta Finanzas con IA?', '¿Cómo reservo mi cupo?'],
    '/curso-finanzas-ia': ['¿Cuándo empieza?', '¿Cuánto cuesta?', '¿Cómo reservo mi cupo?'],
    '/calculadora': ['¿Cómo se calcula el margen?', '¿De dónde sale la tasa?', '¿Cómo pago?'],
    '/hexagonal': ['¿Cuál es la diferencia entre las líneas?', '¿Cuánto cuesta una evaluación?', '¿Dan soporte después?'],
    '/contacto': ['¿Cómo agendo el diagnóstico?', '¿En cuánto tiempo responden?', '¿Dónde están?']
  };
  var quickReplies = QUICK[path] || (/^\/(asesoria|evaluacion|despliegue|habilitacion|masterclasses|acompanamiento)/.test(path) ? QUICK['/hexagonal'] : ['¿Cuánto cuesta?', '¿Qué productos tienen?', '¿Cómo pago?', '¿Cuándo es el próximo taller?']);

  var css = document.createElement('style');
  css.textContent = '.luci-cta{display:inline-flex;align-items:center;gap:6px;margin-top:8px;padding:8px 12px;border-radius:8px;font-family:"Space Grotesk",sans-serif;font-size:12.5px;font-weight:600;background:rgba(var(--acento-1-rgb),.12);border:1px solid rgba(var(--acento-1-rgb),.5);color:var(--acento-1);text-decoration:none;transition:background-color .18s cubic-bezier(.23,1,.32,1),transform .18s cubic-bezier(.23,1,.32,1)}.luci-cta:active{transform:scale(.97)}@media (hover:hover) and (pointer:fine){.luci-cta:hover{background:rgba(var(--acento-1-rgb),.22)}}' +
    '.luci-wrap{max-width:85%}.luci-wrap .luci-bubble-bot{max-width:100%}#luci-pill{position:absolute;left:calc(100% + 12px);top:50%;transform:translateY(-50%);white-space:nowrap;display:none;background:#0D0E12;border:1px solid rgba(0,255,255,.35);color:#fff;font:600 12.5px "Space Grotesk",sans-serif;padding:9px 14px;border-radius:999px;box-shadow:0 8px 24px rgba(0,0,0,.5);cursor:pointer}@media (min-width:768px){#luci-pill{display:block}}#luci-pill[hidden]{display:none!important}';
  document.head.appendChild(css);

  toggle.setAttribute('aria-label', TEXTO_BOTON); toggle.setAttribute('title', TEXTO_BOTON); toggle.setAttribute('aria-expanded', 'false');
  panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Luci, asistente virtual de F&V');
  messages.setAttribute('role', 'log'); messages.setAttribute('aria-live', 'polite');
  input.setAttribute('placeholder', 'Escribe tu pregunta...'); input.setAttribute('aria-label', 'Escribe tu pregunta para Luci');
  var sub = panel.querySelector('p.text-\\[11px\\]'); if (sub) sub.textContent = 'Asistente virtual · responde al instante';
  var hintOpen = document.getElementById('luci-hint-open'); if (hintOpen) hintOpen.textContent = TEXTO_BOTON;
  var pill = null;
  {
    pill = document.createElement('button'); pill.type = 'button'; pill.id = 'luci-pill'; pill.textContent = TEXTO_BOTON; pill.setAttribute('tabindex', '-1'); pill.setAttribute('aria-hidden', 'true');
    toggle.parentNode.appendChild(pill);
    pill.addEventListener('click', function () { abrir(); });
  }

  function mensaje(texto, de, cta) {
    var box = document.createElement('div');
    if (de === 'user') { box.className = 'luci-bubble-user'; box.textContent = texto; messages.appendChild(box); }
    else {
      box.className = 'luci-wrap';
      var b = document.createElement('div'); b.className = 'luci-bubble-bot'; b.textContent = texto; box.appendChild(b);
      if (cta) {
        var a = document.createElement('a'); a.className = 'luci-cta'; a.href = cta.h; a.textContent = cta.l + ' →';
        if (/^https?:/.test(cta.h)) { a.target = '_blank'; a.rel = 'noopener'; }
        a.setAttribute('data-cta', 'luci');
        if (cta.p) a.setAttribute('data-product', cta.p);
        if (cta.ev) a.setAttribute('data-ev-wa', cta.ev);
        box.appendChild(a);
      }
      messages.appendChild(box);
    }
    messages.scrollTop = messages.scrollHeight;
  }
  function opciones(lista) {
    quick.innerHTML = '';
    lista.forEach(function (t) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'luci-quick-btn'; b.textContent = t;
      b.addEventListener('click', function () { preguntar(t); });
      quick.appendChild(b);
    });
  }
  function escribiendo() {
    var t = document.createElement('div'); t.className = 'luci-typing'; t.setAttribute('role', 'status'); t.setAttribute('aria-label', 'Luci está escribiendo'); t.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(t); messages.scrollTop = messages.scrollHeight; return t;
  }
  var respondiendo = false;
  function preguntar(texto) {
    mensaje(texto, 'user'); quick.innerHTML = '';
    if (respondiendo) return; respondiendo = true;
    var enviar = form.querySelector('button[type="submit"]'); if (enviar) enviar.disabled = true; messages.setAttribute('aria-busy', 'true');
    var r = buscar(texto), t = escribiendo();
    setTimeout(function () {
      t.remove(); respondiendo = false; if (enviar) enviar.disabled = false; messages.removeAttribute('aria-busy');
      if (r) mensaje(typeof r.a === 'function' ? r.a() : r.a, 'bot', r.c);
      else mensaje('No tengo una respuesta preparada para eso todavía. Escríbenos por WhatsApp y una persona del equipo te responde el mismo día de lunes a viernes.', 'bot', ESCRIBIR);
      opciones(quickReplies.slice(0, 3));
      if (window.FV_EVENTOS && window.FV_EVENTOS.refrescar) window.FV_EVENTOS.refrescar();
    }, 400 + Math.round(Math.random() * 300)); // 400 a 700 ms de "escribiendo…" antes de cada respuesta
  }

  var iniciado = false;
  function abrir() {
    panel.classList.add('is-open'); toggle.setAttribute('aria-expanded', 'true'); if (pill) pill.hidden = true;
    var h = document.getElementById('luci-hint'); if (h) h.classList.remove('is-visible');
    if (!iniciado) {
      iniciado = true;
      mensaje('Hola, soy Luci, la asistente virtual de F&V. Respondo al instante, las 24 horas. ¿En qué te ayudo?', 'bot');
      opciones(quickReplies);
    }
    setTimeout(function () { input.focus(); }, 80);
  }
  function cerrar() { panel.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); if (pill) pill.hidden = false; toggle.focus(); }
  toggle.addEventListener('click', function () { panel.classList.contains('is-open') ? cerrar() : abrir(); });
  if (hintOpen) hintOpen.addEventListener('click', abrir);
  closeBtn.addEventListener('click', cerrar);
  panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrar(); });
  form.addEventListener('submit', function (e) { e.preventDefault(); var v = input.value.trim(); if (!v) return; input.value = ''; preguntar(v); });
  window.FV_LUCI = { buscar: buscar, abrir: abrir, respuestas: RESPUESTAS };
})();
