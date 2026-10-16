import { BOX } from "./logoGeometry";

// Con qué tokens se pinta la marca, igual que paintFor() de la app (components/brand/logo.tsx).
export const LOGO_PAINT = {
  page: "var(--surface-raised)",
  border: "var(--border)",
  rings: "var(--subtle)",
  ribbon: "var(--voice)",
  reply: "var(--reply)",
  soft: "var(--reply-soft)",
  word: "var(--foreground)",
} as const;

/** Cuánto baja la línea base del logotipo desde su borde de arriba, en proporción a su alto. */
export const WORDMARK_BASELINE = -BOX.logotipo[1] / BOX.logotipo[3];
