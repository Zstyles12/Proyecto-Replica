/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: {
          DEFAULT: "var(--surface)",
          raised: "var(--surface-raised)",
          sunken: "var(--surface-sunken)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        subtle: "var(--subtle)",
        border: "var(--border)",
        warp: "var(--warp)",
        voice: {
          DEFAULT: "var(--voice)",
          foreground: "var(--voice-foreground)",
          soft: "var(--voice-soft)",
        },
        reply: {
          DEFAULT: "var(--reply)",
          foreground: "var(--reply-foreground)",
          soft: "var(--reply-soft)",
        },
        emotion: {
          DEFAULT: "var(--emotion)",
          foreground: "var(--emotion-foreground)",
          soft: "var(--emotion-soft)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        sun: {
          DEFAULT: "var(--sun)",
          soft: "var(--sun-soft)",
        },
        mood: {
          paz: "var(--mood-paz)",
          alegria: "var(--mood-alegria)",
          gratitud: "var(--mood-gratitud)",
          reflexion: "var(--mood-reflexion)",
          cansancio: "var(--mood-cansancio)",
          ansiedad: "var(--mood-ansiedad)",
          tristeza: "var(--mood-tristeza)",
        },
      },
      borderRadius: {
        sm: "8px",
        DEFAULT: "12px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        full: "9999px",
      },
      boxShadow: {
        raised: "0 6px 14px rgba(27,58,46,0.06)",
        xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      },
      fontFamily: {
        replica: ["Alegreya", "serif"],
        voice: ["'Alegreya Sans'", "sans-serif"],
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.23, 1, 0.32, 1)",
        "in-out": "cubic-bezier(0.77, 0, 0.175, 1)",
      },
      transitionDuration: {
        press: "120ms",
        small: "180ms",
        enter: "280ms",
        exit: "180ms",
        indicator: "250ms",
      },
    },
  },
  plugins: [],
};
