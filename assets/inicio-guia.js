/* Inicio (index.html) — efecto «guia» del rediseño (24 nov 2026): la luciérnaga guía del recorrido.
   En pantallas de 1360 px o más (y 640 px de alto; por debajo la columna pisaría el borde del contenido), una columna fina en el margen derecho con un hexágono por sección
   (la franja Delta lleva un triángulo verde/morado, porque es de la línea ▲). La luciérnaga (assets/logo-mark-hex.webp) baja por el riel
   con el scroll, la luz del riel (cian → blanco → naranja) se llena detrás de ella y el hexágono de la sección actual se enciende
   (aria-current="location"). Clic o Enter en un hexágono lleva a su sección, sin quedar tapada por la barra fija, y le pasa el foco.
   El HTML (un <nav> con enlaces normales) está en index.html entre <!-- ini:guia:inicio --> y <!-- ini:guia:fin -->: sin JS los enlaces funcionan igual.
   En el celular no se muestra (lo oculta el CSS del bloque inicio:guia; aquí no se escucha el scroll).
   Se esconde mientras el pie llega a su altura. Con prefers-reduced-motion la luciérnaga salta al hexágono actual, sin deslizarse ni brillar.
   En cada cuadro solo lee scrollY e innerHeight (las medidas van en caché) y escribe transform y clases. No guarda datos ni llama a servidores. */
(function () {
  'use strict';
  var INI = window.INI;
  if (!INI) return;
  var nav = INI.raiz.querySelector('[data-ini-guia]');
  if (!nav) return;
  var lista = nav.querySelector('.ini-guia-lista');
  var mq = window.matchMedia ? window.matchMedia('(min-width: 1360px) and (min-height: 640px)') : null;
  var REF = 0.4; // la sección «actual» es la que cruza el 40 % de la pantalla

  var pasos = [];
  [].forEach.call(nav.querySelectorAll('a[data-guia]'), function (a) {
    var sec = document.getElementById(a.getAttribute('data-guia'));
    var li = a.parentNode;
    if (!sec || sec.hidden) { li.parentNode.removeChild(li); return; }
    pasos.push({ a: a, li: li, sec: sec, top: 0, c: 0 });
  });
  if (pasos.length < 2) return;

  var riel, luz, luci, construido = false, activo = false;
  var c0 = 0, cN = 0, navAbajo = 0, pieTop = Infinity, altoPortada = 0, docAlto = 0, actual = -1, oculto = false, ultY = null, ultP = null;
  var pie = document.querySelector('footer');

  function construir() {
    if (construido) return;
    construido = true;
    riel = document.createElement('span');
    riel.className = 'ini-guia-riel';
    riel.setAttribute('aria-hidden', 'true');
    luz = document.createElement('span');
    luz.className = 'ini-guia-luz';
    riel.appendChild(luz);
    luci = document.createElement('span');
    luci.className = 'ini-guia-luci';
    luci.setAttribute('aria-hidden', 'true');
    luci.innerHTML = '<img src="/assets/logo-mark-hex.webp" width="500" height="500" alt="" decoding="async">';
    nav.insertBefore(riel, lista);
    nav.appendChild(luci);
    nav.classList.add('is-viva');
  }

  // ---------- medidas (en caché: se recalculan al cambiar el tamaño o el contenido) ----------
  function medir() {
    var y = window.pageYOffset || document.documentElement.scrollTop || 0;
    var rects = pasos.map(function (p) { return p.sec.getBoundingClientRect().top + y; });
    var centros = pasos.map(function (p) { return p.li.offsetTop + p.li.offsetHeight / 2; });
    var nr = nav.getBoundingClientRect();
    var pt = pie ? pie.getBoundingClientRect().top + y : Infinity;
    pasos.forEach(function (p, i) { p.top = rects[i]; p.c = centros[i]; });
    c0 = centros[0]; cN = centros[centros.length - 1];
    navAbajo = nr.bottom; pieTop = pt; altoPortada = pasos[0].sec.offsetHeight; docAlto = document.documentElement.scrollHeight;
    riel.style.top = c0 + 'px';
    riel.style.height = (cN - c0) + 'px';
    ultY = ultP = null;
    actualizar();
  }

  // ---------- en cada scroll: solo scrollY y transform ----------
  function actualizar() {
    pendiente = false;
    if (!activo) return;
    var vh = window.innerHeight;
    var y = window.pageYOffset || document.documentElement.scrollTop || 0;
    // solo scrollY e innerHeight: las posiciones vienen de medir() (el ResizeObserver las refresca si el contenido cambia de alto)
    var ref = y + vh * REF, n = pasos.length, i = 0;
    while (i < n - 1 && pasos[i + 1].top <= ref) i++;
    var alFinal = y + vh >= docAlto - 2;
    if (alFinal) i = n - 1;
    var pos = pasos[i].c;
    if (!INI.reducido() && i < n - 1 && !alFinal) {
      var f = (ref - pasos[i].top) / Math.max(1, pasos[i + 1].top - pasos[i].top);
      f = Math.max(0, Math.min(1, f));
      pos = pasos[i].c + (pasos[i + 1].c - pasos[i].c) * f;
    }
    var prog = cN > c0 ? (pos - c0) / (cN - c0) : 0;
    if (pos !== ultY) { luci.style.transform = 'translate3d(-50%,' + (pos - 15).toFixed(1) + 'px,0)'; ultY = pos; }
    if (prog !== ultP) { luz.style.transform = 'scaleY(' + prog.toFixed(4) + ')'; ultP = prog; }
    if (i !== actual) marcar(i);
    // integración: en la portada manda la luciérnaga del hexágono (y la columna no pisa la banda de logos); la guía aparece al dejarla atrás
    var ocultar = pieTop - y < navAbajo + 16 || (i === 0 && ref < pasos[0].top + altoPortada * 0.75);
    if (ocultar !== oculto) { oculto = ocultar; nav.classList.toggle('is-oculta', ocultar); }
  }

  function marcar(i) {
    var antes = actual;
    actual = i;
    pasos.forEach(function (p, j) {
      p.a.classList.toggle('is-pasada', j < i);
      p.a.classList.toggle('is-actual', j === i);
      if (j === i) p.a.setAttribute('aria-current', 'location'); else p.a.removeAttribute('aria-current');
    });
    if (antes !== -1 && !INI.reducido()) {
      var a = pasos[i].a;
      a.classList.remove('is-llega');
      void a.offsetWidth; // reinicia el destello
      a.classList.add('is-llega');
    }
  }

  var pendiente = false, medirPend = false;
  function pedir() { if (activo && !pendiente) { pendiente = true; INI.raf(actualizar); } }
  function pedirMedir() { if (activo && !medirPend) { medirPend = true; INI.raf(function () { medirPend = false; if (activo) medir(); }); } }

  function encender() {
    var si = !mq || mq.matches;
    if (si === activo) return;
    activo = si;
    if (activo) { construir(); medir(); }
  }

  addEventListener('scroll', pedir, { passive: true });
  addEventListener('resize', pedirMedir, { passive: true });
  addEventListener('load', pedirMedir);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(pedirMedir);
  if ('ResizeObserver' in window) new ResizeObserver(pedirMedir).observe(INI.raiz); // el FAQ, el diagnóstico o la brecha cambian de alto
  if (mq) { if (mq.addEventListener) mq.addEventListener('change', encender); else if (mq.addListener) mq.addListener(encender); }
  encender();

  // ---------- clic / Enter: ir a la sección sin quedar bajo la barra fija, y pasarle el foco ----------
  lista.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[data-guia]') : null;
    if (!a || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button) return;
    var p = null;
    pasos.forEach(function (q) { if (q.a === a) p = q; });
    if (!p) return;
    e.preventDefault();
    var y = window.pageYOffset || document.documentElement.scrollTop || 0;
    var margen = parseFloat(getComputedStyle(p.sec).scrollMarginTop) || 84;
    var destino = p.sec.id === 'inicio' ? 0 : Math.max(0, p.sec.getBoundingClientRect().top + y - margen);
    var modo = INI.reducido() ? 'instant' : 'smooth';
    try { window.scrollTo({ top: destino, behavior: modo }); } catch (err) { window.scrollTo(0, destino); }
    if (!p.sec.hasAttribute('tabindex')) { p.sec.setAttribute('tabindex', '-1'); p.sec.setAttribute('data-ini-guia-foco', ''); }
    try { p.sec.focus({ preventScroll: true }); } catch (err) { /* navegadores viejos: el scroll ya se hizo */ }
  });
})();
