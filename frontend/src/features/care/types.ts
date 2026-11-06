import type { Mood } from '../journal/moods';
import type { WeeklySchedule } from './schedule';

export type Psychologist = {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  approach: string;
  years: number;
  bio: string;
  license: string;
  meetLink: string;
  // Horas del día en que ofrece sesiones.
  hours: number[];
  // Lo que dura cada sesión, de su agenda.
  sessionMinutes: number;
  // Los días y el horario en que atiende, si los guardó.
  schedule?: WeeklySchedule;
};

export type MessageKind = 'text' | 'session' | 'event';

// Los avisos que deja el servidor. Cada lado los dice a su manera (DESIGN-WEB.md §10).
export type MessageEvent = 'accepted' | 'share_on' | 'share_off' | 'ended_user' | 'ended_psychologist' | 'ended_replica';

export type Message = {
  id: string;
  conversationId: string;
  from: 'user' | 'psychologist' | 'system';
  kind: MessageKind;
  text: string;
  createdAt: string;
  appointmentId?: string;
  event?: MessageEvent;
  // Una nota suelta que la persona compartió en el chat (RF-44). El texto lo copia el servidor de la
  // nota; `note` trae lo demás cuando se conoce (el psicólogo lo lee de la nota misma).
  entryId?: string;
  note?: SharedNoteInfo;
};

export type SharedNoteInfo = { createdAt: string; mood: Mood | null; tag: string | null };

export type Conversation = {
  id: string;
  psychologistId: string;
  createdAt: string;
  lastReadAt: string;
  // Cuando terminó el proceso, y quién lo terminó. Solo hay una activa a la vez.
  endedAt?: string;
  // 'replica': se retiró la verificación del psicólogo.
  endedBy?: 'user' | 'psychologist' | 'replica';
};

// El acompañamiento empieza con una solicitud: la conversación se abre cuando el psicólogo acepta.
export type CareRequestStatus = 'pending' | 'accepted' | 'declined' | 'withdrawn';

export type CareRequest = {
  id: string;
  psychologistId: string;
  message: string;
  status: CareRequestStatus;
  createdAt: string;
  respondedAt?: string;
};

// Las sesiones las agenda y las cancela el psicólogo; la persona las ve y se une por Meet.
export type Appointment = {
  id: string;
  conversationId: string;
  psychologistId: string;
  startsAt: string;
  meetLink: string;
  minutes: number;
  cancelledAt?: string;
};

// El permiso para que un psicólogo lea el diario: explícito y revocable.
export type DiaryShare = {
  psychologistId: string;
  active: boolean;
  changedAt: string;
};
