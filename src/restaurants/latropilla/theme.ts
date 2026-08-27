/**
 * Tokens de La Tropilla.
 *
 * La carta impresa no tiene un solo color, y eso es la decision, no una
 * omision: todo el contraste sale de la tipografia y del aire, no del tono.
 * Por eso `accent` es la misma tinta que el texto — donde otro local pondria
 * color, este pone escala e inversion (tinta llena, papel encima).
 *
 * Se usan los mismos nombres de variables que el resto del codigo para que las
 * utilidades de Tailwind (text-accent-ink, bg-bg, cat-title) sigan andando.
 */
export const LATROPILLA_FONT_LINK =
  'https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500&family=Parisienne&display=swap';

export const LATROPILLA_THEME_CSS = `:root{
  --bg:#FFFFFF;
  --surface:#FFFFFF;
  --text:#111111;
  --text-muted:#5A5A5A;
  --accent:#111111;
  --accent-ink:#111111;
  --accent-contrast:#FFFFFF;
  --border:#DCDCDC;
  --radius:0px;
  --font-display:"Parisienne", "Apple Chancery", cursive;
  --font-body:"Jost", "Century Gothic", system-ui, sans-serif;
  --category-size:2.5rem;
  --category-transform:none;
  --category-tracking:0em;
  /* Sin regla bajo el titulo: la carta separa las secciones con aire, no con
     lineas. La unica linea del diseno es el borde de la navegacion. */
  --category-rule:none;
}`;
