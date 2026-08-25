import { AA_LARGE, AA_TEXT, contrastRatio, textColorOn } from './contrast';

/**
 * Paleta curada.
 *
 * En vez de un campo de color libre, el restaurante elige de dos listas
 * cerradas. La diferencia no es cosmetica: con hex libre el validador tiene que
 * descartar en silencio lo que rompe el contraste, y el cliente no entiende por
 * que "no se aplico su color". Con listas curadas no puede elegir algo roto.
 *
 * Un FONDO no es un color suelto sino un juego coherente de cinco tokens
 * (fondo, tarjetas, texto, texto secundario, bordes). Elegir "Carbon" cambia
 * los cinco de una, y no hay forma de terminar con texto oscuro sobre fondo
 * oscuro combinando mal.
 */

export interface Surface {
  id: string;
  label: string;
  bg: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
}

export interface Accent {
  id: string;
  label: string;
  value: string;
}

/** Seis claros y dos oscuros. Los seis presets salen de aca. */
export const SURFACES: readonly Surface[] = [
  {
    id: 'crema',
    label: 'Crema',
    bg: '#faf5ec',
    surface: '#fffdf8',
    text: '#241c17',
    textMuted: '#6b5d51',
    border: '#e2d8c6',
  },
  {
    id: 'marfil',
    label: 'Marfil',
    bg: '#fdfbf7',
    surface: '#fbf4e9',
    text: '#2b2622',
    textMuted: '#7a6b5d',
    border: '#ece3d7',
  },
  {
    id: 'arena',
    label: 'Arena',
    bg: '#f5f1ea',
    surface: '#fffefb',
    text: '#23201c',
    textMuted: '#6a625a',
    border: '#e0d9cf',
  },
  {
    id: 'blanco',
    label: 'Blanco cálido',
    bg: '#ffffff',
    surface: '#ffffff',
    text: '#14100e',
    textMuted: '#6b625c',
    border: '#eae5e1',
  },
  {
    id: 'papel',
    label: 'Papel',
    bg: '#ffffff',
    surface: '#ffffff',
    text: '#111111',
    textMuted: '#6e6e6e',
    border: '#e6e6e6',
  },
  {
    id: 'piedra',
    label: 'Piedra',
    bg: '#f4f5f6',
    surface: '#ffffff',
    text: '#1a1d1f',
    textMuted: '#62696f',
    border: '#e3e6e8',
  },
  {
    id: 'carbon',
    label: 'Carbón',
    bg: '#16161a',
    surface: '#1e1e24',
    text: '#f2ede3',
    textMuted: '#a39d92',
    border: '#34343d',
  },
  {
    id: 'noche',
    label: 'Noche',
    bg: '#10141c',
    surface: '#18202c',
    text: '#eef2f7',
    textMuted: '#9aa6b5',
    border: '#2a3444',
  },
];

/** Doce acentos. No todos sirven con todos los fondos: ver accentsFor(). */
export const ACCENTS: readonly Accent[] = [
  { id: 'bordo', label: 'Bordó', value: '#8c2f27' },
  { id: 'ladrillo', label: 'Ladrillo', value: '#b3421f' },
  { id: 'naranja', label: 'Naranja', value: '#c2410c' },
  { id: 'ambar', label: 'Ámbar', value: '#f0a92b' },
  { id: 'mostaza', label: 'Mostaza', value: '#a16207' },
  { id: 'bronce', label: 'Bronce', value: '#8a5c33' },
  { id: 'oliva', label: 'Oliva', value: '#4d7c0f' },
  { id: 'verde', label: 'Verde', value: '#0d7d5a' },
  { id: 'petroleo', label: 'Petróleo', value: '#0f766e' },
  { id: 'azul', label: 'Azul', value: '#1d4ed8' },
  { id: 'violeta', label: 'Violeta', value: '#6d28d9' },
  { id: 'rosa', label: 'Rosa', value: '#be185d' },
];

export const DEFAULT_SURFACE_ID = 'crema';
export const DEFAULT_ACCENT_ID = 'bordo';

export function getSurface(id: string | undefined): Surface {
  return (
    SURFACES.find((s) => s.id === id) ??
    SURFACES.find((s) => s.id === DEFAULT_SURFACE_ID) ??
    SURFACES[0]!
  );
}

export function getAccent(id: string | undefined): Accent {
  return (
    ACCENTS.find((a) => a.id === id) ??
    ACCENTS.find((a) => a.id === DEFAULT_ACCENT_ID) ??
    ACCENTS[0]!
  );
}

/**
 * Un acento sirve con un fondo si se distingue del fondo (>= 3:1, que es el
 * piso para texto grande, badges y bordes) y si encima suyo entra texto blanco
 * o casi negro con >= 4.5:1.
 */
export function accentWorksOn(accent: Accent, surface: Surface): boolean {
  const onAccent = textColorOn(accent.value);
  return (
    contrastRatio(accent.value, surface.bg) >= AA_LARGE &&
    contrastRatio(onAccent, accent.value) >= AA_TEXT
  );
}

/** Los acentos que se le pueden ofrecer al restaurante para este fondo. */
export function accentsFor(surfaceId: string | undefined): Accent[] {
  const surface = getSurface(surfaceId);
  return ACCENTS.filter((accent) => accentWorksOn(accent, surface));
}

/** El color de texto que va encima del acento. Nunca lo elige el restaurante. */
export function contrastForAccent(accent: Accent): string {
  return textColorOn(accent.value);
}
