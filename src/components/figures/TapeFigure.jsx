// テープ図(§3.3 テープ図穴埋め)。文章題を図で可視化。
export default function TapeFigure({ parts = [], whole = null, blankAt = 'whole', input = '' }) {
  const [a, b] = parts
  const shownWhole = blankAt === 'whole' ? (input || '?') : whole
  const shownB = blankAt === 'part' ? (input || '?') : b

  return (
    <div className="w-full max-w-md mx-auto">
      {/* 全体テープ */}
      <div className="relative h-14 rounded-2xl bg-lavender/40 border-2 border-lavender flex">
        <div className="flex-1 grid place-items-center text-2xl font-extrabold border-r-2 border-dashed border-white/70">
          {a}
        </div>
        <div className="flex-1 grid place-items-center text-2xl font-extrabold text-lilac">
          {shownB}
        </div>
      </div>
      <div className="mt-2 text-center text-xl font-bold text-ink">
        ぜんたい:
        <span className="inline-grid place-items-center min-w-[3rem] px-3 ml-1 rounded-xl bg-pink/30 text-2xl">
          {shownWhole}
        </span>
      </div>
    </div>
  )
}
