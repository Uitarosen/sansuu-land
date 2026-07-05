// きせかえアイテム(§3.5)。スターで こうかん。
export const items = [
  { id: 'ribbon-pink', name: 'ピンクリボン', emoji: '🎀', slot: 'accessory', price: 0 },
  { id: 'crown', name: 'ティアラ', emoji: '👑', slot: 'hat', price: 30 },
  { id: 'flower', name: 'おはな', emoji: '🌸', slot: 'accessory', price: 20 },
  { id: 'star-clip', name: 'スターピン', emoji: '⭐', slot: 'hat', price: 25 },
  { id: 'strawberry', name: 'いちごピン', emoji: '🍓', slot: 'hat', price: 15 },
  { id: 'heart', name: 'ハート', emoji: '💗', slot: 'accessory', price: 18 },
  { id: 'butterfly', name: 'ちょうちょ', emoji: '🦋', slot: 'accessory', price: 22 },
  { id: 'rainbow', name: 'にじ', emoji: '🌈', slot: 'hat', price: 40 },
  { id: 'kuku-crown', name: '九九マスターかんむり', emoji: '👑', slot: 'hat', price: 0, special: 'kuku' },
]

export const itemById = Object.fromEntries(items.map((i) => [i.id, i]))
