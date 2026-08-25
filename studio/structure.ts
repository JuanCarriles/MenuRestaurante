import type { StructureResolver } from 'sanity/structure';

/**
 * Cada workspace ya contiene un solo restaurante, asi que no hace falta filtrar
 * por tenant. Lo unico que se hace aca es fijar el singleton `restaurant` (sin
 * lista ni boton de "crear otro") y ordenar el menu lateral en el orden en que
 * el dueño realmente trabaja: primero promos, despues el menu.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Contenido')
    .items([
      // "Datos del restaurante" va primero porque es donde se arma el menu que
      // se publica: las listas de abajo son la biblioteca de piezas sueltas, y
      // una pieza que no se agrego a esas listas no aparece en la pagina.
      S.listItem()
        .title('Datos del restaurante y armado del menu')
        .child(S.document().schemaType('restaurant').documentId('restaurant')),
      S.divider(),
      S.listItem()
        .title('Promociones (todas)')
        .child(S.documentTypeList('promotion').title('Todas las promociones')),
      S.listItem()
        .title('Categorias (todas)')
        .child(S.documentTypeList('menuCategory').title('Todas las categorias')),
      S.listItem()
        .title('Platos (todos)')
        .child(S.documentTypeList('dish').title('Todos los platos')),
    ]);
