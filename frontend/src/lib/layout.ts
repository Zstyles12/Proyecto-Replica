import { useEffect, useSyncExternalStore } from "react";

// Pantallas que, en el teléfono y la tablet, ocupan todo sin la barra inferior (la conversación del
// Chat, como en la app). En escritorio la barra lateral sigue a la vista.
let immersive = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function set(value: boolean) {
  if (immersive === value) return;
  immersive = value;
  listeners.forEach((l) => l());
}

export function useImmersive() {
  return useSyncExternalStore(subscribe, () => immersive);
}

// La pantalla que lo pide lo activa mientras está montada.
export function useImmersiveScreen(active: boolean) {
  useEffect(() => {
    set(active);
    return () => set(false);
  }, [active]);
}
