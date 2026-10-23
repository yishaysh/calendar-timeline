/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: '#fbf9f4',
          100: '#f6f1e6',
          200: '#ece1cc',
          300: '#decca9',
          400: '#ceb282',
          500: '#c19c62',
          600: '#b48550',
          700: '#966a42',
          800: '#7a553a',
          900: '#634631',
        },
        slateTheme: {
          850: '#151f30',
          900: '#0f172a',
          950: '#080d19',
        },
        hebrewGold: {
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
        }
      },
      fontFamily: {
        sans: ['Assistant', 'Heebo', 'system-ui', 'sans-serif'],
        serif: ['David Libre', 'Frank Ruhl Libre', 'serif'],
      },
      boxShadow: {
        'glow-gold': '0 0 20px rgba(234, 179, 8, 0.35)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.35)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.35)',
      }
    },
  },
  plugins: [],
}
