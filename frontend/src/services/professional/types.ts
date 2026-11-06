import type { Appointment, Message } from "../../features/care/types";
import type { Mood } from "../../features/journal/moods";
import type { AccountRole } from "../auth";

// El área profesional (DESIGN-WEB.md §10): la solicitud de verificación de cualquier persona, su
// revisión por un administrador y el consultorio del psicólogo verificado. Las reglas viven en el
// servidor (supabase/migrations/20261103000002_area_profesional.sql); la web solo las sigue.

export type ApplicationStatus = "pending" | "needs_changes" | "approved" | "rejected" | "revoked";
// "revoked": el administrador retiró la verificación de alguien aprobado.
export type ReviewAction = "approved" | "needs_changes" | "rejected" | "revoked";

export type ApplicationForm = {
  fullName: string;
  // Cómo se presenta en el directorio ("Psicóloga clínica").
  title: string;
  license: string;
  university: string;
  specialties: string[];
  approach: string;
  years: number | null;
  bio: string;
};

export type VerificationDocument = {
  id: string;
  path: string;
  name: string;
  sizeBytes: number;
  createdAt: string;
  // Reemplazado en una subsanación, o de una solicitud anterior: queda en el historial.
  replaced: boolean;
};

export type Review = {
  id: string;
  action: ReviewAction;
  reason: string | null;
  // Los documentos que pidió reemplazar.
  documentIds: string[];
  createdAt: string;
};

export type Application = ApplicationForm & {
  // El id de la cuenta que la envió.
  id: string;
  status: ApplicationStatus;
  statusReason: string | null;
  submittedAt: string;
  verifiedAt: string | null;
  ethicsAcceptedAt: string | null;
  documents: VerificationDocument[];
  // De la más nueva a la más vieja.
  reviews: Review[];
};

// Un PDF que ya subió y todavía no se envió con la solicitud.
export type UploadedDocument = { id: string; path: string; name: string; sizeBytes: number };

// La agenda del psicólogo: qué días (0 domingo … 6 sábado), de qué hora a qué hora y cuánto dura cada sesión.
export type Availability = { days: number[]; from: string; to: string; minutes: number };

export type PracticeRequest = {
  id: string;
  userId: string;
  name: string;
  message: string;
  createdAt: string;
};

export type Patient = {
  // El id de la cuenta de la persona.
  id: string;
  name: string;
  photo: string | null;
  conversationId: string;
  since: string;
  endedAt: string | null;
  endedBy: "user" | "psychologist" | "replica" | null;
  // Lo último que leyó el psicólogo de esta conversación.
  readAt: string;
  sharing: boolean;
  shareChangedAt: string | null;
};

// Lo que el psicólogo cuenta de sí mismo y puede cambiar. Lo verificado (nombre, título, licencia y
// universidad) va aparte y no se edita.
export type EditableProfile = { specialties: string[]; approach: string; years: number; bio: string };
export type PublicProfile = EditableProfile & { title: string; license: string; university: string };

export type Practice = {
  name: string;
  profile: PublicProfile;
  meetLink: string;
  availability: Availability;
  requests: PracticeRequest[];
  patients: Patient[];
  messages: Message[];
  appointments: Appointment[];
};

// Una nota que la persona compartió: sin réplicas, ni favoritas, ni nada de la IA.
export type SharedNote = { id: string; createdAt: string; text: string; mood: Mood | null; tags: string[] };

export type ClinicalNote = { id: string; patientId: string; body: string; createdAt: string; updatedAt: string };

export type PracticeLiveHandlers = {
  onMessage(message: Message): void;
  // Algo cambió, o la conexión volvió: se trae todo otra vez.
  onResync(): void;
};

export interface ProfessionalService {
  // La solicitud propia.
  myApplication(): Promise<Application | null>;
  uploadDocument(file: File, onProgress: (fraction: number) => void): Promise<UploadedDocument>;
  discardDocument(document: UploadedDocument): Promise<void>;
  submitApplication(form: ApplicationForm, ethicsVersion: string, uploads: UploadedDocument[], replace: string[]): Promise<void>;
  documentUrl(document: VerificationDocument): Promise<string>;
  // El rol de la cuenta según el servidor, para cuando la aprobaron con la sesión abierta.
  myRole(): Promise<AccountRole>;

  // Administración.
  listApplications(): Promise<Application[]>;
  review(applicationId: string, action: ReviewAction, reason: string, documentIds: string[]): Promise<void>;

  // El consultorio.
  loadPractice(): Promise<Practice>;
  answerRequest(id: string, accept: boolean): Promise<void>;
  sendMessage(message: Message): Promise<void>;
  markRead(conversationId: string): Promise<void>;
  endCare(conversationId: string): Promise<void>;
  saveSchedule(meetLink: string, availability: Availability): Promise<void>;
  saveProfile(profile: EditableProfile): Promise<void>;
  schedule(conversationId: string, startsAt: string, minutes: number, meetLink: string): Promise<Appointment>;
  cancelAppointment(id: string): Promise<void>;
  patientNotes(patientId: string): Promise<SharedNote[]>;
  clinicalNotes(patientId: string): Promise<ClinicalNote[]>;
  saveClinicalNote(patientId: string, id: string | null, body: string): Promise<ClinicalNote>;
  deleteClinicalNote(id: string): Promise<void>;
  live(handlers: PracticeLiveHandlers): () => void;
}

export const ETHICS_VERSION = "2026-11";
export const MAX_DOCUMENTS = 3;
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
export const DEFAULT_AVAILABILITY: Availability = { days: [1, 2, 3, 4, 5], from: "09:00", to: "18:00", minutes: 50 };
