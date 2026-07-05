/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // §4.1 カラーパレット
        pink: '#FFB7D5',
        lavender: '#D5C6FF',
        mint: '#B8F0DC',
        cream: '#FFF3C4',
        bg: '#FFF7FA',
        ink: '#5D4A55',
        // 小2ワールドアクセント
        lilac: '#C9A8E8',
        gold: '#F5DFA8',
      },
      fontFamily: {
        round: ['"M PLUS Rounded 1c"', '"Kosugi Maru"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        pop: '28px',
      },
      boxShadow: {
        soft: '0 8px 24px rgba(214, 150, 185, 0.25)',
        pop: '0 6px 0 rgba(0,0,0,0.08)',
      },
      keyframes: {
        wiggle: {
          '0%,100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pop: {
          '0%': { transform: 'scale(0.7)', opacity: '0' },
          '70%': { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        wiggle: 'wiggle 1.2s ease-in-out infinite',
        floaty: 'floaty 3s ease-in-out infinite',
        pop: 'pop 0.4s ease-out',
      },
    },
  },
  plugins: [],
}
