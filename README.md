# fvaigroup.com

Código del sitio web de F&V AI Group (https://www.fvaigroup.com): consultoría financiera con IA, implementación y automatización a medida, formación, y productos listos para usar. Es un sitio estático (HTML, CSS y JavaScript sin framework) con un paso de construcción en Node.js y Tailwind CSS, desplegado en Vercel.

El sitio se organiza por **Servicios** (el equipo de F&V trabaja con el cliente) y **Productos** (listos para usar, con el mismo precio y la misma entrega para todos). Las reglas de contenido, precios, tono y marca están en [`PRODUCT.md`](PRODUCT.md); el sistema visual, en [`docs/design-system-fvaigroup.md`](docs/design-system-fvaigroup.md); el historial, en [`CHANGELOG.md`](CHANGELOG.md); la medición, en [`README-MEDICION.md`](README-MEDICION.md).

## Estructura de carpetas

| Ruta | Qué contiene |
|---|---|
| `*.html` (raíz) | Páginas del sitio. Las escritas a mano: `index`, `nosotros`, `contacto`, `casos`, `ejecutivos`, `club`, `condominio`, `gym`, `paginas-web`, `curso-finanzas-ia`, `calculadora`, `calculadora-roi`, `privacidad`, `terminos`, `404`. Las **generadas**: `servicios.html` y `productos.html`. |
| `servicios/`, `productos/` | Páginas de detalle, **todas generadas** desde el catálogo (17 de servicios y 6 de productos). No se editan a mano. |
| `data/` | `catalogo.json` (la fuente única de servicios y productos), `catalogo-base.json` (líneas, tipos, categorías, páginas existentes que hacen de detalle y fecha de actualización) y `ESQUEMA.md` (las reglas del catálogo). |
| `partials/` | `header.html` y `footer.html` (encabezado y pie únicos, con tokens `{{…}}`) y `servicios-extra.html` / `productos-extra.html` (secciones que se insertan al final de `/servicios` y `/productos`). |
| `scripts/` | `build-html.js` (el build), `validar-catalogo.js`, `imagenes-redes.js`, `render-planes.js`. |
| `scripts/catalogo/` | Generadores que usa el build: `cargar`, `precio`, `tarjetas`, `listados`, `detalle`, `pagina`, `generar`, `sitemap`, más las plantillas `base.css`, `final.html`, `head-analitica.html` y `head-fuentes.html`. |
| `src/tailwind.css` | Estilos compartidos. `npm run build` los compila a `assets/css/tailwind.css` (esa carpeta no se sube a git). |
| `assets/` | JavaScript del navegador (`menu.js`, `search.js`, `luci.js`, `medicion.js`, `eventos.js`, `precios-software.js`, `planes.js`, `anclas-viejas.js`, …), imágenes, logos, imágenes para redes (`og/`, `social/`) y los estilos propios de Club, Condominio y Gym. |
| `tests/` | Pruebas automáticas (una por tema, sin dependencias). |
| `api/lead.js` | Función de Vercel que recibe los datos de la calculadora (ver `docs/leads-webhook.md`). |
| `docs/` | Guía de diseño, entrega del catálogo de demostración y conexión de leads. |
| `vercel.json` | Comando de construcción, cabeceras de seguridad y redirecciones 301. |
| `sitemap.xml`, `robots.txt` | El sitemap también es generado. |

Las ocho páginas del sitio anterior (`hexagonal`, `triangular`, `software`, `cursos`, `asesoria-estrategica`, `acompanamiento-continuo`, `despliegue-ejecucion`, `masterclasses-workshops`) ya no existen como archivos: sus URLs redirigen con 301 desde `vercel.json` y `tests/redirecciones.test.js` exige que sigan haciéndolo. No vuelva a crear un archivo con esos nombres: la redirección lo taparía. `demo-catalogo.html` es una demostración con diseño propio que el build no toca.

## Comandos

```bash
npm install                          # instala Tailwind CSS (la única dependencia)
npm run build                        # node scripts/build-html.js && tailwindcss ... --minify
npm test                             # corre las 16 pruebas, en orden
node scripts/build-html.js           # solo el paso de HTML: reescribe lo generado
node scripts/build-html.js --check   # no escribe; sale con código 1 si algo está desactualizado
node scripts/validar-catalogo.js     # valida data/catalogo.json contra data/ESQUEMA.md
node scripts/catalogo/sitemap.js     # regenera sitemap.xml (--check solo compara)
node scripts/render-planes.js        # reescribe los bloques de planes de /club, /condominio y /gym desde assets/precios-software.js
node scripts/imagenes-redes.js       # regenera las imágenes para redes (necesita Playwright; ver abajo)
node tests/catalogo.test.js          # cualquier prueba por separado
```

Probado con Node 24. `imagenes-redes.js` acepta nombres para generar solo una parte: `condominio`, `gym`, `instagram`, `ejecutivos` o `servicios-productos` (las 12 imágenes de `assets/og/`). Usa Playwright: si no está en el proyecto, instale `@playwright/cli` o `playwright-core` de forma global.

## Cómo funciona el build

`npm run build` hace dos cosas: primero `node scripts/build-html.js` y después Tailwind.

1. **Catálogo a páginas.** `scripts/catalogo/generar.js` lee `data/catalogo.json` y genera en memoria `servicios.html`, `productos.html` y una página de detalle por ítem (`servicios/<id>.html`, `productos/<id>.html`) más una por página compartida (por ejemplo `servicios/acompanamiento.html`). Con el catálogo actual son 34 ítems (19 servicios y 15 productos) y 23 páginas de detalle: los demás ítems tienen su detalle en una página que ya existe (`/club`, `/condominio`, `/gym`, `/paginas-web`, `/curso-finanzas-ia` y `/ejecutivos#programa-ejecutivo`). Una página generada que ya no esté en el catálogo se borra.
2. **Tarjetas.** En cualquier página, lo que esté entre estos marcadores se reescribe con las tarjetas cortas de esos ítems (`cols` = 2, 3 o 4 columnas en escritorio; `nivel` opcional = nivel del encabezado del nombre):

   ```html
   <!-- tarjetas:inicio ids="diagnostico,asesor-financiero" cols="4" -->
   <!-- tarjetas:fin -->
   ```

3. **Encabezado y pie.** Cada página lleva sus marcadores, y el build pone entre ellos lo que sale de `partials/header.html` y `partials/footer.html`:

   ```html
   <!-- header:inicio activo="servicios" hijo="si" wa="Hola F&V, me interesa..." -->
   <!-- header:fin -->
   <!-- footer:inicio -->
   <!-- footer:fin -->
   ```

   `activo` (obligatorio) es `inicio`, `servicios`, `productos`, `nosotros`, `contacto` o `ninguno`; `hijo="si"` marca que la página es un detalle del grupo activo; `wa` es el mensaje de WhatsApp de esa página. Las categorías de los desplegables salen de `data/catalogo.json`.
4. **Sitemap.** `sitemap.xml` se genera desde el catálogo y la lista de páginas estáticas de `scripts/catalogo/sitemap.js`. Las páginas viejas, `404`, `privacidad`, `terminos` y `demo-catalogo` quedan fuera a propósito.
5. **Tailwind.** `tailwindcss -i ./src/tailwind.css -o ./assets/css/tailwind.css --minify`, leyendo todas las páginas, `partials/`, `assets/*.js` y `scripts/`.

El paso 1 al 4 es determinista (sin fechas ni rutas de la máquina), así que dos corridas seguidas no cambian nada.

**El HTML generado se guarda en el repositorio y no se edita a mano.** Vercel vuelve a construir, pero el repositorio es la referencia: después de cambiar el catálogo, un partial o un generador, se corre `npm run build` y se hace commit de los archivos que cambiaron. Las páginas generadas llevan el comentario «generado por scripts/build-html.js desde data/catalogo.json: no editar a mano». Si se edita una a mano, el siguiente build la pisa y `npm test` falla.

## Cómo agregar un servicio o un producto nuevo

1. **Elija el tipo.** Es un *servicio* si el equipo de F&V trabaja con el cliente (en su empresa o con su equipo); es un *producto* si está listo para usar, con el mismo precio y la misma entrega para todos. Tener precio fijo no lo convierte en producto: el Diagnóstico, la Formación ejecutiva y el Asesor financiero son servicios con precio fijo. Un curso o taller con fecha y cupo es un producto; una formación privada o a la medida es un servicio.
2. **Elija la categoría y la línea.** Categorías de servicios: `diagnostico`, `implementacion`, `formacion`, `acompanamiento`. Categorías de productos: `software`, `cursos`, `para-empezar`, `presencia`, `control`, `ventas`. Todos los servicios son `hex`; un producto puede ser `hex` o `tri`. La línea la decide el tipo de cliente, no el precio, y la asesoría solo existe en lo `hex`.
3. **Edite `data/catalogo.json`** siguiendo [`data/ESQUEMA.md`](data/ESQUEMA.md): agregue el ítem a `items` con `id` (en minúsculas y con guiones), `tipo`, `categoria`, `linea`, `orden`, `nombre`, `frase`, `precio`, `plazo`, `detalle`, `wa`, `contenido`, `relacionados` y `meta`.
   - **`frase`:** de 3 a 15 palabras, sin jerga en lo Hexagonal.
   - **`precio`:** la regla de su línea. Hexagonal en múltiplos de 10 con punto de miles (`$1.000`); Triangular terminando en `,99` (`$39,99`). Las implementaciones son `a-medida`; sus «desde $X» llevan la nota «precio final después del diagnóstico». El software toma su precio de `assets/precios-software.js` y los cursos y talleres, de `assets/eventos.js`: ahí no se escribe el monto.
   - **`wa.mensaje`:** empieza con «Hola F&V», nombra el ítem y lleva la forma de la línea entre paréntesis: `(⬡, $270)` o `(▲, $39,99/mes)`. Nunca el nombre de la línea.
   - **`contenido`:** solo lo que sea real. Una sección vacía no se muestra; no se inventa texto. Para reutilizar texto ya publicado, cite un bloque en `contenido.bloques`.
   - **`relacionados`:** de 2 a 3 ids de la misma categoría, la Hexagonal primero.
   - **`detalle`:** `generada` si el build debe crear la página (`/servicios/<id>` o `/productos/<id>`); `existente` si ya hay una página que sirve de detalle (debe estar en `paginas_existentes_como_detalle`).
4. **Valide:** `node scripts/validar-catalogo.js`. Debe decir «0 errores».
5. **Agréguelo al buscador.** `assets/search.js` tiene un arreglo `SEARCH_INDEX`: una línea por ítem, con el nombre como título, la URL de su detalle, `g` (el id de su categoría del catálogo: es el grupo que se abre y se cierra en la lupa) y una descripción que empiece con la misma frase y traiga el precio. `tests/buscador-luci.test.js` falla si falta o si `g` no es su categoría. La lupa se arma sola desde ese arreglo: columnas ⬡ Hexagonal y ▲ Triangular (Servicios y Productos) y una columna de Páginas.
6. **Si debe aparecer en el inicio**, agregue su id a un marcador `<!-- tarjetas:inicio ids="…" -->` de `index.html`.
7. **Construya y pruebe:** `npm run build` y `npm test`. Dos pruebas llevan números fijos que hay que actualizar a propósito cuando cambia el catálogo: `tests/buscador-luci.test.js` (19 servicios, 15 productos y 10 categorías) y `tests/sitemap.test.js` (23 páginas de detalle).
8. **Si agregó una categoría**, regenere las imágenes para redes: `node scripts/imagenes-redes.js servicios-productos` (sale una por categoría en `assets/og/`). Las categorías de los desplegables del menú y del pie se actualizan solas en el build.
9. **Cambie `fecha_actualizacion`** en `data/catalogo-base.json` (es el `lastmod` del sitemap) y vuelva a correr `npm run build`.
10. **Haga commit de todo lo que cambió**, incluidos los archivos generados (`servicios.html`, `productos.html`, las páginas de detalle, `sitemap.xml`, las páginas con encabezado y pie).

## Cómo cambiar el menú o el pie

- El HTML está en `partials/header.html` y `partials/footer.html`. Los tokens `{{…}}` los rellena el build; cualquier token que no exista hace fallar el build.
- Las categorías de los desplegables de Servicios y Productos y las listas del pie salen de `tipos.<servicio|producto>.categorias` de `data/catalogo.json`. Cambie ahí el nombre o el orden y corra `npm run build`. Mantenga igual el bloque `tipos` de `data/catalogo-base.json`: el build lee `catalogo.json` y solo usa el otro como respaldo y para validar archivos parciales.
- El comportamiento (abrir y cerrar, teclado, acordeón del teléfono) está en `assets/menu.js` y los estilos, en la sección «Menú: desplegables» de `src/tailwind.css`.
- Después de cambiar un partial, `npm run build` actualiza todas las páginas y `npm test` (`estructura.test.js`) comprueba que cada una tenga exactamente el encabezado y el pie vigentes.

## Cómo agregar una página estática nueva

1. Cree el `.html` en la raíz con el mismo `<head>` que las demás y los marcadores de encabezado y pie (arriba). Un `activo` inválido o una página sin marcadores hace fallar el build.
2. Corra `npm run build`: rellena el encabezado y el pie.
3. Agregue la ruta a `PAGINAS_ESTATICAS` en `scripts/catalogo/sitemap.js` (`[ruta, prioridad, changefreq]`); `tests/sitemap.test.js` avisa si falta. Si la página no debe salir en el sitemap, agréguela a `EXCLUIDAS`.
4. Si es la página de detalle de un ítem del catálogo, agregue su ruta a `paginas_existentes_como_detalle` en `data/catalogo.json` y `data/catalogo-base.json`, y úsela en `detalle.url` con `modo: "existente"`.
5. Si debe encontrarse con el buscador, agréguela a `SEARCH_INDEX` de `assets/search.js`. Los botones de WhatsApp y los demás clics que se quieran medir llevan `data-evento` (ver `README-MEDICION.md`).
6. `npm test`.

## Redirecciones

Están en `vercel.json` (clave `redirects`): todas permanentes, sin barra final y sin cadenas (el destino de una redirección nunca es el origen de otra). Cada URL vieja va con y sin `.html`. Las anclas viejas de `/hexagonal` y `/triangular` (por ejemplo `/hexagonal#web-corporativa-crm`) las lleva a su página nueva `assets/anclas-viejas.js`, que solo se carga en `/servicios` y `/productos`, y solo cuando la URL trae ancla (lo decide `scripts/catalogo/final.html`). Para agregar una redirección: dos entradas (con y sin `.html`), destino real y sin cadenas. `tests/redirecciones.test.js` comprueba esas reglas, que ninguna página vieja se alcance sin redirección y que ninguna redirección tape una página viva.

## Medición

Google Analytics 4 y Microsoft Clarity, con `assets/medicion.js`. Los clics se miden con atributos `data-evento`, `data-product`, `data-item` y `data-linea`. Los eventos, sus parámetros y qué mirar cada semana están en [`README-MEDICION.md`](README-MEDICION.md).

## Despliegue

El sitio se publica en Vercel desde la raíz del repositorio con `"buildCommand": "npm install && npm run build"` y `"outputDirectory": "."` (ver `vercel.json`, que también define `cleanUrls`, las cabeceras de seguridad y la política de contenido). El CSS compilado no está en git: lo produce el build.

Después de publicar:

1. Revisar el despliegue en Vercel (que `/`, `/servicios`, `/productos` y las páginas de detalle carguen).
2. Purgar la caché de Cloudflare (Caching, Purge Everything).
3. Revisar en una ventana de incógnito las páginas principales y que las URLs viejas redirijan a su destino nuevo.
4. Si cambió el sitemap, volver a enviarlo en Google Search Console.

## Pruebas

`npm test` corre estos archivos de `tests/` en este orden y se detiene en el primero que falle. Ninguno necesita dependencias.

| Archivo | Qué comprueba |
|---|---|
| `planes.test.js` | El único descuento de planes: 30 % por pagar 12 meses por adelantado (mensual × 12 × 0,70), con 2 decimales en lo Triangular y redondeado en lo Hexagonal. |
| `precios.test.js` | El formato de precios de todo el sitio (Hexagonal en múltiplos de 10, Triangular en `,99`) y que no queden reglas ni descuentos viejos. |
| `software.test.js` | La tabla de precios de Club, Condominio y Gym (`assets/precios-software.js`), sus bordes de plan y que las tres páginas lean de la misma fuente. |
| `club.test.js` | La calculadora de `/club`: la línea sale de la pregunta de la junta y el plan, del número de socios. |
| `eventos.test.js` | `assets/eventos.js` con fechas simuladas: qué talleres y cohortes se ofrecen según el día en Venezuela y el aviso cuando no queda ninguna fecha. |
| `catalogo.test.js` | El catálogo contra las reglas de `data/ESQUEMA.md` (las mismas de `validar-catalogo.js`). |
| `listados.test.js` | `/servicios` y `/productos` al día respecto del catálogo; cada ítem una sola vez como tarjeta; tarjetas con un solo enlace y sin WhatsApp; precios; el marcador de tarjetas. |
| `detalle.test.js` | Las 23 páginas de detalle al día y cada una revisada: secciones, precios, mensajes de WhatsApp, enlaces relacionados y nombres de línea. |
| `estructura.test.js` | Encabezado y pie de cada página idénticos a `partials/`, navegación y desplegables desde el catálogo, y build idempotente. |
| `inicio.test.js` | La página de inicio: portada, las dos líneas con la Hexagonal primero, tarjetas destacadas al día, preguntas frecuentes y datos estructurados. |
| `extras.test.js` | Los contenidos extra de `/servicios` y `/productos` insertados tal cual, el cuestionario, «Cómo pagas» y el bloque de recomendados. |
| `buscador-luci.test.js` | El buscador y Luci siguen el catálogo (rutas, precios, categorías) y no usan nombres ni rutas retiradas. |
| `enlaces.test.js` | Todos los `href` y `src` internos de las páginas vivas existen, con su ancla, o tienen una redirección. |
| `redirecciones.test.js` | Las reglas de `vercel.json` (únicas, permanentes, sin cadenas) y las anclas viejas de `assets/anclas-viejas.js`. |
| `sitemap.test.js` | `sitemap.xml` al día, todas las URLs existen, no falta ninguna página viva, y `robots.txt`. |
| `meta.test.js` | Largo de títulos y descripciones, mensajes de WhatsApp que empiezan con «Hola F&V», áreas táctiles de 44 px en el encabezado y el pie, y contenedor común de las secciones de detalle. |
