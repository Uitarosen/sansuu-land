// 小6「おかし宇宙ステーション」のジェネレータ群。抽象化(文字・比例)と統合(総復習)。
import { rint, pick, shuffle, buildChoices, makeTmpl } from './rng.js'
// 6-13 総復習で 全学年の 代表テンプレを 混ぜる
import { addNumpad, kuku } from './generators.js'
import { divideRemainder, decimalAddSub } from './generators3.js'
import { longDivision, rounding } from './generators4.js'
import { ratioPercent, average, fractionUnlike } from './generators5.js'

const t = makeTmpl('g6')
const gcd = (a, b) => { while (b) [a, b] = [b, a % b]; return a }

// ===== 6-1 対称な図形 =====
export const symmetryFind = () =>
  t({
    type: 'symmetry',
    difficulty: 2,
    make() {
      const cols = 7
      const rows = 5
      const axisCol = 3
      const r = rint(0, rows - 1)
      let c = rint(0, cols - 1)
      while (c === axisCol) c = rint(0, cols - 1)
      const mirrorC = 2 * axisCol - c
      return {
        prompt: '線対称な もう1つの 点は どこ?',
        speakText: '線対称の 軸で 対応する 点を タップしてね',
        answer: `${r},${mirrorC}`,
        data: { cols, rows, point: [r, c], axisCol },
        hints: ['軸から 同じ きょりの、反対がわの マスだよ', `軸まで ${Math.abs(c - axisCol)}マス。反対がわにも ${Math.abs(c - axisCol)}マス`],
        explain: '軸から 左右 同じ きょりの 点が 対応するよ',
      }
    },
  })

export const symmetryType = () =>
  t({
    type: 'choice',
    difficulty: 1,
    make() {
      const q = pick([
        { p: '半分に おって ぴったり 重なる 図形を?', a: '線対称', opts: ['線対称', '点対称', '合同'] },
        { p: '180°回すと もとと 重なる 図形を?', a: '点対称', opts: ['線対称', '点対称', '相似'] },
        { p: '正方形は 線対称? (対称の軸は 4本)', a: '線対称', opts: ['線対称', '対称でない'] },
      ])
      return {
        prompt: q.p,
        speakText: q.p,
        answer: q.a,
        data: { choices: shuffle(q.opts) },
        hints: ['折って 重なる → 線対称、回して 重なる → 点対称', '軸で おるか、中心で まわすか'],
        explain: `こたえは ${q.a}`,
      }
    },
  })

// ===== 6-2 文字と式 =====
export const evalExpr = () =>
  t({
    type: 'numpad',
    difficulty: 2,
    make() {
      const x = rint(2, 8)
      const a = rint(2, 5)
      const b = rint(1, 9)
      const plus = Math.random() < 0.5
      const ans = plus ? a * x + b : a * x - b
      return {
        prompt: `x = ${x}の とき\nx × ${a} ${plus ? '+' : '-'} ${b} = □`,
        speakText: `xが ${x}の とき、xかける${a} ${plus ? 'たす' : 'ひく'} ${b}`,
        answer: ans,
        data: { suffix: '' },
        hints: [`xに ${x}を あてはめよう`, `${x} × ${a} = ${a * x}。それに ${b}を ${plus ? 'たす' : 'ひく'}`],
        explain: `${x} × ${a} ${plus ? '+' : '-'} ${b} = ${ans}`,
      }
    },
  })

export const exprWrite = () =>
  t({
    type: 'choice',
    difficulty: 2,
    make() {
      const a = pick(['a', 'x'])
      const n = rint(2, 6)
      // 「1個a円のあめn個」の代金 → a×n。誤答に 併記(an)や たし算を入れる
      return {
        prompt: `1こ ${a}円の あめを ${n}こ 買った 代金を 式に すると?`,
        speakText: `1こ ${a}円 ${n}こ の 代金の 式は?`,
        answer: `${a}×${n}`,
        data: { choices: shuffle([`${a}×${n}`, `${a}+${n}`, `${a}${n}`, `${n}-${a}`]) },
        hints: ['「1こ分 × 個数」で 代金だよ', '文字と 数字を くっつけて かくのは まちがい(a3 ではない)'],
        explain: `代金 = ${a} × ${n} だよ`,
      }
    },
  })

// ===== 6-3 分数 × 分数 =====
export const fractionMul = () =>
  t({
    type: 'fraction',
    difficulty: 2,
    make() {
      const b = pick([2, 3, 4, 5])
      const d = pick([2, 3, 4, 5])
      const a = rint(1, b - 1)
      const c = rint(1, d - 1)
      const num = a * c
      const den = b * d
      const g = gcd(num, den)
      return {
        prompt: `${a}/${b} × ${c}/${d} = □`,
        speakText: `${b}ぶんの${a} かける ${d}ぶんの${c}`,
        answer: { num, den },
        data: { inputMode: 'fraction' },
        hints: ['分子どうし・分母どうしを かけるよ', `分子 ${a}×${c}=${num}、分母 ${b}×${d}=${den}(約分できる ときは 約分)`],
        explain: `${a}/${b} × ${c}/${d} = ${num}/${den}${g > 1 ? ` = ${num / g}/${den / g}` : ''}`,
      }
    },
  })

// ===== 6-4 分数 ÷ 分数 =====
export const fractionDiv = () =>
  t({
    type: 'fraction',
    difficulty: 3,
    make() {
      const b = pick([2, 3, 4, 5])
      const d = pick([2, 3, 4, 5])
      const a = rint(1, b - 1)
      const c = rint(1, d - 1)
      // a/b ÷ c/d = a/b × d/c
      const num = a * d
      const den = b * c
      const g = gcd(num, den)
      return {
        prompt: `${a}/${b} ÷ ${c}/${d} = □`,
        speakText: `${b}ぶんの${a} わる ${d}ぶんの${c}`,
        answer: { num, den },
        data: { inputMode: 'fraction' },
        hints: ['わる数を さかさま(逆数)にして かけるよ', `${a}/${b} × ${d}/${c} を 計算(そのまま かけるのは まちがい)`],
        explain: `${a}/${b} ÷ ${c}/${d} = ${a}/${b} × ${d}/${c} = ${num}/${den}${g > 1 ? ` = ${num / g}/${den / g}` : ''}`,
      }
    },
  })

// ===== 6-5 比とその利用 =====
export const ratioUse = () =>
  t({
    type: 'numpad',
    difficulty: 2,
    make() {
      const kind = pick(['missing', 'value'])
      const a = rint(2, 6)
      const b = rint(2, 6)
      const k = rint(2, 5)
      if (kind === 'missing') {
        return {
          prompt: `${a} : ${b} = ${a * k} : □`,
          speakText: `${a}たい${b} イコール ${a * k}たい なに?`,
          answer: b * k,
          data: { suffix: '' },
          hints: [`${a}が ${a * k}に なったのは ${k}倍`, `${b}も ${k}倍する`],
          explain: `${a}を ${k}倍したから ${b}も ${k}倍で ${b * k}`,
        }
      }
      const g = gcd(a * k, b * k)
      return {
        prompt: `${a * k} : ${b * k} を いちばん かんたんな 比に。\n(左の 数を 答えてね)`,
        speakText: `${a * k}たい${b * k}を かんたんに。左の 数は?`,
        answer: (a * k) / g,
        data: { suffix: '' },
        hints: ['両方を 同じ 数で わるよ(最大公約数)', `${a * k}と ${b * k}の 公約数で わろう`],
        explain: `${a * k}:${b * k} = ${(a * k) / g}:${(b * k) / g}`,
      }
    },
  })

// ===== 6-6 拡大図と縮図 =====
export const scaleFigure = () =>
  t({
    type: 'numpad',
    difficulty: 2,
    make() {
      const base = rint(3, 8)
      const factor = pick([2, 3])
      const enlarge = Math.random() < 0.5
      if (enlarge) {
        return {
          prompt: `${base}cmの 辺を ${factor}倍に 拡大すると?`,
          speakText: `${base}センチを ${factor}倍`,
          answer: base * factor,
          data: { suffix: 'cm' },
          hints: ['拡大は かけ算', `${base} × ${factor}`],
          explain: `${base} × ${factor} = ${base * factor}cm`,
        }
      }
      return {
        prompt: `${base * factor}cmの 辺を 1/${factor}に 縮小すると?`,
        speakText: `${base * factor}センチを ${factor}分の1`,
        answer: base,
        data: { suffix: 'cm' },
        hints: ['縮小は わり算', `${base * factor} ÷ ${factor}`],
        explain: `${base * factor} ÷ ${factor} = ${base}cm`,
      }
    },
  })

// ===== 6-7 円の面積 =====
export const circleArea = () =>
  t({
    type: 'numpad',
    difficulty: 2,
    make() {
      const r = rint(2, 8)
      const ans = +(r * r * 3.14).toFixed(2)
      return {
        prompt: `半径 ${r}cmの 円の 面積は?\n(円周率 3.14)`,
        speakText: `半径${r}センチの 円の 面積は?`,
        answer: ans,
        data: { suffix: 'cm²', numpadMode: 'decimal' },
        hints: ['円の面積 = 半径 × 半径 × 3.14', `${r} × ${r} × 3.14`],
        explain: `${r} × ${r} × 3.14 = ${ans}cm²(直径で 計算しないよう 注意)`,
      }
    },
  })

// ===== 6-8 角柱・円柱の体積 =====
export const prismVolume = () =>
  t({
    type: 'numpad',
    difficulty: 2,
    make() {
      const kind = pick(['rect', 'tri'])
      const h = rint(3, 8)
      if (kind === 'rect') {
        const baseArea = rint(6, 20)
        return {
          prompt: `底面積 ${baseArea}cm²・高さ ${h}cmの 角柱の 体積は?`,
          speakText: `底面積${baseArea} 高さ${h}の 角柱の 体積`,
          answer: baseArea * h,
          data: { suffix: 'cm³' },
          hints: ['柱の 体積 = 底面積 × 高さ', `${baseArea} × ${h}`],
          explain: `${baseArea} × ${h} = ${baseArea * h}cm³`,
        }
      }
      const b = rint(2, 6)
      const th = rint(2, 6)
      const baseArea = (b * th) / 2
      return {
        prompt: `底面が 底辺${b}cm・高さ${th}cmの 三角形、\n柱の 高さ ${h}cmの 三角柱の 体積は?`,
        speakText: `三角柱の 体積を もとめよう`,
        answer: baseArea * h,
        data: { suffix: 'cm³' },
        hints: ['まず 底面積(三角形)= 底辺×高さ÷2', `底面積 ${baseArea} × 高さ ${h}`],
        explain: `底面積 ${baseArea} × ${h} = ${baseArea * h}cm³`,
      }
    },
  })

// ===== 6-9 比例と反比例 =====
export const proportion = () =>
  t({
    type: 'plot',
    difficulty: 2,
    make() {
      const k = rint(2, 3)
      const pts = [1, 2, 3].map((x) => ({ x, y: k * x }))
      const askX = pick([4, 5])
      return {
        prompt: `y は x に 比例(y = ${k} × x)。\nx = ${askX}の とき y は?`,
        speakText: `yは ${k}かけるx。xが ${askX}の とき yは?`,
        answer: k * askX,
        data: { points: pts, maxX: 6, maxY: k * 6, suffix: '' },
        hints: ['きまった数 × x で もとめるよ', `${k} × ${askX}`],
        explain: `y = ${k} × ${askX} = ${k * askX}`,
      }
    },
  })

export const inverseProportion = () =>
  t({
    type: 'numpad',
    difficulty: 3,
    make() {
      const c = pick([12, 18, 24])
      const x = pick([2, 3, 4, 6])
      return {
        prompt: `x × y = ${c}(反比例)。\nx = ${x}の とき y は?`,
        speakText: `xかけるyは ${c}。xが ${x}の とき yは?`,
        answer: c / x,
        data: { suffix: '' },
        hints: ['反比例は「かけて 一定」', `${c} ÷ ${x}`],
        explain: `y = ${c} ÷ ${x} = ${c / x}`,
      }
    },
  })

// ===== 6-10 並べ方と組み合わせ =====
const MEMBERS = ['A', 'B', 'C', 'D']
export const countCases = () =>
  t({
    type: 'tree',
    difficulty: 2,
    make() {
      const n = pick([3, 4])
      const ordered = Math.random() < 0.5
      const items = MEMBERS.slice(0, n)
      const perm = n * (n - 1) // 2人 並べる
      const comb = perm / 2 // 2人 選ぶ
      return {
        prompt: ordered
          ? `${n}人から 2人 えらんで 1れつに 並べる。\n何通り?`
          : `${n}人から 2人 えらぶ(順番は 関係なし)。\n何通り?`,
        speakText: ordered ? `${n}人から 2人 並べると 何通り?` : `${n}人から 2人 えらぶと 何通り?`,
        answer: ordered ? perm : comb,
        data: { items, suffix: '通り' },
        hints: [
          ordered ? '並べ方は 順番も 区別する(ABと BAは べつ)' : '組み合わせは 順番を 区別しない(ABと BAは 同じ)',
          ordered ? `${n} × ${n - 1}` : `並べ方 ${perm}通り ÷ 2`,
        ],
        explain: ordered ? `${n}×${n - 1} = ${perm}通り` : `${perm} ÷ 2 = ${comb}通り`,
      }
    },
  })

// ===== 6-11 データの調べ方 =====
export const dataStats = () =>
  t({
    type: 'dotPlot',
    difficulty: 2,
    make() {
      const min = rint(1, 3)
      const max = min + 5
      const values = Array.from({ length: 7 }, () => rint(min, max))
      const kind = pick(['mode', 'median', 'max'])
      const sorted = [...values].sort((a, b) => a - b)
      if (kind === 'median') {
        return { prompt: 'このデータの 中央値(まん中の値)は?', speakText: '中央値は?', answer: sorted[3], data: { values, min, max, suffix: '' }, hints: ['小さい順に ならべた まん中の 値', '7この まん中は 4番目'], explain: `中央値は ${sorted[3]}` }
      }
      if (kind === 'max') {
        return { prompt: 'このデータの いちばん 大きい 値は?', speakText: '最大の 値は?', answer: sorted[6], data: { values, min, max, suffix: '' }, hints: ['●が いちばん 右に ある ところ', '右はしを 見よう'], explain: `最大は ${sorted[6]}` }
      }
      // mode(最頻値)
      const counts = {}
      values.forEach((v) => (counts[v] = (counts[v] || 0) + 1))
      const mode = Object.keys(counts).reduce((a, b) => (counts[b] > counts[a] ? b : a))
      return { prompt: 'いちばん 多く 出てくる 値(最頻値)は?', speakText: '最頻値は?', answer: Number(mode), data: { values, min, max, suffix: '' }, hints: ['●が いちばん 高く つみあがった ところ', 'つみあがりが 一番 高い 数'], explain: `最頻値は ${mode}` }
    },
  })

// ===== 6-12 およその面積 =====
export const approxArea = () =>
  t({
    type: 'numpad',
    difficulty: 2,
    make() {
      const w = rint(18, 62)
      const h = rint(18, 42)
      const rw = Math.round(w / 10) * 10
      const rh = Math.round(h / 10) * 10
      return {
        prompt: `たて ${h}m・よこ ${w}mの 池。\nがい数(十の位)に して およその 面積は?`,
        speakText: `たて${h} よこ${w}の およその 面積は?`,
        answer: rw * rh,
        data: { suffix: 'm²' },
        hints: ['まず たて・よこを 四捨五入で きりのよい 数に', `${rh} × ${rw}`],
        explain: `およそ ${rh} × ${rw} = ${rw * rh}m²`,
      }
    },
  })

// ===== 6-13 地球帰還ミッション(6年間 総復習) =====
// 全学年から 代表テンプレを 混ぜる。弱点は pickTemplate の wrongHistory 加重で 出やすくなる。
export function reviewTemplates() {
  return [
    addNumpad({ min: 6, max: 9, sumMax: 18, difficulty: 2, carry: true }),
    kuku({ difficulty: 2 }),
    divideRemainder(),
    decimalAddSub(),
    longDivision({ divisorDigits: 1 }),
    rounding(),
    average(),
    ratioPercent(),
    fractionUnlike(),
    fractionMul(),
    circleArea(),
    ratioUse(),
  ]
}
