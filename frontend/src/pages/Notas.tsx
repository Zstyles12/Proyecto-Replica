import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Feather, Heart, Lock, Sparkles, BookOpen } from "lucide-react";
import { journalService, type Entry, type DayReply } from "../services/journal";
import { NOTAS_CONTENT } from "../data/notasContent";
import { NotesHeader } from "../features/notes/components/NotesHeader";
import { FilterBar } from "../features/notes/components/FilterBar";
import { NoteCard } from "../features/notes/components/NoteCard";
import { DayReplyEntry } from "../features/notes/components/DayReplyEntry";
import { NoteDetailModal } from "../features/notes/components/NoteDetailModal";

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getDayKey(dateStr: string): string {
  return dateStr.slice(0, 10);
}

function formatDayLabel(dateStr: string): string {
  const noteDate = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (noteDate.toDateString() === today.toDateString()) {
    return "Hoy";
  }
  if (noteDate.toDateString() === yesterday.toDateString()) {
    return "Ayer";
  }

  const formatted = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(noteDate);

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export const Notas: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>(() =>
    journalService.getEntries()
  );
  const [query, setQuery] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Estados para modal de detalle
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [selectedDayReply, setSelectedDayReply] = useState<DayReply | null>(null);

  const { emptyStates, rail } = NOTAS_CONTENT;
  const dayRepliesMap = useMemo(() => journalService.getDayReplies(), []);

  // Recargar notas desde el servicio
  const refreshEntries = () => {
    setEntries(journalService.getEntries());
  };

  const handleToggleFavorite = (entryId: string) => {
    journalService.toggleFavorite(entryId);
    refreshEntries();
    if (selectedEntry && selectedEntry.id === entryId) {
      setSelectedEntry((prev) => (prev ? { ...prev, is_favorite: !prev.is_favorite } : null));
    }
  };

  const handleDeleteEntry = (entryId: string) => {
    journalService.deleteEntry(entryId);
    refreshEntries();
  };

  // Filtrado de notas
  const filteredEntries = useMemo(() => {
    const normQuery = normalizeText(query.trim());

    return entries.filter((entry) => {
      if (favoritesOnly && !entry.is_favorite) return false;
      if (selectedMood && entry.mood !== selectedMood) return false;
      if (selectedTag && entry.tag !== selectedTag) return false;

      if (normQuery) {
        const normContent = normalizeText(entry.content);
        const normTag = normalizeText(entry.tag);
        const normMood = normalizeText(entry.mood);
        if (
          !normContent.includes(normQuery) &&
          !normTag.includes(normQuery) &&
          !normMood.includes(normQuery)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [entries, query, favoritesOnly, selectedMood, selectedTag]);

  // Agrupación por días
  const groupedByDay = useMemo(() => {
    const groups: { dayKey: string; label: string; entries: Entry[] }[] = [];
    const seen = new Set<string>();

    filteredEntries.forEach((entry) => {
      const key = getDayKey(entry.created_at);
      if (!seen.has(key)) {
        seen.add(key);
        groups.push({
          dayKey: key,
          label: formatDayLabel(entry.created_at),
          entries: [],
        });
      }
      const g = groups.find((grp) => grp.dayKey === key);
      if (g) g.entries.push(entry);
    });

    return groups;
  }, [filteredEntries]);

  const favoritesCount = entries.filter((e) => e.is_favorite).length;
  const privateCount = entries.filter((e) => e.is_private).length;
  const isNarrowed = !!query.trim() || favoritesOnly || !!selectedMood || !!selectedTag;

  return (
    <div className="space-y-6 pb-12">
      {/* Modal de Detalle */}
      <NoteDetailModal
        entry={selectedEntry}
        reply={selectedEntry ? journalService.getReplyForEntry(selectedEntry.id) : null}
        dayReply={selectedDayReply}
        onClose={() => {
          setSelectedEntry(null);
          setSelectedDayReply(null);
        }}
        onToggleFavorite={handleToggleFavorite}
        onDelete={handleDeleteEntry}
      />

      {/* Cuadrícula editorial responsiva: 1 columna en móvil, 2 columnas en escritorio (>= 1024px) */}
      <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-8 lg:items-start space-y-6 lg:space-y-0">
        {/* Columna Principal / Feed de Notas */}
        <div className="min-w-0 space-y-6">
          {/* Cabecera y Buscador */}
          <NotesHeader query={query} onQueryChange={setQuery} />

          {/* Barra de Filtros */}
          <FilterBar
            favoritesOnly={favoritesOnly}
            onToggleFavorites={() => setFavoritesOnly(!favoritesOnly)}
            selectedMood={selectedMood}
            onSelectMood={setSelectedMood}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
            favoritesCount={favoritesCount}
          />

          {/* Estados vacíos */}
          {entries.length === 0 ? (
            <div className="p-8 rounded-3xl bg-surface-sunken border border-border/30 text-center space-y-4 my-8">
              <BookOpen size={28} className="mx-auto text-voice opacity-60" />
              <div className="space-y-1">
                <h3 className="font-replica text-xl text-foreground font-medium">
                  {emptyStates.noNotes.title}
                </h3>
                <p className="font-voice text-sm text-muted-foreground max-w-sm mx-auto">
                  {emptyStates.noNotes.description}
                </p>
              </div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-voice hover:bg-voice-hover text-voice-foreground text-xs font-semibold shadow-xs transition-transform active:scale-[0.97]"
              >
                <Feather size={14} />
                <span>{emptyStates.noNotes.action}</span>
              </Link>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="p-8 rounded-3xl bg-surface-sunken border border-border/30 text-center space-y-3 my-8 animate-section-enter">
              <h3 className="font-replica text-xl text-foreground font-medium">
                {favoritesOnly ? emptyStates.noFavorites.title : emptyStates.noMatch.title}
              </h3>
              <p className="font-voice text-sm text-muted-foreground max-w-sm mx-auto">
                {favoritesOnly
                  ? emptyStates.noFavorites.description
                  : emptyStates.noMatch.description}
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setFavoritesOnly(false);
                  setSelectedMood(null);
                  setSelectedTag(null);
                }}
                className="px-4 py-2 rounded-full bg-surface hover:bg-surface-raised border border-border/40 text-xs font-semibold text-foreground transition-colors cursor-pointer"
              >
                {emptyStates.noMatch.action}
              </button>
            </div>
          ) : (
            /* Lista agrupada por día */
            <div className="space-y-7">
              {groupedByDay.map((group) => {
                // Si no se está filtrando/buscando, mostrar la Réplica del Día arriba del día
                const dayReply = !isNarrowed ? dayRepliesMap[group.dayKey] : null;

                return (
                  <section key={group.dayKey} className="space-y-3">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-subtle px-1">
                      {group.label}
                    </h2>

                    {/* Réplica del día (si existe para ese día) */}
                    {dayReply && (
                      <DayReplyEntry
                        dayReply={dayReply}
                        onOpenDetails={() => {
                          setSelectedDayReply(dayReply);
                          setSelectedEntry(null);
                        }}
                      />
                    )}

                    {/* Tarjetas de notas del día */}
                    <div className="space-y-3">
                      {group.entries.map((entry) => (
                        <NoteCard
                          key={entry.id}
                          entry={entry}
                          reply={journalService.getReplyForEntry(entry.id)}
                          onToggleFavorite={handleToggleFavorite}
                          onOpenDetail={(ent) => {
                            setSelectedEntry(ent);
                            setSelectedDayReply(null);
                          }}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>

        {/* Columna Lateral para Escritorio (>= 1024px) */}
        <aside className="hidden lg:flex lg:flex-col lg:space-y-6 lg:sticky lg:top-8 select-none">
          {/* Tarjeta de Resumen del Diario */}
          <div className="p-5 rounded-2xl bg-surface-raised border border-border/40 shadow-raised space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-voice tracking-wide uppercase flex items-center gap-1.5">
                <Sparkles size={14} className="text-voice" />
                {rail.summaryTitle}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-border/20">
              <div className="p-2 rounded-xl bg-surface border border-border/30">
                <span className="font-replica text-xl font-medium text-foreground block">
                  {entries.length}
                </span>
                <span className="text-[10px] text-muted-foreground block truncate">
                  {rail.totalNotesLabel}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-surface border border-border/30">
                <span className="font-replica text-xl font-medium text-emotion block">
                  {favoritesCount}
                </span>
                <span className="text-[10px] text-muted-foreground block truncate">
                  {rail.favoritesLabel}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-surface border border-border/30">
                <span className="font-replica text-xl font-medium text-voice block">
                  {privateCount}
                </span>
                <span className="text-[10px] text-muted-foreground block truncate">
                  Privadas
                </span>
              </div>
            </div>

            <Link
              to="/"
              className="w-full py-2.5 rounded-full bg-voice hover:bg-voice-hover text-voice-foreground text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.97]"
            >
              <Feather size={14} />
              <span>Escribir en la hoja</span>
            </Link>
          </div>

          {/* Filtros rápidos y privacidad */}
          <div className="p-5 rounded-2xl bg-surface-raised border border-border/40 shadow-raised space-y-3">
            <span className="text-xs font-semibold text-subtle uppercase tracking-wider block">
              {rail.quickFiltersTitle}
            </span>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setFavoritesOnly(!favoritesOnly)}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs transition-colors cursor-pointer border ${
                  favoritesOnly
                    ? "bg-voice-soft/30 border-voice/50 text-foreground font-semibold"
                    : "bg-surface hover:bg-surface-sunken border-border/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Heart size={13} className="text-emotion" />
                  <span>{rail.onlyFavoritesBtn}</span>
                </div>
                <span className="text-[11px] font-mono">{favoritesCount}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedTag(selectedTag === "Yo" ? null : "Yo");
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs transition-colors cursor-pointer border ${
                  selectedTag === "Yo"
                    ? "bg-voice-soft/30 border-voice/50 text-foreground font-semibold"
                    : "bg-surface hover:bg-surface-sunken border-border/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Lock size={13} className="text-voice" />
                  <span>{rail.onlyPrivateBtn}</span>
                </div>
                <span className="text-[11px] font-mono">{privateCount}</span>
              </button>
            </div>

            <p className="text-[11px] text-subtle leading-relaxed pt-2 border-t border-border/20">
              {rail.privateExplanation}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Notas;
