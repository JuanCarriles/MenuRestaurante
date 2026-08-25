import { createClient, type SanityClient } from '@sanity/client';
import type { Tenant } from '~/tenants';

/**
 * Un cliente por restaurante, memoizado por proceso.
 *
 * No usamos el helper `sanityClient` de @sanity/astro porque esta atado a un
 * unico projectId, y aca el projectId cambia segun el tenant de la URL.
 */
const clients = new Map<string, SanityClient>();

/** Fecha fija: la API de Sanity versiona por fecha, no queremos que cambie sola. */
const API_VERSION = '2026-08-01';

export function clientFor(tenant: Tenant): SanityClient {
  const key = `${tenant.projectId}:${tenant.dataset}`;
  const existing = clients.get(key);
  if (existing) return existing;

  const client = createClient({
    projectId: tenant.projectId,
    dataset: tenant.dataset,
    apiVersion: API_VERSION,
    // Datasets publicos en el plan gratuito: la lectura no lleva token.
    useCdn: true,
    perspective: 'published',
  });

  clients.set(key, client);
  return client;
}
