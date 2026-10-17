# Esquema del catálogo (data/catalogo.json)

Fuente ÚNICA de los servicios y productos de fvaigroup.com. Para agregar o cambiar uno se edita este archivo y se corre
`npm run build`; el build genera las tarjetas, `/servicios`, `/productos`, las páginas de detalle y el `sitemap.xml`.
Valide con `node scripts/validar-catalogo.js` (también corre en `npm test`).

## Raíz

| Clave | Contenido |
|---|---|
| `lineas` | `hex` y `tri`: forma (⬡ ▲), clase CSS (`linea-hex`, `linea-tri`), leyenda y trato (usted / tú). |
| `tipos` | `servicio` y `producto`: título, ruta, archivo, meta, intro, definición y `categorias` (id, nombre, intro). El id de la categoría es también el ancla (`/servicios#diagnostico`). |
| `items` | Cada servicio o producto (ver abajo). |
| `paginas_compartidas` | Páginas de detalle que reúnen a varios ítems (por ejemplo los 3 niveles de Acompañamiento). |
| `bloques` | Textos reutilizables que un ítem puede citar en `contenido.bloques` (método de implementación, formas de pago, etc.). |

## Ítem

```json
{
  "id": "tablero-gerencial",
  "tipo": "servicio",
  "categoria": "implementacion",
  "linea": "hex",
  "orden": 10,
  "nombre": "Tablero Gerencial",
  "frase": "Ventas, caja, cobranza y margen en un solo lugar, al día.",
  "precio": { "modo": "a-medida", "texto": "a medida", "referencia": "desde $600", "periodo": null, "nota": "precio final después del diagnóstico" },
  "plazo": "2 semanas de entrega",
  "detalle": { "modo": "generada", "url": "/servicios/tablero-gerencial" },
  "wa": { "mensaje": "Hola F&V, me interesa el Tablero Gerencial (⬡)." },
  "contenido": {
    "que_es": "", "para_quien": [], "incluye": [], "pasos": [{ "titulo": "", "texto": "" }],
    "planes": [{ "id": "", "nombre": "", "precio": "", "detalle": "", "incluye": [], "wa": "" }],
    "plazo": "", "pago": "", "faq": [{ "p": "", "r": "" }], "bloques": ["metodo-implementacion"], "extra_html": ""
  },
  "relacionados": ["sprint-automatizacion"],
  "meta": { "titulo": "", "descripcion": "" }
}
```

Reglas (las comprueba `scripts/validar-catalogo.js`):

- `frase`: de 3 a 15 palabras. Sin jerga en lo Hexagonal.
- `linea`: todos los servicios son `hex`. Los productos pueden ser `hex` o `tri`.
- Precios: `hex` en múltiplos de 10 con punto de miles (`$1.000`); `tri` terminan en `,99` (`$39,99`).
- `precio.modo`:
  - `fijo`: `texto` es el precio (`$270`, `$120 o $480`). `periodo` puede ser `al mes`, `por persona`, `pago único` o `null`.
  - `desde`: `texto` es `desde $X`. Con `periodo` si es mensual.
  - `a-medida`: `texto` es `a medida`. Si lleva `referencia` («desde $600»), `nota` debe decir «precio final después del diagnóstico».
  - `software`: `producto` (`club`, `condominio`, `gym`); el precio sale de `assets/precios-software.js`, no se escribe aquí.
  - `evento`: `evento` (`curso` o `taller`); precio y fechas salen de `assets/eventos.js`.
- `detalle.modo`:
  - `generada`: `url` es `/servicios/<pagina>` o `/productos/<pagina>`; el build crea la página. `pagina` (opcional) apunta a una `paginas_compartidas` y `ancla` al id dentro de ella.
  - `existente`: `url` es una de `paginas_existentes_como_detalle` del archivo `catalogo-base.json` (`/club`, `/paginas-web`, `/ejecutivos#programa-ejecutivo`, ...).
- `wa.mensaje`: empieza con «Hola F&V», nombra el producto y lleva la forma de la línea entre paréntesis: `(⬡, $270)` o `(▲, $39,99/mes)`. Nunca el nombre de la línea.
- En ningún texto: «Línea Hexagonal», «Línea Triangular», «Express», «Asesor F&V», «Sesión Clara», «Pack Enfoque».
- `relacionados`: de 2 a 3 ids de la misma categoría (Hexagonal primero).
- Cada sección de `contenido` que quede vacía simplemente no se muestra en la página de detalle. No se inventa contenido.
- Un ítem `tri` nunca ofrece asesoría ni consultoría.

## Campos adicionales

- `product` (opcional): valor de `data-product` en los botones de WhatsApp (medición GA4). Si falta, se usa `id`. Se conservan los ids de producto que ya existían, por ejemplo `diagnostico-270`.
- `detalle.url` puede llevar ancla (`/servicios/acompanamiento#estandar`) cuando el ítem comparte página con otros.
- Tarjeta: si `precio.modo` es `a-medida` y hay `precio.referencia`, la tarjeta dice «A medida» y debajo «Referencia: desde $600»; la página de detalle añade `precio.nota`.

## Página compartida (`paginas_compartidas`)

```json
{ "id": "acompanamiento", "tipo": "servicio", "categoria": "acompanamiento", "linea": "hex",
  "nombre": "Acompañamiento Continuo", "frase": "…", "miembros": ["acompanamiento-estandar", "acompanamiento-prioritario", "director-ia"],
  "wa": { "mensaje": "Hola F&V, …(⬡)." }, "contenido": { "…": "mismos campos que un ítem" }, "meta": { "titulo": "", "descripcion": "" } }
```
Cada miembro tiene `detalle: { "modo": "generada", "url": "/servicios/acompanamiento#estandar", "pagina": "acompanamiento" }`.
La página muestra el contenido propio y, por cada miembro, una sección con su `id` como ancla, su nombre, precio y `contenido.planes`/`que_es`.

## Bloque reutilizable (`bloques`)

```json
"metodo-implementacion": { "titulo": "Cómo trabajamos", "texto": "", "pasos": [{ "titulo": "", "texto": "" }], "items": [] }
```
Se cita desde `contenido.bloques`; sirve para que las páginas con poco texto propio reutilicen texto YA PUBLICADO (método, formas de pago, abono del diagnóstico) sin inventar nada.
