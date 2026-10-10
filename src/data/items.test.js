// きせかえアイテムのデータ整合性テスト。
import { describe, it, expect } from 'vitest'
import { items, itemById, SLOTS, DEFAULT_EQUIPPED, itemsBySlot, isOwned } from './items.js'

describe('きせかえデータ', () => {
  it('idは一意で、itemByIdから引ける', () => {
    const ids = items.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const it of items) expect(itemById[it.id]).toBe(it)
  })

  it('既存の保存データを壊さないよう、従来のアイテムID・価格・枠を維持している', () => {
    const legacy = {
      'ribbon-pink': ['accessory', 0],
      crown: ['hat', 30],
      flower: ['accessory', 20],
      'star-clip': ['hat', 25],
      strawberry: ['hat', 15],
      heart: ['accessory', 18],
      butterfly: ['accessory', 22],
      rainbow: ['hat', 40],
      'kuku-crown': ['hat', 0],
    }
    for (const [id, [slot, price]] of Object.entries(legacy)) {
      expect(itemById[id], `${id} が消えている`).toBeTruthy()
      expect(itemById[id].slot).toBe(slot)
      expect(itemById[id].price).toBe(price)
    }
    expect(itemById['kuku-crown'].special).toBe('kuku')
  })

  it('すべてのアイテムが 名前・絵文字・既知の枠・0以上の整数価格を持つ', () => {
    const slotIds = SLOTS.map((s) => s.id)
    for (const it of items) {
      expect(it.name, it.id).toBeTruthy()
      expect(it.emoji, it.id).toBeTruthy()
      expect(slotIds, `${it.id} の枠が不明`).toContain(it.slot)
      expect(Number.isInteger(it.price) && it.price >= 0, `${it.id} 価格`).toBe(true)
    }
  })

  it('特別アイテム(special)以外で、無料なのは初期装備だけ', () => {
    const free = items.filter((i) => i.price === 0 && !i.special).map((i) => i.id)
    expect(free.sort()).toEqual(['avatar-usagi', 'ribbon-pink'].sort())
  })

  it('各枠に十分な数のアイテムがあり、アバターは10種類以上ある', () => {
    for (const s of SLOTS) {
      expect(itemsBySlot(s.id).length, `${s.id} が少ない`).toBeGreaterThanOrEqual(5)
    }
    expect(itemsBySlot('avatar').length).toBeGreaterThanOrEqual(10)
    expect(items.length).toBeGreaterThanOrEqual(60)
  })

  it('各枠は 価格の安い順に並び、手が届く安いアイテムと長期目標の高いアイテムの両方がある', () => {
    for (const s of SLOTS) {
      const list = itemsBySlot(s.id).filter((i) => !i.special)
      const prices = list.map((i) => i.price)
      expect(prices, `${s.id} が価格順でない`).toEqual([...prices].sort((a, b) => a - b))
    }
    const buyable = items.filter((i) => !i.special && i.price > 0).map((i) => i.price)
    expect(Math.min(...buyable)).toBeLessThanOrEqual(30) // すぐ買える
    expect(Math.max(...buyable)).toBeGreaterThanOrEqual(200) // ずっと貯める目標
  })

  it('初期装備(DEFAULT_EQUIPPED)は実在し、枠が一致し、はじめから使える', () => {
    expect(DEFAULT_EQUIPPED.avatar).toBe('avatar-usagi')
    for (const [slot, id] of Object.entries(DEFAULT_EQUIPPED)) {
      expect(SLOTS.map((s) => s.id)).toContain(slot)
      if (id) {
        expect(itemById[id], id).toBeTruthy()
        expect(itemById[id].slot).toBe(slot)
        expect(isOwned([], itemById[id]), `${id} は初期状態で持っているはず`).toBe(true)
      }
    }
    // アバターは必ず1つ選ばれている(はずせない)
    expect(DEFAULT_EQUIPPED.avatar).toBeTruthy()
  })

  it('はいけいは背景(CSS)とかざり絵文字を持つ', () => {
    for (const b of itemsBySlot('background')) {
      expect(b.bg, `${b.id} bg`).toMatch(/gradient|#/)
      expect(Array.isArray(b.deco) && b.deco.length >= 2, `${b.id} deco`).toBe(true)
    }
  })

  it('アバターは同じ絵文字が重複しない', () => {
    const emojis = itemsBySlot('avatar').map((a) => a.emoji)
    expect(new Set(emojis).size).toBe(emojis.length)
  })
})

describe('isOwned', () => {
  it('持っているIDか、はじめから無料のアイテムなら true', () => {
    expect(isOwned([], itemById['avatar-usagi'])).toBe(true)
    expect(isOwned([], itemById.crown)).toBe(false)
    expect(isOwned(['crown'], itemById.crown)).toBe(true)
  })
  it('特別アイテムは条件を満たして付与されるまで持っていない扱い', () => {
    expect(isOwned([], itemById['kuku-crown'])).toBe(false)
    expect(isOwned(['kuku-crown'], itemById['kuku-crown'])).toBe(true)
  })
})
