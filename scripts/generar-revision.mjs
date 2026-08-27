/**
 * Genera la pagina de revision de la carta de un restaurante.
 *
 *   node scripts/generar-revision.mjs <slug>
 *
 * Lee scripts/<slug>-carta.json y se viste con los tokens de
 * src/restaurants/<slug>/theme.ts, asi que la revision se ve con la estetica
 * del local y no hay una segunda paleta que mantener.
 *
 * Se genera desde el JSON a proposito: si la pagina se escribiera a mano podria
 * diferir de lo que el import va a escribir, y estarian verificando otra cosa.
 * Muestra "sin precio" donde no hay `price`; los `precioMaqueta`, que existen
 * solo para disenar, no aparecen — igual que no llegan a Sanity.
 */
import fs from 'node:fs';
import path from 'node:path';

const slug = process.argv[2];
if (!slug) {
  console.error('\n  Falta el restaurante. Ej: node scripts/generar-revision.mjs latropilla\n');
  process.exit(1);
}

const archivo = path.join(import.meta.dirname, `${slug}-carta.json`);
if (!fs.existsSync(archivo)) {
  console.error(`\n  No existe scripts/${slug}-carta.json\n`);
  process.exit(1);
}
const carta = JSON.parse(fs.readFileSync(archivo, 'utf8'));

/**
 * La pagina de revision se viste con el tema del propio local, leyendo los
 * tokens de src/restaurants/<slug>/theme.ts. Asi no hay una segunda paleta que
 * mantener, y de paso la revision transmite la estetica del menu real.
 */
const temaSrc = fs.readFileSync(
  path.join(import.meta.dirname, '..', 'src', 'restaurants', slug, 'theme.ts'),
  'utf8',
);
const token = (nombre, porDefecto) => {
  const m = temaSrc.match(new RegExp(`--${nombre}:\\s*([^;\\n]+);`));
  return m ? m[1].trim() : porDefecto;
};
const fontLink = (temaSrc.match(/'(https:\/\/fonts\.googleapis\.com[^']+)'/) ?? [])[1] ?? '';
const TEMA = {
  bg: token('bg', '#ffffff'),
  text: token('text', '#111111'),
  muted: token('text-muted', '#6b6b6b'),
  border: token('border', '#e5e5e5'),
  acento: token('accent-ink', token('accent', '#8e704e')),
  display: token('font-display', 'Georgia, serif'),
  body: token('font-body', 'system-ui, sans-serif'),
  catTransform: token('category-transform', 'uppercase'),
  catTracking: token('category-tracking', '0.16em'),
  catSize: token('category-size', '1.0625rem'),
};

const money = (n) => '$ ' + new Intl.NumberFormat('es-AR').format(n);
const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const platos = carta.categorias.reduce((n, c) => n + c.platos.length, 0);
const variantes = carta.categorias.reduce(
  (n, c) => n + c.platos.reduce((m, p) => m + (p.variants?.length ?? 0), 0),
  0,
);
const dudosos = carta.categorias.flatMap((c) => c.platos.filter((p) => p.revisar));
const sinPrecio = carta.categorias.reduce(
  (n, c) => n + c.platos.filter((p) => typeof p.price !== 'number' && !p.variants?.length).length,
  0,
);

const secciones = carta.categorias
  .map((cat) => {
    const filas = cat.platos
      .map((p) => {
        const variantes = (p.variants ?? [])
          .map(
            (v) => `
            <li class="variante">
              <span>${esc(v.label)}</span>
              <span class="precio">${money(v.price)}</span>
            </li>`,
          )
          .join('');

        return `
        <li class="plato${p.revisar ? ' plato--dudoso' : ''}">
          <div class="plato__linea">
            <span class="plato__nombre">${esc(p.name)}${
              p.revisar ? '<span class="marca">a confirmar</span>' : ''
            }</span>
            ${
              p.variants?.length
                ? '<span class="precio precio--vacio">—</span>'
                : typeof p.price === 'number'
                  ? `<span class="precio">${money(p.price)}</span>`
                  : '<span class="precio precio--vacio">sin precio</span>'
            }
          </div>
          ${p.description ? `<p class="plato__desc">${esc(p.description)}</p>` : ''}
          ${p.nota ? `<p class="plato__desc"><em>${esc(p.nota)}</em></p>` : ''}
          ${variantes ? `<ul class="variantes">${variantes}</ul>` : ''}
        </li>`;
      })
      .join('');

    return `
    <section class="cat">
      <header class="cat__head">
        <h2>${esc(cat.title)}</h2>
        <label class="tilde">
          <input type="checkbox" data-cat="${esc(cat.clave)}" />
          <span>revisada</span>
        </label>
      </header>
      ${cat.description ? `<p class="cat__nota">${esc(cat.description)}</p>` : ''}
      <ul class="platos">${filas}</ul>
    </section>`;
  })
  .join('');

const html = `<title>Carta ${esc(carta.restaurante.name)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="stylesheet"
  href="${fontLink}"
/>

<style>
  /* Una sola paleta: la del propio local. La carta de un restaurante es una
     hoja de papel, no cambia con el tema del sistema. Los tonos de aviso son
     chrome de esta herramienta, no del local. */
  :root {
    --ground: ${TEMA.bg};
    --ink: ${TEMA.text};
    --muted: ${TEMA.muted};
    --line: ${TEMA.border};
    --acento: ${TEMA.acento};
    --flag: #a33a2a;
    --flag-bg: #fbf1ee;
  }

  body {
    margin: 0;
    background: var(--ground);
    color: var(--ink);
    font-family: ${TEMA.body};
    font-size: 16px;
    line-height: 1.5;
    -webkit-text-size-adjust: 100%;
  }

  .envoltorio {
    max-width: 46rem;
    margin: 0 auto;
    padding: 2.5rem 1.25rem 5rem;
  }

  .titulo {
    font-family: ${TEMA.display};
    font-weight: 600;
    font-size: clamp(1.9rem, 5vw, 2.6rem);
    line-height: 1.1;
    margin: 0;
    text-wrap: balance;
  }

  .bajada {
    color: var(--muted);
    margin: 0.6rem 0 0;
    max-width: 34rem;
  }

  .resumen {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.75rem;
    margin-top: 1.5rem;
    padding-top: 1.25rem;
    border-top: 1px solid var(--line);
    font-size: 0.875rem;
    color: var(--muted);
  }
  .resumen b {
    color: var(--ink);
    font-variant-numeric: tabular-nums;
    font-weight: 600;
  }

  .aviso {
    margin-top: 1.75rem;
    padding: 1rem 1.15rem;
    background: var(--flag-bg);
    border-left: 3px solid var(--flag);
    border-radius: 2px;
  }
  .aviso h3 {
    margin: 0 0 0.4rem;
    font-size: 0.8125rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--flag);
  }
  .aviso p {
    margin: 0 0 0.5rem;
    font-size: 0.9375rem;
  }
  .aviso p:last-child {
    margin-bottom: 0;
  }

  .cat {
    margin-top: 3rem;
  }
  .cat__head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    border-bottom: 1px dotted var(--acento);
    padding-bottom: 0.5rem;
  }
  .cat__head h2 {
    font-family: ${TEMA.display};
    font-weight: 600;
    font-size: ${TEMA.catSize};
    letter-spacing: ${TEMA.catTracking};
    text-transform: ${TEMA.catTransform};
    line-height: 1.3;
    color: var(--acento);
    margin: 0;
  }
  .cat__nota {
    margin: 0.75rem 0 0;
    font-size: 0.875rem;
    color: var(--muted);
  }

  .tilde {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8125rem;
    color: var(--muted);
    cursor: pointer;
    white-space: nowrap;
    min-height: 44px;
  }
  .tilde input {
    width: 1.05rem;
    height: 1.05rem;
    accent-color: var(--acento);
    cursor: pointer;
  }
  .tilde input:focus-visible {
    outline: 2px solid var(--acento);
    outline-offset: 2px;
  }

  .platos {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 1.15rem;
    padding-top: 1.15rem;
  }

  .plato--dudoso {
    background: var(--flag-bg);
    margin-inline: -0.6rem;
    padding: 0.6rem;
    border-radius: 3px;
  }

  .plato__linea {
    display: flex;
    align-items: baseline;
    gap: 1rem;
  }
  .plato__nombre {
    flex: 1;
    min-width: 0;
    font-weight: 500;
  }
  .plato__desc {
    margin: 0.15rem 0 0;
    font-size: 0.875rem;
    color: var(--muted);
  }

  .precio {
    flex-shrink: 0;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
    font-weight: 600;
    color: var(--acento);
  }
  .precio--vacio {
    color: var(--muted);
    font-weight: 400;
  }

  .variantes {
    list-style: none;
    margin: 0.5rem 0 0;
    padding: 0 0 0 1rem;
    border-left: 1px solid var(--line);
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }
  .variante {
    display: flex;
    align-items: baseline;
    gap: 1rem;
    font-size: 0.9375rem;
  }
  .variante span:first-child {
    flex: 1;
    min-width: 0;
    color: var(--muted);
  }

  .marca {
    display: inline-block;
    margin-left: 0.5rem;
    font-size: 0.6875rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--flag);
    border: 1px solid currentColor;
    border-radius: 999px;
    padding: 0.1rem 0.45rem;
    vertical-align: 0.1em;
  }

  .pie {
    margin-top: 3.5rem;
    padding-top: 1.25rem;
    border-top: 1px solid var(--line);
    font-size: 0.8125rem;
    color: var(--muted);
  }
</style>

<div class="envoltorio">
  <h1 class="titulo">${esc(carta.restaurante.name)}</h1>
  <p class="bajada">
    Transcripción de las fotos de la carta física, tal cual va a entrar a Sanity.
    Revisala contra la carta y marcá cada sección; lo que no coincida, decímelo y lo corrijo.
  </p>

  <div class="resumen">
    <span><b>${carta.categorias.length}</b> categorías</span>
    <span><b>${platos}</b> platos</span>
    <span><b>${variantes}</b> variantes</span>
    <span><b>${sinPrecio}</b> sin precio</span>
    <span><b>${dudosos.length}</b> a confirmar</span>
  </div>

  <div class="aviso">
    <h3>Para confirmar</h3>
    <p>
      Esto es lo que va a entrar a Sanity, transcrito de las fotos de la carta.
      Los ítems que dicen <strong>sin precio</strong> (${sinPrecio} de
      ${platos}) se van a mostrar solo con el nombre, como en la carta impresa.
    </p>
    ${
      dudosos.length
        ? `<p><strong>${dudosos.length} marcado${dudosos.length === 1 ? '' : 's'}</strong> con fondo rojo: no los pude leer con certeza en la foto.</p>`
        : ''
    }
  </div>

  <section class="cat">
    <header class="cat__head">
      <h2>Datos del local</h2>
      <label class="tilde">
        <input type="checkbox" data-cat="__datos" />
        <span>revisada</span>
      </label>
    </header>
    <ul class="platos">
      <li class="plato"><div class="plato__linea"><span class="plato__nombre">Nombre</span><span class="precio">${esc(carta.restaurante.name)}</span></div></li>
      <li class="plato"><div class="plato__linea"><span class="plato__nombre">Bajada</span><span class="precio">${esc(carta.restaurante.tagline)}</span></div></li>
      <li class="plato"><div class="plato__linea"><span class="plato__nombre">Instagram</span><span class="precio">@${esc(carta.restaurante.contact?.instagram ?? '—')}</span></div></li>
      ${(carta.restaurante.hours ?? [])
        .map(
          (h) =>
            `<li class="plato"><div class="plato__linea"><span class="plato__nombre">${esc(
              h.days,
            )}</span><span class="precio">${esc(h.hours)}</span></div></li>`,
        )
        .join('')}
      <li class="plato plato--dudoso"><div class="plato__linea"><span class="plato__nombre">Dirección<span class="marca">falta</span></span><span class="precio precio--vacio">sin cargar</span></div></li>
    </ul>
  </section>

  ${secciones}

  <p class="pie">
    Generado desde <code>scripts/${slug}-carta.json</code>. Los precios se importan sin publicar:
    el menú se publica desde el Studio recién después de esta revisión.
  </p>
</div>

<script>
  // Las marcas de "revisada" son una comodidad local de quien revisa: viven solo
  // en su navegador y no viajan a ningun lado.
  (function () {
    var CLAVE = '${slug}-carta-revisada';
    var estado = {};
    try {
      estado = JSON.parse(localStorage.getItem(CLAVE) || '{}');
    } catch (e) {
      estado = {};
    }

    var cajas = document.querySelectorAll('input[data-cat]');
    for (var i = 0; i < cajas.length; i++) {
      (function (caja) {
        var id = caja.getAttribute('data-cat');
        caja.checked = Boolean(estado[id]);
        caja.addEventListener('change', function () {
          estado[id] = caja.checked;
          try {
            localStorage.setItem(CLAVE, JSON.stringify(estado));
          } catch (e) {
            /* modo privado o almacenamiento bloqueado: se pierde al recargar */
          }
        });
      })(cajas[i]);
    }
  })();
</script>
`;

const destino = path.join(import.meta.dirname, '..', 'design', `carta-${slug}-revision.html`);
fs.writeFileSync(destino, html);
console.log('generado: ' + path.relative(process.cwd(), destino));
console.log(
  `  ${carta.categorias.length} categorías · ${platos} platos · ${variantes} variantes · ${dudosos.length} a confirmar`,
);
