# ManuRestaurantes

Menus digitales para restaurantes, accesibles por codigo QR.
Astro + Sanity, un solo deploy en Vercel.

El plan completo esta en [PLAN.md](./PLAN.md).

## Como funciona la multi-tenancy

Cada restaurante es **un proyecto de Sanity independiente**. El `projectId` es
un parametro del cliente, no algo horneado en el build, asi que todos los
restaurantes se sirven desde **un unico deploy**:

```
src/tenants.ts        registro slug -> projectId
/r/<slug>             menu publico  (ISR, 60s)
/studio/<slug>        Studio de ESE restaurante
```

El aislamiento entre clientes no depende de permisos: el dueño de cada
restaurante esta invitado unicamente a su propio proyecto de Sanity, asi que no
tiene forma de ver los demas. Eso evita necesitar el plan pago.

## Correr en local

Son dos procesos, a proposito (ver la limitacion mas abajo):

```
npm install
npm run dev      # sitio publico  -> http://localhost:4321
npm run studio   # Sanity Studio  -> http://localhost:3333
```

- Menu: http://localhost:4321/r/demo
- Indice interno: http://localhost:4321
- Studio (local): http://localhost:3333

### Limitacion conocida: el Studio embebido no levanta en `npm run dev`

`/studio/<slug>` funciona en **produccion** (verificado en el deploy) pero
**no** con el servidor de desarrollo de Astro. Astro 7 pre-bundlea dependencias con rolldown,
y ese paso falla resolviendo los exports internos del paquete `sanity`, que se
auto-referencia (`sanity/lib/structure.js` importa de `sanity`). La pagina del
Studio queda en blanco con `Failed to fetch dynamically imported module`.

No afecta al producto:

- El build de produccion **si** bundlea el Studio y emite sus chunks.
- El menu publico no toca ese codigo: no tiene islas de cliente, se sirve con
  cero JavaScript.

Para editar contenido en local se usa `npm run studio`, que levanta el Studio
nativo de Sanity en su propio puerto, sin pasar por Vite de Astro. Es ademas el
flujo que recomienda Sanity.

Si en algun momento se quiere el Studio embebido tambien en dev, las salidas son
bajar Astro a una version pre-rolldown, o dejar de embeberlo y publicar un
Studio hospedado por proyecto con `sanity deploy`.

`src/tenants.ts` viene con un tenant `demo` cuyo `projectId` es un placeholder.
Hasta reemplazarlo por uno real, el menu muestra el cartel de "no pudimos
cargar el menu": es el comportamiento correcto, no un error del scaffold.

## Iconos

Los SVG de `src/icons/` se incrustan en el HTML al compilar. El nombre del
archivo es el nombre del icono, y para los alergenos tiene que coincidir con la
etiqueta del plato (`vegetariano.svg`, `sin-tacc.svg`, `picante.svg`, …).

Agregar o reemplazar un icono es soltar el archivo ahi y correr:

```
node scripts/normalizar-iconos.mjs           # informe
node scripts/normalizar-iconos.mjs --write   # aplica
```

Tres reglas, y la primera es la que importa:

1. **Ningun color escrito en el archivo.** Todo `fill` y `stroke` va en
   `currentColor`. Eso es lo que hace que el MISMO archivo salga negro en La
   Tropilla y bronce en Truman. El normalizador lo arregla solo.
2. **Sin `width` ni `height`** en el `<svg>` raiz: el tamano lo pone el CSS.
3. **Misma grilla para todos** (`viewBox="0 0 24 24"`), o se ven de tamanos
   distintos aunque el CSS diga lo mismo.

Los alergenos se dibujan a 18px: hacen falta formas gruesas, sin detalle fino.
Un icono sin archivo simplemente no se renderiza — nunca un recuadro roto.

**Ojo con las mayusculas.** Windows no las distingue, asi que `Vegetariano.svg`
y `vegetariano.svg` son el mismo archivo y uno pisa al otro sin avisar. Todo en
minuscula.

## Alta de un restaurante nuevo

1. Crear el proyecto de Sanity:
   ```
   npx sanity@latest projects create "Nombre del restaurante"
   ```
2. En sanity.io/manage, en **ese** proyecto, agregar a CORS origins (origin =
   protocolo + host + puerto, **sin ruta**), las dos con **Credentials activado**:
   - `http://localhost:3333` — el Studio local (`npm run studio`)
   - el dominio de produccion — el Studio embebido en `/studio/<slug>`

   El menu publico no necesita CORS: consulta a Sanity desde el servidor, y el
   CORS es una restriccion del navegador.
3. Invitar al dueño como Administrator de ese proyecto (y solo de ese).
4. Agregar la entrada en `src/tenants.ts`:
   ```ts
   { slug: 'milanga', label: 'Milanga Bar', projectId: 'abc12345', dataset: 'production' }
   ```
   El `slug` se imprime en el QR: una vez que hay carteles en las mesas, no se
   toca nunca mas.
5. Desplegar. El Studio del cliente queda en `/studio/<slug>`.
6. En el Studio, cargar "Datos del restaurante" y activar **Menu publicado**.

## Alta de un restaurante nuevo

1. **Proyecto de Sanity.** Crearlo en sanity.io/manage. Agregar a sus CORS
   `http://localhost:3333` y el dominio de produccion, con Credentials activado
   (el menu publico no necesita CORS: consulta desde el servidor).
2. **Token.** Crear uno con permiso Editor y ponerlo en `.env`.
3. **Tenant.** Una entrada en `src/tenants.ts` (slug, projectId, timezone).
4. **Diseno.** `src/restaurants/<slug>/theme.ts` con los tokens del local y
   `<Nombre>Menu.astro` con el layout. Registrar los dos en
   `src/restaurants/index.ts` y agregar el projectId y la variable del token al
   mapa `RESTAURANTES` de `scripts/import-carta.mjs`.
5. **Carta.** `scripts/<slug>-carta.json`.
6. **Previsualizar** el diseno antes de cargar nada:
   `npm run dev` y abrir `http://localhost:4321/preview/<slug>`. Renderiza el
   diseno desde el JSON, sin pasar por Sanity, usando los `precioMaqueta` para
   ver la pagina llena. Solo funciona en desarrollo.
7. **Importar** (ver abajo) y publicar desde el Studio.

## Cargar la carta en Sanity

```
node --env-file=.env scripts/import-carta.mjs <slug>                   # simulacro
node --env-file=.env scripts/import-carta.mjs <slug> --write
node --env-file=.env scripts/import-carta.mjs <slug> --write --purge-otros
```

- Es **idempotente**: los `_id` son determinisiticos (`<slug>-cat-*`,
  `<slug>-dish-*`) y se usa `createOrReplace`. Correrlo dos veces no duplica.
- **Nunca uses puntos en los `_id`.** Un id con puntos crea una ruta en Sanity
  y los documentos bajo una ruta no se leen de forma anonima: el Studio muestra
  la carta completa y el menu del QR le llega VACIO al cliente.
- **No escribe** mientras la carta tenga `"revisado": false`. La transcripcion
  sale de fotos y hay que verificarla contra el original.
- Solo lee campos conocidos, asi que claves auxiliares como `precioMaqueta`
  nunca llegan a Sanity.
- `--purge-otros` borra el contenido que no pertenece a ese restaurante.
  El documento `restaurant` no se borra: se reemplaza.
- El menu se importa **sin publicar**. Se revisa y se publica desde el Studio.

Antes de cualquier escritura conviene un respaldo del dataset; los respaldos van
a `backups/`, que esta en `.gitignore` porque pueden contener datos de clientes.

## Estructura

```
src/tenants.ts        registro de restaurantes (fuente de verdad del routing)
src/lib/sanity.ts     un cliente de Sanity por tenant, memoizado
src/lib/queries.ts    GROQ: una query por pagina
src/lib/format.ts     precios es-AR sin decimales, fechas
src/lib/image.ts      srcset contra el CDN de Sanity
src/themes/presets.ts paletas y tipografias (fuente de verdad de la estetica)
src/themes/resolve.ts aplica overrides SOLO si pasan contraste WCAG AA
sanity/schemaTypes/   modelo de contenido
sanity/structure.ts   menu lateral del Studio
```

## Decisiones que conviene no revertir sin pensarlo

- **ISR y no SSG.** Con N restaurantes, rebuildear todo el sitio porque uno
  cambio un precio no escala.
- **Un front-end a medida por restaurante.** El producto dejo de ser una
  plantilla configurable: cada local tiene su diseño en `src/restaurants/<slug>/`
  y el registro de `src/restaurants/index.ts` lo asocia a su slug. Lo compartido
  es la capa de datos y los estados de error, no lo visual.
  (`src/themes/*` quedo dormido de la etapa de plataforma.)
- **El color de acento de un local puede no servir para texto.** El bronce de
  Truman da 3.08:1 sobre blanco: alcanza para reglas, no para precios. Por eso
  cada tema define `--accent` (decorativo) y `--accent-ink` (texto).
- **El orden se maneja arrastrando referencias**, no con campos numericos.
- **El layout no depende de las fotos.** Muchos restaurantes no tienen fotos
  usables; la foto es un plus, nunca un requisito estructural.

## Comandos

```
npm run dev        servidor de desarrollo
npm run build      build de produccion
npm run preview    previsualizar el build
npm run studio     Sanity Studio local en el puerto 3333
npm run typegen    regenerar tipos desde los schemas (requiere projectId real)
```
