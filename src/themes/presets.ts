/**
 * Presets de tema.
 *
 * Los presets viven en codigo, no en Sanity. Sanity guarda unicamente el id del
 * preset elegido mas los overrides opcionales. Consecuencia buscada: cuando
 * mejoras el preset "parrilla", mejoran todos los clientes que lo usan, sin
 * tocar su contenido.
 *
 * ESTADO: provisional. La Fase 0/4 define los 6 presets reales a partir de
 * mockups. Estos dos existen para que la cadena tema -> CSS funcione punta a
 * punta y se pueda validar el mecanismo antes de decidir la estetica.
 */
export interface ThemeTokens {
  bg: string;
  surface: string;
  text: string;
  textMuted: string;
  accent: string;
  /** Color del texto que va ENCIMA de accent. Se valida contraste contra accent. */
  accentContrast: string;
  border: string;
  radius: string;
  fontDisplay: string;
  fontBody: string;
}

export interface ThemePreset {
  id: string;
  label: string;
  tokens: ThemeTokens;
}

export const PRESETS: readonly ThemePreset[] = [
  {
    id: 'clasico',
    label: 'Clasico',
    tokens: {
      bg: '#faf9f7',
      surface: '#ffffff',
      text: '#1c1917',
      textMuted: '#57534e',
      accent: '#9a3412',
      accentContrast: '#ffffff',
      border: '#e7e5e4',
      radius: '0.5rem',
      fontDisplay: '"Fraunces", Georgia, serif',
      fontBody: '"Inter", system-ui, sans-serif',
    },
  },
  {
    id: 'nocturno',
    label: 'Nocturno',
    tokens: {
      bg: '#12100e',
      surface: '#1c1917',
      text: '#f5f5f4',
      textMuted: '#a8a29e',
      accent: '#fbbf24',
      accentContrast: '#1c1917',
      border: '#292524',
      radius: '0.5rem',
      fontDisplay: '"Fraunces", Georgia, serif',
      fontBody: '"Inter", system-ui, sans-serif',
    },
  },
];

export const DEFAULT_PRESET_ID = 'clasico';

export function getPreset(id: string | undefined): ThemePreset {
  return (
    PRESETS.find((p) => p.id === id) ??
    PRESETS.find((p) => p.id === DEFAULT_PRESET_ID) ??
    PRESETS[0]!
  );
}

/** Para poblar el dropdown del Studio sin duplicar la lista. */
export const PRESET_OPTIONS = PRESETS.map((p) => ({ title: p.label, value: p.id }));
