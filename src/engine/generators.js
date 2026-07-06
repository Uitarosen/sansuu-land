// 問題テンプレートのファクトリ群(§6.4 / §6.5)。
// 各ファクトリは { type, difficulty, subSkill?, id, make() } を返す。
// make() は問題インスタンス { prompt, speakText?, answer, data, hints, explain } を返す。
import { rint, pick, shuffle, distractors } from './rng.js'

let tid = 0
const tmpl = (o) => ({ id: `t${tid++}`, hints: [], ...o })
const emojis = ['🍓', '🍎', '⭐', '🍪', '🧁', '🍬', '🌸', '🍒']

// 正解+誤答候補から重複のない選択肢セットを作る(候補が足りなければ乱数で補完)
function buildChoices(answer, candidates, count = 3, spread = 3, min = 0) {
  const set = new Set([answer])
  for (const c of candidates) {
    if (set.size >= count) break
    if (c !== answer && c != null && (typeof c !== 'number' || c >= min)) set.add(c)
  }
  let guard = 0
  while (set.size < count && guard++ < 200 && typeof answer === 'number') {
    const v = answer + rint(-spread, spread)
    if (v >= min && v !== answer) set.add(v)
  }
  return shuffle([...set])
}

// ===== 数・かず =====
// 10フレーム(10のわく)で数を見せて数える。10のまとまりの感覚を育てる。
export const countTo = (max) =>
  tmpl({
    type: 'choice',
    difficulty: max <= 10 ? 1 : 2,
    make() {
      const n = rint(1, max)
      const e = pick(emojis)
      return {
        prompt: 'いくつ あるかな?',
        speakText: 'いくつ あるかな?',
        answer: n,
        data: { choices: distractors(n, 3, 2, 1), figure: { kind: 'tenframe', n, emoji: e } },
        hints:
          n > 10
            ? ['うえの わくは 10こ ぴったり。10と いくつかな?', `10の まとまりと ばらが ${n - 10}こ。10と ${n - 10}で いくつ?`]
            : ['ゆびで さしながら 1、2、3…と かぞえよう', 'ひとつの だんには 5こまで はいるよ。だんを つかって かぞえよう'],
        explain: n > 10 ? `10と ${n - 10}で ${n}こ だよ` : `ぜんぶで ${n}こ です`,
      }
    },
  })

export const compareNum = (max) =>
  tmpl({
    type: 'choice',
    difficulty: 1,
    make() {
      let a, b
      do {
        a = rint(1, max)
        // 大きな数は近い数どうしを出して「くらいから くらべる」練習にする
        b = max >= 100 ? Math.min(max, Math.max(1, a + pick([-1, 1]) * rint(1, 30))) : rint(1, max)
      } while (a === b)
      const big = Math.max(a, b)
      return {
        prompt: `${a} と ${b}\nおおきいのは どっち?`,
        speakText: `${a} と ${b}、おおきいのは どっち?`,
        answer: big,
        data: { choices: shuffle([a, b]) },
        hints: [
          max >= 100 ? 'いちばん 大きい くらいから じゅんに くらべよう' : 'かずが 大きいほうが おおきいよ',
          max >= 100 ? '上の くらいが おなじなら つぎの くらいで くらべるよ' : 'かぞえる とき あとに いう ほうが 大きい かずだよ',
        ],
        explain: `${big} のほうが おおきいね`,
      }
    },
  })

// なんばんめ:まえから/うしろから/「どれ」と「なんばんめ」の両方向
export const ordinal = () =>
  tmpl({
    type: 'choice',
    difficulty: 1,
    make() {
      const line = shuffle(emojis).slice(0, 6)
      const variant = pick(['front', 'back', 'which'])
      if (variant === 'which') {
        const posIdx = rint(1, 6)
        const target = line[posIdx - 1]
        return {
          prompt: `➡️ ${line.join(' ')}\n${target}は まえから なんばんめ?`,
          speakText: 'まえから なんばんめ かな?',
          answer: posIdx,
          data: { choices: distractors(posIdx, 3, 2, 1), suffix: 'ばんめ' },
          hints: ['ひだりが「まえ」だよ', 'ひだりから いち、に、さん…と かぞえよう'],
          explain: `${target}は まえから ${posIdx}ばんめ だよ`,
        }
      }
      const n = rint(1, 6)
      const fromFront = variant === 'front'
      const target = fromFront ? line[n - 1] : line[6 - n]
      return {
        prompt: `➡️ ${line.join(' ')}\n${fromFront ? 'まえ' : 'うしろ'}から ${n}ばんめは どれ?`,
        speakText: `${fromFront ? 'まえ' : 'うしろ'}から ${n}ばんめは どれ?`,
        answer: target,
        data: { choices: shuffle(line), emoji: true },
        hints: [
          fromFront ? 'ひだりが「まえ」だよ。ひだりから かぞえよう' : 'うしろから かぞえる ときは みぎから だよ',
          `${fromFront ? 'ひだり' : 'みぎ'}から いち、に…と ${n}まで かぞえた ところだよ`,
        ],
        explain: `${fromFront ? 'まえ' : 'うしろ'}から ${n}ばんめは ${target} だよ`,
      }
    },
  })

// ===== たしざん・ひきざん(numpad) =====
// carry=true で「くり上がりが必ずある」問題に限定(単元のねらいに合わせる)
export const addNumpad = ({ min = 1, max = 9, sumMax = 10, difficulty = 1, carry = false }) =>
  tmpl({
    type: 'numpad',
    difficulty,
    make() {
      let a, b
      do {
        a = rint(min, max)
        b = rint(min, max)
      } while (a + b > sumMax || (carry && a + b <= 10))
      const rest = b - (10 - a)
      return {
        prompt: `${a} + ${b} = □`,
        speakText: `${a} たす ${b} は?`,
        answer: a + b,
        data: { suffix: '' },
        hints: carry
          ? [`${a}は あと ${10 - a}で 10に なるよ`, `${b}を ${10 - a}と ${rest}に わけよう。10と ${rest}で いくつ?`]
          : [`${a}に ${b}を たすよ`, `ゆびで ${b}こ ふやしてみよう`],
        explain: carry
          ? `${a}+${10 - a}で 10。10と ${rest}で ${a + b}!`
          : `${a} + ${b} = ${a + b}`,
      }
    },
  })

// borrow=true で「くり下がりが必ずある」問題に限定
export const subNumpad = ({ min = 1, max = 10, difficulty = 1, borrow = false }) =>
  tmpl({
    type: 'numpad',
    difficulty,
    make() {
      let a, b
      if (borrow) {
        a = rint(Math.max(11, min), Math.min(18, max))
        b = rint((a % 10) + 1, 9) // 一のくらいから ひけない → くり下がり確定
      } else {
        a = rint(min, max)
        b = rint(1, a)
      }
      return {
        prompt: `${a} - ${b} = □`,
        speakText: `${a} ひく ${b} は?`,
        answer: a - b,
        data: { suffix: '' },
        hints: borrow
          ? [`${a}を 10と ${a % 10}に わけよう`, `10から ${b}を ひくと ${10 - b}。${10 - b}と ${a % 10}で いくつ?`]
          : [`${a}から ${b}を へらすよ`, `ゆびを ${a}ほん たてて、${b}ほん おってみよう`],
        explain: borrow
          ? `10-${b}=${10 - b}。${10 - b}と ${a % 10}で ${a - b}!`
          : `${a} - ${b} = ${a - b}`,
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
        hints: [`${a}に なにを たすと ${total}に なるかな`, `ゆびを ${total}ほん だして、${a}ほん おってみよう。のこりは?`],
        explain: `${total}は ${a}と ${total - a}`,
      }
    },
  })

// ===== 10のまとまりづくり(操作型) =====
// ブロックをタップして10のわくを埋め、「10といくつ」で答える(くり上がりの概念操作)
export const makeTen = () =>
  tmpl({
    type: 'makeTen',
    difficulty: 2,
    make() {
      const a = rint(6, 9)
      const b = rint(11 - a, 9)
      return {
        prompt: `${a} + ${b} = □`,
        speakText: `${a} たす ${b}。ブロックを うごかして 10の まとまりを つくってみよう`,
        answer: a + b,
        data: { a, b, suffix: '' },
        hints: [`${a}は あと ${10 - a}こで 10に なるよ。ブロックを うごかしてみよう`, `10と ${a + b - 10}で いくつかな?`],
        explain: `${a}に ${10 - a}を たして 10。10と ${a + b - 10}で ${a + b}!`,
      }
    },
  })

// ===== 文章題(たすのかな ひくのかな) =====
const wordThings = [
  { label: 'りんご', emoji: '🍎' },
  { label: 'いちご', emoji: '🍓' },
  { label: 'あめ', emoji: '🍬' },
  { label: 'クッキー', emoji: '🍪' },
  { label: 'ドーナツ', emoji: '🍩' },
]
const kindWords = {
  join: { word: 'あわせて', op: '+', opName: 'たしざん' },
  increase: { word: 'ぜんぶで', op: '+', opName: 'たしざん' },
  remain: { word: 'のこりは', op: '-', opName: 'ひきざん' },
  diff: { word: 'ちがいは', op: '-', opName: 'ひきざん' },
}

// 場面(situation + question + 式)を作る
function makeScene({ kinds, sumMax = 10, carry = false }) {
  const kind = pick(kinds)
  const t = pick(wordThings)
  const k = kindWords[kind]
  let a, b
  if (k.op === '+') {
    if (carry) {
      a = rint(6, 9)
      b = rint(11 - a, 9)
    } else {
      a = rint(2, Math.min(8, sumMax - 1))
      b = rint(1, Math.min(9, sumMax - a))
    }
  } else if (carry) {
    a = rint(11, 18)
    b = rint((a % 10) + 1, 9)
  } else {
    a = rint(3, Math.min(9, sumMax))
    b = rint(1, a - 1)
  }
  const answer = k.op === '+' ? a + b : a - b
  let situation, question, art
  if (kind === 'join') {
    situation = `${t.label}が ${a}こと ${b}こ あります。`
    question = 'あわせて なんこ?'
    art = a <= 10 && b <= 10 ? `${t.emoji.repeat(a)} と ${t.emoji.repeat(b)}` : null
  } else if (kind === 'increase') {
    situation = `${t.label}が ${a}こ ありました。あとから ${b}こ もらいました。`
    question = 'ぜんぶで なんこ?'
    art = a <= 10 && b <= 10 ? `${t.emoji.repeat(a)} ← ${t.emoji.repeat(b)}` : null
  } else if (kind === 'remain') {
    situation = `${t.label}が ${a}こ ありました。${b}こ たべました。`
    question = 'のこりは なんこ?'
    art = a <= 10 ? t.emoji.repeat(a) : null
  } else {
    const t2 = pick(wordThings.filter((x) => x !== t))
    situation = `${t.label}が ${a}こ、${t2.label}が ${b}こ あります。`
    question = `どちらが なんこ おおい?`
    art = a <= 10 ? `${t.emoji.repeat(a)}\n${t2.emoji.repeat(b)}` : null
    return { kind, k, a, b, answer, situation, question: 'ちがいは なんこ?', art }
  }
  return { kind, k, a, b, answer, situation, question, art }
}

// 文章題①:場面に合う「しき」を選ぶ(演算決定の練習)
export const wordExpr = ({ kinds = ['join', 'increase', 'remain', 'diff'], sumMax = 10, difficulty = 2 } = {}) =>
  tmpl({
    type: 'choice',
    difficulty,
    make() {
      const s = makeScene({ kinds, sumMax })
      const correct = `${s.a} ${s.k.op} ${s.b}`
      const cands =
        s.k.op === '+'
          ? [`${s.a} - ${s.b}`, `${s.b} - ${s.a}`]
          : [`${s.a} + ${s.b}`, `${s.b} - ${s.a}`]
      return {
        prompt: `${s.art ? s.art + '\n' : ''}${s.situation}\n「${s.question}」の しきは どれ?`,
        speakText: `${s.situation} ${s.question} しきは どれ?`,
        answer: correct,
        data: { choices: buildChoices(correct, cands, 3) },
        hints: [
          `「${s.k.word}」の ことばに ちゅうもく!`,
          `「${s.k.word}」は ${s.k.opName}の あいずだよ`,
        ],
        explain: `「${s.k.word}」だから ${s.k.opName}。しきは ${correct} だね`,
      }
    },
  })

// 文章題②:場面から答えを求める(式ヒントつき)
export const wordAnswer = ({ kinds = ['join', 'increase', 'remain', 'diff'], sumMax = 10, carry = false, difficulty = 2 } = {}) =>
  tmpl({
    type: 'numpad',
    difficulty,
    make() {
      const s = makeScene({ kinds, sumMax, carry })
      return {
        prompt: `${s.art ? s.art + '\n' : ''}${s.situation}\n${s.question}`,
        speakText: `${s.situation} ${s.question}`,
        answer: s.answer,
        data: { suffix: 'こ' },
        hints: [
          `「${s.k.word}」は ${s.k.opName}だよ`,
          `しきは ${s.a} ${s.k.op} ${s.b} だよ`,
        ],
        explain: `${s.a} ${s.k.op} ${s.b} = ${s.answer}こ だね`,
      }
    },
  })

// ===== 3つのかずのけいさん =====
// pattern: '++' | '+-' | '--' | '-+' | 'mix'
// tenFriendly=true で「10がつくれるペア」を含む数を出す(計算のくふう用)
export const threeTerm = ({ pattern = 'mix', tenFriendly = false, difficulty = 2 } = {}) =>
  tmpl({
    type: 'numpad',
    difficulty,
    make() {
      const p = pattern === 'mix' ? pick(['++', '+-', '--', '-+']) : pattern
      let a, b, c
      if (p === '++') {
        if (tenFriendly) {
          const x = rint(1, 9)
          const other = rint(2, 9)
          // 10のペアを 1・2番目 か 1・3番目に置く
          ;[a, b, c] = pick([[x, 10 - x, other], [x, other, 10 - x]])
        } else {
          a = rint(1, 6)
          b = rint(1, Math.min(6, 9 - a))
          c = rint(1, Math.min(6, 10 - a - b))
        }
      } else if (p === '+-') {
        a = rint(2, 8)
        b = rint(1, Math.min(8, 10 - a))
        c = rint(1, a + b)
      } else if (p === '--') {
        a = rint(7, 12)
        b = rint(1, a - 2)
        c = rint(1, a - b)
      } else {
        a = rint(5, 10)
        b = rint(1, a - 1)
        c = rint(1, 8)
      }
      const op1 = p[0]
      const op2 = p[1]
      const step1 = op1 === '+' ? a + b : a - b
      const answer = op2 === '+' ? step1 + c : step1 - c
      const tenPair = tenFriendly && p === '++' ? (b === 10 - a ? [a, b] : [a, c]) : null
      return {
        prompt: `${a} ${op1} ${b} ${op2} ${c} = □`,
        speakText: `${a} ${op1 === '+' ? 'たす' : 'ひく'} ${b} ${op2 === '+' ? 'たす' : 'ひく'} ${c} は?`,
        answer,
        data: { suffix: '' },
        hints: tenPair
          ? [`10に なる ペアが かくれているよ。さがしてみよう`, `${tenPair[0]}と ${tenPair[1]}で 10! さきに たすと かんたんだよ`]
          : ['まえから じゅんばんに けいさんしよう', `まず ${a} ${op1} ${b} = ${step1}。つぎに ${step1} ${op2} ${c} だよ`],
        explain: `${a} ${op1} ${b} = ${step1}、${step1} ${op2} ${c} = ${answer}`,
      }
    },
  })

// 旧名の互換(3口のたし算)
export const threeAdd = () => threeTerm({ pattern: '++', tenFriendly: true, difficulty: 2 })

// ===== ひっ算(hissan) =====
export const hissanAdd = ({ digits = 2, difficulty = 1 }) =>
  tmpl({
    type: 'hissan',
    difficulty,
    make() {
      let a, b
      if (difficulty === 1) {
        // くり上がりなし:くらいごとに 和が9以下になるよう作る
        const aT = rint(1, 8)
        const aO = rint(0, 8)
        const bT = rint(1, 9 - aT)
        const bO = rint(0, 9 - aO)
        a = aT * 10 + aO
        b = bT * 10 + bO
      } else {
        const lo = digits === 3 ? 100 : 10
        const hi = digits === 3 ? 899 : 89
        do {
          a = rint(lo, hi)
          b = rint(lo, hi)
        } while (a % 10 === 0 && b % 10 === 0) // どちらも0の位だと簡単すぎ
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
      let a, b
      if (difficulty === 1) {
        // くり下がりなし
        do {
          a = rint(lo + 10, hi)
          b = rint(lo, a - 1)
        } while (b % 10 > a % 10 || (digits === 3 && Math.floor(b / 10) % 10 > Math.floor(a / 10) % 10))
      } else {
        // くり下がりあり(一のくらいで必ず借りる)
        do {
          a = rint(lo + 10, hi)
          b = rint(lo, a - 1)
        } while (b % 10 <= a % 10)
      }
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
      const p = pick(pairs) // { fromUnit, toUnit, factor }
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
const clockLabel = (h, m) => `${h}じ${m === 0 ? '' : m === 30 ? 'はん' : m + 'ふん'}`

export const clockRead = ({ half = false, minutes = false }) =>
  tmpl({
    type: 'clock',
    difficulty: minutes ? 2 : 1,
    make() {
      const hour = rint(1, 12)
      const minute = minutes ? rint(0, 11) * 5 : half ? pick([0, 30]) : 0
      const label = clockLabel(hour, minute)
      const hNext = (hour % 12) + 1
      const hPrev = hour === 1 ? 12 : hour - 1
      // 実際の読みまちがいに合わせた誤答をつくる
      const cands = []
      if (minutes && minute !== 0 && minute !== 30) {
        cands.push(`${hour}じ${minute / 5}ふん`) // 文字盤の数字をそのまま「ふん」と読む誤り
        cands.push(clockLabel(hNext, minute)) // 短針を進んだ数字で読む誤り
        cands.push(clockLabel(hour, minute === 55 ? 50 : minute + 5))
      } else if (minute === 30) {
        cands.push(clockLabel(hNext, 30)) // 「3じはん」を「4じはん」と読む誤り
        cands.push(clockLabel(hour, 0))
      } else {
        cands.push(clockLabel(hNext, 0))
        cands.push(clockLabel(hPrev, 0))
        if (half || minutes) cands.push(clockLabel(hour, 30))
      }
      return {
        prompt: 'いま なんじ?',
        speakText: 'とけいは なんじ かな?',
        answer: label,
        data: { mode: 'read', hour, minute, choices: buildChoices(label, shuffle(cands), 3) },
        hints: [
          'みじかい はりが「じ」、ながい はりが「ふん」',
          minutes ? 'ながい はりの すうじ ×5が「ふん」だよ' : `みじかい はりは ${hour}${minute === 30 ? 'と ' + hNext + 'の あいだ' : ''}を さしているね`,
        ],
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
      const cands = []
      if (minute + add >= 60) cands.push(`${hour}じ${minute + add}ふん`) // 「時」を進め忘れる誤り
      cands.push(`${hour}じ${minute === 0 ? '' : minute + 'ふん'}`) // 動かしていない
      cands.push(`${h}じ${m + 5 > 55 ? Math.max(0, m - 5) || '' : m + 5}ふん`)
      const startLabel = `${hour}じ${minute === 0 ? '' : minute + 'ふん'}`
      return {
        prompt: `いまは ${startLabel}。\n${add}ぷん あとは?`,
        speakText: `いまは ${startLabel}。${add}ふん あとは なんじ?`,
        answer: label,
        data: { mode: 'read', hour, minute, choices: buildChoices(label, shuffle(cands), 3) },
        hints: [`ながい はりを ${add}ふん すすめよう`, `${minute}ふんに ${add}を たすと なんぷん? 60ぷんを こえたら「じ」が 1つ すすむよ`],
        explain: `${add}ぷん あとは ${label}`,
      }
    },
  })

// 針を合わせる(操作型)。answer は "h:m" の文字列
export const clockSet = ({ half = false, minutes = false }) =>
  tmpl({
    type: 'clockSet',
    difficulty: minutes ? 3 : 2,
    make() {
      const hour = rint(1, 12)
      const minute = minutes ? rint(0, 11) * 5 : half ? pick([0, 30]) : 0
      const label = clockLabel(hour, minute)
      return {
        prompt: `とけいを「${label}」に あわせよう!`,
        speakText: `とけいを ${label}に あわせよう`,
        answer: `${hour}:${minute}`,
        data: { targetHour: hour, targetMinute: minute, step: minutes ? 5 : 30 },
        hints: [
          'ふとくて みじかい はりが「じ」、ほそくて ながい はりが「ふん」だよ',
          minute === 0
            ? `ながい はりは 12。みじかい はりは ${hour}に あわせよう`
            : minute === 30
              ? `「はん」は ながい はりが 6の ところ。みじかい はりは ${hour}を すこし すぎるよ`
              : `ながい はりは ${minute / 5}の すうじの ところだよ`,
        ],
        explain: `${label}は みじかい はりが ${hour}、ながい はりが ${minute === 0 ? '12' : minute / 5} だよ`,
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
const tapeThings = [
  { label: 'あめ', emoji: '🍬' },
  { label: 'いちご', emoji: '🍓' },
  { label: 'クッキー', emoji: '🍪' },
  { label: 'おはじき', emoji: '🔵' },
]

export const tapeDiagram = ({ op = '+' }) =>
  tmpl({
    type: 'tape',
    difficulty: 2,
    make() {
      const t = pick(tapeThings)
      const a = rint(3, 20)
      const b = rint(2, 15)
      if (op === '+') {
        return {
          prompt: `あかい ${t.label}が ${a}こ、しろい ${t.label}が ${b}こ。\nあわせて なんこ?`,
          speakText: `あわせて なんこ?`,
          answer: a + b,
          data: { parts: [a, b], whole: null, blankAt: 'whole', suffix: 'こ' },
          hints: ['テープ図で あわせた 長さが こたえ', `しきは ${a}+${b} だよ`],
          explain: `${a} + ${b} = ${a + b}こ`,
        }
      }
      const whole = a + b
      return {
        prompt: `${t.label}が ${whole}こ あります。${a}こ つかうと のこりは?`,
        speakText: `のこりは なんこ?`,
        answer: b,
        data: { parts: [a, null], whole, blankAt: 'part', suffix: 'こ' },
        hints: ['ぜんたいから つかった ぶんを ひくよ', `しきは ${whole}-${a} だよ`],
        explain: `${whole} - ${a} = ${b}こ`,
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
      // 「いちばん多い」が1つに決まるまで作り直す
      let items
      do {
        items = cats.map((c) => ({ ...c, value: rint(1, 8) }))
      } while (
        [...items].sort((x, y) => y.value - x.value)[0].value ===
        [...items].sort((x, y) => y.value - x.value)[1].value
      )
      const mode = pick(['count', 'most'])
      if (mode === 'most') {
        const top = [...items].sort((x, y) => y.value - x.value)[0]
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
          choices: shuffle([`1/${denom}`, `1/${denom === 2 ? 4 : 2}`, `1/${denom === 8 ? 4 : 8}`]),
          figure: { kind: 'fraction', denom, filled: 1 },
        },
        hints: [`なんこに わけてあるか かぞえよう`, `${denom}こに わけた 1こぶん。わけた 数が ぶんすうの 下に くるよ`],
        explain: `${denom}こに わけた 1つぶんだから 1/${denom} だよ`,
      }
    },
  })

// ===== 大きな数 =====
const DIG_YOMI = ['', 'いち', 'に', 'さん', 'よん', 'ご', 'ろく', 'なな', 'はち', 'きゅう']
// 数のよみ(ひらがな)。10000まで対応
export function yomi(n) {
  if (n === 0) return 'れい'
  if (n === 10000) return 'いちまん'
  const parts = []
  const sen = Math.floor(n / 1000) % 10
  const hyaku = Math.floor(n / 100) % 10
  const ju = Math.floor(n / 10) % 10
  const ichi = n % 10
  if (sen) parts.push(sen === 1 ? 'せん' : sen === 3 ? 'さんぜん' : sen === 8 ? 'はっせん' : DIG_YOMI[sen] + 'せん')
  if (hyaku)
    parts.push(
      hyaku === 1 ? 'ひゃく' : hyaku === 3 ? 'さんびゃく' : hyaku === 6 ? 'ろっぴゃく' : hyaku === 8 ? 'はっぴゃく' : DIG_YOMI[hyaku] + 'ひゃく',
    )
  if (ju) parts.push(ju === 1 ? 'じゅう' : DIG_YOMI[ju] + 'じゅう')
  if (ichi) parts.push(DIG_YOMI[ichi])
  return parts.join(' ')
}

const PLACE_NAMES = ['一のくらい', '十のくらい', '百のくらい', '千のくらい']

// 大きな数:よみ→数字 / まとまりの合成 / くらいの数字(位取りの理解を問う)
export const bigNumberSay = (max) =>
  tmpl({
    type: 'choice',
    difficulty: 2,
    make() {
      const n = rint(Math.max(11, Math.floor(max / 5)), max - 1)
      const digits = String(n).split('').map(Number)
      const nd = digits.length
      const mode = pick(['reading', 'compose', 'place'])

      // 位取りの誤りに基づく誤答候補(桁の入れかえ・0の読みとばし)
      const swapped = Number([...String(n)].reverse().join(''))
      const dropZero = Number(String(n).replace('0', '') || '0')
      const numCands = [swapped, dropZero, n + 10, n - 10, n + 100, n - 100].filter(
        (v) => v > 0 && v !== n && v <= max * 10,
      )

      if (mode === 'place') {
        const pi = rint(0, nd - 1) // 一のくらい〜
        const digit = digits[nd - 1 - pi]
        const others = digits.filter((d, i) => nd - 1 - i !== pi)
        return {
          prompt: `${n}の ${PLACE_NAMES[pi]}の すうじは?`,
          speakText: `${yomi(n)}の ${PLACE_NAMES[pi]}の すうじは?`,
          answer: digit,
          data: { choices: buildChoices(digit, shuffle(others), 3, 3, 0) },
          hints: ['みぎから 一、十、百…の じゅんだよ', `${PLACE_NAMES[pi]}は みぎから ${pi + 1}ばんめの すうじだよ`],
          explain: `${n}の ${PLACE_NAMES[pi]}は ${digit} だよ`,
        }
      }
      if (mode === 'compose') {
        const partsText = []
        const partsSpeak = []
        for (let i = nd - 1; i >= 1; i--) {
          const d = digits[nd - 1 - i]
          if (d > 0) {
            partsText.push(`${10 ** i}が ${d}こ`)
            partsSpeak.push(`${yomi(10 ** i)}が ${d}こ`)
          }
        }
        const ones = digits[nd - 1]
        if (ones > 0) {
          partsText.push(`1が ${ones}こ`)
          partsSpeak.push(`いちが ${ones}こ`)
        }
        return {
          prompt: `${partsText.join('、')}。\nあわせて いくつ?`,
          speakText: `${partsSpeak.join('、')}。あわせて いくつ?`,
          answer: n,
          data: { choices: buildChoices(n, shuffle(numCands), 3, Math.max(2, Math.floor(max / 30)), 1) },
          hints: ['大きい まとまりから じゅんに くらいの へやに 入れよう', 'まとまりの ない くらいは 0に なるよ'],
          explain: `あわせて ${n} だよ`,
        }
      }
      return {
        prompt: `「${yomi(n)}」を すうじで かくと?`,
        speakText: `${yomi(n)}は どれ?`,
        answer: n,
        data: { choices: buildChoices(n, shuffle(numCands), 3, Math.max(2, Math.floor(max / 30)), 1) },
        hints: ['大きい くらいから じゅんに すうじに していこう', 'よみに ない くらいには 0を かくよ'],
        explain: `${yomi(n)}は ${n} だよ`,
      }
    },
  })
