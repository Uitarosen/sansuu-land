// 効果音(§4.3)。音源ファイルなしでも動くよう WebAudio で合成する。
// 正解=キラリン、スター=シャラン、ボタン=ぽよん、不正解=やさしいポン。
let ctx = null
let soundOn = true

export function setSoundEnabled(v) {
  soundOn = v
}

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (AC) ctx = new AC()
  }
  return ctx
}

function tone(freq, start, dur, type = 'sine', gain = 0.12) {
  const c = ac()
  if (!c) return
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  osc.connect(g)
  g.connect(c.destination)
  const t0 = c.currentTime + start
  g.gain.setValueAtTime(0, t0)
  g.gain.linearRampToValueAtTime(gain, t0 + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.start(t0)
  osc.stop(t0 + dur + 0.02)
}

export const sfx = {
  tap() {
    if (!soundOn) return
    tone(660, 0, 0.12, 'triangle', 0.08)
  },
  correct() {
    if (!soundOn) return
    tone(880, 0, 0.14, 'sine', 0.12)
    tone(1174, 0.09, 0.18, 'sine', 0.12)
    tone(1568, 0.18, 0.22, 'sine', 0.1)
  },
  star() {
    if (!soundOn) return
    tone(1318, 0, 0.1, 'triangle', 0.1)
    tone(1760, 0.08, 0.16, 'triangle', 0.09)
  },
  wrong() {
    if (!soundOn) return
    tone(392, 0, 0.16, 'sine', 0.09)
    tone(330, 0.12, 0.2, 'sine', 0.08)
  },
  fanfare() {
    if (!soundOn) return
    ;[523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.3, 'triangle', 0.11))
  },
}
