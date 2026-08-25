import { getPreset, type ThemeTokens } from './presets';

/**
 * Resolucion de tema con validacion de contraste.
 *
 * El modo "avanzado" deja al restaurante pisar tokens individuales, que es la
 * via mas rapida a un menu ilegible en una mesa con poca luz. Regla: un
 * override solo se aplica si el resultado sigue cumpliendo WCAG AA. Si no,
 * se descarta en silencio y queda el valor del preset. Preferimos un menu que
 * no es exactamente el color que pidieron a un menu que no se puede leer.
 */

function parseHex(hex: string): [number, number, number] | null {
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

/** Forma cruda que llega desde Sanity (todo opcional). */
export interface ThemeInput {
  preset?: string;
  accent?: string;
  accentContrast?: string;
  advanced?: Partial<Pick<ThemeTokens, 'bg' | 'surface' | 'text' | 'textMuted' | 'border'>>;
  radius?: string;
}

export interface ResolvedTheme {
  tokens: ThemeTokens;
  /** Overrides descartados por contraste. Se muestran como aviso en el Studio. */
  rejected: string[];
}

const AA_TEXT = 4.5;
const AA_LARGE = 3;

export function resolveTheme(input: ThemeInput | undefined): ResolvedTheme {
  const preset = getPreset(input?.preset);
  const tokens: ThemeTokens = { ...preset.tokens };
  const rejected: string[] = [];

  if (!input) return { tokens, rejected };

  const bg = input.advanced?.bg;
  if (bg && parseHex(bg)) {
    const text = input.advanced?.text ?? tokens.text;
    if (contrastRatio(text, bg) >= AA_TEXT) tokens.bg = bg;
    else rejected.push('bg');
  }

  const text = input.advanced?.text;
  if (text && parseHex(text)) {
    if (contrastRatio(text, tokens.bg) >= AA_TEXT) tokens.text = text;
    else rejected.push('text');
  }

  const textMuted = input.advanced?.textMuted;
  if (textMuted && parseHex(textMuted)) {
    if (contrastRatio(textMuted, tokens.bg) >= AA_TEXT) tokens.textMuted = textMuted;
    else rejected.push('textMuted');
  }

  const surface = input.advanced?.surface;
  if (surface && parseHex(surface)) {
    if (contrastRatio(tokens.text, surface) >= AA_TEXT) tokens.surface = surface;
    else rejected.push('surface');
  }

  const border = input.advanced?.border;
  if (border && parseHex(border)) tokens.border = border;

  // El acento se usa en badges y botones: importa el contraste del par
  // accent/accentContrast, y que el acento se distinga del fondo.
  if (input.accent && parseHex(input.accent)) {
    const pairedContrast = input.accentContrast ?? tokens.accentContrast;
    const okPair = contrastRatio(pairedContrast, input.accent) >= AA_TEXT;
    const okAgainstBg = contrastRatio(input.accent, tokens.bg) >= AA_LARGE;
    if (okPair && okAgainstBg) {
      tokens.accent = input.accent;
      tokens.accentContrast = pairedContrast;
    } else {
      rejected.push('accent');
    }
  }

  if (input.radius) tokens.radius = input.radius;

  return { tokens, rejected };
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
};

/** Serializa los tokens a un bloque :root inyectable en el <head>. */
export function themeToCss(tokens: ThemeTokens): string {
  const decls = (Object.keys(CSS_VAR_NAMES) as (keyof ThemeTokens)[])
    .map((key) => `${CSS_VAR_NAMES[key]}:${tokens[key]}`)
    .join(';');
  return `:root{${decls}}`;
}
