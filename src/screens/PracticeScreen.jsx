import { useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getUnit, findUnitAnywhere } from '../data/index.js'
import { useStore } from '../store/useStore.js'
import { buildSession, checkAnswer } from '../engine/session.js'
import { speak } from '../lib/speech.js'
import { sfx } from '../lib/sound.js'
import TopBar from '../components/common/TopBar.jsx'
import ProblemView from '../components/answer/ProblemView.jsx'
import Character from '../components/common/Character.jsx'

const praises = ['すごい!', 'てんさい!', 'やったね!', 'ばっちり!', 'かんぺき!', 'いいね!']

export default function PracticeScreen({ nav, route }) {
  const { gradeId, unitId } = route
  const unit = route.unit || getUnit(gradeId, unitId)

  const store = useStore
  const settings = useStore((s) => s.settings)
  const recordAnswer = useStore((s) => s.recordAnswer)
  const addStars = useStore((s) => s.addStars)
  const markStudied = useStore((s) => s.markStudiedToday)

  // セッションは1回だけ生成
  const session = useMemo(() => {
    markStudied()
    const s = store.getState()
    const ctx = {
      level: s.unitProgress[unit.id]?.level ?? 1,
      wrongHistory: s.wrongHistory,
      subSkillProgress: s.subSkillProgress,
    }
    return buildSession(unit, ctx, 10)
  }, []) // eslint-disable-line

  const [index, setIndex] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [combo, setCombo] = useState(0)
  const [correctTotal, setCorrectTotal] = useState(0)
  const [starsEarned, setStarsEarned] = useState(0)
  const [feedback, setFeedback] = useState(null) // {picked, showCorrect}
  const [banner, setBanner] = useState(null) // {kind, text}
  const [locked, setLocked] = useState(false)
  const timer = useRef(null)
  // 集計はrefでも保持する(finishがsetTimeout経由で呼ばれるため、
  // stateのクロージャだと最後の1問ぶんが反映されず1問少なく集計される)
  const correctRef = useRef(0)
  const starsRef = useRef(0)

  const problem = session[index]
  const TOTAL = session.length

  const advance = () => {
    setFeedback(null)
    setBanner(null)
    setAttempts(0)
    if (index < TOTAL - 1) {
      setIndex((i) => i + 1)
      setLocked(false)
    } else {
      finish()
    }
  }

  const finish = () => {
    const s = store.getState()
    const finalCorrect = correctRef.current
    const finalStars = starsRef.current
    // つまずき検知(§6.4 手順7):正解が少なく前提単元が弱いとき復習導線
    let reviewUnit = null
    if (!s.unitProgress[unit.id]?.mastered && finalCorrect < 6) {
      for (const pid of unit.prerequisiteUnitIds || []) {
        const pscore = s.unitProgress[pid]?.masteryScore ?? 0
        if (pscore < 70) {
          reviewUnit = findUnitAnywhere(pid)
          break
        }
      }
    }
    nav.replace('result', {
      gradeId,
      unitId: unit.id,
      unitTitle: unit.title,
      companion: gradeId === 'grade2',
      correctTotal: finalCorrect,
      total: TOTAL,
      starsEarned: finalStars,
      reviewUnit: reviewUnit ? { gradeId: reviewUnit.grade.id, unitId: reviewUnit.unit.id, title: reviewUnit.unit.title } : null,
    })
  }

  const commit = (value) => {
    if (locked) return
    const correct = checkAnswer(problem, value)
    if (correct) {
      setLocked(true)
      sfx.correct()
      const newCombo = combo + 1
      const gained = 1 + (newCombo >= 3 ? 1 : 0)
      setCombo(newCombo)
      correctRef.current += 1
      starsRef.current += gained
      setCorrectTotal(correctRef.current)
      setStarsEarned(starsRef.current)
      addStars(gained)
      recordAnswer({
        unitId: unit.id,
        templateId: problem.templateId,
        subSkill: problem.subSkill,
        correct: true,
        difficulty: problem.difficulty,
        combo: newCombo,
      })
      setFeedback({ picked: value, showCorrect: true })
      setBanner({ kind: 'good', text: `${praises[Math.floor(Math.random() * praises.length)]}${newCombo >= 3 ? ` ${newCombo}れんぞく🔥` : ''}` })
      timer.current = setTimeout(advance, 950)
    } else {
      const a = attempts + 1
      setAttempts(a)
      setCombo(0)
      sfx.wrong()
      if (a >= 3) {
        setLocked(true)
        recordAnswer({
          unitId: unit.id,
          templateId: problem.templateId,
          subSkill: problem.subSkill,
          correct: false,
          difficulty: problem.difficulty,
          combo: 0,
        })
        setFeedback({ picked: value, showCorrect: true })
        setBanner({ kind: 'explain', text: problem.explain })
        speak(problem.explain)
        timer.current = setTimeout(advance, 2000)
      } else {
        // 1回目の間違いからヒントを表示。2回目はより具体的なヒントへ(§3.3)
        const hint = problem.hints[a - 1] || problem.hints[0] || 'もんだいを ゆっくり よみなおしてみよう'
        setBanner({ kind: 'hint', text: `おしい! ヒント: ${hint}` })
        speak(`おしい。${hint}`)
        setFeedback(Array.isArray(problem.data?.choices) ? { picked: value } : null)
      }
    }
  }

  const bannerStyle = {
    good: 'bg-mint text-ink',
    oops: 'bg-cream text-ink',
    hint: 'bg-lavender/70 text-ink',
    explain: 'bg-pink/70 text-ink',
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar onBack={nav.back} title={unit.title} />

      {/* 進捗バー(10問中n問目) */}
      <div className="px-6">
        <div className="flex justify-between text-sm font-bold text-ink/60 mb-1">
          <span>{index + 1} / {TOTAL}もんめ</span>
          <span>⭐ {starsEarned}</span>
        </div>
        <div className="h-3 rounded-full bg-white/70 overflow-hidden">
          <div className="h-full bg-pink transition-all" style={{ width: `${((index) / TOTAL) * 100}%` }} />
        </div>
      </div>

      {/* バナー(ほめ・ヒント・かいせつ) */}
      <div className="h-16 grid place-items-center px-4">
        <AnimatePresence>
          {banner && (
            <motion.div
              key={banner.text}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`px-6 py-2 rounded-full font-extrabold text-xl shadow-soft ${bannerStyle[banner.kind]}`}
            >
              {banner.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 px-4 pb-6">
        <ProblemView
          problem={problem}
          onCommit={commit}
          feedback={feedback}
          locked={locked}
          furigana={settings.furigana}
          clearSignal={attempts}
        />
      </div>

      <div className="fixed bottom-3 right-3 pointer-events-none">
        <Character size="text-5xl" mood={banner?.kind === 'good' ? 'happy' : banner?.kind === 'oops' ? 'sad' : 'think'} />
      </div>
    </div>
  )
}
