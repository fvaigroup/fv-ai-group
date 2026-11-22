/* /triangular/cobranza · #antes-despues: comparador «Antes» / «Con Cobranza».
   Arrastre con pointer events (touch-action: pan-y en el marco: el scroll vertical sigue funcionando), y un
   <input type="range"> encima (invisible) para teclado y lectores de pantalla. La primera vez que se ve,
   la barra hace 50 → 30 → 70 → 50 como pista (no con reduced-motion ni si el visitante ya la tocó).
   Sin JS no pasa nada: el CSS muestra las dos capas una debajo de la otra. */
(function () {
  'use strict';
  var COB = window.COB;
  if (!COB || !COB.raiz) return;
  var marco = COB.raiz.querySelector('[data-cob-antes]');
  if (!marco) return;
  var rango = marco.querySelector('[data-cob-antes-rango]');
  if (!rango || !window.requestAnimationFrame) return;
  var reducir = !!COB.reducir;

  // Nombres ficticios por sector (fila 0..3 de la hoja y del panel) y sus iniciales
  var GENTE = {
    negocio: { n: ['Ana P.', 'José M.', 'Luisa R.', 'Carlos T.'], a: ['AP', 'JM', 'LR', 'CT'] },
    gimnasio: { n: ['Valeria S.', 'Andrés G.', 'Paola M.', 'Luis F.'], a: ['VS', 'AG', 'PM', 'LF'] },
    condominio: { n: ['Apto 1-A', 'Apto 2-C', 'Apto 4-B', 'Apto 6-D'], a: ['1A', '2C', '4B', '6D'] },
    club: { n: ['María R.', 'Pedro O.', 'Elena C.', 'Jorge B.'], a: ['MR', 'PO', 'EC', 'JB'] },
    colegio: { n: ['Fam. Pérez', 'Fam. Rojas', 'Fam. Díaz', 'Fam. León'], a: ['FP', 'FR', 'FD', 'FL'] }
  };
  var filas = [].slice.call(marco.querySelectorAll('[data-cob-antes-fila]'));
  var avatares = [].slice.call(marco.querySelectorAll('[data-cob-antes-av]'));
  var archivo = marco.querySelector('[data-cob-antes-archivo]');

  function sector(id, d) {
    var g = GENTE[id] || GENTE.negocio;
    filas.forEach(function (el) { var t = g.n[+el.getAttribute('data-cob-antes-fila')]; if (t && el.textContent !== t) el.textContent = t; });
    avatares.forEach(function (el) { var t = g.a[+el.getAttribute('data-cob-antes-av')]; if (t && el.textContent !== t) el.textContent = t; });
    if (archivo && d && d.personas) archivo.textContent = 'cobros_' + d.personas + '_FINAL_v3.xlsx';
  }
  if (COB.alCambiar) COB.alCambiar(sector);
  try { sector(COB.sector(), COB.datos()); } catch (e) {}

  // Equivalente en bolívares del total ficticio, con la tasa BCV real (si llega)
  var tasaEl = marco.querySelector('[data-cob-antes-tasa]');
  if (tasaEl && COB.tasa && COB.bs) {
    var total = parseFloat(tasaEl.getAttribute('data-total')) || 0;
    COB.tasa(function (t) {
      // Solo con la tasa en vivo: con una tasa guardada no sería «del día»
      if (!t || !t.rate || !total || !t.live) { tasaEl.hidden = true; return; }
      tasaEl.textContent = 'Equivale a ' + COB.bs(total * t.rate) + ' a la tasa BCV del día';
      tasaEl.hidden = false;
    });
  }

  // ---- Posición de la barra (0..100 = % de «Antes» que se ve) ----
  var valor = 50, pintado = -1, pedido = false;
  function limitar(v) { return v < 0 ? 0 : v > 100 ? 100 : v; }
  function pintar() {
    pedido = false;
    if (valor === pintado) return;
    pintado = valor;
    marco.style.setProperty('--cob-antes-x', (Math.round(valor * 10) / 10) + '%');
    var r = Math.round(valor);
    if (+rango.value !== r) rango.value = r;
    var txt = 'Se ve ' + r + ' % de antes y ' + (100 - r) + ' % con Cobranza';
    if (rango.getAttribute('aria-valuetext') !== txt) rango.setAttribute('aria-valuetext', txt);
  }
  function ponerYa(v) { valor = limitar(v); pintar(); }
  function poner(v) { valor = limitar(v); if (!pedido) { pedido = true; requestAnimationFrame(pintar); } }

  // ---- Animación (pista inicial y salto al tocar): pausada fuera de pantalla o con la pestaña oculta ----
  var anim = null, raf = 0, ultimo = 0, visible = false, tocado = false, pistaLista = false;
  function suave(k) { return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }
  function activo() { return visible && !document.hidden; }
  function cuadro(ts) {
    raf = 0;
    if (!anim) return;
    var dt = ultimo ? Math.min(ts - ultimo, 50) : 16;
    ultimo = ts;
    var paso = anim.pasos[anim.i];
    anim.t += dt;
    var k = Math.min(anim.t / paso[1], 1);
    ponerYa(anim.desde + (paso[0] - anim.desde) * suave(k));
    if (k >= 1) {
      anim.i++; anim.t = 0; anim.desde = paso[0];
      if (anim.i >= anim.pasos.length) { anim = null; ultimo = 0; return; }
    }
    if (activo()) raf = requestAnimationFrame(cuadro);
    else ultimo = 0;
  }
  function seguir() { if (anim && !raf && activo()) { ultimo = 0; raf = requestAnimationFrame(cuadro); } }
  function animar(pasos) {
    if (reducir) { ponerYa(pasos[pasos.length - 1][0]); return; }
    anim = { pasos: pasos, i: 0, t: 0, desde: valor };
    seguir();
  }
  function parar() {
    anim = null; ultimo = 0;
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
  }
  function tocar() { tocado = true; parar(); }

  function pista() {
    if (pistaLista || tocado || reducir) return;
    pistaLista = true;
    setTimeout(function () {
      if (tocado) return;
      animar([[30, 700], [70, 1000], [50, 700]]);
    }, 350);
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      var e = es[es.length - 1];
      visible = e.isIntersecting;
      if (visible && e.intersectionRatio >= 0.5) pista();
      if (visible) seguir();
    }, { threshold: [0, 0.5] }).observe(marco);
  } else {
    visible = true;
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) seguir(); });

  // ---- Teclado y lectores de pantalla: el input range ----
  rango.addEventListener('input', function () { tocar(); ponerYa(+rango.value); });
  rango.addEventListener('focus', tocar);
  rango.addEventListener('keydown', function (e) {
    var k = e.key, d = 0;
    if (k === 'ArrowLeft' || k === 'ArrowDown') d = -5;
    else if (k === 'ArrowRight' || k === 'ArrowUp') d = 5;
    else if (k === 'PageDown') d = -20;
    else if (k === 'PageUp') d = 20;
    if (!d) return;
    e.preventDefault();
    tocar();
    ponerYa(Math.round(valor) + d);
  });

  // ---- Arrastre con puntero ----
  // Mouse: arrastra desde cualquier punto. Toque: arrastra si se mueve en horizontal (o si empieza sobre la perilla);
  // un toque corto salta a ese punto; el gesto vertical lo toma el navegador (pointercancel) y no mueve nada.
  var rect = null, idp = null, arrastra = false, espera = false, x0 = 0, y0 = 0;
  function desdeX(cx) { return rect && rect.width ? (cx - rect.left) / rect.width * 100 : valor; }
  function empezar() {
    tocar();
    arrastra = true; espera = false;
    try { marco.setPointerCapture(idp); } catch (er) {}
    marco.classList.add('cob-antes-arrastra');
  }
  function soltar(e) {
    if (e.pointerId !== idp) return;
    if (espera && e.type === 'pointerup') { tocar(); animar([[desdeX(e.clientX), 260]]); }
    arrastra = false; espera = false; idp = null;
    marco.classList.remove('cob-antes-arrastra');
  }
  if (window.PointerEvent) {
    marco.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 || !e.isPrimary) return;
      // Un toque que termina en scroll vertical no cuenta como «tocado» (no cancela la pista)
      rect = marco.getBoundingClientRect();
      idp = e.pointerId; x0 = e.clientX; y0 = e.clientY;
      var cerca = Math.abs(e.clientX - (rect.left + rect.width * valor / 100)) < 32;
      if (e.pointerType === 'mouse' || cerca) {
        if (e.pointerType === 'mouse') e.preventDefault();
        empezar();
        poner(desdeX(e.clientX));
      } else {
        espera = true;
      }
    });
    marco.addEventListener('pointermove', function (e) {
      if (e.pointerId !== idp) return;
      if (espera) {
        var dx = Math.abs(e.clientX - x0), dy = Math.abs(e.clientY - y0);
        if (dx > 6 && dx > dy) empezar();
        else return;
      }
      if (arrastra) poner(desdeX(e.clientX));
    });
    marco.addEventListener('pointerup', soltar);
    marco.addEventListener('pointercancel', soltar);
  }

  // Activar el modo comparador
  marco.classList.add('cob-antes-listo');
  ponerYa(50);
  var ayuda = COB.raiz.querySelector('[data-cob-antes-ayuda]');
  if (ayuda) ayuda.hidden = false;
})();
