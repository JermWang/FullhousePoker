// Mirrors the actual site tokens from tailwind.config.ts and globals.css.
// Keep video art direction constrained to these values and public/ assets only.
export const theme = {
  colors: {
    charcoal: "#1a1030",
    charcoal900: "#0d0420",
    charcoal800: "#160a2e",
    charcoal700: "#241647",
    charcoal600: "#34225f",
    ivory: "#f4eef7",
    ivoryMuted: "#d4c9ec",
    felt: "#0e5d5a",
    feltLight: "#14d2c8",
    feltDark: "#0a3f3d",
    velvet: "#3b82f6",
    velvetSoft: "#60a5fa",
    velvetDim: "#1d4ed8",
    amber: "#ffd24a",
    ash: "#a594c2",
    ashDim: "#8173a3",
  },
  fonts: {
    display: '"Space Grotesk", system-ui, sans-serif',
    sans: 'system-ui, -apple-system, "Segoe UI", sans-serif',
    mono: 'ui-monospace, "SF Mono", "Cascadia Code", monospace',
  },
  radius: {
    xl: 14,
    xxl: 20,
  },
};
