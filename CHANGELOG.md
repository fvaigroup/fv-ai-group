# Cambios de fvaigroup.com: de landing a embudo de venta

Un commit por fase (los mensajes empiezan con «Fase N:»). Este archivo no se publica en el sitio.

## Fase 1: arreglos técnicos
Enlaces internos sin `.html` y anclas rotas corregidas; textos de plazos unificados (un plazo por producto); buscador que ya no muestra «Ctrl K» suelto; `alt` descriptivo en imágenes; etiqueta correcta del correo del pie; mapa de Contacto sin URL cruda; CSP actualizada para Clarity.

## Fase 2: Triangular Express (`/express`)
Pack Arranque y 14 productos con precio, plazo y botón de WhatsApp con mensaje prellenado por producto; test de 3 preguntas; garantía; formas de pago; demo del catálogo (`/demo-catalogo`); `assets/eventos.js` (fechas, precios y cupos de talleres y cursos en un solo lugar).

## Fase 3: portada de embudo
Hero con 3 caminos (negocio, empresa, aprender), productos estrella, dolores, webs con capturas, 4 líneas, taller y curso, 3 razones, FAQ de objeciones, cierre por WhatsApp. Menú de 8 enlaces y botón «Diagnóstico gratis». Los logos de clientes no se tocaron.

## Fase 4: páginas web (`/paginas-web`)
Cuatro planes con precio fijo (Catálogo $90, Web Express $150, Web Profesional desde $350, Tienda Online desde $500), proceso, garantía y formas de pago.

## Fase 5: soluciones y 4 líneas (`/soluciones`)
Triangular Express, Triangular, Hexagonal Express y Hexagonal con precios publicados. `/servicios` y `/precios` redirigen a `/soluciones`. Las 6 páginas de detalle llevan su precio y su línea.

## Fase 6: cursos con calendario (`/cursos`)
Dos cohortes de Finanzas con IA (octubre y noviembre de 2026), taller «La plata de tu negocio clara», clases 1:1; la «próxima fecha» se calcula sola y los eventos pasados se ocultan.

## Fase 7: calculadora de regalo (`/calculadora`)
Calculadora de precios en $ y Bs con la tasa BCV, PDF descargable y envío de datos a `/api/lead` con respaldo por WhatsApp.

## Fase 8: casos, nosotros, contacto, Luci
- Luci es ahora un solo archivo (`assets/luci.js`): asistente virtual 24 h, cada respuesta termina con un botón de acción, botón flotante «¿Dudas? Pregúntale a Luci (responde al instante)».
- `/casos`: plantilla y 3 casos ocultos; mientras no haya casos se invita a ser uno de los primeros.
- Nosotros: fotos (marcadores), cargos nuevos, historia de ejemplo, «Por qué Valencia», diagnóstico gratis.
- Contacto: diagnóstico gratis de 20 minutos con Cal.com embebido arriba, formulario a WhatsApp con casilla de consentimiento y alternativa por correo.

## Fase 9: SEO, medición y QA
- **SEO:** título y descripción únicos por página (con «Valencia, Venezuela»), imágenes para redes de 1200×630 (portada, Express, páginas web, cursos), `sitemap.xml` y `robots.txt` actualizados (sin páginas `noindex`), datos estructurados Organization, LocalBusiness, Product/Offer (Pack Arranque) y FAQPage en la portada.
- **Medición:** `assets/medicion.js` (un solo archivo), eventos con `data-evento`, `README-MEDICION.md`.
- **Rendimiento:** logos de marca en WebP (de 240–500 KB a 15 KB), fuentes sin bloquear el primer pintado, Google Analytics y Clarity cargan después del primer toque o a los 8 s, fondos animados solo en pantallas grandes y tras el primer pintado, halos y animaciones infinitas apagados en móvil. Lighthouse móvil de la portada (medido en local, varias corridas; el equipo de pruebas es lento y el resultado varía): de 36–58 a 68–97, con la mayoría entre 75 y 95. Hay que confirmarlo en PageSpeed Insights ya publicado; LCP de 10–13 s a 2,2–2,5 s; peso de 4,9 MB a 1,3 MB.
- **Accesibilidad:** grises de texto con contraste mínimo 4,5:1, encabezados del pie en orden, un solo H1 por página.
- **Imagen para Instagram:** `assets/social/ig-fvaigroup-1080x1350.png`.

---

# Reorganización por líneas (rama `lineas-colores`)

El sitio ahora comunica **dos líneas con dos velocidades**: ▲ Línea Triangular (negocios, verde y morado, "tú") y ⬡ Línea Hexagonal (empresas, cian y naranja, "usted"), cada una con productos normales y productos ⚡ Express. Ya no se dice "cuatro líneas".

- **Fase 1:** sistema de color por línea (`.linea-tri`, `.linea-hex`, `.btn-linea`, `.texto-linea`, `.card-lift`) e insignias con texto y forma (▲ ⬡ ⚡). Documentado en `docs/design-system-fvaigroup.md` §7.
- **Fase 2:** cada bloque con el color de su línea; auditoría automática de colores cruzados (0 cruces).
- **Fase 3:** rangos por plazo (Triangular desde $250; Hexagonal Express desde $150), Habilitación de equipos a Hexagonal Express, Acompañamiento Básico solo en Triangular, nombres sin "Express" en productos normales (Catálogo con tasa BCV, Web de una página, Garantía), mensajes de WhatsApp con producto y línea, cupos sin "Quedan 6 de 6".
- **Fase 4:** página nueva `/triangular` (23 productos por categoría con filtros accesibles y "Ver N más").
- **Fase 5:** página nueva `/hexagonal` (ruta de entrada, dolores en usted, 17 productos con filtros) y miga de pan en las 6 páginas de detalle.
- **Fase 6:** menú Inicio · Línea Triangular · Línea Hexagonal · Nosotros · Contacto + un solo botón de WhatsApp; pie por líneas; `/express` y `/soluciones` redirigen a `/triangular` y a `/`.
- **Fase 7:** inicio nuevo de 8 bloques con las dos líneas al mismo nivel, cuadro 2×2, "Lo más pedido" y test que también recomienda la Hexagonal.
- **Fase 8:** Contacto con dos puertas (negocio por WhatsApp, empresa con Cal.com) y formulario agrupado por línea; plantilla de casos con espacio para la insignia; sección "Dos líneas, dos velocidades" en Nosotros.
- **Fase 9:** control de calidad (ver el resumen entregado con la rama).

La lista de pendientes del dueño (testimonios, casos, fotos, historia, webhook, validación de precios) está en `PENDIENTES-LOCAL.md`, un archivo local que no se sube al repositorio público.
