import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { BadgeCheck, ChevronLeft, ChevronRight, MessageCircle, NotebookPen, NotebookText, Sprout } from "lucide-react";
import { Avatar, MessageBubble, NextSession, SessionCard, ShareDiaryDialog, TypingIndicator } from "../features/care/components/CareParts";
import { ChatInput } from "../features/care/components/ChatInput";
import { ShareNoteDialog } from "../features/care/components/ShareNoteDialog";
import { CrisisButton } from "../components/help/CrisisButton";
import { Button } from "../components/ui/Button";
import { ConfirmDialog } from "../components/ui/Dialog";
import { activeConversation, care, isSharing, latestOutcome, pendingRequest, upcomingAppointments, useCare } from "../features/care/store";
import { findPsychologist } from "../features/care/data";
import { dateLabel, dayLabel, sameDay } from "../lib/format";
import { useImmersiveScreen } from "../lib/layout";
import { TEST_TOOLS } from "../lib/session";
import { playSound } from "../lib/sounds";
import { tutorials, useCancelToursOnLeave } from "../lib/tutorials";

const PRIMARY_LINK =
  "inline-flex h-11 items-center justify-center rounded-full bg-voice px-6 text-[15px] font-semibold text-voice-foreground hover:bg-voice/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice focus-visible:ring-offset-2";

// Lo último que pasó con el acompañamiento, arriba del estado vacío (DESIGN-WEB.md §10): la solicitud
// pendiente, un "Ahora no" o un proceso que terminó. Solo lo más reciente.
function CareStatus() {
  const state = useCare();
  const pending = pendingRequest(state);
  const outcome = latestOutcome(state);
  const [confirming, setConfirming] = useState(false);
  const [failed, setFailed] = useState(false);

  if (pending) {
    const name = findPsychologist(pending.psychologistId)?.name ?? "tu psicólogo";
    const firstName = name.split(" ")[0];
    return (
      <section className="space-y-3 rounded-lg border border-border/40 bg-surface-raised p-5 shadow-raised dark:shadow-none" aria-labelledby="solicitud-titulo">
        <div className="flex items-center gap-3">
          <Avatar name={name} size={44} />
          <div className="min-w-0">
            <h2 id="solicitud-titulo" className="font-replica text-lg font-medium text-foreground">
              Esperando respuesta de {firstName}
            </h2>
            <p className="text-[13px] text-muted-foreground">Le pediste acompañamiento el {dateLabel(pending.createdAt)}.</p>
          </div>
        </div>
        {pending.message ? (
          <blockquote className="whitespace-pre-wrap rounded-md bg-surface px-4 py-3 text-[15px] leading-[21px] text-foreground">{pending.message}</blockquote>
        ) : null}
        <p className="text-[13px] leading-[18px] text-muted-foreground">Si acepta, aquí se abre el chat con {firstName}.</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" className="h-11" onClick={() => setConfirming(true)}>
            Retirar solicitud
          </Button>
          {/* Solo en desarrollo y sin servidor: lo que haría el psicólogo desde su panel. */}
          {TEST_TOOLS ? (
            <>
              <Button variant="ghost" size="sm" className="h-11" onClick={() => care.simulateAnswer(true)}>
                Simular: acepta
              </Button>
              <Button variant="ghost" size="sm" className="h-11" onClick={() => care.simulateAnswer(false)}>
                Simular: ahora no
              </Button>
            </>
          ) : null}
        </div>
        {failed ? (
          <p role="alert" className="text-[13px] text-emotion">
            No pudimos retirar tu solicitud. Inténtalo otra vez.
          </p>
        ) : null}
        <ConfirmDialog
          open={confirming}
          onClose={() => setConfirming(false)}
          onConfirm={() => void care.withdraw(pending.id).then((ok) => setFailed(!ok))}
          title="¿Retirar tu solicitud?"
          description={`${firstName} ya no la verá. Después podrás pedir acompañamiento a quien quieras.`}
          confirmLabel="Retirar"
        />
      </section>
    );
  }

  if (outcome?.kind === "declined") {
    const firstName = (findPsychologist(outcome.request.psychologistId)?.name ?? "Tu psicólogo").split(" ")[0];
    return (
      <section className="space-y-3 rounded-lg bg-surface px-5 py-4" role="status">
        <p className="text-[15px] leading-[21px] text-foreground">
          {firstName} no puede acompañarte por ahora. En el directorio hay otros psicólogos verificados.
        </p>
        <Link to="/chat/directorio" className={PRIMARY_LINK}>
          Buscar un psicólogo
        </Link>
      </section>
    );
  }

  if (outcome?.kind === "ended") {
    const { conversation } = outcome;
    const firstName = (findPsychologist(conversation.psychologistId)?.name ?? "tu psicólogo").split(" ")[0];
    const when = dateLabel(outcome.at);
    return (
      <section className="space-y-3 rounded-lg bg-surface px-5 py-4">
        <div className="space-y-1">
          <p className="text-[15px] leading-[21px] text-foreground">
            {conversation.endedBy === "psychologist" ? `${firstName} terminó el acompañamiento el ${when}.` : `Terminaste tu proceso con ${firstName} el ${when}.`}
          </p>
          <p className="text-[13px] text-muted-foreground">Tu diario ya no está compartido.</p>
        </div>
        <Link
          to={`/chat/conversacion/${conversation.id}`}
          className="inline-flex min-h-11 items-center gap-0.5 rounded-full text-[15px] font-medium text-voice hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
        >
          Ver la conversación
          <ChevronRight size={16} aria-hidden="true" />
        </Link>
      </section>
    );
  }

  return null;
}

/**
 * Chat es tu psicólogo (DESIGN-WEB.md §10). Trabajas con uno a la vez y empieza con una solicitud: con
 * uno activo, la pestaña abre directo la conversación; sin psicólogo, dice cómo va lo último y invita a
 * buscar uno.
 */
export const Chat: React.FC = () => {
  const state = useCare();
  const active = activeConversation(state);
  const psychologist = active ? findPsychologist(active.psychologistId) : null;
  const pending = pendingRequest(state);
  useImmersiveScreen(!!active && !!psychologist);

  if (!active || !psychologist) {
    return (
      <div className="mx-auto max-w-[680px] space-y-8 lg:mx-0">
        <h1 className="font-replica text-[28px] font-normal leading-[34px] tracking-[-0.3px] text-foreground">Chat</h1>
        <CareStatus />
        {pending || latestOutcome(state)?.kind === "declined" ? null : (
          <div className="space-y-3 rounded-lg bg-surface-sunken px-8 py-12 text-center">
            <MessageCircle size={28} className="mx-auto text-voice" aria-hidden="true" />
            <h2 className="font-replica text-xl font-medium text-foreground">Aquí hablarás con tu psicólogo</h2>
            <p className="mx-auto max-w-sm text-[15px] leading-[21px] text-muted-foreground">
              Elige un psicólogo verificado y pídele acompañamiento. Trabajas con uno a la vez: agenda sus sesiones por Meet y tú te unes desde aquí.
            </p>
            <Link to="/chat/directorio" className={PRIMARY_LINK}>
              Buscar un psicólogo
            </Link>
          </div>
        )}
        <Link
          to="/chat/ia"
          className="flex items-center gap-4 rounded-lg border border-border/40 bg-surface-raised p-5 shadow-raised transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice dark:shadow-none"
        >
          <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-reply-soft text-reply">
            <Sprout size={20} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-replica text-lg font-medium text-foreground">Conversar con Replica</span>
            <span className="block text-[13px] leading-[18px] text-muted-foreground">Para pensar en voz alta. No lee tus notas y no reemplaza a un psicólogo.</span>
          </span>
          <ChevronRight size={18} className="shrink-0 text-subtle" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return <Conversation conversationId={active.id} />;
};

/** Una conversación que terminó, para releerla (`/chat/conversacion/:id`): la misma pantalla, sin campo. */
export const ChatTerminado: React.FC = () => {
  const { id } = useParams();
  const state = useCare();
  const conversation = state.conversations.find((c) => c.id === id);
  useImmersiveScreen(!!conversation?.endedAt);
  if (!conversation?.endedAt) return <Navigate to="/chat" replace />;
  return <Conversation conversationId={conversation.id} readOnly />;
};

function Conversation({ conversationId, readOnly = false }: { conversationId: string; readOnly?: boolean }) {
  const state = useCare();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const shareRef = useRef<HTMLButtonElement>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [sendFailed, setSendFailed] = useState(false);
  const [notePicking, setNotePicking] = useState(false);

  const conversation = state.conversations.find((c) => c.id === conversationId);
  const psychologist = findPsychologist(conversation?.psychologistId);
  const messages = state.messages.filter((m) => m.conversationId === conversationId);
  const typing = !!state.typing[conversationId];
  const next = upcomingAppointments(state).find((a) => a.conversationId === conversationId);
  // Solo los mensajes que llegan con la pantalla abierta hacen su entrada (y suenan).
  const [initialIds] = useState(() => new Set(messages.map((m) => m.id)));

  useEffect(() => {
    if (!readOnly) care.markRead(conversationId);
  }, [conversationId, messages.length, readOnly]);

  const lastMessage = messages[messages.length - 1];
  useEffect(() => {
    if (lastMessage?.from === "psychologist" && !initialIds.has(lastMessage.id)) playSound("recibido");
  }, [lastMessage?.id, lastMessage?.from, initialIds]);

  // Al final de la conversación: la primera vez sin animar, después cada mensaje se desliza. Solo se
  // mueve la lista, nunca la página entera.
  const placed = useRef(false);
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ top: el.scrollHeight, behavior: placed.current && !reduced ? "smooth" : "auto" });
    placed.current = true;
  }, [messages.length, typing]);

  // La primera vez en la conversación: compartir el diario es opcional y reversible.
  useCancelToursOnLeave(["chat"]);
  useEffect(() => {
    if (readOnly) return;
    const t = setTimeout(
      () =>
        tutorials.start("chat", [
          {
            target: shareRef,
            text: "Si quieres, compártele tu diario a tu psicólogo. Puedes retirar el permiso cuando quieras; las notas privadas nunca se comparten.",
            radius: 22,
          },
        ]),
      900
    );
    return () => clearTimeout(t);
  }, [readOnly]);

  if (!conversation || !psychologist) return null;
  const sharing = !readOnly && isSharing(state, psychologist.id);
  const firstName = psychologist.name.split(" ")[0];

  return (
    <div className="lg:grid lg:grid-cols-[320px_1fr] lg:items-start lg:gap-8">
      {/* Escritorio: la ficha del psicólogo al lado de la conversación (DESIGN-WEB.md §4). */}
      <aside className="hidden space-y-4 lg:sticky lg:top-8 lg:block" aria-label={`Sobre ${psychologist.name}`}>
        <div className="space-y-4 rounded-lg border border-border/40 bg-surface-raised p-5 shadow-raised dark:shadow-none">
          <div className="flex items-center gap-3">
            <Avatar name={psychologist.name} size={52} />
            <div className="min-w-0">
              <p className="font-replica text-lg font-medium text-foreground">{psychologist.name}</p>
              <p className="text-[13px] text-muted-foreground">{psychologist.title}</p>
            </div>
          </div>
          <p className="flex items-center gap-1.5 text-[13px] text-voice">
            <BadgeCheck size={16} aria-hidden="true" />
            Licencia verificada · {psychologist.license}
          </p>
          <Link
            to={`/psicologo/${psychologist.id}`}
            className="inline-flex min-h-11 items-center gap-0.5 rounded-full text-[15px] font-medium text-voice hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
          >
            Ver su perfil
            <ChevronRight size={16} aria-hidden="true" />
          </Link>
        </div>
        {readOnly ? null : (
          <div className="space-y-3 rounded-lg border border-border/40 bg-surface-raised p-5 shadow-raised dark:shadow-none">
            <p className="flex items-center gap-2 font-replica text-lg font-medium text-foreground">
              <NotebookText size={18} className={sharing ? "text-voice" : "text-muted-foreground"} aria-hidden="true" />
              {sharing ? "Diario compartido" : "Diario privado"}
            </p>
            <p className="text-[13px] leading-[18px] text-muted-foreground">
              {sharing
                ? `${firstName} puede leer tus notas, salvo las privadas. Las réplicas son solo tuyas.`
                : `Si quieres, compártele tu diario a ${firstName}. Puedes retirar el permiso cuando quieras.`}
            </p>
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              className="min-h-11 rounded-full bg-muted px-4 text-[13px] font-semibold text-foreground hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
            >
              {sharing ? "Cambiar permiso" : "Compartir mi diario"}
            </button>
          </div>
        )}
      </aside>

      <section
        aria-label={`Conversación con ${psychologist.name}`}
        className="-mx-4 flex h-[100dvh] flex-col bg-background sm:-mx-6 md:mx-0 md:h-[calc(100dvh-5rem)] md:overflow-hidden md:rounded-lg md:border md:border-border/40 md:bg-surface-raised md:shadow-raised md:dark:shadow-none"
      >
        <h2 className="sr-only">Conversación con {psychologist.name}</h2>
        <header className="flex items-center gap-1 border-b border-border/60 px-2 py-2 md:px-3 lg:hidden">
          <button
            type="button"
            onClick={() => navigate(readOnly ? "/chat" : "/")}
            aria-label={readOnly ? "Volver a Chat" : "Volver a Inicio"}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-foreground hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice lg:hidden"
          >
            <ChevronLeft size={26} aria-hidden="true" />
          </button>
          <Link
            to={`/psicologo/${psychologist.id}`}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-md px-2 py-1 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
          >
            <Avatar name={psychologist.name} size={36} />
            <span className="min-w-0">
              <span className="block truncate text-base font-semibold text-foreground">{psychologist.name}</span>
              <span className={`block text-xs ${sharing ? "text-voice" : "text-muted-foreground"}`}>
                {readOnly ? "Terminada" : sharing ? "Diario compartido" : "Diario privado"}
              </span>
            </span>
          </Link>
          <CrisisButton variant="header" className="md:hidden" />
          {readOnly ? null : (
            <button
              ref={shareRef}
              type="button"
              onClick={() => setShareOpen(true)}
              aria-label={sharing ? "Diario compartido. Cambiar permiso" : "Compartir mi diario"}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
            >
              <NotebookText size={21} aria-hidden="true" className={sharing ? "text-voice" : "text-muted-foreground"} />
            </button>
          )}
        </header>

        {next && !readOnly ? <NextSession startsAt={next.startsAt} meetLink={next.meetLink} /> : null}

        <div ref={scrollRef} className="flex flex-1 flex-col gap-2.5 overflow-y-auto overscroll-contain p-4" aria-live="polite">
          <p className="px-6 pb-2 text-center text-[13px] leading-[18px] text-muted-foreground">
            Tus mensajes con {firstName} son privados. Replica no los usa para las réplicas.
            <br />
            Las sesiones las agenda {firstName}; si necesitas cambiar una, escríbele.
            <br />
            <Link
              to="/chat/ia"
              className="inline-flex min-h-11 items-center font-medium text-voice underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
            >
              ¿Quieres pensar en voz alta? Conversa con Replica
            </Link>
          </p>
          {messages.map((message, i) => {
            const newDay = i === 0 || !sameDay(messages[i - 1].createdAt, message.createdAt);
            const appointment = message.appointmentId ? state.appointments.find((a) => a.id === message.appointmentId) : undefined;
            return (
              <React.Fragment key={message.id}>
                {newDay ? <p className="pt-3 text-center text-xs text-muted-foreground">{dayLabel(message.createdAt)}</p> : null}
                {message.kind === "session" && appointment ? (
                  <SessionCard appointment={appointment} name={firstName} ended={readOnly} />
                ) : (
                  <MessageBubble message={message} fresh={!initialIds.has(message.id)} />
                )}
              </React.Fragment>
            );
          })}
          {typing ? <TypingIndicator name={firstName} /> : null}
          {readOnly && conversation.endedAt ? (
            <p className="py-4 text-center text-[13px] text-muted-foreground">Esta conversación terminó el {dateLabel(conversation.endedAt)}.</p>
          ) : null}
        </div>

        {readOnly ? null : (
        <div className="border-t border-border/60 bg-background/95 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:bg-transparent">
          {sendFailed ? (
            <p role="alert" className="px-2 pb-2 text-[13px] text-emotion">
              No pudimos enviar tu mensaje. Revisa tu conexión e inténtalo otra vez.
            </p>
          ) : null}
          <ChatInput
            onSend={async (text) => {
              playSound("enviado");
              const sent = await care.send(conversation.id, text.trim());
              setSendFailed(!sent);
              return sent;
            }}
            leading={
              <button
                type="button"
                onClick={() => setNotePicking(true)}
                aria-label="Compartir una nota"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
              >
                <NotebookPen size={19} aria-hidden="true" />
              </button>
            }
          />
        </div>
        )}
      </section>

      <ShareDiaryDialog psychologistId={shareOpen ? psychologist.id : null} onClose={() => setShareOpen(false)} />
      {readOnly ? null : (
        <ShareNoteDialog
          open={notePicking}
          onClose={() => setNotePicking(false)}
          name={firstName}
          onShare={async (note) => {
            const sent = await care.shareNote(conversation.id, note);
            if (sent) playSound("enviado");
            return sent;
          }}
        />
      )}
    </div>
  );
}

export default Chat;
