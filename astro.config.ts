import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';
import sanity from '@sanity/astro';
import tailwindcss from '@tailwindcss/vite';
import { TENANTS } from './src/tenants';

const [primary] = TENANTS;

export default defineConfig({
  output: 'server',

  // ISR en vez de SSG: con N restaurantes, rebuildear el sitio entero porque
  // uno cambio el precio de una milanesa no escala. 60s de frescura alcanza.
  // Para invalidacion inmediata desde un webhook de Sanity, agregar bypassToken
  // y pegarle a la ruta con el header x-prerender-revalidate (Fase 3).
  adapter: vercel({
    isr: {
      expiration: 60,
      // El Studio es una app React con sesion: nunca debe servirse cacheada.
      exclude: [/^\/studio/],
    },
  }),

  // LIMITACION CONOCIDA (dev): el Studio embebido en /studio NO levanta con
  // `npm run dev`. El pre-bundler de dependencias de Astro 7 (rolldown) falla
  // resolviendo los exports internos del paquete `sanity`, que se
  // auto-referencia. El BUILD de produccion si funciona: bundlea el Studio y
  // emite sus chunks. Para editar contenido en local se usa `npm run studio`,
  // que levanta el Studio nativo de Sanity en su propio puerto.
  integrations: [
    sanity({
      // El Studio multi-workspace se define en sanity.config.ts. Estos valores
      // solo alimentan el helper `sanityClient` de la integracion, que NO
      // usamos: cada tenant arma su propio cliente en src/lib/sanity.ts.
      projectId: primary.projectId,
      dataset: primary.dataset,
      useCdn: true,
      studioBasePath: '/studio',
    }),
    react(),
  ],

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '~': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
});
