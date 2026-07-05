import { motion } from 'framer-motion'
import { items } from '../data/items.js'
import { useStore } from '../store/useStore.js'
import { sfx } from '../lib/sound.js'
import TopBar from '../components/common/TopBar.jsx'
import Character from '../components/common/Character.jsx'

// きせかえ(§5 画面9 / §3.5)
export default function KisekaeScreen({ nav }) {
  const stars = useStore((s) => s.stars)
  const owned = useStore((s) => s.ownedItems)
  const equipped = useStore((s) => s.equippedItems)
  const buyItem = useStore((s) => s.buyItem)
  const equipItem = useStore((s) => s.equipItem)

  return (
    <div className="min-h-screen pb-10">
      <TopBar onBack={nav.back} title="きせかえ 👗" stars={stars} />

      <div className="flex justify-center py-4">
        <div className="scale-150 my-6">
          <Character size="text-8xl" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 px-4">
        {items
          .filter((it) => !it.special || owned.includes(it.id))
          .map((it) => {
            const isOwned = owned.includes(it.id)
            const isEquipped = equipped[it.slot] === it.id
            const canBuy = stars >= it.price
            return (
              <motion.div
                key={it.id}
                whileTap={{ scale: 0.96 }}
                className={`rounded-pop shadow-soft p-3 flex flex-col items-center gap-1 ${
                  isEquipped ? 'bg-pink/50 ring-4 ring-pink' : 'bg-white/85'
                }`}
              >
                <span className="text-4xl">{it.emoji}</span>
                <span className="text-sm font-bold text-ink text-center">{it.name}</span>
                {isOwned ? (
                  <button
                    onClick={() => {
                      sfx.star()
                      equipItem(it.slot, isEquipped ? null : it.id)
                    }}
                    className="punipuni mt-1 px-4 h-10 rounded-full bg-lavender/70 text-ink font-bold"
                  >
                    {isEquipped ? 'はずす' : 'きる'}
                  </button>
                ) : (
                  <button
                    disabled={!canBuy}
                    onClick={() => {
                      sfx.star()
                      buyItem(it)
                    }}
                    className="punipuni mt-1 px-3 h-10 rounded-full bg-gold text-ink font-bold disabled:opacity-40"
                  >
                    ⭐{it.price}
                  </button>
                )}
              </motion.div>
            )
          })}
      </div>
    </div>
  )
}
