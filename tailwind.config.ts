import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0a0e1a",
        "bg-deep": "#05080F",
        card: "#0f1729",
        "card-hover": "#162038",
        border: "#1e2a47",
        "border-hover": "#2d3e66",
        neon: "#00ff87",
        neonDark: "#00cc6a",
        accent: "#ff0080",
        gold: "#ffd700",
        silver: "#c0c0c0",
        bronze: "#cd7f32",
        purple: "#9d4edd",
        win: "#00ff87",
        loss: "#ff3d5a",
        warning: "#ffb800",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        display: ["Bebas Neue", "Impact", "Arial Narrow", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 20px rgba(0, 255, 135, 0.3)",
        neonStrong: "0 0 40px rgba(0, 255, 135, 0.6)",
        accent: "0 0 20px rgba(255, 0, 128, 0.4)",
        gold: "0 0 30px rgba(255, 215, 0, 0.4)",
      },
      animation: {
        "pulse-neon": "pulseNeon 2s ease-in-out infinite",
        "fade-up": "fadeInUp 400ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "shake": "shake 300ms ease-in-out",
      },
      keyframes: {
        pulseNeon: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0, 255, 135, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(0, 255, 135, 0.6)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-5px) rotate(-5deg)" },
          "75%": { transform: "translateX(5px) rotate(5deg)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
