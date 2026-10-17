/* Menú del sitio (encabezado compartido, partials/header.html). Un solo archivo para todas las páginas; sin dependencias.
   - Menú móvil: abre y cierra, cambia el ícono, mantiene aria-expanded y se cierra al pulsar un enlace o Escape.
   - Acordeón móvil: Servicios y Productos tienen enlace + botón; el botón despliega sus categorías (una a la vez).
   - Desplegables de escritorio (patrón disclosure, no role="menu"): el botón abre con clic, Enter o Espacio; con puntero fino
     también al pasar el mouse, con una pequeña demora al salir para no cerrarse al cruzar. Escape cierra y devuelve el foco al
     botón; al salir el foco del panel se cierra; un clic fuera cierra; solo uno abierto a la vez. En táctil el enlace navega
     y el botón abre.
   - Medición: al abrir un desplegable (clic o teclado) o seguir uno de sus enlaces envía menu_categoria a GA4 si gtag existe.
   El movimiento lo controla el CSS (src/tailwind.css, sección «Menú: desplegables»), que respeta prefers-reduced-motion. */
(function () {
  'use strict';

  var DEMORA_CIERRE = 160; // ms: tiempo para cruzar del botón al panel sin que se cierre
  var pagina = location.pathname.replace(/^\/|\.html$/g, '') || 'inicio';

  function medir(categoria) {
    try {
      if (typeof window.gtag === 'function') window.gtag('event', 'menu_categoria', { categoria: categoria, page: pagina });
    } catch (e) { /* la medición nunca debe romper el menú */ }
  }

  /* ---------- Menú móvil ---------- */
  var btn = document.getElementById('menu-btn');
  var menu = document.getElementById('mobile-menu');
  var iconoAbrir = document.getElementById('icon-open');
  var iconoCerrar = document.getElementById('icon-close');

  function cerrarAcordeones(except) {
    if (!menu) return;
    menu.querySelectorAll('[data-acordeon].is-open').forEach(function (g) {
      if (g !== except) ponerAcordeon(g, false);
    });
  }
  function ponerAcordeon(grupo, abrir) {
    var b = grupo.querySelector('[data-menu-toggle]');
    grupo.classList.toggle('is-open', abrir);
    if (b) b.setAttribute('aria-expanded', String(abrir));
  }
  function ponerMenuMovil(abrir) {
    if (!btn || !menu) return;
    menu.classList.toggle('is-open', abrir);
    if (iconoAbrir) iconoAbrir.classList.toggle('hidden', abrir);
    if (iconoCerrar) iconoCerrar.classList.toggle('hidden', !abrir);
    btn.setAttribute('aria-expanded', String(abrir));
    if (!abrir) cerrarAcordeones();
  }
  if (btn && menu) {
    btn.addEventListener('click', function () { ponerMenuMovil(!menu.classList.contains('is-open')); });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        var c = a.getAttribute('data-menu-categoria');
        if (c) medir(c);
        ponerMenuMovil(false);
      });
    });
    menu.querySelectorAll('[data-acordeon] [data-menu-toggle]').forEach(function (b) {
      b.addEventListener('click', function () {
        var grupo = b.closest('[data-acordeon]');
        var abrir = !grupo.classList.contains('is-open');
        cerrarAcordeones(grupo);
        ponerAcordeon(grupo, abrir);
        if (abrir) medir(grupo.getAttribute('data-menu-grupo') || '');
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        ponerMenuMovil(false);
        btn.focus();
      }
    });
    // Si la ventana pasa a escritorio con el menú móvil abierto, se deja cerrado y en orden
    var escritorio = window.matchMedia ? window.matchMedia('(min-width: 1024px)') : null;
    if (escritorio && escritorio.addEventListener) {
      escritorio.addEventListener('change', function (e) { if (e.matches) ponerMenuMovil(false); });
    }
  }

  /* ---------- Desplegables de escritorio ---------- */
  var items = Array.prototype.slice.call(document.querySelectorAll('#site-header [data-menu-item]'));
  if (!items.length) return;

  var temporizadores = new WeakMap();

  function boton(item) { return item.querySelector('[data-menu-toggle]'); }
  function estaAbierto(item) { return item.classList.contains('is-open'); }
  function cancelar(item) {
    var t = temporizadores.get(item);
    if (t) { clearTimeout(t); temporizadores.delete(item); }
  }
  function abrir(item, modo) {
    cancelar(item);
    items.forEach(function (o) { if (o !== item) cerrar(o); });
    item.classList.add('is-open');
    item.setAttribute('data-modo', modo);
    var b = boton(item);
    if (b) b.setAttribute('aria-expanded', 'true');
  }
  function cerrar(item) {
    cancelar(item);
    if (!estaAbierto(item)) return;
    item.classList.remove('is-open');
    item.removeAttribute('data-modo');
    var b = boton(item);
    if (b) b.setAttribute('aria-expanded', 'false');
  }
  function cerrarConDemora(item) {
    cancelar(item);
    temporizadores.set(item, setTimeout(function () { cerrar(item); }, DEMORA_CIERRE));
  }

  items.forEach(function (item) {
    var b = boton(item);
    if (!b) return;
    var grupo = item.getAttribute('data-menu-grupo') || '';

    // Clic, Enter o Espacio en el botón (los tres llegan como "click" en un <button>)
    b.addEventListener('click', function () {
      if (estaAbierto(item) && item.getAttribute('data-modo') === 'hover') {
        // lo abrió el mouse al pasar: el clic lo deja fijo en vez de cerrarlo
        item.setAttribute('data-modo', 'fijo');
        medir(grupo);
        return;
      }
      if (estaAbierto(item)) { cerrar(item); return; }
      abrir(item, 'fijo');
      medir(grupo);
    });

    // Flecha abajo en el botón: abre y lleva el foco al primer enlace
    b.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!estaAbierto(item)) { abrir(item, 'fijo'); medir(grupo); }
        var primero = item.querySelector('.menu-panel a');
        if (primero) primero.focus();
      }
    });

    // Hover solo con puntero fino (mouse). En táctil el enlace navega y el botón abre.
    item.addEventListener('pointerenter', function (e) {
      if (e.pointerType !== 'mouse') return;
      cancelar(item);
      if (!estaAbierto(item)) abrir(item, 'hover');
    });
    item.addEventListener('pointerleave', function (e) {
      if (e.pointerType !== 'mouse') return;
      if (item.getAttribute('data-modo') === 'hover') cerrarConDemora(item);
    });

    // Escape: cierra y devuelve el foco al botón si el foco estaba dentro
    item.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !estaAbierto(item)) return;
      var dentro = item.contains(document.activeElement);
      cerrar(item);
      if (dentro) b.focus();
      e.stopPropagation();
    });

    // Al salir el foco del grupo se cierra (relatedTarget nulo = clic en zona no enfocable: lo resuelve el clic fuera)
    item.addEventListener('focusout', function (e) {
      if (e.relatedTarget && !item.contains(e.relatedTarget)) cerrar(item);
    });

    // Medición al seguir un enlace del desplegable
    item.querySelectorAll('.menu-panel a').forEach(function (a) {
      a.addEventListener('click', function () {
        var c = a.getAttribute('data-menu-categoria');
        if (c) medir(c);
        cerrar(item);
      });
    });
  });

  // Clic o toque fuera: cierra todos
  document.addEventListener('pointerdown', function (e) {
    items.forEach(function (item) { if (estaAbierto(item) && !item.contains(e.target)) cerrar(item); });
  });
  // Un clic dentro de un iframe (el calendario de Contacto) no llega al documento: se detecta porque la ventana pierde el foco
  window.addEventListener('blur', function () {
    if (document.activeElement && document.activeElement.tagName === 'IFRAME') items.forEach(cerrar);
  });
  // Si se abre el buscador (Ctrl+K o su botón), los desplegables se cierran
  var buscador = document.getElementById('search-trigger');
  if (buscador) buscador.addEventListener('click', function () { items.forEach(cerrar); });
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) items.forEach(cerrar);
  });
})();
