/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary brand accent — kept under the `aws-*` namespace so every
        // existing reference (buttons, active states, badges) re-themes for
        // free; the token names are legacy, the values are the new blue.
        aws: {
          orange:       '#4F6EF7',
          'orange-dk':  '#3B57E0',
          squid:        '#232F3E',
          'squid-lt':   '#2D3A4F',
          navy:         '#161E2D',
          'navy-lt':    '#1F2A3C',
          border:       '#30363D',
        },
        brand: {
          50:  '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          400: '#818CF8',
          500: '#4F6EF7',
          600: '#3B57E0',
          700: '#2F44B8',
        },
        surface: {
          DEFAULT: '#F3F5FB',
          card:    '#FFFFFF',
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
