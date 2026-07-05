import { speak } from '../../lib/speech.js'

// 音声読み上げボタン(§4.3)。どの画面でも同じ見た目。
export default function SpeakerButton({ text, className = '' }) {
  return (
    <button
      onClick={() => speak(text)}
      aria-label="よみあげ"
      className={`punipuni w-14 h-14 rounded-full bg-white/90 shadow-soft grid place-items-center text-2xl ${className}`}
    >
      🔊
    </button>
  )
}
