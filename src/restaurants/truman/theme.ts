/**
 * Tokens de Truman Bar & Kitchen.
 *
 * Escritos a mano para este local: no salen del sistema de presets, que quedo
 * dormido cuando el producto paso a front-ends a medida. Se mantienen los
 * MISMOS nombres de variables que usa el resto del codigo (--bg, --accent, …)
 * para que las utilidades de Tailwind (text-accent, bg-surface, cat-title)
 * sigan funcionando sin cambios.
 */
export const TRUMAN_FONT_LINK =
  'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap';

export const TRUMAN_THEME_CSS = `:root{
  --bg:#FFFFFF;
  --surface:#FFFFFF;
  --text:#1D1D1B;
  --text-muted:#6B6B6B;
  --accent:#B28C62;
  /* El bronce de marca da 3.08:1 sobre blanco: alcanza para reglas y bordes,
     pero NO para texto. Este es el mismo tono un paso mas oscuro (4.59:1), y
     es el que se usa en precios y titulos. Los precios son lo que la gente
     vino a leer: no pueden quedar por debajo de AA. */
  --accent-ink:#8E704E;
  --accent-contrast:#1D1D1B;
  --border:#E5E5E5;
  --radius:0.5rem;
  --font-display:"Playfair Display", Georgia, serif;
  --font-body:"Inter", system-ui, sans-serif;
  --category-size:1.125rem;
  --category-transform:uppercase;
  --category-tracking:0.18em;
  --category-rule:1px dotted var(--accent);
}`;
