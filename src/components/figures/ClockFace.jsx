// アナログ時計(§3.3 とけい)。読み取り用に針を描画。
export default function ClockFace({ hour = 12, minute = 0, size = 200 }) {
  const cx = 100
  const cy = 100
  const minuteAngle = (minute / 60) * 360 - 90
  const hourAngle = (((hour % 12) + minute / 60) / 12) * 360 - 90
  const hx = cx + 46 * Math.cos((hourAngle * Math.PI) / 180)
  const hy = cy + 46 * Math.sin((hourAngle * Math.PI) / 180)
  const mx = cx + 70 * Math.cos((minuteAngle * Math.PI) / 180)
  const my = cy + 70 * Math.sin((minuteAngle * Math.PI) / 180)

  return (
    <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden>
      <circle cx={cx} cy={cy} r="92" fill="#fff" stroke="#FFB7D5" strokeWidth="8" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * 360 - 90
        const x = cx + 78 * Math.cos((a * Math.PI) / 180)
        const y = cy + 78 * Math.sin((a * Math.PI) / 180)
        return (
          <text
            key={i}
            x={x}
            y={y + 7}
            textAnchor="middle"
            fontSize="18"
            fontWeight="700"
            fill="#5D4A55"
          >
            {i === 0 ? 12 : i}
          </text>
        )
      })}
      {/* 時針(みじかい・ふとい) */}
      <line x1={cx} y1={cy} x2={hx} y2={hy} stroke="#5D4A55" strokeWidth="8" strokeLinecap="round" />
      {/* 分針(ながい・ほそい) */}
      <line x1={cx} y1={cy} x2={mx} y2={my} stroke="#C9A8E8" strokeWidth="5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="7" fill="#5D4A55" />
    </svg>
  )
}
