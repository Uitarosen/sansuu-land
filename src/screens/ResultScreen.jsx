import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore.js'
import { sfx } from '../lib/sound.js'
import Character from '../components/common/Character.jsx'
import Confetti from '../components/common/Confetti.jsx'
import Button from '../components/common/Button.jsx'

// リザルト画面(§5 画面8)
export default function ResultScreen({ nav, route }) {
  const { gradeId, unitId, unitTitle, correctTotal, total, starsEarned, reviewUnit, companion, graduation } = route
  const mastered = useStore((s) => s.unitProgress[unitId]?.mastered)
  const score = useStore((s) => s.unitProgress[unitId]?.masteryScore ?? 0)
  const stars = useStore((s) => s.stars)
  const good = correctTotal >= total * 0.7

  useEffect(() => {
    sfx.fanfare()
  }, [])

  // 卒業エンディング(6-13 を 好成績で クリア)
  if (graduation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 p-6 text-center">
        <Confetti count={60} />
        <div className="text-6xl">🌏🚀✨</div>
        <div className="text-5xl">🐰🎀 🐱 🤖 🐧 🦉 🐱‍🚀</div>
        <h2 className="text-4xl font-extrabold text-pink">そつぎょう おめでとう!</h2>
        <p className="text-lg font-bold text-ink/70 max-w-sm leading-relaxed">
          6年間の さんすうを ぜんぶ やりとげて、ぶじ 地球に 帰りついたよ。<br />
          きみは もう さんすうマスターだ! ✨
        </p>
        <div className="bg-white/85 rounded-pop shadow-soft p-6 w-full max-w-sm grid gap-3">
          <Row label="さいごの せいかい" value={`${correctTotal} / ${total} もん`} />
          <Row label="ためた スター" value={`⭐ ${stars}`} />
          <Row label="そつぎょう証書" value="🎓 じゅよ!" />
        </div>
        <div className="flex gap-3 mt-2">
          <Button variant="ghost" onClick={() => nav.home()}>
            ホーム
          </Button>
          <Button onClick={() => nav.replace('practice', { gradeId, unitId })}>
            もういちど ▶
          </Button>
        </div>
      </div>
    )
  }

  const message = mastered
    ? 'たんげん マスター! かんぺき!'
    : good
      ? 'よく がんばったね!'
      : 'つぎは もっと できるよ!'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 p-6 text-center">
      {(good || mastered) && <Confetti count={mastered ? 40 : 24} />}

      <motion.div initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
        <Character size="text-8xl" mood="happy" companion={companion} />
      </motion.div>

      {mastered && <div className="text-6xl animate-wiggle">👑</div>}

      <h2 className="text-3xl font-extrabold text-pink">{message}</h2>
      <p className="text-lg font-bold text-ink/60">{unitTitle}</p>

      <div className="bg-white/85 rounded-pop shadow-soft p-6 w-full max-w-sm grid gap-3">
        <Row label="せいかい" value={`${correctTotal} / ${total} もん`} />
        <Row label="ゲットした スター" value={`⭐ ${starsEarned}`} />
        <div>
          <div className="flex justify-between text-lg font-bold text-ink mb-1">
            <span>りかいど</span>
            <span>{score} / 100</span>
          </div>
          <div className="h-4 rounded-full bg-pink/20 overflow-hidden">
            <motion.div
              className="h-full bg-pink"
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>
      </div>

      {/* つまずき検知の復習導線(§3.4) */}
      {reviewUnit && (
        <button
          onClick={() => nav.replace('mode', { gradeId: reviewUnit.gradeId, unitId: reviewUnit.unitId })}
          className="punipuni bg-lavender/60 rounded-pop px-6 py-3 shadow-soft text-lg font-bold text-ink"
        >
          🌈 まえの島「{reviewUnit.title}」で パワーアップしてこよう!
        </button>
      )}

      <div className="flex gap-3 mt-2">
        <Button variant="ghost" onClick={() => nav.home()}>
          ホーム
        </Button>
        <Button onClick={() => nav.replace('practice', { gradeId, unitId })}>
          もういちど ▶
        </Button>
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center text-xl font-bold text-ink">
      <span className="text-ink/60">{label}</span>
      <span className="text-2xl">{value}</span>
    </div>
  )
}
