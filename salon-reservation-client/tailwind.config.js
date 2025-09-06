/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // 클래스 기반 다크 모드
  theme: {
    extend: {
      colors: {
        // 다크 모드 색상 팔레트
        dark: {
          50: '#1a1b3a',
          100: '#0f0f23',
          200: '#08081b',
          300: '#05051a',
          card: 'rgba(255, 255, 255, 0.05)',
          'card-hover': 'rgba(255, 255, 255, 0.08)',
          border: 'rgba(255, 255, 255, 0.1)',
          'border-hover': 'rgba(255, 255, 255, 0.2)',
          text: '#e1e7ef',
          'text-secondary': '#9ca3af',
          'text-muted': '#6b7280',
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.15)',
          'light-hover': 'rgba(255, 255, 255, 0.25)',
          dark: 'rgba(255, 255, 255, 0.05)',
          'dark-hover': 'rgba(255, 255, 255, 0.08)',
        }
      },
      backgroundColor: {
        'glass-light': 'rgba(255, 255, 255, 0.15)',
        'glass-dark': 'rgba(255, 255, 255, 0.05)',
      },
      backdropBlur: {
        'glass': '12px',
      },
      boxShadow: {
        'glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
        'glass-inset-light': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.3)',
        'glass-inset-dark': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
      },
      animation: {
        'theme-transition': 'all 200ms ease-in-out',
      }
    },
  },
  plugins: [],
}