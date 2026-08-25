/**
 * Contraste WCAG. Vive aparte porque lo usan tanto la paleta curada
 * (para decidir que combinaciones se le ofrecen al restaurante) como el
 * resolutor de temas (para descartar las que igual llegan mal).
 */

export const AA_TEXT = 4.5;
export const AA_LARGE = 3;

export function parseHex(hex: string): [number, number, number] | null {
  const clean = hex.trim().replace(/^#/, '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function relativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Ratio WCAG entre dos colores hex. Devuelve 0 si alguno no es hex valido. */
export function contrastRatio(a: string, b: string): number {
  const ca = parseHex(a);
  const cb = parseHex(b);
  if (!ca || !cb) return 0;
  const la = relativeLuminance(ca);
  const lb = relativeLuminance(cb);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

const LIGHT = '#ffffff';
const DARK = '#16161a';

/**
 * Color de texto para poner ENCIMA de `background`: blanco o casi negro, el
 * que mas contraste de. No hay una tercera opcion a proposito — un acento con
 * texto de fantasia arriba es la receta de un boton ilegible.
 */
export function textColorOn(background: string): string {
  return contrastRatio(LIGHT, background) >= contrastRatio(DARK, background) ? LIGHT : DARK;
}
