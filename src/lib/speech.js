// Web Speech API による日本語読み上げ(§4.3)。
// ふりがな用の記号などは読み上げ前に整形する。
let enabled = true

export function setSpeechEnabled(v) {
  enabled = v
  if (!v) window.speechSynthesis?.cancel()
}

function clean(text) {
  return String(text)
    .replace(/[（(][^）)]*[）)]/g, '') // ルビ補助の丸括弧を除去
    .replace(/□/g, 'なに')
    .replace(/[✿♪👑⭐️★]/g, '')
    .replace(/＝|=/g, 'は')
    .replace(/\+/g, ' たす ')
    .replace(/[×✕]/g, ' かける ')
    .replace(/[－ー-]/g, ' ') // 記号の混同を避ける
    .trim()
}

export function speak(text) {
  if (!enabled) return
  const synth = window.speechSynthesis
  if (!synth) return
  synth.cancel()
  const u = new SpeechSynthesisUtterance(clean(text))
  u.lang = 'ja-JP'
  u.rate = 0.95
  u.pitch = 1.15
  synth.speak(u)
}

export function stopSpeaking() {
  window.speechSynthesis?.cancel()
}
