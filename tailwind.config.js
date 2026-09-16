/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Geist', 'sans-serif'],
        head: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Geist', 'sans-serif'],
      },
      colors: {
        fv: {
          black: '#000000',
          surface: '#0D0E12',
          surface2: '#121319',
          border: '#1F232B',
          cyan: '#00FFFF',
          cyanMid: '#00CCFF',
          cyanDeep: '#0055A0',
          cyanGlow: '#CCFFFF',
          orange: '#FF8C00',
          orangeWarm: '#FF4500',
          gold: '#FFBF00',
          // Segundo par de acento, exclusivo de la línea Triángulo (Mid-Ticket):
          // la distingue visualmente de la línea Hexágono (cian/naranja) sin
          // romper el sistema — es una paleta secundaria formal, no un ad hoc.
          triGreen: '#4ade80',
          triPurple: '#a855f7',
        }
      }
    }
  },
  plugins: [],
};
