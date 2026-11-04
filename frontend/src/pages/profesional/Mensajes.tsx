import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, MessagesSquare } from "lucide-react";
import { CrisisButton } from "../../components/help/CrisisButton";
import { ProfessionalPage } from "../../components/layout/ProfessionalPage";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { Avatar, MessageBubble, SessionCard } from "../../features/care/components/CareParts";
import { ChatInput } from "../../features/care/components/ChatInput";
import {
  activePatients,
  conversationMessages,
  endedPatients,
  hasUnread,
  patientOfConversation,
  practiceEventText,
  professional,
  useProfessional,
} from "../../features/professional/store";
import { DESKTOP, useMediaQuery } from "../../hooks/useMediaQuery";
import { dateLabel, dayLabel, sameDay, shortWhen } from "../../lib/format";
import { useImmersiveScreen } from "../../lib/layout";
import { playSound } from "../../lib/sounds";
import type { Patient, Practice } from "../../services/professional";

function firstName(name: string) {
  return name.split(" ")[0] || name;
}

// Lo último de una conversación, en una línea y dicho para el psicólogo.
function preview(practice: Practice, patient: Patient) {
  const last = conversationMessages(practice, patient.conversationId).at(-1);
  if (!last) return { text: "Todavía no se escriben.", at: patient.since };
  if (last.kind === "event") return { text: practiceEventText(last.event, patient.name, last.text), at: last.createdAt };
  if (last.kind === "session") return { text: "Agendaste una sesión", at: last.createdAt };
  return { text: `${last.from === "psychologist" ? "Tú: " : ""}${last.text}`, at: last.createdAt };
}

function ConversationList({ practice, selected }: { practice: Practice; selected?: string }) {
  const active = activePatients(practice)
    .map((p) => ({ patient: p, ...preview(practice, p) }))
    .sort((a, b) => b.at.localeCompare(a.at));
  const ended = endedPatients(practice);

  const row = (patient: Patient, text: string, at: string, unread: boolean) => (
    <Link
      to={`/profesional/mensajes/${patient.conversationId}`}
      aria-current={selected === patient.conversationId ? "page" : undefined}
      className={`flex items-center gap-3 rounded-md px-3 py-3 transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice ${
        selected === patient.conversationId ? "bg-voice-soft/25" : ""
      }`}
    >
      <Avatar name={patient.name} photo={patient.photo} size={40} />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className={`truncate text-[15px] text-foreground ${unread ? "font-semibold" : ""}`}>{patient.name}</span>
          <span className="shrink-0 text-xs text-muted-foreground">{shortWhen(at)}</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="min-w-0 flex-1 truncate text-[13px] text-muted-foreground">{text}</span>
          {unread ? <span className="shrink-0 text-xs font-semibold text-voice">Nuevo</span> : null}
        </span>
      </span>
    </Link>
  );

  if (!active.length && !ended.length) {
    return (
      <EmptyState icon={MessagesSquare} title="Todavía no tienes conversaciones.">
        Se abren cuando aceptas una solicitud desde tu panel.
      </EmptyState>
    );
  }

  return (
    <nav aria-label="Conversaciones" className="space-y-5">
      {active.length ? (
        <ul className="space-y-1">
          {active.map(({ patient, text, at }) => (
            <li key={patient.id}>{row(patient, text, at, hasUnread(practice, patient))}</li>
          ))}
        </ul>
      ) : (
        <p className="px-3 text-[15px] text-muted-foreground">No tienes conversaciones activas.</p>
      )}
      {ended.length ? (
        <div className="space-y-1">
          <h2 className="px-3 text-[13px] text-muted-foreground">Terminadas</h2>
          <ul className="space-y-1">
            {ended.map((p) => {
              const { text, at } = preview(practice, p);
              return <li key={p.id}>{row(p, text, at, false)}</li>;
            })}
          </ul>
        </div>
      ) : null}
    </nav>
  );
}

function Conversation({ practice, patient, header }: { practice: Practice; patient: Patient; header: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);
  const messages = conversationMessages(practice, patient.conversationId);
  const ended = !!patient.endedAt;
  const name = firstName(patient.name);
  const [initialIds] = useState(() => new Set(messages.map((m) => m.id)));

  useEffect(() => {
    if (!ended) professional.markRead(patient.conversationId);
  }, [patient.conversationId, messages.length, ended]);

  const last = messages.at(-1);
  useEffect(() => {
    if (last?.from === "user" && !initialIds.has(last.id)) playSound("recibido");
  }, [last?.id, last?.from, initialIds]);

  const placed = useRef(false);
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ top: el.scrollHeight, behavior: placed.current && !reduced ? "smooth" : "auto" });
    placed.current = true;
  }, [messages.length]);

  return (
    <section
      aria-label={`Conversación con ${patient.name}`}
      className="flex h-full min-h-0 flex-col bg-background md:overflow-hidden md:rounded-lg md:border md:border-border/40 md:bg-surface-raised md:shadow-raised md:dark:shadow-none"
    >
      <header className={`flex items-center gap-1 border-b border-border/60 px-2 py-2 md:px-3 ${header ? "" : "lg:px-4"}`}>
        {header ? (
          <button
            type="button"
            onClick={() => navigate("/profesional/mensajes")}
            aria-label="Volver a Mensajes"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-foreground hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
          >
            <ChevronLeft size={26} aria-hidden="true" />
          </button>
        ) : null}
        <span className="flex min-w-0 flex-1 items-center gap-3 px-2 py-1">
          <Avatar name={patient.name} photo={patient.photo} size={36} />
          <span className="min-w-0">
            <span className="block truncate text-base font-semibold text-foreground">{patient.name}</span>
            <span className="block text-xs text-muted-foreground">{ended ? "Terminada" : patient.sharing ? "Te comparte su diario" : "Diario privado"}</span>
          </span>
        </span>
        <CrisisButton variant="header" className="md:hidden" />
        <Link
          to={`/profesional/pacientes/${patient.id}`}
          className="inline-flex min-h-11 shrink-0 items-center rounded-full px-3 text-[13px] font-semibold text-voice hover:bg-voice-soft/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
        >
          Ver su ficha
        </Link>
      </header>

      <div ref={scrollRef} className="flex flex-1 flex-col gap-2.5 overflow-y-auto overscroll-contain p-4" aria-live="polite">
        {messages.map((message, i) => {
          const newDay = i === 0 || !sameDay(messages[i - 1].createdAt, message.createdAt);
          const appointment = message.appointmentId ? practice.appointments.find((a) => a.id === message.appointmentId) : undefined;
          return (
            <React.Fragment key={message.id}>
              {newDay ? <p className="pt-3 text-center text-xs text-muted-foreground">{dayLabel(message.createdAt)}</p> : null}
              {message.kind === "session" && appointment ? (
                <SessionCard appointment={appointment} name={name} own ended={ended} />
              ) : (
                <MessageBubble
                  message={message}
                  fresh={!initialIds.has(message.id)}
                  side="psychologist"
                  otherLabel={name}
                  eventText={message.kind === "event" ? practiceEventText(message.event, patient.name, message.text) : undefined}
                />
              )}
            </React.Fragment>
          );
        })}
        {ended && patient.endedAt ? (
          <p className="py-4 text-center text-[13px] text-muted-foreground">Esta conversación terminó el {dateLabel(patient.endedAt)}.</p>
        ) : null}
      </div>

      {ended ? null : (
        <div className="border-t border-border/60 bg-background/95 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:bg-transparent">
          {failed ? (
            <p role="alert" className="px-2 pb-2 text-[13px] text-emotion">
              No pudimos enviar tu mensaje. Revisa tu conexión e inténtalo otra vez.
            </p>
          ) : null}
          <ChatInput
            onSend={async (text) => {
              playSound("enviado");
              const sent = await professional.send(patient.conversationId, text.trim());
              setFailed(!sent);
              return sent;
            }}
          />
        </div>
      )}
    </section>
  );
}

/**
 * Las conversaciones del psicólogo (DESIGN-WEB.md §10). Desde 1024 px, la lista y la elegida lado a
 * lado; por debajo, la lista o la conversación, que en el teléfono ocupa la pantalla.
 */
export const Mensajes: React.FC = () => {
  const { id } = useParams();
  const { practice } = useProfessional();
  const wide = useMediaQuery(DESKTOP);
  const p = practice.value;
  const patient = p && id ? patientOfConversation(p, id) : null;
  useImmersiveScreen(!wide && !!patient);

  useEffect(() => {
    void professional.loadPractice();
  }, []);

  // Por debajo de 1024 px, una conversación es su propia pantalla.
  if (!wide && p && patient) {
    return (
      <div className="h-[100dvh] md:h-screen md:px-6 md:py-6">
        <Conversation practice={p} patient={patient} header />
      </div>
    );
  }

  let body: React.ReactNode;
  if (!p && practice.status === "error") {
    body = (
      <div className="space-y-3">
        <p role="alert" className="text-[15px] text-emotion">
          No pudimos traer tus conversaciones. Revisa tu conexión e inténtalo otra vez.
        </p>
        <Button variant="secondary" onClick={() => void professional.loadPractice()}>
          Intentar de nuevo
        </Button>
      </div>
    );
  } else if (!p) {
    body = <Skeleton rows={4} label="Cargando tus conversaciones…" />;
  } else if (!wide) {
    body = (
      <>
        {id && !patient ? <p className="text-[15px] text-muted-foreground">No encontramos esa conversación.</p> : null}
        <ConversationList practice={p} />
      </>
    );
  } else {
    body = (
      <div className="grid h-[calc(100dvh-10.5rem)] min-h-[28rem] grid-cols-[320px_minmax(0,1fr)] gap-6">
        <div className="min-h-0 overflow-y-auto pr-1">
          <ConversationList practice={p} selected={patient?.conversationId} />
        </div>
        {patient ? (
          <Conversation key={patient.conversationId} practice={p} patient={patient} header={false} />
        ) : (
          <div className="flex items-center justify-center rounded-lg border border-dashed border-border/60">
            <p className="text-[15px] text-muted-foreground">{id ? "No encontramos esa conversación." : "Elige una conversación."}</p>
          </div>
        )}
      </div>
    );
  }

  return <ProfessionalPage title="Mensajes">{body}</ProfessionalPage>;
};

export default Mensajes;
