import { useState, useEffect } from 'react'
import Furigana from '../common/Furigana.jsx'
import SpeakerButton from '../common/SpeakerButton.jsx'
import ChoiceGrid from './ChoiceGrid.jsx'
import Numpad from './Numpad.jsx'
import HissanFigure from '../figures/HissanFigure.jsx'
import KukuFigure from '../figures/KukuFigure.jsx'
import ClockFace from '../figures/ClockFace.jsx'
import TapeFigure from '../figures/TapeFigure.jsx'
import GraphFigure from '../figures/GraphFigure.jsx'
import FractionSVG from '../figures/FractionSVG.jsx'
import TenFrameFigure from '../figures/TenFrameFigure.jsx'
import MakeTenFigure from '../figures/MakeTenFigure.jsx'
import ClockSetBoard from '../figures/ClockSetBoard.jsx'

// 問題1問の表示と回答UI。型に応じてヘッダー図とテンキー/選択を出し分ける。
export default function ProblemView({ problem, onCommit, feedback, locked, furigana = true, clearSignal = 0 }) {
  const [input, setInput] = useState('')
  // 問題が変わったとき・間違えたときに入力をクリア
  useEffect(() => setInput(''), [problem.id, clearSignal])

  const { type, data } = problem
  const choiceLike = type === 'choice' || type === 'shapeTap' || type === 'clock' || (type === 'graph' && data.choiceMode)
  const inputKind = choiceLike ? 'choice' : 'numpad'
  const showPrompt = type !== 'hissan' && type !== 'kuku'

  const choiceKind = type === 'shapeTap' ? 'shape' : data.emoji ? 'emoji' : 'text'
  const maxLen = Math.max(4, String(problem.answer).length + 1)

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* 問題文 */}
      <div className="flex items-start gap-3 max-w-xl text-center">
        {showPrompt && (
          <div
            className={`${
              problem.prompt.length > 40 ? 'text-xl' : problem.prompt.length > 20 ? 'text-2xl' : 'text-3xl'
            } font-extrabold text-ink leading-relaxed whitespace-pre-line`}
          >
            <Furigana text={problem.prompt} furigana={furigana} />
          </div>
        )}
        <SpeakerButton text={problem.speakText} className="mt-1 shrink-0" />
      </div>

      {/* ヘッダー図 */}
      {type === 'hissan' && <HissanFigure a={data.a} b={data.b} op={data.op} input={input} />}
      {type === 'kuku' && (
        <KukuFigure a={data.a} b={data.b} product={data.product} blank={data.blank} input={input} />
      )}
      {type === 'clock' && <ClockFace hour={data.hour} minute={data.minute} />}
      {type === 'makeTen' && <MakeTenFigure key={problem.id} a={data.a} b={data.b} />}
      {type === 'choice' && data.figure?.kind === 'tenframe' && (
        <TenFrameFigure n={data.figure.n} emoji={data.figure.emoji} />
      )}
      {type === 'graph' && <GraphFigure items={data.items} />}
      {type === 'tape' && (
        <TapeFigure parts={data.parts} whole={data.whole} blankAt={data.blankAt} input={input} />
      )}
      {type === 'choice' && data.figure?.kind === 'fraction' && (
        <FractionSVG denom={data.figure.denom} filled={data.figure.filled} />
      )}

      {/* 回答UI */}
      {type === 'clockSet' ? (
        <ClockSetBoard key={problem.id} step={data.step} locked={locked} onCommit={onCommit} />
      ) : inputKind === 'choice' ? (
        <ChoiceGrid
          choices={data.choices}
          kind={choiceKind}
          disabled={locked}
          picked={feedback?.picked}
          correct={feedback?.showCorrect ? problem.answer : null}
          onPick={(c) => onCommit(c)}
        />
      ) : (
        <Numpad
          value={input}
          onChange={setInput}
          onEnter={() => onCommit(Number(input))}
          suffix={data.suffix || ''}
          disabled={locked}
          maxLen={maxLen}
        />
      )}
    </div>
  )
}
