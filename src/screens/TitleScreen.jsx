import { motion } from 'framer-motion'
import Character from '../components/common/Character.jsx'
import Button from '../components/common/Button.jsx'
import { useStore } from '../store/useStore.js'

export default function TitleScreen({ nav }) {
  const grade = useStore((s) => s.selectedGrade)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-6 text-center">
      <motion.h1
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className="text-6xl font-extrabold text-pink drop-shadow-sm"
      >
        さんすう
        <br />
        ランド <span className="text-lilac">✿</span>
      </motion.h1>
      <p className="text-xl font-bold text-ink/70">たのしく さんすう おけいこ</p>
      <div className="animate-floaty">
        <Character size="text-8xl" mood="idle" />
      </div>
      <Button
        onClick={() => nav.go(grade ? 'home' : 'grade')}
        className="text-3xl px-14 py-4 animate-pop"
      >
        はじめる ▶
      </Button>
    </div>
  )
}
