import { useSyncExternalStore } from "react";
import { aiChat } from "../features/aichat/store";
import { setPsychologists } from "../features/care/data";
import { care } from "../features/care/store";
import { favorites } from "../features/cofre/store";
import { dayReplies } from "../features/journal/dayReplies";
import { journal } from "../features/journal/store";
import { noteFavorites } from "../features/notes/favorites";
import { getProfile, hydrateProfile, resetProfile, updateProfile } from "../features/profile/store";
import { professional } from "../features/professional/store";
import { authService, type AccountRole, type AuthAccount } from "../services/auth";
import { dataService, type AccountData } from "../services/data";
import { reminder } from "../features/reminder/store";
import { lock } from "./lock";
import { isFromCopy, offline, setFromCopy } from "./offline";
import { readJSON, writeJSON } from "./storage";
import { hasBackend } from "./supabase/client";
import { tutorials } from "./tutorials";

// La cuenta con la que se entró y hasta dónde llegó la persona en su primera configuración. Igual que
// la app (lib/session.ts). Con Supabase todo esto sale del servidor al entrar y nada se guarda aquí;
// sin él, se guarda en el navegador.
const KEY = "replica.session";
// Cuentas simuladas que ya terminaron de configurarse aquí: al volver a entrar con ellas se salta la
// configuración.
const KNOWN_KEY = "replica.accounts";
// Versión de los términos aceptados: si cambian, se vuelve a pedir el consentimiento.
export const TERMS_VERSION = "2026-11";

type Session = {
  account: AuthAccount | null;
  consent: { at: string; version: string } | null;
  setupDone: boolean;
};

// "loading" y "unreachable" solo existen con Supabase: se está trayendo la cuenta, o no se pudo.
export type Stage = "loading" | "unreachable" | "auth" | "consent" | "setup" | "app";

const EMPTY: Session = { account: null, consent: null, setupDone: false };

// Una sesión simulada de cuando existía "Entrar con Apple" sigue como cuenta de correo.
function readSession(): Session {
  const saved = readJSON<Session>(KEY, () => EMPTY);
  if (!saved.account || saved.account.provider === "google") return saved;
  return { ...saved, account: { ...saved.account, provider: "email" } };
}

let session: Session = hasBackend ? EMPTY : readSession();
let known: string[] = readJSON<string[]>(KNOWN_KEY, () => []);
let transit: "loading" | "unreachable" | null = hasBackend ? "loading" : null;
// La cuenta que falta por traer, si se puede volver a intentar.
let pending: AuthAccount | null = null;
let stopLive: (() => void) | null = null;
// El id de la cuenta que se está mostrando (con Supabase), para borrar su copia al salir.
let currentUser: string | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function set(next: Session) {
  session = next;
  if (!hasBackend) writeJSON(KEY, session);
  emit();
}

function setKnown(next: string[]) {
  known = next;
  writeJSON(KNOWN_KEY, known);
}

function stageOf(s: Session): Stage {
  if (transit) return transit;
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

// El id de la cuenta con sesión abierta: ya está puesto cuando la web muestra sus pantallas.
export function currentUserId() {
  return currentUser;
}

export function useStage() {
  return useSyncExternalStore(subscribe, () => stageOf(session));
}

export function useAccount() {
  return useSyncExternalStore(subscribe, () => session.account);
}

// Las sesiones guardadas antes de que existieran los roles no lo traen: son cuentas normales.
export function useRole() {
  return useSyncExternalStore(subscribe, () => session.account?.role ?? "user");
}

export function getStage() {
  return stageOf(session);
}

// Lo que llegó del servidor (o su copia sin conexión) pasa a los stores: las pantallas leen de ellos.
async function apply(account: AuthAccount, userId: string, data: AccountData) {
  if (!dataService) return;
  currentUser = userId;
  hydrateProfile(data.profile);
  journal.hydrate(userId, data.notes, await offline.readOutbox(userId));
  dayReplies.hydrate(data.dayReplies);
  favorites.hydrate(data.saved);
  noteFavorites.hydrate(data.favoriteNoteIds);
  care.hydrate(data.care);
  setPsychologists(data.psychologists);
  // El nombre que entrega Google llena el paso del nombre, sin pisar uno ya elegido.
  if (account.name && !data.profile.name) updateProfile({ name: account.name });
  tutorials.hydrate(data.tutorials);
  stopLive?.();
  stopLive = dataService.live(userId, {
    onMessage: care.receiveMessage,
    onCareChanged: () => void care.resync(),
    onAppointment: care.receiveAppointment,
    onDayReply: () => void dayReplies.refresh(),
  });
  dataService.saveTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone).catch(() => {});
  transit = null;
  set({ account: { ...account, role: data.role }, consent: data.consent, setupDone: data.setupDone });
}

// Trae todo lo de la cuenta antes de mostrar la web. Sin conexión entra con la última copia de esta
// cuenta en el navegador (RNF-13); sin copia, "No pudimos traer tu diario". `quiet`: ya se está
// mostrando la copia y se trae lo nuevo sin tapar la pantalla.
async function enter(account: AuthAccount, quiet = false) {
  if (!dataService) return;
  pending = account;
  if (!quiet) {
    transit = "loading";
    emit();
  }
  let userId: string | null = null;
  try {
    userId = await authService.currentUserId();
    const data = await dataService.load();
    if (!userId) throw new Error("Sin sesión");
    await apply(account, userId, data);
    pending = null;
    setFromCopy(false);
    void offline.saveSnapshot({ ...account, role: data.role }, userId, data);
  } catch {
    if (quiet) {
      // Con conexión y sin sesión: la copia ya no es de nadie que esté aquí.
      if (navigator.onLine && !(await authService.currentUserId().catch(() => null))) forget();
      return;
    }
    const copy = await offline.readSnapshot(userId ?? undefined);
    if (copy && copy.account.email === account.email) {
      await apply(copy.account, copy.userId, copy.data);
      setFromCopy(true);
      return;
    }
    transit = "unreachable";
    emit();
  }
}

// Al volver la conexión con la copia a la vista, se trae la cuenta de verdad.
if (dataService) {
  window.addEventListener("online", () => {
    if (isFromCopy() && pending) void enter(pending, true);
  });
}

// Sin rastro de la cuenta en memoria: la próxima que entre en este navegador no ve nada de esta.
function forget({ outbox = false } = {}) {
  stopLive?.();
  stopLive = null;
  pending = null;
  transit = null;
  if (currentUser) void offline.forget(currentUser, { outbox });
  currentUser = null;
  setFromCopy(false);
  lock.forget(session.account?.email);
  journal.clear();
  dayReplies.clear();
  favorites.clear();
  noteFavorites.clear();
  care.clear();
  aiChat.clear();
  setPsychologists([]);
  professional.clear();
  resetProfile();
  tutorials.hydrate();
  set(EMPTY);
}

export const sessionActions = {
  // Después de verificar el código o de volver de Google.
  signIn(account: AuthAccount) {
    if (dataService) {
      void enter(account);
      return;
    }
    // Ya existía (lo dice el servidor) o ya se configuró en este navegador.
    const returning = account.existing || known.includes(account.email);
    if (returning && !known.includes(account.email)) setKnown([...known, account.email]);
    // El nombre que entrega Google llena el paso del nombre, sin pisar uno ya elegido.
    if (account.name && !getProfile().name) updateProfile({ name: account.name });
    // Una cuenta nueva ve los recorridos desde el principio.
    if (!returning) tutorials.reset();
    set({
      account,
      consent: returning ? { at: new Date().toISOString(), version: TERMS_VERSION } : null,
      setupDone: returning,
    });
  },

  // El servidor dice otro rol (lo aprobaron con la sesión abierta): la navegación cambia sin salir.
  setRole(role: AccountRole) {
    if (session.account && session.account.role !== role) set({ ...session, account: { ...session.account, role } });
  },

  // Otra vez, cuando no se pudo traer la cuenta.
  retryEnter() {
    if (pending) void enter(pending);
  },

  acceptConsent() {
    const at = new Date().toISOString();
    set({ ...session, consent: { at, version: TERMS_VERSION } });
    dataService?.acceptTerms(TERMS_VERSION, at).catch(() => set({ ...session, consent: null }));
  },

  completeSetup() {
    if (!session.account) return;
    if (dataService) {
      set({ ...session, setupDone: true });
      dataService.finishSetup().catch(() => set({ ...session, setupDone: false }));
      return;
    }
    if (!known.includes(session.account.email)) {
      setKnown([...known, session.account.email]);
      updateProfile({ memberSince: new Date().toISOString() });
    }
    set({ ...session, setupDone: true });
  },

  async signOut() {
    // Los avisos de este navegador eran de esta cuenta.
    await reminder.forgetBrowser();
    await authService.signOut();
    if (dataService) forget();
    else {
      // Las cuentas simuladas comparten este navegador: cada una trae su propia área profesional.
      professional.clear();
      lock.forget(session.account?.email);
      set(EMPTY);
    }
  },

  // Borra la cuenta y todo lo escrito, archivos incluidos. Dice si se pudo: con Supabase hace falta el
  // servidor, y sin él la cuenta sigue intacta.
  async deleteAccount() {
    if (dataService) {
      try {
        await dataService.deleteAccount();
      } catch {
        return false;
      }
      await reminder.forgetBrowser();
      await authService.signOut();
      // Lo que quedaba sin enviar se va con la cuenta.
      forget({ outbox: true });
      return true;
    }
    const email = session.account?.email;
    journal.clear();
    dayReplies.clear();
    favorites.clear();
    noteFavorites.clear();
    care.clear();
    aiChat.clear({ forgetSaved: true });
    professional.clear();
    resetProfile();
    tutorials.reset();
    if (email) setKnown(known.filter((e) => e !== email));
    lock.forget(email);
    await reminder.forgetBrowser();
    await authService.signOut();
    set(EMPTY);
    return true;
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

// Herramientas de prueba (simulaciones, Playground): solo en desarrollo y con los datos simulados.
export const TEST_TOOLS = import.meta.env.DEV && !hasBackend;

// Con Supabase, la sesión abierta en este navegador. También al volver de Google.
if (dataService) {
  authService.onSignedOut(() => {
    if (session.account) forget();
  });
  // Sin conexión, una sesión vencida no se puede renovar: si hay copia, se entra con ella y la sesión se
  // renueva al volver la conexión.
  const withoutSession = async () => {
    const copy = navigator.onLine ? undefined : await offline.readSnapshot();
    if (copy) {
      pending = copy.account;
      await apply(copy.account, copy.userId, copy.data);
      setFromCopy(true);
      return;
    }
    transit = null;
    emit();
  };
  authService.restore().then(
    (account) => (account ? enter(account) : withoutSession()),
    withoutSession
  );
}
