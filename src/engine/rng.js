// 乱数ユーティリティ。問題インスタンス生成に使用(§6.4)。
export const rint = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

let counter = 0
export const uid = () => `p${Date.now().toString(36)}${(counter++).toString(36)}`

// 正解の周辺に重複しない不正解(ダミー選択肢)を作る
export function distractors(answer, count, spread = 3, min = 0) {
  const set = new Set([answer])
  let guard = 0
  while (set.size < count + 1 && guard++ < 200) {
    const delta = rint(-spread, spread)
    const v = answer + delta
    if (v >= min && v !== answer) set.add(v)
  }
  const arr = [...set]
  return shuffle(arr)
}
