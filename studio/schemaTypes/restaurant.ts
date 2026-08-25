import { defineField, defineType } from 'sanity';

/**
 * Singleton: hay exactamente un `restaurant` por proyecto de Sanity, porque
 * cada restaurante tiene su propio proyecto. Por eso no tiene slug (la URL la
 * define src/tenants.ts) ni los hijos necesitan apuntar de vuelta a el.
 */
export const restaurant = defineType({
  name: 'restaurant',
  title: 'Datos del restaurante',
  type: 'document',
  groups: [
    { name: 'identidad', title: 'Identidad', default: true },
    { name: 'menu', title: 'Menu' },
    { name: 'estetica', title: 'Estetica' },
    { name: 'contacto', title: 'Contacto y horarios' },
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Nombre',
      type: 'string',
      group: 'identidad',
      validation: (rule) => rule.required().max(50),
    }),
    defineField({
      name: 'tagline',
      title: 'Bajada',
      description: 'Una linea. Ej: "Cocina de barrio desde 1998".',
      type: 'string',
      group: 'identidad',
      validation: (rule) => rule.max(80),
    }),
    defineField({ name: 'logo', title: 'Logo', type: 'photo', group: 'identidad' }),
    defineField({
      name: 'hero',
      title: 'Imagen de portada',
      description:
        'Opcional. Va arriba de todo, con el logo y el nombre encima. Conviene una foto apaisada del local o de un plato insignia. No hace falta que sea perfecta: el degradado se encarga de que el texto se lea igual.',
      type: 'photo',
      group: 'identidad',
    }),
    defineField({
      name: 'notice',
      title: 'Aviso del dia',
      description:
        'Opcional. Aparece arriba de todo. Ej: "Hoy sin pescado" o "10% off en efectivo". Vaciar cuando no aplique.',
      type: 'string',
      group: 'identidad',
      validation: (rule) => rule.max(90),
    }),
    defineField({
      name: 'published',
      title: 'Menu publicado',
      description: 'Si esta apagado, quien escanee el QR ve un cartel de "no disponible".',
      type: 'boolean',
      initialValue: false,
      group: 'identidad',
    }),

    defineField({
      name: 'promotions',
      title: 'Promociones',
      description:
        'Las promociones NO aparecen en el menu hasta que se agregan a esta lista. ' +
        'Crearlas en la seccion "Promociones" del menu lateral no alcanza. ' +
        'Se muestran primero, antes de todas las categorias. Arrastra para ordenar.',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'promotion' }] }],
      group: 'menu',
    }),
    defineField({
      name: 'menu',
      title: 'Categorias del menu',
      description: 'El orden de esta lista es el orden del menu. Arrastra para cambiarlo.',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'menuCategory' }] }],
      group: 'menu',
    }),
    defineField({
      name: 'pricesUpdatedAt',
      title: 'Precios actualizados al',
      description: 'Se muestra al pie del menu. Actualizalo cuando toques precios.',
      type: 'date',
      group: 'menu',
    }),

    defineField({ name: 'theme', title: 'Estetica', type: 'theme', group: 'estetica' }),

    defineField({
      name: 'contact',
      title: 'Contacto',
      type: 'object',
      group: 'contacto',
      fields: [
        defineField({
          name: 'whatsapp',
          title: 'WhatsApp',
          description: 'Solo numeros, con codigo de pais. Ej: 5491122334455',
          type: 'string',
          validation: (rule) => rule.regex(/^\d{8,15}$/, { name: 'numero' }).optional(),
        }),
        defineField({ name: 'phone', title: 'Telefono', type: 'string' }),
        defineField({
          name: 'instagram',
          title: 'Instagram',
          description: 'Solo el usuario, sin @.',
          type: 'string',
        }),
        defineField({ name: 'address', title: 'Direccion', type: 'string' }),
        defineField({ name: 'mapsUrl', title: 'Link a Google Maps', type: 'url' }),
      ],
    }),
    defineField({
      name: 'hours',
      title: 'Horarios',
      type: 'array',
      group: 'contacto',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'days',
              title: 'Dias',
              description: 'Ej: "Lunes a viernes" o "Sabados y domingos".',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'hours',
              title: 'Horario',
              description: 'Texto libre, para poder expresar doble turno. Ej: "12:00 a 15:30 y 20:00 a 00:00".',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: { select: { title: 'days', subtitle: 'hours' } },
        },
      ],
    }),
    defineField({
      name: 'currency',
      title: 'Moneda',
      type: 'string',
      group: 'contacto',
      options: {
        list: [
          { title: 'Peso argentino (ARS)', value: 'ARS' },
          { title: 'Dolar (USD)', value: 'USD' },
          { title: 'Euro (EUR)', value: 'EUR' },
        ],
      },
      initialValue: 'ARS',
    }),
  ],
  preview: {
    select: { title: 'name', media: 'logo', published: 'published' },
    prepare({ title, media, published }) {
      return {
        title: title ?? 'Sin nombre',
        subtitle: published ? 'Publicado' : 'Sin publicar',
        media,
      };
    },
  },
});
