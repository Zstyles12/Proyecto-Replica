import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { NotebookText, Clock, Lock, Sparkles } from "lucide-react";
import { CofreIcon } from "../components/brand/CofreIcon";
import { ContextPills } from "../features/journal/components/ContextPills";
import { WriterSheet } from "../features/journal/components/WriterSheet";
import { ReplyCard } from "../features/journal/components/ReplyCard";
import { ClosingCard } from "../features/journal/components/ClosingCard";
import { DailyChestCard } from "../features/journal/components/DailyChestCard";
import { INICIO_CONTENT } from "../data/inicioContent";
import { PLAYGROUND_CONTENT } from "../data/playgroundContent";
import { authService } from "../services/auth";
import { journalService, type Entry, type AIReply } from "../services/journal";
import { playSound } from "../lib/sounds";

export const Inicio: React.FC = () => {
  const navigate = useNavigate();

  // Estados de entrada
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Estados de flujo de réplica y guardado
  const [isSaving, setIsSaving] = useState(false);
  const [isThreadPassing, setIsThreadPassing] = useState(false);
  const [savedReply, setSavedReply] = useState<AIReply | null>(null);
  const [showClosing, setShowClosing] = useState(false);
  const [lastSavedPrivate, setLastSavedPrivate] = useState(false);

  // Lista de notas recientes inicializada con el servicio local
  const [recentEntries, setRecentEntries] = useState<Entry[]>(() =>
    journalService.getRecentEntries(3)
  );

  const session = authService.getSession();
  const userName = session?.user.name || "Ana";
  const userTime = session?.user.dayReplyTime || "22:00";

  const { header, greetings, dayReplyStatus, writer, dailyQuotes, recentNotes } =
    INICIO_CONTENT;

  // Formato de fecha serena
  const todayFormatted = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  const capitalizedDate =
    todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1);

  // Saludo según la hora
  const currentHour = new Date().getHours();
  const greetingPrefix =
    currentHour < 12
      ? greetings.morning
      : currentHour < 19
      ? greetings.afternoon
      : greetings.evening;

  // Manejar el guardado de la nota
  const handleSubmit = async () => {
    setNotice(null);

    // Validación amable (Sección 11 regla 3 de DESIGN.md: nunca en rojo)
    if (!selectedMood) {
      setNotice(writer.notices.missingMood);
      return;
    }
    if (!selectedTag) {
      setNotice(writer.notices.missingTag);
      return;
    }
    if (!content.trim()) return;

    setIsSaving(true);
    setIsThreadPassing(true);
    playSound("papel");

    // Animación de "La pasada del hilo" (Sección 7.3: salvia va, malva vuelve en ~500 ms)
    setTimeout(async () => {
      setIsThreadPassing(false);

      const result = await journalService.createEntry({
        content,
        mood: selectedMood,
        tag: selectedTag,
        is_private: isPrivate,
      });

      setRecentEntries(journalService.getRecentEntries(3));
      setLastSavedPrivate(isPrivate);
      setShowClosing(true);

      if (result.reply) {
        setSavedReply(result.reply);
      } else {
        setSavedReply(null);
      }

      // Limpiar hoja para nueva sesión
      setContent("");
      setSelectedMood(null);
      setSelectedTag(null);
      setIsPrivate(false);
      setIsSaving(false);
    }, 520);
  };

  const handleDismissClosing = () => {
    setShowClosing(false);
    setSavedReply(null);
  };

  return (
    <div className="pb-10">
      {/* Animación de "La pasada del hilo" (Sección 7.3 de DESIGN.md) */}
      {isThreadPassing && (
        <div className="fixed inset-0 pointer-events-none z-50 flex flex-col justify-center overflow-hidden">
          {/* Hilo de ida (Salvia) */}
          <div className="w-full h-[2.5px] bg-voice animate-[slideRight_300ms_cubic-bezier(0.23,1,0.32,1)_forwards]" />
          {/* Hilo de vuelta (Malva) */}
          <div className="w-full h-[2.5px] bg-reply mt-1 animate-[slideLeft_300ms_cubic-bezier(0.23,1,0.32,1)_150ms_forwards]" />
        </div>
      )}

      {/* Cuadrícula editorial responsiva: 1 columna en móvil, 2 columnas equilibradas en escritorio (>= 1024px) */}
      <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-10 lg:items-start space-y-8 lg:space-y-0">
        {/* Columna Principal / Hoja de escribir */}
        <div className="min-w-0 space-y-6">
          {/* 1. Cabecera serena: Fecha, Racha y Saludo */}
          <header className="space-y-4">
            {/* Fecha y costura de racha (Sección 10 de DESIGN.md) */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{capitalizedDate}</span>
              <div className="flex items-center gap-1.5" title="Costura de constancia">
                <span className="w-1.5 h-1.5 rounded-full bg-voice" />
                <span className="w-1.5 h-1.5 rounded-full bg-voice" />
                <span className="w-1.5 h-1.5 rounded-full bg-voice" />
                <span className="font-voice ml-1 text-foreground">
                  {header.defaultStreak} {header.streakSuffix}
                </span>
              </div>
            </div>

            {/* Saludo grande y botón de Mi Cofre */}
            <div className="flex items-center justify-between gap-4">
              <h1 className="font-replica text-3xl sm:text-4xl font-normal text-foreground tracking-tight leading-tight">
                {greetingPrefix}, {userName}
              </h1>

              {/* Botón Mi Cofre móvil (en desktop se destaca en el riel lateral) */}
              <Link
                to="/notas"
                aria-label={header.chestAria}
                title="Mi cofre"
                className="lg:hidden w-11 h-11 rounded-full bg-surface border border-border/30 hover:bg-surface-sunken flex items-center justify-center text-foreground transition-all duration-small active:scale-[0.97] shrink-0"
              >
                <CofreIcon size={22} color="var(--voice)" heartColor="var(--emotion)" />
              </Link>
            </div>

            {/* Línea de cuándo llega la réplica del día (Sección 10 de DESIGN.md) */}
            <div className="flex items-center gap-2 text-xs text-subtle font-voice">
              <Clock size={13} className="shrink-0 text-voice" />
              <span>
                {dayReplyStatus.waitingPrefix} {userTime}
              </span>
            </div>
          </header>

          {/* 2. Pastillas de Contexto (Ánimo y Tema) con expansión fluida */}
          <ContextPills
            selectedMood={selectedMood}
            selectedTag={selectedTag}
            onSelectMood={(mood) => {
              setSelectedMood(mood);
              setNotice(null);
            }}
            onSelectTag={(tag) => {
              setSelectedTag(tag);
              setNotice(null);
            }}
          />

          {/* Aviso amable de Replica si falta contexto (Sección 3.1: nunca rojo) */}
          {notice && (
            <div className="p-3.5 rounded-md bg-surface-raised border border-reply/30 shadow-xs animate-section-enter">
              <p className="font-replica italic text-reply text-sm leading-relaxed">
                "{notice}"
              </p>
            </div>
          )}

          {/* 3. La Hoja de Escribir (Radio 32 px, Sección 6) */}
          <WriterSheet
            content={content}
            onChangeContent={(val) => {
              setContent(val);
              if (notice) setNotice(null);
            }}
            isPrivate={isPrivate}
            onTogglePrivate={() => setIsPrivate(!isPrivate)}
            onSubmit={handleSubmit}
            loading={isSaving}
          />

          {/* 4. Réplica generada tras guardar */}
          {savedReply && (
            <ReplyCard
              key={savedReply.id}
              reply={savedReply}
              onWriteAboutThis={(question) => {
                setContent((prev) => (prev ? `${prev}\n\n${question}` : question));
                setSavedReply(null);
                setShowClosing(false);
              }}
            />
          )}

          {/* 5. Tarjeta de Cierre tras guardar */}
          {showClosing && (
            <ClosingCard
              isPrivate={lastSavedPrivate}
              onDismiss={handleDismissClosing}
              onViewInNotes={() => navigate("/notas")}
            />
          )}

          {/* Secciones en móvil (Frases del cofre y Notas recientes) */}
          <div className="lg:hidden space-y-8 pt-4">
            {/* Frases del día en móvil */}
            <section className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {dailyQuotes.map((q) => (
                  <DailyChestCard
                    key={q.id}
                    tag={q.tag}
                    quote={q.quote}
                    author={q.author}
                  />
                ))}
              </div>
            </section>

            {/* Notas recientes en móvil */}
            <section className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h2 className="font-replica text-2xl font-normal text-foreground">
                  {recentNotes.title}
                </h2>

                <Link
                  to="/notas"
                  aria-label={header.notesAria}
                  title="Ver todas tus notas"
                  className="w-11 h-11 rounded-full bg-surface border border-border/30 hover:bg-surface-sunken flex items-center justify-center text-voice transition-all duration-small active:scale-[0.97]"
                >
                  <NotebookText size={21} strokeWidth={2} className="text-voice" />
                </Link>
              </div>

              {recentEntries.length === 0 ? (
                <div className="p-6 rounded-lg bg-surface-sunken border border-border/20 text-center">
                  <p className="font-voice text-sm text-subtle">
                    {recentNotes.empty}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentEntries.map((entry) => {
                    const moodObj = PLAYGROUND_CONTENT.moods.find(
                      (m) => m.id === entry.mood
                    );

                    return (
                      <div
                        key={entry.id}
                        className="p-4 rounded-lg bg-surface-raised border border-border/40 hover:border-border transition-colors space-y-2 shadow-xs"
                      >
                        <div className="flex items-center justify-between text-xs text-subtle">
                          <div className="flex items-center gap-2">
                            {moodObj && (
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: moodObj.colorVar }}
                              />
                            )}
                            <span className="font-medium text-foreground">
                              {moodObj?.name || entry.mood}
                            </span>
                            <span>·</span>
                            <span className="text-muted-foreground">#{entry.tag}</span>
                          </div>

                          <div className="flex items-center gap-1.5 text-subtle">
                            {entry.is_private && <Lock size={12} className="text-voice" />}
                            <span>
                              {new Intl.DateTimeFormat("es-ES", {
                                hour: "2-digit",
                                minute: "2-digit",
                              }).format(new Date(entry.created_at))}
                            </span>
                          </div>
                        </div>

                        <p className="font-voice text-sm text-foreground line-clamp-2 leading-relaxed">
                          {entry.content}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Columna Lateral para Escritorio (>= 1024px) */}
        <aside className="hidden lg:flex lg:flex-col lg:space-y-6 lg:sticky lg:top-8 select-none">
          {/* Tarjeta del estado de la réplica */}
          <div className="p-5 rounded-2xl bg-surface-raised border border-border/40 shadow-raised space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-voice tracking-wide uppercase">
                <Sparkles size={14} className="text-voice" />
                La Réplica de tu día
              </span>
              <span className="text-xs text-subtle font-mono">{userTime}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Replica leerá con calma todo lo que escribas hoy y te responderá con una mirada serena a las {userTime}.
            </p>
          </div>

          {/* Sección El Cofre / Palabras del día */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CofreIcon size={20} color="var(--voice)" heartColor="var(--emotion)" />
                <h3 className="font-replica text-lg font-medium text-foreground">
                  Palabras del día
                </h3>
              </div>
              <Link
                to="/notas"
                aria-label={header.chestAria}
                title="Abrir Mi cofre"
                className="w-9 h-9 rounded-full bg-surface border border-border/30 hover:bg-surface-sunken flex items-center justify-center transition-all duration-small active:scale-[0.97]"
              >
                <CofreIcon size={17} color="var(--voice)" heartColor="var(--emotion)" />
              </Link>
            </div>

            <div className="space-y-3">
              {dailyQuotes.map((q) => (
                <DailyChestCard
                  key={q.id}
                  tag={q.tag}
                  quote={q.quote}
                  author={q.author}
                />
              ))}
            </div>
          </div>

          {/* Sección Notas recientes para escritorio */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="font-replica text-lg font-medium text-foreground">
                {recentNotes.title}
              </h3>
              <Link
                to="/notas"
                aria-label={header.notesAria}
                title="Ver todas tus notas"
                className="w-9 h-9 rounded-full bg-surface border border-border/30 hover:bg-surface-sunken flex items-center justify-center text-voice transition-all duration-small active:scale-[0.97]"
              >
                <NotebookText size={18} strokeWidth={2} className="text-voice" />
              </Link>
            </div>

            {recentEntries.length === 0 ? (
              <div className="p-4 rounded-xl bg-surface-sunken border border-border/20 text-center">
                <p className="font-voice text-xs text-subtle">
                  {recentNotes.empty}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentEntries.map((entry) => {
                  const moodObj = PLAYGROUND_CONTENT.moods.find(
                    (m) => m.id === entry.mood
                  );

                  return (
                    <div
                      key={entry.id}
                      className="p-3.5 rounded-xl bg-surface-raised border border-border/30 hover:border-border/70 transition-colors space-y-1.5 shadow-xs"
                    >
                      <div className="flex items-center justify-between text-[11px] text-subtle">
                        <div className="flex items-center gap-1.5">
                          {moodObj && (
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: moodObj.colorVar }}
                            />
                          )}
                          <span className="font-medium text-foreground">
                            {moodObj?.name || entry.mood}
                          </span>
                          <span>·</span>
                          <span className="text-muted-foreground">#{entry.tag}</span>
                        </div>

                        <div className="flex items-center gap-1 text-subtle">
                          {entry.is_private && <Lock size={11} className="text-voice" />}
                          <span>
                            {new Intl.DateTimeFormat("es-ES", {
                              hour: "2-digit",
                              minute: "2-digit",
                            }).format(new Date(entry.created_at))}
                          </span>
                        </div>
                      </div>

                      <p className="font-voice text-xs text-foreground/90 line-clamp-2 leading-relaxed">
                        {entry.content}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Inicio;
