import { defineField, defineType } from 'sanity';

/**
 * Imagen con alt obligatorio. El alt no es burocracia: mucha gente lee el menu
 * con lector de pantalla, y una foto sin describir es un agujero en el menu.
 */
export const photo = defineType({
  name: 'photo',
  title: 'Foto',
  type: 'image',
  options: { hotspot: true },
  fields: [
    defineField({
      name: 'alt',
      title: 'Descripcion de la foto',
      description: 'Que se ve en la foto. Lo leen los lectores de pantalla.',
      type: 'string',
      validation: (rule) => rule.required().min(3).max(120),
    }),
  ],
});
