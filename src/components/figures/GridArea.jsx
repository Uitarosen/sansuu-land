import { useState, useEffect } from 'react'
import { sfx } from '../../lib/sound.js'

// 方眼で面積をかぞえる(4年 面積)。w×h の長方形の 1マス(1cm²)を
// タップして ぬり、いくつ分かを 手で かぞえる操作。
export default function GridArea({ w, h, cell = 26 }) {
  const [filled, setFilled] = useState(() => new Set())
  useEffect(() => setFilled(new Set()), [w, h])

  const toggle = (i) => {
    sfx.tap()
    setFilled((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-sm font-bold text-ink/60">
        1マス = 1cm² ・ ぬった数: {filled.size}
      </div>
      <div
        className="grid bg-white/70 rounded-xl p-1"
        style={{ gridTemplateColumns: `repeat(${w}, ${cell}px)` }}
      >
        {Array.from({ length: w * h }).map((_, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className={`border border-pink/30 ${filled.has(i) ? 'bg-pink/60' : 'bg-white'}`}
            style={{ width: cell, height: cell }}
            aria-label="マス"
          />
        ))}
      </div>
      <div className="text-xs text-ink/40">
        たて {h}cm × よこ {w}cm
      </div>
    </div>
  )
}
