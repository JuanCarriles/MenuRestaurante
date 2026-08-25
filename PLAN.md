# ManuRestaurantes — Plan de acción

Menú digital para restaurantes, accesible por QR. Astro + Sanity, deploy en Vercel.

## Estado

- [x] **Fase 1 — Andamiaje.** Proyecto Astro 7 + Tailwind v4 + Studio multi-workspace, desplegado en Vercel. Ruta `/r/[slug]` renderizando con tema aplicado.
- [x] **Studio embebido confirmado en produccion.** `/studio/<slug>` funciona en el deploy; queda descartado el plan B de publicar un Studio por proyecto con `sanity deploy`. En desarrollo se usa `npm run studio` (puerto 3333).
- [x] **Fase 2 — Modelo de contenido.** Schemas completos en `studio/schemaTypes/`, singleton fijado, estructura del Studio en espanol.
- [x] **Fase 3 — Capa de datos.** Query GROQ unica, cliente por tenant, ISR configurado. Falta el webhook de invalidacion inmediata.
- [x] **Primer cliente real cargado.** Proyecto `6z4dmaab` ("La Tropilla") en `src/tenants.ts`, con menu y promocion renderizando.
- [x] **Fase 0 — Definicion visual.** Seis direcciones disenadas y publicadas como lienzo:
      https://claude.ai/code/artifact/bdae0ef2-01ce-47fc-9cb5-f3644921142c
      Bodegon, Pizarra y Editorial no usan fotos; Vitrina, Marca y Bistro si.
      Los 28 pares de color verificados contra WCAG AA.
      Archivos fuente en `design/`.
- [ ] **Decision pendiente:** cuales de los seis presets entran a la v1, y si
      Vitrina justifica agregar campo de imagen a `menuCategory` en Sanity.
- [x] **Fase 4 (tokens) — Los 6 presets cargados al codigo.** `src/themes/presets.ts`
      con paleta, tipografias y estilo de encabezado de categoria de cada uno.
      Cada pagina emite solo la hoja de Google Fonts de su preset.
- [x] **Personalización libre, primera mitad.** Imagen de portada (hero) con
      degradado calculado, y paleta curada de 8 fondos x 12 acentos elegibles
      por muestra visual en el Studio. El acento se filtra segun el fondo: solo
      se ofrecen los que se leen bien encima.
- [ ] **Personalización libre, segunda mitad.** Select de tipografias con
      preview renderizado (12-16 familias), y presentacion por categoria
      (lista / grilla de 2 / destacado con foto).
- [ ] **Fase 5 — Variantes de layout.** Hoy los 6 presets comparten UNA sola
      estructura de pagina: se distinguen por color y tipografia, no por layout.
      Vitrina (banda fotografica por categoria), Marca (grilla de categorias) y
      Bistro (miniatura redonda) todavia no existen como layouts.
- [ ] **Optimizacion pendiente:** self-hostear las tipografias con @fontsource
      para sacar el request a fonts.googleapis.com del camino critico.

Versiones reales instaladas (mas nuevas que las asumidas al escribir este plan):
Astro 7.2, Sanity 6.10, @astrojs/vercel 11.0, Tailwind 4.3, React 19.2.

## Decisiones tomadas

| Decisión | Elección |
|---|---|
| Modelo | **Multi-restaurante**: un solo deploy, **un Sanity project gratuito por restaurante**, ruta `/r/[slug]` |
| Edición | **Por etapas**: fase 1 carga Bejuca, fase 2 se pule el Studio para autogestión del dueño |
| Estética | **Preset como punto de partida + paleta curada**: el preset precarga fondo, acento y tipografías; el restaurante los cambia desde listas cerradas de colores (nunca hex libre) |

## Contexto de uso (esto manda sobre todo lo demás)

El usuario final está **sentado en una mesa, con datos móviles, con hambre y con una mano**. Eso define los criterios de aceptación:

- LCP < 2s en 4G lento. Presupuesto de página: ~150 KB de transferencia inicial.
- El menú se lee **sin JavaScript**. JS sólo para buscador y nav sticky (islas Astro).
- Todo el texto legible sin zoom: mínimo 16px en cuerpo, contraste AA garantizado.
- Cero pantalla de carga. Cero carrusel. Cero modal de cookies (no hay tracking).

---

## Arquitectura

### Multi-tenancy: un proyecto de Sanity por restaurante

El plan gratuito de Sanity da **2 datasets por proyecto, públicos únicamente**, y roles limitados a Administrator/Viewer. Un dataset por restaurante se agota en el segundo cliente. En cambio, **no hay límite documentado de proyectos gratuitos por cuenta**.

Por eso: **cada restaurante = un proyecto de Sanity propio**. El `projectId` es sólo un parámetro del cliente de Sanity, no algo horneado en el build, así que **sigue habiendo un único deploy**.

```
src/tenants.ts
  "milanga"  → projectId abc123 ─┐
  "parrilla" → projectId def456 ─┼──> Astro (SSR + ISR en Vercel) ──> /r/[slug]
  "bistro"   → projectId ghi789 ─┘              │                          ▲
                                                │                     QR impreso
        /studio  (multi-workspace, uno por proyecto)
```

**El aislamiento sale gratis**: el dueño de cada restaurante es Administrator de *su* proyecto y no está invitado a los demás. No hay nada que restringir — se resuelve el problema de permisos sin pagar Growth.

- **Astro 7** con `output: 'server'` y adapter `@astrojs/vercel`, usando **ISR** (`expiration: 60`) en las rutas de menú. Un cambio de precio se ve en ≤60s sin rebuild global.
- **Sanity Studio embebido** en `/studio` vía `@sanity/astro`, con **un workspace por proyecto** (`/studio/milanga`, `/studio/parrilla`). Un solo repo, un solo deploy.
- Datasets públicos ⇒ **no hace falta token de lectura**. Contrapartida: los borradores también son legibles por quien conozca el `projectId`. Aceptable para un menú; tenerlo presente.

**Costo del enfoque:** dar de alta un cliente = crear el proyecto en Sanity + una línea en `tenants.ts` + redeploy + agregar el dominio a los CORS de ese proyecto.
- **Tailwind v4** con los tokens de tema como CSS custom properties (ver Fase 4).
- **Imágenes** desde el CDN de Sanity con `srcset` responsive, `auto=format`, y LQIP del metadata de Sanity para el blur placeholder.

---

## Modelo de contenido (Sanity)

Cuatro tipos de documento y un objeto de tema. El orden se maneja con **arrays de referencias** en el padre (drag & drop nativo del Studio), no con campos `order` numéricos — los campos `order` son un infierno de mantener para un no técnico.

> Como cada restaurante tiene su propio proyecto, `restaurant` es un **singleton**, no lleva `slug` (la URL la define `src/tenants.ts`) y `dish`/`menuCategory`/`promotion` **no necesitan campo `restaurant`**. Eso también elimina el Structure Builder anidado.

### `restaurant` (singleton del proyecto)
```
name            string, requerido
logo            image (con alt)
tagline         string, corto
promotions      array<reference→promotion>   ← se renderiza PRIMERO, siempre
menu            array<reference→menuCategory> ← orden de categorías, drag & drop
theme           object → ver Fase 4
contact         object { whatsapp, telefono, instagram, direccion, mapsUrl }
hours           array<{ dias, horario }>  ← horario es texto libre: el doble
                turno (mediodia + noche) no entra en un par apertura/cierre
currency        string, default "ARS"
notice          string opcional → banner ("Hoy sin pescado", "Efectivo 10% off")
published       boolean → si es false, la ruta devuelve 404
```

### `menuCategory`
```
title           string, requerido        ("Entradas", "Pastas")
description     text opcional
items           array<reference→dish>    ← orden de platos, drag & drop
```

### `dish`
```
name            string, requerido
description     text, max ~140 chars (validación: si es más largo no entra en la card)
price           number, requerido
variants        array<{ label, price }> opcional  ("Media porción", "Entera")
image           image opcional (con alt)
tags            array<string> de lista cerrada: vegetariano, vegano, sin TACC, picante, novedad
available       boolean, default true → si es false se filtra en GROQ y no viaja
```

### `promotion`
```
name            string, requerido        ("Combo Milanesa + Papas + Bebida")
description     text
price           number, requerido
compareAtPrice  number opcional → tacha el precio original, muestra el % off
image           image opcional
includes        array<reference→dish> opcional → platos que componen la promo
validFrom       date opcional
validUntil      date opcional → vencida = no se renderiza (se filtra en GROQ, no en el cliente)
```

**Requisito clave:** las promociones se renderizan en una banda destacada arriba de todas las categorías, con tratamiento visual propio (acento, badge, borde). No son una categoría más.

### Structure Builder del Studio
Cada workspace ya contiene un solo restaurante, así que no hace falta filtrar nada. Sólo se ordena el menú lateral y se fija el singleton:

```
├─ Promociones
├─ Menú (categorías → platos)
├─ Estética
└─ Datos y horarios      ← singleton `restaurant`, sin lista ni botón "crear"
```

---

## Fases

### Fase 0 — Definición visual · ~0.5 día
- Juntar 3–4 referencias reales de menús digitales que te gusten y 2 que no.
- Definir los 4–6 presets de tema con nombre: *Clásico*, *Parrilla*, *Bistró*, *Cafetería*, *Nocturno*, *Minimal*. Cada uno = paleta + par tipográfico + radios + densidad.
- **Mockear con `/design`** las 3 pantallas clave (menú completo, card de plato con y sin foto, banda de promos) y los presets lado a lado, antes de escribir CSS.

### Fase 1 — Andamiaje · ~1 día
- `npm create astro@latest` — TS strict, sin template.
- Tailwind v4, `@sanity/astro`, `@sanity/image-url`, `@astrojs/vercel`.
- Crear el **primer** Sanity project (un restaurante real) con dataset `production`. El mapeo slug → projectId vive en `src/tenants.ts`, versionado, no en variables de entorno: crece con cada cliente y conviene verlo en el diff.
- Deploy vacío a Vercel funcionando + dominio. **Deployá el día 1, no el último.**
- CORS de Sanity: agregar el dominio de Vercel y `localhost:4321`.

### Fase 2 — Modelo de contenido · ~1–1.5 días
- Schemas de arriba, con validaciones reales (precio > 0, slug único, descripción con límite, alt requerido en imágenes).
- Structure Builder anidado por restaurante.
- Cargar **un restaurante real completo** como seed. No datos inventados: un menú real revela los casos borde (categorías con 40 platos, nombres larguísimos, platos sin precio fijo).

### Fase 3 — Capa de datos · ~0.5 día
- Una query GROQ por página, tipada con **`sanity typegen`** (genera tipos desde los schemas + las queries, sin escribir interfaces a mano).
- Filtrar promos vencidas y platos no disponibles **en el GROQ**, no en el componente.
- Cliente con `useCdn: true` y `perspective: 'published'`.
- Configurar ISR en el adapter de Vercel.

### Fase 4 — Design system y temas · ~1–1.5 días
Este es el corazón del producto y lo que lo diferencia de un PDF en Drive.

- **Tokens como CSS custom properties**: `--bg`, `--surface`, `--text`, `--text-muted`, `--accent`, `--accent-contrast`, `--border`, `--radius`, `--font-display`, `--font-body`.
- Los **presets viven en código** (`src/themes/presets.ts`), Sanity guarda sólo el `presetId` + overrides. Así podés mejorar un preset y todos los clientes que lo usan mejoran solos.
- Astro inyecta un `<style>:root{...}</style>` por restaurante en el `<head>`. Nada de clases dinámicas de Tailwind.
- **Validación de contraste**: util que calcula el ratio WCAG entre `--text`/`--bg` y `--accent`/`--accent-contrast`. Si un override baja de 4.5:1, se descarta y se usa el del preset. Esto es lo que hace seguro el modo "avanzado".
- **Tipografías**: 4–6 pares curados, self-hosted vía `@fontsource`. Declarás todos los `@font-face` en el CSS global — el navegador sólo descarga los que la página realmente usa.
- Componente de input custom en el Studio que muestra los presets como **swatches visuales**, no como un dropdown de strings.

### Fase 5 — Página de menú · ~1.5–2 días
`/r/[slug]`, una sola página con scroll (no rutas por categoría — el QR debe llevar a todo el menú).

- Header: logo, nombre, tagline, banner de `notice`, botón WhatsApp/Instagram.
- **Banda de promociones** destacada, primero.
- Nav de categorías sticky con scroll-spy (isla Astro, ~2 KB).
- Categorías → grilla o lista de platos. **El diseño tiene que verse bien sin fotos**: los restaurantes mandan fotos malas o ninguna. La foto es un plus, no un requisito de layout.
- Buscador/filtro por nombre y tags (isla, client-side, sin red).
- Estados vacíos: sin promos, categoría vacía, restaurante despublicado.
- JSON-LD `Restaurant` + `Menu` de schema.org, OG image.

### Fase 6 — QR y material imprimible · ~0.5 día
- Endpoint `/api/qr/[slug].svg` con la lib `qrcode` (SVG, escalable, imprimible).
- Página `/r/[slug]/qr` con vista previa, descarga en PNG alta resolución y SVG, y un **cartel de mesa listo para imprimir** (A6, "Escaneá para ver el menú" + logo + QR) en CSS print.
- Probar el QR impreso en papel real, con luz de restaurante y un teléfono viejo.

### Fase 7 — Studio para autogestión · ~1 día *(fase 2 del negocio)*
- Todos los labels y descripciones en español, escritos para alguien que no sabe qué es un "slug".
- Preview en vivo: iframe del menú al lado del editor (Presentation tool de Sanity).
- **Vista de edición rápida de precios**: una lista de todos los platos con el precio editable inline. Con la inflación, actualizar precios es la operación #1 y no puede requerir 40 clics.
- Onboarding: documento de 1 página + video de 3 minutos.

### Fase 8 — QA y lanzamiento · ~0.5–1 día
- Lighthouse mobile > 95 en performance y 100 en accesibilidad.
- Los 6 presets revisados con verificador de contraste.
- Navegación con lector de pantalla (VoiceOver/TalkBack).
- **Prueba real**: imprimir el QR, ir al restaurante, escanear con datos móviles.
- Checklist de onboarding de cliente nuevo (crear documento, cargar menú, generar QR, entregar).

**Total estimado: ~8–10 días de trabajo efectivo** (Fase 7 es diferida).

---

## Personalizacion: por que listas cerradas y no campos libres

El primer diseño daba un campo hex libre con un validador que descartaba en
silencio lo que rompia el contraste. Funcionaba, pero el cliente no entendia por
que "su color no se aplico".

El modelo actual invierte eso: se elige de listas curadas, asi que no existe la
opcion rota. Un FONDO no es un color suelto sino un juego coherente de cinco
tokens (fondo, tarjetas, texto, texto secundario, bordes), y el ACENTO se filtra
contra el fondo elegido — Ambar solo aparece sobre fondos oscuros, Bordo y Azul
solo sobre claros. Cada fondo conserva entre 8 y 11 acentos validos, asi que
filtrar no deja al cliente sin opciones.

Lo que NO se le ofrece al restaurante: el color del texto sobre el acento. Lo
calcula el sistema (blanco o casi negro, el que mas contraste de). Un acento con
texto de fantasia encima es la receta de un boton ilegible.

El degradado del hero cumple la misma funcion. Sobre una foto blanca — el peor
caso — el texto blanco necesita 0.535 de opacidad de negro para pasar AA; el
degradado entrega 0.72 a 0.76 donde cae el texto, o sea 9:1 a 11:1, y deja la
parte de arriba clara para que la foto se siga viendo.

## Aprendizajes de la implementacion

Cosas que costaron y conviene no volver a tropezar:

- **La carpeta del Studio se llama `studio/`, no `sanity/`.** Una carpeta local
  llamada `sanity/` tapa al paquete npm `sanity`: Vite resuelve
  `import ... from 'sanity/structure'` contra `./sanity/structure.ts` y el build
  falla con un `MISSING_EXPORT` que no dice nada del verdadero problema.
- **Los fallbacks de tema van dentro de `@layer base`.** El bloque `:root` que
  inyecta cada pagina es CSS sin capa, y el CSS sin capa le gana a cualquier
  capa. Si los fallbacks quedan fuera de la capa, tienen la misma especificidad
  que el tema y gana el que cargue ultimo (la hoja global): el tema del
  restaurante se pisa en silencio y nadie se entera hasta que un cliente
  pregunta por que su tipografia no cambia.
- **Para filtrar arrays de referencias en GROQ, el filtro va en el array de
  referencias, no despues del `->`.** Verificado contra la API real:
  `items[defined(@->_id) && @->available != false]->{...}` elimina elementos,
  mientras que `items[]->{...}[available != false]` y `items[]->[cond]{...}` se
  aplican elemento por elemento como condicional: el que no cumple se vuelve
  `null` en vez de desaparecer, y el array queda lleno de nulls que revientan
  cualquier `.map` del componente. Este bug tumbo la pagina la primera vez que
  se cargo contenido real.
- **`defined(@->_id)` no es opcional.** Con `perspective: 'published'`, una
  referencia a un documento en borrador dereferencia a `null`. Y el dueño va a
  crear platos sin publicarlos: es el flujo por defecto del Studio.
- **El `projectId` de Sanity solo acepta `[-a-z0-9]`.** Un placeholder con
  guiones bajos revienta al crear el cliente.
- **`create-astro` no corre sobre un directorio con archivos** y no tiene modo
  no-interactivo para eso. Con un `PLAN.md` presente hay que armar el scaffold
  a mano.

## Riesgos y cosas a verificar

1. **Escala de la cuenta de Sanity.** El aislamiento queda resuelto con un proyecto por restaurante, pero cada proyecto trae su propia cuota gratuita (requests, bandwidth, documentos) y su propia administración. Con 30 clientes son 30 proyectos que crear, invitar y mantener a mano. Antes del cliente ~10 conviene scriptear el alta con la CLI de Sanity, y confirmar con soporte que no hay tope de proyectos gratuitos por cuenta (no está documentado).
2. **Contraste.** El override avanzado es la vía más rápida a un menú ilegible. La validación de la Fase 4 no es opcional.
3. **Precios y moneda.** Formateo `es-AR`, sin decimales. Considerar un campo global "precios actualizados al [fecha]".
4. **Menús gigantes.** Un menú de 150 platos con fotos rompe el presupuesto de peso. Lazy loading de imágenes fuera del viewport desde el primer día.
5. **Fotos de los clientes.** Definí un tamaño mínimo y validalo en el Studio; y que el layout no dependa de ellas.

## Fuera de alcance (v1, dejar explícito)

Pedidos online, carrito, pagos, reservas, multi-idioma, modo oscuro automático, analytics.
Multi-idioma y analytics simple (Vercel Analytics) son los candidatos más razonables para v2.
