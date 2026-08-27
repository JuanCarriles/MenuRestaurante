import { defineQuery } from 'groq';

/**
 * Una sola query por pagina.
 *
 * Decisiones que viven aca y no en los componentes:
 *  - Las promos vencidas o todavia no vigentes se filtran en GROQ. Si llegaran
 *    al cliente ya seria tarde: viajaron por la red y hay que esconderlas.
 *  - Los platos marcados como no disponibles tampoco viajan.
 *
 * TRAMPA DE GROQ, verificada contra la API: para sacar elementos de un array de
 * referencias hay que filtrar el array ANTES de dereferenciar, usando `@->`:
 *
 *     items[defined(@->_id) && @->available != false]->{...}   <- elimina
 *     items[]->{...}[available != false]                       <- deja nulls
 *     items[]->[available != false]{...}                       <- deja nulls
 *
 * Las dos ultimas formas se aplican elemento por elemento como condicional: el
 * que no cumple no desaparece, se vuelve null, y el array queda lleno de nulls
 * que revientan cualquier .map en el componente.
 *
 * `defined(@->_id)` descarta ademas las referencias a documentos sin publicar:
 * con perspective 'published', un -> a un borrador devuelve null.
 *  - El lqip del asset viaja embebido para el blur, sin pedido extra de red.
 */
export const MENU_QUERY = defineQuery(`*[_type == "restaurant"][0]{
  name,
  tagline,
  notice,
  published,
  currency,
  pricesUpdatedAt,
  theme,
  contact,
  hours,
  logo{
    alt,
    asset->{ _id, url, metadata { lqip, dimensions { width, height } } }
  },
  hero{
    alt,
    asset->{ _id, url, metadata { lqip, dimensions { width, height } } }
  },
  "promotions": promotions[
    defined(@->_id) &&
    (!defined(@->validFrom) || @->validFrom <= $today) &&
    (!defined(@->validUntil) || @->validUntil >= $today)
  ]->{
    _id,
    name,
    description,
    price,
    compareAtPrice,
    validFrom,
    validUntil,
    image{
      alt,
      asset->{ _id, url, metadata { lqip, dimensions { width, height } } }
    },
    "includes": includes[defined(@->_id)]->{ _id, name }
  },
  "menu": menu[defined(@->_id)]->{
    _id,
    title,
    description,
    "items": items[defined(@->_id) && @->available != false]->{
      _id,
      name,
      description,
      price,
      variants,
      tags,
      available,
      image{
        alt,
        asset->{ _id, url, metadata { lqip, dimensions { width, height } } }
      }
    }
  }
}`);

/**
 * Tipos escritos a mano hasta que haya un proyecto real de Sanity contra el que
 * correr `npm run typegen`. Cuando exista, estos tipos se reemplazan por los
 * generados en sanity.types.ts y esta seccion se borra.
 */
export interface SanityPhoto {
  alt?: string;
  asset?: {
    _id: string;
    url: string;
    metadata?: {
      lqip?: string;
      dimensions?: { width: number; height: number };
    };
  };
}

export interface DishData {
  _id: string;
  name: string;
  description?: string;
  /** Opcional: la carta de vinos y la de cocteles no llevan precio impreso. */
  price?: number;
  variants?: { label: string; price: number }[];
  tags?: string[];
  available?: boolean;
  image?: SanityPhoto;
}

export interface PromotionData {
  _id: string;
  name: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  validFrom?: string;
  validUntil?: string;
  image?: SanityPhoto;
  includes?: { _id: string; name: string }[];
}

export interface CategoryData {
  _id: string;
  title: string;
  description?: string;
  items?: DishData[];
}

export interface RestaurantData {
  name: string;
  tagline?: string;
  notice?: string;
  published?: boolean;
  currency?: string;
  pricesUpdatedAt?: string;
  theme?: import('../themes/resolve').ThemeInput;
  contact?: {
    whatsapp?: string;
    phone?: string;
    /** Usuario o link completo. Resolver con `instagramUrl()` de ~/lib/social. */
    instagram?: string;
    /** Usuario o link completo. Resolver con `facebookUrl()` de ~/lib/social. */
    facebook?: string;
    address?: string;
    mapsUrl?: string;
  };
  hours?: { days: string; hours: string }[];
  logo?: SanityPhoto;
  hero?: SanityPhoto;
  promotions?: PromotionData[];
  menu?: CategoryData[];
}
