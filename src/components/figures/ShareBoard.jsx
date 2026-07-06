import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { sfx } from '../../lib/sound.js'

// わり算の操作(3年 わり算)。おかしを1個ずつ皿に配って(等分除)/束にして(包含除)
// わり算の意味を手で体験する。total ÷ divisor を、mode で意味を変える。
// mode 'equal'  : divisor 枚の皿に1個ずつ順に配る → 1皿ぶん(=商)を数える
// mode 'group'  : divisor 個ずつ束ねる → 束の数(=商)を数える
export default function ShareBoard({ total, divisor, mode = 'equal', emoji = '🍪' }) {
  const [placed, setPlaced] = useState(0)
  useEffect(() => setPlaced(0), [total, divisor, mode])
  const done = placed >= total

  const tap = () => {
    if (done) return
    sfx.tap()
    setPlaced((p) => p + 1)
  }

  // equal: 皿ごとに何個入ったか / group: 束ごとに何個
  const groups = mode === 'equal' ? divisor : Math.ceil(total / divisor)
  const cap = mode === 'equal' ? Math.ceil(total / divisor) : divisor
  const buckets = Array.from({ length: groups }, (_, gi) => {
    // equal: ラウンドロビンで配る / group: 前から順に詰める
    let count = 0
    for (let k = 0; k < placed; k++) {
      const target = mode === 'equal' ? k % divisor : Math.floor(k / divisor)
      if (target === gi) count++
    }
    return count
  })

  const label = mode === 'equal' ? `${divisor}まいの おさらに 1こずつ` : `${divisor}こずつ たばねる`

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-base font-bold text-ink/60">{done ? '✨ ぜんぶ わけられた!' : label}</div>
      <div className="flex flex-wrap justify-center gap-2 max-w-lg">
        {buckets.map((c, i) => (
          <div
            key={i}
            className="min-w-[64px] min-h-[64px] rounded-2xl bg-white/70 border-2 border-pink/30 p-1 grid grid-cols-3 gap-0.5 place-content-center"
          >
            {Array.from({ length: c }).map((_, j) => (
              <motion.span key={j} initial={{ scale: 0.3 }} animate={{ scale: 1 }} className="text-xl">
                {emoji}
              </motion.span>
            ))}
          </div>
        ))}
      </div>
      {/* のこりのおかし(タップで配る) */}
      <div className="flex flex-wrap justify-center gap-1 min-h-[40px] max-w-xs">
        {Array.from({ length: total - placed }).map((_, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.8 }}
            onClick={tap}
            aria-label="おかし"
            className="punipuni text-2xl"
          >
            {emoji}
          </motion.button>
        ))}
      </div>
      {done && (
        <div className="text-lg font-extrabold text-mint">
          {mode === 'equal' ? `1さらに ${cap}こずつ!` : `${groups}たば できた!`}
        </div>
      )}
    </div>
  )
}
