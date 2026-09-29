import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Hash } from "lucide-react";
import { INICIO_CONTENT } from "../../../data/inicioContent";
import { PLAYGROUND_CONTENT } from "../../../data/playgroundContent";

interface ContextPillsProps {
  selectedMood: string | null;
  selectedTag: string | null;
  onSelectMood: (mood: string | null) => void;
  onSelectTag: (tag: string | null) => void;
}

/**
 * Pastillas de contexto "¿Cómo te sientes?" y "¿Sobre qué?":
 * - Fidelidad 1:1 con la app móvil (zairo-main/features/journal/components/context-bar.tsx).
 * - Chevron con rotación suave de 180° al abrir/cerrar (duración 200 ms, ease-out).
 * - Paneles desplegables en línea (no popups abruptos) con animación colapsable fluida.
 * - Auto-avance inteligente de 260 ms: al elegir ánimo, si falta tema, avanza al tema; si ambos están listos, se pliega.
 * - Tintes sutiles según DESIGN.md: 13% de fondo y 40% de borde al estar activo.
 */
export const ContextPills: React.FC<ContextPillsProps> = ({
  selectedMood,
  selectedTag,
  onSelectMood,
  onSelectTag,
}) => {
  const [openMenu, setOpenMenu] = useState<"mood" | "tag" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const moods = PLAYGROUND_CONTENT.moods;
  const themes = PLAYGROUND_CONTENT.themes;
  const { contextPills } = INICIO_CONTENT;

  const cancelTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => cancelTimer();
  }, []);

  // Cerrar al hacer clic fuera del componente
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        cancelTimer();
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const toggleMenu = (target: "mood" | "tag") => {
    cancelTimer();
    setOpenMenu((prev) => (prev === target ? null : target));
  };

  const handleSelectMood = (moodId: string) => {
    cancelTimer();
    const nextMood = selectedMood === moodId ? null : moodId;
    onSelectMood(nextMood);
    if (nextMood) {
      // Auto-avance: si falta el tema, avanza al tema; si ambos están listos, se pliega (260 ms)
      closeTimerRef.current = setTimeout(() => {
        setOpenMenu(selectedTag ? null : "tag");
      }, 260);
    }
  };

  const handleSelectTag = (tag: string) => {
    cancelTimer();
    const nextTag = selectedTag === tag ? null : tag;
    onSelectTag(nextTag);
    if (nextTag) {
      // Auto-avance: si falta el ánimo, avanza al ánimo; si ambos están listos, se pliega (260 ms)
      closeTimerRef.current = setTimeout(() => {
        setOpenMenu(selectedMood ? null : "mood");
      }, 260);
    }
  };

  const currentMoodObj = moods.find((m) => m.id === selectedMood);

  return (
    <div ref={containerRef} className="space-y-3 z-20">
      {/* Fila principal de pastillas */}
      <div className="flex flex-wrap items-center gap-2">
        {/* 1. Pastilla "¿Cómo te sientes?" */}
        <button
          type="button"
          aria-label={contextPills.moodAria}
          aria-expanded={openMenu === "mood"}
          onClick={() => toggleMenu("mood")}
          style={{
            backgroundColor: currentMoodObj
              ? `color-mix(in srgb, ${currentMoodObj.colorVar} 13%, transparent)`
              : openMenu === "mood"
              ? "var(--surface)"
              : "transparent",
            borderColor: currentMoodObj
              ? `color-mix(in srgb, ${currentMoodObj.colorVar} 40%, transparent)`
              : "color-mix(in srgb, var(--border) 70%, transparent)",
          }}
          className={`inline-flex items-center gap-2 h-8 pl-2.5 pr-2 rounded-full text-[13px] font-normal cursor-pointer border select-none transition-all duration-200 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice ${
            currentMoodObj
              ? "text-foreground font-medium shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {/* Aro del color del ánimo con punto central */}
          <span
            className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 border-[1.5px] transition-colors"
            style={{
              borderColor: currentMoodObj
                ? currentMoodObj.colorVar
                : "color-mix(in srgb, var(--border) 90%, transparent)",
            }}
          >
            {currentMoodObj && (
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: currentMoodObj.colorVar }}
              />
            )}
          </span>
          <span className="truncate">
            {currentMoodObj ? currentMoodObj.name : contextPills.moodDefaultLabel}
          </span>
          <ChevronDown
            size={14}
            className="text-subtle shrink-0 transition-transform duration-200 ease-out"
            style={{
              transform: openMenu === "mood" ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </button>

        {/* 2. Pastilla "¿Sobre qué?" */}
        <button
          type="button"
          aria-label={contextPills.tagAria}
          aria-expanded={openMenu === "tag"}
          onClick={() => toggleMenu("tag")}
          style={{
            backgroundColor: selectedTag
              ? "color-mix(in srgb, var(--voice) 13%, transparent)"
              : openMenu === "tag"
              ? "var(--surface)"
              : "transparent",
            borderColor: selectedTag
              ? "color-mix(in srgb, var(--voice) 40%, transparent)"
              : "color-mix(in srgb, var(--border) 70%, transparent)",
          }}
          className={`inline-flex items-center gap-1.5 h-8 pl-2.5 pr-2 rounded-full text-[13px] font-normal cursor-pointer border select-none transition-all duration-200 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice ${
            selectedTag
              ? "text-foreground font-medium shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Hash
            size={13}
            className="shrink-0 transition-colors"
            style={{ color: selectedTag ? "var(--voice)" : "var(--subtle)" }}
          />
          <span className="truncate">
            {selectedTag ? `#${selectedTag}` : contextPills.tagDefaultLabel}
          </span>
          <ChevronDown
            size={14}
            className="text-subtle shrink-0 transition-transform duration-200 ease-out"
            style={{
              transform: openMenu === "tag" ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </button>
      </div>

      {/* Panel desplegable en línea fluido con animación CSS de cuadrícula */}
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
          openMenu !== null
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0 pointer-events-none"
        }`}
      >
        <div className="overflow-hidden">
          {/* Selector de Ánimos (MoodPicker) */}
          {openMenu === "mood" && (
            <div
              role="radiogroup"
              aria-label="Elige tu ánimo"
              className="flex flex-wrap items-center gap-2 py-1"
            >
              {moods.map((m) => {
                const isSelected = selectedMood === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleSelectMood(m.id)}
                    style={{
                      backgroundColor: isSelected
                        ? `color-mix(in srgb, ${m.colorVar} 16%, transparent)`
                        : "var(--surface)",
                      borderColor: isSelected
                        ? `color-mix(in srgb, ${m.colorVar} 55%, transparent)`
                        : "color-mix(in srgb, var(--border) 50%, transparent)",
                    }}
                    className={`h-9 inline-flex items-center gap-2 rounded-full pl-2.5 pr-3.5 border text-[13px] transition-all duration-200 ease-out active:scale-[0.97] cursor-pointer ${
                      isSelected
                        ? "font-medium text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:border-border"
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 border-[1.5px]"
                      style={{ borderColor: m.colorVar }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full transition-transform duration-200"
                        style={{
                          backgroundColor: m.colorVar,
                          transform: isSelected ? "scale(1)" : "scale(0.4)",
                          opacity: isSelected ? 1 : 0.45,
                        }}
                      />
                    </span>
                    <span>{m.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Selector de Temas (TagPicker) */}
          {openMenu === "tag" && (
            <div
              role="radiogroup"
              aria-label="Elige el tema sobre el que escribes"
              className="flex flex-wrap items-center gap-2 py-1"
            >
              {themes.map((t) => {
                const isSelected = selectedTag === t;
                return (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleSelectTag(t)}
                    style={{
                      backgroundColor: isSelected
                        ? "color-mix(in srgb, var(--voice) 12%, transparent)"
                        : "transparent",
                      borderColor: isSelected
                        ? "color-mix(in srgb, var(--voice) 50%, transparent)"
                        : "color-mix(in srgb, var(--border) 70%, transparent)",
                      color: isSelected ? "var(--voice)" : "var(--muted-foreground)",
                    }}
                    className={`h-8 inline-flex items-center justify-center rounded-full px-3 text-[13px] border transition-all duration-200 ease-out active:scale-[0.97] cursor-pointer ${
                      isSelected
                        ? "font-medium shadow-xs"
                        : "hover:text-foreground hover:border-border"
                    }`}
                  >
                    #{t}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
