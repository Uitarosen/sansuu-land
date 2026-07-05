// ぶんすうの図(§6.5)。円を denom 等分し filled 個を塗る。
export default function FractionSVG({ denom = 2, filled = 1, size = 160 }) {
  const cx = 100
  const cy = 100
  const r = 84
  const slices = Array.from({ length: denom })
  const arc = (i) => {
    const a0 = (i / denom) * 2 * Math.PI - Math.PI / 2
    const a1 = ((i + 1) / denom) * 2 * Math.PI - Math.PI / 2
    const x0 = cx + r * Math.cos(a0)
    const y0 = cy + r * Math.sin(a0)
    const x1 = cx + r * Math.cos(a1)
    const y1 = cy + r * Math.sin(a1)
    const large = a1 - a0 > Math.PI ? 1 : 0
    return `M${cx},${cy} L${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1} Z`
  }
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden>
      {slices.map((_, i) => (
        <path
          key={i}
          d={arc(i)}
          fill={i < filled ? '#FFB7D5' : '#fff'}
          stroke="#5D4A55"
          strokeWidth="3"
        />
      ))}
    </svg>
  )
}
