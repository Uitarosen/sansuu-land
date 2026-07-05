// 図形(§3.3 図形タップ)。かたちを SVG で描く。
export default function ShapeSVG({ kind, size = 90, color = '#FFB7D5' }) {
  const s = size
  const stroke = '#5D4A55'
  const common = { fill: color, stroke, strokeWidth: 3, strokeLinejoin: 'round' }
  return (
    <svg viewBox="0 0 100 100" width={s} height={s} aria-hidden>
      {kind === 'circle' && <circle cx="50" cy="50" r="40" {...common} />}
      {kind === 'triangle' && <polygon points="50,12 88,86 12,86" {...common} />}
      {kind === 'righttriangle' && <polygon points="18,14 18,86 86,86" {...common} />}
      {kind === 'square' && <rect x="16" y="16" width="68" height="68" rx="4" {...common} />}
      {kind === 'rectangle' && <rect x="8" y="28" width="84" height="44" rx="4" {...common} />}
    </svg>
  )
}
