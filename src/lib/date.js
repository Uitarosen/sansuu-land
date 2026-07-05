// 端末ローカルの日付キー(YYYY-MM-DD)。カレンダー・間隔反復に使用。
export function todayKey(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function daysBetween(aMs, bMs) {
  return Math.floor((bMs - aMs) / (1000 * 60 * 60 * 24))
}
