# Medición de fvaigroup.com

Qué se mide, con qué herramienta y cómo leerlo. Este archivo no se publica en el sitio (está en `.vercelignore`).

## Herramientas

| Herramienta | Qué da | Dónde verlo |
|---|---|---|
| **Google Analytics 4** (`G-KY3QKJPK3K`) | Visitas, de dónde vienen y los **eventos de clic** de abajo | analytics.google.com → Informes → Participación → Eventos |
| **Vercel Web Analytics** (`/_vercel/insights`) | Visitas y páginas más vistas, sin cookies | Panel de Vercel → proyecto → Analytics |
| **Microsoft Clarity** | Mapas de calor y grabaciones de sesiones | clarity.microsoft.com |

Todo el seguimiento de clics vive en **un solo archivo**: [`assets/medicion.js`](assets/medicion.js). Las páginas no llevan código de medición propio.

## Eventos de clic

### 1. WhatsApp por producto: `whatsapp_click`
Se envía en **todo** enlace a `wa.me`. Parámetros:
- `product`: el producto que trajo al cliente. Sale del atributo `data-product` del botón o, si no lo tiene, del mensaje prellenado (por ejemplo, «Hola F&V, quiero el Pack Arranque ($150)…» → `pack-arranque`).
- `cta_location`: dónde estaba el botón (`hero`, `header`, `footer`, `menu_movil`, `luci`, o el nombre del bloque).
- `page`: la página (`inicio`, `express`, `paginas-web`…).

En GA4: Eventos → `whatsapp_click` → agregar la dimensión personalizada `product` (Administrar → Definiciones personalizadas → Dimensión, alcance Evento, parámetro `product`). Hasta que se cree, el detalle aparece en DebugView.

### 2. Diagnóstico gratis: `diagnostico_gratis`
Cualquier enlace a `/contacto#agenda` o al calendario de Cal.com. Los botones "Agenda tu diagnóstico gratis" de Contacto, Nosotros y Casos lo llevan además marcado con `data-evento`.

### 3. Reservo con $100: `reservo_100`
Los botones "Reservo con $100" de Finanzas con IA (octubre y noviembre), además de `reservo_100_oct` / `reservo_100_nov` según la cohorte.

### 4. Envío de la calculadora: `generate_lead`
Se envía desde `assets/calculadora.js` al enviar el formulario de `/calculadora`. Parámetros: `method` = `calculadora_pdf` o `calculadora_whatsapp`. El PDF descargado envía también `calculadora_pdf_descargado`.

### 5. Otros eventos con nombre propio
Cualquier elemento con `data-evento="nombre"` envía un evento llamado `nombre` al hacer clic. Los más útiles:

| Evento | Qué es |
|---|---|
| `hero_negocio` / `hero_empresa` / `hero_aprender` | Los 3 caminos de la portada |
| `franja_pack_arranque` | Franja superior de la portada |
| `reservo_taller`, `portada_taller_reservo` | Reservar cupo en el taller |
| `webs_ver_precios`, `webs_demo` | Interés en páginas web |
| `caso_quiero_algo_asi`, `casos_precio_lanzamiento` | Casos de clientes |
| `whatsapp_formulario`, `correo_contacto` | Formulario de Contacto (WhatsApp o correo) |
| `demo_quiero_click` | Clic en "Quiero el mío" dentro de la demo del catálogo |

Para medir un botón nuevo basta con añadirle `data-evento="mi_evento"`; no hay que tocar ningún script.

## Qué mirar cada semana
1. `whatsapp_click` agrupado por `product`: qué producto trae más conversaciones.
2. `diagnostico_gratis`: cuántas personas piden el diagnóstico (y desde qué página).
3. `reservo_100` y `reservo_taller`: reservas iniciadas de cursos y talleres.
4. `generate_lead` (calculadora): cuántos dejan sus datos a cambio del regalo.

Nota: un clic en WhatsApp es una **intención**, no una venta. Para saber qué se cerró, anota en una hoja qué producto pidió cada persona (el mensaje prellenado lo dice).
