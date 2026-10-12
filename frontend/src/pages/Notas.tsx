import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Feather, NotebookText } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Enter } from "../components/motion/Motion";
import { NotesHeader } from "../features/notes/components/NotesHeader";
import { FilterBar } from "../features/notes/components/FilterBar";
import { DayReplyEntry, NoteCard } from "../features/notes/components/NoteCard";
import { applyFilters, filterValues, NO_FILTER, type NoteFilter } from "../features/notes/filters";
import { useFavoriteNoteIds } from "../features/notes/favorites";
import { repliesOfDay, useAllDayReplies } from "../features/journal/dayReplies";
import { noteDay, useNotes, wordCount } from "../features/journal/store";
import type { DayReply, Note } from "../features/journal/types";
import { recentSummary } from "../features/profile/metrics";
import { dayLabel, sameDay } from "../lib/format";
import { tutorials, useCancelToursOnLeave } from "../lib/tutorials";

type Group = { key: string; label: string; night: DayReply | null; late: DayReply | null; notes: Note[] };

// Las notas agrupadas por día. Con la lista completa (sin filtros ni búsqueda), la réplica de cada día
// va arriba de sus notas: es lo último que pasó ese día (app/(tabs)/notas/index.tsx).
function toGroups(notes: Note[], replies: Record<string, DayReply> | null): Group[] {
  const groups: Group[] = [];
  notes.forEach((note, i) => {
    if (i === 0 || !sameDay(notes[i - 1].createdAt, note.createdAt)) {
      const { night, late } = replies ? repliesOfDay(replies, noteDay(note)) : { night: null, late: null };
      groups.push({ key: noteDay(note), label: dayLabel(note.createdAt), night, late, notes: [] });
    }
    groups[groups.length - 1].notes.push(note);
  });
  return groups;
}

export const Notas: React.FC = () => {
  const notes = useNotes();
  const favoriteIds = useFavoriteNoteIds();
  const dayReplies = useAllDayReplies();
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [filter, setFilter] = useState<NoteFilter>(NO_FILTER);
  const filterRef = useRef<HTMLDivElement>(null);

  const values = useMemo(() => filterValues(notes), [notes]);
  const visible = useMemo(() => applyFilters(notes, filter, query, favoriteIds), [notes, filter, query, favoriteIds]);
  const filtered = filter.favorites || !!filter.mood || !!filter.tag;
  const narrowed = filtered || query.trim().length > 0;
  const groups = useMemo(() => toGroups(visible, narrowed ? null : dayReplies), [visible, narrowed, dayReplies]);
  const onlyFavorites = filter.favorites && !filter.mood && !filter.tag && !query.trim();
  const month = useMemo(() => recentSummary(notes, 30), [notes]);
  const monthWords = useMemo(() => {
    const since = new Date();
    since.setDate(since.getDate() - 29);
    since.setHours(0, 0, 0, 0);
    return notes.filter((n) => new Date(n.createdAt) >= since).reduce((sum, n) => sum + wordCount(n.text), 0);
  }, [notes]);

  // La primera vez: cómo encontrar tus notas.
  useCancelToursOnLeave(["notas"]);
  useEffect(() => {
    const t = setTimeout(
      () => tutorials.start("notas", [{ target: filterRef, text: "Encuentra tus notas: tus favoritas, o por ánimo y tema.", radius: 22 }]),
      700
    );
    return () => clearTimeout(t);
  }, []);

  if (notes.length === 0) {
    return (
      <div className="mx-auto max-w-[680px] space-y-8">
        <h1 className="font-replica text-[28px] font-normal leading-[34px] tracking-[-0.3px] text-foreground">Notas</h1>
        <div className="space-y-3 rounded-lg bg-surface-sunken px-8 py-12 text-center">
          <NotebookText size={28} className="mx-auto text-voice" aria-hidden="true" />
          <h2 className="font-replica text-xl font-medium text-foreground">Todavía no hay notas</h2>
          <p className="mx-auto max-w-sm text-[15px] leading-[21px] text-muted-foreground">
            Cada nota que escribas se va a tejer aquí, junto con su réplica.
          </p>
          <Link
            to="/"
            className="inline-flex h-11 items-center justify-center rounded-full bg-muted px-6 text-[15px] font-semibold text-foreground hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
          >
            Escribir la primera
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:grid lg:grid-cols-[1fr_300px] lg:items-start lg:gap-10">
      <div className="mx-auto min-w-0 max-w-[680px] space-y-3 lg:mx-0">
        <NotesHeader query={query} onQueryChange={setQuery} searching={searching} onSearchingChange={setSearching} />
        <FilterBar ref={filterRef} filter={filter} onChange={setFilter} moods={values.moods} tags={values.tags} />

        {groups.length === 0 ? (
          <div className="space-y-3 px-8 py-16 text-center" role="status">
            <h2 className="font-replica text-xl font-medium text-foreground">{onlyFavorites ? "Aún no hay favoritas" : "Nada coincide"}</h2>
            <p className="text-[15px] leading-[21px] text-muted-foreground">
              {onlyFavorites ? "Marca una nota como favorita para tenerla aquí." : "Prueba con otra palabra o quita el filtro."}
            </p>
            {filtered ? (
              <Button variant="secondary" size="sm" onClick={() => setFilter(NO_FILTER)}>
                Ver todas
              </Button>
            ) : null}
          </div>
        ) : (
          groups.map((group, i) => (
            <Enter key={group.key} index={Math.min(i, 6)}>
              <section aria-label={group.label} className="space-y-3">
                <h2 className="px-1 pb-0 pt-5 text-[13px] font-semibold uppercase tracking-[0.6px] text-muted-foreground">
                  {group.label}
                </h2>
                {group.night ? <DayReplyEntry night={group.night} late={group.late} /> : null}
                {group.notes.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </section>
            </Enter>
          ))
        )}
      </div>

      {/* Escritorio: tu mes en números (solo datos reales) y la hoja a un toque (DESIGN-WEB.md §4). */}
      <aside className="hidden lg:sticky lg:top-8 lg:block" aria-label="Tu mes">
        <div className="space-y-4 rounded-lg border border-border/40 bg-surface-raised p-5 shadow-raised dark:shadow-none">
          <p className="text-[12px] font-semibold uppercase tracking-[0.8px] text-muted-foreground">Últimos 30 días</p>
          <dl className="grid grid-cols-2 gap-3">
            <div>
              <dt className="text-xs text-muted-foreground">Notas</dt>
              <dd className="font-replica text-2xl text-foreground">{month.notes}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Palabras</dt>
              <dd className="font-replica text-2xl text-foreground">{monthWords.toLocaleString("es")}</dd>
            </div>
          </dl>
          <Link
            to="/"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-voice text-[15px] font-semibold text-voice-foreground hover:bg-voice/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised"
          >
            <Feather size={16} aria-hidden="true" />
            Escribir
          </Link>
        </div>
      </aside>
    </div>
  );
};

export default Notas;
