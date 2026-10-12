# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Empresas en Venezuela que evalúan o ya usan Odoo Community o Dynamics 365 Sales/Customer Service, buscando diagnóstico, automatización, implementación, capacitación y soporte continuo, con integración de IA sobre sus flujos existentes (público de la Línea Hexagonal, `/hexagonal`).

Negocios pequeños y personas (talleres, gomeras, panaderías, peluquerías, consultorios, restaurantes, bodegones, tiendas; profesionales y estudiantes) que compran planes y productos de precio publicado por WhatsApp, casi siempre desde el teléfono (página `/triangular`).

## Product Purpose

F&V AI Group audita procesos, implementa Odoo Community y Dynamics 365 Sales/Customer Service, integra IA en flujos ya existentes, y capacita equipos para que la inversión no quede subutilizada.

## Positioning

Independiente de proveedor (no atado a un solo fabricante) y de ciclo completo con un mismo equipo (auditoría → implementación → capacitación → soporte), a diferencia de subcontratar cada fase por separado.

## Operating Context

Dos líneas (el sitio nunca dice "cuatro líneas" y no existe el concepto "Express"):
**La regla que separa las líneas es el TIPO DE NEGOCIO u organización y quién decide la compra, nunca el precio.** Un negocio pequeño que factura mucho sigue siendo Triangular; una empresa grande que pide algo pequeño es Hexagonal; un club, condominio o gimnasio va según su tipo de organización (el institucional en la Hexagonal y el pequeño en la Triangular); si el cliente crece, pasa de línea.
- ▲ **Línea Triangular** (`/triangular`, negocios pequeños donde el dueño decide, "tú"): personas y profesionales independientes; emprendedores (Instagram, WhatsApp, desde casa); comercios y microempresas (bodegas, bodegones, panaderías, peluquerías, talleres, restaurantes, tiendas, consultorios); pequeñas empresas (distribuidoras, servicios técnicos, clínicas pequeñas, academias); organizaciones pequeñas (un edificio, un club o asociación pequeña, un gimnasio, iglesias, fundaciones pequeñas). Referencia: hasta unas 20 personas, uno o pocos locales, y el dueño decide y paga. Frase: «¿Eres tú quien decide en tu negocio? Para emprendedores, comercios y pequeñas empresas.»
- ⬡ **Línea Hexagonal** (`/hexagonal`, organizaciones grandes donde decide una estructura, "usted"): medianas empresas con varias áreas y gerencias; grandes empresas y corporaciones; grupos empresariales y franquicias; instituciones (clubes sociales, colegios, universidades, clínicas y hospitales, cámaras y gremios); administradoras de condominios. Referencia: más de unas 20 personas, varias sedes, o una junta directiva o gerencia que aprueba la compra. Frase: «¿Su empresa tiene áreas, sedes o junta directiva? Para medianas y grandes empresas, corporaciones e instituciones.»
- Línea de ayuda donde se comparan: «¿No sabe cuál? Menos de 20 personas: Triangular. Más de 20, varias sedes o junta directiva: Hexagonal.»

Canal principal: WhatsApp. Cada botón de producto lleva el mensaje ya escrito con el nombre del producto y su línea, y el formulario de `contacto.html` arma un mensaje de WhatsApp. Empresas: diagnóstico gratis de 20 minutos con Cal.com. Promesa pública: "te respondemos el mismo día" (lun–vie, 9:00 a.m.–5:00 p.m.). `/express` y `/soluciones` ya no existen (redirigen a `/triangular` y a `/`; la redirección de `/express` se conserva para no romper enlaces viejos).

## Capabilities and Constraints

Sitio estático (HTML/CSS/JS + Tailwind CLI vía `npm run build`, sin framework), desplegado en Vercel. Los montos en bolívares se calculan en vivo con la tasa oficial del BCV (DolarApi); `demo-catalogo.html` es la demo funcional del Catálogo con tasa BCV y sirve de base para entregarlo a cada cliente. El asistente "Luci" es un bot de respuestas por palabras clave (no un modelo de IA real) — ya rotulado honestamente como "Asistente de preguntas frecuentes" en su propio panel.

**Restricción temporal (partnership pendiente):** mientras el usuario tramita el partnership gratuito con Odoo, Zoho, Microsoft, Google, Salesforce y monday.com, el sitio solo puede mencionar como tecnologías/servicios que F&V implementa un listado acotado (sin SAP, sin "Business Central" específicamente, y con Odoo/Dynamics 365 acotados a "Odoo Community"/"Dynamics 365 Sales/Customer Service"). No reintroducir SAP ni otras marcas fuera de ese listado hasta que el usuario confirme que ya tiene el partnership correspondiente.

## Brand Commitments

Marca madre F&V: oscura, cian/naranja, con el hexágono de F&V (encabezado, pie, inicio, Nosotros, Contacto, Casos, 404). Dos líneas, cada una con su propio par de color: ▲ Línea Triangular (verde `fv-triGreen` + morado `fv-triPurple`, emblema triángulo, le habla de "tú") y ⬡ Línea Hexagonal (cian + naranja, emblema hexágono, le habla de "usted"). El color depende de la línea donde está el bloque (`.linea-tri` / `.linea-hex`); como la marca madre comparte colores con la Hexagonal, todo bloque Hexagonal lleva siempre la insignia "⬡ Línea Hexagonal". Nunca decir "cuatro líneas" ni usar el concepto "Express". Tipografía Space Grotesk (títulos, nav, UI) + Geist (cuerpo). Tono: "Diseñando ecosistemas de IA con humanidad".

## Evidence on Hand

Logos reales de clientes ya integrados en el carrusel (Licorway, Killjoy, Natural Sweet, Casa del Mocho). Testimonios reales existen pero el usuario aún no los ha cargado en el sitio — la sección permanece en placeholder a propósito; no fabricar citas de reemplazo.

## Product Principles

- Vender el ciclo completo con un mismo equipo, no una fase aislada.
- Ser honesto sobre qué es IA real vs. automatización asistida por palabras clave (ej. Luci).
- Cada afirmación del sitio debe ser verificable, no marketing vacío.

## Accessibility & Inclusion

No se estableció un requisito específico más allá de las prácticas ya presentes en el sitio (skip-link, alt text, contraste, `prefers-reduced-motion`).

## 8. Oferta y reglas de pago (simplificación de octubre de 2026)

- **Línea Triangular:** el precio mensual o del pago único termina siempre en ,99 (excepción: las cuotas $100,00 del curso y $40,00 de la primera cuota del Pack Enfoque). Plan Arranque $39,99/mes y 6 productos con tamaños: Presencia ($14,99 · $29,99 · $59,99 · $99,99), Caja Clara ($14,99 · $29,99 · $39,99), Tablero Ejecutivo ($79,99 · $149,99), Asistente IA de WhatsApp ($119,99 · $179,99), Asesor F&V (Sesión Clara $29,99 · Pack Enfoque $79,99 · Mensual $119,99 · Pro $199,99) y Aprende (Taller $24,99; Finanzas con IA $299,99 en $100,00 + $100,00 + $99,99); anzuelo: Mis Finanzas Claras $4,99. La fuente de verdad de los precios es `triangular.html` (generada con los mismos datos que `assets/planes.js`); talleres y cursos salen de `assets/eventos.js`.
- **Línea Hexagonal:** todos los precios son números redondos (múltiplos de 10). El discurso público ya no dice «desde $300»: la línea se define por tipo de organización. Sus proyectos (Asesoría, Sprint, Odoo, etc.) se rigen por su Propuesta y no tienen descuento.
- **Descuento (octubre de 2026, rama `lineas-por-tipo`):** hay UN solo descuento: 30 % por pagar 12 meses por adelantado un plan mensual (mensual × 12 × 0,70). Aplica a los planes mensuales Triangulares y a las apps mensuales de software (Club, Condominio y Gym) de ambas líneas; no aplica a los proyectos Hexagonales. Mes a mes, en cuotas, por 3, 6 o 9 meses o de contado un pago único: sin descuento. Triangular: totales con 2 decimales; Hexagonal: redondeados al entero. La fórmula está en `assets/planes.js` y se prueba con `node tests/planes.test.js`; el formato de precios, con `node tests/precios.test.js`.
- **Pago:** dólares, pagaderos en bolívares a la tasa BCV del día, o en USDT, Zinli o dólares en efectivo. Los pagos únicos pueden ir en 2 o 3 cuotas. Si no se paga la mensualidad, el servicio se pausa hasta ponerse al día.
- **Permanencia mínima:** Presencia Web y Tienda, 12 meses; Asistente IA de WhatsApp, 6 meses. El resto, sin permanencia.
- **/software:** catálogo de todo el software de F&V (Hexagonal primero, Triangular después), enlazado en el menú, el pie, el inicio y las dos líneas. Ver el apartado «Software» al final.

---

# Club (rama `pagina-club`, 11 de octubre de 2026)

`/club` (`club.html`): página de producto para vender **Club, de F&V AI Group**, un software como servicio para que clubes sociales y deportivos cobren y controlen las cuotas de sus socios. Público: juntas directivas y administraciones de clubes de Venezuela. Todo en «usted» (la excepción: las tarjetas de enlace en páginas en «tú», como `/triangular`, hablan en «tú»).

- **Identidad propia** dentro del sistema oscuro del sitio: verde profundo `#14532d`, verde medio `#1f7a4d`, dorado `#c9a227` y crema `#faf7f0` (tokens `club-*` en `tailwind.config.js`). El cian/naranja y el verde/morado de las líneas **no** son colores del producto: solo aparecen en las insignias de línea de cada plan (▲ Triangular en Esencial; ⬡ Hexagonal en Plus, Pro, Max y A medida). El foco, la barra de progreso y la estela del cursor toman el dorado de Club en esta página. Emblema (escudo con «C») y favicon en `assets/club/`; imagen para redes `assets/club/og-club.png`.
- **Planes:** salen de la tabla compartida de las apps (ver «Software»). Los planes se nombran por tamaño («Hasta 500 socios»), nunca con nombres inventados.
- **Honestidad:** el producto está en lanzamiento. No hay clientes, logos, testimonios ni cifras de uso. Las capturas son de la demo de Club con un club ficticio («Club Campestre de Ejemplo») y siempre dicen «Ejemplo ilustrativo». No se nombra a ningún club real. Las horas de cobranza ahorradas son una estimación explicada (2 minutos por socio al mes).
- **Pendiente de decisión del dueño:** la banda «Clientes fundadores: los primeros 3 clubes no pagan la implementación» está en el HTML con `hidden`; para publicarla basta quitar ese atributo.

---

# Software: Club, Condominio y Gym (rama `lineas-por-tipo`, 12 de octubre de 2026)

Tres apps web por mensualidad, cada una con su página, su identidad y sus planes, más el catálogo `/software`. **Nunca se mezclan en un mismo texto o tarjeta** (no existe «clubes y condominios»); cada página habla solo de su producto.

- **Páginas:** `/club` (verde profundo, dorado y crema), `/condominio` (azul petróleo #0f4c5c, verde menta #2a9d8f y arena #f4f1ea) y `/gym` (grafito #111827, rojo energía #ef4444 y gris claro #e5e7eb; los botones rellenos usan #dc2626 por contraste AA). Estilos compartidos: `assets/producto.css` (y `assets/software-planes.css` para los planes); comportamiento compartido: `assets/producto.js` (pestañas y calculadora). `/condominio` y `/gym` llevan maquetas HTML/CSS (no capturas) rotuladas «Ejemplo ilustrativo»; `/club` usa capturas de la demo con un club ficticio.
- **Una sola tabla de precios:** `assets/precios-software.js`. Por usuarios (socios, unidades o miembros). ⬡ **Hexagonal** (organizaciones institucionales o grandes; precios redondos): hasta 500 $190 · hasta 1.000 $250 · hasta 2.500 $430 · hasta 5.000 $740 · más de 5.000 a medida; implementación $300 (hasta 1.000) y $500 (hasta 5.000); incluye marca completa, dominio propio opcional, capacitación presencial, reunión mensual con la junta (o la administradora o la gerencia), soporte prioritario con respuesta el mismo día y comunicados con la imagen de la organización. ▲ **Triangular** (organizaciones pequeñas; precios ,99): hasta 100 $89,99 · hasta 300 $119,99 · hasta 500 $189,99; implementación $99,99 en 2 cuotas; incluye la app con el logo y soporte por WhatsApp. Todos incluyen app para los usuarios, panel de administración, recibos y avisos por correo, hasta 3 mensajes de WhatsApp por usuario al mes, reportes y copias de seguridad diarias. Descuento único de 30 % por 12 meses por adelantado.
- **Cómo se publica un cambio de precio:** editar solo `assets/precios-software.js`, correr `node scripts/render-planes.js` (reescribe los bloques de planes de las tres páginas) y `node tests/software.test.js`.
- **Planes por línea en cada página:** bloque `#hexagonal` PRIMERO y bloque `#triangular`, cada uno con su interruptor «Mensual | Anual (30 % de descuento)». Tono: «usted» en los bloques Hexagonales y «tú» en los Triangulares.
- **Dirección propia por organización:** club.fvaigroup.com/su-club, condominio.fvaigroup.com/su-edificio y gym.fvaigroup.com/su-gym, con acceso por correo o cédula y un código por correo o WhatsApp; la Hexagonal puede usar su propio dominio. Si la organización ya tiene página, se le agrega el botón de portal; si no, se le hace una (Web Corporativa, Hexagonal; páginas web, Triangular).
- **Calculadora (en las tres páginas):** pregunta si tiene junta directiva y administración propia (sí → Hexagonal, no → Triangular) y el número de usuarios; con más de 500 sin junta pasa a la Hexagonal y con más de 5.000 es a medida.
- **Pendiente de decisión del dueño:** la banda «Clientes fundadores» de `/club` sigue oculta (`hidden`).
