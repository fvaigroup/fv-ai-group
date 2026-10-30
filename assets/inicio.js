/* Inicio (index.html): figuras de las dos líneas, diagnóstico de 60 segundos y entrada del bloque «Del caos al tablero».
   Mejora progresiva: sin este archivo el inicio se lee completo (las listas de cada línea traen todo el texto y el enlace a WhatsApp).
   No guarda nada en el navegador ni en un servidor. Los textos de los lados salen de las listas del HTML (#lineas): se editan allí. */
(function () {
  'use strict';
  var raiz = document.documentElement;
  raiz.classList.add('ini-js');
  var WA = 'https://wa.me/584244125386?text=';
  var reducido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function evento(nombre, datos) {
    if (typeof window.gtag === 'function') window.gtag('event', nombre, datos || {});
  }

  /* ------------------------------------------------------------ las dos líneas */
  function figura(art) {
    var lados = [].slice.call(art.querySelectorAll('.ini-lado-svg'));
    var items = [].slice.call(art.querySelectorAll('.ini-lado'));
    var botones = items.map(function (li) { return li.querySelector('.ini-lado-btn'); });
    var tarjeta = art.querySelector('[data-tarjeta]');
    var aviso = art.querySelector('[data-aviso]');
    var actual = -1;

    function elegir(i, desdeTeclado) {
      if (i === actual && !desdeTeclado) { return; }
      actual = i;
      lados.forEach(function (g, k) { var on = k === i; g.classList.toggle('is-activo', on); g.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      botones.forEach(function (b, k) { b.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
      var li = items[i];
      tarjeta.textContent = '';
      var linea = document.createElement('p'); linea.className = 'ini-tarj-linea';
      linea.textContent = art.getAttribute('data-nombre-linea') + ' · ' + art.getAttribute('data-para');
      var nombre = document.createElement('h4'); nombre.className = 'ini-tarj-nombre';
      nombre.textContent = botones[i].textContent.replace(/^\d+/, '').trim();
      var frase = li.querySelector('.ini-lado-frase').cloneNode(true);
      var wa = li.querySelector('.ini-wa').cloneNode(true);
      tarjeta.appendChild(linea); tarjeta.appendChild(nombre); tarjeta.appendChild(frase); tarjeta.appendChild(wa);
      tarjeta.hidden = false;
      if (aviso) aviso.hidden = true;
      evento('inicio_lado_ver', { linea: art.getAttribute('data-linea'), lado: li.querySelector('.ini-wa').getAttribute('data-product') });
    }

    lados.forEach(function (g, i) {
      g.addEventListener('click', function () { elegir(i); });
      g.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); elegir(i, true); }
      });
      g.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') elegir(i); });
    });
    botones.forEach(function (b, i) { b.addEventListener('click', function () { elegir(i, true); }); });
  }
  [].slice.call(document.querySelectorAll('.ini-fig')).forEach(figura);

  /* ------------------------------------------------------------ diagnóstico de 60 segundos */
  var caja = document.querySelector('[data-quiz]');
  if (caja) {
    var ui = caja.querySelector('[data-quiz-ui]');
    var sinJs = caja.querySelector('[data-quiz-sinjs]');
    var PREGUNTAS = [
      { q: '¿Cuántas personas trabajan con usted?', o: [
        { t: 'Solo yo o hasta 5', linea: 'tri' }, { t: 'De 6 a 20', linea: 'tri' },
        { t: 'Más de 20 o varias sedes', linea: 'hex' }, { t: 'Tenemos junta directiva', linea: 'hex' }] },
      { q: '¿Qué le quita más tiempo o plata?', o: [
        { t: 'No sé cuánto gano de verdad' }, { t: 'Cobrar y conciliar pagos' },
        { t: 'Reportes que llegan tarde' }, { t: 'Atender clientes por WhatsApp' }] },
      { q: '¿Qué quiere ver primero?', o: [
        { t: 'Mis números claros' }, { t: 'Ahorrar horas de trabajo' }, { t: 'Vender más' }] },
    ];
    var RECOMIENDA = { hex: { linea: 'Hexagonal', empezar: 'Diagnóstico financiero', clase: 'linea-hex' }, tri: { linea: 'Triangular', empezar: 'Taller de 3 horas', clase: 'linea-tri' } };
    var paso = 0, resp = [], empezo = false;

    function limpiar() { while (ui.firstChild) ui.removeChild(ui.firstChild); }
    function el(tag, clase, texto) { var n = document.createElement(tag); if (clase) n.className = clase; if (texto) n.textContent = texto; return n; }

    function pintarPregunta() {
      var p = PREGUNTAS[paso];
      limpiar();
      var texto = el('p', 'ini-prog-txt', 'Pregunta ' + (paso + 1) + ' de ' + PREGUNTAS.length);
      var barra = el('div', 'ini-prog'); barra.setAttribute('role', 'progressbar');
      barra.setAttribute('aria-label', 'Progreso del diagnóstico'); barra.setAttribute('aria-valuemin', '0'); barra.setAttribute('aria-valuemax', String(PREGUNTAS.length)); barra.setAttribute('aria-valuenow', String(paso));
      var relleno = el('i'); relleno.style.width = Math.round(paso / PREGUNTAS.length * 100) + '%'; barra.appendChild(relleno);
      var titulo = el('h3', 'ini-pregunta', p.q); titulo.tabIndex = -1; titulo.id = 'quiz-pregunta';
      var lista = el('div', 'ini-opciones'); lista.setAttribute('role', 'group'); lista.setAttribute('aria-labelledby', 'quiz-pregunta');
      p.o.forEach(function (op) {
        var b = el('button', 'ini-opcion', op.t); b.type = 'button';
        b.addEventListener('click', function () { responder(op); });
        lista.appendChild(b);
      });
      ui.appendChild(texto); ui.appendChild(barra); ui.appendChild(titulo); ui.appendChild(lista);
      if (paso > 0 || empezo) titulo.focus({ preventScroll: true });
    }

    function responder(op) {
      if (!empezo) { empezo = true; evento('inicio_quiz_inicio'); }
      resp[paso] = op;
      paso++;
      if (paso < PREGUNTAS.length) pintarPregunta(); else resultado();
    }

    function resultado() {
      var k = resp[0].linea, r = RECOMIENDA[k];
      var msg = 'Hola F&V, hice el diagnóstico en la web. Línea: ' + r.linea + '. Equipo: ' + resp[0].t + '. Lo que más me cuesta: ' + resp[1].t + '. Quiero: ' + resp[2].t + '.';
      limpiar();
      var caja2 = el('div', 'ini-resultado ' + r.clase);
      var h = el('h3', null, 'Su línea: ' + r.linea); h.tabIndex = -1; h.id = 'quiz-resultado';
      var p = el('p', null, 'Le recomendamos empezar por: ' + r.empezar);
      var botones = el('div', 'ini-resultado-botones');
      var a = el('a', 'ini-wa btn-linea estado-interactivo', 'Hablar por WhatsApp');
      a.href = WA + encodeURIComponent(msg); a.target = '_blank'; a.rel = 'noopener';
      a.setAttribute('data-evento', 'inicio_quiz_whatsapp'); a.setAttribute('data-cta', 'inicio_quiz'); a.setAttribute('data-linea', k);
      a.addEventListener('click', function () { evento('inicio_quiz_whatsapp', { linea: k }); });
      var rep = el('button', 'ini-repetir', 'Repetir'); rep.type = 'button';
      rep.addEventListener('click', function () { paso = 0; resp = []; pintarPregunta(); });
      botones.appendChild(a); botones.appendChild(rep);
      caja2.appendChild(h); caja2.appendChild(p); caja2.appendChild(botones);
      ui.appendChild(caja2);
      h.focus({ preventScroll: true });
      evento('inicio_quiz_completo_' + k);
    }

    if (sinJs) sinJs.hidden = true;
    ui.hidden = false;
    pintarPregunta();
  }

  /* ------------------------------------------------------------ «Del caos al tablero»: entra al verse */
  var caos = document.querySelector('[data-caos]');
  if (caos) {
    if (reducido || !('IntersectionObserver' in window)) { caos.classList.add('is-in'); }
    else {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { caos.classList.add('is-in'); io.disconnect(); } }); }, { threshold: 0.25 });
      io.observe(caos);
    }
  }

  /* ------------------------------------------------------------ manifiesto: cada frase aparece suave al entrar en pantalla */
  var frases = [].slice.call(document.querySelectorAll('[data-frase]'));
  if (frases.length) {
    if (reducido || !('IntersectionObserver' in window)) { frases.forEach(function (f) { f.classList.add('is-in'); }); }
    else {
      var ioF = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); ioF.unobserve(e.target); } }); }, { threshold: 0.35 });
      frases.forEach(function (f) { ioF.observe(f); });
    }
  }
})();
