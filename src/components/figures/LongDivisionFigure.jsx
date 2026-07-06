// わり算のひっ算(4年)。商を上に、わる数 ) わられる数 の かたちで表示。
// input(文字列)は 商として 右づめで マスに入る。
export default function LongDivisionFigure({ dividend, divisor, input = '' }) {
  const dstr = String(dividend)
  const width = dstr.length
  const qLen = String(Math.floor(dividend / divisor)).length
  const qCols = Array(width).fill('')
  // 商は右づめ(概ね わられる数の右そろえ)
  for (let i = 0; i < input.length; i++) qCols[width - input.length + i] = input[i]

  const Cell = ({ ch, box }) => (
    <div
      className={`w-11 h-12 grid place-items-center text-3xl font-extrabold tabular ${
        box ? 'rounded-lg border-2 border-dashed border-pink bg-pink/10' : ''
      }`}
    >
      {ch}
    </div>
  )

  return (
    <div className="inline-block bg-white/80 rounded-2xl p-4 shadow-soft">
      {/* 商のらん */}
      <div className="flex justify-end pl-10">
        {qCols.map((ch, i) => (
          <Cell key={`q${i}`} ch={ch} box />
        ))}
      </div>
      {/* わる数 ) わられる数 */}
      <div className="flex items-center">
        <div className="w-10 h-12 grid place-items-center text-3xl font-extrabold tabular text-ink">{divisor}</div>
        <div className="relative flex border-t-4 border-l-4 border-ink rounded-tl-lg">
          {dstr.split('').map((ch, i) => (
            <Cell key={`d${i}`} ch={ch} />
          ))}
        </div>
      </div>
      <div className="text-center text-xs text-ink/40 mt-1 pl-10">わられる数 ÷ わる数</div>
    </div>
  )
}
