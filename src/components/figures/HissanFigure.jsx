import { useState } from 'react'
import { useStore } from '../../store/useStore.js'

// ひっ算の図(§3.3 / §4.2)。ノートのマス目風に位を そろえる。
// input は現在入力中のこたえ(文字列)。右づめで マスに はいる。
export default function HissanFigure({ a, b, op, input = '' }) {
  const carryMemo = useStore((s) => s.settings.carryMemo)
  const answer = op === '+' ? a + b : op === '-' ? a - b : a * b
  const width = Math.max(String(a).length, String(b).length, String(answer).length) + (op === '+' ? 1 : 0)
  const [memo, setMemo] = useState({})

  const cols = (n) => {
    const str = String(n)
    const arr = Array(width).fill('')
    for (let i = 0; i < str.length; i++) arr[width - str.length + i] = str[i]
    return arr
  }
  const ansCols = () => {
    const arr = Array(width).fill('')
    for (let i = 0; i < input.length; i++) arr[width - input.length + i] = input[i]
    return arr
  }

  const Cell = ({ ch, box }) => (
    <div
      className={`w-12 h-14 grid place-items-center text-4xl font-extrabold tabular ${
        box ? 'rounded-lg border-2 border-dashed border-pink bg-pink/10' : ''
      }`}
    >
      {ch}
    </div>
  )

  return (
    <div className="inline-block bg-white/80 rounded-2xl p-4 shadow-soft">
      {carryMemo && (
        <div className="flex justify-end">
          {Array(width)
            .fill(0)
            .map((_, i) => (
              <button
                key={i}
                onClick={() => setMemo((m) => ({ ...m, [i]: m[i] ? '' : '1' }))}
                className="w-12 h-6 grid place-items-center text-sm text-lilac font-bold"
              >
                {memo[i] || '·'}
              </button>
            ))}
        </div>
      )}
      <div className="flex justify-end">
        {cols(a).map((ch, i) => (
          <Cell key={`a${i}`} ch={ch} />
        ))}
      </div>
      <div className="flex items-center justify-end border-b-4 border-ink pb-1">
        <div className="text-4xl font-extrabold mr-1">{op}</div>
        {cols(b).map((ch, i) => (
          <Cell key={`b${i}`} ch={ch} />
        ))}
      </div>
      <div className="flex justify-end pt-1">
        {ansCols().map((ch, i) => (
          <Cell key={`r${i}`} ch={ch} box />
        ))}
      </div>
    </div>
  )
}
