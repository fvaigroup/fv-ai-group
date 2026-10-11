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
  /* ---- Botones que abren WhatsApp: si pasado 1,5 s el sitio sigue en primer plano (no se abrió nada), un aviso pequeño con el número y un botón para copiarlo ---- */
  var NUMERO = '+58 424 412 5386', toast = null, toastTimer = null;
  function cerrarToast() { if (!toast) return; toast.classList.remove('is-visible'); var t = toast; toast = null; setTimeout(function () { t.remove(); }, 300); clearTimeout(toastTimer); }
  function copiar(texto, boton) {
    var listo = function () { boton.textContent = 'Número copiado'; anunciar('Número copiado'); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(texto).then(listo, function () { boton.textContent = NUMERO; });
    else { var i = document.createElement('input'); i.value = texto; document.body.appendChild(i); i.select(); try { document.execCommand('copy'); listo(); } catch (e) { boton.textContent = NUMERO; } i.remove(); }
  }
  function avisoWhatsApp() {
    if (toast || document.visibilityState !== 'visible') return;
    toast = document.createElement('div'); toast.className = 'fv-toast'; toast.setAttribute('role', 'status'); toast.setAttribute('aria-live', 'polite');
    toast.innerHTML = '<p>¿No se abrió? Escríbenos al <strong>' + NUMERO + '</strong></p>' +
      '<button type="button" class="fv-toast-copiar estado-interactivo">Copiar número</button>' +
      '<button type="button" class="fv-toast-cerrar estado-interactivo" aria-label="Cerrar aviso"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>';
    document.body.appendChild(toast);
    toast.querySelector('.fv-toast-copiar').addEventListener('click', function (e) { copiar('+584244125386', e.currentTarget); });
    toast.querySelector('.fv-toast-cerrar').addEventListener('click', cerrarToast);
    requestAnimationFrame(function () { toast && toast.classList.add('is-visible'); });
    toastTimer = setTimeout(cerrarToast, 9000);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="wa.me"]'); if (!a) return;
    setTimeout(function () { if (document.visibilityState === 'visible' && document.hasFocus()) avisoWhatsApp(); }, 1500);
  });

  /* ---- Imágenes grandes: fondo skeleton mientras cargan (el tamaño ya está reservado con width/height) y fundido al llegar ---- */
  function imagenes() {
    document.querySelectorAll('img').forEach(function (img) {
      if (img.complete && img.naturalWidth) return;
      img.classList.add('img-cargando');
      var listo = function () { img.classList.remove('img-cargando'); img.classList.add('img-listo'); setTimeout(function () { img.classList.remove('img-listo'); }, 320); };
      img.addEventListener('load', listo, { once: true });
      img.addEventListener('error', function () { img.classList.remove('img-cargando'); }, { once: true });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', imagenes); else imagenes();

  /* ---- Barra de progreso entre páginas: al hacer clic en un enlace interno (no externos, anclas ni wa.me) y completa al cargar la nueva página ---- */
  var barra = document.getElementById('page-load-bar');
  if (barra) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || a.target === '_blank' || a.hasAttribute('download') || e.metaKey || e.ctrlKey || e.shiftKey || e.defaultPrevented) return;
      try {
        var u = new URL(a.href, location.href);
        if (u.origin !== location.origin || /^(mailto|tel):/.test(a.getAttribute('href')) || (u.hash && u.pathname === location.pathname)) return;
        sessionStorage.setItem('fv_nav', '1');
      } catch (err) {}
    }, true);
    window.addEventListener('pageshow', function (e) {
      var venia = false; try { venia = sessionStorage.getItem('fv_nav') === '1'; sessionStorage.removeItem('fv_nav'); } catch (err) {}
      barra.style.transition = 'none'; barra.style.opacity = venia && !e.persisted ? '1' : '0'; barra.style.transform = venia && !e.persisted ? 'scaleX(.92)' : 'scaleX(0)';
      if (!venia || e.persisted) return;
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        barra.style.transition = ''; barra.style.transform = 'scaleX(1)';
        setTimeout(function () { barra.style.opacity = '0'; }, 380);
      }); });
    });
  }

  window.FV_ESTADOS = { setCargando: setCargando, mostrarSkeleton: mostrarSkeleton, ocultarSkeleton: ocultarSkeleton, anunciar: anunciar };
})();
