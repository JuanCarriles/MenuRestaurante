/**
 * Registro de restaurantes.
 *
 * Cada restaurante es un proyecto de Sanity independiente (el plan gratuito da
 * 2 datasets por proyecto y solo roles Administrator/Viewer, asi que el
 * aislamiento entre clientes se consigue separando proyectos, no datasets).
 * El projectId es un parametro del cliente, no algo horneado en el build:
 * por eso todos los restaurantes viven en un unico deploy.
 *
 * Alta de un cliente nuevo:
 *   1. `npx sanity@latest projects create "<Nombre>"` (o desde sanity.io/manage)
 *   2. Agregar el dominio de produccion y http://localhost:4321 a los CORS
 *      de ESE proyecto.
 *   3. Agregar la entrada aca abajo y desplegar.
 *   4. `npm run typegen` si cambiaron los schemas.
 */
export interface Tenant {
  /**
   * Segmento de URL: /r/<slug>.
   * OJO: una vez que se imprimio el QR, cambiar el slug rompe todos los
   * carteles que ya estan en las mesas. Se elige una vez y no se toca.
   */
  slug: string;
  /** Nombre visible en el selector de workspaces del Studio. */
  label: string;
  projectId: string;
  dataset: string;
  /**
   * Zona horaria del restaurante, formato IANA.
   *
   * Define que dia es "hoy" al filtrar la vigencia de las promociones. Calcular
   * eso en UTC es un bug real: en Argentina (UTC-3) las promos que vencen hoy
   * se apagarian solas a las 21:00, en plena cena.
   *
   * Vive aca y no en Sanity porque hace falta para armar el parametro $today
   * de la misma query que trae el restaurante.
   */
  timezone: string;
}

export const TENANTS: readonly Tenant[] = [
  {
    slug: 'demo',
    label: 'Truman',
    projectId: '6z4dmaab',
    dataset: 'production',
    timezone: 'America/Argentina/Buenos_Aires',
  },
];

export const TENANT_SLUGS: readonly string[] = TENANTS.map((t) => t.slug);

export function getTenant(slug: string | undefined): Tenant | undefined {
  if (!slug) return undefined;
  return TENANTS.find((t) => t.slug === slug);
}
