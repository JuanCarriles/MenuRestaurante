/**
 * Formateo de precios.
 *
 * Sin decimales a proposito: en un menu argentino "$12.500" es lo que la gente
 * espera leer, y "$12.500,00" agrega ruido en una pantalla de telefono.
 */
const formatters = new Map<string, Intl.NumberFormat>();

export function formatPrice(value: number, currency = 'ARS', locale = 'es-AR'): string {
  const key = `${locale}:${currency}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    });
    formatters.set(key, formatter);
  }
  return formatter.format(value);
}

/** Fecha corta para el pie "Precios actualizados al ...". */
export function formatShortDate(iso: string, locale = 'es-AR'): string {
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day) return iso;
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' }).format(
    new Date(Date.UTC(year, month - 1, day)),
  );
}

/**
 * Hoy en formato YYYY-MM-DD (como Sanity guarda los campos `date`), calculado
 * en la zona horaria del restaurante.
 *
 * Usar UTC aca es un bug con consecuencias visibles: en Argentina (UTC-3) una
 * promo con vigencia "hasta hoy" desapareceria del menu a las 21:00, que es
 * justo cuando la gente esta cenando. El locale en-CA se usa porque produce
 * exactamente YYYY-MM-DD.
 */
export function today(timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function discountPercent(price: number, compareAt: number): number {
  return Math.round((1 - price / compareAt) * 100);
}
