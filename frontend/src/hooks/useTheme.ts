import { useSyncExternalStore } from "react";

export type ThemeMode = "light" | "dark" | "system";

// La misma clave la lee el script de index.html, que aplica el tema antes del primer dibujo para que
// no parpadee. Si cambia aquí, cambia allá.
const STORAGE_KEY = "replica-theme";

function readSaved(): ThemeMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark" || saved === "system") return saved;
  } catch {
    // Sin acceso al almacenamiento (ventana privada, por ejemplo): sigue al sistema.
  }
  return "system";
}

function apply(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", mode);
}

// Un solo tema para toda la web: la barra lateral y Usuario → Apariencia leen y cambian el mismo.
let current: ThemeMode = typeof window === "undefined" ? "system" : readSaved();
const listeners = new Set<() => void>();

if (typeof window !== "undefined") apply(current);

export function setTheme(mode: ThemeMode) {
  current = mode;
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Se aplica igual; solo no se recordará.
  }
  apply(mode);
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, () => current, () => "system" as ThemeMode);
  return { theme, setTheme };
}
