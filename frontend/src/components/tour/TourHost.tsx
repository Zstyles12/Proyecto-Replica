import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { tutorials, useActiveTour } from "../../lib/tutorials";

type Rect = { x: number; y: number; width: number; height: number };
const PAD = 6;
const CARD_GAP = 14;

/**
 * El recorrido (DESIGN.md §6, Recorridos; components/tour/tour-host.tsx de la app): la pantalla se
 * oscurece, el elemento explicado queda recortado con un borde blanco fino, y una tarjeta con una
 * línea de texto, "Saltar todo", "1 de 5" y "Siguiente" aparece debajo o encima, donde quepa.
 * Escape lo cierra.
 */
export const TourHost: React.FC = () => {
  const active = useActiveTour();
  const step = active ? active.steps[active.index] : null;
  const [rect, setRect] = useState<Rect | null>(null);
  const [viewport, setViewport] = useState({ w: window.innerWidth, h: window.innerHeight });
  const nextRef = useRef<HTMLButtonElement>(null);

  // Lleva el elemento a la vista y lo mide; vuelve a medir si cambia el tamaño o el scroll.
  useLayoutEffect(() => {
    if (!step) return;
    step.before?.();
    const el = step.target.current;
    if (!el) {
      tutorials.next();
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
    const measure = () => {
      const r = el.getBoundingClientRect();
      // Si el elemento es más alto que la pantalla, el recorte se limita a lo visible.
      const top = Math.max(r.top, 8);
      const bottom = Math.min(r.bottom, window.innerHeight - 8);
      setRect({ x: r.left - PAD, y: top - PAD, width: r.width + PAD * 2, height: Math.max(bottom - top, 0) + PAD * 2 });
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    };
    measure();
    const t = setTimeout(measure, 380);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [step]);

  useEffect(() => {
    if (!active) return;
    nextRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        tutorials.close();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active]);

  if (!active || !step || !rect) return null;

  const radius = step.radius ?? 16;
  const total = active.steps.length;
  const last = active.index === total - 1;
  const cardWidth = Math.min(340, viewport.w - 32);
  const below = rect.y + rect.height + CARD_GAP + 150 < viewport.h;
  const cardLeft = Math.min(Math.max(16, rect.x + rect.width / 2 - cardWidth / 2), viewport.w - cardWidth - 16);
  const cardStyle: React.CSSProperties = below
    ? { top: rect.y + rect.height + CARD_GAP, left: cardLeft, width: cardWidth }
    : { bottom: viewport.h - rect.y + CARD_GAP, left: cardLeft, width: cardWidth };

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-labelledby="tour-text">
      {/* El recorte: un hueco con borde blanco fino; su sombra enorme oscurece todo lo demás. */}
      <div
        aria-hidden="true"
        className="tour-cut absolute border-[1.5px] border-white shadow-[0_0_0_9999px_rgba(12,24,19,0.58)] dark:shadow-[0_0_0_9999px_rgba(0,0,0,0.72)]"
        style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height, borderRadius: radius }}
      />

      <div
        className="absolute rounded-lg border border-border/40 bg-surface-raised p-4 shadow-raised dark:shadow-none"
        style={cardStyle}
      >
        <p id="tour-text" className="text-[15px] leading-[21px] text-foreground">
          {step.text}
        </p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => tutorials.skipAll()}
            className="min-h-11 rounded-full px-2 text-[13px] font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
          >
            Saltar todo
          </button>
          <span className="text-[13px] text-muted-foreground">
            {active.index + 1} de {total}
          </span>
          <button
            ref={nextRef}
            type="button"
            onClick={() => tutorials.next()}
            className="min-h-11 rounded-full bg-voice px-4 text-[13px] font-semibold text-voice-foreground hover:bg-voice/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised"
          >
            {last ? "Entendido" : "Siguiente"}
          </button>
        </div>
      </div>
    </div>
  );
};
