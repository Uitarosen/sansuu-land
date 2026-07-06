// 小5「スイーツ研究所」のジェネレータ群。割合・通分・単位量あたりに 操作型を厚く。
import { rint, pick, shuffle, buildChoices, makeTmpl } from './rng.js'

const t = makeTmpl('g5')
const gcd = (a, b) => { while (b) [a, b] = [b, a % b]; return a }
const lcm = (a, b) => (a * b) / gcd(a, b)

// ===== 5-1 整数と小数(位の移動) =====
export const placeShift = () =>
  t({
    type: 'numpad',
    difficulty: 1,
    make() {
      const base = rint(11, 99) / 10
      const factor = pick([10, 100])
      const mul = Math.random() < 0.5
      const ans = mul ? +(base * factor).toFixed(2) : +(base / factor).toFixed(3)
      return {
        prompt: `${base} ${mul ? '×' : '÷'} ${factor} = □`,
        speakText: `${base} ${mul ? 'かける' : 'わる'} ${factor}`,
        answer: ans,
        data: { suffix: '', numpadMode: 'decimal' },
        hints: [mul ? '×10で 小数点は 右へ 1つ、×100で 2つ' : '÷10で 小数点は 左へ 1つ', '数字は そのまま、小数点だけ 動くよ'],
        explain: `${base} ${mul ? '×' : '÷'} ${factor} = ${ans}`,
      }
    },
  })

// ===== 5-2 体積 =====
export const volumeBox = () =>
  t({
    type: 'volume',
    difficulty: 2,
    make() {
      const w = rint(2, 5)
      const d = rint(2, 4)
      const h = rint(2, 4)
      return {
        prompt: `この 直方体の 体積は 何cm³?`,
        speakText: 'この直方体の 体積は?',
        answer: w * d * h,
        data: { w, d, h, suffix: 'cm³' },
        hints: ['体積 = たて × よこ × たかさ', `1だんに ${w * d}こ、それが ${h}だん`],
        explain: `${w} × ${d} × ${h} = ${w * d * h}cm³`,
      }
    },
  })

export const volumeConvert = () =>
  t({
    type: 'numpad',
    difficulty: 2,
    make() {
      const l = rint(1, 5)
      return {
        prompt: `${l}L = □cm³`,
        speakText: `${l}リットルは 何立方センチ?`,
        answer: l * 1000,
        data: { suffix: 'cm³' },
        hints: ['1L = 1000cm³ だよ', `${l}×1000`],
        explain: `${l}L = ${l * 1000}cm³`,
      }
    },
  })

// ===== 5-3 小数のかけ算 =====
export const decimalMul = () =>
  t({
    type: 'numpad',
    difficulty: 2,
    make() {
      const ai = rint(11, 29)
      const bi = rint(11, 19)
      const ans = +((ai * bi) / 100).toFixed(2)
      return {
        prompt: `${ai / 10} × ${bi / 10} = □`,
        speakText: `${ai / 10} かける ${bi / 10}`,
        answer: ans,
        data: { suffix: '', numpadMode: 'decimal' },
        hints: ['整数と 同じに かけて、小数点は 2つ 分 うつす', `${ai}×${bi}=${ai * bi}。小数点を 左へ 2つ`],
        explain: `${ai / 10} × ${bi / 10} = ${ans}`,
      }
    },
  })

// ===== 5-4 小数のわり算 =====
export const decimalDiv = () =>
  t({
    type: 'numpad',
    difficulty: 2,
    make() {
      const d = rint(2, 9) / 10
      const q = rint(2, 9)
      const dividend = +(d * q).toFixed(1)
      return {
        prompt: `${dividend} ÷ ${d} = □`,
        speakText: `${dividend} わる ${d}`,
        answer: q,
        data: { suffix: '', numpadMode: 'decimal' },
        hints: ['わる数を 整数に なおすと 計算しやすい(両方 10倍)', `${dividend * 10} ÷ ${d * 10} と 同じだよ`],
        explain: `${dividend} ÷ ${d} = ${q}(小さい数で わると 大きく なる)`,
      }
    },
  })

// ===== 5-5 合同な図形 =====
export const congruent = () =>
  t({
    type: 'choice',
    difficulty: 1,
    make() {
      const q = pick([
        { p: 'ぴったり 重なる 2つの 図形を 何という?', a: '合同', opts: ['合同', '対称', '相似'] },
        { p: '合同な 図形で、重なりあう 頂点を 何という?', a: '対応する頂点', opts: ['対応する頂点', 'まん中の点', '直角の点'] },
        { p: '合同な 図形は 辺の 長さや 角の 大きさが?', a: 'ぜんぶ 等しい', opts: ['ぜんぶ 等しい', 'ばらばら', '半分'] },
      ])
      return {
        prompt: q.p,
        speakText: q.p,
        answer: q.a,
        data: { choices: shuffle(q.opts) },
        hints: ['形も 大きさも まったく 同じ', '重ねると ぴったり 合う'],
        explain: `こたえは ${q.a} だよ`,
      }
    },
  })

// ===== 5-6 図形の角(内角の和) =====
export const polygonAngle = () =>
  t({
    type: 'numpad',
    difficulty: 2,
    make() {
      const kind = pick(['triSum', 'quadSum', 'triMissing'])
      if (kind === 'triSum') {
        return { prompt: '三角形の 3つの 角の 大きさの 合計は 何度?', speakText: '三角形の 内角の和は?', answer: 180, data: { suffix: '°' }, hints: ['三角形の 内角の和は きまっているよ', '半回転と 同じ 180°'], explain: '三角形の 内角の和は 180°' }
      }
      if (kind === 'quadSum') {
        return { prompt: '四角形の 4つの 角の 合計は 何度?', speakText: '四角形の 内角の和は?', answer: 360, data: { suffix: '°' }, hints: ['三角形 2つ 分だよ', '180×2'], explain: '四角形の 内角の和は 360°' }
      }
      const a = rint(40, 80)
      const b = rint(40, 80)
      return {
        prompt: `三角形の 2つの 角が ${a}°と ${b}°。\nのこりの 角は?`,
        speakText: `${a}度と ${b}度。のこりは?`,
        answer: 180 - a - b,
        data: { suffix: '°' },
        hints: ['内角の和 180°から ひくよ', `180 - ${a} - ${b}`],
        explain: `180 - ${a} - ${b} = ${180 - a - b}°`,
      }
    },
  })

// ===== 5-7 偶数・奇数/倍数・約数 =====
export const numProperty = () =>
  t({
    type: 'choice',
    difficulty: 1,
    make() {
      const kind = pick(['evenOdd', 'divisorCount', 'isMultiple'])
      if (kind === 'evenOdd') {
        const n = rint(10, 99)
        const ans = n % 2 === 0 ? '偶数' : '奇数'
        return { prompt: `${n}は 偶数? 奇数?`, speakText: `${n}は 偶数か 奇数か`, answer: ans, data: { choices: ['偶数', '奇数'] }, hints: ['一のくらいで 決まるよ', '一のくらいが 0・2・4・6・8なら 偶数'], explain: `${n}は ${ans}` }
      }
      if (kind === 'divisorCount') {
        const n = pick([6, 8, 12, 16, 18, 24])
        const count = Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0).length
        return { prompt: `${n}の 約数は いくつ ある?`, speakText: `${n}の 約数の 数は?`, answer: count, data: { choices: buildChoices(count, [count + 1, count - 1, count + 2], 3, 2, 1) }, hints: [`${n}を わりきれる 数を さがそう`, '1と その数 自身も 約数だよ'], explain: `${n}の 約数は ${count}こ` }
      }
      const base = pick([3, 4, 6])
      const mult = base * rint(2, 6)
      const notMult = mult + 1
      return { prompt: `${base}の 倍数は どっち?`, speakText: `${base}の 倍数は?`, answer: mult, data: { choices: shuffle([mult, notMult]) }, hints: [`${base}で わりきれる 数`, `${base}, ${base * 2}, ${base * 3}…`], explain: `${mult}は ${base}の 倍数だよ` }
    },
  })

// ===== 5-8 分数と小数 =====
export const fractionDecimal = () =>
  t({
    type: 'numpad',
    difficulty: 2,
    make() {
      const opt = pick([
        { num: 1, den: 2, dec: 0.5 },
        { num: 1, den: 4, dec: 0.25 },
        { num: 3, den: 4, dec: 0.75 },
        { num: 1, den: 5, dec: 0.2 },
        { num: 1, den: 10, dec: 0.1 },
      ])
      return {
        prompt: `${opt.num}/${opt.den} を 小数で あらわすと?`,
        speakText: `${opt.den}ぶんの${opt.num}は 小数で?`,
        answer: opt.dec,
        data: { suffix: '', numpadMode: 'decimal' },
        hints: ['分数は「分子 ÷ 分母」で 小数に なるよ', `${opt.num} ÷ ${opt.den} を 計算`],
        explain: `${opt.num}/${opt.den} = ${opt.num} ÷ ${opt.den} = ${opt.dec}`,
      }
    },
  })

// ===== 5-9 分数のたし引き(通分) =====
export const fractionUnlike = () =>
  t({
    type: 'fractionBar',
    difficulty: 2,
    make() {
      const den1 = pick([2, 3, 4])
      let den2 = pick([2, 3, 4, 6])
      while (den2 === den1) den2 = pick([2, 3, 4, 6])
      const l = lcm(den1, den2)
      // 和が 1以下に なる 分子を えらぶ
      let num1 = rint(1, den1 - 1)
      let num2 = rint(1, den2 - 1)
      while (num1 / den1 + num2 / den2 >= 1) {
        num1 = rint(1, den1 - 1)
        num2 = rint(1, den2 - 1)
      }
      const sumNum = num1 * (l / den1) + num2 * (l / den2)
      return {
        prompt: `${num1}/${den1} + ${num2}/${den2} = □`,
        speakText: `${den1}ぶんの${num1} たす ${den2}ぶんの${num2}`,
        answer: { num: sumNum, den: l },
        data: { inputMode: 'fraction', fractions: [{ num: num1, den: den1 }, { num: num2, den: den2 }] },
        hints: ['分母を そろえて(通分)から たすよ', `分母を ${l}に そろえると ${num1 * (l / den1)}/${l} + ${num2 * (l / den2)}/${l}`],
        explain: `分母を ${l}に そろえて ${sumNum}/${l}(約分できる ときは 約分してね)`,
      }
    },
  })

// ===== 5-10 平均 =====
export const average = () =>
  t({
    type: 'numpad',
    difficulty: 2,
    make() {
      const n = pick([3, 4])
      const mean = rint(5, 12)
      // 全部 mean から はじめ、ゼロ和の やりとりで バラす → 平均は 必ず mean(整数)
      const vals = Array(n).fill(mean)
      for (let s = 0; s < 3; s++) {
        const i = rint(0, n - 1)
        const j = rint(0, n - 1)
        const k = rint(1, Math.min(mean - 1, 4))
        if (i !== j && vals[i] - k >= 0) {
          vals[i] -= k
          vals[j] += k
        }
      }
      const sum = vals.reduce((a, b) => a + b, 0)
      return {
        prompt: `${vals.join('、')} の 平均は?`,
        speakText: `${vals.join(' ')}の 平均は?`,
        answer: mean,
        data: { suffix: '' },
        hints: ['平均 = 合計 ÷ 個数', `(${vals.join('+')}) ÷ ${n} = ${sum} ÷ ${n}`],
        explain: `合計 ${sum} ÷ ${n} = ${mean}`,
      }
    },
  })

// ===== 5-11 単位量あたりの大きさ =====
export const unitRate = () =>
  t({
    type: 'doubleLine',
    difficulty: 2,
    make() {
      const per = rint(60, 120)
      const qty = rint(2, 6)
      const total = per * qty
      const askUnit = Math.random() < 0.5
      if (askUnit) {
        return {
          prompt: `${qty}mで ${total}円の リボン。\n1mの ねだんは?`,
          speakText: `${qty}メートルで ${total}円。1メートルは?`,
          answer: per,
          data: { suffix: '円', top: { label: '円', values: [0, '?', total] }, bottom: { label: 'm', values: [0, 1, qty] }, unknownAt: 1 },
          hints: ['1あたりは「ぜんぶ ÷ 個数」', `${total} ÷ ${qty}`],
          explain: `${total} ÷ ${qty} = ${per}円`,
        }
      }
      return {
        prompt: `1mで ${per}円の リボン。\n${qty}mでは?`,
        speakText: `1メートル ${per}円。${qty}メートルは?`,
        answer: total,
        data: { suffix: '円', top: { label: '円', values: [0, per, '?'] }, bottom: { label: 'm', values: [0, 1, qty] }, unknownAt: 2 },
        hints: ['1あたり × 個数', `${per} × ${qty}`],
        explain: `${per} × ${qty} = ${total}円`,
      }
    },
  })

// ===== 5-12 速さ =====
export const speed = () =>
  t({
    type: 'doubleLine',
    difficulty: 3,
    make() {
      const v = rint(30, 80)
      const h = rint(2, 5)
      const dist = v * h
      const kind = pick(['speed', 'dist'])
      if (kind === 'speed') {
        return {
          prompt: `${h}時間で ${dist}km 進む 車。\n時速 何km?`,
          speakText: `${h}時間で ${dist}キロ。時速は?`,
          answer: v,
          data: { suffix: 'km', top: { label: 'km', values: [0, '?', dist] }, bottom: { label: '時間', values: [0, 1, h] }, unknownAt: 1 },
          hints: ['速さ = 道のり ÷ 時間', `${dist} ÷ ${h}`],
          explain: `${dist} ÷ ${h} = 時速${v}km`,
        }
      }
      return {
        prompt: `時速 ${v}kmの 車が ${h}時間 走ると 何km?`,
        speakText: `時速${v}キロで ${h}時間`,
        answer: dist,
        data: { suffix: 'km', top: { label: 'km', values: [0, v, '?'] }, bottom: { label: '時間', values: [0, 1, h] }, unknownAt: 2 },
        hints: ['道のり = 速さ × 時間', `${v} × ${h}`],
        explain: `${v} × ${h} = ${dist}km`,
      }
    },
  })

// ===== 5-13 面積(三角形・平行四辺形・台形) =====
export const shapeArea = () =>
  t({
    type: 'areaTransform',
    difficulty: 2,
    make() {
      const kind = pick(['para', 'tri'])
      const base = rint(3, 8)
      const height = rint(2, 5)
      if (kind === 'para') {
        return {
          prompt: `底辺 ${base}cm・高さ ${height}cmの 平行四辺形の 面積は?`,
          speakText: `底辺${base} 高さ${height}の 平行四辺形の 面積は?`,
          answer: base * height,
          data: { base, height, slant: 1.5, shape: 'parallelogram', suffix: 'cm²' },
          hints: ['ボタンで 長方形に へんけいしてみよう', '面積 = 底辺 × 高さ'],
          explain: `${base} × ${height} = ${base * height}cm²`,
        }
      }
      // 三角形は 底辺×高さ が 偶数に なる 値を えらび、面積を 整数に する
      let tb = base
      let th = height
      while ((tb * th) % 2 !== 0) th = rint(2, 6)
      const area = (tb * th) / 2
      return {
        prompt: `底辺 ${tb}cm・高さ ${th}cmの 三角形の 面積は?`,
        speakText: `底辺${tb} 高さ${th}の 三角形の 面積は?`,
        answer: area,
        data: { base: tb, height: th, slant: 1.2, shape: 'triangle', suffix: 'cm²' },
        hints: ['三角形 = 底辺 × 高さ ÷ 2', `${tb} × ${th} ÷ 2`],
        explain: `${tb} × ${th} ÷ 2 = ${area}cm²`,
      }
    },
  })

// ===== 5-14 割合 =====
export const ratioPercent = () =>
  t({
    type: 'ratio',
    difficulty: 3,
    make() {
      let pct, base, compare
      do {
        pct = pick([10, 20, 25, 40, 50, 75, 80])
        base = pick([20, 40, 200, 400])
        compare = (base * pct) / 100
      } while (!Number.isInteger(compare)) // 人数は 整数に なる 組み合わせだけ
      return {
        prompt: `${base}人の うち ${compare}人が 参加。\n参加した 割合は 何%?`,
        speakText: `${base}人のうち ${compare}人。割合は 何パーセント?`,
        answer: pct,
        data: { base, compare, unit: '人', suffix: '%' },
        hints: ['割合 = 比べる量 ÷ もとにする量', `${compare} ÷ ${base} = ${compare / base}。%に すると ×100`],
        explain: `${compare} ÷ ${base} = ${compare / base} → ${pct}%`,
      }
    },
  })

// ===== 5-15 帯グラフ・円グラフ =====
export const pieBandRead = () =>
  t({
    type: 'pieBand',
    difficulty: 2,
    make() {
      const shape = pick(['pie', 'band'])
      // 合計100%に なる 内わけ
      const a = pick([40, 50, 30])
      const b = pick([20, 25, 30])
      const c = pick([10, 15, 20])
      const d = 100 - a - b - c
      const segs = [
        { label: 'いちご', pct: a },
        { label: 'チョコ', pct: b },
        { label: 'まっちゃ', pct: c },
        { label: 'その他', pct: d },
      ].filter((s) => s.pct > 0)
      const target = segs[rint(0, segs.length - 1)]
      const total = pick([200, 400])
      const ask = Math.random() < 0.5
      if (ask) {
        return {
          prompt: `${target.label}の 割合は 何%?`,
          speakText: `${target.label}は 何パーセント?`,
          answer: target.pct,
          data: { segments: segs, shape, suffix: '%' },
          hints: ['グラフの その 部分の 大きさを 読もう', 'めもりを 見てね'],
          explain: `${target.label}は ${target.pct}%`,
        }
      }
      return {
        prompt: `ぜんぶで ${total}人。\n${target.label}(${target.pct}%)は 何人?`,
        speakText: `ぜんぶで ${total}人。${target.label}は 何人?`,
        answer: (total * target.pct) / 100,
        data: { segments: segs, shape, suffix: '人' },
        hints: ['全体 × 割合 で もとめるよ', `${total} × ${target.pct / 100}`],
        explain: `${total} × ${target.pct}% = ${(total * target.pct) / 100}人`,
      }
    },
  })

// ===== 5-16 正多角形と円周 =====
export const circumference = () =>
  t({
    type: 'numpad',
    difficulty: 2,
    make() {
      const kind = pick(['circum', 'polygon'])
      if (kind === 'polygon') {
        const q = pick([
          { p: '正六角形の 辺の 数は?', a: 6 },
          { p: '正五角形の 角の 数は?', a: 5 },
          { p: '正八角形の 辺の 数は?', a: 8 },
        ])
        return { prompt: q.p, speakText: q.p, answer: q.a, data: { suffix: 'つ', choices: buildChoices(q.a, [q.a + 1, q.a - 1, q.a + 2], 3, 1, 3) }, hints: ['「正○角形」の ○が 辺の数・角の数', '名前の 数字が ヒント'], explain: `こたえは ${q.a}` }
      }
      const d = rint(2, 9)
      const ans = +(d * 3.14).toFixed(2)
      return {
        prompt: `直径 ${d}cmの 円の まわり(円周)は?\n(円周率 3.14)`,
        speakText: `直径${d}センチの 円周は?`,
        answer: ans,
        data: { suffix: 'cm', numpadMode: 'decimal' },
        hints: ['円周 = 直径 × 3.14', `${d} × 3.14`],
        explain: `${d} × 3.14 = ${ans}cm`,
      }
    },
  })

// ===== 5-17 角柱と円柱 =====
export const prismType = () =>
  t({
    type: 'choice',
    difficulty: 1,
    make() {
      const q = pick([
        { p: '底面が 円の 柱を 何という?', a: '円柱', opts: ['円柱', '角柱', '円すい'] },
        { p: '三角柱の 底面の 形は?', a: '三角形', opts: ['三角形', '四角形', '円'] },
        { p: '角柱で、上下に 向かいあう 面を 何という?', a: '底面', opts: ['底面', '側面', '頂点'] },
      ])
      return {
        prompt: q.p,
        speakText: q.p,
        answer: q.a,
        data: { choices: shuffle(q.opts) },
        hints: ['底の 面の 形で 名前が 決まるよ', '上下の 同じ形の 面が 底面'],
        explain: `こたえは ${q.a}`,
      }
    },
  })
