/** @type {import('tailwindcss').Config} */
const aquamarina = {
  50: '#ECFFFC',
  100: '#D2FFF8',
  200: '#A7FFF0',
  300: '#69F4E1',
  400: '#2DDBC9',
  500: '#13B8A6',
  600: '#0D9488',
  700: '#0B756E',
  800: '#0D5E59',
  900: '#0F4F4B',
  950: '#062F2E',
};

const graphite = {
  50: '#F7FAF9',
  100: '#EEF4F2',
  200: '#DDE8E5',
  300: '#C4D4D0',
  400: '#91A9A3',
  500: '#647D77',
  600: '#465D58',
  700: '#334642',
  800: '#1F302E',
  900: '#101D1B',
  950: '#070D0C',
};

export default {
  content: ['./index.html', './src/index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: aquamarina,
        aquamarina,
        sky: aquamarina,
        cyan: aquamarina,
        teal: aquamarina,
        slate: graphite,
      },
      fontFamily: {
        sans: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 18px 50px -24px rgba(6, 47, 46, 0.32)',
      },
    },
  },
  plugins: [],
};
