/**
 * Redes sociales.
 *
 * Los campos aceptan tanto el usuario suelto (`latropilla`) como el link
 * completo (`https://www.facebook.com/…`). Es a proposito: pedirle a un
 * restaurante que extraiga "el usuario" de una URL de Facebook es pedirle algo
 * que a veces ni existe — hay paginas cuya unica direccion es
 * `facebook.com/profile.php?id=123`. Mejor aceptar lo que tenga a mano y
 * resolverlo aca.
 */

function limpiar(valor: string | undefined): string | undefined {
  const v = valor?.trim().replace(/^@/, '');
  return v ? v : undefined;
}

const esUrl = (v: string) => /^https?:\/\//i.test(v);

function urlDeRed(valor: string | undefined, base: string): string | undefined {
  const v = limpiar(valor);
  if (!v) return undefined;
  return esUrl(v) ? v : base + v;
}

export const instagramUrl = (valor: string | undefined) =>
  urlDeRed(valor, 'https://instagram.com/');

export const facebookUrl = (valor: string | undefined) =>
  urlDeRed(valor, 'https://facebook.com/');

/**
 * Nombre para mostrar. Si cargaron un link, saca el usuario de la ruta; si no
 * hay ruta utilizable, devuelve el dominio, que al menos dice algo.
 */
export function nombreDeRed(valor: string | undefined): string | undefined {
  const v = limpiar(valor);
  if (!v) return undefined;
  if (!esUrl(v)) return v;
  try {
    const url = new URL(v);
    const segmento = url.pathname.split('/').filter(Boolean)[0];
    return segmento ?? url.hostname.replace(/^www\./, '');
  } catch {
    return v;
  }
}
