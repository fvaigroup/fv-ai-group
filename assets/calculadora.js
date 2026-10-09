/* Calculadora de precios en $ y Bs con la tasa del día (/calculadora).
   - Cálculo en el navegador: precio de venta = costo / (1 - margen). La comisión del método de pago se descuenta de la ganancia.
   - Tasas: BCV dólar (de assets/bcv.js), BCV euro (DolarApi) o una tasa manual (por ejemplo, la del USDT).
   - "Descargar mi tabla de precios en PDF": el PDF se arma aquí mismo, sin servidor ni librerías.
   - Captura de contactos: POST a /api/lead; si el servidor no tiene destino configurado, se abre WhatsApp. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  if (!$('calc-form')) return;
  var WA = 'https://wa.me/584244125386?text=';
  var fmt2 = new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var fmt1 = new Intl.NumberFormat('es-VE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  var rates = { usd: null, eur: null };
  var ultimo = null; // último cálculo válido

  function r2(n) { return Math.round(n * 100 + 1e-6) / 100; }
  function dinero(n, simbolo) { return simbolo + fmt2.format(r2(n)); }
  function fechaTxt(iso) {
    var d = new Date(iso);
    return isNaN(d) ? '' : d.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Caracas' });
  }
  function num(s) {
    s = String(s == null ? '' : s).trim().replace(/\s/g, '');
    if (!s) return NaN;
    if (s.indexOf(',') > -1 && s.indexOf('.') > -1) s = s.replace(/\./g, '').replace(',', '.');
    else if (s.indexOf(',') > -1) s = s.replace(',', '.');
    return /^\d*\.?\d+$/.test(s) ? parseFloat(s) : NaN;
  }
  function gt(name, params) { try { if (typeof gtag === 'function') gtag('event', name, params || {}); } catch (e) {} }

  /* ---------------- tasas ---------------- */
  if (window.FV_BCV) window.FV_BCV.onChange(function (st) { rates.usd = { rate: st.rate, fecha: st.fecha, live: st.live }; actualizar(); });
  (function euro() {
    var KEY = 'fv_bcv_eur';
    try { var c = JSON.parse(localStorage.getItem(KEY) || 'null'); if (c && c.rate > 0) { rates.eur = { rate: c.rate, fecha: c.fecha, live: false }; actualizar(); } } catch (e) {}
    var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    var t = ctrl ? setTimeout(function () { ctrl.abort(); }, 8000) : null;
    fetch('https://ve.dolarapi.com/v1/euros/oficial', { cache: 'no-store', signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (d) {
        if (!d || !(d.promedio > 0)) return;
        rates.eur = { rate: d.promedio, fecha: d.fechaActualizacion, live: true };
        try { localStorage.setItem(KEY, JSON.stringify({ rate: d.promedio, fecha: d.fechaActualizacion })); } catch (e) {}
        actualizar();
      })
      .catch(function () {})
      .then(function () { if (t) clearTimeout(t); });
  })();

  /* ---------------- lectura y validación ---------------- */
  function setErr(id, msg) {
    var e = $('e-' + id), i = $('c-' + id);
    if (e) { e.textContent = msg || ''; e.classList.toggle('hidden', !msg); }
    if (i) i.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  function leer(mostrarErrores) {
    var costo = num($('c-costo').value), margen = num($('c-margen').value);
    var comTxt = $('c-comision').value.trim(), com = comTxt === '' ? 0 : num(comTxt);
    var tipo = $('c-tasa').value, manual = num($('c-manual').value);
    var errs = {};
    if (!(costo > 0)) errs.costo = 'Escribe el costo de tu producto (mayor que 0).';
    if (!(margen >= 0 && margen <= 90)) errs.margen = 'El margen debe estar entre 0 y 90 %.';
    if (!(com >= 0 && com <= 30)) errs.comision = 'La comisión debe estar entre 0 y 30 %.';
    if (!errs.margen && !errs.comision && margen + com >= 100) errs.comision = 'Margen y comisión no pueden sumar 100 % o más.';
    if (tipo === 'manual' && !(manual > 0)) errs.manual = 'Escribe la tasa manual (bolívares por 1 ' + (tipo === 'bcv-eur' ? '€' : '$') + ').';
    if (mostrarErrores) ['costo', 'margen', 'comision', 'manual'].forEach(function (k) { setErr(k, errs[k]); });
    return { ok: Object.keys(errs).length === 0, errs: errs, costo: costo, margen: margen, com: com, tipo: tipo, manual: manual };
  }

  /* ---------------- cálculo ---------------- */
  function tasaDe(v) {
    if (v.tipo === 'manual') return v.manual > 0 ? { rate: v.manual, texto: 'Tasa manual: Bs ' + fmt2.format(v.manual) + ' por $1' } : null;
    var r = v.tipo === 'bcv-eur' ? rates.eur : rates.usd;
    if (!r || !(r.rate > 0)) return null;
    var nom = v.tipo === 'bcv-eur' ? 'BCV euro' : 'BCV dólar';
    return { rate: r.rate, texto: (r.live ? 'Tasa ' + nom + ': ' : 'Última tasa ' + nom + ' conocida: ') + 'Bs ' + fmt2.format(r.rate) + (r.fecha ? ' (' + fechaTxt(r.fecha) + ')' : '') };
  }
  function precio(costo, margenPct) { return costo / (1 - margenPct / 100); }
  function fila(costo, m, fee, rate) {
    var p = precio(costo, m), com = p * fee / 100, g = p - costo - com;
    return { margen: m, precio: p, precioBs: rate ? p * rate : null, ganancia: g, gananciaBs: rate ? g * rate : null, real: g / p * 100, comision: com };
  }
  function calcular(v) {
    var t = tasaDe(v), rate = t ? t.rate : null, sym = v.tipo === 'bcv-eur' ? '€' : '$';
    var f = fila(v.costo, v.margen, v.com, rate);
    f.sugerido = precio(v.costo, v.margen + v.com);
    f.sugeridoBs = rate ? f.sugerido * rate : null;
    return { f: f, t: t, sym: sym, rate: rate, v: v };
  }

  /* ---------------- pantalla ---------------- */
  function actualizar() {
    var manualWrap = $('c-manual-wrap');
    manualWrap.classList.toggle('hidden', $('c-tasa').value !== 'manual');
    var sym = $('c-tasa').value === 'bcv-eur' ? '€' : '$';
    document.querySelectorAll('[data-sym]').forEach(function (el) { el.textContent = sym; });
    var v = leer(false);
    var vacio = $('r-vacio'), box = $('r-box');
    if (!v.ok) { vacio.classList.remove('hidden'); box.classList.add('hidden'); ultimo = null; return; }
    var c = calcular(v); ultimo = c;
    vacio.classList.add('hidden'); box.classList.remove('hidden');
    var f = c.f, s = c.sym;
    $('r-precio').textContent = dinero(f.precio, s);
    $('r-precio-bs').textContent = c.rate ? dinero(f.precioBs, 'Bs ') : 'Bs —';
    $('r-ganancia').textContent = dinero(f.ganancia, s);
    $('r-ganancia-bs').textContent = c.rate ? dinero(f.gananciaBs, 'Bs ') : 'Bs —';
    $('r-margen-real').textContent = fmt1.format(f.real) + ' %';
    $('r-comision').textContent = v.com > 0 ? dinero(f.comision, s) + ' (' + fmt1.format(v.com) + ' %)' : 'Sin comisión';
    $('r-tasa').innerHTML = '';
    if (c.t) { $('r-tasa').textContent = c.t.texto; }
    else {
      var a = document.createElement('a');
      a.href = WA + encodeURIComponent('Hola F&V, ¿cuál es la tasa BCV de hoy?'); a.target = '_blank'; a.rel = 'noopener'; a.className = 'link-underline text-fv-cyan';
      a.textContent = 'Consulta la tasa del día por WhatsApp';
      $('r-tasa').appendChild(a);
      $('r-tasa').appendChild(document.createTextNode(' o elige "Tasa manual" para ver los montos en bolívares.'));
    }
    var aviso = $('r-aviso');
    if (v.com > 0 && f.real < v.margen - 0.05) {
      aviso.classList.remove('hidden');
      aviso.textContent = 'Ojo: con la comisión de ' + fmt1.format(v.com) + ' %, tu margen real baja de ' + fmt1.format(v.margen) + ' % a ' + fmt1.format(f.real) + ' %. Para ganar ' + fmt1.format(v.margen) + ' % limpio, cobra ' + dinero(f.sugerido, s) + (c.rate ? ' (' + dinero(f.sugeridoBs, 'Bs ') + ')' : '') + '.';
    } else { aviso.classList.add('hidden'); aviso.textContent = ''; }
  }

  /* ---------------- PDF sin librerías ---------------- */
  var WANSI = { '€': 0x80, '…': 0x85, '‘': 0x91, '’': 0x92, '“': 0x93, '”': 0x94, '•': 0x95, '–': 0x96, '—': 0x97, '·': 0xB7 };
  function wansi(str) {
    var out = '';
    for (var i = 0; i < str.length; i++) {
      var c = str.charAt(i), k = str.charCodeAt(i);
      out += WANSI[c] !== undefined ? String.fromCharCode(WANSI[c]) : (k < 256 ? c : '?');
    }
    return out;
  }
  function pstr(str) { return '(' + wansi(str).replace(/[\\()]/g, function (m) { return '\\' + m; }) + ')'; }
  function ancho(str, size) {
    var w = 0;
    for (var i = 0; i < str.length; i++) {
      var c = str.charAt(i);
      w += /[0-9$€]/.test(c) ? 556 : (c === '.' || c === ',' || c === ' ' || c === ':') ? 278 : c === '%' ? 889 : c === '-' ? 333 : c === 'B' ? 667 : c === 's' ? 500 : c === '—' ? 1000 : 556;
    }
    return w * size / 1000;
  }
  function u8(s) { var u = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) u[i] = s.charCodeAt(i) & 255; return u; }
  function cargarLogo() {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () {
        try {
          var cv = document.createElement('canvas'); cv.width = 200; cv.height = 200;
          var x = cv.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, 200, 200); x.drawImage(img, 0, 0, 200, 200);
          cv.toBlob(function (b) { if (!b) return resolve(null); b.arrayBuffer().then(function (ab) { resolve(new Uint8Array(ab)); }, function () { resolve(null); }); }, 'image/jpeg', 0.9);
        } catch (e) { resolve(null); }
      };
      img.onerror = function () { resolve(null); };
      img.src = '/assets/logo-mark-hex.png';
    });
  }
  function armarPDF(c, logo) {
    var cs = [];
    var NEG = '0 0 0 rg', BLANCO = '1 1 1 rg', GRIS = '0.45 0.47 0.52 rg', VERDE = '0.12 0.62 0.32 rg', VERDE_CLARO = '0.91 0.98 0.93 rg', FILA = '0.96 0.96 0.97 rg';
    function T(font, size, x, y, texto, color) { cs.push('BT /' + font + ' ' + size + ' Tf ' + (color || NEG) + ' ' + x + ' ' + y + ' Td ' + pstr(texto) + ' Tj ET'); }
    function TD(font, size, xDer, y, texto, color) { T(font, size, (xDer - ancho(texto, size)).toFixed(1), y, texto, color); }
    function R(x, y, w, h, color) { cs.push(color + ' ' + x + ' ' + y + ' ' + w + ' ' + h + ' re f'); }
    var f = c.f, v = c.v, s = c.sym, rate = c.rate;
    var hoy = new Date().toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Caracas' });
    var bs = function (n) { return rate ? dinero(n, 'Bs ') : '—'; };

    R(0, 782, 595, 60, NEG);
    if (logo) cs.push('q 38 0 0 38 36 793 cm /Im1 Do Q');
    T('F2', 16, logo ? 84 : 36, 806, 'F&V AI GROUP', BLANCO);
    TD('F1', 10, 559, 806, 'Tabla de precios', '0.7 0.72 0.76 rg');
    T('F2', 22, 36, 738, 'Tu tabla de precios');
    T('F1', 10, 36, 720, 'Calculada el ' + hoy + (c.t ? ' · ' + c.t.texto : ''), GRIS);

    T('F2', 9, 36, 688, 'TUS DATOS', GRIS);
    T('F1', 11, 36, 668, 'Costo del producto: ' + dinero(v.costo, s));
    T('F1', 11, 300, 668, 'Margen deseado: ' + fmt1.format(v.margen) + ' %');
    T('F1', 11, 36, 650, 'Comisión del método de pago: ' + (v.com > 0 ? fmt1.format(v.com) + ' %' : 'ninguna'));
    T('F1', 11, 300, 650, rate ? 'Tasa usada: Bs ' + fmt2.format(rate) : 'Tasa: no disponible');

    T('F2', 9, 36, 616, 'RESULTADO', GRIS);
    var cajas = [['Precio de venta', dinero(f.precio, s), bs(f.precioBs)], ['Ganancia por unidad', dinero(f.ganancia, s), bs(f.gananciaBs)], ['Margen real', fmt1.format(f.real) + ' %', v.com > 0 ? 'después de la comisión' : 'sin comisión']];
    cajas.forEach(function (b, i) {
      var x = 36 + i * 177;
      R(x, 540, 169, 66, VERDE_CLARO);
      T('F1', 9, x + 10, 592, b[0], GRIS);
      T('F2', 19, x + 10, 568, b[1], NEG);
      T('F1', 10, x + 10, 549, b[2], VERDE);
    });
    if (v.com > 0 && f.real < v.margen - 0.05) {
      T('F1', 9, 36, 524, 'Ojo: con la comisión, para ganar ' + fmt1.format(v.margen) + ' % limpio cobra ' + dinero(f.sugerido, s) + (rate ? ' (' + dinero(f.sugeridoBs, 'Bs ') + ')' : '') + '.', '0.8 0.4 0 rg');
    }

    T('F2', 9, 36, 500, 'PRECIO DE VENTA SEGÚN TU MARGEN', GRIS);
    var margenes = [10, 20, 30, 40, 50, 60, 70];
    if (margenes.indexOf(Math.round(v.margen)) === -1 || Math.round(v.margen) !== v.margen) { margenes.push(v.margen); margenes.sort(function (a, b) { return a - b; }); }
    var y = 478;
    R(36, y - 6, 523, 22, NEG);
    T('F2', 9, 44, y + 1, 'Margen', BLANCO);
    TD('F2', 9, 262, y + 1, 'Precio ' + s, BLANCO);
    TD('F2', 9, 372, y + 1, 'Precio Bs', BLANCO);
    TD('F2', 9, 462, y + 1, 'Ganancia ' + s, BLANCO);
    TD('F2', 9, 551, y + 1, 'Ganancia Bs', BLANCO);
    margenes.forEach(function (m, i) {
      if (v.com + m >= 100) return;
      y -= 22;
      var ff = fila(v.costo, m, v.com, rate), esElegido = (m === v.margen);
      R(36, y - 6, 523, 22, esElegido ? VERDE_CLARO : (i % 2 ? FILA : '1 1 1 rg'));
      var fuente = esElegido ? 'F2' : 'F1';
      T(fuente, 10, 44, y + 1, fmt1.format(m) + ' %' + (esElegido ? '  (tu margen)' : ''));
      TD(fuente, 10, 262, y + 1, dinero(ff.precio, s));
      TD(fuente, 10, 372, y + 1, bs(ff.precioBs));
      TD(fuente, 10, 462, y + 1, dinero(ff.ganancia, s));
      TD(fuente, 10, 551, y + 1, bs(ff.gananciaBs));
    });

    R(36, 70, 523, 74, VERDE_CLARO);
    T('F2', 13, 52, 120, '¿Quieres que tus precios se actualicen solos?');
    T('F1', 11, 52, 102, 'Catálogo con tasa BCV $90 · Caja Clara $50');
    T('F2', 11, 52, 84, 'fvaigroup.com/express', VERDE);
    cs.push('0.12 0.62 0.32 RG 0.8 w 52 82 m 168 82 l S');
    T('F1', 8, 36, 54, 'Precios en dólares, pagaderos en bolívares a la tasa BCV del día.', GRIS);
    T('F1', 8, 36, 43, 'Cálculo orientativo: confirma tus costos y comisiones antes de publicar tus precios.', GRIS);
    T('F1', 8, 36, 28, 'F&V AI GROUP · Valencia, Venezuela · +58 424 412 5386 · contacto@fvaigroup.com', GRIS);

    var contenido = u8(cs.join('\n'));
    var partes = [], offsets = [], largo = 0;
    function push(u) { partes.push(u); largo += u.length; }
    function pushS(s2) { push(u8(s2)); }
    function obj(n, dict, flujo) {
      offsets[n] = largo;
      pushS(n + ' 0 obj\n' + dict.replace('%L', flujo ? flujo.length : 0) + '\n');
      if (flujo) { pushS('stream\n'); push(flujo); pushS('\nendstream\n'); }
      pushS('endobj\n');
    }
    pushS('%PDF-1.4\n'); push(new Uint8Array([0x25, 0xE2, 0xE3, 0xCF, 0xD3, 0x0A]));
    obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
    obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    obj(3, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >>' + (logo ? ' /XObject << /Im1 8 0 R >>' : '') + ' >> /Contents 6 0 R /Annots [7 0 R] >>');
    obj(4, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
    obj(5, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
    obj(6, '<< /Length %L >>', contenido);
    obj(7, '<< /Type /Annot /Subtype /Link /Rect [50 80 170 96] /Border [0 0 0] /A << /S /URI /URI (https://www.fvaigroup.com/express) >> >>');
    var total = 7;
    if (logo) { obj(8, '<< /Type /XObject /Subtype /Image /Width 200 /Height 200 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length %L >>', logo); total = 8; }
    var xref = largo;
    var tabla = 'xref\n0 ' + (total + 1) + '\n0000000000 65535 f \n';
    for (var i = 1; i <= total; i++) tabla += ('0000000000' + offsets[i]).slice(-10) + ' 00000 n \n';
    pushS(tabla + 'trailer\n<< /Size ' + (total + 1) + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF');
    var out = new Uint8Array(largo), p = 0;
    partes.forEach(function (u) { out.set(u, p); p += u.length; });
    return out;
  }
  function descargar(bytes) {
    var blob = new Blob([bytes], { type: 'application/pdf' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'tabla-de-precios-fv-ai-group.pdf';
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 2500);
  }

  /* ---------------- captura de contactos ---------------- */
  function estado(html, tipo) {
    var e = $('lead-status');
    e.className = 'rounded-lg px-4 py-3 text-sm mt-4 ' + (tipo === 'error' ? 'border border-fv-orange/40 bg-fv-orange/10 text-slate-200' : 'border border-fv-triGreen/30 bg-fv-triGreen/10 text-slate-200');
    e.innerHTML = html; e.classList.remove('hidden');
  }
  var ERR = { nombre: 'Escribe tu nombre.', whatsapp: 'Revisa tu número de WhatsApp (ejemplo: +58 424 000 0000).', negocio: 'Cuéntanos qué tipo de negocio tienes.', consentimiento: 'Marca la casilla para continuar.', origin: 'No pudimos enviar tus datos desde aquí. Escríbenos por WhatsApp.' };
  function enviar(accion) {
    var v = leer(true);
    if (!v.ok) { estado('Primero completa la calculadora de arriba para generar tu tabla.', 'error'); var k = Object.keys(v.errs)[0]; var i = $('c-' + k); if (i) i.focus(); return; }
    var nombre = $('l-nombre').value.trim(), tel = $('l-whatsapp').value.trim(), negocio = $('l-negocio').value.trim(), ok = $('l-consent').checked;
    var telLimpio = tel.replace(/[\s().-]/g, '');
    if (nombre.length < 2) { estado(ERR.nombre, 'error'); $('l-nombre').focus(); return; }
    if (!/^\+?[0-9]{8,15}$/.test(telLimpio)) { estado(ERR.whatsapp, 'error'); $('l-whatsapp').focus(); return; }
    if (negocio.length < 2) { estado(ERR.negocio, 'error'); $('l-negocio').focus(); return; }
    if (!ok) { estado(ERR.consentimiento, 'error'); $('l-consent').focus(); return; }
    var c = calcular(v);
    var resumen = 'Costo ' + dinero(v.costo, c.sym) + ', margen ' + fmt1.format(v.margen) + ' %, comisión ' + fmt1.format(v.com) + ' %, precio ' + dinero(c.f.precio, c.sym) + (c.rate ? ' / ' + dinero(c.f.precioBs, 'Bs ') : '');
    var btns = [$('btn-pdf'), $('btn-wa')]; btns.forEach(function (b) { b.disabled = true; });
    estado('Enviando…', 'ok');
    var waMsg = 'Hola F&V, quiero la calculadora de precios. Soy ' + nombre + ', tengo ' + negocio;
    function abrirWA() { var url = WA + encodeURIComponent(waMsg); var w = window.open(url, '_blank', 'noopener'); return url; }
    fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre: nombre, whatsapp: tel, negocio: negocio, accion: accion, consentimiento: true, resumen: resumen, web: $('l-web').value }) })
      .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
      .catch(function () { return { ok: true, forwarded: false, offline: true }; })
      .then(function (d) {
        if (d && d.ok === false && d.error && ERR[d.error]) { estado(ERR[d.error], 'error'); return; }
        var enviado = !!(d && d.ok && d.forwarded);
        gt('generate_lead', { method: accion === 'pdf' ? 'calculadora_pdf' : 'calculadora_whatsapp', enviado: enviado });
        var hecho = function (pdfOk) {
          if (accion === 'pdf') gt('calculadora_pdf_descargado');
          if (enviado) {
            estado(accion === 'pdf' ? (pdfOk ? '¡Listo! Descargamos tu tabla de precios y te escribimos por WhatsApp pronto.' : '¡Listo! Recibimos tus datos y te escribimos por WhatsApp pronto.') : '¡Listo! Recibimos tus datos y te escribimos por WhatsApp para enviarte la calculadora.', 'ok');
          } else {
            var url = abrirWA();
            estado((accion === 'pdf' && pdfOk ? 'Descargamos tu tabla de precios. ' : '') + 'Se abrió WhatsApp para que nos escribas. Si no se abrió, <a href="' + url + '" target="_blank" rel="noopener" class="underline text-fv-cyan">toca aquí</a>.', 'ok');
          }
        };
        if (accion === 'pdf') {
          cargarLogo().then(function (logo) { try { descargar(armarPDF(c, logo)); hecho(true); } catch (e) { estado('No pudimos armar el PDF en este navegador. Escríbenos por WhatsApp y te lo enviamos.', 'error'); abrirWA(); } });
        } else hecho(false);
      })
      .then(function () { btns.forEach(function (b) { b.disabled = false; }); });
  }

  /* ---------------- eventos ---------------- */
  ['c-costo', 'c-margen', 'c-comision', 'c-manual'].forEach(function (id) {
    $(id).addEventListener('input', function () { actualizar(); if ($('e-' + id.slice(2)) && !$('e-' + id.slice(2)).classList.contains('hidden')) leer(true); });
    $(id).addEventListener('blur', function () { leer(true); });
  });
  $('c-tasa').addEventListener('change', function () { actualizar(); leer(true); });
  $('calc-form').addEventListener('submit', function (e) { e.preventDefault(); });
  $('btn-pdf').addEventListener('click', function () { enviar('pdf'); });
  $('btn-wa').addEventListener('click', function () { enviar('whatsapp'); });
  $('lead-form').addEventListener('submit', function (e) { e.preventDefault(); enviar('pdf'); });
  actualizar();
  window.FV_CALC = { armarPDF: armarPDF, calcular: calcular, leer: leer, fila: fila, num: num }; // para pruebas
})();
