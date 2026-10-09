/* Medición de clics (Google Analytics 4). Un solo archivo para todo el sitio; ver README-MEDICION.md.
   - Cualquier elemento con data-evento="nombre" (o data-track) envía ese evento al hacer clic.
   - Todo enlace a WhatsApp envía "whatsapp_click" con el producto (data-product, o el nombre sacado del mensaje prellenado).
   - Los enlaces a /contacto#agenda y al calendario envían "diagnostico_gratis".
   - Los mensajes de reserva con $100 del curso envían "reservo_100".
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
    if (marcado) gtag('event', marcado.dataset.evento || marcado.dataset.track, { cta_location: ubicacion(marcado), page: page });
    var a = e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (/wa\.me/.test(href)) {
      gtag('event', 'whatsapp_click', { cta_location: ubicacion(a), product: producto(a), page: page });
      if (/\$100|%24100/.test(textoWa(a) + href) && /reserv/i.test(textoWa(a))) gtag('event', 'reservo_100', { cta_location: ubicacion(a), page: page });
    } else if (/\/contacto#agenda|cal\.com\/f-v-ai-group/.test(href) && !(marcado && marcado.dataset.evento === 'diagnostico_gratis')) {
      gtag('event', 'diagnostico_gratis', { cta_location: ubicacion(a), page: page });
    }
  });
})();
