import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, MoonStar } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { dayReplies, useDayReply, useLateReply } from "../dayReplies";
import { dayKey, noteDay, useNotes } from "../store";
import type { Note } from "../types";
import { useProfile } from "../../profile/store";

/**
 * En el detalle de una nota que se lee en la réplica del día: lo que esa réplica le dijo a esta nota
 * en particular (un comentario propio, no la réplica entera repetida) y el camino a la réplica
 * completa. Antes de que llegue, cuándo llega (features/journal/components/day-reply-note.tsx).
 */
export const DayReplyNote: React.FC<{ note: Note }> = ({ note }) => {
  const notes = useNotes();
  const { dayReplyHour } = useProfile();
  const day = noteDay(note);
  const dayReply = useDayReply(day);
  const lateReply = useLateReply(day);
  const today = dayKey(new Date());
  const afterNight = dayReply?.replyStatus === "done" && !dayReply.noteIds.includes(note.id);
  // La de la noche llega a la hora elegida; la última, a medianoche (cuando el día ya terminó).
  const due = afterNight ? day !== today : day !== today || new Date().getHours() >= dayReplyHour;
  const reply = afterNight ? lateReply : dayReply;
  const status = reply?.replyStatus;

  // Si ya debería estar y no está (no se abrió la web a esa hora), se pide aquí mismo.
  useEffect(() => {
    if (!reply && due) dayReplies.catchUp(notes);
  }, [reply, due, notes]);

  if (reply && status === "done") {
    const comment = reply.reply?.comments?.find((c) => c.noteId === note.id)?.text;
    return (
      <div className="space-y-3 rounded-lg border border-reply/20 bg-reply-soft/60 p-5">
        <div className="flex items-center gap-1.5 text-reply">
          <MoonStar size={14} aria-hidden="true" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.6px]">
            {afterNight ? "En tu última réplica" : "En la réplica de tu día"}
          </span>
        </div>
        <p className="font-replica text-[17px] italic leading-[25px] text-foreground">
          {comment ?? "Replica leyó esta nota junto con el resto de tu día."}
        </p>
        <Link
          to={`/replica-dia/${day}`}
          className="inline-flex min-h-11 items-center gap-0.5 rounded-full text-[15px] font-medium text-reply hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
        >
          {afterNight ? "Leer tu última réplica" : "Leer la réplica de tu día"}
          <ChevronRight size={17} aria-hidden="true" />
        </Link>
      </div>
    );
  }

  const message =
    status === "error"
      ? afterNight
        ? "No pudimos traer tu última réplica."
        : "No pudimos traer la réplica de tu día."
      : status === "streaming" || due
        ? afterNight
          ? "Replica está leyendo lo que escribiste de noche…"
          : "Replica está leyendo tu día…"
        : afterNight
          ? "La escribiste después de tu réplica de la noche. Replica la lee a medianoche, en una última réplica."
          : `Replica la lee esta noche a las ${dayReplyHour}:00, junto con el resto de tu día.`;

  return (
    <div className="flex items-center gap-2 px-2">
      <MoonStar size={14} className="shrink-0 text-muted-foreground" aria-hidden="true" />
      <p className="flex-1 text-[13px] leading-[18px] text-muted-foreground" aria-live="polite">
        {message}
      </p>
      {status === "error" ? (
        <Button size="sm" variant="ghost" onClick={() => dayReplies.retry(notes, day, afterNight ? "late" : "day")}>
          Intentar de nuevo
        </Button>
      ) : null}
    </div>
  );
};
