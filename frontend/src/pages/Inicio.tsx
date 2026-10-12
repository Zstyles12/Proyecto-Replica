import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookmarkCheck, Lock, MoonStar, X } from "lucide-react";
import { CofreButton } from "../components/brand/CofreButton";
import { GrowthStreak } from "../components/brand/GrowthIcon";
import { Enter, WordReveal } from "../components/motion/Motion";
import { ContextPills } from "../features/journal/components/ContextPills";
import { DayStatus } from "../features/journal/components/DayStatus";
import { WriterSheet } from "../features/journal/components/WriterSheet";
import { NoteClosing, WovenNote } from "../features/journal/components/WovenNote";
import { PhraseCard } from "../features/cofre/components/PhraseCard";
import { phrasesForDay } from "../features/cofre/library";
import { phraseFromLibrary } from "../features/cofre/store";
import { dayReplies, lateNotesOf, useDayReply, useLateReply } from "../features/journal/dayReplies";
import {
  dayKey,
  journal,
  nextReplyMode,
  notesToday,
  replyModeOf,
  streakDays,
  useNote,
  useNotes,
  dayNotes,
} from "../features/journal/store";
import { promptForDate, type Mood } from "../features/journal/moods";
import { firstName, useProfile } from "../features/profile/store";
import { setPendingPrompt, usePendingPrompt } from "../lib/appState";
import { capitalize } from "../lib/format";
import { playSound } from "../lib/sounds";
import { tutorials, useActiveTour, useCancelToursOnLeave } from "../lib/tutorials";

type Mode = { kind: "compose" } | { kind: "note"; id: string };

function greeting(date: Date) {
  const h = date.getHours();
  if (h < 5) return "Buenas noches";
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

// Lo que dice el recorrido de la racha, según cuánto creció ya.
function streakTip(days: number) {
  if (days >= 50) return "Esta es tu flor. Creció con cada día que escribiste, igual que tú.";
  if (days >= 20) return "Esta es tu plantita. Crece con cada día que escribes, y tú creces con ella.";
  if (days >= 10) return "Este es tu brote. Crece con cada día que escribes, y tú creces con él.";
  return "Esta es tu semilla. Crece con cada día que escribes, y tú creces con ella.";
}

/**
 * Inicio (app/(tabs)/index.tsx de la app): fecha y racha, saludo con el cofre, la línea de la réplica
 * del día, las pastillas, la hoja y las dos frases del día. Nada más: la hoja no compite con nada.
 * En escritorio, las frases van en un panel a la derecha (DESIGN-WEB.md §4).
 */
export const Inicio: React.FC = () => {
  const navigate = useNavigate();
  const notes = useNotes();
  const { name, dayReplyHour } = useProfile();
  const now = useMemo(() => new Date(), []);
  const prompt = usePendingPrompt();

  const [mode, setMode] = useState<Mode>({ kind: "compose" });
  const [text, setText] = useState("");
  const [mood, setMood] = useState<Mood | null>(null);
  const [tag, setTag] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [askContext, setAskContext] = useState(0);
  const [folding, setFolding] = useState(false);
  const [passing, setPassing] = useState(false);

  // Para los recorridos.
  const contextRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const privateRef = useRef<HTMLButtonElement>(null);
  const actionRef = useRef<HTMLDivElement>(null);
  const cofreRef = useRef<HTMLAnchorElement>(null);
  const streakRef = useRef<HTMLDivElement>(null);

  const streak = streakDays(notes);
  const phrases = useMemo(() => phrasesForDay(now).map(phraseFromLibrary), [now]);
  const todays = useMemo(() => notesToday(notes), [notes]);
  // La primera nota del día (no privada) recibe su réplica al momento; las demás se leen juntas en
  // la réplica del día.
  const replyMode = nextReplyMode(notes, isPrivate);
  const toReadTonight = dayNotes(notes).length;
  const today = dayKey(now);
  const dayReply = useDayReply(today);
  const yesterday = useMemo(() => {
    const d = new Date(now);
    d.setDate(d.getDate() - 1);
    return dayKey(d);
  }, [now]);
  const lastNight = useLateReply(yesterday);
  const lateToday = dayReply ? lateNotesOf(notes, today).length : 0;

  // Pasada la hora, la réplica del día se pide al abrir Inicio, junto con las de días en que no se
  // abrió la web a esa hora (con Supabase las hará el servidor).
  useEffect(() => {
    dayReplies.catchUp(notes);
  }, [notes, dayReplyHour]);

  // Si llega con la pantalla abierta, suena la campanita al terminar.
  const dayStatus = dayReply?.replyStatus;
  const prevDayStatus = useRef(dayStatus);
  useEffect(() => {
    if (prevDayStatus.current === "streaming" && dayStatus === "done") playSound("replica");
    prevDayStatus.current = dayStatus;
  }, [dayStatus]);

  // Viene de "Escribir sobre esto": vuelve a la hoja y la enfoca.
  const [lastPrompt, setLastPrompt] = useState(prompt);
  if (prompt !== lastPrompt) {
    setLastPrompt(prompt);
    if (prompt) setMode({ kind: "compose" });
  }
  useEffect(() => {
    if (!prompt) return;
    const t = setTimeout(() => document.getElementById("writer-sheet")?.focus(), 350);
    return () => clearTimeout(t);
  }, [prompt]);

  // Con la hoja vacía ya no se está pidiendo nada: el aviso se retira.
  if (!text.trim() && askContext) setAskContext(0);

  const save = (value: string) => {
    if (!value) return;
    if (!mood || !tag) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setAskContext((n) => n + 1);
      return;
    }
    playSound("papel");
    const note = journal.add({ text: value, mood, tags: [tag], prompt, replyMode });
    setPendingPrompt(null);
    if (replyMode === "instant") journal.requestReply(note.id);
    // La hoja se pliega hacia arriba y pasa el hilo; la réplica entra encima.
    setFolding(true);
    setPassing(true);
    setTimeout(() => setPassing(false), 760);
    setTimeout(() => {
      setFolding(false);
      setIsPrivate(false);
      setText("");
      setMood(null);
      setTag(null);
      setAskContext(0);
      setMode({ kind: "note", id: note.id });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 260);
  };

  // Replica preguntó lo que faltaba y ya está todo: un instante para que se vea lo elegido y la nota
  // se guarda sola, sin volver a tocar el botón.
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  });
  useEffect(() => {
    if (!askContext || !mood || !tag) return;
    const t = setTimeout(() => saveRef.current(text.trim()), 520);
    return () => clearTimeout(t);
  }, [askContext, mood, tag, text]);

  // Recorridos: Inicio la primera vez, y la racha cuando asoma la planta.
  const activeTour = useActiveTour();
  useCancelToursOnLeave(["inicio", "racha", "primeraReplica"]);
  useEffect(() => {
    if (mode.kind !== "compose") return;
    const t = setTimeout(
      () =>
        tutorials.start("inicio", [
          { target: contextRef, text: "Cuéntale cómo te sientes y sobre qué escribes. Con esto ves tu evolución." },
          { target: sheetRef, text: "Tu hoja: escribe o dicta con el micrófono, cuanto quieras.", radius: 32 },
          { target: privateRef, text: "¿Es solo para ti? Márcala privada: no la lee Replica ni tu psicólogo.", radius: 22 },
          {
            target: actionRef,
            text: "Tu primera nota del día recibe su réplica al momento. En la noche llega una más, que lee todo tu día.",
            radius: 22,
          },
          { target: cofreRef, text: "Tu cofre: aquí quedan las frases que marques como favoritas.", radius: 26 },
        ]),
      1200
    );
    return () => clearTimeout(t);
  }, [mode.kind]);
  useEffect(() => {
    if (mode.kind !== "compose" || streak < 1 || activeTour) return;
    const t = setTimeout(() => tutorials.start("racha", [{ target: streakRef, text: streakTip(streak), radius: 14 }]), 1400);
    return () => clearTimeout(t);
  }, [mode.kind, streak, activeTour]);

  // El texto de ejemplo invita sin pedir nada: la primera nota del día pregunta cómo empiezas; la
  // segunda, cómo te fue.
  const placeholder = useMemo(() => {
    if (prompt) return "Escribe tu respuesta…";
    if (todays.length === 0) {
      return now.getHours() < 12 ? "Escribe aquí… ¿Cómo te sientes al empezar el día?" : `Escribe aquí… ${promptForDate(now)}`;
    }
    return "Escribe aquí… ¿Cómo te fue hoy? ¿Qué te llevas del día?";
  }, [now, todays.length, prompt]);

  // Qué dice el cierre según cómo responde Replica a la nota recién guardada.
  const savedNote = useNote(mode.kind === "note" ? mode.id : null);
  const savedMode = savedNote ? replyModeOf(savedNote) : "instant";
  const closingCopy =
    savedMode === "private"
      ? { icon: Lock, title: "Nota privada", line: "Solo tú la lees. Ni Replica ni tu psicólogo la ven." }
      : savedMode === "day"
        ? {
            icon: MoonStar,
            title: "Guardada en tu diario",
            line:
              dayReply?.replyStatus === "done"
                ? "Tu réplica de hoy ya llegó. Replica leerá esta nota a medianoche, en una última réplica."
                : `Replica la leerá a las ${dayReplyHour}:00, junto con todo tu día.`,
          }
        : { icon: BookmarkCheck, title: "Guardada en tu diario", line: "Tómate un momento con lo que leíste." };

  const first = firstName(name);
  const dateLabel = capitalize(now.toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" }));

  const phraseList = (
    <div className="space-y-3">
      {phrases.map((p) => (
        <PhraseCard key={p.key} phrase={p} />
      ))}
    </div>
  );

  return (
    <div className="pb-10">
      {passing ? (
        <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-1/3 z-50 space-y-1">
          <div className="thread-pass h-[2.5px] bg-voice" />
          <div className="thread-pass-back h-[2.5px] bg-reply" />
        </div>
      ) : null}

      <div className="lg:grid lg:grid-cols-[1fr_340px] lg:items-start lg:gap-10">
        <div className="mx-auto min-w-0 max-w-[680px] space-y-5 lg:mx-0">
          <header className="space-y-1">
            <Enter className="flex items-center justify-between gap-3">
              <span className="text-[13px] leading-[18px] text-muted-foreground">{dateLabel}</span>
              <GrowthStreak ref={streakRef} days={streak} />
            </Enter>
            <div className="flex items-center gap-3">
              <h1 className="flex-1">
                <WordReveal
                  as="span"
                  text={first ? `${greeting(now)}, ${first}` : greeting(now)}
                  mode="stagger"
                  className="block font-replica text-[28px] font-normal leading-[34px] tracking-[-0.3px] text-foreground"
                />
              </h1>
              <Enter index={1}>
                <CofreButton ref={cofreRef} />
              </Enter>
            </div>
            <Enter index={1} className="pt-1">
              <DayStatus
                count={toReadTonight}
                hour={dayReplyHour}
                replied={!!dayReply}
                late={lateToday}
                arrived={
                  dayReply
                    ? { kind: "day", status: dayReply.replyStatus, day: today }
                    : lastNight
                      ? { kind: "late", status: lastNight.replyStatus, day: yesterday }
                      : null
                }
              />
            </Enter>
          </header>

          {mode.kind === "compose" ? (
            <div className={`space-y-3 ${folding ? "sheet-fold" : ""}`}>
              <Enter index={1}>
                <ContextPills
                  tourRef={contextRef}
                  mood={mood}
                  onMoodChange={setMood}
                  tag={tag}
                  onTagChange={setTag}
                  askToken={askContext}
                  purpose={replyMode === "instant" ? "reply" : "save"}
                />
              </Enter>

              {prompt ? (
                <Enter className="flex items-start gap-2 rounded-md bg-reply-soft/60 px-4 py-3">
                  <div className="flex-1 space-y-0.5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.6px] text-reply">Escribes sobre</p>
                    <p className="font-replica text-base italic leading-[22px] text-foreground">{prompt}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPendingPrompt(null)}
                    aria-label="Quitar la pregunta"
                    className="-mr-2 -mt-1 flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
                  >
                    <X size={18} aria-hidden="true" />
                  </button>
                </Enter>
              ) : null}

              <Enter index={2}>
                <WriterSheet
                  content={text}
                  onChangeContent={setText}
                  isPrivate={isPrivate}
                  onTogglePrivate={() => setIsPrivate((v) => !v)}
                  onSubmit={save}
                  action={replyMode === "instant" ? "replica" : "guardar"}
                  placeholder={placeholder}
                  loading={folding}
                  sheetRef={sheetRef}
                  privateRef={privateRef}
                  actionRef={actionRef}
                />
              </Enter>

              <Enter index={3} className="pt-5 lg:hidden">
                {phraseList}
              </Enter>
            </div>
          ) : (
            <WovenNote
              key={mode.id}
              noteId={mode.id}
              animate
              actions={
                <NoteClosing
                  {...closingCopy}
                  onDone={() => {
                    setMode({ kind: "compose" });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  onOpenNotes={() => navigate(`/notas/${mode.id}`)}
                />
              }
            />
          )}
        </div>

        {/* Escritorio: las dos frases del día al lado de la hoja, sin título (DESIGN-WEB.md §4). */}
        <aside className="hidden lg:sticky lg:top-8 lg:block" aria-label="Frases del día">
          <Enter index={3}>{phraseList}</Enter>
        </aside>
      </div>
    </div>
  );
};

export default Inicio;
