/* Talleres y cursos: fechas, horas, precios y cupos en UN solo lugar.
   >>> Para cambiar una fecha, un precio o los cupos libres, edita SOLO el bloque EVENTOS de abajo. <<<
   Las páginas (Express, portada, Cursos) leen estos datos; el HTML trae el mismo texto por defecto para quien no tiene JavaScript.

   Marcado que entiende:
     data-ev="taller.fecha"                    -> escribe el dato en el elemento
     data-ev-show="taller:vigente|pasado|anticipado"  -> muestra u oculta el elemento (clase "hidden")
     data-ev-wa="taller"                       -> pone el enlace de WhatsApp con el mensaje del evento (o el de "avísame" si ya pasó)  */
(function () {
  // ======================= EDITA AQUÍ =======================
  var EVENTOS = {
    taller: {
      nombre: 'La plata de tu negocio clara',
      fecha: '2026-10-17',                // sábado
      hora: '3:00 a 6:00 pm',
      duracion: '3 horas',
      lugar: 'Valencia',
      precio: 25,                         // USD por persona
      precioAnticipado: 20,               // USD si pagan antes de la fecha de abajo
      anticipadoHasta: '2026-10-14',      // miércoles (incluido)
      cuposTotales: 6,
      cuposLibres: 6                      // <- actualiza esto cuando se reserve un cupo
    },
    curso: {
      nombre: 'Finanzas con IA',
      fechas: ['2026-11-07', '2026-11-14', '2026-11-21'],   // tres sábados
      hora: '2:00 a 6:00 pm',
      lugar: 'Valencia',
      precio: 300,                        // USD precio regular
      precioEfectivo: 265,                // USD pagando en efectivo o USDT
      reserva: 100,                       // USD para reservar el cupo
      cuposTotales: 6,
      cuposLibres: 6                      // <- actualiza esto cuando se reserve un cupo
    }
  };
  // ==========================================================

  var TZ = 'America/Caracas';
  var WA = 'https://wa.me/584244125386?text=';
  function hoyISO() { return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }
  function d(iso) { return new Date(iso + 'T12:00:00-04:00'); }
  function larga(iso) { return d(iso).toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ }).replace(',', ''); }
  function sinAnio(iso) { return d(iso).toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long', timeZone: TZ }).replace(',', ''); }
  function diaMes(iso) { return d(iso).toLocaleDateString('es-VE', { day: 'numeric', month: 'long', timeZone: TZ }); }
  function fechasCurso(c) {
    var dias = c.fechas.map(function (f) { return d(f).toLocaleDateString('es-VE', { day: 'numeric', timeZone: TZ }); });
    var ultimo = dias.pop();
    var mes = d(c.fechas[0]).toLocaleDateString('es-VE', { month: 'long', timeZone: TZ });
    var anio = d(c.fechas[0]).toLocaleDateString('es-VE', { year: 'numeric', timeZone: TZ });
    return 'sábados ' + (dias.length ? dias.join(', ') + ' y ' : '') + ultimo + ' de ' + mes + ' de ' + anio;
  }

  var t = EVENTOS.taller, c = EVENTOS.curso;
  var hoy = hoyISO();
  var estado = {
    'taller:vigente': hoy <= t.fecha,
    'taller:pasado': hoy > t.fecha,
    'taller:anticipado': hoy <= t.fecha && hoy <= t.anticipadoHasta,
    'curso:vigente': hoy <= c.fechas[0],
    'curso:pasado': hoy > c.fechas[0]
  };
  var datos = {
    'taller.nombre': t.nombre,
    'taller.fecha': larga(t.fecha),
    'taller.fechaCorta': sinAnio(t.fecha),
    'taller.diaMes': diaMes(t.fecha),
    'taller.hora': t.hora,
    'taller.duracion': t.duracion,
    'taller.lugar': t.lugar,
    'taller.precio': '$' + t.precio,
    'taller.precioAnticipado': '$' + t.precioAnticipado,
    'taller.anticipadoHasta': sinAnio(t.anticipadoHasta),
    'taller.cupos': 'Quedan ' + t.cuposLibres + ' de ' + t.cuposTotales,
    'taller.cuposTotales': String(t.cuposTotales),
    'curso.nombre': c.nombre,
    'curso.fechas': fechasCurso(c),
    'curso.hora': c.hora,
    'curso.lugar': c.lugar,
    'curso.precio': '$' + c.precio,
    'curso.precioEfectivo': '$' + c.precioEfectivo,
    'curso.reserva': '$' + c.reserva,
    'curso.cupos': 'Quedan ' + c.cuposLibres + ' de ' + c.cuposTotales,
    'curso.cuposTotales': String(c.cuposTotales)
  };
  var mensajes = {
    taller: { ok: 'Hola F&V, quiero un cupo en el taller del ' + sinAnio(t.fecha), pasado: 'Hola F&V, avísame cuando haya nueva fecha del taller "' + t.nombre + '"' },
    curso: { ok: 'Hola F&V, quiero reservar mi cupo en ' + c.nombre + ' (' + c.fechas.map(function (f) { return d(f).toLocaleDateString('es-VE', { day: 'numeric', timeZone: TZ }); }).join(', ').replace(/, (\d+)$/, ' y $1') + ' de ' + d(c.fechas[0]).toLocaleDateString('es-VE', { month: 'long', timeZone: TZ }).slice(0, 3) + ') con $' + c.reserva, pasado: 'Hola F&V, avísame cuando haya nueva fecha de ' + c.nombre }
  };

  function render() {
    document.querySelectorAll('[data-ev]').forEach(function (el) {
      var k = el.getAttribute('data-ev');
      if (datos[k] !== undefined) el.textContent = datos[k];
    });
    document.querySelectorAll('[data-ev-show]').forEach(function (el) {
      el.classList.toggle('hidden', !estado[el.getAttribute('data-ev-show')]);
    });
    document.querySelectorAll('[data-ev-wa]').forEach(function (el) {
      var k = el.getAttribute('data-ev-wa');
      if (!mensajes[k]) return;
      el.setAttribute('href', WA + encodeURIComponent(estado[k + ':vigente'] ? mensajes[k].ok : mensajes[k].pasado));
    });
  }

  window.FV_EVENTOS = { eventos: EVENTOS, estado: estado, datos: datos };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render); else render();
})();
