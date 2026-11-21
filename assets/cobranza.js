/* /triangular/cobranza — selector de sector, paralaje y aparición al bajar.
   Sin JS: la página muestra el texto general y los cinco sectores uno debajo del otro.
   Con prefers-reduced-motion: cambia el sector igual, pero sin paralaje ni animaciones. */
(function () {
  'use strict';
  var raiz = document.querySelector('[data-cob]');
  if (!raiz) return;
  document.documentElement.classList.add('cob-js');
  var reducir = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Textos que cambian según el sector (los paneles de cada sector están escritos en el HTML)
  var S = {
    negocio: {
      cobro: 'lo que te deben cada mes',
      lead: 'Para cualquier negocio que cobre de forma recurrente: cuotas, mensualidades, membresías, alquileres o suscripciones. Cada cliente ve cuánto debe y paga en línea; tú ves en tiempo real quién está al día. Se adapta a tu sector.',
      persona: 'cliente', personas: 'clientes', Persona: 'Cliente',
      org: 'Tu Negocio', ini: 'TN', linea: 'Cliente ficticio · plan mensual', estado: 'Al día · próximo cobro programado', concepto: 'Plan mensual', extra: 'Recordatorio enviado por WhatsApp',
      problemas: ['Cobrar cada mes es perseguir gente por WhatsApp.', 'Tus clientes no saben cuánto deben y discuten «yo ya pagué».', 'Cuadrar Pago Móvil, Zelle, USDT y efectivo con la tasa del día toma horas.', 'Te enteras de la morosidad cuando ya es un hueco en la caja.'],
      wa: 'Hola F&V, quiero una demo de Cobranza para mi negocio.'
    },
    gimnasio: {
      cobro: 'las membresías de tu gimnasio',
      lead: 'Cada miembro ve su membresía y su próximo pago en el teléfono, paga desde el recordatorio y entra con un código QR. Tú ves quién pagó, quién vino y cuánto entró.',
      persona: 'miembro', personas: 'miembros', Persona: 'Miembro',
      org: 'Gym Ejemplo', ini: 'GE', linea: 'Miembro ficticio · plan mensual', estado: 'Al día · acceso permitido', concepto: 'Membresía mensual', extra: 'Clase de mañana: Spinning 7:00',
      problemas: ['Miembros que entrenan con la membresía vencida.', 'Cobrar cada mes es perseguir gente.', 'Clases llenas o vacías porque nadie reserva.', 'No sabes cuánto entró ni quién dejó de venir.'],
      wa: 'Hola F&V, quiero una demo de Cobranza para mi gimnasio.'
    },
    condominio: {
      cobro: 'el condominio de tu edificio',
      lead: 'Cada propietario ve su recibo explicado por alícuota, paga en línea o reporta su Pago Móvil en 30 segundos y consulta los gastos del edificio. La junta o la administradora aprueba con un clic.',
      persona: 'propietario', personas: 'propietarios', Persona: 'Propietario',
      org: 'Edificio Ejemplo', ini: 'EE', linea: 'Apto 4-B · propietaria ficticia', estado: 'Recibo del mes emitido', concepto: 'Gastos comunes por alícuota', extra: 'Gastos del edificio con sus facturas',
      problemas: ['Los propietarios no saben cuánto deben ni por qué.', 'Nadie sabe en qué se gastó el dinero del condominio.', 'Cobrar es perseguir vecinos por WhatsApp.', 'Cuadrar pagos en varias monedas con la tasa del día toma horas.'],
      wa: 'Hola F&V, quiero una demo de Cobranza para mi condominio.'
    },
    club: {
      cobro: 'las cuotas de tu club',
      lead: 'Cada socio ve en su teléfono cuánto debe y paga o reporta su pago en 30 segundos. Tu administración aprueba con un clic y la junta ve la morosidad en tiempo real.',
      persona: 'socio', personas: 'socios', Persona: 'Socio',
      org: 'Club Ejemplo', ini: 'CE', linea: 'Socio ficticio · grupo familiar', estado: 'Cuota al día', concepto: 'Cuota social', extra: 'Carnet digital con código QR',
      problemas: ['La administración pasa días persiguiendo socios por WhatsApp para cobrar.', 'Los socios no saben cuánto deben y discuten «yo ya pagué».', 'Cuadrar Pago Móvil, Zelle, USDT y efectivo con la tasa del día toma horas.', 'La junta se entera de la morosidad cuando ya es un hueco en la caja.'],
      wa: 'Hola F&V, quiero una demo de Cobranza para mi club.'
    },
    colegio: {
      cobro: 'las mensualidades de tu colegio o academia',
      lead: 'Cada representante ve las mensualidades de sus hijos, paga desde el recordatorio y recibe su recibo por correo o WhatsApp. Tú sabes al momento quién está al día.',
      persona: 'representante', personas: 'representantes', Persona: 'Representante',
      org: 'Colegio Ejemplo', ini: 'CE', linea: 'Representante ficticio · 2 alumnos', estado: 'Mensualidad del mes por pagar', concepto: 'Mensualidad escolar', extra: 'Recibo por correo y WhatsApp',
      problemas: ['Cobrar las mensualidades es escribirle a cada representante.', 'Los representantes no saben qué meses deben.', 'Cuadrar Pago Móvil, transferencias y efectivo con la tasa del día toma horas.', 'Te enteras de la morosidad cuando ya falta plata a fin de mes.'],
      wa: 'Hola F&V, quiero una demo de Cobranza para mi colegio o academia.'
    }
  };
  var WA = 'https://wa.me/584244125386?text=';

  var botones = [].slice.call(raiz.querySelectorAll('[data-cob-sector]'));
  var tabs = [].slice.call(raiz.querySelectorAll('[data-cob-tab]'));
  var paneles = [].slice.call(raiz.querySelectorAll('[data-cob-panel]'));
  var actual = 'negocio';

  function poner(id, desdeTab) {
    var d = S[id];
    if (!d) return;
    var cambio = id !== actual;
    actual = id;
    [].forEach.call(raiz.querySelectorAll('[data-k]'), function (el) {
      var k = el.getAttribute('data-k');
      if (d[k] != null && el.textContent !== d[k]) el.textContent = d[k];
    });
    var lista = raiz.querySelector('[data-cob-problemas]');
    if (lista) [].forEach.call(lista.children, function (li, i) { if (d.problemas[i]) li.textContent = d.problemas[i]; });
    [].forEach.call(raiz.querySelectorAll('[data-cob-wa]'), function (a) { a.href = WA + encodeURIComponent(d.wa); a.setAttribute('data-sector', id); });
    botones.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-cob-sector') === id ? 'true' : 'false'); });
    tabs.forEach(function (t) {
      var si = t.getAttribute('data-cob-tab') === id;
      t.setAttribute('aria-selected', si ? 'true' : 'false');
      t.tabIndex = si ? 0 : -1;
    });
    paneles.forEach(function (p) {
      var si = p.getAttribute('data-cob-panel') === id;
      p.hidden = !si;
      if (si && cambio && !reducir) { p.classList.remove('is-in'); void p.offsetWidth; p.classList.add('is-in'); }
    });
    if (cambio && window.gtag) { try { gtag('event', 'cobranza_sector', { sector: id, desde: desdeTab ? 'pestanas' : 'hero' }); } catch (e) {} }
  }

  botones.forEach(function (b) { b.addEventListener('click', function () { poner(b.getAttribute('data-cob-sector'), false); }); });
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { poner(t.getAttribute('data-cob-tab'), true); });
    t.addEventListener('keydown', function (e) {
      var k = e.key, j = -1;
      if (k === 'ArrowRight' || k === 'ArrowDown') j = (i + 1) % tabs.length;
      else if (k === 'ArrowLeft' || k === 'ArrowUp') j = (i - 1 + tabs.length) % tabs.length;
      else if (k === 'Home') j = 0;
      else if (k === 'End') j = tabs.length - 1;
      if (j < 0) return;
      e.preventDefault();
      tabs[j].focus();
      poner(tabs[j].getAttribute('data-cob-tab'), true);
    });
  });
  poner('negocio', false);

  // Aparición suave al entrar en pantalla
  var ves = [].slice.call(raiz.querySelectorAll('[data-cob-ve]'));
  if (reducir || !('IntersectionObserver' in window)) ves.forEach(function (el) { el.classList.add('is-in'); });
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    ves.forEach(function (el) { io.observe(el); });
  }

  // Paralaje: cada [data-paralaje="0.2"] se desplaza a esa fracción del scroll respecto al centro de su sección
  if (reducir) return;
  var capas = [].slice.call(raiz.querySelectorAll('[data-paralaje]')).map(function (el) {
    return { el: el, v: parseFloat(el.getAttribute('data-paralaje')) || 0, sec: el.closest('section') || raiz };
  });
  if (!capas.length) return;
  var pendiente = false;
  function pintar() {
    pendiente = false;
    var vh = window.innerHeight;
    capas.forEach(function (c) {
      var r = c.sec.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var d = (r.top + r.height / 2) - vh / 2;
      c.el.style.transform = 'translate3d(0,' + (-d * c.v).toFixed(1) + 'px,0)';
    });
  }
  function pedir() { if (!pendiente) { pendiente = true; requestAnimationFrame(pintar); } }
  addEventListener('scroll', pedir, { passive: true });
  addEventListener('resize', pedir, { passive: true });
  pintar();
})();
