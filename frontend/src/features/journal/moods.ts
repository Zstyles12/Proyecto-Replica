// Los siete ánimos y los temas (DESIGN.md §3.2), igual que la app (features/journal/moods.ts y tags.ts).

export type Mood = "paz" | "alegria" | "gratitud" | "reflexion" | "cansancio" | "ansiedad" | "tristeza";

export const MOODS: Mood[] = ["paz", "alegria", "gratitud", "reflexion", "cansancio", "ansiedad", "tristeza"];

export const MOOD_LABELS: Record<Mood, string> = {
  paz: "Paz",
  alegria: "Alegría",
  gratitud: "Gratitud",
  reflexion: "Reflexión",
  cansancio: "Cansancio",
  ansiedad: "Ansiedad",
  tristeza: "Tristeza",
};

// El color de cada ánimo, como variable CSS (cambia solo con el tema).
export function moodColor(mood: Mood) {
  return `var(--mood-${mood})`;
}

export function isMood(value: string | null | undefined): value is Mood {
  return !!value && (MOODS as string[]).includes(value);
}

// Un solo tema por nota.
export const SUGGESTED_TAGS = [
  "Trabajo",
  "Familia",
  "Pareja",
  "Amistades",
  "Salud",
  "Estudios",
  "Dinero",
  "Yo",
] as const;

// Preguntas para empezar a escribir (features/journal/prompts.ts de la app).
export const DAILY_PROMPTS = [
  "¿Qué momento de hoy te gustaría recordar dentro de un año?",
  "¿Qué conversación de hoy cambió algo en ti?",
  "¿Qué te pesó hoy, aunque no lo hayas dicho?",
  "¿Qué hiciste hoy por ti?",
  "¿Qué descubriste de ti hoy?",
  "¿A quién pensaste hoy, y por qué?",
  "¿Qué necesitabas hoy que no recibiste?",
] as const;

export function promptForDate(date: Date, offset = 0) {
  const day = Math.floor(date.getTime() / 86_400_000);
  const n = DAILY_PROMPTS.length;
  return DAILY_PROMPTS[(((day + offset) % n) + n) % n];
}

// Cada ánimo con su nombre y su color, para listas y gráficas.
export const MOOD_ITEMS: { id: Mood; name: string; colorVar: string }[] = MOODS.map((id) => ({
  id,
  name: MOOD_LABELS[id],
  colorVar: moodColor(id),
}));
