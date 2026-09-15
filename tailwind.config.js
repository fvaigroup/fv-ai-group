/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Inter', 'sans-serif'],
        head: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
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
        }
      }
    }
  },
  plugins: [],
};
