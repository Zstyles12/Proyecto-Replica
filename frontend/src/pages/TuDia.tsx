import React, { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { MoonStar } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { ReplyCard } from "../features/journal/components/ReplyCard";
import { NoteCard } from "../features/notes/components/NoteCard";
import { dayReplies, useDayReply, useLateReply } from "../features/journal/dayReplies";
import { dayKey, noteDay, replyModeOf, useNotes } from "../features/journal/store";
import { useProfile } from "../features/profile/store";
import { dateFromDayKey, dayLabel } from "../lib/format";

// Tu día (app/replica-dia/[day].tsx): la réplica del día una sola vez, la última réplica (la de
// medianoche) si la hubo y, debajo, las notas de ese día.
export const TuDia: React.FC = () => {
  const { dia = "" } = useParams();
  const { dayReplyHour } = useProfile();
  const dayReply = useDayReply(dia);
  const lateReply = useLateReply(dia);
  const notes = useNotes();

  const today = dayKey(new Date());
  const due = Boolean(dia) && (dia !== today || new Date().getHours() >= dayReplyHour);

  useEffect(() => {
    if (!dayReply && due) dayReplies.catchUp(notes);
  }, [dayReply, due, notes]);

  const notesOfDay = useMemo(
    () =>
      dayReply
        ? notes
            .filter((n) => dayReply.noteIds.includes(n.id) || !!lateReply?.noteIds.includes(n.id))
            .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        : [],
    [dayReply, lateReply, notes]
  );

  const allDayNotes = useMemo(
    () =>
      dia
        ? notes
            .filter((n) => noteDay(n) === dia)
            .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        : [],
    [notes, dia]
  );

  const pendingMessage = useMemo(() => {
    if (!dia) return "";
    const nonPrivateNotes = allDayNotes.filter((n) => replyModeOf(n) !== "private");
    if (allDayNotes.length === 0) {
      return "No hay notas escritas en este día.";
    }
    if (nonPrivateNotes.length === 0) {
      return "Las notas de este día son privadas. Solo tú las lees.";
    }
    if (dia === today) {
      if (nonPrivateNotes.length >= 2) {
        return due
          ? "Replica está leyendo tu día…"
          : `Tu réplica del día llega a las ${dayReplyHour}:00.`;
      }
      return `Si escribes más hoy, Replica lo leerá todo a las ${dayReplyHour}:00.`;
    }
    if (nonPrivateNotes.length === 1) {
      return "Ese día escribiste una sola nota y recibió su réplica al momento.";
    }
    return "Replica está leyendo tu día…";
  }, [dia, allDayNotes, today, due, dayReplyHour]);

  const valid = /^\d{4}-\d{1,2}-\d{1,2}$/.test(dia);
  const title = valid ? `Tu día · ${dayLabel(dateFromDayKey(dia).toISOString())}` : "Tu día";

  return (
    <div className="mx-auto max-w-[680px] space-y-4 lg:mx-0">
      <PageHeader title={title} fallback="/notas" />
      {!dia ? (
        <p className="text-[15px] leading-[21px] text-muted-foreground">Día no encontrado.</p>
      ) : dayReply ? (
        <div className="space-y-8">
          <ReplyCard
            note={{ id: `dia-${dia}`, ...dayReply }}
            kind="day"
            live={false}
            onRetry={() => dayReplies.retry(notes, dia)}
          />
          {lateReply ? (
            <ReplyCard
              note={{ id: `dia-${dia}-ultima`, ...lateReply }}
              kind="late"
              live={false}
              onRetry={() => dayReplies.retry(notes, dia, "late")}
            />
          ) : null}
          {notesOfDay.length ? (
            <section className="space-y-3">
              <h2 className="font-replica text-xl font-medium leading-[26px] text-foreground">Notas de tu día</h2>
              {notesOfDay.map((n) => (
                <NoteCard key={n.id} note={n} />
              ))}
            </section>
          ) : null}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center gap-2.5 rounded-lg border border-border/70 bg-surface-raised p-4">
            <MoonStar size={16} className="shrink-0 text-reply" aria-hidden="true" />
            <p className="text-[14px] leading-[20px] text-muted-foreground" aria-live="polite">
              {pendingMessage}
            </p>
          </div>
          {lateReply ? (
            <ReplyCard
              note={{ id: `dia-${dia}-ultima`, ...lateReply }}
              kind="late"
              live={false}
              onRetry={() => dayReplies.retry(notes, dia, "late")}
            />
          ) : null}
          {allDayNotes.length ? (
            <section className="space-y-3">
              <h2 className="font-replica text-xl font-medium leading-[26px] text-foreground">Notas de tu día</h2>
              {allDayNotes.map((n) => (
                <NoteCard key={n.id} note={n} />
              ))}
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default TuDia;
