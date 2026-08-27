/**
 * Normaliza los SVG de src/icons/ para que sirvan como iconos del menu.
 *
 *   node scripts/normalizar-iconos.mjs           # informe, no toca nada
 *   node scripts/normalizar-iconos.mjs --write   # aplica los cambios
 *
 * Que hace y por que:
 *
 *  - Reemplaza los colores escritos a mano por `currentColor`. Es LO que hace
 *    que el mismo archivo salga negro en La Tropilla y bronce en Truman. Un
 *    icono con `fill="#000000"` queda negro en los dos y se pierde el punto.
 *  - Saca `width` y `height` del <svg> raiz: el tamano lo decide el CSS de cada
 *    menu, no el archivo.
 *  - Saca la declaracion XML, el DOCTYPE y los comentarios, que sobran cuando el
 *    SVG se incrusta dentro del HTML.
 *
 * No toca `fill="none"` ni `stroke="none"`, que son significativos.
 */
import fs from 'node:fs';
import path from 'node:path';

const escribir = process.argv.includes('--write');
const carpeta = path.join(import.meta.dirname, '..', 'src', 'icons');

const COLOR = /(fill|stroke)="(?!none|currentColor)([^"]+)"/gi;

function normalizar(svg) {
  const cambios = [];
  let out = svg;

  const antesXml = out;
  out = out
    .replace(/<\?xml[\s\S]*?\?>\s*/gi, '')
    .replace(/<!DOCTYPE[\s\S]*?>\s*/gi, '')
    .replace(/<!--[\s\S]*?-->\s*/g, '');
  if (out !== antesXml) cambios.push('saque XML/DOCTYPE/comentarios');

  // width y height SOLO del <svg> raiz
  out = out.replace(/<svg\b[^>]*>/i, (etiqueta) => {
    const limpia = etiqueta.replace(/\s(width|height)="[^"]*"/gi, '');
    if (limpia !== etiqueta) cambios.push('saque width/height del svg raiz');
    return limpia;
  });

  const colores = [...out.matchAll(COLOR)].map((m) => m[2]);
  if (colores.length) {
    out = out.replace(COLOR, '$1="currentColor"');
    cambios.push(`pase a currentColor: ${[...new Set(colores)].join(', ')}`);
  }

  return { out: out.trim() + '\n', cambios };
}

if (!fs.existsSync(carpeta)) {
  console.error('\n  No existe src/icons/\n');
  process.exit(1);
}

const archivos = fs.readdirSync(carpeta).filter((f) => f.toLowerCase().endsWith('.svg'));
if (!archivos.length) {
  console.log('\n  No hay SVG en src/icons/\n');
  process.exit(0);
}

console.log('');
let tocados = 0;

for (const archivo of archivos) {
  const ruta = path.join(carpeta, archivo);
  const original = fs.readFileSync(ruta, 'utf8');
  const { out, cambios } = normalizar(original);

  const kb = (Buffer.byteLength(original) / 1024).toFixed(1);
  if (!cambios.length) {
    console.log(`  ok      ${archivo.padEnd(24)} ${kb.padStart(7)} KB`);
    continue;
  }

  tocados++;
  console.log(`  ${escribir ? 'ARREGLO' : 'ARREGLAR'} ${archivo.padEnd(24)} ${kb.padStart(7)} KB`);
  for (const c of cambios) console.log(`          - ${c}`);
  if (escribir) fs.writeFileSync(ruta, out);
}

if (!escribir && tocados) {
  console.log(`\n  ${tocados} archivo(s) para arreglar. Agregá --write para aplicarlo.`);
}
console.log('');
