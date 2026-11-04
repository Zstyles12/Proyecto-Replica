import { useSyncExternalStore } from "react";
import type { Note } from "../../features/journal/types";
import type { AuthAccount } from "../../services/auth";
import type { AccountData } from "../../services/data";
import { readJSON } from "../storage";
import { idbDelete, idbGet, idbSet, STORES } from "./db";

// La copia de la cuenta y la bandeja, en IndexedDB (lib/offline/db.ts). Solo con Supabase: sin él, todo
// ya vive en el navegador.

export type Snapshot = { userId: string; account: AuthAccount; data: AccountData; savedAt: string };

// Qué cuenta abrió la web por última vez en este navegador, para entrar con su copia sin conexión.
const LAST = "ultima";
// Donde estaba la bandeja antes de IndexedDB (Fase 14).
const LEGACY_OUTBOX = "replica.outbox.";

export const offline = {
  async saveSnapshot(account: AuthAccount, userId: string, data: AccountData) {
    await idbSet(STORES.snapshot, userId, { userId, account, data, savedAt: new Date().toISOString() } satisfies Snapshot);
    await idbSet(STORES.snapshot, LAST, userId);
  },

  // Lo que se escribe después de entrar también queda en la copia.
  async saveNotes(userId: string, notes: Note[]) {
    const snapshot = await idbGet<Snapshot>(STORES.snapshot, userId);
    // El borrador de una réplica en curso no se guarda.
    if (snapshot) await idbSet(STORES.snapshot, userId, { ...snapshot, data: { ...snapshot.data, notes: notes.map(({ replyDraft: _d, ...n }) => n) } });
  },

  async readSnapshot(userId?: string) {
    const id = userId ?? (await idbGet<string>(STORES.snapshot, LAST));
    return id ? idbGet<Snapshot>(STORES.snapshot, id) : undefined;
  },

  async readOutbox(userId: string): Promise<Note[]> {
    const saved = (await idbGet<Note[]>(STORES.outbox, userId)) ?? [];
    const legacy = readJSON<Note[]>(`${LEGACY_OUTBOX}${userId}`, () => []);
    if (!legacy.length) return saved;
    const merged = [...saved, ...legacy.filter((n) => !saved.some((s) => s.id === n.id))];
    await idbSet(STORES.outbox, userId, merged);
    try {
      localStorage.removeItem(`${LEGACY_OUTBOX}${userId}`);
    } catch {
      // Se vuelve a intentar la próxima vez.
    }
    return merged;
  },

  writeOutbox(userId: string, list: Note[]) {
    return idbSet(STORES.outbox, userId, list);
  },

  // Al cerrar sesión: la copia se va. Al eliminar la cuenta, también la bandeja.
  async forget(userId: string, { outbox = false } = {}) {
    await idbDelete(STORES.snapshot, userId);
    if ((await idbGet<string>(STORES.snapshot, LAST)) === userId) await idbDelete(STORES.snapshot, LAST);
    if (outbox) await idbDelete(STORES.outbox, userId);
  },
};

// La conexión del navegador y si lo que se ve es la copia guardada.
let online = typeof navigator === "undefined" ? true : navigator.onLine;
let fromCopy = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    online = true;
    emit();
  });
  window.addEventListener("offline", () => {
    online = false;
    emit();
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setFromCopy(value: boolean) {
  fromCopy = value;
  emit();
}

export function isFromCopy() {
  return fromCopy;
}

export function useOnline() {
  return useSyncExternalStore(subscribe, () => online);
}

export function useFromCopy() {
  return useSyncExternalStore(subscribe, () => fromCopy);
}
