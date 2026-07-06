import { useRef, useState } from 'react'
import { sfx } from '../../lib/sound.js'

// 針を動かして時刻を合わせる操作型時計(§3.3 とけい)。
// 外側をさわると長針(5分/30分きざみ)、内側をさわると短針(1時間きざみ)。
// 短針は「h時30分なら hと h+1 の間」を自動で表現する。
export default function ClockSetBoard({ step = 30, onCommit, locked }) {
  const [hour, setHour] = useState(12)
  const [minute, setMinute] = useState(0)
  const svgRef = useRef(null)
  const dragging = useRef(null) // 'hour' | 'minute' | null

  const cx = 100
  const cy = 100
  const minuteAngle = (minute / 60) * 360 - 90
  const hourAngle = (((hour % 12) + minute / 60) / 12) * 360 - 90
  const hx = cx + 46 * Math.cos((hourAngle * Math.PI) / 180)
  const hy = cy + 46 * Math.sin((hourAngle * Math.PI) / 180)
  const mx = cx + 70 * Math.cos((minuteAngle * Math.PI) / 180)
  const my = cy + 70 * Math.sin((minuteAngle * Math.PI) / 180)

  const posFrom = (e) => {
    const r = svgRef.current.getBoundingClientRect()
    return {
      x: ((e.clientX - r.left) / r.width) * 200 - cx,
      y: ((e.clientY - r.top) / r.height) * 200 - cy,
    }
  }

  const apply = (x, y) => {
    const deg = (Math.atan2(y, x) * 180) / Math.PI + 90
    const a = (deg + 360) % 360
    if (dragging.current === 'minute') {
      const m = (Math.round(a / 6 / step) * step) % 60
      setMinute(m)
    } else {
      const h = Math.round(a / 30) % 12 || 12
      setHour(h)
    }
  }

  const onDown = (e) => {
    if (locked) return
    const { x, y } = posFrom(e)
    const dist = Math.hypot(x, y)
    if (dist < 14 || dist > 98) return
    dragging.current = dist > 56 ? 'minute' : 'hour'
    try {
      svgRef.current.setPointerCapture?.(e.pointerId)
    } catch {
      // ポインタが既に離れている場合など。キャプチャなしでも動作する
    }
    apply(x, y)
  }
  const onMove = (e) => {
    if (!dragging.current || locked) return
    const { x, y } = posFrom(e)
    apply(x, y)
  }
  const onUp = () => {
    if (dragging.current) sfx.tap()
    dragging.current = null
  }

  const label = `${hour}じ${minute === 0 ? '' : minute === 30 ? 'はん' : minute + 'ふん'}`

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        ref={svgRef}
        viewBox="0 0 200 200"
        width={230}
        height={230}
        style={{ touchAction: 'none' }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <circle cx={cx} cy={cy} r="92" fill="#fff" stroke="#FFB7D5" strokeWidth="8" />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * 360 - 90
          const x = cx + 78 * Math.cos((a * Math.PI) / 180)
          const y = cy + 78 * Math.sin((a * Math.PI) / 180)
          return (
            <text key={i} x={x} y={y + 7} textAnchor="middle" fontSize="18" fontWeight="700" fill="#5D4A55">
              {i === 0 ? 12 : i}
            </text>
          )
        })}
        {/* 時針(みじかい・ふとい) */}
        <line x1={cx} y1={cy} x2={hx} y2={hy} stroke="#5D4A55" strokeWidth="9" strokeLinecap="round" />
        {/* 分針(ながい・ほそい) */}
        <line x1={cx} y1={cy} x2={mx} y2={my} stroke="#C9A8E8" strokeWidth="5" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="7" fill="#5D4A55" />
      </svg>

      <div className="text-xl font-extrabold text-ink/70">いま: {label}</div>

      <button
        onClick={() => {
          if (!locked) {
            sfx.tap()
            onCommit(`${hour}:${minute}`)
          }
        }}
        disabled={locked}
        className="punipuni px-12 py-3 rounded-full bg-pink text-white text-2xl font-extrabold shadow-pop disabled:opacity-40"
      >
        できた!
      </button>
    </div>
  )
}
