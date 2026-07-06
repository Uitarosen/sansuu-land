// 展開図(4年 直方体と立方体)。マスの ならびを えがいて、
// 立方体に なるか どうかを 考える。cells: [[x,y], ...] の6マスの ならび。
export default function UnfoldedBox({ cells, cell = 34 }) {
  const xs = cells.map((c) => c[0])
  const ys = cells.map((c) => c[1])
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const cols = Math.max(...xs) - minX + 1
  const rows = Math.max(...ys) - minY + 1

  return (
    <div
      className="relative bg-white/60 rounded-xl"
      style={{ width: cols * cell + 12, height: rows * cell + 12, padding: 6 }}
    >
      {cells.map(([x, y], i) => (
        <div
          key={i}
          className="absolute bg-gold/70 border-2 border-ink/40 rounded-sm"
          style={{ left: (x - minX) * cell + 6, top: (y - minY) * cell + 6, width: cell, height: cell }}
        />
      ))}
    </div>
  )
}
