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

`/studio/<slug>` funciona en el **build de produccion** pero **no** con el
servidor de desarrollo de Astro. Astro 7 pre-bundlea dependencias con rolldown,
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
- **Los presets viven en codigo.** Sanity guarda el id del preset elegido, no
  los colores. Asi, mejorar un preset mejora a todos los clientes que lo usan.
- **Los overrides de color se validan por contraste.** Un color que deje el
  menu ilegible se descarta en silencio (`src/themes/resolve.ts`).
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
