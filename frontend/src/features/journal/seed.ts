import type { Note } from './types';
import { buildMockReply } from '../../services/ai/mockReplyService';
import type { Mood } from './moods';

// Datos sintéticos para desarrollo: notas de las últimas semanas con su réplica.
function daysAgo(days: number, hour: number, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

type SeedNote = [
  days: number,
  hour: number,
  minute: number,
  mood: Mood | null,
  tags: string[],
  text: string,
];

const NOTES: SeedNote[] = [
  [
    1,
    21,
    40,
    'ansiedad',
    ['Trabajo'],
    'Hoy en la reunión sentí ese nudo en el pecho de siempre. Quería anticipar cada error de los demás. Respiré profundo y, por primera vez, dejé que otro tomara la decisión.',
  ],
  [
    2,
    19,
    15,
    'paz',
    ['Yo', 'Salud'],
    'Salí a caminar sin audífonos. Empezó a llover y no me importó. Escuché todo: los carros, la gente, mi propia respiración.',
  ],
  [
    3,
    22,
    5,
    'alegria',
    ['Familia'],
    'Llamé a mi mamá y terminamos riéndonos de historias de mi infancia. Hacía tiempo que no me reía así.',
  ],
  [
    4,
    20,
    30,
    'cansancio',
    ['Trabajo'],
    'Un día largo. Llegué a casa sin ganas de nada, ni siquiera de cocinar. Solo quería dormir.',
  ],
  [
    6,
    21,
    10,
    'gratitud',
    ['Amistades'],
    'Me escribió una amiga de la universidad solo para saber cómo estaba. Me hizo sentir recordada.',
  ],
  [
    7,
    23,
    0,
    'ansiedad',
    ['Trabajo', 'Dinero'],
    'No logro dormir pensando en la entrega del viernes y en las cuentas del mes. Todo se siente urgente a la vez.',
  ],
  [
    8,
    18,
    45,
    'reflexion',
    ['Yo'],
    'Me di cuenta de que digo que sí a todo por miedo a quedar mal. Quiero empezar a notar cuándo lo hago.',
  ],
  [
    10,
    21,
    20,
    'paz',
    ['Salud'],
    'Hice yoga por primera vez en semanas. El cuerpo estaba rígido pero al final respiré distinto.',
  ],
  [
    11,
    22,
    40,
    'tristeza',
    ['Pareja'],
    'Discutimos por algo pequeño y me quedé con una sensación de distancia que no sé cómo nombrar.',
  ],
  [
    13,
    20,
    0,
    'alegria',
    ['Familia'],
    'Cumpleaños de mi sobrino. Verlo feliz me recordó lo simple que puede ser estar bien.',
  ],
  [
    15,
    21,
    15,
    'ansiedad',
    ['Trabajo'],
    'Mi jefe me pidió otro proyecto y dije que sí aunque ya no puedo con más. Me temblaba la voz.',
  ],
  [
    17,
    19,
    30,
    'gratitud',
    ['Yo'],
    'Terminé el libro que tenía pendiente desde hace meses. Pequeño logro, pero mío.',
  ],
  [
    19,
    22,
    10,
    'cansancio',
    ['Estudios'],
    'Estudié toda la tarde y siento que no retuve nada. Estoy agotada.',
  ],
  [
    22,
    20,
    45,
    'paz',
    ['Salud', 'Yo'],
    'Caminata larga al atardecer. El silencio me ordenó los pensamientos.',
  ],
];

export function seedNotes(): Note[] {
  return NOTES.map(([days, hour, minute, mood, tags, text], i) => ({
    id: `seed-${i + 1}`,
    createdAt: daysAgo(days, hour, minute),
    text,
    mood,
    tags,
    prompt: null,
    reply: buildMockReply({ text, tone: 'suave' }),
    replyStatus: 'done',
  }));
}
