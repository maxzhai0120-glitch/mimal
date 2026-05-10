/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dota: {
          red: '#ff4b4b',
          green: '#4bff4b',
          blue: '#4b4bff',
          gold: '#ffd700',
          dark: '#1a1a2e',
          card: '#16213e',
        },
      },
    },
  },
  plugins: [],
};
