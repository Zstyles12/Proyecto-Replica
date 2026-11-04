import { useEffect } from "react";
import { lock, useLockConfig } from "../../lib/lock";

const EVENTS = ["pointerdown", "keydown", "wheel", "touchstart", "scroll"] as const;

/**
 * Bloquea tras el tiempo elegido sin tocar, escribir ni desplazarse, y al volver a la pestaña si ya pasó
 * ese tiempo (DESIGN-WEB.md §11). Sin bloqueo en este navegador, no hace nada.
 */
export function useInactivityLock(email: string | null | undefined) {
  const config = useLockConfig(email);
  const minutes = config?.minutes ?? null;

  useEffect(() => {
    if (!minutes) return;
    const limit = minutes * 60_000;
    let last = Date.now();
    const touch = () => {
      last = Date.now();
    };
    const check = () => {
      if (Date.now() - last >= limit) lock.lockNow();
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") check();
    };
    EVENTS.forEach((e) => window.addEventListener(e, touch, { passive: true, capture: true }));
    document.addEventListener("visibilitychange", onVisibility);
    const timer = setInterval(check, 10_000);
    return () => {
      EVENTS.forEach((e) => window.removeEventListener(e, touch, { capture: true }));
      document.removeEventListener("visibilitychange", onVisibility);
      clearInterval(timer);
    };
  }, [minutes]);
}
