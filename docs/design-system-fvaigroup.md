# Sistema de Diseño — F&V AI Group (fvaigroup.com)

> Guía de estilo de fvaigroup.com, hecha a partir del código y los estilos actuales (`src/tailwind.css`, `tailwind.config.js`, los generadores de `scripts/catalogo/` y los partials). Sirve para construir o actualizar cualquier página manteniendo consistencia visual. Las secciones 1 a 5 son los fundamentos (tipografía, color, layout, componentes base y personalidad); de la 6 en adelante están los componentes del sitio organizado por Servicios y Productos: color por línea, tarjeta corta, menú, páginas de detalle, listados, inicio y legibilidad Hexagonal. Las reglas de contenido y precios están en `PRODUCT.md`.

---

## 1. Sistema Tipográfico

**Familias tipográficas** (definidas en `tailwind.config.js`, cargadas vía Google Fonts):

| Token Tailwind | Fuente | Uso |
|---|---|---|
| `font-sans` / `font-display` | **Geist** (peso 300–800) | Titulares (H1/H2/H3), cuerpo de texto general |
| `font-head` | **Space Grotesk** (400–700) | Microcopy: labels, badges, botones, navegación, kickers, cifras destacadas |

Esta combinación transmite un tono **técnico pero legible**: Geist da limpieza y neutralidad al cuerpo, mientras Space Grotesk aporta un carácter geométrico/futurista a los elementos de interfaz (nav, botones, badges), reforzando el posicionamiento de la marca como consultora tecnológica.

**Jerarquía y escala:**

- **H1** (solo en hero): `text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]` — el salto de escala entre mobile y desktop es agresivo (36px → 60px), buscando máximo impacto en el primer scroll. Siempre en mayúsculas o con `uppercase`, y casi siempre con un fragmento resaltado en `shimmer-text` (degradado animado cian→naranja).
- **H2** (título de sección): `text-3xl sm:text-4xl font-semibold uppercase tracking-tight text-balance` — consistente en *todas* las secciones del home. Nunca `font-bold`/`extrabold` como el H1: la diferencia de peso (`semibold` vs `extrabold`) es lo que separa jerárquicamente el hero del resto.
- **H3** (subtítulo de tarjeta/paso): `text-lg`–`text-2xl font-semibold`, sin uppercase — marca un tercer escalón más conversacional.
- **Cuerpo de texto**: `text-slate-400` como color base para párrafos, `leading-relaxed`, tamaño `text-base`/`text-lg` según contexto. El cuerpo nunca es blanco puro — el blanco (`text-white`) se reserva para títulos y para palabras que se quieren enfatizar dentro de un párrafo gris.
- **Microcopy**: `text-xs`/`text-[10px]`/`text-[11px]` en `font-head`, con `uppercase tracking-wider` — usado en badges ("Cohorte en formación"), etiquetas de columna (Antes/Durante/Después) y pies de tarjeta.

**Contraste de escala:** el sitio usa solo 3–4 tamaños reales (H1, H2, cuerpo, microcopy) en vez de una escala tipográfica extensa — es deliberadamente plano, lo que da consistencia pero exige que el contraste de *peso* y *color* (blanco vs. slate-400 vs. cian/naranja) haga el trabajo de jerarquía que normalmente haría el tamaño.

**Tono transmitido:** corporativo-técnico con toques de urgencia comercial. Los títulos en mayúsculas + tracking ajustado leen como titulares de producto SaaS; el `shimmer-text` animado en fragmentos clave introduce una capa "premium/IA" sin caer en tipografías decorativas.

---

## 2. Paleta de Color y Contraste

Definida en `tailwind.config.js` bajo el namespace `fv`:

| Token | Hex | Rol |
|---|---|---|
| `fv-black` | `#000000` | Fondo base de `html`/`body` y footer |
| `fv-surface` | `#0D0E12` | Fondo de tarjetas y contenedores elevados |
| `fv-surface2` | `#121319` | Fondo alterno de secciones (franjas `bg-fv-surface2/40` para separar ritmo visual) |
| `fv-border` | `#1F232B` | Bordes de tarjetas, `<details>`, inputs |
| `fv-cyan` | `#00FFFF` | **Acento primario 1** — marca madre y ⬡ Hexagonal |
| `fv-cyanMid` | `#00CCFF` | Variante de cian para glows/blobs de fondo |
| `fv-orange` | `#FF8C00` | **Acento primario 2** — CTA principal; marca madre y ⬡ Hexagonal |
| `fv-orangeWarm` | `#FF4500` | Variante cálida para glow del botón primario |
| `fv-gold` | `#FFBF00` | Punto medio del degradado `shimmer-text` |
| `fv-triGreen` / `fv-triPurple` | `#4ade80` / `#a855f7` | **Acento secundario formal** — exclusivo de ▲ Triangular (negocios pequeños), para diferenciarla visualmente de ⬡ sin salirse del sistema |

**Estructura cromática:** fondo casi negro (`#000`) en todo el sitio, con dos pares de acento neón que nunca se usan como fondo sólido, solo como: texto (`shimmer-text`, `text-fv-cyan`), bordes con opacidad (`border-fv-cyan/30`), glows (`box-shadow` con `rgba` de cian/naranja) y rellenos muy tenues (`bg-fv-cyan/10`).

**Cómo guía el ojo:**
- El **naranja** es el color de la acción (`btn-primary` = fondo naranja sólido + glow). Es el único color que aparece como *fill* grande en la interfaz — reservado casi exclusivamente para el CTA de conversión más importante de cada sección.
- El **cian** es el color informativo/secundario — bordes de hover, iconos de "checks" positivos, badges de estado, subtítulos de sección alternos.
- El **degradado cian→naranja** (`shimmer-text`, `box-gradient-border`) marca los puntos de máxima jerarquía: el fragmento más importante de cada H1/H2 y los contenedores de cierre (CTA final, tarjeta de precio).
- El **par verde/violeta** (`triGreen`/`triPurple`) funciona como un "sub-brand" cromático: en cuanto aparece, comunica que el bloque es de ▲ Triangular (negocios pequeños, productos de precio publicado) sin que el usuario necesite leer texto para notar la diferencia frente a ⬡ y la marca madre (cian/naranja).
- El contraste es alto por diseño (texto claro sobre fondo casi negro), típico de un sitio "dark-mode-first" — no hay versión clara del sitio.

---

## 3. Composición, Layout y Espaciado

- **Contenedor:** `max-w-7xl mx-auto px-6 lg:px-8` es el ancho estándar de sección; secciones de lectura (hero, FAQ, texto largo) usan contenedores más angostos (`max-w-4xl`, `max-w-3xl`, `max-w-2xl`) para controlar la longitud de línea.
- **Ritmo vertical:** cada `<section>` usa `py-24` o `py-28`, separadas por `border-t border-white/5`. La alternancia de fondo `bg-fv-surface2/40` en secciones pares crea "franjas" sin necesitar líneas divisorias fuertes — el espaciado y el cambio sutil de fondo hacen la separación, no bordes marcados.
- **Grid:** predominan grids de 1 a 3 columnas (`grid-cols-1 md:grid-cols-3`, `lg:grid-cols-2`, `lg:grid-cols-6` para el grid de plataformas). El layout responde en mobile-first: todo colapsa a una columna antes de `sm`/`lg`.
- **Densidad de información:** media-baja. Cada tarjeta rara vez tiene más de un título + 1–2 líneas de cuerpo + un ícono; las listas de bullets usan íconos de check en vez de texto denso. El sitio prioriza aire (`gap-6`–`gap-12`, `space-y-14` en la timeline) sobre comprimir contenido.
- **Espacio en blanco:** generoso en los márgenes de sección (`mb-12`–`mb-14` entre encabezado de sección y contenido) y en el padding interno de tarjetas (`p-6`–`p-10`). El hero usa el mayor espacio en blanco vertical (`pt-40 pb-20`) para que el H1 respire antes del scroll.
- **Patrón recurrente "encabezado de sección + contenido":** casi todas las secciones siguen la misma fórmula: `<div class="reveal max-w-2xl mb-12"><h2>…</h2><p class="text-slate-400 mt-4">…</p></div>` seguido del contenido específico (grid, tabs, timeline, cards). Esta repetición es clave para que una página nueva "se sienta del mismo sitio".

---

## 4. Elementos UI y Componentes

- **Botones:**
  - `.btn-primary` — fondo naranja sólido, texto negro, glow multicapa (`box-shadow` con 3 radios), `:active` con `scale(0.96)`. Es el único botón "lleno" del sistema — reservado para la acción de mayor prioridad.
  - `.btn-secondary` — fondo translúcido blanco (`bg-white/5`), borde blanco tenue, hover vira a cian (borde + fondo + glow cian). Es la acción secundaria/alternativa junto a un primario.
  - `.btn-glow-on-hover` — modificador que añade el glow naranja recién al hacer hover (en vez de en reposo), usado en CTAs de header/nav para no saturar visualmente zonas persistentes en pantalla.
  - Todos los botones comparten el mismo patrón de interacción: `transition` sincronizada de color/fondo/borde (`--transition-base`), y un `:active { scale(0.96) }` como feedback táctil consistente.
- **Tarjetas:** fondo `bg-fv-surface`, borde `border-fv-border`, radios `rounded-lg`/`rounded-xl`. Variantes de "glow de reposo" (`box-glow-cyan`, `box-glow-orange`) para tarjetas destacadas sin necesitar hover, y `card-lift-cyan`/`card-hover-hex`/`card-hover-tri` para el efecto de elevación + glow al pasar el mouse.
- **Iconos:** SVG inline, estilo *outline* consistente (`stroke-width` 1.5–2, `viewBox 0 0 24 24`, sin relleno salvo excepciones puntuales como el ícono de WhatsApp). El tamaño estándar es `w-4 h-4` a `w-5 h-5` para iconos inline, `w-11 h-11`/`w-14 h-14` para contenedores de ícono con fondo (círculo o `rounded-lg` con `bg-{color}/10` + `border-{color}/30`). El color del ícono siempre coincide con el acento de su tarjeta/grupo (cian u naranja), reforzando la codificación cromática.
- **Separadores:** `border-t border-white/5` entre secciones — extremadamente sutiles, casi invisibles, dejan que el espaciado haga el trabajo visual.
- **Badges/pills:** `inline-block text-[11px] font-head font-semibold px-3 py-1.5 rounded-full border` con fondo y texto del color de acento al 10%/100% respectivamente (`bg-fv-orange/10 text-fv-orange border-fv-orange/30`) — patrón repetido para etiquetas de estado ("Cohorte en formación", "Taller · 3 horas", "Para dueños de empresa").
- **Interactividad:** los componentes comunican estado mediante color + glow, nunca solo con cambio de forma. Un tab activo, un botón en hover y un input en foco todos "se iluminan" en cian u naranja — es la firma táctil del sitio.

---

## 5. Personalidad de Marca

**Arquetipo estético: tecnológico-nocturno con acabado "premium SaaS".** El fondo negro absoluto, los glows neón cian/naranja y las animaciones sutiles (shimmer de texto, partículas de fondo, cursor con estela) sitúan a F&V AI Group más cerca de un producto de software/IA de vanguardia que de una consultora tradicional — es una decisión deliberada para diferenciarse de competidores de ERP/consultoría que suelen usar estética corporativa clásica (azules corporativos, fondos blancos, sans-serif neutra).

Al mismo tiempo, el sitio se mantiene **sobrio en la estructura**: tipografía limitada a 2 familias, paleta de color acotada a un fondo + 2 pares de acento, y componentes muy repetidos sección a sección. Esto evita que la estética "neón" se sienta caótica o poco profesional — el orden estructural (grids, espaciado, jerarquía tipográfica constante) es lo que permite que el llamativo lenguaje visual funcione en un contexto B2B.

En resumen: **vanguardista en superficie (color, glow, motion), corporativo/metódico en estructura** — coherente con el mensaje de la marca de traer IA de punta a procesos empresariales tradicionales (ERP, finanzas, operaciones).

---

## 6. Color por línea

El sitio se organiza por **Servicios y Productos**; las dos líneas son una etiqueta de a quién le habla cada ítem y se definen por el tipo de negocio, no por el precio (ver `PRODUCT.md`). El color depende de **la línea donde está el bloque**, no del componente: se envuelve el bloque con `.linea-hex` o `.linea-tri` y todo lo de adentro se re-colorea solo.

| Envolvente | Par de acento | Forma | Hover de tarjetas | Botón principal | Trato |
|---|---|---|---|---|---|
| `.linea-hex` ⬡ | cian `#00FFFF` + naranja `#FF8C00` | hexágono (`.nav-hex`) | cian | naranja lleno | «usted» |
| `.linea-tri` ▲ | verde `#4ade80` + morado `#a855f7` | triángulo (`.nav-tri`) | morado | verde lleno | «tú» |
| (sin envolvente) marca madre: encabezado, pie, inicio, Nosotros, Contacto, Casos, 404 | cian + naranja (igual que `.linea-hex`) | hexágono de F&V | cian | naranja lleno | «tú» |

Variables que fija cada envolvente (en `src/tailwind.css`): `--acento-1`, `--acento-2`, `--acento-1-rgb`, `--acento-2-rgb`, `--brillo-rgb` (brillo al pasar el mouse), `--cta` y `--cta-rgb` (botón principal).

**Componentes que resuelven solos según la envolvente:** `.x-card` (+ `.is-featured`, `.is-static`, `.is-help`), `.tarjeta`, `.x-faq[open]`, `.card-lift`, `.texto-linea` (▲: degradado estático verde→morado; ⬡ y marca madre: degradado animado cian→dorado→naranja), `.btn-linea` y `.btn-linea-sec`, `.box-glow-tri`, `.det-*` y `.lst-*`.

**Cuándo usar cada color**
- Un ítem ⬡ (todos los servicios y los productos ⬡) va dentro de `.linea-hex`; un ítem ▲, dentro de `.linea-tri`. Si un bloque mezcla los dos (el inicio, los listados), cada tarjeta lleva su propia envolvente.
- Ningún bloque ▲ usa cian ni naranja por dentro, y ningún bloque ⬡ usa verde ni morado (excepciones: el ícono de WhatsApp, el encabezado y el pie).
- En bloques nuevos usar `.btn-linea` y `.texto-linea`. `.btn-tri`, `.btn-primary`, `.text-gradient-tri` y `.shimmer-text` siguen existiendo (`.btn-primary` naranja es el CTA de la marca madre y de lo ⬡; `.text-gradient-tri` es el degradado verde→morado fijo).
- El CTA secundario de ▲ es un contorno morado; el de ⬡ y la marca madre, cian (`.btn-linea-sec`).

**La forma, siempre con el color.** Cada línea lleva su forma (`.nav-forma.nav-hex` ⬡, `.nav-forma.nav-tri` ▲), que sale de una máscara SVG: nunca se distingue una línea solo por el color. Las formas aparecen en las tarjetas, el menú, el pie, los encabezados de bloque de los listados y las etiquetas de los detalles. **Los nombres «Línea Hexagonal» y «Línea Triangular» solo se escriben en el inicio** (y en el texto legal); en lo demás, la forma, el color y, si hace falta texto, «Empresas e instituciones» / «Negocios pequeños».

**Insignias (texto + forma, nunca solo color):** `<span class="ins ins-hex"><span>Para dueños de empresa</span></span>` (borde cian, texto en degradado cian→naranja) y `<span class="ins ins-tri"><span>Negocios pequeños</span></span>` (borde verde, texto en degradado verde→morado). El plazo y las etiquetas de formato («Taller · 3 horas») van como texto normal; no existen insignias de velocidad.

### Componentes de ▲ heredados

- **CTA principal:** `.btn-tri`: fondo `fv-triGreen` lleno, texto negro, glow verde que vira a violeta en hover y `:active { scale(0.97) }`.
- **Precios en bolívares en vivo:** los montos en Bs se calculan en el navegador con la tasa oficial del BCV (`https://ve.dolarapi.com/v1/dolares/oficial`, permitida en la CSP de `vercel.json`). Marcado: contenedor con clase `hidden` + `data-bs-wrap`, monto con `data-usd="35"`, tasa con `data-bcv-rate` (`assets/bcv.js`). Si la API no responde, los montos en Bs no aparecen y el texto sigue leyéndose bien. No usar el atributo `hidden` junto a clases de `display`: se usa la clase `hidden` y el script la quita.
- **Botones de WhatsApp:** mensaje ya escrito (en el catálogo, `wa.mensaje`) y atributos `data-product` / `data-cta`, que `assets/medicion.js` envía a GA4 como `whatsapp_click`. Cualquier otro clic que se quiera medir lleva `data-evento="nombre"` (ver `README-MEDICION.md`).
- **Selector de tamaño (`.tam-tab`) y pago adelantado:** pestañas con `role="tab"` y el cálculo de `assets/planes.js`. Hoy solo lo usan las páginas viejas; el contenido nuevo muestra los tamaños como `.det-plan` en el detalle (sección 9).

---

## 7. Tarjeta corta (`.tarjeta`)

Una tarjeta por servicio o producto, generada en el build desde `data/catalogo.json` (`scripts/catalogo/tarjetas.js`). Se usa en `/servicios`, `/productos`, el inicio y «También te puede servir» de los detalles. **No se escribe a mano**: se pide con un marcador y el build la rellena.

```html
<!-- tarjetas:inicio ids="diagnostico,asesor-financiero" cols="4" nivel="3" -->
<!-- tarjetas:fin -->
```

**Estructura (clases reales):**

```
article.tarjeta.x-card.linea-hex|linea-tri [.hex-legible]   data-item, data-linea, aria-labelledby
  .tarjeta-cuerpo
    span.tarjeta-forma.nav-forma.nav-hex|nav-tri   (role="img", aria-label con la leyenda de la línea)
    h2–h6.tarjeta-nombre                             (nivel con nivel="…", por defecto h3)
    p.tarjeta-frase                                  (15 palabras o menos)
  .tarjeta-pie
    .tarjeta-precio  > .tarjeta-desde, .tarjeta-monto (+ .tarjeta-monto-texto para «A medida»), .tarjeta-periodo, .tarjeta-mes
    .tarjeta-referencia / .tarjeta-nota              («Referencia: desde $600», «precio final después del diagnóstico»)
    .tarjeta-plazo                                   (reloj + plazo, si hay)
    a.tarjeta-boton.btn-linea-sec.estado-interactivo «Ver detalle» (data-evento="ver_detalle")
```

**Reglas**
- **Un solo botón, «Ver detalle»**, y ningún enlace a WhatsApp dentro de la tarjeta. El enlace se estira sobre toda la tarjeta (`.tarjeta-boton::after { inset: 0 }`), así que toda la tarjeta es un único destino y no hay enlaces anidados.
- **Contenido:** forma y color, nombre, frase, «desde $X» o «A medida» (con «Referencia: desde $X» debajo cuando es una implementación), plazo si existe y el botón. Sin «Línea Hexagonal/Triangular».
- **Igual alto por fila:** `.tarjetas-rejilla` es una cuadrícula (las celdas se estiran), `.tarjeta` es una columna flex y `.tarjeta-pie` lleva `margin-top: auto`, así que el precio y el botón quedan alineados abajo aunque las frases midan distinto.
- **Rejillas por columnas** (`.tarjetas-rejilla` + `.tarjetas-cols-2|3|4`, atributo `cols`): 1 columna en el teléfono, 2 desde 768 px, y desde 1024 px 3 columnas (`cols="3"` y `cols="4"`); `cols="4"` llega a 4 desde 1280 px. Con `cols="2"` siempre 2 desde 768 px.
- **Estados:** la tarjeta ⬡ lleva borde del acento y sombra oscura al pasar el mouse (sin neón); la ▲ conserva el elevado suave de `.x-card`; el foco del botón dibuja el anillo alrededor de toda la tarjeta; presionada, `scale(0.985)`. Con movimiento reducido no hay desplazamientos.
- **Dónde:** un servicio o producto ⬡ lleva `.hex-legible` (la frase a 18 px); los precios y botones no se agrandan.

---

## 8. Menú desplegable (`partials/header.html`, `assets/menu.js`)

El encabezado sale de `partials/header.html` y se inserta en cada página entre `<!-- header:inicio … -->` y `<!-- header:fin -->`. Menú: Inicio · Servicios ▾ · Productos ▾ · Nosotros · Contacto + «Escríbenos por WhatsApp» (y el buscador). Las categorías salen del catálogo.

**Patrón disclosure, no `role="menu"`.** Servicios y Productos son **un enlace + un botón**: el enlace (`.menu-enlace-principal`) va a `/servicios` o `/productos`; el botón con la flecha (`.menu-chevron`, `data-menu-toggle`, 44 × 44 px) abre el panel y lleva `aria-expanded` y `aria-controls`. El panel (`.menu-panel`) es un contenedor con una lista (`.menu-lista` > `.menu-enlace`) y el enlace «Ver todos los servicios/productos» (`.menu-todos`). En Productos, cada categoría muestra las formas (`.menu-formas`) de las líneas que tiene.

**Estados**
- Abierto: `.menu-grupo.is-open` (la flecha gira 180°; el panel pasa de `opacity: 0; visibility: hidden` a visible en 160 ms). El grupo guarda cómo se abrió en `data-modo`: `hover` (lo abrió el mouse) o `fijo` (clic, teclado o toque); un clic sobre uno abierto por hover lo deja fijo.
- Página actual: `aria-current="page"` (subrayado lleno) en la página exacta; `aria-current="true"` (subrayado atenuado) en el grupo padre de una página de detalle (`hijo="si"` en el marcador, automático en `servicios/` y `productos/`).
- Hover solo con puntero fino (`@media (hover: hover) and (pointer: fine)` y `pointerType === 'mouse'`); la demora de cierre es de 160 ms y un puente invisible sobre el panel evita que se cierre al cruzar.

**Teclado y toque**
- Enter o Espacio en el botón: abre o cierra. Flecha abajo en el botón: abre y lleva el foco al primer enlace. Escape: cierra y devuelve el foco al botón. Al salir el foco del grupo, se cierra. Un clic o toque fuera cierra todos; abrir el buscador (Ctrl K) también. Solo uno abierto a la vez.
- En pantalla táctil el enlace navega y el botón abre (no hay hover).

**Teléfono (menos de 1024 px):** el botón `#menu-btn` abre `#mobile-menu` (`.is-open`); Servicios y Productos son un **acordeón** (`.movil-grupo[data-acordeon]` > `.movil-fila` con enlace + botón, y `.movil-sub` con `.movil-enlace`), uno abierto a la vez. Escape cierra el menú y devuelve el foco al botón; al pasar a escritorio queda cerrado.

**Medición:** al abrir un desplegable o seguir uno de sus enlaces se envía `menu_categoria` (`categoria`: `servicios`, `productos/software`, `servicios/todos`…).

**Cuándo tocarlo:** para cambiar nombres u orden de categorías se edita `tipos.<tipo>.categorias` en `data/catalogo.json` y se corre el build; para cambiar el HTML o los estilos, `partials/header.html` y la sección «Menú: desplegables» de `src/tailwind.css`. Todo el movimiento se apaga con `prefers-reduced-motion`.

---

## 9. Plantilla de detalle (`det-*`)

Las páginas `/servicios/<id>` y `/productos/<id>` las genera `scripts/catalogo/detalle.js` desde `data/catalogo.json`; **no se editan a mano**. Las clases `det-*` viven en la sección «Detalle de servicios y productos» de `src/tailwind.css` y van dentro de la envolvente de la línea (`.linea-hex` o `.linea-tri`); en ⬡ la página entera lleva `.hex-legible` y no hay brillos neón.

**Cabecera (`.det-hero`)**
- Migas (`.det-migas`: Inicio › Servicios › categoría › nombre; la última con `aria-current="page"`), etiqueta de la línea (`.det-chip`: forma + «Empresas e instituciones» / «Negocios pequeños» en palabras simples), título (`h1.det-h1`) y frase (`.det-frase`).
- Tarjeta de precio y contacto (`.det-compra`): precio (`.det-precio`, `.det-monto`, `.det-periodo`, `.det-ref`, `.det-nota-precio`), datos (`.det-dato` con ícono `.det-icono`: plazo, lugar, fechas) y botones (`.det-acciones`): WhatsApp con el mensaje del catálogo y, en los servicios, la consulta gratis de 20 minutos.

**Secciones** (cada una solo si el catálogo tiene contenido real; el orden es fijo)

| Sección (`id`) | Clases | Viene de |
|---|---|---|
| `que-es` / `para-quien` | `.det-prosa`, `.det-checks`, `.det-check` | `contenido.que_es`, `contenido.para_quien` |
| `incluye` | `.det-checks`, `.det-check` | `contenido.incluye` |
| `como-funciona` | `.det-pasos`, `.det-paso`, `.det-num` | `contenido.pasos` |
| `precios` | `.det-planes` (`-1|-2|-3`), `.det-plan`, `.det-plan-precio`, `.det-anual` | `contenido.planes` |
| `plazo-pago` | `.det-info-rejilla`, `.det-info-titulo`, `.det-info-texto` | `contenido.plazo`, `contenido.pago` |
| `bloque-<id>` | `.det-tarjeta`, `.det-nota`, `.det-destacado` | `contenido.bloques` (textos ya publicados) |
| `mas` | libre | `contenido.extra_html` |
| `preguntas` | `.x-faq` (`<details>`) | `contenido.faq` |
| `relacionados` | rejilla de `.tarjeta` | `relacionados` (2 a 3 de la misma categoría, ⬡ primero) |
| `contacto` (cierre) | `.det-cierre`, `.det-paneles`, `.det-panel` | siempre: WhatsApp, forma de pago y horario |

Las páginas compartidas (Acompañamiento) agregan `niveles` (`.det-nivel`, `.det-niveles-lista` como atajos) y `otro-servicio` (`.det-cruce`, el enlace al servicio vecino).

**Reglas:** los títulos usan el trato de la línea («¿Es para usted?» / «¿Es para ti?», «También le puede servir» / «También te puede servir»); los H2 llevan una barra de acento (`.det-h2::before`); el área táctil mínima es de 44 px; una sección sin contenido real no se genera ni se rellena con texto inventado.

---

## 10. Listados de Servicios y Productos (`lst-*`) y sus extras

`/servicios` y `/productos` las genera `scripts/catalogo/listados.js`. Estructura: portada (`.lst-portada`: título, introducción, definición `.lst-def` con la leyenda de formas `.lst-leyenda`, y atajos a las categorías `.lst-chips` > `.lst-chip`), una sección por categoría (`section#<categoria>.lst-cat`, con `.lst-cat-cab`, número `.lst-cat-n` e introducción), y dentro bloques por línea (`.lst-bloques` > `.lst-bloque` con el encabezado `.lst-bloque-cab`: forma + nombre de la línea en palabras simples, y un chip «desde $X» opcional `.lst-bloque-desde`). **El bloque ⬡ va arriba y el ▲ abajo; un bloque sin ítems no se genera.** Al final de la página, `<!-- extra:inicio -->` … `<!-- extra:fin -->`, y el cierre con WhatsApp (`.lst-boton`). En `/servicios` todo va con `.hex-legible`.

**Extras** (HTML a mano en `partials/servicios-extra.html` y `partials/productos-extra.html`, insertado tal cual por el build; no son componentes nuevos: usan las clases compartidas)

| Dónde | Sección | Se usa |
|---|---|---|
| `/servicios` | «Cómo trabajamos» (`#metodologia`): seis etapas en línea de tiempo | `.linea-hex.hex-legible`, `.timeline-spine`, `.card-lift`, `.reveal` |
| `/servicios` | «Detalle técnico» (`#detalle-tecnico`): para el equipo de sistemas; va siempre **al final** | `.linea-hex.hex-legible`, `.card-lift` |
| `/productos` | «¿No sabes cuál elegir?» (`#elige`): cuestionario de hasta 3 preguntas, sin servidor | `.linea-tri`, `.x-card.is-static`, `#quiz` |
| `/productos` | «Míralo funcionando» (`#funcionando`), «Garantía» (`#garantia`), «Cómo pagas» (`#como-pagas`) | `.linea-tri`, `.x-card`, `.lst-bloque-cab` |
| `/productos` | «Preguntas frecuentes» (`#preguntas`) | `.x-faq` (el FAQPage del JSON-LD debe coincidir con las preguntas) |
| `/productos` | «Recomiéndanos» (`#recomendados`) | `.x-card.is-featured.is-static` |

**Cuándo usar cada cosa:** un extra nuevo se agrega al partial del tipo que corresponda, con su envolvente de línea (`.linea-hex` + `.hex-legible` en servicios, `.linea-tri` en productos), título H2 con `.texto-linea` y las clases de arriba; no se crean estilos propios si una clase compartida sirve. `tests/extras.test.js` comprueba que el partial esté insertado tal cual.

---

## 11. Bloques del inicio (`ini-*`)

`index.html` es la única página donde se escriben los nombres «Línea Hexagonal» y «Línea Triangular». Las dos tarjetas de línea comparten estructura y tamaños: lo único que cambia es la envolvente. Secciones, en este orden:

| Sección (`id`) | Clases | Qué es |
|---|---|---|
| `inicio` | `.ini-portada`, `.ini-kicker`, `.ini-h1-cian`, `.ini-h1-naranja`, `.ini-sub`, `.ini-botones`, `.ini-boton`, `.ini-logos-titulo` | Portada con la frase de marca, tres botones y el carrusel de logos |
| `lineas` | `.ini-linea` (+ `.linea-hex` / `.linea-tri`, **Hexagonal primero**), `.ini-linea-cab`, `.ini-forma`, `.ini-linea-nombre`, `.ini-para`, `.ini-etq`, `.ini-ejemplos`, `.ini-encuentra`, `.ini-pie`, `.ini-precio` (`.ini-desde`, `.ini-monto`, `.ini-mes`, `.ini-precio-nota`), `.ini-boton-linea`, `.ini-ayuda` | Las dos líneas, con el precio «desde» sacado del catálogo y la línea de ayuda «¿No sabe cuál?» |
| `servicios-destacados`, `productos-destacados` | `.ini-encab`, `.ini-filas`, rejilla de `.tarjeta`, `.ini-ver-todos`, `.ini-mas` | Tarjetas cortas destacadas (marcadores `tarjetas:inicio`) |
| `duenos` | `.ini-duenos`, `.ini-duenos-frase`, `.ini-botones` | «Para dueños de empresa», corta, hacia `/ejecutivos` (`.linea-hex.hex-legible`) |
| `como-trabajamos` | `.ini-pasos` | Tres pasos |
| `diferencial` | `.ini-razones` | Tres razones |
| `testimonios` | `data-publicado="false"` | Oculto hasta tener citas reales con permiso |
| `proximas-fechas` | — | Fechas de talleres y cursos desde `assets/eventos.js` |
| `faq` | `.ini-faq` | Cinco preguntas (con JSON-LD FAQPage) |
| `cta-final` | — | Cierre por WhatsApp |

**Cuándo usarlos:** solo en el inicio. En otras páginas se usan `.tarjeta` (tarjetas), `.lst-*` (listados) o `.det-*` (detalles). Texto del cuerpo a 18 px en las dos tarjetas de línea, para que midan lo mismo; en el teléfono el orden es texto, ⬡, ▲.

---

## 12. Legibilidad Hexagonal: `.hex-legible`

El cliente ideal de lo ⬡ son dueños y directivos de 40 a 65 años que leen desde el teléfono. Por eso las secciones ⬡ llevan menos brillo y más tamaño de letra. Se define en `src/tailwind.css`, junto al bloque de accesibilidad.

**Qué agranda**
- Los párrafos (`p`), `li` y `dd` del cuerpo dentro del contenedor: **18 px** (`1.125rem`) con interlineado **1,6**.
- Los de gris tenue (`text-slate-400`, `text-slate-500`) pasan a **#e2e8f0** (contraste AA holgado sobre negro). Para texto nuevo, escribir directamente `text-slate-200` (#e2e8f0) o `text-slate-300` (#cbd5e1).
- Los botones de línea (`.btn-linea`) pasan a **brillo suave en reposo** (borde naranja y sombra corta); el brillo completo queda para el hover. Los filtros (`.filtro`) miden 44 px de alto.

**Qué NO agranda** (se salta a propósito)
- Lo que ya trae su tamaño: `text-xs`, `text-sm`, `text-lg`, `text-xl` y mayores, `text-[..]`.
- Lo que usa `font-head` (etiquetas, insignias, botones, kickers) y lo que está dentro de un contenedor `text-xs` o `text-sm`.
- Todo lo que no sea `p`, `li` o `dd`: títulos, `div`, `span`, botones, precios (`.tarjeta-monto`, `.det-monto`), formas y plazos. Así los precios grandes, las etiquetas cian y los kickers quedan como están.

**Dónde usarla:** en el contenedor (`<section>` o `<article>`) de todo lo ⬡. Ya la llevan `/servicios` y sus listados, las tarjetas ⬡ (las pone el generador), las páginas de detalle ⬡, `/ejecutivos`, las secciones ⬡ del inicio (`#lineas` ⬡, `#servicios-destacados`, `#duenos`), el bloque ⬡ de software en `/productos`, `/nosotros#metodologia`, la tarjeta `#agenda` de `/contacto`, `/calculadora-roi` y `#programa-ejecutivo` de `/curso-finanzas-ia`. **No** se usa en secciones ▲ ni en la marca madre (salvo que fallen AA).

**Junto con `.hex-legible`:** «usted»; resultados de negocio en lugar de jerga; en los títulos, `.texto-linea` en vez de `shimmer-text`; sin texto cian o naranja en párrafos; tarjetas `x-card` sin neón (sin `box-glow` ni `text-neon`); áreas táctiles de 44 px o más.

**`/ejecutivos`** agrega en su propio `<style>`: botones grandes `.btn-grande` de 56 px (texto de 18 px) y `.texto-linea` con un degradado fijo dorado a naranja. No lleva constelación, foco del mouse ni estela.

**Nombres en lo ⬡:** la llamada gratuita de Cal.com se llama «Consulta gratis de 20 min»; «Diagnóstico» es solo el de $270. En el menú, Contacto y lo ▲ sigue «Diagnóstico gratis».

---

## 13. Páginas de producto de software (`/club`, `/condominio`, `/gym`)

**Formato de precios:** ▲ siempre en ,99 (con 2 decimales); ⬡ en números redondos (múltiplos de 10). Descuento de 30 % por 12 meses por adelantado (mensual × 12 × 0,70); las cuentas están en `assets/planes.js` y `assets/precios-software.js`.

**Estructura común:** portada con teléfono y laptop, datos de confianza, problema, cómo funciona, funciones por pestañas, por qué, dirección propia, planes `#hexagonal` y `#triangular` (⬡ primero), calculadora, comparación, seguridad, preguntas frecuentes y cierre. Cada producto tiene identidad propia sobre el fondo oscuro del sitio (clase de tema con variables `--p-acento`, `--p-acento-claro`, `--p-btn`, `--p-sobre`, `--p-fondo`, `--p-borde`, `--p-hero-1/2` y `--mk-*` para las maquetas). El cian/naranja y el verde/morado solo aparecen en las insignias de línea. Los rellenos de botón cumplen contraste AA (por eso el rojo de Gym usa `#dc2626` con texto blanco). Maquetas: HTML y CSS con unidades de contenedor (`cqw`), siempre rotuladas «Ejemplo ilustrativo»; las capturas reales de la demo solo se usan para Club y con un club ficticio. Las tres apps nunca se mezclan en un mismo texto o tarjeta (`.sw-card` + `.sw-club`, `.sw-condo`, `.sw-gym`).

**Planes compartidos:** el HTML de los planes lo genera `assets/precios-software.js` (`planesHTML`) y se escribe en cada página con `node scripts/render-planes.js`; estilos en `assets/software-planes.css`. No se escriben precios de planes a mano.

---

## 14. Estados de interacción

Base común en `src/tailwind.css` (final del archivo) y `assets/estados.js`. El color de todos los estados sale de las variables de la línea (`--acento-1`, `--acento-2` y sus versiones `-rgb`): dentro de `.linea-tri` son verde `#4ade80` y morado `#a855f7`; en `.linea-hex` y en la marca madre, cian `#00FFFF` y naranja `#FF8C00`.

- **Curva y tiempos:** `--ease-estado: cubic-bezier(0.23, 1, 0.32, 1)`; `--t-rapida: .18s` (hover y presionado, 150–200 ms) y `--t-entrada: .28s` (entradas, 250–300 ms). Solo se animan `transform`, `opacity`, `color`, `background-color`, `border-color`, `box-shadow` y `filter`: nada que mueva el layout, así que el CLS no cambia.
- **`.estado-interactivo`:** transición estándar, `:focus-visible` con anillo de 2 px del acento y 2 px de separación, y `:active` con `scale(0.97)`.
- **Deshabilitado:** `[disabled]` y `[aria-disabled="true"]` → opacidad .5, cursor `not-allowed`, sin hover, brillo ni escala.
- **`.spinner` / `.spinner-sm`:** 20 px y 16 px, color heredado (`currentColor`).
- **`.btn-cargando`:** el botón conserva su ancho (el contenido se oculta con `opacity` pero sigue ocupando lugar), spinner centrado, `cursor: progress`, `pointer-events: none`. Con etiqueta (`.btn-cargando-texto`) el texto se queda visible junto al spinner.
- **`.skeleton`:** fondo `#121319`, brillo que recorre de izquierda a derecha (`transform`), radio heredado del componente; el contenido se oculta con `opacity` y el tamaño se conserva. `.fade-in` hace aparecer el contenido real al reemplazarlo.
- **Movimiento reducido:** sin giros ni desplazamientos; el spinner y el skeleton quedan en un pulso suave de opacidad.
- **Helper `assets/estados.js` (`window.FV_ESTADOS`):** `setCargando(boton, true|false[, texto])` (clase, `aria-busy`, `disabled`, guarda y restaura el contenido), `mostrarSkeleton(contenedor)` / `ocultarSkeleton(contenedor)` y `anunciar(texto)` (región `aria-live="polite"` para lectores de pantalla). Se carga con `defer` en las páginas que lo usan.

### Hover, foco y presionado (unificados)

Reglas en `src/tailwind.css` (bloque «ESTADOS: hover, foco y presionado»); llevan el prefijo `html` para ganar a los `<style>` de cada página. Todo hover va dentro de `@media (hover: hover) and (pointer: fine)` (también los `hover:*` de Tailwind: `future.hoverOnlyWhenSupported` en `tailwind.config.js`); en celular el feedback es `:active`.

| Elemento | Hover | Presionado | Foco |
|---|---|---|---|
| Botón principal (`.btn-tri`, `.btn-primary`, `.btn-linea`, `.btn-glow-on-hover`, `.btn-grow`) | `brightness(1.08)`, `translateY(-1px)` y sombra suave del acento de la línea (`--cta-rgb`) | `scale(0.97)` sin sombra | anillo de 2 px del acento, separado 2 px |
| Botón secundario (`.btn-secondary`, `.btn-linea-sec`) | borde y fondo tenue del acento de su línea (`--brillo-rgb`: Tri morado, Hex y marca madre cian) | `scale(0.97)` | anillo |
| Tarjeta clicable (`a.x-card`, `a.card-lift`) | sube 4 px, borde y sombra del acento; `.is-static` no se mueve ni cambia de borde | `scale(0.985)` | anillo |
| Tarjeta corta (`.tarjeta`) | ⬡: borde del acento y sombra oscura, sin neón; ▲: el elevado suave de `.x-card`; la flecha del botón avanza 3 px | `scale(0.985)` | anillo alrededor de toda la tarjeta (`:has(.tarjeta-boton:focus-visible)`) |
| Menú | subrayado que crece desde el centro; la página actual (`aria-current="page"`) lo lleva siempre | opacidad .7 | anillo |
| Enlaces dentro de texto (`main a.link-underline`) | subrayado siempre visible; en hover, algo más claro y grueso | opacidad .75 | anillo |
| Pie de página | cambio de color | opacidad .7 | anillo |
| Preguntas frecuentes (`<details>`) | fondo tenue del acento en el resumen; la flecha gira suave al abrir | fondo algo más marcado | anillo |
| Filtros y pestañas (`.filtro`, `.tam-tab`) | solo borde; el seleccionado es fondo del acento + texto oscuro (`aria-pressed` / `aria-selected`) | `scale(0.97)` | anillo |
| Flotantes (Luci, volver arriba) | `scale(1.05)` y sombra; tooltip con su nombre en hover y foco | `scale(0.94)` | anillo |
| Logos de clientes | `brightness(1.1)` (la imagen no cambia) | — | — |
| Campos | borde más claro; en foco, borde del acento + anillo; inválido (`aria-invalid="true"` o `.input-error`): borde rojo suave y mensaje (`.fv-error`) asociado con `aria-describedby` | — | anillo (rojo si es inválido) |

El foco visible es una sola regla global (`:focus-visible` de `a[href]`, `button`, `summary`, `[role=tab]`, campos e iframes) con `outline: 2px solid var(--acento-1)`; ya no hay anillos verdes fijos en los `<style>` de cada página. Con `prefers-reduced-motion` desaparecen las escalas y los desplazamientos: queda solo el cambio de color, opacidad y sombra.

### Estados de carga, error y vacío

- **Tasa BCV (`assets/bcv.js`):** skeleton del ancho del número en el chip y en cada monto en Bs; si ya hay una tasa guardada en `localStorage` se muestra al instante marcada con su fecha («Tasa BCV del 09/10/2026 … actualizando…»). Si la API falla: la tasa guardada con su fecha y un enlace para confirmar la de hoy por WhatsApp; sin ninguna, se ocultan los montos en Bs y el chip lleva a WhatsApp. Nunca «NaN».
- **Calculadora:** los números cambian con un fundido corto; el envío deja el botón en carga, no permite doble envío y termina en éxito (check) o en error con botón de WhatsApp prellenado (el botón vuelve a su estado normal).
- **Contacto:** el envío muestra «Abriendo WhatsApp…» ~1 s; Cal.com con skeleton de calendario y, si no carga en 8 s, botón «Agendar por WhatsApp»; mapa con skeleton hasta que cargue el iframe.
- **WhatsApp en todo el sitio:** si 1,5 s después de pulsar un enlace de `wa.me` la página sigue en primer plano, aviso «¿No se abrió? Escríbenos al +58 424 412 5386» con botón para copiar el número.
- **Luci:** «escribiendo…» de 400–700 ms y botón de enviar deshabilitado mientras responde. **Tests:** transición entre preguntas y «Calculando tu recomendación…» ~600 ms.
- **Fechas (`assets/eventos.js`) e imágenes:** skeleton hasta pintarse y fundido al llegar; las imágenes debajo del primer pantallazo llevan `loading="lazy"` y `decoding="async"`.
- **Navegación:** barra de progreso de 2 px (marca madre) al hacer clic en un enlace interno; se completa al cargar la nueva página (no aparece con enlaces externos, anclas ni `wa.me`).
- **Vacío:** los filtros con listas vacías muestran un mensaje y un botón «Ver todos»; en `/servicios` y `/productos` no hay filtros (un bloque sin ítems simplemente no se genera).

---

## Cómo aplicar esta guía a nuevas páginas

1. Reutilizar siempre el mismo `<head>` (fuentes, `tailwind.css`, meta tags de OG) y poner los marcadores de encabezado y pie (`<!-- header:inicio activo="…" -->`, `<!-- footer:inicio -->`): el shell sale de `partials/`. Ver `README.md`.
2. Un servicio o producto nuevo **no lleva página escrita a mano**: se agrega a `data/catalogo.json` y el build genera la tarjeta y el detalle.
3. Toda sección nueva sigue la fórmula: `<section class="relative py-14 lg:py-20 border-t border-white/5">` (alternando `bg-fv-surface2/40`) → encabezado (`h2` `semibold` + párrafo) → contenido.
4. Usar `.btn-primary` o `.btn-linea` solo para la conversión principal de la página; todo lo demás es `.btn-secondary`/`.btn-linea-sec` o un enlace con `.link-underline`.
5. Elegir la envolvente por el tipo de negocio al que le habla el bloque: `.linea-hex` (usted) o `.linea-tri` (tú). La Hexagonal va primero donde se comparen.
6. Los íconos nuevos deben mantenerse en estilo *outline* SVG, `stroke-width` 1.5, y heredar el color de acento de su contexto (nunca un color fuera de la paleta `fv`).
