import { useSyncExternalStore } from "react";
import { DEFAULT_REMINDER_TIME, dataService, type ProfilePatch } from "../../services/data";
import { readJSON, writeJSON } from "../../lib/storage";

// El perfil y los ajustes de la persona. Con Supabase viven en su cuenta; sin él, en el navegador. La
// solicitud de psicólogo tiene su propio servicio (services/professional).
// Igual que la app (features/profile/store.ts). El bloqueo vive aparte, solo en este navegador
// (lib/lock.ts).
const KEY = "replica.profile.v2";

export type ReplyTone = "suave" | "profundo" | "directo";
// A qué hora llega la réplica del día.
export type DayReplyHour = 20 | 22;
export const DAY_REPLY_HOURS: DayReplyHour[] = [20, 22];

export type Profile = {
  name: string;
  // Una frase que la persona elige para sí; se muestra en su perfil.
  intention: string;
  // Foto de perfil (imagen recortada, guardada en el navegador).
  photo: string | null;
  memberSince: string;
  replyTone: ReplyTone;
  dayReplyHour: DayReplyHour;
  // El recordatorio diario (RF-53), de la cuenta. Lo enciende y lo apaga features/reminder.
  reminderEnabled: boolean;
  // "HH:MM", en hora local.
  reminderTime: string;
};

function initial(): Profile {
  return {
    name: "",
    intention: "",
    photo: null,
    memberSince: new Date().toISOString(),
    replyTone: "suave",
    dayReplyHour: 22,
    reminderEnabled: false,
    reminderTime: DEFAULT_REMINDER_TIME,
  };
}

// Con Supabase no se guarda nada aquí. La solicitud que guardaban las versiones anteriores se ignora.
const { psychologist: _old, ...saved } = dataService ? {} : readJSON<Partial<Profile> & { psychologist?: unknown }>(KEY, () => ({}));
let profile: Profile = { ...initial(), ...saved };
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function apply(patch: Partial<Profile>) {
  profile = { ...profile, ...patch };
  if (!dataService) writeJSON(KEY, profile);
  listeners.forEach((l) => l());
}

export function updateProfile(patch: Partial<Profile>) {
  const previous = profile;
  apply(patch);
  if (!dataService) return;
  // El recordatorio tiene su propio camino (features/reminder), con la suscripción del navegador.
  const { photo, memberSince: _memberSince, reminderEnabled: _enabled, reminderTime: _time, ...fields } = patch;
  const server: ProfilePatch = fields;
  if (Object.keys(server).length) dataService.saveProfile(server).catch(() => apply(previous));
  // Mientras sube se ve la foto recién elegida; después, la del servidor.
  if (photo !== undefined) {
    dataService.savePhoto(photo).then(
      (url) => apply({ photo: url }),
      () => apply({ photo: previous.photo })
    );
  }
}

// Lo que hay en el servidor, al entrar.
export function hydrateProfile(data: Profile) {
  apply(data);
}

// Al eliminar la cuenta o cerrar sesión con Supabase: vuelve al perfil vacío.
export function resetProfile() {
  apply(initial());
}

export function useProfile() {
  return useSyncExternalStore(subscribe, () => profile);
}

export function getProfile() {
  return profile;
}

export function firstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? "";
}
