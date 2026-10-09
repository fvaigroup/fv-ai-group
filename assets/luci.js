/* Luci: asistente virtual de F&V (compartida por todas las páginas).
   No es un modelo de IA: busca palabras clave en la pregunta y responde con textos preparados por el equipo.
   Cada respuesta termina con un botón de acción (producto por WhatsApp, /express, /paginas-web o /contacto#agenda).
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
  function pedir(nombre, precio, linea) { return { l: 'Lo quiero por WhatsApp', h: wa('Hola F&V, quiero ' + nombre + ' (' + (linea || 'Línea Triangular Express') + ', ' + precio + '). ¿Cómo pago?'), wa: true, p: nombre }; }
  var VER_EXPRESS = { l: 'Ver la Línea Triangular', h: '/triangular' };
  var VER_WEBS = { l: 'Ver páginas web y precios', h: '/paginas-web' };
  var VER_SOL = { l: 'Ver las dos líneas', h: '/#lineas' };
  var DIAG = { l: 'Agendar diagnóstico gratis', h: '/contacto#agenda' };
  var ESCRIBIR = { l: 'Escribir por WhatsApp', h: wa('Hola F&V, tengo una consulta'), wa: true };

  // k = palabras clave (sin tildes, en minúsculas; coincide con el inicio de una palabra, así "curso" también encuentra "cursos")
  var RESPUESTAS = [
    { g: 1, k: ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'saludos'], a: 'Hola, ¿en qué te ayudo? Puedo contarte de productos y precios, plazos, formas de pago, cursos y talleres.', c: VER_EXPRESS },
    { k: ['eres una ia', 'eres ia', 'eres un bot', 'eres humano', 'eres real', 'eres una persona', 'quien eres', 'que eres', 'robot', 'persona real'], a: 'Soy Luci, una asistente virtual: respondo al instante y a cualquier hora con respuestas que preparó el equipo de F&V. No soy una persona. Para algo más específico escríbenos por WhatsApp y te respondemos el mismo día de lunes a viernes.', c: ESCRIBIR },
    { k: ['horario', 'responden', 'respuesta', 'atienden', 'atencion', 'abren', 'fin de semana', 'domingo'], a: function () { return HORARIO; }, c: ESCRIBIR },
    { k: ['pack', 'arranque', 'paquete'], a: 'El Pack Arranque cuesta $150 (los tres por separado suman $175) e incluye Negocio Visible, Catálogo con tasa BCV y Caja Clara: que te encuentren, te compren por WhatsApp y sepas cuánto ganas cada día. Entrega en 5 días.', c: pedir('el Pack Arranque', '$150') },
    { k: ['negocio visible', 'google maps', 'maps', 'ficha', 'verificacion', 'qr'], a: 'Negocio Visible cuesta $35: ficha de Google Maps completa, WhatsApp Business con catálogo, mensaje de bienvenida y 5 respuestas rápidas, QR para el mostrador y un recorrido de 20 minutos. Entrega en 48 horas; la verificación de Google puede tardar unos días más y no depende de nosotros.', c: pedir('Negocio Visible', '$35') },
    { k: ['catalogo', 'menu digital', 'demo', 'bodegon'], a: 'El Catálogo con tasa BCV cuesta $90 en Venezuela ($250 fuera): tu catálogo o menú en una página, con precios en $ y Bs que se actualizan solos con la tasa BCV, botón de pedido por WhatsApp y QR. Entrega en 72 horas. Puedes ver la demo en vivo.', c: { l: 'Ver demo en vivo', h: '/demo-catalogo' } },
    { k: ['caja clara', 'cuadre', 'cuanto gane', 'cuanto gano'], a: 'Caja Clara cuesta $50: cuadre diario en Bs, $, Pago Móvil y USDT, tasa BCV automática, reporte semanal y 45 minutos de capacitación. Entrega en 48 horas.', c: pedir('Caja Clara', '$50') },
    { k: ['web de una página', 'web profesional', 'tienda online', 'pagina web', 'paginas web', 'sitio web', 'una web', 'dominio', 'hosting', 'mantenimiento web'], a: 'Tenemos cuatro planes de página web: Catálogo con tasa BCV $90 (72 horas), Web de una página $150 (5 días), Web Profesional desde $350 (2 semanas) y Tienda Online desde $500 (3 semanas). El dominio se paga aparte (alrededor de US$12 al año) y el Mantenimiento web cuesta $20/mes.', c: VER_WEBS },
    { k: ['asistente ia pro', 'asistente ia', 'chatbot', 'bot de whatsapp', 'responder por whatsapp', 'automatico'], a: 'El Asistente IA de WhatsApp cuesta $150 + $30/mes ($350 + $60/mes fuera de Venezuela): responde precios, horarios y ubicación las 24 horas, toma pedidos o citas y pasa lo difícil a una persona de tu equipo. Entrega en 5 a 7 días y está disponible desde noviembre de 2026. La mensualidad se paga por adelantado. Para más funciones (Instagram, agenda y registro de clientes) existe el Asistente IA Pro: $350 + $50/mes.', c: pedir('el Asistente IA de WhatsApp', '$150 + $30/mes') },
    { k: ['cotizador', 'presupuesto', 'cotizar'], a: 'El Cotizador con tasa BCV cuesta $30: una hoja que arma presupuestos en $ y Bs con la tasa del día y genera el PDF para enviar a tu cliente. Entrega en 48 horas.', c: pedir('el Cotizador con tasa BCV', '$30') },
    { k: ['cobranza', 'cobrar', 'cuentas por cobrar', 'me deben'], a: 'El Kit de Cobranza cuesta $30: hoja de cuentas por cobrar con alertas de vencimiento y 5 mensajes de cobro listos para WhatsApp. Entrega en 48 horas.', c: pedir('el Kit de Cobranza', '$30') },
    { k: ['inventario', 'stock', 'existencia'], a: 'El Inventario Simple cuesta $40: hoja de entradas, salidas y mínimos, con el costo en $ y el precio en Bs. Entrega en 72 horas.', c: pedir('el Inventario Simple', '$40') },
    { k: ['correo profesional', 'correo con mi', 'email profesional'], a: 'El Correo profesional @tunegocio cuesta $25 más el dominio (se paga aparte): dominio configurado, correo con tu nombre y firma. Entrega en 24 horas.', c: pedir('el Correo profesional', '$25') },
    { k: ['kit visual', 'logo', 'canva', 'plantillas'], a: 'El Kit Visual cuesta $60: un logo sencillo y 5 plantillas en Canva para estados y posts. Entrega en 5 días.', c: pedir('el Kit Visual', '$60') },
    { k: ['redes al dia', 'posts', 'publicaciones', 'redes sociales', 'instagram'], a: 'Redes al Día son 12 posts diseñados al mes por $60/mes. Todavía no está disponible, pero puedes anotarte en la lista de espera.', c: { l: 'Avísame cuando esté disponible', h: wa('Hola F&V, avísame cuando Redes al Día (Línea Triangular Express, $60/mes) esté disponible'), wa: true, p: 'redes-al-dia' } },
    { k: ['mis finanzas claras', 'finanzas personales', 'finanzas claras'], a: 'Mis Finanzas Claras cuesta $10: una hoja de Google Sheets para llevar tus cuentas en Bs, $ y USDT en un solo lugar. La recibes apenas pagas.', c: pedir('Mis Finanzas Claras', '$10') },
    { k: ['clase', 'clases', 'aprender ia', 'profesor'], a: 'La Clase 1:1 de IA cuesta $25 por 90 minutos (3 clases por $60): aprendes a usar IA con tus propios archivos y tareas. Agéndala esta semana por WhatsApp.', c: pedir('la Clase 1:1 de IA', '$25') },
    { k: ['taller', 'talleres', 'proximo taller', 'plata de tu negocio', 'chatgpt para tu negocio'], a: function () {
        if (!estado('taller:vigente')) return 'El taller «La plata de tu negocio clara» ya se dictó. Próxima fecha: pronto. Escríbenos para avisarte. También preparamos «ChatGPT para tu negocio en 3 horas» (fecha por anunciar).';
        return 'El taller «La plata de tu negocio clara» es el ' + ev('taller.fecha', 'sábado 17 de octubre de 2026') + ', de ' + ev('taller.hora', '3:00 a 6:00 pm') + ', en ' + ev('taller.lugar', 'Valencia') + ', para un máximo de 6 personas. Cuesta ' + ev('taller.precio', '$25') + ' por persona' + (estado('taller:anticipado') ? ' y ' + ev('taller.precioAnticipado', '$20') + ' si pagas antes del ' + ev('taller.anticipadoHasta', 'miércoles 14 de octubre') : '') + '. ' + ev('taller.cupos', 'Quedan 6 de 6') + ' cupos.'; },
      c: { l: 'Reservo mi cupo', h: wa('Hola F&V, quiero un cupo en el taller «La plata de tu negocio clara» (Línea Triangular Express) del sábado 17 de octubre'), wa: true, p: 'taller-plata-clara', ev: 'taller' } },
    { k: ['finanzas con ia', 'curso', 'cursos', 'cohorte', 'sabados', 'reservar', 'reservo', 'cupo', 'cupos', 'certificado', 'proxima cohorte', 'fechas', 'calendario', 'cuando empieza'], a: function () {
        if (!estado('curso:vigente')) return 'La próxima cohorte de Finanzas con IA se anunciará pronto. Escríbenos y te avisamos.';
        var s = 'Finanzas con IA son 3 sábados presenciales en Valencia, máximo 6 personas. ';
        s += estado('oct:vigente') ? 'Cohorte de octubre: ' + ev('curso.oct.fechas', 'sábados 10, 17 y 24 de octubre de 2026') + ' (' + ev('curso.oct.hora', '8:00 a.m. a 12:00 p.m.') + '). ' : '';
        s += estado('nov:vigente') ? 'Cohorte de noviembre: ' + ev('curso.nov.fechas', 'sábados 7, 14 y 21 de noviembre de 2026') + ' (' + ev('curso.nov.hora', '2:00 a 6:00 pm') + '). ' : '';
        return s + 'Cuesta ' + ev('curso.precio', '$300') + ' (' + ev('curso.precioEfectivo', '$265') + ' en efectivo o USDT) y reservas tu cupo con ' + ev('curso.reserva', '$100') + '. También hay una opción 1 a 1 de 2 días por $350 y el taller «La plata de tu negocio clara» el 17 de octubre.'; },
      c: { l: 'Ver fechas y reservar', h: '/cursos#fechas' } },
    { k: ['pago', 'pagar', 'pagos', 'forma de pago', 'formas de pago', 'usdt', 'zinli', 'binance', 'efectivo', 'pago movil', 'descuento', 'transferencia', 'zelle', 'adelanto', 'mitad', 'anticipo'], a: 'Los precios son en dólares. Pagas en bolívares por Pago Móvil a la tasa BCV del día, o en USDT por Binance, con Zinli o en efectivo en dólares. Con USDT o efectivo tienes 20 % de descuento en los productos Triangular Express. Hasta $50 pagas completo al pedir; si cuesta más de $50, la mitad para empezar y la mitad al entregar. Fuera de Venezuela: Binance Pay o Zinli. Los cursos tienen su propio precio en efectivo o USDT.', c: ESCRIBIR },
    { k: ['garantia', 'devolucion', 'reembolso', 'no me gusta', 'no me sirve', 'devuelven', 'devolver'], a: 'En los productos Triangular Express y las páginas web aplica nuestra garantía: si tu producto no queda como lo prometimos, lo corregimos sin costo. Si aun así no te sirve, te devolvemos tu dinero.', c: VER_EXPRESS },
    { k: ['cuanto tarda', 'tarda', 'tardan', 'plazo', 'plazos', 'entrega', 'demora', 'cuando lo tengo', 'dias'], a: 'Plazos: Negocio Visible 48 h (la verificación de Google puede tardar unos días más), Catálogo con tasa BCV 72 h, Caja Clara 48 h, Web de una página 5 días, Pack Arranque 5 días, Asistente IA 5 a 7 días (disponible desde noviembre de 2026), Cotizador y Kit de Cobranza 48 h, Inventario Simple 72 h, Correo profesional 24 h, Kit Visual 5 días, Mis Finanzas Claras al pagar y Clase 1:1 esta semana. En Triangular y Hexagonal Express, de 1 a 3 semanas; en Hexagonal, de 1 a 3 meses.', c: VER_EXPRESS },
    { k: ['diagnostico', 'agendar', 'agenda', 'cita', 'llamada', 'reunion', 'videollamada'], a: 'El diagnóstico inicial de 20 minutos es gratis. Elige el horario que te convenga en el calendario de la página de Contacto.', c: DIAG },
    { k: ['calculadora', 'calcular', 'margen', 'recargo'], a: 'Tenemos una calculadora gratis: pones tu costo y tu margen y te dice a cuánto vender en $ y en Bs con la tasa del día, y puedes descargar tu tabla de precios en PDF.', c: { l: 'Usar la calculadora', h: '/calculadora' } },
    { k: ['tasa', 'bcv', 'bolivares', 'dolar', 'euro'], a: 'Usamos la tasa oficial del BCV (dólar o euro) del día. En el Catálogo con tasa BCV y en Caja Clara los precios en bolívares se actualizan solos con esa tasa. Para calcular tus propios precios usa la calculadora gratis.', c: { l: 'Usar la calculadora', h: '/calculadora' } },
    { k: ['linea', 'lineas', 'triangular', 'hexagonal', 'diferencia', 'express'], a: 'Triangular Express: negocios pequeños y personas, de $10 a $150, entrega de 24 horas a 7 días. Triangular: negocios que ya venden, desde $250, en 1 a 3 semanas. Hexagonal Express: empresas con un problema puntual, desde $150, en 1 a 3 semanas. Hexagonal: sistema completo para empresas, desde $2.000, en 1 a 3 meses. ⚡ Express = entrega rápida (Triangular: máximo 7 días; Hexagonal: máximo 3 semanas). Lo que pagas en un paso se abona al siguiente.', c: VER_SOL },
    { k: ['habilitacion', 'capacitacion', 'tablero', 'automatizacion de 1', 'equipo'], a: 'En la Línea Triangular: Tablero de Ventas y Caja $250 (1 semana) y Automatización de 1 tarea desde $300 (1 a 2 semanas). La Habilitación de equipos ($60 por persona, desde 3 personas, 1 sesión) es de la Línea Hexagonal Express.', c: { l: 'Ver la Línea Triangular', h: '/triangular' } },
    { k: ['evaluacion', 'asesoria', 'auditoria', 'sprint', 'conciliacion', 'agente de ia', 'tablero gerencial', 'masterclass'], a: 'En Hexagonal Express: Asesoría Estratégica $150 (1 sesión + informe en 72 h) y Evaluación de Procesos $400 (1 semana), ambas se abonan si contratas la implementación; Sprint de Automatización desde $800, Conciliación Automática desde $900, Agente de IA a medida desde $1.000, Habilitación de equipos $60 por persona y Masterclass privada de $500 a $700.', c: { l: 'Ver Hexagonal Express', h: '/hexagonal' } },
    { k: ['odoo', 'dynamics', 'erp', 'crm', 'n8n', 'implementacion', 'sistema completo', 'desarrollo a medida', 'empresa grande', 'empresas'], a: 'La Línea Hexagonal es el sistema completo para empresas, siempre después de una evaluación y por fases: Odoo Community desde $2.000, Ecosistema de Automatización desde $2.500, Dynamics 365 Sales/Customer Service desde $3.000 + licencias y desarrollo a medida desde $3.000.', c: DIAG },
    { k: ['soporte', 'acompanamiento', 'despues del', 'incidencia'], a: 'El Acompañamiento Continuo de la Línea Hexagonal tiene tres niveles: Estándar $200/mes (8 h), Prioritario $400/mes (18 h) y Director de IA a tiempo parcial $600/mes (16 h + reunión semanal). Para negocios pequeños existe el Acompañamiento Básico, $90/mes (3 h), de la Línea Triangular.', c: { l: 'Ver los niveles', h: '/acompanamiento-continuo' } },
    { k: ['donde', 'ubicacion', 'direccion', 'oficina', 'valencia', 'carabobo', 'venezuela', 'fuera de'], a: 'Estamos en Valencia, Carabobo (Av. La Rosario, Edif. Torre Trébol, Urb. Lomas del Este) y atendemos negocios y empresas de toda Venezuela por WhatsApp y videollamada. Los talleres y cursos son presenciales en Valencia.', c: { l: 'Ver el mapa', h: '/contacto#mapa' } },
    { k: ['refiere', 'referir', 'referido', 'comision', 'recomendar'], a: 'Si nos recomiendas a alguien y paga, te llevas el 10 % de lo que pague.', c: { l: 'Quiero referir a alguien', h: wa('Hola F&V, quiero referir a un cliente'), wa: true } },
    { k: ['caso', 'casos', 'clientes', 'testimonio', 'testimonios', 'resultados', 'referencias'], a: 'Estamos documentando nuestros primeros casos. Si quieres ser uno de ellos, pregunta por el precio de lanzamiento.', c: { l: 'Ver casos', h: '/casos' } },
    { g: 1, k: ['precio', 'precios', 'cuanto cuesta', 'cuesta', 'costo', 'costos', 'tarifa', 'vale', 'cuanto', 'barato'], a: 'Todos los precios están publicados, en dólares: Triangular Express desde $10 (Pack Arranque $150), páginas web desde $90, Triangular desde $250, Hexagonal Express desde $150 y Hexagonal desde $2.000. Pagas en bolívares a la tasa BCV del día.', c: VER_SOL },
    { g: 1, k: ['empezar', 'primer paso', 'arrancar', 'como empiezo', 'que me recomiendan', 'recomiendan', 'no se cual', 'productos', 'tienen', 'servicios', 'ofrecen'], a: 'Si tienes un negocio pequeño, el Pack Arranque ($150) es el mejor punto de partida: Google Maps, catálogo con tasa BCV y control de caja. Si eres una empresa, empieza con el diagnóstico gratis de 20 minutos.', c: VER_EXPRESS },
    { g: 1, k: ['contacto', 'humano', 'persona', 'asesor', 'hablar', 'whatsapp', 'llamar', 'telefono', 'correo', 'email'], a: 'Con gusto. Escríbenos por WhatsApp (+58 424 412 5386) y te respondemos el mismo día de lunes a viernes, o agenda tu diagnóstico gratis.', c: ESCRIBIR },
    { g: 1, k: ['gracias', 'chao', 'adios', 'hasta luego', 'listo'], a: 'Con gusto. Si te surge otra duda, aquí estoy.', c: VER_EXPRESS }
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
    '/triangular': ['¿Qué incluye el Pack Arranque?', '¿Cómo pago?', '¿Cuánto tarda?', '¿Hay garantía?'],
    '/paginas-web': ['¿Cuánto cuesta una web?', '¿Cuánto tarda?', '¿El dominio está incluido?', '¿Cómo pago?'],
    '/cursos': ['¿Cuándo es el próximo taller?', '¿Cuánto cuesta Finanzas con IA?', '¿Cómo reservo mi cupo?'],
    '/curso-finanzas-ia': ['¿Cuándo empieza?', '¿Cuánto cuesta?', '¿Cómo reservo mi cupo?'],
    '/calculadora': ['¿Cómo se calcula el margen?', '¿De dónde sale la tasa?', '¿Cómo pago?'],
    '/hexagonal': ['¿Cuál es la diferencia entre las líneas?', '¿Cuánto cuesta una evaluación?', '¿Dan soporte después?'],
    '/contacto': ['¿Cómo agendo el diagnóstico?', '¿En cuánto tiempo responden?', '¿Dónde están?']
  };
  var quickReplies = QUICK[path] || (/^\/(asesoria|evaluacion|despliegue|habilitacion|masterclasses|acompanamiento)/.test(path) ? QUICK['/hexagonal'] : ['¿Cuánto cuesta?', '¿Qué productos tienen?', '¿Cómo pago?', '¿Cuándo es el próximo taller?']);

  var css = document.createElement('style');
  css.textContent = '.luci-cta{display:inline-flex;align-items:center;gap:6px;margin-top:8px;padding:8px 12px;border-radius:8px;font-family:"Space Grotesk",sans-serif;font-size:12.5px;font-weight:600;background:rgba(74,222,128,.12);border:1px solid rgba(74,222,128,.45);color:#4ade80;text-decoration:none;transition:background-color .2s}.luci-cta:hover{background:rgba(74,222,128,.22)}' +
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
    var t = document.createElement('div'); t.className = 'luci-typing'; t.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(t); messages.scrollTop = messages.scrollHeight; return t;
  }
  function preguntar(texto) {
    mensaje(texto, 'user'); quick.innerHTML = '';
    var r = buscar(texto), t = escribiendo();
    setTimeout(function () {
      t.remove();
      if (r) mensaje(typeof r.a === 'function' ? r.a() : r.a, 'bot', r.c);
      else mensaje('No tengo una respuesta preparada para eso todavía. Escríbenos por WhatsApp y una persona del equipo te responde el mismo día de lunes a viernes.', 'bot', ESCRIBIR);
      opciones(quickReplies.slice(0, 3));
      if (window.FV_EVENTOS && window.FV_EVENTOS.refrescar) window.FV_EVENTOS.refrescar();
    }, 650);
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
