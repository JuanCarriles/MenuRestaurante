import imageUrlBuilder from '@sanity/image-url';
import type { SanityClient } from '@sanity/client';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

/**
 * El presupuesto de la pagina es ~150 KB iniciales sobre datos moviles. Todo
 * lo que sale del CDN de Sanity va con ancho explicito y `auto=format` para que
 * el navegador reciba AVIF/WebP donde pueda.
 */
// Los escalones chicos existen para las miniaturas de plato (72px de lado): sin
// ellos el navegador baja 320px para un hueco de 72 y se paga de mas.
const WIDTHS = [96, 160, 320, 480, 640, 960] as const;

export function imageFor(client: SanityClient, source: SanityImageSource) {
  // `quality` importa mas de lo que parece: los restaurantes suben fotos en PNG
  // (capturas, imagenes de WhatsApp reguardadas) y un PNG sin recomprimir se va
  // arriba de 500 KB por plato, que es todo el presupuesto de la pagina.
  const builder = imageUrlBuilder(client)
    .image(source)
    .auto('format')
    .quality(75)
    .fit('crop');

  return {
    src: builder.width(640).url(),
    srcset: WIDTHS.map((w) => `${builder.width(w).url()} ${w}w`).join(', '),
    /** Ancho de referencia para el layout; el srcset decide el real. */
    width: 640,
  };
}

/** Placeholder difuso embebido en el HTML, sin pedido extra de red. */
export function blurDataUrl(source: { asset?: { metadata?: { lqip?: string } } } | undefined) {
  return source?.asset?.metadata?.lqip;
}
