// 樹形図(6年 場合の数)。items から 2つ えらんで 並べる 全パターンを 枝で ひろげる。
// 各 1本目の 枝からは「自分いがい」へ 枝が のびる(同じ人は えらべない)。
// props: items = ['A','B','C']
export default function TreeDiagram({ items }) {
  const branchesPer = items.length - 1
  const rowH = 26
  const total = items.length * branchesPer
  const H = total * rowH + 20
  const x0 = 16
  const x1 = 74
  const x2 = 140

  let leaf = 0
  return (
    <svg viewBox={`0 0 210 ${H}`} width={210} height={Math.min(H, 320)} className="max-w-full">
      <circle cx={x0} cy={H / 2} r="4" fill="#5D4A55" />
      {items.map((f, fi) => {
        const groupTop = fi * branchesPer * rowH
        const fy = groupTop + (branchesPer * rowH) / 2 + 10
        const seconds = items.filter((s) => s !== f)
        return (
          <g key={fi}>
            <line x1={x0} y1={H / 2} x2={x1} y2={fy} stroke="#C9A8E8" strokeWidth="1.5" />
            <text x={x1} y={fy + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="#E24A7A">{f}</text>
            {seconds.map((s, si) => {
              const ly = leaf * rowH + rowH / 2 + 10
              leaf++
              return (
                <g key={si}>
                  <line x1={x1 + 8} y1={fy} x2={x2} y2={ly} stroke="#9EE6C4" strokeWidth="1.5" />
                  <text x={x2 + 6} y={ly + 4} fontSize="11" fontWeight="700" fill="#5D4A55">{f}{s}</text>
                </g>
              )
            })}
          </g>
        )
      })}
    </svg>
  )
}
