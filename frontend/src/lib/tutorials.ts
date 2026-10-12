import { useEffect, useSyncExternalStore, type RefObject } from "react";
import { readJSON, writeJSON } from "./storage";

// Recorridos cortos la primera vez que se entra a cada pantalla: solo lo esencial, con "Saltar todo".
// La misma lógica que la app (lib/tutorials.ts); aquí los pasos señalan elementos del DOM.
const KEY = "replica.tutorials";

export type TutorialId = "inicio" | "primeraReplica" | "racha" | "notas" | "evolucion" | "chat" | "usuario";

export type TourStep = {
  target: RefObject<HTMLElement | null>;
  text: string;
  // Esquinas del recorte que resalta el elemento.
  radius?: number;
  // Antes de medir: abrir lo que haga falta (por ejemplo, una tarjeta de ajustes).
  before?: () => void;
};

type Saved = { seen: TutorialId[]; skipped: boolean };
type Active = { id: TutorialId; steps: TourStep[]; index: number } | null;

let saved: Saved = readJSON<Saved>(KEY, () => ({ seen: [], skipped: false }));
let active: Active = null;
const listeners = new Set<() => void>();

function persist() {
  writeJSON(KEY, saved);
}

function emit() {
  listeners.forEach((l) => l());
}

export function shouldShowTutorial(id: TutorialId) {
  return !saved.skipped && !saved.seen.includes(id) && !active;
}

export const tutorials = {
  // Empieza el recorrido de una pantalla si todavía no se vio (y no se saltaron todos).
  start(id: TutorialId, steps: TourStep[]) {
    const visible = steps.filter((s) => s.target.current);
    if (!shouldShowTutorial(id) || !visible.length) return;
    active = { id, steps: visible, index: 0 };
    emit();
  },

  next() {
    if (!active) return;
    if (active.index < active.steps.length - 1) {
      active = { ...active, index: active.index + 1 };
    } else {
      saved = { ...saved, seen: [...saved.seen, active.id] };
      persist();
      active = null;
    }
    emit();
  },

  // Cierra el recorrido en curso como visto (Escape).
  close() {
    if (!active) return;
    saved = { ...saved, seen: [...saved.seen, active.id] };
    persist();
    active = null;
    emit();
  },

  // Cierra el recorrido sin darlo por visto: vuelve a salir la próxima vez que se entre a la pantalla.
  cancel(ids: TutorialId[]) {
    if (!active || !ids.includes(active.id)) return;
    active = null;
    emit();
  },

  // "Saltar todo": no vuelve a aparecer ningún recorrido.
  skipAll() {
    saved = { ...saved, skipped: true };
    persist();
    active = null;
    emit();
  },

  // "Ver los tutoriales otra vez" (y al empezar con una cuenta nueva).
  reset() {
    saved = { seen: [], skipped: false };
    persist();
    active = null;
    emit();
  },
};

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useActiveTour() {
  return useSyncExternalStore(subscribe, () => active);
}

// Si la pantalla se va con su recorrido abierto, el recorrido se cierra sin darlo por visto.
export function useCancelToursOnLeave(ids: TutorialId[]) {
  const key = ids.join(",");
  useEffect(() => () => tutorials.cancel(key.split(",") as TutorialId[]), [key]);
}
