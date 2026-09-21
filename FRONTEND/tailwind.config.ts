import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0A0A0F", // Deep near-black background
        "background-dark": "#12121A", // Subtle dark gradient stop
        foreground: "#F5F5F7", // Off-white primary text
        surface: {
          DEFAULT: "rgba(18, 18, 26, 0.65)",
          elevated: "rgba(26, 26, 38, 0.75)",
          subtle: "rgba(255, 255, 255, 0.03)",
        },
        border: "rgba(255, 255, 255, 0.12)",
        muted: {
          DEFAULT: "#9A9AA6",
          dark: "#6B6B78",
        },
        // Accent 1 (critical / priority): Warm Red-Orange
        priority: {
          DEFAULT: "#FF6B4A",
          hover: "#FF8063",
          subtle: "rgba(255, 107, 74, 0.12)",
          border: "rgba(255, 107, 74, 0.35)",
        },
        // Accent 2 (normal / info): Teal-Cyan
        teal: {
          DEFAULT: "#3ED6C8",
          hover: "#5CE2D6",
          subtle: "rgba(62, 214, 200, 0.12)",
          border: "rgba(62, 214, 200, 0.35)",
        },
        info: {
          DEFAULT: "#3ED6C8",
          hover: "#5CE2D6",
          subtle: "rgba(62, 214, 200, 0.12)",
          border: "rgba(62, 214, 200, 0.35)",
        },
      },
      backgroundImage: {
        "hero-gradient": "radial-gradient(ellipse at 50% -20%, rgba(62, 214, 200, 0.12) 0%, rgba(10, 10, 15, 0) 70%), linear-gradient(180deg, #0A0A0F 0%, #12121A 100%)",
        "glass-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)",
        "glass-glow": "radial-gradient(circle at 50% 0%, rgba(62, 214, 200, 0.15), transparent 70%)",
      },
      boxShadow: {
        glass: "0 20px 50px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        "glass-elevated": "0 30px 60px -12px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
        "priority-glow": "0 0 35px -5px rgba(255, 107, 74, 0.45)",
        "teal-glow": "0 0 35px -5px rgba(62, 214, 200, 0.45)",
        "pill-glow": "0 0 25px rgba(62, 214, 200, 0.35)",
      },
      backdropBlur: {
        xs: "2px",
        "2xl": "24px",
      },
    },
  },
  plugins: [],
};

export default config;
