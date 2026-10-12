import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Lock, MoonStar } from "lucide-react";
import { AnimatedHeart } from "../../../components/motion/AnimatedHeart";
import { MoodChip } from "../../journal/components/MoodChip";
import { isToday, noteRest, noteTitle, replyModeOf } from "../../journal/store";
import type { DayReply, Note } from "../../journal/types";
import { noteFavorites, useIsFavoriteNote } from "../favorites";
import { shortWhen, timeLabel } from "../../../lib/format";
import { playSound } from "../../../lib/sounds";

/** El corazón de una nota favorita (en la lista y en el detalle). Es distinto de las frases del cofre. */
export const FavoriteNoteButton: React.FC<{ noteId: string; size?: "sm" | "md" }> = ({ noteId, size = "md" }) => {
  const favorite = useIsFavoriteNote(noteId);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        playSound(favorite ? "favoritoQuitar" : "favorito");
        noteFavorites.toggle(noteId);
      }}
      aria-label={favorite ? "Quitar de favoritas" : "Marcar como favorita"}
      aria-pressed={favorite}
      className={`relative z-10 flex shrink-0 items-center justify-center rounded-full transition-all duration-small active:scale-[0.92] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice ${
        size === "sm" ? "-my-2 h-11 w-11" : "h-11 w-11 bg-surface hover:bg-surface-sunken"
      }`}
    >
      <AnimatedHeart active={favorite} size={size === "sm" ? 16 : 19} color="var(--emotion)" outlineColor="var(--voice)" />
    </button>
  );
};

/**
 * Una nota como tarjeta (features/notes/components/note-card.tsx de la app): una línea con ánimo y tema a
 * la izquierda, hora, candado y corazón a la derecha; el título (su primera frase), el extracto y, si la
 * hay, su réplica en un recuadro malva con un hilo y sin rótulo.
 */
export const NoteCard: React.FC<{ note: Note; showDay?: boolean }> = ({ note, showDay = false }) => {
  const title = noteTitle(note.text);
  const rest = noteRest(note.text);
  const when = showDay
    ? `${isToday(note.createdAt) ? "Hoy" : shortWhen(note.createdAt)} · ${timeLabel(note.createdAt)}`
    : timeLabel(note.createdAt);

  return (
    <article className="relative space-y-2.5 rounded-lg border border-border/40 bg-surface-raised p-4 shadow-raised transition-colors hover:border-border/80 dark:shadow-none">
      <div className="flex items-center gap-2">
        {note.mood ? <MoodChip mood={note.mood} /> : null}
        <span className="min-w-0 flex-1 truncate text-[13px] text-muted-foreground">{note.tags.map((t) => `#${t}`).join("  ")}</span>
        <span className="text-[13px] text-muted-foreground">{when}</span>
        {replyModeOf(note) === "private" ? (
          <Lock size={13} className="text-muted-foreground" aria-label="Nota privada" role="img" />
        ) : null}
        <FavoriteNoteButton noteId={note.id} size="sm" />
      </div>

      <h3 className="line-clamp-2 font-replica text-lg font-medium leading-[23px] text-foreground">
        {/* Toda la tarjeta abre la nota; el corazón queda por encima. */}
        <Link
          to={`/notas/${note.id}`}
          className="after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-voice"
        >
          {title}
        </Link>
      </h3>
      {rest ? <p className="line-clamp-2 text-[15px] leading-[21px] text-muted-foreground">{rest}</p> : null}

      {note.reply ? (
        <div className="mt-1 flex gap-3 rounded-md bg-reply-soft/50 px-3.5 py-3">
          <span aria-hidden="true" className="w-[2px] shrink-0 rounded-full bg-reply/60" />
          <p className="line-clamp-2 flex-1 font-replica text-[15px] italic leading-[21px] text-reply">
            <span className="sr-only">Réplica: </span>
            {note.reply.headline}
          </p>
        </div>
      ) : note.replyStatus === "streaming" ? (
        <p className="text-xs text-reply">Replica está leyendo tu nota…</p>
      ) : null}
    </article>
  );
};

/**
 * La réplica del día en la lista de Notas: una entrada propia, arriba de las notas de ese día, que abre
 * "Tu día" (features/notes/components/day-reply-entry.tsx de la app).
 */
export const DayReplyEntry: React.FC<{ night: DayReply; late: DayReply | null }> = ({ night, late }) => {
  const streaming = night.replyStatus === "streaming";
  const headline = night.reply?.headline ?? night.replyDraft?.headline;
  const count = night.noteIds.length + (late?.noteIds.length ?? 0);
  return (
    <Link
      to={`/replica-dia/${night.day}`}
      className="block space-y-2 rounded-lg border border-reply/20 bg-reply-soft/60 p-4 transition-colors hover:border-reply/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
    >
      <span className="flex items-center gap-1.5 text-reply">
        <MoonStar size={14} aria-hidden="true" />
        <span className="flex-1 text-[11px] font-semibold uppercase tracking-[0.6px]">Réplica de tu día</span>
        <ChevronRight size={17} aria-hidden="true" />
      </span>
      <span className="line-clamp-2 block font-replica text-[17px] italic leading-6 text-foreground">
        {streaming && !headline
          ? "Replica está leyendo tu día…"
          : night.replyStatus === "error"
            ? "No pudimos traer la réplica de tu día."
            : headline}
      </span>
      <span className="block text-xs text-muted-foreground">
        {`Leyó tus ${count} notas`}
        {late?.replyStatus === "done" ? " · y una última réplica a medianoche" : ""}
      </span>
    </Link>
  );
};
