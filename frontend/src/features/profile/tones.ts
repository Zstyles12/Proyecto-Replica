import type { ReplyTone } from "./store";

// Los tonos de la réplica (features/profile/components/profile-settings.tsx de la app).
export const TONES: { value: ReplyTone; title: string; description: string }[] = [
  {
    value: "suave",
    title: "Suave y cercana",
    description: "Valida lo que sientes, con calma y preguntas cuidadosas.",
  },
  {
    value: "profundo",
    title: "Profunda",
    description: "Preguntas abiertas que te invitan a mirar más adentro.",
  },
  {
    value: "directo",
    title: "Directa y breve",
    description: "Va al punto, con un análisis corto y preguntas concretas.",
  },
];

export function toneTitle(tone: ReplyTone) {
  return TONES.find((t) => t.value === tone)?.title ?? "";
}
