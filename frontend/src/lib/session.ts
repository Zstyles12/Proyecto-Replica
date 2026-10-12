import { useSyncExternalStore } from "react";
import { care } from "../features/care/store";
import { favorites } from "../features/cofre/store";
import { dayReplies } from "../features/journal/dayReplies";
import { journal } from "../features/journal/store";
import { noteFavorites } from "../features/notes/favorites";
import { getProfile, resetProfile, updateProfile } from "../features/profile/store";
import { authService, type AuthAccount } from "../services/auth";
import { readJSON, writeJSON } from "./storage";
import { tutorials } from "./tutorials";

// La cuenta con la que se entró y hasta dónde llegó la persona en su primera configuración.
// Igual que la app (lib/session.ts). Mientras no existe Supabase se guarda en el navegador.
const KEY = "replica.session";
// Cuentas que ya terminaron de configurarse aquí: al volver a entrar con ellas se salta la
// configuración. Con Supabase esto vendrá del perfil guardado en el servidor.
const KNOWN_KEY = "replica.accounts";
// Versión de los términos aceptados: si cambian, se vuelve a pedir el consentimiento.
export const TERMS_VERSION = "2026-09";

type Session = {
  account: AuthAccount | null;
  consent: { at: string; version: string } | null;
  setupDone: boolean;
};

export type Stage = "auth" | "consent" | "setup" | "app";

const EMPTY: Session = { account: null, consent: null, setupDone: false };

let session: Session = readJSON<Session>(KEY, () => EMPTY);
let known: string[] = readJSON<string[]>(KNOWN_KEY, () => []);
const listeners = new Set<() => void>();

function set(next: Session) {
  session = next;
  writeJSON(KEY, session);
  listeners.forEach((l) => l());
}

function setKnown(next: string[]) {
  known = next;
  writeJSON(KNOWN_KEY, known);
}

function stageOf(s: Session): Stage {
  if (!s.account) return "auth";
  if (!s.consent || s.consent.version !== TERMS_VERSION) return "consent";
  if (!s.setupDone) return "setup";
  return "app";
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useStage() {
  return useSyncExternalStore(subscribe, () => stageOf(session));
}

export function useAccount() {
  return useSyncExternalStore(subscribe, () => session.account);
}

export function getStage() {
  return stageOf(session);
}

export const sessionActions = {
  // Después de verificar el código o de volver de Apple/Google.
  signIn(account: AuthAccount) {
    // Ya existía (lo dice el servidor) o ya se configuró en este navegador.
    const returning = account.existing || known.includes(account.email);
    if (returning && !known.includes(account.email)) setKnown([...known, account.email]);
    // El nombre que entrega Apple o Google llena el paso del nombre, sin pisar uno ya elegido.
    if (account.name && !getProfile().name) updateProfile({ name: account.name });
    // Una cuenta nueva ve los recorridos desde el principio.
    if (!returning) tutorials.reset();
    set({
      account,
      consent: returning ? { at: new Date().toISOString(), version: TERMS_VERSION } : null,
      setupDone: returning,
    });
  },

  acceptConsent() {
    set({ ...session, consent: { at: new Date().toISOString(), version: TERMS_VERSION } });
  },

  completeSetup() {
    if (!session.account) return;
    if (!known.includes(session.account.email)) {
      setKnown([...known, session.account.email]);
      updateProfile({ memberSince: new Date().toISOString() });
    }
    set({ ...session, setupDone: true });
  },

  async signOut() {
    await authService.signOut();
    set(EMPTY);
  },

  // Borra la cuenta y todo lo escrito. Con Supabase también se borra en el servidor.
  async deleteAccount() {
    const email = session.account?.email;
    journal.clear();
    dayReplies.clear();
    favorites.clear();
    noteFavorites.clear();
    care.clear();
    resetProfile();
    tutorials.reset();
    if (email) setKnown(known.filter((e) => e !== email));
    await authService.signOut();
    set(EMPTY);
  },

  // Solo en desarrollo: volver a vivir el registro completo con la misma cuenta.
  async restartOnboarding() {
    const email = session.account?.email;
    tutorials.reset();
    if (email) setKnown(known.filter((e) => e !== email));
    await authService.signOut();
    set(EMPTY);
  },
};

// Herramientas de prueba (simulaciones, Playground): solo en desarrollo.
export const TEST_TOOLS = import.meta.env.DEV;
