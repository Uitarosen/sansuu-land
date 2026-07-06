import { useState, useEffect } from 'react'
import { sfx } from '../../lib/sound.js'

// 等積変形(5年 面積)。平行四辺形の はしを 切って 反対がわへ 動かすと
// 長方形に なる ことを ボタンで 見せ、「面積=底辺×高さ」を 発見させる。
// props: base, height, slant(かたむき), shape='parallelogram'|'triangle'
export default function AreaTransform({ base = 5, height = 3, slant = 1.5, shape = 'parallelogram', cell = 26 }) {
  const [transformed, setTransformed] = useState(false)
  useEffect(() => setTransformed(false), [base, height, slant, shape])
  const pad = 14
  const H = height * cell
  const W = (base + slant) * cell
  const topY = pad
  const botY = pad + H

  // 平行四辺形の頂点(変形前) / 長方形(変形後)
  const para = transformed
    ? [
        [pad + slant * cell, topY],
        [pad + slant * cell + base * cell, topY],
        [pad + slant * cell + base * cell, botY],
        [pad + slant * cell, botY],
      ]
    : [
        [pad + slant * cell, topY],
        [pad + slant * cell + base * cell, topY],
        [pad + base * cell, botY],
        [pad, botY],
      ]

  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox={`0 0 ${W + pad * 2} ${H + pad * 2}`} width={Math.min(W + pad * 2, 300)} height={H + pad * 2}>
        {/* 高さの点線 */}
        <line x1={pad + slant * cell} y1={topY} x2={pad + slant * cell} y2={botY} stroke="#9EE6C4" strokeWidth="1.5" strokeDasharray="4 3" />
        <polygon
          points={para.map((p) => p.join(',')).join(' ')}
          fill="#FFD98A"
          fillOpacity="0.6"
          stroke="#5D4A55"
          strokeWidth="2"
          strokeLinejoin="round"
          style={{ transition: 'all 0.4s' }}
        />
        <text x={(W + pad * 2) / 2} y={botY + 12} textAnchor="middle" fontSize="10" fill="#5D4A55">
          底辺 {base}
        </text>
      </svg>
      <button
        onClick={() => {
          sfx.tap()
          setTransformed((t) => !t)
        }}
        className="punipuni px-6 py-2 rounded-full bg-mint/80 font-extrabold text-ink shadow-pop"
      >
        {transformed ? '↩ もどす' : '✂️ 長方形に へんけい'}
      </button>
      {transformed && <div className="text-sm font-bold text-mint">長方形に なった! 面積 = 底辺 × 高さ</div>}
    </div>
  )
}
