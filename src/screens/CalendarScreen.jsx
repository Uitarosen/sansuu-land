import { useStore } from '../store/useStore.js'
import { todayKey } from '../lib/date.js'
import TopBar from '../components/common/TopBar.jsx'

// がんばりカレンダー(§5 画面10 / §3.5)。学習した日に花が咲く。
const wd = ['にち', 'げつ', 'か', 'すい', 'もく', 'きん', 'ど']

export default function CalendarScreen({ nav }) {
  const studyCalendar = useStore((s) => s.studyCalendar)
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const first = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startWd = first.getDay()
  const today = todayKey()

  const cells = []
  for (let i = 0; i < startWd; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ d, key, studied: studyCalendar.includes(key), isToday: key === today })
  }

  const studiedThisMonth = studyCalendar.filter((k) => k.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length

  return (
    <div className="min-h-screen">
      <TopBar onBack={nav.back} title="がんばりカレンダー 🌸" />

      <div className="text-center text-2xl font-extrabold text-ink mt-2">
        {year}ねん {month + 1}がつ
      </div>
      <div className="text-center text-ink/60 font-bold mb-4">
        こんげつ {studiedThisMonth}にち がんばったね!
      </div>

      <div className="grid grid-cols-7 gap-1 px-3 max-w-md mx-auto">
        {wd.map((w, i) => (
          <div key={w} className={`text-center text-sm font-bold ${i === 0 ? 'text-pink' : i === 6 ? 'text-lavender' : 'text-ink/50'}`}>
            {w}
          </div>
        ))}
        {cells.map((c, i) => (
          <div
            key={i}
            className={`aspect-square rounded-2xl grid place-items-center relative ${
              c ? (c.isToday ? 'bg-pink/30 ring-2 ring-pink' : 'bg-white/70') : ''
            }`}
          >
            {c && (
              <>
                <span className="absolute top-1 left-1 text-xs font-bold text-ink/50">{c.d}</span>
                {c.studied && <span className="text-2xl">🌸</span>}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
