import type { Appointment, CareRequest, Conversation, DiaryShare, Message, Psychologist } from "../../features/care/types";
import type { DayReply, Note, ReplyMode } from "../../features/journal/types";
import type { Profile } from "../../features/profile/store";
import type { TutorialsSaved } from "../../lib/tutorials";
import type { AccountRole } from "../auth";

// La hora del recordatorio diario al encenderlo por primera vez (DESIGN-WEB.md §11).
export const DEFAULT_REMINDER_TIME = "21:00";

// Una frase guardada en el cofre, con la clave de features/cofre/store.ts.
export type SavedPhrase = { key: string; savedAt: string };

export type CareData = {
  conversations: Conversation[];
  messages: Message[];
  appointments: Appointment[];
  shares: DiaryShare[];
  requests: CareRequest[];
};

// Lo que el perfil guarda en el servidor. La solicitud de psicólogo tiene su propio servicio.
export type ProfilePatch = Partial<Omit<Profile, "photo" | "memberSince">>;

// Todo lo de la cuenta, al entrar.
export type AccountData = {
  role: AccountRole;
  consent: { at: string; version: string } | null;
  setupDone: boolean;
  profile: Profile;
  tutorials: TutorialsSaved;
  notes: Note[];
  dayReplies: DayReply[];
  favoriteNoteIds: string[];
  saved: SavedPhrase[];
  care: CareData;
  psychologists: Psychologist[];
};

// Lo que llega solo mientras la web está abierta. onCareChanged: cambió una conversación o una
// solicitud, o el canal se volvió a conectar, y hay que traer el chat otra vez.
export type LiveHandlers = {
  onMessage(message: Message): void;
  onCareChanged(): void;
  onAppointment(appointment: Appointment): void;
  onDayReply(): void;
};

// El diario y todo lo demás en el servidor. Los stores (features/) son su caché en memoria: sin
// Supabase no existe este servicio y ellos mismos guardan en el navegador.
export type DataService = {
  load(): Promise<AccountData>;
  live(userId: string, handlers: LiveHandlers): () => void;

  // writtenAt: una nota que esperó en la bandeja dice cuándo se escribió (el servidor la acepta hasta
  // tres días atrás).
  createNote(note: Note, isPrivate: boolean, writtenAt?: string): Promise<{ createdAt: string; replyMode: ReplyMode }>;
  // El recordatorio diario (RF-53): la suscripción de este navegador y la hora, o apagarlo.
  setReminder(reminder: { subscription: string; time: string } | null, subscription?: string): Promise<void>;
  setNoteFavorite(noteId: string, favorite: boolean): Promise<void>;
  // Borra la nota con su réplica; el servidor borra lo demás en cascada (DESIGN-WEB.md §11).
  deleteNote(noteId: string): Promise<void>;
  loadDayReplies(): Promise<DayReply[]>;
  setPhraseSaved(key: string, saved: boolean, savedAt: string): Promise<void>;

  saveProfile(patch: ProfilePatch): Promise<void>;
  // Sube la foto (o la quita) y devuelve su dirección.
  savePhoto(photo: string | null): Promise<string | null>;
  saveTimezone(timezone: string): Promise<void>;
  saveTutorials(tutorials: TutorialsSaved): Promise<void>;
  acceptTerms(version: string, at: string): Promise<void>;
  finishSetup(): Promise<void>;

  loadCare(): Promise<CareData>;
  // Solo aceptar abre la conversación: la persona pide, y puede retirar lo que pidió.
  requestCare(request: Pick<CareRequest, "id" | "psychologistId" | "message">): Promise<CareRequest>;
  withdrawCare(id: string): Promise<void>;
  markRead(id: string): Promise<void>;
  sendMessage(message: Message): Promise<void>;
  endConversation(id: string): Promise<void>;
  setDiaryShare(psychologistId: string, active: boolean): Promise<void>;

  deleteAccount(): Promise<void>;
};
