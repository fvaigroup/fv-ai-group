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
- `product`: el producto que trajo al cliente. Sale del atributo `data-product` del botón o, si no lo tiene, del mensaje prellenado (por ejemplo, «Hola F&V, quiero el Plan Arranque (Línea Triangular, $39/mes)…» → `pack-arranque`).
- `cta_location`: dónde estaba el botón (`hero`, `header`, `footer`, `menu_movil`, `luci`, o el nombre del bloque).
- `page`: la página (`inicio`, `triangular`, `paginas-web`…).

En GA4: Eventos → `whatsapp_click` → agregar la dimensión personalizada `product` (Administrar → Definiciones personalizadas → Dimensión, alcance Evento, parámetro `product`). Hasta que se cree, el detalle aparece en DebugView.

### 2. Diagnóstico gratis: `diagnostico_gratis`
Cualquier enlace a `/contacto#agenda` o al calendario de Cal.com. Los botones "Agenda tu diagnóstico gratis" de Contacto, Nosotros y Casos lo llevan además marcado con `data-evento`.

### 3. Reserva de cupo del curso: `reservo_curso`
Los botones "Reservo mi cupo" de Finanzas con IA (octubre y noviembre; el pago es en 3 cuotas o de contado), además de `reservo_curso_oct` / `reservo_curso_nov` según la cohorte.

### 4. Envío de la calculadora: `generate_lead`
Se envía desde `assets/calculadora.js` al enviar el formulario de `/calculadora`. Parámetros: `method` = `calculadora_pdf` o `calculadora_whatsapp`. El PDF descargado envía también `calculadora_pdf_descargado`.

### 5. Eventos de la reorganización por líneas
Cada botón nuevo lleva `data-evento`. Los de la portada y las páginas de línea:

| Evento | Qué es |
|---|---|
| `portada_linea_triangular` / `portada_linea_hexagonal` | Las dos tarjetas grandes de la portada |
| `portada_comparacion_triangular` / `portada_comparacion_hexagonal` | Las dos columnas de la comparación de líneas en la portada |
| `portada_test_abrir`, `portada_test_resultado` | Test «¿No sabes cuál?» |
| `triangular_hero_whatsapp`, `triangular_hero_test`, `triangular_detalle_<producto>` | Página /triangular |
| `hexagonal_hero_whatsapp`, `hexagonal_detalle_<producto>` | Página /hexagonal |
| `header_whatsapp` | Botón único del menú |

`whatsapp_click` sigue llevando `product` (nombre del producto) y `cta_location`. El mensaje prellenado de cada producto incluye su línea, por ejemplo «Línea Triangular».

### 7. Página de producto Club (`/club`)
Todos los botones y enlaces de `/club` llevan `data-evento`; los de WhatsApp además `data-product` y `data-cta`, así que `whatsapp_click` dice qué producto y qué bloque trajo al cliente.

| Evento | Qué es |
|---|---|
| `club_demo_hero` | «Agendar una demo de 20 minutos» de la portada (WhatsApp, `product=club-demo`) |
| `club_planes` | «Ver planes» de la portada |
| `club_tab_socio` / `club_tab_administracion` / `club_tab_junta` | Pestañas de «Lo que hace» |
| `club_planes_mensual` / `club_planes_anual` | Interruptor mensual / anual |
| `club_plan_esencial`, `club_plan_plus`, `club_plan_pro`, `club_plan_max`, `club_plan_a_medida` | Botón de demo de cada plan (`product=club-<plan>`) |
| `club_calculadora` | «Agendar demo» de la calculadora (el mensaje lleva el número de socios y el plan recomendado) |
| `club_faq_1` … `club_faq_6` | Pregunta frecuente abierta |
| `club_demo_cierre` / `club_whatsapp_cierre` | Botones del cierre |
| `portada_club`, `triangular_club`, `hexagonal_club`, `software_club`, `pie_club` | Enlaces hacia `/club` desde el inicio, las dos líneas, `/software` y el pie |

### 8. Páginas de software (`/software`, `/club`, `/condominio`, `/gym`) y portada nueva
Mismo patrón que `/club` (sección 7): todos los botones y enlaces llevan `data-evento`; los de WhatsApp, además, `data-product` y `data-cta`.

| Evento | Qué es |
|---|---|
| `condominio_*` y `gym_*` | Igual que `club_*`: `_demo_hero`, `_planes`, `_tab_1…4`, `_plan_hex_<tamaño>`, `_plan_tri_<tamaño>`, `_plan_hex_a_medida`, `_hex_mensual` / `_hex_anual` / `_tri_mensual` / `_tri_anual`, `_calculadora`, `_calculadora_si` / `_calculadora_no`, `_faq_1…6`, `_demo_cierre`, `_whatsapp_cierre` |
| `software_hex_club`, `software_hex_condominio`, `software_hex_gym` / `software_tri_*` | Tarjetas de las apps en `/software` (cada una lleva a su `#hexagonal` o `#triangular`) |
| `software_hex_<solución>` / `software_tri_<solución>` | Tarjetas pequeñas de «Más soluciones» en `/software` |
| `software_medida` | «Lo desarrollamos a la medida» (WhatsApp) |
| `portada_whatsapp`, `portada_test_abrir` | Botones de la portada nueva |
| `portada_hacemos_automatizacion` / `_software` / `_webs` | «Qué hacemos» |
| `portada_software_club` / `_condominio` / `_gym` / `_todo` | Las tres apps del inicio y «Ver todo el software» |
| `hexagonal_software_club`, `triangular_software_condominio`, … | Tarjetas de software en `/hexagonal` y `/triangular` |
| `pie_software`, `pie_club`, `pie_condominio`, `pie_gym` | Enlaces del pie |

El producto de cada mensaje de WhatsApp de los planes sale de `assets/precios-software.js` (por ejemplo `club-hex-500`, `gym-tri-100`).

### 6. Otros eventos con nombre propio
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
3. `reservo_curso` y `reservo_taller`: reservas iniciadas de cursos y talleres.
4. `generate_lead` (calculadora): cuántos dejan sus datos a cambio del regalo.

Nota: un clic en WhatsApp es una **intención**, no una venta. Para saber qué se cerró, anota en una hoja qué producto pidió cada persona (el mensaje prellenado lo dice).

### 6. Eventos de la simplificación de la oferta
Cada botón nuevo lleva `data-evento`. Los de WhatsApp de producto usan `<ubicación>_<producto>` (por ejemplo `triangular_tarjeta_presencia-catalogo`, `portada_pedido_plan-arranque`).

| Evento | Dónde |
|---|---|
| `triangular_indice_<producto>` | Chips para ir a un producto en /triangular |
| `triangular_demo_catalogo` | "Ver la demo en vivo" del tamaño Catálogo |
| `portada_software`, `pie_software`, `contacto_software` | Enlaces a /software (franja de la portada, pie y Contacto) |
| `software_hero_piloto`, `software_hero_ejemplo`, `software_tipo_club`, `software_tipo_condominio`, `software_cta_piloto` | Página /software; el WhatsApp del piloto trae el producto `software-piloto` |
| `web_plan_catalogo`, `web_plan_web`, `web_plan_tienda` | Tamaños de Presencia en /paginas-web |
| `cursos_a_asesor`, `avisame_curso_finanzas` | Sesión Clara y aviso de nueva fecha en /cursos |

La prueba automática de los cálculos de pago adelantado está en `tests/planes.test.js` (`node tests/planes.test.js`).
