import React from "react";
import { MOOD_LABELS, moodColor, type Mood } from "../moods";

// El ánimo como etiqueta suave: su tinte de fondo, un punto y su nombre, nunca solo el color.
// El texto va en color de texto para que se lea; el tinte lo llevan el fondo y el punto.
export const MoodChip: React.FC<{ mood: Mood }> = ({ mood }) => (
  <span
    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-foreground"
    style={{ backgroundColor: `color-mix(in srgb, ${moodColor(mood)} 15%, transparent)` }}
  >
    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: moodColor(mood) }} />
    {MOOD_LABELS[mood]}
  </span>
);

// El ánimo en una línea de contexto: punto y nombre, sin fondo.
export const MoodDot: React.FC<{ mood: Mood }> = ({ mood }) => (
  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
    <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ backgroundColor: moodColor(mood) }} />
    {MOOD_LABELS[mood]}
  </span>
);
