/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        aws: {
          orange:       '#FF9900',
          'orange-dk':  '#E68900',
          squid:        '#232F3E',
          'squid-lt':   '#2D3A4F',
          navy:         '#161E2D',
          'navy-lt':    '#1F2A3C',
          border:       '#30363D',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'Cascadia Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
