import { defineField, defineType } from 'sanity';
import { PRESET_OPTIONS } from '../../src/themes/presets';
import { AccentInput, SurfaceInput } from '../components/SwatchSelect';

/**
 * Estetica del menu.
 *
 * El preset no es un tema cerrado: precarga fondo, acento y tipografias, y a
 * partir de ahi el restaurante cambia lo que quiera. Los colores se eligen de
 * listas curadas (palette.ts) en vez de un campo hex libre, asi que no existe
 * la combinacion que deja el menu ilegible.
 */
export const theme = defineType({
  name: 'theme',
  title: 'Estética',
  type: 'object',
  options: { collapsible: true, collapsed: false },
  fields: [
    defineField({
      name: 'preset',
      title: 'Punto de partida',
      description:
        'Elegí el que más se parezca a tu lugar. Define las tipografías y precarga los colores; después cambiás lo que quieras.',
      type: 'string',
      options: { list: PRESET_OPTIONS, layout: 'radio' },
      initialValue: 'bodegon',
    }),
    defineField({
      name: 'surface',
      title: 'Fondo',
      description:
        'Cambia el fondo, el color del texto y el de las tarjetas, todo junto. Dejalo vacío para usar el del punto de partida.',
      type: 'string',
      components: { input: SurfaceInput },
    }),
    defineField({
      name: 'accent',
      title: 'Color de acento',
      description:
        'Se usa en promociones, precios destacados y avisos. Solo se ofrecen los que se leen bien sobre el fondo elegido.',
      type: 'string',
      components: { input: AccentInput },
    }),
  ],
});
