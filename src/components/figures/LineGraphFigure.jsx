// 折れ線グラフ(4年)。points: [{ label, value }] を折れ線で描き、変化を読む。
export default function LineGraphFigure({ points, unit = '', maxY = null }) {
  const w = 320
  const h = 200
  const padL = 32
  const padB = 28
  const padT = 14
  const top = Math.max(maxY || 0, ...points.map((p) => p.value))
  const yMax = Math.ceil(top / 5) * 5 || 5
  const x = (i) => padL + (i / (points.length - 1)) * (w - padL - 12)
  const y = (v) => h - padB - (v / yMax) * (h - padB - padT)

  const yTicks = Array.from({ length: 6 }, (_, i) => Math.round((yMax / 5) * i))

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="max-w-full bg-white/70 rounded-2xl">
      {/* 目盛り線 */}
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={padL} y1={y(t)} x2={w - 12} y2={y(t)} stroke="#EADCE6" strokeWidth="1" />
          <text x={padL - 5} y={y(t) + 4} textAnchor="end" fontSize="9" fill="#8A7580">
            {t}
          </text>
        </g>
      ))}
      {/* 横軸ラベル */}
      {points.map((p, i) => (
        <text key={i} x={x(i)} y={h - padB + 14} textAnchor="middle" fontSize="9" fill="#8A7580">
          {p.label}
        </text>
      ))}
      {/* 折れ線 */}
      <polyline
        points={points.map((p, i) => `${x(i)},${y(p.value)}`).join(' ')}
        fill="none"
        stroke="#FF6FA5"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(p.value)} r="4" fill="#FF6FA5" />
          <text x={x(i)} y={y(p.value) - 8} textAnchor="middle" fontSize="9" fontWeight="700" fill="#5D4A55">
            {p.value}
          </text>
        </g>
      ))}
      {unit && (
        <text x={padL - 5} y={padT} textAnchor="end" fontSize="9" fill="#8A7580">
          ({unit})
        </text>
      )}
    </svg>
  )
}
