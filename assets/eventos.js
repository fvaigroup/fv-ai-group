/* Talleres y cursos: fechas, horas, precios y cupos en UN solo lugar.
   >>> Para cambiar una fecha, un precio o los cupos libres, edita SOLO el bloque EVENTOS de abajo. <<<
   Las páginas (Express, portada, Cursos, curso Finanzas con IA) leen estos datos; el HTML trae el mismo texto por defecto
   para quien no tiene JavaScript. Los eventos con fecha pasada se ocultan solos.

   Marcado que entiende:
     data-ev="taller.fecha"                    -> escribe el dato en el elemento (ver la lista de claves en "datos")
     data-ev="curso.fechas"                    -> datos de la PRÓXIMA cohorte vigente; data-ev="curso.oct.fechas" -> cohorte concreta
     data-ev-show="taller:vigente|pasado|anticipado"   (también curso:vigente|pasado, oct:vigente|pasado, nov:vigente|pasado)
                                               -> muestra u oculta el elemento (clase "hidden")
     data-ev-wa="taller|curso|curso-oct|curso-nov"  -> enlace de WhatsApp con el mensaje del evento (o el de "avísame" si ya pasó) */
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
      lugar: 'Valencia',
      precio: 300,                        // USD precio regular
      precioEfectivo: 265,                // USD pagando en efectivo o USDT
      reserva: 100,                       // USD para reservar el cupo
      cuposTotales: 6,
      cohortes: [                         // en orden de fecha; cada una con sus cupos
        { id: 'oct', fechas: ['2026-10-10', '2026-10-17', '2026-10-24'], hora: '8:00 a.m. a 12:00 p.m.', cuposLibres: 6 },
        { id: 'nov', fechas: ['2026-11-07', '2026-11-14', '2026-11-21'], hora: '2:00 a 6:00 pm', cuposLibres: 6 }
      ]
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
  function dias(c) { return c.fechas.map(function (f) { return d(f).toLocaleDateString('es-VE', { day: 'numeric', timeZone: TZ }); }); }
  function fechasCurso(c) {
    var ds = dias(c), ultimo = ds.pop();
    var mes = d(c.fechas[0]).toLocaleDateString('es-VE', { month: 'long', timeZone: TZ });
    var anio = d(c.fechas[0]).toLocaleDateString('es-VE', { year: 'numeric', timeZone: TZ });
    return 'sábados ' + (ds.length ? ds.join(', ') + ' y ' : '') + ultimo + ' de ' + mes + ' de ' + anio;
  }
  function msgCurso(c, cur) {
    var ds = dias(c).join(', ').replace(/, (\d+)$/, ' y $1');
    var mes = d(c.fechas[0]).toLocaleDateString('es-VE', { month: 'long', timeZone: TZ }).slice(0, 3);
    return 'Hola F&V, quiero reservar mi cupo en ' + cur.nombre + ' (' + ds + ' de ' + mes + ') con $' + cur.reserva;
  }

  var t = EVENTOS.taller, cur = EVENTOS.curso;
  var hoy = hoyISO();
  var coh = cur.cohortes;
  // próxima cohorte vigente (la primera cuya fecha de inicio no ha pasado); si no hay, la última
  var proxima = coh.filter(function (c) { return hoy <= c.fechas[0]; })[0] || coh[coh.length - 1];

  var estado = {
    'taller:vigente': hoy <= t.fecha,
    'taller:pasado': hoy > t.fecha,
    'taller:anticipado': hoy <= t.fecha && hoy <= t.anticipadoHasta,
    'curso:vigente': coh.some(function (c) { return hoy <= c.fechas[0]; }),
    'curso:pasado': !coh.some(function (c) { return hoy <= c.fechas[0]; })
  };
  coh.forEach(function (c) { estado[c.id + ':vigente'] = hoy <= c.fechas[0]; estado[c.id + ':pasado'] = hoy > c.fechas[0]; });

  var datos = {
    'taller.nombre': t.nombre, 'taller.fecha': larga(t.fecha), 'taller.fechaCorta': sinAnio(t.fecha), 'taller.diaMes': diaMes(t.fecha),
    'taller.hora': t.hora, 'taller.duracion': t.duracion, 'taller.lugar': t.lugar, 'taller.precio': '$' + t.precio,
    'taller.precioAnticipado': '$' + t.precioAnticipado, 'taller.anticipadoHasta': sinAnio(t.anticipadoHasta),
    'taller.cupos': 'Quedan ' + t.cuposLibres + ' de ' + t.cuposTotales, 'taller.cuposTotales': String(t.cuposTotales),
    'curso.nombre': cur.nombre, 'curso.lugar': cur.lugar, 'curso.precio': '$' + cur.precio, 'curso.precioEfectivo': '$' + cur.precioEfectivo,
    'curso.reserva': '$' + cur.reserva, 'curso.cuposTotales': String(cur.cuposTotales)
  };
  function volcar(prefijo, c) {
    datos[prefijo + '.fechas'] = fechasCurso(c);
    datos[prefijo + '.hora'] = c.hora;
    datos[prefijo + '.cupos'] = 'Quedan ' + c.cuposLibres + ' de ' + cur.cuposTotales;
    datos[prefijo + '.inicio'] = larga(c.fechas[0]);
  }
  volcar('curso', proxima);
  coh.forEach(function (c) { volcar('curso.' + c.id, c); });

  var mensajes = {
    taller: { ok: 'Hola F&V, quiero un cupo en el taller del ' + sinAnio(t.fecha), pasado: 'Hola F&V, avísame cuando haya nueva fecha del taller "' + t.nombre + '"' },
    curso: { ok: msgCurso(proxima, cur), pasado: 'Hola F&V, avísame cuando haya nueva fecha de ' + cur.nombre }
  };
  coh.forEach(function (c) { mensajes['curso-' + c.id] = { ok: msgCurso(c, cur), pasado: mensajes.curso.pasado }; });

  function vigenteDe(k) { return k === 'taller' ? estado['taller:vigente'] : k === 'curso' ? estado['curso:vigente'] : estado[k.replace('curso-', '') + ':vigente']; }

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
      el.setAttribute('href', WA + encodeURIComponent(vigenteDe(k) ? mensajes[k].ok : mensajes[k].pasado));
    });
  }

  window.FV_EVENTOS = {
    eventos: EVENTOS, estado: estado, datos: datos,
    // para páginas que necesitan la cohorte vigente antes de que cargue el resto (p. ej. el curso Finanzas con IA)
    cursoProximo: function () {
      return { id: proxima.id, fechas: proxima.fechas, fechasTexto: fechasCurso(proxima), hora: proxima.hora, inicioISO: proxima.fechas[0] + 'T' + (proxima.id === 'oct' ? '08:00' : '14:00') + ':00-04:00', cuposLibres: proxima.cuposLibres, aforo: cur.cuposTotales, lugar: cur.lugar };
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render); else render();
})();
