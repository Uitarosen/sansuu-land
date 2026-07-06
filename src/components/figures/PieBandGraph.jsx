// 円グラフ・帯グラフ(5年)。割合の 内わけを 見る。
// props: segments = [{label, pct}], shape = 'pie' | 'band'
const COLORS = ['#FF9EC4', '#C9A8E8', '#9EE6C4', '#FFD98A', '#A8C6FA']

export default function PieBandGraph({ segments, shape = 'pie' }) {
  if (shape === 'band') {
    let acc = 0
    return (
      <div className="flex flex-col items-center gap-2 w-full max-w-md">
        <div className="flex w-full h-12 rounded-lg overflow-hidden border-2 border-ink/20">
          {segments.map((s, i) => (
            <div key={i} className="grid place-items-center text-xs font-bold text-ink/80" style={{ width: `${s.pct}%`, background: COLORS[i % COLORS.length] }}>
              {s.pct >= 12 ? `${s.label}` : ''}
            </div>
          ))}
        </div>
        <div className="flex w-full justify-between text-[10px] text-ink/50">
          {[0, 25, 50, 75, 100].map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </div>
    )
  }
  // 円グラフ
  const cx = 90
  const cy = 90
  const r = 78
  let start = -90
  const arc = (pct) => {
    const end = start + (pct / 100) * 360
    const large = pct > 50 ? 1 : 0
    const x1 = cx + r * Math.cos((start * Math.PI) / 180)
    const y1 = cy + r * Math.sin((start * Math.PI) / 180)
    const x2 = cx + r * Math.cos((end * Math.PI) / 180)
    const y2 = cy + r * Math.sin((end * Math.PI) / 180)
    const mid = (start + end) / 2
    start = end
    return { d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`, mid }
  }
  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 180 180" width={180} height={180}>
        {segments.map((s, i) => {
          const { d, mid } = arc(s.pct)
          const lx = cx + r * 0.6 * Math.cos((mid * Math.PI) / 180)
          const ly = cy + r * 0.6 * Math.sin((mid * Math.PI) / 180)
          return (
            <g key={i}>
              <path d={d} fill={COLORS[i % COLORS.length]} stroke="#fff" strokeWidth="1.5" />
              {s.pct >= 10 && (
                <text x={lx} y={ly + 3} textAnchor="middle" fontSize="10" fontWeight="700" fill="#5D4A55">
                  {s.pct}%
                </text>
              )}
            </g>
          )
        })}
      </svg>
      <div className="flex flex-col gap-1">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-1 text-xs font-bold text-ink/70">
            <span className="w-3 h-3 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
            {s.label}
          </div>
        ))}
      </div>
    </div>
  )
}
