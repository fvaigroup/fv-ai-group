/* Luci: asistente virtual de F&V (compartida por todas las páginas).
   No es un modelo de IA: busca palabras clave en la pregunta y responde con textos preparados por el equipo.
   Cada respuesta termina con un botón de acción (producto por WhatsApp, página del catálogo o /contacto#agenda).
   Estructura del sitio: «servicios» (a la medida, con el equipo de F&V; ⬡ empresas e instituciones, «usted») y
   «productos» (precio fijo; sobre todo ▲ negocios pequeños, «tú»). Los nombres «Línea Hexagonal/Triangular» solo existen en el inicio:
   aquí se usa la forma (⬡, ▲) o «empresas e instituciones» / «negocios pequeños».
   Para cambiar un precio, un plazo o una respuesta, edita la lista RESPUESTAS de abajo (los precios salen de data/catalogo.json;
   tests/buscador-luci.test.js avisa si dejan de coincidir). Las fechas de talleres y cursos salen de assets/eventos.js (FV_EVENTOS),
   así que no hay que tocarlas aquí. */
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
  function sinFechas() { return (window.FV_EVENTOS && window.FV_EVENTOS.sinFechas) || 'Próximas fechas: escríbenos por WhatsApp'; }
  function estado(k) { try { return window.FV_EVENTOS ? window.FV_EVENTOS.estado[k] : true; } catch (e) { return true; } }
  // ▲ productos para negocios pequeños: «quiero X (▲, $39,99/mes). ¿Cómo pago?». p = id del ítem en el catálogo (para la medición).
  function pedir(nombre, precio, p) { return { l: 'Lo quiero por WhatsApp', h: wa('Hola F&V, quiero ' + nombre + ' (▲, ' + precio + '). ¿Cómo pago?'), wa: true, p: p }; }
  // ⬡ empresas e instituciones: «me interesa X (⬡, $960).»
  function interes(nombre, precio, p, conversar) { return { l: 'Lo quiero por WhatsApp', h: wa('Hola F&V, me interesa ' + nombre + ' (⬡, ' + precio + ').' + (conversar ? ' ¿Podemos conversar?' : '')), wa: true, p: p }; }
  var VER_SERV = { l: 'Ver los servicios', h: '/servicios' };
  var VER_PROD = { l: 'Ver los productos', h: '/productos' };
  var VER_AMBOS = { l: 'Ver servicios y productos', h: '/#lineas' };
  var VER_SOFT = { l: 'Ver el software', h: '/productos#software' };
  var VER_IMPL = { l: 'Ver la implementación a medida', h: '/servicios#implementacion' };
  // En las páginas de servicios (⬡) la llamada gratuita se llama «Consulta gratis de 20 min» (para no confundirla con el Diagnóstico de $270).
  var RUTA = location.pathname.replace(/\/$/, '') || '/';
  var PAGINA_HEX = /^\/(servicios|ejecutivos|calculadora-roi)/.test(RUTA);
  var DIAG = { l: PAGINA_HEX ? 'Agendar consulta gratis de 20 min' : 'Agendar diagnóstico gratis', h: '/contacto#agenda' };
  var DIAG270 = { l: 'Agendar el Diagnóstico por WhatsApp', h: wa('Hola F&V, quiero agendar el Diagnóstico «¿En qué se va la plata de su empresa?» (⬡, $270).'), wa: true, p: 'diagnostico-270' };
  var VER_DIAG = { l: 'Ver el Diagnóstico', h: '/servicios/diagnostico' };
  var VER_EJEC = { l: 'Ver la página para dueños', h: '/ejecutivos' };
  var ABONO = 'Si después contrata la implementación, los $270 se abonan al proyecto.';
  var ESCRIBIR = { l: 'Escribir por WhatsApp', h: wa('Hola F&V, tengo una consulta'), wa: true };

  // k = palabras clave (sin tildes, en minúsculas; coincide con el inicio de una palabra, así "curso" también encuentra "cursos")
  // g = respuesta general: pierde contra la de un producto o servicio concreto (puntaje × 0,5, o × f si lo trae)
  var RESPUESTAS = [
    { g: 1, k: ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'saludos'], a: 'Hola, ¿en qué te ayudo? Puedo contarte de servicios y productos, precios, plazos, formas de pago, cursos y talleres.', c: VER_AMBOS },
    { k: ['eres una ia', 'eres ia', 'eres un bot', 'eres humano', 'eres real', 'eres una persona', 'quien eres', 'que eres', 'robot', 'persona real'], a: 'Soy Luci, una asistente virtual: respondo al instante y a cualquier hora con respuestas que preparó el equipo de F&V. No soy una persona. Para algo más específico escríbenos por WhatsApp y te respondemos el mismo día de lunes a viernes.', c: ESCRIBIR },
    { k: ['horario', 'responden', 'respuesta', 'atienden', 'atencion', 'abren', 'fin de semana', 'domingo'], a: function () { return HORARIO; }, c: ESCRIBIR },
    { k: ['software', 'aplicacion', 'aplicaciones', 'app', 'apps'], a: 'Tenemos tres apps de software por mensualidad: Club (cuotas de socios), Condominio (recibos y gastos) y Gym (membresías y entrada con QR). Para empresas e instituciones (⬡) van desde $190/mes, según el tamaño, y para organizaciones pequeñas (▲) desde $89,99/mes. Si pagas 12 meses por adelantado tienes 30 % de descuento.', c: VER_SOFT },
    { k: ['club', 'clubes', 'cuotas de socios', 'cuotas del club', 'junta directiva', 'asociacion deportiva'], a: 'Club es nuestro software para que los clubes cobren y controlen las cuotas de sus socios: cada socio ve en su teléfono cuánto debe y reporta su pago, la administración aprueba con un clic y la junta ve la morosidad en tiempo real. Va desde $89,99/mes para clubes pequeños y asociaciones (▲), y desde $190/mes para clubes sociales e instituciones (⬡). Te lo mostramos en una demo de 20 minutos.', c: { l: 'Ver Club', h: '/club' } },
    { k: ['condominio', 'condominios', 'alicuota', 'alicuotas', 'edificio', 'edificios', 'propietarios', 'recibo de condominio'], a: 'Condominio es nuestro software para cobrar el condominio a tiempo y mostrar en qué se gasta cada dólar: cada propietario ve su recibo explicado por alícuota y los gastos con sus facturas, reporta su pago en 30 segundos y la junta o la administradora aprueba con un clic. Va desde $89,99/mes para un edificio (▲) y desde $190/mes para administradoras y conjuntos grandes (⬡).', c: { l: 'Ver Condominio', h: '/condominio' } },
    { k: ['gym', 'gimnasio', 'gimnasios', 'membresia', 'membresias', 'miembros del gimnasio', 'entrada con qr'], a: 'Gym es nuestro software para cobrar las membresías de un gimnasio sin perseguir a nadie: cada miembro ve su vencimiento, entra con un código QR y reserva clases, y el dueño ve quién pagó, quién vino y cuánto entró. Va desde $89,99/mes para un gimnasio (▲) y desde $190/mes para cadenas con varias sedes (⬡).', c: { l: 'Ver Gym', h: '/gym' } },
    { k: ['plan arranque', 'arranque', 'pack', 'paquete'], a: 'El Plan Arranque cuesta $39,99 al mes (por separado, $44,98): Presencia Catálogo + Caja Clara, para que te encuentren, te compren por WhatsApp y sepas cuánto ganas. Activo en 72 horas y cancelas cuando quieras. Pagando 12 meses por adelantado son $335,92 (30 % menos).', c: pedir('el Plan Arranque', '$39,99/mes', 'plan-arranque') },
    { k: ['presencia', 'negocio visible', 'google maps', 'maps', 'ficha', 'verificacion', 'qr', 'pagina web', 'paginas web', 'sitio web', 'una web', 'tienda online', 'tienda', 'dominio', 'hosting'], a: 'Presencia tiene cuatro tamaños: Básico $14,99/mes (ficha de Google Maps, WhatsApp Business y QR, activo en 48 horas), Catálogo $29,99/mes (suma tu catálogo con precios en $ y Bs a tasa BCV, 72 horas), Web $59,99/mes (web de hasta 5 secciones, correo profesional y estadísticas, 2 semanas, permanencia mínima de 12 meses) y Tienda $99,99/mes (con carrito de compras, 3 semanas, permanencia mínima de 12 meses). El dominio se paga aparte (alrededor de US$12 al año). La verificación de Google puede tardar unos días más y no depende de nosotros.', c: { l: 'Ver Presencia', h: '/paginas-web' } },
    { k: ['catalogo', 'menu digital', 'demo', 'bodegon'], a: 'El tamaño Catálogo de Presencia cuesta $29,99/mes: tu catálogo o menú en una página, con precios en $ y Bs que se actualizan solos con la tasa BCV, pedidos por WhatsApp y cambios de precios ilimitados. Activo en 72 horas. Puedes ver la demo en vivo.', c: { l: 'Ver demo en vivo', h: '/demo-catalogo' } },
    { k: ['caja clara', 'cuadre', 'cuanto gane', 'cuanto gano', 'cobranza', 'cobrar', 'cuentas por cobrar', 'me deben', 'inventario', 'stock', 'cotizador', 'presupuesto'], a: 'Caja Clara tiene tres tamaños: Caja $14,99/mes (cuadre diario en Bs, $, Pago Móvil y USDT con tasa BCV automática, reporte semanal y 45 minutos de capacitación, 48 horas), Caja y cobros $29,99/mes (suma cuentas por cobrar con alertas, mensajes de cobro listos y cotizador en $ y Bs con PDF, 72 horas) y Administración completa $39,99/mes (suma inventario con entradas, salidas y mínimos, 72 horas).', c: pedir('Caja Clara, tamaño Caja', '$14,99/mes', 'caja-clara-caja') },
    { g: 1, k: ['tablero', 'tableros'], a: 'Hay dos tableros. El Tablero Gerencial es para empresas e instituciones (⬡) y se hace a la medida: ventas, caja, cobranza y margen en un solo lugar, desde $600 (precio final después del diagnóstico). El Tablero Ejecutivo es para negocios pequeños (▲): tus números clave en una sola pantalla, desde $79,99/mes.', c: { l: 'Ver el Tablero Gerencial', h: '/servicios/tablero-gerencial' } },
    { k: ['tablero ejecutivo', 'indicadores', 'dashboard'], a: 'El Tablero Ejecutivo muestra tus números clave (ventas, gastos, margen, cobros y lo más vendido) en una sola pantalla, desde el teléfono. Pyme $79,99/mes (1 fuente de datos, hasta 8 indicadores y reporte semanal por WhatsApp, 1 semana) y Pro $149,99/mes (hasta 3 fuentes, 15 indicadores y una reunión mensual de 30 minutos, 2 semanas).', c: pedir('el Tablero Ejecutivo, tamaño Pyme', '$79,99/mes', 'tablero-ejecutivo-pyme') },
    { k: ['asistente ia', 'asistente', 'chatbot', 'bot de whatsapp', 'responder por whatsapp', 'automatico'], a: 'El Asistente IA de WhatsApp cuesta $119,99/mes, o $179,99/mes con Instagram, agenda de citas y datos de cada cliente. Responde precios, horarios y ubicación las 24 horas, toma pedidos o citas y te pasa lo difícil. Instalación incluida, permanencia mínima de 6 meses y entrega en 5 a 7 días. Está disponible desde noviembre de 2026.', c: pedir('el Asistente IA de WhatsApp, tamaño WhatsApp', '$119,99/mes', 'asistente-ia-whatsapp') },
    { k: ['mis finanzas claras', 'finanzas personales', 'finanzas claras'], a: 'Mis Finanzas Claras cuesta $4,99 (pago único): tu hoja personal de cuentas en Bs, $ y USDT, lista para copiar.', c: pedir('Mis Finanzas Claras', '$4,99, pago único', 'mis-finanzas-claras') },
    { k: ['taller', 'talleres', 'proximo taller', 'plata de tu negocio'], a: function () {
        if (!window.FV_EVENTOS || !estado('taller:vigente')) return 'El taller «La plata de tu negocio clara» es presencial en Valencia, de 3 horas, para un máximo de 6 personas, y cuesta ' + ev('taller.precio', '$24,99') + ' por persona. ' + sinFechas() + '.';
        return 'El taller «La plata de tu negocio clara» es el ' + ev('taller.fecha', 'próximo día anunciado') + ', de ' + ev('taller.hora', '3:00 a 6:00 pm') + ', en ' + ev('taller.lugar', 'Valencia') + ', para un máximo de 6 personas. Cuesta ' + ev('taller.precio', '$24,99') + ' por persona. ' + ev('taller.cupos', 'Máximo 6 personas') + '.'; },
      c: { l: 'Reservo mi cupo', h: wa('Hola F&V, quiero un cupo en el taller «La plata de tu negocio clara» (▲, ' + ev('taller.precio', '$24,99') + ').'), wa: true, p: 'taller-plata-clara', ev: 'taller' } },
    { k: ['finanzas con ia', 'curso', 'cursos', 'clases', 'aprender ia', 'profesor', 'cohorte', 'sabados', 'reservar', 'reservo', 'cupo', 'cupos', 'certificado', 'proxima cohorte', 'fechas', 'calendario', 'cuando empieza'], a: function () {
        var s = 'Finanzas con IA son 3 sábados presenciales en Valencia, máximo 6 personas. ';
        var cohortes = window.FV_EVENTOS && window.FV_EVENTOS.proximas ? window.FV_EVENTOS.proximas().filter(function (e) { return e.tipo === 'curso'; }) : [];
        s += cohortes.length ? 'Próximas cohortes: ' + cohortes.map(function (e) { return e.texto; }).join('; ') + '. ' : sinFechas() + '. ';
        return s + 'Cuesta ' + ev('curso.precio', '$299,99') + ' en 3 cuotas (' + ev('curso.cuotas', '$100,00, $100,00 y $99,99') + ', una por sábado). También está el taller «La plata de tu negocio clara» por ' + ev('taller.precio', '$24,99') + '. Si eres dueño o directivo y no puedes los sábados, mira el Programa ejecutivo entre semana.'; },
      c: { l: 'Ver fechas y reservar', h: '/curso-finanzas-ia' } },
    { k: ['descuento', 'descuentos', 'adelantado', 'por adelantado', '12 meses', 'pago anual', 'anual', 'promocion', 'oferta'], a: 'Tienes 30 % de descuento si pagas 12 meses por adelantado en los planes mensuales y en las apps de software (por ejemplo, el Plan Arranque pasa de $39,99 al mes a $335,92 por el año). Y si llegas recomendado por un cliente de F&V, tienes 10 % de descuento en tu primer pago.', c: VER_PROD },
    { k: ['pago', 'pagar', 'pagos', 'forma de pago', 'formas de pago', 'usdt', 'zinli', 'binance', 'efectivo', 'pago movil', 'transferencia', 'zelle', 'adelanto', 'cuotas', 'contado', 'anticipo'], a: 'Los precios son en dólares. Pagas en bolívares a la tasa BCV del día, o en USDT, Zinli o dólares en efectivo. Los planes mensuales se pagan mes a mes. Los pagos únicos se pagan de contado o en 2 o 3 cuotas, siempre al mismo precio. Si pagas 12 meses por adelantado tienes 30 % de descuento. Si no se paga la mensualidad, el servicio se pausa hasta ponerse al día. Para empresas e instituciones (⬡) se paga en bolívares a la tasa BCV del día, dólares, Pago Móvil o USDT, y los proyectos se reservan con el 50 %.', c: ESCRIBIR },
    { k: ['permanencia', 'cancelar', 'cancelo', 'cancelacion', 'pausa', 'pausan', 'contrato'], a: 'Los planes mensuales los cancelas cuando quieras, salvo los que tienen permanencia mínima: Presencia en los tamaños Web y Tienda (12 meses) y el Asistente IA de WhatsApp (6 meses). Si no pagas la mensualidad, el servicio se pausa hasta que te pongas al día.', c: VER_PROD },
    { k: ['garantia', 'devolucion', 'reembolso', 'no me gusta', 'no me sirve', 'devuelven', 'devolver'], a: 'En los productos para negocios pequeños (▲) aplica nuestra garantía: si tu producto no queda como lo prometimos, lo corregimos sin costo. Si aun así no te sirve, te devolvemos tu dinero. Los meses pagados por adelantado no se reembolsan, salvo lo que cubre la garantía.', c: VER_PROD },
    { k: ['cuanto tarda', 'tarda', 'tardan', 'plazo', 'plazos', 'entrega', 'demora', 'cuando lo tengo', 'dias'], a: 'Plazos de los productos (▲): Plan Arranque activo en 72 horas; Presencia Básico 48 horas, Catálogo 72 horas, Web 2 semanas y Tienda 3 semanas (la verificación de Google puede tardar unos días más); Caja Clara 48 a 72 horas; Tablero Ejecutivo 1 a 2 semanas; Asistente IA 5 a 7 días (disponible desde noviembre de 2026). En los servicios para empresas e instituciones (⬡), el Diagnóstico es un día presencial en la empresa y la implementación va de 2 semanas a 3 meses según el proyecto.', c: VER_AMBOS },
    { k: ['diagnostico', 'agendar', 'agenda', 'cita', 'llamada', 'reunion', 'videollamada'], a: function () { return PAGINA_HEX ? 'Hay dos pasos. La consulta gratis de 20 minutos, por videollamada, para conocer su caso: elija el horario en el calendario de Contacto. Y el Diagnóstico «¿En qué se va la plata de su empresa?» ($270): un día presencial en su empresa, revisión de sus números y reportes, informe escrito de dónde se pierde el dinero y plan de acción de 30 días. ' + ABONO : 'La llamada inicial de 20 minutos es gratis: elige el horario que te convenga en el calendario de la página de Contacto. Para empresas con estructura también está el Diagnóstico «¿En qué se va la plata de su empresa?» ($270), un día presencial con informe y plan de 30 días.'; }, c: DIAG },
    { k: ['diagnostico de $270', 'diagnostico de 270', 'cuanto cuesta el diagnostico', 'precio del diagnostico', 'que es el diagnostico', 'que incluye el diagnostico',  'que incluye el diagnostico', '$270', '270', 'en que se va la plata', 'se va la plata', 'plata de su empresa', 'plata de mi empresa', 'diagnostico presencial', 'asesoria estrategica', 'consultoria', 'evaluacion', 'auditoria'], a: 'El Diagnóstico «¿En qué se va la plata de su empresa?» cuesta $270 (⬡). Es un día presencial en su empresa: revisamos sus números y reportes, le entregamos un informe escrito de dónde se pierde el dinero y un plan de acción de 30 días. ' + ABONO + ' Si hace falta revisar los procesos área por área, esa evaluación es una etapa a medida, después del diagnóstico.', c: DIAG270 },
    { k: ['calculadora', 'calcular', 'margen', 'recargo'], a: 'Tenemos una calculadora gratis: pones tu costo y tu margen y te dice a cuánto vender en $ y en Bs con la tasa del día, y puedes descargar tu tabla de precios en PDF.', c: { l: 'Usar la calculadora', h: '/calculadora' } },
    { k: ['tasa', 'bcv', 'bolivares', 'dolar', 'euro'], a: 'Usamos la tasa oficial del BCV (dólar o euro) del día. En el tamaño Catálogo de Presencia y en Caja Clara los precios en bolívares se actualizan solos con esa tasa. Para calcular tus propios precios usa la calculadora gratis.', c: { l: 'Usar la calculadora', h: '/calculadora' } },
    { k: ['diferencia entre servicios y productos', 'servicios y productos', 'servicio o producto', 'producto o servicio', 'que es un servicio', 'que es un producto', 'diferencia', 'a la medida', 'precio fijo', 'tipo de negocio', 'cual me conviene', 'cual me corresponde', 'cual es para mi'], a: 'Servicio: el equipo de F&V trabaja con usted, en su empresa o con su equipo. Producto: listo para usar, con el mismo precio y la misma entrega para todos. Los servicios son para empresas e instituciones (⬡), donde decide una estructura, y casi todos se cotizan a la medida después del Diagnóstico. Los productos son sobre todo para negocios pequeños (▲), donde decide el dueño, con el precio publicado; el software y el Programa ejecutivo también tienen opciones para empresas e instituciones. ¿No sabes cuál? Menos de 20 personas: productos. Más de 20, varias sedes o junta directiva: servicios. Un negocio pequeño que factura mucho sigue siendo ▲, una empresa grande que pide algo pequeño es ⬡, y si tu organización crece, cambias de una a otra.', c: VER_AMBOS },
    { g: 1, k: ['servicios', 'servicio', 'que servicios'], a: 'Los servicios son para empresas e instituciones (⬡): el equipo de F&V trabaja con usted, en su empresa o con su equipo. Hay cuatro grupos: Diagnóstico y consultoría (Diagnóstico $270), Implementación y automatización (a medida, se cotiza después del diagnóstico), Formación (formación ejecutiva $960, formación para su equipo, masterclass privada) y Acompañamiento y asesoría (Asesor financiero con IA desde $120 al mes y soporte técnico desde $200 al mes).', c: VER_SERV },
    { g: 1, k: ['productos', 'producto', 'que productos'], a: 'Los productos vienen listos para usar, con el mismo precio y la misma entrega para todos. Hay seis grupos: Software (Club, Condominio y Gym), Cursos y programas, Para empezar (Plan Arranque $39,99 al mes y Mis Finanzas Claras $4,99), Presencia y web (desde $14,99 al mes), Control y finanzas (Caja Clara y Tablero Ejecutivo) y Ventas y atención (Asistente IA de WhatsApp, desde $119,99 al mes).', c: VER_PROD },
    { k: ['habilitacion', 'capacitacion', 'equipo', 'formacion para su equipo', 'formacion del equipo', 'capacitar'], a: 'Para empresas e instituciones (⬡): la Formación para su equipo es a medida, en las herramientas y sistemas de su empresa, y se cotiza según el equipo y el temario.', c: { l: 'Ver la formación para equipos', h: '/servicios/formacion-equipo' } },
    { k: ['masterclass', 'masterclasses', 'workshop'], a: 'La Masterclass privada es IA aplicada al trabajo de su empresa, para hasta 8 personas, de 3 horas por sesión. Cuesta de $500 a $700 por sesión (⬡).', c: { l: 'Ver la masterclass privada', h: '/servicios/masterclass-privada' } },
    { k: ['finanzas con ia en su sede', 'finanzas con ia en la empresa', 'curso en la empresa', 'en sus oficinas', 'en su sede'], a: 'Finanzas con IA en su sede (⬡) es el curso de conciliación de pagos con IA, dado en sus oficinas, en 2 sesiones. Cuesta $600 por grupo de hasta 6 personas.', c: { l: 'Ver Finanzas con IA en su sede', h: '/servicios/finanzas-ia-sede' } },
    { k: ['sprint', 'conciliacion', 'agente de ia', 'tablero gerencial', 'reportes automaticos', 'reportes por whatsapp', 'automatizacion', 'automatizaciones', 'web corporativa'], a: 'Para empresas e instituciones (⬡) la implementación es a medida y se cotiza después del diagnóstico. Como referencia: Tablero Gerencial desde $600, Sprint de Automatización desde $800, Conciliación Automática desde $900, Web Corporativa + CRM desde $900 y Agente de IA a medida desde $1.000 más mensualidad; en todos, el precio final después del diagnóstico. Los reportes automáticos por WhatsApp también se cotizan a medida.', c: VER_IMPL },
    { k: ['odoo', 'dynamics', 'erp', 'crm', 'n8n', 'implementacion', 'sistema completo', 'desarrollo a medida', 'empresa grande', 'empresas'], a: 'Para empresas e instituciones (⬡) el sistema completo es a medida, por fases y siempre después del Diagnóstico de $270. Como referencia: Odoo Community desde $2.000, Ecosistema de Automatización desde $2.500, Dynamics 365 Sales/Customer Service desde $3.000 más licencias y desarrollo a medida desde $3.000; en todos, el precio final después del diagnóstico.', c: VER_IMPL },
    { k: ['soporte', 'soporte tecnico', 'acompanamiento', 'despues del', 'incidencia', 'director de ia', 'mantenimiento'], a: 'El Acompañamiento Continuo (⬡) es soporte técnico de los sistemas y automatizaciones que ya están implementados: Estándar $200/mes (8 h), Prioritario $400/mes (18 h) y Director de IA a tiempo parcial $600/mes (16 h + reunión semanal). Si lo que busca es apoyo con las finanzas y las decisiones de la empresa, eso es el Asesor financiero con IA ($120 o $480 al mes).', c: { l: 'Ver los niveles', h: '/servicios/acompanamiento' } },
    { k: ['asesor', 'asesores', 'asesor financiero', 'asesoria', 'asesoria financiera', 'finanzas de mi empresa', 'finanzas de la empresa', 'kpi', 'kpis', 'margenes', 'rentabilidad'], a: 'El Asesor financiero con IA (⬡) acompaña al dueño en las finanzas y las decisiones de la empresa: revisión de indicadores, márgenes y alertas, con reportes cortos por WhatsApp. $120 al mes con 1 reunión de hasta 4 horas, o $480 al mes con 1 reunión semanal de hasta 4 horas. Es distinto del Acompañamiento Continuo, que es soporte técnico de lo ya implementado.', c: interes('el Asesor financiero con IA', '$120 o $480 al mes', 'asesor-financiero', true) },
    { k: ['programa ejecutivo', 'entre semana', 'martes', 'jueves', 'no puedo los sabados', 'sabados no', 'grupo pequeno'], a: 'El Programa ejecutivo entre semana (⬡) es para dueños y directivos: martes y jueves en la mañana, 10 horas (2 días de 5 horas) en nuestra oficina de Torre Trébol, en Valencia, con estacionamiento. Privado o en grupo pequeño, con refrigerio y diploma. $270 individual o $180 por persona en grupo de 2 a 4.', c: { l: 'Ver el programa', h: '/ejecutivos#programa-ejecutivo' } },
    { k: ['formacion ejecutiva', '1 a 1', 'uno a uno', 'clases privadas', 'curso privado', 'mcp', 'api', 'apis'], a: 'La Formación ejecutiva 1 a 1 (⬡) son 8 sesiones de 4 horas de IA aplicada a finanzas y gestión: Claude, reportes, automatizaciones, MCP y APIs explicados para dueños. Cuesta $960.', c: interes('la Formación ejecutiva 1 a 1', '$960', 'formacion-ejecutiva') },
    { k: ['dueno', 'duenos', 'dueno de empresa', 'ejecutivo', 'ejecutivos', 'directivo', 'directivos', 'gerente', 'gerentes', 'gerencia', 'presidente'], a: 'Para dueños y directivos de empresas tenemos una página propia: el Diagnóstico «¿En qué se va la plata de su empresa?» ($270), el Programa ejecutivo entre semana (martes y jueves en la mañana, $270 individual o $180 por persona en grupo de 2 a 4), la Formación ejecutiva 1 a 1 ($960) y el Asesor financiero con IA ($120 o $480 al mes).', c: VER_EJEC },
    { k: ['donde', 'ubicacion', 'direccion', 'oficina', 'valencia', 'carabobo', 'venezuela', 'fuera de'], a: 'Estamos en Valencia, Carabobo (Av. La Rosario, Edif. Torre Trébol, Urb. Lomas del Este) y atendemos negocios y empresas de toda Venezuela por WhatsApp y videollamada. Los talleres y cursos son presenciales en Valencia.', c: { l: 'Ver el mapa', h: '/contacto#mapa' } },
    { k: ['recomendado', 'recomendados', 'recomendacion', 'recomendar a', 'recomiendo a', 'recomiendas a', 'si te recomiendo', 'si los recomiendo', 'refiere', 'referir', 'referido', 'referidos', 'comision', 'comisiones', 'traer un cliente'], a: 'Si nos recomiendas a alguien, tu recomendado recibe 10 % de descuento en su primer pago. A quien recomienda no le ofrecemos dinero ni porcentaje.', c: { l: 'Quiero recomendar a alguien', h: wa('Hola F&V, quiero recomendar a alguien'), wa: true } },
    { k: ['caso', 'casos', 'clientes', 'testimonio', 'testimonios', 'resultados', 'referencias'], a: 'Estamos documentando nuestros primeros casos. Si quieres ser uno de ellos, pregunta por el precio de lanzamiento.', c: { l: 'Ver casos', h: '/casos' } },
    { g: 1, f: 0.3, k: ['precio', 'precios', 'cuanto cuesta', 'cuesta', 'costo', 'costos', 'tarifa', 'vale', 'cuanto', 'barato'], a: 'Los productos para negocios pequeños (▲) tienen el precio publicado, en dólares, desde $4,99, la mayoría por mes; pagas en bolívares a la tasa BCV del día. En los servicios para empresas e instituciones (⬡) se empieza con el Diagnóstico de $270, que se abona al proyecto si después se contrata la implementación; la implementación es a medida y se cotiza después del diagnóstico. El software va desde $190/mes (⬡) y desde $89,99/mes (▲).', c: VER_AMBOS },
    { g: 1, k: ['empezar', 'primer paso', 'arrancar', 'como empiezo', 'que me recomiendan', 'que me recomiendas', 'que recomiendan', 'recomiendan', 'no se cual', 'tienen', 'ofrecen'], a: 'Si tienes un negocio pequeño, el Plan Arranque ($39,99 al mes) es el mejor punto de partida: Google Maps, catálogo con tasa BCV y control de caja. Si tiene una empresa con áreas, sedes o junta directiva, empiece con una llamada gratis de 20 minutos o con el Diagnóstico «¿En qué se va la plata de su empresa?» ($270).', c: { l: 'Ver el Plan Arranque', h: '/productos/plan-arranque' } },
    { g: 1, k: ['contacto', 'humano', 'persona', 'hablar', 'hablar con un asesor', 'hablar con alguien', 'whatsapp', 'llamar', 'telefono', 'correo', 'email'], a: 'Con gusto. Escríbenos por WhatsApp (+58 424 412 5386) y te respondemos el mismo día de lunes a viernes, o agenda tu diagnóstico gratis.', c: ESCRIBIR },
    { g: 1, k: ['gracias', 'chao', 'adios', 'hasta luego', 'listo'], a: 'Con gusto. Si te surge otra duda, aquí estoy.', c: VER_AMBOS }
  ];

  function normalizar(t) { return ' ' + String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9$ ]+/g, ' ').replace(/\s+/g, ' ').trim() + ' '; }
  function buscar(texto) {
    var n = normalizar(texto), mejor = null, puntaje = 0;
    RESPUESTAS.forEach(function (r) {
      var p = 0;
      r.k.forEach(function (kw) { if (n.indexOf(' ' + kw) !== -1) p = Math.max(p, kw.length + (n.indexOf(' ' + kw + ' ') !== -1 ? 2 : 0)); });
      if (r.g) p = p * (r.f || 0.5); // las respuestas generales pierden contra las de un producto concreto (f = factor propio: «cuánto cuesta Club» es de Club)
      if (p > puntaje) { puntaje = p; mejor = r; }
    });
    return mejor;
  }

  /* ---------- interfaz ---------- */
  var path = RUTA;
  var QUICK_HEX = ['¿Qué incluye el diagnóstico de $270?', '¿Hay formación entre semana?', '¿Qué hace el asesor financiero?', '¿Dan soporte después?'];
  var QUICK_SOFT = ['¿Cuánto cuesta el software?', '¿Cómo pago?', '¿Hay descuento?'];
  var QUICK = {
    '/productos': ['¿Qué incluye el Plan Arranque?', '¿Cómo pago?', '¿Puedo cancelar?', '¿Hay garantía?'],
    '/servicios': QUICK_HEX,
    '/ejecutivos': QUICK_HEX.slice(0, 3),
    '/paginas-web': ['¿Cuánto cuesta una web?', '¿Cuánto tarda?', '¿El dominio está incluido?', '¿Cómo pago?'],
    '/curso-finanzas-ia': ['¿Cuándo empieza?', '¿Cuánto cuesta?', '¿Cómo reservo mi cupo?'],
    '/calculadora': ['¿Cómo se calcula el margen?', '¿De dónde sale la tasa?', '¿Cómo pago?'],
    '/club': QUICK_SOFT, '/condominio': QUICK_SOFT, '/gym': QUICK_SOFT,
    '/contacto': ['¿Cómo agendo el diagnóstico?', '¿En cuánto tiempo responden?', '¿Dónde están?']
  };
  var quickReplies = QUICK[path] || (/^\/(servicios|calculadora-roi)/.test(path) ? QUICK_HEX : /^\/productos/.test(path) ? QUICK['/productos'] : ['¿Cuánto cuesta?', '¿Qué diferencia hay entre servicios y productos?', '¿Cómo pago?', '¿Cuándo es el próximo taller?']);

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
