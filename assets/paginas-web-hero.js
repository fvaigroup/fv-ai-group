/* /triangular/paginas-web — hero: en un navegador de vidrio se «arma» sola la página de un negocio ficticio
   (esqueleto → colores y letras → fotos → precios en $ y Bs → botón de WhatsApp → versión celular → ficha en Google),
   en bucle con tres negocios de ejemplo. Usa window.WEB (assets/paginas-web.js).
   Nombres, direcciones, productos y montos son FICTICIOS y solo los escribe este JS (debajo va «Ejemplo ilustrativo.»).
   Los bolívares salen de WEB.tasa() solo si la tasa BCV llegó en vivo; si no, solo $.
   Sin JS: la página de ejemplo terminada («Tu negocio», sin cifras). Con reduced-motion: el primer negocio completo, quieto.
   Fuera de pantalla o con la pestaña oculta se detiene el bucle y queda la página terminada (sin animaciones infinitas). */
(function () {
  'use strict';
  var WEB = window.WEB;
  if (!WEB) return;
  var escena = WEB.montar('hero');
  if (!escena) return;
  var capa = escena.querySelector('.web-escena-capa') || escena;

  var WA_SVG = '<svg viewBox="0 0 24 24" focusable="false"><path fill="currentColor" d="M17.6 6.32A7.85 7.85 0 0012.05 4a7.94 7.94 0 00-6.9 11.9L4 20l4.2-1.1a7.9 7.9 0 003.85 1h.01a7.94 7.94 0 007.94-7.94 7.87 7.87 0 00-2.4-5.64zm-5.55 12.2h-.01a6.6 6.6 0 01-3.36-.92l-.24-.14-2.5.65.66-2.43-.16-.25a6.6 6.6 0 01-1.02-3.52 6.62 6.62 0 016.63-6.62 6.58 6.58 0 014.68 1.95 6.58 6.58 0 011.94 4.68 6.62 6.62 0 01-6.62 6.6zm3.63-4.95c-.2-.1-1.17-.58-1.35-.64-.18-.07-.31-.1-.45.1-.13.2-.51.64-.62.77-.11.13-.23.14-.42.05-.2-.1-.83-.31-1.58-.98-.58-.52-.98-1.16-1.09-1.36-.11-.2-.01-.3.09-.4.09-.09.2-.23.3-.35.1-.11.13-.2.2-.32.06-.13.03-.24-.02-.34-.05-.1-.45-1.08-.61-1.48-.16-.39-.33-.33-.45-.34-.12 0-.25-.01-.38-.01-.13 0-.35.05-.53.24-.18.2-.7.68-.7 1.66s.72 1.93.82 2.06c.1.13 1.4 2.15 3.41 3.01.48.2.85.33 1.14.42.48.15.91.13 1.26.08.38-.06 1.17-.48 1.34-.94.16-.46.16-.86.11-.94-.05-.09-.18-.14-.38-.24z"/></svg>';

  // Respaldo: si el HTML no trae ya la escena armable (partes/hero.html), se crea aquí con el mismo marcado.
  var creada = false;
  if (!capa.querySelector('[data-web-hero-arma]')) {
    creada = true;
    var prod = '<div class="web-hero-prod"><i class="web-hero-foto"></i><b data-hero-prod>Producto</b><em class="web-hero-usd" data-hero-usd>$ · Bs</em><small class="web-hero-bs" data-hero-bs></small></div>';
    var celProd = '<div class="web-hero-cel-prod"><i class="web-hero-foto"></i><span><b data-hero-prod>Producto</b><em class="web-hero-usd" data-hero-usd>$ · Bs</em><small class="web-hero-bs" data-hero-bs></small></span></div>';
    capa.innerHTML =
      '<div class="web-hero-arma" data-web-hero-arma data-hero-fase="7" aria-hidden="true">' +
        '<p class="web-hero-estado web-vidrio"><span class="web-hero-estado-t">▲ <span data-hero-paso>Página lista</span></span><span class="web-hero-barras"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span></p>' +
        '<div class="web-hero-marco">' +
          '<div class="web-nav web-vidrio web-hero-nav">' +
            '<div class="web-nav-barra"><span class="web-nav-puntos"><i></i><i></i><i></i></span><span class="web-nav-url"><svg viewBox="0 0 24 24" focusable="false"><path fill="currentColor" d="M17 10V8A5 5 0 0 0 7 8v2H5v12h14V10zm-8 0V8a3 3 0 0 1 6 0v2z"/></svg><span class="web-hero-url" data-hero-url>tunegocio.com</span></span></div>' +
            '<div class="web-hero-pag">' +
              '<div class="web-hero-cab"><span class="web-hero-logo" data-hero-ini>T</span><span class="web-hero-marca" data-hero-nombre>Tu negocio</span><span class="web-hero-menu"><i></i><i></i><i></i></span></div>' +
              '<div class="web-hero-banner web-hero-foto"><p class="web-hero-tit" data-hero-nombre>Tu negocio</p><p class="web-hero-lema" data-hero-lema>Lo que vendes, bien presentado</p><span class="web-hero-cta">Ver catálogo</span></div>' +
              '<div class="web-hero-prods">' + prod + prod + '</div>' +
              '<div class="web-hero-pie"><i></i><i></i></div>' +
              '<span class="web-hero-wa">' + WA_SVG + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="web-hero-cel-capa" data-paralaje="0.08">' +
            '<div class="web-hero-cel">' +
              '<div class="web-hero-cel-pant">' +
                '<span class="web-hero-cel-isla"></span>' +
                '<div class="web-hero-cab"><span class="web-hero-logo" data-hero-ini>T</span><span class="web-hero-marca" data-hero-nombre>Tu negocio</span></div>' +
                '<div class="web-hero-banner web-hero-foto"><p class="web-hero-tit" data-hero-nombre>Tu negocio</p><span class="web-hero-cta">Ver catálogo</span></div>' +
                celProd + celProd +
                '<span class="web-hero-wa">' + WA_SVG + '</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="web-hero-g-capa" data-paralaje="-0.05">' +
          '<div class="web-nav-google web-vidrio web-hero-google"><span class="web-nav-g">G</span><span><b><span data-hero-nombre>Tu negocio</span> · <span data-hero-ciudad>Valencia</span></b><small data-hero-url>tunegocio.com</small></span></div>' +
        '</div>' +
      '</div>';
  }

  var arma = capa.querySelector('[data-web-hero-arma]');
  if (!arma) return;
  var reducir = WEB.reducir;
  function todos(s) { return [].slice.call(arma.querySelectorAll(s)); }
  function poner(lista, txt) { lista.forEach(function (el) { if (el.textContent !== txt) el.textContent = txt; }); }

  // Capas de paralaje propias: si la escena venía en el HTML ya las registró el núcleo; si la creó este JS, se registran aquí.
  if (creada && WEB.paralaje) todos('[data-paralaje]').forEach(function (el) { WEB.paralaje(el); });

  /* ---------- Negocios de ejemplo (ficticios) ---------- */
  var NEGOCIOS = [
    { nombre: 'Panadería La Espiga', ini: 'E', ciudad: 'Valencia', url: 'panaderialaespiga.com', lema: 'Pan recién horneado, todos los días',
      prods: [['Pan campesino', 3], ['Torta de chocolate', 18]], a: '#f472b6', b: '#a855f7', f: ['#f9a8d4', '#7c3aed'] },
    { nombre: 'Taller El Pistón', ini: 'P', ciudad: 'Maracay', url: 'tallerelpiston.com', lema: 'Mecánica de confianza, con cita',
      prods: [['Cambio de aceite', 25], ['Alineación', 20]], a: '#4ade80', b: '#a3e635', f: ['#86efac', '#166534'] },
    { nombre: 'Café Montaña', ini: 'M', ciudad: 'Mérida', url: 'cafemontana.com', lema: 'Café de altura, recién molido',
      prods: [['Café con leche', 2], ['Cachito de jamón', 1.5]], a: '#c4b5fd', b: '#4ade80', f: ['#ddd6fe', '#4c1d95'] }
  ];
  var PASOS = ['Estructura', 'Colores y letras', 'Fotos', 'Precios en $ y Bs', 'Botón de WhatsApp', 'Versión celular', 'Lista para Google'];
  var FASES = ['is-color', 'is-foto', 'is-precio', 'is-wa', 'is-cel', 'is-google'];

  var elPaso = todos('[data-hero-paso]');
  var elUrl = todos('[data-hero-url]');
  var urlBarra = arma.querySelector('.web-nav-barra [data-hero-url]');
  var titulo = arma.querySelector('.web-hero-nav .web-hero-tit');
  var tasaViva = null; // tasa BCV en vivo (o null)
  var n = 0;

  function pintarPrecios(neg) {
    var usd = todos('[data-hero-usd]'), bs = todos('[data-hero-bs]');
    usd.forEach(function (el, i) {
      var p = neg.prods[i % neg.prods.length][1];
      var t = WEB.num(p);
      if (el.textContent !== t) el.textContent = t;
    });
    bs.forEach(function (el, i) {
      var p = neg.prods[i % neg.prods.length][1];
      var t = tasaViva ? WEB.bs(p * tasaViva) : '';
      if (el.textContent !== t) el.textContent = t;
    });
    PASOS[3] = tasaViva ? 'Precios en $ y Bs' : 'Precios en $';
  }
  function pintarNegocio(neg) {
    poner(todos('[data-hero-nombre]'), neg.nombre);
    poner(todos('[data-hero-ini]'), neg.ini);
    poner(todos('[data-hero-ciudad]'), neg.ciudad);
    poner(todos('[data-hero-lema]'), neg.lema);
    poner(elUrl, neg.url);
    todos('[data-hero-prod]').forEach(function (el, i) { var t = neg.prods[i % neg.prods.length][0]; if (el.textContent !== t) el.textContent = t; });
    arma.style.setProperty('--hero-a', neg.a);
    arma.style.setProperty('--hero-b', neg.b);
    arma.style.setProperty('--hero-f1', neg.f[0]);
    arma.style.setProperty('--hero-f2', neg.f[1]);
    pintarPrecios(neg);
  }
  function paso(i) {
    poner(elPaso, i < 0 ? 'Página lista' : PASOS[i]);
    arma.setAttribute('data-hero-fase', String(i < 0 ? PASOS.length : i + 1));
  }

  WEB.tasa(function (t) {
    tasaViva = t && t.live && t.rate > 0 ? t.rate : null;
    pintarPrecios(NEGOCIOS[n]);
    if (arma.getAttribute('data-hero-fase') === '4') poner(elPaso, PASOS[3]);
  });

  /* ---------- Estados ---------- */
  var cancelar = [];
  function pararTecleo() { cancelar.forEach(function (f) { f(); }); cancelar = []; }
  function completo() { // página terminada (reduced-motion, fuera de pantalla y antes de verse)
    pararTecleo();
    pintarNegocio(NEGOCIOS[n]);
    arma.classList.remove('is-arma', 'is-sale', 'is-vivo');
    FASES.forEach(function (c) { arma.classList.add(c); });
    paso(-1);
  }
  function reiniciar() {
    pararTecleo();
    pintarNegocio(NEGOCIOS[n]);
    // El salto a «esqueleto» va sin transición (si no, los textos se ven desvanecer encima de las barras grises).
    arma.classList.add('is-salto');
    FASES.forEach(function (c) { arma.classList.remove(c); });
    arma.classList.remove('is-sale');
    arma.classList.add('is-arma');
    void arma.offsetWidth;
    arma.classList.remove('is-salto');
    paso(0);
    if (urlBarra) cancelar.push(WEB.teclear(urlBarra, NEGOCIOS[n].url, 38));
  }
  function fase(k) {
    return function () {
      arma.classList.add(FASES[k]);
      paso(k + 1);
      if (k === 0 && titulo) cancelar.push(WEB.teclear(titulo, NEGOCIOS[n].nombre, 34));
    };
  }

  // La escena terminada se pinta ya (con el primer negocio) para que no salte cuando empiece el bucle.
  completo();
  if (reducir) return;

  /* ---------- Bucle ---------- */
  var PLAN = [
    [0, reiniciar],
    [1300, fase(0)],   // colores y letras
    [2700, fase(1)],   // fotos
    [3900, fase(2)],   // precios
    [5000, fase(3)],   // WhatsApp
    [6200, fase(4)],   // celular
    [7500, fase(5)],   // Google
    [8300, function () { paso(-1); }],
    [11000, function () { arma.classList.add('is-sale'); }],
    [11600, function () { n = (n + 1) % NEGOCIOS.length; }]
  ];
  var visible = false, corriendo = false, timer = null, idx = 0;
  function siguiente(antes) {
    var it = PLAN[idx];
    timer = setTimeout(function () {
      timer = null;
      it[1]();
      idx++;
      if (idx >= PLAN.length) { idx = 0; siguiente(0); }
      else siguiente(it[0]);
    }, Math.max(0, it[0] - antes));
  }
  function arrancar() {
    if (corriendo || !visible || document.hidden) return;
    corriendo = true;
    arma.classList.add('is-vivo');
    idx = 0;
    siguiente(0);
  }
  function parar() {
    if (timer) clearTimeout(timer);
    timer = null;
    if (!corriendo) return;
    corriendo = false;
    completo();
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible) arrancar(); else parar();
    }, { threshold: 0.2 }).observe(arma);
  } else WEB.alVer(arma, function () { visible = true; arrancar(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) parar(); else arrancar(); });
})();
