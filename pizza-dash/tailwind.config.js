/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pizza: {
          red: '#D32F2F',
          'red-dark': '#B71C1C',
          'red-light': '#EF5350',
          orange: '#FF6F00',
          'orange-light': '#FFB300',
          cream: '#FFF8E1',
          'cream-dark': '#FFECB3',
          brown: '#5D4037',
          'brown-light': '#8D6E63',
          green: '#2E7D32',
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'bounce-gentle': 'bounce 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-red': 'pulseRed 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseRed: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(211, 47, 47, 0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(211, 47, 47, 0)' },
        },
      },
    },
  },
  plugins: [],
}
