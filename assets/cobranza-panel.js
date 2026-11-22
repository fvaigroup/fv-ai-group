/* /triangular/cobranza — cifras de «Lo esencial» (cuentan al verse) y #panel (el tablero de ejemplo se arma al verse
   y cambia según el sector). Sin JS el HTML ya muestra los valores finales; con reduced-motion no anima nada. */
(function () {
  'use strict';
  var COB = window.COB;
  if (!COB) return;
  var reducir = !!COB.reducir;
  var hayIO = 'IntersectionObserver' in window;
  var raf = window.requestAnimationFrame ? function (f) { return window.requestAnimationFrame(f); } : function (f) { return setTimeout(function () { f(Date.now()); }, 16); };
  function suave(t) { return 1 - Math.pow(1 - t, 3); }
  function siempre() { return true; }
  function entero(v) { return String(Math.round(v)); }
  function pct(v) { return Math.round(v) + ' %'; }
  function monto(v) { return COB.num(Math.round(v), 0); }

  // Cuenta de "desde" a "hasta" en ms (tras "retraso"), escribiendo solo cuando cambia el texto
  function contar(el, desde, hasta, ms, retraso, fmt, vivo, listo) {
    if (!el) return;
    var t0 = null, ultimo = fmt(desde);
    el.textContent = ultimo;
    function paso(t) {
      if (!vivo()) return;
      if (t0 === null) t0 = t + retraso;
      var p = (t - t0) / ms;
      if (p < 0) { raf(paso); return; }
      if (p > 1) p = 1;
      var s = fmt(desde + (hasta - desde) * suave(p));
      if (s !== ultimo) { el.textContent = s; ultimo = s; }
      if (p < 1) raf(paso);
      else if (listo) listo();
    }
    raf(paso);
  }

  /* ------------------------------------------------------------ Lo esencial: 2 monedas, 6 métodos, 2 canales, 0 descargas (9 → 0) */
  [].forEach.call((COB.raiz || document).querySelectorAll('[data-panel-cuenta]'), function (n) {
    var hasta = parseFloat(n.getAttribute('data-panel-cuenta'));
    var desde = parseFloat(n.getAttribute('data-panel-desde')) || 0;
    if (isNaN(hasta) || reducir || !hayIO) return;
    n.textContent = entero(desde);
    var tarjeta = (n.closest && n.closest('li')) || n;
    COB.alVer(tarjeta, function () {
      contar(n, desde, hasta, Math.abs(hasta - desde) > 3 ? 1300 : 900, 250, entero, siempre, function () { n.classList.add('cob-panel-salta'); });
    }, 0.5);
  });

  /* ------------------------------------------------------------ #panel: tablero de ejemplo */
  var sec = document.getElementById('panel');
  var tab = sec && sec.querySelector('[data-panel-tablero]');
  if (!tab) return;
  function q(s) { return tab.querySelector(s); }
  var el = {
    etqAlDia: q('[data-panel-etq-aldia]'), cobrado: q('[data-panel-cobrado]'), alDia: q('[data-panel-aldia]'), prog: q('[data-panel-prog]'),
    aprobar: q('[data-panel-aprobar]'), mora: q('[data-panel-mora]'), baja: q('[data-panel-baja]'), moraIni: q('[data-panel-mora-ini]'),
    linea: q('[data-panel-linea]'), area: q('[data-panel-area]'), mov: q('[data-panel-mov]'),
    resumen: sec.querySelector('[data-panel-resumen]'),
    barras: [].slice.call(tab.querySelectorAll('[data-panel-barra]')),
    meses: [].slice.call(tab.querySelectorAll('[data-panel-mes]'))
  };

  // Datos ficticios por sector (al día = 100 − morosidad del último mes)
  var DATOS = {
    negocio: { etq: 'Clientes al día', c: 12480, ap: 7, mora: [31, 26, 21, 17, 12, 9], barras: [6100, 7400, 8200, 9600, 11000, 12480], extra: 'Reporte de morosidad exportado a PDF' },
    gimnasio: { etq: 'Miembros al día', c: 8650, ap: 12, mora: [27, 24, 20, 17, 14, 12], barras: [5200, 5900, 6400, 7300, 7900, 8650], extra: 'Clase reservada desde el teléfono · quedan 3 cupos' },
    condominio: { etq: 'Unidades al día', c: 21300, ap: 9, mora: [38, 33, 29, 24, 19, 16], barras: [14200, 15600, 16900, 18400, 19800, 21300], extra: 'Gasto del edificio publicado con su factura' },
    club: { etq: 'Socios al día', c: 34750, ap: 15, mora: [33, 28, 22, 17, 13, 10], barras: [22400, 25100, 27800, 30200, 32600, 34750], extra: 'La junta revisó los indicadores · solo lectura' },
    colegio: { etq: 'Representantes al día', c: 18900, ap: 11, mora: [29, 23, 18, 14, 10, 7], barras: [11800, 13200, 14900, 16300, 17600, 18900], extra: 'Mensualidad de 2 alumnos pagada en una sola cuenta' }
  };
  function info() { return DATOS[COB.sector()] || DATOS.negocio; }
  function ultimo(a) { return a[a.length - 1]; }

  // Últimos seis meses hasta el actual
  var MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  var mesHoy = new Date().getMonth();
  el.meses.forEach(function (m, i) { m.textContent = MESES[(mesHoy - (el.meses.length - 1 - i) + 12) % 12]; });

  function eventos(d, x) {
    return [
      'Pago Móvil reportado · comprobante adjunto',
      'Pago aprobado con un clic · recibo enviado por WhatsApp',
      'Recordatorio enviado por WhatsApp y correo a 14 ' + d.personas,
      'Pago en línea recibido · registrado con la tasa BCV del día',
      x.extra
    ];
  }

  // Escribe el estado final del sector (textos, alturas, línea); no anima
  function pintar(x, d) {
    var moraFin = ultimo(x.mora), alDia = 100 - moraFin, max = Math.max.apply(null, x.barras);
    if (el.etqAlDia) el.etqAlDia.textContent = x.etq;
    if (el.cobrado) el.cobrado.textContent = monto(x.c);
    if (el.alDia) el.alDia.textContent = pct(alDia);
    if (el.prog) el.prog.style.setProperty('--p', (alDia / 100).toFixed(2));
    if (el.aprobar) el.aprobar.textContent = entero(x.ap);
    if (el.mora) el.mora.textContent = pct(moraFin);
    if (el.baja) el.baja.textContent = '−' + (x.mora[0] - moraFin) + ' puntos';
    if (el.moraIni) el.moraIni.textContent = 'Hace 6 meses: ' + pct(x.mora[0]);
    el.barras.forEach(function (b, i) { if (x.barras[i] != null) b.style.setProperty('--h', Math.round(x.barras[i] / max * 100) + '%'); });
    var pts = x.mora.map(function (v, i) { return (4 + i * 22.4).toFixed(1) + ' ' + (4 + (1 - v / 40) * 32).toFixed(1); });
    var ruta = 'M' + pts.join('L');
    if (el.linea) el.linea.setAttribute('d', ruta);
    if (el.area) el.area.setAttribute('d', ruta + 'L116 40L4 40Z');
    if (el.resumen) el.resumen.textContent = 'Ejemplo de panel con datos ficticios: cobrado del mes, ' + monto(x.c) + ' dólares; ' + x.etq.toLowerCase() + ', ' + pct(alDia) + '; pagos por aprobar, ' + x.ap + '; morosidad, ' + pct(moraFin) + ', desde ' + pct(x.mora[0]) + ' hace seis meses.';
    if (el.mov && (reducir || !visto)) el.mov.textContent = eventos(d, x)[0];
  }

  var visto = false, enPantalla = !hayIO, pendiente = false, gen = 0;

  // Vuelve al estado «antes de armarse» sin que se vea el retroceso
  function ocultar() {
    tab.classList.add('cob-panel-sin');
    tab.classList.remove('is-in');
    void tab.offsetWidth;
    tab.classList.remove('cob-panel-sin');
  }

  function construir() {
    var x = info(), d = COB.datos() || COB.S.negocio;
    pintar(x, d);
    gen++;
    if (reducir || !hayIO) { tab.classList.add('is-in'); return; }
    var mio = gen;
    var vivo = function () { return mio === gen; };
    ocultar();
    void tab.offsetWidth;
    tab.classList.add('is-in');
    contar(el.cobrado, 0, x.c, 1500, 250, monto, vivo);
    contar(el.alDia, 0, 100 - ultimo(x.mora), 1400, 350, pct, vivo);
    contar(el.aprobar, 0, x.ap, 1000, 450, entero, vivo);
    contar(el.mora, x.mora[0], ultimo(x.mora), 1700, 800, pct, vivo);
  }

  /* Línea de movimientos que se teclea sola; se detiene fuera de pantalla o con la pestaña oculta */
  var mov = { i: 0, cancelar: null, espera: null };
  function activo() { return visto && enPantalla && !document.hidden && !reducir && !!el.mov; }
  function movPausar() {
    if (mov.espera) { clearTimeout(mov.espera); mov.espera = null; }
    if (mov.cancelar) { mov.cancelar(); mov.cancelar = null; }
  }
  function movSiguiente() {
    mov.espera = null;
    if (!activo()) return;
    var lista = eventos(COB.datos() || COB.S.negocio, info());
    var texto = lista[mov.i % lista.length];
    mov.i++;
    mov.cancelar = COB.teclear(el.mov, texto, 24, function () {
      mov.cancelar = null;
      if (activo()) mov.espera = setTimeout(movSiguiente, 2800);
    });
  }
  function movReanudar() { if (!mov.cancelar && !mov.espera && activo()) movSiguiente(); }

  // Estado inicial: el HTML trae los valores del sector general; se sincroniza con el sector elegido
  pintar(info(), COB.datos() || COB.S.negocio);
  if (!reducir && hayIO) {
    tab.classList.add('cob-panel-anim');
    COB.alVer(tab, function () { visto = true; enPantalla = true; construir(); movReanudar(); }, 0.2);
    var io = new IntersectionObserver(function (es) {
      var e = es[es.length - 1];
      enPantalla = e.isIntersecting;
      if (enPantalla) tab.classList.remove('cob-panel-pausa'); else tab.classList.add('cob-panel-pausa');
      if (!visto) return;
      if (enPantalla) {
        if (pendiente) { pendiente = false; construir(); }
        movReanudar();
      } else movPausar();
    }, { threshold: 0 });
    io.observe(tab);
    document.addEventListener('visibilitychange', function () { if (document.hidden) movPausar(); else movReanudar(); });
  }

  COB.alCambiar(function () {
    if (reducir || !hayIO) { pintar(info(), COB.datos() || COB.S.negocio); return; }
    if (!visto) { pintar(info(), COB.datos() || COB.S.negocio); return; }
    movPausar();
    mov.i = 0;
    if (enPantalla) { construir(); movReanudar(); }
    else { gen++; pintar(info(), COB.datos() || COB.S.negocio); ocultar(); pendiente = true; if (el.mov) el.mov.textContent = ''; }
  });
})();
