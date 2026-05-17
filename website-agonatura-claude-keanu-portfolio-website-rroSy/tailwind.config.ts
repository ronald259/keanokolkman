import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        moss: {
          50: "#f4f6f1",
          100: "#e6ebe0",
          200: "#cdd6c0",
          300: "#aabb98",
          400: "#869e74",
          500: "#6a8458",
          600: "#516a43",
          700: "#405336",
          800: "#34432e",
          900: "#2c3828",
          950: "#171e14",
        },
        forest: {
          50: "#f1f6f2",
          100: "#dfeae1",
          200: "#bfd5c3",
          300: "#95b89c",
          400: "#6a9676",
          500: "#4b7959",
          600: "#385f46",
          700: "#2c4c39",
          800: "#243d2f",
          900: "#1e3327",
          950: "#0e1c15",
        },
        sand: {
          50: "#faf7f0",
          100: "#f3ecda",
          200: "#e6d7b3",
          300: "#d6bd85",
          400: "#c7a45c",
          500: "#b88e44",
          600: "#9d7338",
          700: "#7d5930",
          800: "#67492c",
          900: "#553d27",
          950: "#301f13",
        },
        clay: {
          50: "#fbf6f2",
          100: "#f3e6db",
          200: "#e5ccb6",
          300: "#d3a986",
          400: "#c1865d",
          500: "#b26b46",
          600: "#a4583a",
          700: "#884532",
          800: "#6f3a2d",
          900: "#5b3327",
          950: "#311812",
        },
        bark: "#3a2e22",
        cream: "#f9f5ec",
        mist: "#eef1ea",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      maxWidth: {
        prose: "68ch",
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translateY(0) translateX(0)" },
          "50%": { transform: "translateY(-6px) translateX(4px)" },
        },
        sway: {
          "0%, 100%": { transform: "rotate(-0.6deg)" },
          "50%": { transform: "rotate(0.6deg)" },
        },
        ember: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.08)" },
        },
        mist: {
          "0%": { transform: "translateX(-10%)", opacity: "0" },
          "50%": { opacity: "0.5" },
          "100%": { transform: "translateX(10%)", opacity: "0" },
        },
      },
      animation: {
        drift: "drift 9s ease-in-out infinite",
        sway: "sway 7s ease-in-out infinite",
        ember: "ember 3.4s ease-in-out infinite",
        mist: "mist 18s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
