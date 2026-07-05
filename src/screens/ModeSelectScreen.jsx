import { getUnit } from '../data/index.js'
import { useStore } from '../store/useStore.js'
import TopBar from '../components/common/TopBar.jsx'
import Button from '../components/common/Button.jsx'
import Character from '../components/common/Character.jsx'

const levelLabel = { 1: 'やさしい', 2: 'ふつう', 3: 'むずかしい' }

// モード選択(§5 画面4)
export default function ModeSelectScreen({ nav, route }) {
  const { gradeId, unitId } = route
  const unit = getUnit(gradeId, unitId)
  const progress = useStore((s) => s.unitProgress[unitId])
  const score = progress?.masteryScore ?? 0
  const level = progress?.level ?? 1

  if (!unit) return null

  return (
    <div className="min-h-screen">
      <TopBar onBack={nav.back} title={unit.title} />
      <div className="flex flex-col items-center gap-6 p-6">
        <div className="text-7xl">{unit.emoji}</div>
        <div className="text-center">
          <div className="text-xl font-bold text-ink/60">{unit.room}</div>
          {progress?.mastered && <div className="text-2xl mt-1">👑 マスター!</div>}
        </div>

        {/* 理解度 */}
        <div className="w-full max-w-md bg-white/80 rounded-pop p-4 shadow-soft">
          <div className="flex justify-between text-lg font-bold text-ink mb-1">
            <span>りかいど</span>
            <span>{score} / 100 ・ {levelLabel[level]}</span>
          </div>
          <div className="h-4 rounded-full bg-pink/20 overflow-hidden">
            <div className="h-full bg-pink transition-all" style={{ width: `${score}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-md mt-2">
          <button
            onClick={() => nav.go('lesson', { gradeId, unitId })}
            className="punipuni rounded-pop shadow-soft bg-lavender/50 p-6 flex flex-col items-center gap-2"
          >
            <span className="text-5xl">📖</span>
            <span className="text-2xl font-extrabold text-ink">まなぶ</span>
          </button>
          <button
            onClick={() => nav.go('practice', { gradeId, unitId })}
            className="punipuni rounded-pop shadow-soft bg-pink/50 p-6 flex flex-col items-center gap-2"
          >
            <span className="text-5xl">✏️</span>
            <span className="text-2xl font-extrabold text-ink">れんしゅう</span>
          </button>
        </div>

        <div className="mt-2">
          <Character size="text-6xl" companion={gradeId === 'grade2'} />
        </div>
      </div>
    </div>
  )
}
