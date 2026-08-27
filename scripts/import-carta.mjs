/**
 * Carga la carta de un restaurante en su proyecto de Sanity.
 *
 *   node --env-file=.env scripts/import-carta.mjs <slug>                     # simulacro
 *   node --env-file=.env scripts/import-carta.mjs <slug> --write
 *   node --env-file=.env scripts/import-carta.mjs <slug> --write --purge-otros
 *
 * La fuente de verdad es scripts/<slug>-carta.json. Editar ESE archivo.
 *
 * Es idempotente: los _id son determinísticos y se usa createOrReplace, así que
 * se puede correr las veces que haga falta sin duplicar nada.
 *
 * SEGURO: no escribe mientras la carta tenga "revisado": false. La
 * transcripción sale de fotos de una carta impresa, y hay 130+ ítems que
 * verificar contra el original antes de que lleguen al menú del cliente.
 *
 * Solo lee campos conocidos de cada plato, así que claves auxiliares del JSON
 * —como `precioMaqueta`, que existe para diseñar— nunca llegan a Sanity.
 */
import fs from 'node:fs';
import path from 'node:path';

const API = '2026-08-01';

const RESTAURANTES = {
  truman: {
    projectId: '6z4dmaab',
    dataset: 'production',
    tokenEnv: 'SANITY_API_EDIT_TOKEN',
  },
  latropilla: {
    projectId: 'tzauffbj',
    dataset: 'production',
    tokenEnv: 'SANITY_API_EDIT_TOKEN_TROPILLA',
  },
  sobremesa: {
    projectId: 'opz7h4cd',
    dataset: 'production',
    tokenEnv: 'SANITY_API_EDIT_TOKEN_GENERICO',
  },
};

function salir(mensaje) {
  console.error('\n  ' + mensaje + '\n');
  process.exit(1);
}

const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith('--'));
const escribir = args.includes('--write');
const purgar = args.includes('--purge-otros');
/**
 * Modo quirurgico: solo actualiza el `price` de cada plato con un `patch`, y no
 * toca nada mas. Existe porque el import normal hace `createOrReplace` sobre el
 * documento del restaurante, y eso borraria el logo, los horarios, las redes y
 * el estado de publicado que el cliente haya cargado desde el Studio.
 */
const soloPrecios = args.includes('--solo-precios');

if (!slug || !RESTAURANTES[slug]) {
  salir(
    `Falta el restaurante. Conocidos: ${Object.keys(RESTAURANTES).join(', ')}\n` +
      '  Ej: node --env-file=.env scripts/import-carta.mjs latropilla',
  );
}

const config = RESTAURANTES[slug];
const token = process.env[config.tokenEnv];
const archivo = path.join(import.meta.dirname, `${slug}-carta.json`);

if (!fs.existsSync(archivo)) salir(`No existe ${path.relative(process.cwd(), archivo)}`);
const carta = JSON.parse(fs.readFileSync(archivo, 'utf8'));

if (escribir && !token) {
  salir(`Falta ${config.tokenEnv} en el entorno. Corré con: node --env-file=.env …`);
}
// `preciosReales` es el nombre viejo de la bandera; se acepta por compatibilidad.
const revisado = carta.revisado ?? carta.preciosReales;
if (escribir && revisado !== true) {
  salir(
    'La carta tiene "revisado": false, así que no se escribe nada.\n' +
      `  Verificá scripts/${slug}-carta.json contra la carta impresa y poné\n` +
      '  esa bandera en true cuando esté confirmada.',
  );
}

async function sanity(ruta, opciones = {}) {
  const res = await fetch(`https://${config.projectId}.api.sanity.io/v${API}/${ruta}`, {
    ...opciones,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opciones.headers,
    },
  });
  const cuerpo = await res.text();
  if (!res.ok) salir(`Sanity respondió HTTP ${res.status}: ${cuerpo.slice(0, 400)}`);
  return cuerpo ? JSON.parse(cuerpo) : null;
}

/**
 * OJO CON LOS PUNTOS: un _id que contiene un punto crea una RUTA en Sanity
 * (drafts.x es el caso conocido), y los documentos bajo una ruta NO son
 * legibles de forma anónima ni en un dataset público. El menú del QR consulta
 * sin token, así que con ids tipo `x.cat.y` la carta le llega VACÍA al cliente
 * aunque en el Studio se vea perfecta. Guiones, nunca puntos.
 */
const idCategoria = (clave) => `${slug}-cat-${clave}`;
const idPlato = (clave) => `${slug}-dish-${clave}`;
const idPromo = (clave) => `${slug}-promo-${clave}`;

/* ---------- armado de documentos ---------- */

const mutaciones = [];

if (soloPrecios) {
  for (const categoria of carta.categorias) {
    for (const plato of categoria.platos) {
      if (typeof plato.price !== 'number') continue;
      mutaciones.push({ patch: { id: idPlato(plato.clave), set: { price: plato.price } } });
    }
  }
}

for (const categoria of soloPrecios ? [] : carta.categorias) {
  for (const plato of categoria.platos) {
    mutaciones.push({
      createOrReplace: {
        _id: idPlato(plato.clave),
        _type: 'dish',
        name: plato.name,
        ...(plato.description ? { description: plato.description } : {}),
        ...(typeof plato.price === 'number' ? { price: plato.price } : {}),
        ...(plato.tags?.length ? { tags: plato.tags } : {}),
        ...(plato.variants?.length
          ? {
              variants: plato.variants.map((v, i) => ({
                _key: `v${i}`,
                label: v.label,
                price: v.price,
              })),
            }
          : {}),
        available: true,
      },
    });
  }

  mutaciones.push({
    createOrReplace: {
      _id: idCategoria(categoria.clave),
      _type: 'menuCategory',
      title: categoria.title,
      ...(categoria.description ? { description: categoria.description } : {}),
      // _key es obligatorio en arrays de Sanity: sin él, el Studio no puede
      // reordenar los elementos arrastrando.
      items: categoria.platos.map((plato) => ({
        _type: 'reference',
        _key: plato.clave,
        _ref: idPlato(plato.clave),
      })),
    },
  });
}

// Promociones. Son opcionales: una carta puede no tener ninguna.
const promociones = soloPrecios ? [] : (carta.promociones ?? []);
for (const promo of promociones) {
  mutaciones.push({
    createOrReplace: {
      _id: idPromo(promo.clave),
      _type: 'promotion',
      name: promo.name,
      ...(promo.description ? { description: promo.description } : {}),
      price: promo.price,
      ...(typeof promo.compareAtPrice === 'number'
        ? { compareAtPrice: promo.compareAtPrice }
        : {}),
      ...(promo.validFrom ? { validFrom: promo.validFrom } : {}),
      ...(promo.validUntil ? { validUntil: promo.validUntil } : {}),
    },
  });
}

if (!soloPrecios) mutaciones.push({
  createOrReplace: {
    _id: 'restaurant',
    _type: 'restaurant',
    name: carta.restaurante.name,
    ...(carta.restaurante.tagline ? { tagline: carta.restaurante.tagline } : {}),
    ...(carta.restaurante.notice ? { notice: carta.restaurante.notice } : {}),
    ...(promociones.length
      ? {
          promotions: promociones.map((p) => ({
            _type: 'reference',
            _key: p.clave,
            _ref: idPromo(p.clave),
          })),
        }
      : {}),
    currency: carta.restaurante.currency,
    contact: carta.restaurante.contact ?? {},
    // Sin _type a propósito: el schema define estos objetos como anónimos
    // dentro del array, así que el Studio infiere el tipo. Inventar un _type
    // que no existe hace que los muestre como "tipo desconocido".
    hours: (carta.restaurante.hours ?? []).map((h, i) => ({
      _key: `h${i}`,
      days: h.days,
      hours: h.hours,
    })),
    menu: carta.categorias.map((c) => ({
      _type: 'reference',
      _key: c.clave,
      _ref: idCategoria(c.clave),
    })),
    // Se publica desde el Studio, después de revisar.
    published: false,
  },
});

// El borrador del singleton taparía al documento importado en el Studio.
if (!soloPrecios) mutaciones.push({ delete: { id: 'drafts.restaurant' } });

/* ---------- purga de contenido ajeno ---------- */

let aPurgar = [];
if (purgar && !soloPrecios) {
  const q = encodeURIComponent(
    `*[_type in ["dish","menuCategory","promotion"] && !string::startsWith(_id, "${slug}-")]{_id,_type,"n":coalesce(name,title)}`,
  );
  const r = await sanity(`data/query/${config.dataset}?perspective=raw&query=${q}`);
  aPurgar = r.result ?? [];
  for (const doc of aPurgar) mutaciones.push({ delete: { id: doc._id } });
}

/* ---------- resumen y ejecución ---------- */

const platos = carta.categorias.reduce((n, c) => n + c.platos.length, 0);
const sinPrecio = carta.categorias
  .flatMap((c) => c.platos)
  .filter((p) => typeof p.price !== 'number' && !p.variants?.length).length;

console.log('');
console.log(`  Restaurante : ${carta.restaurante.name}  (${slug} → ${config.projectId})`);
console.log(`  Categorías  : ${carta.categorias.length}`);
console.log(`  Platos      : ${platos}  (${sinPrecio} sin precio)`);
console.log(`  Transcripción: ${revisado ? 'revisada' : 'SIN REVISAR (no se escribe)'}`);
if (purgar) {
  console.log(`  A borrar    : ${aPurgar.length} documentos ajenos`);
  for (const d of aPurgar.slice(0, 12)) console.log(`                - ${d._type}: ${d.n ?? d._id}`);
  if (aPurgar.length > 12) console.log(`                … y ${aPurgar.length - 12} más`);
}
console.log(`  Mutaciones  : ${mutaciones.length}`);

if (!escribir) {
  console.log('\n  SIMULACRO — no se escribió nada. Agregá --write para ejecutar.\n');
  process.exit(0);
}

const res = await sanity(`data/mutate/${config.dataset}?returnIds=true`, {
  method: 'POST',
  body: JSON.stringify({ mutations: mutaciones }),
});

console.log(`\n  Listo. Transacción ${res.transactionId}, ${res.results.length} documentos.`);
console.log('  El menú quedó SIN publicar: revisalo y publicalo desde el Studio.\n');
