import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore.js'
import { kuku } from '../engine/generators.js'
import { sfx } from '../lib/sound.js'
import TopBar from '../components/common/TopBar.jsx'
import Character from '../components/common/Character.jsx'

// 九九ひろば(§5 画面7 / §3.4 九九サブマスタリー)
const dans = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const MASTER = 90

function makeDanUnit(dan) {
  return {
    id: `kuku-${dan}`,
    title: `${dan}のだん`,
    prerequisiteUnitIds: [],
    templates: [
      kuku({ dan, difficulty: 1 }),
      kuku({ dan, difficulty: 2 }),
      kuku({ dan, difficulty: 3 }),
    ],
  }
}

function makeMixUnit() {
  return {
    id: 'kuku-mix',
    title: 'ばら九九',
    prerequisiteUnitIds: [],
    templates: [kuku({ difficulty: 2 }), kuku({ difficulty: 3 })],
  }
}

export default function KukuScreen({ nav }) {
  const sub = useStore((s) => s.subSkillProgress)
  const owned = useStore((s) => s.ownedItems)
  const setOwned = useStore((s) => s.buyItem)
  const equip = useStore((s) => s.equipItem)

  const scoreOf = (dan) => sub[`kuku-dan-${dan}`]?.masteryScore ?? 0
  const masteredCount = dans.filter((d) => scoreOf(d) >= MASTER).length
  const allMastered = masteredCount === 9

  // 全段マスターで「九九マスターかんむり」を進呈(§3.5)
  useEffect(() => {
    if (allMastered && !owned.includes('kuku-crown')) {
      sfx.fanfare()
      useStore.setState((s) => ({
        ownedItems: [...s.ownedItems, 'kuku-crown'],
        equippedItems: { ...s.equippedItems, hat: 'kuku-crown' },
      }))
    }
  }, [allMastered]) // eslint-disable-line

  const play = (unit) => {
    sfx.tap()
    nav.go('practice', { gradeId: 'grade2', unitId: unit.id, unit })
  }

  return (
    <div className="min-h-screen pb-10">
      <TopBar onBack={nav.back} title="九九ひろば ✖️" />

      <div className="text-center px-6">
        <div className="text-lg font-bold text-ink/70">
          👑 {masteredCount} / 9 だん マスター
        </div>
        <div className="mx-auto max-w-md h-3 rounded-full bg-white/70 overflow-hidden mt-1">
          <div className="h-full bg-gold" style={{ width: `${(masteredCount / 9) * 100}%` }} />
        </div>
        {allMastered && (
          <div className="mt-2 text-2xl font-extrabold text-lilac animate-wiggle">
            🎉 九九マスター たっせい!
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 p-4">
        {dans.map((d) => {
          const sc = scoreOf(d)
          const done = sc >= MASTER
          return (
            <motion.button
              key={d}
              whileTap={{ scale: 0.93 }}
              onClick={() => play(makeDanUnit(d))}
              className={`punipuni relative rounded-pop shadow-soft p-4 flex flex-col items-center gap-1 ${
                done ? 'bg-gold/60' : 'bg-white/85'
              }`}
            >
              {done && <span className="absolute -top-2 -right-1 text-2xl">👑</span>}
              <span className="text-3xl font-extrabold text-ink">{d}</span>
              <span className="text-sm font-bold text-ink/60">のだん</span>
              <div className="w-full h-2 rounded-full bg-pink/20 overflow-hidden">
                <div className="h-full bg-pink" style={{ width: `${sc}%` }} />
              </div>
            </motion.button>
          )
        })}
      </div>

      <div className="px-4">
        <button
          onClick={() => play(makeMixUnit())}
          className="punipuni w-full rounded-pop shadow-soft bg-lilac/50 p-5 text-2xl font-extrabold text-ink"
        >
          🎲 ばら九九に ちょうせん!
        </button>
      </div>

      <div className="flex justify-center mt-6">
        <Character size="text-6xl" companion />
      </div>
    </div>
  )
}
