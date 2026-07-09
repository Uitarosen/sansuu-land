import TenFrameFigure from './TenFrameFigure.jsx'
import ClockFace from './ClockFace.jsx'
import FractionSVG from './FractionSVG.jsx'
import MakeTenFigure from './MakeTenFigure.jsx'
import ShareBoard from './ShareBoard.jsx'
import NumberLineFigure from './NumberLineFigure.jsx'
import ScaleFigure from './ScaleFigure.jsx'
import Protractor from './Protractor.jsx'
import GridArea from './GridArea.jsx'
import UnfoldedBox from './UnfoldedBox.jsx'
import LineGraphFigure from './LineGraphFigure.jsx'
import VolumeTank from './VolumeTank.jsx'
import FractionBar from './FractionBar.jsx'
import RatioMeter from './RatioMeter.jsx'
import PieBandGraph from './PieBandGraph.jsx'
import DoubleNumberLine from './DoubleNumberLine.jsx'
import AreaTransform from './AreaTransform.jsx'
import PlotBoard from './PlotBoard.jsx'
import TreeDiagram from './TreeDiagram.jsx'
import DotPlot from './DotPlot.jsx'

// レッスンページに埋め込める図のレジストリ(§まなぶ改善)。
// 演習(ProblemView)と同じ図をレッスンでも見せることで、
// 「学んだ絵のまま練習する」一貫性をつくる。
const REGISTRY = {
  tenframe: (p) => <TenFrameFigure n={p.n} emoji={p.emoji} />,
  clock: (p) => <ClockFace hour={p.hour} minute={p.minute} />,
  fraction: (p) => <FractionSVG denom={p.denom} filled={p.filled} />,
  makeTen: (p) => <MakeTenFigure a={p.a} b={p.b} />,
  share: (p) => <ShareBoard total={p.total} divisor={p.divisor} mode={p.mode} emoji={p.emoji} />,
  numberLine: (p) => <NumberLineFigure min={p.min} max={p.max} step={p.step} mark={p.mark} labelEvery={p.labelEvery} />,
  scale: (p) => <ScaleFigure value={p.value} max={p.max} unit={p.unit} />,
  protractor: (p) => <Protractor angle={p.angle} />,
  gridArea: (p) => <GridArea w={p.w} h={p.h} />,
  unfoldedBox: (p) => <UnfoldedBox cells={p.cells} />,
  lineGraph: (p) => <LineGraphFigure points={p.points} unit={p.unit} />,
  volume: (p) => <VolumeTank w={p.w} d={p.d} h={p.h} />,
  fractionBar: (p) => <FractionBar fractions={p.fractions} />,
  ratio: (p) => <RatioMeter base={p.base} compare={p.compare} unit={p.unit} />,
  pieBand: (p) => <PieBandGraph segments={p.segments} shape={p.shape} />,
  doubleLine: (p) => <DoubleNumberLine top={p.top} bottom={p.bottom} unknownAt={p.unknownAt} />,
  areaTransform: (p) => <AreaTransform base={p.base} height={p.height} slant={p.slant} shape={p.shape} />,
  plot: (p) => <PlotBoard points={p.points} maxX={p.maxX} maxY={p.maxY} />,
  tree: (p) => <TreeDiagram items={p.items} />,
  dotPlot: (p) => <DotPlot values={p.values} min={p.min} max={p.max} />,
}

// テストからも参照できる既知kind一覧
export const FIGURE_KINDS = Object.keys(REGISTRY)

export default function FigureView({ figure }) {
  const render = figure && REGISTRY[figure.kind]
  if (!render) return null
  return render(figure)
}
