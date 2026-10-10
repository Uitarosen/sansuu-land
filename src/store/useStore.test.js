// ストアの「スターでこうかん」まわりのテスト(購入・装備・保存データの互換)。
import { describe, it, expect, beforeEach, vi } from 'vitest'

// persist が使う localStorage を最小のスタブに(Node環境にはないため)。
const mem = new Map()
vi.stubGlobal('localStorage', {
  getItem: (k) => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => mem.set(k, String(v)),
  removeItem: (k) => mem.delete(k),
})

const { useStore } = await import('./useStore.js')
const { itemById, DEFAULT_EQUIPPED } = await import('../data/items.js')

const fresh = () => useStore.setState({ stars: 0, ownedItems: ['ribbon-pink'], equippedItems: { ...DEFAULT_EQUIPPED } })

describe('きせかえの購入と装備', () => {
  beforeEach(fresh)

  it('初期装備にアバターが入っている', () => {
    expect(useStore.getState().equippedItems.avatar).toBe('avatar-usagi')
  })

  it('スターが足りないと買えず、装備もされない', () => {
    useStore.setState({ stars: 10 })
    useStore.getState().purchaseItem(itemById['avatar-neko'])
    const s = useStore.getState()
    expect(s.stars).toBe(10)
    expect(s.ownedItems).not.toContain('avatar-neko')
    expect(s.equippedItems.avatar).toBe('avatar-usagi')
  })

  it('スターが足りれば 買って、スターが減り、その場で装備される', () => {
    useStore.setState({ stars: 100 })
    useStore.getState().purchaseItem(itemById.crown) // 30
    const s = useStore.getState()
    expect(s.stars).toBe(70)
    expect(s.ownedItems).toContain('crown')
    expect(s.equippedItems.hat).toBe('crown')
  })

  it('同じものを2回買っても スターは1回ぶんしか減らない', () => {
    useStore.setState({ stars: 100 })
    useStore.getState().purchaseItem(itemById.crown)
    useStore.getState().purchaseItem(itemById.crown)
    expect(useStore.getState().stars).toBe(70)
    expect(useStore.getState().ownedItems.filter((x) => x === 'crown').length).toBe(1)
  })

  it('アバターを買うと装備が切り替わり、他の枠の装備は変わらない', () => {
    useStore.setState({ stars: 500 })
    useStore.getState().purchaseItem(itemById['bg-night'])
    useStore.getState().purchaseItem(itemById['avatar-neko'])
    const e = useStore.getState().equippedItems
    expect(e.avatar).toBe('avatar-neko')
    expect(e.background).toBe('bg-night')
    expect(e.accessory).toBe('ribbon-pink')
  })

  it('持っているものは無料でつけかえでき、枠をからにすることもできる', () => {
    useStore.setState({ stars: 100, ownedItems: ['ribbon-pink', 'crown'] })
    useStore.getState().equipItem('hat', 'crown')
    expect(useStore.getState().equippedItems.hat).toBe('crown')
    useStore.getState().equipItem('hat', null)
    expect(useStore.getState().equippedItems.hat).toBeNull()
    expect(useStore.getState().stars).toBe(100)
  })

  it('もっていないアイテムは equipItem でも装備できない(購入をすり抜けない)', () => {
    useStore.getState().equipItem('hat', 'crown')
    expect(useStore.getState().equippedItems.hat).toBeNull()
  })

  it('無料の初期アバターは、持ち物リストに無くても装備に戻せる(昔の保存データ対策)', () => {
    useStore.setState({ ownedItems: ['ribbon-pink', 'avatar-neko'], stars: 0 })
    useStore.getState().equipItem('avatar', 'avatar-neko')
    useStore.getState().equipItem('avatar', 'avatar-usagi')
    expect(useStore.getState().equippedItems.avatar).toBe('avatar-usagi')
  })

  it('resetAll で 初期装備に戻る(新しい枠も含む)', () => {
    useStore.setState({
      stars: 999,
      ownedItems: ['ribbon-pink', 'crown'],
      equippedItems: { ...DEFAULT_EQUIPPED, avatar: 'avatar-neko', hat: 'crown', pet: 'pet-chick' },
    })
    useStore.getState().resetAll()
    const s = useStore.getState()
    expect(s.stars).toBe(0)
    expect(s.ownedItems).toEqual(['ribbon-pink'])
    expect(s.equippedItems).toEqual(DEFAULT_EQUIPPED)
  })
})

describe('保存データの互換(アップデート前のデータ)', () => {
  it('古い equippedItems(hat/accessoryだけ)を読み込んでも、新しい枠の初期値が補われる', () => {
    const { merge } = useStore.persist.getOptions()
    const current = useStore.getState()
    const merged = merge({ stars: 42, ownedItems: ['ribbon-pink', 'crown'], equippedItems: { hat: 'crown', accessory: 'ribbon-pink' } }, current)
    expect(merged.stars).toBe(42)
    expect(merged.equippedItems.hat).toBe('crown')
    expect(merged.equippedItems.avatar).toBe('avatar-usagi')
    for (const slot of Object.keys(DEFAULT_EQUIPPED)) expect(slot in merged.equippedItems).toBe(true)
  })

  it('設定(settings)に新しい項目が増えても 既存の設定は保たれる', () => {
    const { merge } = useStore.persist.getOptions()
    const current = useStore.getState()
    const merged = merge({ settings: { sound: false } }, current)
    expect(merged.settings.sound).toBe(false)
    expect(merged.settings.furigana).toBe(current.settings.furigana)
  })
})
