# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Empresas en Venezuela que evalúan o ya usan Odoo Community o Dynamics 365 Sales/Customer Service, buscando diagnóstico, automatización, implementación, capacitación y soporte continuo, con integración de IA sobre sus flujos existentes (público de la Línea Hexagonal, `/hexagonal`).

Negocios pequeños y personas (talleres, gomeras, panaderías, peluquerías, consultorios, restaurantes, bodegones, tiendas; profesionales y estudiantes) que compran productos Express de precio fijo por WhatsApp, casi siempre desde el teléfono (página `/triangular`).

## Product Purpose

F&V AI Group audita procesos, implementa Odoo Community y Dynamics 365 Sales/Customer Service, integra IA en flujos ya existentes, y capacita equipos para que la inversión no quede subutilizada.

## Positioning

Independiente de proveedor (no atado a un solo fabricante) y de ciclo completo con un mismo equipo (auditoría → implementación → capacitación → soporte), a diferencia de subcontratar cada fase por separado.

## Operating Context

Dos líneas con dos velocidades cada una (el sitio nunca dice "cuatro líneas"):
- ▲ **Línea Triangular** (`/triangular`, negocios pequeños y personas, "tú"): Triangular normal, 1 a 3 semanas, desde $250 (Web Profesional, Tienda Online, Tablero de Ventas y Caja, Asistente IA Pro, Finanzas con IA…) y ⚡ **Triangular Express**, 24 h a 7 días, de $10 a $150 (Pack Arranque, Negocio Visible, Catálogo con tasa BCV, Web de una página, Caja Clara, Asistente IA de WhatsApp, clases y taller…).
- ⬡ **Línea Hexagonal** (`/hexagonal`, empresas, "usted"): Hexagonal normal, 1 a 3 meses, desde $2.000 (Odoo Community, Ecosistema de Automatización, Dynamics 365, desarrollo a medida, Acompañamiento) y ⚡ **Hexagonal Express**, 1 a 3 semanas, desde $150 (Asesoría Estratégica, Evaluación de Procesos, Tablero Gerencial, Sprint de Automatización, Habilitación de equipos, Masterclass privada…).
- Regla escrita igual en ambas líneas: "⚡ Express = entrega rápida. Triangular: máximo 7 días. Hexagonal: máximo 3 semanas."

Canal principal: WhatsApp. Cada botón de producto lleva el mensaje ya escrito con el nombre del producto y su línea, y el formulario de `contacto.html` arma un mensaje de WhatsApp. Empresas: diagnóstico gratis de 20 minutos con Cal.com. Promesa pública: "te respondemos el mismo día" (lun–vie, 9:00 a.m.–5:00 p.m.). `/express` y `/soluciones` ya no existen (redirigen a `/triangular` y a `/`).

## Capabilities and Constraints

Sitio estático (HTML/CSS/JS + Tailwind CLI vía `npm run build`, sin framework), desplegado en Vercel. Los montos en bolívares se calculan en vivo con la tasa oficial del BCV (DolarApi); `demo-catalogo.html` es la demo funcional del Catálogo con tasa BCV y sirve de base para entregarlo a cada cliente. El asistente "Luci" es un bot de respuestas por palabras clave (no un modelo de IA real) — ya rotulado honestamente como "Asistente de preguntas frecuentes" en su propio panel.

**Restricción temporal (partnership pendiente):** mientras el usuario tramita el partnership gratuito con Odoo, Zoho, Microsoft, Google, Salesforce y monday.com, el sitio solo puede mencionar como tecnologías/servicios que F&V implementa un listado acotado (sin SAP, sin "Business Central" específicamente, y con Odoo/Dynamics 365 acotados a "Odoo Community"/"Dynamics 365 Sales/Customer Service"). No reintroducir SAP ni otras marcas fuera de ese listado hasta que el usuario confirme que ya tiene el partnership correspondiente.

## Brand Commitments

Marca madre F&V: oscura, cian/naranja, con el hexágono de F&V (encabezado, pie, inicio, Nosotros, Contacto, Casos, 404). Dos líneas con dos velocidades, cada una con su propio par de color: ▲ Línea Triangular (verde `fv-triGreen` + morado `fv-triPurple`, emblema triángulo, le habla de "tú") y ⬡ Línea Hexagonal (cian + naranja, emblema hexágono, le habla de "usted"). Cada línea tiene productos normales y productos ⚡ Express (entrega rápida: Triangular máximo 7 días, Hexagonal máximo 3 semanas). El color depende de la línea donde está el bloque (`.linea-tri` / `.linea-hex`); como la marca madre comparte colores con la Hexagonal, todo bloque Hexagonal lleva siempre la insignia "⬡ Línea Hexagonal". Nunca decir "cuatro líneas". Tipografía Space Grotesk (títulos, nav, UI) + Geist (cuerpo). Tono: "Diseñando ecosistemas de IA con humanidad".

## Evidence on Hand

Logos reales de clientes ya integrados en el carrusel (Licorway, Killjoy, Natural Sweet, Casa del Mocho). Testimonios reales existen pero el usuario aún no los ha cargado en el sitio — la sección permanece en placeholder a propósito; no fabricar citas de reemplazo.

## Product Principles

- Vender el ciclo completo con un mismo equipo, no una fase aislada.
- Ser honesto sobre qué es IA real vs. automatización asistida por palabras clave (ej. Luci).
- Cada afirmación del sitio debe ser verificable, no marketing vacío.

## Accessibility & Inclusion

No se estableció un requisito específico más allá de las prácticas ya presentes en el sitio (skip-link, alt text, contraste, `prefers-reduced-motion`).
