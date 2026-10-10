// 小1「ちょうせん」ジェネレータの制約テスト。
// 教科書の発展内容(□の式・何十の計算・ぎゃくさん等)は数値の整合性が命なので、
// 大量生成して「式と答えの一致」「単元のねらいに合う数値範囲」を検証する。
import { describe, it, expect } from 'vitest'
import { gradeList } from '../data/index.js'
import {
  blankEq,
  tensCalc,
  skipCount,
  neighborNum,
  superlative3,
  compareSums,
  wordHard,
  lineUpTotal,
  decomposeThree,
} from './generators1c.js'

const N = 400
const nums = (s) => (String(s).match(/\d+/g) ?? []).map(Number)

// "A op B = □" を評価
function evalBinary(prompt) {
  const m = prompt.match(/^(\d+) ([+-]) (\d+) = □$/)
  if (!m) return null
  const [a, b] = [Number(m[1]), Number(m[3])]
  return { a, b, op: m[2], value: m[2] === '+' ? a + b : a - b }
}

describe('blankEq(□を求める式)', () => {
  // 4つの形から答えを逆算する
  function solve(prompt) {
    let m = prompt.match(/^(\d+) \+ □ = (\d+)$/)
    if (m) return { form: 'add-right', ans: Number(m[2]) - Number(m[1]), big: Number(m[2]) }
    m = prompt.match(/^□ \+ (\d+) = (\d+)$/)
    if (m) return { form: 'add-left', ans: Number(m[2]) - Number(m[1]), big: Number(m[2]) }
    m = prompt.match(/^(\d+) - □ = (\d+)$/)
    if (m) return { form: 'sub-right', ans: Number(m[1]) - Number(m[2]), big: Number(m[1]) }
    m = prompt.match(/^□ - (\d+) = (\d+)$/)
    if (m) return { form: 'sub-left', ans: Number(m[1]) + Number(m[2]), big: Number(m[1]) + Number(m[2]) }
    return null
  }

  it('答えは式から逆算した値と一致し、4つの形が出る', () => {
    const t = blankEq({ ops: ['add', 'sub'], max: 10 })
    const forms = new Set()
    for (let i = 0; i < N; i++) {
      const p = t.make()
      const s = solve(p.prompt)
      expect(s, `未知の形: ${p.prompt}`).not.toBeNull()
      expect(p.answer, p.prompt).toBe(s.ans)
      expect(s.ans).toBeGreaterThanOrEqual(1)
      forms.add(s.form)
    }
    expect(forms.size).toBe(4)
  })

  it('max:10 のときは式の中の数がすべて10以下', () => {
    const t = blankEq({ ops: ['add', 'sub'], max: 10 })
    for (let i = 0; i < N; i++) {
      const p = t.make()
      for (const n of nums(p.prompt)) expect(n, p.prompt).toBeLessThanOrEqual(10)
      expect(p.answer).toBeLessThanOrEqual(10)
    }
  })

  it("ops:['add'] はたし算の形だけ、ops:['sub'] はひき算の形だけ", () => {
    const add = blankEq({ ops: ['add'] })
    const sub = blankEq({ ops: ['sub'] })
    for (let i = 0; i < N; i++) {
      expect(add.make().prompt).toContain('+')
      expect(sub.make().prompt).toContain('-')
    }
  })

  it('carry:true は くり上がり/くり下がりのある事実(合計11〜18)に限る', () => {
    const t = blankEq({ ops: ['add', 'sub'], carry: true })
    for (let i = 0; i < N; i++) {
      const p = t.make()
      const s = solve(p.prompt)
      expect(s.big, `和が11〜18でない: ${p.prompt}`).toBeGreaterThanOrEqual(11)
      expect(s.big).toBeLessThanOrEqual(18)
      for (const n of nums(p.prompt)) expect(n).toBeLessThanOrEqual(18)
    }
  })

  it('ヒント・かいせつ・読み上げが空でない', () => {
    const p = blankEq({}).make()
    expect(p.hints.length).toBeGreaterThanOrEqual(2)
    expect(p.explain).toBeTruthy()
    expect(p.speakText).toBeTruthy()
    expect(p.speakText).not.toContain('□')
  })
})

describe('tensCalc(何十・2けたの計算)', () => {
  it("kinds:['tens'] は10の倍数どうしで答えも10の倍数(0〜100)", () => {
    const t = tensCalc({ kinds: ['tens'] })
    for (let i = 0; i < N; i++) {
      const p = t.make()
      const e = evalBinary(p.prompt)
      expect(e, p.prompt).not.toBeNull()
      expect(e.a % 10).toBe(0)
      expect(e.b % 10).toBe(0)
      expect(p.answer).toBe(e.value)
      expect(e.value).toBeGreaterThan(0)
      expect(e.value).toBeLessThanOrEqual(100)
    }
  })

  it("kinds:['oneDigit'] は2けた±1けたで、くり上がり・くり下がりがない", () => {
    const t = tensCalc({ kinds: ['oneDigit'] })
    for (let i = 0; i < N; i++) {
      const p = t.make()
      const e = evalBinary(p.prompt)
      expect(e, p.prompt).not.toBeNull()
      expect(p.answer).toBe(e.value)
      const [big, small] = e.a >= 10 ? [e.a, e.b] : [e.b, e.a]
      expect(small, p.prompt).toBeLessThan(10)
      expect(big, p.prompt).toBeGreaterThanOrEqual(10)
      if (e.op === '+') {
        expect((big % 10) + small, `くり上がりあり: ${p.prompt}`).toBeLessThanOrEqual(9)
      } else {
        expect(e.a).toBeGreaterThanOrEqual(10) // ひく数は1けた側
        expect(e.a % 10, `くり下がりあり: ${p.prompt}`).toBeGreaterThanOrEqual(e.b)
      }
    }
  })

  it("kinds:['twoDigit'] は2けた±2けたで、くらいごとにくり上がり・くり下がりがない", () => {
    const t = tensCalc({ kinds: ['twoDigit'] })
    for (let i = 0; i < N; i++) {
      const p = t.make()
      const e = evalBinary(p.prompt)
      expect(e, p.prompt).not.toBeNull()
      expect(e.a).toBeGreaterThanOrEqual(10)
      expect(e.b).toBeGreaterThanOrEqual(10)
      expect(p.answer).toBe(e.value)
      const [ao, bo] = [e.a % 10, e.b % 10]
      const [at, bt] = [Math.floor(e.a / 10), Math.floor(e.b / 10)]
      if (e.op === '+') {
        expect(ao + bo, p.prompt).toBeLessThanOrEqual(9)
        expect(at + bt, p.prompt).toBeLessThanOrEqual(9)
      } else {
        expect(ao, p.prompt).toBeGreaterThanOrEqual(bo)
        expect(at, p.prompt).toBeGreaterThanOrEqual(bt)
        expect(e.value, p.prompt).toBeGreaterThan(0)
      }
    }
  })
})

describe('skipCount(かずのならび)', () => {
  function check(prompt, answer, max, allowedSteps) {
    const line = prompt.split('\n').pop()
    const parts = line.split('、')
    expect(parts.length, prompt).toBe(5)
    expect(parts.filter((x) => x === '□').length, prompt).toBe(1)
    const full = parts.map((x) => (x === '□' ? answer : Number(x)))
    const diffs = full.slice(1).map((v, i) => v - full[i])
    expect(new Set(diffs).size, `等差でない: ${prompt} → ${answer}`).toBe(1)
    expect(allowedSteps, prompt).toContain(Math.abs(diffs[0]))
    for (const v of full) {
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThanOrEqual(max)
    }
    return diffs[0]
  }

  it('100まで: 2・5・10とび(と1ずつへる)で、等差・範囲内', () => {
    const t = skipCount({ max: 100 })
    const seen = new Set()
    for (let i = 0; i < N; i++) {
      const p = t.make()
      seen.add(Math.abs(check(p.prompt, p.answer, 100, [1, 2, 5, 10])))
    }
    expect([...seen].sort((a, b) => a - b)).toEqual(expect.arrayContaining([2, 5, 10]))
  })

  it('20まで・上向きのみ(steps:[2,5], down:false)は増えるならびだけ', () => {
    const t = skipCount({ max: 20, steps: [2, 5], down: false })
    for (let i = 0; i < N; i++) {
      const p = t.make()
      const d = check(p.prompt, p.answer, 20, [2, 5])
      expect(d).toBeGreaterThan(0)
    }
  })

  it('答えが0になる空欄は作らない(「0」を空欄にすると子どもが戸惑うため)', () => {
    const t = skipCount({ max: 20, steps: [2, 5], down: false })
    for (let i = 0; i < N; i++) expect(t.make().answer).toBeGreaterThan(0)
  })
})

describe('neighborNum(つぎ・まえ・あいだ)', () => {
  it('つぎ=+1、まえ=-1、あいだ=真ん中で、範囲内', () => {
    for (const max of [10, 20, 100]) {
      const t = neighborNum({ max })
      const kinds = new Set()
      for (let i = 0; i < N; i++) {
        const p = t.make()
        let m = p.prompt.match(/^(\d+)の つぎの かずは\?$/)
        if (m) {
          kinds.add('next')
          expect(p.answer).toBe(Number(m[1]) + 1)
        } else if ((m = p.prompt.match(/^(\d+)の まえの かずは\?$/))) {
          kinds.add('prev')
          expect(p.answer).toBe(Number(m[1]) - 1)
        } else if ((m = p.prompt.match(/^(\d+)と (\d+)の あいだの かずは\?$/))) {
          kinds.add('between')
          expect(Number(m[2]) - Number(m[1])).toBe(2)
          expect(p.answer).toBe(Number(m[1]) + 1)
        } else {
          throw new Error(`未知の形: ${p.prompt}`)
        }
        expect(p.answer).toBeGreaterThanOrEqual(0)
        expect(p.answer).toBeLessThanOrEqual(max)
        for (const n of nums(p.prompt)) expect(n).toBeLessThanOrEqual(max)
      }
      expect(kinds.size).toBe(3)
    }
  })
})

describe('superlative3(3つのかずをくらべる)', () => {
  it('3つは異なる数で、正解は選択肢に含まれ、大小の判定が正しい', () => {
    for (const max of [10, 100]) {
      const t = superlative3({ max })
      const kinds = new Set()
      for (let i = 0; i < N; i++) {
        const p = t.make()
        const [first, second] = p.prompt.split('\n')
        const ns = first.split('、').map(Number)
        expect(ns.length).toBe(3)
        expect(new Set(ns).size).toBe(3)
        for (const n of ns) {
          expect(n).toBeGreaterThanOrEqual(1)
          expect(n).toBeLessThanOrEqual(max)
        }
        const sorted = [...ns].sort((a, b) => a - b)
        if (second.includes('おおきい')) {
          kinds.add('max')
          expect(p.answer).toBe(sorted[2])
        } else if (second.includes('ちいさい')) {
          kinds.add('min')
          expect(p.answer).toBe(sorted[0])
        } else {
          kinds.add('mid')
          expect(second).toContain('まんなか')
          expect(p.answer).toBe(sorted[1])
        }
        expect([...p.data.choices].sort((a, b) => a - b)).toEqual(sorted)
      }
      expect(kinds.size).toBe(3)
    }
  })
})

describe('compareSums(しきをくらべる)', () => {
  const calc = (e) => {
    const m = e.match(/^(\d+) ([+-]) (\d+)$/)
    return m[2] === '+' ? Number(m[1]) + Number(m[3]) : Number(m[1]) - Number(m[3])
  }

  it('正解は くらべた結果と一致し、選択肢は3つで重複しない', () => {
    const t = compareSums({ sumMax: 18 })
    let sawEqual = false
    for (let i = 0; i < N; i++) {
      const p = t.make()
      const [head, line] = p.prompt.split('\n')
      const [e1, e2] = line.split(' と ')
      expect(calc(e1)).toBeGreaterThanOrEqual(0)
      expect(calc(e2)).toBeGreaterThanOrEqual(0)
      expect(e1, `同じ式: ${p.prompt}`).not.toBe(e2)
      const [v1, v2] = [calc(e1), calc(e2)]
      const bigger = head.includes('おおきい')
      let expected
      if (v1 === v2) {
        expected = 'おなじ'
        sawEqual = true
      } else if (bigger) {
        expected = v1 > v2 ? e1 : e2
      } else {
        expected = v1 < v2 ? e1 : e2
      }
      expect(p.answer, p.prompt).toBe(expected)
      expect(p.data.choices.length).toBe(3)
      expect(new Set(p.data.choices).size).toBe(3)
      expect(p.data.choices).toContain(p.answer)
      expect(p.data.choices).toContain('おなじ')
      for (const n of nums(p.prompt)) expect(n).toBeLessThanOrEqual(18)
    }
    expect(sawEqual, 'おなじ答えの問題が1度も出ない').toBe(true)
  })
})

describe('wordHard(2だんかいの文章題・ぎゃくさん)', () => {
  it('twoStep: もらって→たべた は a+b-c、たべて→もらった は a-b+c', () => {
    const t = wordHard({ kinds: ['twoStep'] })
    const seen = new Set()
    for (let i = 0; i < N; i++) {
      const p = t.make()
      let m = p.prompt.match(/(\d+)こ ありました。\n(\d+)こ もらって、(\d+)こ たべました/)
      let expected
      if (m) {
        seen.add('gain')
        expected = Number(m[1]) + Number(m[2]) - Number(m[3])
      } else if ((m = p.prompt.match(/(\d+)こ ありました。\n(\d+)こ たべて、(\d+)こ もらいました/))) {
        seen.add('lose')
        expect(Number(m[1])).toBeGreaterThan(Number(m[2])) // たべる数は あった数より少ない
        expected = Number(m[1]) - Number(m[2]) + Number(m[3])
      } else {
        throw new Error(`未知の形: ${p.prompt}`)
      }
      expect(p.answer, p.prompt).toBe(expected)
      expect(p.answer).toBeGreaterThanOrEqual(1)
      expect(p.answer).toBeLessThanOrEqual(18)
    }
    expect(seen.size).toBe(2)
  })

  it('reverse: たべたら/もらったら から「はじめの数」を逆算できる', () => {
    const t = wordHard({ kinds: ['reverse'] })
    const seen = new Set()
    for (let i = 0; i < N; i++) {
      const p = t.make()
      let m = p.prompt.match(/(\d+)こ たべたら、(\d+)こ のこりました/)
      if (m) {
        seen.add('eaten')
        expect(p.answer, p.prompt).toBe(Number(m[1]) + Number(m[2]))
      } else if ((m = p.prompt.match(/(\d+)こ もらったら、ぜんぶで (\d+)こに なりました/))) {
        seen.add('received')
        expect(p.answer, p.prompt).toBe(Number(m[2]) - Number(m[1]))
      } else {
        throw new Error(`未知の形: ${p.prompt}`)
      }
      expect(p.answer).toBeGreaterThanOrEqual(1)
      expect(p.answer).toBeLessThanOrEqual(18)
    }
    expect(seen.size).toBe(2)
  })
})

describe('単元の範囲に合わせた上限(習っていない大きさの数を出さない)', () => {
  it('wordHard({sumMax:10}) は途中の和・答えがすべて10以下', () => {
    const t = wordHard({ kinds: ['twoStep', 'reverse'], sumMax: 10 })
    for (let i = 0; i < N * 3; i++) {
      const p = t.make()
      const ns = nums(p.prompt)
      expect(p.answer, p.prompt).toBeLessThanOrEqual(10)
      expect(p.answer).toBeGreaterThanOrEqual(1)
      for (const n of ns) expect(n, p.prompt).toBeLessThanOrEqual(10)
      let m = p.prompt.match(/(\d+)こ ありました。\n(\d+)こ もらって/)
      if (m) expect(Number(m[1]) + Number(m[2]), `途中が10超: ${p.prompt}`).toBeLessThanOrEqual(10)
      m = p.prompt.match(/(\d+)こ たべたら、(\d+)こ のこりました/)
      if (m) expect(Number(m[1]) + Number(m[2]), p.prompt).toBeLessThanOrEqual(10)
    }
  })

  it('lineUpTotal({max:10}) は 答え(みんなの人数)が10以下で、まえ・うしろは2ばんめ以上', () => {
    const t = lineUpTotal({ max: 10 })
    for (let i = 0; i < N * 3; i++) {
      const p = t.make()
      const m = p.prompt.match(/まえから (\d+)ばんめ、うしろから (\d+)ばんめ/)
      expect(p.answer, p.prompt).toBe(Number(m[1]) + Number(m[2]) - 1)
      expect(p.answer).toBeLessThanOrEqual(10)
      expect(Number(m[1])).toBeGreaterThanOrEqual(2)
      expect(Number(m[2])).toBeGreaterThanOrEqual(2)
    }
  })

  it('1-2「なんばんめ」と 1-13「3つのかず」の難問は 10までの数におさまる', () => {
    const byId = Object.fromEntries(gradeList.flatMap((g) => g.units).map((u) => [u.id, u]))
    for (const id of ['1-2', '1-13']) {
      for (const t of byId[id].templates.filter((x) => x.difficulty === 3)) {
        for (let i = 0; i < N; i++) {
          const p = t.make()
          if (typeof p.answer === 'number') expect(p.answer, `${id}: ${p.prompt}`).toBeLessThanOrEqual(10)
        }
      }
    }
  })
})

describe('テンプレートIDの安定性(まちがい履歴のキーなので、ずれると弱点がべつの問題に付け替わる)', () => {
  it('IDを指定したテンプレートは 共通の連番を進めない(後ろのIDがずれない)', async () => {
    const { decompose } = await import('./generators.js')
    const a = decompose(5)
    const fixed = decompose(8, 2, 'g1-decomp-8-2')
    const b = decompose(5)
    expect(fixed.id).toBe('g1-decomp-8-2')
    expect(Number(b.id.slice(1))).toBe(Number(a.id.slice(1)) + 1)
  })

  it('1-3 に足した分解の問題には 固定IDがついている', () => {
    const u = gradeList.flatMap((g) => g.units).find((x) => x.id === '1-3')
    const ids = u.templates.map((t) => t.id)
    expect(ids).toContain('g1-decomp-8-2')
    expect(ids).toContain('g1-decomp-9-2')
  })
})

describe('lineUpTotal(まえから○ばん・うしろから△ばん)', () => {
  it('答えは ○+△-1(じぶんを2回かぞえない)', () => {
    const t = lineUpTotal()
    for (let i = 0; i < N; i++) {
      const p = t.make()
      const m = p.prompt.match(/まえから (\d+)ばんめ、うしろから (\d+)ばんめ/)
      expect(m, p.prompt).not.toBeNull()
      expect(p.answer).toBe(Number(m[1]) + Number(m[2]) - 1)
      expect(Number(m[1])).toBeGreaterThanOrEqual(2)
      expect(Number(m[2])).toBeGreaterThanOrEqual(2)
    }
  })
})

describe('decomposeThree(3つにわける)', () => {
  it('total = a + b + 答え で、答えは1以上', () => {
    for (const total of [10, 15]) {
      const t = decomposeThree({ total })
      for (let i = 0; i < N; i++) {
        const p = t.make()
        const m = p.prompt.match(/^(\d+)は (\d+)と (\d+)と □$/)
        expect(m, p.prompt).not.toBeNull()
        expect(Number(m[1])).toBe(total)
        expect(p.answer).toBe(total - Number(m[2]) - Number(m[3]))
        expect(p.answer).toBeGreaterThanOrEqual(1)
      }
    }
  })
})

describe('ちょうせん単元の組み込み', () => {
  const units = gradeList.flatMap((g) => g.units)
  const byId = Object.fromEntries(units.map((u) => [u.id, u]))

  it('1年に「ちょうせん」単元(1-15, 1-16)があり、challengeフラグ・あいことば・レッスンを持つ', () => {
    for (const id of ['1-15', '1-16']) {
      const u = byId[id]
      expect(u, `${id} がない`).toBeTruthy()
      expect(u.challenge).toBe(true)
      expect(u.aikotoba).toBeTruthy()
      expect(u.lessons.length).toBeGreaterThanOrEqual(6)
      expect(u.templates.length).toBeGreaterThanOrEqual(5)
    }
  })

  it('ちょうせん単元は やさしい(1)〜むずかしい(3)まで段階的に出題できる', () => {
    for (const id of ['1-15', '1-16']) {
      const levels = new Set(byId[id].templates.map((t) => t.difficulty))
      expect(levels.has(1) || levels.has(2), `${id} 入口の問題がない`).toBe(true)
      expect(levels.has(3), `${id} 難問がない`).toBe(true)
    }
  })

  it('既存の1年単元にも難易度3の問題が追加され、理解度が上がるほど難しくなる', () => {
    for (const id of ['1-1', '1-2', '1-3', '1-4', '1-5', '1-6', '1-7', '1-8', '1-12', '1-13']) {
      const hard = byId[id].templates.filter((t) => t.difficulty >= 2)
      expect(hard.length, `${id} に難しめの問題がない`).toBeGreaterThanOrEqual(1)
    }
    for (const id of ['1-3', '1-4', '1-5', '1-6', '1-7', '1-8', '1-12', '1-13', '1-2']) {
      expect(byId[id].templates.some((t) => t.difficulty === 3), `${id} に難問(3)がない`).toBe(true)
    }
  })

  it('単元IDは全学年で一意、前提単元IDはすべて実在する', () => {
    const ids = units.map((u) => u.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const u of units) {
      for (const pid of u.prerequisiteUnitIds ?? []) {
        expect(byId[pid], `${u.id} の前提 ${pid} が存在しない`).toBeTruthy()
      }
    }
  })

  it('テンプレIDは全単元で一意(間違い履歴のキーに使うため)', () => {
    const ids = units.flatMap((u) => u.templates.map((t) => t.id))
    // 同じテンプレ実体を複数単元で共有しているものは重複を許す(例: インラインの longerCompare)
    const dup = ids.filter((id, i) => ids.indexOf(id) !== i)
    const sharedOk = new Set(['g1-longer', 'g2-box'])
    expect(dup.filter((id) => !sharedOk.has(id))).toEqual([])
  })
})
