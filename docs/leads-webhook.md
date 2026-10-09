# Cómo conectar la calculadora a una hoja de Google (leads)

La calculadora (`/calculadora`) manda el nombre, el WhatsApp y el tipo de negocio de quien pide su tabla de precios o la calculadora a `/api/lead` (`api/lead.js`). Esa función valida y limpia los datos y los reenvía a la URL que pongas en la variable de entorno **`LEAD_WEBHOOK_URL`** de Vercel. La URL nunca llega al navegador.

Si `LEAD_WEBHOOK_URL` no existe, la página abre WhatsApp con el mensaje «Hola F&V, quiero la calculadora de precios. Soy [nombre], tengo [negocio]», así que no se pierde ningún contacto.

## Pasos (unos 5 minutos)

1. Crea una hoja de cálculo en Google Sheets. En la fila 1 escribe: `fecha | accion | nombre | whatsapp | negocio | resumen | origen`.
2. En la hoja: **Extensiones → Apps Script**. Pega esto y guarda:

   ```js
   function doPost(e) {
     var d = JSON.parse(e.postData.contents);
     SpreadsheetApp.getActiveSheet().appendRow([d.fecha, d.accion, d.nombre, d.whatsapp, d.negocio, d.resumen, d.origen]);
     return ContentService.createTextOutput('ok');
   }
   ```
3. **Implementar → Nueva implementación → Aplicación web**. Ejecutar como: *yo*. Quién tiene acceso: *cualquier persona*. Copia la URL que termina en `/exec`.
4. En Vercel: **Project → Settings → Environment Variables** → nombre `LEAD_WEBHOOK_URL`, valor la URL del paso 3, en Production. Vuelve a desplegar.
5. Prueba: llena la calculadora en la web y revisa que aparezca una fila nueva.

## Qué guarda cada fila

`fecha` (UTC), `accion` (`pdf` o `whatsapp`), `nombre`, `whatsapp` (con prefijo +58 si lo escribieron como 0414…), `negocio`, `resumen` (costo, margen, comisión y precio calculados) y `origen`.
