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
        card: "#0f1729",
        border: "#1e2a47",
        neon: "#00ff87",
        neonDark: "#00cc6a",
        accent: "#ff0080",
        gold: "#ffd700",
        silver: "#c0c0c0",
        bronze: "#cd7f32",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 20px rgba(0, 255, 135, 0.3)",
        neonStrong: "0 0 40px rgba(0, 255, 135, 0.6)",
        accent: "0 0 20px rgba(255, 0, 128, 0.4)",
      },
      animation: {
        "pulse-neon": "pulseNeon 2s ease-in-out infinite",
      },
      keyframes: {
        pulseNeon: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0, 255, 135, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(0, 255, 135, 0.6)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
