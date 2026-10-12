import { useSyncExternalStore } from "react";
import { readJSON, writeJSON } from "../../lib/storage";

// El perfil y los ajustes de la persona: uno solo para toda la web (datos simulados hasta que exista
// Supabase). Igual que la app (features/profile/store.ts), sin el bloqueo ni el recordatorio, que
// no están en la v1 web (DESIGN-WEB.md §6).
const KEY = "replica.profile.v2";

export type ReplyTone = "suave" | "profundo" | "directo";
// A qué hora llega la réplica del día.
export type DayReplyHour = 20 | 22;
export const DAY_REPLY_HOURS: DayReplyHour[] = [20, 22];

export type PsychologistApplication = {
  status: "none" | "review" | "verified";
  fullName: string;
  license: string;
  specialties: string[];
  meetLink: string;
  bio: string;
  submittedAt: string | null;
};

export type Profile = {
  name: string;
  // Una frase que la persona elige para sí; se muestra en su perfil.
  intention: string;
  // Foto de perfil (imagen recortada, guardada en el navegador).
  photo: string | null;
  memberSince: string;
  replyTone: ReplyTone;
  dayReplyHour: DayReplyHour;
  psychologist: PsychologistApplication;
};

function initial(): Profile {
  return {
    name: "",
    intention: "",
    photo: null,
    memberSince: new Date().toISOString(),
    replyTone: "suave",
    dayReplyHour: 22,
    psychologist: {
      status: "none",
      fullName: "",
      license: "",
      specialties: [],
      meetLink: "",
      bio: "",
      submittedAt: null,
    },
  };
}

let profile: Profile = { ...initial(), ...readJSON<Partial<Profile>>(KEY, () => ({})) };
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function updateProfile(patch: Partial<Profile>) {
  profile = { ...profile, ...patch };
  writeJSON(KEY, profile);
  listeners.forEach((l) => l());
}

// Al eliminar la cuenta: vuelve al perfil vacío.
export function resetProfile() {
  updateProfile(initial());
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
