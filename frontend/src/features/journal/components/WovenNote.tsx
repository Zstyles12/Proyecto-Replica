import React, { useEffect, useRef, useState } from "react";
import { ChevronRight, Lock, type LucideIcon } from "lucide-react";
import { Enter } from "../../../components/motion/Motion";
import { Button } from "../../../components/ui/Button";
import { PhraseCard } from "../../cofre/components/PhraseCard";
import { phraseFromLearning } from "../../cofre/store";
import { DayReplyNote } from "./DayReplyNote";
import { EntryCard } from "./EntryCard";
import { ReplyCard } from "./ReplyCard";
import { noteTitle, replyModeOf, useNote } from "../store";
import { playSound } from "../../../lib/sounds";
import { tutorials } from "../../../lib/tutorials";

// Tras plegarse tu texto, la réplica entra por encima (DESIGN.md §7.2, Pedir la réplica).
const REPLY_DELAY = 320;

/**
 * La réplica arriba, tu entrada plegada debajo y, al terminar, la frase que va al cofre. Es la misma
 * pieza en Inicio (en vivo) y en el detalle de Notas (features/journal/components/woven-note.tsx).
 */
export const WovenNote: React.FC<{
  noteId: string;
  // true: recién escrita; la réplica aparece encima, escribiéndose.
  animate: boolean;
  // Acciones que aparecen cuando la réplica terminó de llegar.
  actions?: React.ReactNode;
}> = ({ noteId, animate, actions }) => {
  const note = useNote(noteId);
  const [showReply, setShowReply] = useState(!animate);
  const [live, setLive] = useState(animate);
  const previousStatus = useRef(note?.replyStatus);
  const heartRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (showReply) return;
    const t = setTimeout(() => setShowReply(true), REPLY_DELAY);
    return () => clearTimeout(t);
  }, [showReply]);

  // La primera réplica que llega en vivo: el recorrido señala el corazón de la frase destilada.
  const learningReady = live && note?.replyStatus === "done" && !!note?.reply?.learning;
  useEffect(() => {
    if (!learningReady) return;
    const t = setTimeout(
      () =>
        tutorials.start("primeraReplica", [
          {
            target: heartRef,
            text: "Cada réplica deja una frase. Si te quedó, márcala como favorita y se guarda en tu cofre.",
            radius: 26,
          },
        ]),
      1100
    );
    return () => clearTimeout(t);
  }, [learningReady]);

  const status = note?.replyStatus;
  // Si la réplica se pide aquí mismo, llega en vivo aunque la nota ya existiera.
  if (status === "streaming" && !live) setLive(true);
  useEffect(() => {
    if (previousStatus.current === "streaming" && status === "done") playSound("replica");
    previousStatus.current = status;
  }, [status]);

  if (!note) return null;
  // Solo la primera nota del día tiene réplica propia. Las demás se leen en la réplica del día y las
  // privadas no las lee nadie: para ellas no hay tarjeta de réplica, y sus acciones aparecen enseguida.
  const mode = replyModeOf(note);
  const hasOwnReply = mode === "instant";
  const done = hasOwnReply ? note.replyStatus === "done" : true;
  const learning = note.reply?.learning;

  return (
    <div className="space-y-4">
      {showReply && hasOwnReply ? (
        <div className={animate ? "reply-in" : undefined}>
          <ReplyCard note={note} live={live} />
        </div>
      ) : null}

      <Enter disabled={!animate} delay={120}>
        <EntryCard note={note} />
      </Enter>

      {mode === "day" && !actions ? <DayReplyNote note={note} /> : null}
      {mode === "private" && !actions ? (
        <p className="flex items-center gap-2 px-2 text-[13px] leading-[18px] text-muted-foreground">
          <Lock size={14} className="shrink-0" aria-hidden="true" />
          Nota privada: solo tú la lees. Ni Replica ni tu psicólogo la ven.
        </p>
      ) : null}

      {done && learning ? (
        <Enter disabled={!live} delay={live ? 200 : 0}>
          <PhraseCard
            heartRef={heartRef}
            linked={false}
            phrase={phraseFromLearning({
              noteId: note.id,
              text: learning,
              createdAt: note.createdAt,
              source: noteTitle(note.text, 40),
            })}
          />
        </Enter>
      ) : null}

      {done && actions ? (
        <Enter disabled={!live} delay={live ? 360 : 0}>
          {actions}
        </Enter>
      ) : null}
    </div>
  );
};

/**
 * El cierre de una nota recién guardada: dice qué pasa con ella y ofrece volver. Invita a quedarse con
 * lo que leíste o escribiste, no a escribir otra enseguida (features/journal/components/note-closing.tsx).
 */
export const NoteClosing: React.FC<{
  icon: LucideIcon;
  title: string;
  line: string;
  onDone: () => void;
  onOpenNotes: () => void;
}> = ({ icon: Icon, title, line, onDone, onOpenNotes }) => (
  <div className="space-y-4 rounded-lg border border-border/35 bg-surface p-5 dark:border-border/60">
    <div className="flex items-center gap-3">
      <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-voice-soft text-voice">
        <Icon size={19} />
      </span>
      <div className="flex-1 space-y-0.5">
        <p className="font-replica text-[19px] font-medium leading-6 text-foreground">{title}</p>
        <p className="text-[13px] leading-[18px] text-muted-foreground">{line}</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Button className="flex-1" onClick={onDone}>
        Listo
      </Button>
      <Button variant="ghost" onClick={onOpenNotes} icon={undefined}>
        <span className="inline-flex items-center gap-1">
          Ver en Notas
          <ChevronRight size={16} aria-hidden="true" />
        </span>
      </Button>
    </div>
  </div>
);
