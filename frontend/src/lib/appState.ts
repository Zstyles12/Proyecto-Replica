import { useSyncExternalStore } from "react";

// Estado pequeño que comparten varias pantallas (lib/app-state.ts de la app).
type State = {
  // Pregunta de una réplica que la persona eligió para escribir sobre ella en Inicio.
  pendingPrompt: string | null;
};

let state: State = { pendingPrompt: null };
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function usePendingPrompt() {
  return useSyncExternalStore(subscribe, () => state.pendingPrompt);
}

export function setPendingPrompt(prompt: string | null) {
  state = { ...state, pendingPrompt: prompt };
  listeners.forEach((l) => l());
}
