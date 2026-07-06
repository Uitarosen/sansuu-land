// 小3「おかし工場」のジェネレータ群。共通ヘルパーは rng.js、
// たし引き筆算・単位・分数図・グラフ・大きな数は generators.js を再利用する。
import { rint, pick, shuffle, buildChoices, makeTmpl } from './rng.js'
export { hissanAdd, hissanSub, unitSelect, unitConvert, fraction, graphRead } from './generators.js'

const t = makeTmpl('g3')
const sweets = ['🍪', '🍬', '🍩', '🧁', '🍓', '🍎']

// ===== 3-1 かけ算のきまり(0・10のだん、交換法則) =====
export const kukuRule = () =>
  t({
    type: 'numpad',
    difficulty: 1,
    make() {
      const kind = pick(['zero', 'ten', 'commute'])
      let a, b
      if (kind === 'zero') {
        a = rint(0, 9)
        b = 0
        if (Math.random() < 0.5) [a, b] = [b, a]
      } else if (kind === 'ten') {
        a = 10
        b = rint(1, 9)
        if (Math.random() < 0.5) [a, b] = [b, a]
      } else {
        a = rint(2, 9)
        b = rint(2, 9)
      }
      return {
        prompt: `${a} × ${b} = □`,
        speakText: `${a} かける ${b} は?`,
        answer: a * b,
        data: { suffix: '' },
        hints:
          kind === 'zero'
            ? ['0の かけ算は、なんこ あつめても 0こ だよ', 'どんな数に 0を かけても 0!']
            : kind === 'ten'
              ? ['10の かけ算は、九九の こたえに 0を つけるだけ', `${Math.max(a, b) === 10 ? Math.min(a, b) : ''}の うしろに 0を つけてみよう`]
              : ['かける数と かけられる数を いれかえても こたえは おなじ', `${b} × ${a} と おなじ こたえだよ`],
        explain: `${a} × ${b} = ${a * b}`,
      }
    },
  })

// ===== 3-2 時こくと時間(秒・分・時間の計算) =====
export const timeUnit = () =>
  t({
    type: 'numpad',
    difficulty: 1,
    make() {
      const kind = pick(['minToSec', 'secConv', 'elapsed'])
      if (kind === 'minToSec') {
        const m = rint(1, 5)
        const s = pick([0, 10, 20, 30])
        return {
          prompt: `${m}分${s === 0 ? '' : s + '秒'} = □秒`,
          speakText: `${m}分${s}秒は なん秒?`,
          answer: m * 60 + s,
          data: { suffix: '秒' },
          hints: ['1分 = 60秒 だよ', `${m}×60${s ? ' に ' + s + 'を たす' : ''}`],
          explain: `${m}分${s === 0 ? '' : s + '秒'} = ${m * 60 + s}秒`,
        }
      }
      if (kind === 'secConv') {
        const m = rint(1, 4)
        return {
          prompt: `${m * 60}秒 = □分`,
          speakText: `${m * 60}秒は なん分?`,
          answer: m,
          data: { suffix: '分' },
          hints: ['60秒で 1分だよ', `${m * 60}を 60で わってみよう`],
          explain: `${m * 60}秒 = ${m}分`,
        }
      }
      const h = rint(1, 10)
      const min = pick([10, 15, 20, 40, 50])
      const add = pick([10, 20, 30])
      let nm = min + add
      let nh = h
      if (nm >= 60) {
        nm -= 60
        nh += 1
      }
      return {
        prompt: `${h}時${min}分の ${add}分あとは 何時何分?\n(何分の ぶぶんを こたえてね)`,
        speakText: `${h}時${min}分の ${add}分あとは 何分?`,
        answer: nm,
        data: { suffix: '分' },
        hints: [`${min}に ${add}を たすと?`, '60分を こえたら「時」が 1つ すすんで 分は 60ひくよ'],
        explain: `${h}時${min}分の ${add}分あとは ${nh}時${nm}分`,
      }
    },
  })

// ===== 3-3 わり算 =====
// 操作型: おかしを配る/束ねる。答え(1皿ぶん=商)をテンキーで入力
export const divideShare = ({ mode = 'equal' } = {}) =>
  t({
    type: 'divide',
    difficulty: 2,
    make() {
      const divisor = rint(2, 5)
      const q = rint(2, 4)
      const total = divisor * q
      const emoji = pick(sweets)
      return {
        prompt:
          mode === 'equal'
            ? `${total}この ${emoji} を ${divisor}まいの おさらに おなじ数ずつ。\n1さらは 何こ?`
            : `${total}この ${emoji} を ${divisor}こずつ たばねると 何たば?`,
        speakText: mode === 'equal' ? `${total}わる${divisor}。1さらは 何こ?` : `${total}を ${divisor}こずつ。何たば?`,
        answer: mode === 'equal' ? q : total / divisor,
        data: { total, divisor, shareMode: mode, emoji, suffix: mode === 'equal' ? 'こ' : 'たば' },
        hints: ['おかしを タップして じっさいに わけてみよう', `しきは ${total} ÷ ${divisor} だよ`],
        explain: `${total} ÷ ${divisor} = ${total / divisor}`,
      }
    },
  })

// わり算(数式・九九の逆)
export const divideNumpad = ({ max = 81 } = {}) =>
  t({
    type: 'numpad',
    difficulty: 2,
    make() {
      const b = rint(2, 9)
      const q = rint(1, Math.min(9, Math.floor(max / b)))
      const a = b * q
      const inverse = Math.random() < 0.3
      return {
        prompt: inverse ? `${b} × □ = ${a}` : `${a} ÷ ${b} = □`,
        speakText: inverse ? `${b} かける なには ${a}?` : `${a} わる ${b} は?`,
        answer: q,
        data: { suffix: '' },
        hints: [`${b}のだんの 九九で かんがえよう`, `${b} × □ = ${a} の □を さがすよ`],
        explain: `${a} ÷ ${b} = ${q}`,
      }
    },
  })

// ===== 3-5 あまりのあるわり算 =====
export const divideRemainder = () =>
  t({
    type: 'quotRem',
    difficulty: 2,
    make() {
      const b = rint(3, 9)
      const q = rint(1, 8)
      const r = rint(1, b - 1) // あまりは必ず わる数より小さい
      const a = b * q + r
      return {
        prompt: `${a} ÷ ${b} = □`,
        speakText: `${a} わる ${b} は? あまりも こたえてね`,
        answer: { q, r },
        data: { inputMode: 'quotRem' },
        hints: [`${b}のだんで ${a}を こえない いちばん 大きい 九九は?`, `${b}×${q}=${b * q}。のこりの ${r}が あまりだよ`],
        explain: `${a} ÷ ${b} = ${q} あまり ${r}(${b}×${q}+${r}=${a})`,
      }
    },
  })

// ===== 3-6 10000より大きい数(万台) =====
const YOMI = ['', 'いち', 'に', 'さん', 'よん', 'ご', 'ろく', 'なな', 'はち', 'きゅう']
export const manNumber = () =>
  t({
    type: 'choice',
    difficulty: 2,
    make() {
      const man = rint(1, 9)
      const sen = rint(0, 9)
      const n = man * 10000 + sen * 1000
      const reading = `${YOMI[man]}まん${sen ? YOMI[sen] + 'せん' : ''}`
      const cands = [man * 10000 + (sen ? 0 : 5000), (man === 9 ? 1 : man + 1) * 10000 + sen * 1000, man * 1000 + sen * 100]
      return {
        prompt: `「${reading}」を すうじで かくと?`,
        speakText: `${reading}は どれ?`,
        answer: n,
        data: { choices: buildChoices(n, shuffle(cands), 3, 1000, 0) },
        hints: ['一万の くらいから じゅんに かこう', '1万 = 10000。0が 4つ つくよ'],
        explain: `${reading} は ${n} だよ`,
      }
    },
  })

// ===== 3-7 / 3-14 かけ算のひっ算 =====
export const hissanMul = ({ byDigits = 1 } = {}) =>
  t({
    type: 'hissan',
    difficulty: byDigits === 1 ? 2 : 3,
    make() {
      const a = rint(byDigits === 1 ? 12 : 13, byDigits === 1 ? 99 : 99)
      const b = byDigits === 1 ? rint(2, 9) : rint(12, 99)
      return {
        prompt: `${a} × ${b}`,
        speakText: `${a} かける ${b} を ひっさんで`,
        answer: a * b,
        data: { op: '×', a, b, digits: String(a * b).length },
        hints: ['一のくらいから じゅんに かけよう', 'くり上がりは ちいさく メモしておこう'],
        explain: `${a} × ${b} = ${a * b}`,
      }
    },
  })

// ===== 3-9 円と球 =====
export const circleRadius = () =>
  t({
    type: 'numpad',
    difficulty: 1,
    make() {
      const r = rint(2, 9)
      const toDiameter = Math.random() < 0.5
      return {
        prompt: toDiameter ? `半径 ${r}cmの 円の 直径は?` : `直径 ${r * 2}cmの 円の 半径は?`,
        speakText: toDiameter ? `半径${r}センチの円の 直径は?` : `直径${r * 2}センチの円の 半径は?`,
        answer: toDiameter ? r * 2 : r,
        data: { suffix: 'cm' },
        hints: ['直径は 半径の 2つぶん', toDiameter ? `${r}を 2ばいするよ` : `${r * 2}を 半分に するよ`],
        explain: toDiameter ? `直径 = 半径×2 = ${r * 2}cm` : `半径 = 直径÷2 = ${r}cm`,
      }
    },
  })

// ===== 3-10 小数 =====
export const decimalReadLine = () =>
  t({
    type: 'numberLine',
    difficulty: 2,
    make() {
      const tenths = rint(1, 9)
      const val = +(tenths / 10).toFixed(1)
      // tenths(整数)は「0.7を7と読む」混同の誤答としてわざと残す(仕様書の誤概念)
      const neighbors = [+((tenths + 1) / 10).toFixed(1), +((tenths - 1) / 10).toFixed(1)].filter((c) => c > 0 && c < 1)
      const cands = [tenths, ...neighbors]
      return {
        prompt: '▼の めもりは いくつ?',
        speakText: '▼の めもりは いくつ?',
        answer: val,
        data: { min: 0, max: 1, step: 0.1, mark: val, labelEvery: 5, choices: buildChoices(val, cands, 3, 1, 0) },
        hints: ['0と1を 10こに わけた 1つが 0.1だよ', `0から めもり ${tenths}つぶんの ところ`],
        explain: `▼は ${val} だよ`,
      }
    },
  })

export const decimalAddSub = () =>
  t({
    type: 'numpad',
    difficulty: 2,
    make() {
      const a = rint(1, 9)
      const b = rint(1, 9)
      const plus = Math.random() < 0.5 || a === b
      const big = Math.max(a, b)
      const small = Math.min(a, b)
      const x = plus ? a / 10 : big / 10
      const y = plus ? b / 10 : small / 10
      const ans = +(plus ? x + y : x - y).toFixed(1)
      return {
        prompt: `${x} ${plus ? '+' : '-'} ${y} = □`,
        speakText: `${x} ${plus ? 'たす' : 'ひく'} ${y} は?`,
        answer: ans,
        data: { suffix: '', numpadMode: 'decimal' },
        hints: ['0.1が いくつぶんかで かんがえよう', `${plus ? x * 10 + '+' + y * 10 : big + '-' + small} = ${Math.round(ans * 10)}。それが 0.1の ${Math.round(ans * 10)}こぶん`],
        explain: `${x} ${plus ? '+' : '-'} ${y} = ${ans}`,
      }
    },
  })

// ===== 3-11 重さ =====
export const weightRead = () =>
  t({
    type: 'scale',
    difficulty: 2,
    make() {
      const max = pick([500, 1000])
      const step = max / 10
      const value = step * rint(1, 9)
      const cands = [value + step, value - step, max - value]
      return {
        prompt: 'はりは 何gを さしている?',
        speakText: 'はりは 何グラム?',
        answer: value,
        data: { value, max, unit: 'g', choices: buildChoices(value, cands.filter((c) => c > 0 && c <= max), 3, step, 0) },
        hints: ['大きな めもりの 数字を よもう', `1めもりは ${step}gだよ`],
        explain: `はりは ${value}g を さしているよ`,
      }
    },
  })

export const weightConvert = () =>
  t({
    type: 'numpad',
    difficulty: 2,
    make() {
      const kg = rint(1, 5)
      const g = pick([0, 200, 500])
      return {
        prompt: `${kg}kg${g ? g + 'g' : ''} = □g`,
        speakText: `${kg}キロ${g}グラムは 何グラム?`,
        answer: kg * 1000 + g,
        data: { suffix: 'g' },
        hints: ['1kg = 1000g だよ', `${kg}×1000${g ? ' に ' + g + 'を たす' : ''}`],
        explain: `${kg}kg${g ? g + 'g' : ''} = ${kg * 1000 + g}g`,
      }
    },
  })

// ===== 3-12 分数(同分母のたし引き) =====
export const fractionSameDenom = () =>
  t({
    type: 'fraction',
    difficulty: 2,
    make() {
      const den = pick([3, 4, 5, 6, 8])
      const plus = Math.random() < 0.5
      let a, b
      if (plus) {
        a = rint(1, den - 1)
        b = rint(1, den - a)
      } else {
        a = rint(2, den)
        b = rint(1, a - 1)
      }
      const num = plus ? a + b : a - b
      return {
        prompt: `${a}/${den} ${plus ? '+' : '-'} ${b}/${den} = □`,
        speakText: `${den}ぶんの${a} ${plus ? 'たす' : 'ひく'} ${den}ぶんの${b}`,
        answer: { num, den },
        data: { inputMode: 'fraction' },
        hints: ['分母は そのまま。分子だけ けいさんするよ', `${a} ${plus ? '+' : '-'} ${b} = ${num}。分母は ${den}`],
        explain: `${a}/${den} ${plus ? '+' : '-'} ${b}/${den} = ${num}/${den}`,
      }
    },
  })

// ===== 3-13 □を使った式 =====
export const boxEquation = () =>
  t({
    type: 'numpad',
    difficulty: 2,
    make() {
      const kind = pick(['add', 'sub', 'subFrom'])
      const box = rint(2, 12)
      const other = rint(2, 9)
      if (kind === 'add') {
        return {
          prompt: `□ + ${other} = ${box + other}`,
          speakText: `なにたす ${other}は ${box + other}?`,
          answer: box,
          data: { suffix: '' },
          hints: ['ぜんたいから わかっている数を ひくよ', `${box + other} - ${other} = ?`],
          explain: `□ = ${box + other} - ${other} = ${box}`,
        }
      }
      if (kind === 'sub') {
        return {
          prompt: `□ - ${other} = ${box}`,
          speakText: `なにひく ${other}は ${box}?`,
          answer: box + other,
          data: { suffix: '' },
          hints: ['もとの数は こたえに ひいた数を たすよ', `${box} + ${other} = ?`],
          explain: `□ = ${box} + ${other} = ${box + other}`,
        }
      }
      return {
        prompt: `${box + other} - □ = ${box}`,
        speakText: `${box + other}ひく なには ${box}?`,
        answer: other,
        data: { suffix: '' },
        hints: ['ぜんたいから のこりを ひくよ', `${box + other} - ${box} = ?`],
        explain: `□ = ${box + other} - ${box} = ${other}`,
      }
    },
  })

// ===== 3-15 三角形(二等辺・正三角形) =====
export const triangleType = () =>
  t({
    type: 'choice',
    difficulty: 1,
    make() {
      const q = pick([
        { p: '3つの へんが ぜんぶ おなじ長さの 三角形は?', a: '正三角形' },
        { p: '2つの へんが おなじ長さの 三角形は?', a: '二等辺三角形' },
        { p: '直角(かくばった かど)が ある 三角形は?', a: '直角三角形' },
      ])
      return {
        prompt: q.p,
        speakText: q.p,
        answer: q.a,
        data: { choices: shuffle(['正三角形', '二等辺三角形', '直角三角形']) },
        hints: ['へんの 長さや かどに ちゅうもく', '「正」= ぜんぶ おなじ、「二等辺」= 2つ おなじ'],
        explain: `こたえは ${q.a} だよ`,
      }
    },
  })

// ===== 3-17 倍の計算 =====
export const baiWord = () =>
  t({
    type: 'numpad',
    difficulty: 2,
    make() {
      const base = rint(2, 9)
      const times = rint(2, 5)
      const thing = pick(sweets)
      return {
        prompt: `${thing} が ${base}こ。\nその ${times}ばいは 何こ?`,
        speakText: `${base}この ${times}ばいは 何こ?`,
        answer: base * times,
        data: { suffix: 'こ' },
        hints: ['「○ばい」は かけ算だよ', `しきは ${base} × ${times}`],
        explain: `${base} × ${times} = ${base * times}こ`,
      }
    },
  })
