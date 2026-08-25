import { defineCliConfig } from 'sanity/cli';
import { TENANTS } from './src/tenants';

/**
 * Config del CLI de Sanity (`sanity dev`, `sanity deploy`, `sanity schema`).
 *
 * Toma el primer tenant como proyecto por defecto. Los workspaces de todos los
 * restaurantes se siguen definiendo en sanity.config.ts, asi que el Studio
 * local los muestra todos.
 */
const [primary] = TENANTS;

export default defineCliConfig({
  api: {
    projectId: primary.projectId,
    dataset: primary.dataset,
  },
});
