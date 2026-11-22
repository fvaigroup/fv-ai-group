/* /triangular/delta/logistica · #ruta: mapa de ejemplo Valencia → Barquisimeto que funciona sin señal.
   Un camión (la silueta de la flota elegida en #flota) recorre la ruta; en el tramo «Sin señal» los eventos
   (gasto con foto del recibo, «Entregué» con su foto) se apilan en «Guardado en el teléfono» y, al volver la
   señal, vuelan al «Panel de la oficina» marcados «Sincronizado», con la hora en que pasó cada cosa.
   La ubicación solo se guarda en cada paso (Salí / Entregué / Llegué): no es rastreo continuo.
   Sin JS: la maqueta queda [hidden] y se leen las columnas y las tres notas. Con reduced-motion: estado final, sin animar.
   Corre solo mientras se ve (IntersectionObserver + pestaña visible) y repite el viaje. Maqueta aria-hidden. */
(function () {
  'use strict';

  var SVGNS = 'http://www.w3.org/2000/svg';
  var ZONA = [0.27, 0.78]; // tramo sin señal (fracción del recorrido)
  var EV = [
    { id: 'sali', p: 0, t: '«Salí»', s: 'Valencia · ubicación guardada', h: '6:30 a. m.', ico: 'pin', cola: false, pin: 0 },
    { id: 'peaje', p: 0.36, t: 'Gasto: peaje', s: 'Con foto del recibo', h: '7:15 a. m.', ico: 'recibo', cola: true },
    { id: 'entregue', p: 0.55, t: '«Entregué»', s: 'Foto de la nota firmada · ubicación', h: '8:05 a. m.', ico: 'ok', cola: true, pin: 1 },
    { id: 'comida', p: 0.68, t: 'Gasto: comida', s: 'Con foto del recibo', h: '8:40 a. m.', ico: 'recibo', cola: true },
    { id: 'llegue', p: 1, t: '«Llegué»', s: 'Barquisimeto · ubicación guardada', h: '9:50 a. m.', ico: 'pin', cola: false, pin: 2 }
  ];
  // Movimiento: [inicio ms, fin ms, p inicial, p final]; entre tramos el camión se detiene (entrega)
  var MOV = [[900, 8200, 0, 0.55], [9800, 16000, 0.55, 1]];
  var FIN = 16000, ESPERA = 5000;

  var ICO = {
    pin: '<svg viewBox="0 0 24 24"><path d="M12 22s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12z"/><circle cx="12" cy="10" r="2.6"/></svg>',
    recibo: '<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/></svg>',
    ok: '<svg viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5"/></svg>',
    nube: '<svg viewBox="0 0 24 24"><path d="M7 18h10a4 4 0 0 0 .7-7.9A6 6 0 0 0 6.2 9 4.5 4.5 0 0 0 7 18z"/><path d="M3 3l18 18"/></svg>',
    nubeOk: '<svg viewBox="0 0 24 24"><path d="M7 18h10a4 4 0 0 0 .7-7.9A6 6 0 0 0 6.2 9 4.5 4.5 0 0 0 7 18z"/><path d="M9.5 13.5l2 2 3.5-4"/></svg>',
    senal: '<svg viewBox="0 0 24 24"><path d="M4 20v-3M9 20v-6M14 20v-9M19 20V5"/></svg>',
    sync: '<svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 0 1-14.3 4.9M4 12A8 8 0 0 1 18.3 7.1"/><path d="M18.5 3v4.3h-4.3M5.5 21v-4.3h4.3"/></svg>',
    ofi: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>'
  };

  var D = 'M520 232C470 238 452 196 404 192S318 232 270 206S214 128 168 122S100 140 76 104S54 70 36 70';

  var PLANTILLA =
    '<div class="log-ruta-cab">' +
      '<div class="log-ruta-quien"><span class="log-ruta-ico"><svg viewBox="0 0 120 48"><use data-r="silc" href="#log-sil-350"/></svg></span>' +
      '<div><b class="log-ruta-tit">Valencia → Barquisimeto</b><span class="log-ruta-sub" data-r="sub">Camión 350 · viaje de ejemplo</span></div></div>' +
      '<span class="log-ruta-senal" data-r="senal" data-estado="ok"><span class="log-ruta-senal-i" data-r="senal-i">' + ICO.senal + '</span><span data-r="senal-t">Con señal</span></span>' +
    '</div>' +
    '<div class="log-ruta-cuerpo">' +
      '<div class="log-ruta-mapa-env">' +
        '<div class="log-ruta-mapa" data-r="mapa">' +
          '<svg class="log-ruta-svg" viewBox="0 0 560 300" preserveAspectRatio="xMidYMid meet">' +
            '<defs>' +
                            '<linearGradient id="log-ruta-grad" gradientUnits="userSpaceOnUse" x1="520" y1="0" x2="40" y2="0"><stop offset="0" stop-color="#4ade80"/><stop offset=".55" stop-color="#c4b5fd"/><stop offset="1" stop-color="#a855f7"/></linearGradient>' +
            '</defs>' +
                        '<g class="log-ruta-relieve"><path d="M190 70c40-22 92-18 120 8s20 62-18 74-90 6-112-20-22-46 10-62z"/><path d="M214 84c28-14 64-10 82 8s10 40-16 46-58 2-72-14-14-30 6-40z"/><path d="M238 98c14-6 32-4 40 4s4 18-8 20-28 0-34-8-6-12 2-16z"/></g>' +
            '<g class="log-ruta-montes"><path d="M222 168l16-26 16 26z"/><path d="M246 168l12-19 12 19z"/><path d="M300 150l14-22 14 22z"/></g>' +
            '<path class="log-ruta-vial" d="M520 232L760 330M36 70L-220 20M404 192L450 560M168 122L130 -260M270 206L120 520"/>' +
            '<path class="log-ruta-zona" data-r="zona" d="' + D + '"/>' +
            '<path class="log-ruta-base" data-r="base" d="' + D + '"/>' +
            '<path class="log-ruta-centro" d="' + D + '"/>' +
            '<path class="log-ruta-hecho" data-r="hecho" d="' + D + '"/>' +
            '<g data-r="marcas"></g>' +
            '<g data-r="pines"></g>' +
            '<g class="log-ruta-camion" data-r="camion"><ellipse cx="0" cy="3" rx="26" ry="4" fill="rgba(0,0,0,.45)"/><use data-r="sil" href="#log-sil-350" x="-29" y="-20" width="58" height="23"/></g>' +
          '</svg>' +
          '<div data-r="etqs"></div>' +
        '</div>' +
        '<ul class="log-ruta-ley"><li><i class="log-ruta-ley-paso"></i>Ubicación guardada en cada paso (no es rastreo continuo)</li><li><i class="log-ruta-ley-zona"></i>Tramo sin señal</li></ul>' +
      '</div>' +
      '<div class="log-ruta-paneles">' +
        '<div class="log-ruta-panel log-ruta-tel" data-r="tel">' +
          '<div class="log-ruta-panel-cab"><span class="log-ruta-panel-i">' + ICO.nube + '</span><b>Guardado en el teléfono</b><span class="log-ruta-n" data-r="n">0</span></div>' +
          '<span class="log-tag log-ruta-tag">En desarrollo</span>' +
          '<ul class="log-ruta-lista log-ruta-cola" data-r="cola"></ul>' +
          '<p class="log-ruta-vacio" data-r="vacio"></p>' +
        '</div>' +
        '<div class="log-ruta-panel log-ruta-ofi" data-r="ofi">' +
          '<div class="log-ruta-panel-cab"><span class="log-ruta-panel-i">' + ICO.ofi + '</span><b>Panel de la oficina</b></div>' +
          '<ul class="log-ruta-lista log-ruta-ofi-lista" data-r="ofil"></ul>' +
        '</div>' +
      '</div>' +
    '</div>';

  function iniciar() {
    var L = window.LOG;
    if (!L) return;
    var sec = document.getElementById('ruta');
    var caja = sec && sec.querySelector('[data-log-ruta-maqueta]');
    if (!caja || caja.getAttribute('data-listo')) return;
    caja.setAttribute('data-listo', '1');
    caja.innerHTML = PLANTILLA;
    caja.hidden = false;

    function r(k) { return caja.querySelector('[data-r="' + k + '"]'); }
    var mapa = r('mapa'), hecho = r('hecho'), zona = r('zona'), base = r('base'), camion = r('camion');
    var cola = r('cola'), ofil = r('ofil'), nEl = r('n'), vacio = r('vacio'), tel = r('tel');
    var senal = r('senal'), senalI = r('senal-i'), senalT = r('senal-t');
    var VB = { w: 560, h: 300 };
    var largo = base.getTotalLength ? base.getTotalLength() : 0;
    if (!largo) { caja.hidden = true; return; }

    function punto(p) { return base.getPointAtLength(Math.max(0, Math.min(1, p)) * largo); }

    // Trazo recorrido y tramo sin señal
    hecho.style.strokeDasharray = largo + ' ' + largo;
    var za = ZONA[0] * largo, zb = ZONA[1] * largo;
    zona.style.strokeDasharray = '0 ' + za + ' ' + (zb - za) + ' ' + largo;

    // Etiquetas HTML sobre el mapa (en %, porque el mapa mantiene la proporción del viewBox)
    var etqs = r('etqs');
    function etiqueta(p, clase, html, dy) {
      var pt = punto(p), e = document.createElement('div');
      e.className = 'log-ruta-etq ' + clase;
      e.setAttribute('data-x', pt.x); e.setAttribute('data-y', pt.y + (dy || 0));
      e.innerHTML = html;
      etqs.appendChild(e);
      return e;
    }
    var zm = punto((ZONA[0] + ZONA[1]) / 2 - 0.06);
    var zEt = document.createElement('div');
    zEt.className = 'log-ruta-etq log-ruta-etq-zona';
    zEt.setAttribute('data-x', zm.x); zEt.setAttribute('data-y', zm.y - 62);
    zEt.innerHTML = '<span class="log-ruta-etq-zi">' + ICO.nube + '</span>Sin señal';
    etqs.appendChild(zEt);

    var PINES = [
      { p: 0, nom: 'Valencia', cl: 'log-ruta-etq-ini', dy: 16 },
      { p: 0.55, nom: 'Entrega', cl: 'log-ruta-etq-ent', dy: 24 },
      { p: 1, nom: 'Barquisimeto', cl: 'log-ruta-etq-fin', dy: -24 } // encima del punto: el camión llega por debajo
    ];
    var gp = r('pines');
    PINES.forEach(function (pn) {
      var pt = punto(pn.p), g = document.createElementNS(SVGNS, 'g');
      g.setAttribute('class', 'log-ruta-pin');
      g.setAttribute('transform', 'translate(' + pt.x.toFixed(1) + ' ' + pt.y.toFixed(1) + ')');
      g.innerHTML = '<circle class="log-ruta-pin-onda" r="9"/><circle class="log-ruta-pin-aro" r="9"/><circle class="log-ruta-pin-c" r="4.5"/>';
      gp.appendChild(g);
      pn.g = g;
      pn.et = etiqueta(pn.p, pn.cl, '<b>' + pn.nom + '</b><span class="log-ruta-etq-h"></span>', pn.dy);
      pn.h = pn.et.querySelector('.log-ruta-etq-h');
    });

    // El SVG encaja el viewBox («meet»): el mapa puede ser más alto que 560×300 (escritorio); las etiquetas siguen al encaje
    function colocar() {
      var W = mapa.clientWidth, H = mapa.clientHeight;
      if (!W || !H) return;
      var s = Math.min(W / VB.w, H / VB.h), ox = (W - VB.w * s) / 2, oy = (H - VB.h * s) / 2;
      var ls = etqs.children;
      for (var i = 0; i < ls.length; i++) {
        ls[i].style.left = (ox + Number(ls[i].getAttribute('data-x')) * s).toFixed(1) + 'px';
        ls[i].style.top = (oy + Number(ls[i].getAttribute('data-y')) * s).toFixed(1) + 'px';
      }
    }
    colocar();
    if ('ResizeObserver' in window) new ResizeObserver(colocar).observe(mapa);
    else window.addEventListener('resize', colocar);

    // Marcas de los eventos en el camino
    var gm = r('marcas');
    EV.forEach(function (ev) {
      if (ev.pin != null) return;
      var pt = punto(ev.p), c = document.createElementNS(SVGNS, 'circle');
      c.setAttribute('class', 'log-ruta-marca');
      c.setAttribute('cx', pt.x.toFixed(1)); c.setAttribute('cy', pt.y.toFixed(1)); c.setAttribute('r', '5');
      gm.appendChild(c);
      ev.marca = c;
    });

    // Flota elegida
    function ponerFlota(clave) {
      var d = L.datosFlota(clave) || L.datosFlota('350');
      if (!d) return;
      var href = '#' + d.sil;
      r('sil').setAttribute('href', href);
      r('silc').setAttribute('href', href);
      r('sub').textContent = d.nombre + ' · viaje de ejemplo';
    }
    ponerFlota(L.flota());
    L.alCambiar(function (clave) { ponerFlota(clave); });

    // ---------- estado ----------
    var EST = { ok: ['Con señal', ICO.senal], sin: ['Sin señal', ICO.nube], sync: ['Sincronizando…', ICO.sync], listo: ['Todo sincronizado', ICO.nubeOk] };
    var estado = '';
    function ponerSenal(e) {
      if (e === estado) return;
      estado = e;
      senal.setAttribute('data-estado', e);
      senalT.textContent = EST[e][0];
      senalI.innerHTML = EST[e][1];
      tel.classList.toggle('is-sin', e === 'sin');
      contarCola();
    }

    function fila(ev, donde) {
      var li = document.createElement('li');
      li.className = 'log-ruta-fila';
      li.setAttribute('data-ico', ev.ico);
      var insignia = donde === 'cola'
        ? '<span class="log-ruta-ins log-ruta-ins-tel">En el teléfono</span>'
        : (ev.cola ? '<span class="log-ruta-ins log-ruta-ins-ok">Sincronizado</span>' : '<span class="log-ruta-ins">Al instante</span>');
      li.innerHTML = '<span class="log-ruta-fila-i">' + ICO[ev.ico] + '</span>' +
        '<span class="log-ruta-fila-x"><b>' + ev.t + '</b><span>' + ev.s + '</span></span>' +
        '<span class="log-ruta-fila-d"><span class="log-ruta-fila-h">' + ev.h + '</span>' + insignia + '</span>';
      return li;
    }
    function contarCola() {
      var n = cola.children.length;
      nEl.textContent = String(n);
      vacio.textContent = estado === 'ok' ? 'Con señal, todo sube al instante.' : 'Nada pendiente: todo está en la oficina.';
      vacio.classList.toggle('is-on', n === 0 && estado !== 'sin');
    }
    function ping(pn, tipo) {
      pn.g.setAttribute('data-tipo', tipo);
      pn.g.classList.remove('is-ping');
      if (!L.reducir) { void pn.g.getBoundingClientRect(); pn.g.classList.add('is-ping'); }
    }
    function marcarPin(ev, tipo) {
      if (ev.pin == null) return;
      var pn = PINES[ev.pin];
      ping(pn, tipo);
      pn.h.textContent = ev.h;
      pn.et.setAttribute('data-tipo', tipo);
    }

    function registrar(ev, sinSenal) {
      if (sinSenal) {
        var li = fila(ev, 'cola');
        if (!L.reducir) li.classList.add('is-entra');
        cola.appendChild(li);
        ev.filaCola = li;
        if (ev.marca) ev.marca.setAttribute('data-tipo', 'tel');
        marcarPin(ev, 'tel');
        contarCola();
      } else {
        var lo = fila(ev, 'ofi');
        if (!L.reducir) lo.classList.add('is-entra');
        ofil.appendChild(lo);
        if (ev.marca) ev.marca.setAttribute('data-tipo', 'ok');
        marcarPin(ev, 'ok');
      }
    }

    function subir(ev) {
      var src = ev.filaCola;
      var nueva = fila(ev, 'ofi');
      if (ev.marca) ev.marca.setAttribute('data-tipo', 'ok');
      if (ev.pin != null) marcarPin(ev, 'ok');
      if (L.reducir || !src || !src.animate) {
        if (src && src.parentNode) src.parentNode.removeChild(src);
        ofil.appendChild(nueva);
        contarCola();
        return;
      }
      var cr = caja.getBoundingClientRect(), a = src.getBoundingClientRect();
      nueva.style.visibility = 'hidden';
      ofil.appendChild(nueva);
      var b = nueva.getBoundingClientRect();
      var vuelo = nueva.cloneNode(true);
      vuelo.className += ' log-ruta-vuelo';
      vuelo.style.visibility = '';
      vuelo.style.left = (a.left - cr.left) + 'px';
      vuelo.style.top = (a.top - cr.top) + 'px';
      vuelo.style.width = a.width + 'px';
      caja.appendChild(vuelo);
      src.parentNode.removeChild(src);
      contarCola();
      var dx = b.left - a.left, dy = b.top - a.top, sx = b.width / a.width;
      var an = vuelo.animate([
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: 'translate(' + (dx * 0.5) + 'px,' + (dy * 0.5 - 24) + 'px) scale(1.04)', opacity: 1, offset: 0.5 },
        { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',1)', opacity: 1 }
      ], { duration: 700, easing: 'cubic-bezier(.23,1,.32,1)' });
      vuelos.push(vuelo);
      var cerrar = function () {
        if (vuelo.parentNode) vuelo.parentNode.removeChild(vuelo);
        nueva.style.visibility = '';
        nueva.classList.add('is-llega');
      };
      an.onfinish = cerrar;
      an.oncancel = cerrar;
    }

    var vuelos = [];
    function limpiarVuelos() {
      vuelos.forEach(function (v) { if (v.parentNode) v.parentNode.removeChild(v); });
      vuelos = [];
    }

    // ---------- camión ----------
    function ponerCamion(p) {
      var l = p * largo, a = base.getPointAtLength(l), b = base.getPointAtLength(Math.min(largo, l + 3));
      if (l + 3 > largo) { var c = base.getPointAtLength(l - 3); b = { x: a.x + (a.x - c.x), y: a.y + (a.y - c.y) }; }
      var ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI - 180; // la silueta mira a la izquierda
      while (ang > 180) ang -= 360;
      while (ang < -180) ang += 360;
      ang = Math.max(-16, Math.min(16, ang));
      camion.setAttribute('transform', 'translate(' + a.x.toFixed(1) + ' ' + (a.y - 2).toFixed(1) + ') rotate(' + ang.toFixed(1) + ')');
      hecho.style.strokeDashoffset = String(largo * (1 - p));
    }
    function suave(t) { return 0.5 - Math.cos(Math.PI * t) / 2; }
    function pEn(t) {
      if (t <= MOV[0][0]) return 0;
      for (var i = 0; i < MOV.length; i++) {
        var m = MOV[i];
        if (t < m[0]) return m[2];
        if (t <= m[1]) return m[2] + (m[3] - m[2]) * suave((t - m[0]) / (m[1] - m[0]));
      }
      return 1;
    }

    // ---------- reloj ----------
    var t = 0, p = 0, hechos = {}, syncDesde = -1, subidos = 0, enCola = [];
    function reiniciar() {
      limpiarVuelos();
      cola.innerHTML = ''; ofil.innerHTML = '';
      t = 0; p = 0; hechos = {}; syncDesde = -1; subidos = 0; enCola = [];
      EV.forEach(function (ev) { ev.filaCola = null; if (ev.marca) ev.marca.removeAttribute('data-tipo'); });
      PINES.forEach(function (pn) { pn.g.removeAttribute('data-tipo'); pn.g.classList.remove('is-ping'); pn.h.textContent = ''; pn.et.removeAttribute('data-tipo'); });
      ponerSenal('ok');
      contarCola();
      ponerCamion(0);
    }

    function paso(dt) {
      t += dt;
      p = pEn(t);
      ponerCamion(p);
      var sin = p >= ZONA[0] && p < ZONA[1];
      if (sin) ponerSenal('sin');
      EV.forEach(function (ev) {
        if (hechos[ev.id]) return;
        var listo = ev.p === 0 ? t >= 500 : (ev.id === 'entregue' ? t >= MOV[0][1] + 500 : p >= ev.p);
        if (!listo) return;
        hechos[ev.id] = true;
        var guardar = ev.cola && syncDesde < 0;
        registrar(ev, guardar);
        if (guardar) enCola.push(ev);
      });
      if (p >= ZONA[1] && syncDesde < 0) { syncDesde = t; ponerSenal('sync'); }
      if (syncDesde >= 0) {
        while (subidos < enCola.length && t >= syncDesde + 450 + subidos * 650) { subir(enCola[subidos]); subidos++; }
        if (subidos >= enCola.length && t >= syncDesde + 450 + subidos * 650 + 200 && estado === 'sync') { ponerSenal('listo'); contarCola(); }
      }
      if (t >= FIN + ESPERA) {
        caja.classList.remove('is-reinicio');
        void caja.offsetWidth;
        caja.classList.add('is-reinicio');
        reiniciar();
      }
    }

    // ---------- reduced-motion: estado final ----------
    if (L.reducir) {
      reiniciar();
      EV.forEach(function (ev) { registrar(ev, false); });
      PINES.forEach(function (pn) { pn.g.classList.remove('is-ping'); });
      ponerSenal('listo');
      contarCola();
      ponerCamion(1);
      return;
    }

    reiniciar();
    var visible = false, rafId = 0, ultimo = 0;
    function cuadro(ahora) {
      rafId = 0;
      if (!visible || document.hidden) { ultimo = 0; return; }
      var dt = ultimo ? Math.min(100, ahora - ultimo) : 16;
      ultimo = ahora;
      paso(dt);
      rafId = requestAnimationFrame(cuadro);
    }
    function arrancar() { if (!rafId && visible && !document.hidden) { ultimo = 0; rafId = requestAnimationFrame(cuadro); } }
    function parar() { if (rafId) { cancelAnimationFrame(rafId); rafId = 0; } ultimo = 0; }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (ents) {
        visible = ents[ents.length - 1].isIntersecting;
        if (visible) arrancar(); else parar();
      }, { threshold: 0.2 }).observe(caja);
    } else { visible = true; arrancar(); }
    document.addEventListener('visibilitychange', function () { if (document.hidden) parar(); else arrancar(); });
  }

  if (window.LOG) iniciar();
  else document.addEventListener('DOMContentLoaded', iniciar);
})();
