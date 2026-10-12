import React, { useState } from "react";
import { ChevronDown, Heart, SlidersHorizontal, X } from "lucide-react";
import { MOOD_LABELS, moodColor, type Mood } from "../../journal/moods";
import type { NoteFilter } from "../filters";

const scopeClass = (selected: boolean) =>
  `inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors duration-small focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice ${
    selected ? "border-voice bg-voice text-voice-foreground" : "border-border/70 text-muted-foreground hover:text-foreground"
  }`;

function OptionRow({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">{title}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

/**
 * Filtros de Notas en una fila (features/notes/components/filter-bar.tsx de la app): "Todas" o
 * "Favoritas" (sin número), y "Filtrar", que despliega ánimo y tema. Con el panel cerrado, lo que está
 * filtrando queda a la vista y se quita con un toque.
 */
export const FilterBar = React.forwardRef<
  HTMLDivElement,
  { filter: NoteFilter; onChange: (filter: NoteFilter) => void; moods: Mood[]; tags: string[] }
>(({ filter, onChange, moods, tags }, ref) => {
  const [open, setOpen] = useState(false);
  const panelId = React.useId();
  const active = (filter.mood ? 1 : 0) + (filter.tag ? 1 : 0);
  const hasOptions = moods.length > 0 || tags.length > 0;

  const optionClass = (selected: boolean) =>
    `inline-flex h-9 items-center gap-2 rounded-full border px-3 text-[13px] transition-colors duration-small focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice ${
      selected ? "text-foreground" : "border-transparent bg-surface text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div className="space-y-3">
      <div ref={ref} className="flex items-center gap-2">
        <div role="radiogroup" aria-label="Qué notas ver" className="flex flex-1 gap-2">
          <button
            type="button"
            role="radio"
            aria-checked={!filter.favorites}
            onClick={() => onChange({ ...filter, favorites: false })}
            className={scopeClass(!filter.favorites)}
          >
            Todas
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={filter.favorites}
            onClick={() => onChange({ ...filter, favorites: true })}
            className={scopeClass(filter.favorites)}
          >
            <Heart
              size={14}
              aria-hidden="true"
              className={filter.favorites ? "fill-voice-foreground text-voice-foreground" : "fill-emotion text-emotion"}
            />
            Favoritas
          </button>
        </div>

        {hasOptions ? (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={active ? `Filtros, ${active} activos` : "Filtrar por ánimo o tema"}
            className={`inline-flex h-9 items-center gap-1.5 rounded-full border pl-3 pr-2.5 text-sm transition-colors duration-small focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice ${
              active
                ? "border-voice/45 bg-voice/10 text-foreground"
                : open
                  ? "border-border/70 bg-surface text-muted-foreground"
                  : "border-border/70 text-muted-foreground hover:text-foreground"
            }`}
          >
            <SlidersHorizontal size={15} aria-hidden="true" className={active ? "text-voice" : undefined} />
            {active ? `Filtros · ${active}` : "Filtrar"}
            <ChevronDown
              size={14}
              aria-hidden="true"
              className={`text-subtle transition-transform duration-small ${open ? "rotate-180" : ""}`}
            />
          </button>
        ) : null}
      </div>

      {open ? (
        <div id={panelId} className="panel-in space-y-3">
          {moods.length ? (
            <OptionRow title="Ánimo">
              {moods.map((m) => {
                const selected = filter.mood === m;
                return (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onChange({ ...filter, mood: selected ? null : m })}
                    className={optionClass(selected)}
                    style={
                      selected
                        ? {
                            backgroundColor: `color-mix(in srgb, ${moodColor(m)} 14%, transparent)`,
                            borderColor: `color-mix(in srgb, ${moodColor(m)} 50%, transparent)`,
                          }
                        : undefined
                    }
                  >
                    <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ backgroundColor: moodColor(m) }} />
                    {MOOD_LABELS[m]}
                  </button>
                );
              })}
            </OptionRow>
          ) : null}
          {tags.length ? (
            <OptionRow title="Tema">
              {tags.map((t) => {
                const selected = filter.tag === t;
                return (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onChange({ ...filter, tag: selected ? null : t })}
                    className={`${optionClass(selected)} ${selected ? "border-voice/50 bg-voice/15" : ""}`}
                  >
                    #{t}
                  </button>
                );
              })}
            </OptionRow>
          ) : null}
        </div>
      ) : active ? (
        <div className="panel-in flex flex-wrap gap-2">
          {filter.mood ? (
            <button
              type="button"
              onClick={() => onChange({ ...filter, mood: null })}
              aria-label={`Quitar filtro ${MOOD_LABELS[filter.mood]}`}
              className="inline-flex h-9 items-center gap-1.5 rounded-full pl-3 pr-2 text-[13px] font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
              style={{ backgroundColor: `color-mix(in srgb, ${moodColor(filter.mood)} 14%, transparent)` }}
            >
              {MOOD_LABELS[filter.mood]}
              <X size={14} className="text-muted-foreground" aria-hidden="true" />
            </button>
          ) : null}
          {filter.tag ? (
            <button
              type="button"
              onClick={() => onChange({ ...filter, tag: null })}
              aria-label={`Quitar filtro #${filter.tag}`}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-voice/15 pl-3 pr-2 text-[13px] font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
            >
              #{filter.tag}
              <X size={14} className="text-muted-foreground" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
});
FilterBar.displayName = "FilterBar";
