/** @type {import('tailwindcss').Config} */
module.exports = {
  future: { hoverOnlyWhenSupported: true }, // los hover:* se aplican solo con mouse (en celular no quedan "pegados")
  content: ['./*.html', './servicios/*.html', './productos/*.html', './partials/*.html', './assets/*.js', './scripts/**/*.js'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Geist', 'sans-serif'],
        head: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Geist', 'sans-serif'],
      },
      colors: {
        // Club (producto propio): verde profundo, verde medio, dorado suave y crema; sobre el fondo oscuro del sitio
        club: { verde: '#14532d', medio: '#1f7a4d', oro: '#c9a227', crema: '#faf7f0' },
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
