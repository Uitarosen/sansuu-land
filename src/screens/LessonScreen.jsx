import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getUnit } from '../data/index.js'
import { useStore } from '../store/useStore.js'
import { speak } from '../lib/speech.js'
import { sfx } from '../lib/sound.js'
import TopBar from '../components/common/TopBar.jsx'
import Button from '../components/common/Button.jsx'
import Character from '../components/common/Character.jsx'
import SpeakerButton from '../components/common/SpeakerButton.jsx'
import ChoiceGrid from '../components/answer/ChoiceGrid.jsx'
import Confetti from '../components/common/Confetti.jsx'

// まなぶモード:紙芝居レッスン(§3.2)
export default function LessonScreen({ nav, route }) {
  const { gradeId, unitId } = route
  const unit = getUnit(gradeId, unitId)
  const [page, setPage] = useState(0)
  const [done, setDone] = useState(false)
  const [quizDone, setQuizDone] = useState(false)
  const addStars = useStore((s) => s.addStars)
  const markStudied = useStore((s) => s.markStudiedToday)

  const pages = unit?.lessons ?? []
  const p = pages[page]

  useEffect(() => {
    setQuizDone(false)
    if (p && !p.quiz) speak(`${p.title}。${p.text}`)
  }, [page]) // eslint-disable-line

  if (!unit) return null

  const finish = () => {
    sfx.fanfare()
    markStudied()
    addStars(2)
    setDone(true)
  }

  const next = () => {
    if (page < pages.length - 1) {
      sfx.tap()
      setPage(page + 1)
    } else {
      finish()
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 text-center">
        <Confetti />
        <Character size="text-8xl" mood="happy" companion={gradeId === 'grade2'} />
        <h2 className="text-4xl font-extrabold text-pink">レッスン クリア!</h2>
        <p className="text-xl font-bold text-ink/70">スタンプ ⭐×2 ゲット!</p>
        <div className="flex gap-3 mt-2">
          <Button variant="ghost" onClick={() => nav.back()}>
            もどる
          </Button>
          <Button onClick={() => nav.replace('practice', { gradeId, unitId })}>
            れんしゅうする ▶
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar onBack={nav.back} title={unit.title} />
      {/* 進捗ドット */}
      <div className="flex justify-center gap-2 mb-2">
        {pages.map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${i === page ? 'bg-pink' : i < page ? 'bg-pink/40' : 'bg-white/70'}`}
          />
        ))}
      </div>

      <motion.div
        key={page}
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="flex-1 flex flex-col items-center justify-center gap-6 p-6 text-center"
      >
          {p.quiz ? (
            <QuizPage quiz={p.quiz} onDone={() => setQuizDone(true)} />
          ) : (
            <>
              <div className="text-7xl whitespace-pre-line leading-tight bg-white/70 rounded-pop px-8 py-6 shadow-soft">
                {p.art}
              </div>
              <h2 className="text-3xl font-extrabold text-ink flex items-center gap-2 justify-center">
                {p.title}
                <SpeakerButton text={`${p.title}。${p.text}`} />
              </h2>
              <p className="text-2xl font-bold text-ink/80 leading-relaxed max-w-lg whitespace-pre-line">
                {p.text}
              </p>
            </>
          )}
      </motion.div>

      <div className="p-6 flex justify-center">
        <Button
          onClick={next}
          disabled={p.quiz && !quizDone}
          className="px-14 disabled:opacity-40"
        >
          {page < pages.length - 1 ? 'つぎへ ▶' : 'できた! 🎉'}
        </Button>
      </div>
    </div>
  )
}

// たしかめクイズ:間違えたら1回目はヒント+再挑戦、2回目で解説付き正解表示(§3.2)
function QuizPage({ quiz, onDone }) {
  const [picked, setPicked] = useState(null)
  const [attempts, setAttempts] = useState(0)
  const [resolved, setResolved] = useState(false)
  const [message, setMessage] = useState(null)

  const handlePick = (c) => {
    if (resolved) return
    if (c === quiz.answer) {
      sfx.correct()
      setPicked(c)
      setResolved(true)
      setMessage({ kind: 'correct', text: '⭕ せいかい!' })
      onDone()
      return
    }
    sfx.wrong()
    const a = attempts + 1
    setAttempts(a)
    if (a >= 2) {
      setPicked(c)
      setResolved(true)
      setMessage({ kind: 'answer', text: `こたえは ${quiz.answer} だよ` })
      speak(`こたえは ${quiz.answer} だよ`)
      onDone()
    } else {
      const hint = quiz.hint || 'もういちど ゆっくり かんがえてみよう'
      setMessage({ kind: 'hint', text: `おしい! ヒント: ${hint}` })
      speak(`おしい。${hint}`)
    }
  }

  return (
    <>
      <div className="text-sm font-bold text-lilac">たしかめクイズ</div>
      <div className="text-3xl font-extrabold text-ink whitespace-pre-line flex items-center gap-2">
        {quiz.prompt}
        <SpeakerButton text={quiz.prompt} />
      </div>
      <ChoiceGrid
        choices={quiz.choices}
        picked={picked}
        correct={resolved ? quiz.answer : null}
        disabled={resolved}
        kind={typeof quiz.choices[0] === 'string' && quiz.choices[0].length <= 2 ? 'emoji' : 'text'}
        onPick={handlePick}
      />
      {message && (
        <p
          className={`text-xl font-extrabold max-w-lg leading-relaxed ${
            message.kind === 'correct' ? 'text-pink' : message.kind === 'hint' ? 'text-lilac' : 'text-ink/70'
          }`}
        >
          {message.text}
        </p>
      )}
    </>
  )
}
