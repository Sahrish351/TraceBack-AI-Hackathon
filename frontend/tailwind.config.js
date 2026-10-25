/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: "#FAF8F3",
        forest: {
          DEFAULT: "#143D2F",
          hover: "#0D2A20",
          light: "#1B4F3D"
        },
        primary: {
          DEFAULT: "#246B52",
          hover: "#1D5642",
          light: "#2E8566",
          50: "#F2F8F5",
          100: "#E2F0EA"
        },
        sage: {
          DEFAULT: "#DCEBE1",
          light: "#EAF3ED",
          dark: "#B8D4C3"
        },
        graphite: {
          DEFAULT: "#202720",
          muted: "#667066",
          light: "#8F9A8F"
        },
        coral: {
          DEFAULT: "#C66A4A",
          hover: "#B05A3B",
          light: "#FDF1ED",
          border: "#F3C5B5"
        },
        subtle: "#E5E7E2"
      },
      fontFamily: {
        sans: ["'DM Sans'", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        serif: ["'DM Serif Display'", "Georgia", "serif"],
        mono: ["'JetBrains Mono'", "Courier New", "monospace"]
      },
      boxShadow: {
        card: "0 1px 3px rgba(32, 39, 32, 0.05), 0 1px 2px rgba(32, 39, 32, 0.03)",
        elevated: "0 4px 12px rgba(20, 61, 47, 0.08), 0 1px 3px rgba(20, 61, 47, 0.04)",
        modal: "0 12px 32px rgba(20, 61, 47, 0.16), 0 2px 6px rgba(20, 61, 47, 0.06)"
      }
    },
  },
  plugins: [],
}
