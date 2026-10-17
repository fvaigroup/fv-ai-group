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
- `product`: el producto que trajo al cliente. Sale del atributo `data-product` del botón o, si no lo tiene, del mensaje prellenado (por ejemplo, «Hola F&V, quiero el Plan Arranque (▲, $39,99/mes)…» → `plan-arranque`).
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

`whatsapp_click` sigue llevando `product` (nombre del producto) y `cta_location`. El mensaje prellenado de cada producto lleva la forma de su línea entre paréntesis, por ejemplo «(▲, $39,99/mes)» o «(⬡, $270)»; los nombres «Línea Hexagonal» y «Línea Triangular» solo existen en el inicio.

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

### 9. Página para dueños de empresa (`/ejecutivos`, destino de los anuncios de Meta)
Todos los botones de WhatsApp de la página llevan `data-evento="ejecutivos_whatsapp"`, `data-product` y `data-cta`. Además, `assets/medicion.js` envía `ejecutivos_whatsapp` en **cualquier** otro clic a WhatsApp dentro de `/ejecutivos` (menú, pie, Luci), con el producto sacado del mensaje prellenado. Cada clic cuenta una sola vez como `ejecutivos_whatsapp` y, como en todo el sitio, también como `whatsapp_click`.

| Evento | Qué es | Parámetros |
|---|---|---|
| `ejecutivos_whatsapp` | Clic a WhatsApp en `/ejecutivos` | `product`, `cta_location`, `page` |
| `diagnostico_gratis` | «Consulta gratis de 20 min» del cierre (lleva a `/contacto#agenda`; se envía solo, sin `data-evento`) | `cta_location` (`ejecutivos_cierre`), `page` |
| `ejecutivos_ver_programa` | «Ver el programa ejecutivo» de la portada (baja a `#programa-ejecutivo`) | `cta_location`, `page` |
| `ejecutivos_ver_implementacion` | «Ver qué implementamos» (lleva a `/hexagonal#productos`) | `cta_location`, `page` |
| `ejecutivos_mapa`, `ejecutivos_nosotros` | «Ver en Google Maps» y «Conozca al equipo» | `cta_location`, `page` |
| `ejecutivos_faq_1` … `ejecutivos_faq_5` | Pregunta frecuente abierta (o cerrada) | `cta_location`, `page` |

Valores de `product` en `ejecutivos_whatsapp`:

| `product` | Botón | `cta_location` |
|---|---|---|
| `diagnostico-270` | «Agendar diagnóstico» (portada, tarjeta del Diagnóstico y cierre) | `ejecutivos_portada`, `ejecutivos_oferta_diagnostico`, `ejecutivos_cierre` |
| `programa-ejecutivo` | «Preguntar por las fechas» del Programa ejecutivo entre semana | `ejecutivos_oferta_programa` |
| `formacion-ejecutiva` | Formación ejecutiva 1 a 1 | `ejecutivos_oferta_formacion` |
| `asesor-financiero` | Asesor financiero con IA | `ejecutivos_oferta_asesor` |
| `ejecutivos-consulta` | Botón de WhatsApp del menú (además envía `header_whatsapp`) | `header`, `menu_movil` |
| (texto del mensaje) | WhatsApp del pie o de Luci | `footer`, `luci` |

Desde este cambio, todo evento con `data-evento` puesto en un enlace de WhatsApp lleva también `product` (antes solo lo llevaba `whatsapp_click`).

Para separar lo que traen los anuncios: en Meta, agregue a la URL del anuncio `?utm_source=meta&utm_medium=paid&utm_campaign=<nombre>`; GA4 lo toma solo (Adquisición → Adquisición de tráfico) y se puede cruzar con `ejecutivos_whatsapp` por `product`.

### 10. Oferta Hexagonal nueva (17 de octubre de 2026)
La Asesoría Estratégica ($150), la Evaluación de Procesos ($400) y la Habilitación de equipos ($60 por persona) dejaron de ser productos. Desaparecen sus valores de `product` (`asesoria-estrategica`, `evaluacion-procesos`, `habilitacion-equipos`) y el evento `portada_pedido_asesoria-estrategica`; si algún informe de GA4 filtraba por ellos, hay que cambiarlo a los nuevos.

Valores nuevos de `product` (botones de WhatsApp de `/hexagonal`, `/ejecutivos`, el inicio, `/asesoria-estrategica`, `/cursos`, `/masterclasses-workshops`, `/nosotros`, `/contacto` y Luci):

| `product` | Producto |
|---|---|
| `diagnostico-270` | Diagnóstico «¿En qué se va la plata de su empresa?» ($270) |
| `formacion-ejecutiva` | Formación ejecutiva 1 a 1 ($960) |
| `programa-ejecutivo` | Programa ejecutivo entre semana ($270 individual; $180 por persona en grupo de 2 a 4) |
| `asesor-financiero` | Asesor financiero con IA ($120 o $480 al mes) |
| `formacion-equipo` | Formación para su equipo (a medida) |
| `reportes-whatsapp` | Reportes automáticos por WhatsApp (a medida) |
| `acompanamiento-continuo` | Acompañamiento Continuo (soporte técnico) |
| `proximas-fechas` | «Próximas fechas: escríbenos por WhatsApp» de cursos y talleres |

Eventos nuevos con `data-evento` (cada uno envía un evento con su nombre):

| Evento | Dónde |
|---|---|
| `hexagonal_hero_diagnostico`, `hexagonal_hero_ejecutivos`, `hexagonal_detalle_diagnostico`, `hexagonal_detalle_formacion-ejecutiva`, `hexagonal_detalle_programa-ejecutivo`, `hexagonal_metodo_<etapa>`, `hexagonal_cierre_diagnostico` | `/hexagonal` |
| `portada_duenos_diagnostico`, `portada_duenos_programa`, `portada_duenos_ejecutivos`, `portada_pedido_diagnostico`, `portada_pedido_asesor-financiero` | Inicio (sección «Para dueños de empresa» y «Lo más pedido») |
| `nosotros_mapa`, `nosotros_diagnostico`, `nosotros_implementacion`, `nosotros_formacion_ejecutiva`, `nosotros_programa_ejecutivo`, `nosotros_formacion_equipo`, `nosotros_masterclass`, `nosotros_asesor_financiero`, `nosotros_acompanamiento` | `/nosotros` |
| `contacto_diagnostico_270` | `/contacto` (tarjeta del Diagnóstico de $270) |

La llamada gratuita de 20 minutos se llama «Consulta gratis de 20 min» en las páginas Hexagonales y en `/ejecutivos`, y sigue midiendo `diagnostico_gratis` (sección 2).

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
5. `ejecutivos_whatsapp` agrupado por `product` (y por campaña de Meta): qué oferta de `/ejecutivos` trae conversaciones; y `diagnostico_gratis` con `page` = `ejecutivos`.

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
| `avisame_curso_finanzas` | Aviso de nueva fecha del curso de Finanzas con IA (el evento `cursos_a_asesor` dejó de existir: la asesoría de lo ▲ desapareció) |

La prueba automática de los cálculos de pago adelantado está en `tests/planes.test.js` (`node tests/planes.test.js`).

### 11. Catálogo único: servicios y productos (17 de octubre de 2026)
El sitio tiene dos listados (`/servicios` y `/productos`) y una página de detalle por ítem (`/servicios/<id>`, `/productos/<id>`), todos generados desde `data/catalogo.json`. Esto es lo que se mide en ellos.

| Evento | Qué es | Parámetros |
|---|---|---|
| `ver_detalle` | Clic en «Ver detalle» de una tarjeta (listados, inicio y páginas de detalle) | `item` (id del ítem del catálogo, por ejemplo `tablero-gerencial`), `linea` (`hex` o `tri`), `cta_location` (`tarjeta`), `page` |
| `detalle_cruce` | «Ver …» hacia el producto o servicio equivalente de la otra línea | `item` (el ítem de destino), `cta_location`, `page` |
| `detalle_nivel_atajo` | Atajo a un nivel dentro de una página compartida (por ejemplo los 3 niveles de Acompañamiento) | `item`, `cta_location`, `page` |
| `menu_categoria` | Abrir un desplegable de Servicios o Productos del menú, o seguir uno de sus enlaces | `categoria` (`servicios`, `productos`, `servicios/diagnostico`, `productos/cursos`, `servicios/todos`…), `page` |
| `detalle_whatsapp` | Botón de WhatsApp de una página de detalle | `product`, `cta_location` (el bloque: `data-cta`), `page` |
| `detalle_consulta_gratis` | «Consulta gratis de 20 min» de una página de detalle (además sale `diagnostico_gratis`) | `cta_location`, `page` |
| `detalle_faq_<n>` | Pregunta frecuente abierta en una página de detalle | `cta_location`, `page` |

Cómo leerlo:
- `ver_detalle` agrupado por `item` dice qué tarjetas despiertan interés; por `linea`, si interesa más lo `hex` (empresas e instituciones) o lo `tri` (negocios pequeños). Los parámetros `item` y `linea` salen de los atributos `data-item` y `data-linea` de la tarjeta; cualquier otro elemento con `data-evento` que los lleve los envía igual.
- `menu_categoria` lo envía **solo** `assets/menu.js` (`assets/medicion.js` no lo toca), una vez al abrir el desplegable y una vez al seguir uno de sus enlaces; `categoria` es el grupo (`servicios` o `productos`) al abrir y `<grupo>/<categoría>` (o `<grupo>/todos`) al seguir un enlace. En el menú móvil pasa igual con el acordeón.
- `detalle_whatsapp` es el nombre por defecto del evento de los botones de WhatsApp de los detalles. Todos llevan `data-product`, así que tanto este evento como `whatsapp_click` traen `product`.
- **Los productos conservan sus ids**: el `product` de `whatsapp_click` es el mismo de antes (`diagnostico-270`, `formacion-ejecutiva`, `asesor-financiero`, `plan-arranque`, `caja-clara`…); se toma del campo `product` del ítem del catálogo y, si falta, de su `id`. Los informes de GA4 filtrados por esos valores siguen funcionando.
- La asesoría de lo ▲ (cuatro productos, con sus valores de `product` y eventos) ya no existe: dejan de salir. La asesoría solo existe en lo ⬡ (`asesor-financiero`).
- Las páginas viejas (`/hexagonal`, `/triangular`, `/software`, `/cursos`, `/asesoria-estrategica`, `/acompanamiento-continuo`, `/despliegue-ejecucion`, `/masterclasses-workshops`) redirigen (301) a las nuevas: los eventos `hexagonal_*`, `triangular_*`, `software_hex_*` y `software_tri_*` dejan de salir desde ellas, y su tráfico aparece como `page` = `servicios`, `productos` o el detalle. Para comparar con antes, sume `servicios` + `productos` + los detalles.

Las redirecciones están en `vercel.json`; `assets/anclas-viejas.js` lleva un ancla vieja (`/hexagonal#web-corporativa-crm`) a su página nueva (`/servicios/web-corporativa-crm`). El `sitemap.xml` se genera con `node scripts/catalogo/sitemap.js` (también lo corre `npm run build`).

#### Eventos de los bloques extra de `/servicios` y `/productos`
Salen de `partials/servicios-extra.html` y `partials/productos-extra.html` (los nombres ya no llevan «hexagonal» ni «triangular»; los viejos `hexagonal_metodo_*` y `triangular_test` solo existían en las páginas viejas).

| Evento | Dónde |
|---|---|
| `servicios_metodo_diagnostico`, `servicios_metodo_implementacion`, `servicios_metodo_formacion_equipo`, `servicios_metodo_ejecutivos`, `servicios_metodo_acompanamiento` | Enlaces de «Cómo trabajamos» en `/servicios` |
| `productos_test_whatsapp`, `productos_test_detalle`, `productos_test_resultado` | Cuestionario «¿No sabes cuál elegir?» en `/productos` (botón de WhatsApp, enlace al detalle y resultado mostrado) |
| `recomendar_whatsapp` | «Quiero recomendar a alguien» en `/productos` (`data-product=recomendados`, `data-cta=productos_recomendar`) |
