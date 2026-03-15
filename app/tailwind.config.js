/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0f0f12',
        surface: '#1a1a1f',
        border: '#2d2d35',
      },
    },
  },
  plugins: [],
}
