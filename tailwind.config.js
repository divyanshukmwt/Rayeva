/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        forest: {
          50: "#f0f7f0",
          100: "#dceedd",
          200: "#b8ddb9",
          300: "#87c489",
          400: "#56a659",
          500: "#348a37",
          600: "#246e27",
          700: "#1d5820",
          800: "#1a461c",
          900: "#163b18",
        },
        sand: {
          50: "#fdfaf5",
          100: "#faf3e7",
          200: "#f3e4c8",
          300: "#e9d0a0",
          400: "#ddb870",
          500: "#d4a04a",
          600: "#c0893a",
          700: "#a06e2f",
          800: "#83592a",
          900: "#6b4923",
        },
        charcoal: {
          800: "#1c1f1a",
          900: "#111310",
        },
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease forwards",
        "fade-in": "fadeIn 0.4s ease forwards",
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: 0, transform: "translateY(20px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
