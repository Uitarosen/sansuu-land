import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { itemsBySlot, SLOTS, isOwned } from '../data/items.js'
import { useStore } from '../store/useStore.js'
import { sfx } from '../lib/sound.js'
import TopBar from '../components/common/TopBar.jsx'
import Character from '../components/common/Character.jsx'
import Button from '../components/common/Button.jsx'
import Confetti from '../components/common/Confetti.jsx'

// きせかえ(§5 画面9 / §3.5)。枠ごとのタブで えらび、スターで こうかん する。
// [きるラベル, はずすラベル]
const VERBS = {
  avatar: ['えらぶ', ''],
  hat: ['かぶる', 'はずす'],
  face: ['つける', 'はずす'],
  accessory: ['つける', 'はずす'],
  pet: ['つれていく', 'おやすみ'],
  background: ['つかう', 'やめる'],
}

// 特別アイテム(九九マスター等)は 手に入れるまで 一覧に出さない
const visibleItems = (slot, owned) => itemsBySlot(slot).filter((it) => !it.special || owned.includes(it.id))

function Swatch({ it }) {
  // はいけいは 実際の色を見せる
  if (it.slot === 'background') {
    return (
      <span
        className="w-16 h-12 rounded-xl grid place-items-center text-2xl shadow-soft"
        style={{ background: it.bg }}
      >
        {it.emoji}
      </span>
    )
  }
  return <span className={it.slot === 'avatar' ? 'text-5xl' : 'text-4xl'}>{it.emoji}</span>
}

export default function KisekaeScreen({ nav }) {
  const stars = useStore((s) => s.stars)
  const owned = useStore((s) => s.ownedItems)
  const equipped = useStore((s) => s.equippedItems)
  const purchaseItem = useStore((s) => s.purchaseItem)
  const equipItem = useStore((s) => s.equipItem)

  const [slot, setSlot] = useState('avatar')
  const [confirmItem, setConfirmItem] = useState(null) // こうかん前の かくにん中
  const [got, setGot] = useState(null) // こうかんした ばかりの アイテム(お祝い表示)

  useEffect(() => {
    if (!got) return undefined
    const timer = setTimeout(() => setGot(null), 2400)
    return () => clearTimeout(timer)
  }, [got])

  const list = visibleItems(slot, owned)

  const buy = (it) => {
    purchaseItem(it)
    // 買えたかは ストアの結果で判定する(スター不足などで買えなかった場合に お祝いしない)
    if (useStore.getState().ownedItems.includes(it.id)) {
      sfx.fanfare()
      setGot(it)
    }
    setConfirmItem(null)
  }

  return (
    <div className="min-h-screen pb-10">
      <TopBar onBack={nav.back} title="きせかえ 👗" stars={stars} />

      <div className="flex justify-center py-3">
        <Character size="text-9xl" stage />
      </div>

      {/* 枠のタブ */}
      <div className="flex gap-2 px-4 mb-3 overflow-x-auto pb-1">
        {SLOTS.map((s) => {
          const all = visibleItems(s.id, owned)
          const have = all.filter((it) => isOwned(owned, it)).length
          return (
            <button
              key={s.id}
              onClick={() => {
                sfx.tap()
                setSlot(s.id)
              }}
              className={`punipuni shrink-0 px-3 py-2 rounded-2xl font-bold shadow-soft flex flex-col items-center min-w-[72px] ${
                slot === s.id ? 'bg-pink text-white' : 'bg-white/80 text-ink/70'
              }`}
            >
              <span className="text-2xl">{s.emoji}</span>
              <span className="text-xs">{s.label}</span>
              <span className="text-[10px] opacity-80">
                {have}/{all.length}
              </span>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 px-4">
        {list.map((it) => {
          const have = isOwned(owned, it)
          const isEquipped = equipped[it.slot] === it.id
          const canBuy = stars >= it.price
          const [onLabel, offLabel] = VERBS[it.slot]
          return (
            <motion.div
              key={it.id}
              whileTap={{ scale: 0.97 }}
              className={`rounded-pop shadow-soft p-3 flex flex-col items-center gap-1 ${
                isEquipped ? 'bg-pink/50 ring-4 ring-pink' : 'bg-white/85'
              }`}
            >
              <Swatch it={it} />
              <span className="text-sm font-bold text-ink text-center leading-tight">{it.name}</span>
              {have ? (
                it.slot === 'avatar' && isEquipped ? (
                  <span className="mt-1 h-10 grid place-items-center text-sm font-extrabold text-ink/70">✓ つかっているよ</span>
                ) : (
                  <button
                    onClick={() => {
                      sfx.star()
                      equipItem(it.slot, isEquipped ? null : it.id)
                    }}
                    className="punipuni mt-1 px-4 h-10 rounded-full bg-lavender/70 text-ink font-bold"
                  >
                    {isEquipped ? offLabel : onLabel}
                  </button>
                )
              ) : (
                <>
                  <button
                    disabled={!canBuy}
                    onClick={() => {
                      sfx.tap()
                      setConfirmItem(it)
                    }}
                    className="punipuni mt-1 px-3 h-10 rounded-full bg-gold text-ink font-bold disabled:opacity-40"
                  >
                    ⭐{it.price}
                  </button>
                  {!canBuy && <span className="text-[11px] font-bold text-ink/50">あと ⭐{it.price - stars}</span>}
                </>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* こうかん前の かくにん(まちがえて スターを つかわないように) */}
      {confirmItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/35 grid place-items-center p-6"
          onClick={() => setConfirmItem(null)}
        >
          <div
            className="bg-white rounded-pop shadow-soft p-6 w-full max-w-sm text-center grid gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid place-items-center">
              <Swatch it={confirmItem} />
            </div>
            <div className="text-xl font-extrabold text-ink">{confirmItem.name}</div>
            <p className="text-lg font-bold text-ink/80">⭐{confirmItem.price}で こうかん する?</p>
            <p className="text-sm font-bold text-ink/50">のこりは ⭐{stars - confirmItem.price} になるよ</p>
            <div className="flex gap-3 justify-center mt-1">
              <Button variant="ghost" onClick={() => setConfirmItem(null)} className="px-6 text-xl">
                やめる
              </Button>
              <Button onClick={() => buy(confirmItem)} className="px-6 text-xl">
                こうかん!
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* こうかんした直後の お祝い */}
      {got && (
        <>
          <Confetti count={30} />
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            className="fixed bottom-6 inset-x-0 z-50 grid place-items-center pointer-events-none"
          >
            <div className="bg-white rounded-full shadow-soft px-6 py-3 text-xl font-extrabold text-pink">
              🎉 {got.name} ゲット! そうびしたよ
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}
