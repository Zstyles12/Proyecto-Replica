import React from "react";
import { Link } from "react-router-dom";
import { Check, ChevronRight, Lock, NotebookPen, Undo2, Video } from "lucide-react";
import { Dialog } from "../../../components/ui/Dialog";
import { Button } from "../../../components/ui/Button";
import { care, isSharing, useCare } from "../store";
import { findPsychologist } from "../data";
import type { Appointment, Message } from "../types";
import { MoodDot } from "../../journal/components/MoodChip";
import { useNote } from "../../journal/store";
import { dayLabel, sessionLabel, timeLabel } from "../../../lib/format";

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

/** Las iniciales en Alegreya, sin fotos de stock que finjan ser personas (features/care/components/avatar.tsx). */
export const Avatar: React.FC<{ name: string; size?: number; photo?: string | null }> = ({ name, size = 48, photo }) =>
  photo ? (
    <img src={photo} alt="" aria-hidden="true" className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />
  ) : (
    <span
      aria-hidden="true"
      className="flex shrink-0 items-center justify-center rounded-full bg-voice-soft font-replica font-medium text-voice"
      style={{ width: size, height: size, fontSize: size * 0.38, lineHeight: `${size * 0.46}px` }}
    >
      {initials(name)}
    </span>
  );

/**
 * Tus mensajes van en salvia, tu voz. Los del otro, sobre la superficie. El malva queda solo para la IA.
 * `side` dice desde dónde se lee: la persona o el psicólogo, cada uno con sus mensajes en salvia, y
 * `eventText` el aviso dicho para ese lado (DESIGN-WEB.md §10).
 */
export const MessageBubble: React.FC<{
  message: Message;
  fresh: boolean;
  side?: "user" | "psychologist";
  otherLabel?: string;
  eventText?: string;
}> = ({ message, fresh, side = "user", otherLabel = "Tu psicólogo", eventText }) => {
  const mine = message.from === side;
  if (message.entryId) return <SharedNoteCard message={message} mine={mine} side={side} fresh={fresh} otherLabel={otherLabel} />;
  if (message.kind === "event") {
    return (
      <p className={`py-2 text-center text-[13px] leading-[18px] text-muted-foreground ${fresh ? "enter" : ""}`}>{eventText ?? message.text}</p>
    );
  }
  return (
    <div className={`max-w-[82%] space-y-1 ${mine ? "self-end text-right" : "self-start"} ${fresh ? "enter" : ""}`}>
      <div
        className={`inline-block rounded-md px-4 py-2.5 text-left text-base leading-[22px] ${
          mine ? "rounded-br-[6px] bg-voice text-voice-foreground" : "rounded-bl-[6px] bg-surface text-foreground"
        }`}
      >
        <span className="sr-only">{mine ? "Tú: " : `${otherLabel}: `}</span>
        <span className="whitespace-pre-wrap">{message.text}</span>
      </div>
      <p className="px-1 text-xs text-muted-foreground">{timeLabel(message.createdAt)}</p>
    </div>
  );
};

/**
 * Una nota suelta compartida en el chat (RF-44, DESIGN-WEB.md §11): una tarjeta, no una burbuja. La
 * persona ve el comienzo y abre su nota; el psicólogo la lee completa.
 */
function SharedNoteCard({
  message,
  mine,
  side,
  fresh,
  otherLabel,
}: {
  message: Message;
  mine: boolean;
  side: "user" | "psychologist";
  fresh: boolean;
  otherLabel: string;
}) {
  const own = useNote(side === "user" ? (message.entryId ?? null) : null);
  const info = own ? { createdAt: own.createdAt, mood: own.mood, tag: own.tags[0] ?? null } : message.note;
  const when = info ? dayLabel(info.createdAt) : null;
  return (
    <article
      aria-label={`${mine ? "Compartiste" : `${otherLabel} compartió`} una nota${when ? ` del ${when.toLowerCase()}` : ""}`}
      className={`w-full max-w-[82%] space-y-2 ${mine ? "self-end" : "self-start"} ${fresh ? "enter" : ""}`}
    >
      <div className="space-y-2 rounded-md border border-border/60 bg-surface-raised p-4 text-left">
        <p className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.6px] text-muted-foreground">
          <NotebookPen size={14} className="text-voice" aria-hidden="true" />
          {when ? `Nota ${when === "Hoy" || when === "Ayer" ? `de ${when.toLowerCase()}` : `del ${when.toLowerCase()}`}` : "Nota compartida"}
        </p>
        {info?.mood || info?.tag ? (
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {info.mood ? <MoodDot mood={info.mood} /> : null}
            {info.tag ? <span className="text-xs text-muted-foreground">{info.tag}</span> : null}
          </p>
        ) : null}
        <p className={`whitespace-pre-wrap text-[15px] leading-[21px] text-foreground ${side === "user" ? "line-clamp-6" : ""}`}>{message.text}</p>
        {side === "user" && own ? (
          <Link
            to={`/notas/${own.id}`}
            className="inline-flex min-h-11 items-center gap-0.5 rounded-full text-[15px] font-medium text-voice hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
          >
            Ver la nota
            <ChevronRight size={16} aria-hidden="true" />
          </Link>
        ) : null}
      </div>
      <p className={`px-1 text-xs text-muted-foreground ${mine ? "text-right" : ""}`}>{timeLabel(message.createdAt)}</p>
    </article>
  );
}

/**
 * La sesión vive fuera de Replica: la agenda el psicólogo y Replica solo la muestra y abre Google Meet.
 * `own`: la lee el psicólogo que la agendó. `ended`: la conversación terminó y ya no se une a nada.
 */
export const SessionCard: React.FC<{ appointment: Appointment; name: string; own?: boolean; ended?: boolean }> = ({
  appointment,
  name,
  own = false,
  ended = false,
}) => {
  const cancelled = !!appointment.cancelledAt;
  const upcoming = !cancelled && !ended && appointment.startsAt > new Date().toISOString();
  return (
    <div className="space-y-3 self-stretch rounded-md border border-border/60 bg-surface-raised p-4">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-voice-soft text-voice">
          <Video size={20} />
        </span>
        <div className="flex-1">
          <p className="font-semibold text-foreground">
            {own ? (cancelled ? "Cancelaste la sesión" : "Agendaste una sesión") : cancelled ? `${name} canceló la sesión` : `${name} agendó una sesión`}
          </p>
          <p className={`text-[13px] text-muted-foreground ${cancelled ? "line-through" : ""}`}>
            {sessionLabel(appointment.startsAt)} · {appointment.minutes} min por Meet
          </p>
        </div>
      </div>
      {upcoming ? (
        <a
          href={appointment.meetLink}
          target="_blank"
          rel="noopener noreferrer"
          className="relative tap-area inline-flex h-9 items-center rounded-full bg-voice px-4 text-[13px] font-semibold text-voice-foreground hover:bg-voice/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice focus-visible:ring-offset-2"
        >
          Unirse por Meet
        </a>
      ) : cancelled || ended ? null : (
        <p className="text-[13px] text-muted-foreground">Esta sesión ya pasó.</p>
      )}
    </div>
  );
};

/** La próxima sesión, fija bajo la cabecera: cuándo es y el botón para unirse por Meet. */
export const NextSession: React.FC<{ startsAt: string; meetLink: string }> = ({ startsAt, meetLink }) => (
  <div className="flex items-center gap-3 border-b border-border/60 bg-voice-soft/55 px-4 py-2.5">
    <Video size={18} className="text-voice" aria-hidden="true" />
    <div className="flex-1">
      <p className="text-[13px] font-semibold text-voice">Próxima sesión</p>
      <p className="text-[13px] text-muted-foreground">{sessionLabel(startsAt)} · Meet</p>
    </div>
    <a
      href={meetLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Unirse a la sesión por Google Meet"
      className="relative tap-area inline-flex h-9 items-center rounded-full bg-voice px-4 text-[13px] font-semibold text-voice-foreground hover:bg-voice/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice focus-visible:ring-offset-2"
    >
      Unirse
    </a>
  </div>
);

/** "Escribiendo…": tres puntos que laten despacio, sin rebotes. */
export const TypingIndicator: React.FC<{ name: string }> = ({ name }) => (
  <div className="enter self-start rounded-md rounded-bl-[6px] bg-surface px-4 py-3" role="status">
    <span className="sr-only">{name} está escribiendo…</span>
    <span aria-hidden="true" className="flex items-center gap-1">
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted-foreground" />
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted-foreground [animation-delay:180ms]" />
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted-foreground [animation-delay:360ms]" />
    </span>
  </div>
);

function Point({ icon: Icon, children }: { icon: typeof Check; children: string }) {
  return (
    <li className="flex gap-3">
      <Icon size={20} className="mt-0.5 shrink-0 text-voice" aria-hidden="true" />
      <span className="flex-1 text-base leading-[22px] text-foreground">{children}</span>
    </li>
  );
}

/**
 * Compartir el diario con el psicólogo: consentimiento explícito y revocable (app/compartir-diario.tsx).
 * Antes de activarse, dice qué significa.
 */
export const ShareDiaryDialog: React.FC<{ psychologistId: string | null; onClose: () => void }> = ({ psychologistId, onClose }) => {
  const state = useCare();
  const psychologist = findPsychologist(psychologistId ?? undefined);
  const open = !!psychologist;
  const sharing = psychologist ? isSharing(state, psychologist.id) : false;
  const firstName = psychologist?.name.split(" ")[0] ?? "";

  const change = (active: boolean) => {
    if (!psychologist) return;
    care.setDiaryShare(psychologist.id, active);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="sm"
      title={sharing ? `${firstName} puede leer tu diario` : `Compartir tu diario con ${firstName}`}
      description={sharing ? "Puedes dejar de compartirlo cuando quieras." : "Así puede llegar a cada sesión sabiendo cómo estuvo tu semana."}
      footer={
        <div className="w-full space-y-2">
          {sharing ? (
            <Button size="lg" variant="secondary" className="w-full text-destructive" onClick={() => change(false)}>
              Dejar de compartir
            </Button>
          ) : (
            <Button size="lg" className="w-full" onClick={() => change(true)}>
              Compartir mi diario
            </Button>
          )}
          <Button variant="ghost" className="w-full" onClick={onClose}>
            {sharing ? "Seguir compartiendo" : "Ahora no"}
          </Button>
        </div>
      }
    >
      <ul className="space-y-4">
        <Point icon={Check}>{`${firstName} podrá leer tus notas, salvo las privadas. Las réplicas son solo tuyas.`}</Point>
        <Point icon={Lock}>No podrá editarlas ni verlas nadie más.</Point>
        <Point icon={Undo2}>{`Si dejas de compartir, ${firstName} deja de verlas desde ese momento.`}</Point>
      </ul>
    </Dialog>
  );
};
