// 割合(5年)。もとにする量を 全体の 帯、比べる量を その中の 色つき部分で 見せる。
// 割合(百分率)を 帯の 満ちぐあいで 直感的に つかむ。
// props: base(もとにする量), compare(比べる量), unit
export default function RatioMeter({ base, compare, unit = '' }) {
  const ratio = compare / base
  const pct = Math.round(ratio * 100)
  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-md">
      <div className="w-full">
        <div className="flex justify-between text-xs font-bold text-ink/60 mb-1">
          <span>もとにする量: {base}{unit}(ぜんたい)</span>
          <span>0% → 100%</span>
        </div>
        <div className="relative w-full h-10 rounded-full bg-white/80 border-2 border-lavender overflow-hidden">
          <div
            className="h-full bg-pink/70 flex items-center justify-end pr-2 transition-all"
            style={{ width: `${Math.min(100, pct)}%` }}
          >
            <span className="text-xs font-extrabold text-white whitespace-nowrap">比べる量 {compare}{unit}</span>
          </div>
          {/* 目もり(25/50/75%) */}
          {[25, 50, 75].map((p) => (
            <div key={p} className="absolute top-0 h-full border-l border-lavender/60" style={{ left: `${p}%` }} />
          ))}
        </div>
      </div>
      <div className="text-sm text-ink/50">
        「{base}{unit}を 1(=100%)と 見たとき、{compare}{unit}は どれだけ?」
      </div>
    </div>
  )
}
