import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, PenLine, Sprout } from "lucide-react";
import { AiAura, Enter, WordReveal } from "../../../components/motion/Motion";
import { Button } from "../../../components/ui/Button";
import { HelpLink } from "../../../components/help/HelpLink";
import { journal } from "../store";
import type { Note } from "../types";
import { setPendingPrompt } from "../../../lib/appState";

// El análisis cita a la persona entre comillas: esas son sus palabras, así que van en su color (salvia)
// y en itálica, como una cita en un libro.
function QuotedBody({ text }: { text: string }) {
  const parts = text.split(/(“[^”]+”)/g).filter(Boolean);
  return (
    <p className="text-[17px] leading-[27px] text-foreground">
      {parts.map((part, i) =>
        part.startsWith("“") ? (
          <span key={i} className="font-replica text-[18px] italic text-voice">
            {part}
          </span>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </p>
  );
}

// Preguntas para seguir escribiendo: opcionales y plegadas, para que la réplica no se sienta como una
// tarea. Cada una lleva a escribir sobre ella en Inicio.
function FollowUps({ questions, live }: { questions: string[]; live: boolean }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const panelId = React.useId();

  return (
    <Enter disabled={!live} delay={live ? 160 : 0}>
      <div className="overflow-hidden rounded-md bg-surface">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full items-center gap-2.5 px-4 py-3.5 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-voice"
        >
          <PenLine size={16} className="text-voice" aria-hidden="true" />
          <span className="flex-1 text-[15px] font-medium text-foreground">Para seguir escribiendo</span>
          <span className="text-[13px] text-muted-foreground">{questions.length}</span>
          <ChevronDown
            size={17}
            aria-hidden="true"
            className={`text-muted-foreground transition-transform duration-small ease-out motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
          />
        </button>
        {open ? (
          <ul id={panelId} className="enter">
            {questions.map((q) => (
              <li key={q} className="border-t border-border/60">
                <button
                  type="button"
                  onClick={() => {
                    setPendingPrompt(q);
                    navigate("/");
                  }}
                  aria-label={`Escribir sobre esto: ${q}`}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-voice"
                >
                  <span className="flex-1 font-replica text-base italic leading-[22px] text-foreground">{q}</span>
                  <ChevronRight size={16} className="text-subtle" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Enter>
  );
}

interface ReplyCardProps {
  // La réplica de una nota o la del día: las dos tienen la misma forma.
  note: Pick<Note, "id" | "reply" | "replyDraft" | "replyStatus">;
  // true: la réplica está llegando en vivo (o acaba de llegar) y sus partes hacen su entrada.
  live: boolean;
  // La réplica del día (o la última, a medianoche): otro subtítulo y otra forma de reintentar.
  kind?: "note" | "day" | "late";
  onRetry?: () => void;
}

/**
 * La réplica: quién habla, una frase que resume, el análisis que cita tu nota y preguntas para seguir
 * (features/journal/components/reply-card.tsx de la app).
 */
export const ReplyCard: React.FC<ReplyCardProps> = ({ note, live, kind = "note", onRetry }) => {
  const streaming = note.replyStatus === "streaming";
  const headline = note.reply?.headline ?? note.replyDraft?.headline ?? "";
  const body = note.reply?.body ?? note.replyDraft?.body ?? "";

  if (note.replyStatus === "none" || note.replyStatus === "error") {
    return (
      <div className="space-y-3 rounded-lg border border-border/40 bg-surface-raised p-5 shadow-raised dark:shadow-none">
        <p className="text-[15px] leading-[21px] text-muted-foreground">
          {note.replyStatus === "error" ? "No pudimos traer la réplica. Tu nota está guardada." : "Esta nota todavía no tiene réplica."}
        </p>
        <Button size="sm" onClick={onRetry ?? (() => journal.requestReply(note.id))}>
          {note.replyStatus === "error" ? "Intentar de nuevo" : "Pedir réplica"}
        </Button>
      </div>
    );
  }

  const status =
    kind === "late"
      ? streaming
        ? "Leyendo lo que escribiste de noche…"
        : "Tu última réplica"
      : kind === "day"
        ? streaming
          ? "Leyendo todo tu día…"
          : "Tu réplica del día"
        : streaming
          ? "Leyendo tu nota…"
          : "Tu compañera silenciosa";

  return (
    <article className="space-y-4 rounded-lg border border-border/40 bg-surface-raised p-5 shadow-raised dark:shadow-none">
      <div className="flex items-center gap-3">
        <AiAura size={48} active={streaming}>
          <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-voice text-voice-foreground">
            <Sprout size={19} />
          </span>
        </AiAura>
        <div className="flex-1">
          <p className="font-replica text-lg font-medium leading-[22px] text-voice">Replica</p>
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {status}
          </p>
        </div>
      </div>

      {headline ? (
        <WordReveal
          as="h2"
          text={headline}
          mode={live ? "stagger" : "none"}
          className="font-replica text-[29px] font-normal leading-[36px] tracking-[-0.3px] text-foreground"
        />
      ) : null}

      {body ? (
        streaming ? (
          <WordReveal text={body} mode="stream" className="text-[17px] leading-[27px] text-foreground" />
        ) : (
          <QuotedBody text={body} />
        )
      ) : null}

      {note.reply?.risk && !streaming ? <HelpLink /> : null}

      {headline ? <span aria-hidden="true" className="block h-1 w-12 rounded-full bg-voice-soft" /> : null}

      {note.reply?.questions.length ? <FollowUps questions={note.reply.questions} live={live} /> : null}
    </article>
  );
};
