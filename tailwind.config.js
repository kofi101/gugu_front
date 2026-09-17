/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    screens: { sm: "640px", md: "768px", lg: "1024px", xl: "1280px" },
    extend: {
      fontFamily: {
        sans: ['"Archivo Variable"', "Archivo", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      colors: {
        // Intaglio ink scale derived from the GUGU brand blue #0F96C1.
        // White text is only allowed on 700 and darker (AA).
        ink: {
          50: "#EEF8FB",
          100: "#D8EFF6",
          200: "#B0DEEC",
          300: "#7CC8E0",
          400: "#56BCDD",
          500: "#0F96C1",
          600: "#0C7FA5",
          700: "#0A6A8A",
          800: "#0D526B",
          900: "#0B3F52",
          950: "#062532",
        },
        paper: { DEFAULT: "#F2F6F5", deep: "#E4ECEB", line: "#C9D8DC" },
        text: { DEFAULT: "#10222B", muted: "#4A5F68" },
        thread: { 300: "#F5C04A", 500: "#D69E1B", 700: "#8A5B00" },
        serial: { DEFAULT: "#B3261E", soft: "#FBE9E7" },
        leaf: { DEFAULT: "#1E6B3A", soft: "#E3F1E7" },
      },
      maxWidth: { shell: "80rem" },
      boxShadow: {
        lift: "0 1px 2px rgba(11,63,82,.08), 0 8px 24px -12px rgba(11,63,82,.25)",
        sheet: "0 -8px 32px -8px rgba(6,37,50,.35)",
      },
      keyframes: {
        draw: { from: { strokeDashoffset: "1" }, to: { strokeDashoffset: "0" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        "sheet-up": { from: { transform: "translateY(100%)" }, to: { transform: "translateY(0)" } },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
      },
      animation: {
        draw: "draw 2.4s cubic-bezier(.16,1,.3,1) forwards",
        shimmer: "shimmer 1.6s linear infinite",
        "sheet-up": "sheet-up .32s cubic-bezier(.16,1,.3,1)",
        "fade-in": "fade-in .2s ease-out",
      },
    },
  },
  plugins: [],
};
