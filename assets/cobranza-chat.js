/* /triangular/cobranza — «Cómo funciona»: chat de WhatsApp de ejemplo.
   Al entrar en pantalla: escribiendo… → recordatorio con enlace de pago → el cliente escribe (el recordatorio queda leído)
   → «Listo, ya pagué» → escribiendo… → «Pago recibido» con el recibo adjunto → doble check azul.
   Se repite al cambiar de sector. Sin JS, sin IntersectionObserver o con reduced-motion se ve la conversación completa
   (solo cambian los textos). */
(function () {
  'use strict';
  var COB = window.COB;
  if (!COB) return;
  var ven = document.querySelector('[data-cob-chat]');
  if (!ven) return;

  var T = {
    negocio: { m1: 'Hola María 👋 Tu plan mensual vence el viernes.', enl: 'cobranza.app/p/8F2K', m3: '✔ Pago recibido. Aquí está tu recibo.' },
    gimnasio: { m1: 'Hola Ana 👋 Tu membresía mensual vence el viernes.', enl: 'cobranza.app/p/8F2K', m3: '✔ Pago recibido. Aquí está tu recibo. Tu QR de entrada sigue activo.' },
    condominio: { m1: 'Hola Carmen 👋 Ya está el recibo de condominio del Apto 4-B, explicado por alícuota.', enl: 'cobranza.app/p/4B7Q', m3: '✔ Pago recibido. Aquí está tu recibo.' },
    club: { m1: 'Hola Luis 👋 Tu cuota social de este mes vence el viernes.', enl: 'cobranza.app/p/C9M3', m3: '✔ Pago recibido. Aquí está tu recibo. Tu carnet QR sigue activo.' },
    colegio: { m1: 'Hola Rosa 👋 La mensualidad escolar de Sofía y Diego vence el viernes.', enl: 'cobranza.app/p/E5R1', m3: '✔ Pago recibido. Aquí está tu recibo; también te llegó por correo.' }
  };

  var f1 = ven.querySelector('[data-cob-chat-fila="1"]');
  var f2 = ven.querySelector('[data-cob-chat-fila="2"]');
  var f3 = ven.querySelector('[data-cob-chat-fila="3"]');
  var t1 = ven.querySelector('[data-cob-chat-t="m1"]');
  var tEnl = ven.querySelector('[data-cob-chat-t="enl"]');
  var t3 = ven.querySelector('[data-cob-chat-t="m3"]');
  var ck1 = ven.querySelector('[data-cob-chat-ck="1"]');
  var ck3 = ven.querySelector('[data-cob-chat-ck="3"]');
  var est = ven.querySelector('[data-cob-chat-estado]');
  var filas = [f1, f2, f3].filter(Boolean);
  var checks = [ck1, ck3].filter(function (c) { return c && c.classList; });

  function poner(el, s) { if (el && s != null && el.textContent !== s) el.textContent = s; }
  function textos(id) {
    var t = T[id] || T.negocio;
    poner(t1, t.m1); poner(tEnl, t.enl); poner(t3, t.m3);
  }
  function estado(s) { poner(est, s); }
  function leido(c) { if (c && c.classList) c.classList.add('cob-chat-leido'); }

  // Sin animación: conversación completa, solo cambian los textos
  if (COB.reducir || !('IntersectionObserver' in window)) {
    textos(COB.sector());
    COB.alCambiar(function (id) { textos(id); });
    return;
  }

  ven.classList.add('cob-chat-anim');

  function escribe(f) { if (!f) return; f.classList.remove('cob-chat-sale'); f.classList.add('cob-chat-escribe'); }
  function sale(f) { if (!f) return; f.classList.remove('cob-chat-escribe'); f.classList.add('cob-chat-sale'); }
  function reiniciar() {
    ven.classList.add('cob-chat-corte');
    filas.forEach(function (f) { f.classList.remove('cob-chat-sale'); f.classList.remove('cob-chat-escribe'); });
    checks.forEach(function (c) { c.classList.remove('cob-chat-leido'); });
    estado('en línea');
    void ven.offsetWidth; // aplica el estado sin transición antes de volver a animar
    ven.classList.remove('cob-chat-corte');
  }

  var PASOS = [
    [300, function () { textos(COB.sector()); escribe(f1); estado('escribiendo…'); }],
    [1400, function () { sale(f1); estado('en línea'); }],
    [900, function () { leido(ck1); }],
    [500, function () { escribe(f2); }],
    [1300, function () { sale(f2); }],
    [700, function () { escribe(f3); estado('escribiendo…'); }],
    [1500, function () { sale(f3); estado('en línea'); }],
    [1000, function () { leido(ck3); }]
  ];

  var visible = false, pendiente = true, jugando = false, i = 0, t = null;

  function pausar() { if (t) { clearTimeout(t); t = null; } }
  function correr() {
    if (t || !visible || document.hidden) return;
    if (i >= PASOS.length) { jugando = false; return; }
    t = setTimeout(function () {
      t = null;
      try { PASOS[i][1](); } catch (e) {}
      i++;
      correr();
    }, PASOS[i][0]);
  }
  function jugar() {
    pausar();
    reiniciar();
    pendiente = false; jugando = true; i = 0;
    correr();
  }
  function reanudar() {
    if (!visible || document.hidden) return;
    if (pendiente) jugar();
    else if (jugando) correr();
  }

  var io = new IntersectionObserver(function (es) {
    visible = es[es.length - 1].isIntersecting;
    if (visible) reanudar(); else pausar();
  }, { threshold: 0.35 });
  io.observe(ven);

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) pausar(); else reanudar();
  });

  COB.alCambiar(function (id) {
    if (visible && !document.hidden) { jugar(); return; }
    // Fuera de pantalla: deja el chat listo con los textos nuevos y lo repite al volver a verlo
    pausar();
    jugando = false;
    reiniciar();
    textos(id);
    pendiente = true;
  });
})();
