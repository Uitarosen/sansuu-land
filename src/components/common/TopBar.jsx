import { sfx } from '../../lib/sound.js'

// 上部バー:もどる(常に左上・同じ位置)+ タイトル + スター残高(§4.2)
export default function TopBar({ onBack, title, stars, right }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {onBack ? (
        <button
          onClick={() => {
            sfx.tap()
            onBack()
          }}
          aria-label="もどる"
          className="punipuni w-14 h-14 rounded-full bg-white/90 shadow-soft grid place-items-center text-3xl shrink-0"
        >
          ←
        </button>
      ) : (
        <div className="w-14" />
      )}
      <div className="flex-1 text-center font-extrabold text-2xl text-ink truncate">{title}</div>
      {right ??
        (stars != null ? (
          <div className="shrink-0 flex items-center gap-1 bg-white/90 rounded-full px-4 h-14 shadow-soft text-xl font-bold">
            <span className="text-2xl">⭐</span>
            {stars}
          </div>
        ) : (
          <div className="w-14" />
        ))}
    </div>
  )
}
