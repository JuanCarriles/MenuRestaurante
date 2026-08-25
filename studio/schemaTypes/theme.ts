import { defineField, defineType } from 'sanity';
import { PRESET_OPTIONS } from '../../src/themes/presets';

/**
 * Los colores reales viven en src/themes/presets.ts. Aca solo se guarda que
 * preset se eligio y que overrides pidio el restaurante. Cualquier override que
 * rompa el contraste AA se descarta al renderizar (ver src/themes/resolve.ts).
 */
export const theme = defineType({
  name: 'theme',
  title: 'Estetica',
  type: 'object',
  options: { collapsible: true, collapsed: false },
  fields: [
    defineField({
      name: 'preset',
      title: 'Tema',
      type: 'string',
      options: { list: PRESET_OPTIONS, layout: 'radio' },
      initialValue: PRESET_OPTIONS[0]?.value,
    }),
    defineField({
      name: 'accent',
      title: 'Color de acento',
      description: 'Hex, ej #9a3412. Se usa en precios destacados, botones y promos.',
      type: 'string',
      validation: (rule) =>
        rule.regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, { name: 'color hex' }).optional(),
    }),
    defineField({
      name: 'accentContrast',
      title: 'Color del texto sobre el acento',
      type: 'string',
      validation: (rule) =>
        rule.regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, { name: 'color hex' }).optional(),
    }),
    defineField({
      name: 'advanced',
      title: 'Avanzado',
      description:
        'Solo si sabes lo que haces. Un color que deje el menu ilegible se ignora automaticamente.',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: 'bg', title: 'Fondo', type: 'string' }),
        defineField({ name: 'surface', title: 'Fondo de tarjetas', type: 'string' }),
        defineField({ name: 'text', title: 'Texto', type: 'string' }),
        defineField({ name: 'textMuted', title: 'Texto secundario', type: 'string' }),
        defineField({ name: 'border', title: 'Bordes', type: 'string' }),
      ],
    }),
  ],
});
