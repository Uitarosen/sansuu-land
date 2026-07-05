import { motion } from 'framer-motion'
import { useStore } from '../../store/useStore.js'
import { itemById } from '../../data/items.js'

// ガイドキャラ「みみちゃん」(うさぎ)+ 小2の相棒「ショコラ」(ねこ)。§3.2 / §4.1
const moods = {
  idle: { rotate: [-2, 2, -2], y: [0, -6, 0] },
  happy: { rotate: [0, -12, 12, 0], scale: [1, 1.15, 1] },
  think: { rotate: [0, 3, 0], y: [0, -3, 0] },
  sad: { rotate: [0, -4, 4, 0], y: [0, 2, 0] },
}

export default function Character({ mood = 'idle', size = 'text-7xl', companion = false }) {
  const equipped = useStore((s) => s.equippedItems)
  const hat = equipped.hat ? itemById[equipped.hat] : null
  const acc = equipped.accessory ? itemById[equipped.accessory] : null

  return (
    <div className="relative inline-grid place-items-center">
      {hat && (
        <span className="absolute -top-3 text-3xl z-10" style={{ transform: 'translateY(-40%)' }}>
          {hat.emoji}
        </span>
      )}
      <motion.div
        className={size}
        animate={moods[mood]}
        transition={{ duration: mood === 'happy' ? 0.6 : 2.4, repeat: Infinity, repeatType: 'loop' }}
      >
        🐰
      </motion.div>
      {acc && <span className="absolute -bottom-1 -right-2 text-2xl">{acc.emoji}</span>}
      {companion && (
        <motion.div
          className="absolute -right-10 bottom-0 text-4xl"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🐱
        </motion.div>
      )}
    </div>
  )
}
