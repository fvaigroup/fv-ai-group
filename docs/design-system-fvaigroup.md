# Sistema de Diseño — F&V AI Group (fvaigroup.com)

> Auditoría de UI/UX del home (`index.html`) realizada a partir del código y estilos actuales del sitio. Sirve como guía de estilo para construir o actualizar el resto de páginas (landing pages de cursos, servicios, etc.) manteniendo consistencia visual.

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
| `fv-cyan` | `#00FFFF` | **Acento primario 1** — línea "Hexágono" (servicio principal) |
| `fv-cyanMid` | `#00CCFF` | Variante de cian para glows/blobs de fondo |
| `fv-orange` | `#FF8C00` | **Acento primario 2** — CTA principal, línea "Hexágono" |
| `fv-orangeWarm` | `#FF4500` | Variante cálida para glow del botón primario |
| `fv-gold` | `#FFBF00` | Punto medio del degradado `shimmer-text` |
| `fv-triGreen` / `fv-triPurple` | `#4ade80` / `#a855f7` | **Acento secundario formal** — exclusivo de la línea "Triángulo" (Mid-Ticket / sprints acotados), para diferenciarla visualmente de la línea Hexágono sin salirse del sistema |

**Estructura cromática:** fondo casi negro (`#000`) en todo el sitio, con dos pares de acento neón que nunca se usan como fondo sólido, solo como: texto (`shimmer-text`, `text-fv-cyan`), bordes con opacidad (`border-fv-cyan/30`), glows (`box-shadow` con `rgba` de cian/naranja) y rellenos muy tenues (`bg-fv-cyan/10`).

**Cómo guía el ojo:**
- El **naranja** es el color de la acción (`btn-primary` = fondo naranja sólido + glow). Es el único color que aparece como *fill* grande en la interfaz — reservado casi exclusivamente para el CTA de conversión más importante de cada sección.
- El **cian** es el color informativo/secundario — bordes de hover, iconos de "checks" positivos, badges de estado, subtítulos de sección alternos.
- El **degradado cian→naranja** (`shimmer-text`, `box-gradient-border`) marca los puntos de máxima jerarquía: el fragmento más importante de cada H1/H2 y los contenedores de cierre (CTA final, tarjeta de precio).
- El **par verde/violeta** (`triGreen`/`triPurple`) funciona como un "sub-brand" cromático: en cuanto aparece, comunica que se está en la línea de servicios más ágil/económica (Triángulo) sin que el usuario necesite leer texto para notar la diferencia frente a la línea Hexágono (cian/naranja).
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
- **Badges/pills:** `inline-block text-[11px] font-head font-semibold px-3 py-1.5 rounded-full border` con fondo y texto del color de acento al 10%/100% respectivamente (`bg-fv-orange/10 text-fv-orange border-fv-orange/30`) — patrón repetido para etiquetas de estado ("Cohorte en formación", "High-Ticket", "Mid-Ticket").
- **Interactividad:** los componentes comunican estado mediante color + glow, nunca solo con cambio de forma. Un tab activo, un botón en hover y un input en foco todos "se iluminan" en cian u naranja — es la firma táctil del sitio.

---

## 5. Personalidad de Marca

**Arquetipo estético: tecnológico-nocturno con acabado "premium SaaS".** El fondo negro absoluto, los glows neón cian/naranja y las animaciones sutiles (shimmer de texto, partículas de fondo, cursor con estela) sitúan a F&V AI Group más cerca de un producto de software/IA de vanguardia que de una consultora tradicional — es una decisión deliberada para diferenciarse de competidores de ERP/consultoría que suelen usar estética corporativa clásica (azules corporativos, fondos blancos, sans-serif neutra).

Al mismo tiempo, el sitio se mantiene **sobrio en la estructura**: tipografía limitada a 2 familias, paleta de color acotada a un fondo + 2 pares de acento, y componentes muy repetidos sección a sección. Esto evita que la estética "neón" se sienta caótica o poco profesional — el orden estructural (grids, espaciado, jerarquía tipográfica constante) es lo que permite que el llamativo lenguaje visual funcione en un contexto B2B.

En resumen: **vanguardista en superficie (color, glow, motion), corporativo/metódico en estructura** — coherente con el mensaje de la marca de traer IA de punta a procesos empresariales tradicionales (ERP, finanzas, operaciones).

---

## 6. Línea Triangular y página /triangular

La página `/triangular` (`triangular.html`, antes `express.html`: planes y productos para negocios y personas) es el escaparate de la Línea Triangular y usa su par cromático verde/violeta en lugar del cian/naranja. Hoy el color lo da la envolvente `.linea-tri` (ver sección 7); lo que sigue describe los componentes:

- **CTA principal:** `.btn-tri` (definido en `src/tailwind.css`, capa `components`): fondo `fv-triGreen` lleno, texto negro, glow verde que vira a violeta en hover y `:active { scale(0.96) }`. Cumple el papel de `.btn-primary` dentro de la Línea Triangular. Fuera de esos bloques el CTA principal sigue siendo el naranja.
- **CTA secundario de la línea:** contorno violeta (`border border-fv-triPurple/50 text-white hover:bg-fv-triPurple/10`).
- **Texto destacado:** `.text-gradient-tri` (degradado estático verde → violeta), también global en `src/tailwind.css`. El `shimmer-text` cian→naranja queda para la marca general y la Línea Hexagonal.
- **Tarjetas:** hover con elevación y borde violeta iluminado; la tarjeta destacada usa borde en degradado verde→violeta (misma técnica `padding-box`/`border-box` que `.price-card.is-featured`).
- **Precios en bolívares en vivo:** los montos en Bs se calculan en el navegador con la tasa oficial del BCV (`https://ve.dolarapi.com/v1/dolares/oficial`, permitida en la CSP de `vercel.json`). Marcado: contenedor con clase `hidden` + `data-bs-wrap`, monto con `data-usd="35"`, tasa con `data-bcv-rate`. Si la API no responde, los montos en Bs no aparecen y el texto sigue leyéndose bien. No usar el atributo `hidden` junto a clases de `display`: se usa la clase `hidden` y el script la quita.
- **Botones de WhatsApp por producto:** mensaje ya escrito con el nombre del producto (`?text=Quiero%20Negocio%20Visible`) y atributos `data-product` / `data-cta`, que el script de medición envía a GA4 como `whatsapp_click`. Cualquier otro clic que se quiera medir lleva `data-track="nombre_del_evento"`.
- **Registro:** la Línea Triangular y las partes comunes (inicio, menú, pie, contacto, nosotros) hablan de **tú**; la Línea Hexagonal, de **usted**. Nunca se mezclan dentro de una misma frase o tarjeta.

---

## 7. Color por línea (sistema vigente)

El sitio comunica **dos líneas**: ▲ Línea Triangular (negocios pequeños y personas) y ⬡ Línea Hexagonal (empresas), sin concepto "Express": cada tarjeta lleva solo la insignia de su línea y el plazo como texto normal. El color depende de la **línea donde está el bloque**, no del componente.

| Envolvente | Par de acento | Emblema | Hover de tarjetas | Botón principal |
|---|---|---|---|---|
| `.linea-tri` | verde `#4ade80` + morado `#a855f7` | triángulo | morado | verde lleno (`.btn-linea`) |
| `.linea-hex` | cian `#00FFFF` + naranja `#FF8C00` | hexágono | cian | naranja lleno |
| (sin envolvente) marca madre F&V: encabezado, pie, inicio, Nosotros, Contacto, Casos, 404 | cian + naranja (igual que `.linea-hex`) | hexágono de F&V | cian | naranja lleno |

Variables que fija cada envolvente (en `src/tailwind.css`): `--acento-1`, `--acento-2`, `--acento-1-rgb`, `--acento-2-rgb`, `--brillo-rgb` (brillo al pasar el mouse), `--cta` y `--cta-rgb` (botón principal).

**Componentes que resuelven solos según la envolvente:** `.x-card` (+ `.is-featured`, `.is-help`), `.x-faq[open]`, `.card-lift` (`.card-lift-cyan` queda como alias), `.texto-linea` (Tri: degradado estático verde→morado; Hex y marca madre: degradado animado cian→dorado→naranja), `.btn-linea` y `.btn-linea-sec`, `.box-glow-tri`.

**Reglas**
- Como la marca madre comparte colores con la Hexagonal, todo bloque Hexagonal lleva SIEMPRE la insignia «⬡ Línea Hexagonal».
- Ningún bloque Triangular usa cian ni naranja por dentro, y ningún bloque Hexagonal usa verde ni morado (excepciones: el ícono de WhatsApp, el encabezado y el pie).
- `.btn-tri`, `.btn-primary`, `.text-gradient-tri` y `.shimmer-text` siguen existiendo; en bloques nuevos usar `.btn-linea` y `.texto-linea`.

**Insignias (siempre texto + forma, nunca solo color)** (no existe insignia «Express»; el plazo va como texto normal: «Activo en 48 h», «Entrega en 2 semanas»)
- `<span class="ins ins-tri"><span>Línea Triangular</span></span>` → «▲ Línea Triangular»: borde verde, texto en degradado verde→morado.
- `<span class="ins ins-hex"><span>Línea Hexagonal</span></span>` → «⬡ Línea Hexagonal»: borde cian, texto en degradado cian→naranja.

**Tono:** la Línea Triangular le habla de «tú»; la Hexagonal, de «usted»; las partes comunes (inicio, menú, pie, contacto, nosotros), de «tú».

## Cómo aplicar esta guía a nuevas páginas

1. Reutilizar siempre el mismo `<head>` (fuentes, `tailwind.css`, meta tags de OG) y el mismo shell de header/footer/Luci/search del home.
2. Toda sección nueva sigue la fórmula: `<section class="relative py-24 border-t border-white/5">` (alternando `bg-fv-surface2/40`) → encabezado (`h2` uppercase `semibold` + párrafo `text-slate-400`) → contenido.
3. Usar `.btn-primary` solo para la conversión principal de la página; todo lo demás es `.btn-secondary` o un link con `.link-underline`.
4. Elegir el par de acento según la línea de negocio: **cian/naranja** para todo lo relacionado con la línea Hexágono (servicios principales, cursos estándar), **verde/violeta (`fv-triGreen`/`fv-triPurple`)** solo cuando el contenido pertenece explícitamente a la línea Triángulo (planes y productos para negocios), con `.btn-tri` como CTA principal de esos bloques.
5. Los íconos nuevos deben mantenerse en estilo *outline* SVG, `stroke-width` 1.5, y heredar el color de acento de su contexto (nunca un color fuera de la paleta `fv`).

## Selector de tamaño (`.tam-tab`) y pago adelantado

Cada producto de `/triangular` ofrece varios tamaños como pestañas (`role="tablist"` / `role="tab"` / `role="tabpanel"`): las flechas, Inicio y Fin del teclado cambian de tamaño y solo el panel elegido se ve. El estilo es `.tam-tab` en `src/tailwind.css` (el color sale de `--acento-1` de la línea; el tamaño elegido lleva `aria-selected="true"`). El comportamiento y los cálculos están en `assets/planes.js`: cada panel declara `data-panel`, `data-precio` y `data-tipo` (`mensual` o `unico`) y el script escribe el pago adelantado (`data-ahorro="12"`, `data-ahorro-lista="3|6|9"`) y el pago de contado (`data-contado`). Sin JavaScript se ven todos los tamaños.

## Estados de interacción

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
- **Vacío:** el filtro de `/hexagonal` sin resultados muestra «No hay productos con ese filtro.» y un botón «Ver todos».

---

## 7. Líneas por tipo de negocio y páginas de software (octubre de 2026)

**Las líneas se separan por TIPO de negocio, no por precio.** ⬡ Hexagonal (`.linea-hex`, cian #00FFFF / naranja #FF8C00, hexágono, «usted»): medianas y grandes empresas, corporaciones, grupos, instituciones y administradoras de condominios, donde decide una estructura. ▲ Triangular (`.linea-tri`, verde #4ade80 / morado #a855f7, triángulo, «tú»): negocios pequeños donde decide el dueño. En cualquier lugar donde se comparen las dos, la Hexagonal va primero y se agrega la línea de ayuda «¿No sabe cuál? Menos de 20 personas: Triangular. Más de 20, varias sedes o junta directiva: Hexagonal.»

**Formato de precios:** Triangular siempre en ,99 (con 2 decimales); Hexagonal en números redondos (múltiplos de 10). Un solo descuento: 30 % por 12 meses por adelantado (mensual × 12 × 0,70). Las cuentas están en `assets/planes.js` (productos Triangulares) y `assets/precios-software.js` (apps).

**Inicio:** portada en dos columnas (texto a la izquierda; las dos líneas a la derecha, Hexagonal arriba; en móvil: texto, Hexagonal, Triangular). Las tres apps van en tarjetas SEPARADAS, cada una con su paleta (`.sw-card` + `.sw-club`, `.sw-condo`, `.sw-gym`): nunca en un mismo texto.

**Páginas de producto (`/club`, `/condominio`, `/gym`):** estructura común (portada con teléfono y laptop, datos de confianza, problema, cómo funciona, funciones por pestañas, por qué, dirección propia, planes `#hexagonal` y `#triangular`, calculadora, comparación, seguridad, preguntas frecuentes y cierre). Cada producto tiene identidad propia sobre el fondo oscuro del sitio (clase de tema con variables `--p-acento`, `--p-acento-claro`, `--p-btn`, `--p-sobre`, `--p-fondo`, `--p-borde`, `--p-hero-1/2` y `--mk-*` para las maquetas). El cian/naranja y el verde/morado solo aparecen en las insignias de línea. Los rellenos de botón cumplen contraste AA (por eso el rojo de Gym usa #dc2626 con texto blanco). Maquetas: HTML y CSS con unidades de contenedor (`cqw`), siempre rotuladas «Ejemplo ilustrativo»; las capturas reales de la demo solo se usan para Club y con un club ficticio.

**Planes compartidos:** el HTML de los planes lo genera `assets/precios-software.js` (`planesHTML`) y se escribe en cada página con `node scripts/render-planes.js`; estilos en `assets/software-planes.css`. No se escriben precios de planes a mano.

---

## 8. Legibilidad Hexagonal: `.hex-legible` (17 de octubre de 2026)

El cliente ideal de la Hexagonal son dueños y directivos de 40 a 65 años que leen desde el teléfono. Por eso las secciones Hexagonales llevan menos brillo y más tamaño de letra.

**Qué hace** (definida en `src/tailwind.css`, junto al bloque de accesibilidad):

- Párrafos, `li` y `dd` del cuerpo dentro del contenedor: **18 px** (`1.125rem`) con **interlineado 1,6**.
- Los que estaban en gris tenue (`text-slate-400`, `text-slate-500`) pasan a **#e2e8f0** (contraste AA holgado sobre negro). Para texto nuevo, escriba directamente `text-slate-200` (#e2e8f0) o `text-slate-300` (#cbd5e1).
- **No toca** lo que ya trae su propio tamaño (`text-xs`, `text-sm`, `text-lg`, `text-xl` y mayores, `text-[..]`), lo que usa `font-head` (etiquetas, insignias, botones) ni lo que está dentro de un contenedor `text-xs` o `text-sm`. Así los precios grandes, las etiquetas cian y los kickers quedan como están.
- Botones de línea (`.btn-linea`) con **brillo suave en reposo** (borde naranja y sombra corta); el brillo completo queda para el hover. Filtros (`.filtro`) de **44 px** de alto.

**Dónde usarla:** en el contenedor (`<section>`) de cada sección Hexagonal: todas las de `/hexagonal`, `/ejecutivos`, la sección `#duenos` del inicio, las páginas de detalle (`/asesoria-estrategica`, `/despliegue-ejecucion`, `/acompanamiento-continuo`, `/masterclasses-workshops`, `/calculadora-roi`), `/cursos#formacion-empresas`, `/nosotros#metodologia` y la tarjeta `#agenda` de `/contacto`. **No** se usa en secciones Triangulares ni en la marca madre (salvo que fallen AA).

**Junto con `.hex-legible`:** «usted»; resultados de negocio en lugar de jerga; en los títulos, `.texto-linea` en vez de `shimmer-text`; sin texto cian o naranja en párrafos; tarjetas `x-card` sin neón (sin `box-glow` ni `text-neon`); áreas táctiles de 44 px o más.

**/ejecutivos** agrega en su propio `<style>`: botones grandes `.btn-grande` de 56 px (texto de 18 px) y `.texto-linea` con un degradado fijo dorado a naranja (el animado cian, dorado y naranja se veía verdoso quieto). No lleva constelación, foco del mouse ni estela.

**Nombres en lo Hexagonal:** la llamada gratuita de Cal.com se llama «Consulta gratis de 20 min» (en el pie, columna Línea Hexagonal, también); «Diagnóstico» es solo el de $270. En el menú, Contacto y lo Triangular sigue «Diagnóstico gratis».
