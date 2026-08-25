import { defineField, defineType } from 'sanity';

export const promotion = defineType({
  name: 'promotion',
  title: 'Promocion',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nombre',
      description: 'Ej: Combo Milanesa + Papas + Bebida.',
      type: 'string',
      validation: (rule) => rule.required().max(70),
    }),
    defineField({
      name: 'description',
      title: 'Descripcion',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.max(180),
    }),
    defineField({
      name: 'price',
      title: 'Precio de la promo',
      type: 'number',
      validation: (rule) => rule.required().positive(),
    }),
    defineField({
      name: 'compareAtPrice',
      title: 'Precio sin promo',
      description: 'Opcional. Si lo cargas, se muestra tachado y se calcula el descuento.',
      type: 'number',
      validation: (rule) =>
        rule.positive().custom((value, context) => {
          const price = (context.document as { price?: number } | undefined)?.price;
          if (value == null || price == null) return true;
          return value > price || 'El precio sin promo tiene que ser mayor al precio de la promo.';
        }),
    }),
    defineField({
      name: 'includes',
      title: 'Platos que incluye',
      description: 'Opcional. Solo si la promo se arma con platos que ya estan en el menu.',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'dish' }] }],
    }),
    defineField({ name: 'image', title: 'Foto', type: 'photo' }),
    defineField({
      name: 'validFrom',
      title: 'Vigente desde',
      description: 'Opcional. Si esta vacio, arranca ya.',
      type: 'date',
    }),
    defineField({
      name: 'validUntil',
      title: 'Vigente hasta',
      description: 'Opcional. Pasada esta fecha deja de mostrarse sola.',
      type: 'date',
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'price', media: 'image', validUntil: 'validUntil' },
    prepare({ title, subtitle, media, validUntil }) {
      const expired = typeof validUntil === 'string' && validUntil < new Date().toISOString().slice(0, 10);
      return {
        title: expired ? `${title} (vencida)` : title,
        subtitle: typeof subtitle === 'number' ? `$${subtitle}` : 'Sin precio',
        media,
      };
    },
  },
});
