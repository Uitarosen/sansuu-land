// 小1「ちょうせん」ジェネレータ群。教科書の発展内容(□の式・何十の計算・ならびのきまり・
// 逆算・「まえから○ばん うしろから△ばん」)を、ひとつ上の難しさで出す。
// 数値の整合性は generators1c.test.js が大量生成で検証する。
import { rint, pick, shuffle, makeTmpl } from './rng.js'

const t = makeTmpl('g1c')
const things = ['あめ', 'クッキー', 'いちご', 'ドーナツ']

// ===== □を もとめる しき =====
// 土台の たしざん x + y = z を 1つ作り、3つの数の どれかを □にする。
//   たし算:  x + □ = z / □ + y = z      ひき算:  z - □ = y / □ - x = y
// carry:true は くり上がり・くり下がりの ある事実(z は 11〜18)に限る。
export const blankEq = ({ ops = ['add', 'sub'], max = 10, carry = false, difficulty = 3 } = {}) =>
  t({
    type: 'numpad',
    difficulty,
    make() {
      let x, y, z
      do {
        x = rint(carry ? 2 : 1, 9)
        y = rint(carry ? 2 : 1, 9)
        z = x + y
      } while (carry ? z <= 10 || z > 18 : z > max)

      if (pick(ops) === 'add') {
        if (Math.random() < 0.5) {
          return {
            prompt: `□ + ${y} = ${z}`,
            speakText: `なにたす ${y} は ${z}?`,
            answer: x,
            data: { suffix: '' },
            hints: [`ぜんたいは ${z}。わかっている かずは ${y}`, `${z} - ${y} を けいさんしよう`],
            explain: `□ = ${z} - ${y} = ${x}(${x}+${y}=${z})`,
          }
        }
        return {
          prompt: `${x} + □ = ${z}`,
          speakText: `${x} たす なには ${z}?`,
          answer: y,
          data: { suffix: '' },
          hints: [`ぜんたいは ${z}。わかっている かずは ${x}`, `${z} - ${x} を けいさんしよう`],
          explain: `□ = ${z} - ${x} = ${y}(${x}+${y}=${z})`,
        }
      }
      if (Math.random() < 0.5) {
        return {
          prompt: `${z} - □ = ${y}`,
          speakText: `${z} ひく なには ${y}?`,
          answer: x,
          data: { suffix: '' },
          hints: [`${z}から いくつ とると ${y}に なるかな`, `${z} - ${y} を けいさんしよう`],
          explain: `□ = ${z} - ${y} = ${x}(${z}-${x}=${y})`,
        }
      }
      return {
        prompt: `□ - ${x} = ${y}`,
        speakText: `なにひく ${x} は ${y}?`,
        answer: z,
        data: { suffix: '' },
        hints: [`はじめの かずから ${x}を ひいたら ${y}に なったよ`, `${y} + ${x} で もとの かずに もどるよ`],
        explain: `□ = ${y} + ${x} = ${z}(${z}-${x}=${y})`,
      }
    },
  })

// ===== 何十・2けたの けいさん =====
// tens: 何十±何十 / oneDigit: 2けた±1けた(くり上がり・くり下がりなし)/ twoDigit: 2けた±2けた(くらいごとにそのまま)
export const tensCalc = ({ kinds = ['tens', 'oneDigit'], difficulty = 2 } = {}) =>
  t({
    type: 'numpad',
    difficulty,
    make() {
      const kind = pick(kinds)
      const plus = Math.random() < 0.5
      let a, b, hints

      if (kind === 'tens') {
        if (plus) {
          const ta = rint(1, 9)
          const tb = rint(1, 10 - ta)
          ;[a, b] = [ta * 10, tb * 10]
        } else {
          const ta = rint(2, 10)
          const tb = rint(1, ta - 1)
          ;[a, b] = [ta * 10, tb * 10]
        }
        const [pa, pb, pr] = [a / 10, b / 10, (plus ? a + b : a - b) / 10]
        hints = [`10の たばが ${pa}こと ${pb}こ`, `${pa} ${plus ? '+' : '-'} ${pb} = ${pr}。10の たばが ${pr}こで ${pr * 10}`]
      } else if (kind === 'oneDigit') {
        if (plus) {
          const tt = rint(1, 9)
          const o = rint(0, 8)
          const d = rint(1, 9 - o)
          const n = tt * 10 + o
          // 20 + 3 / 3 + 20 のように 入れかえた形も 出す(一のくらいが 0 のときだけ)
          ;[a, b] = o === 0 && Math.random() < 0.4 ? [d, n] : [n, d]
          hints = [`十のくらいは そのまま。ばらの ${o}と ${d}を たそう`, `${o} + ${d} = ${o + d}。${tt * 10}と ${o + d}で ${n + d}`]
        } else {
          const tt = rint(1, 9)
          const o = rint(1, 9)
          const d = rint(1, o)
          ;[a, b] = [tt * 10 + o, d]
          hints = [`十のくらいは そのまま。ばらの ${o}から ${d}を ひこう`, `${o} - ${d} = ${o - d}。${tt * 10}と ${o - d}で ${a - d}`]
        }
      } else if (plus) {
        const ta = rint(1, 8)
        const tb = rint(1, 9 - ta)
        const oa = rint(0, 8)
        const ob = rint(0, 9 - oa)
        ;[a, b] = [ta * 10 + oa, tb * 10 + ob]
        hints = [`十のくらい どうし、一のくらい どうしで けいさん`, `十のくらい ${ta}+${tb}=${ta + tb}、一のくらい ${oa}+${ob}=${oa + ob}`]
      } else {
        // くらいごとに ひける(くり下がりなし)。同じ数どうし(答え0)は 作り直す。
        let ta, tb, oa, ob
        do {
          ta = rint(2, 9)
          tb = rint(1, ta)
          oa = rint(0, 9)
          ob = rint(0, oa)
        } while (ta === tb && oa === ob)
        ;[a, b] = [ta * 10 + oa, tb * 10 + ob]
        hints = [`十のくらい どうし、一のくらい どうしで けいさん`, `十のくらい ${ta}-${tb}=${ta - tb}、一のくらい ${oa}-${ob}=${oa - ob}`]
      }

      const answer = plus ? a + b : a - b
      return {
        prompt: `${a} ${plus ? '+' : '-'} ${b} = □`,
        speakText: `${a} ${plus ? 'たす' : 'ひく'} ${b} は?`,
        answer,
        data: { suffix: '' },
        hints,
        explain: `${a} ${plus ? '+' : '-'} ${b} = ${answer}`,
      }
    },
  })

// ===== かずの ならび(2とび・5とび・10とび・1ずつへる) =====
export const skipCount = ({ max = 100, difficulty = 3, steps = [2, 5, 10], down = true } = {}) =>
  t({
    type: 'numpad',
    difficulty,
    make() {
      const descending = down && Math.random() < 0.35
      // 5つ ならべられる(0から数えて 4回ぶんの余地がある)とびだけ使う。ひく方向は 1ずつも 出す。
      const usable = [...(descending ? [1, ...steps] : steps)].filter((s) => Math.floor(max / s) >= 4)
      const step = pick(usable)
      const room = Math.floor(max / step) - 4
      // ならびの 数は ぜんぶ step の倍数にする(2,4,6… / 5,10,15… / 10,20,30…)
      const first = descending ? step * rint(4, Math.floor(max / step)) : step * rint(0, room)
      const seq = Array.from({ length: 5 }, (_, i) => (descending ? first - i * step : first + i * step))
      // 答えが 0 になる空欄は つくらない
      const blank = pick(seq.map((v, i) => i).filter((i) => seq[i] !== 0))
      const shown = seq.map((v, i) => (i === blank ? '□' : String(v)))
      const answer = seq[blank]
      return {
        prompt: `□に はいる かずは?\n${shown.join('、')}`,
        speakText: `かずの ならびの きまりを みつけて、しかくに はいる かずを こたえよう`,
        answer,
        data: { suffix: '' },
        hints: [`となりどうしの ちがいを みてみよう`, `${step}ずつ ${descending ? 'へって' : 'ふえて'} いるよ`],
        explain: `${step}ずつ ${descending ? 'へる' : 'ふえる'} ならびだから □は ${answer}`,
      }
    },
  })

// ===== つぎ・まえ・あいだの かず =====
export const neighborNum = ({ max = 100, difficulty = 2 } = {}) =>
  t({
    type: 'numpad',
    difficulty,
    make() {
      const kind = pick(['next', 'prev', 'between'])
      if (kind === 'next') {
        const n = rint(1, max - 1)
        return {
          prompt: `${n}の つぎの かずは?`,
          speakText: `${n}の つぎの かずは?`,
          answer: n + 1,
          data: { suffix: '' },
          hints: ['かずを じゅんに かぞえてみよう', `${n}、□ と かぞえて いくよ`],
          explain: `${n}の つぎは ${n + 1}`,
        }
      }
      if (kind === 'prev') {
        const n = rint(2, max)
        return {
          prompt: `${n}の まえの かずは?`,
          speakText: `${n}の まえの かずは?`,
          answer: n - 1,
          data: { suffix: '' },
          hints: ['うしろから かぞえてみよう', `□、${n} と かぞえて いくよ`],
          explain: `${n}の まえは ${n - 1}`,
        }
      }
      const n = rint(1, max - 2)
      return {
        prompt: `${n}と ${n + 2}の あいだの かずは?`,
        speakText: `${n}と ${n + 2}の あいだの かずは?`,
        answer: n + 1,
        data: { suffix: '' },
        hints: ['かずの せんを おもいうかべよう', `${n}、□、${n + 2} と ならぶよ`],
        explain: `${n}と ${n + 2}の あいだは ${n + 1}`,
      }
    },
  })

// ===== 3つの かずを くらべる =====
export const superlative3 = ({ max = 100, difficulty = 2 } = {}) =>
  t({
    type: 'choice',
    difficulty,
    make() {
      const set = new Set()
      while (set.size < 3) set.add(rint(1, max))
      const ns = [...set]
      const sorted = [...ns].sort((a, b) => a - b)
      const kind = pick(['max', 'min', 'mid'])
      const answer = kind === 'max' ? sorted[2] : kind === 'min' ? sorted[0] : sorted[1]
      const word = { max: 'いちばん おおきい', min: 'いちばん ちいさい', mid: 'まんなかの おおきさの' }[kind]
      return {
        prompt: `${ns.join('、')}\n${word} かずは?`,
        speakText: `${ns.join('、')}。${word} かずは?`,
        answer,
        data: { choices: shuffle(ns) },
        hints: [
          '2つずつ くらべて いこう',
          max >= 20 ? '十のくらいが おおきい ほうが おおきいよ。おなじなら 一のくらいで くらべよう' : 'かぞえる とき あとに いう ほうが おおきいよ',
        ],
        explain: `ちいさい じゅんに ならべると ${sorted.join('、')}。こたえは ${answer}`,
      }
    },
  })

// ===== しきを くらべる(4 + 5 と 3 + 7 は どっちが おおきい?) =====
export const compareSums = ({ sumMax = 18, difficulty = 3 } = {}) =>
  t({
    type: 'choice',
    difficulty,
    make() {
      const calc = (e) => {
        const m = e.match(/^(\d+) ([+-]) (\d+)$/)
        return m[2] === '+' ? Number(m[1]) + Number(m[3]) : Number(m[1]) - Number(m[3])
      }
      // 答えが v になる しき(たし算・ひき算)を 1つ作る
      const exprOf = (v) => {
        const canAdd = v >= 2
        const canSub = v + 1 <= sumMax
        if (canAdd && (!canSub || Math.random() < 0.6)) {
          const x = rint(1, v - 1)
          return `${x} + ${v - x}`
        }
        const y = rint(1, sumMax - v)
        return `${v + y} - ${y}`
      }

      const v1 = rint(3, sumMax - 2)
      const wantEqual = Math.random() < 0.2
      let e1, e2
      for (let i = 0; i < 30; i++) {
        const v2 = wantEqual ? v1 : Math.min(sumMax - 1, Math.max(2, v1 + pick([-2, -1, 1, 2])))
        e1 = exprOf(v1)
        e2 = exprOf(v2)
        if (e1 !== e2) break
      }
      if (e1 === e2) e2 = exprOf(Math.min(sumMax - 1, v1 + 1)) // 同じ式になりつづけた ときの保険
      const [r1, r2] = [calc(e1), calc(e2)]
      const bigger = Math.random() < 0.5
      const answer = r1 === r2 ? 'おなじ' : (bigger ? r1 > r2 : r1 < r2) ? e1 : e2
      return {
        prompt: `どちらが ${bigger ? 'おおきい' : 'ちいさい'}?\n${e1} と ${e2}`,
        speakText: `${e1.replace('+', 'たす').replace('-', 'ひく')} と ${e2.replace('+', 'たす').replace('-', 'ひく')}。どちらが ${bigger ? 'おおきい' : 'ちいさい'}?`,
        answer,
        data: { choices: shuffle([e1, e2, 'おなじ']) },
        hints: ['まず それぞれの こたえを だそう', `${e1} = ${r1}、${e2} = ${r2}。こたえを くらべてね`],
        explain: `${e1} = ${r1}、${e2} = ${r2}。${r1 === r2 ? 'どちらも おなじ' : `こたえは ${answer}`}`,
      }
    },
  })

// ===== 2だんかいの 文章題・ぎゃくさん =====
// sumMax: 途中の和・答え・「はじめの数」の上限。習っていない大きさの数を出さないために、
// くり上がりを習う前の単元(1-13など)では 10 を渡す。
export const wordHard = ({ kinds = ['twoStep', 'reverse'], difficulty = 3, sumMax = 18 } = {}) =>
  t({
    type: 'numpad',
    difficulty,
    make() {
      const kind = pick(kinds)
      const th = pick(things)
      if (kind === 'twoStep') {
        if (Math.random() < 0.5) {
          // もらって → たべた
          const a = rint(3, Math.min(9, sumMax - 2))
          const b = rint(2, Math.min(9, sumMax - a))
          const c = rint(2, Math.min(9, a + b - 1))
          return {
            prompt: `${th}が ${a}こ ありました。\n${b}こ もらって、${c}こ たべました。\nいま なんこ?`,
            speakText: `${th}が ${a}こ ありました。${b}こ もらって、${c}こ たべました。いま なんこ?`,
            answer: a + b - c,
            data: { suffix: 'こ' },
            hints: ['1つめの おはなしから じゅんばんに けいさん', `${a} + ${b} = ${a + b}。つぎに ${a + b} - ${c}`],
            explain: `${a} + ${b} - ${c} = ${a + b - c}こ`,
          }
        }
        // たべて → もらった
        const a = rint(5, Math.min(10, sumMax))
        const b = rint(2, Math.min(9, a - 1))
        const c = rint(2, Math.max(2, Math.min(9, sumMax - (a - b))))
        return {
          prompt: `${th}が ${a}こ ありました。\n${b}こ たべて、${c}こ もらいました。\nいま なんこ?`,
          speakText: `${th}が ${a}こ ありました。${b}こ たべて、${c}こ もらいました。いま なんこ?`,
          answer: a - b + c,
          data: { suffix: 'こ' },
          hints: ['1つめの おはなしから じゅんばんに けいさん', `${a} - ${b} = ${a - b}。つぎに ${a - b} + ${c}`],
          explain: `${a} - ${b} + ${c} = ${a - b + c}こ`,
        }
      }
      // ぎゃくさん: 「はじめに なんこ あった?」
      if (Math.random() < 0.5) {
        const b = rint(2, Math.min(9, sumMax - 1))
        const c = rint(1, Math.min(9, sumMax - b))
        return {
          prompt: `${th}を ${b}こ たべたら、${c}こ のこりました。\nはじめに なんこ ありましたか?`,
          speakText: `${th}を ${b}こ たべたら、${c}こ のこりました。はじめに なんこ ありましたか?`,
          answer: b + c,
          data: { suffix: 'こ' },
          hints: ['たべた ぶんを もとに もどして みよう', `のこりの ${c}こに たべた ${b}こを たすよ`],
          explain: `${c} + ${b} = ${b + c}こ(たべた ぶんを たす)`,
        }
      }
      const b = rint(2, Math.min(9, sumMax - 1))
      const first = rint(1, Math.min(9, sumMax - b))
      return {
        prompt: `${th}を ${b}こ もらったら、ぜんぶで ${first + b}こに なりました。\nはじめに なんこ ありましたか?`,
        speakText: `${th}を ${b}こ もらったら、ぜんぶで ${first + b}こに なりました。はじめに なんこ ありましたか?`,
        answer: first,
        data: { suffix: 'こ' },
        hints: ['もらった ぶんを とりのぞいて みよう', `ぜんぶの ${first + b}こから もらった ${b}こを ひくよ`],
        explain: `${first + b} - ${b} = ${first}こ(もらった ぶんを ひく)`,
      }
    },
  })

// ===== まえから ○ばんめ、うしろから △ばんめ → みんなで なんにん? =====
// max: みんなの人数の上限(10までの数の単元では 10 を渡す。既定は 9+9-1=17 まで)
export const lineUpTotal = ({ difficulty = 3, max = 17 } = {}) =>
  t({
    type: 'numpad',
    difficulty,
    make() {
      let a, b
      do {
        a = rint(2, 9)
        b = rint(2, 9)
      } while (a + b - 1 > max)
      return {
        prompt: `みみちゃんは まえから ${a}ばんめ、うしろから ${b}ばんめに います。\nみんなで なんにん?`,
        speakText: `みみちゃんは まえから ${a}ばんめ、うしろから ${b}ばんめ。みんなで なんにん?`,
        answer: a + b - 1,
        data: { suffix: 'にん' },
        hints: ['まえに なんにん? うしろに なんにん? みみちゃんは なんにん?', `まえに ${a - 1}にん、うしろに ${b - 1}にん、みみちゃん 1にん`],
        explain: `${a - 1} + ${b - 1} + 1 = ${a + b - 1}にん(みみちゃんを 2かい かぞえないよ)`,
      }
    },
  })

// ===== 3つに わける(10は 3と 2と □) =====
export const decomposeThree = ({ total = 10, difficulty = 3 } = {}) =>
  t({
    type: 'numpad',
    difficulty,
    make() {
      const a = rint(1, total - 2)
      const b = rint(1, total - 1 - a)
      return {
        prompt: `${total}は ${a}と ${b}と □`,
        speakText: `${total}は ${a}と ${b}と いくつ?`,
        answer: total - a - b,
        data: { suffix: '' },
        hints: [`${a}と ${b}を あわせると いくつ?`, `${a} + ${b} = ${a + b}。${total}から ${a + b}を ひこう`],
        explain: `${total}は ${a}と ${b}と ${total - a - b}`,
      }
    },
  })
