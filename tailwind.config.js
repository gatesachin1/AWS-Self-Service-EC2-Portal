/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        aws: {
          orange:  '#FF9900',
          'orange-dark': '#E88B00',
          navy:    '#161E2D',
          'navy-light': '#1F2A3C',
          'navy-border': '#2D3A4F',
          squid:   '#232F3E',
          'squid-light': '#2D3A4F',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,.12), 0 1px 2px rgba(0,0,0,.08)',
        'card-hover': '0 4px 12px rgba(0,0,0,.15)',
      },
    },
  },
  plugins: [],
}
