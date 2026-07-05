import { motion } from 'framer-motion'
import { sfx } from '../../lib/sound.js'
import ShapeSVG from '../figures/ShapeSVG.jsx'

// 選択式(§3.3)。3〜4択の大きなボタン。数字・絵文字・かたち・単位に対応。
const shapeKinds = ['circle', 'triangle', 'square', 'rectangle', 'righttriangle']

export default function ChoiceGrid({ choices, onPick, disabled, picked, correct, kind = 'text' }) {
  return (
    <div className={`grid gap-3 w-full max-w-lg mx-auto ${choices.length > 3 ? 'grid-cols-2' : 'grid-cols-3'}`}>
      {choices.map((c, i) => {
        const isShape = kind === 'shape' || shapeKinds.includes(c)
        const state =
          picked != null && (c === picked || c === correct)
            ? c === correct
              ? 'bg-mint text-ink ring-4 ring-mint'
              : 'bg-pink/40 text-ink'
            : 'bg-white/90 text-ink'
        return (
          <motion.button
            key={i}
            whileTap={{ scale: 0.92 }}
            disabled={disabled}
            onClick={() => {
              sfx.tap()
              onPick(c)
            }}
            className={`punipuni min-h-[88px] rounded-pop shadow-soft grid place-items-center font-extrabold ${state} ${
              kind === 'emoji' ? 'text-5xl' : 'text-4xl'
            }`}
          >
            {isShape ? <ShapeSVG kind={c} size={72} /> : c}
          </motion.button>
        )
      })}
    </div>
  )
}
