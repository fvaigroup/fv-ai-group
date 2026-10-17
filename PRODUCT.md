# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Dueños y directivos de empresas con estructura en Venezuela (la parte ⬡ del sitio: `/servicios`, `/ejecutivos` y los productos ⬡): quieren ver en qué se va la plata de su empresa, ordenar sus números y reportes y usar IA en finanzas y gestión; muchos evalúan o ya usan Odoo Community o Dynamics 365 Sales/Customer Service. Ver «Cliente ideal de la Hexagonal».

Negocios pequeños y personas (talleres, gomeras, panaderías, peluquerías, consultorios, restaurantes, bodegones, tiendas; profesionales y estudiantes) que compran productos de precio publicado por WhatsApp, casi siempre desde el teléfono (la parte ▲ del sitio: `/productos`).

## Product Purpose

F&V AI Group hace consultoría financiera con IA para dueños (diagnóstico, formación ejecutiva y asesor financiero), implementa a medida tableros, reportes, automatizaciones, Odoo Community y Dynamics 365 Sales/Customer Service, vende software por mensualidad (Club, Condominio y Gym) y productos listos para negocios pequeños, y capacita equipos para que la inversión no quede subutilizada.

## Positioning

Independiente de proveedor (no atado a un solo fabricante) y de ciclo completo con un mismo equipo (diagnóstico → implementación → formación → soporte), a diferencia de subcontratar cada fase por separado. En lo ⬡ habla de resultados de negocio (margen, costos, reportes, indicadores), no de tecnología.

## Arquitectura del sitio: Servicios y Productos

Esta sección es el punto de partida para quien llegue al proyecto de cero (persona o sesión de IA). Resume cómo está organizado el sitio; el detalle de cada regla está en las secciones siguientes y el cómo-se-construye, en `README.md`.

### La regla: servicio o producto

El sitio se organiza por **Servicios** y **Productos**, no por línea.

- **Servicio:** el equipo de F&V trabaja con usted, en su empresa o con su equipo. Hoy son 19 y todos son ⬡.
- **Producto:** listo para usar, con el mismo precio y la misma entrega para todos. Hoy son 15, ⬡ y ▲.

**Tener precio fijo no define a un producto.** Hay servicios con precio fijo: el Diagnóstico ($270), la Formación ejecutiva ($960) y el Asesor financiero ($120 o $480 al mes). Lo que define a un servicio es que el equipo trabaja con el cliente. Un curso o taller con fecha y cupo es un producto; una formación privada o a la medida es un servicio.

### Categorías

La fuente única es `data/catalogo.json` (reglas en `data/ESQUEMA.md`). El id de la categoría es también el ancla de la página (`/servicios#diagnostico`).

| Tipo | Ruta | Categorías (id) |
|---|---|---|
| Servicios (19) | `/servicios` | Diagnóstico y consultoría (`diagnostico`) · Implementación y automatización (`implementacion`) · Formación (`formacion`) · Acompañamiento y asesoría (`acompanamiento`) |
| Productos (15) | `/productos` | Software (`software`) · Cursos y programas (`cursos`) · Para empezar (`para-empezar`) · Presencia y web (`presencia`) · Control y finanzas (`control`) · Ventas y atención (`ventas`) |

Cada ítem tiene una página de detalle: 23 las genera el build desde una plantilla común (`/servicios/<id>`, `/productos/<id>`; los 3 niveles de Acompañamiento comparten `/servicios/acompanamiento`) y las demás son páginas que ya existían y hacen de detalle de su ítem: `/club`, `/condominio`, `/gym` (cada una sirve a su versión ⬡ y a su versión ▲), `/paginas-web` (Presencia), `/curso-finanzas-ia` y `/ejecutivos#programa-ejecutivo`.

### Las dos líneas, por tipo de negocio

Las líneas siguen existiendo, pero ya no organizan el sitio: son una **etiqueta de a quién le habla** cada servicio o producto.

**Se definen por el TIPO DE NEGOCIO u organización y por quién decide la compra, nunca por el precio.** Un negocio pequeño que factura mucho sigue siendo ▲; una empresa grande que pide algo pequeño es ⬡; un club, condominio o gimnasio va según su tipo de organización; si el cliente crece, pasa de línea.

| | ⬡ Hexagonal | ▲ Triangular |
|---|---|---|
| Para quién | Organizaciones con estructura: más de unas 20 personas, varias sedes o una junta o gerencia que aprueba la compra. Medianas y grandes empresas, corporaciones, grupos y franquicias, instituciones (clubes sociales, colegios, universidades, clínicas, cámaras y gremios) y administradoras de condominios | Negocios pequeños donde decide el dueño: personas y profesionales independientes, emprendedores, comercios y microempresas, pequeñas empresas y organizaciones pequeñas (un edificio, un club o gimnasio pequeño) |
| Trato | «usted» | «tú» |
| Colores | cian `#00FFFF` y naranja `#FF8C00` (`.linea-hex`) | verde `#4ade80` y morado `#a855f7` (`.linea-tri`) |
| Forma | ⬡ | ▲ |
| Precios | números redondos, múltiplos de 10 | terminan en ,99 |
| Qué ofrece | servicios y productos | productos (nunca asesoría ni consultoría) |

La **marca madre** F&V (encabezado, pie, inicio, Nosotros, Contacto, Casos, 404) usa cian y naranja, igual que lo ⬡.

### Reglas de presentación

- **La Hexagonal va siempre primero** (arriba o a la izquierda) donde se comparan las dos: es el precio de referencia. En las categorías de `/servicios` y `/productos`, el bloque ⬡ va arriba y el ▲ abajo.
- **Los nombres «Línea Hexagonal» y «Línea Triangular» solo aparecen en el inicio.** En el menú, `/servicios`, `/productos`, las páginas de detalle, los mensajes de WhatsApp, los formularios, el buscador y Luci se usa solo la forma (⬡ ▲), el color y, si hace falta un texto, «Empresas e instituciones» / «Negocios pequeños». Excepción vigente: `terminos.html` (texto legal que se deja intacto hasta que el dueño o su abogado lo revisen). El validador del catálogo y varias pruebas rechazan los nombres de línea fuera del inicio.
- **La asesoría solo existe en lo ⬡.** El Asesor F&V de lo ▲ (sesiones y planes de asesoría para negocios pequeños) fue retirado. El concepto «Express» no existe.
- **Tarjetas cortas, un solo botón.** Cada ítem se muestra en listados, inicio y relacionados como una tarjeta con nombre, forma y color, una frase de 15 palabras o menos, «desde $X» o «A medida», el plazo y **un único botón «Ver detalle»**. Sin WhatsApp en la tarjeta. Se generan en el build desde el catálogo.
- **Detalle desde una plantilla común.** Cabecera con precio y WhatsApp; secciones (qué es, para quién, qué incluye, cómo funciona, opciones y precios, plazo y pago, preguntas, «También te puede servir») **solo si hay contenido real en el catálogo; nunca se inventa**; cierre con WhatsApp.
- **Menú:** Inicio · Servicios ▾ · Productos ▾ · Nosotros · Contacto + «Escríbenos por WhatsApp». Los desplegables son enlace + botón, accesibles con mouse, teclado y toque; en el teléfono, acordeón. Encabezado y pie salen de `partials/`.
- **Registro:** lo ⬡ habla de «usted»; lo ▲ y las partes comunes (inicio, menú, pie, contacto, nosotros), de «tú». Nunca se mezclan en una misma frase o tarjeta.

### Precios, descuentos y pagos

- **Formato:** ⬡ en múltiplos de 10 con punto de miles (`$1.000`); ▲ siempre terminando en ,99 (excepciones: las cuotas $100,00 del curso Finanzas con IA). Lo comprueban `tests/precios.test.js` y el validador.
- **Descuentos publicados (solo dos):**
  1. **30 % por pagar 12 meses por adelantado** un plan mensual (mensual × 12 × 0,70): planes mensuales ▲ y apps de software (Club, Condominio y Gym) de ambas líneas. No aplica a los proyectos ⬡ a medida. Mes a mes, en cuotas o de contado un pago único: sin descuento. ▲ con 2 decimales; ⬡ redondeado al entero (`assets/planes.js`, `tests/planes.test.js`).
  2. **10 % de descuento en el primer pago para el recomendado de un cliente.** A quien recomienda no se le ofrece dinero ni porcentaje: no existe «Refiere y gana». Se publica en el bloque «Recomiéndanos» de `/productos` y en Luci.
- **Implementaciones: «a medida, precio final después del diagnóstico».** Los «desde $X» son solo referencia y siempre llevan esa frase. El **Diagnóstico de $270 se abona al proyecto** si después contrata la implementación (frase obligatoria: «Si después contrata la implementación, los $270 se abonan al proyecto.»).
- **Pago:** precios en dólares; bolívares a la tasa BCV del día, dólares, Pago Móvil y USDT en lo ⬡; en lo ▲, bolívares a la tasa BCV, USDT, Zinli o dólares en efectivo. La fecha o el proyecto se reserva con el 50 % (no se publica «no reembolsable»). Los pagos únicos ▲ pueden ir en 2 o 3 cuotas al mismo precio. Si no se paga la mensualidad, el servicio se pausa hasta ponerse al día.
- **Permanencia mínima:** Presencia (Web y Tienda), 12 meses; Asistente IA de WhatsApp, 6 meses. El resto, sin permanencia.

### Mensajes de WhatsApp

Cada botón de WhatsApp lleva un mensaje ya escrito (`wa.mensaje` del catálogo): empieza con «Hola F&V», nombra el ítem y trae la forma de la línea entre paréntesis, con el precio cuando es fijo: `(⬡, $270)`, `(▲, $39,99/mes)`. Nunca el nombre de la línea. Los ids de producto para la medición (`data-product`) se conservan, por ejemplo `diagnostico-270`.

### Redirecciones y páginas viejas

El sitio anterior se organizaba por línea (`/hexagonal`, `/triangular`, `/software`, `/cursos`, `/asesoria-estrategica`, `/acompanamiento-continuo`, `/despliegue-ejecucion`, `/masterclasses-workshops`). Hoy esas URLs, y `/diagnostico`, `/evaluacion-procesos`, `/habilitacion-equipos`, `/express`, `/triangular-express`, `/soluciones` y `/precios`, redirigen con 301 a `/servicios`, `/productos` o su detalle (lista en `vercel.json`; las anclas viejas las lleva `assets/anclas-viejas.js`). Los ocho archivos viejos siguen en el repositorio, inalcanzables, hasta que el dueño apruebe borrarlos (el build y las pruebas los saltan: lista `LEGACY` en `scripts/build-html.js`).

## Operating Context

Canal principal: WhatsApp. Cada botón lleva el mensaje ya escrito con el nombre del ítem y la forma de su línea, y el formulario de `contacto.html` arma un mensaje de WhatsApp. Empresas: la llamada gratis de 20 minutos con Cal.com («Diagnóstico gratis» en el menú, Contacto y lo ▲; «Consulta gratis de 20 min» en lo ⬡ y `/ejecutivos`, para no confundirla con el Diagnóstico de $270; el evento de medición sigue siendo `diagnostico_gratis`). La puerta de entrada pagada de lo ⬡ es el Diagnóstico de $270. Promesa pública: «te respondemos el mismo día» (lun–vie, 9:00 a.m.–5:00 p.m.). En el inicio, la línea de ayuda para elegir dice: «¿No sabe cuál? Menos de 20 personas: Triangular. Más de 20, varias sedes o junta directiva: Hexagonal.»

## Capabilities and Constraints

Sitio estático (HTML/CSS/JS + Tailwind CLI vía `npm run build`, sin framework), desplegado en Vercel. El build genera `/servicios`, `/productos`, las 23 páginas de detalle, las tarjetas, el encabezado, el pie y el sitemap desde el catálogo y los partials; ver `README.md`. Los montos en bolívares se calculan en vivo con la tasa oficial del BCV (DolarApi); `demo-catalogo.html` es la demo funcional del Catálogo con tasa BCV y sirve de base para entregarlo a cada cliente. El asistente «Luci» es un bot de respuestas por palabras clave (no un modelo de IA real), rotulado honestamente como «Asistente de preguntas frecuentes» en su propio panel.

**Restricción de marcas:** el sitio solo puede mencionar como tecnologías que F&V implementa un listado acotado: Odoo Community y Dynamics 365 Sales/Customer Service (sin SAP, sin «Business Central» y sin otras marcas). No reintroducir otras marcas hasta que el dueño lo confirme.

## Brand Commitments

Marca madre F&V: oscura, cian/naranja, con el hexágono de F&V. Dos líneas, cada una con su propio par de color: ▲ verde `fv-triGreen` + morado `fv-triPurple` y ⬡ cian + naranja. El color depende de la línea donde está el bloque (`.linea-tri` / `.linea-hex`); como la marca madre comparte colores con lo ⬡, cada ítem ⬡ lleva su forma ⬡. Nunca decir «cuatro líneas» ni usar el concepto «Express». Tipografía Space Grotesk (títulos, nav, UI) + Geist (cuerpo). Tono: «Diseñando ecosistemas de IA con humanidad». Guía visual completa en `docs/design-system-fvaigroup.md`.

## Evidence on Hand

Logos reales de clientes integrados en el carrusel del inicio, comprimidos a WebP con la misma apariencia y con los originales conservados. Los testimonios y los casos están preparados pero ocultos (`data-publicado="false"`) hasta tener citas reales con permiso; no fabricar citas de reemplazo ni nombrar clientes que no estén publicados.

## Product Principles

- Vender el ciclo completo con un mismo equipo, no una fase aislada.
- Ser honesto sobre qué es IA real vs. automatización asistida por palabras clave (ej. Luci).
- Cada afirmación del sitio debe ser verificable, no marketing vacío.
- No inventar contenido: si el catálogo no tiene un dato, la página no lo muestra.

## Accessibility & Inclusion

No se estableció un requisito específico más allá de las prácticas ya presentes en el sitio (skip-link, alt text, contraste mínimo 4,5:1, áreas táctiles de 44 px, foco visible, `prefers-reduced-motion`).

---

# Oferta ⬡ (servicios y precios)

Los nombres, precios y mensajes de WhatsApp son idénticos en todo el sitio (inicio, `/servicios`, `/ejecutivos`, páginas de detalle, Luci y buscador); la fuente es `data/catalogo.json`.

## Cliente ideal de la Hexagonal

Dueños y directivos de empresas que facturan entre $20.000 y $100.000 al mes: transporte, distribuidoras, mayoristas, constructoras, clínicas y agroindustria. Tienen entre 40 y 65 años, saben de finanzas pero no son técnicos, viven en WhatsApp desde el teléfono y deciden rápido. Quieren todo **entre semana en la mañana** (los sábados no les sirven), valoran la atención personal y llegan por anuncios de Meta (destino: `/ejecutivos`). Por eso, en lo ⬡: «usted», resultados de negocio (margen, costos, reportes, indicadores) en vez de jerga, texto de cuerpo a 18 px (`.hex-legible`) y menos brillos.

## Servicios

| Servicio | Precio | Dónde |
|---|---|---|
| **Diagnóstico** «¿En qué se va la plata de su empresa?»: un día presencial en la empresa, revisión de números y reportes, informe escrito de dónde se pierde el dinero y plan de acción de 30 días | $270 (se abona al proyecto) | `/servicios/diagnostico` (`/diagnostico` y `/asesoria-estrategica` redirigen aquí) |
| **Implementación y automatización:** Tablero Gerencial, Reportes automáticos por WhatsApp, Conciliación Automática, Web Corporativa + CRM, Agente de IA a medida, Sprint de Automatización, Implementación Odoo Community, Ecosistema de Automatización, Dynamics 365 Sales / Customer Service y Desarrollo a medida (10 servicios) | a medida; «desde $X» solo como referencia, con «precio final después del diagnóstico» | `/servicios/<id>` |
| **Formación ejecutiva 1 a 1:** 8 sesiones de 4 horas de IA aplicada a finanzas y gestión (Claude, reportes, automatizaciones, MCP y APIs explicados para dueños) | $960 | `/servicios/formacion-ejecutiva`, `/ejecutivos#formacion-ejecutiva` |
| **Formación para su equipo** (antes «Habilitación de equipos») | a medida | `/servicios/formacion-equipo` |
| **Masterclass privada** (3 horas, hasta 8 personas) | $500 a $700 por sesión | `/servicios/masterclass-privada` |
| **Finanzas con IA en su sede** (2 sesiones) | $600 por grupo de hasta 6 | `/servicios/finanzas-ia-sede` |
| **Asesor financiero con IA:** KPIs, márgenes, alertas y reportes cortos por WhatsApp, para las finanzas y decisiones del dueño | $120 al mes (1 reunión de hasta 4 h) o $480 al mes (1 reunión semanal de hasta 4 h) | `/servicios/asesor-financiero` |
| **Acompañamiento Continuo:** soporte técnico de sistemas y automatizaciones ya implementados (distinto del Asesor financiero), en 3 niveles | Estándar $200 · Prioritario $400 · Director de IA a tiempo parcial $600, al mes | `/servicios/acompanamiento` |

## Productos ⬡

| Producto | Precio | Dónde |
|---|---|---|
| **Programa ejecutivo entre semana:** martes y jueves en la mañana, 10 horas (2 días de 5), en la oficina de Torre Trébol; privado o grupo pequeño, refrigerio, diploma, estacionamiento | $270 individual; $180 por persona en grupo de 2 a 4 | `/ejecutivos#programa-ejecutivo` |
| **Club, Condominio y Gym** (versión institucional) | desde $190/mes | `/club`, `/condominio`, `/gym` |

Notas de la oferta ⬡:
- Los «desde $X» de las implementaciones son **solo referencia** y siempre van con la frase exacta «precio final después del diagnóstico» (lo comprueba el validador del catálogo).
- Dejaron de existir como productos: Asesoría Estratégica ($150), Evaluación de Procesos ($400) y Habilitación de equipos ($60 por persona). La «Evaluación de procesos» queda como una etapa del método, a medida, sin precio propio.
- Sin descuento en los proyectos a medida.

## Productos ▲

| Producto | Precio | Dónde |
|---|---|---|
| **Plan Arranque** (activo en 72 h) | $39,99/mes | `/productos/plan-arranque` |
| **Mis Finanzas Claras** (hoja personal de cuentas, pago único) | $4,99 | `/productos/mis-finanzas-claras` |
| **Presencia** (Básico, Catálogo, Web, Tienda) | $14,99 · $29,99 · $59,99 · $99,99 al mes | `/paginas-web` |
| **Caja Clara** (Caja, Caja y cobros, Administración completa) | $14,99 · $29,99 · $39,99 al mes | `/productos/caja-clara` |
| **Tablero Ejecutivo** (Pyme, Pro) | $79,99 · $149,99 al mes | `/productos/tablero-ejecutivo` |
| **Asistente IA de WhatsApp** (WhatsApp; WhatsApp + Instagram) | $119,99 · $179,99 al mes | `/productos/asistente-ia` |
| **Taller «La plata de tu negocio clara»** (3 horas presenciales en Valencia) | $24,99 | `/productos/taller-plata-clara` |
| **Finanzas con IA** (curso de 3 sábados presenciales en Valencia) | $299,99 en $100,00 + $100,00 + $99,99 | `/curso-finanzas-ia` |
| **Club, Condominio y Gym** (organizaciones pequeñas) | desde $89,99/mes | `/club`, `/condominio`, `/gym` |

Las fechas, cohortes y cupos de talleres y cursos salen de `assets/eventos.js` (se comparan con el día en Venezuela); cuando no queda ninguna fecha, las páginas dicen «Próximas fechas: escríbenos por WhatsApp».

---

# Software: Club, Condominio y Gym

Tres apps web por mensualidad, cada una con su página, su identidad y sus planes. **Nunca se mezclan en un mismo texto o tarjeta** (no existe «clubes y condominios»); cada página habla solo de su producto. En el catálogo hay seis ítems (cada app en su versión ⬡ y su versión ▲), con la misma página de detalle para las dos.

- **Páginas:** `/club` (verde profundo `#14532d`, verde medio `#1f7a4d`, dorado `#c9a227` y crema `#faf7f0`; tokens `club-*` en `tailwind.config.js`), `/condominio` (azul petróleo `#0f4c5c`, verde menta `#2a9d8f` y arena `#f4f1ea`) y `/gym` (grafito `#111827`, rojo energía `#ef4444` y gris claro `#e5e7eb`; los botones rellenos usan `#dc2626` por contraste AA). Estilos compartidos: `assets/producto.css` y `assets/software-planes.css`; comportamiento compartido: `assets/producto.js` (pestañas y calculadora). `/condominio` y `/gym` llevan maquetas HTML/CSS (no capturas) rotuladas «Ejemplo ilustrativo»; `/club` usa capturas de la demo con un club ficticio («Club Campestre de Ejemplo»).
- **Identidad propia:** el cian/naranja y el verde/morado de las líneas **no** son colores del producto: solo aparecen en las insignias de línea de cada plan.
- **Una sola tabla de precios:** `assets/precios-software.js`, por usuarios (socios, unidades o miembros). ⬡: hasta 500 $190 · hasta 1.000 $250 · hasta 2.500 $430 · hasta 5.000 $740 · más de 5.000 a medida; implementación $300 (hasta 1.000) y $500 (hasta 5.000); incluye marca completa, dominio propio opcional, capacitación presencial, reunión mensual con la junta (o la administradora o la gerencia), soporte prioritario con respuesta el mismo día y comunicados con la imagen de la organización. ▲: hasta 100 $89,99 · hasta 300 $119,99 · hasta 500 $189,99; implementación $99,99 en 2 cuotas; incluye la app con el logo y soporte por WhatsApp. Todos incluyen app para los usuarios, panel de administración, recibos y avisos por correo, hasta 3 mensajes de WhatsApp por usuario al mes, reportes y copias de seguridad diarias. Los planes se nombran por tamaño («Hasta 500 socios»), nunca con nombres inventados. Descuento de 30 % por 12 meses por adelantado.
- **Cómo se publica un cambio de precio:** editar solo `assets/precios-software.js`, correr `node scripts/render-planes.js` (reescribe los bloques de planes de las tres páginas) y `node tests/software.test.js`.
- **Planes por línea en cada página:** bloque `#hexagonal` PRIMERO y bloque `#triangular`, cada uno con su interruptor «Mensual | Anual (30 % de descuento)». Tono: «usted» en los bloques ⬡ y «tú» en los ▲.
- **Dirección propia por organización:** club.fvaigroup.com/su-club, condominio.fvaigroup.com/su-edificio y gym.fvaigroup.com/su-gym, con acceso por correo o cédula y un código por correo o WhatsApp; lo ⬡ puede usar su propio dominio. Si la organización ya tiene página, se le agrega el botón de portal; si no, se le hace una (Web Corporativa, ⬡; Presencia, ▲).
- **Calculadora (en las tres páginas):** pregunta si tiene junta directiva y administración propia (sí → ⬡, no → ▲) y el número de usuarios; con más de 500 sin junta pasa a ⬡ y con más de 5.000 es a medida.
- **Honestidad (Club):** el producto está en lanzamiento. No hay clientes, logos, testimonios ni cifras de uso. Las capturas son de la demo y dicen «Ejemplo ilustrativo». No se nombra a ningún club real. Las horas de cobranza ahorradas son una estimación explicada (2 minutos por socio al mes). La banda «Clientes fundadores» de `/club` está en el HTML con `hidden`.

---

# /ejecutivos

Página para dueños y directivos, destino de los anuncios de Meta (no está en el menú; se enlaza desde el pie y el inicio). Todo en «usted», dentro de `.linea-hex` con `.hex-legible` en cada sección, botones grandes de 56 px y sin constelación ni efectos de cursor. Secciones: portada, para quién, qué logra, las 4 ofertas (Diagnóstico, Programa ejecutivo, Formación ejecutiva y Asesor financiero), cómo es (con el mapa de Torre Trébol), quién lo dicta, testimonio (listo y oculto con `data-publicado="false"` hasta tener uno real con permiso), preguntas frecuentes y cierre. El inicio tiene además la sección `#duenos` («Para dueños de empresa»), corta, con el mismo enfoque. Los fundadores que aparecen en el sitio son Ricardo Freitas y Cristhian Vargas.
