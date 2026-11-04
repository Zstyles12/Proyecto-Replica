import type { Mood } from '../../features/journal/moods';

export type ReplyRequest = {
  noteId: string;
  text: string;
  mood?: Mood | null;
  // Preferencia del usuario para la instrucción que recibe la IA.
  tone?: 'suave' | 'profundo' | 'directo';
  // Para hablarle por su nombre, si lo dio.
  name?: string;
  // 'day': la réplica del día; text trae todas las notas del día, separadas por líneas en blanco.
  // 'late': la última réplica, a medianoche; lee solo lo escrito después de la réplica del día.
  kind?: 'note' | 'day' | 'late';
  // Cuántas notas lee la réplica del día.
  count?: number;
  // Réplica del día: cada nota que lee, para dejarle a cada una un comentario propio.
  notes?: { id: string; text: string }[];
};

// La réplica tiene forma fija: una frase que la resume, un análisis breve, preguntas para seguir escribiendo
// y un aprendizaje destilado (la frase que va al cofre). Es la misma forma que se le pedirá a Gemini
// (salida estructurada en JSON).
export type ReplyContent = {
  headline: string;
  body: string;
  questions: string[];
  learning: string;
  // Lo escrito muestra riesgo: debajo del análisis se enlaza a la ayuda en crisis (RF-61). Lo decide
  // el servidor, y nunca es un diagnóstico.
  risk?: boolean;
  // Solo en la réplica del día: un comentario corto y distinto para cada nota que leyó. Se ve en el
  // detalle de esa nota, así ninguna queda vacía y la réplica completa no se repite en cada una.
  comments?: { noteId: string; text: string }[];
};

export type ReplyHandlers = {
  // El titular llega primero, entero; después el análisis palabra por palabra.
  onHeadline: (headline: string) => void;
  onWord: (word: string) => void;
  onDone: (reply: ReplyContent) => void;
  onError?: (error: Error) => void;
};

// Devuelve una función para cancelar el streaming.
export interface ReplyService {
  streamReply(request: ReplyRequest, handlers: ReplyHandlers): () => void;
}
