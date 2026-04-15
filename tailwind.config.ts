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
        // Terracotta/brick brand palette — warm, artisanal
        brand: {
          50:  "#fdf4ef",
          100: "#fae3d3",
          200: "#f5c4a5",
          300: "#ed9d6e",
          400: "#e3733e",
          500: "#c9501e",  // Main terracotta
          600: "#a83e16",
          700: "#8a3112",
          800: "#6e2810",
          900: "#57200d",
        },
        // Rich warm cream backgrounds
        cream: {
          50:  "#fdf9f3",
          100: "#f9f0e3",
          200: "#f2e2c8",
          300: "#e6cda4",
          400: "#d4ad78",
        },
        // Sepia tones for accents
        sepia: {
          50:  "#faf5ee",
          100: "#f2e8d6",
          200: "#e2ceae",
          300: "#c9a87a",
          400: "#a07c4a",
          500: "#7a5c33",
        },
        // Charcoal for text
        charcoal: {
          700: "#3a3230",
          800: "#2a2220",
          900: "#1a1410",
        },
      },
      fontFamily: {
        sans:    ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
        craft:   ["var(--font-dm-serif)", "Georgia", "serif"],
      },
      backgroundImage: {
        "terracotta-gradient": "linear-gradient(135deg, #8a3112 0%, #c9501e 50%, #a83e16 100%)",
        "warm-gradient":       "linear-gradient(180deg, #fdf9f3 0%, #f2e2c8 100%)",
        "card-gradient":       "linear-gradient(145deg, #fdf9f3 0%, #f9f0e3 100%)",
      },
      boxShadow: {
        "card":    "0 2px 12px rgba(90,40,15,0.08), 0 1px 3px rgba(90,40,15,0.05)",
        "card-hover": "0 8px 30px rgba(90,40,15,0.14), 0 2px 8px rgba(90,40,15,0.08)",
        "badge":   "0 1px 4px rgba(90,40,15,0.2)",
        "header":  "0 4px 24px rgba(90,40,15,0.25)",
        "pill":    "0 1px 6px rgba(90,40,15,0.12)",
        "highlight": "0 0 0 2.5px rgba(201,80,30,0.3), 0 4px 16px rgba(201,80,30,0.2)",
      },
      animation: {
        "fade-in":   "fadeIn 0.4s ease-out",
        "slide-up":  "slideUp 0.4s ease-out",
        "slide-in":  "slideIn 0.35s cubic-bezier(0.22,1,0.36,1)",
        "scale-in":  "scaleIn 0.3s cubic-bezier(0.22,1,0.36,1)",
        "shimmer":   "shimmer 2s linear infinite",
        "pulse-dot": "pulseDot 2s cubic-bezier(0.4,0,0.6,1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%":   { opacity: "0", transform: "translateX(-12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.4" },
        },
      },
      borderRadius: {
        "2.5xl": "1.25rem",
        "3xl":   "1.5rem",
        "4xl":   "2rem",
      },
    },
  },
  plugins: [],
};
export default config;
