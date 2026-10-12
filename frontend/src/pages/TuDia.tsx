import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { ReplyCard } from "../features/journal/components/ReplyCard";
import { NoteCard } from "../features/notes/components/NoteCard";
import { dayReplies, useDayReply, useLateReply } from "../features/journal/dayReplies";
import { useNotes } from "../features/journal/store";
import { dateFromDayKey, dayLabel } from "../lib/format";

// Tu día (app/replica-dia/[day].tsx): la réplica del día una sola vez, la última réplica (la de
// medianoche) si la hubo y, debajo, las notas de ese día.
export const TuDia: React.FC = () => {
  const { dia = "" } = useParams();
  const dayReply = useDayReply(dia);
  const lateReply = useLateReply(dia);
  const notes = useNotes();

  const read = useMemo(
    () =>
      dayReply
        ? notes
            .filter((n) => dayReply.noteIds.includes(n.id) || !!lateReply?.noteIds.includes(n.id))
            .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        : [],
    [dayReply, lateReply, notes]
  );

  const valid = /^\d{4}-\d{1,2}-\d{1,2}$/.test(dia);
  const title = valid ? `Tu día · ${dayLabel(dateFromDayKey(dia).toISOString())}` : "Tu día";

  return (
    <div className="mx-auto max-w-[680px] space-y-4">
      <PageHeader title={title} fallback="/notas" />
      {dayReply ? (
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
          {read.length ? (
            <section className="space-y-3">
              <h2 className="font-replica text-xl font-medium leading-[26px] text-foreground">Notas de tu día</h2>
              {read.map((n) => (
                <NoteCard key={n.id} note={n} />
              ))}
            </section>
          ) : null}
        </div>
      ) : (
        <p className="text-[15px] leading-[21px] text-muted-foreground">Este día todavía no tiene réplica.</p>
      )}
    </div>
  );
};

export default TuDia;
