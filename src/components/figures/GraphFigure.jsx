// ぼうグラフ(§3.3 グラフ読み取り)。
export default function GraphFigure({ items = [] }) {
  const max = Math.max(...items.map((i) => i.value), 1)
  return (
    <div className="flex items-end justify-center gap-4 h-48 px-2">
      {items.map((it, i) => (
        <div key={i} className="flex flex-col items-center justify-end h-full">
          <div className="text-lg font-bold text-ink mb-1">{it.value}</div>
          <div
            className="w-12 rounded-t-xl bg-pink shadow-soft transition-all"
            style={{ height: `${(it.value / max) * 100}%` }}
          />
          <div className="text-3xl mt-1">{it.emoji}</div>
          <div className="text-sm font-bold text-ink">{it.label}</div>
        </div>
      ))}
    </div>
  )
}
