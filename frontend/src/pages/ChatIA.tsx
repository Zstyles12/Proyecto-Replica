import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus, Sprout, Trash2 } from "lucide-react";
import { CrisisButton } from "../components/help/CrisisButton";
import { HelpLink } from "../components/help/HelpLink";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/ui/Button";
import { Dialog } from "../components/ui/Dialog";
import { aiChat, isLimited, messagesOf, NEW_CHAT, sortedChats, useAiChat } from "../features/aichat/store";
import { ChatInput } from "../features/care/components/ChatInput";
import { dayLabel, sameDay, timeLabel } from "../lib/format";
import { useImmersiveScreen } from "../lib/layout";
import type { AiChatMessage } from "../services/aiChat";

/**
 * El chat con Replica (RF-57, RF-58, DESIGN-WEB.md §11): aparte del chat con psicólogos. Por debajo de
 * 1024 px, /chat/ia es la lista y cada conversación ocupa la pantalla; desde 1024 px, la lista a la
 * izquierda y la conversación a la derecha (/chat/ia abre una nueva).
 */
export const ChatIA: React.FC = () => {
  const { id } = useParams();
  const open = id ?? null;
  useImmersiveScreen(open !== null);

  useEffect(() => {
    aiChat.load();
  }, []);

  return (
    <div className="lg:grid lg:grid-cols-[320px_1fr] lg:items-start lg:gap-8">
      <div className={`${open ? "hidden lg:block" : ""} lg:sticky lg:top-8`}>
        <ChatList openId={open} />
      </div>
      <div className={open ? "" : "hidden lg:block"}>
        <Conversation key={open ?? NEW_CHAT} chatId={open === NEW_CHAT ? null : open} />
      </div>
    </div>
  );
};

function ChatList({ openId }: { openId: string | null }) {
  const state = useAiChat();
  const chats = sortedChats(state);

  return (
    <div className="mx-auto max-w-[680px] space-y-6 lg:mx-0">
      <PageHeader title="Conversa con Replica" fallback="/chat" />
      <Link
        to="/chat/ia/nueva"
        className="inline-flex h-11 items-center gap-2 rounded-full bg-voice px-5 text-[15px] font-semibold text-voice-foreground transition-colors hover:bg-voice/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice focus-visible:ring-offset-2"
      >
        <Plus size={17} aria-hidden="true" />
        Nueva conversación
      </Link>

      {state.status === "failed" ? (
        <p role="alert" className="text-[15px] leading-[21px] text-emotion">
          No pudimos traer tus conversaciones. Revisa tu conexión e inténtalo otra vez.
        </p>
      ) : state.status !== "ready" ? (
        <p className="text-[15px] text-muted-foreground">Cargando…</p>
      ) : chats.length ? (
        <ul className="space-y-2" aria-label="Tus conversaciones con Replica">
          {chats.map((chat) => {
            const last = messagesOf(state, chat.id).at(-1);
            const current = openId === chat.id;
            return (
              <li key={chat.id}>
                <Link
                  to={`/chat/ia/${chat.id}`}
                  aria-current={current ? "page" : undefined}
                  className={`flex min-h-11 items-center gap-3 rounded-md px-4 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice ${
                    current ? "bg-voice-soft/25" : "bg-surface-raised hover:bg-surface"
                  }`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-medium text-foreground">{chat.title}</span>
                    <span className="block text-[13px] text-muted-foreground">{dayLabel(last?.createdAt ?? chat.createdAt)}</span>
                  </span>
                  <ChevronRight size={16} className="shrink-0 text-subtle" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-[15px] leading-[21px] text-muted-foreground">Todavía no conversaste con Replica.</p>
      )}
    </div>
  );
}

function Conversation({ chatId }: { chatId: string | null }) {
  const state = useAiChat();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteFailed, setDeleteFailed] = useState(false);

  const chat = chatId ? state.chats.find((c) => c.id === chatId) : null;
  const messages = chatId ? messagesOf(state, chatId) : [];
  const waiting = state.sending === (chatId ?? NEW_CHAT);
  const limited = isLimited(state);
  // Solo lo que llega con la pantalla abierta hace su entrada.
  const [initialIds] = useState(() => new Set(messages.map((m) => m.id)));

  const reveal = state.reveal;
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight });
  }, [messages.length, waiting, reveal?.words]);

  // Una conversación que no existe (borrada, o de otra cuenta) lleva a la lista.
  if (chatId && state.status === "ready" && !chat) {
    return (
      <div className="mx-auto max-w-[680px] space-y-4 lg:mx-0">
        <PageHeader title="" fallback="/chat/ia" />
        <p className="text-[15px] text-muted-foreground">Esta conversación ya no está.</p>
        <Link to="/chat/ia" className="inline-flex min-h-11 items-center font-medium text-voice hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice">
          Ver tus conversaciones
        </Link>
      </div>
    );
  }

  return (
    <section
      aria-label="Conversación con Replica"
      className="-mx-4 flex h-[100dvh] flex-col bg-background sm:-mx-6 md:mx-0 md:h-[calc(100dvh-5rem)] md:overflow-hidden md:rounded-lg md:border md:border-border/40 md:bg-surface-raised md:shadow-raised md:dark:shadow-none"
    >
      <header className="flex items-center gap-1 border-b border-border/60 px-2 py-2 md:px-3">
        <button
          type="button"
          onClick={() => navigate("/chat/ia")}
          aria-label="Volver a tus conversaciones"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-foreground hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice lg:hidden"
        >
          <ChevronLeft size={26} aria-hidden="true" />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-3 px-2 py-1">
          <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-reply-soft text-reply">
            <Sprout size={17} />
          </span>
          <h1 className="min-w-0 truncate text-base font-semibold text-foreground">{chat?.title || "Replica"}</h1>
        </div>
        <CrisisButton variant="header" className="md:hidden" />
        {chat ? (
          <button
            type="button"
            onClick={() => {
              setDeleteFailed(false);
              setConfirmDelete(true);
            }}
            aria-label="Borrar conversación"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
          >
            <Trash2 size={19} aria-hidden="true" />
          </button>
        ) : null}
      </header>

      <div ref={scrollRef} className="flex flex-1 flex-col gap-2.5 overflow-y-auto overscroll-contain p-4" aria-live="polite">
        <p className="px-6 pb-2 text-center text-[13px] leading-[18px] text-muted-foreground">
          Aquí piensas en voz alta con Replica. No lee tus notas, no diagnostica y no reemplaza a un psicólogo.
        </p>
        {messages.map((message, i) => {
          const newDay = i === 0 || !sameDay(messages[i - 1].createdAt, message.createdAt);
          return (
            <React.Fragment key={message.id}>
              {newDay ? <p className="pt-3 text-center text-xs text-muted-foreground">{dayLabel(message.createdAt)}</p> : null}
              <Bubble
                message={message}
                fresh={!initialIds.has(message.id)}
                words={reveal?.id === message.id ? reveal.words : null}
              />
            </React.Fragment>
          );
        })}
        {waiting ? (
          <p className="enter self-start px-1 font-replica text-[15px] italic text-reply">Replica está escribiendo…</p>
        ) : null}
      </div>

      <div className="border-t border-border/60 bg-background/95 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:bg-transparent">
        {limited ? (
          <p className="px-2 pb-2 font-replica text-[16px] italic leading-[22px] text-reply" role="status">
            Por hoy ya conversamos bastante. Mañana seguimos aquí.
          </p>
        ) : failed ? (
          <p role="alert" className="px-2 pb-2 text-[13px] text-emotion">
            No pudimos enviar tu mensaje. Revisa tu conexión e inténtalo otra vez.
          </p>
        ) : null}
        <ChatInput
          disabled={waiting || limited}
          onSend={async (text) => {
            const result = await aiChat.send(chatId, text.trim());
            setFailed(!result.ok && result.reason === "error");
            if (result.ok && !chatId) navigate(`/chat/ia/${result.chatId}`, { replace: true });
            return result.ok;
          }}
        />
      </div>

      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="¿Borrar esta conversación?"
        description="Se borra esta conversación con Replica. No se puede deshacer."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!chatId) return;
                const ok = await aiChat.remove(chatId);
                if (!ok) {
                  setDeleteFailed(true);
                  return;
                }
                setConfirmDelete(false);
                navigate("/chat/ia", { replace: true });
              }}
            >
              Borrar
            </Button>
          </>
        }
      >
        {deleteFailed ? (
          <p role="alert" className="text-[13px] text-emotion">
            No pudimos borrarla. Revisa tu conexión e inténtalo otra vez.
          </p>
        ) : null}
      </Dialog>
    </section>
  );
}

// Lo tuyo en salvia, tu voz; lo de Replica en malva, porque es la IA (DESIGN.md §2).
function Bubble({ message, fresh, words }: { message: AiChatMessage; fresh: boolean; words: number | null }) {
  const mine = message.role === "user";
  const body = words === null ? message.body : message.body.split(" ").slice(0, words).join(" ");
  const done = words === null;
  return (
    <div className={`max-w-[85%] space-y-1 ${mine ? "self-end text-right" : "self-start"} ${fresh && mine ? "enter" : ""}`}>
      <div
        className={`inline-block rounded-md px-4 py-2.5 text-left text-base leading-[23px] ${
          mine ? "rounded-br-[6px] bg-voice text-voice-foreground" : "rounded-bl-[6px] border border-reply/20 bg-reply-soft/60 text-foreground"
        }`}
      >
        <span className="sr-only">{mine ? "Tú: " : "Replica: "}</span>
        {/* Mientras aparece palabra por palabra, el lector de pantalla espera a la respuesta entera. */}
        <span className="whitespace-pre-wrap" aria-hidden={done ? undefined : true}>
          {body}
        </span>
      </div>
      {done ? <p className="px-1 text-xs text-muted-foreground">{timeLabel(message.createdAt)}</p> : null}
      {!mine && message.risk && done ? <HelpLink className="mt-2 text-left" /> : null}
    </div>
  );
}

export default ChatIA;
