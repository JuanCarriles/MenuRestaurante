import LaTropillaMenu from './latropilla/LaTropillaMenu.astro';
import { LATROPILLA_FONT_LINK, LATROPILLA_THEME_CSS } from './latropilla/theme';
import SobremesaMenu from './sobremesa/SobremesaMenu.astro';
import { SOBREMESA_FONT_LINK, SOBREMESA_THEME_CSS } from './sobremesa/theme';
import TrumanMenu from './truman/TrumanMenu.astro';
import { TRUMAN_FONT_LINK, TRUMAN_THEME_CSS } from './truman/theme';

/**
 * Registro de diseños a medida.
 *
 * El producto dejo de ser una plantilla configurable: cada restaurante tiene su
 * propio front-end. Lo que se comparte es la CAPA DE DATOS (cliente de Sanity,
 * query, formato de precios, imagenes) y los estados de error; lo que cambia es
 * todo lo visual.
 *
 * Para sumar un restaurante:
 *   1. src/restaurants/<slug>/<Nombre>Menu.astro  — el diseño
 *   2. src/restaurants/<slug>/theme.ts            — sus tokens y su fuente
 *   3. una entrada aca abajo
 *   4. la entrada correspondiente en src/tenants.ts
 *
 * El tipo del componente sale del de Truman a proposito: obliga a que todos los
 * diseños acepten el mismo contrato de props, asi el despachador nunca tiene
 * que saber cual esta renderizando.
 */
export type MenuComponent = typeof TrumanMenu;

export interface RestaurantDesign {
  component: MenuComponent;
  /** Bloque :root con los tokens del local. Lo inyecta la pagina en el <head>. */
  themeCss: string;
  /** Hoja de Google Fonts del local. Se emite solo la suya. */
  fontLink: string;
}

const REGISTRY: Record<string, RestaurantDesign> = {
  truman: {
    component: TrumanMenu,
    themeCss: TRUMAN_THEME_CSS,
    fontLink: TRUMAN_FONT_LINK,
  },
  latropilla: {
    component: LaTropillaMenu,
    themeCss: LATROPILLA_THEME_CSS,
    fontLink: LATROPILLA_FONT_LINK,
  },
  sobremesa: {
    component: SobremesaMenu,
    themeCss: SOBREMESA_THEME_CSS,
    fontLink: SOBREMESA_FONT_LINK,
  },
};

export function getDesign(slug: string | undefined): RestaurantDesign | undefined {
  if (!slug) return undefined;
  return REGISTRY[slug];
}
