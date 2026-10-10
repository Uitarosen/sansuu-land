import { motion } from 'framer-motion'
import { useStore } from '../../store/useStore.js'
import { itemById, DEFAULT_EQUIPPED } from '../../data/items.js'

// ガイドキャラ(初期は「みみちゃん」🐰)+ 小2の相棒「ショコラ」(ねこ)。§3.2 / §4.1
// きせかえ: きゃら(avatar)を かえて、ぼうし・めがね・かざり・おともだち・はいけいを つけられる。
// 重ね着の大きさは きゃらの文字サイズ(size)に合わせた em 指定なので、どの大きさでも くずれない。
const moods = {
  idle: { rotate: [-2, 2, -2], y: [0, -6, 0] },
  happy: { rotate: [0, -12, 12, 0], scale: [1, 1.15, 1] },
  think: { rotate: [0, 3, 0], y: [0, -3, 0] },
  sad: { rotate: [0, -4, 4, 0], y: [0, 2, 0] },
}

// はいけいステージの かざり絵文字の位置(四すみ+上下)
const DECO_POS = [
  { left: '7%', top: '9%' },
  { right: '8%', top: '15%' },
  { left: '11%', bottom: '12%' },
  { right: '9%', bottom: '9%' },
  { left: '44%', top: '3%' },
  { right: '40%', bottom: '3%' },
]

function Stage({ background, children }) {
  return (
    <div
      className="relative inline-block rounded-[2rem] overflow-hidden shadow-soft px-12 pt-12 pb-8"
      style={{ background: background.bg }}
    >
      {Array.from({ length: DECO_POS.length }).map((_, i) => (
        <span
          key={i}
          aria-hidden
          className={`absolute select-none opacity-80 ${i % 2 === 0 ? 'animate-floaty' : ''}`}
          style={{ ...DECO_POS[i], fontSize: '1.5rem', animationDelay: `${i * 0.4}s` }}
        >
          {background.deco[i % background.deco.length]}
        </span>
      ))}
      <div className="relative">{children}</div>
    </div>
  )
}

export default function Character({ mood = 'idle', size = 'text-7xl', companion = false, stage = false }) {
  const equipped = useStore((s) => s.equippedItems)
  const slotItem = (slot) => (equipped[slot] ? (itemById[equipped[slot]] ?? null) : null)
  const avatar = slotItem('avatar') ?? itemById[DEFAULT_EQUIPPED.avatar]
  const hat = slotItem('hat')
  const face = slotItem('face')
  const acc = slotItem('accessory')
  const pet = slotItem('pet')
  const background = slotItem('background')
  // 相棒がねこで、きゃらも ねこだと 同じ見た目が ならぶので、きゃらが ねこの ときは いぬにする
  const companionEmoji = avatar.emoji === '🐱' ? '🐶' : '🐱'

  const body = (
    <div className={`relative inline-grid place-items-center leading-none ${size}`}>
      <motion.div
        className="relative"
        animate={moods[mood]}
        transition={{ duration: mood === 'happy' ? 0.6 : 2.4, repeat: Infinity, repeatType: 'loop' }}
      >
        {avatar.emoji}
        {face && (
          <span
            aria-hidden
            className="absolute left-1/2 pointer-events-none"
            style={{ top: '54%', transform: 'translate(-50%, -50%)', fontSize: '0.62em', lineHeight: 1 }}
          >
            {face.emoji}
          </span>
        )}
      </motion.div>
      {hat && (
        <span
          aria-hidden
          className="absolute left-1/2 z-10 pointer-events-none"
          style={{ top: '6%', transform: 'translate(-50%, -78%)', fontSize: '0.44em', lineHeight: 1 }}
        >
          {hat.emoji}
        </span>
      )}
      {acc && (
        <span
          aria-hidden
          className="absolute pointer-events-none"
          style={{ right: '-0.1em', bottom: '-0.02em', fontSize: '0.34em', lineHeight: 1 }}
        >
          {acc.emoji}
        </span>
      )}
      {pet && (
        <motion.span
          aria-hidden
          className="absolute pointer-events-none"
          style={{ left: '-0.2em', bottom: '-0.04em', fontSize: '0.36em', lineHeight: 1 }}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2.2, repeat: Infinity }}
        >
          {pet.emoji}
        </motion.span>
      )}
      {companion && (
        <motion.div
          className="absolute -right-10 bottom-0 text-4xl"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {companionEmoji}
        </motion.div>
      )}
    </div>
  )

  return stage && background ? <Stage background={background}>{body}</Stage> : body
}
