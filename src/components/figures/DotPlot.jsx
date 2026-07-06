// ドットプロット(6年 データの調べ方)。数直線の 上に データを ●で つみあげ、
// ちらばりや 代表値(平均・中央値・最頻値)を 見る。
// props: values = [数の配列], min, max
export default function DotPlot({ values, min, max }) {
  const w = 300
  const pad = 24
  const range = max - min
  const x = (v) => pad + ((v - min) / range) * (w - pad * 2)
  // 各値の 出現数を 数えて つみあげ高さを 決める
  const counts = {}
  const stacked = values.map((v) => {
    counts[v] = (counts[v] || 0) + 1
    return { v, level: counts[v] }
  })
  const maxLevel = Math.max(...Object.values(counts))
  const H = maxLevel * 16 + 40

  return (
    <svg viewBox={`0 0 ${w} ${H}`} width={w} height={H} className="max-w-full">
      <line x1={pad} y1={H - 24} x2={w - pad} y2={H - 24} stroke="#5D4A55" strokeWidth="2" />
      {Array.from({ length: range + 1 }).map((_, i) => {
        const v = min + i
        return (
          <g key={i}>
            <line x1={x(v)} y1={H - 28} x2={x(v)} y2={H - 20} stroke="#5D4A55" strokeWidth="1.5" />
            <text x={x(v)} y={H - 8} textAnchor="middle" fontSize="10" fontWeight="700" fill="#5D4A55">{v}</text>
          </g>
        )
      })}
      {stacked.map((d, i) => (
        <circle key={i} cx={x(d.v)} cy={H - 28 - (d.level - 1) * 16 - 8} r="6" fill="#FF6FA5" stroke="#fff" strokeWidth="1" />
      ))}
    </svg>
  )
}
