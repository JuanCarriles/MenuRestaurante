/**
 * Tokens de Sobremesa — el menú demo.
 *
 * El fondo no es negro ni azul-negro: es un VERDE-NEGRO CALIDO, que es como se
 * ve un comedor con poca luz. Esa decision tambien esquiva el lugar comun de
 * "fondo casi negro con un acento brillante": el acento es bronce viejo y
 * apagado, nunca neon.
 *
 * Contraste verificado sobre el fondo: texto 14.69:1, secundario 6.51:1,
 * acento 7.35:1, y el fondo sobre el acento 7.35:1 para el badge de promo.
 *
 * OJO CON LA DIDONICA: Bodoni tiene gruesas finisimas que se comen los fondos
 * oscuros. Por eso se pide en pesos 500-700 y no se usa por debajo de 20px.
 */
export const SOBREMESA_FONT_LINK =
  'https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,500;6..96,600;6..96,700&family=IBM+Plex+Mono:wght@400;500&family=Karla:wght@300;400;500&display=swap';

export const SOBREMESA_THEME_CSS = `:root{
  --bg:#101A16;
  --surface:#16221D;
  --text:#EFE9DC;
  --text-muted:#A39C8C;
  --accent:#C9A227;
  --accent-ink:#C9A227;
  --accent-contrast:#101A16;
  /* Subido desde #2A362F, que daba 1.41:1 y era invisible. Un borde que no se
     ve no separa nada. */
  --border:#384941;
  --radius:0px;
  --font-display:"Bodoni Moda", "Didot", Georgia, serif;
  --font-body:"Karla", system-ui, sans-serif;
  --font-mono:"IBM Plex Mono", ui-monospace, monospace;
  --category-size:1.75rem;
  --category-transform:none;
  --category-tracking:0.01em;
  --category-rule:none;
}`;
