import { useState, useEffect } from 'react'
import { sfx } from '../../lib/sound.js'

// 複数欄の回答入力(§3.2 エンジン拡張)。
// layout: 'quotRem'(商・あまり) | 'fraction'(分子/分母) | 'mixed'(整数+分子/分母)
// onCommit には layout に応じたオブジェクトを渡す:
//   quotRem → { q, r } / fraction → { num, den } / mixed → { whole, num, den }
const LAYOUTS = {
  quotRem: [
    { key: 'q', label: '' },
    { key: 'r', label: 'あまり' },
  ],
  fraction: [
    { key: 'den', label: '' },
    { key: 'num', label: '' },
  ],
  mixed: [
    { key: 'whole', label: '' },
    { key: 'den', label: '' },
    { key: 'num', label: '' },
  ],
}

export default function MultiFieldPad({ layout = 'quotRem', onCommit, disabled, clearSignal = 0 }) {
  const fields = LAYOUTS[layout]
  const [vals, setVals] = useState({})
  const [active, setActive] = useState(fields[0].key)

  useEffect(() => {
    setVals({})
    setActive(fields[0].key)
  }, [clearSignal]) // eslint-disable-line

  const press = (d) => {
    if (disabled) return
    sfx.tap()
    setVals((v) => ({ ...v, [active]: (v[active] || '') + d }))
  }
  const back = () => {
    if (disabled) return
    sfx.tap()
    setVals((v) => ({ ...v, [active]: (v[active] || '').slice(0, -1) }))
  }
  const ready = fields.every((f) => (vals[f.key] || '') !== '')
  const commit = () => {
    if (disabled || !ready) return
    sfx.tap()
    const obj = {}
    for (const f of fields) obj[f.key] = Number(vals[f.key])
    onCommit(obj)
  }

  const FieldBox = ({ k }) => (
    <button
      onClick={() => {
        sfx.tap()
        setActive(k)
      }}
      className={`w-16 h-16 rounded-xl grid place-items-center text-4xl font-extrabold tabular shadow-soft ${
        active === k ? 'bg-white ring-4 ring-pink' : 'bg-white/80'
      }`}
    >
      {vals[k] || '_'}
    </button>
  )

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* 回答欄の表示 */}
      {layout === 'quotRem' && (
        <div className="flex items-center gap-2 text-2xl font-extrabold text-ink">
          <FieldBox k="q" />
          <span>あまり</span>
          <FieldBox k="r" />
        </div>
      )}
      {layout === 'fraction' && (
        <div className="flex flex-col items-center">
          <FieldBox k="num" />
          <div className="w-20 h-1.5 bg-ink rounded my-1" />
          <FieldBox k="den" />
        </div>
      )}
      {layout === 'mixed' && (
        <div className="flex items-center gap-3">
          <FieldBox k="whole" />
          <div className="flex flex-col items-center">
            <FieldBox k="num" />
            <div className="w-20 h-1.5 bg-ink rounded my-1" />
            <FieldBox k="den" />
          </div>
        </div>
      )}

      {/* テンキー */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-xs">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((k) => (
          <button
            key={k}
            onClick={() => press(k)}
            className="punipuni h-14 rounded-2xl bg-lavender/70 text-3xl font-extrabold text-ink shadow-pop"
          >
            {k}
          </button>
        ))}
        <button onClick={back} className="punipuni h-14 rounded-2xl bg-cream text-2xl font-bold shadow-pop">
          ⌫
        </button>
        <button onClick={() => press('0')} className="punipuni h-14 rounded-2xl bg-lavender/70 text-3xl font-extrabold text-ink shadow-pop">
          0
        </button>
        <button
          onClick={commit}
          disabled={disabled || !ready}
          className="punipuni h-14 rounded-2xl bg-pink text-white text-2xl font-extrabold shadow-pop disabled:opacity-40"
        >
          ✓
        </button>
      </div>
    </div>
  )
}
