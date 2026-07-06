// 比例(6年)。表の (x,y)を 座標に とり、点が 一直線に ならぶ ことを 見せる。
// props: points = [{x,y}], maxX, maxY, showLine
export default function PlotBoard({ points, maxX = 6, maxY = 12, showLine = true }) {
  const size = 200
  const pad = 28
  const px = (x) => pad + (x / maxX) * (size - pad - 8)
  const py = (y) => size - pad - (y / maxY) * (size - pad - 8)

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="bg-white/70 rounded-xl">
      {/* 目もり */}
      {Array.from({ length: maxX + 1 }).map((_, i) => (
        <line key={`vx${i}`} x1={px(i)} y1={pad - 4} x2={px(i)} y2={size - pad} stroke="#EEE2EC" strokeWidth="1" />
      ))}
      {Array.from({ length: Math.floor(maxY / 2) + 1 }).map((_, i) => (
        <line key={`hy${i}`} x1={pad} y1={py(i * 2)} x2={size - 8} y2={py(i * 2)} stroke="#EEE2EC" strokeWidth="1" />
      ))}
      {/* 軸 */}
      <line x1={pad} y1={size - pad} x2={size - 8} y2={size - pad} stroke="#5D4A55" strokeWidth="2" />
      <line x1={pad} y1={pad - 4} x2={pad} y2={size - pad} stroke="#5D4A55" strokeWidth="2" />
      <text x={size - 12} y={size - pad + 14} fontSize="9" fill="#8A7580">x</text>
      <text x={pad - 16} y={pad + 2} fontSize="9" fill="#8A7580">y</text>
      {/* 比例の直線 */}
      {showLine && points.length >= 2 && (
        <line x1={px(0)} y1={py(0)} x2={px(points[points.length - 1].x)} y2={py(points[points.length - 1].y)} stroke="#C9A8E8" strokeWidth="2" strokeDasharray="4 3" />
      )}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={px(p.x)} cy={py(p.y)} r="4" fill="#FF6FA5" />
          <text x={px(p.x) + 6} y={py(p.y) - 4} fontSize="8" fill="#5D4A55">({p.x},{p.y})</text>
        </g>
      ))}
    </svg>
  )
}
