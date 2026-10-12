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

---

# Simplificación de la oferta (rama `simplificar-oferta`, 11 de octubre de 2026)

Se elimina el concepto «Express», la Línea Triangular se rehace con 6 productos casi todos mensuales y entran reglas de pago nuevas.

- **Fase 1:** «Express» y «⚡» desaparecen de todo lo visible (insignias, filtros por velocidad, textos, CSS, buscador, Luci, JSON-LD); la comparación del inicio pasa a dos columnas. Se conservan las redirecciones `/express` y `/triangular-express` → `/triangular`.
- **Fase 2:** `/triangular` nueva: Plan Arranque ($39/mes, antes $44) y 6 productos con selector de tamaño y pago adelantado calculado (`assets/planes.js`): Presencia ($15 · $29 · $59 · $99), Caja Clara ($15 · $29 · $39), Tablero Ejecutivo ($79 · $149), Asistente IA de WhatsApp ($119 · $179), Asesor F&V ($30 · $80 · $119 · $199) y Aprende (taller $25, Finanzas con IA $299 en 3 cuotas, taller de ChatGPT por anunciar), más el anzuelo Mis Finanzas Claras ($4,99). Test de hasta 3 preguntas, 5 preguntas frecuentes y datos estructurados nuevos. `assets/eventos.js` con los precios nuevos del taller y del curso.
- **Fase 3:** bloque «Cómo pagas» único (inicio, /triangular, /paginas-web, /cursos), reglas viejas de descuento por USDT/efectivo y de «mitad y mitad» eliminadas, capítulo XII de `terminos.html` (permanencia mínima, pausa por falta de pago, descuento por pago adelantado, cancelación), Luci y JSON-LD al día. La Hexagonal queda sin descuento y con «desde $300».
- **Fase 4:** inicio (lo más pedido Triangular, franja de software, FAQ y test con productos reales), /paginas-web con los tamaños de Presencia, /cursos y /curso-finanzas-ia con precios nuevos (la Clase 1:1 sale; entra la Sesión Clara), Contacto agrupado, cierre de la calculadora con Presencia Catálogo.
- **Fase 5:** `/software` (plataforma de cuotas para clubes y condominios, cliente piloto), en el sitemap, el pie y Contacto; no va en el menú.
- **Fase 6:** control de calidad (rastreo de 22 páginas a 2 tamaños, enlaces y anclas, cálculos con `tests/planes.test.js`, Lighthouse), imágenes para redes con los precios nuevos y esta documentación.

---

# Estados de interacción (rama `estados-interaccion`)

Solo estados visuales y de interacción: no cambian textos, precios ni estructura.

- **Fase 1:** base común en `src/tailwind.css` (`.estado-interactivo`, deshabilitado, `.spinner`, `.btn-cargando`, `.skeleton`, `.fade-in`) y `assets/estados.js` (`FV_ESTADOS.setCargando`, `mostrarSkeleton`/`ocultarSkeleton`, `anunciar`).
- **Fase 2:** hover, foco y presionado unificados en todas las páginas con el color de su línea; el hover solo en dispositivos con mouse; un solo foco visible global (se quitan los anillos verdes fijos de seis páginas); menú con subrayado desde el centro y página actual marcada; campos con foco y estado inválido accesibles.
- **Fase 3:** estados de carga: tasa BCV con skeleton y «tasa del [fecha]», calculadora (número con transición, botón en carga, sin doble envío), contacto («Abriendo WhatsApp…», skeleton de Cal.com y del mapa), aviso «¿No se abrió?» en los enlaces de WhatsApp, Luci escribiendo, test con «Calculando tu recomendación…», skeleton de fechas e imágenes, barra de progreso entre páginas.
- **Fase 4:** estados de error y vacío: respaldo si falla la tasa o `/api/lead`, respaldo si Cal.com no carga, filtro sin resultados con «Ver todos». La calculadora ya no disfraza una falla real de envío como éxito.
- **Fase 5:** control de calidad (teclado en 22 páginas, hover sin quedar «pegado» en celular, movimiento reducido, colores por línea, Lighthouse antes y después, eventos de medición).

---

# Página de producto Club (rama `pagina-club`)

`/club` (archivo `club.html`): página para vender Club, el software de cobro de cuotas para clubes. Trato de «usted». Identidad propia (verde profundo, dorado y crema sobre el fondo oscuro) con el emblema y el favicon en `assets/club/`. Las capturas son de la demo de Club con un nombre neutro («Club Campestre de Ejemplo») y siempre rotuladas «Ejemplo ilustrativo».

- **Fase 1:** estructura y portada: etiqueta «Nuevo · Software para clubes», titular, subtítulo, botón dorado «Agendar una demo de 20 minutos» (WhatsApp con mensaje prellenado) y «Ver planes», composición de teléfono y laptop con capturas reales de la demo (en móvil, solo el teléfono), franja de 4 datos de confianza, título y descripción únicos, datos estructurados `SoftwareApplication` con las ofertas, favicon y `og-club.png` (1200×630).
- **Fase 2:** el problema («¿Le suena familiar?», 4 tarjetas), cómo funciona (3 pasos con mini capturas), lo que hace con pestañas accesibles (socio, administración y junta; flechas, Inicio y Fin) y seis diferenciadores. Foco y brillos de la página en dorado de Club.
- **Fase 3:** planes y precios (`#planes`): interruptor Mensual / Anual (20 % de descuento, calculado con `assets/club.js`: mensual × 12 × 0,8 con 2 decimales), Esencial $199 (▲ Triangular), Plus $349, Pro $549 (destacado) y Max $799 (⬡ Hexagonal), banda «A medida» desde $1.100, costo por socio, lista común de lo incluido, nota de implementación y de pago. La banda «Clientes fundadores» está lista pero **oculta** (`hidden`) hasta confirmar la oferta.
- **Fase 4:** calculadora «¿Cuánto le cuesta Club?» (deslizador y campo de socios: plan recomendado, precio mensual y anual, costo por socio y horas de cobranza ahorradas, rotuladas «estimación» con la fórmula explicada; botón de demo con el número de socios), comparación «Antes y después con Club» (sin nombrar competidores), seguridad y datos, 6 preguntas frecuentes (con datos estructurados `FAQPage`) y cierre «Vea Club funcionando con datos de ejemplo».
- **Fase 5:** enlaces hacia `/club` (tarjeta en `/triangular` «Club Esencial · $199/mes», tarjeta en `/hexagonal` «Club · desde $349/mes», franja «Nuevo: Club» en el inicio, tarjeta en `/software` y «Club» en el pie de las 18 páginas con pie), `/club` en el `sitemap.xml`, entradas en el buscador y en Luci, eventos de medición documentados en `README-MEDICION.md`, pruebas automáticas de los cálculos (`tests/club.test.js`: anual = mensual × 12 × 0,8 y plan recomendado en 300, 301, 1.000, 1.001, 2.500, 2.501, 5.000 y 5.001 socios), control de calidad (enlaces, teclado, axe, imágenes con `width`/`height` y `loading="lazy"` bajo el primer pantallazo, búsqueda de «Delta» = 0) y `PRODUCT.md`.

---

# Líneas por tipo de negocio (rama `lineas-por-tipo`)

- **Fase 1:** nueva regla de líneas, precios y descuentos.
  - **Líneas por tipo de negocio, no por precio.** ⬡ Hexagonal: medianas y grandes empresas, corporaciones, grupos, instituciones (clubes sociales, colegios, universidades, clínicas, cámaras y gremios) y administradoras de condominios, donde decide una estructura. ▲ Triangular: personas, emprendedores, comercios, pequeñas empresas y organizaciones pequeñas (un edificio, un club o gimnasio pequeño), donde decide el dueño. Desaparecen «de $4,99 a $299,99» y «desde $300» como definición; nuevos bloques «¿Es esta tu línea?» en `/triangular` y «¿Es esta su línea?» en `/hexagonal`, la pregunta frecuente «¿Qué línea es para mí?» (inicio y `/triangular`, con los casos de negocio pequeño que factura mucho, empresa grande que pide algo pequeño, club/condominio/gimnasio y paso de una línea a otra), el test de la portada, Luci, el buscador, Contacto, Nosotros y las metas.
  - **Precios Triangulares en ,99** en todo el sitio (tabla del dueño): Arranque $39,99; Presencia $14,99 · $29,99 · $59,99 · $99,99; Caja Clara $14,99 · $29,99 · $39,99; Tablero $79,99 · $149,99; Asistente IA $119,99 · $179,99; Asesor $29,99 · $79,99 · $119,99 · $199,99; Taller $24,99; Finanzas con IA $299,99 ($100,00 + $100,00 + $99,99). El «por separado» del Plan Arranque pasa a $44,98 (29,99 + 14,99). Precios Hexagonales verificados: todos son múltiplos de 10.
  - **Un solo descuento: 30 % por pagar 12 meses por adelantado** (mensual × 12 × 0,70; Triangular con 2 decimales, Hexagonal al entero). Desaparecen el 20 % de contado y por 3, 6 o 9 meses (productos, «Cómo pagas», preguntas frecuentes, JSON-LD, Luci, `terminos.html`, curso y taller). `assets/planes.js` y `assets/eventos.js` reescritos.
  - **Pruebas:** `node tests/planes.test.js` (descuento) y `node tests/precios.test.js` (formato de precios y textos viejos).
