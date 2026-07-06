// 数直線(3年 小数 / 4年 がい数 など)。読み取り専用の表示。
// min〜max を step 刻みで描き、mark の位置に▼を立てる。
export default function NumberLineFigure({ min = 0, max = 1, step = 0.1, mark = null, labelEvery = 1 }) {
  const n = Math.round((max - min) / step)
  const width = 320
  const pad = 16
  const x = (val) => pad + ((val - min) / (max - min)) * (width - pad * 2)
  const ticks = Array.from({ length: n + 1 }, (_, i) => +(min + i * step).toFixed(6))

  return (
    <svg viewBox={`0 0 ${width} 70`} width={width} height={70} className="max-w-full">
      <line x1={pad} y1={40} x2={width - pad} y2={40} stroke="#5D4A55" strokeWidth="3" />
      {ticks.map((t, i) => {
        const big = i % labelEvery === 0
        return (
          <g key={i}>
            <line x1={x(t)} y1={big ? 30 : 35} x2={x(t)} y2={big ? 50 : 45} stroke="#5D4A55" strokeWidth={big ? 2.5 : 1.5} />
            {big && (
              <text x={x(t)} y={64} textAnchor="middle" fontSize="12" fontWeight="700" fill="#5D4A55">
                {Number.isInteger(t) ? t : t.toFixed(String(step).split('.')[1]?.length || 1)}
              </text>
            )}
          </g>
        )
      })}
      {mark != null && (
        <g>
          <polygon points={`${x(mark)},22 ${x(mark) - 7},8 ${x(mark) + 7},8`} fill="#FF6FA5" />
        </g>
      )}
    </svg>
  )
}
