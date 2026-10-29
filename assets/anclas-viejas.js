/* Anclas viejas de /hexagonal y /triangular. Sin dependencias.
   Las redirecciones de vercel.json llevan /hexagonal y /triangular a /servicios y /productos y el navegador conserva el ancla
   (por ejemplo /hexagonal#web-corporativa-crm llega a /servicios#web-corporativa-crm). Este script, que solo se carga en
   /servicios y /productos cuando la URL trae un ancla, lleva esa ancla a su página nueva.
   Reglas:
   - Si la página tiene un elemento con ese id (las categorías actuales: #diagnostico, #implementacion, #formacion, #acompanamiento,
     #software, #cursos, #para-empezar, #presencia, #control, #ventas), no se toca nada.
   - Si no, se busca en la tabla; con destino null la página se queda donde está y se quita el ancla.
   - Un ancla que no está en la tabla se deja como está (el navegador simplemente no se mueve).
   Se usa location.replace: la página vieja no queda en el historial. */
(function () {
  'use strict';

  var S = '/servicios/';
  var P = '/productos/';
  var TABLA = {
    // Servicios (antes en /hexagonal)
    'asesoria-estrategica': S + 'diagnostico',
    'evaluacion-procesos': S + 'diagnostico',
    'tablero-gerencial': S + 'tablero-gerencial',
    'reportes-whatsapp': S + 'reportes-whatsapp',
    'conciliacion-automatica': S + 'conciliacion-automatica',
    'web-corporativa-crm': S + 'web-corporativa-crm',
    'agente-ia': S + 'agente-ia',
    'sprint-automatizacion': S + 'sprint-automatizacion',
    'odoo-community': S + 'odoo-community',
    'ecosistema-automatizacion': S + 'ecosistema-automatizacion',
    'dynamics-365': S + 'dynamics-365',
    'desarrollo-a-medida': S + 'desarrollo-a-medida',
    'formacion-ejecutiva': S + 'formacion-ejecutiva',
    'formacion-equipo': S + 'formacion-equipo',
    'habilitacion-equipos': S + 'formacion-equipo',
    'masterclass-privada': S + 'masterclass-privada',
    'finanzas-ia-sede': S + 'finanzas-ia-sede',
    'asesor-financiero': S + 'asesor-financiero',
    'acompanamiento-estandar': S + 'acompanamiento#estandar',
    'acompanamiento-prioritario': S + 'acompanamiento#prioritario',
    'director-ia': S + 'acompanamiento#director-ia',
    'programa-ejecutivo': '/ejecutivos#programa-ejecutivo',
    // Secciones de /hexagonal que ahora son categorías de /servicios
    'cat-diagnostico': '/servicios#diagnostico',
    'cat-plata': '/servicios#implementacion',
    'cat-ventas': '/servicios#implementacion',
    'cat-sistemas': '/servicios#implementacion',
    'cat-aprende': '/servicios#formacion',
    'cat-mensual': '/servicios#acompanamiento',
    'mensualidades': '/servicios#acompanamiento',
    'software': '/productos#software',
    // Productos (antes en /triangular y en /cursos)
    'plan-arranque': P + 'plan-arranque',
    'caja-clara': P + 'caja-clara',
    'tablero-ejecutivo': P + 'tablero-ejecutivo',
    'asistente-ia': P + 'asistente-ia',
    'mis-finanzas-claras': P + 'mis-finanzas-claras',
    'aprende': P + 'taller-plata-clara',
    'taller-plata-clara': P + 'taller-plata-clara',
    'presencia': '/paginas-web',          // solo si la página no tiene su propia categoría #presencia (ver arriba)
    'finanzas-ia-grupal': '/cursos/finanzas-ia',
    'finanzas-con-ia': '/cursos/finanzas-ia',
    'taller-chatgpt': '/productos#cursos',
    'fechas': '/productos#cursos',
    'formacion-empresas': '/servicios#formacion',
    // El asesor de pago mensual de lo ▲ ya no existe: se queda en la página y se quita el ancla
    'asesor': null,
    'asesor-sesion': null,
    'asesor-enfoque': null,
    'asesor-mensual': null,
    'asesor-pro': null,
    'sesion-clara': null
  };

  function destino(id) {
    if (!Object.prototype.hasOwnProperty.call(TABLA, id)) return undefined;
    return TABLA[id];
  }

  function revisar() {
    var hash = location.hash;
    if (!hash || hash.length < 2) return;
    var id;
    try { id = decodeURIComponent(hash.slice(1)); } catch (e) { return; }
    if (document.getElementById(id)) return;       // ancla válida de esta página
    var nuevo = destino(id);
    if (nuevo === undefined) return;
    if (nuevo === null) {
      if (window.history && history.replaceState) history.replaceState(null, '', location.pathname + location.search);
      return;
    }
    location.replace(nuevo);
  }

  revisar();
  window.addEventListener('hashchange', revisar);
})();
