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
        bg: {
          DEFAULT: "#07070D",
          subtle: "#0F0F1A",
          card: "#14141F",
          elevated: "#1C1C2D",
          border: "rgba(242, 193, 46, 0.15)",
        },
        gold: {
          DEFAULT: "#F2C12E",
          hover: "#FFD966",
          dim: "rgba(242, 193, 46, 0.15)",
        },
        crimson: {
          DEFAULT: "#E63946",
          dim: "rgba(230, 57, 70, 0.15)",
        },
        mint: {
          DEFAULT: "#5DCAA5",
          dim: "rgba(93, 202, 165, 0.15)",
        },
        cream: {
          DEFAULT: "#F5F0E8",
          muted: "#8E8DA8",
          darker: "#555469",
        },
      },
      fontFamily: {
        display: ["'Syne'", "'Bebas Neue'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(0.98)" },
        },
        equalizer1: {
          "0%, 100%": { height: "4px" },
          "50%": { height: "16px" },
        },
        equalizer2: {
          "0%, 100%": { height: "14px" },
          "50%": { height: "6px" },
        },
        equalizer3: {
          "0%, 100%": { height: "8px" },
          "50%": { height: "18px" },
        },
      },
      animation: {
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "eq-1": "equalizer1 0.8s ease-in-out infinite",
        "eq-2": "equalizer2 0.7s ease-in-out infinite 0.2s",
        "eq-3": "equalizer3 0.9s ease-in-out infinite 0.4s",
      },
    },
  },
  plugins: [],
};

export default config;
