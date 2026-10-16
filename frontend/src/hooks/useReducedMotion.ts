import { useSyncExternalStore } from "react";

// "Reducir movimiento" del sistema, y que se entere si cambia mientras la página está abierta.
const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function snapshot() {
  return typeof window !== "undefined" && !!window.matchMedia && window.matchMedia(QUERY).matches;
}

export function useReducedMotion() {
  return useSyncExternalStore(subscribe, snapshot, () => false);
}
