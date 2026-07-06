// 小4「スイーツ遊園地」のジェネレータ群。手続き(わり算筆算)はステップ別 subSkill、
// 空間(角度・面積・展開図)は必ず図で見せる。共通ヘルパーは rng.js。
import { rint, pick, shuffle, buildChoices, makeTmpl } from './rng.js'

const t = makeTmpl('g4')

// ===== 4-1 大きい数(億) =====
export const bigOku = () =>
  t({
    type: 'choice',
    difficulty: 2,
    make() {
      const oku = rint(1, 9)
      const man = rint(1, 9)
      const n = oku * 100000000 + man * 10000
      const reading = `${oku}億${man}万`
      const cands = [oku * 100000000 + man * 1000, (oku === 9 ? 1 : oku + 1) * 100000000 + man * 10000, oku * 10000 + man * 10000]
      return {
        prompt: `「${reading}」を すうじで かくと?`,
        speakText: `${reading}は どれ?`,
        answer: n,
        data: { choices: buildChoices(n, shuffle(cands), 3, 10000, 0) },
        hints: ['1億 = 100000000(0が 8つ)', '億の くらいと 万の くらいを 分けて 考えよう'],
        explain: `${reading} = ${n}`,
      }
    },
  })

// ===== 4-2 折れ線グラフ =====
const MONTHS = ['1月', '2月', '3月', '4月', '5月']
export const lineGraphRead = () =>
  t({
    type: 'lineGraph',
    difficulty: 1,
    make() {
      const pts = MONTHS.map((m) => ({ label: m, value: rint(5, 30) }))
      const kind = pick(['value', 'maxRise'])
      if (kind === 'value') {
        const idx = rint(0, pts.length - 1)
        return {
          prompt: `${pts[idx].label}の あたいは いくつ?`,
          speakText: `${pts[idx].label}の あたいは?`,
          answer: pts[idx].value,
          data: { points: pts, unit: '°C', suffix: '' },
          hints: ['その月の 点の 高さを よもう', '左の めもりと 点を よこに 見くらべよう'],
          explain: `${pts[idx].label}は ${pts[idx].value} だよ`,
        }
      }
      // いちばん 上がったのは 何月から?
      let best = 1
      for (let i = 1; i < pts.length; i++) {
        if (pts[i].value - pts[i - 1].value > pts[best].value - pts[best - 1].value) best = i
      }
      return {
        prompt: 'ふえかたが いちばん 大きいのは 何月から 何月?',
        speakText: 'いちばん ふえたのは 何月から?',
        answer: `${pts[best - 1].label}→${pts[best].label}`,
        data: { points: pts, unit: '°C', choices: shuffle(pts.slice(1).map((p, i) => `${pts[i].label}→${p.label}`)) },
        hints: ['線の かたむきが 急なほど 変化が 大きい', '右上がりが きゅうな ところを さがそう'],
        explain: `${pts[best - 1].label}→${pts[best].label}が いちばん ふえたよ`,
      }
    },
  })

// ===== 4-3 / 4-6 わり算のひっ算 =====
export const longDivision = ({ divisorDigits = 1 } = {}) =>
  t({
    type: 'longDivision',
    difficulty: divisorDigits === 1 ? 2 : 3,
    subSkill: 'longdiv',
    make() {
      const divisor = divisorDigits === 1 ? rint(2, 9) : rint(12, 39)
      const q = divisorDigits === 1 ? rint(11, 99) : rint(11, 30)
      const withRem = Math.random() < 0.5
      const r = withRem ? rint(1, divisor - 1) : 0
      const dividend = divisor * q + r
      if (r === 0) {
        return {
          prompt: `${dividend} ÷ ${divisor}`,
          speakText: `${dividend} わる ${divisor}`,
          answer: q,
          data: { dividend, divisor, suffix: '' },
          hints: ['大きい くらいから じゅんに「たてる→かける→ひく→おろす」', `${divisor}の だんで 考えよう`],
          explain: `${dividend} ÷ ${divisor} = ${q}`,
        }
      }
      return {
        prompt: `${dividend} ÷ ${divisor}`,
        speakText: `${dividend} わる ${divisor}。あまりも`,
        answer: { q, r },
        data: { dividend, divisor, inputMode: 'quotRem' },
        hints: ['「たてる→かける→ひく→おろす」を くりかえそう', `さいごに のこった 数が あまり(${divisor}より 小さい)`],
        explain: `${dividend} ÷ ${divisor} = ${q} あまり ${r}`,
      }
    },
  })

// ===== 4-4 角とその大きさ =====
export const angleMeasure = () =>
  t({
    type: 'protractor',
    difficulty: 2,
    make() {
      const angle = pick([30, 40, 45, 60, 70, 80, 100, 120, 130])
      // 誤答に 180-angle(内・外の めもりの 読みまちがい)を必ず入れる
      const cands = [180 - angle, angle + 10, angle - 10].filter((c) => c > 0 && c < 180)
      return {
        prompt: 'この 角の 大きさは 何度?',
        speakText: 'この角は 何度?',
        answer: angle,
        data: { angle, choices: buildChoices(angle, cands, 3, 10, 1), suffix: '°' },
        hints: ['0の めもりから はじまる ほうの 数字を よもう', '90より 小さい 角(えいかく)か 大きい 角かを 見てね'],
        explain: `この角は ${angle}° だよ`,
      }
    },
  })

// ===== 4-5 小数のしくみ・たし引き(1/100の位) =====
export const decimalHundredths = () =>
  t({
    type: 'numpad',
    difficulty: 2,
    make() {
      const plus = Math.random() < 0.5
      const a = rint(11, 89) / 100
      const b = rint(11, Math.min(89, plus ? 89 : Math.round(a * 100) - 1)) / 100
      const ans = +(plus ? a + b : a - b).toFixed(2)
      return {
        prompt: `${a.toFixed(2)} ${plus ? '+' : '-'} ${b.toFixed(2)} = □`,
        speakText: `${a} ${plus ? 'たす' : 'ひく'} ${b}`,
        answer: ans,
        data: { suffix: '', numpadMode: 'decimal' },
        hints: ['小数点の いちを そろえて 計算しよう', '0.01が いくつぶんかで 考えても いいよ'],
        explain: `${a.toFixed(2)} ${plus ? '+' : '-'} ${b.toFixed(2)} = ${ans}`,
      }
    },
  })

// ===== 4-7 がい数(四捨五入) =====
const PLACE = { 十: 10, 百: 100, 千: 1000 }
export const rounding = () =>
  t({
    type: 'numpad',
    difficulty: 2,
    make() {
      const placeName = pick(['十', '百', '千'])
      const unit = PLACE[placeName]
      const n = rint(unit * 2 + 1, unit * 40)
      const rounded = Math.round(n / unit) * unit
      // 誤答: 切り捨て/切り上げ
      const down = Math.floor(n / unit) * unit
      const up = Math.ceil(n / unit) * unit
      return {
        prompt: `${n}を ${placeName}の位で 四捨五入すると?`,
        speakText: `${n}を ${placeName}の位で 四捨五入`,
        answer: rounded,
        data: { suffix: '', choices: buildChoices(rounded, [down === rounded ? up : down, n], 3, unit, 0) },
        hints: [`${placeName}の位の すぐ 下の 数字を 見るよ`, '0〜4は 切りすて、5〜9は 切りあげ'],
        explain: `${n} → ${rounded}(${placeName}の位で 四捨五入)`,
      }
    },
  })

// ===== 4-8 計算のきまり(順じょ・かっこ) =====
export const orderOps = () =>
  t({
    type: 'numpad',
    difficulty: 2,
    make() {
      const kind = pick(['mulFirst', 'paren'])
      const a = rint(2, 6)
      const b = rint(2, 6)
      const c = rint(2, 5)
      if (kind === 'mulFirst') {
        const ans = a + b * c
        return {
          prompt: `${a} + ${b} × ${c} = □`,
          speakText: `${a} たす ${b} かける ${c}`,
          answer: ans,
          data: { suffix: '' },
          hints: ['×は +より さきに 計算するよ', `さきに ${b}×${c}=${b * c}。それに ${a}を たす`],
          explain: `${b}×${c}=${b * c}、${a}+${b * c}=${ans}`,
        }
      }
      const ans = (a + b) * c
      return {
        prompt: `(${a} + ${b}) × ${c} = □`,
        speakText: `かっこ ${a} たす ${b} かっことじ かける ${c}`,
        answer: ans,
        data: { suffix: '' },
        hints: ['( )の 中を いちばん さきに 計算する', `${a}+${b}=${a + b}。それに ${c}を かける`],
        explain: `(${a}+${b})=${a + b}、${a + b}×${c}=${ans}`,
      }
    },
  })

// ===== 4-9 垂直・平行と四角形 =====
export const quadType = () =>
  t({
    type: 'choice',
    difficulty: 1,
    make() {
      const q = pick([
        { p: '向かいあう 2くみの へんが 平行な 四角形は?', a: '平行四辺形' },
        { p: '4つの へんが ぜんぶ おなじ長さの 四角形は?', a: 'ひし形' },
        { p: '平行な へんが 1くみ だけの 四角形は?', a: '台形' },
      ])
      return {
        prompt: q.p,
        speakText: q.p,
        answer: q.a,
        data: { choices: shuffle(['平行四辺形', 'ひし形', '台形']) },
        hints: ['平行な へんが 何くみ あるかを 見よう', 'へんの 長さにも ちゅうもく'],
        explain: `こたえは ${q.a} だよ`,
      }
    },
  })

// ===== 4-10 帯分数・仮分数・同分母加減 =====
export const mixedFraction = () =>
  t({
    type: 'mixed',
    difficulty: 2,
    make() {
      const den = pick([3, 4, 5, 6])
      const kind = pick(['toMixed', 'add'])
      if (kind === 'toMixed') {
        const whole = rint(1, 3)
        const num = rint(1, den - 1)
        const improper = whole * den + num
        return {
          prompt: `${improper}/${den} を 帯分数に なおすと?`,
          speakText: `${den}ぶんの${improper}を 帯分数に`,
          answer: { whole, num, den },
          data: { inputMode: 'mixed' },
          hints: [`${improper} ÷ ${den} の 商が 整数ぶぶん`, `${improper}÷${den}=${whole}あまり${num}。あまりが 分子`],
          explain: `${improper}/${den} = ${whole}と${num}/${den}`,
        }
      }
      const w1 = rint(1, 2)
      const n1 = rint(1, den - 1)
      const n2 = rint(1, den - n1)
      return {
        prompt: `${w1}と${n1}/${den} + ${n2}/${den} = □`,
        speakText: `${w1}と${den}ぶんの${n1} たす ${den}ぶんの${n2}`,
        answer: { whole: w1, num: n1 + n2, den },
        data: { inputMode: 'mixed' },
        hints: ['整数は そのまま、分子どうしを たす', `分子 ${n1}+${n2}=${n1 + n2}、分母は ${den}`],
        explain: `${w1}と${n1}/${den} + ${n2}/${den} = ${w1}と${n1 + n2}/${den}`,
      }
    },
  })

// ===== 4-11 変わり方 =====
export const changePattern = () =>
  t({
    type: 'numpad',
    difficulty: 2,
    make() {
      // ○+□=sum の きまり。○ が x のとき □ は?
      const sum = rint(8, 18)
      const x = rint(2, sum - 2)
      return {
        prompt: `だんの数 ○ と まわりの数 □ を たすと いつも ${sum}。\n○が ${x}のとき □は?`,
        speakText: `○と□を たすと ${sum}。○が ${x}のとき □は?`,
        answer: sum - x,
        data: { suffix: '' },
        hints: [`○ + □ = ${sum} の きまり`, `${sum} - ${x} = ?`],
        explain: `${sum} - ${x} = ${sum - x}`,
      }
    },
  })

// ===== 4-12 面積(長方形・正方形) =====
export const rectArea = ({ operational = false } = {}) =>
  t({
    type: operational ? 'gridArea' : 'numpad',
    difficulty: 2,
    make() {
      const w = rint(2, operational ? 6 : 9)
      const h = rint(2, operational ? 5 : 9)
      return {
        prompt: operational ? `たて${h}cm・よこ${w}cmの 長方形の 面積は?\n(マスを かぞえてみよう)` : `たて${h}cm・よこ${w}cmの 長方形の 面積は?`,
        speakText: `たて${h} よこ${w}の 長方形の 面積は?`,
        answer: w * h,
        data: { w, h, suffix: 'cm²' },
        hints: ['面積 = たて × よこ', `${h} × ${w} を 計算しよう`],
        explain: `${h} × ${w} = ${w * h}cm²`,
      }
    },
  })

// ===== 4-13 小数×整数・÷整数 =====
export const decimalMulDiv = () =>
  t({
    type: 'numpad',
    difficulty: 2,
    make() {
      const mul = Math.random() < 0.5
      if (mul) {
        const a = rint(11, 49) / 10
        const b = rint(2, 6)
        const ans = +(a * b).toFixed(1)
        return {
          prompt: `${a.toFixed(1)} × ${b} = □`,
          speakText: `${a} かける ${b}`,
          answer: ans,
          data: { suffix: '', numpadMode: 'decimal' },
          hints: ['整数と 同じように 計算して、小数点を うつす', `${a * 10}×${b}=${a * 10 * b}。小数点を 1つ 左へ`],
          explain: `${a.toFixed(1)} × ${b} = ${ans}`,
        }
      }
      const b = rint(2, 6)
      const q = rint(11, 49) / 10
      const a = +(q * b).toFixed(1)
      return {
        prompt: `${a.toFixed(1)} ÷ ${b} = □`,
        speakText: `${a} わる ${b}`,
        answer: q,
        data: { suffix: '', numpadMode: 'decimal' },
        hints: ['商の 小数点は わられる数に そろえる', `${a} を ${b}で わるよ`],
        explain: `${a.toFixed(1)} ÷ ${b} = ${q}`,
      }
    },
  })

// ===== 4-14 直方体と立方体(展開図) =====
// 立方体になる/ならない 展開図を出し、判定させる
const NET_CUBE = [
  [[0, 1], [1, 1], [2, 1], [3, 1], [1, 0], [1, 2]], // 十字
  [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [3, 0]], // 段ちがい(立方体になる)
]
const NET_BAD = [
  [[0, 0], [1, 0], [0, 1], [1, 1], [2, 1], [2, 0]], // 2×3(立方体にならない)
  [[0, 1], [1, 1], [2, 1], [3, 1], [0, 0], [1, 0]], // かたよって重なる
]
export const netCube = () =>
  t({
    type: 'unfoldedBox',
    difficulty: 2,
    make() {
      const isCube = Math.random() < 0.5
      const cells = pick(isCube ? NET_CUBE : NET_BAD)
      return {
        prompt: 'この 展開図を 組み立てると 立方体に なる?',
        speakText: 'この展開図は 立方体に なる?',
        answer: isCube ? 'なる' : 'ならない',
        data: { cells, choices: ['なる', 'ならない'] },
        hints: ['6つの 面が ちょうど 立方体に なるか 考えよう', '同じ 面が かさなったり、足りなかったり しないかな'],
        explain: isCube ? '組み立てると 立方体に なるよ' : '重なりや すきまが できて 立方体に ならないよ',
      }
    },
  })

// ===== 4-15 整理のしかた(二次元表) =====
export const table2d = () =>
  t({
    type: 'numpad',
    difficulty: 2,
    make() {
      // イヌ/ネコ × オス/メス の合計から 1マスをたずねる
      const a = rint(2, 6)
      const b = rint(2, 6)
      const c = rint(2, 6)
      const total = a + b + c
      const box = total - a - b // = c を たずねる
      return {
        prompt: `ぜんぶで ${total}人。\nA ${a}人、B ${b}人、のこりの C は 何人?`,
        speakText: `ぜんぶで ${total}人。Aが ${a}、Bが ${b}。Cは?`,
        answer: box,
        data: { suffix: '人' },
        hints: ['ぜんたいから わかっている ぶんを ひくよ', `${total} - ${a} - ${b} = ?`],
        explain: `${total} - ${a} - ${b} = ${box}人`,
      }
    },
  })
