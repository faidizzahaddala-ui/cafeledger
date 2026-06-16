import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Coffee Brown Palette
        coffee: {
          50:  "#fdf8f0",
          100: "#f5e6cc",
          200: "#e8c99a",
          300: "#d9a86b",
          400: "#c8883c",
          500: "#8B4513",  // saddle brown
          600: "#7a3c10",
          700: "#5C2E0A",
          800: "#3E1A06",
          900: "#1F0D03",
        },
        // Cream Palette
        cream: {
          50:  "#FDFAF5",
          100: "#F5EDD8",
          200: "#ECD9B0",
          300: "#DFC48A",
          400: "#D0AE68",
          500: "#C19A50",
        },
        // Warm Neutrals
        espresso: "#2C1810",
        latte: "#C8A882",
        mocha: "#6B4226",
        caramel: "#D4874E",
        // Status
        profit: "#16a34a",
        loss:   "#dc2626",
        warn:   "#d97706",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Playfair Display", "serif"],
      },
      backgroundImage: {
        "coffee-gradient": "linear-gradient(135deg, #3E1A06 0%, #7a3c10 50%, #C8883C 100%)",
        "card-gradient":   "linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
      },
      boxShadow: {
        "card":       "0 4px 24px rgba(44, 24, 16, 0.25)",
        "card-hover": "0 8px 32px rgba(44, 24, 16, 0.40)",
        "glow-gold":  "0 0 20px rgba(212, 135, 78, 0.35)",
      },
      animation: {
        "fade-up":    "fadeUp 0.5s ease-out both",
        "fade-in":    "fadeIn 0.4s ease-out both",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer":    "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
