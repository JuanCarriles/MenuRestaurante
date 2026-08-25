import { set, unset, useFormValue, type StringInputProps } from 'sanity';
import {
  ACCENTS,
  SURFACES,
  accentsFor,
  contrastForAccent,
  getSurface,
  type Accent,
  type Surface,
} from '../../src/themes/palette';

/**
 * Selectores de color por muestra.
 *
 * El dueño de un restaurante no elige "#8c2f27", elige el cuadradito bordó.
 * Por eso estos inputs reemplazan al campo de texto: se ve el color y se ve
 * como queda el texto encima, que es la unica forma de decidir bien.
 */

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
  gap: 10,
};

function swatchButtonStyle(selected: boolean, disabled: boolean): React.CSSProperties {
  return {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    padding: 0,
    border: 'none',
    background: 'none',
    cursor: disabled ? 'default' : 'pointer',
    textAlign: 'center',
    opacity: disabled ? 0.5 : 1,
    outline: selected ? '2px solid #2276fc' : 'none',
    outlineOffset: 3,
    borderRadius: 6,
  };
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  lineHeight: 1.3,
  color: 'inherit',
};

export function SurfaceInput(props: StringInputProps) {
  const { value, onChange, readOnly } = props;

  return (
    <div style={gridStyle}>
      {SURFACES.map((surface: Surface) => {
        const selected = value === surface.id;
        return (
          <button
            key={surface.id}
            type="button"
            disabled={readOnly}
            aria-pressed={selected}
            style={swatchButtonStyle(selected, Boolean(readOnly))}
            onClick={() => onChange(selected ? unset() : set(surface.id))}
          >
            <span
              style={{
                display: 'block',
                height: 56,
                borderRadius: 6,
                background: surface.bg,
                border: `1px solid ${surface.border}`,
                position: 'relative',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  left: 8,
                  top: 6,
                  fontSize: 18,
                  fontWeight: 600,
                  color: surface.text,
                }}
              >
                Aa
              </span>
              <span
                style={{
                  position: 'absolute',
                  left: 8,
                  bottom: 6,
                  fontSize: 11,
                  color: surface.textMuted,
                }}
              >
                texto
              </span>
            </span>
            <span style={labelStyle}>{surface.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function AccentInput(props: StringInputProps) {
  const { value, onChange, readOnly } = props;

  // El acento depende del fondo: uno que se lee bien sobre crema puede
  // desaparecer sobre carbon. Se ofrecen solo los que funcionan.
  const surfaceId = useFormValue(['theme', 'surface']) as string | undefined;
  const surface = getSurface(surfaceId);
  const allowed = accentsFor(surface.id);
  const allowedIds = new Set(allowed.map((a) => a.id));
  const hidden = ACCENTS.length - allowed.length;

  return (
    <div>
      <div style={gridStyle}>
        {allowed.map((accent: Accent) => {
          const selected = value === accent.id;
          return (
            <button
              key={accent.id}
              type="button"
              disabled={readOnly}
              aria-pressed={selected}
              style={swatchButtonStyle(selected, Boolean(readOnly))}
              onClick={() => onChange(selected ? unset() : set(accent.id))}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 56,
                  borderRadius: 6,
                  background: accent.value,
                  color: contrastForAccent(accent),
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                $ 4.900
              </span>
              <span style={labelStyle}>{accent.label}</span>
            </button>
          );
        })}
      </div>

      {hidden > 0 && (
        <p style={{ fontSize: 12, opacity: 0.7, marginTop: 12, marginBottom: 0 }}>
          Hay {hidden} {hidden === 1 ? 'color más que no se ofrece' : 'colores más que no se ofrecen'}{' '}
          porque no se leen bien sobre el fondo {surface.label}. Cambiá el fondo para verlos.
        </p>
      )}

      {value && !allowedIds.has(value) && (
        <p style={{ fontSize: 12, color: '#b3421f', marginTop: 8, marginBottom: 0 }}>
          El color elegido no se lee bien sobre el fondo {surface.label}, así que el menú está usando
          otro. Elegí uno de los de arriba.
        </p>
      )}
    </div>
  );
}
