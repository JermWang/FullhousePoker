import type { Config } from "tailwindcss";

/**
 * Fullhouse Poker design tokens (neon after-dark reskin of Velvet).
 * Palette: deep-plum night / glowing teal felt / electric cobalt / gold / ivory.
 * Token NAMES are kept (charcoal, felt, velvet, ivory, ash) so existing utility
 * classes recolor automatically — only the VALUES moved to the neon palette.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep-plum night — base surfaces, chrome, felt rail. (Token kept named
        // `charcoal` for legacy reasons; the value is now plum.)
        charcoal: {
          DEFAULT: "#1a1030",
          50: "#f4eef7",
          900: "#0d0420",
          800: "#160a2e",
          700: "#241647",
          600: "#34225f",
        },
        // Primary text — ivory with a faint warm tint, high contrast on plum.
        ivory: {
          DEFAULT: "#f4eef7",
          muted: "#d4c9ec",
        },
        // Glowing teal felt — table felt, online status.
        felt: {
          DEFAULT: "#0e5d5a",
          light: "#14d2c8",
          dark: "#0a3f3d",
        },
        // Electric cobalt — the primary accent (buttons, raise, turn, glows).
        // (Token kept named `velvet` so existing classes recolor automatically.)
        velvet: {
          DEFAULT: "#3b82f6",
          soft: "#60a5fa",
          dim: "#1d4ed8",
        },
        // Gold — the secondary accent (mark, all-in, winnings, dealer button).
        amber: {
          DEFAULT: "#ffd24a",
          soft: "#ffe07a",
          deep: "#f5b820",
        },
        // Secondary text — muted lilac, lifted for readability on plum.
        ash: {
          DEFAULT: "#a594c2",
          dim: "#8173a3",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        elevated: "0 20px 60px -20px rgba(0,0,0,0.8)",
        velvet: "0 0 0 1px rgba(59,130,246,0.32)",
        amber: "0 0 0 1px rgba(255,210,74,0.32)",
      },
      backgroundImage: {
        "felt-radial":
          "radial-gradient(ellipse at center, #11827c 0%, #0e5d5a 52%, #0a3f3d 100%)",
        "charcoal-fade":
          "linear-gradient(180deg, #1a1030 0%, #0d0420 100%)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        "pulse-soft": "pulse-soft 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
