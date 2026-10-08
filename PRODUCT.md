# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Empresas medianas en Venezuela que evalúan o ya usan Odoo Community o Dynamics 365 Sales/Customer Service, buscando auditoría, implementación, capacitación y soporte continuo, con integración de IA sobre sus flujos existentes (público principal de la portada y de la Línea Hexagonal).

Negocios pequeños y personas (talleres, gomeras, panaderías, peluquerías, consultorios, restaurantes, bodegones, tiendas; profesionales y estudiantes) que compran productos Express de precio fijo por WhatsApp, casi siempre desde el teléfono (página `express.html`).

## Product Purpose

F&V AI Group audita procesos, implementa Odoo Community y Dynamics 365 Sales/Customer Service, integra IA en flujos ya existentes, y capacita equipos para que la inversión no quede subutilizada.

## Positioning

Independiente de proveedor (no atado a un solo fabricante) y de ciclo completo con un mismo equipo (auditoría → implementación → capacitación → soporte), a diferencia de subcontratar cada fase por separado.

## Operating Context

Dos líneas de servicio: Hexágono (High-Ticket, ecosistema completo) y Triángulo (Mid-Ticket: sprints acotados, el curso Finanzas con IA y los productos Express de precio fijo — Negocio Visible, Catálogo Express, Caja Clara, Asistente IA de WhatsApp, Clase 1:1 de IA, Mis Finanzas Claras; Redes al Día en lista de espera). Precios publicados en `precios.html` (Línea Triangular primero). Canal principal: WhatsApp — cada botón de producto lleva el mensaje ya escrito con el nombre del producto, y el formulario de `contacto.html` arma un mensaje de WhatsApp en vez de abrir el correo del visitante. Promesa pública: "te respondemos el mismo día" (lun–vie, 9:00 a.m.–5:00 p.m.).

## Capabilities and Constraints

Sitio estático (HTML/CSS/JS + Tailwind CLI vía `npm run build`, sin framework), desplegado en Vercel. Los montos en bolívares se calculan en vivo con la tasa oficial del BCV (DolarApi); `demo-catalogo.html` es la demo funcional del Catálogo Express y sirve de base para entregarlo a cada cliente. El asistente "Luci" es un bot de respuestas por palabras clave (no un modelo de IA real) — ya rotulado honestamente como "Asistente de preguntas frecuentes" en su propio panel.

**Restricción temporal (partnership pendiente):** mientras el usuario tramita el partnership gratuito con Odoo, Zoho, Microsoft, Google, Salesforce y monday.com, el sitio solo puede mencionar como tecnologías/servicios que F&V implementa un listado acotado (sin SAP, sin "Business Central" específicamente, y con Odoo/Dynamics 365 acotados a "Odoo Community"/"Dynamics 365 Sales/Customer Service"). No reintroducir SAP ni otras marcas fuera de ese listado hasta que el usuario confirme que ya tiene el partnership correspondiente.

## Brand Commitments

Identidad oscura cian/naranja (línea Hexágono, y color base de todo el sitio) más verde/púrpura (línea Triángulo, exclusivo — `fv-triGreen`/`fv-triPurple`). Tipografía Space Grotesk (títulos, nav, UI) + Geist (cuerpo). Emblema hexagonal animado. Tono: "Diseñando ecosistemas de IA con humanidad".

## Evidence on Hand

Logos reales de clientes ya integrados en el carrusel (Licorway, Killjoy, Natural Sweet, Casa del Mocho). Testimonios reales existen pero el usuario aún no los ha cargado en el sitio — la sección permanece en placeholder a propósito; no fabricar citas de reemplazo.

## Product Principles

- Vender el ciclo completo con un mismo equipo, no una fase aislada.
- Ser honesto sobre qué es IA real vs. automatización asistida por palabras clave (ej. Luci).
- Cada afirmación del sitio debe ser verificable, no marketing vacío.

## Accessibility & Inclusion

No se estableció un requisito específico más allá de las prácticas ya presentes en el sitio (skip-link, alt text, contraste, `prefers-reduced-motion`).
