import { getPreset } from './presets';
import {
  accentWorksOn,
  accentsFor,
  contrastForAccent,
  getAccent,
  getSurface,
  type Accent,
  type Surface,
} from './palette';

/**
 * Resolucion de tema.
 *
 * El preset define el punto de partida; el restaurante puede cambiar el fondo
 * y el acento desde las listas curadas de palette.ts. Como las listas ya son
 * seguras, la unica validacion que queda es la COMBINACION: un acento valido
 * sobre un fondo claro puede no distinguirse sobre uno oscuro. Si el par no
 * funciona se cae al acento del preset, y si ese tampoco, al primero valido
 * para ese fondo. Preferimos un menu que no es exactamente el color pedido a
 * un menu que no se puede leer en una mesa con poca luz.
 */

export interface ThemeTokens {
  bg: string;
  surface: string;
  text: string;
  textMuted: string;
  accent: string;
  /** Texto que va ENCIMA del acento. Lo calcula el sistema, no el restaurante. */
  accentContrast: string;
  border: string;
  radius: string;
  fontDisplay: string;
  fontBody: string;
  categorySize: string;
  categoryTransform: string;
  categoryTracking: string;
  categoryRule: string;
}

/** Forma cruda que llega desde Sanity (todo opcional). */
export interface ThemeInput {
  preset?: string;
  surface?: string;
  accent?: string;
}

export interface ResolvedTheme {
  tokens: ThemeTokens;
  /** Hoja de Google Fonts del preset activo. Solo se emite esta. */
  fontLink: string;
  /** true si el acento pedido no servia con el fondo y se uso otro. */
  accentReplaced: boolean;
}

function resolveAccent(
  requested: string | undefined,
  presetAccentId: string,
  surface: Surface,
): { accent: Accent; replaced: boolean } {
  const wanted = getAccent(requested ?? presetAccentId);
  if (accentWorksOn(wanted, surface)) return { accent: wanted, replaced: false };

  const presetAccent = getAccent(presetAccentId);
  if (accentWorksOn(presetAccent, surface)) return { accent: presetAccent, replaced: true };

  const fallback = accentsFor(surface.id)[0];
  return { accent: fallback ?? wanted, replaced: true };
}

export function resolveTheme(input: ThemeInput | undefined): ResolvedTheme {
  const preset = getPreset(input?.preset);
  const surface = getSurface(input?.surface ?? preset.surface);
  const { accent, replaced } = resolveAccent(input?.accent, preset.accent, surface);

  return {
    fontLink: preset.fontLink,
    accentReplaced: replaced,
    tokens: {
      bg: surface.bg,
      surface: surface.surface,
      text: surface.text,
      textMuted: surface.textMuted,
      border: surface.border,
      accent: accent.value,
      accentContrast: contrastForAccent(accent),
      radius: preset.radius,
      fontDisplay: preset.fontDisplay,
      fontBody: preset.fontBody,
      categorySize: preset.categorySize,
      categoryTransform: preset.categoryTransform,
      categoryTracking: preset.categoryTracking,
      categoryRule: preset.categoryRule,
    },
  };
}

const CSS_VAR_NAMES: Record<keyof ThemeTokens, string> = {
  bg: '--bg',
  surface: '--surface',
  text: '--text',
  textMuted: '--text-muted',
  accent: '--accent',
  accentContrast: '--accent-contrast',
  border: '--border',
  radius: '--radius',
  fontDisplay: '--font-display',
  fontBody: '--font-body',
  categorySize: '--category-size',
  categoryTransform: '--category-transform',
  categoryTracking: '--category-tracking',
  categoryRule: '--category-rule',
};

/** Serializa los tokens a un bloque :root inyectable en el <head>. */
export function themeToCss(tokens: ThemeTokens): string {
  const decls = (Object.keys(CSS_VAR_NAMES) as (keyof ThemeTokens)[])
    .map((key) => `${CSS_VAR_NAMES[key]}:${tokens[key]}`)
    .join(';');
  return `:root{${decls}}`;
}

export { contrastRatio } from './contrast';
