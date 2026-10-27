# CLAUDE.md — fvaigroup.com

Sitio estático de F&V AI Group (HTML + JS sin framework, build en Node + Tailwind 3), desplegado en Vercel desde `main`. Detalle completo en `README.md`, reglas comerciales en `PRODUCT.md`, diseño en `docs/design-system-fvaigroup.md`.

## Stack y estructura
- Sin framework. Node 24, única dependencia: `tailwindcss@3.4`. Función serverless: `api/lead.js` (env: `LEAD_WEBHOOK_URL`).
- Fuente única de servicios/productos: `data/catalogo.json` (+ `catalogo-base.json`, `ESQUEMA.md`).
- **Generado, no editar a mano:** `servicios.html`, `productos.html`, `servicios/*.html`, `productos/*.html`, `sitemap.xml`, y los bloques entre marcadores `<!-- header/footer/tarjetas:inicio -->`. Se cambian en `data/`, `partials/` o `scripts/catalogo/` y se corre el build.
- Páginas a mano: index, nosotros, contacto, casos, ejecutivos, club, condominio, gym, paginas-web, curso-finanzas-ia, calculadoras, privacidad, terminos, 404.
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
