import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './studio/schemaTypes';
import { structure } from './studio/structure';
import { TENANTS } from './src/tenants';

/**
 * Un workspace por restaurante. Sanity permite que cada workspace apunte a un
 * projectId distinto, asi que /studio/<slug> abre el Studio del proyecto de ese
 * restaurante. El dueño solo esta invitado al suyo: no puede ver los demas.
 */
export default TENANTS.map((tenant) =>
  defineConfig({
    name: tenant.slug,
    title: tenant.label,
    basePath: `/studio/${tenant.slug}`,
    projectId: tenant.projectId,
    dataset: tenant.dataset,
    plugins: [structureTool({ structure }), visionTool()],
    schema: {
      types: schemaTypes,
      // `restaurant` es singleton: sin plantilla no aparece en "crear nuevo".
      templates: (prev) => prev.filter((template) => template.schemaType !== 'restaurant'),
    },
    document: {
      // Borrar o duplicar el documento del restaurante romperia la pagina en
      // silencio. Se puede editar y publicar, nada mas.
      actions: (actions, context) =>
        context.schemaType === 'restaurant'
          ? actions.filter(
              ({ action }) => action !== 'delete' && action !== 'duplicate' && action !== 'unpublish',
            )
          : actions,
    },
  }),
);
