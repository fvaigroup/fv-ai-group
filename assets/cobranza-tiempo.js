/* /triangular/cobranza: línea de tiempo «Así se cobra solo» (#linea-tiempo).
   Celular, reduced-motion o sin sticky posible: lista normal (aparece con data-cob-ve del núcleo); aquí solo se cambian textos por sector.
   Escritorio (≥1024 px y ≥640 px de alto): pone .is-fijo, copia las tarjetas al teléfono y, al bajar, llena el riel y marca el hito activo. */
(function () {
  'use strict';
  var COB = window.COB;
  if (!COB) return;
  var sec = document.getElementById('linea-tiempo');
  if (!sec) return;
  var pista = sec.querySelector('.cob-tiempo-pista');
  var fijo = sec.querySelector('.cob-tiempo-fijo');
  var grid = sec.querySelector('.cob-tiempo-grid');
  var riel = sec.querySelector('.cob-tiempo-riel');
  var relleno = riel ? riel.querySelector('i') : null;
  var hitos = [].slice.call(sec.querySelectorAll('.cob-tiempo-hito'));
  var pantalla = sec.querySelector('.cob-tiempo-pantalla');
  var diaEl = sec.querySelector('[data-tiempo-dia]');
  if (!pista || !fijo || !grid || hitos.length < 2) return;

  // Textos propios por sector (los nombres salen de COB.S)
  var T = {
    negocio: { cuota: 'tu plan mensual', extra: ' Su cuenta queda al día en tu panel.', corto: 'Cuenta al día' },
    gimnasio: { cuota: 'tu membresía mensual', extra: ' Y su carnet QR sigue activo para entrar.', corto: 'Carnet QR activo' },
    condominio: { cuota: 'tu recibo de condominio', extra: ' El recibo va explicado por alícuota, con los gastos y sus facturas.', corto: 'Recibo por alícuota' },
    club: { cuota: 'tu cuota social', extra: ' Y su carnet digital con QR sigue activo.', corto: 'Carnet QR activo' },
    colegio: { cuota: 'la mensualidad de tus hijos', extra: ' Todo queda en la cuenta del representante.', corto: 'Cuenta del representante al día' }
  };
  function may(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }
  function textos(id) {
    var b = (COB.S && (COB.S[id] || COB.S.negocio)) || {};
    var t = T[id] || T.negocio;
    return {
      persona: b.persona, org: b.org, ini: b.ini, linea: b.linea,
      cuota: t.cuota, Cuota: may(t.cuota), extra: t.extra, corto: t.corto,
      msg: 'Hola. Te recordamos que ' + t.cuota + ' vence en 3 días. Puedes pagar desde este enlace, en Bs o USD.'
    };
  }
  var txt = textos(COB.sector());
  var tasaTxt = null;
  var cuandos = hitos.map(function (li) { var c = li.querySelector('.cob-tiempo-cuando'); return c ? c.textContent : ''; });

  var fijoOn = false, visible = false, activo = -1, capas = [], parar = null;
  var centros = [], topFijo = 0, altoFijo = 0, pendiente = false, pendienteEval = false;

  // Tecleo del mensaje de WhatsApp en el teléfono (solo con .is-fijo y en pantalla)
  function msgTel() { return capas[0] ? capas[0].querySelector('[data-tiempo-msg]') : null; }
  function cortarTecleo() {
    if (parar) { parar(); parar = null; }
    var el = msgTel();
    if (el) { el.classList.remove('is-tecleando'); if (el.textContent !== txt.msg) el.textContent = txt.msg; }
  }
  function teclear() {
    cortarTecleo();
    var el = msgTel();
    if (!el || COB.reducir || document.hidden || !visible || !COB.teclear) return;
    el.classList.add('is-tecleando');
    parar = COB.teclear(el, txt.msg, 14, function () { el.classList.remove('is-tecleando'); parar = null; });
  }

  function aplicar() {
    var tecleando = !!parar;
    if (tecleando) { parar(); parar = null; }
    [].forEach.call(sec.querySelectorAll('[data-tiempo-k]'), function (el) {
      var v = txt[el.getAttribute('data-tiempo-k')];
      if (v != null && el.textContent !== v) el.textContent = v;
    });
    [].forEach.call(sec.querySelectorAll('[data-tiempo-msg]'), function (el) { el.classList.remove('is-tecleando'); el.textContent = txt.msg; });
    if (tasaTxt) [].forEach.call(sec.querySelectorAll('[data-tiempo-tasa]'), function (el) { el.textContent = tasaTxt; });
    if (fijoOn && activo === 0 && visible) teclear();
  }

  // ¿Puede funcionar el sticky? Ningún padre puede tener overflow hidden/auto/scroll (clip sí sirve)
  function stickyPosible() {
    if (!(window.CSS && CSS.supports && CSS.supports('position', 'sticky'))) return false;
    for (var el = sec.parentElement; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
      var cs = getComputedStyle(el);
      if (/auto|scroll|hidden/.test(cs.overflowX + ' ' + cs.overflowY)) return false;
    }
    return true;
  }
  var mq = window.matchMedia ? matchMedia('(min-width: 1024px) and (min-height: 640px)') : null;

  // Centros de los puntos (relativos a .cob-tiempo-linea) y medidas del bloque fijo; solo al cambiar el tamaño o el texto
  function medir() {
    centros = hitos.map(function (li) {
      var p = li.querySelector('.cob-tiempo-punto');
      return li.offsetTop + (p ? p.offsetTop + p.offsetHeight / 2 : 0);
    });
    if (riel && centros.length > 1) {
      riel.style.top = centros[0] + 'px';
      riel.style.bottom = 'auto';
      riel.style.height = Math.max(0, centros[centros.length - 1] - centros[0]) + 'px';
    }
    if (fijoOn) {
      topFijo = parseFloat(getComputedStyle(fijo).top) || 0;
      altoFijo = fijo.offsetHeight;
    }
  }

  function armarTel() {
    if (capas.length || !pantalla) return;
    hitos.forEach(function (li) {
      var t = li.querySelector('.cob-tiempo-tarjeta');
      var c = t ? t.cloneNode(true) : document.createElement('div');
      c.classList.remove('cob-vidrio');
      c.classList.add('cob-tiempo-tarjeta', 'cob-tiempo-capa');
      pantalla.appendChild(c);
      capas.push(c);
    });
  }

  function activar(i) {
    activo = i;
    hitos.forEach(function (li, j) {
      li.classList.toggle('is-activo', j === i);
      li.classList.toggle('is-hecho', j < i);
      if (j === i) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
    capas.forEach(function (c, j) { c.classList.toggle('is-activo', j === i); });
    if (diaEl && cuandos[i] && diaEl.textContent !== cuandos[i]) diaEl.textContent = cuandos[i];
    if (i === 0) teclear(); else cortarTecleo();
  }

  // Progreso de 0 a 1 mientras el bloque está fijo; cada hito ocupa un cuarto y el riel llega a su punto justo al activarse
  function pintar() {
    pendiente = false;
    if (!fijoOn || document.hidden) return;
    var r = pista.getBoundingClientRect();
    var p = (topFijo - r.top) / Math.max(1, r.height - altoFijo);
    p = p < 0 ? 0 : p > 1 ? 1 : p;
    var n = hitos.length;
    var seg = p * n;
    var i = Math.min(n - 1, Math.floor(seg));
    var y = centros[i] || 0;
    if (i < n - 1 && centros[i + 1] != null) y += (seg - i) * (centros[i + 1] - centros[i]);
    var total = (centros[n - 1] || 0) - (centros[0] || 0);
    if (relleno) relleno.style.transform = 'scaleY(' + (total > 0 ? (y - centros[0]) / total : 0).toFixed(4) + ')';
    if (i !== activo) activar(i);
  }
  function pedir() { if (!pendiente) { pendiente = true; requestAnimationFrame(pintar); } }

  function encender() {
    fijoOn = true;
    sec.classList.add('is-fijo');
    armarTel();
    activo = -1;
  }
  function apagar() {
    fijoOn = false;
    sec.classList.remove('is-fijo');
    cortarTecleo();
    activo = -1;
    hitos.forEach(function (li) { li.classList.remove('is-activo', 'is-hecho'); li.removeAttribute('aria-current'); });
    capas.forEach(function (c) { c.classList.remove('is-activo'); });
    if (relleno) relleno.style.transform = '';
  }

  function evaluar() {
    pendienteEval = false;
    var quiere = !COB.reducir && !!mq && mq.matches && stickyPosible();
    if (quiere && !fijoOn) encender();
    else if (!quiere && fijoOn) apagar();
    // Si el contenido no cabe en el bloque fijo (pantalla baja o texto largo), mejor la lista normal
    if (fijoOn && grid.offsetHeight > fijo.clientHeight) apagar();
    medir();
    if (fijoOn) pintar();
  }
  function pedirEval() { if (!pendienteEval) { pendienteEval = true; requestAnimationFrame(evaluar); } }

  // Solo se trabaja al bajar mientras la pista está en pantalla
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      visible = es[es.length - 1].isIntersecting;
      if (visible) { pedir(); if (fijoOn && activo === 0 && !parar) teclear(); }
      else cortarTecleo();
    }, { threshold: 0 }).observe(pista);
  } else visible = true;

  addEventListener('scroll', function () { if (fijoOn && visible) pedir(); }, { passive: true });
  addEventListener('resize', pedirEval, { passive: true });
  if (mq) { if (mq.addEventListener) mq.addEventListener('change', pedirEval); else if (mq.addListener) mq.addListener(pedirEval); }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) cortarTecleo();
    else if (fijoOn && visible) { pedir(); if (activo === 0) teclear(); }
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(pedirEval, function () {});

  COB.alCambiar(function (id) { txt = textos(id); aplicar(); pedirEval(); });
  if (COB.tasa) COB.tasa(function (t) {
    if (!t || !t.live || !t.rate || !COB.bs) return;
    tasaTxt = COB.bs(t.rate) + ' por USD';
    [].forEach.call(sec.querySelectorAll('[data-tiempo-tasa]'), function (el) { el.textContent = tasaTxt; });
  });

  aplicar();
  evaluar();
})();
