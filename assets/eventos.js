/* Talleres y cursos: fechas, horas, precios y cupos en UN solo lugar.
   >>> Para cambiar una fecha, un precio o los cupos libres, edita SOLO el bloque EVENTOS de abajo. <<<
   Las páginas (Triangular, portada, Cursos, curso Finanzas con IA), Luci y el buscador leen estos datos; el HTML trae
   el mismo texto por defecto para quien no tiene JavaScript.

   Reglas de fechas (se comparan con la fecha de HOY en Venezuela, America/Caracas, del navegador):
     - El taller se ofrece hasta su día inclusive: el del sábado 17 de octubre se oculta a partir del 18.
     - Una cohorte se ofrece para reservar hasta el día de su PRIMERA clase inclusive; si ya empezó, deja de ofrecerse
       (la de octubre empezó el 10: no se ofrece; la de noviembre se ofrece hasta el 7 de noviembre).
     - Si no queda NINGUNA fecha futura (ni taller ni cohortes), se muestra «Próximas fechas: escríbenos por WhatsApp».

   Marcado que entiende:
     data-ev="taller.fecha"                    -> escribe el dato en el elemento (ver la lista de claves en "datos")
     data-ev="curso.fechas"                    -> datos de la PRÓXIMA cohorte vigente; data-ev="curso.oct.fechas" -> cohorte concreta
     data-ev="eventos.proximas"                -> «Próximas fechas: escríbenos por WhatsApp»
     data-ev="eventos.resumen"                 -> resumen de lo que viene («Taller …: sábado 17 de octubre · Finanzas con IA: …»)
                                                  o «Próximas fechas: escríbenos por WhatsApp» si no hay nada
     data-ev-show="clave"                      -> muestra el elemento si la clave es verdadera; si no, le pone la clase "hidden".
                                                  Claves: taller:vigente | taller:pasado | taller:sin-fechas
                                                          curso:vigente  | curso:pasado  | curso:sin-fechas   (alguna cohorte por empezar o ninguna)
                                                          oct:vigente | oct:pasado | nov:vigente | nov:pasado  (una por cohorte, con su id)
                                                          eventos:con-fechas | eventos:sin-fechas         (cualquier taller o cohorte por venir, o nada)
                                                  En el HTML, lo que hoy NO corresponde mostrar se escribe ya con la clase "hidden"
                                                  (p. ej. la cohorte que ya empezó y el aviso «Próximas fechas»), para que sin JavaScript
                                                  no se anuncie una fecha pasada.
     data-ev-wa="taller|curso|curso-oct|curso-nov|proximas"
                                               -> enlace de WhatsApp con el mensaje del evento (o el de «avísame» si ya pasó);
                                                  "proximas" pide las próximas fechas de cursos y talleres.
   Para Luci y el buscador: window.FV_EVENTOS.proximas() devuelve la lista de lo que viene (vacía si no hay nada). */
(function () {
  if (window.FV_EVENTOS) return; // por si la página lo carga dos veces
  // ======================= EDITA AQUÍ =======================
  var EVENTOS = {
    taller: {
      nombre: 'La plata de tu negocio clara',
      fecha: '2026-10-17',                // sábado
      hora: '3:00 a 6:00 pm',
      inicio: '15:00',                    // hora de inicio (24 h), para el contador y los datos estructurados
      duracion: '3 horas',
      lugar: 'Valencia',
      precio: 24.99,                      // USD por persona
      cuposTotales: 6,
      cuposLibres: 6                      // <- actualiza esto cuando se reserve un cupo
    },
    curso: {
      nombre: 'Finanzas con IA',
      lugar: 'Valencia',
      precio: 299.99,                     // USD en 3 cuotas, una por sábado
      cuotas: [100, 100, 99.99],          // USD de cada cuota (suman el precio)
      cuposTotales: 6,
      cohortes: [                         // en orden de fecha; cada una con sus cupos
        { id: 'oct', fechas: ['2026-10-10', '2026-10-17', '2026-10-24'], hora: '8:00 a.m. a 12:00 p.m.', inicio: '08:00', cuposLibres: 6 },
        { id: 'nov', fechas: ['2026-11-07', '2026-11-14', '2026-11-21'], hora: '2:00 a 6:00 pm', inicio: '14:00', cuposLibres: 6 }
      ]
    }
  };
  // ==========================================================

  var TZ = 'America/Caracas';
  var WA = 'https://wa.me/584244125386?text=';
  var SIN_FECHAS = 'Próximas fechas: escríbenos por WhatsApp';
  // Fecha de hoy en Venezuela (AAAA-MM-DD), con el reloj del navegador
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
    return 'Hola F&V, quiero reservar mi cupo en ' + cur.nombre + ' (' + ds + ' de ' + mes + '). ¿Cómo pago: en 3 cuotas o de contado?';
  }

  // Los precios Triangulares terminan en ,99: siempre con coma decimal y 2 decimales
  function usd(n) { return '$' + n.toFixed(2).replace('.', ','); }
  var t = EVENTOS.taller, cur = EVENTOS.curso;
  var hoy = hoyISO();
  var coh = cur.cohortes;
  // una cohorte se puede reservar hasta el día de su primera clase (inclusive); si ya empezó, no
  function abierta(c) { return hoy <= c.fechas[0]; }
  var abiertas = coh.filter(abierta);
  // próxima cohorte vigente (la primera que no ha empezado); null si no queda ninguna
  var proxima = abiertas[0] || null;
  var tallerVigente = hoy <= t.fecha;
  var cursoVigente = abiertas.length > 0;
  var hayFechas = tallerVigente || cursoVigente;

  var estado = {
    'taller:vigente': tallerVigente,
    'taller:pasado': !tallerVigente,
    'taller:sin-fechas': !tallerVigente,
    'taller:anticipado': false,         // ya no hay fecha límite ni descuento por pagar de contado
    'curso:vigente': cursoVigente,
    'curso:pasado': !cursoVigente,
    'curso:sin-fechas': !cursoVigente,
    'eventos:con-fechas': hayFechas,
    'eventos:sin-fechas': !hayFechas
  };
  coh.forEach(function (c) { estado[c.id + ':vigente'] = abierta(c); estado[c.id + ':pasado'] = !abierta(c); });

  // "Quedan 6 de 6" sugiere que nadie se ha inscrito: mientras todos los cupos estén libres se dice solo el máximo
  function cupos(libres, total) { return libres >= total ? 'Máximo ' + total + ' personas' : 'Quedan ' + libres + ' ' + (libres === 1 ? 'cupo' : 'cupos'); }

  var datos = {
    'taller.nombre': t.nombre, 'taller.fecha': larga(t.fecha), 'taller.fechaCorta': sinAnio(t.fecha), 'taller.diaMes': diaMes(t.fecha),
    'taller.hora': t.hora, 'taller.duracion': t.duracion, 'taller.lugar': t.lugar, 'taller.precio': usd(t.precio),
    'taller.cupos': cupos(t.cuposLibres, t.cuposTotales), 'taller.cuposTotales': String(t.cuposTotales),
    'curso.nombre': cur.nombre, 'curso.lugar': cur.lugar, 'curso.precio': usd(cur.precio),
    'curso.cuotas': cur.cuotas.slice(0, -1).map(usd).join(', ') + ' y ' + usd(cur.cuotas[cur.cuotas.length - 1]), 'curso.cuposTotales': String(cur.cuposTotales),
    'eventos.proximas': SIN_FECHAS
  };
  // si el taller ya pasó, ningún lugar que muestre su fecha sin ocultarse debe anunciar una fecha vieja
  if (!tallerVigente) { datos['taller.fecha'] = datos['taller.fechaCorta'] = datos['taller.diaMes'] = 'nueva fecha por anunciar'; }
  function volcar(prefijo, c) {
    datos[prefijo + '.fechas'] = fechasCurso(c);
    datos[prefijo + '.hora'] = c.hora;
    datos[prefijo + '.cupos'] = cupos(c.cuposLibres, cur.cuposTotales);
    datos[prefijo + '.inicio'] = larga(c.fechas[0]);
  }
  coh.forEach(function (c) { volcar('curso.' + c.id, c); });
  if (proxima) volcar('curso', proxima);
  else { datos['curso.fechas'] = 'fechas por anunciar'; datos['curso.hora'] = 'por confirmar'; datos['curso.cupos'] = cupos(cur.cuposTotales, cur.cuposTotales); datos['curso.inicio'] = 'por anunciar'; }

  // lo que viene, en orden de fecha (para el resumen, Luci y el buscador)
  var lista = [];
  if (tallerVigente) lista.push({ tipo: 'taller', id: 'taller', nombre: 'Taller «' + t.nombre + '»', fechaISO: t.fecha, inicioISO: t.fecha + 'T' + t.inicio + ':00-04:00', texto: sinAnio(t.fecha) + ', ' + t.hora, url: '/cursos#fechas' });
  abiertas.forEach(function (c) { lista.push({ tipo: 'curso', id: c.id, nombre: cur.nombre, fechaISO: c.fechas[0], inicioISO: c.fechas[0] + 'T' + c.inicio + ':00-04:00', texto: fechasCurso(c).replace(/ de 20\d\d$/, '') + ', ' + c.hora, url: '/cursos#finanzas-con-ia' }); });
  lista.sort(function (a, b) { return a.fechaISO < b.fechaISO ? -1 : a.fechaISO > b.fechaISO ? 1 : 0; });
  datos['eventos.resumen'] = lista.length ? lista.map(function (e) { return e.nombre + ': ' + e.texto; }).join(' · ') : SIN_FECHAS;

  var mensajes = {
    taller: { ok: 'Hola F&V, quiero un cupo en el taller «' + t.nombre + '» del ' + sinAnio(t.fecha), pasado: 'Hola F&V, avísame cuando haya nueva fecha del taller «' + t.nombre + '»' },
    curso: { ok: proxima ? msgCurso(proxima, cur) : '', pasado: 'Hola F&V, avísame cuando haya nueva fecha de ' + cur.nombre },
    proximas: { ok: 'Hola F&V, quiero saber las próximas fechas de los cursos y talleres', pasado: 'Hola F&V, quiero saber las próximas fechas de los cursos y talleres' }
  };
  coh.forEach(function (c) { mensajes['curso-' + c.id] = { ok: msgCurso(c, cur), pasado: mensajes.curso.pasado }; });

  function vigenteDe(k) {
    if (k === 'proximas') return true;
    if (k === 'taller') return estado['taller:vigente'];
    if (k === 'curso') return estado['curso:vigente'];
    return !!estado[k.replace('curso-', '') + ':vigente'];
  }

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
    eventos: EVENTOS, estado: estado, datos: datos, refrescar: render, hoy: hoy, sinFechas: SIN_FECHAS,
    // lo que viene, en orden de fecha: [{ tipo, id, nombre, fechaISO, inicioISO, texto, url }] (vacía si no hay fechas)
    proximas: function () { return lista.slice(); },
    // para páginas que necesitan la cohorte vigente antes de que cargue el resto (p. ej. el curso Finanzas con IA).
    // Si no queda ninguna cohorte por empezar: vigente = false, fechasTexto = «Próximas fechas: escríbenos por WhatsApp» e inicioISO = null.
    cursoProximo: function () {
      if (!proxima) return { id: null, vigente: false, fechas: [], fechasTexto: SIN_FECHAS, hora: 'Por confirmar', inicioISO: null, cuposLibres: cur.cuposTotales, aforo: cur.cuposTotales, lugar: cur.lugar };
      return { id: proxima.id, vigente: true, fechas: proxima.fechas, fechasTexto: fechasCurso(proxima), hora: proxima.hora, inicioISO: proxima.fechas[0] + 'T' + proxima.inicio + ':00-04:00', cuposLibres: proxima.cuposLibres, aforo: cur.cuposTotales, lugar: cur.lugar };
    }
  };
  // Estado de carga: las fechas, horas y precios se marcan como skeleton (el texto de respaldo mantiene el tamaño) hasta que se pintan, y entran con un fundido
  function pintarConEstado() {
    var els = document.querySelectorAll('[data-ev]');
    els.forEach(function (el) { el.classList.add('skeleton'); el.setAttribute('aria-busy', 'true'); });
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      render();
      els.forEach(function (el) { el.classList.remove('skeleton'); el.removeAttribute('aria-busy'); el.classList.add('fade-in'); setTimeout(function () { el.classList.remove('fade-in'); }, 320); });
    }); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pintarConEstado); else pintarConEstado();
})();
