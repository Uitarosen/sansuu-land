// 10フレーム(5×2のわく)。数を「10のまとまりと ばら」の構造で見せる。
function Frame({ count, emoji }) {
  return (
    <div className="grid grid-cols-5 gap-1 p-2 bg-white/80 rounded-2xl shadow-soft">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="w-11 h-11 rounded-lg border-2 border-pink/30 bg-white grid place-items-center text-2xl"
        >
          {i < count ? emoji : ''}
        </div>
      ))}
    </div>
  )
}

export default function TenFrameFigure({ n, emoji = '🍓' }) {
  const frames = []
  let rest = n
  while (rest > 0 || frames.length === 0) {
    frames.push(Math.min(10, rest))
    rest -= Math.min(10, rest)
    if (frames.length >= 10) break
  }
  return (
    <div className="flex flex-col items-center gap-2">
      {frames.map((c, i) => (
        <Frame key={i} count={c} emoji={emoji} />
      ))}
    </div>
  )
}
