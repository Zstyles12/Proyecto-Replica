import type { ReplyContent } from '../../services/ai/types';
import type { Mood } from './moods';

export type ReplyStatus = 'none' | 'streaming' | 'done' | 'error';

// Cómo responde Replica a cada nota. La primera nota del día recibe su réplica al momento; las
// demás se leen juntas en la réplica del día (en la noche). Las privadas no las lee nadie más.
export type ReplyMode = 'instant' | 'day' | 'private';

export type Note = {
  id: string;
  createdAt: string;
  text: string;
  mood: Mood | null;
  tags: string[];
  // La pregunta sobre la que el usuario decidió escribir (desde una réplica), si la hubo.
  prompt: string | null;
  reply: ReplyContent | null;
  // Lo que ya llegó de la réplica mientras se escribe en vivo. No se guarda en disco.
  replyDraft?: { headline: string; body: string };
  replyStatus: ReplyStatus;
  // Sin valor en notas antiguas: se tratan como 'instant'.
  replyMode?: ReplyMode;
};

export type NewNote = Pick<Note, 'text' | 'mood' | 'tags' | 'prompt' | 'replyMode'>;

// La réplica del día: lee todas las notas del día que no son privadas y responde una vez más.
export type DayReply = {
  // Día al que pertenece (clave local, como "2026-8-26").
  day: string;
  // 'day': la réplica de la noche. 'late': la última réplica, a medianoche, solo si se escribió
  // después de la de la noche. Sin valor en las guardadas antes: son 'day'.
  kind?: 'day' | 'late';
  noteIds: string[];
  reply: ReplyContent | null;
  replyDraft?: { headline: string; body: string };
  replyStatus: ReplyStatus;
};

// Un aprendizaje del cofre: la frase que la réplica destiló de una nota. Uno por nota con réplica.
export type Learning = {
  noteId: string;
  text: string;
  createdAt: string;
  // El título de la nota de la que salió (su primera frase).
  source: string;
};
