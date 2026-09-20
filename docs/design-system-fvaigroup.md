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

## Cómo aplicar esta guía a nuevas páginas

1. Reutilizar siempre el mismo `<head>` (fuentes, `tailwind.css`, meta tags de OG) y el mismo shell de header/footer/Luci/search del home.
2. Toda sección nueva sigue la fórmula: `<section class="relative py-24 border-t border-white/5">` (alternando `bg-fv-surface2/40`) → encabezado (`h2` uppercase `semibold` + párrafo `text-slate-400`) → contenido.
3. Usar `.btn-primary` solo para la conversión principal de la página; todo lo demás es `.btn-secondary` o un link con `.link-underline`.
4. Elegir el par de acento según la línea de negocio: **cian/naranja** para todo lo relacionado con la línea Hexágono (servicios principales, cursos estándar), **verde/violeta (`fv-triGreen`/`fv-triPurple`)** solo cuando el contenido pertenece explícitamente a la línea Triángulo (Mid-Ticket).
5. Los íconos nuevos deben mantenerse en estilo *outline* SVG, `stroke-width` 1.5, y heredar el color de acento de su contexto (nunca un color fuera de la paleta `fv`).
