import { useSyncExternalStore } from "react";

// La frase que se está por compartir como imagen (la hoja vive en el layout, una sola para toda la web).
let sharing: string | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function openShare(phraseKey: string) {
  sharing = phraseKey;
  listeners.forEach((l) => l());
}

export function closeShare() {
  sharing = null;
  listeners.forEach((l) => l());
}

export function useSharingKey() {
  return useSyncExternalStore(subscribe, () => sharing);
}
