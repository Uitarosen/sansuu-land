import { sfx } from '../../lib/sound.js'

// 大きな角丸ボタン(§4.2 タップターゲット最小64px)
const styles = {
  primary: 'bg-pink text-white shadow-soft',
  lavender: 'bg-lavender text-white shadow-soft',
  mint: 'bg-mint text-ink shadow-soft',
  cream: 'bg-cream text-ink shadow-soft',
  ghost: 'bg-white/80 text-ink border-2 border-pink/40',
}

export default function Button({ children, onClick, variant = 'primary', className = '', ...rest }) {
  return (
    <button
      onClick={(e) => {
        sfx.tap()
        onClick?.(e)
      }}
      className={`punipuni min-h-[64px] px-8 rounded-pop font-bold text-2xl select-none ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
