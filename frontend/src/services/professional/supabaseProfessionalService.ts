import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import type { Mood } from "../../features/journal/moods";
import { supabaseKey, supabaseUrl } from "../../lib/supabase/client";
import type { AccountRole } from "../auth";
import {
  APPOINTMENT_COLUMNS,
  appointmentOf,
  checked,
  MESSAGE_COLUMNS,
  messageOf,
  rows,
  type AppointmentRow,
  type MessageRow,
} from "../data/supabaseData";
import {
  DEFAULT_AVAILABILITY,
  type Application,
  type Availability,
  type ClinicalNote,
  type Patient,
  type ProfessionalService,
  type SharedNote,
} from "./types";

// Las columnas que usa la web, tal como llegan de la base de datos (docs/03-base-de-datos.md).
type DocumentRow = { id: string; path: string; name: string; size_bytes: number; created_at: string; replaced: boolean };
type ReviewRow = { id: string; action: Application["status"]; reason: string | null; documents: string[]; created_at: string };
type ApplicationRow = {
  profile_id: string;
  full_name: string;
  title: string;
  license: string;
  university: string | null;
  specialties: string[];
  approach: string;
  years_experience: number;
  bio: string;
  status: Application["status"];
  status_reason: string | null;
  submitted_at: string;
  verified_at: string | null;
  ethics_accepted_at: string | null;
  verification_documents: DocumentRow[];
  verification_reviews: ReviewRow[];
};
type RequestRow = { id: string; user_id: string; message: string; status: string; created_at: string; responded_at: string | null };
type ConversationRow = {
  id: string;
  user_id: string;
  created_at: string;
  psychologist_read_at: string;
  ended_at: string | null;
  ended_by: Patient["endedBy"];
};
type PersonRow = { id: string; name: string; avatar_url: string | null };
type ShareRow = { user_id: string; active: boolean; changed_at: string };
type NoteRow = { id: string; body: string; mood: Mood | null; created_at: string; entry_tags: { tags: { name: string } | null }[] };
type ClinicalRow = { id: string; patient_id: string; body: string; created_at: string; updated_at: string };

const APPLICATION_COLUMNS =
  "profile_id, full_name, title, license, university, specialties, approach, years_experience, bio, status, status_reason, submitted_at, verified_at, ethics_accepted_at, verification_documents(id, path, name, size_bytes, created_at, replaced), verification_reviews(id, action, reason, documents, created_at)";
const CLINICAL_COLUMNS = "id, patient_id, body, created_at, updated_at";

function applicationOf(row: ApplicationRow): Application {
  return {
    id: row.profile_id,
    fullName: row.full_name,
    title: row.title,
    license: row.license,
    university: row.university ?? "",
    specialties: row.specialties,
    approach: row.approach,
    years: row.years_experience,
    bio: row.bio,
    status: row.status,
    statusReason: row.status_reason,
    submittedAt: row.submitted_at,
    verifiedAt: row.verified_at,
    ethicsAcceptedAt: row.ethics_accepted_at,
    documents: row.verification_documents
      .map((d) => ({ id: d.id, path: d.path, name: d.name, sizeBytes: d.size_bytes, createdAt: d.created_at, replaced: d.replaced }))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    reviews: row.verification_reviews
      .map((r) => ({
        id: r.id,
        action: r.action as Exclude<Application["status"], "pending">,
        reason: r.reason,
        documentIds: r.documents,
        createdAt: r.created_at,
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  };
}

function clinicalOf(row: ClinicalRow): ClinicalNote {
  return { id: row.id, patientId: row.patient_id, body: row.body, createdAt: row.created_at, updatedAt: row.updated_at };
}

// La agenda guardada puede venir incompleta (o vacía, antes de configurarla).
function availabilityOf(value: Partial<Availability> | null): Availability {
  return { ...DEFAULT_AVAILABILITY, ...(value ?? {}) };
}

export function supabaseProfessionalService(supabase: SupabaseClient): ProfessionalService {
  async function session() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw new Error("Sin sesión");
    return data.session;
  }
  const me = async () => (await session()).user.id;

  return {
    async myApplication() {
      const row = rows<ApplicationRow | null>(
        await supabase.from("psychologist_profiles").select(APPLICATION_COLUMNS).eq("profile_id", await me()).maybeSingle()
      );
      return row ? applicationOf(row) : null;
    },

    // supabase-js no informa el progreso de una subida: se sube con la misma llamada de su API.
    async uploadDocument(file, onProgress) {
      const { access_token, user } = await session();
      const id = crypto.randomUUID();
      const path = `${user.id}/${id}.pdf`;
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${supabaseUrl}/storage/v1/object/credentials/${path}`);
        xhr.setRequestHeader("Authorization", `Bearer ${access_token}`);
        xhr.setRequestHeader("apikey", supabaseKey);
        xhr.setRequestHeader("Content-Type", "application/pdf");
        xhr.setRequestHeader("x-upsert", "false");
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) onProgress(e.loaded / e.total);
        };
        xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`subida ${xhr.status}`)));
        xhr.onerror = () => reject(new Error("Sin conexión"));
        xhr.send(file);
      });
      onProgress(1);
      return { id, path, name: file.name, sizeBytes: file.size };
    },

    async discardDocument(document) {
      checked(await supabase.storage.from("credentials").remove([document.path]));
    },

    async submitApplication(form, ethicsVersion, uploads, replace) {
      checked(
        await supabase.rpc("submit_application", {
          p_full_name: form.fullName,
          p_title: form.title,
          p_license: form.license,
          p_university: form.university,
          p_specialties: form.specialties,
          p_approach: form.approach,
          p_years: form.years,
          p_bio: form.bio,
          p_ethics_version: ethicsVersion,
          p_documents: uploads.map((u) => ({ id: u.id, path: u.path, name: u.name, size_bytes: u.sizeBytes })),
          p_replace: replace,
        })
      );
    },

    // Un enlace que vence a los diez minutos: el bucket es privado.
    async documentUrl(document) {
      const { data, error } = await supabase.storage.from("credentials").createSignedUrl(document.path, 600);
      if (error || !data) throw new Error(error?.message ?? "Sin enlace");
      return data.signedUrl;
    },

    async myRole() {
      return rows<{ role: AccountRole }>(await supabase.from("profiles").select("role").eq("id", await me()).single()).role;
    },

    async listApplications() {
      return rows<ApplicationRow[]>(
        await supabase.from("psychologist_profiles").select(APPLICATION_COLUMNS).order("submitted_at", { ascending: false })
      ).map(applicationOf);
    },

    // La decisión pasa por set-role: la guarda en el historial y, al aprobar, le da el rol.
    async review(applicationId, action, reason, documentIds) {
      const { error } = await supabase.functions.invoke("set-role", {
        body: { applicationId, action, reason, documents: documentIds },
      });
      if (error) throw error;
    },

    async loadPractice() {
      const uid = await me();
      const [profile, requests, conversations, shares] = await Promise.all([
        supabase.from("psychologist_profiles").select("full_name, title, license, university, specialties, approach, years_experience, bio, meet_link, availability").eq("profile_id", uid).single(),
        supabase
          .from("care_requests")
          .select("id, user_id, message, status, created_at, responded_at")
          .eq("psychologist_id", uid)
          .in("status", ["pending", "accepted"])
          .order("created_at", { ascending: false }),
        supabase.from("conversations").select("id, user_id, created_at, psychologist_read_at, ended_at, ended_by").eq("psychologist_id", uid),
        supabase.from("diary_shares").select("user_id, active, changed_at").eq("psychologist_id", uid),
      ]);
      const p = rows<{
        full_name: string;
        title: string;
        license: string;
        university: string | null;
        specialties: string[];
        approach: string;
        years_experience: number;
        bio: string;
        meet_link: string | null;
        availability: Partial<Availability> | null;
      }>(profile);
      const requestRows = rows<RequestRow[]>(requests);
      const conversationRows = rows<ConversationRow[]>(conversations);
      const shareRows = rows<ShareRow[]>(shares);
      const conversationIds = conversationRows.map((c) => c.id);
      const peopleIds = [...new Set([...conversationRows.map((c) => c.user_id), ...requestRows.map((r) => r.user_id)])];
      const [people, messages, appointments] = await Promise.all([
        supabase.from("profiles").select("id, name, avatar_url").in("id", peopleIds),
        supabase.from("messages").select(MESSAGE_COLUMNS).in("conversation_id", conversationIds).order("created_at"),
        supabase.from("appointments").select(APPOINTMENT_COLUMNS).in("conversation_id", conversationIds),
      ]);
      const personRows = rows<PersonRow[]>(people);
      // Las notas sueltas compartidas en el chat: el día, el ánimo y el tema salen de la nota misma,
      // que el psicólogo puede leer aunque no tenga el diario compartido.
      const messageList = rows<MessageRow[]>(messages).map(messageOf);
      const entryIds = [...new Set(messageList.flatMap((m) => (m.entryId ? [m.entryId] : [])))];
      const sharedRows = entryIds.length
        ? rows<Omit<NoteRow, "body">[]>(await supabase.from("entries").select("id, mood, created_at, entry_tags(tags(name))").in("id", entryIds))
        : [];
      const withNotes = messageList.map((m) => {
        const note = m.entryId ? sharedRows.find((r) => r.id === m.entryId) : undefined;
        return note
          ? { ...m, note: { createdAt: note.created_at, mood: note.mood, tag: note.entry_tags.flatMap((t) => (t.tags ? [t.tags.name] : []))[0] ?? null } }
          : m;
      });
      const nameOf = (id: string) => personRows.find((x) => x.id === id)?.name.trim() || "Sin nombre";
      // Desde cuándo lo acompaña: la última vez que aceptó.
      const acceptedAt = (userId: string) =>
        requestRows
          .filter((r) => r.user_id === userId && r.status === "accepted" && r.responded_at)
          .map((r) => r.responded_at as string)
          .sort()
          .pop();
      return {
        name: p.full_name,
        profile: {
          title: p.title,
          license: p.license,
          university: p.university ?? "",
          specialties: p.specialties,
          approach: p.approach,
          years: p.years_experience,
          bio: p.bio,
        },
        meetLink: p.meet_link ?? "",
        availability: availabilityOf(p.availability),
        requests: requestRows
          .filter((r) => r.status === "pending")
          .map((r) => ({ id: r.id, userId: r.user_id, name: nameOf(r.user_id), message: r.message, createdAt: r.created_at })),
        patients: conversationRows.map((c) => {
          const share = shareRows.find((s) => s.user_id === c.user_id);
          return {
            id: c.user_id,
            name: nameOf(c.user_id),
            photo: personRows.find((x) => x.id === c.user_id)?.avatar_url ?? null,
            conversationId: c.id,
            since: acceptedAt(c.user_id) ?? c.created_at,
            endedAt: c.ended_at,
            endedBy: c.ended_by,
            readAt: c.psychologist_read_at,
            sharing: share?.active ?? false,
            shareChangedAt: share?.changed_at ?? null,
          };
        }),
        messages: withNotes,
        appointments: rows<AppointmentRow[]>(appointments).map((a) => appointmentOf(a, [])),
      };
    },

    async answerRequest(id, accept) {
      const updated = rows<{ id: string }[]>(
        await supabase
          .from("care_requests")
          .update({ status: accept ? "accepted" : "declined" })
          .eq("id", id)
          .eq("status", "pending")
          .select("id")
      );
      // La persona la retiró mientras tanto.
      if (!updated.length) throw new Error("Ya no está pendiente");
    },

    async sendMessage({ id, conversationId, text }) {
      checked(await supabase.from("messages").insert({ id, conversation_id: conversationId, sender: "psychologist", body: text }));
    },

    async markRead(conversationId) {
      checked(await supabase.rpc("mark_conversation_read", { p_id: conversationId }));
    },

    async endCare(conversationId) {
      checked(await supabase.rpc("end_conversation", { p_id: conversationId }));
    },

    async saveSchedule(meetLink, availability) {
      checked(await supabase.from("psychologist_profiles").update({ meet_link: meetLink, availability }).eq("profile_id", await me()));
    },

    async saveProfile(profile) {
      checked(
        await supabase.rpc("update_public_profile", {
          p_specialties: profile.specialties,
          p_approach: profile.approach,
          p_years: profile.years,
          p_bio: profile.bio,
        })
      );
    },

    async schedule(conversationId, startsAt, minutes, meetLink) {
      const row = rows<AppointmentRow>(
        await supabase
          .from("appointments")
          .insert({ conversation_id: conversationId, starts_at: startsAt, meet_link: meetLink, duration_minutes: minutes })
          .select(APPOINTMENT_COLUMNS)
          .single()
      );
      return appointmentOf(row, []);
    },

    async cancelAppointment(id) {
      checked(await supabase.from("appointments").update({ cancelled_at: new Date().toISOString() }).eq("id", id));
    },

    // Las reglas dejan pasar solo las no privadas y solo con el permiso activo. Ni réplicas ni favoritas.
    async patientNotes(patientId) {
      return rows<NoteRow[]>(
        await supabase
          .from("entries")
          .select("id, body, mood, created_at, entry_tags(tags(name))")
          .eq("user_id", patientId)
          .order("created_at", { ascending: false })
      ).map(
        (row): SharedNote => ({
          id: row.id,
          createdAt: row.created_at,
          text: row.body,
          mood: row.mood,
          tags: row.entry_tags.flatMap((t) => (t.tags ? [t.tags.name] : [])),
        })
      );
    },

    async clinicalNotes(patientId) {
      return rows<ClinicalRow[]>(
        await supabase.from("clinical_notes").select(CLINICAL_COLUMNS).eq("patient_id", patientId).order("created_at", { ascending: false })
      ).map(clinicalOf);
    },

    async saveClinicalNote(patientId, id, body) {
      const query = id
        ? supabase.from("clinical_notes").update({ body }).eq("id", id)
        : supabase.from("clinical_notes").insert({ patient_id: patientId, body });
      return clinicalOf(rows<ClinicalRow>(await query.select(CLINICAL_COLUMNS).single()));
    },

    async deleteClinicalNote(id) {
      checked(await supabase.from("clinical_notes").delete().eq("id", id));
    },

    // Como el chat de la persona (services/data/supabaseData.ts): cada vez que el canal queda suscrito,
    // la primera y al reconectarse, se trae todo otra vez, por si se perdió un evento.
    live(handlers) {
      let channel: RealtimeChannel | null = null;
      let stopped = false;
      void me().then((uid) => {
        if (stopped) return;
        const mine = `psychologist_id=eq.${uid}`;
        channel = supabase
          .channel(`consultorio-${uid}`)
          .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, ({ new: row }) =>
            handlers.onMessage(messageOf(row as MessageRow))
          )
          .on("postgres_changes", { event: "*", schema: "public", table: "care_requests", filter: mine }, () => handlers.onResync())
          .on("postgres_changes", { event: "*", schema: "public", table: "conversations", filter: mine }, () => handlers.onResync())
          .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, () => handlers.onResync())
          .subscribe((status) => {
            if (status === "SUBSCRIBED") handlers.onResync();
          });
      });
      return () => {
        stopped = true;
        if (channel) void supabase.removeChannel(channel);
      };
    },
  };
}
