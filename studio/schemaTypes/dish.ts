import { defineField, defineType } from 'sanity';

export const dish = defineType({
  name: 'dish',
  title: 'Plato',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nombre',
      type: 'string',
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: 'description',
      title: 'Descripcion',
      description: 'Corta. Si no entra en 140 caracteres, no entra en la tarjeta.',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'price',
      title: 'Precio',
      description:
        'Se puede dejar vacio: hay secciones que no llevan precio en la carta, como los vinos.',
      type: 'number',
      validation: (rule) => rule.positive(),
    }),
    defineField({
      name: 'variants',
      title: 'Variantes',
      description: 'Opcional. Ej: "Media porcion" / "Entera". Reemplazan al precio unico.',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Nombre',
              type: 'string',
              validation: (rule) => rule.required().max(30),
            }),
            defineField({
              name: 'price',
              title: 'Precio',
              type: 'number',
              validation: (rule) => rule.required().positive(),
            }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'price' },
          },
        },
      ],
    }),
    defineField({
      name: 'image',
      title: 'Foto',
      description: 'Opcional. El menu se ve bien sin fotos; una foto mala resta.',
      type: 'photo',
    }),
    defineField({
      name: 'tags',
      title: 'Etiquetas',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'grid',
        list: [
          { title: 'Vegetariano', value: 'vegetariano' },
          { title: 'Vegano', value: 'vegano' },
          { title: 'Sin TACC', value: 'sin-tacc' },
          { title: 'Picante', value: 'picante' },
          { title: 'Novedad', value: 'novedad' },
        ],
      },
    }),
    defineField({
      name: 'available',
      title: 'Disponible',
      description: 'Destildalo para sacarlo del menu sin borrarlo.',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'price', media: 'image', available: 'available' },
    prepare({ title, subtitle, media, available }) {
      return {
        title: available === false ? `${title} (no disponible)` : title,
        subtitle: typeof subtitle === 'number' ? `$${subtitle}` : 'Sin precio',
        media,
      };
    },
  },
});
