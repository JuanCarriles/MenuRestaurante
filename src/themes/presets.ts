/**
 * Presets de tema.
 *
 * Cambio de rol respecto de la primera version: un preset ya NO es un tema
 * cerrado, es un PUNTO DE PARTIDA que precarga los controles. El restaurante
 * elige "Bodegón" y queda con su fondo, su acento y sus tipografias; despues
 * cambia lo que quiera desde las listas curadas.
 *
 * Los colores no viven aca: viven en palette.ts, y el preset solo nombra cual
 * fondo y cual acento usa. Asi el cliente que arranco de un preset y cambio el
 * acento sigue teniendo una combinacion valida, en vez de una mezcla rara entre
 * un preset y un override suelto.
 */
export interface ThemePreset {
  id: string;
  label: string;
  /** Descripcion corta para que el dueño elija sin ver codigo. */
  hint: string;
  /** id de SURFACES en palette.ts */
  surface: string;
  /** id de ACCENTS en palette.ts */
  accent: string;
  /**
   * Hoja de Google Fonts del preset. Se emite solo la del preset activo, asi
   * que un restaurante nunca descarga tipografias de los otros cinco.
   * Pendiente: self-hostear con @fontsource para sacar el request externo.
   */
  fontLink: string;
  fontDisplay: string;
  fontBody: string;
  radius: string;

  /* Identidad tipografica del encabezado de categoria. Es lo que mas separa a
     un preset de otro sin tocar el layout. */
  categorySize: string;
  categoryTransform: string;
  categoryTracking: string;
  /** Regla debajo del titulo de categoria, como shorthand de border-top. */
  categoryRule: string;
}

export const PRESETS: readonly ThemePreset[] = [
  {
    id: 'bodegon',
    label: 'Bodegón',
    hint: 'Cálido y tipográfico. Para parrillas, bodegones y cocina de barrio.',
    surface: 'crema',
    accent: 'bordo',
    fontLink:
      'https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@500;600;700&family=Work+Sans:wght@400;500;600&display=swap',
    fontDisplay: '"Zilla Slab", Georgia, serif',
    fontBody: '"Work Sans", system-ui, sans-serif',
    radius: '0px',
    categorySize: '0.875rem',
    categoryTransform: 'uppercase',
    categoryTracking: '0.2em',
    categoryRule: '3px double var(--border)',
  },
  {
    id: 'pizarra',
    label: 'Pizarra',
    hint: 'Oscuro, títulos enormes. Para bares, cervecerías y pizzerías.',
    surface: 'carbon',
    accent: 'ambar',
    fontLink:
      'https://fonts.googleapis.com/css2?family=Anton&family=Space+Grotesk:wght@400;500;700&display=swap',
    fontDisplay: '"Anton", Impact, sans-serif',
    fontBody: '"Space Grotesk", system-ui, sans-serif',
    radius: '0px',
    categorySize: '1.875rem',
    categoryTransform: 'uppercase',
    categoryTracking: '0.01em',
    categoryRule: '1px solid var(--border)',
  },
  {
    id: 'editorial',
    label: 'Editorial',
    hint: 'Mínimo y con mucho aire. Para cocina de autor y vinotecas.',
    surface: 'papel',
    accent: 'ladrillo',
    fontLink:
      'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Public+Sans:wght@400;500;600&display=swap',
    fontDisplay: '"Instrument Serif", Georgia, serif',
    fontBody: '"Public Sans", system-ui, sans-serif',
    radius: '0px',
    categorySize: '0.6875rem',
    categoryTransform: 'uppercase',
    categoryTracking: '0.24em',
    categoryRule: 'none',
  },
  {
    id: 'vitrina',
    label: 'Vitrina',
    hint: 'Fuerte y directo, la foto manda. Conviene si hay fotos buenas.',
    surface: 'blanco',
    accent: 'naranja',
    fontLink:
      'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wght@400;500;600&display=swap',
    fontDisplay: '"Archivo Black", Impact, sans-serif',
    fontBody: '"Archivo", system-ui, sans-serif',
    radius: '0px',
    categorySize: '1.75rem',
    categoryTransform: 'uppercase',
    categoryTracking: '0.02em',
    categoryRule: '2px solid var(--border)',
  },
  {
    id: 'marca',
    label: 'Marca',
    hint: 'Limpio, con el color de la marca al frente. Para rotiserías y take away.',
    surface: 'papel',
    accent: 'verde',
    fontLink: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;800&display=swap',
    fontDisplay: '"Manrope", system-ui, sans-serif',
    fontBody: '"Manrope", system-ui, sans-serif',
    radius: '14px',
    categorySize: '0.8125rem',
    categoryTransform: 'uppercase',
    categoryTracking: '0.16em',
    categoryRule: 'none',
  },
  {
    id: 'bistro',
    label: 'Bistró',
    hint: 'Elegante, con miniatura por plato. Para bistrós y cafés de especialidad.',
    surface: 'marfil',
    accent: 'bronce',
    fontLink:
      'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,400&family=Karla:wght@400;500;600&display=swap',
    fontDisplay: '"Cormorant Garamond", Georgia, serif',
    fontBody: '"Karla", system-ui, sans-serif',
    radius: '8px',
    categorySize: '1.5rem',
    categoryTransform: 'none',
    categoryTracking: '0em',
    categoryRule: '1px solid var(--border)',
  },
];

export const DEFAULT_PRESET_ID = 'bodegon';

export function getPreset(id: string | undefined): ThemePreset {
  return (
    PRESETS.find((p) => p.id === id) ??
    PRESETS.find((p) => p.id === DEFAULT_PRESET_ID) ??
    PRESETS[0]!
  );
}

/** Para poblar el selector del Studio sin duplicar la lista. */
export const PRESET_OPTIONS = PRESETS.map((p) => ({
  title: `${p.label} — ${p.hint}`,
  value: p.id,
}));
