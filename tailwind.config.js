/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gy: {
          dark: "#0B0B0E",
          card: "#141419",
          cardHover: "#1A1A22",
          border: "#2A2A36",
          gold: "#D4AF37",
          goldHover: "#C5A059",
          goldLight: "#F3E5AB",
          goldMuted: "#8C7A4B",
          goldGlow: "rgba(212, 175, 55, 0.15)",
          parchment: "#F9F6F0",
          cream: "#FAF8F5",
          sand: "#EFECE6",
          charcoal: "#1F1F26",
          slate: "#8E8E9B",
          text: "#E5E5EB",
          textMuted: "#A3A3B3",
          accentRed: "#E54D4D",
          accentGreen: "#30A46C",
          accentBlue: "#3E63DD",
          accentPurple: "#8E4EC6",
        },
      },
      fontFamily: {
        sans: ["Aptos", "Aptos Display", "Segoe UI", "Inter", "system-ui", "sans-serif"],
        serif: ["Aptos Display", "Playfair Display", "Georgia", "serif"],
        aptos: ["Aptos", "Aptos Display", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        gold: "0 4px 24px -2px rgba(212, 175, 55, 0.3)",
        card: "0 4px 28px 0 rgba(0, 0, 0, 0.5)",
        glow: "0 0 20px rgba(212, 175, 55, 0.35)",
      },
    },
  },
  plugins: [],
};
