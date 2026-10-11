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
- ▲ **Línea Triangular** (`/triangular`, negocios pequeños y personas, "tú"): planes y productos de $4,99 a $299,99, la mayoría con pago mensual.
- ⬡ **Línea Hexagonal** (`/hexagonal`, empresas, "usted"): proyectos a la medida con soporte (diagnóstico, automatización, sistemas completos, formación y acompañamiento).

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

- **Línea Triangular:** todo cuesta entre $4,99 y $299,99 (precio mensual o del pago único), preferiblemente mensual. Plan Arranque $39/mes y 6 productos con tamaños: Presencia, Caja Clara, Tablero Ejecutivo, Asistente IA de WhatsApp, Asesor F&V y Aprende; anzuelo: Mis Finanzas Claras $4,99. La fuente de verdad de los precios es `triangular.html` (generada con los mismos datos que `assets/planes.js`); talleres y cursos salen de `assets/eventos.js`.
- **Línea Hexagonal:** «desde $300» en el discurso público; sus productos y precios no cambian (Asesoría Estratégica $150 y Habilitación de equipos $60 por persona siguen publicados: decisión del dueño). Sin descuento por pago adelantado.
- **Descuento:** 20 % solo si se paga de contado un producto de pago único o si se adelantan 3, 6, 9 o 12 meses de un plan mensual (precio × meses × 0,8). Mes a mes o en cuotas: sin descuento. Ya no existe descuento por USDT o efectivo.
- **Pago:** dólares, pagaderos en bolívares a la tasa BCV del día, o en USDT, Zinli o dólares en efectivo. Los pagos únicos pueden ir en 2 o 3 cuotas. Si no se paga la mensualidad, el servicio se pausa hasta ponerse al día.
- **Permanencia mínima:** Presencia Web y Tienda, 12 meses; Asistente IA de WhatsApp, 6 meses. El resto, sin permanencia.
- **/software:** página de marca madre («tú») para validar una plataforma de cuotas de clubes y condominios con clientes piloto. No va en el menú; se enlaza desde el inicio, el pie y Contacto.
