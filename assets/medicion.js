/* Medición de clics (Google Analytics 4). Un solo archivo para todo el sitio; ver README-MEDICION.md.
   - Cualquier elemento con data-evento="nombre" (o data-track) envía ese evento al hacer clic.
   - Todo enlace a WhatsApp envía "whatsapp_click" con el producto (data-product, o el nombre sacado del mensaje prellenado).
   - Los enlaces a /contacto#agenda y al calendario envían "diagnostico_gratis".
   - Si el elemento marcado con data-evento es un enlace a WhatsApp, su evento lleva también el producto.
   - En /ejecutivos (página para dueños de empresa) todo clic a WhatsApp envía además "ejecutivos_whatsapp" con el producto.
   - Los mensajes de cupo del curso Finanzas con IA envían "reservo_curso".
   - La calculadora envía "generate_lead" y "calculadora_pdf_descargado" desde assets/calculadora.js. */
(function () {
  'use strict';
  function slug(t) { return String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60); }
  function textoWa(a) {
    try { return decodeURIComponent((new URL(a.href).searchParams.get('text') || '').replace(/\+/g, ' ')); } catch (e) { return ''; }
  }
  function producto(a) {
    if (a.dataset.product) return a.dataset.product;
    var t = textoWa(a);
    if (!t) return '';
    var m = t.match(/quiero\s+(?:un |una |el |la |los |las )?(.+?)(?:\s*\(|[.,?¿]|$)/i);
    return slug(m ? m[1] : t);
  }
  function ubicacion(el) {
    return el.dataset.cta || (el.closest('#luci-panel') ? 'luci' : el.closest('#mobile-menu') ? 'menu_movil' : el.closest('header') ? 'header' : el.closest('footer') ? 'footer' : 'otro');
  }
  document.addEventListener('click', function (e) {
    if (typeof gtag !== 'function') return;
    var page = location.pathname.replace(/^\/|\.html$/g, '') || 'inicio';
    var marcado = e.target.closest('[data-evento],[data-track]');
    var evento = marcado ? (marcado.dataset.evento || marcado.dataset.track) : '';
    var a = e.target.closest('a[href]');
    var href = a ? (a.getAttribute('href') || '') : '';
    var esWa = /wa\.me/.test(href);
    if (marcado) {
      var datos = { cta_location: ubicacion(marcado), page: page };
      if (esWa && (marcado === a || marcado.contains(a))) datos.product = producto(a);
      gtag('event', evento, datos);
    }
    if (!a) return;
    if (esWa) {
      gtag('event', 'whatsapp_click', { cta_location: ubicacion(a), product: producto(a), page: page });
      // /ejecutivos (anuncios de Meta): todo WhatsApp de la página cuenta también como ejecutivos_whatsapp, con su producto (una sola vez)
      if (page === 'ejecutivos' && evento !== 'ejecutivos_whatsapp') gtag('event', 'ejecutivos_whatsapp', { product: producto(a), cta_location: ubicacion(a), page: page });
      if (/Finanzas con IA/i.test(textoWa(a)) && /cupo|reserv/i.test(textoWa(a))) gtag('event', 'reservo_curso', { cta_location: ubicacion(a), page: page });
    } else if (/\/contacto#agenda|cal\.com\/f-v-ai-group/.test(href) && !(marcado && marcado.dataset.evento === 'diagnostico_gratis')) {
      gtag('event', 'diagnostico_gratis', { cta_location: ubicacion(a), page: page });
    }
  });
})();
