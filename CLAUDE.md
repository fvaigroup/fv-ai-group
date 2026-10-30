# CLAUDE.md — fvaigroup.com

Sitio estático de F&V AI Group (HTML + JS sin framework, build en Node + Tailwind 3), desplegado en Vercel desde `main`. Detalle completo en `README.md`, reglas comerciales en `PRODUCT.md`, diseño en `docs/design-system-fvaigroup.md`.

## Stack y estructura
- Sin framework. Node 24, única dependencia: `tailwindcss@3.4`. Función serverless: `api/lead.js` (env: `LEAD_WEBHOOK_URL`).
- Fuente única de servicios/productos: `data/catalogo.json` (+ `catalogo-base.json`, `ESQUEMA.md`).
- **Generado, no editar a mano:** `servicios.html`, `productos.html`, `servicios/*.html`, `productos/*.html`, `sitemap.xml`, y los bloques entre marcadores `<!-- header/footer/tarjetas:inicio -->`. Se cambian en `data/`, `partials/` o `scripts/catalogo/` y se corre el build.
- Páginas a mano: index, nosotros, contacto, casos, ejecutivos, club, condominio, gym, paginas-web, cursos (+ cursos/finanzas-ia), calculadoras, privacidad, terminos, 404.
- Precios de software: `assets/precios-software.js`; cursos/talleres: `assets/eventos.js`. Buscador: `SEARCH_INDEX` en `assets/search.js`.

## Comandos
- `npm run build` (HTML + Tailwind) · `npm test` (16 pruebas) · `node scripts/build-html.js --check` · `node scripts/validar-catalogo.js`
- No hay lint ni typecheck: la verificación son `npm test` + `npm run build`.
- En Windows, `autocrlf=true` hace que `--check` y `estructura.test.js` fallen en local (CRLF vs LF); en Vercel (Linux) no. No “arreglar” corriendo el build y subiendo 40 archivos.

## Decisiones vigentes (no cambiar sin aprobación de Ricardo)
- Dos líneas: ⬡ Hexagonal (empresas; cian/naranja, “usted”, precios múltiplos de 10) y ▲ Triangular (negocios pequeños; verde/morado, “tú”, precios en ,99). Marca madre: cian y naranja.
- Menú por Servicios y Productos; Hexagonal siempre primero. Nombres “Línea Hexagonal/Triangular” solo en el inicio (excepción: encabezados de columna de la lupa, “Hexagonal” y “Triangular”).
- Asesoría solo Hexagonal. “Express” eliminado por completo.
- Único descuento: 30 % por pago anual adelantado (+10 % primer pago al recomendado). “Efectivo” = dólares. Cobro en USD a tasa BCV del día.
- Software: Club, Condominio, Gym. El sitio debe decir que hacen páginas web (`/paginas-web`). Logos de clientes se quedan.
- `terminos.html` no se toca hasta revisión legal. No recrear los 8 archivos viejos (hexagonal, triangular, software, cursos, etc.): redirigen por `vercel.json`.

## Reglas de trabajo
- Español. Directo, sin relleno. Máx. 3 preguntas por ronda, con opción recomendada. No inventar contenido comercial.
- Cambio mínimo; reutilizar patrones. Verificar con `npm test` y build antes de publicar.
- Publicar al terminar cada pedido: commit `tipo: descripción` en `main`, `git pull --rebase`, push; luego verificar Vercel y el sitio (Playwright, escritorio y móvil). Si falla: `git revert`, avisar.
- Pedir confirmación antes de: borrar archivos, cambios masivos, dependencias, build/deploy, env vars/DNS/dominios, base de datos.
- Nunca imprimir secretos ni valores de env. Sin force push, `--no-verify` ni reescribir historial.
- No mezclar con otros proyectos (fv-finanzas, fv-club-app, apps de clientes).
- Máx. 3 recomendaciones de skills/MCP/paquetes por vez; no instalar sin aprobación.

## Herramientas (sesión 2026-10-27)
- OK: Vercel MCP (lista proyectos; **falta autorizar el equipo** para ver despliegues/logs), Playwright CLI (skill), GitHub vía `gh`/git, Cloudflare, Supabase.
- Fallan: Context7 y Magic (timeout de conexión).

## Cambios recientes
- 2026-10-27: primera sesión, solo lectura. Informe en `brain/fvaigroup/tecnologia/informes/`. Se creó este archivo.
- 2026-10-28: hero del inicio rediseñado (hexágono giratorio solo CSS, H1 «Bienvenido al futuro de tu empresa») y secciones #camino, #venezuela y #conversacion; arreglo del espacio en «Escríbenos por WhatsApp» de la barra. Lupa con columnas Hexagonal/Triangular y botones «Ver todos…» (27 oct). Pendiente: unificar «30 minutos» (Contacto dice 20, Cal.com 15) y decidir qué hacer con #cta-final y #como-trabajamos, que se parecen a las secciones nuevas.
- 2026-10-28 (2): inicio en trato de usted (salvo los bloques ▲, que mantienen «tú»); hero a pantalla completa con la franja de logos bajo el pliegue, sin pastilla ni texto de apoyo; Luci con un solo globo «¿Dudas?» (a los 5 s de cargar, se va a los 20 s; lo crea assets/luci.js en todas las páginas y se retiró el aviso aparte del inicio).
- 2026-10-28 (3): hero rediseñado: «Inteligencia de negocios» (mayúsculas, degradado en la 2.ª línea), subtítulo, descripción y un solo botón «Cómo trabajamos» → /#lineas; aro del hexágono escalado (--ini-k) a opacidad 0,5.
- 2026-10-28 (4): la lupa ahora es un panel a todo el ancho bajo la barra, como mapa del sitio: columnas Hexagonal / Triangular / Páginas; Servicios y Productos; grupos por categoría (campo g del índice) que se abren y cierran con flecha, con «Expandir todo». Las páginas aún traen una copia del CSS viejo del buscador (panel de 560 px); search.js la sobrescribe. Pendiente: borrar esa copia de base.css y de las páginas escritas a mano.
- 2026-10-29 (5): **inicio recortado** a pedido de Ricardo: solo barra, hero (con la franja de logos de clientes) y pie; fuera todas las demás secciones (camino, venezuela, conversación, líneas, destacados, dueños, cómo trabajamos, diferencial, testimonios, próximas fechas, FAQ, CTA final) y del JSON-LD los Product y el FAQPage. «Empezar» ahora lleva a /contacto#agenda. El pie ya no lista «Preguntas frecuentes». Para recuperar las secciones: `git show cb7f391:index.html`.
- 2026-10-29 (4): menú: Inicio, Hexagonal, Triangular, Nosotros, Contacto. Hexagonal y Triangular son páginas nuevas (/hexagonal, /triangular; sin precios ni enlaces a lo oculto; texto tomado de las tarjetas que tenía el inicio); se quitaron las viejas redirecciones de esas dos URLs. El header acepta activo="hexagonal" y "triangular".
- 2026-10-29 (4b) logo-mark-hex.png fijo en el centro del hexágono (no gira), levita ±7 px en 3,6 s (ini-levita) y va 4 % más arriba para quedar en el centro óptico (su dibujo pesa hacia abajo).
- 2026-10-29 (3): hero alineado a la izquierda y hexágono a la derecha (≥1024 px: left 71 %, escala 1; gira en sentido horario).
- 2026-10-29 (2): hero del inicio: H1 «Aquí empieza / el futuro de su empresa» (fuente Anton, +20 %, degradado cian↔naranja animado), subtítulo «Bienvenido al círculo de las empresas que deciden con datos», descripción nueva y botón «Empezar» (sigue yendo a /#lineas). Nueva fuente Anton solo en index.html.
- 2026-10-29: **ocultos temporalmente** (a pedido de Ricardo, para reconstruir de cero servicio por servicio y producto por producto; no es borrado): servicios, productos, Club, Condominio, Gym, /paginas-web, /casos, /calculadora, /calculadora-roi, y /ejecutivos. (/curso-finanzas-ia pasó a /cursos/finanzas-ia el 29 oct y está visible; /cursos es un listado; no están en el menú). Cómo está hecho: redirecciones 302 a «/» al inicio de `vercel.json` (una por ruta; quitar una la vuelve a publicar); `OCULTAS` en `assets/search.js` y en `scripts/catalogo/sitemap.js` (lupa y sitemap); menú y pie sin Servicios/Productos (`partials/header.html`, `partials/footer.html`); en `tests/estructura.test.js`, `TIPOS_VISIBLES = []`. Las páginas, `data/catalogo.json` y Luci siguen intactos (Luci aún nombra y enlaza lo oculto; sus enlaces caen en el inicio). El inicio no se tocó: sus botones a lo oculto caen en «/». Para deshacer todo: `git revert` de ese commit. Pendiente aparte: unificar «30 minutos» (Ricardo confirmó que son 30; falta cambiar 20→30 en ~45 archivos y el evento de Cal.com, hoy 15 min).
- 2026-10-30: **inicio rediseñado** (rama de trabajo directa en `main`, a pedido de Ricardo): hero con texto exacto del encargo (antetítulo «INTELIGENCIA DE NEGOCIOS», H1 «Estrategia con inteligencia artificial para empresas», subtítulo, un solo botón «Cómo trabajamos» → #lineas; se conservan Anton, hexágono a la derecha y luciérnaga levitando); franja «Marcas con las que hemos trabajado»; #lineas con hexágono (6 lados) y triángulo (3) en SVG interactivo y lista de respaldo sin JS; espacio de video oculto (#video-socios); #diagnostico (3 preguntas → línea + WhatsApp, sin guardar datos); #como-trabajamos; #caos-tablero; franja Delta App; #faq (4 preguntas, FAQPage en JSON-LD); #cierre. Todo sin precios (`tests/inicio.test.js` falla si aparece «$», «USD», «Bs.», «%», «desde», «Express», «10x»). JS en `assets/inicio.js` (~8 KB); textos de los lados en las listas de `#lineas` de `index.html` (editar ahí). Nueva página `/delta-app` (nombre «Delta App» para el software Club/Condominio/Gym; Ricardo lo eligió el 30 oct, antes `precios.test.js` lo prohibía). En el celular Luci se esconde mientras se ve el pie. **Pendientes:** `priceRange` ($4.99 - $3000) sigue en el JSON-LD del inicio (decide Ricardo); comentario REVISAR en Plan Arranque (pausado en el catálogo); minutos de la consulta (pie dice 20; Cal.com 15; decidido 30); los botones de WhatsApp de cada lado usan «Hola F&V, vi X en la web y quiero saber más.» (el encargo traía «…» en los mensajes).
- 2026-10-30 (2): **fase 2 del inicio** (commit por cada una, directo en `main` por pedido de Ricardo): (A) calculadora `#brecha` «¿Cuánto se le va entre que cobra y cambia?» (`assets/brecha.js`, reusa `FV_BCV` de `assets/bcv.js`, prellena la tasa solo si llegó en vivo; zona única exenta de la regla de cero precios: `data-sin-precios-excepcion="brecha"`; prueba del cálculo en `tests/brecha.test.js`, ya dentro de `npm test`); (B) `#manifiesto` con tres frases; (C) Luci con avisos por sección dentro de `assets/inicio.js` (`AVISOS`; máx. 3, 2 s de espera, 6 s; `luci.js` intacto); (D) linterna del cursor (`assets/linterna.js`, <2 KB, solo mouse + ≥1024 px + sin reduced-motion; en celular ni se descarga). Pendientes: Lighthouse no se pudo correr (no hay herramienta instalada); mensaje de WhatsApp del resultado «sin pérdida» lo redacté yo («Hola F&V, usé la calculadora de la web y esta vez no perdí por la tasa. Quiero revisar si siempre es así.»); como máximo salen 3 avisos de Luci por visita, así que el de #faq solo sale si se saltó alguno de los anteriores.
