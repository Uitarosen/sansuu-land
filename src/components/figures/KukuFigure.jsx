// 九九カード(§3.3 九九フラッシュカード)。式を大きくカード表示。
export default function KukuFigure({ a, b, product, blank, input = '' }) {
  const Box = ({ children }) => (
    <span className="inline-grid place-items-center min-w-[3.5rem] h-16 px-2 rounded-xl border-2 border-dashed border-gold bg-gold/20 text-5xl font-extrabold text-ink">
      {children}
    </span>
  )
  return (
    <div className="bg-white/85 rounded-pop px-8 py-6 shadow-soft flex items-center gap-3 text-5xl font-extrabold tabular">
      <span>{a}</span>
      <span className="text-lilac">×</span>
      {blank === 'b' ? <Box>{input || '?'}</Box> : <span>{b}</span>}
      <span className="text-lilac">=</span>
      {blank === 'b' ? <span>{product}</span> : <Box>{input || '?'}</Box>}
    </div>
  )
}
