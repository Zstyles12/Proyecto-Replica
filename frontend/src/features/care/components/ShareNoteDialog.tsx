import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, Search } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Dialog } from "../../../components/ui/Dialog";
import { dateLabel, dayLabel } from "../../../lib/format";
import { MoodDot } from "../../journal/components/MoodChip";
import { noteTitle, replyModeOf, useNotes } from "../../journal/store";
import type { Note } from "../../journal/types";
import { sharedNotes, useCare } from "../store";

// Las últimas a la vista; con más, la búsqueda.
const SHOWN = 30;

/**
 * Compartir una nota suelta con el psicólogo (RF-44, DESIGN-WEB.md §11). Primero se elige y después se
 * confirma viendo la nota completa. Las privadas no aparecen.
 */
export const ShareNoteDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  name: string;
  onShare: (note: Note) => Promise<boolean>;
}> = ({ open, onClose, name, onShare }) => {
  const notes = useNotes();
  const state = useCare();
  const shared = useMemo(() => sharedNotes(state), [state]);
  const [query, setQuery] = useState("");
  const [chosen, setChosen] = useState<Note | null>(null);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Al elegir una, el foco pasa a su vista previa.
  useEffect(() => {
    if (chosen) previewRef.current?.focus();
  }, [chosen]);

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setQuery("");
      setChosen(null);
      setFailed(false);
    }
  }

  const candidates = useMemo(() => notes.filter((n) => replyModeOf(n) !== "private"), [notes]);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? candidates.filter((n) => n.text.toLowerCase().includes(q) || n.tags.some((t) => t.toLowerCase().includes(q))) : candidates;
    return list.slice(0, SHOWN);
  }, [candidates, query]);

  const share = async () => {
    if (!chosen) return;
    setSending(true);
    const ok = await onShare(chosen);
    setSending(false);
    if (ok) onClose();
    else setFailed(true);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Compartir una nota con ${name}`}
      description={`${name} la verá en el chat: el texto, el ánimo y el tema. Su réplica sigue siendo solo tuya.`}
      footer={
        chosen ? (
          <>
            <Button variant="ghost" onClick={() => setChosen(null)}>
              Elegir otra
            </Button>
            <Button onClick={() => void share()} disabled={sending}>
              {sending ? "Compartiendo…" : "Compartir"}
            </Button>
          </>
        ) : null
      }
    >
      {chosen ? (
        <div ref={previewRef} tabIndex={-1} aria-label="La nota que vas a compartir" className="space-y-3 focus:outline-none">
          <p className="text-[12px] font-semibold uppercase tracking-[0.6px] text-muted-foreground">{dayLabel(chosen.createdAt)}</p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {chosen.mood ? <MoodDot mood={chosen.mood} /> : null}
            {chosen.tags[0] ? <span className="text-xs text-muted-foreground">{chosen.tags[0]}</span> : null}
          </p>
          <p className="whitespace-pre-wrap rounded-md bg-surface px-4 py-3 text-[15px] leading-[21px] text-foreground">{chosen.text}</p>
          {failed ? (
            <p role="alert" className="text-[13px] text-emotion">
              No pudimos compartir tu nota. Revisa tu conexión e inténtalo otra vez.
            </p>
          ) : null}
        </div>
      ) : candidates.length === 0 ? (
        <p className="rounded-md bg-surface-sunken p-4 text-[15px] leading-[21px] text-muted-foreground">
          Todavía no tienes notas para compartir. Las privadas no se comparten.
        </p>
      ) : (
        <div className="space-y-3">
          {candidates.length > SHOWN ? (
            <div className="flex h-11 items-center rounded-full border border-border/40 bg-surface-raised pl-4 pr-1 focus-within:ring-2 focus-within:ring-voice/40">
              <Search size={16} className="shrink-0 text-muted-foreground" aria-hidden="true" />
              <label htmlFor="share-note-search" className="sr-only">
                Buscar una nota
              </label>
              <input
                id="share-note-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar una nota"
                className="h-full min-w-0 flex-1 bg-transparent px-3 text-base text-foreground placeholder:text-subtle focus:outline-none"
              />
            </div>
          ) : null}
          <ul className="space-y-1" aria-label="Tus notas">
            {visible.map((note) => {
              const at = shared.get(note.id);
              return (
                <li key={note.id}>
                  <button
                    type="button"
                    onClick={() => setChosen(note)}
                    className="flex min-h-11 w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
                  >
                    <span className="min-w-0 flex-1 space-y-0.5">
                      <span className="block truncate text-[15px] font-semibold text-foreground">{noteTitle(note.text)}</span>
                      <span className="flex flex-wrap items-center gap-x-3 text-[13px] text-muted-foreground">
                        {dayLabel(note.createdAt)}
                        {note.mood ? <MoodDot mood={note.mood} /> : null}
                      </span>
                      {at ? <span className="block text-[13px] text-voice">Ya la compartiste el {dateLabel(at)}</span> : null}
                    </span>
                    <ChevronRight size={16} className="shrink-0 text-subtle" aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>
          {visible.length === 0 ? <p className="px-3 text-[15px] text-muted-foreground">Nada coincide.</p> : null}
        </div>
      )}
    </Dialog>
  );
};
