// 出題選択エンジン(§6.4)。単元の現在レベルと弱点履歴から次の問題を組み立てる。
import { uid, shuffle } from './rng.js'

// 現在レベルに合うテンプレを選ぶ(弱点・サブスキルを加重)
export function pickTemplate(unit, { level, wrongHistory, subSkillProgress }) {
  const templates = unit.templates
  // レベルに近いものを優先(なければ全体)
  let pool = templates.filter((t) => t.difficulty <= level)
  if (pool.length === 0) pool = templates

  const weighted = pool.map((t) => {
    let w = 1
    // 弱点履歴:間違いが多いテンプレを加重
    const wh = wrongHistory[t.id]
    if (wh) w += Math.min(4, wh.count)
    // 九九などサブスキル:スコアが低い段を加重
    if (t.subSkill) {
      const s = subSkillProgress[t.subSkill]?.masteryScore ?? 0
      w += Math.max(0, (60 - s) / 20)
    }
    // 現レベルにちょうど合うものを少し優先
    if (t.difficulty === level) w += 0.5
    return { t, w }
  })

  const total = weighted.reduce((s, x) => s + x.w, 0)
  let r = Math.random() * total
  for (const x of weighted) {
    r -= x.w
    if (r <= 0) return x.t
  }
  return weighted[weighted.length - 1].t
}

// テンプレから1問インスタンスを生成
export function buildProblem(template) {
  const inst = template.make()
  return {
    id: uid(),
    templateId: template.id,
    type: template.type,
    difficulty: template.difficulty,
    subSkill: template.subSkill || inst.subSkill,
    prompt: inst.prompt,
    speakText: inst.speakText || inst.prompt,
    answer: inst.answer,
    data: inst.data || {},
    hints: inst.hints || [],
    explain: inst.explain || '',
  }
}

// 直近と重複しない1問(§6.4 手順4)
export function nextProblem(unit, ctx, recentPrompts = []) {
  for (let i = 0; i < 8; i++) {
    const t = pickTemplate(unit, ctx)
    const p = buildProblem(t)
    if (!recentPrompts.includes(p.prompt)) return p
  }
  return buildProblem(pickTemplate(unit, ctx))
}

// 10問セッションを作る
export function buildSession(unit, ctx, count = 10) {
  const problems = []
  const recent = []
  for (let i = 0; i < count; i++) {
    const p = nextProblem(unit, ctx, recent.slice(-5))
    problems.push(p)
    recent.push(p.prompt)
  }
  return problems
}

// 分数・帯分数の値(小数)を返す。無効なら null。
// 対応: { num, den } / { whole, num, den } / "3/4" / "1 2/3"
export function fractionValue(v) {
  if (v == null) return null
  if (typeof v === 'object') {
    const whole = Number(v.whole || 0)
    const num = Number(v.num)
    const den = Number(v.den)
    if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) return null
    const sign = whole < 0 ? -1 : 1
    return whole + sign * (num / den)
  }
  const s = String(v).trim()
  const mixed = s.match(/^(-?\d+)\s+(\d+)\/(\d+)$/)
  if (mixed) {
    const w = Number(mixed[1])
    return w + (w < 0 ? -1 : 1) * (Number(mixed[2]) / Number(mixed[3]))
  }
  const frac = s.match(/^(-?\d+)\/(\d+)$/)
  if (frac) {
    if (Number(frac[2]) === 0) return null
    return Number(frac[1]) / Number(frac[2])
  }
  const num = Number(s)
  return Number.isFinite(num) ? num : null
}

function gcd(a, b) {
  while (b) [a, b] = [b, a % b]
  return a
}

// これ以上約分できるか(約分をうながすバナー用)。given が分数オブジェクトのときのみ意味を持つ。
export function canReduce(v) {
  if (v == null || typeof v !== 'object' || v.num == null || v.den == null) return false
  const g = gcd(Math.abs(Number(v.num)), Math.abs(Number(v.den)))
  return g > 1 && Number(v.den) !== 0
}

// 回答チェック(型を吸収して比較)
export function checkAnswer(problem, given) {
  const a = problem.answer
  // 商とあまり: { q, r }
  if (a && typeof a === 'object' && 'q' in a) {
    return Number(given?.q) === Number(a.q) && Number(given?.r) === Number(a.r)
  }
  // 分数・帯分数: 値が一致すれば等価分数(6/8 と 3/4 など)も正解
  if (a && typeof a === 'object') {
    const av = fractionValue(a)
    const gv = fractionValue(given)
    return av != null && gv != null && Math.abs(av - gv) < 1e-9
  }
  // 数(小数含む): 0.30 と 0.3 は一致
  if (typeof a === 'number') return Number(given) === a
  return String(given) === String(a)
}

export { shuffle }
