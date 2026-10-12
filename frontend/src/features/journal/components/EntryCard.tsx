import React, { useLayoutEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { MoodChip } from "./MoodChip";
import { wordCount } from "../store";
import type { Note } from "../types";
import { timeLabel, whenInSentence } from "../../../lib/format";

// Plegada en tres líneas de 26 px (DESIGN.md §6, Tu entrada).
const FOLDED_HEIGHT = 26 * 3;

/**
 * Lo que escribiste (features/journal/components/entry-card.tsx de la app): arriba el contexto (ánimo
 * y tema, y "Escribiste hoy a las 7:16 · 42 palabras"); debajo el texto con el hilo salvia a la
 * izquierda, plegado en tres líneas. La flecha aparece solo si el texto no cabe; plegada, tocar el
 * texto la abre; abierta, el texto se puede seleccionar y se pliega con la flecha.
 */
export const EntryCard: React.FC<{ note: Note; defaultOpen?: boolean }> = ({ note, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  const [fullHeight, setFullHeight] = useState(0);
  const textRef = useRef<HTMLParagraphElement>(null);
  const bodyId = React.useId();
  const words = wordCount(note.text);
  const foldable = fullHeight > FOLDED_HEIGHT + 1;

  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const measure = () => setFullHeight(el.scrollHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [note.text]);

  const toggle = () => setOpen((o) => !o);

  return (
    <div className="flex gap-3.5 rounded-md border border-border/20 bg-surface-sunken p-4">
      <span aria-hidden="true" className="w-[3px] shrink-0 rounded-full bg-voice/70" />
      <div className="min-w-0 flex-1 space-y-2.5">
        <div className="space-y-2">
          {note.mood || note.tags.length ? (
            <div className="flex flex-wrap items-center gap-2">
              {note.mood ? <MoodChip mood={note.mood} /> : null}
              {note.tags.length ? (
                <span className="text-[13px] text-muted-foreground">{note.tags.map((t) => `#${t}`).join("  ")}</span>
              ) : null}
            </div>
          ) : null}
          <div className="flex items-center gap-2">
            <span className="flex-1 text-xs text-muted-foreground">
              Escribiste {whenInSentence(note.createdAt)} a las {timeLabel(note.createdAt)} · {words}{" "}
              {words === 1 ? "palabra" : "palabras"}
            </span>
            {foldable ? (
              <button
                type="button"
                onClick={toggle}
                aria-expanded={open}
                aria-controls={bodyId}
                aria-label={open ? "Plegar la nota" : "Mostrar la nota completa"}
                className="-my-2 -mr-2 flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
              >
                <ChevronDown
                  size={17}
                  aria-hidden="true"
                  className={`transition-transform duration-300 ease-out motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
                />
              </button>
            ) : null}
          </div>
        </div>

        {note.prompt ? <p className="font-replica text-sm italic leading-5 text-reply">{note.prompt}</p> : null}

        <div
          id={bodyId}
          className="overflow-hidden transition-[max-height] duration-300 ease-out motion-reduce:transition-none"
          style={{ maxHeight: foldable && !open ? FOLDED_HEIGHT : fullHeight || undefined }}
          onClick={foldable && !open ? toggle : undefined}
        >
          <p
            ref={textRef}
            className={`whitespace-pre-wrap font-voice text-[17px] leading-[26px] text-foreground ${
              foldable && !open ? "cursor-pointer select-none" : ""
            }`}
          >
            {note.text}
          </p>
        </div>
      </div>
    </div>
  );
};
