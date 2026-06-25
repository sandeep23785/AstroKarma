import { POLY, CEN } from '../lib/chartGeometry'
import { signOf } from '../lib/astro'

const STROKE = '#C9A957'
const SUB = '#B2A079'
const ACC = '#A8742B'

interface Props {
  houses: string[][]
  ascSign: number
  /** When provided, renders transparent clickable hit areas over each house. */
  onHouse?: (i: number) => void
  /** Highlights a house (e.g. the armed planet's target). */
  selected?: number | null
}

export function NorthIndianChart({ houses, ascSign, onHouse, selected }: Props) {
  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%" style={{ display: 'block' }}>
      <rect x={2} y={2} width={396} height={396} rx={6} fill="#FCFAF4" stroke={STROKE} strokeWidth={1.6} />
      <polygon points={POLY[0]} fill="#F1E6CF" opacity={0.85} />
      {selected != null && selected !== 0 && (
        <polygon points={POLY[selected]} fill="#A8742B" opacity={0.16} />
      )}
      <line x1={2} y1={2} x2={398} y2={398} stroke={STROKE} strokeWidth={1.4} />
      <line x1={398} y1={2} x2={2} y2={398} stroke={STROKE} strokeWidth={1.4} />
      <polygon points="200,2 398,200 200,398 2,200" fill="none" stroke={STROKE} strokeWidth={1.4} />

      {CEN.map((c, i) => {
        const sign = signOf(i, ascSign)
        const pl = houses[i] || []
        return (
          <g key={i} style={{ pointerEvents: 'none' }}>
            <text
              x={c[0]}
              y={c[1] - 11}
              textAnchor="middle"
              fontSize={10}
              fontWeight={600}
              fill={SUB}
              fontFamily="Hanken Grotesk"
            >
              {sign}
            </text>
            {pl.length > 0 && (
              <text
                x={c[0]}
                y={c[1] + 8}
                textAnchor="middle"
                fontSize={13.5}
                fontWeight={700}
                fill={i === 0 ? ACC : '#9A6A28'}
                fontFamily="Hanken Grotesk"
                letterSpacing={0.4}
              >
                {pl.join('  ')}
              </text>
            )}
            {i === 0 && (
              <text
                x={c[0]}
                y={c[1] + 24}
                textAnchor="middle"
                fontSize={8}
                fontWeight={700}
                fill={ACC}
                fontFamily="Hanken Grotesk"
                letterSpacing={1.5}
              >
                ASC
              </text>
            )}
          </g>
        )
      })}

      {onHouse &&
        POLY.map((p, i) => (
          <polygon
            key={'h' + i}
            points={p}
            fill="transparent"
            stroke="transparent"
            style={{ cursor: 'pointer' }}
            onClick={() => onHouse(i)}
          />
        ))}
    </svg>
  )
}
