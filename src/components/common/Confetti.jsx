import { motion } from 'framer-motion'

// 正解・マスター時の紙吹雪(§3.3 / §4.1)
const colors = ['#FFB7D5', '#D5C6FF', '#B8F0DC', '#FFF3C4', '#C9A8E8', '#F5DFA8']

export default function Confetti({ count = 26 }) {
  const pieces = Array.from({ length: count })
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-40">
      {pieces.map((_, i) => {
        const left = (i * 37) % 100
        const delay = (i % 6) * 0.08
        const color = colors[i % colors.length]
        const rotate = (i % 2 ? 1 : -1) * (180 + (i % 5) * 60)
        return (
          <motion.div
            key={i}
            className="confetti-piece"
            style={{ left: `${left}%`, top: '-5%', background: color }}
            initial={{ y: -40, opacity: 1, rotate: 0 }}
            animate={{ y: '105vh', opacity: [1, 1, 0], rotate }}
            transition={{ duration: 1.8 + (i % 4) * 0.3, delay, ease: 'easeIn' }}
          />
        )
      })}
    </div>
  )
}
