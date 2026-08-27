/**
 * Catalogo de iconos.
 *
 * Los SVG de src/icons/ se incrustan en el HTML en tiempo de compilacion. Eso
 * da tres cosas que un <img> no da: heredan `currentColor` (el mismo archivo
 * sale negro en La Tropilla y bronce en Truman), quedan nitidos en cualquier
 * pantalla, y no agregan un solo pedido de red aunque se dibujen 92 veces en
 * una pagina.
 *
 * Agregar un icono es soltar un archivo en src/icons/: el nombre del archivo es
 * el nombre del icono. Conviene pasarle antes
 * `node scripts/normalizar-iconos.mjs --write`, que se encarga de los colores
 * escritos a mano y del width/height del svg raiz.
 */
const modulos = import.meta.glob('../icons/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export const ICONOS: Record<string, string> = Object.fromEntries(
  Object.entries(modulos).map(([ruta, svg]) => [
    ruta
      .split('/')
      .pop()!
      .replace(/\.svg$/i, ''),
    svg,
  ]),
);

export function hayIcono(nombre: string | undefined): boolean {
  return Boolean(nombre && nombre in ICONOS);
}
