import { useState, useEffect, useMemo } from 'react'
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
import FigureView from '../components/figures/FigureView.jsx'

// *ことば* 形式の強調マークを取り除く(読み上げ用)
const plain = (t) => String(t ?? '').replaceAll('*', '')

// *ことば* を強調表示するレンダラ(§まなぶ改善: キーワード強調)
function Marked({ text }) {
  const parts = String(text ?? '').split('*')
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="font-extrabold text-[#E24A7A] bg-gold/30 rounded px-0.5">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}

// まなぶモード:紙芝居レッスン(§3.2 / まなぶ改善)
// ページ型: 通常 {art,title,text} / 図つき {figure,title,text}
//          手順 {title,steps:[{art,text}]} / クイズ {quiz} / あいことば(自動追加)
export default function LessonScreen({ nav, route }) {
  const { gradeId, unitId } = route
  const unit = getUnit(gradeId, unitId)
  const [page, setPage] = useState(0)
  const [done, setDone] = useState(false)
  const [quizDone, setQuizDone] = useState(false)
  const [stepIdx, setStepIdx] = useState(1) // 表示済みステップ数(最初の1つは常に表示)
  const addStars = useStore((s) => s.addStars)
  const markStudied = useStore((s) => s.markStudiedToday)
  const alreadyDone = useStore((s) => !!s.lessonDone[unitId])
  const markLessonDone = useStore((s) => s.markLessonDone)
  const [firstTime] = useState(!alreadyDone)

  // あいことばページを最後に自動追加(§まなぶ改善: まとめページ)
  const pages = useMemo(() => {
    const arr = [...(unit?.lessons ?? [])]
    if (unit?.aikotoba) arr.push({ aikotoba: unit.aikotoba })
    return arr
  }, [unit])
  const p = pages[page]

  const isSteps = Array.isArray(p?.steps)
  const stepsFinished = !isSteps || stepIdx >= p.steps.length

  useEffect(() => {
    setQuizDone(false)
    setStepIdx(1)
    if (!p) return
    if (p.aikotoba) speak(`きょうの あいことば。${plain(p.aikotoba)}`)
    else if (Array.isArray(p.steps)) speak(`${plain(p.title)}。${plain(p.steps[0]?.text)}`)
    else if (!p.quiz) speak(`${plain(p.title)}。${plain(p.text)}`)
  }, [page]) // eslint-disable-line

  if (!unit) return null

  const finish = () => {
    sfx.fanfare()
    markStudied()
    markLessonDone(unit.id)
    if (firstTime) addStars(2)
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

  const prev = () => {
    if (page > 0) {
      sfx.tap()
      setPage(page - 1)
    }
  }

  const revealStep = () => {
    sfx.tap()
    const nextIdx = stepIdx + 1
    setStepIdx(nextIdx)
    speak(plain(p.steps[nextIdx - 1]?.text))
  }

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 text-center">
        <Confetti />
        <Character size="text-8xl" mood="happy" companion={gradeId === 'grade2'} />
        <h2 className="text-4xl font-extrabold text-pink">レッスン クリア!</h2>
        {unit.aikotoba && (
          <div className="bg-gold/40 rounded-pop px-6 py-3 shadow-soft text-xl font-extrabold text-ink">
            📣「{plain(unit.aikotoba)}」
          </div>
        )}
        <p className="text-xl font-bold text-ink/70">
          {firstTime ? 'スタンプ ⭐×2 ゲット!' : 'ふくしゅう ばっちり! えらい!'}
        </p>
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

  const nextDisabled = (p.quiz && !quizDone) || (isSteps && !stepsFinished)

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar onBack={nav.back} title={unit.title} />
      {/* 進捗ドット(読んだページはタップで戻れる) */}
      <div className="flex justify-center gap-2 mb-2">
        {pages.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              if (i < page) {
                sfx.tap()
                setPage(i)
              }
            }}
            aria-label={`ページ${i + 1}`}
            className={`w-3 h-3 rounded-full ${i === page ? 'bg-pink' : i < page ? 'bg-pink/40' : 'bg-white/70'}`}
          />
        ))}
      </div>

      <motion.div
        key={page}
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="flex-1 flex flex-col items-center justify-center gap-5 p-6 text-center"
      >
        {p.quiz ? (
          <QuizPage quiz={p.quiz} onDone={() => setQuizDone(true)} />
        ) : p.aikotoba ? (
          <AikotobaPage aikotoba={p.aikotoba} />
        ) : isSteps ? (
          <StepsPage p={p} stepIdx={stepIdx} onReveal={revealStep} finished={stepsFinished} />
        ) : (
          <>
            {p.figure ? (
              <div className="bg-white/70 rounded-pop px-6 py-4 shadow-soft grid place-items-center">
                <FigureView figure={p.figure} />
              </div>
            ) : (
              <div className="text-7xl whitespace-pre-line leading-tight bg-white/70 rounded-pop px-8 py-6 shadow-soft">
                {p.art}
              </div>
            )}
            <h2 className="text-3xl font-extrabold text-ink flex items-center gap-2 justify-center">
              {p.title}
              <SpeakerButton text={`${plain(p.title)}。${plain(p.text)}`} />
            </h2>
            <p className="text-2xl font-bold text-ink/80 leading-relaxed max-w-lg whitespace-pre-line">
              <Marked text={p.text} />
            </p>
          </>
        )}
      </motion.div>

      <div className="p-6 flex justify-center items-center gap-3">
        {page > 0 && (
          <Button variant="ghost" onClick={prev} className="px-6">
            ◀ まえへ
          </Button>
        )}
        <Button onClick={next} disabled={nextDisabled} className="px-14 disabled:opacity-40">
          {page < pages.length - 1 ? 'つぎへ ▶' : 'できた! 🎉'}
        </Button>
      </div>
    </div>
  )
}

// 手順ページ:タップするたびに1ステップずつ現れる(§まなぶ改善: worked example)
function StepsPage({ p, stepIdx, onReveal, finished }) {
  const current = p.steps[Math.min(stepIdx, p.steps.length) - 1]
  return (
    <>
      <div className="text-5xl whitespace-pre-line leading-tight bg-white/70 rounded-pop px-8 py-5 shadow-soft min-h-[90px] grid place-items-center">
        {current?.art ?? p.art ?? '🧮'}
      </div>
      <h2 className="text-2xl font-extrabold text-ink flex items-center gap-2 justify-center">
        {p.title}
        <SpeakerButton text={plain(p.steps.slice(0, stepIdx).map((s) => s.text).join('。'))} />
      </h2>
      <div className="flex flex-col gap-2 w-full max-w-lg">
        {p.steps.slice(0, stepIdx).map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl px-4 py-3 text-left text-lg font-bold shadow-soft ${
              i === stepIdx - 1 ? 'bg-mint/60 text-ink' : 'bg-white/70 text-ink/60'
            }`}
          >
            <span className="mr-2">{['①', '②', '③', '④', '⑤', '⑥'][i] ?? '・'}</span>
            <Marked text={s.text} />
          </motion.div>
        ))}
      </div>
      {!finished && (
        <button
          onClick={onReveal}
          className="punipuni px-8 py-3 rounded-full bg-lavender/80 text-xl font-extrabold text-ink shadow-pop"
        >
          ▶ つぎは?
        </button>
      )}
    </>
  )
}

// あいことばページ:単元の核を1フレーズで(§まなぶ改善: まとめ)
function AikotobaPage({ aikotoba }) {
  return (
    <>
      <div className="text-sm font-bold text-lilac">きょうの あいことば</div>
      <div className="text-6xl">📣</div>
      <div className="bg-gold/40 rounded-pop px-8 py-6 shadow-soft text-3xl font-extrabold text-ink leading-relaxed max-w-lg flex items-center justify-center gap-3 flex-wrap">
        <span>
          「<Marked text={aikotoba} />」
        </span>
        <SpeakerButton text={plain(aikotoba)} />
      </div>
      <p className="text-xl font-bold text-ink/70 max-w-md">
        これだけ おぼえれば だいじょうぶ!
        <br />
        こえに 出して いってみよう
      </p>
    </>
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
