import { useState, useMemo, Fragment } from 'react'
import { gradeList } from '../data/index.js'
import { useStore } from '../store/useStore.js'
import TopBar from '../components/common/TopBar.jsx'
import Button from '../components/common/Button.jsx'

// 保護者ダッシュボード(§3.6 / §5 画面11)。チャイルドロックつき。
export default function ParentScreen({ nav }) {
  const [gate, setGate] = useState(() => {
    const a = 10 + Math.floor(Math.random() * 80)
    const b = 10 + Math.floor(Math.random() * 80)
    return { a, b, answer: a + b, input: '', ok: false }
  })

  if (!gate.ok) {
    return (
      <div className="min-h-screen">
        <TopBar onBack={nav.back} title="おうちのかたへ" />
        <div className="flex flex-col items-center gap-5 p-8 mt-10">
          <div className="text-5xl">🔒</div>
          <p className="text-lg font-bold text-ink/70 text-center">
            おうちのかた かくにん
            <br />
            つぎの けいさんを いれてね
          </p>
          <div className="text-4xl font-extrabold text-ink tabular">
            {gate.a} + {gate.b} =
          </div>
          <input
            type="number"
            inputMode="numeric"
            value={gate.input}
            onChange={(e) => setGate({ ...gate, input: e.target.value })}
            className="w-40 h-16 text-center text-3xl font-extrabold rounded-2xl border-2 border-pink/50 bg-white"
          />
          <Button
            onClick={() => {
              if (Number(gate.input) === gate.answer) setGate({ ...gate, ok: true })
              else setGate({ ...gate, input: '' })
            }}
          >
            かくにん
          </Button>
        </div>
      </div>
    )
  }

  return <Dashboard nav={nav} />
}

function Dashboard({ nav }) {
  const [tab, setTab] = useState(useStore.getState().selectedGrade || 'grade1')
  const unitProgress = useStore((s) => s.unitProgress)
  const sub = useStore((s) => s.subSkillProgress)
  const studyCalendar = useStore((s) => s.studyCalendar)
  const settings = useStore((s) => s.settings)
  const updateSetting = useStore((s) => s.updateSetting)
  const setGrade = useStore((s) => s.setGrade)
  const resetAll = useStore((s) => s.resetAll)

  const grade = gradeList.find((g) => g.id === tab)

  // 苦手な問題タイプ(間違い上位)
  const wrongHistory = useStore((s) => s.wrongHistory)
  const weakUnits = useMemo(() => {
    return grade.units
      .map((u) => ({ u, score: unitProgress[u.id]?.masteryScore ?? 0 }))
      .filter((x) => x.score > 0 && x.score < 60)
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
  }, [grade, unitProgress])

  return (
    <div className="min-h-screen pb-10">
      <TopBar onBack={nav.back} title="学習ダッシュボード" />

      <div className="px-4 grid gap-4">
        {/* サマリー */}
        <div className="grid grid-cols-2 gap-3">
          <Stat label="がんばった日数" value={`${studyCalendar.length}日`} />
          <Stat
            label="マスターした単元"
            value={`${Object.values(unitProgress).filter((p) => p.mastered).length}こ`}
          />
        </div>

        {/* 学年タブ */}
        <div className="flex gap-2">
          {gradeList.map((g) => (
            <button
              key={g.id}
              onClick={() => setTab(g.id)}
              className={`flex-1 h-11 rounded-full font-bold ${tab === g.id ? 'bg-pink text-white' : 'bg-white/80 text-ink/70'}`}
            >
              {g.title}
            </button>
          ))}
        </div>

        {/* 単元別理解度 */}
        <section className="bg-white/85 rounded-pop p-4 shadow-soft">
          <h3 className="font-extrabold text-ink mb-2">単元別 理解度</h3>
          <div className="grid gap-2">
            {grade.units.map((u) => {
              const sc = unitProgress[u.id]?.masteryScore ?? 0
              return (
                <div key={u.id} className="flex items-center gap-2 text-sm">
                  <span className="w-28 shrink-0 font-bold text-ink truncate">
                    {u.emoji} {u.title}
                  </span>
                  <div className="flex-1 h-3 rounded-full bg-pink/15 overflow-hidden">
                    <div
                      className={`h-full ${sc >= 90 ? 'bg-gold' : 'bg-pink'}`}
                      style={{ width: `${sc}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-bold text-ink/60">{sc}</span>
                </div>
              )
            })}
          </div>
        </section>

        {/* 苦手ポイント */}
        {weakUnits.length > 0 && (
          <section className="bg-cream/60 rounded-pop p-4 shadow-soft">
            <h3 className="font-extrabold text-ink mb-2">🔎 いま つまずいている単元</h3>
            <div className="flex flex-wrap gap-2">
              {weakUnits.map((x) => (
                <span key={x.u.id} className="px-3 py-1 rounded-full bg-white font-bold text-ink text-sm">
                  {x.u.title}({x.score})
                </span>
              ))}
            </div>
          </section>
        )}

        {/* 九九 段別ヒートマップ */}
        <section className="bg-white/85 rounded-pop p-4 shadow-soft">
          <h3 className="font-extrabold text-ink mb-2">九九 段別 習熟マップ</h3>
          <KukuHeatmap sub={sub} />
        </section>

        {/* 設定 */}
        <section className="bg-white/85 rounded-pop p-4 shadow-soft grid gap-3">
          <h3 className="font-extrabold text-ink">せってい</h3>
          <Toggle label="おと・BGM" value={settings.sound} onChange={(v) => updateSetting('sound', v)} />
          <Toggle label="ふりがな" value={settings.furigana} onChange={(v) => updateSetting('furigana', v)} />
          <Toggle
            label="ひっ算の くり上がりメモ"
            value={settings.carryMemo}
            onChange={(v) => updateSetting('carryMemo', v)}
          />
          <div className="flex items-center justify-between">
            <span className="font-bold text-ink">学年せってい</span>
            <div className="flex gap-2">
              {gradeList.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGrade(g.id)}
                  className={`px-3 h-10 rounded-full font-bold text-sm ${
                    useStore.getState().selectedGrade === g.id ? 'bg-lilac text-white' : 'bg-white border border-pink/40 text-ink'
                  }`}
                >
                  {g.title}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => {
              if (confirm('学習データを ぜんぶ けしますか?この そうさは もとに もどせません。')) resetAll()
            }}
            className="mt-1 h-11 rounded-full bg-white border-2 border-pink/40 text-pink font-bold"
          >
            データを リセット
          </button>
        </section>

        <p className="text-xs text-ink/40 text-center">
          データは この たんまつの中だけに ほぞんされます(§7 プライバシー)
        </p>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="bg-white/85 rounded-pop p-4 shadow-soft text-center">
      <div className="text-2xl font-extrabold text-ink">{value}</div>
      <div className="text-sm font-bold text-ink/50">{label}</div>
    </div>
  )
}

function Toggle({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-bold text-ink">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`w-16 h-9 rounded-full relative transition-colors ${value ? 'bg-pink' : 'bg-ink/20'}`}
      >
        <span
          className={`absolute top-1 w-7 h-7 rounded-full bg-white shadow transition-all ${value ? 'left-8' : 'left-1'}`}
        />
      </button>
    </div>
  )
}

function KukuHeatmap({ sub }) {
  const dans = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  const shade = (score) => {
    if (score >= 90) return '#F5DFA8'
    if (score >= 60) return '#B8F0DC'
    if (score >= 30) return '#FFF3C4'
    if (score > 0) return '#FFD6E7'
    return '#F0EAF2'
  }
  return (
    <div className="overflow-x-auto">
      <div className="inline-grid gap-0.5" style={{ gridTemplateColumns: 'auto repeat(9, 1fr)' }}>
        <div />
        {dans.map((b) => (
          <div key={b} className="text-[10px] text-center font-bold text-ink/50">
            {b}
          </div>
        ))}
        {dans.map((d) => {
          const score = sub[`kuku-dan-${d}`]?.masteryScore ?? 0
          return (
            <Fragment key={`row${d}`}>
              <div className="text-[10px] font-bold text-ink/50 pr-1 grid place-items-center">
                {d}
              </div>
              {dans.map((b) => (
                <div
                  key={`${d}-${b}`}
                  className="w-6 h-6 rounded-sm grid place-items-center text-[9px] text-ink/40"
                  style={{ background: shade(score) }}
                >
                  {d * b}
                </div>
              ))}
            </Fragment>
          )
        })}
      </div>
      <div className="flex gap-3 mt-2 text-[11px] text-ink/50">
        <span>🟨 マスター</span>
        <span>🟩 あと少し</span>
        <span>🟧 れんしゅう中</span>
      </div>
    </div>
  )
}
