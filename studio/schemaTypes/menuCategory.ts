import { defineField, defineType } from 'sanity';

export const menuCategory = defineType({
  name: 'menuCategory',
  title: 'Categoria',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Nombre',
      description: 'Ej: Entradas, Pastas, Postres.',
      type: 'string',
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: 'description',
      title: 'Descripcion',
      description: 'Opcional. Una linea debajo del titulo de la categoria.',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: 'items',
      title: 'Platos',
      description: 'Arrastra para cambiar el orden en que se ven.',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'dish' }] }],
    }),
  ],
  preview: {
    select: { title: 'title', items: 'items' },
    prepare({ title, items }) {
      const count = Array.isArray(items) ? items.length : 0;
      return {
        title,
        subtitle: count === 1 ? '1 plato' : `${count} platos`,
      };
    },
  },
});
