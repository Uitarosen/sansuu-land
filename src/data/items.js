// きせかえアイテム(§3.5)。スターで こうかん。
// 枠(slot)ごとに 価格の安い順に ならべる。既存の保存データ(ownedItems/equippedItems)を
// こわさないよう、従来のID・価格・枠は変えないこと(items.test.js が検証する)。
//
// 枠: avatar(きゃら)/ hat(ぼうし)/ face(めがね)/ accessory(かざり)/
//     pet(おともだち)/ background(はいけい)
export const SLOTS = [
  { id: 'avatar', label: 'きゃら', emoji: '🐰' },
  { id: 'hat', label: 'ぼうし', emoji: '🎩' },
  { id: 'face', label: 'めがね', emoji: '🕶️' },
  { id: 'accessory', label: 'かざり', emoji: '🎀' },
  { id: 'pet', label: 'おともだち', emoji: '🐥' },
  { id: 'background', label: 'はいけい', emoji: '🌈' },
]

// はじめから そうびしている もの。avatar は かならず 1つ えらばれている(はずせない)。
export const DEFAULT_EQUIPPED = {
  avatar: 'avatar-usagi',
  hat: null,
  face: null,
  accessory: 'ribbon-pink',
  pet: null,
  background: null,
}

const avatar = (key, name, emoji, price) => ({ id: `avatar-${key}`, name, emoji, slot: 'avatar', price })
const hat = (id, name, emoji, price, extra = {}) => ({ id, name, emoji, slot: 'hat', price, ...extra })
const face = (key, name, emoji, price) => ({ id: `face-${key}`, name, emoji, slot: 'face', price })
const acc = (id, name, emoji, price) => ({ id, name, emoji, slot: 'accessory', price })
const pet = (key, name, emoji, price) => ({ id: `pet-${key}`, name, emoji, slot: 'pet', price })
const bg = (key, name, emoji, price, css, deco) => ({ id: `bg-${key}`, name, emoji, slot: 'background', price, bg: css, deco })

export const items = [
  // ---- きゃら(顔が正面を向いた どうぶつだけ。めがね等が ずれないように) ----
  avatar('usagi', 'みみちゃん', '🐰', 0),
  avatar('neko', 'ねこちゃん', '🐱', 50),
  avatar('inu', 'わんちゃん', '🐶', 50),
  avatar('hamu', 'ハムちゃん', '🐹', 70),
  avatar('kuma', 'くまさん', '🐻', 80),
  avatar('buta', 'ぶたさん', '🐷', 90),
  avatar('panda', 'パンダ', '🐼', 100),
  avatar('kitsune', 'きつねさん', '🦊', 100),
  avatar('koala', 'コアラ', '🐨', 120),
  avatar('kaeru', 'けろちゃん', '🐸', 130),
  avatar('saru', 'おさるさん', '🐵', 150),
  avatar('tora', 'とらさん', '🐯', 180),
  avatar('raion', 'ライオン', '🦁', 200),
  avatar('unicorn', 'ユニコーン', '🦄', 300),

  // ---- ぼうし ----
  hat('strawberry', 'いちごピン', '🍓', 15),
  hat('hat-tulip', 'チューリップ', '🌷', 22),
  hat('star-clip', 'スターピン', '⭐', 25),
  hat('hat-balloon', 'ふうせん', '🎈', 26),
  hat('hat-sunflower', 'ひまわり', '🌻', 28),
  hat('crown', 'ティアラ', '👑', 30),
  hat('hat-mushroom', 'きのこ', '🍄', 32),
  hat('hat-cap', 'キャップ', '🧢', 35),
  hat('hat-icecream', 'ソフトクリーム', '🍦', 38),
  hat('rainbow', 'にじ', '🌈', 40),
  hat('hat-donut', 'ドーナツ', '🍩', 42),
  hat('hat-top', 'シルクハット', '🎩', 45),
  hat('hat-cupcake', 'カップケーキ', '🧁', 48),
  hat('hat-straw', 'つばひろぼうし', '👒', 50),
  hat('hat-grad', 'がくしゃぼう', '🎓', 60),
  hat('hat-glitter', 'かがやくほし', '🌟', 70),
  hat('hat-rocket', 'ロケット', '🚀', 90),
  hat('kuku-crown', '九九マスターかんむり', '👑', 0, { special: 'kuku' }),

  // ---- めがね・おけしょう(かおの まんなかに かさねる) ----
  face('sparkle', 'キラキラ', '✨', 25),
  face('glasses', 'まるめがね', '👓', 30),
  face('hearts', 'ハートのほっぺ', '💕', 35),
  face('sunglasses', 'サングラス', '🕶️', 40),
  face('goggles', 'ゴーグル', '🥽', 45),

  // ---- かざり(みぎしたに つく) ----
  acc('ribbon-pink', 'ピンクリボン', '🎀', 0),
  acc('heart', 'ハート', '💗', 18),
  acc('flower', 'おはな', '🌸', 20),
  acc('acc-note', 'おんぷ', '🎵', 20),
  acc('butterfly', 'ちょうちょ', '🦋', 22),
  acc('acc-candy', 'キャンディ', '🍭', 24),
  acc('acc-book', 'ほん', '📚', 25),
  acc('acc-bell', 'すず', '🔔', 28),
  acc('acc-ball', 'ボール', '⚽', 30),
  acc('acc-present', 'プレゼント', '🎁', 35),
  acc('acc-palette', 'パレット', '🎨', 38),
  acc('acc-teddy', 'ぬいぐるみ', '🧸', 40),
  acc('acc-mic', 'マイク', '🎤', 42),
  acc('acc-cake', 'ケーキ', '🍰', 45),
  acc('acc-gem', 'ほうせき', '💎', 80),
  acc('acc-trophy', 'トロフィー', '🏆', 100),

  // ---- おともだち(ひだりしたに ふわふわ ういている) ----
  pet('caterpillar', 'あおむし', '🐛', 28),
  pet('snail', 'かたつむり', '🐌', 30),
  pet('ladybug', 'てんとうむし', '🐞', 30),
  pet('bee', 'みつばち', '🐝', 35),
  pet('chick', 'ひよこ', '🐥', 40),
  pet('fish', 'おさかな', '🐠', 45),
  pet('turtle', 'かめさん', '🐢', 50),
  pet('duck', 'あひる', '🦆', 55),
  pet('octopus', 'たこさん', '🐙', 60),
  pet('hedgehog', 'ハリネズミ', '🦔', 70),
  pet('owl', 'ふくろう', '🦉', 80),

  // ---- はいけい(きゃらの うしろの ステージ) ----
  bg('meadow', 'おはなばたけ', '🌼', 40, 'linear-gradient(160deg, #E4F9D0 0%, #FFF4C2 100%)', ['🌼', '🌷', '🦋']),
  bg('sky', 'あおぞら', '☁️', 40, 'linear-gradient(180deg, #BFE8FF 0%, #F2FAFF 100%)', ['☁️', '☀️', '🐦']),
  bg('sea', 'うみ', '🌊', 60, 'linear-gradient(180deg, #A8E3FF 0%, #5FC3E8 100%)', ['🐚', '🐟', '💧']),
  bg('night', 'ほしぞら', '🌙', 60, 'linear-gradient(180deg, #2A2A66 0%, #6A55B5 100%)', ['⭐', '🌙', '✨']),
  bg('snow', 'ゆきのくに', '❄️', 70, 'linear-gradient(180deg, #DDF0FF 0%, #FFFFFF 100%)', ['❄️', '⛄', '✨']),
  bg('autumn', 'あきのもり', '🍁', 70, 'linear-gradient(160deg, #FFE3B8 0%, #FFC48F 100%)', ['🍁', '🍂', '🌰']),
  bg('candy', 'おかしのくに', '🍭', 80, 'linear-gradient(160deg, #FFD3EA 0%, #E2D2FF 100%)', ['🍬', '🍭', '🧁']),
  bg('space', 'うちゅう', '🪐', 100, 'linear-gradient(180deg, #14123A 0%, #4A2F8F 100%)', ['🪐', '🌟', '🚀']),
  bg('castle', 'おしろ', '🏰', 120, 'linear-gradient(160deg, #FFE0F0 0%, #CDBBFF 100%)', ['🏰', '👑', '✨']),
  bg('rainbow', 'にじの そら', '🌈', 150, 'linear-gradient(135deg, #FFC9D9 0%, #FFE9B8 25%, #D4F5C4 50%, #BFE6FF 75%, #E3D0FF 100%)', ['🌈', '☁️', '⭐']),
]

export const itemById = Object.fromEntries(items.map((i) => [i.id, i]))

export const itemsBySlot = (slot) => items.filter((i) => i.slot === slot)

// 持っているか。はじめから無料のもの(初期アバター等)は 保存データに無くても 持っている扱い。
// 特別アイテム(special)は 条件を満たして 付与されるまで 持っていない。
export const isOwned = (ownedIds, item) => ownedIds.includes(item.id) || (item.price === 0 && !item.special)
