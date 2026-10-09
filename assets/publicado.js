/* Prueba social real (testimonios, casos): lista pero OCULTA hasta que el dueño la publique.
   Para publicar uno: en el HTML cambia data-publicado="false" por data-publicado="true" en ESE elemento (y borra el comentario PENDIENTE).
   El contenedor [data-publicado-wrap] se muestra solo si dentro hay al menos un elemento publicado. */
(function () {
  function run() {
    document.querySelectorAll('[data-publicado-wrap]').forEach(function (wrap) {
      var publicados = wrap.querySelectorAll('[data-publicado="true"]');
      if (!publicados.length) return;
      publicados.forEach(function (el) { el.style.display = ''; el.removeAttribute('aria-hidden'); });
      wrap.classList.remove('hidden');
      wrap.style.display = '';
      wrap.removeAttribute('aria-hidden');
      // si hay textos de respaldo ("Estamos documentando…"), se ocultan al haber casos publicados
      wrap.querySelectorAll('[data-publicado-vacio]').forEach(function (el) { el.style.display = 'none'; });
    });
    // los avisos "todavía no hay nada publicado" solo se ven si no hay ningún elemento publicado en la página
    var hay = document.querySelector('[data-publicado="true"]');
    document.querySelectorAll('[data-publicado-vacio]:not([data-publicado-wrap] *)').forEach(function (el) { el.style.display = hay ? 'none' : ''; });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
