// はかり(3年 重さ)。針が指す目盛りを読む。value g を max g まで一周する
// アナログばかりで表示する(1kg = 1000g を1周とする既定)。
export default function ScaleFigure({ value = 0, max = 1000, unit = 'g' }) {
  const cx = 100
  const cy = 100
  // -90°(上)から 時計回りに一周ぶん手前(270°)まで使う
  const startDeg = -120
  const sweep = 240
  const angle = startDeg + (value / max) * sweep
  const rad = (angle * Math.PI) / 180
  const nx = cx + 62 * Math.cos(rad)
  const ny = cy + 62 * Math.sin(rad)
  const majors = 10 // 目盛りの大区切り数

  return (
    <svg viewBox="0 0 200 180" width={230} height={205}>
      <circle cx={cx} cy={cy} r="82" fill="#fff" stroke="#FFB7D5" strokeWidth="7" />
      {Array.from({ length: majors + 1 }).map((_, i) => {
        const a = startDeg + (i / majors) * sweep
        const r = (a * Math.PI) / 180
        const x1 = cx + 66 * Math.cos(r)
        const y1 = cy + 66 * Math.sin(r)
        const x2 = cx + 78 * Math.cos(r)
        const y2 = cy + 78 * Math.sin(r)
        // ラベルは1つおき(0,2,4…)だけ表示して重なりを防ぐ
        const showLabel = i % 2 === 0
        const lx = cx + 50 * Math.cos(r)
        const ly = cy + 50 * Math.sin(r)
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#5D4A55" strokeWidth={showLabel ? 2.5 : 1.3} />
            {showLabel && (
              <text x={lx} y={ly + 3.5} textAnchor="middle" fontSize="10" fontWeight="700" fill="#5D4A55">
                {Math.round((i / majors) * max)}
              </text>
            )}
          </g>
        )
      })}
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#E24A7A" strokeWidth="4" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="6" fill="#5D4A55" />
      <text x={cx} y={168} textAnchor="middle" fontSize="12" fontWeight="700" fill="#B08AA8">
        ぜんぶで {max}{unit}まで
      </text>
    </svg>
  )
}
