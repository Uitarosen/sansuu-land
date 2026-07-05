// 問題テンプレートのファクトリ群(§6.4 / §6.5)。
// 各ファクトリは { type, difficulty, subSkill?, id, make() } を返す。
// make() は問題インスタンス { prompt, speakText?, answer, data, hints, explain } を返す。
import { rint, pick, shuffle, distractors } from './rng.js'

let tid = 0
const tmpl = (o) => ({ id: `t${tid++}`, hints: [], ...o })
const emojis = ['🍓', '🍎', '⭐', '🍪', '🧁', '🍬', '🌸', '🍒']

// ===== 数・かず =====
export const countTo = (max) =>
  tmpl({
    type: 'choice',
    difficulty: max <= 10 ? 1 : 2,
    make() {
      const n = rint(1, max)
      const e = pick(emojis)
      return {
        prompt: `${e.repeat(n)}\nいくつ あるかな?`,
        speakText: 'いくつ あるかな?',
        answer: n,
        data: { choices: distractors(n, 3, 2, 1), suffix: 'こ' },
        hints: ['ゆびで さして かぞえてみよう', `1、2、3…と かぞえると ${n}こ だよ`],
        explain: `ぜんぶで ${n}こ です`,
      }
    },
  })

export const compareNum = (max) =>
  tmpl({
    type: 'choice',
    difficulty: 1,
    make() {
      let a = rint(1, max)
      let b = rint(1, max)
      if (a === b) b = Math.max(1, b - 1)
      const big = Math.max(a, b)
      return {
        prompt: `${a} と ${b}\nおおきいのは どっち?`,
        speakText: `${a} と ${b}、おおきいのは どっち?`,
        answer: big,
        data: { choices: shuffle([a, b]) },
        hints: ['かずが 大きいほうが おおきいよ', 'かぞえる とき あとに いう ほうが 大きい かずだよ'],
        explain: `${big} のほうが おおきいね`,
      }
    },
  })

export const ordinal = () =>
  tmpl({
    type: 'choice',
    difficulty: 1,
    make() {
      const n = rint(1, 6)
      const line = emojis.slice(0, 6)
      const target = line[n - 1]
      return {
        prompt: `${line.join(' ')}\nまえから ${n}ばんめは どれ?`,
        speakText: `まえから ${n}ばんめは どれ?`,
        answer: target,
        data: { choices: shuffle(line), emoji: true },
        hints: ['ひだりから じゅんばんに かぞえよう', `いち、に…と ${n}まで かぞえた ところだよ`],
        explain: `まえから ${n}ばんめは ${target} だよ`,
      }
    },
  })

// ===== たしざん・ひきざん(numpad) =====
export const addNumpad = ({ min = 1, max = 9, sumMax = 10, difficulty = 1 }) =>
  tmpl({
    type: 'numpad',
    difficulty,
    make() {
      let a, b
      do {
        a = rint(min, max)
        b = rint(min, max)
      } while (a + b > sumMax)
      return {
        prompt: `${a} + ${b} = □`,
        speakText: `${a} たす ${b} は?`,
        answer: a + b,
        data: { suffix: '' },
        hints: [`${a}に ${b}を たすよ`, `ゆびで ${b}こ ふやしてみよう`],
        explain: `${a} + ${b} = ${a + b}`,
      }
    },
  })

export const subNumpad = ({ min = 1, max = 10, difficulty = 1, borrow = null }) =>
  tmpl({
    type: 'numpad',
    difficulty,
    make() {
      let a, b
      do {
        a = rint(min, max)
        b = rint(1, a)
      } while (borrow === true ? a % 10 >= b % 10 || a - b < 0 : false)
      return {
        prompt: `${a} - ${b} = □`,
        speakText: `${a} ひく ${b} は?`,
        answer: a - b,
        data: { suffix: '' },
        hints: [`${a}から ${b}を へらすよ`, `ゆびを ${a}ほん たてて、${b}ほん おってみよう`],
        explain: `${a} - ${b} = ${a - b}`,
      }
    },
  })

// いくつといくつ(合成・分解)
export const decompose = (total) =>
  tmpl({
    type: 'numpad',
    difficulty: 1,
    make() {
      const a = rint(1, total - 1)
      return {
        prompt: `${total}は ${a}と □`,
        speakText: `${total}は ${a}と いくつ?`,
        answer: total - a,
        data: { suffix: '' },
        hints: [`${a}に なにを たすと ${total}に なるかな`, `${total}から ${a}を ひいた かずだよ`],
        explain: `${total}は ${a}と ${total - a}`,
      }
    },
  })

// ===== ひっ算(hissan) =====
export const hissanAdd = ({ digits = 2, difficulty = 1 }) =>
  tmpl({
    type: 'hissan',
    difficulty,
    make() {
      const lo = digits === 3 ? 100 : 10
      const hi = digits === 3 ? 899 : 89
      let a = rint(lo, hi)
      let b = rint(lo, hi)
      // 難易度1は繰り上がりなしを狙う
      if (difficulty === 1) {
        b = rint(1, 9 - (a % 10))
        b += 10 * rint(1, Math.max(1, 8 - (Math.floor(a / 10) % 10)))
      }
      return {
        prompt: `${a} + ${b}`,
        speakText: `${a} たす ${b} を ひっさんで`,
        answer: a + b,
        data: { op: '+', a, b, digits },
        hints: ['一のくらいから じゅんに たそう', 'くり上がりは 上の くらいへ 1'],
        explain: `${a} + ${b} = ${a + b}`,
      }
    },
  })

export const hissanSub = ({ digits = 2, difficulty = 1 }) =>
  tmpl({
    type: 'hissan',
    difficulty,
    make() {
      const lo = digits === 3 ? 100 : 10
      const hi = digits === 3 ? 999 : 99
      let a = rint(lo + 10, hi)
      let b = rint(lo, a - 1)
      if (difficulty === 1 && b % 10 > a % 10) b -= b % 10 // 繰り下がりなしに寄せる
      if (b < 1) b = 1
      return {
        prompt: `${a} - ${b}`,
        speakText: `${a} ひく ${b} を ひっさんで`,
        answer: a - b,
        data: { op: '-', a, b, digits },
        hints: ['一のくらいから じゅんに ひこう', 'ひけない ときは 上のくらいから 10 かりる'],
        explain: `${a} - ${b} = ${a - b}`,
      }
    },
  })

// ===== 九九(kuku) =====
export const kuku = ({ dan = null, difficulty = 1 }) =>
  tmpl({
    type: 'kuku',
    difficulty,
    subSkill: dan ? `kuku-dan-${dan}` : undefined,
    make() {
      const a = dan ?? rint(1, 9)
      const b = rint(1, 9)
      const product = a * b
      const blank = difficulty >= 3 && Math.random() < 0.5 ? 'b' : null
      return {
        prompt: blank ? `${a} × □ = ${product}` : `${a} × ${b} = □`,
        speakText: blank ? `${a} かける なに は ${product}?` : `${a} かける ${b} は?`,
        answer: blank ? b : product,
        data: { a, b, product, blank, dan: a },
        hints: [`${a}のだんだよ`, `${a}、${a * 2}、${a * 3}… と となえてみよう`],
        explain: `${a} × ${b} = ${product}`,
      }
    },
  })

// ===== 単位(unitSelect / unitConvert) =====
export const unitSelect = (items) =>
  tmpl({
    type: 'choice',
    difficulty: 1,
    make() {
      const it = pick(items) // { thing, value, unit, options }
      return {
        prompt: `${it.thing}は\n${it.value} □`,
        speakText: `${it.thing}は ${it.value} なに?`,
        answer: it.unit,
        data: { choices: shuffle(it.options), unitChoice: true },
        hints: ['みぢかな ものの 大きさを おもいだそう', 'mmは とても 小さい、cmは 手のひらサイズ、mは 大きい ものだよ'],
        explain: `${it.thing}は ${it.value}${it.unit} だよ`,
      }
    },
  })

export const unitConvert = (pairs) =>
  tmpl({
    type: 'numpad',
    difficulty: 2,
    make() {
      const p = pick(pairs) // { from:[val,unit], to:unit, factor }
      const val = rint(1, 9) * (p.round || 1)
      return {
        prompt: `${val}${p.fromUnit} = □${p.toUnit}`,
        speakText: `${val}${p.fromUnit}は なん${p.toUnit}?`,
        answer: val * p.factor,
        data: { suffix: p.toUnit },
        hints: [`1${p.fromUnit} = ${p.factor}${p.toUnit} だよ`, `${val}に ${p.factor}を かけた かずに なるよ`],
        explain: `${val}${p.fromUnit} = ${val * p.factor}${p.toUnit}`,
      }
    },
  })

// ===== とけい(clock) =====
export const clockRead = ({ half = false, minutes = false }) =>
  tmpl({
    type: 'clock',
    difficulty: minutes ? 2 : 1,
    make() {
      const hour = rint(1, 12)
      const minute = minutes ? rint(0, 11) * 5 : half ? pick([0, 30]) : 0
      const label = `${hour}じ${minute === 0 ? '' : minute === 30 ? 'はん' : minute + 'ふん'}`
      const opts = new Set([label])
      while (opts.size < 3) {
        const h = rint(1, 12)
        const m = minutes ? rint(0, 11) * 5 : pick([0, 30])
        opts.add(`${h}じ${m === 0 ? '' : m === 30 ? 'はん' : m + 'ふん'}`)
      }
      return {
        prompt: 'いま なんじ?',
        speakText: 'とけいは なんじ かな?',
        answer: label,
        data: { mode: 'read', hour, minute, choices: shuffle([...opts]) },
        hints: ['みじかい はりが「じ」、ながい はりが「ふん」', `みじかい はりは ${hour}を さしているね`],
        explain: `${label} だよ`,
      }
    },
  })

export const clockElapsed = () =>
  tmpl({
    type: 'clock',
    difficulty: 3,
    make() {
      const hour = rint(1, 11)
      const minute = pick([0, 10, 15, 20, 30])
      const add = pick([10, 15, 20, 30])
      let m = minute + add
      let h = hour
      if (m >= 60) {
        m -= 60
        h += 1
      }
      const label = `${h}じ${m === 0 ? '' : m + 'ふん'}`
      const opts = new Set([label])
      while (opts.size < 3) {
        const hh = rint(1, 12)
        const mm = pick([0, 10, 15, 20, 30, 40])
        opts.add(`${hh}じ${mm === 0 ? '' : mm + 'ふん'}`)
      }
      return {
        prompt: `いまは ${hour}じ${minute === 0 ? '' : minute + 'ふん'}。\n${add}ぷん あとは?`,
        speakText: `${hour}じ${minute}ふんの ${add}ふん あとは なんじ?`,
        answer: label,
        data: { mode: 'read', hour, minute, choices: shuffle([...opts]) },
        hints: [`ながい はりを ${add}ふん すすめよう`, `${minute}ふんに ${add}を たすと なんぷんに なるかな`],
        explain: `${add}ぷん あとは ${label}`,
      }
    },
  })

// ===== 図形(shapeTap) =====
export const shapeTap = (targets) =>
  tmpl({
    type: 'shapeTap',
    difficulty: 1,
    make() {
      const target = pick(targets) // { kind, label }
      const others = shuffle(['triangle', 'square', 'rectangle', 'circle', 'righttriangle'])
        .filter((k) => k !== target.kind)
        .slice(0, 3)
      const shapes = shuffle([target.kind, ...others])
      return {
        prompt: `${target.label}は どれ?`,
        speakText: `${target.label}は どれ かな?`,
        answer: target.kind,
        data: { shapes },
        hints: ['かどの かずを かぞえてみよう', 'へんの ながさや 直角にも ちゅうもくしてみよう'],
        explain: `これが ${target.label} だよ`,
      }
    },
  })

// ===== テープ図(tapeDiagram) =====
export const tapeDiagram = ({ op = '+' }) =>
  tmpl({
    type: 'tape',
    difficulty: 2,
    make() {
      const a = rint(3, 20)
      const b = rint(2, 15)
      if (op === '+') {
        return {
          prompt: `あかい はなが ${a}本、しろい はなが ${b}本。\nあわせて なん本?`,
          speakText: `あわせて なん本?`,
          answer: a + b,
          data: { parts: [a, b], whole: null, blankAt: 'whole', suffix: '本' },
          hints: ['テープ図で あわせた 長さが こたえ', `しきは ${a}+${b} だよ`],
          explain: `${a} + ${b} = ${a + b}本`,
        }
      }
      const whole = a + b
      return {
        prompt: `はなが ${whole}本 あります。${a}本 つかうと のこりは?`,
        speakText: `のこりは なん本?`,
        answer: b,
        data: { parts: [a, null], whole, blankAt: 'part', suffix: '本' },
        hints: ['ぜんたいから つかった ぶんを ひくよ', `しきは ${whole}-${a} だよ`],
        explain: `${whole} - ${a} = ${b}本`,
      }
    },
  })

// ===== グラフ(graphRead) =====
export const graphRead = () =>
  tmpl({
    type: 'graph',
    difficulty: 1,
    make() {
      const cats = shuffle([
        { label: 'いちご', emoji: '🍓' },
        { label: 'ぶどう', emoji: '🍇' },
        { label: 'りんご', emoji: '🍎' },
        { label: 'みかん', emoji: '🍊' },
      ]).slice(0, 4)
      const items = cats.map((c) => ({ ...c, value: rint(1, 8) }))
      const mode = pick(['count', 'most'])
      if (mode === 'most') {
        const top = [...items].sort((a, b) => b.value - a.value)[0]
        return {
          prompt: 'いちばん おおいのは どれ?',
          speakText: 'いちばん おおいのは どれ かな?',
          answer: top.label,
          data: { items, question: 'most', choiceMode: true, choices: shuffle(items.map((i) => i.label)) },
          hints: ['グラフの 一番 たかいのを さがそう', 'ぼうの 上の 数字も みてごらん'],
          explain: `${top.label}が いちばん おおいね`,
        }
      }
      const target = pick(items)
      return {
        prompt: `${target.emoji}${target.label}は いくつ?`,
        speakText: `${target.label}は いくつ?`,
        answer: target.value,
        data: { items, question: 'count', suffix: 'こ' },
        hints: ['そのグラフの たかさを かぞえよう', 'ぼうの 上に かいてある 数字が こたえだよ'],
        explain: `${target.label}は ${target.value}こ`,
      }
    },
  })

// ===== 分数(fraction) =====
export const fraction = () =>
  tmpl({
    type: 'choice',
    difficulty: 1,
    make() {
      const denom = pick([2, 4, 8])
      return {
        prompt: `いろの ついた ところは\nぜんたいの どれだけ?`,
        speakText: 'いろの ついた ところは ぜんたいの どれだけ?',
        answer: `1/${denom}`,
        data: {
          choices: shuffle([`1/${denom}`, `1/${denom === 2 ? 3 : 2}`, `1/${denom + 2}`]),
          figure: { kind: 'fraction', denom, filled: 1 },
        },
        hints: [`${denom}こに わけた 1こ ぶん だよ`, `わけた 数の ${denom}が ぶんすうの 下に くるよ`],
        explain: `1/${denom} だよ`,
      }
    },
  })

// ===== 計算のくふう(3口・かっこ) =====
export const threeAdd = () =>
  tmpl({
    type: 'numpad',
    difficulty: 2,
    make() {
      const a = rint(1, 9)
      const b = rint(1, 9)
      const c = rint(1, 9)
      return {
        prompt: `${a} + ${b} + ${c} = □`,
        speakText: `${a} たす ${b} たす ${c} は?`,
        answer: a + b + c,
        data: { suffix: '' },
        hints: ['10に なる くみあわせから たすと かんたん', `まえから じゅんに ${a}+${b} を さきに けいさんしても いいよ`],
        explain: `${a} + ${b} + ${c} = ${a + b + c}`,
      }
    },
  })

// ===== 大きな数(numpad / choice) =====
export const bigNumberSay = (max) =>
  tmpl({
    type: 'choice',
    difficulty: 2,
    make() {
      const n = rint(Math.floor(max / 3), max)
      return {
        prompt: `この かずは?\n${n.toLocaleString('ja-JP')}`,
        speakText: 'この かずは いくつ?',
        answer: n,
        data: { choices: distractors(n, 3, Math.max(2, Math.floor(max / 30)), 0) },
        hints: ['くらいごとに くぎって よもう', '大きい くらいから じゅんばんに よんでみよう'],
        explain: `${n} です`,
      }
    },
  })
