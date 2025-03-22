/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        nexa: ['Nexa', 'sans-serif']
      },
      colors: {
        "primary-400": "#0F96C1",
        "primary-500": "#0F96C1",
        "primary-600": "#086E8E",
        "gray-primary-400": "#D9D9D9",
        "gray-secondary-500": "#969696",
        "gray-tertiary-600": "#646464",
        "gray-tertiary-700": "#323232",
        "red-primary-400": "#e11d27",
        "red-primary-500": "#FF5353",
        "blue-primary-400": "#3E33A8",
        "blue-secondary-500": "#6346fa",
        "blue-secondary-600": "#32000af",
        "black-primary-400": "#000",
        "black-secondary-500": "#303030",
        "white-primary-400": "#ffffff",
        "base-gray-200": "#f1f1f1",
        "shade-orange": "#CEA741",
        "blue-shade": "#5E7FF2",
        "primary-yellow": "#FBBF27",
        "gray-shade-400": "#EEEEEE",
        "gray-nav-400": "#F9F9F9",
        "gray-alt-300": "#D9D9D9"
      },
      screens: {
        xs: "480px",
        sm: "768px",
        md: "1060px",
      }
    },
  },
  plugins: [],
};