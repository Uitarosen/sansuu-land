import { useState, useEffect } from 'react'
import Furigana from '../common/Furigana.jsx'
import SpeakerButton from '../common/SpeakerButton.jsx'
import ChoiceGrid from './ChoiceGrid.jsx'
import Numpad from './Numpad.jsx'
import MultiFieldPad from './MultiFieldPad.jsx'
import HissanFigure from '../figures/HissanFigure.jsx'
import KukuFigure from '../figures/KukuFigure.jsx'
import ClockFace from '../figures/ClockFace.jsx'
import TapeFigure from '../figures/TapeFigure.jsx'
import GraphFigure from '../figures/GraphFigure.jsx'
import FractionSVG from '../figures/FractionSVG.jsx'
import TenFrameFigure from '../figures/TenFrameFigure.jsx'
import MakeTenFigure from '../figures/MakeTenFigure.jsx'
import ClockSetBoard from '../figures/ClockSetBoard.jsx'
import ShareBoard from '../figures/ShareBoard.jsx'
import NumberLineFigure from '../figures/NumberLineFigure.jsx'
import ScaleFigure from '../figures/ScaleFigure.jsx'
import LineGraphFigure from '../figures/LineGraphFigure.jsx'
import GridArea from '../figures/GridArea.jsx'
import Protractor from '../figures/Protractor.jsx'
import LongDivisionFigure from '../figures/LongDivisionFigure.jsx'
import UnfoldedBox from '../figures/UnfoldedBox.jsx'
import VolumeTank from '../figures/VolumeTank.jsx'
import FractionBar from '../figures/FractionBar.jsx'
import RatioMeter from '../figures/RatioMeter.jsx'
import PieBandGraph from '../figures/PieBandGraph.jsx'
import DoubleNumberLine from '../figures/DoubleNumberLine.jsx'
import AreaTransform from '../figures/AreaTransform.jsx'

// 問題1問の表示と回答UI。型に応じてヘッダー図とテンキー/選択を出し分ける。
export default function ProblemView({ problem, onCommit, feedback, locked, furigana = true, clearSignal = 0 }) {
  const [input, setInput] = useState('')
  // 問題が変わったとき・間違えたときに入力をクリア
  useEffect(() => setInput(''), [problem.id, clearSignal])

  const { type, data } = problem
  const showPrompt = type !== 'hissan' && type !== 'kuku' && type !== 'longDivision'
  const choiceKind = type === 'shapeTap' ? 'shape' : data.emoji ? 'emoji' : 'text'
  const maxLen = Math.max(4, String(problem.answer).length + 1)

  // 回答UIの決定: 特殊操作 → 複数欄 → 選択 → テンキー
  let answerUI
  if (type === 'clockSet') {
    answerUI = <ClockSetBoard key={`${problem.id}-clock`} step={data.step} locked={locked} onCommit={onCommit} />
  } else if (data.inputMode) {
    answerUI = (
      <MultiFieldPad key={`${problem.id}-pad`} layout={data.inputMode} disabled={locked} clearSignal={clearSignal} onCommit={onCommit} />
    )
  } else if (Array.isArray(data.choices)) {
    answerUI = (
      <ChoiceGrid
        choices={data.choices}
        kind={choiceKind}
        disabled={locked}
        picked={feedback?.picked}
        correct={feedback?.showCorrect ? problem.answer : null}
        onPick={(c) => onCommit(c)}
      />
    )
  } else {
    answerUI = (
      <Numpad
        value={input}
        onChange={setInput}
        onEnter={() => onCommit(data.numeric === false ? input : Number(input))}
        suffix={data.suffix || ''}
        disabled={locked}
        maxLen={maxLen}
        mode={data.numpadMode || 'int'}
      />
    )
  }

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
      {type === 'divide' && (
        <ShareBoard key={problem.id} total={data.total} divisor={data.divisor} mode={data.shareMode} emoji={data.emoji} />
      )}
      {type === 'numberLine' && (
        <NumberLineFigure min={data.min} max={data.max} step={data.step} mark={data.mark} labelEvery={data.labelEvery} />
      )}
      {type === 'scale' && <ScaleFigure value={data.value} max={data.max} unit={data.unit} />}
      {type === 'lineGraph' && <LineGraphFigure points={data.points} unit={data.unit} />}
      {type === 'gridArea' && <GridArea key={problem.id} w={data.w} h={data.h} />}
      {type === 'protractor' && <Protractor angle={data.angle} />}
      {type === 'longDivision' && <LongDivisionFigure dividend={data.dividend} divisor={data.divisor} input={input} />}
      {type === 'unfoldedBox' && <UnfoldedBox cells={data.cells} />}
      {type === 'volume' && <VolumeTank w={data.w} d={data.d} h={data.h} />}
      {type === 'fractionBar' && <FractionBar key={problem.id} fractions={data.fractions} />}
      {type === 'ratio' && <RatioMeter base={data.base} compare={data.compare} unit={data.unit} />}
      {type === 'pieBand' && <PieBandGraph segments={data.segments} shape={data.shape} />}
      {type === 'doubleLine' && <DoubleNumberLine top={data.top} bottom={data.bottom} unknownAt={data.unknownAt} />}
      {type === 'areaTransform' && <AreaTransform key={problem.id} base={data.base} height={data.height} slant={data.slant} shape={data.shape} />}
      {type === 'graph' && <GraphFigure items={data.items} />}
      {type === 'tape' && (
        <TapeFigure parts={data.parts} whole={data.whole} blankAt={data.blankAt} input={input} />
      )}
      {data.figure?.kind === 'tenframe' && <TenFrameFigure n={data.figure.n} emoji={data.figure.emoji} />}
      {data.figure?.kind === 'fraction' && <FractionSVG denom={data.figure.denom} filled={data.figure.filled} />}

      {answerUI}
    </div>
  )
}
