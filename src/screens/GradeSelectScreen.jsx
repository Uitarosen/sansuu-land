import { motion } from 'framer-motion'
import { gradeList } from '../data/index.js'
import { useStore } from '../store/useStore.js'
import TopBar from '../components/common/TopBar.jsx'

// 学年えらび(§5 画面2)
export default function GradeSelectScreen({ nav }) {
  const setGrade = useStore((s) => s.setGrade)

  const choose = (id) => {
    setGrade(id)
    nav.replace('home')
  }

  return (
    <div className="min-h-screen">
      <TopBar onBack={nav.canBack ? nav.back : null} title="がくねんを えらんでね" />
      <div className="grid gap-6 p-6 mt-6">
        {gradeList.map((g, i) => (
          <motion.button
            key={g.id}
            initial={{ x: i % 2 ? 60 : -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => choose(g.id)}
            className={`punipuni rounded-pop shadow-soft p-8 flex items-center gap-6 ${
              g.id === 'grade1' ? 'bg-pink/40' : 'bg-lilac/40'
            }`}
          >
            <span className="text-7xl">{g.worldEmoji}</span>
            <div className="text-left">
              <div className="text-4xl font-extrabold text-ink">{g.title}</div>
              <div className="text-xl font-bold text-ink/60">{g.world}</div>
            </div>
          </motion.button>
        ))}
      </div>
      <p className="text-center text-ink/50 mt-4 px-6">
        あとで「おうちのかた」からも かえられるよ
      </p>
    </div>
  )
}
