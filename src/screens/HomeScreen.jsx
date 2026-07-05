import { useState } from 'react'
import { motion } from 'framer-motion'
import { gradeList, getGrade } from '../data/index.js'
import { useStore, unitStatus } from '../store/useStore.js'
import { sfx } from '../lib/sound.js'

const colorBg = {
  pink: 'bg-pink/40',
  lavender: 'bg-lavender/40',
  mint: 'bg-mint/50',
  cream: 'bg-cream/70',
  lilac: 'bg-lilac/40',
  gold: 'bg-gold/50',
}

function StatusBadge({ status }) {
  if (status === 'mastered')
    return <span className="absolute -top-2 -right-2 text-3xl animate-wiggle">👑</span>
  if (status === 'learning')
    return <span className="absolute -top-2 -right-2 text-xl">🌱</span>
  return null
}

export default function HomeScreen({ nav }) {
  const selectedGrade = useStore((s) => s.selectedGrade) || 'grade1'
  const [tab, setTab] = useState(selectedGrade)
  const unitProgress = useStore((s) => s.unitProgress)
  const stars = useStore((s) => s.stars)
  const grade = getGrade(tab)

  return (
    <div className="min-h-screen pb-28">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="text-2xl font-extrabold text-ink">
          {grade.worldEmoji} {grade.world}
        </div>
        <div className="flex items-center gap-1 bg-white/90 rounded-full px-4 h-12 shadow-soft text-xl font-bold">
          <span className="text-2xl">⭐</span>
          {stars}
        </div>
      </div>

      {/* ワールド切替タブ */}
      <div className="flex gap-2 px-4 mb-3">
        {gradeList.map((g) => (
          <button
            key={g.id}
            onClick={() => {
              sfx.tap()
              setTab(g.id)
            }}
            className={`punipuni flex-1 h-12 rounded-full font-bold text-lg shadow-soft ${
              tab === g.id ? 'bg-pink text-white' : 'bg-white/80 text-ink/70'
            }`}
          >
            {g.title}
          </button>
        ))}
      </div>

      {/* 単元マップ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 px-4">
        {grade.units.map((u, i) => {
          const status = unitStatus(unitProgress[u.id])
          const score = unitProgress[u.id]?.masteryScore ?? 0
          return (
            <motion.button
              key={u.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: Math.min(i * 0.03, 0.4) }}
              whileTap={{ scale: 0.93 }}
              onClick={() => {
                sfx.tap()
                nav.go('mode', { unitId: u.id, gradeId: tab })
              }}
              className={`punipuni relative rounded-pop shadow-soft p-3 flex flex-col items-center gap-1 ${colorBg[u.color]}`}
            >
              <StatusBadge status={status} />
              <span className="text-4xl">{u.emoji}</span>
              <span className="text-base font-extrabold text-ink leading-tight text-center">
                {u.title}
              </span>
              <span className="text-xs text-ink/50">{u.room}</span>
              <div className="w-full h-2 rounded-full bg-white/70 overflow-hidden mt-1">
                <div className="h-full bg-pink" style={{ width: `${score}%` }} />
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* 下部ナビ */}
      <div className="fixed bottom-0 inset-x-0 max-w-3xl mx-auto bg-white/85 backdrop-blur border-t-2 border-pink/20 flex justify-around py-2">
        {[
          { label: 'きせかえ', emoji: '👗', screen: 'kisekae' },
          { label: 'カレンダー', emoji: '🌸', screen: 'calendar' },
          { label: '九九ひろば', emoji: '✖️', screen: 'kuku' },
          { label: 'おうちのかた', emoji: '👨‍👩‍👧', screen: 'parent' },
        ].map((b) => (
          <button
            key={b.screen}
            onClick={() => {
              sfx.tap()
              nav.go(b.screen)
            }}
            className="punipuni flex flex-col items-center gap-0.5 px-2"
          >
            <span className="text-3xl">{b.emoji}</span>
            <span className="text-xs font-bold text-ink/70">{b.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
