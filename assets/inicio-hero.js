/* Inicio (index.html) — efecto «hero» del rediseño (24 nov 2026): el hexágono y la luciérnaga como protagonistas de la portada (#inicio).
   Usa el núcleo window.INI (assets/inicio-efectos.js, cargado antes con defer). Marcado en index.html entre <!-- ini:hero:inicio --> y <!-- ini:hero:fin -->;
   CSS en el bloque inicio:hero de src/tailwind.css.
   - Paralaje de puntero (solo mouse, ≥ 1024 px, sin reduced-motion): el aro, la luciérnaga, las tarjetas y la rejilla hexagonal se mueven a velocidades
     distintas (profundidad). Escribe style.translate, así no pisa el paralaje de scroll del núcleo (style.transform) ni el giro y la levitación de las imágenes.
     El bucle con requestAnimationFrame se detiene solo cuando la capa llega a su sitio.
   - Tarjetas de vidrio: aparecen escalonadas; las barras del tablero cambian cada pocos segundos (solo con la portada en pantalla);
     el aviso de WhatsApp «llega» de nuevo cada tanto.
   - Tasa BCV: la tarjeta solo se muestra si la tasa llegó EN VIVO (assets/bcv.js, por INI.tasa); si no, no hay cifra.
   Sin JS las tarjetas se ven quietas. Con prefers-reduced-motion: nada se mueve (estado final). No guarda datos ni llama a servidores. */
(function () {
  'use strict';
  var I = window.INI;
  if (!I) return;
  var caja = I.montar('hero');
  var capa = caja && caja.querySelector('.ini-hr');
  var sec = document.getElementById('inicio');
  if (!capa || !sec) return;
  var reducir = I.reducido();

  // ---------- entrada escalonada de las tarjetas ----------
  capa.classList.add('ini-hr-on');
  if (reducir) capa.classList.add('is-in');
  else I.raf(function () { I.raf(function () { capa.classList.add('is-in'); }); });

  // ---------- tasa BCV del día (solo en vivo) ----------
  var tarjetaTasa = capa.querySelector('[data-hr-tasa]');
  var valorTasa = capa.querySelector('[data-hr-tasa-valor]');
  var fechaTasa = capa.querySelector('[data-hr-tasa-fecha]');
  var tasaMostrada = false;
  function fechaCorta(iso) {
    var d = new Date(iso);
    if (!iso || isNaN(d)) return '';
    try { return d.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Caracas' }); } catch (e) { return ''; }
  }
  if (tarjetaTasa && valorTasa) I.tasa(function (t) {
    if (!t.live || !(t.rate > 0) || tasaMostrada) return;
    tasaMostrada = true;
    var f = fechaCorta(t.fecha);
    if (fechaTasa) fechaTasa.textContent = f ? 'Publicada el ' + f : '';
    tarjetaTasa.hidden = false;
    capa.classList.add('con-tasa');
    I.contar(valorTasa, t.rate, 1100, function (v) { return I.miles(v, 2); }, t.rate * 0.96);
  });

  if (reducir) return;

  // ---------- en pantalla: las animaciones de las tarjetas corren solo con la portada visible ----------
  var visible = true;
  I.enPantalla(sec, function (v) { visible = v; });

  // barras del tablero que se actualizan (alturas de ejemplo, sin cifras)
  var barras = [].slice.call(capa.querySelectorAll('.ini-hr-barras span'));
  var base = barras.map(function (b) { return parseFloat(b.style.getPropertyValue('--h')) || 0.5; });
  setInterval(function () {
    if (!visible || document.hidden) return;
    barras.forEach(function (b, i) {
      var h = Math.max(0.18, Math.min(1, base[i] + (Math.random() - 0.45) * 0.34));
      b.style.setProperty('--h', h.toFixed(2));
    });
  }, 2800);

  // el aviso de WhatsApp vuelve a «llegar»
  var wa = capa.querySelector('.ini-hr-wa');
  if (wa) setInterval(function () {
    if (!visible || document.hidden) return;
    wa.classList.remove('is-nuevo');
    void wa.offsetWidth; // reinicia la animación
    wa.classList.add('is-nuevo');
  }, 7000);

  // ---------- paralaje de puntero (profundidad) ----------
  var hexcapas = sec.querySelectorAll('.ini-hexcapa');
  var luces = capa.querySelectorAll('.ini-hr-capa');
  var capas = [
    { el: sec.querySelector('.ini-mesh .ini-hexgrid'), k: -8 }, // la rejilla, al fondo, va al revés
    { el: hexcapas[0], k: 12 }, { el: luces[0], k: 12 },        // aro y su luz
    { el: hexcapas[1], k: 24 }, { el: luces[1], k: 24 },        // luciérnaga, su halo y sus chispas
    { el: capa.querySelector('.ini-hr-cartas'), k: 36 }        // tarjetas, las más cercanas
  ].filter(function (c) { return c.el; });
  var meta = { x: 0, y: 0 }, pos = { x: 0, y: 0 }, corriendo = false;
  var activo = I.escritorio() && I.puntero();
  addEventListener('resize', function () {
    var a = I.escritorio() && I.puntero();
    if (a !== activo) { activo = a; meta.x = meta.y = 0; arrancar(); }
  }, { passive: true });
  function aplicar() {
    capas.forEach(function (c) { c.el.style.translate = (pos.x * c.k).toFixed(1) + 'px ' + (pos.y * c.k).toFixed(1) + 'px'; });
  }
  function paso() {
    pos.x += (meta.x - pos.x) * 0.07;
    pos.y += (meta.y - pos.y) * 0.07;
    if (Math.abs(meta.x - pos.x) < 0.002 && Math.abs(meta.y - pos.y) < 0.002) { pos.x = meta.x; pos.y = meta.y; corriendo = false; }
    aplicar();
    if (corriendo) I.raf(paso);
  }
  function arrancar() { if (!corriendo) { corriendo = true; I.raf(paso); } }
  sec.addEventListener('pointermove', function (e) {
    if (!activo || e.pointerType !== 'mouse') return;
    meta.x = Math.max(-1, Math.min(1, e.clientX / innerWidth * 2 - 1));
    meta.y = Math.max(-1, Math.min(1, e.clientY / innerHeight * 2 - 1));
    arrancar();
  }, { passive: true });
  sec.addEventListener('pointerleave', function () { meta.x = meta.y = 0; arrancar(); });
})();
