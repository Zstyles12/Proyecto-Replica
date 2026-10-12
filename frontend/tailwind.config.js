/**
 * Un token de color que acepta opacidad (`border-border/40`, `bg-reply-soft/25`…).
 * Los colores viven como variables CSS con su hexadecimal (`src/index.css`); con `var(--x)` a secas,
 * Tailwind 3 no sabe aplicar la opacidad y no genera la clase. Con opacidad se mezcla con
 * `color-mix`, sin tocar las variables.
 */
const token = (name) => ({ opacityValue }) =>
  opacityValue === undefined || opacityValue === "1"
    ? `var(--${name})`
    : `color-mix(in srgb, var(--${name}) calc(${opacityValue} * 100%), transparent)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  // Oscuro cuando se eligió (data-theme="dark") o cuando sigue al sistema y el sistema está en oscuro.
  darkMode: [
    "variant",
    [
      '&:is([data-theme="dark"] *)',
      '@media (prefers-color-scheme: dark) { &:is(:root:not([data-theme="light"]) *) }',
    ],
  ],
  theme: {
    extend: {
      colors: {
        background: token("background"),
        foreground: token("foreground"),
        surface: {
          DEFAULT: token("surface"),
          raised: token("surface-raised"),
          sunken: token("surface-sunken"),
        },
        muted: {
          DEFAULT: token("muted"),
          foreground: token("muted-foreground"),
        },
        subtle: token("subtle"),
        border: token("border"),
        warp: token("warp"),
        voice: {
          DEFAULT: token("voice"),
          foreground: token("voice-foreground"),
          soft: token("voice-soft"),
        },
        reply: {
          DEFAULT: token("reply"),
          foreground: token("reply-foreground"),
          soft: token("reply-soft"),
        },
        emotion: {
          DEFAULT: token("emotion"),
          foreground: token("emotion-foreground"),
          soft: token("emotion-soft"),
        },
        destructive: {
          DEFAULT: token("destructive"),
          foreground: token("destructive-foreground"),
        },
        sun: {
          DEFAULT: token("sun"),
          soft: token("sun-soft"),
        },
        mood: {
          paz: token("mood-paz"),
          alegria: token("mood-alegria"),
          gratitud: token("mood-gratitud"),
          reflexion: token("mood-reflexion"),
          cansancio: token("mood-cansancio"),
          ansiedad: token("mood-ansiedad"),
          tristeza: token("mood-tristeza"),
        },
        // Tela de días (DESIGN.md §3.2): 1, 2 y 3 o más notas.
        cloth: {
          1: token("cloth-1"),
          2: token("cloth-2"),
          3: token("cloth-3"),
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
