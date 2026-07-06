// 体積(5年)。1cm³の 立方体を つみあげた 直方体を アイソメトリックで えがく。
// w(よこ)× d(おくゆき)× h(たかさ)の 立体。「1だんに w×d こ、それが h だん」を 見せる。
export default function VolumeTank({ w = 3, d = 2, h = 2, cell = 22 }) {
  const dx = cell * 0.5
  const dy = cell * 0.28
  const originX = 30 + d * dx
  const originY = 30 + h * cell
  // 3D → 2D 投影
  const P = (x, y, z) => [originX + x * cell - z * dx, originY - y * cell + z * dy]
  const face = (pts, fill) => (
    <polygon points={pts.map((p) => p.join(',')).join(' ')} fill={fill} stroke="#5D4A55" strokeWidth="1" strokeLinejoin="round" />
  )
  const lines = []
  // 上面のグリッド
  for (let i = 0; i <= w; i++) lines.push([P(i, h, 0), P(i, h, d)])
  for (let k = 0; k <= d; k++) lines.push([P(0, h, k), P(w, h, k)])
  // 正面のグリッド
  for (let i = 0; i <= w; i++) lines.push([P(i, 0, 0), P(i, h, 0)])
  for (let j = 0; j <= h; j++) lines.push([P(0, j, 0), P(w, j, 0)])
  // 右面のグリッド
  for (let k = 0; k <= d; k++) lines.push([P(w, 0, k), P(w, h, k)])
  for (let j = 0; j <= h; j++) lines.push([P(w, j, 0), P(w, j, d)])

  const W = originX + w * cell + 20
  const H = originY + 24

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={Math.min(W, 300)} height={Math.min(H, 240)} className="max-w-full">
      {face([P(0, h, 0), P(w, h, 0), P(w, h, d), P(0, h, d)], '#FFE6F0')}
      {face([P(w, 0, 0), P(w, h, 0), P(w, h, d), P(w, 0, d)], '#F3E3FA')}
      {face([P(0, 0, 0), P(w, 0, 0), P(w, h, 0), P(0, h, 0)], '#FFF4FA')}
      {lines.map(([a, b], i) => (
        <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#C9A8E8" strokeWidth="0.8" />
      ))}
      <text x={W / 2} y={H - 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#5D4A55">
        よこ{w} × おくゆき{d} × たかさ{h}
      </text>
    </svg>
  )
}
