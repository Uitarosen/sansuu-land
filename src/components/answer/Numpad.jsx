import { sfx } from '../../lib/sound.js'

// 専用テンキー(§3.3)。キーボード不要。value は文字列、onChange/onEnter で操作。
export default function Numpad({ value, onChange, onEnter, suffix = '', disabled, maxLen = 4 }) {
  const press = (d) => {
    if (disabled) return
    sfx.tap()
    if (value.length < maxLen) onChange(value + d)
  }
  const back = () => {
    if (disabled) return
    sfx.tap()
    onChange(value.slice(0, -1))
  }
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

  return (
    <div className="w-full max-w-xs mx-auto">
      <div className="mb-3 h-16 rounded-2xl bg-white/90 shadow-soft grid place-items-center text-5xl font-extrabold tabular text-ink">
        {value || '_'}
        {suffix && <span className="text-2xl ml-1 text-ink/60">{suffix}</span>}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {keys.map((k) => (
          <button
            key={k}
            onClick={() => press(k)}
            className="punipuni h-16 rounded-2xl bg-lavender/70 text-3xl font-extrabold text-ink shadow-pop"
          >
            {k}
          </button>
        ))}
        <button onClick={back} className="punipuni h-16 rounded-2xl bg-cream text-2xl font-bold shadow-pop">
          ⌫
        </button>
        <button onClick={() => press('0')} className="punipuni h-16 rounded-2xl bg-lavender/70 text-3xl font-extrabold text-ink shadow-pop">
          0
        </button>
        <button
          onClick={() => {
            if (!disabled && value !== '') {
              sfx.tap()
              onEnter()
            }
          }}
          disabled={disabled || value === ''}
          className="punipuni h-16 rounded-2xl bg-pink text-white text-2xl font-extrabold shadow-pop disabled:opacity-40"
        >
          ✓
        </button>
      </div>
    </div>
  )
}
