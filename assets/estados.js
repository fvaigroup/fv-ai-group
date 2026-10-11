/* Estados de interacción: ayudas pequeñas para botones en carga, skeletons y avisos para lectores de pantalla.
   Uso:  FV_ESTADOS.setCargando(boton, true[, 'Abriendo WhatsApp…']);  ...  FV_ESTADOS.setCargando(boton, false);
         FV_ESTADOS.mostrarSkeleton(contenedor);  ...  FV_ESTADOS.ocultarSkeleton(contenedor);
         FV_ESTADOS.anunciar('Listo');   (texto para lectores de pantalla, aria-live="polite")
   Los estilos están en src/tailwind.css (.btn-cargando, .skeleton, .spinner, .fade-in). */
(function () {
  'use strict';
  if (window.FV_ESTADOS) return; // por si la página lo carga dos veces
  var vivo = null;
  function region() {
    if (vivo) return vivo;
    vivo = document.createElement('div'); vivo.className = 'fv-sr-only'; vivo.setAttribute('role', 'status'); vivo.setAttribute('aria-live', 'polite'); vivo.setAttribute('aria-atomic', 'true');
    document.body.appendChild(vivo); return vivo;
  }
  function anunciar(texto) { var r = region(); r.textContent = ''; setTimeout(function () { r.textContent = texto; }, 30); }

  // Botón (o enlace con aspecto de botón) en carga. Sin texto: el contenido se oculta con opacity y aparece el spinner centrado (el ancho no cambia).
  function setCargando(boton, activo, texto) {
    if (!boton) return;
    if (activo) {
      if (boton.classList.contains('btn-cargando')) return;
      boton.__fv = { html: boton.innerHTML, disabled: boton.disabled, minWidth: boton.style.minWidth, aria: boton.getAttribute('aria-disabled') };
      boton.style.minWidth = boton.offsetWidth + 'px'; // el ancho no salta aunque cambie la etiqueta
      var contenido = document.createElement('span'); contenido.className = 'btn-cargando-contenido';
      if (texto) contenido.textContent = texto; else contenido.innerHTML = boton.innerHTML;
      var sp = document.createElement('span'); sp.className = 'spinner-sm'; sp.setAttribute('aria-hidden', 'true');
      boton.innerHTML = '';
      if (texto) { boton.appendChild(sp); boton.appendChild(contenido); boton.classList.add('btn-cargando-texto'); }
      else { boton.appendChild(contenido); boton.appendChild(sp); }
      boton.classList.add('btn-cargando'); boton.setAttribute('aria-busy', 'true');
      if ('disabled' in boton) boton.disabled = true; else boton.setAttribute('aria-disabled', 'true');
      anunciar(texto || 'Cargando…');
    } else {
      var g = boton.__fv; if (!g) return;
      boton.innerHTML = g.html; boton.style.minWidth = g.minWidth;
      boton.classList.remove('btn-cargando', 'btn-cargando-texto'); boton.removeAttribute('aria-busy');
      if ('disabled' in boton) boton.disabled = g.disabled;
      if (g.aria === null) boton.removeAttribute('aria-disabled'); else boton.setAttribute('aria-disabled', g.aria);
      boton.__fv = null;
    }
  }

  function mostrarSkeleton(c) { if (!c) return; c.classList.add('skeleton'); c.setAttribute('aria-busy', 'true'); }
  function ocultarSkeleton(c) {
    if (!c) return; var estaba = c.classList.contains('skeleton');
    c.classList.remove('skeleton'); c.removeAttribute('aria-busy');
    if (estaba) { c.classList.add('fade-in'); setTimeout(function () { c.classList.remove('fade-in'); }, 320); }
  }
  window.FV_ESTADOS = { setCargando: setCargando, mostrarSkeleton: mostrarSkeleton, ocultarSkeleton: ocultarSkeleton, anunciar: anunciar };
})();
