import { useState } from 'react'
import { motion } from 'framer-motion'
import { sfx } from '../../lib/sound.js'

// 10のまとまりづくり(操作型)。a個入りの10フレームに、下のブロックを
// タップして移し、「10といくつ」を目で見て体験する(§3.3 くり上がり)。
export default function MakeTenFigure({ a, b }) {
  const need = 10 - a
  const [moved, setMoved] = useState(0)
  const done = moved >= need
  const loose = b - moved

  const tap = () => {
    if (done) return
    sfx.tap()
    setMoved((m) => m + 1)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* 10のわく */}
      <div className={`grid grid-cols-5 gap-1 p-2 rounded-2xl shadow-soft transition-colors ${done ? 'bg-mint/60' : 'bg-white/80'}`}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="w-11 h-11 rounded-lg border-2 border-pink/30 bg-white grid place-items-center">
            {i < a ? (
              <div className="w-8 h-8 rounded-full bg-pink" />
            ) : i < a + moved ? (
              <motion.div
                initial={{ scale: 0.3 }}
                animate={{ scale: 1 }}
                className="w-8 h-8 rounded-full bg-lavender"
              />
            ) : null}
          </div>
        ))}
      </div>

      <div className="text-lg font-extrabold text-ink/70 h-7">
        {done ? `10の まとまり! 10と ${loose}だね ✨` : 'したの ブロックを タップして わくを うめよう'}
      </div>

      {/* ばらのブロック */}
      <div className="flex gap-2 min-h-[44px]">
        {Array.from({ length: loose }).map((_, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.8 }}
            onClick={tap}
            aria-label="ブロック"
            className="punipuni w-10 h-10 rounded-full bg-lavender shadow-pop"
          />
        ))}
      </div>
    </div>
  )
}
