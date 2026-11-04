import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Hash } from "lucide-react";
import { MOOD_LABELS, MOODS, SUGGESTED_TAGS, moodColor, type Mood } from "../moods";

type Panel = "mood" | "tag" | null;

interface ContextPillsProps {
  mood: Mood | null;
  onMoodChange: (mood: Mood | null) => void;
  tag: string | null;
  onTagChange: (tag: string | null) => void;
  // Sube cada vez que se pide la réplica sin haber elegido los dos: abre el que falta y pregunta.
  askToken?: number;
  // Para qué se piden: la réplica al momento o solo guardar.
  purpose?: "reply" | "save";
  tourRef?: React.Ref<HTMLDivElement>;
}

// Al elegir uno se abre el otro, un instante después (260 ms), para que se vea lo elegido.
const ADVANCE_MS = 260;

/**
 * Cómo te sientes y sobre qué escribes: dos pastillas encima de la hoja
 * (features/journal/components/context-bar.tsx de la app). Las dos son necesarias para guardar. Si
 * falta alguna, Replica la pregunta con su voz (malva, itálica), nunca como error.
 */
export const ContextPills: React.FC<ContextPillsProps> = ({
  mood,
  onMoodChange,
  tag,
  onTagChange,
  askToken = 0,
  purpose = "reply",
  tourRef,
}) => {
  const [panel, setPanel] = useState<Panel>(null);
  const [pulse, setPulse] = useState({ mood: 0, tag: 0 });
  // Si al pedir faltaba el ánimo, la segunda pregunta es "¿Y sobre qué es?".
  const [askedMood, setAskedMood] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelId = React.useId();

  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  useEffect(() => cancel, []);

  const missing: Panel = !mood ? "mood" : !tag ? "tag" : null;

  // Cuando se pide la réplica sin los dos: se abre lo que falta y esa pastilla late.
  const [lastAsk, setLastAsk] = useState(askToken);
  if (askToken !== lastAsk) {
    setLastAsk(askToken);
    if (askToken) {
      setPanel(missing);
      setAskedMood(!mood);
      setPulse((p) => ({ mood: !mood ? askToken : p.mood, tag: !tag ? askToken : p.tag }));
    }
  }

  const showHint = askToken > 0 && missing !== null;
  const before = purpose === "reply" ? "Antes de responderte" : "Antes de guardarla";
  const question =
    missing === "mood" ? `${before}, ¿cómo te sientes?` : askedMood ? "¿Y sobre qué es?" : `${before}, ¿sobre qué es?`;

  const toggle = (target: Exclude<Panel, null>) => {
    cancel();
    setPanel((p) => (p === target ? null : target));
  };

  const advance = (next: Panel) => {
    cancel();
    timer.current = setTimeout(() => setPanel(next), ADVANCE_MS);
  };

  const pillClass = (active: boolean, open: boolean) =>
    `relative tap-area inline-flex h-9 items-center gap-2 rounded-full border pl-3 pr-2.5 text-[13px] transition-all duration-small ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice ${
      active ? "font-medium text-foreground" : open ? "bg-surface text-foreground" : "text-muted-foreground hover:text-foreground"
    }`;

  const tint = mood ? moodColor(mood) : null;

  return (
    <div className="space-y-2.5">
      <div ref={tourRef} className="flex flex-wrap gap-2">
        <button
          key={`mood-${pulse.mood}`}
          type="button"
          onClick={() => toggle("mood")}
          aria-expanded={panel === "mood"}
          aria-controls={panelId}
          aria-label={mood ? `Cómo te sientes: ${MOOD_LABELS[mood]}` : "Elige cómo te sientes"}
          className={`${pillClass(!!mood, panel === "mood")} ${pulse.mood ? "pill-pulse" : ""}`}
          style={
            tint
              ? {
                  backgroundColor: `color-mix(in srgb, ${tint} 13%, transparent)`,
                  borderColor: `color-mix(in srgb, ${tint} 40%, transparent)`,
                }
              : { borderColor: "color-mix(in srgb, var(--border) 70%, transparent)" }
          }
        >
          <span
            aria-hidden="true"
            className="flex h-3.5 w-3.5 items-center justify-center rounded-full border-[1.5px]"
            style={{ borderColor: tint ?? "var(--subtle)" }}
          >
            {tint ? <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tint }} /> : null}
          </span>
          <span>{mood ? MOOD_LABELS[mood] : "¿Cómo te sientes?"}</span>
          <ChevronDown
            size={14}
            aria-hidden="true"
            className={`text-subtle transition-transform duration-small ease-out ${panel === "mood" ? "rotate-180" : ""}`}
          />
        </button>

        <button
          key={`tag-${pulse.tag}`}
          type="button"
          onClick={() => toggle("tag")}
          aria-expanded={panel === "tag"}
          aria-controls={panelId}
          aria-label={tag ? `Sobre qué escribes: ${tag}` : "Elige sobre qué escribes"}
          className={`${pillClass(!!tag, panel === "tag")} ${pulse.tag ? "pill-pulse" : ""}`}
          style={
            tag
              ? {
                  backgroundColor: "color-mix(in srgb, var(--voice) 13%, transparent)",
                  borderColor: "color-mix(in srgb, var(--voice) 40%, transparent)",
                }
              : { borderColor: "color-mix(in srgb, var(--border) 70%, transparent)" }
          }
        >
          <Hash size={13} aria-hidden="true" className={tag ? "text-voice" : "text-subtle"} />
          <span>{tag ?? "¿Sobre qué?"}</span>
          <ChevronDown
            size={14}
            aria-hidden="true"
            className={`text-subtle transition-transform duration-small ease-out ${panel === "tag" ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {showHint ? (
        <p key={question} className="enter font-replica text-[17px] italic leading-6 text-reply" aria-live="polite">
          {question}
        </p>
      ) : null}

      {panel === "mood" ? (
        <div id={panelId} role="radiogroup" aria-label="Cómo te sientes" className="panel-in flex flex-wrap gap-2 py-1">
          {MOODS.map((m) => {
            const selected = mood === m;
            return (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => {
                  const next = selected ? null : m;
                  onMoodChange(next);
                  // Quitarlo deja el panel abierto: hace falta elegir uno.
                  if (next) advance(tag ? null : "tag");
                }}
                className={`relative tap-area inline-flex h-9 items-center gap-2 rounded-full border pl-2.5 pr-3.5 text-[13px] transition-all duration-small ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice ${
                  selected ? "font-medium text-foreground" : "bg-surface text-muted-foreground hover:text-foreground"
                }`}
                style={{
                  backgroundColor: selected ? `color-mix(in srgb, ${moodColor(m)} 16%, transparent)` : undefined,
                  borderColor: selected
                    ? `color-mix(in srgb, ${moodColor(m)} 55%, transparent)`
                    : "color-mix(in srgb, var(--border) 50%, transparent)",
                }}
              >
                <span
                  aria-hidden="true"
                  className="flex h-3.5 w-3.5 items-center justify-center rounded-full border-[1.5px]"
                  style={{ borderColor: moodColor(m) }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full transition-transform duration-small"
                    style={{ backgroundColor: moodColor(m), transform: selected ? "scale(1)" : "scale(0.4)", opacity: selected ? 1 : 0.45 }}
                  />
                </span>
                {MOOD_LABELS[m]}
              </button>
            );
          })}
        </div>
      ) : null}

      {panel === "tag" ? (
        <div id={panelId} role="radiogroup" aria-label="Sobre qué escribes" className="panel-in flex flex-wrap gap-2 py-1">
          {SUGGESTED_TAGS.map((t) => {
            const selected = tag === t;
            return (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => {
                  const next = selected ? null : t;
                  onTagChange(next);
                  if (next) advance(mood ? null : "mood");
                }}
                className={`relative tap-area inline-flex h-9 items-center rounded-full border px-3.5 text-[13px] transition-all duration-small ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice ${
                  selected
                    ? "border-voice/50 bg-voice/10 font-medium text-voice"
                    : "border-border/70 text-muted-foreground hover:border-border hover:text-foreground"
                }`}
              >
                #{t}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};
