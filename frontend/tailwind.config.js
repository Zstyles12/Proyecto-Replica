/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Primary (Lavanda Introspectiva)
        "primary": "#5e5586",
        "primary-container": "#776ea0",
        "on-primary": "#ffffff",
        "primary-fixed": "#e6deff",
        "primary-fixed-dim": "#cabff7",
        "on-primary-fixed": "#1d1441",
        "on-primary-fixed-variant": "#49406f",
        "inverse-primary": "#cabff7",

        // Secondary (Verde Salvia Regulador)
        "secondary": "#436558",
        "secondary-container": "#c2e8d7",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#476a5c",
        "secondary-fixed": "#c5ebda",
        "secondary-fixed-dim": "#a9cfbe",
        "on-secondary-fixed": "#002117",
        "on-secondary-fixed-variant": "#2b4d41",

        // Tertiary (Azul Pizarra)
        "tertiary": "#4c5e71",
        "tertiary-container": "#64768b",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#fdfcff",
        "tertiary-fixed": "#d2e4fc",
        "tertiary-fixed-dim": "#b6c8df",
        "on-tertiary-fixed": "#091d2e",
        "on-tertiary-fixed-variant": "#37485b",

        // Surfaces & Canvas
        "background": "#fbf8ff",
        "surface": "#fbf8ff",
        "surface-bright": "#fbf8ff",
        "surface-dim": "#dad9e4",
        "surface-variant": "#e2e1ec",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f4f2fd",
        "surface-container": "#eeedf8",
        "surface-container-high": "#e8e7f2",
        "surface-container-highest": "#e2e1ec",
        "on-surface": "#1a1b23",
        "on-surface-variant": "#48454e",
        "inverse-surface": "#2f3038",
        "inverse-on-surface": "#f1effa",
        "surface-tint": "#615889",

        // Outlines & Alerts
        "outline": "#79757f",
        "outline-variant": "#c9c4cf",
        "error": "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
      },
      borderRadius: {
        "DEFAULT": "1rem",   // 16px
        "lg": "2rem",        // 32px
        "xl": "3rem",        // 48px
        "full": "9999px",
      },
      spacing: {
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2.5rem",
        "gutter": "1.25rem",
        "gutter-tablet": "1.5rem",
        "gutter-desktop": "2rem",
        "margin": "1.25rem",
        "margin-tablet": "2.5rem",
        "margin-desktop": "4rem",
      },
      fontFamily: {
        "sans": ["'Plus Jakarta Sans'", "sans-serif"],
        "display": ["'Plus Jakarta Sans'", "sans-serif"],
        "headline": ["'Plus Jakarta Sans'", "sans-serif"],
        "body": ["'Plus Jakarta Sans'", "sans-serif"],
        "label": ["'Plus Jakarta Sans'", "sans-serif"],
      },
      fontSize: {
        "display": ["40px", { lineHeight: "48px", letterSpacing: "-0.02em", fontWeight: "600" }],
        "display-mobile": ["32px", { lineHeight: "40px", letterSpacing: "-0.015em", fontWeight: "600" }],
        "headline-lg": ["28px", { lineHeight: "36px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "headline-md": ["22px", { lineHeight: "30px", letterSpacing: "-0.005em", fontWeight: "600" }],
        "headline-sm": ["18px", { lineHeight: "26px", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "label-lg": ["15px", { lineHeight: "20px", letterSpacing: "0.01em", fontWeight: "500" }],
        "label-md": ["13px", { lineHeight: "18px", letterSpacing: "0.015em", fontWeight: "500" }],
        "label-sm": ["11px", { lineHeight: "16px", letterSpacing: "0.03em", fontWeight: "600" }],
      },
    },
  },
  plugins: [],
};
