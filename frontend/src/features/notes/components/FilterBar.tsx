import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Heart, X, Hash } from "lucide-react";
import { NOTAS_CONTENT } from "../../../data/notasContent";
import { PLAYGROUND_CONTENT } from "../../../data/playgroundContent";

interface FilterBarProps {
  favoritesOnly: boolean;
  onToggleFavorites: () => void;
  selectedMood: string | null;
  onSelectMood: (m: string | null) => void;
  selectedTag: string | null;
  onSelectTag: (t: string | null) => void;
  favoritesCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  favoritesOnly,
  onToggleFavorites,
  selectedMood,
  onSelectMood,
  selectedTag,
  onSelectTag,
  favoritesCount,
}) => {
  const [openDropdown, setOpenDropdown] = useState<"mood" | "tag" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { filters } = NOTAS_CONTENT;
  const moods = PLAYGROUND_CONTENT.moods;
  const tags = PLAYGROUND_CONTENT.themes;

  const hasActiveFilters = favoritesOnly || !!selectedMood || !!selectedTag;

  // Cerrar desplegable al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeMoodObj = moods.find((m) => m.id === selectedMood);

  const clearAllFilters = () => {
    if (favoritesOnly) onToggleFavorites();
    onSelectMood(null);
    onSelectTag(null);
    setOpenDropdown(null);
  };

  return (
    <div ref={containerRef} className="space-y-2 relative z-30 select-none">
      <div className="flex flex-wrap items-center gap-2">
        {/* Ámbito: Todas */}
        <button
          type="button"
          onClick={() => {
            if (favoritesOnly) onToggleFavorites();
          }}
          className={`h-8 px-3.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-small active:scale-[0.97] border ${
            !favoritesOnly
              ? "bg-voice text-voice-foreground border-voice font-semibold shadow-xs"
              : "bg-surface-raised hover:bg-surface text-muted-foreground border-border/40"
          }`}
        >
          {filters.all}
        </button>

        {/* Ámbito: Favoritas */}
        <button
          type="button"
          onClick={onToggleFavorites}
          className={`h-8 px-3.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-small active:scale-[0.97] border inline-flex items-center gap-1.5 ${
            favoritesOnly
              ? "bg-voice text-voice-foreground border-voice font-semibold shadow-xs"
              : "bg-surface-raised hover:bg-surface text-muted-foreground border-border/40"
          }`}
        >
          <Heart
            size={12}
            className={favoritesOnly ? "fill-voice-foreground" : "text-muted-foreground"}
          />
          <span>{filters.favorites}</span>
          {favoritesCount > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                favoritesOnly
                  ? "bg-voice-foreground/20 text-voice-foreground"
                  : "bg-surface-sunken text-subtle"
              }`}
            >
              {favoritesCount}
            </span>
          )}
        </button>

        {/* Filtro por Ánimo */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpenDropdown(openDropdown === "mood" ? null : "mood")
            }
            style={
              activeMoodObj
                ? {
                    backgroundColor: `color-mix(in srgb, ${activeMoodObj.colorVar} 14%, transparent)`,
                    borderColor: `color-mix(in srgb, ${activeMoodObj.colorVar} 45%, transparent)`,
                    color: "var(--foreground)",
                  }
                : {}
            }
            className={`h-8 px-3 rounded-full text-xs font-medium cursor-pointer transition-all duration-small active:scale-[0.97] border inline-flex items-center gap-1.5 ${
              activeMoodObj
                ? "font-semibold shadow-xs"
                : "bg-surface-raised hover:bg-surface text-muted-foreground border-border/40"
            }`}
          >
            {activeMoodObj ? (
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: activeMoodObj.colorVar }}
              />
            ) : null}
            <span>{activeMoodObj ? activeMoodObj.name : filters.moodTrigger}</span>
            <ChevronDown
              size={12}
              className={`text-subtle transition-transform duration-200 ${
                openDropdown === "mood" ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Menú de Ánimos */}
          {openDropdown === "mood" && (
            <div className="absolute left-0 top-full mt-1.5 w-44 p-1.5 rounded-xl bg-surface-raised border border-border/40 shadow-raised z-40 animate-section-enter space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  onSelectMood(null);
                  setOpenDropdown(null);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-surface hover:text-foreground transition-colors"
              >
                {filters.allMoods}
              </button>
              {moods.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    onSelectMood(m.id);
                    setOpenDropdown(null);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    selectedMood === m.id
                      ? "bg-voice-soft/30 text-foreground font-semibold"
                      : "text-muted-foreground hover:bg-surface hover:text-foreground"
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: m.colorVar }}
                  />
                  <span>{m.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filtro por Tema */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpenDropdown(openDropdown === "tag" ? null : "tag")
            }
            className={`h-8 px-3 rounded-full text-xs font-medium cursor-pointer transition-all duration-small active:scale-[0.97] border inline-flex items-center gap-1.5 ${
              selectedTag
                ? "bg-voice-soft/25 border-voice/40 text-foreground font-semibold shadow-xs"
                : "bg-surface-raised hover:bg-surface text-muted-foreground border-border/40"
            }`}
          >
            {selectedTag ? <Hash size={12} className="text-voice shrink-0" /> : null}
            <span>{selectedTag ? `#${selectedTag}` : filters.tagTrigger}</span>
            <ChevronDown
              size={12}
              className={`text-subtle transition-transform duration-200 ${
                openDropdown === "tag" ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Menú de Temas */}
          {openDropdown === "tag" && (
            <div className="absolute left-0 top-full mt-1.5 w-40 p-1.5 rounded-xl bg-surface-raised border border-border/40 shadow-raised z-40 animate-section-enter space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  onSelectTag(null);
                  setOpenDropdown(null);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-surface hover:text-foreground transition-colors"
              >
                {filters.allTags}
              </button>
              {tags.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    onSelectTag(t);
                    setOpenDropdown(null);
                  }}
                  className={`w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    selectedTag === t
                      ? "bg-voice-soft/30 text-foreground font-semibold"
                      : "text-muted-foreground hover:bg-surface hover:text-foreground"
                  }`}
                >
                  <Hash size={11} className="text-muted-foreground" />
                  <span>{t}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Botón Quitar filtros */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="h-8 px-2.5 rounded-full text-xs text-muted-foreground hover:text-foreground hover:bg-surface inline-flex items-center gap-1 transition-colors cursor-pointer"
          >
            <X size={12} />
            <span>{filters.clearAll}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
