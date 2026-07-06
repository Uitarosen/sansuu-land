import { useState, useEffect } from 'react'
import { sfx } from '../../lib/sound.js'

// 通分の操作(5年)。2本の分数バーの 分割数を そろえて、
// 目もりが ぴったり 合う瞬間(公倍数)を 自分で 見つける。
// props: fractions = [{num, den}, {num, den}]
export default function FractionBar({ fractions }) {
  const [f1, f2] = fractions
  const lcd = lcm(f1.den, f2.den)
  const [split, setSplit] = useState(false)
  useEffect(() => setSplit(false), [f1.den, f2.den, f1.num, f2.num])

  const Bar = ({ f }) => {
    const den = split ? lcd : f.den
    const num = split ? (f.num * lcd) / f.den : f.num
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="flex w-64 h-9 rounded-lg overflow-hidden border-2 border-ink/30">
          {Array.from({ length: den }).map((_, i) => (
            <div key={i} className={`flex-1 border-r border-white ${i < num ? 'bg-pink/70' : 'bg-white'}`} />
          ))}
        </div>
        <div className="text-sm font-extrabold text-ink">
          {split ? `${num}/${den}` : `${f.num}/${f.den}`}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Bar f={f1} />
      <Bar f={f2} />
      <button
        onClick={() => {
          sfx.tap()
          setSplit((s) => !s)
        }}
        className="punipuni px-6 py-2 rounded-full bg-lavender/80 font-extrabold text-ink shadow-pop"
      >
        {split ? `↩ もとに もどす` : `🔍 分けかたを そろえる`}
      </button>
      {split && (
        <div className="text-sm font-bold text-mint">分母が {lcd}に そろったね!</div>
      )}
    </div>
  )
}

function gcd(a, b) {
  while (b) [a, b] = [b, a % b]
  return a
}
function lcm(a, b) {
  return (a * b) / gcd(a, b)
}
