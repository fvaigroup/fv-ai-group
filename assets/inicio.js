/* Inicio (index.html): figuras de las dos líneas, diagnóstico de 60 segundos y entrada del bloque «Del caos al tablero».
   Mejora progresiva: sin este archivo el inicio se lee completo (las listas de cada línea traen todo el texto y el enlace a WhatsApp).
   No guarda nada en el navegador ni en un servidor. Los textos de los lados salen de las listas del HTML (#lineas): se editan allí. */
(function () {
  'use strict';
  var raiz = document.documentElement;
  raiz.classList.add('ini-js');
  var WA = 'https://wa.me/584244125386?text=';
  var reducido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Linterna del cursor: solo con mouse, ancho >= 1024 px y sin prefers-reduced-motion. En celular y tablet ni siquiera se descarga. */
  if (!reducido && window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches && window.innerWidth >= 1024) {
    var lin = document.createElement('script'); lin.src = '/assets/linterna.js'; lin.defer = true; document.head.appendChild(lin);
  }

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

  /* ------------------------------------------------------------ manifiesto: ventana de PowerShell que se teclea sola
     Sin JS, o con prefers-reduced-motion, queda todo el texto a la vista. */
  var ps = document.querySelector('[data-ps]');
  if (ps && 'IntersectionObserver' in window && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) {
    var psLineas = [].slice.call(ps.querySelectorAll('.ps-l')).map(function (el) {
      var nodos = [], w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), n;
      while ((n = w.nextNode())) nodos.push({ n: n, t: n.nodeValue });
      return { el: el, nodos: nodos, cmd: el.classList.contains('ps-cmd') };
    });
    var psFin = ps.querySelector('.ps-fin'), psCur = ps.querySelector('.ps-cur');
    psLineas.forEach(function (l) { l.el.style.visibility = 'hidden'; l.nodos.forEach(function (x) { if (!x.n.parentNode.classList.contains('ps-p')) x.n.nodeValue = ''; }); });
    psFin.style.visibility = 'hidden';
    var psTeclea = function (i) {
      if (i >= psLineas.length) { psFin.style.visibility = 'visible'; return; }
      var l = psLineas[i], tipo = l.nodos.filter(function (x) { return !x.n.parentNode.classList.contains('ps-p'); });
      l.el.style.visibility = 'visible';
      l.el.appendChild(psCur);
      var total = tipo.reduce(function (a, x) { return a + x.t.length; }, 0), k = 0;
      var paso = function () {
        k = l.cmd ? k + 1 : total;
        var resto = k;
        tipo.forEach(function (x) { var c = Math.min(resto, x.t.length); x.n.nodeValue = x.t.slice(0, c); resto -= c; });
        if (k < total) setTimeout(paso, 22 + Math.random() * 34);
        else setTimeout(function () { psTeclea(i + 1); }, l.cmd ? 380 : 160);
      };
      setTimeout(paso, i === 0 ? 300 : 120);
    };
    var ioPs = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { ioPs.disconnect(); psFin.appendChild(psCur); psTeclea(0); }
    }, { threshold: 0.4 });
    ioPs.observe(ps);
  }

  /* ------------------------------------------------------------ manifiesto: luciérnaga 3D que gira 360° con el scroll
     El script (assets/fv-logo-3d/fv-logo-3d.js) solo se descarga cuando la sección está a ~600 px de entrar en pantalla.
     La luciérnaga aparece (fundido) al entrar; el giro lo calcula el componente según el avance por #manifiesto. */
  var logoGiro = document.querySelector('[data-giro-manifiesto]');
  if (logoGiro) {
    var giro = logoGiro.closest('.ini-manif-giro') || logoGiro;
    var secM = document.getElementById('manifiesto');
    var cargarGiro = function () {
      if (window.customElements && !customElements.get('fv-logo-3d') && !document.querySelector('script[data-fv-logo-3d]')) {
        var s3 = document.createElement('script'); s3.src = '/assets/fv-logo-3d/fv-logo-3d.js'; s3.defer = true; s3.setAttribute('data-fv-logo-3d', '');
        document.head.appendChild(s3);
      }
    };
    if (!('IntersectionObserver' in window)) { cargarGiro(); giro.classList.add('is-in'); }
    else {
      var ioCarga = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { cargarGiro(); ioCarga.disconnect(); } }, { rootMargin: '600px 0px' });
      ioCarga.observe(secM);
      var ioVer = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { giro.classList.add('is-in'); ioVer.disconnect(); } }, { threshold: 0.2 });
      ioVer.observe(logoGiro);
    }
  }

  /* ------------------------------------------------------------ Luci con personalidad: un aviso según la sección que se está viendo
     El globo «¿Dudas?» del primer pantallazo sigue siendo el de assets/luci.js (5 s después de cargar, se va a los 15 s).
     Aquí solo se añaden los avisos por sección. Reglas: cada mensaje sale una sola vez por visita (memoria en variables, no en el navegador),
     ~2 s después de llegar a la sección, dura ~6 s, máximo 3 en total, no roba el foco, se cierra con la X y, si se cierra, no vuelve. */
  var AVISOS = {
    lineas: { texto: '¿No sabe cuál es la suya? Le ayudo en 3 preguntas.', href: '#diagnostico', evento: 'luci_lineas' },
    diagnostico: { texto: 'Son 3 preguntas. Menos de un minuto.', evento: 'luci_diagnostico' },
    brecha: { texto: 'Pruebe con lo que cobró esta semana.', evento: 'luci_brecha' },
    faq: { texto: '¿Otra pregunta? Escríbame por WhatsApp.', href: WA + encodeURIComponent('Hola F&V, tengo una pregunta que no está en la web.'), externo: true, evento: 'luci_faq' }
    // El cierre no lleva mensaje.
  };
  var MAX_AVISOS = 3, ESPERA = 2000, DURACION = 6000;
  var widgetLuci = document.getElementById('luci-widget');
  if (widgetLuci && 'IntersectionObserver' in window) {
    var aviso = document.createElement('div');
    aviso.className = 'ini-aviso'; aviso.setAttribute('data-aviso-luci', '');
    var cuerpo = document.createElement('div'); cuerpo.className = 'ini-aviso-cuerpo';
    var vivo = document.createElement('span'); vivo.className = 'ini-aviso-texto'; vivo.setAttribute('aria-live', 'polite'); vivo.setAttribute('aria-atomic', 'true');
    cuerpo.appendChild(vivo);
    var equis = document.createElement('button'); equis.type = 'button'; equis.className = 'ini-aviso-x'; equis.setAttribute('aria-label', 'Cerrar aviso de Luci'); equis.textContent = '×'; equis.tabIndex = -1;
    aviso.appendChild(cuerpo); aviso.appendChild(equis);
    document.body.appendChild(aviso);

    var vistos = {}, enPantalla = {}, esperas = {}, mostrados = 0, apagado = false, pieVisible = false, tOculta = null, abierto = false;

    function ocultar() {
      clearTimeout(tOculta); abierto = false;
      aviso.classList.remove('is-visible'); vivo.textContent = ''; equis.tabIndex = -1;
      var a = cuerpo.querySelector('a, [data-evento]'); if (a) a.tabIndex = -1;
    }
    function puede() {
      var pastilla = document.getElementById('luci-pill');
      var panel = document.getElementById('luci-panel');
      return !apagado && !abierto && !pieVisible && mostrados < MAX_AVISOS
        && !(pastilla && pastilla.classList.contains('is-visible'))
        && !(panel && panel.classList.contains('is-open'))
        && !widgetLuci.classList.contains('avoid-footer');
    }
    function mostrar(id) {
      var m = AVISOS[id];
      vistos[id] = true; mostrados++; abierto = true;
      cuerpo.textContent = ''; vivo.textContent = '';
      var el;
      if (m.href) { el = document.createElement('a'); el.href = m.href; if (m.externo) { el.target = '_blank'; el.rel = 'noopener'; } }
      else { el = document.createElement('span'); }
      el.className = 'ini-aviso-link'; el.setAttribute('data-evento', m.evento); el.setAttribute('data-cta', 'luci_aviso');
      el.appendChild(vivo); cuerpo.appendChild(el);
      el.addEventListener('click', function () { ocultar(); });
      vivo.textContent = m.texto;
      equis.tabIndex = 0;
      aviso.classList.add('is-visible');
      clearTimeout(tOculta); tOculta = setTimeout(ocultar, DURACION);
      evento('inicio_luci_aviso', { seccion: id });
    }
    equis.addEventListener('click', function () { apagado = true; ocultar(); });

    var io2 = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var id = e.target.id;
        enPantalla[id] = e.isIntersecting;
        clearTimeout(esperas[id]);
        if (e.isIntersecting && !vistos[id]) {
          esperas[id] = setTimeout(function intentar() {
            if (!enPantalla[id] || vistos[id] || apagado || mostrados >= MAX_AVISOS) return;
            if (puede()) mostrar(id); else esperas[id] = setTimeout(intentar, 1000); // otro globo ocupa la pantalla: se reintenta mientras siga en la sección
          }, ESPERA);
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 }); // la sección cruza la franja central de la pantalla = el visitante la está viendo
    Object.keys(AVISOS).forEach(function (id) { var s = document.getElementById(id); if (s) io2.observe(s); });

    var pie = document.querySelector('footer');
    if (pie) new IntersectionObserver(function (es) { pieVisible = es[0].isIntersecting; if (pieVisible) ocultar(); }).observe(pie);
    window.addEventListener('pagehide', function () { clearTimeout(tOculta); });
  }

})();
