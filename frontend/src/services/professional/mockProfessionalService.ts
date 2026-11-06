import { PSYCHOLOGISTS, setPsychologists } from "../../features/care/data";
import type { Appointment, Message, Psychologist } from "../../features/care/types";
import { readJSON, writeJSON } from "../../lib/storage";
import type { AccountRole } from "../auth";
import {
  DEFAULT_AVAILABILITY,
  type Application,
  type ClinicalNote,
  type Practice,
  type ProfessionalService,
  type PublicProfile,
  type SharedNote,
  type UploadedDocument,
  type VerificationDocument,
} from "./types";

// Sin servidor (DESIGN-WEB.md §10, "Modo simulado"): las cuentas de prueba comparten este navegador, así
// que aquí vive un mundo pequeño con las solicitudes de todas y un consultorio de prueba. Los PDF se
// guardan en IndexedDB para que sigan ahí al recargar. Datos inventados.
const KEY = "replica.profesional.v1";
const SESSION_KEY = "replica.session";
const DELAY = 500;

type StoredApplication = Application & { email: string };
type MockPractice = Practice & { notes: Record<string, SharedNote[]>; clinical: ClinicalNote[] };
type World = { applications: StoredApplication[]; practice: MockPractice };

const MOCK_PROFILE: PublicProfile = {
  title: "Psicóloga clínica",
  license: "N.º 14.382",
  university: "Universidad Católica Andrés Bello",
  specialties: ["Ansiedad", "Autoestima", "Estrés laboral"],
  approach: "Terapia cognitivo-conductual",
  years: 9,
  bio: "Acompaño a personas que sienten que la ansiedad les está ganando. Trabajo con herramientas concretas y a tu ritmo.",
};

const wait = (ms = DELAY) => new Promise((resolve) => setTimeout(resolve, ms));
const id = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const daysAgo = (d: number, hour = 10) => {
  const date = new Date();
  date.setDate(date.getDate() - d);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};
const inDays = (d: number, hour: number) => daysAgo(-d, hour);

function seedApplication(
  email: string,
  fields: Partial<StoredApplication> & Pick<Application, "fullName" | "license" | "university" | "status">,
  submitted: number
): StoredApplication {
  const appId = `sol-${email.split("@")[0]}`;
  return {
    id: appId,
    email,
    title: "Psicóloga clínica",
    specialties: ["Ansiedad"],
    approach: "",
    years: 6,
    bio: "",
    statusReason: null,
    submittedAt: daysAgo(submitted),
    verifiedAt: null,
    ethicsAcceptedAt: daysAgo(submitted),
    documents: [
      { id: `${appId}-1`, path: `seed/${appId}-titulo.pdf`, name: "titulo.pdf", sizeBytes: 812_000, createdAt: daysAgo(submitted), replaced: false },
      { id: `${appId}-2`, path: `seed/${appId}-colegiatura.pdf`, name: "constancia-colegiatura.pdf", sizeBytes: 2_400_000, createdAt: daysAgo(submitted), replaced: false },
    ],
    reviews: [],
    ...fields,
  };
}

function seedPractice(): MockPractice {
  const event = (conversationId: string, event: Message["event"], text: string, createdAt: string): Message => ({
    id: id(),
    conversationId,
    from: "system",
    kind: "event",
    event,
    text,
    createdAt,
  });
  const text = (conversationId: string, from: "user" | "psychologist", body: string, createdAt: string): Message => ({
    id: id(),
    conversationId,
    from,
    kind: "text",
    text: body,
    createdAt,
  });
  const note = (d: number, hour: number, mood: SharedNote["mood"], tag: string, body: string): SharedNote => ({
    id: id(),
    createdAt: daysAgo(d, hour),
    mood,
    tags: [tag],
    text: body,
  });
  return {
    name: "Valeria Rondón",
    profile: MOCK_PROFILE,
    meetLink: "https://meet.google.com/rpl-valr-ond",
    availability: DEFAULT_AVAILABILITY,
    requests: [
      {
        id: "pet-carla",
        userId: "pac-carla",
        name: "Carla Mena",
        message: "Hola. Desde que me mudé me cuesta dormir y estoy muy irritable. Me gustaría intentarlo.",
        createdAt: daysAgo(0, 8),
      },
    ],
    patients: [
      {
        id: "pac-ana",
        name: "Ana Prueba",
        photo: null,
        conversationId: "con-ana",
        since: daysAgo(20),
        endedAt: null,
        endedBy: null,
        readAt: daysAgo(1, 9),
        sharing: true,
        shareChangedAt: daysAgo(18),
      },
      {
        id: "pac-beto",
        name: "Beto Prueba",
        photo: null,
        conversationId: "con-beto",
        since: daysAgo(6),
        endedAt: null,
        endedBy: null,
        readAt: daysAgo(0, 12),
        sharing: false,
        shareChangedAt: daysAgo(2),
      },
      {
        id: "pac-diego",
        name: "Diego Lara",
        photo: null,
        conversationId: "con-diego",
        since: daysAgo(60),
        endedAt: daysAgo(9),
        endedBy: "user",
        readAt: daysAgo(9),
        sharing: false,
        shareChangedAt: daysAgo(9),
      },
    ],
    messages: [
      event("con-ana", "accepted", "Valeria aceptó acompañarte.", daysAgo(20)),
      text("con-ana", "user", "Hola, Valeria. Gracias por aceptar.", daysAgo(20, 11)),
      event("con-ana", "share_on", "Compartiste tu diario con Valeria.", daysAgo(18)),
      text("con-ana", "psychologist", "Leí tus notas de la semana. Lo vemos el jueves.", daysAgo(3, 18)),
      text("con-ana", "user", "Perfecto. Esta semana dormí un poco mejor.", daysAgo(0, 9)),
      event("con-beto", "accepted", "Valeria aceptó acompañarte.", daysAgo(6)),
      text("con-beto", "user", "Hola. Quería empezar por el estrés del trabajo.", daysAgo(6, 11)),
      event("con-beto", "share_on", "Compartiste tu diario con Valeria.", daysAgo(4)),
      event("con-beto", "share_off", "Dejaste de compartir tu diario con Valeria.", daysAgo(2)),
      event("con-diego", "accepted", "Valeria aceptó acompañarte.", daysAgo(60)),
      text("con-diego", "user", "Gracias por todo, me siento listo para cerrar.", daysAgo(9, 9)),
      event("con-diego", "ended_user", "Terminaste tu proceso con Valeria.", daysAgo(9)),
    ],
    appointments: [
      {
        id: "cita-ana",
        conversationId: "con-ana",
        psychologistId: "",
        startsAt: inDays(2, 10),
        meetLink: "https://meet.google.com/rpl-valr-ond",
        minutes: 50,
      },
    ],
    notes: {
      "pac-ana": [
        note(0, 8, "reflexion", "Yo", "Dormí seis horas seguidas. Hace semanas que no pasaba. Me levanté con ganas de caminar antes del trabajo."),
        note(2, 21, "ansiedad", "Trabajo", "La reunión de mañana me tiene dando vueltas. Escribí lo que quiero decir y se ordenó un poco."),
        note(2, 13, "cansancio", "Trabajo", "Almorcé frente a la computadora otra vez."),
        note(5, 20, "gratitud", "Familia", "Cené con mi hermana. Nos reímos de cosas de cuando éramos niñas."),
        note(8, 22, "tristeza", "Pareja", "Hoy extrañé mucho. No sé bien qué hacer con eso todavía."),
        note(12, 19, "paz", "Salud", "Fui a nadar. El agua siempre me baja el ruido."),
      ],
    },
    clinical: [
      {
        id: "cli-1",
        patientId: "pac-ana",
        body: "Primera sesión. Motivo de consulta: ansiedad laboral y sueño irregular. Acordamos registrar las horas de sueño en el diario.",
        createdAt: daysAgo(17, 11),
        updatedAt: daysAgo(17, 11),
      },
    ],
  };
}

function seed(): World {
  return {
    applications: [
      seedApplication("mariana@replica.test", { fullName: "Mariana Torres", license: "CPV-20.114", university: "Universidad Central de Venezuela", status: "pending", specialties: ["Ansiedad", "Duelo"] }, 1),
      seedApplication("jorge@replica.test", {
        fullName: "Jorge Salas",
        title: "Psicólogo",
        license: "CPV-8.302",
        university: "Universidad Católica Andrés Bello",
        status: "needs_changes",
        statusReason: "La constancia de colegiatura está vencida. Sube una vigente.",
      }, 6),
      seedApplication("lucia@replica.test", { fullName: "Lucía Herrera", license: "CPV-15.870", university: "Universidad del Zulia", status: "approved", verifiedAt: daysAgo(12) }, 14),
      seedApplication("pedro@replica.test", {
        fullName: "Pedro Núñez",
        title: "Psicólogo",
        license: "00-000",
        university: "Universidad de Carabobo",
        status: "rejected",
        statusReason: "El número de colegiatura no aparece en el registro del colegio.",
      }, 20),
    ].map((a) => ({
      ...a,
      reviews:
        a.status === "pending"
          ? []
          : [{ id: `${a.id}-r`, action: a.status as Exclude<Application["status"], "pending">, reason: a.statusReason, documentIds: a.status === "needs_changes" ? [`${a.id}-2`] : [], createdAt: daysAgo(a.status === "approved" ? 12 : 3) }],
    })),
    practice: seedPractice(),
  };
}

let world: World = readJSON<World>(KEY, seed);

function save() {
  writeJSON(KEY, world);
}

// La cuenta simulada con sesión en este navegador (lib/session.ts la guarda ahí).
function currentEmail() {
  return readJSON<{ account: { email: string } | null }>(SESSION_KEY, () => ({ account: null })).account?.email ?? "";
}

function mine() {
  const email = currentEmail();
  return world.applications.find((a) => a.email === email) ?? null;
}

// Como en el servidor, una solicitud aprobada aparece en el directorio. Se llama al empezar y al aprobar.
export function syncMockDirectory() {
  const approved: Psychologist[] = world.applications
    .filter((a) => a.status === "approved")
    .map((a) => ({
      id: a.id,
      name: a.fullName,
      title: a.title,
      specialties: a.specialties,
      approach: a.approach,
      years: a.years ?? 0,
      bio: a.bio,
      license: a.license,
      meetLink: "",
      hours: [],
      sessionMinutes: DEFAULT_AVAILABILITY.minutes,
    }));
  const base = PSYCHOLOGISTS.filter((p) => !world.applications.some((a) => a.id === p.id));
  setPsychologists([...base, ...approved]);
}

// La usa la simulación de cuentas: una solicitud aprobada aquí vuelve psicóloga a esa cuenta.
export function mockApproved(email: string) {
  return readJSON<World>(KEY, seed).applications.some((a) => a.email === email && a.status === "approved");
}

// IndexedDB: el archivo de cada documento, por su ruta.
const DB = "replica-profesional";
const STORE = "documentos";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function fileStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = run(db.transaction(STORE, mode).objectStore(STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Un PDF de una página para los documentos de prueba, con su título escrito.
function samplePdf(title: string) {
  const text = title.replace(/[()\\]/g, "");
  const content = `BT /F1 18 Tf 72 720 Td (Documento de prueba) Tj 0 -28 Td /F1 12 Tf (${text}) Tj ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((body, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new Blob([pdf], { type: "application/pdf" });
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export const mockProfessionalService: ProfessionalService = {
  async myApplication() {
    await wait(300);
    const app = mine();
    return app ? clone(app) : null;
  },

  async uploadDocument(file, onProgress) {
    const docId = id();
    const path = `${currentEmail()}/${docId}.pdf`;
    for (let step = 1; step <= 5; step += 1) {
      await wait(120);
      onProgress(step / 5);
    }
    await fileStore("readwrite", (store) => store.put(file, path));
    return { id: docId, path, name: file.name, sizeBytes: file.size };
  },

  async discardDocument(document: UploadedDocument) {
    await fileStore("readwrite", (store) => store.delete(document.path)).catch(() => undefined);
  },

  async submitApplication(form, ethicsVersion, uploads, replace) {
    await wait();
    const email = currentEmail();
    const previous = mine();
    if (previous && (previous.status === "pending" || previous.status === "approved")) throw new Error("ya enviada");
    const now = new Date().toISOString();
    const kept = (previous?.documents ?? []).map((d) =>
      previous?.status === "rejected" || replace.includes(d.id) ? { ...d, replaced: true } : d
    );
    const added: VerificationDocument[] = uploads.map((u) => ({ ...u, createdAt: now, replaced: false }));
    const next: StoredApplication = {
      ...form,
      id: previous?.id ?? `sol-${id()}`,
      email,
      status: "pending",
      statusReason: null,
      submittedAt: now,
      verifiedAt: null,
      ethicsAcceptedAt: now,
      documents: [...kept, ...added],
      reviews: previous?.reviews ?? [],
    };
    void ethicsVersion;
    world = { ...world, applications: [...world.applications.filter((a) => a.email !== email), next] };
    save();
  },

  async documentUrl(document) {
    const file = await fileStore<Blob | undefined>("readonly", (store) => store.get(document.path)).catch(() => undefined);
    return URL.createObjectURL(file ?? samplePdf(document.name));
  },

  async myRole(): Promise<AccountRole> {
    await wait(100);
    return mine()?.status === "approved" ? "psychologist" : "user";
  },

  async listApplications() {
    await wait(700);
    return clone(world.applications);
  },

  async review(applicationId, action, reason, documentIds) {
    await wait();
    const app = world.applications.find((a) => a.id === applicationId);
    if (!app || (action === "revoked" ? app.status !== "approved" : app.status !== "pending")) throw new Error("ya revisada");
    const now = new Date().toISOString();
    const reviewed: StoredApplication = {
      ...app,
      status: action,
      statusReason: action === "approved" ? null : reason.trim(),
      verifiedAt: action === "approved" ? now : app.verifiedAt,
      reviews: [
        {
          id: id(),
          action,
          reason: reason.trim() || null,
          documentIds: action === "needs_changes" ? documentIds : [],
          createdAt: now,
        },
        ...app.reviews,
      ],
    };
    world = { ...world, applications: world.applications.map((a) => (a.id === applicationId ? reviewed : a)) };
    save();
    if (action === "approved" || action === "revoked") syncMockDirectory();
  },

  async loadPractice() {
    await wait(700);
    const { notes: _notes, clinical: _clinical, ...practice } = world.practice;
    // Una simulación guardada antes de que existiera el perfil editable.
    return clone({ ...practice, profile: practice.profile ?? MOCK_PROFILE });
  },

  async answerRequest(requestId, accept) {
    await wait();
    const p = world.practice;
    const request = p.requests.find((r) => r.id === requestId);
    if (!request) throw new Error("no existe");
    const now = new Date().toISOString();
    const conversationId = `con-${request.userId}`;
    world.practice = {
      ...p,
      requests: p.requests.filter((r) => r.id !== requestId),
      patients: accept
        ? [
            ...p.patients.filter((x) => x.id !== request.userId),
            { id: request.userId, name: request.name, photo: null, conversationId, since: now, endedAt: null, endedBy: null, readAt: now, sharing: false, shareChangedAt: null },
          ]
        : p.patients,
      messages: accept
        ? [...p.messages, { id: id(), conversationId, from: "system", kind: "event", event: "accepted", text: "Valeria aceptó acompañarte.", createdAt: now }]
        : p.messages,
    };
    save();
  },

  async sendMessage(message) {
    await wait(250);
    world.practice = { ...world.practice, messages: [...world.practice.messages, message] };
    save();
  },

  async markRead(conversationId) {
    const now = new Date().toISOString();
    world.practice = {
      ...world.practice,
      patients: world.practice.patients.map((x) => (x.conversationId === conversationId ? { ...x, readAt: now } : x)),
    };
    save();
  },

  async endCare(conversationId) {
    await wait();
    const now = new Date().toISOString();
    const p = world.practice;
    world.practice = {
      ...p,
      patients: p.patients.map((x) =>
        x.conversationId === conversationId ? { ...x, endedAt: now, endedBy: "psychologist", sharing: false, shareChangedAt: x.sharing ? now : x.shareChangedAt } : x
      ),
      messages: [...p.messages, { id: id(), conversationId, from: "system", kind: "event", event: "ended_psychologist", text: "Valeria terminó el acompañamiento.", createdAt: now }],
    };
    save();
  },

  async saveSchedule(meetLink, availability) {
    await wait();
    world.practice = { ...world.practice, meetLink, availability };
    save();
  },

  async saveProfile(profile) {
    await wait();
    world.practice = { ...world.practice, profile: { ...(world.practice.profile ?? MOCK_PROFILE), ...profile } };
    save();
    const valeria = PSYCHOLOGISTS.find((p) => p.id === "psi-valeria");
    if (valeria) Object.assign(valeria, { specialties: profile.specialties, approach: profile.approach, years: profile.years, bio: profile.bio });
  },

  async schedule(conversationId, startsAt, minutes, meetLink) {
    await wait();
    const appointment: Appointment = { id: id(), conversationId, psychologistId: "", startsAt, meetLink, minutes };
    const now = new Date().toISOString();
    world.practice = {
      ...world.practice,
      appointments: [...world.practice.appointments, appointment],
      messages: [...world.practice.messages, { id: id(), conversationId, from: "system", kind: "session", text: "", appointmentId: appointment.id, createdAt: now }],
    };
    save();
    return appointment;
  },

  async cancelAppointment(appointmentId) {
    await wait();
    const now = new Date().toISOString();
    world.practice = {
      ...world.practice,
      appointments: world.practice.appointments.map((a) => (a.id === appointmentId ? { ...a, cancelledAt: now } : a)),
    };
    save();
  },

  async patientNotes(patientId) {
    await wait(600);
    const patient = world.practice.patients.find((x) => x.id === patientId);
    // Como en el servidor: sin permiso activo, ninguna nota sale.
    return patient?.sharing ? clone(world.practice.notes[patientId] ?? []) : [];
  },

  async clinicalNotes(patientId) {
    await wait(400);
    return clone(world.practice.clinical.filter((n) => n.patientId === patientId)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async saveClinicalNote(patientId, noteId, body) {
    await wait(300);
    const now = new Date().toISOString();
    const existing = noteId ? world.practice.clinical.find((n) => n.id === noteId) : null;
    const note: ClinicalNote = existing ? { ...existing, body, updatedAt: now } : { id: id(), patientId, body, createdAt: now, updatedAt: now };
    world.practice = {
      ...world.practice,
      clinical: existing ? world.practice.clinical.map((n) => (n.id === note.id ? note : n)) : [note, ...world.practice.clinical],
    };
    save();
    return clone(note);
  },

  async deleteClinicalNote(noteId) {
    await wait(300);
    world.practice = { ...world.practice, clinical: world.practice.clinical.filter((n) => n.id !== noteId) };
    save();
  },

  // Sin servidor no llega nada solo.
  live() {
    return () => {};
  },
};
