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
};

export type MessageKind = 'text' | 'session' | 'event';

export type Message = {
  id: string;
  conversationId: string;
  from: 'user' | 'psychologist' | 'system';
  kind: MessageKind;
  text: string;
  createdAt: string;
  appointmentId?: string;
};

export type Conversation = {
  id: string;
  psychologistId: string;
  createdAt: string;
  lastReadAt: string;
  // Cuando la persona termina su proceso con este psicólogo. Solo hay uno activo a la vez.
  endedAt?: string;
};

// Las sesiones las agenda y las cancela el psicólogo; la persona las ve y se une por Meet.
export type Appointment = {
  id: string;
  conversationId: string;
  psychologistId: string;
  startsAt: string;
  meetLink: string;
  cancelledAt?: string;
};

// El permiso para que un psicólogo lea el diario: explícito y revocable.
export type DiaryShare = {
  psychologistId: string;
  active: boolean;
  changedAt: string;
};
