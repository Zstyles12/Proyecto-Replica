import type { SupabaseClient } from "@supabase/supabase-js";
import type { Appointment, CareRequest, Conversation, DiaryShare, Message, Psychologist } from "../../features/care/types";
import type { Mood } from "../../features/journal/moods";
import type { DayReply, Note, ReplyMode } from "../../features/journal/types";
import type { DayReplyHour, ReplyTone } from "../../features/profile/store";
import { dayKey } from "../../lib/format";
import type { TutorialId, TutorialsSaved } from "../../lib/tutorials";
import type { AccountRole } from "../auth";
import type { ReplyContent } from "../ai";
import { DEFAULT_REMINDER_TIME, type AccountData, type CareData, type DataService, type ProfilePatch, type SavedPhrase } from "./types";

// Las columnas que usa la web, tal como llegan de la base de datos (docs/03-base-de-datos.md).
type ProfileRow = {
  role: AccountRole;
  name: string;
  intention: string;
  avatar_url: string | null;
  terms_version: string | null;
  terms_accepted_at: string | null;
  setup_done_at: string | null;
  created_at: string;
};
type SettingsRow = {
  reply_tone: ReplyTone;
  day_reply_hour: DayReplyHour;
  tutorials_seen: TutorialId[];
  tutorials_skipped: boolean;
  reminder_enabled: boolean;
  reminder_time: string | null;
};
type ReplyRow = Pick<ReplyContent, "headline" | "body" | "questions" | "learning"> & { risk: boolean };
type EntryRow = {
  id: string;
  body: string;
  mood: Mood;
  prompt: string | null;
  reply_mode: ReplyMode;
  is_favorite: boolean;
  created_at: string;
  entry_tags: { tags: { name: string } | null }[];
  ai_replies: ReplyRow | ReplyRow[] | null;
};
type DayReplyRow = ReplyRow & {
  day: string;
  kind: "day" | "late";
  entry_ids: string[];
  day_reply_comments: { entry_id: string; comment: string }[];
};
type SavedRow = { daily_phrase_id: string | null; saved_at: string; ai_replies: { entry_id: string } | null };
type DirectoryRow = {
  id: string;
  full_name: string;
  title: string;
  license: string;
  specialties: string[];
  approach: string;
  years_experience: number;
  bio: string;
  availability: { minutes?: number } | null;
};
type ConversationRow = {
  id: string;
  psychologist_id: string;
  created_at: string;
  last_read_at: string;
  ended_at: string | null;
  ended_by: Conversation["endedBy"] | null;
};
export type MessageRow = {
  id: string;
  conversation_id: string;
  appointment_id: string | null;
  entry_id: string | null;
  sender: Message["from"];
  kind: Message["kind"];
  event: Message["event"] | null;
  body: string;
  created_at: string;
};
export type AppointmentRow = {
  id: string;
  conversation_id: string;
  starts_at: string;
  meet_link: string;
  duration_minutes: number;
  cancelled_at: string | null;
};
type CareRequestRow = {
  id: string;
  psychologist_id: string;
  message: string;
  status: CareRequest["status"];
  created_at: string;
  responded_at: string | null;
};
type ShareRow = { psychologist_id: string; active: boolean; changed_at: string };

export const MESSAGE_COLUMNS = "id, conversation_id, appointment_id, entry_id, sender, kind, event, body, created_at";
export const APPOINTMENT_COLUMNS = "id, conversation_id, starts_at, meet_link, duration_minutes, cancelled_at";
const CONVERSATION_COLUMNS = "id, psychologist_id, created_at, last_read_at, ended_at, ended_by";
const CARE_REQUEST_COLUMNS = "id, psychologist_id, message, status, created_at, responded_at";
const ENTRY_COLUMNS = "id, body, mood, prompt, reply_mode, is_favorite, created_at, entry_tags(tags(name)), ai_replies(headline, body, questions, learning, risk)";
const DAY_REPLY_COLUMNS = "day, kind, entry_ids, headline, body, questions, learning, risk, day_reply_comments(entry_id, comment)";

// Una relación de uno a uno puede llegar como objeto o como lista, según cómo la detecte la API.
function one<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function noteOf(row: EntryRow): Note {
  const reply = one(row.ai_replies);
  return {
    id: row.id,
    createdAt: row.created_at,
    text: row.body,
    mood: row.mood,
    tags: row.entry_tags.flatMap((t) => (t.tags ? [t.tags.name] : [])),
    prompt: row.prompt,
    reply,
    replyStatus: reply ? "done" : "none",
    replyMode: row.reply_mode,
  };
}

// La columna guarda la fecha ("2026-10-31"); la web usa su clave de día local.
function keyOfDate(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return dayKey(new Date(y, m - 1, d));
}

function dayReplyOf(row: DayReplyRow): DayReply {
  return {
    day: keyOfDate(row.day),
    kind: row.kind,
    noteIds: row.entry_ids,
    reply: {
      headline: row.headline,
      body: row.body,
      questions: row.questions,
      learning: row.learning,
      risk: row.risk,
      comments: row.day_reply_comments.map((c) => ({ noteId: c.entry_id, text: c.comment })),
    },
    replyStatus: "done",
  };
}

function savedOf(row: SavedRow): SavedPhrase[] {
  if (row.daily_phrase_id) return [{ key: `dia:${row.daily_phrase_id}`, savedAt: row.saved_at }];
  return row.ai_replies ? [{ key: `nota:${row.ai_replies.entry_id}`, savedAt: row.saved_at }] : [];
}

function psychologistOf(row: DirectoryRow): Psychologist {
  return {
    id: row.id,
    name: row.full_name,
    title: row.title,
    specialties: row.specialties,
    approach: row.approach,
    years: row.years_experience,
    bio: row.bio,
    license: row.license,
    // El link personal no sale del servidor: cada sesión trae el suyo.
    meetLink: "",
    hours: [],
    sessionMinutes: row.availability?.minutes ?? 50,
  };
}

function conversationOf(row: ConversationRow): Conversation {
  return {
    id: row.id,
    psychologistId: row.psychologist_id,
    createdAt: row.created_at,
    lastReadAt: row.last_read_at,
    endedAt: row.ended_at ?? undefined,
    endedBy: row.ended_by ?? undefined,
  };
}

function careRequestOf(row: CareRequestRow): CareRequest {
  return {
    id: row.id,
    psychologistId: row.psychologist_id,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    respondedAt: row.responded_at ?? undefined,
  };
}

export function messageOf(row: MessageRow): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    from: row.sender,
    kind: row.kind,
    text: row.body,
    createdAt: row.created_at,
    appointmentId: row.appointment_id ?? undefined,
    event: row.event ?? undefined,
    entryId: row.entry_id ?? undefined,
  };
}

export function appointmentOf(row: AppointmentRow, conversations: Conversation[]): Appointment {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    psychologistId: conversations.find((c) => c.id === row.conversation_id)?.psychologistId ?? "",
    startsAt: row.starts_at,
    meetLink: row.meet_link,
    minutes: row.duration_minutes ?? 50,
    cancelledAt: row.cancelled_at ?? undefined,
  };
}

function shareOf(row: ShareRow): DiaryShare {
  return { psychologistId: row.psychologist_id, active: row.active, changedAt: row.changed_at };
}

// Supabase responde con { data, error }: aquí un error es una excepción, como cualquier otro fallo.
export function rows<T>({ data, error }: { data: unknown; error: { message: string } | null }): T {
  if (error) throw new Error(error.message);
  return data as T;
}

export function checked({ error }: { error: { message: string } | null }) {
  if (error) throw new Error(error.message);
}

export function supabaseData(supabase: SupabaseClient): DataService {
  async function me() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw new Error("Sin sesión");
    return data.session.user.id;
  }

  async function loadCare(userId: string): Promise<CareData> {
    const conversationRows = rows<ConversationRow[]>(
      await supabase
        .from("conversations")
        .select(CONVERSATION_COLUMNS)
        .eq("user_id", userId)
    );
    const conversations = conversationRows.map(conversationOf);
    const ids = conversations.map((c) => c.id);
    const [messageRows, appointmentRows, shareRows, requestRows] = await Promise.all([
      supabase.from("messages").select(MESSAGE_COLUMNS).in("conversation_id", ids).order("created_at"),
      supabase.from("appointments").select(APPOINTMENT_COLUMNS).in("conversation_id", ids),
      supabase.from("diary_shares").select("psychologist_id, active, changed_at").eq("user_id", userId),
      supabase.from("care_requests").select(CARE_REQUEST_COLUMNS).eq("user_id", userId).order("created_at"),
    ]);
    return {
      conversations,
      requests: rows<CareRequestRow[]>(requestRows).map(careRequestOf),
      messages: rows<MessageRow[]>(messageRows).map(messageOf),
      appointments: rows<AppointmentRow[]>(appointmentRows).map((a) => appointmentOf(a, conversations)),
      shares: rows<ShareRow[]>(shareRows).map(shareOf),
    };
  }

  async function loadDayReplies(userId: string) {
    return rows<DayReplyRow[]>(await supabase.from("day_replies").select(DAY_REPLY_COLUMNS).eq("user_id", userId)).map(dayReplyOf);
  }

  return {
    async load(): Promise<AccountData> {
      const userId = await me();
      const [profile, settings, entries, dayReplies, saved, directory, care] = await Promise.all([
        supabase
          .from("profiles")
          .select("role, name, intention, avatar_url, terms_version, terms_accepted_at, setup_done_at, created_at")
          .eq("id", userId)
          .single(),
        supabase
          .from("user_settings")
          .select("reply_tone, day_reply_hour, tutorials_seen, tutorials_skipped, reminder_enabled, reminder_time")
          .eq("user_id", userId)
          .single(),
        // Siempre con user_id: un psicólogo también ve por las reglas las notas que le comparten.
        supabase.from("entries").select(ENTRY_COLUMNS).eq("user_id", userId).order("created_at", { ascending: false }),
        loadDayReplies(userId),
        supabase
          .from("saved_phrases")
          .select("daily_phrase_id, saved_at, ai_replies(entry_id)")
          .eq("user_id", userId)
          .order("saved_at", { ascending: false }),
        supabase.from("psychologist_directory").select("id, full_name, title, license, specialties, approach, years_experience, bio, availability"),
        loadCare(userId),
      ]);
      const p = rows<ProfileRow>(profile);
      const s = rows<SettingsRow>(settings);
      const entryRows = rows<EntryRow[]>(entries);
      return {
        role: p.role,
        consent: p.terms_version && p.terms_accepted_at ? { at: p.terms_accepted_at, version: p.terms_version } : null,
        setupDone: p.setup_done_at !== null,
        profile: {
          name: p.name,
          intention: p.intention,
          photo: p.avatar_url,
          memberSince: p.created_at,
          replyTone: s.reply_tone,
          dayReplyHour: s.day_reply_hour,
          reminderEnabled: s.reminder_enabled,
          reminderTime: s.reminder_time?.slice(0, 5) ?? DEFAULT_REMINDER_TIME,
        },
        tutorials: { seen: s.tutorials_seen, skipped: s.tutorials_skipped },
        notes: entryRows.map(noteOf),
        dayReplies,
        favoriteNoteIds: entryRows.filter((e) => e.is_favorite).map((e) => e.id),
        saved: rows<SavedRow[]>(saved).flatMap(savedOf),
        care,
        psychologists: rows<DirectoryRow[]>(directory).map(psychologistOf),
      };
    },

    // Realtime respeta las reglas de acceso: solo llega lo que la cuenta puede leer. Un evento se puede
    // perder si la conexión se corta: cada vez que el canal queda suscrito (la primera y al reconectarse)
    // se vuelve a traer el chat, y lo que ya estaba se reemplaza por id.
    live(userId, handlers) {
      const own = `user_id=eq.${userId}`;
      const channel = supabase
        .channel(`cuenta-${userId}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, ({ new: row }) =>
          handlers.onMessage(messageOf(row as MessageRow))
        )
        .on("postgres_changes", { event: "*", schema: "public", table: "conversations", filter: own }, () => handlers.onCareChanged())
        .on("postgres_changes", { event: "*", schema: "public", table: "care_requests", filter: own }, () => handlers.onCareChanged())
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "appointments" }, ({ new: row }) =>
          handlers.onAppointment(appointmentOf(row as AppointmentRow, []))
        )
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "appointments" }, ({ new: row }) =>
          handlers.onAppointment(appointmentOf(row as AppointmentRow, []))
        )
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "day_replies", filter: own }, () =>
          handlers.onDayReply()
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") handlers.onCareChanged();
        });
      return () => {
        void supabase.removeChannel(channel);
      };
    },

    async createNote(note, isPrivate, writtenAt) {
      const row = rows<{ created_at: string; reply_mode: ReplyMode }>(
        await supabase
          .rpc("create_entry", {
            p_id: note.id,
            p_body: note.text,
            p_mood: note.mood,
            p_tag: note.tags[0],
            p_prompt: note.prompt,
            p_private: isPrivate,
            // Solo las que esperaron sin conexión dicen cuándo se escribieron.
            ...(writtenAt ? { p_written_at: writtenAt } : {}),
          })
          .single()
      );
      return { createdAt: row.created_at, replyMode: row.reply_mode };
    },

    async setNoteFavorite(noteId, favorite) {
      checked(await supabase.from("entries").update({ is_favorite: favorite }).eq("id", noteId));
    },

    async deleteNote(noteId) {
      const deleted = rows<{ id: string }[]>(await supabase.from("entries").delete().eq("id", noteId).select("id"));
      if (!deleted.length) throw new Error("No se borró");
    },

    async loadDayReplies() {
      return loadDayReplies(await me());
    },

    async setPhraseSaved(key, saved, savedAt) {
      const [source, id] = [key.slice(0, key.indexOf(":")), key.slice(key.indexOf(":") + 1)];
      const userId = await me();
      if (source === "dia") {
        if (saved) checked(await supabase.from("saved_phrases").insert({ daily_phrase_id: id, saved_at: savedAt }));
        else checked(await supabase.from("saved_phrases").delete().eq("user_id", userId).eq("daily_phrase_id", id));
        return;
      }
      // Las frases de una réplica se guardan contra la réplica, y la web las conoce por su nota.
      const reply = rows<{ id: string }>(await supabase.from("ai_replies").select("id").eq("entry_id", id).single());
      if (saved) checked(await supabase.from("saved_phrases").insert({ reply_id: reply.id, saved_at: savedAt }));
      else checked(await supabase.from("saved_phrases").delete().eq("user_id", userId).eq("reply_id", reply.id));
    },

    async saveProfile(patch: ProfilePatch) {
      const userId = await me();
      const { name, intention, replyTone, dayReplyHour } = patch;
      if (name !== undefined || intention !== undefined) {
        checked(await supabase.from("profiles").update({ name, intention }).eq("id", userId));
      }
      if (replyTone !== undefined || dayReplyHour !== undefined) {
        checked(
          await supabase.from("user_settings").update({ reply_tone: replyTone, day_reply_hour: dayReplyHour }).eq("user_id", userId)
        );
      }
    },

    async savePhoto(photo) {
      const userId = await me();
      const path = `${userId}/foto.jpg`;
      const bucket = supabase.storage.from("avatars");
      let url: string | null = null;
      if (photo) {
        const file = await (await fetch(photo)).blob();
        checked(await bucket.upload(path, file, { upsert: true, contentType: "image/jpeg" }));
        // La dirección es siempre la misma: sin esto, el navegador seguiría mostrando la foto anterior.
        url = `${bucket.getPublicUrl(path).data.publicUrl}?v=${Date.now()}`;
      } else {
        checked(await bucket.remove([path]));
      }
      checked(await supabase.from("profiles").update({ avatar_url: url }).eq("id", userId));
      return url;
    },

    // Encenderlo suscribe este navegador; apagarlo lo apaga en la cuenta y borra la suscripción de aquí.
    async setReminder(reminder, subscription) {
      const userId = await me();
      if (reminder) {
        checked(await supabase.rpc("register_push", { p_token: reminder.subscription }));
        checked(
          await supabase.from("user_settings").update({ reminder_enabled: true, reminder_time: reminder.time }).eq("user_id", userId)
        );
        return;
      }
      checked(await supabase.from("user_settings").update({ reminder_enabled: false }).eq("user_id", userId));
      if (subscription) checked(await supabase.from("push_tokens").delete().eq("user_id", userId).eq("token", subscription));
    },

    async saveTimezone(timezone) {
      checked(await supabase.from("user_settings").update({ timezone }).eq("user_id", await me()));
    },

    async saveTutorials({ seen, skipped }: TutorialsSaved) {
      checked(
        await supabase.from("user_settings").update({ tutorials_seen: seen, tutorials_skipped: skipped }).eq("user_id", await me())
      );
    },

    async acceptTerms(version, at) {
      checked(await supabase.from("profiles").update({ terms_version: version, terms_accepted_at: at }).eq("id", await me()));
    },

    async finishSetup() {
      checked(await supabase.from("profiles").update({ setup_done_at: new Date().toISOString() }).eq("id", await me()));
    },

    async loadCare() {
      return loadCare(await me());
    },

    async requestCare({ id, psychologistId, message }) {
      const row = rows<CareRequestRow>(
        await supabase.from("care_requests").insert({ id, psychologist_id: psychologistId, message }).select(CARE_REQUEST_COLUMNS).single()
      );
      return careRequestOf(row);
    },

    async withdrawCare(id) {
      checked(await supabase.from("care_requests").update({ status: "withdrawn" }).eq("id", id).eq("status", "pending"));
    },

    async markRead(id) {
      checked(await supabase.rpc("mark_conversation_read", { p_id: id }));
    },

    // Con una nota, el servidor copia su texto y comprueba que sea propia y no privada.
    async sendMessage({ id, conversationId, text, entryId }) {
      checked(
        await supabase
          .from("messages")
          .insert({ id, conversation_id: conversationId, sender: "user", body: text, entry_id: entryId ?? null })
      );
    },

    async endConversation(id) {
      // El servidor firma quién lo terminó, apaga el permiso sobre el diario y deja el aviso.
      checked(await supabase.rpc("end_conversation", { p_id: id }));
    },

    async setDiaryShare(psychologistId, active) {
      const userId = await me();
      const updated = rows<{ id: string }[]>(
        await supabase
          .from("diary_shares")
          .update({ active })
          .eq("user_id", userId)
          .eq("psychologist_id", psychologistId)
          .select("id")
      );
      if (!updated.length) checked(await supabase.from("diary_shares").insert({ psychologist_id: psychologistId, active }));
    },

    async deleteAccount() {
      const { error } = await supabase.functions.invoke("delete-account", { method: "POST" });
      if (error) throw error;
    },
  };
}
