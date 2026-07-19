// tailwind.config.ts
import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "hsl(var(--ivory))",
        ink: "hsl(var(--ink))",
        terracotta: {
          DEFAULT: "hsl(var(--terracotta))",
          soft: "hsl(var(--terracotta) / 0.12)",
        },
        marigold: {
          DEFAULT: "hsl(var(--marigold))",
          soft: "hsl(var(--marigold) / 0.16)",
        },
        forest: {
          DEFAULT: "hsl(var(--forest))",
          soft: "hsl(var(--forest) / 0.1)",
        },
        clay: "hsl(var(--clay))",
        card: "hsl(var(--card-surface))",
        // shadcn-compatible tokens mapped onto the palette
        border: "hsl(var(--border))",
        input: "hsl(var(--border))",
        ring: "hsl(var(--terracotta))",
        background: "hsl(var(--ivory))",
        foreground: "hsl(var(--ink))",
        primary: {
          DEFAULT: "hsl(var(--ink))",
          foreground: "hsl(var(--ivory))",
        },
        secondary: {
          DEFAULT: "hsl(var(--terracotta))",
          foreground: "hsl(var(--card-surface))",
        },
        muted: {
          DEFAULT: "hsl(var(--clay) / 0.18)",
          foreground: "hsl(var(--ink) / 0.62)",
        },
        accent: {
          DEFAULT: "hsl(var(--marigold) / 0.2)",
          foreground: "hsl(var(--ink))",
        },
        destructive: {
          DEFAULT: "hsl(var(--terracotta))",
          foreground: "hsl(var(--card-surface))",
        },
        popover: {
          DEFAULT: "hsl(var(--card-surface))",
          foreground: "hsl(var(--ink))",
        },
      },
      fontFamily: {
        serif: ['"DM Serif Display"', "Georgia", "serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      boxShadow: {
        card: "0 1px 2px hsl(30 10% 10% / 0.05), 0 4px 16px hsl(30 10% 10% / 0.06)",
        lifted: "0 2px 4px hsl(30 10% 10% / 0.06), 0 12px 32px hsl(30 10% 10% / 0.1)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out",
        "scale-in": "scale-in 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [animate],
};

export default config;
