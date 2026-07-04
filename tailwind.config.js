/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        deep:       { 900: '#08080c', 800: '#0d0d11', 700: '#12121a', 600: '#181825' },
        glass:      { bg: 'rgba(22,22,36,0.55)', border: 'rgba(255,255,255,0.06)' },
        accent:     { blue: '#818cf8', purple: '#a78bfa', mint: '#34d399', pink: '#f472b6', amber: '#fbbf24', red: '#ef4444' },
      },
      fontFamily: { inter: ['Inter', 'system-ui', 'sans-serif'] },
      backdropBlur: { glass: '20px' },
      animation: {
        'float':    'float 4s ease-in-out infinite',
        'pulse-focus': 'pulse-focus 1.5s ease-in-out infinite',
        'slide-up': 'slide-up 0.35s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in':  'fade-in 0.2s ease',
        'modal-up': 'modal-up 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        'particle': 'particle-fly 0.7s cubic-bezier(0.16,1,0.3,1) forwards',
      },
      keyframes: {
        float:        { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-3px)' } },
        'pulse-focus':{ '0%,100%': { boxShadow: '0 0 0 0 rgba(129,140,248,0.6)' }, '50%': { boxShadow: '0 0 0 10px rgba(129,140,248,0)' } },
        'slide-up':   { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'fade-in':    { from: { opacity: '0' }, to: { opacity: '1' } },
        'modal-up':   { from: { opacity: '0', transform: 'translateY(20px) scale(0.97)' }, to: { opacity: '1', transform: 'translateY(0) scale(1)' } },
      },
    },
  },
  plugins: [],
};
