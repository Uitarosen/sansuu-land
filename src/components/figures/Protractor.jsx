// 分度器(4年 角とその大きさ)。角の上に 分度器を かさねて 目もりを 読む。
// 内がわ・外がわの 目もり両方を えがき、「180−θ」の 読みまちがいを 実感させる。
export default function Protractor({ angle = 40 }) {
  const cx = 130
  const cy = 150
  const R = 110
  const rayLen = 128
  // 基準辺は右向き(0°)。もう1本の辺を angle 度うえに ひらく。
  const bx = cx + rayLen
  const by = cy
  const ax = cx + rayLen * Math.cos((-angle * Math.PI) / 180)
  const ay = cy + rayLen * Math.sin((-angle * Math.PI) / 180)

  // 分度器の弧(0〜180°)
  const arc = []
  for (let d = 0; d <= 180; d += 10) {
    const r = (-d * Math.PI) / 180
    arc.push({ d, x: cx + R * Math.cos(r), y: cy + R * Math.sin(r) })
  }

  return (
    <svg viewBox="0 0 260 175" width={280} height={188} className="max-w-full">
      {/* 分度器の半円 */}
      <path
        d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy} Z`}
        fill="#C9A8E8"
        fillOpacity="0.18"
        stroke="#C9A8E8"
        strokeWidth="2"
      />
      {/* 目もり(10°ごと、内・外の数字) */}
      {arc.map(({ d, x, y }) => {
        const r = (-d * Math.PI) / 180
        const x2 = cx + (R - (d % 30 === 0 ? 14 : 8)) * Math.cos(r)
        const y2 = cy + (R - (d % 30 === 0 ? 14 : 8)) * Math.sin(r)
        const lx = cx + (R - 26) * Math.cos(r)
        const ly = cy + (R - 26) * Math.sin(r)
        return (
          <g key={d}>
            <line x1={x} y1={y} x2={x2} y2={y2} stroke="#9A7FB8" strokeWidth={d % 30 === 0 ? 1.6 : 0.8} />
            {d % 30 === 0 && (
              <text x={lx} y={ly + 3} textAnchor="middle" fontSize="8" fill="#7A5FA0">
                {d}
              </text>
            )}
          </g>
        )
      })}
      {/* 角の2辺 */}
      <line x1={cx} y1={cy} x2={bx} y2={by} stroke="#5D4A55" strokeWidth="3" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={ax} y2={ay} stroke="#E24A7A" strokeWidth="3" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="4" fill="#5D4A55" />
    </svg>
  )
}
