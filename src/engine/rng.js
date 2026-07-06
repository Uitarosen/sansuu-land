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

// 正解 + 誤概念ベースの候補から、重複のない選択肢セットを作る。
// 候補が足りなければ数値のみ乱数で補完する(3〜6年ジェネレータ共通)。
export function buildChoices(answer, candidates = [], count = 3, spread = 3, min = 0) {
  const key = (v) => (typeof v === 'number' ? String(v) : JSON.stringify(v))
  const seen = new Set([key(answer)])
  const out = [answer]
  for (const c of candidates) {
    if (out.length >= count) break
    if (c == null) continue
    if (typeof c === 'number' && c < min) continue
    const k = key(c)
    if (!seen.has(k)) {
      seen.add(k)
      out.push(c)
    }
  }
  let guard = 0
  while (out.length < count && guard++ < 300 && typeof answer === 'number') {
    const v = answer + rint(-spread, spread)
    if (v >= min && !seen.has(key(v))) {
      seen.add(key(v))
      out.push(v)
    }
  }
  return shuffle(out)
}

// プレフィックス付きのテンプレIDを振るファクトリ。学年ごとにIDが衝突しないようにする
// (テンプレIDは wrongHistory のキーになるため、学年間で重複させたくない)。
export function makeTmpl(prefix) {
  let n = 0
  return (o) => ({ id: `${prefix}-${n++}`, hints: [], ...o })
}
