import { useSyncExternalStore } from "react";

// Si la ventana cumple una media query, y cuando cambia. Para dibujar una sola versión de algo según el
// ancho (por ejemplo, tabla o tarjetas), y que el lector de pantalla no lea dos veces lo mismo.
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches
  );
}

export const DESKTOP = "(min-width: 1024px)";
export const TABLET = "(min-width: 768px)";
