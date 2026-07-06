// 全単元・全テンプレートの生成妥当性テスト。
// 出題ミスは子どもの信頼を直撃するため、大量生成して答え・選択肢の整合性を検証する。
import { describe, it, expect } from 'vitest'
import { gradeList } from '../data/index.js'
import { subNumpad, addNumpad, makeTen, threeTerm, wordExpr, wordAnswer, clockSet, graphRead, yomi } from './generators.js'
import { divideRemainder, divideShare, divideNumpad, fractionSameDenom } from './generators3.js'
import { checkAnswer, fractionValue } from './session.js'

const N = 300

// "3 + 2 - 1 = □" 形式の式を左から順に評価する(小学校の計算順)
function evalPrompt(prompt) {
  const m = prompt.match(/^(\d+(?: [+\-×] \d+)+) = □$/)
  if (!m) return null
  const tokens = m[1].split(' ')
  let acc = Number(tokens[0])
  const steps = [acc]
  for (let i = 1; i < tokens.length; i += 2) {
    const op = tokens[i]
    const v = Number(tokens[i + 1])
    acc = op === '+' ? acc + v : op === '-' ? acc - v : acc * v
    steps.push(acc)
  }
  return { result: acc, steps }
}

describe('全単元テンプレートの生成妥当性', () => {
  for (const grade of gradeList) {
    for (const unit of grade.units) {
      it(`${grade.id} ${unit.id} ${unit.title}`, () => {
        for (const t of unit.templates) {
          for (let i = 0; i < N; i++) {
            const p = t.make()
            // 基本形
            expect(p.prompt, `${unit.id} prompt`).toBeTruthy()
            expect(p.answer, `${unit.id} answer (prompt: ${p.prompt})`).not.toBeUndefined()
            expect(p.answer).not.toBeNull()
            // 選択肢:正解を含み、重複がない(オブジェクト答えの単元は選択肢を持たない)
            if (p.data?.choices) {
              const keys = p.data.choices.map((c) => (typeof c === 'object' ? JSON.stringify(c) : String(c)))
              expect(keys, `${unit.id} choices に正解なし: ${p.prompt} → ${JSON.stringify(p.answer)}`).toContain(
                typeof p.answer === 'object' ? JSON.stringify(p.answer) : String(p.answer),
              )
              expect(new Set(keys).size, `${unit.id} choices 重複: ${p.data.choices}`).toBe(keys.length)
              expect(p.data.choices.length).toBeGreaterThanOrEqual(2)
            }
            // オブジェクト答え(商あまり・分数)は必要フィールドが有効な数
            if (p.answer && typeof p.answer === 'object') {
              if ('q' in p.answer) {
                expect(Number.isInteger(p.answer.q) && Number.isInteger(p.answer.r), `${unit.id} q/r 不正: ${p.prompt}`).toBe(true)
              } else {
                expect(Number.isInteger(p.answer.num) && p.answer.den > 0, `${unit.id} 分数不正: ${p.prompt}`).toBe(true)
              }
            }
            // 式問題:左から評価した結果が答えと一致し、途中結果が負にならない
            const ev = evalPrompt(p.prompt)
            if (ev && typeof p.answer === 'number') {
              expect(ev.result, `${unit.id} 式と答えの不一致: ${p.prompt} → ${p.answer}`).toBe(p.answer)
              for (const s of ev.steps) expect(s, `${unit.id} 途中で負: ${p.prompt}`).toBeGreaterThanOrEqual(0)
            }
          }
        }
      })
    }
  }
})

describe('くり上がり・くり下がりの単元制約', () => {
  it('carry:true のたし算は必ず和が10をこえる', () => {
    const t = addNumpad({ min: 2, max: 9, sumMax: 18, difficulty: 2, carry: true })
    for (let i = 0; i < N; i++) {
      const p = t.make()
      expect(p.answer).toBeGreaterThan(10)
    }
  })
  it('borrow:true のひき算は必ずくり下がりが起きる', () => {
    const t = subNumpad({ min: 11, max: 18, difficulty: 2, borrow: true })
    for (let i = 0; i < N; i++) {
      const p = t.make()
      const [a, b] = p.prompt.match(/\d+/g).map(Number)
      expect(a).toBeGreaterThanOrEqual(11)
      expect(b).toBeLessThanOrEqual(9)
      expect(a % 10, `くり下がりなし: ${p.prompt}`).toBeLessThan(b)
      expect(p.answer).toBe(a - b)
    }
  })
  it('makeTen は 10の分解が成り立つ数を出す', () => {
    const t = makeTen()
    for (let i = 0; i < N; i++) {
      const p = t.make()
      expect(p.data.a + p.data.b).toBe(p.answer)
      expect(p.answer).toBeGreaterThan(10)
      expect(p.data.a).toBeGreaterThanOrEqual(6)
    }
  })
})

describe('3つのかずのけいさん', () => {
  for (const pattern of ['++', '+-', '--', '-+', 'mix']) {
    it(`pattern=${pattern} は途中結果も答えも0以上`, () => {
      const t = threeTerm({ pattern })
      for (let i = 0; i < N; i++) {
        const p = t.make()
        const ev = evalPrompt(p.prompt)
        expect(ev).not.toBeNull()
        expect(ev.result).toBe(p.answer)
        for (const s of ev.steps) expect(s, `途中で負: ${p.prompt}`).toBeGreaterThanOrEqual(0)
      }
    })
  }
  it('tenFriendly は10になるペアを含む', () => {
    const t = threeTerm({ pattern: '++', tenFriendly: true })
    for (let i = 0; i < N; i++) {
      const p = t.make()
      const [a, b, c] = p.prompt.match(/\d+/g).map(Number)
      expect(a + b === 10 || a + c === 10 || b + c === 10, `10のペアなし: ${p.prompt}`).toBe(true)
    }
  })
})

describe('文章題', () => {
  it('wordExpr の正解の式を計算すると場面の答えになり、式の選択肢は互いに異なる', () => {
    const t = wordExpr({})
    for (let i = 0; i < N; i++) {
      const p = t.make()
      const [a, op, b] = p.answer.split(' ')
      const v = op === '+' ? Number(a) + Number(b) : Number(a) - Number(b)
      expect(v).toBeGreaterThanOrEqual(0)
      expect(p.data.choices).toContain(p.answer)
      expect(new Set(p.data.choices).size).toBe(p.data.choices.length)
    }
  })
  it('wordAnswer(carry) は答えが0以上、くり上がり/くり下がりを含む', () => {
    const t = wordAnswer({ carry: true })
    for (let i = 0; i < N; i++) {
      const p = t.make()
      expect(Number.isInteger(p.answer)).toBe(true)
      expect(p.answer).toBeGreaterThanOrEqual(0)
    }
  })
})

describe('とけい・グラフ・大きな数', () => {
  it('clockSet の答えは h:m 形式で、mはきざみの倍数', () => {
    for (const opts of [{ half: true }, { minutes: true }]) {
      const t = clockSet(opts)
      for (let i = 0; i < N; i++) {
        const p = t.make()
        const [h, m] = p.answer.split(':').map(Number)
        expect(h).toBeGreaterThanOrEqual(1)
        expect(h).toBeLessThanOrEqual(12)
        expect(m % p.data.step).toBe(0)
      }
    }
  })
  it('graphRead の「いちばん多い」は1つに決まる', () => {
    const t = graphRead()
    for (let i = 0; i < N; i++) {
      const p = t.make()
      const sorted = [...p.data.items].sort((x, y) => y.value - x.value)
      expect(sorted[0].value, 'タイで答えが曖昧').toBeGreaterThan(sorted[1].value)
      if (p.data.question === 'most') {
        expect(p.answer).toBe(sorted[0].label)
      }
    }
  })
  it('yomi は代表値を正しく読む', () => {
    expect(yomi(15)).toBe('じゅう ご')
    expect(yomi(48)).toBe('よんじゅう はち')
    expect(yomi(300)).toBe('さんびゃく')
    expect(yomi(305)).toBe('さんびゃく ご')
    expect(yomi(600)).toBe('ろっぴゃく')
    expect(yomi(811)).toBe('はっぴゃく じゅう いち')
    expect(yomi(3050)).toBe('さんぜん ごじゅう')
    expect(yomi(8000)).toBe('はっせん')
    expect(yomi(10000)).toBe('いちまん')
  })
})

describe('3年 わり算・小数・分数の制約', () => {
  it('あまりのあるわり算は 0 < あまり < わる数、わる数×商+あまり=わられる数', () => {
    const t = divideRemainder()
    for (let i = 0; i < N; i++) {
      const p = t.make()
      const [a, b] = p.prompt.match(/\d+/g).map(Number)
      const { q, r } = p.answer
      expect(r).toBeGreaterThan(0)
      expect(r, `あまりがわる数以上: ${p.prompt}`).toBeLessThan(b)
      expect(b * q + r).toBe(a)
    }
  })
  it('わり算(操作/数式)はわりきれ、商が正しい', () => {
    for (const t of [divideShare({ mode: 'equal' }), divideShare({ mode: 'group' }), divideNumpad({ max: 45 })]) {
      for (let i = 0; i < N; i++) {
        const p = t.make()
        expect(Number.isInteger(p.answer)).toBe(true)
        expect(p.answer).toBeGreaterThan(0)
      }
    }
  })
  it('同分母分数は分母不変・分子が正、答えは分数オブジェクト', () => {
    const t = fractionSameDenom()
    for (let i = 0; i < N; i++) {
      const p = t.make()
      expect(p.answer.den).toBeGreaterThan(1)
      expect(p.answer.num).toBeGreaterThan(0)
      expect(fractionValue(p.answer)).toBeGreaterThan(0)
    }
  })
  it('checkAnswer は等価分数・商あまり・小数を正しく判定', () => {
    expect(checkAnswer({ answer: { num: 3, den: 4 } }, { num: 6, den: 8 })).toBe(true)
    expect(checkAnswer({ answer: { num: 3, den: 4 } }, { num: 3, den: 4 })).toBe(true)
    expect(checkAnswer({ answer: { num: 3, den: 4 } }, { num: 2, den: 4 })).toBe(false)
    expect(checkAnswer({ answer: { q: 3, r: 1 } }, { q: 3, r: 1 })).toBe(true)
    expect(checkAnswer({ answer: { q: 3, r: 1 } }, { q: 3, r: 2 })).toBe(false)
    expect(checkAnswer({ answer: 0.3 }, '0.30')).toBe(true)
    expect(checkAnswer({ answer: 0.3 }, '0.3')).toBe(true)
    expect(checkAnswer({ answer: 12 }, '12')).toBe(true)
  })
})
