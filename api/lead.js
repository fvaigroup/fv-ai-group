/* POST /api/lead — recibe los datos de la calculadora (/calculadora), los valida y los reenvía a LEAD_WEBHOOK_URL.
   - LEAD_WEBHOOK_URL es una variable de entorno de Vercel (por ejemplo, un Google Apps Script que escribe en una hoja).
     Nunca se envía al navegador. Si no existe, responde { ok: true, forwarded: false } y la página abre WhatsApp.
   - Valida y limpia todo en el servidor (el navegador no es de fiar). */
'use strict';

const MAX_BODY = 8 * 1024;
const ORIGENES_OK = /^https:\/\/(www\.)?fvaigroup\.com$/;

function limpiar(valor, max) {
  const t = String(valor == null ? '' : valor)
    .replace(/[\u0000-\u001f\u007f]/g, ' ') // sin caracteres de control
    .replace(/[<>]/g, '')                    // sin etiquetas HTML
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
  // una celda de hoja de cálculo que empieza por = + - @ se interpretaría como fórmula
  return /^[=+\-@]/.test(t) ? "'" + t : t;
}

function normalizarTelefono(valor) {
  let crudo = String(valor || '').replace(/[\s().-]/g, '');
  if (/^0[0-9]{10}$/.test(crudo)) crudo = '+58' + crudo.slice(1); // 0414 123 4567 -> +58 414 123 4567
  if (!/^\+?[0-9]{8,15}$/.test(crudo)) return null;
  return crudo.startsWith('+') ? crudo : '+' + crudo;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  // Solo desde nuestro propio sitio (los navegadores envían Origin en los POST).
  const origen = req.headers && req.headers.origin;
  if (origen && !ORIGENES_OK.test(origen) && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origen)) {
    return res.status(403).json({ ok: false, error: 'origin' });
  }

  let cuerpo = req.body;
  if (typeof cuerpo === 'string') {
    if (cuerpo.length > MAX_BODY) return res.status(413).json({ ok: false, error: 'too_large' });
    try { cuerpo = JSON.parse(cuerpo); } catch (e) { return res.status(400).json({ ok: false, error: 'json' }); }
  }
  if (!cuerpo || typeof cuerpo !== 'object' || Array.isArray(cuerpo)) return res.status(400).json({ ok: false, error: 'body' });
  if (JSON.stringify(cuerpo).length > MAX_BODY) return res.status(413).json({ ok: false, error: 'too_large' });

  // Trampa para bots: un campo invisible que una persona nunca llena. Se responde "ok" sin hacer nada.
  if (cuerpo.web) return res.status(200).json({ ok: true, forwarded: false });

  const nombre = limpiar(cuerpo.nombre, 80);
  const negocio = limpiar(cuerpo.negocio, 120);
  const whatsapp = normalizarTelefono(cuerpo.whatsapp);
  const accion = cuerpo.accion === 'whatsapp' ? 'whatsapp' : cuerpo.accion === 'pdf' ? 'pdf' : null;
  const resumen = limpiar(cuerpo.resumen, 400);

  if (nombre.length < 2) return res.status(400).json({ ok: false, error: 'nombre' });
  if (!whatsapp) return res.status(400).json({ ok: false, error: 'whatsapp' });
  if (negocio.length < 2) return res.status(400).json({ ok: false, error: 'negocio' });
  if (!accion) return res.status(400).json({ ok: false, error: 'accion' });
  if (cuerpo.consentimiento !== true) return res.status(400).json({ ok: false, error: 'consentimiento' });

  const destino = process.env.LEAD_WEBHOOK_URL;
  if (!destino) return res.status(200).json({ ok: true, forwarded: false });

  try {
    const control = new AbortController();
    const reloj = setTimeout(() => control.abort(), 8000);
    const r = await fetch(destino, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      redirect: 'follow',
      signal: control.signal,
      body: JSON.stringify({
        fecha: new Date().toISOString(),
        origen: 'fvaigroup.com/calculadora',
        accion, nombre, whatsapp, negocio, resumen,
        consentimiento: 'Acepta que F&V le escriba por WhatsApp'
      })
    });
    clearTimeout(reloj);
    return res.status(200).json({ ok: true, forwarded: r.ok });
  } catch (e) {
    // si el destino falla, la página abre WhatsApp: el contacto no se pierde
    return res.status(200).json({ ok: true, forwarded: false });
  }
};
